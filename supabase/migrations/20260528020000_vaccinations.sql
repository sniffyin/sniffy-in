/*
  # Vaccinations — Phase 6c (health records + outreach DSL extension)
  ====================================================================

  Purpose
  -------
  Track per-pet vaccination records (rabies, DHPP, FVRCP, etc.) and let
  the existing Phase 3 outreach engine fire reminders 14 days before
  and on the day the next dose is due.

  Tables
  ------
  vaccine_types          — seed list of vaccines, species-scoped.
  pet_vaccinations       — one row per administered dose, with due_on.

  Outreach DSL extension
  ----------------------
  New rule kind: `vaccine_due:N`  (N = days before due_on; 0 = on day)
  enqueue_outreach() picks customer ids whose active pets have a
  pet_vaccinations row with due_on = today + N.
  render_outreach_body() supports new placeholders:
    {{vaccine_pet_name}}, {{vaccine_type}}, {{vaccine_due_date}},
    {{days_to_due}}

  Cooldown
  --------
  Templates get a 30-day cooldown so a customer with multiple pets
  doesn't get spammed.  Per-template per-customer cooldown is enforced
  by the existing outreach machinery.

  Indexes
  -------
  Functional index on (pet_id, due_on) keeps the daily queue fast.
*/

-- ─────────────────────────────────────────────────────────────────────
-- 1. vaccine_types (seed list)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vaccine_types (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key                       text UNIQUE NOT NULL,
  label                     text NOT NULL,
  species                   text NOT NULL CHECK (species IN ('dog','cat','both')),
  -- Default cadence in months.  Coordinator can override per record.
  typical_interval_months   smallint NOT NULL DEFAULT 12,
  description               text,
  sort_order                smallint NOT NULL DEFAULT 100,
  is_active                 boolean NOT NULL DEFAULT true,
  created_at                timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vaccine_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vaccine_types: read all"  ON vaccine_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "vaccine_types: admin write" ON vaccine_types FOR ALL  TO authenticated USING (true) WITH CHECK (true);

INSERT INTO vaccine_types (key, label, species, typical_interval_months, description, sort_order) VALUES
  ('rabies',           'Rabies',                                'both', 12, 'Mandatory annual core vaccine.', 10),
  ('dhpp',             'DHPP (Distemper / Hepatitis / Parvo / Parainfluenza)', 'dog',  12, 'Core dog vaccine.',              20),
  ('bordetella',       'Bordetella (Kennel cough)',             'dog',   6, 'Recommended for boarders / social dogs.', 30),
  ('leptospirosis',    'Leptospirosis',                          'dog', 12, 'Recommended in monsoon-heavy regions.', 40),
  ('canine_influenza', 'Canine Influenza (CIV)',                 'dog', 12, 'Annual flu booster.',              50),
  ('lyme',             'Lyme disease',                           'dog', 12, 'Optional, region-dependent.',     60),
  ('fvrcp',            'FVRCP (Feline Viral Rhino. / Calici. / Panleukopenia)', 'cat', 12, 'Core cat vaccine.', 70),
  ('felv',             'FeLV (Feline Leukemia)',                 'cat', 12, 'Recommended for outdoor cats.',     80),
  ('deworming',        'Deworming',                              'both', 3, 'Quarterly deworming dose.',         90),
  ('flea_tick',        'Flea & tick preventative',               'both', 1, 'Monthly preventative.',           100)
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- 2. pet_vaccinations
-- ─────────────────────────────────────────────────────────────────────
-- One row per administered dose.  When recording a vaccine, the
-- coordinator (or customer via portal) enters administered_on; due_on
-- defaults to administered_on + typical_interval_months but can be
-- overridden.

CREATE TABLE IF NOT EXISTS pet_vaccinations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id            uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vaccine_type_id   uuid NOT NULL REFERENCES vaccine_types(id) ON DELETE RESTRICT,
  administered_on   date NOT NULL,
  due_on            date,
  veterinarian     text,
  notes            text,
  created_by       text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pet_vaccinations_pet     ON pet_vaccinations (pet_id, administered_on DESC);
CREATE INDEX IF NOT EXISTS idx_pet_vaccinations_due     ON pet_vaccinations (due_on) WHERE due_on IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pet_vaccinations_type    ON pet_vaccinations (vaccine_type_id);

-- updated_at touch trigger
CREATE OR REPLACE FUNCTION touch_pet_vaccination_updated()
RETURNS trigger AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pet_vaccinations_touch ON pet_vaccinations;
CREATE TRIGGER trg_pet_vaccinations_touch
  BEFORE UPDATE ON pet_vaccinations
  FOR EACH ROW EXECUTE FUNCTION touch_pet_vaccination_updated();

-- Auto-default due_on when caller didn't specify.
CREATE OR REPLACE FUNCTION default_pet_vaccination_due_on()
RETURNS trigger AS $$
DECLARE
  v_months smallint;
BEGIN
  IF NEW.due_on IS NULL THEN
    SELECT typical_interval_months INTO v_months FROM vaccine_types WHERE id = NEW.vaccine_type_id;
    IF v_months IS NOT NULL AND v_months > 0 THEN
      NEW.due_on := (NEW.administered_on + (v_months || ' months')::interval)::date;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pet_vaccinations_default_due ON pet_vaccinations;
CREATE TRIGGER trg_pet_vaccinations_default_due
  BEFORE INSERT ON pet_vaccinations
  FOR EACH ROW EXECUTE FUNCTION default_pet_vaccination_due_on();

ALTER TABLE pet_vaccinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pet_vacc: authenticated read"  ON pet_vaccinations FOR SELECT TO authenticated USING (true);
CREATE POLICY "pet_vacc: authenticated write" ON pet_vaccinations FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- Customer-scope: read/write vaccinations for pets they own.
CREATE POLICY "pet_vacc: customer self read"
  ON pet_vaccinations FOR SELECT TO authenticated
  USING (pet_id IN (SELECT id FROM pets WHERE customer_id = current_customer_id()));

CREATE POLICY "pet_vacc: customer self write"
  ON pet_vaccinations FOR ALL TO authenticated
  USING (pet_id IN (SELECT id FROM pets WHERE customer_id = current_customer_id()))
  WITH CHECK (pet_id IN (SELECT id FROM pets WHERE customer_id = current_customer_id()));

-- ─────────────────────────────────────────────────────────────────────
-- 3. Convenience view: pets with their NEXT due vaccination
-- ─────────────────────────────────────────────────────────────────────
-- One row per pet, pointing at the earliest upcoming due_on (or NULL
-- if none).  Useful for the admin "vaccinations due soon" widget.

CREATE OR REPLACE VIEW pet_next_vaccination_due AS
SELECT DISTINCT ON (p.id)
  p.id              AS pet_id,
  p.customer_id     AS customer_id,
  pv.id             AS pet_vaccination_id,
  pv.vaccine_type_id,
  vt.label          AS vaccine_label,
  pv.due_on         AS due_on,
  (pv.due_on - CURRENT_DATE) AS days_to_due
FROM pets p
LEFT JOIN pet_vaccinations pv ON pv.pet_id = p.id AND pv.due_on IS NOT NULL AND pv.due_on >= CURRENT_DATE
LEFT JOIN vaccine_types vt    ON vt.id = pv.vaccine_type_id
WHERE p.is_active = true
ORDER BY p.id, pv.due_on ASC NULLS LAST;

GRANT SELECT ON pet_next_vaccination_due TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 4. render_outreach_body() — add vaccine placeholders
-- ─────────────────────────────────────────────────────────────────────
-- REPLACES Phase 5's version.  Adds the vaccine branch alongside
-- existing pet_birthday handling.  Same signature.

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

  -- Vaccine-rule locals
  v_vacc_row  record;
BEGIN
  SELECT * INTO v_template FROM outreach_templates WHERE key = p_template_key;
  IF v_template.id IS NULL THEN RETURN NULL; END IF;
  v_body := v_template.body_template;

  SELECT * INTO v_customer FROM customers WHERE id = p_customer_id;
  IF v_customer.id IS NULL THEN RETURN v_body; END IF;

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

  v_rule_kind := split_part(v_template.trigger_rule, ':', 1);
  v_rule_arg  := COALESCE(NULLIF(split_part(v_template.trigger_rule, ':', 2), ''), '0')::int;

  -- Birthday placeholders (Phase 5)
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

  -- Vaccine placeholders (Phase 6c)
  IF v_rule_kind = 'vaccine_due' THEN
    v_target_date := CURRENT_DATE + v_rule_arg;
    SELECT
      p.name           AS pet_name,
      vt.label         AS vaccine_label,
      pv.due_on        AS due_on
    INTO v_vacc_row
    FROM pet_vaccinations pv
    JOIN pets p          ON p.id = pv.pet_id
    JOIN vaccine_types vt ON vt.id = pv.vaccine_type_id
    WHERE p.customer_id = p_customer_id
      AND p.is_active = true
      AND pv.due_on = v_target_date
    ORDER BY pv.due_on ASC, p.created_at ASC
    LIMIT 1;

    IF v_vacc_row.pet_name IS NOT NULL THEN
      v_body := replace(v_body, '{{vaccine_pet_name}}',  v_vacc_row.pet_name);
      v_body := replace(v_body, '{{vaccine_type}}',      v_vacc_row.vaccine_label);
      v_body := replace(v_body, '{{vaccine_due_date}}',  to_char(v_vacc_row.due_on, 'DD-Mon-YYYY'));
    ELSE
      v_body := replace(v_body, '{{vaccine_pet_name}}',  v_pet_name);
      v_body := replace(v_body, '{{vaccine_type}}',      'vaccine');
      v_body := replace(v_body, '{{vaccine_due_date}}',  to_char(v_target_date, 'DD-Mon-YYYY'));
    END IF;

    IF v_rule_arg = 0 THEN
      v_body := replace(v_body, '{{days_to_due}}', 'today');
    ELSE
      v_body := replace(v_body, '{{days_to_due}}', v_rule_arg::text);
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
-- 5. enqueue_outreach() — add vaccine_due rule kind
-- ─────────────────────────────────────────────────────────────────────
-- REPLACES Phase 5's version.  Same branches plus a new vaccine_due
-- branch that picks customers with at least one active pet whose
-- vaccination is due in exactly `N` days.

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

    ELSIF v_rule_kind = 'vaccine_due' THEN
      v_target_date := CURRENT_DATE + v_rule_arg;
      SELECT array_agg(DISTINCT p.customer_id) INTO v_customer_ids
      FROM pet_vaccinations pv
      JOIN pets p          ON p.id = pv.pet_id
      JOIN customers c     ON c.id = p.customer_id
      WHERE p.is_active = true
        AND pv.due_on = v_target_date
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
-- 6. Seed vaccine outreach templates
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO outreach_templates (key, label, body_template, cooldown_days, trigger_rule)
VALUES
  (
    'vaccine_due_advance',
    'Vaccine due — 14 days ahead',
    E'Hi {{customer_name}}! 💉 {{vaccine_pet_name}}''s {{vaccine_type}} booster is due on {{vaccine_due_date}} (in {{days_to_due}} days). Want us to coordinate with your vet? Reply YES.',
    30,
    'vaccine_due:14'
  ),
  (
    'vaccine_due_today',
    'Vaccine due — on the day',
    E'Reminder, {{customer_name}}: {{vaccine_pet_name}}''s {{vaccine_type}} booster is due today ({{vaccine_due_date}}). Please make sure to get it administered. 🐾',
    30,
    'vaccine_due:0'
  )
ON CONFLICT (key) DO NOTHING;
