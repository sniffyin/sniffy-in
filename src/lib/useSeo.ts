/**
 * useSeo — per-route <title>, meta description and canonical for SPA routes.
 *
 * WHY THIS EXISTS
 * Every SPA route (`/blogs`, `/about`, `/faqs`, …) is served the same
 * `index.html`, which hardcodes `<link rel="canonical" href="https://sniffy.in/">`
 * and the home-page title. Without this hook each of those URLs tells search
 * engines "I am a duplicate of the homepage", so none of them get indexed —
 * including the blog posts.
 *
 * The generated locality pages under `dog-grooming-in-pune/` and
 * `cat-grooming-in-pune/` already ship correct static <head> tags from the
 * generator scripts. They do NOT need this hook.
 *
 * Applied on mount and reverted on unmount, so client-side navigation between
 * routes leaves the document head correct rather than accumulating state.
 */
import { useEffect } from 'react';

export const SITE_ORIGIN = 'https://sniffy.in';

interface SeoOptions {
  /** Full <title>. Include the brand — this is what shows in the SERP. */
  title: string;
  /** Meta description. ~150–160 chars is the useful budget. */
  description: string;
  /** Route path beginning with a slash, e.g. `/blogs`. Becomes the canonical. */
  path: string;
  /** Absolute or root-relative image for social previews. */
  image?: string;
  /** `article` for blog posts, otherwise `website`. */
  type?: 'website' | 'article';
}

/**
 * Trim a description to the length Google actually renders (~160 chars),
 * cutting at a word boundary rather than mid-word. Used for blog excerpts,
 * which are written for the page and run longer than the meta budget.
 */
export function clampDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.—-]+$/, '')}…`;
}

/** Set (or create) a <meta> tag, returning a function that restores it. */
function setMeta(selector: string, attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  const created = !el;

  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }

  const previous = el.getAttribute('content');
  el.setAttribute('content', value);

  return () => {
    if (created) el?.remove();
    else if (previous !== null) el?.setAttribute('content', previous);
  };
}

export function useSeo({ title, description, path, image, type = 'website' }: SeoOptions) {
  useEffect(() => {
    const url = `${SITE_ORIGIN}${path}`;
    const ogImage = image
      ? image.startsWith('http')
        ? image
        : `${SITE_ORIGIN}${image}`
      : `${SITE_ORIGIN}/sniffy-logo.png`;

    // ── <title> ──────────────────────────────────────────────────────────────
    const previousTitle = document.title;
    document.title = title;

    // ── canonical ────────────────────────────────────────────────────────────
    // The single most important tag here: index.html points every route at the
    // homepage, which suppresses indexing of this URL until we override it.
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const previousCanonical = canonical?.getAttribute('href') ?? null;
    if (canonical) canonical.setAttribute('href', url);

    // ── description + Open Graph ─────────────────────────────────────────────
    const restore = [
      setMeta('meta[name="description"]', 'name', 'description', description),
      setMeta('meta[property="og:title"]', 'property', 'og:title', title),
      setMeta('meta[property="og:description"]', 'property', 'og:description', description),
      setMeta('meta[property="og:url"]', 'property', 'og:url', url),
      setMeta('meta[property="og:type"]', 'property', 'og:type', type),
      setMeta('meta[property="og:image"]', 'property', 'og:image', ogImage),
    ];

    return () => {
      document.title = previousTitle;
      if (canonical && previousCanonical) canonical.setAttribute('href', previousCanonical);
      restore.forEach((undo) => undo());
    };
  }, [title, description, path, image, type]);
}
