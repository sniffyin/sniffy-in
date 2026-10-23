/**
 * generateServicePages.ts — writes services/<slug>.html for every service page,
 * plus services/index.html, the /services hub.
 *
 * Output is committed (like the locality pages) and picked up by vite.config.ts
 * as extra build inputs. Each page ships:
 *   - full head metadata (title, description, canonical, hreflang, OG, Twitter)
 *   - JSON-LD: Service (with offers), WebPage, BreadcrumbList, FAQPage
 *   - the prerendered body (scripts/prerenderServiceBody.ts)
 *   - this page's content inlined as JSON for the React entry to read
 */
import fs from 'node:fs';
import path from 'node:path';
import { SERVICES } from '../src/data/services/index.ts';
import { SERVICE_NAV } from '../src/data/services/nav.ts';
import { SERVICES_INDEX_FAQS, SERVICES_INDEX_INTRO } from '../src/data/services/indexContent.ts';
import type { ServicePageData } from '../src/data/services/types.ts';
import { ALL_PUNE_CITIES } from '../src/data/puneLocalities.ts';
import { blogIndex } from '../src/data/blogIndex.ts';
import { PACKAGES, ADD_ONS } from '../src/pages/admin/types.ts';
import { heroImagePreloadTag } from './prerenderLocationBody.ts';
import { prerenderServiceBody, prerenderServicesIndexBody } from './prerenderServiceBody.ts';
import { clampDescription } from './seoText.ts';
import { lastEdited } from './gitDate.ts';

const ORIGIN = 'https://sniffy.in';
const outDir = path.join(process.cwd(), 'services');
fs.mkdirSync(outDir, { recursive: true });

// ── Guards: fail the build rather than ship drift ───────────────────────────
const navSlugs = SERVICE_NAV.map((s) => s.slug).join('|');
const serviceSlugs = SERVICES.map((s) => s.slug).join('|');
if (navSlugs !== serviceSlugs) {
  throw new Error(`generateServicePages: SERVICE_NAV (${navSlugs}) is out of step with SERVICES (${serviceSlugs}). Update src/data/services/nav.ts.`);
}

const areaSlugs = new Set(ALL_PUNE_CITIES.map((c) => c.slug.split('/').pop()!));
const blogSlugs = new Set(blogIndex.map((b) => b.slug));
const known = new Set(SERVICES.map((s) => s.slug));
for (const s of SERVICES) {
  for (const a of s.areaSlugs) if (!areaSlugs.has(a)) throw new Error(`${s.slug}: unknown area slug "${a}"`);
  for (const b of s.relatedBlogs) if (!blogSlugs.has(b)) throw new Error(`${s.slug}: unknown blog slug "${b}"`);
  for (const r of s.relatedServices) if (!known.has(r)) throw new Error(`${s.slug}: unknown related service "${r}"`);
  for (const sec of s.stories) {
    if (sec.link && sec.link.href.startsWith('/blogs/') && !blogSlugs.has(sec.link.href.replace('/blogs/', ''))) {
      throw new Error(`${s.slug}: story link to unknown blog ${sec.link.href}`);
    }
  }
}

// Every price quoted on a page must exist in the real price list.
const realPrices = new Set<number>([...PACKAGES.map((p) => p.price), ...ADD_ONS.map((a) => a.price)]);
for (const s of SERVICES) {
  for (const item of s.pricing.items) {
    const m = /₹\s*([\d,]+)/.exec(item.price);
    if (m && !realPrices.has(Number(m[1].replace(/,/g, '')))) {
      throw new Error(`${s.slug}: price "${item.price}" for ${item.label} is not in the published price list`);
    }
  }
}

const FILE_FOR: Record<string, string> = {
  'deshedding-treatment-in-pune': 'deshedding.ts',
  'dematting-and-coat-rescue-in-pune': 'dematting.ts',
  'puppy-and-kitten-first-groom-in-pune': 'puppyKitten.ts',
  'senior-pet-grooming-in-pune': 'senior.ts',
  'tick-and-flea-treatment-in-pune': 'tickFlea.ts',
  'anxious-and-nervous-pet-grooming-in-pune': 'anxious.ts',
  'medicated-bath-in-pune': 'medicated.ts',
};

const provider = {
  '@type': 'LocalBusiness',
  name: 'Sniffy',
  url: ORIGIN,
  telephone: '+918971313003',
  email: 'care@sniffy.in',
  logo: `${ORIGIN}/sniffy-logo.png`,
  address: { '@type': 'PostalAddress', addressLocality: 'Pune', addressRegion: 'MH', addressCountry: 'IN' },
};

const areaServedJson = [
  { '@type': 'City', name: 'Pune' },
  ...ALL_PUNE_CITIES.map((c) => ({ '@type': 'Place', name: `${c.name}, Pune` })),
];

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const jsonLd = (o: unknown) => `    <script type="application/ld+json">${JSON.stringify(o)}</script>`;

function offersFor(s: ServicePageData) {
  return s.pricing.items.flatMap((i) => {
    const m = /₹\s*([\d,]+)/.exec(i.price);
    if (!m) return [];
    return [
      {
        '@type': 'Offer',
        name: i.label,
        description: i.note,
        price: m[1].replace(/,/g, ''),
        priceCurrency: 'INR',
        url: `${ORIGIN}/services/${s.slug}`,
      },
    ];
  });
}

interface HeadOpts {
  title: string;
  description: string;
  path: string;
  schemas: object[];
  ogAlt: string;
}

function head(o: HeadOpts): string {
  const url = `${ORIGIN}${o.path}`;
  return `    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${heroImagePreloadTag()}

    <title>${attr(o.title)}</title>
    <meta name="description" content="${attr(o.description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${url}" />
    <link rel="alternate" hreflang="en-IN" href="${url}" />
    <link rel="alternate" hreflang="x-default" href="${url}" />

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

    <meta property="og:type" content="website" />
    <meta property="og:title" content="${attr(o.title)}" />
    <meta property="og:description" content="${attr(o.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${ORIGIN}/sniffy-logo.png" />
    <meta property="og:image:alt" content="${attr(o.ogAlt)}" />
    <meta property="og:site_name" content="Sniffy" />
    <meta property="og:locale" content="en_IN" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${attr(o.title)}" />
    <meta name="twitter:description" content="${attr(o.description)}" />

${o.schemas.map(jsonLd).join('\n')}`;
}

function wrap(headHtml: string, body: string, entry: string, extra = ''): string {
  return `<!doctype html>
<html lang="en-IN">
  <head>
${headHtml}
  </head>

  <body>
    <!--
      #root is pre-filled so non-JS crawlers see the page text. createRoot()
      clears this container on mount, so React fully replaces it.
    -->
    <div id="root">
${body}
    </div>
${extra}
    <script type="module" src="${entry}"></script>
  </body>
</html>
`;
}

const breadcrumb = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Home', path: '/' }, ...items].map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: it.path === '/' ? `${ORIGIN}/` : `${ORIGIN}${it.path}`,
  })),
});

const faqSchema = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

// ── Individual service pages ────────────────────────────────────────────────
for (const s of SERVICES) {
  const pagePath = `/services/${s.slug}`;
  const modified = lastEdited([`src/data/services/${FILE_FOR[s.slug]}`, 'src/data/services/types.ts']);

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${ORIGIN}${pagePath}#service`,
      name: s.name,
      serviceType: s.serviceType,
      description: s.quickAnswer,
      url: `${ORIGIN}${pagePath}`,
      image: `${ORIGIN}/images/grooming-session-1.jpg`,
      provider,
      areaServed: areaServedJson,
      audience: { '@type': 'Audience', audienceType: s.audience },
      availableChannel: { '@type': 'ServiceChannel', serviceLocation: { '@type': 'Place', name: "The customer's home, Pune" } },
      hasOfferCatalog: { '@type': 'OfferCatalog', name: `${s.name} pricing`, itemListElement: offersFor(s) },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${ORIGIN}${pagePath}#page`,
      url: `${ORIGIN}${pagePath}`,
      name: s.seoTitle.replace(/\s*\|\s*Sniffy$/, ''),
      description: s.seoDescription,
      inLanguage: 'en-IN',
      about: { '@id': `${ORIGIN}${pagePath}#service` },
      dateModified: modified,
      primaryImageOfPage: { '@type': 'ImageObject', url: `${ORIGIN}/images/grooming-session-1.jpg` },
    },
    breadcrumb([{ name: 'Services', path: '/services' }, { name: s.shortName, path: pagePath }]),
    faqSchema(s.faqs),
  ];

  const description = clampDescription(s.seoDescription, `service ${s.slug}`);
  const json = JSON.stringify(s).replace(/</g, '\\u003c');
  const html = wrap(
    head({ title: s.seoTitle, description, path: pagePath, schemas, ogAlt: s.heroImageAlt }),
    prerenderServiceBody(s),
    '/src/entries/service.tsx',
    `    <script type="application/json" id="sniffy-service-data">${json}</script>`
  );
  fs.writeFileSync(path.join(outDir, `${s.slug}.html`), html);
  console.log(`Generated: services/${s.slug}.html`);
}

// ── /services hub ───────────────────────────────────────────────────────────
{
  const title = 'Pet Grooming Services at Home in Pune | Sniffy';
  const description = clampDescription(
    'De-shedding, de-matting, first grooms, senior care, tick and flea care, calm handling and medicated baths at home in Pune, from ₹799. See every service.',
    'services hub'
  );
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${ORIGIN}/services#page`,
      url: `${ORIGIN}/services`,
      name: 'Pet grooming services at home in Pune',
      description,
      inLanguage: 'en-IN',
      about: provider,
      dateModified: lastEdited(['src/data/services']),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: SERVICES.length,
        itemListElement: SERVICES.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: s.name,
          url: `${ORIGIN}/services/${s.slug}`,
        })),
      },
    },
    breadcrumb([{ name: 'Services', path: '/services' }]),
    faqSchema(SERVICES_INDEX_FAQS),
  ];
  const html = wrap(
    head({ title, description, path: '/services', schemas, ogAlt: SERVICES_INDEX_INTRO.hero }),
    prerenderServicesIndexBody(),
    '/src/entries/servicesIndex.tsx'
  );
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  console.log('Generated: services/index.html');
}
