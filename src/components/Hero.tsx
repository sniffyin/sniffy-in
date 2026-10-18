import { ShieldCheck, Clock, MapPin } from "lucide-react";
import Navbar from "./Navbar";
import HeroSlider, { type HeroChip } from "./HeroSlider";
import { buildHeroSlides } from "./heroSlides";

interface HeroProps {
  onOpenModal: (initialData?: { name: string; phone: string }) => void;
}

const CHIPS: HeroChip[] = [
  { icon: ShieldCheck, label: "Trained groomers" },
  { icon: Clock, label: "9 AM - 9 PM daily" },
  { icon: MapPin, label: "Multiple cities covered" },
];

export default function Hero({ onOpenModal }: HeroProps) {
  // First slide carries the original hero copy + rating; the rest are promos.
  // The membership banner scrolls to the on-page #elite section (default).
  //
  // This title is the page's ONLY <h1> — HeroCarousel renders <h1> for the
  // `hero` variant and <h2> for the banner slides after it. It used to read
  // "Grooming Service at Your Doorstep", which named neither species nor the
  // city, so the single strongest heading on the site's most important page
  // carried no query term at all. The /dog-grooming-in-pune and
  // /cat-grooming-in-pune hubs already phrase their leads this way.
  const slides = buildHeroSlides({
    eyebrow: "AT-HOME PET GROOMING",
    title: (
      <>
        Dog &amp; Cat Grooming
        <br />
        <span className="text-sniffy-yellow">at Home in Pune</span>
      </>
    ),
    subtitle:
      "Gentle care, expert hands, stress-free experience — a trained groomer comes to your doorstep.",
    imageAlt:
      "Trained Sniffy groomer bathing a dog at home in Pune during a doorstep grooming session",
  });

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Navbar activePath="/" />
      </header>

      <HeroSlider slides={slides} onBook={() => onOpenModal()} chips={CHIPS} hideChipsOnMobile />
    </>
  );
}
