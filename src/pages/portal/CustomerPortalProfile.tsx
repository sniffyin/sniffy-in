/**
 * portal/CustomerPortalProfile.tsx — Phase 4
 *
 * Profile editor for the signed-in customer.  Self-service for:
 *   • Name, email, address, city, GPS share link
 *   • WhatsApp opt-in + marketing opt-in
 *   • Outreach snooze (7d / 30d / 90d / 1 year) or resume
 *   • Sign-out
 *
 * Phone is NOT editable here — it's the identity key against
 * Supabase Auth.  Changing it would mean re-OTP'ing.  If a customer
 * needs to change phones, they should contact admin to merge their
 * old + new records (Phase 2a merge tool).
 *
 * Saves go straight to `customers` via the RLS-scoped self-update
 * policy from the Phase 4 migration.  No RPC needed.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save, Loader2, AlertCircle, X, Phone, PauseCircle, PlayCircle, LogOut, MessageCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Customer, formatPhoneDisplay } from '../admin/customerTypes';

export default function CustomerPortalProfile({
  customer, onCustomerChanged, onSignOut,
}: {
  customer: Customer;
  onCustomerChanged: () => void;
  onSignOut: () => void;
}) {
  const [name, setName]                   = useState(customer.name ?? '');
  const [email, setEmail]                 = useState(customer.email ?? '');
  const [address, setAddress]             = useState(customer.address ?? '');
  const [city, setCity]                   = useState(customer.city ?? '');
  const [gpsLocation, setGps]             = useState(customer.gps_location ?? '');
  const [whatsappOptIn, setWhatsappOptIn] = useState(customer.whatsapp_opt_in);
  const [marketingOptIn, setMarketingOptIn] = useState(customer.marketing_opt_in);
  const [pausedUntil, setPausedUntil]     = useState<string | null>(
    ((customer as unknown) as { outreach_paused_until?: string | null }).outreach_paused_until ?? null
  );

  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [savedFlash, setFlash] = useState(false);
  const [snoozeBusy, setSnoozeBusy] = useState(false);

  // Reseed if the customer prop changes (parent refetched after save).
  useEffect(() => {
    setName(customer.name ?? '');
    setEmail(customer.email ?? '');
    setAddress(customer.address ?? '');
    setCity(customer.city ?? '');
    setGps(customer.gps_location ?? '');
    setWhatsappOptIn(customer.whatsapp_opt_in);
    setMarketingOptIn(customer.marketing_opt_in);
    setPausedUntil(((customer as unknown) as { outreach_paused_until?: string | null }).outreach_paused_until ?? null);
  }, [customer]);

  useEffect(() => {
    if (!savedFlash) return;
    const t = setTimeout(() => setFlash(false), 1400);
    return () => clearTimeout(t);
  }, [savedFlash]);

  async function save() {
    setSaving(true); setError(null);
    try {
      const { error: err } = await supabase
        .from('customers')
        .update({
          name: name.trim(),
          email: email.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          gps_location: gpsLocation.trim() || null,
          whatsapp_opt_in:  whatsappOptIn,
          marketing_opt_in: marketingOptIn,
        })
        .eq('id', customer.id);
      if (err) throw err;
      setFlash(true);
      onCustomerChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setSaving(false); }
  }

  async function applySnooze(days: number | null) {
    setSnoozeBusy(true); setError(null);
    try {
      const untilDate = days == null
        ? null
        : (() => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); })();
      const { error: err } = await supabase
        .from('customers')
        .update({ outreach_paused_until: untilDate })
        .eq('id', customer.id);
      if (err) throw err;

      // Drop any queued reminders so they don't surface to admin today.
      if (days != null) {
        const { error: skipErr } = await supabase
          .from('outreach_log')
          .update({ status: 'skipped', skip_reason: `customer_snoozed:${days}d` })
          .eq('customer_id', customer.id)
          .eq('status', 'queued');
        if (skipErr) console.warn('[CustomerPortalProfile] queue-clear failed:', skipErr);
      }
      setPausedUntil(untilDate);
      onCustomerChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setSnoozeBusy(false); }
  }

  const isPaused = !!pausedUntil && new Date(pausedUntil) >= new Date(new Date().toDateString());

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-extrabold text-gray-900">Your profile</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Keep your contact details current so we can reach you.
        </p>
      </header>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <AlertCircle size={13} className="mt-0.5 shrink-0 text-red-500"/>
          <span className="flex-1 break-words">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400"><X size={11}/></button>
        </div>
      )}

      {/* Phone (read-only) */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 flex items-center gap-3">
        <Phone size={16} className="text-sniffy-purple"/>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider font-bold text-sniffy-purple">Phone (sign-in)</p>
          <p className="text-sm font-bold text-gray-900">{formatPhoneDisplay(customer.phone)}</p>
        </div>
        <p className="text-[10px] text-gray-400 max-w-[120px] text-right">
          To change phone, ask us to merge accounts.
        </p>
      </div>

      {/* Editable info */}
      <Section title="Personal info">
        <Field label="Name">
          <input type="text" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple"
            value={name} onChange={e => setName(e.target.value)}/>
        </Field>
        <Field label="Email (optional)">
          <input type="email" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple"
            value={email} onChange={e => setEmail(e.target.value)} placeholder="for receipts"/>
        </Field>
        <Field label="Address">
          <textarea rows={2}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple resize-none"
            value={address} onChange={e => setAddress(e.target.value)}/>
        </Field>
        <Field label="City">
          <input type="text" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple"
            value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Pune"/>
        </Field>
        <Field label="GPS / Google Maps link (optional)">
          <input type="text" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple"
            value={gpsLocation} onChange={e => setGps(e.target.value)} placeholder="https://maps.app.goo.gl/…"/>
          <p className="text-[10px] text-gray-400 mt-1 ml-1">
            Share your location link so the groomer can navigate directly.
          </p>
        </Field>
      </Section>

      <Section title="Notifications">
        <ToggleRow
          label="WhatsApp reminders & confirmations"
          subtitle="Used for booking confirmations and gentle 'time for next groom' nudges."
          checked={whatsappOptIn}
          onChange={setWhatsappOptIn}
        />
        <ToggleRow
          label="Special offers & marketing"
          subtitle="Occasional promotions, discounts, seasonal campaigns."
          checked={marketingOptIn}
          onChange={setMarketingOptIn}
        />
      </Section>

      {/* Snooze controls */}
      <Section title="Pause outreach">
        {isPaused ? (
          <div className="flex items-center justify-between gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-800 flex items-center gap-1">
                <PauseCircle size={12}/> Paused until {new Date(pausedUntil!).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-[11px] text-amber-700/80 mt-0.5">We won't send reminders until then.</p>
            </div>
            <button
              onClick={() => applySnooze(null)}
              disabled={snoozeBusy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-800 bg-white border border-amber-300 hover:bg-amber-100 disabled:opacity-60 transition"
            >
              {snoozeBusy ? <Loader2 size={11} className="animate-spin"/> : <PlayCircle size={11}/>}
              Resume
            </button>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-gray-500 mb-2">
              Going on holiday or just need a break?  Pause reminders for a while.
            </p>
            <div className="flex gap-2 flex-wrap">
              {[7, 30, 90, 365].map(d => (
                <button
                  key={d}
                  onClick={() => applySnooze(d)}
                  disabled={snoozeBusy}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:border-amber-300 hover:text-amber-700 disabled:opacity-60 transition"
                >
                  {d === 7 ? '7 days' : d === 30 ? '30 days' : d === 90 ? '90 days' : '1 year'}
                </button>
              ))}
            </div>
          </>
        )}
      </Section>

      {/* Save bar */}
      <div className="sticky bottom-20 sm:bottom-4 flex items-center justify-between gap-2 bg-white border border-gray-100 rounded-2xl p-3 shadow-md">
        <div className="flex-1 min-w-0">
          {savedFlash ? (
            <motion.p
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="text-xs font-semibold text-green-600"
            >Saved ✓</motion.p>
          ) : (
            <p className="text-[11px] text-gray-400">Changes save to your account.</p>
          )}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-sniffy-purple disabled:opacity-60 transition active:scale-95"
        >
          {saving ? <Loader2 size={12} className="animate-spin"/> : <Save size={12}/>}
          Save changes
        </button>
      </div>

      {/* Sign-out */}
      <div className="pt-2 text-center">
        <button
          onClick={onSignOut}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 font-semibold transition"
        >
          <LogOut size={11}/> Sign out
        </button>
      </div>
    </div>
  );
}

// ─── Layout helpers ─────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function ToggleRow({ label, subtitle, checked, onChange }: {
  label: string;
  subtitle: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3 p-3 bg-white border border-gray-100 rounded-2xl cursor-pointer">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <MessageCircle size={12} className="text-sniffy-purple"/>
          {label}
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-5 h-5 rounded text-sniffy-purple focus:ring-sniffy-purple shrink-0 mt-1"
      />
    </label>
  );
}
