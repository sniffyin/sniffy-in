/**
 * StoryBlock — the one story-section presentation used by every surface that
 * renders long-form SEO copy: the home page (<HomeStories />), all 58 locality
 * pages (<LocationStories />), and both city hub pages (PunePage /
 * CatPunePage).
 *
 * ── Why it is shared ────────────────────────────────────────────────────────
 * This layout used to be copy-pasted between HomeStories.tsx and
 * LocationStories.tsx, and the two had already drifted: only the home page
 * copy grew the icon + eyebrow badge, the card treatment on mobile, and the
 * srcset on the image. The locality pages were left with a bare "Read more +"
 * accordion and an unoptimised <img>. Hub pages had a third layout entirely.
 * One component means the next change lands on all 61 pages at once.
 *
 * ── The layout contract ─────────────────────────────────────────────────────
 * Desktop: image floats left/right (alternating via `imageLeft`), body
 * clamped to a ~6-line preview with its own "Read more" toggle (full copy
 * stays in the DOM either way — see the desktop accordion below). No CTA
 * button on desktop; the persistent <FloatingActions /> speed-dial already
 * covers booking on the pages that have one. Mobile: image dropped, body
 * collapsed into a "Read more" accordion inside a white card, with an icon +
 * eyebrow label for separation — five collapsed sections would otherwise be
 * identical bands. The `mobileCta` button is mobile-only now (see its prop
 * doc) — the two hub pages still need it there since they have no floating
 * booking button of their own.
 *
 * Keep the markup here in step with `storySectionHtml()` in
 * scripts/prerenderLocationBody.ts, which emits the pre-mount static frame for
 * the generated pages.
 */
import {
  IndianRupee,
  CalendarClock,
  CloudRain,
  Cat,
  Home,
  Dog,
  HeartPulse,
  Scissors,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import type { LocationStorySection } from './location/LocationHero';
import { deriveStoryMeta } from '../data/storyMeta';

export const STORY_ICONS = {
  price: IndianRupee,
  calendar: CalendarClock,
  season: CloudRain,
  cat: Cat,
  home: Home,
  breed: Dog,
  lifestage: HeartPulse,
  services: Scissors,
  trust: ShieldCheck,
} as const;

// ─── Uniform rounded image ────────────────────────────────────────────────────

/**
 * Renders one story photo.
 *
 * The `srcset`/`sizes`/`width`/`height` here are not decoration — this <img>
 * previously carried a bare `src`, which meant every visitor downloaded the
 * 1600w original for all eight story sections regardless of screen size. On a
 * ~380px phone that was ~368 KB of pixels the device could not use, and it was
 * invisible in the prerendered HTML because scripts/prerenderLocationBody.ts →
 * storyImageHtml() already emitted a correct srcset; React then replaced that
 * correct markup with this unoptimised version on mount.
 *
 * Keep these attributes in sync with storyImageHtml(): the two render the same
 * image in the same box, and only their agreement stops the swap from being a
 * downgrade.
 */
function UniformImage({ src, alt }: { src: string; alt: string }) {
  // /images/grooming-session-2.jpg → /images/grooming-session-2-800.jpg
  const small = src.replace(/\.jpg$/, '-800.jpg');

  return (
    <div
      className="w-full max-w-md aspect-[4/3] overflow-hidden bg-gray-100 shadow-sm mx-auto"
      style={{ borderRadius: '50px' }}
    >
      <img
        src={src}
        srcSet={`${small} 800w, ${src} 1600w`}
        // The wrapper is `hidden md:block w-[36%] max-w-[320px]`, so this image
        // is display:none below 768px and never wider than 320 CSS px above it.
        // `sizes` must say that. It previously claimed `100vw`, which made the
        // browser fetch the 1600w original on phones — for an element the phone
        // does not render at all (browsers still download images inside a
        // display:none container). The `1px` branch is the standard way to tell
        // the picker "as small as you have" for that case; it resolves to the
        // 800w candidate.
        sizes="(min-width: 768px) 320px, 1px"
        width={1600}
        height={1067}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

/**
 * Cards alternate between the two brand accents purely for rhythm — five
 * identically-tinted cards in a row is what made the collapsed strip read flat.
 * Amber text is darkened well past `sniffy-yellow` itself, which fails contrast
 * on white at this size.
 */
const ACCENTS = [
  { badge: 'bg-sniffy-purple/10 text-sniffy-purple', eyebrow: 'text-sniffy-purple/80' },
  { badge: 'bg-sniffy-yellow/20 text-[#8a5c00]', eyebrow: 'text-[#8a5c00]' },
] as const;

// ─── Desktop "Read more" ──────────────────────────────────────────────────────

/**
 * Roughly 5-6 lines' worth of characters at the section's narrower,
 * beside-the-float measure. Deliberately a plain length cut rather than
 * CSS `line-clamp`: `line-clamp` needs `display: -webkit-box`, and a
 * `-webkit-box` doesn't re-measure its width per line the way ordinary text
 * does — beside a floated image it stayed pinned to the float-narrowed width
 * for its whole height instead of widening once past the image's bottom, so
 * the clamped text and the "Read more" trigger (an ordinary sibling, which
 * DOES re-measure per line) ended up in different columns. A plain substring
 * inside a normal <p> has no such box; it wraps around the float exactly
 * like every other paragraph here, so "Read more" lands right after it.
 */
const PREVIEW_CHAR_LIMIT = 480;

function truncatePreview(text: string): string | null {
  if (text.length <= PREVIEW_CHAR_LIMIT) return null;
  const cut = text.slice(0, PREVIEW_CHAR_LIMIT);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

/**
 * Desktop clamp: a short plain-text preview (paragraphs + bullets flattened
 * into one string — see `truncatePreview`) inside <summary>, with the
 * fully-structured copy as the sibling <details> body. Both stay in the DOM
 * regardless of open/closed state, same as <MobileAccordion> below — a
 * closed <details> hides content visually, not from the HTML source a
 * crawler reads. If the section is already short enough that there's
 * nothing more to reveal, skip the toggle entirely and just show it all.
 */
function DesktopAccordion({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  const truncated = truncatePreview(preview);

  if (!truncated) {
    return (
      <div className="hidden md:block space-y-2.5 text-gray-600 text-[15px] leading-[1.7]">
        {children}
      </div>
    );
  }

  return (
    <details className="hidden md:block group mt-1">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <p className="group-open:hidden text-gray-600 text-[15px] leading-[1.7]">
          {truncated}{' '}
          <span className="text-sniffy-purple font-semibold text-sm hover:underline whitespace-nowrap">
            Read more
          </span>
        </p>
        <span className="hidden group-open:inline-block text-sniffy-purple font-semibold text-sm hover:underline">
          Show less
        </span>
      </summary>
      <div className="mt-2 space-y-2.5 text-gray-600 text-[15px] leading-[1.7]">{children}</div>
    </details>
  );
}

// ─── Mobile accordion ─────────────────────────────────────────────────────────

function MobileAccordion({ children }: { children: React.ReactNode }) {
  return (
    <details className="md:hidden group mt-3">
      <summary className="flex justify-between items-center gap-3 cursor-pointer list-none rounded-xl bg-sniffy-purple/[0.06] border border-sniffy-purple/15 px-3.5 py-2.5 active:bg-sniffy-purple/10 transition-colors">
        <span className="font-semibold text-sniffy-purple text-[13px] tracking-wide">
          <span className="group-open:hidden">Read more</span>
          <span className="hidden group-open:inline">Show less</span>
        </span>
        <ChevronDown className="w-4 h-4 flex-shrink-0 text-sniffy-purple transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="mt-3 text-gray-700 text-sm leading-relaxed">{children}</div>
    </details>
  );
}

// ─── Single story block ───────────────────────────────────────────────────────

export interface StoryBlockProps {
  section: LocationStorySection;
  /** Position on the page — drives the alternating background and accent. */
  index: number;
  onBookNow: () => void;
  /** Hub pages say "Book a Session"; everywhere else "Book Now". */
  ctaLabel?: string;
  /**
   * Render a CTA button, mobile-only. Off by default — the home and locality
   * pages route through <FloatingActions />, which is always mounted there.
   *
   * The two hub pages set it. They are standalone static entries
   * (src/entries/{cat,}pune.tsx render the page component directly, not through
   * App.tsx), so FloatingActions never mounts there — their story cards were
   * the only booking buttons between the locality grid and the reviews.
   * There's no desktop button anywhere: the CTA row was the biggest
   * contributor to scroll length on desktop.
   */
  mobileCta?: boolean;
}

export default function StoryBlock({
  section,
  index,
  onBookNow,
  ctaLabel = 'Book Now',
  mobileCta = false,
}: StoryBlockProps) {
  const isEven = index % 2 === 0;
  // Desktop keeps the alternating bands; mobile is one flat strip so the white
  // cards below can read as separate blocks against it.
  const bg = isEven ? 'bg-gray-50 md:bg-gray-50' : 'bg-gray-50 md:bg-white';
  // Locality and hub sections don't hand-author these; storyMeta derives them
  // from the heading so every page gets the badge, not just the home page.
  const { eyebrow, icon } = deriveStoryMeta(section);
  const Icon = STORY_ICONS[icon];
  const accent = ACCENTS[index % ACCENTS.length];

  const content = (
    <div className="bg-white md:bg-transparent rounded-2xl md:rounded-none border border-gray-200/80 md:border-0 shadow-sm md:shadow-none p-4 md:p-0">
      <div className="flex items-center gap-2 mb-2 md:mb-4">
        <span
          className={
            'inline-flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-lg flex-shrink-0 ' +
            accent.badge
          }
        >
          <Icon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.2} />
        </span>
        <span
          className={
            'text-[11px] md:text-xs font-bold uppercase tracking-[0.14em] ' + accent.eyebrow
          }
        >
          {eyebrow}
        </span>
      </div>

      {/*
        Mobile heading is deliberately a step below desktop in both size and
        weight: at 20px/700 in a narrow card the two- and three-line headings
        read as shouting, and five stacked cards made the whole strip heavy.
        17px/600 keeps the hierarchy over the subheading without the shout.
      */}
      <h2 className="text-[17px] md:text-2xl font-semibold md:font-bold mb-1 md:mb-2 text-gray-900 leading-snug md:leading-tight">
        {section.heading}
      </h2>

      {/* Short subheading — always visible */}
      <p className="text-gray-700 mb-1 md:mb-3 text-[13px] md:text-[15px] font-normal md:font-medium leading-snug">
        {section.subheading}
      </p>

      {/* Desktop: ~6-line preview, then "Read more" reveals paragraphs + bullets */}
      <DesktopAccordion preview={[...section.paragraphs, ...(section.bullets ?? [])].join(' ')}>
        {section.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}

        {section.bullets && section.bullets.length > 0 && (
          <ul className="mt-3 space-y-2">
            {section.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-[0.5em] flex-shrink-0 w-1.5 h-1.5 rounded-full bg-sniffy-yellow" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {section.closingLine && (
          <p className="mt-3 text-gray-700 font-medium">{section.closingLine}</p>
        )}

        {section.link && (
          <p className="mt-3.5">
            <a
              href={section.link.href}
              className="text-sniffy-purple font-semibold hover:underline"
            >
              {section.link.label} →
            </a>
          </p>
        )}
      </DesktopAccordion>

      {/* Mobile: accordion */}
      <MobileAccordion>
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
        {section.closingLine && <p className="mt-3 font-medium">{section.closingLine}</p>}
        {section.link && (
          <p className="mt-3">
            <a href={section.link.href} className="text-sniffy-purple font-semibold underline">
              {section.link.label} →
            </a>
          </p>
        )}
      </MobileAccordion>

      {/* CTA — mobile-only, and only on surfaces with no other mobile booking path */}
      {mobileCta && (
        <button
          onClick={onBookNow}
          className="md:hidden inline-block mt-4 px-6 py-2.5 text-sm bg-sniffy-purple text-white rounded-full font-semibold hover:opacity-90 transition-all"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );

  /**
   * Desktop image is FLOATED, not a grid column.
   *
   * These sections vary wildly in length — the "services explained" block runs
   * ~560 words of bullets against a 4:3 image — and a rigid `md:grid-cols-2`
   * left a tall empty column beside the shorter of the two. Floating lets the
   * copy wrap past the image and reclaim that space.
   *
   * The bullet `<li>`s are flex containers, which establish a block formatting
   * context, so they shrink beside the float and go full width below it rather
   * than sliding under the image. That holds for a left or a right float, which
   * is why the alternating rhythm still works.
   */
  const image = section.image ? (
    <div
      className={
        'hidden md:block w-[36%] max-w-[320px] mb-4 ' +
        (section.imageLeft ? 'float-left mr-7' : 'float-right ml-7')
      }
    >
      <UniformImage src={section.image} alt={section.imageAlt} />
    </div>
  ) : null;

  return (
    <section className={bg + ' py-1.5 md:py-10 px-3 md:px-4'}>
      {/*
        Capped at max-w-4xl, NOT max-w-7xl. Lines that run below the float take
        the container's full width, and at 1280px that measured 138–161
        characters per line — roughly double the 60–80 that reads comfortably.
        896px keeps it near ~80 beside the image and ~110 below it.
        flow-root contains the float so it cannot bleed into the next section.
      */}
      <div className="max-w-4xl mx-auto md:flow-root">
        {image}
        {content}
      </div>
    </section>
  );
}
