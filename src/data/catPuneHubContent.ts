/**
 * catPuneHubContent — copy for the /cat-grooming-in-pune hub page.
 * See src/data/puneHubContent.ts for why this is a separate data-only module.
 */

import { ALL_CAT_PUNE_CITIES } from './puneLocalities';
import { RATING_DISPLAY, REVIEW_COUNT } from './reputation';

// ─── Stats ──────────────────────────────────────────────────────────────────

export const stats = [
  { number: '800+',  label: 'Cat grooming sessions in Pune' },
  { number: RATING_DISPLAY, label: `Average of ${REVIEW_COUNT} Google reviews` },
  { number: String(ALL_CAT_PUNE_CITIES.length), label: 'Areas covered across Pune' },
  { number: '₹799',  label: 'Starting price per session' },
];

// ─── Why sections ────────────────────────────────────────────────────────────

/** Story-section shape — see the note on `whySections` in puneHubContent.ts. */
export const whySections = [
  {
    heading: 'Cats and salons are a genuinely bad combination',
    subheading: 'A cat has one territory, and the salon is not it.',
    paragraphs: [
      "A dog will walk into a grooming salon and adapt, more or less. A cat won't. Cats are territorial — they have a home, they know it intimately, and everywhere else is a threat. The smell of other animals, the cage time between steps, the unfamiliar humans — a salon visit stresses a cat in ways that last for hours or days after. At-home grooming removes the entire problem. Your cat is in its territory, with its familiar smells and safe spaces nearby. The session goes better. The cat recovers immediately. Everyone has a better time.",
    ],
    eyebrow: 'At your doorstep',
    icon: 'home' as const,
    image: '/images/grooming-session-1.jpg',
    imageAlt: 'Cat grooming at home in Pune',
    imageLeft: true,
  },
  {
    heading: 'Pune\'s climate creates real coat and skin problems for indoor cats',
    subheading: 'Indoors is not the same as protected.',
    paragraphs: [
      "The dust from construction and traffic settles on indoor cat coats year-round. In summer, the heat increases coat oiliness and skin issues. In monsoon, inadequate drying leads to fungal problems. Persians and longhair cats get mats within weeks in Pune's humidity without regular professional care. Our sessions are designed around these specific conditions — deep conditioning washes that address environmental buildup, seasonal product adjustments, and groomer observations about coat and skin health at every visit.",
    ],
    eyebrow: 'Pune seasons',
    icon: 'season' as const,
    image: '/images/grooming-session-2.jpg',
    imageAlt: 'Cat coat care in Pune apartment',
    imageLeft: false,
  },
  {
    heading: 'Most salons are dog operations that tolerate cats. We\'re different.',
    subheading: 'Different chemistry, different handling, different training.',
    paragraphs: [
      "Walk into most Pune pet salons and the setup, the products, and the handling training are all built for dogs. Cats get fitted into the same approach, which is why so many cat owners report bad grooming experiences. Cat grooming requires a completely different product chemistry (cats can be harmed by dog shampoo), completely different restraint technique (low-restraint, reading body language), and a level of patience that most busy salons can't offer. Our groomers are trained specifically for cats — not as an afterthought.",
    ],
    eyebrow: 'Cat grooming',
    icon: 'cat' as const,
    image: '/images/grooming-session-3.jpg',
    imageAlt: 'Cat-specific grooming technique Pune',
    imageLeft: true,
  },
  {
    heading: 'Persian and Maine Coon grooming is its own category in this city',
    subheading: 'Longhair cats mat faster in Pune humidity than most owners expect.',
    paragraphs: [
      "Persians, Himalayans, Maine Coons and the semi-longhair mixes increasingly common in Pune societies share one problem here: a coat built for a cooler, drier climate than the one it's actually living in. We get called out constantly for Persian cat grooming and Maine Coon grooming across the city, almost always because a coat that looked fine in April has matted badly by July. A proper session for these breeds is built around de-matting and a full undercoat comb-out, not just a bath — and where the coat has already packed down against the skin, a lion cut is the honest answer rather than an hour of painful brushing.",
    ],
    link: {
      href: '/blogs/persian-cat-matting-pune-humidity',
      label: 'Why Persian coats mat so fast in Pune humidity',
    },
    eyebrow: 'Persian & Maine Coon',
    icon: 'cat' as const,
    image: '/images/grooming-session-4.jpg',
    imageAlt: 'Persian and Maine Coon cat grooming at home in Pune',
    imageLeft: false,
  },
  {
    heading: 'Indoor shorthair and desi cat grooming: less than most owners assume',
    subheading: "Not every cat in Pune needs a bath — a lot of them just need nails and ears.",
    paragraphs: [
      "A good number of calls we get are from owners of indoor shorthairs and desi cats asking, honestly, whether their cat needs professional grooming at all. Often the real answer is no — a healthy shorthair self-grooms well, and nail trims and an ear check every few weeks cover most of what's needed. Where it does matter is claws (the dew claw especially, which self-grooming never reaches), ticks if the cat has any access to a building's garden or parking, and the odd senior cat who's quietly stopped grooming its own back half. We'll tell you honestly when a full session isn't warranted rather than sell you one anyway.",
    ],
    link: {
      href: '/blogs/do-cats-need-professional-grooming',
      label: 'Does your cat actually need a groomer?',
    },
    eyebrow: 'Indoor & desi cats',
    icon: 'home' as const,
    image: '/images/grooming-session-1.jpg',
    imageAlt: 'Indoor shorthair and desi cat grooming in Pune',
    imageLeft: true,
  },
  {
    heading: 'Gentle, sedation-free cat grooming across Pune homes',
    subheading: 'No scruffing, no sedatives — just a slower session and a cat who can walk away.',
    paragraphs: [
      "Owners searching for stress-free cat grooming or gentle cat grooming near me in Pune are almost always describing a bad previous experience — a salon that scruffed the cat, held it down, or suggested sedation to get through a session. We never sedate cats for grooming; that's a veterinary decision, not something to happen on your living room floor. What we do instead is slower and less dramatic: short holds instead of long ones, a room the cat can retreat from at any point, and a session split across two visits if that's genuinely what a particular cat needs. It costs more patience, not more money.",
    ],
    link: {
      href: '/blogs/cat-grooming-without-sedation',
      label: "We don't sedate cats for grooming — here's what we do instead",
    },
    eyebrow: 'Stress-free grooming',
    icon: 'trust' as const,
    image: '/images/grooming-session-2.jpg',
    imageAlt: 'Stress-free, sedation-free cat grooming in a Pune home',
    imageLeft: false,
  },
  {
    heading: "Same-day cat grooming, when the mats can't wait",
    subheading: "A tight schedule shouldn't mean choosing between waiting and a shaved cat.",
    paragraphs: [
      "Cat grooming near me searches tend to come from a more urgent place than dog ones — a mat that's suddenly visible, a smell, guests arriving, a vet appointment that flagged something. Same-day cat grooming slots are available across most of the localities we cover, and booking takes under a minute on this page. If the coat has already matted badly, say so at booking rather than at the door — the groomer plans for a longer, more careful de-matting session instead of arriving expecting a routine bath.",
    ],
    eyebrow: 'Booking speed',
    icon: 'calendar' as const,
    image: '/images/grooming-session-3.jpg',
    imageAlt: 'Same-day cat grooming booking across Pune',
    imageLeft: true,
  },
  {
    heading: 'Cat grooming across Pimpri-Chinchwad, not just Pune city',
    subheading: 'Wakad, Ravet, Kalewadi and the rest of PCMC get the same cat-trained groomers.',
    paragraphs: [
      "Pimpri-Chinchwad runs its own municipal corporation, and cat owners searching for cat grooming in PCMC or pet grooming in Pimpri-Chinchwad sometimes assume a Pune-based service won't actually reach them. We cover Wakad, Ravet, Kalewadi and the wider Pimpri-Chinchwad belt with the same cat-trained groomers, the same low-restraint handling, and the same ₹799/₹999/₹1299 pricing we run in Kothrud or Baner. If a previous provider told you cat grooming 'doesn't cover' your PCMC society, that's not a limit we work with.",
    ],
    eyebrow: 'Pimpri-Chinchwad',
    icon: 'services' as const,
    image: '/images/grooming-session-4.jpg',
    imageAlt: 'Cat grooming service in Pimpri-Chinchwad PCMC',
    imageLeft: false,
  },
  {
    heading: 'Cat shedding, hairballs and the quiet reason Pune owners book a groom',
    subheading: 'A lot of hairballs and sofa fur is a grooming problem before it is a health one.',
    paragraphs: [
      "Cat owners in Pune often ask about hairballs and heavy shedding long before they ask about grooming. A cat swallows loose fur every time it washes itself, and a coat that sheds heavily or has started to mat gives it more to swallow. A proper deshedding session removes the loose undercoat before it ends up on your sofa or in a hairball on the bedroom floor. Longhairs benefit most, but shorthairs shed too, and a brush-through and bath done gently can make a visible difference for a few weeks.",
      "If a cat is bringing up hairballs very often, is not eating, or keeps retching, that is a conversation for your vet, not a groomer, and we say so. What grooming can do is cut down the loose fur, check the skin while it is there, and keep the coat from packing down in Pune's humid months. Cat parents in Koregaon Park, Viman Nagar and Kalyani Nagar book this kind of coat-maintenance visit before the weather turns.",
    ],
    link: {
      href: '/cat-grooming-in-pune/viman-nagar',
      label: 'See cat grooming at home in Viman Nagar',
    },
    eyebrow: 'Shedding & hairballs',
    icon: 'cat' as const,
    image: '/images/grooming-session-2.jpg',
    imageAlt: 'Deshedding cat grooming at home in Pune',
    imageLeft: true,
  },
  {
    heading: "What a first cat grooming visit looks like in your own flat",
    subheading: 'The cat stays in its own territory and sets the pace.',
    paragraphs: [
      "For a first-time cat grooming visit, we ask you to keep the cat in a quiet room and let the groomer come to them. The groomer sits at the cat's level, lets it sniff the tools, and starts with brushing and a nail trim before anything involving water. If a bath is part of the package, it is done in a warm bathroom with a non-slip mat and as little noise as possible. If the cat is clearly over it, the visit stops and resumes later; nobody is scruffed or held down to finish on schedule.",
      "Pick Spa Bath at ₹799, Hair Cut at ₹999 or Spa Bath + Hair Cut at ₹1299, and tell us the breed, coat length and whether there are mats when you book. Owners in Baner, Aundh and Hinjewadi flats with balcony nets and multiple cats often ask us to start with the calmest cat so the others can watch. It works better than you would expect.",
    ],
    link: {
      href: '/cat-grooming-in-pune/baner',
      label: 'See cat grooming at home in Baner',
    },
    eyebrow: 'What to expect',
    icon: 'home' as const,
    image: '/images/grooming-session-3.jpg',
    imageAlt: 'First cat grooming visit at home in a Pune flat',
    imageLeft: false,
  },
];

// ─── Reviews ────────────────────────────────────────────────────────────────

export const reviews = [
  {
    name: 'Ananya Kulkarni',
    area: 'Kothrud',
    pet: 'Mochi (Persian)',
    text: "Mochi used to hide under the bed for two days after a salon visit. The first home session she was back to normal within the hour. The groomer just understood cats — the whole approach was different. Monthly bookings now.",
    rating: 5,
  },
  {
    name: 'Rohan Desai',
    area: 'Wakad',
    pet: 'Simba (Maine Coon)',
    text: "Simba is big, confident, and has strong opinions about being groomed. The groomer handled him like she'd met a hundred Simba-types before — unhurried, reading him accurately, completing the whole session without drama. Excellent.",
    rating: 5,
  },
  {
    name: 'Preethi Nair',
    area: 'Baner',
    pet: 'Chai (tabby rescue)',
    text: "Chai came from the street two years ago and has always been cautious of strangers. I honestly expected the session to fail halfway. The groomer let Chai approach her first, worked so slowly and calmly, and finished everything. I couldn't believe it.",
    rating: 5,
  },
  {
    name: 'Vikram Rao',
    area: 'Koregaon Park',
    pet: 'Duchess and Earl (Persians)',
    text: "Two Persians done back to back in one home visit. Both properly de-matted, conditioned, nails trimmed, ears cleaned. The quality was genuinely show-standard. I've recommended Sniffy to everyone in my building with cats.",
    rating: 5,
  },
];

// ─── FAQs ────────────────────────────────────────────────────────────────────

export const faqs = [
  {
    q: 'Do you cover all areas of Pune for cat grooming?',
    a: "We cover 33 localities including Wakad, Wagholi, Kothrud, Shivajinagar, Kondhwa, NIBM, Dhanori, Pimpri-Chinchwad, Baner, Kharadi, Kalyani Nagar, Viman Nagar, Hadapsar, Koregaon Park, Camp, and more. Click your area on this page to see its dedicated page.",
  },
  {
    q: 'What does a cat grooming session include?',
    a: 'Bath with cat-specific shampoo and conditioner, blow-dry on low heat, brushing and de-matting, nail trimming (front and back), ear cleaning, eye area wipe, and a coat condition assessment. Haircuts like lion cuts are available as an add-on — mention it at booking.',
  },
  {
    q: 'My cat has never been groomed professionally — will it go okay?',
    a: "First sessions are always slower and more exploratory. We let the cat investigate the tools and the groomer at their own pace, take breaks when needed, and never rush a step. It won't be perfect but it will be a gentle introduction — and each subsequent session goes more smoothly.",
  },
  {
    q: 'How is cat grooming different from dog grooming?',
    a: 'Cats require pH-balanced cat-specific shampoo (dog shampoo can be toxic to cats), low-restraint handling techniques, different drying approaches, and significantly more patience with session pacing. Our groomers are trained specifically for cat handling — not dog groomers who occasionally take cat bookings.',
  },
  {
    q: 'My cat bites and scratches — can you still groom them?',
    a: "Often yes. We use low-restraint techniques and read cat body language carefully. If a cat is genuinely distressed we pause and resume when they're ready. We never force a step. In some cases a complete session takes more than one visit — we communicate this honestly.",
  },
  {
    q: 'How often should I book for my cat?',
    a: 'Shorthair cats every 8–10 weeks. Longhair breeds like Persians and Maine Coons every 4–6 weeks to prevent matting. Outdoor cats every 4–6 weeks with a tick check. In monsoon season, all frequencies move slightly closer together because humidity accelerates coat problems.',
  },
  {
    q: 'Do you offer lion cuts and breed trims as part of the service?',
    a: "Yes — lion cuts and breed trims are available as add-ons. They're most useful for Persians who are mat-prone or whose owners can't maintain the full coat between sessions. Mention it when booking so we can plan enough time.",
  },
  {
    q: 'What does a cat spa bath in Pune include, and how does a cat haircut differ?',
    a: "A cat spa bath is our Spa Bath at ₹799 — cat-formulated shampoo, conditioner, a comb-out and a low-heat blow-dry, with nothing clipped. A cat haircut is our Hair Cut at ₹999 and covers full body trims and lion cuts, cut to the length you ask for. Booked together as cat full grooming it is ₹1299 instead of ₹1798. Nails, ear cleaning and an eye-area wipe are in every package rather than charged on top.",
  },
  {
    q: 'What is the difference between cat basic grooming and cat full grooming?',
    a: "Cat basic grooming is the ₹799 Spa Bath — wash, condition, de-shed, comb out and dry, plus nails and ears. Cat full grooming is the ₹1299 Spa Bath + Hair Cut, which adds the clip and is what most Persian and Maine Coon owners actually need once a coat has started packing down. For a healthy indoor shorthair, basic is usually all that is warranted, and we will tell you so rather than upsell the haircut.",
  },
  {
    q: 'Can you do a cat dry bath or waterless grooming instead?',
    a: "We do not sell it as a package. A dry bath brushes foam or powder through the coat, which suits cats in theory because so many hate water — but it leaves the residue your cat then swallows while self-grooming, and it does nothing for a coat that is already matting. Where a cat genuinely should not be bathed — post-surgery, kidney disease, a very frail senior, late pregnancy — we do a dry clean-up and a full comb-out within the session, and we will tell you plainly that it is a holding measure.",
  },
  {
    q: 'How do I choose the best cat grooming service in Pune?',
    a: "The one thing that separates cat groomers from dog groomers taking cat bookings is whether they will stop. Ask what happens when the cat says no — if the answer involves scruffing, a bag or sedation, book elsewhere. Then ask whether products are cat-formulated, since dog shampoo and permethrin tick treatments are genuinely dangerous to cats. Published pricing and a named groomer are the easy checks; the willingness to abandon a step is the real one.",
  },
  {
    q: 'Do you groom senior cats, and does it cost more?',
    a: "Same ₹799/₹999/₹1299 pricing, a gentler session. Senior cat grooming means shorter working time, more breaks, a warm room, and no handling that forces an arthritic hip. Older cats stop wearing their claws down and the outer ones curl into the pad, so nail work often matters far more than the coat does. Tell us about kidney disease, hyperthyroidism, heart conditions or a recent vet visit at booking — it changes how long we keep a cat wet, not whether we will come.",
  },
  {
    q: 'Do you sedate cats for grooming?',
    a: "No, never. Sedation is a veterinary decision made by a vet who has examined the animal, not something a groomer should be administering in your living room. If a cat is so distressed or so severely matted that a session genuinely cannot be completed awake, we stop and tell you to speak to your vet about a sedated groom at their clinic. We would rather lose the booking than misuse a sedative.",
  },
  {
    q: 'How young can a kitten be groomed?',
    a: "Around four months, and the first visit should be an introduction rather than a full groom — handling the paws, a comb through, the sound of the clipper from across the room, and that is often enough. Kittens under twelve weeks are still regulating their own body temperature poorly, so a full bath and dry is a genuine risk rather than a cosmetic choice.",
  },
  {
    q: 'My cat is indoor-only and has never been bathed. Does she even need it?',
    a: "Often less than you would think for a shorthair — cats self-groom efficiently, and a healthy indoor shorthair may only need nail trims and a comb-out. Longhairs are the exception: self-grooming does not reach a packed undercoat, and a Persian left to manage alone will mat regardless of how clean the house is. If your cat is shorthaired and coping, we will tell you a full bath is unnecessary.",
  },
  {
    q: 'I have three cats. Can they all be done in one visit?',
    a: "Yes, but they are groomed one at a time in a closed room while the others stay elsewhere in the house. Cats read each other's stress, and a queue of cats watching the first one being bathed makes every session after it harder. Budget roughly an hour per cat, more for a matted longhair, and tell us the count at booking so the slot is long enough.",
  },
  {
    q: 'Can you groom a declawed, senior, or arthritic cat?',
    a: "Yes, with a lighter touch and no positioning that forces a stiff joint. Declawed cats often dislike having their front paws held longer than most, and senior cats overheat and tire faster, so sessions are shorter and split across more breaks. Tell us about kidney disease, heart conditions or a recent vet visit at booking — it changes how long we keep a cat wet, not whether we will come.",
  },
];
