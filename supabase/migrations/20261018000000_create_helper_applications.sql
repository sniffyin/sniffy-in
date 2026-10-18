-- "Helper" applications: people who accompany a groomer on a visit (holding/calming the pet,
-- setup & cleanup, towel-drying, carrying the kit). Kept in its OWN table so the existing
-- groomer_applications inbox and "Convert to Groomer" flow are untouched.
-- Same RLS pattern as groomer_applications: public insert, admin (anon, no Supabase Auth) manages.
-- Uploads reuse the existing `groomer-uploads` bucket (folders: helper-passport/, helper-aadhaar/, helper-signature/).

CREATE TABLE IF NOT EXISTS helper_applications (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  full_name                 text    NOT NULL,
  phone                     text    NOT NULL,
  age                       integer,
  areas                     text[]  NOT NULL DEFAULT '{}',

  tasks                     text[]  NOT NULL DEFAULT '{}',   -- what they can help with
  pets_comfortable_with     text[]  NOT NULL DEFAULT '{}',   -- dog | cat
  availability              text,                            -- full_time | part_time | weekends
  has_vehicle               text,                            -- yes | no
  languages                 text[]  NOT NULL DEFAULT '{}',
  experience_level          text,                            -- none | pet_shop | kennel | groomer_assistant
  aspiring_groomer          boolean NOT NULL DEFAULT false,  -- wants to grow into a groomer

  aadhaar_urls              text[]  DEFAULT '{}',
  passport_photo_url        text,
  signature_url             text,

  consent_terms             boolean NOT NULL DEFAULT false,
  consent_background_check  boolean NOT NULL DEFAULT false,
  consent_whatsapp          boolean DEFAULT false,

  status                    text    NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  admin_notes               text    DEFAULT '',
  reviewed_by               text,
  archived_at               timestamptz,
  created_at                timestamptz DEFAULT now()
);

ALTER TABLE helper_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a helper application" ON helper_applications;
DROP POLICY IF EXISTS "Admin can view helper applications"     ON helper_applications;
DROP POLICY IF EXISTS "Admin can update helper applications"   ON helper_applications;
DROP POLICY IF EXISTS "Admin can delete helper applications"   ON helper_applications;

CREATE POLICY "Anyone can submit a helper application"
  ON helper_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin can view helper applications"
  ON helper_applications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can update helper applications"
  ON helper_applications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can delete helper applications"
  ON helper_applications FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS helper_applications_status_idx
  ON helper_applications (status, created_at DESC);
