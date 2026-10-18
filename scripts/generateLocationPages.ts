import fs from "fs"
import path from "path"
import { locationsSEO } from '../src/data/locationsSEO.ts'
import { LOCATION_CONTENT } from '../src/data/locationRegistry.ts'
import { prerenderLocationBody, faqSchemaTag, offerCatalogJson, locationDataScript } from './prerenderLocationBody.ts'
import { clampDescription } from './seoText.ts'
// Safe to emit here because prerenderLocationBody() renders the same rating in
// the page body (ratingSummaryHtml). Don't add it to a page that doesn't.
import { aggregateRatingJson } from '../src/data/reputation.ts'

const outputRoot = path.join(process.cwd(), "dog-grooming-in-pune")

if (!fs.existsSync(outputRoot)) {
  fs.mkdirSync(outputRoot, { recursive: true })
}

locationsSEO.forEach((loc) => {

  // Body copy lives in locationData.ts (keyed by slug), separate from the
  // <head> metadata in locationsSEO.ts. Fail loudly rather than silently
  // emitting an empty page if the two ever fall out of alignment.
  const content = LOCATION_CONTENT[loc.slug as keyof typeof LOCATION_CONTENT]

  if (!content) {
    throw new Error(
      `generateLocationPages: no LOCATION_CONTENT entry for slug "${loc.slug}". ` +
      `Add it to src/data/locationRegistry.ts, or remove the slug from locationsSEO.ts.`
    )
  }

  const prerenderedBody = prerenderLocationBody(content.location, content.reviews, content.faqs, 'dog')
  const faqSchema = faqSchemaTag(content.faqs)

  // Offer/OfferCatalog built from the same packages.ts arrays the body
  // renders, so every price in this markup is visible on the page — a hard
  // requirement for price structured data.
  const offerCatalog = offerCatalogJson('dog', `https://sniffy.in/dog-grooming-in-pune/${loc.slug}`)

  const nearbyAreas = loc.nearby
    .map(area => `{ "@type": "Place", "name": "${area}, Pune" }`)
    .join(",\n          ")

  const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>${loc.title}</title>

    <meta name="description" content="${clampDescription(loc.description, `dog/${loc.slug}`)}" />

    <meta name="robots" content="index, follow" />

    <link rel="canonical" href="https://sniffy.in/dog-grooming-in-pune/${loc.slug}" />

    <meta name="geo.region" content="IN-MH" />
    <meta name="geo.placename" content="${loc.name}, Pune" />
    <meta name="geo.position" content="${loc.lat};${loc.lng}" />
    <meta name="ICBM" content="${loc.lat}, ${loc.lng}" />

    <link rel="icon" href="/favicon.ico" sizes="48x48">
    <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96"/>
    <link rel="shortcut icon" href="/favicon/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />

    <meta name="apple-mobile-web-app-title" content="Sniffy" />
    <link rel="manifest" href="/favicon/site.webmanifest" />

    <!-- OpenGraph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${loc.ogTitle}" />
    <meta property="og:description" content="${loc.ogDescription}" />
    <meta property="og:url" content="https://sniffy.in/dog-grooming-in-pune/${loc.slug}" />
    <meta property="og:image" content="https://sniffy.in/sniffy-logo.png" />
    <meta property="og:site_name" content="Sniffy" />
    <meta property="og:locale" content="en_IN" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${loc.twitterTitle}" />
    <meta name="twitter:description" content="${loc.twitterDescription}" />

    <!-- Local Business Schema -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://sniffy.in/dog-grooming-in-pune/${loc.slug}#petgrooming",
        "name": "Sniffy Dog Grooming — ${loc.name}",
        "url": "https://sniffy.in/dog-grooming-in-pune/${loc.slug}",
        "image": "https://sniffy.in/images/grooming-session-1.jpg",
        "logo": "https://sniffy.in/sniffy-logo.png",
        "telephone": "+918971313003",
        "email": "care@sniffy.in",

        "address": {
          "@type": "PostalAddress",
          "addressLocality": "${loc.name}",
          "addressRegion": "MH",
          "postalCode": "${loc.postal}",
          "addressCountry": "IN"
        },

        "geo": {
          "@type": "GeoCoordinates",
          "latitude": ${loc.lat},
          "longitude": ${loc.lng}
        },

        "areaServed": [
          { "@type": "Place", "name": "${loc.name}, Pune" },
          ${nearbyAreas}
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

    <!-- Breadcrumb Schema -->
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
          },

          {
            "@type": "ListItem",
            "position": 3,
            "name": "Dog Grooming in ${loc.name}",
            "item": "https://sniffy.in/dog-grooming-in-pune/${loc.slug}"
          }

        ]
      }
    </script>

    <!-- FAQ Schema — generated from the same FAQ array the body renders -->
${faqSchema}

  </head>

  <body>
    <!--
      #root is pre-filled with the page's text content so crawlers that do not
      execute JavaScript still see it. The entry below mounts with
      createRoot().render(), which CLEARS this container before its first
      render — so React replaces all of it and no hydration mismatch is
      possible. See scripts/prerenderLocationBody.ts.
    -->
    <div id="root">
${prerenderedBody}
    </div>
${locationDataScript(content.location, content.reviews, content.faqs)}
    <script type="module" src="/src/entries/location.tsx"></script>
  </body>
</html>
`

const filePath = path.join(outputRoot, `${loc.slug}.html`)

fs.writeFileSync(filePath, html.trim())

console.log("Generated:", loc.slug)

})