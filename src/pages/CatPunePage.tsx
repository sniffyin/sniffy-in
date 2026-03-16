/**
 * CatPunePage.tsx — City-level index page for cat grooming in Pune.
 *
 * Route: /cat-grooming-in-pune
 *
 * Mirrors PunePage structure but all content is cat-specific:
 * — Cat-focused hero, stats, why sections, reviews, FAQs
 * — Links to all cat grooming locality pages
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, ChevronDown, ChevronUp, ShieldCheck, Clock } from 'lucide-react';
import { ALL_CAT_PUNE_CITIES } from '../data/catLocationData';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookingWizard from '../components/BookingWizard';
import Toast from '../components/Toast';
import Packages from '../components/Packages';

const avatarSrcs = [
  '/images/review-1.jpg',
  '/images/review-2.jpg',
  '/images/review-3.jpg',
  '/images/review-4.jpg',
];

const avatarEntrance = {
  hidden:  { opacity: 0, scale: 0.5, rotate: -160 },
  visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <motion.div
      className="flex gap-1 items-center"
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(100, (rating - (star - 1)) * 100));
        return (
          <span key={star} className="relative inline-block w-6 h-6">
            <Star className="absolute w-6 h-6 text-gray-300" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </span>
          </span>
        );
      })}
    </motion.div>
  );
}

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

// ─── Stats ──────────────────────────────────────────────────────────────────

const stats = [
  { number: '800+',  label: 'Cat grooming sessions in Pune' },
  { number: '4.9',   label: 'Average rating from cat owners' },
  { number: '29',    label: 'Areas covered across Pune' },
  { number: '₹799',  label: 'Starting price per session' },
];

// ─── Why sections ────────────────────────────────────────────────────────────

const whySections = [
  {
    heading: 'Cats and salons are a genuinely bad combination',
    body: "A dog will walk into a grooming salon and adapt, more or less. A cat won't. Cats are territorial — they have a home, they know it intimately, and everywhere else is a threat. The smell of other animals, the cage time between steps, the unfamiliar humans — a salon visit stresses a cat in ways that last for hours or days after. At-home grooming removes the entire problem. Your cat is in its territory, with its familiar smells and safe spaces nearby. The session goes better. The cat recovers immediately. Everyone has a better time.",
    image: '/images/grooming-session-1.jpg',
    imageAlt: 'Cat grooming at home in Pune',
  },
  {
    heading: 'Pune\'s climate creates real coat and skin problems for indoor cats',
    body: "The dust from construction and traffic settles on indoor cat coats year-round. In summer, the heat increases coat oiliness and skin issues. In monsoon, inadequate drying leads to fungal problems. Persians and longhair cats get mats within weeks in Pune's humidity without regular professional care. Our sessions are designed around these specific conditions — deep conditioning washes that address environmental buildup, seasonal product adjustments, and groomer observations about coat and skin health at every visit.",
    image: '/images/grooming-session-2.jpg',
    imageAlt: 'Cat coat care in Pune apartment',
  },
  {
    heading: 'Most salons are dog operations that tolerate cats. We\'re different.',
    body: "Walk into most Pune pet salons and the setup, the products, and the handling training are all built for dogs. Cats get fitted into the same approach, which is why so many cat owners report bad grooming experiences. Cat grooming requires a completely different product chemistry (cats can be harmed by dog shampoo), completely different restraint technique (low-restraint, reading body language), and a level of patience that most busy salons can't offer. Our groomers are trained specifically for cats — not as an afterthought.",
    image: '/images/grooming-session-3.jpg',
    imageAlt: 'Cat-specific grooming technique Pune',
  },
];

// ─── Reviews ────────────────────────────────────────────────────────────────

const reviews = [
  {
    name: 'Ananya Kulkarni',
    area: 'Kothrud',
    pet: 'Mochi (Persian)',
    text: "Mochi used to hide under the bed for two days after a salon visit. The first home session she was back to normal within the hour. The groomer just understood cats — the whole approach was different. Monthly bookings now.",
    rating: 5,
  },
  {
    name: 'Rohan Desai',
    area: 'Wakad',
    pet: 'Simba (Maine Coon)',
    text: "Simba is big, confident, and has strong opinions about being groomed. The groomer handled him like she'd met a hundred Simba-types before — unhurried, reading him accurately, completing the whole session without drama. Excellent.",
    rating: 5,
  },
  {
    name: 'Preethi Nair',
    area: 'Baner',
    pet: 'Chai (tabby rescue)',
    text: "Chai came from the street two years ago and has always been cautious of strangers. I honestly expected the session to fail halfway. The groomer let Chai approach her first, worked so slowly and calmly, and finished everything. I couldn't believe it.",
    rating: 5,
  },
  {
    name: 'Vikram Rao',
    area: 'Koregaon Park',
    pet: 'Duchess and Earl (Persians)',
    text: "Two Persians done back to back in one home visit. Both properly de-matted, conditioned, nails trimmed, ears cleaned. The quality was genuinely show-standard. I've recommended Sniffy to everyone in my building with cats.",
    rating: 5,
  },
];

// ─── FAQs ────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: 'Do you cover all areas of Pune for cat grooming?',
    a: "We cover 29 localities including Wakad, Wagholi, Kothrud, Shivajinagar, Kondhwa, NIBM, Dhanori, Pimpri-Chinchwad, Baner, Kharadi, Kalyani Nagar, Viman Nagar, Hadapsar, Koregaon Park, Camp, and more. Click your area on this page to see its dedicated page.",
  },
  {
    q: 'What does a cat grooming session include?',
    a: 'Bath with cat-specific shampoo and conditioner, blow-dry on low heat, brushing and de-matting, nail trimming (front and back), ear cleaning, eye area wipe, and a coat condition assessment. Haircuts like lion cuts are available as an add-on — mention it at booking.',
  },
  {
    q: 'My cat has never been groomed professionally — will it go okay?',
    a: "First sessions are always slower and more exploratory. We let the cat investigate the tools and the groomer at their own pace, take breaks when needed, and never rush a step. It won't be perfect but it will be a gentle introduction — and each subsequent session goes more smoothly.",
  },
  {
    q: 'How is cat grooming different from dog grooming?',
    a: 'Cats require pH-balanced cat-specific shampoo (dog shampoo can be toxic to cats), low-restraint handling techniques, different drying approaches, and significantly more patience with session pacing. Our groomers are trained specifically for cat handling — not dog groomers who occasionally take cat bookings.',
  },
  {
    q: 'My cat bites and scratches — can you still groom them?',
    a: "Often yes. We use low-restraint techniques and read cat body language carefully. If a cat is genuinely distressed we pause and resume when they're ready. We never force a step. In some cases a complete session takes more than one visit — we communicate this honestly.",
  },
  {
    q: 'How often should I book for my cat?',
    a: 'Shorthair cats every 8–10 weeks. Longhair breeds like Persians and Maine Coons every 4–6 weeks to prevent matting. Outdoor cats every 4–6 weeks with a tick check. In monsoon season, all frequencies move slightly closer together because humidity accelerates coat problems.',
  },
  {
    q: 'Can you do a lion cut for my Persian?',
    a: "Yes — lion cuts and breed trims are available as add-ons. They're most useful for Persians who are mat-prone or whose owners can't maintain the full coat between sessions. Mention it when booking so we can plan enough time.",
  },
];

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

export default function CatPunePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const MOBILE_INITIAL = 6;
  const visibleLocalities = showAllLocalities ? filteredLocalities : filteredLocalities.slice(0, MOBILE_INITIAL);

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

        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 pt-14 pb-16 text-center relative overflow-hidden">
          <motion.div
            className="max-w-2xl mx-auto relative"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/70 border border-purple-200 rounded-full px-4 py-1.5 mb-6">
              <MapPin size={14} className="text-sniffy-purple" />
              <span className="text-xs font-bold text-sniffy-purple tracking-wide uppercase">Pune, Maharashtra</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-5">
              Cat Grooming at Home<br />
              <span className="text-sniffy-purple">Across Pune</span>
            </h1>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              Professional in-home cat grooming across 29 areas in Pune.
              No carrier. No salon stress. A trained groomer comes to your home.
            </p>

            <a
              href="https://g.page/r/CdJR67bjxy_gEBI/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 mb-10"
            >
              <motion.div
                className="flex -space-x-3"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
              >
                {avatarSrcs.map((src, i) => (
                  <motion.img
                    key={src}
                    src={src}
                    alt={"Happy cat owner " + (i + 1)}
                    className="w-11 h-11 rounded-full border-4 border-white object-cover shadow-md"
                    variants={avatarEntrance}
                  />
                ))}
              </motion.div>
              <div className="text-left">
                <StarRating rating={4.7} />
                <p className="text-sm font-semibold text-gray-800 mt-0.5">4.9 Customer Ratings</p>
              </div>
            </a>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto bg-sniffy-purple text-white px-9 py-3.5 rounded-2xl font-bold text-base hover:opacity-90 transition-all shadow-md"
              >
                Book a Session
              </button>
              <a
                href="https://wa.me/918971313003"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-sniffy-purple border border-sniffy-purple/40 bg-white/60 px-9 py-3.5 rounded-2xl font-semibold text-base hover:bg-purple-50 transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.508 5.84L.057 23.854a.5.5 0 0 0 .611.61l6.074-1.434A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.032-1.377l-.36-.214-3.733.882.933-3.648-.236-.374A9.861 9.861 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z"/>
                </svg>
                WhatsApp Us
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white/70 border border-gray-100 rounded-full px-3 py-1.5">
                <ShieldCheck size={12} className="text-sniffy-purple" /> Cat-trained groomers
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white/70 border border-gray-100 rounded-full px-3 py-1.5">
                <Clock size={12} className="text-sniffy-purple" /> 9 AM – 9 PM daily
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white/70 border border-gray-100 rounded-full px-3 py-1.5">
                <MapPin size={12} className="text-sniffy-purple" /> 29 areas in Pune
              </span>
            </div>
          </motion.div>
        </section>

        {/* ── Stats band ── */}
        <section className="bg-sniffy-purple px-4 py-8">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-2xl md:text-4xl font-extrabold text-sniffy-yellow mb-1">
                  {stat.number}
                </div>
                <div className="text-white/70 text-xs md:text-sm leading-snug">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Localities grid ── */}
        <section className="px-4 py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-2">Where we groom cats</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                Pick Your Area
              </h2>
              <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">
                Each locality has its own page with specific information, local FAQs, and area details.
              </p>
            </motion.div>

            {/* Search + Zone filters */}
            <div className="mb-8 space-y-3">
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

            {/* Desktop: full rich cards 4-col grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredLocalities.length === 0 ? (
                <div className="col-span-4 text-center py-12 text-gray-400 text-sm">No areas match your search.</div>
              ) : filteredLocalities.map((loc, i) => (
                <motion.a
                  key={loc.slug}
                  href={`/${loc.slug}`}
                  className="group block bg-gray-50 hover:bg-sniffy-purple/5 border border-gray-100 hover:border-sniffy-purple/20 rounded-3xl p-5 transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -3 }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-9 h-9 rounded-2xl bg-sniffy-purple/10 flex items-center justify-center flex-shrink-0">
                      <MapPin size={16} className="text-sniffy-purple" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-sniffy-yellow bg-sniffy-yellow/10 px-2 py-1 rounded-full leading-tight text-right">
                      {loc.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-1.5 group-hover:text-sniffy-purple transition-colors">
                    {loc.name}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {loc.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sniffy-purple text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    View area page →
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Mobile: compact 2-col cards */}
            <div className="sm:hidden">
              {visibleLocalities.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No areas match your search.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {visibleLocalities.map((loc, i) => (
                    <motion.a
                      key={loc.slug}
                      href={`/${loc.slug}`}
                      className="group flex flex-col bg-gray-50 active:bg-sniffy-purple/5 border border-gray-100 rounded-2xl p-4 transition-all duration-200"
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wide text-sniffy-yellow mb-2 leading-tight">
                        {loc.tag}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm mb-1 leading-snug group-active:text-sniffy-purple">
                        {loc.name}
                      </h3>
                      <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-2">
                        {loc.description}
                      </p>
                      <span className="mt-2 text-sniffy-purple text-[11px] font-semibold">
                        View →
                      </span>
                    </motion.a>
                  ))}
                </div>
              )}

              {filteredLocalities.length > MOBILE_INITIAL && (
                <div className="text-center mt-5">
                  <button
                    onClick={() => setShowAllLocalities(v => !v)}
                    className="inline-flex items-center gap-2 border border-sniffy-purple text-sniffy-purple px-6 py-2.5 rounded-full font-semibold text-sm active:bg-sniffy-purple active:text-white transition-all"
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
          </div>
        </section>

        {/* ── Packages ── */}
        <Packages onBookNow={() => setIsModalOpen(true)} showToggle={false} />

        {/* ── Why sections ── */}
        <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-2">Why it matters</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
                Cat grooming in Pune<br className="hidden md:block" /> needs a different approach
              </h2>
            </motion.div>

            <div className="space-y-8">
              {whySections.map((section, i) => (
                <motion.div
                  key={i}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={`grid md:grid-cols-5 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                    <div className={`md:col-span-2 ${i % 2 !== 0 ? 'md:order-2' : ''}`}>
                      <div className="aspect-[4/3] md:aspect-auto md:h-full overflow-hidden bg-gray-100">
                        <img
                          src={section.image}
                          alt={section.imageAlt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className={`md:col-span-3 p-6 md:p-10 flex flex-col justify-center ${i % 2 !== 0 ? 'md:order-1' : ''}`}>
                      <div className="w-8 h-1 bg-sniffy-yellow rounded-full mb-4" />
                      <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 leading-snug">
                        {section.heading}
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                        {section.body}
                      </p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-6 self-start bg-sniffy-purple text-white px-7 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-all"
                      >
                        Book a Session
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Reviews ── */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-2">From Pune cat parents</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
                What people say
              </h2>
            </motion.div>

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
                <motion.div
                  key={i}
                  className="bg-gradient-to-br from-purple-50 to-yellow-50 border border-gray-100 rounded-3xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
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
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <a
                href="https://g.page/r/CdJR67bjxy_gEBI/review"
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
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-2">Common questions</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900">FAQs</h2>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <FAQItem q={faq.q} a={faq.a} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="bg-sniffy-purple px-4 py-16 text-center">
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
              Book your cat's session today
            </h2>
            <p className="text-white/70 text-base mb-8">
              Starting ₹799 · 29 areas across Pune · 9 AM – 9 PM daily
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-sniffy-yellow text-gray-900 font-bold px-12 py-4 rounded-full text-base hover:opacity-90 transition-all shadow-lg"
            >
              Book Now
            </button>
          </motion.div>
        </section>

      </main>

      <Footer />

      <BookingWizard
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 5000);
        }}
      />
    </div>
  );
}
