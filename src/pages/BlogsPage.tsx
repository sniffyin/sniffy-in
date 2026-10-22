/**
 * BlogsPage.tsx — Blog listing + individual blog post pages.
 *
 * Content stored as structured blocks for proper rendering.
 *
 * Routes:
 *   /blogs          → BlogsPage (listing)
 *   /blogs/:slug    → BlogPostPage (individual post)
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, ChevronLeft, Search } from 'lucide-react';
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
  // Mobile: compact thumbnail-left row so ~6 articles fit per screen instead of
  // ~1.5. md+: the full image-on-top card.
  return (
    <motion.a
      href={`/blogs/${post.slug}`}
      className="group flex md:block gap-3.5 md:gap-0 bg-white rounded-2xl md:rounded-[28px] overflow-hidden p-3 md:p-0 shadow-sm md:shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 active:bg-purple-50/40 md:active:bg-white"
      whileHover={{ y: -4 }}
    >
      <div className="w-24 h-24 md:w-full md:h-auto md:aspect-[16/9] flex-shrink-0 overflow-hidden rounded-xl md:rounded-none bg-gray-100">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0 md:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-3">
            <span className="text-[11px] md:text-xs font-bold text-sniffy-purple bg-purple-50 px-2.5 md:px-3 py-0.5 md:py-1 rounded-full truncate">
              {post.category}
            </span>
            <span className="text-[11px] md:text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
              <Clock size={12} />{post.readTime.replace(' read', '')}
            </span>
          </div>
          <h2 className="font-bold text-gray-900 text-[15px] md:text-lg leading-snug md:mb-2 line-clamp-3 md:line-clamp-none group-hover:text-sniffy-purple transition-colors">
            {post.title}
          </h2>
          <p className="hidden md:block text-gray-500 text-sm leading-relaxed mb-4 mt-2 line-clamp-3">
            {post.excerpt}
          </p>
        </div>
        <div className="hidden md:flex items-center justify-between">
          <span className="text-xs text-gray-400">{post.date}</span>
          <span className="flex items-center gap-1 text-sniffy-purple text-sm font-semibold group-hover:gap-2 transition-all">
            Read <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </motion.a>
  );
}

// ─── Filters ──────────────────────────────────────────────────────────────────

/**
 * Raw `category` values grew organically ("Pet Health" and "Health & Hygiene"
 * mean the same thing), so the chips group them into a few topics a new pet
 * parent would recognise. Unknown categories fall back to "More" so a new post
 * is never hidden from the filter.
 */
const TOPICS: { label: string; categories: string[] }[] = [
  { label: 'New Pet Parents', categories: ['New Pet Parents'] },
  { label: 'Health & Hygiene', categories: ['Pet Health', 'Health & Hygiene'] },
  { label: 'Grooming', categories: ['Grooming Basics', 'Grooming Guides'] },
  { label: 'Breed Guides', categories: ['Breed Care', 'Breed Guides'] },
  { label: 'Cat Care', categories: ['Cat Care'] },
  { label: 'Tips & Lifestyle', categories: ['Tips & Guides', 'Pet Care Tips', 'Home & Lifestyle'] },
];

const SPECIES = [
  { value: 'all', label: 'All pets' },
  { value: 'dog', label: 'Dogs' },
  { value: 'cat', label: 'Cats' },
] as const;
type Species = (typeof SPECIES)[number]['value'];

const PAGE_SIZE = 12;

function topicOf(post: BlogPost): string {
  return TOPICS.find((t) => t.categories.includes(post.category))?.label ?? 'More';
}

function Chip({
  active, onClick, children, count,
}: { active: boolean; onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void; children: React.ReactNode; count?: number }) {
  return (
    <button
      type="button"
      onClick={(e) => onClick(e)}
      aria-pressed={active}
      className={`px-3 md:px-4 h-7 md:h-10 flex-shrink-0 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-colors border ${
        active
          ? 'bg-sniffy-purple text-white border-sniffy-purple'
          : 'bg-white text-gray-600 border-gray-200 hover:border-sniffy-purple hover:text-sniffy-purple'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`ml-1 text-[11px] md:text-xs ${active ? 'text-white/70' : 'text-gray-400'}`}>{count}</span>
      )}
    </button>
  );
}

// ─── Blogs listing page ───────────────────────────────────────────────────────

export function BlogsPage() {
  useSeo(SEO_ROUTES.blogs);

  // Filters live in the URL (?pet=cat&topic=Cat%20Care&q=tick) so tapping an
  // article and pressing Back returns to the same filtered list — cards are
  // plain links, so component state alone would be lost on every article visit.
  const initial = useMemo(() => {
    const sp = new URLSearchParams(window.location.search);
    const pet = sp.get('pet');
    return {
      species: (SPECIES.some((s) => s.value === pet) ? pet : 'all') as Species,
      topic: sp.get('topic') ?? 'All',
      query: sp.get('q') ?? '',
    };
  }, []);
  const [species, setSpecies] = useState<Species>(initial.species);
  const [topic, setTopic] = useState<string>(initial.topic);
  const [query, setQuery] = useState(initial.query);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const headerRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [headerH, setHeaderH] = useState(64);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderH(el.offsetHeight));
    ro.observe(el);
    setHeaderH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams();
    if (species !== 'all') sp.set('pet', species);
    if (topic !== 'All') sp.set('topic', topic);
    if (query.trim()) sp.set('q', query.trim());
    const qs = sp.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [species, topic, query]);

  // After picking a chip while scrolled deep into the list, jump back to the
  // top of the results so the change is visible instead of happening off-screen.
  const revealResults = () => {
    const el = listRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - headerH - 64;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
  };

  // Counts reflect the species + search selection so a chip never promises
  // articles that the other filters will immediately hide.
  const matchesSpecies = (p: BlogPost) =>
    species === 'all' || p.audience === 'all' || p.audience === species;
  const q = query.trim().toLowerCase();
  const matchesQuery = (p: BlogPost) =>
    !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of blogPosts) {
      if (matchesSpecies(p) && matchesQuery(p)) counts[topicOf(p)] = (counts[topicOf(p)] ?? 0) + 1;
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [species, q]);

  const filtered = useMemo(
    () =>
      blogPosts.filter(
        (p) => matchesSpecies(p) && matchesQuery(p) && (topic === 'All' || topicOf(p) === topic)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [species, topic, q]
  );
  const shown = filtered.slice(0, visible);
  const total = Object.values(topicCounts).reduce((a, b) => a + b, 0);
  const topicChips = TOPICS.map((t) => t.label).filter((l) => topicCounts[l]);
  if (topicCounts['More']) topicChips.push('More');
  const filtersActive = species !== 'all' || topic !== 'All' || q !== '';

  const reset = () => { setSpecies('all'); setTopic('All'); setQuery(''); setVisible(PAGE_SIZE); };

  return (
    <div className="min-h-screen bg-white">
      <header ref={headerRef} className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Navbar activePath="/blogs" />
      </header>

      <main>
        <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 py-8 md:py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-3">From the Sniffy team</p>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-2 md:mb-4">
              The <span className="text-sniffy-purple">Sniffy</span>{' '}
              <span className="text-sniffy-yellow">Blog</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-lg max-w-lg mx-auto leading-relaxed">
              Grooming guides, breed-specific advice, and the questions we get asked most — answered honestly.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="pt-1 pb-2 space-y-2">
            <div className="relative md:max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }}
                placeholder="Search: ticks, puppy, shedding…"
                aria-label="Search articles"
                enterKeyHint="search"
                className="w-full h-9 md:h-11 pl-10 pr-4 rounded-full border border-gray-200 text-base md:text-sm focus:outline-none focus:border-sniffy-purple"
              />
            </div>

            {/* Segmented control: three equal full-width thumb targets on phones */}
            <div className="grid grid-cols-3 gap-0.5 md:gap-1 p-0.5 md:p-1 rounded-full bg-gray-100 md:inline-grid md:w-auto" role="group" aria-label="Filter by pet">
              {SPECIES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  aria-pressed={species === s.value}
                  onClick={() => { setSpecies(s.value); setVisible(PAGE_SIZE); }}
                  className={`h-7 md:h-10 md:px-6 rounded-full text-xs md:text-sm font-semibold transition-colors ${
                    species === s.value ? 'bg-white text-sniffy-purple shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sticky topic bar: stays reachable while scrolling a long list */}
          <div
            className="sticky z-20 -mx-4 px-4 py-1.5 bg-white/95 backdrop-blur border-b border-gray-100 md:static md:mx-0 md:px-0 md:border-0 md:bg-transparent"
            style={{ top: headerH }}
          >
            <div className="relative">
              <div
                className="flex gap-2 overflow-x-auto md:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-8 md:pr-0"
                role="group"
                aria-label="Filter by topic"
              >
                <Chip active={topic === 'All'} onClick={() => { setTopic('All'); setVisible(PAGE_SIZE); revealResults(); }} count={total}>
                  All topics
                </Chip>
                {topicChips.map((label) => (
                  <Chip
                    key={label}
                    active={topic === label}
                    onClick={(e) => {
                      setTopic(label); setVisible(PAGE_SIZE); revealResults();
                      e?.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
                    }}
                    count={topicCounts[label]}
                  >
                    {label}
                  </Chip>
                ))}
              </div>
              {/* fade = "there's more to scroll" cue */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent md:hidden" />
            </div>
          </div>

          <div ref={listRef} className="pt-3 pb-4">
            <p className="text-sm text-gray-400" aria-live="polite">
              Showing {shown.length} of {filtered.length} article{filtered.length === 1 ? '' : 's'}
              {filtersActive && (
                <button type="button" onClick={reset} className="ml-3 py-2 text-sniffy-purple font-semibold hover:underline">
                  Clear filters
                </button>
              )}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-3">No articles match that yet.</p>
              <button type="button" onClick={reset} className="text-sniffy-purple font-semibold hover:underline">
                Show all articles
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
              {shown.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}

          {filtered.length > shown.length && (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="w-full md:w-auto h-12 px-8 rounded-full bg-sniffy-purple text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Show more ({filtered.length - shown.length} left)
              </button>
            </div>
          )}
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
