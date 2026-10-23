/**
 * Static render of the hero (Navbar + HeroSlider) for the prerendered pages.
 *
 * The hero image is the LCP element on every page that has one, and it is drawn
 * by React. With only the page body prerendered, the browser had the image
 * preloaded long before it could paint it: Lighthouse showed an 88% "render
 * delay" on LCP while the JS bundle downloaded and ran. Server-rendering the
 * same components into the HTML lets the hero paint at first render.
 *
 * It renders the REAL components via react-dom/server, so the markup cannot
 * drift from what React draws on mount — and since React's createRoot replaces
 * the container, the hero is pixel-identical before and after. The Navbar is
 * included on purpose: if it were left out, React inserting it on mount would
 * push the whole hero down (a layout shift).
 *
 * Interactive bits (Book button, menu) are inert until React mounts, same as
 * every other control in the prerendered body.
 */
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Clock, MapPin, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import Navbar from '../src/components/Navbar'
import HeroSlider, { type HeroChip } from '../src/components/HeroSlider'
import { buildHeroSlides, highlightName } from '../src/components/heroSlides'

const PURPLE_SECTION =
  'bg-gradient-to-b from-purple-100 via-purple-50 to-white pt-4 pb-6 relative overflow-hidden'

interface HeroOpts {
  activePath: string
  /** Wrapper classes of the <header> around the Navbar; differs per page. */
  headerClass: string
  eyebrow: string
  title: ReactNode
  subtitle: string
  imageAlt?: string
  chips: HeroChip[]
  sectionClassName?: string
}

function render(o: HeroOpts): string {
  const slides = buildHeroSlides({
    eyebrow: o.eyebrow,
    title: o.title,
    subtitle: o.subtitle,
    imageAlt: o.imageAlt,
  })
  return renderToStaticMarkup(
    <>
      <header className={o.headerClass}>
        <Navbar activePath={o.activePath} />
      </header>
      <main>
        <HeroSlider
          slides={slides}
          onBook={() => {}}
          chips={o.chips}
          hideChipsOnMobile
          sectionClassName={o.sectionClassName}
        />
      </main>
    </>
  )
}

const stackedTitle = (top: string, bottom: string) => (
  <>
    {top}
    <br />
    <span className="text-sniffy-yellow">{bottom}</span>
  </>
)

/** Mirrors the hero in src/pages/PunePage.tsx / CatPunePage.tsx. */
export function hubHeroHtml(pet: 'dog' | 'cat', subtitle: string): string {
  const dog = pet === 'dog'
  return render({
    activePath: `/${pet}-grooming-in-pune`,
    headerClass: 'sticky top-0 z-50',
    eyebrow: dog ? 'AT-HOME DOG GROOMING' : 'AT-HOME CAT GROOMING',
    title: stackedTitle(dog ? 'Dog Grooming at Home' : 'Cat Grooming at Home', 'Across Pune'),
    subtitle,
    chips: [
      { icon: ShieldCheck, label: dog ? 'Trained groomers' : 'Cat-trained groomers' },
      { icon: Clock, label: '9 AM – 9 PM daily' },
      { icon: MapPin, label: dog ? 'Available across Pune' : '33 areas in Pune' },
    ],
    sectionClassName: PURPLE_SECTION,
  })
}

/** Mirrors src/components/location/LocationHero.tsx. */
export function locationHeroHtml(loc: {
  name: string
  slug: string
  heroH1: string
  heroSubtext: string
}): string {
  return render({
    activePath: `/dog-grooming-in-pune/${loc.slug}`,
    headerClass: 'sticky top-0 z-50',
    eyebrow: `${loc.name}, Pune`,
    title: highlightName(loc.heroH1, loc.name),
    subtitle: loc.heroSubtext,
    chips: [
      { icon: ShieldCheck, label: 'Trained groomers' },
      { icon: Clock, label: '9 AM – 9 PM daily' },
      { icon: MapPin, label: `${loc.name}, Pune` },
    ],
    sectionClassName: PURPLE_SECTION,
  })
}

/** Mirrors src/components/Hero.tsx (home page). */
export function homeHeroHtml(): string {
  return render({
    activePath: '/',
    headerClass: 'sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm',
    eyebrow: 'AT-HOME PET GROOMING',
    title: (
      <>
        Dog &amp; Cat Grooming
        <br />
        <span className="text-sniffy-yellow">at Home in Pune</span>
      </>
    ),
    subtitle:
      'Gentle care, expert hands, stress-free experience — a trained groomer comes to your doorstep.',
    imageAlt:
      'Trained Sniffy groomer bathing a dog at home in Pune during a doorstep grooming session',
    chips: [
      { icon: ShieldCheck, label: 'Trained groomers' },
      { icon: Clock, label: '9 AM - 9 PM daily' },
      { icon: MapPin, label: 'Multiple cities covered' },
    ],
  })
}

const SERVICE_CHIPS: HeroChip[] = [
  { icon: ShieldCheck, label: 'Trained groomers' },
  { icon: Clock, label: '9 AM – 9 PM daily' },
  { icon: MapPin, label: 'Available across Pune' },
]

/** Mirrors the hero in src/pages/ServicePage.tsx. */
export function serviceHeroHtml(s: {
  eyebrow: string
  h1Line1: string
  h1Accent: string
  heroSubtitle: string
  heroImageAlt: string
}): string {
  return render({
    activePath: '/services',
    headerClass: 'sticky top-0 z-50',
    eyebrow: s.eyebrow,
    title: stackedTitle(s.h1Line1, s.h1Accent),
    subtitle: s.heroSubtitle,
    imageAlt: s.heroImageAlt,
    chips: SERVICE_CHIPS,
    sectionClassName: PURPLE_SECTION.replace('pb-6', 'pb-4'),
  })
}

/** Mirrors the hero in src/pages/ServicesIndexPage.tsx. */
export function servicesIndexHeroHtml(subtitle: string): string {
  return render({
    activePath: '/services',
    headerClass: 'sticky top-0 z-50',
    eyebrow: 'GROOMING SERVICES',
    title: stackedTitle('Pet Grooming Services', 'at Home in Pune'),
    subtitle,
    imageAlt: 'Sniffy groomer providing a grooming service at a home in Pune',
    chips: SERVICE_CHIPS,
    sectionClassName: PURPLE_SECTION,
  })
}
