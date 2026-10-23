/**
 * Service pages — data shapes.
 *
 * One ServicePageData per /services/<slug> page. Dependency-free (no React, no
 * import.meta.env) so the page generator can prerender it under `tsx`, exactly
 * like src/data/puneHubContent.ts does for the city hubs.
 */
import type { StoryIconKey } from '../storyMeta';

export interface ServiceFaq {
  q: string;
  a: string;
}

/** Same shape as LocationStorySection, so it renders through <StoryBlock />. */
export interface ServiceStory {
  heading: string;
  subheading: string;
  paragraphs: string[];
  bullets?: string[];
  closingLine?: string;
  image: string;
  imageAlt: string;
  imageLeft: boolean;
  link?: { href: string; label: string };
  eyebrow?: string;
  icon?: StoryIconKey;
}

export interface ServiceStep {
  title: string;
  text: string;
}

export interface ServicePriceItem {
  label: string;
  price: string;
  note: string;
  kind: 'package' | 'addon';
  pets: 'dog' | 'cat' | 'both';
}

export interface ServicePageData {
  /** URL slug: /services/<slug> */
  slug: string;
  /** Full name, used in headings, schema and link text. */
  name: string;
  /** Short label for cards and the footer. */
  shortName: string;
  seoTitle: string;
  seoDescription: string;

  eyebrow: string;
  h1Line1: string;
  h1Accent: string;
  heroSubtitle: string;
  heroImageAlt: string;

  /** A direct 40-70 word answer, shown under the hero for featured snippets. */
  quickAnswer: string;
  inShort: string[];

  whoFor: { heading: string; intro: string; items: { title: string; text: string }[] };
  process: { heading: string; intro: string; steps: ServiceStep[] };
  pricing: { heading: string; intro: string; items: ServicePriceItem[]; footnote: string };

  stories: ServiceStory[];
  faqs: ServiceFaq[];

  /** Blog slugs to link as further reading. */
  relatedBlogs: string[];
  /** Other service slugs to cross-link. */
  relatedServices: string[];
  /** Locality slugs (tail only, e.g. "wakad") to feature as "available in". */
  areaSlugs: string[];

  /** schema.org Service fields. */
  serviceType: string;
  audience: 'Dogs' | 'Cats' | 'Dogs and cats';
  /** Species the page is about, for the price block and packages toggle. */
  pets: 'dog' | 'cat' | 'both';
}
