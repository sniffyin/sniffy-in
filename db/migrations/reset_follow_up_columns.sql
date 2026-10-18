-- Reset follow-up columns on grooming_sessions
-- Context: earlier the "Add Session" flow forced a follow-up cadence
-- (default 30 days) on every booking, even when not requested.
-- ~95% of sessions don't actually need a follow-up, so we're wiping
-- the legacy data and dropping the DB-level default. The coordinator
-- will re-ask each customer and opt them in case-by-case.
--
-- Safe to run multiple times.

BEGIN;

-- 1. Drop the DEFAULT 30 so omitted inserts no longer silently
--    backfill a 30-day cadence. The column stays nullable.
ALTER TABLE public.grooming_sessions
  ALTER COLUMN next_due_days DROP DEFAULT;

-- 2. Wipe legacy follow-up values for every row.
UPDATE public.grooming_sessions
SET next_due_days = NULL,
    next_due_date = NULL
WHERE next_due_days IS NOT NULL
   OR next_due_date IS NOT NULL;

-- 3. Sanity check — both counts should be 0 after the migration.
--    (Comment out before running if your client errors on SELECTs
--    inside a migration.)
SELECT
  COUNT(*) FILTER (WHERE next_due_days IS NOT NULL) AS rows_with_days,
  COUNT(*) FILTER (WHERE next_due_date IS NOT NULL) AS rows_with_date
FROM public.grooming_sessions;

COMMIT;
