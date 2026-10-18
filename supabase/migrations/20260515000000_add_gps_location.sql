/*
  # Add gps_location column to grooming_sessions + cleanup legacy data

  Background
  ----------
  Until now we've only had a single freeform `address` column.  In practice
  the field has been overloaded by the coordinator team — sometimes a
  written address ("403, Amazon, Nyati Ethos, Handewadi"), sometimes a
  Google Maps share link ("https://maps.app.goo.gl/...").  This makes the
  groomer-side "Navigate" CTA brittle — we url-encode whatever's in there
  and pass it to maps.google.com/?q=, which works fine for plain
  addresses but is double-encoded garbage when the field already holds a
  share link.

  This migration:

    1. Adds a dedicated `gps_location text` column for the share link.
       Existing rows get NULL, which the UI treats as "no GPS — fall back
       to whatever's possible".
    2. Backfills `gps_location` from rows where the existing `address`
       field is — or contains — a URL.  After this, only "real" addresses
       remain in `address`; share links live in `gps_location`.

  Backward compatibility
  ----------------------
  - `gps_location` is nullable with no default → existing INSERT / UPDATE
    statements that don't mention it keep working.
  - The cleanup only touches rows whose `address` clearly contains
    `http://` or `https://`.  Plain text addresses are left intact.
  - When extracting a URL out of a mixed value we keep the surrounding
    text in `address` — we never lose a real address.
  - Idempotent: `ADD COLUMN IF NOT EXISTS`, and the backfill only fires
    when `gps_location IS NULL`, so re-running is a no-op.

  Notes on the regex
  ------------------
  We match `https?://` followed by any non-whitespace.  Google Maps share
  links never contain spaces, so this is safe.  The whitespace-aware
  replace then collapses any leftover gap so a value like
  `Wagholi, Pune  https://maps.app.goo.gl/abc` becomes a clean
  `Wagholi, Pune` after stripping.
*/

-- ─── 1. Add the column ────────────────────────────────────────

ALTER TABLE public.grooming_sessions
  ADD COLUMN IF NOT EXISTS gps_location text;

COMMENT ON COLUMN public.grooming_sessions.gps_location IS
  'Optional Google Maps / location share URL — used by the groomer Navigate CTA. NULL when not provided.';

-- ─── 2. Backfill from existing data ───────────────────────────
--
-- Anything in `address` that contains a URL (http:// or https://) is
-- split: the URL moves to `gps_location`, the remaining text stays in
-- `address`.  Pure-URL rows end up with `address = NULL`.

UPDATE public.grooming_sessions
   SET gps_location = (regexp_match(address, 'https?://[^\s]+'))[1],
       address      = NULLIF(
                        BTRIM(
                          regexp_replace(address, '\s*https?://[^\s]+\s*', ' ', 'g')
                        ),
                        ''
                      )
 WHERE gps_location IS NULL
   AND address IS NOT NULL
   AND address ~* 'https?://';

-- ─── 3. Optional helper index ─────────────────────────────────
-- The groomer "Navigate" check is just `gps_location IS NOT NULL`,
-- so no index is needed there.  We intentionally skip an index here
-- to keep the migration light.
