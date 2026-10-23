/**
 * Which guides a locality page links to.
 *
 * Every locality page used to list ALL matching guides (46 on a dog page): an
 * ~890-word block identical on all 33 pages and the largest piece of shared
 * text on them. Each locality now shows PER_PAGE guides: the first two are
 * pinned (the highest-intent guides — how often, and what it costs), the rest
 * rotate by locality so the 33 pages between them still link every guide, and
 * no two neighbouring pages show the same set.
 *
 * Used by BOTH the React component and the prerendered HTML — they must pick the
 * same posts, so the logic lives here and nowhere else.
 */

export const GUIDES_PER_PAGE = 6;

/** Linked from every locality page of the matching species, in this order. */
const PINNED = [
  'how-often-should-you-groom-your-dog-in-pune',
  'dog-cat-grooming-cost-in-pune-price-guide',
];

interface PostLike {
  slug: string;
  audience: 'dog' | 'cat' | 'all';
}

/** Small stable string hash — the same result in Node and in the browser. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function guidesForLocality<T extends PostLike>(
  posts: T[],
  audience: 'dog' | 'cat' | 'all',
  localitySlug: string,
  limit = GUIDES_PER_PAGE
): T[] {
  const eligible = posts.filter(
    (p) => audience === 'all' || p.audience === 'all' || p.audience === audience
  );
  const pinned = PINNED.map((s) => eligible.find((p) => p.slug === s)).filter(
    (p): p is T => !!p
  );
  const rest = eligible.filter((p) => !pinned.includes(p));
  if (rest.length === 0) return pinned.slice(0, limit);

  const need = Math.max(0, limit - pinned.length);
  const start = hash(localitySlug) % rest.length;
  const rotated = Array.from({ length: Math.min(need, rest.length) }, (_, i) => rest[(start + i * 3) % rest.length]);
  return [...pinned, ...Array.from(new Set(rotated))];
}
