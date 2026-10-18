/**
 * resolve-gps-link — Supabase Edge Function
 *
 * `grooming_sessions.gps_location` holds whatever URL a coordinator
 * pasted in — often a shortened link (maps.app.goo.gl / goo.gl/maps)
 * whose real coordinates sit behind a redirect. The browser can't
 * follow that redirect itself (Google's redirect response carries no
 * CORS headers, so `fetch()` from the admin dashboard fails outright —
 * verified 2026-08-29). This function does the same follow server-side,
 * where CORS doesn't apply, and — when the resolved link only points at
 * a place name rather than bare coordinates — falls back to geocoding
 * that name so the "Map & route" day-accordion view still has *something*
 * to plot.
 *
 * Resolution order (first hit wins)
 *   1. Coordinates already sit in the given URL as-is (q=/@/.../ll=/daddr=).
 *   2. Follow the URL's redirect chain server-side, then re-check for #1
 *      on the final URL (this is what unlocks maps.app.goo.gl links).
 *   3. Pull the place name out of a resolved `/maps/place/<name>/` URL and
 *      geocode it via OpenStreetMap Nominatim — tried at decreasing
 *      specificity (full name → drop the building/society → just the
 *      locality/city) since Nominatim rarely has Indian society names
 *      indexed but usually has the suburb. This is marked 'approximate'
 *      (not 'exact') so the map UI can flag it as a locality-level guess.
 *
 * Every resolution is cached onto the session row (resolved_lat/lng,
 * gps_resolved_precision, gps_resolved_at) via the service-role key, so
 * a given link is only ever resolved once — repeat calls short-circuit
 * on the cached value instead of re-hitting Google/Nominatim.
 *
 * Nominatim's public instance asks for a real identifying User-Agent and
 * a max of ~1 request/second — both honored below. This function makes
 * no calls that require an API key or billing account.
 *
 * ─── Deploy ─────────────────────────────────────────────────
 *   supabase functions deploy resolve-gps-link
 *   (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are auto-injected by the
 *    Edge Functions runtime — no secrets to set for this one.)
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// Nominatim's usage policy: identify the app, cap the public instance at
// roughly one request/second.
const NOMINATIM_USER_AGENT = 'SniffyOpsRoutePlanner/1.0 (internal coordinator tool)';
const NOMINATIM_DELAY_MS = 1100;

// Mirrors src/pages/admin/routePlanning.ts's COORD_PATTERNS — keep the two
// in sync if either changes (same reasoning as normalize_phone existing
// twice, per CLAUDE.md).
const COORD_PATTERNS: RegExp[] = [
  /[?&]q=(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
  /[?&]ll=(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
  /[?&]daddr=(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
  /[?&]destination=(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
  /@(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)(?:,|$)/,
  /^(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/,
];

interface LatLng { lat: number; lng: number }

function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

function extractCoords(raw: string): LatLng | null {
  const s = raw.trim();
  for (const re of COORD_PATTERNS) {
    const m = s.match(re);
    if (!m) continue;
    const lat = parseFloat(m[1]);
    const lng = parseFloat(m[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }
  return null;
}

async function followRedirect(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': BROWSER_USER_AGENT },
    });
    // Consume the body so the connection can be reused/closed cleanly —
    // we only care about the final URL, not the HTML itself.
    await res.arrayBuffer().catch(() => undefined);
    return res.url || url;
  } catch {
    return url;
  }
}

function extractPlaceName(url: string): string | null {
  const m = url.match(/\/maps\/place\/([^/@]+)/);
  if (!m) return null;
  const decoded = decodeURIComponent(m[1].replace(/\+/g, ' ')).trim();
  return decoded || null;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Tries the full place name first, then progressively drops the leading
 *  (most specific — usually a building/society name Nominatim won't
 *  have) comma-separated segment, down to just the locality/city. A
 *  locality-level pin is still useful for grouping nearby stops even
 *  though it isn't the exact building — callers must treat this as
 *  'approximate', never 'exact'. */
async function geocodePlaceName(name: string): Promise<LatLng | null> {
  const parts = name.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  for (let i = 0; i < parts.length; i++) {
    const query = parts.slice(i).join(', ');
    if (i > 0) await sleep(NOMINATIM_DELAY_MS);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { 'User-Agent': NOMINATIM_USER_AGENT } },
      );
      if (!res.ok) continue;
      const rows = await res.json();
      if (Array.isArray(rows) && rows[0]) {
        const lat = parseFloat(rows[0].lat);
        const lng = parseFloat(rows[0].lon);
        if (isValidLatLng(lat, lng)) return { lat, lng };
      }
    } catch {
      // try the next, shorter query
    }
  }
  return null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  let body: { sessionId?: unknown; url?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  const { sessionId, url } = body;
  if (typeof sessionId !== 'string' || !sessionId || typeof url !== 'string' || !url.trim()) {
    return json({ ok: false, error: 'sessionId and url are both required' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return json({ ok: false, error: 'Server misconfigured — missing Supabase service credentials' }, 500);
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { data: existing } = await supabase
      .from('grooming_sessions')
      .select('resolved_lat, resolved_lng, gps_resolved_precision')
      .eq('id', sessionId)
      .maybeSingle();

    if (existing?.resolved_lat != null && existing?.resolved_lng != null) {
      return json({
        ok: true,
        lat: existing.resolved_lat,
        lng: existing.resolved_lng,
        precision: existing.gps_resolved_precision ?? 'exact',
        cached: true,
      });
    }

    let coords = extractCoords(url);
    let precision: 'exact' | 'approximate' | null = coords ? 'exact' : null;
    let finalUrl = url;

    if (!coords) {
      finalUrl = await followRedirect(url);
      coords = extractCoords(finalUrl);
      if (coords) precision = 'exact';
    }

    if (!coords) {
      const placeName = extractPlaceName(finalUrl);
      if (placeName) {
        coords = await geocodePlaceName(placeName);
        if (coords) precision = 'approximate';
      }
    }

    if (!coords || !precision) {
      return json({ ok: false, error: "Couldn't resolve this link to a location" });
    }

    const { error: updateError } = await supabase
      .from('grooming_sessions')
      .update({
        resolved_lat: coords.lat,
        resolved_lng: coords.lng,
        gps_resolved_precision: precision,
        gps_resolved_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      // We still resolved a usable point — hand it back even though the
      // cache write failed, so this click isn't wasted for the coordinator.
      return json({ ok: true, lat: coords.lat, lng: coords.lng, precision, cached: false, cacheWriteFailed: true });
    }

    return json({ ok: true, lat: coords.lat, lng: coords.lng, precision, cached: false });
  } catch (err) {
    return json({ ok: false, error: err instanceof Error ? err.message : 'Unexpected error resolving link' }, 500);
  }
}

Deno.serve(handler);
