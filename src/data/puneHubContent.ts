/**
 * puneHubContent — copy for the /dog-grooming-in-pune hub page.
 *
 * Lifted out of PunePage.tsx so `scripts/generatePunePage.ts` can prerender it
 * into the generated HTML. The page component cannot be imported from a Node
 * script (it pulls in supabase.ts, which needs browser env vars), so the data
 * has to live in a module with no runtime dependencies.
 *
 * PunePage.tsx and the generator both read from here — they cannot drift.
 */

import { RATING_DISPLAY, REVIEW_COUNT } from './reputation';

// ─── Stats ──────────────────────────────────────────────────────────────────

export const stats = [
  { number: '1,500+', label: 'Sessions done in Pune' },
  { number: RATING_DISPLAY, label: `Average of ${REVIEW_COUNT} Google reviews` },
  { number: '8',      label: 'Areas covered across Pune' },
  { number: '₹799',   label: 'Starting price per session' },
];

// ─── Why sections ────────────────────────────────────────────────────────────

/**
 * Shaped as `LocationStorySection` (minus the type import, which would pull
 * React into the generator scripts) so PunePage.tsx and the prerenderer can
 * both render these through the shared <StoryBlock />, exactly like the home
 * page and the locality pages. `subheading` is the line that stays visible when
 * the body collapses into the mobile "Read more" accordion.
 */
export const whySections = [
  {
    heading: 'Pune\'s climate is harder on coats than most people realise',
    subheading: 'Dust for nine months, then three of real humidity.',
    paragraphs: [
      "The city runs warm and dusty for most of the year, and then spends three months being genuinely humid during monsoon. That combination — dust buildup in summer, damp fur in monsoon — makes skin and coat problems more likely here than in cities with more moderate weather. Dogs pick up road dust every walk, oils accumulate faster in the heat, and wet fur that doesn't dry properly in closed apartments leads to fungal issues we see regularly.",
    ],
    eyebrow: 'Pune seasons',
    icon: 'season' as const,
    image: '/images/grooming-session-1.jpg',
    imageAlt: 'Dog grooming in Pune home',
    imageLeft: true,
  },
  {
    heading: 'Home grooming isn\'t a luxury here — it makes practical sense',
    subheading: 'A salon trip across Pune is half a day gone.',
    paragraphs: [
      "Pune traffic is real. Driving a dog to a salon in Kothrud when you live in Wagholi, waiting an hour or two, driving back — that's easily a half day gone. And the dog has spent those hours in a cage surrounded by strangers and other animals. At-home grooming removes all of that. The groomer comes to you, works in your space, your dog stays calm, and you're not stuck driving anywhere.",
    ],
    eyebrow: 'At your doorstep',
    icon: 'home' as const,
    image: '/images/grooming-session-2.jpg',
    imageAlt: 'Professional home dog grooming Pune',
    imageLeft: false,
  },
  {
    heading: 'We cover the whole city — one standard, not eight different ones',
    subheading: 'The same session in Wakad, Kondhwa or Dhanori.',
    paragraphs: [
      "Every groomer across all eight areas is trained and equipped the same way. The session your dog gets in Wakad is the same session they'd get in Kondhwa or Dhanori. Same shampoos, same tools, same approach. We don't have franchise inconsistency because we're not a franchise — it's one team with one standard across Pune.",
    ],
    eyebrow: 'One team, one standard',
    icon: 'services' as const,
    image: '/images/grooming-session-3.jpg',
    imageAlt: 'Sniffy dog grooming across Pune localities',
    imageLeft: true,
  },
  {
    heading: 'Indie and rescue dog grooming is a bigger part of this city than most',
    subheading: "Pune has one of India's largest adopted-Indie populations, and grooming them isn't a smaller version of a purebred groom.",
    paragraphs: [
      "A large share of the dogs we groom across Pune are Indies — adopted off the street, out of a shelter, or taken in as a resident dog by a housing society. Indie dog grooming and rescue dog grooming aren't a discount version of purebred grooming: coats vary widely from dog to dog, many have spent real time outdoors and carry heavier tick loads than an apartment-raised Labrador, and plenty of adopted dogs are still building trust with being handled by a stranger at all. We treat that as its own category — a longer first visit built around letting the dog settle before any tool comes out, a proper tick and skin check given the time many have spent outside, and no assumption that a dog with an unknown history will sit still the way a puppy raised indoors from eight weeks does.",
    ],
    eyebrow: 'Indie & rescue dogs',
    icon: 'breed' as const,
    image: '/images/grooming-session-4.jpg',
    imageAlt: 'Indie and rescue dog grooming at home in Pune',
    imageLeft: false,
  },
  {
    heading: 'Same-day dog grooming, when you actually need it',
    subheading: '"Near me" only means something if the groomer can reach you today.',
    paragraphs: [
      "A search for dog grooming near me or a same-day dog groomer in Pune usually comes from a real, immediate reason — house guests arriving, a smell that's gotten out of hand, a matted coat someone finally noticed. Same-day slots are genuinely available across most of the areas we cover, subject to which groomers are already on the road that day, and booking takes under a minute on this page. If you need it for tomorrow morning specifically, say so when you book rather than picking a slot and hoping — coordinators can usually move things around if you tell them what you actually need.",
    ],
    eyebrow: 'Booking speed',
    icon: 'calendar' as const,
    image: '/images/grooming-session-1.jpg',
    imageAlt: 'Same-day dog grooming booking in Pune',
    imageLeft: true,
  },
  {
    heading: 'Large and giant-breed dog grooming, done inside a normal Pune flat',
    subheading: "German Shepherds, Rottweilers and Saint Bernards don't need a salon-sized room.",
    paragraphs: [
      "Pune has a genuine population of large and giant breeds — German Shepherds, Rottweilers, Saint Bernards, Great Danes — living in ordinary 2BHK and 3BHK flats, and owners often assume a proper groom needs a bigger space than a bathroom and a balcony provide. It doesn't. A large dog grooming session at home takes longer and uses more towels and shampoo, but the setup is the same kit our groomers carry everywhere: no grooming table, no salon-sized bath, no van outside your building. What actually matters for a big dog is temperament and coat type, not square footage — a calm 40kg Rottweiler is often an easier session than an anxious 8kg Shih Tzu.",
    ],
    eyebrow: 'Large breeds',
    icon: 'breed' as const,
    image: '/images/grooming-session-2.jpg',
    imageAlt: 'Large and giant breed dog grooming at home in Pune apartment',
    imageLeft: false,
  },
  {
    heading: 'Dog grooming across Pimpri-Chinchwad, not just Pune city',
    subheading: 'Wakad, Ravet, Kalewadi and the rest of PCMC get the same session as Kothrud.',
    paragraphs: [
      "Pimpri-Chinchwad is its own municipal corporation, and pet parents searching for dog grooming in PCMC or pet grooming in Pimpri-Chinchwad often assume city-based services stop at the Pune Municipal Corporation border. Ours doesn't. We run the same doorstep dog grooming service across Wakad, Ravet, Kalewadi and the wider Pimpri-Chinchwad belt that we run in Kothrud or Kondhwa — same three packages, same trained groomers, same ₹799/₹999/₹1299 pricing. If you're in an industrial or IT-corridor society in PCMC and have been told a groomer 'doesn't cover that side,' that's not us.",
    ],
    eyebrow: 'Pimpri-Chinchwad',
    icon: 'services' as const,
    image: '/images/grooming-session-3.jpg',
    imageAlt: 'Dog grooming service in Pimpri-Chinchwad PCMC',
    imageLeft: true,
  },
  {
    heading: 'Dog grooming that fits a Pune IT schedule, not the other way round',
    subheading: 'Evening and weekend slots across Hinjewadi, Kharadi, Baner and Wakad.',
    paragraphs: [
      "A lot of the dog owners we groom work in Pune's IT corridors — Hinjewadi, Kharadi, Baner, Magarpatta — and simply don't have a free weekday afternoon to sit at a salon. Home grooming solves that by moving the work to your schedule instead of the other way round: evening slots after office hours and full weekend availability are booked out more than any other time. The groomer works in your flat while you're on a call in the next room or genuinely out for the evening, and the dog doesn't need anyone home to babysit the visit once they're comfortable with the groomer.",
    ],
    eyebrow: 'For busy schedules',
    icon: 'calendar' as const,
    image: '/images/grooming-session-4.jpg',
    imageAlt: 'Evening and weekend dog grooming for IT professionals in Pune',
    imageLeft: false,
  },
  {
    heading: 'Breed-specific dog grooming: a Shih Tzu, a Lab and a Pug need three different sessions',
    subheading: 'Coat type decides the tools, the timing and how often you should book.',
    paragraphs: [
      "The dogs we groom across Pune are mostly Shih Tzus, Labradors, Golden Retrievers, Pomeranians, Pugs, German Shepherds, Poodles and Indies, and a single 'dog grooming' routine doesn't suit them all. A Shih Tzu or Poodle has a coat that keeps growing and mats at the skin if it isn't brushed, so it needs a haircut every few weeks. A Labrador or Golden Retriever sheds a thick undercoat that a bath and a proper blow-dry will loosen, and shaving it only damages the coat. A Pug or Beagle has a short coat that needs a bath, clean skin folds and ears rather than a haircut. Tell us the breed, size and coat when you book and the groomer arrives with the right brushes and clippers, and honest advice on how often to come back instead of a one-size-fits-all schedule.",
    ],
    eyebrow: 'Breed-wise care',
    icon: 'breed' as const,
    image: '/images/grooming-session-2.jpg',
    imageAlt: 'Breed-specific dog grooming at home in Pune',
    imageLeft: true,
  },
  {
    heading: 'Puppy first grooms and senior dog care: the two ages that need a slower session',
    subheading: 'A nervous puppy and a stiff ten-year-old both do better at home than on a salon table.',
    paragraphs: [
      "Puppy grooming in Pune usually starts with a first bath and a lot of curiosity, and the first visit should be treated as an introduction rather than a full groom: the sound of the dryer, a comb through the coat, paws handled, a short bath, treats, and an early finish if the puppy has had enough. Puppies who meet a groomer calmly in their own living room tend to carry that confidence into every visit after, which is the whole point. Ask your vet about vaccination timing before booking, and tell us the puppy's age when you do.",
      "At the other end, senior dog grooming is about joints and patience. An older Labrador or Spitz with arthritis shouldn't be made to stand for an hour on a slippery bathroom floor, so we keep sessions shorter, use warm rather than hot water, give breaks, and work around sore hips instead of through them. Both age groups pay the same ₹799 Spa Bath, ₹999 Hair Cut or ₹1299 Spa Bath + Hair Cut as any other dog; what changes is the pace, not the price. Pet parents in Kothrud, Aundh and Baner book these gentler first and later-life visits regularly.",
    ],
    link: {
      href: '/dog-grooming-in-pune/kothrud',
      label: 'See dog grooming at home in Kothrud',
    },
    eyebrow: 'Puppies & seniors',
    icon: 'lifestage' as const,
    image: '/images/grooming-session-3.jpg',
    imageAlt: 'Puppy and senior dog grooming at home in Pune',
    imageLeft: false,
  },
  {
    heading: 'What a Sniffy dog grooming visit looks like inside a Pune flat, start to finish',
    subheading: 'No van, no cage, no waiting room: just a groomer, a kit and a bathroom.',
    paragraphs: [
      "Booking is online or on WhatsApp: you choose Spa Bath, Hair Cut or Spa Bath + Hair Cut, share the breed, size and any coat or skin concerns, and pick a slot. The groomer arrives with their own kit, so you only need to point to a bathroom or balcony where water can drain. They start with a short settle-in and a coat check for mats, ticks and skin issues, then the bath, deshedding or haircut, a blow-dry and a final brush-out. Towels, shampoo and conditioner are carried in, and the space is cleaned before they leave.",
      "You can stay in the room, work from the next one, or step out once your dog is comfortable. Many families in high-rise societies in Baner, Wakad and Kharadi like that nothing about the visit involves the lift, the car or a crate. When the session ends you get honest advice on how soon to book again for your dog's coat, not a standard schedule.",
    ],
    link: {
      href: '/dog-grooming-in-pune/baner',
      label: 'See how dog grooming at home works in Baner',
    },
    eyebrow: 'What to expect',
    icon: 'home' as const,
    image: '/images/grooming-session-1.jpg',
    imageAlt: 'Dog grooming visit at home in a Pune apartment, step by step',
    imageLeft: true,
  },
];

// ─── FAQs ────────────────────────────────────────────────────────────────────

export const faqs = [
  {
    q: 'Do you cover all areas of Pune?',
    a: "We offer doorstep dog grooming across Pune, including Wakad, Wagholi, Kothrud, Shivajinagar, Kondhwa, NIBM, Dhanori and Pimpri-Chinchwad. We're adding more areas regularly — if you're not in our coverage zone yet, you can still fill the form and we'll let you know when we reach you.",
  },
  {
    q: 'What does a standard session include?',
    a: 'Bath with shampoo and conditioner, blow dry, brushing, nail clipping, eye and ear cleaning, paw massage, mouth spray, and a light perfume spritz. For breeds with specific coat needs we adjust technique accordingly.',
  },
  {
    q: 'How long does a session take?',
    a: 'Between 1.5 and 3 hours depending on breed, coat type and temperament. Smaller short-haired dogs are quicker. Large breeds with thick coats take longer. Your groomer will give you a time estimate when they arrive.',
  },
  {
    q: 'What if my dog is anxious or has never been groomed before?',
    a: "Tell us when you book. We'll send a groomer who's experienced with anxious dogs and allow extra time. First sessions are always slower — we let the dog settle, start with the least invasive things, and take breaks when needed. Most dogs are significantly more relaxed by their second or third session.",
  },
  {
    q: 'How is this different from a salon?',
    a: "At a salon your dog is caged between steps, surrounded by other animals, and sharing one groomer's attention with multiple dogs. At home there's no travel stress, no cage, no other animals, and one groomer focused entirely on your dog for the whole session.",
  },
  {
    q: 'How often should I book?',
    a: "Depends on the breed. Short-haired dogs: every 6–8 weeks. Medium coats like Goldens: every 4–6 weeks. Double-coated breeds like Huskies: every 3–4 weeks. Continuously growing coats like Poodles or Shih Tzus: every 3–4 weeks for a bath, haircut every 6–8 weeks. In monsoon, bump all of these slightly more frequent.",
  },
  {
    q: 'What do you need from my flat to run a session?',
    a: "A tap — bathroom or balcony is fine — one working plug point for the dryer, and enough clear floor for the dog to stand and turn. That is genuinely it. The groomer arrives by two-wheeler with clippers, blades, dryer, shampoos, towels, mats and disposables in one kit. No van, no parking slot, no water connection of ours.",
  },
  {
    q: 'Does my housing society need to approve the groomer’s entry?',
    a: "In practice, no. A groomer arriving on foot with a shoulder bag is treated like any delivery or home-service visit at the gate — we have worked in large gated townships across Wakad, Kharadi, Ravet and NIBM without a single society objection. Some gates ask the resident to confirm on the intercom, so keep your phone nearby around the slot time.",
  },
  {
    q: 'Is tick and flea treatment included, or is it extra?',
    a: "A tick check is included in every session — the groomer inspects between the toes, inside the ears, along the jawline and under the tail before anything else starts. The treatment itself is an add-on at ₹149, and we only suggest it if we actually find something. Finding ticks and telling you costs nothing.",
  },
  {
    q: 'What happens if the groomer is running late?',
    a: "You get a call, not silence. Pune traffic being what it is, a groomer stuck between Hinjewadi and Kothrud at 6 PM will let the coordinator know and we pass it on with a revised arrival window. If the delay pushes past what works for you, we reschedule to another slot at no charge.",
  },
  {
    q: 'What is included in a dog spa bath in Pune, and how is it different from a dog haircut?',
    a: "A dog spa bath is our Spa Bath at ₹799 — premium shampoo, nourishing coat conditioner, deshedding and a full blow-dry to the skin, with nothing trimmed. A dog haircut is our Hair Cut at ₹999 — full body trimming or a full body haircut at a length you pick, finished with a loose-hair blow-out. Book both together as a dog full grooming session and it is ₹1299 rather than ₹1798.",
  },
  {
    q: 'What counts as dog basic grooming versus dog full grooming?',
    a: "Basic grooming is the bath side of the job: wash, conditioner, deshed, dry, plus nails, ears and a paw check. That is our ₹799 Spa Bath. Full grooming adds the haircut, which is our ₹1299 Spa Bath + Hair Cut. The distinction people miss is drying — some operators in this city sell a 'basic' that skips the blow-dry, and in Pune humidity an under-dried coat is the single most common cause of the skin problems we get called about.",
  },
  {
    q: 'Do you do a dog dry bath or waterless grooming?',
    a: "Not as a bookable package, and we would rather tell you why than take the money. A dry bath works foam or powder through the coat and brushes it out — it covers odour without removing what is causing it, and a coat that is never rinsed and dried properly in this climate is where fungal trouble begins. If your dog genuinely cannot be bathed right now — stitches, a frail senior, a skin condition your vet is treating — we will do a dry tidy-up inside a normal session rather than sell it as one.",
  },
  {
    q: 'How do I pick the best dog grooming service in Pune?',
    a: "Judge it on four things rather than on the word 'best'. Is the whole price published up front? Is a Saint Bernard charged the same as a Pug? Do they tell you which groomer is coming before he arrives? And will they refuse work your dog does not need — talking you out of shaving a double coat in April, for instance? A dog grooming service in Pune that clears all four is a safe booking. Ours are ₹799/₹999/₹1299 published, no size surcharge, groomer named at booking, and we refuse the shave.",
  },
  {
    q: 'Do you do senior dog grooming, and is it priced differently?',
    a: "Same three prices, a different session. Senior dog grooming means shorter standing time, breaks built in, non-slip matting underfoot, warm rather than hot water, and no position that forces a stiff hip or shoulder. Nails matter more than a tidy coat at this age, because an overgrown nail changes how an arthritic joint loads. Tell us about arthritis, heart or kidney conditions, or recent surgery at booking, and if a full groom looks like too much on the day we will do only what is needed and say so.",
  },
  {
    q: 'Do you groom independent houses and bungalows, or only apartments?',
    a: "Both, and bungalows are often easier — an outdoor tap and open space suit a large double-coated dog better than a flat bathroom does. What does change is the tick check: dogs with garden access and long grass need a more thorough inspection, and in areas with heavy tree cover the tick season runs longer than it does in the concrete parts of the city.",
  },
];

// ─── Reviews (pune-wide, mix of localities) ──────────────────────────────────

export const reviews = [
  {
    name: 'Priya Kulkarni',
    area: 'Wakad',
    pet: 'Bruno (Golden Retriever)',
    text: "Bruno used to get anxious at the salon — car rides, the cage, other dogs barking. The first home session he was a different dog. Calmer, finished faster, no drama. We've been booking monthly since.",
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    area: 'Kothrud',
    pet: 'Luna (Husky)',
    text: "I'd been told by another groomer that Luna needs to be shaved for summer. Sniffy explained why that's actually harmful and did a proper deshedding instead. The amount of fur that came out was unreal. She's been so much more comfortable since.",
    rating: 5,
  },
  {
    name: 'Sneha Joshi',
    area: 'NIBM',
    pet: 'Coco (Shih Tzu)',
    text: "Coco gets groomed every 4 weeks now. Before Sniffy I was going to a salon in Kondhwa which was a whole production every time. Now it happens at home while I'm working. Simpler, and Coco is way less stressed.",
    rating: 5,
  },
  {
    name: 'Amit Desai',
    area: 'Wagholi',
    pet: 'Max (Labrador)',
    text: "Honest, punctual, does a good job. Max smells great for weeks after a session. The groomer noticed a small skin irritation we hadn't spotted and flagged it. That kind of attention you don't get at a busy salon.",
    rating: 5,
  },
];
