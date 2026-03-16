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

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, ChevronDown, ChevronUp, ShieldCheck, Clock } from 'lucide-react';
import { ALL_PUNE_CITIES } from '../data/locationData';

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
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookingWizard from '../components/BookingWizard';
import Toast from '../components/Toast';
import Packages from '../components/Packages';

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

// ─── Stats ──────────────────────────────────────────────────────────────────

const stats = [
  { number: '1,500+', label: 'Sessions done in Pune' },
  { number: '4.9',    label: 'Average rating on Google' },
  { number: '8',      label: 'Areas covered across Pune' },
  { number: '₹799',   label: 'Starting price per session' },
];

// ─── Why sections ────────────────────────────────────────────────────────────

const whySections = [
  {
    heading: 'Pune\'s climate is harder on coats than most people realise',
    body: "The city runs warm and dusty for most of the year, and then spends three months being genuinely humid during monsoon. That combination — dust buildup in summer, damp fur in monsoon — makes skin and coat problems more likely here than in cities with more moderate weather. Dogs pick up road dust every walk, oils accumulate faster in the heat, and wet fur that doesn't dry properly in closed apartments leads to fungal issues we see regularly.",
    image: '/images/grooming-session-1.jpg',
    imageAlt: 'Dog grooming in Pune home',
  },
  {
    heading: 'Home grooming isn\'t a luxury here — it makes practical sense',
    body: "Pune traffic is real. Driving a dog to a salon in Kothrud when you live in Wagholi, waiting an hour or two, driving back — that's easily a half day gone. And the dog has spent those hours in a cage surrounded by strangers and other animals. At-home grooming removes all of that. The groomer comes to you, works in your space, your dog stays calm, and you're not stuck driving anywhere.",
    image: '/images/grooming-session-2.jpg',
    imageAlt: 'Professional home dog grooming Pune',
  },
  {
    heading: 'We cover the whole city — one standard, not eight different ones',
    body: "Every groomer across all eight areas is trained and equipped the same way. The session your dog gets in Wakad is the same session they'd get in Kondhwa or Dhanori. Same shampoos, same tools, same approach. We don't have franchise inconsistency because we're not a franchise — it's one team with one standard across Pune.",
    image: '/images/grooming-session-3.jpg',
    imageAlt: 'Sniffy dog grooming across Pune localities',
  },
];

// ─── FAQs ────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: 'Do you cover all areas of Pune?',
    a: "We offer doorstep dog grooming across Pune, including Wakad, Wagholi, Kothrud, Shivajinagar, Kondhwa, NIBM, Dhanori and Pimpri-Chinchwad. We're adding more areas regularly — if you're not in our coverage zone yet, you can still fill the form and we'll let you know when we reach you.",
  },
  {
    q: 'What does a standard session include?',
    a: 'Bath with shampoo and conditioner, blow dry, brushing, nail clipping, eye and ear cleaning, paw massage, mouth spray, and a light perfume spritz. For breeds with specific coat needs we adjust technique accordingly.',
  },
  {
    q: 'How long does a session take?',
    a: 'Between 1.5 and 3 hours depending on breed, coat type and temperament. Smaller short-haired dogs are quicker. Large breeds with thick coats take longer. Your groomer will give you a time estimate when they arrive.',
  },
  {
    q: 'What if my dog is anxious or has never been groomed before?',
    a: "Tell us when you book. We'll send a groomer who's experienced with anxious dogs and allow extra time. First sessions are always slower — we let the dog settle, start with the least invasive things, and take breaks when needed. Most dogs are significantly more relaxed by their second or third session.",
  },
  {
    q: 'How is this different from a salon?',
    a: "At a salon your dog is caged between steps, surrounded by other animals, and sharing one groomer's attention with multiple dogs. At home there's no travel stress, no cage, no other animals, and one groomer focused entirely on your dog for the whole session.",
  },
  {
    q: 'How often should I book?',
    a: "Depends on the breed. Short-haired dogs: every 6–8 weeks. Medium coats like Goldens: every 4–6 weeks. Double-coated breeds like Huskies: every 3–4 weeks. Continuously growing coats like Poodles or Shih Tzus: every 3–4 weeks for a bath, haircut every 6–8 weeks. In monsoon, bump all of these slightly more frequent.",
  },
];

// ─── Reviews (pune-wide, mix of localities) ──────────────────────────────────

const reviews = [
  {
    name: 'Priya Kulkarni',
    area: 'Wakad',
    pet: 'Bruno (Golden Retriever)',
    text: "Bruno used to get anxious at the salon — car rides, the cage, other dogs barking. The first home session he was a different dog. Calmer, finished faster, no drama. We've been booking monthly since.",
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    area: 'Kothrud',
    pet: 'Luna (Husky)',
    text: "I'd been told by another groomer that Luna needs to be shaved for summer. Sniffy explained why that's actually harmful and did a proper deshedding instead. The amount of fur that came out was unreal. She's been so much more comfortable since.",
    rating: 5,
  },
  {
    name: 'Sneha Joshi',
    area: 'NIBM',
    pet: 'Coco (Shih Tzu)',
    text: "Coco gets groomed every 4 weeks now. Before Sniffy I was going to a salon in Kondhwa which was a whole production every time. Now it happens at home while I'm working. Simpler, and Coco is way less stressed.",
    rating: 5,
  },
  {
    name: 'Amit Desai',
    area: 'Wagholi',
    pet: 'Max (Labrador)',
    text: "Honest, punctual, does a good job. Max smells great for weeks after a session. The groomer noticed a small skin irritation we hadn't spotted and flagged it. That kind of attention you don't get at a busy salon.",
    rating: 5,
  },
];

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

export default function PunePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const MOBILE_INITIAL = 6;
  const visibleLocalities = showAllLocalities ? filteredLocalities : filteredLocalities.slice(0, MOBILE_INITIAL);

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

        {/* ── Hero — full-width centered, no split form ── */}
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
              Dog Grooming at Home<br />
              <span className="text-sniffy-purple">Across Pune</span>
            </h1>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              Doorstep pet grooming services across Pune.
              Trained groomers visit your home — fully equipped, on time, no salon stress.
            </p>

            {/* Locality-style avatar + star rating */}
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
                    alt={"Happy customer " + (i + 1)}
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

            {/* Buttons — primary solid, secondary ghost with reduced weight */}
            <div className="flex flex-row gap-3 justify-center items-center">
            <button
              onClick={() => onOpenModal()}
              className="flex-1 sm:flex-none bg-sniffy-purple text-white px-6 py-3.5 rounded-full font-bold text-base hover:opacity-90 transition-all shadow-md"
            >
              Book a Session
            </button>
            <a
              href="https://wa.me/918971313003"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sniffy-purple border border-sniffy-purple/40 bg-white/60 px-6 py-3.5 rounded-full font-semibold text-base hover:bg-purple-50 transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.508 5.84L.057 23.854a.5.5 0 0 0 .611.61l6.074-1.434A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.032-1.377l-.36-.214-3.733.882.933-3.648-.236-.374A9.861 9.861 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>

            {/* Trust chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white/70 border border-gray-100 rounded-full px-3 py-1.5">
                <ShieldCheck size={12} className="text-sniffy-purple" /> Trained groomers
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white/70 border border-gray-100 rounded-full px-3 py-1.5">
                <Clock size={12} className="text-sniffy-purple" /> 9 AM – 9 PM daily
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white/70 border border-gray-100 rounded-full px-3 py-1.5">
                <MapPin size={12} className="text-sniffy-purple" /> Available across Pune
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
              <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-2">Where we operate</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                Pick Your Area
              </h2>
              <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">
                Each area has its own page with local information, pricing, and area-specific details.
              </p>
            </motion.div>

            {/* Search + Zone filters */}
            <div className="mb-8 space-y-3">
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

            {/* Mobile: compact 2-col cards with show more */}
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
                    {showAllLocalities
                      ? 'Show less'
                      : `Show all areas`}
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

        {/* ── Why sections — full text, no accordion, different layout from LocationStories ── */}
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
                Grooming in Pune is a<br className="hidden md:block" /> bit different
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
                    {/* Image — 2 cols on desktop */}
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
                    {/* Text — 3 cols on desktop */}
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

        {/* ── Reviews — horizontal scroll on mobile, grid on desktop ── */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-2">From Pune pet parents</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
                What people say
              </h2>
            </motion.div>

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
              Book your dog's session today
            </h2>
            <p className="text-white/70 text-base mb-8">
              Starting ₹799 · Available across Pune · 9 AM – 9 PM daily
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
