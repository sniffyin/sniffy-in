-- ─────────────────────────────────────────────────────────────────────
-- Add "Elite" membership tier to customers (the paid tier above VIP)
-- ─────────────────────────────────────────────────────────────────────
-- Context:
--   `customers.is_vip` (Phase 1) is a manual admin-set flag surfaced as
--   a crown badge + "Mark VIP" bulk action in CustomersTab.  Elite is a
--   higher, paid membership (see the marketing `EliteMembership.tsx`:
--   10% off every service, priority booking, birthday gift, etc.).
--
--   We model it exactly like VIP — a manual boolean the coordinator
--   toggles — rather than deriving it from spend, because Elite is an
--   opt-in paid membership, not a spend threshold.  A customer may be
--   both VIP and Elite; the UI shows the Elite crown when set (it
--   outranks VIP).
--
-- RLS: no new policy needed.  `customers` already has a permissive
--   "customers: write FOR ALL TO anon, authenticated" policy
--   (20260522010000), so admin (anon-role) writes to the new column
--   work without change.

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS is_elite boolean NOT NULL DEFAULT false;

-- The `customers_with_recency` view is defined with `c.*`, which is
-- expanded to the concrete column list at view-creation time — it does
-- NOT auto-pick-up a newly added base-table column.  Recreate it so the
-- listing pages (which select from this view) can read `is_elite`.
-- Dropping the view also drops its grants, so re-grant afterwards.
DROP VIEW IF EXISTS customers_with_recency;

CREATE VIEW customers_with_recency AS
SELECT
  c.*,
  CASE
    WHEN c.last_session_at IS NULL THEN NULL
    ELSE (CURRENT_DATE - c.last_session_at)::integer
  END AS days_since_last_session,
  c.vendor_prepaid_total + c.sniffy_collected_total AS lifetime_value
FROM customers c;

-- Admin/coordinator UIs run under the anon role (app-level auth, not
-- Supabase Auth), so the view must be readable by anon as well.
GRANT SELECT ON customers_with_recency TO anon, authenticated;
