/**
 * leavesApi.ts — Supabase wrapper for the groomer_leaves table.
 *
 * Used by both:
 *   • GroomerCalendarTab  (apply / cancel own leave)
 *   • AdminCalendarTab    (read all + approve / reject)
 *
 * Schema mirror of the SQL migration:
 *   id            uuid
 *   groomer_id    text
 *   groomer_name  text
 *   leave_date    date     (yyyy-mm-dd)
 *   reason        text
 *   status        'pending' | 'approved' | 'rejected'
 *   approved_by   text | null
 *   approved_at   timestamptz | null
 *   rejected_note text | null
 *   created_at    timestamptz
 *   updated_at    timestamptz
 */

import { supabase } from '../../lib/supabase';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'lwp';

export interface GroomerLeave {
  id: string;
  groomer_id: string;
  groomer_name: string;
  leave_date: string;     // yyyy-mm-dd
  reason: string;
  status: LeaveStatus;
  approved_by: string | null;
  approved_at: string | null;
  rejected_note: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Reads ────────────────────────────────────────────────────

/** All leaves for a single groomer, newest first. */
export async function fetchLeavesForGroomer(groomerId: string): Promise<GroomerLeave[]> {
  const { data, error } = await supabase
    .from('groomer_leaves')
    .select('*')
    .eq('groomer_id', groomerId)
    .order('leave_date', { ascending: false });
  if (error) {
    console.error('[leavesApi] fetchLeavesForGroomer', error);
    return [];
  }
  return (data as GroomerLeave[]) ?? [];
}

/** All leaves across all groomers — admin / coordinator view. */
export async function fetchAllLeaves(): Promise<GroomerLeave[]> {
  const { data, error } = await supabase
    .from('groomer_leaves')
    .select('*')
    .order('leave_date', { ascending: false });
  if (error) {
    console.error('[leavesApi] fetchAllLeaves', error);
    return [];
  }
  return (data as GroomerLeave[]) ?? [];
}

// ─── Writes ───────────────────────────────────────────────────

export interface ApplyLeaveInput {
  groomer_id: string;
  groomer_name: string;
  leave_date: string;       // yyyy-mm-dd
  reason: string;
}

/**
 * Apply for leave on a date.  Returns { ok, error } — the most common error
 * is the unique constraint (already applied for that date).
 */
export async function applyLeave(input: ApplyLeaveInput): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('groomer_leaves').insert([{
    ...input,
    status: 'pending',
  }]);
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'You already have a leave entry for that day.' };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Groomer cancels their own leave (only useful while still pending). */
export async function cancelLeave(id: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('groomer_leaves').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── Approval (admin / coordinator) ───────────────────────────

export async function approveLeave(id: string, approvedBy: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('groomer_leaves')
    .update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      rejected_note: null,
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function rejectLeave(
  id: string,
  approvedBy: string,
  note?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('groomer_leaves')
    .update({
      status: 'rejected',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      rejected_note: note ?? '',
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Mark a leave as Leave-Without-Pay (LWP).
 * Treated as "approved but unpaid" — the day is still blocked on the calendar,
 * but the chip is violet to call out the unpaid nature for payroll.
 */
export async function markLeaveLwp(
  id: string,
  approvedBy: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('groomer_leaves')
    .update({
      status: 'lwp',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      rejected_note: null,
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── Monthly quota ────────────────────────────────────────────

/**
 * Each groomer gets this many paid leaves per calendar month.
 * Beyond this, additional days off are typically LWP — but the
 * coordinator always has discretion to approve as paid anyway.
 */
export const LEAVE_QUOTA_PER_MONTH = 4;

export interface MonthlyLeaveStats {
  quota:     number;   // = LEAVE_QUOTA_PER_MONTH
  paidUsed:  number;   // approved in that month
  pending:   number;   // pending in that month
  lwp:       number;   // lwp in that month
  rejected:  number;   // rejected in that month
  remaining: number;   // max(0, quota - paidUsed - pending)
  exhausted: boolean;  // remaining <= 0
}

/**
 * Compute monthly leave stats from a groomer's leaves array, scoped to
 * one calendar month.  `month` is 0-indexed like Date#getMonth().
 *
 *   • paidUsed counts approved leaves in that month.
 *   • pending counts toward "exhausted" because it might soon become approved
 *     — this errs on the side of warning the groomer earlier.
 *   • lwp + rejected are tracked separately and do NOT consume quota.
 */
export function getMonthlyLeaveStats(
  leaves: GroomerLeave[],
  year: number,
  month: number,
): MonthlyLeaveStats {
  let paidUsed = 0, pending = 0, lwp = 0, rejected = 0;
  for (const l of leaves) {
    const d = new Date(l.leave_date + 'T00:00');
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    if      (l.status === 'approved') paidUsed++;
    else if (l.status === 'pending')  pending++;
    else if (l.status === 'lwp')      lwp++;
    else if (l.status === 'rejected') rejected++;
  }
  const remaining = Math.max(0, LEAVE_QUOTA_PER_MONTH - paidUsed - pending);
  return {
    quota: LEAVE_QUOTA_PER_MONTH,
    paidUsed, pending, lwp, rejected,
    remaining,
    exhausted: remaining <= 0,
  };
}

// ─── Rejection → LWP conversion (groomer side) ────────────────

/**
 * Groomer was rejected for a leave but still wants to take the day off
 * as LWP.  Flips status `rejected` → `lwp` while preserving the original
 * rejection note as audit context inside `rejected_note`.
 *
 * Only allowed if the row is currently `rejected` — guards against accidental
 * double-conversion or sneaking past an approved leave.
 */
export async function convertRejectedToLwp(id: string): Promise<{ ok: boolean; error?: string }> {
  const { data: existing, error: readErr } = await supabase
    .from('groomer_leaves')
    .select('*')
    .eq('id', id)
    .single();
  if (readErr || !existing) return { ok: false, error: readErr?.message ?? 'Leave not found.' };
  if (existing.status !== 'rejected') {
    return { ok: false, error: 'Only rejected leaves can be converted to LWP.' };
  }
  const prior = (existing as GroomerLeave).rejected_note;
  const note  = `Originally rejected${prior ? ` ("${prior}")` : ''}; groomer opted to take as LWP.`;
  const { error } = await supabase
    .from('groomer_leaves')
    .update({
      status: 'lwp',
      rejected_note: note,
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── Coordinator direct attendance marking ───────────────────

/**
 * Four reasons a coordinator might mark a day off without a leave request:
 *
 *   • unavailable   — Groomer didn't show up or informed they can't work
 *                     (no-show, personal, sick without doc, etc.)    → LWP
 *   • weekly_off    — Groomer's weekly scheduled rest day (one per week) → Paid
 *   • not_deployed  — Groomer was available but coordinator had no
 *                     bookings to assign — company-side gap          → Paid
 *   • groomer_leave — Groomer's planned paid leave (consumes their
 *                     LEAVE_QUOTA_PER_MONTH bucket)                  → Paid
 *
 * All PAID kinds write `status:'approved'`, which `getMonthlyLeaveStats`
 * already counts toward `paidUsed` — so they automatically deduct from
 * the 4-per-month quota.  The UI surfaces remaining balance up front so
 * the coordinator sees when a groomer is out of bucket.
 *
 * NOTE: `unavailable` merges what were previously two separate LWP reasons
 * ('unavailable' + 'no_show') — both were unpaid, so they collapse into one
 * "No-show / Unavailable" tile.  Historical rows may still carry a
 * `[No-show]` reason prefix; those render fine as-is (the prefix is free text).
 */
export type AttendanceMarkKind = 'unavailable' | 'weekly_off' | 'not_deployed' | 'groomer_leave';

export const ATTENDANCE_KIND_META: Record<AttendanceMarkKind, {
  label:        string;
  consequence:  'LWP' | 'Paid';
  resultStatus: LeaveStatus;
}> = {
  unavailable:   { label: 'No-show / Unavailable',         consequence: 'LWP',  resultStatus: 'lwp'      },
  weekly_off:    { label: 'Weekly Off',                    consequence: 'Paid', resultStatus: 'approved' },
  not_deployed:  { label: 'Coordinator couldn\'t deploy',  consequence: 'Paid', resultStatus: 'approved' },
  groomer_leave: { label: 'Groomer Leave',                 consequence: 'Paid', resultStatus: 'approved' },
};

export interface MarkAttendanceInput {
  groomer_id:   string;
  groomer_name: string;
  leave_date:   string;             // yyyy-mm-dd
  kind:         AttendanceMarkKind;
  details?:     string;             // optional free-text from coordinator
  marked_by:    string;             // coordinator name (for audit)
}

/**
 * Coordinator-initiated attendance mark.  Inserts a `groomer_leaves` row
 * with the appropriate status and a structured reason.  Both groomer and
 * coordinator will see the same row on their calendars — full transparency.
 */
export async function markAttendanceWithReason(
  input: MarkAttendanceInput,
): Promise<{ ok: boolean; error?: string }> {
  const meta = ATTENDANCE_KIND_META[input.kind];
  const reason = `[${meta.label}]${input.details?.trim() ? ` ${input.details.trim()}` : ''}`;
  const { error } = await supabase.from('groomer_leaves').insert([{
    groomer_id:   input.groomer_id,
    groomer_name: input.groomer_name,
    leave_date:   input.leave_date,
    reason,
    status:       meta.resultStatus,
    approved_by:  input.marked_by,
    approved_at:  new Date().toISOString(),
  }]);
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'A leave entry already exists for that day for this groomer.' };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
