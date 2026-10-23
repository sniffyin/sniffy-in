/**
 * prerenderServiceBody.ts — static HTML for the /services pages.
 *
 * The React page (src/pages/ServicePage.tsx) replaces #root when it mounts, so
 * this markup exists for crawlers and the pre-hydration paint: every heading,
 * paragraph, price, FAQ and internal link the component renders is also here.
 * Keep the two in step, as with prerenderLocationBody.ts.
 */
import { ALL_PUNE_CITIES } from '../src/data/puneLocalities.ts';
import { blogIndex } from '../src/data/blogIndex.ts';
import { SERVICES } from '../src/data/services/index.ts';
import { SERVICE_NAV } from '../src/data/services/nav.ts';
import type { ServicePageData } from '../src/data/services/types.ts';
import { pricingBlockHtml, siteNavHtml, storySectionHtml } from './prerenderLocationBody.ts';
import { SERVICES_INDEX_FAQS, SERVICES_INDEX_INTRO } from '../src/data/services/indexContent.ts';

function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const NAV_LABEL: Record<string, string> = Object.fromEntries(SERVICE_NAV.map((s) => [s.slug, s.label]));
const AREA_NAME: Record<string, string> = Object.fromEntries(
  ALL_PUNE_CITIES.map((c) => [c.slug.split('/').pop()!, c.name])
);
const BLOG_BY_SLUG = Object.fromEntries(blogIndex.map((p) => [p.slug, p]));

function faqItems(faqs: { q: string; a: string }[]): string {
  return faqs
    .map(
      (f) => `          <div class="border border-gray-200 rounded-xl px-4 py-3">
            <h3 class="font-semibold text-gray-900 text-sm md:text-base">${esc(f.q)}</h3>
            <p class="mt-2 text-gray-600 text-sm leading-relaxed">${esc(f.a)}</p>
          </div>`
    )
    .join('\n');
}

export function prerenderServiceBody(s: ServicePageData): string {
  const inShort = s.inShort.map((l) => `<li>${esc(l)}</li>`).join('\n            ');

  const who = s.whoFor.items
    .map((i) => `          <article class="rounded-2xl border border-gray-200 p-5"><h3 class="font-bold text-gray-900">${esc(i.title)}</h3><p class="mt-2 text-sm text-gray-600">${esc(i.text)}</p></article>`)
    .join('\n');

  const steps = s.process.steps
    .map((st, i) => `          <li class="rounded-2xl border border-gray-200 bg-white p-5"><h3 class="font-bold text-gray-900">${i + 1}. ${esc(st.title)}</h3><p class="mt-1 text-sm text-gray-600">${esc(st.text)}</p></li>`)
    .join('\n');

  const prices = s.pricing.items
    .map(
      (p) =>
        `          <li><strong>${esc(p.label)}</strong>, ${esc(p.price)} (${p.kind === 'package' ? 'package' : 'add-on'}): ${esc(p.note)}</li>`
    )
    .join('\n');

  const stories = s.stories.map((sec, i) => storySectionHtml(sec as never, i)).join('\n');

  const areas = s.areaSlugs
    .map(
      (slug) =>
        `<span class="inline-flex gap-1 rounded-full border border-sniffy-purple/25 px-3 py-1 text-sm">${esc(AREA_NAME[slug] ?? slug)} <a href="/dog-grooming-in-pune/${slug}">dogs</a> <a href="/cat-grooming-in-pune/${slug}">cats</a></span>`
    )
    .join('\n            ');

  const related = s.relatedServices
    .map((slug) => `<li><a href="/services/${slug}">${esc(NAV_LABEL[slug] ?? slug)}</a></li>`)
    .join('\n            ');

  const blogs = s.relatedBlogs
    .map((slug) => {
      const post = BLOG_BY_SLUG[slug];
      return post ? `<li><a href="/blogs/${slug}">${esc(post.title)}</a> <span class="text-xs text-gray-400">${esc(post.category)} · ${esc(post.readTime)}</span></li>` : '';
    })
    .join('\n            ');

  return `      <section class="px-4 py-10 bg-white">
        <div class="max-w-4xl mx-auto">
          <nav aria-label="Breadcrumb" class="text-xs text-gray-500 mb-3"><ol class="flex flex-wrap items-center gap-1"><li><a href="/">Home</a></li><li aria-hidden="true">›</li><li><a href="/services">Services</a></li><li aria-hidden="true">›</li><li>${esc(s.shortName)}</li></ol></nav>
          <h1 class="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">${esc(s.h1Line1)} ${esc(s.h1Accent)}</h1>
          <p class="mt-3 text-gray-600 text-base md:text-lg">${esc(s.heroSubtitle)}</p>
          <div class="mt-6 rounded-3xl border border-gray-200 p-5">
            <p class="text-xs uppercase tracking-widest font-bold text-sniffy-purple">The short answer</p>
            <p class="mt-2 text-gray-800">${esc(s.quickAnswer)}</p>
            <ul class="mt-3 list-disc pl-5 text-sm text-gray-700">
            ${inShort}
            </ul>
          </div>
        </div>
      </section>

      <section class="px-4 py-10 bg-white">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">${esc(s.whoFor.heading)}</h2>
          <p class="text-gray-500 mb-5">${esc(s.whoFor.intro)}</p>
          <div class="grid gap-4 md:grid-cols-3">
${who}
          </div>
        </div>
      </section>

      <section class="px-4 py-10 bg-gray-50">
        <div class="max-w-5xl mx-auto">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">${esc(s.process.heading)}</h2>
          <p class="text-gray-500 mb-5">${esc(s.process.intro)}</p>
          <ol class="grid gap-4 md:grid-cols-2">
${steps}
          </ol>
        </div>
      </section>

      <section id="price" class="px-4 py-10 bg-white">
        <div class="max-w-5xl mx-auto">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">${esc(s.pricing.heading)}</h2>
          <p class="text-gray-500 mb-4">${esc(s.pricing.intro)}</p>
          <ul class="space-y-2 text-sm text-gray-700 list-disc pl-5">
${prices}
          </ul>
          <p class="mt-4 text-sm text-gray-500">${esc(s.pricing.footnote)}</p>
        </div>
      </section>

${pricingBlockHtml(s.pets === 'cat' ? 'cat' : 'dog', 'Pune')}

      <section id="details" class="bg-gray-50 pt-10 pb-2 px-4">
        <div class="max-w-6xl mx-auto text-center">
          <h2 class="text-2xl md:text-4xl font-bold text-gray-900">${esc(s.shortName)}: what to know before you book</h2>
        </div>
      </section>

${stories}

      <section id="faqs" class="px-4 py-10 bg-white">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-6">${esc(s.shortName)}: frequently asked questions</h2>
          <div class="space-y-3 max-w-3xl">
${faqItems(s.faqs)}
          </div>
        </div>
      </section>

      <section id="areas" class="px-4 py-10 bg-white">
        <div class="max-w-6xl mx-auto text-center">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-3">${esc(s.shortName)} across Pune</h2>
          <p class="text-gray-500 max-w-2xl mx-auto mb-5">The same groomers, prices and approach in all 33 localities. Pick your area for the roads, societies and weather we plan around.</p>
          <div class="flex flex-wrap justify-center gap-2">
            ${areas}
          </div>
          <p class="mt-5 text-sm"><a href="/dog-grooming-in-pune">All dog grooming areas</a> · <a href="/cat-grooming-in-pune">All cat grooming areas</a></p>
        </div>
      </section>

      <section class="px-4 py-10 bg-gray-50">
        <div class="max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
          <div>
            <h2 class="text-xl font-bold text-gray-900 mb-3">Related services</h2>
            <ul class="space-y-1 text-sm text-sniffy-purple">
            ${related}
            <li><a href="/services">See all grooming services</a></li>
            </ul>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 mb-3">Guides worth reading</h2>
            <ul class="space-y-1 text-sm text-sniffy-purple">
            ${blogs}
            </ul>
          </div>
        </div>
      </section>

${siteNavHtml()}`;
}

export function prerenderServicesIndexBody(): string {
  const cards = SERVICES.map(
    (s) =>
      `          <article class="rounded-3xl border border-gray-200 p-6"><p class="text-xs uppercase tracking-widest font-bold text-sniffy-purple">${esc(s.eyebrow)}</p><h3 class="mt-2 text-lg font-bold text-gray-900"><a href="/services/${s.slug}">${esc(s.name)}</a></h3><p class="mt-2 text-sm text-gray-600">${esc(s.heroSubtitle)}</p></article>`
  ).join('\n');

  const intro = SERVICES_INDEX_INTRO.paragraphs.map((p) => `<p class="mt-3 text-gray-600">${esc(p)}</p>`).join('\n          ');

  return `      <section class="px-4 py-10 bg-white">
        <div class="max-w-4xl mx-auto">
          <nav aria-label="Breadcrumb" class="text-xs text-gray-500 mb-3"><ol class="flex flex-wrap items-center gap-1"><li><a href="/">Home</a></li><li aria-hidden="true">›</li><li>Services</li></ol></nav>
          <h1 class="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">Pet Grooming Services at Home in Pune</h1>
          <p class="mt-3 text-gray-600 text-base md:text-lg">${esc(SERVICES_INDEX_INTRO.hero)}</p>
          <h2 class="mt-8 text-2xl font-bold text-gray-900">${esc(SERVICES_INDEX_INTRO.heading)}</h2>
          ${intro}
        </div>
      </section>

      <section class="px-4 py-10 bg-white">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Find the service that fits your pet</h2>
          <p class="text-gray-500 mb-5">Shedding, mats, a new puppy, an older pet, parasites, a nervous pet or a skin problem. Each is handled within our published prices.</p>
          <div class="grid gap-5 md:grid-cols-3">
${cards}
          </div>
        </div>
      </section>

${pricingBlockHtml('dog', 'Pune')}

      <section class="px-4 py-10 bg-white">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-xl md:text-3xl font-bold text-gray-900 mb-6">Grooming services: frequently asked questions</h2>
          <div class="space-y-3 max-w-3xl">
${faqItems(SERVICES_INDEX_FAQS)}
          </div>
        </div>
      </section>

${siteNavHtml()}`;
}
