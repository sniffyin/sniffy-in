import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import LocationPage from '../pages/LocationPage'
import { LOCATION_REGISTRY } from '../data/locationRegistry'
import '../index.css'

function getSlug(): string {
  const path = window.location.pathname
  const parts = path.split('/').filter(Boolean)

  return parts[parts.length - 1]
}

const slug = getSlug()

const data = LOCATION_REGISTRY.find(l => l.slug === slug)

if (!data) {
  throw new Error("Location not found")
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocationPage
      location={data.location}
      reviews={data.reviews}
      faqs={data.faqs}
    />
  </StrictMode>
)