/**
 * GroomerOnboardingPage — Standalone page for groomer sign-up.
 *
 * Style: matches FAQsPage / AboutPage / HowItWorksPage exactly:
 *  - bg-gradient-to-b from-purple-100 via-purple-50 to-white hero
 *  - sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm header
 *  - text-sniffy-purple / text-sniffy-yellow brand tokens
 *  - bg-white rounded-[20px] border-2 border-sniffy-yellow/20 cards
 *  - bg-sniffy-purple CTA blocks with rounded-[30px]
 *  - motion (framer-motion) entrance animations
 *
 * Backend: writes to `groomer_applications` Supabase table.
 * File uploads go to `groomer-uploads` Supabase Storage bucket.
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1 – Personal
  full_name: string;
  phone: string;
  areas: string[];
  // Step 2 – Services
  pets: string[];
  services: string[];
  // Step 3 – Experience
  years_experience: number | null;
  has_own_kit: string;
  // Step 4 – Documents
  consent_terms: boolean;
  consent_background_check: boolean;
  consent_whatsapp: boolean;
}

const initialForm: FormData = {
  full_name: '',
  phone: '',
  areas: [],
  pets: [],
  services: [],
  years_experience: null,
  has_own_kit: '',
  consent_terms: false,
  consent_background_check: false,
  consent_whatsapp: false,
};

// ─── Static data ──────────────────────────────────────────────────────────────

const PUNE_AREAS = [
  'Baner', 'Aundh', 'Wakad', 'Hinjewadi', 'Kothrud', 'Karve Nagar',
  'Shivajinagar', 'Viman Nagar', 'Kalyani Nagar', 'Koregaon Park',
  'Kharadi', 'Wagholi', 'Hadapsar', 'Kondhwa', 'NIBM', 'Katraj',
  'Dhayari', 'Bavdhan', 'Pimpri-Chinchwad', 'Ravet', 'Kalewadi',
  'Lohegaon', 'Dhanori', 'Camp', 'Wanowrie', 'Mundwa', 'Bibewadi',
];


const PET_OPTIONS = [
  { value: 'dog',        emoji: '🐶', label: 'Dogs',        sub: 'All breeds' },
  { value: 'cat',        emoji: '🐱', label: 'Cats',        sub: 'All breeds' },
];

const SERVICE_OPTIONS = [
  { value: 'bath_blowdry',  emoji: '', label: 'Bath & Blow Dry' },
  { value: 'haircut',       emoji: '', label: 'Haircut' },
  { value: 'fancy_cut',     emoji: '', label: 'Fancy / Creative Cut' },
  { value: 'nail_trim',     emoji: '', label: 'Nail Trimming' },
  { value: 'ear_cleaning',  emoji: '', label: 'Ear Cleaning' },
  { value: 'tick_flea',     emoji: '', label: 'Tick & Flea Treatment' },
];

const KIT_OPTIONS = [
  { value: 'yes', emoji: '', label: 'Yes, I have my own kit', sub: 'Scissors, clippers, brushes etc.' },
  { value: 'no',  emoji: '', label: 'No, I need equipment',   sub: 'We can help you get started' },
];

// ─── Helper: upload file to Supabase Storage ─────────────────────────────────

async function uploadFile(file: File, folder: string): Promise<string | null> {
  const ext  = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from('groomer-uploads')
    .upload(path, file, { upsert: false });
  if (error) { console.error('Upload error', error); return null; }
  const { data } = supabase.storage.from('groomer-uploads').getPublicUrl(path);
  return data.publicUrl;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 mb-8">
      {/* <div className="w-12 h-12 flex-shrink-0 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl">
        {emoji}
      </div> */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function FieldGroup({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-gray-800">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sniffy-purple focus:border-sniffy-purple outline-none transition-all text-gray-800 font-medium placeholder-gray-400 bg-white"
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  const { children, ...rest } = props;
  return (
    <select
      {...rest}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sniffy-purple focus:border-sniffy-purple outline-none transition-all text-gray-800 font-medium bg-white appearance-none cursor-pointer"
    >
      {children}
    </select>
  );
}

function ChipToggle({ checked, onChange, emoji, label }: {
  checked: boolean; onChange: () => void; emoji: string; label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-semibold transition-all ${
        checked
          ? 'bg-purple-50 border-sniffy-purple text-sniffy-purple'
          : 'border-gray-200 text-gray-600 hover:border-gray-300'
      }`}
    >
      <span>{emoji}</span>
      {label}
    </button>
  );
}

function CardToggle({ checked, onChange, emoji, label, sub }: {
  checked: boolean; onChange: () => void; emoji: string; label: string; sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 text-center transition-all ${
        checked
          ? 'bg-purple-50 border-sniffy-purple'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <span className="text-3xl leading-none">{emoji}</span>
      <span className={`text-sm font-bold ${checked ? 'text-sniffy-purple' : 'text-gray-700'}`}>{label}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </button>
  );
}

function RadioCard({ checked, onChange, emoji, label, sub }: {
  checked: boolean; onChange: () => void; emoji: string; label: string; sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
        checked
          ? 'bg-purple-50 border-sniffy-purple'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* <span className="text-2xl flex-shrink-0">{emoji}</span> */}
      <div>
        <div className={`text-sm font-bold ${checked ? 'text-sniffy-purple' : 'text-gray-800'}`}>{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
      </div>
    </button>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-sniffy-purple' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}

interface UploadZoneProps {
  label: string;
  hint: string;
  accept: string;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  emoji: string;
}

function UploadZone({ label, hint, accept, multiple, files, onChange, emoji }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    onChange(multiple ? [...files, ...arr] : arr);
  };

  const removeFile = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-between gap-4 border-2 border-dashed border-gray-200 hover:border-sniffy-purple hover:bg-purple-50/40 rounded-2xl px-5 py-4 cursor-pointer transition-all"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <div className="font-bold text-sm text-gray-800">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{hint}</div>
          </div>
        </div>
        <div className="flex-shrink-0 inline-flex items-center gap-1.5 bg-sniffy-purple text-white text-xs font-bold px-4 py-2 rounded-full">
          <Upload size={12} /> Browse
        </div>
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-3 py-1.5">
              <span className="text-xs font-semibold text-sniffy-purple truncate max-w-[160px]">{f.name}</span>
              <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = ['Personal Info', 'Services', 'Experience', 'Documents'];
  return (
    <div className="flex items-center justify-center gap-0 overflow-x-auto px-4 py-4">
      {steps.map((label, i) => {
        const idx    = i + 1;
        const done   = idx < current;
        const active = idx === current;
        return (
          <div key={label} className="flex items-center flex-shrink-0">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              active ? 'bg-sniffy-purple text-white' : done ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                active ? 'bg-white text-sniffy-purple' :
                done   ? 'bg-green-500 text-white' :
                        'border-2 border-gray-300 text-gray-400'
              }`}>
                {done ? '✓' : idx}
              </div>
              <span className={`text-xs font-bold hidden sm:block ${active ? 'text-white' : done ? 'text-green-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 h-px mx-1 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GroomerOnboardingPage() {
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  // File state
  const [portfolioFiles, setPortfolioFiles]   = useState<File[]>([]);
  const [aadhaarFiles, setAadhaarFiles]       = useState<File[]>([]);
  const [certFiles, setCertFiles]             = useState<File[]>([]);

  const update = (patch: Partial<FormData>) => setForm(f => ({ ...f, ...patch }));

  const toggleArray = (key: keyof FormData, val: string) => {
    const arr = form[key] as string[];
    update({ [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };

  const toggleArea = (area: string) => {
    const arr = form.areas;
    update({ areas: arr.includes(area) ? arr.filter(x => x !== area) : [...arr, area] });
  };

  // ── Validation per step
  const validateStep = (): string => {
    if (step === 1) {
      if (!form.full_name.trim()) return 'Please enter your full name.';
      if (!form.phone.trim() || !/^\+?[0-9\s-]{8,14}$/.test(form.phone)) return 'Please enter a valid phone number.';
      if (form.areas.length === 0) return 'Please select at least one area you can serve.';
    }
    if (step === 2) {
      if (form.pets.length === 0) return 'Please select at least one pet type.';
      if (form.services.length === 0) return 'Please select at least one service.';
    }
    if (step === 3) {
      if (!form.has_own_kit) return 'Please indicate if you have your own grooming kit.';
      if (form.years_experience === null) return 'Please move the slider to set your experience.';
    }
    if (step === 4) {
      if (portfolioFiles.length < 1) return 'Please upload at least one grooming photo.';
      if (aadhaarFiles.length === 0) return 'Please upload your Aadhaar card.';
      if (!form.consent_terms) return 'Please accept the Terms & Conditions.';
      if (!form.consent_background_check) return 'Please consent to the background verification check.';
    }
    return '';
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => { setError(''); setStep(s => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // ── Submit
  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);

    try {
      // Upload files in parallel
      const [portfolioUrls, aadhaarUrls, certUrls] = await Promise.all([
        Promise.all(portfolioFiles.map(f => uploadFile(f, 'portfolio'))),
        Promise.all(aadhaarFiles.map(f => uploadFile(f, 'aadhaar'))),
        Promise.all(certFiles.map(f => uploadFile(f, 'certificates'))),
      ]);

      const { error: dbErr } = await supabase.from('groomer_applications').insert({
        full_name:             form.full_name.trim(),
        phone:                 form.phone.trim(),
        areas:                 form.areas,
        pets:                  form.pets,
        services:              form.services,
        years_experience:      form.years_experience?? 0,
        has_own_kit:           form.has_own_kit,
        portfolio_urls:        portfolioUrls.filter(Boolean),
        aadhaar_urls:          aadhaarUrls.filter(Boolean),
        certificate_urls:      certUrls.filter(Boolean),
        consent_terms:         form.consent_terms,
        consent_background_check: form.consent_background_check,
        consent_whatsapp:      form.consent_whatsapp,
        status:                'pending',
      });

      if (dbErr) throw dbErr;
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <Navbar />
        </header>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
          <motion.div
            className="max-w-lg w-full text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <DotLottieReact
              src="/lottie/success_dog.lottie"
              autoplay
              loop
              style={{ width: 180, height: 180, margin: '0 auto 16px' }}
            />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to the <span className="text-sniffy-purple">Sniffy</span> family!
            </h1>
            <p className="text-gray-500 text-base leading-relaxed mb-8">
              Your application has been received. Our team will review it and reach out on <strong>WhatsApp within 24–48 hours</strong> to get you started.
            </p>
            <div className="bg-sniffy-yellow/10 border-2 border-sniffy-yellow/30 rounded-[24px] p-6 text-sm mb-8">
              <p className="font-bold text-base mb-1 text-gray-900">What happens next?</p>
              <ol className="text-left text-gray-600 space-y-2 mt-3">
                <li>1. Our team reviews your application</li>
                <li>2. We call you to schedule a quick onboarding call</li>
                <li>3. You complete a short grooming assessment</li>
                <li>4. Start getting bookings</li>
              </ol>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Navbar />
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 py-6 text-center">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-2">Join the Sniffy team</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
              <span className="text-sniffy-purple">Become a</span>{' '}
              <span className="text-sniffy-yellow">Sniffy Groomer</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
              Connect with thousands of pet parents across Pune who need a skilled groomer like you. Start earning more, today.
            </p>
          </motion.div>
        </section>

        {/* ── Step indicator ── */}
        <div className="sticky top-[73px] z-20 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-3xl mx-auto">
            <StepIndicator current={step} />
          </div>
        </div>

        {/* ── Form body ── */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">

            {/* Left: form steps */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                >

                  {/* ══ STEP 1 ══ */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-[20px] border-2 border-sniffy-yellow/20 shadow-sm p-8">
                        <SectionHeader emoji="" title="Personal Information" desc="Tell us about yourself so pet parents can trust you." />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <FieldGroup label="Full Name" required>
                            <TextInput
                              placeholder="Your Name"
                              value={form.full_name}
                              onChange={e => update({ full_name: e.target.value })}
                            />
                          </FieldGroup>
                          <FieldGroup label="Phone Number" required hint="We'll use this to confirm bookings via WhatsApp">
                            <TextInput
                              placeholder="Your Phone Number"
                              value={form.phone}
                              onChange={e => update({ phone: e.target.value })}
                            />
                          </FieldGroup>
                        </div>

                        <div className="h-px bg-gray-100 my-6" />

                        <FieldGroup label="Areas You Can Serve In Pune" required hint="Select as many areas as you can cover">
                          <SelectInput
                            value=""
                            onChange={e => { if (e.target.value) toggleArea(e.target.value); e.target.value = ''; }}
                          >
                            <option value="">+ Select an area to add</option>
                            {PUNE_AREAS.filter(a => !form.areas.includes(a)).map(a => (
                              <option key={a}>{a}</option>
                            ))}
                          </SelectInput>
                          {form.areas.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {form.areas.map(a => (
                                <span key={a} className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-100 text-sniffy-purple text-sm font-semibold px-3 py-1.5 rounded-full">
                                  📍 {a}
                                  <button type="button" onClick={() => toggleArea(a)} className="hover:text-red-500">
                                    <X size={13} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </FieldGroup>
                      </div>
                    </div>
                  )}

                  {/* ══ STEP 2 ══ */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-[20px] border-2 border-sniffy-yellow/20 shadow-sm p-8">
                        <SectionHeader  emoji="" title="Service Details" desc="What kind of grooming do you offer?" />

                        <FieldGroup label="Pets you can groom" required>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                            {PET_OPTIONS.map(p => (
                              <CardToggle
                                key={p.value}
                                checked={form.pets.includes(p.value)}
                                onChange={() => toggleArray('pets', p.value)}
                                emoji={p.emoji}
                                label={p.label}
                                sub={p.sub}
                              />
                            ))}
                          </div>
                        </FieldGroup>

                        <div className="h-px bg-gray-100 my-6" />

                        <FieldGroup label="Services you offer" required>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {SERVICE_OPTIONS.map(s => (
                              <ChipToggle
                                key={s.value}
                                checked={form.services.includes(s.value)}
                                onChange={() => toggleArray('services', s.value)}
                                emoji={s.emoji}
                                label={s.label}
                              />
                            ))}
                          </div>
                        </FieldGroup>
                      </div>
                    </div>
                  )}

                  {/* ══ STEP 3 ══ */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-[20px] border-2 border-sniffy-yellow/20 shadow-sm p-8">
                        <SectionHeader emoji="" title="Experience & Expertise" desc="Help us understand your background and grooming skills." />

                        {/* Years slider */}
                        <FieldGroup label="Years of Grooming Experience" required>
                          <div className="mt-2 px-1">
                            <style>{`
                              .exp-slider::-webkit-slider-thumb {
                                -webkit-appearance: none;
                                width: 28px;
                                height: 28px;
                                border-radius: 50%;
                                background: #451a8b;
                                cursor: pointer;
                                border: 3px solid white;
                                box-shadow: 0 2px 8px rgba(69,26,139,0.4);
                              }
                              .exp-slider::-moz-range-thumb {
                                width: 28px;
                                height: 28px;
                                border-radius: 50%;
                                background: #451a8b;
                                cursor: pointer;
                                border: 3px solid white;
                                box-shadow: 0 2px 8px rgba(69,26,139,0.4);
                              }
                            `}</style>
                            <input
                              type="range"
                              min={0} max={20} step={1}
                              value={form.years_experience ?? 0}
                              onChange={e => update({ years_experience: Number(e.target.value) })}
                              className="exp-slider w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200"
                              style={{
                                background: form.years_experience === null
                                  ? '#e4e4e7'
                                  : `linear-gradient(to right, #451a8b 0%, #451a8b ${((form.years_experience ?? 0) / 20) * 100}%, #e4e4e7 ${((form.years_experience ?? 0) / 20) * 100}%, #e4e4e7 100%)`
                              }}
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                              <span>Starting out</span><span>5 yrs</span><span>10 yrs</span><span>15 yrs</span><span>20+</span>
                            </div>
                            <div className="mt-3">
                              {form.years_experience === null ? (
                                <span className="bg-gray-100 text-gray-400 text-sm font-semibold px-4 py-1.5 rounded-full">
                                  Move the slider to select
                                </span>
                              ) : (
                                <span className="bg-sniffy-purple text-white text-sm font-bold px-4 py-1.5 rounded-full">
                                  {form.years_experience === 0 ? 'Less than 1 year' :
                                  form.years_experience === 1 ? '1 year' : `${form.years_experience} years`}
                                </span>
                              )}
                            </div>
                          </div>
                        </FieldGroup>

                        <div className="h-px bg-gray-100 my-6" />

                        <FieldGroup label="Do you have your own grooming kit?" required>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                            {KIT_OPTIONS.map(k => (
                              <RadioCard
                                key={k.value}
                                checked={form.has_own_kit === k.value}
                                onChange={() => update({ has_own_kit: k.value })}
                                emoji={k.emoji}
                                label={k.label}
                                sub={k.sub}
                              />
                            ))}
                          </div>
                        </FieldGroup>

                      </div>
                    </div>
                  )}

                  {/* ══ STEP 4 ══ */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-[20px] border-2 border-sniffy-yellow/20 shadow-sm p-8">
                        <SectionHeader emoji="" title="Documents & Photos" desc="Verified groomers earn 3× more trust from pet parents." />

                        <FieldGroup
                          label="Grooming Portfolio Photos"
                          required
                          hint="Upload your best before/after grooming shots. Minimum 1 photo required."
                        >
                          <UploadZone
                            label="Upload Grooming Photos"
                            hint="Drag & drop or click to browse · JPEG, PNG, WEBP · Max 5 MB each"
                            accept="image/*"
                            multiple
                            files={portfolioFiles}
                            onChange={setPortfolioFiles}
                            emoji=""
                          />
                        </FieldGroup>

                        <div className="h-px bg-gray-100 my-6" />

                        <FieldGroup
                          label="Upload Aadhaar Card"
                          required
                          hint="Required for identity verification. Your data is encrypted and never shared."
                        >
                          <UploadZone
                            label="Upload Aadhaar Card"
                            hint="Front & back · JPG, PNG, or PDF · Max 10 MB · 128-bit encrypted"
                            accept="image/*,.pdf"
                            multiple
                            files={aadhaarFiles}
                            onChange={setAadhaarFiles}
                            emoji=""
                          />
                        </FieldGroup>

                        <div className="h-px bg-gray-100 my-6" />

                        <FieldGroup label="Certifications (Optional)" hint="Any grooming courses, IGDBA, or training certificates">
                          <UploadZone
                            label="Upload Certificates"
                            hint="PDF or images · Max 10 MB each"
                            accept="image/*,.pdf"
                            multiple
                            files={certFiles}
                            onChange={setCertFiles}
                            emoji=""
                          />
                        </FieldGroup>

                        <div className="h-px bg-gray-100 my-6" />

                        <FieldGroup label="Consent & Agreement">
                          <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                            <Toggle
                              checked={form.consent_terms}
                              onChange={() => update({ consent_terms: !form.consent_terms })}
                              label="I agree to Sniffy's Groomer Terms & Conditions"
                            />
                            <Toggle
                              checked={form.consent_background_check}
                              onChange={() => update({ consent_background_check: !form.consent_background_check })}
                              label="I consent to a background verification check"
                            />
                            <Toggle
                              checked={form.consent_whatsapp}
                              onChange={() => update({ consent_whatsapp: !form.consent_whatsapp })}
                              label="I agree to receive updates & booking alerts on WhatsApp"
                            />
                          </div>
                        </FieldGroup>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* ── Error ── */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mt-4 flex items-start gap-3 bg-red-50 border-2 border-red-200 rounded-2xl px-5 py-4 text-red-700"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Navigation buttons ── */}
              <div className="flex items-center justify-between mt-8 gap-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="px-6 py-3 rounded-full border-2 border-gray-200 text-gray-700 font-bold text-sm hover:border-gray-300 transition-all"
                  >
                    ← Back
                  </button>
                ) : <div />}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={next}
                    className="bg-sniffy-purple text-white font-bold px-8 py-3.5 rounded-full hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-purple-200"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-sniffy-purple text-white font-bold px-8 py-3.5 rounded-full hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-purple-200 disabled:opacity-60"
                  >
                    {submitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                    ) : (
                      <><CheckCircle2 size={16} /> Submit Application</>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── Bottom CTA (matches FAQsPage style exactly) ── */}
        <div className="max-w-2xl mx-auto px-4 pb-20">
          <div className="bg-purple-50 border-2 border-purple-100 rounded-[30px] px-8 py-10 text-center">
            <p className="text-gray-900 font-bold text-xl mb-2">Questions before applying?</p>
            <p className="text-gray-500 text-sm mb-6">Call us or WhatsApp and we'll answer right away.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:8971313003" className="bg-white border-2 border-gray-200 text-sniffy-purple font-bold px-7 py-3 rounded-full text-sm hover:border-sniffy-purple transition-all">
                Call 8971313003
              </a>
              <a href="https://wa.me/918971313003" target="_blank" rel="noopener noreferrer"
                className="bg-sniffy-yellow text-gray-900 font-bold px-7 py-3 rounded-full text-sm hover:opacity-90 transition-all">
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
