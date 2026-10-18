/**
 * portal/CustomerPortalBook.tsx — Phase 4
 *
 * Request-to-book form.  The customer picks a pet, a package, a
 * preferred date, and optionally adds notes.  Submit inserts a row
 * into the existing `bookings` table with `customer_id` pre-filled.
 * Admin sees it as a normal lead with the Phase 1 "Returning customer"
 * badge and converts it to a grooming_session.
 *
 * This is intentionally a REQUEST not a direct session creation:
 *   • Admin owns slot allocation (groomer assignment, vendor capacity)
 *   • Vendor-prepaid sessions (Woofly etc.) don't flow through this
 *   • Cancel/reschedule logic stays in admin
 *
 * On submit we route the user to the Sessions tab with a success
 * banner (handled by the shell via onSubmitted callback).
 */

import { useEffect, useState } from 'react';
import { CalendarPlus, ChevronRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Customer, Pet, petDisplayAge } from '../admin/customerTypes';
import { PACKAGES } from '../admin/types';

export default function CustomerPortalBook({ customer, onSubmitted }: {
  customer: Customer;
  onCustomerChanged: () => void;
  onSubmitted: () => void;
}) {
  const [pets, setPets]               = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [petId, setPetId]             = useState<string | null>(null);
  const [pkg, setPkg]                 = useState<string>('');
  const [preferredDate, setDate]      = useState('');
  const [notes, setNotes]             = useState('');
  const [busy, setBusy]               = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [done, setDone]               = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingPets(true);
      const { data, error: err } = await supabase
        .from('pets').select('*')
        .eq('customer_id', customer.id)
        .eq('is_active', true)
        .order('created_at');
      if (err) {
        console.warn('[CustomerPortalBook] pets fetch failed:', err);
      }
      const rows = (data ?? []) as Pet[];
      setPets(rows);
      if (rows.length === 1) setPetId(rows[0].id);   // auto-select if only one
      setLoadingPets(false);
    })();
  }, [customer.id]);

  // Disallow same-day booking — operations need a minimum lead time.
  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  async function submit() {
    if (!petId) { setError('Please pick a pet.'); return; }
    if (!pkg)   { setError('Please pick a grooming package.'); return; }
    if (!preferredDate) { setError('Please pick a preferred date.'); return; }
    if (preferredDate < minDate) { setError('Please pick a date at least 1 day in advance.'); return; }

    const pet = pets.find(p => p.id === petId);
    if (!pet) { setError('Selected pet not found.'); return; }

    setBusy(true); setError(null);
    try {
      // Translate pet age — bookings.age is an integer, our pet may
      // have age_years or just an age_bucket.  Best effort.
      const ageInt =
        pet.age_years != null ? pet.age_years
        : pet.age_bucket === '0-1 years' ? 1
        : pet.age_bucket === '1-5 years' ? 3
        : pet.age_bucket === '5+ years'  ? 6
        : 0;

      const { error: err } = await supabase.from('bookings').insert([{
        name:           customer.name || 'Portal customer',
        phone:          customer.phone_raw || customer.phone,
        pet_type:       pet.type,
        breed:          pet.breed || 'Unknown',
        age:            ageInt,
        medical:        pet.medical || '',
        city:           customer.city || 'Pune',
        package:        pkg,
        location:       customer.address || customer.gps_location || null,
        customer_id:    customer.id,
        preferred_date: preferredDate,
        customer_notes: notes || null,
      }]);
      if (err) throw err;
      setDone(true);
      setTimeout(() => { onSubmitted(); }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
          <CheckCircle2 size={28}/>
        </div>
        <p className="text-lg font-extrabold text-gray-900">Request received 🐾</p>
        <p className="text-sm text-gray-500 mt-1 max-w-xs text-center">
          We'll WhatsApp you to confirm the slot.  Watch this space — your booking will appear in Sessions once we lock it in.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl font-extrabold text-gray-900">Book a grooming session</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Tell us what you'd like.  We'll WhatsApp you to confirm the slot &amp; groomer.
        </p>
      </header>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <AlertCircle size={13} className="mt-0.5 shrink-0 text-red-500"/>
          <span className="flex-1 break-words">{error}</span>
        </div>
      )}

      {/* Step 1: pet */}
      <Field label="1. Which pet?">
        {loadingPets ? (
          <p className="text-xs text-gray-400">Loading…</p>
        ) : pets.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            You don't have any active pets on file yet.  Add one from the Pets tab first.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {pets.map(p => {
              const selected = petId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPetId(p.id)}
                  className={`text-left p-3 rounded-2xl border-2 transition active:scale-[0.98] ${
                    selected ? 'bg-purple-50 border-sniffy-purple' : 'bg-white border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.type === 'dog' ? '🐶' : '🐱'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {p.name || <span className="text-gray-400 italic">Unnamed</span>}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {p.breed ?? '—'} · {petDisplayAge(p)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Field>

      {/* Step 2: package */}
      <Field label="2. Package">
        <div className="space-y-2">
          {PACKAGES.map(p => {
            const selected = pkg === p.label;
            return (
              <button
                key={p.label}
                onClick={() => setPkg(p.label)}
                className={`w-full flex items-center justify-between gap-2 p-3 rounded-xl border-2 transition active:scale-[0.99] ${
                  selected ? 'bg-purple-50 border-sniffy-purple' : 'bg-white border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <p className={`text-sm font-bold ${selected ? 'text-sniffy-purple' : 'text-gray-900'}`}>{p.label}</p>
                </div>
                <p className={`text-sm font-extrabold ${selected ? 'text-sniffy-purple' : 'text-gray-700'}`}>
                  ₹{p.price}
                </p>
              </button>
            );
          })}
        </div>
      </Field>

      {/* Step 3: date */}
      <Field label="3. Preferred date">
        <input
          type="date"
          min={minDate}
          value={preferredDate}
          onChange={e => setDate(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple"
        />
        <p className="text-[10px] text-gray-400 mt-1 ml-1">
          The actual slot will be confirmed by our team via WhatsApp.
        </p>
      </Field>

      {/* Step 4: notes */}
      <Field label="4. Anything else?">
        <textarea
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. preferred time of day, gate code, allergies to flag…"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple resize-none"
        />
      </Field>

      <button
        onClick={submit}
        disabled={busy || pets.length === 0}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold text-white bg-sniffy-purple disabled:opacity-60 transition active:scale-95"
      >
        {busy ? <Loader2 size={14} className="animate-spin"/> : <CalendarPlus size={14}/>}
        Request booking <ChevronRight size={14}/>
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-700 mb-2">{label}</p>
      {children}
    </div>
  );
}
