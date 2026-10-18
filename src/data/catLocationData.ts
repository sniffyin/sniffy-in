import type { LocationConfig } from '../components/location/LocationHero';
import type { LocationReview } from '../components/location/LocationReviews';
import type { FAQ } from '../components/location/LocationFAQs';
import { ALL_CAT_PUNE_CITIES } from './puneLocalities';

// ─── All Pune localities for cat grooming pages ────────────────────────────

// See ./puneLocalities — kept out of this module so importing area NAMES does
// not pull in the locality copy below. Re-exported for existing importers.
export { ALL_CAT_PUNE_CITIES } from './puneLocalities';

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
    question: 'Does somebody have to be at home while you groom?',
    answer: 'Yes, the pet owner or a trusted adult should be present throughout. This helps the cat feel more secure and means someone familiar can reassure them during tense moments.',
  },
  {
    question: 'How often does a cat need professional grooming?',
    answer: 'Shorthair cats can go 8–10 weeks between sessions. Longhair breeds like Persians and Maine Coons ideally every 4–6 weeks to prevent matting. If your cat sheds heavily or goes outdoors, more frequent sessions help a lot.',
  },
  {
    question: 'What does a cat grooming session in Dhanori cost?',
    answer: 'A spa bath starts at ₹799, a haircut is ₹999, and a bath with a full haircut is ₹1,299. Deshedding, nail trimming, ear cleaning, a sanitary trim and the coat and skin check are all part of the package rather than separate charges. Optional add-ons run from ₹149 to ₹299 — tick and flea care, a medicated bath, a destressing massage — and are quoted to you before the groomer starts. There is no doorstep or travel fee for Dhanori, Porwal Road, Kalas or Tingre Nagar, and payment is taken at the end by cash or UPI once you have seen the work.',
  },
  {
    question: 'Do you cover Porwal Road, Kalas and Tingre Nagar for cat grooming?',
    answer: 'Yes, along with the Vishrantwadi side and the older Dhanori core. This belt has grown faster than its road names have settled, so if your society is known locally by the builder name rather than the street, send a pin with the booking and the groomer will find you first time.'
  },
  {
    question: 'Aircraft noise from the airport approach startles my cat. Does that affect the session?',
    answer: 'It can, and it is worth mentioning at booking. Cats in Dhanori and Kalas live under the Lohegaon approach, and a low overflight during the dryer stage is two loud things at once for an animal already tolerating one. The groomer pauses through it rather than pushing on, and uses a lower fan setting for longer.'
  },
  {
    question: 'Litter tray granules get stuck in my cat\'s back fur. Is that something you deal with?',
    answer: 'Routinely, and it is more common in longhairs than most owners realise. Clay and clumping granules bind into the fur around the hind legs and under the tail, and once wet they set hard. We comb them out before the bath rather than washing them in, and trimming the fur around the sanitary area is usually the fix that stops it recurring.'
  },
  {
    question: 'Should I take my cat\'s collar off before the groomer arrives?',
    answer: 'Leave it on until the groomer is inside with the door shut, then it comes off for the session. A collar traps moisture against the neck during a bath and the fur underneath is where we most often find matting that owners have never seen. It goes back on before the groomer leaves.'
  },
  {
    question: 'Our water supply runs on fixed timings. Does a cat session need much?',
    answer: 'Very little — a cat bath uses a fraction of what a dog needs, and two filled buckets cover a full session comfortably. If your supply is timed, keep those ready before the slot and tell the groomer on arrival so they work from stored water deliberately rather than finding the tap dry mid-rinse.'
  }
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
    {
      heading: 'High-Rise Flats, Open Balconies, and the Risk Nobody Plans For',
      subheading: 'The one part of the session we ask you to prepare.',
      paragraphs: [
        'Kondhwa has gone vertical faster than almost anywhere in south Pune, and a large share of our sessions here happen on the ninth, twelfth, fifteenth floor. That changes one thing about the visit, and it is the only thing we genuinely need your help with.',
        'A grooming session involves an open front door for a minute or two while the groomer brings the kit in, an unfamiliar person, and at some point a dryer. Even a placid cat can bolt at an unexpected moment, and in a high-rise the two places it heads for are the front door and the balcony. Cats do not have a reliable sense of height, and an unscreened balcony railing is not the barrier people assume it is — vets in Pune see the results of this every monsoon, when windows get left open.',
        'So before we arrive: close the balcony door, shut any window that opens wide enough for a cat, and close off lofts and storage spaces. If your balcony is netted, tell us and we can work with it open. It takes thirty seconds and it removes the only real hazard in the entire session. The groomer will check the room before starting anyway, but you know your flat and its gaps better than we do.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Safe cat grooming setup in a high-rise flat in Kondhwa Pune',
      imageLeft: true,
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
  {
    question: 'Do you cover Undri, Mohammadwadi and the NIBM Road side from Kondhwa?',
    answer: 'Yes — Kondhwa Budruk and Khurd, NIBM Road, Undri, Mohammadwadi, Wanowrie and the Bibewadi border are all part of the same route for us. It is one of our denser coverage pockets, so short-notice slots are more often available here than in the outer suburbs. If your society is on the far side of Undri, send a location pin and we will confirm before you commit to a time.',
  },
  {
    question: 'We adopted a cat last week. Should we wait before booking a grooming session?',
    answer: 'Wait, yes — usually two to three weeks. A newly adopted cat is still working out whether your home is safe, and adding a stranger with a dryer to that week is asking a lot. Give it time to eat normally, use the litter tray reliably and stop hiding, then book. The exception is a cat that has arrived visibly matted, flea-ridden or filthy, in which case an early session is worth the stress — tell us the situation and the groomer will keep the first visit short and focused on essentials rather than attempting a complete groom.',
  },
  {
    question: 'Does the power going out mid-session cause a problem?',
    answer: 'Only the drying stage needs electricity, so a cut pauses things rather than ending them. Tell the groomer which sockets are on your inverter if you have one. A damp cat is genuinely not something we will walk away from — if power is out we towel-dry thoroughly, keep the room warm and wait rather than call the session finished.'
  },
  {
    question: 'Do your groomers speak Marathi or Hindi? My mother will be at home, not me.',
    answer: 'Yes — our groomers work in Marathi, Hindi and functional English, and in Kondhwa all three come up in a normal week. Tell us at booking if an elderly family member will be handling the visit so we can make sure the groomer and the household share a language for the parts that matter.'
  },
  {
    question: 'Is it harder to get a slot around Eid and Diwali?',
    answer: 'Noticeably, yes. Those weeks concentrate everyone\'s booking into the same few days across Kondhwa and NIBM, and slots go about a week ahead. For a noise-sensitive cat the more useful advice is to book before the festival rather than during it — fireworks and a stranger with a dryer on the same evening is a lot to ask.'
  },
  {
    question: 'My cat is FIV positive. Will you still groom her?',
    answer: 'Yes. FIV is not transmissible to humans or to other species and it does not spread through grooming contact, so it changes nothing about whether we come. What it does change is care: FIV cats heal more slowly, so we are especially careful around thin skin and mat lines, and we flag any lesion or sore we find rather than working over it.'
  },
  {
    question: 'We have a balcony net for the cat. Should it stay up during the session?',
    answer: 'Please leave it up. The riskiest moment in any home cat session is not the bath, it is the few seconds when a door opens and a startled cat bolts — and in a Kondhwa high-rise the balcony is where they head. We work in one closed room with the door shut for exactly this reason, and a netted balcony is a second layer we would rather have than not.'
  }
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
    {
      heading: 'Winter in Kothrud Catches Cat Owners Out Every Year',
      subheading: 'The coat change nobody plans for.',
      paragraphs: [
        'Pune winters are mild by any sensible standard, and that is exactly why people ignore them. But Kothrud sits low and the December-to-February nights here drop further than the daytime temperature suggests, and cats respond to the change in daylight rather than to the thermometer. From roughly late October the undercoat thickens noticeably, and by January most longhaired cats in this area are carrying substantially more coat than they were in September.',
        'Two things follow, and they arrive together. First, the thicker undercoat mats much more readily, because there is simply more of it packed close to the skin — a Persian that went eight weeks between sessions comfortably in the monsoon will be knotting at six in January. Second, and less obviously, owners bathe their cats less in winter because it feels unkind, so the interval stretches at exactly the point it should be shortening.',
        'Our advice for Kothrud is unglamorous: keep the schedule the same or slightly tighter through winter, and let us handle the drying properly rather than skipping the bath. A cat dried completely on low heat is not cold — a cat left damp is, and that is the actual risk people are half-remembering. Then expect a heavy shed in March when the whole winter coat comes off at once, and book accordingly.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Winter coat care for cats during a home grooming session in Kothrud Pune',
      imageLeft: false,
    },
    {
      heading: 'De-Matting: What We Can Save, and What Has to Come Off',
      subheading: 'The decision we explain before we make it.',
      paragraphs: [
        'De-matting is the part of the job with an actual judgement call in it, and it is worth knowing how that call gets made before your groomer is standing in your bathroom making it.',
        'A mat that is loose enough to move against the skin can usually be saved. The groomer works detangler into it, holds the fur at the base so the pull is on their fingers rather than on your cat\'s skin, and teases it apart from the outer edge inward with a comb, a few strands at a time. It is slow and it is the reason a matted cat takes ninety minutes instead of sixty. Done properly the cat keeps its coat and feels nothing worse than mild tugging.',
        'A mat that is tight and flat against the skin cannot be saved, and attempting it is the wrong answer. The skin underneath a set mat is often already inflamed, sometimes broken, and it lifts with the mat when you pull — which is how cats get cut during de-matting. In that case we clip it out at the base with a guarded blade, leaving a short patch that will regrow within a couple of months. We will tell you before we do it, show you the skin underneath, and explain why.',
        'The honest summary: nearly every mat is preventable with a comb and five minutes a day, and nearly every mat we clip out belonged to a cat whose owner did not know the coat had knotted underneath. If we clip one, ask the groomer to show you where it formed. That is where the next one will be.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'De-matting a longhaired cat during a home grooming session in Kothrud Pune',
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
  {
    question: 'How much does cat grooming in Kothrud cost?',
    answer: 'A spa bath session starts at ₹799. A haircut is ₹999, and a bath together with a full haircut is ₹1,299. Nail trimming, ear cleaning, deshedding, a sanitary trim and the coat and skin check are included in all of those rather than charged separately. Optional extras — a medicated bath, tick and flea care, a destressing massage — are priced at ₹149 to ₹299 and are always quoted to you before the groomer starts, never added at the end.',
  },
  {
    question: 'My cat is strictly indoor and never gets dirty. Does she really need professional grooming?',
    answer: 'Being clean and being groomed are different things, and an indoor cat is genuinely cleaner than most. What she cannot do for herself is trim a claw that is starting to curve towards the pad, clear wax from the bend of her own ear canal, or remove the dead undercoat sitting close to her skin — which she instead swallows and brings back up on your floor. Indoor cats also tend to be less active, and a less active cat is more likely to be carrying weight that stops it reaching its own back. An eight to ten week interval is usually plenty for a healthy indoor shorthair. That is much less than a Persian needs, but it is not zero.',
  },
  {
    question: 'How do bookings work around Ganpati week in Kothrud?',
    answer: 'Book at least a week ahead. The lanes around Karve Road and Paud Road become unpredictable during processions and we cannot hold arrival windows the way we normally would. For a sound-sensitive cat the better plan is a session in the quiet week before the festival — a cat coping with a dryer and drumming outside is being asked for too much.'
  },
  {
    question: 'We live on the fourth floor of an old building with no lift. Is that workable?',
    answer: 'Entirely. The groomer carries everything in one shoulder bag and the cat never leaves the flat, which is the whole point — no carrier, no stairs, no car. Older Kothrud walk-ups are among the most common addresses we work in.'
  },
  {
    question: 'Our water comes for two hours a day. Is that enough?',
    answer: 'Easily. A cat bath uses far less water than people expect — two filled buckets are plenty for a full session including the rinse. Keep them ready before the slot and mention it to the groomer on arrival so they plan the rinse from stored water.'
  },
  {
    question: 'My cat scratches the furniture badly. Will nail trimming actually stop that?',
    answer: 'It reduces the damage, not the behaviour. Trimming takes the sharp hook off the claw so the same scratching does much less to your sofa, but a cat scratches to mark and to stretch, and no trim removes that instinct. Nail trims plus a scratching post the cat actually likes is the combination that works. We do not apply claw caps and we would not recommend declawing under any circumstances.'
  },
  {
    question: 'Can I bathe my cat myself between your sessions?',
    answer: 'You can, but for most cats you should not need to, and doing it too often strips the coat oils that keep the skin healthy. If you do, use a cat-specific shampoo only — dog shampoo is genuinely unsafe on cats — and the part people get wrong is drying. A cat left damp in Pune humidity stays wet at the skin for hours, which is how fungal patches begin.'
  }
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
    {
      heading: 'Cat Breeds We Groom Around NIBM',
      subheading: 'A pedigree-heavy pocket with very particular coats.',
      paragraphs: [
        'The NIBM Road belt has one of the highest concentrations of pedigree cats we encounter anywhere in Pune — a lot of considered, researched purchases rather than accidental adoptions, and owners who already know what their cat\'s coat is supposed to look like. Here is what we handle most:',
      ],
      bullets: [
        'Persian cat grooming in NIBM — The most common longhair here and the one where standards are highest. We section the coat, detangle with the fur held at the base so nothing pulls at the skin, and finish with a low-heat dry that keeps volume without frizz.',
        'Maine Coon grooming in NIBM — Several of Pune\'s largest cats live along this road. The ruff, the britches and the tail need individual attention, and the drying stage takes as long as everything else combined. We never cut that short.',
        'Ragdoll grooming in NIBM — Deceptively easy. The coat has little undercoat so it looks after itself on top, then mats abruptly behind the front legs and in the trousers. We check those first, every time.',
        'Scottish Fold grooming in NIBM — The folded ear traps wax and moisture in a way an upright ear does not. Cleaning here is careful and shallow, and we look closely for redness, because ear infections in Folds are easy to miss until they are advanced.',
        'British Shorthair and Bengal grooming in NIBM — Two very different short coats. The British Shorthair needs serious deshedding; the Bengal mostly needs claws and a conditioning wash to keep the rosettes sharp rather than dusty.',
      ],
      closingLine: 'Bring us a show-standard coat or a rescue of unknown ancestry — the method changes, the care does not.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Pedigree cat breed grooming at home in NIBM Pune',
      imageLeft: false,
    },
    {
      heading: 'The Lion Cut — When It Is Right, and When It Is Not',
      subheading: 'The most requested and most misunderstood thing we do.',
      paragraphs: [
        'A lion cut takes the body coat down to a few millimetres while leaving the head, the lower legs and a tuft at the end of the tail — hence the name. On NIBM Road it is probably the single most asked-about service, usually somewhere around April.',
        'There are cases where it is clearly the right call. A cat whose coat has matted beyond de-matting gets far more relief from a clip than from an hour of pulling. An elderly or arthritic cat who genuinely cannot maintain its own back half benefits enormously and permanently. A very heavy-coated cat with recurring skin problems underneath is easier to treat and to monitor once the coat is off.',
        'And there are cases where it is not. A cat\'s coat is insulation in both directions — it keeps heat out as much as in — so shaving a healthy cat "for the summer" does less for its comfort than people assume, and removes its protection against sunburn on the ears, nose and belly, which is a real problem for a cat that suns itself on a balcony. Regrowth takes three to six months and does not always come back with the same texture; on some cats the guard hairs return patchily. Occasionally the coat never fully recovers its original look.',
        'So we will do it, and we will tell you honestly which of those two situations your cat is in. If the answer is that a good deshedding session and a shorter interval would solve the problem without a clipper, we will say that first.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Lion cut cat grooming consultation at home in NIBM Pune',
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
  {
    question: 'How long does the coat take to grow back after a lion cut?',
    answer: 'Three to six months for most cats, depending on age, breed and general health. A young Persian regrows quickly and fully; an older cat or one with an underlying skin or thyroid condition can take longer and sometimes regrows unevenly. The guard hairs — the longer outer coat — come back last, so there is an in-between stage of a few weeks where the coat looks soft and slightly woolly. That is normal. It is also the main reason we talk you through the decision properly rather than just taking the booking.',
  },
  {
    question: 'Can the session happen on our balcony or in the society\'s pet area instead of inside the flat?',
    answer: 'Inside is almost always better, and we would gently push back on the alternatives. A balcony means an open edge and a cat that may bolt; a shared society pet area means the smells of every other animal that has used it, which is the exact stress a home session exists to avoid. If your concern is mess indoors, that is solvable — the bath happens in your bathroom and the drying on a mat we bring and take away, so there is nothing to clean up afterwards. If there is a genuine constraint at your end, talk to us and we will work something out, but a fully enclosed indoor space is what we ask for.',
  },
  {
    question: 'Our township needs a gate pass for service visitors. How do we arrange that?',
    answer: 'Tell us at booking and we will send the groomer\'s name and number ahead of the slot so you can raise the entry on the app or with the gate. The NIBM townships are strict about pre-approval, and without it the groomer waits at the barrier — which comes out of your session time rather than ours.'
  },
  {
    question: 'Which parts of the NIBM Road belt do you reach for cat grooming?',
    answer: 'The NIBM Road spine itself, Undri, Mohammed Wadi and the large gated townships on either side. Several run to multiple phases under a single name, so mention your phase or tower at booking — arriving at the right society and the wrong gate is the most common reason a session starts late here.'
  },
  {
    question: 'My cat has asthma. Is the dryer safe for her?',
    answer: 'It needs care, and you should tell us at booking. We use a low-noise dryer on its lowest setting, keep the airflow off the face entirely, work in a well-ventilated room and stop at any sign of laboured breathing. For an asthmatic cat we would also skip any perfume or finishing spray. If your vet has advised against bathing altogether, follow the vet.'
  },
  {
    question: 'We are relocating abroad with our cat. What should be done beforehand?',
    answer: 'A full groom two to three days before the flight — nails short, coat combed out, no mats — so nothing needs handling on travel day. Do not bathe a cat the morning of a flight; a damp undercoat in a cold hold is genuinely uncomfortable. Schedule tightly around the vet health certificate, not around the grooming.'
  },
  {
    question: 'I travel often. Can my house staff be present instead of me?',
    answer: 'Yes, provided the cat is comfortable with them and you are reachable by phone. Someone the cat knows needs to be in the house. What we will not do is make a decision that changes your cat — clipping down a matted coat, for instance — on a staff member\'s authority. That call comes to you directly, even if the groomer waits on the line.'
  }
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
    {
      heading: 'A Year of Cat Grooming in PCMC, Season by Season',
      subheading: 'The same cat needs different things in March and in August.',
      paragraphs: [
        'PCMC gets a harder version of Pune\'s weather than the city centre does — hotter in April because of the concrete and the industrial belt, wetter underfoot in the monsoon, and dustier all year. Cats here do best on a grooming plan that shifts with the calendar rather than a fixed routine repeated twelve times.',
        'February to April is the big shed. The winter undercoat comes off in one enormous wave and this is when deshedding earns its keep — expect to want a session every four to five weeks through this stretch regardless of coat length, and expect to be startled by the volume of fur that comes out. May and June are about heat management: lighter conditioning, no heavy oils, and a hygiene trim rather than a full clip for longhaired cats. This is the point where people ask about lion cuts, and it is usually not necessary.',
        'July to September is the difficult quarter. Humidity keeps the undercoat damp, mats form quickly and quietly, and fungal skin issues are at their annual peak — a damp cat in a PCMC monsoon is a genuine risk, not a theoretical one. We shorten the interval for longhaired cats, extend the drying stage considerably, and use an antifungal formula where a cat has a history of it. October to January is the easiest stretch: the coat thickens for winter, matting slows, and an eight-week rhythm is fine for most cats — as long as the coat is actually being combed at home while it grows in.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Seasonal cat grooming calendar for Pimpri-Chinchwad Pune',
      imageLeft: false,
    },
    {
      heading: 'Which Package Does Your Cat Actually Need?',
      subheading: 'Three options, and most cats only need the first one.',
      paragraphs: [
        'Our pricing is published and there are only three packages, which makes the choice simpler than most services make it sound.',
        'The spa bath at ₹799 is the standard session and it is what the large majority of cats in PCMC should be booking. It covers the bath with cat-specific shampoo and conditioner, a full low-heat dry, a dry brush-out and deshedding, nail trim, ear clean, sanitary trim and a coat and skin check. Nothing about it is a stripped-down version — it is the complete maintenance session.',
        'The haircut at ₹999 is for cats who need length taken off: a matted longhair, a cat with recurring skin problems under a heavy coat, or a senior who can no longer manage its own back half. The combined bath and haircut at ₹1,299 is that plus the full wash, which is what most cats needing a clip actually want, since clipping a dirty coat blunts blades and gives a worse finish.',
        'Then there are add-ons, priced from ₹149 to ₹299 — tick and flea care, a medicated bath for a fungal or bacterial issue, a destressing massage, a hygiene trim around the face and rear. These are genuinely optional. If your cat does not need one, the groomer will tell you so rather than selling it, and if your cat does need one you will hear the price before anything starts.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat grooming packages and pricing in Pimpri-Chinchwad Pune',
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
  {
    question: 'The water in our building is very hard. Does that affect the grooming?',
    answer: 'It does, and it is common right across the PCMC belt. Hard water stops shampoo rinsing out cleanly, so residue stays in the undercoat and the fur feels rough and looks dull even straight after a wash — which is why bathing at home often does not give the result people expect. Our groomers work around it with a clarifying first wash, a conditioner that stays effective in mineral-heavy water, and a much longer rinse than most people do at home. If your supply is particularly hard, the groomer will say so and suggest what to change in your own routine.',
  },
  {
    question: 'My cat disappears into the loft the moment anyone rings the bell. What then?',
    answer: 'Then we would rather you shut the loft before we arrive than spend forty minutes negotiating with a cat wedged behind the water tank. The single most useful thing you can do is close off lofts, storage spaces and any gap behind furniture about half an hour before the slot, while the cat is still relaxed and in the open. If she does get up there anyway, we wait rather than reach — dragging a frightened cat out of a hiding place undoes any chance of a calm session. If she stays put, we will reschedule the remainder without charging for the return visit.',
  },
  {
    question: 'What time slots do you run across PCMC?',
    answer: 'Nine in the morning to nine at night, every day of the week. Across Pimpri, Chinchwad, Akurdi, Nigdi, Bhosari and Moshi the evening slots after 6 PM and the whole weekend are the ones that fill first, because so many households here have both adults on a full-time schedule. Weekday mornings are usually available at a day or two\'s notice. PCMC is a wide area for us to cover, so we give an arrival window rather than an exact minute, and the groomer messages you when they set off.',
  },
  {
    question: 'Does the industrial dust here settle in a cat\'s coat?',
    answer: 'It does, and indoor cats are not exempt — particulate comes in through windows and settles on every surface the cat then lies on. A cat self-grooming in the PCMC belt is swallowing more of it than a cat in a leafier part of the city. It is a real argument for keeping to the shorter end of the recommended interval rather than stretching it.'
  },
  {
    question: 'We live in an older chawl-style building with a small bathroom. Is that enough space?',
    answer: 'Yes. A cat session needs one room that can be closed, a tap and a plug point — not a large space. Compact flats across Pimpri and Chinchwad gaon are a normal part of our week. A smaller room is often better for a nervous cat than a large one, because there are fewer places to bolt to.'
  },
  {
    question: 'I work rotating shifts. Can I get an unusual slot?',
    answer: 'Anywhere in our 9 AM to 9 PM window, yes, and shift work is a common reason people book here. What we cannot do is a 6 AM or an overnight visit. If your off-day falls midweek that works in your favour — midweek daytime slots across PCMC are the easiest to get at short notice.'
  },
  {
    question: 'Is a woman groomer available if our household would prefer one?',
    answer: 'Yes — tell us at booking and we will schedule accordingly. It is a routine request across PCMC and we would far rather arrange it than have you uncomfortable during a home visit. The only honest caveat is availability: it may mean a different day or a wider arrival window than your first choice.'
  },
  {
    question: 'My cat is not microchipped and has no collar. Should I be worried during the session?',
    answer: 'It is worth taking seriously, which is why we work in one closed room with the door shut throughout. The one genuine risk in a home session is a startled cat getting out of the flat, and an unchipped cat that gets out in a dense area like this is very hard to recover. Keep the main door shut and tell any household member not to open it while the groomer is working.'
  }
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
    {
      heading: 'Rescues, Strays and Cats With No Known History',
      subheading: 'Wagholi takes in more cats than almost anywhere we work.',
      paragraphs: [
        'Between the construction sites, the older village lanes and the sheer number of new societies, Wagholi generates and absorbs a lot of stray cats. A large share of our bookings here are for animals that arrived as adults with no paperwork, no age, and no idea what has been done to them before.',
        'That changes how a first session runs. We assume nothing. We do not know whether this cat has ever been bathed, whether it has been hurt by a person before, or whether the flinch when a hand comes over its head means something. So the groomer works from the side rather than from above, keeps hands where the cat can see them, and treats every unfamiliar step as something to introduce rather than perform. We also look harder than usual — old healed injuries, a notched ear from a sterilisation programme, ear mites from an outdoor litter, and flea dirt are all common findings on a first session with a rescue.',
        'What we ask from you is simply the truth about what you know. "She was on the street until March and she bites when she is frightened" is more useful to a groomer than any breed or age. Nobody is judging the cat, and a warned groomer is a calm groomer.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Rescue cat first grooming session at home in Wagholi Pune',
      imageLeft: false,
    },
    {
      heading: 'What Happens If the Session Cannot Be Finished',
      subheading: 'Sometimes the cat wins, and that is an acceptable outcome.',
      paragraphs: [
        'Most services do not put this in writing, so here it is. Occasionally a cat decides partway through that it has had enough — it goes rigid, it starts genuinely lashing out rather than protesting, or it gets somewhere we cannot safely reach. When that happens, we stop.',
        'The reason is not squeamishness. A cat pushed past its limit does not simply endure the rest of the session; it learns that being groomed is something to fight, and every future session gets harder. One completed groom is not worth three years of a cat that bolts at the sight of a bag. It is also a safety question — a frightened cat can injure a groomer badly, and a struggling cat under a clipper can be cut.',
        'In practice we do the essentials first for exactly this reason, so if we stop early the important work is already done. You pay for what was completed, not the full package, and we will come back to finish at no charge for the return visit. If the cat is one that simply will not tolerate handling from anyone, we will tell you that honestly and suggest talking to your vet about a sedated groom rather than taking your money for a second attempt we do not expect to work.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Low-restraint cat handling during a home grooming session in Wagholi Pune',
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
  {
    question: 'Do you cover Kesnand Road, Bakori Phata and the Lonikand side of Wagholi?',
    answer: 'Yes — Wagholi proper, Kesnand Road, Bakori Phata, Lonikand, the Tulapur side and the stretch back towards Kharadi are all on our route. Wagholi is geographically spread out and the Nagar Road traffic is unpredictable, so we give a slightly wider arrival window here than for the inner suburbs and the groomer messages you when they leave the previous booking.',
  },
  {
    question: 'The cat we took in is badly matted. Can that be sorted in one session?',
    answer: 'Usually, but not always in the way people hope. If the mats are loose enough to move against the skin, the groomer can work them apart with detangler and a comb, and it is simply a longer session. If they are set flat against the skin — which is common on a cat that has been outdoors for months — they have to be clipped out, because pulling at a set mat lifts the skin with it and that is how cats get cut. You will end up with a cat that has some short patches and feels considerably better. We will explain which situation yours is before starting, and if it is severe enough to need sedation we will tell you to see a vet instead.',
  },
  {
    question: 'How soon can you come? My cat needs grooming fairly urgently.',
    answer: 'Weekday morning and early afternoon slots in Wagholi are often available the next day, sometimes the same day if a groomer is already routed this side. Evenings and weekends need more notice — three to five days is realistic. If it is genuinely urgent, say so when you message rather than booking the first slot you see; we can sometimes reshuffle a route. And if what you are describing is a blocked rear, an injury or a cat that has stopped eating, please call a vet first. That is not a grooming problem.',
  },
  {
    question: 'Does the constant construction around here affect an indoor cat\'s coat?',
    answer: 'Yes, more than owners expect. Fine cement and quarry dust drifts indoors, settles on the surfaces the cat sleeps on, and ends up in the coat and then swallowed during self-grooming. For cats living beside active building work in Wagholi we would keep to the shorter end of the interval rather than stretching it.'
  },
  {
    question: 'Our society is on tanker water some weeks. Is that enough for a cat session?',
    answer: 'Comfortably. A cat bath uses far less water than a dog\'s — two filled buckets cover wash and rinse for a full session. If the tanker day is unpredictable, keep those ready before the slot and tell the groomer on arrival so they work from stored water rather than the tap.'
  },
  {
    question: 'What is the earliest a groomer can reach Wagholi?',
    answer: 'From around 9 AM comfortably, earlier by arrangement. The practical constraint is the inbound Nagar Road stretch, which a groomer coming from the western side hits head-on — so early Wagholi slots are assigned to groomers already based on this side of the city rather than promised and then missed.'
  },
  {
    question: 'My cat swallows a lot of fur and vomits hairballs. Can grooming reduce that?',
    answer: 'Directly, yes — it is one of the clearest benefits of regular cat grooming. Every loose hair the groomer removes is a hair your cat does not swallow while self-cleaning. A longhair on a proper deshedding schedule usually brings up noticeably fewer hairballs within two or three sessions. If they continue regardless, that is a conversation for your vet rather than for us.'
  },
  {
    question: 'The cat sleeps on the bed. Does grooming actually help with fur on the bedding?',
    answer: 'It helps a great deal, and more than brushing at home does. A proper deshedding session pulls out the loose undercoat in one place instead of letting it shed across your bed for the next six weeks. It will not stop shedding — no session does — but it moves most of it into the groomer\'s bag rather than onto your sheets.'
  }
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
    {
      heading: 'No Cage, No Restraint Bag, No Scruffing',
      subheading: 'How we actually hold a cat, and what we refuse to do.',
      paragraphs: [
        'Walk into a busy grooming setup anywhere and you will see the standard toolkit for a difficult cat: a mesh restraint bag, a scruff hold, a cage dryer to leave them in while the groomer works on something else. We use none of the three, and it is worth explaining why rather than just claiming to be gentler.',
        'Scruffing — gripping the loose skin at the back of the neck — works on a kitten because a queen carries her litter that way. On an adult cat it does not induce calm; it induces immobility through fear, and the cat remembers. A restraint bag has the same problem at greater scale: the cat cannot move at all, so it stops resisting, and everyone mistakes shutdown for cooperation. Cage dryers are worse again, because the cat is confined with a noise it cannot escape and nobody is watching it closely.',
        'What we do instead is slower and, in a home, entirely workable. The cat is on a non-slip mat rather than a slippery table, so it is not bracing against falling the whole time. One hand rests on the body for steadiness rather than gripping. We work from the side, never looming over the head. When the cat tenses we stop and wait a few seconds rather than pushing through — and that pause, repeated a dozen times across a session, is most of what separates a calm groom from a fight. In Shivajinagar, where flats are compact and there is nowhere to take a cat away to, this is the only approach that actually works.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Low-restraint cat handling technique during home grooming in Shivajinagar Pune',
      imageLeft: false,
    },
    {
      heading: 'The 24 Hours After the Groomer Leaves',
      subheading: 'What is normal, and what is worth a phone call.',
      paragraphs: [
        'Nobody warns first-time clients about the evening after a grooming session, so people worry unnecessarily. Here is what usually happens.',
        'Your cat will almost certainly re-groom itself thoroughly for the next hour or two. This looks like an insult and is actually just a cat putting its own scent back on a coat that now smells faintly of shampoo. Some cats sulk under a bed for an hour. Some are unusually affectionate. A few are noticeably more active, which is a real effect — a cat carrying less dead undercoat is genuinely more comfortable. If you have more than one cat, expect some hissing at the newly washed one for a few hours until the household smell settles; it passes on its own and is not a sign of anything wrong.',
        'What is not normal: refusing food the next day, hiding for longer than a few hours in a cat that is not usually a hider, limping, repeated head-shaking after an ear clean, or any redness on the skin. None of those are common, and all of them are worth telling us about and mentioning to your vet. We would far rather hear that something seemed off than have you assume it was just the grooming. Message us the next day either way if you are unsure — the groomer will remember your cat and will tell you honestly whether what you are describing is expected.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat resting at home after a grooming session in Shivajinagar Pune',
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
  {
    question: 'Our lane is narrow and there is nowhere to park. Is that a problem?',
    answer: 'Not really — this is central Pune and we expect it. Our groomers travel by two-wheeler with the kit in a single bag precisely because half of Shivajinagar, Deccan and the FC Road lanes cannot take a car. What does help is a clear landmark rather than an address: the building name, the shop on the corner, which side of the lane. Google\'s pin is frequently wrong in the older parts of this area, so a WhatsApp location plus one sentence of directions saves everybody ten minutes.',
  },
  {
    question: 'My cat is deaf. Does that change how the session is handled?',
    answer: 'Yes, and it is useful to tell us in advance. A deaf cat cannot hear the groomer approaching, so being touched unexpectedly is genuinely startling in a way it would not be for a hearing cat. The groomer will make sure to come into her line of sight before making contact, use firmer and more predictable hand pressure rather than light touches, and let her see the clipper and the dryer before either is switched on. The dryer itself is often less of an issue for a deaf cat than a hearing one — it is the vibration and the airflow they react to, not the noise.',
  },
  {
    question: 'Do you work on Sundays and public holidays?',
    answer: 'Yes, seven days a week from 9 AM to 9 PM, holidays included. Sundays are our busiest day across central Pune, so a Sunday slot in Shivajinagar generally needs four or five days\' notice. If you want a specific time rather than whatever is left, book earlier in the week. Weekday mornings here are usually available at a day\'s notice.',
  },
  {
    question: 'Do you cover the older wada buildings in central Shivajinagar?',
    answer: 'Yes, and they are a normal address for us. What matters is one room that can be shut, a tap and a plug point — not modern plumbing. If the only usable socket is a long way from where your cat is comfortable, mention it and the groomer will set up around the cat rather than move the cat to the socket.'
  },
  {
    question: 'Our lane gets very noisy with traffic and horns. Does that unsettle a cat mid-session?',
    answer: 'Most central Shivajinagar cats are thoroughly habituated to it, so usually no. For a cat that genuinely is reactive, we work in the room furthest from the road with the windows shut, and use the dryer on its lowest setting for longer rather than a faster, louder dry.'
  },
  {
    question: 'Can I book just a nail trim without the full session?',
    answer: 'Yes — a short maintenance visit for nails and an ear clean is available below the full session price. Ask for it by name. For an indoor shorthair it is often all that is genuinely needed between full grooms, and for an elderly owner who cannot safely trim a squirming cat it is the most useful thing we do.'
  },
  {
    question: 'My cat is blind. Does that change how the session runs?',
    answer: 'It changes the approach rather than the outcome. A blind cat relies on scent and sound, so the groomer announces themselves by touch before every step instead of reaching in silently, keeps the tools in one place, and does not move the cat around the room unnecessarily. Blind cats often groom very calmly, because a session at home is on ground they already know.'
  },
  {
    question: 'How does grooming work during Ganpati week here?',
    answer: 'Book early and, if you can, book before the festival rather than during it. Processions close the central lanes at short notice and we cannot hold arrival windows reliably. For a sound-sensitive cat, a session on a night with drumming outside is asking them to cope with two stressful things at once.'
  }
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
    {
      heading: 'Cat Allergies in a Sealed, Air-Conditioned Flat',
      subheading: 'Grooming will not cure it. It does change the load.',
      paragraphs: [
        'This comes up more in Wakad than anywhere else we work, and it is usually the same conversation: someone in the household has developed a reaction, the flat is a modern sealed unit with the AC running most of the year, and the family is quietly wondering whether they can keep the cat.',
        'The first thing worth knowing is that people are not allergic to cat hair. The trigger is a protein the cat produces in its saliva and skin oils, which dries onto the coat during self-grooming and then travels on flakes of skin — dander — that are small enough to stay airborne for hours. In a sealed air-conditioned flat with the same air recirculating, that dander does not settle and disperse the way it would in a ventilated house. It accumulates. Which is why the reaction often appears after moving into a newer building, with the same cat that caused no trouble before.',
        'Grooming does not remove the protein and nobody can honestly promise it will. What a proper session does is wash off a large share of the dried saliva and loose dander currently on the coat, and remove the dead undercoat that would otherwise shed continuously and carry that protein around the flat. Households that move to a four-week rhythm generally report a real, if partial, improvement. Combine it with an air purifier, keeping the bedroom cat-free, and washing bedding weekly, and it is usually enough. If it is not, that is a conversation for a doctor rather than a groomer — but do not rehome the cat before trying the boring version first.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Reducing cat dander through regular grooming in an air-conditioned Wakad flat',
      imageLeft: false,
    },
    {
      heading: 'Booking Around a Working-From-Home Day',
      subheading: 'Wakad runs on calls. We can work around them.',
      paragraphs: [
        'A large share of our Wakad clients are on video calls for most of the working day, and the honest question they ask is how much noise a grooming session actually makes.',
        'Less than you would think, but not none. Most of the session is silent — the inspection, the brush-out, claws, the comb-through, the ear clean. The bath is quiet running water behind a closed bathroom door. There is one genuinely noisy stretch: the dryer, which runs anywhere from ten minutes for a shorthair to forty for a thick double coat, at roughly the volume of a domestic hairdryer. Clippers, if a haircut is involved, are a low buzz rather than a whine.',
        'The practical arrangement most people land on is to tell the groomer at the start when the calls are, and let them sequence around it — the quiet work first, the dryer during your lunch break. It works better than it sounds, because the order of a grooming session is fairly flexible once claws are done. Book a slot that starts an hour before a gap in your calendar rather than trying to squeeze it into a fifteen-minute window, and shut the door of the room you work in so the cat does not choose it as a hiding place halfway through.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Quiet at-home cat grooming session during a work-from-home day in Wakad Pune',
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
  {
    question: 'Someone in our house has become allergic to the cat. Will regular grooming help enough to keep her?',
    answer: 'Often, partially — and it is worth trying before making any bigger decision. Bathing removes a good share of the dried saliva protein and loose dander sitting on the coat, and deshedding stops that material being distributed around a sealed flat for the next month. Households that shift to a four-week rhythm usually report a genuine improvement rather than a cure. Pair it with an air purifier, a cat-free bedroom and weekly washing of soft furnishings. If the reaction is severe or involves breathing difficulty, that is a doctor\'s call, not ours, and we will not pretend otherwise.',
  },
  {
    question: 'I take video calls all day. How disruptive is the session going to be?',
    answer: 'Mostly not at all. The inspection, brushing, nail trim, comb-through and ear clean are silent, and the bath is running water behind a closed door. The one noisy part is the dryer — ten minutes for a shorthair, up to forty for a thick coat, at about the volume of a domestic hairdryer. Tell the groomer when your calls are as soon as they arrive and they will reorder the session so the loud stretch lands in a gap. It works well; the sequence is flexible once claws are out of the way.',
  },
  {
    question: 'We have a dog as well. Does living with a dog change anything for the cat\'s session?',
    answer: 'Only in the logistics. Put the dog in another room with the door closed for the whole visit — not because anything will go wrong, but because a cat that is already dealing with a stranger and a dryer does not need an excited dog adding to it, and most dogs find the grooming kit extremely interesting. If you want both animals groomed, we can do that in the same visit; separate rooms, separate equipment, and we clean everything down in between. Cats generally go first, as they are the ones who cope least well with waiting.',
  },
  {
    question: 'What is your last slot? I only get back from Hinjewadi after seven.',
    answer: 'The last workable start is around 7 PM so the coat is fully dry before the groomer leaves. We run to 9 PM, but a session beginning at 8 either finishes rushed or finishes with a damp cat, and we will do neither. Wakad evening slots fill early in the week because of exactly this commute — book several days ahead.'
  },
  {
    question: 'Our society logs service visitors on an app. What details do you provide?',
    answer: 'Tell us at booking and we will send the groomer\'s name and number ahead of the slot so the entry can be pre-approved. Several of the large Wakad townships now require this, and a pre-logged visit means the groomer walks in rather than standing at the gate while your slot runs down.'
  },
  {
    question: 'The roads flood in monsoon here. Do sessions get cancelled?',
    answer: 'Rarely cancelled, sometimes moved. If the Wakad–Kalewadi stretch or the Dange Chowk approach is genuinely waterlogged we call and reschedule rather than send a groomer through it with electrical equipment. Rescheduling costs you nothing. Arriving late and rushing your cat\'s session is the outcome we are avoiding.'
  },
  {
    question: 'My cat came from abroad with us. Does an imported cat need different care here?',
    answer: 'The coat does need adjusting to. A cat that grew its coat in a temperate climate meets Pune humidity and sheds heavily and unpredictably for the first year, and longhairs mat faster here than their owners are used to. We would start on a tighter interval than you kept previously and relax it once the coat has settled into a local rhythm.'
  },
  {
    question: 'Can you groom a cat in a high-rise without the balcony being a risk?',
    answer: 'That is exactly why we work in one closed room with the door shut for the whole session. The genuine danger in any home cat groom is a startled cat bolting, and in a Wakad tower the balcony is where they go — cats have no reliable sense of height and a railing is not the barrier people assume. Keep balcony doors shut and the netting up while we are there.'
  }
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
    {
      heading: 'Cat Breeds We Groom in Kalyani Nagar',
      subheading: 'One of the most pedigree-dense pockets in the city.',
      paragraphs: [
        'Kalyani Nagar has a cat population unlike most of Pune — a high proportion of deliberately chosen breeds, owners who have read about the coat before buying, and a fair number of cats that have travelled here from other cities with their families. The practical effect is that we are asked more specific questions here than anywhere else. Here is what we handle most:',
      ],
      bullets: [
        'Persian cat grooming in Kalyani Nagar — Still the most common longhair. The owners here generally brush at home, which changes the job entirely — we are maintaining a coat rather than rescuing one, and sessions run shorter and calmer as a result.',
        'Maine Coon grooming in Kalyani Nagar — Large, heavy and slow to dry. We budget extra time for the ruff and the britches, and the drying stage is never rushed, because a Maine Coon left damp underneath will knot within days in this river-adjacent humidity.',
        'Ragdoll grooming in Kalyani Nagar — The coat has minimal undercoat, so it deceives owners into thinking it is low-maintenance. It is, until it mats abruptly behind the elbows and in the trousers. We inspect those two places before touching anything else.',
        'Bengal and Savannah-type grooming in Kalyani Nagar — Athletic, strong and fast. Coat work is minimal; the skill is in efficient, confident handling and keeping up with claws that grow quickly on an active cat.',
        'Sphynx grooming in Kalyani Nagar — A handful in this area, and they genuinely need more frequent bathing than any coated cat, not less. With no fur to absorb them, skin oils build up on the surface and in the skin folds. A fortnightly wash with a mild formula, plus careful ear and nail-bed cleaning, is the correct routine.',
        'Scottish Fold grooming in Kalyani Nagar — The folded ear traps wax and moisture. We clean shallowly and carefully and look closely for early redness.',
      ],
      closingLine: 'If your cat has a coat with a documented standard, tell us what you want it to look like — we would rather work to your brief than impose a house style.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Pedigree cat breed grooming at home in Kalyani Nagar Pune',
      imageLeft: false,
    },
    {
      heading: 'Grooming Before Travel, Boarding or a Move',
      subheading: 'Kalyani Nagar travels more than most of Pune. Plan the session around it.',
      paragraphs: [
        'A lot of households here are away regularly — work travel, long trips home, relocations in and out of the city. Where the grooming session sits relative to that matters more than people expect.',
        'Before boarding, groom about a week ahead rather than the day before. A cat arriving at a boarding facility with a clean, mat-free, recently checked coat is easier for the staff to handle and far less likely to come back with a problem that started small — but doing it the day before stacks two stressful events on top of each other. The week\'s gap lets the cat reset.',
        'Before a flight or a long road move, the same logic applies with one addition: get the claws trimmed. A cat in a carrier for eight hours with long claws will catch them in the carrier mesh, and that is a genuinely common cause of injury during transport. Do not bathe a cat immediately before travel; a coat that is even slightly damp plus air conditioning in a cargo hold or a car is a bad combination.',
        'And after a move, wait. A cat in an unfamiliar flat is running on adrenaline for a fortnight or more, and adding a groomer to that week helps nobody. Two to three weeks after the boxes are gone is about right — by then she has claimed the new place and a stranger is merely irritating rather than alarming.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat grooming before travel and boarding in Kalyani Nagar Pune',
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
  {
    question: 'Our cat has a shaved patch from a recent vet procedure. Can she still be bathed?',
    answer: 'It depends how recent and whether the skin is closed. If there is still a suture line, a scab or any weeping, no — wait until your vet confirms it has healed, usually ten to fourteen days after a routine procedure. Once the skin is fully closed we can bathe her normally, working around the patch rather than over it and keeping shampoo off it entirely. Tell us where the patch is at booking so the groomer plans for it. The regrown fur often comes in a slightly different texture at first; that settles over a couple of months.',
  },
  {
    question: 'Do you provide a record of what was done in each session?',
    answer: 'Yes. Every session is logged against your cat — the package, any add-ons, and the groomer\'s notes on coat and skin condition, ears, claws and anything they flagged. It means the next groomer arrives already knowing that your Ragdoll mats behind the left elbow or that your Persian will not tolerate the dryer near her face. If you want the notes sent to you after a session, or a summary before a vet visit, just ask and we will share it.',
  },
  {
    question: 'How do you clean equipment between cats and between homes?',
    answer: 'Combs, brushes, clipper blades and nail clippers are washed and disinfected between every appointment, not at the end of the day. Towels and the floor mat are used once and go into a wash. Shampoo and ear cleaner are dispensed rather than dipped into. This matters more for cats than for dogs, because ringworm and ear mites transfer between cats on shared equipment very readily, and it is the single most common way a grooming visit causes a problem. If you have more than one cat in the house, we clean down between them too.',
  },
  {
    question: 'Our building requires service visitors to use the service lift. Is that an issue?',
    answer: 'None — the groomer follows whatever your building requires and carries everything in one bag. The only thing worth flagging at booking is if the service entrance is on a different side of the complex from the main gate, which is usually where a groomer loses ten minutes inside a large Kalyani Nagar tower.'
  },
  {
    question: 'Does the humidity near the river change how long drying takes?',
    answer: 'It lengthens it noticeably. This riverside stretch holds moisture longer than most of the city, and a longhair coat that feels dry to the hand can still be damp against the skin — which is precisely how fungal patches start. We dry down to the skin rather than to the touch, and for a Persian here that stage simply takes longer than it would elsewhere.'
  },
  {
    question: 'We are moving overseas with our cat. What grooming should happen first?',
    answer: 'A full groom two to three days before the flight — coat combed out, no mats anywhere, nails short — so nothing needs handling on the travel day itself. Never bathe a cat on flight morning; a damp coat in a cold hold is miserable. Keep the tight scheduling for the vet health certificate, not for the grooming.'
  },
  {
    question: 'My cat has claw caps on from a previous owner. Can you remove them?',
    answer: 'We can trim around them as they grow out, which is how they are meant to come off — they shed with the claw sheath over a few weeks. We do not apply new ones. If a cap has been left on too long and the claw underneath has overgrown into the pad, that is a vet visit rather than a grooming job, and we will tell you if that is what we find.'
  },
  {
    question: 'I am often travelling. Can building staff let the groomer in?',
    answer: 'Someone the cat is comfortable with needs to be in the flat, and building staff usually are not that person. If a house helper who knows the cat will be there, that works and you simply need to be reachable by phone. Decisions that change the cat — a clip-down for matting — come to you directly rather than to whoever is present.'
  }
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
    {
      heading: 'Aircraft Noise, Sound-Sensitive Cats, and the Dryer',
      subheading: 'Lohegaon cats have opinions about loud noises. Fair enough.',
      paragraphs: [
        'Living under an approach path does something to a cat over time. Some Lohegaon cats stop noticing aircraft entirely and are the calmest animals we meet. Others go the other way — they become permanently primed for sudden loud noise, and by the time we arrive they are already running a little hot. We see both, sometimes in the same building.',
        'The dryer is where this matters, because it is the one genuinely loud part of a grooming session and it is also the part we cannot skip. A cat sent away with a damp undercoat mats within days and, in a smaller or older cat, gets properly cold. So the answer is not to avoid drying — it is to change how we get there. We towel first and thoroughly, which removes far more water than most people manage and cuts the dryer time roughly in half. The dryer then goes on the lowest speed, is kept well away from the head, and is pointed along the body rather than into the coat. We build up to it rather than switching it on beside a cat who has not seen it.',
        'For a cat that genuinely cannot tolerate it, we will towel-dry almost entirely and use the dryer for a short finishing pass on the densest areas only. Tell us at booking that your cat is sound-sensitive and the groomer plans for it from the start rather than discovering it halfway through.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Low-noise drying for a sound-sensitive cat during home grooming in Lohegaon Pune',
      imageLeft: false,
    },
    {
      heading: 'Kittens, and Getting the First Year Right',
      subheading: 'What you do before six months decides the next fifteen years.',
      paragraphs: [
        'Lohegaon has a lot of young households and, consequently, a lot of kittens. This is the one part of a cat\'s life where grooming choices have compounding effects, so it is worth getting right.',
        'A kitten that is handled early — paws touched, ears looked into, water run over its back, a dryer heard from across the room — grows into a cat that finds grooming unremarkable. A kitten that is left alone until it is two because it "doesn\'t need it yet" grows into a cat that has to be introduced to all of that as an adult with fully developed claws and firm opinions. The coat maintenance genuinely is not urgent in the first year. The habit is.',
        'Practically: wait until the kitten is around twelve weeks and has settled in, and ideally leave a week or so after any vaccination. The first session is deliberately minimal — a warm, quick wash, claws, a look at the ears, and finished within about half an hour while the kitten is still finding it interesting rather than tedious. We will not attempt a full groom on a first visit even if the coat could take it, because the aim is a good memory, not a good result. From there, every six to eight weeks through the first year, and by the time your cat is fully grown the whole thing is just something that occasionally happens on a Tuesday.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'First kitten grooming session at home in Lohegaon Pune',
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
  {
    question: 'Is there a travel or visit charge for coming out to Lohegaon?',
    answer: 'No. The package price is the same here as anywhere else we cover in Pune — ₹799 for a spa bath, up to ₹1,299 for a bath with a full haircut — and there is no doorstep fee, fuel surcharge or outer-area loading. Lohegaon is on our regular eastern route along with Dhanori and Viman Nagar, so it is not an exception trip for us. The only thing distance affects is scheduling: we give a slightly wider arrival window here because the airport road is unpredictable.',
  },
  {
    question: 'My kitten is teething and bites everything in reach. Will that be a problem?',
    answer: 'It is normal and it is manageable, but do mention it. A teething kitten bites out of discomfort and curiosity rather than aggression, and hands moving near its face during a session are extremely tempting. The groomer will keep fingers out of range where possible, work with the kitten facing away from them for the fiddly parts, and give it something else to be interested in. What we will not do is scold or scruff for biting at this age — that teaches exactly the wrong lesson at exactly the wrong time.',
  },
  {
    question: 'Do you cover Vishrantwadi, Kalas and the Alandi Road side?',
    answer: 'Yes — Lohegaon village, the societies off Airport Road, Kalas, Vishrantwadi, Tingre Nagar, Dhanori and the Alandi Road stretch are all part of the same route. If you are further out towards Charholi or Dighi, message us with a location pin first; we do go out that way but not every day, so it may mean waiting for a slot that fits the route.',
  },
  {
    question: 'We are directly under the flight path. Does that unsettle cats during grooming?',
    answer: 'For sound-sensitive cats it can, particularly during the dryer stage when they are already tolerating one loud thing. Tell us at booking. The groomer will pause through an overflight rather than work on regardless, and use a lower fan setting for longer — slower, but it avoids stacking two stressors together.'
  },
  {
    question: 'There is open ground and dust around our society. Does an indoor cat still pick that up?',
    answer: 'Yes. Dust from open plots drifts in and settles on the surfaces the cat sleeps on, and from there it goes into the coat and then gets swallowed during self-grooming. It is a fair reason to keep to the shorter end of the interval rather than stretching to the maximum your cat\'s coat type would otherwise allow.'
  },
  {
    question: 'Our society water supply is timed. Is that enough for a cat session?',
    answer: 'Plenty. Two filled buckets cover the wash and rinse for a full cat session — considerably less than a dog needs. Keep them ready before the slot and tell the groomer on arrival so they plan the rinse from stored water rather than assuming a running tap.'
  },
  {
    question: 'Can we ask for a woman groomer for our cat?',
    answer: 'Yes, just mention it at booking rather than on the day. Cats frequently respond differently to voice pitch and handling style, so it is a fair thing to plan around. The honest caveat is scheduling — it may mean a different day or a wider arrival window than your first-choice slot.'
  },
  {
    question: 'My cat hides under the bed the moment the doorbell rings. How do you get started?',
    answer: 'We do not drag a cat out from under a bed. The groomer sits in the room, does nothing for several minutes, and lets the cat come out on its own — which most do once the door has been shut and nothing alarming has happened. If your cat has a favourite hiding spot, the practical help is shutting that room off shortly before the slot so they settle somewhere reachable.'
  }
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
    {
      heading: 'Diet, Coat Quality, and the Limits of What Grooming Can Do',
      subheading: 'A dull coat is sometimes a grooming problem. Often it is not.',
      paragraphs: [
        'We get asked this regularly in Kharadi, usually by people who are doing everything right and cannot understand why the coat still looks flat: the cat is groomed on schedule, brushed at home, and the fur is still dry, dull or shedding more than it should.',
        'The honest answer is that a coat is an output, not an input. Roughly a quarter of the protein a cat eats goes into growing hair and maintaining skin, which is an enormous share, and it is the first thing the body deprioritises when something is off. So a persistently poor coat despite good grooming is usually pointing at one of four things: a diet too low in animal protein or essential fatty acids, which is common with cheap dry-only feeding; insufficient water intake, which is very common in cats fed exclusively dry food in an air-conditioned flat; a parasite load; or an underlying condition such as thyroid or kidney disease, particularly in an older cat.',
        'What grooming genuinely does is remove dead coat, distribute skin oils along the hair shaft, clear buildup that dulls the surface, and catch problems early. What it cannot do is build a good coat out of poor raw material. If your groomer keeps flagging the same dryness session after session and nothing changes, the next conversation is with a vet about diet and bloodwork, not with us about a different shampoo. We would rather tell you that than sell you a conditioning add-on that will not fix it.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Assessing cat coat and skin condition during home grooming in Kharadi Pune',
      imageLeft: false,
    },
    {
      heading: 'What to Ask Before You Book Any Cat Groomer',
      subheading: 'Including us. Especially us.',
      paragraphs: [
        'Kharadi is full of people who research a purchase properly, so here is the list we would want someone to run us through. It is genuinely useful whether or not you end up booking with Sniffy.',
        'Ask whether the groomer is trained specifically on cats, not just willing to do them. Most grooming in India is dog grooming with cats accepted reluctantly, and the handling, the products and the pacing are all different. Ask what shampoo goes on the cat and whether it is cat-formulated — dog shampoo is the single most common thing that goes wrong, because several ingredients that are routine for dogs are not safe on feline skin. Ask whether they scruff, bag or cage-dry; if the answer is yes to any of them, understand that you are being told the cat will be immobilised rather than settled.',
        'Then the boring operational questions, which matter more than people think. Is the price published before the session or quoted at the end? Is equipment cleaned between animals? What happens if the cat will not tolerate the session — do you get charged in full? Will the same groomer come back next time?',
        'You are welcome to ask us all of it before booking, and we will answer plainly. If any of the answers ever stops matching what happens in your flat, tell us — that gap is the only thing that actually damages a service like this.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Choosing a trained cat groomer for at-home sessions in Kharadi Pune',
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
  {
    question: 'How do I tell whether a dull coat is a grooming problem or a health problem?',
    answer: 'Timing is the clearest signal. A coat that looks good for two or three weeks after a session and then gradually dulls is a grooming-interval problem — book a little more often. A coat that still looks flat and dry a few days after a proper wash and deshedding is telling you something else, usually diet, hydration, parasites or an underlying condition, and it needs a vet rather than a different shampoo. Sudden changes matter too: a coat that becomes greasy, clumped or patchy over a few weeks in a cat whose routine has not changed is worth investigating quickly, particularly in an older cat.',
  },
  {
    question: 'Can I get an invoice or receipt for the session?',
    answer: 'Yes — just ask the groomer at the end of the session or message us afterwards, and we will send one across on WhatsApp with the package, any add-ons and the total. Payment itself is taken at the end of the session by cash or UPI, once you have seen the work. Several of our Kharadi clients need a paper trail for expense or society records; it is a routine request and not a problem.',
  },
  {
    question: 'Do you cover the EON Free Zone side and the Wagholi border from Kharadi?',
    answer: 'Yes. Kharadi proper, the EON and World Trade Centre side, Pallavi Nagar, the Nagar Road stretch, Wagholi, Mundhwa and Kalyani Nagar are all on the same eastern route. Traffic along Nagar Road is the main variable rather than distance, so we give an arrival window rather than a fixed minute and the groomer messages you when they leave the previous booking.',
  },
  {
    question: 'The bypass floods in heavy rain. Do sessions still go ahead?',
    answer: 'Usually yes, occasionally moved. If the Kharadi bypass or the approach to your society is genuinely waterlogged we call and reschedule rather than send a groomer through it with electrical equipment. There is no charge for that. A soaked groomer with a wet dryer bag is no use to your cat.'
  },
  {
    question: 'Our tower has a pet policy and a separate service entrance. What do you need from us?',
    answer: 'Just tell us at booking and pass the groomer details to your society office beforehand. Most large Kharadi towers now log service visitors on an app, and a pre-approved entry means the groomer comes straight up rather than waiting at the desk while your slot runs down.'
  },
  {
    question: 'We have a dog too. Where should the dog be during the cat\'s session?',
    answer: 'In a different room with the door shut, for the whole session. Even a dog the cat lives with happily changes how a cat behaves under handling, and a dog that comes in mid-bath will undo twenty minutes of settling. If both need grooming, we do the cat first while the house is quiet and before there is dog fur and dryer noise in the air.'
  },
  {
    question: 'My cat is on a prescription diet and very food-motivated. Can treats be used during the session?',
    answer: 'Only yours, and only if you hand them over. We do not bring treats — a cat on a prescription diet, a food allergy or a weight plan can be set back by something well-intentioned from a stranger. If you want treats used as a settler, leave a few of your own out and tell the groomer they are approved.'
  },
  {
    question: 'Do you cover the EON side and the newer towers toward Wagholi?',
    answer: 'Yes, the whole Kharadi belt including the EON Free Zone side and out toward the Wagholi border. Several complexes here share a builder name across phases, so mention your phase or tower at booking — it is the usual reason a groomer arrives at the right society and the wrong entrance.'
  }
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
    {
      heading: 'Bathing the Cat Yourself vs Booking a Session',
      subheading: 'An honest comparison, including where we lose.',
      paragraphs: [
        'Plenty of Viman Nagar cat parents bathe their own cats, and we are not going to pretend that is wrong. It is free, it happens on your schedule, and for a calm shorthaired cat who tolerates water it is perfectly adequate maintenance. If that describes your situation, keep doing it.',
        'Where a home bath falls short is not the washing — it is everything around it. Almost nobody at home does a dry brush-out first, so loose fur turns into a wet mat during the bath rather than coming off before it. Almost nobody rinses long enough, which leaves residue that dulls the coat within days. Most people cannot dry a cat completely by themselves, and a coat that is dry on top and damp underneath is the single most reliable way to produce mats. And the parts that need a second pair of hands — nails on a squirming cat, an ear clean, a sanitary trim, working a mat loose without pulling skin — are the ones that quietly get skipped year after year.',
        'The other difference is that a groomer is looking. Bathing your own cat, you are focused on the logistics; you are not systematically checking each claw, parting the fur along the spine, or comparing one ear to the other. Most of what we find, we find because finding it is the job rather than a side effect.',
        'The sensible middle ground, and what a lot of our Viman Nagar clients settle on: brush at home regularly, bathe yourself if you and the cat both cope with it, and book a professional session every couple of months for the parts that need equipment, technique and a second person.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Professional cat grooming compared to bathing a cat at home in Viman Nagar Pune',
      imageLeft: false,
    },
    {
      heading: 'The Skin Problems We See Most Often',
      subheading: 'Three common ones, and which of them grooming actually helps.',
      paragraphs: [
        'A wet coat pressed flat against the skin shows you things a dry coat hides completely, which is why so much of what we report back to owners is skin rather than fur. Three conditions come up again and again in this part of the city.',
        'Flea allergy dermatitis is the most common by a distance. It looks like a scattering of small scabs along the lower back and around the base of the tail, and it is not caused by the number of fleas — a single bite can set off a reaction in a sensitised cat, which is why owners insist there are no fleas and are usually right. Grooming and an anti-flea bath help; they do not resolve it, because the treatment has to cover the cat and the home together.',
        'Feline acne is the second, and it surprises people every time. Small black specks or crusty bumps on the chin, often mistaken for dirt. The usual culprit is a plastic food or water bowl that harbours bacteria in surface scratches. Switching to steel or ceramic and washing it daily fixes most cases; grooming keeps the area clean while it settles.',
        'And dandruff, particularly concentrated along the spine where the cat cannot reach. In a young cat that usually means dry indoor air or a diet short on fatty acids. In an older or overweight cat it more often means the cat physically cannot twist round to groom back there, which is a comfort problem worth taking seriously. Regular deshedding and a conditioning wash genuinely help this one.',
        'In all three cases we describe what we see, avoid working an inflamed area, and tell you whether we think it needs a vet. We do not diagnose and we do not sell treatments.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat skin condition check during a home grooming session in Viman Nagar Pune',
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
  {
    question: 'Is it a bad idea to bathe my cat myself?',
    answer: 'Not at all, if she tolerates it and you use a cat-specific shampoo. Two things to get right, because they are where home baths usually go wrong. Brush the coat out thoroughly while it is dry, before any water — wetting a coat with loose fur in it turns that fur into mats. And rinse far longer than feels necessary, then dry completely, including the undercoat; a coat that is dry on the surface and damp underneath will knot within days. What we would not attempt alone are nails on an unwilling cat, ear cleaning and de-matting, all of which really do need two hands and the right tools.',
  },
  {
    question: 'My cat has small scabs along her lower back near the tail. What is that?',
    answer: 'That pattern — scattered small scabs concentrated on the lower back and the base of the tail — is the classic presentation of flea allergy dermatitis. The frustrating part is that it does not take an infestation; a cat that has become sensitised can react strongly to a single bite, which is why owners are often certain there are no fleas and are technically correct. An anti-flea bath during the session helps and we will check the coat carefully, but resolving it properly means treating both the cat and the home, and that is a plan to make with your vet.',
  },
  {
    question: 'We are in a serviced apartment on a short lease. Do you come to those?',
    answer: 'Yes — serviced apartments, rented flats, guest houses and long-stay accommodation are all fine, and Viman Nagar has plenty of all four. There is nothing about our setup that requires a permanent home: we need a bathroom with a working tap, a plug point and floor space for a mat, and we take everything away afterwards. If the building requires visitors to be registered at reception, tell us at booking and we will send the groomer\'s details in advance.',
  },
  {
    question: 'What slot avoids the worst of the Phoenix and Nagar Road traffic?',
    answer: 'Mid-morning, roughly 10 AM to 12:30, or mid-afternoon. The stretch past the mall between 6 and 9 PM is where arrival windows slip most. If evening is your only option we would rather book you at 7 PM with an honest window than promise a precise time we cannot hold.'
  },
  {
    question: 'Our society will not permit grooming or drying on balconies. Does that limit anything?',
    answer: 'Not at all — the entire session happens indoors as standard, in one room with the door shut. We would never air-dry a cat on a balcony anyway: Pune humidity keeps an air-dried coat damp at the skin for hours, which is how fungal patches begin, and an open balcony is the single riskiest place for a startled cat.'
  },
  {
    question: 'My cat has a microchip. Should I mention it?',
    answer: 'Worth mentioning, mainly so you know we will not be scanning or touching it — the chip sits under the skin between the shoulder blades and is entirely unaffected by bathing or clipping. If your cat is not chipped, the more useful takeaway is that a home session involves a stranger and an opening door, and an unchipped cat that bolts is very hard to recover.'
  },
  {
    question: 'Can you groom two cats in the same visit if they do not get along?',
    answer: 'Yes, and that is the normal arrangement rather than the exception. Each cat is groomed alone in a closed room while the other stays elsewhere in the house. Cats read each other\'s stress sharply, and two cats that already have friction will make each other\'s sessions worse if they can see or hear one another.'
  },
  {
    question: 'We are in a serviced apartment on a short lease. Is grooming still practical?',
    answer: 'Yes, and it is a common booking in this area. The groomer works on their own mats, contains the shed fur and clippings, and leaves the bathroom as they found it — which matters more in a leased flat than an owned one. Tell us at booking if the building requires the management office to approve service visitors.'
  }
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
    {
      heading: 'The River Is Closer Than You Think, and Your Cat\'s Coat Knows It',
      subheading: 'Riverside humidity changes what a coat needs.',
      paragraphs: [
        'Mundwa runs along the Mula-Mutha, and the stretch of flats between the old village and the Kharadi bypass sits in noticeably damper air than, say, Kothrud does. Cat owners here often describe the same thing to us — the coat feels slightly heavy or tacky, especially through August and September, and the cat starts grooming itself more without the coat actually looking cleaner.',
        'That is moisture sitting in the undercoat. On a shorthair it mostly means more shedding and more hairballs. On anything semi-long it means the base of the coat stays damp long enough for mats to form quietly, under the top layer, where you will not see them until they are already tight. We handle this with a full dry-out on low heat rather than a quick towel-off, and we comb from the skin outward instead of just running a brush over the top. It takes longer. It is also the only way to actually get a riverside coat dry.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Cat coat drying and combing during a Mundwa home grooming session',
      imageLeft: true,
    },
    {
      heading: 'Cat Breeds We Groom Most Around Mundwa',
      subheading: 'A very mixed street, in the best way.',
      paragraphs: [
        'Mundwa\'s cat population reflects the area itself — older village homes with generations of Indies, and newer towers with cats that arrived by breeder or adoption drive. Here is how we approach the ones we meet most often here:',
      ],
      bullets: [
        'Indie and domestic shorthair grooming in Mundwa — By far the largest group here. Usually healthy, usually not used to being handled for long. We keep the session short and efficient, prioritise nails and ears, and do a proper deshedding pass rather than a token brush.',
        'Persian grooming in Mundwa — The riverside damp is hardest on this coat. We work section by section with a detangling spray, check behind the ears and under the front legs first because that is where Mundwa Persians mat, and finish with a full dry-out.',
        'Siamese and Siamese-mix grooming in Mundwa — Short coats, strong opinions. They will tell you exactly how they feel about each step. We work quickly, skip anything that is not necessary, and let them supervise.',
        'Bengal grooming in Mundwa — High energy, low coat maintenance. The real work is nails, which grow fast on an active cat, and a conditioning wash that keeps the rosetted coat glossy rather than dusty.',
        'Senior cats of any breed — Mundwa has a lot of long-settled families with cats over ten. We groom them lying down where possible, in short blocks, and stop when they have had enough rather than pushing for a perfect finish.',
      ],
      closingLine: 'If your cat is a mix of four things and looks like none of them, that is fine — we work off the coat in front of us, not the pedigree.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Breed-specific cat grooming in Mundwa Pune',
      imageLeft: false,
    },
    {
      heading: 'What It Costs, and What Is Actually in the Session',
      subheading: 'Published prices. Nothing added at the door.',
      paragraphs: [
        'Cat grooming in Mundwa starts at ₹799 for a spa bath, with full packages running up to ₹1,299 depending on whether a haircut is involved. That price covers the bath with cat-specific shampoo and conditioner, a low-heat blow-dry, brushing and de-matting, nail trim, ear clean and a sanitary trim. Add-ons like a medicated bath or tick and flea care are listed separately and priced before we start, not after.',
        'We mention this because the most common complaint we hear from Mundwa cat parents about previous services is not the quality — it is the bill going up mid-session. Our groomers are not paid on upsell. If your cat genuinely needs something extra, you will hear about it as a recommendation with a number attached, and you can say no.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Transparent cat grooming pricing in Mundwa Pune',
      imageLeft: true,
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
  {
    question: 'How much does cat grooming in Mundwa cost?',
    answer: 'Sessions start at ₹799 for a spa bath and go up to ₹1,299 for a bath with a full haircut. Nail trimming, ear cleaning, deshedding and a sanitary trim are part of the package, not extras. Optional add-ons such as a medicated bath or tick and flea care are quoted upfront before the groomer begins.',
  },
  {
    question: 'My flat is a compact 1BHK. Is there enough space to set up?',
    answer: 'Yes. We need roughly a bathroom with a working tap and about a square metre of floor space nearby — that is genuinely it. Most Mundwa sessions happen in a standard bathroom with the drying and combing done on a mat just outside it. Smaller flats often work better for cats anyway, because there are fewer places to bolt to.',
  },
  {
    question: 'My cat stays indoors, but there are a lot of street cats around the building. Should I worry about fleas?',
    answer: 'It is worth checking. Fleas travel indoors on shoes and clothes far more often than people expect, and ground-floor and first-floor flats near Mundwa\'s older lanes see this regularly. Your groomer will part the coat at the base of the tail and along the spine during the session and tell you honestly what they find. If there is an active problem, an anti-flea bath helps but will not fix the house — you will need to treat the home too.',
  },
  {
    question: 'Does the riverside humidity here affect drying?',
    answer: 'It lengthens it. The Mundhwa riverside belt holds moisture noticeably longer than areas further inland, and a coat that feels dry to the hand can still be damp at the skin. Our groomers dry to the skin rather than to the touch here, and for a longhaired cat that stage takes the largest share of the session.'
  },
  {
    question: 'Do you cover the Keshav Nagar and Magarpatta border side?',
    answer: 'Yes, along with the Kharadi border stretch and the older Mundhwa gaon area. It is a compact belt to work in, which usually means we can offer tighter and more reliable arrival windows here than in the more spread-out parts of the city.'
  },
  {
    question: 'Construction dust is constant around us. Does that matter for an indoor cat?',
    answer: 'It does. Fine dust drifts indoors, settles on the surfaces the cat sleeps on, and ends up swallowed during self-grooming rather than merely sitting on the coat. While building work continues nearby, keeping to the shorter end of your cat\'s recommended interval is worth doing.'
  },
  {
    question: 'What happens to all the fur and nail clippings afterwards?',
    answer: 'They leave with the groomer. Fur is collected as we go rather than swept up at the end, clippings are bagged, and the working area is cleaned before the groomer leaves. You should not be finding evidence of the session the next morning — if you do, tell us, because that is not the standard.'
  },
  {
    question: 'Can I book an evening slot?',
    answer: 'Yes, with the last workable start around 7 PM so the coat is fully dry before the groomer leaves. We run until 9 PM, but a session starting at 8 finishes either rushed or with a damp cat. Evening slots here go early in the week, so book a few days ahead rather than the same afternoon.'
  }
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
    {
      heading: 'Reading the Cat: What the Groomer Is Watching While They Work',
      subheading: 'Cats give plenty of warning. Most people are looking at the wrong end.',
      paragraphs: [
        'Owners tend to watch a cat\'s face during grooming, and the face is the least informative part. A cat that is about to stop cooperating has usually been saying so for a full minute somewhere else on its body, and a groomer who can read that never gets to the point of a struggle.',
        'The tail goes first. A slow swish is mild irritation and is fine; a fast flick, or a tail that starts thumping the mat, means the cat has had enough of whatever is happening right now. The ears rotate backwards and flatten slightly — not the dramatic pinned-back ears people picture, just a quarter turn. The skin along the back starts to twitch or ripple. The body goes still in a particular way that is nothing like relaxation; a settled cat is loose and a shut-down cat is rigid, and the difference matters enormously because the rigid cat is the one that explodes.',
        'What our groomers do with that information is simple and it is the whole method: stop, take the hands off, wait five or ten seconds, and resume with something less objectionable. That pause, repeated throughout a session, is why a session finishes calmly. A groomer working through the signals to save two minutes will spend those two minutes later restraining a frightened animal, and the cat will remember it next time. In Koregaon Park, where a lot of the cats we groom are long-established and thoroughly used to getting their own way, reading the signals correctly is most of the job.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Reading feline body language during a home grooming session in Koregaon Park Pune',
      imageLeft: false,
    },
    {
      heading: 'Summer, Sun and Cats Who Live on the Terrace',
      subheading: 'KP has the gardens and the light. That comes with a few things to watch.',
      paragraphs: [
        'Koregaon Park has more usable outdoor space per cat than almost anywhere in Pune — terraces, verandahs, walled gardens with old trees. Cats use all of it, and they use it in April at two in the afternoon, because a cat\'s idea of a pleasant temperature is well above ours.',
        'Two things are worth knowing. The first is that shaving a cat for summer is mostly a misunderstanding. A cat\'s coat insulates in both directions and also blocks sun; a clipped cat is not obviously cooler and is considerably more exposed. If your cat is genuinely struggling with heat, shade, water and airflow do far more than a clipper. What does help is removing the dead undercoat, which traps heat without providing any useful function — a proper deshedding session in March or April is the summer intervention that actually works.',
        'The second is sun exposure on the thin-furred parts. Cats with white or pale ears, a pink nose or a sparsely furred belly can and do get sunburnt on a terrace, and repeated sunburn on the ear tips is a recognised route to skin cancer in cats — vets in India see it regularly in white cats who sunbathe. It is worth checking your cat\'s ear tips occasionally for redness, crusting or a rough patch that does not resolve. Our groomers look at ear tips as part of every session and will tell you if something looks worth showing a vet.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Summer coat care and sun exposure checks for cats in Koregaon Park Pune',
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
  {
    question: 'My cat is white and sunbathes on the terrace every afternoon. Should I be concerned?',
    answer: 'Mildly, and it is worth knowing about rather than worrying about. White and pale-eared cats have very little pigment protecting the thin skin on the ear tips and nose, and repeated sun exposure there is a recognised risk factor for skin cancer in cats — it is one of the more common tumours vets see in white cats in sunny climates. Look at the ear tips every few weeks for persistent redness, crusting, or a rough patch that does not heal. Shade during the harshest hours is the simple fix. Our groomers check ear tips as part of every session and will flag anything that looks worth a vet\'s opinion.',
  },
  {
    question: 'We have a Persian and a Sphynx. Do they need the same schedule?',
    answer: 'No, and they are close to opposite ends of the range. The Persian needs a session every four to six weeks and daily combing at home, because the coat mats faster than most people expect in Pune\'s humidity. The Sphynx needs bathing more often than any coated cat — roughly every two weeks — because there is no fur to absorb skin oils, so they build up on the surface and in the folds, and the nail beds and ears need cleaning at the same interval. Booking them on the same visit works fine; we just alternate which one gets the full treatment each time.',
  },
  {
    question: 'Can I book and pay for a session on someone else\'s behalf?',
    answer: 'Yes, and it is a fairly common request here — usually a gift, or someone arranging grooming for a parent or a family member who is travelling. Book in the normal way but give us the cat\'s address and the contact number of whoever will actually be at home, and tell us who to coordinate with on the day. Payment can be settled by UPI from wherever you are rather than at the door. Just make sure the person at the flat knows we are coming; a groomer arriving unannounced to a surprised household is not the gift anyone intended.',
  },
  {
    question: 'The lanes here are narrow with no parking. Does that affect the visit?',
    answer: 'Not at all. Groomers arrive by two-wheeler with the full kit in one shoulder bag — nothing is unloaded at your gate and no vehicle needs a bay. It is precisely why doorstep grooming works on the numbered lanes and the bungalow roads off North Main Road.'
  },
  {
    question: 'Our cat has the run of a large bungalow. Which room should the session happen in?',
    answer: 'The smallest quiet room with a door that shuts and a tap nearby — usually a bathroom or a guest room. A large house feels like an advantage but it is the opposite for a cat session: more space means more places to bolt to and a longer settling period. A contained room is calmer for the cat and safer for everyone.'
  },
  {
    question: 'We have staff at home during the day. Can they manage the appointment?',
    answer: 'Yes, if the cat is comfortable with them and you are contactable by phone. The limit is decisions: if the coat is matted enough that clipping down is the kinder option, that call comes to you rather than to whoever happens to be at home. We would rather hold the session five minutes than change your cat on someone else\'s authority.'
  },
  {
    question: 'My cat goes out into the garden. Does that change the grooming plan?',
    answer: 'It changes what we inspect. An outdoor-access cat gets a full tick and flea check before anything else starts — between the toes, inside the ears, along the jawline and at the base of the tail. Garden soil also works deep into a dense undercoat and does not rinse out in a single pass, so the wash stage takes longer than for an indoor cat.'
  },
  {
    question: 'We are relocating abroad. What should be done before the flight?',
    answer: 'A full groom two to three days ahead — coat fully combed out with no mats, nails short — so nothing needs doing on travel day. Do not bathe a cat the morning of a flight. Schedule tightly around the vet health certificate and loosely around the grooming; the certificate is the document with the hard deadline.'
  }
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
    {
      heading: 'Row Houses, Terraces, and Cats Who Live Half Outdoors',
      subheading: 'Dhayari cats get more outside time than most Pune cats.',
      paragraphs: [
        'A lot of Dhayari is plotted development — row houses, independent homes, low-rise buildings with accessible terraces. That gives cats here something most Pune apartment cats do not have: a genuine half-outdoor life. They sit on parapets, walk the compound wall, and come back in with whatever they picked up out there.',
        'It changes the grooming brief completely. A strictly indoor cat in a Kothrud tower mostly needs coat maintenance. A Dhayari terrace cat needs that plus a real inspection — ticks behind the ears and between the toes, grass seeds and burrs in the belly fur, small scratches hidden under the coat, and paw pads that have been walking on hot concrete all summer. We build that check into every session here rather than treating it as an add-on, and we will tell you plainly if something needs a vet rather than a groomer.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Tick and paw inspection during cat grooming in a Dhayari row house',
      imageLeft: true,
    },
    {
      heading: 'Cat Breeds We Groom Around Dhayari',
      subheading: 'Rescues, Persians, and a growing number of pedigrees.',
      paragraphs: [
        'Dhayari\'s cat population has shifted noticeably in the last few years. The older lanes are full of well-fed Indies who chose their families rather than the other way round; the newer societies off Dhayari Phata and towards Nanded City have brought in a lot of first-time owners with pedigree kittens. We groom both, differently:',
      ],
      bullets: [
        'Indie cat grooming in Dhayari — Often semi-outdoor, often never professionally groomed before. We go slowly on the first visit, focus on a proper clean, a tick and flea check and nails, and leave the fine coat work for once they trust the process.',
        'Persian cat grooming in Dhayari — The single most common pedigree here, and the one that suffers most from the local dust. We comb from the skin out in sections, pay particular attention to the armpits and the ruff, and use a tearless face wash for the eye folds.',
        'Himalayan and Persian-cross grooming in Dhayari — Same coat challenges as a Persian with a flatter face, so we go gentler around the nose and keep the drying angled away from the eyes.',
        'Domestic shorthair and tabby grooming in Dhayari — Low-maintenance coats, but terrace access means grit and dust in the undercoat. A deshedding pass plus a good rinse makes more difference than owners expect.',
        'Kittens under a year — Dhayari has a lot of first-time cat parents right now. The first session is deliberately light: warm water, short handling, nails, and a positive ending. Getting a kitten used to the routine early is worth more than a perfect finish.',
      ],
      closingLine: 'Not sure what your rescue is a mix of? Neither are we, usually. We groom the coat, not the label.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Persian and Indie cat grooming in Dhayari Pune',
      imageLeft: false,
    },
    {
      heading: 'Why Brushing at Home Never Quite Fixes the Shedding',
      subheading: 'The fur you can see is not the problem.',
      paragraphs: [
        'Almost every Dhayari cat parent we meet already brushes their cat. And they are usually surprised by how much fur comes off during a professional deshedding pass anyway. The reason is simple: a normal brush lifts loose fur off the top of the coat. It does not reach the dead undercoat sitting close to the skin, which is where the bulk of it is and where it stays until it either falls out around your house or ends up swallowed during self-grooming.',
        'That second route is the one worth caring about. A cat that is ingesting a season\'s worth of loose undercoat is a cat bringing up hairballs on your floor and, occasionally, a cat with a real digestive problem. A proper deshedding session with the right combs removes that layer in one go. Most Dhayari clients tell us the difference around the house is obvious for about three weeks, which is a reasonable guide to how often it is worth repeating.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat deshedding treatment at home in Dhayari Pune',
      imageLeft: true,
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
  {
    question: 'Do you cover Narhe, Nanded City and the Sinhagad Road side of Dhayari?',
    answer: 'Yes. Dhayari Phata, Narhe, Nanded City, Kirkatwadi and the stretch along Sinhagad Road are all within our regular route, along with Ambegaon and Warje on the other side. If your society is somewhere between two of those and you are not sure, send us the location pin and we will confirm before you book.',
  },
  {
    question: 'My cat sheds constantly. How many sessions before I actually notice less fur at home?',
    answer: 'Usually one. A proper deshedding pass removes the dead undercoat that ordinary brushing leaves behind, and most owners see a clear drop in fur on furniture within a day or two. The effect fades over roughly three weeks as new coat loosens, which is why heavy shedders in Dhayari tend to settle into a four to six week rhythm rather than the eight weeks a low-shedding cat needs.',
  },
  {
    question: 'We live on the fourth floor of a building with no lift. Is that a problem?',
    answer: 'Not at all — walk-ups are common in Dhayari and our kit is designed to be carried. The groomer brings everything up in one trip: clippers, dryer, combs, shampoos, towels and a mat. Nothing heavy, nothing that needs to come back down mid-session. Just let us know at booking so the groomer can plan a few extra minutes.',
  },
  {
    question: 'We are on borewell water. Does hard water affect a cat\'s coat?',
    answer: 'It does, and it is a real issue across the Dhayari and Narhe side. Hard water leaves mineral residue that dulls the coat and can leave skin itchy even after what felt like a proper rinse. Our groomers rinse for longer where the water is hard and finish with a conditioning rinse to counter it — if home baths have left your cat\'s coat looking flat, this is usually the reason.'
  },
  {
    question: 'How far out from Dhayari do you travel for a cat session?',
    answer: 'Out to Kirkatwadi, Nanded City, Narhe and the plotted developments toward Sinhagad Road. Lane names repeat a great deal in this belt, so send a location pin with the booking — a groomer circling to find your gate is time taken out of the cat’s settling period, not ours.'
  },
  {
    question: 'Our cat comes and goes from the compound. What should we watch for?',
    answer: 'Ticks first, and they are why we inspect before we wash rather than after. A cat with free compound access in this belt picks up considerably more than an indoor cat, and the places to check are between the toes, inside both ears, along the jawline and at the tail base. If we find something, we show you where it was rather than treating it silently.'
  },
  {
    question: 'Power cuts are frequent here. What happens if the electricity goes?',
    answer: 'Only the drying stage needs power, so a cut pauses the session rather than ending it. Tell the groomer which sockets run off your inverter if you have one. We will not leave a cat damp and go — if power is genuinely out we towel-dry thoroughly, keep the room warm and wait for it to come back.'
  },
  {
    question: 'We took in a street cat. Does she need the same grooming as a pedigree?',
    answer: 'Less bathing, the same inspections — arguably more of them. Street-origin cats generally have practical, self-maintaining shorthair coats and over-bathing does them no favours at all. What earns its keep every visit is the tick and flea check, nail trimming, and a proper look at the ears and skin, since these are the cats most likely to have picked something up.'
  }
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
    {
      heading: 'Long-Settled Families, Long-Lived Cats',
      subheading: 'Karve Nagar has more senior cats than almost anywhere we work.',
      paragraphs: [
        'This is not a hunch — it is what our booking sheet looks like. Karve Nagar is full of families who have lived in the same flat for fifteen or twenty years, and their cats have grown old alongside them. We regularly groom cats here who are twelve, fourteen, sixteen. That is a lovely thing, and it means the job is different.',
        'An old cat cannot stand on a wet floor for forty minutes. Arthritic hips make the classic grooming posture — lifted, turned, held — genuinely painful. Kidney-compromised cats get cold fast. So we change the method rather than the standard: the cat stays lying down wherever possible, we work in short blocks with rests between them, we keep the water warmer and the dryer on the lowest setting, and we do the essential things first — nails, sanitary area, mats that are pulling at the skin — so that if the cat has had enough after twenty-five minutes, the important work is already done. A slightly imperfect finish on a comfortable sixteen-year-old is the right outcome. We will tell you that honestly rather than pushing on.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Gentle senior cat grooming at home in Karve Nagar Pune',
      imageLeft: true,
    },
    {
      heading: 'Cat Breeds We Groom Around Karve Nagar',
      subheading: 'Long-standing families tend to have well-chosen cats.',
      paragraphs: [
        'Between the main road, the Sinhagad Road side and the Erandwane border, Karve Nagar has an unusually settled cat population — fewer kittens, more cats who have been in the same home for a decade. These are the ones we see most:',
      ],
      bullets: [
        'British Shorthair grooming in Karve Nagar — Popular here and deceptively hard work. That plush double coat hides an enormous amount of dead undercoat; a wash without a proper deshedding stage barely touches it. We pre-brush dry, use a deshedding shampoo, then comb again after drying.',
        'Persian grooming in Karve Nagar — Mostly older Persians in this area, which means thinner skin and less tolerance for tugging. We use more detangler and more time rather than more force, and we are quick to recommend clipping a mat out rather than working it loose on a senior cat.',
        'Indie and domestic shorthair grooming in Karve Nagar — Frequently the family cat of fifteen years. Low coat maintenance, high patience requirement. Nails are usually the priority, since older cats stop wearing them down and the claws start curving into the pads.',
        'Maine Coon grooming in Karve Nagar — Big, heavy, and slow to dry. The ruff, the belly and the trousers mat first. We plan for a longer session and never rush the drying stage, because a damp Maine Coon undercoat mats again within days.',
        'Siamese and Burmese grooming in Karve Nagar — Minimal coat work, maximum negotiation. These are talkers. We work efficiently and let them have the last word.',
      ],
      closingLine: 'Older cat, unclear breed, thirty years of family history — that describes most of our Karve Nagar bookings, and it is exactly the kind of session we are set up for.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'British Shorthair and Persian cat grooming in Karve Nagar Pune',
      imageLeft: false,
    },
    {
      heading: 'Nails, Scratching, and What Grooming Can Honestly Fix',
      subheading: 'Some of it. Not all of it. Here is the difference.',
      paragraphs: [
        'The single most common request we get in Karve Nagar — a neighbourhood with a lot of good furniture that has survived a lot of cats — is some version of "can you do something about the scratching?" The honest answer is partly.',
        'Trimming the sharp hooked tip off each claw genuinely reduces the damage. A blunted claw catches far less on upholstery, and it also stops the claw curving round into the paw pad, which is a real and painful problem in older or less active cats. What trimming does not do is stop the behaviour. Scratching is how a cat marks territory and stretches its back; removing the urge is not on the table, and declawing is an amputation we will not perform or recommend under any circumstances. What actually works is the boring combination: keep the claws trimmed every four to six weeks, and put a scratching post where the cat already scratches rather than where you would prefer it. We will trim during every session and show you where the quick sits on your particular cat so you can top up between visits if you want to.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat nail trimming during a home grooming session in Karve Nagar',
      imageLeft: true,
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
  {
    question: 'Do you just clip the claws, or do you file them smooth as well?',
    answer: 'We clip and then smooth the cut edge, because a freshly clipped claw leaves a sharp square edge that can catch on fabric worse than the original hook did. We take off the tip only and stay well clear of the quick — the pink vein inside the claw. On a cat with dark claws where the quick is not visible, we take less rather than guess. We do not fit plastic claw caps and we do not declaw.',
  },
  {
    question: 'After a grooming session elsewhere, my cat stopped using her litter tray for a few days. Could grooming cause that?',
    answer: 'It can, and it is more common than people realise. A stressful session — particularly one involving a car journey, a cage and unfamiliar animals — can leave a cat unsettled enough to break routine for a day or two, and a sanitary trim that was done too close can make squatting uncomfortable. It is one of the clearer arguments for grooming at home: the cat never leaves its own territory, so the routine has less to recover from. If it happens again after any session, mention it to us and to your vet, since it can also point to something unrelated.',
  },
  {
    question: 'Do you cover Warje and the Erandwane border side of Karve Nagar?',
    answer: 'Yes — Karve Nagar main road, the Sinhagad Road pockets, Warje, Erandwane, Paud Road and the Kothrud border are all on our regular route. It is a compact area for us, which is why we can usually offer tighter arrival windows here than in the outer suburbs.',
  },
  {
    question: 'Do you cover Dahanukar Colony and the Anand Nagar side?',
    answer: 'Yes, along with the Erandwane, Warje and Shivane ends of Karve Nagar. It is a dense, established area that is easy for us to reach, so arrival windows here are usually tighter and more reliable than in the outer townships.'
  },
  {
    question: 'Water pressure in our old building is weak. Is that a problem for bathing a cat?',
    answer: 'Not at all. The groomer works from a bucket for the wash and rinse regardless, so a thin tap just takes longer to fill. A full cat session needs about two buckets. If your supply is timed rather than merely weak, keep them ready before the slot and mention it to the groomer on arrival.'
  },
  {
    question: 'My grandchildren are usually at home. Will that disturb the session?',
    answer: 'It can, and it is the one thing worth managing in advance. A cat under handling is already using all its patience, and children coming in and out of the room is the usual reason a settling cat stops settling. We work in one closed room — please keep it closed, particularly through the dryer and clipper stages.'
  },
  {
    question: 'Can I book just a nail trim for our elderly cat?',
    answer: 'Yes, and for an older cat it is frequently the sensible choice. A short maintenance visit covering nails and an ear clean is available below the full session price. Overgrown claws in a senior cat can curl into the pad, which is painful and entirely preventable — keeping them short matters far more than bathing an elderly cat on a fixed schedule.'
  },
  {
    question: 'How do bookings work during Ganpati week?',
    answer: 'Book a week ahead at minimum, and if you can, book before the festival rather than during it. Processions make the lanes off Karve Road unpredictable and we cannot hold arrival windows reliably. For a sound-sensitive cat, drumming outside plus a dryer indoors is two stressors at once.'
  }
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
    {
      heading: 'Bigger Homes, More Cats — Ambegaon Households Rarely Stop at One',
      subheading: 'Multi-cat families are the norm here, not the exception.',
      paragraphs: [
        'Ambegaon Budruk and the plots towards Narhe have space that central Pune does not, and space is how people end up with three cats instead of one. A stray kitten turns up at the gate, someone fosters a litter and keeps two, a neighbour moves away and leaves theirs. Most of our Ambegaon bookings are for more than one cat.',
        'Grooming a multi-cat household is a different exercise from grooming a single cat, and the order matters. We take the most confident cat first, because the others will be watching and a calm first session sets the tone for the rest. The groomed cat then goes into a separate room — not because of anything dramatic, but because a freshly washed cat smells wrong to its housemates for a few hours and that is where the hissing comes from. We also change the water and clean the combs between cats, which sounds obvious and is skipped surprisingly often; ringworm and ear mites move between cats in exactly this way. Book them together and the whole household is done in one visit rather than three.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Multi-cat household grooming at home in Ambegaon Pune',
      imageLeft: true,
    },
    {
      heading: 'Cat Breeds We Groom Around Ambegaon',
      subheading: 'Mostly rescues, and increasingly not only rescues.',
      paragraphs: [
        'Ambegaon\'s cat population leans heavily towards Indies and rescues, which suits us — they are the cats most often skipped by grooming services and the ones who most often need a proper look-over. The newer societies have started bringing in pedigrees too. Here is how we handle the common ones:',
      ],
      bullets: [
        'Indie and rescue cat grooming in Ambegaon — Frequently a first professional session at the age of five or six. We expect a flea check to be necessary, we expect the nails to be overdue, and we expect the cat to object. None of that is a problem; we just plan a longer, gentler first visit.',
        'Persian cat grooming in Ambegaon — The dry south-Pune air plus construction dust is a hard combination for this coat. Detangle first, wash second, and dry completely — a Persian sent away damp will mat within a week.',
        'Domestic shorthair and tabby grooming in Ambegaon — Straightforward coats where the real value is deshedding and nails. Also the group where we most often spot early skin issues, because there is nowhere for anything to hide on a short coat.',
        'Ragdoll grooming in Ambegaon — Increasingly common in the newer buildings. Famously docile, which tempts owners into skipping grooming because the cat never complains. The silky coat mats behind the legs quietly; we check there first.',
        'Kittens and young cats — With so many rescued litters in this area, a lot of our Ambegaon work is first sessions for cats under a year. Short, warm, positive, and finished before the kitten gets bored.',
      ],
      closingLine: 'Rescue, pedigree or complete mystery — bring us the cat and we will work out the coat.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Rescue and Persian cat grooming in Ambegaon Pune',
      imageLeft: false,
    },
    {
      heading: 'The Part of the Session Nobody Books For',
      subheading: 'A groomer sees your cat\'s whole body. That turns out to matter.',
      paragraphs: [
        'You live with your cat and you love your cat, and you still almost certainly have not run your hands over every square inch of it in the last two months. A groomer does exactly that, every session, in good light, with the coat wet and flat against the skin. It is the closest thing to a monthly physical your cat gets between vet visits.',
        'What surfaces is rarely dramatic and often useful: a scab under the chin that turns out to be feline acne from a plastic food bowl, a warm swollen toe from a claw growing into the pad, dandruff concentrated along the spine on a cat too stiff to reach back there, a lump that was not there last time, wax deep in one ear and not the other. We are groomers, not vets — we do not diagnose and we will never sell you a treatment. What we do is tell you clearly what we found, where it is, and whether we think it is worth a vet\'s opinion. Several Ambegaon clients have caught things early this way, which is a better argument for regular grooming than a shiny coat ever was.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat skin and coat health check during grooming in Ambegaon Pune',
      imageLeft: true,
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
  {
    question: 'We have four cats. Can they all be done in one visit, and how does pricing work?',
    answer: 'Yes, and it is the sensible way to do it — one visit, one setup, and the household settles back to normal the same evening. Each cat is priced as its own session starting at ₹799, so four cats means four sessions rather than a bulk rate, but you save the repeated travel and disruption. Tell us the number when booking so we allocate a long enough slot; four cats usually runs three to four hours.',
  },
  {
    question: 'My cat is quite overweight and can\'t reach his own back to groom himself. Does that change the session?',
    answer: 'It changes it a lot, and it is a common situation in homes with free-fed indoor cats. A cat who cannot twist round to reach the base of the spine and the tail area will develop dandruff, clumped greasy fur and sometimes mats in exactly those spots, plus a sanitary area that needs attention because he cannot clean it properly either. We spend most of the session on the back half, keep him lying on his side rather than asking him to sit up, and go easy on the handling since heavier cats tire faster. Regular sessions matter more for these cats than for any other kind.',
  },
  {
    question: 'If the groomer finds something on my cat\'s skin, will you treat it?',
    answer: 'No — we will show you and describe it, and that is where our role stops. Our groomers are trained to notice things, not to diagnose them, and we do not carry or sell medication. If we find a scab, a lump, an inflamed ear or anything that looks like a fungal patch, we will point out exactly where it is, avoid working that area, and suggest you have a vet look. If it looks like it needs attention today rather than next week, we will say so plainly.',
  },
  {
    question: 'Do you cover Nanded City, Kirkatwadi and the Katraj side of Ambegaon?',
    answer: 'Yes, including Narhe and the plotted developments toward Sinhagad Road. It is a spread-out belt with a lot of similar lane names, so send a location pin with the booking — it is the difference between the groomer reaching your gate and calling you from near it.'
  },
  {
    question: 'Does borewell water suit a cat’s skin, or should we use stored water?',
    answer: 'Either works — what matters is the rinse, not the source. Hard borewell water leaves mineral deposit that dulls the coat and can leave skin flaky, and a cat then ingests that residue when she self-grooms afterwards. We rinse for noticeably longer on this side of the city and finish with a conditioning rinse, which clears most of it.'
  },
  {
    question: 'Power cuts happen often here. What if the electricity goes mid-session?',
    answer: 'Only the drying stage needs power, so a cut pauses the session rather than ending it. Tell the groomer which sockets are on your inverter if you have one. A cat left damp is not an outcome we will accept — if power is genuinely out we towel-dry thoroughly, keep the room warm and wait.'
  },
  {
    question: 'Our cat spends the day in the compound. How often should she be groomed?',
    answer: 'Every four to six weeks for a longhair with outdoor access, six to eight for a shorthair — but with a tick check at every single session regardless of the gap. The bathing interval is a coat decision; the inspection interval is not. Through monsoon we would tighten both.'
  },
  {
    question: 'There are street cats around our plot. Should I worry about disease?',
    answer: 'It is worth being aware of rather than alarmed by. Cats that meet free-ranging cats face higher exposure to fleas, ear mites and skin infections, all of which we check for at the start of every session and flag to you. What we cannot do is diagnose or treat — if we find something that looks like more than a grooming issue, we tell you to see your vet.'
  }
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
    {
      heading: 'Hairballs Are a Grooming Problem Wearing a Digestive Costume',
      subheading: 'Where the fur on your floor actually comes from.',
      paragraphs: [
        'A cat spends a substantial part of its waking life grooming itself, and a cat\'s tongue is covered in backward-facing barbs that work like a comb. Everything those barbs collect goes one way: down. In a cat with a normal coat and a normal amount of loose fur, that swallowed hair passes through and you never know about it.',
        'The problem starts when the volume goes up. A heavy-shedding cat, a longhaired cat in a Baner high-rise with the AC running, or a cat approaching a seasonal moult is ingesting far more hair than its gut can move along, and the surplus collects in the stomach. That is a hairball, and the retching-then-producing routine on your floor at six in the morning is the successful outcome. The unsuccessful outcome is the hair staying put, which causes loss of appetite, constipation and occasionally a genuine blockage.',
        'The point worth taking from this is that hairball frequency is a direct readout of how much loose fur is in your cat\'s coat, and that is something a grooming schedule controls. Removing the dead undercoat with a proper deshedding pass means it ends up in a bag rather than in your cat. Owners in Baner who move a heavy shedder from a two-month to a four-week rhythm generally report the hairballs dropping off noticeably. What is not normal, and no amount of grooming will fix, is repeated retching that produces nothing, or a cat that goes off food alongside it. That is a vet visit the same week.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Deshedding to reduce hairballs during cat grooming at home in Baner Pune',
      imageLeft: false,
    },
    {
      heading: 'The Same Groomer, As Often As We Can Manage It',
      subheading: 'Cats do not warm to a service. They warm to a person.',
      paragraphs: [
        'Baner runs on efficiency and most of our clients here would happily accept whichever groomer is free. We try not to give you that, and it is worth explaining why we bother.',
        'A dog will generally cooperate with a competent stranger. A cat will not — it cooperates with someone it has decided is acceptable, and that decision is made once and then largely stands. A groomer who has been to your flat twice already knows that your cat has to sniff the bag before anything starts, that she will tolerate her back feet but not her front ones, that the dryer has to come from the left, and that there is a mat that forms behind her right elbow every single time. None of that is written down usefully; it is knowledge that lives with a person. The second session with the same groomer is noticeably faster than the first, and the fourth barely resembles the first at all.',
        'So we route repeat bookings back to the same groomer wherever the schedule allows, and if you ask for someone by name we will do our best to make it work — which occasionally means a slightly later slot than you wanted. When it genuinely cannot happen, the new groomer arrives having read the notes from the previous sessions, so at least the cat is not starting from nothing. If a particular groomer worked especially well with your cat, tell us. We would rather build the schedule around that than around convenience.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Repeat cat grooming visits with the same groomer in Baner Pune',
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
  {
    question: 'Can the same groomer handle every visit for our cat?',
    answer: 'Yes, and we encourage it. Cats accept a specific person rather than a service, and the difference between a first and a third session with the same groomer is substantial — they already know your cat\'s particular objections and where her coat knots. Mention the name when you book and we will route it that way wherever the schedule allows, which occasionally means offering you a slot an hour or two off your first choice. If it genuinely cannot be arranged, the groomer who does come will have read the notes from previous visits.',
  },
  {
    question: 'The fur at the base of my cat\'s tail has gone greasy and clumped, but the rest of the coat is fine. What is that?',
    answer: 'That is almost certainly stud tail — an overactive gland on the upper surface of the tail base producing excess oil. It is most common in unneutered males but neutered cats and females get it too, and it is harmless in itself, just unpleasant. It responds well to a degreasing wash concentrated on that area during the session, and to a shorter grooming interval so the buildup never gets established. If the skin there is red, sore or has black crusting rather than just greasy fur, that has probably become infected and needs a vet.',
  },
  {
    question: 'My cat was spayed ten days ago. Is it safe to book a grooming session?',
    answer: 'Give it a bit longer — around fourteen days after a routine spay, and only once your vet is happy the incision has fully closed with no scabbing or weeping. Water on a healing surgical site is the specific thing to avoid. Once it has healed we will still work gently around the area and keep shampoo off it, and the shaved patch will regrow over a couple of months. If she needs claws or an ear clean before then, we can do a short water-free session instead — just tell us the surgery date when you book.',
  },
  {
    question: 'What weekend availability do you have? Weekdays are impossible.',
    answer: 'Saturday and Sunday run the same 9 AM to 9 PM hours, and Baner weekend slots are the fastest-filling we have — the IT working week concentrates demand into two days here more than anywhere else. Book four or five days ahead rather than trying on the Friday.'
  },
  {
    question: 'Construction dust from the Sus and Balewadi side is constant. Does that reach an indoor cat?',
    answer: 'Yes. Fine construction dust drifts indoors and settles on every surface the cat sleeps on, and from there it goes into the coat and gets swallowed during self-grooming. While building work continues nearby, keeping to the shorter end of your cat\'s interval is a reasonable response.'
  },
  {
    question: 'I will be on video calls throughout. How disruptive is a cat session?',
    answer: 'Less than you would expect, with one exception. Most of the session is quiet handling in a closed room; the dryer is the only genuinely audible stage and it runs for perhaps fifteen minutes. Tell the groomer if you have a fixed call and they will sequence the noisy part around it where the coat allows.'
  },
  {
    question: 'Our cat is strictly indoor in a high-rise. Is the balcony a risk during the session?',
    answer: 'It is the main one, which is why we work in a single closed room with the door shut throughout. A startled cat in a Baner tower heads for the balcony, and cats have no reliable sense of height — a railing is not the barrier people assume it is. Keep balcony doors closed and any netting up while we are working.'
  },
  {
    question: 'Can you groom a cat that has just moved house with us?',
    answer: 'Give it two to three weeks first, unless the coat is genuinely matted and cannot wait. A cat that has just relocated is already spending its whole reserve on the new environment, and adding a stranger with a dryer on top of that usually produces a bad first session that makes the next one harder. If matting means it cannot wait, tell us and we will keep the session minimal.'
  }
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
    {
      heading: 'All That Green Comes Indoors With Your Cat',
      subheading: 'Bavdhan\'s tree cover is lovely. Your cat\'s coat disagrees.',
      paragraphs: [
        'Bavdhan is one of the greener parts of Pune — the hill slopes behind the societies, the tree line along the Sus and Pashan roads, gardens that actually have soil in them. It is a large part of why people move here. It also means Bavdhan cats live with a set of things that a cat in a Camp apartment simply never encounters.',
        'Grass seeds work their way into the fur between the toes and, left alone, can burrow into the skin. Pollen settles in the coat through the flowering months and gets licked off during self-grooming, which is one of the quieter causes of seasonal itching we see. Balcony cats in this area regularly come back in with sap, tiny burrs and the occasional insect. None of it is alarming and all of it is easier to deal with early, so our Bavdhan sessions include a proper look between the toes and along the belly line rather than a glance. Owners who have never had a groomer part the fur down there are usually surprised at what turns up.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Checking a cat\'s paws and belly for grass seeds during grooming in Bavdhan',
      imageLeft: true,
    },
    {
      heading: 'Cat Breeds We Groom Around Bavdhan',
      subheading: 'Quiet lanes, well-kept cats, some very serious coats.',
      paragraphs: [
        'Bavdhan\'s mix of independent houses and mid-rise societies produces an interesting spread of cats, and the drier hillside air treats each coat type differently. These are the ones we handle most often here:',
      ],
      bullets: [
        'Persian cat grooming in Bavdhan — The dry air here makes Persian coats brittle rather than greasy, which sounds better and is not. Brittle fur snaps under a comb and mats form from the broken ends. We condition heavily, comb with a wider tooth spacing than usual, and never dry-brush a Bavdhan Persian.',
        'Maine Coon grooming in Bavdhan — Several in the larger houses on the hill side. Their weather-resistant coat is built for cold damp climates and does not love Pune at all; we thin the undercoat properly rather than just washing the top layer.',
        'Ragdoll grooming in Bavdhan — Silky, low-grease, and prone to static in this air. A conditioning rinse and a slow low-heat dry stops the coat standing on end and matting behind the elbows.',
        'Indie and domestic shorthair grooming in Bavdhan — Often with balcony or garden access, so the session is as much inspection as grooming. Paws, ears and the base of the tail first, coat second.',
        'British Shorthair grooming in Bavdhan — Dense enough that owners rarely reach the skin at home. We pre-brush dry, deshed during the wash, then comb again once fully dry, which is when the real volume of loose undercoat finally comes out.',
      ],
      closingLine: 'If your cat is a hillside hunter of unknown parentage, that is a Bavdhan classic and we know the type well.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Longhair cat breed grooming at home in Bavdhan Pune',
      imageLeft: false,
    },
    {
      heading: 'Starting Late: Cats Who Have Never Been Groomed',
      subheading: 'Eight years old and never seen a groomer is more common than you think.',
      paragraphs: [
        'A surprising share of our Bavdhan first-time bookings are for adult cats — five, eight, sometimes eleven years old — who have simply never had a professional session. Usually because the cat seemed fine, and because the only options used to involve a carrier and a drive.',
        'Those first sessions need managing rather than rushing. A cat with no grooming history has no idea what any of it means: the sound of clippers, the feeling of a comb reaching skin, water that it did not choose. So the first visit is deliberately incomplete. We prioritise what is actually urgent — overgrown claws, an impacted ear, a mat that is pulling — and we stop while the cat is still tolerating it rather than pushing for a finished look. The second session, four to six weeks later, almost always goes twice as well, because the cat has learned that the person with the bag leaves and nothing bad happened. By the third, most cats are simply bored of the whole thing, which is exactly where we want them.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'First professional grooming session for an adult cat in Bavdhan Pune',
      imageLeft: true,
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
  {
    question: 'Do you cover the hillside societies, Sus Road and the Chandni Chowk side of Bavdhan?',
    answer: 'Yes. Bavdhan Budruk, Bavdhan Khurd, the societies up the hill slope, the Sus Road stretch and the pockets either side of Chandni Chowk are all on our route, along with Pashan, Baner and the Kothrud border. The hill roads add a few minutes, so we tend to give a slightly wider arrival window for the higher societies — the groomer will message you when they set off.',
  },
  {
    question: 'My cat hunts lizards and insects on the balcony. Is that worth mentioning before a session?',
    answer: 'Please do mention it. It tells the groomer to look more carefully at the mouth, chin and front paws, where scratches and small abscesses from that kind of activity tend to show up, and it is useful context if we find anything odd in the coat. It also matters for timing — if your cat has recently eaten something it caught and is off-colour, we would rather reschedule than bathe an unwell cat.',
  },
  {
    question: 'My cat is eight and has never been professionally groomed. Is it too late to start?',
    answer: 'Not at all, but set your expectations for the first visit rather than the ideal one. An adult cat with no grooming history needs to learn the routine, so we handle the genuinely necessary things first — claws, ears, any mat that is pulling on the skin — and stop before the cat runs out of patience rather than pushing for a perfect finish. Sessions two and three go dramatically better. Most owners are surprised by how quickly a set-in-its-ways adult cat decides the whole thing is unremarkable.',
  },
  {
    question: 'What is a realistic slot given the Chandni Chowk traffic?',
    answer: 'Mid-morning or early afternoon. The Chandni Chowk approach at peak hours is one of the least predictable stretches in the city, and we would rather book a window we can actually hold than commit to a 7 PM arrival we end up apologising for. Evening is possible with a wider window.'
  },
  {
    question: 'Our cat gets onto the terrace and there is scrub around the hillside societies. What should we check?',
    answer: 'Ticks and grass seeds both. The hillside belt here sheds seed heads that lodge between the toes and inside the ear canal and can work under the skin if left. Our groomers check the webbing between every toe and both ears as standard — for a cat with terrace and scrub access it is one of the more valuable parts of the session.'
  },
  {
    question: 'We live in a fourth-floor flat with no lift. Does that work?',
    answer: 'Completely. The groomer carries everything in one shoulder bag and your cat never leaves the flat — no carrier, no stairs, no car journey, which is the entire point of grooming at home. The absence of a lift affects nothing about the session.'
  },
  {
    question: 'My cat sunbathes on the terrace for hours. Does that damage the coat?',
    answer: 'Sustained sun lightens and dries the guard hairs, and on a dark or longhaired coat it is visible by the end of summer. A conditioning treatment during the session helps the coat hold moisture. The more important point applies to white and pale-eared cats: prolonged direct sun raises real skin-cancer risk on the ear tips, and that is a conversation for your vet, not a grooming fix.'
  },
  {
    question: 'Our cat is far more settled around women. Can you send a woman groomer?',
    answer: 'Yes — tell us at booking rather than on the day. Cats often do have a clear preference driven by voice pitch and handling style, and it is a sensible thing to plan around rather than hope for. The only caveat is availability: it may mean a different day or a wider arrival window than your first choice.'
  }
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
    {
      heading: 'Old Bungalows, Big Compounds, and Cats Who Consider It All Theirs',
      subheading: 'Khadki cats patrol more territory than most.',
      paragraphs: [
        'Khadki still has what most of Pune has built over — walled compounds, old trees, service lanes, and quarters with actual gardens. Cats here are rarely confined to a flat. They have a route: the boundary wall, the shaded bit under the gulmohar, the back of the kitchen block, and whichever neighbour is softest about food.',
        'That life shows up in the coat. Garden soil works deep into a dense undercoat and does not rinse out in one pass. Old compound walls mean scrapes and the occasional torn claw. Long grass in the monsoon months means ticks, and Khadki\'s tree cover keeps the ground damp enough that tick season here runs longer than in the concrete parts of the city. So our sessions in this area are built around a real inspection: between the toes, inside the ears, along the jawline and under the tail, before anything else happens. We would rather find a tick and tell you than produce a beautifully finished cat with a problem hidden under the fur.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Tick and coat inspection for a garden cat during grooming in Khadki Pune',
      imageLeft: true,
    },
    {
      heading: 'Cat Breeds We Groom Around Khadki',
      subheading: 'Long-serving families, long-serving cats.',
      paragraphs: [
        'Khadki\'s cat population is shaped by its housing — established households, generations of the same family in the same quarters, and a steady flow of cats adopted from the compound rather than bought. Here is the usual spread:',
      ],
      bullets: [
        'Indie and compound-adopted cat grooming in Khadki — The majority here, and often semi-outdoor. Robust coats, strong opinions, and a real need for the tick and flea check more than for cosmetic work.',
        'Persian and Persian-cross grooming in Khadki — Common in the older residences. Garden access plus a long coat is the hardest combination there is; we allow extra time for the belly and trousers, which is where soil and burrs collect.',
        'Domestic shorthair and tabby grooming in Khadki — Straightforward on paper. In practice these are the cats most likely to have a scab or a scratch hidden somewhere, so the inspection matters more than the bath.',
        'Siamese grooming in Khadki — Minimal coat, maximum territorial instinct. A Siamese who has ruled a compound for nine years will not simply hand itself over. We let it approach the equipment first and work at its pace.',
        'Senior cats of any type — Khadki has an unusual number of cats over twelve. Shorter blocks, warmer water, lying down rather than sitting up, and we stop when they say so.',
      ],
      closingLine: 'Cantonment cats tend to be confident, well-fed and entirely unimpressed by visitors. We are used to being assessed before we are allowed to start.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Indie and Persian cat grooming at home in Khadki Pune',
      imageLeft: false,
    },
    {
      heading: 'What We Bring, and What We Leave Behind',
      subheading: 'Everything arrives with the groomer. Nothing stays after.',
      paragraphs: [
        'You supply a tap, a plug point and about a square metre of floor. We supply the rest: clippers and blades, a low-noise dryer, slicker brushes and de-matting combs, cat-specific shampoo and conditioner, ear cleaner, nail clippers, towels and a non-slip mat. No borrowed buckets, no using your bath towels, no asking whether you happen to have a hairdryer.',
        'The other half of that promise is cleanup, and in Khadki\'s well-kept older homes it is the part people actually judge us on. Loose fur is collected as we go rather than swept up at the end, nail clippings go into a bag, the bathroom is rinsed down, and the mat is rolled and taken away. The intended result is that half an hour after the groomer leaves, the only evidence anyone was there is a considerably cleaner cat sulking under a bed.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Complete mobile cat grooming setup brought to a home in Khadki Pune',
      imageLeft: true,
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
  {
    question: 'Our address is inside the cantonment. Does the groomer need entry permission?',
    answer: 'Sometimes, and it is worth sorting out before the slot rather than at the gate. Several Khadki addresses need the resident to inform security or leave a name at the entry point for a visitor. Tell us at booking and we will send the groomer\'s name, phone number and vehicle details in advance so you can pass them on. Without that, a groomer held at a gate eats into your slot and everyone\'s afternoon.',
  },
  {
    question: 'My cat keeps shaking her head and has dark wax in one ear. Will grooming fix it?',
    answer: 'Grooming will clean the ear, but one-sided dark wax with head-shaking usually means ear mites or an infection, and that needs a vet rather than a groomer. We will clean gently and carefully, avoid flushing anything into an ear that may already be inflamed, and tell you what we can see. Booking a vet visit alongside the grooming is the right move — cleaning an ear without treating the cause just resets the clock.',
  },
  {
    question: 'We also feed a few community cats in the compound. Can they be groomed?',
    answer: 'Honestly, usually not — and we would rather say so than take the booking. A cat that has never been handled is not going to tolerate a bath and a dryer from a stranger, and forcing that is bad for the cat and unsafe for the groomer. What sometimes works is a semi-tame compound cat who already lets you pick them up, in which case we would attempt claws and a coat check only, no water. If a community cat has a matted or injured coat, a vet with sedation facilities is the right route, not us.',
  },
  {
    question: 'Which areas around Khadki do you serve for cats?',
    answer: 'Dapodi, Sangvi, Pimple Gurav, the cantonment area itself and across to the Aundh border. It is a compact, well-connected belt, so arrival windows here are among the most reliable we offer — which matters for cats, where a groomer arriving late to an already-alert animal makes the whole session harder.'
  },
  {
    question: 'Our building has no lift and we are on the third floor. Is that a problem?',
    answer: 'Not at all — the groomer carries everything in a single shoulder bag, and your cat never leaves the flat. That is the whole advantage over a salon: no carrier, no stairs for the cat, no car journey. Older Khadki walk-ups are a routine address for us.'
  },
  {
    question: 'What happens to the fur and clippings after the session?',
    answer: 'They leave with the groomer. Fur is collected as we go rather than swept at the end, nail clippings are bagged, and the working area is cleaned before the groomer leaves. You should not be finding traces of the session the next morning — if you do, tell us, because that falls short of the standard.'
  },
  {
    question: 'Can I book a nail trim on its own?',
    answer: 'Yes. A short maintenance visit covering nails and an ear clean is available below full session price — ask for it by name at booking. For an indoor shorthair it is often all that is genuinely needed between full grooms, and it avoids bathing a cat more often than the coat requires.'
  },
  {
    question: 'Our water supply is on fixed timings. Is that enough for a cat?',
    answer: 'Comfortably. A cat bath uses far less water than most people expect — two filled buckets cover wash and rinse for a full session. Keep them ready before the slot and tell the groomer on arrival so they plan the rinse from stored water rather than assuming a running tap.'
  }
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
    {
      heading: 'A Lot of Ravet Cat Parents Are Doing This for the First Time',
      subheading: 'New flats, new families, first cat.',
      paragraphs: [
        'Ravet filled up fast, mostly with young families buying their first home. A cat often arrives in year two, from a litter someone at work was rehoming or from a rescue group in Pimpri. Which means a large share of the cat parents we meet here are genuinely new to it, and nobody has told them what grooming is actually for.',
        'The honest version is short. Cats groom themselves well enough to stay presentable and not well enough to stay healthy. What they cannot do is trim a claw that is curving towards the pad, remove the dead undercoat sitting near the skin, clear wax from deep in an ear, or reach the base of their own spine once they put on a little weight. Those four things are most of what a professional session is. Everything else — the shine, the smell, the way the coat sits — is a pleasant side effect. If you are booking your first session and are not sure what to ask for, say so; the groomer will walk you through what your particular cat needs and, just as usefully, what it does not.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'First-time cat owner guidance during a home grooming session in Ravet Pune',
      imageLeft: true,
    },
    {
      heading: 'Cat Breeds We Groom Around Ravet',
      subheading: 'Young households, young cats, growing variety.',
      paragraphs: [
        'The Ravet-Akurdi belt has a notably young cat population — a lot of cats under four, and a lot of first pedigrees bought by first-time owners. Here is what we see most and how each is handled:',
      ],
      bullets: [
        'Persian cat grooming in Ravet — Still the default "first proper cat" purchase in this belt, and the one whose coat catches new owners out. Daily brushing is genuinely required; without it we are de-matting rather than grooming by week six. We show you the technique at the end of the session.',
        'Domestic shorthair and Indie grooming in Ravet — Rescued kittens from the Pimpri and Akurdi shelters make up a big share here. Easy coats, and the priority is establishing the routine young so the cat is unbothered by grooming for the rest of its life.',
        'Bengal grooming in Ravet — Popular in the newer towers. The coat is almost self-maintaining, but Bengals are active, strong and quick, so the session is about efficient handling rather than coat work. Claws grow fast on these cats.',
        'Ragdoll and semi-longhair grooming in Ravet — The soft, silky coat tempts owners to leave it alone because it looks fine on top. It mats behind the elbows and in the trousers. We check those two places before anything else.',
        'Kittens under six months — A large part of our Ravet workload. First sessions are short and deliberately easy: warm water, a quick wash, claws, ears, and finished before the kitten decides it has had enough.',
      ],
      closingLine: 'First cat, first session, no idea what you are doing? That is most of Ravet, and it is completely fine.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Kitten and Persian cat grooming at home in Ravet Pune',
      imageLeft: false,
    },
    {
      heading: 'What a Deshedding Session Actually Is',
      subheading: 'It is not a haircut, and it is not shaving.',
      paragraphs: [
        'Deshedding is the step most first-time owners in Ravet have heard of and almost nobody has had explained, so here it is. A cat\'s coat has two layers — the outer guard hairs you can see, and a soft undercoat underneath. The undercoat is what dies off and loosens seasonally. Because it sits close to the skin, a normal brush glides over the top of it without ever making contact.',
        'A deshedding session removes that layer deliberately: a dry brush-out first, then a shampoo that helps release the dead coat while the cat is wet, then a fine-toothed comb worked right down to the skin once the coat is fully dry. Nothing is cut and nothing is shaved — the cat leaves with the same coat length it arrived with, just without a fistful of dead fur in it. The visible results are less fur on your furniture, fewer hairballs, and a coat that lies flat instead of standing away from the body. On a heavy shedder it is the single most worthwhile part of the whole session.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat deshedding treatment explained during a home session in Ravet Pune',
      imageLeft: true,
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
  {
    question: 'Will grooming stop my cat shedding completely?',
    answer: 'No, and be wary of anyone who says it will. Shedding is a normal, continuous process and a healthy cat will always lose coat. What a deshedding session does is remove the dead undercoat in one controlled go instead of letting it come out gradually all over your flat. Expect a clear drop in loose fur for roughly two to three weeks, then a gradual return as new coat loosens. Cats who shed heavily usually settle into a four to six week rhythm; light shedders manage on eight.',
  },
  {
    question: 'Do you have weekend and evening slots in Ravet?',
    answer: 'Yes to both, and they are the first to go. We run from 9 AM to 9 PM seven days a week, and the after-work slots from around 6 PM plus the whole of Saturday and Sunday are the busiest in the Ravet-Akurdi belt because so many households here have two people working full time. Booking four or five days ahead usually gets you the slot you actually want; weekday mornings are almost always available at short notice.',
  },
  {
    question: 'Our society requires visitors to be pre-registered on a gate app. How do we handle that?',
    answer: 'Just approve the groomer the way you would any other visitor. Once the booking is confirmed we send you the groomer\'s name and mobile number, so you can add them in advance or accept the entry request when it pops up. Most of the newer Ravet towers work this way and it is not a problem — the only thing that costs time is nobody being reachable when the groomer is standing at the gate, so keep your phone nearby around the start of the slot.',
  },
  {
    question: 'Do you cover Punawale, Kiwale and the Tathawade side?',
    answer: 'Yes, the whole newer township belt through Ravet, Punawale, Kiwale and across to Tathawade. Many of these societies are known by builder name rather than street and several repeat that name across phases, so mention your phase or tower when booking.'
  },
  {
    question: 'New townships here have irregular water supply. How do we plan?',
    answer: 'Keep two filled buckets ready before the slot if your supply is timed — that covers the wash and rinse for a full cat session with room to spare. Tell the groomer on arrival so they plan the rinse deliberately rather than discovering the tap is dry mid-lather.'
  },
  {
    question: 'Someone in the family has developed a cat allergy. Does grooming help enough?',
    answer: 'It helps meaningfully but it does not solve it, and you deserve the honest version. The allergen is a protein in saliva and skin secretions that dries onto the coat and sheds into the air on loose fur — so regular bathing and deshedding removes a real share of it. It manages the problem; it does not eliminate it. Combine sessions with an air purifier and keeping the bedroom cat-free.'
  },
  {
    question: 'Our tower has a service lift and a separate entrance. Does that complicate things?',
    answer: 'No — the groomer follows whatever your building requires and carries everything in one bag. The only thing worth flagging at booking is if the service entrance is on a different side of the complex from the main gate, which is where a groomer usually loses ten minutes in a large Ravet township.'
  },
  {
    question: 'What happens to a half-dried cat if the power cuts out?',
    answer: 'The session pauses; it does not end. Only the drying stage needs electricity, so tell the groomer which sockets run off your inverter if you have one. We will not leave a cat damp — a wet coat in Pune humidity stays wet at the skin for hours, so we towel-dry thoroughly, keep the room warm and wait for power rather than calling it finished.'
  }
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
    {
      heading: 'When a Cat Has Been Groomed Badly Before',
      subheading: 'It is recoverable. It just takes more than one visit.',
      paragraphs: [
        'Aundh has had pet services for longer than most of Pune, which means it also has a longer history of cats who had a bad experience somewhere and have not been groomed since. We meet these cats regularly and the conversation is always slightly apologetic, as though the owner did something wrong. They usually did not — they took a cat to a place that groomed dogs and improvised.',
        'A cat that has been scruffed, held in a bag, or left in a cage with a dryer running does not simply forget. It generalises: the bag, the smell of shampoo, a stranger crouching, sometimes just the doorbell. So the first session with us is not really a grooming session. The groomer arrives, unpacks slowly, and lets the cat investigate on its own terms. We may only get claws done. Occasionally we get nothing done beyond the cat deciding this person is not the previous person, and honestly that is a good first visit.',
        'The second visit is where it usually turns. By the third or fourth most of these cats are grooming normally, and a fair number end up easier than cats who have never had a bad experience, because the routine is now familiar and predictable. What makes the difference is not any technique in particular — it is being willing to leave with the job unfinished rather than forcing it, which is the exact thing that went wrong the first time. If your cat is in this category, tell us before booking. It changes how we plan the visit and what we consider a success.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Rebuilding trust with a cat after a bad grooming experience in Aundh Pune',
      imageLeft: false,
    },
    {
      heading: 'Five Minutes a Day Is Worth More Than Anything We Do',
      subheading: 'The between-sessions routine, minus the marketing.',
      paragraphs: [
        'The uncomfortable truth about our own service is that a professional session every six weeks matters less than five minutes of combing a day. We would rather say that plainly than sell you extra visits.',
        'Get the tool right first, because most people have the wrong one. A soft slicker brush is the general-purpose choice for medium and long coats. A steel greyhound comb — the metal one with two tooth spacings — is what actually finds mats, because it reaches the skin where a brush glides over the top; if you buy one thing, buy this. A deshedding tool is for short dense coats like a British Shorthair and should be used weekly at most, since overuse thins the coat. A rubber curry mitt suits shorthairs who dislike being brushed. What you do not need is the multi-piece kit sold online.',
        'Then the technique, which takes a minute to learn. Work in the direction the fur lies, not against it. Start where the cat likes being touched — usually the cheeks and along the back — and finish with the places that actually matter: behind the ears, under the front legs, the belly, the trousers, the base of the tail. Those five spots are where every mat we ever clip out began. Hold the fur at its base with your free hand before pulling a comb through a tangle so the tension is on your fingers rather than her skin.',
        'Do that most days and your Persian goes from needing rescue every visit to needing maintenance. Ask your groomer to show you on your own cat at the end of the session — it lands better than any description.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Home brushing routine demonstrated after a cat grooming session in Aundh Pune',
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
  {
    question: 'Which brush should I actually buy for my cat?',
    answer: 'For most cats, a steel greyhound comb — the metal one with wide teeth at one end and fine at the other. It reaches the skin, which is the entire point, since a brush glides over the top of the coat and misses the mats forming underneath. Add a soft slicker brush for a medium or long coat, or a rubber curry mitt for a shorthair who objects to bristles. A deshedding tool is only for short dense coats like a British Shorthair, and weekly at most, because overusing one thins the coat. You do not need the twelve-piece kit. Ask your groomer to demonstrate on your own cat at the end of the session.',
  },
  {
    question: 'A groomer hurt my cat years ago and she has hidden from strangers ever since. Is there any point trying again?',
    answer: 'Yes, though not in one visit. Cats generalise a bad experience to the whole situation, so the first session is about replacing the association rather than finishing a groom — the groomer unpacks slowly, lets her approach, and may get no further than claws. That is a good outcome and we will not push past it. The turn usually comes on the second visit, and by the third or fourth most of these cats groom normally. Tell us the history when you book so the groomer plans for a partial session from the outset rather than discovering it halfway through.',
  },
  {
    question: 'Do you cover Sangvi, Pimple Gurav and the Khadki border side of Aundh?',
    answer: 'Yes — Aundh proper, Anand Park, ITI Road, Sangvi, Pimple Gurav, Pimple Saudagar, Bopodi and across to Khadki and Baner are all on the same route. This is one of our better-covered corridors, so short-notice weekday slots are more often available here than in the outer areas. Send a location pin if your society sits somewhere ambiguous between Sangvi and Pimple Gurav and we will confirm before you book.',
  },
  {
    question: 'Parking is tight in the older Aundh lanes. Is that an issue?',
    answer: 'No. Groomers arrive by two-wheeler with the entire kit in a shoulder bag — nothing is unloaded at your gate and no four-wheeler needs a bay. It is exactly why this works on the narrow lanes off Bremen Chowk and through the older parts of Aundh.'
  },
  {
    question: 'We are boarding our cat next month. Should we groom before or after?',
    answer: 'Before, by a few days. A cat going into boarding with a mat-free coat and short nails is far easier for the facility to handle and much less likely to come home with a coat problem — boarding stress often means a cat stops self-grooming properly for the duration. A session afterwards is reasonable too, but doing it beforehand is what prevents trouble.'
  },
  {
    question: 'Is it safe to groom a cat that is pregnant?',
    answer: 'In early pregnancy, usually yes, with a short and gentle session and no pressure on the abdomen. In the last two to three weeks we would not bathe a cat at all — the handling and the stress are not worth it, and a queen close to term should be left alone. Tell us at booking, and if you are unsure how far along she is, ask your vet before you book.'
  },
  {
    question: 'My cat wears a bell collar. Should it come off?',
    answer: 'It comes off for the session and goes back on before the groomer leaves. A collar traps moisture against the neck during a bath, and the fur underneath is one of the places we most often find matting that owners have never seen because the collar hides it. Worth checking that area yourself between visits too.'
  },
  {
    question: 'The dog was treated for fleas and now the cat is scratching. What should we do?',
    answer: 'Treat the cat with a cat-specific product and treat the house, in the same week. This is genuinely important: permethrin-based flea products meant for dogs can be fatal to cats, so never apply a dog treatment to a cat or let a treated dog sleep pressed against one. Our session removes what is on the cat, but eggs in bedding and floor cracks re-infest within days unless the environment is dealt with too.'
  }
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
    {
      heading: 'Hard Water Is a Real Problem in This Belt',
      subheading: 'And it is probably why the coat never feels quite clean.',
      paragraphs: [
        'This is the complaint we hear most often in Kalewadi and across the PCMC side generally: "I bathe her myself but the fur still feels rough afterwards." Nine times out of ten the shampoo is not the issue. The water is.',
        'Much of this belt runs on borewell or mixed supply with a high mineral load. Hard water does two things to a cat\'s coat. It stops shampoo lathering and rinsing properly, so a residue stays behind in the undercoat and attracts dust faster than before the bath. And the dissolved minerals themselves deposit on the hair shaft, which is what makes a freshly washed coat feel chalky and look dull rather than glossy. On a longhair cat that residue is also a mat starter, because coated hairs grip each other.',
        'We work around it rather than complaining about it — a clarifying first wash to lift the existing buildup, a conditioner formulated to stay effective in hard water, and a much longer rinse than most people do at home, because under-rinsing is the single biggest cause of the problem repeating. If your water is particularly hard, the groomer will tell you and suggest a realistic home routine that does not make things worse between visits.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Clarifying cat bath for hard water areas in Kalewadi Pune',
      imageLeft: true,
    },
    {
      heading: 'Cat Breeds We Groom Around Kalewadi',
      subheading: 'A practical neighbourhood with practical cats.',
      paragraphs: [
        'Kalewadi\'s cat population is mostly homegrown — cats that arrived as strays, kittens from a neighbour\'s litter, the occasional pedigree in the newer buildings towards Pimple Saudagar. Here is how we approach the ones we meet most:',
      ],
      bullets: [
        'Indie and domestic shorthair grooming in Kalewadi — The overwhelming majority here, and the group most affected by the local dust and hard water. A clarifying wash plus a proper deshedding pass makes a bigger visible difference on these cats than on any pedigree.',
        'Persian cat grooming in Kalewadi — Fewer than in central Pune but growing. Hard water and a long coat is a bad pairing, so we condition heavily and rinse for longer than the coat looks like it needs.',
        'Tabby and tuxedo cats — Short, dense coats where mineral residue shows up as a dull, slightly grey cast. One clarifying session usually restores the contrast in the markings, which owners notice immediately.',
        'Kittens from local litters — Kalewadi rehomes a lot of kittens informally between neighbours. A first session early sets the routine, and it is also the first chance anyone has had to check for ear mites and fleas, which are common in litters raised outdoors.',
        'Older and semi-outdoor cats — Cats here often have some access to the building compound. Nails, ears and a tick check take priority over anything cosmetic.',
      ],
      closingLine: 'No pedigree, no papers, no idea of the age — that describes most cats in Kalewadi and none of it changes the session.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Indie cat grooming at home in Kalewadi Pune',
      imageLeft: false,
    },
    {
      heading: 'Small Flats and Shared Buildings — How the Setup Actually Works',
      subheading: 'Less space than you think is needed.',
      paragraphs: [
        'A common reason people in Kalewadi put off booking is space. Flats here are compact, buildings are close together, and the mental image of "professional grooming equipment" suggests something that will not fit through the door.',
        'In practice the groomer arrives with one bag. The washing happens in your bathroom, using your tap. The drying and combing happen on a non-slip mat laid on the floor just outside it, which needs about the footprint of a bath towel. There is no table, no tub, no cage, and nothing that has to be assembled. A 1BHK works fine; we have done plenty of sessions in less.',
        'Compact flats also have a genuine advantage for cats. Fewer rooms means fewer places to disappear to, which sounds like a downside and is actually the opposite — a cat that cannot vanish under a bed in a far room stays in sight, stays reachable, and the session finishes faster with less chasing. The one thing worth doing before we arrive is closing the door to any loft, storage space or balcony gap, since that is where a startled cat will head first.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Compact cat grooming setup inside a small flat in Kalewadi Pune',
      imageLeft: true,
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
  {
    question: 'Do you bring your own water, or do we need a working geyser?',
    answer: 'We use your tap, so a working water supply is the one thing we genuinely need from you. A geyser is helpful but not essential — what matters is lukewarm water, and in Kalewadi\'s summers the tank supply is often warm enough on its own. If your geyser is not working, a couple of buckets of warm water kept ready is a perfectly good substitute. Cold water is the one thing we will not use; it makes cats miserable and makes drying take twice as long.',
  },
  {
    question: 'How long does my cat take to dry, and can I let her out of the room straight after?',
    answer: 'The cat leaves the session fully dry — we do not hand back a damp cat, because a damp undercoat in this climate mats within days and can chill a smaller or older cat. Drying is done on low heat and takes anywhere from ten minutes for a shorthair to forty for a thick double coat. Once we are done she can go wherever she likes. Most cats spend the next hour indignantly re-grooming themselves, which is normal and nothing to worry about.',
  },
  {
    question: 'My white cat\'s fur has gone yellowish. Can a session fix that?',
    answer: 'Often, yes, though it depends on the cause. Yellowing on a white coat in this belt is usually a mix of mineral residue from hard water and dust bonded into the hair, and a clarifying wash lifts a good part of that in one session. Two things it will not fix: staining around the eyes and mouth, which is tear and saliva pigment and needs regular wiping rather than bathing, and yellowing on an older cat whose coat oils have changed. The groomer will tell you which one you are dealing with rather than promising a result they cannot deliver.',
  },
  {
    question: 'How bad is Kalewadi Phata traffic for slot timings?',
    answer: 'Bad enough that we plan around it. The peak morning and 6 to 8 PM stretches through the Phata are where arrival windows slip most, so we would rather book you late morning or early afternoon and actually arrive on time. Evening is possible with a wider window rather than a precise minute.'
  },
  {
    question: 'Is a compact flat actually a disadvantage for grooming a cat?',
    answer: 'Usually the opposite. What a cat session needs is one room that closes, a tap and a plug point — and fewer places to bolt to means a cat settles considerably faster. A large open house is the harder setup, not the easier one, so a single shared bathroom is entirely workable.'
  },
  {
    question: 'Does monsoon flooding here affect appointments?',
    answer: 'Occasionally we move a slot rather than send a groomer wading through it with electrical equipment, and there is no charge for that. What monsoon changes regardless is drying: humidity keeps a coat damp at the skin far longer, and a damp longhaired cat is how fungal patches begin, so that stage takes noticeably more time through the rains.'
  },
  {
    question: 'My parents will be at home rather than me. Do your groomers speak Marathi?',
    answer: 'Yes — our groomers work in Marathi and Hindi as well as English, and in Kalewadi that comes up constantly. Tell us at booking if an elderly family member will be handling the visit so we can make sure the groomer and the household share a language for the instructions that actually matter.'
  },
  {
    question: 'Power cuts are common. What happens mid-session?',
    answer: 'Only the drying stage needs electricity, so a cut pauses rather than ends the session. Tell the groomer which sockets are on the inverter if you have one. A damp cat is not something we will leave behind — if power is out we towel-dry thoroughly, keep the room warm and wait.'
  }
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
    {
      heading: 'Living Under the Hills Means Living With Ticks',
      subheading: 'Katraj\'s tick season is longer than the rest of Pune\'s.',
      paragraphs: [
        'The hill slopes, the scrub along the bypass and the green belt around the lake are the best thing about living here. They are also a permanent tick reservoir, and the ground under that tree cover stays damp for weeks after the rest of the city has dried out. The practical result is that tick season in Katraj starts earlier and runs later than it does in central Pune, and cats with any outdoor access here pick them up in months when a Kothrud cat would not.',
        'Cats are harder to check than dogs, because a tick on a cat is usually not on the body at all. They lodge where the fur is thinnest and the cat cannot reach — inside the ear flap, in the fold under the chin, at the corner of the eye, between the toes. We check those five places at the start of every Katraj session, before the coat is wet, because a tick is far easier to spot on dry fur. If we find one we remove it properly with the mouthparts intact rather than pulling, show you where it was, and tell you honestly if the site looks inflamed enough to need a vet. What we do not do is sell you a preventive treatment; that is a conversation for whoever knows your cat\'s medical history.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Tick check during a cat grooming session near the Katraj hills Pune',
      imageLeft: true,
    },
    {
      heading: 'Cat Breeds We Groom Around Katraj',
      subheading: 'A wide spread, from bypass flats to hillside houses.',
      paragraphs: [
        'Katraj covers a lot of ground and the cat population changes as you move through it — older housing near the gaon, newer societies along the bypass, independent houses climbing towards the hills. These are the coats we handle most:',
      ],
      bullets: [
        'Persian cat grooming in Katraj — The local humidity is the enemy here. A Persian coat that seemed manageable in winter will be knotting at the armpits by July. We work through in sections with detangler and recommend a tighter schedule through the monsoon than the rest of the year.',
        'Indie and semi-outdoor cat grooming in Katraj — Very common, especially in the older parts. The tick and flea inspection is the main event; the bath is secondary. We plan longer first sessions since many have never been handled this way.',
        'Himalayan cat grooming in Katraj — A long coat plus a flat face, which means the coat mats and the eyes water. We keep water and airflow away from the face, use a damp cloth around the eye folds instead, and never point a dryer at a brachycephalic cat\'s nose.',
        'Domestic shorthair and tabby grooming in Katraj — The easiest coats and the ones where a hidden tick is most likely to be found quickly. Deshedding plus nails is usually the whole job.',
        'Maine Coon and semi-longhair grooming in Katraj — The undercoat holds damp for a long time in this pocket of the city. Complete drying is not optional; a Maine Coon sent away half dry will be matted within the week.',
      ],
      closingLine: 'Hillside cat, bypass flat cat, or the one who adopted your building — all the same to us once we see the coat.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Persian and Indie cat grooming at home in Katraj Pune',
      imageLeft: false,
    },
    {
      heading: 'What a Full Session in Katraj Actually Looks Like',
      subheading: 'Step by step, in the order it happens.',
      paragraphs: [
        'People book more confidently when they know what is coming, so here is the whole sequence. The groomer arrives, greets you, and then largely ignores the cat for the first few minutes while unpacking — that is deliberate, and it lets the cat come and investigate rather than being approached.',
        'Then: a dry inspection of coat, skin, ears, eyes, paws and claws, with anything notable pointed out to you before we start. Claws are trimmed first, while the cat is still dry and calm, because it is the step most likely to end patience. A dry brush-out follows to lift loose fur and locate mats. Any mat that can be worked loose is worked loose; anything tight against the skin is clipped out rather than pulled, and we will ask you before clipping. The bath comes next, in your bathroom with lukewarm water and cat-specific shampoo, then a long rinse and a conditioner. Drying is on low heat, on a mat, with the noise kept as far from the cat\'s head as possible. Ears are cleaned once the cat is dry and settled. A sanitary trim if needed, a final comb-through, and a short honest summary from the groomer about what they found.',
        'Start to finish it runs about 60 to 90 minutes for one cat, longer for a heavily matted longhair. We clean up as we go, so the last five minutes are packing rather than mopping.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Step by step cat grooming session at home in Katraj Pune',
      imageLeft: true,
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
  {
    question: 'My cat\'s belly is badly matted and she will not let anyone touch it. What happens then?',
    answer: 'Belly mats are the hardest ones, because the skin there is thin and loose and the cat is at her most defensive lying on her back. We do not force it. The groomer will work from the side with the cat standing or lying on her flank, use a clipper rather than a comb to take the mat off close to the skin, and go in short attempts with breaks rather than one long struggle. If she genuinely will not permit it, we will say so and recommend a vet who can do it under light sedation — that is a better outcome than a cut on a wriggling cat, and we would rather refer you than take the risk.',
  },
  {
    question: 'Do you cover the Katraj bypass side, Narhe and Katraj Kondhwa Road?',
    answer: 'Yes — Katraj gaon, the bypass societies, Katraj Kondhwa Road, Narhe, Ambegaon and the stretch towards Sinhagad Road are all on our route, along with Bibewadi and Kondhwa on the other side. The hillside addresses take a little longer to reach, so we build that into the arrival window rather than turning up late.',
  },
  {
    question: 'My kitten was vaccinated last week. How long should I wait before booking a grooming session?',
    answer: 'Give it about a week to ten days after a vaccination before a full bath. It is not that grooming is dangerous — it is that a cat can be a little off-colour or sore at the injection site for a couple of days, and a bath plus a dryer plus a stranger on top of that is more than a young cat needs in one week. If your kitten is on a course of shots, the gap between doses is usually the most comfortable window. Just tell us the dates at booking and we will place the slot sensibly.',
  },
  {
    question: 'Does the ghat-side humidity affect drying?',
    answer: 'It lengthens it noticeably. The Katraj ghat side holds moisture longer than the flatter parts of the city, and a longhair coat that feels dry to the hand can still be damp against the skin — which is exactly how fungal patches start. We dry to the skin rather than to the touch, and here that stage simply takes longer.'
  },
  {
    question: 'Does the hard water on this side of the city leave residue in the coat?',
    answer: 'It does, and it is the reason we rinse for longer here. Hard borewell water leaves mineral deposit that dulls the coat and leaves skin itchy even when the rinse felt thorough — a common complaint across the Katraj belt. A conditioning rinse at the end counters most of it.'
  },
  {
    question: 'We back onto open ground with strays around. What should we watch for?',
    answer: 'Fleas and ticks above all, which is why we inspect before we wash rather than after. Contact with free-ranging cats in this belt raises exposure considerably. The check covers between the toes, both ear canals, the jawline and the tail base, and if we find anything we show you where rather than treating it silently.'
  },
  {
    question: 'What is a sensible slot given the Sinhagad Road commute?',
    answer: 'Late morning through early afternoon is the most reliable window for a groomer to reach you on time. The inbound morning peak and the 6 to 8 PM return are where slot timings slip. We would rather give you an honest window than a precise time we cannot hold.'
  },
  {
    question: 'Should I feed my cat before or after the session?',
    answer: 'A light meal two to three hours before, and nothing immediately beforehand. A full stomach plus handling and being turned over makes some cats nauseous, and a very hungry cat is restless and harder to settle. Feed properly once the session is done and the coat is dry — most cats eat and then sleep it off.'
  }
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
    {
      heading: 'How Often Does a Cat Actually Need Grooming?',
      subheading: 'The honest answer depends on the coat, not the calendar.',
      paragraphs: [
        'This is the question we get asked most in Handewadi, usually by people who have just had a first session and want to know when to book the next one. There is no single right number, but there is a sensible way to work it out, and it comes down to coat type plus how much your cat can still do for itself.',
        'A short-coated indoor cat in good health genuinely manages on a session every eight to ten weeks — at that point it is claws, ears and a deshedding pass rather than urgent coat work. A semi-longhair such as a Ragdoll or Maine Coon needs six to eight weeks, because the areas that mat first are the ones the cat cannot reach. A Persian or heavily coated cat needs four to six, and daily brushing in between; anything longer and we are de-matting rather than grooming. Then adjust for the cat rather than the breed: an overweight cat that cannot twist to reach its back, a senior with stiff joints, or one recovering from illness all need shorter gaps regardless of coat length. Handewadi\'s larger homes and garden access also push the interval down a little, because outdoor time means more in the coat.',
        'If you are not sure where your cat falls, ask the groomer at the end of the session. They will have just had their hands on the whole animal and will give you a number rather than a sales pitch.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Grooming frequency guidance for cats in Handewadi Pune',
      imageLeft: true,
    },
    {
      heading: 'Cat Breeds We Groom Around Handewadi',
      subheading: 'Newer societies, larger homes, a fast-growing cat population.',
      paragraphs: [
        'Handewadi\'s cat population has grown alongside its building work — rescues from the Undri and Mohammadwadi side, and a steady arrival of pedigrees into the new societies. Here is the usual mix and how we approach each:',
      ],
      bullets: [
        'Domestic shorthair and Indie grooming in Handewadi — The largest group, often with some access to a compound or garden. Deshedding, claws and a thorough skin check are the core of the session.',
        'Persian cat grooming in Handewadi — Common in the newer buildings and frequently under-brushed at home, because the coat looks fine from above. We check the armpits, the ruff and behind the ears first — that is where the mats always are.',
        'Ragdoll grooming in Handewadi — Placid to the point that owners forget they need grooming at all. The trousers and the area behind the front legs knot quietly. A six-to-eight week rhythm keeps it easy.',
        'Bengal grooming in Handewadi — Athletic cats in homes with space to run, which means fast-growing claws and a coat that mainly needs a conditioning wash to stay glossy rather than dusty.',
        'Kittens and young rescues — With several active rescue networks in this belt, a good share of our Handewadi work is first sessions. We keep them short and positive; the aim is a cat that finds grooming boring by its third birthday.',
      ],
      closingLine: 'Whatever turned up at your gate and stayed — that counts, and it is welcome.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Ragdoll and Indie cat grooming at home in Handewadi Pune',
      imageLeft: false,
    },
    {
      heading: 'The Sanitary Trim, and Why Nobody Mentions It',
      subheading: 'Not glamorous. Genuinely important.',
      paragraphs: [
        'Every full session includes a sanitary trim, and it is the part of the service almost no owner asks about in advance and almost every owner is grateful for afterwards. It means neatening the fur immediately around the rear and, on longhaired cats, the fur on the back of the thighs.',
        'The reason it matters is simple and slightly unpleasant. On a longhaired cat, waste catches in the fur around the rear and dries there. The cat tries to clean it, cannot reach properly, and either ingests it or leaves it. Left long enough it forms a hard plug of matted fur that blocks the area entirely, which is a genuine medical emergency and one of the more distressing things we occasionally find. The same problem appears on overweight cats and on older cats who have stopped being able to twist round, regardless of coat length.',
        'A trim of a few centimetres, done every session, prevents all of it. We keep it modest and tidy rather than shaved, so it is not visible on a standing cat. If we find the area already clogged, we will clip it out carefully and tell you what we found, because it usually means the cat needs either a shorter grooming interval or a look from a vet.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Sanitary trim during a home cat grooming session in Handewadi Pune',
      imageLeft: true,
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
  {
    question: 'My cat brings up a hairball two or three times a month. Is that normal?',
    answer: 'Occasional hairballs are normal; two or three a month is on the high side and usually points at loose undercoat the cat is swallowing during self-grooming. Regular deshedding removes that fur before it ends up inside the cat, and most owners see the frequency drop noticeably once they settle into a routine. What is not normal is repeated retching with nothing coming up, or a cat that goes off food alongside it — that needs a vet the same week, because a hairball that is not coming up in either direction is a serious problem.',
  },
  {
    question: 'Do you charge more for a longhaired cat than a shorthaired one?',
    answer: 'The package price is the same — sessions start at ₹799 regardless of coat length. Where the cost can change is if your cat needs a haircut rather than just a bath, which moves it up the package list, or if there is significant de-matting to work through. In that case the groomer will tell you what is involved and what it will cost before starting, not after. A longhaired cat on a regular schedule almost never runs into that; a longhaired cat left for eight months usually does.',
  },
  {
    question: 'My cat sprays indoors. Will grooming help with the smell?',
    answer: 'Only a little, and we would rather be straight with you about it. Bathing removes odour from the coat itself, so a cat that has sprayed and then walked through it will smell better afterwards. But spraying is territorial behaviour, not a hygiene problem, and it will continue regardless of how clean the cat is. The things that actually change it are neutering, reducing stress or competition between cats in the house, and enzymatic cleaning of the marked spots so the cat stops being drawn back to them. Your vet is the right person for that conversation.',
  },
  {
    question: 'Do you cover Undri, Mohammed Wadi and the Saswad Road side?',
    answer: 'Yes, along with the Handewadi Road belt and the Kondhwa side. The area has grown quickly and several societies share builder names across phases, so mention your phase or tower at booking and send a pin — it saves the groomer a call from your gate.'
  },
  {
    question: 'Highway dust is constant here. Does that reach an indoor cat?',
    answer: 'Yes. Road dust off the Pune–Solapur stretch drifts indoors and settles on the surfaces the cat sleeps on, and from there it goes into the coat and gets swallowed during self-grooming. It is a fair reason to keep to the shorter end of your cat\'s interval rather than stretching it.'
  },
  {
    question: 'Our new society still has irregular water. Is that enough for a cat session?',
    answer: 'Easily — two filled buckets cover the wash and rinse for a full session. If your supply is timed, either book inside that window or keep buckets ready and tell the groomer on arrival so they work from stored water deliberately rather than mid-lather.'
  },
  {
    question: 'Are weekend slots available?',
    answer: 'Yes, Saturday and Sunday at the same 9 AM to 9 PM hours. Weekends are the busiest window in this belt because most households here work a standard week, so book four or five days ahead rather than trying on the Friday.'
  },
  {
    question: 'My cat hides the moment the doorbell rings. How does the session start?',
    answer: 'We do not pull a cat out of a hiding place. The groomer sits in the closed room and does nothing for the first few minutes, letting the cat emerge on its own once nothing alarming has happened — which most do. The practical help from your side is shutting off the favourite hiding spot shortly before the slot so the cat settles somewhere reachable.'
  }
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
    {
      heading: 'What "Cat-Safe Products" Actually Means',
      subheading: 'It is a real distinction, not a marketing line.',
      paragraphs: [
        'Every grooming service in Pune will tell you it uses cat-safe products. Very few will tell you what makes something unsafe, so here is the substance behind the phrase.',
        'Cats metabolise differently from dogs and from us. They lack much of the liver enzyme activity that breaks down certain plant compounds, so substances that a dog processes without difficulty accumulate in a cat. Tea tree oil is the well-known example and is genuinely dangerous to cats even in small amounts, but the same caution applies to most essential oils used as fragrance — eucalyptus, citrus, pine, lavender. Permethrin, an insecticide found in many dog flea products, is severely toxic to cats and is one of the more common causes of accidental poisoning we hear about; a dog spot-on applied to a cat is a veterinary emergency.',
        'Then there is pH, which is less dramatic but matters every session. Cat skin sits at a different pH from dog skin and is markedly thinner. A dog shampoo will strip a cat\'s skin oils, and the cat then over-grooms the dryness, which is how a bath produces a scratching cat a week later.',
        'The last point is the one people forget: a cat licks its entire coat clean within hours of a bath. Whatever residue is left on the fur is going to be eaten. That is why the rinse matters as much as the shampoo, and why we will not use anything on a cat that we would not be comfortable with it swallowing. If you want to know exactly what is going on your cat in Hadapsar, ask the groomer to show you the bottle. Any groomer who hesitates at that question has told you something useful.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Cat-safe shampoo and products used during home grooming in Hadapsar Pune',
      imageLeft: false,
    },
    {
      heading: 'Teeth, and the Things Grooming Does Not Cover',
      subheading: 'A short list of what to take somewhere else.',
      paragraphs: [
        'Dental disease is the most common health problem in adult cats and one of the most under-treated, and it comes up in Hadapsar conversations often enough to be worth addressing directly: no, we do not clean teeth, and you should be wary of any groomer who offers to.',
        'Scaling a cat\'s teeth properly requires general anaesthesia, because the disease that matters is below the gum line where no conscious cat will permit anyone to work. So-called anaesthesia-free dental cleaning scrapes visible tartar off the crown, which makes the tooth look better and does nothing whatsoever about the periodontal disease underneath — it can actively delay the vet visit that would have caught it. It is a cosmetic procedure sold as a medical one.',
        'What we will do is look and tell you. A groomer has a cat\'s head in their hands for an hour and will notice a strong smell from the mouth, visible tartar, a red gum line, or a cat that flinches when the jaw area is touched. Any of those means a vet.',
        'The same boundary applies elsewhere. We do not express anal glands — that is a veterinary procedure and doing it badly causes real damage. We do not administer medication or sedatives of any kind. We do not diagnose skin conditions or supply treatment for them. And we will not attempt a groom on a cat that seems genuinely unwell rather than merely unwilling. Being clear about the edges of the job is part of doing it properly.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Dental and health check limits during a cat grooming session in Hadapsar Pune',
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
  {
    question: 'Do you cover Magarpatta, Amanora, Keshavnagar and the Manjri side?',
    answer: 'Yes — Hadapsar is one of our larger coverage areas and it includes Magarpatta City, Amanora, Keshavnagar, Manjri, Phursungi, Mundhwa and the Solapur Road stretch. The gated townships need the groomer registered at the gate, so tell us at booking and we will send their name and number in advance for you to pass to security. It saves the slot being eaten by a wait at the entrance.',
  },
  {
    question: 'Can you brush my cat\'s teeth as part of the session?',
    answer: 'No, and we would gently steer you away from anyone who says yes. Meaningful dental work on a cat happens below the gum line and requires anaesthesia — scraping visible tartar off a conscious cat improves the look of the tooth and does nothing about the disease underneath, which is the part that matters. What we will do is notice: a strong smell from the mouth, a red gum line, visible tartar, or flinching when the jaw is handled. If we see any of that we will tell you, and it is worth a vet appointment rather than a grooming add-on.',
  },
  {
    question: 'My cat licks herself thoroughly right after a bath. Is the shampoo safe if she swallows some?',
    answer: 'It has to be, and that is exactly why product choice matters more for cats than for dogs. Everything left on the coat gets ingested within a few hours, so we use cat-formulated, pH-balanced shampoo with no essential oils, and we rinse for considerably longer than the coat looks like it needs — under-rinsing is the actual risk, not the shampoo itself. We never use dog products on cats; several ingredients that are routine for dogs, permethrin in particular, are seriously toxic to cats. If you want to see what is being used, ask the groomer to show you the bottle.',
  },
  {
    question: 'Magarpatta and Amanora need a gate pass. How do we arrange it?',
    answer: 'Tell us at booking and we will send the groomer\'s name and number ahead of the slot so you can raise the entry on the township app or with the gate. Both are strict about pre-approval, and without it the groomer waits at the barrier — which comes out of your session time rather than ours.'
  },
  {
    question: 'Is an evening session harder on a cat than a daytime one?',
    answer: 'Slightly, and the last workable start is around 7 PM so the coat is fully dry before the groomer leaves. Cats are naturally more active and more reactive around dusk, so a mid-morning slot is genuinely calmer if your schedule allows it. If evening is the only option, book several days ahead — those slots go early across Hadapsar and Magarpatta.'
  },
  {
    question: 'We have a dog as well. Where should the dog be?',
    answer: 'In a different room with the door shut for the whole session. Even a dog your cat lives with happily changes how the cat behaves under handling, and a dog wandering in mid-bath undoes twenty minutes of settling. If both need grooming, we do the cat first, while the house is quiet and before there is dog fur and dryer noise around.'
  },
  {
    question: 'Can you groom a cat that has just had a litter?',
    answer: 'A light session, yes, once the kittens are a few weeks old — nails, a gentle comb-out, and any soiling around the hind end cleaned. A full bath while she is nursing is something we would avoid: it strips coat scent the kittens navigate by and adds stress at the point she has least to spare. Tell us at booking and we will keep it minimal.'
  },
  {
    question: 'Do the township towers here cause any delay getting in?',
    answer: 'Only when entry has not been pre-approved. The groomer uses whichever lift your building requires and carries everything in one bag, so that part is trivial — the delay comes from standing at a gate. Flag it at booking if your service entrance sits on a different side of the complex from the main gate.'
  }
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
    {
      heading: 'Old Wadis and New Towers, One Street Apart',
      subheading: 'Bibewadi asks a groomer to adapt more than most areas.',
      paragraphs: [
        'Few parts of Pune change character as quickly street to street as Bibewadi. You can be in a fifty-year-old low-rise with a shared corridor and a small bathroom, and two hundred metres later in a fourteen-floor tower with a lift lobby and a visitor app. We groom in both in the same afternoon, and the job is not identical.',
        'In the older buildings the constraint is space and water. Bathrooms are small, the supply can be intermittent, and there is often no geyser — so the groomer arrives ready to work with buckets of warm water and to do the drying and combing in the next room rather than the bathroom itself. In the newer towers the constraints are logistical instead: gate registration, service lifts, and societies that have opinions about what may be carried through the main lobby. Neither is a problem when we know in advance. What does cause trouble is turning up to a fourth-floor walk-up expecting a lift, or to a gated tower with nobody registered at security. A line about your building at booking time saves everyone twenty minutes.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Cat grooming setup adapted for older and newer buildings in Bibewadi Pune',
      imageLeft: true,
    },
    {
      heading: 'Cat Breeds We Groom Around Bibewadi',
      subheading: 'A settled community with a long-standing cat population.',
      paragraphs: [
        'Bibewadi has cats that have been in the same families for years, plus a steady stream of new arrivals in the towers along the Sinhagad Road side. The spread we see most:',
      ],
      bullets: [
        'Indie and domestic shorthair grooming in Bibewadi — By a distance the most common, and often long-lived family cats. Claws and ears matter more than coat work, particularly once the cat is past ten and has stopped keeping its own nails down.',
        'Persian cat grooming in Bibewadi — Popular in both the old buildings and the new. The eye folds need as much attention as the coat here; we clean around them with a damp cloth every session rather than treating it as an extra.',
        'Tuxedo and tabby cats — Short dense coats where a proper deshedding pass makes a visible difference to how sharp the markings look. Owners always notice this one.',
        'British Shorthair grooming in Bibewadi — Increasingly common in the newer towers. Enormously thick undercoat that home brushing barely touches; the comb-through after drying is where the real fur comes out.',
        'Senior cats over twelve — Bibewadi has plenty. Shorter blocks, more rests, warmer water, and we prioritise comfort over a flawless finish every time.',
      ],
      closingLine: 'Old building or new, pedigree or the cat that adopted your grandmother — the session adapts to the animal in front of us.',
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Persian and Indie cat grooming at home in Bibewadi Pune',
      imageLeft: false,
    },
    {
      heading: 'Ears, Eyes and Paw Pads — The Checks a Bath Skips',
      subheading: 'The three places problems start, and the three places nobody looks.',
      paragraphs: [
        'Most people picture grooming as washing and brushing. The parts that most often turn out to matter are none of those.',
        'Ears first. A cat\'s ear canal bends, so you cannot see into it and neither can your cat clean it. Wax builds quietly, and dark crumbly wax in one ear rather than both is the classic sign of mites. We clean gently with a cat-specific solution and, crucially, we look before we clean — an ear that is already red and sore should go to a vet, not get flushed.',
        'Eyes next. Flat-faced breeds have shortened tear ducts, so tears run onto the face instead of draining, and the constant damp under the eye breeds the reddish-brown staining you see on so many Persians. It is not dirt and scrubbing will not shift it; it needs wiping daily and keeping the fur short there.',
        'And paw pads, which almost nobody checks. Fur growing long between the pads makes a cat skid on tiled floors — a real fall risk for a stiff older cat. Claws left untrimmed curve round into the pad itself, which is painful and easy to miss under the fur. We trim the tuft between the pads flush and check each claw individually. It takes three minutes and it is the change owners most often tell us they noticed at home.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Ear, eye and paw pad checks during cat grooming in Bibewadi Pune',
      imageLeft: true,
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
  {
    question: 'My Persian\'s eyes water constantly and the fur underneath has gone reddish-brown. Can you fix that?',
    answer: 'We can improve it, but it will come back, and it is worth understanding why. Flat-faced breeds have compressed tear ducts, so tears spill onto the face rather than draining away. The reddish-brown colour is pigment from the tears themselves oxidising in permanently damp fur — it is not dirt, and scrubbing harder does nothing. What helps is keeping the fur in the eye folds trimmed short so it dries between tears, and a gentle wipe every day at home. We will clean and trim the area at each session and show you the wiping technique. If one eye is worse than the other, or the discharge is thick rather than clear, that is a vet visit rather than a grooming issue.',
  },
  {
    question: 'Do you cover Sahakarnagar, the Sinhagad Road side and towards Katraj from Bibewadi?',
    answer: 'Yes. Bibewadi gaon, the societies along Sinhagad Road, Sahakarnagar, Parvati, Katraj and Kondhwa are all within our regular route. It is a dense, well-connected pocket, which usually means we can offer same-week slots here even when the outer suburbs are booked out.',
  },
  {
    question: 'My old cat has stopped cleaning himself properly and has started to smell. Can grooming help?',
    answer: 'Yes, and this is one of the cases where regular grooming makes the most difference to daily life. A cat that has stopped self-grooming is usually telling you something — arthritis that makes twisting painful, weight that puts his own back out of reach, dental pain that makes licking unpleasant, or simply age. The coat goes greasy and clumped, and the smell follows. A proper wash, a deshedding pass and a sanitary trim resets it, and a six-week rhythm keeps it managed. But do also mention it to your vet: a sudden stop in self-grooming is a recognised early sign of pain or illness, and it is worth ruling that out rather than treating it as ordinary ageing.',
  },
  {
    question: 'Which areas around Bibewadi do you reach for cat grooming?',
    answer: 'Sahakarnagar, the Parvati side, Sinhagad Road, and across to the Katraj and Kondhwa ends. It is a dense central-south belt and quick for us to reach, so we hold tighter arrival windows here — which matters more for cats than for dogs, since a cat that has been alert by the door for an hour is already harder to settle.'
  },
  {
    question: 'Our building is old with narrow stairs and no lift. Does that work?',
    answer: 'Entirely — the groomer carries one shoulder bag and your cat never leaves the flat. That is the core advantage over a salon: no carrier, no stairs for the cat, no car journey. Older central-south buildings are a routine address for us.'
  },
  {
    question: 'Our cat is diabetic and on insulin. Can she still be groomed?',
    answer: 'Usually yes, with a shorter session and careful timing. Tell us at booking, and schedule the slot so it does not clash with her injection and feeding routine — a missed or delayed meal matters more for a diabetic cat than the grooming does. We keep sessions brief, watch for any sign of distress, and stop early rather than finish a checklist.'
  },
  {
    question: 'Can I book just a nail trim for our senior cat?',
    answer: 'Yes, and for an older cat it is often the sensible choice over a full session. Elderly cats stop wearing their claws down and the outer claws can curl into the pad, which is painful and completely preventable. A short maintenance visit for nails and an ear clean is available below full session price.'
  },
  {
    question: 'Is it a problem if children are around during the session?',
    answer: 'It is the one thing worth managing beforehand. A cat under handling is already spending all its patience, and children coming in and out of the room is the usual reason a settling cat stops settling. We work in one closed room — please keep it closed, especially through the drying stage.'
  }
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
    {
      heading: 'Damp Old Walls, Monsoon Paws and Fungal Skin',
      subheading: 'Camp\'s buildings hold moisture longer than anywhere else in the city.',
      paragraphs: [
        'The buildings that give Camp its character — thick masonry, high ceilings, deep verandahs, decades of paint — also hold damp in a way modern construction does not. Through July and August the walls of an old Camp flat stay cool and slightly humid for weeks, and the floors near a courtyard or a shaded side never quite dry out.',
        'That environment favours one specific problem: fungal skin infection. Ringworm, despite the name, is a fungus rather than a worm, and it thrives in exactly these conditions. On a cat it usually appears as a small circular patch of thinning fur with slightly scaly skin, often on the face, the ears or a front leg, and it is the most common infectious skin condition in cats anywhere. It is also transmissible to people, which is the part worth knowing in a household with children or older relatives.',
        'Our groomers in Camp look for it as a matter of course during the dry inspection, before any water goes near the coat. If we see something suspicious we stop, do not bathe over it, tell you exactly where it is, and recommend a vet — because a bath spreads fungal spores around the coat and around the flat, and a groomer working on an infected cat can carry it to the next house. Where a cat has a confirmed history, we bring an antifungal formula and use dedicated equipment. Alongside that, monsoon paw care matters here more than in the newer suburbs: fur between the toes stays wet on damp stone floors, and that is a second place fungal trouble starts. We trim it flush at every session through the rainy months.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Monsoon paw care and fungal skin check for cats in Camp Pune',
      imageLeft: false,
    },
    {
      heading: 'Households With a Cat, a Dog, and Usually Something Else',
      subheading: 'Camp homes tend to be full. We plan around that.',
      paragraphs: [
        'A lot of the households we visit in Camp are multi-generational, long-established, and populated by more than one species. A cat, an old dog, a pair of budgies in the verandah, sometimes a rabbit. It makes for lovely homes and slightly more complicated grooming visits.',
        'The main thing is separation, and it is worth doing before we arrive rather than during. The dog goes in another room with the door shut for the whole session — not because anything will go wrong, but because a cat already managing a stranger and a dryer does not need an interested dog as well, and most dogs find the grooming bag fascinating. Birds should be in a different room too, with the door closed: they are far more sensitive to airborne particles and disturbance than people expect, and a dryer running for half an hour in the same room is genuinely stressful for them.',
        'The other consideration in a multi-pet home is cross-contamination, which is a real risk rather than a theoretical one. Ringworm and ear mites move between animals easily, and a groomer\'s combs are an efficient way to help them. We clean and disinfect equipment between every animal, use fresh towels each time, and if one animal in the house has a known skin issue we do that one last. If you are booking the cat and the dog together, the cat goes first — cats cope with waiting far worse.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat grooming in a multi-pet household in Camp Pune',
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
  {
    question: 'Can you tell if my cat has ringworm?',
    answer: 'We can spot the signs, though only a vet can confirm it. What we look for during the dry inspection is a small circular patch of thinning fur with slightly flaky skin underneath, most often on the face, ears or a front leg. If we find something like that we will stop rather than bathe over it — washing spreads fungal spores through the coat and around the room — and tell you exactly where it is so your vet can test. It is worth taking seriously in a shared household, since ringworm passes to people, and it is more common in Camp\'s older damp buildings than in the newer suburbs.',
  },
  {
    question: 'We keep birds in the verandah. Does that affect the session?',
    answer: 'Only in where we work. Please move the birds to a different room with the door closed, or let us set up well away from them. Birds have far more sensitive respiratory systems than cats or people and are genuinely stressed by a dryer running nearby for half an hour. It is also simpler for the cat, who does not need the extra stimulation. We will not use any aerosol or fragrance product in the house, so there is nothing else to worry about on that front.',
  },
  {
    question: 'We live above our shop on East Street. Can you groom there?',
    answer: 'Yes — residential space above commercial premises is common through Camp and it is not a problem, provided there is a bathroom or a water point and somewhere to lay a mat. Two things help: tell us the access route, since the entrance is often a side stair rather than the shopfront, and pick a slot when the shop below is quiet if you can. Cats manage the noise of a busy street better than most people expect, but a quieter hour makes for a calmer session.',
  },
  {
    question: 'Does the cantonment board require anything for a service visitor?',
    answer: 'Only your gate\'s normal process. The groomer carries photo identification and we can send their name and number ahead of the slot so entry can be logged in advance. Cantonment properties are stricter about pre-notification than civilian societies, so it is worth arranging beforehand rather than at the barrier.'
  },
  {
    question: 'Do we need to carry our cat anywhere for the session?',
    answer: 'No, and that is the whole point of it. The groomer arrives by two-wheeler with the kit in one shoulder bag, so the tight lanes and absent parking around East Street change nothing — and your cat never sees a carrier or a car. For most cats the journey was always the worst part of grooming rather than the grooming itself.'
  },
  {
    question: 'We live in an old bungalow. Is the plumbing or wiring likely to be an issue?',
    answer: 'Rarely. The groomer needs a tap for perhaps fifteen minutes and one working plug point for the dryer. Old bungalows sometimes have both a long way from where the cat is comfortable — if the nearest usable socket is in another room, mention it and the groomer will bring the working area to the plug rather than move the cat around the house.'
  },
  {
    question: 'Our cat has the run of a large old house. Which room should we use?',
    answer: 'The smallest quiet room that can be shut, with a tap nearby. A big house sounds like an advantage but it is the opposite for a cat session — more space means more places to bolt to and a much longer settling period. A contained room is calmer for the cat and safer for everyone in it.'
  },
  {
    question: 'Should we shut the birds away during the session?',
    answer: 'Yes, and ideally in a different room entirely. A cat that can see or hear caged birds will not settle under handling, and the stress runs both ways — the birds react to a distressed cat as much as the cat reacts to them. It costs you two minutes beforehand and makes a visible difference to how the session goes.'
  }
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
    {
      heading: 'Cat Breeds We Groom in Wanowrie',
      subheading: 'A quiet, well-established pocket with well-looked-after cats.',
      paragraphs: [
        'Wanowrie and the Salunke Vihar side have a settled, unhurried residential character, and the cats reflect it — many have been in the same household for years, and most arrive at a session already in reasonable condition. That changes the work from rescue to maintenance, which is the nicer half of the job. The coats we handle most often here:',
      ],
      bullets: [
        'Persian cat grooming in Wanowrie — Well represented, and usually brushed at home to some degree. We concentrate on the places owners cannot easily reach: the ruff under the chin, the armpits and the trousers, plus a careful clean around the eye folds every visit.',
        'Indie and domestic shorthair grooming in Wanowrie — Frequently long-term family cats now past ten. Claws take priority, since an older cat stops wearing them down and they begin curving towards the pads, and the session is paced for comfort rather than speed.',
        'Ragdoll grooming in Wanowrie — Docile enough that owners assume no grooming is needed, which is how the mats behind the front legs go unnoticed. We check there first and keep the interval at six to eight weeks.',
        'British Shorthair grooming in Wanowrie — That famously plush coat holds an enormous amount of dead undercoat. The comb-through after drying is where the real volume comes out, and it is the step most home routines skip entirely.',
        'Himalayan and Persian-cross grooming in Wanowrie — Long coat plus a flat face. We keep the dryer angled away from the nose entirely and clean the eye area with a damp cloth rather than water and shampoo.',
        'Bengal grooming in Wanowrie — A short, low-maintenance coat on a cat with a great deal of energy. Efficient handling and staying on top of fast-growing claws is most of what these need.',
      ],
      closingLine: 'Whatever the coat and whatever the age, we would rather maintain it on a schedule than rescue it once a year.',
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Persian and British Shorthair cat grooming at home in Wanowrie Pune',
      imageLeft: false,
    },
    {
      heading: 'Grooming a Cat With a Diagnosed Condition',
      subheading: 'Kidney disease, thyroid trouble, arthritis — the session changes.',
      paragraphs: [
        'Wanowrie has a lot of cats in the second half of their lives, which means a lot of cats managing something. Chronic kidney disease and hyperthyroidism are the two most common diagnoses in older cats, and both show up in the coat long before anyone books a grooming session about them — a dull, greasy or unkempt coat in a cat who used to be fastidious is one of the earliest visible signs of both.',
        'These cats need grooming more than a healthy cat does, because they have largely stopped doing it themselves. But the session has to be built differently. A kidney-compromised cat loses heat quickly and dehydrates easily, so we keep the water warm, work faster, and dry thoroughly rather than letting a damp cat sit. A hyperthyroid cat is often restless and thin with fragile skin, so handling is lighter and shorter. An arthritic cat is groomed lying on its side, in short blocks, with the positions that require twisting simply avoided.',
        'The practical part is on you: tell us the diagnosis and any medication when you book. Not because we treat any of it — we do not — but because it tells the groomer what to plan for and what to leave alone, and because it changes what counts as a good session. For a fourteen-year-old with CKD, forty comfortable minutes covering claws, sanitary area and a gentle wash is a complete success. Pushing on for a flawless finish is not.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Gentle grooming for a senior cat with a medical condition in Wanowrie Pune',
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
  {
    question: 'Do you cover Salunke Vihar, Undri and the Mohammadwadi side?',
    answer: 'Yes — Wanowrie, Salunke Vihar, Undri, Mohammadwadi, NIBM Road, Kondhwa and the Hadapsar border are all on the same south-east route. Most of the societies here need the groomer registered at the gate, so let us know at booking and we will send their name and number in advance. It is a well-covered corridor for us, so mid-week slots are often available at a day or two\'s notice.',
  },
  {
    question: 'My cat has been diagnosed with kidney disease. Is bathing still safe for her?',
    answer: 'Generally yes, and she probably needs it more than she used to, since cats with CKD tend to stop grooming themselves properly. What changes is how we do it. A kidney-compromised cat loses body heat faster and tires sooner, so we keep the water warm, work in shorter blocks, dry thoroughly rather than leaving her damp, and finish earlier than we would with a healthy cat. Tell us the diagnosis and any medication when you book so the groomer plans for it. If she is in a flare or your vet has advised against handling for now, wait.',
  },
  {
    question: 'My longhaired cat mats again within a month of every session. Is that normal?',
    answer: 'It is common, and it usually means one of two things. Either the interval is genuinely too long for that coat — some Persians and Maine Coons need four weeks rather than six or eight in Pune\'s humidity — or the coat is not being combed at home between visits, in which case no professional interval will keep up. Worth checking where the mats keep forming: if it is always the same spot, that is often a place the cat cannot reach and you are not combing. Ask your groomer to point out the three or four trouble areas on your particular cat and concentrate your five minutes a day there.',
  },
  {
    question: 'Is entry to the cantonment-side addresses here straightforward?',
    answer: 'Yes, with a little notice. The groomer carries photo identification and we can send their name and number ahead so your gate can log the entry before the slot. These addresses are stricter about pre-notification than the civilian societies, and a groomer held at a barrier is time lost from the cat’s session.'
  },
  {
    question: 'Do you need power for the whole cat session?',
    answer: 'Only for the drying stage — everything else is hand work. If your building has an inverter, tell the groomer which sockets are backed up. A cut pauses the session rather than ending it, and we will not leave a cat damp: we towel-dry down thoroughly, keep the room warm and wait rather than finish early.'
  },
  {
    question: 'Is it harder to get a slot around Diwali?',
    answer: 'Considerably, and there is a second reason to book early. Slots across Wanowrie and NIBM go about a week ahead in festival weeks — but more importantly, fireworks and a stranger with a dryer on the same evening is a great deal to ask of a cat. Book before the festival rather than during it.'
  },
  {
    question: 'Can you groom two cats that do not get along in the same visit?',
    answer: 'Yes, and separately is the standard arrangement rather than the exception. Each cat is groomed alone in a closed room while the other stays elsewhere in the house. Cats read each other\'s stress sharply, and two that already have friction will make each other\'s sessions worse if they can see or hear one another.'
  },
  {
    question: 'Should I feed my cat before the groomer arrives?',
    answer: 'A light meal two or three hours ahead, and nothing immediately before. A full stomach combined with handling and being turned over makes some cats nauseous, while a very hungry cat is restless and slow to settle. Feed properly once the session is finished and the coat is dry.'
  }
];


// ════════════════════════════════════════════════════════════
// HINJEWADI
// ════════════════════════════════════════════════════════════

export const hinjewadiCatLocation: LocationConfig = {
  name: 'Hinjewadi',
  slug: 'cat-grooming-in-pune/hinjewadi',

  heroH1: `Cat Grooming at Home in Hinjewadi — No Carrier, No Car, No Panic`,
  heroSubtext:
    'Phase 1, 2, 3, Maan or Marunji. A trained groomer comes to your flat, works in one quiet room, and lets your cat set the pace. Evening and weekend slots from ₹799.',

  storySections: [
    {
      heading: 'Why Cats in Hinjewadi Should Never Be Driven to a Salon',
      subheading: 'The carrier is worse than the grooming.',
      paragraphs: [
        'For a cat, the worst part of a salon visit is almost never the bath — it is the carrier, the stairs, the car and the unfamiliar room full of dogs at the other end. By the time a cat reaches a grooming table in Hinjewadi it has already spent forty minutes in a state most owners would not choose for it. At-home cat grooming removes every one of those steps.',
        'The practical effect is that the session becomes possible at all. Cats that are described as "impossible to groom" are very often cats that were only ever tried after a car journey. Take the journey away and the same cat is frequently manageable in its own home, in a room it already knows.',
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Cat grooming at home in Hinjewadi Pune',
      imageLeft: true,
    },
    {
      heading: 'What a Session Actually Looks Like',
      subheading: 'One quiet room, door shut, and the cat decides when we start.',
      paragraphs: [
        'The groomer arrives, sits down and does nothing for a few minutes. The cat inspects the kit, decides it is not a threat, and only then do we begin. We work in a single quiet room with the door closed — a bathroom or a bedroom is ideal — and use low restraint rather than scruffing. If the cat says stop, we stop.',
        'Products are cat-formulated throughout. This is not a detail: dog shampoo is genuinely unsafe on cats, and permethrin-based tick products can be fatal to them. Nails, ears, a comb-out and a coat check are part of every visit. In a Hinjewadi tower, closing one door is usually all the containment a session needs.',
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Low-restraint cat grooming session in a Hinjewadi flat',
      imageLeft: false,
    },
    {
      heading: 'Long Days Alone, and What That Does to a Coat',
      subheading: 'Indoor IT-hours cats mat more than people expect.',
      paragraphs: [
        'Most Hinjewadi cats live entirely indoors in air-conditioned flats while their people are at work nine or ten hours a day. Two things follow. Longhairs get less combing than the coat needs, and matting builds quietly along the back legs, under the collar area and behind the front legs. And because the cat sees few strangers, an unfamiliar groomer is a bigger event than it would be elsewhere.',
        'We plan the session around both. The first ten minutes are deliberately unproductive, and where a coat has already packed down we will tell you honestly whether it is a de-matting job or a clip-down before starting rather than halfway through.',
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Matted longhair cat coat care at home in Hinjewadi',
      imageLeft: true,
    },
    {
      heading: 'Fixed Prices, Same as Dogs',
      subheading: 'No cat surcharge, no phase-based charge.',
      paragraphs: [
        `A Spa Bath is ₹799, a Hair Cut is ₹999, and both together are ₹1299 — identical to our dog pricing, and identical across Phase 1, Phase 2, Phase 3, Maan, Marunji, Tathawade and Punawale. We only split the wording between cats and dogs where the handling genuinely differs, not the price.`,
        `The Hygiene Hair Cut add-on is ₹299 and covers a face and sanitary trim without a full body cut, which is often all a healthy shorthair needs. A lion cut sits inside the ₹999 Hair Cut, not above it.`,
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Fixed-price cat grooming packages in Hinjewadi',
      imageLeft: false,
    },
    {
      heading: `Which Cat Breeds Do We Groom in Hinjewadi?`,
      subheading: `Mostly Persians and indoor shorthairs, and they need opposite things.`,
      paragraphs: [
        `Hinjewadi's cat population skews towards Persians, Himalayans and Indian shorthairs, with a growing number of Maine Coons and Siamese in the newer towers. The mistake we most often correct here is treating all of them the same: a Persian needs regular intervention, and a healthy Indian shorthair usually needs remarkably little.`,
        `These are the cats we are called out to most in Hinjewadi:`,
      ],
      bullets: [
        `Persian and Himalayan cat grooming in Hinjewadi — the coats this humidity punishes hardest. De-matting, sanitary trims, nail clipping, and a lion cut where the coat has packed down against the skin. Brushing out a tight mat pulls at the skin for an hour; clipping is simply the kinder route and we will say which one you are in.`,
        `Maine Coon grooming in Hinjewadi — large, dense, slow to dry. Sessions run longer and the blow-dry stage is where most of the time goes, because a Maine Coon left damp at the skin in this climate is asking for trouble.`,
        `Indian shorthair cat grooming in Hinjewadi — usually the least intervention on this list. Nails, ears, a comb-out and a coat check are often the entire job, and we will say so rather than sell you a bath a healthy shorthair does not need.`,
        `Siamese and Bengal grooming in Hinjewadi — short coats, high energy, low patience. Short focused sessions work far better than one long one, and we would rather split the job than fight through it.`,
        `Senior cat grooming in Hinjewadi — elderly cats overheat and tire fast, so sessions stay short and the room stays warm. Overgrown nails matter more than a perfect coat at that age; in cats they curl into the pad.`,
        `Kitten grooming in Hinjewadi — from around four months, and deliberately unambitious. Nails, a comb, and the kit left out to be investigated. Very young kittens hold their own warmth badly, which makes bathing one a medical question rather than a grooming preference.`,
      ],
      closingLine: `Tell us the breed and the coat condition when you book and the groomer arrives with the session already planned.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Persian, Maine Coon and shorthair cat grooming at home in Hinjewadi`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/hinjewadi'),
  nearbyAreas: ['Phase 1', 'Phase 2', 'Phase 3', 'Maan', 'Marunji', 'Wakad', 'Tathawade', 'Punawale', 'Balewadi'],
};

export const hinjewadiCatMapEmbed = 'https://www.google.com/maps?q=Hinjewadi,Pune&output=embed';

export const hinjewadiCatReviews: LocationReview[] = [
  {
    petName: 'Mishka',
    ownerName: 'Aditi Deshpande',
    area: 'Phase 3, Life Republic',
    review: `Mishka is a Persian and I had given up — two salon attempts, two disasters, and a cat that hid for a day afterwards. Having someone come to us changed everything. He sat on the floor and ignored her until she came to him. The mats behind her legs were too tight to brush out and he told me that upfront instead of charging me for an hour of pulling.`,
    rating: 5,
  },
  {
    petName: 'Loki',
    ownerName: 'Varun Menon',
    area: 'Maan',
    review: 'Booked a 7 PM slot on a weekday because I am never home before then. Loki is an Indian shorthair and I was half expecting to be sold a full package. Instead I was told he only needed nails, ears and a comb-out and that was that. Honest advice is rarer than good grooming.',
    rating: 5,
  },
];

export const hinjewadiFAQsCat: FAQ[] = [
  {
    question: 'Do you cover all three Hinjewadi phases, plus Maan and Marunji?',
    answer: 'Yes — Phase 1, 2 and 3, Maan, Marunji, Tathawade and Punawale, at the same published prices. There is no distance charge inside Hinjewadi.'
  },
  {
    question: 'My cat has never been groomed and hates strangers. Is this realistic?',
    answer: 'Often yes, and more often than at a salon. A large share of cats described as impossible were only ever tried after a car journey in a carrier. Remove that and the same cat is frequently manageable at home. The groomer starts by doing nothing — sitting down and letting the cat inspect the kit — and works at the cat\'s pace from there.'
  },
  {
    question: 'Do you sedate cats?',
    answer: 'No, never. We use low restraint rather than scruffing, work in one quiet room with the door shut, and take breaks. If a cat genuinely cannot cope with a session we stop and tell you, rather than pushing through it. Sedation is a veterinary decision, not a grooming one.'
  },
  {
    question: 'Is a lion cut bad for my Persian?',
    answer: 'It is a legitimate option, not a fashion statement. When a Persian or Himalayan coat has matted close to the skin, brushing it out pulls at the skin for an hour and clipping down is simply the kinder route. Coats grow back. We will tell you plainly which situation you are in rather than charging for a de-matting session that ends in a clip anyway.'
  },
  {
    question: 'Can the groomer come after office hours?',
    answer: 'Yes — 9 AM to 9 PM, seven days a week. Weekday evenings from about 7 PM and weekend mornings are the busiest windows in Hinjewadi, so book a few days ahead for those.'
  },
  {
    question: 'What room do you need, and will the cat escape?',
    answer: 'One quiet room with a door that shuts — a bathroom or bedroom is ideal. Closing that single door is usually all the containment a session needs in a tower flat. Tell us at booking if your cat is a bolter and the groomer will check the room before anything comes out of the bag.'
  },
  {
    question: 'Are the products safe for cats?',
    answer: 'Everything used is cat-formulated. This matters more than people realise: dog shampoo is genuinely unsafe on cats, and permethrin-based tick products can be fatal to them. We never use dog products on a cat regardless of what is convenient.'
  },
  {
    question: 'How often does an indoor cat need grooming?',
    answer: 'Longhairs like Persians and Maine Coons need regular intervention — every 4 to 6 weeks is typical, because indoor flat life usually means less combing than the coat needs. Healthy Indian shorthairs often need very little beyond nails, ears and a comb-out, and we will tell you if you are booking more than the cat requires.'
  },
  {
    question: 'Do you groom kittens?',
    answer: 'From around four months. The first session is deliberately unambitious — nails, a comb, and the kit left out for the kitten to investigate on its own terms. Very young kittens hold their own warmth badly, which makes washing one a medical question rather than a grooming preference.'
  },
  {
    question: 'How do I pay?',
    answer: 'After the session, by cash or UPI, at the price quoted when you booked.'
  }
];

// ════════════════════════════════════════════════════════════
// PIMPLE SAUDAGAR
// ════════════════════════════════════════════════════════════

export const pimpleSaudagarCatLocation: LocationConfig = {
  name: 'Pimple Saudagar',
  slug: 'cat-grooming-in-pune/pimple-saudagar',

  heroH1: `Cat Grooming at Home in Pimple Saudagar — Quiet Room, Cat-Safe Products`,
  heroSubtext:
    'Kunal Icon Road, Rahatani, Jagtap Dairy and the Sai Chowk side. No carrier, no salon, no dogs barking in the next room. Fixed prices from ₹799.',

  storySections: [
    {
      heading: 'Why Cat Owners Here Stopped Using Salons',
      subheading: 'A waiting room full of dogs is the worst possible place for a cat.',
      paragraphs: [
        'Pimple Saudagar has plenty of pet salons, and almost all of them are dog-first. For a cat that means a carrier ride through Kunal Icon Road traffic followed by a waiting area full of barking. Cats do not habituate to that the way dogs do — they shut down. At-home cat grooming in Pimple Saudagar replaces the entire experience with one quiet room in a flat the cat already lives in.',
        'The other reason is simply that it works more often. Cats that have failed at a salon twice frequently complete a full session at home, because the animal has not already spent forty minutes being frightened before anyone touches it.',
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Cat grooming at home in Pimple Saudagar Pune',
      imageLeft: true,
    },
    {
      heading: 'How the Session Runs in a Compact Flat',
      subheading: 'One closed door is usually all the setup required.',
      paragraphs: [
        'Flats here run small, which suits cat grooming rather than hindering it. We work in a single room with the door shut — most often the bathroom — using our own mats and disposables. The groomer sits down first and lets the cat approach the kit rather than the other way round. Low restraint throughout; no scruffing.',
        'Everything arrives in a bag on a two-wheeler, so there is no van in the visitor bay and no society NOC to arrange. Hair is collected as it comes off and the room is cleaned before the groomer leaves.',
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat grooming setup in a compact Pimple Saudagar flat',
      imageLeft: false,
    },
    {
      heading: 'Humidity, Dust and the Longhair Problem',
      subheading: 'Persian coats mat faster here than owners expect.',
      paragraphs: [
        'Pimple Saudagar is still under construction in parts, and the dust that comes with it settles into a longhair coat and holds moisture against the skin. Combined with Pune monsoon humidity, that is precisely the condition in which a Persian or Himalayan coat packs down into solid pads — usually behind the front legs, along the back legs and around the collar area, where owners are least likely to look.',
        'This is why we treat the drying stage as the medically useful part rather than the finish. A cat left damp at the skin in a humid closed flat is how fungal patches start. Every session ends with a proper dry-through, at a fan speed and distance the cat will actually tolerate.',
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'De-matting a Persian cat coat at home in Pimple Saudagar',
      imageLeft: true,
    },
    {
      heading: 'Fixed Prices, No Cat Surcharge',
      subheading: 'The same three numbers we charge for dogs.',
      paragraphs: [
        `A Spa Bath is ₹799, a Hair Cut is ₹999, and both together are ₹1299 — across Pimple Saudagar, Rahatani, Pimple Gurav, Pimple Nilakh and Thergaon. Cats are not priced above dogs; the handling differs, the price does not.`,
        `A Hygiene Hair Cut is ₹299 and covers a face and sanitary trim without a full body cut, which is frequently all a healthy shorthair needs. Lion cuts for matted longhairs sit inside the ₹999 Hair Cut rather than above it.`,
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Fixed-price cat grooming in Pimple Saudagar',
      imageLeft: false,
    },
    {
      heading: `Which Cat Breeds Do We Groom in Pimple Saudagar?`,
      subheading: `Persians and Indian shorthairs, in roughly equal measure.`,
      paragraphs: [
        `The cat population here splits fairly evenly between Persians and Himalayans on one side and Indian shorthairs on the other, with some Siamese and a few Maine Coons. Those two groups need close to opposite things from a groomer, and the most useful thing we do is tell people which group they are actually in.`,
        `These are the cats we are booked for most across Pimple Saudagar and Rahatani:`,
      ],
      bullets: [
        `Persian and Himalayan cat grooming in Pimple Saudagar — de-matting, sanitary trims, nail clipping and lion cuts where the coat has packed down. Construction dust plus monsoon humidity makes this the fastest-matting environment we work in.`,
        `Indian shorthair cat grooming in Pimple Saudagar — usually the least intervention on the list. Nails, ears, a comb-out and a coat check are often the whole job, and we will say so rather than sell a bath the cat does not need.`,
        `Maine Coon grooming in Pimple Saudagar — dense and slow to dry, so the blow-dry stage takes most of the session. Worth booking a longer window.`,
        `Siamese and Bengal grooming in Pimple Saudagar — short coats and short patience. Two focused sessions beat one long one, and we would rather split it than force it.`,
        `Senior cat grooming in Pimple Saudagar — short sessions, warm room, and nails prioritised over coat perfection. In cats, overgrown nails curl into the pad, which is painful and easily missed.`,
        `Kitten grooming in Pimple Saudagar — from about four months, starting with nails, a comb and an introduction to the equipment rather than a bath.`,
      ],
      closingLine: `Tell us the breed and how the coat is doing when you book, and the groomer plans the session before arriving.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Persian and shorthair cat grooming at home in Pimple Saudagar`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/pimple-saudagar'),
  nearbyAreas: ['Rahatani', 'Pimple Gurav', 'Wakad', 'Kalewadi', 'Sangvi', 'Aundh', 'Thergaon', 'Pimple Nilakh'],
};

export const pimpleSaudagarCatMapEmbed = 'https://www.google.com/maps?q=Pimple+Saudagar,Pune&output=embed';

export const pimpleSaudagarCatReviews: LocationReview[] = [
  {
    petName: 'Bella',
    ownerName: 'Kavita Joshi',
    area: 'Rahatani',
    review: `Bella is a Persian and her coat had matted badly behind her legs where I honestly never thought to check. The groomer showed me exactly where and why before touching anything, then explained that clipping would hurt her less than brushing it out. She was calm the whole time, which has never happened at a salon.`,
    rating: 5,
  },
  {
    petName: 'Simba',
    ownerName: 'Ashish Gaikwad',
    area: 'Kunal Icon Road',
    review: 'Two previous salon attempts ended with us bringing him home ungroomed. At home, in our bathroom with the door shut, he let the whole thing happen. Same cat, completely different animal. I will not be putting him in a carrier again.',
    rating: 5,
  },
];

export const pimpleSaudagarFAQsCat: FAQ[] = [
  {
    question: 'Do you cover Rahatani, Pimple Gurav and Pimple Nilakh too?',
    answer: 'Yes — Pimple Saudagar, Rahatani, Pimple Gurav, Pimple Nilakh, Thergaon and the Sangvi side, all at the same published prices. Area names blur together here, so send a pin if your society is known by its builder name.'
  },
  {
    question: 'My cat failed at a salon twice. Is home grooming really different?',
    answer: 'Usually, yes. Most of a salon\'s stress for a cat happens before the grooming — the carrier, the car, the barking in the waiting area. Remove those and the same cat is often manageable. The groomer also starts by doing nothing, letting the cat inspect the kit rather than being handled straight away.'
  },
  {
    question: 'Will my cat try to escape mid-session?',
    answer: 'We work in one room with the door shut, which is almost always enough. Tell us at booking if your cat is a known bolter and the groomer will check the room — windows, gaps, the balcony door — before anything comes out of the bag.'
  },
  {
    question: 'Do you use the same products you use on dogs?',
    answer: 'Never. Everything is cat-formulated. Dog shampoo is genuinely unsafe on cats, and permethrin-based tick treatments can be fatal to them, so there is no situation in which we would substitute one for the other.'
  },
  {
    question: 'Why does my Persian mat so quickly here?',
    answer: 'Construction dust plus monsoon humidity is close to the worst combination for a longhair coat — dust holds moisture against the skin and the coat packs down into pads, usually behind the front legs and along the back legs where owners rarely look. Regular combing between sessions helps more than a longer session does.'
  },
  {
    question: 'Is a lion cut cruel?',
    answer: 'No. When a coat has already matted tight to the skin, brushing it out means an hour of pulling at the skin; clipping is the kinder option and the coat grows back. We will tell you plainly which situation your cat is in rather than billing you for a de-matting that ends in a clip anyway.'
  },
  {
    question: 'Do you sedate cats?',
    answer: 'No. Low restraint, one quiet room, breaks when needed, and we stop rather than force a session the cat cannot cope with. Sedation is a decision for your vet, not a groomer.'
  },
  {
    question: 'How often should my cat be groomed?',
    answer: 'Persians, Himalayans and Maine Coons typically every 4 to 6 weeks in this climate. Healthy Indian shorthairs often need far less — nails, ears and a comb-out, and not much else. We would rather tell you to book less often than sell you a schedule your cat does not need.'
  },
  {
    question: 'Can you groom a cat and a dog in the same visit?',
    answer: 'Yes, and each is priced as its own session. We will normally do the cat first, in a closed room, before the dog session starts — a cat that has just listened to a dryer running for an hour is a much harder cat to work with.'
  },
  {
    question: 'How do I pay?',
    answer: 'After the session, cash or UPI, at the price quoted at booking.'
  }
];

// ════════════════════════════════════════════════════════════
// MAGARPATTA
// ════════════════════════════════════════════════════════════

export const magarpattaCatLocation: LocationConfig = {
  name: 'Magarpatta',
  slug: 'cat-grooming-in-pune/magarpatta',

  heroH1: `Cat Grooming at Home in Magarpatta — Inside Your Flat, at Your Cat's Pace`,
  heroSubtext:
    'Magarpatta City, Amanora and the Hadapsar side. A trained groomer clears the gate, works in one quiet room, and never uses a carrier. Fixed prices from ₹799.',

  storySections: [
    {
      heading: 'Why Township Cats Do Better at Home',
      subheading: 'The gate, the lift, the car — all of it before the grooming even starts.',
      paragraphs: [
        'Getting a cat out of a Magarpatta tower and to a salon means a carrier, a lift, a walk across the podium, a gate and a drive onto the Hadapsar main road. That is a long sequence of things cats dislike, stacked before anyone has touched the coat. At-home cat grooming in Magarpatta deletes the entire sequence.',
        'It also tends to produce a better result. A cat that arrives at a table already frightened has very little tolerance left; the same cat, in its own bedroom with the door shut, will often sit through a full de-matting session. The setting does more work than the technique.',
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Cat grooming at home in Magarpatta City Pune',
      imageLeft: true,
    },
    {
      heading: 'Gate Clearance and Tower Logistics',
      subheading: 'Simpler than people assume — there is no van involved.',
      paragraphs: [
        'Magarpatta and Amanora both run proper visitor control, and the usual worry is that a grooming visit means paperwork. It does not. The groomer arrives by two-wheeler with everything in a bag, so from the gate register\'s perspective it is a visitor with a backpack — no vehicle to clear, no generator, no society NOC.',
        'Send the visitor pass or app approval at booking and the groomer arrives already cleared instead of calling from the gate. Inside, we need one quiet room with a door that shuts. A bathroom is ideal, and closing that single door is normally all the containment a cat session requires.',
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat grooming session inside a Magarpatta township flat',
      imageLeft: false,
    },
    {
      heading: 'Balcony Cats, Garden Views and the Tick Question',
      subheading: 'Indoor-outdoor cats here need a real skin check.',
      paragraphs: [
        'Magarpatta has more indoor-outdoor cats than most tower neighbourhoods — podium gardens, low balconies and the central green mean a fair number of cats get genuine outdoor time. That is good for the animal and worth being alert to for the skin: from June onwards a cat with garden access can carry ticks and fleas exactly as a dog does.',
        'So every session includes a proper skin and ear check alongside the coat work, using cat-safe products only. This matters more for cats than dogs: permethrin-based tick products, which are ordinary for dogs, can be fatal to cats. We never improvise with dog products, whatever is to hand.',
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Skin and tick check during cat grooming in Magarpatta',
      imageLeft: true,
    },
    {
      heading: 'Fixed Prices Across the Township',
      subheading: 'Cats cost the same as dogs.',
      paragraphs: [
        `A Spa Bath is ₹799, a Hair Cut is ₹999 and both together are ₹1299, across Magarpatta City, Amanora Park Town, Sopan Baug, Keshav Nagar and the wider Hadapsar side. No township premium, no doorstep charge and no cat surcharge.`,
        `A Hygiene Hair Cut is ₹299 — a face and sanitary trim without a full body cut, which is often all a healthy shorthair needs. Lion cuts for matted Persians and Himalayans are part of the ₹999 Hair Cut, not an extra.`,
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Fixed-price cat grooming in Magarpatta and Amanora',
      imageLeft: false,
    },
    {
      heading: `Which Cat Breeds Do We Groom in Magarpatta?`,
      subheading: `Pedigree-heavy, and mostly longhaired.`,
      paragraphs: [
        `Magarpatta has one of the higher concentrations of pedigree cats we see — Persians, Himalayans, Maine Coons and Siamese, alongside plenty of Indian shorthairs. Longhairs dominate, which means de-matting and drying are the two stages that decide how a session goes.`,
        `These are the cats we are called out to most across the township:`,
      ],
      bullets: [
        `Persian and Himalayan cat grooming in Magarpatta — de-matting, sanitary trims, nail clipping, and a lion cut where the coat has packed down against the skin. We will tell you before starting whether it is a brush-out or a clip, rather than discovering it halfway.`,
        `Maine Coon grooming in Magarpatta — large, dense and slow to dry. The blow-dry is where most of the session goes, and rushing it in this humidity is how skin trouble starts. Book a longer window.`,
        `Siamese and Bengal grooming in Magarpatta — short coats, very little patience. Two short focused sessions work better than one long one.`,
        `Indian shorthair cat grooming in Magarpatta — often needs remarkably little: nails, ears, a comb-out and a coat check. We would rather say that than sell a bath a healthy shorthair does not need.`,
        `Senior cat grooming in Magarpatta — short sessions, warm room, frequent breaks. Overgrown nails are the priority over coat perfection, because in cats they curl into the pad.`,
        `Kitten grooming in Magarpatta — from around four months, beginning with nails, a comb and letting the kitten investigate the equipment rather than a full bath.`,
      ],
      closingLine: `Tell us the breed and the coat condition at booking and the groomer arrives with the session already planned.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Persian, Maine Coon and shorthair cat grooming at home in Magarpatta`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/magarpatta'),
  nearbyAreas: ['Magarpatta City', 'Amanora', 'Hadapsar', 'Sopan Baug', 'Mundhwa', 'Fatima Nagar', 'Kharadi', 'Keshav Nagar'],
};

export const magarpattaCatMapEmbed = 'https://www.google.com/maps?q=Magarpatta+City,Pune&output=embed';

export const magarpattaCatReviews: LocationReview[] = [
  {
    petName: 'Cleo',
    ownerName: 'Ritika Bose',
    area: 'Magarpatta City',
    review: `Cleo is a Maine Coon and drying her has always been the part that defeats me. The groomer spent nearly half the session on the blow-dry alone and explained why leaving her damp underneath was the actual risk. She has not had a single skin flare since, which is a first for monsoon.`,
    rating: 5,
  },
  {
    petName: 'Pepper',
    ownerName: 'Sandeep Iyer',
    area: 'Amanora',
    review: 'Sent the gate pass at booking and there were no phone calls from downstairs, which I appreciated. Pepper goes out onto the podium garden and the groomer found two ticks I had completely missed. Used cat-specific products throughout and explained why that mattered.',
    rating: 5,
  },
];

export const magarpattaFAQsCat: FAQ[] = [
  {
    question: 'Do you cover Amanora and the Hadapsar side as well as Magarpatta City?',
    answer: 'Yes — Magarpatta City, Amanora Park Town, Sopan Baug, Keshav Nagar, Mundhwa and the wider Hadapsar side, at the same published prices. No township premium.'
  },
  {
    question: 'Does the visitor gate pass complicate the visit?',
    answer: 'Not if you send it at booking — the groomer arrives already cleared. There is no van to clear regardless: the whole kit comes in a bag on a two-wheeler, so the gate sees a visitor with a backpack.'
  },
  {
    question: 'My cat goes out onto the podium garden. Does she need tick treatment?',
    answer: 'Worth checking every session, particularly from June onwards. Cats with genuine outdoor access pick up ticks and fleas much as dogs do. Important caveat: permethrin-based tick products, which are routine for dogs, can be fatal to cats — we only ever use cat-safe products, and where the problem looks veterinary rather than cosmetic we will say so.'
  },
  {
    question: 'What room do you need?',
    answer: 'One quiet room with a door that shuts, ideally a bathroom. Closing that single door is usually all the containment a cat session needs. Tell us at booking if your cat bolts and the groomer will check the room before unpacking.'
  },
  {
    question: 'My Maine Coon takes forever to dry. How long is a session?',
    answer: 'Longer than average — a dense longhair coat means the blow-dry stage takes most of the visit, and we do not rush it. A coat left damp at the skin in Pune humidity is where fungal trouble starts, so this is the medically useful part rather than the finish.'
  },
  {
    question: 'Do you sedate, or scruff?',
    answer: 'Neither. Low restraint, one quiet room, breaks when the cat needs them, and we stop rather than force a session through. Sedation is a veterinary decision.'
  },
  {
    question: 'Is a lion cut appropriate for a matted Persian?',
    answer: 'Frequently, yes. Once a coat has packed down against the skin, brushing it out means an hour of pulling; clipping is kinder and the coat regrows. We will tell you which situation you are in before starting rather than charging for a de-matting that ends in a clip.'
  },
  {
    question: 'How often should a longhaired cat be groomed?',
    answer: 'Every 4 to 6 weeks is typical for Persians, Himalayans and Maine Coons in this climate. Combing between visits does more for the coat than a longer session does. Healthy Indian shorthairs usually need much less.'
  },
  {
    question: 'Can you do the cat and the dog in one visit?',
    answer: 'Yes, priced as two sessions. We will usually do the cat first behind a closed door — a cat that has just heard a dryer running for an hour is considerably harder to work with.'
  },
  {
    question: 'How do I pay?',
    answer: 'After the session, by cash or UPI, at the price quoted at booking.'
  }
];

// ════════════════════════════════════════════════════════════
// YERAWADA
// ════════════════════════════════════════════════════════════

export const yerawadaCatLocation: LocationConfig = {
  name: 'Yerawada',
  slug: 'cat-grooming-in-pune/yerawada',

  heroH1: `Cat Grooming at Home in Yerawada — One Quiet Room, No Carrier`,
  heroSubtext:
    'From the Nagar Road lanes to Vishrantwadi, Shastri Nagar and the Kalyani Nagar edge. Cat-formulated products, low restraint, and a session that runs at your cat\'s pace. From ₹799.',

  storySections: [
    {
      heading: 'Why Yerawada Cats Are Better Groomed at Home',
      subheading: 'Narrow lanes, heavy traffic, and a carrier the cat already hates.',
      paragraphs: [
        'Yerawada traffic is among the worst in the city at any useful hour, and the older lanes are not somewhere anyone wants to walk a carrier. For a cat, that journey is the hardest part of the whole exercise — harder than the bath, the comb or the clippers. At-home cat grooming in Yerawada removes it entirely.',
        'There is a second reason specific to this area. A lot of Yerawada cats are indoor-outdoor, or live in ground-floor homes with genuine street contact. Those cats carry a higher tick and flea load than sealed-tower cats, and a groomer working in your home checks the skin as part of every session rather than treating it as an extra.',
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Cat grooming at home in Yerawada Pune',
      imageLeft: true,
    },
    {
      heading: 'Small Homes Suit Cat Grooming',
      subheading: 'One room with a door that shuts is the entire requirement.',
      paragraphs: [
        'A compact Yerawada home is not a limitation for a cat session — if anything it helps. We work in a single room with the door closed, most often the bathroom, on our own mats. The groomer sits down first and lets the cat come to the equipment rather than reaching for the cat.',
        'Everything arrives in a bag on a two-wheeler, which matters in lanes where a car struggles. No van, no generator, nothing to park. Hair is collected as it comes off and the room is left clean.',
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat grooming in a compact Yerawada home',
      imageLeft: false,
    },
    {
      heading: 'Street Contact, Ticks and Cat-Safe Products',
      subheading: 'The one place where using the wrong product is genuinely dangerous.',
      paragraphs: [
        'Cats with outdoor access in Yerawada pick up ticks and fleas readily, particularly from June when warm wet weather suits them best. Every session here includes a real skin and ear check alongside the coat work.',
        'What matters more than the check is what gets used afterwards. Permethrin-based tick products are ordinary for dogs and can be fatal to cats — this is the single most common serious mistake made by well-meaning owners buying something off a shelf. Everything we use on a cat is cat-formulated, and where what we are seeing looks like a veterinary problem rather than a grooming one we will tell you to see a vet instead of treating it ourselves.',
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Cat-safe tick and skin check during grooming in Yerawada',
      imageLeft: true,
    },
    {
      heading: 'Fixed Prices, Old Lanes to New Towers',
      subheading: 'Same three numbers everywhere in Yerawada.',
      paragraphs: [
        `A Spa Bath is ₹799, a Hair Cut is ₹999 and both together are ₹1299 — the same in a compact home off Nagar Road as in a tower on the Kalyani Nagar edge. No doorstep charge, no cat surcharge and no premium for a hard-to-reach lane.`,
        `A Hygiene Hair Cut is ₹299 and covers a face and sanitary trim without a full body cut, which is often the entire job for a healthy shorthair. Lion cuts for matted longhairs sit inside the ₹999 Hair Cut.`,
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Fixed-price cat grooming packages in Yerawada',
      imageLeft: false,
    },
    {
      heading: `Which Cat Breeds Do We Groom in Yerawada?`,
      subheading: `Predominantly Indian shorthairs, and that changes the advice.`,
      paragraphs: [
        `Yerawada has the highest proportion of Indian shorthairs and rescued cats of any area we work in, alongside Persians in the newer towers. Shorthairs are routinely over-serviced by places that price a standard package regardless of what the animal needs — and a healthy Indian shorthair usually needs very little.`,
        `These are the cats we are booked for most across Yerawada, Vishrantwadi and Shastri Nagar:`,
      ],
      bullets: [
        `Indian shorthair cat grooming in Yerawada — most often nails, ears, a comb-out and a coat and skin check, and nothing more. We will say so rather than sell a bath the cat does not need. Where there is outdoor access, the tick check is the part that actually matters.`,
        `Persian and Himalayan cat grooming in Yerawada — de-matting, sanitary trims, nail clipping and lion cuts where the coat has packed down against the skin.`,
        `Rescue and community cat grooming in Yerawada — often the first grooming of the animal's life, and handled accordingly. Short, low-ambition sessions, no scruffing, and we stop early rather than finish at any cost.`,
        `Siamese grooming in Yerawada — short coat, high energy, low tolerance. Short focused sessions rather than one long one.`,
        `Senior cat grooming in Yerawada — warm room, short session, breaks. Nails first: in an elderly cat they curl into the pad and that is painful long before the coat looks bad.`,
        `Kitten grooming in Yerawada — from around four months, starting with nails and a comb. Very young kittens hold their warmth badly, so bathing one is a medical question rather than a grooming preference.`,
      ],
      closingLine: `Don't see your cat here? We groom all breeds — and we will tell you honestly when the answer is that yours needs less, not more.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Indian shorthair and Persian cat grooming at home in Yerawada`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('cat-grooming-in-pune/yerawada'),
  nearbyAreas: ['Vishrantwadi', 'Shastri Nagar', 'Kalyani Nagar', 'Dhanori', 'Koregaon Park', 'Viman Nagar', 'Nagar Road', 'Gunjan Chowk'],
};

export const yerawadaCatMapEmbed = 'https://www.google.com/maps?q=Yerawada,Pune&output=embed';

export const yerawadaCatReviews: LocationReview[] = [
  {
    petName: 'Meenu',
    ownerName: 'Rehana Sayyed',
    area: 'Shastri Nagar',
    review: `Meenu is a street cat we took in and I had no idea what she actually needed. I was expecting to be sold a full package. Instead the groomer did her nails, ears and a comb-out, found a tick behind her ear, and told me she does not need bathing at all at this stage. I have never had someone talk me out of spending money before.`,
    rating: 5,
  },
  {
    petName: 'Snowy',
    ownerName: 'Mahesh Bhosale',
    area: 'Vishrantwadi',
    review: 'Our lane is too narrow for a car and the groomer came on a bike with everything in one bag. Snowy is a Persian with mats behind her legs and it was handled in our bathroom with the door shut, no drama. She was eating again within ten minutes of him leaving.',
    rating: 5,
  },
];

export const yerawadaFAQsCat: FAQ[] = [
  {
    question: 'Do you cover Vishrantwadi, Shastri Nagar and the Kalyani Nagar edge?',
    answer: 'Yes — Yerawada proper, Vishrantwadi, Shastri Nagar, the Gunjan Chowk side and the Kalyani Nagar edge, all at the same published prices.'
  },
  {
    question: 'Our lane is too narrow for a car. Is that a problem?',
    answer: 'No. The groomer travels by two-wheeler with the whole kit in a bag. There is no van and nothing that needs to park outside.'
  },
  {
    question: 'My cat goes outside. Should I be worried about ticks and fleas?',
    answer: 'It is worth a check every session, and we do one as standard. The important part is what gets used afterwards: permethrin-based tick products, which are routine for dogs, can be fatal to cats. Everything we use is cat-formulated, and where the problem looks veterinary rather than cosmetic we will tell you to see a vet rather than treating it.'
  },
  {
    question: 'I have an Indian shorthair. Does she need a full grooming package?',
    answer: 'Usually not. For most healthy shorthairs the whole job is nails, ears, a comb-out and a coat and skin check — no bath required. We would rather tell you that than sell you a package. Where there is outdoor access, the tick check is the genuinely useful part.'
  },
  {
    question: 'My home is small. Is there enough room?',
    answer: 'Almost certainly — cat sessions need less space than dog sessions. One room with a door that shuts, ideally a bathroom, is the entire requirement. The groomer works on his own mats.'
  },
  {
    question: 'The cat has never been groomed and is semi-feral. Will you still come?',
    answer: 'Yes, and we will manage expectations honestly. First sessions with rescued or semi-feral cats are deliberately unambitious — often just nails and a partial comb-out — and we stop early rather than finish at any cost. No scruffing and no sedation.'
  },
  {
    question: 'Do you use dog products on cats if that is what is available?',
    answer: 'Never, under any circumstances. Dog shampoo is unsafe on cats and dog tick treatments can kill them. The groomer carries cat-formulated products as standard rather than as an option.'
  },
  {
    question: 'Is a lion cut cruel for a matted Persian?',
    answer: 'No — it is usually the kinder route. Brushing out a coat that has matted tight against the skin means an hour of pulling at the skin. Clipping is faster and less painful, and the coat grows back. We will tell you which situation you are in before starting.'
  },
  {
    question: 'How often should my cat be groomed?',
    answer: 'Longhairs like Persians typically every 4 to 6 weeks in Pune humidity. Healthy Indian shorthairs often need only occasional nail and ear attention. We will tell you if you are booking more often than your cat needs.'
  },
  {
    question: 'How do I pay?',
    answer: 'After the session, by cash or UPI, at the price quoted when you booked.'
  }
];
