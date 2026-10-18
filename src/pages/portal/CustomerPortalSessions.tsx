/**
 * portal/CustomerPortalSessions.tsx — Phase 4
 *
 * Read-only session history.  Each row expands to show full details +
 * a printable "Receipt" view.  No editing — admin owns session writes.
 *
 * Splits sessions into Upcoming (session_date >= today) and Past so
 * customers see what's coming first.  Status badge follows the same
 * color rules as the admin app.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors, FileText, Star, ChevronDown, ChevronUp, AlertCircle,
  CalendarCheck, Ban, Loader2, X, Clock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Customer, SessionChangeRequest } from '../admin/customerTypes';
import SessionChat from '../../components/SessionChat';

interface SessionRow {
  id: string;
  session_date: string;
  scheduled_time: string | null;
  status: string;
  pet_type: 'dog' | 'cat';
  breed: string | null;
  pet_age: string | null;
  package: string | null;
  add_ons: string[] | null;
  booking_amount: number;
  total_collected: number;
  payment_verified: boolean;
  payment_mode: string | null;
  groomer_name: string | null;
  next_due_date: string | null;
  source: string | null;
  notes: string | null;
  client_rating: number | null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtMoney(n: number | null | undefined): string {
  if (!n) return '₹0';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export default function CustomerPortalSessions({ customer }: {
  customer: Customer;
  onCustomerChanged: () => void;
}) {
  const [sessions, setSessions]   = useState<SessionRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [expandedId, setExpanded] = useState<string | null>(null);
  const [receiptFor, setReceipt]  = useState<SessionRow | null>(null);
  // Phase 6b — pending portal-submitted change requests, keyed by
  // session_id so each card can show a "Change requested" pill and
  // disable its reschedule/cancel buttons.
  const [pendingReqs, setPendingReqs] = useState<Record<string, SessionChangeRequest>>({});
  const [changeFor, setChangeFor]     = useState<{ session: SessionRow; type: 'reschedule' | 'cancel' } | null>(null);

  async function reload() {
    setLoading(true); setError(null);
    try {
      // Explicit customer scope — RLS is defence-in-depth, not the
      // sole filter.  Without this, the test-bypass sign-in (no
      // auth.uid) would render every session in the DB.
      const [sRes, rRes] = await Promise.all([
        supabase
          .from('grooming_sessions')
          .select('id, session_date, scheduled_time, status, pet_type, breed, pet_age, package, add_ons, booking_amount, total_collected, payment_verified, payment_mode, groomer_name, next_due_date, source, notes, client_rating')
          .eq('customer_id', customer.id)
          .order('session_date', { ascending: false }),
        supabase
          .from('session_change_requests')
          .select('*')
          .eq('customer_id', customer.id)
          .eq('status', 'pending'),
      ]);
      if (sRes.error) throw sRes.error;
      if (rRes.error) throw rRes.error;
      setSessions((sRes.data ?? []) as SessionRow[]);
      const reqMap: Record<string, SessionChangeRequest> = {};
      ((rRes.data ?? []) as SessionChangeRequest[]).forEach(r => {
        if (r.session_id) reqMap[r.session_id] = r;
      });
      setPendingReqs(reqMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setLoading(false); }
  }

  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [customer.id]);

  // `grooming_done` is a delivered session, so it belongs in history
  // alongside `completed` — never in "upcoming".  Whether our books are
  // reconciled is our problem, not something the customer should see
  // their finished appointment reclassified over.
  const isDelivered = (s: SessionRow) =>
    s.status === 'completed' || s.status === 'grooming_done';

  const today    = new Date().toISOString().slice(0, 10);
  const upcoming = sessions.filter(s => s.session_date >= today && !isDelivered(s) && s.status !== 'cancelled');
  const past     = sessions.filter(s => !(s.session_date >= today && !isDelivered(s) && s.status !== 'cancelled'));

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl font-extrabold text-gray-900">Grooming history</h2>
        <p className="text-xs text-gray-500 mt-0.5">All your past and upcoming sessions with Sniffy.</p>
      </header>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <AlertCircle size={13} className="mt-0.5 shrink-0 text-red-500"/>
          <span className="flex-1 break-words">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-10 px-4 bg-white border border-dashed border-gray-200 rounded-2xl">
          <p className="text-4xl mb-2">🐶✨</p>
          <p className="text-sm font-bold text-gray-700">No sessions yet</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <Section title={`Upcoming · ${upcoming.length}`}>
              {upcoming.map(s => (
                <SessionItem
                  key={s.id}
                  s={s}
                  expanded={expandedId === s.id}
                  pendingRequest={pendingReqs[s.id] ?? null}
                  isUpcoming={true}
                  customer={customer}
                  onToggle={() => setExpanded(x => x === s.id ? null : s.id)}
                  onReceipt={() => setReceipt(s)}
                  onReschedule={() => setChangeFor({ session: s, type: 'reschedule' })}
                  onCancel={() => setChangeFor({ session: s, type: 'cancel' })}
                />
              ))}
            </Section>
          )}
          {past.length > 0 && (
            <Section title={`Past · ${past.length}`}>
              {past.map(s => (
                <SessionItem
                  key={s.id}
                  s={s}
                  expanded={expandedId === s.id}
                  pendingRequest={null}
                  isUpcoming={false}
                  customer={customer}
                  onToggle={() => setExpanded(x => x === s.id ? null : s.id)}
                  onReceipt={() => setReceipt(s)}
                />
              ))}
            </Section>
          )}
        </>
      )}

      {/* Receipt overlay */}
      <AnimatePresence>
        {receiptFor && (
          <ReceiptModal session={receiptFor} customer={customer} onClose={() => setReceipt(null)}/>
        )}
      </AnimatePresence>

      {/* Change request modal (reschedule or cancel) */}
      <AnimatePresence>
        {changeFor && (
          <ChangeRequestModal
            session={changeFor.session}
            type={changeFor.type}
            onClose={() => setChangeFor(null)}
            onSubmitted={() => { setChangeFor(null); reload(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function SessionItem({
  s, expanded, pendingRequest, isUpcoming, customer, onToggle, onReceipt, onReschedule, onCancel,
}: {
  s: SessionRow;
  expanded: boolean;
  pendingRequest: SessionChangeRequest | null;
  isUpcoming: boolean;
  customer: Customer;
  onToggle: () => void;
  onReceipt: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
}) {
  // Customers see delivered work as "completed", full stop.
  // `grooming_done` is an internal reconciliation state — telling a
  // customer their finished grooming is somehow not complete because a
  // partner platform hasn't paid us would be alarming and meaningless
  // to them.  Same reason the pill is green rather than orange here.
  const isDelivered = s.status === 'completed' || s.status === 'grooming_done';
  const statusLabel = isDelivered ? 'completed' : s.status;
  const statusColor =
    isDelivered              ? 'text-green-600 bg-green-50 border-green-200' :
    s.status === 'cancelled' ? 'text-red-500 bg-red-50 border-red-200' :
    'text-amber-600 bg-amber-50 border-amber-200';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <button onClick={onToggle} className="w-full p-3 text-left flex items-center gap-3 hover:bg-gray-50/60 transition">
        <div className="w-10 h-10 rounded-full bg-purple-50 text-sniffy-purple flex items-center justify-center shrink-0">
          <Scissors size={16}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">
            {fmtDate(s.session_date)}{s.scheduled_time && <span className="text-gray-400 font-normal text-xs"> · {s.scheduled_time}</span>}
          </p>
          <p className="text-[11px] text-gray-500 truncate">
            {s.pet_type === 'dog' ? '🐶' : '🐱'} {s.breed ?? '—'} · {s.package ?? '—'}
          </p>
        </div>
        <span className={`text-[10px] font-bold uppercase rounded-full px-2 py-0.5 border shrink-0 ${statusColor}`}>
          {statusLabel}
        </span>
        {pendingRequest && (
          <span
            title={`${pendingRequest.request_type} requested — awaiting coordinator`}
            className="text-[10px] font-bold uppercase rounded-full px-2 py-0.5 border shrink-0 text-amber-700 bg-amber-50 border-amber-200 flex items-center gap-0.5"
          >
            <Clock size={9}/> change requested
          </span>
        )}
        {expanded ? <ChevronUp size={14} className="text-gray-300 shrink-0"/> : <ChevronDown size={14} className="text-gray-300 shrink-0"/>}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-3 space-y-1.5 text-xs">
              <Row label="Groomer" value={s.groomer_name ?? 'TBD'}/>
              <Row label="Pet age" value={s.pet_age ?? '—'}/>
              <Row label="Add-ons" value={(s.add_ons && s.add_ons.length > 0) ? s.add_ons.join(', ') : '—'}/>
              <Row label="Amount" value={fmtMoney(s.total_collected || s.booking_amount)}/>
              <Row label="Payment" value={
                s.payment_verified ? `Paid · ${s.payment_mode ?? ''}` :
                isDelivered ? 'Pending' : '—'
              }/>
              {s.next_due_date && <Row label="Next due" value={fmtDate(s.next_due_date)}/>}
              {s.client_rating != null && (
                <Row label="Your rating" value={
                  <span className="inline-flex items-center gap-0.5 text-amber-600">
                    <Star size={11} fill="currentColor"/> {s.client_rating}
                  </span> as unknown as string
                }/>
              )}
              {/* ── Live session chat — only for active/upcoming sessions ── */}
              {isUpcoming && s.status !== 'cancelled' && (
                <div className="mt-3">
                  <SessionChat
                    sessionId={s.id}
                    senderType="customer"
                    senderId={customer.id}
                    senderName={customer.name || customer.phone || 'Customer'}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap mt-2">
                <button
                  onClick={onReceipt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-sniffy-purple bg-purple-50 border border-purple-200 hover:bg-purple-100 transition active:scale-95"
                >
                  <FileText size={11}/> View receipt
                </button>
                {/* Phase 6b — reschedule / cancel actions.  Only on
                    upcoming sessions that aren't already cancelled,
                    and not when a pending request already exists. */}
                {isUpcoming && onReschedule && onCancel && !pendingRequest && (
                  <>
                    <button
                      onClick={onReschedule}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition active:scale-95"
                    >
                      <CalendarCheck size={11}/> Reschedule
                    </button>
                    <button
                      onClick={onCancel}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition active:scale-95"
                    >
                      <Ban size={11}/> Cancel
                    </button>
                  </>
                )}
                {pendingRequest && (
                  <span className="text-[10px] text-amber-700 italic">
                    {pendingRequest.request_type === 'reschedule' ? 'Reschedule' : 'Cancellation'} requested · awaiting confirmation
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-700 font-semibold text-right">{value}</span>
    </div>
  );
}

// ─── Receipt modal ──────────────────────────────────────────────────

function ReceiptModal({ session, customer, onClose }: {
  session: SessionRow;
  customer: Customer;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-[60]"
      />
      {/* Flex-centered wrapper avoids the framer-motion transform conflict
          that previously broke centering — same fix as CustomerMergeModal. */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-md max-h-[88vh] bg-white rounded-2xl overflow-y-auto pointer-events-auto"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.24)' }}
        >
          <div className="p-6">
            <div className="text-center pb-4 border-b-2 border-dashed border-gray-200">
              <img src="/sniffy-logo.png" alt="Sniffy" className="h-10 mx-auto"/>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-2 font-bold">Grooming receipt</p>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <ReceiptRow label="Receipt #" value={session.id.slice(0, 8).toUpperCase()}/>
              <ReceiptRow label="Date"      value={fmtDate(session.session_date)}/>
              <ReceiptRow label="Customer"  value={customer.name || customer.phone}/>
              <ReceiptRow label="Pet"       value={`${session.pet_type === 'dog' ? '🐶' : '🐱'} ${session.breed ?? '—'}`}/>
              <ReceiptRow label="Package"   value={session.package ?? '—'}/>
              {session.add_ons && session.add_ons.length > 0 && (
                <ReceiptRow label="Add-ons" value={session.add_ons.join(', ')}/>
              )}
              <ReceiptRow label="Groomer"   value={session.groomer_name ?? '—'}/>
            </div>

            <div className="py-3 border-t border-dashed border-gray-200 space-y-1">
              <ReceiptRow label="Subtotal" value={fmtMoney(session.booking_amount)} small/>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm font-extrabold text-gray-900">Total</span>
                <span className="text-lg font-extrabold text-sniffy-purple">
                  {fmtMoney(session.total_collected || session.booking_amount)}
                </span>
              </div>
              <p className={`text-[10px] uppercase font-bold text-right mt-1 ${
                session.payment_verified ? 'text-green-600' : 'text-amber-600'
              }`}>
                {session.payment_verified ? `Paid · ${session.payment_mode ?? ''}` : 'Payment pending'}
              </p>
            </div>

            <div className="pt-3 border-t-2 border-dashed border-gray-200 text-center">
              <p className="text-[10px] text-gray-400">
                Thank you for choosing Sniffy 🐾
              </p>
              <p className="text-[10px] text-gray-300 mt-1">www.sniffy.in</p>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-600 bg-white border border-gray-200 transition active:scale-95"
              >Print</button>
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-sniffy-purple transition active:scale-95"
              >Close</button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function ReceiptRow({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className={small ? 'text-gray-400' : 'text-gray-500'}>{label}</span>
      <span className={`text-gray-800 font-semibold text-right ${small ? 'text-[11px]' : ''}`}>{value}</span>
    </div>
  );
}

// ─── Phase 6b — Change request modal ────────────────────────────────
//
// One modal handles both 'reschedule' and 'cancel'.  Submits via the
// `request_booking_change` RPC, which creates a session_change_requests
// row pending coordinator approval.

function ChangeRequestModal({ session, type, onClose, onSubmitted }: {
  session: SessionRow;
  type: 'reschedule' | 'cancel';
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [newDate, setNewDate]   = useState<string>(session.session_date >= today ? session.session_date : today);
  const [newTime, setNewTime]   = useState<string>(session.scheduled_time ?? '');
  const [notes, setNotes]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const isReschedule = type === 'reschedule';

  async function submit() {
    setSaving(true); setError(null);
    try {
      const { data, error: err } = await supabase.rpc('request_booking_change', {
        p_type:           type,
        p_session_id:     session.id,
        p_booking_id:     null,
        p_new_date:       isReschedule ? newDate : null,
        p_new_time:       isReschedule ? (newTime || null) : null,
        p_customer_notes: notes.trim() || null,
      });
      if (err) throw err;
      if (!data || !(data as { success: boolean }).success) {
        const code = (data as { error?: string })?.error ?? 'unknown_error';
        const friendly: Record<string, string> = {
          pending_request_exists:    'You already have a pending change request for this session.',
          not_owner:                 'You can only change your own sessions.',
          session_already_completed: 'This session has already been completed.',
          session_already_cancelled: 'This session is already cancelled.',
          reschedule_needs_new_date: 'Please pick a new date.',
        };
        throw new Error(friendly[code] ?? code);
      }
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setSaving(false); }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-[60]"
      />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          className="w-full max-w-md max-h-[90vh] bg-white rounded-2xl overflow-y-auto pointer-events-auto"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.24)' }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                {isReschedule ? <CalendarCheck size={16} className="text-sniffy-purple"/> : <Ban size={16} className="text-red-500"/>}
                {isReschedule ? 'Request reschedule' : 'Request cancellation'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
            </div>

            <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3">
              <p className="text-[11px] text-gray-500">Current session</p>
              <p className="text-sm font-bold text-gray-900">
                {fmtDate(session.session_date)}{session.scheduled_time && ` · ${session.scheduled_time}`}
              </p>
              <p className="text-[11px] text-gray-500">
                {session.pet_type === 'dog' ? '🐶' : '🐱'} {session.breed ?? '—'} · {session.package ?? '—'}
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-2 mb-3 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
                <AlertCircle size={11} className="mt-0.5 shrink-0 text-red-500"/>
                <span className="flex-1 break-words">{error}</span>
              </div>
            )}

            {isReschedule && (
              <div className="space-y-2 mb-3">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Preferred new date *</span>
                  <input
                    type="date"
                    min={today}
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Preferred time (optional)</span>
                  <input
                    type="text"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple"
                  />
                </label>
              </div>
            )}

            <label className="block mb-3">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                Note for the coordinator {isReschedule ? '(optional)' : ''}
              </span>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder={isReschedule ? 'Travel plans, vet appointment, etc.' : 'Reason for cancelling (helps us improve)'}
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-sniffy-purple resize-none"
              />
            </label>

            <p className="text-[10px] text-gray-400 leading-snug mb-3">
              {isReschedule
                ? 'Our coordinator will confirm the new slot on WhatsApp within a few hours. If the time you picked isn\'t available we\'ll suggest the closest option.'
                : 'Cancellations within 24 hours of the slot may attract a small fee. The coordinator will confirm on WhatsApp.'}
            </p>

            <div className="flex items-center justify-end gap-2">
              <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700">Close</button>
              <button
                onClick={submit}
                disabled={saving || (isReschedule && !newDate)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition active:scale-95 ${
                  isReschedule ? 'bg-sniffy-purple' : 'bg-red-500'
                }`}
              >
                {saving ? <Loader2 size={13} className="animate-spin"/> : (isReschedule ? <CalendarCheck size={13}/> : <Ban size={13}/>)}
                {isReschedule ? 'Submit reschedule' : 'Submit cancellation'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
