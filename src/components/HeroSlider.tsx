/**
 * HeroSlider.tsx — the full hero block shared by the home page, both Pune master
 * pages, and every locality page: the promotional card carousel followed by the
 * Book / WhatsApp CTA row and a set of trust chips.
 *
 * Each surface supplies its own `slides` (built via buildHeroSlides) and its own
 * trust `chips`; the layout/animation is identical everywhere so the hero looks
 * the same across the whole marketing site. The page owns the <header>/Navbar —
 * this component only renders the hero <section> body.
 */

import { type LucideIcon } from "lucide-react";
import HeroCarousel, { type HeroSlide } from "./HeroCarousel";

export interface HeroChip {
  icon: LucideIcon;
  label: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  /** Fired when a slide's action is `{ type: 'book' }` and by the CTA button. */
  onBook: () => void;
  /** Trust chips shown under the CTA row. */
  chips?: HeroChip[];
  /** Home hides the chips on mobile; locality/Pune pages show them. Default false. */
  hideChipsOnMobile?: boolean;
  /** Background/spacing for the outer <section>. */
  sectionClassName?: string;
}

export default function HeroSlider({
  slides,
  onBook,
  chips = [],
  hideChipsOnMobile = false,
  sectionClassName = "bg-gradient-to-b from-purple-200/70 via-purple-100/60 to-white pt-4 pb-3 md:pb-5 relative overflow-hidden",
}: HeroSliderProps) {
  return (
    <section className={sectionClassName}>
      {/* Hero slider — first slide carries this page's H1 + rating block */}
      <HeroCarousel slides={slides} onBook={onBook} className="bg-transparent" />

      {/* CTA row — lives below the slider, always visible regardless of slide.
          Was framer-motion (opacity/y fade-in); CSS-only (animate-hero-cta-fade-in-up)
          so HeroSlider — part of the home page's critical path — doesn't force
          framer-motion into the eager bundle just for this entrance flourish. */}
      <div className="max-w-2xl mx-auto px-4 animate-hero-cta-fade-in-up">
        <div className="flex flex-row gap-4 sm:gap-5 justify-center items-center mt-3 md:mt-5">
          <button
            onClick={onBook}
            className="flex-1 sm:flex-none whitespace-nowrap bg-sniffy-purple text-white px-5 sm:px-9 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base hover:opacity-90 transition-all shadow-md"
          >
            Book a Session
          </button>
          <a
            href="https://wa.me/918971313003"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none whitespace-nowrap flex items-center justify-center gap-2 text-sniffy-purple border border-sniffy-purple/40 bg-white/60 px-5 sm:px-9 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base hover:bg-purple-50 transition-all"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-current flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.508 5.84L.057 23.854a.5.5 0 0 0 .611.61l6.074-1.434A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.032-1.377l-.36-.214-3.733.882.933-3.648-.236-.374A9.861 9.861 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z" />
            </svg>
            WhatsApp Us
          </a>
        </div>

        {/* Trust chips */}
        {chips.length > 0 && (
          <div
            className={`${
              hideChipsOnMobile ? "hidden sm:flex" : "flex"
            } flex-wrap justify-center gap-3 mt-4`}
          >
            {chips.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white/70 border border-gray-100 rounded-full px-3 py-1.5"
              >
                <Icon size={12} className="text-sniffy-purple" /> {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
