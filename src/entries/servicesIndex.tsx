/**
 * src/entries/servicesIndex.tsx
 * Entry for the /services hub page (services/index.html).
 */
import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import ServicesIndexPage from '../pages/ServicesIndexPage'
import '../marketing.css'

const ServiceDisruptionNotice = lazy(() => import('../components/ServiceDisruptionNotice'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServicesIndexPage />
    <Suspense fallback={null}>
      <ServiceDisruptionNotice />
    </Suspense>
  </StrictMode>
)
