/**
 * HowItWorksPage — Standalone page.
 * Uses shared Navbar from components/Navbar.tsx
 *
 * Desktop: alternating image left / right with full text
 * Mobile:  small rounded thumbnail above content, full text always visible (no accordion)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookingWizard from '../components/BookingWizard';
import Toast from '../components/Toast';

// ─── Steps data ───────────────────────────────────────────────────────────────

const steps = [
  {
    number: '01',
    heading: 'Book a Slot That Works for You',
    subheading: 'Morning, afternoon or evening — your schedule, your call.',
    paragraphs: [
      'Fill in your name and number on our quick booking form and we\'ll call you back within minutes to confirm a time. No app downloads, no account creation, no waiting in queues.',
      'We offer morning, afternoon and evening slots across all days of the week including Sundays. Working from home? We\'ll slot in around your calls. Heading out later? We\'ll be done before you leave.',
    ],
    image: '/images/grooming-session-1.jpg',
    imageAlt: 'Booking a dog grooming session at home in Pune',
    imageLeft: false,
  },
  {
    number: '02',
    heading: 'Your Groomer Arrives at Your Door',
    subheading: 'Fully equipped, on time, ready to get started.',
    paragraphs: [
      'Your assigned groomer arrives at the confirmed time with everything needed — shampoos, conditioners, professional-grade clippers, dryers, nail tools and more. You don\'t need to arrange a single thing.',
      'We work cleanly and quietly. Our equipment is compact and designed for home use — whether you\'re in a high-rise apartment or an independent house, the setup is smooth and leaves no mess behind.',
    ],
    image: '/images/grooming-session-2.jpg',
    imageAlt: 'Professional groomer arriving at home with grooming kit',
    imageLeft: true,
  },
  {
    number: '03',
    heading: 'A Calm, Thorough Grooming Session',
    subheading: 'One groomer, one dog, zero distractions.',
    paragraphs: [
      'Unlike a salon where your dog sits in a cage waiting their turn, our sessions are one-on-one. Your groomer gives your dog their full, undivided attention from start to finish.',
      'We work at your dog\'s pace. If they need a break, we take one. Anxious dogs, senior dogs, first-timers — we\'ve worked with all kinds and know how to keep them calm.',
    ],
    image: '/images/grooming-session-3.jpg',
    imageAlt: 'Calm one-on-one dog grooming session at home',
    imageLeft: false,
  },
  {
    number: '04',
    heading: 'Bath, Trim, Nails — The Full Works',
    subheading: 'Every session covers everything your dog needs.',
    paragraphs: [
      'A standard session includes a spa bath with shampoo and conditioner, blow dry, brushing, nail clipping, eye and ear cleaning, paw massage, mouth spray and a spritz of perfume.',
      'For breeds with specific coat needs — double coats, curly coats, long feathering — our groomers adjust their technique accordingly. We don\'t use a one-size-fits-all approach.',
    ],
    image: '/images/grooming-session-4.jpg',
    imageAlt: 'Complete dog grooming session including bath trim and nail care',
    imageLeft: true,
  },
  {
    number: '05',
    heading: 'Your Dog, Clean and Happy',
    subheading: 'Done right, in your home, on your time.',
    paragraphs: [
      'By the end of the session your dog is clean, smelling great and back in their favourite spot at home — without having been stressed by a car ride or a noisy salon.',
      'Your groomer cleans up completely before leaving. Many customers set up a monthly plan so their dog gets consistent grooming without having to rebook each time.',
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
      {/* Step number */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sniffy-yellow font-extrabold text-4xl md:text-5xl leading-none">{step.number}</span>
        <div className="w-8 h-px bg-sniffy-yellow/40" />
      </div>

      {/* Mobile thumbnail */}
      <div className="md:hidden flex items-center gap-4 mb-5">
        <div className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
          <img src={step.image} alt={step.imageAlt} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="w-px h-10 bg-sniffy-yellow/30 rounded-full" />
      </div>

      <h2 className="text-xl md:text-3xl font-bold mb-2 text-gray-900 leading-tight">{step.heading}</h2>
      <p className="text-gray-400 mb-4 text-sm md:text-base font-medium">{step.subheading}</p>
      <div className="space-y-3 text-gray-600 text-sm md:text-base leading-relaxed">
        {step.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <button onClick={onBookNow} className="mt-6 bg-sniffy-purple text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-all text-sm">
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
    <section className={bg + ' py-10 md:py-16 px-4'}>
      <motion.div
        className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-16 items-center"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        {step.imageLeft ? <>{image}{content}</> : <>{content}{image}</>}
      </motion.div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
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
        <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 pt-14 pb-8 md:py-20 text-center">
          <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-4">The Process</p>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">How Sniffy Works</h1>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
              Professional dog grooming at your home in Pune — here's exactly what happens from the moment you book to the moment your dog is done.
            </p>
          </motion.div>

          {/* Mobile-only: number circles + arrows, no text labels */}
          <div className="md:hidden mt-8 flex items-center justify-center gap-2">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-white/80 border border-purple-200 shadow-sm flex items-center justify-center flex-shrink-0">
                  <span className="text-sniffy-purple font-extrabold text-xs">{step.number}</span>
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
        {/* <section className="bg-sniffy-purple px-4 py-16 text-center">
          <motion.div className="max-w-xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Ready to book your dog's first session?</h2>
            <p className="text-white/70 text-base mb-8">Starting ₹799 · All areas across Pune · 9 AM – 9 PM daily</p>
            <button onClick={() => setIsModalOpen(true)} className="bg-sniffy-yellow text-gray-900 font-bold px-10 py-4 rounded-full text-base hover:opacity-90 transition-all shadow-lg">
              Book Now
            </button>
          </motion.div>
        </section> */}
      </main>

      <Footer />

      <BookingWizard open={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} />
    </div>
  );
}
