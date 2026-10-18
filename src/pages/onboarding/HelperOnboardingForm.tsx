/**
 * HelperOnboardingForm — sign-up for "Groomer's Helper" (rendered inside GroomerOnboardingPage).
 *
 * A helper goes along with a groomer on home visits: holds/calms the pet, sets up & cleans up,
 * towel-dries, carries the kit. Writes to `helper_applications` (separate from groomer_applications).
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { supabase } from '../../lib/supabase';
import {
  PUNE_AREAS, ALL_PUNE, uploadWithRetry, UPLOAD_CONCURRENCY, SectionHeader, FieldGroup, TextInput,
  SelectInput, ChipToggle, CardToggle, RadioCard, Toggle, UploadZone, SignatureField, StepIndicator,
  type UploadJob,
} from './shared';

const STEPS = ['Personal Info', 'Your Work', 'Documents'];

const TASK_OPTIONS = [
  { value: 'hold_calm_pet',  label: 'Hold & calm the pet' },
  { value: 'setup_cleanup',  label: 'Setup & cleanup' },
  { value: 'towel_dry',      label: 'Towel / blow drying' },
  { value: 'brushing',       label: 'Brushing & de-tangling' },
  { value: 'carry_kit',      label: 'Carry the grooming kit' },
  { value: 'nervous_pets',   label: 'Handle nervous / big dogs' },
];

const PET_OPTIONS = [
  { value: 'dog', emoji: '🐶', label: 'Dogs', sub: 'All sizes' },
  { value: 'cat', emoji: '🐱', label: 'Cats', sub: 'Gentle handling' },
];

const AVAILABILITY = [
  { value: 'full_time', label: 'Full time' },
  { value: 'part_time', label: 'Part time' },
  { value: 'weekends',  label: 'Weekends only' },
];

const EXPERIENCE = [
  { value: 'none',              label: 'New to this',        sub: 'Willing to learn' },
  { value: 'pet_shop',          label: 'Pet shop / vet',  sub: 'Around pets' },
  { value: 'kennel',            label: 'Kennel',  sub: 'Handled dogs' },
  { value: 'groomer_assistant', label: 'Assistant',  sub: 'Helped a groomer' },
];

const LANGUAGES = ['English', 'Hindi', 'Marathi'];

interface HelperForm {
  full_name: string;
  phone: string;
  age: string;
  areas: string[];
  tasks: string[];
  pets: string[];
  availability: string;
  has_vehicle: string;
  languages: string[];
  experience_level: string;
  aspiring_groomer: boolean;
  consent_terms: boolean;
  consent_background_check: boolean;
  consent_whatsapp: boolean;
}

const initial: HelperForm = {
  full_name: '', phone: '', age: '', areas: [], tasks: [], pets: [], availability: '',
  has_vehicle: '', languages: [], experience_level: '', aspiring_groomer: false,
  consent_terms: false, consent_background_check: false, consent_whatsapp: false,
};

export default function HelperOnboardingForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<HelperForm>(initial);
  const [areaMode, setAreaMode] = useState<'all' | 'specific' | null>(null);
  const [passportFiles, setPassportFiles] = useState<File[]>([]);
  const [aadhaarFiles, setAadhaarFiles] = useState<File[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [submitted, setSubmitted] = useState(false);
  const uploadedRef = useRef(new Map<string, Map<File | string, string>>()); // retries only re-send what failed

  const update = (patch: Partial<HelperForm>) => setForm(f => ({ ...f, ...patch }));
  const toggle = (key: 'tasks' | 'pets' | 'languages' | 'areas', val: string) => {
    const arr = form[key];
    update({ [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] } as Partial<HelperForm>);
  };
  const chooseAreaMode = (mode: 'all' | 'specific') => {
    setAreaMode(mode);
    update({ areas: mode === 'all' ? [ALL_PUNE] : [] });
  };

  const validate = (): string => {
    if (step === 1) {
      if (!form.full_name.trim()) return 'Please enter your full name.';
      if (!form.phone.trim() || !/^\+?[0-9\s-]{8,14}$/.test(form.phone)) return 'Please enter a valid phone number.';
      const age = Number(form.age);
      if (!form.age || age < 18 || age > 65) return 'Helpers must be 18 or older. Please enter your age.';
      if (!areaMode) return 'Please choose whether you can work across all of Pune or specific areas.';
      if (form.areas.length === 0) return 'Please select at least one area.';
    }
    if (step === 2) {
      if (form.tasks.length === 0) return 'Please select at least one task you can help with.';
      if (form.pets.length === 0) return 'Please select the pets you are comfortable with.';
      if (!form.availability) return 'Please choose your availability.';
      if (!form.has_vehicle) return 'Please tell us if you have your own vehicle.';
      if (!form.experience_level) return 'Please choose your experience.';
    }
    if (step === 3) {
      if (passportFiles.length === 0) return 'Please upload your passport-size photo.';
      if (aadhaarFiles.length === 0) return 'Please upload your Aadhaar card.';
      if (!signature && !signatureFile) return 'Please add your signature.';
      if (!form.consent_terms) return 'Please accept the Terms & Conditions.';
      if (!form.consent_background_check) return 'Please consent to the background verification check.';
    }
    return '';
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setStep(s => Math.min(s + 1, STEPS.length)); scrollTop();
  };
  const back = () => { setError(''); setStep(s => Math.max(s - 1, 1)); scrollTop(); };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setSubmitting(true);
    try {
      const sigSrc: File | string = signatureFile ?? signature!;
      const jobs: UploadJob[] = [
        { src: passportFiles[0], folder: 'helper-passport',  label: 'Passport photo' },
        { src: sigSrc,           folder: 'helper-signature', label: 'Signature' },
        ...aadhaarFiles.map((f, i) => ({ src: f, folder: 'helper-aadhaar', label: `Aadhaar file ${i + 1}` })),
      ];
      const urls: string[] = new Array(jobs.length);
      let done = 0;
      jobs.forEach((j, i) => { const c = uploadedRef.current.get(j.folder)?.get(j.src); if (c) { urls[i] = c; done++; } });
      setProgress({ done, total: jobs.length });

      const pending = jobs.map((_, i) => i).filter(i => !urls[i]);
      let failure: Error | null = null;
      const worker = async () => {
        while (!failure && pending.length) {
          const i = pending.shift()!;
          try {
            urls[i] = await uploadWithRetry(jobs[i].src, jobs[i].folder, jobs[i].label);
            const { folder, src } = jobs[i];
            if (!uploadedRef.current.has(folder)) uploadedRef.current.set(folder, new Map());
            uploadedRef.current.get(folder)!.set(src, urls[i]);
            setProgress(p => ({ ...p, done: p.done + 1 }));
          } catch (e) {
            failure = e instanceof Error ? e : new Error('Upload failed.');
          }
        }
      };
      await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, pending.length) }, worker));
      if (failure) throw failure;

      const { error: dbErr } = await supabase.from('helper_applications').insert({
        full_name:                form.full_name.trim(),
        phone:                    form.phone.trim(),
        age:                      Number(form.age),
        areas:                    form.areas,
        tasks:                    form.tasks,
        pets_comfortable_with:    form.pets,
        availability:             form.availability,
        has_vehicle:              form.has_vehicle,
        languages:                form.languages,
        experience_level:         form.experience_level,
        aspiring_groomer:         form.aspiring_groomer,
        passport_photo_url:       urls[0],
        signature_url:            urls[1],
        aadhaar_urls:             urls.slice(2),
        consent_terms:            form.consent_terms,
        consent_background_check: form.consent_background_check,
        consent_whatsapp:         form.consent_whatsapp,
        status:                   'pending',
      });
      if (dbErr) throw dbErr;
      setSubmitted(true);
      scrollTop();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : (e as { message?: string })?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-10">
        <DotLottieReact src="/lottie/success_dog.lottie" autoplay loop style={{ width: 180, height: 180, margin: '0 auto 16px' }} />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Thanks for applying to join <span className="text-sniffy-purple">Sniffy</span>!
        </h2>
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          Your helper application has been received. Our team will reach out on <strong>WhatsApp within 24–48 hours</strong>.
        </p>
        <div className="bg-sniffy-yellow/10 border-2 border-sniffy-yellow/30 rounded-[24px] p-6 text-sm">
          <p className="font-bold text-base mb-1 text-gray-900">What happens next?</p>
          <ol className="text-left text-gray-600 space-y-2 mt-3">
            <li>1. Our team reviews your application</li>
            <li>2. We call you for a quick chat</li>
            <li>3. We pair you with a groomer for a trial visit</li>
            <li>4. Start going out on bookings</li>
          </ol>
        </div>
      </div>
    );
  }

  const card = 'bg-white rounded-[20px] border-2 border-sniffy-yellow/20 shadow-sm p-4 sm:p-8';

  return (
    <>
      <div className="sticky top-[73px] z-20 bg-white border-b border-gray-100 shadow-sm -mx-4 mb-5 sm:mb-10">
        <div className="max-w-3xl mx-auto"><StepIndicator current={step} steps={STEPS} /></div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>

          {step === 1 && (
            <div className={card}>
              <SectionHeader emoji="" title="Personal Information" desc="A helper joins a groomer on home visits and assists with the pet." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                <FieldGroup label="Full Name" required>
                  <TextInput placeholder="Your Name" value={form.full_name} onChange={e => update({ full_name: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Phone Number" required hint="We'll contact you on WhatsApp">
                  <TextInput placeholder="Your Phone Number" value={form.phone} onChange={e => update({ phone: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Age" required hint="Must be 18 or older">
                  <TextInput type="number" inputMode="numeric" min={18} max={65} placeholder="e.g. 24" value={form.age} onChange={e => update({ age: e.target.value })} />
                </FieldGroup>
              </div>

              <div className="h-px bg-gray-100 my-3 sm:my-6" />

              <FieldGroup label="Areas You Can Work In" required>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    { mode: 'all' as const,      label: 'All of Pune',    sub: 'I can travel anywhere in the city' },
                    { mode: 'specific' as const, label: 'Specific areas', sub: 'I will pick the areas' },
                  ]).map(o => (
                    <button key={o.mode} type="button" onClick={() => chooseAreaMode(o.mode)}
                      className={`text-left rounded-2xl border-2 px-5 py-3 transition-all ${areaMode === o.mode ? 'border-sniffy-purple bg-purple-50' : 'border-gray-200 hover:border-sniffy-purple/50'}`}>
                      <div className="font-bold text-sm text-gray-800">{o.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{o.sub}</div>
                    </button>
                  ))}
                </div>
                {areaMode === 'specific' && (
                  <div className="mt-3">
                    <SelectInput value="" onChange={e => { if (e.target.value) toggle('areas', e.target.value); e.target.value = ''; }}>
                      <option value="">+ Select an area to add</option>
                      {PUNE_AREAS.filter(a => !form.areas.includes(a)).map(a => <option key={a}>{a}</option>)}
                    </SelectInput>
                    {form.areas.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.areas.map(a => (
                          <span key={a} className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-100 text-sniffy-purple text-sm font-semibold px-3 py-1.5 rounded-full">
                            📍 {a}
                            <button type="button" onClick={() => toggle('areas', a)} className="hover:text-red-500"><X size={13} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </FieldGroup>
            </div>
          )}

          {step === 2 && (
            <div className={card}>
              <SectionHeader emoji="" title="Your Work" desc="Tell us how you can assist the groomer." />

              <FieldGroup label="What can you help with?" required>
                <div className="flex flex-wrap gap-2 mt-0.5">
                  {TASK_OPTIONS.map(t => (
                    <ChipToggle key={t.value} checked={form.tasks.includes(t.value)} onChange={() => toggle('tasks', t.value)} emoji="" label={t.label} />
                  ))}
                </div>
              </FieldGroup>

              <div className="h-px bg-gray-100 my-3 sm:my-6" />

              <FieldGroup label="Pets you are comfortable with" required>
                <div className="grid grid-cols-2 gap-3 mt-0.5">
                  {PET_OPTIONS.map(p => (
                    <CardToggle key={p.value} checked={form.pets.includes(p.value)} onChange={() => toggle('pets', p.value)} emoji={p.emoji} label={p.label} sub={p.sub} />
                  ))}
                </div>
              </FieldGroup>

              <div className="h-px bg-gray-100 my-3 sm:my-6" />

              <FieldGroup label="Availability" required>
                <div className="flex flex-wrap gap-2 mt-0.5">
                  {AVAILABILITY.map(a => (
                    <ChipToggle key={a.value} checked={form.availability === a.value} onChange={() => update({ availability: a.value })} emoji="" label={a.label} />
                  ))}
                </div>
              </FieldGroup>

              <div className="h-px bg-gray-100 my-3 sm:my-6" />

              <FieldGroup label="Do you have your own two-wheeler?" required>
                <div className="grid grid-cols-2 gap-3 mt-0.5">
                  <RadioCard checked={form.has_vehicle === 'yes'} onChange={() => update({ has_vehicle: 'yes' })} emoji="" label="Yes" sub="Travel on my own" />
                  <RadioCard checked={form.has_vehicle === 'no'}  onChange={() => update({ has_vehicle: 'no' })}  emoji="" label="No"  sub="With groomer / bus" />
                </div>
              </FieldGroup>

              <div className="h-px bg-gray-100 my-3 sm:my-6" />

              <FieldGroup label="Experience" required>
                <div className="grid grid-cols-2 gap-3 mt-0.5">
                  {EXPERIENCE.map(x => (
                    <RadioCard key={x.value} checked={form.experience_level === x.value} onChange={() => update({ experience_level: x.value })} emoji="" label={x.label} sub={x.sub} />
                  ))}
                </div>
              </FieldGroup>

              <div className="h-px bg-gray-100 my-3 sm:my-6" />

              <FieldGroup label="Languages you speak (Optional)">
                <div className="flex flex-wrap gap-2 mt-0.5">
                  {LANGUAGES.map(l => (
                    <ChipToggle key={l} checked={form.languages.includes(l)} onChange={() => toggle('languages', l)} emoji="" label={l} />
                  ))}
                </div>
              </FieldGroup>

              <div className="h-px bg-gray-100 my-3 sm:my-6" />

              <Toggle checked={form.aspiring_groomer} onChange={() => update({ aspiring_groomer: !form.aspiring_groomer })} label="I'd like to learn grooming and grow into a groomer" />
            </div>
          )}

          {step === 3 && (
            <div className={card}>
              <SectionHeader emoji="" title="Documents" desc="Needed to verify identity — pet parents let helpers into their homes." />

              <FieldGroup label="Passport-size Photo" required hint="Recent colour photo, face clearly visible, plain background.">
                <UploadZone label="Upload Passport Photo" hint="JPEG, PNG, WEBP · Auto-compressed" accept="image/*" files={passportFiles} onChange={setPassportFiles} emoji="" onError={setError} />
              </FieldGroup>

              <div className="h-px bg-gray-100 my-3 sm:my-6" />

              <FieldGroup label="Upload Aadhaar Card" required hint="Required for identity verification. Your data is encrypted and never shared.">
                <UploadZone label="Upload Aadhaar Card" hint="Front & back · JPG, PNG, or PDF (PDF max 10 MB)" accept="image/*,.pdf" multiple files={aadhaarFiles} onChange={setAadhaarFiles} emoji="" onError={setError} />
              </FieldGroup>

              <div className="h-px bg-gray-100 my-3 sm:my-6" />

              <FieldGroup label="Your Signature" required hint="Sign with your finger as it appears on your ID, or upload a photo of it signed on paper.">
                <SignatureField dataUrl={signature} file={signatureFile} onDataUrl={setSignature} onFile={setSignatureFile} onError={setError} />
              </FieldGroup>

              <div className="h-px bg-gray-100 my-3 sm:my-6" />

              <FieldGroup label="Consent & Agreement">
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <Toggle checked={form.consent_terms} onChange={() => update({ consent_terms: !form.consent_terms })} label="I agree to Sniffy's Helper Terms & Conditions" />
                  <Toggle checked={form.consent_background_check} onChange={() => update({ consent_background_check: !form.consent_background_check })} label="I consent to a background verification check" />
                  <Toggle checked={form.consent_whatsapp} onChange={() => update({ consent_whatsapp: !form.consent_whatsapp })} label="I agree to receive updates & visit alerts on WhatsApp" />
                </div>
              </FieldGroup>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div className="mt-4 flex items-start gap-3 bg-red-50 border-2 border-red-200 rounded-2xl px-5 py-4 text-red-700"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-8 gap-4">
        {step > 1 ? (
          <button type="button" onClick={back} className="px-6 py-3 rounded-full border-2 border-gray-200 text-gray-700 font-bold text-sm hover:border-gray-300 transition-all">← Back</button>
        ) : <div />}
        {step < STEPS.length ? (
          <button type="button" onClick={next} className="bg-sniffy-purple text-white font-bold px-8 py-3.5 rounded-full hover:opacity-90 transition-all shadow-lg shadow-purple-200">Continue →</button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="bg-sniffy-purple text-white font-bold px-8 py-3.5 rounded-full hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-purple-200 disabled:opacity-60">
            {submitting
              ? <><Loader2 size={16} className="animate-spin" /> {progress.total > 0 && progress.done < progress.total ? `Uploading ${progress.done} of ${progress.total}…` : 'Submitting…'}</>
              : <><CheckCircle2 size={16} /> Submit Application</>}
          </button>
        )}
      </div>
    </>
  );
}
