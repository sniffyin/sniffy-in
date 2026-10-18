-- ─── Payment-collected-by + vendor-settled-at ────────────────
--
-- Background: Sniffy fulfills grooming sessions in two channels:
--   • Direct (internal sources)  — Sniffy collects from the customer
--     and keeps the cash (less the groomer's commission).
--   • Vendor-sourced (external sources, e.g. Woofly) — the booking
--     came from a partner platform.  Two sub-cases live here:
--       ‣ vendor-prepaid  — the partner already collected payment
--         from the customer.  Sniffy does NOT collect cash; the
--         partner settles a groomer fee with Sniffy separately.
--       ‣ Sniffy-collected — Sniffy collects from the customer,
--         keeps the bulk, and pays the partner a commission.
--
-- Until now the schema couldn't tell these two sub-cases apart:
-- `payment_verified=true` could mean "cash in Sniffy's hand" OR
-- "partner already settled".  This made the day summary and
-- reconciliation reports impossible to compute correctly.
--
-- This migration adds the missing distinguishing field:
--
--   payment_collected_by  enum-like text
--     'sniffy'        → Sniffy collected cash from the customer.
--                       Continues to use payment_collected_at +
--                       payment_verified_at as before.
--     'vendor'        → Vendor already collected from the customer.
--                       payment_verified=true means "vendor-settled"
--                       and vendor_settled_at is stamped instead of
--                       payment_collected_at.
--     'groomer_cash'  → Groomer holds the cash, pending office
--                       deposit.  Today's "Cash w/ Groomer" path.
--
--   vendor_settled_at  timestamptz
--     Set when payment_collected_by='vendor' and the coordinator
--     marks the session paid.  Kept distinct from
--     payment_collected_at so revenue queries can sum
--     "cash Sniffy actually received" without subtracting
--     vendor-prepaid amounts in a second pass.
--
-- Backfill strategy: every existing row gets 'sniffy' as a safe
-- default — we cannot retroactively guess which Woofly bookings
-- were vendor-prepaid, and assuming wrong would distort historical
-- revenue.  Coordinators correct individual rows going forward;
-- the Vendor Reconciliation tab surfaces external rows still
-- attributed to 'sniffy' so they're easy to spot.

ALTER TABLE grooming_sessions
  ADD COLUMN IF NOT EXISTS payment_collected_by TEXT        NOT NULL DEFAULT 'sniffy',
  ADD COLUMN IF NOT EXISTS vendor_settled_at    TIMESTAMPTZ;

-- Constrain to the three known values.  CHECK rather than enum so
-- adding a new collector type (e.g. 'office_card_machine') doesn't
-- require an enum migration — just an app-side label change.
ALTER TABLE grooming_sessions
  DROP CONSTRAINT IF EXISTS grooming_sessions_payment_collected_by_chk;

ALTER TABLE grooming_sessions
  ADD CONSTRAINT grooming_sessions_payment_collected_by_chk
  CHECK (payment_collected_by IN ('sniffy', 'vendor', 'groomer_cash'));

-- Partial index for the Vendor Reconciliation view's "vendor-settled
-- this month" query.  Tiny — only the rows that have been settled by
-- the partner — and covers the column most filters touch.
CREATE INDEX IF NOT EXISTS grooming_sessions_vendor_settled_idx
  ON grooming_sessions (vendor_settled_at)
  WHERE payment_collected_by = 'vendor' AND vendor_settled_at IS NOT NULL;

-- Partial index for "external sessions still attributed to Sniffy"
-- — surfaces rows that need a coordinator to confirm the collector.
-- Useful on the Vendor Reconciliation screen's "needs attention" pane.
--
-- We filter on the `source` value list directly (not `source_type`)
-- because historically some rows have the wrong source_type recorded
-- — and a couple of production deployments don't have that column at
-- all.  `source` is unique per category so this list is equivalent.
-- Keep in sync with EXTERNAL_SOURCE_LABELS in src/pages/admin/types.ts.
CREATE INDEX IF NOT EXISTS grooming_sessions_external_sniffy_collected_idx
  ON grooming_sessions (source, session_date)
  WHERE source IN ('woofly', 'paw_space', 'oh_my_pet', 'global_pet', 'other')
    AND payment_collected_by = 'sniffy';
