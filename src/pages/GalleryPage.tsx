/**
 * GalleryPage — Standalone photo gallery of real grooming session photos.
 * Header + Footer + a responsive grid with a click-to-enlarge lightbox.
 *
 * Photos are admin-managed (see admin/GalleryTab.tsx) and stored in
 * Supabase (`gallery_photos` table + `groomer-uploads` bucket) — this page
 * only reads, ordered by the admin's chosen sort_order.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSeo } from '../lib/useSeo';
import { SEO_ROUTES } from '../data/seoRoutes';
import { fetchGalleryPhotos, type GalleryPhoto } from '../lib/galleryApi';

export default function GalleryPage() {
  useSeo(SEO_ROUTES.gallery);

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchGalleryPhotos()
      .then((rows) => { if (!cancelled) setPhotos(rows); })
      .catch((err) => console.error('gallery fetch failed:', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const close = () => setActiveIndex(null);
  const showPrev = () =>
    setActiveIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
  const showNext = () =>
    setActiveIndex((i) => (i === null ? i : (i + 1) % photos.length));

  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex]);

  const active = activeIndex !== null ? photos[activeIndex] : null;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Navbar activePath="/gallery" />
      </header>

      <main>
        {/* ── Hero ──
            Kept short on mobile — this is a photo page, the copy's only
            job is to set context before the grid, not hold the fold. */}
        <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 py-6 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-1.5 md:mb-4">Gallery</p>
            <h1 className="text-xl md:text-5xl font-bold text-gray-900 leading-tight mb-1.5 md:mb-6">
              Real grooming sessions, <span className="text-sniffy-purple">real Pune pets</span>
            </h1>
            <p className="text-gray-600 text-xs md:text-lg leading-relaxed max-w-2xl mx-auto">
              Tap any photo for a closer look.
            </p>
          </div>
        </section>

        {/* ── Grid ── */}
        <section className="bg-white py-6 md:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] rounded-2xl md:rounded-[28px] bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : photos.length === 0 ? (
              <div className="flex flex-col items-center text-center py-20 text-gray-400">
                <Camera size={40} className="mb-4" />
                <p className="text-lg font-medium">Photos coming soon</p>
                <p className="text-sm mt-1">We're adding session photos here shortly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {photos.map((photo, i) => (
                  <motion.button
                    key={photo.id}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative aspect-[4/3] rounded-2xl md:rounded-[28px] overflow-hidden shadow-md group bg-gray-100 text-left"
                  >
                    <img
                      src={photo.public_url}
                      alt={photo.caption ?? 'At-home dog and cat grooming session in Pune by Sniffy'}
                      className="w-full h-full object-cover"
                      loading={i < 6 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium leading-snug">{photo.caption}</p>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-white px-4 pb-16 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Want your pet featured here next?</h2>
            <p className="text-gray-500 text-base mb-8">Book a session and let our groomers work their magic at your doorstep.</p>
            <a
              href="/#booking"
              className="inline-block bg-sniffy-purple text-white font-bold px-10 py-4 rounded-full text-base hover:opacity-90 transition-all shadow-lg"
            >
              Book a Grooming Session
            </a>
          </div>
        </section>
      </main>

      <Footer />

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4"
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={28} />
            </button>

            {photos.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                aria-label="Previous photo"
                className="absolute left-2 md:left-6 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            <motion.div
              key={active.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-4xl max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={active.public_url}
                alt={active.caption ?? 'At-home dog and cat grooming session in Pune by Sniffy'}
                className="max-w-full max-h-[75vh] rounded-xl object-contain shadow-2xl"
              />
              {active.caption && (
                <p className="text-white/80 text-sm mt-4 text-center">{active.caption}</p>
              )}
            </motion.div>

            {photos.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); showNext(); }}
                aria-label="Next photo"
                className="absolute right-2 md:right-6 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <ChevronRight size={32} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
