/*
  20260815000000_add_grooming_done_status.sql

  Adds 'grooming_done' to the allowed values of grooming_sessions.status.

  WHY
  ---
  `completed` is the terminal, money-reconciled state.  Until now the only
  state below it was `groomer_assigned`, so a session whose grooming was
  physically finished but whose payment was still outstanding (vendor not
  settled / cash still with the groomer) had to sit at `groomer_assigned`.
  That made every "upcoming" count in the app — which is written as
  `status IN ('scheduled','groomer_assigned')` with no date test — keep
  counting finished past sessions as upcoming.

  `grooming_done` is the intermediate state:  work done, money not settled.
  Ordering:  lead → scheduled → groomer_assigned → grooming_done → completed
             (or → cancelled at any point).

  WHY A STANDALONE MIGRATION
  --------------------------
  `grooming_sessions` predates the migrations folder, so its CHECK
  constraints live on the baseline table and are not in any migration file
  (see CLAUDE.md landmine #10).  Adding a value to the TS `SessionStatus`
  union without widening the CHECK is exactly what broke 'global_pet' —
  every INSERT/UPDATE carrying the new value failed with 23514.

  SAFETY / NON-DESTRUCTIVE NOTES  (this runs against live data)
  -------------------------------------------------------------
  1. The constraint is located by *column*, not by guessed name.  A CHECK
     whose only referenced column is `status` is the one we replace.  This
     matters both ways round: if the baseline named it something other
     than `grooming_sessions_status_check`, a blind
     `DROP CONSTRAINT IF EXISTS <guessed name>` would be a no-op and the
     real constraint would still reject 'grooming_done'.  Matching on
     conkey also guarantees we never touch the neighbouring
     `gs_arrival_bonus_status_check` / `gs_review_claim_status_check`,
     which constrain *different* columns.
  2. The new allow-list is (canonical six) ∪ (every DISTINCT status value
     actually present in the table today).  So the ADD CONSTRAINT is
     guaranteed to validate against existing rows — it can only ever widen
     what is permitted, never invalidate a row that is already stored.
     Any unexpected legacy value is reported via RAISE NOTICE so it is
     visible in the push output rather than silently absorbed.
  3. Nothing else is touched: no data is written, no column is altered, no
     default or NOT NULL is changed.
  4. Idempotent — re-running finds the constraint it wrote last time and
     rewrites the identical definition.
  5. Atomic — supabase db push wraps each migration file in a transaction,
     so a failure at any point leaves the original constraint in place.
*/

DO $$
DECLARE
  -- Canonical set after this migration.  Keep in sync with the
  -- `SessionStatus` union in src/pages/admin/types.ts.
  v_allowed  text[] := array[
    'lead',
    'scheduled',
    'groomer_assigned',
    'grooming_done',
    'completed',
    'cancelled'
  ];
  v_legacy   text[];
  v_conname  text;
BEGIN
  -- ── 1. Absorb any status value already present in live data ────────
  --
  -- Purely defensive: if some historical row carries a value outside the
  -- canonical six, keeping it in the allow-list is what makes the
  -- re-validation safe.  Dropping it would abort the migration (best
  -- case) or block future updates to that row (worse).
  SELECT coalesce(array_agg(DISTINCT s.status), '{}'::text[])
    INTO v_legacy
    FROM public.grooming_sessions s
   WHERE s.status IS NOT NULL
     AND s.status <> ALL (v_allowed);

  IF coalesce(array_length(v_legacy, 1), 0) > 0 THEN
    RAISE NOTICE
      'grooming_sessions.status: preserving % unexpected legacy value(s) in the CHECK allow-list: %',
      array_length(v_legacy, 1), v_legacy;
    v_allowed := v_allowed || v_legacy;
  END IF;

  -- ── 2. Drop every existing single-column CHECK on `status` ─────────
  --
  -- A loop rather than a single lookup: if the baseline table happens to
  -- carry more than one CHECK on this column, leaving the second one
  -- behind would still reject 'grooming_done' and the migration would
  -- look like it worked.  Zero matches is fine too (falls through to the
  -- ADD below).
  FOR v_conname IN
    SELECT c.conname
      FROM pg_constraint c
      JOIN pg_attribute  a
        ON a.attrelid = c.conrelid
       AND a.attnum   = c.conkey[1]
     WHERE c.conrelid = 'public.grooming_sessions'::regclass
       AND c.contype  = 'c'
       AND array_length(c.conkey, 1) = 1
       AND a.attname  = 'status'
  LOOP
    RAISE NOTICE 'grooming_sessions.status: dropping existing CHECK constraint %', v_conname;
    EXECUTE format(
      'ALTER TABLE public.grooming_sessions DROP CONSTRAINT %I',
      v_conname
    );
  END LOOP;

  -- ── 3. Re-add under the canonical name ─────────────────────────────
  EXECUTE format(
    'ALTER TABLE public.grooming_sessions
       ADD CONSTRAINT grooming_sessions_status_check
       CHECK (status = ANY (%L::text[]))',
    v_allowed
  );
END $$;
