-- ─── Payment verification layer ──────────────────────────────
--
-- The groomer flow already writes `payment_collected_at` + `payment_mode`
-- when the groomer hits "Mark Payment" at the end of a session.  But
-- that's only one side of the ledger — the coordinator still has to
-- reconcile it (verify the online txn landed, or confirm the cash
-- was deposited at office).  This migration adds the second side.
--
-- Status is derived in code:
--   • unpaid     — payment_collected_at IS NULL
--   • collected  — payment_collected_at IS NOT NULL AND payment_verified = FALSE
--                  (further split by payment_mode in the UI:
--                   cash → "Cash w/ Groomer", online → "Online · Pending")
--   • paid       — payment_verified = TRUE
--
-- For prepaid bookings, the coordinator marks the session "Paid" up
-- front from the Session form; that path sets payment_verified=true
-- and stamps payment_collected_at to NOW() in one shot.

ALTER TABLE grooming_sessions
  ADD COLUMN IF NOT EXISTS payment_verified     BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS payment_verified_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_verified_by  TEXT;

-- Optional index for "who has cash outstanding" queries — quick
-- filter to surface unverified collected rows on the coordinator's
-- reconciliation screen.
CREATE INDEX IF NOT EXISTS grooming_sessions_payment_pending_idx
  ON grooming_sessions (payment_collected_at)
  WHERE payment_verified = FALSE AND payment_collected_at IS NOT NULL;
