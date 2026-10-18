/**
 * admin/GiftCardsTab.tsx — Phase 6a
 *
 * Coordinator-facing surface for issuing, listing, and voiding gift
 * cards.  Phase 6a is admin-issued only — coordinator collects ₹ out
 * of band (UPI/cash) and mints the code here.  Future Phase 6a.2 will
 * add a portal-purchase flow using the same backend.
 *
 * Layout (mobile-first, mirrors OutreachTab and ExpensesTab):
 *   ┌──────────────────────────────────────────────────┐
 *   │ [+ Issue gift card]                    [filter ▾] │
 *   │ ─────────── Active · 4 ──────────────             │
 *   │  GC7XHQDM2K  ₹1500  →  Priya · +91 98765…  ●     │
 *   │  GCJ5N…       ₹500   →  Anonymous           ●     │
 *   │ ─────────── Redeemed · 2 ────────────             │
 *   │  GCRXYZ…      ₹0     ✓ fully redeemed             │
 *   │ ─────────── Voided · 1 ──────────────             │
 *   └──────────────────────────────────────────────────┘
 *
 * Clicking a row opens a slide-over with full details, redemption
 * history, copy/share/void actions.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Gift, AlertCircle, X, Copy, Share2, Ban, Loader2, Search,
  RefreshCw, Check,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  GiftCard, GiftCardRedemption, GiftCardStatus,
  buildGiftCardShareUrl, formatPhoneDisplay,
  normalizePhone,
} from './customerTypes';

const STATUS_LABEL: Record<GiftCardStatus, string> = {
  active:   'Active',
  redeemed: 'Redeemed',
  voided:   'Voided',
  expired:  'Expired',
};

const STATUS_DOT: Record<GiftCardStatus, string> = {
  active:   'bg-green-500',
  redeemed: 'bg-gray-400',
  voided:   'bg-red-500',
  expired:  'bg-amber-500',
};

function money(n: number | null | undefined): string {
  if (n == null) return '₹0';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function GiftCardsTab() {
  const [cards, setCards]               = useState<GiftCard[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [issuing, setIssuing]           = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | GiftCardStatus>('all');
  const [search, setSearch]             = useState('');
  const [openCard, setOpenCard]         = useState<GiftCard | null>(null);
  const [copiedCode, setCopiedCode]     = useState<string | null>(null);

  async function reload() {
    setLoading(true); setError(null);
    try {
      const { data, error: err } = await supabase
        .from('gift_cards')
        .select('*')
        .order('issued_at', { ascending: false })
        .limit(500);
      if (err) throw err;
      setCards((data ?? []) as GiftCard[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setLoading(false); }
  }

  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.code.toLowerCase().includes(q) ||
        (c.issued_to_name ?? '').toLowerCase().includes(q) ||
        (c.issued_to_phone ?? '').toLowerCase().includes(q) ||
        (c.purchaser_name ?? '').toLowerCase().includes(q)
      );
    });
  }, [cards, statusFilter, search]);

  const groups = useMemo(() => {
    const g: Record<GiftCardStatus, GiftCard[]> = { active: [], redeemed: [], voided: [], expired: [] };
    filtered.forEach(c => g[c.status].push(c));
    return g;
  }, [filtered]);

  const summary = useMemo(() => ({
    activeBalance: cards.filter(c => c.status === 'active').reduce((s, c) => s + Number(c.balance), 0),
    activeCount:   cards.filter(c => c.status === 'active').length,
    redeemedSum:   cards.filter(c => c.status === 'redeemed').reduce((s, c) => s + Number(c.amount), 0),
    totalIssued:   cards.reduce((s, c) => s + Number(c.amount), 0),
  }), [cards]);

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(c => (c === code ? null : c)), 1500);
    } catch { /* clipboard might be blocked in iframes */ }
  }

  return (
    <div className="space-y-3 pb-12">
      <header className="flex flex-wrap items-end gap-3 justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Gift size={18} className="text-sniffy-purple"/> Gift cards
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Issue prepaid Sniffy credit. Recipient redeems against future sessions.</p>
        </div>
        <button
          onClick={() => setIssuing(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-sniffy-purple hover:bg-purple-700 transition active:scale-95 shadow-md shadow-purple-200"
        >
          <Plus size={15}/> Issue gift card
        </button>
      </header>

      {/* Summary band */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Active liability"  value={money(summary.activeBalance)} accent="purple"/>
        <Stat label="Active cards"      value={String(summary.activeCount)} />
        <Stat label="Lifetime redeemed" value={money(summary.redeemedSum)} />
        <Stat label="Total issued"      value={money(summary.totalIssued)} />
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search code, name, phone…"
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-sniffy-purple"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'all' | GiftCardStatus)}
          className="text-xs px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-sniffy-purple"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="redeemed">Redeemed</option>
          <option value="voided">Voided</option>
          <option value="expired">Expired</option>
        </select>
        <button
          onClick={reload}
          className="p-2 text-gray-400 hover:text-sniffy-purple rounded-xl border border-gray-200"
          title="Refresh"
        >
          <RefreshCw size={13}/>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <AlertCircle size={13} className="mt-0.5 shrink-0 text-red-500"/>
          <span className="flex-1 break-words">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400"><X size={11}/></button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-2xl">
          <Gift size={32} className="mx-auto text-gray-300 mb-2"/>
          <p className="text-sm font-bold text-gray-700">No gift cards{statusFilter !== 'all' ? ` · ${STATUS_LABEL[statusFilter]}` : ''}</p>
          <p className="text-xs text-gray-400 mt-0.5">Tap "Issue gift card" to mint your first one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(['active','redeemed','voided','expired'] as GiftCardStatus[]).map(s => groups[s].length > 0 && (
            <section key={s}>
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5 px-1">
                {STATUS_LABEL[s]} · {groups[s].length}
              </h3>
              <div className="space-y-1.5">
                {groups[s].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setOpenCard(c)}
                    className="w-full flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-purple-200 transition text-left"
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[c.status]}`}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-[13px] font-bold text-gray-900 tracking-wider">{c.code}</code>
                        <span className="text-[11px] font-extrabold text-sniffy-purple">{money(c.amount)}</span>
                        {c.status === 'active' && c.balance !== c.amount && (
                          <span className="text-[10px] text-amber-600 font-bold">· {money(c.balance)} left</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {c.issued_to_name ?? 'Unnamed recipient'}
                        {c.issued_to_phone && <> · {formatPhoneDisplay(c.issued_to_phone)}</>}
                        {' · '}exp {fmtDate(c.expires_at)}
                      </p>
                    </div>
                    <span
                      onClick={(e) => { e.stopPropagation(); copyCode(c.code); }}
                      className="text-gray-300 hover:text-sniffy-purple p-1 shrink-0 cursor-pointer"
                      title="Copy code"
                    >
                      {copiedCode === c.code ? <Check size={13} className="text-green-500"/> : <Copy size={13}/>}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Issue modal */}
      <AnimatePresence>
        {issuing && (
          <IssueGiftCardModal
            onClose={() => setIssuing(false)}
            onIssued={() => { setIssuing(false); reload(); }}
          />
        )}
      </AnimatePresence>

      {/* Detail slide-over */}
      <AnimatePresence>
        {openCard && (
          <GiftCardDetailModal
            card={openCard}
            onClose={() => setOpenCard(null)}
            onChanged={() => { reload(); setOpenCard(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'purple' }) {
  return (
    <div className={`bg-white rounded-xl border ${accent === 'purple' ? 'border-purple-200' : 'border-gray-100'} p-3`}>
      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{label}</p>
      <p className={`text-base font-extrabold mt-0.5 ${accent === 'purple' ? 'text-sniffy-purple' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}

function IssueGiftCardModal({ onClose, onIssued }: { onClose: () => void; onIssued: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const oneYearOut = new Date();
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);

  const [amount, setAmount]           = useState<number | ''>(1000);
  const [recipientName, setRecip]     = useState('');
  const [recipientPhone, setRecPhone] = useState('');
  const [purchaserName, setPName]     = useState('');
  const [purchaserPhone, setPPhone]   = useState('');
  const [message, setMessage]         = useState('');
  const [expiresAt, setExpiresAt]     = useState<string>(oneYearOut.toISOString().slice(0, 10));
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [issued, setIssued]           = useState<{ code: string; amount: number; expires_at: string } | null>(null);

  async function issue() {
    if (!amount || Number(amount) <= 0) { setError('Enter an amount'); return; }
    setSaving(true); setError(null);
    try {
      const { data, error: err } = await supabase.rpc('issue_gift_card', {
        p_amount:           Number(amount),
        p_recipient_name:   recipientName.trim() || null,
        p_recipient_phone:  recipientPhone.trim() || null,
        p_purchaser_name:   purchaserName.trim() || null,
        p_purchaser_phone:  purchaserPhone.trim() || null,
        p_message:          message.trim() || null,
        p_expires_at:       expiresAt || null,
        p_issued_by:        'coordinator',
      });
      if (err) throw err;
      if (!data || !(data as { success: boolean }).success) {
        throw new Error((data as { error?: string })?.error ?? 'Could not issue card');
      }
      setIssued({
        code:       (data as { code: string }).code,
        amount:     Number(amount),
        expires_at: expiresAt,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setSaving(false); }
  }

  function shareViaWhatsApp() {
    if (!issued) return;
    const url = buildGiftCardShareUrl({
      code:           issued.code,
      amount:         issued.amount,
      expires_at:     issued.expires_at,
      message:        message || null,
      purchaser_name: purchaserName || null,
    }, normalizePhone(recipientPhone));
    window.open(url, '_blank');
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Gift size={16} className="text-sniffy-purple"/>
                {issued ? 'Gift card ready' : 'Issue a gift card'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={16}/>
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-2 mb-3 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
                <AlertCircle size={11} className="mt-0.5 shrink-0 text-red-500"/>
                <span className="flex-1 break-words">{error}</span>
              </div>
            )}

            {issued ? (
              <div className="space-y-3">
                <div className="text-center py-5 bg-gradient-to-br from-purple-50 to-yellow-50 border-2 border-dashed border-purple-200 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Gift card code</p>
                  <p className="text-2xl font-extrabold tracking-widest text-sniffy-purple mt-1">{issued.code}</p>
                  <p className="text-xl font-extrabold text-gray-900 mt-2">{money(issued.amount)}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Valid until {fmtDate(issued.expires_at)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(issued.code)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-sniffy-purple bg-purple-50 border border-purple-200 active:scale-95"
                  >
                    <Copy size={12}/> Copy code
                  </button>
                  <button
                    onClick={shareViaWhatsApp}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600 active:scale-95"
                  >
                    <Share2 size={12}/> Share on WhatsApp
                  </button>
                </div>
                <button
                  onClick={onIssued}
                  className="w-full px-4 py-2 rounded-xl text-xs font-bold text-gray-600 border border-gray-200 hover:bg-gray-50"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Field label="Amount (₹) *">
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple"
                  />
                </Field>

                <Field label="Recipient name (optional)">
                  <input
                    type="text" value={recipientName} onChange={e => setRecip(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple"
                  />
                </Field>

                <Field label="Recipient phone (optional — used for WhatsApp delivery)">
                  <input
                    type="tel" value={recipientPhone} onChange={e => setRecPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="Purchaser name">
                    <input
                      type="text" value={purchaserName} onChange={e => setPName(e.target.value)}
                      placeholder="Who bought it"
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-sniffy-purple"
                    />
                  </Field>
                  <Field label="Purchaser phone">
                    <input
                      type="tel" value={purchaserPhone} onChange={e => setPPhone(e.target.value)}
                      placeholder="+91…"
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-sniffy-purple"
                    />
                  </Field>
                </div>

                <Field label="Gift message (shown on the share card)">
                  <textarea
                    value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Happy birthday, Bruno!"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-sniffy-purple resize-none"
                  />
                </Field>

                <Field label="Expires on">
                  <input
                    type="date" value={expiresAt} min={today} onChange={e => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple"
                  />
                </Field>

                <button
                  onClick={issue}
                  disabled={saving || !amount || Number(amount) <= 0}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-sniffy-purple disabled:opacity-60 transition active:scale-95"
                >
                  {saving ? <Loader2 size={13} className="animate-spin"/> : <Gift size={13}/>}
                  Issue card
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

function GiftCardDetailModal({ card, onClose, onChanged }: {
  card: GiftCard;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [redemptions, setRedemptions] = useState<GiftCardRedemption[]>([]);
  const [loading, setLoading]         = useState(true);
  const [voiding, setVoiding]         = useState(false);
  const [voidReason, setVoidReason]   = useState('');
  const [confirmVoid, setConfirmVoid] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  async function loadRedemptions() {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('gift_card_redemptions')
        .select('*')
        .eq('gift_card_id', card.id)
        .order('created_at', { ascending: false });
      if (err) throw err;
      setRedemptions((data ?? []) as GiftCardRedemption[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setLoading(false); }
  }

  useEffect(() => { loadRedemptions(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [card.id]);

  async function voidCard() {
    setVoiding(true); setError(null);
    try {
      const { data, error: err } = await supabase.rpc('void_gift_card', {
        p_card_id: card.id,
        p_by:      'coordinator',
        p_reason:  voidReason.trim() || null,
      });
      if (err) throw err;
      if (!data || !(data as { success: boolean }).success) {
        throw new Error((data as { error?: string })?.error ?? 'Could not void');
      }
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setVoiding(false); }
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
                <Gift size={16} className="text-sniffy-purple"/> {card.code}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-yellow-50 border border-purple-200 rounded-2xl p-3 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Face value</p>
                  <p className="text-2xl font-extrabold text-sniffy-purple">{money(card.amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Remaining</p>
                  <p className="text-lg font-extrabold text-gray-900">{money(card.balance)}</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Status: <span className="font-bold uppercase">{card.status}</span> · expires {fmtDate(card.expires_at)}</p>
            </div>

            <div className="space-y-1.5 text-xs mb-3">
              <Row label="Recipient" value={card.issued_to_name ?? '—'}/>
              <Row label="Phone"     value={card.issued_to_phone ? formatPhoneDisplay(card.issued_to_phone) : '—'}/>
              <Row label="Purchaser" value={card.purchaser_name ?? '—'}/>
              {card.message && <Row label="Message" value={card.message}/>}
              <Row label="Issued by" value={card.issued_by ?? '—'}/>
              <Row label="Issued at" value={new Date(card.issued_at).toLocaleString('en-IN')}/>
              {card.voided_at && (
                <>
                  <Row label="Voided by"  value={card.voided_by ?? 'coordinator'}/>
                  <Row label="Voided at"  value={new Date(card.voided_at).toLocaleString('en-IN')}/>
                  {card.void_reason && <Row label="Reason" value={card.void_reason}/>}
                </>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 mb-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">Redemption history</p>
              {loading ? (
                <p className="text-[11px] text-gray-400 text-center py-2">
                  <Loader2 size={12} className="inline animate-spin"/>
                </p>
              ) : redemptions.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic text-center py-2">No redemptions yet.</p>
              ) : (
                <ul className="space-y-1">
                  {redemptions.map(r => (
                    <li key={r.id} className="text-[11px] text-gray-600 flex justify-between bg-gray-50 rounded-lg px-2 py-1">
                      <span>{new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {r.note ?? 'redeemed'}</span>
                      <span className="font-bold text-red-600">- {money(r.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-2 mb-3 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
                <AlertCircle size={11} className="mt-0.5 shrink-0 text-red-500"/>
                <span className="flex-1 break-words">{error}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const url = buildGiftCardShareUrl(card, card.issued_to_phone);
                  window.open(url, '_blank');
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600 active:scale-95"
              >
                <Share2 size={12}/> Share
              </button>
              {card.status === 'active' && (
                !confirmVoid ? (
                  <button
                    onClick={() => setConfirmVoid(true)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50"
                  >
                    <Ban size={12}/> Void
                  </button>
                ) : (
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      value={voidReason}
                      onChange={e => setVoidReason(e.target.value)}
                      placeholder="Reason"
                      className="flex-1 px-2 py-2 text-xs border border-red-200 rounded-xl focus:outline-none"
                    />
                    <button
                      onClick={voidCard}
                      disabled={voiding}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-red-500 disabled:opacity-60 active:scale-95"
                    >
                      {voiding ? <Loader2 size={11} className="animate-spin"/> : 'Confirm'}
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{label}</span>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-800 font-semibold text-right break-words max-w-[60%]">{value}</span>
    </div>
  );
}
