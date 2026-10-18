/**
 * admin/AdminCalendarTab.tsx
 *
 * MS-Teams style calendar for admins / coordinators (Nikita).
 *
 * Holistic view across ALL groomers:
 *   ▸ Each day box shows a grand total of grooming sessions on that day.
 *   ▸ A groomer-filter dropdown lets you scope to a single groomer.
 *   ▸ Pending leaves appear as orange chips on their day.
 *   ▸ A "Pending Approvals" rail at the top lists every pending leave —
 *     click ✓ to approve (turns green) or ✗ to reject (turns red).
 *   ▸ Click any day to see a side-sheet of who's working that day,
 *     who's on leave, and pending requests for that day.
 *
 * Reads:
 *   - grooming_sessions  (all rows; filtered by groomer if selected)
 *   - groomer_leaves     (all rows)
 *   - groomers           (for the filter dropdown + name lookup)
 */

import { useEffect, useMemo, useState, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CalendarDays, X,
  AlertTriangle, CalendarOff, Users,
  Check, XCircle, CalendarRange, Filter, ChevronDown, ChevronUp,
  UserX, Edit3, Trash2, Share2, Sparkles,
} from 'lucide-react';
import {
  EXTERNAL_SOURCE_FEE_RULE, commissionFor,
  isExternalSource, resolveSourceLabel,
  fmtCurrency, isVendorPrepaid,
} from './types';
import { supabase } from '../../lib/supabase';
import type { GroomingSession, Groomer, SessionStatus } from './types';
import { canWrite, type AdminUser } from './authStore';
import { useSessionsAscending, refreshSessions } from './sessionsCache';
import {
  toISODate, isSameDay, startOfToday,
  buildMonthGrid, buildWeekGrid,
  addMonths, addWeeks,
  WEEKDAYS_SHORT, MONTHS_LONG, fmtMonthYear, fmtWeekRange, LEAVE_COLORS,
  type ViewMode,
} from '../calendar/calendarUtils';
import {
  fetchAllLeaves, approveLeave, rejectLeave,
  markAttendanceWithReason, ATTENDANCE_KIND_META,
  getMonthlyLeaveStats, LEAVE_QUOTA_PER_MONTH,
  type GroomerLeave, type AttendanceMarkKind,
} from '../calendar/leavesApi';
import MilestoneApprovalsRail from './MilestoneApprovalsRail';
const SessionFormModal = lazy(() => import('./SessionFormModal'));
import CompletionCodePill from '../../components/CompletionCodePill';
import SniffyDatePicker from '../calendar/SniffyDatePicker';
import PaymentStatusBadge from '../../components/PaymentStatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  ON_TIME_BONUS, REVIEW_BONUS, sumIncentivesOverSessions, wasArrivedInWindow,
} from '../groomer/incentivesApi';
import type { SessionsInitialFilters } from './SessionsTab';
import SessionPetLines from './SessionPetLines';
import { useSessionPetDisplay } from './useSessionPets';
import type { DisplayPet } from './sessionPets';

const ALL = '__all__';

/**
 * Cell border tone per leave status.
 *
 * Deliberately NOT `LEAVE_COLORS[x].border`: that map gives `approved`
 * an emerald accent, which was fine when emerald meant nothing else on
 * the grid.  Now emerald is reserved for *completed sessions*, so an
 * emerald-edged cell on a day everyone is off reads as a day of finished
 * work.  Approved leave borrows the slate "blocked" tone that matches its
 * hatch instead; pending/rejected/LWP keep their own unambiguous colours.
 */
const LEAVE_BORDER: Record<string, string> = {
  pending:  '#fb923c',   // orange — actionable
  approved: '#94a3b8',   // slate  — blocked, not "done"
  lwp:      '#7c3aed',   // violet — blocked + unpaid
  rejected: '#f87171',   // red    — denied
};

/**
 * Completed vs upcoming — the one distinction the whole tab hangs on.
 *
 * Emerald-500 against blue-400 was too weak: similar *lightness*, and in a
 * 4px bar the two segments touch directly, so they smeared into one band.
 * Three separations are applied instead of relying on hue alone:
 *   1. lightness — a deep blue-600 against a mid emerald,
 *   2. a hard white gap so the segments never abut,
 *   3. a diagonal stripe on `upcoming`, which survives greyscale and
 *      every form of colour blindness.
 * Green stays "done" because that mapping is near-universal.
 */
/**
 * Decorative corner art for the Financials card — same idea as the package
 * cards on the marketing site (`components/Packages.tsx`): a photo layer at
 * low opacity, masked so it fades out before it reaches the content, with a
 * card-colour wash over the top to guarantee the figures stay legible.
 *
 * The full uncropped frame (Unsplash, Jamie Street), used as supplied — the
 * pre-compressed WebP, 5184x3888, 249 KB.
 *
 * Because it is used whole, the art box is given the photo's own 4:3 aspect
 * (`aspect-[4/3]` below). That is what lets `cover` show the entire image with
 * nothing cut off, while still making the image's edges land exactly on the
 * box's edges — which is the condition for the mask to finish fading before it
 * runs out, i.e. no visible seam.
 */
const FINANCIALS_ART = '/images/dog-portrait.webp';
/**
 * Corner wedge: a quarter-ellipse anchored at the card's bottom-right,
 * sweeping up toward the right edge and dissolving before it reaches the
 * source labels on the left.
 *
 * The radius is exactly 100% for a reason. The gradient's origin is the
 * bottom-right corner, so the distance from there to the box's left edge is
 * 100% of its width and to its top edge is 100% of its height — meaning the
 * fade reaches full transparency precisely as the box runs out, on both
 * sides. Any larger (an earlier 115% attempt) and the ramp gets clipped
 * mid-fade, which is exactly what a hard seam is; any smaller and the art
 * stops short of the card's own corner and floats.
 */
const FINANCIALS_ART_MASK =
  'radial-gradient(100% 100% at 100% 100%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.78) 24%, rgba(0,0,0,0.34) 52%, rgba(0,0,0,0.10) 76%, transparent 100%)';
/** Card-colour wash over the photo. Thinnest at the bottom-right corner,
 *  effectively opaque by the time it reaches the labels on the left — that
 *  left-hand opacity is what lets the photo sit here at all without the
 *  source names and the running totals losing contrast.
 *
 *  The floor is 0.34 rather than near-zero: every number in this card is
 *  right-aligned, so even the corner the art "owns" has text over it. The
 *  photo is a texture behind the figures, never a picture competing with
 *  them — read it as a watermark and it is doing its job. */
const FINANCIALS_ART_WASH =
  'linear-gradient(to top left, rgba(251,251,253,0.22) 0%, rgba(251,251,253,0.84) 44%, rgba(251,251,253,0.98) 100%)';

const DONE_COLOR     = '#059669';   // emerald-600
const UPCOMING_COLOR = '#2563eb';   // blue-600 — markedly darker than blue-400
const UPCOMING_FILL  =
  `repeating-linear-gradient(45deg, rgba(255,255,255,0.42) 0 2px, transparent 2px 5px), ${UPCOMING_COLOR}`;

/**
 * Third state: `grooming_done` — the pet was groomed, the money wasn't
 * settled.  Orange because it is the one bucket that is *owed to us*;
 * green reads as banked and blue as not-yet-happened, and neither is
 * true here.  Matches STATUS_COLORS_HEX.grooming_done in analyticsLib
 * and the orange STATUS_COLORS pill, so a row keeps the same colour
 * from the calendar to the session list to the charts.
 *
 * The stripe runs the OPPOSITE way to `UPCOMING_FILL` (−45° vs 45°) for
 * the reason given above that constant: in a 4px bar these segments sit
 * two pixels apart, and hue alone doesn't separate them in greyscale or
 * for a colour-blind reader.  Angle does.
 */
const PENDING_COLOR = '#e07b18';   // orange-600-ish
const PENDING_FILL  =
  `repeating-linear-gradient(-45deg, rgba(255,255,255,0.42) 0 2px, transparent 2px 5px), ${PENDING_COLOR}`;

export default function AdminCalendarTab({ user, onNavigate }: {
  user: AdminUser;
  /** Lets the Financials card's "groomed, unsettled" / "upcoming" strips
   *  jump straight to the same rows on the Sessions tab. Mirrors
   *  OverviewTab's onNavigate contract, narrowed to the one destination
   *  this tab ever sends coordinators to. */
  onNavigate?: (tab: 'sessions', filter?: SessionsInitialFilters) => void;
}) {
  const allowedToApprove = canWrite(user);   // admin or coordinator

  const [view, setView]     = useState<ViewMode>('month');
  const [cursor, setCursor] = useState<Date>(() => startOfToday());

  const [groomers, setGroomers] = useState<Groomer[]>([]);
  const [leaves,   setLeaves]   = useState<GroomerLeave[]>([]);
  // Only covers the two small tab-local queries (groomers + leaves).
  // Sessions carry their own loading flag from the shared cache.
  const [sideLoading, setSideLoading] = useState(true);

  // Sessions come from the dashboard-wide snapshot rather than a
  // calendar-local `select('*')`, so opening the Calendar right after
  // Overview or Sessions reuses the rows already in memory instead of
  // pulling the whole table again.  The calendar wants oldest-first,
  // which is a memoised reverse of the shared newest-first array — far
  // cheaper than a second round-trip just to flip the ORDER BY.
  const { sessions, loading: sessionsLoading } = useSessionsAscending();
  const loading = sessionsLoading || sideLoading;

  const [groomerFilter, setGroomerFilter] = useState<string>(ALL);
  const [activeDay,     setActiveDay]     = useState<Date | null>(null);

  // The bottom groomer-summary panel computes its incentive from
  // session state directly via `sumIncentivesOverSessions` — single
  // source of truth lives in `groomer/incentivesApi.ts`. No per-employee
  // compensation lookup happens at this layer.

  // Sniffy-styled delete-session flow (replaces window.confirm inside
  // the day popup).  pendingDelete holds the row the user clicked
  // delete on; deleteBusy locks the dialog while the supabase
  // request is in flight; deleteError surfaces a failure note inside
  // the dialog instead of a second window.alert.
  const [pendingDelete, setPendingDelete] = useState<GroomingSession | null>(null);
  const [deleteBusy,    setDeleteBusy]    = useState(false);
  const [deleteError,   setDeleteError]   = useState<string | null>(null);

  const today = startOfToday();

  /** The two small calendar-local tables.  Both are tiny (a handful of
   *  groomers, a few dozen leave rows), so they're still fetched per
   *  mount — it's the sessions table that was expensive. */
  const loadSideData = useCallback(async () => {
    const [gRes, lRes] = await Promise.all([
      supabase.from('groomers').select('*').order('name'),
      fetchAllLeaves(),
    ]);
    setGroomers((gRes.data as Groomer[]) ?? []);
    setLeaves(lRes);
    setSideLoading(false);
  }, []);

  /** Full reload — used by the mutation handlers below (approve/reject a
   *  leave, delete a session).  Refreshing the shared snapshot here is
   *  what keeps the Sessions and Overview tabs in step after a delete. */
  const refetch = useCallback(async () => {
    await Promise.all([refreshSessions(), loadSideData()]);
  }, [loadSideData]);

  useEffect(() => { loadSideData(); }, [loadSideData]);

  // Resolved groomer object for the current filter — drives the bottom
  // summary panel.  `null` whenever the filter is "All Groomers".
  const selectedGroomer = useMemo(
    () => (groomerFilter === ALL ? null : groomers.find(g => g.id === groomerFilter) ?? null),
    [groomers, groomerFilter],
  );

  // Sessions filtered by chosen groomer
  const filteredSessions = useMemo(() => {
    if (groomerFilter === ALL) return sessions;
    return sessions.filter(s => s.groomer_id === groomerFilter);
  }, [sessions, groomerFilter]);

  // Leaves filtered too
  const filteredLeaves = useMemo(() => {
    if (groomerFilter === ALL) return leaves;
    return leaves.filter(l => l.groomer_id === groomerFilter);
  }, [leaves, groomerFilter]);

  // Index sessions by date with names of groomers working
  const sessionsByDate = useMemo(() => {
    const m = new Map<string, {
      completed: number; groomingDone: number; upcoming: number;
      total: number; rows: GroomingSession[];
    }>();
    for (const s of filteredSessions) {
      if (!s.session_date) continue;
      const cur = m.get(s.session_date)
        ?? { completed: 0, groomingDone: 0, upcoming: 0, total: 0, rows: [] };
      cur.total += 1;
      cur.rows.push(s);
      // Three mutually exclusive buckets, in lifecycle order.  Note the
      // grooming_done arm sits ABOVE the upcoming arm and is not part of
      // it: folding groomed-but-unsettled work into "upcoming" is the
      // bug this status exists to fix — a session finished three weeks
      // ago was being drawn as work still to come, forever, because the
      // upcoming test looks at status and never at the date.
      // `lead` and `cancelled` intentionally fall through to neither.
      if (s.status === 'completed')          cur.completed    += 1;
      else if (s.status === 'grooming_done') cur.groomingDone += 1;
      else if (s.status === 'scheduled' || s.status === 'groomer_assigned') cur.upcoming += 1;
      m.set(s.session_date, cur);
    }
    return m;
  }, [filteredSessions]);

  // Index leaves by date — multiple groomers may be off on the same day
  const leavesByDate = useMemo(() => {
    const m = new Map<string, GroomerLeave[]>();
    for (const l of filteredLeaves) {
      const arr = m.get(l.leave_date) ?? [];
      arr.push(l);
      m.set(l.leave_date, arr);
    }
    return m;
  }, [filteredLeaves]);

  const pendingLeaves = useMemo(
    () => leaves.filter(l => l.status === 'pending').sort((a, b) => a.leave_date.localeCompare(b.leave_date)),
    [leaves]
  );

  const days = useMemo(
    () => (view === 'month' ? buildMonthGrid(cursor) : buildWeekGrid(cursor)),
    [view, cursor]
  );

  // Busiest day currently on screen — the denominator for the heat-map
  // fill.  Normalising against the *visible* grid (rather than a fixed
  // ceiling) keeps quiet months from rendering as one flat pale wash:
  // the darkest cell is always the busiest day you're looking at.
  const maxDayVolume = useMemo(() => {
    let max = 0;
    for (const d of days) {
      const st = sessionsByDate.get(toISODate(d));
      if (!st) continue;
      const vol = st.completed + st.groomingDone + st.upcoming;
      if (vol > max) max = vol;
    }
    return Math.max(max, 1);
  }, [days, sessionsByDate]);

  // ── Period rollup (drives the Financials card below the grid) ──
  //
  // Month view: include only sessions in the cursor's calendar month
  // (the 42-cell grid borrows days from the prev/next month for layout
  // — we don't want those bleeding into the totals).
  // Week view : include exactly the 7 days of `days`.
  // Filtering by ISO date string keeps the comparison cheap & TZ-safe.
  // Bounds are split into their own memo (rather than inlined in
  // `rangeSessions`) so the Financials card's click-throughs can seed
  // Sessions-tab with the exact same date window it's showing totals for.
  const periodBounds = useMemo(() => {
    if (view === 'week') {
      return { startISO: toISODate(days[0]), endISO: toISODate(days[days.length - 1]) };
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(),     1);
    const last  = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    return { startISO: toISODate(first), endISO: toISODate(last) };
  }, [view, cursor, days]);

  const rangeSessions = useMemo(() => {
    const { startISO, endISO } = periodBounds;
    return filteredSessions.filter(s => {
      const d = s.session_date;
      return !!d && d >= startISO && d <= endISO;
    });
  }, [filteredSessions, periodBounds]);

  function go(delta: number) {
    setCursor(c => view === 'month' ? addMonths(c, delta) : addWeeks(c, delta));
  }
  function goToday() { setCursor(startOfToday()); }

  async function onApprove(id: string) {
    if (!allowedToApprove) return;
    const res = await approveLeave(id, user.name);
    if (!res.ok) { alert(res.error ?? 'Failed.'); return; }
    await refetch();
  }
  async function onReject(id: string, note: string) {
    if (!allowedToApprove) return;
    const res = await rejectLeave(id, user.name, note);
    if (!res.ok) { alert(res.error ?? 'Failed.'); return; }
    await refetch();
  }

  // Coordinator-initiated direct attendance mark — opens a modal that
  // creates a `groomer_leaves` row with the chosen kind/status.
  const [markOpen, setMarkOpen] = useState(false);
  const [markDate, setMarkDate] = useState<Date | null>(null);

  // Inline edit — clicking a session card in the day-detail side sheet
  // opens the master SessionFormModal pre-filled with that session.
  // Saves the coordinator a round-trip to the Sessions tab when they
  // need to tweak something during their day-by-day review.
  const [editSession, setEditSession] = useState<GroomingSession | null>(null);

  async function onMarkAttendance(input: {
    groomer_id: string;
    groomer_name: string;
    kind: AttendanceMarkKind;
    details: string;
  }): Promise<{ ok: boolean; error?: string }> {
    if (!allowedToApprove || !markDate) return { ok: false, error: 'Not allowed.' };
    const res = await markAttendanceWithReason({
      ...input,
      leave_date: toISODate(markDate),
      marked_by:  user.name,
    });
    if (res.ok) await refetch();
    return res;
  }

  return (
    <div className="space-y-4">

      {/* The month KPI strip (Completed / Upcoming / Pending / Approved) used
          to sit here. Removed on request — the same counts are readable off
          the calendar grid below, and dropping it lifts the grid above the
          fold on mobile. The `stats` memo that fed it went with it. */}

      {/* ── Milestone approvals rail (arrival + review claims) ── */}
      <MilestoneApprovalsRail approvedBy={user.name} allowed={allowedToApprove}/>

      {/* ── Pending leave approvals rail ─────────────────────── */}
      {pendingLeaves.length > 0 && (
        <div className="rounded-3xl bg-white border border-orange-200 overflow-hidden"
          style={{ boxShadow: '0 4px 16px rgba(251,146,60,0.12)' }}
        >
          <div className="px-4 sm:px-5 py-3 flex items-center gap-2 border-b border-orange-100 bg-orange-50/60">
            <AlertTriangle size={14} className="text-orange-600"/>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700">
              {pendingLeaves.length} Pending Approval{pendingLeaves.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="divide-y divide-orange-50 max-h-64 overflow-y-auto">
            {pendingLeaves.map(l => (
              <PendingRow key={l.id}
                leave={l}
                allowed={allowedToApprove}
                onApprove={() => onApprove(l.id)}
                onReject={(note) => onReject(l.id, note)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Calendar shell ──────────────────────────────────────
          "Data canvas" treatment: the grid drops its borders and lets
          each day's *fill intensity* carry the workload signal, so a
          busy week reads at a glance without counting numbers.  Purely
          presentational — every count, filter and click target below
          is the same data as before. */}
      <div className="rounded-[22px] bg-[#fbfbfd] border border-[#eceaf4] overflow-hidden"
        style={{ boxShadow: '0 6px 24px rgba(69,26,139,0.06)' }}
      >
        {/* Toolbar — month nav + Today, groomer filter, view switcher.
            Still one wrapping row so it stays short on mobile. */}
        <div className="flex items-center justify-between flex-wrap gap-y-3 gap-x-3 px-3 sm:px-5 pt-4 pb-3">
          <div className="flex items-center gap-1.5">
            <button onClick={() => go(-1)} aria-label="Previous"
              className="w-7 h-7 grid place-items-center rounded-full text-[#9a93b5] hover:text-sniffy-purple hover:bg-white border border-transparent hover:border-[#eceaf4] transition"
            >
              <ChevronLeft size={15}/>
            </button>

            <h2 className="text-[#1a1035] text-center leading-none tracking-tight min-w-[136px] sm:min-w-[186px]">
              {view === 'month' ? (
                <>
                  <span className="font-light text-[20px] sm:text-[26px]">{MONTHS_LONG[cursor.getMonth()]}</span>
                  {' '}
                  <span className="font-bold text-[20px] sm:text-[26px]">{cursor.getFullYear()}</span>
                </>
              ) : (
                <span className="font-light text-[15px] sm:text-[19px]">{fmtWeekRange(cursor)}</span>
              )}
            </h2>

            <button onClick={() => go(1)} aria-label="Next"
              className="w-7 h-7 grid place-items-center rounded-full text-[#9a93b5] hover:text-sniffy-purple hover:bg-white border border-transparent hover:border-[#eceaf4] transition"
            >
              <ChevronRight size={15}/>
            </button>

            <button onClick={goToday}
              className="ml-1 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white border border-[#eceaf4] text-[10px] font-bold uppercase tracking-wider text-sniffy-purple hover:border-sniffy-purple/30 transition"
            >
              <CalendarDays size={10}/> Today
            </button>
          </div>

          {/* On mobile this group claims its own full-width row so the
              view switcher can't be pushed off the right edge. */}
          <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
            {/* Groomer filter */}
            <div className="relative flex items-center flex-1 sm:flex-none min-w-0">
              <Filter size={10} className="absolute left-3 text-[#b4adc9] pointer-events-none"/>
              <select
                value={groomerFilter}
                onChange={e => setGroomerFilter(e.target.value)}
                className="appearance-none w-full sm:w-auto pl-7 pr-7 py-1.5 rounded-full bg-white border border-[#eceaf4] text-[10px] font-bold uppercase tracking-wider text-[#6f6790] focus:border-sniffy-purple outline-none cursor-pointer truncate"
              >
                <option value={ALL}>All Groomers</option>
                {groomers.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <ChevronDown size={10} className="absolute right-2.5 text-[#b4adc9] pointer-events-none"/>
            </div>

            {/* View switcher */}
            <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full bg-white border border-[#eceaf4] flex-shrink-0">
              {(['month','week'] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                    view === v ? 'bg-sniffy-purple text-white' : 'text-[#9a93b5] hover:text-sniffy-purple'
                  }`}
                >
                  {v === 'month' ? <><CalendarDays size={10}/>Month</> : <><CalendarRange size={10}/>Week</>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 px-2 sm:px-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-center">
          {WEEKDAYS_SHORT.map((w, i) => (
            <div key={w} className={i === 0 || i === 6 ? 'text-sniffy-purple/60' : 'text-gray-400'}>
              {w}
            </div>
          ))}
        </div>

        {/* Day grid */}
        {loading ? (
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 px-2 sm:px-4 pb-4">
            {Array.from({ length: view === 'month' ? 42 : 7 }, (_, i) => (
              <div key={i} className="h-12 sm:h-14 rounded-[11px] sm:rounded-[13px] animate-pulse bg-[#f0eef7]"/>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 px-2 sm:px-4 pb-4">
            {days.map((d, idx) => {
              const iso       = toISODate(d);
              const sStat     = sessionsByDate.get(iso);
              const lvs       = leavesByDate.get(iso) ?? [];
              const inMonth   = view === 'week' || d.getMonth() === cursor.getMonth();
              const isToday   = isSameDay(d, today);
              const isPast    = d < today;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;

              const approvedLeaveCount = lvs.filter(l => l.status === 'approved').length;
              const pendingLeaveCount  = lvs.filter(l => l.status === 'pending').length;
              const rejectedLeaveCount = lvs.filter(l => l.status === 'rejected').length;
              const lwpLeaveCount      = lvs.filter(l => l.status === 'lwp').length;
              const offTotal           = approvedLeaveCount + lwpLeaveCount;

              // Pick the dominant leave-status to tint the cell:
              // pending wins (it's actionable), then approved/lwp (blocked),
              // then rejected.
              const dominantLeave =
                pendingLeaveCount  > 0 ? lvs.find(l => l.status === 'pending')  :
                approvedLeaveCount > 0 ? lvs.find(l => l.status === 'approved') :
                lwpLeaveCount      > 0 ? lvs.find(l => l.status === 'lwp')      :
                rejectedLeaveCount > 0 ? lvs.find(l => l.status === 'rejected') :
                undefined;
              const dlc = dominantLeave ? LEAVE_COLORS[dominantLeave.status] : null;

              const completedCount = sStat?.completed    ?? 0;
              const pendingCount   = sStat?.groomingDone ?? 0;
              const upcomingCount  = sStat?.upcoming     ?? 0;
              const volume         = completedCount + pendingCount + upcomingCount;
              void isPast;

              // Headline number keeps the original meaning — the most
              // *settled* thing that happened on this day wins the big
              // numeral, and the lesser states become "+N" chips beneath.
              // Falling back through grooming_done before upcoming is what
              // stops a past day of finished-but-unpaid work from being
              // headlined in blue as if it were still to come.
              //
              // The green caption changed from "groomed" to "completed":
              // "Groomed" is now the name of the orange status one line
              // below, and the same word could not keep meaning both.
              const headline  = completedCount > 0 ? completedCount
                              : pendingCount   > 0 ? pendingCount
                              :                      upcomingCount;
              const headColor = completedCount > 0 ? DONE_COLOR
                              : pendingCount   > 0 ? PENDING_COLOR
                              :                      UPCOMING_COLOR;
              const soloLabel = completedCount > 0 ? 'completed'
                              : pendingCount   > 0 ? 'groomed'
                              :                      'scheduled';

              // Load bar — total length is the day's share of the busiest day
              // on screen, split green/orange/blue.  Magnitude *and* mix in
              // one glance, without asking anyone to decode a fill colour.
              const doneWidth    = (completedCount / maxDayVolume) * 100;
              const pendingWidth = (pendingCount   / maxDayVolume) * 100;
              const upWidth      = (upcomingCount  / maxDayVolume) * 100;

              // The "+N" chips below the numeral describe whatever the
              // headline did NOT cover.  Their wording only survives on
              // sm+ when a single chip is showing: two labelled chips
              // ("+1 groomed +1 upcoming") overflow a month cell, which
              // is ~44px wide on a phone and still narrow on a tablet.
              // With both present the colours carry it, and the full
              // sentence stays in the cell's aria-label and the bar's
              // title tooltip.
              const chipPending  = completedCount > 0 && pendingCount  > 0;
              const chipUpcoming = (completedCount > 0 || pendingCount > 0) && upcomingCount > 0;
              const soleChip     = (chipPending ? 1 : 0) + (chipUpcoming ? 1 : 0) === 1;

              // Heat tint is capped at 0.12 alpha on purpose: enough to feel
              // a heavy week in peripheral vision, never enough to fight the
              // numerals for contrast.  (An earlier pass ramped this to full
              // saturation and made the text unreadable.)
              const tint = volume > 0 ? 0.03 + (volume / maxDayVolume) * 0.09 : 0;
              const baseFill = volume > 0
                ? `rgba(69,26,139,${tint.toFixed(3)})`
                : (isWeekend ? '#faf9fd' : '#ffffff');

              // Leave hatching layers over the tint so a day that is both
              // busy and short-staffed still shows its load.
              const cellFill = dlc
                ? (dlc.pattern ? `${dlc.pattern}, ${baseFill}` : dlc.bg)
                : baseFill;

              const hasAnyContent = !!sStat || lvs.length > 0;

              return (
                <button
                  key={idx}
                  onClick={() => setActiveDay(d)}
                  // Without this a screen reader reads the raw text nodes as
                  // one run — "4 groomed +2 upcoming 1 off · 1 LWP" — with no
                  // date attached. Spell the day out instead.
                  aria-label={[
                    d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
                    isToday ? 'today' : null,
                    completedCount > 0 ? `${completedCount} completed` : null,
                    pendingCount   > 0 ? `${pendingCount} groomed, payment not settled` : null,
                    upcomingCount  > 0 ? `${upcomingCount} upcoming`  : null,
                    offTotal       > 0 ? `${offTotal} on leave`       : null,
                    pendingLeaveCount > 0 ? `${pendingLeaveCount} leave pending approval` : null,
                    !hasAnyContent ? 'no sessions' : null,
                  ].filter(Boolean).join(', ')}
                  className={[
                    'relative rounded-[14px] border overflow-hidden text-left',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sniffy-purple focus-visible:ring-offset-1',
                    // Min-height instead of fixed: empty weeks collapse,
                    // weeks with content expand naturally.
                    hasAnyContent ? 'min-h-[3.9rem] sm:min-h-[4.25rem]' : 'min-h-[2.25rem] sm:min-h-[2.5rem]',
                    'flex flex-col transition duration-200',
                    'hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-8px_rgba(69,26,139,0.3)] hover:z-10',
                    isToday ? 'border-sniffy-purple ring-1 ring-sniffy-purple/25' : '',
                    inMonth ? '' : 'opacity-45',
                  ].join(' ')}
                  // Leave status colours the border — one scannable cue, no
                  // extra element competing with the content.
                  style={{
                    background: cellFill,
                    borderColor: isToday
                      ? undefined
                      : (dominantLeave ? LEAVE_BORDER[dominantLeave.status] : '#ececf3'),
                  }}
                >
                  {/* Row 1 — date.  A month cell is only ~44px wide on a
                      375px phone, so every label below collapses to its
                      shortest legible form under `sm`; the full wording
                      returns on tablet and up, and the day side-sheet
                      always carries the complete breakdown. */}
                  <div className="flex items-center justify-between gap-1 px-1.5 sm:px-2 pt-1">
                    <span className={
                      isToday
                        ? 'w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-full bg-sniffy-purple text-white grid place-items-center text-[10px] sm:text-[11px] font-extrabold leading-none shrink-0'
                        : `text-[12px] sm:text-[13px] font-extrabold leading-none shrink-0 ${isWeekend ? 'text-sniffy-purple/60' : 'text-gray-800'}`
                    }>
                      {d.getDate()}
                    </span>

                    {/* Leave markers live in the header corner, not in the
                        body.  As a mid-cell chip they shifted the session
                        number up or down depending on whether anyone was
                        off, so the big green figures never lined up across
                        a row.  Pinned here, every cell is header / number /
                        bar and the numbers align. */}
                    {lvs.length > 0 && (
                      <span className="flex items-center gap-1 shrink-0 text-[9px] font-extrabold leading-none">
                        {offTotal > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-violet-700"
                            title={`${approvedLeaveCount} approved · ${lwpLeaveCount} LWP`}
                          >
                            <CalendarOff size={9}/>{offTotal}
                            {lwpLeaveCount > 0 && <span className="hidden sm:inline">&nbsp;LWP</span>}
                          </span>
                        )}
                        {pendingLeaveCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-orange-600">
                            <AlertTriangle size={9}/>{pendingLeaveCount}
                          </span>
                        )}
                        {rejectedLeaveCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-red-600">
                            ✗{rejectedLeaveCount}
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Row 2 — the headline count.  Big, dark-on-light, and
                      colour-coded by what it represents. */}
                  {volume > 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center px-0.5 sm:px-1 min-w-0">
                      <p className="text-[17px] sm:text-[21px] font-extrabold leading-none" style={{ color: headColor }}>
                        {headline}
                      </p>
                      <p className="hidden sm:block text-[10px] font-semibold text-gray-500 mt-0.5 leading-none">
                        {soloLabel}
                      </p>
                      {/* Always rendered, hidden with `invisible` rather than
                          dropped, so the stack is the same height whether or
                          not a day has upcoming work.  Omitting the node let
                          `justify-center` pull the numeral up a few pixels,
                          which is why days without a "+N" sat lower than
                          their neighbours.  Same reasoning now applies to
                          the row as a whole rather than the single chip. */}
                      <p className={`flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold mt-0.5 leading-none whitespace-nowrap ${
                        chipPending || chipUpcoming ? '' : 'invisible'
                      }`}>
                        {chipPending && (
                          <span className="text-orange-600">
                            +{pendingCount}
                            {soleChip && <span className="hidden sm:inline"> groomed</span>}
                          </span>
                        )}
                        {chipUpcoming && (
                          <span className="text-blue-700">
                            +{upcomingCount}
                            {soleChip && <span className="hidden sm:inline"> upcoming</span>}
                          </span>
                        )}
                        {/* Placeholder keeps the invisible row's height when
                            neither chip applies. */}
                        {!chipPending && !chipUpcoming && <span>+0</span>}
                      </p>
                    </div>
                  )}

                  {/* A day where everyone is off gets NO centre figure. An
                      earlier pass put the leave count here to keep the row
                      visually even, but a big numeral in the slot that
                      normally means "groomed" reads as sessions worked —
                      on a day nothing was groomed at all. The corner marker
                      and the hatch carry it instead; the count is one tap
                      away in the day sheet. */}

                  {/* Row 4 — load bar.  `gap` keeps the two segments from
                      touching, which is most of why they used to smear
                      together at this size. */}
                  {volume > 0 && (
                    <div className="mt-auto mx-1.5 mb-1 h-[4px] rounded-full bg-[#eeecf6] overflow-hidden flex gap-[2px]"
                      title={[
                        `${completedCount} completed`,
                        `${pendingCount} groomed · payment not settled`,
                        `${upcomingCount} upcoming`,
                      ].join(' · ')}
                    >
                      {completedCount > 0 && (
                        <span className="rounded-full" style={{ width: `${doneWidth}%`, background: DONE_COLOR }}/>
                      )}
                      {pendingCount > 0 && (
                        <span className="rounded-full" style={{ width: `${pendingWidth}%`, background: PENDING_FILL }}/>
                      )}
                      {upcomingCount > 0 && (
                        <span className="rounded-full" style={{ width: `${upWidth}%`, background: UPCOMING_FILL }}/>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend — the fill ramp is now part of the language, so it
            leads; the ring split and leave patterns follow. */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-3 sm:px-5 py-3 border-t border-[#eceaf4] bg-white/60 text-[10px] font-medium text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: DONE_COLOR }}/>
            <span className="font-semibold text-gray-600">Completed</span>
          </span>
          <span className="inline-flex items-center gap-1.5"
            title="Grooming done, payment not settled yet"
          >
            {/* Counter-striped against Upcoming — see PENDING_FILL. */}
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: PENDING_FILL }}/>
            <span className="font-semibold text-gray-600">Groomed</span>
            <span className="text-gray-400">— unsettled</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            {/* Striped, not just a different hue — the texture is what makes
                this readable in greyscale and to colour-blind users. */}
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: UPCOMING_FILL }}/>
            <span className="font-semibold text-gray-600">Upcoming</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-9 h-[5px] rounded-full bg-[#eeecf6] overflow-hidden flex gap-[2px]">
              <span className="w-[45%] rounded-full" style={{ background: DONE_COLOR }}/>
              <span className="w-[20%] rounded-full" style={{ background: PENDING_FILL }}/>
              <span className="w-[20%] rounded-full" style={{ background: UPCOMING_FILL }}/>
            </span>
            Bar length = day&rsquo;s workload
          </span>
          {/* Four separate leave swatches (pending / approved / LWP /
              denied) used to sit here, making this a seven-item legend —
              more than anyone holds in their head while scanning a grid.
              They collapse into one entry: the hatch means "someone is
              off", the cell's border colour carries which kind, and the
              day sheet names every leave in full, per groomer, with the
              approve/reject controls. Pending stays actionable through
              the Pending Approvals rail at the top of the page. */}
          <span className="inline-flex items-center gap-1.5"
            title="Pending, approved, LWP and denied — open a day for the full breakdown"
          >
            <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: `${LEAVE_COLORS.approved.pattern}, ${LEAVE_COLORS.approved.bg}`, border: `1px solid ${LEAVE_BORDER.approved}` }}/>
            <span className="font-semibold text-gray-600">Leave</span>
            <span className="text-gray-400">— border shows status</span>
          </span>
        </div>
      </div>

      {/* Groomer summary — only visible when a single groomer is
          selected from the filter.  Surfaces the leave breakdown and
          incentive numbers that were previously only visible as cell
          chips on the calendar grid. */}
      {selectedGroomer && (
        <GroomerSummaryPanel
          groomer={selectedGroomer}
          periodSessions={rangeSessions}
          leaves={filteredLeaves}
          viewYear={cursor.getFullYear()}
          viewMonth={cursor.getMonth()}
          periodLabel={view === 'month' ? fmtMonthYear(cursor) : fmtWeekRange(cursor)}
        />
      )}

      {/* Financials — per-source rollup for the current view.
          Defaults to the calendar's month/week, with drill-down to a
          specific day or custom date range. */}
      <FinancialsPanel
        allSessions={filteredSessions}
        periodSessions={rangeSessions}
        periodLabel={view === 'month' ? fmtMonthYear(cursor) : fmtWeekRange(cursor)}
        periodStartISO={periodBounds.startISO}
        periodEndISO={periodBounds.endISO}
        defaultDayISO={toISODate(today)}
        groomerName={selectedGroomer?.name}
        onNavigate={onNavigate}
      />

      {/* Day-detail dialog */}
      <AnimatePresence>
        {activeDay && (
          <AdminDayDetail
            day={activeDay}
            sessions={(sessionsByDate.get(toISODate(activeDay))?.rows) ?? []}
            leaves={leavesByDate.get(toISODate(activeDay)) ?? []}
            allowed={allowedToApprove}
            groomerName={selectedGroomer?.name}
            onNavigate={onNavigate}
            onApprove={onApprove}
            onReject={onReject}
            onClose={() => setActiveDay(null)}
            onEditSession={(s) => setEditSession(s)}
            onSessionDelete={(s) => { setDeleteError(null); setPendingDelete(s); }}
            onMarkAttendance={() => {
              setMarkDate(activeDay);
              setMarkOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Coordinator's direct attendance-mark modal */}
      <AnimatePresence>
        {markOpen && markDate && (
          <MarkAttendanceModal
            date={markDate}
            groomers={groomers}
            // Pre-existing leaves on that day so we can disable groomers who
            // already have an entry — the unique constraint would reject them.
            existingByGroomer={
              new Map((leavesByDate.get(toISODate(markDate)) ?? []).map(l => [l.groomer_id, l]))
            }
            // Full leaves array — needed so the modal can compute the
            // selected groomer's monthly paid-leave balance and warn
            // when the 4-per-month bucket is exhausted.
            allLeaves={leaves}
            onClose={() => { setMarkOpen(false); setMarkDate(null); }}
            onSubmit={onMarkAttendance}
          />
        )}
      </AnimatePresence>

      {/* Edit Session — same modal used in the Sessions tab.  Opens with
          editSession pre-filled so the coordinator can edit anything
          (groomer assignment, package, amount, etc.) without leaving
          the calendar. */}
      {allowedToApprove && editSession && (
        <Suspense fallback={null}>
        <SessionFormModal
          open={!!editSession}
          onClose={() => setEditSession(null)}
          onSaved={async () => {
            setEditSession(null);
            await refetch();
          }}
          editSession={editSession ?? undefined}
          currentUser={user}
        />
        </Suspense>
      )}

      {/* Sniffy-styled delete confirmation for the day popup.  Lives
          at this scope (not inside AdminDayDetail) so it can call
          refetch() after the delete succeeds. */}
      <ConfirmDialog
        open={!!pendingDelete}
        variant="danger"
        title="Delete this session?"
        subtitle="It will be removed from the calendar and the active list."
        confirmLabel="Delete session"
        cancelLabel="Keep it"
        busy={deleteBusy}
        onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteError(null); } }}
        onConfirm={async () => {
          if (!pendingDelete) return;
          setDeleteBusy(true);
          setDeleteError(null);
          const { error } = await supabase
            .from('grooming_sessions')
            .delete()
            .eq('id', pendingDelete.id);
          if (error) {
            setDeleteError('Delete failed: ' + error.message);
            setDeleteBusy(false);
            return;
          }
          setDeleteBusy(false);
          setPendingDelete(null);
          await refetch();
        }}
      >
        {pendingDelete && (
          <div className="space-y-2">
            <dl className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-[13px] text-gray-700 space-y-1.5">
              <div className="flex justify-between gap-3">
                <dt className="font-semibold text-gray-500">Parent</dt>
                <dd className="text-right">{pendingDelete.pet_parent_name || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-semibold text-gray-500">Amount</dt>
                <dd className="text-right font-semibold text-gray-900">
                  {fmtCurrency(pendingDelete.booking_amount ?? 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-semibold text-gray-500">Date</dt>
                <dd className="text-right">
                  {pendingDelete.session_date}
                  {pendingDelete.scheduled_time ? ` · ${pendingDelete.scheduled_time}` : ''}
                </dd>
              </div>
            </dl>
            <p className="text-[11px] text-gray-500 leading-snug px-1">
              This cannot be undone.
            </p>
            {deleteError && (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 px-3 py-2 text-[12px] text-rose-800 leading-snug">
                {deleteError}
              </div>
            )}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}

// KpiCell and StatCard lived here — the mobile and desktop renderers for the
// month KPI strip. Both went with the strip; neither had another caller.

// ─── Pending row ──────────────────────────────────────────────

function PendingRow({
  leave, allowed, onApprove, onReject,
}: {
  leave: GroomerLeave;
  allowed: boolean;
  onApprove: () => void;
  onReject: (note: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote]         = useState('');
  const [busy, setBusy]         = useState(false);

  async function approve() {
    if (!allowed) return;
    setBusy(true); await onApprove(); setBusy(false);
  }
  async function reject() {
    if (!allowed) return;
    setBusy(true); await onReject(note); setBusy(false);
    setExpanded(false); setNote('');
  }

  const dateStr = new Date(leave.leave_date + 'T00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  return (
    <div className="px-4 sm:px-5 py-3">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-xl bg-orange-100 grid place-items-center text-orange-700">
          <CalendarOff size={14}/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-extrabold text-gray-900">{leave.groomer_name}</p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
              {dateStr}
            </span>
          </div>
          {leave.reason && <p className="text-[12px] text-gray-600 mt-0.5">{leave.reason}</p>}
        </div>

        {allowed ? (
          <div className="shrink-0 flex items-center gap-1.5">
            <button
              onClick={approve}
              disabled={busy}
              title="Approve"
              className="w-9 h-9 rounded-xl grid place-items-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition disabled:opacity-50"
            >
              <Check size={16}/>
            </button>
            <button
              onClick={() => setExpanded(e => !e)}
              disabled={busy}
              title="Reject"
              className="w-9 h-9 rounded-xl grid place-items-center bg-red-50 hover:bg-red-100 text-red-600 transition disabled:opacity-50"
            >
              <XCircle size={16}/>
            </button>
          </div>
        ) : (
          <span className="shrink-0 text-[10px] text-gray-400 italic">view only</span>
        )}
      </div>

      {expanded && (
        <div className="mt-2 pl-12 flex items-center gap-2">
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Reject reason (optional)"
            className="flex-1 px-3 py-2 rounded-lg border border-red-200 text-[12px] focus:border-red-400 outline-none"
          />
          <button onClick={reject} disabled={busy}
            className="px-3 py-2 rounded-lg text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
          >
            Confirm Reject
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Day detail (admin) ──────────────────────────────────────

function AdminDayDetail({
  day, sessions, leaves, allowed,
  groomerName, onNavigate,
  onApprove, onReject, onClose, onMarkAttendance, onEditSession,
  onSessionDelete,
}: {
  day: Date;
  sessions: GroomingSession[];
  leaves: GroomerLeave[];
  allowed: boolean;
  /** Groomer currently selected in the calendar's filter, if any — `sessions`
   *  is already scoped to them, so the inline summary's click-throughs need
   *  the same scope to land on a matching Sessions-tab list. */
  groomerName?: string;
  onNavigate?: (tab: 'sessions', filter?: SessionsInitialFilters) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, note: string) => void;
  onClose: () => void;
  onMarkAttendance: () => void;
  onEditSession: (s: GroomingSession) => void;
  // Lifted up to AdminCalendarTab so the confirm dialog + post-delete
  // refetch run in the scope where `refetch` is defined.  The day
  // popup just bubbles the row up; the parent owns the destructive UX.
  onSessionDelete: (s: GroomingSession) => void;
}) {
  const isPast = day < startOfToday();
  const petDisplay = useSessionPetDisplay(sessions);

  return (
    <>
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity:0, x: 30 }}
        animate={{ opacity:1, x: 0 }}
        exit={{ opacity:0, x: 30 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="fixed z-50 right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-start justify-between gap-3 z-10">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sniffy-purple">
              {isPast ? 'Past Day' : 'Upcoming Day'}
            </p>
            <h3 className="text-xl font-extrabold text-gray-900 leading-tight mt-0.5">
              {day.toLocaleDateString('en-IN', { weekday: 'long' })}
            </h3>
            <p className="text-sm text-gray-500">
              {day.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {/* Right cluster: leaves status chip + close button.
              Leaves count moved from a full section in the body to a
              compact chip in the header — saves vertical space when
              there are zero leaves (the common case), and when there
              are leaves the chip provides the at-a-glance count while
              the body still renders the individual rows. */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {leaves.length === 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                <Check size={10} strokeWidth={3}/> All Present
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                <CalendarOff size={10} strokeWidth={2.5}/> {leaves.length} Leave{leaves.length === 1 ? '' : 's'}
              </span>
            )}
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
              <X size={18} className="text-gray-400"/>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Leaves on this day — section only renders when there are
              actual leave rows.  Zero-leaves status lives in the header
              chip above, so we don't take 60px of vertical space to
              say "No leaves on this day." */}
          {leaves.length > 0 && (
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Leaves ({leaves.length})
            </p>
              <div className="space-y-2">
                {leaves.map(l => {
                  const lc = LEAVE_COLORS[l.status];
                  return (
                    <div key={l.id}
                      className="rounded-xl p-3"
                      style={{ background: lc.bg, border: `1px solid ${lc.border}` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold" style={{ color: lc.text }}>
                            {l.groomer_name}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: lc.text }}>
                            {lc.label}
                          </p>
                          {l.reason && <p className="text-[12px] text-gray-700 mt-1">{l.reason}</p>}
                          {l.status === 'rejected' && l.rejected_note && (
                            <p className="text-[11px] mt-1 text-red-700">Note: {l.rejected_note}</p>
                          )}
                        </div>
                        {allowed && l.status === 'pending' && (
                          <div className="shrink-0 flex items-center gap-1.5">
                            <button onClick={() => onApprove(l.id)}
                              className="w-8 h-8 rounded-lg grid place-items-center bg-white text-emerald-700 hover:bg-emerald-50"
                              title="Approve"
                            >
                              <Check size={14}/>
                            </button>
                            <button
                              onClick={() => {
                                const note = window.prompt('Reject reason (optional):') ?? '';
                                onReject(l.id, note);
                              }}
                              className="w-8 h-8 rounded-lg grid place-items-center bg-white text-red-600 hover:bg-red-50"
                              title="Reject"
                            >
                              <XCircle size={14}/>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
          </section>
          )}

          {/* Sessions */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
              <Users size={11}/> Sessions ({sessions.length})
            </p>
            {sessions.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No sessions scheduled.</p>
            ) : (
              <div className="space-y-2">
                {sessions.map(s => (
                  <SessionCardExpandable
                    key={s.id}
                    session={s}
                    pets={petDisplay.get(s.id)}
                    allowed={allowed}
                    onEdit={() => onEditSession(s)}
                    // Delegated up to AdminCalendarTab — see the
                    // ConfirmDialog rendered there.  The popup just
                    // hands the row off; the parent owns confirm + refetch.
                    onDelete={() => onSessionDelete(s)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Compact inline day summary — same numbers the
              Share Summary button sends to WhatsApp.  Rendered
              right before the bottom action area so the
              coordinator sees totals + per-source breakdown
              without leaving the popup. */}
          <DaySummaryCard
            sessions={sessions}
            dateISO={toISODate(day)}
            groomerName={groomerName}
            onNavigate={onNavigate}
          />

          {/* ─── Bottom action area ────────────────────────────
              Share Summary + Mark Attendance live in the same row
              now, equal-width.  Share is primary (daily action,
              full label visible).  Mark Attendance is the rarely
              used fallback — same height pill, secondary purple
              gradient, label tightened to "Mark Absent" so it
              fits next to its sibling on narrow mobile.
              One small shared hint sits below explaining what
              each does, so the action area is one stack of ~3
              elements instead of five. */}
          <section className="pt-3 border-t border-gray-100 space-y-2">
            <div className={`grid gap-2 ${allowed ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <button
                onClick={() => shareDaySummary(day, sessions)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-sm font-extrabold text-white"
                style={{ background: 'linear-gradient(145deg, #25d366 0%, #128c7e 100%)', boxShadow: '0 4px 14px rgba(18,140,126,0.25)' }}
              >
                <Share2 size={14}/> Share Summary
              </button>
              {allowed && (
                <button
                  onClick={onMarkAttendance}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-sm font-extrabold text-white"
                  style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)', boxShadow: '0 4px 14px rgba(69,26,139,0.25)' }}
                  title="Record a groomer who was absent or couldn't be deployed"
                >
                  <UserX size={14}/> Mark Absent
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 text-center leading-snug px-2">
              Share opens WhatsApp with the day's per-source breakdown.
              {allowed && ' Mark Absent records a groomer who didn\'t apply for leave but couldn\'t work.'}
            </p>
          </section>
        </div>
      </motion.div>
    </>
  );
}

// ─── Daily-summary helpers ───────────────────────────────────
//
// `computeDaySummary` does the bookkeeping once (group by source,
// commission lookup, total receivable).  Both the inline popup card
// and the WhatsApp share button consume the same shape so the two
// views can never drift.
//
// Per-source net uses the row's saved platform_commission when
// present (honours manual overrides) and otherwise falls back to
// the source's fee rule for that source.  Groomer commission is
// also subtracted so "net" is what Sniffy actually keeps after
// paying the field staff — not the pre-payroll figure.
//
// Each row is further split by who collected the cash:
//   • sniffyNet   — money Sniffy holds (Sniffy + groomer_cash collectors)
//   • vendorOwed  — receivable from the partner (vendor-prepaid collector).
//                   For vendor-prepaid bookings, Sniffy didn't get the
//                   booking_amount; what we expect is the implied
//                   groomer fee, which we estimate as
//                   gross − platform_commission − groomer_commission.
// totalNet is the sum of sniffyNet across all rows — it's the cash
// Sniffy is owed/has from today.  totalVendorOwed is reported
// separately so the WhatsApp share and the day card don't conflate
// "cash in hand" with "receivable from partner".

type SummaryRow = {
  key: string;
  label: string;
  isExternal: boolean;
  count: number;
  /** Total gross routed through this source (incl. vendor-prepaid). */
  gross: number;
  /** Sniffy's keep after platform + groomer commissions, for the
   *  rows Sniffy actually collected.  This is what shows in the
   *  "₹X (₹Y gross)" column. */
  net: number;
  /** How many of the rows were partner-pre-collected. */
  vendorPrepaidCount: number;
  /** Implied groomer fee Sniffy is owed by the partner for the
   *  vendor-prepaid rows in this bucket. */
  vendorOwed: number;
};
type DaySummary = {
  totalOrders: number;
  totalGross: number;
  /** Sniffy's net keep across rows it collected. */
  totalNet: number;
  /** Sum of receivable from partners across vendor-prepaid rows. */
  totalVendorOwed: number;
  rows: SummaryRow[];
};

// ─── Outstanding money on groomed-but-unsettled sessions ─────
//
// Answers the question the orange bucket exists to answer: *the work is
// done, so where is the money?*  Grouped by who is holding it, because
// that is who the coordinator has to chase — a per-source split (what
// computeDaySummary does for completed rows) would tell you the money
// came from Paw Space but not that Hemant is the one carrying it.
//
//   payment_collected_by = 'vendor'       → the partner owes us
//   payment_collected_by = 'groomer_cash' → the groomer is holding cash
//   payment_collected_by = 'sniffy'       → ours, not yet reconciled
//
// Rows already `paid` (coordinator verified) are excluded from the
// amounts: nothing is outstanding on them, they are simply awaiting the
// final click to `completed`.  They are counted separately as
// `readyToClose` so the strip can say so rather than showing a group
// that owes ₹0.
type OutstandingRow = {
  key:    string;
  label:  string;
  /** What is happening to this money, e.g. "receivable", "cash in hand". */
  note:   string;
  count:  number;
  amount: number;
  /** Partners sort above internal groups — same order as the
   *  completed-session rows above them in the card. */
  isVendor: boolean;
};
type Outstanding = {
  rows:         OutstandingRow[];
  total:        number;
  /** Groomed + money already verified — only the status flip is left. */
  readyToClose: number;
};

function computeOutstanding(sessions: GroomingSession[]): Outstanding {
  const buckets = new Map<string, OutstandingRow>();
  let total = 0;
  let readyToClose = 0;

  const add = (key: string, label: string, note: string, isVendor: boolean, amount: number) => {
    const b = buckets.get(key) ?? { key, label, note, count: 0, amount: 0, isVendor };
    b.count  += 1;
    b.amount += amount;
    buckets.set(key, b);
    total += amount;
  };

  for (const s of sessions) {
    // Verified money is not outstanding — see the note above.
    if (s.payment_verified) { readyToClose += 1; continue; }

    // What is actually owed.  Once the groomer has recorded the payment
    // we know the real figure (booking + upsell + tip); before that the
    // booking amount is the best estimate we have.
    const gross     = Number(s.booking_amount) || 0;
    const collected = Number(s.total_collected) || 0;
    const held      = s.payment_collected_at ? (collected || gross) : gross;

    if (isVendorPrepaid(s)) {
      // The partner took the customer's money.  What they owe us is
      // their gross minus their own commission — identical math to
      // `vendorOwed` in computeDaySummary, deliberately: the two figures
      // describe the same debt at different stages, and they would be
      // impossible to reconcile if they disagreed.
      let platformCommission = Number(s.platform_commission) || 0;
      if (!platformCommission) {
        const rule = EXTERNAL_SOURCE_FEE_RULE[s.source as string];
        if (rule) platformCommission = commissionFor(rule, gross);
      }
      add(
        `vendor:${s.source ?? 'unknown'}`,
        resolveSourceLabel(s.source),
        'receivable',
        true,
        Math.max(0, gross - platformCommission),
      );
    } else if (s.payment_collected_by === 'groomer_cash') {
      add(
        `groomer:${s.groomer_name ?? 'unassigned'}`,
        s.groomer_name || 'Unassigned groomer',
        'cash in hand',
        false,
        held,
      );
    } else {
      // Sniffy's own channel.  Split by how far along it is, because the
      // two need different chasing: "not collected" is a call to the
      // customer, "unverified" is a look at the bank statement.
      if (!s.payment_collected_at) {
        add('sniffy:uncollected', 'Sniffy', 'not collected yet', false, gross);
      } else {
        const online = s.payment_mode !== 'cash';
        add(
          online ? 'sniffy:online' : 'sniffy:cash',
          online ? 'Online' : 'Cash',
          'awaiting verification',
          false,
          held,
        );
      }
    }
  }

  const rows = Array.from(buckets.values()).sort((a, b) => {
    if (a.isVendor !== b.isVendor) return a.isVendor ? -1 : 1;
    return b.amount - a.amount;
  });

  return { rows, total, readyToClose };
}

function computeDaySummary(sessions: GroomingSession[]): DaySummary {
  // Bucket by `source` alone — historically some rows have the wrong
  // `source_type` recorded (e.g. a Woofly booking saved as
  // source_type='internal'), so trusting source_type would split the
  // same Woofly day into "Woofly" and a bogus "Direct" pile.  The
  // source value itself is unique to its category, so we read straight
  // from there.
  const buckets = new Map<string, SummaryRow>();
  for (const s of sessions) {
    const sourceKey = s.source ?? 'unknown';
    const bucket = buckets.get(sourceKey) ?? {
      key:        sourceKey,
      label:      resolveSourceLabel(s.source),
      isExternal: isExternalSource(s.source),
      count: 0, gross: 0, net: 0,
      vendorPrepaidCount: 0, vendorOwed: 0,
    };
    const gross = Number(s.booking_amount) || 0;
    let platformCommission = Number(s.platform_commission) || 0;
    // No saved commission?  Apply the source's fee rule directly.
    // Note we don't gate on s.source_type — the rule lookup is keyed
    // on s.source, so misrecorded source_type rows still get the
    // correct platform commission deducted.
    if (!platformCommission) {
      const rule = EXTERNAL_SOURCE_FEE_RULE[s.source as string];
      if (rule) platformCommission = commissionFor(rule, gross);
    }
    const groomerCommission = Number(s.groomer_commission) || 0;
    bucket.count += 1;
    bucket.gross += gross;
    if (isVendorPrepaid(s)) {
      // Vendor-prepaid row — Sniffy didn't hold gross; the partner
      // owes Sniffy everything after their own platform cut.
      // (groomerCommission is Sniffy's internal cost paid from that
      // amount — it doesn't reduce what the vendor owes us.)
      bucket.vendorPrepaidCount += 1;
      bucket.vendorOwed += Math.max(0, gross - platformCommission);
    } else {
      // Sniffy-collected row (incl. groomer-cash) — full pre-payroll
      // keep is gross − platform commission − groomer commission.
      bucket.net += gross - platformCommission - groomerCommission;
    }
    buckets.set(sourceKey, bucket);
  }

  // External platforms first (by gross desc), then internal sources —
  // matches how the coordinator mentally groups the day.
  const rows = Array.from(buckets.values()).sort((a, b) => {
    if (a.isExternal !== b.isExternal) return a.isExternal ? -1 : 1;
    return b.gross - a.gross;
  });

  const totalOrders     = sessions.length;
  const totalGross      = rows.reduce((s, r) => s + r.gross, 0);
  const totalNet        = rows.reduce((s, r) => s + r.net, 0);
  const totalVendorOwed = rows.reduce((s, r) => s + r.vendorOwed, 0);
  return { totalOrders, totalGross, totalNet, totalVendorOwed, rows };
}

// ─── Per-source breakup for upcoming (not-yet-groomed) sessions ─
//
// Same grouping grammar as computeDaySummary, but the numbers are an
// estimate rather than a fact: nothing has been collected or reconciled
// yet, so there's no net/commission split — just how many are coming in
// from each source and the booking amount they're expected to bring.
type UpcomingRow = {
  key: string;
  label: string;
  isExternal: boolean;
  count: number;
  /** Estimated gross booking amount — not yet collected or reconciled. */
  gross: number;
};

function computeUpcomingRollup(sessions: GroomingSession[]): UpcomingRow[] {
  const buckets = new Map<string, UpcomingRow>();
  for (const s of sessions) {
    const key = s.source ?? 'unknown';
    const row = buckets.get(key) ?? {
      key,
      label:      resolveSourceLabel(s.source),
      isExternal: isExternalSource(s.source),
      count: 0,
      gross: 0,
    };
    row.count += 1;
    row.gross += Number(s.booking_amount) || 0;
    buckets.set(key, row);
  }
  return Array.from(buckets.values()).sort((a, b) => {
    if (a.isExternal !== b.isExternal) return a.isExternal ? -1 : 1;
    return b.gross - a.gross;
  });
}

// Builds the WhatsApp-shareable daily report and opens wa.me with
// it prefilled.  Format mirrors the inline card so what the
// coordinator sees is what their team receives.
function shareDaySummary(day: Date, sessions: GroomingSession[]) {
  const dateLabel = day.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  // The headline counts WORK DONE — completed plus groomed-but-unsettled
  // — not just the reconciled rows.  Both are pets that were groomed
  // that day; whether the money has landed is a separate question, and
  // the breakup below answers it.  ("Total Orders - 0" on a day with six
  // groomed sessions was true of the old completed-only count and told
  // the reader nothing.)
  //
  // The financial per-source rows below stay strictly `completed`, same
  // as the card: their net is a fact.  Groomed rows have their own
  // section with what is still owed and who is holding it, so no rupee
  // is reported in both places.
  //
  // Note this also fixes an older bug.  The function was handed every
  // row on the day and fed the lot to computeDaySummary, so leads and
  // cancelled sessions counted toward the total and their booking
  // amounts toward the shared net — while the card on screen showed
  // completed only.  Two different numbers for the same day, and the
  // WhatsApp one is the one the team acts on.
  const completed = sessions.filter(s => s.status === 'completed');
  const groomed   = sessions.filter(s => s.status === 'grooming_done');
  const upcoming  = sessions.filter(s =>
    s.status === 'scheduled' || s.status === 'groomer_assigned',
  );
  const { totalOrders, totalNet, totalVendorOwed, rows } = computeDaySummary(completed);
  const outstanding  = computeOutstanding(groomed);
  const totalSessions = totalOrders + groomed.length;

  const lines: string[] = [];
  lines.push(`Daily Summary - ${dateLabel}`);
  lines.push('--------------------------------');
  lines.push(`Total Sessions - ${totalSessions}`);
  // Always show the split, even when one side is zero: the whole point
  // of the headline is that it merges two states, so the reader needs
  // to see the merge without doing arithmetic.
  lines.push(`  Completed (settled) - ${totalOrders}`);
  lines.push(`  Groomed (payment pending) - ${groomed.length}`);
  // Only when it applies — on a past day there should be none, and a
  // permanent "Upcoming - 0" line is noise.  Without it, sharing a
  // future or part-finished day would report "Total Sessions - 0" with
  // nothing to explain the empty day.
  if (upcoming.length > 0) {
    lines.push(`  Upcoming (not yet groomed) - ${upcoming.length}`);
  }

  if (rows.length > 0) {
    lines.push('');
    lines.push('Completed breakup:');
    for (const r of rows) {
      // Per-source line: "Woofly: 5nos - ₹2,400 (₹3,000)"
      // If any rows in this bucket were vendor-prepaid, annotate so the
      // reader doesn't mistake the partner-side gross for Sniffy cash.
      const annotation =
        r.vendorPrepaidCount > 0
          ? ` [${r.vendorPrepaidCount} prepaid by vendor · owes ${fmtCurrency(r.vendorOwed)}]`
          : '';
      lines.push(
        `${r.label}: ${r.count}nos - ${fmtCurrency(r.net)} (${fmtCurrency(r.gross)})${annotation}`,
      );
    }
    lines.push('');
    lines.push(`Sniffy net (cash collected) - ${fmtCurrency(totalNet)}`);
    if (totalVendorOwed > 0) {
      lines.push(`Vendor receivable - ${fmtCurrency(totalVendorOwed)}`);
    }
  }

  // Groomed but unsettled — the day's open money, itemised by who is
  // holding it so the report is directly actionable.
  if (groomed.length > 0) {
    lines.push('');
    lines.push(`Groomed breakup (payment pending) - ${groomed.length}nos`);
    for (const r of outstanding.rows) {
      lines.push(`${r.label}: ${r.count}nos - ${fmtCurrency(r.amount)} (${r.note})`);
    }
    if (outstanding.total > 0) {
      lines.push(`Total outstanding - ${fmtCurrency(outstanding.total)}`);
    }
    if (outstanding.readyToClose > 0) {
      lines.push(`Paid, ready to close - ${outstanding.readyToClose}nos`);
    }
  }

  const text = lines.join('\n');
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// ─── Inline day-summary card ────────────────────────────────
//
// Compact card rendered above the bottom action area so the
// coordinator can see the day's takeaway without opening WhatsApp.
// Each source is a single row: label · count · net (gross).
// The header shows total orders; the footer shows total receivable.
// Generalised summary card.  Used in three places:
//   • day popup           → title="Day Summary",     showEmpty=false
//   • calendar (month)    → title="Financials",      subtitle="May 2026"
//   • calendar (week)     → title="Financials",      subtitle="May 18 – 24"
// `showEmpty` controls whether an empty state renders when the input
// has zero sessions — the day popup hides itself in that case (other
// content fills the space), while the calendar's period card stays
// visible with an "No bookings yet" message so the section isn't
// silently missing.
function SummaryCard({
  sessions, title = 'Day Summary', subtitle, showEmpty = false, showTitle = true, art = false,
  dateFrom, dateTo, groomerName, onNavigate,
}: {
  sessions: GroomingSession[];
  title?: string;
  subtitle?: string;
  showEmpty?: boolean;
  /** Suppress the card's own title when the surrounding section already
   *  carries one — otherwise "Financials" is printed twice, ~30px apart. */
  showTitle?: boolean;
  /** Decorative corner photo. Off by default so the day-detail sheet, which
   *  renders this same component inside a modal, stays plain. */
  art?: boolean;
  /** Inclusive session_date bounds matching `sessions` — passed straight
   *  through to the Sessions-tab click-throughs below so "24 groomed"
   *  opens the same 24 rows, not every grooming_done session ever. Both
   *  must be set for the orange/blue strips to become clickable. */
  dateFrom?: string;
  dateTo?: string;
  /** Groomer the card is currently scoped to, if any (calendar's groomer
   *  filter) — folded into the click-through so the destination list
   *  matches what's on screen. */
  groomerName?: string;
  onNavigate?: (tab: 'sessions', filter?: SessionsInitialFilters) => void;
}) {
  // Split by status into the three states the card reports on.  The
  // financial rows stay strictly `completed`: that status means the
  // money is reconciled, and it is the only bucket whose net is a fact
  // rather than an expectation.  Groomed-but-unsettled work gets its
  // own strip below with what is owed and who is holding it; still-to-
  // come work keeps the blue estimate strip it always had.
  const completed = sessions.filter(s => s.status === 'completed');
  const groomed   = sessions.filter(s => s.status === 'grooming_done');
  const pending   = sessions.filter(s =>
    s.status === 'scheduled' || s.status === 'groomer_assigned',
  );

  if (sessions.length === 0 && !showEmpty) return null;

  const { totalOrders, totalNet, totalVendorOwed, rows } = computeDaySummary(completed);
  const outstanding    = computeOutstanding(groomed);
  const upcomingRollup = computeUpcomingRollup(pending);
  const pendingGross   = pending.reduce((s, x) => s + (Number(x.booking_amount) || 0), 0);

  // Click-through to the same rows on the Sessions tab. Requires both date
  // bounds — without them a click would jump to every session with that
  // status ever recorded rather than just what this card is showing.
  const canDrillDown = !!onNavigate && !!dateFrom && !!dateTo;
  function goToSessions(status: SessionStatus | SessionStatus[]) {
    if (!canDrillDown) return;
    onNavigate!('sessions', {
      status, dateFrom, dateTo,
      ...(groomerName ? { groomer: groomerName } : {}),
    });
  }

  // Same visual grammar as the calendar grid: the mix bar splits
  // completed (green) from groomed-unsettled (orange) from upcoming
  // (blue), and each source gets a bar drawn from the day-load purple
  // ramp so revenue share reads without arithmetic.
  //
  // Percentages are left unrounded on purpose.  Rounding three shares
  // to whole numbers lets them sum to 101% and, with two 2px gaps in a
  // flex row, push the last segment under the container's overflow clip
  // — the bar would silently lose its blue tip on certain mixes.
  const totalSessions = totalOrders + groomed.length + pending.length;
  const pctOf = (n: number) => (totalSessions > 0 ? (n / totalSessions) * 100 : 0);
  const donePct    = pctOf(totalOrders);
  const groomedPct = pctOf(groomed.length);
  const upcomingPct = pctOf(pending.length);
  const maxNet   = Math.max(...rows.map(r => r.net), 1);

  return (
    <div className="relative overflow-hidden rounded-[18px] border border-[#eceaf4] bg-[#fbfbfd] p-4">
      {/* Corner art, same construction as the marketing package cards: photo
          layer → mask → card-colour wash. The amounts in this card are
          right-aligned and sit directly over the corner, so the wash is what
          keeps them readable rather than crushing the photo's opacity —
          0.09 with a heavy wash (the first attempt) was invisible. */}
      {art && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            // Sized off the card's HEIGHT with the photo's own 4:3 aspect, so
            // the box can never be a different shape from the image no matter
            // how tall the card gets (Period mode is far taller than Day).
            // Height-driven also means it always fits vertically instead of
            // overflowing and being clipped by the card's rounded corners.
            // 82% rather than full height keeps the wedge clear of the month
            // heading and the net total along the top of the card.
            className="absolute bottom-0 right-0 h-[82%] aspect-[4/3] bg-no-repeat"
            style={{
              backgroundImage:  `url(${FINANCIALS_ART})`,
              // Box and image share an aspect ratio, so `cover` fits exactly:
              // the whole photo is shown, nothing is cropped, and the image
              // edges sit on the box edges where the mask has reached zero.
              backgroundSize:     'cover',
              backgroundPosition: 'center',
              // Watermark strength, not photo strength. Desaturating first is
              // what keeps it feeling warm rather than grey at this opacity:
              // pulling colour out lets the remaining tone stay a shade of the
              // card instead of a washed-out picture, and the fur detail —
              // which is what actually collides with digits — softens with it.
              opacity:            0.44,
              filter:             'saturate(0.5) contrast(0.9)',
              maskImage:        FINANCIALS_ART_MASK,
              WebkitMaskImage:  FINANCIALS_ART_MASK,
            }}
          />
          <div className="absolute inset-0" style={{ background: FINANCIALS_ART_WASH }}/>
        </div>
      )}

      <div className="relative">
      {/* Header — scope + headline net, with the same green/blue split
          bar the calendar cells use so the two read as one system. */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="min-w-0 flex-1">
          {showTitle && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {title}
            </p>
          )}
          {subtitle && (
            <p className="text-[15px] sm:text-[17px] font-extrabold text-gray-900 truncate leading-tight mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {rows.length > 0 && (
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Sniffy net
            </p>
            <p className="text-[20px] sm:text-[24px] font-extrabold text-sniffy-purple tabular-nums leading-none mt-0.5">
              {fmtCurrency(totalNet)}
            </p>
          </div>
        )}
      </div>

      {/* Session mix — labelled counts first, bar second.  The bar is
          reinforcement, never the only way to read the number. */}
      {totalSessions > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="inline-flex items-center gap-1.5" style={{ color: DONE_COLOR }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: DONE_COLOR }}/>
              {totalOrders} completed
            </span>
            {groomed.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-orange-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: PENDING_FILL }}/>
                {groomed.length} groomed
              </span>
            )}
            {pending.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: UPCOMING_FILL }}/>
                {pending.length} upcoming
              </span>
            )}
          </div>
          <div className="mt-1.5 h-[6px] rounded-full bg-[#eeecf6] overflow-hidden flex gap-[2px]"
            title={`${totalOrders} completed · ${groomed.length} groomed, unsettled · ${pending.length} upcoming`}
          >
            {totalOrders > 0 && (
              <span className="rounded-full" style={{ width: `${donePct}%`, background: DONE_COLOR }}/>
            )}
            {groomed.length > 0 && (
              <span className="rounded-full" style={{ width: `${groomedPct}%`, background: PENDING_FILL }}/>
            )}
            {pending.length > 0 && (
              <span className="rounded-full" style={{ width: `${upcomingPct}%`, background: UPCOMING_FILL }}/>
            )}
          </div>
        </div>
      )}

      {rows.length === 0 && groomed.length === 0 && pending.length === 0 ? (
        <p className="text-[12px] text-gray-400 italic text-center py-3">
          No bookings in this range yet.
        </p>
      ) : (
        <>
          {/* ── Completed sessions — real financials ── */}
          {rows.length > 0 && (
            <>
              <div className="space-y-0.5">
                {rows.map(r => {
                  const share = r.net / maxNet;
                  return (
                    <div key={r.key} className="relative rounded-lg overflow-hidden px-2 py-1.5 leading-tight">
                      {/* Revenue share reads as a soft band *behind* the row
                          rather than a rule beneath it.  A full-width bar
                          directly under a label reads as an underline or a
                          divider, not as data — and the solid purple made
                          five of them look like the row separators of a
                          table.  Kept faint on purpose: it ranks the sources
                          at a glance, the figures beside it stay the source
                          of truth. */}
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500"
                        style={{
                          width: `${Math.max(share * 100, r.net > 0 ? 4 : 0)}%`,
                          background: 'rgba(69,26,139,0.07)',
                        }}
                      />

                      <div className="relative flex items-baseline justify-between gap-2">
                        <span className="text-[12px] font-semibold text-gray-700 truncate pr-1">
                          {r.label}
                          <span className="text-gray-400 font-medium"> · {r.count}</span>
                        </span>
                        <span className="text-[12px] font-bold text-gray-900 tabular-nums whitespace-nowrap">
                          {fmtCurrency(r.net)}
                          <span className="text-gray-400 font-normal"> ({fmtCurrency(r.gross)})</span>
                        </span>
                      </div>

                      {r.vendorPrepaidCount > 0 && (
                        <div className="relative flex items-center justify-between mt-1">
                          <span className="text-[10.5px] text-gray-400">
                            ↳ {r.vendorPrepaidCount} prepaid by vendor
                          </span>
                          <span className="text-[10.5px] font-semibold text-sniffy-purple tabular-nums">
                            owes {fmtCurrency(r.vendorOwed)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalVendorOwed > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#eceaf4] flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9a93b5]">
                    Vendor receivable
                  </span>
                  <span className="text-[12px] font-extrabold text-sniffy-purple/80 tabular-nums">
                    +{fmtCurrency(totalVendorOwed)}
                  </span>
                </div>
              )}
            </>
          )}

          {/* ── Groomed, not settled — money owed on finished work ──
              The point of the whole status.  Grouped by who is holding
              the cash rather than by source, because that is who gets
              chased.  Sits above the blue strip: this is real money on
              work already delivered, the blue strip below is a forecast. */}
          {groomed.length > 0 && (
            <div
              role={canDrillDown ? 'button' : undefined}
              tabIndex={canDrillDown ? 0 : undefined}
              onClick={() => goToSessions('grooming_done')}
              onKeyDown={e => { if (canDrillDown && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); goToSessions('grooming_done'); } }}
              title={canDrillDown ? 'View these sessions' : undefined}
              className={`rounded-[12px] bg-orange-50/95 border border-orange-200/80 px-3 py-2.5 ${rows.length > 0 ? 'mt-3' : ''} ${canDrillDown ? 'cursor-pointer transition hover:bg-orange-100/80 hover:border-orange-300' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11.5px] font-bold text-orange-700">
                    {groomed.length} groomed · payment not settled
                  </p>
                  <p className="text-[10px] text-orange-500 mt-0.5">
                    Work done — not marked complete yet
                  </p>
                </div>
                {outstanding.total > 0 && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-orange-400">
                      Outstanding
                    </p>
                    <p className="text-[13px] font-extrabold text-orange-600 tabular-nums leading-none mt-0.5">
                      {fmtCurrency(outstanding.total)}
                    </p>
                  </div>
                )}
              </div>

              {outstanding.rows.length > 0 && (
                <div className="mt-2 pt-2 border-t border-orange-200/70 space-y-1">
                  {outstanding.rows.map(r => (
                    <div key={r.key} className="flex items-baseline justify-between gap-2">
                      <span className="text-[11.5px] font-semibold text-orange-900/80 truncate pr-1">
                        {r.label}
                        <span className="text-orange-400 font-medium"> · {r.count}</span>
                        <span className="text-orange-400 font-normal"> · {r.note}</span>
                      </span>
                      <span className="text-[11.5px] font-bold text-orange-700 tabular-nums whitespace-nowrap">
                        {fmtCurrency(r.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Money already verified — only the status flip is left.
                  Called out separately so it never reads as debt. */}
              {outstanding.readyToClose > 0 && (
                <p className="text-[10px] text-orange-500 mt-2 pt-2 border-t border-orange-200/70">
                  {outstanding.readyToClose} of these {outstanding.readyToClose === 1 ? 'is' : 'are'} paid
                  in full — ready to mark complete.
                </p>
              )}
            </div>
          )}

          {/* ── Pending / upcoming sessions — expected, not yet done ──
              Per-source breakup mirrors the completed rows above so
              "who's it coming from, how much" reads the same way in
              both states — the whole card only differed here before. */}
          {pending.length > 0 && (
            <div
              role={canDrillDown ? 'button' : undefined}
              tabIndex={canDrillDown ? 0 : undefined}
              onClick={() => goToSessions(['scheduled', 'groomer_assigned'])}
              onKeyDown={e => { if (canDrillDown && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); goToSessions(['scheduled', 'groomer_assigned']); } }}
              title={canDrillDown ? 'View these sessions' : undefined}
              className={`rounded-[12px] bg-blue-50/95 border border-blue-100/80 px-3 py-2.5 ${rows.length > 0 || groomed.length > 0 ? 'mt-3' : ''} ${canDrillDown ? 'cursor-pointer transition hover:bg-blue-100/80 hover:border-blue-300' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11.5px] font-bold text-blue-700">
                    {pending.length} upcoming session{pending.length === 1 ? '' : 's'}
                  </p>
                  <p className="text-[10px] text-blue-500 mt-0.5">
                    Scheduled · not yet groomed
                  </p>
                </div>
                <p className="text-[13px] font-extrabold text-blue-600 tabular-nums">
                  est. {fmtCurrency(pendingGross)}
                </p>
              </div>

              {upcomingRollup.length > 0 && (
                <div className="mt-2 pt-2 border-t border-blue-200/70 space-y-1">
                  {upcomingRollup.map(r => (
                    <div key={r.key} className="flex items-baseline justify-between gap-2">
                      <span className="text-[11.5px] font-semibold text-blue-900/80 truncate pr-1">
                        {r.label}
                        <span className="text-blue-400 font-medium"> · {r.count}</span>
                      </span>
                      <span className="text-[11.5px] font-bold text-blue-700 tabular-nums whitespace-nowrap">
                        est. {fmtCurrency(r.gross)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edge case: work on the books but nothing reconciled yet, so
              the per-source financial rows above are empty.  Covers the
              groomed-but-unsettled case too — otherwise a range holding
              only orange sessions showed the strip with no explanation
              of why there were no financials to go with it.

              gray-500 rather than -400: this line lands low in the card,
              which is exactly where the corner art still has some tone left
              in it.  Light italic grey over fur was the one string that
              went thin once the photo was faded back. */}
          {rows.length === 0 && (groomed.length > 0 || pending.length > 0) && (
            <p className="text-[10.5px] text-gray-500 italic text-center mt-2.5">
              No completed sessions yet — financials appear once sessions are marked complete.
            </p>
          )}
        </>
      )}
      </div>
    </div>
  );
}

// Thin alias kept so the day popup call site stays readable; same
// component, different defaults.
function DaySummaryCard({ sessions, dateISO, groomerName, onNavigate }: {
  sessions: GroomingSession[];
  dateISO?: string;
  groomerName?: string;
  onNavigate?: (tab: 'sessions', filter?: SessionsInitialFilters) => void;
}) {
  return (
    <SummaryCard
      sessions={sessions}
      title="Day Summary"
      dateFrom={dateISO}
      dateTo={dateISO}
      groomerName={groomerName}
      onNavigate={onNavigate}
    />
  );
}

// ─── Groomer summary panel ───────────────────────────────────
//
// Rendered below the calendar grid when the coordinator picks a single
// groomer from the filter dropdown.  Pulls together two things that
// were previously only visible as small chips inside the cells:
//
//   • Leave breakdown for the viewed month — paid used, LWP, pending,
//     remaining quota.  Same numbers the Mark-Attendance modal uses.
//   • Incentive earned — On-time bonus (₹25 per session arrived in
//     window + coordinator-approved) + Review bonus (₹40 per 5★
//     review).  Constants and per-session eligibility live in
//     `groomer/incentivesApi.ts` — the single source of truth.  The
//     groomer-side Earnings tab renders the same numbers because it
//     uses the same helpers.
//
// Pending amounts (claimed but coordinator hasn't approved yet) are
// rendered alongside the approved totals so coordinators know what's
// still in their queue.
function GroomerSummaryPanel({
  groomer, periodSessions, leaves,
  viewYear, viewMonth, periodLabel,
}: {
  groomer: Groomer;
  /** Sessions scoped to the calendar's current period AND this
   *  groomer (the parent already applied the groomer filter). */
  periodSessions: GroomingSession[];
  /** All leaves for this groomer (any month). */
  leaves: GroomerLeave[];
  viewYear: number;
  viewMonth: number;  // 0-indexed
  periodLabel: string;
}) {
  const leaveStats = useMemo(
    () => getMonthlyLeaveStats(leaves, viewYear, viewMonth),
    [leaves, viewYear, viewMonth],
  );

  // Only delivered sessions are eligible for the bonus — scheduled /
  // cancelled rows shouldn't ever surface a milestone-approved state,
  // but filter defensively so the count line matches reality.
  //
  // `grooming_done` counts here for the same reason it counts in
  // compute_payroll_entry (migration 20260816000000): the groomer did
  // the job, and what they earn cannot depend on whether a partner
  // platform has settled with us.  These two MUST agree — if this list
  // and the payroll function disagree, the incentive total a
  // coordinator reads on screen is not the one that lands on the slip.
  const completed = useMemo(
    () => periodSessions.filter(s =>
      s.status === 'completed' || s.status === 'grooming_done'),
    [periodSessions],
  );
  const totalDone = completed.length;

  // Aggregate via the shared helper — same code path used by the
  // groomer earnings tab and the milestone approvals rail.
  const inc = useMemo(
    () => sumIncentivesOverSessions(completed),
    [completed],
  );

  const monthLabel = new Date(viewYear, viewMonth, 1)
    .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <section
      className="mt-4 sm:mt-5 rounded-3xl border border-purple-100 bg-white overflow-hidden"
      style={{ boxShadow: '0 6px 24px rgba(69,26,139,0.06)' }}
    >
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 bg-gradient-to-r from-purple-50/80 to-white border-b border-purple-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-sniffy-purple/10 grid place-items-center text-sniffy-purple shrink-0">
          <Users size={15}/>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sniffy-purple">
            Groomer Summary
          </p>
          <p className="text-sm font-extrabold text-gray-900 truncate">
            {groomer.name}
            <span className="text-gray-400 font-medium"> · {periodLabel}</span>
          </p>
        </div>
      </div>

      {/* Leave breakdown — monthly bucket of the viewed month */}
      <div>
        <div className="px-4 sm:px-5 pt-3 pb-1 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
            <CalendarOff size={11}/> Leaves · {monthLabel}
          </p>
          {leaveStats.exhausted && (
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              Quota done
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 divide-x divide-gray-100 px-1 pb-1">
          <LeaveStatCell color="#059669" label="Paid Used"  value={leaveStats.paidUsed}  sub={`of ${leaveStats.quota}`}/>
          <LeaveStatCell color="#7c3aed" label="LWP"        value={leaveStats.lwp}        sub="unpaid"/>
          <LeaveStatCell color="#ea580c" label="Pending"    value={leaveStats.pending}    sub="awaiting"/>
          <LeaveStatCell
            color={leaveStats.remaining <= 0 ? '#dc2626' : '#475569'}
            label="Remaining"
            value={leaveStats.remaining}
            sub="paid left"
          />
        </div>
      </div>

      {/* Incentive — period-scoped (month or week, matches the calendar view) */}
      <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gradient-to-br from-emerald-50/40 to-white">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-100 grid place-items-center text-emerald-700 shrink-0">
              <Sparkles size={14}/>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                Incentive · {periodLabel}
              </p>
              <p className="text-[11px] text-gray-500">
                {totalDone} completed session{totalDone === 1 ? '' : 's'}
                {' · '}
                {inc.onTimeApprovedCount} on-time · {inc.reviewApprovedCount} review
                {inc.pendingTotal > 0 && (
                  <span className="text-amber-700"> · {fmtCurrency(inc.pendingTotal)} pending</span>
                )}
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 tabular-nums shrink-0">
            {fmtCurrency(inc.earnedTotal)}
          </p>
        </div>

        {totalDone === 0 ? (
          <p className="text-[11px] text-gray-400 italic px-1">
            No completed sessions in this period yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <IncentiveCell
              label="On-time Bonus"
              count={inc.onTimeApprovedCount}
              rate={ON_TIME_BONUS}
              amount={inc.onTimeApprovedAmount}
              pendingCount={inc.onTimePendingCount}
              pendingAmount={inc.onTimePendingAmount}
            />
            <IncentiveCell
              label="Review Bonus"
              count={inc.reviewApprovedCount}
              rate={REVIEW_BONUS}
              amount={inc.reviewApprovedAmount}
              pendingCount={inc.reviewPendingCount}
              pendingAmount={inc.reviewPendingAmount}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function LeaveStatCell({
  color, label, value, sub,
}: { color: string; label: string; value: number; sub: string; }) {
  return (
    <div className="px-2 py-2.5 text-center">
      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-extrabold leading-none tabular-nums" style={{ color }}>
        {value}
      </p>
      <p className="text-[9px] text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function IncentiveCell({
  label, count, rate, amount, pendingCount, pendingAmount,
}: {
  label: string;
  count: number;
  rate: number;
  amount: number;
  pendingCount?: number;
  pendingAmount?: number;
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 px-2 py-2 text-center">
      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-[11px] font-extrabold text-gray-900 mt-0.5 tabular-nums">
        {count} × {fmtCurrency(rate)}
      </p>
      <p className="text-[12px] font-extrabold text-emerald-700 tabular-nums mt-0.5">
        {fmtCurrency(amount)}
      </p>
      {pendingCount && pendingCount > 0 ? (
        <p className="text-[9px] text-amber-700 tabular-nums mt-1">
          +{pendingCount} pending · {fmtCurrency(pendingAmount ?? 0)}
        </p>
      ) : null}
    </div>
  );
}

// ─── Financials panel (lives below the calendar grid) ───────
//
// Lets the coordinator drill into the per-source rollup at three
// granularities:
//
//   • "Period"  — default; mirrors whatever the top calendar shows
//                 (month or week).  Subtitle = "May 2026" / "May 18–24".
//   • "Day"     — single date picker; useful for spot-checking a past
//                 day without opening the full day popup.
//   • "Range"   — custom from/to inputs; perfect for ad-hoc reports
//                 like "last 10 days" or "this fortnight".
//
// All modes share the same SummaryCard renderer so the numbers stay
// consistent with the day popup's inline summary.
function FinancialsPanel({
  allSessions, periodSessions, periodLabel, periodStartISO, periodEndISO,
  defaultDayISO, groomerName, onNavigate,
}: {
  /** All groomer-filtered sessions, unscoped by date — Day / Range
   *  modes filter against this. */
  allSessions: GroomingSession[];
  /** Sessions already scoped to the calendar's current view (month/
   *  week).  Used directly when mode === 'period'. */
  periodSessions: GroomingSession[];
  /** Label shown in 'period' mode — e.g. "May 2026" or "May 18 – 24". */
  periodLabel: string;
  /** Inclusive bounds behind `periodSessions` — needed (not just the
   *  human label) so 'period' mode's click-throughs can seed the same
   *  date range on the Sessions tab. */
  periodStartISO: string;
  periodEndISO:   string;
  /** Reasonable Day-mode default — today, or the cursor's current day. */
  defaultDayISO: string;
  /** Groomer the calendar is currently filtered to, if any. */
  groomerName?: string;
  onNavigate?: (tab: 'sessions', filter?: SessionsInitialFilters) => void;
}) {
  type Mode = 'period' | 'day' | 'range';
  const [mode, setMode] = useState<Mode>('period');
  const [day,   setDay]   = useState<string>(defaultDayISO);
  const [from,  setFrom]  = useState<string>(defaultDayISO);
  const [to,    setTo]    = useState<string>(defaultDayISO);

  const { sessions, subtitle, dateFrom, dateTo } = useMemo(() => {
    if (mode === 'period') {
      return { sessions: periodSessions, subtitle: periodLabel, dateFrom: periodStartISO, dateTo: periodEndISO };
    }
    if (mode === 'day') {
      const filtered = allSessions.filter(s => s.session_date === day);
      const label = day
        ? new Date(day + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
        : 'Pick a date';
      return { sessions: filtered, subtitle: label, dateFrom: day, dateTo: day };
    }
    // range
    const [start, end] = from <= to ? [from, to] : [to, from];
    const filtered = allSessions.filter(s => !!s.session_date && s.session_date >= start && s.session_date <= end);
    const label = start && end
      ? `${new Date(start + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${new Date(end + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
      : 'Pick a range';
    return { sessions: filtered, subtitle: label, dateFrom: start, dateTo: end };
  }, [mode, periodSessions, periodLabel, periodStartISO, periodEndISO, allSessions, day, from, to]);

  const modeBtnCls = (m: Mode) =>
    `px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
      mode === m
        ? 'bg-sniffy-purple text-white'
        : 'text-[#9a93b5] hover:text-sniffy-purple'
    }`;

  return (
    <section className="mt-4 sm:mt-5 space-y-2.5">
      {/* Header — label and scope switcher share one line, matching the
          calendar toolbar's rhythm above. */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Financials
        </p>
        <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full bg-white border border-[#eceaf4]">
          <button type="button" onClick={() => setMode('period')} className={modeBtnCls('period')}>Period</button>
          <button type="button" onClick={() => setMode('day')}    className={modeBtnCls('day')}>Day</button>
          <button type="button" onClick={() => setMode('range')}  className={modeBtnCls('range')}>Range</button>
        </div>
      </div>

      {/* Mode-specific controls.  Period has none — it inherits the
          calendar's selector at the top of the page.  Day + Range use
          the same SniffyDatePicker the Session form uses, so the look
          & feel matches the rest of the app instead of dropping the
          coordinator into the browser's native date UI. */}
      {mode === 'day' && (
        <div className="flex items-center gap-2.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#9a93b5] flex-shrink-0">Date</label>
          <div className="flex-1 min-w-0">
            <SniffyDatePicker value={day} onChange={setDay}/>
          </div>
        </div>
      )}

      {mode === 'range' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9a93b5] mb-1.5">From</label>
            <SniffyDatePicker value={from} onChange={setFrom}/>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9a93b5] mb-1.5">To</label>
            <SniffyDatePicker value={to} onChange={setTo} align="right"/>
          </div>
        </div>
      )}

      <SummaryCard
        sessions={sessions}
        title="Financials"
        subtitle={subtitle}
        dateFrom={dateFrom}
        dateTo={dateTo}
        groomerName={groomerName}
        onNavigate={onNavigate}
        showEmpty
        showTitle={false}
        art
      />
    </section>
  );
}

// ─── Expandable session card ──────────────────────────────────
//
// Click the header → card expands inline to show the full picture
// (phone, address, breakdown, groomer flow milestones, medical, notes).
// "Edit" button inside the expanded panel opens the master
// SessionFormModal for full edits.

function SessionCardExpandable({
  session, pets, allowed, onEdit, onDelete,
}: { session: GroomingSession; pets?: DisplayPet[]; allowed: boolean; onEdit: () => void; onDelete: () => void; }) {
  const [open, setOpen] = useState(false);
  const s = session;

  // Pricing breakdown — same logic the groomer's payment modal uses.
  const breakdown = (s.booking_amount_expr ?? '')
    .split('+').map(p => Number(p.trim()))
    .filter(n => !Number.isNaN(n) && n > 0);

  // Milestone snapshot helpers
  const arrival =
    s.arrival_bonus_status === 'approved' ? '✓ On-time bonus approved' :
    s.arrival_bonus_status === 'pending'  ? '⏳ Awaiting approval' :
    s.arrival_bonus_status === 'rejected' ? '✗ Rejected' :
    s.arrival_marked_at ? (wasArrivedInWindow(s) ? 'Marked on-time' : 'Marked late') :
    '— Not marked';
  const groomerComplete = s.groomer_marked_complete_at ? '✓ Done' : '— Pending';
  const payment = s.payment_collected_at
    ? `${s.payment_mode === 'online' ? 'Online' : 'Cash'} · ₹${Number(s.total_collected ?? 0).toLocaleString('en-IN')}`
    : '— Not collected';
  const review =
    s.review_taken && s.client_rating != null ? `★ ${s.client_rating}/5` :
    s.review_claim_status === 'pending'       ? '⏳ Awaiting approval' :
    s.review_claim_status === 'rejected'      ? '✗ Rejected' :
    '— Not collected';

  return (
    <div
      className={`rounded-xl border transition ${
        open ? 'border-purple-200 bg-purple-50/30' : 'border-gray-100 bg-white hover:border-purple-200'
      }`}
    >
      {/* Header row — always visible, click to toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-3 py-2.5 active:scale-[0.99] transition"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-extrabold text-gray-900 truncate">
            {s.pet_parent_name}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <PaymentStatusBadge session={s} variant="short"/>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${statusBg(s.status)}`}>
              {s.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        {pets && pets.length > 1 ? (
          <div className="mt-0.5">
            {s.scheduled_time && <p className="text-[11px] text-gray-500">{s.scheduled_time}</p>}
            <SessionPetLines pets={pets} showAmounts className="mt-0.5"/>
          </div>
        ) : (
        <p className="text-[11px] text-gray-500 mt-0.5">
          {s.scheduled_time ? `${s.scheduled_time} · ` : ''}{s.breed ?? 'Unknown'}{s.package ? ` · ${s.package}` : ''}
        </p>
        )}
        <div className="flex items-center justify-between gap-2 mt-1">
          {s.groomer_name ? (
            <p className="text-[10px] text-sniffy-purple font-bold truncate">
              🧴 {s.groomer_name}
            </p>
          ) : <span className="text-[10px] text-gray-300 italic">unassigned</span>}
          <span className="text-[10px] text-gray-400 inline-flex items-center gap-0.5 shrink-0">
            {open ? 'Hide' : 'Details'} {open ? <ChevronUp size={10}/> : <ChevronDown size={10}/>}
          </span>
        </div>
      </button>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-2.5">

              {/* Completion code — coordinator-only, tap-to-copy. */}
              {s.completion_code && (
                <CompletionCodePill
                  code={s.completion_code}
                  size="lg"
                  hint="Send on WhatsApp. Groomer asks customer at session end."
                />
              )}

              {/* If completed via the groomer's photo fallback, surface it
                  here too — useful audit info for the coordinator. */}
              {s.completion_method === 'photo' && s.completion_photo_url && (
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1.5 text-[11px]">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    Completion proof (photo fallback)
                  </p>
                  <a href={s.completion_photo_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={s.completion_photo_url}
                      alt="Completion proof"
                      className="w-full max-h-40 object-cover rounded-md border border-gray-200"
                    />
                  </a>
                </div>
              )}

              {/* Medical alert */}
              {s.medical_issues && (
                <div className="rounded-lg bg-orange-50 border border-orange-100 px-2.5 py-1.5 text-[11px] text-orange-800">
                  <b>Medical:</b> {s.medical_issues}
                </div>
              )}

              {/* Contact */}
              <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                {s.phone && <DetailRow label="Phone"   value={s.phone}/>}
                {s.address && <DetailRow label="Address" value={s.address}/>}
                {s.pet_age && <DetailRow label="Pet age" value={s.pet_age}/>}
              </div>

              {/* Add-ons */}
              {!(pets && pets.length > 1) && (s.add_ons ?? []).length > 0 && (
                <div className="text-[11px]">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Add-ons</p>
                  <div className="flex flex-wrap gap-1">
                    {s.add_ons!.map((a, i) => (
                      <span key={i} className="inline-block text-[10px] font-semibold text-sniffy-purple bg-purple-50 px-1.5 py-0.5 rounded">
                        {a}{breakdown[i + 1] ? ` · ₹${breakdown[i + 1]}` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              {s.booking_amount > 0 && (
                <div className="rounded-lg bg-white border border-gray-100 px-2.5 py-2 text-[11px] space-y-0.5">
                  <Money label="Booking"   value={s.booking_amount}/>
                  {s.platform_commission > 0 && <Money label="Platform fee" value={-s.platform_commission} negative/>}
                  {s.groomer_commission > 0 && <Money label="Groomer cut"  value={-s.groomer_commission}  negative/>}
                  <div className="h-px bg-gray-100 my-1"/>
                  <Money label="Net" value={Number(s.net_booking_amount ?? 0)} bold positive/>
                  {Number(s.total_collected ?? 0) > Number(s.booking_amount ?? 0) && (
                    <Money label={`Collected (incl. upsell + tip)`} value={Number(s.total_collected ?? 0)} bold/>
                  )}
                </div>
              )}

              {/* Groomer-flow milestones snapshot */}
              <div className="rounded-lg bg-white border border-gray-100 px-2.5 py-2 text-[11px] space-y-0.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Groomer flow</p>
                <DetailRow label="Arrived"   value={arrival}/>
                <DetailRow label="Completed" value={groomerComplete}/>
                <DetailRow label="Payment"   value={payment}/>
                <DetailRow label="Review"    value={review}/>
              </div>

              {/* Notes */}
              {s.notes && (
                <div className="text-[11px]">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Internal notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{s.notes}</p>
                </div>
              )}

              {/* Delete + Edit CTAs — Delete 20% width on the left (red),
                  Edit 80% width on the right (purple). Used to remove
                  accidental duplicate entries. */}
              {allowed && (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="basis-1/5 inline-flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-[12px] font-extrabold text-white"
                    style={{ background: 'linear-gradient(145deg, #ef4444 0%, #b91c1c 100%)', boxShadow: '0 4px 14px rgba(185,28,28,0.28)' }}
                    aria-label="Delete session"
                    title="Delete session"
                  >
                    <Trash2 size={12}/>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="basis-4/5 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-extrabold text-white"
                    style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)', boxShadow: '0 4px 14px rgba(69,26,139,0.28)' }}
                  >
                    <Edit3 size={12}/> Edit Session
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string; }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0">{label}</span>
      <span className="text-[11px] font-semibold text-gray-700 text-right break-words">{value}</span>
    </div>
  );
}

function Money({ label, value, bold, positive, negative }: {
  label: string; value: number; bold?: boolean; positive?: boolean; negative?: boolean;
}) {
  const cls =
    positive ? 'text-emerald-700' :
    negative ? 'text-red-500' :
    'text-gray-800';
  return (
    <div className="flex items-center justify-between">
      <span className={`text-gray-500 ${bold ? 'font-extrabold text-gray-900' : ''}`}>{label}</span>
      <span className={`${bold ? 'font-extrabold' : 'font-semibold'} ${cls}`}>
        {value < 0 ? `−₹${Math.abs(value).toLocaleString('en-IN')}` : `₹${value.toLocaleString('en-IN')}`}
      </span>
    </div>
  );
}

function statusBg(status: GroomingSession['status']): string {
  switch (status) {
    case 'completed':        return 'bg-emerald-100 text-emerald-700';
    case 'grooming_done':    return 'bg-orange-100 text-orange-700';
    case 'scheduled':        return 'bg-blue-100 text-blue-700';
    case 'groomer_assigned': return 'bg-indigo-100 text-indigo-700';
    case 'cancelled':        return 'bg-red-100 text-red-700';
    default:                 return 'bg-yellow-100 text-yellow-700';
  }
}

// ─── Coordinator: Mark Attendance modal ───────────────────────

/**
 * Modal for the coordinator to directly mark a groomer's attendance on a
 * given day, without waiting for the groomer to apply.
 *
 *   ▸ Pick a groomer (groomers already with a leave on that day are disabled
 *     — the unique constraint would reject the insert).
 *   ▸ Pick one of three reasons; each row shows the consequence (LWP / Paid)
 *     inline so there's no hidden mapping.
 *   ▸ Optionally add details (free text) — they get appended to the reason.
 *
 * Both the coordinator and the groomer will see the resulting row on their
 * calendars with the matching status colour.
 */
function MarkAttendanceModal({
  date, groomers, existingByGroomer, allLeaves, onClose, onSubmit,
}: {
  date: Date;
  groomers: Groomer[];
  existingByGroomer: Map<string, GroomerLeave>;
  /** Full leaves list (all groomers, all dates).  Used to compute the
   *  selected groomer's monthly paid-leave balance so the modal can
   *  show "X of 4 left" and warn when the bucket is exhausted. */
  allLeaves: GroomerLeave[];
  onClose: () => void;
  onSubmit: (input: {
    groomer_id: string;
    groomer_name: string;
    kind: AttendanceMarkKind;
    details: string;
  }) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [groomerId, setGroomerId] = useState<string>('');
  const [kind, setKind]           = useState<AttendanceMarkKind>('unavailable');
  const [details, setDetails]     = useState('');
  const [busy, setBusy]           = useState(false);

  const selectedGroomer = groomers.find(g => g.id === groomerId);
  const conflict        = groomerId ? existingByGroomer.get(groomerId) : null;

  // ── Monthly paid-leave balance for the selected groomer ──
  //
  // Scoped to the calendar month of `date` (the day being marked), not
  // today's month — coordinators sometimes back-fill prior days, and
  // the bucket they care about is the one the leave will land in.
  // `paidUsed` already counts every approved row (so both 'Coordinator
  // couldn't deploy' and 'Groomer Leave' come out of the same 4-day
  // quota), which matches what Jiten asked for.
  const balanceStats = (() => {
    if (!selectedGroomer) return null;
    const ownLeaves = allLeaves.filter(l => l.groomer_id === selectedGroomer.id);
    return getMonthlyLeaveStats(ownLeaves, date.getFullYear(), date.getMonth());
  })();
  const isPaidKind   = ATTENDANCE_KIND_META[kind].consequence === 'Paid';
  const outOfBalance = !!balanceStats && balanceStats.remaining <= 0 && isPaidKind;

  async function submit() {
    if (!selectedGroomer) { alert('Pick a groomer.'); return; }
    if (conflict) {
      alert(`${selectedGroomer.name} already has a leave entry for this day.`);
      return;
    }
    setBusy(true);
    const res = await onSubmit({
      groomer_id:   selectedGroomer.id,
      groomer_name: selectedGroomer.name,
      kind,
      details:      details.trim(),
    });
    setBusy(false);
    if (res.ok) onClose();
    else alert(res.error ?? 'Could not mark attendance.');
  }

  return (
    <>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity:0, y: 24, scale: 0.97 }}
        animate={{ opacity:1, y: 0, scale: 1 }}
        exit={{ opacity:0, y: 24, scale: 0.97 }}
        className="fixed z-[70] inset-0 grid place-items-center p-4"
      >
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          {/* Hero */}
          <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-purple-50 to-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-sniffy-purple">
                  Mark Attendance
                </p>
                <h3 className="text-xl font-extrabold text-gray-900 leading-tight mt-0.5">
                  {date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Both you and the groomer will see the same record.
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white">
                <X size={18} className="text-gray-400"/>
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-4 space-y-4 overflow-y-auto">
            {/* Groomer picker */}
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Groomer</span>
              <div className="relative mt-1">
                <select
                  value={groomerId}
                  onChange={e => setGroomerId(e.target.value)}
                  className="appearance-none w-full pl-3 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white focus:border-sniffy-purple outline-none"
                >
                  <option value="">— Select a groomer —</option>
                  {groomers.map(g => {
                    const taken = existingByGroomer.has(g.id);
                    return (
                      <option key={g.id} value={g.id} disabled={taken}>
                        {g.name}{taken ? ' (already marked)' : ''}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
              </div>
              {conflict && (
                <p className="mt-1.5 text-[11px] text-red-600">
                  This groomer already has a "{LEAVE_COLORS[conflict.status].label}" entry for this day.
                </p>
              )}

              {/* Monthly paid-leave balance — shown as soon as a groomer is
                  picked.  Colour shifts amber as the bucket drains and red
                  once it's empty so the coordinator gets a clear at-a-glance
                  signal before they pick a PAID reason below. */}
              {balanceStats && (
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full ${
                      balanceStats.remaining <= 0
                        ? 'bg-red-100 text-red-700'
                        : balanceStats.remaining <= 1
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {balanceStats.remaining <= 0
                      ? 'No paid balance left'
                      : `${balanceStats.remaining} of ${LEAVE_QUOTA_PER_MONTH} paid leaves left`}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    this month
                  </span>
                </div>
              )}
            </label>

            {/* Reason picker */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Reason
              </p>
              <div className="space-y-2">
                {/* Order is intentional: the LWP reason first (most common
                    — no-show/sick), then the three PAID reasons (all deduct
                    from the 4-per-month bucket). */}
                {(['unavailable', 'weekly_off', 'not_deployed', 'groomer_leave'] as AttendanceMarkKind[]).map(k => {
                  const meta     = ATTENDANCE_KIND_META[k];
                  const selected = kind === k;
                  const isPaid   = meta.consequence === 'Paid';
                  // A PAID reason with no remaining balance is allowed
                  // (coordinator's call — real life is messy) but the
                  // tile gets a subtle red ring so the consequence is
                  // unmistakable.
                  const wouldOverdraw = isPaid && !!balanceStats && balanceStats.remaining <= 0;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKind(k)}
                      className={`w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border-2 transition ${
                        selected
                          ? wouldOverdraw
                            ? 'border-red-400 bg-red-50/60'
                            : 'border-sniffy-purple bg-purple-50/60'
                          : wouldOverdraw
                            ? 'border-red-200 bg-white hover:border-red-300'
                            : 'border-gray-200 bg-white hover:border-purple-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-gray-900">{meta.label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                          {k === 'unavailable'   && 'Groomer didn\'t show up, or informed they can\'t work (personal, sick, etc).'}
                          {k === 'weekly_off'    && 'Groomer\'s weekly scheduled rest day (one per week).'}
                          {k === 'not_deployed'  && 'Groomer was free but no bookings to assign.'}
                          {k === 'groomer_leave' && 'Planned leave — deducts from the monthly paid balance.'}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-violet-100 text-violet-700'
                        }`}
                      >
                        {isPaid ? 'Paid' : 'LWP'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Out-of-balance warning — shown only when a PAID reason
                  is picked AND the groomer has no quota remaining.
                  Non-blocking on purpose: the coordinator may still
                  override (manager discretion), but the warning makes
                  the decision deliberate rather than accidental. */}
              {outOfBalance && (
                <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200">
                  <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0"/>
                  <p className="text-[11px] text-red-700 leading-snug">
                    <span className="font-extrabold">{selectedGroomer?.name}</span> has used all {LEAVE_QUOTA_PER_MONTH} paid leaves
                    for {date.toLocaleDateString('en-IN', { month: 'long' })}.
                    Marking this as paid will exceed the monthly balance.
                  </p>
                </div>
              )}
            </div>

            {/* Optional details */}
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Details <span className="text-gray-400 font-medium normal-case">(optional)</span>
              </span>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="e.g. Called in sick, no doc submitted"
                rows={2}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-sniffy-purple focus:ring-2 focus:ring-purple-100 outline-none resize-none"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 p-4 flex gap-2 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={busy || !groomerId || !!conflict}
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-extrabold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)', boxShadow: '0 4px 14px rgba(69,26,139,0.30)' }}
            >
              {busy ? 'Saving…' : 'Mark Attendance'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
