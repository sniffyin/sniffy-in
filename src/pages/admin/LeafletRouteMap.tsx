/**
 * admin/LeafletRouteMap.tsx
 *
 * OpenStreetMap/Leaflet renderer for the "Map & route" view — no API key,
 * always available. Straight-line dashed route only (no real road data
 * without a routing backend). Renders the shared RouteMapProps contract
 * (routeMapTypes.ts) so DayRouteMapModal.tsx can swap this for
 * GoogleRouteMap.tsx with no other changes.
 */

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteMapProps, firstNameOf, truncateLabel } from './routeMapTypes';

/** `html` is injected via innerHTML, unlike React-rendered Popup content —
 *  a customer-entered name must be escaped here or it'd be a stored-XSS
 *  hole in the admin dashboard. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CIRCLE_SIZE = 20;
const BUBBLE_HEIGHT = 14;
const ARROW_HEIGHT = 4;

/** `name`, when given, draws a small always-on speech-bubble tooltip
 *  (arrow pointing down into the stop) above the numbered circle — e.g.
 *  the pet parent's first name — so a stop is identifiable on the map
 *  without opening its popup. */
function numberedIcon(num: number, approximate: boolean, name?: string): L.DivIcon {
  const bg = approximate ? '#d97706' : '#7c3aed';
  const label = name ? escapeHtml(truncateLabel(firstNameOf(name), 8)) : '';
  const bubbleMaxWidth = 62;

  if (!label) {
    return L.divIcon({
      className: '',
      html: `<div style="
        background: ${bg}; color: #fff; width: ${CIRCLE_SIZE}px; height: ${CIRCLE_SIZE}px;
        border-radius: 9999px; display: flex; align-items: center; justify-content: center;
        font-size: 10px; font-weight: 800; border: 2px solid #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      ">${num}</div>`,
      iconSize: [CIRCLE_SIZE, CIRCLE_SIZE],
      iconAnchor: [CIRCLE_SIZE / 2, CIRCLE_SIZE / 2],
      popupAnchor: [0, -CIRCLE_SIZE / 2],
    });
  }

  const totalHeight = BUBBLE_HEIGHT + ARROW_HEIGHT + CIRCLE_SIZE;
  return L.divIcon({
    className: '',
    html: `<div style="display: flex; flex-direction: column; align-items: center;">
      <div style="
        background: #1f2937; color: #fff; border-radius: 5px;
        padding: 0 5px; height: ${BUBBLE_HEIGHT}px; line-height: ${BUBBLE_HEIGHT}px;
        font-size: 8.5px; font-weight: 700; white-space: nowrap;
        max-width: ${bubbleMaxWidth}px; overflow: hidden; text-overflow: ellipsis;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      ">${label}</div>
      <div style="
        width: 0; height: 0; margin-top: -1px;
        border-left: 4px solid transparent; border-right: 4px solid transparent;
        border-top: ${ARROW_HEIGHT}px solid #1f2937;
      "></div>
      <div style="
        background: ${bg}; color: #fff; width: ${CIRCLE_SIZE}px; height: ${CIRCLE_SIZE}px; flex-shrink: 0;
        border-radius: 9999px; display: flex; align-items: center; justify-content: center;
        font-size: 10px; font-weight: 800; border: 2px solid #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      ">${num}</div>
    </div>`,
    iconSize: [bubbleMaxWidth, totalHeight],
    iconAnchor: [bubbleMaxWidth / 2, totalHeight - CIRCLE_SIZE / 2],
    popupAnchor: [0, -(totalHeight - CIRCLE_SIZE / 2)],
  });
}

function homeIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      background: #16a34a; color: #fff; width: 28px; height: 28px;
      border-radius: 9999px; display: flex; align-items: center; justify-content: center;
      font-size: 13px; border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    ">🏠</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

/** Re-fits the map's viewport whenever the set of visible points changes —
 *  react-leaflet has no declarative "bounds" prop on MapContainer that
 *  reacts to prop changes after first mount. */
function FitBounds({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap();
  useMemo(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points.map(p => [p.lat, p.lng])), { padding: [14, 14] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points)]);
  return null;
}

export default function LeafletRouteMap({ markers, polyline, home }: RouteMapProps) {
  const linePoints = [
    ...(home ? [{ lat: home.lat, lng: home.lng }] : []),
    ...markers.map(m => ({ lat: m.lat, lng: m.lng })),
  ];

  if (linePoints.length === 0) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-gray-50 text-center px-6">
        <p className="text-xs text-gray-400">No sessions in this view have a usable GPS point.</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[linePoints[0].lat, linePoints[0].lng]}
      zoom={12}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={linePoints}/>

      {polyline && linePoints.length > 1 && (
        <Polyline
          positions={linePoints.map(p => [p.lat, p.lng])}
          pathOptions={{ color: '#7c3aed', weight: 3, dashArray: '6 8', opacity: 0.8 }}
        />
      )}

      {home && (
        <Marker position={[home.lat, home.lng]} icon={homeIcon()}>
          <Popup><strong>{home.label}</strong></Popup>
        </Marker>
      )}

      {markers.map(m => (
        m.order != null ? (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={numberedIcon(m.order, m.precision === 'approximate', m.popupSubtitle)}>
            <Popup>
              <div className="text-xs">
                <strong>Stop {m.order} · {m.popupTitle}</strong>
                <div>{m.popupSubtitle}</div>
                {m.popupAddress && <div className="text-gray-500">{m.popupAddress}</div>}
                {m.precision === 'approximate' && (
                  <div className="text-amber-600 mt-1">~ approximate area — locality match, not the exact address</div>
                )}
              </div>
            </Popup>
          </Marker>
        ) : (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={8}
            pathOptions={{ color: '#fff', weight: 2, fillColor: m.color, fillOpacity: 0.95 }}
          >
            <Popup>
              <div className="text-xs">
                <strong>{m.popupTitle}</strong>
                <div>{m.popupSubtitle}</div>
                {m.popupAddress && <div className="text-gray-500">{m.popupAddress}</div>}
                {m.precision === 'approximate' && <div className="text-amber-600 mt-1">~ approximate area</div>}
              </div>
            </Popup>
          </CircleMarker>
        )
      ))}
    </MapContainer>
  );
}
