/**
 * CatPunePage.tsx — City-level index page for cat grooming in Pune.
 *
 * Route: /cat-grooming-in-pune
 *
 * Mirrors PunePage structure but all content is cat-specific:
 * — Cat-focused hero, stats, why sections, reviews, FAQs
 * — Links to all cat grooming locality pages
 */

import { useState, lazy, Suspense } from 'react';
import { MapPin, Star, ChevronDown, ChevronUp, ShieldCheck, Clock } from 'lucide-react';
// From puneLocalities, not the catLocationData re-export — see the note in
// PunePage.tsx. Via catLocationData this drags ~378 KB of cat locality prose
// into the hub chunk for a list of 33 names.
import { ALL_CAT_PUNE_CITIES } from '../data/puneLocalities';
import Navbar from '../components/Navbar';
import { HUB_SIBLING } from '../data/hubMeta';
import { pageLastModified } from '../data/pageDates';
import PageMetaStrip from '../components/PageMetaStrip';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import Packages from '../components/Packages';
import EliteMembership from '../components/EliteMembership';
import HeroSlider, { type HeroChip } from '../components/HeroSlider';
import { buildHeroSlides } from '../components/heroSlides';
// Hub copy lives in a data-only module so the page generator can prerender it.
import { stats, whySections, reviews, faqs } from '../data/catPuneHubContent';
import { GOOGLE_REVIEW_URL } from '../data/siteLinks';
import RatingSummary from '../components/RatingSummary';
import RelatedArticles from '../components/RelatedArticles';
import StoryBlock from '../components/StoryBlock';

const heroChips: HeroChip[] = [
  { icon: ShieldCheck, label: 'Cat-trained groomers' },
  { icon: Clock, label: '9 AM – 9 PM daily' },
  { icon: MapPin, label: '33 areas in Pune' },
];

// ─── Locality descriptions ───────────────────────────────────────────────────

const localityDescriptions: Record<string, { description: string; tag: string }> = {
  dhanori:          { description: 'Near Lohegaon and Viman Nagar. Growing apartment community with many Persian and Indie cat owners.', tag: 'North-east Pune' },
  wagholi:          { description: 'Fast-expanding east Pune with a large young professional population and many apartment cats.', tag: 'Growing area' },
  'kalyani-nagar':  { description: 'Upscale riverside locality with premium societies and many purebred cat owners.', tag: 'Premium area' },
  lohegaon:         { description: 'Airport-adjacent neighbourhood with new residential complexes and a growing cat community.', tag: 'Airport area' },
  kharadi:          { description: 'One of Pune\'s most active cat parent communities — IT professionals with apartment cats.', tag: 'IT hub' },
  'viman-nagar':    { description: 'Well-connected urban neighbourhood with strong demand for professional in-home cat grooming.', tag: 'Urban hub' },
  mundwa:           { description: 'Residential area between Koregaon Park and Kharadi with many cat families.', tag: 'Growing area' },
  'koregaon-park':  { description: 'Premium neighbourhood with some of Pune\'s most pampered cats — Persians, Maine Coons, and Indies.', tag: 'Premium area' },
  kothrud:          { description: 'Dense established neighbourhood with a large and active cat-owning community.', tag: 'Popular' },
  shivajinagar:     { description: 'Central Pune locality with a long history of cat ownership in its older homes and apartments.', tag: 'Central Pune' },
  dhayari:          { description: 'Quiet residential area in south-west Pune with many cat families who need local grooming options.', tag: 'Residential' },
  'karve-nagar':    { description: 'Family neighbourhood with a settled cat community in its quiet residential lanes.', tag: 'Family area' },
  ambegaon:         { description: 'Rapidly developing suburb in south Pune with growing pet ownership and limited local services.', tag: 'Developing area' },
  baner:            { description: 'Popular IT and startup hub — one of Pune\'s highest-density cat-owning localities.', tag: 'IT hub' },
  bavdhan:          { description: 'Hillside neighbourhood with a quiet character that suits in-home cat grooming perfectly.', tag: 'Green area' },
  wakad:            { description: 'High-density IT corridor with hundreds of apartment cats across its gated complexes.', tag: 'High demand' },
  'pimpri-chinchwad': { description: 'Large PCMC township with a growing cat population that has been underserved for grooming.', tag: 'PCMC' },
  khadki:           { description: 'Historic cantonment area with established households and many long-term cat owners.', tag: 'Cantonment' },
  ravet:            { description: 'Fast-growing PCMC residential hub near the expressway with many young families and pets.', tag: 'Growing area' },
  aundh:            { description: 'Established upscale neighbourhood with a large and well-cared-for cat community.', tag: 'Premium area' },
  kalewadi:         { description: 'Busy PCMC locality with working families and cats who rarely get professional grooming.', tag: 'PCMC' },
  kondhwa:          { description: 'South Pune residential belt with a strong community of longhair cat owners.', tag: 'South Pune' },
  nibm:             { description: 'Premium gated societies with regular monthly grooming demand from discerning cat owners.', tag: 'Premium area' },
  katraj:           { description: 'Large south Pune suburb with a growing cat population and limited specialist services nearby.', tag: 'South Pune' },
  handewadi:        { description: 'Developing residential cluster in south Pune with a cat community that needs local coverage.', tag: 'Growing area' },
  hadapsar:         { description: 'Major residential and IT hub — one of Pune\'s largest localities with a significant cat population.', tag: 'IT hub' },
  bibewadi:         { description: 'Dense family neighbourhood along the Sinhagad Road corridor with many cat-owning households.', tag: 'Residential' },
  camp:             { description: 'Historic central Pune with heritage homes, character cats, and owners who take grooming seriously.', tag: 'Central Pune' },
  wanowrie:         { description: 'Calm cantonment-side neighbourhood with settled households and well-loved cats.', tag: 'South Pune' },
};

const localities = ALL_CAT_PUNE_CITIES.map(city => {
  const key = city.slug.split('/').pop()!;
  const extra = localityDescriptions[key] || {
    description: `Professional in-home cat grooming available in ${city.name}.`,
    tag: 'Pune',
  };
  return {
    name: city.name,
    slug: city.slug,
    description: extra.description,
    tag: extra.tag,
  };
}).sort((a, b) => a.name.localeCompare(b.name));

// ─── FAQ Item ────────────────────────────────────────────────────────────────

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

export default function CatPunePage() {
  const hubUpdated = pageLastModified('cat-grooming-in-pune');
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
    North:   ['North-east Pune', 'Airport area', 'Growing area'],
    South:   ['South Pune', 'Residential'],
    East:    ['IT hub', 'Growing area', 'Urban hub', 'Premium area'],
    West:    ['IT hub', 'Green area', 'Premium area', 'High demand'],
    Central: ['Central Pune', 'Popular', 'Family area', 'Cantonment'],
    PCMC:    ['PCMC'],
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

      <header className="sticky top-0 z-50">
        <Navbar activePath="/cat-grooming-in-pune" />
      </header>

      <main>

        {/* ── Hero — shared Flipkart-style carousel (same as home) ── */}
        <HeroSlider
          slides={buildHeroSlides({
            eyebrow: 'AT-HOME CAT GROOMING',
            title: (
              <>
                Cat Grooming at Home<br />
                <span className="text-sniffy-yellow">Across Pune</span>
              </>
            ),
            subtitle:
              'Professional in-home cat grooming across 33 areas in Pune. No carrier. No salon stress. A trained groomer comes to your home.',
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
          petType="cat"
        />

        {/* ── Elite Membership (same as home) ── */}
        <EliteMembership />

        <PageMetaStrip sibling={HUB_SIBLING.cat} updated={hubUpdated} />

        {/* ── Localities grid ── */}
        <section className="px-4 py-10 md:py-14 bg-white">
          <div className="max-w-6xl mx-auto">
            <div
              className="text-center mb-6"
            >
              <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-1.5">Where we groom cats</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Pick Your Area
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                Each locality has its own page with specific information, local FAQs, and area details.
              </p>
            </div>

            {/* Search + Zone filters */}
            <div className="mb-5 space-y-2.5">
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
                        <span className="sr-only">Cat grooming in </span>
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

        {/* ── Why sections — shared <StoryBlock />; see PunePage.tsx for why the
             heading sits in its own section above the blocks. ── */}
        <section className="bg-gray-50 pt-16 pb-6 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-2">Why it matters</p>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
              Cat grooming in Pune<br className="hidden md:block" /> needs a different approach
            </h2>
          </div>
        </section>

        {whySections.map((section, i) => (
          <StoryBlock
            key={i}
            section={section}
            index={i}
            onBookNow={() => openWizard()}
          />
        ))}

        {/* ── Reviews ── */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div
              className="text-center mb-10"
            >
              <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-2">From Pune cat parents</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
                What people say
              </h2>

              {/* Visible counterpart to this page's aggregateRating JSON-LD. */}
              <RatingSummary className="mt-4" />
            </div>

            <div className="md:hidden flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
              {reviews.map((r, i) => (
                <div key={i} className="flex-shrink-0 w-72 snap-start bg-gradient-to-br from-purple-50 to-yellow-50 border border-gray-100 rounded-3xl p-5">
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
            <div
              className="text-center mb-10"
            >
              <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-2">Common questions</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900">FAQs</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                >
                  <FAQItem q={faq.q} a={faq.a} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="bg-sniffy-purple px-4 py-16 text-center">
          <div
            className="max-w-xl mx-auto"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
              Book your cat's session today
            </h2>
            <p className="text-white/70 text-base mb-8">
              Starting ₹799 · 33 areas across Pune · 9 AM – 9 PM daily
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

      <RelatedArticles audience="cat" />
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
