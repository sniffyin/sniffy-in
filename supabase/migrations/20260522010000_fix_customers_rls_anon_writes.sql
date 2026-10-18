-- ─────────────────────────────────────────────────────────────────────
-- Fix: customers / pets / session_pets RLS to permit anon writes
-- ─────────────────────────────────────────────────────────────────────
-- Bug repro: adding a new session from the admin UI fails with
--   { code: "42501",
--     message: "new row violates row-level security policy for
--               table \"customers\"" }
--
-- Why it happened:
--   Phase 1 (20260522000000_phase1_customers_pets_foundation.sql)
--   created RLS policies on `customers`, `pets`, and `session_pets`
--   that grant access ONLY to the `authenticated` role.  However the
--   admin / coordinator / groomer UIs do NOT use Supabase Auth —
--   they use an app-level password gate (see SniffyLoginGate.tsx),
--   so every PostgREST request from those UIs is made under the
--   `anon` role.
--
--   When SessionFormModal inserts into `grooming_sessions`, the
--   BEFORE INSERT trigger `trg_sessions_upsert_customer` fires.  Its
--   function (`upsert_customer_from_session`) runs with the default
--   SECURITY INVOKER, so the implicit INSERT into `customers` is
--   evaluated against the anon role's policies — and none exist.
--
--   Every other admin-facing table in this project (bookings,
--   groomer_leaves, notification_reads, groomer_documents,
--   groomer_applications) already grants `TO anon, authenticated`.
--   Phase 1 was the odd one out.
--
-- Fix (two layers):
--   1.  Replace the customers/pets/session_pets policies so they
--       grant `anon, authenticated` — matches the rest of the
--       project and unblocks direct table writes from the admin UI
--       (e.g. CustomerDetailModal updates, CustomersTab tag edits).
--   2.  Mark the two trigger functions that write to `customers`
--       (`upsert_customer_from_session`, `link_booking_to_customer`)
--       as SECURITY DEFINER.  Trigger writes will then run under the
--       function owner and bypass RLS regardless of the caller — so
--       future tightening (e.g. when Phase 4 customer-portal RLS is
--       eventually merged) does not silently re-break this insert
--       path.
--
-- This migration is intentionally scoped to fix Phase 1 only.  It
-- does NOT touch the Phase 2–5 changes that are still on branches
-- and not yet merged.

-- ── 1. customers ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "customers: authenticated read"  ON customers;
DROP POLICY IF EXISTS "customers: authenticated write" ON customers;

CREATE POLICY "customers: read"
  ON customers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "customers: write"
  ON customers FOR ALL
  TO anon, authenticated
  USING (true) WITH CHECK (true);

-- ── 2. pets ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pets: authenticated read"  ON pets;
DROP POLICY IF EXISTS "pets: authenticated write" ON pets;

CREATE POLICY "pets: read"
  ON pets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "pets: write"
  ON pets FOR ALL
  TO anon, authenticated
  USING (true) WITH CHECK (true);

-- ── 3. session_pets ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "session_pets: authenticated read"  ON session_pets;
DROP POLICY IF EXISTS "session_pets: authenticated write" ON session_pets;

CREATE POLICY "session_pets: read"
  ON session_pets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "session_pets: write"
  ON session_pets FOR ALL
  TO anon, authenticated
  USING (true) WITH CHECK (true);

-- ── 4. customers_with_recency view — grant to anon as well ───────────
-- The view is used by Customer listing pages that run under anon.
GRANT SELECT ON customers_with_recency TO anon;

-- ── 5. Belt-and-suspenders: trigger functions as SECURITY DEFINER ────
-- These functions write to `customers` from BEFORE triggers on
-- grooming_sessions / bookings.  Running them as the function owner
-- means the trigger insert path is robust to any future policy
-- changes.  We do NOT mark `aggregates_after_session` /
-- `recompute_customer_aggregates` because those only UPDATE
-- `customers` rows that already exist and are reachable from the
-- session insert path anyway — but doing so is harmless and matches
-- the same robustness goal, so we include them too.
ALTER FUNCTION upsert_customer_from_session()        SECURITY DEFINER;
ALTER FUNCTION link_booking_to_customer()            SECURITY DEFINER;
ALTER FUNCTION aggregates_after_session()            SECURITY DEFINER;
ALTER FUNCTION recompute_customer_aggregates(uuid)   SECURITY DEFINER;
