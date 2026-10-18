/**
 * HowItWorksPage — Standalone page.
 * Uses shared Navbar from components/Navbar.tsx
 *
 * Desktop: alternating image left / right with full text
 * Mobile:  small rounded thumbnail above content, full text always visible (no accordion)
 */

import { useState } from 'react';
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
    image: '/images/grooming-session-1.jpg',
    imageAlt: 'Booking a dog grooming session at home in Pune',
    imageLeft: false,
  },
  {
    number: '02',
    heading: 'The Groomer Comes to You',
    subheading: 'On time, with everything they need.',
    paragraphs: [
      'Your groomer shows up at the agreed time with all the gear — shampoo, clippers, dryer, nail tools. You don\'t have to set up anything.',
      'The kit is small and made for homes. Apartment or house, the setup is quick and they leave no mess.',
    ],
    image: '/images/grooming-session-2.jpg',
    imageAlt: 'Professional groomer arriving at home with grooming kit',
    imageLeft: true,
  },
  {
    number: '03',
    heading: 'One Groomer, One Dog',
    subheading: 'No cages, no waiting.',
    paragraphs: [
      'It\'s just your groomer and your dog — full attention, start to finish. No cage, no waiting for a turn.',
      'We go at your dog\'s pace and take breaks if needed. Nervous dogs, older dogs, first-timers — we\'ve handled them all.',
    ],
    image: '/images/grooming-session-3.jpg',
    imageAlt: 'Calm one-on-one dog grooming session at home',
    imageLeft: false,
  },
  {
    number: '04',
    heading: 'Bath, Trim and Nails',
    subheading: 'Everything your dog needs in one visit.',
    paragraphs: [
      'A session covers a bath with shampoo and conditioner, blow dry, brushing, nail clipping, ear and eye cleaning, a paw massage and a spritz of perfume.',
      'Different coats need different care. Our groomers change their approach to suit your dog\'s breed.',
    ],
    image: '/images/grooming-session-4.jpg',
    imageAlt: 'Complete dog grooming session including bath trim and nail care',
    imageLeft: true,
  },
  {
    number: '05',
    heading: 'All Done',
    subheading: 'Clean dog, no stress.',
    paragraphs: [
      'Your dog ends up clean and comfy at home — no car ride, no noisy salon.',
      'The groomer tidies up before leaving. Many customers set up a monthly plan so they don\'t have to book each time.',
    ],
    image: '/images/grooming-session-1.jpg',
    imageAlt: 'Happy clean dog after professional grooming at home in Pune',
    imageLeft: false,
  },
];

// ─── Step block ───────────────────────────────────────────────────────────────

function StepBlock({ step, index, onBookNow }: { step: typeof steps[0]; index: number; onBookNow: () => void }) {
  const bg = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';

  const content = (
    <div>
      {/* ── Desktop header: big number + full heading ── */}
      <div className="hidden md:block">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sniffy-yellow font-extrabold text-5xl leading-none">{step.number}</span>
          <div className="w-8 h-px bg-sniffy-yellow/40" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-gray-900 leading-tight">{step.heading}</h2>
        <p className="text-gray-400 mb-4 text-base font-medium">{step.subheading}</p>
      </div>

      {/* ── Mobile header: thumbnail + number + heading in one compact row ── */}
      <div className="md:hidden flex items-center gap-4 mb-3">
        <div className="w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
          <img src={step.image} alt={step.imageAlt} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="min-w-0">
          <span className="text-sniffy-yellow font-extrabold text-xs tracking-wider">STEP {step.number}</span>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{step.heading}</h2>
          <p className="text-gray-400 text-xs font-medium">{step.subheading}</p>
        </div>
      </div>

      <div className="space-y-2.5 text-gray-600 text-sm md:text-base leading-relaxed">
        {step.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {/* Per-step Book Now — desktop only; mobile uses one CTA at the end */}
      <button onClick={onBookNow} className="hidden md:inline-block mt-6 bg-sniffy-purple text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-all text-sm">
        Book Now
      </button>
    </div>
  );

  const image = (
    <div className="hidden md:flex justify-center">
      <div className="w-full max-w-md aspect-[4/3] overflow-hidden bg-gray-100 shadow-sm mx-auto" style={{ borderRadius: '50px' }}>
        <img src={step.image} alt={step.imageAlt} className="w-full h-full object-cover" loading="lazy" />
      </div>
    </div>
  );

  return (
    <section className={bg + ' py-7 md:py-16 px-4'}>
      <div
        className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-16 items-center"
      >
        {step.imageLeft ? <>{image}{content}</> : <>{content}{image}</>}
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
        {/* Page hero */}
        <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 pt-4 pb-5 md:py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-1.5 md:mb-4">The Process</p>
            <h1 className="text-xl md:text-5xl font-bold text-gray-900 leading-tight mb-2 md:mb-5">How Sniffy Works</h1>
            <p className="text-gray-600 text-xs md:text-lg leading-relaxed max-w-lg mx-auto">
              Dog grooming at home in Pune. Here's what happens, from booking to done — in five simple steps.
            </p>
          </div>

          {/* Mobile-only: number circles + arrows, no text labels */}
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
        </section>

        {/* Step strip — desktop only */}
        <div className="hidden md:block bg-white border-y border-gray-100 px-4 py-6">
          <div className="flex items-center justify-center">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5 px-3 w-36 text-center">
                  <span className="text-sniffy-purple font-extrabold text-lg">{step.number}</span>
                  <span className="text-gray-400 text-xs leading-snug">{step.heading}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-6 h-px bg-sniffy-yellow/40 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        {steps.map((step, index) => (
          <StepBlock key={step.number} step={step} index={index} onBookNow={() => setIsModalOpen(true)} />
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
