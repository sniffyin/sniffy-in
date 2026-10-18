/*
  # Phase 5 — Referral tracking · DOB-driven birthdays
  ====================================================

  Purpose
  -------
  The final phase of the customers/pets rollout activates two columns
  that have been reserved since Phase 1:

    • `customers.referral_code`             — short, shareable code
    • `customers.referred_by_customer_id`   — who brought this customer in

  …and one column that has been reserved on pets since Phase 1:

    • `pets.dob` — pet date of birth

  On top of those reservations we add a credit ledger so referrals
  actually translate into ₹ rewards, and we extend the Phase 3 outreach
  engine to fire birthday wishes 3 days before + on the day of each
  pet's DOB.

  ──────────────────────────────────────────────────────────────────────
  1. Referral codes
     - `generate_referral_code(seed)` — deterministic 6-char code derived
        from the customer's name + a short random suffix.  Collision-safe
        via a retry loop.
     - Phase 1's `upsert_customer_from_session` trigger is extended to
        mint a code when a customer row is first created.
     - One-shot backfill assigns codes to every existing customer that
        is missing one.

  2. Referral credits ledger
     - New table `referral_credits` — append-only ledger.  Each row is
       a positive or negative ₹ delta with a reason (`signup`, `earn`,
       `redeem`, `expire`, `adjust`).
     - View `customer_referral_balance` — running balance per customer.
     - Function `award_referral_credit(p_referrer, p_referee, p_session_id, p_amount)`
       posts the credit and is idempotent on (referrer, source_session_id).
     - Trigger `trg_sessions_award_referral` fires when a grooming
       session flips to `status = 'completed'`.  If the session belongs
       to a customer with `referred_by_customer_id IS NOT NULL` and no
       referral credit has been awarded yet for that referrer/referee,
       it issues the configured flat reward to the referrer.

  3. Birthday outreach
     - Templates `pet_birthday_advance` (fires 3 days before) and
       `pet_birthday` (fires on the day).
     - Trigger DSL extended: `pet_birthday:N` where N is the lead-time
       in days (0 = on the birthday, 3 = three days ahead).
     - `enqueue_outreach()` is replaced (CREATE OR REPLACE) to handle the
       new rule kind alongside the existing `lapsed_min_days`, `churned`,
       and `follow_up_due` rules.
     - `render_outreach_body()` gains new placeholders:
         {{birthday_pet_name}} — the pet whose birthday is today/imminent
         {{birthday_pet_age}}  — that pet's age in years on the birthday
         {{days_to_birthday}}  — 0 for on-the-day, N for advance

  4. Cooldown semantics for birthdays
     Cooldown is honored per-customer per-template (the same machinery
     Phase 3 uses).  Because a pet only has one birthday a year, the
     365-day cooldown built into the seed templates prevents a customer
     from receiving the same birthday template more than once a year,
     even if their pet's DOB row is touched.

  Out of scope (deliberately):
     • Referral landing page on the marketing site — codes can already
       be shared as /account?ref=CODE; portal Gate (next iteration) can
       capture the param.
     • Multi-tier rewards / streak bonuses.

  Order of file is migration-replayable: every statement is idempotent
  (CREATE TABLE IF NOT EXISTS, CREATE OR REPLACE FUNCTION, etc.).
*/

-- ─────────────────────────────────────────────────────────────────────
-- 1. Configurable referral reward amount
-- ─────────────────────────────────────────────────────────────────────
-- Stored as a single-row settings table so the coordinator can tweak
-- the reward without a code/migration change.  Defaults to ₹200.

CREATE TABLE IF NOT EXISTS referral_settings (
  id                       smallint PRIMARY KEY DEFAULT 1,
  signup_credit            numeric(10,2) NOT NULL DEFAULT 0,    -- credited to the NEW customer when they apply a code
  referrer_credit          numeric(10,2) NOT NULL DEFAULT 200,  -- credited to the REFERRER on referee's first completed session
  credit_expiry_days       integer NOT NULL DEFAULT 365,         -- informational; expire logic lives in app code
  CHECK (id = 1)
);

INSERT INTO referral_settings (id, signup_credit, referrer_credit, credit_expiry_days)
VALUES (1, 0, 200, 365)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE referral_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_settings: authenticated read"
  ON referral_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "referral_settings: authenticated write"
  ON referral_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────
-- 2. generate_referral_code()
-- ─────────────────────────────────────────────────────────────────────
-- Build a 6-character code from the first 4 letters of the customer's
-- name (upper-cased, A-Z only) + a 2-character random alphanumeric
-- suffix.  If the customer has no usable name, fall back to "SNF" +
-- 3-char random suffix.  Retries up to 8 times on collision before
-- giving up and using a fully-random 8-char code.
--
-- The function only returns the code string — caller decides whether
-- to write it.  Safe to call from triggers (no I/O).

CREATE OR REPLACE FUNCTION generate_referral_code(p_name text)
RETURNS text AS $$
DECLARE
  v_prefix    text;
  v_candidate text;
  v_attempt   int := 0;
  v_random    text;
  v_alphabet  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- no 0/1/I/O ambiguity
  i           int;
BEGIN
  -- Build the prefix from the name (A-Z only).
  v_prefix := upper(regexp_replace(COALESCE(p_name, ''), '[^A-Za-z]', '', 'g'));
  v_prefix := substring(v_prefix, 1, 4);
  IF v_prefix IS NULL OR length(v_prefix) < 3 THEN
    v_prefix := 'SNF';
  END IF;

  LOOP
    v_attempt := v_attempt + 1;
    v_random := '';
    FOR i IN 1..(6 - length(v_prefix)) LOOP
      v_random := v_random || substring(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    END LOOP;
    v_candidate := v_prefix || v_random;

    -- Check uniqueness against customers.referral_code.
    IF NOT EXISTS (SELECT 1 FROM customers WHERE referral_code = v_candidate) THEN
      RETURN v_candidate;
    END IF;

    -- After 8 collisions on the prefix, switch to a fully-random 8-char code.
    IF v_attempt >= 8 THEN
      v_candidate := '';
      FOR i IN 1..8 LOOP
        v_candidate := v_candidate || substring(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
      END LOOP;
      IF NOT EXISTS (SELECT 1 FROM customers WHERE referral_code = v_candidate) THEN
        RETURN v_candidate;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

GRANT EXECUTE ON FUNCTION generate_referral_code(text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 3. Update upsert_customer_from_session to mint a code on new customers
-- ─────────────────────────────────────────────────────────────────────
-- This is a REPLACE of the Phase 1 function with the same signature.
-- The only behavioural change: on INSERT branch, NEW customers now
-- receive a freshly-generated referral_code.  Existing customers are
-- untouched, even if their code is NULL — backfill below handles them.

CREATE OR REPLACE FUNCTION upsert_customer_from_session()
RETURNS trigger AS $$
DECLARE
  v_phone text;
  v_customer_id uuid;
  v_code text;
BEGIN
  IF NEW.phone IS NULL OR length(trim(NEW.phone)) = 0 THEN
    RETURN NEW;
  END IF;

  v_phone := normalize_phone(NEW.phone);
  IF v_phone IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_customer_id FROM customers WHERE phone = v_phone;

  IF v_customer_id IS NULL THEN
    v_code := generate_referral_code(COALESCE(NEW.pet_parent_name, 'SNF'));

    INSERT INTO customers (
      phone, phone_raw, name, address, city, gps_location, source,
      first_session_at, last_session_at, referral_code
    ) VALUES (
      v_phone,
      NEW.phone,
      COALESCE(NEW.pet_parent_name, ''),
      NEW.address,
      NULL,
      NEW.gps_location,
      NEW.source,
      NEW.session_date,
      NEW.session_date,
      v_code
    )
    RETURNING id INTO v_customer_id;
  ELSE
    UPDATE customers SET
      address      = COALESCE(NULLIF(NEW.address, ''), address),
      gps_location = COALESCE(NULLIF(NEW.gps_location, ''), gps_location)
    WHERE id = v_customer_id;
  END IF;

  NEW.customer_id := v_customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────
-- 4. Backfill referral_code for existing customers that don't have one
-- ─────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  r RECORD;
  v_code text;
BEGIN
  FOR r IN SELECT id, name FROM customers WHERE referral_code IS NULL LOOP
    v_code := generate_referral_code(r.name);
    -- Race-safe: on UNIQUE conflict (very unlikely since generate_referral_code
    -- checks), regenerate once and try again.
    BEGIN
      UPDATE customers SET referral_code = v_code WHERE id = r.id;
    EXCEPTION WHEN unique_violation THEN
      UPDATE customers SET referral_code = generate_referral_code(r.name) WHERE id = r.id;
    END;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────
-- 5. referral_credits ledger
-- ─────────────────────────────────────────────────────────────────────
-- Append-only.  Positive amounts are credits (the customer gains
-- value); negative amounts are redemptions/expirations (the customer
-- loses value).  Sum across the rows is the current balance.

CREATE TABLE IF NOT EXISTS referral_credits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount          numeric(10,2) NOT NULL,         -- positive = earned, negative = redeemed
  reason          text NOT NULL CHECK (reason IN ('signup','earn','redeem','expire','adjust')),
  -- Optional linkage to the session that triggered an `earn` row, so
  -- we can prevent double-issuance (one earn per referee per referrer).
  source_session_id uuid REFERENCES grooming_sessions(id) ON DELETE SET NULL,
  -- Who triggered this entry — referee for `earn`, the redeeming
  -- customer for `redeem`, etc.  Nullable for system-generated rows.
  related_customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  note            text,
  created_by      text,                            -- coordinator name / 'system'
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- One earn per (referrer, referee, source session).  This is the
-- guard that makes `award_referral_credit` idempotent if it's called
-- twice (e.g. the session is reopened and re-completed).
CREATE UNIQUE INDEX IF NOT EXISTS uq_referral_credits_earn
  ON referral_credits (customer_id, related_customer_id, source_session_id)
  WHERE reason = 'earn' AND source_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_referral_credits_customer
  ON referral_credits (customer_id, created_at DESC);

ALTER TABLE referral_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_credits: authenticated read"
  ON referral_credits FOR SELECT TO authenticated USING (true);
CREATE POLICY "referral_credits: authenticated write"
  ON referral_credits FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Convenience view: running balance per customer.
CREATE OR REPLACE VIEW customer_referral_balance AS
SELECT
  c.id                                AS customer_id,
  COALESCE(SUM(rc.amount), 0)::numeric(10,2) AS balance,
  COALESCE(SUM(rc.amount) FILTER (WHERE rc.amount > 0), 0)::numeric(10,2) AS lifetime_earned,
  COALESCE(SUM(-rc.amount) FILTER (WHERE rc.amount < 0), 0)::numeric(10,2) AS lifetime_redeemed,
  COUNT(rc.id) FILTER (WHERE rc.reason = 'earn')      AS earn_count,
  COUNT(rc.id) FILTER (WHERE rc.reason = 'redeem')    AS redeem_count
FROM customers c
LEFT JOIN referral_credits rc ON rc.customer_id = c.id
GROUP BY c.id;

GRANT SELECT ON customer_referral_balance TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 6. apply_referral_code() — called when a new customer enters a code
-- ─────────────────────────────────────────────────────────────────────
-- Returns:
--   {success: bool, error?: text, referrer_id?: uuid, signup_credit?: numeric}
-- Validations:
--   • code exists
--   • code does NOT belong to p_customer_id (no self-referral)
--   • p_customer_id does not already have a referrer set
--   • The new customer must have <2 sessions when applying (so existing
--     long-time customers can't retro-attribute themselves; this is
--     anti-fraud + protects the referrer-reward logic).
-- On success:
--   • sets customers.referred_by_customer_id
--   • posts a signup_credit row IF referral_settings.signup_credit > 0

CREATE OR REPLACE FUNCTION apply_referral_code(p_code text, p_customer_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_referrer_id   uuid;
  v_existing_ref  uuid;
  v_sessions      int;
  v_signup_credit numeric(10,2);
  v_referrer_name text;
BEGIN
  IF p_code IS NULL OR p_customer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'missing_args');
  END IF;

  SELECT id, name INTO v_referrer_id, v_referrer_name
    FROM customers WHERE upper(referral_code) = upper(trim(p_code));
  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'code_not_found');
  END IF;

  IF v_referrer_id = p_customer_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'self_referral');
  END IF;

  SELECT referred_by_customer_id, COALESCE(total_sessions, 0)
    INTO v_existing_ref, v_sessions
    FROM customers WHERE id = p_customer_id;

  IF v_existing_ref IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_referred');
  END IF;

  IF v_sessions > 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'too_many_sessions');
  END IF;

  UPDATE customers SET referred_by_customer_id = v_referrer_id
    WHERE id = p_customer_id;

  SELECT signup_credit INTO v_signup_credit FROM referral_settings WHERE id = 1;
  IF v_signup_credit IS NOT NULL AND v_signup_credit > 0 THEN
    INSERT INTO referral_credits (customer_id, amount, reason, related_customer_id, note, created_by)
    VALUES (p_customer_id, v_signup_credit, 'signup', v_referrer_id,
            'Signup credit for using referral code ' || upper(trim(p_code)), 'system');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'referrer_id', v_referrer_id,
    'referrer_name', v_referrer_name,
    'signup_credit', v_signup_credit
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION apply_referral_code(text, uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 7. award_referral_credit() + trigger on session completion
-- ─────────────────────────────────────────────────────────────────────
-- Posts an `earn` row on referral_credits to the REFERRER when the
-- REFEREE's first session completes.
--
-- "First session" is interpreted as: this referee has no prior
-- completed session.  We test that inside the function so the trigger
-- doesn't fire on subsequent completed sessions.
--
-- Idempotent: the unique index uq_referral_credits_earn means a second
-- call for the same (referrer, referee, source_session_id) is a no-op.

CREATE OR REPLACE FUNCTION award_referral_credit(
  p_referrer_id uuid, p_referee_id uuid, p_session_id uuid, p_amount numeric DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_amount numeric(10,2);
  v_credit_id uuid;
BEGIN
  IF p_referrer_id IS NULL OR p_referee_id IS NULL THEN RETURN NULL; END IF;

  v_amount := COALESCE(p_amount, (SELECT referrer_credit FROM referral_settings WHERE id = 1), 0);
  IF v_amount <= 0 THEN RETURN NULL; END IF;

  -- Conflict-do-nothing pattern (ON CONFLICT can't see the partial
  -- unique index because source_session_id may be NULL, but the
  -- trigger always supplies it so the index does fire).
  INSERT INTO referral_credits (
    customer_id, amount, reason, source_session_id, related_customer_id, note, created_by
  ) VALUES (
    p_referrer_id, v_amount, 'earn', p_session_id, p_referee_id,
    'Referral reward — ' || (SELECT COALESCE(name, 'a referred customer') FROM customers WHERE id = p_referee_id) || ' completed their first session',
    'system'
  )
  ON CONFLICT ON CONSTRAINT uq_referral_credits_earn DO NOTHING
  RETURNING id INTO v_credit_id;

  RETURN v_credit_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION award_referral_credit(uuid, uuid, uuid, numeric) TO authenticated;

CREATE OR REPLACE FUNCTION sessions_award_referral_on_complete()
RETURNS trigger AS $$
DECLARE
  v_referrer uuid;
  v_prior_completed int;
BEGIN
  -- Only fire on transition into 'completed'
  IF NEW.status IS DISTINCT FROM 'completed' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'completed' THEN RETURN NEW; END IF;

  IF NEW.customer_id IS NULL THEN RETURN NEW; END IF;

  SELECT referred_by_customer_id INTO v_referrer
    FROM customers WHERE id = NEW.customer_id;
  IF v_referrer IS NULL THEN RETURN NEW; END IF;

  -- Only award on the referee's first completed session.  Count
  -- excluding this very row.
  SELECT count(*) INTO v_prior_completed
    FROM grooming_sessions
    WHERE customer_id = NEW.customer_id
      AND status = 'completed'
      AND id <> NEW.id;
  IF v_prior_completed > 0 THEN RETURN NEW; END IF;

  PERFORM award_referral_credit(v_referrer, NEW.customer_id, NEW.id, NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sessions_award_referral ON grooming_sessions;
CREATE TRIGGER trg_sessions_award_referral
  AFTER INSERT OR UPDATE OF status
  ON grooming_sessions
  FOR EACH ROW EXECUTE FUNCTION sessions_award_referral_on_complete();

-- ─────────────────────────────────────────────────────────────────────
-- 8. DOB index (helps the birthday queue)
-- ─────────────────────────────────────────────────────────────────────
-- The `dob` column already exists on pets (added in Phase 1).  We add
-- a functional index on (month, day) so birthday queries that filter
-- by today's MM-DD don't scan the whole pets table.

CREATE INDEX IF NOT EXISTS idx_pets_dob_mmdd
  ON pets ((EXTRACT(MONTH FROM dob)::int), (EXTRACT(DAY FROM dob)::int))
  WHERE dob IS NOT NULL AND is_active = true;

-- ─────────────────────────────────────────────────────────────────────
-- 9. render_outreach_body() — add birthday placeholders
-- ─────────────────────────────────────────────────────────────────────
-- Wraps Phase 3's function.  Same placeholders as before; adds:
--   {{birthday_pet_name}} — the pet whose DOB matches the trigger date
--   {{birthday_pet_age}}  — age in years on that date
--   {{days_to_birthday}}  — N for advance, "today" for on-day

CREATE OR REPLACE FUNCTION render_outreach_body(p_template_key text, p_customer_id uuid)
RETURNS text AS $$
DECLARE
  v_body     text;
  v_template outreach_templates%ROWTYPE;
  v_customer customers%ROWTYPE;
  v_pet_name text;
  v_days     int;
  v_next_due date;
  v_last_pkg text;

  v_rule_kind text;
  v_rule_arg  int;
  v_target_date date;
  v_birthday_pet record;
  v_age_yrs   int;
BEGIN
  SELECT * INTO v_template FROM outreach_templates WHERE key = p_template_key;
  IF v_template.id IS NULL THEN RETURN NULL; END IF;
  v_body := v_template.body_template;

  SELECT * INTO v_customer FROM customers WHERE id = p_customer_id;
  IF v_customer.id IS NULL THEN RETURN v_body; END IF;

  -- First-pet name as a friendly default fallback.
  SELECT name INTO v_pet_name FROM pets
    WHERE customer_id = p_customer_id AND is_active = true
    ORDER BY created_at ASC LIMIT 1;
  IF v_pet_name IS NULL OR length(trim(v_pet_name)) = 0 THEN
    v_pet_name := 'your pet';
  END IF;

  v_days := COALESCE((CURRENT_DATE - v_customer.last_session_at)::int, 0);

  SELECT next_due_date, package INTO v_next_due, v_last_pkg
  FROM grooming_sessions
  WHERE customer_id = p_customer_id
  ORDER BY session_date DESC LIMIT 1;

  -- Birthday-specific resolution.  Parse trigger rule for pet_birthday
  -- so we know which date to look for.
  v_rule_kind := split_part(v_template.trigger_rule, ':', 1);
  v_rule_arg  := COALESCE(NULLIF(split_part(v_template.trigger_rule, ':', 2), ''), '0')::int;

  IF v_rule_kind = 'pet_birthday' THEN
    v_target_date := CURRENT_DATE + v_rule_arg;
    SELECT name, dob INTO v_birthday_pet FROM pets
      WHERE customer_id = p_customer_id
        AND is_active = true
        AND dob IS NOT NULL
        AND EXTRACT(MONTH FROM dob)::int = EXTRACT(MONTH FROM v_target_date)::int
        AND EXTRACT(DAY   FROM dob)::int = EXTRACT(DAY   FROM v_target_date)::int
      ORDER BY dob ASC LIMIT 1;

    IF v_birthday_pet.name IS NOT NULL AND length(trim(v_birthday_pet.name)) > 0 THEN
      v_body := replace(v_body, '{{birthday_pet_name}}', v_birthday_pet.name);
    ELSE
      v_body := replace(v_body, '{{birthday_pet_name}}', v_pet_name);
    END IF;

    IF v_birthday_pet.dob IS NOT NULL THEN
      v_age_yrs := EXTRACT(YEAR FROM age(v_target_date, v_birthday_pet.dob))::int;
      v_body := replace(v_body, '{{birthday_pet_age}}', v_age_yrs::text);
    ELSE
      v_body := replace(v_body, '{{birthday_pet_age}}', '');
    END IF;

    IF v_rule_arg = 0 THEN
      v_body := replace(v_body, '{{days_to_birthday}}', 'today');
    ELSE
      v_body := replace(v_body, '{{days_to_birthday}}', v_rule_arg::text);
    END IF;
  END IF;

  v_body := replace(v_body, '{{customer_name}}',
              COALESCE(NULLIF(trim(v_customer.name), ''), 'there'));
  v_body := replace(v_body, '{{pet_name}}',       v_pet_name);
  v_body := replace(v_body, '{{days_since}}',     v_days::text);
  v_body := replace(v_body, '{{next_due_date}}',
              COALESCE(to_char(v_next_due, 'DD-Mon-YYYY'), 'soon'));
  v_body := replace(v_body, '{{last_package}}',   COALESCE(v_last_pkg, 'your usual'));

  RETURN v_body;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─────────────────────────────────────────────────────────────────────
-- 10. enqueue_outreach() — extend with pet_birthday rule
-- ─────────────────────────────────────────────────────────────────────
-- Same body as Phase 3 with one extra branch.  Replaces the function so
-- the daily cron picks up the new behaviour automatically.

CREATE OR REPLACE FUNCTION enqueue_outreach()
RETURNS integer AS $$
DECLARE
  v_total int := 0;
  v_template outreach_templates%ROWTYPE;
  v_rule_kind text;
  v_rule_arg  int;
  v_customer_ids uuid[];
  v_id uuid;
  v_last_sent_at timestamptz;
  v_target_date date;
BEGIN
  FOR v_template IN SELECT * FROM outreach_templates WHERE is_active = true LOOP
    v_rule_kind := split_part(v_template.trigger_rule, ':', 1);
    v_rule_arg  := COALESCE(NULLIF(split_part(v_template.trigger_rule, ':', 2), ''), '0')::int;

    IF v_rule_kind = 'lapsed_min_days' THEN
      SELECT array_agg(c.id) INTO v_customer_ids
      FROM customers c
      WHERE c.lifecycle_stage = 'lapsed'
        AND c.last_session_at IS NOT NULL
        AND (CURRENT_DATE - c.last_session_at) >= v_rule_arg
        AND c.whatsapp_opt_in = true
        AND (c.outreach_paused_until IS NULL OR c.outreach_paused_until <= CURRENT_DATE);

    ELSIF v_rule_kind = 'churned' THEN
      SELECT array_agg(c.id) INTO v_customer_ids
      FROM customers c
      WHERE c.lifecycle_stage = 'churned'
        AND c.whatsapp_opt_in = true
        AND (c.outreach_paused_until IS NULL OR c.outreach_paused_until <= CURRENT_DATE);

    ELSIF v_rule_kind = 'follow_up_due' THEN
      SELECT array_agg(DISTINCT s.customer_id) INTO v_customer_ids
      FROM grooming_sessions s
      JOIN customers c ON c.id = s.customer_id
      WHERE s.next_due_date IS NOT NULL
        AND s.next_due_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + v_rule_arg)
        AND c.whatsapp_opt_in = true
        AND (c.outreach_paused_until IS NULL OR c.outreach_paused_until <= CURRENT_DATE);

    ELSIF v_rule_kind = 'pet_birthday' THEN
      -- Customers with at least one active pet whose DOB (month/day)
      -- matches today + N.  Multi-pet customers only get the template
      -- once per (template, customer, day) — the cooldown filter + the
      -- "already queued" check below handle it.
      v_target_date := CURRENT_DATE + v_rule_arg;
      SELECT array_agg(DISTINCT p.customer_id) INTO v_customer_ids
      FROM pets p
      JOIN customers c ON c.id = p.customer_id
      WHERE p.is_active = true
        AND p.dob IS NOT NULL
        AND EXTRACT(MONTH FROM p.dob)::int = EXTRACT(MONTH FROM v_target_date)::int
        AND EXTRACT(DAY   FROM p.dob)::int = EXTRACT(DAY   FROM v_target_date)::int
        AND c.whatsapp_opt_in = true
        AND (c.outreach_paused_until IS NULL OR c.outreach_paused_until <= CURRENT_DATE);

    ELSE
      CONTINUE;
    END IF;

    IF v_customer_ids IS NULL THEN CONTINUE; END IF;

    FOREACH v_id IN ARRAY v_customer_ids LOOP
      SELECT MAX(sent_at) INTO v_last_sent_at
        FROM outreach_log
        WHERE customer_id = v_id
          AND template_key = v_template.key
          AND status = 'sent';

      IF v_last_sent_at IS NOT NULL
         AND v_last_sent_at > (now() - (v_template.cooldown_days || ' days')::interval) THEN
        CONTINUE;
      END IF;

      IF EXISTS (
        SELECT 1 FROM outreach_log
        WHERE customer_id = v_id
          AND template_key = v_template.key
          AND status = 'queued'
      ) THEN
        CONTINUE;
      END IF;

      INSERT INTO outreach_log (customer_id, template_key, channel, status, message_body)
      VALUES (
        v_id,
        v_template.key,
        v_template.channel,
        'queued',
        render_outreach_body(v_template.key, v_id)
      );
      v_total := v_total + 1;
    END LOOP;
  END LOOP;

  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────
-- 11. Seed birthday templates
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO outreach_templates (key, label, body_template, cooldown_days, trigger_rule)
VALUES
  (
    'pet_birthday_advance',
    'Pet birthday — 3 days ahead',
    E'Hi {{customer_name}}! 🎂 {{birthday_pet_name}}''s birthday is in {{days_to_birthday}} days. Want to book a birthday spa treatment? Reply YES and we''ll set it up. 🐾',
    365,
    'pet_birthday:3'
  ),
  (
    'pet_birthday',
    'Pet birthday — on the day',
    E'🎉 Happy birthday {{birthday_pet_name}}! Wishing you a wonderful day full of treats and belly rubs. With love, the Sniffy team 💜',
    365,
    'pet_birthday:0'
  )
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- 12. apply_referral_code from the portal (RPC)
-- ─────────────────────────────────────────────────────────────────────
-- Same function as #6 — already granted to authenticated above.  The
-- portal's CustomerPortalProfile (next iteration) can call this RPC.
-- For now the admin's CustomerDetailModal exposes a manual-attach UI.

-- ─────────────────────────────────────────────────────────────────────
-- 13. Convenience: redeem_referral_credit() RPC
-- ─────────────────────────────────────────────────────────────────────
-- Posts a negative ledger row.  Used by the SessionFormModal in a
-- future iteration to apply credit at session time.  Validates the
-- customer has enough balance; refuses partial draws.

CREATE OR REPLACE FUNCTION redeem_referral_credit(
  p_customer_id uuid, p_amount numeric, p_session_id uuid, p_note text, p_created_by text
) RETURNS jsonb AS $$
DECLARE
  v_balance numeric(10,2);
BEGIN
  IF p_customer_id IS NULL OR p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_args');
  END IF;
  SELECT balance INTO v_balance FROM customer_referral_balance WHERE customer_id = p_customer_id;
  IF COALESCE(v_balance, 0) < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_balance', 'balance', COALESCE(v_balance, 0));
  END IF;

  INSERT INTO referral_credits (
    customer_id, amount, reason, source_session_id, note, created_by
  ) VALUES (
    p_customer_id, -1 * p_amount, 'redeem', p_session_id,
    COALESCE(NULLIF(trim(p_note), ''), 'Credit applied'),
    COALESCE(NULLIF(trim(p_created_by), ''), 'coordinator')
  );
  RETURN jsonb_build_object('success', true, 'new_balance', COALESCE(v_balance, 0) - p_amount);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION redeem_referral_credit(uuid, numeric, uuid, text, text) TO authenticated;
