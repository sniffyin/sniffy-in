/**
 * storyMeta — resolves the small-caps eyebrow + icon badge shown above every
 * story heading.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 * The home page's story sections (`homeStories.ts`) each carry a hand-written
 * `eyebrow`/`icon` pair, which is what gives that section its look on mobile:
 * the body collapses into an accordion, so without the icon + label the page is
 * a stack of near-identical text bands.
 *
 * The 58 locality pages and the two hub pages render the same sections from
 * `locationData.ts` / `catLocationData.ts` / `{cat,}puneHubContent.ts` — roughly
 * 300 sections in total, none of which was ever given an eyebrow. Rather than
 * hand-annotate 300 entries (and require every future locality to remember to),
 * this derives the pair from the heading and subheading text.
 *
 * Explicit wins: if a section sets `eyebrow`/`icon` itself, that is returned
 * untouched, so the home page's curated labels are unaffected.
 *
 * ── Deliberately dependency-free ────────────────────────────────────────────
 * No imports. The prerender scripts (`scripts/prerender*.ts`) run this under
 * `tsx` in Node, so it must not pull in React, lucide, or anything touching
 * `import.meta.env`.
 */

/** Key into STORY_ICONS in src/components/StoryBlock.tsx. */
export type StoryIconKey =
  | 'price'
  | 'calendar'
  | 'season'
  | 'cat'
  | 'home'
  | 'breed'
  | 'lifestage'
  | 'services'
  | 'trust';

export interface StoryMeta {
  eyebrow: string;
  icon: StoryIconKey;
}

/** The subset of a story section this needs. Structural, so both the React
 *  `LocationStorySection` and the plainer hub-section objects satisfy it. */
export interface StoryMetaInput {
  heading: string;
  subheading?: string;
  eyebrow?: string;
  icon?: StoryIconKey;
}

/**
 * Ordered — first match wins, so the more specific angle must come first.
 *
 * The ordering is what makes the common ambiguous headings land right:
 * "Regular Grooming for Long-Term Coat Health" is a frequency section, not a
 * coat section, so `calendar` is tested before `services`; "Long-Haired Cats
 * and Kondhwa's Climate Don't Mix" is a climate section even though it names a
 * coat, so `season` is tested before both.
 *
 * Labels are reused verbatim from homeStories.ts so a visitor moving from the
 * home page to a locality page sees the same vocabulary.
 */
const RULES: { icon: StoryIconKey; eyebrow: string; test: RegExp }[] = [
  {
    icon: 'price',
    eyebrow: 'Pricing',
    // Deliberately no "included" — inclusion lists are a services angle, not a
    // pricing one. "Everything's Included — No Hidden Extras" still lands here
    // on "hidden".
    test: /\b(pric|cost|charge|rate|₹|rupee|hidden|transparent|paying|payment|bill|quote)/,
  },
  {
    icon: 'breed',
    eyebrow: 'By breed',
    test: /\b(breed|persian|siamese|maine coon|labrador|husky|golden retriever|shih tzu|pomeranian|beagle|indie|pedigree)/,
  },
  {
    icon: 'season',
    eyebrow: 'Pune seasons',
    test: /\b(climate|weather|monsoon|summer|winter|humid|season|rain|dust|heat|hot months)/,
  },
  {
    icon: 'lifestage',
    eyebrow: 'Every life stage',
    test: /\b(senior|puppy|puppies|kitten|elderly|ageing|aging|nervous|anxious|anxiety|sensitive|scared|rescue|first-time|temperament|difficult)/,
  },
  {
    icon: 'calendar',
    eyebrow: 'Grooming frequency',
    test: /\b(how often|frequenc|schedul|regular|routine|monthly|weeks|on-time|reliab|consistent|slot|book(ing)? ahead|timing)/,
  },
  {
    icon: 'services',
    eyebrow: 'Coat & skin care',
    // Before the `home` rule on purpose: "Advanced De-Shedding & Coat Care /
    // Reduce hair fall inside your home" is a coat section that happens to say
    // "home", and it was landing on "At your doorstep".
    test: /\b(shed|coat|mats?\b|matting|fur|hair fall|skin|tick|flea|lion cut|nail|dander|hairball|brush|trim|clip)/,
  },
  {
    icon: 'home',
    eyebrow: 'At your doorstep',
    test: /\b(at[- ]home|home|doorstep|apartment|flat|society|societies|high-rise|balcon|building|travel|traffic|carrier|salon|your space)/,
  },
  {
    icon: 'services',
    eyebrow: 'Services explained',
    test: /\b(includ|session|service|setup|equipment|we bring|what happens|step|process|hygien|complete)/,
  },
  {
    icon: 'cat',
    eyebrow: 'Cat grooming',
    test: /\b(cat|feline|litter)/,
  },
  {
    icon: 'home',
    eyebrow: 'In your neighbourhood',
    // Broad on purpose, and last for that reason: every locality page has a
    // "we cover this area / these are the families here" section that matches
    // none of the topical rules above.
    test: /\b(cover|serving|serve|localit|neighbourhood|neighborhood|area|communit|famil|resident|societ|across)/,
  },
];

/** Fallback when nothing matches — Scissors reads as "the grooming itself",
 *  which is what an unmatched section almost always is. */
const DEFAULT_META: StoryMeta = { eyebrow: 'What we do', icon: 'services' };

export function deriveStoryMeta(section: StoryMetaInput): StoryMeta {
  // A section that labelled itself keeps its label.
  if (section.eyebrow && section.icon) {
    return { eyebrow: section.eyebrow, icon: section.icon };
  }

  const haystack = `${section.heading} ${section.subheading ?? ''}`.toLowerCase();
  const matched = RULES.find((r) => r.test.test(haystack));

  return {
    eyebrow: section.eyebrow ?? matched?.eyebrow ?? DEFAULT_META.eyebrow,
    icon: section.icon ?? matched?.icon ?? DEFAULT_META.icon,
  };
}
