/**
 * LocationStories — SEO text + image sections, fully variable per location page.
 *
 * Each page passes its own `storySections` array in LocationConfig.
 * Desktop: image left or right alternating, full text visible.
 * Mobile:  image hidden, short subheading visible, full text in accordion.
 *
 * Supports optional `bullets` array per section for breed-specific SEO content.
 */
import { motion } from 'framer-motion';
import type { LocationConfig, LocationStorySection } from './LocationHero';

// ─── Uniform rounded image ────────────────────────────────────────────────────

function UniformImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="w-full max-w-md aspect-[4/3] overflow-hidden bg-gray-100 shadow-sm mx-auto"
      style={{ borderRadius: '50px' }}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
    </div>
  );
}

// ─── Mobile accordion ─────────────────────────────────────────────────────────

function MobileAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="md:hidden group border border-gray-200 rounded-xl px-4 py-2 mt-2">
      <summary className="flex justify-between items-center cursor-pointer list-none">
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
        <span className="text-xl text-sniffy-purple transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="mt-3 text-gray-700 text-sm leading-relaxed">{children}</div>
    </details>
  );
}

// ─── Single story block ───────────────────────────────────────────────────────

function StoryBlock({
  section,
  index,
  onBookNow,
}: {
  section: LocationStorySection;
  index: number;
  onBookNow: () => void;
}) {
  const isEven = index % 2 === 0;
  const bg = isEven ? 'bg-gray-50' : 'bg-white';

  const content = (
    <div>
      <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-3 text-gray-900 leading-tight">
        {section.heading}
      </h2>

      {/* Short subheading — always visible */}
      <p className="text-gray-700 mb-1 md:mb-3 text-sm md:text-base font-medium leading-snug">
        {section.subheading}
      </p>

      {/* Desktop: paragraphs + optional bullets */}
      <div className="hidden md:block space-y-3 text-gray-600 text-base leading-relaxed">
        {section.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}

        {section.bullets && section.bullets.length > 0 && (
          <ul className="mt-4 space-y-3">
            {section.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-sniffy-yellow" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {section.closingLine && (
          <p className="mt-3 text-gray-700 font-medium">{section.closingLine}</p>
        )}
      </div>

      {/* Mobile: accordion */}
      <MobileAccordion title="Read more">
        {section.paragraphs.map((p, i) => (
          <p key={i} className={i < section.paragraphs.length - 1 ? 'mb-2' : ''}>
            {p}
          </p>
        ))}
        {section.bullets && section.bullets.length > 0 && (
          <ul className="mt-3 space-y-2">
            {section.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-sniffy-yellow" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
        {section.closingLine && (
          <p className="mt-3 font-medium">{section.closingLine}</p>
        )}
      </MobileAccordion>

      {/* CTA — desktop only */}
      <button
        onClick={onBookNow}
        className="hidden md:inline-block mt-6 bg-sniffy-purple text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-all"
      >
        Book Now
      </button>
    </div>
  );

  const image = (
    <div className="hidden md:flex justify-center">
      <UniformImage src={section.image} alt={section.imageAlt} />
    </div>
  );

  return (
    <section className={bg + ' py-4 md:py-14 px-4'}>
      <motion.div
        className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-start"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        {section.imageLeft ? (
          <>
            {image}
            {content}
          </>
        ) : (
          <>
            {content}
            {image}
          </>
        )}
      </motion.div>
    </section>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface LocationStoriesProps {
  location: LocationConfig;
  onBookNow: () => void;
}

export default function LocationStories({ location, onBookNow }: LocationStoriesProps) {
  return (
    <>
      {location.storySections.map((section, index) => (
        <StoryBlock
          key={index}
          section={section}
          index={index}
          onBookNow={onBookNow}
        />
      ))}
    </>
  );
}