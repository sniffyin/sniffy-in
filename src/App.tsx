/**
 * App.tsx — Root with React Router routes for all pages.
 *
 * PERFORMANCE CHANGES (SEO-safe):
 *   • BookingWizard lazy loaded — pulls in Supabase (41 KB) only when modal opens
 *   • All standalone pages lazy loaded — user only downloads the page they visit
 *   • LocationRoute lazy loaded (src/pages/LocationRoute.tsx) — the registry
 *     lookup lives INSIDE that chunk, so locationData (~311 KB of locality
 *     copy) is fetched only when a locality URL is opened. It previously sat
 *     in a static import here and downloaded on every route, home included.
 *   • Above-the-fold home components (Hero, Packages etc.) stay eagerly loaded
 *     so the initial paint is unaffected
 */

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, useParams, useLocation } from 'react-router-dom';

// ─── Above-the-fold / always needed — eager imports ───────────────────────────
import Hero from './components/Hero';
import Packages from './components/Packages';
import EliteMembership from './components/EliteMembership';
import BeforeAfterSlider from './components/BeforeAfterSlider';
// Eager, not lazy — this is the home page's indexable SEO copy. A lazy chunk
// behind <Suspense fallback={null}> risks it being absent from the rendered DOM.
import HomeStories from './components/HomeStories';
import AreasWeServe from './components/AreasWeServe';
import Testimonials from './components/Testimonials';
import FAQs from './components/FAQs';
import Footer from './components/Footer';
import Toast from './components/Toast';

// ─── Heavy / not needed on initial paint — lazy imports ───────────────────────
// Each of these becomes a separate async chunk; browser only downloads them
// when the user actually triggers them (opens modal / navigates to page).

const BookingWizard = lazy(() => import('./components/BookingWizard'));
// Home page gallery teaser — pulls the Supabase client in to fetch a
// handful of photos, so it stays out of the initial bundle like BookingWizard.
const GalleryPeek = lazy(() => import('./components/GalleryPeek'));
// import FloatingVideo from './components/FloatingVideo';
// import BookingModal from './components/BookingModal';

// Standalone pages — only downloaded when user navigates there
const HowItWorksPage       = lazy(() => import('./pages/HowItWorksPage'));
const FAQsPage             = lazy(() => import('./pages/FAQsPage'));
const BlogsPage            = lazy(() => import('./pages/BlogsPage').then(m => ({ default: m.BlogsPage })));
const BlogPostPage         = lazy(() => import('./pages/BlogsPage').then(m => ({ default: m.BlogPostPage })));
const AboutPage            = lazy(() => import('./pages/AboutPage'));
const GalleryPage          = lazy(() => import('./pages/GalleryPage'));
const ContactPage          = lazy(() => import('./pages/ContactPage'));
const WhySniffyPage        = lazy(() => import('./pages/WhySniffyPage'));
const GroomerOnboardingPage = lazy(() => import('./pages/GroomerOnboardingPage'));
const LocationRoute        = lazy(() => import('./pages/LocationRoute'));
const AdminDashboard   = lazy(() => import('./pages/AdminDashboard'));
const GroomerDashboard = lazy(() => import('./pages/GroomerDashboard'));
// Phase 4 — customer portal at /account.  Phone OTP, self-service pets,
// session history with receipts, request-to-book.
const CustomerPortal   = lazy(() => import('./pages/CustomerPortal'));
// Role-policy "read & sign" page — reached only via an admin-generated link
// (Admin > Policies > Generate Link), never linked from any nav. Kept out of
// search indexing (see HIDE_FLOATING_ON below, robots.txt, and the page's
// own noindex meta tag).
const PolicySignPage   = lazy(() => import('./pages/PolicySignPage'));
// Unlisted single-screen booking form shared directly with customers who
// call / WhatsApp. Independent of BookingWizard. noindex, no site chrome.
const QuickBookPage    = lazy(() => import('./pages/QuickBookPage'));
// Catch-all 404 — only downloads when a user lands on an unknown URL
const NotFoundPage     = lazy(() => import('./pages/NotFoundPage'));


// Route-aware PWA gate: swaps the <link rel="manifest"> based on
// pathname (so /groomer installs as "Sniffy Groomer" and /admin installs
// as "Sniffy Admin") and renders the Install-App banner inside those two
// scopes. Tiny + cheap — safe to keep eager-imported.
import PWAInstallGate from './components/PWAInstallGate';

// Persistent floating Book / WhatsApp speed-dial. Self-contained (owns its own
// BookingWizard), so it needs no per-page wiring — mounted once below, hidden on
// the operational surfaces (admin / groomer / customer portal).
//
// Both of these import framer-motion for genuinely rich animation (spring
// physics, staggered children, an infinite breathing-halo loop) that isn't
// worth hand-converting to CSS. Lazy-loading them instead — same pattern as
// BookingWizard/GalleryPeek — keeps that ~39 KB gzipped dependency off every
// public page's critical bundle. Neither needs to be visible on first paint:
// FloatingActions deliberately delays its own entrance by 900ms already, and
// ServiceDisruptionNotice only decides whether to show at all inside a
// post-mount effect (it's a once-per-browser localStorage-gated notice).
const FloatingActions = lazy(() => import('./components/FloatingActions'));
const ServiceDisruptionNotice = lazy(() => import('./components/ServiceDisruptionNotice'));
import RelatedArticles from './components/RelatedArticles';

const HIDE_FLOATING_ON = ['/admin', '/groomer', '/account', '/policy-sign', '/quick-book'];

function PublicFloatingActions() {
  const { pathname } = useLocation();
  if (HIDE_FLOATING_ON.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <FloatingActions />
    </Suspense>
  );
}

// Same surfaces as the floating actions — internal admin/groomer tools and the
// customer's own account portal don't need the public-facing outage notice.
function PublicServiceDisruptionNotice() {
  const { pathname } = useLocation();
  if (HIDE_FLOATING_ON.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <ServiceDisruptionNotice />
    </Suspense>
  );
}

// Defers the GalleryPeek chunk download AND its Supabase query until the
// section is about to scroll into view. Without this, React.lazy's import()
// fires the moment <GalleryPeek/> is rendered — i.e. on every home page load,
// even for visitors who never scroll that far — adding an extra JS chunk
// fetch + DB round trip to initial load for no reason. rootMargin starts the
// real fetch a bit early so the section doesn't visibly pop in mid-scroll.
function DeferredGalleryPeek() {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad || !ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={ref}>
      {shouldLoad && (
        <Suspense fallback={null}>
          <GalleryPeek />
        </Suspense>
      )}
    </div>
  );
}

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
      <DeferredGalleryPeek />
      <HomeStories onBookNow={() => handleOpenModal()} />
      <Testimonials />
      <AreasWeServe />
      <FAQs />
      <RelatedArticles />
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
      {/* Mounted inside the router so it can read pathname via
          useLocation. Doesn't render any chrome on public/SEO routes —
          only swaps the manifest link tag. */}
      <PWAInstallGate />
      <PublicFloatingActions />
      <PublicServiceDisruptionNotice />
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
          <Route path="/gallery"                       element={<GalleryPage />} />
          <Route path="/groomer-onboarding"            element={<GroomerOnboardingPage />} />

          {/* Location pages */}
          <Route path="/dog-grooming-in-pune/:slug"    element={<LocationRoute />} />
          <Route path="/admin"   element={<AdminDashboard />} />
          <Route path="/groomer" element={<GroomerDashboard />} />
          {/* Phase 4 — customer portal.  Phone OTP gate → self-service shell. */}
          <Route path="/account" element={<CustomerPortal />} />

          {/* Role-policy sign page — unlinked, admin-generated links only */}
          <Route path="/policy-sign/:token" element={<PolicySignPage />} />

          {/* Shareable quick-booking form — unlisted, noindex */}
          <Route path="/quick-book" element={<QuickBookPage />} />

          {/* Catch-all 404 — must be the LAST route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
