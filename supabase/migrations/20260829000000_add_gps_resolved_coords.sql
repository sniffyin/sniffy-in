/*
  # Add resolved GPS coordinates to grooming_sessions

  `gps_location` stores whatever URL a coordinator pasted in — a WhatsApp
  location share, a Google Maps share link, or (often) a shortened link
  like maps.app.goo.gl that hides its coordinates behind a redirect the
  browser can't follow (no CORS headers). The "Map & route" day-accordion
  feature needs actual lat/lng to plot a stop and suggest a visit order,
  so the `resolve-gps-link` Edge Function does the redirect-follow (and,
  for links that only resolve to a place name, a Nominatim geocode) from
  the server side and writes the result back here.

  Columns
  -------
  - resolved_lat / resolved_lng   — the coordinates the Edge Function
    settled on.  NULL until first successfully resolved.
  - gps_resolved_precision        — 'exact' when the coordinates came
    straight out of a maps URL (own pin/share), 'approximate' when they
    came from geocoding a locality name instead (no exact building match)
    — the map UI marks these differently so a coordinator doesn't mistake
    a suburb-level guess for the actual address.
  - gps_resolved_at               — when it was resolved; also lets the
    Edge Function short-circuit (return the cached value) instead of
    re-following the link and re-geocoding on every "Resolve" click.

  Backward compatibility
  ----------------------
  - All four columns are nullable with no default → existing INSERT /
    UPDATE statements that don't mention them keep working.
  - Existing rows get NULL — the map UI treats that the same as "gps_location
    couldn't be parsed" (shows in the "couldn't place" list) until resolved.
  - `ADD COLUMN IF NOT EXISTS` → safe to re-run.
*/

ALTER TABLE public.grooming_sessions
  ADD COLUMN IF NOT EXISTS resolved_lat numeric,
  ADD COLUMN IF NOT EXISTS resolved_lng numeric,
  ADD COLUMN IF NOT EXISTS gps_resolved_precision text,
  ADD COLUMN IF NOT EXISTS gps_resolved_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'grooming_sessions_gps_resolved_precision_check'
  ) THEN
    ALTER TABLE public.grooming_sessions
      ADD CONSTRAINT grooming_sessions_gps_resolved_precision_check
      CHECK (gps_resolved_precision IS NULL OR gps_resolved_precision IN ('exact', 'approximate'));
  END IF;
END $$;

COMMENT ON COLUMN public.grooming_sessions.resolved_lat IS
  'Lat resolved from gps_location by the resolve-gps-link Edge Function (service-role write). NULL until resolved.';
COMMENT ON COLUMN public.grooming_sessions.resolved_lng IS
  'Lng resolved from gps_location by the resolve-gps-link Edge Function (service-role write). NULL until resolved.';
COMMENT ON COLUMN public.grooming_sessions.gps_resolved_precision IS
  '''exact'' = read straight off a maps URL. ''approximate'' = geocoded from a locality name (no exact address match).';
COMMENT ON COLUMN public.grooming_sessions.gps_resolved_at IS
  'When resolved_lat/resolved_lng were last written — lets the Edge Function skip re-resolving an already-solved link.';
