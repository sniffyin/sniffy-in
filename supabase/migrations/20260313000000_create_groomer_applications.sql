/*
  # Create groomer_applications table + Storage bucket

  Table: groomer_applications
  Storage bucket: groomer-uploads  (portfolio photos, aadhaar, certificates)
*/

-- ─── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS groomer_applications (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Personal info
  full_name               text    NOT NULL,
  phone                   text    NOT NULL,
  email                   text    NOT NULL,
  city                    text    NOT NULL,
  areas                   text[]  NOT NULL DEFAULT '{}',

  -- Services
  pets                    text[]  NOT NULL DEFAULT '{}',
  services                text[]  NOT NULL DEFAULT '{}',

  -- Experience
  years_experience        integer NOT NULL DEFAULT 0,
  previous_backgrounds    text[]           DEFAULT '{}',
  has_own_kit             text    NOT NULL,          -- 'yes' | 'no'
  service_mode            text    NOT NULL,          -- 'mobile' | 'salon'
  bio                     text             DEFAULT '',

  -- Uploaded file URLs (stored in Supabase Storage)
  portfolio_urls          text[]           DEFAULT '{}',
  aadhaar_urls            text[]           DEFAULT '{}',
  certificate_urls        text[]           DEFAULT '{}',

  -- Consent flags
  consent_terms           boolean NOT NULL DEFAULT false,
  consent_background_check boolean NOT NULL DEFAULT false,
  consent_whatsapp        boolean          DEFAULT false,

  -- Admin fields
  status                  text    NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  admin_notes             text             DEFAULT '',

  created_at              timestamptz      DEFAULT now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE groomer_applications ENABLE ROW LEVEL SECURITY;

-- Public (anon) can INSERT a new application
CREATE POLICY "Anyone can submit a groomer application"
  ON groomer_applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated Sniffy admins can view / update applications
CREATE POLICY "Authenticated users can view groomer applications"
  ON groomer_applications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update groomer applications"
  ON groomer_applications
  FOR UPDATE
  TO authenticated
  USING (true);


-- ─── Storage bucket ───────────────────────────────────────────────────────────
-- Run this ONCE in the Supabase SQL editor (Storage buckets can also be
-- created via Dashboard → Storage → New bucket).

INSERT INTO storage.buckets (id, name, public)
VALUES ('groomer-uploads', 'groomer-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload into the bucket
CREATE POLICY "Anyone can upload groomer files"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'groomer-uploads');

-- Public read (so uploaded images can be displayed)
CREATE POLICY "Public read groomer files"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'groomer-uploads');
