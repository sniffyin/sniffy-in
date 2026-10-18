/**
 * admin/OverviewTab.tsx — Compact actionable dashboard.
 * Fixes:
 *  • Logo — plain img, no box, above title
 *  • Donut chart text no longer overflows container
 *  • "View all" buttons navigate to correct tabs via onNavigate prop
 *  • "Convert" opens SessionFormModal prefilled with booking data
 */

import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ArrowUpRight, ArrowDownRight,
  Phone, MessageCircle, ArrowRightCircle,
  Clock, ChevronRight, X,
  Activity, IndianRupee, Users, Flame,
  BarChart3, TrendingUp, Scissors, Crown,
  Banknote,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  GroomingSession, SOURCE_COLORS, SOURCE_LABELS, fmtCurrency,
  BookingSource, STATUS_COLORS, STATUS_LABELS, fmtDate, daysUntil,
  isVendorPrepaid, SessionStatus,
  EXTERNAL_SOURCE_FEE_RULE, commissionFor, isExternalSource, resolveSourceLabel,
} from './types';
import WeatherWidget from '../../components/WeatherWidget';
import MilestoneApprovalsRail from './MilestoneApprovalsRail';
import TodoListCard from './TodoListCard';
import { canWrite, type AdminUser } from './authStore';
import { useSessions, refreshSessions } from './sessionsCache';

const SessionFormModal = lazy(() => import('./SessionFormModal'));

// ─── Types ────────────────────────────────────────────────────

type TabId = 'overview' | 'sessions' | 'followups' | 'groomers' | 'bookings' | 'calendar';

interface Booking {
  id: string; name: string; phone: string; breed: string;
  pet_type: string; city: string; package: string;
  is_converted: boolean; created_at: string; age: number;
  location?: string; medical?: string;
}

// ─── Stat tile (new mobile overview hero) ────────────────────
//
// Square-ish card with a round purple/coloured icon badge at the top,
// a big value, a small label, and a tiny sub-line.  Mirrors the
// `WeatherWidget(variant="tile")` shape so the two can sit side-by-side
// in a 2-column grid without visual jostling.
//
//   ┌──────────────────┐
//   │ ⬤ icon           │
//   │                  │
//   │   206            │   ← value (extrabold, ~26px)
//   │ Sessions         │   ← label (gray, 11px)
//   │ ↓44% mom         │   ← sub  (10px, tone-coloured)
//   └──────────────────┘

function StatTile({
  Icon, tileGradient,
  value, label, sub, subTone,
}: {
  Icon: React.ElementType;
  /** CSS linear-gradient string for the *whole tile* background — chosen
   *  to harmonise with the WeatherWidget tile sitting next to it so the
   *  4-up grid reads as one colourful family rather than 1 colourful card
   *  + 3 white cards. */
  tileGradient: string;
  value: string | number;
  label: string;
  sub: string;
  subTone?: 'positive' | 'negative' | 'muted';
}) {
  // On a coloured gradient bg, positive/negative use light tints so they
  // stay readable against the dark backdrop instead of muddying it.
  const subCls =
    subTone === 'positive' ? 'text-emerald-200' :
    subTone === 'negative' ? 'text-red-200' :
    'text-white/60';
  return (
    <div
      className="relative h-full rounded-2xl overflow-hidden p-3"
      style={{ background: tileGradient, boxShadow: '0 6px 20px rgba(15,23,42,0.14)' }}
    >
      {/* Decorative bubbles — echo the WeatherWidget tile so the four
          tiles in the 2×2 grid feel like siblings, not strangers. */}
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
      {/* Icon — translucent white circle, mirrors the weather-art treatment. */}
      <div
        className="relative w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.20)' }}
      >
        <Icon size={16} className="text-white" strokeWidth={2.4}/>
      </div>
      <p
        className="relative text-[22px] font-extrabold text-white leading-none tabular-nums mt-2.5"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}
      >
        {value}
      </p>
      <p className="relative text-[11px] text-white/90 font-semibold mt-1 truncate">{label}</p>
      <p className={`relative text-[10px] font-semibold mt-0.5 ${subCls}`}>{sub}</p>
    </div>
  );
}

/** Short currency formatter for the compact KPI cell.
 *   < 1k  → ₹847
 *   < 1L  → ₹64.6K
 *   ≥ 1L  → ₹6.46L  (Indian "lakh" — what Sniffy's coordinator expects) */
function shortCurrency(n: number): string {
  if (!n) return '₹0';
  if (n >= 100000) return `₹${(n / 100000).toFixed(n >= 1000000 ? 1 : 2)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

// ─── Mini Bar Chart ───────────────────────────────────────────

function MiniBarChart({ data, color = '#451a8b' }: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-12 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
          <span className="text-[8px] font-bold" style={{ color: d.value > 0 ? color : 'transparent' }}>
            {d.value || ''}
          </span>
          <div className="w-full rounded-sm" style={{
            height: `${Math.max((d.value / max) * 36, d.value > 0 ? 3 : 1)}px`,
            background: d.value > 0 ? color : '#f3f4f6',
          }} />
          <span className="text-[8px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────
// Fixed: legend is capped so text never overflows the card.

// Each donut slice optionally carries a `key` — the value we want to
// filter sessions by when the wedge or list row is clicked.  For Source
// donuts this is the `BookingSource` enum value (e.g. 'woofly').  For
// Groomer donuts it's the raw `groomer_name`.  Slices without a key
// stay non-interactive (cursor & onClick are skipped downstream).
type DonutSlice = { label: string; value: number; color: string; key?: string };

// Build the wedge geometry for a donut.  Pulled out so both the
// compact (square card) and expanded (modal) views can share the
// same maths — only the radius / canvas changes.
function buildDonutPaths(
  slices: DonutSlice[],
  cx: number, r: number,
) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let cum = -90;
  return slices.map(s => {
    const angle = (s.value / total) * 360;
    const rad1 = (cum * Math.PI) / 180;
    const rad2 = ((cum + angle) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad1), y1 = cx + r * Math.sin(rad1);
    const x2 = cx + r * Math.cos(rad2), y2 = cx + r * Math.sin(rad2);
    const large = angle > 180 ? 1 : 0;
    cum += angle;
    return {
      d: `M ${cx} ${cx} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
      color: s.color, label: s.label, value: s.value,
      key: s.key,
      pct: Math.round((s.value / total) * 100),
    };
  });
}

/**
 * Compact donut card — sits inside a square tile.  Shows AT MOST
 * the top-3 slices by value so the card stays small; the rest are
 * hidden behind a "+N more" hint that nudges the user to tap and
 * open the full breakdown modal.
 */
function DonutChart({ slices }: {
  slices: DonutSlice[];
}) {
  // NOTE: the compact card-size donut deliberately does NOT wire
  // click-through on the wedges — the whole card is already a button
  // that opens the expanded modal, and individual wedges in here are
  // too small (≈10–15px wide) to be safe tap targets.  The interactive
  // wedges live in <DonutModal/> where they have room to breathe.
  const paths   = buildDonutPaths(slices, 36, 28);
  const visible = [...paths].sort((a, b) => b.value - a.value).slice(0, 3);
  const hidden  = paths.length - visible.length;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 72 72" width={72} height={72} className="shrink-0">
        {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth="1.5" />)}
        <circle cx={36} cy={36} r={16} fill="white" />
      </svg>
      <div className="flex flex-col gap-1 w-full">
        {visible.filter(p => p.value > 0).map((p, i) => (
          <div key={i} className="flex items-center gap-1 text-[10px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-gray-600 truncate flex-1 min-w-0">{p.label}</span>
            <span className="font-bold text-gray-800 ml-auto">{p.pct}%</span>
          </div>
        ))}
        {hidden > 0 && (
          <p className="text-[9px] text-sniffy-purple font-semibold mt-0.5">
            +{hidden} more — tap to expand
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Enlarged modal view — opened when the user taps a donut card.
 * Renders the same donut at ~2.5× size with every slice listed
 * (incl. the absolute count, not just the percentage) so the user
 * gets the full picture they were missing on the compact card.
 */
function DonutModal({
  open, title, slices, onClose, onSliceClick, clickHint,
}: {
  open: boolean;
  title: string;
  slices: DonutSlice[];
  onClose: () => void;
  /** Fires when the coordinator taps a wedge in the SVG or a row in the
   *  legend list.  We pass the slice's `key` (e.g. 'woofly' or
   *  'Hemant Ramesh Pardeshi'); the parent uses it to navigate to the
   *  Sessions tab with the matching filter pre-applied.  Slices without
   *  a `key` are skipped — defensive against orphaned/legacy data. */
  onSliceClick?: (key: string) => void;
  /** One-line affordance shown under the donut so the coordinator
   *  knows a tap will take them somewhere (e.g. "Tap a slice to see
   *  sessions").  Only rendered when `onSliceClick` is wired up. */
  clickHint?: string;
}) {
  const paths  = buildDonutPaths(slices, 100, 78);
  const sorted = [...paths].sort((a, b) => b.value - a.value);
  const total  = slices.reduce((s, x) => s + x.value, 0);

  if (typeof document === 'undefined') return null;

  // NOTE — same fix as SniffyDatePicker.  Two issues conspire to
  // off-center the modal if you try the "obvious" approach:
  //   1. The Overview dashboard wraps every card in framer-motion
  //      <motion.div>, which sets `transform` on ancestors.  That
  //      makes `position: fixed` resolve against the transformed
  //      ancestor instead of the viewport, so the modal drifts.
  //      → portal the modal to document.body so it has no
  //        transformed ancestor.
  //   2. Framer-motion writes its own `transform: scale(...)` on
  //      the animated element, which would clobber tailwind's
  //      `-translate-x-1/2 -translate-y-1/2` centering utilities.
  //      → split into an outer flex container (handles centering)
  //        and an inner motion.div (handles open/close animation).
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[2px]"
            aria-hidden="true"
          />
          {/* Outer flex container handles centering, ignores pointer
              events so the backdrop click still registers. */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1    }}
              exit   ={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="pointer-events-auto w-[88vw] max-w-[360px] bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wider text-sniffy-purple">{title}</p>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X size={14} className="text-gray-500" />
                </button>
              </div>
              {/* Body */}
              <div className="p-5 flex flex-col items-center gap-4 max-h-[70vh] overflow-y-auto">
                <svg viewBox="0 0 200 200" width={180} height={180} className="shrink-0">
                  {paths.map((p, i) => {
                    const clickable = !!onSliceClick && !!p.key;
                    // Wedge click — close the modal, then forward the
                    // slice key to the parent (parent handles tab switch
                    // + filter seed).  We close synchronously so the
                    // backdrop fade-out animates over the new view, not
                    // over the dashboard we just left.
                    const handleClick = clickable
                      ? () => { onClose(); onSliceClick!(p.key!); }
                      : undefined;
                    return (
                      <path
                        key={i}
                        d={p.d}
                        fill={p.color}
                        stroke="white"
                        strokeWidth="2"
                        onClick={handleClick}
                        style={{ cursor: clickable ? 'pointer' : 'default' }}
                        // Accessibility — keyboard users get the same
                        // navigation affordance via Enter/Space.
                        role={clickable ? 'button' : undefined}
                        tabIndex={clickable ? 0 : undefined}
                        aria-label={clickable ? `View sessions for ${p.label}` : undefined}
                        onKeyDown={clickable ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleClick!();
                          }
                        } : undefined}
                      />
                    );
                  })}
                  <circle cx={100} cy={100} r={42} fill="white" pointerEvents="none" />
                  <text x={100} y={96} textAnchor="middle" className="fill-gray-400"
                        style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em' }}
                        pointerEvents="none">
                    TOTAL
                  </text>
                  <text x={100} y={114} textAnchor="middle" className="fill-gray-800"
                        style={{ fontSize: '18px', fontWeight: 800 }}
                        pointerEvents="none">
                    {total}
                  </text>
                </svg>
                {/* Affordance — only when the legend rows actually do
                    something on tap, so we don't lie about interactivity. */}
                {onSliceClick && clickHint && (
                  <p className="-mt-2 text-[10px] font-semibold text-sniffy-purple/80">
                    {clickHint}
                  </p>
                )}
                <div className="flex flex-col gap-2 w-full">
                  {sorted.map((p, i) => {
                    const clickable = !!onSliceClick && !!p.key;
                    const Row = clickable ? 'button' : 'div';
                    return (
                      <Row
                        key={i}
                        type={clickable ? 'button' : undefined}
                        onClick={clickable
                          ? () => { onClose(); onSliceClick!(p.key!); }
                          : undefined}
                        className={`flex items-center gap-2 text-xs text-left w-full ${
                          clickable
                            ? 'px-2 py-1.5 -mx-2 rounded-lg hover:bg-purple-50 active:bg-purple-100 transition-colors cursor-pointer'
                            : ''
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                        <span className="text-gray-700 flex-1 min-w-0 truncate">{p.label}</span>
                        <span className="text-gray-400 tabular-nums">{p.value}</span>
                        <span className="font-bold text-gray-900 tabular-nums w-10 text-right">{p.pct}%</span>
                        {clickable && (
                          <ChevronRight size={12} className="text-gray-300 shrink-0"/>
                        )}
                      </Row>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── Charts drilldown modal ───────────────────────────────────
//
// Opens when the coordinator taps the "Sessions/Month + Revenue (₹K)"
// card on the dashboard.  Mirrors the spirit of the calendar tab's
// Financials drill-down panel: a holistic view that lets them slice
// the same numbers by period and inspect both the sessions trend
// AND the revenue breakdown in one place — instead of squinting at
// two tiny side-by-side bar charts.
//
// Structure (top to bottom):
//   1. Scope pills      — 6M / This month / Last month / All-time
//   2. Sessions section — total / completed / leads / cancelled +
//                         a tall 6-month bar chart
//   3. Revenue section  — net / gross / avg + vendor receivable +
//                         a tall 6-month bar chart (₹K)
//   4. By Source        — count + net + gross + vendor receivable
//                         per source (Woofly / Sidharth / etc.)
//   5. By Status        — pill grid showing every session status
//                         and what share it represents
//
// All numbers re-derive from the scope so flipping pills shows
// genuinely different data, not just a re-styled card.

type DrillScope = 'this_month' | 'last_month' | 'all';

const DRILL_SCOPE_LABELS: Record<DrillScope, string> = {
  this_month:   'This month',
  last_month:   'Last month',
  all:          'All-time',
};

/** Wider bar chart used inside the drilldown.  Same shape as
 *  MiniBarChart but taller, with explicit Y axis-less ticks so the
 *  coordinator can compare months at a glance instead of squinting
 *  at 8-px numbers. */
function LargeBarChart({
  data, color = '#451a8b', valuePrefix = '', valueSuffix = '',
}: {
  data: { label: string; value: number }[];
  color?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-32 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0">
          <span
            className="text-[10px] font-bold tabular-nums leading-none"
            style={{ color: d.value > 0 ? color : 'transparent' }}
          >
            {d.value > 0 ? `${valuePrefix}${d.value}${valueSuffix}` : ''}
          </span>
          <div
            className="w-full rounded-t-md transition-all"
            style={{
              height: `${Math.max((d.value / max) * 88, d.value > 0 ? 6 : 2)}px`,
              background: d.value > 0
                ? `linear-gradient(180deg, ${color}cc 0%, ${color} 100%)`
                : '#f3f4f6',
              boxShadow: d.value > 0 ? `0 2px 8px ${color}33` : 'none',
            }}
          />
          <span className="text-[10px] text-gray-500 font-semibold leading-none mt-0.5">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Tiny labelled KPI cell used in the drilldown's "summary strip". */
function DrillStat({
  label, value, sub, tone,
}: {
  label: string; value: string | number; sub?: string;
  tone?: 'purple' | 'yellow' | 'green' | 'red' | 'gray';
}) {
  const valueCls =
    tone === 'purple' ? 'text-sniffy-purple' :
    tone === 'yellow' ? 'text-yellow-600' :
    tone === 'green'  ? 'text-emerald-600' :
    tone === 'red'    ? 'text-red-500' :
    'text-gray-900';
  return (
    <div className="flex-1 min-w-0 px-2 py-2 rounded-xl bg-gray-50/70">
      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 truncate">
        {label}
      </p>
      <p className={`text-base font-extrabold tabular-nums leading-tight ${valueCls}`}>
        {value}
      </p>
      {sub && <p className="text-[9.5px] text-gray-400 truncate mt-0.5">{sub}</p>}
    </div>
  );
}

/** Compute the per-source rollup the modal renders.  Mirrors the
 *  calendar's computeDaySummary but kept self-contained so the
 *  Overview tab doesn't take a dependency on the calendar file. */
type DrillSourceRow = {
  key: string;
  label: string;
  isExternal: boolean;
  count: number;
  gross: number;
  net: number;
  vendorPrepaidCount: number;
  vendorOwed: number;
};

function computeSourceRollup(sessions: GroomingSession[]): DrillSourceRow[] {
  const buckets = new Map<string, DrillSourceRow>();
  for (const s of sessions) {
    const key = s.source ?? 'unknown';
    const row = buckets.get(key) ?? {
      key,
      label:      resolveSourceLabel(s.source),
      isExternal: isExternalSource(s.source),
      count: 0, gross: 0, net: 0,
      vendorPrepaidCount: 0, vendorOwed: 0,
    };
    const gross = Number(s.booking_amount) || 0;
    let platformCommission = Number(s.platform_commission) || 0;
    if (!platformCommission) {
      const rule = EXTERNAL_SOURCE_FEE_RULE[s.source as string];
      if (rule) platformCommission = commissionFor(rule, gross);
    }
    const groomerCommission = Number(s.groomer_commission) || 0;
    row.count += 1;
    if (s.status === 'completed') {
      row.gross += gross;
      if (isVendorPrepaid(s)) {
        row.vendorPrepaidCount += 1;
        row.vendorOwed += Math.max(0, gross - platformCommission);
      } else {
        row.net += gross - platformCommission - groomerCommission;
      }
    }
    buckets.set(key, row);
  }
  return Array.from(buckets.values()).sort((a, b) => {
    if (a.isExternal !== b.isExternal) return a.isExternal ? -1 : 1;
    return b.count - a.count;
  });
}

/** Per-groomer rollup row for the drilldown's "By Groomer" section.
 *  Mirrors DrillSourceRow's shape so the row renderer stays simple. */
type DrillGroomerRow = {
  name: string;
  count: number;
  completed: number;
  net: number;
};

function computeGroomerRollup(sessions: GroomingSession[]): DrillGroomerRow[] {
  const buckets = new Map<string, DrillGroomerRow>();
  for (const s of sessions) {
    // Skip unassigned rows — surfacing "Unassigned: 14" on the
    // groomer breakdown adds noise without action (you can't pay an
    // unassigned groomer).  Leads naturally fall here, which is fine.
    if (!s.groomer_name) continue;
    const row = buckets.get(s.groomer_name) ?? {
      name: s.groomer_name, count: 0, completed: 0, net: 0,
    };
    row.count += 1;
    if (s.status === 'completed') {
      row.completed += 1;
      // Use Sniffy-collected revenue only — vendor-prepaid rows don't
      // contribute to the groomer's "earning power" the same way and
      // would double-count against the Revenue section above.
      if (!isVendorPrepaid(s)) {
        row.net += Number(s.booking_amount) || 0;
      }
    }
    buckets.set(s.groomer_name, row);
  }
  return Array.from(buckets.values()).sort((a, b) => b.completed - a.completed || b.count - a.count);
}

/** Customers served in a given scope, segmented by lifecycle relative
 *  to the scope window.  "New" means the customer's *first ever*
 *  session lives inside the scope; "repeated" means they had ≥1 prior
 *  session before the scope window opened.  VIP is read from the
 *  customers table (joined on normalized phone). */
type CustomerSegmentation = {
  served:   number;
  new:      number;
  repeated: number;
  vip:      number;
};

function computeCustomerSegmentation(
  scopedSessions: GroomingSession[],
  allSessions: GroomingSession[],
  vipPhones: Set<string>,
  scopeStart: Date | null,
): CustomerSegmentation {
  // Earliest session date per phone across *all* history — used to
  // decide whether a customer's first-ever visit was inside the scope.
  const earliestByPhone = new Map<string, number>();
  for (const s of allSessions) {
    const ph = (s.phone ?? '').trim();
    if (!ph) continue;
    const t = new Date(s.session_date).getTime();
    if (!Number.isFinite(t)) continue;
    const prev = earliestByPhone.get(ph);
    if (prev === undefined || t < prev) earliestByPhone.set(ph, t);
  }

  const scopedPhones = new Set<string>();
  for (const s of scopedSessions) {
    const ph = (s.phone ?? '').trim();
    if (ph) scopedPhones.add(ph);
  }

  const scopeStartMs = scopeStart ? scopeStart.getTime() : Number.NEGATIVE_INFINITY;
  let newCount = 0, repeatedCount = 0, vipCount = 0;
  for (const ph of scopedPhones) {
    const first = earliestByPhone.get(ph) ?? Number.POSITIVE_INFINITY;
    if (first >= scopeStartMs) newCount += 1;
    else                       repeatedCount += 1;
    // Phone strings in `customers.phone` are already normalized to
    // E.164 (+91…); session rows are raw user input.  We try both
    // shapes when looking up VIP so a "9876543210" session row still
    // matches a "+919876543210" customer row.
    const digits = ph.replace(/\D/g, '');
    if (
      vipPhones.has(ph) ||
      vipPhones.has(`+91${digits.slice(-10)}`) ||
      vipPhones.has(digits)
    ) {
      vipCount += 1;
    }
  }

  return {
    served:   scopedPhones.size,
    new:      newCount,
    repeated: repeatedCount,
    vip:      vipCount,
  };
}

function ChartsDrilldownModal({
  open, sessions, customers, onClose,
}: {
  open: boolean;
  sessions: GroomingSession[];
  /** Slim customers payload (phone + VIP flag) so the modal can show
   *  VIP counts in the "Customers" segmentation strip.  Optional —
   *  modal degrades gracefully to "VIP: 0" when omitted. */
  customers?: { phone: string; is_vip: boolean }[];
  onClose: () => void;
}) {
  const [scope, setScope] = useState<DrillScope>('this_month');

  // ── Scoped sessions ───────────────────────────────────────
  const scopedSessions = (() => {
    const now = new Date();
    if (scope === 'all') return sessions;
    if (scope === 'this_month') {
      return sessions.filter(s => {
        const d = new Date(s.session_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    // last_month
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return sessions.filter(s => {
      const d = new Date(s.session_date);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    });
  })();

  // ── Derived ──────────────────────────────────────────────
  const now = new Date();
  const total      = scopedSessions.length;
  const completed  = scopedSessions.filter(s => s.status === 'completed');
  const leads      = scopedSessions.filter(s => s.status === 'lead').length;
  const scheduled  = scopedSessions.filter(s => s.status === 'scheduled' || s.status === 'groomer_assigned').length;
  const cancelled  = scopedSessions.filter(s => s.status === 'cancelled').length;
  // Groomed-but-unsettled.  Counted on its own rather than folded into
  // `scheduled`: these are finished sessions, so calling them scheduled
  // is what made past work show up as upcoming in the first place.
  const groomingDone = scopedSessions.filter(s => s.status === 'grooming_done').length;

  // Revenue: only Sniffy-collected rows feed netRevenue (vendor-
  // prepaid bookings show up under "Vendor receivable" instead).
  const completedSniffy = completed.filter(s => !isVendorPrepaid(s));
  const completedVendor = completed.filter(s => isVendorPrepaid(s));
  const netRevenue = completedSniffy.reduce((s, x) => s + (x.booking_amount ?? 0), 0);
  const grossRevenue = completedSniffy.reduce((s, x) => s + (x.booking_amount ?? 0), 0)
    + completedVendor.reduce((s, x) => s + (x.booking_amount ?? 0), 0);
  const vendorOwed = completedVendor.reduce((s, x) =>
    s + Math.max(0,
      (x.booking_amount ?? 0)
        - (x.platform_commission ?? 0),
    ), 0);
  const avgBooking = completedSniffy.length
    ? Math.round(netRevenue / completedSniffy.length)
    : 0;

  // ── Trend series — actually responds to the scope pills ──
  //
  //   • This month / Last month → 5 weekly buckets (W1–W5) so the
  //     coordinator can see in-month pacing without 30 razor-thin
  //     daily bars.  W5 holds days 29-end (most months will only
  //     have 1-3 days in W5, which is fine and accurate).
  //   • All-time → one bar per calendar month for every month that
  //     has data, capped at the most recent 12 so older history
  //     doesn't squish today's bar into nothing.
  //
  // Sessions chart counts every row; revenue chart sums only
  // completed bookings, in ₹K (matches the dashboard's mini chart).
  const trendSeries = (() => {
    // Returns the 1-indexed week number (1–5) inside a given month
    // for a date, where W1=days 1–7, W2=8–14, W3=15–21, W4=22–28,
    // W5=29-end.
    const weekOfMonth = (d: Date) => Math.min(5, Math.floor((d.getDate() - 1) / 7) + 1);

    const labelsW = ['W1', 'W2', 'W3', 'W4', 'W5'];

    if (scope === 'this_month' || scope === 'last_month') {
      // Pin the bucket month so a row from Aug 4 doesn't sneak into
      // the May "W1" pile when scope === this_month and we miscount.
      const target = scope === 'this_month'
        ? { m: now.getMonth(), y: now.getFullYear() }
        : (() => {
            const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return { m: lm.getMonth(), y: lm.getFullYear() };
          })();

      const sessionsByWeek = [0, 0, 0, 0, 0];
      const revenueByWeek  = [0, 0, 0, 0, 0];
      sessions.forEach(s => {
        const d = new Date(s.session_date);
        if (d.getMonth() !== target.m || d.getFullYear() !== target.y) return;
        const w = weekOfMonth(d) - 1;
        sessionsByWeek[w] += 1;
        if (s.status === 'completed') revenueByWeek[w] += s.booking_amount ?? 0;
      });
      return {
        sessions: labelsW.map((lab, i) => ({ label: lab, value: sessionsByWeek[i] })),
        revenue:  labelsW.map((lab, i) => ({ label: lab, value: Math.round(revenueByWeek[i] / 1000) })),
        sessionsTitle: 'Sessions / Week',
        revenueTitle:  'Revenue (₹K) / Week',
        range: scope === 'this_month' ? 'this month' : 'last month',
      };
    }

    // All-time — one bar per month, cap at most recent 12 months
    // containing any session date.
    const counts = new Map<string, { y: number; m: number; sess: number; rev: number }>();
    sessions.forEach(s => {
      const d = new Date(s.session_date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const row = counts.get(key) ?? { y: d.getFullYear(), m: d.getMonth(), sess: 0, rev: 0 };
      row.sess += 1;
      if (s.status === 'completed') row.rev += s.booking_amount ?? 0;
      counts.set(key, row);
    });
    const ordered = Array.from(counts.values())
      .sort((a, b) => a.y === b.y ? a.m - b.m : a.y - b.y)
      .slice(-12);
    return {
      sessions: ordered.map(r => ({
        label: new Date(r.y, r.m, 1).toLocaleString('en-IN', { month: 'short' }),
        value: r.sess,
      })),
      revenue: ordered.map(r => ({
        label: new Date(r.y, r.m, 1).toLocaleString('en-IN', { month: 'short' }),
        value: Math.round(r.rev / 1000),
      })),
      sessionsTitle: 'Sessions / Month',
      revenueTitle:  'Revenue (₹K) / Month',
      range: ordered.length === 0
        ? 'no data'
        : `${ordered.length} month${ordered.length === 1 ? '' : 's'}`,
    };
  })();
  const monthlySessions  = trendSeries.sessions;
  const monthlyRevenueK  = trendSeries.revenue;

  // Per-source rollup over the scoped sessions.
  const sourceRows = computeSourceRollup(scopedSessions);

  // Per-groomer rollup — surfaces "how many sessions did each groomer
  // do this month" in the same drill-down so the coordinator doesn't
  // have to jump to the Groomers tab to answer it.
  const groomerRows = computeGroomerRollup(scopedSessions);

  // Customers served in this scope, with new/repeated/VIP split.
  // The scope-window start date is what decides whether a customer is
  // "new" — their first-ever session must fall on/after this date.
  const scopeStart: Date | null = (() => {
    if (scope === 'this_month') return new Date(now.getFullYear(), now.getMonth(), 1);
    if (scope === 'last_month') return new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return null; // all-time → no lower bound, everyone counts as "new" historically
  })();
  const vipPhones = (() => {
    const set = new Set<string>();
    (customers ?? []).forEach(c => {
      if (c.is_vip && c.phone) set.add(c.phone);
    });
    return set;
  })();
  const custSeg = computeCustomerSegmentation(
    scopedSessions,
    sessions,
    vipPhones,
    scopeStart,
  );

  // "Turnover" surface — gross + net for the scope, called out
  // explicitly so the coordinator can answer "what's our turnover this
  // month?" without mentally adding the KPI tiles.
  const turnoverLabel = scope === 'all'
    ? 'All-time turnover'
    : scope === 'last_month'
      ? 'Last month turnover'
      : 'This month turnover';

  // Status pills.
  const statusCounts: Record<SessionStatus, number> = {
    lead: leads,
    scheduled,
    groomer_assigned: 0,           // already folded into scheduled
    grooming_done: groomingDone,
    completed: completed.length,
    cancelled,
  };

  // Subtitle telling the user what they're looking at.
  const subtitle = (() => {
    if (scope === 'this_month') return now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    if (scope === 'last_month') {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return lm.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    }
    return 'All-time';
  })();

  if (typeof document === 'undefined') return null;

  // Same portal/centering pattern as DonutModal — avoids the
  // transformed-ancestor + framer-motion-transform interaction that
  // would otherwise off-center the dialog.
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] bg-black/45 backdrop-blur-[2px]"
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1,    y: 0 }}
              exit   ={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="pointer-events-auto w-[92vw] max-w-[440px] max-h-[88vh] bg-white rounded-3xl overflow-hidden flex flex-col"
              style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.22)' }}
              role="dialog"
              aria-label="Sessions and Revenue drilldown"
            >
              {/* ── Header ─────────────────────────────────── */}
              <div
                className="px-5 pt-4 pb-3 border-b border-gray-100"
                style={{ background: 'linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-sniffy-purple">
                      Drilldown
                    </p>
                    <h3 className="text-[17px] font-extrabold text-gray-900 leading-tight mt-0.5">
                      Sessions &amp; Revenue
                    </h3>
                    <p className="text-[11px] text-gray-500 font-semibold mt-0.5 truncate">
                      {subtitle}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/80 shrink-0"
                    aria-label="Close"
                  >
                    <X size={16} className="text-gray-500"/>
                  </button>
                </div>

                {/* Scope pills — Current / Last / All-time.
                    Default opens on Current month so May (or whatever
                    the active month is) is the first thing they see. */}
                <div className="flex gap-1 p-1 mt-3 bg-gray-100 rounded-xl">
                  {(['this_month', 'last_month', 'all'] as DrillScope[]).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScope(s)}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition truncate ${
                        scope === s
                          ? 'bg-white text-sniffy-purple shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {s === 'this_month' ? 'Current month'
                       : s === 'last_month' ? 'Last month'
                       : 'All-time'}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Body (scrollable) ───────────────────────── */}
              <div className="overflow-y-auto px-5 py-4 space-y-5">

                {/* SESSIONS section */}
                <section>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Activity size={12} className="text-sniffy-purple"/>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-sniffy-purple">
                      Sessions
                    </p>
                    <span className="text-[10px] font-semibold text-gray-400 ml-auto">
                      {DRILL_SCOPE_LABELS[scope]}
                    </span>
                  </div>

                  {/* KPI strip */}
                  <div className="flex gap-2">
                    <DrillStat label="Total"     value={total}                                        tone="purple"/>
                    <DrillStat label="Completed" value={completed.length} sub={`${scheduled} scheduled`} tone="green"/>
                    <DrillStat label="Leads"     value={leads}            sub={`${cancelled} cancelled`} tone={leads > 0 ? 'red' : 'gray'}/>
                  </div>

                  {/* Trend chart — bucketed by week for month scopes,
                      by month for all-time.  Title + range label both
                      come from trendSeries so they stay in sync. */}
                  <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                        <BarChart3 size={10}/> {trendSeries.sessionsTitle}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold">{trendSeries.range}</p>
                    </div>
                    <LargeBarChart data={monthlySessions} color="#451a8b"/>
                  </div>
                </section>

                {/* CUSTOMERS SERVED section — segmented new / repeated /
                    VIP for the scope.  Answers "who did we groom?" not
                    "how many sessions did we run?" — distinct metrics
                    because one customer can take several sessions. */}
                <section>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Users size={12} className="text-blue-600"/>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                      Customers Served
                    </p>
                    <span className="text-[10px] font-semibold text-gray-400 ml-auto">
                      {DRILL_SCOPE_LABELS[scope]}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <DrillStat label="Served" value={custSeg.served} sub="unique" tone="purple"/>
                    <DrillStat label="New"    value={custSeg.new}    sub="first-time" tone="green"/>
                    <DrillStat label="Repeat" value={custSeg.repeated} sub="returning" tone="yellow"/>
                  </div>
                  {/* VIP — separate row so the strip above stays a
                      consistent 3-up grid; VIPs are a small but
                      special slice that deserves its own callout. */}
                  <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-[10.5px] font-bold text-amber-700 flex items-center gap-1.5">
                      <Crown size={11}/> VIP customers in scope
                    </span>
                    <span className="text-[12px] font-extrabold text-amber-700 tabular-nums">
                      {custSeg.vip}
                    </span>
                  </div>
                </section>

                {/* REVENUE section */}
                <section>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <IndianRupee size={12} className="text-yellow-600"/>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-600">
                      Revenue
                    </p>
                    <span className="text-[10px] font-semibold text-gray-400 ml-auto">
                      {DRILL_SCOPE_LABELS[scope]}
                    </span>
                  </div>

                  {/* KPI strip */}
                  <div className="flex gap-2">
                    <DrillStat label="Net"   value={shortCurrency(netRevenue)}   sub="cash in"    tone="yellow"/>
                    <DrillStat label="Gross" value={shortCurrency(grossRevenue)} sub="incl. vendor" tone="gray"/>
                    <DrillStat label="Avg"   value={shortCurrency(avgBooking)}   sub="per booking"  tone="gray"/>
                  </div>

                  {/* Turnover callout — sums Sniffy-collected gross + the
                      vendor-prepaid leg, so the coordinator sees the
                      "total money moved through Sniffy in this scope"
                      number without having to add the Gross + Vendor
                      receivable tiles in their head. */}
                  <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-xl bg-yellow-50 border border-yellow-100">
                    <span className="text-[10.5px] font-bold text-yellow-700 flex items-center gap-1.5">
                      <TrendingUp size={11}/> {turnoverLabel}
                    </span>
                    <span className="text-[12px] font-extrabold text-yellow-700 tabular-nums">
                      {fmtCurrency(grossRevenue + vendorOwed)}
                    </span>
                  </div>

                  {vendorOwed > 0 && (
                    <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-xl bg-purple-50 border border-purple-100">
                      <span className="text-[10.5px] font-bold text-sniffy-purple flex items-center gap-1.5">
                        <TrendingUp size={11}/> Vendor receivable
                      </span>
                      <span className="text-[12px] font-extrabold text-sniffy-purple tabular-nums">
                        +{fmtCurrency(vendorOwed)}
                      </span>
                    </div>
                  )}

                  {/* Revenue trend — matches the sessions chart's bucketing. */}
                  <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                        <BarChart3 size={10}/> {trendSeries.revenueTitle}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold">{trendSeries.range}</p>
                    </div>
                    <LargeBarChart data={monthlyRevenueK} color="#f6ac0a" valuePrefix="₹" valueSuffix="K"/>
                  </div>
                </section>

                {/* BY GROOMER — per-groomer session/completed/net split
                    for the active scope.  Answers "how many sessions
                    did each groomer do this month?" in-place, without
                    forcing a tab switch to the Groomers / Payroll
                    surfaces. */}
                {groomerRows.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-6 h-6 rounded-lg bg-pink-50 flex items-center justify-center">
                        <Scissors size={12} className="text-pink-600"/>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-pink-600">
                        By Groomer
                      </p>
                      <span className="text-[10px] font-semibold text-gray-400 ml-auto">
                        {groomerRows.length} groomer{groomerRows.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white divide-y divide-gray-50">
                      {groomerRows.map(r => (
                        <div key={r.name} className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-purple-100 text-sniffy-purple flex items-center justify-center text-[9px] font-extrabold shrink-0">
                              {r.name.charAt(0).toUpperCase()}
                            </span>
                            <span className="text-[12px] font-bold text-gray-800 truncate flex-1 min-w-0">
                              {r.name}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-400 tabular-nums shrink-0">
                              {r.count} {r.count === 1 ? 'session' : 'sessions'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1 pl-8 gap-3">
                            <span className="text-[10.5px] font-semibold text-gray-500">
                              {r.completed} completed
                            </span>
                            <span className="text-[11px] text-gray-600 tabular-nums">
                              Net <span className="font-bold text-emerald-600">{fmtCurrency(r.net)}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* BY SOURCE — mirrors the FinancialsPanel rollup so
                    the coordinator sees the same per-source split they
                    see on the calendar page, but for the chosen scope. */}
                {sourceRows.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Users size={12} className="text-blue-600"/>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                        By Source
                      </p>
                      <span className="text-[10px] font-semibold text-gray-400 ml-auto">
                        {sourceRows.length} channel{sourceRows.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white divide-y divide-gray-50">
                      {sourceRows.map(r => {
                        const dotColor = (SOURCE_COLORS as Record<string, string>)[r.key] ?? '#94a3b8';
                        return (
                          <div key={r.key} className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }}/>
                              <span className="text-[12px] font-bold text-gray-800 truncate flex-1 min-w-0">
                                {r.label}
                              </span>
                              <span className="text-[10px] font-semibold text-gray-400 tabular-nums shrink-0">
                                {r.count} {r.count === 1 ? 'order' : 'orders'}
                              </span>
                            </div>
                            {/* Money row — original "Net ₹X (₹Y)"
                                layout restored, just at a smaller
                                size (11px) and with a slightly darker
                                gray so the parenthesised gross stays
                                legible without dominating the row. */}
                            <div className="flex items-center justify-between mt-1 pl-4 gap-3">
                              <span className="text-[11px] text-gray-600 tabular-nums">
                                Net <span className="font-bold text-gray-900">{fmtCurrency(r.net)}</span>
                                {r.gross !== r.net && r.gross > 0 && (
                                  <span className="text-gray-500"> ({fmtCurrency(r.gross)})</span>
                                )}
                              </span>
                              {r.vendorPrepaidCount > 0 && (
                                <span className="text-[10px] text-sniffy-purple font-semibold tabular-nums shrink-0">
                                  +{fmtCurrency(r.vendorOwed)} owed
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* BY STATUS — quick pill grid summarising the
                    distribution of every status in scope. */}
                <section>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-emerald-600"/>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                      By Status
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* grooming_done is listed even though it is often 0:
                        omitting it would drop finished-but-unsettled rows
                        out of the breakdown entirely (they are no longer
                        folded into `scheduled`), leaving the percentages
                        short of 100 with nothing to explain the gap. */}
                    {(['completed', 'grooming_done', 'scheduled', 'lead', 'cancelled'] as SessionStatus[]).map(st => {
                      const v = statusCounts[st];
                      const pct = total > 0 ? Math.round((v / total) * 100) : 0;
                      return (
                        <div
                          key={st}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl ${STATUS_COLORS[st]} bg-opacity-50`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wide truncate flex-1">
                            {STATUS_LABELS[st]}
                          </span>
                          <span className="text-sm font-extrabold tabular-nums">{v}</span>
                          <span className="text-[10px] font-semibold opacity-70 tabular-nums">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── Main ─────────────────────────────────────────────────────

/** Optional filter payload that OverviewTab passes through `onNavigate`.
 *  Used by the Sessions tab to seed its FilterBar so a click on the
 *  source/groomer donut lands the coordinator on a pre-scoped list. */
export type OverviewNavigateFilter = { source?: string; groomer?: string };

export default function OverviewTab({
  user, onNavigate,
}: {
  user?: AdminUser;
  /** Tab navigation callback.  When the second argument is supplied,
   *  the host should seed the destination tab's filters with it (see
   *  AdminDashboard's `sessionsInitialFilter` plumbing for the
   *  Sessions-tab case). */
  onNavigate?: (tab: TabId, filter?: OverviewNavigateFilter) => void;
}) {
  // Sessions come from the dashboard-wide snapshot (see sessionsCache.ts)
  // rather than a tab-local fetch, so bouncing between Overview, Sessions
  // and Calendar reuses one download instead of re-pulling the table on
  // every mount.
  const { sessions, loading: sessionsLoading } = useSessions();
  const [bookings, setBookings] = useState<Booking[]>([]);
  /** Lightweight customer slice — only the fields the drilldown's
   *  "Customers served" segmentation needs (phone for join, is_vip for
   *  the VIP count).  Kept slim on purpose so the dashboard doesn't
   *  fetch every column on every Overview load. */
  const [customers, setCustomers] = useState<{ phone: string; is_vip: boolean }[]>([]);
  /** Cold-start flag for the two tab-local queries (bookings + customers).
   *  Sessions track their own loading state via the shared cache. */
  const [sideDataLoading, setSideDataLoading] = useState(true);
  const [convertBooking, setConvertBooking] = useState<Booking | null>(null);
  // Which donut, if any, is currently expanded in the modal popup.
  const [expandedDonut, setExpandedDonut] = useState<null | 'source' | 'groomer'>(null);
  // Sessions × Revenue chart card → opens a centered holistic drilldown.
  const [chartsDrilldownOpen, setChartsDrilldownOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(20),
      // Customers — slim payload (phone + VIP flag) for the drilldown's
      // segmentation strip.  Failure is non-fatal — segmentation just
      // collapses to "served / new / repeated" without VIP if this errors.
      supabase.from('customers').select('phone, is_vip'),
    ]).then(([{ data: b }, { data: c }]) => {
      setBookings((b ?? []) as Booking[]);
      setCustomers((c ?? []) as { phone: string; is_vip: boolean }[]);
      setSideDataLoading(false);
    });
  }, []);

  // Refresh bookings after convert.  Converting also mints a new session
  // row, so the shared snapshot has to be refetched — otherwise the
  // Sessions and Calendar tabs would keep serving the pre-conversion
  // cache until its TTL lapsed.
  function handleConverted() {
    setConvertBooking(null);
    void refreshSessions();
    supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => setBookings((data ?? []) as Booking[]));
  }

  // ── Derived stats ─────────────────────────────────────────
  //
  // Every figure below is a full pass (or several) over the session
  // array.  They used to sit in the component body, so opening a donut
  // popup, converting a booking, or any other bit of local state churn
  // recomputed all ~25 of them — roughly 40 array traversals per render
  // for output that only ever changes when `sessions` or `bookings` do.
  // One useMemo over both inputs collapses that to once per data change.
  //
  // NOTE: this must stay above the `loading` early-return — hooks can't
  // live behind a conditional return.  It runs against empty arrays on
  // the first pass, which is cheap.
  const stats = useMemo(() => {
  const completed       = sessions.filter(s => s.status === 'completed');
  const leads           = sessions.filter(s => s.status === 'lead');
  const scheduled       = sessions.filter(s => s.status === 'scheduled' || s.status === 'groomer_assigned');
  const now             = new Date();
  const thisMonth       = sessions.filter(s => {
    const d = new Date(s.session_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth       = sessions.filter(s => {
    const d = new Date(s.session_date);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });
  // Revenue split into the two payment paths:
  //   • Sniffy-collected (incl. groomer_cash) — cash that actually
  //     entered Sniffy's books.  netRevenue / totalRevenue use these
  //     so the headline "Revenue" tile reflects real receipts, not a
  //     mix of receipts and partner-settled bookings.
  //   • Vendor-prepaid — partner already collected from the customer.
  //     Sniffy gets a groomer fee separately; we count platform
  //     commission as "amount the partner owes us" for the
  //     reconciliation tile.
  const completedSniffyCollected = completed.filter(s => !isVendorPrepaid(s));
  const completedVendorPrepaid   = completed.filter(s => isVendorPrepaid(s));
  const netRevenue      = completedSniffyCollected.reduce((s, x) => s + (x.net_booking_amount ?? 0), 0);
  const totalRevenue    = completedSniffyCollected.reduce((s, x) => s + (x.booking_amount ?? 0), 0);
  const thisMonthRev    = thisMonth
    .filter(s => s.status === 'completed' && !isVendorPrepaid(s))
    .reduce((s, x) => s + (x.booking_amount ?? 0), 0);
  // Vendor receivable surface — for vendor-prepaid bookings the
  // partner owes Sniffy the groomer fee.  Without a stored
  // "vendor_owes" column we approximate it as
  // (booking_amount − platform_commission − groomer_commission), i.e.
  // what would have been Sniffy's keep had we collected directly.
  // Coordinators can refine this in Vendor Reconciliation later.
  const vendorPrepaidGross  = completedVendorPrepaid.reduce((s, x) => s + (x.booking_amount ?? 0), 0);
  const vendorOwedToSniffy  = completedVendorPrepaid.reduce(
    (s, x) =>
      s +
      Math.max(
        0,
        (x.booking_amount ?? 0) -
          (x.platform_commission ?? 0),
      ),
    0,
  );
  const uniqueCustomers = new Set(sessions.map(s => s.phone).filter(Boolean)).size;
  const avgBooking      = completedSniffyCollected.length
    ? Math.round(totalRevenue / completedSniffyCollected.length)
    : 0;
  const momChange       = lastMonth.length ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100) : 0;
  const pendingBookings = bookings.filter(b => !b.is_converted);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: d.toLocaleString('en-IN', { month: 'short' }),
      value: sessions.filter(s => { const sd = new Date(s.session_date); return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear(); }).length,
    };
  });
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: d.toLocaleString('en-IN', { month: 'short' }),
      value: Math.round(sessions.filter(s => { const sd = new Date(s.session_date); return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear() && s.status === 'completed'; }).reduce((sum, s) => sum + (s.booking_amount ?? 0), 0) / 1000),
    };
  });

  const sourceCounts: Partial<Record<BookingSource, number>> = {};
  sessions.forEach(s => { sourceCounts[s.source] = (sourceCounts[s.source] ?? 0) + 1; });
  // `key` carries the raw source enum value (e.g. 'woofly') so the
  // donut modal can pass it straight back to the Sessions tab as the
  // `source` filter — no string-matching against display labels needed.
  const sourceBreakdown: DonutSlice[] = (Object.entries(sourceCounts) as [BookingSource, number][])
    .map(([src, val]) => ({
      key:   src,
      label: SOURCE_LABELS[src],
      value: val,
      color: SOURCE_COLORS[src],
    }));

  const groomerCounts: Record<string, number> = {};
  sessions.forEach(s => { if (s.groomer_name) groomerCounts[s.groomer_name] = (groomerCounts[s.groomer_name] ?? 0) + 1; });
  const groomerColors = ['#7c3aed','#22c55e','#f97316','#06b6d4','#eab308'];
  // For groomers the `key` is the `groomer_name` itself — that's how the
  // session row stores it, so an `.eq('groomer_name', key)` query in
  // SessionsTab is a direct match.
  const groomerBreakdown: DonutSlice[] = Object.entries(groomerCounts).map(([name, val], i) => ({
    key:   name,
    label: name,
    value: val,
    color: groomerColors[i % groomerColors.length],
  }));

  // ── Pending cash deposits — groomer_cash sessions not yet verified.
  // Groomers physically hold this money; coordinator needs to collect.
  const pendingCashByGroomer = (() => {
    const map = new Map<string, { name: string; count: number; total: number }>();
    sessions.forEach(s => {
      if (s.payment_collected_by !== 'groomer_cash') return;
      if (s.payment_verified) return;
      if (!s.payment_collected_at) return; // groomer hasn't marked collected yet
      const name = s.groomer_name || 'Unknown Groomer';
      const row = map.get(name) ?? { name, count: 0, total: 0 };
      row.count += 1;
      row.total += (Number(s.booking_amount) || 0) + (Number(s.upsell_amount) || 0) + (Number(s.tip_amount) || 0);
      map.set(name, row);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  })();
  const pendingCashTotal = pendingCashByGroomer.reduce((s, r) => s + r.total, 0);

  // A groomed session counts as a visit whether or not the money has
  // landed — the pet is due again on the same schedule either way, and
  // dropping these would quietly stop chasing repeat business on any
  // customer whose vendor hasn't settled.
  const followupSoon = sessions
    .filter(s => (s.status === 'completed' || s.status === 'grooming_done')
      && s.next_due_date && daysUntil(s.next_due_date) <= 7)
    .sort((a, b) => daysUntil(a.next_due_date!) - daysUntil(b.next_due_date!))
    .slice(0, 3);

  const recentSessions = sessions.slice(0, 3);

    return {
      // `completed` stays internal — it feeds the revenue splits above
      // but the render reads only the aggregates.
      leads, scheduled, thisMonth,
      netRevenue, thisMonthRev, vendorPrepaidGross, vendorOwedToSniffy,
      uniqueCustomers, avgBooking, momChange, pendingBookings,
      monthlyData, revenueData, sourceBreakdown, groomerBreakdown,
      pendingCashByGroomer, pendingCashTotal, followupSoon, recentSessions,
    };
  }, [sessions, bookings]);

  const {
    leads, scheduled, thisMonth,
    netRevenue, thisMonthRev, vendorPrepaidGross, vendorOwedToSniffy,
    uniqueCustomers, avgBooking, momChange, pendingBookings,
    monthlyData, revenueData, sourceBreakdown, groomerBreakdown,
    pendingCashByGroomer, pendingCashTotal, followupSoon, recentSessions,
  } = stats;

  // Cold start only.  A background revalidation of the shared session
  // snapshot deliberately does NOT re-show this skeleton — the tab keeps
  // rendering the data it already has and swaps in the new rows silently.
  if (sessionsLoading || sideDataLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  // Build prefill from booking for SessionFormModal
  function bookingToPrefill(b: Booking): Partial<GroomingSession> {
    return {
      pet_parent_name: b.name,
      phone: b.phone,
      breed: b.breed,
      pet_type: b.pet_type as 'dog' | 'cat',
      address: b.city,
      package: b.package,
      medical_issues: b.medical ?? null,
      status: 'scheduled',
      source: 'website_booking',
      source_type: 'internal',
    };
  }

  const card = "bg-white rounded-2xl border border-gray-100";
  const shadow = { boxShadow: '0 4px 16px rgba(0,0,0,0.10)' };

  // ── Greeting line — used in the new mobile hero.
  //
  // Pull "Hello, Nikita" from whichever user we have; fall back to a
  // generic "Hello there" when the prop wasn't threaded through (e.g.
  // dev-time route).  Sub-line is intentionally short and cheerful —
  // it lives directly above the data and shouldn't compete with it.
  const firstName = (user?.name ?? '').split(' ')[0] || 'there';
  const heroSubtext = leads.length > 0
    ? `${leads.length} lead${leads.length === 1 ? '' : 's'} waiting · let's make today wag-worthy`
    : "you're all clear · let's make today wag-worthy";

  return (
    <div className="space-y-4">

      {/* ── Mobile hero — "Hello, {name}" + 2×2 tile grid (weather + KPI).
          Designed to feel like a single grouped panel rather than three
          disconnected strips stacked on top of each other. */}
      <section className="sm:hidden">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="px-1 mb-3"
        >
          <h2 className="text-[18px] font-extrabold text-gray-900 leading-tight">
            Hello, <span className="text-sniffy-purple">{firstName}</span>
          </h2>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">
            {heroSubtext}
          </p>
        </motion.div>

        {/* Top row — weather (left) + sessions (right). */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.04 }}>
            <WeatherWidget variant="tile"/>
          </motion.div>
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.07 }}>
            <StatTile
              Icon={Activity}
              // Softer purple — purple-400 → purple-500 instead of the
              // previous 600→900 deep duo, so the tiles feel lifted, not
              // shouted at.  Coordinator feedback: "half faded".
              tileGradient="linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)"
              value={sessions.length}
              label="Sessions"
              sub={
                momChange === 0
                  ? `${thisMonth.length} this month`
                  : `${momChange > 0 ? '↑' : '↓'}${Math.abs(momChange)}% vs last mo`
              }
              subTone={momChange > 0 ? 'positive' : momChange < 0 ? 'negative' : 'muted'}
            />
          </motion.div>
        </div>

        {/* Bottom row — revenue (left) + customers (right). */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.10 }}>
            <StatTile
              Icon={IndianRupee}
              // Soft indigo — indigo-400 → indigo-500.
              tileGradient="linear-gradient(135deg, #818cf8 0%, #6366f1 100%)"
              value={shortCurrency(netRevenue)}
              label="Revenue"
              sub={
                vendorOwedToSniffy > 0
                  ? `+${shortCurrency(vendorOwedToSniffy)} vendor`
                  : `mo: ${shortCurrency(thisMonthRev)}`
              }
              subTone="muted"
            />
          </motion.div>
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.13 }}>
            <StatTile
              Icon={Users}
              // Soft blue — blue-400 → blue-500.
              tileGradient="linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)"
              value={uniqueCustomers}
              label="Customers"
              sub={`avg ${shortCurrency(avgBooking)}`}
              subTone="muted"
            />
          </motion.div>
        </div>

        {/* Wide leads strip — only when there are open leads to chase.
            Sits below the 2×2 like the reference's "Monthly Growth" row
            but stays out of the way when there's nothing to do. */}
        {leads.length > 0 && (
          <motion.div
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.16 }}
            className="relative rounded-2xl bg-white border border-gray-100 p-3.5 mt-3 overflow-hidden"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
          >
            <div
              aria-hidden
              className="absolute -top-6 -right-6 w-28 h-28 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.10) 0%, rgba(239,68,68,0) 70%)' }}
            />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  boxShadow: '0 4px 12px rgba(220,38,38,0.35)',
                }}
              >
                <Flame size={18} className="text-white" strokeWidth={2.4}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-500 font-medium">Open Leads</p>
                <p className="text-[22px] font-extrabold text-gray-900 leading-tight tabular-nums">
                  {leads.length}
                </p>
              </div>
              <button
                onClick={() => onNavigate?.('followups')}
                className="text-[11px] text-sniffy-purple font-bold flex items-center gap-0.5 hover:underline shrink-0"
              >
                Call them <ChevronRight size={12}/>
              </button>
            </div>
          </motion.div>
        )}
      </section>

      {/* ── Desktop weather strip (full width) — unchanged behaviour. */}
      <div className="hidden sm:block">
        <WeatherWidget/>
      </div>

      {/* ── Pending milestone approvals (mirrors the admin calendar's
          rail).  Hidden when there's nothing pending. */}
      {user && (
        <MilestoneApprovalsRail approvedBy={user.name} allowed={canWrite(user)}/>
      )}

      {/* Desktop only — original spacious 2×2 grid */}
      <div className="hidden sm:grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.04 }}
          className={`${card} p-4`} style={shadow}>
          <span className="block w-2 h-2 rounded-full bg-sniffy-purple mb-2" />
          <p className="text-[11px] text-gray-500 font-medium">Sessions</p>
          <p className="text-3xl font-extrabold text-gray-900 leading-tight">{sessions.length}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <p className="text-[10px] text-gray-400">{thisMonth.length} this month</p>
            {momChange !== 0 && (
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${momChange > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {momChange > 0 ? <ArrowUpRight size={9}/> : <ArrowDownRight size={9}/>}
                {Math.abs(momChange)}%
              </span>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.07 }}
          className={`${card} p-4`} style={shadow}>
          <span className="block w-2 h-2 rounded-full bg-sniffy-yellow mb-2" />
          <p className="text-[11px] text-gray-500 font-medium">Net Revenue</p>
          <p className="text-2xl font-extrabold text-gray-900 leading-tight">{fmtCurrency(netRevenue)}</p>
          <p className="text-[10px] text-gray-400 mt-1">
            This month: {fmtCurrency(thisMonthRev)}
            {vendorPrepaidGross > 0 && (
              <>
                {' · '}
                <span className="text-sniffy-purple font-semibold">
                  +{fmtCurrency(vendorOwedToSniffy)} vendor receivable
                </span>
              </>
            )}
          </p>
        </motion.div>

        <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.10 }}
          className={`${card} p-4`} style={shadow}>
          <span className="block w-2 h-2 rounded-full bg-red-400 mb-2" />
          <p className="text-[11px] text-gray-500 font-medium">Open Leads</p>
          <p className="text-3xl font-extrabold text-gray-900 leading-tight">{leads.length}</p>
          {leads.length === 0
            ? <span className="inline-flex items-center gap-1 text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded-full bg-green-50 text-green-700"><CheckCircle2 size={9}/> All clear</span>
            : <p className="text-[10px] text-gray-400 mt-1">{scheduled.length} scheduled</p>
          }
        </motion.div>

        <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.13 }}
          className={`${card} p-4`} style={shadow}>
          <span className="block w-2 h-2 rounded-full bg-green-500 mb-2" />
          <p className="text-[11px] text-gray-500 font-medium">Customers</p>
          <p className="text-3xl font-extrabold text-gray-900 leading-tight">{uniqueCustomers}</p>
          <p className="text-[10px] text-gray-400 mt-1">Avg {fmtCurrency(avgBooking)}/session</p>
        </motion.div>
      </div>

      {/* ── My List — personal reminders, one card for both breakpoints.
          Sits straight under the KPI tiles (mobile) / KPI grid (desktop)
          because it's the first thing you act on, not a footnote. */}
      <TodoListCard user={user}/>

      {/* ── Pending Cash Deposits ────────────────────────────── */}
      {pendingCashByGroomer.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                <Banknote size={14} className="text-white" strokeWidth={2.2}/>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Cash with Groomers
                </p>
                <p className="text-[10px] text-amber-600/80">Pending office deposit</p>
              </div>
            </div>
            <p className="text-sm font-extrabold text-amber-700 tabular-nums">{fmtCurrency(pendingCashTotal)}</p>
          </div>
          <div className="space-y-1.5">
            {pendingCashByGroomer.map(r => (
              <div
                key={r.name}
                className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-amber-100"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-[12px] font-semibold text-gray-800 truncate">{r.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {r.count} session{r.count === 1 ? '' : 's'} · awaiting deposit
                  </p>
                </div>
                <p className="text-[13px] font-extrabold text-amber-700 tabular-nums shrink-0">
                  {fmtCurrency(r.total)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Charts side by side ──────────────────────────────── */}
      {/* Tappable — opens ChartsDrilldownModal with a holistic
          sessions + revenue breakdown (scope pills, KPI strips,
          taller trend charts, by-source rollup, by-status grid). */}
      <motion.button
        type="button"
        initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.16 }}
        onClick={() => setChartsDrilldownOpen(true)}
        className={`${card} p-4 w-full text-left transition-transform active:scale-[0.99] hover:shadow-md`}
        style={shadow}
        aria-label="Open Sessions and Revenue drilldown"
      >
        <div className="grid grid-cols-2 gap-4 divide-x divide-gray-100">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-sniffy-purple mb-3">Sessions / Month</p>
            <MiniBarChart data={monthlyData} color="#451a8b" />
          </div>
          <div className="pl-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-sniffy-yellow mb-3">Revenue (₹K)</p>
            <MiniBarChart data={revenueData} color="#f6ac0a" />
          </div>
        </div>
        {/* Affordance — tells the coordinator the card is tappable
            without taking visual weight from the bars themselves. */}
        <div className="flex items-center justify-end gap-1 mt-2.5 text-[9.5px] font-bold text-sniffy-purple/80">
          Tap for full breakdown <ChevronRight size={11}/>
        </div>
      </motion.button>

      {/* Holistic drilldown popup — sessions + revenue with scope pills */}
      <ChartsDrilldownModal
        open={chartsDrilldownOpen}
        sessions={sessions}
        customers={customers}
        onClose={() => setChartsDrilldownOpen(false)}
      />

      {/* ── Source + Groomer donuts ──────────────────────────── */}
      {/*
        Square tiles — keep them compact in the dashboard.  Each card
        shows only the top-3 breakdown to avoid the long overflowing
        list that used to fill the height.  Tapping a card opens
        <DonutModal/> with the full breakdown.
      */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          type="button"
          initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.19 }}
          onClick={() => sourceBreakdown.length > 0 && setExpandedDonut('source')}
          className={`${card} p-4 overflow-hidden aspect-square text-left
                      transition-transform active:scale-[0.98] hover:shadow-md`}
          style={shadow}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-sniffy-purple mb-3">By Source</p>
          {sourceBreakdown.length > 0
            ? <DonutChart slices={sourceBreakdown} />
            : <p className="text-xs text-gray-400">No data</p>}
        </motion.button>
        <motion.button
          type="button"
          initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.22 }}
          onClick={() => groomerBreakdown.length > 0 && setExpandedDonut('groomer')}
          className={`${card} p-4 overflow-hidden aspect-square text-left
                      transition-transform active:scale-[0.98] hover:shadow-md`}
          style={shadow}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-sniffy-purple mb-3">Groomers</p>
          {groomerBreakdown.length > 0
            ? <DonutChart slices={groomerBreakdown} />
            : <p className="text-xs text-gray-400">No data</p>}
        </motion.button>
      </div>

      {/* Expanded donut popup — opens on card tap.  Wedges + list rows
          are interactive: tapping any of them closes the modal and
          navigates to the Sessions tab with the matching filter
          pre-applied, so the coordinator can drill from a "70% Hemant"
          insight straight to that groomer's rows. */}
      <DonutModal
        open={expandedDonut === 'source'}
        title="By Source"
        slices={sourceBreakdown}
        onClose={() => setExpandedDonut(null)}
        clickHint="Tap a source to see its sessions"
        onSliceClick={(key) => onNavigate?.('sessions', { source: key })}
      />
      <DonutModal
        open={expandedDonut === 'groomer'}
        title="Groomers"
        slices={groomerBreakdown}
        onClose={() => setExpandedDonut(null)}
        clickHint="Tap a groomer to see their sessions"
        onSliceClick={(key) => onNavigate?.('sessions', { groomer: key })}
      />

      {/* ── Follow-ups due soon ──────────────────────────────── */}
      {followupSoon.length > 0 && (
        <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.25 }}
          className={`${card} overflow-hidden`} style={shadow}>
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">⏰ Follow-ups Due Soon</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Customers needing a callback</p>
            </div>
            <button onClick={() => onNavigate?.('followups')}
              className="text-[10px] text-sniffy-purple font-semibold flex items-center gap-0.5 hover:underline">
              View all <ChevronRight size={10}/>
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {followupSoon.map(s => {
              const days = daysUntil(s.next_due_date!);
              const ph = (s.phone ?? '').replace(/\D/g,'');
              const dial = ph.startsWith('91') ? ph : `91${ph}`;
              return (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-orange-50 flex flex-col items-center justify-center text-orange-600">
                    <Clock size={13}/>
                    <span className="text-[9px] font-bold mt-0.5">{days <= 0 ? 'Today' : `${days}d`}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{s.pet_parent_name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{s.breed ?? 'Unknown'} · Due {fmtDate(s.next_due_date!)}</p>
                  </div>
                  {s.phone && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a href={`tel:${s.phone}`}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-gray-700 bg-white border border-gray-200"
                        style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                        <Phone size={10}/> Call
                      </a>
                      <a href={`https://wa.me/${dial}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white"
                        style={{ background:'linear-gradient(135deg,#25D366 0%,#128C7E 100%)', boxShadow:'0 2px 6px rgba(37,211,102,0.30)' }}>
                        <MessageCircle size={10}/> WA
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Recent Sessions ──────────────────────────────────── */}
      <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.28 }}
        className={`${card} overflow-hidden`} style={shadow}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-sniffy-purple">📋 Recent Sessions</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Latest grooming activity</p>
          </div>
          <button onClick={() => onNavigate?.('sessions')}
            className="text-[10px] text-sniffy-purple font-semibold flex items-center gap-0.5 hover:underline">
            View all <ChevronRight size={10}/>
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {recentSessions.map(s => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xl shrink-0">{s.pet_type === 'dog' ? '🐶' : '🐱'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{s.pet_parent_name}</p>
                <p className="text-[10px] text-gray-400 truncate">{s.breed ?? 'Unknown'} · {fmtDate(s.session_date)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {s.groomer_name && (
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-sniffy-purple flex items-center justify-center text-[9px] font-extrabold">
                    {s.groomer_name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>
                  {STATUS_LABELS[s.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Pending Bookings ─────────────────────────────────── */}
      {pendingBookings.length > 0 && (
        <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.31 }}
          className={`${card} overflow-hidden`} style={shadow}>
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-sniffy-purple">🌐 Pending Bookings</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{pendingBookings.length} website bookings to convert</p>
            </div>
            <button onClick={() => onNavigate?.('bookings')}
              className="text-[10px] text-sniffy-purple font-semibold flex items-center gap-0.5 hover:underline">
              View all <ChevronRight size={10}/>
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingBookings.slice(0, 3).map(b => (
              <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl shrink-0">{b.pet_type === 'dog' ? '🐶' : '🐱'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{b.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{b.breed} · {b.city} · {b.package}</p>
                </div>
                {b.phone && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a href={`tel:${b.phone}`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-gray-700 bg-white border border-gray-200"
                      style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                      <Phone size={10}/> Call
                    </a>
                    <button onClick={() => setConvertBooking(b)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white"
                      style={{ background:'linear-gradient(135deg,#7c3aed 0%,#451a8b 100%)', boxShadow:'0 2px 6px rgba(69,26,139,0.30)' }}>
                      <ArrowRightCircle size={10}/> Convert
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Pet type split ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {(['dog', 'cat'] as const).map((pt, i) => {
          const ptS = sessions.filter(s => s.pet_type === pt);
          const ptR = ptS.filter(s => s.status === 'completed').reduce((s, x) => s + (x.booking_amount ?? 0), 0);
          return (
            <motion.div key={pt} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay: 0.34 + i * 0.03 }}
              className={`${card} p-4 flex items-center gap-3`} style={shadow}>
              <span className="text-2xl">{pt === 'dog' ? '🐶' : '🐱'}</span>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{pt}</p>
                <p className="text-2xl font-extrabold text-gray-900 leading-tight">{ptS.length}</p>
                <p className="text-[10px] text-gray-400">{fmtCurrency(ptR)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Convert Modal ────────────────────────────────────── */}
      <Suspense fallback={null}>
        {convertBooking && (
          <SessionFormModal
            open={!!convertBooking}
            onClose={() => setConvertBooking(null)}
            onSaved={handleConverted}
            prefill={bookingToPrefill(convertBooking)}
          />
        )}
      </Suspense>

    </div>
  );
}
