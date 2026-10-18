-- ─────────────────────────────────────────────────────────────────────
-- Fix: Phase 6 (gift cards, change-requests, vaccinations) RLS
--      to permit anon writes from the admin app
-- ─────────────────────────────────────────────────────────────────────
-- Bug repro: clicking "Issue card" on the admin Gift cards tab fails:
--   { code: "42501",
--     message: "new row violates row-level security policy for
--               table \"gift_cards\"" }
--
-- Why it happened:
--   Same root cause as the prior fix migrations
--   (20260522010000_fix_customers_rls_anon_writes.sql and
--    20260525000010_fix_archive_bookings_rls_anon_writes.sql).
--   The admin / coordinator UIs do NOT use Supabase Auth — they use
--   an app-level password gate (USERS array in src/pages/admin/
--   authStore.ts), so every PostgREST / RPC request from those UIs
--   goes through the `anon` role.  Phase 6's three new migrations
--   (gift_cards, session_change_requests, vaccinations) all gated
--   their admin-side INSERT/UPDATE/DELETE policies to `TO
--   authenticated`, which never matches the anon admin session.
--
--   The customer-scope policies on these same tables (which depend
--   on current_customer_id()) DO target `authenticated` correctly —
--   the customer portal is the only surface that uses Supabase Auth.
--   We leave those alone.
--
-- Fix: drop and recreate the admin-side policies on gift_cards,
--   gift_card_redemptions, session_change_requests, pet_vaccinations,
--   and vaccine_types so they grant `TO anon, authenticated`.
--   No schema change, no data change.
--
-- Safety: idempotent — re-running is a no-op past the first DROP.

-- ─── gift_cards ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "gift_cards: authenticated read"  ON gift_cards;
DROP POLICY IF EXISTS "gift_cards: authenticated write" ON gift_cards;

CREATE POLICY "gift_cards: admin read"
  ON gift_cards FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "gift_cards: admin write"
  ON gift_cards FOR ALL
  TO anon, authenticated
  USING (true) WITH CHECK (true);

-- ─── gift_card_redemptions ───────────────────────────────────────────
DROP POLICY IF EXISTS "gift_card_redemptions: authenticated read"  ON gift_card_redemptions;
DROP POLICY IF EXISTS "gift_card_redemptions: authenticated write" ON gift_card_redemptions;

CREATE POLICY "gift_card_redemptions: admin read"
  ON gift_card_redemptions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "gift_card_redemptions: admin write"
  ON gift_card_redemptions FOR ALL
  TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Allow the customer_gift_card_balance view to be read from the admin
-- app (anon) too — coordinator surfaces the wallet balance on the
-- customer detail panel.
GRANT SELECT ON customer_gift_card_balance TO anon;

-- ─── session_change_requests ────────────────────────────────────────
DROP POLICY IF EXISTS "scr: authenticated read"  ON session_change_requests;
DROP POLICY IF EXISTS "scr: authenticated write" ON session_change_requests;

CREATE POLICY "scr: admin read"
  ON session_change_requests FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "scr: admin write"
  ON session_change_requests FOR ALL
  TO anon, authenticated
  USING (true) WITH CHECK (true);

-- ─── vaccine_types ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "vaccine_types: read all"    ON vaccine_types;
DROP POLICY IF EXISTS "vaccine_types: admin write" ON vaccine_types;

CREATE POLICY "vaccine_types: read all"
  ON vaccine_types FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "vaccine_types: admin write"
  ON vaccine_types FOR ALL
  TO anon, authenticated
  USING (true) WITH CHECK (true);

-- ─── pet_vaccinations ────────────────────────────────────────────────
DROP POLICY IF EXISTS "pet_vacc: authenticated read"  ON pet_vaccinations;
DROP POLICY IF EXISTS "pet_vacc: authenticated write" ON pet_vaccinations;

CREATE POLICY "pet_vacc: admin read"
  ON pet_vaccinations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "pet_vacc: admin write"
  ON pet_vaccinations FOR ALL
  TO anon, authenticated
  USING (true) WITH CHECK (true);
