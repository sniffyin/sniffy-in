/**
 * seoRoutes — single source of truth for each SPA route's <title> and meta
 * description.
 *
 * Read by TWO consumers that must never disagree:
 *   1. `useSeo()` at runtime, from each page component
 *   2. `scripts/prerenderSpa.ts` at build time, which bakes the same values
 *      into the static HTML file it emits for that route
 *
 * If these two drifted, a crawler would read one title from the HTML and a
 * different one after rendering JS — which looks like cloaking. Keeping the
 * strings here makes that impossible.
 *
 * Blog POSTS are not listed here; their metadata comes from the post itself
 * (see src/data/blogPosts.ts) and is derived identically in both places.
 */

export interface RouteSeo {
  /** Route path beginning with a slash. Used for the canonical URL. */
  path: string;
  title: string;
  description: string;
}

// Species-first, brand last. The old title opened with "Sniffy.in |", spending
// the highest-weight position in the tag on a brand nobody searches for yet, and
// ran to 65 characters so "Dog & Cat Grooming" was the part that got truncated
// away in results. 55 characters renders in full.
export const HOME_SEO: RouteSeo = {
  path: '/',
  title: 'Dog & Cat Grooming at Home in Pune | From ₹799 | Sniffy',
  description:
    'Book dog grooming or cat grooming at home in Pune from ₹799. A trained groomer comes to your door across 33 localities — no salon, no travel, one visit.',
};

export const SEO_ROUTES = {
  about: {
    path: '/about',
    title: 'About Sniffy | At-Home Pet Grooming in Pune',
    description:
      'Who we are and why we built an at-home pet grooming service in Pune — trained groomers, fixed prices, and one visit to your door.',
  },
  howItWorks: {
    path: '/how-it-works',
    title: 'How At-Home Pet Grooming Works | Sniffy Pune',
    description:
      'Book a slot, a trained groomer arrives at your door with all equipment, and your dog or cat is groomed at home in 60-90 minutes. Here is the full process.',
  },
  gallery: {
    path: '/gallery',
    title: 'Photo Gallery | Sniffy At-Home Pet Grooming Pune',
    description:
      'See real dogs and cats groomed at home by Sniffy across Pune — a photo gallery of our grooming sessions.',
  },
  whySniffy: {
    path: '/why-sniffy',
    title: 'Why Choose Sniffy | Home Pet Grooming in Pune',
    description:
      'Fixed published prices, trained groomers, cat-safe products and no salon travel. What makes Sniffy different from other pet grooming services in Pune.',
  },
  contact: {
    path: '/contact',
    title: 'Contact Sniffy | Book Pet Grooming in Pune',
    description:
      'Get in touch to book at-home dog or cat grooming anywhere in Pune. Open 9 AM to 9 PM, seven days a week.',
  },
  faqs: {
    path: '/faqs',
    title: 'Pet Grooming FAQs | Sniffy Pune',
    description:
      'Answers about at-home dog and cat grooming in Pune — pricing, session length, what the groomer brings, grooming frequency and handling anxious pets.',
  },
  blogs: {
    path: '/blogs',
    title: 'Pet Grooming Blog | Dog & Cat Care Advice for Pune | Sniffy',
    description:
      'Grooming guides and breed-specific advice for Pune pet parents — how often to groom, monsoon tick care, what to expect from a first session, and more.',
  },
  groomerOnboarding: {
    path: '/groomer-onboarding',
    title: 'Work With Sniffy | Pet Groomer Jobs in Pune',
    description:
      'Join Sniffy as an at-home pet groomer in Pune. Steady bookings, on-time and review incentives, and equipment support. Apply online.',
  },
} satisfies Record<string, RouteSeo>;

/**
 * Short lead paragraph rendered into the prerendered body of each info route.
 * These pages keep their real copy inside their React components, so without
 * this a non-JS crawler would see only an <h1>. Deliberately a summary, not a
 * duplicate of the on-page copy.
 */
export const ROUTE_INTROS: Record<keyof typeof SEO_ROUTES, { h1: string; intro: string }> = {
  about: {
    h1: 'About Sniffy',
    intro:
      'Sniffy is an at-home dog and cat grooming service operating across Pune and Pimpri-Chinchwad. A trained groomer travels to your home with all equipment and completes the session in one visit — no salon, no travel, no cage time.',
  },
  howItWorks: {
    h1: 'How At-Home Pet Grooming Works',
    intro:
      'Pick a package and a slot, and a trained groomer arrives at your door with clippers, dryer, shampoos, towels and mats. Most sessions run 60 to 90 minutes for a single pet. All you need is a tap, a plug point and floor space.',
  },
  gallery: {
    h1: 'Photo Gallery',
    intro:
      'A look at real dogs and cats groomed at home by Sniffy across Pune — browse photos from our grooming sessions.',
  },
  whySniffy: {
    h1: 'Why Choose Sniffy',
    intro:
      'Published fixed prices with no upselling, groomers trained for both dogs and cats, cat-safe product chemistry, and one consistent standard across every area of Pune we cover.',
  },
  contact: {
    h1: 'Contact Sniffy',
    intro:
      'Book at-home dog or cat grooming anywhere in Pune, seven days a week between 9 AM and 9 PM. Reach us by phone, WhatsApp, or the booking form.',
  },
  faqs: {
    h1: 'Pet Grooming FAQs',
    intro:
      'Common questions about at-home grooming in Pune — what a session includes, how long it takes, what it costs, how often to book, and how we handle anxious or senior pets.',
  },
  blogs: {
    h1: 'The Sniffy Blog',
    intro:
      'Grooming guides, breed-specific advice, and the questions Pune pet parents ask us most — answered honestly.',
  },
  groomerOnboarding: {
    h1: 'Work With Sniffy',
    intro:
      'We hire experienced pet groomers across Pune. Steady bookings routed to you, on-time and review incentives on top of per-session pay, and equipment support.',
  },
};
