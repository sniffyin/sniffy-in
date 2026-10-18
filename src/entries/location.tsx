/**
 * src/entries/location.tsx
 * Entry island for the generated dog locality pages (dog-grooming-in-pune/*.html).
 *
 * Reads this page's locality data from the inline
 * `<script type="application/json" id="sniffy-location-data">` block that
 * scripts/generateLocationPages.ts emits, rather than importing
 * LOCATION_REGISTRY and looking the slug up at runtime.
 *
 * Why: the registry is one object literal referencing all 132 exports of
 * locationData.ts, so Rollup can shake nothing out of it — every locality page
 * was downloading a 319 KB chunk containing all 33 localities' prose in order to
 * render one of them, on a page whose body is already fully prerendered into the
 * HTML. Reading the one locality from the DOM drops both locationData.js and
 * locationRegistry.js out of this entry's graph entirely.
 *
 * `src/pages/LocationRoute.tsx` still uses the registry — it serves the
 * client-side-navigation case where there is no inline JSON to read, and it is
 * lazy-loaded, so the cost lands only on visitors who actually navigate there
 * inside the SPA.
 */
import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import LocationPage from '../pages/LocationPage'
import { readInlineLocationData } from './readInlineLocationData'
import '../index.css'

// Lazy — ServiceDisruptionNotice imports framer-motion, and this page's body
// is already fully prerendered static HTML, so the LCP element is painted
// long before this notice has anything to decide (it only shows post-mount,
// once per browser, via a localStorage check). A static import here was
// forcing the ~39 KB gzipped framer-motion chunk into every one of these 58
// locality pages' critical bundle for a notice most repeat visitors never see.
const ServiceDisruptionNotice = lazy(() => import('../components/ServiceDisruptionNotice'))

const data = readInlineLocationData()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocationPage
      location={data.location}
      reviews={data.reviews}
      faqs={data.faqs}
    />
    <Suspense fallback={null}>
      <ServiceDisruptionNotice />
    </Suspense>
  </StrictMode>
)
