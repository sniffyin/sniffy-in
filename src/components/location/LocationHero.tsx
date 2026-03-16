/**
 * LocationHero.tsx — Hero section for location-specific pages.
 * Navbar extracted to src/components/Navbar.tsx
 */

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Navbar from '../Navbar';

export interface LocationStorySection {
  heading: string;
  subheading: string;
  paragraphs: string[];
  bullets?: string[];
  closingLine?: string;
  image: string;
  imageAlt: string;
  imageLeft: boolean;
}

export interface LocationConfig {
  name: string;
  slug: string;
  heroH1: string;
  heroSubtext: string;
  storySections: LocationStorySection[];
  otherCities: { name: string; slug: string }[];
  nearbyAreas: string[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <motion.div
      className="flex gap-1 items-center"
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.18 } } }}
    >
      {[1, 2, 3, 4, 5].map((star, index) => {
        const fill = Math.max(0, Math.min(100, (rating - (star - 1)) * 100));
        return (
          <motion.div
            key={star}
            className="relative w-7 h-7"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 1.1, delay: index * 0.25 }}
          >
            <Star className="absolute w-7 h-7 text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: fill + '%' }}>
              <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

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

interface LocationHeroProps {
  location: LocationConfig;
  onOpenModal: (initialData?: { name: string; phone: string }) => void;
}

export default function LocationHero({ location, onOpenModal }: LocationHeroProps) {
  return (
    <>
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50">
        <Navbar activePath={`/dog-grooming-in-pune/${location.slug}`} />
      </header>

      <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 pt-14 pb-8 text-center">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Location capsule pill */}
          <div className="inline-flex items-center gap-2 bg-white/70 border border-purple-200 rounded-full px-4 py-1.5 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sniffy-purple"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="text-xs font-bold text-sniffy-purple tracking-wide uppercase">{location.name}, Pune</span>
          </div>

          {/* H1 — location name highlighted in purple */}
          <motion.h1
            className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            dangerouslySetInnerHTML={{
              __html: location.heroH1.replace(
                new RegExp(`(${location.name})`, 'i'),
                '<span class="text-sniffy-purple">$1</span>'
              )
            }}
          />

          {/* Subtext */}
          <motion.p
            className="text-gray-600 text-base md:text-lg leading-relaxed mb-8 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {location.heroSubtext}
          </motion.p>

          {/* Avatar + star rating */}
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

          {/* Buttons */}
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


        </motion.div>
      </section>
    </>
  );
}
