/*
  # Phase 6 — Payroll & Salary Slips (HRMS-style)
  ================================================

  Purpose
  -------
  Until now coordinators uploaded salary slips as PDFs from outside the
  app.  This migration introduces a proper payroll module:

    • `groomer_compensation`  — per-groomer salary structure (basic, HRA,
                                allowances) + session incentive rates +
                                per-employee statutory toggles (PF, ESI,
                                Professional Tax, TDS).
    • `payroll_runs`          — one row per period (year + month) the
                                coordinator processes.  Status is
                                'draft' until finalised.
    • `payroll_entries`       — one row per groomer per run.  Captures
                                auto-pulled attendance / session counts
                                and the computed earnings / deductions /
                                net pay.  Manual lines (bonus, advance,
                                custom deduction) live as fields on
                                this row, kept inline rather than in a
                                child table to keep editing simple.

  Computation
  -----------
  - Working days = the number of distinct calendar days in the month.
  - Present days = distinct dates the groomer appears on a completed
    grooming_session within the period.
  - Paid leave days = approved groomer_leaves rows with status='approved'
    within the period.
  - LWP days = leaves with status='lwp'.
  - Sessions completed (dog/cat split) = count of completed sessions
    keyed by groomer_id within the period.

  Pro-rated earnings:
    basic_earned = basic_monthly * payable_days / working_days
    Where payable_days = present_days + paid_leave_days.

  Incentive:
    incentive = (per_dog_incentive * dog_count) + (per_cat_incentive * cat_count)
                + (per_session_flat_incentive * (dog_count + cat_count))
    Only the rates set on the compensation row contribute (zero rates =
    nothing added).

  Statutory deductions are toggled per groomer:
    - PF:  if pf_enabled, 12% of basic (capped at pf_cap, default 1800)
           on the EMPLOYEE side.  The slip only shows the employee
           contribution; employer share is recorded for reporting but
           does not affect take-home.
    - ESI: if esi_enabled, 0.75% of gross.  Only applicable when gross
           < 21000.  Coordinator can still override by setting the
           amount manually.
    - PT:  if pt_enabled, the stored pt_amount (typically Maharashtra
           slab — ₹200/mo, ₹300 in February).  No automatic logic.
    - TDS: if tds_enabled, the stored tds_monthly amount.  No slab
           calculation; coordinator types in the amount per the
           groomer's projected tax outgo.

  The `compute_payroll_entry()` SQL function does all of the above and
  returns a JSONB with both the raw numbers and the snapshot fields.
  It can be called for a draft entry to refresh it after compensation
  edits, or invoked by `enqueue_payroll_run()` to seed every active
  groomer in one go.

  PDF generation lives entirely client-side (jsPDF) so no storage
  bucket is needed — the user explicitly chose "Download only" for
  Phase 6 delivery.

  Out of scope:
    • Statutory return forms (PF/ECR, ESI/PR2)
    • Employer-side PF/ESI contribution tracking on the slip
    • Reimbursements
*/

-- ─────────────────────────────────────────────────────────────────────
-- 1. groomer_compensation — per-employee salary structure
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS groomer_compensation (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- groomer_id is text across the codebase (e.g. 'groomer-1' or a uuid)
  -- so we match that convention here.  One row per groomer.
  groomer_id               text UNIQUE NOT NULL,
  groomer_name             text NOT NULL,                  -- denormalised label

  -- ── Earnings (monthly) ──
  basic_monthly            numeric(10,2) NOT NULL DEFAULT 0,
  hra_monthly              numeric(10,2) NOT NULL DEFAULT 0,
  conveyance_monthly       numeric(10,2) NOT NULL DEFAULT 0,
  medical_monthly          numeric(10,2) NOT NULL DEFAULT 0,
  special_allowance_monthly numeric(10,2) NOT NULL DEFAULT 0,
  other_allowance_label    text,                            -- free-text label for "other"
  other_allowance_monthly  numeric(10,2) NOT NULL DEFAULT 0,

  -- ── Per-session incentives ──
  -- Three optional rates.  Set whichever applies, leave the others 0.
  --   per_dog_incentive       — flat ₹ per completed dog session
  --   per_cat_incentive       — flat ₹ per completed cat session
  --   per_session_flat_incentive — flat ₹ per ANY completed session
  per_dog_incentive             numeric(10,2) NOT NULL DEFAULT 0,
  per_cat_incentive             numeric(10,2) NOT NULL DEFAULT 0,
  per_session_flat_incentive    numeric(10,2) NOT NULL DEFAULT 0,

  -- ── Statutory toggles + parameters ──
  pf_enabled               boolean NOT NULL DEFAULT false,
  pf_employee_pct          numeric(5,2)  NOT NULL DEFAULT 12.00,     -- %
  pf_cap                   numeric(10,2) NOT NULL DEFAULT 1800.00,   -- monthly cap on employee contribution

  esi_enabled              boolean NOT NULL DEFAULT false,
  esi_employee_pct         numeric(5,2)  NOT NULL DEFAULT 0.75,      -- %
  esi_gross_ceiling        numeric(10,2) NOT NULL DEFAULT 21000.00,  -- ESI only if gross < ceiling

  pt_enabled               boolean NOT NULL DEFAULT false,
  pt_amount                numeric(10,2) NOT NULL DEFAULT 200.00,    -- flat monthly amount

  tds_enabled              boolean NOT NULL DEFAULT false,
  tds_monthly              numeric(10,2) NOT NULL DEFAULT 0.00,      -- coordinator-entered

  -- ── Identifiers for the slip header ──
  designation              text,                            -- e.g. 'Senior Groomer'
  employee_code            text,                            -- e.g. 'SNF-001'
  pan                      text,
  uan                      text,                            -- Universal Account Number (PF)
  esic_number              text,
  bank_name                text,
  bank_account             text,
  bank_ifsc                text,
  date_of_joining          date,

  effective_from           date NOT NULL DEFAULT CURRENT_DATE,
  is_active                boolean NOT NULL DEFAULT true,
  notes                    text,

  created_by               text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_groomer_compensation_groomer
  ON groomer_compensation (groomer_id);

ALTER TABLE groomer_compensation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "groomer_compensation: authenticated read"
  ON groomer_compensation FOR SELECT TO authenticated USING (true);
CREATE POLICY "groomer_compensation: authenticated write"
  ON groomer_compensation FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Mirror the existing project pattern: anon access is gated by the
-- AdminLoginGate frontend.
CREATE POLICY "groomer_compensation: anon read"
  ON groomer_compensation FOR SELECT TO anon USING (true);
CREATE POLICY "groomer_compensation: anon write"
  ON groomer_compensation FOR ALL TO anon USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS trg_groomer_compensation_touch ON groomer_compensation;
CREATE TRIGGER trg_groomer_compensation_touch
  BEFORE UPDATE ON groomer_compensation
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 2. payroll_runs — period header
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payroll_runs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_year     integer NOT NULL CHECK (period_year BETWEEN 2024 AND 2100),
  period_month    integer NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  -- Optional label so a coordinator can distinguish 'May 2026 — final'
  -- from 'May 2026 — recompute' if they ever run two for the same period.
  label           text,
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','finalised')),
  -- Working-days basis used for pro-rating.  Defaults to the calendar
  -- days in the month minus Sundays (≈ 26), but the coordinator can
  -- override per run.
  working_days_basis  integer NOT NULL DEFAULT 26,
  notes           text,
  created_by      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  finalised_at    timestamptz,
  finalised_by    text,

  UNIQUE (period_year, period_month, label)
);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_period
  ON payroll_runs (period_year DESC, period_month DESC);

ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payroll_runs: authenticated read"
  ON payroll_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "payroll_runs: authenticated write"
  ON payroll_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "payroll_runs: anon read"
  ON payroll_runs FOR SELECT TO anon USING (true);
CREATE POLICY "payroll_runs: anon write"
  ON payroll_runs FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────
-- 3. payroll_entries — per-groomer snapshot per run
-- ─────────────────────────────────────────────────────────────────────
-- Every numerical column is materialised so historical runs render
-- exactly as they did when finalised, even after the underlying
-- compensation row or session log changes.  Draft entries can be
-- recomputed at will via `compute_payroll_entry(entry_id)`.

CREATE TABLE IF NOT EXISTS payroll_entries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id              uuid NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  groomer_id          text NOT NULL,
  groomer_name        text NOT NULL,

  -- ── Snapshot of compensation at compute time ──
  basic_monthly             numeric(10,2) NOT NULL DEFAULT 0,
  hra_monthly               numeric(10,2) NOT NULL DEFAULT 0,
  conveyance_monthly        numeric(10,2) NOT NULL DEFAULT 0,
  medical_monthly           numeric(10,2) NOT NULL DEFAULT 0,
  special_allowance_monthly numeric(10,2) NOT NULL DEFAULT 0,
  other_allowance_label     text,
  other_allowance_monthly   numeric(10,2) NOT NULL DEFAULT 0,
  per_dog_incentive             numeric(10,2) NOT NULL DEFAULT 0,
  per_cat_incentive             numeric(10,2) NOT NULL DEFAULT 0,
  per_session_flat_incentive    numeric(10,2) NOT NULL DEFAULT 0,

  -- ── Attendance / activity (auto-pulled) ──
  working_days        integer NOT NULL DEFAULT 26,
  present_days        integer NOT NULL DEFAULT 0,
  paid_leave_days     integer NOT NULL DEFAULT 0,
  lwp_days            integer NOT NULL DEFAULT 0,
  payable_days        integer NOT NULL DEFAULT 0,   -- present + paid leave

  sessions_dog_count       integer NOT NULL DEFAULT 0,
  sessions_cat_count       integer NOT NULL DEFAULT 0,
  sessions_total_count     integer NOT NULL DEFAULT 0,

  -- ── Computed earnings (pro-rated where applicable) ──
  earnings_basic            numeric(10,2) NOT NULL DEFAULT 0,
  earnings_hra              numeric(10,2) NOT NULL DEFAULT 0,
  earnings_conveyance       numeric(10,2) NOT NULL DEFAULT 0,
  earnings_medical          numeric(10,2) NOT NULL DEFAULT 0,
  earnings_special          numeric(10,2) NOT NULL DEFAULT 0,
  earnings_other            numeric(10,2) NOT NULL DEFAULT 0,
  earnings_incentive        numeric(10,2) NOT NULL DEFAULT 0,
  -- Manual lines coordinator can add per entry
  earnings_bonus            numeric(10,2) NOT NULL DEFAULT 0,
  earnings_bonus_note       text,
  earnings_arrear           numeric(10,2) NOT NULL DEFAULT 0,
  earnings_arrear_note      text,
  earnings_other_custom     numeric(10,2) NOT NULL DEFAULT 0,
  earnings_other_custom_label text,

  gross_earnings            numeric(10,2) NOT NULL DEFAULT 0,

  -- ── Deductions ──
  deductions_pf             numeric(10,2) NOT NULL DEFAULT 0,
  deductions_pf_employer    numeric(10,2) NOT NULL DEFAULT 0, -- recorded but not subtracted from net
  deductions_esi            numeric(10,2) NOT NULL DEFAULT 0,
  deductions_pt             numeric(10,2) NOT NULL DEFAULT 0,
  deductions_tds            numeric(10,2) NOT NULL DEFAULT 0,
  deductions_advance        numeric(10,2) NOT NULL DEFAULT 0,
  deductions_advance_note   text,
  deductions_other          numeric(10,2) NOT NULL DEFAULT 0,
  deductions_other_label    text,

  total_deductions          numeric(10,2) NOT NULL DEFAULT 0,
  net_pay                   numeric(10,2) NOT NULL DEFAULT 0,
  net_pay_in_words          text,

  -- ── Snapshot identifiers (so the slip is self-contained) ──
  designation         text,
  employee_code       text,
  pan                 text,
  uan                 text,
  esic_number         text,
  bank_name           text,
  bank_account        text,
  bank_ifsc           text,
  date_of_joining     date,

  -- ── Lifecycle ──
  status              text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','locked')),
  -- last_pdf_generated_at is purely informational since the PDF is
  -- generated client-side and not stored on the server.
  last_pdf_generated_at  timestamptz,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  UNIQUE (run_id, groomer_id)
);

CREATE INDEX IF NOT EXISTS idx_payroll_entries_run
  ON payroll_entries (run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_entries_groomer
  ON payroll_entries (groomer_id);

ALTER TABLE payroll_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payroll_entries: authenticated read"
  ON payroll_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "payroll_entries: authenticated write"
  ON payroll_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "payroll_entries: anon read"
  ON payroll_entries FOR SELECT TO anon USING (true);
CREATE POLICY "payroll_entries: anon write"
  ON payroll_entries FOR ALL TO anon USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS trg_payroll_entries_touch ON payroll_entries;
CREATE TRIGGER trg_payroll_entries_touch
  BEFORE UPDATE ON payroll_entries
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 4. amount_in_words() — Indian-format ₹ in words
-- ─────────────────────────────────────────────────────────────────────
-- Defined before amount_in_words because amount_in_words calls it.
-- "Twelve Thousand Three Hundred Forty Five Rupees Only"
-- Skipping paise on intent; payslip totals are rounded to whole rupees.

-- Helper: returns the English text for a number 0..99.
CREATE OR REPLACE FUNCTION two_digits_words(p_n bigint)
RETURNS text AS $$
DECLARE
  v_words text[] := ARRAY[
    '', 'One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
    'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'
  ];
  v_tens text[] := ARRAY['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
BEGIN
  IF p_n < 20 THEN
    RETURN v_words[p_n + 1];
  ELSE
    RETURN trim(v_tens[(p_n / 10) + 1] || ' ' || v_words[(p_n % 10) + 1]);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION amount_in_words(p_amount numeric)
RETURNS text AS $$
DECLARE
  v_n bigint;
  v_crore bigint; v_lakh bigint; v_thou bigint; v_hund bigint; v_rest bigint;
  v_out text := '';
  v_words text[] := ARRAY[
    '', 'One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
    'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'
  ];
BEGIN
  v_n := COALESCE(floor(abs(p_amount))::bigint, 0);

  IF v_n = 0 THEN RETURN 'Zero Rupees Only'; END IF;

  v_crore := v_n / 10000000;            v_n := v_n - v_crore * 10000000;
  v_lakh  := v_n / 100000;              v_n := v_n - v_lakh  * 100000;
  v_thou  := v_n / 1000;                v_n := v_n - v_thou  * 1000;
  v_hund  := v_n / 100;                 v_rest := v_n - v_hund * 100;

  IF v_crore > 0 THEN v_out := v_out || two_digits_words(v_crore) || ' Crore '; END IF;
  IF v_lakh  > 0 THEN v_out := v_out || two_digits_words(v_lakh)  || ' Lakh ';  END IF;
  IF v_thou  > 0 THEN v_out := v_out || two_digits_words(v_thou)  || ' Thousand '; END IF;
  IF v_hund  > 0 THEN v_out := v_out || v_words[v_hund + 1] || ' Hundred '; END IF;
  IF v_rest  > 0 THEN
    IF v_hund > 0 THEN v_out := v_out || 'and '; END IF;
    v_out := v_out || two_digits_words(v_rest) || ' ';
  END IF;

  RETURN trim(v_out) || ' Rupees Only';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

GRANT EXECUTE ON FUNCTION two_digits_words(bigint) TO authenticated, anon;

-- ─────────────────────────────────────────────────────────────────────
-- 5. compute_payroll_entry() — recomputes an entry from compensation
--    + activity in the period.  Returns the updated row as jsonb.
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION compute_payroll_entry(p_entry_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_entry    payroll_entries%ROWTYPE;
  v_run      payroll_runs%ROWTYPE;
  v_comp     groomer_compensation%ROWTYPE;
  v_start    date;
  v_end      date;
  v_present  int := 0;
  v_paid_lv  int := 0;
  v_lwp      int := 0;
  v_dog      int := 0;
  v_cat      int := 0;
  v_payable  int;
  v_basic_e  numeric(10,2);
  v_hra_e    numeric(10,2);
  v_conv_e   numeric(10,2);
  v_med_e    numeric(10,2);
  v_spec_e   numeric(10,2);
  v_other_e  numeric(10,2);
  v_inc      numeric(10,2);
  v_gross    numeric(10,2);
  v_pf_e     numeric(10,2);
  v_pf_er    numeric(10,2);
  v_esi      numeric(10,2);
  v_pt       numeric(10,2);
  v_tds      numeric(10,2);
  v_total_d  numeric(10,2);
  v_net      numeric(10,2);
  v_ratio    numeric(10,6);
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

  SELECT * INTO v_comp FROM groomer_compensation WHERE groomer_id = v_entry.groomer_id;
  -- Compensation row is optional — if missing, fall back to whatever
  -- the entry currently has (snapshot defaults to zero).  This lets the
  -- coordinator type values directly on the entry without first
  -- defining a compensation profile.

  -- Period bounds
  v_start := make_date(v_run.period_year, v_run.period_month, 1);
  v_end   := (v_start + interval '1 month' - interval '1 day')::date;

  -- Present days: distinct dates of completed sessions for this groomer
  SELECT COUNT(DISTINCT session_date) INTO v_present
  FROM grooming_sessions
  WHERE groomer_id = v_entry.groomer_id
    AND status = 'completed'
    AND session_date BETWEEN v_start AND v_end;

  -- Sessions count (dog / cat) within period
  SELECT
    COUNT(*) FILTER (WHERE pet_type = 'dog'),
    COUNT(*) FILTER (WHERE pet_type = 'cat')
  INTO v_dog, v_cat
  FROM grooming_sessions
  WHERE groomer_id = v_entry.groomer_id
    AND status = 'completed'
    AND session_date BETWEEN v_start AND v_end;

  -- Approved leaves (paid) + LWP within period
  SELECT
    COUNT(*) FILTER (WHERE status = 'approved'),
    COUNT(*) FILTER (WHERE status = 'lwp')
  INTO v_paid_lv, v_lwp
  FROM groomer_leaves
  WHERE groomer_id = v_entry.groomer_id
    AND leave_date BETWEEN v_start AND v_end;

  v_payable := v_present + v_paid_lv;
  IF v_payable > v_entry.working_days THEN
    v_payable := v_entry.working_days;
  END IF;

  -- Pro-ration ratio (capped at 1)
  v_ratio := CASE WHEN v_entry.working_days > 0
                  THEN LEAST(v_payable::numeric / v_entry.working_days, 1)
                  ELSE 0
             END;

  -- Use compensation row if available, otherwise fall back to entry
  -- snapshot (lets the coordinator override fields directly on the
  -- entry without a compensation profile).
  v_basic_e := COALESCE(v_comp.basic_monthly,            v_entry.basic_monthly)            * v_ratio;
  v_hra_e   := COALESCE(v_comp.hra_monthly,              v_entry.hra_monthly)              * v_ratio;
  v_conv_e  := COALESCE(v_comp.conveyance_monthly,       v_entry.conveyance_monthly)       * v_ratio;
  v_med_e   := COALESCE(v_comp.medical_monthly,          v_entry.medical_monthly)          * v_ratio;
  v_spec_e  := COALESCE(v_comp.special_allowance_monthly,v_entry.special_allowance_monthly)* v_ratio;
  v_other_e := COALESCE(v_comp.other_allowance_monthly,  v_entry.other_allowance_monthly)  * v_ratio;

  -- Incentive: not pro-rated; coordinator pays per actual session.
  v_inc :=
      (v_dog * COALESCE(v_comp.per_dog_incentive,           v_entry.per_dog_incentive))
    + (v_cat * COALESCE(v_comp.per_cat_incentive,           v_entry.per_cat_incentive))
    + ((v_dog + v_cat) * COALESCE(v_comp.per_session_flat_incentive, v_entry.per_session_flat_incentive));

  -- Gross BEFORE manual bonus / arrear, since deductions like ESI
  -- depend on gross.  Manual lines are added in afterwards.
  v_gross := v_basic_e + v_hra_e + v_conv_e + v_med_e + v_spec_e + v_other_e + v_inc;

  -- PF: 12% of basic_earned, capped.  Both employee and employer
  -- contributions are recorded; only the employee side reduces net.
  IF COALESCE(v_comp.pf_enabled, false) THEN
    v_pf_e  := LEAST(v_basic_e * COALESCE(v_comp.pf_employee_pct, 12) / 100,
                     COALESCE(v_comp.pf_cap, 1800));
    v_pf_er := LEAST(v_basic_e * COALESCE(v_comp.pf_employee_pct, 12) / 100,
                     COALESCE(v_comp.pf_cap, 1800));
  ELSE
    v_pf_e := 0; v_pf_er := 0;
  END IF;

  -- ESI: 0.75% of gross when enabled AND gross under ceiling.
  IF COALESCE(v_comp.esi_enabled, false) AND v_gross < COALESCE(v_comp.esi_gross_ceiling, 21000) THEN
    v_esi := round(v_gross * COALESCE(v_comp.esi_employee_pct, 0.75) / 100, 2);
  ELSE
    v_esi := 0;
  END IF;

  -- PT and TDS: flat amounts; no automatic slab logic.
  v_pt  := CASE WHEN COALESCE(v_comp.pt_enabled,  false) THEN COALESCE(v_comp.pt_amount,  0) ELSE 0 END;
  v_tds := CASE WHEN COALESCE(v_comp.tds_enabled, false) THEN COALESCE(v_comp.tds_monthly, 0) ELSE 0 END;

  -- Gross + manual extras
  v_gross := v_gross + v_entry.earnings_bonus + v_entry.earnings_arrear + v_entry.earnings_other_custom;

  v_total_d := v_pf_e + v_esi + v_pt + v_tds + v_entry.deductions_advance + v_entry.deductions_other;
  v_net     := v_gross - v_total_d;

  UPDATE payroll_entries SET
    -- Compensation snapshot (refresh from comp row if present)
    basic_monthly             = COALESCE(v_comp.basic_monthly,             basic_monthly),
    hra_monthly               = COALESCE(v_comp.hra_monthly,               hra_monthly),
    conveyance_monthly        = COALESCE(v_comp.conveyance_monthly,        conveyance_monthly),
    medical_monthly           = COALESCE(v_comp.medical_monthly,           medical_monthly),
    special_allowance_monthly = COALESCE(v_comp.special_allowance_monthly, special_allowance_monthly),
    other_allowance_label     = COALESCE(v_comp.other_allowance_label,     other_allowance_label),
    other_allowance_monthly   = COALESCE(v_comp.other_allowance_monthly,   other_allowance_monthly),
    per_dog_incentive         = COALESCE(v_comp.per_dog_incentive,         per_dog_incentive),
    per_cat_incentive         = COALESCE(v_comp.per_cat_incentive,         per_cat_incentive),
    per_session_flat_incentive= COALESCE(v_comp.per_session_flat_incentive,per_session_flat_incentive),

    -- Activity
    present_days              = v_present,
    paid_leave_days           = v_paid_lv,
    lwp_days                  = v_lwp,
    payable_days              = v_payable,
    sessions_dog_count        = v_dog,
    sessions_cat_count        = v_cat,
    sessions_total_count      = v_dog + v_cat,

    -- Earnings
    earnings_basic            = round(v_basic_e, 2),
    earnings_hra              = round(v_hra_e, 2),
    earnings_conveyance       = round(v_conv_e, 2),
    earnings_medical          = round(v_med_e, 2),
    earnings_special          = round(v_spec_e, 2),
    earnings_other            = round(v_other_e, 2),
    earnings_incentive        = round(v_inc, 2),
    gross_earnings            = round(v_gross, 2),

    -- Deductions
    deductions_pf             = round(v_pf_e, 2),
    deductions_pf_employer    = round(v_pf_er, 2),
    deductions_esi            = round(v_esi, 2),
    deductions_pt             = round(v_pt, 2),
    deductions_tds            = round(v_tds, 2),
    total_deductions          = round(v_total_d, 2),
    net_pay                   = round(v_net, 2),
    net_pay_in_words          = amount_in_words(round(v_net, 0)),

    -- Header snapshot from compensation row
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

  RETURN jsonb_build_object('success', true, 'entry_id', p_entry_id, 'net_pay', round(v_net, 2));
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION compute_payroll_entry(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION amount_in_words(numeric) TO authenticated, anon;

-- ─────────────────────────────────────────────────────────────────────
-- 6. enqueue_payroll_run() — seed entries for all active groomers
--    in a run.  Idempotent: skips groomers that already have an entry.
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION enqueue_payroll_run(p_run_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_run     payroll_runs%ROWTYPE;
  v_count   int := 0;
  v_comp    groomer_compensation%ROWTYPE;
  v_groomer record;
  v_entry_id uuid;
BEGIN
  SELECT * INTO v_run FROM payroll_runs WHERE id = p_run_id;
  IF v_run.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'run_not_found');
  END IF;
  IF v_run.status = 'finalised' THEN
    RETURN jsonb_build_object('success', false, 'error', 'run_already_finalised');
  END IF;

  -- Iterate every active groomer.  We pull from the `groomers` table
  -- directly so the run captures groomers that don't yet have a
  -- compensation profile (entries are seeded with zeroes; coordinator
  -- can either edit the entry directly or fill the profile and
  -- recompute).
  FOR v_groomer IN
    SELECT id::text AS groomer_id, name
    FROM groomers
    WHERE status = 'active' OR status IS NULL
  LOOP
    -- Skip if an entry already exists for this run+groomer
    IF EXISTS (
      SELECT 1 FROM payroll_entries
      WHERE run_id = p_run_id AND groomer_id = v_groomer.groomer_id
    ) THEN CONTINUE; END IF;

    SELECT * INTO v_comp FROM groomer_compensation WHERE groomer_id = v_groomer.groomer_id;

    INSERT INTO payroll_entries (
      run_id, groomer_id, groomer_name,
      basic_monthly, hra_monthly, conveyance_monthly, medical_monthly,
      special_allowance_monthly, other_allowance_label, other_allowance_monthly,
      per_dog_incentive, per_cat_incentive, per_session_flat_incentive,
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
      COALESCE(v_comp.per_dog_incentive, 0),
      COALESCE(v_comp.per_cat_incentive, 0),
      COALESCE(v_comp.per_session_flat_incentive, 0),
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

-- ─────────────────────────────────────────────────────────────────────
-- 7. finalise / lock a run.  Locked entries refuse recompute.
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION finalise_payroll_run(p_run_id uuid, p_by text)
RETURNS jsonb AS $$
BEGIN
  UPDATE payroll_runs SET
    status       = 'finalised',
    finalised_at = now(),
    finalised_by = COALESCE(NULLIF(trim(p_by), ''), 'coordinator')
  WHERE id = p_run_id AND status = 'draft';

  UPDATE payroll_entries SET status = 'locked' WHERE run_id = p_run_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION finalise_payroll_run(uuid, text) TO authenticated, anon;
