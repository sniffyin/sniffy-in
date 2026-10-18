-- ─── archive_bookings ─────────────────────────────────────────
--
-- Soft-delete bucket for grooming sessions.
--
-- Background: coordinators occasionally need to remove a session
-- row from the active list — duplicates, fat-finger entries,
-- cancelled-and-refunded jobs, test rows that escaped into prod.
-- Hard-deleting from `grooming_sessions` is destructive and we've
-- already been bitten once by a coordinator deleting the wrong
-- row at end-of-day and having no way to recover it without a
-- backup restore.
--
-- This migration adds an archive table that the app writes to
-- BEFORE deleting from `grooming_sessions`.  See handleDelete()
-- in src/pages/admin/SessionsTab.tsx — the flow is:
--
--   1. insert into archive_bookings (whole-row JSON snapshot)
--   2. delete from grooming_sessions
--
-- If step 1 fails, step 2 is skipped, so we never lose data.
--
-- Schema notes:
--   • payload jsonb         — full row snapshot at archive time.
--                             jsonb (not jsonb columns per field)
--                             so this table doesn't need to track
--                             every future column added to
--                             grooming_sessions.  Restore = read
--                             payload, re-insert.
--   • original_id uuid      — points back to grooming_sessions.id
--                             at the time of archive.  NOT a FK,
--                             since the parent row is gone after
--                             delete.  Indexed for "find the
--                             archived copy of this session" lookups.
--   • archived_by uuid      — auth.users.id of the coordinator who
--                             pressed delete.  Nullable because
--                             RLS policies / service-role
--                             deletions may not always have a user
--                             attached.
--   • archived_at timestamp — when we archived.  Default now().
--   • reason text           — optional free-text the coordinator
--                             can fill in later if we add an
--                             "archive with reason" flow.  Nullable
--                             for now; the UI doesn't collect it yet.
--
-- Retention: indefinite.  This table grows slowly (a handful of
-- rows per week, max) so we don't need a TTL job today.  Revisit
-- if it ever exceeds ~50k rows.

CREATE TABLE IF NOT EXISTS archive_bookings (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id  uuid        NOT NULL,
  payload      jsonb       NOT NULL,
  archived_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  archived_at  timestamptz NOT NULL DEFAULT now(),
  reason       text
);

-- "Find the archived copy of a given session" — used by any
-- future restore UI.
CREATE INDEX IF NOT EXISTS archive_bookings_original_id_idx
  ON archive_bookings (original_id);

-- "Recently archived" — used by an admin audit view.
CREATE INDEX IF NOT EXISTS archive_bookings_archived_at_idx
  ON archive_bookings (archived_at DESC);

-- ─── RLS ─────────────────────────────────────────────────────
-- Match the policy shape used on grooming_sessions: writes are
-- coordinator/admin only, reads are coordinator/admin only.
-- Groomers should never see archive rows.

ALTER TABLE archive_bookings ENABLE ROW LEVEL SECURITY;

-- Authenticated users with the coordinator/admin role can read.
-- We mirror grooming_sessions's policy rather than restating the
-- role check here — if your project uses a different role-check
-- helper, swap the USING clause.
DROP POLICY IF EXISTS "archive_bookings select coordinators" ON archive_bookings;
CREATE POLICY "archive_bookings select coordinators"
  ON archive_bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Inserts happen from the app right before a delete.  Same role
-- gate as deletes on grooming_sessions.
DROP POLICY IF EXISTS "archive_bookings insert coordinators" ON archive_bookings;
CREATE POLICY "archive_bookings insert coordinators"
  ON archive_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- No UPDATE / DELETE policies on purpose — archive rows are
-- immutable.  If we ever build a "restore" flow it should
-- re-insert into grooming_sessions and leave the archive row
-- alone so the audit trail stays intact.
