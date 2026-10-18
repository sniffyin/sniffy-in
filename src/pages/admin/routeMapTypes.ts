/**
 * admin/routeMapTypes.ts
 *
 * Shared prop contract between the two interchangeable map renderers —
 * LeafletRouteMap.tsx (OpenStreetMap, no API key, always available) and
 * GoogleRouteMap.tsx (real Google tiles + real driving directions, used
 * when VITE_GOOGLE_MAPS_API_KEY is set). DayRouteMapModal.tsx computes
 * this once and hands it to whichever engine is active, so the two
 * renderers stay visually/behaviorally interchangeable — same markers,
 * same home base, same "does it draw a route line" toggle.
 */

export interface RouteMarker {
  id: string;
  lat: number;
  lng: number;
  /** Dot color in "spread" view (selected === 'ALL', no single route to
   *  order) — one color per groomer/Unassigned. Ignored once `order` is
   *  set, since a numbered stop is always drawn purple/amber instead. */
  color: string;
  /** 1-based position in the suggested visit order. Present only when a
   *  single groomer/Unassigned is selected; undefined in "spread" view. */
  order?: number;
  precision: 'exact' | 'approximate';
  popupTitle: string;
  popupSubtitle: string;
  popupAddress?: string | null;
}

export interface RouteMapHome {
  lat: number;
  lng: number;
  label: string;
}

export interface DrivingRouteInfo {
  km: number;
  minutes: number;
}

/** Shortens a marker's always-visible name label so the little pill next
 *  to a numbered stop stays compact regardless of how long the underlying
 *  pet-parent name is. Shared by both map renderers so the two look
 *  consistent. */
export function truncateLabel(name: string, max = 14): string {
  const trimmed = name.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

/** First name only — the always-on stop label is a quick "who's this"
 *  glance, not a full ID card, so the full pet-parent name is more than
 *  it needs to show. */
export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export interface RouteMapProps {
  markers: RouteMarker[];
  /** Draw a connecting line home → stop 1 → … → last stop. Only
   *  meaningful (and only ever true) when `home` is also set — the
   *  "spread" view (all groomers at once) never draws a route. */
  polyline: boolean;
  home?: RouteMapHome | null;
  /** Google mode only — reports the real driving distance/duration once
   *  the Directions Service resolves, or null if it couldn't (no route
   *  found, API error). Leaflet mode never calls this. */
  onDrivingRoute?: (info: DrivingRouteInfo | null) => void;
}
