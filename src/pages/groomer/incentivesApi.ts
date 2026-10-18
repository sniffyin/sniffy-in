/**
 * incentivesApi.ts — SINGLE SOURCE OF TRUTH for the groomer-incentive
 * policy.  Every screen in the Sniffy app (admin calendar panel,
 * milestone approvals rail, groomer earnings / calendar / overview,
 * arrival + review modals) imports its bonus amounts, eligibility
 * rules and aggregation helpers from this file.  Do NOT inline the
 * ₹25 / ₹40 numbers anywhere else — change them here and the rest of
 * the app picks the new values up.
 *
 *   • On-time bonus: ₹25 per session, payable when arrival was within
 *     scheduled_time + 15 min AND coordinator approved
 *     (`arrival_bonus_status === 'approved'`).
 *
 *   • Review bonus:  ₹40 per session, payable when the canonical review
 *     fields show a 5-star review (`review_taken && client_rating === 5`).
 *
 *   • Pending amounts (shown in calendar as orange) are bonuses where
 *     the milestone has been claimed but the coordinator hasn't approved
 *     yet — i.e. arrival_bonus_status='pending', or
 *     review_claim_status='pending' with a 5-star claim.
 *
 * Nothing here writes to Supabase — pure computation only.  The actual
 * row mutations live in sessionMilestonesApi.ts.
 */

import type { GroomingSession } from '../admin/types';

export const ON_TIME_BONUS = 25;
export const REVIEW_BONUS  = 40;

/**
 * Tolerance windows around `scheduled_time` during which marking arrival
 * counts as "on time" and the ₹25 bonus is claimable.
 *
 *   on-time window =  [scheduled - EARLY,  scheduled + LATE]
 *
 * Early arrivals are explicitly bonus-eligible: a groomer who shows up
 * 15-30 min before the slot is doing the right thing for the customer
 * (and for our brand) and shouldn't be punished by the policy.  Pre-2026
 * the window was late-only (0 → +15) which incorrectly classified early
 * arrivals as "not in window".  Bumped to the new pair below; older
 * sessions that were marked under the old policy still surface their
 * pre-recorded `groomer_on_time` flag unchanged.
 */
export const EARLY_ARRIVAL_WINDOW_MINUTES = 30;
export const LATE_ARRIVAL_WINDOW_MINUTES  = 15;

/**
 * Backwards-compatible alias.  Some UI copy still references this name.
 * Equals the late tolerance — the historical meaning of this constant.
 */
export const ARRIVAL_WINDOW_MINUTES = LATE_ARRIVAL_WINDOW_MINUTES;

/**
 * Minimum gap between marking arrived and being able to mark the session
 * complete.  Production value is 15 min — set to 0 for testing so the
 * full flow can be exercised quickly with no waiting.  Bump back to 15
 * before shipping.
 */
export const MIN_SESSION_DURATION_MINUTES = 0;

export interface SessionIncentive {
  /** Approved on-time bonus for this session (₹25 or 0). */
  onTimeApproved: number;
  /** Pending on-time bonus for this session (₹25 or 0). */
  onTimePending:  number;
  /** Approved review bonus for this session (₹40 or 0). */
  reviewApproved: number;
  /** Pending review bonus for this session (₹40 or 0). */
  reviewPending:  number;
  /** Sum of approved (= what the groomer has actually earned). */
  earned:         number;
  /** Sum of pending (= subject to coordinator's call). */
  pending:        number;
}

/**
 * Compute a single session's incentive breakdown.
 *
 * SOURCE OF TRUTH for payment is the canonical toggle on each session:
 *   - on-time:  `groomer_on_time === true`
 *   - review:   `review_taken === true && client_rating === 5`
 *
 * These toggles are surfaced and editable in SessionFormModal, so a
 * coordinator can override at any time and that override wins.  The
 * claim workflow (`*_claim_status`) syncs the canonical toggles when
 * the coordinator approves / rejects via the Approvals rail — see
 * `sessionMilestonesApi.ts:approveArrival / rejectArrival /
 * approveReviewClaim / rejectReviewClaim` and the DB defensive trigger
 * `trg_sync_incentive_canonical`.
 *
 * `*_claim_status === 'pending'` here only drives the "pending" badge
 * (orange amounts in the calendar) — it does NOT influence what's
 * actually paid.
 */
export function computeSessionIncentive(s: GroomingSession): SessionIncentive {
  const onTimeApproved = s.groomer_on_time === true              ? ON_TIME_BONUS : 0;
  const onTimePending  = !onTimeApproved && s.arrival_bonus_status === 'pending'
    ? ON_TIME_BONUS : 0;

  const reviewEarned = (
    s.review_taken === true &&
    s.client_rating === 5
  ) ? REVIEW_BONUS : 0;

  // Pending: groomer claimed 5★ but coordinator hasn't approved yet
  // and canonical fields haven't been updated through that path.
  const reviewPendingOnly =
    !reviewEarned &&
    s.review_claim_status === 'pending' &&
    s.review_claim_rating === 5
      ? REVIEW_BONUS
      : 0;

  return {
    onTimeApproved,
    onTimePending,
    reviewApproved: reviewEarned,
    reviewPending:  reviewPendingOnly,
    earned:  onTimeApproved + reviewEarned,
    pending: onTimePending  + reviewPendingOnly,
  };
}

export interface MonthlyIncentive {
  earned:           number;   // ₹ approved this month
  pending:          number;   // ₹ pending this month
  bookingsCounted:  number;   // # of sessions contributing to either bucket
  approvedCount:    number;   // # of sessions with any approved incentive
  pendingCount:     number;   // # of sessions with any pending incentive
}

/**
 * Per-bucket breakdown of incentive over an arbitrary, pre-scoped list
 * of sessions.  Unlike `computeMonthlyIncentive`, this does NOT filter
 * by (year, month) — pass in whatever slice you want totalled (a week,
 * a custom range, a single day…) and you get the on-time and review
 * splits back separately.
 *
 * Use this in any UI that needs to render "X on-time @ ₹25 + Y reviews
 * @ ₹40" cards.  Keeps the bonus constants and eligibility rules
 * defined in exactly one place.
 */
export interface IncentiveBreakdown {
  onTimeApprovedCount:  number;
  onTimeApprovedAmount: number;
  onTimePendingCount:   number;
  onTimePendingAmount:  number;
  reviewApprovedCount:  number;
  reviewApprovedAmount: number;
  reviewPendingCount:   number;
  reviewPendingAmount:  number;
  earnedTotal:          number;
  pendingTotal:         number;
  bookingsCounted:      number;
}

export function emptyIncentiveBreakdown(): IncentiveBreakdown {
  return {
    onTimeApprovedCount: 0, onTimeApprovedAmount: 0,
    onTimePendingCount:  0, onTimePendingAmount:  0,
    reviewApprovedCount: 0, reviewApprovedAmount: 0,
    reviewPendingCount:  0, reviewPendingAmount:  0,
    earnedTotal: 0, pendingTotal: 0, bookingsCounted: 0,
  };
}

/**
 * Sum incentive over a session list — no date filtering applied here.
 * The caller is responsible for pre-scoping (e.g. month, week, range).
 */
export function sumIncentivesOverSessions(
  sessions: GroomingSession[],
): IncentiveBreakdown {
  const out = emptyIncentiveBreakdown();
  for (const s of sessions) {
    const inc = computeSessionIncentive(s);
    if (inc.earned + inc.pending === 0) continue;
    out.bookingsCounted++;
    if (inc.onTimeApproved > 0) {
      out.onTimeApprovedCount++;
      out.onTimeApprovedAmount += inc.onTimeApproved;
    }
    if (inc.onTimePending > 0) {
      out.onTimePendingCount++;
      out.onTimePendingAmount += inc.onTimePending;
    }
    if (inc.reviewApproved > 0) {
      out.reviewApprovedCount++;
      out.reviewApprovedAmount += inc.reviewApproved;
    }
    if (inc.reviewPending > 0) {
      out.reviewPendingCount++;
      out.reviewPendingAmount += inc.reviewPending;
    }
    out.earnedTotal  += inc.earned;
    out.pendingTotal += inc.pending;
  }
  return out;
}

/**
 * Aggregate incentive numbers over a month.
 * Sessions are scoped by session_date in the given (year, month).
 */
export function computeMonthlyIncentive(
  sessions: GroomingSession[],
  year:  number,
  month: number,
): MonthlyIncentive {
  let earned = 0, pending = 0, bookingsCounted = 0;
  let approvedCount = 0, pendingCount = 0;
  for (const s of sessions) {
    if (!s.session_date) continue;
    const d = new Date(s.session_date + 'T00:00');
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    const inc = computeSessionIncentive(s);
    if (inc.earned + inc.pending === 0) continue;
    earned  += inc.earned;
    pending += inc.pending;
    bookingsCounted++;
    if (inc.earned  > 0) approvedCount++;
    if (inc.pending > 0) pendingCount++;
  }
  return { earned, pending, bookingsCounted, approvedCount, pendingCount };
}

// ─── Time-window helpers (arrival eligibility) ────────────────────

/**
 * Combine session_date (yyyy-mm-dd) + scheduled_time (HH:MM[:SS]) into
 * a JS Date in the user's local timezone.  Returns null if either input
 * is missing.
 */
export function toScheduledDate(session: Pick<GroomingSession, 'session_date' | 'scheduled_time'>): Date | null {
  if (!session.session_date || !session.scheduled_time) return null;
  const [hh, mm] = session.scheduled_time.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  const [yy, mo, dd] = session.session_date.split('-').map(Number);
  return new Date(yy, mo - 1, dd, hh, mm, 0, 0);
}

/**
 * Is `now` within the on-time window
 *   [scheduled - EARLY_ARRIVAL_WINDOW_MINUTES, scheduled + LATE_ARRIVAL_WINDOW_MINUTES]
 * ?
 *
 * Returns false if scheduling is missing — never auto-grant the bonus
 * when we can't compute the window.  Note: this is the policy used by
 * `markArrived` to set `groomer_on_time`, so changing the constants
 * above immediately changes what the server records on new arrivals.
 * Sessions arrived BEFORE the constants change keep their pre-recorded
 * flag.
 */
export function isWithinArrivalWindow(
  session: Pick<GroomingSession, 'session_date' | 'scheduled_time'>,
  now: Date = new Date(),
): boolean {
  const scheduled = toScheduledDate(session);
  if (!scheduled) return false;
  const start = new Date(scheduled.getTime() - EARLY_ARRIVAL_WINDOW_MINUTES * 60_000);
  const end   = new Date(scheduled.getTime() + LATE_ARRIVAL_WINDOW_MINUTES  * 60_000);
  return now >= start && now <= end;
}

/**
 * Was the groomer's recorded arrival time within the on-time window?
 *
 * Derived from `arrival_marked_at` vs `scheduled_time` ± the window —
 * NOT from `groomer_on_time`, which after the single-source-of-truth
 * migration means "earned the on-time bonus" (canonical), not
 * "arrived in window" (raw fact).
 *
 * Use this in any UI that wants to display "marked on-time" /
 * "marked late" / "arrived in window" badges that should reflect the
 * raw arrival fact regardless of approval.
 */
export function wasArrivedInWindow(
  session: Pick<GroomingSession, 'session_date' | 'scheduled_time' | 'arrival_marked_at'>,
): boolean {
  if (!session.arrival_marked_at) return false;
  const scheduled = toScheduledDate(session);
  if (!scheduled) return false;
  const arrived = new Date(session.arrival_marked_at);
  const start = new Date(scheduled.getTime() - EARLY_ARRIVAL_WINDOW_MINUTES * 60_000);
  const end   = new Date(scheduled.getTime() + LATE_ARRIVAL_WINDOW_MINUTES  * 60_000);
  return arrived >= start && arrived <= end;
}

/** Has scheduled_time already arrived (or passed)? */
export function isAfterScheduled(
  session: Pick<GroomingSession, 'session_date' | 'scheduled_time'>,
  now: Date = new Date(),
): boolean {
  const start = toScheduledDate(session);
  if (!start) return false;
  return now >= start;
}

/**
 * Has at least MIN_SESSION_DURATION_MINUTES passed since the groomer's
 * arrival?  Used to gate the "Mark Complete" button — there must be a
 * minimum service window between arrival and completion.
 *
 * Function name kept for backward compatibility with existing imports.
 */
export function hasFifteenMinutesPassedSinceArrival(
  arrivalMarkedAt: string | null,
  now: Date = new Date(),
): boolean {
  if (!arrivalMarkedAt) return false;
  const arrived = new Date(arrivalMarkedAt);
  return now.getTime() - arrived.getTime() >= MIN_SESSION_DURATION_MINUTES * 60_000;
}
