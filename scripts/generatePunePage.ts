/**
 * scripts/generatePunePage.ts
 *
 * Generates: dog-grooming-in-pune/index.html
 *
 * Run with:  npx tsx scripts/generatePunePage.ts
 * (or add to package.json scripts alongside generateLocationPages)
 *
 * The HTML shell contains:
 *  - Pune city-level title + description
 *  - LocalBusiness schema scoped to all of Pune (not a single locality)
 *  - BreadcrumbList schema (Home → Dog Grooming in Pune)
 *  - FAQPage schema pulling from the page FAQs
 *  - OpenGraph + Twitter cards
 *  - Points to src/entries/pune.tsx as the JS entry
 */

import fs from 'fs'
import path from 'path'
import { ALL_PUNE_CITIES } from '../src/data/locationData.ts'
// Aliased: this generator already declares its own local `faqs` for the
// FAQPage schema below. These are the page component's arrays, used so the
// prerendered body matches exactly what React renders on top of it.
import {
  stats as hubStats,
  whySections as hubWhySections,
  faqs as hubFaqs,
  reviews as hubReviews,
} from '../src/data/puneHubContent.ts'
import { heroImagePreloadTag, prerenderHubBody, offerCatalogJson } from './prerenderLocationBody.ts'
import { clampDescription } from './seoText.ts'
// The rating below is real, sourced from the Google Business Profile, and is
// rendered in the page body by prerenderHubBody() — all three of which are
// required for it to be legitimate markup. See src/data/reputation.ts.
import { aggregateRatingJson } from '../src/data/reputation.ts'


const outputRoot = path.join(process.cwd(), 'dog-grooming-in-pune')

if (!fs.existsSync(outputRoot)) {
  fs.mkdirSync(outputRoot, { recursive: true })
}

// FAQ content — keep in sync with PunePage.tsx faqs array
const faqs = [
  {
    q: 'Do you cover all areas of Pune?',
    a: 'Our services are available across Pune, covering areas such as Wakad, Wagholi, Kothrud, Shivajinagar, Kondhwa, NIBM, Dhanori and Pimpri-Chinchwad.',
  },
  {
    q: 'What does a standard session include?',
    a: 'Bath with shampoo and conditioner, blow dry, brushing, nail clipping, eye and ear cleaning, paw massage, mouth spray, and a light perfume spritz.',
  },
  {
    q: 'How long does a session take?',
    a: 'Between 1.5 and 3 hours depending on breed, coat type and temperament.',
  },
  {
    q: 'What if my dog is anxious or has never been groomed before?',
    a: 'Tell us when you book. We send a groomer experienced with anxious dogs and allow extra time. First sessions are always slower — we let the dog settle and take breaks when needed.',
  },
  {
    q: 'How is this different from a salon?',
    a: 'At a salon your dog is caged between steps, surrounded by other animals. At home there is no travel stress, no cage, no other animals, and one groomer focused entirely on your dog.',
  },
  {
    q: 'How often should I book?',
    a: 'Short-haired dogs every 6–8 weeks. Medium coats like Goldens every 4–6 weeks. Double-coated breeds every 3–4 weeks. Continuously growing coats every 3–4 weeks for a bath, haircut every 6–8 weeks.',
  },
]

const faqSchema = faqs
  .map(
    (f) => `{
        "@type": "Question",
        "name": "${f.q.replace(/"/g, '\\"')}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${f.a.replace(/"/g, '\\"')}"
        }
      }`
  )
  .join(',\n      ')

const prerenderedBody = prerenderHubBody({
  h1: 'Dog Grooming at Home Across Pune',
  intro: 'Doorstep pet grooming services across Pune. Trained groomers visit your home — fully equipped, on time, no salon stress.',
  stats: hubStats,
  whySections: hubWhySections,
  reviews: hubReviews,
  faqs: hubFaqs,
  cities: ALL_PUNE_CITIES,
}, 'dog')

// Offer/OfferCatalog from the same packages.ts arrays prerenderHubBody renders,
// so no price appears in markup that is absent from the page.
const offerCatalog = offerCatalogJson('dog', 'https://sniffy.in/dog-grooming-in-pune')

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${heroImagePreloadTag()}

    <title>Dog Grooming at Home in Pune | All Areas Covered | Sniffy</title>

    <!-- Rewritten from a 222-char version that Google cut mid-list, and that
         opened by promising "dog and cat grooming" on the DOG hub. Locality
         names are carried by the on-page links and areaServed below; spending
         the visible description on eight of the 33 was the wrong trade. -->
    <meta name="description" content="${clampDescription('Book dog grooming at home anywhere in Pune from ₹799. A trained groomer comes to your door across 33 localities — bath, haircut, nail and ear care.', 'dog hub')}" />

    <meta name="robots" content="index, follow" />

    <link rel="canonical" href="https://sniffy.in/dog-grooming-in-pune" />

    <meta name="geo.region" content="IN-MH" />
    <meta name="geo.placename" content="Pune, Maharashtra" />
    <meta name="geo.position" content="18.5204;73.8567" />
    <meta name="ICBM" content="18.5204, 73.8567" />

    <link rel="icon" href="/favicon.ico" sizes="48x48">
    <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96"/>
    <link rel="shortcut icon" href="/favicon/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-title" content="Sniffy" />
    <link rel="manifest" href="/favicon/site.webmanifest" />

    <!-- OpenGraph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Dog Grooming at Home in Pune | All Areas | Sniffy" />
    <meta property="og:description" content="Professional in-home dog grooming across Pune. Trained groomers come to your doorstep for bath, trim, nail care and more. Starting at ₹799." />
    <meta property="og:url" content="https://sniffy.in/dog-grooming-in-pune" />
    <meta property="og:image" content="https://sniffy.in/sniffy-logo.png" />
    <meta property="og:site_name" content="Sniffy" />
    <meta property="og:locale" content="en_IN" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Dog Grooming at Home in Pune | Sniffy" />
    <meta name="twitter:description" content="In-home dog grooming across Wakad, Wagholi, Kothrud, Shivajinagar, Kondhwa, NIBM, Dhanori and Pimpri-Chinchwad. From ₹799." />

    <!-- LocalBusiness Schema — city-level, areaServed lists all localities -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://sniffy.in/dog-grooming-in-pune#petgrooming",
        "name": "Sniffy — Dog Grooming at Home in Pune",
        "url": "https://sniffy.in/dog-grooming-in-pune",
        "image": "https://sniffy.in/images/grooming-session-1.jpg",
        "logo": "https://sniffy.in/sniffy-logo.png",
        "telephone": "+918971313003",
        "email": "care@sniffy.in",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Pune",
          "addressRegion": "MH",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 18.5204,
          "longitude": 73.8567
        },
        "areaServed": [
          { "@type": "Place", "name": "Wakad, Pune" },
          { "@type": "Place", "name": "Wagholi, Pune" },
          { "@type": "Place", "name": "Kothrud, Pune" },
          { "@type": "Place", "name": "Shivajinagar, Pune" },
          { "@type": "Place", "name": "Kondhwa, Pune" },
          { "@type": "Place", "name": "NIBM, Pune" },
          { "@type": "Place", "name": "Dhanori, Pune" },
          { "@type": "Place", "name": "Pimpri-Chinchwad, Pune" }
        ],
        "knowsAbout": "Dog grooming at home",
        "hasOfferCatalog": ${offerCatalog},

        "priceRange": "₹799 - ₹1299",
        "paymentAccepted": "Cash, UPI",
        "currenciesAccepted": "INR",
        "aggregateRating": ${aggregateRatingJson()},
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
          ],
          "opens": "09:00",
          "closes": "21:00"
        },
        "sameAs": [
          "https://www.instagram.com/sniffy.in",
          "https://g.page/r/CdJR67bjxy_gEBI"
        ]
      }
    </script>

    <!-- BreadcrumbList Schema -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://sniffy.in"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Dog Grooming in Pune",
            "item": "https://sniffy.in/dog-grooming-in-pune"
          }
        ]
      }
    </script>

    <!-- FAQPage Schema -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
      ${faqSchema}
        ]
      }
    </script>

  </head>

  <body>
    <!--
      #root is pre-filled so non-JS crawlers see the page text. createRoot()
      clears this container on mount, so React fully replaces it.
    -->
    <div id="root">
${prerenderedBody}
    </div>
    <script type="module" src="/src/entries/pune.tsx"></script>
  </body>
</html>`

const filePath = path.join(outputRoot, 'index.html')
fs.writeFileSync(filePath, html.trim())
console.log('Generated: dog-grooming-in-pune/index.html')
