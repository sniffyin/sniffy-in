-- ─────────────────────────────────────────────────────────────────────
-- Fix: archive_bookings RLS to permit anon writes
-- ─────────────────────────────────────────────────────────────────────
-- Bug repro: clicking "Delete session" in the admin Sessions tab
-- surfaces this Supabase error in the new Sniffy-styled confirm dialog:
--   { code: "42501",
--     message: "new row violates row-level security policy for
--               table \"archive_bookings\". Nothing was deleted." }
--
-- Why it happened:
--   The original archive_bookings migration
--   (20260521000000_create_archive_bookings.sql) gated its INSERT and
--   SELECT policies to `TO authenticated`.  However the admin /
--   coordinator UIs do NOT use Supabase Auth — they use an app-level
--   password gate (USERS array in src/pages/admin/authStore.ts), so
--   every PostgREST request from those UIs goes through the `anon`
--   role.  The `TO authenticated` policy never matches and the insert
--   is rejected.
--
--   This is the same root cause that
--   20260522010000_fix_customers_rls_anon_writes.sql fixed for the
--   customers / pets / session_pets tables.  archive_bookings shipped
--   a week later and made the same mistake — every other admin-facing
--   table in this project (bookings, groomer_leaves,
--   notification_reads, groomer_documents) grants `TO anon,
--   authenticated`.
--
-- Fix: drop and recreate the two archive_bookings policies so they
--   grant `TO anon, authenticated`.  No schema change, no data change,
--   no behavioural change for the future customer-portal /
--   Supabase-Auth users — they'll still hit the same `true`
--   USING / WITH CHECK clause through the `authenticated` role.
--
-- We deliberately do NOT add UPDATE or DELETE policies — archive
-- rows are still meant to be immutable.  The original migration's
-- comment on that is unchanged and still load-bearing.
--
-- Safety: this runs idempotently.  Re-running it (or applying it
-- after a fresh restore where the original migration also reran) is
-- a no-op past the first DROP.

DROP POLICY IF EXISTS "archive_bookings select coordinators" ON archive_bookings;
CREATE POLICY "archive_bookings select coordinators"
  ON archive_bookings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "archive_bookings insert coordinators" ON archive_bookings;
CREATE POLICY "archive_bookings insert coordinators"
  ON archive_bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
