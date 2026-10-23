/**
 * WhySniffyPage.tsx
 * "Why Sniffy?" — mobile-first persuasion page.
 *
 * Styled like the rest of the site (HowItWorksPage / Packages): lavender-to-white
 * hero, system sans, two-tone purple + yellow headings, rounded-3xl cards with
 * real photos, pill toggles, purple closing band. Sections: hero → Salon-vs-Sniffy
 * toggle → stats → swipeable reasons → before/after → head-to-head → FAQ → CTA.
 *
 * The FAQ list and the <h1> stay in the DOM on first paint because
 * scripts/prerenderSpa.ts snapshots this page for SEO.
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import {
  Check, X, MapPin, Shield, Heart, Sparkles, Camera, Star,
  ChevronDown, Home, Car, Hourglass, Scissors, Bath,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookingWizard from '../components/BookingWizard';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import Toast from '../components/Toast';
import { useSeo } from '../lib/useSeo';
import { SEO_ROUTES } from '../data/seoRoutes';
import { WHY_SNIFFY_FAQS } from '../data/whySniffyFaqs';
import { RATING_VALUE, REVIEW_COUNT } from '../data/reputation';

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const decimals = Number.isInteger(target) ? 0 : 1;
    let frame = 0;
    const timer = setInterval(() => {
      frame += 1;
      setCount(Number((target * Math.min(1, frame / 50)).toFixed(decimals)));
      if (frame >= 50) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function SectionHead({ eyebrow, children, center = true }: { eyebrow: string; children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`mb-4 md:mb-10 ${center ? 'text-center' : ''}`}>
      <p className="text-[10px] md:text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-1.5 md:mb-2">{eyebrow}</p>
      <h2 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">{children}</h2>
    </div>
  );
}

// ── Salon day vs Sniffy day ──────────────────────────────────────────────────
type Mode = 'salon' | 'sniffy';

const DAY: Record<Mode, {
  title: string; face: string; stress: number; quote: string; bar: string; chip: string;
  steps: { icon: typeof Car; label: string; note: string }[];
}> = {
  salon: {
    title: 'The salon day', face: '😰', stress: 85, bar: 'bg-red-400', chip: 'bg-red-50 text-red-600',
    quote: '"Why is it so loud in here? Where are we going?"',
    steps: [
      { icon: Car,       label: 'Car ride to the salon', note: 'Traffic, noise, motion sickness for many pets.' },
      { icon: Hourglass, label: 'Wait for your turn',    note: 'Often crated beside other barking dogs.' },
      { icon: Scissors,  label: 'Groomed in a queue',    note: 'One groomer, several pets on the go.' },
      { icon: Car,       label: 'Car ride back home',    note: 'Tired, damp and still stressed.' },
    ],
  },
  sniffy: {
    title: 'The Sniffy day', face: '😌', stress: 15, bar: 'bg-green-500', chip: 'bg-green-50 text-green-700',
    quote: '"Same sofa, same smells. Also, a bath? Fine."',
    steps: [
      { icon: Home,   label: 'You book, we arrive',     note: 'Groomer walks in with the full kit.' },
      { icon: Bath,   label: 'Bath at your place',      note: 'Familiar floor, familiar people nearby.' },
      { icon: Heart,  label: '1-on-1, no cage',         note: 'Full attention, breaks whenever needed.' },
      { icon: Camera, label: 'Fresh photo sent to you', note: 'Pet is dry, calm and already home.' },
    ],
  },
};

function DaySimulator() {
  const [mode, setMode] = useState<Mode>('salon');
  const d = DAY[mode];
  const sniffy = mode === 'sniffy';

  return (
    <section className="px-4 py-7 md:py-16 bg-white">
      <div className="max-w-5xl mx-auto">
        <SectionHead eyebrow="Tap to compare">
          Same groom. <span className="text-sniffy-purple">Two very</span> <span className="text-sniffy-yellow">different days.</span>
        </SectionHead>

        {/* Same pill toggle as the Packages dog/cat switch */}
        <div className="flex justify-center mb-4 md:mb-8">
          <div className="inline-flex bg-gray-100 rounded-full p-1.5 shadow-lg" role="tablist" aria-label="Compare a salon day with a Sniffy day">
            {(['salon', 'sniffy'] as Mode[]).map(m => (
              <button
                key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
                className={`px-5 md:px-8 py-2.5 md:py-3 min-h-[44px] rounded-full font-semibold text-sm md:text-base transition-all duration-300 ${mode === m ? 'bg-sniffy-purple text-white shadow-md' : 'text-gray-600'}`}
              >
                {m === 'salon' ? 'Salon day' : 'Sniffy day'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-[1.3fr_1fr] gap-4 md:gap-8 items-start">
          <AnimatePresence mode="wait">
            <motion.ol
              key={mode}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-2 md:space-y-3"
            >
              {d.steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <li key={i} className="flex gap-3 md:gap-4 items-center bg-white border border-gray-100 shadow-md rounded-2xl p-3 md:p-4">
                    <div className="w-9 h-9 md:w-11 md:h-11 shrink-0 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center">
                      <Icon size={19} className="text-sniffy-purple" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm md:text-base leading-snug">{s.label}</div>
                      <div className="text-xs md:text-sm text-gray-600 leading-snug md:leading-relaxed">{s.note}</div>
                    </div>
                    <span className="ml-auto text-sniffy-yellow font-extrabold text-sm">{String(i + 1).padStart(2, '0')}</span>
                  </li>
                );
              })}
            </motion.ol>
          </AnimatePresence>

          <div className="rounded-3xl bg-gradient-to-b from-purple-100 via-purple-50 to-white border border-purple-100 shadow-lg p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-sniffy-purple font-bold">Pet stress level</p>
                <div className="text-xl font-bold text-gray-900 mt-0.5">{d.title}</div>
              </div>
              <motion.span key={d.face} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="text-4xl leading-none" aria-hidden>{d.face}</motion.span>
            </div>
            <div className="mt-4 h-3 rounded-full bg-white border border-gray-200 overflow-hidden" role="img" aria-label={`Typical stress: ${sniffy ? 'low' : 'high'}`}>
              <motion.div className={`h-full rounded-full ${d.bar}`} animate={{ width: `${d.stress}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
            </div>
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-gray-500 mt-1.5"><span>Calm</span><span>Stressed</span></div>
            <p className="mt-4 text-sm font-medium text-gray-800 leading-relaxed">{d.quote}</p>
            <span className={`inline-block mt-3 rounded-full px-3 py-1 text-[11px] font-bold ${d.chip}`}>{sniffy ? 'Calm, at home' : 'Typical salon visit'}</span>
            <p className="hidden md:block text-[10px] text-gray-400 mt-3">Illustrative, based on typical experiences.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Reasons ──────────────────────────────────────────────────────────────────
const reasons = [
  { icon: MapPin,   title: 'We come to you',     tag: 'Zero salon trips',     desc: 'No car rides, no unfamiliar smells, no packed waiting rooms. A trained groomer arrives at your door.', img: '/images/how-step-2-800.jpg' },
  { icon: Heart,    title: '1-on-1 attention',   tag: 'No cage, no queue',    desc: 'Your pet is never caged or rushed to the next dog. Full focus, start to finish.',                     img: '/images/how-step-3-800.jpg' },
  { icon: Camera,   title: 'Post-groom photo',   tag: 'See the reveal',       desc: 'After every session we send a photo of your freshly groomed pet. The reveal is half the joy.',        img: '/images/how-step-5-800.jpg' },
  { icon: Shield,   title: 'Vetted & certified', tag: 'Trust, not guesswork', desc: 'Every groomer is background-checked, certified and trained in pet handling.' },
  { icon: Sparkles, title: 'Pet-safe products',  tag: 'No harsh chemicals',   desc: 'Sulphate-free, toxin-free shampoos and conditioners. Gentle for puppies to seniors.' },
];

function Reasons() {
  return (
    <section className="py-7 md:py-16 bg-gradient-to-b from-white to-purple-50/60">
      <div className="max-w-6xl mx-auto">
        <div className="px-4">
          <SectionHead eyebrow="The Sniffy difference">
            <span className="text-sniffy-purple">Everything a salon does.</span>{' '}
            <span className="text-sniffy-yellow">Minus what your dog hates.</span>
          </SectionHead>
        </div>

        <div className="flex md:grid md:grid-cols-6 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory px-4 pt-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.article
                key={r.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }} transition={{ delay: (i % 3) * 0.06 }}
                className={`snap-center shrink-0 w-[78%] sm:w-[55%] md:w-auto ${r.img ? 'md:col-span-2' : 'md:col-span-3'} bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden flex flex-col`}
              >
                {r.img && (
                  <div className="relative aspect-[2/1] md:aspect-[4/3] overflow-hidden">
                    <img src={r.img} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-sniffy-purple shadow">
                      <Icon size={12} /> {r.tag}
                    </span>
                  </div>
                )}
                <div className="p-4 md:p-6 flex-1">
                  {!r.img && (
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center"><Icon size={20} className="text-sniffy-purple" /></div>
                      <span className="text-[10px] uppercase tracking-widest text-sniffy-purple font-bold">{r.tag}</span>
                    </div>
                  )}
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1.5">{r.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{r.desc}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
        <p className="md:hidden text-center text-xs font-semibold text-gray-400">Swipe →</p>
      </div>
    </section>
  );
}

// ── Head to head ─────────────────────────────────────────────────────────────
type Val = boolean | 'partial';
const compareRows: { label: string; sniffy: Val; salon: Val; others: Val }[] = [
  { label: 'Comes to your home',            sniffy: true, salon: false, others: 'partial' },
  { label: 'No cage time / waiting',        sniffy: true, salon: false, others: true },
  { label: 'Certified & verified groomers', sniffy: true, salon: true,  others: false },
  { label: 'Transparent flat pricing',      sniffy: true, salon: false, others: false },
  { label: 'Pet-safe, toxin-free products', sniffy: true, salon: false, others: false },
  { label: 'Post-groom photo update',       sniffy: true, salon: false, others: false },
];

function Mark({ v }: { v: Val }) {
  const base = 'w-7 h-7 rounded-full flex items-center justify-center';
  if (v === true) return <span className={`${base} bg-green-100`}><Check size={14} className="stroke-[2.5] text-green-600" /></span>;
  if (v === false) return <span className={`${base} bg-red-50`}><X size={14} className="stroke-[2.5] text-red-400" /></span>;
  return <span className={`${base} bg-yellow-50 text-yellow-500 text-sm font-bold`}>~</span>;
}

function Compare() {
  const [vs, setVs] = useState<'salon' | 'others'>('salon');

  return (
    <section id="compare" className="py-7 md:py-16 px-4 bg-white scroll-mt-4">
      <div className="max-w-4xl mx-auto">
        <SectionHead eyebrow="Head to head">
          Sniffy <span className="text-sniffy-yellow">vs</span> <span className="text-sniffy-purple">the rest</span>
        </SectionHead>

        <div className="md:hidden">
          <div className="flex justify-center mb-4">
            <div className="inline-flex bg-gray-100 rounded-full p-1.5 shadow-lg">
              {([['salon', 'vs Pet salon'], ['others', 'vs Other home']] as const).map(([k, l]) => (
                <button key={k} onClick={() => setVs(k)} className={`px-5 py-2 min-h-[44px] rounded-full text-sm font-semibold transition-all ${vs === k ? 'bg-sniffy-purple text-white shadow-md' : 'text-gray-600'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-white border border-gray-100 shadow-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_64px_64px] items-center px-4 py-3 bg-purple-50 text-[11px] font-bold uppercase tracking-wider">
              <span className="text-gray-500">Feature</span>
              <span className="text-center text-sniffy-purple">Sniffy</span>
              <span className="text-center text-gray-500">{vs === 'salon' ? 'Salon' : 'Others'}</span>
            </div>
            {compareRows.map(row => (
              <div key={row.label} className="grid grid-cols-[1fr_64px_64px] items-center px-4 py-2.5 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-800 pr-2 leading-snug">{row.label}</span>
                <span className="flex justify-center"><Mark v={row.sniffy} /></span>
                <span className="flex justify-center"><Mark v={row[vs]} /></span>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:block rounded-3xl bg-white border border-gray-100 shadow-lg overflow-hidden">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] text-sm">
            <div className="p-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Feature</div>
            <div className="p-5 text-center font-extrabold text-sniffy-purple bg-purple-50">Sniffy</div>
            <div className="p-5 text-center font-bold text-gray-500">Pet salon</div>
            <div className="p-5 text-center font-bold text-gray-500">Other home</div>
            {compareRows.map(row => (
              <div key={row.label} className="contents">
                <div className="p-5 font-medium text-gray-800 border-t border-gray-100">{row.label}</div>
                <div className="p-5 flex justify-center bg-purple-50/60 border-t border-gray-100"><Mark v={row.sniffy} /></div>
                <div className="p-5 flex justify-center border-t border-gray-100"><Mark v={row.salon} /></div>
                <div className="p-5 flex justify-center border-t border-gray-100"><Mark v={row.others} /></div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">✓ Yes &nbsp; ✕ No &nbsp; ~ Sometimes</p>
      </div>
    </section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} className="w-full flex items-center justify-between gap-4 px-5 py-4 min-h-[56px] text-left hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900 text-sm leading-snug">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0"><ChevronDown size={18} className="text-sniffy-purple" /></motion.span>
      </button>
      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
        <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
const stats = [
  { value: 2800, suffix: '+', label: 'Pets groomed' },
  { value: RATING_VALUE, suffix: '★', label: `${REVIEW_COUNT} Google reviews` },
  { value: 30, suffix: '+', label: 'Areas in Pune' },
  { value: 100, suffix: '%', label: 'Satisfaction' },
];

export default function WhySniffyPage() {
  useSeo(SEO_ROUTES.whySniffy);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const book = () => setIsModalOpen(true);
  const onSuccess = () => { setShowToast(true); setTimeout(() => setShowToast(false), 5000); };

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0 overflow-x-clip">
      <Toast message="We've received your booking! Our team will contact you shortly." isVisible={showToast} onClose={() => setShowToast(false)} />

      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Navbar activePath="/why-sniffy" />
      </header>

      <main>
        {/* ── HERO ── */}
        <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 pt-4 pb-6 md:pt-12 md:pb-14">
          <div className="max-w-5xl mx-auto text-center">
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] md:text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-2">Why Sniffy</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Why Pet Parents <span className="text-sniffy-purple">Choose</span> <span className="text-sniffy-yellow">Sniffy</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-3 md:mt-4 text-gray-600 text-sm md:text-lg leading-relaxed max-w-xl mx-auto">
              Not all grooming is equal. Pune pet parents are ditching the salon queue and the car ride for a groomer who comes to them.
            </motion.p>

            {/* Photo banner with floating proof chips */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="relative mt-4 md:mt-8">
              <img
                src="/images/hero-how-800.jpg"
                srcSet="/images/hero-how-800.jpg 800w, /images/hero-how.jpg 1600w"
                sizes="(min-width: 1024px) 1024px, 100vw"
                alt="Sniffy groomer grooming a dog at home in Pune"
                className="w-full aspect-[2/1] md:aspect-[21/9] object-cover rounded-3xl shadow-xl"
                fetchPriority="high"
              />
              <div className="absolute left-3 bottom-3 md:left-5 md:bottom-5 flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur px-3.5 py-2 shadow-lg">
                <Star size={16} className="fill-sniffy-yellow text-sniffy-yellow" />
                <div className="text-left leading-tight">
                  <div className="text-sm font-extrabold text-gray-900">{RATING_VALUE} on Google</div>
                  <div className="text-[10px] text-gray-500">{REVIEW_COUNT} reviews</div>
                </div>
              </div>
              <div className="hidden sm:flex absolute right-5 bottom-5 gap-2">
                {['No cages', 'At your home', 'Sundays too'].map(t => (
                  <span key={t} className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-sniffy-purple shadow">{t}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <DaySimulator />

        {/* ── STATS ── */}
        <section className="px-4 pb-7 md:pb-16 bg-white">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
            {stats.map(s => (
              <div key={s.label} className="rounded-3xl bg-purple-50 border border-purple-100 p-3 md:p-6 text-center">
                <div className="text-2xl md:text-4xl font-extrabold text-sniffy-purple tabular-nums"><Counter target={s.value} suffix={s.suffix} /></div>
                <div className="mt-1 text-xs md:text-sm text-gray-600 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <Reasons />
        <BeforeAfterSlider />
        <Compare />

        {/* ── FAQs ── */}
        <section className="py-7 md:py-16 px-4 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <SectionHead eyebrow="Still wondering?">
              Common <span className="text-sniffy-purple">Questions</span>
            </SectionHead>
            <div className="space-y-3">
              {WHY_SNIFFY_FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </section>

        {/* ── CTA (same band as How It Works) ── */}
        <section className="bg-sniffy-purple px-4 py-9 md:py-16 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">Your pet deserves a calmer groom.</h2>
            <p className="text-white/70 text-sm md:text-base mb-5 md:mb-8">Starting ₹799 · All areas across Pune · 9 AM – 9 PM daily</p>
            <button onClick={book} className="bg-sniffy-yellow text-gray-900 font-bold px-10 py-4 rounded-full text-base hover:opacity-90 transition-all shadow-lg">
              Book Now
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* Sticky phone CTA, leaves room for the floating chat button */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 pl-4 pr-[5.5rem] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-md border-t border-gray-200 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-gray-900 leading-tight truncate">Calmer grooming, at home</div>
          <div className="text-[11px] text-gray-500">★ {RATING_VALUE} · {REVIEW_COUNT} Google reviews</div>
        </div>
        <button onClick={book} className="shrink-0 bg-sniffy-purple text-white font-bold px-6 min-h-[46px] rounded-full active:scale-95 transition-transform">Book now</button>
      </div>

      <BookingWizard open={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={onSuccess} />
    </div>
  );
}
