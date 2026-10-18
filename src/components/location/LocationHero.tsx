/**
 * LocationHero.tsx — Hero section for location-specific pages (dog & cat
 * localities both hydrate LocationPage, so this drives every locality page).
 *
 * Uses the same Flipkart-style hero carousel as the home page (HeroSlider):
 * the first slide carries this locality's H1 + rating; the rest are the shared
 * promo banners. Navbar extracted to src/components/Navbar.tsx.
 */

import { ShieldCheck, Clock, MapPin } from 'lucide-react';
import Navbar from '../Navbar';
import HeroSlider, { type HeroChip } from '../HeroSlider';
import { buildHeroSlides, highlightName } from '../heroSlides';

export interface LocationStorySection {
  heading: string;
  subheading: string;
  paragraphs: string[];
  bullets?: string[];
  closingLine?: string;
  image: string;
  imageAlt: string;
  imageLeft: boolean;
  /**
   * Optional contextual link to deeper content, rendered after the body.
   *
   * Exists to resolve keyword cannibalization: when a section summarises a
   * topic that a blog post covers in full (e.g. the home page's "How often
   * should you groom your dog?" and the post of the same name), the two pages
   * compete for the same query. Linking summary → full article tells Google
   * which one is the authority and makes the pair a hub-and-spoke instead.
   */
  link?: { href: string; label: string };
  /**
   * Optional small-caps category label rendered above the heading, with the
   * matching `icon` badge. Purely visual — exists because on mobile the body
   * collapses into an accordion, leaving otherwise identical text blocks.
   */
  eyebrow?: string;
  /** Key into STORY_ICONS in HomeStories.tsx. Data files stay JSX-free. */
  icon?: 'price' | 'calendar' | 'season' | 'cat' | 'home' | 'breed' | 'lifestage' | 'services' | 'trust';
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

interface LocationHeroProps {
  location: LocationConfig;
  onOpenModal: (initialData?: { name: string; phone: string }) => void;
}

export default function LocationHero({ location, onOpenModal }: LocationHeroProps) {
  const slides = buildHeroSlides({
    eyebrow: `${location.name}, Pune`,
    title: highlightName(location.heroH1, location.name),
    subtitle: location.heroSubtext,
  });

  const chips: HeroChip[] = [
    { icon: ShieldCheck, label: 'Trained groomers' },
    { icon: Clock, label: '9 AM – 9 PM daily' },
    { icon: MapPin, label: `${location.name}, Pune` },
  ];

  return (
    <>
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50">
        <Navbar activePath={`/dog-grooming-in-pune/${location.slug}`} />
      </header>

      <HeroSlider
        slides={slides}
        onBook={() => onOpenModal()}
        chips={chips}
        hideChipsOnMobile
        sectionClassName="bg-gradient-to-b from-purple-100 via-purple-50 to-white pt-4 pb-6 relative overflow-hidden"
      />
    </>
  );
}
