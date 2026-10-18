/**
 * seoText — shared SEO string helpers for the build scripts.
 *
 * Extracted from `prerenderSpa.ts`, which was the only consumer of `clamp()`.
 * That was the bug: the four locality/hub generators emitted
 * `src/data/loc*SEO.ts` descriptions verbatim, and those run up to 229
 * characters — Google renders ~155-160 and cuts the rest mid-word, so the last
 * third of every locality description (the part carrying "from ₹799") was never
 * shown. Sharing the helper means a single length rule covers the prerendered
 * SPA routes, the 66 locality pages and the two city hubs.
 */

/**
 * What Google actually renders for a desktop description. Not a hard API limit —
 * it varies with pixel width and Google rewrites descriptions freely — but it is
 * the point past which text reliably stops being displayed, so writing past it
 * is writing for nobody.
 */
export const META_DESCRIPTION_MAX = 158;

/**
 * MIRRORED IN `src/lib/useSeo.ts` (`clampDescription`) — keep the two in sync.
 *
 * Deliberate duplication, not an oversight. This module is imported by Node
 * build scripts; `useSeo.ts` imports React and runs in the browser, so neither
 * can import the other without dragging its dependencies across. The two are
 * kept identical because they must produce the same string: `useSeo` clamps a
 * blog excerpt at runtime and `prerenderSpa` clamps the same excerpt at build
 * time, and a crawler that saw different descriptions before and after JS ran
 * would be looking at what appears to be cloaking. Same reasoning as
 * `normalize_phone` existing in both SQL and `customerTypes.ts`.
 */

/** Clamp a description to `max`, cutting on a word boundary. */
export function clamp(text: string, max = META_DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.—-]+$/, '')}…`;
}

/**
 * Same as `clamp()`, but reports what it had to cut.
 *
 * A clamped description is a fallback, not a good outcome: the ellipsis is a
 * sentence the copywriter did not choose. Warning on every truncation keeps the
 * over-length source strings visible in the build log so they can be rewritten
 * to fit, instead of silently shipping a machine-cut version forever.
 */
export function clampDescription(
  text: string,
  label: string,
  max = META_DESCRIPTION_MAX
): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  const out = clamp(clean, max);

  if (out !== clean) {
    console.warn(
      `   ⚠ ${label}: description clamped ${clean.length} → ${out.length} chars. ` +
        `Rewrite it to fit ${max} so the ending is yours, not an ellipsis.`
    );
  }

  return out;
}
