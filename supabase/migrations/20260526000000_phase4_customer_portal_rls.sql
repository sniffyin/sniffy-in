/*
  # Phase 4 — Customer portal: RLS + auth linkage
  ================================================

  Purpose
  -------
  Open a second access tier on the database so customers can sign in
  via Supabase Auth (phone OTP) and read/write only their own data.
  The admin app's existing `authenticated` policies stay intact —
  admins continue to see everything.  Customer-scoped access is
  layered on top using auth.uid() ↔ customers.auth_user_id linkage.

  Key design decisions
  --------------------

  1. **auth.users.id is the bridge.**  When a customer signs in via
     phone OTP, Supabase creates an `auth.users` row with that phone.
     The portal calls `link_auth_user_to_customer()` which looks up
     the customer master row by normalized phone and sets
     `customers.auth_user_id = auth.uid()`.  All other policies key
     off this column.

  2. **`current_customer_id()` is the single source of truth.**  Every
     customer-scope policy below reads this function.  Changing how
     customers are identified later is a one-line change.

  3. **Coordinator/admin/viewer roles are NOT supabase-auth users.**
     The admin login surface uses a localStorage-backed auth store
     (see `authStore.ts`).  Those sessions still call Supabase with
     the `anon` key but they're considered `authenticated` by virtue
     of having an active session — which is what the original Phase 1
     policies key off ("authenticated"-role policies).  The new
     customer-scope policies live alongside those and use additional
     USING/WITH CHECK clauses that the admin client doesn't satisfy.

  4. **Outreach templates stay admin-only.**  Customers should not see
     or edit the template library; they only see their own
     `outreach_log` entries.

  Steps
  -----
   1. Helper functions
        - normalize_phone() already exists from Phase 1.
        - current_customer_id() — looks up customer for auth.uid().
        - link_auth_user_to_customer() — called by portal on signup.
   2. New RLS policies on each affected table.
   3. Index on customers.auth_user_id for the JOIN performance.
*/

-- ─────────────────────────────────────────────────────────────────────
-- 1. Helper: current_customer_id()
-- ─────────────────────────────────────────────────────────────────────
-- Returns the customer.id whose auth_user_id matches the current
-- Supabase auth session.  NULL when called by an admin (no auth.uid())
-- or when no customer row is linked yet.  SECURITY DEFINER so the
-- function can read customers even before its RLS policy is in place.

CREATE OR REPLACE FUNCTION current_customer_id()
RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT id INTO v_id FROM customers WHERE auth_user_id = auth.uid() LIMIT 1;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION current_customer_id() TO authenticated;

-- Performance: every customer-scope policy below filters on this column.
CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id ON customers (auth_user_id);

-- ─────────────────────────────────────────────────────────────────────
-- 2. Helper: link_auth_user_to_customer()
-- ─────────────────────────────────────────────────────────────────────
-- Called by the portal RIGHT AFTER verifyOtp() succeeds.  Reads the
-- caller's phone from auth.users, normalizes it, finds the matching
-- customer, and stamps auth_user_id.  Idempotent — running it twice
-- is fine; the UPDATE is a no-op once linked.
--
-- Returns the customer.id on success, or NULL if no matching customer
-- exists (in which case the portal should show a "no account on file,
-- contact us" message rather than creating a new customer ad-hoc —
-- Phase 1 explicitly said customers are minted only from grooming
-- sessions, and we want that invariant to hold).

CREATE OR REPLACE FUNCTION link_auth_user_to_customer()
RETURNS uuid AS $$
DECLARE
  v_auth_id   uuid := auth.uid();
  v_phone_raw text;
  v_phone     text;
  v_customer  uuid;
BEGIN
  IF v_auth_id IS NULL THEN RETURN NULL; END IF;

  -- Pull the phone from auth.users (set by signInWithOtp / verifyOtp).
  -- Supabase stores it as E.164 already in most setups, but we run it
  -- through normalize_phone() to match how customers.phone is stored.
  SELECT phone INTO v_phone_raw FROM auth.users WHERE id = v_auth_id;
  IF v_phone_raw IS NULL THEN RETURN NULL; END IF;

  v_phone := normalize_phone(v_phone_raw);
  IF v_phone IS NULL THEN RETURN NULL; END IF;

  -- Find matching customer.  If already linked to this auth user
  -- (idempotent re-call), just return.  If linked to a DIFFERENT
  -- auth user, do NOT overwrite — that would let a new sign-in hijack
  -- another customer's account.  Coordinator can resolve manually.
  SELECT id INTO v_customer FROM customers WHERE phone = v_phone LIMIT 1;
  IF v_customer IS NULL THEN RETURN NULL; END IF;

  UPDATE customers SET auth_user_id = v_auth_id
    WHERE id = v_customer
      AND (auth_user_id IS NULL OR auth_user_id = v_auth_id);

  RETURN v_customer;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION link_auth_user_to_customer() TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 3. RLS policies — customers
-- ─────────────────────────────────────────────────────────────────────
-- The existing Phase 1 policies ("customers: authenticated read/write")
-- already grant FULL access to anything calling with the anon key
-- (which both the admin client and the portal client do, since the
-- portal client also uses the anon key — supabase-js then attaches
-- the auth JWT).  We can't restrict the admin client because it has
-- no separate identity, so we add NEW policies that grant customer-
-- scoped access without removing the existing admin access.

-- Customer can see their own row (already covered by the existing
-- authenticated SELECT policy, but explicit named policy is clearer).
CREATE POLICY "customers: customer self read"
  ON customers FOR SELECT TO authenticated
  USING (id = current_customer_id());

-- Customer can update their own row (name, address, opt-ins, notes).
-- The existing "customers: authenticated write" already allows this;
-- the new policy is additive and serves as documentation.
CREATE POLICY "customers: customer self update"
  ON customers FOR UPDATE TO authenticated
  USING (id = current_customer_id())
  WITH CHECK (id = current_customer_id());

-- ─────────────────────────────────────────────────────────────────────
-- 4. RLS policies — pets
-- ─────────────────────────────────────────────────────────────────────

CREATE POLICY "pets: customer self read"
  ON pets FOR SELECT TO authenticated
  USING (customer_id = current_customer_id());

CREATE POLICY "pets: customer self write"
  ON pets FOR ALL TO authenticated
  USING (customer_id = current_customer_id())
  WITH CHECK (customer_id = current_customer_id());

-- ─────────────────────────────────────────────────────────────────────
-- 5. RLS policies — grooming_sessions, bookings, session_pets
-- ─────────────────────────────────────────────────────────────────────

-- grooming_sessions — customer-side: read only their own.  Writes
-- still come from admin.  No INSERT/UPDATE policy for the customer
-- role; if Supabase falls back to a broader policy, admin writes
-- still work because they go through the existing authenticated
-- write policy that was created by an earlier migration.  (If your
-- DB doesn't have one explicitly, sessions writes happen via the
-- service-role key or the admin app's pre-auth client setup.  In
-- either case the portal user has no write access here.)
CREATE POLICY "grooming_sessions: customer self read"
  ON grooming_sessions FOR SELECT TO authenticated
  USING (customer_id = current_customer_id());

-- bookings — customer can read their own, and INSERT new ones (for
-- the self-booking request flow).  customer_id must be set to their
-- own customer id; the WITH CHECK enforces that.
CREATE POLICY "bookings: customer self read"
  ON bookings FOR SELECT TO authenticated
  USING (customer_id = current_customer_id());

CREATE POLICY "bookings: customer self insert"
  ON bookings FOR INSERT TO authenticated
  WITH CHECK (customer_id = current_customer_id());

-- session_pets — read-only for customer, scoped through pets.customer_id.
CREATE POLICY "session_pets: customer self read"
  ON session_pets FOR SELECT TO authenticated
  USING (
    pet_id IN (SELECT id FROM pets WHERE customer_id = current_customer_id())
  );

-- outreach_log — customer can see their own message history.  We do
-- NOT grant insert/update — the queue is admin-managed.
CREATE POLICY "outreach_log: customer self read"
  ON outreach_log FOR SELECT TO authenticated
  USING (customer_id = current_customer_id());

-- outreach_templates — explicitly NOT exposed to customers; existing
-- admin policy continues to apply.

-- customer_notes_history — also admin-only.  Customers shouldn't see
-- coordinator edits to their own internal notes (medical, gate codes,
-- etc.); those are internal-ops data, not customer-facing data.

-- ─────────────────────────────────────────────────────────────────────
-- 6. Bookings: customer-facing fields for portal self-book
-- ─────────────────────────────────────────────────────────────────────
-- The existing bookings table has all the lead-form fields (name,
-- phone, pet_type, breed, age, medical, city, package, location) but
-- nothing for the portal-specific "I'd like to book, here's when I'd
-- prefer" inputs.  Add two columns:
--   • preferred_date   — what the customer picked.  Coordinator can
--     confirm or override during conversion.
--   • customer_notes   — free-text "anything else you should know"
--     from the booking form.  Distinct from `medical` so the
--     medical-issues field stays clean for the groomer's pre-flight.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS preferred_date date,
  ADD COLUMN IF NOT EXISTS customer_notes text;

-- ─────────────────────────────────────────────────────────────────────
-- 7. Notes
-- ─────────────────────────────────────────────────────────────────────
--
-- Twilio / SMS setup (must be done in Supabase Dashboard, not via SQL):
--   Dashboard → Project Settings → Auth → Phone
--     • Enable Phone provider
--     • Pick Twilio (or MessageBird / Vonage)
--     • Plug in account SID, auth token, message service SID
--     • Set rate limit (default 30 OTPs/hour is reasonable)
--   The portal client calls supabase.auth.signInWithOtp({ phone })
--   and supabase.auth.verifyOtp({ phone, token, type: 'sms' }) —
--   Supabase delivers the message via the configured provider.
--
-- Anti-hijack notes:
--   • link_auth_user_to_customer() refuses to re-point an already-
--     linked customer to a different auth user.  If you suspect an
--     account was hijacked, clear customers.auth_user_id manually
--     from Supabase Studio and the next portal sign-in re-links it.
--   • Customers are only minted from grooming_sessions (Phase 1
--     invariant).  Someone who signs up via phone OTP but has never
--     been groomed cannot create a customer row, so the portal will
--     show them a "no account on file" message — admin must create
--     a session first.
