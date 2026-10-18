/**
 * groomer/GroomerOverviewTab.tsx
 *
 * Home is an action screen, not a stats screen:
 *
 *   ▸ Today's schedule — one continuous vertical timeline (shared
 *     time+dot+rail treatment for every row) instead of a separate hero
 *     card plus a list. The next job leads, expanded with full prep info
 *     (address, medical alert, package, add-ons, amount), Navigate/Call,
 *     and the 4-step indicator; same-day jobs after it follow compact
 *     with the same fields. Tapping any row opens it in Bookings, where
 *     SessionActionPanel runs the real 4-step flow (arrival selfie,
 *     completion code, payment, review).
 *   ▸ "Needs your action" queue — uncollected cash, rejected bonus
 *     claims, unasked reviews. Sits below the timeline; renders nothing
 *     when empty.
 *   ▸ A thin monthly-incentive ribbon at the bottom.
 *
 * Fetches only rows where groomer_id = groomer.id — zero admin data exposed.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, ChevronRight, Clock, MapPin, Phone, Navigation, MessageCircle,
  AlertTriangle, Wallet, Camera, Star, CheckCircle2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  GroomingSession, fmtDate, fmtCurrency,
} from '../admin/types';
import type { AdminUser } from '../admin/authStore';
import WeatherWidget from '../../components/WeatherWidget';
import { formatTime12h } from './GroomerBookingsTab';
import {
  computeMonthlyIncentive, toScheduledDate,
  ON_TIME_BONUS, EARLY_ARRIVAL_WINDOW_MINUTES, LATE_ARRIVAL_WINDOW_MINUTES,
} from './incentivesApi';
import SessionPetLines from '../admin/SessionPetLines';
import { useSessionPetDisplay } from '../admin/useSessionPets';

type NavigableTab = 'overview' | 'bookings' | 'calendar' | 'earnings';

// ─── Small helpers ────────────────────────────────────────────

function fmtClock(d: Date): string {
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function fmtDuration(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}

const isDoneFromGroomerSide = (s: GroomingSession) =>
  s.status === 'completed' || !!s.groomer_marked_complete_at;

// ─── Component ────────────────────────────────────────────────

export default function GroomerOverviewTab({
  groomer,
  onNavigate,
  onOpenSession,
}: {
  groomer: AdminUser;
  onNavigate?: (tab: NavigableTab) => void;
  onOpenSession?: (sessionId: string) => void;
}) {
  const [sessions, setSessions] = useState<GroomingSession[]>([]);
  const [loading, setLoading]   = useState(true);
  // Only today/upcoming visits are listed with pet details — don't query the
  // groomer's whole history.
  const recentSessions = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    const cutoff = d.toISOString().slice(0, 10);
    return sessions.filter(x => x.session_date >= cutoff);
  }, [sessions]);
  const petDisplay = useSessionPetDisplay(recentSessions);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data } = await supabase
        .from('grooming_sessions')
        .select('*')
        .eq('groomer_id', groomer.groomer_id ?? groomer.id)
        .order('session_date', { ascending: false });
      setSessions((data as GroomingSession[]) ?? []);
      setLoading(false);
    }
    fetch();
  }, [groomer.groomer_id, groomer.id]);

  // Live "now" — drives the countdown/on-time window on the hero card.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const openSession = (id: string) => onOpenSession?.(id);

  // ─── Derived stats ─────────────────────────────────────────
  const todayStr = now.toISOString().slice(0, 10);
  const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const completed = sessions.filter(s =>
    s.status !== 'cancelled' && isDoneFromGroomerSide(s)
  );
  const thisMonth = completed.filter(s => s.session_date?.startsWith(thisMonthStr));

  const upcoming = sessions
    .filter(s =>
      !isDoneFromGroomerSide(s) &&
      (s.status === 'scheduled' || s.status === 'groomer_assigned') &&
      s.session_date === todayStr
    )
    .sort((a, b) => {
      const d = a.session_date.localeCompare(b.session_date);
      if (d !== 0) return d;
      return (a.scheduled_time ?? '99:99:99').localeCompare(b.scheduled_time ?? '99:99:99');
    });

  const nextSession = upcoming[0] ?? null;
  // Only bundle same-day jobs into the timeline when the next job is
  // actually today — a future day just previews its single next job.
  const restOfToday = nextSession && nextSession.session_date === todayStr
    ? upcoming.slice(1).filter(s => s.session_date === todayStr)
    : [];
  // One continuous timeline: the next job (expanded, actionable) leads,
  // same-day jobs after it follow compact.
  const timelineItems = nextSession ? [nextSession, ...restOfToday] : [];

  // ── Earnings (incentives) for the current month.
  const monthlyInc = computeMonthlyIncentive(completed, now.getFullYear(), now.getMonth());

  // ─── "Needs your action" queue ───────────────────────────────
  // Ranked worst-first: cash sitting uncollected costs the most if
  // forgotten, then bonus claims a coordinator bounced back.
  interface QueueItem {
    session: GroomingSession;
    tint: 'red' | 'amber' | 'purple';
    Icon: React.ElementType;
    title: string;
    subtitle: string;
    actionLabel: string;
  }

  const unpaid: QueueItem[] = completed
    .filter(s => s.status !== 'completed' && !s.payment_collected_at)
    .sort((a, b) => a.session_date.localeCompare(b.session_date))
    .map(s => ({
      session: s,
      tint: 'red',
      Icon: Wallet,
      title: `${fmtCurrency(s.total_collected || s.booking_amount || 0)} not collected`,
      subtitle: `${s.pet_parent_name} · ${fmtDate(s.session_date)}`,
      actionLabel: 'Collect',
    }));

  const arrivalRejected: QueueItem[] = sessions
    .filter(s => s.arrival_bonus_status === 'rejected')
    .map(s => ({
      session: s,
      tint: 'amber',
      Icon: Camera,
      title: 'Arrival selfie rejected',
      subtitle: s.arrival_bonus_rejected_note
        ? `"${s.arrival_bonus_rejected_note}" · ${s.pet_parent_name}`
        : `${s.pet_parent_name} · ₹${ON_TIME_BONUS} on hold`,
      actionLabel: 'Re-upload',
    }));

  const reviewRejected: QueueItem[] = sessions
    .filter(s => s.review_claim_status === 'rejected')
    .map(s => ({
      session: s,
      tint: 'amber',
      Icon: Star,
      title: 'Review claim rejected',
      subtitle: s.review_claim_rejected_note
        ? `"${s.review_claim_rejected_note}" · ${s.pet_parent_name}`
        : `${s.pet_parent_name} · re-check the rating`,
      actionLabel: 'Re-submit',
    }));

  const reviewUnasked: QueueItem[] = completed
    .filter(s =>
      !!s.payment_collected_at &&
      !s.review_taken &&
      s.review_claim_status === 'none'
    )
    .sort((a, b) => a.session_date.localeCompare(b.session_date))
    .map(s => ({
      session: s,
      tint: 'purple',
      Icon: Star,
      title: 'Review not asked',
      subtitle: `${s.pet_parent_name} · ₹40 still claimable`,
      actionLabel: 'Show QR',
    }));

  const allQueueItems = [...unpaid, ...arrivalRejected, ...reviewRejected, ...reviewUnasked];
  const queueItems = allQueueItems.slice(0, 4);
  const queueOverflow = allQueueItems.length - queueItems.length;

  const tintClasses: Record<QueueItem['tint'], { bg: string; text: string }> = {
    red:    { bg: '#FCEBEB', text: '#A32D2D' },
    amber:  { bg: '#FAEEDA', text: '#854F0B' },
    purple: { bg: '#EEEDFE', text: '#3C3489' },
  };

  const bannerColors: Record<'amber' | 'red' | 'green' | 'neutral', { bg: string; text: string }> = {
    amber:   { bg: '#FAEEDA', text: '#854F0B' },
    green:   { bg: '#EAF3DE', text: '#3B6D11' },
    red:     { bg: '#FCEBEB', text: '#A32D2D' },
    neutral: { bg: '#F1EFE8', text: '#5F5E5A' },
  };

  const card   = 'bg-white rounded-2xl border border-gray-100';
  const shadow = { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' };

  const firstName = (groomer.name ?? '').split(' ')[0] || 'there';

  // ─── Hero cockpit derived state ──────────────────────────────
  const scheduledDate = nextSession ? toScheduledDate(nextSession) : null;
  const isNextToday = nextSession?.session_date === todayStr;
  const hasArrived = !!nextSession?.arrival_marked_at;

  let heroBanner: { tone: 'amber' | 'red' | 'green' | 'neutral'; text: string; sub?: string } | null = null;
  if (nextSession && scheduledDate && isNextToday && !hasArrived) {
    const windowStart = new Date(scheduledDate.getTime() - EARLY_ARRIVAL_WINDOW_MINUTES * 60_000);
    const windowEnd   = new Date(scheduledDate.getTime() + LATE_ARRIVAL_WINDOW_MINUTES * 60_000);
    const windowText = `on-time window ${fmtClock(windowStart)}–${fmtClock(windowEnd)}`;
    if (now < windowStart) {
      const minsToWindow = (windowStart.getTime() - now.getTime()) / 60_000;
      heroBanner = minsToWindow <= 60
        ? { tone: 'amber', text: `Leave in ${fmtDuration(minsToWindow)}`, sub: windowText }
        : { tone: 'neutral', text: `Scheduled ${fmtClock(scheduledDate)}`, sub: windowText };
    } else if (now <= windowEnd) {
      heroBanner = { tone: 'green', text: `On-time window open · ₹${ON_TIME_BONUS} bonus live`, sub: windowText };
    } else {
      heroBanner = { tone: 'red', text: 'Past the on-time window', sub: `${windowText} · no bonus now` };
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse py-8">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl"/>)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* ── Header — plain greeting, no boxed banner. The shared dashboard
          chrome above this already carries a solid purple band ("Welcome
          back / {name}"); stacking a second one here just reads as loud.
          Only the weather keeps a touch of color, in its own small pill. */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between gap-3 px-1"
      >
        <div className="min-w-0">
          <h2 className="text-[17px] font-extrabold leading-tight">
            <span className="text-gray-900">Hello, </span>
            <span style={{ color: '#7c3aed' }}>{firstName}</span>
          </h2>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">
            {upcoming.length > 0
              ? `${upcoming.length} session${upcoming.length === 1 ? '' : 's'} ahead`
              : 'No sessions queued today'}
          </p>
        </div>
        <div className="shrink-0 px-2.5 py-1.5 rounded-full" style={{ background: '#2b0f5c' }}>
          <WeatherWidget variant="chip"/>
        </div>
      </motion.div>

      {/* ── Today's schedule — a journey/tracking-style layout: each session
          is its own card, connected by a dashed rail with a stop-marker per
          card, like a train line. The next job's card is expanded with prep
          info + actions; the ones after it stay compact. */}
      {timelineItems.length > 0 ? (
        <div>
          <div className="px-1 pb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {isNextToday ? "Today's schedule" : fmtDate(nextSession!.session_date)}
            </p>
            <span className="text-[10px] font-bold text-gray-400">
              {timelineItems.length} session{timelineItems.length === 1 ? '' : 's'}
            </span>
          </div>

          {timelineItems.map((s, i) => {
            const isNext = i === 0;
            // The arrival flow (Navigate/Call, step indicator, Mark arrived) only
            // makes sense for the next job if it's actually happening today —
            // a job scheduled for a future date isn't actionable yet.
            const isActionableNext = isNext && isNextToday;
            const isLast = i === timelineItems.length - 1;
            const { hhmm, meridiem } = formatTime12h(s.scheduled_time);
            const rowRawPhone = (s.phone ?? '').replace(/\D/g, '');
            const rowDialPhone = rowRawPhone ? (rowRawPhone.startsWith('91') ? rowRawPhone : `91${rowRawPhone}`) : '';
            const rowGpsUrl = (s.gps_location ?? '').trim();
            const rowWhatsappUrl = rowDialPhone ? `https://wa.me/${rowDialPhone}` : '';

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.12, duration: 0.25 }}
                className="flex items-stretch gap-3"
              >
                {/* rail: a stop-marker per card, dashed track running through them */}
                <div className="w-5 flex flex-col items-center shrink-0 pt-4">
                  <span
                    className={isNext ? 'w-3.5 h-3.5 rounded-full shrink-0' : 'w-3 h-3 rounded-full shrink-0'}
                    style={isNext ? { background: '#451a8b', boxShadow: '0 0 0 4px #EEEDFE' } : { background: '#451a8b' }}
                  />
                  {!isLast && (
                    <span className="flex-1 w-0 mt-1 mb-1" style={{ borderLeft: '2px dashed #D8D2F0' }}/>
                  )}
                </div>

                {/* the session's own card — a distinct stop on the line */}
                <div
                  className={`${card} flex-1 min-w-0 p-4 ${isLast ? 'mb-1' : 'mb-3'} ${isNext ? 'border-l-4' : ''}`}
                  style={{ ...shadow, ...(isNext ? { borderLeftColor: '#451a8b' } : {}) }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`font-black text-sniffy-purple leading-none tracking-tight ${isNext ? 'text-[22px]' : 'text-[18px]'}`}>
                      {hhmm || '--:--'}
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide ml-1">{meridiem}</span>
                    </span>
                    {!isNext && <ChevronRight size={13} className="text-gray-300 shrink-0 mt-1" onClick={() => openSession(s.id)}/>}
                  </div>

                  {isActionableNext && heroBanner && (
                    <span
                      className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full mt-1.5"
                      style={{ background: bannerColors[heroBanner.tone].bg, color: bannerColors[heroBanner.tone].text }}
                    >
                      <Clock size={10}/> {heroBanner.text}
                    </span>
                  )}

                  <div className="cursor-pointer mt-1.5" onClick={() => openSession(s.id)}>
                    <p className={`font-bold text-gray-900 truncate ${isNext ? 'text-[15px]' : 'text-[13.5px]'}`}>
                      {s.pet_parent_name}
                    </p>
                    {petDisplay.get(s.id) ? (
                      <SessionPetLines pets={petDisplay.get(s.id)} className="mt-0.5"/>
                    ) : (
                    <p className="text-[11px] text-gray-500 truncate">
                      {s.pet_type === 'dog' ? '🐶' : '🐱'} {s.breed ?? 'Unknown breed'}
                      {s.pet_age ? ` · ${s.pet_age}` : ''}
                    </p>
                    )}

                    {s.address && (
                      <p className="flex items-start gap-1 text-[11px] text-gray-500 mt-1.5">
                        <MapPin size={11} className="text-sniffy-purple mt-0.5 shrink-0"/>
                        <span className="truncate">{s.address}</span>
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {s.medical_issues && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: '#FCEBEB', color: '#791F1F' }}>
                          <AlertTriangle size={10}/> {s.medical_issues}
                        </span>
                      )}
                      {!petDisplay.get(s.id) && s.package && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: '#EEEDFE', color: '#3C3489' }}>
                          {s.package}
                        </span>
                      )}
                      {!petDisplay.get(s.id) && s.add_ons?.map((addon, idx) => (
                        <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: '#EEEDFE', color: '#3C3489' }}>
                          + {addon}
                        </span>
                      ))}
                      {s.booking_amount > 0 && (
                        <span className="text-[11px] font-extrabold text-gray-900 ml-auto shrink-0">
                          {fmtCurrency(s.booking_amount)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Navigate / Call take the width; WhatsApp is a small icon-only
                      button since it's the least-used of the three. Missing data
                      disables the button and says so instead of hiding it. */}
                  <div className="flex gap-2 mt-3">
                    <a
                      href={rowGpsUrl || undefined}
                      target={rowGpsUrl ? '_blank' : undefined}
                      rel={rowGpsUrl ? 'noopener noreferrer' : undefined}
                      onClick={e => { if (!rowGpsUrl) e.preventDefault(); }}
                      className={`flex-1 flex items-center justify-center gap-1 rounded-lg font-bold truncate ${isNext ? 'py-2 text-[12px]' : 'py-1.5 text-[10.5px]'} ${
                        rowGpsUrl ? 'text-white' : 'text-gray-400 cursor-not-allowed'
                      }`}
                      style={rowGpsUrl ? { background: 'linear-gradient(135deg, #7c3aed 0%, #451a8b 100%)' } : { background: '#F1EFE8' }}
                    >
                      <Navigation size={isNext ? 13 : 11} className="shrink-0"/>
                      <span className="truncate">{rowGpsUrl ? 'Navigate' : 'Not available'}</span>
                    </a>
                    <a
                      href={rowDialPhone ? `tel:${s.phone}` : undefined}
                      onClick={e => { if (!rowDialPhone) e.preventDefault(); }}
                      className={`flex-1 flex items-center justify-center gap-1 rounded-lg font-bold border truncate ${isNext ? 'py-2 text-[12px]' : 'py-1.5 text-[10.5px]'} ${
                        rowDialPhone ? 'text-gray-700 border-gray-200' : 'text-gray-400 border-gray-100 cursor-not-allowed'
                      }`}
                    >
                      <Phone size={isNext ? 13 : 11} className="shrink-0"/>
                      <span className="truncate">{rowDialPhone ? 'Call' : 'Not available'}</span>
                    </a>
                    <a
                      href={rowWhatsappUrl || undefined}
                      target={rowWhatsappUrl ? '_blank' : undefined}
                      rel={rowWhatsappUrl ? 'noopener noreferrer' : undefined}
                      onClick={e => { if (!rowWhatsappUrl) e.preventDefault(); }}
                      aria-label={rowWhatsappUrl ? 'WhatsApp' : 'WhatsApp — not available'}
                      title={rowWhatsappUrl ? 'WhatsApp' : 'Not available'}
                      className={`shrink-0 flex items-center justify-center rounded-lg border ${isNext ? 'w-9 h-9' : 'w-7 h-7'} ${
                        rowWhatsappUrl ? 'text-green-700 border-green-200' : 'text-gray-400 border-gray-100 cursor-not-allowed'
                      }`}
                      style={rowWhatsappUrl ? { background: '#EAF7EE' } : undefined}
                    >
                      <MessageCircle size={isNext ? 15 : 12}/>
                    </a>
                  </div>

                  {/* Step indicator + primary CTA — only for the next job when it's
                      actually today; jumps into the real 4-step flow (SessionActionPanel)
                      in Bookings rather than duplicating the modals here. */}
                  {isActionableNext && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-0 mb-2">
                        {['Arrive', 'Complete', 'Payment', 'Review'].map((label, si) => (
                          <div key={label} className="flex-1 text-center">
                            <div
                              className="w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold"
                              style={si === 0
                                ? { background: '#451a8b', color: '#fff' }
                                : { background: '#D3D1C7', color: '#2C2C2A', opacity: 0.6 }}
                            >
                              {si + 1}
                            </div>
                            <p className="text-[8px] text-gray-500 mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => openSession(s.id)}
                        className="w-full py-2.5 rounded-xl text-[13px] font-bold"
                        style={{ background: '#f6ac0a', color: '#412402' }}
                      >
                        {hasArrived ? 'Continue session' : 'Mark arrived'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className={`${card} p-6 text-center`} style={shadow}>
          <Calendar size={26} className="mx-auto mb-2 text-gray-300"/>
          <p className="text-[13px] font-semibold text-gray-500">No upcoming sessions</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Enjoy the breather.</p>
        </div>
      )}

      {/* ── Needs your action — renders nothing when empty. ────── */}
      {queueItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="space-y-2"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
            Needs your action
          </p>
          {queueItems.map(item => (
            <button
              key={`${item.title}-${item.session.id}`}
              onClick={() => openSession(item.session.id)}
              className={`${card} w-full flex items-center gap-3 px-3.5 py-3 text-left`}
              style={shadow}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: tintClasses[item.tint].bg, color: tintClasses[item.tint].text }}
              >
                <item.Icon size={15}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 truncate">{item.title}</p>
                <p className="text-[11px] text-gray-500 truncate">{item.subtitle}</p>
              </div>
              <span className="text-[11px] font-bold text-sniffy-purple shrink-0">{item.actionLabel}</span>
            </button>
          ))}
          {queueOverflow > 0 && (
            <button
              onClick={() => onNavigate?.('bookings')}
              className="w-full text-center text-[11px] font-semibold text-sniffy-purple py-1"
            >
              +{queueOverflow} more in Bookings
            </button>
          )}
        </motion.div>
      )}

      {/* ── Earnings ribbon ──────────────────────────────────────── */}
      <motion.button
        onClick={() => onNavigate?.('earnings')}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}
        className={`${card} w-full flex items-center gap-2 px-4 py-3 text-left`} style={shadow}
      >
        <CheckCircle2 size={14} className="text-green-500 shrink-0"/>
        <span className="text-[12px] text-gray-600 flex-1">
          {thisMonth.length} job{thisMonth.length === 1 ? '' : 's'} this month ·{' '}
          <span className="font-bold text-gray-900">{fmtCurrency(monthlyInc.earned)}</span> incentive
          {monthlyInc.pending > 0 && (
            <span className="text-amber-600"> · {fmtCurrency(monthlyInc.pending)} pending</span>
          )}
        </span>
        <ChevronRight size={13} className="text-gray-300 shrink-0"/>
      </motion.button>

      {/* Empty state — no sessions at all, ever. */}
      {sessions.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Calendar size={32} className="mx-auto mb-3 opacity-30"/>
          <p className="text-sm font-semibold">No sessions yet</p>
          <p className="text-xs mt-1">Your grooming history will appear here</p>
        </div>
      )}
    </div>
  );
}
