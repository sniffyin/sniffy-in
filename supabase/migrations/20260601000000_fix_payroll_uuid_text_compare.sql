/*
  # Fix — Phase 6 Payroll: uuid = text comparison in compute_payroll_entry
  =======================================================================

  Symptom
  -------
  Creating a new payroll run from the admin UI surfaced:

      Run created but seeding failed:
      operator does not exist: uuid = text

  Root cause
  ----------
  `payroll_entries.groomer_id` is declared `text` (see
  20260528000000_phase6_payroll.sql line 209), and `enqueue_payroll_run()`
  seeds it by casting `groomers.id::text`.  That part works fine.

  The crash happens one step later, inside `compute_payroll_entry()`,
  which is called per seeded row.  It joins back to:

    • grooming_sessions  (live schema: groomer_id uuid)
    • groomer_leaves     (groomer_id text)

  Comparing `payroll_entries.groomer_id` (text) directly to
  `grooming_sessions.groomer_id` (uuid) raises the
  "operator does not exist: uuid = text" error because Postgres won't
  implicitly coerce between uuid and text.

  Note: the comment at the top of the original Phase 6 migration says
  "grooming_sessions stores groomer_id as text" — that comment reflects
  the project's intent, but the live grooming_sessions table column is
  actually uuid (it was created outside the local migrations folder, via
  the Supabase dashboard).  Migrating that column to text would touch a
  large legacy table and several other queries; safer to cast inside
  the payroll functions.

  Fix
  ---
  Redefine `compute_payroll_entry()` with explicit `::text` casts on
  every `groomer_id` comparison, so it works regardless of whether the
  joined column is uuid or text in any given environment.

  Casts are added defensively for `groomer_leaves` too, even though its
  column is currently text, so the same function keeps working if the
  type is ever migrated.

  This is the only function affected — `enqueue_payroll_run()` already
  uses `id::text` consistently and doesn't need a rewrite.
*/

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

  -- groomer_compensation.groomer_id is text, so this comparison is fine,
  -- but we cast defensively in case the column type ever changes.
  SELECT * INTO v_comp FROM groomer_compensation
   WHERE groomer_id::text = v_entry.groomer_id::text;

  -- Period bounds
  v_start := make_date(v_run.period_year, v_run.period_month, 1);
  v_end   := (v_start + interval '1 month' - interval '1 day')::date;

  -- Present days: distinct dates of completed sessions for this groomer.
  -- grooming_sessions.groomer_id is uuid in the live DB; cast both sides
  -- to text so the comparison works whether it's uuid or text.
  SELECT COUNT(DISTINCT session_date) INTO v_present
  FROM grooming_sessions
  WHERE groomer_id::text = v_entry.groomer_id::text
    AND status = 'completed'
    AND session_date BETWEEN v_start AND v_end;

  -- Sessions count (dog / cat) within period
  SELECT
    COUNT(*) FILTER (WHERE pet_type = 'dog'),
    COUNT(*) FILTER (WHERE pet_type = 'cat')
  INTO v_dog, v_cat
  FROM grooming_sessions
  WHERE groomer_id::text = v_entry.groomer_id::text
    AND status = 'completed'
    AND session_date BETWEEN v_start AND v_end;

  -- Approved leaves (paid) + LWP within period
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

  -- PF: 12% of basic_earned, capped.
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

  RETURN jsonb_build_object('success', true, 'entry_id', p_entry_id, 'net_pay', round(v_net, 2));
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION compute_payroll_entry(uuid) TO authenticated, anon;
