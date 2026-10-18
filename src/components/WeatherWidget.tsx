/**
 * WeatherWidget.tsx — Subtle Pune weather chip for overview headers.
 *
 *   ▸ Pune-only.  Coords are hardcoded — no geolocation prompt.
 *   ▸ Open-Meteo public API (free, keyless).
 *   ▸ Visual: clean white card, Sniffy-purple accents, animated SVG icon.
 *     Designed to *blend in* with the dashboard rather than compete with
 *     the KPI cards for attention.
 *   ▸ Live time, date, condition label.
 *
 *   PERFORMANCE NOTES (why this loads fast)
 *   --------------------------------------------------------------------
 *   1. localStorage cache (persists across reloads, not just the tab
 *      session)        →  warm visits paint instantly with zero network.
 *   2. Stale-while-revalidate: if we have ANY cached value we render it
 *      immediately, then refresh in the background.  The user never sees
 *      the skeleton after the very first visit.
 *   3. Module-level in-flight Promise dedup.  Both row + tile variants
 *      mount on the same page (mobile vs desktop) — without this they
 *      each fired a separate fetch.
 *   4. 6-second AbortSignal timeout.  If Open-Meteo hangs we fall back
 *      to whatever cached value we have rather than spin forever.
 *   5. <link rel="preconnect"> for api.open-meteo.com lives in
 *      index.html so the TLS handshake happens during initial page
 *      load, not on first fetch.
 */

import { useEffect, useState } from 'react';

const PUNE = { lat: 18.5204, lon: 73.8567, label: 'Pune' };
// Bumped to v5 — schema unchanged but we moved storage from sessionStorage
// → localStorage, so old v4 entries are intentionally left behind.
const CACHE_KEY = 'sniffy.weather.v5.pune';
const FRESH_TTL_MS = 30 * 60_000;       // serve directly without revalidation
const STALE_TTL_MS = 24 * 60 * 60_000;  // serve stale + revalidate in background

interface WeatherSnapshot {
  tempC:    number;
  code:     number;
  isDay:    boolean;
  fetchedAt: number;
}

/** Read whatever is cached, regardless of age.  Returns null only if the
 *  cache is missing, malformed, or older than STALE_TTL_MS (a day). */
function readCache(): WeatherSnapshot | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeatherSnapshot;
    if (typeof parsed?.fetchedAt !== 'number') return null;
    if (Date.now() - parsed.fetchedAt > STALE_TTL_MS) return null;
    return parsed;
  } catch { return null; }
}

function writeCache(snap: WeatherSnapshot) {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(snap)); } catch { /* quota / private mode — fine */ }
}

/** Module-level in-flight promise so multiple widget instances mounting
 *  in the same tick share a single network request. */
let inFlight: Promise<WeatherSnapshot> | null = null;

function fetchAndCache(): Promise<WeatherSnapshot> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const fresh = await fetchWeather(PUNE.lat, PUNE.lon);
      const next: WeatherSnapshot = { ...fresh, fetchedAt: Date.now() };
      writeCache(next);
      return next;
    } finally {
      // Clear immediately so a later TTL-expiry can refetch.
      inFlight = null;
    }
  })();
  return inFlight;
}

/** Render variant.
 *   • 'row'  — original horizontal strip (icon | temp+condition | time+date).
 *              Use as a full-width banner above a dashboard.
 *   • 'tile' — square-ish card with a round purple icon badge at top, big
 *              temp value, condition + city below.  Designed to live in a
 *              2-column tile grid alongside KPI tiles.
 *   • 'chip' — single inline line (icon + "23°C · Overcast"), no card, no
 *              background.  Meant to sit inside an existing colored header
 *              (uses the vivid art palette) rather than take its own slot. */
export type WeatherWidgetVariant = 'row' | 'tile' | 'chip';

interface WeatherWidgetProps {
  variant?: WeatherWidgetVariant;
}

export default function WeatherWidget({ variant = 'row' }: WeatherWidgetProps = {}) {
  useEffect(() => { injectKeyframes(); }, []);

  // Live "now" — update every minute.
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Initial render: paint whatever is in localStorage immediately, even
  // if it's stale.  This is the SWR optimization — the dashboard never
  // shows a skeleton on a repeat visit.
  const [snap, setSnap] = useState<WeatherSnapshot | null>(() => readCache());

  // Only show the skeleton if we have NOTHING — i.e. first visit ever.
  const [loading, setLoading] = useState(!snap);

  useEffect(() => {
    // If we have fresh data (under 30 min old), skip the network entirely.
    if (snap && Date.now() - snap.fetchedAt < FRESH_TTL_MS) return;

    let cancelled = false;
    if (!snap) setLoading(true);  // first visit — show skeleton

    fetchAndCache()
      .then(next => { if (!cancelled) setSnap(next); })
      .catch(err => {
        // Keep the stale snapshot on screen — better than nothing.
        console.warn('[WeatherWidget] fetch failed, keeping stale value', err);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!snap && !loading) return null;
  if (!snap) {
    if (variant === 'chip') return null; // inline chip: fail silent, no skeleton flash in a header row
    const skelHeight = variant === 'tile' ? 'h-[108px]' : 'h-[58px]';
    return <div className={`rounded-2xl bg-gray-50 border border-gray-100 animate-pulse ${skelHeight} w-full`}/>;
  }

  const meta = weatherMeta(snap.code, snap.isDay);
  const timeStr = now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  // ── Chip variant — single inline line, designed to sit inside a
  // colored header (vivid art) next to other header text.
  if (variant === 'chip') {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-5 h-5 shrink-0">
          <WeatherArt code={snap.code} isDay={snap.isDay} vivid/>
        </div>
        <span className="text-[11px] font-semibold text-white/80 whitespace-nowrap">
          {Math.round(snap.tempC)}°C · {meta.label}
        </span>
      </div>
    );
  }

  // ── Tile variant — vertical, suitable for half-width grid slot.
  //
  // The tile mood matches the weather:
  //   • Clear day        → bright sky blue
  //   • Clear night      → deep indigo
  //   • Partly cloudy    → softer sky blue
  //   • Overcast / fog   → slate grey
  //   • Rain / drizzle   → deep slate blue
  //   • Snow             → icy pale blue
  //   • Thunderstorm     → Sniffy purple — dramatic
  //   • Night clouds     → navy
  //
  // Weather art is rendered in "vivid" mode on this colored background
  // so the strokes/fills stay legible (white clouds, cream moon, yellow
  // lightning) without losing the original animation.
  if (variant === 'tile') {
    const tile = tileTheme(snap.code, snap.isDay);
    return (
      <div
        className="relative h-full rounded-2xl overflow-hidden p-3"
        style={{
          background: tile.background,
          boxShadow: '0 6px 20px rgba(15,23,42,0.14)',
        }}
      >
        {/* Decorative bubbles — float subtly so the tile feels alive
            even before the user looks at the central animation. */}
        <div
          aria-hidden
          className="absolute -top-10 -right-8 w-28 h-28 rounded-full"
          style={{ background: 'rgba(255,255,255,0.10)' }}
        />
        <div
          aria-hidden
          className="absolute -bottom-12 -left-6 w-24 h-24 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        />

        {/* Big animated weather art — full SVG, no badge wrapper, so the
            sun rays / drifting clouds / falling rain are actually visible. */}
        <div
          className="relative w-12 h-12 -ml-1"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
        >
          <WeatherArt code={snap.code} isDay={snap.isDay} vivid/>
        </div>

        {/* Big temperature — white text on coloured bg. */}
        <div className="mt-1 flex items-baseline gap-1 relative">
          <span
            className="text-[24px] font-extrabold text-white leading-none tabular-nums"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.18)' }}
          >
            {Math.round(snap.tempC)}°
          </span>
          <span className="text-[11px] font-bold text-white/70">C</span>
        </div>

        {/* Condition + city/time. */}
        <p className="text-[11px] text-white/90 font-semibold mt-0.5 truncate relative">
          {meta.label}
        </p>
        <div className="flex items-center gap-1 mt-0.5 text-[9px] relative">
          <span className="font-extrabold uppercase tracking-wider text-white">{PUNE.label}</span>
          <span className="text-white/40">·</span>
          <span className="font-semibold text-white/80 tabular-nums">{timeStr}</span>
        </div>
      </div>
    );
  }

  // ── Default 'row' variant — original horizontal strip.
  return (
    <div
      className="rounded-2xl bg-white border border-gray-100 px-3 py-2.5 sm:px-4 sm:py-3"
      style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.03)' }}
    >
      <div className="flex items-center gap-3">
        {/* Animated icon — small, doesn't dominate */}
        <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10">
          <WeatherArt code={snap.code} isDay={snap.isDay}/>
        </div>

        {/* Left: temp + condition */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-[18px] sm:text-[20px] font-extrabold text-gray-900 leading-none tabular-nums">
              {Math.round(snap.tempC)}°
            </span>
            <span className="text-[10px] font-bold text-gray-400">C</span>
            <span className="text-[10px] text-gray-300 mx-1">·</span>
            <span className="text-[11px] text-gray-500 font-medium truncate">
              {meta.label}
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-sniffy-purple mt-0.5">
            {PUNE.label}
          </p>
        </div>

        {/* Right: time + date */}
        <div className="shrink-0 text-right">
          <p className="text-[14px] sm:text-[15px] font-extrabold text-gray-900 leading-none tabular-nums">
            {timeStr}
          </p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-1">
            {dateStr}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── API ──────────────────────────────────────────────────────

async function fetchWeather(lat: number, lon: number): Promise<{ tempC: number; code: number; isDay: boolean }> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`;
  // 6-second hard cap — if Open-Meteo is slow we'd rather fall back to
  // the stale cache than leave the user looking at a skeleton.
  // AbortSignal.timeout is supported in all modern browsers (Chrome 103+,
  // Safari 16+, Firefox 100+) which matches our React 18 baseline.
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`Weather fetch ${res.status}`);
  const json = await res.json();
  return {
    tempC: json?.current?.temperature_2m ?? 0,
    code:  json?.current?.weather_code   ?? 0,
    isDay: Number(json?.current?.is_day) === 1,
  };
}

// ─── Label ────────────────────────────────────────────────────

interface Theme { label: string; }

function weatherMeta(code: number, isDay: boolean): Theme {
  if (code === 0)                          return { label: isDay ? 'Clear' : 'Clear night' };
  if ([1, 2].includes(code))               return { label: 'Partly cloudy' };
  if (code === 3)                          return { label: 'Overcast' };
  if ([45, 48].includes(code))             return { label: 'Foggy' };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Drizzle' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Rain' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snow' };
  if ([95, 96, 99].includes(code))         return { label: 'Thunderstorm' };
  return                                          { label: 'Cloudy' };
}

// ─── Tile-mode background gradient per weather state ─────────
//
// Returns the CSS gradient used for the *tile* variant only.  Chosen so
// the (vivid) weather art has strong contrast against it AND the mood
// of the tile matches the weather outside: sunny is bright, storm is
// dramatic Sniffy purple, night is deep indigo, etc.
//
// All gradients chosen to harmonise with the Sniffy purple/yellow
// palette — even the rain/overcast greys lean cool blue so the dashboard
// reads as one consistent design system.
function tileTheme(code: number, isDay: boolean): { background: string } {
  // ── Night palettes first (override most codes) ──
  if (!isDay) {
    // Thunderstorm at night → deepest Sniffy purple.
    if ([95, 96, 99].includes(code))
      return { background: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)' };
    // Rain at night → near-black slate-indigo.
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
      return { background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' };
    // Cloudy / foggy night → navy.
    if (code === 3 || [45, 48].includes(code) || code === 2)
      return { background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' };
    // Clear night (default) → deep indigo, starry.
    return { background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)' };
  }

  // ── Day palettes ──
  // Thunderstorm → Sniffy purple, signature mood.
  if ([95, 96, 99].includes(code))
    return { background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)' };
  // Rain / drizzle → deep slate blue.
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)' };
  // Snow → icy pale blue.
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { background: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%)' };
  // Fog → soft slate.
  if ([45, 48].includes(code))
    return { background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' };
  // Overcast → warm grey-blue.
  if (code === 3)
    return { background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' };
  // Partly cloudy → mid sky blue.
  if (code === 2)
    return { background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' };
  // Clear day (0, 1, fallback) → bright sky blue, sunny.
  return { background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)' };
}

// ─── Animated SVG art per weather state ──────────────────────
//
// Two skins:
//   • Default (vivid=false) — soft fills, designed to sit on the
//     white "row" card.  Greys, purples — calm.
//   • Vivid  (vivid=true)   — bright whites, creams and yellow accents,
//     designed to sit on the *coloured* tile background.  Same
//     animations — only the palette changes.

function WeatherArt({ code, isDay, vivid = false }: { code: number; isDay: boolean; vivid?: boolean }) {
  if (code === 0 || code === 1) return isDay ? <Sun/> : <Moon vivid={vivid}/>;
  if (code === 2)               return <PartlyCloudy isDay={isDay} vivid={vivid}/>;
  if (code === 3)               return <CloudyTwo vivid={vivid}/>;
  if (code === 45 || code === 48) return <Fog vivid={vivid}/>;
  if ([51, 53, 55, 56, 57].includes(code)) return <Rain drops={2} vivid={vivid}/>;
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <Rain drops={4} vivid={vivid}/>;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <Snow vivid={vivid}/>;
  if ([95, 96, 99].includes(code)) return <Thunder vivid={vivid}/>;
  return <CloudyTwo vivid={vivid}/>;
}

// ── Sun ──────────────────────────────────────────────────────
//
// Layered animation:
//   • Outer halo  — slow scale-pulse (atmosphere)
//   • Mid halo    — faster pulse, offset (depth)
//   • Outer rays  — 8 thin long rays, rotating CCW slowly
//   • Inner rays  — 8 short fat rays, rotating CW faster (offset 22.5°)
//   • Core        — radial gradient, breathing scale
//   • Sparkles    — 4 dots popping in/out at staggered delays
//   • Wobble      — whole group rocks gently for added "alive" feel

function Sun() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full overflow-visible">
      <defs>
        <radialGradient id="sunCore">
          <stop offset="0%"   stopColor="#fffbeb"/>
          <stop offset="55%"  stopColor="#fde68a"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </radialGradient>
        <radialGradient id="sunHalo">
          <stop offset="0%"  stopColor="#fde68a" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <g style={{ transformOrigin: '32px 32px', animation: 'wx-wobble 5s ease-in-out infinite' }}>
        {/* Outer halo */}
        <circle cx="32" cy="32" r="28" fill="url(#sunHalo)"
          style={{ animation: 'wx-halo 4s ease-in-out infinite' }}/>
        {/* Mid halo */}
        <circle cx="32" cy="32" r="18" fill="#fef3c7" opacity="0.6"
          style={{ animation: 'wx-pulse 3s ease-in-out infinite 0.4s' }}/>

        {/* Outer ray ring — slow CCW */}
        <g style={{ transformOrigin: '32px 32px', animation: 'wx-spin-rev 28s linear infinite' }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8;
            return (
              <rect
                key={`o-${i}`}
                x="31.4" y="2" width="1.2" height="7" rx="0.6"
                fill="#f59e0b" opacity="0.75"
                transform={`rotate(${angle} 32 32)`}
              />
            );
          })}
        </g>

        {/* Inner ray ring — faster CW, offset 22.5° */}
        <g style={{ transformOrigin: '32px 32px', animation: 'wx-spin 14s linear infinite' }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8 + 22.5;
            return (
              <rect
                key={`i-${i}`}
                x="30.5" y="9" width="3" height="6" rx="1.5"
                fill="#fbbf24"
                transform={`rotate(${angle} 32 32)`}
              />
            );
          })}
        </g>

        {/* Core — breathing */}
        <circle cx="32" cy="32" r="10" fill="url(#sunCore)"
          style={{ transformOrigin: '32px 32px', animation: 'wx-breathe 2.5s ease-in-out infinite' }}/>

        {/* Sparkles — 4 corners */}
        <g fill="#fbbf24">
          <Sparkle cx={10}  cy={14} delay={0}/>
          <Sparkle cx={54}  cy={18} delay={0.6}/>
          <Sparkle cx={14}  cy={52} delay={1.3}/>
          <Sparkle cx={52}  cy={50} delay={1.9}/>
        </g>
      </g>
    </svg>
  );
}

// Tiny 4-point twinkle (drawn as a "+" with bevels) used as sparkle.
function Sparkle({ cx, cy, delay }: { cx: number; cy: number; delay: number }) {
  return (
    <g style={{
      transformOrigin: `${cx}px ${cy}px`,
      animation: `wx-sparkle 3s ease-in-out infinite ${delay}s`,
    }}>
      <path
        d={`M ${cx} ${cy - 3} L ${cx + 0.8} ${cy - 0.8} L ${cx + 3} ${cy} L ${cx + 0.8} ${cy + 0.8} L ${cx} ${cy + 3} L ${cx - 0.8} ${cy + 0.8} L ${cx - 3} ${cy} L ${cx - 0.8} ${cy - 0.8} Z`}
      />
    </g>
  );
}

// ── Moon ─────────────────────────────────────────────────────
//
// Refined night sky:
//   • Pulsing halo + breathing moon body
//   • 6 twinkling stars with varied sizes & delays
//   • A shooting star that sweeps diagonally every 6s

function Moon({ vivid = false }: { vivid?: boolean }) {
  const moonFill   = vivid ? '#fef3c7' : '#7c3aed';            // cream on dark bg, purple on white bg
  const haloFill   = vivid ? '#fde68a' : '#c4b5fd';
  const starFill   = vivid ? '#fef9c3' : '#7c3aed';
  const moonOpacity = vivid ? 1 : 0.85;
  const haloOpacity = vivid ? 0.28 : 0.32;
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full overflow-visible">
      <defs>
        <mask id="moonMask">
          <rect width="64" height="64" fill="white"/>
          <circle cx="42" cy="26" r="13" fill="black"/>
        </mask>
      </defs>
      {/* Halo */}
      <circle cx="34" cy="30" r="18" fill={haloFill} opacity={haloOpacity}
        style={{ animation: 'wx-pulse 4s ease-in-out infinite' }}/>
      {/* Moon body — breathing */}
      <circle cx="34" cy="30" r="13" fill={moonFill} opacity={moonOpacity} mask="url(#moonMask)"
        style={{ transformOrigin: '34px 30px', animation: 'wx-breathe 3.4s ease-in-out infinite' }}/>

      {/* Twinkling stars */}
      <g fill={starFill} opacity={vivid ? 0.95 : 0.75}>
        <circle cx="12" cy="14" r="1.1" style={{ animation: 'wx-twinkle 2.4s ease-in-out infinite' }}/>
        <circle cx="50" cy="50" r="1.0" style={{ animation: 'wx-twinkle 2.6s ease-in-out infinite 0.7s' }}/>
        <circle cx="20" cy="50" r="0.8" style={{ animation: 'wx-twinkle 2.0s ease-in-out infinite 1.2s' }}/>
        <circle cx="54" cy="12" r="0.9" style={{ animation: 'wx-twinkle 2.8s ease-in-out infinite 0.4s' }}/>
        <circle cx="6"  cy="34" r="0.7" style={{ animation: 'wx-twinkle 2.5s ease-in-out infinite 1.5s' }}/>
        <circle cx="58" cy="36" r="0.7" style={{ animation: 'wx-twinkle 2.3s ease-in-out infinite 0.9s' }}/>
      </g>

      {/* Shooting star — sweeps diagonally with a tail */}
      <g style={{ animation: 'wx-shoot 6s ease-out infinite' }}>
        <line x1="0" y1="0" x2="-9" y2="-4"
          stroke="#fde68a" strokeWidth="1" strokeLinecap="round" opacity="0.55"/>
        <circle r="1.4" fill="#fde68a"/>
      </g>
    </svg>
  );
}

// ── Partly Cloudy ────────────────────────────────────────────
function PartlyCloudy({ isDay, vivid = false }: { isDay: boolean; vivid?: boolean }) {
  const cloudFill = vivid ? '#ffffff' : '#cbd5e1';
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <g style={{ transform: 'translate(8px, -2px) scale(0.7)' }}>
        {isDay ? <Sun/> : <Moon vivid={vivid}/>}
      </g>
      <g style={{ animation: 'wx-drift 6s ease-in-out infinite' }}>
        <CloudShape x={12} y={32} fill={cloudFill} opacity={0.98}/>
      </g>
    </svg>
  );
}

// ── Two clouds (overcast) ────────────────────────────────────
function CloudyTwo({ vivid = false }: { vivid?: boolean }) {
  const back = vivid ? '#ffffff' : '#e2e8f0';
  const front = vivid ? '#ffffff' : '#cbd5e1';
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <g style={{ animation: 'wx-drift 7s ease-in-out infinite' }}>
        <CloudShape x={4}  y={18} fill={back}  opacity={vivid ? 0.75 : 0.85}/>
      </g>
      <g style={{ animation: 'wx-drift-rev 8s ease-in-out infinite' }}>
        <CloudShape x={16} y={32} fill={front} opacity={vivid ? 1    : 0.95}/>
      </g>
    </svg>
  );
}

// ── Fog ──────────────────────────────────────────────────────
function Fog({ vivid = false }: { vivid?: boolean }) {
  const cloudFill = vivid ? '#ffffff' : '#e2e8f0';
  const lineFill  = vivid ? 'rgba(255,255,255,0.85)' : '#cbd5e1';
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <CloudShape x={10} y={16} fill={cloudFill} opacity={vivid ? 0.9 : 0.85}/>
      {[26, 36, 46].map((y, i) => (
        <rect
          key={y}
          x="6" y={y} width="52" height="3" rx="1.5"
          fill={lineFill}
          style={{ animation: `wx-drift ${4 + i}s ease-in-out infinite ${i * 0.3}s` }}
        />
      ))}
    </svg>
  );
}

// ── Rain ─────────────────────────────────────────────────────
function Rain({ drops = 4, vivid = false }: { drops?: number; vivid?: boolean }) {
  const cloudFill = vivid ? '#ffffff' : '#cbd5e1';
  const dropStroke = vivid ? '#bae6fd' : '#7c3aed';
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <CloudShape x={6} y={10} fill={cloudFill} opacity={vivid ? 0.95 : 1}/>
      {Array.from({ length: drops }).map((_, i) => {
        const x = 14 + i * (40 / Math.max(drops - 1, 1));
        return (
          <line
            key={i}
            x1={x} y1="36" x2={x - 2} y2="50"
            stroke={dropStroke}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={vivid ? 0.85 : 0.55}
            style={{ animation: `wx-fall 1.1s linear infinite ${i * 0.18}s` }}
          />
        );
      })}
    </svg>
  );
}

// ── Snow ─────────────────────────────────────────────────────
function Snow({ vivid = false }: { vivid?: boolean }) {
  const cloudFill = vivid ? '#ffffff' : '#e2e8f0';
  const flakeFill = vivid ? '#ffffff' : '#7c3aed';
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <CloudShape x={6} y={10} fill={cloudFill}/>
      {[18, 32, 46].map((x, i) => (
        <text
          key={x}
          x={x} y="46"
          fontSize="11"
          fill={flakeFill}
          opacity={vivid ? 0.95 : 0.6}
          textAnchor="middle"
          style={{ animation: `wx-fall-spin 2.4s ease-in infinite ${i * 0.4}s` }}
        >
          ❄
        </text>
      ))}
    </svg>
  );
}

// ── Thunder ──────────────────────────────────────────────────
function Thunder({ vivid = false }: { vivid?: boolean }) {
  // Dark dramatic cloud + the Sniffy-yellow lightning bolt — reads as
  // "storm" instantly on either bg.
  const cloudFill = vivid ? '#1e1b4b' : '#94a3b8';
  const boltFill  = vivid ? '#f6ac0a' : '#7c3aed';
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <CloudShape x={6} y={8} fill={cloudFill} opacity={0.95}/>
      <polygon
        points="30,32 38,32 32,46 40,46 26,60 30,48 22,48"
        fill={boltFill}
        opacity={vivid ? 0.95 : 0.85}
        style={{ animation: 'wx-flash 1.6s ease-in-out infinite' }}
      />
    </svg>
  );
}

// ── Reusable cloud shape ─────────────────────────────────────
function CloudShape({ x, y, fill, opacity = 1 }: {
  x: number; y: number; fill: string; opacity?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <ellipse cx="14" cy="14" rx="14" ry="9"  fill={fill}/>
      <ellipse cx="28" cy="12" rx="12" ry="11" fill={fill}/>
      <ellipse cx="38" cy="16" rx="10" ry="8"  fill={fill}/>
    </g>
  );
}

// ─── Keyframe injection (idempotent) ─────────────────────────

const KEYFRAMES = `
  @keyframes wx-spin     { to { transform: rotate(360deg); } }
  @keyframes wx-spin-rev { to { transform: rotate(-360deg); } }
  @keyframes wx-pulse    { 0%, 100% { transform: scale(1);   opacity: 0.45; } 50% { transform: scale(1.06); opacity: 0.65; } }
  @keyframes wx-halo     { 0%, 100% { transform: scale(0.9); opacity: 0.55; } 50% { transform: scale(1.18); opacity: 0.85; } }
  @keyframes wx-breathe  { 0%, 100% { transform: scale(1); }   50% { transform: scale(1.07); } }
  @keyframes wx-sparkle  { 0%, 100% { opacity: 0; transform: scale(0); }
                            40% { opacity: 1; transform: scale(1.4); }
                            60% { opacity: 1; transform: scale(1); }
                            80% { opacity: 0; transform: scale(0.6); } }
  @keyframes wx-wobble   { 0%, 100% { transform: rotate(0deg); }
                            25% { transform: rotate(2deg); }
                            75% { transform: rotate(-2deg); } }
  @keyframes wx-shoot    { 0%   { transform: translate(56px, 6px); opacity: 0; }
                            8%  { opacity: 1; }
                            45% { transform: translate(8px, 44px); opacity: 0; }
                            100% { opacity: 0; transform: translate(56px, 6px); } }
  @keyframes wx-drift    { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
  @keyframes wx-drift-rev{ 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-5px); } }
  @keyframes wx-fall     { 0% { transform: translateY(-6px); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(12px); opacity: 0; } }
  @keyframes wx-fall-spin{ 0% { transform: translateY(-6px) rotate(0deg); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(14px) rotate(360deg); opacity: 0; } }
  @keyframes wx-twinkle  { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
  @keyframes wx-flash    { 0%, 60%, 100% { opacity: 0.85; } 65%, 75% { opacity: 0.3; } 70% { opacity: 1; } }
`;

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('wx-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'wx-keyframes';
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
}
