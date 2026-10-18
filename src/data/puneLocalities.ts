/**
 * puneLocalities — just the name+slug list for every locality landing page.
 *
 * Why this is its own module
 * ──────────────────────────
 * These two arrays used to live at the top of `locationData.ts` and
 * `catLocationData.ts`, alongside ~4,800 lines each of locality prose, reviews
 * and FAQs. Any module that wanted only the list of area names — the home page's
 * <AreasWeServe />, the sitemap generator, vite.config's page-entry builder —
 * pulled in the entire body of copy with it, because the arrays and the content
 * were in the same module and there was nothing for Rollup to tree-shake around
 * (the content is exported too).
 *
 * The cost was measured, not theoretical: the built home page eagerly loaded
 * locationData.js (313 KB) + catLocationData.js (378 KB) — 691 KB of text the
 * home page never renders — pushing them ahead of the LCP image on the network.
 *
 * Splitting the list out means importing area names costs ~2 KB. The two content
 * modules re-export these arrays, so every existing
 * `import { ALL_PUNE_CITIES } from './locationData'` keeps working — but new code
 * that only needs names should import from HERE.
 */

export interface PuneLocality {
  /** Display name, e.g. "Koregaon Park". */
  name: string;
  /** Path without the leading slash, e.g. "dog-grooming-in-pune/koregaon-park". */
  slug: string;
}

/**
 * URL prefixes for the two locality clusters. Named because siblingLocality()
 * below swaps one for the other to cross-link them.
 */
const DOG_PREFIX = 'dog-grooming-in-pune/';
const CAT_PREFIX = 'cat-grooming-in-pune/';

/** Dog grooming locality pages. Grouped geographically, not alphabetically. */
export const ALL_PUNE_CITIES: PuneLocality[] = [
  { name: 'Dhanori',           slug: 'dog-grooming-in-pune/dhanori' },
  { name: 'Wagholi',           slug: 'dog-grooming-in-pune/wagholi' },
  { name: 'Kalyani Nagar',     slug: 'dog-grooming-in-pune/kalyani-nagar' },
  { name: 'Lohegaon',          slug: 'dog-grooming-in-pune/lohegaon' },
  { name: 'Kharadi',           slug: 'dog-grooming-in-pune/kharadi' },
  { name: 'Viman Nagar',       slug: 'dog-grooming-in-pune/viman-nagar' },
  { name: 'Mundwa',            slug: 'dog-grooming-in-pune/mundwa' },
  { name: 'Koregaon Park',     slug: 'dog-grooming-in-pune/koregaon-park' },
  { name: 'Yerawada',          slug: 'dog-grooming-in-pune/yerawada' },

  { name: 'Kothrud',           slug: 'dog-grooming-in-pune/kothrud' },
  { name: 'Shivajinagar',      slug: 'dog-grooming-in-pune/shivajinagar' },
  { name: 'Dhayari',           slug: 'dog-grooming-in-pune/dhayari' },
  { name: 'Karve Nagar',       slug: 'dog-grooming-in-pune/karve-nagar' },
  { name: 'Ambegaon',          slug: 'dog-grooming-in-pune/ambegaon' },
  { name: 'Baner',             slug: 'dog-grooming-in-pune/baner' },
  { name: 'Bavdhan',           slug: 'dog-grooming-in-pune/bavdhan' },

  { name: 'Wakad',             slug: 'dog-grooming-in-pune/wakad' },
  { name: 'Pimpri-Chinchwad',  slug: 'dog-grooming-in-pune/pimpri-chinchwad' },
  { name: 'Khadki',            slug: 'dog-grooming-in-pune/khadki' },
  { name: 'Ravet',             slug: 'dog-grooming-in-pune/ravet' },
  { name: 'Aundh',             slug: 'dog-grooming-in-pune/aundh' },
  { name: 'Kalewadi',          slug: 'dog-grooming-in-pune/kalewadi' },
  { name: 'Hinjewadi',         slug: 'dog-grooming-in-pune/hinjewadi' },
  { name: 'Pimple Saudagar',   slug: 'dog-grooming-in-pune/pimple-saudagar' },

  { name: 'Kondhwa',           slug: 'dog-grooming-in-pune/kondhwa' },
  { name: 'NIBM',              slug: 'dog-grooming-in-pune/nibm' },
  { name: 'Katraj',            slug: 'dog-grooming-in-pune/katraj' },
  { name: 'Handewadi',         slug: 'dog-grooming-in-pune/handewadi' },
  { name: 'Hadapsar',          slug: 'dog-grooming-in-pune/hadapsar' },
  { name: 'Bibewadi',          slug: 'dog-grooming-in-pune/bibewadi' },
  { name: 'Camp',              slug: 'dog-grooming-in-pune/camp' },
  { name: 'Wanowrie',          slug: 'dog-grooming-in-pune/wanowrie' },
  { name: 'Magarpatta',        slug: 'dog-grooming-in-pune/magarpatta' },
];

/** Cat grooming locality pages — same localities, cat-grooming URLs. */
export const ALL_CAT_PUNE_CITIES: PuneLocality[] = ALL_PUNE_CITIES.map((c) => ({
  name: c.name,
  slug: c.slug.replace(DOG_PREFIX, CAT_PREFIX),
}));

/**
 * The keyword half of a locality link's anchor text — "Dog grooming in " —
 * meant to be rendered in an sr-only span immediately before the visible
 * locality name, so the anchor reads "Dog grooming in Wakad" while the pill
 * still shows just "Wakad".
 *
 * Why this exists
 * ───────────────
 * The ~2,100 internal links between these 66 pages all used the bare locality
 * name as their anchor text, which tells a crawler nothing about what the
 * destination page is for. Anchor text is one of the few strong on-page signals
 * left, and at this link volume it was being spent on a word that does not
 * contain the term the destination ranks for.
 *
 * It is a prefix rather than a full label because the callers are dense pill
 * grids and truncated cards — 32 pills each reading "Dog grooming in
 * Pimpri-Chinchwad" is a wall of text, and the hub cards' titles are
 * `truncate`d in a 4-column grid, so a full visible label would just be clipped.
 * The section headings above these grids carry the keyword visibly instead.
 *
 * Species comes from the slug prefix rather than a parameter so a caller cannot
 * label a cat page "Dog grooming in …". Returns '' for anything outside the two
 * locality clusters, so mixed link lists (the footer, which also holds company
 * links) can call it unconditionally.
 *
 * Every surface that renders these links must use it — the pills in
 * LocationCities/AreasWeServe, the hub cards, the footer, and their static
 * mirrors in scripts/prerenderLocationBody.ts and scripts/prerenderSpa.ts. The
 * static HTML is what a crawler that does not run JS sees; the React DOM is what
 * Google sees after rendering. Fixing only one fixes half the crawlers.
 */
export function localityLinkPrefix(slug: string): string {
  if (slug.startsWith(DOG_PREFIX)) return 'Dog grooming in ';
  if (slug.startsWith(CAT_PREFIX)) return 'Cat grooming in ';
  return '';
}

export interface SiblingLocality {
  /** Absolute path, e.g. "/cat-grooming-in-pune/baner". */
  href: string;
  /** Exact-match anchor text, e.g. "Cat grooming in Baner". */
  label: string;
  /** Species of the TARGET page, not of the page linking to it. */
  petType: 'dog' | 'cat';
}

/**
 * The same locality's page for the other species —
 * dog-grooming-in-pune/baner ↔ cat-grooming-in-pune/baner.
 *
 * Why this exists
 * ───────────────
 * Every locality page linked all 32 of its siblings in the SAME species plus
 * both hub pages, and never the one page covering the same neighbourhood for
 * the other animal — the single most topically-related URL on the site. That is
 * 66 pages each missing their most relevant internal link, and it also stranded
 * the cat set: cat pages were only reachable from the cat hub, so crawl equity
 * flowed into the dog cluster and stayed there.
 *
 * Both surfaces must use this. The generated HTML is thrown away when React
 * mounts (see scripts/prerenderLocationBody.ts), so a link added only to the
 * static body is absent from the DOM Google actually indexes after rendering —
 * and one added only to React is invisible to Bing and the AI answer engines,
 * which do not execute JS. Deriving both from here keeps the href and the
 * anchor text identical, which is the point: a rendered link that disagrees
 * with the served one is worth less than either.
 *
 * Returns null rather than guessing when there is no matching page, so a caller
 * can never emit a 404 if the two lists stop being 1:1.
 */
export function siblingLocality(slug: string): SiblingLocality | null {
  const isDog = slug.startsWith(DOG_PREFIX);
  if (!isDog && !slug.startsWith(CAT_PREFIX)) return null;

  const siblingSlug = isDog
    ? slug.replace(DOG_PREFIX, CAT_PREFIX)
    : slug.replace(CAT_PREFIX, DOG_PREFIX);

  const match = (isDog ? ALL_CAT_PUNE_CITIES : ALL_PUNE_CITIES).find(
    (c) => c.slug === siblingSlug
  );
  if (!match) return null;

  return {
    href: `/${match.slug}`,
    label: `${isDog ? 'Cat' : 'Dog'} grooming in ${match.name}`,
    petType: isDog ? 'cat' : 'dog',
  };
}
