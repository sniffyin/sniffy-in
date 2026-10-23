/**
 * prerenderSpa — post-build step. Run AFTER `vite build`, BEFORE generate-sitemap.
 *
 * ── The problem this solves ──────────────────────────────────────────────────
 * `index.html` did double duty: it was the home page AND the .htaccess SPA
 * fallback (rule 4) for /about, /blogs, /faqs and every other React route. That
 * meant a crawler which does not execute JS saw, for EVERY one of those URLs:
 *   • an empty <body> — zero content
 *   • <link rel="canonical" href="https://sniffy.in/"> — "I am the homepage"
 *
 * Simply pasting the home page's content into index.html would have made that
 * worse: /about would then serve the homepage's copy verbatim.
 *
 * ── How it works ─────────────────────────────────────────────────────────────
 * .htaccess rule 3 already serves `/about.html` when it exists and only falls
 * through to index.html when it does not. So emitting a real file per route is
 * enough — no .htaccess change required.
 *
 * For each route we clone the built `dist/index.html` (which Vite has already
 * populated with content-hashed asset URLs), then:
 *   1. rewrite <title>, description, canonical and Open Graph tags
 *   2. fill #root with that route's prerendered body
 * and write it to `dist/<route>.html`. The home page overwrites dist/index.html.
 *
 * Cloning the built shell rather than generating HTML from scratch means the
 * hand-maintained <head> in the source index.html (LocalBusiness + Service
 * JSON-LD, PWA tags, preloads) is inherited by every route for free, and asset
 * hashes can never go stale.
 *
 * ── Why replacing #root is safe ──────────────────────────────────────────────
 * `src/main.tsx` mounts with createRoot().render(), which CLEARS the container
 * before its first render. It does not hydrate, so a mismatch is structurally
 * impossible and the markup here does not need to mirror React's DOM — only
 * carry the same text. Same approach as scripts/prerenderLocationBody.ts.
 */
import fs from 'fs';
import path from 'path';

import { HOME_SEO, SEO_ROUTES, ROUTE_INTROS, type RouteSeo } from '../src/data/seoRoutes.ts';
import { FAQ_CATEGORIES } from '../src/data/faqsPageFaqs.ts';
import { WHY_SNIFFY_FAQS } from '../src/data/whySniffyFaqs.ts';
import { HOME_STORY_SECTIONS } from '../src/data/homeStories.ts';
import { HOME_FAQS } from '../src/data/homeFaqs.ts';
import { HOME_TESTIMONIALS } from '../src/data/homeTestimonials.ts';
import { blogPosts, parseInline, postPublishedIso, postModifiedIso, type Block } from '../src/data/blogPosts.ts';
import { blogHubLinks } from '../src/data/hubMeta.ts';
import { homeHeroHtml } from './prerenderHero.tsx';
import { formatPageDate } from '../src/data/pageDates.ts';
import { stampDate, flushPageDates } from './pageDates.ts';
import {
  relatedArticlesHtml,
  ratingSummaryHtml,
  storySectionHtml,
} from './prerenderLocationBody.ts';
import { PACKAGES, ADD_ONS } from '../src/pages/admin/types.ts';
import { clamp, META_DESCRIPTION_MAX } from './seoText.ts';
import {
  ALL_PUNE_CITIES,
  ALL_CAT_PUNE_CITIES,
  localityLinkPrefix,
} from '../src/data/puneLocalities.ts';

const DIST = 'dist';
const ORIGIN = 'https://sniffy.in';

// ─── Route description length guard ──────────────────────────────────────────
/**
 * Throws rather than clamping. The locality generators CAN clamp their
 * descriptions because they are the only consumer of `loc*SEO.ts` — but
 * `SEO_ROUTES` is read by two consumers, this script and `useSeo()` at runtime,
 * and the whole point of that shared module (see its docblock) is that the head
 * a crawler reads from the HTML matches the head it gets after JS runs. Clamping
 * here and not there would manufacture exactly the mismatch it exists to
 * prevent, so an over-length string has to be fixed at the source instead.
 */
for (const route of [HOME_SEO, ...Object.values(SEO_ROUTES)]) {
  if (route.description.length > META_DESCRIPTION_MAX) {
    throw new Error(
      `prerenderSpa: description for "${route.path}" is ${route.description.length} ` +
        `chars, over the ${META_DESCRIPTION_MAX} Google renders. Shorten it in ` +
        `src/data/seoRoutes.ts — do not clamp it here, or the prerendered head ` +
        `and useSeo()'s runtime head would disagree.`
    );
  }
}

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Head rewriting ──────────────────────────────────────────────────────────

interface HeadPatch {
  title: string;
  description: string;
  /**
   * `null` strips the canonical (and `og:url`) instead of rewriting them.
   *
   * Only the 404 page uses this. An error page has no canonical URL to declare:
   * pointing it at itself asks Google to index an error, and pointing it at the
   * home page claims every mistyped URL is a duplicate of `/` — which is the bug
   * this whole script was written to remove in the first place.
   */
  canonical: string | null;
  ogType: 'website' | 'article';
  ogImage: string;
  /** Overrides the shell's `index, follow`. */
  robots?: string;
}

function patchHead(html: string, patch: HeadPatch): string {
  let out = html;

  const replaceOrThrow = (pattern: RegExp, replacement: string, label: string) => {
    if (!pattern.test(out)) {
      throw new Error(
        `prerenderSpa: could not find ${label} in dist/index.html. The built ` +
          `shell's <head> changed shape — update the patterns in patchHead().`
      );
    }
    out = out.replace(pattern, replacement);
  };

  replaceOrThrow(/<title>[\s\S]*?<\/title>/, `<title>${esc(patch.title)}</title>`, '<title>');
  replaceOrThrow(
    /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/,
    `<meta name="description" content="${esc(patch.description)}" />`,
    'meta description'
  );
  replaceOrThrow(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    patch.canonical === null ? '' : `<link rel="canonical" href="${patch.canonical}" />`,
    'canonical link'
  );
  if (patch.robots) {
    replaceOrThrow(
      /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/,
      `<meta name="robots" content="${patch.robots}" />`,
      'robots meta'
    );
  }
  replaceOrThrow(
    /<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/?>/,
    `<meta property="og:title" content="${esc(patch.title)}" />`,
    'og:title'
  );
  replaceOrThrow(
    /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/?>/,
    `<meta property="og:description" content="${esc(patch.description)}" />`,
    'og:description'
  );
  replaceOrThrow(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    patch.canonical === null ? '' : `<meta property="og:url" content="${patch.canonical}" />`,
    'og:url'
  );
  replaceOrThrow(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${patch.ogType}" />`,
    'og:type'
  );
  replaceOrThrow(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${patch.ogImage}" />`,
    'og:image'
  );

  return out;
}

/** Replace the empty `<div id="root"></div>` with prerendered markup. */
function injectBody(html: string, body: string): string {
  const pattern = /<div id="root"><\/div>/;
  if (!pattern.test(html)) {
    throw new Error(
      'prerenderSpa: `<div id="root"></div>` not found in dist/index.html. ' +
        'Either the build output changed or this script already ran on it.'
    );
  }

  return html.replace(
    pattern,
    `<!--\n      Prerendered so crawlers that do not run JavaScript see this page's\n` +
      `      content and its own canonical URL. main.tsx mounts with createRoot(),\n` +
      `      which clears this container — React replaces all of it.\n    -->\n` +
      `    <div id="root">\n${body}\n    </div>`
  );
}

/** The site-wide nav/footer links, so every prerendered page carries the link graph. */
function commonLinks(): string {
  const routes = Object.values(SEO_ROUTES)
    .map((r) => `<a href="${r.path}">${esc(r.title.split('|')[0].trim())}</a>`)
    .join('\n            ');

  return `      <nav class="px-4 py-8 bg-gray-50">
        <div class="max-w-7xl mx-auto flex flex-wrap gap-x-5 gap-y-2 text-sm text-sniffy-purple">
            <a href="/">Home</a>
            <a href="/dog-grooming-in-pune">Dog Grooming in Pune</a>
            <a href="/cat-grooming-in-pune">Cat Grooming in Pune</a>
            ${routes}
        </div>
      </nav>`;
}

// ─── Areas we serve ──────────────────────────────────────────────────────────

/**
 * Prerendered mirror of <AreasWeServe /> (src/components/AreasWeServe.tsx).
 *
 * The home page previously emitted 20 internal links and not one of them
 * pointed at a locality page, so the single strongest URL on the site passed no
 * equity to the 66 pages it exists to support. This block is why that changed —
 * keep it in sync with the component, which renders the same two lists.
 *
 * Unlike the component there is no mobile truncation here: a crawler should see
 * every anchor, and there is no viewport to protect.
 */
function areasWeServeHtml(): string {
  const pills = (cities: { name: string; slug: string }[]) =>
    [...cities]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => {
        // Keyword anchor text, prefix hidden so the pill still reads "Wakad".
        // Mirrors the PillLabel in src/components/AreasWeServe.tsx.
        const prefix = localityLinkPrefix(c.slug);
        const srOnly = prefix ? `<span class="sr-only">${esc(prefix)}</span>` : '';
        return `<a href="/${c.slug}" class="px-4 py-1.5 rounded-full text-sm font-semibold text-sniffy-purple border border-sniffy-purple/25 bg-sniffy-purple/5">${srOnly}${esc(
          c.name
        )}</a>`;
      })
      .join('\n              ');

  return `      <section class="bg-gray-50 py-10 md:py-14 px-4">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-1">Pet grooming across Pune — find your area</h2>
          <p class="text-gray-600 mb-8 max-w-3xl">We groom at home across ${ALL_PUNE_CITIES.length} Pune and Pimpri-Chinchwad localities, seven days a week between 9 AM and 9 PM. Same fixed prices everywhere — no doorstep charge and no distance surcharge.</p>
          <div class="grid gap-9 md:grid-cols-2">
            <div>
              <h3 class="text-base md:text-lg font-bold text-gray-900"><a href="/dog-grooming-in-pune" class="hover:text-sniffy-purple hover:underline underline-offset-2">Dog grooming in Pune by locality</a></h3>
              <p class="text-sm text-gray-500 mt-1 mb-4">At-home dog grooming — bath, haircut, deshedding, tick &amp; flea care.</p>
              <div class="flex flex-wrap gap-2">
              ${pills(ALL_PUNE_CITIES)}
              </div>
            </div>
            <div>
              <h3 class="text-base md:text-lg font-bold text-gray-900"><a href="/cat-grooming-in-pune" class="hover:text-sniffy-purple hover:underline underline-offset-2">Cat grooming in Pune by locality</a></h3>
              <p class="text-sm text-gray-500 mt-1 mb-4">At-home cat grooming — cat-formulated products, low-restraint handling.</p>
              <div class="flex flex-wrap gap-2">
              ${pills(ALL_CAT_PUNE_CITIES)}
              </div>
            </div>
          </div>
        </div>
      </section>`;
}

// ─── Home page body ──────────────────────────────────────────────────────────

function homeBody(): string {
  const packages = PACKAGES.map(
    (p) => `<li><strong>${esc(p.label)}</strong> — ₹${p.price}</li>`
  ).join('\n            ');

  const addOns = ADD_ONS.map(
    (a) => `<li>${esc(a.label)} — ₹${a.price}${a.note ? ` (${esc(a.note)})` : ''}</li>`
  ).join('\n            ');

  // Same emitter as the locality and hub pages: <HomeStories /> renders the
  // shared <StoryBlock />, so the static frame shares one implementation too.
  // (homeStories.ts has carried `image`/`imageAlt` since it was written, but for
  // a long time only React rendered them — storySectionHtml() emits them.)
  const stories = HOME_STORY_SECTIONS.map(storySectionHtml).join('\n');

  const testimonials = HOME_TESTIMONIALS.map(
    (t) => `          <article class="bg-white rounded-2xl p-5 border border-gray-100">
            <p class="text-gray-700 text-sm leading-relaxed mb-3">${esc(t.review)}</p>
            <div class="text-sm font-semibold text-sniffy-purple">${esc(t.petName)}</div>
            <div class="text-xs text-gray-500">Owner: ${esc(t.ownerName)}</div>
          </article>`
  ).join('\n');

  const faqs = HOME_FAQS.map(
    (f) => `          <div class="border border-gray-200 rounded-xl px-4 py-3">
            <h3 class="font-semibold text-gray-900">${esc(f.question)}</h3>
            <p class="mt-2 text-gray-600 text-sm leading-relaxed">${esc(f.answer)}</p>
          </div>`
  ).join('\n');

  // The hero (see prerenderHero.tsx) carries the <h1>; the longer copy stays below it.
  return `${homeHeroHtml()}

      <section class="px-4 py-6 bg-white">
        <div class="max-w-7xl mx-auto">
          <p class="text-gray-600 text-base md:text-lg max-w-3xl">Professional dog grooming and cat grooming at your doorstep across Pune and Pimpri-Chinchwad. A trained groomer comes to your home with all equipment and finishes in one visit — no salon, no travel, no cage time. Dog grooming at home starts at ₹799, and the same three packages cover cats. Open 9 AM to 9 PM, seven days a week.</p>
        </div>
      </section>

      <section class="px-4 py-10 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-4">Grooming packages and prices</h2>
          <ul class="space-y-1 text-gray-700">
            ${packages}
          </ul>
          <h3 class="font-semibold text-gray-900 mt-6 mb-2">Optional add-ons</h3>
          <ul class="space-y-1 text-gray-600 text-sm">
            ${addOns}
          </ul>
        </div>
      </section>

${stories}

      <section class="px-4 py-10 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-3">What pet parents say</h2>
${ratingSummaryHtml()}
          <div class="grid md:grid-cols-3 gap-5 mt-6">
${testimonials}
          </div>
        </div>
      </section>

${areasWeServeHtml()}

      <section class="px-4 py-10 bg-white">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-6">Frequently asked questions</h2>
          <div class="space-y-3 max-w-3xl">
${faqs}
          </div>
        </div>
      </section>

${relatedArticlesHtml()}

${commonLinks()}`;
}

// ─── Blog rendering ──────────────────────────────────────────────────────────

/** Mirrors InlineText in src/pages/BlogsPage.tsx — same `[label](/href)` syntax. */
function renderInline(text: string): string {
  return parseInline(text)
    .map((seg) =>
      seg.href
        ? `<a href="${esc(seg.href)}" class="text-sniffy-purple font-semibold">${esc(seg.text)}</a>`
        : esc(seg.text)
    )
    .join('');
}

function renderBlock(block: Block): string {
  switch (block.type) {
    case 'h2':
      return `          <h2 class="text-xl md:text-2xl font-bold text-gray-900 mt-8 mb-3">${esc(block.text)}</h2>`;
    case 'h3':
      return `          <h3 class="text-base md:text-lg font-bold text-sniffy-purple mt-6 mb-2">${esc(block.text)}</h3>`;
    case 'p':
      return `          <p class="text-gray-600 leading-relaxed mb-4">${renderInline(block.text)}</p>`;
    case 'ul':
      return `          <ul class="mb-5 space-y-2 list-disc pl-5 text-gray-600">\n${block.items
        .map((i) => `            <li>${renderInline(i)}</li>`)
        .join('\n')}\n          </ul>`;
    case 'callout':
      return `          <blockquote class="my-6 border-l-4 border-sniffy-purple pl-5 text-sniffy-purple font-medium">${renderInline(block.text)}</blockquote>`;
    case 'divider':
      return '          <hr class="my-8 border-gray-100" />';
    default:
      return '';
  }
}

function blogListBody(): string {
  const cards = blogPosts
    .map(
      (p) => `          <article class="bg-white rounded-2xl p-5 border border-gray-100">
            <h2 class="font-bold text-gray-900 text-lg mb-2"><a href="/blogs/${p.slug}">${esc(p.title)}</a></h2>
            <p class="text-gray-500 text-sm leading-relaxed mb-2">${esc(p.excerpt)}</p>
            <p class="text-xs text-gray-400">${esc(p.category)} · ${esc(p.readTime)} · ${esc(p.date)}</p>
          </article>`
    )
    .join('\n');

  return `      <section class="px-4 py-10 bg-white">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-2xl md:text-4xl font-bold text-gray-900">${esc(ROUTE_INTROS.blogs.h1)}</h1>
          <p class="mt-3 text-gray-600 max-w-3xl">${esc(ROUTE_INTROS.blogs.intro)}</p>
        </div>
      </section>

      <section class="px-4 py-10 bg-gray-50">
        <div class="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5">
${cards}
        </div>
      </section>

${commonLinks()}`;
}

function blogHubCalloutHtml(audience: 'dog' | 'cat' | 'all'): string {
  const links = blogHubLinks(audience)
    .map((l) => `<a href="${l.href}" class="block text-[15px] font-semibold text-sniffy-purple hover:underline">${esc(l.label)} →</a>`)
    .join('\n            ');
  return `      <section class="px-4 pb-8 bg-white">
        <div class="max-w-2xl mx-auto rounded-2xl border border-sniffy-purple/15 bg-sniffy-purple/5 px-5 py-4">
          <p class="text-xs text-gray-500 mb-1">Want this done for you? Fixed prices from ₹799, no travel fee.</p>
            ${links}
        </div>
      </section>`;
}

function blogPostBody(post: (typeof blogPosts)[number]): string {
  // Same-species first — mirrors otherPosts in src/pages/BlogsPage.tsx.
  const rest = blogPosts.filter((p) => p.slug !== post.slug);
  const sameTopic = rest.filter(
    (p) => post.audience === 'all' || p.audience === 'all' || p.audience === post.audience
  );
  const others = (sameTopic.length >= 2 ? sameTopic : rest)
    .map((p) => `<a href="/blogs/${p.slug}">${esc(p.title)}</a>`)
    .join('\n            ');

  return `      <article class="px-4 py-10 bg-white">
        <div class="max-w-3xl mx-auto">
          <p class="text-xs text-gray-400 mb-2">${esc(post.category)} · ${esc(post.readTime)} · ${esc(post.date)}${post.updated ? ` · Updated ${esc(formatPageDate(post.updated))}` : ''}</p>
          <h1 class="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">${esc(post.title)}</h1>
          <p class="text-gray-500 text-base md:text-lg leading-relaxed mb-8 border-l-4 border-sniffy-yellow pl-4">${esc(post.excerpt)}</p>
${post.blocks.map(renderBlock).join('\n')}
        </div>
      </article>

${blogHubCalloutHtml(post.audience)}

      <section class="px-4 py-10 bg-gray-50">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-lg font-bold text-gray-900 mb-3">More reading</h2>
          <div class="flex flex-col gap-2 text-sniffy-purple">
            ${others}
          </div>
        </div>
      </section>

${commonLinks()}`;
}

// ─── Generic info route ──────────────────────────────────────────────────────

/**
 * Q&A block shared by the /faqs and /why-sniffy prerenders.
 *
 * These two pages hold ~40 answers between them and previously prerendered only
 * an H1 + intro, so none of that copy — the single densest body of long-tail
 * text on the site — was visible to a crawler that does not execute JS, and
 * neither page emitted FAQPage schema statically.
 */
function faqListHtml(faqs: { question: string; answer: string }[]): string {
  return faqs
    .map(
      (f) => `          <div class="border border-gray-200 rounded-xl px-4 py-3">
            <h3 class="font-semibold text-gray-900">${esc(f.question)}</h3>
            <p class="mt-2 text-gray-600 text-sm leading-relaxed">${esc(f.answer)}</p>
          </div>`
    )
    .join('\n');
}

/** Flat Q&A list for a route, or null if the route has no FAQ block. */
function routeFaqs(key: keyof typeof SEO_ROUTES): { question: string; answer: string }[] | null {
  if (key === 'faqs') return FAQ_CATEGORIES.flatMap((c) => c.faqs);
  if (key === 'whySniffy') return WHY_SNIFFY_FAQS.map((f) => ({ question: f.q, answer: f.a }));
  return null;
}

function infoBody(key: keyof typeof SEO_ROUTES): string {
  const { h1, intro } = ROUTE_INTROS[key];

  // /faqs keeps its category headings; /why-sniffy is a flat list.
  const faqSection =
    key === 'faqs'
      ? FAQ_CATEGORIES.map(
          (c) => `      <section class="px-4 py-8 bg-white">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-4">${esc(c.category)}</h2>
          <div class="space-y-3">
${faqListHtml(c.faqs)}
          </div>
        </div>
      </section>`
        ).join('\n')
      : key === 'whySniffy'
        ? `      <section class="px-4 py-10 bg-white">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-6">Frequently asked questions</h2>
          <div class="space-y-3">
${faqListHtml(WHY_SNIFFY_FAQS.map((f) => ({ question: f.q, answer: f.a })))}
          </div>
        </div>
      </section>`
        : '';

  return `      <section class="px-4 py-10 bg-white">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">${esc(h1)}</h1>
          <p class="mt-3 text-gray-600 text-base md:text-lg max-w-3xl">${esc(intro)}</p>
        </div>
      </section>
${faqSection ? `\n${faqSection}\n` : ''}
${commonLinks()}`;
}

// ─── Emit ────────────────────────────────────────────────────────────────────

const shellPath = path.join(DIST, 'index.html');

if (!fs.existsSync(shellPath)) {
  throw new Error('prerenderSpa: dist/index.html not found. Run `vite build` first.');
}

const shell = fs.readFileSync(shellPath, 'utf8');

/**
 * Inject extra JSON-LD before </head>. The cloned shell carries index.html's
 * LocalBusiness + Service schema, but per-route schema (FAQPage on home,
 * BlogPosting on articles) is normally added by React at runtime — so without
 * this it would be invisible to any crawler that does not execute JS, which is
 * exactly the audience this script exists for.
 */
function addSchema(html: string, schemas: object[]): string {
  // Vite minifies the built HTML, so `</head>` carries no leading whitespace.
  // Match the bare tag and fail loudly — a silent no-op here would ship pages
  // whose per-route schema exists only after JS runs, which is the bug this
  // whole script exists to fix.
  if (!html.includes('</head>')) {
    throw new Error('prerenderSpa: no </head> in the built shell — cannot inject JSON-LD.');
  }

  const tags = schemas
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('');

  return html.replace('</head>', `${tags}</head>`);
}

/**
 * Breadcrumb trail for a prerendered route.
 *
 * The four page generators have always emitted BreadcrumbList for the locality
 * and hub pages; the SPA routes were the gap — /about, /faqs, /blogs and every
 * blog post shipped with no trail at all, so Google had nothing to build the
 * breadcrumb line in the result snippet from and fell back to the raw URL.
 *
 * Home is deliberately excluded: a one-item breadcrumb pointing at itself is
 * not a trail, and Google ignores it.
 */
function breadcrumbSchema(trail: { name: string; path: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.path === '/' ? `${ORIGIN}/` : `${ORIGIN}${item.path}`,
    })),
  };
}

/**
 * Static body for `dist/404.html`.
 *
 * Mirrors the text of `src/pages/NotFoundPage.tsx` (headline + the same four
 * QUICK_LINKS), not its markup — React clears `#root` on mount, so this only has
 * to carry the same words for a non-JS visitor. Kept deliberately short: nobody
 * needs a 3,000-word error page, and it must not look like a thin duplicate of a
 * real page.
 */
function notFoundBody(): string {
  const quickLinks = [
    { href: '/', title: 'Book a grooming', sub: 'At-home, by trained pros' },
    { href: '/how-it-works', title: 'How it works', sub: 'See the Sniffy process' },
    { href: '/why-sniffy', title: 'Why Sniffy', sub: 'What makes us different' },
    { href: '/contact', title: 'Talk to us', sub: 'WhatsApp, phone or email' },
  ]
    .map(
      (l) =>
        `            <a href="${l.href}" class="block p-4 rounded-2xl bg-white border border-gray-200">
              <span class="block font-bold text-gray-900">${esc(l.title)}</span>
              <span class="block text-gray-500 text-sm">${esc(l.sub)}</span>
            </a>`
    )
    .join('\n');

  return `      <section class="px-4 py-10 bg-white">
        <div class="max-w-3xl mx-auto text-center">
          <p class="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-6">Error 404 · Page not found</p>
          <h1 class="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">We couldn't find the page you were looking for</h1>
          <p class="mt-3 text-gray-600 text-base md:text-lg">The link may be mistyped, or the page may have moved. Let's get you back to Sniffy.</p>
        </div>
      </section>

      <section class="px-4 py-8 bg-white">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-4">Popular pages</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
${quickLinks}
          </div>
        </div>
      </section>

${commonLinks()}`;
}

function write(
  routePath: string,
  seo: RouteSeo & { ogType?: 'website' | 'article'; ogImage?: string },
  body: string,
  schemas: object[] = [],
  /** Only the 404 page passes these. See HeadPatch.canonical. */
  opts: { robots?: string; noCanonical?: boolean } = {}
) {
  let html = injectBody(
    patchHead(shell, {
      title: seo.title,
      description: seo.description,
      canonical: opts.noCanonical
        ? null
        : routePath === '/'
          ? `${ORIGIN}/`
          : `${ORIGIN}${routePath}`,
      ogType: seo.ogType ?? 'website',
      ogImage: seo.ogImage ?? `${ORIGIN}/sniffy-logo.png`,
      robots: opts.robots,
    }),
    body
  );

  if (schemas.length) html = addSchema(html, schemas);

  const target =
    routePath === '/'
      ? shellPath
      : path.join(DIST, `${routePath.replace(/^\//, '')}.html`);

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
  return target;
}

const written: string[] = [];

// Info routes first — the home page overwrites dist/index.html, so it must be
// last, otherwise every later clone would inherit the home page's body.
for (const key of Object.keys(SEO_ROUTES) as (keyof typeof SEO_ROUTES)[]) {
  const seo = SEO_ROUTES[key];
  const body = key === 'blogs' ? blogListBody() : infoBody(key);
  const faqs = routeFaqs(key);

  // Breadcrumb label = the title up to the first "|", which is how every
  // SEO_ROUTES title is written ("About Sniffy | At-Home Pet Grooming in Pune").
  const label = seo.title.split('|')[0].trim();

  written.push(
    write(seo.path, seo, body, [
      breadcrumbSchema([{ name: label, path: seo.path }]),
      ...(faqs
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((f) => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: { '@type': 'Answer', text: f.answer },
              })),
            },
          ]
        : []),
    ])
  );
}

for (const post of blogPosts) {
  const isoPublished = postPublishedIso(post);
  const isoModified = postModifiedIso(post);

  written.push(
    write(
      `/blogs/${post.slug}`,
      {
        path: `/blogs/${post.slug}`,
        title: `${post.title} | Sniffy`,
        description: clamp(post.excerpt),
        ogType: 'article',
        ogImage: `${ORIGIN}${post.coverImage}`,
      },
      blogPostBody(post),
      [
        breadcrumbSchema([
          { name: 'Blog', path: '/blogs' },
          { name: post.title, path: `/blogs/${post.slug}` },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          image: `${ORIGIN}${post.coverImage}`,
          articleSection: post.category,
          ...(isoPublished ? { datePublished: isoPublished, dateModified: isoModified ?? isoPublished } : {}),
          inLanguage: 'en-IN',
          wordCount: post.blocks.map((b) => JSON.stringify(b)).join(' ').split(/\s+/).length,
          author: { '@type': 'Organization', name: 'Sniffy', url: ORIGIN },
          publisher: {
            '@type': 'Organization',
            name: 'Sniffy',
            logo: { '@type': 'ImageObject', url: `${ORIGIN}/sniffy-logo.png` },
          },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `${ORIGIN}/blogs/${post.slug}` },
        },
      ]
    )
  );
}

// ─── 404 ─────────────────────────────────────────────────────────────────────
/**
 * `dist/404.html`, served by `ErrorDocument 404` in .htaccess.
 *
 * Until this existed, .htaccess rule 4 rewrote every unknown path to
 * `index.html` and returned **HTTP 200** — so `/dog-grooming-in-pune/typo`, a
 * stale inbound link, or a crawler probing a guessed URL all got a 200 and the
 * home page body. Google calls that a soft 404: it burns crawl budget on URLs
 * that do not exist and reports them in Search Console instead of indexing real
 * pages. The status code is the fix; this file is what gets served with it.
 *
 * Emitted before the home page for the same reason as the info routes — the home
 * page overwrites `dist/index.html`, which is the shell every clone reads.
 */
written.push(
  write(
    '/404',
    {
      path: '/404',
      title: 'Page not found | Sniffy',
      description:
        'That page does not exist. Find at-home dog and cat grooming in Pune, or get in touch and we will point you the right way.',
    },
    notFoundBody(),
    [],
    { robots: 'noindex, follow', noCanonical: true }
  )
);

// Home last — it overwrites dist/index.html, the shell every clone above reads.
// No BreadcrumbList here: the trail would be a single self-referencing item.
// Dated by what the home page actually says (body + FAQ), not by the shell.
const homeHtml = homeBody();
const homeModified = stampDate('home', homeHtml + JSON.stringify(HOME_FAQS));
flushPageDates();

written.push(
  write('/', HOME_SEO, homeHtml, [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${ORIGIN}/#webpage`,
      url: `${ORIGIN}/`,
      name: HOME_SEO.title,
      inLanguage: 'en-IN',
      isPartOf: { '@id': `${ORIGIN}/#website` },
      about: { '@id': `${ORIGIN}/#petgrooming` },
      dateModified: homeModified,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: HOME_FAQS.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
  ])
);

console.log(`✅ Prerendered ${written.length} SPA routes:`);
console.log(
  `   home + ${Object.keys(SEO_ROUTES).length} info routes + ${blogPosts.length} blog posts + 404`
);
