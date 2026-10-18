/**
 * HomeStories — SEO text + image sections for the marketing home page (`/`).
 *
 * Just the home page's content bound to the shared presentation: the layout,
 * the mobile "Read more" accordion, and the icon + eyebrow badge all live in
 * `components/StoryBlock.tsx`, which the locality and hub pages render too.
 * Content lives in `src/data/homeStories.ts` — those sections hand-author their
 * `eyebrow`/`icon`, which StoryBlock uses as-is.
 */
import { HOME_STORY_SECTIONS } from '../data/homeStories';
import StoryBlock from './StoryBlock';

export default function HomeStories({ onBookNow }: { onBookNow: () => void }) {
  return (
    <>
      {HOME_STORY_SECTIONS.map((section, index) => (
        <StoryBlock key={index} section={section} index={index} onBookNow={onBookNow} />
      ))}
    </>
  );
}
