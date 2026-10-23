/**
 * Shared by the two Pune hub pages, their React components and their
 * generators, so the prerendered HTML and the mounted page say the same thing.
 */

/** Hub link(s) a blog post points at, by the species it is about. */
export function blogHubLinks(audience: 'dog' | 'cat' | 'all'): { href: string; label: string }[] {
  const dog = { href: '/dog-grooming-in-pune', label: 'Dog grooming at home in Pune' };
  const cat = { href: '/cat-grooming-in-pune', label: 'Cat grooming at home in Pune' };
  return audience === 'dog' ? [dog] : audience === 'cat' ? [cat] : [dog, cat];
}

/** Cross-link from each hub to the other species' hub. */
export const HUB_SIBLING = {
  dog: { prompt: 'Have a cat too?', href: '/cat-grooming-in-pune', label: 'Cat grooming in Pune' },
  cat: { prompt: 'Have a dog too?', href: '/dog-grooming-in-pune', label: 'Dog grooming in Pune' },
} as const;
