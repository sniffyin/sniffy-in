/**
 * packages — the customer-facing package and add-on lists shown on the public site.
 *
 * ── Why this file exists ─────────────────────────────────────────────────────
 * These arrays used to be declared inline inside `src/components/Packages.tsx`.
 * That component imports framer-motion and lucide-react, so a Node build script
 * cannot load it — which meant the generated locality/hub HTML shipped with no
 * prices at all, and pages could not rank for "<service> price in <locality>"
 * queries. Same problem, same fix as `puneHubContent.ts`: move the data into a
 * module with zero runtime dependencies that BOTH consumers read.
 *
 * Consumers:
 *   1. `src/components/Packages.tsx`        — the interactive React cards
 *   2. `scripts/prerenderLocationBody.ts`   — static pricing block + Offer schema
 *
 * Because both read from here, the prices a crawler sees in the static HTML and
 * the prices a user sees after React mounts cannot disagree. Keep it that way:
 * do not hardcode a price anywhere else.
 *
 * ── Relationship to `src/pages/admin/types.ts` ───────────────────────────────
 * `PACKAGES` / `ADD_ONS` in admin/types.ts are the OPERATIONAL list — what a
 * coordinator picks when logging a session, priced at what is actually charged.
 * This file is the MARKETING list: the same charged prices, plus the struck-out
 * "original" price and the itemised inclusions used on the website. The charged
 * numbers must match admin/types.ts; `npm run check-prices` asserts that they do.
 */

export type PackageTheme = 'bath' | 'cut' | 'combo';

export interface DisplayPackage {
  title: string;
  /** Price actually charged. Must match a PACKAGES entry in admin/types.ts. */
  price: string;
  /** Struck-out reference price shown beside `price`. */
  originalPrice: string;
  theme: PackageTheme;
  items: string[];
  freeAddOns: string[];
  featured?: boolean;
  hideDiscountBadge?: boolean;
}

export interface DisplayAddOn {
  name: string;
  detail: string;
  price: string;
  emoji: string;
  tint: string;
  image: string;
}

// ─── Packages ────────────────────────────────────────────────────────────────

export const DOG_PACKAGES: DisplayPackage[] = [
  {
    title: 'SPA BATH',
    price: '₹799',
    originalPrice: '₹999',
    theme: 'bath',
    items: [
      'Bath With Premium Shampoo',
      'Nourishing Coat Conditioner',
      'Blow Dry',
    ],
    freeAddOns: [
      'Combing/ Brushing',
      'Nail Clipping',
      'Eye & Ear Cleaning',
      'Paw Massage',
      'Mouth Spray',
      'Spritz of Perfume',
    ],
  },
  {
    title: 'HAIR CUT',
    price: '₹999',
    originalPrice: '₹1199',
    theme: 'cut',
    items: [
      'Full Body Trimming/ Full Body Haircut',
      'Trim Length of Your Choice',
      'Loose Hair Blow-Out',
    ],
    freeAddOns: [
      'Combing/ Brushing',
      'Nail Clipping',
      'Eye & Ear Cleaning',
      'Mouth Spray',
      'Spritz of Perfume',
    ],
  },
  {
    title: 'SPA BATH + HAIR CUT',
    price: '₹1299',
    originalPrice: '₹1499',
    featured: true,
    hideDiscountBadge: true,
    theme: 'combo',
    items: [
      'Bath With Shampoo & Conditioner',
      'Full Body Trimming/ Full Body Haircut',
      'Blow Dry',
    ],
    freeAddOns: [
      'Combing/ Brushing',
      'Nail Clipping',
      'Eye & Ear Cleaning',
      'Sanitary Trim',
      'Under Paw Trim',
      'Paw Massage',
      'Mouth Spray',
      'Spritz of Perfume',
    ],
  },
];

export const CAT_PACKAGES: DisplayPackage[] = [
  {
    title: 'SPA BATH',
    price: '₹799',
    originalPrice: '₹999',
    theme: 'bath',
    items: [
      'Bath With Premium Shampoo',
      'Nourishing Coat Conditioner',
      'Blow Dry',
    ],
    freeAddOns: [
      'Combing/ Brushing',
      'Nail Clipping',
      'Eye & Ear Cleaning',
      'Paw Massage',
      'Mouth Spray',
      'Spritz of Perfume',
    ],
  },
  {
    title: 'HAIR CUT',
    price: '₹999',
    originalPrice: '₹1199',
    theme: 'cut',
    items: [
      'Full Body Trimming/ Full Body Haircut',
      'Trim Length of Your Choice',
      'Loose Hair Blow-Out',
    ],
    freeAddOns: [
      'Combing/ Brushing',
      'Nail Clipping',
      'Eye & Ear Cleaning',
      'Mouth Spray',
      'Spritz of Perfume',
    ],
  },
  {
    title: 'SPA BATH + HAIR CUT',
    price: '₹1299',
    originalPrice: '₹1499',
    featured: true,
    hideDiscountBadge: true,
    theme: 'combo',
    items: [
      'Bath With Shampoo & Conditioner',
      'Full Body Trimming/ Full Body Haircut',
      'Blow Dry',
    ],
    freeAddOns: [
      'Combing/ Brushing',
      'Nail Clipping',
      'Eye & Ear Cleaning',
      'Sanitary Trim',
      'Under Paw Trim',
      'Mouth Spray',
      'Spritz of Perfume',
    ],
  },
];

// ─── Add-ons ─────────────────────────────────────────────────────────────────
// `image` is the real thumbnail; the emoji + tint remain as a fallback if it 404s.

export const DOG_ADD_ONS: DisplayAddOn[] = [
  { name: 'Tick & Flea Care', detail: 'Spot-on as per size',    price: '+ ₹149', emoji: '🐛', tint: '#fff3d6', image: '/images/addons/tick-flea.jpg' },
  { name: 'Deworming',        detail: 'Vet-grade dose',         price: '₹299',   emoji: '💊', tint: '#e0f7f4', image: '/images/addons/deworming.jpg' },
  { name: 'Destress Massage', detail: 'Coconut / neem oil',     price: '₹299',   emoji: '💆', tint: '#e6f7ec', image: '/images/addons/destressing-massage.jpg' },
  { name: 'Hygiene Hair Cut', detail: 'Face & sanitary',        price: '₹299',   emoji: '✂️', tint: '#f3e9ff', image: '/images/addons/hygiene-haircut.jpg' },
  { name: 'Medicated Bath',   detail: 'Fungal / bacterial skin', price: '₹299',  emoji: '🧴', tint: '#e3f0ff', image: '/images/addons/medicated-bath.jpg' },
  { name: 'Special Handling',  detail: 'Extra patience, extra hands', price: '+ ₹199', emoji: '🤝', tint: '#ffe9e3', image: '/images/addons/special-handling.jpg' },
];

export const CAT_ADD_ONS: DisplayAddOn[] = [
  { name: 'Tick & Flea Care', detail: 'Spot-on as per size',    price: '+ ₹149', emoji: '🐛', tint: '#fff3d6', image: '/images/addons/tick-flea.jpg' },
  { name: 'Deworming',        detail: 'Vet-grade dose',         price: '₹299',   emoji: '💊', tint: '#e0f7f4', image: '/images/addons/deworming.jpg' },
  { name: 'Hygiene Hair Cut', detail: 'Face & sanitary',        price: '₹299',   emoji: '✂️', tint: '#f3e9ff', image: '/images/addons/hygiene-haircut.jpg' },
  { name: 'Medicated Bath',   detail: 'Fungal / bacterial skin', price: '₹299',  emoji: '🧴', tint: '#e3f0ff', image: '/images/addons/medicated-bath.jpg' },
];

// ─── Helpers shared by the React cards and the static prerender ──────────────

/** `'₹1,299'` → `1299`. Returns NaN if there is no number in the string. */
export function parsePriceNumber(price: string): number {
  return Number(price.replace(/[^0-9.]/g, ''));
}

/** Lowest and highest charged package price, e.g. `{ min: 799, max: 1299 }`. */
export function priceRangeOf(packages: DisplayPackage[]): { min: number; max: number } {
  const nums = packages.map((p) => parsePriceNumber(p.price)).filter((n) => Number.isFinite(n));
  return { min: Math.min(...nums), max: Math.max(...nums) };
}
