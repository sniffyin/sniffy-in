/*
  # Session discounts — flat ₹ or percentage, off the booking amount

  Lets a coordinator apply a discount (flat ₹ or % of the package+add-ons
  total) to a session. Adds:
    - discount_type  ('flat' | 'percent', nullable — no discount by default)
    - discount_value (numeric, the ₹ or % the coordinator entered)
    - discount_amount — generated column, the ₹ actually knocked off

  The discount comes out of Sniffy's own margin: `booking_amount`,
  `platform_commission` and `groomer_commission` are left untouched, so
  vendor commission math still runs on the gross package price exactly
  as before. Only the money that's actually collected/kept is reduced:
  `total_collected` and `net_booking_amount` are redefined to net out
  the discount, so the groomer's collection screen, revenue tiles, and
  reconciliation all pick it up automatically with no per-call-site
  changes.

  ## The discount formula lives in one function, not three copies
  Postgres generated columns can't reference *another* generated
  column (confirmed live: 42P17 "cannot use generated column
  discount_amount in column generation expression"). `discount_amount`,
  `total_collected`, and `net_booking_amount` all need the same
  flat/percent math, so instead of inlining it three times (and risking
  the copies drifting), it's a single IMMUTABLE SQL function
  (`gs_discount_amount`) that all three generated-column expressions
  call with the same three plain-column inputs.

  ## Backward compatibility
  - `discount_type`/`discount_value` are nullable/defaulted to "no
    discount" — every existing row computes `discount_amount = 0`, so
    `total_collected` and `net_booking_amount` are numerically unchanged
    for every session booked before this migration.
  - `total_collected`'s new expression matches its known formula from
    20260506000000_groomer_session_milestones.sql
    (`booking_amount + upsell_amount + tip_amount`) with the discount
    subtracted from the booking-amount side only — tips/upsells are
    never discounted.
  - `net_booking_amount` predates the migrations folder, so instead of
    hardcoding a guessed formula, this migration reads its CURRENT live
    expression straight from the Postgres catalog (`pg_get_expr`) and
    wraps it with `- gs_discount_amount(...)`. It cannot drift from
    whatever this column actually computes today, and aborts loudly
    instead of silently no-op'ing if it ever isn't a generated column.
  - The whole file runs as one transaction (BEGIN/COMMIT below): if
    anything below fails, EVERYTHING in this migration rolls back — no
    half-applied state to clean up. Confirmed live: `admin_dashboard_kpis`
    depends on net_booking_amount, so a plain DROP COLUMN was rejected —
    the net_booking_amount block now finds every dependent view, and
    its grants, and puts both back verbatim after the column swap.
*/

BEGIN;

-- ─── discount_type / discount_value ────────────────────────────

ALTER TABLE public.grooming_sessions
  ADD COLUMN IF NOT EXISTS discount_type  text,
  ADD COLUMN IF NOT EXISTS discount_value numeric(10,2) NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gs_discount_type_check'
  ) THEN
    ALTER TABLE public.grooming_sessions
      ADD CONSTRAINT gs_discount_type_check
      CHECK (discount_type IS NULL OR discount_type IN ('flat', 'percent'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gs_discount_value_check'
  ) THEN
    ALTER TABLE public.grooming_sessions
      ADD CONSTRAINT gs_discount_value_check
      CHECK (discount_value >= 0 AND (discount_type <> 'percent' OR discount_value <= 100));
  END IF;
END $$;

-- ─── the one shared discount formula ────────────────────────────
-- IMMUTABLE + plain-column inputs only, so it's legal inside a
-- generated column's expression (unlike referencing discount_amount
-- itself, which is generated).

CREATE OR REPLACE FUNCTION public.gs_discount_amount(
  p_discount_type  text,
  p_discount_value numeric,
  p_booking_amount numeric
) RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_discount_type
    WHEN 'flat'    THEN LEAST(p_discount_value, COALESCE(p_booking_amount, 0))
    WHEN 'percent' THEN ROUND(COALESCE(p_booking_amount, 0) * LEAST(p_discount_value, 100) / 100, 2)
    ELSE 0
  END;
$$;

-- ─── discount_amount — the ₹ actually knocked off ──────────────

ALTER TABLE public.grooming_sessions
  ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2)
    GENERATED ALWAYS AS (
      public.gs_discount_amount(discount_type, discount_value, booking_amount)
    ) STORED;

-- ─── total_collected — net out the discount ────────────────────
-- Generated columns can't have their expression altered in place;
-- drop + re-add is the only way, and is safe here since the column is
-- purely derived (STORED, recomputed for every row on re-add).

ALTER TABLE public.grooming_sessions DROP COLUMN IF EXISTS total_collected;
ALTER TABLE public.grooming_sessions
  ADD COLUMN total_collected numeric(10,2)
    GENERATED ALWAYS AS (
      COALESCE(booking_amount, 0)
        - public.gs_discount_amount(discount_type, discount_value, booking_amount)
        + COALESCE(upsell_amount, 0) + COALESCE(tip_amount, 0)
    ) STORED;

-- ─── net_booking_amount — net out the discount, formula read live ──
-- Confirmed live: `admin_dashboard_kpis` depends on this column, so a
-- plain DROP COLUMN is rejected (42P01/2BP01). Rather than hardcode a
-- fix for just that one view, this generically finds EVERY view that
-- depends on net_booking_amount, captures each one's exact definition
-- AND its grants (dashboards here query as the `anon` role — losing a
-- grant on recreate would silently break a view even though the
-- migration "succeeds"), drops them, swaps the column, then recreates
-- both the view and its grants verbatim.

DO $$
DECLARE
  old_expr text;
  r record;
BEGIN
  CREATE TEMP TABLE _gs_dep_views  (schema_name text, view_name text, view_def text) ON COMMIT DROP;
  CREATE TEMP TABLE _gs_dep_grants (schema_name text, view_name text, grantee text, privilege_type text) ON COMMIT DROP;

  INSERT INTO _gs_dep_views (schema_name, view_name, view_def)
  SELECT DISTINCT dependent_ns.nspname, dependent_view.relname,
         pg_get_viewdef(dependent_view.oid, true)
  FROM pg_depend
  JOIN pg_rewrite   ON pg_depend.objid = pg_rewrite.oid
  JOIN pg_class     AS dependent_view ON pg_rewrite.ev_class = dependent_view.oid
  JOIN pg_namespace AS dependent_ns   ON dependent_ns.oid = dependent_view.relnamespace
  JOIN pg_class     AS source_table   ON pg_depend.refobjid = source_table.oid
  JOIN pg_attribute ON pg_depend.refobjid = pg_attribute.attrelid
                    AND pg_depend.refobjsubid = pg_attribute.attnum
  WHERE source_table.relname = 'grooming_sessions'
    AND pg_attribute.attname = 'net_booking_amount'
    AND dependent_view.relkind = 'v';

  INSERT INTO _gs_dep_grants (schema_name, view_name, grantee, privilege_type)
  SELECT DISTINCT v.schema_name, v.view_name, g.grantee, g.privilege_type
  FROM _gs_dep_views v
  JOIN information_schema.table_privileges g
    ON g.table_schema = v.schema_name AND g.table_name = v.view_name;

  FOR r IN SELECT * FROM _gs_dep_views LOOP
    EXECUTE format('DROP VIEW %I.%I', r.schema_name, r.view_name);
  END LOOP;

  SELECT pg_get_expr(d.adbin, d.adrelid)
  INTO old_expr
  FROM pg_attribute a
  JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
  WHERE a.attrelid = 'public.grooming_sessions'::regclass
    AND a.attname = 'net_booking_amount';

  IF old_expr IS NULL THEN
    RAISE EXCEPTION
      'net_booking_amount is not a generated column on grooming_sessions — aborting rather than guessing its formula. Discount columns above were still added.';
  END IF;

  EXECUTE 'ALTER TABLE public.grooming_sessions DROP COLUMN net_booking_amount';
  EXECUTE format(
    'ALTER TABLE public.grooming_sessions ADD COLUMN net_booking_amount numeric(10,2) GENERATED ALWAYS AS ((%s) - public.gs_discount_amount(discount_type, discount_value, booking_amount)) STORED',
    old_expr
  );

  FOR r IN SELECT * FROM _gs_dep_views LOOP
    EXECUTE format('CREATE VIEW %I.%I AS %s', r.schema_name, r.view_name, r.view_def);
  END LOOP;

  FOR r IN SELECT * FROM _gs_dep_grants LOOP
    IF r.grantee = 'PUBLIC' THEN
      EXECUTE format('GRANT %s ON %I.%I TO PUBLIC', r.privilege_type, r.schema_name, r.view_name);
    ELSE
      EXECUTE format('GRANT %s ON %I.%I TO %I', r.privilege_type, r.schema_name, r.view_name, r.grantee);
    END IF;
  END LOOP;
END $$;

COMMIT;
