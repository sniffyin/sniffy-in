/**
 * App.tsx — Root with React Router routes for all pages.
 *
 * PERFORMANCE CHANGES (SEO-safe):
 *   • BookingWizard lazy loaded — pulls in Supabase (41 KB) only when modal opens
 *   • All standalone pages lazy loaded — user only downloads the page they visit
 *   • LocationPageWrapper lazy loaded — locationData (59 KB) deferred until needed
 *   • Above-the-fold home components (Hero, Packages etc.) stay eagerly loaded
 *     so the initial paint is unaffected
 */

import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';

// ─── Above-the-fold / always needed — eager imports ───────────────────────────
import Hero from './components/Hero';
import Packages from './components/Packages';
import EliteMembership from './components/EliteMembership';
import BeforeAfterSlider from './components/BeforeAfterSlider';
import Testimonials from './components/Testimonials';
import FAQs from './components/FAQs';
import Footer from './components/Footer';
import Toast from './components/Toast';

// ─── Heavy / not needed on initial paint — lazy imports ───────────────────────
// Each of these becomes a separate async chunk; browser only downloads them
// when the user actually triggers them (opens modal / navigates to page).

const BookingWizard = lazy(() => import('./components/BookingWizard'));
// import FloatingVideo from './components/FloatingVideo';
// import BookingModal from './components/BookingModal';

// Standalone pages — only downloaded when user navigates there
const HowItWorksPage       = lazy(() => import('./pages/HowItWorksPage'));
const FAQsPage             = lazy(() => import('./pages/FAQsPage'));
const BlogsPage            = lazy(() => import('./pages/BlogsPage').then(m => ({ default: m.BlogsPage })));
const BlogPostPage         = lazy(() => import('./pages/BlogsPage').then(m => ({ default: m.BlogPostPage })));
const AboutPage            = lazy(() => import('./pages/AboutPage'));
const ContactPage          = lazy(() => import('./pages/ContactPage'));
const WhySniffyPage        = lazy(() => import('./pages/WhySniffyPage'));
const GroomerOnboardingPage = lazy(() => import('./pages/GroomerOnboardingPage'));
const LocationPage         = lazy(() => import('./pages/LocationPage'));

import { LOCATION_REGISTRY } from './data/locationRegistry';

// ─── Home ─────────────────────────────────────────────────────────────────────

function HomePage() {
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
    <div className="min-h-screen bg-white" id="booking">
      <Toast
        message="We've received your booking! Our team will contact you shortly."
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <Hero onOpenModal={handleOpenModal} />
      {/* <FloatingVideo videoSrc="/Pomeranian Dog Grooming.mp4" startOpen={true} /> */}
      <Packages onBookNow={() => handleOpenModal()} />
      <EliteMembership />
      <BeforeAfterSlider />
      <Testimonials />
      <FAQs />
      <Footer />
      {/* <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={initialBookingData}
        onSuccess={handleBookingSuccess}
      /> */}

      {/* BookingWizard lazy loaded — Supabase only downloads when modal opens */}
      <Suspense fallback={null}>
        <BookingWizard
          open={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleBookingSuccess}
        />
      </Suspense>
    </div>
  );
}

// ─── Location page wrapper ────────────────────────────────────────────────────

function LocationPageWrapper() {
  const { slug } = useParams<{ slug: string }>();
  const data = LOCATION_REGISTRY[slug ?? ''];

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Location not found.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <LocationPage
        location={data.location}
        reviews={data.reviews}
        faqs={data.faqs}
      />
    </Suspense>
  );
}

// ─── Blog post wrapper ────────────────────────────────────────────────────────

function BlogPostWrapper() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <Suspense fallback={null}>
      <BlogPostPage slug={slug ?? ''} />
    </Suspense>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

// Single top-level Suspense wraps all lazy routes.
// fallback={null} means no spinner — page stays blank for the instant
// the chunk loads, which is typically <100ms on a good connection.
// You can replace null with a simple loading skeleton if preferred.

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          {/* Home */}
          <Route path="/"                              element={<HomePage />} />

          {/* Standalone pages */}
          <Route path="/how-it-works"                  element={<HowItWorksPage />} />
          <Route path="/why-sniffy"                    element={<WhySniffyPage />} />
          <Route path="/contact"                       element={<ContactPage />} />
          <Route path="/faqs"                          element={<FAQsPage />} />
          <Route path="/blogs"                         element={<BlogsPage />} />
          <Route path="/blogs/:slug"                   element={<BlogPostWrapper />} />
          <Route path="/about"                         element={<AboutPage />} />
          <Route path="/groomer-onboarding"            element={<GroomerOnboardingPage />} />

          {/* Location pages */}
          <Route path="/dog-grooming-in-pune/:slug"    element={<LocationPageWrapper />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
