/*
  # Phase 3 — Outreach automation foundation
  ==========================================

  Purpose
  -------
  Turn the customer master into an active re-engagement engine.  This
  migration adds:

    • `outreach_templates` — message templates with cadence rules
      (which lifecycle bucket triggers it, cooldown between sends, etc).
    • `outreach_log` — every queued / sent / skipped reminder is a row
      here.  Source of truth for "what did we send Rohan, and when".
    • Two new `customers` columns:
        - `outreach_paused_until`  — snooze date
        - `last_outreach_at`       — convenience field for UI
        - `last_outreach_template` — convenience field for UI
    • SQL functions:
        - `recompute_all_lifecycles()` — daily lifecycle stage refresh
          for every customer.  Phase 1's per-row trigger handles writes;
          this catches time-based transitions (active → lapsed) that no
          row write would otherwise trigger.
        - `render_outreach_body(template_key, customer_id)` — fills
          {{placeholders}} in a template with that customer's data.
        - `enqueue_outreach()` — scans active templates, finds matching
          customers, inserts 'queued' rows.  Respects cooldown,
          snoozes, opt-out.
        - `mark_outreach_sent(log_id, sent_by)` — coordinator clicked
          the wa.me link; flip the log row to 'sent' and update the
          customer's last_outreach_at.
        - `run_daily_outreach()` — wrapper that runs recompute then
          enqueue.  Single entry point for pg_cron.
    • pg_cron daily schedule.  If pg_cron isn't enabled in this
      database, the CREATE EXTENSION line is a no-op (already exists)
      or the user enables it once via Supabase Studio → Database →
      Extensions → pg_cron.  Either way, the cron.schedule call is
      guarded with a NOTICE so the migration applies regardless.

  Phase 3 ships with click-to-send delivery only — wa.me links opened
  by the coordinator.  The `channel` and `sent_by` columns are
  structured so a future API-sender adapter slots in without schema
  changes.

  Templates seeded:
    • lapsed_60   — sent once when customer becomes 'lapsed'
                    (60-180 days since last session)
    • lapsed_120  — sent once when customer hits ~120d, before churn
    • churned_180 — sent once on entering 'churned' (>180d)
    • follow_up_due — sent when grooming_sessions.next_due_date is today
                      (a different driver than lifecycle — handled in
                      the enqueue function below)

  Post-session thank-you and birthday wishes are explicitly OUT of
  scope here.  Thank-you needs a "session completed N hours ago"
  trigger; birthdays need pet DOB (Phase 5).
*/

-- ─────────────────────────────────────────────────────────────────────
-- 1. outreach_templates
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS outreach_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  label       text NOT NULL,
  -- Body supports these placeholders, replaced by render_outreach_body():
  --   {{customer_name}}
  --   {{pet_name}}         — first pet on the customer (or 'your pet')
  --   {{days_since}}       — days since last_session_at
  --   {{next_due_date}}    — formatted DD-Mon-YYYY for follow-up template
  --   {{last_package}}     — most recent grooming_sessions.package
  body_template  text NOT NULL,
  -- Cadence
  cooldown_days  integer NOT NULL DEFAULT 30,    -- min gap before re-sending same template to same customer
  channel        text NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp','sms','email')),
  is_active      boolean NOT NULL DEFAULT true,
  -- Trigger rule — a small DSL captured as text so the UI can show it
  -- and so enqueue_outreach can branch on it.
  --   'lapsed_min_days:60'  → customer.lifecycle_stage='lapsed' AND days_since >= 60
  --   'lapsed_min_days:120' → days_since >= 120 (still lapsed bucket)
  --   'churned'             → lifecycle_stage='churned'
  --   'follow_up_due:0'     → grooming_sessions.next_due_date = today
  trigger_rule   text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outreach_templates_active ON outreach_templates (is_active) WHERE is_active = true;

ALTER TABLE outreach_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "outreach_templates: authenticated read"
  ON outreach_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "outreach_templates: authenticated write"
  ON outreach_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS trg_outreach_templates_touch ON outreach_templates;
CREATE TRIGGER trg_outreach_templates_touch
  BEFORE UPDATE ON outreach_templates
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 2. outreach_log
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS outreach_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  template_key  text NOT NULL,        -- FK-by-convention to outreach_templates.key
  channel       text NOT NULL DEFAULT 'whatsapp',
  status        text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','skipped','failed')),
  skip_reason   text,                 -- e.g. 'cooldown', 'snoozed', 'opted_out'
  -- Rendered message body — captured at enqueue time so later UI shows
  -- what was actually queued, even if the template was later edited.
  message_body  text,
  queued_at     timestamptz NOT NULL DEFAULT now(),
  sent_at       timestamptz,
  sent_by       text,                 -- coordinator id / name (free text for now)
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outreach_log_customer
  ON outreach_log (customer_id, queued_at DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_log_status
  ON outreach_log (status, queued_at DESC) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_outreach_log_template
  ON outreach_log (template_key, customer_id, queued_at DESC);

ALTER TABLE outreach_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "outreach_log: authenticated read"
  ON outreach_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "outreach_log: authenticated write"
  ON outreach_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────
-- 3. customers: outreach pause + last-outreach convenience fields
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS outreach_paused_until   date,
  ADD COLUMN IF NOT EXISTS last_outreach_at        timestamptz,
  ADD COLUMN IF NOT EXISTS last_outreach_template  text;

CREATE INDEX IF NOT EXISTS idx_customers_outreach_paused
  ON customers (outreach_paused_until) WHERE outreach_paused_until IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────
-- 4. Helpers
-- ─────────────────────────────────────────────────────────────────────

-- Render template body with {{placeholders}} replaced for one customer.
-- Returns NULL when the template doesn't exist (defensive — should
-- never happen, since enqueue resolves templates first).
CREATE OR REPLACE FUNCTION render_outreach_body(p_template_key text, p_customer_id uuid)
RETURNS text AS $$
DECLARE
  v_body     text;
  v_customer customers%ROWTYPE;
  v_pet_name text;
  v_days     int;
  v_next_due date;
  v_last_pkg text;
BEGIN
  SELECT body_template INTO v_body FROM outreach_templates WHERE key = p_template_key;
  IF v_body IS NULL THEN RETURN NULL; END IF;

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

  -- Latest session details for the follow-up template.
  SELECT next_due_date, package INTO v_next_due, v_last_pkg
  FROM grooming_sessions
  WHERE customer_id = p_customer_id
  ORDER BY session_date DESC LIMIT 1;

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

-- Daily lifecycle refresh.  Phase 1's per-row trigger handles writes;
-- this catches "active → lapsed" which happens just by time passing.
CREATE OR REPLACE FUNCTION recompute_all_lifecycles()
RETURNS integer AS $$
DECLARE
  v_count integer := 0;
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM customers LOOP
    PERFORM recompute_customer_aggregates(r.id);
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────
-- 5. enqueue_outreach()
-- ─────────────────────────────────────────────────────────────────────
-- Scans every active template, finds matching customers, inserts
-- 'queued' rows.  Idempotent: re-running on the same day won't
-- duplicate queue rows (cooldown filter handles it).

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
BEGIN
  FOR v_template IN SELECT * FROM outreach_templates WHERE is_active = true LOOP
    -- Parse the small DSL: 'lapsed_min_days:60' → ('lapsed_min_days', 60)
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
      -- Driven by grooming_sessions.next_due_date, not lifecycle.
      -- Day-window in days from today (0 = today, 3 = within 3 days, etc.)
      SELECT array_agg(DISTINCT s.customer_id) INTO v_customer_ids
      FROM grooming_sessions s
      JOIN customers c ON c.id = s.customer_id
      WHERE s.next_due_date IS NOT NULL
        AND s.next_due_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + v_rule_arg)
        AND c.whatsapp_opt_in = true
        AND (c.outreach_paused_until IS NULL OR c.outreach_paused_until <= CURRENT_DATE);
    ELSE
      CONTINUE;   -- unknown rule, skip
    END IF;

    IF v_customer_ids IS NULL THEN CONTINUE; END IF;

    -- Per-customer cooldown filter + insert.
    FOREACH v_id IN ARRAY v_customer_ids LOOP
      SELECT MAX(sent_at) INTO v_last_sent_at
        FROM outreach_log
        WHERE customer_id = v_id
          AND template_key = v_template.key
          AND status = 'sent';

      IF v_last_sent_at IS NOT NULL
         AND v_last_sent_at > (now() - (v_template.cooldown_days || ' days')::interval) THEN
        CONTINUE;   -- still in cooldown
      END IF;

      -- Skip if we already have an UNSENT queued row for this template+customer.
      -- Avoids piling up duplicates if cron runs more than once a day.
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

-- Coordinator calls this after they click the wa.me link.
CREATE OR REPLACE FUNCTION mark_outreach_sent(p_log_id uuid, p_sent_by text)
RETURNS void AS $$
DECLARE
  v_customer_id uuid;
  v_template    text;
BEGIN
  UPDATE outreach_log SET
    status   = 'sent',
    sent_at  = now(),
    sent_by  = COALESCE(p_sent_by, 'coordinator')
  WHERE id = p_log_id AND status = 'queued'
  RETURNING customer_id, template_key INTO v_customer_id, v_template;

  IF v_customer_id IS NOT NULL THEN
    UPDATE customers SET
      last_outreach_at = now(),
      last_outreach_template = v_template
    WHERE id = v_customer_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION mark_outreach_sent(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION enqueue_outreach() TO authenticated;
GRANT EXECUTE ON FUNCTION recompute_all_lifecycles() TO authenticated;
GRANT EXECUTE ON FUNCTION render_outreach_body(text, uuid) TO authenticated;

-- Single daily entrypoint for pg_cron.  Sequencing matters: recompute
-- lifecycle FIRST so the enqueue's "where lifecycle_stage='lapsed'"
-- filter picks up customers that transitioned overnight.
CREATE OR REPLACE FUNCTION run_daily_outreach()
RETURNS jsonb AS $$
DECLARE
  v_lifecycle_count int;
  v_enqueued        int;
BEGIN
  v_lifecycle_count := recompute_all_lifecycles();
  v_enqueued        := enqueue_outreach();
  RETURN jsonb_build_object(
    'ran_at',           now(),
    'lifecycle_count',  v_lifecycle_count,
    'enqueued',         v_enqueued
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION run_daily_outreach() TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 6. Seed templates
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO outreach_templates (key, label, body_template, cooldown_days, trigger_rule)
VALUES
  (
    'lapsed_60',
    'Lapsed — 60 day reminder',
    E'Hi {{customer_name}}! 🐾 It''s been {{days_since}} days since {{pet_name}}''s last Sniffy grooming. Time for a fresh look? Reply YES and we''ll set it up.',
    45,
    'lapsed_min_days:60'
  ),
  (
    'lapsed_120',
    'Lapsed — 120 day reminder',
    E'We miss you and {{pet_name}}! It''s been over 4 months since your last grooming. Book this week and we''ll throw in a small surprise. 🎁',
    60,
    'lapsed_min_days:120'
  ),
  (
    'churned_180',
    'Churned — re-activation offer',
    E'Hi {{customer_name}}, hope {{pet_name}} is doing well! It''s been a while — would love to have you back. Reply YES for a returning-customer discount.',
    90,
    'churned'
  ),
  (
    'follow_up_due_today',
    'Follow-up due today',
    E'Hi {{customer_name}}! 🐶 {{pet_name}} is due for their next grooming today ({{next_due_date}}). Want to confirm a time?',
    7,
    'follow_up_due:0'
  )
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- 7. pg_cron schedule
-- ─────────────────────────────────────────────────────────────────────
-- IMPORTANT — pg_cron must be enabled in Supabase first:
--   Dashboard → Database → Extensions → pg_cron → Enable
--
-- The DO block below tries to schedule the job; it's wrapped in a
-- block so the migration still applies cleanly even if pg_cron isn't
-- available yet.  Coordinator can run `SELECT run_daily_outreach();`
-- manually any time until cron is wired up.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Unschedule any previous version so re-running this migration
    -- doesn't end up with two copies of the job.
    PERFORM cron.unschedule(jobid)
      FROM cron.job
      WHERE jobname = 'sniffy_daily_outreach';

    -- Run at 08:00 IST = 02:30 UTC every day.  pg_cron expressions are
    -- in UTC.  Times in IST when the coordinator likely opens the
    -- app are when this should already be ready.
    PERFORM cron.schedule(
      'sniffy_daily_outreach',
      '30 2 * * *',
      $cmd$ SELECT run_daily_outreach(); $cmd$
    );
    RAISE NOTICE 'Scheduled sniffy_daily_outreach via pg_cron at 02:30 UTC daily.';
  ELSE
    RAISE NOTICE
      'pg_cron extension is not enabled — the daily outreach job is NOT scheduled. '
      'Enable pg_cron in Supabase Studio → Database → Extensions, then re-run this migration '
      'OR call SELECT run_daily_outreach() manually from the OutreachTab refresh button.';
  END IF;
END $$;
