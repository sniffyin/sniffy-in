/**
 * admin/ChangeRequestsSection.tsx — Phase 6b
 *
 * Surfaces pending portal-submitted reschedule / cancel requests at
 * the top of BookingsTab.  Coordinator approves or declines from here.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────────┐
 *   │ ⏱ 2 pending change requests                  [refresh]   │
 *   │ ─────────────────────────────────────────────────────── │
 *   │ Priya · Reschedule session 12-Jun → 18-Jun · 10:00 AM   │
 *   │   "Travel on the 12th"           [Approve]  [Decline]   │
 *   │ Rohan · Cancel booking · "no longer needed"             │
 *   │                                  [Approve]  [Decline]   │
 *   └─────────────────────────────────────────────────────────┘
 *
 * Approve calls respond_booking_change RPC; the RPC applies the date
 * change to the underlying grooming_sessions/bookings row.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, RefreshCw, AlertCircle, Check, X, Loader2, ChevronDown, ChevronUp,
  CalendarCheck, Ban,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SessionChangeRequest } from './customerTypes';

interface EnrichedRequest extends SessionChangeRequest {
  customer_name:        string | null;
  customer_phone:       string | null;
  current_date:         string | null;
  current_time:         string | null;
  context_label:        string;     // human-readable "Session 12-Jun" or "Booking #abc"
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ChangeRequestsSection({
  onRequestResolved,
}: {
  /** Called after a request is approved/declined so the parent tab
   *  can refetch its own bookings list (the underlying row may have
   *  been mutated by the RPC). */
  onRequestResolved?: () => void;
}) {
  const [items, setItems]       = useState<EnrichedRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [responding, setResponding] = useState<Record<string, boolean>>({});

  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data, error: err } = await supabase
        .from('session_change_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      if (err) throw err;
      const raw = (data ?? []) as SessionChangeRequest[];

      // Enrich with customer + target context.  Two small batched
      // selects keep the round-trips minimal.
      const customerIds = Array.from(new Set(raw.map(r => r.customer_id)));
      const sessionIds  = Array.from(new Set(raw.map(r => r.session_id).filter((v): v is string => !!v)));
      const bookingIds  = Array.from(new Set(raw.map(r => r.booking_id).filter((v): v is string => !!v)));

      const [custs, sess, bks] = await Promise.all([
        customerIds.length
          ? supabase.from('customers').select('id, name, phone').in('id', customerIds)
          : Promise.resolve({ data: [] as { id: string; name: string; phone: string }[], error: null }),
        sessionIds.length
          ? supabase.from('grooming_sessions').select('id, session_date, scheduled_time, package').in('id', sessionIds)
          : Promise.resolve({ data: [] as { id: string; session_date: string; scheduled_time: string | null; package: string | null }[], error: null }),
        bookingIds.length
          ? supabase.from('bookings').select('id, package, preferred_date, created_at').in('id', bookingIds)
          : Promise.resolve({ data: [] as { id: string; package: string; preferred_date: string | null; created_at: string }[], error: null }),
      ]);

      const custMap = new Map<string, { name: string; phone: string }>();
      (custs.data ?? []).forEach(c => custMap.set(c.id, { name: c.name, phone: c.phone }));
      const sessMap = new Map<string, { date: string; time: string | null; pkg: string | null }>();
      (sess.data ?? []).forEach(s => sessMap.set(s.id, { date: s.session_date, time: s.scheduled_time, pkg: s.package }));
      const bkMap = new Map<string, { date: string | null; pkg: string }>();
      (bks.data ?? []).forEach(b => bkMap.set(b.id, { date: b.preferred_date, pkg: b.package }));

      const enriched: EnrichedRequest[] = raw.map(r => {
        const cust = custMap.get(r.customer_id);
        let currentDate: string | null = null;
        let currentTime: string | null = null;
        let context = 'change request';
        if (r.session_id) {
          const s = sessMap.get(r.session_id);
          if (s) {
            currentDate = s.date;
            currentTime = s.time;
            context = `Session ${fmtDate(s.date)}${s.pkg ? ` · ${s.pkg}` : ''}`;
          } else {
            context = 'Session (unknown)';
          }
        } else if (r.booking_id) {
          const b = bkMap.get(r.booking_id);
          if (b) {
            currentDate = b.date;
            context = `Booking ${b.pkg ?? '—'}${b.date ? ` · ${fmtDate(b.date)}` : ''}`;
          } else {
            context = 'Booking (unknown)';
          }
        }
        return {
          ...r,
          customer_name:  cust?.name ?? null,
          customer_phone: cust?.phone ?? null,
          current_date:   currentDate,
          current_time:   currentTime,
          context_label:  context,
        };
      });
      setItems(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  async function respond(id: string, action: 'approve' | 'decline', notes?: string) {
    setResponding(r => ({ ...r, [id]: true }));
    setError(null);
    try {
      const { data, error: err } = await supabase.rpc('respond_booking_change', {
        p_request_id:     id,
        p_action:         action,
        p_response_notes: notes ?? null,
        p_by:             'coordinator',
      });
      if (err) throw err;
      if (!data || !(data as { success: boolean }).success) {
        throw new Error((data as { error?: string })?.error ?? 'Could not respond');
      }
      await reload();
      onRequestResolved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setResponding(r => ({ ...r, [id]: false }));
    }
  }

  // Hide the whole section when there's nothing pending and we're not
  // in an error state — coordinator inbox stays clean.
  if (!loading && items.length === 0 && !error) return null;

  return (
    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(x => !x)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-amber-100/60 transition"
      >
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-amber-600"/>
          <span className="text-sm font-extrabold text-amber-900">
            {loading ? 'Checking change requests…' : `${items.length} pending change request${items.length === 1 ? '' : 's'}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            onClick={(e) => { e.stopPropagation(); reload(); }}
            className="p-1 text-amber-600 hover:text-amber-800 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={12}/>
          </span>
          {expanded ? <ChevronUp size={14} className="text-amber-600"/> : <ChevronDown size={14} className="text-amber-600"/>}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-amber-200"
          >
            <div className="p-3 space-y-2 bg-white">
              {error && (
                <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
                  <AlertCircle size={11} className="mt-0.5 shrink-0 text-red-500"/>
                  <span className="flex-1 break-all">{error}</span>
                  <button onClick={() => setError(null)} className="text-red-400"><X size={10}/></button>
                </div>
              )}

              {items.map(r => (
                <ChangeRequestRow
                  key={r.id}
                  r={r}
                  busy={!!responding[r.id]}
                  onRespond={respond}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChangeRequestRow({
  r, busy, onRespond,
}: {
  r: EnrichedRequest;
  busy: boolean;
  onRespond: (id: string, action: 'approve' | 'decline', notes?: string) => void;
}) {
  const isReschedule = r.request_type === 'reschedule';
  const Icon = isReschedule ? CalendarCheck : Ban;
  const accent = isReschedule ? 'text-sniffy-purple bg-purple-50 border-purple-200' : 'text-red-600 bg-red-50 border-red-200';

  return (
    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
      <div className="flex items-start gap-2">
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border ${accent}`}>
          <Icon size={13}/>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-gray-900">
            {r.customer_name ?? r.customer_phone ?? 'Customer'}
            <span className="text-gray-400 font-normal"> · {r.context_label}</span>
          </p>
          {isReschedule ? (
            <p className="text-[11px] text-gray-600 mt-0.5">
              <span className="text-gray-400">From</span> {fmtDate(r.current_date)}{r.current_time && ` · ${r.current_time}`}{' '}
              <span className="text-gray-400">→</span>{' '}
              <span className="font-bold text-sniffy-purple">{fmtDate(r.requested_new_date)}</span>{r.requested_new_time && ` · ${r.requested_new_time}`}
            </p>
          ) : (
            <p className="text-[11px] text-red-600 mt-0.5 font-semibold">
              Wants to cancel
            </p>
          )}
          {r.customer_notes && (
            <p className="text-[11px] text-gray-500 italic mt-1 break-words">"{r.customer_notes}"</p>
          )}
          <p className="text-[10px] text-gray-400 mt-1">
            requested {new Date(r.created_at).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-2">
        <button
          onClick={() => onRespond(r.id, 'decline')}
          disabled={busy}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-red-600 bg-white border border-red-200 disabled:opacity-60 hover:bg-red-50"
        >
          <X size={11}/> Decline
        </button>
        <button
          onClick={() => onRespond(r.id, 'approve')}
          disabled={busy}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-green-500 hover:bg-green-600 disabled:opacity-60 active:scale-95"
        >
          {busy ? <Loader2 size={11} className="animate-spin"/> : <Check size={11}/>} Approve
        </button>
      </div>
    </div>
  );
}
