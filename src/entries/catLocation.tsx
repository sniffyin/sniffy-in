/**
 * src/entries/catLocation.tsx
 * Entry island for the generated cat locality pages (cat-grooming-in-pune/*.html).
 *
 * Reads this page's locality data from the inline JSON block that
 * scripts/generateCatLocationPages.ts emits — see src/entries/location.tsx for
 * why, and src/entries/readInlineLocationData.ts for the mechanism. For cats the
 * saving is larger: catLocationData.js is a 378 KB chunk.
 *
 * Note there is no `/cat-grooming-in-pune/:slug` SPA route (see CLAUDE.md), so
 * unlike the dog side these pages are only ever reached as static HTML — there
 * is no client-navigation path that needs the registry at all.
 */
import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import LocationPage from '../pages/LocationPage'
import { readInlineLocationData } from './readInlineLocationData'
import '../index.css'

// Lazy — see src/entries/location.tsx for why (same reasoning applies here).
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
