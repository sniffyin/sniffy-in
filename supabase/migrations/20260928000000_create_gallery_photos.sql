/*
  # Gallery photos — admin-managed public photo gallery (/gallery)

  ## What this adds
    1. New table      : gallery_photos
    2. Index          : (sort_order, created_at) for the display order
    3. RLS            : permissive policies — matches the project's
                         existing pattern (front-end auth already gates
                         uploads/reorder to /admin; the public site only
                         ever reads)
    4. Storage        : a DELETE policy on the existing `groomer-uploads`
                         bucket, scoped to the `gallery/` prefix only —
                         every other prefix in that bucket (arrivals,
                         reviews, completions) is intentionally
                         undeletable proof evidence, so this must not be
                         a blanket bucket-wide policy.

  ## Why reuse the `groomer-uploads` bucket instead of a new one?
  It's already public-read with anon INSERT (see
  20260313000000_create_groomer_applications.sql), and admin already
  writes into it under the `profiles/` prefix for coordinator/groomer
  avatars (src/pages/groomer/uploadHelper.ts). Gallery photos just add
  a `gallery/` prefix to the same bucket — no new bucket, no new base
  policies to maintain.

  ## Ordering
  `sort_order` is a plain integer the admin Gallery tab rewrites on
  every drag-reorder (0, 1, 2, ... in display order). New uploads are
  appended at the end (max(sort_order) + 1).
*/

CREATE TABLE IF NOT EXISTS gallery_photos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Path inside the `groomer-uploads` bucket, e.g. "gallery/<uuid>.webp".
  -- Kept alongside public_url so a delete can remove the storage object
  -- without re-deriving the path from the URL.
  storage_path    text NOT NULL,
  public_url      text NOT NULL,

  caption         text,
  sort_order      integer NOT NULL DEFAULT 0,
  file_size       integer NOT NULL DEFAULT 0,

  -- Audit — same shape as expenses.created_by_*.
  created_by_id   text NOT NULL,
  created_by_name text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gallery_photos_order_idx
  ON gallery_photos (sort_order, created_at);

-- ─────────── RLS ───────────
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read gallery photos" ON gallery_photos;
CREATE POLICY "Anyone can read gallery photos"
  ON gallery_photos FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert gallery photos" ON gallery_photos;
CREATE POLICY "Anyone can insert gallery photos"
  ON gallery_photos FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update gallery photos" ON gallery_photos;
CREATE POLICY "Anyone can update gallery photos"
  ON gallery_photos FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete gallery photos" ON gallery_photos;
CREATE POLICY "Anyone can delete gallery photos"
  ON gallery_photos FOR DELETE
  TO anon, authenticated
  USING (true);

-- ─────────── Storage: allow deleting gallery/* objects ───────────
-- groomer-uploads already has bucket-wide anon INSERT + public SELECT
-- (20260313000000_create_groomer_applications.sql). It has never had a
-- DELETE policy — intentional, since arrivals/reviews/completions are
-- proof photos nothing should be able to erase. This adds DELETE for
-- the gallery/ prefix only.
DROP POLICY IF EXISTS "Anyone can delete gallery uploads" ON storage.objects;
CREATE POLICY "Anyone can delete gallery uploads"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'groomer-uploads' AND (storage.foldername(name))[1] = 'gallery');
