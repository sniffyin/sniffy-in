import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import CatPunePage from '../pages/CatPunePage'
import '../marketing.css'

// Lazy — see src/entries/location.tsx for why.
const ServiceDisruptionNotice = lazy(() => import('../components/ServiceDisruptionNotice'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CatPunePage />
    <Suspense fallback={null}>
      <ServiceDisruptionNotice />
    </Suspense>
  </StrictMode>
)
