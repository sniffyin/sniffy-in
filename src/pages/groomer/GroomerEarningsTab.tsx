/**
 * groomer/GroomerEarningsTab.tsx
 *
 * "My Earnings" — surfaces the groomer's incentive payouts in a way
 * that's honest about what's locked in (approved) vs what's still
 * up for review (pending), without burying the line items.
 *
 * Page shape (top → bottom):
 *   ① Big hero card — selected month's earned total, with pending
 *      shown as a smaller secondary line and progress on monthly
 *      bookings counted.
 *   ② Month switcher — ‹ ‘Month YYYY’ › — pages between months.
 *   ③ Two breakdown cards side-by-side:
 *      - On-time bonus (₹25/session)
 *      - 5★ review bonus (₹40/session)
 *      Each shows: approved count + approved ₹, pending count + pending ₹.
 *   ④ Per-session list for the selected month — one row per session
 *      that contributed to either bucket, with two pill badges
 *      (one per incentive type).  Empty months get a friendly empty
 *      state explaining how to earn.
 *   ⑤ All-time strip — total earned (lifetime) so the groomer can
 *      celebrate the running total even when the current month is
 *      slow.
 *
 * Numbers come from incentivesApi.ts so this view and the rest of
 * the app (calendar, admin reviews) agree exactly on what counts
 * as earned vs pending.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Clock, Star, ChevronLeft, ChevronRight, Sparkles,
  CheckCircle2, AlertCircle, TrendingUp, Info,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  GroomingSession, fmtCurrency, fmtDate,
} from '../admin/types';
import type { AdminUser } from '../admin/authStore';
import {
  computeSessionIncentive, computeMonthlyIncentive,
  ON_TIME_BONUS, REVIEW_BONUS,
} from './incentivesApi';

// ─── Month helpers ────────────────────────────────────────────

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
] as const;

function monthLabel(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

function prevMonth(year: number, month: number): { year: number; month: number } {
  return month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
}

function nextMonth(year: number, month: number): { year: number; month: number } {
  return month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
}

// ─── Small presentational pieces ──────────────────────────────

/** Coloured pill — "Earned ₹25", "Pending ₹40", "Missed". */
function IncentivePill({
  kind, label, amount,
}: {
  kind: 'earned' | 'pending' | 'missed';
  label: string;
  amount?: number | null;
}) {
  const cls =
    kind === 'earned'  ? 'bg-emerald-50  text-emerald-700 border-emerald-200'  :
    kind === 'pending' ? 'bg-amber-50    text-amber-700   border-amber-200'    :
                         'bg-gray-50     text-gray-400    border-gray-200';
  const Icon =
    kind === 'earned'  ? CheckCircle2 :
    kind === 'pending' ? Clock         :
                         AlertCircle;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full border px-2 py-0.5 ${cls}`}>
      <Icon size={10} strokeWidth={2.5}/>
      <span className="uppercase tracking-wider">{label}</span>
      {amount != null && <span>· {fmtCurrency(amount)}</span>}
    </span>
  );
}

/** Per-incentive-type breakdown card (On-time / Review).  Shows the
 *  per-session unit price plus the running totals for the selected
 *  month — both the locked-in (approved) and the still-up-for-review
 *  (pending) amounts. */
function BreakdownCard({
  title, perUnit, color, accent, Icon,
  approvedCount, approvedTotal, pendingCount, pendingTotal, hint,
}: {
  title: string;
  perUnit: number;
  color: string;
  accent: string;
  Icon: React.ElementType;
  approvedCount: number;
  approvedTotal: number;
  pendingCount: number;
  pendingTotal: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <span className="grid place-items-center w-7 h-7 rounded-xl"
          style={{ background: accent, color }}>
          <Icon size={14}/>
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-extrabold text-gray-900 leading-tight truncate">{title}</p>
          <p className="text-[10px] font-semibold text-gray-400 leading-tight">
            {fmtCurrency(perUnit)} / session
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="rounded-xl p-2" style={{ background: accent }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-700">Earned</p>
          <p className="text-base font-extrabold tabular-nums" style={{ color }}>
            {fmtCurrency(approvedTotal)}
          </p>
          <p className="text-[10px] font-semibold text-gray-500">
            {approvedCount} session{approvedCount === 1 ? '' : 's'}
          </p>
        </div>
        <div className="rounded-xl p-2 bg-amber-50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-amber-700">Pending</p>
          <p className="text-base font-extrabold tabular-nums text-amber-800">
            {fmtCurrency(pendingTotal)}
          </p>
          <p className="text-[10px] font-semibold text-gray-500">
            {pendingCount} awaiting
          </p>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 leading-snug mt-2 flex items-start gap-1">
        <Info size={10} className="mt-0.5 flex-shrink-0"/>
        <span>{hint}</span>
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────

export default function GroomerEarningsTab({ groomer }: { groomer: AdminUser }) {
  const [sessions, setSessions] = useState<GroomingSession[]>([]);
  const [loading,  setLoading]  = useState(true);

  // Selected month (defaults to today's month).  Year & 0-indexed
  // month — same shape computeMonthlyIncentive expects.
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const { data } = await supabase
        .from('grooming_sessions')
        .select('*')
        .eq('groomer_id', groomer.groomer_id ?? groomer.id)
        .order('session_date', { ascending: false });
      setSessions((data as GroomingSession[]) ?? []);
      setLoading(false);
    }
    fetchAll();
  }, [groomer.groomer_id, groomer.id]);

  // ── Monthly aggregates ──────────────────────────────────────
  const monthly = useMemo(
    () => computeMonthlyIncentive(sessions, cursor.year, cursor.month),
    [sessions, cursor],
  );

  // Per-type rollup for the breakdown cards — we walk the month's
  // sessions once and bucket each contribution into on-time vs
  // review, approved vs pending.
  const typeRollup = useMemo(() => {
    let onTimeApprovedCount = 0, onTimeApprovedTotal = 0;
    let onTimePendingCount  = 0, onTimePendingTotal  = 0;
    let reviewApprovedCount = 0, reviewApprovedTotal = 0;
    let reviewPendingCount  = 0, reviewPendingTotal  = 0;
    for (const s of sessions) {
      if (!s.session_date) continue;
      const d = new Date(s.session_date + 'T00:00');
      if (d.getFullYear() !== cursor.year || d.getMonth() !== cursor.month) continue;
      const inc = computeSessionIncentive(s);
      if (inc.onTimeApproved) { onTimeApprovedCount++; onTimeApprovedTotal += inc.onTimeApproved; }
      if (inc.onTimePending)  { onTimePendingCount++;  onTimePendingTotal  += inc.onTimePending;  }
      if (inc.reviewApproved) { reviewApprovedCount++; reviewApprovedTotal += inc.reviewApproved; }
      if (inc.reviewPending)  { reviewPendingCount++;  reviewPendingTotal  += inc.reviewPending;  }
    }
    return {
      onTimeApprovedCount, onTimeApprovedTotal,
      onTimePendingCount,  onTimePendingTotal,
      reviewApprovedCount, reviewApprovedTotal,
      reviewPendingCount,  reviewPendingTotal,
    };
  }, [sessions, cursor]);

  // Per-session list for the month — only the rows that actually
  // contributed to either bucket (drops the noise of arrival-not-marked
  // sessions that have no incentive signal yet).
  const monthSessions = useMemo(() => {
    return sessions
      .filter(s => {
        if (!s.session_date) return false;
        const d = new Date(s.session_date + 'T00:00');
        return d.getFullYear() === cursor.year && d.getMonth() === cursor.month;
      })
      .map(s => ({ s, inc: computeSessionIncentive(s) }))
      .filter(({ inc }) => inc.earned + inc.pending > 0)
      .sort((a, b) => (b.s.session_date ?? '').localeCompare(a.s.session_date ?? ''));
  }, [sessions, cursor]);

  // All-time earned — for the strip at the bottom.
  const allTimeEarned = useMemo(() => {
    return sessions.reduce((sum, s) => sum + computeSessionIncentive(s).earned, 0);
  }, [sessions]);

  const isCurrentMonth = (() => {
    const now = new Date();
    return cursor.year === now.getFullYear() && cursor.month === now.getMonth();
  })();

  // ── Render ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse py-8">
        <div className="h-32 bg-gray-100 rounded-2xl"/>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-28 bg-gray-100 rounded-2xl"/>
          <div className="h-28 bg-gray-100 rounded-2xl"/>
        </div>
        <div className="h-40 bg-gray-100 rounded-2xl"/>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── ① Hero card ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-5 text-white"
        style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)' }}
      >
        {/* Decorative sparkle pattern */}
        <Sparkles className="absolute -top-3 -right-3 text-white/10" size={120}/>

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="grid place-items-center w-7 h-7 rounded-xl bg-white/15">
              <Wallet size={14}/>
            </span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
              Incentives · {isCurrentMonth ? 'This Month' : monthLabel(cursor.year, cursor.month)}
            </p>
          </div>

          <p className="text-4xl font-extrabold tabular-nums leading-tight">
            {fmtCurrency(monthly.earned)}
          </p>
          <p className="text-xs font-semibold text-white/80 mt-0.5">
            Earned from {monthly.approvedCount} session{monthly.approvedCount === 1 ? '' : 's'}
          </p>

          {monthly.pending > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-300/95 text-amber-900 px-2.5 py-1">
              <Clock size={11} strokeWidth={2.5}/>
              <span className="text-[11px] font-extrabold">
                {fmtCurrency(monthly.pending)} pending
              </span>
              <span className="text-[10px] font-semibold opacity-80">
                · {monthly.pendingCount} awaiting approval
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── ② Month switcher ──────────────────────────────── */}
      <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-3 py-2">
        <button
          onClick={() => setCursor(c => prevMonth(c.year, c.month))}
          className="grid place-items-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-sniffy-purple hover:border-sniffy-purple/40 transition"
          aria-label="Previous month"
        >
          <ChevronLeft size={14}/>
        </button>
        <p className="text-sm font-extrabold text-gray-800">
          {monthLabel(cursor.year, cursor.month)}
        </p>
        <button
          onClick={() => setCursor(c => nextMonth(c.year, c.month))}
          disabled={isCurrentMonth}
          className="grid place-items-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-sniffy-purple hover:border-sniffy-purple/40 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-600 disabled:hover:border-gray-200"
          aria-label="Next month"
        >
          <ChevronRight size={14}/>
        </button>
      </div>

      {/* ── ③ Breakdown cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <BreakdownCard
          title="On-time Bonus"
          perUnit={ON_TIME_BONUS}
          color="#0e7490"
          accent="#ecfeff"
          Icon={Clock}
          approvedCount={typeRollup.onTimeApprovedCount}
          approvedTotal={typeRollup.onTimeApprovedTotal}
          pendingCount={typeRollup.onTimePendingCount}
          pendingTotal={typeRollup.onTimePendingTotal}
          hint="Earned when you mark arrival within scheduled time + 15 min and coordinator approves."
        />
        <BreakdownCard
          title="5★ Review Bonus"
          perUnit={REVIEW_BONUS}
          color="#9a3412"
          accent="#fff7ed"
          Icon={Star}
          approvedCount={typeRollup.reviewApprovedCount}
          approvedTotal={typeRollup.reviewApprovedTotal}
          pendingCount={typeRollup.reviewPendingCount}
          pendingTotal={typeRollup.reviewPendingTotal}
          hint="Earned for every 5-star review you collect after a session."
        />
      </div>

      {/* ── ④ Per-session list ────────────────────────────── */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">
          Sessions This Month
        </p>

        {monthSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center">
            <Sparkles size={20} className="mx-auto text-gray-300 mb-2"/>
            <p className="text-sm font-extrabold text-gray-700">No incentives yet for this month</p>
            <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto leading-snug">
              Mark arrival on time and ask happy clients for a 5-star review to start earning.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {monthSessions.map(({ s, inc }) => {
              // On-time pill state
              const onTimePill: { kind: 'earned' | 'pending' | 'missed'; amount?: number } =
                inc.onTimeApproved ? { kind: 'earned',  amount: inc.onTimeApproved } :
                inc.onTimePending  ? { kind: 'pending', amount: inc.onTimePending  } :
                                     { kind: 'missed' };
              const reviewPill: { kind: 'earned' | 'pending' | 'missed'; amount?: number } =
                inc.reviewApproved ? { kind: 'earned',  amount: inc.reviewApproved } :
                inc.reviewPending  ? { kind: 'pending', amount: inc.reviewPending  } :
                                     { kind: 'missed' };

              const total = inc.earned + inc.pending;

              return (
                <div key={s.id} className="rounded-xl border border-gray-100 bg-white p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-gray-900 truncate">
                        {s.pet_parent_name || 'Unnamed client'}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {s.session_date ? fmtDate(s.session_date) : '—'}
                        {s.scheduled_time && <> · {s.scheduled_time.slice(0,5)}</>}
                        {s.breed && <> · {s.breed}</>}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-extrabold text-sniffy-purple tabular-nums">
                        {fmtCurrency(total)}
                      </p>
                      {inc.earned > 0 && inc.pending > 0 && (
                        <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                          {fmtCurrency(inc.earned)} earned
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <IncentivePill kind={onTimePill.kind} label="On-time"     amount={onTimePill.amount}/>
                    <IncentivePill kind={reviewPill.kind} label="5★ Review"   amount={reviewPill.amount}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── ⑤ All-time strip ──────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-emerald-50/60 to-white p-3.5 flex items-center gap-3">
        <span className="grid place-items-center w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700">
          <TrendingUp size={16}/>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            All-time Earned
          </p>
          <p className="text-lg font-extrabold text-gray-900 tabular-nums leading-tight">
            {fmtCurrency(allTimeEarned)}
          </p>
        </div>
        <p className="text-[10px] text-gray-400 font-semibold text-right max-w-[40%] leading-snug">
          Across every session you've delivered with Sniffy.
        </p>
      </div>
    </div>
  );
}
