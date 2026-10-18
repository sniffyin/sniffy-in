/**
 * LocationStories — SEO text + image sections for the 58 generated locality
 * pages. Each page passes its own `storySections` array in LocationConfig.
 *
 * The presentation is the shared `components/StoryBlock.tsx` — the same one the
 * home page uses, so locality pages get the icon + eyebrow badge, the mobile
 * card treatment and the chevron "Read more / Show less" accordion instead of
 * the plain bordered "+" rows they used to render. Locality data files carry no
 * `eyebrow`/`icon`, so StoryBlock derives them from the heading via
 * `src/data/storyMeta.ts`.
 */
import type { LocationConfig } from './LocationHero';
import StoryBlock from '../StoryBlock';

interface LocationStoriesProps {
  location: LocationConfig;
  onBookNow: () => void;
}

export default function LocationStories({ location, onBookNow }: LocationStoriesProps) {
  return (
    <>
      {location.storySections.map((section, index) => (
        <StoryBlock key={index} section={section} index={index} onBookNow={onBookNow} />
      ))}
    </>
  );
}
