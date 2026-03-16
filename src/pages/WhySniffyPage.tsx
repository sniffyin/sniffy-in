/**
 * WhySniffyPage.tsx
 * "Why Sniffy?" — a persuasive comparison page that sells Sniffy vs salons & other home groomers.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Check, X, Star, MapPin, Clock, Shield, Heart,
  Sparkles, Zap, Award, Users, TrendingUp, ChevronDown
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ── Floating paw print bg decoration ─────────────────────────────────────────
function PawBg() {
  const paws = ['🐾', '🐾', '🐾', '🐾', '🐾', '🐾'];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {paws.map((p, i) => (
        <span
          key={i}
          className="absolute text-sniffy-purple/5 font-bold"
          style={{
            fontSize: `${60 + i * 20}px`,
            top: `${10 + i * 14}%`,
            left: `${5 + i * 16}%`,
            transform: `rotate(${-30 + i * 12}deg)`,
          }}
        >
          {p}
        </span>
      ))}
    </div>
  );
}

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Comparison table ─────────────────────────────────────────────────────────
const compareRows = [
  { label: 'Comes to your home',          sniffy: true,  salon: false, others: 'partial' },
  { label: 'No cage time / waiting',      sniffy: true,  salon: false, others: true },
  { label: 'Certified & verified groomers', sniffy: true, salon: true,  others: false },
  { label: 'Transparent flat pricing',    sniffy: true,  salon: false, others: false },
  { label: 'Pet-safe, toxin-free products', sniffy: true, salon: false, others: false },
  { label: 'Post-groom photo update',     sniffy: true,  salon: false, others: false },
];

function Cell({ value }: { value: boolean | 'partial' }) {
  if (value === true) return (
    <div className="flex justify-center">
      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
        <Check size={14} className="text-green-600 stroke-[2.5]" />
      </div>
    </div>
  );
  if (value === false) return (
    <div className="flex justify-center">
      <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
        <X size={14} className="text-red-400 stroke-[2.5]" />
      </div>
    </div>
  );
  return (
    <div className="flex justify-center">
      <div className="w-7 h-7 rounded-full bg-yellow-50 flex items-center justify-center">
        <span className="text-yellow-500 text-xs font-bold">~</span>
      </div>
    </div>
  );
}

// ── Reasons ───────────────────────────────────────────────────────────────────
const reasons = [
  {
    icon: <MapPin size={22} className="text-sniffy-purple" />,
    emoji: '🏠',
    title: 'We Come to You',
    subtitle: 'Zero salon trips',
    desc: 'Your pet never has to leave home. No car rides, no unfamiliar smells, no packed waiting rooms. Just a trained groomer arriving at your door.',
    bg: 'from-purple-50 to-white',
    border: 'border-purple-100',
  },
  {
    icon: <Shield size={22} className="text-blue-600" />,
    emoji: '🛡️',
    title: 'Vetted & Certified',
    subtitle: 'Trust, not guesswork',
    desc: 'Every Sniffy groomer is background-checked, certified, and trained specifically in pet handling — so you never have to wonder who\'s touching your fur baby.',
    bg: 'from-blue-50 to-white',
    border: 'border-blue-100',
  },
  {
    icon: <Heart size={22} className="text-rose-500" />,
    emoji: '💆',
    title: '1-on-1 Attention',
    subtitle: 'No sharing, no waiting',
    desc: 'Unlike salons, your pet is never caged, never rushed past to the next dog. Our groomer\'s full focus is on your pet, start to finish.',
    bg: 'from-rose-50 to-white',
    border: 'border-rose-100',
  },
  {
    icon: <Sparkles size={22} className="text-amber-500" />,
    emoji: '🧴',
    title: 'Pet-Safe Products Only',
    subtitle: 'No harmful chemicals',
    desc: 'We use sulphate-free, toxin-free shampoos and conditioners — gentle on sensitive skin, safe for all breeds from puppies to seniors.',
    bg: 'from-amber-50 to-white',
    border: 'border-amber-100',
  },
  {
    icon: <Clock size={22} className="text-indigo-600" />,
    emoji: '📸',
    title: 'Post-Groom Photo',
    subtitle: 'See the transformation',
    desc: 'After every session, we send you a photo of your freshly groomed pet. Because the reveal is half the joy.',
    bg: 'from-indigo-50 to-white',
    border: 'border-indigo-100',
  },
];

// ── Social proof ──────────────────────────────────────────────────────────────
const reviews = [
  {
    name: 'Priya M.',
    area: 'Baner',
    rating: 5,
    text: 'My Shih Tzu hates the car. With Sniffy, she was calm the whole time — the groomer came home and she actually enjoyed it.',
    pet: 'Shih Tzu 🐶',
  },
  {
    name: 'Rahul K.',
    area: 'Kothrud',
    rating: 5,
    text: 'So much better than the salon near us. The groomer knew exactly how to handle my Husky. Worth every rupee.',
    pet: 'Husky 🐺',
  },
  {
    name: 'Ananya S.',
    area: 'Koregaon Park',
    rating: 5,
    text: 'Booked at 10am, groomer was here by 2pm. My golden looked incredible and I got a photo at the end. Loved it.',
    pet: 'Golden Retriever 🐕',
  },
];

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = [
  { value: 2800, suffix: '+', label: 'Happy pets groomed', icon: '🐾' },
  { value: 4.9, suffix: '★', label: 'Average rating', icon: '⭐' },
  { value: 30, suffix: '+', label: 'Areas in Pune', icon: '📍' },
  { value: 100, suffix: '%', label: 'Satisfaction rate', icon: '💜' },
];

// ── FAQ accordion ─────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'How is Sniffy different from just calling a local groomer?',
    a: 'Local groomers are often unverified, with no fixed pricing or accountability. Sniffy groomers are certified, background-checked, and operate under our quality standards with transparent flat-rate pricing.',
  },
  {
    q: 'Is home grooming as good as a salon?',
    a: 'Often better — because your pet is relaxed in their own environment. No travel anxiety, no caging, no exposure to other animals. The groomer focuses entirely on your pet.',
  },
  {
    q: 'What if my pet misbehaves or is difficult to groom?',
    a: 'Our groomers are trained in animal behaviour and handling. We work at your pet\'s pace, and if needed, we\'ll suggest a split session. Your pet\'s comfort always comes first.',
  },
  {
    q: 'Are your products safe for puppies?',
    a: 'Yes! We use gentle, sulphate-free, puppy-safe shampoos. We\'ve groomed pups as young as 3 months without any issues.',
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="border border-gray-200 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm leading-snug pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={18} className="text-sniffy-purple flex-shrink-0" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <p className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">{a}</p>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function WhySniffyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar activePath="/why-sniffy" />

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden bg-gradient-to-br from-[#f5f0ff] via-white to-[#fdf8ff]">
        <PawBg />

        {/* Decorative blobs */}
        <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-sniffy-purple/8 translate-x-1/2 -translate-y-1/4 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-sniffy-yellow/10 -translate-x-1/3 translate-y-1/3 blur-2xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-white border border-purple-200 rounded-full px-4 py-1.5 mb-6 shadow-sm"
          >
            <Award size={14} className="text-sniffy-purple" />
            <span className="text-xs font-bold text-sniffy-purple uppercase tracking-widest">Pune's Most Trusted Pet Grooming</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-5"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Why Pet Parents{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-sniffy-purple">Choose Sniffy</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute bottom-1 left-0 right-0 h-3 bg-sniffy-yellow/40 rounded-full origin-left -z-0"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Not all grooming is equal. Here's why hundreds of Pune pet parents have ditched salons for good — and never looked back.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/#booking"
              className="bg-sniffy-purple text-white font-bold px-8 py-4 rounded-full text-base hover:opacity-90 transition-all shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-0.5"
            >
              Book a Session →
            </a>
            <a
              href="#compare"
              className="border-2 border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-full text-base hover:border-sniffy-purple hover:text-sniffy-purple transition-all"
            >
              See the Comparison
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-sniffy-purple py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-3xl font-black text-white">
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-white/60 text-xs font-medium mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 6 REASONS ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-sniffy-purple mb-3">6 Reasons</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
              The Sniffy Difference
            </h2>
            <p className="text-gray-500 mt-4 max-w-lg mx-auto">Everything a salon offers — plus the things they can't.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300 } }}
                className={`bg-gradient-to-br ${r.bg} border ${r.border} rounded-3xl p-6 cursor-default`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                    {r.icon}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{r.title}</div>
                    <div className="text-xs text-gray-400">{r.subtitle}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section id="compare" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-sniffy-purple mb-3">Head to Head</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
              Sniffy vs The Rest
            </h2>
            <p className="text-gray-500 mt-4">See exactly how we stack up.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="grid grid-cols-4 border-b border-gray-100">
              <div className="py-5 px-6 text-sm font-bold text-gray-400 uppercase tracking-wider col-span-1">Feature</div>
              <div className="py-5 text-center border-l border-gray-100 bg-sniffy-purple/5">
                <div className="text-sniffy-purple font-black text-sm">🐾 Sniffy</div>
              </div>
              <div className="py-5 text-center border-l border-gray-100">
                <div className="font-bold text-gray-500 text-sm">Pet Salon</div>
              </div>
              <div className="py-5 text-center border-l border-gray-100">
                <div className="font-bold text-gray-500 text-sm">Other Home</div>
              </div>
            </div>

            {/* Rows */}
            {compareRows.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className={`grid grid-cols-4 border-b border-gray-50 hover:bg-purple-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
              >
                <div className="py-4 px-6 text-sm text-gray-700 font-medium flex items-center">{row.label}</div>
                <div className="py-4 border-l border-gray-100 bg-sniffy-purple/5 flex items-center justify-center">
                  <Cell value={row.sniffy} />
                </div>
                <div className="py-4 border-l border-gray-100 flex items-center justify-center">
                  <Cell value={row.salon} />
                </div>
                <div className="py-4 border-l border-gray-100 flex items-center justify-center">
                  <Cell value={row.others} />
                </div>
              </motion.div>
            ))}

            {/* Legend */}
            <div className="px-6 py-4 bg-gray-50 flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center"><Check size={10} className="text-green-600" /></span> Yes</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center"><X size={10} className="text-red-400" /></span> No</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500 font-bold">~</span> Sometimes</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      {/* <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-sniffy-purple mb-3">Real Stories</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
              Pets Who Made the Switch
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-br from-[#faf5ff] to-white border border-purple-100 rounded-3xl p-6 relative"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-sniffy-yellow text-sniffy-yellow" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{r.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{r.name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={10} /> {r.area}, Pune
                    </div>
                  </div>
                  <span className="text-xl">{r.pet.split(' ')[1]}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── FAQs ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-sniffy-purple mb-3">Still wondering?</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
              Common Questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((f, i) => <FAQItem key={f.q} q={f.q} a={f.a} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {/* <section className="py-20 px-4 bg-sniffy-purple relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-sniffy-yellow/10 -translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="max-w-xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-5xl mb-5">🐾</div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Your pet deserves the best.
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Join hundreds of Pune pet parents who've made the switch to stress-free home grooming.
            </p>
            <a
              href="/#booking"
              className="inline-block bg-sniffy-yellow text-gray-900 font-black px-10 py-4 rounded-full text-base hover:opacity-90 transition-all shadow-xl hover:-translate-y-1"
            >
              Book Your First Session →
            </a>
            <p className="text-white/40 text-xs mt-4">No prepayment · Cancel anytime · Pune-wide coverage</p>
          </motion.div>
        </div>
      </section> */}

      <Footer />
    </div>
  );
}
