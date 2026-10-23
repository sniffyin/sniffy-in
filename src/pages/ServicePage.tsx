/**
 * ServicePage.tsx — one page per grooming service (/services/<slug>).
 *
 * Mobile-first: the order on a phone is hero → price/at-a-glance → quick jump
 * chips → who it is for (swipe cards) → how it works (timeline) → price cards →
 * packages → detail stories → FAQs → areas → related, with a sticky Book bar
 * pinned to the bottom of the screen until md. Desktop reflows the same blocks
 * into grids.
 *
 * All copy comes from src/data/services/*, inlined into the generated HTML by
 * scripts/generateServicePages.ts, which also prerenders the same content so
 * crawlers see it without running JavaScript. Keep the headings and text in
 * step with scripts/prerenderServiceBody.ts.
 */
import { useState, lazy, Suspense } from 'react';
import { MapPin, ShieldCheck, Clock, Check, ArrowRight, Phone, PawPrint, Home, IndianRupee } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import Packages from '../components/Packages';
import EliteMembership from '../components/EliteMembership';
import HeroSlider, { type HeroChip } from '../components/HeroSlider';
import { buildHeroSlides } from '../components/heroSlides';
import ServiceFaqList from '../components/ServiceFaqList';
import StoryBlock from '../components/StoryBlock';
import { blogIndex } from '../data/blogIndex';
import { ALL_PUNE_CITIES } from '../data/puneLocalities';
import { PHONE } from '../data/siteLinks';
import { SERVICE_NAV } from '../data/services/nav';
import type { ServicePageData } from '../data/services/types';

const BookingWizard = lazy(() => import('../components/BookingWizard'));

const heroChips: HeroChip[] = [
  { icon: ShieldCheck, label: 'Trained groomers' },
  { icon: Clock, label: '9 AM – 9 PM daily' },
  { icon: MapPin, label: 'Available across Pune' },
];

const AREA_NAME: Record<string, string> = Object.fromEntries(
  ALL_PUNE_CITIES.map((c) => [c.slug.split('/').pop()!, c.name])
);
const BLOG_BY_SLUG = Object.fromEntries(blogIndex.map((p) => [p.slug, p]));
const NAV_LABEL: Record<string, string> = Object.fromEntries(SERVICE_NAV.map((s) => [s.slug, s.label]));

/** Alternating tints so a row of swipe cards reads as distinct items. */
const CARD_TINTS = ['bg-purple-50 border-purple-100', 'bg-amber-50 border-amber-100'];

const JUMP_LINKS = [
  { href: '#price', label: 'Price' },
  { href: '#how', label: 'How it works' },
  { href: '#details', label: 'Details' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#areas', label: 'Areas' },
];

export default function ServicePage({ service }: { service: ServicePageData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  /** Latches true on first open so the lazy wizard chunk is fetched only on demand. */
  const [wizardMounted, setWizardMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  /** Phones show the first lines of the direct answer; the full text stays in the DOM. */
  const [answerOpen, setAnswerOpen] = useState(false);

  const openWizard = () => {
    setWizardMounted(true);
    setIsModalOpen(true);
  };

  const petType = service.pets === 'cat' ? 'cat' : 'dog';
  const headline = service.pricing.items[0];

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
            eyebrow: service.eyebrow,
            title: (
              <>
                {service.h1Line1}
                <br />
                <span className="text-sniffy-yellow">{service.h1Accent}</span>
              </>
            ),
            subtitle: service.heroSubtitle,
            imageAlt: service.heroImageAlt,
          })}
          onBook={openWizard}
          chips={heroChips}
          hideChipsOnMobile
          sectionClassName="bg-gradient-to-b from-purple-100 via-purple-50 to-white pt-4 pb-4 relative overflow-hidden"
        />

        {/* ── At a glance: price, who, where — then the direct answer ── */}
        <section className="px-4 pt-2 pb-2 bg-white">
          <div className="max-w-4xl mx-auto">
            <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-3">
              <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                <li><a href="/" className="inline-block py-1 hover:underline">Home</a></li>
                <li aria-hidden="true">›</li>
                <li><a href="/services" className="inline-block py-1 hover:underline">Services</a></li>
                <li aria-hidden="true">›</li>
                <li className="text-gray-700">{service.shortName}</li>
              </ol>
            </nav>

            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="rounded-2xl bg-sniffy-purple text-white p-3 md:p-4 text-center">
                <IndianRupee size={16} className="mx-auto mb-1 text-sniffy-yellow" aria-hidden="true" />
                <p className="text-xl md:text-3xl font-extrabold leading-none">{headline.price}</p>
                <p className="mt-1 text-[11px] md:text-xs text-white/75 leading-tight">
                  {headline.label}
                  {headline.kind === 'addon' ? ' add-on' : ''}
                </p>
              </div>
              <div className="rounded-2xl bg-purple-50 border border-purple-100 p-3 md:p-4 text-center">
                <PawPrint size={16} className="mx-auto mb-1 text-sniffy-purple" aria-hidden="true" />
                <p className="text-sm md:text-lg font-bold text-gray-900 leading-tight">{service.audience}</p>
                <p className="mt-1 text-[11px] md:text-xs text-gray-500 leading-tight">Any breed or size</p>
              </div>
              <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 md:p-4 text-center">
                <Home size={16} className="mx-auto mb-1 text-[#8a5c00]" aria-hidden="true" />
                <p className="text-sm md:text-lg font-bold text-gray-900 leading-tight">At home</p>
                <p className="mt-1 text-[11px] md:text-xs text-gray-500 leading-tight">9 AM – 9 PM daily</p>
              </div>
            </div>

            <div className="mt-4 rounded-3xl bg-sniffy-yellow/10 border border-sniffy-yellow/30 p-4 md:p-7">
              <p className="text-[11px] uppercase tracking-widest font-bold text-sniffy-purple mb-2">The short answer</p>
              <p className={`text-gray-800 text-[15px] md:text-lg leading-relaxed ${answerOpen ? '' : 'line-clamp-4 md:line-clamp-none'}`}>{service.quickAnswer}</p>
              {!answerOpen && (
                <button
                  type="button"
                  onClick={() => setAnswerOpen(true)}
                  className="md:hidden mt-1 text-sm font-semibold text-sniffy-purple"
                >
                  Read the full answer
                </button>
              )}
              <ul className="mt-4 space-y-2 md:grid md:grid-cols-2 md:gap-x-6 md:space-y-0 md:gap-y-2">
                {service.inShort.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-gray-700 leading-snug">
                    <Check size={16} className="mt-0.5 flex-shrink-0 text-sniffy-purple" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={openWizard}
                className="mt-5 w-full md:w-auto min-h-[48px] bg-sniffy-purple text-white font-bold px-8 py-3 rounded-full text-base hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Book this service
              </button>
            </div>

            {/* Quick jump chips: swipeable on phones */}
            <nav aria-label="On this page" className="mt-4 -mx-4 px-4 flex gap-2 overflow-x-auto scrollbar-hide">
              {JUMP_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="flex-shrink-0 inline-flex items-center rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-sniffy-purple active:bg-purple-50"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {/* ── Who it is for: swipe cards on phones, grid from md ── */}
        <section className="py-10 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="px-4 mb-5 md:mb-8 md:text-center max-w-3xl md:mx-auto">
              <p className="text-[11px] uppercase tracking-widest font-bold text-sniffy-purple mb-1.5">Is this for your pet?</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">{service.whoFor.heading}</h2>
              <p className="text-gray-500 text-sm md:text-base">{service.whoFor.intro}</p>
            </div>
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:overflow-visible md:snap-none md:pb-0">
              {service.whoFor.items.map((item, i) => (
                <article
                  key={item.title}
                  className={`snap-start flex-shrink-0 w-[78%] sm:w-[46%] md:w-auto rounded-2xl border p-5 ${CARD_TINTS[i % 2]}`}
                >
                  <h3 className="font-bold text-gray-900 text-base mb-1.5 leading-snug">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
                </article>
              ))}
            </div>
            <p className="md:hidden px-4 mt-1 text-xs text-gray-400">Swipe for more →</p>
          </div>
        </section>

        {/* ── How it works: vertical timeline ── */}
        <section id="how" className="px-4 py-10 md:py-16 bg-gray-50 scroll-mt-20">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 md:mb-10 md:text-center">
              <p className="text-[11px] uppercase tracking-widest font-bold text-sniffy-purple mb-1.5">Step by step</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">{service.process.heading}</h2>
              <p className="text-gray-500 text-sm md:text-base">{service.process.intro}</p>
            </div>
            <ol className="relative">
              {service.process.steps.map((step, i) => (
                <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < service.process.steps.length - 1 && (
                    <span aria-hidden="true" className="absolute left-[17px] top-9 bottom-0 w-0.5 bg-sniffy-purple/20" />
                  )}
                  <span className="relative z-10 flex-shrink-0 w-9 h-9 rounded-full bg-sniffy-purple text-sniffy-yellow font-bold flex items-center justify-center text-sm">
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <h3 className="font-bold text-gray-900 text-base leading-snug">{step.title}</h3>
                    <p className="mt-1 text-gray-600 text-sm leading-relaxed">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Pricing for this service ── */}
        <section id="price" className="px-4 py-10 md:py-16 bg-white scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 md:mb-8 md:text-center max-w-3xl md:mx-auto">
              <p className="text-[11px] uppercase tracking-widest font-bold text-sniffy-purple mb-1.5">Price</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">{service.pricing.heading}</h2>
              <p className="text-gray-500 text-sm md:text-base">{service.pricing.intro}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 md:gap-4">
              {service.pricing.items.map((item, i) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border p-4 md:p-5 ${i === 0 ? 'border-sniffy-purple/40 bg-purple-50 ring-1 ring-sniffy-purple/10' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 leading-snug">{item.label}</h3>
                      <p className="mt-0.5 text-[11px] text-gray-500 uppercase tracking-wide">
                        {item.kind === 'package' ? 'Package' : 'Add-on'}
                        {item.pets === 'dog' ? ' · dogs' : item.pets === 'cat' ? ' · cats' : ' · dogs & cats'}
                      </p>
                    </div>
                    <div className="text-2xl font-extrabold text-sniffy-purple whitespace-nowrap">{item.price}</div>
                  </div>
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500 md:text-center max-w-3xl md:mx-auto leading-relaxed">{service.pricing.footnote}</p>
          </div>
        </section>

        {/* ── Standard packages, with the dog/cat toggle ── */}
        <Packages
          onBookNow={openWizard}
          showToggle={service.pets === 'both'}
          placeName="Pune"
          petType={petType}
        />

        <EliteMembership />

        {/* ── Story sections ── */}
        <section id="details" className="bg-gray-50 pt-12 pb-4 px-4 scroll-mt-20">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-[11px] uppercase tracking-widest font-bold text-sniffy-purple mb-1.5">The detail</p>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
              {service.shortName}: what to know before you book
            </h2>
          </div>
        </section>

        {service.stories.map((section, i) => (
          <StoryBlock
            key={section.heading}
            section={section}
            index={i}
            onBookNow={openWizard}
            ctaLabel="Book a Session"
            mobileCta
          />
        ))}

        {/* ── FAQs ── */}
        <div id="faqs" className="scroll-mt-20">
          <ServiceFaqList heading={`${service.shortName}, answered.`} faqs={service.faqs} />
        </div>

        {/* ── Where we offer it ── */}
        <section id="areas" className="px-4 py-10 md:py-16 bg-white scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 md:text-center">
              <p className="text-[11px] uppercase tracking-widest font-bold text-sniffy-purple mb-1.5">Where we visit</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
                {service.shortName} across Pune
              </h2>
              <p className="text-gray-500 text-sm md:text-base max-w-2xl md:mx-auto">
                The same groomers, prices and approach in all 33 localities. Pick your area for the roads, societies and weather we plan around.
              </p>
            </div>
            <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
              {service.areaSlugs.map((slug) => (
                <li key={slug} className="rounded-2xl border border-gray-200 p-3">
                  <p className="font-bold text-gray-900 text-sm leading-tight">{AREA_NAME[slug] ?? slug}</p>
                  <div className="mt-2 flex gap-2">
                    <a href={`/dog-grooming-in-pune/${slug}`} className="flex-1 inline-flex items-center justify-center py-1.5 rounded-full bg-purple-50 text-sniffy-purple text-xs font-bold active:bg-purple-100">
                      Dogs
                    </a>
                    <a href={`/cat-grooming-in-pune/${slug}`} className="flex-1 inline-flex items-center justify-center py-1.5 rounded-full bg-amber-50 text-[#8a5c00] text-xs font-bold active:bg-amber-100">
                      Cats
                    </a>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col sm:flex-row sm:justify-center gap-2 sm:gap-6 text-sm font-semibold">
              <a href="/dog-grooming-in-pune" className="inline-flex items-center gap-1 py-1 text-sniffy-purple hover:underline">All dog grooming areas <ArrowRight size={14} /></a>
              <a href="/cat-grooming-in-pune" className="inline-flex items-center gap-1 py-1 text-sniffy-purple hover:underline">All cat grooming areas <ArrowRight size={14} /></a>
            </div>
          </div>
        </section>

        {/* ── Related services and guides ── */}
        <section className="px-4 py-10 md:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2 md:gap-10">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Related services</h2>
              <ul className="space-y-2">
                {service.relatedServices.map((slug) => (
                  <li key={slug}>
                    <a href={`/services/${slug}`} className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm font-semibold text-sniffy-purple active:bg-purple-50">
                      {NAV_LABEL[slug] ?? slug}
                      <ArrowRight size={14} />
                    </a>
                  </li>
                ))}
                <li>
                  <a href="/services" className="inline-flex items-center px-1 py-1 text-sm font-semibold text-gray-600 hover:underline">See all grooming services</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Guides worth reading</h2>
              <ul className="space-y-2">
                {service.relatedBlogs.map((slug) => {
                  const post = BLOG_BY_SLUG[slug];
                  if (!post) return null;
                  return (
                    <li key={slug}>
                      <a href={`/blogs/${slug}`} className="block rounded-xl bg-white border border-gray-200 px-4 py-3 active:bg-purple-50">
                        <span className="block text-sm font-semibold text-gray-900 leading-snug">{post.title}</span>
                        <span className="block text-xs text-gray-400 mt-0.5">{post.category} · {post.readTime}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="bg-sniffy-purple px-4 py-14 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">Book {service.shortName.toLowerCase()} today</h2>
            <p className="text-white/70 text-sm md:text-base mb-7">Starting ₹799 · A named groomer · 9 AM – 9 PM daily across Pune</p>
            <button
              onClick={openWizard}
              className="w-full sm:w-auto min-h-[52px] bg-sniffy-yellow text-gray-900 font-bold px-12 py-3.5 rounded-full text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
            >
              Book Now
            </button>
          </div>
        </section>
      </main>

      {/* Room for the sticky bar so it never covers the footer links */}
      <div className="pb-[76px] md:pb-0">
        <Footer />
      </div>

      {/* ── Sticky booking bar, phones only ── */}
      <div
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 px-3 pt-2.5 flex items-center gap-2.5 ${isModalOpen ? 'hidden' : ''}`}
        style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}
      >
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[11px] text-gray-500 truncate">{service.shortName}</p>
          <p className="text-base font-extrabold text-sniffy-purple">
            {headline.price}
            <span className="ml-1 text-[11px] font-semibold text-gray-500">{headline.kind === 'addon' ? 'add-on' : 'onwards'}</span>
          </p>
        </div>
        <a
          href={`tel:+91${PHONE}`}
          aria-label="Call Sniffy"
          className="flex-shrink-0 w-12 h-12 inline-flex items-center justify-center rounded-full border border-sniffy-purple/30 text-sniffy-purple active:bg-purple-50"
        >
          <Phone size={20} />
        </a>
        <button
          onClick={openWizard}
          className="flex-shrink-0 min-h-[48px] bg-sniffy-purple text-white font-bold px-6 rounded-full text-sm active:scale-[0.98]"
        >
          Book now
        </button>
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
