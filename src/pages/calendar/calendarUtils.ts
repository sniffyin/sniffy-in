/**
 * calendarUtils.ts — Pure date-math helpers used by both calendar views.
 *
 * No deps; everything is plain Date math so we don't pull in any libs.
 */

export type ViewMode = 'month' | 'week';

/** Format a Date as yyyy-mm-dd in *local* time (matches Supabase `date`). */
export function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Same calendar day? (compares y/m/d in local time) */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth() &&
    a.getDate()     === b.getDate()
  );
}

/** Today at 00:00 local time. */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Sunday-anchored start-of-week for the week containing `d`. */
export function startOfWeek(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - out.getDay());     // Sunday = 0
  return out;
}

export function endOfWeek(d: Date): Date {
  const out = startOfWeek(d);
  out.setDate(out.getDate() + 6);
  out.setHours(23, 59, 59, 999);
  return out;
}

/** First day of the calendar grid for `d`'s month (back to nearest Sunday). */
export function startOfMonthGrid(d: Date): Date {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return startOfWeek(first);
}

/**
 * 6-row × 7-col grid (42 days) covering the month containing `d`.
 * Always 42 boxes so the row count never changes, MS-Teams style.
 */
export function buildMonthGrid(d: Date): Date[] {
  const start = startOfMonthGrid(d);
  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}

export function buildWeekGrid(d: Date): Date[] {
  const start = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function addWeeks(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n * 7);
  return out;
}

// ─── Display ──────────────────────────────────────────────────

export const WEEKDAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const MONTHS_LONG = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export function fmtMonthYear(d: Date): string {
  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtWeekRange(start: Date): string {
  const end = new Date(start); end.setDate(end.getDate() + 6);
  const startStr = start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const endStr   = end.toLocaleDateString('en-IN',   { day: 'numeric', month: 'short', year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

// ─── Leave colour helpers ─────────────────────────────────────

/**
 * Colour philosophy:
 *   pending  → solid orange tint (color = "needs attention", reads as warning)
 *   rejected → solid red tint    (color = "denied",          reads as error)
 *   approved → SLATE tint + diagonal hatching (universal "blocked/unavailable"
 *              pattern) so the cell never looks "available"; the green chip on
 *              top of it conveys the approval state explicitly.
 *   lwp      → same slate hatching + violet chip ("approved but unpaid")
 *
 * `pattern` is a CSS `background-image` value; pair it with `bg` as the base
 * fill and you get a hatched slate cell.  Days in `pending`/`rejected` keep
 * `pattern: undefined` so the warm tint reads as a flat solid.
 */
export const LEAVE_COLORS = {
  pending: {
    bg:      '#fff7ed',
    border:  '#fb923c',
    text:    '#c2410c',
    chip:    'bg-orange-100 text-orange-800',
    label:   'Pending Approval',
    short:   'Pending',
    pattern: undefined as string | undefined,
  },
  approved: {
    bg:      '#f1f5f9',                       // slate-100
    border:  '#10b981',                       // emerald-500 (chip accent)
    text:    '#047857',
    chip:    'bg-emerald-100 text-emerald-800',
    label:   'Approved Leave',
    short:   'Leave',
    pattern: 'repeating-linear-gradient(45deg, rgba(100,116,139,0.18) 0, rgba(100,116,139,0.18) 6px, transparent 6px, transparent 12px)',
  },
  rejected: {
    bg:      '#fef2f2',
    border:  '#f87171',
    text:    '#b91c1c',
    chip:    'bg-red-100 text-red-700',
    label:   'Rejected',
    short:   'Denied',
    pattern: undefined as string | undefined,
  },
  lwp: {
    bg:      '#f1f5f9',                       // slate-100 — same blocked vibe
    border:  '#7c3aed',                       // violet-600 (chip accent)
    text:    '#5b21b6',
    chip:    'bg-violet-100 text-violet-800',
    label:   'Leave Without Pay',
    short:   'LWP',
    pattern: 'repeating-linear-gradient(45deg, rgba(124,58,237,0.18) 0, rgba(124,58,237,0.18) 6px, transparent 6px, transparent 12px)',
  },
} as const;

export type LeaveStatusKey = keyof typeof LEAVE_COLORS;
