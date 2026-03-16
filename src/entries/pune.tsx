/**
 * src/entries/pune.tsx
 * Entry point for the static Pune city index page.
 * Referenced by dog-grooming-in-pune/index.html
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PunePage from '../pages/PunePage'
import '../index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PunePage />
  </StrictMode>
)
