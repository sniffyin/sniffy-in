-- Helper roster + optional helper assignment on a session.
-- Purely additive: `helpers` is a new table; grooming_sessions.helper_id is a nullable column,
-- so every existing query / insert / view keeps working untouched.
-- Admin runs as `anon` (no Supabase Auth) so policies are granted to anon + authenticated (project pattern).

CREATE TABLE IF NOT EXISTS helpers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  phone           text NOT NULL,
  areas           text[] NOT NULL DEFAULT '{}',
  photo_url       text,
  availability    text,                         -- full_time | part_time | weekends
  is_active       boolean NOT NULL DEFAULT true,
  notes           text DEFAULT '',
  application_id  uuid,                         -- helper_applications.id it was created from
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE helpers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "helpers all access" ON helpers;
CREATE POLICY "helpers all access" ON helpers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE grooming_sessions ADD COLUMN IF NOT EXISTS helper_id uuid;
CREATE INDEX IF NOT EXISTS grooming_sessions_helper_idx ON grooming_sessions (helper_id) WHERE helper_id IS NOT NULL;

ALTER TABLE helper_applications ADD COLUMN IF NOT EXISTS converted_helper_id uuid;
