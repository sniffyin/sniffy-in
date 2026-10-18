/**
 * admin/VendorReconciliationTab.tsx
 *
 * Per-vendor monthly reconciliation view.  Answers two questions
 * the rest of the admin surface couldn't, before payment_collected_by
 * landed:
 *
 *   1. For Sniffy-collected sessions from each partner platform —
 *      how much commission does Sniffy OWE the partner?
 *   2. For partner-prepaid sessions — how much does the partner OWE
 *      Sniffy in groomer fees?
 *
 * The page is intentionally read-only.  It surfaces numbers so the
 * coordinator can settle externally (WhatsApp / email the partner
 * with the commission/fee figure).  A "Needs attention" pane lists
 * external rows still attributed to 'sniffy' as collector — likely
 * misclassified historical bookings the coordinator can fix in the
 * Session form.
 *
 * Layout: month picker at the top, then one card per active partner.
 * Each card shows:
 *   • # sessions (split prepaid vs Sniffy-collected)
 *   • Gross routed through the platform
 *   • "Sniffy owes vendor" (Sniffy-collected rows, sum of platform_commission)
 *   • "Vendor owes Sniffy" (vendor-prepaid rows, sum of implied groomer fee)
 *   • Net direction (single bottom-line figure)
 *
 * Numbers reuse the same fee-rule math as the Session form so the
 * Reconciliation tab and per-session breakdown stay in lockstep.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertTriangle, ArrowRightCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  GroomingSession,
  EXTERNAL_SOURCE_FEE_RULE,
  commissionFor, isExternalSource, isVendorPrepaid,
  resolveSourceLabel, fmtCurrency,
} from './types';

// ─── Month-window helpers ────────────────────────────────────

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function fmtMonthYear(d: Date): string {
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function isoDate(d: Date): string {
  // Local-date ISO (YYYY-MM-DD) — same convention as the rest of the
  // app.  Using toISOString() here would shift into UTC and silently
  // exclude session_dates near the month boundary in IST.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── Per-vendor aggregate ────────────────────────────────────

interface VendorBucket {
  key: string;
  label: string;
  count: number;
  /** Sniffy-collected rows from this partner (we owe them
   *  commission).  Sum of booking_amount + platform_commission. */
  sniffyCollectedCount: number;
  sniffyCollectedGross: number;
  sniffyOwesVendor: number;
  /** Vendor-prepaid rows from this partner (they owe us a groomer
   *  fee).  Sum of booking_amount + implied groomer fee. */
  vendorPrepaidCount: number;
  vendorPrepaidGross: number;
  vendorOwesSniffy: number;
}

/** Computes per-vendor reconciliation for the given completed-session
 *  slice.  Buckets by `source` (not source_type) for the same reason
 *  computeDaySummary does — historical rows have mis-recorded
 *  source_type values, but `source` is unique per category. */
function reconcile(sessions: GroomingSession[]): VendorBucket[] {
  const buckets = new Map<string, VendorBucket>();
  for (const s of sessions) {
    if (!isExternalSource(s.source)) continue;
    const key = s.source ?? 'unknown';
    const bucket =
      buckets.get(key) ??
      ({
        key,
        label: resolveSourceLabel(s.source),
        count: 0,
        sniffyCollectedCount: 0,
        sniffyCollectedGross: 0,
        sniffyOwesVendor: 0,
        vendorPrepaidCount: 0,
        vendorPrepaidGross: 0,
        vendorOwesSniffy: 0,
      } satisfies VendorBucket);

    const gross = Number(s.booking_amount) || 0;
    let platformCommission = Number(s.platform_commission) || 0;
    if (!platformCommission) {
      const rule = EXTERNAL_SOURCE_FEE_RULE[s.source as string];
      if (rule) platformCommission = commissionFor(rule, gross);
    }
    const groomerCommission = Number(s.groomer_commission) || 0;

    bucket.count += 1;
    if (isVendorPrepaid(s)) {
      bucket.vendorPrepaidCount += 1;
      bucket.vendorPrepaidGross += gross;
      // Implied groomer fee the vendor owes us — gross minus their
      // commission minus what we pay our groomer.  Floor at 0.
      // Vendor remits everything after their own platform cut.
      // groomerCommission is Sniffy's internal cost — not a discount on what the vendor owes.
      bucket.vendorOwesSniffy += Math.max(0, gross - platformCommission);
    } else {
      bucket.sniffyCollectedCount += 1;
      bucket.sniffyCollectedGross += gross;
      bucket.sniffyOwesVendor += platformCommission;
    }
    buckets.set(key, bucket);
  }
  // Order by total gross routed, descending.
  return Array.from(buckets.values()).sort(
    (a, b) =>
      b.sniffyCollectedGross + b.vendorPrepaidGross -
      (a.sniffyCollectedGross + a.vendorPrepaidGross),
  );
}

// ─── Component ───────────────────────────────────────────────

export default function VendorReconciliationTab() {
  const [sessions, setSessions] = useState<GroomingSession[]>([]);
  const [loading, setLoading]   = useState(true);
  const [month, setMonth]       = useState<Date>(() => startOfMonth(new Date()));

  // Load sessions whose session_date falls inside the picked month.
  // We pull delivered rows only — a booking that hasn't been groomed
  // yet has no financial position to reconcile and would distort the
  // totals.
  //
  // `grooming_done` belongs here alongside `completed`, and is arguably
  // the more important of the two on this screen: those are precisely
  // the sessions where the partner still owes us.  Excluding them would
  // leave the tab reconciling only debts that have already been paid.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const start = isoDate(startOfMonth(month));
    const end   = isoDate(endOfMonth(month));
    supabase
      .from('grooming_sessions')
      .select('*')
      .gte('session_date', start)
      .lte('session_date', end)
      .in('status', ['completed', 'grooming_done'])
      .order('session_date', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          // Don't error the UI out — render empty and let the user
          // switch months / retry by re-navigating.
          // eslint-disable-next-line no-console
          console.warn('VendorReconciliationTab load failed', error);
          setSessions([]);
        } else {
          setSessions((data ?? []) as GroomingSession[]);
        }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [month]);

  const buckets       = useMemo(() => reconcile(sessions), [sessions]);
  // "Needs attention" — external rows still tagged collected_by='sniffy'.
  // Likely misclassified historical data; the coordinator can edit
  // each one in the Session form to set the right collector.
  const needsAttention = useMemo(
    () =>
      sessions.filter(
        s =>
          isExternalSource(s.source) &&
          (s.payment_collected_by ?? 'sniffy') === 'sniffy',
      ),
    [sessions],
  );

  const totalSniffyOwes  = buckets.reduce((s, b) => s + b.sniffyOwesVendor, 0);
  const totalVendorOwes  = buckets.reduce((s, b) => s + b.vendorOwesSniffy, 0);
  const netDirection     = totalVendorOwes - totalSniffyOwes;

  function shiftMonth(delta: number) {
    setMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  return (
    <div className="space-y-4">
      {/* ── Month picker + bottom-line summary ────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-sniffy-purple to-purple-700 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-3">
          <button
            type="button" onClick={() => shiftMonth(-1)}
            className="p-1.5 rounded-full hover:bg-white/15 transition"
            aria-label="Previous month"
          >
            <ChevronLeft size={18}/>
          </button>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Vendor Reconciliation</p>
            <p className="text-base font-extrabold leading-tight mt-0.5">{fmtMonthYear(month)}</p>
          </div>
          <button
            type="button" onClick={() => shiftMonth(1)}
            className="p-1.5 rounded-full hover:bg-white/15 transition"
            aria-label="Next month"
          >
            <ChevronRight size={18}/>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-white/15">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/70">Sniffy owes</p>
            <p className="text-sm font-extrabold tabular-nums mt-0.5">{fmtCurrency(totalSniffyOwes)}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/70">Vendor owes</p>
            <p className="text-sm font-extrabold tabular-nums mt-0.5">{fmtCurrency(totalVendorOwes)}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/70">Net to Sniffy</p>
            <p className={`text-sm font-extrabold tabular-nums mt-0.5 ${netDirection < 0 ? 'text-red-200' : 'text-emerald-200'}`}>
              {netDirection >= 0 ? '+' : '−'}{fmtCurrency(Math.abs(netDirection))}
            </p>
          </div>
        </div>
      </div>

      {/* ── Loading skeleton ──────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={18}/>
          <span className="text-sm">Loading…</span>
        </div>
      )}

      {/* ── Per-vendor cards ──────────────────────────────── */}
      {!loading && buckets.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">No external bookings completed this month.</p>
          <p className="text-[11px] text-gray-400 mt-1">Vendor reconciliation will populate as Woofly / partner sessions land.</p>
        </div>
      )}

      {!loading && buckets.map((b, i) => (
        <motion.div
          key={b.key}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 * i }}
          className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-sniffy-purple">{b.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{b.count} session{b.count === 1 ? '' : 's'} this month</p>
            </div>
          </div>

          {/* Sniffy-collected sub-block — Sniffy holds the cash and
              owes the partner a commission cut. */}
          {b.sniffyCollectedCount > 0 && (
            <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-3 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Sniffy collected · {b.sniffyCollectedCount}
                </span>
                <span className="text-[11px] text-amber-600 tabular-nums">
                  gross {fmtCurrency(b.sniffyCollectedGross)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-600">Commission Sniffy owes</span>
                <span className="text-sm font-extrabold text-amber-700 tabular-nums">
                  {fmtCurrency(b.sniffyOwesVendor)}
                </span>
              </div>
            </div>
          )}

          {/* Vendor-prepaid sub-block — the partner already collected
              from the customer; they owe Sniffy a groomer fee. */}
          {b.vendorPrepaidCount > 0 && (
            <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Vendor pre-paid · {b.vendorPrepaidCount}
                </span>
                <span className="text-[11px] text-emerald-600 tabular-nums">
                  gross {fmtCurrency(b.vendorPrepaidGross)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-600">Net owed to Sniffy</span>
                <span className="text-sm font-extrabold text-emerald-700 tabular-nums">
                  {fmtCurrency(b.vendorOwesSniffy)}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      ))}

      {/* ── Needs-attention pane ──────────────────────────── */}
      {!loading && needsAttention.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={16}/>
            <div>
              <p className="text-[12px] font-bold text-orange-700">
                {needsAttention.length} external session{needsAttention.length === 1 ? '' : 's'} marked as Sniffy-collected
              </p>
              <p className="text-[10px] text-orange-600/80 mt-0.5 leading-snug">
                These are bookings from a partner platform still flagged as collected by Sniffy.
                If the partner actually pre-collected, open each session and switch the Collected By
                picker to "Vendor pre-paid" so reconciliation totals stay accurate.
              </p>
            </div>
          </div>
          <div className="space-y-1 mt-2">
            {needsAttention.slice(0, 8).map(s => (
              <div key={s.id} className="flex items-center justify-between text-[11px] bg-white rounded-lg px-2.5 py-1.5 border border-orange-100">
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-gray-700 truncate">{s.pet_parent_name}</p>
                  <p className="text-[10px] text-gray-400">
                    {resolveSourceLabel(s.source)} · {s.session_date}
                  </p>
                </div>
                <span className="text-[10px] tabular-nums text-gray-500 flex-shrink-0">
                  {fmtCurrency(Number(s.booking_amount) || 0)}
                  <ArrowRightCircle size={11} className="inline ml-1 text-orange-500"/>
                </span>
              </div>
            ))}
            {needsAttention.length > 8 && (
              <p className="text-[10px] text-orange-600 text-center pt-1">
                + {needsAttention.length - 8} more
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
