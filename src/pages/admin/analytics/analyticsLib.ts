/**
 * analyticsLib.ts
 *
 * Pure, framework-free logic for the Analytics tab:
 *   • Filter model + `applyFilters` (all client-side — the whole
 *     grooming_sessions set is small enough to slice in the browser,
 *     matching how SessionsTab already loads everything).
 *   • Date-preset → concrete [from, to] range resolution.
 *   • KPI + group-by aggregations (the numbers behind the cards, charts
 *     and the Excel sheets).
 *   • Excel (.xlsx) export via SheetJS — a single Sessions sheet with the
 *     full filtered session detail.
 *
 * Everything here is deterministic given (sessions, filters); the React
 * layer just renders it.  Kept separate so the aggregations are testable
 * and the tab component stays about presentation.
 */

// `xlsx` is ~400 kB and is only touched when the coordinator hits "Export".
// Importing it statically dragged the whole library into the AnalyticsTab
// chunk, so every visit to the tab paid for a feature most visits never use.
// It's now pulled in on demand inside exportAnalyticsXlsx() below.
import type {
  GroomingSession,
  SessionStatus,
  BookingSource,
  PaymentMode,
  PaymentCollectedBy,
  PaymentStatus,
} from '../types';
import {
  STATUS_LABELS,
  SOURCE_LABELS,
  PAYMENT_COLLECTED_BY_LABELS,
  isExternalSource,
  paymentStatusOf,
} from '../types';
import { fmtMoney } from '../payrollApi';

// ─── Palette (validated categorical set, light surface) ──────────────
// From the data-viz reference palette — worst adjacent CVD ΔE 24.2, well
// clear of the ≥12 target.  Colour follows the *entity*, assigned in this
// fixed order and never cycled.
export const CAT_COLORS = [
  '#2a78d6', // blue
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#008300', // green
  '#4a3aa7', // violet (≈ Sniffy purple)
  '#e34948', // red
  '#e87ba4', // magenta
  '#eb6834', // orange
];

// Status colours are reserved (never reused as a "series"): completed reads
// as good, cancelled as critical, the in-flight states as neutral hues.
export const STATUS_COLORS_HEX: Record<SessionStatus, string> = {
  completed:        '#0ca30c', // good
  cancelled:        '#d03b3b', // critical
  grooming_done:    '#e07b18', // orange — done, money still outstanding
  scheduled:        '#2a78d6', // blue
  groomer_assigned: '#4a3aa7', // violet
  lead:             '#eda100', // yellow
};

export const BRAND_PURPLE = '#451a8b';
export const BRAND_YELLOW = '#f6ac0a';

// ─── Filter model ────────────────────────────────────────────────────

export type DatePreset =
  | 'all'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'custom';

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  all:          'All time',
  this_month:   'This month',
  last_month:   'Last month',
  this_quarter: 'This quarter',
  last_quarter: 'Last quarter',
  this_year:    'This year',
  custom:       'Custom range',
};

/** Direct = Sniffy-sourced; Vendor = partner-platform lead (derived from `source`). */
export type Channel = 'direct' | 'vendor';
/** Rating buckets, mirroring the ratings chart. */
export type RatingBucket = '5' | '4' | 'low' | 'unrated';
export type YesNo = 'yes' | 'no';
export type CustomerType = 'new' | 'returning';

export interface AnalyticsFilters {
  preset:      DatePreset;
  from:        string | null;          // 'YYYY-MM-DD' (inclusive)
  to:          string | null;          // 'YYYY-MM-DD' (inclusive)
  groomerIds:  string[];               // [] = all groomers
  statuses:    SessionStatus[];        // [] = all statuses
  petTypes:    ('dog' | 'cat')[];      // [] = both
  sources:     BookingSource[];        // [] = all sources
  channels:    Channel[];              // [] = all — Direct vs Vendor (derived from source)
  collectedBy: PaymentCollectedBy[];   // [] = all
  paymentModes: PaymentMode[];         // [] = all
  paymentStatuses: PaymentStatus[];    // [] = all — unpaid / collected / paid
  packages:    string[];               // [] = all — grooming package label
  addOns:      string[];               // [] = all — session has ANY of these add-ons
  ratings:     RatingBucket[];         // [] = all — 5 / 4 / ≤3 / unrated
  reviewTaken: YesNo[];                // [] = all — review captured yes/no
  customerTypes: CustomerType[];       // [] = all — first visit vs repeat
  search:      string;                 // customer name / phone contains
}

export const EMPTY_FILTERS: AnalyticsFilters = {
  preset:      'all',
  from:        null,
  to:          null,
  groomerIds:  [],
  statuses:    [],
  petTypes:    [],
  sources:     [],
  channels:    [],
  collectedBy: [],
  paymentModes: [],
  paymentStatuses: [],
  packages:    [],
  addOns:      [],
  ratings:     [],
  reviewTaken: [],
  customerTypes: [],
  search:      '',
};

/** True when any narrowing filter is active (drives the "Clear" affordance). */
export function hasActiveFilters(f: AnalyticsFilters): boolean {
  return (
    f.preset !== 'all' ||
    f.groomerIds.length > 0 ||
    f.statuses.length > 0 ||
    f.petTypes.length > 0 ||
    f.sources.length > 0 ||
    f.channels.length > 0 ||
    f.collectedBy.length > 0 ||
    f.paymentModes.length > 0 ||
    f.paymentStatuses.length > 0 ||
    f.packages.length > 0 ||
    f.addOns.length > 0 ||
    f.ratings.length > 0 ||
    f.reviewTaken.length > 0 ||
    f.customerTypes.length > 0 ||
    f.search.trim() !== ''
  );
}

/** Rating → bucket, shared by the rating filter and the ratings chart. */
export function ratingBucketOf(s: GroomingSession): RatingBucket {
  const r = s.client_rating;
  if (r == null) return 'unrated';
  if (r >= 5) return '5';
  if (r === 4) return '4';
  return 'low';
}

// ─── Date helpers ────────────────────────────────────────────────────

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Resolve a preset to a concrete inclusive [from, to] pair.  `custom`
 *  passes the caller's own from/to straight through; `all` is unbounded. */
export function resolveRange(f: AnalyticsFilters, now = new Date()): { from: string | null; to: string | null } {
  const y = now.getFullYear();
  const m = now.getMonth();          // 0-11
  const q = Math.floor(m / 3);       // 0-3
  const startOfMonth = (yy: number, mm: number) => new Date(yy, mm, 1);
  const endOfMonth   = (yy: number, mm: number) => new Date(yy, mm + 1, 0);

  switch (f.preset) {
    case 'all':
      return { from: null, to: null };
    case 'custom':
      return { from: f.from, to: f.to };
    case 'this_month':
      return { from: toISODate(startOfMonth(y, m)), to: toISODate(endOfMonth(y, m)) };
    case 'last_month':
      return { from: toISODate(startOfMonth(y, m - 1)), to: toISODate(endOfMonth(y, m - 1)) };
    case 'this_quarter':
      return { from: toISODate(startOfMonth(y, q * 3)), to: toISODate(endOfMonth(y, q * 3 + 2)) };
    case 'last_quarter': {
      const lqStartMonth = q * 3 - 3;   // may go negative → previous year, Date normalises it
      return { from: toISODate(startOfMonth(y, lqStartMonth)), to: toISODate(endOfMonth(y, lqStartMonth + 2)) };
    }
    case 'this_year':
      return { from: `${y}-01-01`, to: `${y}-12-31` };
  }
}

// ─── Filtering ───────────────────────────────────────────────────────

export function applyFilters(sessions: GroomingSession[], f: AnalyticsFilters, now = new Date()): GroomingSession[] {
  const { from, to } = resolveRange(f, now);
  const q = f.search.trim().toLowerCase();
  // Acquisition dates (for new-vs-returning) are computed over the WHOLE
  // dataset passed in, and only when that filter is active.
  const firstDates = f.customerTypes.length ? firstSessionDates(sessions) : null;

  return sessions.filter(s => {
    if (from && (!s.session_date || s.session_date < from)) return false;
    if (to   && (!s.session_date || s.session_date > to))   return false;
    if (f.groomerIds.length   && !(s.groomer_id && f.groomerIds.includes(s.groomer_id))) return false;
    if (f.statuses.length     && !f.statuses.includes(s.status)) return false;
    if (f.petTypes.length     && !f.petTypes.includes(s.pet_type)) return false;
    if (f.sources.length      && !f.sources.includes(s.source)) return false;
    if (f.channels.length     && !f.channels.includes(isExternalSource(s.source) ? 'vendor' : 'direct')) return false;
    if (f.collectedBy.length  && !f.collectedBy.includes(s.payment_collected_by)) return false;
    if (f.paymentModes.length && !(s.payment_mode && f.paymentModes.includes(s.payment_mode))) return false;
    if (f.paymentStatuses.length && !f.paymentStatuses.includes(paymentStatusOf(s))) return false;
    if (f.packages.length     && !(s.package && f.packages.includes(s.package))) return false;
    if (f.addOns.length       && !(s.add_ons ?? []).some(a => f.addOns.includes(a))) return false;
    if (f.ratings.length      && !f.ratings.includes(ratingBucketOf(s))) return false;
    if (f.reviewTaken.length  && !f.reviewTaken.includes(s.review_taken ? 'yes' : 'no')) return false;
    if (f.customerTypes.length && firstDates) {
      const key = customerKey(s);
      const first = key ? firstDates.get(key) : undefined;
      const isNew = !!(first && s.session_date && s.session_date <= first);
      if (!f.customerTypes.includes(isNew ? 'new' : 'returning')) return false;
    }
    if (q) {
      const hay = `${s.pet_parent_name ?? ''} ${s.phone ?? ''} ${s.groomer_name ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// ─── KPI aggregation ─────────────────────────────────────────────────

export interface Kpis {
  total:            number;
  completed:        number;
  cancelled:        number;
  /** Groomed, money not settled.  Counted on its own rather than folded
   *  into `scheduled`: the work happened, so calling it in-flight would
   *  repeat the mistake the status was added to fix. */
  groomingDone:     number;
  scheduled:        number;         // lead + scheduled + groomer_assigned (in-flight)
  /** Work that happened / work that was decided.  grooming_done counts
   *  as delivered here — whether the invoice cleared says nothing about
   *  whether the groomer turned up. */
  completionRate:   number;         // (completed + groomingDone) / (that + cancelled)
  revenue:          number;         // Σ total_collected
  cashAmount:       number;         // Σ total_collected where cash / groomer-cash
  cashCount:        number;         // # sessions paid in cash
  onlineCount:      number;
  tips:             number;
  uniqueCustomers:  number;
  avgTicket:        number;         // revenue / paid sessions
  avgRating:        number | null;
  ratedCount:       number;
  dogs:             number;
  cats:             number;
}

function isCash(s: GroomingSession): boolean {
  return s.payment_mode === 'cash' || s.payment_collected_by === 'groomer_cash';
}

export function computeKpis(rows: GroomingSession[]): Kpis {
  let completed = 0, cancelled = 0, groomingDone = 0, scheduled = 0;
  let revenue = 0, cashAmount = 0, cashCount = 0, onlineCount = 0, tips = 0;
  let paidCount = 0, ratingSum = 0, ratedCount = 0, dogs = 0, cats = 0;
  const custs = new Set<string>();

  for (const s of rows) {
    // The grooming_done arm must sit above the catch-all: `else
    // scheduled++` would otherwise sweep finished work into the
    // in-flight bucket, which is exactly the miscount this status
    // exists to prevent.
    if (s.status === 'completed') completed++;
    else if (s.status === 'cancelled') cancelled++;
    else if (s.status === 'grooming_done') groomingDone++;
    else scheduled++;

    const collected = Number(s.total_collected ?? 0);
    const isPaid = s.payment_collected_at != null || s.status === 'completed';
    if (isPaid && collected > 0) { revenue += collected; paidCount++; }
    if (isCash(s)) { cashCount++; if (isPaid) cashAmount += collected; }
    if (s.payment_mode === 'online') onlineCount++;
    tips += Number(s.tip_amount ?? 0);

    if (s.client_rating != null) { ratingSum += s.client_rating; ratedCount++; }
    if (s.pet_type === 'dog') dogs++; else if (s.pet_type === 'cat') cats++;

    const key = s.customer_id ?? s.phone ?? s.pet_parent_name;
    if (key) custs.add(key);
  }

  const delivered = completed + groomingDone;
  const decided   = delivered + cancelled;
  return {
    total: rows.length,
    completed, cancelled, groomingDone, scheduled,
    completionRate: decided ? delivered / decided : 0,
    revenue,
    cashAmount, cashCount, onlineCount,
    tips,
    uniqueCustomers: custs.size,
    avgTicket: paidCount ? revenue / paidCount : 0,
    avgRating: ratedCount ? ratingSum / ratedCount : null,
    ratedCount,
    dogs, cats,
  };
}

// ─── Group-by helpers ────────────────────────────────────────────────

export interface Slice { key: string; label: string; count: number; revenue: number; color?: string }

function paidAmount(s: GroomingSession): number {
  const isPaid = s.payment_collected_at != null || s.status === 'completed';
  return isPaid ? Number(s.total_collected ?? 0) : 0;
}

export function groupByGroomer(rows: GroomingSession[]): Slice[] {
  const m = new Map<string, Slice>();
  for (const s of rows) {
    const label = s.groomer_name || 'Unassigned';
    const key = s.groomer_id || `name:${label}`;
    const cur = m.get(key) ?? { key, label, count: 0, revenue: 0 };
    cur.count++; cur.revenue += paidAmount(s);
    m.set(key, cur);
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}

export function groupByStatus(rows: GroomingSession[]): Slice[] {
  const order: SessionStatus[] = ['completed', 'grooming_done', 'scheduled', 'groomer_assigned', 'lead', 'cancelled'];
  const m = new Map<SessionStatus, number>();
  for (const s of rows) m.set(s.status, (m.get(s.status) ?? 0) + 1);
  return order
    .filter(st => m.has(st))
    .map(st => ({ key: st, label: STATUS_LABELS[st], count: m.get(st)!, revenue: 0, color: STATUS_COLORS_HEX[st] }));
}

export function groupByPetType(rows: GroomingSession[]): Slice[] {
  let dogs = 0, cats = 0;
  for (const s of rows) { if (s.pet_type === 'dog') dogs++; else if (s.pet_type === 'cat') cats++; }
  return [
    { key: 'dog', label: 'Dogs', count: dogs, revenue: 0, color: CAT_COLORS[0] },
    { key: 'cat', label: 'Cats', count: cats, revenue: 0, color: CAT_COLORS[6] },
  ].filter(s => s.count > 0);
}

export function groupBySource(rows: GroomingSession[]): Slice[] {
  const m = new Map<string, Slice>();
  for (const s of rows) {
    const key = s.source;
    const label = (SOURCE_LABELS as Record<string, string>)[key] ?? key;
    const cur = m.get(key) ?? { key, label, count: 0, revenue: 0 };
    cur.count++; cur.revenue += paidAmount(s);
    m.set(key, cur);
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}

export function groupByCollectedBy(rows: GroomingSession[]): Slice[] {
  const order: PaymentCollectedBy[] = ['sniffy', 'groomer_cash', 'vendor'];
  const m = new Map<PaymentCollectedBy, Slice>();
  for (const s of rows) {
    const key = s.payment_collected_by;
    const cur = m.get(key) ?? { key, label: PAYMENT_COLLECTED_BY_LABELS[key], count: 0, revenue: 0 };
    cur.count++; cur.revenue += paidAmount(s);
    m.set(key, cur);
  }
  return order.filter(k => m.has(k)).map((k, i) => ({ ...m.get(k)!, color: CAT_COLORS[[4, 2, 5][i] ?? i] }));
}

export function topCustomers(rows: GroomingSession[], limit = 10): Slice[] {
  const m = new Map<string, Slice>();
  for (const s of rows) {
    const key = s.customer_id ?? s.phone ?? s.pet_parent_name;
    if (!key) continue;
    const label = s.pet_parent_name || s.phone || 'Unknown';
    const cur = m.get(key) ?? { key, label, count: 0, revenue: 0 };
    cur.count++; cur.revenue += paidAmount(s);
    m.set(key, cur);
  }
  return [...m.values()].sort((a, b) => b.count - a.count || b.revenue - a.revenue).slice(0, limit);
}

// ─── customerKey helper (shared identity for a session's customer) ────
function customerKey(s: GroomingSession): string | null {
  return s.customer_id ?? s.phone ?? s.pet_parent_name ?? null;
}

/** Earliest session_date per customer across the WHOLE dataset — the
 *  acquisition date used to tell new sessions from returning ones. */
export function firstSessionDates(all: GroomingSession[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const s of all) {
    if (!s.session_date) continue;
    const key = customerKey(s);
    if (!key) continue;
    const cur = m.get(key);
    if (!cur || s.session_date < cur) m.set(key, s.session_date);
  }
  return m;
}

/** New vs Returning sessions.  A session counts as "new" when it is that
 *  customer's first-ever session (its date matches their acquisition date
 *  computed over the full dataset); every later visit is "returning". */
export function groupByCustomerType(rows: GroomingSession[], firstDates: Map<string, string>): Slice[] {
  let neu = 0, newRev = 0, ret = 0, retRev = 0;
  for (const s of rows) {
    const key = customerKey(s);
    const first = key ? firstDates.get(key) : undefined;
    const isNew = !!(first && s.session_date && s.session_date <= first);
    if (isNew) { neu++; newRev += paidAmount(s); }
    else       { ret++; retRev += paidAmount(s); }
  }
  return [
    { key: 'new',       label: 'New',       count: neu, revenue: newRev, color: CAT_COLORS[1] }, // aqua
    { key: 'returning', label: 'Returning', count: ret, revenue: retRev, color: CAT_COLORS[4] }, // violet
  ].filter(s => s.count > 0);
}

/** Sessions grouped by grooming package, most-booked first. */
export function groupByPackage(rows: GroomingSession[]): Slice[] {
  const m = new Map<string, Slice>();
  for (const s of rows) {
    const label = s.package || 'No package';
    const cur = m.get(label) ?? { key: label, label, count: 0, revenue: 0 };
    cur.count++; cur.revenue += paidAmount(s);
    m.set(label, cur);
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}

/** Sessions grouped by weekday, busiest first — "which days do we work most". */
export function groupByDayOfWeek(rows: GroomingSession[]): Slice[] {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const counts = new Array(7).fill(0);
  const rev = new Array(7).fill(0);
  for (const s of rows) {
    if (!s.session_date) continue;
    const dow = new Date(s.session_date + 'T00:00:00').getDay();
    counts[dow]++; rev[dow] += paidAmount(s);
  }
  return names
    .map((label, i) => ({ key: String(i), label, count: counts[i], revenue: rev[i] }))
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count);
}

/** Add-on attach — how often each paid add-on is chosen (upsell insight). */
export function groupByAddOn(rows: GroomingSession[]): Slice[] {
  const m = new Map<string, Slice>();
  for (const s of rows) {
    for (const a of (s.add_ons ?? [])) {
      if (!a) continue;
      const cur = m.get(a) ?? { key: a, label: a, count: 0, revenue: 0 };
      cur.count++;
      m.set(a, cur);
    }
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}

/** Payment status — unpaid / collected / paid (collections & cash-flow view). */
export function groupByPaymentStatus(rows: GroomingSession[]): Slice[] {
  const order: PaymentStatus[] = ['paid', 'collected', 'unpaid'];
  const labels: Record<PaymentStatus, string> = { paid: 'Paid (verified)', collected: 'Collected', unpaid: 'Unpaid' };
  const colors: Record<PaymentStatus, string> = { paid: '#0ca30c', collected: '#eda100', unpaid: '#e34948' };
  const m = new Map<PaymentStatus, Slice>();
  for (const s of rows) {
    const st = paymentStatusOf(s);
    const cur = m.get(st) ?? { key: st, label: labels[st], count: 0, revenue: 0, color: colors[st] };
    cur.count++; cur.revenue += Number(s.total_collected ?? 0);
    m.set(st, cur);
  }
  return order.filter(k => m.has(k)).map(k => m.get(k)!);
}

/** Customer ratings distribution — service-quality signal. */
export function groupByRating(rows: GroomingSession[]): Slice[] {
  let five = 0, four = 0, low = 0, unrated = 0;
  for (const s of rows) {
    const r = s.client_rating;
    if (r == null) unrated++;
    else if (r >= 5) five++;
    else if (r === 4) four++;
    else low++;
  }
  return [
    { key: '5',       label: '5 ★',      count: five,    revenue: 0, color: '#0ca30c' },
    { key: '4',       label: '4 ★',      count: four,    revenue: 0, color: '#eda100' },
    { key: 'low',     label: '≤ 3 ★',    count: low,     revenue: 0, color: '#e34948' },
    { key: 'unrated', label: 'Unrated',  count: unrated, revenue: 0, color: '#898781' },
  ].filter(s => s.count > 0);
}

/** Sessions grouped by calendar month (YYYY-MM), chronological — the trend series. */
export interface TrendPoint { period: string; label: string; count: number; revenue: number }
export function trendByMonth(rows: GroomingSession[]): TrendPoint[] {
  const m = new Map<string, TrendPoint>();
  for (const s of rows) {
    if (!s.session_date) continue;
    const period = s.session_date.slice(0, 7);      // YYYY-MM
    const cur = m.get(period) ?? { period, label: monthLabel(period), count: 0, revenue: 0 };
    cur.count++; cur.revenue += paidAmount(s);
    m.set(period, cur);
  }
  return [...m.values()].sort((a, b) => a.period.localeCompare(b.period));
}

function monthLabel(period: string): string {
  const [y, mm] = period.split('-');
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${names[Number(mm) - 1] ?? mm} ${String(y).slice(2)}`;
}

// ─── Excel export ────────────────────────────────────────────────────

/** Build and trigger download of a single-sheet .xlsx of the filtered sessions.
 *
 *  Async because the `xlsx` library is code-split — the first export in a
 *  session pays a short network fetch for the chunk, every later one is
 *  instant (module cache).  Callers that don't await still work; awaiting
 *  just lets them show a spinner. */
export async function exportAnalyticsXlsx(
  rows: GroomingSession[],
  filters: AnalyticsFilters,
  _groomerNameById: Record<string, string>,
  now = new Date(),
): Promise<void> {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  // ── Sessions sheet: full filtered detail (the only sheet) ──
  const detail = rows
    .slice()
    .sort((a, b) => (b.session_date ?? '').localeCompare(a.session_date ?? ''))
    .map(s => ({
      Date:            s.session_date ?? '',
      Time:            s.scheduled_time ?? '',
      Customer:        s.pet_parent_name ?? '',
      Phone:           s.phone ?? '',
      Pet:             s.pet_type,
      Breed:           s.breed ?? '',
      Groomer:         s.groomer_name || 'Unassigned',
      Package:         s.package ?? '',
      'Add-ons':       (s.add_ons ?? []).join(', '),
      Status:          STATUS_LABELS[s.status] ?? s.status,
      Source:          (SOURCE_LABELS as Record<string, string>)[s.source] ?? s.source,
      Channel:         isExternalSource(s.source) ? 'Vendor' : 'Direct',
      'Collected by':  PAYMENT_COLLECTED_BY_LABELS[s.payment_collected_by] ?? s.payment_collected_by,
      'Payment mode':  s.payment_mode ?? '',
      'Booking (INR)': Number(s.booking_amount ?? 0),
      'Tip (INR)':     Number(s.tip_amount ?? 0),
      'Collected (INR)': Number(s.total_collected ?? 0),
      Rating:          s.client_rating ?? '',
    }));

  const wsSessions = XLSX.utils.json_to_sheet(detail);
  wsSessions['!cols'] = [
    { wch: 11 }, { wch: 7 }, { wch: 20 }, { wch: 15 }, { wch: 6 }, { wch: 14 },
    { wch: 12 }, { wch: 18 }, { wch: 22 }, { wch: 12 }, { wch: 14 }, { wch: 9 },
    { wch: 16 }, { wch: 12 }, { wch: 13 }, { wch: 10 }, { wch: 14 }, { wch: 7 },
  ];
  if (detail.length) wsSessions['!autofilter'] = { ref: `A1:R${detail.length + 1}` };
  XLSX.utils.book_append_sheet(wb, wsSessions, 'Sessions');

  const { from, to } = resolveRange(filters, now);
  const stamp = (from && to) ? `${from}_${to}` : toISODate(now);
  XLSX.writeFile(wb, `sniffy-analytics-${stamp}.xlsx`);
}

/** Currency formatter re-exported so the tab imports from one place. */
export { fmtMoney };
