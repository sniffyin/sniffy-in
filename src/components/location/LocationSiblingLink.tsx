/**
 * LocationSiblingLink — links this locality's page to the same locality's page
 * for the other species (dog-grooming-in-pune/baner ↔ cat-grooming-in-pune/baner).
 *
 * The static generator emits the same line (siblingLocalityLinkHtml in
 * scripts/prerenderLocationBody.ts), but that markup is discarded the moment
 * React mounts, so this component is what Google sees once it renders the page.
 * Both read siblingLocality() so the href and anchor text cannot drift. Keep the
 * wording of the two in step.
 */

import { siblingLocality } from '../../data/puneLocalities';

interface LocationSiblingLinkProps {
  /** Full page slug, e.g. "dog-grooming-in-pune/baner". */
  slug: string;
}

export default function LocationSiblingLink({ slug }: LocationSiblingLinkProps) {
  const sibling = siblingLocality(slug);
  if (!sibling) return null;

  return (
    <section className="px-4 pt-5 bg-white">
      <div className="max-w-7xl mx-auto">
        <p className="text-[15px] text-gray-600">
          {sibling.petType === 'cat' ? 'Have a cat too?' : 'Have a dog too?'} We groom both — see{' '}
          <a
            href={sibling.href}
            className="text-sniffy-purple font-semibold underline underline-offset-2"
          >
            {sibling.label}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
