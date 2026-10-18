/**
 * BlogsPage.tsx — Blog listing + individual blog post pages.
 *
 * Content stored as structured blocks for proper rendering.
 *
 * Routes:
 *   /blogs          → BlogsPage (listing)
 *   /blogs/:slug    → BlogPostPage (individual post)
 */

import { motion } from 'framer-motion';
import { Clock, ArrowRight, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { blogPosts, parseInline, type Block, type BlogPost } from '../data/blogPosts';
import { useSeo, clampDescription } from '../lib/useSeo';
import { SEO_ROUTES } from '../data/seoRoutes';

// ─── Block renderer ───────────────────────────────────────────────────────────

/** Renders `[label](/href)` spans inside block text as real internal links. */
function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((seg, i) =>
        seg.href ? (
          <a key={i} href={seg.href} className="text-sniffy-purple font-semibold hover:underline">
            {seg.text}
          </a>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-3 leading-snug">
          {block.text}
        </h2>
      );
    case 'h3':
      return (
        <h3 className="text-base md:text-lg font-bold text-sniffy-purple mt-6 mb-2">
          {block.text}
        </h3>
      );
    case 'p':
      return (
        <p className="text-gray-600 text-base leading-relaxed mb-4">
          <InlineText text={block.text} />
        </p>
      );
    case 'ul':
      return (
        <ul className="mb-5 space-y-2 mt-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-600 text-base leading-relaxed">
              <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-sniffy-yellow" />
              <span><InlineText text={item} /></span>
            </li>
          ))}
        </ul>
      );
    case 'callout':
      return (
        <div className="my-6 bg-purple-50 border-l-4 border-sniffy-purple rounded-r-2xl px-5 py-4">
          <p className="text-sniffy-purple text-sm md:text-base leading-relaxed font-medium">
            <InlineText text={block.text} />
          </p>
        </div>
      );
    case 'divider':
      return <div className="my-8 h-px bg-gray-100 rounded-full" />;
    default:
      return null;
  }
}

// ─── Blog card ────────────────────────────────────────────────────────────────

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <motion.a
      href={`/blogs/${post.slug}`}
      className="group block bg-white rounded-[28px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
      whileHover={{ y: -4 }}
    >
      <div className="aspect-[16/9] overflow-hidden bg-gray-100">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold text-sniffy-purple bg-purple-50 px-3 py-1 rounded-full">
            {post.category}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} />{post.readTime}
          </span>
        </div>
        <h2 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-sniffy-purple transition-colors">
          {post.title}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{post.date}</span>
          <span className="flex items-center gap-1 text-sniffy-purple text-sm font-semibold group-hover:gap-2 transition-all">
            Read <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </motion.a>
  );
}

// ─── Blogs listing page ───────────────────────────────────────────────────────

export function BlogsPage() {
  useSeo(SEO_ROUTES.blogs);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Navbar activePath="/blogs" />
      </header>

      <main>
        <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 py-14 md:py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-3">From the Sniffy team</p>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              The <span className="text-sniffy-purple">Sniffy</span>{' '}
              <span className="text-sniffy-yellow">Blog</span>
            </h1>
            <p className="text-gray-500 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              Grooming guides, breed-specific advice, and the questions we get asked most — answered honestly.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
          <div className="mt-16 text-center border-2 border-dashed border-sniffy-yellow/30 rounded-[28px] p-10">
            <p className="text-gray-400 text-sm font-medium">More articles on the way</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ─── Blog post page ───────────────────────────────────────────────────────────

interface BlogPostPageProps {
  slug: string;
}

export function BlogPostPage({ slug }: BlogPostPageProps) {
  const post = blogPosts.find((p) => p.slug === slug);

  // Called before the `!post` early return below — React requires hooks to run
  // in the same order on every render, so this cannot move inside the guard.
  useSeo({
    // Just "| Sniffy" — post titles already carry the locality where it is
    // relevant, so "… in Pune? | Sniffy Pune" would read redundantly.
    title: post ? `${post.title} | Sniffy` : 'Article Not Found | Sniffy',
    description: post
      ? clampDescription(post.excerpt)
      : 'This article is no longer available. Browse our other pet grooming guides for Pune pet parents.',
    path: `/blogs/${slug}`,
    image: post?.coverImage,
    type: 'article',
  });

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <Navbar activePath="/blogs" />
        </header>
        <div className="max-w-2xl mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Article not found</h1>
          <a href="/blogs" className="text-sniffy-purple font-semibold hover:underline">← Back to all articles</a>
        </div>
        <Footer />
      </div>
    );
  }

  // Prefer same-species posts. A cat article linking two dog articles is the
  // same topical-dilution problem the locality pages had — see BlogAudience in
  // src/data/blogPosts.ts. Falls back to any post if there aren't two matches.
  const otherPosts = (() => {
    const rest = blogPosts.filter((p) => p.slug !== slug);
    const sameTopic = rest.filter(
      (p) => post.audience === 'all' || p.audience === 'all' || p.audience === post.audience
    );
    return (sameTopic.length >= 2 ? sameTopic : rest).slice(0, 2);
  })();

  return (
    <div className="min-h-screen bg-white">
      {/*
        BlogPosting schema is baked into each post's static HTML by
        scripts/prerenderSpa.ts (which also does the "February 2026" → ISO date
        conversion), so crawlers get it without running JS. Emitting it here as
        well put two BlogPosting nodes on every article page.
      */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Navbar activePath="/blogs" />
      </header>

      <main>
        <section className="bg-gradient-to-b from-purple-50 to-white px-4 pt-10 pb-0">
          <div className="max-w-3xl mx-auto">
            <a href="/blogs" className="inline-flex items-center gap-1 text-sm text-sniffy-purple font-semibold mb-6 hover:opacity-70 transition-opacity">
              <ChevronLeft size={16} /> All articles
            </a>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-bold text-sniffy-purple bg-purple-50 px-3 py-1 rounded-full">{post.category}</span>
              <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} />{post.readTime}</span>
              <span className="text-xs text-gray-400">{post.date}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8 border-l-4 border-sniffy-yellow pl-4">
              {post.excerpt}
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 mb-10">
          <div className="aspect-[16/8] rounded-[28px] overflow-hidden bg-gray-100 shadow-md">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>

        <article className="max-w-2xl mx-auto px-4 pb-16">
          {post.blocks.map((block, i) => (
            <RenderBlock key={i} block={block} />
          ))}
        </article>

        <section className="bg-sniffy-purple px-4 py-14 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to book your dog's session?</h2>
            <p className="text-white/70 text-sm mb-6">Starting ₹799 · All areas across Pune · 9 AM – 9 PM daily</p>
            <a href="/#booking" className="inline-block bg-sniffy-yellow text-gray-900 font-bold px-10 py-4 rounded-full text-base hover:opacity-90 transition-all">
              Book Now
            </a>
          </div>
        </section>

        {otherPosts.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 py-16">
            <h2 className="text-xl font-bold text-gray-900 mb-8">More from the blog</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {otherPosts.map((p) => <BlogCard key={p.slug} post={p} />)}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default BlogsPage;
