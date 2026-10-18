-- Run once in Supabase SQL editor. Includes the passport/signature columns (safe if already present).
-- Passport-size photo + drawn signature captured on the groomer onboarding form.
-- Files live in the existing `groomer-uploads` bucket (passport/, signature/).
ALTER TABLE groomer_applications
  ADD COLUMN IF NOT EXISTS passport_photo_url text,
  ADD COLUMN IF NOT EXISTS signature_url      text;

-- Admin review of groomer onboarding applications.
--
-- The admin dashboard has no Supabase Auth session (it runs as `anon`), but the
-- original policies only allowed SELECT/UPDATE for `authenticated`, so the admin
-- could never see submitted applications. Widen to anon (project pattern) and add
-- the columns needed to track conversion into a real `groomers` row.
-- Also relaxes NOT NULLs for fields the current onboarding form no longer collects.

DROP POLICY IF EXISTS "Authenticated users can view groomer applications"   ON groomer_applications;
DROP POLICY IF EXISTS "Authenticated users can update groomer applications" ON groomer_applications;
DROP POLICY IF EXISTS "Admin can view groomer applications"   ON groomer_applications;
DROP POLICY IF EXISTS "Admin can update groomer applications" ON groomer_applications;
DROP POLICY IF EXISTS "Admin can delete groomer applications" ON groomer_applications;

CREATE POLICY "Admin can view groomer applications"
  ON groomer_applications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can update groomer applications"
  ON groomer_applications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can delete groomer applications"
  ON groomer_applications FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE groomer_applications
  ADD COLUMN IF NOT EXISTS converted_groomer_id uuid,
  ADD COLUMN IF NOT EXISTS converted_at         timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by          text,
  -- Soft-delete: archived rows are hidden from the admin inbox but kept in the DB.
  ADD COLUMN IF NOT EXISTS archived_at          timestamptz;

-- Live table drifted from the original CREATE (e.g. no `email` column), so only
-- touch columns that actually exist.
DO $$
DECLARE c text;
BEGIN
  FOREACH c IN ARRAY ARRAY['email','city','has_own_kit','service_mode'] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'groomer_applications' AND column_name = c
    ) THEN
      EXECUTE format('ALTER TABLE groomer_applications ALTER COLUMN %I DROP NOT NULL', c);
    END IF;
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS groomer_applications_status_idx
  ON groomer_applications (status, created_at DESC);
