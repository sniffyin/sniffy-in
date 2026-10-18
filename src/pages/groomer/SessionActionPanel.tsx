/**
 * SessionActionPanel.tsx — In-booking groomer flow.
 *
 *   Step 1.  Mark Arrived       (mandatory gateway, with selfie)
 *   Step 2.  Mark Completed     (gated by scheduled_time + 15min from arrival)
 *   Step 3.  Collect Payment    (mode + upsell + tip + breakdown)
 *   Step 4.  Collect Review     (optional, QR + proof + star claim)
 *
 * Each step shows current state as a colored chip.  Disabled steps
 * carry a small explanatory note so the groomer always knows what
 * they're waiting on.
 *
 * After each successful action we call `onUpdated()` so the parent
 * can re-fetch and pass a fresh `session` prop in.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Camera, CheckCircle2, AlertTriangle, Star, IndianRupee,
  Wallet, MessageSquare, Lock, Clock, Award, ChevronDown,
} from 'lucide-react';
import type { GroomingSession } from '../admin/types';
import {
  ARRIVAL_WINDOW_MINUTES,
  // The two functions below are no-ops in testing mode but still
  // imported as a hook for the prod flip (see canCompleteByTime).
  // import { isAfterScheduled, hasFifteenMinutesPassedSinceArrival } from './incentivesApi';
  computeSessionIncentive,
  wasArrivedInWindow,
  ON_TIME_BONUS, REVIEW_BONUS,
} from './incentivesApi';
import MarkArrivedModal      from './MarkArrivedModal';
import MarkCompleteModal     from './MarkCompleteModal';
import CollectPaymentModal   from './CollectPaymentModal';
import CollectReviewModal    from './CollectReviewModal';

/**
 * The single next actionable step, surfaced so the parent modal can
 * put it front-and-center in a sticky footer CTA instead of making
 * the groomer scroll into the accordion to find it.
 */
export interface PrimaryAction {
  label: string;
  onAction: () => void;
  disabled: boolean;
  stepNumber: number;
  totalSteps: number;
}

interface StepConfig {
  number: number;
  title: string;
  subtitle: string;
  done: boolean;
  chip: string;
  chipColor: ChipColor;
  locked: boolean;
  lockedNote?: string;
  actionLabel: string;
  actionVariant: 'primary' | 'secondary';
  actionDisabled?: boolean;
  onAction: () => void;
  footnote?: string;
  rejectionNote?: string | null;
}

interface Props {
  session:    GroomingSession;
  onUpdated:  () => void;
  onPrimaryActionChange?: (action: PrimaryAction | null) => void;
}

export default function SessionActionPanel({ session, onUpdated, onPrimaryActionChange }: Props) {
  const [arriveOpen,   setArriveOpen]   = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [payOpen,      setPayOpen]      = useState(false);
  const [reviewOpen,   setReviewOpen]   = useState(false);

  // ── Derived state ─────────────────────────────────────────
  const hasArrived        = !!session.arrival_marked_at;
  const hasCompleted      = !!session.groomer_marked_complete_at;
  const hasPaymentRecord  = !!session.payment_collected_at;
  const isCancelled       = session.status === 'cancelled';

  // TESTING MODE — both time gates relaxed.
  //   Production rules (re-enable before shipping):
  //     canCompleteByTime = isAfterScheduled(session)
  //       && hasFifteenMinutesPassedSinceArrival(session.arrival_marked_at)
  //   Currently: as soon as arrival is marked, Mark Complete is enabled.
  const canCompleteByTime = !!session.arrival_marked_at;

  const inc = useMemo(() => computeSessionIncentive(session), [session]);

  // ── Accordion: only the current actionable step is expanded by
  // default. Completed/locked steps collapse to a one-line row so
  // the whole 4-step flow fits without a wall of scroll. Tapping a
  // done row still expands it (to view/edit); locked rows don't.
  const reviewDone =
    session.review_claim_status === 'approved' ||
    session.review_claim_status === 'pending' ||
    (!!session.review_taken && session.client_rating != null);
  // Mark Complete is no longer a one-click button — it opens
  // MarkCompleteModal so the groomer can verify the customer's
  // 4-digit code (or fall back to uploading a photo of the
  // groomed pet).  See MarkCompleteModal for the full flow.
  function onMarkComplete() {
    if (!hasArrived) return;
    setCompleteOpen(true);
  }

  // Single source of truth for all 4 steps — both the accordion list
  // and the "primary action" reported to the parent modal read from
  // this same array, so the sticky-footer CTA can never drift out of
  // sync with what the accordion itself would show as "current".
  const steps: StepConfig[] = [
    {
      number: 1,
      title: 'Mark Arrived',
      subtitle: 'Mandatory — uploads a selfie as proof of arrival.',
      done: hasArrived,
      chip: arrivalChip(session),
      chipColor: arrivalChipColor(session),
      locked: false,
      actionLabel: hasArrived ? 'View / Re-upload' : 'Mark Arrived',
      actionVariant: hasArrived ? 'secondary' : 'primary',
      onAction: () => setArriveOpen(true),
      footnote: hasArrived
        ? `Marked at ${fmtTime(session.arrival_marked_at!)}${wasArrivedInWindow(session)
            ? ` · ✓ within ${ARRIVAL_WINDOW_MINUTES}-min window (₹${ON_TIME_BONUS} bonus eligible)`
            : ` · arrived after window (no on-time bonus)`}`
        : 'Tap when you reach the customer\'s place.',
      rejectionNote: session.arrival_bonus_status === 'rejected' ? session.arrival_bonus_rejected_note : null,
    },
    {
      number: 2,
      title: 'Mark Completed',
      subtitle: 'Tells the coordinator the session is done.',
      done: hasCompleted,
      chip: hasCompleted ? 'Marked Complete' : '— Not yet',
      chipColor: hasCompleted ? 'green' : 'gray',
      locked: !hasArrived,
      lockedNote: 'Mark arrived first.',
      actionLabel: hasCompleted ? 'Done' : 'Mark Complete',
      actionVariant: hasCompleted ? 'secondary' : 'primary',
      actionDisabled: hasCompleted || !canCompleteByTime,
      onAction: hasCompleted ? () => {} : onMarkComplete,
      footnote: !hasArrived
        ? 'Locked until you mark arrived.'
        : hasCompleted
          ? `Marked at ${fmtTime(session.groomer_marked_complete_at!)}.`
          : 'Once you finish grooming, mark complete.',
    },
    {
      number: 3,
      title: 'Collect Payment',
      subtitle: 'Cash or online — includes upsell + tip support.',
      done: hasPaymentRecord,
      chip: paymentChip(session),
      chipColor: hasPaymentRecord ? 'green' : 'gray',
      locked: !hasCompleted,
      lockedNote: 'Mark complete first.',
      actionLabel: hasPaymentRecord ? 'View / Edit' : 'Collect Payment',
      actionVariant: hasPaymentRecord ? 'secondary' : 'primary',
      onAction: () => setPayOpen(true),
      footnote: hasPaymentRecord
        ? `${session.payment_mode === 'online' ? 'Online' : 'Cash'} · ₹${Number(session.total_collected ?? 0).toLocaleString('en-IN')} collected`
        : 'Show the customer the breakdown, then pick a mode.',
    },
    {
      number: 4,
      title: 'Collect Review',
      subtitle: `Optional — but only 5★ reviews count for the ₹${REVIEW_BONUS} bonus.`,
      done: reviewDone,
      chip: reviewChip(session),
      chipColor: reviewChipColor(session),
      locked: !hasPaymentRecord,
      lockedNote: 'Collect payment first.',
      actionLabel:
        session.review_claim_status === 'rejected'
          ? 'Re-submit'
          : session.review_claim_status !== 'none'
            ? 'View / Edit'
            : 'Show Review QR',
      actionVariant: session.review_claim_status === 'approved' ? 'secondary' : 'primary',
      onAction: () => setReviewOpen(true),
      footnote: reviewFootnote(session),
      rejectionNote: session.review_claim_status === 'rejected' ? session.review_claim_rejected_note : null,
    },
  ];
  const currentStepNumber = steps.findIndex(s => !s.done) + 1; // 0 if all done

  const [openStep, setOpenStep] = useState<number | null>(currentStepNumber || null);
  useEffect(() => {
    setOpenStep(currentStepNumber || null);
    // Re-sync the open step whenever the flow actually advances —
    // not on every render, so a manually-expanded "done" row stays
    // open until the user closes it or the flow moves on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasArrived, hasCompleted, hasPaymentRecord, reviewDone]);

  function toggleStep(n: number) {
    setOpenStep(openStep === n ? null : n);
  }

  // Bubble the current step up as a single "primary action" so the
  // parent modal's sticky footer can put it front-and-center — the
  // groomer shouldn't have to scroll into the accordion to find the
  // one button that matters right now.
  useEffect(() => {
    if (!onPrimaryActionChange) return;
    if (isCancelled || session.status === 'completed') {
      onPrimaryActionChange(null);
      return;
    }
    const current = currentStepNumber ? steps[currentStepNumber - 1] : null;
    onPrimaryActionChange(
      current && !current.locked
        ? {
            label: current.actionLabel,
            onAction: current.onAction,
            disabled: !!current.actionDisabled,
            stepNumber: current.number,
            totalSteps: steps.length,
          }
        : null
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepNumber, isCancelled, session.status, hasArrived, hasCompleted, hasPaymentRecord, reviewDone, session.review_claim_status]);

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700">
        This session has been cancelled by the coordinator. No further actions.
      </div>
    );
  }

  // Once the coordinator has confirmed status='completed', the stepper
  // becomes meaningless — no actions remain.  Show a compact read-only
  // summary of how the session went instead.
  if (session.status === 'completed') {
    return <CompletedSummary session={session} incentive={inc}/>;
  }

  return (
    <div
      className="bg-white rounded-2xl border border-purple-100 overflow-hidden"
      style={{ boxShadow: '0 4px 16px rgba(69,26,139,0.06)' }}
    >
      <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-sniffy-purple">
          Session Actions
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Complete each step in order. Review at the end is optional.
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {steps.map(step => (
          <AccordionStepRow
            key={step.number}
            {...step}
            open={openStep === step.number}
            onToggle={() => toggleStep(step.number)}
          />
        ))}
      </div>

      {/* Incentive footer */}
      {(inc.earned + inc.pending > 0) && (
        <div className="px-4 py-2.5 bg-purple-50/60 border-t border-purple-100 flex items-center gap-2">
          <Award size={14} className="text-sniffy-purple shrink-0"/>
          <p className="text-[11px] font-semibold text-sniffy-purple">
            {inc.earned > 0 && <>Earned <b>₹{inc.earned}</b></>}
            {inc.earned > 0 && inc.pending > 0 && ' · '}
            {inc.pending > 0 && <>Pending <b>₹{inc.pending}</b></>}
          </p>
        </div>
      )}

      {/* Modals */}
      {arriveOpen && (
        <MarkArrivedModal
          session={session}
          onClose={() => setArriveOpen(false)}
          onSubmitted={() => { setArriveOpen(false); onUpdated(); }}
        />
      )}
      {completeOpen && (
        <MarkCompleteModal
          session={session}
          onClose={() => setCompleteOpen(false)}
          onSubmitted={() => { setCompleteOpen(false); onUpdated(); }}
        />
      )}
      {payOpen && (
        <CollectPaymentModal
          session={session}
          onClose={() => setPayOpen(false)}
          onSubmitted={() => { setPayOpen(false); onUpdated(); }}
        />
      )}
      {reviewOpen && (
        <CollectReviewModal
          session={session}
          onClose={() => setReviewOpen(false)}
          onSubmitted={() => { setReviewOpen(false); onUpdated(); }}
        />
      )}
    </div>
  );
}

// ─── Sub-components & helpers ─────────────────────────────────

/**
 * Accordion row — collapses to a single line when locked or when
 * done-but-not-open, and expands to the full detail (subtitle,
 * footnote, rejection note, action button) when it's the active
 * step or the user taps it open. Keeps the 4-step flow to roughly
 * one expanded card + up to 3 one-line rows instead of 4 full cards.
 */
function AccordionStepRow({
  number, title, subtitle,
  done, open, onToggle,
  chip, chipColor,
  locked, lockedNote,
  actionLabel, actionVariant, actionDisabled,
  onAction,
  footnote, rejectionNote,
}: StepConfig & { open: boolean; onToggle: () => void }) {
  // Locked steps get a plain one-liner — nothing to view or do yet,
  // so no button, no chevron, no tap target.
  if (locked) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-2.5 opacity-60">
        <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 grid place-items-center">
          <Lock size={11}/>
        </span>
        <p className="flex-1 min-w-0 text-[12px] font-bold text-gray-400 truncate">{title}</p>
        {lockedNote && (
          <p className="text-[10px] text-gray-400 truncate max-w-[45%]">{lockedNote}</p>
        )}
      </div>
    );
  }

  const disabled = actionDisabled;
  const badgeCls = done ? 'bg-emerald-100 text-emerald-600' : 'bg-sniffy-purple text-white';

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-gray-50/80 transition"
      >
        <span className={`shrink-0 w-6 h-6 rounded-full grid place-items-center text-[11px] font-extrabold ${badgeCls}`}>
          {done ? <CheckCircle2 size={13}/> : number}
        </span>
        <p className="flex-1 min-w-0 text-[12.5px] font-extrabold text-gray-900 truncate">{title}</p>
        <span className={`shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${CHIP_CLS[chipColor]}`}>
          {chip}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-3 pl-[2.65rem]">
          <p className="text-[11px] text-gray-500 leading-snug">{subtitle}</p>
          {footnote && (
            <p className="text-[10px] text-gray-400 mt-1 leading-snug">{footnote}</p>
          )}
          {rejectionNote && (
            <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-2 py-1.5 leading-snug">
              <AlertTriangle size={11} className="shrink-0 mt-0.5"/>
              <span>Coordinator note: {rejectionNote}</span>
            </div>
          )}
          <div className="mt-2.5">
            <button
              onClick={onAction}
              disabled={disabled}
              className={[
                'w-full text-center px-3 py-2 rounded-xl text-[12px] font-extrabold transition',
                disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : actionVariant === 'primary'
                    ? 'text-white'
                    : 'bg-white text-sniffy-purple border border-purple-200',
              ].join(' ')}
              style={
                !disabled && actionVariant === 'primary'
                  ? { background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)', boxShadow: '0 4px 14px rgba(69,26,139,0.30)' }
                  : undefined
              }
            >
              {actionLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Completed summary (read-only) ────────────────────────────
//
// Replaces the full stepper once the coordinator has flipped status to
// 'completed'.  Compact rollup so the groomer can see what happened
// without re-reading every step.

function CompletedSummary({
  session, incentive,
}: { session: GroomingSession; incentive: ReturnType<typeof computeSessionIncentive>; }) {
  const arrivedAt   = session.arrival_marked_at ? fmtTime(session.arrival_marked_at) : null;
  const completedAt = session.groomer_marked_complete_at ? fmtTime(session.groomer_marked_complete_at) : null;
  const onTimeNote  =
    session.arrival_bonus_status === 'approved' ? `+₹${ON_TIME_BONUS}` :
    session.arrival_bonus_status === 'rejected' ? '✗' :
    session.arrival_marked_at && wasArrivedInWindow(session) ? 'on-time' :
    session.arrival_marked_at ? 'late' : '';
  const onTimeColor: ChipColor =
    session.arrival_bonus_status === 'approved' ? 'green' :
    session.arrival_bonus_status === 'rejected' ? 'red' : 'gray';

  const paymentTotal = Number(session.total_collected ?? 0);
  const paymentMode  = session.payment_mode === 'online' ? 'Online' : session.payment_mode === 'cash' ? 'Cash' : '';

  const reviewMain =
    session.review_taken && session.client_rating != null
      ? `★ ${session.client_rating}/5`
      : session.review_claim_status === 'rejected'
        ? '✗ rejected'
        : '—';
  const reviewChip =
    session.review_taken && session.client_rating === 5 ? `+₹${REVIEW_BONUS}` : '';

  return (
    <div
      className="bg-white rounded-2xl border border-emerald-100 overflow-hidden"
      style={{ boxShadow: '0 4px 16px rgba(16,185,129,0.08)' }}
    >
      {/* Compact header — earned amount inline with the title. */}
      <div className="px-3.5 py-2 bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-100 flex items-center gap-2">
        <CheckCircle2 size={13} className="text-emerald-600 shrink-0"/>
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 flex-1">
          Session Completed
        </p>
        {incentive.earned > 0 && (
          <span className="text-[11px] font-extrabold text-sniffy-purple inline-flex items-center gap-1">
            <Award size={11}/>₹{incentive.earned}
          </span>
        )}
      </div>

      {/* 2×2 on mobile → 1×4 on desktop.  Uses gap-px + parent grey
          background as the divider trick — works seamlessly across
          breakpoints without messy per-tile border classes. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100">
        <SummaryTile
          icon={Camera}
          label="Arrived"
          value={arrivedAt ?? '—'}
          chip={onTimeNote || undefined}
          chipColor={onTimeColor}
        />
        <SummaryTile
          icon={CheckCircle2}
          label="Completed"
          value={completedAt ?? '—'}
        />
        <SummaryTile
          icon={Wallet}
          label="Payment"
          value={paymentTotal > 0 ? `₹${paymentTotal.toLocaleString('en-IN')}` : '—'}
          chip={paymentMode || undefined}
          chipColor="green"
        />
        <SummaryTile
          icon={Star}
          label="Review"
          value={reviewMain}
          chip={reviewChip || undefined}
          chipColor="violet"
        />
      </div>
    </div>
  );
}

/**
 * Compact tile for the 2×2 / 1×4 summary grid.  Vertical layout —
 * label + icon on top, value below, optional chip pinned to the
 * top-right so it doesn't disrupt the value's font size.
 */
function SummaryTile({
  icon: Icon, label, value, chip, chipColor = 'gray',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  chip?: string;
  chipColor?: ChipColor;
}) {
  return (
    <div className="bg-white px-3 py-2 relative min-w-0">
      <div className="flex items-center gap-1 text-gray-400">
        <Icon size={10}/>
        <p className="text-[9px] font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-0.5 text-[13px] font-extrabold text-gray-900 truncate">{value}</p>
      {chip && (
        <span
          className={`absolute top-1.5 right-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded ${CHIP_CLS[chipColor]}`}
        >
          {chip}
        </span>
      )}
    </div>
  );
}

type ChipColor = 'gray' | 'orange' | 'green' | 'red' | 'violet';

const CHIP_CLS: Record<ChipColor, string> = {
  gray:   'bg-gray-100 text-gray-500',
  orange: 'bg-orange-100 text-orange-700',
  green:  'bg-emerald-100 text-emerald-700',
  red:    'bg-red-100 text-red-700',
  violet: 'bg-violet-100 text-violet-700',
};

// ─── Per-step chip helpers ────────────────────────────────────

function arrivalChip(s: GroomingSession): string {
  if (!s.arrival_marked_at) return '— Not yet';
  switch (s.arrival_bonus_status) {
    case 'approved': return '✓ On-time bonus approved';
    case 'pending':  return '⏳ Awaiting approval';
    case 'rejected': return '✗ Bonus rejected';
    default:         return wasArrivedInWindow(s) ? 'Marked' : 'Marked (late)';
  }
}
function arrivalChipColor(s: GroomingSession): ChipColor {
  if (!s.arrival_marked_at) return 'gray';
  switch (s.arrival_bonus_status) {
    case 'approved': return 'green';
    case 'pending':  return 'orange';
    case 'rejected': return 'red';
    default:         return 'gray';
  }
}

function paymentChip(s: GroomingSession): string {
  if (!s.payment_collected_at) return '— Not collected';
  return `✓ ${s.payment_mode === 'online' ? 'Online' : 'Cash'} · ₹${Number(s.total_collected ?? 0).toLocaleString('en-IN')}`;
}

function reviewChip(s: GroomingSession): string {
  // Coordinator's manual flag wins
  if (s.review_taken && s.client_rating != null) {
    return `★ ${s.client_rating}/5 confirmed`;
  }
  switch (s.review_claim_status) {
    case 'approved': return '✓ Review approved';
    case 'pending':  return '⏳ Awaiting approval';
    case 'rejected': return '✗ Claim rejected';
    default:         return '— Not collected';
  }
}
function reviewChipColor(s: GroomingSession): ChipColor {
  if (s.review_taken && s.client_rating != null) return s.client_rating === 5 ? 'green' : 'gray';
  switch (s.review_claim_status) {
    case 'approved': return 'green';
    case 'pending':  return 'orange';
    case 'rejected': return 'red';
    default:         return 'gray';
  }
}
function reviewFootnote(s: GroomingSession): string {
  if (s.review_taken && s.client_rating === 5) return `5★ confirmed — ₹${REVIEW_BONUS} bonus eligible.`;
  if (s.review_taken && s.client_rating != null) return `${s.client_rating}★ confirmed (no review bonus — only 5★ qualifies).`;
  if (s.review_claim_status === 'pending') return `You claimed ${s.review_claim_rating ?? '?'}★ — coordinator will approve.`;
  if (s.review_claim_status === 'rejected') return `Re-upload a clearer screenshot if possible.`;
  return `Show the customer the QR. Mandatory? No — but a 5★ review = ₹${REVIEW_BONUS}.`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// Re-export a couple of icons used by parent only — silences lint.
void IndianRupee; void Clock; void MessageSquare;
