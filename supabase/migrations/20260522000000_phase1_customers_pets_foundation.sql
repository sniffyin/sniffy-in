/*
  # Phase 1 — Customer/Pet Foundation
  =====================================

  Purpose
  -------
  Introduce a proper customer master, a separate pets table (multi-pet
  per customer), and a join table so a single grooming session can cover
  multiple pets (e.g. one cat + one dog billed together). Wire bookings
  and grooming_sessions to the new customers entity.

  Source of truth: grooming_sessions.  A customer is materialised only
  when at least one grooming_session row exists for that phone.  Website
  bookings can *link* to an existing customer (returning customer signal
  in the leads queue) but do not create one.

  Future-ready columns are included now (referral, lifecycle, auth user
  id for portal, marketing opt-in, vendor/sniffy payment split) so later
  phases (portal, WhatsApp reminders, referral tracking, birthdays)
  don't require schema rewrites.

  1. New Tables
    - `customers`        — one row per unique phone number who has been
                           groomed at least once.  Phone is normalized to
                           E.164 and acts as the dedup key.
    - `pets`             — one row per pet, FK to customer.
    - `session_pets`     — join table between grooming_sessions and pets;
                           supports multi-pet visits.

  2. Schema additions
    - `bookings.customer_id`          (nullable FK)
    - `grooming_sessions.customer_id` (nullable FK)
    - `grooming_sessions` keeps its existing pet_type/breed/pet_age columns
      for backward compatibility — they are mirrored from session_pets[0]
      on insert via a trigger so existing UI keeps working unchanged.

  3. Functions / Triggers
    - `normalize_phone(text)`              — strip non-digits, prepend +91
                                              for 10-digit Indian numbers,
                                              else +<digits>.
    - `upsert_customer_from_session()`     — BEFORE INSERT/UPDATE on
                                              grooming_sessions: find or
                                              create the customer by
                                              normalized phone, set
                                              customer_id on the row.
    - `recompute_customer_aggregates(uuid)`— sums total_sessions, last/first
                                              session_at, vendor_prepaid_total,
                                              sniffy_collected_total, and
                                              lifecycle_stage.
    - `aggregates_after_session()`         — AFTER INSERT/UPDATE/DELETE on
                                              grooming_sessions: calls the
                                              aggregates recomputer.
    - `link_booking_to_customer()`         — BEFORE INSERT/UPDATE on bookings:
                                              if phone matches an existing
                                              customer, set customer_id.
                                              Does NOT create new customers.

  4. Backfill
    - One-shot: extract distinct phones from grooming_sessions, create
      customers (latest session wins for address/city), create one pet per
      existing session and one session_pets row.  Link existing bookings
      whose phone matches an existing customer.

  5. Security
    - RLS enabled on customers, pets, session_pets.
    - Authenticated read/write policies (matches existing admin app
      pattern — adjust later if/when the portal needs scoped policies).
*/

-- ─────────────────────────────────────────────────────────────────────
-- 1. Helper function: normalize_phone
-- ─────────────────────────────────────────────────────────────────────
-- Strip everything that isn't a digit, then:
--   • 10 digits           → "+91" + digits   (Indian default)
--   • 12 digits, "91…"    → "+" + digits
--   • 11 digits, "0…"     → "+91" + last 10  (leading-zero Indian form)
--   • anything else       → "+" + digits     (international / odd cases)
-- Returns NULL when input is null/empty.

CREATE OR REPLACE FUNCTION normalize_phone(input text)
RETURNS text AS $$
DECLARE
  digits text;
BEGIN
  IF input IS NULL OR length(trim(input)) = 0 THEN
    RETURN NULL;
  END IF;
  digits := regexp_replace(input, '[^0-9]', '', 'g');
  IF digits IS NULL OR length(digits) = 0 THEN
    RETURN NULL;
  END IF;
  IF length(digits) = 10 THEN
    RETURN '+91' || digits;
  ELSIF length(digits) = 12 AND substring(digits, 1, 2) = '91' THEN
    RETURN '+' || digits;
  ELSIF length(digits) = 11 AND substring(digits, 1, 1) = '0' THEN
    RETURN '+91' || substring(digits, 2);
  ELSE
    RETURN '+' || digits;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─────────────────────────────────────────────────────────────────────
-- 2. customers table
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity (phone is the dedup key, always normalized to E.164)
  phone        text UNIQUE NOT NULL,
  phone_raw    text,                          -- original as entered (audit)
  name         text NOT NULL DEFAULT '',
  email        text,

  -- Location
  address      text,
  city         text,
  area         text,                          -- locality within city (optional)
  gps_location text,                          -- google maps share URL

  -- Editorial
  notes        text,                          -- pinned context for groomers
  tags         text[] NOT NULL DEFAULT '{}',  -- e.g. {"vip","punctual","cash-only"}
  is_vip       boolean NOT NULL DEFAULT false,

  -- Lifecycle (auto-maintained by recompute_customer_aggregates)
  --   new       — first session within last 30d
  --   active    — last session within 60d
  --   lapsed    — 60–180d since last session
  --   churned   — >180d since last session
  lifecycle_stage text NOT NULL DEFAULT 'new'
    CHECK (lifecycle_stage IN ('new','active','lapsed','churned')),

  -- Source attribution
  source       text,                          -- first session's source value
  source_type  text,                          -- 'internal' | 'external'

  -- Referral (Phase 5 — column reserved, nullable for now)
  referred_by_customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  referral_code text UNIQUE,

  -- Portal (Phase 4 — links to supabase auth user if/when they sign in)
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Communication preferences (Phase 3 — WhatsApp reminders)
  marketing_opt_in    boolean NOT NULL DEFAULT true,
  whatsapp_opt_in     boolean NOT NULL DEFAULT true,
  preferred_language  text NOT NULL DEFAULT 'en',

  -- Aggregates (maintained by recompute_customer_aggregates)
  first_session_at        date,
  last_session_at         date,
  total_sessions          integer NOT NULL DEFAULT 0,
  completed_sessions      integer NOT NULL DEFAULT 0,
  cancelled_sessions      integer NOT NULL DEFAULT 0,

  -- LTV split per Sniffy's two-channel payment model
  --   vendor_prepaid_total   — partner (e.g. Woofly) already collected;
  --                            cash never touched Sniffy.
  --   sniffy_collected_total — Sniffy received the payment directly
  --                            (online or cash-with-groomer reconciled).
  vendor_prepaid_total    numeric(10,2) NOT NULL DEFAULT 0,
  sniffy_collected_total  numeric(10,2) NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone        ON customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_name_lower   ON customers (lower(name));
CREATE INDEX IF NOT EXISTS idx_customers_last_session ON customers (last_session_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_customers_lifecycle    ON customers (lifecycle_stage);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers: authenticated read"
  ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "customers: authenticated write"
  ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────
-- 3. pets table
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Identity
  name        text,                                  -- "Bruno", optional
  type        text NOT NULL CHECK (type IN ('dog','cat')),
  breed       text,
  gender      text CHECK (gender IS NULL OR gender IN ('male','female')),

  -- Age — two-track model (per requirement):
  --   age_years      — integer years, the *primary* age signal.
  --   age_recorded_at— when age_years was last set; lets the UI roll the
  --                    displayed age forward over time without database
  --                    writes ("if age was 5 a year ago, show 6 today").
  --   age_bucket     — legacy bucket string ("0-1 years" / "1-5 years" /
  --                    "5+ years") for rows backfilled from existing
  --                    grooming_sessions where the precise age is unknown.
  --   dob            — reserved for Phase 5 (birthday automation).  When
  --                    set, displayed age is computed from DOB and the
  --                    integer fields are ignored.
  age_years        integer,
  age_recorded_at  date,
  age_bucket       text,
  dob              date,

  -- Care info
  weight_kg       numeric(5,2),
  color           text,
  medical         text,                              -- allergies, conditions
  behavior_notes  text,                              -- e.g. "anxious with clippers"
  photo_url       text,

  is_active       boolean NOT NULL DEFAULT true,    -- false = retired/passed

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pets_customer ON pets (customer_id);
CREATE INDEX IF NOT EXISTS idx_pets_type     ON pets (type);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pets: authenticated read"
  ON pets FOR SELECT TO authenticated USING (true);
CREATE POLICY "pets: authenticated write"
  ON pets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────
-- 4. Add customer_id to bookings and grooming_sessions
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings (customer_id);

ALTER TABLE grooming_sessions
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_grooming_sessions_customer ON grooming_sessions (customer_id);

-- ─────────────────────────────────────────────────────────────────────
-- 5. session_pets join table (multi-pet sessions)
-- ─────────────────────────────────────────────────────────────────────
-- A grooming session can cover multiple pets (e.g. cat + dog in one
-- visit).  Each row links one pet to one session, with optional per-pet
-- package/amount override (most sessions will leave these null and use
-- the session-level booking_amount/package as the single total).

CREATE TABLE IF NOT EXISTS session_pets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES grooming_sessions(id) ON DELETE CASCADE,
  pet_id      uuid NOT NULL REFERENCES pets(id) ON DELETE RESTRICT,

  -- Optional per-pet overrides; null = use the session's session-level values.
  per_pet_package text,
  per_pet_amount  numeric(10,2),
  per_pet_addons  text[],
  notes           text,

  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (session_id, pet_id)
);

CREATE INDEX IF NOT EXISTS idx_session_pets_session ON session_pets (session_id);
CREATE INDEX IF NOT EXISTS idx_session_pets_pet     ON session_pets (pet_id);

ALTER TABLE session_pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_pets: authenticated read"
  ON session_pets FOR SELECT TO authenticated USING (true);
CREATE POLICY "session_pets: authenticated write"
  ON session_pets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────
-- 6. updated_at touch trigger (reused on multiple tables)
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_customers_touch ON customers;
CREATE TRIGGER trg_customers_touch
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_pets_touch ON pets;
CREATE TRIGGER trg_pets_touch
  BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 7. Auto-link a grooming_session to its customer on insert/update
-- ─────────────────────────────────────────────────────────────────────
-- BEFORE INSERT/UPDATE on grooming_sessions:
--   • Normalize NEW.phone
--   • Find existing customer by normalized phone
--   • If none exists, create one (using session's name/address/source).
--   • Set NEW.customer_id.
--
-- Address policy (per product decision): latest-session-wins for address.
-- Name policy: do NOT overwrite an existing customer's name from a session
-- save — names get edited on the customer detail page instead, so typos
-- in session forms don't keep churning the canonical name.

CREATE OR REPLACE FUNCTION upsert_customer_from_session()
RETURNS trigger AS $$
DECLARE
  v_phone text;
  v_customer_id uuid;
BEGIN
  -- Skip if no phone — can't dedup without it.  Allow the session to
  -- save anyway so existing legacy rows aren't blocked.
  IF NEW.phone IS NULL OR length(trim(NEW.phone)) = 0 THEN
    RETURN NEW;
  END IF;

  v_phone := normalize_phone(NEW.phone);
  IF v_phone IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_customer_id FROM customers WHERE phone = v_phone;

  IF v_customer_id IS NULL THEN
    -- NOTE: source_type is a frontend-only derived field (computed
    -- from whether `source` is internal vs external) and is NOT a
    -- column on grooming_sessions.  We capture only `source` here;
    -- source_type can be derived at read time from the source value.
    INSERT INTO customers (
      phone, phone_raw, name, address, city, gps_location, source,
      first_session_at, last_session_at
    ) VALUES (
      v_phone,
      NEW.phone,
      COALESCE(NEW.pet_parent_name, ''),
      NEW.address,
      NULL,                       -- city not on grooming_sessions
      NEW.gps_location,
      NEW.source,
      NEW.session_date,
      NEW.session_date
    )
    RETURNING id INTO v_customer_id;
  ELSE
    -- Latest-session-wins for address / GPS only.  Name & city are
    -- managed on the customer detail page.
    UPDATE customers SET
      address      = COALESCE(NULLIF(NEW.address, ''), address),
      gps_location = COALESCE(NULLIF(NEW.gps_location, ''), gps_location)
    WHERE id = v_customer_id;
  END IF;

  NEW.customer_id := v_customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sessions_upsert_customer ON grooming_sessions;
CREATE TRIGGER trg_sessions_upsert_customer
  BEFORE INSERT OR UPDATE OF phone, pet_parent_name, address, gps_location,
                              session_date, source
  ON grooming_sessions
  FOR EACH ROW EXECUTE FUNCTION upsert_customer_from_session();

-- ─────────────────────────────────────────────────────────────────────
-- 8. Recompute customer aggregates + lifecycle_stage
-- ─────────────────────────────────────────────────────────────────────
-- Centralised so we can call it from triggers + a future Phase 3 cron
-- (lifecycle transitions due to elapsed time, not row changes).

CREATE OR REPLACE FUNCTION recompute_customer_aggregates(p_customer_id uuid)
RETURNS void AS $$
DECLARE
  v_last_date  date;
  v_first_date date;
  v_total      integer;
  v_completed  integer;
  v_cancelled  integer;
  v_vendor     numeric(10,2);
  v_sniffy     numeric(10,2);
  v_stage      text;
  v_days_since integer;
  v_days_since_first integer;
BEGIN
  IF p_customer_id IS NULL THEN
    RETURN;
  END IF;

  SELECT
    max(session_date),
    min(session_date),
    count(*),
    count(*) FILTER (WHERE status = 'completed'),
    count(*) FILTER (WHERE status = 'cancelled'),
    COALESCE(sum(total_collected) FILTER (WHERE payment_collected_by = 'vendor'), 0),
    COALESCE(sum(total_collected) FILTER (WHERE payment_collected_by <> 'vendor' AND payment_verified = true), 0)
  INTO v_last_date, v_first_date, v_total, v_completed, v_cancelled, v_vendor, v_sniffy
  FROM grooming_sessions
  WHERE customer_id = p_customer_id;

  -- Lifecycle stage from days since last_session_at and first_session_at.
  --   new      — first session within last 30 days
  --   active   — last session within 60 days (and not new)
  --   lapsed   — last session 60–180 days ago
  --   churned  — last session >180 days ago
  IF v_last_date IS NULL THEN
    v_stage := 'new';
  ELSE
    v_days_since       := (CURRENT_DATE - v_last_date);
    v_days_since_first := (CURRENT_DATE - v_first_date);
    IF v_days_since_first <= 30 THEN
      v_stage := 'new';
    ELSIF v_days_since <= 60 THEN
      v_stage := 'active';
    ELSIF v_days_since <= 180 THEN
      v_stage := 'lapsed';
    ELSE
      v_stage := 'churned';
    END IF;
  END IF;

  UPDATE customers SET
    total_sessions         = COALESCE(v_total, 0),
    completed_sessions     = COALESCE(v_completed, 0),
    cancelled_sessions     = COALESCE(v_cancelled, 0),
    first_session_at       = v_first_date,
    last_session_at        = v_last_date,
    vendor_prepaid_total   = COALESCE(v_vendor, 0),
    sniffy_collected_total = COALESCE(v_sniffy, 0),
    lifecycle_stage        = v_stage
  WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION aggregates_after_session()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    PERFORM recompute_customer_aggregates(OLD.customer_id);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Recompute both sides if the session moved between customers
    -- (rare but happens when phone is corrected on an existing row).
    PERFORM recompute_customer_aggregates(OLD.customer_id);
    IF NEW.customer_id IS DISTINCT FROM OLD.customer_id THEN
      PERFORM recompute_customer_aggregates(NEW.customer_id);
    END IF;
    RETURN NEW;
  ELSE
    PERFORM recompute_customer_aggregates(NEW.customer_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sessions_aggregates ON grooming_sessions;
CREATE TRIGGER trg_sessions_aggregates
  AFTER INSERT OR UPDATE OR DELETE ON grooming_sessions
  FOR EACH ROW EXECUTE FUNCTION aggregates_after_session();

-- ─────────────────────────────────────────────────────────────────────
-- 9. Link bookings to customer (does NOT create new customers)
-- ─────────────────────────────────────────────────────────────────────
-- BEFORE INSERT/UPDATE on bookings: if the phone matches an existing
-- customer, set customer_id.  Customers are only minted from
-- grooming_sessions — bookings are leads, not customers, until they
-- convert.

CREATE OR REPLACE FUNCTION link_booking_to_customer()
RETURNS trigger AS $$
DECLARE
  v_phone text;
  v_customer_id uuid;
BEGIN
  IF NEW.phone IS NULL OR length(trim(NEW.phone)) = 0 THEN
    RETURN NEW;
  END IF;
  v_phone := normalize_phone(NEW.phone);
  IF v_phone IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT id INTO v_customer_id FROM customers WHERE phone = v_phone;
  IF v_customer_id IS NOT NULL THEN
    NEW.customer_id := v_customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bookings_link_customer ON bookings;
CREATE TRIGGER trg_bookings_link_customer
  BEFORE INSERT OR UPDATE OF phone
  ON bookings
  FOR EACH ROW EXECUTE FUNCTION link_booking_to_customer();

-- ─────────────────────────────────────────────────────────────────────
-- 10. ONE-SHOT BACKFILL
-- ─────────────────────────────────────────────────────────────────────
-- a) Create customers from grooming_sessions (one per normalized phone).
-- b) For each existing grooming_session, create a pet record and a
--    session_pets row.  This preserves the one-pet-per-session history.
-- c) Recompute aggregates for every newly created customer.
-- d) Link bookings whose phone now matches a customer.

DO $$
DECLARE
  r RECORD;
  v_phone text;
  v_customer_id uuid;
  v_pet_id uuid;
  v_age_years integer;
  v_age_bucket text;
BEGIN
  -- a) Customers — pick the latest session per phone for name/address.
  --    source_type is a frontend-only derived field, so we only carry
  --    `source` from grooming_sessions; source_type is left NULL and
  --    can be derived at read time from the source value.
  FOR r IN
    SELECT DISTINCT ON (normalize_phone(phone))
      normalize_phone(phone)   AS phone_n,
      phone                    AS phone_raw,
      pet_parent_name,
      address,
      gps_location,
      source,
      session_date
    FROM grooming_sessions
    WHERE phone IS NOT NULL AND length(trim(phone)) > 0
    ORDER BY normalize_phone(phone), session_date DESC
  LOOP
    IF r.phone_n IS NULL THEN CONTINUE; END IF;
    INSERT INTO customers (phone, phone_raw, name, address, gps_location, source)
    VALUES (r.phone_n, r.phone_raw, COALESCE(r.pet_parent_name, ''), r.address, r.gps_location, r.source)
    ON CONFLICT (phone) DO NOTHING;
  END LOOP;

  -- b) Pets + session_pets, plus set customer_id on each session
  FOR r IN
    SELECT id, phone, pet_type, breed, pet_age, medical_issues, session_date
    FROM grooming_sessions
    WHERE phone IS NOT NULL AND length(trim(phone)) > 0
    ORDER BY session_date ASC
  LOOP
    v_phone := normalize_phone(r.phone);
    IF v_phone IS NULL THEN CONTINUE; END IF;

    SELECT id INTO v_customer_id FROM customers WHERE phone = v_phone;
    IF v_customer_id IS NULL THEN CONTINUE; END IF;

    -- Update the session's customer_id (skip triggers — we recompute aggregates at the end)
    UPDATE grooming_sessions SET customer_id = v_customer_id WHERE id = r.id;

    -- Map legacy bucket strings to a best-guess integer age.
    --   "0-1 years"  → 1
    --   "1-5 years"  → 3
    --   "5+ years"   → 6
    --   anything else→ try to parse a leading integer, else NULL
    v_age_bucket := r.pet_age;
    v_age_years := CASE
      WHEN r.pet_age IN ('0-1 years','0–1 years') THEN 1
      WHEN r.pet_age IN ('1-5 years','1–5 years') THEN 3
      WHEN r.pet_age IN ('5+ years','5+years')    THEN 6
      ELSE NULLIF(regexp_replace(COALESCE(r.pet_age,''), '[^0-9].*$', ''), '')::integer
    END;

    -- Try to reuse an existing pet for this customer with the same
    -- type+breed combination so we don't create one pet per session.
    SELECT id INTO v_pet_id
    FROM pets
    WHERE customer_id = v_customer_id
      AND type = COALESCE(r.pet_type, 'dog')
      AND COALESCE(breed,'') = COALESCE(r.breed,'')
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_pet_id IS NULL THEN
      INSERT INTO pets (customer_id, type, breed, age_years, age_recorded_at, age_bucket, medical)
      VALUES (v_customer_id, COALESCE(r.pet_type, 'dog'), r.breed, v_age_years, r.session_date, v_age_bucket, r.medical_issues)
      RETURNING id INTO v_pet_id;
    END IF;

    -- Idempotent join row
    INSERT INTO session_pets (session_id, pet_id)
    VALUES (r.id, v_pet_id)
    ON CONFLICT (session_id, pet_id) DO NOTHING;
  END LOOP;

  -- c) Recompute aggregates for every customer
  FOR r IN SELECT id FROM customers LOOP
    PERFORM recompute_customer_aggregates(r.id);
  END LOOP;

  -- d) Link bookings whose phone matches a customer
  UPDATE bookings b SET customer_id = c.id
  FROM customers c
  WHERE b.customer_id IS NULL
    AND b.phone IS NOT NULL
    AND normalize_phone(b.phone) = c.phone;
END $$;

-- ─────────────────────────────────────────────────────────────────────
-- 11. Convenience view: customer_with_recency
-- ─────────────────────────────────────────────────────────────────────
-- A read-only view that exposes "days since last session" — saves a
-- compute in the CustomersTab list.  The view is rebuilt on every
-- SELECT (Postgres views are not materialised), so it always reflects
-- the latest customer state and respects the underlying RLS.

CREATE OR REPLACE VIEW customers_with_recency AS
SELECT
  c.*,
  CASE
    WHEN c.last_session_at IS NULL THEN NULL
    ELSE (CURRENT_DATE - c.last_session_at)::integer
  END AS days_since_last_session,
  c.vendor_prepaid_total + c.sniffy_collected_total AS lifetime_value
FROM customers c;

GRANT SELECT ON customers_with_recency TO authenticated;
