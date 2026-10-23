/**
 * prerenderLocationBody — turns a LocationConfig into static HTML for the
 * generated locality pages' <body>.
 *
 * ── Why ──────────────────────────────────────────────────────────────────────
 * The generated pages used to ship `<body><div id="root"></div></body>`, so
 * every word of locality copy — stories, reviews, FAQs, and the internal links
 * between the 59 pages — existed only after the JS bundle executed. Google's
 * renderer eventually sees that, but the render queue lags crawling, and Bing
 * and most AI answer engines never run JS at all.
 *
 * ── Why this is safe ─────────────────────────────────────────────────────────
 * The entries (`src/entries/location.tsx`, `catLocation.tsx`) mount with
 * `createRoot(...).render(...)`. React 18's createRoot CLEARS the container
 * before its first render — it does not hydrate — so this markup is discarded
 * the moment React mounts. That makes a hydration mismatch structurally
 * impossible, and means this HTML does not have to mirror the components' DOM
 * exactly. It only has to carry the same TEXT (so crawlers and users see the
 * same content) and look close enough that the swap isn't jarring.
 *
 * Being replaced also means we deliberately emit no interactive controls here —
 * no booking buttons, no carousel. Those would be dead until React mounts.
 * Links are the exception: they work immediately and are the point of the
 * exercise for crawlers.
 *
 * ── Keeping it in sync ───────────────────────────────────────────────────────
 * Text comes from the same `locationData.ts` / `catLocationData.ts` the React
 * components read, so the two cannot drift in CONTENT. Only the presentation
 * is duplicated. If you restructure the story/review/FAQ components, update the
 * classes here too — or don't, and accept a slightly plainer pre-mount frame.
 */
import { HUB_SIBLING } from '../src/data/hubMeta.ts';
import { LM_ISO, LM_HUMAN } from './pageDates.ts';
import { hubHeroHtml, locationHeroHtml } from './prerenderHero.tsx';
import { SERVICE_NAV } from '../src/data/services/nav.ts';
import type { LocationConfig, LocationStorySection } from '../src/components/location/LocationHero.ts';
import { deriveStoryMeta } from '../src/data/storyMeta.ts';
import { blogPosts, type BlogAudience } from '../src/data/blogPosts.ts';
import {
  RATING_DISPLAY,
  REVIEW_COUNT,
  BEST_RATING,
  RATING_SOURCE,
} from '../src/data/reputation.ts';
import { GOOGLE_PROFILE_URL } from '../src/data/siteLinks.ts';
import { siblingLocality, localityLinkPrefix } from '../src/data/puneLocalities.ts';
import {
  DOG_PACKAGES,
  CAT_PACKAGES,
  DOG_ADD_ONS,
  CAT_ADD_ONS,
  parsePriceNumber,
  priceRangeOf,
  type DisplayPackage,
  type DisplayAddOn,
} from '../src/data/packages.ts';

// The generated pages link the built stylesheet in <head>, so Tailwind classes
// used here are styled before React mounts — no flash of unstyled content.

interface Review {
  petName: string;
  ownerName: string;
  area: string;
  review: string;
  rating: number;
}

interface FAQ {
  question: string;
  answer: string;
}

/** Escape text for interpolation into HTML body content. */
function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Heading for the related-articles block. Mirrors headingForAudience() in
 * src/components/RelatedArticles.tsx — the static frame and the React render
 * must agree, and naming the species also stops the block being a byte-for-byte
 * repeat across all 60 generated pages.
 */
export function headingForAudience(audience: BlogAudience): string {
  if (audience === 'cat') return 'Cat grooming guides worth reading';
  if (audience === 'dog') return 'Dog grooming guides worth reading';
  return 'Grooming guides worth reading';
}

/**
 * Static equivalent of src/components/RatingSummary.tsx.
 *
 * Must match that component's wording — see the header comment there for why.
 * Every generator that emits `aggregateRating` in <head> has to render this in
 * <body>, or the markup describes a rating the page does not show.
 */
export function ratingSummaryHtml(): string {
  const stars = '★'.repeat(BEST_RATING);

  return `          <div class="inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-full border border-sniffy-purple/15 bg-sniffy-purple/5 px-4 py-2">
            <span class="text-sniffy-yellow tracking-tight" aria-hidden="true">${stars}</span>
            <span class="text-sm font-semibold text-sniffy-purple">Rated ${RATING_DISPLAY} out of ${BEST_RATING}</span>
            <a href="${GOOGLE_PROFILE_URL}" target="_blank" rel="noopener noreferrer" class="text-sm text-gray-600 underline">from ${REVIEW_COUNT} ${RATING_SOURCE} reviews</a>
          </div>`;
}

/**
 * Static equivalent of src/components/RelatedArticles.tsx.
 *
 * The React component alone is not enough: links that appear only after the JS
 * bundle executes do not reliably pass crawl equity, and the entire point of
 * linking the blog from 60 commercial pages is to make those links crawlable.
 * Exported so scripts/prerenderSpa.ts can reuse it for the home page.
 *
 * `audience` filters the list the same way the React component does: cat pages
 * must not recommend "Please Don't Shave Your Husky in Summer". All 29 cat
 * locality pages used to, which spent 29 pages' worth of internal links telling
 * Google that a cat-grooming URL is about dogs.
 */
export function relatedArticlesHtml(
  audience: BlogAudience = 'all',
  heading = headingForAudience(audience)
): string {
  // Titles only, no excerpts — see the comment in RelatedArticles.tsx. Repeating
  // 228 words of excerpt prose on all 73 pages inflated page-to-page similarity
  // from ~0.4% to ~12.6% without adding any link value the titles don't already
  // carry. This must stay in step with the React component.
  const items = blogPosts
    .filter((p) => audience === 'all' || p.audience === 'all' || p.audience === audience)
    .map(
      (p) => `            <li>
              <a href="/blogs/${p.slug}" class="text-sniffy-purple font-semibold">${esc(p.title)}</a>
              <span class="block text-xs text-gray-400">${esc(p.category)} · ${esc(p.readTime)}</span>
            </li>`
    )
    .join('\n');

  return `      <section class="px-4 py-10 bg-white">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-2">${esc(heading)}</h2>
          <p class="text-gray-500 mb-6">Honest, practical advice from the groomers who visit Pune homes every day.</p>
          <ul class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
${items}
          </ul>
          <a href="/blogs" class="mt-6 inline-block text-sniffy-purple font-semibold">Browse all grooming guides →</a>
        </div>
      </section>`;
}

/** Sibling-species link for a locality page, shaped for pageMetaStripHtml. */
function siblingLocalityCard(slug: string): { prompt: string; href: string; label: string } | null {
  const sibling = siblingLocality(slug);
  if (!sibling) return null;
  return {
    prompt: sibling.petType === 'cat' ? 'Have a cat too?' : 'Have a dog too?',
    href: sibling.href,
    label: sibling.label,
  };
}

/**
 * Static equivalent of src/components/PageMetaStrip.tsx: cross-link to the other
 * species plus the last-updated date (placeholders resolved by stampPage()).
 * Keep the markup in step with the component.
 */
export function pageMetaStripHtml(sibling: { prompt: string; href: string; label: string } | null): string {
  const link = sibling
    ? `<a href="${sibling.href}" class="group flex flex-1 items-center gap-3.5 px-4 py-4 sm:px-5 hover:bg-sniffy-purple/5 transition-colors"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sniffy-purple/10 text-sniffy-purple"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg></span><span class="min-w-0"><span class="block text-xs text-gray-500">${esc(sibling.prompt)} We groom both.</span><span class="block text-[15px] font-semibold text-sniffy-purple group-hover:underline">${esc(sibling.label)} →</span></span></a>`
    : '';
  return `      <section class="px-4 py-6 bg-white">
        <div class="max-w-7xl mx-auto">
          <div class="rounded-2xl border border-sniffy-purple/15 bg-white shadow-sm overflow-hidden flex flex-col sm:flex-row sm:divide-x divide-y sm:divide-y-0 divide-sniffy-purple/10">
            ${link}
            <div class="flex flex-1 items-center gap-3.5 px-4 py-4 sm:px-5"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sniffy-purple/10 text-sniffy-purple"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg></span><p class="min-w-0"><span class="block text-xs text-gray-500">Prices, coverage &amp; reviews last updated</span><time datetime="${LM_ISO}" class="block text-[15px] font-semibold text-gray-800">${LM_HUMAN}</time></p></div>
          </div>
        </div>
      </section>`;
}

/**
 * The locality pill grid — the bulk of the site's internal link graph, shared
 * by the locality pages and the two hub pages because they render it identically.
 *
 * The anchor text is the full "Dog grooming in Wakad", with the keyword prefix
 * in an sr-only span so the pill still reads "Wakad". Static equivalent of the
 * pills in src/components/location/LocationCities.tsx and
 * src/components/AreasWeServe.tsx — keep the anchor text of all three in step,
 * since a crawler sees one or the other depending on whether it runs JS.
 */
function localityPillsHtml(cities: { name: string; slug: string }[]): string {
  return cities
    .map((c) => {
      const prefix = localityLinkPrefix(c.slug);
      const srOnly = prefix ? `<span class="sr-only">${esc(prefix)}</span>` : '';
      return `<a href="/${c.slug}" class="px-4 py-1.5 rounded-full text-xs font-semibold text-sniffy-purple border border-sniffy-purple/30 bg-sniffy-purple/5">${srOnly}${esc(c.name)}</a>`;
    })
    .join('\n            ');
}

/**
 * Compact site-wide nav for the generated pages.
 *
 * The React <Footer /> links both hubs and the info routes, but it only exists
 * after JS runs — so in static HTML the two head-term hub pages
 * (/dog-grooming-in-pune, /cat-grooming-in-pune) were reachable from only the
 * 13 prerendered SPA routes. These 60 generated pages are the bulk of the site;
 * having them link the hubs is what makes the hubs look important to a crawler.
 */
export function siteNavHtml(): string {
  const links = [
    ['/', 'Pet grooming at home in Pune'],
    ['/dog-grooming-in-pune', 'Dog grooming in Pune'],
    ['/cat-grooming-in-pune', 'Cat grooming in Pune'],
    ['/how-it-works', 'How it works'],
    ['/services', 'Grooming services'],
    ...SERVICE_NAV.map((s) => [`/services/${s.slug}`, s.label] as [string, string]),
    ['/why-sniffy', 'Why Sniffy'],
    ['/faqs', 'FAQs'],
    ['/blogs', 'Grooming guides'],
    ['/about', 'About'],
    ['/contact', 'Contact'],
  ]
    .map(([href, label]) => `<a href="${href}">${esc(label)}</a>`)
    .join('\n            ');

  return `      <nav class="px-4 py-8 bg-white border-t border-gray-100">
        <div class="max-w-7xl mx-auto flex flex-wrap gap-x-5 gap-y-2 text-sm text-sniffy-purple">
            ${links}
        </div>
      </nav>`;
}

/**
 * Static <img> for a story section.
 *
 * The locality data has carried a localised `imageAlt` for every section all
 * along ("Cat grooming setup in Dhanori apartment"), but only the React
 * component rendered an <img> — so the generated HTML shipped with zero images
 * and none of that alt text was ever indexable. Emitting it here gets the
 * photos into Google Images and gives the pre-mount frame something to show.
 *
 * All four /images/grooming-session-N.jpg are 1600x1067 with an 800w sibling,
 * so the dimensions and srcset below are safe to hardcode; `width`/`height`
 * reserve the box and keep the pre-mount frame from shifting. The first image
 * on the page loads eagerly (it is the largest element above the fold once the
 * hero text is read); the rest are lazy, matching LocationStories.tsx.
 */
export function storyImageHtml(
  src: string | undefined,
  alt: string | undefined,
  eager: boolean
): string {
  if (!src || !alt) return '';

  // /images/grooming-session-2.jpg → /images/grooming-session-2-800.jpg
  //
  // `sizes` must match the wrapper this is rendered into
  // (`hidden md:block w-[36%] max-w-[320px]`): hidden below 768px, never wider
  // than 320 CSS px above it. Saying `100vw` here made phones download the
  // 1600w original for an image they never display. Keep in sync with
  // <UniformImage /> in src/components/HomeStories.tsx.
  const small = src.replace(/\.jpg$/, '-800.jpg');
  // Never eager/high: on phones this <img> is display:none (sizes="1px") and
  // is discarded when React mounts, yet fetchpriority=high made it download a
  // ~46 KB jpg at top priority, competing with the real LCP image (the React
  // hero's .webp). Lazy keeps it out of the way; `eager` is now a no-op kept
  // for call-site compatibility.
  void eager;
  const loading = 'loading="lazy" fetchpriority="low"';

  return `<div class="w-full max-w-md aspect-[4/3] overflow-hidden bg-gray-100 shadow-sm mx-auto" style="border-radius:50px">
            <img src="${src}" srcset="${small} 800w, ${src} 1600w" sizes="(min-width: 768px) 320px, 1px"
                 width="1600" height="1067" alt="${esc(alt)}" ${loading} decoding="async"
                 class="w-full h-full object-cover" />
          </div>`;
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

export type PetType = 'dog' | 'cat';

function packagesFor(pet: PetType): DisplayPackage[] {
  return pet === 'cat' ? CAT_PACKAGES : DOG_PACKAGES;
}

function addOnsFor(pet: PetType): DisplayAddOn[] {
  return pet === 'cat' ? CAT_ADD_ONS : DOG_ADD_ONS;
}

/**
 * Static, locality-titled pricing block.
 *
 * Prices lived only inside `Packages.tsx`, which mounts after JS, so the
 * generated HTML previously contained no rupee figure anywhere in the body —
 * just `priceRange` buried in JSON-LD. That left every one of these pages
 * unable to rank for the highest-intent local query there is
 * ("dog grooming price in kothrud"). The heading is interpolated with the
 * locality precisely so that query has something to match.
 *
 * Rendered as a definition-style list rather than the interactive cards: this
 * markup is thrown away when React mounts, so anything clickable here would be
 * dead until then (see the file header).
 */
export function pricingBlockHtml(pet: PetType, placeName: string): string {
  const label = pet === 'cat' ? 'Cat' : 'Dog';
  const packages = packagesFor(pet);
  const addOns = addOnsFor(pet);
  const { min } = priceRangeOf(packages);

  const cards = packages
    .map((p) => {
      const inclusions = [...p.items, ...p.freeAddOns]
        .map((i) => `<li>${esc(i)}</li>`)
        .join('\n                ');

      return `          <article class="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 class="font-semibold text-gray-900">${esc(p.title)}</h3>
            <p class="mt-1 text-2xl font-bold text-sniffy-purple">${esc(p.price)}
              <span class="ml-2 text-sm font-normal text-gray-400 line-through">${esc(p.originalPrice)}</span>
            </p>
            <ul class="mt-3 space-y-1 text-sm text-gray-600 list-disc pl-5">
                ${inclusions}
            </ul>
          </article>`;
    })
    .join('\n');

  const addOnItems = addOns
    .map(
      (a) =>
        `<li><strong>${esc(a.name)}</strong> — ${esc(a.detail)} · ${esc(a.price)}</li>`
    )
    .join('\n              ');

  return `      <section class="px-4 py-10 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-2">${label} grooming prices in ${esc(placeName)}</h2>
          <p class="text-gray-600 mb-6 max-w-3xl">Published, fixed prices — the same across every area of Pune we cover. ${label} grooming in ${esc(placeName)} starts at ₹${min}, there is no doorstep or travel fee, and payment is taken at the end of the session by cash or UPI once you have seen the work.</p>
          <div class="grid md:grid-cols-3 gap-5">
${cards}
          </div>
          <div class="mt-8 max-w-3xl">
            <h3 class="font-semibold text-gray-900 mb-2">Optional add-ons</h3>
            <ul class="space-y-1 text-sm text-gray-600 list-disc pl-5">
              ${addOnItems}
            </ul>
            <p class="mt-3 text-sm text-gray-500">Add-ons are quoted before the groomer starts, never added at the end.</p>
          </div>
        </div>
      </section>`;
}

/**
 * `hasOfferCatalog` for the page's LocalBusiness node, as a JSON fragment the
 * generators splice into their existing schema block.
 *
 * Built from the same `packages.ts` arrays as the visible block above, so the
 * structured data and the on-page prices cannot disagree — which is a hard
 * requirement: Google treats a price in markup that is absent from the page as
 * a structured-data violation.
 *
 * Returned WITHOUT a trailing comma and indented to sit inside the existing
 * object literal in the generator templates.
 */
export function offerCatalogJson(pet: PetType, pageUrl: string, indent = 8): string {
  const pad = ' '.repeat(indent);
  const label = pet === 'cat' ? 'Cat' : 'Dog';

  const catalog = {
    '@type': 'OfferCatalog',
    name: `${label} grooming packages`,
    itemListElement: packagesFor(pet).map((p) => ({
      '@type': 'Offer',
      name: p.title,
      description: p.items.join(', '),
      price: String(parsePriceNumber(p.price)),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: pageUrl,
      itemOffered: {
        '@type': 'Service',
        name: `${p.title} — ${label.toLowerCase()} grooming at home`,
        serviceType: `${label} Grooming at Home`,
      },
    })),
  };

  return JSON.stringify(catalog, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : pad + line))
    .join('\n');
}

/**
 * Static equivalent of one <StoryBlock /> (src/components/StoryBlock.tsx).
 *
 * Shared by the locality pages, both hub pages and — via the export — the
 * prerendered home page in scripts/prerenderSpa.ts, mirroring the fact that all
 * three now render the same React component. The three used to emit three
 * slightly different copies of this markup.
 *
 * Two deliberate differences from the component:
 *  - the body is NOT wrapped in <details>. The accordion is a mobile
 *    space-saver for humans; a non-JS crawler should see the copy outright.
 *  - the eyebrow renders as a bare label with no icon badge. The icons are
 *    lucide React components, and pulling react-dom/server into the generators
 *    to stringify eight glyphs is not worth it for markup React discards on
 *    mount (see the file header). The label text — the part that carries
 *    meaning — is identical.
 */
export function storySectionHtml(section: LocationStorySection, index: number): string {
  const bg = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';

  // Same two-accent alternation as ACCENTS in StoryBlock.tsx.
  const eyebrowColor = index % 2 === 0 ? 'text-sniffy-purple/80' : 'text-[#8a5c00]';
  const { eyebrow } = deriveStoryMeta(section);
  const eyebrowHtml = `<p class="text-[11px] md:text-xs font-bold uppercase tracking-[0.14em] mb-2 md:mb-4 ${eyebrowColor}">${esc(eyebrow)}</p>`;

  const paragraphs = section.paragraphs
    .map((p) => `<p class="mb-2.5">${esc(p)}</p>`)
    .join('\n            ');

  const bullets =
    section.bullets && section.bullets.length > 0
      ? `<ul class="mt-3 space-y-2 list-disc list-inside marker:text-sniffy-yellow">
              ${section.bullets.map((b) => `<li>${esc(b)}</li>`).join('\n              ')}
            </ul>`
      : '';

  const closing = section.closingLine
    ? `<p class="mt-3 text-gray-700 font-medium">${esc(section.closingLine)}</p>`
    : '';

  // Contextual link to a deeper article (see LocationStorySection.link). Must be
  // emitted here too — a link that only exists after React mounts is not a link
  // as far as a non-JS crawler is concerned.
  const link = section.link
    ? `<p class="mt-3.5"><a href="${section.link.href}" class="text-sniffy-purple font-semibold">${esc(section.link.label)} →</a></p>`
    : '';

  const image = storyImageHtml(section.image, section.imageAlt, index === 0);

  // Mirror the component's alternating layout: `imageLeft` puts the photo on the
  // left. The image FLOATS rather than taking a grid column, so long copy wraps
  // past it instead of leaving a tall empty column — see <LocationStories />.
  const text = `<div class="text-gray-600 text-[15px] leading-[1.7]">
            ${paragraphs}
            ${bullets}
            ${closing}
            ${link}
          </div>`;

  const body = image
    ? `<div class="md:flow-root">
          <div class="hidden md:block w-[36%] max-w-[320px] mb-4 ${section.imageLeft ? 'float-left mr-7' : 'float-right ml-7'}">
            ${image}
          </div>
          ${text}
        </div>`
    : text;

  // max-w-4xl, not max-w-7xl — see the measure note in <StoryBlock />.
  return `      <section class="${bg} py-8 px-4">
        <div class="max-w-4xl mx-auto">
          ${eyebrowHtml}
          <h2 class="text-[17px] md:text-2xl font-semibold md:font-bold mb-2 text-gray-900 leading-snug md:leading-tight">${esc(section.heading)}</h2>
          <p class="text-gray-700 mb-3 text-[13px] md:text-[15px] font-normal md:font-medium">${esc(section.subheading)}</p>
          ${body}
        </div>
      </section>`;
}

export function prerenderLocationBody(
  location: LocationConfig,
  reviews: Review[],
  faqs: FAQ[],
  pet: PetType
): string {
  const stories = location.storySections.map(storySectionHtml).join('\n');

  const reviewCards = reviews
    .map(
      (r) => `          <article class="bg-white rounded-2xl p-5 border border-gray-100">
            <p class="text-gray-700 text-sm leading-relaxed mb-4">${esc(r.review)}</p>
            <div class="text-sm">
              <div class="font-semibold text-sniffy-purple">${esc(r.petName)}</div>
              <div class="text-xs text-gray-500">Owner: ${esc(r.ownerName)}</div>
              <div class="text-xs text-sniffy-purple/60">${esc(r.area)}</div>
              <div class="text-xs text-gray-500">Rating: ${r.rating} out of 5</div>
            </div>
          </article>`
    )
    .join('\n');

  const faqItems = faqs
    .map(
      (f) => `          <div class="border border-gray-200 rounded-xl px-4 py-3">
            <h3 class="font-semibold text-gray-900 text-sm md:text-base">${esc(f.question)}</h3>
            <p class="mt-2 text-gray-600 text-sm leading-relaxed">${esc(f.answer)}</p>
          </div>`
    )
    .join('\n');

  // The whole point for crawlers: the 58-page internal link graph, available
  // without executing JS.
  const cityLinks = localityPillsHtml(location.otherCities);

  const nearby =
    location.nearbyAreas.length > 0
      ? `<p class="text-sm text-gray-600 mt-4">Also serving nearby: ${location.nearbyAreas.map(esc).join(', ')}.</p>`
      : '';

  // The hero (Navbar + carousel) carries this page's <h1> and subtext, exactly as
  // React draws them, so they are not repeated in a text block below it.
  return `${locationHeroHtml(location)}

      <section class="px-4 py-6 bg-white">
        <div class="max-w-7xl mx-auto">
          ${nearby}
        </div>
      </section>

${pricingBlockHtml(pet, location.name)}

${pageMetaStripHtml(siblingLocalityCard(location.slug))}

${stories}

      <section class="px-4 py-10 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-3">What ${esc(location.name)} pet parents say</h2>
${ratingSummaryHtml()}
          <div class="grid md:grid-cols-2 gap-5 mt-6">
${reviewCards}
          </div>
        </div>
      </section>

      <section class="px-4 py-10 bg-white">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-6">Frequently asked questions</h2>
          <div class="space-y-3 max-w-3xl">
${faqItems}
          </div>
        </div>
      </section>

${relatedArticlesHtml(pet)}

      <section class="px-4 py-10 bg-gray-50">
        <div class="max-w-7xl mx-auto text-center">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-6">${pet === 'cat' ? 'Cat' : 'Dog'} grooming in other Pune areas</h2>
          <div class="flex flex-wrap justify-center gap-2">
            ${cityLinks}
          </div>
        </div>
      </section>

${siteNavHtml()}`;
}

// ─── City hub pages (/dog-grooming-in-pune, /cat-grooming-in-pune) ───────────

interface HubStat {
  number: string;
  label: string;
}

/**
 * Story-shaped, matching `whySections` in {cat,}puneHubContent.ts — the hub
 * pages render these through the same <StoryBlock /> as the home and locality
 * pages, so the static frame goes through the same storySectionHtml().
 */
type HubSection = LocationStorySection;

interface HubReview {
  name: string;
  area: string;
  pet: string;
  text: string;
  rating: number;
}

interface HubFaq {
  q: string;
  a: string;
}

interface HubContent {
  h1: string;
  intro: string;
  stats: HubStat[];
  whySections: HubSection[];
  reviews: HubReview[];
  faqs: HubFaq[];
  cities: { name: string; slug: string }[];
}

/**
 * Same contract as prerenderLocationBody, for the two city hub pages. These
 * target the head terms ("dog grooming in pune", "cat grooming in pune"), so
 * leaving them as empty shells while the 58 locality pages were prerendered
 * would have missed the most valuable pages on the site.
 */
export function prerenderHubBody(content: HubContent, pet: PetType): string {
  const statItems = content.stats
    .map((s) => `<li><strong>${esc(s.number)}</strong> — ${esc(s.label)}</li>`)
    .join('\n            ');

  const sections = content.whySections.map(storySectionHtml).join('\n');

  const reviewCards = content.reviews
    .map(
      (r) => `          <article class="bg-white rounded-2xl p-5 border border-gray-100">
            <p class="text-gray-700 text-sm leading-relaxed mb-4">${esc(r.text)}</p>
            <div class="text-sm">
              <div class="font-semibold text-sniffy-purple">${esc(r.name)}</div>
              <div class="text-xs text-gray-500">${esc(r.pet)} — ${esc(r.area)}</div>
              <div class="text-xs text-gray-500">Rating: ${r.rating} out of 5</div>
            </div>
          </article>`
    )
    .join('\n');

  const faqItems = content.faqs
    .map(
      (f) => `          <div class="border border-gray-200 rounded-xl px-4 py-3">
            <h3 class="font-semibold text-gray-900 text-sm md:text-base">${esc(f.q)}</h3>
            <p class="mt-2 text-gray-600 text-sm leading-relaxed">${esc(f.a)}</p>
          </div>`
    )
    .join('\n');

  const cityLinks = localityPillsHtml(content.cities);

  // The hero carries the <h1> and intro (see prerenderHero.tsx); only the stats
  // list stays as a text block.
  return `${hubHeroHtml(pet, content.intro)}

      <section class="px-4 py-6 bg-white">
        <div class="max-w-7xl mx-auto">
          <ul class="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-700">
            ${statItems}
          </ul>
        </div>
      </section>

${pricingBlockHtml(pet, 'Pune')}

${pageMetaStripHtml(HUB_SIBLING[pet])}

      <section class="px-4 pt-10 pb-4 bg-gray-50">
        <div class="max-w-6xl mx-auto text-center">
          <p class="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-2">Why it matters</p>
          <h2 class="text-2xl md:text-4xl font-bold text-gray-900">${
            pet === 'cat'
              ? 'Cat grooming in Pune needs a different approach'
              : 'Grooming in Pune is a bit different'
          }</h2>
        </div>
      </section>

${sections}

      <section class="px-4 py-10 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-3">What Pune pet parents say</h2>
${ratingSummaryHtml()}
          <div class="grid md:grid-cols-2 gap-5 mt-6">
${reviewCards}
          </div>
        </div>
      </section>

      <section class="px-4 py-10 bg-white">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-6">Frequently asked questions</h2>
          <div class="space-y-3 max-w-3xl">
${faqItems}
          </div>
        </div>
      </section>

${relatedArticlesHtml(pet)}

      <section class="px-4 py-10 bg-gray-50">
        <div class="max-w-7xl mx-auto text-center">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-6">${pet === 'cat' ? 'Cat' : 'Dog'} grooming areas we cover across Pune</h2>
          <div class="flex flex-wrap justify-center gap-2">
            ${cityLinks}
          </div>
        </div>
      </section>

${siteNavHtml()}`;
}

/** The id `src/entries/location.tsx` and `catLocation.tsx` look this up by. */
export const LOCATION_DATA_SCRIPT_ID = 'sniffy-location-data';

/**
 * This page's own locality data, inlined as JSON for the entry island to read.
 *
 * ── The problem ──────────────────────────────────────────────────────────────
 * The entries used to `import { LOCATION_REGISTRY } from '../data/locationRegistry'`
 * and `.find()` the slug matching the URL. That registry is a single object
 * literal referencing all 132 exports of `locationData.ts`, so nothing in it is
 * tree-shakeable — every locality page downloaded **all 33 localities'** prose
 * (a 319 KB chunk, 378 KB for cats) to render one of them. On a page whose body
 * is already fully prerendered below, that is the largest single asset on the
 * critical path and it is 97% waste.
 *
 * ── Why inline JSON rather than per-locality chunks ──────────────────────────
 * Splitting `locationData.ts` into 33 modules would also let Rollup shake it,
 * but it means surgery on the two largest files in the repo plus an extra
 * request per page. The generator already holds exactly this locality's data in
 * memory — emitting it here costs one script tag, no request, no data-file
 * churn, and it compresses alongside the HTML that already contains the same
 * prose. Net effect: `locationData` and `locationRegistry` leave the browser
 * bundle entirely.
 *
 * `<` is escaped so a `</script` sequence inside the copy cannot close the tag
 * early; `<` is still valid JSON, so `JSON.parse` is unaffected.
 */
export function locationDataScript(
  location: LocationConfig,
  reviews: Review[],
  faqs: FAQ[]
): string {
  const json = JSON.stringify({ location, reviews, faqs }).replace(/</g, '\\u003c');

  return `    <script type="application/json" id="${LOCATION_DATA_SCRIPT_ID}">${json}</script>`;
}

/**
 * FAQPage schema built from the same FAQ array the body renders, so the markup
 * and the structured data can never disagree. Returned as a full <script> tag
 * for the generators to drop into <head>.
 */
export function faqSchemaTag(faqs: FAQ[]): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return `    <script type="application/ld+json">
${JSON.stringify(schema, null, 2)
  .split('\n')
  .map((l) => `      ${l}`)
  .join('\n')}
    </script>`;
}

/**
 * <link rel="preload"> for the hero's LCP image.
 *
 * The hero <img> is rendered by React (HeroCarousel), so without this the
 * browser cannot discover it until the JS bundle has downloaded, parsed and
 * executed. The preload makes it start in parallel with the HTML parse.
 * srcset/sizes/type must mirror heroWebpSrcSet() + HERO_SIZES in
 * src/components/heroSlides.tsx, otherwise the browser preloads a candidate the
 * <picture> then doesn't use (a wasted request, not a speed-up).
 */
export function heroImagePreloadTag(): string {
  return `<link rel="preload" as="image" type="image/webp" fetchpriority="high"
          imagesrcset="/images/hero-lead-800.webp 800w, /images/hero-lead.webp 1200w"
          imagesizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1319px) calc(100vw - 44px), 1236px" />`;
}
