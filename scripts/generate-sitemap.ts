/**
 * generate-sitemap — writes dist/sitemap.xml. Run AFTER `vite build`.
 *
 * Covers three groups:
 *   1. Home + the two city hubs
 *   2. Every generated locality page (dog + cat)
 *   3. The SPA content routes — blog index, each blog post, and the info pages
 *
 * Group 3 was missing entirely until now, which combined with the homepage
 * canonical in index.html meant the blog was both unlisted and marked as a
 * duplicate. `src/lib/useSeo.ts` fixes the canonical side; this fixes discovery.
 */
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { ALL_PUNE_CITIES } from "../src/data/locationData.ts";
import { ALL_CAT_PUNE_CITIES } from "../src/data/catLocationData.ts";
import { SERVICES } from "../src/data/services/index.ts";
import { blogPosts } from "../src/data/blogPosts.ts";
import { SEO_ROUTES } from "../src/data/seoRoutes.ts";
import { pageLastModified } from "../src/data/pageDates.ts";
import { postModifiedIso } from "../src/data/blogPosts.ts";

const BASE_URL = "https://sniffy.in";

interface SitemapUrl {
  loc: string;
  priority: string;
  changefreq: string;
  /** Path whose last modification dates this URL. See lastmodOf(). */
  source: string;
  /**
   * PAGE_DATES key (scripts/pageDates.ts). When the page has one, its <lastmod>
   * is that date — the same value the page shows and puts in dateModified, so
   * the sitemap and the page can never disagree.
   */
  pageKey?: string;
  /** Explicit ISO lastmod, for URLs dated by their own content (blog posts). */
  isoDate?: string;
}

// ─── lastmod ─────────────────────────────────────────────────────────────────
/**
 * `changefreq` and `priority` are hints Google has said publicly it ignores.
 * `lastmod` is the one field it does use — to decide whether a known URL is
 * worth recrawling. Emitting none meant every recrawl decision was made without
 * our input; emitting the build timestamp on all 73 URLs would be worse, since
 * a sitemap that claims everything changed on every deploy gets its lastmod
 * distrusted wholesale.
 *
 * So each URL is dated by the last real modification of the file its content
 * comes from:
 *   1. the file's last git commit date — the honest answer, and stable across
 *      machines and rebuilds
 *   2. filesystem mtime, if the file is untracked or git is unavailable (fresh
 *      clone with no history, some CI checkouts)
 *   3. the build date, only if both fail
 *
 * Dates are emitted as W3C date-only (YYYY-MM-DD), which the sitemap protocol
 * allows and which avoids implying more precision than we have.
 */
const BUILD_DATE = new Date().toISOString().slice(0, 10);

/**
 * Paths with uncommitted changes in the working tree.
 *
 * This matters because the sitemap is generated from the working tree, not from
 * HEAD — so for a file that has been edited but not yet committed, the last
 * commit date is stale by definition: it describes content that is about to be
 * replaced by what we are shipping. Those files fall back to mtime instead.
 *
 * Collected in one `git status` call rather than per-file, since this runs for
 * all 73 URLs.
 */
const dirtyPaths: Set<string> = (() => {
  try {
    const out = execFileSync("git", ["status", "--porcelain", "-z"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    // NUL-separated so paths with spaces survive; each record is "XY <path>".
    // Renames emit an extra NUL-terminated original path, which we skip.
    const paths = new Set<string>();
    const records = out.split("\0").filter(Boolean);
    for (let i = 0; i < records.length; i++) {
      const status = records[i].slice(0, 2);
      paths.add(records[i].slice(3));
      if (status[0] === "R" || status[0] === "C") i++; // consume the source path
    }
    return paths;
  } catch {
    return new Set<string>();
  }
})();

/**
 * Case-SENSITIVE existence check.
 *
 * `fs.existsSync` is not enough here: macOS and Windows use case-insensitive
 * filesystems, so `src/pages/FaqsPage.tsx` "exists" even though the real file
 * is `FAQsPage.tsx`. A wrong-cased path would therefore pass the guard below on
 * a developer's Mac, then break the build on Linux CI — and in the meantime git
 * (which IS case-sensitive about pathspecs) would return no commit for it, so
 * the URL would silently fall back to mtime. Comparing against the real
 * directory listing catches it everywhere.
 */
function existsExact(filePath: string): boolean {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  try {
    return fs.readdirSync(dir).includes(base);
  } catch {
    return false;
  }
}

const lastmodCache = new Map<string, string>();

function lastmodOf(sourcePath: string): string {
  const cached = lastmodCache.get(sourcePath);
  if (cached) return cached;

  let date = "";

  if (existsExact(sourcePath)) {
    // Committed and unmodified → the commit date is the honest answer.
    if (!dirtyPaths.has(sourcePath)) {
      try {
        const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", sourcePath], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        }).trim();
        if (out) date = out.slice(0, 10);
      } catch {
        // git missing, or not a repo — fall through to mtime.
      }
    }

    // Modified, untracked, or no git available → mtime describes what we ship.
    if (!date) {
      try {
        date = fs.statSync(sourcePath).mtime.toISOString().slice(0, 10);
      } catch {
        // unreadable — fall through to build date.
      }
    }
  }

  const result = date || BUILD_DATE;
  lastmodCache.set(sourcePath, result);
  return result;
}

const urls: SitemapUrl[] = [
  // The home page is assembled from several data modules; date it by the most
  // recently touched of them rather than picking one arbitrarily.
  { loc: BASE_URL, priority: "1.0", changefreq: "weekly", source: "src/data/homeStories.ts", pageKey: "home" },
  { loc: `${BASE_URL}/dog-grooming-in-pune`, priority: "0.9", changefreq: "weekly", source: "src/data/puneHubContent.ts", pageKey: "dog-grooming-in-pune" },
  { loc: `${BASE_URL}/cat-grooming-in-pune`, priority: "0.9", changefreq: "weekly", source: "src/data/catPuneHubContent.ts", pageKey: "cat-grooming-in-pune" },
];

// ─── Generated locality pages ────────────────────────────────────────────────
// Dated by the generated HTML itself: it is committed to the repo, so its git
// history is exactly "when this page's content last changed".

for (const city of ALL_PUNE_CITIES) {
  urls.push({
    loc: `${BASE_URL}/${city.slug}`,
    priority: "0.8",
    changefreq: "weekly",
    source: `${city.slug}.html`,
    pageKey: city.slug,
  });
}

for (const city of ALL_CAT_PUNE_CITIES) {
  urls.push({
    loc: `${BASE_URL}/${city.slug}`,
    priority: "0.8",
    changefreq: "weekly",
    source: `${city.slug}.html`,
    pageKey: city.slug,
  });
}

// ─── Service pages ───────────────────────────────────────────────────────────
// Generated and committed, so each page's own git history dates it.
urls.push({ loc: `${BASE_URL}/services`, priority: "0.8", changefreq: "monthly", source: "services/index.html", pageKey: "services" });
for (const s of SERVICES) {
  urls.push({ loc: `${BASE_URL}/services/${s.slug}`, priority: "0.8", changefreq: "monthly", source: `services/${s.slug}.html`, pageKey: `services/${s.slug}` });
}

// ─── Blog posts ──────────────────────────────────────────────────────────────
// Imported directly — `src/data/blogPosts.ts` is a dependency-free data module
// precisely so build scripts can read it. (It used to be inlined in
// BlogsPage.tsx, which drags in React and a CSS-importing component tree and
// cannot load in Node; that is why the content was extracted.)

for (const post of blogPosts) {
  urls.push({
    loc: `${BASE_URL}/blogs/${post.slug}`,
    priority: "0.7",
    changefreq: "monthly",
    source: "src/data/blogPosts.ts",
    // The post's own date, not the shared data file's: one edit to blogPosts.ts
    // would otherwise re-date all 55 posts. Matches BlogPosting.dateModified.
    isoDate: postModifiedIso(post) ?? undefined,
  });
}

// ─── SPA info routes ─────────────────────────────────────────────────────────
// Taken from the same SEO_ROUTES map that useSeo() and scripts/prerenderSpa.ts
// read, so a new route cannot be prerendered but left out of the sitemap.

const infoRoutes = Object.values(SEO_ROUTES).map((r) => r.path);

// Each info route renders from a React page component, so that file's history is
// what dates the URL. Mapped explicitly rather than derived from the slug —
// `/faqs` is `FAQsPage.tsx`, not `FaqsPage.tsx`, and a derivation that guessed
// wrong would silently fall back to the build date and look fine.
const INFO_ROUTE_SOURCE: Record<string, string> = {
  "/about": "src/pages/AboutPage.tsx",
  "/how-it-works": "src/pages/HowItWorksPage.tsx",
  "/gallery": "src/pages/GalleryPage.tsx",
  "/why-sniffy": "src/pages/WhySniffyPage.tsx",
  "/contact": "src/pages/ContactPage.tsx",
  "/faqs": "src/pages/FAQsPage.tsx",
  "/blogs": "src/data/blogPosts.ts",
  "/groomer-onboarding": "src/pages/GroomerOnboardingPage.tsx",
};

for (const route of infoRoutes) {
  const source = INFO_ROUTE_SOURCE[route];

  if (!source) {
    throw new Error(
      `generate-sitemap: no INFO_ROUTE_SOURCE entry for "${route}". Add the ` +
        `route's page file above so the URL gets a real <lastmod>.`
    );
  }

  if (!existsExact(source)) {
    throw new Error(
      `generate-sitemap: INFO_ROUTE_SOURCE["${route}"] points at "${source}", ` +
        `which does not exist. The page was renamed — update the map.`
    );
  }

  urls.push({ loc: `${BASE_URL}${route}`, priority: "0.7", changefreq: "monthly", source });
}

// ─── Emit ────────────────────────────────────────────────────────────────────

const duplicates = urls
  .map((u) => u.loc)
  .filter((loc, i, all) => all.indexOf(loc) !== i);

if (duplicates.length > 0) {
  throw new Error(`generate-sitemap: duplicate URLs emitted: ${duplicates.join(", ")}`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, changefreq, priority, source, pageKey, isoDate }) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${isoDate || (pageKey && pageLastModified(pageKey)) || lastmodOf(source)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("")}

</urlset>
`;

fs.writeFileSync("dist/sitemap.xml", sitemap);

console.log(
  `✅ Sitemap generated: ${urls.length} URLs ` +
    `(${ALL_PUNE_CITIES.length} dog + ${ALL_CAT_PUNE_CITIES.length} cat localities, ` +
    `${blogPosts.length} blog posts, ${infoRoutes.length} info routes)`
);
