import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import LocationPage from '../pages/LocationPage'
import { CAT_LOCATION_REGISTRY } from '../data/catLocationRegistry'
import '../index.css'

function getSlug(): string {
  const path = window.location.pathname
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1]
}

const slug = getSlug()

const data = CAT_LOCATION_REGISTRY.find(l => l.slug === slug)

if (!data) {
  throw new Error('Cat location not found')
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
