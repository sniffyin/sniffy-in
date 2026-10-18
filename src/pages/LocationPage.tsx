import { useState, lazy, Suspense } from 'react';
import LocationHero from '../components/location/LocationHero';
import LocationStories from '../components/location/LocationStories';
import LocationCities from '../components/location/LocationCities';
import LocationSiblingLink from '../components/location/LocationSiblingLink';
import LocationReviews from '../components/location/LocationReviews';
import Packages from '../components/Packages';
import EliteMembership from '../components/EliteMembership';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import type { LocationConfig } from '../components/location/LocationHero';
import type { LocationReview } from '../components/location/LocationReviews';
import type { FAQ } from '../components/location/LocationFAQs';
import RelatedArticles from '../components/RelatedArticles';

// Lazy — LocationFAQs imports framer-motion for its accordion's height/rotate
// animation. It's below the fold, the prerendered static HTML already shows
// every FAQ answer as plain text (crawlers and the pre-hydration paint both
// see it fine), and createRoot().render() replaces it anyway — so deferring
// the whole component keeps the ~39 KB gzipped framer-motion chunk off this
// page's (and the other 57 locality pages') critical bundle.
const LocationFAQs = lazy(() => import('../components/location/LocationFAQs'));

/**
 * Lazy, and mounted only after the first open.
 *
 * BookingWizard statically imports `@lottiefiles/dotlottie-react` (370 KB) and
 * `lib/supabase` (171 KB vendor chunk). Imported eagerly, that is ~540 KB on the
 * critical path of a landing page whose entire body is already prerendered into
 * the HTML — none of it needed until someone taps "Book". vite.config.ts's
 * globIgnores already describes the lottie player as "lazy-loaded on booking
 * success only"; this is what makes that true on the locality pages.
 *
 * The component already returns null while `open` is false, so there is no exit
 * animation to preserve — but it stays mounted once opened so reopening does not
 * re-suspend.
 */
const BookingWizard = lazy(() => import('../components/BookingWizard'));

interface LocationPageProps {
  location: LocationConfig;
  reviews: LocationReview[];
  faqs: FAQ[];
}

export default function LocationPage({ location, reviews, faqs }: LocationPageProps) {
  // Both the dog and cat locality pages render this same component; the slug is
  // the only thing that distinguishes them (`dog-grooming-in-pune/baner` vs
  // `cat-grooming-in-pune/baner`). Derived rather than passed as a prop so the
  // two entry islands cannot set it inconsistently.
  const petType = location.slug.startsWith('cat-') ? 'cat' : 'dog';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  /** Latches true on first open so the lazy wizard chunk is fetched only once. */
  const [wizardMounted, setWizardMounted] = useState(false);

  // Took no arguments in practice: an `initialBookingData` state used to be
  // threaded through here for the prefill props of BookingModal, but that render
  // was commented out and its import is now gone, and every call site — the
  // hero, Packages, LocationStories — invokes this with no arguments.
  // BookingWizard collects the name and phone itself. Dropped rather than left
  // as write-only state.
  const handleOpenModal = () => {
    setWizardMounted(true);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleBookingSuccess = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  return (
    <div className="min-h-screen bg-white">
      <Toast
        message="We've received your booking! Our team will contact you shortly."
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <LocationHero location={location} onOpenModal={handleOpenModal} />
      <Packages
        onBookNow={() => handleOpenModal()}
        showToggle={false}
        placeName={location.name}
        petType={petType}
      />
      {/* Sits below the pricing block, not above it: between the hero and the
          prices it interrupted the path from "what is this" to "what does it
          cost". Mirrors the same line in the prerendered HTML — see the
          component, and keep the two in the same position. */}
      <LocationSiblingLink slug={location.slug} />
      <EliteMembership />
      <LocationStories location={location} onBookNow={() => handleOpenModal()} />
      <LocationReviews location={location} reviews={reviews} />
      <LocationCities location={location} />
      <Suspense fallback={null}>
        <LocationFAQs location={location} faqs={faqs} />
      </Suspense>
      {/* Species-filtered — a cat locality page must not link the Husky guide. */}
      <RelatedArticles audience={petType} />
      <Footer />
      {wizardMounted && (
        <Suspense fallback={null}>
          <BookingWizard
            open={isModalOpen}
            onClose={handleCloseModal}
            onSuccess={handleBookingSuccess}
          />
        </Suspense>
      )}
    </div>
  );
}