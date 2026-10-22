/**
 * HowItWorksPage — Standalone page.
 * Uses shared Navbar from components/Navbar.tsx
 *
 * Every step opens with its photo shown whole (native 21:9, no cropping). A dark
 * gradient in one bottom corner holds the step number in a circular outline; the
 * heading, subheading and copy follow underneath as normal page text.
 */

import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookingWizard from '../components/BookingWizard';
import Toast from '../components/Toast';
import { useSeo } from '../lib/useSeo';
import { SEO_ROUTES } from '../data/seoRoutes';

// ─── Steps data ───────────────────────────────────────────────────────────────

const steps = [
  {
    number: '01',
    heading: 'Book a Slot',
    subheading: 'Morning, afternoon or evening — you pick.',
    paragraphs: [
      'Add your name and number to the booking form. We call you back in a few minutes to confirm a time. No app, no account, no queue.',
      'Slots are open every day, including Sundays. Tell us when works for you and we\'ll fit in around it.',
    ],
    image: '/images/how-step-1.jpg',
    imageAlt: 'Woman booking an at-home grooming slot on her phone while her dog rests its chin on her knee',
  },
  {
    number: '02',
    heading: 'The Groomer Comes to You',
    subheading: 'On time, with everything they need.',
    paragraphs: [
      'Your groomer shows up at the agreed time with all the gear — shampoo, clippers, dryer, nail tools. You don\'t have to set up anything.',
      'The kit is small and made for homes. Apartment or house, the setup is quick and they leave no mess.',
    ],
    image: '/images/how-step-2.jpg',
    imageAlt: 'Sniffy groomer arriving at an apartment door with a grooming kit as a Pomeranian greets her',
  },
  {
    number: '03',
    heading: 'One Groomer, One Dog',
    subheading: 'No cages, no waiting.',
    paragraphs: [
      'It\'s just your groomer and your dog — full attention, start to finish. No cage, no waiting for a turn.',
      'We go at your dog\'s pace and take breaks if needed. Nervous dogs, older dogs, first-timers — we\'ve handled them all.',
    ],
    image: '/images/how-step-3.jpg',
    imageAlt: 'Groomer gently stroking a calm Cavalier King Charles Spaniel during a one-on-one session at home',
  },
  {
    number: '04',
    heading: 'Bath, Trim and Nails',
    subheading: 'Everything your dog needs in one visit.',
    paragraphs: [
      'A session covers a bath with shampoo and conditioner, blow dry, brushing, nail clipping, ear and eye cleaning, a paw massage and a spritz of perfume.',
      'Different coats need different care. Our groomers change their approach to suit your dog\'s breed.',
    ],
    image: '/images/how-step-4.jpg',
    imageAlt: 'Groomer blow-drying a fluffy Toy Poodle with brushes, clippers and scissors laid out beside them',
  },
  {
    number: '05',
    heading: 'All Done',
    subheading: 'Clean dog, no stress.',
    paragraphs: [
      'Your dog ends up clean and comfy at home — no car ride, no noisy salon.',
      'The groomer tidies up before leaving. Many customers set up a monthly plan so they don\'t have to book each time.',
    ],
    image: '/images/how-step-5.jpg',
    imageAlt: 'Family hugging a freshly groomed Golden Retriever at home in Pune after a grooming visit',
  },
];

/**
 * Latches `seen` true the first time the element appears on screen (drives the
 * one-off reveal).
 * Fails open: with no IntersectionObserver, or when the visitor prefers reduced
 * motion, everything simply shows — nothing is ever left hidden.
 */
function useInView<T extends Element>(startSeen = false) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(startSeen);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, seen };
}

// Photo is full width on phones (cropped 19% shorter than native 21:9) and ~7/12 of the
// max-w-6xl container from md up (10% shorter than native).
const IMAGE_SIZES = '(min-width: 1152px) 660px, (min-width: 768px) 58vw, calc(100vw - 32px)';

// ─── Step block ───────────────────────────────────────────────────────────────

function StepBlock({ step, index }: { step: typeof steps[0]; index: number }) {
  const bg = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
  // Corner for the step badge alternates, opposite the photo's subject
  // (odd steps have their subject on the right, even on the left).
  const badgeLeft = index % 2 === 0;
  // The first banner is above the fold: show it at once (no fade) so it never delays first paint.
  const { ref, seen } = useInView<HTMLDivElement>(index === 0);
  const reveal = (delay: string) =>
    `transition-[opacity,transform] duration-500 ${delay} motion-reduce:transition-none ${
      seen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    }`;

  return (
    <section className={bg + ' py-6 md:py-6 px-4'}>
      <div className="max-w-6xl mx-auto md:grid md:grid-cols-12 md:items-center md:gap-10">
        {/* ── Photo, shown whole (native ratio, no crop) ── */}
        <div
          ref={ref}
          className={`relative overflow-hidden rounded-2xl md:rounded-[1.75rem] shadow-md bg-[#2a1152] md:col-span-7 aspect-[1200/416.4] md:aspect-[1200/462.6] ${
            index % 2 === 1 ? 'md:order-last' : ''
          } transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none md:hover:-translate-y-1 ${
            seen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <picture>
            <source
              type="image/webp"
              srcSet={`${step.image.replace(/\.jpg$/, '-800.webp')} 800w, ${step.image.replace(/\.jpg$/, '.webp')} 1200w`}
              sizes={IMAGE_SIZES}
            />
            <img
              src={step.image}
              srcSet={`${step.image.replace(/\.jpg$/, '-800.jpg')} 800w, ${step.image} 1200w`}
              sizes={IMAGE_SIZES}
              alt={step.imageAlt}
              width={1200}
              height={514}
              className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
              {...(index === 0 ? { fetchpriority: 'high' } : {})}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </picture>

          {/* one-off glint of sunlight across the photo when it appears */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <span
              className={`how-sheen absolute -inset-y-1/4 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/25 to-transparent ${
                seen ? 'is-run' : ''
              }`}
            />
          </div>

          {/* dark corner gradient behind the step badge */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(ellipse 55% 85% at ${badgeLeft ? '0%' : '100%'} 100%, rgba(18,5,42,0.88) 0%, rgba(18,5,42,0.6) 38%, rgba(18,5,42,0) 100%)`,
            }}
          />

          {/* step badge: number in a circular outline */}
          <div
            className={`absolute bottom-3 md:bottom-4 ${badgeLeft ? 'left-3 md:left-4' : 'right-3 md:right-4'} flex h-[3.75rem] w-[3.75rem] md:h-[4.5rem] md:w-[4.5rem] flex-col items-center justify-center rounded-full border-2 border-white/90 bg-black/25 text-white [text-shadow:0_1px_6px_rgba(10,2,30,0.6)] ${reveal('delay-300')}`}
          >
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-sniffy-yellow">Step</span>
            <span className="text-xl md:text-3xl font-extrabold leading-none">{step.number}</span>
          </div>
        </div>

        {/* ── Step heading + copy: below the photo on phones, beside it from md up ── */}
        <div className="mt-4 md:mt-0 md:col-span-5">
          <h2 className={`text-2xl md:text-3xl font-extrabold leading-tight text-gray-900 text-balance ${reveal('delay-200')}`}>
            {step.heading}
          </h2>
          <p className={`mt-1 md:mt-1.5 text-[15px] md:text-base font-bold leading-snug text-sniffy-purple ${reveal('delay-300')}`}>
            {step.subheading}
          </p>
          <div className="mt-2.5 md:mt-3 grid gap-2.5 text-gray-600 text-[15px] md:text-[15px] leading-relaxed">
            {step.paragraphs.map((p, i) => <p key={i} className={i === 0 ? 'text-gray-800' : ''}>{p}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  useSeo(SEO_ROUTES.howItWorks);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast]     = useState(false);

  const handleSuccess = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  return (
    <div className="min-h-screen bg-white">
      <Toast message="We've received your booking! Our team will contact you shortly." isVisible={showToast} onClose={() => setShowToast(false)} />

      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Navbar activePath="/how-it-works" />
      </header>

      <main>
        {/* Page hero — compact: title, one-line intro, and the five-step overview in one block */}
        <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 pt-4 pb-5 md:pt-7 md:pb-6 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-1.5 md:mb-2">The Process</p>
            <h1 className="text-xl md:text-4xl font-bold text-gray-900 leading-tight mb-2 md:mb-2">How Sniffy Works</h1>
            <p className="hidden md:block text-gray-600 md:text-base leading-relaxed max-w-lg mx-auto">
              Dog grooming at home in Pune. Here's what happens, from booking to done — in five simple steps.
            </p>
          </div>

          {/* Phones: number circles + arrows, no text labels */}
          <div className="md:hidden mt-4 flex items-center justify-center gap-2">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/80 border border-purple-200 shadow-sm flex items-center justify-center flex-shrink-0">
                  <span className="text-sniffy-purple font-extrabold text-[11px]">{step.number}</span>
                </div>
                {i < steps.length - 1 && (
                  <span className="text-sniffy-yellow font-bold text-base leading-none">›</span>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: numbered overview with step names, in the same block (no separate band) */}
          <ol className="hidden md:flex items-start justify-center mt-4 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <li key={step.number} className="flex items-start">
                <div className="flex flex-col items-center gap-1 w-32 text-center">
                  <span className="w-7 h-7 rounded-full bg-white border border-purple-200 shadow-sm flex items-center justify-center text-sniffy-purple font-extrabold text-xs">
                    {step.number}
                  </span>
                  <span className="text-gray-500 text-[11px] leading-snug">{step.heading}</span>
                </div>
                {i < steps.length - 1 && <span className="mt-3 w-6 h-px bg-sniffy-yellow/60 flex-shrink-0" />}
              </li>
            ))}
          </ol>
        </section>

        {/* Steps */}
        {steps.map((step, index) => (
          <StepBlock key={step.number} step={step} index={index} />
        ))}

        {/* Bottom CTA */}
        <section className="bg-sniffy-purple px-4 py-12 md:py-16 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Ready to book your dog's first session?</h2>
            <p className="text-white/70 text-sm md:text-base mb-8">Starting ₹799 · All areas across Pune · 9 AM – 9 PM daily</p>
            <button onClick={() => setIsModalOpen(true)} className="bg-sniffy-yellow text-gray-900 font-bold px-10 py-4 rounded-full text-base hover:opacity-90 transition-all shadow-lg">
              Book Now
            </button>
          </div>
        </section>
      </main>

      <Footer />

      <BookingWizard open={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} />
    </div>
  );
}
