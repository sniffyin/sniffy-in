/**
 * admin/routePlanning.ts — GPS parsing + route-ordering helpers for the
 * day-accordion "Map & Route" feature (SessionsTab.tsx / DayRouteMapModal.tsx).
 *
 * `gps_location` is a free-text URL a coordinator pasted in — a WhatsApp
 * location share, a Google Maps link, or (via the "use my location" button
 * in BookingWizard/CustomerPortalProfile) `https://www.google.com/maps?q=LAT,LNG`.
 * It is NOT geocoded and there is no Google Maps API key in this project
 * (see CLAUDE.md), so we can only recover coordinates that are already
 * spelled out in the URL text — a shortened link like maps.app.goo.gl/xxxx
 * hides them behind a redirect we have no CORS-safe way to resolve from the
 * browser. Callers must treat `parseLatLng` returning null as "no usable
 * GPS", not as an error — that address needs a human to check it.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Both groomers start their day from home in Dighi, Pune — every route
 * should begin here, not at whichever stop happens to have the earliest
 * scheduled_time. This is a locality-level OpenStreetMap geocode (no
 * exact house pinned), confirmed close enough for route-planning purposes
 * on 2026-08-29. Update this constant (or wire it to a real per-groomer
 * address) if that changes.
 */
export const GROOMER_HOME_BASE: LatLng = { lat: 18.6210, lng: 73.8690 };
export const GROOMER_HOME_BASE_LABEL = 'Dighi, Pune (home)';

// Order matters only in that the anchored bare-coordinate pattern is last —
// it's anchored to the whole trimmed string so it can never misfire on a
// substring of a URL.
const COORD_PATTERNS: RegExp[] = [
  /[?&]q=(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
  /[?&]ll=(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
  /[?&]daddr=(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
  /[?&]destination=(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
  /@(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)(?:,|$)/,
  /^(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/,
];

function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

/** Extracts {lat, lng} from a gps_location string, or null if it can't be
 *  recovered (short link, plain address text, empty). */
export function parseLatLng(raw: string | null | undefined): LatLng | null {
  const s = (raw ?? '').trim();
  if (!s) return null;
  for (const re of COORD_PATTERNS) {
    const m = s.match(re);
    if (!m) continue;
    const lat = parseFloat(m[1]);
    const lng = parseFloat(m[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }
  return null;
}

/** Great-circle distance in km — used only to rank stops by proximity.
 *  This is straight-line, not road distance; it will under-estimate actual
 *  drive distance around lakes/highways/one-ways. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface GpsCandidate {
  gps_location: string | null;
  resolved_lat?: number | null;
  resolved_lng?: number | null;
  gps_resolved_precision?: 'exact' | 'approximate' | null;
}

export interface ResolvedPoint extends LatLng {
  /** 'exact' — read straight off a maps URL (own share or resolved
   *  short-link). 'approximate' — the resolve-gps-link Edge Function had
   *  to fall back to geocoding a locality name, so this is a
   *  neighborhood-level guess, not the actual address. */
  precision: 'exact' | 'approximate';
}

/** The single place both the live map and the "couldn't place" list
 *  should look for coordinates: a previously-resolved value (from the
 *  resolve-gps-link Edge Function, cached on the row) takes priority
 *  over re-parsing gps_location, since the latter can only ever recover
 *  a link that already had bare coordinates in its text. */
export function getSessionPoint(s: GpsCandidate): ResolvedPoint | null {
  if (s.resolved_lat != null && s.resolved_lng != null) {
    return { lat: s.resolved_lat, lng: s.resolved_lng, precision: s.gps_resolved_precision ?? 'exact' };
  }
  const parsed = parseLatLng(s.gps_location);
  return parsed ? { ...parsed, precision: 'exact' } : null;
}

export interface RoutePoint<T> {
  item: T;
  point: LatLng;
  /** Used only to pick the starting stop and to break distance ties
   *  deterministically — earliest scheduled_time wins, "no time set" sorts
   *  last, then id as a stable tiebreak. */
  sortKey: string;
}

export interface RouteStop<T> {
  item: T;
  point: LatLng;
  /** Straight-line km from the previous stop; null for the first stop. */
  legKm: number | null;
}

/**
 * Greedy nearest-neighbor ordering. Two modes:
 *   - `fixedStart` given (the groomer's home base) — the route always
 *     begins there; the first *stop* in the result is whichever session
 *     is nearest to home, with its legKm already representing the
 *     home → first-stop leg (never null).
 *   - `fixedStart` omitted — starts at whichever point has the earliest
 *     sortKey (typically the day's earliest scheduled_time); that first
 *     stop's legKm is null since there's no "previous" point.
 * Either way this is a heuristic, not an optimal TSP solve — for the
 * ~5-15 stops one groomer does in a day it reliably avoids the
 * "zig-zag across town" pattern without needing a routing backend.
 */
export function planNearestNeighborRoute<T>(
  points: RoutePoint<T>[],
  fixedStart?: LatLng,
): { stops: RouteStop<T>[]; totalKm: number } {
  if (points.length === 0) return { stops: [], totalKm: 0 };

  const remaining = [...points];
  const stops: RouteStop<T>[] = [];
  let current: LatLng;
  let totalKm = 0;

  if (fixedStart) {
    current = fixedStart;
  } else {
    remaining.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    const start = remaining.shift()!;
    stops.push({ item: start.item, point: start.point, legKm: null });
    current = start.point;
  }

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(current, remaining[i].point);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const [next] = remaining.splice(bestIdx, 1);
    stops.push({ item: next.item, point: next.point, legKm: bestDist });
    totalKm += bestDist;
    current = next.point;
  }

  return { stops, totalKm };
}

/**
 * Chronological ordering — the stops in the order they were actually
 * scheduled (by `sortKey`, i.e. scheduled_time), not the optimized
 * nearest-neighbor sequence from `planNearestNeighborRoute`. This is the
 * "already planned" route a coordinator committed to when booking each
 * slot, shown as an alternative to the "ideal" suggested order so they can
 * compare the two. `legKm` is still the straight-line distance from the
 * previous stop (or `fixedStart`), just walked in schedule order instead
 * of shortest-hop order.
 */
export function planScheduledOrder<T>(
  points: RoutePoint<T>[],
  fixedStart?: LatLng,
): { stops: RouteStop<T>[]; totalKm: number } {
  if (points.length === 0) return { stops: [], totalKm: 0 };

  const ordered = [...points].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  const stops: RouteStop<T>[] = [];
  let current: LatLng | null = fixedStart ?? null;
  let totalKm = 0;

  for (const p of ordered) {
    const legKm = current ? haversineKm(current, p.point) : null;
    if (legKm !== null) totalKm += legKm;
    stops.push({ item: p.item, point: p.point, legKm });
    current = p.point;
  }

  return { stops, totalKm };
}

// Google's free "Directions URL API" (no key, no billing) accepts a bounded
// number of waypoints between origin and destination. We cap conservatively
// at 8 waypoints (10 stops total incl. origin/destination) — beyond that the
// link silently drops or reorders extra stops, which would be worse than
// just telling the coordinator to use the in-app list for the rest.
const MAX_GOOGLE_MAPS_WAYPOINTS = 8;

/** Builds a Google Maps multi-stop driving-directions URL from an ordered
 *  list of points (no API key required — this is the public web URL
 *  scheme). Returns null if there's nothing to route (0-1 points). Also
 *  reports how many trailing stops had to be dropped to stay under the
 *  free URL API's waypoint limit, so the caller can surface that instead
 *  of silently truncating. */
export function buildGoogleMapsDirectionsUrl(
  orderedPoints: LatLng[],
): { url: string; droppedCount: number } | null {
  if (orderedPoints.length < 2) return null;

  const capped = orderedPoints.slice(0, MAX_GOOGLE_MAPS_WAYPOINTS + 2);
  const droppedCount = orderedPoints.length - capped.length;

  const origin = capped[0];
  const destination = capped[capped.length - 1];
  const waypoints = capped.slice(1, -1);

  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: 'driving',
  });
  if (waypoints.length > 0) {
    params.set('waypoints', waypoints.map(p => `${p.lat},${p.lng}`).join('|'));
  }

  return { url: `https://www.google.com/maps/dir/?${params.toString()}`, droppedCount };
}
