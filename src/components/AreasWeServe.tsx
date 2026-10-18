/**
 * AreasWeServe — the home page's link block to every locality landing page.
 *
 * Why this exists
 * ───────────────
 * The site generates a landing page per Pune locality per species (66 pages),
 * but the home page linked to none of them — only to the two hubs. The footer
 * carried 8 dog + 8 cat shortcuts, which left most locality pages three clicks
 * from the home page and receiving no link equity from the site's strongest URL.
 *
 * Rendering the full list here puts every locality one click from the home page
 * and makes the service-area claim ("we cover Pune") verifiable rather than
 * asserted. The prerendered mirror of this block lives in
 * scripts/prerenderSpa.ts → areasWeServeHtml(), so a crawler that does not run
 * JavaScript sees the same links — keep the two in sync.
 *
 * The pill styling deliberately matches components/location/LocationCities.tsx,
 * which is the same idea on the locality pages.
 */
import { useState } from 'react';

import {
  ALL_PUNE_CITIES,
  ALL_CAT_PUNE_CITIES,
  localityLinkPrefix,
} from '../data/puneLocalities';

/** Localities shown before the "show all" toggle on mobile. */
const MOBILE_PREVIEW = 8;

/**
 * Keyword anchor text with the prefix hidden visually, so each pill reads
 * "Wakad" but the link says "Dog grooming in Wakad". Mirrored in
 * scripts/prerenderSpa.ts → areasWeServeHtml() for the no-JS crawlers.
 */
function PillLabel({ slug, name }: { slug: string; name: string }) {
  const prefix = localityLinkPrefix(slug);
  return (
    <>
      {prefix && <span className="sr-only">{prefix}</span>}
      {name}
    </>
  );
}

interface CityGroupProps {
  heading: string;
  blurb: string;
  cities: { name: string; slug: string }[];
}

function CityGroup({ heading, blurb, cities }: CityGroupProps) {
  const [expanded, setExpanded] = useState(false);

  // Alphabetical so a visitor can actually find their locality, rather than the
  // geographic clustering the source arrays use.
  const sorted = [...cities].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <h3 className="text-base md:text-lg font-bold text-gray-900">{heading}</h3>
      <p className="text-sm text-gray-500 mt-1 mb-4">{blurb}</p>

      {/* Desktop: every locality, always visible — this is the whole point. */}
      <div className="hidden md:flex flex-wrap gap-2">
        {sorted.map((city) => (
          <a
            key={city.slug}
            href={`/${city.slug}`}
            className="px-4 py-1.5 rounded-full text-sm font-semibold text-sniffy-purple border border-sniffy-purple/25 bg-sniffy-purple/5 hover:bg-sniffy-purple hover:text-white transition-colors duration-200"
          >
            <PillLabel slug={city.slug} name={city.name} />
          </a>
        ))}
      </div>

      {/* Mobile: a preview plus a toggle, so the block doesn't push the rest of
          the page down by two screens. The hidden pills are still real anchors
          in the DOM once expanded, and the prerendered HTML lists all of them
          unconditionally. */}
      <div className="md:hidden">
        <div className="flex flex-wrap gap-2">
          {(expanded ? sorted : sorted.slice(0, MOBILE_PREVIEW)).map((city) => (
            <a
              key={city.slug}
              href={`/${city.slug}`}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-sniffy-purple border border-sniffy-purple/25 bg-sniffy-purple/5"
            >
              <PillLabel slug={city.slug} name={city.name} />
            </a>
          ))}
        </div>
        {sorted.length > MOBILE_PREVIEW && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 text-sm font-semibold text-sniffy-purple underline underline-offset-2"
          >
            {expanded
              ? 'Show fewer areas'
              : `Show all ${sorted.length} areas`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AreasWeServe() {
  return (
    <section className="bg-gray-50 py-10 md:py-14 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl md:text-3xl font-bold text-gray-900">
            Pet grooming across Pune — find your area
          </h2>
        </div>
        <p className="text-gray-600 mb-8 max-w-3xl">
          We groom at home across {ALL_PUNE_CITIES.length} Pune and
          Pimpri-Chinchwad localities, seven days a week between 9 AM and 9 PM.
          Same fixed prices everywhere — no doorstep charge and no distance
          surcharge.
        </p>

        <div className="grid gap-9 md:grid-cols-2">
          <CityGroup
            heading="Dog grooming in Pune by locality"
            blurb="At-home dog grooming — bath, haircut, deshedding, tick &amp; flea care."
            cities={ALL_PUNE_CITIES}
          />
          <CityGroup
            heading="Cat grooming in Pune by locality"
            blurb="At-home cat grooming — cat-formulated products, low-restraint handling."
            cities={ALL_CAT_PUNE_CITIES}
          />
        </div>
      </div>
    </section>
  );
}
