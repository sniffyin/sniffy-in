/**
 * AnalyticsTab.tsx
 *
 * A dedicated, self-contained analytics surface for the admin dashboard.
 * Pick filters (date range, groomer, status, pet type, source, payment
 * channel, free-text) → the KPIs, charts and detail table all recompute,
 * and "Download Excel" exports exactly what's on screen as a two-sheet
 * .xlsx (Summary + Sessions).
 *
 * All aggregation lives in analyticsLib (pure); charts in AnalyticsCharts.
 * This file is the composition + filter UI + KPI cards + detail table.
 *
 * Mobile-first: the filter panel collapses behind a toggle, KPI cards are
 * a 2-up grid, charts stack to one column, and the table scrolls
 * horizontally inside its own container so the page never does.
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  BarChart3, Download, SlidersHorizontal, X, Search, Loader2,
  CalendarDays, IndianRupee, Users, PawPrint, Maximize2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  type GroomingSession,
  STATUS_LABELS, STATUS_COLORS, SOURCE_LABELS, PAYMENT_COLLECTED_BY_LABELS, fmtDate, isExternalSource, paymentStatusOf,
} from './types';
import { useSessions } from './sessionsCache';
import { formatPhoneDisplay } from './customerTypes';
import {
  type AnalyticsFilters, type Slice,
  EMPTY_FILTERS, DATE_PRESET_LABELS,
  applyFilters, computeKpis, resolveRange,
  groupByGroomer, groupBySource, groupByPackage, groupByDayOfWeek,
  firstSessionDates, groupByCustomerType,
  groupByAddOn, groupByPaymentStatus, groupByRating,
  topCustomers, exportAnalyticsXlsx, fmtMoney,
} from './analytics/analyticsLib';
import { HBarChart } from './analytics/AnalyticsCharts';
import AnalyticsFiltersSheet from './analytics/AnalyticsFiltersSheet';

interface ActiveChip { key: string; label: string; onClear: () => void }

const MAX_TABLE_ROWS = 200;   // UI cap; the Excel export always has every row

// Short chip labels for the derived / bucketed filters (match the sheet).
const PAY_STATUS_CHIP: Record<string, string> = { paid: 'Paid', collected: 'Collected', unpaid: 'Unpaid' };
const RATING_CHIP: Record<string, string> = { '5': '5 ★', '4': '4 ★', low: '≤ 3 ★', unrated: 'Unrated' };

// ─── Small building blocks ───────────────────────────────────────────

function StatCard({
  label, value, sub, Icon, accent = 'text-sniffy-purple', tint = 'bg-sniffy-purple/10',
}: {
  label: string; value: string; sub?: string; Icon: React.ElementType; accent?: string; tint?: string;
}) {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white px-2.5 py-1.5 sm:p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-1.5">
        <span className={`w-4 h-4 sm:w-7 sm:h-7 rounded sm:rounded-lg flex items-center justify-center shrink-0 ${tint}`}>
          <Icon size={11} className={accent} aria-hidden />
        </span>
        <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wide text-gray-400 leading-tight truncate">{label}</span>
      </div>
      <div className="mt-0.5 sm:mt-1 text-base sm:text-2xl font-extrabold text-gray-900 tabular-nums leading-none">{value}</div>
      {sub && <div className="text-[9.5px] sm:text-[11px] text-gray-500 mt-0.5 leading-tight truncate">{sub}</div>}
    </div>
  );
}

// ─── Bar chart: compact preview card + full-size modal ───────────────

interface BarSpec { key: string; title: string; subtitle?: string; data: Slice[]; color?: string; money?: boolean; valueKey?: 'count' | 'revenue' }
const PREVIEW_ROWS = 3;

/** A small, tappable card showing only the top few bars.  Tap → modal. */
function MiniBarCard({ spec, onExpand }: { spec: BarSpec; onExpand: () => void }) {
  const preview = spec.data.slice(0, PREVIEW_ROWS);
  const more = spec.data.length - preview.length;
  return (
    <button
      type="button"
      onClick={onExpand}
      aria-label={`Expand ${spec.title}`}
      className="text-left w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-sniffy-purple/30 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-extrabold text-gray-900 leading-tight truncate">{spec.title}</h3>
          {spec.subtitle && <p className="text-[10px] text-gray-500 truncate">{spec.subtitle}</p>}
        </div>
        <span className="shrink-0 w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
          <Maximize2 size={12} />
        </span>
      </div>
      {preview.length === 0
        ? <div className="h-16 flex items-center justify-center text-[11px] text-gray-400">No data</div>
        : <HBarChart data={preview} color={spec.color} money={spec.money} valueKey={spec.valueKey} compact />}
      {more > 0 && <p className="text-[11px] font-bold text-sniffy-purple mt-1.5">+{more} more · tap to expand</p>}
    </button>
  );
}

/** Full-size chart in a centered modal — all rows, with the tooltip layer.
 *  Plain (no framer-motion): opacity animations proved unreliable in this
 *  runtime, and a visible popup matters more than an entrance flourish. */
function ChartModal({ spec, onClose }: { spec: BarSpec | null; onClose: () => void }) {
  useEffect(() => {
    if (!spec) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [spec, onClose]);

  if (typeof document === 'undefined' || !spec) return null;
  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog" aria-modal="true" aria-label={spec.title}
          className="pointer-events-auto w-full max-w-lg max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-extrabold text-gray-900 truncate">{spec.title}</h3>
              {spec.subtitle && <p className="text-[11px] text-gray-500 truncate">{spec.subtitle}</p>}
            </div>
            <button type="button" onClick={onClose} aria-label="Close"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500">
              <X size={18} />
            </button>
          </div>
          <div className="p-4 overflow-y-auto overscroll-contain">
            <HBarChart data={spec.data} color={spec.color} money={spec.money} valueKey={spec.valueKey} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Session detail modal (everything about one session) ─────────────

const SEC_TITLE: Record<string, string> = {
  purple: 'text-sniffy-purple', blue: 'text-blue-600', orange: 'text-orange-600',
  teal: 'text-teal-600', indigo: 'text-indigo-600', green: 'text-green-600',
  yellow: 'text-yellow-700', gray: 'text-gray-500',
};
const SEC_DOT: Record<string, string> = {
  purple: 'bg-sniffy-purple', blue: 'bg-blue-500', orange: 'bg-orange-500',
  teal: 'bg-teal-500', indigo: 'bg-indigo-500', green: 'bg-green-500',
  yellow: 'bg-yellow-500', gray: 'bg-gray-400',
};

function Sec({ title, tint, children }: { title: string; tint: keyof typeof SEC_TITLE; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 py-2 bg-gray-50/70 border-b border-gray-100">
        <span className={`w-2 h-2 rounded-full ${SEC_DOT[tint]}`} />
        <h4 className={`text-[11px] font-extrabold uppercase tracking-wide ${SEC_TITLE[tint]}`}>{title}</h4>
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children?: React.ReactNode }) {
  const empty = children == null || children === '' || children === '—';
  return (
    <div className="flex items-start gap-3 px-3.5 py-1.5 text-xs">
      <span className="text-gray-400 font-medium w-28 sm:w-32 shrink-0">{label}</span>
      <span className={`flex-1 min-w-0 break-words text-right font-semibold ${empty ? 'text-gray-300' : 'text-gray-800'}`}>
        {empty ? '—' : children}
      </span>
    </div>
  );
}

function YesNo({ v }: { v: boolean | null }) {
  if (v == null) return <span className="text-gray-300">—</span>;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${v ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {v ? 'Yes' : 'No'}
    </span>
  );
}

function SessionDetailModal({ session, onClose }: { session: GroomingSession | null; onClose: () => void }) {
  useEffect(() => {
    if (!session) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [session, onClose]);

  if (typeof document === 'undefined' || !session) return null;
  const s = session;
  const money = (v?: number | null) => fmtMoney(Number(v ?? 0));
  const d = (v?: string | null) => (v ? fmtDate(v) : '—');
  const ts = (v?: string | null) =>
    v ? new Date(v).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
  const srcLabel = (SOURCE_LABELS as Record<string, string>)[s.source] ?? s.source;
  const addOns = (s.add_ons ?? []).filter(Boolean);
  const payStatus = paymentStatusOf(s);
  const payTone = payStatus === 'paid' ? 'bg-green-100 text-green-700' : payStatus === 'collected' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
        <div role="dialog" aria-modal="true" aria-label="Session details"
          className="pointer-events-auto w-full max-w-lg max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-extrabold text-gray-900 truncate">
                {s.pet_parent_name || (s.phone ? formatPhoneDisplay(s.phone) : 'Session')}
              </h3>
              <p className="text-[11px] text-gray-500">
                {s.session_date ? fmtDate(s.session_date) : '—'}{s.scheduled_time ? ` · ${s.scheduled_time.slice(0, 5)}` : ''}
              </p>
            </div>
            <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_COLORS[s.status]}`}>{STATUS_LABELS[s.status]}</span>
            <button type="button" onClick={onClose} aria-label="Close"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500 shrink-0"><X size={18} /></button>
          </div>

          {/* Body */}
          <div className="p-3 sm:p-4 overflow-y-auto overscroll-contain space-y-3 bg-gray-50/50">
            <Sec title="Session" tint="purple">
              <Row label="Date">{d(s.session_date)}</Row>
              <Row label="Scheduled time">{s.scheduled_time ? s.scheduled_time.slice(0, 5) : '—'}</Row>
              <Row label="Source">{srcLabel} · {isExternalSource(s.source) ? 'Vendor' : 'Direct'}</Row>
              <Row label="Next due">{s.next_due_date ? `${d(s.next_due_date)}${s.next_due_days ? ` (${s.next_due_days}d)` : ''}` : '—'}</Row>
              <Row label="Converted lead"><YesNo v={s.is_converted} /></Row>
            </Sec>

            <Sec title="Customer" tint="blue">
              <Row label="Name">{s.pet_parent_name}</Row>
              <Row label="Phone">{s.phone ? formatPhoneDisplay(s.phone) : '—'}</Row>
              <Row label="Address">{s.address}</Row>
              <Row label="GPS">{s.gps_location ? <a href={s.gps_location} target="_blank" rel="noopener noreferrer" className="text-sniffy-purple underline">Open map</a> : '—'}</Row>
            </Sec>

            <Sec title="Pet" tint="orange">
              <Row label="Type"><span className="capitalize">{s.pet_type}</span></Row>
              <Row label="Breed">{s.breed}</Row>
              <Row label="Age">{s.pet_age}</Row>
              <Row label="Medical issues">{s.medical_issues}</Row>
            </Sec>

            <Sec title="Service" tint="teal">
              <Row label="Package">{s.package}</Row>
              <Row label="Add-ons">{addOns.length ? addOns.join(', ') : '—'}</Row>
              <Row label="Booking amount">{money(s.booking_amount)}</Row>
              <Row label="Platform commission">{money(s.platform_commission)}</Row>
              <Row label="Groomer commission">{money(s.groomer_commission)}</Row>
              <Row label="Net booking">{money(s.net_booking_amount)}</Row>
            </Sec>

            <Sec title="Groomer flow" tint="indigo">
              <Row label="Groomer">{s.groomer_name}</Row>
              <Row label="Groomer phone">{s.groomer_phone ? formatPhoneDisplay(s.groomer_phone) : '—'}</Row>
              <Row label="Arrived on time"><YesNo v={s.groomer_on_time} /></Row>
              <Row label="Arrival marked">{ts(s.arrival_marked_at)}</Row>
              <Row label="Completed at">{ts(s.groomer_marked_complete_at)}</Row>
              <Row label="Completion method">{s.completion_method ?? '—'}</Row>
            </Sec>

            <Sec title="Payment" tint="green">
              <Row label="Status"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${payTone}`}>{payStatus}</span></Row>
              <Row label="Mode"><span className="capitalize">{s.payment_mode ?? '—'}</span></Row>
              <Row label="Collected by">{PAYMENT_COLLECTED_BY_LABELS[s.payment_collected_by]}</Row>
              <Row label="Collected at">{ts(s.payment_collected_at)}</Row>
              <Row label="Total collected"><span className="text-gray-900 font-extrabold">{money(s.total_collected)}</span></Row>
              <Row label="Upsell">{money(s.upsell_amount)}</Row>
              <Row label="Tip">{money(s.tip_amount)}</Row>
              <Row label="Verified"><YesNo v={s.payment_verified} /></Row>
              <Row label="Verified by">{s.payment_verified_by}</Row>
              <Row label="Verified at">{ts(s.payment_verified_at)}</Row>
            </Sec>

            <Sec title="Review" tint="yellow">
              <Row label="Review taken"><YesNo v={s.review_taken} /></Row>
              <Row label="Client rating">{s.client_rating != null ? `★ ${s.client_rating}` : '—'}</Row>
              <Row label="Client review">{s.client_review}</Row>
            </Sec>

            {(s.notes || s.groomer_observation) && (
              <Sec title="Notes" tint="gray">
                <Row label="Notes">{s.notes}</Row>
                <Row label="Groomer note">{s.groomer_observation}</Row>
              </Sec>
            )}

            <Sec title="Meta" tint="gray">
              <Row label="Created">{ts(s.created_at)}</Row>
              <Row label="Updated">{ts(s.updated_at)}</Row>
              <Row label="Session ID"><span className="text-[10px] text-gray-500 font-mono">{s.id}</span></Row>
            </Sec>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Main tab ────────────────────────────────────────────────────────

export default function AnalyticsTab() {
  // (sessions now come from the shared snapshot — see useSessions() below)
  const [groomers, setGroomers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading]   = useState(true);
  // Local error slot for the groomers lookup; session-load failures come
  // through `sessionsError` from the shared snapshot hook.
  const [error]                 = useState<string | null>(null);
  const [filters, setFilters]   = useState<AnalyticsFilters>(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<'charts' | 'sessions'>('charts');

  // Sessions come from the shared dashboard snapshot (sessionsCache.ts),
  // already ordered newest-first — the same ordering this tab used to
  // request itself.  Only the tiny groomers lookup is fetched locally.
  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
  } = useSessions();

  // Mount only needs the groomers lookup — the session rows are served
  // from cache (and revalidated by the hook when stale).
  useEffect(() => {
    supabase.from('groomers').select('id, name').order('name')
      .then(({ data }) => {
        setGroomers((data ?? []) as { id: string; name: string }[]);
        setLoading(false);
      });
  }, []);

  const groomerNameById = useMemo(
    () => Object.fromEntries(groomers.map(g => [g.id, g.name])),
    [groomers],
  );

  const rows = useMemo(() => applyFilters(sessions, filters), [sessions, filters]);
  const kpis = useMemo(() => computeKpis(rows), [rows]);

  // Acquisition dates come from the FULL dataset (not the filtered rows) so
  // "new vs returning" stays correct regardless of the active date filter.
  const firstDates  = useMemo(() => firstSessionDates(sessions), [sessions]);
  const byGroomer   = useMemo(() => groupByGroomer(rows), [rows]);
  const bySource    = useMemo(() => groupBySource(rows), [rows]);
  const byCustType  = useMemo(() => groupByCustomerType(rows, firstDates), [rows, firstDates]);
  const byPackage   = useMemo(() => groupByPackage(rows), [rows]);
  const byDayOfWeek = useMemo(() => groupByDayOfWeek(rows), [rows]);
  const topCusts    = useMemo(() => topCustomers(rows, 15), [rows]);
  const revByGroomer = useMemo(() => [...byGroomer].sort((a, b) => b.revenue - a.revenue).filter(s => s.revenue > 0), [byGroomer]);
  const byAddOn     = useMemo(() => groupByAddOn(rows), [rows]);
  const byPayStatus = useMemo(() => groupByPaymentStatus(rows), [rows]);
  const byRating    = useMemo(() => groupByRating(rows), [rows]);

  const barSpecs = useMemo<BarSpec[]>(() => [
    { key: 'custtype',   title: 'New vs returning', subtitle: 'First-time vs repeat visits', data: byCustType },
    { key: 'groomer',    title: 'Sessions by groomer', data: byGroomer },
    { key: 'revgroomer', title: 'Revenue by groomer', subtitle: 'Collected per groomer', data: revByGroomer, valueKey: 'revenue', money: true, color: '#4a3aa7' },
    { key: 'top',        title: 'Top customers', subtitle: 'Most sessions with us', data: topCusts, color: '#1baf7a' },
    { key: 'paystatus',  title: 'Payment status', subtitle: 'Chase what is uncollected', data: byPayStatus },
    { key: 'rating',     title: 'Customer ratings', subtitle: 'Service-quality signal', data: byRating },
    { key: 'addon',      title: 'Add-on attach', subtitle: 'Upsell popularity', data: byAddOn, color: '#1baf7a' },
    { key: 'package',    title: 'Sessions by package', data: byPackage, color: '#4a3aa7' },
    { key: 'source',     title: 'Sessions by source', data: bySource, color: '#eb6834' },
    { key: 'dow',        title: 'Busiest days', subtitle: 'Sessions by weekday', data: byDayOfWeek, color: '#eda100' },
  ], [byCustType, byGroomer, revByGroomer, topCusts, byPayStatus, byRating, byAddOn, byPackage, bySource, byDayOfWeek]);
  const [openChart, setOpenChart] = useState<BarSpec | null>(null);
  const [openSession, setOpenSession] = useState<GroomingSession | null>(null);

  // ── Active-filter chips (removable, shown under the trigger bar) ──
  const sheetCount =
    (filters.preset !== 'all' ? 1 : 0) + filters.groomerIds.length + filters.statuses.length +
    filters.petTypes.length + filters.sources.length + filters.channels.length + filters.collectedBy.length +
    filters.paymentModes.length + filters.paymentStatuses.length + filters.packages.length +
    filters.addOns.length + filters.ratings.length + filters.reviewTaken.length + filters.customerTypes.length;

  const chips = useMemo<ActiveChip[]>(() => {
    const out: ActiveChip[] = [];
    const drop = (patch: Partial<AnalyticsFilters>) => setFilters(p => ({ ...p, ...patch }));
    if (filters.preset !== 'all') {
      const r = resolveRange(filters);
      const label = filters.preset === 'custom' ? `${r.from ?? '…'} → ${r.to ?? '…'}` : DATE_PRESET_LABELS[filters.preset];
      out.push({ key: 'date', label, onClear: () => drop({ preset: 'all', from: null, to: null }) });
    }
    filters.groomerIds.forEach(id => out.push({ key: `g:${id}`, label: groomerNameById[id] ?? 'Groomer',
      onClear: () => drop({ groomerIds: filters.groomerIds.filter(x => x !== id) }) }));
    filters.statuses.forEach(s => out.push({ key: `s:${s}`, label: STATUS_LABELS[s],
      onClear: () => drop({ statuses: filters.statuses.filter(x => x !== s) }) }));
    filters.petTypes.forEach(p => out.push({ key: `p:${p}`, label: p === 'dog' ? '🐶 Dogs' : '🐱 Cats',
      onClear: () => drop({ petTypes: filters.petTypes.filter(x => x !== p) }) }));
    filters.collectedBy.forEach(c => out.push({ key: `c:${c}`, label: PAYMENT_COLLECTED_BY_LABELS[c],
      onClear: () => drop({ collectedBy: filters.collectedBy.filter(x => x !== c) }) }));
    filters.paymentModes.forEach(m => out.push({ key: `m:${m}`, label: m === 'cash' ? '💵 Cash' : '💳 Online',
      onClear: () => drop({ paymentModes: filters.paymentModes.filter(x => x !== m) }) }));
    filters.sources.forEach(s => out.push({ key: `src:${s}`, label: (SOURCE_LABELS as Record<string, string>)[s] ?? s,
      onClear: () => drop({ sources: filters.sources.filter(x => x !== s) }) }));
    filters.channels.forEach(c => out.push({ key: `ch:${c}`, label: c === 'vendor' ? 'Vendor' : 'Direct',
      onClear: () => drop({ channels: filters.channels.filter(x => x !== c) }) }));
    filters.paymentStatuses.forEach(ps => out.push({ key: `ps:${ps}`, label: PAY_STATUS_CHIP[ps],
      onClear: () => drop({ paymentStatuses: filters.paymentStatuses.filter(x => x !== ps) }) }));
    filters.packages.forEach(pk => out.push({ key: `pkg:${pk}`, label: pk,
      onClear: () => drop({ packages: filters.packages.filter(x => x !== pk) }) }));
    filters.addOns.forEach(a => out.push({ key: `ao:${a}`, label: a,
      onClear: () => drop({ addOns: filters.addOns.filter(x => x !== a) }) }));
    filters.ratings.forEach(r => out.push({ key: `r:${r}`, label: RATING_CHIP[r],
      onClear: () => drop({ ratings: filters.ratings.filter(x => x !== r) }) }));
    filters.reviewTaken.forEach(rv => out.push({ key: `rv:${rv}`, label: rv === 'yes' ? 'Review taken' : 'No review',
      onClear: () => drop({ reviewTaken: filters.reviewTaken.filter(x => x !== rv) }) }));
    filters.customerTypes.forEach(ct => out.push({ key: `ct:${ct}`, label: ct === 'new' ? 'New' : 'Returning',
      onClear: () => drop({ customerTypes: filters.customerTypes.filter(x => x !== ct) }) }));
    return out;
  }, [filters, groomerNameById]);

  const countFor = useCallback((f: AnalyticsFilters) => applyFilters(sessions, f).length, [sessions]);

  // exportAnalyticsXlsx is async now (the `xlsx` lib is code-split and
  // fetched on first use).  Fire-and-forget keeps the button handler
  // synchronous; a failed chunk load surfaces in the console rather than
  // as an unhandled rejection.
  function handleExport() {
    if (rows.length === 0) return;
    void exportAnalyticsXlsx(rows, filters, groomerNameById)
      .catch(err => console.error('Analytics export failed', err));
  }

  // ── Render ──
  return (
    <div className="space-y-3 sm:space-y-5 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-sniffy-purple/10 flex items-center justify-center shrink-0">
          <BarChart3 size={18} className="text-sniffy-purple" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">Analytics</h2>
          <p className="text-[11px] text-gray-500 truncate">Filter, spot trends, export to Excel.</p>
        </div>
      </div>

      {/* Filter trigger bar — search stays live; everything else lives in the sheet */}
      <div className="flex items-center gap-2 sticky top-0 z-20 bg-white/95 backdrop-blur-sm py-1 -my-1">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={filters.search}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            placeholder="Search customer, phone, groomer…"
            className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-sniffy-purple focus:ring-1 focus:ring-sniffy-purple/20"
          />
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl text-xs font-bold border transition ${
            sheetCount > 0
              ? 'bg-sniffy-purple text-white border-sniffy-purple shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-sniffy-purple'
          }`}
        >
          <SlidersHorizontal size={14} /> Filters
          {sheetCount > 0 && (
            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-sniffy-yellow text-gray-900 text-[10px] font-extrabold leading-none">{sheetCount}</span>
          )}
        </button>
      </div>

      {/* Active-filter chips */}
      {chips.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {chips.map(c => (
            <button
              key={c.key}
              type="button"
              onClick={c.onClear}
              className="inline-flex items-center gap-1 h-7 pl-2.5 pr-2 rounded-full bg-sniffy-purple/10 text-sniffy-purple text-[11px] font-bold hover:bg-sniffy-purple/20 transition"
            >
              {c.label} <X size={11} />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFilters(f => ({ ...EMPTY_FILTERS, search: f.search }))}
            className="text-[11px] font-bold text-gray-400 hover:text-red-500 px-1.5 h-7"
          >
            Clear all
          </button>
        </div>
      )}

      <AnalyticsFiltersSheet
        open={sheetOpen}
        value={filters}
        groomers={groomers}
        onApply={setFilters}
        onClose={() => setSheetOpen(false)}
        countFor={countFor}
      />

      <ChartModal spec={openChart} onClose={() => setOpenChart(null)} />
      <SessionDetailModal session={openSession} onClose={() => setOpenSession(null)} />

      {/* Body */}
      {(loading || sessionsLoading) ? (
        <div className="py-24 flex items-center justify-center text-gray-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading analytics…
        </div>
      ) : (error ?? sessionsError) ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
          Couldn’t load sessions: {error ?? sessionsError}
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* The unsettled count is inserted only when non-zero: on a
                selection with none, a permanent "0 unsettled" would take
                space in a sub-label that has room for about three facts.
                It has to appear at all, though — without it, groomed-but-
                unpaid sessions are in `total` and in no other figure on
                the card, so the numbers look like they don't add up. */}
            <StatCard label="Total sessions" value={String(kpis.total)} Icon={CalendarDays}
              tint="bg-sniffy-purple/10"
              sub={[
                `${kpis.completed} done`,
                kpis.groomingDone > 0 ? `${kpis.groomingDone} unsettled` : null,
                `${kpis.cancelled} cancelled`,
              ].filter(Boolean).join(' · ')} />
            <StatCard label="Revenue" value={fmtMoney(kpis.revenue)} Icon={IndianRupee}
              accent="text-sniffy-purple" tint="bg-sniffy-purple/10" sub={`Avg ticket ${fmtMoney(kpis.avgTicket)}`} />
            <StatCard label="Customers" value={String(kpis.uniqueCustomers)} Icon={Users}
              accent="text-blue-600" tint="bg-blue-50" sub="unique in selection" />
            <StatCard label="Dogs vs Cats" value={`${kpis.dogs} / ${kpis.cats}`} Icon={PawPrint}
              accent="text-orange-500" tint="bg-orange-50" sub="dog / cat sessions" />
          </div>

          {/* View switcher — Charts vs Sessions */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 w-full sm:w-auto sm:inline-flex" role="tablist" aria-label="Analytics view">
            {([
              { id: 'charts',   label: 'Charts' },
              { id: 'sessions', label: `Sessions (${rows.length})` },
            ] as const).map(t => {
              const on = view === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setView(t.id)}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    on ? 'bg-white text-sniffy-purple shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {view === 'charts' ? (
            /* Charts — compact preview cards; tap to open the full chart */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {barSpecs.map(spec => (
                <MiniBarCard key={spec.key} spec={spec} onExpand={() => setOpenChart(spec)} />
              ))}
            </div>
          ) : (
          /* Detail table */
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900">
                Sessions <span className="text-gray-400 font-bold">({rows.length})</span>
              </h3>
              <button type="button" onClick={handleExport} disabled={rows.length === 0}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sniffy-purple disabled:opacity-40">
                <Download size={13} /> Download
              </button>
            </header>

            {rows.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">No sessions match these filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                      <th className="px-3 py-2 font-bold whitespace-nowrap sticky left-0 bg-white z-10">Date / Time</th>
                      <th className="px-3 py-2 font-bold whitespace-nowrap">Customer</th>
                      <th className="px-3 py-2 font-bold whitespace-nowrap">Phone</th>
                      <th className="px-3 py-2 font-bold whitespace-nowrap">Pet</th>
                      <th className="px-3 py-2 font-bold whitespace-nowrap">Source</th>
                      <th className="px-3 py-2 font-bold whitespace-nowrap">Groomer</th>
                      <th className="px-3 py-2 font-bold whitespace-nowrap">Package</th>
                      <th className="px-3 py-2 font-bold whitespace-nowrap">Status</th>
                      <th className="px-3 py-2 font-bold whitespace-nowrap">Payment</th>
                      <th className="px-3 py-2 font-bold whitespace-nowrap">Collected by</th>
                      <th className="px-3 py-2 font-bold whitespace-nowrap text-right">Amount</th>
                      <th className="px-3 py-2 font-bold whitespace-nowrap text-right">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, MAX_TABLE_ROWS).map(s => {
                      const addOns = (s.add_ons ?? []).filter(Boolean);
                      const tip = Number(s.tip_amount ?? 0);
                      return (
                      <tr key={s.id} onClick={() => setOpenSession(s)}
                        className="border-b border-gray-50 hover:bg-sniffy-purple/5 align-top cursor-pointer">
                        <td className="px-3 py-2 whitespace-nowrap text-gray-500 sticky left-0 bg-white tabular-nums">
                          {s.session_date ? fmtDate(s.session_date) : '—'}
                          {s.scheduled_time && <div className="text-[10px] text-gray-400">{s.scheduled_time.slice(0, 5)}</div>}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap font-semibold text-gray-800 max-w-[150px] truncate">{s.pet_parent_name || '—'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 tabular-nums">{s.phone ? formatPhoneDisplay(s.phone) : <span className="text-gray-300">—</span>}</td>
                        <td className="px-3 py-2 whitespace-nowrap capitalize text-gray-600">
                          {s.pet_type}{s.breed ? ` · ${s.breed}` : ''}
                          {s.pet_age && <div className="text-[10px] text-gray-400 normal-case">{s.pet_age}</div>}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                          {(SOURCE_LABELS as Record<string, string>)[s.source] ?? s.source}
                          <div className={`text-[10px] font-semibold ${isExternalSource(s.source) ? 'text-orange-500' : 'text-green-600'}`}>
                            {isExternalSource(s.source) ? 'Vendor' : 'Direct'}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-600">{s.groomer_name || <span className="text-gray-300">—</span>}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 max-w-[170px] truncate">
                          {s.package || <span className="text-gray-300">—</span>}
                          {addOns.length > 0 && <div className="text-[10px] text-gray-400 truncate">+ {addOns.join(', ')}</div>}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[s.status]}`}>{STATUS_LABELS[s.status]}</span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap capitalize text-gray-600">
                          {s.payment_mode ?? <span className="text-gray-300">—</span>}
                          {s.payment_verified && <div className="text-[10px] font-semibold text-green-600">Verified</div>}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-600">{PAYMENT_COLLECTED_BY_LABELS[s.payment_collected_by]}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-right font-semibold text-gray-800 tabular-nums">
                          {fmtMoney(Number(s.total_collected ?? 0))}
                          {tip > 0 && <div className="text-[10px] font-medium text-teal-600">tip {fmtMoney(tip)}</div>}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right tabular-nums text-gray-600">{s.client_rating != null ? `★ ${s.client_rating}` : '—'}</td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
                {rows.length > MAX_TABLE_ROWS && (
                  <div className="px-4 py-3 text-[11px] text-gray-400 border-t border-gray-100">
                    Showing first {MAX_TABLE_ROWS} of {rows.length}. Download Excel for the full list.
                  </div>
                )}
              </div>
            )}
          </section>
          )}
        </>
      )}
    </div>
  );
}
