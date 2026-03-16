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
 *  - LocalBusiness schema scoped to Pune (all 29 localities in areaServed)
 *  - BreadcrumbList schema (Home → Cat Grooming in Pune)
 *  - FAQPage schema
 *  - OpenGraph + Twitter cards
 *  - Points to src/entries/catPune.tsx as the JS entry
 */

import fs from 'fs'
import path from 'path'

const outputRoot = path.join(process.cwd(), 'cat-grooming-in-pune')

if (!fs.existsSync(outputRoot)) {
  fs.mkdirSync(outputRoot, { recursive: true })
}

const faqs = [
  {
    q: 'Do you cover all areas of Pune for cat grooming?',
    a: 'We cover 29 localities across Pune including Wakad, Wagholi, Kothrud, Shivajinagar, Kondhwa, NIBM, Dhanori, Pimpri-Chinchwad, Baner, Kharadi, Kalyani Nagar, Viman Nagar, Hadapsar, Koregaon Park, Camp, Wanowrie and more. Check the area listing on this page for the full list.',
  },
  {
    q: 'What does a cat grooming session include?',
    a: 'Bath with cat-specific shampoo and conditioner, blow-dry on low heat, brushing and de-matting, nail trimming (front and back), ear cleaning, eye area wipe, and a coat condition assessment. Haircuts like lion cuts are available as an add-on.',
  },
  {
    q: 'How is cat grooming different from dog grooming?',
    a: 'Cats require pH-balanced cat-specific shampoo (dog shampoo can be toxic to cats), low-restraint handling techniques, different drying approaches with lower heat, and significantly more patience with session pacing. Our groomers are trained specifically for cat handling.',
  },
  {
    q: 'My cat has never been groomed professionally — will it go okay?',
    a: 'First sessions are always slower and more exploratory. We let the cat investigate the groomer and tools at their own pace, take breaks when needed, and never rush any step. Each subsequent session goes more smoothly as the cat gets used to the process.',
  },
  {
    q: 'My cat is aggressive with strangers — can you still groom them?',
    a: 'We use low-restraint techniques and read cat body language carefully throughout the session. If a cat is genuinely distressed we pause, allow them to settle, and resume when ready. We never force a step. In some cases a complete session requires more than one visit.',
  },
  {
    q: 'How often should I book cat grooming?',
    a: 'Shorthair cats every 8–10 weeks. Longhair breeds like Persians and Maine Coons every 4–6 weeks to prevent matting. Outdoor cats every 4–6 weeks with a tick check at each session. During Pune\'s monsoon season, frequencies move slightly closer together as humidity accelerates coat problems.',
  },
  {
    q: 'Can you do a lion cut for my Persian cat?',
    a: 'Yes, lion cuts and other haircuts are available as add-ons to the standard grooming session. They are most recommended for heavily matted Persians or cats who are very mat-prone in Pune\'s humidity. Mention it when booking so we can plan enough session time.',
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

const areaServed = [
  'Dhanori', 'Wagholi', 'Kalyani Nagar', 'Lohegaon', 'Kharadi', 'Viman Nagar',
  'Mundwa', 'Koregaon Park', 'Kothrud', 'Shivajinagar', 'Dhayari', 'Karve Nagar',
  'Ambegaon', 'Baner', 'Bavdhan', 'Wakad', 'Pimpri-Chinchwad', 'Khadki', 'Ravet',
  'Aundh', 'Kalewadi', 'Kondhwa', 'NIBM', 'Katraj', 'Handewadi', 'Hadapsar',
  'Bibewadi', 'Camp', 'Wanowrie'
].map(a => `{ "@type": "Place", "name": "${a}, Pune" }`).join(',\n          ')

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>Cat Grooming at Home in Pune | All Areas Covered | Sniffy</title>

    <meta name="description" content="Professional cat grooming at your home across Pune — no carrier, no salon stress. Trained groomers visit your door across 29 areas including Wakad, Kothrud, Baner, Kharadi, Kondhwa, NIBM, Koregaon Park and more. Starting ₹799." />

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
    <meta property="og:title" content="Cat Grooming at Home in Pune | All Areas | Sniffy" />
    <meta property="og:description" content="Professional in-home cat grooming across 29 areas in Pune. No carrier needed — trained groomers visit your door. Starting ₹799." />
    <meta property="og:url" content="https://sniffy.in/cat-grooming-in-pune" />
    <meta property="og:image" content="https://sniffy.in/sniffy-logo.png" />
    <meta property="og:locale" content="en_IN" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Cat Grooming at Home in Pune | Sniffy" />
    <meta name="twitter:description" content="In-home cat grooming across 29 Pune localities. Cat-trained groomers, no carrier needed. From ₹799." />

    <!-- LocalBusiness Schema — city-level -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "PetGrooming",
        "@id": "https://sniffy.in/cat-grooming-in-pune#petgrooming",
        "name": "Sniffy — Cat Grooming at Home in Pune",
        "url": "https://sniffy.in/cat-grooming-in-pune",
        "image": "https://sniffy.in/sniffy-logo.png",
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
          ${areaServed}
        ],
        "serviceType": "Cat Grooming at Home",
        "priceRange": "₹799 - ₹1299",
        "paymentAccepted": "Cash, UPI",
        "currenciesAccepted": "INR",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "85",
          "bestRating": "5"
        },
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
    <div id="root"></div>
    <script type="module" src="/src/entries/catPune.tsx"></script>
  </body>
</html>`

const filePath = path.join(outputRoot, 'index.html')
fs.writeFileSync(filePath, html.trim())
console.log('Generated: cat-grooming-in-pune/index.html')
