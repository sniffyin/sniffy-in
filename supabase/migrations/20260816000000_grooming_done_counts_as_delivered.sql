/*
  20260816000000_grooming_done_counts_as_delivered.sql

  Teaches the server-side functions that `grooming_done` is delivered
  work.  Companion to 20260815000000_add_grooming_done_status.sql, which
  only widened the CHECK.

  WHAT CHANGES AND WHY
  --------------------
  1. compute_payroll_entry
       Present-days, dog/cat counts and the on-time / review bonus counts
       all filter `status = 'completed'`.  A groomer who finished a job
       that Paw Space has not yet settled would otherwise lose the day
       and both bonuses — the groomer's pay must not depend on whether a
       partner platform has paid US.

  2. recompute_customer_aggregates
       `total_completed_sessions` per customer.  A groomed session is a
       visit whether or not the invoice cleared; excluding it distorts
       lifecycle_stage (new/active/lapsed/churned) and every downstream
       outreach rule keyed off it.

  3. request_booking_change
       Blocks a customer requesting a reschedule/cancel on a session
       that is already `completed` or `cancelled`.  `grooming_done`
       belongs in that list: the pet has already been groomed, so there
       is nothing left to reschedule.

  DELIBERATELY NOT CHANGED
  ------------------------
  • The referral-credit trigger (20260527000000) still fires only on the
    transition into `completed`.  Credit stays tied to the fully
    reconciled state, as agreed.
  • enqueue_payroll_run / finalise_payroll_run reference `status` only on
    `groomers`, `payroll_runs` and `payroll_entries` — not on
    grooming_sessions.  Verified, untouched.
  • The `admin_dashboard_kpis` view is not defined in any migration (it
    exists only in the live database), so it is out of scope here and
    handled separately.

  WHY THIS PATCHES THE LIVE DEFINITION INSTEAD OF RE-DECLARING IT
  ---------------------------------------------------------------
  compute_payroll_entry is ~200 lines of money logic that has already
  been redefined twice (20260601000000, then 20260603120000).  Copying it
  out again to change three predicates would mean re-transcribing all of
  it, and a single typo there is a payroll bug.  Worse, the file I would
  copy from is only a claim about what is deployed — the live database is
  the authority, and this repo's own notes warn that the two drift.

  So each block below reads the CURRENT definition out of the database
  with pg_get_functiondef(), performs one exact textual substitution, and
  re-executes it.  Whatever is actually live is what gets patched, and
  every line other than the predicate is preserved byte-for-byte.

  SAFETY
  ------
  A blind find-and-replace would fail silently if the live text differed
  by so much as a space — leaving payroll quietly unfixed while the
  migration reported success.  So every block asserts:
    • exactly one function of that name exists (no ambiguous overload);
    • the search string occurs EXACTLY the expected number of times;
    • after substitution, zero occurrences of the old form remain.
  Any mismatch raises an exception, which aborts the whole migration.
  Nothing is written outside a transaction, so a failure leaves every
  function exactly as it was.

  Re-running is safe: the second run finds 0 occurrences of the old
  string, detects that the new form is already present, and skips.
*/

-- ─────────────────────────────────────────────────────────────
-- 1. compute_payroll_entry — 3 predicates
-- ─────────────────────────────────────────────────────────────
DO $do$
DECLARE
  v_name   text := 'compute_payroll_entry';
  v_old    text := 'AND status = ''completed''';
  v_new    text := 'AND status IN (''completed'', ''grooming_done'')';
  v_expect int  := 3;
  v_src    text;
  v_out    text;
  v_n      int;
BEGIN
  SELECT count(*) INTO v_n
    FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_name;
  IF v_n <> 1 THEN
    RAISE EXCEPTION '%: expected exactly 1 function, found %', v_name, v_n;
  END IF;

  SELECT pg_get_functiondef(p.oid) INTO v_src
    FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_name;

  -- Already patched?  Nothing to do.
  IF position(v_new in v_src) > 0 THEN
    RAISE NOTICE '%: already counts grooming_done — skipping', v_name;
    RETURN;
  END IF;

  v_n := (length(v_src) - length(replace(v_src, v_old, ''))) / length(v_old);
  IF v_n <> v_expect THEN
    RAISE EXCEPTION
      '%: expected % occurrence(s) of "%", found % — live definition differs from what this migration was written against; aborting rather than guessing',
      v_name, v_expect, v_old, v_n;
  END IF;

  v_out := replace(v_src, v_old, v_new);

  IF position(v_old in v_out) > 0 THEN
    RAISE EXCEPTION '%: substitution left the old predicate behind', v_name;
  END IF;

  EXECUTE v_out;
  RAISE NOTICE '%: patched % predicate(s) to include grooming_done', v_name, v_expect;
END
$do$;

-- ─────────────────────────────────────────────────────────────
-- 2. recompute_customer_aggregates — 1 predicate
-- ─────────────────────────────────────────────────────────────
DO $do$
DECLARE
  v_name   text := 'recompute_customer_aggregates';
  v_old    text := 'count(*) FILTER (WHERE status = ''completed'')';
  v_new    text := 'count(*) FILTER (WHERE status IN (''completed'', ''grooming_done''))';
  v_expect int  := 1;
  v_src    text;
  v_out    text;
  v_n      int;
BEGIN
  SELECT count(*) INTO v_n
    FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_name;
  IF v_n <> 1 THEN
    RAISE EXCEPTION '%: expected exactly 1 function, found %', v_name, v_n;
  END IF;

  SELECT pg_get_functiondef(p.oid) INTO v_src
    FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_name;

  IF position(v_new in v_src) > 0 THEN
    RAISE NOTICE '%: already counts grooming_done — skipping', v_name;
    RETURN;
  END IF;

  v_n := (length(v_src) - length(replace(v_src, v_old, ''))) / length(v_old);
  IF v_n <> v_expect THEN
    RAISE EXCEPTION
      '%: expected % occurrence(s) of "%", found % — aborting', v_name, v_expect, v_old, v_n;
  END IF;

  v_out := replace(v_src, v_old, v_new);
  IF position(v_old in v_out) > 0 THEN
    RAISE EXCEPTION '%: substitution left the old predicate behind', v_name;
  END IF;

  EXECUTE v_out;
  RAISE NOTICE '%: patched % predicate(s) to include grooming_done', v_name, v_expect;
END
$do$;

-- ─────────────────────────────────────────────────────────────
-- 3. request_booking_change — 1 predicate
-- ─────────────────────────────────────────────────────────────
DO $do$
DECLARE
  v_name   text := 'request_booking_change';
  v_old    text := 'IN (''completed'',''cancelled'')';
  v_new    text := 'IN (''completed'',''grooming_done'',''cancelled'')';
  v_expect int  := 1;
  v_src    text;
  v_out    text;
  v_n      int;
BEGIN
  SELECT count(*) INTO v_n
    FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_name;
  IF v_n <> 1 THEN
    RAISE EXCEPTION '%: expected exactly 1 function, found %', v_name, v_n;
  END IF;

  SELECT pg_get_functiondef(p.oid) INTO v_src
    FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_name;

  IF position(v_new in v_src) > 0 THEN
    RAISE NOTICE '%: already blocks grooming_done — skipping', v_name;
    RETURN;
  END IF;

  v_n := (length(v_src) - length(replace(v_src, v_old, ''))) / length(v_old);
  IF v_n <> v_expect THEN
    RAISE EXCEPTION
      '%: expected % occurrence(s) of "%", found % — aborting', v_name, v_expect, v_old, v_n;
  END IF;

  v_out := replace(v_src, v_old, v_new);
  IF position(v_old in v_out) > 0 THEN
    RAISE EXCEPTION '%: substitution left the old predicate behind', v_name;
  END IF;

  EXECUTE v_out;
  RAISE NOTICE '%: patched % predicate(s) to include grooming_done', v_name, v_expect;
END
$do$;
