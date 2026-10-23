/**
 * Slim list of the service pages for site-wide navigation (footer, static nav).
 *
 * Kept apart from the full page content in ./index.ts so the footer, which is
 * on every page, does not pull ~100 KB of service copy into every bundle.
 * scripts/generateServicePages.ts asserts this list matches SERVICES exactly.
 */
export const SERVICE_NAV: { slug: string; label: string }[] = [
  { slug: 'deshedding-treatment-in-pune', label: 'De-shedding' },
  { slug: 'dematting-and-coat-rescue-in-pune', label: 'De-matting' },
  { slug: 'puppy-and-kitten-first-groom-in-pune', label: 'Puppy & kitten first groom' },
  { slug: 'senior-pet-grooming-in-pune', label: 'Senior pet grooming' },
  { slug: 'tick-and-flea-treatment-in-pune', label: 'Tick & flea care' },
  { slug: 'anxious-and-nervous-pet-grooming-in-pune', label: 'Anxious & nervous pets' },
  { slug: 'medicated-bath-in-pune', label: 'Medicated bath' },
];
