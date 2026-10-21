import { lazy, Suspense, useState } from 'react';
import { Check, Gift, Star } from 'lucide-react';

// The package/add-on data lives in a dependency-free module so the SEO build
// scripts can read the same numbers — this component cannot be imported from
// Node (framer-motion, lucide). See the header of src/data/packages.ts.
import {
  DOG_PACKAGES,
  CAT_PACKAGES,
  DOG_ADD_ONS,
  CAT_ADD_ONS,
  type PackageTheme,
  type DisplayAddOn as AddOn,
} from '../data/packages';

// Framer-motion only powers the add-on detail popup now (see AddOnModal.tsx).
// Packages itself is eager/above-the-fold, but the popup is interaction-gated
// (opens on tap), so it's lazy-loaded and doesn't force framer-motion into the
// homepage's critical bundle.
const AddOnModal = lazy(() => import('./AddOnModal'));

// Small variants, deliberately — these are CSS `background-image`s, and a
// background cannot carry a `srcset`, so whatever is named here is what every
// device downloads at full size. The card art window is a few hundred CSS px
// wide, so the 1600w originals were ~368 KB of pixels no phone could use.
//
// Dedicated art (640px wide, pre-cropped) per package — bath, trim, finished-and-fluffy.
const PACKAGE_IMAGE: Record<PackageTheme, string> = {
  bath: '/images/package-bath-640.jpg',
  cut: '/images/package-cut-640.jpg',
  combo: '/images/package-combo-640.jpg',
};

// Crop bias per photo (`background-position`). The art is pre-cropped so the
// subject's face sits ~3/4 of the way down — the top of the window is masked
// out, so only the lower band really shows. X steers which part of the photo
// survives the sideways crop on tall, narrow phone cards (cover fits by
// height there); Y keeps the lower part of the photo on wide cards.
const PACKAGE_IMAGE_POSITION: Record<PackageTheme, string> = {
  bath: '55% 70%',
  cut: '82% 70%',
  combo: '55% 70%',
};

// All three use `cover` so the photo fills the art window edge-to-edge — a zoom
// (backgroundSize > 100%) left washed/solid patches where the crop ran off the
// subject, so we let the crop bias above do the framing instead.
const PACKAGE_IMAGE_SIZE: Record<PackageTheme, string> = {
  bath: 'cover',
  cut: 'cover',
  combo: 'cover',
};

interface PackagesProps {
  onBookNow: () => void;
  showToggle?: boolean;
  /**
   * Locality/city to name in the heading, e.g. `'Kothrud'` → "Dog grooming
   * prices in Kothrud". Set by the generated locality and hub pages so the
   * rendered heading matches the one `prerenderLocationBody.ts` bakes into the
   * static HTML — otherwise a non-JS crawler reads the locality-targeted
   * heading and Google's renderer replaces it with the generic one, which is
   * the opposite of what these pages are for. Omit on the home page, which is
   * city-wide and keeps the generic heading.
   */
  placeName?: string;
  /** Which price list to name in the heading. Ignored unless `placeName` is set. */
  petType?: 'dog' | 'cat';
}

export default function Packages({
  onBookNow,
  showToggle = true,
  placeName,
  petType = 'dog',
}: PackagesProps) {
  const [selectedPet, setSelectedPet] = useState<'dog' | 'cat'>('dog');
  const [activeAddOn, setActiveAddOn] = useState<AddOn | null>(null);
  // Sticky past the first open — keeps AddOnModal mounted after it closes so
  // its own AnimatePresence can play the close animation, instead of the
  // parent yanking it out of the tree mid-exit. Also what defers the
  // framer-motion chunk fetch until the user actually taps an add-on.
  const [addOnEverOpened, setAddOnEverOpened] = useState(false);
  const dogPackages = DOG_PACKAGES;
  const catPackages = CAT_PACKAGES;
  const dogAddOns = DOG_ADD_ONS;
  const catAddOns = CAT_ADD_ONS;

  const PackageArt = ({ theme, featured }: { theme: PackageTheme; featured: boolean }) => {
    // Card-color wash: cream (#faf3e3) on the light cards, purple on the featured one.
    // Start fully transparent at the top so the artwork window emerges out of the
    // card's own color (the featured card is a gradient, so a solid top stop here
    // would band against the lighter purple above it). Fades to translucent at the
    // bottom so the image shows through — a soft, glassy blend.
    const wash = featured
      ? 'linear-gradient(to bottom, rgba(36,16,70,0) 0%, rgba(36,16,70,0.82) 26%, rgba(36,16,70,0.72) 60%, rgba(36,16,70,0.66) 100%)'
      : 'linear-gradient(to bottom, rgba(250,243,227,0) 0%, rgba(250,243,227,0.86) 26%, rgba(250,243,227,0.76) 60%, rgba(250,243,227,0.68) 100%)';

    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] overflow-hidden rounded-b-3xl"
      >
        {/* the photo, faded in from the top edge */}
        <div
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url(${PACKAGE_IMAGE[theme]})`,
            // bath & combo photos have the dog's face up high — zoom + bias the crop
            // so the face shows in the visible bottom band instead of the neck.
            backgroundSize: PACKAGE_IMAGE_SIZE[theme],
            backgroundPosition: PACKAGE_IMAGE_POSITION[theme],
            opacity: featured ? 0.72 : 0.85,
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 40%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 40%, black 100%)',
          }}
        />
        {/* card-color wash blends the photo into the card and keeps text legible */}
        <div className="absolute inset-0" style={{ background: wash }} />
      </div>
    );
  };

  const parsePrice = (s: string) => parseInt(String(s).replace(/[^0-9]/g, ''), 10) || 0;

  const PackageCard = ({ pkg }: { pkg: any; index?: number; petType: 'dog' | 'cat' }) => {
    const featured = !!pkg.featured;
    const freeAddOns: string[] = pkg.freeAddOns ?? [];
    const priceNum = parsePrice(pkg.price);
    const origNum = parsePrice(pkg.originalPrice);
    const saveAmount = origNum - priceNum;
    const percentOff = origNum > priceNum ? Math.round((saveAmount / origNum) * 100) : 0;

    return (
      <div className="relative h-full">
        <div
          className={`relative h-full flex flex-col rounded-3xl p-5 md:p-6 transition-all duration-300 ${
            featured
              ? 'bg-gradient-to-b from-[#3a1a6b] to-[#241046] text-white shadow-xl shadow-[#241046]/25 lg:scale-[1.04] ring-1 ring-white/10'
              : 'bg-[#faf3e3] text-gray-900 shadow-sm ring-1 ring-black/5 hover:shadow-lg hover:-translate-y-0.5'
          }`}
        >
          {/* Faded thematic artwork, bottom half only */}
          <PackageArt theme={pkg.theme} featured={featured} />

          {featured && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-1 whitespace-nowrap bg-sniffy-yellow text-sniffy-purple text-[10px] font-extrabold uppercase tracking-wide px-3 py-1 rounded-full shadow-md ring-2 ring-white/60">
              <Star size={11} fill="currentColor" strokeWidth={0} /> Most Popular
            </span>
          )}

          {/* Header: name + price */}
          <div className="relative z-10 mb-4">
            <h3
              className={`text-sm md:text-base font-extrabold uppercase tracking-wide ${
                featured ? 'text-white/90' : 'text-sniffy-purple'
              }`}
            >
              {pkg.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span className={`text-2xl md:text-3xl font-black tracking-tight ${featured ? 'text-white' : 'text-gray-900'}`}>
                {pkg.price}
              </span>
              <span className={`text-sm md:text-base font-semibold line-through ${featured ? 'text-white/60' : 'text-gray-400'}`}>
                {pkg.originalPrice}
              </span>
              {percentOff > 0 && !pkg.hideDiscountBadge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sniffy-yellow px-2.5 py-1 text-[11px] md:text-xs font-extrabold uppercase tracking-wide text-sniffy-purple shadow-sm">
                  {percentOff}% OFF
                </span>
              )}
            </div>
            {saveAmount > 0 && (
              <p className={`mt-1.5 text-[11px] md:text-xs font-bold ${featured ? 'text-sniffy-yellow' : 'text-green-600'}`}>
                You save ₹{saveAmount}
              </p>
            )}
          </div>

          <div className={`relative z-10 h-px w-full mb-4 ${featured ? 'bg-white/15' : 'bg-black/10'}`} />

          {/* Features */}
          <ul className="relative z-10 space-y-2">
            {pkg.items.map((feature: string) => (
              <li key={feature} className="flex items-start gap-2">
                <Check
                  size={14}
                  strokeWidth={3}
                  className={`flex-shrink-0 mt-0.5 ${featured ? 'text-sniffy-yellow' : 'text-sniffy-purple'}`}
                />
                <span
                  className={`text-xs md:text-[13px] font-medium leading-snug ${
                    featured ? 'text-white/95' : 'text-gray-700'
                  }`}
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* FREE ADD-ONS — bundled extras reframed as complimentary, so
              customers don't ask to drop them for a lower price */}
          {freeAddOns.length > 0 && (
            <div className="relative z-10 mt-4 flex-1">
              <div
                className={`mb-3 border-t border-dashed ${featured ? 'border-white/25' : 'border-black/15'}`}
              />
              <div className="flex items-center gap-1.5 mb-2.5">
                <Gift
                  size={15}
                  strokeWidth={2.5}
                  className={featured ? 'text-sniffy-yellow' : 'text-sniffy-purple'}
                />
                <span
                  className={`text-[11px] md:text-xs font-extrabold uppercase tracking-wide ${
                    featured ? 'text-sniffy-yellow' : 'text-sniffy-purple'
                  }`}
                >
                  Free Add-Ons
                </span>
              </div>
              <ul className="space-y-1.5">
                {freeAddOns.map((feature: string) => (
                  <li key={feature} className="flex items-start gap-1.5">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                        featured ? 'bg-sniffy-yellow' : 'bg-sniffy-purple'
                      }`}
                    />
                    <span
                      className={`text-[11px] md:text-xs font-medium leading-snug ${
                        featured ? 'text-white/90' : 'text-gray-700'
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    );
  };

  const currentPackages = selectedPet === 'dog' ? dogPackages : catPackages;
  const currentAddOns = selectedPet === 'dog' ? dogAddOns : catAddOns;

  return (
    <section className="pt-2 pb-10 md:pt-6 md:pb-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div
          className="text-center mb-4 md:mb-8"
        >
          <h2 className="text-[1.575rem] md:text-5xl font-bold mb-3 md:mb-5">
            {placeName ? (
              <>
                <span className="text-sniffy-purple">
                  {petType === 'cat' ? 'Cat' : 'Dog'} grooming prices
                </span>{' '}
                <span className="text-sniffy-yellow">in {placeName}</span>
              </>
            ) : (
              <>
                <span className="text-sniffy-purple">Our Grooming</span>{' '}
                <span className="text-sniffy-yellow">Packages</span>
              </>
            )}
          </h2>

          {showToggle && <div className="inline-flex bg-gray-100 rounded-full p-1.5 md:p-2 shadow-lg">
            <button
              onClick={() => setSelectedPet('dog')}
              className={`px-5 md:px-8 py-2 md:py-3 rounded-full font-semibold text-sm md:text-lg transition-all duration-300 ${
                selectedPet === 'dog'
                  ? 'bg-sniffy-purple text-white shadow-lg'
                  : 'text-gray-600 hover:text-sniffy-purple'
              }`}
            >
              🐶 Dog
            </button>
            <button
              onClick={() => setSelectedPet('cat')}
              className={`px-5 md:px-8 py-2 md:py-3 rounded-full font-semibold text-sm md:text-lg transition-all duration-300 ${
                selectedPet === 'cat'
                  ? 'bg-sniffy-purple text-white shadow-lg'
                  : 'text-gray-600 hover:text-sniffy-purple'
              }`}
            >
              🐱 Cat
            </button>
          </div>}
        </div>

        <div key={selectedPet} className="animate-package-swap-in">
            <div className="mb-3 md:mb-6">
              {/* Mobile swipe */}
              <div className="flex lg:hidden gap-4 overflow-x-auto overflow-y-hidden pt-4 pb-2 snap-x snap-mandatory scrollbar-hide items-stretch">
                {currentPackages.map((pkg, index) => (
                  <div key={index} className="min-w-[53%] sm:min-w-[46%] snap-center flex">
                    <PackageCard pkg={pkg} index={index} petType={selectedPet} />
                  </div>
                ))}
              </div>

              {/* Desktop grid */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-5 items-stretch py-2 max-w-4xl mx-auto">
                {currentPackages.map((pkg, index) => (
                  <PackageCard key={index} pkg={pkg} index={index} petType={selectedPet} />
                ))}
              </div>
            </div>

            <div
              className="mt-5 md:mt-10"
            >
              <div className="text-center mb-5 md:mb-6">
                <h4 className="text-xl md:text-2xl font-bold text-sniffy-purple">
                  Special Add-Ons
                </h4>
                <p className="mt-1 text-xs md:text-sm text-gray-500">
                  Enhance any package with these extras
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#f3efff] to-[#faf3e3] rounded-3xl p-4 md:p-6 shadow-sm ring-1 ring-black/5 max-w-5xl mx-auto">
                <div className="flex items-start gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1 -mx-1 px-1">
                  {currentAddOns.map((addon, index) => (
                    <div
                      key={index}
                      className="min-w-[36%] sm:min-w-[140px] md:min-w-[148px] snap-start"
                    >
                      <button
                        type="button"
                        onClick={() => { setActiveAddOn(addon); setAddOnEverOpened(true); }}
                        aria-label={`Learn more about ${addon.name}`}
                        className="group flex w-full flex-col rounded-xl bg-white ring-1 ring-black/5 shadow-sm overflow-hidden text-left transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sniffy-purple"
                      >
                        {/* Thumbnail — real image over an emoji/tint fallback */}
                        <div
                          className="relative aspect-[4/3] flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: addon.tint }}
                        >
                          <span className="text-3xl md:text-4xl" aria-hidden>
                            {addon.emoji}
                          </span>
                          {addon.image && (
                            <img
                              src={addon.image}
                              alt={addon.name}
                              loading="lazy"
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          {/* Tap hint */}
                          <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
                            Know more
                          </span>
                        </div>

                        {/* Label + price */}
                        <div className="flex flex-col px-2.5 py-2">
                          <p className="text-[11px] md:text-xs font-bold text-gray-900 leading-tight truncate">
                            {addon.name}
                          </p>
                          {addon.detail && (
                            <p className="mt-0.5 text-[10px] text-gray-500 leading-tight line-clamp-1">
                              {addon.detail}
                            </p>
                          )}
                          <p className="mt-1 text-sm font-extrabold text-sniffy-purple">
                            {addon.price}
                          </p>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add-on detail popup — lazy-loaded: it's gated behind a tap, so
                framer-motion is only fetched the first time someone opens one,
                instead of shipping in the eager homepage bundle. Stays mounted
                after the first open (see addOnEverOpened) so its own
                AnimatePresence can play the close animation. */}
            {addOnEverOpened && (
              <Suspense fallback={null}>
                <AddOnModal
                  addon={activeAddOn}
                  onClose={() => setActiveAddOn(null)}
                  onBookNow={onBookNow}
                />
              </Suspense>
            )}
            {/* <section className="mt-20 bg-gray-50 rounded-[32px] px-6 py-10 md:px-12 md:py-14">
              <h2 className="text-2xl md:text-3xl font-bold text-sniffy-purple mb-4">
                Pet Grooming Services Across Pune
              </h2>

              <p className="text-gray-700 text-base md:text-lg leading-relaxed max-w-5xl">
                Sniffy offers professional dog and cat grooming at home across all major
                areas of Pune including <strong>Wakad</strong>, <strong>Hinjewadi</strong>,
                <strong>Baner</strong>, <strong>Aundh</strong>, <strong>Kothrud</strong>,
                <strong>Bavdhan</strong>, <strong>Karve Nagar</strong>, <strong>Hadapsar</strong>,
                <strong>Magarpatta</strong>, <strong>Kharadi</strong>, <strong>Viman Nagar</strong>,
                <strong>Yerawada</strong>, <strong>Pimpri-Chinchwad</strong>,
                <strong>Pimple Saudagar</strong> and nearby localities.
              </p>
            </section> */}
        </div>

        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button
            onClick={onBookNow}
            className="bg-sniffy-yellow text-sniffy-purple px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
          >
            Book Your Grooming Session
          </button>
        </motion.div> */}
      </div>
    </section>
  );
}
