/**
 * GalleryPeek — small home page teaser for the public /gallery page.
 *
 * A tight grid of small thumbnails pulled from the same admin-managed
 * gallery_photos table the /gallery page itself reads (lib/galleryApi.ts).
 * The whole grid is one link out to /gallery; renders nothing while there
 * are zero photos yet, so an empty gallery doesn't leave an awkward blank
 * section on the home page.
 */

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { fetchGalleryPhotos, type GalleryPhoto } from '../lib/galleryApi';

const PEEK_COUNT = 12;

export default function GalleryPeek() {
  // null = still loading (renders a skeleton, not nothing — avoids a
  // layout jump once the fetch resolves).
  const [photos, setPhotos] = useState<GalleryPhoto[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchGalleryPhotos(PEEK_COUNT)
      .then((rows) => { if (!cancelled) setPhotos(rows); })
      .catch((err) => {
        console.error('gallery peek fetch failed:', err);
        if (!cancelled) setPhotos([]);
      });
    return () => { cancelled = true; };
  }, []);

  if (photos !== null && photos.length === 0) return null;

  return (
    <section className="py-14 md:py-20 px-4 bg-gradient-to-b from-white to-purple-50/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-2">Gallery</p>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            A peek into our <span className="text-sniffy-purple">gallery</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base">Real grooming sessions, real Pune pets.</p>
        </div>

        {photos === null ? (
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {Array.from({ length: PEEK_COUNT }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl md:rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <a
            href="/gallery"
            aria-label="View full photo gallery"
            className="group relative grid grid-cols-4 gap-2 md:gap-3 rounded-2xl md:rounded-[28px] overflow-hidden"
          >
            {photos.map((photo) => (
              <div key={photo.id} className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={photo.public_url}
                  alt={photo.caption ?? 'At-home dog and cat grooming session in Pune by Sniffy'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}

            {/* Hover overlay — desktop only, touch devices rely on the button below. */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors hidden md:flex items-center justify-center pointer-events-none">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-lg flex items-center gap-2">
                View Full Gallery <ArrowRight size={20} />
              </span>
            </div>
          </a>
        )}

        <div className="text-center mt-6 md:mt-8">
          <a
            href="/gallery"
            className="inline-flex items-center gap-2 bg-sniffy-purple text-white font-bold px-8 py-3.5 rounded-full text-sm hover:opacity-90 transition-all shadow-lg"
          >
            View Full Gallery <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
