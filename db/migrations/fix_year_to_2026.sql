-- ─────────────────────────────────────────────────────────────
-- ARCHIVED ONE-SHOT SCRIPT — do NOT re-run.
--
-- Already executed against production on 2026-05-16 (Jiten).
-- Companion patch to pending_april_2025_insert.sql: that bulk
-- insert landed 94 rows with the wrong year (2025), this UPDATE
-- shifted them to 2026.  Kept for the audit trail only.
-- ─────────────────────────────────────────────────────────────

-- Shift the 94 inserted April rows from 2025 to 2026
-- Run this ONCE. Affects only the 94 rows we just inserted.

UPDATE grooming_sessions
SET session_date = session_date + INTERVAL '1 year'
WHERE session_date BETWEEN '2025-04-01' AND '2025-04-30';

-- Verify
SELECT session_date, COUNT(*)
FROM grooming_sessions
WHERE session_date BETWEEN '2026-04-01' AND '2026-04-30'
GROUP BY session_date
ORDER BY session_date;
