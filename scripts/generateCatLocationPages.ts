import fs from "fs"
import path from "path"
import { catLocationsSEO } from '../src/data/catLocationsSEO.ts'

const outputRoot = path.join(process.cwd(), "cat-grooming-in-pune")

if (!fs.existsSync(outputRoot)) {
  fs.mkdirSync(outputRoot, { recursive: true })
}

catLocationsSEO.forEach((loc) => {

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

    <meta name="description" content="${loc.description}" />

    <meta name="robots" content="index, follow" />

    <link rel="canonical" href="https://sniffy.in/cat-grooming-in-pune/${loc.slug}" />

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
    <meta property="og:url" content="https://sniffy.in/cat-grooming-in-pune/${loc.slug}" />
    <meta property="og:image" content="https://sniffy.in/sniffy-logo.png" />
    <meta property="og:locale" content="en_IN" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${loc.twitterTitle}" />
    <meta name="twitter:description" content="${loc.twitterDescription}" />

    <!-- Local Business Schema -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "PetGrooming",
        "@id": "https://sniffy.in/cat-grooming-in-pune/${loc.slug}#petgrooming",
        "name": "Sniffy Cat Grooming — ${loc.name}",
        "url": "https://sniffy.in/cat-grooming-in-pune/${loc.slug}",
        "image": "https://sniffy.in/sniffy-logo.png",
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

        "serviceType": "Cat Grooming at Home",

        "priceRange": "₹799 - ₹1299",

        "paymentAccepted": "Cash, UPI",
        "currenciesAccepted": "INR",

        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
          ],
          "opens": "09:00",
          "closes": "21:00"
        },

        "sameAs": [
          "https://www.instagram.com/sniffy.in"
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
            "name": "Cat Grooming in Pune",
            "item": "https://sniffy.in/cat-grooming-in-pune"
          },

          {
            "@type": "ListItem",
            "position": 3,
            "name": "Cat Grooming in ${loc.name}",
            "item": "https://sniffy.in/cat-grooming-in-pune/${loc.slug}"
          }

        ]
      }
    </script>

  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/entries/catLocation.tsx"></script>
  </body>
</html>
`

const filePath = path.join(outputRoot, `${loc.slug}.html`)

fs.writeFileSync(filePath, html.trim())

console.log("Generated:", loc.slug)

})
