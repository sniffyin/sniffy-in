/**
 * LocationSiblingLink — links this locality's page to the same locality's page
 * for the other species (dog-grooming-in-pune/baner ↔ cat-grooming-in-pune/baner),
 * with the page's last-updated date, via PageMetaStrip.
 *
 * The static generator emits the same markup (pageMetaStripHtml in
 * scripts/prerenderLocationBody.ts), but that markup is discarded the moment
 * React mounts, so this component is what Google sees once it renders the page.
 * Both read siblingLocality() so the href and anchor text cannot drift.
 */

import { siblingLocality } from '../../data/puneLocalities';
import { pageLastModified } from '../../data/pageDates';
import PageMetaStrip from '../PageMetaStrip';

interface LocationSiblingLinkProps {
  /** Full page slug, e.g. "dog-grooming-in-pune/baner". */
  slug: string;
}

export default function LocationSiblingLink({ slug }: LocationSiblingLinkProps) {
  const sibling = siblingLocality(slug);

  return (
    <PageMetaStrip
      sibling={
        sibling
          ? {
              prompt: sibling.petType === 'cat' ? 'Have a cat too?' : 'Have a dog too?',
              href: sibling.href,
              label: sibling.label,
            }
          : null
      }
      updated={pageLastModified(slug)}
    />
  );
}
