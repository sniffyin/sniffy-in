/*
  # Expenses — coordinator/admin-facing expense tracker.

  ## What this adds
    1. New table         : expenses
    2. Indexes           : (expense_date DESC) for the list,
                            (category, expense_date DESC) for reports,
                            (paid_by_name) for autocomplete
    3. Storage bucket    : `expense-proofs` (private, signed URLs)
    4. RLS               : enabled with permissive policies — matches the
                            project's existing pattern (front-end auth
                            already gates /admin).

  ## Why a separate proof bucket?
  Existing buckets (`groomer-uploads`, `groomer-documents`) are scoped to
  groomer-side artefacts. Expense proofs are coordinator-facing receipts
  / payment screenshots that should be private (signed URLs only) and
  must not leak through any public-read groomer flow.

  ## Permission model (enforced front-end, NOT in RLS)
  Per the product decision on 2026-05-25:
    • anyone signed into /admin can CREATE expenses
    • only the row's `created_by_id` may EDIT or DELETE it
  RLS stays permissive (consistent with the rest of the admin module)
  because the front-end already gates write access. Tighten later when
  Supabase Auth + JWT claims land.
*/

CREATE TABLE IF NOT EXISTS expenses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ── What was spent ─────────────────────────────────────────
  title           text NOT NULL,
  amount          numeric(12, 2) NOT NULL CHECK (amount >= 0),
  category        text NOT NULL,                 -- free text; UI seeds a fixed list
  expense_date    date NOT NULL DEFAULT CURRENT_DATE,
  payment_method  text,                          -- 'cash' | 'upi' | 'bank' | 'card' | 'other'

  -- ── Who paid (NOT necessarily the logged-in coordinator) ──
  -- Per product brief: the coordinator can log an expense someone
  -- else paid for. `paid_by_name` is who actually parted with money.
  paid_by_name    text NOT NULL,
  paid_by_role    text,                          -- 'coordinator' | 'admin' | 'founder' | 'groomer' | 'vendor' | 'other'

  -- ── Who received the money (optional) ─────────────────────
  vendor_or_payee text,

  -- ── Extra context ─────────────────────────────────────────
  notes           text,

  -- ── Proof (screenshot / receipt) ──────────────────────────
  -- Optional. Path inside the `expense-proofs` bucket. UI generates
  -- short-lived signed URLs on click (see expensesApi.getSignedProofUrl).
  proof_path      text,
  proof_name      text,                          -- original filename for display
  proof_mime      text,                          -- e.g. 'image/png', 'application/pdf'
  proof_size      integer DEFAULT 0,

  -- ── Audit ─────────────────────────────────────────────────
  -- created_by_id is the AdminUser.id of the coordinator who logged
  -- the row. The front-end uses it to gate the edit/delete actions.
  created_by_id   text NOT NULL,
  created_by_name text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS expenses_date_idx
  ON expenses (expense_date DESC);

CREATE INDEX IF NOT EXISTS expenses_category_date_idx
  ON expenses (category, expense_date DESC);

CREATE INDEX IF NOT EXISTS expenses_paid_by_idx
  ON expenses (paid_by_name);

-- Auto-update `updated_at` on every UPDATE.
CREATE OR REPLACE FUNCTION expenses_touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_expenses_touch_updated_at ON expenses;
CREATE TRIGGER trg_expenses_touch_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION expenses_touch_updated_at();

-- ─────────── RLS ───────────
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read expenses"   ON expenses;
CREATE POLICY "Anyone can read expenses"
  ON expenses FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert expenses" ON expenses;
CREATE POLICY "Anyone can insert expenses"
  ON expenses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update expenses" ON expenses;
CREATE POLICY "Anyone can update expenses"
  ON expenses FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete expenses" ON expenses;
CREATE POLICY "Anyone can delete expenses"
  ON expenses FOR DELETE
  TO anon, authenticated
  USING (true);

-- ─────────── Storage bucket ───────────
-- Private bucket. UI generates 1-hour signed URLs at view/download time.
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-proofs', 'expense-proofs', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can read expense-proofs"   ON storage.objects;
CREATE POLICY "Anyone can read expense-proofs"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'expense-proofs');

DROP POLICY IF EXISTS "Anyone can upload expense-proofs" ON storage.objects;
CREATE POLICY "Anyone can upload expense-proofs"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'expense-proofs');

DROP POLICY IF EXISTS "Anyone can delete expense-proofs" ON storage.objects;
CREATE POLICY "Anyone can delete expense-proofs"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'expense-proofs');

DROP POLICY IF EXISTS "Anyone can update expense-proofs" ON storage.objects;
CREATE POLICY "Anyone can update expense-proofs"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'expense-proofs')
  WITH CHECK (bucket_id = 'expense-proofs');
