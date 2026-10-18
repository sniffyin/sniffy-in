/**
 * readInlineLocationData — pulls this page's locality data out of the inline
 * JSON block emitted by the page generators.
 *
 * Shared by `location.tsx` and `catLocation.tsx`; the two differ only in which
 * generator wrote the HTML, and the block's shape and id are identical. Kept in
 * its own module (not in one of the entries) so neither entry imports the other
 * — each is a separate Rollup input and cross-importing would merge their graphs.
 *
 * The id is duplicated from `LOCATION_DATA_SCRIPT_ID` in
 * scripts/prerenderLocationBody.ts. It cannot be imported from there: that
 * module is a Node build script which reaches into `../src/...` for types and
 * pulls in the whole prerender toolchain, none of which belongs in a browser
 * bundle. The mismatch fails loudly and immediately, on every locality page, the
 * first time either side is edited — so this is a typo that cannot ship quietly.
 */
import type { LocationConfig } from '../components/location/LocationHero'
import type { LocationReview } from '../components/location/LocationReviews'
import type { FAQ } from '../components/location/LocationFAQs'

/** Keep in sync with LOCATION_DATA_SCRIPT_ID in scripts/prerenderLocationBody.ts. */
const SCRIPT_ID = 'sniffy-location-data'

export interface InlineLocationData {
  location: LocationConfig
  reviews: LocationReview[]
  faqs: FAQ[]
}

export function readInlineLocationData(): InlineLocationData {
  const el = document.getElementById(SCRIPT_ID)

  if (!el?.textContent) {
    throw new Error(
      `Locality data script #${SCRIPT_ID} is missing from this page. The HTML was ` +
        `generated before the entry started reading its data inline — run ` +
        `\`npm run generate-all\` to regenerate the locality pages.`
    )
  }

  return JSON.parse(el.textContent) as InlineLocationData
}
