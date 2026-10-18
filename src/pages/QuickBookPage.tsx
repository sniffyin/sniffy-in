/**
 * QuickBookPage — /quick-book
 *
 * A standalone, progressive booking form (one step open at a time; finished
 * steps collapse into tappable chips) that the team shares directly with
 * customers who phone / WhatsApp instead of using the website. It is fully
 * independent of components/BookingWizard.tsx (the home-page popup): nothing is
 * imported from it, so changes here can never affect the popup and vice versa.
 *
 * It writes to the same `bookings` table with the same columns, and posts the
 * same Telegram alert (tagged "Quick Link") so the coordinator's workflow is
 * unchanged. No schema change is needed.
 *
 * Unlisted: noindex, no site chrome, no floating actions (see HIDE_FLOATING_ON
 * in App.tsx), disallowed in robots.txt.
 */

import { useEffect, useRef, useState } from 'react';
import { Check, MapPin, Loader2, PawPrint, ChevronLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PACKAGES = [
  { name: 'Spa Bath', price: '₹799', blurb: 'Bath, blow dry, nail clipping, ear & eye cleaning' },
  { name: 'Hair Cut', price: '₹999', blurb: 'Full body haircut, brushing, nail clipping, ear & eye cleaning' },
  { name: 'Spa Bath + Hair Cut', price: '₹1299', blurb: 'Our complete groom — bath plus haircut', popular: true },
];

const DOG_BREEDS = [
  'Shih Tzu', 'Lhasa Apso', 'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Pug',
  'Beagle', 'Rottweiler', 'Doberman', 'Indie / Indian Pariah', 'Cocker Spaniel', 'Husky',
  'Saint Bernard', 'Dachshund', 'Pomeranian', 'Affenpinscher', 'Akita', 'Alaskan Malamute',
  'American Bulldog', 'American Eskimo Dog', 'Australian Shepherd', 'Basset Hound',
  'Belgian Malinois', 'Bernese Mountain Dog', 'Bichon Frise', 'Border Collie', 'Boston Terrier',
  'Boxer', 'Bull Terrier', 'Cane Corso', 'Cavalier King Charles Spaniel', 'Chihuahua', 'Chow Chow',
  'Dalmatian', 'French Bulldog', 'Great Dane', 'Greyhound', 'Jack Russell Terrier',
  'Japanese Spitz', 'Maltese', 'Miniature Pinscher', 'Newfoundland', 'Papillon', 'Pit Bull',
  'Pointer', 'Poodle', 'Samoyed', 'Shar Pei', 'Siberian Husky', 'Tibetan Mastiff', 'Weimaraner',
  'West Highland Terrier', 'Yorkshire Terrier', 'Mixed Breed', 'Other',
];

const CAT_BREEDS = [
  'Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Ragdoll', 'Himalayan', 'Bengal',
  'Russian Blue', 'Scottish Fold', 'Abyssinian', 'American Shorthair', 'Birman', 'Bombay',
  'Burmese', 'Cornish Rex', 'Devon Rex', 'Egyptian Mau', 'Norwegian Forest', 'Oriental Shorthair',
  'Savannah', 'Sphynx', 'Indie Cat', 'Mixed', 'Other',
];

const AREAS = [
  'Aundh', 'Baner', 'Balewadi', 'Wakad', 'Hinjewadi', 'Pimple Saudagar', 'Kothrud', 'Karve Nagar',
  'Warje', 'Bavdhan', 'Koregaon Park', 'Kalyani Nagar', 'Viman Nagar', 'Kharadi', 'Hadapsar',
  'Shivajinagar', 'Deccan', 'FC Road', 'Camp', 'Swargate', 'Kondhwa', 'Undri', 'Wanowrie', 'NIBM',
  'Katraj', 'Pimpri', 'Chinchwad', 'Nigdi', 'Bhosari', 'Other',
];

const AGE_TO_INT: Record<string, number> = { '0-1 years': 0, '1-5 years': 2, '5+ years': 6 };

type PetType = 'Dog Grooming' | 'Cat Grooming';
type GeoStatus = 'idle' | 'loading' | 'success' | 'error';

const capitalizeFirst = (v: string) => (v.length ? v.charAt(0).toUpperCase() + v.slice(1) : v);

/** Same approach as PolicySignPage: override the shared robots meta in place. */
function useNoIndex() {
  useEffect(() => {
    let el = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !el;
    if (!el) {
      el = document.createElement('meta');
      el.name = 'robots';
      document.head.appendChild(el);
    }
    const prevContent = el.getAttribute('content');
    el.setAttribute('content', 'noindex, nofollow');
    const prevTitle = document.title;
    document.title = 'Book a Grooming Session | Sniffy';
    return () => {
      if (created) el?.remove();
      else if (prevContent !== null) el?.setAttribute('content', prevContent);
      document.title = prevTitle;
    };
  }, []);
}

const inputBase =
  'w-full rounded-2xl bg-white border-2 border-transparent shadow-sm px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-sniffy-purple';

const PHONE_OK = /^[6-9]\d{9}$/;

/**
 * Optional pre-fill so the team can send a personalised link, e.g.
 *   /quick-book?name=Priya&phone=9876543210&pet=dog&package=both
 * pet: dog | cat      package: spa | cut | both
 */
function readPrefill() {
  const q = new URLSearchParams(window.location.search);
  const pet = (q.get('pet') || '').toLowerCase();
  const pk = (q.get('package') || '').toLowerCase();
  const pkgMap: Record<string, string> = { spa: 'Spa Bath', cut: 'Hair Cut', both: 'Spa Bath + Hair Cut' };
  return {
    name: (q.get('name') || '').slice(0, 60),
    phone: (q.get('phone') || '').replace(/\D/g, '').slice(-10),
    service: (pet === 'dog' ? 'Dog Grooming' : pet === 'cat' ? 'Cat Grooming' : '') as PetType | '',
    pkg: pkgMap[pk] || '',
  };
}

export default function QuickBookPage() {
  useNoIndex();

  const [pre] = useState(readPrefill);
  const [service, setService] = useState<PetType | ''>(pre.service);
  const [pkg, setPkg] = useState(pre.pkg);
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [vaccinated, setVaccinated] = useState<'' | 'yes' | 'no'>('');
  const [area, setArea] = useState('');
  const [house, setHouse] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLabel, setGeoLabel] = useState('');
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [name, setName] = useState(pre.name);
  const [phone, setPhone] = useState(pre.phone);

  const [step, setStep] = useState(pre.service && pre.pkg ? 2 : 1);
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

  const clear = (k: string) => setInvalid((p) => (p[k] ? { ...p, [k]: false } : p));
  const err = (k: string) => (invalid[k] ? " !border-red-500" : "");

  const mapsUrl = coords ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : '';
  const areaLabel = coords ? geoLabel : area;
  // Written address = house / society details + the area. Stored together with
  // the maps link in bookings.location (one column): the admin "convert to
  // session" step splits them into grooming_sessions.address / .gps_location.
  const addressText = [house.trim(), areaLabel].filter(Boolean).join(', ');
  const locationValue = house.trim() && areaLabel
    ? (mapsUrl ? `${addressText}\n${mapsUrl}` : addressText)
    : null;

  // Steps 1-3 are "complete" once their data is valid; step 4 only on submit.
  const complete = (n: number) => {
    if (n === 1) return !!(service && pkg);
    if (n === 2) return !!(petName.trim() && breed && age && vaccinated);
    if (n === 3) return !!locationValue;
    return false;
  };

  /** Move to the first incomplete step after `from` (so edits don't replay finished steps). */
  const advance = (from: number) => {
    let n = from + 1;
    while (n < 4 && complete(n)) n++;
    setStep(Math.min(n, 4));
  };

  // Phone/browser Back walks through the steps instead of leaving the page.
  const stepInit = useRef(false);
  useEffect(() => {
    if (!stepInit.current) {
      stepInit.current = true;
      window.history.replaceState({ ...window.history.state, qbStep: step }, '');
      return;
    }
    if (window.history.state?.qbStep !== step) {
      window.history.pushState({ ...window.history.state, qbStep: step }, '');
    }
  }, [step]);
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const n = e.state?.qbStep;
      if (typeof n === 'number') setStep(n);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Keep the active step in view when it changes.
  useEffect(() => {
    stepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const a = (await res.json()).address;
          label = a.neighbourhood || a.suburb || a.village || a.town || a.city || label;
        } catch { /* keep coordinate label */ }
        clear('location');
        setCoords({ lat, lng });
        setGeoLabel(label);
        setArea('');
        setGeoStatus('success');
      },
      () => setGeoStatus('error'),
      { timeout: 15000 }
    );
  };

  const continueFrom = () => {
    setError(null);
    const missing: string[] = [];
    if (step === 1) {
      if (!service) missing.push('service');
      if (!pkg) missing.push('pkg');
    } else if (step === 2) {
      if (!petName.trim()) missing.push('petName');
      if (!breed) missing.push('breed');
      if (!age) missing.push('age');
      if (!vaccinated) missing.push('vaccinated');
    } else if (step === 3) {
      if (!areaLabel) missing.push('location');
      if (house.trim().length < 5) missing.push('house');
    } else {
      handleSubmit();
      return;
    }
    if (missing.length) {
      setInvalid(Object.fromEntries(missing.map((k) => [k, true])));
      return;
    }
    advance(step);
  };

  const handleSubmit = async () => {
    const missing: string[] = [];
    if (!name.trim()) missing.push('name');
    if (!PHONE_OK.test(phone)) missing.push('phone');
    if (missing.length) {
      setInvalid(Object.fromEntries(missing.map((k) => [k, true])));
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      phone,
      pet_type: service,
      pet_name: capitalizeFirst(petName.trim()),
      breed,
      age: AGE_TO_INT[age] ?? 0,
      medical: '',
      city: 'Pune',
      package: pkg,
      location: locationValue,
      pet_vaccinated: vaccinated === 'yes',
    };

    try {
      const { error: dbErr } = await supabase.from('bookings').insert([payload]);
      if (dbErr) throw dbErr;

      // Telegram failure must never block the confirmation.
      try {
        const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
        const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
        if (botToken && chatId) {
          const message =
            `🐾 *New Booking — Quick Link*\n\n` +
            `👤 *Name:* ${payload.name}\n` +
            `📞 *Phone:* ${payload.phone}\n` +
            `🐶 *Pet:* ${payload.pet_name} — ${service} (${breed}, ${age})\n` +
            `💉 *Vaccinated:* ${vaccinated === 'yes' ? 'Yes' : 'No'}\n` +
            `✂️ *Package:* ${pkg}\n` +
            `🏙️ *City:* Pune\n` +
            `🏠 *Address:* ${addressText}\n` +
            `📍 *GPS:* ${mapsUrl || 'Not shared'}\n` +
            `🕐 *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
          });
        }
      } catch (tgErr) {
        console.warn('Telegram notification failed:', tgErr);
      }

      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (e: unknown) {
      console.error('Quick booking insert error:', e);
      const msg = e instanceof Error ? e.message : '';
      setError(msg ? `Error: ${msg}` : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const breeds = service === 'Cat Grooming' ? CAT_BREEDS : DOG_BREEDS;

  const chips: Record<number, string> = {
    1: `${service === 'Dog Grooming' ? '🐶' : '🐱'} ${pkg}`,
    2: `${capitalizeFirst(petName.trim())} · ${breed}`,
    3: `📍 ${areaLabel}`,
  };
  const titles: Record<number, string> = {
    1: 'What are we grooming?',
    2: 'Tell us about your pet',
    3: 'Where should we come?',
    4: 'Almost done!',
  };
  const subtitles: Record<number, string> = {
    1: 'Pick your furry friend and a package.',
    2: 'So we send the right groomer prepared.',
    3: 'Pin your location and add your door details.',
    4: 'Where can we reach you to confirm?',
  };
  const stepNames = ['Package', 'Pet', 'Location', 'Contact'];

  /* ── Success screen ─────────────────────────────────────────────── */
  if (done) {
    return (
      <div className="min-h-[100dvh] bg-[#f6f3fc] flex flex-col">
        <div className="bg-sniffy-purple text-center px-6 pt-10 pb-16 rounded-b-[2.5rem]">
          <img src="/sniffy-logo-white.png" alt="Sniffy" className="w-24 mx-auto" />
        </div>
        <div className="-mt-10 px-5 flex-1">
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-sniffy-yellow flex items-center justify-center mb-4">
              <Check className="text-sniffy-purple" size={34} strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">You're booked in!</h1>
            <p className="text-gray-600 mb-5">
              Thanks {name.trim().split(' ')[0]}! Our team will contact you shortly on{' '}
              <span className="font-semibold">{phone}</span> to confirm the slot for{' '}
              <span className="font-semibold">{capitalizeFirst(petName.trim())}</span>.
            </p>
            <ol className="text-left text-sm text-gray-700 space-y-2 mb-5">
              <li className="flex gap-2"><span className="font-bold text-sniffy-purple">1.</span> Our team calls or WhatsApps you to confirm the date &amp; time.</li>
              <li className="flex gap-2"><span className="font-bold text-sniffy-purple">2.</span> We assign a groomer who comes to your door.</li>
            </ol>
            <p className="text-xs text-gray-400">You can safely close this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const footerLabel = step === 4 ? 'Confirm Booking' : 'Continue';
  const locationPinned = !!(coords || area);
  const ready = step === 4 ? !!name.trim() && PHONE_OK.test(phone) : complete(step);
  const pkgPrice = PACKAGES.find((x) => x.name === pkg)?.price ?? '';
  const label = 'block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1';

  /* ── Form ───────────────────────────────────────────────────────── */
  return (
    <div className="min-h-[100dvh] bg-[#f6f3fc]">
      <style>{`
        .qb-ripple{position:absolute;inset:0;border-radius:1rem;border:2px solid #f6ac0a;pointer-events:none;animation:qbRipple 1.8s ease-out infinite}
          .qb-ripple-purple{border-color:#451a8b}
        @keyframes qbRipple{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.08,1.4);opacity:0}}
        @media (prefers-reduced-motion:reduce){.qb-ripple{animation:none;display:none}}
      `}</style>
      {/* Brand header with step tracker */}
      <header className="bg-sniffy-purple text-white px-5 pt-5 pb-7 rounded-b-[2rem]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <img src="/sniffy-logo-white.png" alt="Sniffy" className="h-8 w-auto" />
            <span className="text-xs font-semibold bg-white/15 rounded-full px-3 py-1">
              Quick booking · Pune
            </span>
          </div>
          <ol className="flex items-center mt-5">
            {stepNames.map((nm, idx) => {
              const n = idx + 1;
              const isDone = n !== step && complete(n);
              return (
                <li key={nm} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                        n === step
                          ? 'bg-sniffy-yellow text-sniffy-purple'
                          : isDone
                          ? 'bg-white text-sniffy-purple'
                          : 'bg-white/20 text-white/70'
                      }`}
                    >
                      {isDone ? <Check size={14} strokeWidth={3} /> : n}
                    </span>
                    <span className={`text-[10px] font-medium ${n === step ? 'text-white' : 'text-white/60'}`}>
                      {nm}
                    </span>
                  </div>
                  {n < 4 && (
                    <span
                      className={`flex-1 h-0.5 mx-1.5 -mt-4 rounded ${
                        complete(n) && n < step ? 'bg-white' : 'bg-white/20'
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-5 pb-32">
        {/* Finished steps → tappable chips */}
        {[1, 2, 3].some((n) => n !== step && complete(n)) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {[1, 2, 3]
              .filter((n) => n !== step && complete(n))
              .map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStep(n)}
                  className="inline-flex items-center gap-1.5 max-w-full bg-white text-sniffy-purple text-xs font-semibold rounded-full pl-2 pr-3 py-1.5 shadow-sm"
                >
                  <Check size={12} strokeWidth={3} className="text-green-500 flex-shrink-0" />
                  <span className="truncate">{chips[n]}</span>
                  <span className="text-gray-400 font-normal flex-shrink-0">· edit</span>
                </button>
              ))}
          </div>
        )}

        <div ref={stepRef} className="scroll-mt-2">
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{titles[step]}</h1>
          <p className="text-sm text-gray-500 mt-1 mb-5">{subtitles[step]}</p>

          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {(['Dog Grooming', 'Cat Grooming'] as const).map((sv) => {
                  const on = service === sv;
                  return (
                    <button
                      key={sv}
                      type="button"
                      onClick={() => {
                        clear('service');
                        if (sv !== service) setBreed('');
                        setService(sv);
                      }}
                      className={`rounded-2xl py-4 font-bold text-lg transition active:scale-95 shadow-sm ${
                        on
                          ? 'bg-sniffy-purple text-white shadow-lg shadow-sniffy-purple/30'
                          : invalid.service
                          ? 'bg-white text-gray-800 ring-2 ring-red-500'
                          : 'bg-white text-gray-800'
                      }`}
                    >
                      <div className="text-3xl leading-none mb-1">{sv === 'Dog Grooming' ? '🐶' : '🐱'}</div>
                      {sv === 'Dog Grooming' ? 'Dog' : 'Cat'}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                {PACKAGES.map((p) => {
                  const on = pkg === p.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        clear('pkg');
                        setPkg(p.name);
                      }}
                      className={`relative w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-3 transition active:scale-[0.98] shadow-sm ${
                        on
                          ? 'bg-white ring-2 ring-sniffy-purple'
                          : invalid.pkg
                          ? 'bg-white ring-2 ring-red-500'
                          : 'bg-white'
                      }`}
                    >
                      {p.popular && (
                        <span className="absolute -top-2.5 right-4 text-[10px] font-extrabold text-sniffy-purple bg-sniffy-yellow rounded-full px-2.5 py-0.5">
                          MOST POPULAR
                        </span>
                      )}
                      <span
                        className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${
                          on ? 'bg-sniffy-purple border-sniffy-purple' : 'border-gray-300'
                        }`}
                      >
                        {on && <Check size={14} className="text-white" strokeWidth={3} />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-bold text-gray-900">{p.name}</span>
                        <span className="block text-xs text-gray-500 leading-snug mt-0.5">{p.blurb}</span>
                      </span>
                      <span className="font-extrabold text-sniffy-purple text-lg">{p.price}</span>
                    </button>
                  );
                })}
              </div>
              {(invalid.service || invalid.pkg) && (
                <p className="text-red-500 text-sm text-center font-medium">
                  Please pick {invalid.service && invalid.pkg ? 'dog or cat and a package' : invalid.service ? 'dog or cat' : 'a package'}.
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className={label}>Pet name</label>
                <input
                  placeholder="e.g. Bruno"
                  value={petName}
                  enterKeyHint="next"
                  autoComplete="off"
                  onKeyDown={(e) => { if (e.key === 'Enter') continueFrom(); }}
                  className={inputBase + err('petName')}
                  onChange={(e) => {
                    clear('petName');
                    setPetName(capitalizeFirst(e.target.value));
                  }}
                />
              </div>
              <div>
                <label className={label}>Breed</label>
                <select
                  value={breed}
                  className={inputBase + err('breed')}
                  onChange={(e) => {
                    clear('breed');
                    setBreed(e.target.value);
                  }}
                >
                  <option value="">Select breed</option>
                  {breeds.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Age</label>
                <div className={`grid grid-cols-3 gap-2 rounded-2xl${invalid.age ? ' ring-2 ring-red-500' : ''}`}>
                  {['0-1 years', '1-5 years', '5+ years'].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => {
                        clear('age');
                        setAge(a);
                      }}
                      className={`rounded-2xl py-3 text-sm font-bold shadow-sm transition active:scale-95 ${
                        age === a ? 'bg-sniffy-purple text-white' : 'bg-white text-gray-700'
                      }`}
                    >
                      {a.replace(' years', ' yrs')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={label}>Vaccinated?</label>
                <div className={`grid grid-cols-2 gap-2 rounded-2xl${invalid.vaccinated ? ' ring-2 ring-red-500' : ''}`}>
                  {(['yes', 'no'] as const).map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => {
                        clear('vaccinated');
                        setVaccinated(o);
                      }}
                      className={`rounded-2xl py-3 text-sm font-bold shadow-sm transition active:scale-95 ${
                        vaccinated === o ? 'bg-sniffy-purple text-white' : 'bg-white text-gray-700'
                      }`}
                    >
                      {o === 'yes' ? '💉 Yes' : 'Not yet'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={geoStatus === 'loading'}
                  className={`relative w-full rounded-2xl px-4 py-4 flex items-center justify-center gap-2.5 font-extrabold text-base transition active:scale-[0.98] shadow-lg ${
                    geoStatus === 'success'
                      ? 'bg-green-500 text-white shadow-green-500/30'
                      : geoStatus === 'error' || invalid.location
                      ? 'bg-red-500 text-white shadow-red-500/30'
                      : 'bg-sniffy-purple text-white shadow-sniffy-purple/30'
                  }`}
                >
                  {!locationPinned && geoStatus !== 'loading' && (
                    <>
                      <span aria-hidden className="qb-ripple qb-ripple-purple" />
                      <span aria-hidden className="qb-ripple qb-ripple-purple" style={{ animationDelay: '0.9s' }} />
                    </>
                  )}
                  {geoStatus === 'loading' ? (
                    <>
                      <Loader2 size={22} className="animate-spin" /> Finding you…
                    </>
                  ) : geoStatus === 'success' ? (
                    <>
                      <Check size={22} strokeWidth={3} /> Location pinned: {geoLabel}
                    </>
                  ) : geoStatus === 'error' ? (
                    <>
                      <MapPin size={22} /> Couldn't get location — tap to retry
                    </>
                  ) : (
                    <>
                      <MapPin size={22} /> Tap to share my location
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2 leading-snug">
                  {geoStatus === 'success'
                    ? 'Tap again to re-pin.'
                    : 'Required — please tap while standing at home so the groomer’s map pin is exact.'}
                </p>
              </div>
              {invalid.location && geoStatus !== 'error' && (
                <p className="text-red-500 text-sm font-medium text-center -mt-2">
                  Please tap “Tap to share my location” above to continue.
                </p>
              )}

              {/* Fallback only when GPS genuinely failed (permission denied / unavailable) */}
              {(geoStatus === 'error' || (area && !coords)) && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 space-y-2">
                  <p className="text-xs text-amber-800">
                    Allow location access in your browser settings and retry. If that doesn't work, pick your area:
                  </p>
                  <select
                    value={area}
                    className={inputBase}
                    onChange={(e) => {
                      clear('location');
                      setArea(e.target.value);
                      setCoords(null);
                      setGeoLabel('');
                    }}
                  >
                    <option value="">— Choose an area in Pune —</option>
                    {AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={label}>House / flat &amp; society</label>
                <textarea
                  rows={3}
                  value={house}
                  placeholder="Flat 402, B Wing, Sunrise Society, near Ganesh Temple"
                  className={inputBase + ' resize-none' + err('house')}
                  onChange={(e) => {
                    clear('house');
                    setHouse(e.target.value);
                  }}
                />
                <p className={`text-xs mt-1.5 ml-1 ${invalid.house ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                  {invalid.house
                    ? 'Please add your flat / building / society.'
                    : 'Helps our groomer reach your exact door.'}
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white shadow-sm p-4 text-sm space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Your booking</p>
                <p className="text-gray-900">
                  <span className="font-bold">{service === 'Dog Grooming' ? '🐶' : '🐱'} {capitalizeFirst(petName.trim())}</span>
                  <span className="text-gray-500"> · {breed}</span>
                </p>
                <p className="flex items-center justify-between gap-3 text-gray-900">
                  <span>{pkg}</span>
                  <span className="font-extrabold text-sniffy-purple">{pkgPrice}</span>
                </p>
                <p className="text-gray-500 text-xs leading-snug">📍 {addressText}</p>
              </div>
              <div>
                <label className={label}>Your name</label>
                <input
                  placeholder="Full name"
                  value={name}
                  autoFocus={!name}
                  enterKeyHint="next"
                  autoComplete="name"
                  className={inputBase + err('name')}
                  onChange={(e) => {
                    clear('name');
                    setName(e.target.value);
                  }}
                />
              </div>
              <div>
                <label className={label}>Mobile number</label>
                <div className="flex gap-2">
                  <span className="rounded-2xl bg-white shadow-sm px-4 py-3.5 text-base font-semibold text-gray-600">
                    +91
                  </span>
                  <input
                    placeholder="10-digit number"
                    value={phone}
                    autoFocus={!!name && !PHONE_OK.test(phone)}
                    enterKeyHint="done"
                    onKeyDown={(e) => { if (e.key === 'Enter') continueFrom(); }}
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel-national"
                    className={inputBase + err('phone')}
                    onChange={(e) => {
                      clear('phone');
                      setPhone(e.target.value.replace(/\D/g, ''));
                    }}
                  />
                </div>
              </div>
              {invalid.phone && (
                <p className="text-red-500 text-xs font-medium ml-1 -mt-2">
                  Please enter a valid 10-digit mobile number.
                </p>
              )}
              <p className="text-xs text-gray-500 ml-1">
                Our team will call or WhatsApp you to confirm the time slot.
              </p>
              {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            </div>
          )}
        </div>
      </main>

      {/* Fixed action bar */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-white shadow-[0_-8px_24px_rgba(69,26,139,0.10)] rounded-t-3xl px-5 pt-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 1 && (
            <button
              type="button"
              aria-label="Back"
              onClick={() => setStep(step - 1)}
              className="w-14 h-14 flex-shrink-0 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <button
            type="button"
            disabled={submitting}
            onClick={continueFrom}
            className="relative flex-1 h-14 rounded-2xl font-extrabold text-lg text-sniffy-purple bg-sniffy-yellow shadow-lg shadow-sniffy-yellow/40 disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            {/* Expanding outline ripple — draws the eye to the primary action */}
            {!submitting && ready && (
              <>
                <span aria-hidden className="qb-ripple" />
                <span aria-hidden className="qb-ripple" style={{ animationDelay: '0.9s' }} />
              </>
            )}
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Confirming…
              </>
            ) : step === 4 ? (
              <>
                <PawPrint size={20} /> {footerLabel}
              </>
            ) : (
              <>
                {footerLabel} <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
