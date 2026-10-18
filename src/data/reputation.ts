/**
 * reputation — the ONE place the public rating numbers live.
 *
 * ── Why this file exists ─────────────────────────────────────────────────────
 * The rating was previously hardcoded in seven places: the hero slide, both
 * city-hub stat strips, AboutPage, WhySniffyPage, and — most damagingly — the
 * `aggregateRating` JSON-LD in scripts/generatePunePage.ts and
 * scripts/generateCatPunePage.ts. Those two said **4.9 from 120 reviews**,
 * which was never the real number and was not displayed anywhere on the page
 * it was marked up on. That combination (invented figure + no visible source)
 * is exactly what Google's structured-data policy calls out, and it is a
 * manual-action risk for zero upside.
 *
 * The real figure comes from the Google Business Profile linked in
 * src/data/siteLinks.ts. Update BOTH numbers here when it moves and every
 * surface — visible copy and structured data alike — follows.
 *
 * ── Rules that must hold whenever you touch this ─────────────────────────────
 * 1. The numbers must be TRUE and re-checkable on the Business Profile.
 * 2. Any page that emits `aggregateRating` in JSON-LD must also SHOW the same
 *    rating in its visible HTML. Google requires the marked-up rating to be
 *    on-page and available to users, not buried in a script tag. In this repo
 *    that pairing is: <RatingSummary /> (React) and ratingSummaryHtml() in
 *    scripts/prerenderLocationBody.ts (static) — they render the same words.
 * 3. Do not mark up the on-page testimonials as schema.org `Review`. They are
 *    first-party marketing copy, not verified reviews collected on this site
 *    (see the note in src/data/homeTestimonials.ts), and self-serving review
 *    markup is the one thing more likely to earn a penalty than a fake average.
 *
 * ── What this will and will not do in search ─────────────────────────────────
 * It will NOT put star ratings under the sniffy.in result in Google. Google has
 * been ineligible-by-policy for "self-serving" reviews — a business marking up
 * its own rating on its own site — for LocalBusiness/Organization since 2019.
 * Stars beside a service business in Google come from the Business Profile
 * (local pack and branded knowledge panel), not from this markup.
 *
 * What it does do: state a true, sourced, on-page figure that Bing (which does
 * still render review snippets), and the AI answer engines that increasingly
 * read JSON-LD verbatim, can both use — and remove a fabricated claim from
 * every generated page in the repo.
 */

/** Average rating on the Google Business Profile. Verify before changing. */
export const RATING_VALUE = 5.0;

/** Total review count on the Google Business Profile. Verify before changing. */
export const REVIEW_COUNT = 255;

/** Schema.org `bestRating`. Google's scale, not ours — always 5. */
export const BEST_RATING = 5;

/** Where the number comes from. Named in the visible copy so the claim is checkable. */
export const RATING_SOURCE = 'Google';

/**
 * Display form of the average.
 *
 * `toFixed(1)` deliberately: a bare "5" reads like a rounded marketing number,
 * "5.0" reads like a measured one. Kept as a derived constant so the visible
 * text and the JSON-LD `ratingValue` can never drift apart.
 */
export const RATING_DISPLAY = RATING_VALUE.toFixed(1);

/** One-line summary, e.g. "5.0 from 255 Google reviews". Used in stat strips. */
export const RATING_SUMMARY = `${RATING_DISPLAY} from ${REVIEW_COUNT} ${RATING_SOURCE} reviews`;

/**
 * The `aggregateRating` node as a JSON-LD fragment.
 *
 * Emitted by the four page generators so the static HTML carries the same
 * numbers this module exports. `indent` matches the surrounding literal's
 * indentation — the generated files are read by humans during SEO debugging
 * and ragged JSON in a <script> block is genuinely annoying to scan.
 *
 * Only call this from a generator whose page also renders ratingSummaryHtml().
 */
export function aggregateRatingJson(indent = 8): string {
  const pad = ' '.repeat(indent);
  return [
    `{`,
    `${pad}  "@type": "AggregateRating",`,
    `${pad}  "ratingValue": "${RATING_DISPLAY}",`,
    `${pad}  "reviewCount": "${REVIEW_COUNT}",`,
    `${pad}  "bestRating": "${BEST_RATING}",`,
    `${pad}  "worstRating": "1"`,
    `${pad}}`,
  ].join('\n');
}
