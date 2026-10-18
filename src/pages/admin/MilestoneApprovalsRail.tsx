/**
 * MilestoneApprovalsRail.tsx — Coordinator's pending approvals queue for
 * the new groomer-flow milestones (arrival on-time bonus + review claim).
 *
 * Sits at the top of AdminCalendarTab, above the existing pending-leaves
 * rail.  Two distinct sub-sections so the coordinator can scan each kind
 * separately:
 *
 *   • Arrival approvals — selfie thumbnail, scheduled vs actual arrival
 *     time, on-time / late indicator, approve / reject controls.
 *   • Review approvals — review screenshot, claimed star rating, approve
 *     / reject controls.
 *
 * Reads from grooming_sessions where arrival_bonus_status='pending' or
 * review_claim_status='pending'.  The two new partial indexes added in
 * the milestones migration make this a cheap query.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Star, Check, XCircle, Award, AlertTriangle, Clock,
  ChevronDown, ChevronRight,
} from 'lucide-react';
import type { GroomingSession } from './types';
import { fmtDate } from './types';
import {
  fetchPendingApprovals,
  approveArrivalBonus, rejectArrivalBonus,
  approveReviewClaim, rejectReviewClaim,
} from '../groomer/sessionMilestonesApi';
import {
  ON_TIME_BONUS, REVIEW_BONUS, toScheduledDate, ARRIVAL_WINDOW_MINUTES,
} from '../groomer/incentivesApi';

interface Props {
  /** Coordinator name — stamped on approve/reject for audit. */
  approvedBy: string;
  /** Whether this user can act (vs view-only). */
  allowed:    boolean;
}

export default function MilestoneApprovalsRail({ approvedBy, allowed }: Props) {
  const [rows, setRows]   = useState<GroomingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setRows(await fetchPendingApprovals());
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  // Bucket rows by which approval(s) they need.  A single session can
  // appear under both buckets if both its arrival AND review are pending.
  const arrivalRows = rows.filter(r => r.arrival_bonus_status === 'pending');
  const reviewRows  = rows.filter(r => r.review_claim_status   === 'pending');

  const total = arrivalRows.length + reviewRows.length;

  if (loading) {
    return (
      <div className="rounded-3xl bg-white border border-gray-100 px-4 py-3 text-[11px] text-gray-400">
        Loading milestone approvals…
      </div>
    );
  }

  if (total === 0) {
    return null;   // no rail when there's nothing pending
  }

  return (
    <div
      className="rounded-3xl bg-white border border-amber-200 overflow-hidden"
      style={{ boxShadow: '0 4px 16px rgba(245,158,11,0.10)' }}
    >
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full px-4 sm:px-5 py-3 flex items-center justify-between gap-2 border-b border-amber-100 bg-amber-50/60 hover:bg-amber-50"
      >
        <div className="flex items-center gap-2">
          <Award size={14} className="text-amber-700"/>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
            {total} Milestone Approval{total === 1 ? '' : 's'} Pending
          </p>
        </div>
        {collapsed ? <ChevronRight size={14} className="text-amber-700"/> : <ChevronDown size={14} className="text-amber-700"/>}
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {arrivalRows.length > 0 && (
              <div>
                <p className="px-4 sm:px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-sniffy-purple">
                  On-time bonus claims · ₹{ON_TIME_BONUS} each
                </p>
                <div className="divide-y divide-amber-50">
                  {arrivalRows.map(r => (
                    <ArrivalRow
                      key={r.id}
                      row={r}
                      allowed={allowed}
                      approvedBy={approvedBy}
                      onActed={refetch}
                    />
                  ))}
                </div>
              </div>
            )}

            {reviewRows.length > 0 && (
              <div className={arrivalRows.length > 0 ? 'border-t border-amber-100' : ''}>
                <p className="px-4 sm:px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-sniffy-purple">
                  Review claims · ₹{REVIEW_BONUS} for 5★
                </p>
                <div className="divide-y divide-amber-50">
                  {reviewRows.map(r => (
                    <ReviewRow
                      key={r.id}
                      row={r}
                      allowed={allowed}
                      approvedBy={approvedBy}
                      onActed={refetch}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Arrival approval row ─────────────────────────────────────

function ArrivalRow({ row, allowed, approvedBy, onActed }: {
  row: GroomingSession; allowed: boolean; approvedBy: string; onActed: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');

  const scheduledAt = toScheduledDate(row);
  const arrivedAt   = row.arrival_marked_at ? new Date(row.arrival_marked_at) : null;
  const diffMin = scheduledAt && arrivedAt
    ? Math.round((arrivedAt.getTime() - scheduledAt.getTime()) / 60_000)
    : null;

  async function approve() {
    if (!allowed) return;
    setBusy(true);
    const res = await approveArrivalBonus(row.id, approvedBy);
    setBusy(false);
    if (!res.ok) { alert(res.error ?? 'Failed.'); return; }
    onActed();
  }
  async function reject() {
    if (!allowed) return;
    setBusy(true);
    const res = await rejectArrivalBonus(row.id, approvedBy, note);
    setBusy(false);
    if (!res.ok) { alert(res.error ?? 'Failed.'); return; }
    setRejecting(false); setNote('');
    onActed();
  }

  return (
    <div className="px-4 sm:px-5 py-3 flex items-start gap-3">
      {/* Selfie thumb */}
      <div className="shrink-0">
        {row.arrival_selfie_url ? (
          <a href={row.arrival_selfie_url} target="_blank" rel="noopener noreferrer">
            <img
              src={row.arrival_selfie_url}
              alt="Arrival selfie"
              className="w-14 h-14 rounded-xl object-cover border border-gray-200"
            />
          </a>
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gray-100 grid place-items-center text-gray-400">
            <Camera size={16}/>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-extrabold text-gray-900 truncate">
            {row.groomer_name ?? '—'} · {row.pet_parent_name}
          </p>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            {fmtDate(row.session_date)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-600 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Clock size={11}/>Sched {row.scheduled_time ?? '—'}
          </span>
          <span>·</span>
          <span>Arrived {arrivedAt?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) ?? '—'}</span>
          {diffMin != null && (
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
              diffMin <= ARRIVAL_WINDOW_MINUTES ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {diffMin > 0 ? `+${diffMin}m` : `${diffMin}m`}
            </span>
          )}
        </div>
      </div>

      {allowed && !rejecting && (
        <div className="shrink-0 flex items-center gap-1.5">
          <button
            onClick={approve}
            disabled={busy}
            title="Approve bonus"
            className="w-9 h-9 rounded-xl grid place-items-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition disabled:opacity-50"
          >
            <Check size={16}/>
          </button>
          <button
            onClick={() => setRejecting(true)}
            disabled={busy}
            title="Reject"
            className="w-9 h-9 rounded-xl grid place-items-center bg-red-50 hover:bg-red-100 text-red-600 transition disabled:opacity-50"
          >
            <XCircle size={16}/>
          </button>
        </div>
      )}
      {allowed && rejecting && (
        <div className="shrink-0 flex flex-col items-end gap-1.5 w-[180px]">
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Reject reason"
            className="w-full px-2 py-1.5 rounded-lg border border-red-200 text-[11px] focus:border-red-400 outline-none"
          />
          <div className="flex gap-1">
            <button
              onClick={() => { setRejecting(false); setNote(''); }}
              className="px-2 py-1 rounded text-[10px] font-bold text-gray-500 bg-gray-100"
            >Cancel</button>
            <button onClick={reject} disabled={busy}
              className="px-2 py-1 rounded text-[10px] font-bold text-white bg-red-500 disabled:opacity-50"
            >Confirm</button>
          </div>
        </div>
      )}
      {!allowed && (
        <span className="shrink-0 text-[10px] text-gray-400 italic">view only</span>
      )}
    </div>
  );
}

// ─── Review approval row ──────────────────────────────────────

function ReviewRow({ row, allowed, approvedBy, onActed }: {
  row: GroomingSession; allowed: boolean; approvedBy: string; onActed: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');

  const claimedRating = row.review_claim_rating ?? 0;
  const isFiveStar    = claimedRating === 5;

  async function approve() {
    if (!allowed) return;
    setBusy(true);
    const res = await approveReviewClaim(row.id, approvedBy, claimedRating);
    setBusy(false);
    if (!res.ok) { alert(res.error ?? 'Failed.'); return; }
    onActed();
  }
  async function reject() {
    if (!allowed) return;
    setBusy(true);
    const res = await rejectReviewClaim(row.id, approvedBy, note);
    setBusy(false);
    if (!res.ok) { alert(res.error ?? 'Failed.'); return; }
    setRejecting(false); setNote('');
    onActed();
  }

  return (
    <div className="px-4 sm:px-5 py-3 flex items-start gap-3">
      {/* Proof thumb */}
      <div className="shrink-0">
        {row.review_proof_url ? (
          <a href={row.review_proof_url} target="_blank" rel="noopener noreferrer">
            <img
              src={row.review_proof_url}
              alt="Review proof"
              className="w-14 h-14 rounded-xl object-cover border border-gray-200"
            />
          </a>
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gray-100 grid place-items-center text-gray-400">
            <AlertTriangle size={16}/>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-extrabold text-gray-900 truncate">
            {row.groomer_name ?? '—'} · {row.pet_parent_name}
          </p>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            {fmtDate(row.session_date)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center gap-0.5">
            {[1,2,3,4,5].map(n => (
              <Star
                key={n}
                size={12}
                className={n <= claimedRating ? 'text-amber-400' : 'text-gray-200'}
                fill={n <= claimedRating ? '#fbbf24' : 'none'}
              />
            ))}
          </span>
          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
            isFiveStar ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {isFiveStar ? `+₹${REVIEW_BONUS}` : 'No bonus (only 5★)'}
          </span>
        </div>
      </div>

      {allowed && !rejecting && (
        <div className="shrink-0 flex items-center gap-1.5">
          <button onClick={approve} disabled={busy} title="Approve claim"
            className="w-9 h-9 rounded-xl grid place-items-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition disabled:opacity-50">
            <Check size={16}/>
          </button>
          <button onClick={() => setRejecting(true)} disabled={busy} title="Reject"
            className="w-9 h-9 rounded-xl grid place-items-center bg-red-50 hover:bg-red-100 text-red-600 transition disabled:opacity-50">
            <XCircle size={16}/>
          </button>
        </div>
      )}
      {allowed && rejecting && (
        <div className="shrink-0 flex flex-col items-end gap-1.5 w-[180px]">
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder="Reject reason"
            className="w-full px-2 py-1.5 rounded-lg border border-red-200 text-[11px] focus:border-red-400 outline-none"/>
          <div className="flex gap-1">
            <button onClick={() => { setRejecting(false); setNote(''); }}
              className="px-2 py-1 rounded text-[10px] font-bold text-gray-500 bg-gray-100">Cancel</button>
            <button onClick={reject} disabled={busy}
              className="px-2 py-1 rounded text-[10px] font-bold text-white bg-red-500 disabled:opacity-50">Confirm</button>
          </div>
        </div>
      )}
      {!allowed && (
        <span className="shrink-0 text-[10px] text-gray-400 italic">view only</span>
      )}
    </div>
  );
}
