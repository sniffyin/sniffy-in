import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CatPunePage from '../pages/CatPunePage'
import '../index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CatPunePage />
  </StrictMode>
)
