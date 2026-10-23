/**
 * Shared head/schema builders for the two Pune hub generators
 * (generatePunePage.ts, generateCatPunePage.ts).
 *
 * Everything here is derived from the same arrays the page body renders
 * (hub FAQs, the locality list), so structured data cannot drift from content.
 */

interface City {
  name: string
  slug: string
}

interface HubFaq {
  q: string
  a: string
}

const indentJson = (obj: unknown, pad: number) =>
  JSON.stringify(obj, null, 2)
    .split('\n')
    .map((l, i) => (i === 0 ? l : ' '.repeat(pad) + l))
    .join('\n')

/** areaServed array body for the LocalBusiness node — every locality, not a sample. */
export function areaServedJson(cities: City[], pad = 8): string {
  return indentJson(
    cities.map((c) => ({ '@type': 'Place', name: `${c.name}, Pune` })),
    pad
  )
}

/** FAQPage <script> built from the exact FAQs the body renders. JSON.stringify handles escaping. */
export function hubFaqSchemaTag(faqs: HubFaq[]): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  return `<script type="application/ld+json">\n${indentJson(schema, 6)}\n    </script>`
}

/** ItemList of locality landing pages — tells Google the hub is the parent of these URLs. */
export function localityItemListTag(
  cities: City[],
  basePath: string,
  listName: string
): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: cities.length,
    itemListElement: cities.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${listName.split(' in ')[0]} in ${c.name}, Pune`,
      url: `https://sniffy.in/${basePath}/${c.slug}`,
    })),
  }
  return `<script type="application/ld+json">\n${indentJson(schema, 6)}\n    </script>`
}
