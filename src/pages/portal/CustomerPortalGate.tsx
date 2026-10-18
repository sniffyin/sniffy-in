/**
 * portal/CustomerPortalGate.tsx — Phase 4
 *
 * The phone-OTP login flow that gates the customer portal.  Two steps:
 *
 *   1. Phone entry → supabase.auth.signInWithOtp({ phone })
 *      Supabase sends an OTP via the configured SMS provider (Twilio).
 *   2. OTP entry  → supabase.auth.verifyOtp({ phone, token, type: 'sms' })
 *      On success, we call link_auth_user_to_customer() RPC which
 *      looks up the customer master row by normalized phone and sets
 *      customers.auth_user_id = auth.uid().  This is the single hook
 *      that connects the new Supabase identity to the existing
 *      customer record we've been maintaining since Phase 1.
 *
 * If link_auth_user_to_customer() returns NULL, the phone OTP'd in
 * doesn't match any customer in our master.  We surface a friendly
 * "no account on file" message rather than create a ghost customer —
 * Phase 1 invariant: customers are only minted from grooming sessions.
 *
 * Once linked, the parent component swaps in the portal shell.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { normalizePhone } from '../admin/customerTypes';

// ─────────────────────────────────────────────────────────────────────
// TEST MODE — OTP BYPASS
// ─────────────────────────────────────────────────────────────────────
// Set to `false` to restore the real WhatsApp OTP flow (Phase 4 default).
// When `true`, entering any existing customer's phone number signs you
// straight in as that customer — NO OTP, no Supabase auth session.  The
// resolved customer id is stashed in sessionStorage under
// `sniffy.portal.bypassCustomerId` so a page refresh still works, and
// CustomerPortal.tsx reads the same key on mount.
//
// IMPORTANT: this bypass is for local / staging testing ONLY.  Flip it
// back to `false` before deploying.  The original requestOtp / verify
// functions and the two-step OTP UI are still in this file (just
// branched around the flag) — there is no code to uncomment, only this
// constant to switch.
// ─────────────────────────────────────────────────────────────────────
const TEST_BYPASS_OTP = true;
export const BYPASS_CUSTOMER_ID_KEY = 'sniffy.portal.bypassCustomerId';

interface CustomerSession {
  customerId: string;
  authUserId: string;
  phone: string;
}

export default function CustomerPortalGate({ onAuthed }: { onAuthed: (s: CustomerSession) => void }) {
  const [step, setStep]     = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone]   = useState('');
  const [otp, setOtp]       = useState('');
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [info,  setInfo]    = useState<string | null>(null);

  // Normalised E.164 form sent to Supabase.  Cached so we can use the
  // same value for both signInWithOtp and verifyOtp without the user
  // having to retype.
  const [sentToPhone, setSentToPhone] = useState<string | null>(null);

  // ── TEST MODE — direct sign-in by phone (no OTP) ────────────────────
  // Looks up the customer master by normalised phone and calls onAuthed
  // straight away.  No supabase.auth interaction; the resolved id is
  // stashed in sessionStorage so CustomerPortal.tsx picks it up on
  // refresh.  Same "no account on file" surface as the real flow when
  // the phone doesn't match any customer.
  async function testBypassSignIn() {
    const normalized = normalizePhone(phone);
    if (!normalized) {
      setError('That phone number doesn’t look right. Indian numbers are 10 digits.');
      return;
    }
    setBusy(true); setError(null); setInfo(null);
    try {
      const { data, error: err } = await supabase
        .from('customers')
        .select('id, phone')
        .eq('phone', normalized)
        .maybeSingle();
      if (err) throw err;
      if (!data) {
        setError(
          `No Sniffy account on file for ${normalized}. ` +
          `Try another customer's phone (any number from the Customers tab).`
        );
        return;
      }
      try { sessionStorage.setItem(BYPASS_CUSTOMER_ID_KEY, data.id as string); } catch {}
      onAuthed({
        customerId: data.id as string,
        authUserId: 'test-bypass',
        phone:      normalized,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setBusy(false); }
  }

  async function requestOtp() {
    const normalized = normalizePhone(phone);
    if (!normalized) {
      setError('That phone number doesn’t look right. Indian numbers are 10 digits.');
      return;
    }
    setBusy(true); setError(null); setInfo(null);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({ phone: normalized });
      if (err) throw err;
      setSentToPhone(normalized);
      setStep('otp');
      // OTP delivery is routed via the Supabase Send-SMS-Hook Edge
      // Function (`supabase/functions/send-otp-whatsapp`) which sends
      // via AiSensy WhatsApp.  Phrase it that way so customers know
      // to look for a WhatsApp message, not an SMS.
      setInfo(`Code sent to ${normalized} on WhatsApp.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setBusy(false); }
  }

  async function verify() {
    if (!sentToPhone || !otp.trim()) return;
    setBusy(true); setError(null);
    try {
      const { data, error: err } = await supabase.auth.verifyOtp({
        phone: sentToPhone,
        token: otp.trim(),
        type:  'sms',
      });
      if (err) throw err;
      if (!data.user) throw new Error('Verification failed — no user returned.');

      // Link auth.users.id ↔ customers.id by matching phone.
      // RPC returns NULL when no customer master row exists for this
      // phone — surface a clear message instead of dropping them into
      // an empty portal.
      const { data: linkedId, error: linkErr } = await supabase.rpc('link_auth_user_to_customer');
      if (linkErr) throw linkErr;
      if (!linkedId) {
        await supabase.auth.signOut();
        setError(
          `We couldn’t find a Sniffy account for ${sentToPhone}. ` +
          `Please book a grooming session first, or contact us if this is a mistake.`
        );
        setStep('phone');
        setOtp('');
        return;
      }
      onAuthed({
        customerId: linkedId as string,
        authUserId: data.user.id,
        phone:      sentToPhone,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setBusy(false); }
  }

  async function changePhone() {
    setStep('phone');
    setOtp('');
    setError(null);
    setInfo(null);
    setSentToPhone(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl border border-gray-100 p-7"
        style={{ boxShadow: '0 24px 64px rgba(69,26,139,0.10), 0 4px 16px rgba(0,0,0,0.06)' }}
      >
        <div className="text-center mb-6">
          <img src="/sniffy-logo.png" alt="Sniffy" className="h-12 w-auto object-contain mx-auto"/>
          <h1 className="text-xl font-extrabold text-gray-900 mt-3">
            {step === 'phone' ? 'Sign in to your account' : 'Enter the code'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {TEST_BYPASS_OTP
              ? 'Test mode — enter any customer’s phone to view their portal.'
              : step === 'phone'
                ? 'We’ll WhatsApp you a one-time code.'
                : `Sent to ${sentToPhone} on WhatsApp.`}
          </p>
        </div>

        {/* {TEST_BYPASS_OTP && (
          <div className="flex items-start gap-2 p-2.5 mb-4 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
            <AlertCircle size={12} className="mt-0.5 shrink-0 text-amber-600"/>
            <span className="flex-1">
              <b>OTP bypass is ON.</b> Any customer phone signs in instantly.
              Flip <code className="font-mono">TEST_BYPASS_OTP</code> back to <code className="font-mono">false</code> in this file to restore the real flow.
            </span>
          </div>
        )} */}

        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <AlertCircle size={13} className="mt-0.5 shrink-0 text-red-500"/>
            <span className="flex-1 break-words">{error}</span>
          </div>
        )}

        {info && !error && step === 'otp' && (
          <div className="p-3 mb-4 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700">
            {info}
          </div>
        )}

        {step === 'phone' ? (
          <>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Phone number</span>
              <div className="mt-1.5 relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  type="tel"
                  autoFocus
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') requestOtp(); }}
                  placeholder="98XXX XXXXX"
                  className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple focus:ring-2 focus:ring-sniffy-purple/20 transition"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                Use the phone you booked your grooming with.
              </p>
            </label>

            <button
              onClick={TEST_BYPASS_OTP ? testBypassSignIn : requestOtp}
              disabled={busy || !phone.trim()}
              className="mt-5 w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold text-white bg-sniffy-purple disabled:opacity-60 transition active:scale-95"
            >
              {busy ? <Loader2 size={14} className="animate-spin"/> : <ArrowRight size={14}/>}
              {TEST_BYPASS_OTP ? 'Sign in' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">6-digit code</span>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                onKeyDown={e => { if (e.key === 'Enter') verify(); }}
                placeholder="000000"
                className="mt-1.5 w-full px-3 py-3 border border-gray-200 rounded-xl text-base tracking-[0.5em] text-center font-bold focus:outline-none focus:border-sniffy-purple focus:ring-2 focus:ring-sniffy-purple/20 transition"
              />
            </label>

            <button
              onClick={verify}
              disabled={busy || otp.length < 4}
              className="mt-5 w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold text-white bg-sniffy-purple disabled:opacity-60 transition active:scale-95"
            >
              {busy ? <Loader2 size={14} className="animate-spin"/> : <ArrowRight size={14}/>}
              Verify &amp; sign in
            </button>

            <button
              onClick={changePhone}
              disabled={busy}
              className="mt-3 w-full flex items-center justify-center gap-1 text-[11px] text-gray-500 hover:text-sniffy-purple disabled:opacity-40 transition"
            >
              <ArrowLeft size={11}/> Wrong number? Change phone
            </button>
          </>
        )}

        <p className="text-[10px] text-gray-400 text-center mt-6 leading-relaxed">
          By signing in you agree to receive grooming updates from Sniffy on WhatsApp.
          You can opt out anytime from your profile.
        </p>
      </motion.div>
    </div>
  );
}
