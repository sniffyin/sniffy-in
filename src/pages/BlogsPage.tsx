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

// ─── Content block types ──────────────────────────────────────────────────────

type Block =
  | { type: 'p';       text: string }
  | { type: 'h2';      text: string }
  | { type: 'h3';      text: string }
  | { type: 'ul';      items: string[] }
  | { type: 'callout'; text: string }
  | { type: 'divider' };

// ─── Blog data ────────────────────────────────────────────────────────────────

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  readTime: string;
  date: string;
  blocks: Block[];
};

export const blogPosts: BlogPost[] = [

  // ── Post 1 ──────────────────────────────────────────────────────────────────
  {
    slug: 'how-often-should-you-groom-your-dog-in-pune',
    title: 'How Often Should You Groom Your Dog in Pune?',
    excerpt: "There's no single right answer — it depends on the breed, the coat, and honestly, the time of year. But Pune's weather does make things more demanding than most people expect.",
    coverImage: '/images/grooming-session-1.jpg',
    category: 'Grooming Basics',
    readTime: '5 min read',
    date: 'February 2026',
    blocks: [
      {
        type: 'p',
        text: "We get this question a lot. And the honest answer is — it depends. But what we've noticed after doing hundreds of sessions across Pune is that most dog owners are waiting too long between grooming sessions, usually without realising it.",
      },
      {
        type: 'p',
        text: "A lot of the generic grooming advice online is written for cooler, drier climates. Pune is neither of those things for a good chunk of the year. The city gets warm and dusty from March onwards, and then monsoon hits and suddenly everything is damp for months. That combination is harder on coats than people account for.",
      },
      { type: 'divider' },
      { type: 'h2', text: "What Pune's climate actually does to your dog's coat" },
      {
        type: 'p',
        text: "During summer, dogs are sweating through their paws and picking up dust every time they go outside. Their skin produces more oil in the heat. If you're in an area like Kothrud or Wakad where construction dust is just part of the air, your dog's coat is collecting more of it than you'd think.",
      },
      {
        type: 'p',
        text: "Then monsoon arrives. Wet fur that doesn't dry properly — especially in apartments without great airflow — starts to smell. It can also cause fungal skin issues, particularly in the folds around the face and under the legs. We've seen a lot of this in dogs with thicker coats who went through monsoon without a proper grooming session.",
      },
      { type: 'divider' },
      { type: 'h2', text: 'Rough guide by coat type' },
      { type: 'h3', text: 'Short-haired dogs — Labs, Beagles, Indie dogs' },
      {
        type: 'p',
        text: "Every 6 to 8 weeks normally. These are the lower-maintenance ones, but they're not zero-maintenance. During monsoon we'd bring that closer to every 5 weeks just to keep the skin clean and the nails in check.",
      },
      { type: 'h3', text: 'Medium coats — Goldens, Cockers, Border Collies' },
      {
        type: 'p',
        text: "Every 4 to 6 weeks. Golden Retrievers especially tend to get ear infections in Pune's humidity — the feathering around the ear traps moisture and it just sits there. A regular ear flush at each session goes a long way.",
      },
      { type: 'h3', text: 'Heavy shedders — Huskies, Pomeranians, German Shepherds' },
      {
        type: 'p',
        text: "Every 3 to 4 weeks, ideally with a deshedding treatment each time. These dogs blow out their undercoat more often in Pune's heat than they would in a cooler city. Regular deshedding keeps it manageable — and honestly keeps your sofa survivable.",
      },
      { type: 'h3', text: 'Continuously growing coats — Shih Tzus, Poodles, Doodles, Maltese' },
      {
        type: 'p',
        text: "Every 3 to 4 weeks for a bath and brush, with a haircut every 6 to 8 weeks. Skipping sessions with these breeds is where people get into trouble — the coat mats up fast in humidity and once it's badly matted, there's not much you can do except cut it short and start over.",
      },
      { type: 'divider' },
      { type: 'h2', text: 'Signs your dog probably needed a session last week' },
      {
        type: 'ul',
        items: [
          "A smell that's a bit off even though you bathed them recently",
          'Matting around the collar, behind the ears, or under the front legs',
          "Scratching that doesn't have an obvious cause",
          'Nails that click on the floor when they walk',
          'Skin that looks pink or irritated when you part the fur',
          'Shedding that seems like more than usual even for their breed',
        ],
      },
      { type: 'divider' },
      {
        type: 'callout',
        text: "When in doubt, 4 to 6 weeks is a safe starting point for most dogs in Pune. Your groomer can usually tell you at each session whether the next one should be sooner or later based on how the coat is holding up.",
      },
    ],
  },

  // ── Post 2 ──────────────────────────────────────────────────────────────────
  {
    slug: 'why-you-should-never-shave-a-husky-in-summer',
    title: "Please Don't Shave Your Husky in Summer",
    excerpt: "Every May we start getting these requests. The dog is panting, the flat is warm, and shaving feels like the obvious solution. It isn't — and it can do damage that never fully reverses.",
    coverImage: '/images/grooming-session-3.jpg',
    category: 'Breed Care',
    readTime: '5 min read',
    date: 'January 2026',
    blocks: [
      {
        type: 'p',
        text: "We decline this request more than any other. A Husky owner calls, their dog is visibly warm, they've heard shaving will help, and they want it done. We say no every time — and we try to explain why, because it genuinely matters.",
      },
      {
        type: 'p',
        text: "The short version: a Husky's coat is not like a thick jumper you can take off when it gets warm. It's a system. Removing it doesn't cool the dog down — it removes the thing that was helping them manage the heat in the first place.",
      },
      { type: 'divider' },
      { type: 'h2', text: "How the coat actually works" },
      {
        type: 'p',
        text: "Huskies have two layers. The undercoat is dense and soft — it traps air close to the skin, which insulates the dog in both directions, against cold and against heat. On top sit the guard hairs, longer, which protect the skin from direct sun and abrasion.",
      },
      {
        type: 'p',
        text: "When you shave a Husky, you go through both layers at once. The dog now has no insulation and no sun protection. Their skin, which isn't built to be exposed, is suddenly getting direct UV. On a Pune afternoon in May, that's not a small thing.",
      },
      { type: 'divider' },
      { type: 'h2', text: "The damage that doesn't go away" },
      {
        type: 'p',
        text: "There's something called post-clipping alopecia — the two coat layers don't grow back at the same rate after shaving. The undercoat tends to come back faster and thicker, while the guard hairs lag behind or come back unevenly. The result is a coat that never quite looks or works the same again.",
      },
      {
        type: 'callout',
        text: "We've worked with Huskies whose owners shaved them a year or two before coming to us. Compared to an unshaved Husky of the same age, the difference in coat texture is noticeable. Some never fully get it back.",
      },
      { type: 'divider' },
      { type: 'h2', text: "What actually helps" },
      {
        type: 'p',
        text: "Deshedding. A proper deshedding session — using a high-velocity dryer to blow out the loose undercoat, then thorough brushing — removes a surprising amount of fur. You'd be genuinely shocked how much comes out of a dog that hasn't been deshedded in a while.",
      },
      {
        type: 'p',
        text: "What's left is a lighter, airier coat that can breathe properly. The guard hairs are untouched. The dog is cooler than they were with all that trapped dead undercoat, and the coat is still doing its job.",
      },
      { type: 'divider' },
      { type: 'h2', text: "Other things that actually help in Pune summers" },
      {
        type: 'ul',
        items: [
          'Deshedding every 4 to 6 weeks through summer, not just once',
          'Walks before 8am or after 7pm when the ground is cooler',
          'A cooling mat — they genuinely work',
          'Let them lie on tiles, they find cool surfaces on their own',
          'Check water more often in summer, they drink more',
          'Fan or AC during afternoon hours',
        ],
      },
      {
        type: 'p',
        text: "Huskies have been kept in much warmer climates than Pune with no problems, when their coats are properly maintained. The coat isn't the problem — it's the solution.",
      },
    ],
  },

  // ── Post 3 ──────────────────────────────────────────────────────────────────
  {
    slug: 'first-grooming-session-what-to-expect',
    title: "What Actually Happens During Your Dog's First Grooming Session",
    excerpt: "First sessions are unpredictable. Some dogs are completely fine. Some aren't. Here's an honest look at what happens, what we do when things get difficult, and what you can do to help.",
    coverImage: '/images/grooming-session-2.jpg',
    category: 'Tips & Guides',
    readTime: '4 min read',
    date: 'December 2025',
    blocks: [
      {
        type: 'p',
        text: "We've done enough first sessions to know they don't all go the same way. Some dogs are completely unbothered — they sniff the bag, check out the groomer, and just get on with it. Others are nervous from the start. A few are genuinely difficult, not out of aggression but because the whole thing is new and overwhelming.",
      },
      {
        type: 'p',
        text: "None of that is a problem. It's just what first sessions are. The more you know going in, the smoother it tends to go.",
      },
      { type: 'divider' },
      { type: 'h2', text: "Before the session" },
      {
        type: 'p',
        text: "Tell us things when you book. If your dog is nervous around strangers, say so. If they've had a bad experience at a salon before, mention it — we'll know to go slower. If there's a specific spot they hate being touched, like their paws or their face, that's useful to know upfront rather than discovering it halfway through.",
      },
      {
        type: 'p',
        text: "A short walk beforehand helps. Even 15 minutes. A dog with some of their energy already spent is noticeably easier to work with than one who's been sitting in the flat since morning.",
      },
      { type: 'divider' },
      { type: 'h2', text: "When we arrive" },
      {
        type: 'p',
        text: "The first thing is not grooming. It's just letting the dog settle. The groomer puts the bag down, lets the dog sniff around, maybe sits on the floor with them for a bit. There's no rush. Trying to get straight to work on a nervous dog just makes everything harder.",
      },
      {
        type: 'p',
        text: "We usually start with brushing because it's the most neutral thing — no loud sounds, no unfamiliar sensations. It gives us a chance to feel the coat, check for anything unexpected, and let the dog get used to being handled. Then we move to the bath.",
      },
      { type: 'divider' },
      { type: 'h2', text: "When it gets hard" },
      {
        type: 'p',
        text: "Some dogs freeze up at the dryer. Some are fine with everything except their nails. Some get tired halfway through and stop cooperating. All of this is normal and we've seen it before.",
      },
      {
        type: 'p',
        text: "We take breaks. We don't power through. A stressed dog being handled against its will doesn't learn that grooming is okay — it learns the opposite. Taking five minutes to let the dog calm down and then continuing is almost always more effective than just trying to finish quickly.",
      },
      {
        type: 'callout',
        text: "The one thing we ask of owners: try not to hover. It sounds counterintuitive, but dogs read anxiety very clearly. If you're standing nearby looking worried, your dog picks up on it. Go make a cup of chai. We'll find you if we need anything.",
      },
      { type: 'divider' },
      { type: 'h2', text: "After" },
      {
        type: 'p',
        text: "Your dog is probably going to be tired. First sessions are a lot of new input — sounds, smells, handling — even if they went smoothly. Let them rest.",
      },
      {
        type: 'p',
        text: "Second and third sessions are almost always noticeably easier. Once a dog understands the pattern — groomer arrives, some stuff happens, it ends, life continues — most of the anxiety disappears. Consistency is the thing that makes grooming easy long-term.",
      },
      {
        type: 'p',
        text: "And if it genuinely didn't go well, tell us. Not in a polite 'it was fine' way — actually tell us what was hard. We'd rather know so we can do something different next time.",
      },
    ],
  },

  // ── Post 4 ──────────────────────────────────────────────────────────────────
  {
    slug: 'home-grooming-vs-salon-honest-comparison',
    title: 'Home Grooming vs Salon — An Honest Comparison',
    excerpt: "We obviously have a position on this. But there are things salons do well, and it's worth being straight about when each option actually makes sense.",
    coverImage: '/images/grooming-session-4.jpg',
    category: 'Grooming Basics',
    readTime: '6 min read',
    date: 'March 2025',
    blocks: [
      {
        type: 'p',
        text: "We run a home grooming service, so you'd expect us to say home grooming is always better. And for most dogs and most situations, we do think it is. But we've talked to enough customers who've used both to have a reasonably honest picture of where each option makes sense.",
      },
      { type: 'divider' },
      { type: 'h2', text: "What salons actually do well" },
      {
        type: 'p',
        text: "A good salon with experienced groomers can handle complex coat work fast. If your dog needs a very detailed breed-specific trim or show-style styling, a specialist salon might do it more efficiently than a home groomer.",
      },
      {
        type: 'p',
        text: "Salons also have larger, more permanent equipment — bigger baths, more powerful dryers, proper grooming tables. For very large dogs this can make a practical difference.",
      },
      {
        type: 'p',
        text: "And if you live somewhere without home grooming coverage, a decent salon is obviously better than nothing.",
      },
      { type: 'divider' },
      { type: 'h2', text: "Where home grooming is genuinely better" },
      {
        type: 'p',
        text: "The biggest one is stress. At a salon, your dog is dropped off, put in a cage or holding area, surrounded by other dogs barking and strangers moving around, and then called up when it's their turn. For a lot of dogs — anxious ones, older ones, dogs who've had bad experiences before — this is a genuinely unpleasant few hours.",
      },
      {
        type: 'p',
        text: "At home, the dog never leaves their space. No car ride, no cage, no other animals. We've had dogs described as impossible to groom at salons who were completely relaxed at home. Sometimes the environment really is the whole problem.",
      },
      {
        type: 'p',
        text: "The other thing is attention. At a busy salon, a groomer might be working across two or three dogs at once — bathing one, drying another. Your dog gets done, but they're not anyone's full focus during the session. With home grooming, one person is with your dog the whole time.",
      },
      { type: 'divider' },
      { type: 'h2', text: "What about the quality of the actual groom?" },
      {
        type: 'p',
        text: "This comes down to the individual groomer more than the setting. A skilled home groomer with decent equipment beats a mediocre groomer in a fancy facility. The reverse is also true.",
      },
      {
        type: 'p',
        text: "The difference is that at a salon you often don't know which groomer is working on your dog that day. With home grooming you usually do. You're there, you can see what's happening, and you can ask for things to be done differently.",
      },
      { type: 'divider' },
      { type: 'h2', text: "Who should probably stay with a salon" },
      {
        type: 'ul',
        items: [
          'Dogs who genuinely enjoy going out and find it stimulating in a good way',
          'Owners who want very specific show cuts that need specialist equipment',
          'Very large breeds where space at home is genuinely a problem',
        ],
      },
      { type: 'h2', text: "Who's usually better off at home" },
      {
        type: 'ul',
        items: [
          'Anxious dogs or dogs with a bad salon history',
          'Older dogs who find car rides and unfamiliar environments tiring',
          'Puppies being introduced to grooming for the first time',
          'Owners who want to be present during the session',
          "Anyone who finds salon drop-off and pickup logistics annoying",
        ],
      },
      { type: 'divider' },
      {
        type: 'callout',
        text: "The best grooming option is the one your dog is most comfortable with and that you'll actually stick to. Regular grooming done consistently beats the perfect setup done rarely.",
      },
    ],
  },

  // ── Post 5 ──────────────────────────────────────────────────────────────────
  {
    slug: 'what-to-do-between-grooming-sessions',
    title: "What to Do Between Grooming Sessions (And What Not To)",
    excerpt: "What happens between sessions matters almost as much as the sessions themselves. A few simple habits at home make a real difference to how your dog's coat holds up.",
    coverImage: '/images/grooming-session-1.jpg',
    category: 'Tips & Guides',
    readTime: '4 min read',
    date: 'November 2025',
    blocks: [
      {
        type: 'p',
        text: "We book sessions every 4 to 6 weeks for most dogs. But those weeks in between aren't nothing — what happens at home during that time affects how the coat arrives at the next session, and whether the dog finds grooming easy or difficult.",
      },
      {
        type: 'p',
        text: "You don't need much equipment or much time. A few habits make a real difference.",
      },
      { type: 'divider' },
      { type: 'h2', text: "Brushing — the one thing that actually matters" },
      {
        type: 'p',
        text: "For short-haired dogs, a couple of times a week is fine. For medium and long-haired dogs, daily or every other day. The point isn't just removing loose fur — it's stopping the coat from forming mats.",
      },
      {
        type: 'p',
        text: "Mats start small. A few tangled hairs behind the ear that get ignored for a week become a dense knot you can't brush out. At that point the options are painful dematting or clipping the area short — neither is great for the dog.",
      },
      {
        type: 'p',
        text: "The right brush matters. A slicker brush works for most coats, but double-coated breeds also need an undercoat rake. If you're not sure what to use, just ask next time we're there — takes about two minutes to show you.",
      },
      { type: 'divider' },
      { type: 'h2', text: "Paws and nails" },
      {
        type: 'p',
        text: "Check the paws after walks, especially in monsoon. Mud and moisture sitting between the toes for hours causes irritation. A quick wipe with a damp cloth after wet walks is an easy habit.",
      },
      {
        type: 'p',
        text: "Nails get trimmed at every grooming session, but if they grow fast you might hear clicking on the floor before the next session is due. Worth getting them done separately rather than waiting.",
      },
      { type: 'divider' },
      { type: 'h2', text: "Ears" },
      {
        type: 'p',
        text: "Floppy-eared breeds — Cockers, Goldens, Beagles — are prone to ear infections, especially through monsoon. A quick look inside the ear every week or so is worth doing. Redness, a strong smell, or your dog shaking their head and scratching at the ear are signs something's off.",
      },
      {
        type: 'p',
        text: "Don't dig around inside the ear with cotton buds — you can cause more harm than good. A gentle wipe of the outer ear with a damp cotton pad is enough.",
      },
      { type: 'divider' },
      { type: 'h2', text: "Bathing at home between sessions" },
      {
        type: 'p',
        text: "You can bathe your dog at home when needed — after a muddy walk or if they've found something to roll in. Use a dog-specific shampoo, not human shampoo. And dry them properly, especially where the fur is thick. Damp fur that doesn't dry is where skin problems start.",
      },
      {
        type: 'callout',
        text: "Don't overdo the home baths though. Once a week is fine. More than that and you start stripping natural oils from the coat, which leads to dry, flaky skin and fur that looks dull.",
      },
      { type: 'divider' },
      { type: 'h2', text: "The things that cause problems" },
      {
        type: 'ul',
        items: [
          "Brushing only right before a grooming session when the coat is already knotted",
          "Using human shampoo or baby shampoo thinking it's gentler",
          "Not drying properly after home baths, especially in monsoon",
          "Ignoring ear smell until it's become a full infection",
          "Waiting until nails are very long — long nails change how a dog walks and can cause joint issues over time",
        ],
      },
      {
        type: 'p',
        text: "None of this is complicated. A 10-minute brush a few times a week and a quick paw check after walks keeps most dogs in good shape between sessions. The groomers notice — dogs who are brushed at home arrive in noticeably better condition, and the sessions go faster and easier.",
      },
    ],
  },

];

// ─── Block renderer ───────────────────────────────────────────────────────────

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
          {block.text}
        </p>
      );
    case 'ul':
      return (
        <ul className="mb-5 space-y-2 mt-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-600 text-base leading-relaxed">
              <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-sniffy-yellow" />
              {item}
            </li>
          ))}
        </ul>
      );
    case 'callout':
      return (
        <div className="my-6 bg-purple-50 border-l-4 border-sniffy-purple rounded-r-2xl px-5 py-4">
          <p className="text-sniffy-purple text-sm md:text-base leading-relaxed font-medium">
            {block.text}
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4 }}
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
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Navbar activePath="/blogs" />
      </header>

      <main>
        <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 py-14 md:py-20 text-center">
          <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-3">From the Sniffy team</p>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              The <span className="text-sniffy-purple">Sniffy</span>{' '}
              <span className="text-sniffy-yellow">Blog</span>
            </h1>
            <p className="text-gray-500 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              Grooming guides, breed-specific advice, and the questions we get asked most — answered honestly.
            </p>
          </motion.div>
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

  const otherPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
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
