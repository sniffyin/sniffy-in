/**
 * admin/DayRouteMapModal.tsx
 *
 * "Map & Route" button inside a day's accordion (SessionsTab.tsx) opens
 * this. Three things live here:
 *
 *   1. Per-groomer route view — pick a groomer (or "Unassigned"/"All")
 *      and see their day's stops plotted + a suggested visit order,
 *      starting from GROOMER_HOME_BASE (Dighi, Pune — home for both
 *      groomers, see routePlanning.ts).
 *   2. GPS resolution — sessions whose gps_location is a short link
 *      (maps.app.goo.gl) get auto-resolved via the resolve-gps-link Edge
 *      Function as soon as the modal opens, no manual click needed. A
 *      manual retry stays available for whatever fails.
 *   3. Suggested assignment ("Suggest split") — for the day's still-
 *      UNASSIGNED sessions, greedily fills a priority groomer's route up
 *      to a capacity, then routes whatever's left to a second groomer —
 *      both starting from Dighi — and lets the coordinator assign either
 *      batch with one tap instead of picking a groomer per card by hand.
 *
 * Map rendering is delegated to one of two interchangeable components
 * (routeMapTypes.ts is their shared prop contract):
 *   - LeafletRouteMap  — OpenStreetMap tiles, no API key, always works.
 *     The route line is a straight-line heuristic (planNearestNeighborRoute
 *     in routePlanning.ts) — a planning aid, not turn-by-turn navigation.
 *   - GoogleRouteMap   — real Google tiles + a real driving route via the
 *     Directions Service, used automatically once VITE_GOOGLE_MAPS_API_KEY
 *     is set (needs a Google Cloud project with billing enabled and both
 *     "Maps JavaScript API" and "Directions API" turned on for that key).
 * "Open in Google Maps" always hands the stop order to Google's free
 * directions URL for a real route, regardless of which map is showing.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, AlertTriangle, Loader2, Target, Check } from 'lucide-react';
import { GroomingSession, fmtCurrency } from './types';
import { abbreviateGroomerName, type AssignGroomer } from './SessionsTab';
import {
  getSessionPoint, planNearestNeighborRoute, planScheduledOrder, buildGoogleMapsDirectionsUrl,
  GROOMER_HOME_BASE, GROOMER_HOME_BASE_LABEL,
  type RoutePoint, type RouteStop, type ResolvedPoint,
} from './routePlanning';
import { resolveGpsLink } from './resolveGpsApi';
import type { RouteMarker, DrivingRouteInfo } from './routeMapTypes';
import LeafletRouteMap from './LeafletRouteMap';
import GoogleRouteMap from './GoogleRouteMap';

type RoutedSession = GroomingSession & { precision: 'exact' | 'approximate' };

const PALETTE = ['#7c3aed', '#059669', '#d97706', '#dc2626', '#0ea5e9', '#db2777', '#65a30d', '#0891b2'];
const UNASSIGNED_COLOR = '#9ca3af';
const DEFAULT_PRIORITY_CAPACITY = 4;

// Set VITE_GOOGLE_MAPS_API_KEY (a Google Cloud key with "Maps JavaScript
// API" + "Directions API" enabled, billing on) to switch from the free
// OpenStreetMap map to real Google tiles + a real driving route. Until
// then this stays undefined and LeafletRouteMap renders as before.
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

function fmtTime(t: string | null): string {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${suffix}`;
}

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] ?? full;
}

interface DayRouteMapModalProps {
  open: boolean;
  date: string;
  dateLabel: string;
  sessions: GroomingSession[];
  assignGroomers: AssignGroomer[];
  onAssign: (sessionId: string, g: AssignGroomer) => Promise<void> | void;
  onClose: () => void;
}

export default function DayRouteMapModal({
  open, dateLabel, sessions, assignGroomers, onAssign, onClose,
}: DayRouteMapModalProps) {
  const routable = sessions.filter(s => s.status !== 'cancelled');

  const groomerCounts = (() => {
    const counts = new Map<string, number>();
    for (const s of routable) {
      if (s.groomer_name) counts.set(s.groomer_name, (counts.get(s.groomer_name) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  })();

  const unassignedCount = routable.filter(s => !s.groomer_name).length;

  const [selected, setSelected] = useState<string>(() => groomerCounts[0]?.name ?? 'ALL');

  // "Suggested" = ideal nearest-neighbor route; "Planned" = the stops in
  // the order they were actually scheduled (by time). Only meaningful for
  // the normal per-groomer/date route view, not the "Suggest split" mode.
  const [orderMode, setOrderMode] = useState<'suggested' | 'planned'>('suggested');

  // Coordinates resolved via the resolve-gps-link Edge Function (see
  // resolveGpsApi.ts) for sessions whose gps_location couldn't be parsed
  // directly — e.g. a maps.app.goo.gl short link. The Edge Function
  // caches the result on the row; keeping it in local state too means
  // this modal reflects a resolve immediately, without waiting on
  // SessionsTab to refetch the whole day.
  const [overrides, setOverrides] = useState<Record<string, ResolvedPoint>>({});
  const [resolveState, setResolveState] = useState<Record<string, 'pending' | 'failed'>>({});
  const anyResolving = Object.values(resolveState).includes('pending');

  // Only meaningful in Google Maps mode — the real driving distance/time
  // for the current route, reported by GoogleRouteMap once the Directions
  // Service resolves. Null in Leaflet mode (stays the straight-line
  // estimate) or if Google couldn't find a route.
  const [drivingRoute, setDrivingRoute] = useState<DrivingRouteInfo | null>(null);

  // "Suggest split" — null when off. When on, `slot` picks which
  // priority group's route is currently shown (0 = fills first, up to
  // priorityCapacity; 1 = gets whatever's left).
  const [suggestSlot, setSuggestSlot] = useState<0 | 1 | null>(null);
  const [priorityIds, setPriorityIds] = useState<[string, string]>(['', '']);
  const [priorityCapacity, setPriorityCapacity] = useState(DEFAULT_PRIORITY_CAPACITY);
  const [justAssigned, setJustAssigned] = useState<Set<string>>(new Set());
  // Once a slot's batch has actually been assigned, its capacity is
  // considered spent — the leftover pool must all go to the *other*
  // slot, not get re-offered back to whoever was just filled just
  // because the pool shrank to fewer than their capacity.
  const [slotAssigned, setSlotAssigned] = useState<[boolean, boolean]>([false, false]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (assignGroomers.length === 0) return;
    setPriorityIds(prev => (prev[0] || prev[1])
      ? prev
      : [assignGroomers[0]?.id ?? '', assignGroomers[1]?.id ?? '']);
  }, [assignGroomers]);

  async function tryResolveOne(s: GroomingSession) {
    setResolveState(prev => ({ ...prev, [s.id]: 'pending' }));
    const res = await resolveGpsLink(s.id, s.gps_location as string);
    if (res.ok && res.lat != null && res.lng != null && res.precision) {
      setOverrides(prev => ({ ...prev, [s.id]: { lat: res.lat as number, lng: res.lng as number, precision: res.precision as 'exact' | 'approximate' } }));
      setResolveState(prev => {
        const next = { ...prev };
        delete next[s.id];
        return next;
      });
    } else {
      setResolveState(prev => ({ ...prev, [s.id]: 'failed' }));
    }
  }

  // Auto-resolve every short-link GPS in the whole day the moment the
  // modal opens — no manual click needed for the common case. Runs once
  // per mount (this component remounts per date via SessionsTab's
  // `key={date}`), across the whole day rather than just the selected
  // pill, so switching groomers/All afterwards already reflects it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const targets = routable.filter(s => !getSessionPoint(s) && (s.gps_location ?? '').trim());
      for (const s of targets) {
        if (cancelled) return;
        await tryResolveOne(s);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function retryMissing(list: GroomingSession[]) {
    for (const s of list.filter(s => (s.gps_location ?? '').trim())) {
      await tryResolveOne(s);
    }
  }

  const colorFor = (groomerName: string | null): string => {
    if (!groomerName) return UNASSIGNED_COLOR;
    const idx = groomerCounts.findIndex(g => g.name === groomerName);
    return idx === -1 ? UNASSIGNED_COLOR : PALETTE[idx % PALETTE.length];
  };

  // ── Normal per-groomer / All / Unassigned view ──────────────────────
  const scoped = selected === 'ALL'
    ? routable
    : routable.filter(s => (s.groomer_name ?? 'Unassigned') === selected);

  const geocoded: RoutePoint<RoutedSession>[] = [];
  const missing: GroomingSession[] = [];
  for (const s of scoped) {
    const pt = overrides[s.id] ?? getSessionPoint(s);
    if (pt) {
      geocoded.push({ item: { ...s, precision: pt.precision }, point: pt, sortKey: `${s.scheduled_time ?? '99:99'}-${s.id}` });
    } else {
      missing.push(s);
    }
  }
  const showRoute = selected !== 'ALL';
  const { stops, totalKm } = showRoute
    ? (orderMode === 'planned'
        ? planScheduledOrder(geocoded, GROOMER_HOME_BASE)
        : planNearestNeighborRoute(geocoded, GROOMER_HOME_BASE))
    : { stops: [] as RouteStop<RoutedSession>[], totalKm: 0 };

  // ── Suggested split over unassigned sessions ────────────────────────
  const unassignedRoutable = routable.filter(s => !s.groomer_name && !justAssigned.has(s.id));
  const suggestGeocoded: RoutePoint<RoutedSession>[] = [];
  const suggestMissing: GroomingSession[] = [];
  for (const s of unassignedRoutable) {
    const pt = overrides[s.id] ?? getSessionPoint(s);
    if (pt) {
      suggestGeocoded.push({ item: { ...s, precision: pt.precision }, point: pt, sortKey: `${s.scheduled_time ?? '99:99'}-${s.id}` });
    } else {
      suggestMissing.push(s);
    }
  }
  const priorityGroomers = priorityIds
    .map(id => assignGroomers.find(g => g.id === id))
    .filter((g): g is AssignGroomer => !!g);

  // Slot 0 only gets a fresh capacity-slice while its batch hasn't been
  // committed yet. Once assigned, it's done for this session — every
  // remaining unassigned lead (regardless of count) belongs to slot 1,
  // never re-offered back to slot 0 just because the pool shrank under
  // its capacity.
  let slot0Stops: RouteStop<RoutedSession>[];
  let slot0TotalKm: number;
  let slot1Stops: RouteStop<RoutedSession>[];
  let slot1TotalKm: number;
  if (slotAssigned[0]) {
    slot0Stops = [];
    slot0TotalKm = 0;
    const p2 = planNearestNeighborRoute(suggestGeocoded, GROOMER_HOME_BASE);
    slot1Stops = p2.stops;
    slot1TotalKm = p2.totalKm;
  } else {
    const p1Full = planNearestNeighborRoute(suggestGeocoded, GROOMER_HOME_BASE);
    slot0Stops = p1Full.stops.slice(0, Math.max(0, priorityCapacity));
    slot0TotalKm = slot0Stops.reduce((sum, s) => sum + (s.legKm ?? 0), 0);
    const slot0Ids = new Set(slot0Stops.map(s => s.item.id));
    const remainingForSlot1 = suggestGeocoded.filter(g => !slot0Ids.has(g.item.id));
    const p2 = planNearestNeighborRoute(remainingForSlot1, GROOMER_HOME_BASE);
    slot1Stops = p2.stops;
    slot1TotalKm = p2.totalKm;
  }
  const suggestSlots = [
    { stops: slot0Stops, totalKm: slot0TotalKm, groomer: priorityGroomers[0] },
    { stops: slot1Stops, totalKm: slot1TotalKm, groomer: priorityGroomers[1] },
  ];

  const inSuggestMode = suggestSlot !== null && priorityGroomers.length > 0;
  const activeSlotIdx: 0 | 1 = suggestSlot === 1 && priorityGroomers.length > 1 ? 1 : 0;
  const activeSlot = suggestSlots[activeSlotIdx];

  async function assignActiveSlot() {
    if (!activeSlot.groomer || activeSlot.stops.length === 0) return;
    setAssigning(true);
    await Promise.all(activeSlot.stops.map(s => onAssign(s.item.id, activeSlot.groomer as AssignGroomer)));
    setJustAssigned(prev => {
      const next = new Set(prev);
      activeSlot.stops.forEach(s => next.add(s.item.id));
      return next;
    });
    setSlotAssigned(prev => {
      const next: [boolean, boolean] = [...prev];
      next[activeSlotIdx] = true;
      return next;
    });
    setAssigning(false);
    if (activeSlotIdx === 0 && priorityGroomers.length > 1) setSuggestSlot(1);
  }

  // ── What actually renders, whichever mode is active ─────────────────
  const effectiveStops = inSuggestMode ? activeSlot.stops : stops;
  const effectiveTotalKm = inSuggestMode ? activeSlot.totalKm : totalKm;
  const effectiveShowRoute = inSuggestMode ? true : showRoute;
  const effectiveMissing = inSuggestMode ? suggestMissing : missing;

  useEffect(() => { setDrivingRoute(null); }, [selected, orderMode, suggestSlot, priorityCapacity, priorityIds[0], priorityIds[1]]);

  const gmaps = effectiveShowRoute
    ? buildGoogleMapsDirectionsUrl([GROOMER_HOME_BASE, ...effectiveStops.map(s => s.point)])
    : null;

  const mapMarkers: RouteMarker[] = effectiveShowRoute
    ? effectiveStops.map((s, i) => ({
        id: s.item.id,
        lat: s.point.lat,
        lng: s.point.lng,
        color: '#7c3aed',
        order: i + 1,
        precision: s.item.precision,
        popupTitle: fmtTime(s.item.scheduled_time),
        popupSubtitle: s.item.pet_parent_name,
        popupAddress: s.item.address,
      }))
    : geocoded.map(g => ({
        id: g.item.id,
        lat: g.point.lat,
        lng: g.point.lng,
        color: colorFor(g.item.groomer_name),
        precision: g.item.precision,
        popupTitle: `${fmtTime(g.item.scheduled_time)} · ${g.item.groomer_name ?? 'Unassigned'}`,
        popupSubtitle: g.item.pet_parent_name,
        popupAddress: g.item.address,
      }));

  const mapHome = effectiveShowRoute ? { ...GROOMER_HOME_BASE, label: GROOMER_HOME_BASE_LABEL } : null;

  // Real driving distance/duration (Google mode) beats the straight-line
  // estimate whenever it's available; otherwise fall back to it.
  const displayKm = drivingRoute?.km ?? effectiveTotalKm;
  const displayMinutes = drivingRoute?.minutes ?? null;

  if (typeof document === 'undefined') return null;
  return createPortal((
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="map-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="map-card"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed z-[90] inset-0 flex items-center justify-center p-0 sm:p-4"
          >
            <div
              role="dialog"
              aria-modal="true"
              className="bg-white w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
                    <MapPin size={17} className="text-sniffy-purple"/> Map & route — {dateLabel}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {inSuggestMode
                      ? 'Suggested split for unassigned leads — nothing is assigned until you tap the button below.'
                      : GOOGLE_MAPS_API_KEY
                        ? 'Real Google driving route, starting from Dighi (home).'
                        : "Straight-line suggestion from Dighi (home) — traffic and roads aren't factored in."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 grid place-items-center shrink-0"
                  aria-label="Close"
                >
                  <X size={16} className="text-gray-600"/>
                </button>
              </div>

              {/* Groomer selector + Suggest-split toggle */}
              <div className="px-4 sm:px-6 py-2.5 flex items-center gap-1.5 flex-wrap border-b border-gray-100 shrink-0">
                {[
                  { key: 'ALL', label: 'All', count: routable.length, color: null as string | null },
                  ...groomerCounts.map(g => ({ key: g.name, label: abbreviateGroomerName(g.name), count: g.count, color: colorFor(g.name) })),
                  ...(unassignedCount > 0 ? [{ key: 'Unassigned', label: 'Unassigned', count: unassignedCount, color: UNASSIGNED_COLOR }] : []),
                ].map(opt => {
                  const active = !inSuggestMode && selected === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => { setSelected(opt.key); setSuggestSlot(null); setOrderMode('suggested'); }}
                      className={`flex items-center gap-1 h-7 pl-1.5 pr-2.5 rounded-full text-[11px] font-semibold border transition-colors ${
                        active ? 'bg-gray-700 text-white border-gray-700' : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {opt.color && (
                        <span className="w-3.5 h-3.5 rounded-full shrink-0 border border-white" style={{ background: opt.color }}/>
                      )}
                      {opt.label} · {opt.count}
                    </button>
                  );
                })}
                {unassignedCount > 0 && assignGroomers.length > 0 && (
                  <button
                    onClick={() => setSuggestSlot(prev => prev === null ? 0 : null)}
                    className={`flex items-center gap-1 h-7 pl-1.5 pr-2.5 rounded-full text-[11px] font-bold border transition-colors ${
                      inSuggestMode ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <Target size={12}/> Suggest split
                  </button>
                )}
              </div>

              {/* Suggest-split config panel */}
              {inSuggestMode && (
                <div className="px-4 sm:px-6 py-3 border-b border-gray-100 bg-amber-50/40 space-y-2 shrink-0">
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="text-gray-500 font-semibold">1st priority</span>
                    <select
                      value={priorityIds[0]}
                      onChange={e => { setPriorityIds([e.target.value, priorityIds[1]]); setSlotAssigned([false, false]); }}
                      className="h-7 rounded-lg border border-gray-200 text-xs px-1.5 bg-white"
                    >
                      {assignGroomers.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <span className="text-gray-500">can take up to</span>
                    <input
                      type="number"
                      min={0}
                      value={priorityCapacity}
                      onChange={e => setPriorityCapacity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="h-7 w-14 rounded-lg border border-gray-200 text-xs px-2 bg-white"
                    />
                    <span className="text-gray-500">stops</span>
                  </div>
                  {assignGroomers.length > 1 && (
                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      <span className="text-gray-500 font-semibold">2nd priority</span>
                      <select
                        value={priorityIds[1]}
                        onChange={e => { setPriorityIds([priorityIds[0], e.target.value]); setSlotAssigned([false, false]); }}
                        className="h-7 rounded-lg border border-gray-200 text-xs px-1.5 bg-white"
                      >
                        {assignGroomers.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                      <span className="text-gray-500">gets whatever's left</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 pt-1">
                    {suggestSlots.slice(0, priorityGroomers.length).map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => setSuggestSlot(i as 0 | 1)}
                        className={`h-7 px-2.5 rounded-full text-[11px] font-bold border ${
                          activeSlotIdx === i ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        {slot.groomer ? firstName(slot.groomer.name) : `Slot ${i + 1}`} · {slot.stops.length}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scrollable body: map + route list */}
              <div className="flex-1 overflow-y-auto">
                <div className="h-[307px] sm:h-96 w-full relative">
                  {GOOGLE_MAPS_API_KEY ? (
                    <GoogleRouteMap
                      apiKey={GOOGLE_MAPS_API_KEY}
                      markers={mapMarkers}
                      polyline={effectiveShowRoute}
                      home={mapHome}
                      onDrivingRoute={setDrivingRoute}
                    />
                  ) : (
                    <LeafletRouteMap
                      markers={mapMarkers}
                      polyline={effectiveShowRoute}
                      home={mapHome}
                    />
                  )}
                </div>

                {/* Suggested vs Planned order tabs */}
                {showRoute && !inSuggestMode && geocoded.length > 0 && (
                  <div className="px-4 sm:px-6 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
                        <button
                          type="button"
                          onClick={() => setOrderMode('suggested')}
                          className={`h-8 px-4 rounded-md text-xs font-extrabold transition-colors ${
                            orderMode === 'suggested' ? 'bg-yellow-200 text-gray-900 shadow-md' : 'text-gray-500'
                          }`}
                        >
                          Suggested
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderMode('planned')}
                          className={`h-8 px-4 rounded-md text-xs font-extrabold transition-colors ${
                            orderMode === 'planned' ? 'bg-yellow-200 text-gray-900 shadow-md' : 'text-gray-500'
                          }`}
                        >
                          Planned
                        </button>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {orderMode === 'suggested' ? 'ideal visiting order' : 'as scheduled, by time'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Route stop list */}
                {effectiveShowRoute && effectiveStops.length > 0 && (
                  <div className={`px-4 sm:px-6 py-3 ${inSuggestMode ? 'border-t border-gray-100' : ''}`}>
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1">
                        <Navigation size={13} className="text-sniffy-purple"/>
                        {inSuggestMode
                          ? `${activeSlot.groomer ? firstName(activeSlot.groomer.name) : 'Suggested'}'s route`
                          : orderMode === 'planned' ? 'Planned order' : 'Suggested order'}
                      </h4>
                      <span className="text-[11px] font-semibold text-sniffy-purple bg-violet-50 px-2 py-0.5 rounded-full shrink-0">
                        {drivingRoute
                          ? `${displayKm.toFixed(1)} km · ${Math.round(displayMinutes ?? 0)} min`
                          : `~${displayKm.toFixed(1)} km straight-line`}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-2.5 text-xs pb-3">
                        <span className="relative z-10 w-5 h-5 rounded-full bg-green-100 text-green-700 grid place-items-center shrink-0 text-[11px]">🏠</span>
                        <span className="font-semibold text-gray-700">Start: {GROOMER_HOME_BASE_LABEL}</span>
                        <span className="absolute left-[9px] top-5 bottom-0 w-px bg-violet-100" aria-hidden="true"/>
                      </div>
                      <ol>
                        {effectiveStops.map((s, i) => (
                          <li key={s.item.id} className="relative flex items-start gap-2.5 text-xs pb-3 last:pb-0">
                            {i < effectiveStops.length - 1 && (
                              <span className="absolute left-[9px] top-5 bottom-0 w-px bg-violet-100" aria-hidden="true"/>
                            )}
                            <span className="relative z-10 w-5 h-5 rounded-full bg-violet-100 text-sniffy-purple font-extrabold grid place-items-center shrink-0 text-[10px]">
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-gray-800 truncate">{s.item.pet_parent_name}</span>
                                <span className="text-gray-400">{fmtTime(s.item.scheduled_time)}</span>
                                {s.item.precision === 'approximate' && (
                                  <span className="text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">~ approx</span>
                                )}
                              </div>
                              {s.item.address && (
                                <p className="text-gray-500 truncate mt-0.5">{s.item.address}</p>
                              )}
                            </div>
                            {s.legKm !== null && (
                              <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">+{s.legKm.toFixed(1)} km</span>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {inSuggestMode && activeSlot.groomer && (
                      <button
                        type="button"
                        onClick={assignActiveSlot}
                        disabled={assigning}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold text-white disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
                      >
                        {assigning
                          ? <><Loader2 size={13} className="animate-spin"/> Assigning…</>
                          : <><Check size={13}/> Assign these {effectiveStops.length} to {firstName(activeSlot.groomer.name)}</>}
                      </button>
                    )}

                    {gmaps && (
                      <a
                        href={gmaps.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #451a8b 100%)' }}
                      >
                        <Navigation size={13}/> Open this order in Google Maps
                      </a>
                    )}
                    {gmaps && gmaps.droppedCount > 0 && (
                      <p className="text-[10px] text-amber-600 mt-1.5">
                        Google's free directions link only carries the first {effectiveStops.length - gmaps.droppedCount} stops —
                        the remaining {gmaps.droppedCount} aren't in that link, follow the list above for those.
                      </p>
                    )}
                  </div>
                )}

                {inSuggestMode && effectiveStops.length === 0 && (
                  <div className="px-6 py-8 text-center text-xs text-gray-400">
                    Nothing left to assign here — every unassigned lead with a usable GPS point is already covered.
                  </div>
                )}

                {/* Missing-GPS callout */}
                {effectiveMissing.length > 0 && (
                  <div className="px-4 sm:px-6 py-3 border-t border-gray-100 bg-amber-50/60">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                        <AlertTriangle size={12}/> Couldn't place {effectiveMissing.length} stop{effectiveMissing.length > 1 ? 's' : ''}
                      </p>
                      {anyResolving ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                          <Loader2 size={11} className="animate-spin"/> Resolving…
                        </span>
                      ) : effectiveMissing.some(s => (s.gps_location ?? '').trim()) && (
                        <button
                          type="button"
                          onClick={() => retryMissing(effectiveMissing)}
                          className="text-[11px] font-bold text-sniffy-purple shrink-0"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {effectiveMissing.map(s => (
                        <li key={s.id} className="text-[11px] text-amber-800 flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold">{s.pet_parent_name}</span>
                          <span className="text-amber-600">{fmtTime(s.scheduled_time)}</span>
                          {s.address && <span className="text-amber-700/80 truncate">— {s.address}</span>}
                          {s.gps_location && (
                            <a href={s.gps_location} target="_blank" rel="noopener noreferrer" className="underline">
                              open saved link
                            </a>
                          )}
                          {resolveState[s.id] === 'pending' && (
                            <Loader2 size={11} className="animate-spin text-amber-600"/>
                          )}
                          {resolveState[s.id] === 'failed' && (
                            <span className="italic text-amber-600">still couldn't place — check manually</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {routable.length === 0 && (
                  <div className="px-6 py-8 text-center text-xs text-gray-400">
                    No sessions this day.
                  </div>
                )}
              </div>

              {/* Footer summary */}
              <div className="px-4 sm:px-6 py-2.5 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between shrink-0">
                <span>
                  {inSuggestMode ? effectiveStops.length : scoped.length} session{(inSuggestMode ? effectiveStops.length : scoped.length) === 1 ? '' : 's'} in view
                </span>
                <span>
                  {fmtCurrency((inSuggestMode ? effectiveStops.map(s => s.item) : scoped).reduce((sum, s) => sum + (s.net_booking_amount || s.booking_amount || 0), 0))}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  ), document.body);
}
