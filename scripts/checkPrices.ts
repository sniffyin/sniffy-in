/**
 * checkPrices — asserts the marketing prices and the operational prices agree.
 *
 * There are two price lists in this repo and they exist for different reasons:
 *
 *   • `src/pages/admin/types.ts`  PACKAGES / ADD_ONS — what a coordinator picks
 *     when logging a real session. This is what actually gets charged and what
 *     payroll, commission and revenue reporting are computed from.
 *
 *   • `src/data/packages.ts`      DOG_/CAT_PACKAGES, DOG_/CAT_ADD_ONS — what the
 *     public site shows, including struck-out "original" prices and itemised
 *     inclusions. Read by both the React cards and the SEO prerender.
 *
 * They cannot be merged: the admin list must stay free of marketing copy, and
 * the public list must stay importable from Node. But if they drift, the site
 * advertises one number and the business charges another — and, worse, the
 * Offer/OfferCatalog structured data now published on 60 pages starts quoting a
 * price that is not honoured, which is a Google structured-data violation as
 * well as a customer-facing one.
 *
 * Run via `npm run check-prices`; also runs as part of `npm run deploy`.
 */
import { PACKAGES, ADD_ONS } from '../src/pages/admin/types.ts';
import {
  DOG_PACKAGES,
  CAT_PACKAGES,
  DOG_ADD_ONS,
  CAT_ADD_ONS,
  parsePriceNumber,
  type DisplayPackage,
  type DisplayAddOn,
} from '../src/data/packages.ts';

const errors: string[] = [];

/** Site package titles are upper-cased; admin labels are title-cased. */
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

// ─── Packages ────────────────────────────────────────────────────────────────

const adminPackagePrice = new Map(PACKAGES.map((p) => [norm(p.label), p.price]));

function checkPackages(list: DisplayPackage[], which: string) {
  for (const pkg of list) {
    const shown = parsePriceNumber(pkg.price);
    const charged = adminPackagePrice.get(norm(pkg.title));

    if (charged === undefined) {
      errors.push(
        `${which}: package "${pkg.title}" has no matching PACKAGES entry in admin/types.ts ` +
          `(expected one of: ${PACKAGES.map((p) => p.label).join(', ')})`
      );
      continue;
    }

    if (shown !== charged) {
      errors.push(
        `${which}: package "${pkg.title}" shows ₹${shown} on the site but admin/types.ts charges ₹${charged}`
      );
    }

    const original = parsePriceNumber(pkg.originalPrice);
    if (!(original >= shown)) {
      errors.push(
        `${which}: package "${pkg.title}" has originalPrice ₹${original} below its price ₹${shown} — ` +
          `a struck-out price must not be lower than what is charged`
      );
    }
  }
}

checkPackages(DOG_PACKAGES, 'DOG_PACKAGES');
checkPackages(CAT_PACKAGES, 'CAT_PACKAGES');

// ─── Add-ons ─────────────────────────────────────────────────────────────────

const adminAddOnPrice = new Map(ADD_ONS.map((a) => [norm(a.label), a.price]));

// The site shortens two admin labels; map them rather than loosening the match.
const ADDON_ALIAS: Record<string, string> = {
  'destress massage': 'destressing massage',
};

function checkAddOns(list: DisplayAddOn[], which: string) {
  for (const addOn of list) {
    const key = ADDON_ALIAS[norm(addOn.name)] ?? norm(addOn.name);
    const shown = parsePriceNumber(addOn.price);
    const charged = adminAddOnPrice.get(key);

    if (charged === undefined) {
      errors.push(
        `${which}: add-on "${addOn.name}" has no matching ADD_ONS entry in admin/types.ts ` +
          `(expected one of: ${ADD_ONS.map((a) => a.label).join(', ')}). ` +
          `If the site name differs deliberately, add it to ADDON_ALIAS.`
      );
      continue;
    }

    if (shown !== charged) {
      errors.push(
        `${which}: add-on "${addOn.name}" shows ₹${shown} on the site but admin/types.ts charges ₹${charged}`
      );
    }
  }
}

checkAddOns(DOG_ADD_ONS, 'DOG_ADD_ONS');
checkAddOns(CAT_ADD_ONS, 'CAT_ADD_ONS');

// ─── Report ──────────────────────────────────────────────────────────────────

if (errors.length > 0) {
  console.error('❌ Price mismatch between src/data/packages.ts and src/pages/admin/types.ts:\n');
  for (const e of errors) console.error(`   • ${e}`);
  console.error(
    '\nThese prices are published on 60 generated pages and in Offer structured data.\n' +
      'Fix the mismatch before building.\n'
  );
  process.exit(1);
}

console.log(
  `✅ Prices consistent: ${DOG_PACKAGES.length} dog + ${CAT_PACKAGES.length} cat packages, ` +
    `${DOG_ADD_ONS.length} dog + ${CAT_ADD_ONS.length} cat add-ons match admin/types.ts`
);
