/**
 * admin/GoogleRouteMap.tsx
 *
 * Real Google Maps tiles + a real driving route (via the Directions
 * Service), used in place of LeafletRouteMap.tsx when
 * VITE_GOOGLE_MAPS_API_KEY is set. Requires a Google Cloud project with
 * billing enabled and both "Maps JavaScript API" and "Directions API"
 * turned on for that key — see the setup note in DayRouteMapModal.tsx.
 *
 * Renders the same RouteMapProps contract as LeafletRouteMap.tsx
 * (routeMapTypes.ts) so the two are drop-in swaps for each other.
 *
 * Deliberately simple markers (classic `Marker` + a data-URI SVG icon,
 * native title tooltip) rather than AdvancedMarker + rich InfoWindow —
 * AdvancedMarker needs a Map ID resource created in Cloud Console first,
 * which is one more setup step this skips. Worth upgrading once the base
 * map is confirmed working with a real key.
 */

import { useEffect, useState } from 'react';
import { APIProvider, Map, Marker, Polyline, useApiIsLoaded, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import type { DrivingRouteInfo, RouteMarker, RouteMapHome, RouteMapProps } from './routeMapTypes';
import { firstNameOf, truncateLabel } from './routeMapTypes';

/** SVG text nodes aren't HTML — only `&`/`<`/`>` need escaping to keep a
 *  name with those characters from breaking the icon's XML. */
function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const CIRCLE_SIZE = 20;
const CIRCLE_R = CIRCLE_SIZE / 2 - 2;
const BUBBLE_HEIGHT = 13;
const ARROW_HEIGHT = 4;

/** `nameLabel` draws a small always-on speech-bubble tooltip (arrow
 *  pointing down into the stop) above the numbered circle — e.g. the pet
 *  parent's first name — so a stop is identifiable on the map without
 *  hovering for the native title tooltip. The circle stays the anchor
 *  point; the bubble is purely cosmetic and must never shift where the
 *  marker actually points. */
function svgMarkerIcon(color: string, label?: string, nameLabel?: string): google.maps.Icon {
  if (!nameLabel) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CIRCLE_SIZE}" height="${CIRCLE_SIZE}">
      <circle cx="${CIRCLE_SIZE / 2}" cy="${CIRCLE_SIZE / 2}" r="${CIRCLE_R}" fill="${color}" stroke="#fff" stroke-width="2"/>
      ${label ? `<text x="${CIRCLE_SIZE / 2}" y="${CIRCLE_SIZE / 2 * 1.1}" text-anchor="middle" dominant-baseline="middle" font-size="9" font-weight="800" fill="#fff" font-family="sans-serif">${label}</text>` : ''}
    </svg>`;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(CIRCLE_SIZE, CIRCLE_SIZE),
      anchor: new google.maps.Point(CIRCLE_SIZE / 2, CIRCLE_SIZE / 2),
    };
  }

  const text = escapeXml(truncateLabel(firstNameOf(nameLabel), 8));
  const bubbleWidth = Math.max(CIRCLE_SIZE, Math.ceil(text.length * 4.6) + 10);
  const width = Math.max(CIRCLE_SIZE, bubbleWidth);
  const cx = width / 2;
  const circleCy = BUBBLE_HEIGHT + ARROW_HEIGHT + CIRCLE_R;
  const height = circleCy + CIRCLE_R + 2;
  const bubbleX = cx - bubbleWidth / 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect x="${bubbleX}" y="0" width="${bubbleWidth}" height="${BUBBLE_HEIGHT}" rx="5" fill="#1f2937"/>
    <polygon points="${cx - 4},${BUBBLE_HEIGHT} ${cx + 4},${BUBBLE_HEIGHT} ${cx},${BUBBLE_HEIGHT + ARROW_HEIGHT}" fill="#1f2937"/>
    <text x="${cx}" y="${BUBBLE_HEIGHT / 2 + 2.8}" text-anchor="middle" font-size="8" font-weight="700" fill="#fff" font-family="sans-serif">${text}</text>
    <circle cx="${cx}" cy="${circleCy}" r="${CIRCLE_R}" fill="${color}" stroke="#fff" stroke-width="2"/>
    ${label ? `<text x="${cx}" y="${circleCy + 3.2}" text-anchor="middle" font-size="9" font-weight="800" fill="#fff" font-family="sans-serif">${label}</text>` : ''}
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(width, height),
    anchor: new google.maps.Point(cx, circleCy),
  };
}

/**
 * `svgMarkerIcon` needs `google.maps.Size`/`Point`, which don't exist
 * until the Maps JS script finishes its async load — computing them at
 * render time (unconditionally, the moment <GoogleRouteMap> mounts)
 * threw "google is not defined" and crashed the whole app with no
 * error boundary to catch it (confirmed 2026-08-31). `useApiIsLoaded`
 * is the documented way to gate on that; nothing here reads `google.*`
 * until it reports true.
 */
function RouteMarkers({ markers, home }: { markers: RouteMarker[]; home?: RouteMapHome | null }) {
  const loaded = useApiIsLoaded();
  if (!loaded) return null;

  return (
    <>
      {home && (
        <Marker position={{ lat: home.lat, lng: home.lng }} icon={svgMarkerIcon('#16a34a', 'H')} title={home.label}/>
      )}
      {markers.map(m => (
        <Marker
          key={m.id}
          position={{ lat: m.lat, lng: m.lng }}
          icon={svgMarkerIcon(
            m.order != null ? (m.precision === 'approximate' ? '#d97706' : '#7c3aed') : m.color,
            m.order != null ? String(m.order) : undefined,
            m.order != null ? m.popupSubtitle : undefined,
          )}
          title={`${m.popupSubtitle} — ${m.popupTitle}${m.precision === 'approximate' ? ' (approximate area)' : ''}`}
        />
      ))}
    </>
  );
}

function FitToPoints({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || points.length === 0) return;
    if (points.length === 1) {
      map.setCenter(points[0]);
      map.setZoom(14);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    points.forEach(p => bounds.extend(p));
    map.fitBounds(bounds, 12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, JSON.stringify(points)]);
  return null;
}

/** Fetches the real driving route (home → ordered stops) via the
 *  Directions Service and draws its actual road path — `optimizeWaypoints`
 *  is deliberately off since routePlanning.ts already decided the order. */
function DirectionsLayer({
  home, orderedPoints, onDrivingRoute,
}: {
  home: { lat: number; lng: number };
  orderedPoints: { lat: number; lng: number }[];
  onDrivingRoute?: (info: DrivingRouteInfo | null) => void;
}) {
  const routesLib = useMapsLibrary('routes');
  const [path, setPath] = useState<google.maps.LatLngLiteral[] | null>(null);

  useEffect(() => {
    if (!routesLib || orderedPoints.length === 0) {
      setPath(null);
      onDrivingRoute?.(null);
      return;
    }
    const service = new routesLib.DirectionsService();
    const last = orderedPoints[orderedPoints.length - 1];
    const waypoints = orderedPoints.slice(0, -1).map(p => ({ location: p, stopover: true as const }));

    let cancelled = false;
    service.route({
      origin: home,
      destination: last,
      waypoints,
      optimizeWaypoints: false,
      travelMode: google.maps.TravelMode.DRIVING,
    }).then(result => {
      if (cancelled) return;
      const overview = result.routes[0]?.overview_path?.map(p => ({ lat: p.lat(), lng: p.lng() })) ?? null;
      setPath(overview);
      const legs = result.routes[0]?.legs ?? [];
      const km = legs.reduce((sum, l) => sum + (l.distance?.value ?? 0), 0) / 1000;
      const minutes = legs.reduce((sum, l) => sum + (l.duration?.value ?? 0), 0) / 60;
      onDrivingRoute?.({ km, minutes });
    }).catch(() => {
      if (cancelled) return;
      setPath(null);
      onDrivingRoute?.(null);
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routesLib, JSON.stringify(home), JSON.stringify(orderedPoints)]);

  if (!path) return null;
  return <Polyline path={path} strokeColor="#7c3aed" strokeWeight={4} strokeOpacity={0.85}/>;
}

export default function GoogleRouteMap({ apiKey, markers, polyline, home, onDrivingRoute }: RouteMapProps & { apiKey: string }) {
  const allPoints = [
    ...(home ? [{ lat: home.lat, lng: home.lng }] : []),
    ...markers.map(m => ({ lat: m.lat, lng: m.lng })),
  ];

  if (allPoints.length === 0) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-gray-50 text-center px-6">
        <p className="text-xs text-gray-400">No sessions in this view have a usable GPS point.</p>
      </div>
    );
  }

  const orderedStops = markers.filter(m => m.order != null).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={allPoints[0]}
        defaultZoom={12}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <FitToPoints points={allPoints}/>

        {polyline && home && orderedStops.length > 0 && (
          <DirectionsLayer
            home={{ lat: home.lat, lng: home.lng }}
            orderedPoints={orderedStops.map(m => ({ lat: m.lat, lng: m.lng }))}
            onDrivingRoute={onDrivingRoute}
          />
        )}

        <RouteMarkers markers={markers} home={home}/>
      </Map>
    </APIProvider>
  );
}
