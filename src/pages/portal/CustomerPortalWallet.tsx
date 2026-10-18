/**
 * portal/CustomerPortalWallet.tsx — Phase 6a/6b unified wallet
 *
 * Single view of every kind of credit a customer can spend at Sniffy:
 *   • Referral credits (Phase 5 — earned by inviting friends)
 *   • Gift card balance (Phase 6a — prepaid value)
 *
 * Two separate ledgers under the hood (referral_credits and
 * gift_card_redemptions / gift_cards), unified in this UI.  We DO NOT
 * merge them at the DB layer — each has its own anti-fraud invariants.
 *
 * Layout:
 *   ┌─────────────────────────────────────────┐
 *   │       Total Sniffy credit               │
 *   │           ₹1,200                        │
 *   │   ₹200 referral · ₹1,000 gift cards     │
 *   ├─────────────────────────────────────────┤
 *   │  Redeem a gift card        [ Apply ]    │
 *   │  GCXXXX-XXXX-XXXX                       │
 *   ├─────────────────────────────────────────┤
 *   │  Your gift cards                        │
 *   │  • GC...   ₹500 remaining · exp 14 Jun  │
 *   ├─────────────────────────────────────────┤
 *   │  Recent activity                        │
 *   │  • -₹200  Redeemed at session 12-May    │
 *   │  • +₹200  Referral reward (Priya)       │
 *   └─────────────────────────────────────────┘
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Gift, AlertCircle, Loader2, Sparkles, Check,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  Customer,
  GiftCard, ReferralCredit,
} from '../admin/customerTypes';

interface ActivityRow {
  source: 'referral' | 'gift_card';
  amount: number;
  note:   string;
  when:   string;
}

function money(n: number | null | undefined): string {
  if (!n) return '₹0';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CustomerPortalWallet({ customer }: {
  customer: Customer;
  onCustomerChanged: () => void;
}) {
  const [referralBalance, setReferralBalance]     = useState<number>(0);
  const [referralLedger, setReferralLedger]       = useState<ReferralCredit[]>([]);
  const [giftCards, setGiftCards]                 = useState<GiftCard[]>([]);
  const [giftRedemptions, setGiftRedemptions]     = useState<{ id: string; gift_card_id: string; amount: number; note: string | null; created_at: string }[]>([]);

  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [redeemCode, setRedeemCode]     = useState('');
  const [redeeming, setRedeeming]       = useState(false);
  const [redeemSuccess, setRedeemSucc]  = useState<{ code: string; balance: number } | null>(null);
  const [redeemError, setRedeemError]   = useState<string | null>(null);

  async function reload() {
    setLoading(true); setError(null);
    try {
      const [bal, led, gc, gr] = await Promise.all([
        supabase.from('customer_referral_balance').select('balance').eq('customer_id', customer.id).maybeSingle(),
        supabase.from('referral_credits').select('*').eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('gift_cards').select('*')
          .or(`issued_to_customer_id.eq.${customer.id},issued_to_phone.eq.${customer.phone}`)
          .order('issued_at', { ascending: false }),
        supabase.from('gift_card_redemptions').select('*').eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(50),
      ]);
      if (bal.error) throw bal.error;
      if (led.error) throw led.error;
      if (gc.error) throw gc.error;
      if (gr.error) throw gr.error;

      setReferralBalance(Number((bal.data as { balance: number } | null)?.balance ?? 0));
      setReferralLedger((led.data ?? []) as ReferralCredit[]);
      setGiftCards((gc.data ?? []) as GiftCard[]);
      setGiftRedemptions((gr.data ?? []) as { id: string; gift_card_id: string; amount: number; note: string | null; created_at: string }[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setLoading(false); }
  }

  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [customer.id]);

  // Gift-card balance = sum of remaining on ACTIVE non-expired cards.
  const today = new Date().toISOString().slice(0, 10);
  const activeCards = useMemo(
    () => giftCards.filter(c => c.status === 'active' && c.balance > 0 && c.expires_at >= today),
    [giftCards, today],
  );
  const giftBalance = useMemo(
    () => activeCards.reduce((s, c) => s + Number(c.balance), 0),
    [activeCards],
  );
  const totalBalance = referralBalance + giftBalance;

  // Merge ledgers into one chronologically-sorted activity list.
  const activity = useMemo<ActivityRow[]>(() => {
    const out: ActivityRow[] = [];
    referralLedger.forEach(r => {
      out.push({
        source: 'referral',
        amount: Number(r.amount),
        note:   r.note ?? ({ signup: 'Signup credit', earn: 'Referral reward', redeem: 'Redeemed', expire: 'Expired', adjust: 'Adjustment' }[r.reason]),
        when:   r.created_at,
      });
    });
    giftRedemptions.forEach(g => {
      out.push({
        source: 'gift_card',
        amount: -Math.abs(Number(g.amount)),       // redemptions are negative for display
        note:   g.note ?? 'Gift card redemption',
        when:   g.created_at,
      });
    });
    out.sort((a, b) => b.when.localeCompare(a.when));
    return out.slice(0, 30);
  }, [referralLedger, giftRedemptions]);

  async function applyGiftCard() {
    const code = redeemCode.trim().toUpperCase();
    if (!code) return;
    setRedeeming(true); setRedeemError(null); setRedeemSucc(null);
    try {
      // Portal-side redemption does NOT debit balance — that happens
      // at session time by the coordinator (admin RPC).  Here we just
      // LINK the card to the customer so they can see it in their
      // wallet.  We do that by fetching it; the unique partial index
      // on issued_to_phone lets the auto-link trigger pick it up if
      // it was issued to their phone.  Otherwise we manually set
      // issued_to_customer_id when the recipient phone matches.
      const { data: card, error: err } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', code)
        .maybeSingle();
      if (err) throw err;
      if (!card) {
        setRedeemError('Code not found. Check spelling.');
        return;
      }
      const c = card as GiftCard;
      if (c.status === 'voided')   { setRedeemError('This card has been voided.'); return; }
      if (c.status === 'redeemed') { setRedeemError('This card has already been fully redeemed.'); return; }
      if (c.expires_at < today)    { setRedeemError('This card has expired.'); return; }

      // Recipient match: either the phone on the card matches the
      // signed-in customer's phone, or the card has no recipient at
      // all (open-bearer card).
      if (c.issued_to_phone && c.issued_to_phone !== customer.phone &&
          c.issued_to_customer_id && c.issued_to_customer_id !== customer.id) {
        setRedeemError('This gift card is not registered to your phone number. Please contact us.');
        return;
      }

      // Link the card so the balance view picks it up next reload.
      if (c.issued_to_customer_id !== customer.id) {
        const { error: linkErr } = await supabase
          .from('gift_cards')
          .update({
            issued_to_customer_id: customer.id,
            issued_to_phone:       c.issued_to_phone ?? customer.phone,
          })
          .eq('id', c.id);
        if (linkErr) throw linkErr;
      }

      setRedeemSucc({ code: c.code, balance: Number(c.balance) });
      setRedeemCode('');
      await reload();
    } catch (err) {
      setRedeemError(err instanceof Error ? err.message : String(err));
    } finally { setRedeeming(false); }
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <Wallet size={18} className="text-sniffy-purple"/> Wallet
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Your Sniffy credit — referral rewards and gift cards in one place.</p>
      </header>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <AlertCircle size={13} className="mt-0.5 shrink-0 text-red-500"/>
          <span className="flex-1 break-words">{error}</span>
        </div>
      )}

      {/* Hero balance card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-sniffy-purple via-purple-700 to-purple-900 text-white rounded-2xl p-5 shadow-lg shadow-purple-200/50"
      >
        <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Total Sniffy credit</p>
        <p className="text-4xl font-extrabold mt-1">{loading ? '…' : money(totalBalance)}</p>
        <div className="mt-3 flex items-center gap-3 text-[11px] opacity-90">
          <span className="flex items-center gap-1"><Sparkles size={11}/> {money(referralBalance)} referral</span>
          <span className="opacity-50">·</span>
          <span className="flex items-center gap-1"><Gift size={11}/> {money(giftBalance)} gift cards</span>
        </div>
        <p className="text-[10px] opacity-60 mt-3 leading-snug">
          Credits apply automatically at your next session. Mention them at booking if you want a specific amount applied.
        </p>
      </motion.div>

      {/* Redeem gift card */}
      <section className="bg-white border border-gray-100 rounded-2xl p-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
          <Gift size={12} className="text-sniffy-purple"/> Have a gift card code?
        </p>
        <div className="flex gap-2">
          <input
            value={redeemCode}
            onChange={e => { setRedeemCode(e.target.value); setRedeemSucc(null); setRedeemError(null); }}
            placeholder="GCXXXXXXXX"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:border-sniffy-purple uppercase"
          />
          <button
            onClick={applyGiftCard}
            disabled={redeeming || !redeemCode.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-sniffy-purple disabled:opacity-60 active:scale-95"
          >
            {redeeming ? <Loader2 size={13} className="animate-spin"/> : 'Apply'}
          </button>
        </div>
        {redeemSuccess && (
          <p className="text-[11px] text-green-700 mt-2 flex items-center gap-1">
            <Check size={11}/> Added {money(redeemSuccess.balance)} from card {redeemSuccess.code} to your wallet.
          </p>
        )}
        {redeemError && (
          <p className="text-[11px] text-red-600 mt-2">{redeemError}</p>
        )}
      </section>

      {/* Gift cards list */}
      {activeCards.length > 0 && (
        <section>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">
            Your gift cards · {activeCards.length}
          </h3>
          <div className="space-y-2">
            {activeCards.map(c => (
              <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-purple-50 text-sniffy-purple flex items-center justify-center shrink-0">
                  <Gift size={16}/>
                </span>
                <div className="flex-1 min-w-0">
                  <code className="text-sm font-bold text-gray-900 tracking-wider">{c.code}</code>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {money(c.balance)} of {money(c.amount)} remaining · expires {fmtDate(c.expires_at)}
                  </p>
                  {c.message && (
                    <p className="text-[11px] text-sniffy-purple italic mt-0.5 truncate">"{c.message}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Activity */}
      <section>
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">Recent activity</h3>
        {loading ? (
          <div className="space-y-1.5">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"/>)}
          </div>
        ) : activity.length === 0 ? (
          <p className="text-center py-6 text-xs text-gray-400 italic bg-white border border-dashed border-gray-200 rounded-xl">
            No wallet activity yet.
          </p>
        ) : (
          <div className="space-y-1.5">
            {activity.map((a, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full ${a.source === 'referral' ? 'bg-amber-400' : 'bg-purple-400'}`}/>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-700 truncate">{a.note}</p>
                  <p className="text-[10px] text-gray-400">{fmtDate(a.when)} · {a.source === 'referral' ? 'Referral' : 'Gift card'}</p>
                </div>
                <span className={`font-extrabold tabular-nums ${a.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {a.amount >= 0 ? '+' : '-'}{money(Math.abs(a.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
