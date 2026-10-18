/**
 * RelatedArticles — links every marketing page to the blog.
 *
 * ── Why this exists ──────────────────────────────────────────────────────────
 * Before this, the 58 locality pages and 2 city hubs linked to blog posts
 * exactly ZERO times. The blog holds the site's only genuinely informational
 * content — "how often should you groom your dog", "why you should never shave
 * a husky" — which is precisely the material that earns links and answers
 * long-tail queries, and nothing pointed at it.
 *
 * Rendering this on all 60 locality/hub pages plus the home page turns 5
 * orphaned posts into pages with 60+ internal links each, and gives the
 * commercial pages a supporting-content cluster (the hub-and-spoke shape
 * Google rewards) instead of a flat wall of near-identical landing pages.
 *
 * IMPORTANT: this must also be prerendered into the generated static HTML —
 * see scripts/prerenderLocationBody.ts (locality + hub) and
 * scripts/prerenderSpa.ts (home). Links that only exist after React mounts are
 * invisible to crawlers that do not execute JS, which defeats the purpose.
 */
import { blogPosts, type BlogAudience } from '../data/blogPosts';

/**
 * Mirrors headingForAudience() in scripts/prerenderLocationBody.ts — the static
 * frame and the React render have to say the same thing.
 */
function headingForAudience(audience: BlogAudience): string {
  if (audience === 'cat') return 'Cat grooming guides worth reading';
  if (audience === 'dog') return 'Dog grooming guides worth reading';
  return 'Grooming guides worth reading';
}

interface RelatedArticlesProps {
  /** Omit a post by slug — used on the blog posts themselves. */
  excludeSlug?: string;
  /**
   * Restrict to posts about one species. Cat pages must pass `'cat'`, or they
   * recommend the Husky article — see the note on BlogAudience in blogPosts.ts.
   */
  audience?: BlogAudience;
  /** Overrides the default heading, e.g. to name the locality. */
  heading?: string;
  /** Cap the number shown. Defaults to all matching posts. */
  limit?: number;
}

export default function RelatedArticles({
  excludeSlug,
  audience = 'all',
  heading = headingForAudience(audience),
  limit,
}: RelatedArticlesProps) {
  const posts = blogPosts
    .filter((p) => p.slug !== excludeSlug)
    .filter((p) => audience === 'all' || p.audience === 'all' || p.audience === audience)
    .slice(0, limit ?? blogPosts.length);

  if (posts.length === 0) return null;

  return (
    <section className="px-4 py-10 md:py-14 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">{heading}</h2>
        <p className="text-gray-500 text-sm md:text-base mb-6">
          Honest, practical advice from the groomers who visit Pune homes every day.
        </p>

        {/*
          Titles only — deliberately NO excerpts.

          With excerpts this block was 228 words, ~21% of a locality page, and
          identical on all 73 pages. That is not a duplicate-content penalty
          (Google discounts boilerplate), but it did inflate page-to-page
          similarity from ~0.4% to ~12.6% and diluted the unique locality copy
          that these pages rank on. Titles carry the anchor text and the link
          equity; the excerpts added repeated prose and nothing else.
        */}
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <a
                href={`/blogs/${post.slug}`}
                className="text-sniffy-purple font-semibold hover:underline leading-snug"
              >
                {post.title}
              </a>
              <span className="block text-xs text-gray-400 mt-0.5">
                {post.category} · {post.readTime}
              </span>
            </li>
          ))}
        </ul>

        <a
          href="/blogs"
          className="mt-6 inline-block text-sniffy-purple font-semibold text-sm hover:underline"
        >
          Browse all grooming guides →
        </a>
      </div>
    </section>
  );
}
