/**
 * sessionMilestonesApi.ts — Supabase wrappers for the four milestone
 * actions on a grooming session (arrival, completion, payment, review
 * claim) plus the coordinator-side approve/reject calls.
 *
 * All writes are UPDATE statements on the existing `grooming_sessions`
 * row identified by `id`; no new tables.  The columns these functions
 * touch were added in migration 20260506000000.
 */

import { supabase } from '../../lib/supabase';
import {
  isWithinArrivalWindow,
  hasFifteenMinutesPassedSinceArrival,
  MIN_SESSION_DURATION_MINUTES,
} from './incentivesApi';
import type { GroomingSession, PaymentMode } from '../admin/types';

// ─── ARRIVAL ──────────────────────────────────────────────────

export interface MarkArrivedInput {
  sessionId:  string;
  selfieUrl:  string;
  /** Snapshot of the session used to compute on-time eligibility. */
  session:    Pick<GroomingSession, 'session_date' | 'scheduled_time'>;
}

/**
 * Groomer marks arrived.  Sets:
 *   - arrival_marked_at  = now
 *   - arrival_selfie_url = uploaded URL
 *   - arrival_bonus_status:
 *       'pending' if arrived within window (awaits coord approval)
 *       'none'    if late (no bonus possible, no approval needed)
 *
 * Does NOT flip `groomer_on_time` — that is the canonical "bonus earned"
 * toggle now, owned by coordinator approval (or direct edit in
 * SessionFormModal).  See `incentivesApi.ts` and the
 * `trg_sync_incentive_canonical` DB trigger.  UI that wants to display
 * "marked in window" / "marked late" should derive from
 * `arrival_marked_at` via `wasArrivedInWindow()`.
 */
export async function markArrived(input: MarkArrivedInput): Promise<{ ok: boolean; error?: string }> {
  const now    = new Date();
  const onTime = isWithinArrivalWindow(input.session, now);
  const { error } = await supabase
    .from('grooming_sessions')
    .update({
      arrival_marked_at:    now.toISOString(),
      arrival_selfie_url:   input.selfieUrl,
      arrival_bonus_status: onTime ? 'pending' : 'none',
      arrival_bonus_rejected_note: null,
    })
    .eq('id', input.sessionId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── COMPLETION ───────────────────────────────────────────────

/**
 * Groomer marks the session done.  Stamps `groomer_marked_complete_at`
 * and advances `status` to 'grooming_done' (see the guarded second write
 * below) — but never to 'completed'.  `completed` means *reconciled*,
 * and only the coordinator can say the money landed.
 *
 * Caller is expected to enforce gating (must be after scheduled_time AND
 * at least 15 min after arrival_marked_at) — but we re-validate here so
 * the rule survives even if the UI is bypassed.
 */
export interface MarkCompletedProof {
  /** Set when the groomer entered the right code from the customer. */
  method:    'code' | 'photo';
  /** Set only when method === 'photo'. */
  photoUrl?: string;
}

export async function markCompleted(
  sessionId: string,
  session: Pick<GroomingSession, 'session_date' | 'scheduled_time' | 'arrival_marked_at'>,
  proof: MarkCompletedProof,
): Promise<{ ok: boolean; error?: string }> {
  if (!session.arrival_marked_at) {
    return { ok: false, error: 'Mark arrived first before completing.' };
  }
  if (MIN_SESSION_DURATION_MINUTES > 0 && !hasFifteenMinutesPassedSinceArrival(session.arrival_marked_at)) {
    return {
      ok: false,
      error: `A session must run for at least ${MIN_SESSION_DURATION_MINUTES} minute${MIN_SESSION_DURATION_MINUTES === 1 ? '' : 's'} before it can be marked complete.`,
    };
  }
  if (proof.method === 'photo' && !proof.photoUrl) {
    return { ok: false, error: 'Photo URL missing for photo-based completion.' };
  }

  const { error } = await supabase
    .from('grooming_sessions')
    .update({
      groomer_marked_complete_at: new Date().toISOString(),
      completion_method:          proof.method,
      // Photo URL only set for the photo path (don't clobber on code path).
      ...(proof.method === 'photo' ? { completion_photo_url: proof.photoUrl } : {}),
    })
    .eq('id', sessionId);
  if (error) return { ok: false, error: error.message };

  // ── Advance status → 'grooming_done' ────────────────────────────
  //
  // Deliberately a SECOND, separately-guarded statement rather than one
  // more key in the update above:
  //
  //   • The `.in('status', …)` filter is evaluated server-side as part
  //     of the UPDATE's WHERE clause, so the read and the write are one
  //     atomic operation.  There is no window in which a coordinator
  //     marking the row 'completed' from the dashboard could be
  //     overwritten by a stale status we'd read on the client.  Any
  //     row not in one of the two listed states simply matches zero
  //     rows and is left exactly as it was.
  //   • Folding `status` into the update above would instead make the
  //     whole statement conditional — a coordinator having already
  //     closed the row would then also lose the completion timestamp
  //     and proof, which is the record of the groomer's work.
  //
  // A failure here is NOT fatal: the milestone (the thing the groomer
  // actually did, and what their incentive is computed from) is already
  // recorded.  Surfacing an error would show the groomer a red toast
  // for a completion that saved fine, and invite a retry that
  // re-stamps the timestamp.  The coordinator can set the status by
  // hand — that path exists anyway for the groomer who forgets to tap.
  const { error: statusErr } = await supabase
    .from('grooming_sessions')
    .update({ status: 'grooming_done' })
    .eq('id', sessionId)
    .in('status', ['scheduled', 'groomer_assigned']);
  if (statusErr) {
    console.warn('[markCompleted] status advance to grooming_done failed', statusErr);
  }

  return { ok: true };
}

// ─── PAYMENT ──────────────────────────────────────────────────

export interface CollectPaymentInput {
  sessionId:    string;
  mode:         PaymentMode;        // 'cash' | 'online'
  upsellAmount: number;
  tipAmount:    number;
  notes?:       string;
}

/** Records the payment.  total_collected is auto-computed by the DB. */
export async function collectPayment(input: CollectPaymentInput): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('grooming_sessions')
    .update({
      payment_collected_at: new Date().toISOString(),
      payment_mode:         input.mode,
      upsell_amount:        Math.max(0, input.upsellAmount || 0),
      tip_amount:           Math.max(0, input.tipAmount || 0),
      payment_notes:        input.notes?.trim() || null,
    })
    .eq('id', input.sessionId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── REVIEW CLAIM ─────────────────────────────────────────────

export interface ClaimReviewInput {
  sessionId:  string;
  proofUrl:   string;
  rating:     number;     // 1-5; only 5 is incentive-eligible
}

/**
 * Groomer claims that a review was taken.  Sets the claim layer
 * (review_proof_url, review_claim_*) and leaves the canonical
 * fields (review_taken, client_rating) untouched until the
 * coordinator approves.  Status becomes 'pending'.
 */
export async function claimReview(input: ClaimReviewInput): Promise<{ ok: boolean; error?: string }> {
  if (input.rating < 1 || input.rating > 5) {
    return { ok: false, error: 'Rating must be between 1 and 5.' };
  }
  const { error } = await supabase
    .from('grooming_sessions')
    .update({
      review_proof_url:           input.proofUrl,
      review_claim_at:            new Date().toISOString(),
      review_claim_rating:        input.rating,
      review_claim_status:        'pending',
      review_claim_rejected_note: null,
    })
    .eq('id', input.sessionId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── COORDINATOR APPROVALS ────────────────────────────────────

/**
 * Approve the on-time bonus claim — flips canonical too:
 *   groomer_on_time = true
 * Mirrors `approveReviewClaim`.  The defensive DB trigger would do this
 * on its own, but we set it explicitly so the round-trip UI sees the
 * new state immediately on the next refetch.
 */
export async function approveArrivalBonus(
  sessionId: string,
  approvedBy: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('grooming_sessions')
    .update({
      arrival_bonus_status:        'approved',
      arrival_bonus_approved_by:   approvedBy,
      arrival_bonus_approved_at:   new Date().toISOString(),
      arrival_bonus_rejected_note: null,
      groomer_on_time:             true,
    })
    .eq('id', sessionId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Reject the on-time bonus claim.  Resets canonical so the ₹25 stops
 * accruing — coordinator can still re-toggle `groomer_on_time` directly
 * in SessionFormModal if they change their mind without re-routing
 * through the Approvals rail.
 */
export async function rejectArrivalBonus(
  sessionId: string,
  approvedBy: string,
  note?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('grooming_sessions')
    .update({
      arrival_bonus_status:        'rejected',
      arrival_bonus_approved_by:   approvedBy,
      arrival_bonus_approved_at:   new Date().toISOString(),
      arrival_bonus_rejected_note: note?.trim() || null,
      groomer_on_time:             false,
    })
    .eq('id', sessionId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Approve the review claim — flips the canonical fields too:
 *   review_taken   = true
 *   client_rating  = the groomer's claimed rating (coordinator can
 *                    edit later from SessionFormModal if they
 *                    disagree with the rating).
 */
export async function approveReviewClaim(
  sessionId:        string,
  approvedBy:       string,
  claimedRating:    number,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('grooming_sessions')
    .update({
      review_claim_status:        'approved',
      review_claim_approved_by:   approvedBy,
      review_claim_approved_at:   new Date().toISOString(),
      review_claim_rejected_note: null,
      review_taken:               true,
      client_rating:              claimedRating,
    })
    .eq('id', sessionId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function rejectReviewClaim(
  sessionId:  string,
  approvedBy: string,
  note?:      string,
): Promise<{ ok: boolean; error?: string }> {
  // Reject the claim AND reset the canonical review_taken flag so the
  // ₹40 bonus stops accruing.  client_rating is preserved as audit history
  // — coordinator can edit it via SessionFormModal if they want a different
  // canonical record (e.g. they confirmed the review happened but at 4★).
  const { error } = await supabase
    .from('grooming_sessions')
    .update({
      review_claim_status:        'rejected',
      review_claim_approved_by:   approvedBy,
      review_claim_approved_at:   new Date().toISOString(),
      review_claim_rejected_note: note?.trim() || null,
      review_taken:               false,
    })
    .eq('id', sessionId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── Reads — pending approval queue ──────────────────────────

/**
 * Sessions awaiting coordinator review of either arrival bonus or
 * review claim.  Used by the new "Approvals" rail on the admin side.
 */
export async function fetchPendingApprovals(): Promise<GroomingSession[]> {
  const { data, error } = await supabase
    .from('grooming_sessions')
    .select('*')
    .or('arrival_bonus_status.eq.pending,review_claim_status.eq.pending')
    .order('session_date', { ascending: false });
  if (error) {
    console.error('[fetchPendingApprovals]', error);
    return [];
  }
  return (data as GroomingSession[]) ?? [];
}
