import { useState } from 'react';
import LocationHero from '../components/location/LocationHero';
import LocationStories from '../components/location/LocationStories';
import LocationCities from '../components/location/LocationCities';
import LocationFAQs from '../components/location/LocationFAQs';
import LocationReviews from '../components/location/LocationReviews';
import Packages from '../components/Packages';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import BookingWizard from '../components/BookingWizard';
import Toast from '../components/Toast';
import type { LocationConfig } from '../components/location/LocationHero';
import type { LocationReview } from '../components/location/LocationReviews';
import type { FAQ } from '../components/location/LocationFAQs';

interface LocationPageProps {
  location: LocationConfig;
  reviews: LocationReview[];
  faqs: FAQ[];
}

export default function LocationPage({ location, reviews, faqs }: LocationPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialBookingData, setInitialBookingData] = useState<{ name: string; phone: string } | undefined>();
  const [showToast, setShowToast] = useState(false);

  const handleOpenModal = (initialData?: { name: string; phone: string }) => {
    setInitialBookingData(initialData);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setInitialBookingData(undefined);
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
      <Packages onBookNow={() => handleOpenModal()} showToggle={false} />
      <LocationStories location={location} onBookNow={() => handleOpenModal()} />
      <LocationReviews location={location} reviews={reviews} />
      <LocationCities location={location} />
      <LocationFAQs location={location} faqs={faqs} />
      <Footer />
      {/* <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={initialBookingData}
        onSuccess={handleBookingSuccess}
      /> */}
      <BookingWizard
        open={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}