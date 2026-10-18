/*
  # Groomer documents — coordinator uploads, groomers read.

  ## What this adds
    1. New table         : groomer_documents
    2. Indexes           : (groomer_id, created_at) for groomer view,
                            (scope) for coordinator filtering
    3. Storage bucket    : `groomer-documents` (private, signed URLs)
    4. RLS               : enabled with permissive policies — matches the
                            existing project pattern (front-end auth
                            already gates /admin and /groomer).

  ## Visibility model
  Each document has a `scope` that controls who can see it:
    'all'      → broadcast: every groomer sees it (policies, notices)
    'groomer'  → person-specific: only groomers.groomer_id matching the
                  row's groomer_id sees it (salary slips, offer letters)
    'admin'    → coordinator-only: not visible to any groomer; lives in
                  the coordinator's own folder

  The actual visibility check happens in the front-end query
  (documentsApi.ts).  RLS stays permissive to match the rest of the
  project — tighten later by adopting Supabase Auth + JWT claims.

  ## File storage
  PDFs (and other files) are uploaded to the private `groomer-documents`
  Supabase Storage bucket.  The DB row stores `file_path` (the path
  inside the bucket); the UI generates a short-lived signed URL on
  download — keeps salary slips and offer letters from being reachable
  via raw URL.

  ## Why a separate bucket from `groomer-uploads`?
  `groomer-uploads` is public-read and used for selfies / review
  screenshots — fine for forensic proofs.  Documents (salary, offer
  letter, ID proofs) are sensitive; private bucket + signed URL keeps
  them out of search engines and link sharing.
*/

CREATE TABLE IF NOT EXISTS groomer_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  file_path     text NOT NULL,          -- path inside the bucket
  file_name     text NOT NULL,          -- original filename (for display + download)
  mime_type     text NOT NULL DEFAULT 'application/pdf',
  size_bytes    integer NOT NULL DEFAULT 0,
  scope         text NOT NULL
                  CHECK (scope IN ('all','groomer','admin')),
  groomer_id    text,                   -- required when scope='groomer'
  groomer_name  text,                   -- denormalised for display
  uploaded_by   text NOT NULL,          -- coordinator's name (audit)
  notes         text,                   -- optional caption
  created_at    timestamptz NOT NULL DEFAULT now(),

  -- A 'groomer'-scope row must name the groomer.
  CONSTRAINT groomer_documents_scope_groomer_required
    CHECK (scope <> 'groomer' OR groomer_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS groomer_documents_groomer_idx
  ON groomer_documents (groomer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS groomer_documents_scope_idx
  ON groomer_documents (scope, created_at DESC);

-- ─────────── RLS ───────────
ALTER TABLE groomer_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read documents"   ON groomer_documents;
CREATE POLICY "Anyone can read documents"
  ON groomer_documents FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert documents" ON groomer_documents;
CREATE POLICY "Anyone can insert documents"
  ON groomer_documents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update documents" ON groomer_documents;
CREATE POLICY "Anyone can update documents"
  ON groomer_documents FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete documents" ON groomer_documents;
CREATE POLICY "Anyone can delete documents"
  ON groomer_documents FOR DELETE
  TO anon, authenticated
  USING (true);

-- ─────────── Storage bucket ───────────
-- Private bucket (public=false).  The UI generates signed URLs valid for
-- 1 hour at download time (see documentsApi.getSignedUrl).
INSERT INTO storage.buckets (id, name, public)
VALUES ('groomer-documents', 'groomer-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies — same permissive shape as the table policies.
-- (Storage RLS is separate from table RLS.)
DROP POLICY IF EXISTS "Anyone can read groomer-documents"   ON storage.objects;
CREATE POLICY "Anyone can read groomer-documents"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'groomer-documents');

DROP POLICY IF EXISTS "Anyone can upload groomer-documents" ON storage.objects;
CREATE POLICY "Anyone can upload groomer-documents"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'groomer-documents');

DROP POLICY IF EXISTS "Anyone can delete groomer-documents" ON storage.objects;
CREATE POLICY "Anyone can delete groomer-documents"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'groomer-documents');

DROP POLICY IF EXISTS "Anyone can update groomer-documents" ON storage.objects;
CREATE POLICY "Anyone can update groomer-documents"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'groomer-documents')
  WITH CHECK (bucket_id = 'groomer-documents');
