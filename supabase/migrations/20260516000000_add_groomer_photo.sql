/*
  # Add photo_url to groomers

  Lets the coordinator attach a profile photo when adding / editing a
  groomer in the admin "Groomers" tab.  The groomer's mobile dashboard
  (`/groomer` route) renders this image in the new MobileTopBar avatar
  and the SideDrawer header.  When NULL, the UI gracefully falls back
  to initials so this works whether the photo's been uploaded yet or
  not.

  Backward compatibility
  ----------------------
  - `photo_url` is nullable with no default → existing INSERT / UPDATE
    statements that don't mention it keep working.
  - Existing rows get NULL — the UI handles that path.
  - `ADD COLUMN IF NOT EXISTS` → safe to re-run.

  Storage
  -------
  The actual image is uploaded to the existing `groomer-uploads` bucket
  under the `profiles/` prefix (see uploadHelper.ts).  `photo_url` here
  stores the resulting public URL.
*/

ALTER TABLE public.groomers
  ADD COLUMN IF NOT EXISTS photo_url text;

COMMENT ON COLUMN public.groomers.photo_url IS
  'Optional public URL to the groomer''s profile photo (Supabase Storage).  '
  'Shown in the groomer''s top bar avatar.  NULL → initials fallback.';
