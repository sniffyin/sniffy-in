import type { LocationConfig } from '../components/location/LocationHero';
import type { LocationReview } from '../components/location/LocationReviews';
import type { FAQ } from '../components/location/LocationFAQs';

// ─── All Pune localities for cat grooming pages ────────────────────────────

export const ALL_CAT_PUNE_CITIES: { name: string; slug: string }[] = [
  { name: 'Dhanori',           slug: 'cat-grooming-in-pune/dhanori' },
  { name: 'Wagholi',           slug: 'cat-grooming-in-pune/wagholi' },
  { name: 'Kalyani Nagar',     slug: 'cat-grooming-in-pune/kalyani-nagar' },
  { name: 'Lohegaon',          slug: 'cat-grooming-in-pune/lohegaon' },
  { name: 'Kharadi',           slug: 'cat-grooming-in-pune/kharadi' },
  { name: 'Viman Nagar',       slug: 'cat-grooming-in-pune/viman-nagar' },
  { name: 'Mundwa',            slug: 'cat-grooming-in-pune/mundwa' },
  { name: 'Koregaon Park',     slug: 'cat-grooming-in-pune/koregaon-park' },
  { name: 'Kothrud',           slug: 'cat-grooming-in-pune/kothrud' },
  { name: 'Shivajinagar',      slug: 'cat-grooming-in-pune/shivajinagar' },
  { name: 'Dhayari',           slug: 'cat-grooming-in-pune/dhayari' },
  { name: 'Karve Nagar',       slug: 'cat-grooming-in-pune/karve-nagar' },
  { name: 'Ambegaon',          slug: 'cat-grooming-in-pune/ambegaon' },
  { name: 'Baner',             slug: 'cat-grooming-in-pune/baner' },
  { name: 'Bavdhan',           slug: 'cat-grooming-in-pune/bavdhan' },
  { name: 'Wakad',             slug: 'cat-grooming-in-pune/wakad' },
  { name: 'Pimpri-Chinchwad',  slug: 'cat-grooming-in-pune/pimpri-chinchwad' },
  { name: 'Khadki',            slug: 'cat-grooming-in-pune/khadki' },
  { name: 'Ravet',             slug: 'cat-grooming-in-pune/ravet' },
  { name: 'Aundh',             slug: 'cat-grooming-in-pune/aundh' },
  { name: 'Kalewadi',          slug: 'cat-grooming-in-pune/kalewadi' },
  { name: 'Kondhwa',           slug: 'cat-grooming-in-pune/kondhwa' },
  { name: 'NIBM',              slug: 'cat-grooming-in-pune/nibm' },
  { name: 'Katraj',            slug: 'cat-grooming-in-pune/katraj' },
  { name: 'Handewadi',         slug: 'cat-grooming-in-pune/handewadi' },
  { name: 'Hadapsar',          slug: 'cat-grooming-in-pune/hadapsar' },
  { name: 'Bibewadi',          slug: 'cat-grooming-in-pune/bibewadi' },
  { name: 'Camp',              slug: 'cat-grooming-in-pune/camp' },
  { name: 'Wanowrie',          slug: 'cat-grooming-in-pune/wanowrie' },
];

function otherCities(currentSlug: string) {
  return ALL_CAT_PUNE_CITIES.filter((c) => c.slug !== currentSlug);
}

// ════════════════════════════════════════════════════════════
// DHANORI
// ════════════════════════════════════════════════════════════

export const dhanoriCatLocation: LocationConfig = {
  name: 'Dhanori',
  slug: 'cat-grooming-in-pune/dhanori',

  heroH1: 'Cat Grooming at Home in Dhanori — No Carrier, No Stress',
  heroSubtext:
    'Your cat hates the carrier and the salon waiting room. We get it. Sniffy brings a trained cat groomer to your home in Dhanori — familiar surroundings, one-on-one attention, and a session that actually goes smoothly.',

  storySections: [
    {
      heading: 'Why Dhanori Cat Parents Are Switching to At-Home Grooming',
      subheading: 'The carrier struggle is real.',
      paragraphs: [
        'Anyone who has tried getting a cat into a carrier knows how that usually goes. The hiding under the bed, the yowling in the auto, the panicked state at the salon surrounded by dogs and strangers. For most cats, a salon trip is a genuinely unpleasant experience. Dhanori\'s busy residential pockets near Porwal Road and Kalas have a growing community of cat parents who\'ve started asking — is there a better way? At-home grooming in Dhanori answers that question cleanly. Your cat stays in its territory, the groomer arrives with everything, and the session happens in a controlled, quiet setting.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Dhanori Pune',
      imageLeft: true,
    },
    {
      heading: 'Pune\'s Weather is Harder on Cats Than Most People Realise',
      subheading: 'Dust, humidity, and shedding — handled.',
      paragraphs: [
        'Dhanori\'s construction dust and Pune\'s alternating dry and humid seasons create real coat and skin issues for indoor cats. Persian and semi-longhair cats in particular tend to develop mats quickly during humid months. Our grooming sessions address this with proper de-matting, deep conditioning washes, and undercoat removal appropriate to the season. We also do a full ear check and skin inspection — things that rarely happen at busy salons.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat grooming setup at home in Dhanori',
      imageLeft: false,
    },
    {
      heading: 'Senior Cats and Nervous Cats Need Extra Patience',
      subheading: 'We have plenty of it.',
      paragraphs: [
        'Older cats often have joint stiffness, sensitive skin, or simply don\'t tolerate being held the way they used to. Anxious cats can bite or scratch when overwhelmed. Our groomers are trained in low-restraint handling techniques — we let the cat lead the pace, take breaks when needed, and never rush a step. The goal is a complete grooming session that the cat tolerates without trauma. That\'s only consistently possible in a calm home environment.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Gentle senior cat grooming at home in Dhanori',
      imageLeft: true,
    },
    {
      heading: 'Everything\'s Included — No Hidden Extras',
      subheading: 'You know exactly what you\'re paying for.',
      paragraphs: [
        'Our cat grooming packages clearly list what\'s included — bath with cat-specific shampoo and conditioner, blow-dry on low heat, brushing and de-matting, nail trimming, ear cleaning, and sanitary trim. No surprise charges at the end. No upselling once the groomer is inside. Just honest, professional cat grooming at home in Dhanori.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy well-groomed cat in Dhanori home',
      imageLeft: false,
    },
    {
      heading: 'Cat Breeds We Groom in Dhanori',
      subheading: 'Every coat is different. We know them all.',
      paragraphs: [
        'Dhanori\'s cat community is a lovely mix. We regularly groom Persians in the newer apartment blocks, domestic Indies in older housing, and everything from Maine Coons to British Shorthairs. Here\'s how we approach the most common breeds we meet in Dhanori:',
      ],
      bullets: [
        'Persian cat grooming in Dhanori — Those luxurious coats need section-by-section attention to avoid painful matting. We use a detangling spray, work slowly through problem areas, and finish with a comb-through that leaves the coat light and mat-free.',
        'Indie cat grooming in Dhanori — Street-rescue Indies often have sensitive skin, flea histories, and irregular coats. We do a thorough inspection, use a mild medicated or anti-parasitic shampoo if needed, and handle them with extra patience since many aren\'t used to being groomed.',
        'British Shorthair grooming in Dhanori — Dense plush coats need a good de-shed treatment. We use a slicker brush and deshedding comb, followed by a conditioning wash that keeps that signature plush texture intact.',
        'Maine Coon grooming in Dhanori — The semi-long coat and ear tufts need regular brushing to prevent mats. We pay extra attention to the ruff, belly, and tail — the three areas most prone to tangling in Pune\'s humidity.',
        'Siamese and Oriental cat grooming in Dhanori — Short, low-maintenance coats, but Siamese cats can be very vocal and opinionated about being handled. Our groomers are used to the commentary. We work quickly and efficiently while keeping them calm.',
      ],
      closingLine: 'Any cat breed or mix is welcome — we\'ll figure out the right approach once we\'re with your cat.',
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat breed grooming in Dhanori Pune',
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/dhanori'),
  nearbyAreas: ['Porwal Road', 'Lohegaon', 'Kalas', 'Viman Nagar', 'Yerawada', 'Wadgaon Sheri', 'Tingre Nagar', 'Kalyani Nagar'],
};

export const dhanoriCatMapEmbed = 'https://www.google.com/maps?q=Dhanori,Pune&output=embed';

export const dhanoriCatReviews: LocationReview[] = [
  {
    petName: 'Mitthu',
    ownerName: 'Priya Kulkarni',
    area: 'Porwal Road',
    review: 'Mitthu is a 7-year-old Persian and getting her groomed used to be a full-day ordeal. The carrier, the yowling, the stressed-out cat for two days after. The first time I tried home grooming I honestly wasn\'t sure it would work. But the groomer was incredibly patient — she let Mitthu sniff everything before starting and didn\'t rush a single step. The coat came out beautifully detangled and Mitthu was back to normal by evening.',
    rating: 5,
  },
  {
    petName: 'Billu',
    ownerName: 'Rahul Pawar',
    area: 'Dhanori Gaon',
    review: 'Billu is a rescue Indie who had never been properly bathed. I was worried he\'d claw everything up. The groomer came fully prepared with calming techniques and handled him very gently. He hissed twice and then just... accepted it. Nails are trimmed, ears are clean, coat looks great. Will definitely book again.',
    rating: 5,
  },
];

export const dhanoriFAQsCat: FAQ[] = [
  {
    question: 'My cat has never been groomed before — will this go okay?',
    answer: 'First-time grooming sessions are always slower and more exploratory. We let the cat sniff the tools, get comfortable with the groomer, and we take breaks when needed. It won\'t be perfect but it will be a gentle introduction — far less overwhelming than a salon visit.',
  },
  {
    question: 'What shampoo do you use for cats?',
    answer: 'We use pH-balanced cat-specific shampoos — not diluted dog shampoo, not human products. For cats with sensitive skin, flea history, or skin conditions, we carry appropriate alternatives. Just let us know when booking.',
  },
  {
    question: 'How do you handle a cat that bites or scratches?',
    answer: 'We use low-restraint techniques and read the cat\'s body language carefully. If a cat is truly distressed we stop, allow them to settle, and resume. We never force a step. In some cases a full session may not be possible in one visit — we\'ll always communicate that honestly.',
  },
  {
    question: 'Do I need to be home during the session?',
    answer: 'Yes, the pet owner or a trusted adult should be present throughout. This helps the cat feel more secure and means someone familiar can reassure them during tense moments.',
  },
  {
    question: 'How often does a cat need professional grooming?',
    answer: 'Shorthair cats can go 8–10 weeks between sessions. Longhair breeds like Persians and Maine Coons ideally every 4–6 weeks to prevent matting. If your cat sheds heavily or goes outdoors, more frequent sessions help a lot.',
  },
];

// ════════════════════════════════════════════════════════════
// KONDHWA
// ════════════════════════════════════════════════════════════

export const kondhwaCatLocation: LocationConfig = {
  name: 'Kondhwa',
  slug: 'cat-grooming-in-pune/kondhwa',

  heroH1: 'Doorstep Cat Grooming in Kondhwa — Because Cats Hate Salons',
  heroSubtext:
    'Getting your cat groomed shouldn\'t involve a full mental preparation session. Sniffy\'s trained groomers come to your home in Kondhwa — equipment, shampoo, everything. Your cat never leaves its comfort zone.',

  storySections: [
    {
      heading: 'Cat Parents in Kondhwa Know This Pain',
      subheading: 'The salon trip nobody enjoys.',
      paragraphs: [
        'Kondhwa has grown into one of south Pune\'s most popular residential areas — compact apartments, gated communities, busy evenings. For the cat parents here, the traditional grooming salon model just doesn\'t fit. Auto rides with a yowling cat, waiting at a salon with dogs barking nearby, and then the two-day recovery period where your cat avoids you entirely. At-home cat grooming in Kondhwa eliminates every one of those steps. One groomer, your home, your cat in its own territory.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Kondhwa Pune',
      imageLeft: true,
    },
    {
      heading: 'Long-Haired Cats and Kondhwa\'s Climate Don\'t Mix Well Untreated',
      subheading: 'Regular grooming is maintenance, not luxury.',
      paragraphs: [
        'Kondhwa\'s humid summers create the perfect conditions for cat coat matting, especially in longhair breeds. Mats start small — a tangle behind the ear, a knot near the armpit — and quickly become solid, uncomfortable masses that pull the skin. Once mats develop, removal requires patience and skill. Our groomers are trained in de-matting without causing pain, and we catch problems early so they don\'t compound between sessions.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat de-matting grooming session in Kondhwa',
      imageLeft: false,
    },
    {
      heading: 'We Come Prepared for Every Type of Cat',
      subheading: 'Including the difficult ones.',
      paragraphs: [
        'Not every cat is cooperative. Some hiss. Some go limp. Some are perfectly fine until you touch their paws. Our groomers have encountered every variation of cat temperament and know how to adapt. We use low-restraint techniques, work in short segments for anxious cats, and never try to muscle through if a cat is genuinely distressed. A calm incomplete session is better than a traumatic complete one.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Patient cat grooming at home in Kondhwa',
      imageLeft: true,
    },
    {
      heading: 'Cat Breeds We See Most Often in Kondhwa',
      subheading: 'Every breed has its own grooming story.',
      paragraphs: [
        'Kondhwa has a solid community of cat parents — here\'s how we handle the breeds we most often groom here:',
      ],
      bullets: [
        'Persian cat grooming in Kondhwa — The king of high-maintenance coats. We section the coat, remove tangles patiently, do a deep hydrating wash, and finish with a comb-through. Persian coats in Pune need attention every 4–5 weeks to stay mat-free.',
        'Indie cat grooming in Kondhwa — Mixed-breed cats often have unpredictable temperaments and skin histories. We start with a gentle assessment, choose the right shampoo for their coat, and handle them at a pace they can accept.',
        'British Shorthair grooming in Kondhwa — Dense coats need proper deshedding, not just a regular wash. We use a deshedding brush before and after the bath to clear the undercoat and reduce home shedding significantly.',
        'Ragdoll cat grooming in Kondhwa — Semi-longhair coats that are prone to belly matting. We spend extra time on the undercarriage and inner legs where mats form most easily.',
      ],
      closingLine: 'Don\'t see your cat\'s breed? We groom all types — book and we\'ll figure out the right approach.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Cat breed grooming at home in Kondhwa',
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/kondhwa'),
  nearbyAreas: ['NIBM Road', 'Undri', 'Mohammadwadi', 'Wanowrie', 'Bibewadi', 'Katraj', 'Sus Road'],
};

export const kondhwaCatMapEmbed = 'https://www.google.com/maps?q=Kondhwa,Pune&output=embed';

export const kondhwaCatReviews: LocationReview[] = [
  {
    petName: 'Golu',
    ownerName: 'Swapna Joshi',
    area: 'Kondhwa Budruk',
    review: 'Golu is a 5-year-old Persian who had developed a nasty mat behind one ear that I couldn\'t deal with myself. I was nervous about booking because I thought the groomer might just cut it off. But she worked on it for about 20 minutes with detangler and came out with the mat intact. The full session went smoothly after that. Extremely happy with how the coat looks.',
    rating: 5,
  },
  {
    petName: 'Shadow',
    ownerName: 'Nikhil Mahajan',
    area: 'NIBM Road',
    review: 'Shadow is a rescue who was feral for the first two years of her life. She tolerates me but not strangers. The groomer\'s approach was very measured — low movement, quiet voice, didn\'t try to pick her up when she resisted. It took longer than a standard session but Shadow got through it. Considering her history, that\'s a huge win.',
    rating: 5,
  },
];

export const kondhwaFAQsCat: FAQ[] = [
  {
    question: 'Can you groom a cat that\'s semi-feral or has aggression issues?',
    answer: 'We can try, yes. We don\'t use heavy restraint and we won\'t force a session that\'s clearly causing distress. If your cat has a history of aggression, let us know in advance so we can plan for more time and bring appropriate supplies.',
  },
  {
    question: 'My Persian has a bad mat near the skin — can it be removed without shaving?',
    answer: 'Often yes, if we catch it early enough. Tight skin-level mats sometimes do need to be carefully cut, but in many cases patient work with a detangler and a mat comb can remove them intact. We\'ll always try the non-cutting approach first.',
  },
  {
    question: 'Do you give cats a haircut or just a bath and brush?',
    answer: 'Both options are available. Our standard session includes bath, brush, nail trim and ear clean. Haircuts — lion cuts, sanitary trims, and breed cuts — are available as add-ons. Mention it at booking.',
  },
  {
    question: 'What happens if my cat escapes or hides during the session?',
    answer: 'It happens. We wait, give the cat space to settle, and continue when they\'re ready. If the cat hides and won\'t come out, we\'ll do what we can and come back for the rest at no extra charge for the return visit.',
  },
];

// ════════════════════════════════════════════════════════════
// KOTHRUD
// ════════════════════════════════════════════════════════════

export const kothrudCatLocation: LocationConfig = {
  name: 'Kothrud',
  slug: 'cat-grooming-in-pune/kothrud',

  heroH1: 'At-Home Cat Grooming in Kothrud — Calm Sessions, Properly Done',
  heroSubtext:
    'Kothrud\'s cat community deserves better than the carrier-and-salon routine. Sniffy sends a trained groomer to your home — full setup, cat-appropriate products, and a patient approach that actually gets the job done.',

  storySections: [
    {
      heading: 'Kothrud Cat Owners Know Their Cats Are Particular',
      subheading: 'Cats don\'t adapt to new environments — so we adapt to theirs.',
      paragraphs: [
        'Kothrud has a long-established residential character — a mix of older bungalows, new apartment complexes, and everything in between. The cats here are well-loved and often quite particular about their routines. Any disruption — a carrier, a car ride, a clinic smell — can unsettle them for days. At-home cat grooming in Kothrud means the session happens in the cat\'s own space, with its own smells and sounds around it. That\'s not a small thing. It\'s the single biggest factor in whether a grooming session goes well or falls apart.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Kothrud Pune',
      imageLeft: true,
    },
    {
      heading: 'Proper Cat Grooming Is More Than a Bath',
      subheading: 'What actually goes into a complete session.',
      paragraphs: [
        'A lot of cat owners assume cat grooming means a quick wash and dry. A proper session covers far more — nail trimming (front and back), ear cleaning, eye area wiping, sanitary trim for longhair cats, de-matting if needed, and a full coat condition assessment. Our groomers are trained to spot early signs of ear infections, skin irritation, and other issues during the session, which is something a rushed salon visit rarely catches.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Thorough cat grooming in Kothrud home',
      imageLeft: false,
    },
    {
      heading: 'The Breeds We Groom Most in Kothrud',
      subheading: 'Same neighbourhood, very different coats.',
      paragraphs: [
        'Kothrud has a wide variety of cats — from show-quality Persians to much-loved Indies. Here\'s what we see most often and how we handle them:',
      ],
      bullets: [
        'Persian cat grooming in Kothrud — Long, flowing coats that need weekly brushing at home and a proper professional session every 4–6 weeks. We do a full section-by-section detangle, hydrating bath, and low-heat blow dry that keeps the coat fluffy without frizz.',
        'Indie cat grooming in Kothrud — Domestic Indies are hardy but still benefit enormously from regular grooming. A good deshedding bath, nail trim, and ear check every 6–8 weeks makes a visible difference in coat health and reduces what you find on your sofa.',
        'Siamese cat grooming in Kothrud — Short, sleek coats that\'re easy to manage, but Siamese are famously opinionated about being handled. We keep sessions brisk and efficient to match their low tolerance for standing still.',
        'Himalayan cat grooming in Kothrud — Similar coat needs to Persians with the added challenge of a flat face that needs careful eye area cleaning. We use gentle wipes around the facial folds and are thorough without being rough.',
      ],
      closingLine: 'Any breed, any temperament — we\'ll work with what your cat gives us.',
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Persian cat being groomed at home in Kothrud',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/kothrud'),
  nearbyAreas: ['Karve Nagar', 'Warje', 'Bavdhan', 'Erandwane', 'Paud Road', 'Deccan', 'Shivajinagar'],
};

export const kothrudCatMapEmbed = 'https://www.google.com/maps?q=Kothrud,Pune&output=embed';

export const kothrudCatReviews: LocationReview[] = [
  {
    petName: 'Fulki',
    ownerName: 'Anagha Deshpande',
    area: 'Paud Road',
    review: 'Fulki is 9 years old and has arthritis in her back legs. Lifting her into a carrier used to cause her real pain and I\'d given up on professional grooming for two years. The home groomer handled her so carefully — kept her lying down for most of the session, worked around her mobility issues, and still managed a complete bath, brush and nail trim. Fulki\'s coat is in the best condition it\'s been in years.',
    rating: 5,
  },
  {
    petName: 'Phantom',
    ownerName: 'Rohan Kulkarni',
    area: 'Karve Nagar',
    review: 'Phantom is a black Maine Coon mix who is, frankly, enormous and quite dramatic about grooming. The groomer took it completely in stride — let him hiss, waited, continued. The whole session took almost 2 hours but it was done properly. No rushing, no shortcuts. Very professional.',
    rating: 5,
  },
];

export const kothrudFAQsCat: FAQ[] = [
  {
    question: 'My cat has mobility issues — can you still groom her at home?',
    answer: 'Yes, and this is actually one of the strongest arguments for at-home grooming. We can position the cat on a soft surface, work with their mobility limitations, and avoid any postures that cause discomfort. Arthritic and disabled cats are much better served at home than at a salon.',
  },
  {
    question: 'Do you use a hair dryer on cats? She\'s terrified of the noise.',
    answer: 'We use a low-noise dryer on the lowest heat setting, held at a distance. For cats who are very dryer-anxious, we can towel-dry most of the way and use the dryer minimally at the end. Let us know at booking and we\'ll plan around it.',
  },
  {
    question: 'Can you do a lion cut for my Persian?',
    answer: 'Yes, lion cuts are available as an add-on to the standard grooming package. They\'re often recommended for heavily matted Persians or cats who struggle with coat maintenance between sessions. Mention it when booking so we allocate enough time.',
  },
  {
    question: 'How do I prepare my home before the groomer arrives?',
    answer: 'Just a clear space in one room — bathroom, kitchen, or any area that can be wiped down easily. Some water access and a power outlet for the dryer. We bring the rest.',
  },
];

// ════════════════════════════════════════════════════════════
// NIBM
// ════════════════════════════════════════════════════════════

export const nibmCatLocation: LocationConfig = {
  name: 'NIBM',
  slug: 'cat-grooming-in-pune/nibm',

  heroH1: 'Cat Grooming at Home in NIBM — The Way Your Cat Actually Prefers',
  heroSubtext:
    'Cats are territorial creatures. They groom best at home. Sniffy brings the full grooming setup to your NIBM home — trained groomer, cat-specific products, and the patience that this actually requires.',

  storySections: [
    {
      heading: 'NIBM Has a Surprisingly Large Cat Community',
      subheading: 'And they all have the same problem.',
      paragraphs: [
        'NIBM\'s densely packed apartment buildings and quiet residential lanes are home to dozens of cat families. The same problem comes up again and again — finding a groomer who knows cats specifically, not just a dog salon that tolerates cats. Most grooming salons in Pune are dog-first environments. The smells, sounds, and handling styles there are built around dogs. Cats pick up on that immediately and their stress levels spike before anyone even touches them. At-home cat grooming in NIBM sidesteps the whole problem — your cat is home, the groomer comes to them.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat groomer visiting home in NIBM Pune',
      imageLeft: true,
    },
    {
      heading: 'Indoor Cats Still Need Regular Professional Grooming',
      subheading: 'Self-grooming only goes so far.',
      paragraphs: [
        'Cats are excellent self-groomers but there\'s a lot they simply can\'t handle alone — nail overgrowth, ear wax buildup, mats in hard-to-reach spots, and the ongoing shedding that fills your furniture. A professional session every 6–8 weeks handles all of this systematically and also gives us the chance to catch anything abnormal early — skin issues, lumps, ear problems — that you might miss at home.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Indoor cat grooming session in NIBM',
      imageLeft: false,
    },
    {
      heading: 'What We Bring to Every Session in NIBM',
      subheading: 'A complete, hygienic setup every time.',
      paragraphs: [
        'We don\'t arrive and ask to use your bathroom supplies. Every groomer comes with a full kit — cat-specific shampoo and conditioner, separate brushes and combs for different coat types, clean towels, a low-noise dryer, nail clippers, ear cleaning solution, and a portable grooming surface. Everything is cleaned between appointments. Your cat\'s session uses equipment that hasn\'t been used on another animal that day.',
      ],
      bullets: [
        'Separate shampoo formulas for longhair, shorthair, and sensitive skin cats',
        'Stainless steel nail clippers kept sharp and hygienic',
        'De-matting combs specifically designed for feline coat structures',
        'Low-noise, low-heat dryer suitable for anxious cats',
        'Ear cleaning solution safe for cats — not dog-formulated drops',
      ],
      closingLine: 'Everything brought to your door. Nothing improvised.',
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Professional cat grooming kit in NIBM home',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/nibm'),
  nearbyAreas: ['NIBM Road', 'Kondhwa', 'Undri', 'Wanowrie', 'Mohammadwadi', 'Bibewadi', 'Katraj'],
};

export const nibmCatMapEmbed = 'https://www.google.com/maps?q=NIBM,Pune&output=embed';

export const nibmCatReviews: LocationReview[] = [
  {
    petName: 'Cheeni',
    ownerName: 'Malvika Sinha',
    area: 'NIBM Road',
    review: 'I have two cats — Cheeni, a 4-year-old Persian, and a domestic shorthair rescue. I was sceptical that both could be done in one session but the groomer managed it really well, handling each of them differently based on temperament. Cheeni needed patient mat removal, the rescue needed a slow introduction. Both came out clean and neither was particularly traumatised. I\'ve booked monthly since.',
    rating: 5,
  },
  {
    petName: 'Leo',
    ownerName: 'Suhas Patil',
    area: 'Undri Road',
    review: 'Leo had an overgrown nail that had started to curl inward and I was too scared to deal with it myself. The groomer handled it very carefully and also checked if there was any injury underneath. There wasn\'t, thankfully. The full grooming session was also done well — Leo came out clean and calm, which is unusual for him.',
    rating: 5,
  },
];

export const nibmFAQsCat: FAQ[] = [
  {
    question: 'My cat has an ingrown or overgrown nail — can you handle that?',
    answer: 'Nail trimming is part of every session. If a nail has curled or grown into the pad, we handle it carefully and will let you know if it looks like there\'s been any injury that a vet should check. We won\'t attempt anything that requires veterinary intervention.',
  },
  {
    question: 'Can two cats be groomed in one visit?',
    answer: 'Yes, we can groom multiple cats in a single home visit. Back-to-back sessions are fine. Pricing is per cat. Just mention how many cats when booking so we can allocate enough time.',
  },
  {
    question: 'Should I feed my cat before the grooming session?',
    answer: 'A light meal a couple of hours before is fine. A very full cat may feel uncomfortable being handled, especially when being positioned for belly work or nail trimming. Avoid feeding right before the session.',
  },
  {
    question: 'My cat goes outdoors — how does that affect grooming frequency?',
    answer: 'Outdoor cats pick up significantly more dirt, debris, and parasites than indoor cats. We recommend grooming every 4–6 weeks for outdoor cats, plus tick checks at every session. Mention the outdoor access when booking so we can bring appropriate products.',
  },
];

// ════════════════════════════════════════════════════════════
// PIMPRI-CHINCHWAD
// ════════════════════════════════════════════════════════════

export const pimpriChinchwadCatLocation: LocationConfig = {
  name: 'Pimpri-Chinchwad',
  slug: 'cat-grooming-in-pune/pimpri-chinchwad',

  heroH1: 'Cat Grooming at Home in Pimpri-Chinchwad — Whole Area Covered',
  heroSubtext:
    'Whether you\'re in Pimpri, Chinchwad, Akurdi, Bhosari or anywhere in between — Sniffy sends a trained cat groomer to your door. No carrier drama, no salon stress. Just a calm, professional session at home.',

  storySections: [
    {
      heading: 'PCMC\'s Growing Cat Parent Community Finally Has an Option',
      subheading: 'At-home cat grooming built for this area.',
      paragraphs: [
        'Pimpri-Chinchwad has expanded rapidly and so has its pet-owning population. But grooming services in PCMC have mostly been dog-focused, leaving cat parents either making long trips to Pune city or attempting bathroom grooming sessions with mixed results. Sniffy covers all of Pimpri-Chinchwad for in-home cat grooming — trained groomers who understand feline behaviour, proper cat-specific products, and the patience required for animals who didn\'t ask to be bathed.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Pimpri-Chinchwad',
      imageLeft: true,
    },
    {
      heading: 'Industrial Air Quality in PCMC Affects Cat Coats More Than You\'d Think',
      subheading: 'Dust and particulates settle into fur.',
      paragraphs: [
        'Pimpri-Chinchwad\'s industrial zones and construction activity mean indoor cats in this area accumulate more airborne particulates in their coats than cats in quieter residential areas. Regular grooming — proper bathing with conditioning wash — clears this buildup and prevents skin irritation. It also reduces what your cat ingests during self-grooming, which matters particularly for cats near busy roads or industrial areas.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat bathing session at home in Pimpri',
      imageLeft: false,
    },
    {
      heading: 'Cat Breeds We Groom Across Pimpri-Chinchwad',
      subheading: 'Every coat, every temperament.',
      paragraphs: [
        'PCMC has a diverse cat community. Here\'s what we most commonly groom across this area:',
      ],
      bullets: [
        'Persian cat grooming in Pimpri-Chinchwad — Arguably the most popular cat breed in this area. Long coats that need constant attention — we provide structured de-matting, deep washing, and a proper finishing brush-through.',
        'Indie cat grooming in Pimpri-Chinchwad — Rescue and street-born Indies are common here. We handle them with extra patience, use mild shampoos suited to potentially sensitive skin, and work at a pace that keeps them as calm as possible.',
        'British Shorthair grooming in Pimpri-Chinchwad — Dense plush coats that shed heavily. Our deshedding treatment makes a real difference — most owners notice a significant reduction in shedding for 3–4 weeks afterward.',
        'Scottish Fold grooming in Pimpri-Chinchwad — The folded ears require careful cleaning since they\'re more prone to wax buildup. We clean gently and check for any signs of infection while we\'re in there.',
      ],
      closingLine: 'We cover all of Pimpri, Chinchwad, Akurdi, Bhosari, Nigdi and nearby areas.',
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Cat breed grooming at home in Pimpri-Chinchwad',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/pimpri-chinchwad'),
  nearbyAreas: ['Akurdi', 'Bhosari', 'Wakad', 'Ravet', 'Khadki', 'Nigdi', 'Moshi'],
};

export const pimpriChinchwadCatMapEmbed = 'https://www.google.com/maps?q=Pimpri-Chinchwad,Pune&output=embed';

export const pimpriChinchwadCatReviews: LocationReview[] = [
  {
    petName: 'Nemo',
    ownerName: 'Divya Salve',
    area: 'Chinchwad',
    review: 'I\'d been trying to find a proper cat groomer in PCMC for almost a year. Most places I called were dog salons that said they do cats but clearly didn\'t know what they were doing. The Sniffy groomer was completely different — immediately comfortable with Nemo, knew how to handle his resistance during nail trimming, and the whole session was calm and professional.',
    rating: 5,
  },
  {
    petName: 'Cleo',
    ownerName: 'Ajay Bhalekar',
    area: 'Akurdi',
    review: 'Cleo is a Persian with anxiety issues and honestly we\'d not had a successful grooming session in two years. The home groomer was so quiet and methodical — she let Cleo investigate everything before starting, worked through the mats without any rough handling, and Cleo actually sat through the whole bath. I was honestly shocked.',
    rating: 5,
  },
];

export const pimpriChinchwadFAQsCat: FAQ[] = [
  {
    question: 'Do you cover all parts of Pimpri-Chinchwad?',
    answer: 'Yes — Pimpri, Chinchwad, Akurdi, Bhosari, Nigdi, Moshi, Kasarwadi, Pimple Saudagar and surrounding areas. If you\'re in PCMC and aren\'t sure whether we cover your pincode, just message us.',
  },
  {
    question: 'What\'s the difference between cat grooming and dog grooming?',
    answer: 'Cats require different shampoo formulations (dog shampoo can be toxic to cats), different handling techniques (low-restraint, reading feline body language), different drying approaches (lower heat and noise), and significantly more patience. A groomer trained only on dogs is not well-suited for cat sessions.',
  },
  {
    question: 'Can I book grooming for my cat and another pet on the same day?',
    answer: 'Yes, we can do back-to-back sessions in the same home. Cats and dogs should ideally be in separate rooms during each other\'s sessions to reduce anxiety on both sides.',
  },
];

// ════════════════════════════════════════════════════════════
// WAGHOLI
// ════════════════════════════════════════════════════════════

export const wagholiCatLocation: LocationConfig = {
  name: 'Wagholi',
  slug: 'cat-grooming-in-pune/wagholi',

  heroH1: 'Cat Grooming at Home in Wagholi — For Cats That Won\'t Go Anywhere',
  heroSubtext:
    'Most cats want nothing to do with the outside world. In Wagholi\'s fast-growing apartment community, Sniffy brings professional cat grooming directly to your home — no carrier, no salon visit, no stressed-out cat.',

  storySections: [
    {
      heading: 'Wagholi\'s Cat Population Is Growing Quietly',
      subheading: 'And they all need grooming.',
      paragraphs: [
        'Wagholi has seen enormous residential growth over the past decade and with it, a real uptick in apartment cat parents. Cats are ideal for the apartment lifestyle — but their grooming needs don\'t disappear just because you live far from the city center. Finding a reliable cat groomer who covers Wagholi used to mean a long trip toward Kharadi or beyond. Sniffy now provides in-home cat grooming across all of Wagholi — trained groomers come to you, wherever you are on the Nagar Road stretch.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Wagholi Pune',
      imageLeft: true,
    },
    {
      heading: 'Why Apartment Cats in Wagholi Need Regular Grooming',
      subheading: 'Indoor life doesn\'t mean grooming-free.',
      paragraphs: [
        'Indoor cats in Wagholi\'s apartments don\'t self-exercise the way outdoor cats do, which affects coat health over time. Combined with air conditioning (which dries out skin) and limited sunlight, coat and nail maintenance becomes more important, not less. A professional session every 6–8 weeks handles the buildup — dead coat, overgrown nails, ear wax, and the general coat health that self-grooming can\'t fully address.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Indoor cat grooming session in Wagholi apartment',
      imageLeft: false,
    },
    {
      heading: 'Cat Breeds Common in Wagholi and How We Groom Them',
      subheading: 'Different coats, different approaches.',
      paragraphs: [
        'Wagholi\'s cat community spans the range from purebreds to beloved rescue Indies. Here\'s how we handle the most common ones:',
      ],
      bullets: [
        'Persian cat grooming in Wagholi — Long coats get particularly dusty near Wagholi\'s busy arterial roads. We do a thorough pre-bath brush, a deep conditioning wash, and a careful blow-dry that leaves the coat light and clean.',
        'Maine Coon grooming in Wagholi — Large cats with dense semi-longhair coats. The ruff, belly, and tail feathering need special attention. We work through these zones methodically and check for mats in the inner legs and armpits.',
        'Indie cat grooming in Wagholi — Domestic Indies often come from street backgrounds and may have irregular grooming histories. We approach each one fresh and adjust the session to their comfort level.',
        'British Shorthair grooming in Wagholi — Short but very dense coats. Our deshedding brush-out before and after the bath removes a significant amount of undercoat and reduces shedding noticeably.',
      ],
      closingLine: 'All breeds, all temperaments. Wagholi, Nagar Road, and surrounding areas covered.',
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Cat being groomed at home in Wagholi',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/wagholi'),
  nearbyAreas: ['Kharadi', 'Nagar Road', 'Manjri', 'Undri', 'Phursungi', 'Hadapsar'],
};

export const wagholiCatMapEmbed = 'https://www.google.com/maps?q=Wagholi,Pune&output=embed';

export const wagholiCatReviews: LocationReview[] = [
  {
    petName: 'Simba',
    ownerName: 'Neha Gaikwad',
    area: 'Wagholi Main Road',
    review: 'Simba is a 3-year-old Maine Coon and an absolute handful to groom. He\'s big, opinionated, and has strong feelings about his tail being touched. The groomer handled him brilliantly — she worked around his objections, did his tail in segments between other tasks, and completed the whole session with no drama. His coat looks incredible after the deshedding treatment.',
    rating: 5,
  },
  {
    petName: 'Mochi',
    ownerName: 'Amruta Borse',
    area: 'Nagar Road',
    review: 'Mochi is a rescue I brought home 6 months ago. She was still getting used to the apartment and I was worried about how she\'d react to a stranger coming in to handle her. The groomer was very calm, gave Mochi time to investigate her before touching anything, and the session went better than I expected. Small steps, but a really positive experience.',
    rating: 5,
  },
];

export const wagholiFAQsCat: FAQ[] = [
  {
    question: 'My rescue cat is still adjusting to home life — is this a good time to start grooming?',
    answer: 'A newly rehomed cat needs time to feel secure. Wait until the cat is comfortable approaching you and exploring the home freely before booking — usually 4–8 weeks after adoption. A grooming session too early in the settling-in period can set back the trust-building process.',
  },
  {
    question: 'Can you groom an outdoor-indoor cat who might have ticks?',
    answer: 'Yes. We include a thorough tick check in every session for cats with outdoor access. If we find ticks we remove them and can use an anti-tick shampoo. We\'ll flag anything significant for a vet follow-up.',
  },
  {
    question: 'How do I keep my cat\'s coat in good shape between sessions?',
    answer: 'For longhair cats, a gentle daily brush makes a huge difference — a soft slicker brush or a Furminator depending on coat type. For shorthairs, a weekly brush-through is usually enough. We\'re happy to recommend tools and techniques at the end of the session.',
  },
];

// ════════════════════════════════════════════════════════════
// SHIVAJINAGAR
// ════════════════════════════════════════════════════════════

export const shivajinagarCatLocation: LocationConfig = {
  name: 'Shivajinagar',
  slug: 'cat-grooming-in-pune/shivajinagar',

  heroH1: 'Cat Grooming at Home in Shivajinagar — One Groomer, Your Cat\'s Own Space',
  heroSubtext:
    'Shivajinagar\'s cat parents know the salon-trip struggle too well. Sniffy brings professional cat grooming directly to your home — trained groomers with cat-specific equipment and the patience this actually takes.',

  storySections: [
    {
      heading: 'Shivajinagar\'s Central Location Doesn\'t Make Cat Grooming Easier',
      subheading: 'More traffic, more stress for your cat.',
      paragraphs: [
        'Being close to Pune\'s city centre means Shivajinagar residents often think they have easy access to salons. In practice, getting a cat through Shivajinagar\'s congested streets in a carrier is a miserable experience for the animal — vibrations, noise, unfamiliar smells, and then a salon full of strangers. Sniffy\'s in-home cat grooming in Shivajinagar means none of that. Your groomer comes to you. Your cat stays home.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Shivajinagar Pune',
      imageLeft: true,
    },
    {
      heading: 'We\'re Cat Groomers, Not Dog Groomers Who Accept Cats',
      subheading: 'The difference matters a lot.',
      paragraphs: [
        'Most Pune salons are fundamentally dog grooming operations that also take cat bookings. The products, the handling training, the restraint methods — all designed for dogs. Cats require completely different approaches: lower restraint, reading body language signals, different shampoo chemistry, and far more patience with session pacing. Our groomers working in Shivajinagar are trained specifically for cat handling — they know the difference between a warning hiss and a threat, how to read ear position, and when to pause versus when to push through.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Professional cat-specific grooming in Shivajinagar',
      imageLeft: false,
    },
    {
      heading: 'Cat Breeds We Groom in Shivajinagar',
      subheading: 'Old Pune flavour, diverse cat community.',
      paragraphs: [
        'Shivajinagar has a lovely mix of traditional households and newer apartments, and the cat community reflects that — from Persians to Indies to the occasional exotic breed. Here\'s how we approach the most common ones:',
      ],
      bullets: [
        'Persian cat grooming in Shivajinagar — The flat face requires careful eye area wiping and cleaning of facial folds. The long coat needs section-by-section attention. We allocate extra time for Persian sessions because rushing a Persian never ends well.',
        'Indie cat grooming in Shivajinagar — Beloved Indies come in every personality type. Some are completely fine with grooming, others have never been touched by a stranger. We adapt fully to where they are and work toward a complete session patiently.',
        'Siamese cat grooming in Shivajinagar — Famously chatty during grooming. Short coats are easy to manage but Siamese often need a distraction technique — we keep them engaged and move through the session before they\'ve decided to object.',
        'Russian Blue grooming in Shivajinagar — Dense double coats that shed less than most but still benefit from regular deshedding. Their plush silver coats come out beautifully after a proper conditioning bath.',
      ],
      closingLine: 'Any breed is welcome. We\'ll work with whatever personality your cat brings to the session.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Various cat breeds groomed at home in Shivajinagar',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/shivajinagar'),
  nearbyAreas: ['Deccan', 'FC Road', 'Erandwane', 'Kothrud', 'Camp', 'Aundh', 'Bopodi'],
};

export const shivajinagarCatMapEmbed = 'https://www.google.com/maps?q=Shivajinagar,Pune&output=embed';

export const shivajinagarCatReviews: LocationReview[] = [
  {
    petName: 'Biscuit',
    ownerName: 'Sunita Joshi',
    area: 'FC Road',
    review: 'Biscuit is 11 years old and has been groomed at salons his whole life. He\'s always come back home looking stressed and it takes him days to recover. This was his first home grooming session and the difference was remarkable. He watched the groomer from across the room, came to investigate her on his own terms, and then tolerated the full session with minimal complaint. At 11 years old that feels like a miracle.',
    rating: 5,
  },
  {
    petName: 'Duchess',
    ownerName: 'Vaibhav Sathe',
    area: 'Deccan Gymkhana',
    review: 'Duchess is a Siamese who has Opinions. She vocalised her objections throughout but the groomer was completely unfazed and just kept working calmly. The whole session was done in about 90 minutes and Duchess looked fantastic. The groomer also told me her ears looked a little red and suggested I get them checked — sure enough, early-stage ear infection. Very glad she caught it.',
    rating: 5,
  },
];

export const shivajinagarFAQsCat: FAQ[] = [
  {
    question: 'Can your groomers spot health issues during the session?',
    answer: 'Our groomers are trained to notice common signs of health concerns during grooming — skin irritation, ear redness, unusual lumps, overgrown or ingrown nails, and matting patterns that might indicate underlying issues. We\'ll flag anything we notice, but we\'re groomers, not vets — a vet visit is the next step for anything we flag.',
  },
  {
    question: 'Is home grooming hygienic for my other family members?',
    answer: 'Yes. We use clean equipment for each session, wipe down the grooming area before and after, and all waste (shed fur, nail clippings) is bagged and taken away. We can work in any area of the home — bathroom, kitchen, or on a waterproof mat in any room.',
  },
  {
    question: 'My cat is 12 years old — is grooming still okay at that age?',
    answer: 'Senior cats actually benefit more from regular grooming because they groom themselves less effectively as they age. We adapt the session for older cats — slower pace, softer handling, shorter segments with more breaks. Age alone isn\'t a reason to skip grooming; in fact it\'s a reason to continue it.',
  },
];

// ════════════════════════════════════════════════════════════
// WAKAD
// ════════════════════════════════════════════════════════════

export const wakadCatLocation: LocationConfig = {
  name: 'Wakad',
  slug: 'cat-grooming-in-pune/wakad',

  heroH1: 'Cat Grooming at Home in Wakad — No Carrier, No Drama',
  heroSubtext:
    'Wakad\'s tech-savvy population knows there\'s a better way to do most things — including cat grooming. Sniffy sends a trained cat groomer to your door, fully equipped, ready to handle your cat\'s particular personality.',

  storySections: [
    {
      heading: 'Wakad\'s Cat Parents Deserve a Real Option',
      subheading: 'At-home grooming designed for apartment life.',
      paragraphs: [
        'Wakad has become one of Pune\'s most densely populated areas with a huge young working population and, naturally, lots of apartment cats. The traditional model of taking your cat to a salon means a carrier you have to store, a cab you have to book, a waiting area you have to sit in, and a stressed cat you have to recover for two days. In-home cat grooming in Wakad replaces all of that with one groomer arriving at your door with everything already packed. Easier for you, vastly better for your cat.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Wakad Pune',
      imageLeft: true,
    },
    {
      heading: 'High-Rise Living and Cat Coat Health',
      subheading: 'Elevations and air conditioning affect your cat more than you know.',
      paragraphs: [
        'Cats in Wakad\'s high-rise apartments often have dryer coats and more static than cats in traditional houses, thanks to constant air conditioning and less natural humidity. This makes regular conditioning and coat care more important. We use moisturising cat shampoos and finishing sprays that address dry coat conditions, and our groomers pay particular attention to coat quality during the assessment portion of each session.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat coat conditioning session in Wakad apartment',
      imageLeft: false,
    },
    {
      heading: 'Breeds We See in Wakad and How We Handle Them',
      subheading: 'The apartments of Wakad have some interesting cats.',
      paragraphs: [
        'Wakad\'s young professional population tends toward popular cat breeds. Here\'s how we approach the most common ones:',
      ],
      bullets: [
        'Persian cat grooming in Wakad — The most requested cat in our Wakad bookings. Long, dusty coats in high-traffic areas need thorough washing and conditioning. We work through the coat section by section and always check for mats near the collar area where they form most often.',
        'British Shorthair grooming in Wakad — Classic British Shorthairs have fantastic plush coats that need proper deshedding. We use a slicker and deshedding comb before the bath to remove loose undercoat, then the conditioning wash sets the remaining coat beautifully.',
        'Ragdoll cat grooming in Wakad — Ragdolls have a reputation for going completely limp when handled, which is partly true and partly a myth. They\'re generally cooperative but their semi-long coats need careful attention to belly and underarm matting.',
        'Indie cat grooming in Wakad — Many Wakad Indies were rescued from Hinjewadi and nearby areas. Some have street histories that make them cautious of new people. We take our time with introductions and let the cat dictate the pace in the early part of the session.',
      ],
      closingLine: 'Every cat in Wakad is welcome — we\'ll figure out the right approach for your particular one.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Cat grooming session in Wakad home',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/wakad'),
  nearbyAreas: ['Pimple Saudagar', 'Baner', 'Ravet', 'Hinjewadi', 'Pimple Nilakh', 'Aundh'],
};

export const wakadCatMapEmbed = 'https://www.google.com/maps?q=Wakad,Pune&output=embed';

export const wakadCatReviews: LocationReview[] = [
  {
    petName: 'Oreo',
    ownerName: 'Shruti Tiwari',
    area: 'Wakad Chowk',
    review: 'Oreo is a tuxedo Indie who has strong opinions about strangers. I was prepared for it to be a disaster but the groomer was remarkably good at reading him. She let him approach her first, moved very slowly, and by the time she actually started grooming he\'d decided she was acceptable. Full session, clean cat, zero drama. Honestly one of the better grooming experiences we\'ve had.',
    rating: 5,
  },
  {
    petName: 'Luna',
    ownerName: 'Rajan Mehta',
    area: 'Datta Mandir Road',
    review: 'Luna is a British Shorthair with the most incredibly dense coat that sheds absolutely everywhere. The groomer brought a proper deshedding kit and worked through Luna\'s coat systematically — the amount of loose fur that came out was genuinely impressive. Luna\'s coat has looked much better and home shedding is noticeably reduced since.',
    rating: 5,
  },
];

export const wakadFAQsCat: FAQ[] = [
  {
    question: 'What\'s the difference between a bath and a full grooming session?',
    answer: 'A bath alone is just washing. A full grooming session includes bath, blow-dry, brushing, nail trim, ear cleaning, eye area wipe, and a coat condition check. We always do the full session — a bath without the rest is incomplete cat care.',
  },
  {
    question: 'Do you do deshedding treatments specifically for heavy shedders?',
    answer: 'Yes, deshedding is part of the standard service. For breeds like British Shorthairs, Persians, and Maine Coons who shed heavily, we use a deshedding shampoo and conditioner in addition to thorough pre and post-bath brushing. It significantly reduces home shedding for several weeks.',
  },
  {
    question: 'My cat is on medication — does that affect grooming?',
    answer: 'Most medications don\'t affect grooming. If your cat is on something for a skin condition or has any restrictions on products used, mention it when booking and we\'ll confirm compatibility. We defer to vet instructions on any specific product restrictions.',
  },
];

// ════════════════════════════════════════════════════════════
// KALYANI NAGAR
// ════════════════════════════════════════════════════════════

export const kalyaniNagarCatLocation: LocationConfig = {
  name: 'Kalyani Nagar',
  slug: 'cat-grooming-in-pune/kalyani-nagar',

  heroH1: 'Cat Grooming at Home in Kalyani Nagar — Calm, Thorough, Cat-First',
  heroSubtext:
    'Kalyani Nagar\'s cat owners have high standards for everything — including their cat\'s grooming. Sniffy sends trained groomers who understand feline behaviour and arrive fully equipped for a professional at-home session.',

  storySections: [
    {
      heading: 'Why Kalyani Nagar Cat Parents Prefer At-Home Grooming',
      subheading: 'It\'s not about convenience. It\'s about quality.',
      paragraphs: [
        'Kalyani Nagar has a discerning pet-owning population who\'ve tried salons and found them wanting. The rushed sessions, the dog-specific environments, the impersonal handling — none of it is appropriate for cats. At-home cat grooming in Kalyani Nagar delivers what salon visits can\'t: undivided attention, cat-specific technique, and a stress-free environment that genuinely produces better results. A cat that\'s calm is a cat that can be properly groomed.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming session at home in Kalyani Nagar',
      imageLeft: true,
    },
    {
      heading: 'Purebred Cats Need Breed-Specific Grooming Knowledge',
      subheading: 'Not every coat responds to the same approach.',
      paragraphs: [
        'Kalyani Nagar has a higher proportion of purebred cats than most Pune localities — Persians, Maine Coons, British Shorthairs, Ragdolls. Each breed has its own coat structure, grooming needs, and temperament traits. A groomer who treats all cats the same will inevitably produce mediocre results at best and coat damage at worst. Our groomers in Kalyani Nagar are specifically trained on breed-specific coat management — the right brush type, the right shampoo formulation, and the right approach for each cat they encounter.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Purebred cat grooming in Kalyani Nagar Pune',
      imageLeft: false,
    },
    {
      heading: 'What a Proper Cat Grooming Session in Kalyani Nagar Looks Like',
      subheading: 'Step by step, nothing skipped.',
      paragraphs: [
        'Here\'s exactly what happens during a Sniffy cat grooming session in Kalyani Nagar — from the groomer arriving at your door to leaving:',
      ],
      bullets: [
        'Arrival and setup — The groomer introduces themselves to your cat, sets up the grooming area (no mess, everything contained), and allows the cat time to investigate before starting.',
        'Pre-bath brush — We brush through the coat before wetting it to remove loose fur and identify any matting that needs pre-treatment.',
        'Bath — Using a cat-specific shampoo appropriate for the coat type. Temperature controlled, no sudden splashing. We support the cat throughout.',
        'Conditioning and rinse — A conditioning mask is applied and left for a few minutes before thorough rinsing.',
        'Drying — Low-heat blow dry with a dryer held at safe distance, or towel-dry for dryer-sensitive cats.',
        'Post-bath grooming — Full brush-through, de-matting if needed, finishing comb for longhair breeds.',
        'Nails, ears, eyes — Nail trim (front and back), ear cleaning with cotton and appropriate solution, eye area wipe.',
        'Finish and assessment — A quick coat check and we\'ll let you know anything we noticed during the session.',
      ],
      closingLine: 'The whole session runs 90 minutes to 2.5 hours depending on breed and coat condition.',
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Complete cat grooming session at home in Kalyani Nagar',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/kalyani-nagar'),
  nearbyAreas: ['Viman Nagar', 'Koregaon Park', 'Wadgaon Sheri', 'Mundhwa', 'Kharadi', 'Nagar Road'],
};

export const kalyaniNagarCatMapEmbed = 'https://www.google.com/maps?q=Kalyani+Nagar,Pune&output=embed';

export const kalyaniNagarCatReviews: LocationReview[] = [
  {
    petName: 'Marzipan',
    ownerName: 'Ishita Dhar',
    area: 'Kalyani Nagar East',
    review: 'Marzipan is a purebred Persian and her coat is my responsibility — I take it seriously. I\'ve tried three different salons and the results have always disappointed me. The Sniffy groomer understood Persian coats specifically — she used the right brush type for the undercoat, didn\'t rush the detangling, and the finishing comb-through was thorough. Marzipan\'s coat looked genuinely show-quality when she was done.',
    rating: 5,
  },
  {
    petName: 'Cosmo',
    ownerName: 'Arjun Rao',
    area: 'Lalit Nagar',
    review: 'Cosmo is a Maine Coon with an absolutely enormous coat and a strong sense of personal boundaries. The groomer handled him incredibly well — she was methodical and patient, worked through the tail and ruff without him objecting, and finished with a thorough nail trim. Cosmo was his usual suspicious self throughout but the groomer never lost her composure.',
    rating: 5,
  },
];

export const kalyaniNagarFAQsCat: FAQ[] = [
  {
    question: 'Do you groom show cats or competition cats?',
    answer: 'Yes. We understand show coat requirements for breeds like Persians and Maine Coons. If your cat is a show animal, mention this at booking — we take extra care with coat texture, avoid any accidental trimming, and use finishing products that enhance rather than alter the natural coat.',
  },
  {
    question: 'My cat went to a salon once and had a terrible experience. Can at-home grooming fix that?',
    answer: 'Often yes. A single bad salon experience can create lasting associations for a cat. Home grooming in a familiar environment with a patient groomer can rebuild positive associations over time. It may take two or three sessions before the cat is fully comfortable, but progress is typically noticeable from the first visit.',
  },
  {
    question: 'Can you do two cats on the same visit?',
    answer: 'Yes, we can groom multiple cats in sequence. Each cat gets their own session, fresh equipment, and full attention. Pricing is per cat. Let us know the number of cats and breeds when booking so we can plan the time accordingly.',
  },
];

// ════════════════════════════════════════════════════════════
// LOHEGAON
// ════════════════════════════════════════════════════════════

export const lohegaonCatLocation: LocationConfig = {
  name: 'Lohegaon',
  slug: 'cat-grooming-in-pune/lohegaon',

  heroH1: 'Cat Grooming at Home in Lohegaon — Professional, Patient, Feline-Friendly',
  heroSubtext:
    'Lohegaon\'s expanding residential community now has access to proper in-home cat grooming. Sniffy\'s trained groomers cover all of Lohegaon — your cat gets groomed where it\'s most comfortable, at home.',

  storySections: [
    {
      heading: 'Lohegaon Is Growing, and So Is Its Need for Cat Grooming',
      subheading: 'A neighbourhood that deserves proper pet services.',
      paragraphs: [
        'Lohegaon has transformed over the past few years from a relatively quiet area into a proper residential neighbourhood with new apartment complexes and a growing young family community. More families means more pets, and among those pets, a lot of cats. But proper cat grooming services haven\'t kept pace with the growth. Sniffy fills that gap — we cover all of Lohegaon with in-home cat grooming, sending trained groomers directly to your door.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Lohegaon Pune',
      imageLeft: true,
    },
    {
      heading: 'The Lohegaon-Dhanori Dust Belt Is Real',
      subheading: 'Construction dust settles on cat coats.',
      paragraphs: [
        'Lohegaon\'s ongoing development means construction dust in the air that settles on everything — including your indoor cat\'s coat. Over time this causes skin irritation and dull coats. Our grooming sessions include a deep cleansing wash specifically aimed at removing environmental buildup, plus a conditioning treatment that restores coat health and natural sheen.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Deep cleansing cat bath in Lohegaon home',
      imageLeft: false,
    },
    {
      heading: 'Breeds We Groom in Lohegaon',
      subheading: 'Apartment cats, villas, and everything in between.',
      paragraphs: [
        'Lohegaon\'s cat community has a good spread of breeds. Here\'s what we most commonly encounter:',
      ],
      bullets: [
        'Persian cat grooming in Lohegaon — The constant Pune dust is particularly rough on Persian coats. Our deep wash and conditioning treatment keeps Persian fur from becoming dull and brittle, and we always finish with a comb-through to check coat health.',
        'Indie cat grooming in Lohegaon — Many Lohegaon cats are community cats who found their way inside. These cats often have more robust constitutions but still benefit from proper grooming, nail trimming, and ear care.',
        'British Shorthair grooming in Lohegaon — Dense coats with significant shedding potential. A proper deshedding session every 6–8 weeks keeps the home significantly cleaner.',
        'Tabby and mixed-breed grooming in Lohegaon — Every mixed-breed cat has a unique coat that reflects its genetic background. We assess each cat individually and choose the right approach.',
      ],
      closingLine: 'All of Lohegaon covered — near the airport road, Kalas side, Vishrantwadi side, everywhere.',
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Cat grooming session at home in Lohegaon',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/lohegaon'),
  nearbyAreas: ['Dhanori', 'Viman Nagar', 'Vishrantwadi', 'Wagholi', 'Kalas', 'Yerawada'],
};

export const lohegaonCatMapEmbed = 'https://www.google.com/maps?q=Lohegaon,Pune&output=embed';

export const lohegaonCatReviews: LocationReview[] = [
  {
    petName: 'Pistachio',
    ownerName: 'Kavya Menon',
    area: 'Lohegaon Village',
    review: 'Pistachio is a 6-year-old Persian who I\'d been grooming myself because I couldn\'t find anyone good in Lohegaon. My DIY grooming was okay but definitely not professional — there were always small mats I couldn\'t get out properly. The Sniffy groomer sorted through all of them patiently and the coat she left behind was much more properly managed than anything I\'d achieved. Booking regularly now.',
    rating: 5,
  },
  {
    petName: 'Cheddar',
    ownerName: 'Shashank More',
    area: 'Kalas Road',
    review: 'Cheddar is a big orange Indie who is completely fine with me but very suspicious of strangers. The groomer was good about giving him space initially. He went and hid under the bed for about 10 minutes and she just waited patiently, tried again, and eventually Cheddar came around. Good nail trim, clean ears, bath done well.',
    rating: 5,
  },
];

export const lohegaonFAQsCat: FAQ[] = [
  {
    question: 'My cat hides whenever a stranger comes over — how will the session work?',
    answer: 'This is very common. The groomer will give the cat time to emerge on their own terms. We never pull a cat out of hiding — that creates negative associations and makes things worse. Usually the cat comes out within 15–20 minutes when they realise the newcomer isn\'t threatening. From there, the session typically goes smoothly.',
  },
  {
    question: 'Can I stay in the room during the session?',
    answer: 'Absolutely, and we prefer it. Having a familiar person nearby helps the cat feel safer, and you can reassure them during any tense moments. Some owners prefer to be in an adjacent room — either way is fine, as long as you\'re present in the home.',
  },
  {
    question: 'How long does a cat grooming session typically take?',
    answer: 'Between 1.5 and 2.5 hours, depending on breed, coat condition, and how cooperative the cat is. Persian and longhair sessions tend to take longer than shorthair sessions. We never rush — the time it takes is the time it takes.',
  },
];

// ════════════════════════════════════════════════════════════
// KHARADI
// ════════════════════════════════════════════════════════════

export const kharadiCatLocation: LocationConfig = {
  name: 'Kharadi',
  slug: 'cat-grooming-in-pune/kharadi',

  heroH1: 'Cat Grooming at Home in Kharadi — Because Your Cat Has Enough Stress',
  heroSubtext:
    'Kharadi\'s IT corridor is full of cat parents who understand efficiency. Sniffy sends a trained groomer to your Kharadi home — complete session, cat-appropriate setup, no carrier required.',

  storySections: [
    {
      heading: 'Kharadi\'s Cat Community Is One of Pune\'s Most Active',
      subheading: 'And they\'ve all dealt with the salon problem.',
      paragraphs: [
        'Walk through any of Kharadi\'s gated communities in the evening and you\'ll find cat carriers being lugged to autos, owners trying to locate their hidden cats before appointments, and the general chaos of getting a territorial animal to a neutral environment. It\'s a familiar struggle here. Sniffy\'s in-home cat grooming in Kharadi resolves it entirely — no carrier, no auto, no waiting area with a dog three feet from your cat\'s face.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Kharadi Pune',
      imageLeft: true,
    },
    {
      heading: 'IT Area Apartments and Cat Coat Health',
      subheading: 'Air conditioning is tougher on cats than most people realise.',
      paragraphs: [
        'Kharadi\'s office-adjacent apartments run air conditioning almost continuously, which significantly reduces ambient humidity. This creates chronically dry air that affects cat coat and skin health — dull, brittle coat, flaky skin, and increased static shedding. Our conditioning treatments specifically address low-humidity coat conditions, and our groomers note coat quality at each session so you can track changes over time.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat coat conditioning session in Kharadi apartment',
      imageLeft: false,
    },
    {
      heading: 'Kharadi\'s Cat Breeds and How We Groom Them',
      subheading: 'Every IT professional deserves a well-groomed cat.',
      paragraphs: [
        'Kharadi has a particularly high proportion of young working professionals — and their cats tend to reflect the mix: trendy breeds and beloved rescues side by side. Here\'s how we handle the most common ones:',
      ],
      bullets: [
        'Persian cat grooming in Kharadi — Popular, high-maintenance, and absolutely worth the effort. We do a complete section-by-section detangle, deep conditioning wash, and careful blow-dry. Persian coats in AC-heavy apartments often need extra moisture work.',
        'Maine Coon grooming in Kharadi — Large, impressive cats with large, impressive coats. The ruff, belly, and tail are prime mat zones in Pune\'s climate. We work through these areas methodically.',
        'Ragdoll grooming in Kharadi — Ragdolls are typically cooperative and their semi-longhair coats are manageable — but belly matting is common and needs regular attention.',
        'Indie cat grooming in Kharadi — Many Kharadi Indies were adopted from the streets around EON, Magarpatta, and surrounding areas. Some have never been properly groomed. We start slow, build trust, and complete as much as the cat comfortably allows.',
      ],
      closingLine: 'All of Kharadi covered — Pallavi Nagar, EON area, Nagar Road side, everywhere.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Cat breed grooming at home in Kharadi',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/kharadi'),
  nearbyAreas: ['Wagholi', 'Viman Nagar', 'Hadapsar', 'Mundhwa', 'Kalyani Nagar', 'Magarpatta'],
};

export const kharadiCatMapEmbed = 'https://www.google.com/maps?q=Kharadi,Pune&output=embed';

export const kharadiCatReviews: LocationReview[] = [
  {
    petName: 'Pepper',
    ownerName: 'Nidhi Sharma',
    area: 'Pallavi Nagar',
    review: 'Pepper is a tabby rescue who had never been bathed in the two years since I adopted her. I\'d attempted it once and she made it very clear that was not happening again. The Sniffy groomer\'s approach was completely different from mine — very quiet, very deliberate, completely patient. Pepper was bathed, brushed, and had her nails trimmed in one session. I can\'t believe it.',
    rating: 5,
  },
  {
    petName: 'Gatsby',
    ownerName: 'Siddharth Kaul',
    area: 'EON IT Park Area',
    review: 'Gatsby is a purebred Maine Coon and his coat is an absolute labour of love. The groomer knew the breed well — commented on his ruff formation, knew exactly how to approach the belly area where his mats always form, and left his tail feathering intact and beautiful. This was a proper professional session, not a generic cat wash.',
    rating: 5,
  },
];

export const kharadiFAQsCat: FAQ[] = [
  {
    question: 'Can I schedule recurring monthly bookings?',
    answer: 'Yes, recurring bookings are available and recommended for longhair breeds. You can set up a standing monthly or bi-monthly slot and you\'ll always get the same groomer when possible, which helps cats who take time to warm up to new people.',
  },
  {
    question: 'My cat has never been bathed — how do I prepare for the first session?',
    answer: 'Not much preparation is needed from your side. Just have a clear space available in one room and make sure the cat\'s nails haven\'t been clipped recently (we\'ll do that). Let the groomer know it\'s the first bath — we start extra slowly with first-timers and set realistic expectations.',
  },
  {
    question: 'Do you use cage dryers or conventional dryers?',
    answer: 'We never use cage dryers. We use hand-held dryers on low heat, held at a safe distance from the cat. For cats who are very dryer-anxious, towel drying is the primary method and the hand dryer is used minimally at the end just to ensure the coat is properly dry.',
  },
];

// ════════════════════════════════════════════════════════════
// VIMAN NAGAR
// ════════════════════════════════════════════════════════════

export const vimanNagarCatLocation: LocationConfig = {
  name: 'Viman Nagar',
  slug: 'cat-grooming-in-pune/viman-nagar',

  heroH1: 'Cat Grooming at Home in Viman Nagar — Skip the Carrier Entirely',
  heroSubtext:
    'Viman Nagar has everything — except a good in-home cat groomer. Sniffy fixes that. Trained groomers come to your apartment with a complete setup, professional technique, and the patience that cat grooming actually requires.',

  storySections: [
    {
      heading: 'The Viman Nagar Cat Parent\'s Dilemma',
      subheading: 'Close to everything, still far from good cat grooming.',
      paragraphs: [
        'Viman Nagar is one of Pune\'s most connected localities — airport access, malls, restaurants, offices. But when it comes to proper cat grooming, even Viman Nagar parents found themselves making compromises. The few grooming options in the area were dog-first, and the experiences were mixed at best. Sniffy\'s in-home cat grooming in Viman Nagar is specifically built for cats — trained in feline handling, equipped with cat-specific products, and designed to happen in your home where your cat is actually comfortable.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Viman Nagar Pune',
      imageLeft: true,
    },
    {
      heading: 'Airport Road Apartments and Cat Coat Challenges',
      subheading: 'Dust from construction, noise from traffic — your cat feels all of it.',
      paragraphs: [
        'Viman Nagar\'s proximity to the airport and major roads means ambient dust and noise levels are higher than quieter suburbs. Indoor cats absorb environmental dust through their coats and may be affected by outdoor noise through windows. Regular grooming removes the particulate buildup from the coat, and a calm in-home grooming session is far better for noise-sensitive cats than an auto journey near airport traffic.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat deep cleaning session in Viman Nagar apartment',
      imageLeft: false,
    },
    {
      heading: 'Cat Breeds We Groom in Viman Nagar',
      subheading: 'Transit hub, diverse cats.',
      paragraphs: [
        'Viman Nagar\'s proximity to the airport means a lot of expats and internationally-connected residents — and with them, some less common breeds alongside the usual Pune favourites. Here\'s what we see most often:',
      ],
      bullets: [
        'Persian cat grooming in Viman Nagar — The most common request. Long coats that need regular professional attention. We always include a coat condition report at the end of the session.',
        'British Shorthair and Exotic Shorthair grooming in Viman Nagar — Both require deshedding treatment for their dense coats. Exotics also need facial fold cleaning.',
        'Norwegian Forest Cat and Maine Coon grooming in Viman Nagar — Large cats with substantial coats. We allocate extra time for these breeds and work through the coat section by section.',
        'Indie and rescue cat grooming in Viman Nagar — Many Viman Nagar rescues came from Kalyani Nagar and Wadgaon Sheri colonies. They vary enormously in temperament and we adapt to each one.',
      ],
      closingLine: 'All of Viman Nagar covered — Thite Nagar, Clover area, North Main Road, everywhere.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Cat breed grooming at home in Viman Nagar',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/viman-nagar'),
  nearbyAreas: ['Kalyani Nagar', 'Dhanori', 'Lohegaon', 'Wadgaon Sheri', 'Nagar Road', 'Mundhwa'],
};

export const vimanNagarCatMapEmbed = 'https://www.google.com/maps?q=Viman+Nagar,Pune&output=embed';

export const vimanNagarCatReviews: LocationReview[] = [
  {
    petName: 'Snowball',
    ownerName: 'Tanvi Iyer',
    area: 'Thite Nagar',
    review: 'Snowball is a white Persian who shows every speck of dust instantly. Living near the airport road, the coat gets grimy fast. I had been doing quick washes at home but never properly. The Sniffy groomer\'s session was on a completely different level — the conditioning wash, the section-by-section brushing, the comb-through at the end. Snowball looked genuinely white again for the first time in months.',
    rating: 5,
  },
  {
    petName: 'Mochi',
    ownerName: 'Devika Rao',
    area: 'Clover Village',
    review: 'Mochi is 13 years old and has hyperthyroidism which makes her coat thin and her skin sensitive. I was very nervous about grooming at that age but the groomer was exceptionally gentle — used a soft brush, minimal shampoo contact with the skin, and kept the dryer temperature very low. Mochi was calm throughout, which is not a word I normally use to describe her at grooming time.',
    rating: 5,
  },
];

export const vimanNagarFAQsCat: FAQ[] = [
  {
    question: 'My cat has a health condition — can she still be groomed?',
    answer: 'In most cases yes, with adaptation. Let us know the condition when booking and we\'ll discuss whether any modifications are needed. For cats on chemotherapy, post-surgery, or with very fragile skin conditions, we recommend a vet clearance first.',
  },
  {
    question: 'Do you groom elderly cats (10+ years)?',
    answer: 'Yes, and we strongly encourage it. Senior cats groom themselves less effectively and their coats can deteriorate significantly if professional grooming stops. We adapt our approach for older cats — softer handling, slower sessions, and extra care for arthritic joints or sensitive areas.',
  },
  {
    question: 'Can you pick up after the grooming — shed fur, nail clippings?',
    answer: 'Yes, clean-up is part of the service. We bag and remove all grooming waste before leaving. The grooming area will be clean and dry when we\'re done.',
  },
];

// ════════════════════════════════════════════════════════════
// MUNDWA
// ════════════════════════════════════════════════════════════

export const mundwaCatLocation: LocationConfig = {
  name: 'Mundwa',
  slug: 'cat-grooming-in-pune/mundwa',

  heroH1: 'Cat Grooming at Home in Mundwa — Trained Groomers at Your Door',
  heroSubtext:
    'Finding a proper cat groomer who covers Mundwa used to be the problem. Not anymore. Sniffy sends trained cat groomers to your home in Mundwa — complete session, no carrier needed.',

  storySections: [
    {
      heading: 'Mundwa\'s Quiet Lanes Hide a Lot of Cat People',
      subheading: 'And they\'ve needed this for a while.',
      paragraphs: [
        'Mundwa sits between Koregaon Park and Kharadi — a slightly quieter zone that\'s home to a mix of long-term residents and newer apartment dwellers. The cat parent community here is active but has historically had limited access to proper grooming options. Most grooming services in this area were dog-focused or required travel to Kalyani Nagar or Hadapsar. Sniffy now covers Mundwa directly — trained groomers, proper equipment, home visits.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Mundwa Pune',
      imageLeft: true,
    },
    {
      heading: 'Why Regular Grooming Matters Even for Low-Maintenance Cats',
      subheading: 'Shorthair cats need grooming too.',
      paragraphs: [
        'A lot of shorthair cat owners assume their cats are self-sufficient when it comes to coat maintenance. And to a point, they\'re right — shorthair cats do manage day-to-day. But nails still grow and can curl, ear wax still accumulates, and shedding without professional deshedding still means a lot of fur in your furniture. A professional session every 6–8 weeks keeps all of this managed systematically and lets us catch any emerging health issues early.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Shorthair cat grooming session in Mundwa home',
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/mundwa'),
  nearbyAreas: ['Koregaon Park', 'Kalyani Nagar', 'Kharadi', 'Hadapsar', 'Wadgaon Sheri'],
};

export const mundwaCatMapEmbed = 'https://www.google.com/maps?q=Mundwa,Pune&output=embed';

export const mundwaCatReviews: LocationReview[] = [
  {
    petName: 'Olive',
    ownerName: 'Megha Kulkarni',
    area: 'Mundwa Village',
    review: 'Olive is a domestic shorthair who I\'d never taken for professional grooming because I thought she didn\'t need it. After the first session with Sniffy I realised I was wrong — the deshedding treatment alone made a noticeable difference in how much fur was on the sofa. And her nails were badly in need of trimming. Will be doing this regularly now.',
    rating: 5,
  },
  {
    petName: 'Rajah',
    ownerName: 'Sagar Nimkar',
    area: 'New Mundwa',
    review: 'Rajah is a Siamese mix who had scratched a groomer badly at a salon three years ago. I hadn\'t tried professional grooming since. The Sniffy groomer\'s approach was completely different — she was very calm, didn\'t try to restrain him, just worked around his movements. The whole session went fine. No incidents, clean cat, trimmed nails.',
    rating: 5,
  },
];

export const mundwaFAQsCat: FAQ[] = [
  {
    question: 'My cat scratched a groomer at a salon before. Will this be an issue?',
    answer: 'Let us know when booking. We\'ll note it and the groomer will come prepared with appropriate techniques for cautious cats — slow introduction, no sudden movements, and no forced restraint. Our low-restraint approach prevents most incidents before they happen.',
  },
  {
    question: 'Do I need to prepare my cat for the session in any way?',
    answer: 'No special preparation needed. Just ensure the cat is accessible — not locked in a room where they\'ll feel trapped when we arrive. A light meal a couple of hours before is fine. Avoid bathing the cat yourself beforehand.',
  },
  {
    question: 'How do I know if the shampoo you\'re using is safe for my cat?',
    answer: 'We only use cat-specific, pH-balanced shampoos free from essential oils, parabens, and other compounds known to be problematic for cats. We never use dog shampoo on cats. If your cat has a known skin sensitivity, mention it and we\'ll bring the appropriate formula.',
  },
];

// ════════════════════════════════════════════════════════════
// KOREGAON PARK
// ════════════════════════════════════════════════════════════

export const koregaonParkCatLocation: LocationConfig = {
  name: 'Koregaon Park',
  slug: 'cat-grooming-in-pune/koregaon-park',

  heroH1: 'Cat Grooming at Home in Koregaon Park — Premium Care, No Fuss',
  heroSubtext:
    'Koregaon Park\'s cats are used to the good life. Sniffy brings professional in-home cat grooming that matches those standards — trained groomers, premium products, and a session as calm as the KP evenings.',

  storySections: [
    {
      heading: 'KP Cats Deserve Better Than Dog Salons',
      subheading: 'Professional grooming built around the cat.',
      paragraphs: [
        'Koregaon Park is home to some of Pune\'s most well-loved and well-provided-for cats — Persians in heritage bungalows, Maine Coons in boutique apartments, and a surprising number of beloved rescue Indies who hit the jackpot. What these cats share is owners who care deeply about their wellbeing and are willing to do things properly. At-home cat grooming in Koregaon Park means the session happens on the cat\'s terms — in their own space, with their own smells, without the stress of transport or strange environments.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Koregaon Park Pune',
      imageLeft: true,
    },
    {
      heading: 'Bungalows, Apartments — We Work in Any Space',
      subheading: 'KP has every type of living situation.',
      paragraphs: [
        'Koregaon Park\'s housing ranges from spacious old bungalows to compact modern apartments. Our grooming setup is adaptable to any space — we work off a portable waterproof mat in any room with water access and a power outlet. For larger homes with multiple cats, we can do back-to-back sessions in a single visit and keep the whole process efficient.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat grooming setup in Koregaon Park bungalow',
      imageLeft: false,
    },
    {
      heading: 'The KP Cat Breeds We Know Best',
      subheading: 'Well-bred cats with high standards.',
      paragraphs: [
        'Koregaon Park has a particularly diverse range of cat breeds. Here\'s what we most frequently groom in this area:',
      ],
      bullets: [
        'Persian cat grooming in Koregaon Park — Long flowing coats need constant care. We approach each Persian as an individual — some need more de-matting, others need more drying time, some need extra facial care around the flat face. No two Persians are exactly alike.',
        'Maine Coon grooming in Koregaon Park — Big personalities, big coats. The ruff and tail feathering on Maine Coons are particularly beautiful and need to be maintained correctly. We handle these areas with care.',
        'Birman and Himalayan grooming in Koregaon Park — Semi-longhair breeds with colourpoint markings. The coat care requirements are similar to Persians in terms of detangling and conditioning, with extra facial attention for Himalayans.',
        'Rescue and Indie cat grooming in Koregaon Park — KP has a thriving rescue community and many of the cats here are Indies given wonderful lives. They get the same full professional session as any purebred.',
      ],
      closingLine: 'Every cat in Koregaon Park, Mundhwa road side, North Main Road — all covered.',
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Persian and purebred cat grooming in Koregaon Park',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/koregaon-park'),
  nearbyAreas: ['Kalyani Nagar', 'Camp', 'Mundhwa', 'Viman Nagar', 'Shivajinagar', 'North Main Road'],
};

export const koregaonParkCatMapEmbed = 'https://www.google.com/maps?q=Koregaon+Park,Pune&output=embed';

export const koregaonParkCatReviews: LocationReview[] = [
  {
    petName: 'Duchess and Earl',
    ownerName: 'Leela Krishnamurthy',
    area: 'North Main Road',
    review: 'I have two Persians and booking individual appointments at salons was always a production. Getting both done in one home visit was genuinely a life improvement. The groomer handled both cats sequentially, remembered their individual quirks from the first visit when she came for the second, and the quality of grooming was excellent. Monthly bookings now.',
    rating: 5,
  },
  {
    petName: 'Chairman Meow',
    ownerName: 'Vikram Nair',
    area: 'Koregaon Park Lane 7',
    review: 'Chairman Meow is an extraordinarily opinionated cat who has opinions about everything including how his grooming goes. The Sniffy groomer took this completely in stride — she let him tell her which parts he didn\'t like, worked around his preferences without skipping anything important, and finished the session properly. A great read of animal behaviour.',
    rating: 5,
  },
];

export const koregaonParkFAQsCat: FAQ[] = [
  {
    question: 'Can you groom a cat who\'s used to being bathed professionally but in a salon setting?',
    answer: 'Transitioning from salon to home grooming is usually smooth. Cats who are already grooming-experienced are typically fine with the session itself — and they often do better at home because the environment is familiar and the one-on-one attention is more consistent.',
  },
  {
    question: 'Do you groom cats with flat faces like Persians differently?',
    answer: 'Yes. Flat-faced cats (Persians, Exotic Shorthairs, Himalayans) need careful eye area cleaning, gentle wiping of facial folds, and we avoid any product getting near the face during the bath. The drying around the face is also more careful since flat-faced cats can be more sensitive.',
  },
  {
    question: 'Is there a premium or speciality package for longhair breeds?',
    answer: 'Our standard session covers everything a longhair cat needs. For show cats or cats with very extensive coat requirements, we can discuss a tailored extended session at the time of booking.',
  },
];

// ════════════════════════════════════════════════════════════
// DHAYARI
// ════════════════════════════════════════════════════════════

export const dhayariCatLocation: LocationConfig = {
  name: 'Dhayari',
  slug: 'cat-grooming-in-pune/dhayari',

  heroH1: 'Cat Grooming at Home in Dhayari — Professional, Cat-Specific, No Travel',
  heroSubtext:
    'Dhayari\'s cat owners finally have a real option. Sniffy sends trained groomers to your home — proper cat handling, the right products, and sessions that go smoothly because your cat stays comfortable at home.',

  storySections: [
    {
      heading: 'Dhayari Has Been Underserved for Cat Grooming',
      subheading: 'We\'re here now.',
      paragraphs: [
        'Dhayari is a growing residential area in south-west Pune that has seen rapid apartment development but limited expansion of professional pet services. Cat owners here have typically had to travel toward Kothrud or Karve Nagar for proper grooming — or attempt it at home. Sniffy\'s in-home cat grooming now covers Dhayari directly, bringing trained groomers to your door so your cat never has to leave home for a professional session.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Dhayari Pune',
      imageLeft: true,
    },
    {
      heading: 'Dhayari\'s Growing Construction Activity Affects Cat Coats',
      subheading: 'Dust, debris, and seasonal changes — managed.',
      paragraphs: [
        'Dhayari\'s ongoing development means elevated dust levels that settle on indoor cat coats and cause buildup over time. Combined with Pune\'s dry and humid seasonal swings, cats in this area often develop dull, dry coats between sessions. Our grooming includes a deep conditioning treatment that clears environmental buildup and restores coat health and natural sheen.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Deep conditioning cat bath in Dhayari home',
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/dhayari'),
  nearbyAreas: ['Kothrud', 'Bavdhan', 'Narhe', 'Ambegaon', 'Sus Road', 'Karve Nagar'],
};

export const dhayariCatMapEmbed = 'https://www.google.com/maps?q=Dhayari,Pune&output=embed';

export const dhayariCatReviews: LocationReview[] = [
  {
    petName: 'Tuffy',
    ownerName: 'Girish Patil',
    area: 'Dhayari Phata',
    review: 'I\'d been giving Tuffy baths myself since I couldn\'t find anyone in Dhayari. It was messy, incomplete, and Tuffy hated every moment. The Sniffy groomer turned up with a proper setup and Tuffy sat through the whole thing far more calmly than she ever does with me. The nail trim and ear clean were done properly too — things I\'d been neglecting. Really good service.',
    rating: 5,
  },
  {
    petName: 'Bubbles',
    ownerName: 'Sneha Gokhale',
    area: 'Sus Road',
    review: 'Bubbles is a Persian kitten — 8 months old — and this was her first professional grooming session. The groomer was great about making it a positive first experience — slow introduction, lots of patience, didn\'t rush any step. Bubbles came through it really well and I\'m confident the next session will be even smoother.',
    rating: 5,
  },
];

export const dhayariFAQsCat: FAQ[] = [
  {
    question: 'Can you start grooming a kitten? How young is too young?',
    answer: 'We can groom kittens from about 12 weeks onwards for basic sessions — gentle bath, nail check, ear inspection. Full grooming sessions with blow-drying are better started at 16 weeks or so when they\'re a bit more physically robust. Early grooming habituation is excellent for coat maintenance later in life.',
  },
  {
    question: 'What if my cat gets sick during the session?',
    answer: 'It\'s rare but possible, especially with very anxious cats. If a cat shows signs of significant distress (excessive panting, trying to hide, repeated vomiting) we stop the session, let the cat settle, and complete what we can. Safety always comes first.',
  },
  {
    question: 'Do you use any calming sprays or supplements for anxious cats?',
    answer: 'We don\'t administer any supplements or medications. For extremely anxious cats, some owners choose to use a vet-approved calming supplement at home before the session — that\'s a conversation for you and your vet. What we do is use calm body language, slow movements, and low-restraint technique which is the most effective approach for the majority of cats.',
  },
];

// ════════════════════════════════════════════════════════════
// KARVE NAGAR
// ════════════════════════════════════════════════════════════

export const karveNagarCatLocation: LocationConfig = {
  name: 'Karve Nagar',
  slug: 'cat-grooming-in-pune/karve-nagar',

  heroH1: 'Cat Grooming at Home in Karve Nagar — Gentle, Thorough, Cat-Appropriate',
  heroSubtext:
    'Karve Nagar\'s quiet residential lanes are perfect for calm in-home cat grooming. Sniffy brings a trained groomer to your door — full session, cat-specific products, and no carrier drama.',

  storySections: [
    {
      heading: 'Karve Nagar Cat Parents Know Their Cats Prefer Home',
      subheading: 'The quiet neighbourhood extends to grooming.',
      paragraphs: [
        'Karve Nagar has a settled, residential character that Pune\'s cat-owning community has always appreciated. The cats here tend to have established routines and a clear sense of their territory. Taking them to a salon disrupts everything — the smells, the sounds, the cage time between steps. At-home cat grooming in Karve Nagar fits naturally into the way cat life actually works here: calm, in their space, on a manageable schedule.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Karve Nagar Pune',
      imageLeft: true,
    },
    {
      heading: 'What Makes Cat Grooming Different from Dog Grooming',
      subheading: 'It\'s not just about the size.',
      paragraphs: [
        'Cats have fundamentally different stress responses than dogs. They\'re territorial rather than social, which means unfamiliar environments spike their anxiety in ways that dogs don\'t experience. Their skin has a different pH than dogs, requiring different shampoo chemistry. Their tolerance for restraint is lower, requiring a completely different handling approach. A groomer trained primarily on dogs can technically wash a cat — but the process will be far more stressful than it needs to be. Our groomers in Karve Nagar are trained specifically in feline grooming technique.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat-specific grooming technique in Karve Nagar',
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/karve-nagar'),
  nearbyAreas: ['Kothrud', 'Warje', 'Erandwane', 'Deccan', 'Bavdhan', 'Shivajinagar'],
};

export const karveNagarCatMapEmbed = 'https://www.google.com/maps?q=Karve+Nagar,Pune&output=embed';

export const karveNagarCatReviews: LocationReview[] = [
  {
    petName: 'Kadambari',
    ownerName: 'Vijaya Sathe',
    area: 'Karve Nagar Main Road',
    review: 'Kadambari is 10 years old and very set in her ways. Any change to her routine is taken as a personal insult. Home grooming turned out to be the only way grooming was ever going to work for her — she watched the groomer from across the room for 20 minutes, decided she was acceptable, and then sat through the entire session without much fuss. It felt like a minor miracle.',
    rating: 5,
  },
  {
    petName: 'Toffee',
    ownerName: 'Avinash Deshpande',
    area: 'Sinhagad Road Side',
    review: 'Toffee is a British Shorthair and his coat is incredibly dense. The salon we used to go to never really did a proper deshedding — they\'d wash and dry and call it done. The Sniffy groomer did a proper pre-bath brush, a deshedding shampoo, and post-bath comb. The difference in how much fur is on the sofa afterward is remarkable.',
    rating: 5,
  },
];

export const karveNagarFAQsCat: FAQ[] = [
  {
    question: 'Can I watch the entire grooming session?',
    answer: 'Yes, you\'re welcome to be present and observe throughout. Some owners prefer to be there for the whole session, others check in occasionally. The groomer will tell you if your presence seems to be making the cat more anxious or helping to calm them.',
  },
  {
    question: 'What is a lion cut and is it right for my Persian?',
    answer: 'A lion cut shaves the body coat short while leaving the head, leg tufts, and tail end as a mane. It\'s often recommended for severely matted Persians where de-matting is no longer possible, or for cats who are very mat-prone in Pune\'s humidity. It\'s not cosmetically ideal but it gives the cat enormous relief. We recommend it when necessary and explain the regrowth process.',
  },
  {
    question: 'How far in advance do I need to book?',
    answer: 'Ideally 2–3 days ahead for weekday slots. Weekend bookings in Karve Nagar fill up quickly, so book 4–5 days ahead for weekends. Same-day or next-day bookings may be possible depending on groomer availability.',
  },
];

// ════════════════════════════════════════════════════════════
// AMBEGAON
// ════════════════════════════════════════════════════════════

export const ambegaonCatLocation: LocationConfig = {
  name: 'Ambegaon',
  slug: 'cat-grooming-in-pune/ambegaon',

  heroH1: 'Cat Grooming at Home in Ambegaon — Professional Sessions at Your Door',
  heroSubtext:
    'Ambegaon\'s cat owners now have a proper option. Sniffy brings trained cat groomers to your home — all breeds, all temperaments, full session from ₹799.',

  storySections: [
    {
      heading: 'Ambegaon Cats Have Been Going Ungroomed Long Enough',
      subheading: 'Professional grooming, finally local.',
      paragraphs: [
        'Ambegaon is a rapidly developing area in south Pune where professional pet services have lagged behind residential growth. Cat owners here have been managing at home or making long trips toward Katraj or Kondhwa for grooming options. Sniffy now covers Ambegaon directly with in-home cat grooming — trained groomers who come to you, fully equipped, no travel required from your side or your cat\'s.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Ambegaon Pune',
      imageLeft: true,
    },
    {
      heading: 'Every Cat Is Different. We Adapt Fully.',
      subheading: 'No two sessions are the same.',
      paragraphs: [
        'A fluffy Persian in a peaceful Ambegaon apartment and a rescue Indie who lived outdoors until last year need completely different approaches to grooming. Our groomers arrive without assumptions and assess each cat individually — coat type, temperament, grooming history, and any special considerations. The session that emerges from that assessment is appropriate for that specific cat, not a generic procedure applied to every animal we see.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Customised cat grooming in Ambegaon home',
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/ambegaon'),
  nearbyAreas: ['Dhayari', 'Katraj', 'Narhe', 'Sus Road', 'NIBM', 'Kondhwa'],
};

export const ambegaonCatMapEmbed = 'https://www.google.com/maps?q=Ambegaon,Pune&output=embed';

export const ambegaonCatReviews: LocationReview[] = [
  {
    petName: 'Sherbet',
    ownerName: 'Pooja Wagh',
    area: 'Ambegaon Budruk',
    review: 'I had basically given up on professional grooming for Sherbet because nothing in the area was suitable for cats. Finding Sniffy was a relief. The groomer was patient, knew how to handle a Persian coat properly, and Sherbet was much calmer than she\'s ever been at a salon. Will be booking regularly.',
    rating: 5,
  },
  {
    petName: 'Mr. Whiskers',
    ownerName: 'Tushar Pawar',
    area: 'Narhe',
    review: 'Mr. Whiskers is 7 and has lived his entire life with minimal professional grooming. His nails were too long and his ears had some buildup. The groomer sorted everything out methodically and calmly, and the full bath and brush-through left him looking the best he\'s ever looked. Very happy with this service.',
    rating: 5,
  },
];

export const ambegaonFAQsCat: FAQ[] = [
  {
    question: 'Do you cover Narhe and surrounding areas near Ambegaon?',
    answer: 'Yes — Ambegaon, Narhe, Sus Road, and adjacent pockets of south-west Pune are all covered. If you\'re unsure about your specific location, message us and we\'ll confirm.',
  },
  {
    question: 'My cat has never had its nails clipped — is that okay to do in the first session?',
    answer: 'Nail trimming is part of every standard session. For cats who\'ve never had their nails clipped, we approach it slowly — letting the cat get used to having their paws handled before using the clippers. It may not be the fastest nail trim but it gets done without trauma.',
  },
  {
    question: 'Can you groom a cat that\'s currently nursing kittens?',
    answer: 'We advise waiting until the kittens are fully weaned before a full grooming session. The stress of grooming during nursing can affect milk production and the mother cat\'s state. A very gentle nail and ear check is usually fine, but a full bath and blow-dry session is best postponed.',
  },
];

// ════════════════════════════════════════════════════════════
// BANER
// ════════════════════════════════════════════════════════════

export const banerCatLocation: LocationConfig = {
  name: 'Baner',
  slug: 'cat-grooming-in-pune/baner',

  heroH1: 'Cat Grooming at Home in Baner — Because Your Cat Runs the House',
  heroSubtext:
    'Baner\'s cats know their territory well. Sniffy brings professional grooming to them — trained groomers, cat-specific equipment, and a session that happens where your cat is actually comfortable.',

  storySections: [
    {
      heading: 'Baner\'s Tech-Heavy Population Discovered At-Home Cat Grooming Early',
      subheading: 'Efficiency meets cat welfare.',
      paragraphs: [
        'Baner has a young, busy, well-informed population of cat owners who figured out quickly that at-home grooming is the right model for cats. The logic is simple — cats are territorial, the home is their space, strangers coming into their space are far less threatening than strangers in an unfamiliar space. Sniffy\'s in-home cat grooming in Baner has quickly become the preferred choice for cat parents across Balewadi, Baner Main Road, and the gated complexes along the Sus Road corridor.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Baner Pune',
      imageLeft: true,
    },
    {
      heading: 'Baner\'s Environmental Conditions and Your Cat\'s Coat',
      subheading: 'Pollution, dust, and seasonal changes managed.',
      paragraphs: [
        'Baner\'s proximity to Hinjewadi and major arterial roads means higher-than-average air pollution and dust for indoor cats. Regular professional grooming removes this environmental accumulation from the coat and supports skin health. Our conditioning treatments are specifically formulated to restore coat quality after dust and pollution exposure — a concern that\'s more relevant in Baner than in quieter suburbs.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat deep cleansing bath in Baner apartment',
      imageLeft: false,
    },
    {
      heading: 'Cat Breeds We Groom Most in Baner',
      subheading: 'One of Pune\'s most cat-dense localities.',
      paragraphs: [
        'Baner has a wonderfully diverse cat community. Here\'s what we see most:',
      ],
      bullets: [
        'Persian cat grooming in Baner — The most popular breed in our Baner bookings. Long coats, dusty from the area\'s air quality, needing thorough cleaning and conditioning. We always include a coat quality report.',
        'British Shorthair grooming in Baner — Classic dense coats that need proper deshedding. We do a full pre and post-bath brush to remove as much loose undercoat as possible.',
        'Maine Coon grooming in Baner — Large, confident cats. The coat is extensive and needs time — we allocate 2–2.5 hours for Maine Coon sessions.',
        'Indie and rescued cats in Baner — Many Baner Indies came from Pashan, Sus Road, and Baner colony rescue operations. They have widely varying temperaments and we adapt fully to each one.',
      ],
      closingLine: 'Baner, Balewadi, Sus Road, Pashan — all covered.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Cat breed grooming at home in Baner',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/baner'),
  nearbyAreas: ['Balewadi', 'Aundh', 'Pashan', 'Wakad', 'Sus Road', 'Hinjewadi'],
};

export const banerCatMapEmbed = 'https://www.google.com/maps?q=Baner,Pune&output=embed';

export const banerCatReviews: LocationReview[] = [
  {
    petName: 'Chai',
    ownerName: 'Preethi Nair',
    area: 'Balewadi',
    review: 'Chai is a ginger Maine Coon who\'s big enough to be intimidating if you don\'t know what you\'re doing. The groomer walked in completely unfazed, let Chai investigate her, and then proceeded to do one of the most thorough cat grooming sessions I\'ve ever seen. The ruff and tail came out beautifully. I\'ve already recommended Sniffy to three people in my complex.',
    rating: 5,
  },
  {
    petName: 'Sushi',
    ownerName: 'Kiran Vora',
    area: 'Baner Road',
    review: 'Sushi is a rescue with a complicated history who doesn\'t like strangers. The groomer\'s approach was genuinely impressive — she read Sushi\'s body language very accurately, paused exactly when needed, and managed a complete session over about 2 hours. Sushi\'s never been this clean and it was done without any of the trauma I\'d been dreading.',
    rating: 5,
  },
];

export const banerFAQsCat: FAQ[] = [
  {
    question: 'Do you cover Balewadi and Sus Road areas near Baner?',
    answer: 'Yes — Balewadi, Sus Road, Baner Main Road, Pashan, and surrounding areas are all within the coverage zone.',
  },
  {
    question: 'Can the groomer handle a very large cat like a Maine Coon?',
    answer: 'Yes. Maine Coons and other large breeds are something our groomers handle regularly. The session takes longer than a standard cat and we price and schedule accordingly. Let us know the breed when booking.',
  },
  {
    question: 'What\'s the minimum age for a first grooming session?',
    answer: 'For a gentle introductory session, 12 weeks is fine. For a full grooming session with bath and dryer, we prefer 16 weeks — kittens before this are still temperature-regulating and a full wash carries more risk. Nail checks and ear checks can happen earlier.',
  },
];

// ════════════════════════════════════════════════════════════
// BAVDHAN
// ════════════════════════════════════════════════════════════

export const bavdhanCatLocation: LocationConfig = {
  name: 'Bavdhan',
  slug: 'cat-grooming-in-pune/bavdhan',

  heroH1: 'Cat Grooming at Home in Bavdhan — Professional Sessions on Your Schedule',
  heroSubtext:
    'Bavdhan\'s quiet hillside living is perfect for cats who like their routines. Sniffy fits into that routine — a trained groomer arrives at your home, does the session, and leaves. Your cat barely needs to adjust.',

  storySections: [
    {
      heading: 'Bavdhan\'s Peaceful Character Extends to Cat Grooming',
      subheading: 'No noise, no chaos — just a proper session.',
      paragraphs: [
        'Bavdhan has a calmer, more spread-out character than most Pune localities — wider roads, more greenery, a less urban pace. The cats here tend to be well-settled and comfortable in their homes. In-home cat grooming in Bavdhan fits perfectly — no disruption to the cat\'s world, no unfamiliar smells or sounds, just a groomer arriving with full equipment and doing the job properly in the cat\'s own space.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Bavdhan Pune',
      imageLeft: true,
    },
    {
      heading: 'Bavdhan\'s Climate and Coat Care',
      subheading: 'Slightly higher altitude, drier air.',
      paragraphs: [
        'Bavdhan\'s elevation gives it slightly drier air than the city proper, which affects coat texture — particularly for longhair cats whose coats can become brittle with insufficient humidity. Our conditioning treatments specifically address this, and our groomers note coat hydration levels at each session so you can manage between visits if needed.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat conditioning treatment in Bavdhan home',
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/bavdhan'),
  nearbyAreas: ['Kothrud', 'Baner', 'Pashan', 'Sus Road', 'Dhayari', 'Paud Road'],
};

export const bavdhanCatMapEmbed = 'https://www.google.com/maps?q=Bavdhan,Pune&output=embed';

export const bavdhanCatReviews: LocationReview[] = [
  {
    petName: 'Marshmallow',
    ownerName: 'Sheetal Chitale',
    area: 'Bavdhan Khurd',
    review: 'Marshmallow is a white Persian and her coat had been getting progressively duller despite my attempts to maintain it. The Sniffy groomer assessed the coat properly and explained what was happening — the dry Bavdhan air combined with the minerals in our water were affecting the coat. She used a different conditioning treatment and the difference after one session was immediately visible.',
    rating: 5,
  },
  {
    petName: 'Rumi',
    ownerName: 'Ninad Joshi',
    area: 'Sus Road',
    review: 'Rumi is a tabby Indie who was feral until about a year ago. I\'d been slowly socialising her and the groomer understood where she was in that process. She didn\'t try to push Rumi into anything, worked very slowly, and managed a full session over about 2.5 hours. Rumi even came back to investigate the groomer at the end. That\'s real progress.',
    rating: 5,
  },
];

export const bavdhanFAQsCat: FAQ[] = [
  {
    question: 'Do the climate conditions in Bavdhan affect cat coat care?',
    answer: 'Slightly, yes. The higher elevation and drier air in Bavdhan can make cat coats more prone to brittleness and static, particularly for longhair breeds. We adapt our conditioning treatment accordingly and can recommend between-session home care if it\'s a persistent issue.',
  },
  {
    question: 'Can you recommend a home grooming routine I can follow between sessions?',
    answer: 'Yes — at the end of every session we\'re happy to suggest the right brush type and frequency for your cat\'s specific coat. A good home routine between professional sessions makes each visit significantly easier and keeps the coat in much better condition.',
  },
  {
    question: 'Is there a cancellation policy?',
    answer: 'We ask for at least 4 hours notice for cancellations or rescheduling. Cancellations with less notice may be subject to a fee. Life happens with cats — we understand — but advance notice helps us manage groomer schedules.',
  },
];

// ════════════════════════════════════════════════════════════
// KHADKI
// ════════════════════════════════════════════════════════════

export const khadkiCatLocation: LocationConfig = {
  name: 'Khadki',
  slug: 'cat-grooming-in-pune/khadki',

  heroH1: 'Cat Grooming at Home in Khadki — Calm, Clean, Done Right',
  heroSubtext:
    'Khadki\'s mixed residential character has a lot of cat-loving households. Sniffy brings professional in-home cat grooming to your door — trained groomers, cat-appropriate setup, zero carrier stress.',

  storySections: [
    {
      heading: 'Khadki\'s Cat Parents Have Options Now',
      subheading: 'At-home grooming that actually covers this area.',
      paragraphs: [
        'Khadki sits between Shivajinagar and Pimpri-Chinchwad — a location that means decent urban access but historically limited specialist pet services. Cat owners here have typically relied on basic grooming options or driven further to find proper cat groomers. Sniffy\'s in-home cat grooming now covers Khadki directly — no travel required, trained groomers who know cats, proper products and technique.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Khadki Pune',
      imageLeft: true,
    },
    {
      heading: 'Defence Colony Cats and Well-Established Homes',
      subheading: 'Cats with history in homes with character.',
      paragraphs: [
        'Khadki has a significant defence housing sector with older, well-established residential communities and cats who have been part of those households for years. These cats often have strong territorial instincts and can be very particular about unfamiliar people. Our low-restraint, patient approach works particularly well with settled, experienced cats who have firm opinions — and we find that the home environment helps enormously.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Settled residential cat being groomed in Khadki',
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/khadki'),
  nearbyAreas: ['Shivajinagar', 'Aundh', 'Pimpri-Chinchwad', 'Camp', 'Bopodi', 'Deccan'],
};

export const khadkiCatMapEmbed = 'https://www.google.com/maps?q=Khadki,Pune&output=embed';

export const khadkiCatReviews: LocationReview[] = [
  {
    petName: 'Raja',
    ownerName: 'Mridula Singh',
    area: 'Khadki Bazar',
    review: 'Raja is a 14-year-old Indie who has been with my family since he was a kitten. Getting him to a salon at this age was never going to work — he\'s too attached to home. The home grooming session was perfect for him. The groomer was very gentle with his old joints and managed a thorough bath, nail trim, and ear clean without causing him any visible distress.',
    rating: 5,
  },
  {
    petName: 'Tara',
    ownerName: 'Sandeep Bhatia',
    area: 'MES Colony',
    review: 'Tara is a Persian who hadn\'t been professionally groomed in over a year because we couldn\'t find anyone suitable locally. Her coat had a few mats and was looking dull. The groomer sorted out the mats patiently, did a proper conditioning wash, and the coat came out soft and shiny. Very professional work.',
    rating: 5,
  },
];

export const khadkiFAQsCat: FAQ[] = [
  {
    question: 'Can you groom a very old cat (14+ years)?',
    answer: 'Yes, and it\'s important that you do. Senior cats need grooming support as their self-grooming ability decreases with age. We handle old cats with extra care — softer products, gentler handling, shorter segments with more rests, and particular attention to arthritic joints. Age 14+ is not too old for professional grooming.',
  },
  {
    question: 'What if the cat is partially paralysed or has limited mobility?',
    answer: 'We adapt fully to physical limitations. A cat with limited mobility is positioned comfortably and we work around their range of movement. It may take longer but we complete a thorough session without causing additional stress.',
  },
  {
    question: 'How do I know the groomer is trained specifically for cats?',
    answer: 'Our groomers complete cat-specific training including feline body language, low-restraint handling, cat-safe product knowledge, and breed-specific coat care. Ask us about our training protocols — we\'re transparent about what our groomers know.',
  },
];

// ════════════════════════════════════════════════════════════
// RAVET
// ════════════════════════════════════════════════════════════

export const ravetCatLocation: LocationConfig = {
  name: 'Ravet',
  slug: 'cat-grooming-in-pune/ravet',

  heroH1: 'Cat Grooming at Home in Ravet — Proper Professional Sessions at Your Door',
  heroSubtext:
    'Ravet\'s cat parents now have a real grooming option. Sniffy covers all of Ravet and surrounding areas — trained groomers who come to your home, fully equipped, ready for your cat.',

  storySections: [
    {
      heading: 'Ravet Is Growing, Its Cat Community Is Growing With It',
      subheading: 'Pet services finally keeping pace.',
      paragraphs: [
        'Ravet and the surrounding Akurdi-Chinchwad belt have seen significant residential development, and with new families come new pets. Cat ownership in this belt has grown steadily, but grooming options have lagged. Sniffy\'s in-home cat grooming now covers all of Ravet — trained groomers, proper equipment, home visits. Your cat gets professionally groomed without either of you leaving home.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Ravet Pune',
      imageLeft: true,
    },
    {
      heading: 'Highway Proximity and Indoor Cat Air Quality',
      subheading: 'Living near the expressway affects more than traffic.',
      paragraphs: [
        'Ravet\'s proximity to the Mumbai-Pune expressway and NH4 means higher airborne particulate levels than most Pune localities. Indoor cats in apartments near these corridors accumulate road dust and vehicle particulates in their coats over time. Our deep cleansing bath and conditioning treatment specifically addresses this buildup — you can often see the water colour change significantly during the first wash of a cat that\'s been in a dusty urban environment.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat deep bath in Ravet home near highway',
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/ravet'),
  nearbyAreas: ['Wakad', 'Pimpri-Chinchwad', 'Akurdi', 'Chinchwad', 'Kasarwadi', 'Kalewadi'],
};

export const ravetCatMapEmbed = 'https://www.google.com/maps?q=Ravet,Pune&output=embed';

export const ravetCatReviews: LocationReview[] = [
  {
    petName: 'Paneer',
    ownerName: 'Ananya Bhosale',
    area: 'Ravet Road',
    review: 'I\'d been looking for a cat groomer in Ravet for months. Either they didn\'t cover the area or they were dog salons that took cats reluctantly. Sniffy was the first service that actually seemed to understand cats. The groomer arrived on time with a full setup and handled Paneer brilliantly — patient, methodical, and genuinely good at reading him.',
    rating: 5,
  },
  {
    petName: 'Kulfi',
    ownerName: 'Rajesh Waghmare',
    area: 'Akurdi',
    review: 'Kulfi is a Persian who had developed a large mat near her back. I\'d been putting off dealing with it because I was worried about how she\'d react. The groomer removed it in about 30 minutes with no cutting required — just patient work with a detangling comb. The rest of the session was smooth and Kulfi\'s coat looked fantastic at the end.',
    rating: 5,
  },
];

export const ravetFAQsCat: FAQ[] = [
  {
    question: 'Do you cover Akurdi and Chinchwad Station area near Ravet?',
    answer: 'Yes — Ravet, Akurdi, Kasarwadi, and surrounding pockets near the NH4 corridor are all within coverage.',
  },
  {
    question: 'How do I tell if my cat has a mat that needs professional attention?',
    answer: 'Mats feel like hard, compressed clumps in the coat — they\'re different from just tangled fur and can\'t be combed out with a regular brush. They\'re most common near the neck (under the collar), armpits, inner legs, and belly. If you feel something that doesn\'t move or brush out easily, that\'s a mat that needs professional attention.',
  },
  {
    question: 'What products do you use and are they Indian formulations?',
    answer: 'We use a mix of quality domestic and imported cat-specific shampoos and conditioners — all pH-balanced for feline skin, free from common irritants. We don\'t use human products or dog-specific products on cats. Specific brand information is available on request.',
  },
];

// ════════════════════════════════════════════════════════════
// AUNDH
// ════════════════════════════════════════════════════════════

export const aundhCatLocation: LocationConfig = {
  name: 'Aundh',
  slug: 'cat-grooming-in-pune/aundh',

  heroH1: 'Cat Grooming at Home in Aundh — Because Cats Deserve a Good Groomer',
  heroSubtext:
    'Aundh\'s established residential community has always had great taste. Sniffy brings professional in-home cat grooming to match — trained groomers, cat-specific technique, full sessions in your home.',

  storySections: [
    {
      heading: 'Aundh\'s Long-Established Cat Community',
      subheading: 'Cats who know their neighbourhood.',
      paragraphs: [
        'Aundh is one of Pune\'s older, better-established residential areas — wide roads, mature trees, and a community feel that extends to its pet-owning population. The cats here are well-loved and, often, quite set in their ways. Any disruption to their routine is taken seriously. At-home cat grooming in Aundh is the obvious solution — familiar environment, familiar smells, one groomer who comes and goes. No disruption to the territory, no recovery period after a stressful salon visit.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Aundh Pune',
      imageLeft: true,
    },
    {
      heading: 'What Goes Into a Proper Cat Grooming Session in Aundh',
      subheading: 'Not a quick wash. A complete service.',
      paragraphs: [
        'We sometimes encounter cat owners who have tried home grooming services before and were disappointed. Usually the issue was an incomplete session — bath only, or bath and nails, skipping ears or coat assessment. Our sessions in Aundh are comprehensive by design — bath, blow-dry, brushing, de-matting if needed, nail trim, ear cleaning, eye area wipe, and a coat condition assessment at the end. We don\'t skip steps because they\'re inconvenient.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Complete cat grooming session in Aundh home',
      imageLeft: false,
    },
    {
      heading: 'Cat Breeds We See in Aundh',
      subheading: 'Classic Pune area, varied cat population.',
      paragraphs: [
        'Aundh has a lovely spread of cat breeds. Here\'s how we handle the most common:',
      ],
      bullets: [
        'Persian cat grooming in Aundh — Long coats need patient, methodical handling. We section the coat, work through any tangles from ends to root, and finish with a conditioning rinse that leaves the coat smooth and shiny.',
        'Siamese cat grooming in Aundh — Sleek coats that are low-maintenance, but Siamese temperament makes the session interesting. They voice their opinions clearly — we respond with a calm, efficient approach that gets the job done before they decide enough is enough.',
        'Indie cat grooming in Aundh — Aundh has been home to many beloved Indies for decades. They tend to be confident cats who assess a situation carefully before deciding how to react. Our patient introduction usually results in cooperative sessions.',
        'Himalayan cat grooming in Aundh — Flat-faced longhair cats with all the complexity of Persians and the added facial care needs of a snub nose. We take particular care around the eye folds and face.',
      ],
      closingLine: 'All of Aundh, Pimple Saudagar side, Anand Park area — all covered.',
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Cat breed grooming at home in Aundh',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/aundh'),
  nearbyAreas: ['Baner', 'Khadki', 'Shivajinagar', 'Pimple Saudagar', 'Wakad', 'Pashan'],
};

export const aundhCatMapEmbed = 'https://www.google.com/maps?q=Aundh,Pune&output=embed';

export const aundhCatReviews: LocationReview[] = [
  {
    petName: 'Hershey',
    ownerName: 'Meenakshi Rao',
    area: 'Anand Park',
    review: 'Hershey is a brown Siamese who communicates her feelings very clearly throughout any grooming session. The Sniffy groomer received the full commentary — every hiss, every protest — and just kept working calmly and efficiently. The whole session was done in under 90 minutes and Hershey came out looking perfect. The groomer said she\'d heard much worse, which is reassuring.',
    rating: 5,
  },
  {
    petName: 'Misty',
    ownerName: 'Deepak Chitnis',
    area: 'Pimple Saudagar',
    review: 'Misty had never had her nails trimmed professionally and they\'d gotten quite long. I was nervous about it — I\'d tried once and she\'d scratched me badly. The groomer had a completely different approach, wrapped Misty gently and worked nail by nail with pauses between. All done with no incident. The technique makes an enormous difference.',
    rating: 5,
  },
];

export const aundhFAQsCat: FAQ[] = [
  {
    question: 'Can you advise on the right grooming schedule for my cat\'s specific breed?',
    answer: 'Yes, at the end of every session we\'ll give you a recommended schedule based on your cat\'s coat type, shedding pattern, and condition observed during the session. This isn\'t a generic answer — it\'s based on what we actually saw with your cat.',
  },
  {
    question: 'My cat only tolerates being touched by me — will a stranger be able to groom her?',
    answer: 'More often than you\'d expect, yes. Cats are territorial but they also respond well to a patient, non-threatening approach. A stranger who moves calmly, avoids direct eye contact initially, and doesn\'t try to pick up the cat immediately is often accepted more easily than owners expect. We\'ve had many sessions that the owner predicted would fail turn out smoothly.',
  },
  {
    question: 'Do you groom outdoor cats?',
    answer: 'Yes, with appropriate handling. Outdoor cats tend to be more independent and less tolerant of extended handling. We adjust the session accordingly and always include a tick check and inspection for any skin issues that outdoor exposure can cause.',
  },
];

// ════════════════════════════════════════════════════════════
// KALEWADI
// ════════════════════════════════════════════════════════════

export const kalewadiCatLocation: LocationConfig = {
  name: 'Kalewadi',
  slug: 'cat-grooming-in-pune/kalewadi',

  heroH1: 'Cat Grooming at Home in Kalewadi — Trained Groomers, Your Doorstep',
  heroSubtext:
    'Kalewadi\'s cat parents don\'t need to travel for proper grooming anymore. Sniffy sends trained cat groomers to your home — full session, cat-safe products, and the patience the job actually requires.',

  storySections: [
    {
      heading: 'Kalewadi\'s Working Families and Their Cats',
      subheading: 'At-home grooming that fits your schedule.',
      paragraphs: [
        'Kalewadi has a practical, working-family character — people with full schedules who need services that come to them rather than the other way around. At-home cat grooming fits perfectly into this lifestyle. Book a slot, the groomer arrives at your home, does a full professional session, and your cat is clean and groomed without you having to take time out of your day for a salon trip.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Kalewadi Pune',
      imageLeft: true,
    },
    {
      heading: 'Kalewadi\'s Industrial Belt and Cat Coat Health',
      subheading: 'Industrial area dust settles on everything.',
      paragraphs: [
        'Kalewadi\'s proximity to Pimpri-Chinchwad\'s industrial areas means higher-than-average dust and particulate matter in the air. Indoor cats absorb this through their coats. Regular professional grooming with a deep cleansing wash removes this accumulation and protects skin health. Our groomers in Kalewadi include a thorough coat and skin assessment at every session to catch any irritation early.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat deep bath in Kalewadi home',
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/kalewadi'),
  nearbyAreas: ['Ravet', 'Wakad', 'Pimpri-Chinchwad', 'Khadki', 'Bhosari', 'Pimple Saudagar'],
};

export const kalewadiCatMapEmbed = 'https://www.google.com/maps?q=Kalewadi,Pune&output=embed';

export const kalewadiCatReviews: LocationReview[] = [
  {
    petName: 'Nimbu',
    ownerName: 'Ashwini Rokade',
    area: 'Kalewadi Phata',
    review: 'Finding a cat groomer who actually covers Kalewadi was a challenge. Most services I found either didn\'t cover the area or clearly had no experience with cats. The Sniffy groomer was immediately different — she knew what she was doing with cats specifically. Nimbu came through the session much better than expected and the whole thing was done properly.',
    rating: 5,
  },
  {
    petName: 'Dosa',
    ownerName: 'Prashant Shinde',
    area: 'Bhosari',
    review: 'Dosa is an orange tabby who hasn\'t been professionally groomed in two years because I could never find someone good nearby. His nails had gotten long and his coat was dull. The groomer sorted everything out in one session — proper deshedding, nail trim, ear clean. He looks and presumably feels much better.',
    rating: 5,
  },
];

export const kalewadieFAQsCat: FAQ[] = [
  {
    question: 'Do you cover Bhosari and nearby PCMC areas near Kalewadi?',
    answer: 'Yes — Kalewadi, Bhosari, Pimple Saudagar, and surrounding pockets of north Pune are covered. Message us if you\'re unsure about your specific location.',
  },
  {
    question: 'Can I pay after the session is complete?',
    answer: 'Yes, payment is collected at the end of the session — cash or UPI. You can verify you\'re happy with the work before paying.',
  },
  {
    question: 'My cat has fleas — should I groom or treat first?',
    answer: 'We can use an anti-flea shampoo during the grooming session that addresses active flea presence. However, grooming alone won\'t eliminate a flea infestation — you\'ll also need to treat the home environment. We recommend talking to your vet about a comprehensive flea treatment plan, and grooming as part of that process.',
  },
];

// ════════════════════════════════════════════════════════════
// KATRAJ
// ════════════════════════════════════════════════════════════

export const katrajCatLocation: LocationConfig = {
  name: 'Katraj',
  slug: 'cat-grooming-in-pune/katraj',

  heroH1: 'Cat Grooming at Home in Katraj — Calm, Complete, Cat-Specific',
  heroSubtext:
    'Katraj\'s growing residential community now has proper in-home cat grooming. Sniffy sends trained groomers to your door — your cat stays home, the session comes to them.',

  storySections: [
    {
      heading: 'Katraj\'s Cat Parents Have Always Made Do',
      subheading: 'Time to do it properly.',
      paragraphs: [
        'Katraj has expanded rapidly and is now a fully-formed residential area, but grooming services haven\'t matched that growth. Cat owners here have been DIY-grooming, travelling far, or simply going without regular professional sessions. Sniffy\'s in-home cat grooming in Katraj fills that gap — trained groomers, proper equipment, professional sessions at your home.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Katraj Pune',
      imageLeft: true,
    },
    {
      heading: 'South Pune Climate and Longhair Cat Maintenance',
      subheading: 'Humidity and seasonal changes managed.',
      paragraphs: [
        'Katraj sits in south Pune where the climate tends toward higher humidity during monsoon months. For longhair cats, this humidity accelerates mat formation — a coat that was manageable in February can develop serious tangles by July without regular professional sessions. We adjust our approach seasonally, using lighter conditioning rinses in humid months and heavier conditioning treatments in the drier winter months.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Seasonal cat coat care in Katraj home',
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/katraj'),
  nearbyAreas: ['NIBM', 'Ambegaon', 'Kondhwa', 'Narhe', 'Dhayari', 'Bibewadi'],
};

export const katrajCatMapEmbed = 'https://www.google.com/maps?q=Katraj,Pune&output=embed';

export const katrajCatReviews: LocationReview[] = [
  {
    petName: 'Butter',
    ownerName: 'Varsha Shirke',
    area: 'Katraj Chowk',
    review: 'Butter is a cream Persian who had developed bad mats during the monsoon season. I\'d been trying to manage them at home with very limited success. The groomer removed every single mat over the course of a 2-hour session without cutting any of them — pure patience and skill. The coat underneath was actually in good condition, just hidden by the matting.',
    rating: 5,
  },
  {
    petName: 'Samosa',
    ownerName: 'Nitin Kulkarni',
    area: 'Kondhwa Road Side',
    review: 'Samosa is an Indie rescue who is generally suspicious of everything and everyone. The groomer spent the first 15 minutes just sitting near him, letting him get used to her presence. By the time she actually started the grooming he was much calmer than expected. Not a perfect session but a genuinely good one given his background.',
    rating: 5,
  },
];

export const katrajFAQsCat: FAQ[] = [
  {
    question: 'How does the monsoon season affect cat grooming needs?',
    answer: 'Humidity during monsoon months accelerates mat formation in longhair cats and increases skin fungal issues in all breeds. We recommend more frequent grooming during the June-September period — every 4–5 weeks for longhair cats rather than the usual 6–8. We use antifungal shampoos as a preventive measure during this period for at-risk cats.',
  },
  {
    question: 'What do you do if a cat won\'t let you clean their ears?',
    answer: 'Ear cleaning is often the least tolerated part of grooming. We use a very gentle technique with minimal product insertion and work quickly once the cat is positioned. If a cat truly won\'t allow ear cleaning, we do what we can and note it for the owner to follow up with a vet.',
  },
  {
    question: 'Can you tell me honestly if my cat\'s coat is in poor condition?',
    answer: 'Yes, and we will. At the end of every session we give an honest assessment of coat condition, any issues we noticed (skin, ears, nails, eyes), and recommendations for follow-up care. We\'re not here to make you feel bad — we\'re here to give your cat what they need.',
  },
];

// ════════════════════════════════════════════════════════════
// HANDEWADI
// ════════════════════════════════════════════════════════════

export const handewadiCatLocation: LocationConfig = {
  name: 'Handewadi',
  slug: 'cat-grooming-in-pune/handewadi',

  heroH1: 'Cat Grooming at Home in Handewadi — Professional Care, No Travel',
  heroSubtext:
    'Handewadi\'s cat community now has proper grooming access. Sniffy brings trained cat groomers directly to your home — full session, cat-appropriate handling, no carrier required.',

  storySections: [
    {
      heading: 'Handewadi\'s Quiet Development Has a Cat Problem',
      subheading: 'Growing community, limited grooming options.',
      paragraphs: [
        'Handewadi has been developing steadily as a residential extension of south Pune, but professional pet services are still catching up with the residential growth. Cat owners here have had limited options — basic salons that don\'t specialise in cats, or long trips to Kondhwa or NIBM. Sniffy\'s in-home cat grooming now covers Handewadi directly — trained groomers, proper equipment, professional results at your home.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Handewadi Pune',
      imageLeft: true,
    },
    {
      heading: 'At-Home Grooming Is Simply Better for Cats',
      subheading: 'The science behind why familiar environments matter.',
      paragraphs: [
        'Cats have a fundamentally different relationship with territory than dogs. Their home is not just a comfortable place — it\'s their psychological anchor. Removing them from it causes stress responses that remain elevated throughout a salon visit and often for hours to days afterward. In-home grooming means the cat\'s cortisol levels are lower from the start, they can retreat to familiar spots between steps, and they have the option to approach the groomer on their own terms. This produces calmer sessions and better grooming outcomes.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Calm cat grooming session at home in Handewadi',
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/handewadi'),
  nearbyAreas: ['NIBM', 'Kondhwa', 'Undri', 'Mohammadwadi', 'Ambegaon', 'Katraj'],
};

export const handewadiCatMapEmbed = 'https://www.google.com/maps?q=Handewadi,Pune&output=embed';

export const handewadiCatReviews: LocationReview[] = [
  {
    petName: 'Keshar',
    ownerName: 'Archana Birajdar',
    area: 'Handewadi Road',
    review: 'Keshar is a golden tabby who had gone ungroomed for a long time because I couldn\'t find a good cat groomer locally. His coat wasn\'t in terrible shape but definitely needed proper professional attention. The Sniffy groomer did a thorough job — deshedding, conditioning bath, nail trim, everything. He came out looking like a different cat.',
    rating: 5,
  },
  {
    petName: 'Rani',
    ownerName: 'Supriya Mane',
    area: 'Undri Road',
    review: 'Rani is a rescue who spent her first year as a street cat. She has anxiety around strangers but the groomer\'s approach was so measured that Rani actually sat through the full session. She was on alert the whole time but there was no aggression, no hiding, no drama. Really well done.',
    rating: 5,
  },
];

export const handewadiFAQsCat: FAQ[] = [
  {
    question: 'How do I get my cat used to being groomed at home for the first time?',
    answer: 'In the days before the session, leave the grooming area accessible so the cat can investigate it. Don\'t change their routine significantly the day of the session. During the session, stay present and calm — your energy affects your cat\'s state. Don\'t intervene unless asked, but being there helps the cat feel safer.',
  },
  {
    question: 'Can you groom two cats in the same household back to back?',
    answer: 'Yes, we can do back-to-back sessions in the same home. It helps to separate the cats during each other\'s sessions so the grooming smells and sounds of one don\'t unsettle the other. The second cat often benefits from hearing that the first session went fine.',
  },
  {
    question: 'What areas near Handewadi do you also cover?',
    answer: 'We cover Handewadi, Undri, Mohammadwadi, NIBM Road, and surrounding pockets of south-east Pune. Message us with your pincode if you\'re unsure about coverage.',
  },
];

// ════════════════════════════════════════════════════════════
// HADAPSAR
// ════════════════════════════════════════════════════════════

export const hadapsarCatLocation: LocationConfig = {
  name: 'Hadapsar',
  slug: 'cat-grooming-in-pune/hadapsar',

  heroH1: 'Cat Grooming at Home in Hadapsar — From Magarpatta to Manjri, Covered',
  heroSubtext:
    'Hadapsar\'s large residential footprint now has proper in-home cat grooming coverage. Sniffy sends trained groomers to your home — full session, all breeds, no carrier needed.',

  storySections: [
    {
      heading: 'Hadapsar\'s Massive Residential Spread Needs Local Coverage',
      subheading: 'We cover the whole area.',
      paragraphs: [
        'Hadapsar is one of Pune\'s largest residential areas, stretching from Magarpatta through Manjri, Phursungi, and toward the city outskirts. The cat-owning population here is substantial but spread out, and good grooming services have historically been concentrated toward the more central parts of the locality. Sniffy\'s in-home model means coverage isn\'t limited by the location of a salon — our groomers travel to you, wherever you are across Hadapsar.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Hadapsar Pune',
      imageLeft: true,
    },
    {
      heading: 'Tech Park Adjacency and Indoor Cat Life in Hadapsar',
      subheading: 'High-rise apartments, air conditioning, and cat coat health.',
      paragraphs: [
        'Hadapsar\'s Magarpatta township and surrounding areas are home to many IT professionals and their apartment cats — cats who live in air-conditioned environments year round. As discussed for other IT-adjacent areas, constant AC reduces coat moisture and can cause static buildup and skin dryness over time. Our conditioning treatments address this specifically and our groomers note coat hydration at each session.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat coat care in Hadapsar apartment',
      imageLeft: false,
    },
    {
      heading: 'Breeds We Groom Across Hadapsar',
      subheading: 'Large area, diverse cat community.',
      paragraphs: [
        'Hadapsar has everything from luxury apartment Persians to rescued Indies from the industrial outskirts. Here\'s how we approach the most common breeds:',
      ],
      bullets: [
        'Persian cat grooming in Hadapsar — The most booked cat type across all of Hadapsar. Long coats, dusty from the area\'s construction and traffic, need thorough cleaning and conditioning. Magarpatta Persians tend to have drier coats from constant AC — we adjust the conditioning treatment accordingly.',
        'Indie cat grooming in Hadapsar — A significant proportion of Hadapsar Indies came from the area\'s industrial outskirts. They tend to be streetwise, confident, and watchful. Patient introductions usually result in workable sessions.',
        'British Shorthair and Bengal grooming in Hadapsar — Bengals are increasingly common in Hadapsar\'s younger professional apartments. Their short, patterned coats need different handling — Bengals are typically more active and less tolerant of extended sessions, so we work efficiently.',
        'Ragdoll and semi-longhair grooming in Hadapsar — Semi-longhair cats in Hadapsar\'s humid south often develop belly matting quickly. We pay particular attention to these prone areas.',
      ],
      closingLine: 'Magarpatta, Manjri, Phursungi, Keshavnagar — all of Hadapsar covered.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Cat breed grooming in Hadapsar home',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/hadapsar'),
  nearbyAreas: ['Kharadi', 'Mundhwa', 'Magarpatta', 'Manjri', 'Wanowrie', 'Phursungi', 'Keshavnagar'],
};

export const hadapsarCatMapEmbed = 'https://www.google.com/maps?q=Hadapsar,Pune&output=embed';

export const hadapsarCatReviews: LocationReview[] = [
  {
    petName: 'Zoey',
    ownerName: 'Pallavi Mehta',
    area: 'Magarpatta City',
    review: 'Zoey is a Bengal who is genuinely high-energy and very particular about personal boundaries. The groomer handled her incredibly well — kept the session moving so Zoey didn\'t have time to get bored and difficult, and worked through the nails and ears with the kind of speed and precision that a Bengal requires. Best grooming session Zoey has had.',
    rating: 5,
  },
  {
    petName: 'Peanut',
    ownerName: 'Aakash Jain',
    area: 'Keshavnagar',
    review: 'Peanut is a white Persian who I adopted three months ago. She\'d been living in a breeding environment and had never had a calm, attentive grooming session. The groomer was extraordinary with her — the patience, the gentle handling, the care taken with the coat. Peanut sat through it almost completely without protest, which I genuinely didn\'t expect.',
    rating: 5,
  },
];

export const hadapsarFAQsCat: FAQ[] = [
  {
    question: 'Do you cover Manjri and Phursungi areas near Hadapsar?',
    answer: 'Yes — Hadapsar main area, Magarpatta, Keshavnagar, Manjri, and Phursungi are all within coverage. Message us with your pincode if you\'re on the outer edge.',
  },
  {
    question: 'My cat came from a breeding environment — how do I handle their first grooming session?',
    answer: 'Cats from breeding environments often haven\'t had individualised, calm grooming experiences. They may be used to being handled but not necessarily in a gentle one-on-one manner. We approach these cats with extra patience during the introduction phase and build trust before beginning. First sessions from breeding backgrounds typically go better than owners expect.',
  },
  {
    question: 'Can you tell if my cat needs a vet visit based on what you see during grooming?',
    answer: 'We can flag observations — ear redness, skin conditions, unusual lumps, dental concerns, or abnormal nail growth — but we\'re groomers, not vets. We\'ll tell you what we noticed and recommend a vet follow-up for anything that warrants it. We\'d rather flag something unnecessary than miss something important.',
  },
];

// ════════════════════════════════════════════════════════════
// BIBEWADI
// ════════════════════════════════════════════════════════════

export const bibewadiCatLocation: LocationConfig = {
  name: 'Bibewadi',
  slug: 'cat-grooming-in-pune/bibewadi',

  heroH1: 'Cat Grooming at Home in Bibewadi — Proper Sessions, No Fuss',
  heroSubtext:
    'Bibewadi\'s growing residential area now has proper in-home cat grooming. Sniffy sends trained groomers to your door — full session, all breeds, no carrier required.',

  storySections: [
    {
      heading: 'Bibewadi\'s Residential Growth Needs Better Pet Services',
      subheading: 'We\'re here now.',
      paragraphs: [
        'Bibewadi has grown significantly along the Sinhagad Road corridor and now has a proper residential population with a meaningful cat-owning community. Professional cat grooming options have been limited here — Sniffy fills that gap with in-home sessions that bring a trained groomer directly to your door, fully equipped for a professional cat grooming session.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Bibewadi Pune',
      imageLeft: true,
    },
    {
      heading: 'Why Cats Do So Much Better at Home Than at Salons',
      subheading: 'Territory matters more to cats than anything else.',
      paragraphs: [
        'Cats mark and defend their territory actively. It\'s not just preference — it\'s deeply wired behaviour. A salon is an alien territory full of other animals\' smells, unfamiliar humans, and no safe retreat. A cat taken to a salon is dealing with all of that in addition to the grooming itself. At home, the territory is theirs. The smells are familiar. There are places to retreat to between steps. The result is consistently lower stress and better grooming outcomes — not because we\'re doing anything dramatically different, but because the environment makes it possible.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Stress-free cat grooming in Bibewadi home',
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/bibewadi'),
  nearbyAreas: ['Katraj', 'Kondhwa', 'NIBM', 'Sahakarnagar', 'Sinhagad Road', 'Dhayari'],
};

export const bibewadiCatMapEmbed = 'https://www.google.com/maps?q=Bibewadi,Pune&output=embed';

export const bibewadiCatReviews: LocationReview[] = [
  {
    petName: 'Goldie',
    ownerName: 'Sujata Pawar',
    area: 'Bibewadi Main Road',
    review: 'Goldie is a golden Persian who hadn\'t been groomed properly in over a year. The mat situation was getting out of hand. The Sniffy groomer came with full de-matting equipment and worked through every single mat over the course of a long session. Goldie was surprisingly patient, the groomer was impressively skilled, and the coat at the end looked beautiful.',
    rating: 5,
  },
  {
    petName: 'Bingo',
    ownerName: 'Rakesh Jagtap',
    area: 'Sinhagad Road',
    review: 'Bingo is a tabby who\'d only ever been groomed at a pet shop that primarily does dogs. He always came back stressed and hid for two days after. The home session was a complete turnaround — calm throughout, didn\'t hide afterward, and actually ate dinner normally. The different environment makes a massive difference.',
    rating: 5,
  },
];

export const bibewadiAQsCat: FAQ[] = [
  {
    question: 'How do I choose between a standard grooming session and a full groom with haircut?',
    answer: 'Standard sessions cover bath, brush, nails, and ears — everything your cat needs for health and hygiene. Haircuts (lion cuts, teddy bear cuts) are aesthetic add-ons and are most useful for heavily matted longhair cats where coat management is becoming unsustainable. We can advise at the session whether a haircut would be beneficial.',
  },
  {
    question: 'My cat gets dandruff — can grooming help?',
    answer: 'Often yes. Cat dandruff (dander flaking) is frequently caused by dry skin, poor diet, or insufficient grooming frequency. A conditioning wash with a moisturising shampoo, followed by proper drying, can significantly reduce visible dandruff. If it\'s persistent, it may have an underlying cause worth discussing with a vet.',
  },
  {
    question: 'Is the session noisy? My cat is sound-sensitive.',
    answer: 'The main noise element is the hair dryer. We use a lower-noise dryer on the lowest speed setting and can do most of the drying with towels if your cat is very sensitive to sound. Mention sound sensitivity at booking and we\'ll plan around it.',
  },
];

// ════════════════════════════════════════════════════════════
// CAMP
// ════════════════════════════════════════════════════════════

export const campCatLocation: LocationConfig = {
  name: 'Camp',
  slug: 'cat-grooming-in-pune/camp',

  heroH1: 'Cat Grooming at Home in Camp — Old Pune\'s Cats, Modern Care',
  heroSubtext:
    'Camp\'s heritage bungalows and colonial-era apartments are home to some of Pune\'s most character-filled cats. Sniffy brings professional in-home grooming to them — no carrier, no salon, just proper care at home.',

  storySections: [
    {
      heading: 'Camp\'s Cats Have History',
      subheading: 'They deserve grooming that respects that.',
      paragraphs: [
        'Camp is one of Pune\'s oldest neighbourhoods — bungalows with gardens, flats in heritage buildings, a pace of life that still has some grace to it. The cats here often share that character — older, more settled, deeply territorial, and somewhat allergic to change. In-home cat grooming suits Camp perfectly. We come to the cat\'s environment, work within it, and leave without disrupting anything more than necessary.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Camp Pune',
      imageLeft: true,
    },
    {
      heading: 'Heritage Buildings and Indoor Cat Humidity',
      subheading: 'Older building materials affect air quality differently.',
      paragraphs: [
        'Camp\'s older buildings hold humidity differently than modern construction — concrete-and-glass apartments are dryer, while older bungalows can be damper. Both extremes affect cat coat health in different ways. Our groomers note the environment at each session and adjust products accordingly — drier environments get heavier conditioning treatment, damper environments benefit from lighter, antifungal-enhanced products.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat grooming session in Camp heritage home',
      imageLeft: false,
    },
    {
      heading: 'Cat Breeds We Groom in Camp',
      subheading: 'Old Pune character, varied cat personalities.',
      paragraphs: [
        'Camp has a wonderful range of cats — from long-established household cats to newer adoptees. Here\'s what we see most often:',
      ],
      bullets: [
        'Persian cat grooming in Camp — Long present in Camp\'s more affluent households. Many of these Persians are older, established cats with strong personalities and established grooming preferences. We adapt to meet each individual cat.',
        'Indie cat grooming in Camp — Camp has a long-established stray cat community and many beloved rescues. These cats range from fully socialised to semi-feral and we approach each one as an individual.',
        'Siamese and Oriental grooming in Camp — A breed that suits Camp\'s character somehow. Sleek, opinionated, and communicative throughout. We keep sessions brisk and efficient to match their energy.',
        'Domestic longhair and mixed-breed grooming in Camp — Many Camp cats are beautiful mixed-breed longhairs with no obvious pedigree. They need the same coat attention as any longhair — regular detangling, conditioning, and de-shedding.',
      ],
      closingLine: 'All of Camp, Boat Club Road, East Street area — covered.',
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Cat breed grooming at home in Camp Pune',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/camp'),
  nearbyAreas: ['Koregaon Park', 'Shivajinagar', 'Khadki', 'Wanowrie', 'Hadapsar', 'East Street'],
};

export const campCatMapEmbed = 'https://www.google.com/maps?q=Camp,Pune&output=embed';

export const campCatReviews: LocationReview[] = [
  {
    petName: 'Empress',
    ownerName: 'Nalini Pinto',
    area: 'Boat Club Road',
    review: 'Empress is an 8-year-old Siamese who has lived in the same Boat Club Road flat since she was a kitten and has strong opinions about her territory. She tolerated grooming at home far better than she ever did at the salon — being on her own turf made a visible difference in how she behaved. The groomer handled her very professionally. Empress was vocal but never genuinely hostile.',
    rating: 5,
  },
  {
    petName: 'Hercules',
    ownerName: 'Felix D\'Souza',
    area: 'East Street',
    review: 'Hercules is a big, fluffy mixed-breed longhair who has a dramatic response to everything. I was nervous about bringing a stranger home for grooming. The groomer was completely calm about it — let Hercules bluster, waited him out, and then did a thorough and professional session. Hercules was back to his usual self within the hour. Really well handled.',
    rating: 5,
  },
];

export const campFAQsCat: FAQ[] = [
  {
    question: 'Do you groom cats in older buildings or bungalows? Is the setup adaptable?',
    answer: 'Yes, absolutely. Our setup requires only a clear surface, water access, and a power outlet. We can work in a bathroom, kitchen, or any room with basic utilities. Heritage buildings and bungalows are not a problem.',
  },
  {
    question: 'My cat has lived here for 12 years — will they accept a new groomer?',
    answer: 'Long-established cats are often more settled and predictable than younger cats, which can actually make grooming easier. They have their routines and expectations but they\'ve also seen enough of the world to not panic at a calm stranger. The home environment helps enormously for these cats.',
  },
  {
    question: 'Can I tip the groomer directly?',
    answer: 'Tips are warmly appreciated by our groomers and can be given directly in cash at the end of the session. They\'re entirely optional.',
  },
];

// ════════════════════════════════════════════════════════════
// WANOWRIE
// ════════════════════════════════════════════════════════════

export const wanowrieCatLocation: LocationConfig = {
  name: 'Wanowrie',
  slug: 'cat-grooming-in-pune/wanowrie',

  heroH1: 'Cat Grooming at Home in Wanowrie — No Carrier, No Stress, Done Right',
  heroSubtext:
    'Wanowrie\'s cat parents have a proper option now. Sniffy sends trained cat groomers to your home — complete session, cat-specific products, patient approach. Your cat stays comfortable throughout.',

  storySections: [
    {
      heading: 'Wanowrie\'s Defence and Residential Character Suits At-Home Grooming',
      subheading: 'Established community, well-loved cats.',
      paragraphs: [
        'Wanowrie has a mix of defence housing and civilian residential areas — an established, settled community with cats who\'ve been part of these households for years. These cats are typically territorial and routine-focused. Taking them to a salon disrupts everything — the journey, the smells, the other animals. At-home grooming in Wanowrie fits their character perfectly: we come to their space, do the work, and leave without disrupting their world more than necessary.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming at home in Wanowrie Pune',
      imageLeft: true,
    },
    {
      heading: 'South-East Pune Climate and Cat Coat Health in Wanowrie',
      subheading: 'Seasonal maintenance matters.',
      paragraphs: [
        'Wanowrie sits in Pune\'s south-east, an area that experiences the full range of Pune\'s seasons — dry summers, humid monsoons, and mild winters. Each season affects cat coats differently. Our groomers adjust products and techniques seasonally: heavier conditioning in winter months when coats dry out, lighter antifungal-enhanced products during monsoon when fungal skin issues are more common, and de-shedding focus in summer when coat turnover increases.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Seasonal cat coat care in Wanowrie home',
      imageLeft: false,
    },
    {
      heading: 'What to Expect from Your First Sniffy Cat Grooming Session in Wanowrie',
      subheading: 'From booking to clean cat.',
      paragraphs: [
        'Here\'s the complete picture of what happens from booking to session completion:',
      ],
      bullets: [
        'You book via the website or WhatsApp — mentioning your cat\'s breed, any health notes, and whether it\'s their first professional grooming session.',
        'The groomer arrives within the booked time slot with a complete setup.',
        'Introduction time — the groomer lets your cat investigate them and the equipment at their own pace.',
        'Pre-bath brush and coat assessment.',
        'Bath with cat-specific shampoo and conditioning treatment.',
        'Low-heat blow-dry — or primarily towel-dry for dryer-sensitive cats.',
        'Post-bath brush, de-matting if needed, finishing comb.',
        'Nail trim, ear clean, eye area wipe.',
        'Coat condition report and any observations — what went well, what to watch, recommendations for home care.',
        'Payment collected, groomer leaves. Your cat usually starts self-grooming within the hour — a sign they\'re satisfied with how they smell.',
      ],
      closingLine: 'Total time: 90 minutes to 2.5 hours depending on breed and coat condition.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Complete cat grooming process in Wanowrie',
      imageLeft: true,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/wanowrie'),
  nearbyAreas: ['Hadapsar', 'Kondhwa', 'NIBM', 'Undri', 'Mohammadwadi', 'Bibewadi'],
};

export const wanowrieCatMapEmbed = 'https://www.google.com/maps?q=Wanowrie,Pune&output=embed';

export const wanowrieCatReviews: LocationReview[] = [
  {
    petName: 'General',
    ownerName: 'Meera Pillai',
    area: 'Wanowrie Defence Colony',
    review: 'General is a 10-year-old defence colony cat who has been the king of this household for a decade. He has never accepted grooming gracefully. The Sniffy groomer spent time letting General assess the situation — which he did very thoroughly — and then proceeded with the session in a way that was clearly respectful of his dignity. It sounds odd but it worked. General tolerated the full session with minimal protest.',
    rating: 5,
  },
  {
    petName: 'Jasmine',
    ownerName: 'Aditya Kumar',
    area: 'Sus Road Wanowrie',
    review: 'Jasmine is a Persian who developed a significant mat problem during the monsoon season. I\'d been nervous about booking because I was afraid the groomer would just cut the mats out. She removed every single one without cutting — patient, skilled work that took about 45 minutes just for the de-matting portion. The rest of the session was smooth and Jasmine looked amazing at the end.',
    rating: 5,
  },
];

export const wanowrieFAQsCat: FAQ[] = [
  {
    question: 'Is it normal for a cat to start grooming themselves immediately after a professional session?',
    answer: 'Yes, and it\'s actually a positive sign. Cats self-groom after handling to restore their own scent and "sort out" how they smell. If your cat starts grooming soon after the session, it generally means they\'re relaxed and comfortable, not distressed. A cat that retreats and doesn\'t groom for hours may still be processing the experience.',
  },
  {
    question: 'My cat is currently on antibiotics. Should I wait to book?',
    answer: 'In most cases, grooming during antibiotic treatment is fine — the bath won\'t affect the medication. If the antibiotics are for a skin condition or wound, wait until the area has healed sufficiently. When in doubt, check with your vet.',
  },
  {
    question: 'How do you handle payment?',
    answer: 'Payment is at the end of the session by cash or UPI. We don\'t collect advance payment — you pay only after the session is complete and you\'re satisfied with the work.',
  },
];
