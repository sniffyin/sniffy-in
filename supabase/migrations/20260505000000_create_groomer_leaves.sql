/*
  # Groomer leaves — leave-request workflow for the calendar view

  ## What this adds
    1. New table  : groomer_leaves
    2. Indexes    : (groomer_id, leave_date) and (status) for quick filtering
    3. RLS        : enabled with permissive policies (matching the existing
                     pattern in this project where the front-end auth gate
                     already restricts access to /admin and /groomer)

  ## Notes on groomer_id
  The grooming_sessions table already stores groomer_id as text (e.g.
  'groomer-1', 'f9231873-...'). We keep the same shape here so the calendar
  can join on the value the front-end already passes around (the value of
  `groomer.groomer_id ?? groomer.id`).

  ## Status flow
    pending  → just-applied, needs admin/coordinator approval
    approved → coordinator/admin clicked Approve
    rejected → coordinator/admin clicked Reject

  Only an `approved` leave is treated as actually-on-leave for the day.
*/

CREATE TABLE IF NOT EXISTS groomer_leaves (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  groomer_id    text NOT NULL,
  groomer_name  text NOT NULL,
  leave_date    date NOT NULL,
  reason        text NOT NULL DEFAULT '',
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected','lwp')),
  approved_by   text,
  approved_at   timestamptz,
  rejected_note text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  -- A groomer cannot have two leave rows for the same date
  CONSTRAINT groomer_leaves_groomer_date_uniq UNIQUE (groomer_id, leave_date)
);

CREATE INDEX IF NOT EXISTS groomer_leaves_groomer_idx
  ON groomer_leaves (groomer_id, leave_date DESC);

CREATE INDEX IF NOT EXISTS groomer_leaves_status_idx
  ON groomer_leaves (status);

CREATE INDEX IF NOT EXISTS groomer_leaves_date_idx
  ON groomer_leaves (leave_date);

-- ─────────── auto-bump updated_at ───────────
CREATE OR REPLACE FUNCTION groomer_leaves_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS groomer_leaves_updated_at_trg ON groomer_leaves;
CREATE TRIGGER groomer_leaves_updated_at_trg
  BEFORE UPDATE ON groomer_leaves
  FOR EACH ROW EXECUTE FUNCTION groomer_leaves_set_updated_at();

-- ─────────── RLS ───────────
ALTER TABLE groomer_leaves ENABLE ROW LEVEL SECURITY;

-- Front-end is already gated by AdminLoginGate / GroomerLoginGate, so we
-- mirror the existing project pattern: anon can read & write.
-- Tighten later by switching to authenticated + JWT claims if you adopt
-- Supabase Auth.

DROP POLICY IF EXISTS "Anyone can read leaves"   ON groomer_leaves;
CREATE POLICY "Anyone can read leaves"
  ON groomer_leaves FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert leaves" ON groomer_leaves;
CREATE POLICY "Anyone can insert leaves"
  ON groomer_leaves FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update leaves" ON groomer_leaves;
CREATE POLICY "Anyone can update leaves"
  ON groomer_leaves FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete leaves" ON groomer_leaves;
CREATE POLICY "Anyone can delete leaves"
  ON groomer_leaves FOR DELETE
  TO anon, authenticated
  USING (true);
