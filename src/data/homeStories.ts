/**
 * homeStories — SEO story sections for the marketing home page (`/`).
 *
 * Same shape as `LocationStorySection` (src/components/location/LocationHero.ts)
 * so <HomeStories /> renders identically to the locality pages.
 *
 * Editorial rules for anything added here:
 *  - City-wide / service-wide angles only. Locality-specific copy belongs in
 *    locationData.ts; "Pune climate" and "cats vs salons" are already owned by
 *    PunePage.tsx and CatPunePage.tsx — don't repeat them here or the pages
 *    compete with each other in search.
 *  - Each section targets one keyword cluster, written as an answer to a real
 *    question a Pune pet parent types. No repeated phrase stuffing.
 */
import type { LocationStorySection } from '../components/location/LocationHero';
import { RATING_SUMMARY } from './reputation';

export const HOME_STORY_SECTIONS: LocationStorySection[] = [
  // ── Cluster: "dog grooming price in Pune", "pet grooming charges Pune" ──────
  {
    heading: 'What pet grooming in Pune actually costs — and what changes the number',
    subheading: 'Priced by service, not by how big your dog looks on the day.',
    paragraphs: [
      `Most people searching for dog grooming prices in Pune, or for pet grooming charges generally, end up on a page with a range instead of a price, because the range is doing the selling. Ours are fixed and published: a Spa Bath is ₹799, a Hair Cut is ₹999, and both together are ₹1299. That is what you pay whether the groomer is standing in a two-bedroom flat in Kalewadi or a bungalow in Koregaon Park.`,
      `The honest part is what sits outside those numbers. Add-ons are optional and separately priced — a tick and flea treatment is ₹149, and medicated, destressing, hygiene and deworming baths are ₹299 each. A groomer may suggest one after seeing the coat, but suggesting is where it ends. Nobody on our team earns more by talking you into an upgrade, so there is no reason for them to try.`,
      `Where a session genuinely takes longer is matting. A coat that has not been brushed for three months has to be worked out strand by strand, or clipped down if the mats are already tight against the skin. We will tell you which one it is before starting, not after.`,
    ],
    eyebrow: 'Pricing',
    icon: 'price',
    image: '/images/grooming-session-1.jpg',
    imageAlt: 'Pet grooming at home in Pune with transparent pricing',
    imageLeft: true,
  },

  // ── Cluster: "how often should I groom my dog", coat-type long tail ─────────
  {
    heading: 'How often should you book dog grooming? It depends on the coat, not the calendar',
    subheading: 'The gap between sessions is a coat decision, not a habit.',
    paragraphs: [
      `"Every month" is the answer most pet parents are given, and for roughly half of dogs it is wrong in one direction or the other. A Beagle bathed every four weeks loses skin oils it needs. A Shih Tzu left eight weeks arrives matted behind the ears and under the collar. The coat sets the schedule.`,
      `Here is the spacing we actually book people on, after seeing which dogs come back in good condition and which come back with problems:`,
    ],
    bullets: [
      `Long, non-shedding coats — Shih Tzu, Maltese, Lhasa Apso, Poodle mixes: every 4 to 6 weeks. These coats keep growing rather than dropping, so mats form quietly at friction points — the armpits, behind the ears, under a harness. Past six weeks the session usually turns into a de-matting job.`,
      `Double coats — Golden Retriever, German Shepherd, Husky, Saint Bernard: every 6 to 8 weeks with proper deshedding. Never shave a double coat in summer; the undercoat is insulation both ways, and once it grows back patchy it often stays patchy.`,
      `Short, dense coats — Labrador, Beagle, Pug, Dalmatian: every 8 to 12 weeks is enough for coat health, though many Pune families book more often simply because of road dust and shedding on furniture.`,
      `Indies and mixed breeds: usually every 8 to 10 weeks. Indies live more of their life outdoors than most pedigree dogs in this city, so what matters more than frequency is a real tick check every session.`,
      `Puppies under six months: short, positive introduction sessions rather than full grooms. What a puppy learns about being handled at four months decides how easy the next twelve years are.`,
    ],
    closingLine: `If you are not sure where your dog sits, tell us the breed when you book and we will suggest a gap — including telling you when you are booking too often.`,
    link: {
      href: '/blogs/how-often-should-you-groom-your-dog-in-pune',
      label: 'Read the full guide to grooming frequency in Pune',
    },
    eyebrow: 'Grooming frequency',
    icon: 'calendar',
    image: '/images/grooming-session-3.jpg',
    imageAlt: 'Breed and coat type dog grooming schedule in Pune',
    imageLeft: false,
  },

  // ── Cluster: "monsoon pet care Pune", "tick flea treatment dog Pune" ────────
  {
    heading: 'Pune has a grooming calendar, and monsoon is the part people get wrong',
    subheading: 'June to September is tick season, not a break from grooming.',
    paragraphs: [
      `The instinct during monsoon is to groom less — the dog is going out less, so why bother. That is exactly backwards. Warm, wet months from June through September are when the Indian brown dog tick breeds fastest, and a dog that walks ten minutes on wet grass in Baner comes back with passengers.`,
      `The second monsoon problem is drying. A dog washed at home and left to air-dry in a closed Pune flat during humidity stays damp at the skin for hours, and damp skin under a thick coat is how fungal patches start. Every one of our sessions ends with a proper blow-dry down to the skin for this reason — it is not a finishing flourish, it is the medically useful part.`,
      `Through summer the problem inverts. Dust from construction and traffic settles into the coat, oils build faster in the heat, and paw pads take a beating on hot surfaces. Winter in Pune is short and mild, which makes it the easiest window to sort out a coat that has been neglected through the rains.`,
    ],
    bullets: [
      `Monsoon (June–September): tick and flea treatment, full ear check, complete blow-dry to the skin, and shorter paw-hair trims so mud carries less.`,
      `Summer (March–May): deshedding and deep cleansing baths, hygiene trims — and no shaving of double coats regardless of how hot it gets.`,
      `Winter (November–February): the right time for de-matting, coat conditioning, and rebuilding a schedule after monsoon gaps.`,
    ],
    link: {
      href: '/blogs/why-you-should-never-shave-a-husky-in-summer',
      label: 'Why shaving a double coat backfires',
    },
    eyebrow: 'Pune seasons',
    icon: 'season',
    image: '/images/grooming-session-2.jpg',
    imageAlt: 'Monsoon tick and flea dog grooming treatment in Pune',
    imageLeft: true,
  },

  // ── Cluster: "cat grooming at home Pune", "lion cut", "matted Persian" ──────
  {
    heading: 'Cat grooming at home in Pune: what the session actually looks like',
    subheading: 'Quiet room, no cage, and the cat decides the pace.',
    paragraphs: [
      `Cat owners in Pune usually call us for one of three reasons — a Persian whose coat has matted into solid pads, a longhair shedding through the whole house, or a cat that has become impossible to bathe at home. All three are ordinary. What is not ordinary is expecting a cat to accept the same routine a dog does.`,
      `A session starts with the groomer sitting down and doing nothing for a few minutes. The cat inspects the equipment, decides it is not a threat, and only then do we begin. We work in one quiet room with the door shut, use low restraint rather than scruffing, and stop when the cat says stop. Products are cat-formulated throughout — dog shampoo is genuinely unsafe on cats, and permethrin-based tick products can be fatal to them.`,
      `A lion cut is a real option and not a fashion statement. When a Persian or Himalayan coat has matted close to the skin, brushing it out pulls at the skin for an hour and clipping down is simply the kinder route. Coats grow back. We will say plainly which situation you are in rather than charging you for a de-matting session that ends in a clip anyway.`,
    ],
    eyebrow: 'Cat grooming',
    icon: 'cat',
    image: '/images/grooming-session-4.jpg',
    imageAlt: 'Cat grooming at home in Pune including lion cut for Persian cats',
    imageLeft: false,
  },

  // ── Cluster: "doorstep/mobile pet grooming Pune", apartment logistics ───────
  {
    heading: 'What doorstep dog grooming needs from your flat (less than you think)',
    subheading: 'A bathroom, a plug point, and about ninety minutes.',
    paragraphs: [
      `Doorstep dog grooming sounds like it needs a van, a generator and a parking spot. It does not. Our groomers arrive by two-wheeler with everything in a kit — clippers, blades, dryer, shampoos, towels, mats and disposables. What we need from you is access to a bathroom or balcony with a tap, one working plug point, and enough floor space for the dog to stand and turn.`,
      `Sessions typically run sixty to ninety minutes for a single dog, longer for a heavily matted coat or two pets in the same booking. The work area is laid out on our own mats, hair is collected as we go, and the space is cleaned before the groomer leaves. Housing societies in Wakad, Kharadi and NIBM have never been an issue — a groomer arriving on foot with a bag needs no permission that a delivery does not.`,
      `You are welcome to stay in the room and most people do, especially the first time. Some dogs are calmer without their owner watching, and the groomer will say so if that is what they are seeing. Either way it is one visit, at your home, and nobody spends an afternoon in Pune traffic with an anxious dog in the back seat.`,
    ],
    closingLine: `We groom across Pune and Pimpri-Chinchwad, from Kothrud and Baner to Hadapsar, Wagholi and Ravet, seven days a week between 9 AM and 9 PM.`,
    link: {
      href: '/blogs/first-grooming-session-what-to-expect',
      label: 'What to expect from a first grooming session',
    },
    eyebrow: 'At your doorstep',
    icon: 'home',
    image: '/images/grooming-session-1.jpg',
    imageAlt: 'Doorstep dog grooming setup inside a Pune apartment',
    imageLeft: true,
  },

  // ── Cluster: breed-name long tail — "<breed> grooming in Pune" ─────────────
  {
    heading: 'Breed by breed: what a dog or cat grooming session actually involves in Pune',
    subheading: 'A Labrador, a Shih Tzu and a Persian need three different sessions — at the same three published prices.',
    paragraphs: [
      `Most pet grooming services in Pune quote by size, which tells you almost nothing about what will happen in your house. Coat type decides the session, not weight. A 30 kg Labrador is a shorter, simpler groom than a 6 kg Shih Tzu that has not been combed in two months, and pricing that pretends otherwise is really pricing the groomer's inconvenience rather than your dog's needs.`,
      `These are the breeds we are called out to most across Pune and Pimpri-Chinchwad, and what a home grooming session genuinely involves for each:`,
    ],
    bullets: [
      `Labrador and Golden Retriever grooming — the shedding breeds of this city. The work is deshedding, not haircutting: an undercoat rake and a high-velocity blow-out that lifts the dead coat before it lands on your floor. Goldens additionally need feathering trimmed at the ears, tail and hocks, and their drop ears checked every visit.`,
      `German Shepherd and Husky grooming — double coats, and the single most common request we refuse. We will not shave a double coat for Pune summer; the undercoat is insulation against heat as much as cold, and shaved coats regrow patchy and coarse. Deshedding plus a cooling, thorough blow-dry is the correct answer.`,
      `Shih Tzu, Lhasa Apso, Maltese and Poodle-mix grooming — continuously growing coats that mat rather than shed. This is haircut territory: teddy bear and puppy cuts, sanitary and paw-pad trims, and line brushing down to the skin at the armpits, behind the ears and under the collar, which is where matting always starts.`,
      `Pug, Beagle and French Bulldog grooming — short coats, but the work is in the details. Facial and tail folds cleaned and dried properly, ears checked for the yeast that Pune humidity encourages, and nails kept short because these breeds wear them down poorly on tile floors.`,
      `Indie and rescue dog grooming — practical, self-maintaining coats that need less bathing than most owners assume, but a far more thorough tick and skin inspection every single session. Over-bathing an Indie does more harm than leaving the coat alone.`,
      `Persian, Himalayan and Maine Coon cat grooming — the longhairs that Pune's humidity punishes hardest. Sessions run on de-matting, sanitary trims, nail clipping and, where a coat has packed down against the skin, a lion cut. Cat-formulated products only, low restraint, and one quiet room with the door shut.`,
      `Indian shorthair and Siamese cat grooming — usually the least intervention of anything on this list. Nails, ears, a comb-out and a coat check are often the whole job, and we will say so rather than sell you a bath a healthy shorthair does not need.`,
    ],
    closingLine: `Name the breed at the time of booking and your groomer turns up with the session already planned, instead of working it out on your living room floor.`,
    link: {
      href: '/blogs/persian-cat-matting-pune-humidity',
      label: 'Why Persian coats mat so fast in Pune humidity',
    },
    eyebrow: 'By breed',
    icon: 'breed',
    image: '/images/grooming-session-2.jpg',
    imageAlt: 'Breed-specific dog and cat grooming at home in Pune — Labrador, Shih Tzu and Persian',
    imageLeft: false,
  },

  // ── Cluster: life-stage long tail — puppy / kitten / senior pet grooming ───
  {
    heading: 'Puppy, kitten and senior pet grooming: the sessions that decide all the others',
    subheading: 'The first groom and the fifteenth are the two that need the most care and the least hurry.',
    paragraphs: [
      `The two ends of a pet's life are where home grooming earns its keep most clearly, and where a rushed salon appointment does the most lasting damage. A puppy that is frightened at four months spends the next decade fighting the clipper. A fourteen-year-old cat put through a busy salon comes home shut down for two days. Neither outcome is about skill — it is about whether anyone had time.`,
      `Puppy grooming in Pune should start at around twelve to sixteen weeks, once the core vaccination course is complete, and the first visit should be deliberately unambitious. Paws handled, ears looked into, a comb run over the back, the dryer heard from across the room rather than used at full strength. No finished haircut. What we are buying is a puppy who thinks being handled is normal, and that is worth more than a tidy coat at four months.`,
      `Kitten grooming works the same way and starts a little later, around four months. Very young kittens hold their own warmth badly, which makes washing one a medical question rather than a grooming preference. The first session is an introduction: nails, a comb, and the kit left out for the kitten to investigate on its own terms.`,
      `Senior pet grooming is the other end of the same principle. An arthritic dog cannot stand for ninety minutes, so the session is broken into stages with breaks and non-slip matting underfoot. An elderly cat overheats and tires quickly, so we keep sessions short and the room warm. Overgrown nails matter far more than a perfect coat at this age — they change how an old joint loads, and in cats they curl into the pad. Flag arthritis, heart or kidney trouble, an operation they are still recovering from, or anything they take daily — and where a complete groom looks like too much for the animal in front of us that afternoon, we will tell you plainly and do only what is genuinely needed.`,
    ],
    closingLine: `Every groomer who comes to your home is identity-verified with documents on file, and you get their name before the visit — which matters most for exactly these two groups, who cannot tell you afterwards how it went.`,
    link: {
      href: '/blogs/cat-grooming-without-sedation',
      label: 'How we groom nervous cats without sedation',
    },
    eyebrow: 'Every life stage',
    icon: 'lifestage',
    image: '/images/grooming-session-4.jpg',
    imageAlt: 'Puppy, kitten and senior pet grooming at home in Pune',
    imageLeft: true,
  },

  // ── Cluster: service-name vocabulary — "<dog|cat|pet> <spa bath|haircut|
  //    basic grooming|full grooming|dry bath> in Pune". Every operator in this
  //    market names the same three jobs differently; this section is the
  //    translation, and it is the only place the alternate names appear.
  {
    heading: 'Dog spa bath, cat haircut, full grooming: what the service names actually mean',
    subheading: 'Every pet grooming service in Pune uses different words for the same three jobs. Here is the translation.',
    paragraphs: [
      `Search for a dog spa bath in Pune and then for cat basic grooming in Pune and you will get the same kind of business describing the same work under four different names. There is no industry standard behind any of it. Before you compare two quotes, it is worth knowing which words map onto which actual job — because a "full grooming" package at one place and a "pet spa" at another can be identical, or can differ by a haircut worth ₹500.`,
      `Here is our translation, using the names we publish and the names you are probably searching for:`,
    ],
    bullets: [
      `Dog spa bath, cat spa bath, pet spa bath in Pune — our Spa Bath, ₹799. Bath with premium shampoo, nourishing coat conditioner and a full blow-dry to the skin. This is what most people mean by a dog bath, a pet spa or basic grooming: the coat is cleaned, deshedded and dried, and nothing is cut.`,
      `Dog haircut and cat haircut in Pune — our Hair Cut, ₹999. Full body trimming or a full body haircut at a trim length you choose, finished with a loose-hair blow-out. Breed clips, teddy bear and puppy cuts and lion cuts for Persians all sit here. Send a reference photo and the groomer works to it.`,
      `Dog full grooming and cat full grooming in Pune — our Spa Bath + Hair Cut, ₹1299. Bath, conditioner, haircut and blow-dry in one visit, which is the combination people usually mean by a full groom or a complete pet grooming package. It is ₹499 cheaper than booking the two separately.`,
      `Basic grooming in Pune — the same thing as our Spa Bath. Some operators mean bath-only by "basic" and some quietly exclude the blow-dry, which is the step that actually matters in this climate. Ours always includes drying down to the skin.`,
      `Add-ons, priced separately and only ever suggested, never assumed — Tick & Flea Care ₹149, and Medicated Bath, Deworming, Destress Massage and Hygiene Hair Cut at ₹299 each.`,
      `Dry bath in Pune — waterless grooming, where a foam or powder is worked through the coat and brushed out. We do not sell it as a package, and we would rather say why than take the booking: it masks odour instead of removing what causes it, and in Pune humidity a coat that has not been rinsed and dried properly is where fungal trouble starts. Where a pet genuinely cannot be bathed — recent surgery, a very frail senior, a cat late in pregnancy — we do a dry clean-up as part of a session rather than sold as a substitute for one.`,
    ],
    closingLine: `Search instead for a pet haircut, pet basic grooming or pet full grooming in Pune and you land on these same three packages — the price is identical for dogs and cats, so we only split the wording where the handling genuinely differs. A pet dry bath is the one item on that list we do not sell, for the reason above. Everything else comes with no doorstep charge and no size surcharge: a mobile dog grooming service across Pune and Pimpri-Chinchwad means the van-and-parking problem is simply not yours to solve.`,
    link: {
      href: '/blogs/home-grooming-vs-salon-honest-comparison',
      label: 'Home grooming vs a salon: an honest comparison',
    },
    eyebrow: 'Services explained',
    icon: 'services',
    image: '/images/grooming-session-3.jpg',
    imageAlt: 'Dog spa bath, cat haircut and full pet grooming packages in Pune',
    imageLeft: false,
  },

  // ── Cluster: "best dog groomer near me", "pet grooming near me Pune",
  //    "top rated pet grooming Pune", "verified pet groomers" — trust and
  //    local-intent queries. Every other section above answers a how/what/
  //    how-often question; this one answers the comparison-shopping query
  //    people type right before they actually book, so it deliberately closes
  //    the list rather than opening it.
  {
    heading: 'Searching for the Best Dog or Cat Grooming Near You in Pune? Here\'s What Actually Matters',
    subheading: "Not a directory ranking — a groomer whose identity, pricing and reviews you can actually verify.",
    paragraphs: [
      `Type "best dog groomer near me" or "top pet grooming in Pune" into Google and most of what comes back is directory listings ranked by ad spend, not by what actually happens when someone shows up at your door. A badge on a listings site doesn't tell you who is entering your home, whether the price quoted on the phone is the price you pay, or whether the same groomer will be at your next session. Those are the three things worth checking before booking any dog or cat grooming service in Pune — not star icons on a search results page.`,
      `On identity: every groomer we send out is identity-verified with documents on file, and you get their name before the visit — not a rotating pool of whoever's free that day. On pricing: our packages are fixed and published on this page, a Spa Bath at ₹799, a Hair Cut at ₹999, both together at ₹1299, not a "starting from" number that changes once someone's standing in your living room. On reviews: our rating is ${RATING_SUMMARY}, checkable independently on our Google Business Profile rather than a testimonials carousel we control ourselves.`,
      `"Pet grooming near me" only means something if a trained groomer can actually reach you the same day. We run dog and cat grooming across more than 30 localities in Pune and Pimpri-Chinchwad — from Kothrud, Baner and Wakad to Hadapsar, Kharadi and Wagholi — so "dog groomer near me" or "cat grooming near me" searched from most of this city resolves to someone who can genuinely be at your door within hours, not a listing that turns out to cover a different part of town.`,
    ],
    bullets: [
      "Is the groomer identity-verified, with a name shared before they arrive — or an anonymous gig-app assignment?",
      'Are the prices fixed and published, or a "starting from ₹499" figure that changes once you\'re mid-conversation?',
      'Is the rating checkable on an independent platform like Google, or only on a testimonials page the business wrote itself?',
      "Does the service actually cover your locality, or is \"Pune\" being used loosely to mean one or two neighbourhoods?",
      'Can you book a same-day slot, or does "near me" really mean a three-day wait?',
    ],
    closingLine: `If you want the fuller case for why pet parents across Pune pick us over a salon or an unverified freelancer, it's one page away.`,
    link: {
      href: '/why-sniffy',
      label: 'See the full case for why pet parents in Pune choose Sniffy',
    },
    eyebrow: 'Choosing a groomer',
    icon: 'trust',
    image: '/images/grooming-session-2.jpg',
    imageAlt: 'Verified, trained groomers offering the best dog and cat grooming service near you in Pune',
    imageLeft: true,
  },
];
