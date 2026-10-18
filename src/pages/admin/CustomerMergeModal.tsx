/**
 * admin/CustomerMergeModal.tsx — Phase 2a
 *
 * Merge tool: pick a second customer to consolidate with the one
 * already open (`primary`), preview the merge, confirm.
 *
 * Hard rules:
 *   • The user picks WHICH side wins (default: the customer with more
 *     completed sessions; tie → the older row).  This becomes the
 *     "keeper" passed to merge_customers().
 *   • The other side becomes the "loser" and is deleted at the end.
 *   • The action is irreversible — UI requires an explicit confirm
 *     click after the preview is shown.
 *
 * The actual merge work runs in Postgres via the merge_customers()
 * function (see migration 20260523000000).  Frontend just RPCs and
 * surfaces success/failure.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, AlertCircle, Loader2, Merge, Crown, Phone,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Customer, formatPhoneDisplay, LIFECYCLE_LABELS } from './customerTypes';

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtMoney(n: number): string {
  return `₹${Math.round(n || 0).toLocaleString('en-IN')}`;
}

/** Heuristic for which side should win when both are valid.  The user
 *  can flip this in the preview screen if they disagree. */
function suggestWinner(a: Customer, b: Customer): { keep: Customer; drop: Customer } {
  const aScore = (a.completed_sessions ?? 0) * 1000
    + (a.total_sessions ?? 0) * 10
    + (a.last_session_at ? 1 : 0);
  const bScore = (b.completed_sessions ?? 0) * 1000
    + (b.total_sessions ?? 0) * 10
    + (b.last_session_at ? 1 : 0);
  if (aScore >= bScore) return { keep: a, drop: b };
  return { keep: b, drop: a };
}

export default function CustomerMergeModal({
  open, primary, onClose, onMerged,
}: {
  open: boolean;
  primary: Customer | null;
  onClose: () => void;
  /** Called with the surviving customer's id after a successful merge. */
  onMerged: (winnerId: string) => void;
}) {
  const [query, setQuery]                 = useState('');
  const [results, setResults]             = useState<Customer[]>([]);
  const [secondary, setSecondary]         = useState<Customer | null>(null);
  /** Which side is the keeper.  Starts from suggestWinner(); user can flip. */
  const [keeperId, setKeeperId]           = useState<string | null>(null);
  const [searching, setSearching]         = useState(false);
  const [merging, setMerging]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  // Reset everything when the modal closes.
  useEffect(() => {
    if (open) return;
    setQuery(''); setResults([]); setSecondary(null);
    setKeeperId(null); setError(null);
  }, [open]);

  // Debounced search.  Matches name/phone/phone_raw.  Excludes the
  // primary customer from the results — you can't merge a row with
  // itself.
  useEffect(() => {
    if (!open || !primary) return;
    const q = query.trim();
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const digits = q.replace(/[^0-9]/g, '');
      const phonePattern = digits ? `%${digits}%` : null;
      let req = supabase.from('customers').select('*').neq('id', primary.id).limit(15);
      if (phonePattern) {
        req = req.or(`name.ilike.%${q}%,phone.ilike.${phonePattern},phone_raw.ilike.${phonePattern}`);
      } else {
        req = req.ilike('name', `%${q}%`);
      }
      const { data, error: err } = await req.order('last_session_at', { ascending: false, nullsFirst: false });
      if (err) {
        console.warn('[CustomerMergeModal] search failed:', err);
        setResults([]);
      } else {
        setResults((data ?? []) as Customer[]);
      }
      setSearching(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query, open, primary]);

  // When user picks a second customer, default the keeper using the heuristic.
  useEffect(() => {
    if (!primary || !secondary) { setKeeperId(null); return; }
    setKeeperId(suggestWinner(primary, secondary).keep.id);
  }, [primary, secondary]);

  const performMerge = useCallback(async () => {
    if (!primary || !secondary || !keeperId) return;
    const keep = keeperId === primary.id ? primary : secondary;
    const drop = keeperId === primary.id ? secondary : primary;
    setMerging(true);
    setError(null);
    try {
      const { error: err } = await supabase.rpc('merge_customers', {
        p_keep_id: keep.id,
        p_drop_id: drop.id,
      });
      if (err) throw err;
      onMerged(keep.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setMerging(false);
    }
  }, [primary, secondary, keeperId, onMerged]);

  if (!open || !primary) return null;

  // Preview screen — shown once a second customer is picked.
  const showPreview = !!secondary;
  const keep = !showPreview ? null : (keeperId === primary.id ? primary : secondary);
  const drop = !showPreview ? null : (keeperId === primary.id ? secondary : primary);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-[60]"
      />
      {/* Centering wrapper.  Important: framer-motion's `y`/`scale`
          animations on the inner sheet overwrite the CSS `transform`
          property, which previously clobbered the Tailwind
          `-translate-x-1/2 -translate-y-1/2` centering and pushed the
          modal off to the right on mobile.  Solution: do positioning
          via flex on this wrapper, and let motion.div animate freely
          without fighting CSS transforms. */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-2xl max-h-[88vh] bg-white rounded-2xl overflow-y-auto pointer-events-auto"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.24)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2">
            <Merge size={18} className="text-sniffy-purple"/>
            <h3 className="text-base font-extrabold text-gray-900">Merge customers</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition">
            <X size={18}/>
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500"/>
            <span className="flex-1 break-all">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X size={12}/>
            </button>
          </div>
        )}

        {!showPreview ? (
          // ── Picker step ───────────────────────────────────────
          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs text-gray-500">
                Find the other record for <span className="font-bold text-gray-700">{primary.name || formatPhoneDisplay(primary.phone)}</span>.
                Search by name or phone.
              </p>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input
                type="search"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Name or phone…"
                className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple focus:ring-1 focus:ring-sniffy-purple/20 transition"
              />
              {searching && (
                <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"/>
              )}
            </div>

            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {query.trim().length < 2 ? (
                <p className="text-xs text-gray-400 italic py-6 text-center">Type at least 2 characters to search…</p>
              ) : results.length === 0 && !searching ? (
                <p className="text-xs text-gray-400 italic py-6 text-center">No other customers match.</p>
              ) : (
                results.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSecondary(c)}
                    className="w-full text-left px-3 py-2.5 bg-gray-50 hover:bg-purple-50 border border-transparent hover:border-purple-200 rounded-xl transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {c.name || <span className="text-gray-400 italic">No name</span>}
                          {c.is_vip && <Crown size={11} className="inline ml-1 text-amber-500"/>}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {formatPhoneDisplay(c.phone)}
                          {c.address && <> · {c.address.slice(0, 40)}</>}
                        </p>
                      </div>
                      <div className="text-right shrink-0 text-[10px] text-gray-400">
                        <p className="font-bold text-gray-700">{c.total_sessions}× sessions</p>
                        <p>last {fmtDate(c.last_session_at)}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          // ── Preview step ──────────────────────────────────────
          <div className="p-5 space-y-4">
            <p className="text-xs text-gray-500">
              Choose which row to <strong className="text-gray-900">keep</strong>.  The other will be deleted — its sessions, bookings, and pets move to the keeper.  This action cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[primary, secondary!].map(c => {
                const isKeeper = keeperId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setKeeperId(c.id)}
                    className={`text-left p-3 border-2 rounded-xl transition ${
                      isKeeper
                        ? 'bg-purple-50 border-sniffy-purple'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                        isKeeper ? 'text-sniffy-purple' : 'text-gray-400'
                      }`}>{isKeeper ? '✓ Keeper' : 'Delete'}</span>
                      {c.is_vip && <Crown size={11} className="text-amber-500"/>}
                    </div>
                    <p className="text-sm font-bold text-gray-900 mt-1 truncate">
                      {c.name || <span className="text-gray-400 italic">No name</span>}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                      <Phone size={9}/> {formatPhoneDisplay(c.phone)}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                      <Stat label="Sessions" value={String(c.total_sessions)}/>
                      <Stat label="LTV" value={fmtMoney((c.vendor_prepaid_total ?? 0) + (c.sniffy_collected_total ?? 0))}/>
                      <Stat label="Last" value={fmtDate(c.last_session_at)}/>
                      <Stat label="Stage" value={LIFECYCLE_LABELS[c.lifecycle_stage]}/>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
              <p className="font-bold flex items-center gap-1"><AlertCircle size={12}/> About to happen</p>
              {drop && keep && (
                <ul className="ml-4 list-disc text-[11px] space-y-0.5 text-amber-700">
                  <li>{drop.total_sessions} session(s) reassigned to keeper</li>
                  <li>Pets merged by type+breed (duplicates collapse)</li>
                  <li>LTV totals summed onto keeper</li>
                  <li>Tags merged · notes concatenated</li>
                  <li className="font-bold">"{drop.name || formatPhoneDisplay(drop.phone)}" deleted</li>
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => { setSecondary(null); setKeeperId(null); }}
                disabled={merging}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >← Pick different customer</button>
              <button
                onClick={performMerge}
                disabled={merging || !keeperId}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition active:scale-95"
              >
                {merging
                  ? <><Loader2 size={13} className="animate-spin"/> Merging…</>
                  : <><Merge size={13}/> Confirm merge</>}
              </button>
            </div>
          </div>
        )}
      </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/60 rounded-lg p-1.5">
      <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">{label}</p>
      <p className="text-[11px] font-bold text-gray-900 mt-0.5 truncate">{value}</p>
    </div>
  );
}
