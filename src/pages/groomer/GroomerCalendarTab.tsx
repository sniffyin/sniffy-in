/**
 * groomer/GroomerCalendarTab.tsx
 *
 * MS-Teams-style month + week calendar for an individual groomer.
 *
 *   ▸ Each day box shows # of grooming sessions for that day:
 *       past   → completed count
 *       future → scheduled count
 *   ▸ Click a day → bottom-sheet / popover with details + "Apply Leave" button
 *   ▸ Apply Leave → modal asks for reason, inserts into groomer_leaves
 *       with status='pending' (orange).  Once admin approves it turns green.
 *   ▸ Pending leaves cannot be self-approved — they show a yellow/orange
 *     border until coordinator approves.
 *   ▸ Rejected leaves show in red.
 *
 * Pulls only this groomer's rows — no admin data exposed.
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CalendarDays, X,
  AlertTriangle, Plus, Trash2,
  CalendarRange, CalendarOff, Wallet, CalendarCheck2,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { GroomingSession } from '../admin/types';
import {
  toISODate, isSameDay, startOfToday,
  buildMonthGrid, buildWeekGrid,
  addMonths, addWeeks,
  WEEKDAYS_SHORT, fmtWeekRange, MONTHS_LONG, LEAVE_COLORS,
  type ViewMode,
} from '../calendar/calendarUtils';
import {
  fetchLeavesForGroomer, applyLeave, cancelLeave,
  convertRejectedToLwp,
  getMonthlyLeaveStats,
  LEAVE_QUOTA_PER_MONTH,
  type GroomerLeave,
  type MonthlyLeaveStats,
} from '../calendar/leavesApi';
import SniffyDatePicker from '../calendar/SniffyDatePicker';
import PaymentStatusBadge from '../../components/PaymentStatusBadge';
import {
  computeMonthlyIncentive, computeSessionIncentive,
  type MonthlyIncentive,
} from './incentivesApi';
import SessionPetLines from '../admin/SessionPetLines';
import { useSessionPetDisplay } from '../admin/useSessionPets';

/**
 * Cell border tone per leave status — mirrors `AdminCalendarTab`'s
 * `LEAVE_BORDER` so both calendars speak the same visual language.
 *
 * Deliberately NOT `LEAVE_COLORS[x].border`: that map gives `approved` an
 * emerald accent, and emerald is reserved here for *completed sessions*, so
 * an emerald-edged cell on a day off would read as finished work. Approved
 * leave borrows the slate "blocked" tone that matches its hatch instead.
 */
const LEAVE_BORDER: Record<string, string> = {
  pending:  '#fb923c',   // orange — waiting on the coordinator
  approved: '#94a3b8',   // slate  — blocked, not "done"
  lwp:      '#7c3aed',   // violet — blocked + unpaid
  rejected: '#f87171',   // red    — denied
};

/** Completed vs upcoming — same pair the admin grid uses. The stripe on
 *  `upcoming` survives greyscale and colour blindness, which matters because
 *  the two segments sit side by side in a 4px bar. */
const DONE_COLOR     = '#059669';   // emerald-600
const UPCOMING_COLOR = '#2563eb';   // blue-600
const UPCOMING_FILL  =
  `repeating-linear-gradient(45deg, rgba(255,255,255,0.42) 0 2px, transparent 2px 5px), ${UPCOMING_COLOR}`;

// Wider GroomerLike — accepts both the local GroomerUser and the admin AdminUser.
type GroomerLike = {
  id: string;
  name: string;
  groomer_id?: string;
};

export default function GroomerCalendarTab({ groomer }: { groomer: GroomerLike }) {
  const groomerId = groomer.groomer_id ?? groomer.id;

  const [view, setView]     = useState<ViewMode>('month');
  const [cursor, setCursor] = useState<Date>(() => startOfToday());

  const [sessions, setSessions] = useState<GroomingSession[]>([]);
  const [leaves,   setLeaves]   = useState<GroomerLeave[]>([]);
  const [loading,  setLoading]  = useState(true);

  const [activeDay,  setActiveDay]  = useState<Date | null>(null);
  const [applyOpen,  setApplyOpen]  = useState(false);
  const [applyDate,  setApplyDate]  = useState<Date | null>(null);

  const today = startOfToday();

  const refetch = useCallback(async () => {
    setLoading(true);
    const [sRes, lRes] = await Promise.all([
      supabase
        .from('grooming_sessions')
        .select('*')
        .eq('groomer_id', groomerId)
        .order('session_date', { ascending: true }),
      fetchLeavesForGroomer(groomerId),
    ]);
    setSessions((sRes.data as GroomingSession[]) ?? []);
    setLeaves(lRes);
    setLoading(false);
  }, [groomerId]);

  useEffect(() => { refetch(); }, [refetch]);

  // ─── Index sessions + leaves by yyyy-mm-dd for O(1) day lookup ──
  const byDate = useMemo(() => {
    const m = new Map<string, { completed: number; upcoming: number; total: number }>();
    for (const s of sessions) {
      if (!s.session_date) continue;
      const key = s.session_date;
      const cur = m.get(key) ?? { completed: 0, upcoming: 0, total: 0 };
      cur.total += 1;
      // The groomer's calendar cares about work done vs work to come,
      // not about whether the office has reconciled the payment — so
      // grooming_done counts as completed here, unlike the admin
      // calendar where the unsettled split is the whole point.  What it
      // must NOT do is fall into `upcoming`: a job finished last week is
      // not something the groomer still has to turn up for.
      if (s.status === 'completed' || s.status === 'grooming_done') cur.completed += 1;
      else if (s.status === 'scheduled' || s.status === 'groomer_assigned') cur.upcoming += 1;
      m.set(key, cur);
    }
    return m;
  }, [sessions]);

  const leavesByDate = useMemo(() => {
    const m = new Map<string, GroomerLeave>();
    for (const l of leaves) m.set(l.leave_date, l);
    return m;
  }, [leaves]);

  // ─── Quota stats — scoped to the *currently viewed* calendar month ───
  // Switching the cursor to a different month will recompute, so the header
  // always describes the month the groomer is looking at.
  const monthStats: MonthlyLeaveStats = useMemo(
    () => getMonthlyLeaveStats(leaves, cursor.getFullYear(), cursor.getMonth()),
    [leaves, cursor]
  );

  // Monthly incentive total for the same viewed month.
  const monthIncentive: MonthlyIncentive = useMemo(
    () => computeMonthlyIncentive(sessions, cursor.getFullYear(), cursor.getMonth()),
    [sessions, cursor]
  );

  // Per-day incentive breakdown — keyed by yyyy-mm-dd, lets the calendar
  // cells render a small ₹ chip with the right colour.
  const incentiveByDate = useMemo(() => {
    const m = new Map<string, { earned: number; pending: number }>();
    for (const s of sessions) {
      if (!s.session_date) continue;
      const inc = computeSessionIncentive(s);
      if (inc.earned + inc.pending === 0) continue;
      const cur = m.get(s.session_date) ?? { earned: 0, pending: 0 };
      cur.earned  += inc.earned;
      cur.pending += inc.pending;
      m.set(s.session_date, cur);
    }
    return m;
  }, [sessions]);

  // ─── Month / week grid days ────────────────────────────────
  const days = useMemo(
    () => (view === 'month' ? buildMonthGrid(cursor) : buildWeekGrid(cursor)),
    [view, cursor]
  );

  // Busiest day currently on screen — the denominator for the heat tint and
  // the load bar.  Normalising against the *visible* grid (rather than a
  // fixed ceiling) keeps quiet months from rendering as one flat pale wash.
  const maxDayVolume = useMemo(() => {
    let max = 0;
    for (const d of days) {
      const st = byDate.get(toISODate(d));
      if (!st) continue;
      const vol = st.completed + st.upcoming;
      if (vol > max) max = vol;
    }
    return Math.max(max, 1);
  }, [days, byDate]);

  function go(delta: number) {
    setCursor(c => view === 'month' ? addMonths(c, delta) : addWeeks(c, delta));
  }
  function goToday() { setCursor(startOfToday()); }

  function onDayClick(d: Date) { setActiveDay(d); }

  async function onApply(reason: string) {
    if (!applyDate) return;
    const res = await applyLeave({
      groomer_id:   groomerId,
      groomer_name: groomer.name,
      leave_date:   toISODate(applyDate),
      reason,
    });
    if (!res.ok) { alert(res.error ?? 'Could not apply leave.'); return; }
    setApplyOpen(false);
    setApplyDate(null);
    setActiveDay(null);
    await refetch();
  }

  async function onCancelLeave(id: string) {
    if (!window.confirm('Cancel this leave request?')) return;
    const res = await cancelLeave(id);
    if (!res.ok) { alert(res.error ?? 'Could not cancel.'); return; }
    setActiveDay(null);
    await refetch();
  }

  /**
   * Groomer was rejected, but still wants to take that day off — this
   * opens a confirmation modal (NOT the native browser confirm), and
   * on confirm calls the conversion API.  See ConfirmLwpModal at the
   * bottom of this file.
   */
  const [confirmLwpId, setConfirmLwpId] = useState<string | null>(null);
  const [confirmingLwp, setConfirmingLwp] = useState(false);

  function onTakeAsLwp(id: string) { setConfirmLwpId(id); }

  async function doConfirmLwp() {
    if (!confirmLwpId) return;
    setConfirmingLwp(true);
    const res = await convertRejectedToLwp(confirmLwpId);
    setConfirmingLwp(false);
    if (!res.ok) { alert(res.error ?? 'Could not convert.'); return; }
    setConfirmLwpId(null);
    setActiveDay(null);
    await refetch();
  }

  return (
    <div className="space-y-4">

      {/* ── Combined month summary strip ───────────────────────
          Compact one-card replacement for the old (Leave Quota +
          Incentives) stack — saves ~250 px of vertical space on
          mobile so the calendar isn't shoved off-screen.  Detail
          breakdowns live behind a "Details" toggle, default closed. */}
      <MonthSummaryStrip
        monthLabel={`${MONTHS_LONG[cursor.getMonth()]} ${cursor.getFullYear()}`}
        leaveStats={monthStats}
        incentive={monthIncentive}
      />

      {/* ── Calendar shell ──────────────────────────────────────
          Same "data canvas" treatment as `AdminCalendarTab`: the grid drops
          its borders and lets each day's *fill intensity* carry the workload
          signal, so a busy week reads at a glance without counting numbers.
          Purely presentational — every count, leave chip, incentive figure
          and click target is the same groomer-scoped data as before. */}
      <div className="rounded-[22px] bg-[#fbfbfd] border border-[#eceaf4] overflow-hidden"
        style={{ boxShadow: '0 6px 24px rgba(69,26,139,0.06)' }}
      >
        {/* Toolbar — month nav + Today, Apply Leave, view switcher.
            One wrapping row so it stays short on mobile. */}
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

          {/* On mobile this group claims its own full-width row so the view
              switcher can't be pushed off the right edge. */}
          <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
            {/* Apply leave shortcut — the groomer's counterpart to the
                admin toolbar's groomer filter. Same pill geometry. */}
            <button
              onClick={() => { setApplyDate(today); setApplyOpen(true); }}
              className="inline-flex items-center justify-center gap-1 flex-1 sm:flex-none px-3 py-1.5 rounded-full bg-sniffy-purple text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#57219f] transition"
            >
              <Plus size={11}/> Apply Leave
            </button>

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
              const dayStats  = byDate.get(iso);
              const leave     = leavesByDate.get(iso);
              const inMonth   = view === 'week' || d.getMonth() === cursor.getMonth();
              const isToday   = isSameDay(d, today);
              const isPast    = d < today;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;

              const lc = leave ? LEAVE_COLORS[leave.status] : null;

              // Prefer "completed" whenever there is any completed work on
              // this day — even on future dates the admin may have already
              // marked a row complete, so we don't tie the bucket to past/future.
              const completedCount = dayStats?.completed ?? 0;
              const upcomingCount  = dayStats?.upcoming  ?? 0;
              const volume         = completedCount + upcomingCount;
              const headline       = completedCount > 0 ? completedCount : upcomingCount;
              const headColor      = completedCount > 0 ? DONE_COLOR : UPCOMING_COLOR;
              const soloLabel      = completedCount > 0 ? 'groomed' : 'scheduled';
              // (kept for reference – isPast still drives a few subtle cues)
              void isPast;

              // Load bar — total length is the day's share of the busiest day
              // on screen, split green/blue.  Magnitude *and* mix in one
              // glance, without asking anyone to decode a fill colour.
              const doneWidth = (completedCount / maxDayVolume) * 100;
              const upWidth   = (upcomingCount  / maxDayVolume) * 100;

              // Heat tint is capped at 0.12 alpha on purpose: enough to feel a
              // heavy week in peripheral vision, never enough to fight the
              // numerals for contrast.
              const tint = volume > 0 ? 0.03 + (volume / maxDayVolume) * 0.09 : 0;
              const baseFill = volume > 0
                ? `rgba(69,26,139,${tint.toFixed(3)})`
                : (isWeekend ? '#faf9fd' : '#ffffff');

              // Leave hatching layers over the tint so a day that is both
              // busy and on leave still shows its load.  Approved + LWP days
              // carry a diagonal hatch so they read as "blocked", never as
              // "available"; pending and rejected stay solid because their
              // colours already communicate state on their own.
              const cellFill = lc
                ? (lc.pattern ? `${lc.pattern}, ${baseFill}` : lc.bg)
                : baseFill;

              const inc = incentiveByDate.get(iso);

              const hasAnyContent = volume > 0 || !!leave || !!inc;

              return (
                <button
                  key={idx}
                  onClick={() => onDayClick(d)}
                  // Without this a screen reader reads the raw text nodes as
                  // one run — "4 groomed +1 upcoming ₹65" — with no date
                  // attached. Spell the day out instead.
                  aria-label={[
                    d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
                    isToday ? 'today' : null,
                    completedCount > 0 ? `${completedCount} groomed` : null,
                    upcomingCount  > 0 ? `${upcomingCount} upcoming` : null,
                    leave ? lc!.label : null,
                    inc ? `₹${inc.earned + inc.pending} incentive` : null,
                    !hasAnyContent ? 'no sessions' : null,
                  ].filter(Boolean).join(', ')}
                  className={[
                    'relative rounded-[14px] border overflow-hidden text-left',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sniffy-purple focus-visible:ring-offset-1',
                    // Min-height instead of fixed: empty weeks collapse,
                    // weeks with content expand naturally.
                    hasAnyContent ? 'min-h-[4.4rem] sm:min-h-[4.9rem]' : 'min-h-[2.25rem] sm:min-h-[2.5rem]',
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
                      : (leave ? LEAVE_BORDER[leave.status] : '#ececf3'),
                  }}
                >
                  {/* Row 1 — date.  A month cell is only ~44px wide on a
                      375px phone, so every label below collapses to its
                      shortest legible form under `sm`; the full wording
                      returns on tablet and up, and the day sheet always
                      carries the complete breakdown. */}
                  <div className="flex items-center justify-between gap-1 px-1.5 sm:px-2 pt-1">
                    <span className={
                      isToday
                        ? 'w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-full bg-sniffy-purple text-white grid place-items-center text-[10px] sm:text-[11px] font-extrabold leading-none shrink-0'
                        : `text-[12px] sm:text-[13px] font-extrabold leading-none shrink-0 ${isWeekend ? 'text-sniffy-purple/60' : 'text-gray-800'}`
                    }>
                      {d.getDate()}
                    </span>

                    {/* Leave marker lives in the header corner, not in the
                        body.  As a mid-cell chip it shifted the session
                        number up or down depending on whether the day was
                        off, so the big green figures never lined up across a
                        row.  Pinned here, every cell is header / number /
                        bar and the numbers align. */}
                    {leave && (
                      <span
                        className="inline-flex items-center gap-0.5 shrink-0 text-[9px] font-extrabold leading-none"
                        style={{ color: lc!.text }}
                        title={lc!.label}
                      >
                        <CalendarOff size={9}/>
                        <span className="hidden sm:inline">{lc!.short}</span>
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
                          their neighbours. */}
                      <p className={`text-[9px] sm:text-[10px] font-bold mt-0.5 leading-none whitespace-nowrap ${
                        completedCount > 0 && upcomingCount > 0 ? 'text-blue-700' : 'invisible'
                      }`}>
                        +{upcomingCount}<span className="hidden sm:inline"> upcoming</span>
                      </p>
                    </div>
                  )}

                  {/* A day that is purely leave gets NO centre figure — a big
                      numeral in the slot that normally means "groomed" would
                      read as sessions worked on a day nothing was groomed.
                      The corner marker and the hatch carry it instead. */}

                  {/* Row 3 — incentive figure.  Plain coloured numerals rather
                      than the old bordered chip: at this cell width a bordered
                      box ate the whole bottom edge and left no room for the
                      load bar.  Green = approved, orange = awaiting approval
                      (the trailing "?" keeps that readable without colour). */}
                  {inc && (
                    <p
                      className={`mt-auto px-1.5 text-center text-[9px] sm:text-[10px] font-extrabold leading-none truncate ${
                        inc.earned > 0 ? 'text-emerald-700' : 'text-orange-600'
                      }`}
                      title={inc.earned > 0
                        ? `Earned ₹${inc.earned}${inc.pending ? ` · ₹${inc.pending} pending` : ''}`
                        : `₹${inc.pending} pending approval`}
                    >
                      ₹{inc.earned + inc.pending}{inc.earned > 0 ? '' : '?'}
                    </p>
                  )}

                  {/* Row 4 — load bar.  `gap` keeps the two segments from
                      touching, which is most of why they used to smear
                      together at this size. */}
                  {volume > 0 && (
                    <div className={`${inc ? 'mt-1' : 'mt-auto'} mx-1.5 mb-1 h-[4px] rounded-full bg-[#eeecf6] overflow-hidden flex gap-[2px]`}
                      title={`${completedCount} completed · ${upcomingCount} upcoming`}
                    >
                      {completedCount > 0 && (
                        <span className="rounded-full" style={{ width: `${doneWidth}%`, background: DONE_COLOR }}/>
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

        {/* Legend — the fill ramp is now part of the language, so it leads;
            the bar split and the leave hatch follow.  Four separate leave
            swatches (pending / approved / LWP / denied) used to sit here,
            making this a seven-item legend — more than anyone holds in their
            head while scanning a grid.  They collapse into one entry: the
            hatch means "day off", the cell's border colour carries which
            kind, and the day sheet names the leave in full with its status,
            reason and any coordinator note. */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-3 sm:px-5 py-3 border-t border-[#eceaf4] bg-white/60 text-[10px] font-medium text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: DONE_COLOR }}/>
            <span className="font-semibold text-gray-600">Completed</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            {/* Striped, not just a different hue — the texture is what makes
                this readable in greyscale and to colour-blind users. */}
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: UPCOMING_FILL }}/>
            <span className="font-semibold text-gray-600">Upcoming</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-9 h-[5px] rounded-full bg-[#eeecf6] overflow-hidden flex gap-[2px]">
              <span className="w-[55%] rounded-full" style={{ background: DONE_COLOR }}/>
              <span className="w-[25%] rounded-full" style={{ background: UPCOMING_FILL }}/>
            </span>
            Bar length = day&rsquo;s workload
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="font-extrabold text-emerald-700">&#8377;</span>
            <span className="font-semibold text-gray-600">Incentive</span>
            <span className="text-gray-400">— orange &#8377;? = awaiting approval</span>
          </span>
          <span className="inline-flex items-center gap-1.5"
            title="Pending, approved, LWP and denied — open a day for the full detail"
          >
            <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: `${LEAVE_COLORS.approved.pattern}, ${LEAVE_COLORS.approved.bg}`, border: `1px solid ${LEAVE_BORDER.approved}` }}/>
            <span className="font-semibold text-gray-600">Leave</span>
            <span className="text-gray-400">— border shows status</span>
          </span>
        </div>
      </div>

      {/* ── Day-detail bottom sheet ─────────────────────────── */}
      <AnimatePresence>
        {activeDay && (
          <DayDetailSheet
            day={activeDay}
            sessions={sessions.filter(s => s.session_date === toISODate(activeDay))}
            leave={leavesByDate.get(toISODate(activeDay)) ?? null}
            onClose={() => setActiveDay(null)}
            onApply={() => { setApplyDate(activeDay); setApplyOpen(true); }}
            onCancelLeave={onCancelLeave}
            onTakeAsLwp={onTakeAsLwp}
          />
        )}
      </AnimatePresence>

      {/* ── Apply leave modal ───────────────────────────────── */}
      <AnimatePresence>
        {applyOpen && applyDate && (
          <ApplyLeaveModal
            date={applyDate}
            existing={leavesByDate.get(toISODate(applyDate)) ?? null}
            // Quota stats for *applyDate's* month — may be different from the
            // viewed month, because the groomer can pick any future date.
            applyMonthStats={getMonthlyLeaveStats(
              leaves, applyDate.getFullYear(), applyDate.getMonth()
            )}
            onClose={() => { setApplyOpen(false); setApplyDate(null); }}
            onSubmit={onApply}
            onPickDate={d => setApplyDate(d)}
          />
        )}
      </AnimatePresence>

      {/* ── Confirm "Take as LWP" modal ──────────────────────── */}
      <AnimatePresence>
        {confirmLwpId && (
          <ConfirmLwpModal
            busy={confirmingLwp}
            onCancel={() => setConfirmLwpId(null)}
            onConfirm={doConfirmLwp}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Combined month summary strip ─────────────────────────────

/**
 * One compact card that replaces the old LeaveQuotaStrip + IncentiveStrip
 * stack.  Designed for mobile: a 2-column header (Leaves | Earnings)
 * sits above a slim progress bar, and a "Details" toggle exposes the
 * full sub-stat breakdown only when the groomer asks for it.
 *
 * Why this exists:
 *   The two original strips together took ~340 px on a 414 px phone,
 *   pushing the calendar grid below the fold.  Most groomers only
 *   need to see "how many leaves do I have left" + "how much have I
 *   earned this month" at a glance — the rest is on-demand.
 *
 * State preserved across reloads: the expanded/collapsed choice is
 * intentionally NOT persisted — every visit starts compact so the
 * calendar is the headline.  Easy to add localStorage later if
 * groomers prefer it open by default.
 */
function MonthSummaryStrip({
  monthLabel, leaveStats, incentive,
}: {
  monthLabel: string;
  leaveStats: MonthlyLeaveStats;
  incentive: MonthlyIncentive;
}) {
  const [expanded, setExpanded] = useState(false);
  const usedPct    = Math.min(100, (leaveStats.paidUsed / leaveStats.quota) * 100);
  const pendingPct = Math.min(100 - usedPct, (leaveStats.pending / leaveStats.quota) * 100);
  const exhausted  = leaveStats.exhausted;
  const hasIncentive = incentive.earned + incentive.pending > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white border border-gray-100 overflow-hidden"
      style={{ boxShadow: '0 4px 16px rgba(69,26,139,0.08)' }}
    >
      {/* Tiny header row — month label on the left, expand toggle on the right.
          Kept short so the whole card stays under ~95 px when collapsed. */}
      <div className="px-4 pt-2.5 pb-1 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {monthLabel}
        </p>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-[10px] font-bold text-sniffy-purple inline-flex items-center gap-0.5 hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide' : 'Details'}
          <ChevronRight
            size={11}
            className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </button>
      </div>

      {/* Main row — Leaves on the left, Earnings on the right.
          Vertical divider keeps them visually paired but distinct. */}
      <div className="px-4 pb-3 grid grid-cols-2 divide-x divide-gray-100">
        {/* Leaves half */}
        <div className="pr-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg grid place-items-center bg-purple-50 text-sniffy-purple shrink-0">
              <Wallet size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 leading-none">
                Leaves
              </p>
              <p className="text-base font-extrabold leading-tight">
                <span className={exhausted ? 'text-red-500' : 'text-emerald-600'}>
                  {leaveStats.remaining}
                </span>
                <span className="text-gray-400 text-[11px] font-bold"> /{leaveStats.quota} left</span>
              </p>
            </div>
          </div>
          {/* Slim progress bar — half-height of the old one */}
          <div className="relative h-1.5 rounded-full bg-gray-100 overflow-hidden mt-2">
            <div
              className="absolute inset-y-0 left-0 bg-sniffy-purple transition-all"
              style={{ width: `${usedPct}%` }}
            />
            <div
              className="absolute inset-y-0 bg-purple-300 transition-all"
              style={{ left: `${usedPct}%`, width: `${pendingPct}%` }}
              title={`${leaveStats.pending} pending`}
            />
          </div>
        </div>

        {/* Earnings half */}
        <div className="pl-3 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg grid place-items-center bg-emerald-50 text-emerald-600 shrink-0">
            <CalendarCheck2 size={14} />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 leading-none">
              Earned
            </p>
            <p className="text-base font-extrabold text-emerald-600 leading-tight">
              ₹{incentive.earned}
              {incentive.pending > 0 && (
                <span className="text-[10px] font-bold text-orange-500 ml-1">
                  +₹{incentive.pending}?
                </span>
              )}
            </p>
            <p className="text-[9px] text-gray-400 leading-tight mt-0.5">
              {incentive.bookingsCounted} session{incentive.bookingsCounted === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </div>

      {/* Expandable detail — full breakdown only when user asks. */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            {/* Leave breakdown */}
            <div className="grid grid-cols-4 divide-x divide-gray-100 text-center">
              <SubStat color="#10b981" Icon={CalendarCheck2} label="Approved" value={leaveStats.paidUsed} />
              <SubStat color="#fb923c" Icon={AlertTriangle}  label="Pending"  value={leaveStats.pending} />
              <SubStat color="#7c3aed" Icon={CalendarOff}    label="LWP"      value={leaveStats.lwp} />
              <SubStat color="#ef4444" Icon={X}              label="Rejected" value={leaveStats.rejected} />
            </div>

            {/* Incentive breakdown — only when there's something to show */}
            {hasIncentive && (
              <div className="grid grid-cols-2 divide-x divide-gray-100 text-center border-t border-gray-100">
                <div className="py-2 px-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Approved ₹</p>
                  <p className="text-sm font-extrabold text-emerald-700 leading-tight">₹{incentive.earned}</p>
                  <p className="text-[9px] text-gray-400">{incentive.approvedCount} session{incentive.approvedCount === 1 ? '' : 's'}</p>
                </div>
                <div className="py-2 px-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Pending ₹</p>
                  <p className="text-sm font-extrabold text-orange-600 leading-tight">₹{incentive.pending}</p>
                  <p className="text-[9px] text-gray-400">{incentive.pendingCount} session{incentive.pendingCount === 1 ? '' : 's'}</p>
                </div>
              </div>
            )}

            {/* Quota-exhausted warning — appears at the bottom of the
                expanded view only, since collapsed already shows red Remaining=0 */}
            {exhausted && (
              <div className="px-4 py-2 border-t border-orange-100 bg-orange-50/60 flex items-start gap-2">
                <AlertTriangle size={12} className="text-orange-600 mt-0.5 shrink-0" />
                <p className="text-[10px] text-orange-700 font-semibold leading-snug">
                  You've used your {leaveStats.quota} paid leaves for this month.
                  Additional leave may be marked as LWP.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SubStat({
  color, Icon, label, value,
}: { color: string; Icon: React.ElementType; label: string; value: number; }) {
  return (
    <div className="py-2.5 px-1">
      <Icon size={12} style={{ color }} className="mx-auto mb-0.5" />
      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-base font-extrabold text-gray-900 leading-tight">{value}</p>
    </div>
  );
}

// ─── Day detail sheet ─────────────────────────────────────────

function DayDetailSheet({
  day, sessions, leave, onClose, onApply, onCancelLeave, onTakeAsLwp,
}: {
  day: Date;
  sessions: GroomingSession[];
  leave: GroomerLeave | null;
  onClose: () => void;
  onApply: () => void;
  onCancelLeave: (id: string) => void;
  onTakeAsLwp: (id: string) => void;
}) {
  const isPast = day < startOfToday();
  const lc = leave ? LEAVE_COLORS[leave.status] : null;
  const petDisplay = useSessionPetDisplay(sessions);

  return (
    <>
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Outer wrapper handles fixed positioning + bottom alignment.
          Inner motion.div owns the open/close transform so framer-motion
          doesn't fight Tailwind's translate utilities. */}
      <div
        className="fixed inset-x-0 z-50 flex justify-center px-3 pointer-events-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)' }}
      >
        <motion.div
          initial={{ opacity:0, y: 24, scale: 0.97 }}
          animate={{ opacity:1, y: 0, scale: 1 }}
          exit={{ opacity:0, y: 24, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="pointer-events-auto bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between">
          <div>
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
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} className="text-gray-400"/>
          </button>
        </div>

        {/* Leave card */}
        {leave && (
          <div
            className="mx-5 mb-3 rounded-xl p-3"
            style={{ background: lc!.bg, border: `1px solid ${lc!.border}` }}
          >
            <div className="flex items-start gap-2">
              <CalendarOff size={16} style={{ color: lc!.border }}/>
              <div className="flex-1">
                <p className="text-xs font-extrabold" style={{ color: lc!.text }}>
                  Leave · {lc!.label}
                </p>
                {leave.reason && <p className="text-[11px] text-gray-700 mt-0.5">{leave.reason}</p>}
                {leave.status === 'rejected' && leave.rejected_note && (
                  <p className="text-[11px] mt-1 text-red-700">Coordinator note: {leave.rejected_note}</p>
                )}
                {leave.status === 'lwp' && leave.rejected_note && (
                  // After a rejected → LWP conversion, the original rejection
                  // context lives here as audit trail.
                  <p className="text-[11px] mt-1 text-violet-700 italic">{leave.rejected_note}</p>
                )}
              </div>
              {leave.status === 'pending' && (
                <button
                  onClick={() => onCancelLeave(leave.id)}
                  className="p-1.5 rounded-full hover:bg-white"
                  title="Cancel leave"
                >
                  <Trash2 size={14} className="text-red-500"/>
                </button>
              )}
            </div>

            {/* Rejected → "Take as LWP" CTA.  Surfaces the choice the user
                wanted: groomer can accept the rejection, or proceed to take
                the day off as Leave Without Pay. */}
            {leave.status === 'rejected' && !isPast && (
              <div className="mt-3 pt-3 border-t border-red-100">
                <p className="text-[11px] text-gray-700 leading-snug mb-2">
                  Your leave was rejected. If you still need to take this day
                  off, you can mark it as <b>Leave Without Pay (LWP)</b> — you
                  won't be paid for this day, but the day will be blocked.
                </p>
                <button
                  onClick={() => onTakeAsLwp(leave.id)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-extrabold text-white"
                  style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #5b21b6 100%)' }}
                >
                  <CalendarOff size={13}/> Take as LWP
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sessions list */}
        <div className="px-5 pb-3 max-h-[40vh] overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Grooming Sessions ({sessions.length})
          </p>
          {sessions.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-3">No sessions on this day.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map(s => (
                <div key={s.id} className="rounded-xl border border-gray-100 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-extrabold text-gray-900 truncate">
                      {s.pet_parent_name}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <PaymentStatusBadge session={s} variant="short"/>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${statusBg(s.status)}`}>
                        {s.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  {petDisplay.get(s.id) ? (
                    <div className="mt-0.5">
                      {s.scheduled_time && <p className="text-[11px] text-gray-500">{s.scheduled_time}</p>}
                      <SessionPetLines pets={petDisplay.get(s.id)} className="mt-0.5"/>
                    </div>
                  ) : (
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {s.scheduled_time ? `${s.scheduled_time} · ` : ''}{s.breed ?? 'Unknown breed'}
                    {s.package ? ` · ${s.package}` : ''}
                  </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Apply leave action */}
        {!leave && !isPast && (
          <div className="border-t border-gray-100 p-4">
            <button
              onClick={onApply}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-extrabold text-white"
              style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)', boxShadow: '0 4px 14px rgba(69,26,139,0.30)' }}
            >
              <Plus size={16}/> Apply Leave for this day
            </button>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Leave starts as <b>Pending</b> until your coordinator approves it.
            </p>
          </div>
        )}
        </motion.div>
      </div>
    </>
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

// ─── Apply leave modal ───────────────────────────────────────

function ApplyLeaveModal({
  date, existing, applyMonthStats, onClose, onSubmit, onPickDate,
}: {
  date: Date;
  existing: GroomerLeave | null;
  applyMonthStats: MonthlyLeaveStats;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  onPickDate: (d: Date) => void;
}) {
  const [reason, setReason]     = useState('');
  const [submitting, setSub]    = useState(false);
  const [acknowledged, setAck]  = useState(false);   // for over-quota confirmation
  const overQuota = applyMonthStats.exhausted;

  if (existing) {
    // Already have a leave for that day — show info
    const lc = LEAVE_COLORS[existing.status];
    return (
      <>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity:0, y: 24, scale: 0.97 }}
          animate={{ opacity:1, y: 0, scale: 1 }}
          exit={{ opacity:0, y: 24, scale: 0.97 }}
          className="fixed z-50 inset-0 grid place-items-center p-4"
        >
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="px-5 pt-5 pb-3 flex items-start justify-between">
              <h3 className="text-lg font-extrabold text-gray-900">Already Applied</h3>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="px-5 pb-5">
              <div className="rounded-xl p-3" style={{ background: lc.bg, border: `1px solid ${lc.border}` }}>
                <p className="text-xs font-bold" style={{ color: lc.text }}>
                  {date.toLocaleDateString('en-IN', { day:'numeric', month:'long' })} · {lc.label}
                </p>
                {existing.reason && <p className="text-[11px] text-gray-700 mt-1">{existing.reason}</p>}
              </div>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  async function submit() {
    if (!reason.trim()) { alert('Please enter a reason for leave.'); return; }
    setSub(true);
    await onSubmit(reason.trim());
    setSub(false);
  }

  return (
    <>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity:0, y: 24, scale: 0.97 }}
        animate={{ opacity:1, y: 0, scale: 1 }}
        exit={{ opacity:0, y: 24, scale: 0.97 }}
        className="fixed z-50 inset-0 grid place-items-center p-4"
      >
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">

          {/* Hero */}
          <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-purple-50 to-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-sniffy-purple">Apply Leave</p>
                <h3 className="text-xl font-extrabold text-gray-900 leading-tight mt-0.5">
                  Request a day off
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Your coordinator will be notified and must approve.
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white">
                <X size={18} className="text-gray-400"/>
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-4 space-y-4">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Date</span>
              <div className="mt-1">
                <SniffyDatePicker
                  value={toISODate(date)}
                  min={toISODate(startOfToday())}
                  onChange={iso => {
                    const [y, m, d] = iso.split('-').map(Number);
                    if (y && m && d) onPickDate(new Date(y, m - 1, d));
                  }}
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Reason</span>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Family function, doctor appointment, personal day…"
                rows={3}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-sniffy-purple focus:ring-2 focus:ring-purple-100 outline-none resize-none"
              />
            </label>

            {/* Quota status — two flavours:
                - within quota → calm orange "pending" notice
                - over quota   → stronger amber warning + checkbox to acknowledge */}
            {!overQuota ? (
              <div className="rounded-xl p-3 text-[11px] text-orange-800 flex items-start gap-2"
                style={{ background: LEAVE_COLORS.pending.bg, border: `1px solid ${LEAVE_COLORS.pending.border}` }}
              >
                <AlertTriangle size={13} className="shrink-0 mt-0.5"/>
                <div>
                  <p>
                    Until your coordinator approves, this leave stays as
                    <b> {LEAVE_COLORS.pending.label}</b> and is not yet active.
                  </p>
                  <p className="mt-1 text-orange-700">
                    Quota used this month: <b>{applyMonthStats.paidUsed}/{applyMonthStats.quota}</b>
                    {applyMonthStats.pending > 0 && ` · ${applyMonthStats.pending} pending`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-3 text-[12px] text-amber-900 space-y-2"
                style={{ background: '#fff7ed', border: '1px solid #f97316' }}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-700"/>
                  <div>
                    <p className="font-extrabold">Your {LEAVE_QUOTA_PER_MONTH}-leave quota for this month is finished.</p>
                    <p className="mt-1 leading-snug">
                      Your coordinator may <b>approve</b> this as a paid leave at
                      their discretion, <b>reject</b> it, or mark it as
                      <b> Leave Without Pay (LWP)</b>. If marked LWP, you won't
                      be paid for this day.
                    </p>
                  </div>
                </div>
                <label className="flex items-start gap-2 mt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={e => setAck(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-amber-600"
                  />
                  <span className="text-[11px] text-amber-900">
                    I understand and want to proceed.
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 p-4 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={submitting || !reason.trim() || (overQuota && !acknowledged)}
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-extrabold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)', boxShadow: '0 4px 14px rgba(69,26,139,0.30)' }}
            >
              {submitting ? 'Submitting…' : overQuota ? 'Apply Anyway' : 'Submit Request'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Confirm "Take as LWP" modal ──────────────────────────────
//
// Sniffy-styled replacement for the previous window.confirm popup.
// Same content (rejection notice + LWP consequence + Cancel / Confirm),
// but rendered inside the app so it doesn't break the visual flow.

function ConfirmLwpModal({
  busy, onCancel, onConfirm,
}: {
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm"
        onClick={busy ? undefined : onCancel}
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="fixed z-[90] inset-0 grid place-items-center p-4"
      >
        <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
          {/* Hero with violet accent matches the LWP chip colour. */}
          <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-violet-50 to-white">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 grid place-items-center mb-3">
              <CalendarOff size={20} className="text-violet-700"/>
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
              Take this day as LWP?
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Your leave was rejected by the coordinator.
            </p>
          </div>

          {/* Consequence callout */}
          <div className="px-6 pb-4">
            <div className="rounded-2xl p-3.5 bg-amber-50 border border-amber-100 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0"/>
              <div>
                <p className="text-[12px] font-extrabold text-amber-900 leading-snug">
                  You won't be paid for this day.
                </p>
                <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
                  The day will be marked <b>Leave Without Pay (LWP)</b> and
                  blocked on your calendar. The coordinator will see the
                  conversion in their view.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 p-4 flex gap-2">
            <button
              onClick={onCancel}
              disabled={busy}
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-extrabold text-white disabled:opacity-50 inline-flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #5b21b6 100%)', boxShadow: '0 4px 14px rgba(124,58,237,0.30)' }}
            >
              {busy && <Loader2 size={14} className="animate-spin"/>}
              {busy ? 'Marking…' : 'Take as LWP'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
