/**
 * heroSlides.tsx — single source of truth for the hero-carousel slide deck.
 *
 * The home page, both Pune master pages, and every locality page share the same
 * Flipkart-style hero carousel (see HeroCarousel.tsx). Only the FIRST slide (the
 * "lead" card with the page's own H1 + rating block) changes per page; the three
 * promo banners after it are identical everywhere. `buildHeroSlides()` stitches a
 * page-specific lead onto the shared promos so the deck stays consistent.
 */

import { type ReactNode } from "react";
import { type HeroSlide, type SlideAction } from "./HeroCarousel";
import { GOOGLE_REVIEW_URL } from '../data/siteLinks';
// One source for the rating everywhere it appears — see src/data/reputation.ts.
import { RATING_VALUE, RATING_DISPLAY, REVIEW_COUNT } from '../data/reputation';

const AVATARS = [
  "/images/review-1.jpg",
  "/images/review-2.jpg",
  "/images/review-3.jpg",
  "/images/review-4.jpg",
];

// Hero cards render full-bleed on mobile and ~1236 px on desktop. Serve an 800 px
// variant to phones and the 1200 px original to desktop. The hero-*.jpg art is
// ultra-wide (1200x514, 21:9) — the card is ~4.8:1 on desktop, so keep the
// subject in the central band. Each image ships
// with a matching "…-800.jpg" sibling (see public/images/).
/**
 * Rendered width of the hero card, per breakpoint.
 *
 * This said a flat `560px` for the desktop case, but the carousel card actually
 * fills the max-w-7xl container — ~1236 CSS px at a 1280px viewport. Declaring
 * less than half the true width made the picker choose the 800w candidate for a
 * 1236px box, so the desktop hero (the LCP element) rendered visibly soft.
 *
 * Mobile is unchanged: `sizes` is resolved per media query, so the phone still
 * asks for ~100vw and still receives the 800w file.
 */
export const HERO_SIZES =
  "(max-width: 767px) calc(100vw - 40px), (max-width: 1319px) calc(100vw - 44px), 1236px";
export const heroSrcSet = (base: string) =>
  `${base.replace(/\.jpg$/, "-800.jpg")} 800w, ${base} 1200w`;
// Same candidates, pointing at the .webp siblings (25-35% smaller). Every
// hero/promo image ships one — see public/images/*.webp — so this is safe
// for the fixed 4-image deck below. A future custom `lead.image` needs a
// matching .webp + "-800.webp" pair generated for it too.
export const heroWebpSrcSet = (base: string) => {
  const webpBase = base.replace(/\.jpg$/, ".webp");
  return `${webpBase.replace(/\.webp$/, "-800.webp")} 800w, ${webpBase} 1200w`;
};

/** Wrap the first case-insensitive occurrence of `name` in a yellow span. */
export function highlightName(text: string, name: string): ReactNode {
  const idx = text.toLowerCase().indexOf(name.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-sniffy-yellow">{text.slice(idx, idx + name.length)}</span>
      {text.slice(idx + name.length)}
    </>
  );
}

export interface HeroLead {
  /** Small kicker above the title. */
  eyebrow: string;
  /** Headline (string or JSX for coloured spans). */
  title: ReactNode;
  /** Supporting line under the title. */
  subtitle: string;
  /** Background photo for the lead card. Defaults to hero-lead. */
  image?: string;
  /**
   * Alt text for `image`. Worth setting per surface: this is the LCP image on
   * every page that renders the hero, and `title` cannot stand in for it
   * because it is JSX (a <br> plus a highlighted <span>) rather than a string.
   */
  imageAlt?: string;
}

export interface BuildHeroOptions {
  /** Where the "Explore Membership" banner links. Defaults to "#elite" — every
   *  page that renders this hero also renders the EliteMembership section
   *  (id="elite") below its packages, so the banner scrolls to it on the same page. */
  eliteAction?: SlideAction;
}

/**
 * Build the full 4-slide hero deck: a page-specific lead card followed by the
 * three shared promo banners (membership, how-it-works, guarantee).
 */
export function buildHeroSlides(lead: HeroLead, opts: BuildHeroOptions = {}): HeroSlide[] {
  const leadImage = lead.image ?? "/images/hero-lead.jpg";
  const eliteAction: SlideAction = opts.eliteAction ?? { type: "link", href: "#elite" };

  return [
    {
      variant: "hero",
      align: "left",
      image: leadImage,
      objectPosition: "55% 50%",
      srcSet: heroSrcSet(leadImage),
      webpSrcSet: heroWebpSrcSet(leadImage),
      sizes: HERO_SIZES,
      eyebrow: lead.eyebrow,
      title: lead.title,
      imageAlt: lead.imageAlt ?? 'Pet grooming at home in Pune',
      subtitle: lead.subtitle,
      avatars: AVATARS,
      rating: RATING_VALUE,
      ratingLabel: `${RATING_DISPLAY} rating · ${REVIEW_COUNT} Google reviews`,
      ratingHref: GOOGLE_REVIEW_URL,
      overlayClass: "from-sniffy-purple/90 from-0% via-sniffy-purple/55 via-40% to-transparent to-75%",
    },
    {
      variant: "banner",
      align: "right",
      image: "/images/hero-elite.jpg",
      objectPosition: "12% 50%",
      srcSet: heroSrcSet("/images/hero-elite.jpg"),
      webpSrcSet: heroWebpSrcSet("/images/hero-elite.jpg"),
      sizes: HERO_SIZES,
      eyebrow: "ELITE MEMBERSHIP",
      title: "Save More Every Groom",
      imageAlt: 'Dog being groomed at home during a Sniffy Elite membership session',
      subtitle: "Priority slots & 10% off on every service.",
      ctaLabel: "Explore Membership",
      action: eliteAction,
      overlayClass: "from-purple-900/55 from-0% via-purple-800/20 via-40% to-transparent to-75%",
    },
    {
      variant: "banner",
      align: "left",
      image: "/images/hero-how.jpg",
      objectPosition: "72% 50%",
      srcSet: heroSrcSet("/images/hero-how.jpg"),
      webpSrcSet: heroWebpSrcSet("/images/hero-how.jpg"),
      sizes: HERO_SIZES,
      eyebrow: "HOW IT WORKS",
      title: "Booked in 60 Seconds",
      imageAlt: 'Pet parent booking an at-home grooming slot with Sniffy',
      subtitle: "Pick a slot, we come to you — same-day possible.",
      action: { type: "link", href: "/how-it-works" },
      overlayClass: "from-[#2a0f52]/55 from-0% via-[#3d1a6e]/20 via-40% to-transparent to-75%",
    },
    {
      variant: "banner",
      align: "right",
      image: "/images/hero-guarantee.jpg",
      objectPosition: "18% 50%",
      srcSet: heroSrcSet("/images/hero-guarantee.jpg"),
      webpSrcSet: heroWebpSrcSet("/images/hero-guarantee.jpg"),
      sizes: HERO_SIZES,
      eyebrow: "SATISFACTION GUARANTEE",
      title: "Find Better? Your Next One's On Us",
      imageAlt: 'Groomer finishing an at-home dog grooming session in Pune',
      subtitle: "Trained groomers • 9 AM–9 PM daily.",
      action: { type: "book" },
      overlayClass: "from-indigo-900/55 from-0% via-indigo-800/20 via-40% to-transparent to-75%",
    },
  ];
}
