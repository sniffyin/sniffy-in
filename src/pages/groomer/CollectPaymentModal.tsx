/**
 * CollectPaymentModal.tsx — Payment collection with breakdown, upsell,
 * tip, mode picker (cash / online).  Online → renders the placeholder
 * payment QR (you'll swap in the PhonePe QR later by replacing
 * /public/payment-qr.png).
 */

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Wallet, Banknote, QrCode, Loader2, Plus, Minus, ChevronDown } from 'lucide-react';
import type { GroomingSession, PaymentMode } from '../admin/types';
import { fmtCurrency } from '../admin/types';
import { collectPayment } from './sessionMilestonesApi';
import SessionPetLines from '../admin/SessionPetLines';
import { useSessionPetDisplay } from '../admin/useSessionPets';

const PAYMENT_QR_SRC = '/payment-qr.png'; // placeholder; coordinator drops a real PhonePe QR here

interface Props {
  session:     GroomingSession;
  onClose:     () => void;
  onSubmitted: () => void;
}

export default function CollectPaymentModal({ session, onClose, onSubmitted }: Props) {
  const alreadyCollected = !!session.payment_collected_at;
  // Multi-pet visit → show each pet's service (and price, if it was priced per pet).
  const petLines = useSessionPetDisplay(useMemo(() => [session], [session])).get(session.id);

  // Defaults pull from existing record so groomer can adjust if they
  // need to edit (e.g. add a tip after the customer hands cash).
  const [mode,         setMode]   = useState<PaymentMode>(session.payment_mode ?? 'cash');
  const [upsell,       setUpsell] = useState<number>(Number(session.upsell_amount ?? 0));
  const [tip,          setTip]    = useState<number>(Number(session.tip_amount    ?? 0));
  const [notes,        setNotes]  = useState<string>(session.payment_notes ?? '');
  const [busy,         setBusy]   = useState(false);
  const [error,        setError]  = useState<string | null>(null);

  // Upsell + tip are used roughly 1 in 10 sessions, so we hide them
  // behind a single "Add upsell or tip" toggle to keep the default
  // payment screen un-cluttered.  Pre-expand if the session already
  // has a non-zero upsell/tip so editing an existing record doesn't
  // hide what's already there.
  const [extrasOpen, setExtrasOpen] = useState<boolean>(
    () => (Number(session.upsell_amount) || 0) > 0 || (Number(session.tip_amount) || 0) > 0,
  );

  // Parse booking_amount_expr like "1299+290+50" if present, so we can
  // show the customer-facing breakdown.
  const breakdown = useMemo(() => {
    if (session.booking_amount_expr) {
      return session.booking_amount_expr
        .split('+').map(p => Number(p.trim()))
        .filter(n => !Number.isNaN(n) && n > 0);
    }
    return session.booking_amount > 0 ? [session.booking_amount] : [];
  }, [session.booking_amount, session.booking_amount_expr]);

  const grossBase  = Number(session.booking_amount ?? 0);
  // Coordinator-applied discount (flat ₹ or %) — already netted out of
  // discount_amount by the DB. See migration 20260907000000_session_discounts.sql.
  const discountAmt = Number(session.discount_amount ?? 0);
  const base  = grossBase - discountAmt;
  const total = base + Math.max(0, upsell || 0) + Math.max(0, tip || 0);

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await collectPayment({
      sessionId:    session.id,
      mode,
      upsellAmount: upsell,
      tipAmount:    tip,
      notes,
    });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? 'Could not save payment.'); return; }
    onSubmitted();
  }

  return (
    <>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity:0, y: 24, scale: 0.97 }}
        animate={{ opacity:1, y: 0, scale: 1 }}
        exit={{ opacity:0, y: 24, scale: 0.97 }}
        className="fixed z-[70] inset-0 grid place-items-center p-4"
      >
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
          {/* Hero */}
          <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-purple-50 to-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-sniffy-purple">
                  Step 3 · Payment
                </p>
                <h3 className="text-xl font-extrabold text-gray-900 leading-tight mt-0.5">
                  Collect Payment
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Show the customer the breakdown, then pick a mode.
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white">
                <X size={18} className="text-gray-400"/>
              </button>
            </div>
          </div>

          {/* Tighter vertical rhythm (space-y-3 instead of space-y-4) —
              the section list got smaller once Upsell + Tip moved
              behind the disclosure, and the user wanted less crowding. */}
          <div className="px-6 py-4 space-y-3 overflow-y-auto">

            {/* Breakdown */}
            <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/60">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                Service breakdown
              </p>
              <div className="space-y-1 text-sm">
                {petLines ? (
                  <>
                    <SessionPetLines pets={petLines} showAmounts size="detail"/>
                    {petLines.every(p => p.amount === null) && (
                      <Line label={`${petLines.length} pets — combined`} value={fmtCurrency(grossBase)}/>
                    )}
                  </>
                ) : (<>
                {session.package && (
                  <Line label={session.package} value={fmtCurrency(breakdown[0] ?? grossBase)}/>
                )}
                {(session.add_ons ?? []).map((ad, i) => (
                  <Line key={i} label={`+ ${ad}`} value={fmtCurrency(breakdown[i + 1] ?? 0)}/>
                ))}
                </>)}
                {discountAmt > 0 && (
                  <>
                    <div className="h-px bg-gray-200 my-1.5"/>
                    <Line label="Subtotal" value={fmtCurrency(grossBase)}/>
                    <Line
                      label={`Discount${session.discount_type === 'percent' ? ` (${session.discount_value}%)` : ''}`}
                      value={`-${fmtCurrency(discountAmt)}`}
                    />
                  </>
                )}
                <div className="h-px bg-gray-200 my-1.5"/>
                <Line label="Base amount" value={fmtCurrency(base)} bold/>
              </div>
            </div>

            {/* ── Upsell + tip — hidden by default ── */}
            {/*
              Upsell + tip are used in ~1 of 10 sessions.  We collapse
              them behind a single disclosure to keep the default screen
              focused on the actual money to collect.  When extras are
              added, a compact preview pill appears next to the toggle
              so the groomer doesn't have to re-open it to see them.
            */}
            <div>
              <button
                type="button"
                onClick={() => setExtrasOpen(o => !o)}
                aria-expanded={extrasOpen}
                className="w-full flex items-center justify-between gap-2 py-2 px-1 rounded-lg hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    {extrasOpen ? 'Upsell + Tip' : 'Add upsell or tip?'}
                  </span>
                  {!extrasOpen && (upsell > 0 || tip > 0) && (
                    <span className="text-[10px] font-bold text-sniffy-purple bg-purple-50 px-2 py-0.5 rounded-full">
                      {upsell > 0 && `+${fmtCurrency(upsell)}`}
                      {upsell > 0 && tip > 0 && ' · '}
                      {tip    > 0 && `${fmtCurrency(tip)} tip`}
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${extrasOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {extrasOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 space-y-2">
                      <NumberRow
                        label="Upsell"
                        hint="Add-ons sold on top"
                        value={upsell}
                        onChange={setUpsell}
                      />
                      <NumberRow
                        label="Tip"
                        hint="If the customer tipped"
                        value={tip}
                        onChange={setTip}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Total */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-center justify-between">
              <p className="text-sm font-extrabold text-emerald-900">Total to collect</p>
              <p className="text-2xl font-extrabold text-emerald-700">{fmtCurrency(total)}</p>
            </div>

            {/* Mode picker */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Mode</p>
              <div className="grid grid-cols-2 gap-2">
                <ModeBtn label="Cash"   Icon={Banknote} active={mode === 'cash'}   onClick={() => setMode('cash')}/>
                <ModeBtn label="Online" Icon={QrCode}    active={mode === 'online'} onClick={() => setMode('online')}/>
              </div>
            </div>

            {/* Online QR */}
            {mode === 'online' && (
              <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-sniffy-purple mb-2">
                  Show this QR to the customer
                </p>
                <img
                  src={PAYMENT_QR_SRC}
                  alt="Payment QR"
                  className="mx-auto w-48 h-48 object-contain bg-white rounded-xl shadow-sm border border-gray-100"
                  onError={e => {
                    // Placeholder text fallback if /public/payment-qr.png is missing
                    (e.currentTarget as HTMLImageElement).outerHTML =
                      '<div class="mx-auto w-48 h-48 bg-white rounded-xl border border-gray-200 grid place-items-center text-[11px] text-gray-400 px-3 text-center">Payment QR<br/>(swap in /public/payment-qr.png)</div>';
                  }}
                />
                <p className="text-[10px] text-gray-500 mt-2">After payment confirmed, hit "Save".</p>
              </div>
            )}

            {/* Notes */}
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Notes <span className="text-gray-400 font-medium normal-case">(optional)</span>
              </span>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Customer paid extra for medicated bath"
                rows={2}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-sniffy-purple focus:ring-2 focus:ring-purple-100 outline-none resize-none"
              />
            </label>

            {alreadyCollected && (
              <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-[11px] text-blue-800">
                Payment was already collected on {new Date(session.payment_collected_at!).toLocaleString('en-IN')} — saving will overwrite.
              </div>
            )}

            {error && (
              <div className="rounded-xl px-3 py-2 bg-red-50 border border-red-100 text-[11px] text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 p-4 flex gap-2 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={busy}
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-extrabold text-white disabled:opacity-50 inline-flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)', boxShadow: '0 4px 14px rgba(69,26,139,0.30)' }}
            >
              {busy && <Loader2 size={14} className="animate-spin"/>}
              {busy ? 'Saving…' : alreadyCollected ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean; }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-gray-700 ${bold ? 'font-bold' : ''}`}>{label}</span>
      <span className={`text-gray-900 ${bold ? 'font-extrabold' : 'font-semibold'}`}>{value}</span>
    </div>
  );
}

/**
 * Single-line ₹ adjuster: [label]  [−] [₹  ___ ] [+]   (hint below in tiny grey)
 *
 * Compact-by-default — Upsell + Tip stack vertically inside the collapsed
 * Extras disclosure so two rows still fit in ~120px of vertical space.
 */
function NumberRow({
  label, hint, value, onChange,
}: {
  label: string; hint: string; value: number; onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-12 shrink-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 leading-tight">{label}</p>
        <p className="text-[9px] text-gray-400 leading-tight mt-0.5">{hint}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, (value || 0) - 50))}
        aria-label={`Decrease ${label}`}
        className="w-8 h-8 rounded-lg bg-gray-100 grid place-items-center text-gray-600 hover:bg-gray-200 transition flex-shrink-0"
      >
        <Minus size={13}/>
      </button>
      <div className="flex-1 relative min-w-0">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₹</span>
        <input
          type="number"
          min={0}
          value={value || 0}
          onChange={e => onChange(Number(e.target.value) || 0)}
          className="w-full pl-6 pr-2 py-2 rounded-lg border border-gray-200 text-sm font-bold focus:border-sniffy-purple focus:ring-2 focus:ring-purple-100 outline-none"
        />
      </div>
      <button
        type="button"
        onClick={() => onChange((value || 0) + 50)}
        aria-label={`Increase ${label}`}
        className="w-8 h-8 rounded-lg bg-gray-100 grid place-items-center text-gray-600 hover:bg-gray-200 transition flex-shrink-0"
      >
        <Plus size={13}/>
      </button>
    </div>
  );
}

function ModeBtn({
  label, Icon, active, onClick,
}: {
  label: string; Icon: React.ElementType; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-extrabold transition ${
        active
          ? 'border-sniffy-purple bg-sniffy-purple text-white'
          : 'border-gray-200 bg-white text-gray-600 hover:border-purple-200'
      }`}
    >
      <Icon size={14}/>{label}
    </button>
  );
}

// Silence unused-import lint
void Wallet;
