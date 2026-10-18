/**
 * RatingSummary — the visible, on-page rating that backs the JSON-LD.
 *
 * Google's structured-data policy is blunt about this: a rating you mark up
 * must be visible to a user on the page carrying the markup. Before this
 * component, `aggregateRating` sat in the <head> of both city hubs and the
 * number appeared nowhere in the body. This is the fix for that half of the
 * problem — the other half was the number itself, which lives in
 * src/data/reputation.ts and is now the real one.
 *
 * IMPORTANT: this must stay word-for-word in step with ratingSummaryHtml() in
 * scripts/prerenderLocationBody.ts. The static generators cannot import a TSX
 * component (they run under tsx in Node with no DOM), so the 58 locality pages
 * and 2 hubs get the string version. If a crawler that does not execute JS
 * reads the static HTML and sees no rating while the <head> claims one, we are
 * back where we started.
 */
import { Star } from 'lucide-react';
import { RATING_DISPLAY, REVIEW_COUNT, BEST_RATING, RATING_SOURCE } from '../data/reputation';
import { GOOGLE_PROFILE_URL } from '../data/siteLinks';

interface RatingSummaryProps {
  /** Tighter spacing for use directly under a section heading. */
  compact?: boolean;
  className?: string;
}

export default function RatingSummary({ compact = false, className = '' }: RatingSummaryProps) {
  return (
    <div
      className={`inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-full
      border border-sniffy-purple/15 bg-sniffy-purple/5 px-4 ${compact ? 'py-1.5' : 'py-2'} ${className}`}
    >
      {/* Five filled stars — the average is 5.0, so no half-star case to handle. */}
      <span className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: BEST_RATING }, (_, i) => (
          <Star key={i} size={15} className="fill-sniffy-yellow text-sniffy-yellow" />
        ))}
      </span>

      {/*
        The rating is spelled out rather than left as bare stars. Stars alone
        are an image to a crawler and to a screen reader; "Rated 5.0 out of 5"
        is the text that makes the marked-up value genuinely on-page.
      */}
      <span className="text-sm font-semibold text-sniffy-purple">
        Rated {RATING_DISPLAY} out of {BEST_RATING}
      </span>

      <a
        href={GOOGLE_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-gray-600 underline decoration-gray-300 underline-offset-2 hover:text-sniffy-purple"
      >
        from {REVIEW_COUNT} {RATING_SOURCE} reviews
      </a>
    </div>
  );
}
