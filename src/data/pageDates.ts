/**
 * "Last updated" dates for the generated SEO pages, keyed by page path
 * (e.g. "dog-grooming-in-pune/baner", "cat-grooming-in-pune").
 *
 * PAGE_DATES lives in pageDates.generated.ts, written by scripts/pageDates.ts
 * whenever a generator produces HTML that differs from the last run. The
 * generators and the React pages both read it, so the prerendered HTML and the
 * mounted page show the same date.
 */
import { PAGE_DATES } from './pageDates.generated';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatPageDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** ISO date for a page, or undefined if it has never been generated. */
export function pageLastModified(key: string): string | undefined {
  return (PAGE_DATES as Record<string, string>)[key];
}
