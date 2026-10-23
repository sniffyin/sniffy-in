/**
 * scripts/generateCatPunePage.ts
 *
 * Generates: cat-grooming-in-pune/index.html
 *
 * Run with:  npx tsx scripts/generateCatPunePage.ts
 * (add to package.json scripts alongside generateCatLocationPages)
 *
 * The HTML shell contains:
 *  - City-level title + description for cat grooming in Pune
 *  - LocalBusiness schema scoped to Pune (all 33 localities in areaServed)
 *  - BreadcrumbList schema (Home → Cat Grooming in Pune)
 *  - FAQPage schema
 *  - OpenGraph + Twitter cards
 *  - Points to src/entries/catPune.tsx as the JS entry
 */

import fs from 'fs'
import path from 'path'
import { ALL_CAT_PUNE_CITIES } from '../src/data/catLocationData.ts'
// Aliased — see generatePunePage.ts.
import {
  stats as hubStats,
  whySections as hubWhySections,
  reviews as hubReviews,
  faqs as hubFaqs,
} from '../src/data/catPuneHubContent.ts'
import { heroImagePreloadTag, prerenderHubBody, offerCatalogJson } from './prerenderLocationBody.ts'
import { clampDescription } from './seoText.ts'
import { stampPage, flushPageDates, LM_ISO } from './pageDates.ts'
import { areaServedJson, hubFaqSchemaTag, localityItemListTag } from './hubSeo.ts'
// One business, one Google Business Profile, one rating — the cat hub used to
// claim its own separate "4.9 from 85", which was invented. See reputation.ts.
import { aggregateRatingJson } from '../src/data/reputation.ts'


const outputRoot = path.join(process.cwd(), 'cat-grooming-in-pune')

if (!fs.existsSync(outputRoot)) {
  fs.mkdirSync(outputRoot, { recursive: true })
}

// Reviews are the ones rendered in the page body (hubReviews), nothing extra.
const reviewJson = JSON.stringify(
  hubReviews.map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.name },
    reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
    reviewBody: r.text,
  })),
  null,
  2
)
  .split('\n')
  .map((l, i) => (i === 0 ? l : '        ' + l))
  .join('\n')

const faqSchema = hubFaqSchemaTag(hubFaqs)
const localityList = localityItemListTag(ALL_CAT_PUNE_CITIES, 'cat-grooming-in-pune', 'Cat Grooming in Pune')
const areaServed = areaServedJson(ALL_CAT_PUNE_CITIES)

const prerenderedBody = prerenderHubBody({
  h1: 'Cat Grooming at Home Across Pune',
  intro: 'Professional in-home cat grooming across 33 areas in Pune. No carrier. No salon stress. A trained groomer comes to your home.',
  stats: hubStats,
  whySections: hubWhySections,
  reviews: hubReviews,
  faqs: hubFaqs,
  cities: ALL_CAT_PUNE_CITIES,
}, 'cat')

// Offer/OfferCatalog from the same packages.ts arrays prerenderHubBody renders,
// so no price appears in markup that is absent from the page.
const offerCatalog = offerCatalogJson('cat', 'https://sniffy.in/cat-grooming-in-pune')

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${heroImagePreloadTag()}

    <title>Cat Grooming at Home in Pune from ₹799 | 33 Areas | Sniffy</title>

    <!-- Rewritten from a 230-char version whose locality list was cut off by
         Google. The areas are already linked on the page and in areaServed. -->
    <meta name="description" content="${clampDescription('Book cat grooming at home anywhere in Pune from ₹799. No carrier, no salon stress — a cat-trained groomer visits your door across 33 localities.', 'cat hub')}" />

    <meta name="robots" content="index, follow" />

    <link rel="canonical" href="https://sniffy.in/cat-grooming-in-pune" />

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
    <meta property="og:title" content="Cat Grooming at Home in Pune from ₹799 | Sniffy" />
    <meta property="og:description" content="Professional in-home cat grooming across 33 areas in Pune. No carrier needed — trained groomers visit your door. Starting ₹799." />
    <meta property="og:url" content="https://sniffy.in/cat-grooming-in-pune" />
    <meta property="og:image" content="https://sniffy.in/images/grooming-session-1.jpg" />
    <meta property="og:image:alt" content="Sniffy groomer grooming a cat at home in Pune" />
    <meta property="og:site_name" content="Sniffy" />
    <meta property="og:locale" content="en_IN" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="https://sniffy.in/images/grooming-session-1.jpg" />
    <meta name="twitter:title" content="Cat Grooming at Home in Pune | Sniffy" />
    <meta name="twitter:description" content="In-home cat grooming across 33 Pune localities. Cat-trained groomers, no carrier needed. From ₹799." />

    <!-- LocalBusiness Schema — city-level -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://sniffy.in/cat-grooming-in-pune#petgrooming",
        "name": "Sniffy — Cat Grooming at Home in Pune",
        "parentOrganization": { "@id": "https://sniffy.in/#petgrooming" },
        "url": "https://sniffy.in/cat-grooming-in-pune",
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
        "areaServed": ${areaServed},
        "knowsAbout": "Cat grooming at home",
        "hasOfferCatalog": ${offerCatalog},

        "priceRange": "₹799 - ₹1299",
        "paymentAccepted": "Cash, UPI",
        "currenciesAccepted": "INR",
        "aggregateRating": ${aggregateRatingJson()},
        "review": ${reviewJson},
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
            "name": "Cat Grooming in Pune",
            "item": "https://sniffy.in/cat-grooming-in-pune"
          }
        ]
      }
    </script>

    <!-- FAQPage Schema -->
    ${faqSchema}

    ${localityList}

    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": "https://sniffy.in/cat-grooming-in-pune#webpage",
        "url": "https://sniffy.in/cat-grooming-in-pune",
        "name": "Cat Grooming at Home in Pune",
        "inLanguage": "en-IN",
        "dateModified": "${LM_ISO}",
        "isPartOf": { "@id": "https://sniffy.in/#website" },
        "about": { "@id": "https://sniffy.in/#cat-grooming" },
        "primaryImageOfPage": { "@type": "ImageObject", "url": "https://sniffy.in/images/grooming-session-1.jpg" },
        "publisher": { "@id": "https://sniffy.in/#petgrooming" }
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
    <script type="module" src="/src/entries/catPune.tsx"></script>
  </body>
</html>`

const filePath = path.join(outputRoot, 'index.html')
fs.writeFileSync(filePath, stampPage('cat-grooming-in-pune', html.trim()))
flushPageDates()
console.log('Generated: cat-grooming-in-pune/index.html')
