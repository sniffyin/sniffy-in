/*
  # Sniffy Incentive — Single Source of Truth (Phase 6, post-launch)
  ==================================================================

  Goal
  ----
  Make the database agree with `src/pages/groomer/incentivesApi.ts` on
  exactly what an "earned" incentive is, and remove the legacy per-pet
  fields that were created in 20260528 but never adopted by the app.

  The Sniffy incentive policy has exactly two bonuses, each driven by
  one canonical boolean toggle that's visible/editable in the
  coordinator's SessionFormModal:

      • ON-TIME BONUS   ₹25 per session
          payable when:  groomer_on_time = true

      • REVIEW BONUS    ₹40 per session
          payable when:  review_taken = true AND client_rating = 5

  How the toggle gets set
  -----------------------
  1. Groomer claims the bonus from their app (selfie upload for arrival,
     review proof upload for review).  This sets `*_claim_status` =
     'pending'.  Canonical toggle stays whatever it was.
  2. Coordinator approves the claim via the Approvals rail.
     This sets `*_claim_status` = 'approved' AND flips the canonical
     toggle on.  Rejection sets it to 'rejected' and flips canonical
     off.
  3. Coordinator can override at any time by toggling the canonical
     field directly in SessionFormModal — that change wins, even
     against a later sync trigger fire.

  Defensive trigger (this file)
  -----------------------------
  `sessionMilestonesApi.ts` already syncs the canonical fields when
  approving/rejecting via the app.  The trigger below provides
  defence-in-depth so the canonical stays in sync even when a write
  bypasses the app (SQL editor, future webhook, fix-up scripts).

  The trigger fires only when the workflow status column changed AND
  the caller did NOT also touch the canonical toggle in the same
  UPDATE — preserving the "coordinator override always wins" rule.

  Bonus amounts (25 / 40) are hardcoded in `compute_payroll_entry()`
  to match `ON_TIME_BONUS` / `REVIEW_BONUS` in
  `src/pages/groomer/incentivesApi.ts`.  Change BOTH if you ever need
  to bump them.

  This migration is idempotent — re-running it is safe.
*/

-- ─────────────────────────────────────────────────────────────────────
-- 1. Drop legacy per-pet incentive columns from both payroll tables
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE groomer_compensation
  DROP COLUMN IF EXISTS per_dog_incentive,
  DROP COLUMN IF EXISTS per_cat_incentive,
  DROP COLUMN IF EXISTS per_session_flat_incentive;

ALTER TABLE payroll_entries
  DROP COLUMN IF EXISTS per_dog_incentive,
  DROP COLUMN IF EXISTS per_cat_incentive,
  DROP COLUMN IF EXISTS per_session_flat_incentive;

-- ─────────────────────────────────────────────────────────────────────
-- 2. Defensive sync trigger — claim status → canonical toggle.
--    Covers BOTH the arrival side (groomer_on_time) and the review side
--    (review_taken + client_rating).
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sync_incentive_canonical_from_claim()
RETURNS TRIGGER AS $$
BEGIN
  -- ── ARRIVAL: arrival_bonus_status → groomer_on_time ──
  IF TG_OP = 'INSERT' THEN
    -- On INSERT we sync unless the caller already pinned the canonical.
    IF NEW.arrival_bonus_status = 'approved' AND NEW.groomer_on_time IS NOT TRUE THEN
      NEW.groomer_on_time := true;
    ELSIF NEW.arrival_bonus_status = 'rejected' AND NEW.groomer_on_time IS NOT FALSE THEN
      NEW.groomer_on_time := false;
    END IF;
  ELSIF TG_OP = 'UPDATE'
        AND NEW.arrival_bonus_status IS DISTINCT FROM OLD.arrival_bonus_status
        AND NEW.groomer_on_time IS NOT DISTINCT FROM OLD.groomer_on_time THEN
    -- Only sync if the workflow status changed AND the canonical wasn't
    -- also touched in this UPDATE (coordinator override wins).
    IF NEW.arrival_bonus_status = 'approved' THEN
      NEW.groomer_on_time := true;
    ELSIF NEW.arrival_bonus_status = 'rejected' THEN
      NEW.groomer_on_time := false;
    END IF;
    -- 'pending' / 'none' → leave canonical alone.  Canonical only flips
    -- on a definitive coordinator decision.
  END IF;

  -- ── REVIEW: review_claim_status → review_taken / client_rating ──
  IF TG_OP = 'INSERT' THEN
    IF NEW.review_claim_status = 'approved'
       AND COALESCE(NEW.review_claim_rating, 0) = 5
       AND NEW.review_taken IS NOT TRUE THEN
      NEW.review_taken := true;
      IF NEW.client_rating IS NULL THEN
        NEW.client_rating := 5;
      END IF;
    ELSIF NEW.review_claim_status = 'rejected'
          AND NEW.review_taken IS NOT FALSE THEN
      NEW.review_taken := false;
    END IF;
  ELSIF TG_OP = 'UPDATE'
        AND NEW.review_claim_status IS DISTINCT FROM OLD.review_claim_status
        AND NEW.review_taken IS NOT DISTINCT FROM OLD.review_taken THEN
    IF NEW.review_claim_status = 'approved'
       AND COALESCE(NEW.review_claim_rating, 0) = 5 THEN
      NEW.review_taken := true;
      -- client_rating only auto-set when coordinator hasn't changed it
      -- in this update — they may want to keep a non-5 historical rating.
      IF NEW.client_rating IS NOT DISTINCT FROM OLD.client_rating
         AND COALESCE(NEW.client_rating, 0) <> 5 THEN
        NEW.client_rating := 5;
      END IF;
    ELSIF NEW.review_claim_status = 'rejected' THEN
      NEW.review_taken := false;
      -- client_rating preserved as audit history.
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_incentive_canonical ON grooming_sessions;
CREATE TRIGGER trg_sync_incentive_canonical
  BEFORE INSERT OR UPDATE ON grooming_sessions
  FOR EACH ROW EXECUTE FUNCTION sync_incentive_canonical_from_claim();

-- ─────────────────────────────────────────────────────────────────────
-- 3. Backfill canonical toggles from prior claim outcomes
-- ─────────────────────────────────────────────────────────────────────
-- Bring existing rows into a consistent state.  We ONLY sync from
-- definitive workflow outcomes ('approved' / 'rejected') — 'pending'
-- and 'none' rows are left alone.
--
-- Note: pre-migration, `markArrived` was eagerly setting
-- `groomer_on_time = true` for in-window arrivals BEFORE coordinator
-- approval.  Those rows are likely status='pending' with groomer_on_time
-- = true today.  We zero them out here so canonical only means "earned",
-- never "claimed" — coordinator can re-approve via the Approvals rail
-- to flip them back to true.

UPDATE grooming_sessions
   SET groomer_on_time = true
 WHERE arrival_bonus_status = 'approved'
   AND COALESCE(groomer_on_time, false) = false;

UPDATE grooming_sessions
   SET groomer_on_time = false
 WHERE arrival_bonus_status IN ('rejected', 'pending', 'none')
   AND COALESCE(groomer_on_time, false) = true;

UPDATE grooming_sessions
   SET review_taken  = true,
       client_rating = COALESCE(client_rating, 5)
 WHERE review_claim_status = 'approved'
   AND COALESCE(review_claim_rating, 0) = 5
   AND COALESCE(review_taken, false) = false;

UPDATE grooming_sessions
   SET review_taken = false
 WHERE review_claim_status = 'rejected'
   AND COALESCE(review_taken, false) = true;

-- ─────────────────────────────────────────────────────────────────────
-- 4. compute_payroll_entry() — uses the canonical toggles directly.
--    Mirrors src/pages/groomer/incentivesApi.ts.
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION compute_payroll_entry(p_entry_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_entry        payroll_entries%ROWTYPE;
  v_run          payroll_runs%ROWTYPE;
  v_comp         groomer_compensation%ROWTYPE;
  v_start        date;
  v_end          date;
  v_present      int := 0;
  v_paid_lv      int := 0;
  v_lwp          int := 0;
  v_dog          int := 0;
  v_cat          int := 0;
  v_ontime_count int := 0;
  v_review_count int := 0;
  v_payable      int;
  v_basic_e      numeric(10,2);
  v_hra_e        numeric(10,2);
  v_conv_e       numeric(10,2);
  v_med_e        numeric(10,2);
  v_spec_e       numeric(10,2);
  v_other_e      numeric(10,2);
  v_inc_ontime   numeric(10,2);
  v_inc_review   numeric(10,2);
  v_inc          numeric(10,2);
  v_gross        numeric(10,2);
  v_pf_e         numeric(10,2);
  v_pf_er        numeric(10,2);
  v_esi          numeric(10,2);
  v_pt           numeric(10,2);
  v_tds          numeric(10,2);
  v_total_d      numeric(10,2);
  v_net          numeric(10,2);
  v_ratio        numeric(10,6);
BEGIN
  SELECT * INTO v_entry FROM payroll_entries WHERE id = p_entry_id;
  IF v_entry.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'entry_not_found');
  END IF;
  IF v_entry.status = 'locked' THEN
    RETURN jsonb_build_object('success', false, 'error', 'entry_locked');
  END IF;

  SELECT * INTO v_run FROM payroll_runs WHERE id = v_entry.run_id;
  IF v_run.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'run_not_found');
  END IF;

  -- groomer_compensation.groomer_id is text; cast defensively
  SELECT * INTO v_comp FROM groomer_compensation
   WHERE groomer_id::text = v_entry.groomer_id::text;

  -- Period bounds
  v_start := make_date(v_run.period_year, v_run.period_month, 1);
  v_end   := (v_start + interval '1 month' - interval '1 day')::date;

  -- Present days: distinct dates with at least one completed session
  SELECT COUNT(DISTINCT session_date) INTO v_present
  FROM grooming_sessions
  WHERE groomer_id::text = v_entry.groomer_id::text
    AND status = 'completed'
    AND session_date BETWEEN v_start AND v_end;

  -- Session counts (dog / cat) — activity context on the slip, NOT money
  SELECT
    COUNT(*) FILTER (WHERE pet_type = 'dog'),
    COUNT(*) FILTER (WHERE pet_type = 'cat')
  INTO v_dog, v_cat
  FROM grooming_sessions
  WHERE groomer_id::text = v_entry.groomer_id::text
    AND status = 'completed'
    AND session_date BETWEEN v_start AND v_end;

  -- ── Bonus counts — the canonical toggles are the only source ──
  -- Mirrors src/pages/groomer/incentivesApi.ts:computeSessionIncentive
  SELECT
    COUNT(*) FILTER (WHERE groomer_on_time = true),
    COUNT(*) FILTER (WHERE review_taken = true AND client_rating = 5)
  INTO v_ontime_count, v_review_count
  FROM grooming_sessions
  WHERE groomer_id::text = v_entry.groomer_id::text
    AND status = 'completed'
    AND session_date BETWEEN v_start AND v_end;

  -- Approved + LWP leaves within the period
  SELECT
    COUNT(*) FILTER (WHERE status = 'approved'),
    COUNT(*) FILTER (WHERE status = 'lwp')
  INTO v_paid_lv, v_lwp
  FROM groomer_leaves
  WHERE groomer_id::text = v_entry.groomer_id::text
    AND leave_date BETWEEN v_start AND v_end;

  v_payable := v_present + v_paid_lv;
  IF v_payable > v_entry.working_days THEN
    v_payable := v_entry.working_days;
  END IF;

  v_ratio := CASE WHEN v_entry.working_days > 0
                  THEN LEAST(v_payable::numeric / v_entry.working_days, 1)
                  ELSE 0
             END;

  v_basic_e := COALESCE(v_comp.basic_monthly,             v_entry.basic_monthly)             * v_ratio;
  v_hra_e   := COALESCE(v_comp.hra_monthly,               v_entry.hra_monthly)               * v_ratio;
  v_conv_e  := COALESCE(v_comp.conveyance_monthly,        v_entry.conveyance_monthly)        * v_ratio;
  v_med_e   := COALESCE(v_comp.medical_monthly,           v_entry.medical_monthly)           * v_ratio;
  v_spec_e  := COALESCE(v_comp.special_allowance_monthly, v_entry.special_allowance_monthly) * v_ratio;
  v_other_e := COALESCE(v_comp.other_allowance_monthly,   v_entry.other_allowance_monthly)   * v_ratio;

  -- Incentive — not pro-rated; per actual earned session.
  -- Constants MUST match src/pages/groomer/incentivesApi.ts.
  v_inc_ontime := v_ontime_count * 25;
  v_inc_review := v_review_count * 40;
  v_inc        := v_inc_ontime + v_inc_review;

  v_gross := v_basic_e + v_hra_e + v_conv_e + v_med_e + v_spec_e + v_other_e + v_inc;

  IF COALESCE(v_comp.pf_enabled, false) THEN
    v_pf_e  := LEAST(v_basic_e * COALESCE(v_comp.pf_employee_pct, 12) / 100,
                     COALESCE(v_comp.pf_cap, 1800));
    v_pf_er := LEAST(v_basic_e * COALESCE(v_comp.pf_employee_pct, 12) / 100,
                     COALESCE(v_comp.pf_cap, 1800));
  ELSE
    v_pf_e := 0; v_pf_er := 0;
  END IF;

  IF COALESCE(v_comp.esi_enabled, false) AND v_gross < COALESCE(v_comp.esi_gross_ceiling, 21000) THEN
    v_esi := round(v_gross * COALESCE(v_comp.esi_employee_pct, 0.75) / 100, 2);
  ELSE
    v_esi := 0;
  END IF;

  v_pt  := CASE WHEN COALESCE(v_comp.pt_enabled,  false) THEN COALESCE(v_comp.pt_amount,  0)  ELSE 0 END;
  v_tds := CASE WHEN COALESCE(v_comp.tds_enabled, false) THEN COALESCE(v_comp.tds_monthly, 0) ELSE 0 END;

  v_gross := v_gross + v_entry.earnings_bonus + v_entry.earnings_arrear + v_entry.earnings_other_custom;

  v_total_d := v_pf_e + v_esi + v_pt + v_tds + v_entry.deductions_advance + v_entry.deductions_other;
  v_net     := v_gross - v_total_d;

  UPDATE payroll_entries SET
    basic_monthly             = COALESCE(v_comp.basic_monthly,             basic_monthly),
    hra_monthly               = COALESCE(v_comp.hra_monthly,               hra_monthly),
    conveyance_monthly        = COALESCE(v_comp.conveyance_monthly,        conveyance_monthly),
    medical_monthly           = COALESCE(v_comp.medical_monthly,           medical_monthly),
    special_allowance_monthly = COALESCE(v_comp.special_allowance_monthly, special_allowance_monthly),
    other_allowance_label     = COALESCE(v_comp.other_allowance_label,     other_allowance_label),
    other_allowance_monthly   = COALESCE(v_comp.other_allowance_monthly,   other_allowance_monthly),

    present_days              = v_present,
    paid_leave_days           = v_paid_lv,
    lwp_days                  = v_lwp,
    payable_days              = v_payable,
    sessions_dog_count        = v_dog,
    sessions_cat_count        = v_cat,
    sessions_total_count      = v_dog + v_cat,

    earnings_basic            = round(v_basic_e, 2),
    earnings_hra              = round(v_hra_e, 2),
    earnings_conveyance       = round(v_conv_e, 2),
    earnings_medical          = round(v_med_e, 2),
    earnings_special          = round(v_spec_e, 2),
    earnings_other            = round(v_other_e, 2),
    earnings_incentive        = round(v_inc, 2),
    gross_earnings            = round(v_gross, 2),

    deductions_pf             = round(v_pf_e, 2),
    deductions_pf_employer    = round(v_pf_er, 2),
    deductions_esi            = round(v_esi, 2),
    deductions_pt             = round(v_pt, 2),
    deductions_tds            = round(v_tds, 2),
    total_deductions          = round(v_total_d, 2),
    net_pay                   = round(v_net, 2),
    net_pay_in_words          = amount_in_words(round(v_net, 0)),

    designation               = COALESCE(v_comp.designation,       designation),
    employee_code             = COALESCE(v_comp.employee_code,     employee_code),
    pan                       = COALESCE(v_comp.pan,               pan),
    uan                       = COALESCE(v_comp.uan,               uan),
    esic_number               = COALESCE(v_comp.esic_number,       esic_number),
    bank_name                 = COALESCE(v_comp.bank_name,         bank_name),
    bank_account              = COALESCE(v_comp.bank_account,      bank_account),
    bank_ifsc                 = COALESCE(v_comp.bank_ifsc,         bank_ifsc),
    date_of_joining           = COALESCE(v_comp.date_of_joining,   date_of_joining)
  WHERE id = p_entry_id;

  RETURN jsonb_build_object(
    'success',          true,
    'entry_id',         p_entry_id,
    'net_pay',          round(v_net, 2),
    'incentive_ontime', round(v_inc_ontime, 2),
    'incentive_review', round(v_inc_review, 2),
    'ontime_count',     v_ontime_count,
    'review_count',     v_review_count
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION compute_payroll_entry(uuid) TO authenticated, anon;

-- ─────────────────────────────────────────────────────────────────────
-- 5. enqueue_payroll_run() — INSERT no longer references dropped cols
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION enqueue_payroll_run(p_run_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_run      payroll_runs%ROWTYPE;
  v_count    int := 0;
  v_comp     groomer_compensation%ROWTYPE;
  v_groomer  record;
  v_entry_id uuid;
BEGIN
  SELECT * INTO v_run FROM payroll_runs WHERE id = p_run_id;
  IF v_run.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'run_not_found');
  END IF;
  IF v_run.status = 'finalised' THEN
    RETURN jsonb_build_object('success', false, 'error', 'run_already_finalised');
  END IF;

  FOR v_groomer IN
    SELECT id::text AS groomer_id, name
    FROM groomers
    WHERE status = 'active' OR status IS NULL
  LOOP
    IF EXISTS (
      SELECT 1 FROM payroll_entries
      WHERE run_id = p_run_id AND groomer_id = v_groomer.groomer_id
    ) THEN CONTINUE; END IF;

    SELECT * INTO v_comp FROM groomer_compensation WHERE groomer_id = v_groomer.groomer_id;

    INSERT INTO payroll_entries (
      run_id, groomer_id, groomer_name,
      basic_monthly, hra_monthly, conveyance_monthly, medical_monthly,
      special_allowance_monthly, other_allowance_label, other_allowance_monthly,
      working_days,
      designation, employee_code, pan, uan, esic_number,
      bank_name, bank_account, bank_ifsc, date_of_joining
    ) VALUES (
      p_run_id, v_groomer.groomer_id, v_groomer.name,
      COALESCE(v_comp.basic_monthly, 0),
      COALESCE(v_comp.hra_monthly, 0),
      COALESCE(v_comp.conveyance_monthly, 0),
      COALESCE(v_comp.medical_monthly, 0),
      COALESCE(v_comp.special_allowance_monthly, 0),
      v_comp.other_allowance_label,
      COALESCE(v_comp.other_allowance_monthly, 0),
      v_run.working_days_basis,
      v_comp.designation, v_comp.employee_code, v_comp.pan, v_comp.uan, v_comp.esic_number,
      v_comp.bank_name, v_comp.bank_account, v_comp.bank_ifsc, v_comp.date_of_joining
    )
    RETURNING id INTO v_entry_id;

    PERFORM compute_payroll_entry(v_entry_id);
    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'seeded', v_count);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION enqueue_payroll_run(uuid) TO authenticated, anon;
