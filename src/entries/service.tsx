/**
 * src/entries/service.tsx
 * Entry island for the generated service pages (services/<slug>.html).
 *
 * Content comes from the inline JSON block the generator emits, so this chunk
 * does not bundle all seven services.
 */
import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import ServicePage from '../pages/ServicePage'
import { readInlineServiceData } from './readInlineServiceData'
import '../marketing.css'

const ServiceDisruptionNotice = lazy(() => import('../components/ServiceDisruptionNotice'))

const service = readInlineServiceData()

if (service) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ServicePage service={service} />
      <Suspense fallback={null}>
        <ServiceDisruptionNotice />
      </Suspense>
    </StrictMode>
  )
}
