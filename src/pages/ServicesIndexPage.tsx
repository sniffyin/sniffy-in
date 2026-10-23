/**
 * ServicesIndexPage.tsx — the /services hub: one card per service page.
 *
 * Gives each service page a shared parent that links every sibling, and gives
 * the broader "grooming services in Pune" query a page of its own.
 */
import { useState, lazy, Suspense } from 'react';
import { MapPin, ShieldCheck, Clock, ArrowRight, Phone } from 'lucide-react';
import { PHONE } from '../data/siteLinks';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import Packages from '../components/Packages';
import EliteMembership from '../components/EliteMembership';
import PageMetaStrip from '../components/PageMetaStrip';
import { pageLastModified } from '../data/pageDates';
import HeroSlider, { type HeroChip } from '../components/HeroSlider';
import { buildHeroSlides } from '../components/heroSlides';
import ServiceFaqList from '../components/ServiceFaqList';
import { SERVICES } from '../data/services';
import type { ServicePageData } from '../data/services/types';
import { SERVICES_INDEX_FAQS, SERVICES_INDEX_INTRO } from '../data/services/indexContent';

const BookingWizard = lazy(() => import('../components/BookingWizard'));

const heroChips: HeroChip[] = [
  { icon: ShieldCheck, label: 'Trained groomers' },
  { icon: Clock, label: '9 AM – 9 PM daily' },
  { icon: MapPin, label: 'Available across Pune' },
];

/** "What are you seeing?" — maps a plain-language problem to the page that solves it. */
const CHOOSER: { symptom: string; slug: string }[] = [
  { symptom: 'Hair everywhere, all year', slug: 'deshedding-treatment-in-pune' },
  { symptom: 'Knots, tangles or a felted coat', slug: 'dematting-and-coat-rescue-in-pune' },
  { symptom: 'A new puppy or kitten', slug: 'puppy-and-kitten-first-groom-in-pune' },
  { symptom: 'An older pet with stiff joints', slug: 'senior-pet-grooming-in-pune' },
  { symptom: 'Ticks, fleas or constant scratching', slug: 'tick-and-flea-treatment-in-pune' },
  { symptom: 'Panics at baths, dryers or strangers', slug: 'anxious-and-nervous-pet-grooming-in-pune' },
  { symptom: 'A vet-diagnosed skin problem', slug: 'medicated-bath-in-pune' },
];

/** Circular thumbnails for the hub tiles. Existing site photos, one per service. */
const THUMB: Record<string, string> = {
  'deshedding-treatment-in-pune': '/images/grooming-session-1-800.jpg',
  'dematting-and-coat-rescue-in-pune': '/images/grooming-session-2-800.jpg',
  'puppy-and-kitten-first-groom-in-pune': '/images/grooming-session-4-800.jpg',
  'senior-pet-grooming-in-pune': '/images/grooming-session-3-800.jpg',
  'tick-and-flea-treatment-in-pune': '/images/hero-guarantee-800.jpg',
  'anxious-and-nervous-pet-grooming-in-pune': '/images/addons/special-handling.jpg',
  'medicated-bath-in-pune': '/images/addons/medicated-bath.jpg',
};

function ServiceCards({ services }: { services: ServicePageData[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
      {services.map((s, i) => {
        const p = s.pricing.items[0];
        const lastOdd = i === services.length - 1 && services.length % 2 === 1;
        return (
          <a
            key={s.slug}
            href={`/services/${s.slug}`}
            className={`group relative isolate overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-shadow ${lastOdd ? 'col-span-2 aspect-[2.6/1] md:col-span-1 md:aspect-[1.05/1]' : 'aspect-[1.05/1]'}`}
          >
            <img
              src={THUMB[s.slug]}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 -z-10 w-full h-full object-cover object-[45%_50%] group-hover:scale-105 transition-transform duration-500"
            />
            <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#2a0f52] via-[#2a0f52]/45 to-transparent" />

            <span className="absolute top-2.5 left-2.5 rounded-full bg-sniffy-yellow text-gray-900 text-[11px] font-extrabold px-2.5 py-1 shadow">
              {p.price}{p.kind === 'addon' ? ' add-on' : ''}
            </span>

            <div className="absolute inset-x-0 bottom-0 p-3.5 md:p-4 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-white font-bold text-base md:text-lg leading-tight drop-shadow">{s.shortName.replace(/-/g, '\u2011')}</h3>
                <p className="hidden md:block mt-1 text-white/80 text-xs leading-snug line-clamp-2">{s.heroSubtitle}</p>
              </div>
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/95 text-sniffy-purple flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={16} />
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}

export default function ServicesIndexPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wizardMounted, setWizardMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const openWizard = () => {
    setWizardMounted(true);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-clip">
      <Toast
        message="We've received your booking! Our team will contact you shortly."
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <header className="sticky top-0 z-50">
        <Navbar activePath="/services" />
      </header>

      <main>
        <HeroSlider
          slides={buildHeroSlides({
            eyebrow: 'GROOMING SERVICES',
            title: (
              <>
                Pet Grooming Services<br />
                <span className="text-sniffy-yellow">at Home in Pune</span>
              </>
            ),
            subtitle: SERVICES_INDEX_INTRO.hero,
            imageAlt: 'Sniffy groomer providing a grooming service at a home in Pune',
          })}
          onBook={openWizard}
          chips={heroChips}
          hideChipsOnMobile
          sectionClassName="bg-gradient-to-b from-purple-100 via-purple-50 to-white pt-4 pb-6 relative overflow-hidden"
        />

        <section className="px-4 pt-6 pb-2 bg-white">
          <div className="max-w-4xl mx-auto">
            <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-4">
              <ol className="flex flex-wrap items-center gap-1">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li aria-hidden="true">›</li>
                <li className="text-gray-700">Services</li>
              </ol>
            </nav>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{SERVICES_INDEX_INTRO.heading}</h2>
            {SERVICES_INDEX_INTRO.paragraphs.map((p, i) => (
              <p key={p} className={`text-gray-600 text-[15px] md:text-base leading-relaxed mb-3 ${i > 0 ? 'hidden md:block' : ''}`}>{p}</p>
            ))}
          </div>
        </section>

        <section className="px-4 pb-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">What are you noticing?</h2>
            <ul className="grid gap-2 md:grid-cols-2">
              {CHOOSER.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`/services/${c.slug}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 active:bg-purple-50 hover:border-sniffy-purple/40"
                  >
                    {c.symptom}
                    <ArrowRight size={16} className="flex-shrink-0 text-sniffy-purple" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4 py-10 md:py-14 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Find the service that fits your pet</h2>
            <p className="text-gray-500 text-sm md:text-base mb-6 max-w-3xl">
              Shedding, mats, a new puppy, an older pet, parasites, a nervous pet or a skin problem. Each is handled within our published prices.
            </p>
            <ServiceCards services={SERVICES} />
          </div>
        </section>

        <Packages onBookNow={openWizard} showToggle placeName="Pune" petType="dog" />
        <EliteMembership />
        <PageMetaStrip updated={pageLastModified('services')} />

        <ServiceFaqList heading="Grooming services, answered." faqs={SERVICES_INDEX_FAQS} />

        <section className="bg-sniffy-purple px-4 py-16 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">Book a groomer at home</h2>
            <p className="text-white/70 text-base mb-8">Starting ₹799 · A named groomer · 9 AM – 9 PM daily across Pune</p>
            <button
              onClick={openWizard}
              className="bg-sniffy-yellow text-gray-900 font-bold px-12 py-4 rounded-full text-base hover:opacity-90 transition-all shadow-lg"
            >
              Book Now
            </button>
          </div>
        </section>
      </main>

      <div className="pb-[76px] md:pb-0">
        <Footer />
      </div>

      <div
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 px-3 pt-2.5 flex items-center gap-2.5 ${isModalOpen ? 'hidden' : ''}`}
        style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}
      >
        <p className="min-w-0 flex-1 text-sm leading-tight"><span className="block text-[11px] text-gray-500">Packages from</span><span className="font-extrabold text-sniffy-purple text-base">₹799</span></p>
        <a href={`tel:+91${PHONE}`} aria-label="Call Sniffy" className="flex-shrink-0 w-12 h-12 inline-flex items-center justify-center rounded-full border border-sniffy-purple/30 text-sniffy-purple active:bg-purple-50"><Phone size={20} /></a>
        <button onClick={openWizard} className="flex-shrink-0 min-h-[48px] bg-sniffy-purple text-white font-bold px-6 rounded-full text-sm active:scale-[0.98]">Book now</button>
      </div>

      {wizardMounted && (
        <Suspense fallback={null}>
          <BookingWizard
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              setShowToast(true);
              setTimeout(() => setShowToast(false), 5000);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
