/*
  # Notification read-state — source of truth for read/unread.

  Until now we tracked "read" purely in `localStorage`.  That meant:
    - Cleared every time the user wiped cookies / used incognito / reset
      a PWA / switched devices.
    - Read state on phone never reached laptop and vice-versa.

  This table moves the source of truth to Supabase so read state survives
  cache clears and syncs across devices.  `localStorage` stays in the
  code path purely as an offline fast-bootstrap cache — if the DB query
  is slow or fails, the UI still shows the right state from cache.

  ## Shape
    user_key         text     'admin.<userId>' or 'groomer.<groomerId>'
                              (matches what the front-end already passes
                               to localStorage today)
    notification_id  text     Same deterministic id we mint in the
                              feed, e.g. 'arrival-<sessionId>',
                              'review-<sessionId>', 'leave-<leaveId>',
                              'followups-due', 'booking-<bookingId>',
                              'assigned-<sessionId>', etc.
    read_at          timestamptz  When the user marked it read.
                              `now()` default lets us upsert without
                              passing the timestamp explicitly.

  ## Composite PK
  (user_key, notification_id) — natural identity, prevents duplicate
  reads, makes `upsert` a one-liner from the front-end.

  ## Indexes
  The composite PK indexes (user_key, notification_id) → we don't need
  a separate index for the typical query `WHERE user_key = $1`.  Adding
  one anyway because PG's leading-column rule covers it and it costs
  nothing.

  ## RLS
  Matches the existing project pattern: anon + authenticated can do
  everything (the app gates access at the route level).  Tighten when
  Supabase Auth is adopted and `auth.uid()` becomes available.

  ## Garbage collection
  The front-end deletes rows for notification_ids that have aged out of
  the live feed (e.g. a website booking older than 24h that no longer
  generates a notification).  Done as a fire-and-forget delete on each
  refresh — no triggers needed here.
*/

CREATE TABLE IF NOT EXISTS notification_reads (
  user_key         text         NOT NULL,
  notification_id  text         NOT NULL,
  read_at          timestamptz  NOT NULL DEFAULT now(),
  PRIMARY KEY (user_key, notification_id)
);

-- Redundant given the composite PK, but explicit + cheap.
CREATE INDEX IF NOT EXISTS notification_reads_user_idx
  ON notification_reads (user_key);

-- ─────────── RLS ───────────
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- Same permissive pattern as groomer_leaves / grooming_sessions: the
-- admin / groomer login gates already restrict access to the routes
-- that read this table.

DROP POLICY IF EXISTS "Anyone can read notification_reads"   ON notification_reads;
CREATE POLICY "Anyone can read notification_reads"
  ON notification_reads FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert notification_reads" ON notification_reads;
CREATE POLICY "Anyone can insert notification_reads"
  ON notification_reads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update notification_reads" ON notification_reads;
CREATE POLICY "Anyone can update notification_reads"
  ON notification_reads FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete notification_reads" ON notification_reads;
CREATE POLICY "Anyone can delete notification_reads"
  ON notification_reads FOR DELETE
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE notification_reads IS
  'Tracks which (user_key, notification_id) pairs have been marked read. '
  'Source of truth for the bell-badge unread count.  Front-end caches '
  'in localStorage for offline / fast-bootstrap, but always reconciles '
  'against this table on next online refresh.';
