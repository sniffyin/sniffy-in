/**
 * PunePage.tsx — City-level index page for Pune.
 *
 * Route: /dog-grooming-in-pune
 *
 * Deliberately different from locality pages:
 * — Hero is full-width centered (locality pages are split 2-col with form)
 * — Locality grid replaces LocationCities pills — cards with descriptions
 * — "Why Pune dogs need more grooming" replaces LocationStories alternating layout
 * — Stats band across the middle (new section not on locality pages)
 * — FAQ is pune-wide, not locality-specific
 * — No LocationHero component used at all — fresh layout
 */

import { useState, lazy, Suspense } from 'react';
import { MapPin, Star, ChevronDown, ChevronUp, ShieldCheck, Clock } from 'lucide-react';
// From puneLocalities, NOT the locationData re-export: they name the same array,
// but importing it via locationData pulls that module's ~319 KB of locality prose
// into this page's chunk, and the hub renders none of it. See the docblock in
// src/data/puneLocalities.ts — this is the exact cost it was split out to avoid.
import { ALL_PUNE_CITIES } from '../data/puneLocalities';
// Hub copy lives in a data-only module so the page generator can prerender it.
import { stats, whySections, faqs, reviews } from '../data/puneHubContent';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import Packages from '../components/Packages';
import EliteMembership from '../components/EliteMembership';
import HeroSlider, { type HeroChip } from '../components/HeroSlider';
import { buildHeroSlides } from '../components/heroSlides';
import { GOOGLE_REVIEW_URL } from '../data/siteLinks';
import RatingSummary from '../components/RatingSummary';
import RelatedArticles from '../components/RelatedArticles';
import StoryBlock from '../components/StoryBlock';

const heroChips: HeroChip[] = [
  { icon: ShieldCheck, label: 'Trained groomers' },
  { icon: Clock, label: '9 AM – 9 PM daily' },
  { icon: MapPin, label: 'Available across Pune' },
];

// ─── Locality data ─────────────────────────────────────────────────────────

const localityDescriptions: Record<string, { description: string; tag: string }> = {
  dhanori: { description: 'Near airport, close to Viman Nagar. Growing pet ownership in newer housing clusters.', tag: 'North-east Pune' },
  wagholi: { description: 'Fast-growing east Pune. New residential clusters with a lot of first-time dog owners.', tag: 'Growing area' },
  'kalyani-nagar': { description: 'Upscale riverside locality with premium societies and frequent grooming schedules.', tag: 'Premium area' },
  lohegaon: { description: 'Airport-adjacent neighbourhood with many new residential complexes and pet families.', tag: 'Airport area' },
  kharadi: { description: 'Major IT hub with busy professionals and high demand for convenient home grooming.', tag: 'IT hub' },
  'viman-nagar': { description: 'Well-connected urban neighbourhood with strong demand from apartment pet owners.', tag: 'Urban hub' },
  mundwa: { description: 'Growing residential area near Koregaon Park extension with many young pet parents.', tag: 'Growing area' },
  'koregaon-park': { description: 'One of Pune’s most premium neighbourhoods with many long-haired breed owners.', tag: 'Premium area' },

  kothrud: { description: 'Dense established neighbourhood with mix of indie dogs and purebreds in societies.', tag: 'Popular' },
  shivajinagar: { description: 'Central Pune locality with a mix of older homes and large-breed dogs.', tag: 'Central Pune' },
  dhayari: { description: 'Quiet residential area with many families keeping indie dogs and medium breeds.', tag: 'Residential' },
  'karve-nagar': { description: 'Family neighbourhood with strong adoption culture and growing pet ownership.', tag: 'Family area' },
  ambegaon: { description: 'Rapidly developing suburb with many new apartment societies and pet families.', tag: 'Developing area' },
  baner: { description: 'Popular IT and startup hub with young professionals and many apartment dogs.', tag: 'IT hub' },
  bavdhan: { description: 'Green hillside neighbourhood with many active dog owners and outdoor walkers.', tag: 'Green area' },

  wakad: { description: 'IT corridor families with many Huskies, Goldens and Labradors.', tag: 'High demand' },
  'pimpri-chinchwad': { description: 'Large residential and industrial township with steady grooming demand.', tag: 'PCMC' },
  khadki: { description: 'Historic cantonment area with a mix of old bungalows and pet-friendly homes.', tag: 'Cantonment' },
  ravet: { description: 'Fast-growing PCMC residential hub with many young families and pets.', tag: 'Growing area' },
  aundh: { description: 'Upscale neighbourhood near university areas with many apartment dogs.', tag: 'Premium area' },
  kalewadi: { description: 'Busy PCMC locality with strong demand from working families.', tag: 'PCMC' },

  kondhwa: { description: 'South Pune residential belt popular with families who keep outdoor dogs.', tag: 'South Pune' },
  nibm: { description: 'Premium gated societies with regular monthly grooming demand.', tag: 'Premium area' },
  katraj: { description: 'Large residential suburb with many independent homes and pet owners.', tag: 'South Pune' },
  handewadi: { description: 'Developing residential cluster with growing pet ownership.', tag: 'Growing area' },
  hadapsar: { description: 'Major residential and IT hub with many working professionals and apartment dogs.', tag: 'IT hub' },
  bibewadi: { description: 'Dense family neighbourhood with many medium and small breed dogs.', tag: 'Residential' },
  camp: { description: 'Historic central Pune area with bungalow homes and long-time pet owners.', tag: 'Central Pune' },
  wanowrie: { description: 'Calm cantonment-side neighbourhood with many family homes and pets.', tag: 'South Pune' },
};

const localities = ALL_PUNE_CITIES.map(city => {
  const key = city.slug.split('/').pop()!;
  const extra = localityDescriptions[key] || {
    description: `Professional home dog grooming available in ${city.name}.`,
    tag: 'Pune',
  };

  return {
    name: city.name,
    slug: city.slug,
    description: extra.description,
    tag: extra.tag,
  };
}).sort((a, b) => a.name.localeCompare(b.name));

// ─── FAQ item ────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-gray-100 rounded-2xl overflow-hidden cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between px-5 py-4 gap-4">
        <span className="font-semibold text-gray-900 text-sm md:text-base leading-snug">{q}</span>
        <span className="flex-shrink-0 text-sniffy-purple">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </div>
      {open && (
        <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-50">
          <div className="pt-3">{a}</div>
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

/**
 * Lazy, and mounted only after the first open — see the note in LocationPage.tsx.
 * BookingWizard pulls in the 370 KB lottie player and the Supabase client, none
 * of which this page needs until someone taps "Book".
 */
const BookingWizard = lazy(() => import('../components/BookingWizard'));

export default function PunePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  /** Latches true on first open so the lazy wizard chunk is fetched only once. */
  const [wizardMounted, setWizardMounted] = useState(false);

  const openWizard = () => {
    setWizardMounted(true);
    setIsModalOpen(true);
  };
  const [showToast, setShowToast] = useState(false);
  const [showAllLocalities, setShowAllLocalities] = useState(false);
  const [areaSearch, setAreaSearch] = useState('');
  const [activeZone, setActiveZone] = useState('All');

  const zones = ['All', 'North', 'South', 'East', 'West', 'Central', 'PCMC'];

  const zoneTagMap: Record<string, string[]> = {
    North: ['North-east Pune', 'Airport area', 'Growing area'],
    South: ['South Pune', 'Residential'],
    East: ['IT hub', 'Growing area', 'Urban hub', 'Premium area'],
    West: ['IT hub', 'Green area', 'Premium area', 'High demand'],
    Central: ['Central Pune', 'Popular', 'Family area', 'Cantonment'],
    PCMC: ['PCMC'],
  };

  const filteredLocalities = localities.filter(loc => {
    const matchSearch = loc.name.toLowerCase().includes(areaSearch.toLowerCase());
    const matchZone = activeZone === 'All' || (zoneTagMap[activeZone] || []).some(t => loc.tag.toLowerCase().includes(t.toLowerCase()));
    return matchSearch && matchZone;
  });

  // Collapsed counts differ per breakpoint (2-col vs 4-col grid). Cards past the
  // limit stay in the DOM and are hidden with CSS so every locality link is still
  // present in the prerendered HTML for crawlers.
  const MOBILE_INITIAL = 6;
  const DESKTOP_INITIAL = 8;

  const cardVisibility = (i: number) => {
    if (showAllLocalities || i < MOBILE_INITIAL) return '';
    if (i < DESKTOP_INITIAL) return 'hidden sm:flex';
    return 'hidden';
  };

  return (
    <div className="min-h-screen bg-white">
      <Toast
        message="We've received your booking! Our team will contact you shortly."
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-50">
        <Navbar activePath="/dog-grooming-in-pune" />
      </header>

      <main>

        {/* ── Hero — shared Flipkart-style carousel (same as home) ── */}
        <HeroSlider
          slides={buildHeroSlides({
            eyebrow: 'AT-HOME DOG GROOMING',
            title: (
              <>
                Dog Grooming at Home<br />
                <span className="text-sniffy-yellow">Across Pune</span>
              </>
            ),
            subtitle:
              'Doorstep pet grooming services across Pune. Trained groomers visit your home — fully equipped, on time, no salon stress.',
          })}
          onBook={() => openWizard()}
          chips={heroChips}
          hideChipsOnMobile
          sectionClassName="bg-gradient-to-b from-purple-100 via-purple-50 to-white pt-4 pb-6 relative overflow-hidden"
        />

        {/* ── Stats band ── */}
        {/* <section className="bg-sniffy-purple px-4 py-8">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div
                key={stat.label}
              >
                <div className="text-2xl md:text-4xl font-extrabold text-sniffy-yellow mb-1">
                  {stat.number}
                </div>
                <div className="text-white/70 text-xs md:text-sm leading-snug">{stat.label}</div>
              </div>
            ))}
          </div>
        </section> */}

        {/* ── Packages — kept above the locality picker so pricing lands first ── */}
        <Packages
          onBookNow={() => openWizard()}
          showToggle={false}
          placeName="Pune"
          petType="dog"
        />

        {/* ── Elite Membership (same as home) ── */}
        <EliteMembership />

        {/* ── Localities grid ── */}
        <section className="px-4 py-10 md:py-14 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6">
              <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-1.5">Where we operate</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Pick Your Area
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                Each area has its own page with local information, pricing, and area-specific details.
              </p>
            </div>

            {/* Search + Zone filters */}
            <div className="mb-5 space-y-2.5">
              {/* Search */}
              <div className="relative max-w-sm mx-auto">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" viewBox="0 0 20 20" fill="none">
                  <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search your area..."
                  value={areaSearch}
                  onChange={e => { setAreaSearch(e.target.value); setShowAllLocalities(true); }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-sniffy-purple focus:bg-white transition-all"
                />
                {areaSearch && (
                  <button onClick={() => setAreaSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </button>
                )}
              </div>

              {/* Zone chips */}
              <div className="flex gap-2 flex-wrap justify-center">
                {zones.map(zone => (
                  <button
                    key={zone}
                    onClick={() => { setActiveZone(zone); setShowAllLocalities(true); }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={{
                      background: activeZone === zone ? '#4C1D95' : '#f3f4f6',
                      color: activeZone === zone ? 'white' : '#6b7280',
                      border: activeZone === zone ? '2px solid #4C1D95' : '2px solid transparent',
                    }}
                  >
                    {zone}
                  </button>
                ))}
              </div>

              {/* Result count */}
              {(areaSearch || activeZone !== 'All') && (
                <p className="text-center text-xs text-gray-400">
                  {filteredLocalities.length} area{filteredLocalities.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            {/* One compact grid for both breakpoints — 2-col on mobile, 4-col on desktop */}
            {filteredLocalities.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No areas match your search.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {filteredLocalities.map((loc, i) => (
                  <a
                    key={loc.slug}
                    href={`/${loc.slug}`}
                    className={`group flex flex-col bg-gray-50 hover:bg-sniffy-purple/5 active:bg-sniffy-purple/5 border border-gray-100 hover:border-sniffy-purple/30 rounded-2xl px-3.5 py-3 sm:px-4 sm:py-3.5 transition-colors ${cardVisibility(i)}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-sniffy-purple flex-shrink-0" />
                      <h3 className="font-bold text-gray-900 text-[13px] sm:text-sm leading-tight truncate group-hover:text-sniffy-purple transition-colors">
                        {/* Keyword anchor text; the card title is `truncate` in a
                            4-col grid, so the prefix is sr-only rather than clipped. */}
                        <span className="sr-only">Dog grooming in </span>
                        {loc.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-gray-500 text-[11px] leading-snug line-clamp-2">
                      {loc.description}
                    </p>
                    <span className="mt-1.5 text-[9px] font-bold uppercase tracking-wide text-sniffy-yellow leading-none">
                      {loc.tag}
                    </span>
                  </a>
                ))}
              </div>
            )}

            {filteredLocalities.length > MOBILE_INITIAL && (
              <div className={`text-center mt-5 ${filteredLocalities.length > DESKTOP_INITIAL ? '' : 'sm:hidden'}`}>
                <button
                  onClick={() => setShowAllLocalities(v => !v)}
                  className="inline-flex items-center gap-2 border border-sniffy-purple text-sniffy-purple px-6 py-2 rounded-full font-semibold text-sm hover:bg-sniffy-purple hover:text-white active:bg-sniffy-purple active:text-white transition-all"
                >
                  {showAllLocalities ? 'Show less' : 'Show all areas'}
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${showAllLocalities ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            )}
          </div>
        </section>

        {/*
          ── Why sections ──
          Rendered through the shared <StoryBlock /> — the same presentation as
          the home page and the locality pages (icon + eyebrow badge, floated
          image, mobile "Read more" accordion). The heading block below sits in
          its own section so the story blocks can keep their own full-bleed
          alternating backgrounds; nesting them inside a max-w-6xl wrapper would
          have cut the white bands short.
        */}
        <section className="bg-gray-50 pt-16 pb-6 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-2">Why it matters</p>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
              Grooming in Pune is a<br className="hidden md:block" /> bit different
            </h2>
          </div>
        </section>

        {whySections.map((section, i) => (
          <StoryBlock
            key={i}
            section={section}
            index={i}
            onBookNow={() => openWizard()}
            ctaLabel="Book a Session"
            mobileCta
          />
        ))}

        {/* ── Reviews — horizontal scroll on mobile, grid on desktop ── */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-2">From Pune pet parents</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
                What people say
              </h2>

              {/* Visible counterpart to this page's aggregateRating JSON-LD. */}
              <RatingSummary className="mt-4" />
            </div>

            {/* Mobile: horizontal scroll */}
            <div className="md:hidden flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
              {reviews.map((r, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-72 snap-start bg-gradient-to-br from-purple-50 to-yellow-50 border border-gray-100 rounded-3xl p-5"
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(r.rating)].map((_, j) => (
                      <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">"{r.text}"</p>
                  <div>
                    <div className="font-semibold text-sniffy-purple text-sm">{r.name}</div>
                    <div className="text-xs text-gray-400">{r.pet} · {r.area}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: 2x2 grid */}
            <div className="hidden md:grid md:grid-cols-2 gap-5">
              {reviews.map((r, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-purple-50 to-yellow-50 border border-gray-100 rounded-3xl p-6"
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(r.rating)].map((_, j) => (
                      <Star key={j} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-5">"{r.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sniffy-purple to-sniffy-yellow flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {r.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sniffy-purple text-sm">{r.name}</div>
                      <div className="text-xs text-gray-400">{r.pet} · {r.area}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-sniffy-purple text-sniffy-purple px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-sniffy-purple hover:text-white transition-all"
              >
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                Read all Google Reviews
              </a>
            </div>
          </div>
        </section>

        {/* ── FAQs ── */}
        <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-2">Common questions</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900">FAQs</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="bg-sniffy-purple px-4 py-16 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
              Book your dog's session today
            </h2>
            <p className="text-white/70 text-base mb-8">
              Starting ₹799 · Available across Pune · 9 AM – 9 PM daily
            </p>
            <button
              onClick={() => openWizard()}
              className="bg-sniffy-yellow text-gray-900 font-bold px-12 py-4 rounded-full text-base hover:opacity-90 transition-all shadow-lg"
            >
              Book Now
            </button>
          </div>
        </section>

      </main>

      <RelatedArticles audience="dog" />
      <Footer />

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
