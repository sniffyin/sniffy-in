/**
 * src/entries/pune.tsx
 * Entry point for the static Pune city index page.
 * Referenced by dog-grooming-in-pune/index.html
 */

import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import PunePage from '../pages/PunePage'
import '../marketing.css'

// Lazy — see src/entries/location.tsx for why.
const ServiceDisruptionNotice = lazy(() => import('../components/ServiceDisruptionNotice'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PunePage />
    <Suspense fallback={null}>
      <ServiceDisruptionNotice />
    </Suspense>
  </StrictMode>
)
