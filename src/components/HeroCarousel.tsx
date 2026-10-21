import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Star } from "lucide-react";

/**
 * HeroCarousel — Flipkart-style promotional card carousel.
 *
 * A horizontal track of uniform cards that translates one card per step:
 *   • Mobile  → 1 card per view (full width).
 *   • Desktop → ~2.2 cards per view, so the 3rd card peeks ~20% at the edge
 *               (exactly the Flipkart desktop banner strip).
 *
 * Two card styles:
 *   • `variant: 'hero'`   — light brand-gradient card with copy + optional
 *                           avatar/star-rating block (the doorstep intro).
 *   • `variant: 'banner'` — image backdrop + gradient overlay + CTA. Default.
 *
 * Auto-advances (setInterval) with a CSS progress bar on the active pill,
 * pauses on hover, supports swipe + desktop arrows, and each banner card is
 * fully clickable. Respects `prefers-reduced-motion`. Reusable via `slides`.
 */

export type SlideAction =
  | { type: "book" }
  | { type: "link"; href: string };

export interface HeroSlide {
  /** Visual style. Default 'banner'. */
  variant?: "hero" | "banner";
  /** Which side the copy sits on. Default 'left'. Mix across slides for rhythm. */
  align?: "left" | "right";
  /** Background image (banner variant). */
  image?: string;
  /**
   * Alt text for `image`. Needed because `title` is a ReactNode on most
   * surfaces (it carries a <br> and a highlighted <span>), so the old
   * `typeof title === "string"` fallback silently produced alt="" — including
   * on the home page's LCP image.
   */
  imageAlt?: string;
  /** Responsive candidates for `image` (e.g. "…-800.jpg 800w, ….jpg 1600w"). */
  srcSet?: string;
  /** Same candidates as `srcSet` but pointing at the .webp siblings — 25-35%
   *  smaller than the .jpg equivalents. Rendered as a <picture> <source> so
   *  browsers without webp support silently fall back to `image`/`srcSet`. */
  webpSrcSet?: string;
  /** `sizes` attribute describing the rendered width at each breakpoint. */
  sizes?: string;
  /** Small kicker/eyebrow line above the title. */
  eyebrow?: string;
  /** Bold headline (string or JSX for coloured spans). */
  title: ReactNode;
  /** Optional supporting line. */
  subtitle?: string;
  /** CTA button label. Omit to hide it. */
  ctaLabel?: string;
  /** What tapping the card / CTA does. Omit → card isn't whole-card clickable. */
  action?: SlideAction;
  /** Tailwind gradient classes for the overlay (banner variant). */
  overlayClass?: string;
  /** CSS object-position for the photo, e.g. "15% 50%". The card is as narrow as
   *  ~1.15:1 on small phones, so object-cover trims the 21:9 art from both sides;
   *  this keeps the people on the side the copy isn't covering. Only the
   *  horizontal value matters — it is a no-op once the card is wide enough that
   *  nothing is cropped sideways. */
  objectPosition?: string;

  // ── hero-variant extras ──────────────────────────────────────────────────
  /** Overlapping round avatar image paths. */
  avatars?: string[];
  /** Star rating value (0–5). */
  rating?: number;
  /** Label under the stars, e.g. "4.9 Customer Ratings". */
  ratingLabel?: string;
  /** Wrap the avatar/rating block in a link (e.g. Google reviews). */
  ratingHref?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  /** Auto-advance interval in ms. Default 4500. */
  interval?: number;
  /** Called when a card's action is `{ type: 'book' }`. */
  onBook?: () => void;
  /** Extra classes for the outer <section> (e.g. background). */
  className?: string;
}

// Card width as a % of the track, per breakpoint. Desktop 44% → 2 full cards +
// a ~12% peek of the 3rd. Mobile 100% → one card at a time.
const CARD_BASIS_MOBILE = 100;
const CARD_BASIS_DESKTOP = 44;

// ── Inline star row (clip-based partial fill) ────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(100, (rating - (star - 1)) * 100));
        return (
          <span key={star} className="relative inline-block w-4 h-4">
            <Star className="absolute w-4 h-4 text-gray-300" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill}%` }}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default function HeroCarousel({
  slides,
  interval = 4500,
  onBook,
  className = "",
}: HeroCarouselProps) {
  const data = slides;
  const count = data.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const swipedRef = useRef(false); // suppress the tap-click that ends a swipe

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // ── Cards-per-view is responsive (1 on mobile, ~2.2 on desktop) ───────────
  const [basis, setBasis] = useState(CARD_BASIS_MOBILE);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () =>
      setBasis(mq.matches ? CARD_BASIS_DESKTOP : CARD_BASIS_MOBILE);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Scroll geometry: translate one card per index, clamped so the last card
  // sits flush to the right edge (no trailing empty gap).
  const totalTrack = count * basis;
  const maxTranslate = Math.max(0, totalTrack - 100);
  const maxIndex = Math.ceil(maxTranslate / basis);
  const positions = maxIndex + 1;
  const translate = Math.min(index * basis, maxTranslate);

  // Keep index in range when the breakpoint changes.
  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const goTo = useCallback(
    (next: number) => setIndex(((next % positions) + positions) % positions),
    [positions]
  );
  const next = useCallback(() => goTo(index + 1), [index, goTo]);
  const prev = useCallback(() => goTo(index - 1), [index, goTo]);

  const runAction = useCallback(
    (action?: SlideAction) => {
      if (!action) return;
      if (action.type === "book") {
        onBook?.();
        return;
      }
      const href = action.href;
      if (/^https?:\/\//.test(href)) {
        window.open(href, "_blank", "noopener,noreferrer");
      } else if (href.startsWith("#")) {
        document
          .querySelector(href)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Plain navigation (full load). HeroCarousel is rendered both inside the
        // SPA Router (home) and as standalone static islands (locality/Pune
        // pages) that have no Router, so we can't rely on useNavigate here.
        window.location.assign(href);
      }
    },
    [onBook]
  );

  // ── Auto-advance (setInterval; CSS drives the pill's fill) ────────────────
  useEffect(() => {
    if (paused || positions <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % positions);
    }, interval);
    return () => window.clearInterval(id);
  }, [paused, positions, interval, index]);

  // ── Touch swipe ───────────────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    swipedRef.current = false;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      swipedRef.current = true;
      (delta < 0 ? next : prev)();
    }
    touchStartX.current = null;
  };

  return (
    <section
      className={`px-4 pt-2 pb-2 ${className}`}
      aria-roledescription="carousel"
      aria-label="Sniffy highlights"
    >
      <div
        className="relative max-w-7xl mx-auto"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Track viewport */}
        <div className="overflow-hidden">
          <div
            className="flex"
            style={{
              transform: `translate3d(-${translate}%, 0, 0)`,
              transition: reducedMotion
                ? "none"
                : "transform 500ms cubic-bezier(0.22,1,0.36,1)",
              willChange: "transform",
              backfaceVisibility: "hidden",
            }}
          >
            {data.map((slide, i) => (
              <div
                key={i}
                className="shrink-0 box-border pr-3"
                style={{ flexBasis: `${basis}%`, width: `${basis}%` }}
              >
                <Card slide={slide} eager={i === 0} runAction={runAction} swipedRef={swipedRef} />
              </div>
            ))}
          </div>
        </div>

        {/* Pill indicators — active pill fills as a progress bar */}
        {positions > 1 && (
          <div className="flex justify-center items-center gap-2 mt-3">
            {Array.from({ length: positions }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to position ${i + 1}`}
                aria-current={i === index}
                className={`h-3 rounded-full transition-all duration-300 overflow-hidden ${
                  i === index
                    ? "w-12 bg-sniffy-purple/25"
                    : "w-3 bg-gray-300 hover:bg-gray-400"
                }`}
              >
                {i === index && (
                  <span
                    key={index}
                    className="block h-full bg-sniffy-purple rounded-full"
                    style={{
                      width: "0%",
                      animation: `heroPillFill ${interval}ms linear forwards`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── A single card (hero or banner) ───────────────────────────────────────────
function Card({
  slide,
  eager,
  runAction,
  swipedRef,
}: {
  slide: HeroSlide;
  eager: boolean;
  runAction: (a?: SlideAction) => void;
  swipedRef: React.MutableRefObject<boolean>;
}) {
  const isHero = slide.variant === "hero";
  const alignRight = slide.align === "right";
  const colAlign = alignRight
    ? "items-end text-right ml-auto"
    : "items-start text-left mr-auto";

  return (
    <div className="relative w-full h-[240px] sm:h-56 md:h-64 rounded-2xl overflow-hidden shadow-md">
      {isHero ? (
        // ── Hero content card (photo + purple overlay, matches banners) ────
        <>
          {slide.image && (
            <picture>
              {slide.webpSrcSet && <source type="image/webp" srcSet={slide.webpSrcSet} sizes={slide.sizes} />}
              <img
                src={slide.image}
                srcSet={slide.srcSet}
                sizes={slide.sizes}
                alt={slide.imageAlt ?? (typeof slide.title === "string" ? slide.title : "")}
                width={1600}
                height={1067}
                className="absolute inset-0 w-full h-full object-cover"
                style={slide.objectPosition ? { objectPosition: slide.objectPosition } : undefined}
                loading={eager ? "eager" : "lazy"}
                // react-dom 18.3 doesn't map camelCase fetchPriority; use the
                // lowercase HTML attribute so the browser gets the LCP hint
                // without a dev-only "unrecognized prop" warning.
                {...(eager ? { fetchpriority: "high" } : {})}
                decoding="async"
              />
            </picture>
          )}
          <div
            className={`absolute inset-0 ${
              alignRight ? "bg-gradient-to-l" : "bg-gradient-to-r"
            } ${
              slide.overlayClass ??
              "from-sniffy-purple/95 via-sniffy-purple/75 to-sniffy-purple/20"
            }`}
          />
          <div
            className={`relative z-20 h-full flex flex-col justify-end pb-5 sm:pb-6 px-5 sm:px-7 max-w-[84%] sm:max-w-[64%] ${colAlign} [text-shadow:0_1px_10px_rgba(20,5,45,0.55)]`}
          >
            {slide.eyebrow && (
              <span className="text-[10px] sm:text-xs font-bold tracking-widest text-sniffy-yellow uppercase mb-1.5">
                {slide.eyebrow}
              </span>
            )}
            <h1 className="text-xl sm:text-[1.4rem] md:text-2xl font-bold text-white leading-[1.12] mb-2 line-clamp-3">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-white/90 text-xs sm:text-[13px] leading-snug mb-3 max-w-md line-clamp-3">
                {slide.subtitle}
              </p>
            )}
            {(slide.avatars?.length || slide.rating != null) && (
              <RatingBlock
                avatars={slide.avatars}
                rating={slide.rating}
                label={slide.ratingLabel}
                href={slide.ratingHref}
                alignRight={alignRight}
                onDark
              />
            )}
          </div>
        </>
      ) : (
        // ── Promo banner card (image + overlay) ───────────────────────────
        <>
          {slide.image && (
            <picture>
              {slide.webpSrcSet && <source type="image/webp" srcSet={slide.webpSrcSet} sizes={slide.sizes} />}
              <img
                src={slide.image}
                srcSet={slide.srcSet}
                sizes={slide.sizes}
                alt={slide.imageAlt ?? (typeof slide.title === "string" ? slide.title : "")}
                width={1600}
                height={1067}
                className="absolute inset-0 w-full h-full object-cover"
                style={slide.objectPosition ? { objectPosition: slide.objectPosition } : undefined}
                loading={eager ? "eager" : "lazy"}
                {...(eager ? { fetchpriority: "high" } : {})}
                decoding="async"
              />
            </picture>
          )}
          <div
            className={`absolute inset-0 ${
              alignRight ? "bg-gradient-to-l" : "bg-gradient-to-r"
            } ${
              slide.overlayClass ??
              "from-sniffy-purple/95 via-sniffy-purple/70 to-transparent"
            }`}
          />
          {/* Corner scrim: darkens only the bottom corner behind the copy so the
              small text stays legible while the rest of the photo stays bright. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(ellipse 90% 85% at ${
                alignRight ? "100%" : "0%"
              } 100%, rgba(28,8,66,0.9) 0%, rgba(28,8,66,0.72) 35%, rgba(28,8,66,0.35) 65%, rgba(28,8,66,0) 100%)`,
            }}
          />
          <div
            className={`relative z-20 pointer-events-none h-full flex flex-col justify-end pb-5 sm:pb-6 px-5 sm:px-7 max-w-[80%] sm:max-w-[62%] ${colAlign} [text-shadow:0_1px_10px_rgba(20,5,45,0.55)]`}
          >
            {slide.eyebrow && (
              <span className="text-[10px] sm:text-xs font-bold tracking-widest text-sniffy-yellow uppercase mb-1.5">
                {slide.eyebrow}
              </span>
            )}
            <h2 className="text-lg sm:text-lg md:text-xl font-bold text-white leading-tight">
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="text-white/90 text-xs sm:text-[13px] mt-1.5 line-clamp-2">
                {slide.subtitle}
              </p>
            )}
            {slide.ctaLabel && (
              <span className="mt-2.5 inline-flex items-center bg-sniffy-yellow text-sniffy-purple px-4 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-[13px] shadow-md [text-shadow:none]">
                {slide.ctaLabel}
              </span>
            )}
          </div>
          {slide.action && (
            <button
              type="button"
              aria-label={slide.ctaLabel ?? (typeof slide.title === "string" ? slide.title : "Open")}
              onClick={() => {
                if (swipedRef.current) {
                  swipedRef.current = false;
                  return;
                }
                runAction(slide.action);
              }}
              className="absolute inset-0 z-10 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-sniffy-yellow/60 rounded-2xl"
            />
          )}
        </>
      )}
    </div>
  );
}

// ── Avatar + rating block (hero variant) ─────────────────────────────────────
function RatingBlock({
  avatars,
  rating,
  label,
  href,
  alignRight = false,
  onDark = false,
}: {
  avatars?: string[];
  rating?: number;
  label?: string;
  href?: string;
  alignRight?: boolean;
  onDark?: boolean;
}) {
  const inner = (
    <>
      {avatars && avatars.length > 0 && (
        <div className="flex -space-x-2.5">
          {avatars.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={"Happy customer " + (i + 1)}
              width={36}
              height={36}
              loading="lazy"
              decoding="async"
              className="w-9 h-9 rounded-full border-[3px] border-white object-cover shadow-md"
            />
          ))}
        </div>
      )}
      <div className={alignRight ? "text-right" : "text-left"}>
        {rating != null && (
          <div className={alignRight ? "flex justify-end" : ""}>
            <Stars rating={rating} />
          </div>
        )}
        {label && (
          <p
            className={`text-xs sm:text-sm font-semibold mt-0.5 ${
              onDark ? "text-white" : "text-gray-800"
            }`}
          >
            {label}
          </p>
        )}
      </div>
    </>
  );

  const cls = `inline-flex items-center gap-3.5 ${
    alignRight ? "flex-row-reverse" : ""
  }`;

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
