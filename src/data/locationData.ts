import type { LocationConfig } from '../components/location/LocationHero';
import type { LocationReview } from '../components/location/LocationReviews';
import type { FAQ } from '../components/location/LocationFAQs';
import { ALL_PUNE_CITIES } from './puneLocalities';

// ─── All Pune localities (shared across every location page) ─────────────────
// Each location page will show these MINUS itself

// The list itself now lives in ./puneLocalities so that importing area NAMES
// does not drag this module's ~4,800 lines of locality copy into the bundle.
// Re-exported here because plenty of existing imports point at this module.
export { ALL_PUNE_CITIES } from './puneLocalities';

// Helper: get all cities except current page's city
function otherCities(currentSlug: string) {
  return ALL_PUNE_CITIES.filter((c) => c.slug !== currentSlug);
}

// ════════════════════════════════════════════════════════════
// DHANORI
// ════════════════════════════════════════════════════════════

export const dhanoriLocation: LocationConfig = {
  name: 'Dhanori',
  slug: 'dog-grooming-in-pune/dhanori',

  heroH1: `Doorstep Dog Grooming in Dhanori — Calm, Clean, Professional`,
  heroSubtext:
    'Live near Porwal Road or Lohegaon side? Get certified dog grooming in Dhanori without stepping outside. Hygienic setup, gentle handling, zero travel stress.',

  storySections: [
    {
      heading: 'Why Dhanori Dog Parents Prefer At-Home Grooming',
      subheading: 'Comfort matters more than convenience.',
      paragraphs: [
        'Dhanori has become one of Pune’s fastest-growing residential neighborhoods, especially for families working in Viman Nagar and Lohegaon. With compact apartments and busy schedules, taking dogs to crowded salons can be stressful and time-consuming. At-home dog grooming in Dhanori eliminates travel anxiety and waiting room chaos. Your dog remains in a familiar environment while receiving one-on-one professional care. This significantly reduces stress levels and creates a calmer grooming experience overall.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Dog grooming at home in Dhanori Pune',
      imageLeft: true,
    },
    {
      heading: 'Climate-Aware Grooming for Pune Conditions',
      subheading: 'Dust, humidity and shedding handled professionally.',
      paragraphs: [
        'Dhanori’s rapid development means increased dust and seasonal shedding issues for dogs. Pune’s alternating dry summers and humid monsoons also impact coat and skin health. Our grooming sessions include deep cleansing baths, coat conditioning, de-shedding treatments, and tick-prevention care tailored to your dog’s breed and coat type. Whether it’s a Labrador, Indie, or Shih Tzu, we customize the process for optimal comfort and hygiene.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Dog grooming setup in Dhanori apartment',
      imageLeft: false,
    },
    {
      heading: 'Ideal for Senior & Sensitive Dogs',
      subheading: 'Low-noise, low-stress grooming approach.',
      paragraphs: [
        'Senior dogs and anxious dogs often struggle with salon visits due to loud dryers and unfamiliar surroundings. Our home grooming approach focuses on calm handling, gentle restraint, and patient pacing. We allow dogs time to settle before beginning and avoid rushing any step. This ensures not only a clean coat but also a positive grooming memory for your dog.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Gentle senior dog grooming in Dhanori',
      imageLeft: true,
    },
    {
      heading: 'Transparent Pricing & Trusted Service',
      subheading: 'No hidden surprises.',
      paragraphs: [
        `We believe dog parents deserve complete clarity. Our packages clearly outline what’s included — bathing, brushing, nail trimming, ear cleaning, sanitary trim, and optional haircuts. No surprise add-ons. No upselling pressure. Just structured, transparent dog grooming in Dhanori that prioritizes trust and long-term relationships.`
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy dog after grooming in Dhanori',
      imageLeft: false,
    },
    {
      heading: `Which Dog Breeds Do We Groom in Dhanori?`,
      subheading: `Every coat tells a different story.`,
      paragraphs: [
        `Dhanori has a wonderfully mixed dog community — from playful Labradors in the newer apartment blocks near Porwal Road to fluffy Shih Tzus and Indies in the quieter pockets towards Kalas. Because we visit homes rather than operate from a fixed salon, we see firsthand how different each dog's grooming journey is. A Labrador and a Shih Tzu living in the same building can have completely opposite needs — one craves a high-powered deshedding blow-out, the other needs a slow careful session with gentle detangling. Our groomers in Dhanori are trained to read the animal before picking up a brush.`,
        `These are the breeds we most commonly groom in Dhanori and how we tailor each session:`,
      ],
      bullets: [
        `Labrador grooming in Dhanori — Short dense coats need proper deshedding, not just a rinse. We use a deshedding shampoo, high-velocity blow-out, and thorough brushing to reduce the fur you find on your sofa for weeks afterward.`,
        `Shih Tzu grooming in Dhanori — Long flowing coats mat quickly in Pune's humidity. We detangle from the ends inward, trim around the eyes and paws, and finish with a light coat spray so the fur stays manageable longer.`,
        `Golden Retriever grooming in Dhanori — Thick double coats and feathering around the ears and tail need consistent maintenance. We trim the feathering, deep-condition the undercoat, and finish with a fluff-dry that restores natural volume.`,
        `Indie dog grooming in Dhanori — Mixed-breed Indies often have sensitive skin and hidden tick issues. We do a thorough tick check, use a mild anti-parasitic shampoo, and finish with a conditioning rinse suited to short coats.`,
        `Pug grooming in Dhanori — The skin folds around a Pug's face need special attention. We clean each fold separately, trim the nails carefully, and finish with a gentle fragrance-free rinse.`,
      ],
      closingLine: `Don't see your breed? We groom all breeds — these are simply the ones our Dhanori customers most frequently book.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Breed-specific dog grooming at home in Dhanori Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/dhanori'),
  nearbyAreas: ['Porwal Road', 'Lohegaon', 'Kalas', 'Viman Nagar', 'Yerawada', 'Wadgaon Sheri', 'Tingre Nagar', 'Kalyani Nagar'],
};

export const dhanoriMapEmbed =
  'https://www.google.com/maps?q=Dhanori,Pune&output=embed';

export const dhanoriReviews: LocationReview[] = [
  {
    petName: 'Bhau',
    ownerName: 'Amol Jagtap',
    area: 'Porwal Road',
    review: `I was honestly skeptical about home grooming at first, but this turned out to be a much better experience than salon visits. Bhau usually gets anxious during car rides, but this time he stayed relaxed throughout the session. The groomer was patient and didn’t rush anything. The de-shedding treatment really helped — there’s visibly less hair around the house now.`,
    rating: 5,
  },
  {
    petName: 'Rocky',
    ownerName: 'Vaishali Deshmukh',
    area: 'Dhanori Jakat Naka',
    review: 'My dog absolutely hates being taken outside. Grooming at home made such a difference. The groomer took time to calm her before starting and handled her very gently during brushing. No drama, no hiding under the bed afterward. That itself says a lot.',
    rating: 5,
  },
];

export const dhanoriFAQs: FAQ[] = [
  {
    question: 'Is at-home grooming better than taking my pet to a salon?',
    answer: 'For many dogs, yes. Grooming at home removes the stress of car rides, waiting areas, and unfamiliar animals. In growing residential areas with busy roads, avoiding travel can significantly reduce anxiety and make the session smoother and safer for your dog.'
  },
  {
    question: 'What does a complete grooming session include?',
    answer: 'A standard session includes bathing with breed-appropriate shampoo, blow drying, brushing, nail trimming, ear cleaning, sanitary trimming, and optional haircut styling. Before starting, the groomer evaluates coat condition and discusses the most suitable approach with you.'
  },
  {
    question: 'Can you manage heavy shedding and dusty coat buildup?',
    answer: 'Yes. Environmental dust and seasonal coat changes can cause excessive shedding. Our de-shedding process removes loose undercoat safely while improving skin health and shine, helping keep your home cleaner for longer.'
  },
  {
    question: 'Is your equipment safe to use inside apartments?',
    answer: 'Absolutely. Our grooming setup is compact, controlled, and designed for indoor use. We manage water usage carefully and clean the working area after the session to maintain hygiene.'
  },
  {
    question: 'How frequently should I schedule grooming?',
    answer: 'Most dogs benefit from grooming every 4–6 weeks. Regular sessions prevent matting, reduce odor, and help detect early skin or ear issues before they become serious.'
  },
  {
    question: 'Do you handle senior or anxious dogs gently?',
    answer: 'Yes. We follow a low-stress approach that includes calm handling, breaks when needed, and minimal restraint. Senior dogs especially benefit from familiar home environments during grooming.'
  },
  {
    question: 'Do you cover Porwal Road, Kalas and Tingre Nagar as well as Dhanori proper?',
    answer: 'Yes, all of them, including the newer society clusters along Porwal Road and the Kalas–Vishrantwadi stretch. Dhanori has expanded faster than its road names have settled, so if your society is known locally by the builder name rather than the area, just send us a pin and we will confirm the slot.'
  },
  {
    question: 'My dog reacts badly to aircraft noise from the airport approach. Does that affect the session?',
    answer: 'It can, and it is worth telling us at booking. Dogs in Dhanori and Kalas live under the Lohegaon approach path, and a low overflight mid-blow-dry startles a dog that was settling. Our groomers pause rather than push through, and where a dog is very sound-reactive we schedule the dryer stage for a quieter window and use a lower fan speed for longer.'
  },
  {
    question: 'Our society water supply is on a fixed timing. Does the groomer need water the whole session?',
    answer: 'No — the actual water use is short. The groomer needs a running tap for the bath and rinse stages, roughly fifteen to twenty minutes of the visit, not the full ninety. If your supply is timed, book a slot inside that window or keep a couple of filled buckets ready and the session runs exactly the same.'
  },
  {
    question: 'I am flying my dog out and need him groomed before travel. How far ahead should that be?',
    answer: 'Two to three days before the flight, not the morning of it. A dog needs to be fully dry to the skin and settled before a crate journey, and a bath on travel day leaves a damp undercoat in an air-conditioned hold. Nails short and paw hair trimmed matter more for crate comfort than a fresh haircut does.'
  },
  {
    question: 'Can the session happen in the society clubhouse or pet area instead of my flat?',
    answer: 'Yes, if your society permits it and there is a tap and a plug point. Some Dhanori societies prefer it and it suits large or heavy-shedding dogs. The one thing that changes is distraction — an open common area with other residents and dogs passing is harder for a nervous dog than a closed bathroom is.'
  }
];

// ════════════════════════════════════════════════════════════
// WAGHOLI
// ════════════════════════════════════════════════════════════

export const wagholiLocation: LocationConfig = {
  name: 'Wagholi',
  slug: 'dog-grooming-in-pune/wagholi',

  heroH1: 'Professional Dog Grooming in Wagholi Without Leaving Your Home',
  heroSubtext:
    `From Kesnand Road to Bakori Phata — expert dog grooming delivered at your doorstep in Wagholi. Clean setup. Gentle approach. Reliable scheduling.`,

  storySections: [
    {
      heading: 'Perfect for Wagholi’s Expanding Residential Hubs',
      subheading: 'Convenience built around your schedule.',
      paragraphs: [
        'Wagholi has rapidly expanded into a major residential hub with modern apartment complexes and villa communities. Many dog parents here balance long commutes and demanding workdays. Our home grooming service eliminates the need for travel, saving time while ensuring your dog receives focused professional attention inside your home.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home grooming service in Wagholi Pune',
      imageLeft: true,
    },
    {
      heading: 'Apartment-Friendly Grooming Setup',
      subheading: 'Clean, compact and society-approved.',
      paragraphs: [
        'Our grooming equipment is portable and designed specifically for apartment use. We ensure minimal mess, controlled water usage, and full cleanup after each session. This makes the process safe and convenient for gated communities across Wagholi.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Apartment dog grooming in Wagholi',
      imageLeft: false,
    },
    {
      heading: 'Shedding & Coat Control Solutions',
      subheading: 'Reduce fur around your home.',
      paragraphs: [
        'Many Wagholi dog owners struggle with seasonal shedding. Our de-shedding treatments remove loose undercoat effectively, reducing hair fall inside your home while improving coat health and shine.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Dog de-shedding treatment in Wagholi',
      imageLeft: true,
    },
    {
      heading: 'Reliable, On-Time & Professional',
      subheading: 'Consistency builds trust.',
      paragraphs: [
        'Punctuality and professionalism matter. Our groomers arrive within confirmed time windows, follow hygienic protocols, and maintain a structured grooming routine that ensures predictable, high-quality results every time.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy pet after grooming in Wagholi',
      imageLeft: false,
    },
    {
      heading: `Breed-Specific Grooming We Offer Across Wagholi`,
      subheading: `Different breeds, different needs — we know the difference.`,
      paragraphs: [
        `Wagholi's dog population has grown rapidly alongside its residential expansion. Walking through the large gated societies on Kesnand Road, you'll spot everything from energetic Huskies to calm Beagles to tiny Pomeranians riding the elevator. Many dog parents here adopted their dogs during work-from-home periods and are now managing grooming for the first time — sometimes unsure what their dog actually needs beyond a simple bath. That's where breed-specific grooming makes a real difference.`,
        `Here's how we approach the most common breeds we groom in Wagholi:`,
      ],
      bullets: [
        `Husky grooming in Wagholi — Huskies blow their coat twice a year and the fur quantity is no joke. We never shave a Husky's double coat. Instead we do a thorough blow-out session to remove the loose undercoat while keeping the protective topcoat fully intact.`,
        `Beagle grooming in Wagholi — Beagles have short coats but very active ears. We pay extra attention to ear cleaning since their floppy ears trap moisture and wax, which can quickly turn into an infection if ignored.`,
        `Pomeranian grooming in Wagholi — That signature fluffy coat needs more than brushing. We card out the undercoat, trim around the paws and sanitary area, and fluff-dry for the rounded shape Pomeranians are known for.`,
        `German Shepherd grooming in Wagholi — GSDs have a thick double coat and often heavy seasonal shedding. Our deshedding treatment combined with a deep brush-out significantly reduces the daily fur around your apartment.`,
        `Cocker Spaniel grooming in Wagholi — Long silky ears and wavy body coat need regular trimming and detangling. We trim around the ear edges to prevent matting and keep the coat flowing rather than tangled.`,
        `Indie dog grooming in Wagholi — A large portion of our Wagholi bookings are for rescued Indies. We treat each one with patience and care, doing a full skin and tick check and using gentle products suited to their sensitive coats.`,
      ],
      closingLine: `Every session starts with a quick coat assessment so we're grooming your dog's actual coat condition — not a generic routine.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Breed-specific pet grooming at home in Wagholi Pune`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/wagholi'),
  nearbyAreas: ['Kesnand Road', 'Bakori Phata', 'Kharadi', 'Lohegaon', 'Viman Nagar', 'Ranjangaon Road', 'Lonikand', 'Tulapur Road'],
};

export const wagholiMapEmbed =
  'https://www.google.com/maps?q=Wagholi,Pune&output=embed';

export const wagholiReviews: LocationReview[] = [
  {
    petName: 'Sultan',
    ownerName: 'Prasad Gawade',
    area: 'Kesnand Road',
    review: 'With our work schedule, taking Sultan to a grooming salon was always a task. This doorstep service made things so much easier. The setup was clean, organized, and didn’t leave a mess behind. Sultan sheds heavily and the difference after the session was noticeable immediately.',
    rating: 5,
  },
  {
    petName: 'Bruno',
    ownerName: 'Shubhangi Kulkarni',
    area: 'Tulapur Road',
    review: 'I booked this mainly because my dog gets stressed in unfamiliar places. The entire grooming was done calmly in our balcony space. No loud noise, no rushing. He looked fresh and fluffy afterward and didn’t behave irritated like he usually does after salon visits.',
    rating: 5,
  },
];

export const wagholiFAQs: FAQ[] = [
  {
    question: 'Do I need to provide any tools or products for the session?',
    answer: 'No, we bring all professional grooming tools, shampoos, dryers, and sanitization supplies. You only need to provide access to water and a small working space.'
  },
  {
    question: 'Is at-home grooming suitable for high-rise apartment living?',
    answer: 'Yes. Our setup is designed specifically for apartments. We use controlled drying systems and ensure the area is cleaned thoroughly after the session so there is no inconvenience.'
  },
  {
    question: 'Can grooming help reduce fur around my furniture?',
    answer: 'Regular brushing and professional de-shedding treatments significantly reduce loose hair. Consistent maintenance improves coat health and minimizes hair fall inside your home.'
  },
  {
    question: 'Are your grooming products safe for sensitive skin?',
    answer: 'Yes. We use pet-safe, skin-friendly shampoos and conditioners selected based on coat type and sensitivity levels.'
  },
  {
    question: 'How long does the grooming session usually take?',
    answer: 'Most sessions take between 60 to 90 minutes depending on coat length, size of the pet, and selected services.'
  },
  {
    question: 'What makes home grooming different from salon grooming?',
    answer: 'Home grooming provides one-on-one attention in a familiar environment. There are no cages, no waiting areas, and no exposure to other animals, which reduces stress significantly.'
  },
  {
    question: 'Do you travel out to Kesnand, Bakori and the societies past Wagholi Chowk?',
    answer: 'Yes. Wagholi stretches a long way off the Nagar Road spine and we cover the society belt out toward Kesnand and Bakori as well as the older village core. Slot timing is the only practical difference — we try not to schedule those visits back-to-back with a central Pune booking in peak traffic.'
  },
  {
    question: 'There is constant construction around our society. Does that change how often we should groom?',
    answer: 'Yes, and it is one of the more genuine reasons to shorten the gap. Fine cement and quarry dust settles deep into a coat rather than sitting on top of it, and it dulls and dries the guard hairs. Dogs living beside active construction in Wagholi usually do better on a six-week rhythm than the eight their coat type would otherwise suggest.'
  },
  {
    question: 'Our society is on tanker supply some weeks. Is that enough for a grooming session?',
    answer: 'It is. A full session uses less water than most people expect — a large dog needs roughly two to three buckets through wash and rinse. If your tanker day is unpredictable, keep buckets filled ahead of the slot and tell the groomer on arrival so they work from stored water rather than the tap.'
  },
  {
    question: 'Can you handle a large guard breed that is protective of the house?',
    answer: 'Usually yes, but the introduction matters more than the grooming does. Tell us the breed and the temperament at booking. For a territorial dog we ask that you meet the groomer at the gate and bring them in yourself rather than having them arrive at the door unaccompanied — a Rottweiler or a GSD reads an escorted stranger completely differently to an unescorted one.'
  },
  {
    question: 'How early can a groomer reach Wagholi in the morning?',
    answer: 'From around 9 AM comfortably, and we can do earlier by arrangement. The realistic constraint is the Nagar Road stretch inbound — a groomer coming from the western side of the city hits that traffic head-on, so early Wagholi slots are usually assigned to a groomer already based on this side.'
  }
];

// ════════════════════════════════════════════════════════════
// SHIVAJINAGAR
// ════════════════════════════════════════════════════════════

export const shivajinagarLocation: LocationConfig = {
  name: 'Shivajinagar',
  slug: 'dog-grooming-in-pune/shivajinagar',

  heroH1: 'Trusted Home Dog Grooming in Shivajinagar, Pune',
  heroSubtext:
    'Central Pune dog parents choose stress-free at-home dog grooming in Shivajinagar. Experienced groomers. Clean equipment. Reliable service.',

  storySections: [
    {
      heading: 'Central Pune Dog Grooming Without the Chaos',
      subheading: 'Skip traffic, avoid crowded salons.',
      paragraphs: [
        'Shivajinagar sits at the heart of Pune, surrounded by JM Road, Deccan, Model Colony, and Pune University Road. While it is one of the city’s most vibrant and well-connected neighborhoods, traffic congestion and limited parking often make salon visits inconvenient. For dog parents living in apartments or independent homes here, at-home dog grooming provides a smarter alternative. Your dog receives personalized, one-on-one grooming attention inside a familiar environment, eliminating travel stress and exposure to unknown animals. This results in a calmer grooming session and better overall behavior from your dog.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Shivajinagar Pune',
      imageLeft: true,
    },
    {
      heading: 'Ideal for Apartments & Heritage Homes',
      subheading: 'Compact setup with complete cleanliness.',
      paragraphs: [
        'Shivajinagar features a mix of modern apartments and older residential buildings. Our grooming setup is fully portable and apartment-friendly, requiring minimal space while ensuring complete hygiene. We bring sanitized tools, professional dryers, and high-quality grooming products suited for both dogs. After every session, the area is cleaned and sanitized, ensuring zero mess inside your home. This structured and respectful approach makes our service ideal for both high-rise buildings and traditional homes in central Pune.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Compact dog grooming setup in Shivajinagar apartment',
      imageLeft: false,
    },
    {
      heading: 'Consistent Groomers for Familiarity & Trust',
      subheading: 'Your dog builds comfort over time.',
      paragraphs: [
        'Dogs thrive on familiarity. Whenever possible, we assign the same groomer for repeat bookings in Shivajinagar. Over time, your dog becomes comfortable with the groomer’s presence, touch, and grooming routine. This consistency reduces anxiety and improves cooperation during future sessions. Whether it’s routine bathing, nail trimming, or full haircut styling, your dog benefits from predictable, calm handling every time.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Gentle dog grooming in Shivajinagar',
      imageLeft: true,
    },
    {
      heading: 'Full-Service Grooming with Transparent Packages',
      subheading: 'No confusion. No hidden charges.',
      paragraphs: [
        'Our grooming packages in Shivajinagar include bathing, brushing, coat conditioning, nail clipping, ear cleaning, sanitary trim, and optional haircuts. Before beginning, our groomer evaluates your dog’s coat condition and recommends the most suitable service. We focus on hygiene, coat health, and skin comfort rather than cosmetic shortcuts. Transparent pricing and clear communication ensure dog parents feel confident and informed throughout the process.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy groomed dog in Shivajinagar Pune',
      imageLeft: false,
    },
    {
      heading: `Grooming by Breed — What Shivajinagar Pet Parents Usually Ask`,
      subheading: `Central Pune has particular taste. So do its dogs.`,
      paragraphs: [
        `Shivajinagar has some of Pune's most established pet-owning families. Many of our clients here have had dogs for eight, ten, even twelve years and have very clear views on how their pet should be handled. Some want a specific trim style they've been maintaining for years; others have senior dogs who need a slow and gentle approach. The central location also means we see a wider variety of breeds here — from compact apartment-friendly Dachshunds to large Dobermanns in the older independent homes near Model Colony.`,
        `Here's how we handle the breeds we most frequently groom in Shivajinagar:`,
      ],
      bullets: [
        `Dobermann grooming in Shivajinagar — Short coats but lots of skin sensitivity. We use a rubber curry brush to stimulate circulation, follow with a moisturising shampoo, and check paws and nails carefully since Dobermanns are prone to nail overgrowth.`,
        `Dachshund grooming in Shivajinagar — Smooth, wire, and long-haired varieties all need different approaches. Long-haired Dachshunds need careful ear and chest fur trimming. We tailor the session to whichever variety your dog belongs to.`,
        `Labrador grooming in Shivajinagar — Labs shed year-round and especially heavily in summer. Regular deshedding sessions are essential for comfort. We focus on undercoat removal and ear hygiene every time.`,
        `Shih Tzu grooming in Shivajinagar — Many owners here prefer a shorter puppy cut for Pune's warm months. We can style a full show coat or a practical short trim — whatever suits your preference and your dog's lifestyle.`,
        `Persian cat grooming in Shivajinagar — Persian coats need grooming every three to four weeks minimum. We do full detangle, undercoat removal, sanitary trim, and nail clip in every session without shortcuts.`,
        `Golden Retriever grooming in Shivajinagar — We see many senior Goldens in this neighbourhood. For older dogs we reduce drying time, avoid prolonged standing, and keep the session as calm and unhurried as possible.`,
      ],
      closingLine: `If your dog has a specific style you've always maintained, just mention it when booking and we'll follow your brief.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Breed-specific grooming at home in Shivajinagar Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/shivajinagar'),
  nearbyAreas: ['JM Road', 'Model Colony', 'Deccan Gymkhana', 'Erandwane', 'Kothrud', 'Aundh', 'Khadki', 'Pune University Road'],
};

export const shivajinagarMapEmbed =
  'https://www.google.com/maps?q=Shivajinagar,Pune&output=embed';

export const shivajinagarReviews: LocationReview[] = [
  {
    petName: 'Raja',
    ownerName: 'Sanjay Apte',
    area: 'Model Colony',
    review: 'Very systematic and professional service. Raja is not aggressive but he gets nervous around other dogs, so this home setup worked perfectly. The groomer explained each step before starting and maintained proper hygiene throughout. I appreciate the clarity and discipline in their process.',
    rating: 5,
  },
  {
    petName: 'Bruno',
    ownerName: 'Anagha Kulkarni',
    area: 'JM Road',
    review: 'I have tried multiple grooming services over the years, but this one felt more organised and respectful of our space. Bruno is older now and gets tired quickly — the groomer picked up on that without being asked. That kind of attentiveness is rare.',
    rating: 5,
  },
];

export const shivajinagarFAQs: FAQ[] = [
  {
    question: 'Is home grooming suitable for centrally located residential buildings?',
    answer: 'Yes. Our portable equipment requires minimal space and is ideal for both modern apartments and older residential structures. We ensure zero mess and controlled operation.'
  },
  {
    question: 'Can I book recurring grooming sessions?',
    answer: 'Yes, recurring appointments are available. Consistent scheduling helps maintain coat hygiene and reduces the chances of matting or skin issues.'
  },
  {
    question: 'Do you groom both small and large breeds?',
    answer: 'We groom all breed sizes, from toy breeds to large dogs. Each session is customized according to coat density, size, and temperament.'
  },
  {
    question: 'How do you ensure hygiene during the session?',
    answer: 'All tools are disinfected before and after use. Fresh towels are used for every appointment, and the working area is cleaned thoroughly once grooming is complete.'
  },
  {
    question: 'Will my pet be restrained during grooming?',
    answer: 'We use minimal and safe restraint only when necessary for safety. Our approach focuses on calm handling rather than force.'
  },
  {
    question: 'Is grooming recommended even if my pet stays indoors?',
    answer: 'Yes. Indoor dogs still shed, accumulate dirt, and develop nail overgrowth. Regular grooming ensures overall hygiene and health.'
  },
  {
    question: 'Parking is impossible on the lanes off FC Road and JM Road. Is that a problem?',
    answer: 'Not for us. Our groomers travel by two-wheeler with the whole kit in a shoulder bag, which is precisely why doorstep grooming works in the older parts of central Pune at all. No four-wheeler needs to be parked and no van needs a bay.'
  },
  {
    question: 'We live in an old wada-style building with a shared bathroom and no lift. Can you still groom here?',
    answer: 'Yes. Older central-Pune buildings are routine for us. A shared or small bathroom is workable — the groomer lays out their own mats and keeps the working area contained. The one thing worth telling us is the floor and whether there is a lift, because a large elderly dog that cannot manage three flights is better groomed on the ground floor or in a courtyard.'
  },
  {
    question: 'Do you take bookings during Ganpati week?',
    answer: 'We do, but book early. Shivajinagar and the surrounding central lanes are among the hardest areas to reach during the festival, processions close roads at short notice, and our slot capacity there tightens for that stretch. If your dog is noise-sensitive, the more useful advice is to groom before the festival rather than during it.'
  },
  {
    question: 'Can I book just a nail trim and ear clean without the full bath?',
    answer: 'Yes. A short maintenance visit for nails, ear cleaning and a paw-hair trim is available and priced below the packages — ask for it by name when you book. It is a sensible option for short-coated dogs between full sessions, and for senior dogs where a full bath is more strain than the coat actually needs.'
  },
  {
    question: 'Our flat faces a busy road and my dog is reactive to street noise. Does that affect grooming?',
    answer: 'It usually just means working in the quietest room you have rather than the one nearest the road. Central Shivajinagar flats have constant traffic noise and most dogs here are habituated to it, but a reactive dog does better with the window side shut and the dryer on the lowest setting that will still dry the coat.'
  }
];


// ════════════════════════════════════════════════════════════
// WAKAD
// ════════════════════════════════════════════════════════════

export const wakadLocation: LocationConfig = {
  name: 'Wakad',
  slug: 'dog-grooming-in-pune/wakad',

  heroH1: 'Premium At-Home Dog Grooming in Wakad for Modern Dog Parents',
  heroSubtext:
    'Live in a Wakad high-rise? Skip traffic and salon chaos. Certified groomers deliver professional dog grooming at your doorstep.',

  storySections: [
    {
      heading: 'Designed for Wakad’s Fast-Paced Lifestyle',
      subheading: 'Flexible scheduling for working professionals.',
      paragraphs: [
        'Wakad has grown into one of Pune’s most dynamic residential zones, especially for IT professionals working in Hinjewadi and Baner. Long office hours and peak-hour traffic often make grooming appointments difficult to manage. Our at-home grooming service in Wakad is structured around flexibility and convenience. Morning, afternoon, and evening slots allow you to schedule sessions without disrupting your workday. Your dog receives focused attention while you continue your daily routine comfortably.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Wakad high-rise apartment',
      imageLeft: true,
    },
    {
      heading: 'High-Rise Friendly Grooming Setup',
      subheading: 'Compact, clean and society-compliant.',
      paragraphs: [
        'Most Wakad residents live in high-rise apartment complexes and gated societies. Our equipment is portable, quiet, and optimized for apartment use. We ensure minimal water usage, controlled drying noise, and complete cleanup after every session. This ensures a smooth experience not just for your dog, but also for neighbors and building management.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Apartment grooming setup in Wakad Pune',
      imageLeft: false,
    },
    {
      heading: 'Advanced De-Shedding & Coat Care',
      subheading: 'Reduce hair fall inside your home.',
      paragraphs: [
        'Seasonal shedding can be intense, especially for breeds like Golden Retrievers, Huskies, and Labradors living in apartments. Our professional de-shedding treatments remove loose undercoat efficiently, reducing fur accumulation around your furniture and floors. Regular coat maintenance improves shine, reduces matting, and promotes healthier skin overall.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Professional dog de-shedding in Wakad',
      imageLeft: true,
    },
    {
      heading: 'Regular Grooming for Long-Term Coat Health',
      subheading: 'Structured grooming without repeated booking hassle.',
      paragraphs: [
        'Many Wakad dog parents prefer structured monthly grooming plans to maintain coat hygiene consistently. Our regular bookings ensure your dog receives regular bathing, trimming, and nail care without the need to rebook each time. Consistent grooming prevents skin infections, ear issues, and excessive shedding, ensuring long-term health and cleanliness.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy groomed dog in Wakad Pune',
      imageLeft: false,
    },
    {
      heading: `Popular Dog Breeds We Groom in Wakad — and How We Do It`,
      subheading: `IT city, IT-grade grooming precision.`,
      paragraphs: [
        `Wakad's identity has been shaped by the Hinjewadi tech corridor, and the dog ownership patterns here reflect that. We see a higher proportion of large breeds — Huskies, Golden Retrievers, Labradors — adopted by young professionals who wanted active companions for morning runs and weekend hikes. These are high-energy dogs with high-maintenance coats that need more than a quick salon bath every few months. At the same time, `,
        `Here's our breed-specific approach for the dogs we groom most regularly in Wakad:`,
      ],
      bullets: [
        `Husky grooming in Wakad — Pune's heat is genuinely hard on Huskies. We never clip or shave the double coat since doing so permanently damages it. Instead we do a proper deshedding blow-out that removes the bulk of loose undercoat and actually helps with temperature regulation.`,
        `Golden Retriever grooming in Wakad — Goldens in Wakad apartments accumulate a lot of dust in their feathering. We do a deep cleanse, conditioning, blow-dry, and a light trim of the ears, paws, and tail plume to keep things manageable between sessions.`,
        `Labrador grooming in Wakad — High-energy Labs often come in with muddy paws and dirty ears. We do a full bath, ear flush, nail trim, and paw pad check in every session.`,
        `Indie dog grooming in Wakad — We see a good number of rescued Indies in Wakad. We do a full skin and tick check, use gentle shampoo suited to their often sensitive coats, and take a calm unhurried approach throughout.`,
        `Beagle grooming in Wakad — Beagles are curious and tend to get into everything. We check for ticks and skin irritation carefully, clean those characteristic long ears thoroughly, and give them a good nail trim.`,
        `Poodle and Doodle grooming in Wakad — Curly non-shedding coats mat fast if not brushed regularly. We detangle before washing not after, and shape the coat to suit either a full teddy bear trim or a more practical shorter cut.`,
      ],
      closingLine: `We bring the right tools for your breed's coat type — no generic approach, no guesswork.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Breed-specific dog grooming at home in Wakad Pune`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/wakad'),
  nearbyAreas: ['Wakad Chowk', 'Datta Mandir Road', 'Hinjewadi', 'Tathawade', 'Pimple Saudagar', 'Balewadi', 'Baner', 'Kalewadi'],
};

export const wakadMapEmbed =
  'https://www.google.com/maps?q=Wakad,Pune&output=embed';

export const wakadReviews: LocationReview[] = [
  {
    petName: 'Leo',
    ownerName: 'Rohit Pawar',
    area: 'Wakad Chowk',
    review: 'As someone working from home, I liked that the grooming session didn’t disturb my schedule. Leo was handled confidently and gently. The haircut was neat, and the coat conditioning made his fur noticeably softer. Definitely booking again.',
    rating: 5,
  },
  {
    petName: 'Snowy',
    ownerName: 'Pallavi Patil',
    area: 'Datta Mandir Road',
    review: 'Snowy usually resists dryers, but the groomer used a controlled setting and gave small breaks in between. The session felt calm and not rushed. It’s convenient to have this level of service without stepping out of the building.',
    rating: 5,
  },
];

export const wakadFAQs: FAQ[] = [
  {
    question: 'Is home grooming practical for busy working professionals?',
    answer: 'Yes. Flexible time slots allow you to schedule grooming without disrupting work calls or office hours. The session runs independently while you continue your routine.'
  },
  {
    question: 'Do you offer de-shedding treatments for heavy-coated breeds?',
    answer: 'Yes. Our de-shedding service removes loose undercoat effectively, especially useful for breeds prone to seasonal hair fall.'
  },
  {
    question: 'How do you handle grooming in high-rise societies?',
    answer: 'We coordinate arrival timing in advance, carry portable equipment, and maintain strict cleanliness to ensure smooth sessions in apartment complexes.'
  },
  {
    question: 'Can puppies be groomed safely at home?',
    answer: 'Yes. Early grooming in a familiar environment helps puppies adapt better and reduces fear associated with grooming tools.'
  },
  {
    question: 'What if my pet is afraid of dryers?',
    answer: 'We use controlled airflow and gradual exposure techniques to keep the process comfortable.'
  },
  {
    question: 'Are monthly grooming plans available?',
    answer: 'Yes, structured maintenance plans are available for consistent coat care throughout the year.'
  },
  {
    question: 'I work in Hinjewadi and only get back late. What is your last slot?',
    answer: 'We run to 9 PM, and the last practical start for a full session is around 7 PM so the coat is properly dry before the groomer leaves. Wakad is one of our strongest areas for evening bookings precisely because of the Hinjewadi commute — those slots fill first, so book a few days ahead rather than the same evening.'
  },
  {
    question: 'Our society requires pets to be registered and asks for the service provider details. What do you give them?',
    answer: 'The groomer carries identification and we can share the groomer name and contact ahead of the visit so your society office can log it before arrival. Several large Wakad townships now do this as standard. Tell us at booking if your gate needs the details in advance and we will send them rather than have the groomer held at the entrance.'
  },
  {
    question: 'The roads here flood badly in monsoon. Do sessions get cancelled?',
    answer: 'Rarely cancelled, sometimes shifted. If the Wakad–Kalewadi stretch or the Dange Chowk approach is genuinely waterlogged we will call and move the slot rather than have a groomer arrive drenched with wet equipment. What we will not do is arrive late without telling you and then rush the session.'
  },
  {
    question: 'We have an imported breed that was groomed differently abroad. Can you match that?',
    answer: 'Send a photograph of the previous clip when you book — it communicates far better than a breed-standard name does. Wakad has a lot of dogs that came with families relocating, and coats like Bichons, Cockers and Standard Poodles carry very different house styles. If a style is not achievable on the current coat length we will say so before starting rather than halfway through.'
  },
  {
    question: 'Can I book only the deshedding treatment without a haircut?',
    answer: 'Yes. For double-coated dogs in a Wakad high-rise, deshedding is usually the thing actually solving your problem — fur on furniture — and a haircut does nothing for it. A deshedding blow-out with the bath is the standard combination we would suggest, and it is the one service where the difference is visible on the floor by the end.'
  }
];

// ════════════════════════════════════════════════════════════
// PIMPRI–CHINCHWAD
// ════════════════════════════════════════════════════════════

export const pimpriChinchwadLocation: LocationConfig = {
  name: 'Pimpri-Chinchwad',
  slug: 'dog-grooming-in-pune/pimpri-chinchwad',

  heroH1: 'Reliable Home Dog Grooming Across Pimpri–Chinchwad (PCMC)',
  heroSubtext:
    `From Nigdi to Pimple Saudagar — professional dog grooming at home in Pimpri–Chinchwad. Safe handling, clean setup, punctual service.`,

  storySections: [
    {
      heading: 'Doorstep Grooming for Large PCMC Residential Communities',
      subheading: 'Skip traffic, save time, reduce pet stress.',
      paragraphs: [
        'Pimpri–Chinchwad is spread across multiple large residential sectors including Nigdi, Akurdi, Chinchwad, Ravet, and Pimple Saudagar. With busy roads and long internal commutes, traveling to a grooming salon can consume significant time. Our at-home dog grooming service across PCMC eliminates that hassle completely. Instead of navigating traffic, your dog receives professional care right inside your home. This reduces travel anxiety, prevents exposure to unfamiliar animals, and ensures focused one-on-one grooming attention.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Pimpri Chinchwad apartment',
      imageLeft: true,
    },
    {
      heading: 'Ideal for Working Families & Busy Schedules',
      subheading: 'Flexible slots across PCMC zones.',
      paragraphs: [
        'Many families in Pimpri–Chinchwad have dual working professionals balancing tight schedules. Our grooming slots are structured to accommodate mornings, afternoons, and weekends, ensuring convenience without disruption. You don’t have to take time off work or rearrange your day. Our groomer arrives within the confirmed window and completes the session efficiently while maintaining complete hygiene and professionalism.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Dog grooming setup in PCMC home',
      imageLeft: false,
    },
    {
      heading: 'Complete Coat, Skin & Hygiene Care',
      subheading: 'More than just a bath.',
      paragraphs: [
        'Our PCMC grooming packages include deep cleansing baths, coat brushing, nail trimming, ear cleaning, sanitary trimming, and optional haircuts. De-shedding treatments are especially popular among Labrador and Indie owners across Pimpri–Chinchwad due to seasonal hair fall. Regular grooming not only improves appearance but also prevents skin infections, matting, and hygiene-related issues that can develop over time.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Dog de-shedding treatment in Pimpri Chinchwad',
      imageLeft: true,
    },
    {
      heading: 'Serving All Major PCMC Localities',
      subheading: 'Wide regional coverage.',
      paragraphs: [
        'We provide home dog grooming across Pimpri, Chinchwad, Nigdi, Akurdi, Pimple Saudagar, Ravet, Thergaon, and surrounding areas. Our goal is to make professional grooming accessible across the entire PCMC belt, ensuring dogs receive high-quality care without distance being a barrier.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy dog after grooming in PCMC',
      imageLeft: false,
    },
    {
      heading: `Dog Breeds We Regularly Groom Across Pimpri-Chinchwad`,
      subheading: `From Nigdi to Pimple Saudagar — we know the dogs here.`,
      paragraphs: [
        `PCMC covers a huge residential spread and the dog ownership here is genuinely diverse. In the older sectors like Nigdi and Akurdi, you find a lot of large independent-natured breeds — Dobermanns, German Shepherds, Saint Bernards — that families have kept for years. In the newer high-rises of Pimple Saudagar and Ravet, the pattern shifts toward smaller apartment-friendly breeds and more apartment-friendly breeds. What stays consistent across all of PCMC is that dog parents here are practical and value-conscious.`,
        `Here's a look at the breeds we most often groom across Pimpri-Chinchwad:`,
      ],
      bullets: [
        `German Shepherd grooming in Pimpri-Chinchwad — Double coats and heavy seasonal shedding are the main challenge. We do a full deshedding treatment — brush-out, deshedding shampoo, high-velocity blow-dry — that removes far more loose coat than a regular bath ever would.`,
        `Saint Bernard grooming in Pimpri-Chinchwad — One of the most demanding grooming jobs in terms of time and coat volume. We work methodically through the coat in sections, paying special attention to areas behind the ears and under the legs where matting starts first.`,
        `Dobermann grooming in Pimpri-Chinchwad — Short sleek coats that need less styling but more skin attention. We check for dryness, irritation, and nail length — Dobermanns often have nails that grow faster than owners realise.`,
        `Labrador grooming in Pimpri-Chinchwad — Labs in PCMC live active lives and pick up a lot of dust and allergens. We use a thorough cleansing routine and always include an ear flush, since Labs are prone to ear infections.`,
        `Indie dog grooming in Pimpri-Chinchwad — A large portion of our PCMC bookings are for rescued Indies. We approach each one calmly, do a full skin and tick check, and use gentle products suited to their often sensitive coats.`,
        `Poodle and Doodle grooming in Pimpri-Chinchwad — Long-haired breeds in PCMC apartments often develop matting around the hindquarters and behind the ears. We address matting safely — patient detangling rather than immediately reaching for clippers.`,
      ],
      closingLine: `Whatever your dog's breed or mix, we adapt the session to what their coat actually needs that day.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Breed-specific dog grooming at home in Pimpri Chinchwad`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/pimpri-chinchwad'),
  nearbyAreas: ['Nigdi', 'Akurdi', 'Chinchwad', 'Pimple Saudagar', 'Kalewadi', 'Ravet', 'Thergaon', 'Bhosari'],
};

export const pimpriChinchwadMapEmbed =
  'https://www.google.com/maps?q=Pimpri-Chinchwad,Pune&output=embed';

export const pimpriChinchwadReviews: LocationReview[] = [
  {
    petName: 'Shera',
    ownerName: 'Ganesh More',
    area: 'Nigdi',
    review: 'Driving across PCMC traffic for grooming was always exhausting. This service solved that completely. Shera is a large dog, and they handled him confidently without making him uncomfortable. The coat brushing was thorough and well done.',
    rating: 5,
  },
  {
    petName: 'Max',
    ownerName: 'Archana Khandekar',
    area: 'Chinchwad',
    review: 'My dog gets anxious around strangers, but the groomer approached her slowly and patiently. There was no forceful handling. The entire process felt thoughtful and safe. I’m genuinely impressed with the professionalism.',
    rating: 5,
  },
];

export const pimpriChinchwadFAQs: FAQ[] = [
  {
    question: 'Do you travel across multiple residential sectors for grooming?',
    answer: 'Yes. Our service covers a wide residential belt, and we schedule appointments efficiently to ensure timely arrival across different neighborhoods.'
  },
  {
    question: 'Is at-home grooming safe for large breeds?',
    answer: 'Yes. Large breeds are groomed with proper handling techniques and appropriate equipment suited to their size and coat type.'
  },
  {
    question: 'Can regular grooming improve skin health?',
    answer: 'Absolutely. Routine brushing, bathing, and coat maintenance reduce dirt buildup and help identify early signs of irritation or infection.'
  },
  {
    question: 'How should I prepare my pet before the session?',
    answer: 'Ensure your dog has had a short walk or bathroom break. Keeping them slightly relaxed before the session improves cooperation.'
  },
  {
    question: 'Is grooming suitable for dogs that dislike travel?',
    answer: 'Yes. Dogs that resist car rides usually respond better when groomed at home.'
  },
  {
    question: 'Do you provide haircut styling?',
    answer: 'Yes. Full haircut styling is available based on breed requirements and coat condition.'
  },
  {
    question: 'The air here carries industrial dust. Does that need a different approach?',
    answer: 'It needs more thorough rinsing than a coat from central Pune does. Particulate from the industrial belt settles close to the skin and a single lather does not lift it — our groomers double-lather where the coat is visibly dull and pay particular attention to the chest and belly, which collect the most. It is also why we would not stretch a PCMC dog to twelve weeks between baths.'
  },
  {
    question: 'Do you cover Akurdi, Nigdi and Bhosari as well as Pimpri and Chinchwad?',
    answer: 'Yes, the whole PCMC belt including Akurdi, Nigdi, Bhosari, Dapodi and the Chinchwad gaon side. It is a large area, so slot timing is worth confirming at booking — a groomer covering Nigdi in the morning and Bhosari in the afternoon needs realistic gaps between visits, and we would rather give you an honest window.'
  },
  {
    question: 'I work rotational shifts. Can I get an unusual slot?',
    answer: 'Within our 9 AM to 9 PM window, yes, and shift workers are a normal booking here. What we cannot do is send a groomer at 6 AM or overnight. If your off-day falls midweek that actually works in your favour — midweek daytime slots in PCMC are the easiest ones to get at short notice.'
  },
  {
    question: 'We live in an older chawl-style building with no lift and a small bathroom. Is that workable?',
    answer: 'It is, and it is a common setup across Pimpri and Chinchwad gaon. The groomer works with what the space allows and lays out their own mats. For a large dog on an upper floor without a lift, the practical question is whether the dog manages the stairs comfortably rather than whether we can work in the flat — if not, the ground floor or a courtyard is the better call.'
  },
  {
    question: 'Our building water supply comes on a schedule. How do we plan the slot around it?',
    answer: 'Either book inside the supply window or keep three or four buckets filled beforehand. A session needs surprisingly little — the wash and rinse stages are about twenty minutes of the visit. Tell the groomer on arrival that you are on stored water and they will plan the rinse accordingly rather than assuming a running tap.'
  }
];

// ════════════════════════════════════════════════════════════
// KONDHWA
// ════════════════════════════════════════════════════════════

export const kondhwaLocation: LocationConfig = {
  name: 'Kondhwa',
  slug: 'dog-grooming-in-pune/kondhwa',

  heroH1: 'Premium At-Home Dog Grooming in Kondhwa',
  heroSubtext:
    'Professional dog grooming across Kondhwa and surrounding premium societies. Calm environment. Skilled groomers. Exceptional care.',

  storySections: [
    {
      heading: 'Designed for Kondhwa’s Premium Residential Communities',
      subheading: 'Refined service for refined living.',
      paragraphs: [
        'Kondhwa is known for its upscale gated communities, spacious apartments, and peaceful residential surroundings. Dog parents here value structured, high-quality services that match their lifestyle. Our at-home dog grooming in Kondhwa delivers a salon-grade experience without requiring you to step outside. By grooming your dog inside a familiar environment, we eliminate unnecessary stress and ensure a calm, comfortable session from start to finish.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Premium home dog grooming in Kondhwa',
      imageLeft: true,
    },
    {
      heading: 'Special Care for Small & Long-Haired Breeds',
      subheading: 'Gentle handling for dogs that need it most.',
      paragraphs: [
        'Many Kondhwa households have Shih Tzus, Toy breeds, and long-haired dogs that require delicate handling and detailed coat care. Our groomers are trained to manage long-haired coats, matting issues, and sensitive skin conditions with patience and precision. We use skin-safe shampoos and controlled drying techniques to ensure maximum comfort for your dog.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Cat grooming session in Kondhwa Pune',
      imageLeft: false,
    },
    {
      heading: 'Advanced Coat Conditioning & Skin Health',
      subheading: 'Hydration and shine that lasts.',
      paragraphs: [
        'Indoor apartment living can sometimes lead to dry skin and dull coats. Our advanced grooming packages in Kondhwa include coat conditioning masks, moisturizing treatments, and de-shedding care designed to improve long-term coat health. Regular sessions help maintain shine, reduce itching, and prevent coat matting.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Dog spa treatment in Kondhwa',
      imageLeft: true,
    },
    {
      heading: 'Professional, Discreet & Hygienic Setup',
      subheading: 'Respecting your home environment.',
      paragraphs: [
        'We understand the importance of cleanliness in premium residential societies. Our grooming station is compact, sanitized before and after every visit, and designed to minimize noise and mess. We ensure a respectful, organized setup that aligns with society rules and maintains the comfort of your home.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy groomed dog in Kondhwa Pune',
      imageLeft: false,
    },
    {
      heading: `Breed-Tailored Grooming for Kondhwa's Discerning Dog Families`,
      subheading: `Premium homes, premium dogs, premium grooming.`,
      paragraphs: [
        `The dogs we meet in Kondhwa's gated communities tend to be well-cared-for and their owners are well-informed. Many have already done research on their breed's grooming requirements and come to us with specific expectations — a Shih Tzu owner who knows the exact trim length they want, a Lhasa Apso owner who has had bad experiences with rushed grooming elsewhere, a Golden Retriever family asking about coat conditioning options. We welcome that. It makes for better sessions because we're aligned from the start rather than guessing what the client wants.`,
        `The breeds we groom most in Kondhwa, and what makes each one different:`,
      ],
      bullets: [
        `Shih Tzu grooming in Kondhwa — Kondhwa's Shih Tzu owners often maintain longer show-style coats. We take extra time to work through tangles from tip to root, use a coat-strengthening conditioner, and wrap the topknot cleanly. If you prefer a puppy cut, we do that equally well.`,
        `Lhasa Apso grooming in Kondhwa — Floor-length coats need careful parting, regular trimming around the eyes and muzzle, and consistent conditioning to avoid breakage. We treat the coat gently throughout every step.`,
        `Golden Retriever grooming in Kondhwa — Many Kondhwa Goldens live sedentary apartment lives, which means their coats can get dull and their ear canals can become waxy. We deep-condition the coat, flush the ears, and finish with a proper blow-dry that restores the natural shine.`,
        `Toy Breed grooming in Kondhwa including Maltese, Bichon, and Toy Poodle — These fine-coated breeds need careful handling. We use the softest slicker brushes, work slowly, and style to the breed standard or your personal preference.`,
        `Saint Bernard grooming in Kondhwa — Longer-coated Saints need regular coat management to prevent matting, especially behind the ears and under the legs. We work section by section and never rush the drying.`,
      ],
      closingLine: `For premium breeds and long-haired coats, please book in advance — these sessions require more time and we keep our schedule manageable to maintain quality.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Premium breed-specific pet grooming at home in Kondhwa Pune`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/kondhwa'),
  nearbyAreas: ['NIBM Road', 'Wanowrie', 'Salunke Vihar', 'Undri', 'Mohammed Wadi', 'Bibewadi', 'Katraj', 'Camp'],
};

export const kondhwaMapEmbed =
  'https://www.google.com/maps?q=Kondhwa,Pune&output=embed';

export const kondhwaReviews: LocationReview[] = [
  {
    petName: 'Simba',
    ownerName: 'Faizan Shaikh',
    area: 'NIBM Road',
    review: `The grooming felt premium and well-organized. Simba’s coat was properly brushed out before bathing, and the finishing was neat. What stood out to me was the cleanliness — they sanitized everything and left the area spotless.`,
    rating: 5,
  },
  {
    petName: 'Coco',
    ownerName: 'Reshma Inamdar',
    area: 'Salunke Vihar',
    review: 'Coco is a Shih Tzu and matting is always a concern. The groomer handled her long coat carefully without pulling or rushing. She looked comfortable even during drying — which tells me they know what they\'re doing with long-haired breeds.',
    rating: 5,
  },
];

export const kondhwaFAQs: FAQ[] = [
  {
    question: 'Is your grooming service suitable for gated residential communities?',
    answer: 'Yes. Our compact setup and structured scheduling make it ideal for organized residential complexes.'
  },
  {
    question: 'Do you handle long-haired breeds carefully?',
    answer: 'Yes. Long coats require gentle brushing, detangling, and moisture balance. We follow a careful process to avoid discomfort.'
  },
  {
    question: 'What if my pet has minor matting?',
    answer: 'We assess matting severity and recommend safe detangling or trimming methods to prevent skin injury.'
  },
  {
    question: 'Are skin-friendly shampoos used?',
    answer: 'Yes. Products are selected based on coat type and sensitivity to ensure safe application.'
  },
  {
    question: 'Can I stay present during grooming?',
    answer: 'Yes, you are welcome to observe the session while allowing the groomer adequate working space.'
  },
  {
    question: 'How often should grooming be scheduled for small breeds?',
    answer: 'Small and long-haired breeds usually benefit from grooming every 3–5 weeks.'
  },
  {
    question: 'Do you cover the NIBM Road side and the Undri end as well as Kondhwa Khurd and Budruk?',
    answer: 'Yes, all of it — Kondhwa Khurd, Kondhwa Budruk, the NIBM Road corridor and out toward Undri and Mohammed Wadi. It is a spread-out area with several societies sharing similar names, so a location pin at booking saves the groomer a phone call from your gate.'
  },
  {
    question: 'Can you groom a large breed inside a flat, or does it need outdoor space?',
    answer: 'A flat is fine. A large dog needs room to stand and turn, not a lawn — the bathroom for the wash and any clear floor for the dry and trim is enough. What genuinely helps with a big double-coated dog in an apartment is doing the deshedding stage on a balcony if you have one, simply because it contains the volume of loose undercoat.'
  },
  {
    question: 'Power cuts are common in our area. What happens if the electricity goes mid-session?',
    answer: 'The dryer is the only part that needs power, so a cut pauses the session rather than ending it. If your building has an inverter, tell the groomer which sockets are backed up — that is usually enough to keep the dryer running. A dog left part-dried is the one outcome we will not accept, so if power is genuinely out we towel-dry thoroughly and wait.'
  },
  {
    question: 'Do your groomers speak Marathi and Hindi?',
    answer: 'Yes. Our groomers work in Marathi, Hindi and functional English, and Kondhwa is a mixed enough area that all three come up in a normal week. If an elderly family member will be handling the visit rather than you, tell us and we will make sure the groomer and the household have a shared language for the instructions that matter.'
  },
  {
    question: 'Is it harder to get a booking around festivals and long weekends?',
    answer: 'Yes, noticeably. Eid, Diwali and long weekends are when everyone wants the dog looking presentable on the same two days, and those slots go about a week in advance across Kondhwa and NIBM. If your dog is on a regular cycle, booking the next session before the groomer leaves is the simplest way to avoid the crush.'
  }
];

// ════════════════════════════════════════════════════════════
// NIBM
// ════════════════════════════════════════════════════════════

export const nibmLocation: LocationConfig = {
  name: 'NIBM',
  slug: 'dog-grooming-in-pune/nibm',

  heroH1: 'Premium Home Dog Grooming in NIBM',
  heroSubtext:
    'Live near NIBM Road or Clover Hills? Experience refined, stress-free dog grooming at home. Professional grooming with wellness-focused care.',

  storySections: [
    {
      heading: 'Grooming That Matches NIBM’s Premium Lifestyle',
      subheading: 'Refined service for refined residential living.',
      paragraphs: [
        'NIBM is one of Pune’s most premium residential corridors, known for its peaceful environment, gated societies, and upscale apartment complexes. Dog parents here expect quality, professionalism, and structured service experiences. Our at-home dog grooming in NIBM is designed to align perfectly with that standard. Instead of taking your dog through traffic or waiting in crowded salons, we bring a complete professional grooming setup directly to your home. This ensures your dog remains relaxed in a familiar space while receiving salon-grade care with personalized attention.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Premium home dog grooming in NIBM Pune',
      imageLeft: true,
    },
    {
      heading: 'Wellness-Focused Grooming Approach',
      subheading: 'Because grooming is about health, not just appearance.',
      paragraphs: [
        'In apartment living environments like NIBM, dogs often spend more time indoors, which can lead to coat dullness, dry skin, and seasonal shedding issues. Our grooming sessions focus on coat health, skin hydration, and preventive hygiene. We assess coat density, shedding patterns, and skin sensitivity before starting the session. Deep cleansing baths, moisturizing conditioners, de-shedding treatments, and gentle drying techniques ensure long-term coat health rather than just temporary cosmetic results.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Dog coat conditioning treatment in NIBM',
      imageLeft: false,
    },
    {
      heading: 'Perfect for Long-Haired & Designer Breeds',
      subheading: 'Precision trims and coat management.',
      paragraphs: [
        'Many households in NIBM own long-haired breeds such as Shih Tzus, Golden Retrievers, and Poodles. These breeds require regular brushing, coat trimming, and mat prevention to maintain hygiene and comfort. Our groomers specialize in breed-specific grooming techniques, ensuring trims are balanced, sanitary areas are clean, and coat length suits both aesthetics and practicality. Controlled drying and careful brushing prevent unnecessary coat breakage and discomfort.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Shih Tzu grooming session in NIBM Pune',
      imageLeft: true,
    },
    {
      heading: 'Discreet, Clean & Society-Friendly Setup',
      subheading: 'Minimal disturbance. Maximum professionalism.',
      paragraphs: [
        'We understand that NIBM societies maintain strict hygiene and operational standards. Our grooming equipment is compact, quiet, and easy to set up in balconies, bathrooms, or designated areas. Every tool is sanitized before and after use. We ensure complete cleanup post-session, leaving your home exactly as it was. This structured and respectful approach has made us a trusted home dog grooming service across NIBM and nearby areas.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy groomed dog in NIBM Pune apartment',
      imageLeft: false,
    },
    {
      heading: `Grooming the Breeds That Call NIBM Home`,
      subheading: `Wellness-first grooming — designed around your dog's coat.`,
      paragraphs: [
        `NIBM Road and its surrounding communities — Clover Hills, Salunke Vihar, Wanowrie — have a noticeably health-conscious dog ownership culture. People here track their dog's diet, vaccinations, and vet visits carefully, and they apply that same attention to grooming. What they often tell us is that previous salon experiences felt rushed or impersonal — their dog was handed back looking clean but the owner wasn't sure what had actually been done. Our approach at NIBM is to treat grooming as a wellness service, not a cosmetic one.`,
        `The breeds we see most at NIBM, and our specific approach to each:`,
      ],
      bullets: [
        `Shih Tzu grooming in NIBM — We do a coat health assessment before every session. If there's matting, we address it safely. If the coat is healthy, we maintain it with conditioning and a precise trim. We never rush Shih Tzu sessions — the face, ears, and paw trims all require careful attention.`,
        `Golden Retriever grooming in NIBM — Many NIBM Goldens have excellent coats because their owners are diligent. We support that with a deep-conditioning bath, deshedding treatment, and a careful trim of the paws, ears, and tail plume.`,
        `Labrador grooming in NIBM — We focus on ear hygiene and coat density. Labs with floppy ears need regular ear cleaning to prevent moisture buildup. We include this in every session as standard.`,
        `Lhasa Apso grooming in NIBM — Long floor-length coats that need careful parting, eye and muzzle trimming, and regular conditioning. We work through the coat patiently — never rushing a breed that responds badly to being rushed.`,
        `Poodle and Doodle grooming in NIBM — Curly coats are prone to matting if not brushed every few days. We work out any existing mats before washing, shape the coat post-bath, and give specific brushing advice for at-home maintenance between sessions.`,
        `Indie dog grooming in NIBM — We treat every Indie with the same thoroughness as any purebred. Tick and skin check, full bath with appropriate shampoo, nail trim, and ear clean. No shortcuts.`,
      ],
      closingLine: `After every session we give you a brief coat report — what we noticed, what we did, and when to book next for optimal coat health.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Wellness-focused breed grooming at home in NIBM Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/nibm'),
  nearbyAreas: ['Clover Hills', 'Salunke Vihar', 'Wanowrie', 'Kondhwa', 'Mohammed Wadi', 'Undri', 'Bibewadi', 'Camp'],
};

export const nibmMapEmbed =
  'https://www.google.com/maps?q=NIBM%20Road,Pune&output=embed';

export const nibmReviews: LocationReview[] = [
  {
    petName: 'Oreo',
    ownerName: 'Aditi Ranade',
    area: 'Clover Hills',
    review: 'The session felt structured and detail-oriented from start to finish. Oreo’s coat was conditioned properly and the trim looked balanced, not uneven like some salon cuts we’ve had before. Very refined experience overall.',
    rating: 5,
  },
  {
    petName: 'Max',
    ownerName: 'Sameer Kulkarni',
    area: 'NIBM Road',
    review: 'I appreciated how they assessed Max’s coat before starting instead of jumping straight into bathing. The attention to detail shows they understand grooming beyond just surface cleaning.',
    rating: 5,
  },
];

export const nibmFAQs: FAQ[] = [
  {
    question: 'Do you provide premium grooming experiences at home?',
    answer: 'Yes. Our grooming sessions are structured, detailed, and focused on coat health, hygiene, and overall wellness rather than quick cosmetic results.'
  },
  {
    question: 'Is your service suitable for show-quality or designer breeds?',
    answer: 'Yes. Breed-specific trimming, coat shaping, and precision grooming are available for long-haired and designer breeds.'
  },
  {
    question: 'Do you offer conditioning treatments?',
    answer: 'Yes. Hydration masks and coat conditioning options are available to improve shine and reduce dryness.'
  },
  {
    question: 'How do you maintain hygiene during grooming?',
    answer: 'All tools are sanitized, fresh towels are used, and the area is cleaned after completion.'
  },
  {
    question: 'Can I set up a recurring grooming plan?',
    answer: 'Yes. Structured maintenance plans ensure consistent coat care and hygiene.'
  },
  {
    question: 'Is the service discreet and quiet?',
    answer: 'Yes. Our equipment is designed to operate smoothly without creating unnecessary disturbance.'
  },
  {
    question: 'Do you cover Undri, Mohammed Wadi and the townships off NIBM Road?',
    answer: 'Yes — the NIBM Road spine, Undri, Mohammed Wadi and the large gated townships on either side. Several of these have multiple phases with the same name, so mention your phase or tower at booking. It is the single most common reason a groomer arrives at the right society and the wrong gate.'
  },
  {
    question: 'Our township requires a gate pass for service visits. How do we arrange that?',
    answer: 'Tell us at booking and we will send you the groomer name and phone number ahead of the slot so you can raise the pass in advance. Most NIBM townships accept a resident-approved entry on the app or intercom. Without it the groomer waits at the gate, which eats into your slot rather than ours.'
  },
  {
    question: 'How do you care for an imported or long-coated breed that mats easily?',
    answer: 'Line brushing rather than surface brushing, section by section, down to the skin — a surface comb glides over a coat that is already knitting underneath and tells you nothing. For coats like Bichons, Cockers and Shih Tzus we work the friction points first: behind the ears, the armpits, under the collar and around a harness line. Those four places account for most of the matting we find.'
  },
  {
    question: 'I need my dog prepared ahead of a show or a photo shoot. How should I time it?',
    answer: 'Book the session three to five days before, not the day before. A freshly clipped coat sits slightly stiff and a bath strips some of the natural oil that gives a coat its lie and shine — both settle within a few days. Tell us it is for a show at booking so the groomer works to the coat length the ring needs rather than a practical house trim.'
  },
  {
    question: 'I travel often. Can my house staff or the security desk handle the session?',
    answer: 'Yes, provided you have told us in advance who will be present and they can reach you by phone. Someone who knows the dog needs to be in the house. What we ask is that any decision that changes the dog — a clip-down for matting, skipping a step because the dog is distressed — is confirmed with you directly, not with a staff member on your behalf.'
  }
];

// ════════════════════════════════════════════════════════════
// KOTHRUD
// ════════════════════════════════════════════════════════════

export const kothrudLocation: LocationConfig = {
  name: 'Kothrud',
  slug: 'dog-grooming-in-pune/kothrud',

  heroH1: `Comfort First Dog Grooming in Kothrud — At Your Home`,
  heroSubtext:
    `From Paud Road to Karve Nagar — trusted dog grooming delivered at home in Kothrud. Calm handling. Detailed care. Reliable service.`,

  storySections: [
    {
      heading: 'Serving One of Pune’s Most Established Areas',
      subheading: 'Reliable service for long-term dog families.',
      paragraphs: [
        'Kothrud is known for its established residential communities and family-oriented culture. Many households here have senior dogs or long-term companions who require consistent grooming routines. Our at-home service ensures stability, familiarity, and calm handling for dogs who may not respond well to noisy salon environments.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Dog grooming in Kothrud home',
      imageLeft: true,
    },
    {
      heading: 'Practical Grooming for Everyday Hygiene',
      subheading: 'Prevent matting and skin issues.',
      paragraphs: [
        'Regular grooming prevents coat matting, ear infections, and nail overgrowth. Our structured grooming sessions help maintain hygiene year-round, especially during dusty seasons in Kothrud.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Dog bathing in Kothrud',
      imageLeft: false,
    },
    {
      heading: 'Low-Stress Setup for Senior Dogs',
      subheading: 'Gentle and patient approach.',
      paragraphs: [
        'Senior dogs require extra care. We move at a slower pace, allow frequent breaks, and use controlled drying techniques to ensure maximum comfort.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Senior dog grooming in Kothrud',
      imageLeft: true,
    },
    {
      heading: 'Wide Coverage Across Kothrud',
      subheading: 'Karve Nagar to Bavdhan.',
      paragraphs: [
        'We serve all major pockets including Karve Nagar, Warje, Bavdhan, Erandwane, and Paud Road, ensuring reliable doorstep grooming throughout Kothrud.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy groomed pet in Kothrud',
      imageLeft: false,
    },
    {
      heading: `Breed-Specific Grooming for Kothrud's Long-Standing Pet Families`,
      subheading: `Some of Pune's most loyal dog owners live here.`,
      paragraphs: [
        `Kothrud is one of Pune's most established residential areas, and it shows in how people keep their dogs. Many of our Kothrud clients have had dogs for eight to fifteen years — some are on their second or third dog of the same breed, and they know exactly what their pet needs. Senior dogs are particularly common here, and grooming a twelve-year-old Labrador requires a very different approach than grooming a two-year-old. We move at the dog's pace, take breaks freely, and never prioritise speed over comfort.`,
        `The breeds we regularly groom in Kothrud and how we handle each one:`,
      ],
      bullets: [
        `Labrador grooming in Kothrud — Many of our Kothrud Labradors are senior dogs. We use a non-slip mat, keep the session calm and unhurried, avoid prolonged standing, and do a thorough paw check since older Labs can develop calluses.`,
        `Indian Spitz grooming in Kothrud — A breed that's been in Pune homes for decades. Long double coats need regular deshedding especially in summer. We do a thorough blow-out followed by a light trim around the paws and ears.`,
        `Pomeranian grooming in Kothrud — Kothrud Pomeranians are often beloved family dogs with strong opinions about being groomed. We take a patient trust-building approach — letting the dog settle before starting and working at a pace they're comfortable with.`,
        `German Shepherd grooming in Kothrud — Large, double-coated, and often strong-willed. We handle GSDs confidently and calmly. The focus is always on undercoat removal that actually makes them comfortable in Pune's heat.`,
        `Dachshund grooming in Kothrud — Long-haired Dachshunds especially need ear and underbelly fur management. We trim carefully around the chest and ears and keep the coat clean and free-flowing.`,
        `Indie dog grooming in Kothrud — Kothrud has a strong culture of adopting Indies. We approach each rescued dog with patience, do a full skin and tick check, and use gentle products suitable for their often sensitive skin.`,
      ],
      closingLine: `For senior dogs especially, please mention your dog's age and any mobility issues when booking so we can plan the session accordingly.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Senior and breed-specific dog grooming at home in Kothrud Pune`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/kothrud'),
  nearbyAreas: ['Karve Nagar', 'Bavdhan', 'Warje', 'Erandwane', 'Paud Road', 'Dahanukar Colony', 'Shivajinagar', 'Anand Nagar'],
};

export const kothrudMapEmbed =
  'https://www.google.com/maps?q=Kothrud,Pune&output=embed';

export const kothrudReviews: LocationReview[] = [
  {
    petName: 'Bunny',
    ownerName: 'Deepak Kulkarni',
    area: 'Karve Nagar',
    review: 'Bunny is a senior dog and doesn’t like too much movement. The groomer moved slowly and allowed small breaks. It felt thoughtful and patient rather than mechanical. That made a big difference for us.',
    rating: 5,
  },
  {
    petName: 'Roxy',
    ownerName: 'Minal Joshi',
    area: 'Paud Road',
    review: 'The entire process was calm and organized. No rushing, no loud behavior. Roxy’s coat looked cleaner and lighter after the session. I liked that they explained what they were doing at each step.',
    rating: 5,
  },
];

export const kothrudFAQs: FAQ[] = [
  {
    question: 'Is home grooming beneficial for senior dogs?',
    answer: 'Yes. Older dogs are more comfortable when groomed in familiar surroundings, avoiding stressful travel and loud salon environments.'
  },
  {
    question: 'Can regular grooming prevent health issues?',
    answer: 'Routine sessions help detect early signs of ear infections, skin irritation, and nail overgrowth before they worsen.'
  },
  {
    question: 'Do you groom both cats and dogs?',
    answer: 'Yes. We provide complete grooming solutions for both species with techniques adapted to their temperament.'
  },
  {
    question: 'What if my pet resists grooming?',
    answer: 'We follow a calm, patient approach and allow breaks to build trust gradually.'
  },
  {
    question: 'How much space is required for setup?',
    answer: 'A small balcony or bathroom area with water access is usually sufficient.'
  },
  {
    question: 'Do you provide haircut styling services?',
    answer: 'Yes. Customized haircut styles are available based on breed standards and owner preferences.'
  },
  {
    question: 'Many buildings here are older walk-ups. Does a fourth-floor flat with no lift work?',
    answer: 'For most dogs, yes — the groomer carries a shoulder kit, not equipment that needs a lift. The question is your dog, not the stairs for us. A heavy or arthritic dog that struggles with four flights should not be brought down and up for a bath, so if that is the situation we would rather work in a ground-floor space or a neighbour\'s courtyard.'
  },
  {
    question: 'How does booking work during Ganpati and the festival weeks?',
    answer: 'Book at least a week ahead. Kothrud fills early and the roads around Karve Road and Paud Road become genuinely unpredictable during processions, which affects our ability to hold slot timings. If your dog is noise-sensitive, a session in the quiet week before the festival is far kinder than one during it.'
  },
  {
    question: 'What is the best slot to avoid Paud Road and Karve Road traffic?',
    answer: 'Late morning, roughly 11 AM to 1 PM, is the most reliable window for a groomer to reach Kothrud on time. Peak morning and the 6 to 8 PM stretch are where slot timings slip most, and we would rather book you into a window we can actually hold than promise a 7 PM arrival and call you at 7:20.'
  },
  {
    question: 'We adopted an indie who is nervous around new people. How do you start with a dog like that?',
    answer: 'Slowly, and often without touching the dog at all for the first several minutes. The groomer sits, lets the dog approach and inspect the kit, and starts with the least invasive handling — usually a brush along the back rather than paws or ears. A first session with a rescue may not complete everything, and we would rather do eighty percent calmly than all of it by force.'
  },
  {
    question: 'Our water comes at fixed hours. Should we book around that?',
    answer: 'It helps, but it is not essential. The wash and rinse stages together are around twenty minutes of the visit, so four filled buckets cover a medium dog comfortably. Just tell the groomer on arrival so they are rinsing from stored water deliberately rather than discovering the tap is dry mid-lather.'
  }
];


// ════════════════════════════════════════════════════════════
// KALYANI NAGAR
// ════════════════════════════════════════════════════════════

export const kalyaniNagarLocation: LocationConfig = {
  name: 'Kalyani Nagar',
  slug: 'dog-grooming-in-pune/kalyani-nagar',

  heroH1: `At-Home Dog Grooming in Kalyani Nagar — Zero Commute, Full Care`,
  heroSubtext:
    `In one of Pune's most connected and cosmopolitan neighbourhoods, your dog deserves grooming that matches the standard of where you live. Sniffy brings it home.`,

  storySections: [
    {
      heading: `Grooming for Kalyani Nagar's Discerning Pet Parents`,
      subheading: 'Urban lifestyle, tailored pet care.',
      paragraphs: [
        `Kalyani Nagar sits at the intersection of Pune's corporate culture and cosmopolitan living. IT professionals, expats, and established families all call this neighbourhood home, and so do their dogs. What ties these pet parents together is an expectation of quality — they want services that are structured, professional, and respectful of their time. At-home dog grooming in Kalyani Nagar is the natural fit. No detours in evening traffic, no anxious dogs waiting in a cage at a busy salon. Just a trained groomer arriving at your door with everything needed for a thorough, calm session.`
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Kalyani Nagar Pune',
      imageLeft: true,
    },
    {
      heading: 'One-on-One Attention in a Familiar Environment',
      subheading: 'Your home is the calmest grooming space possible.',
      paragraphs: [
        `Salon environments are inherently chaotic for dogs — unknown scents, other animals, unfamiliar handlers. In Kalyani Nagar's apartment-dense blocks and gated complexes, the contrast of a quiet home session is significant. Your dog is on home turf. The groomer's entire focus is on your dog alone. No multitasking, no waiting for a dryer to free up. Just a methodical, one-on-one session that goes at the pace your dog is comfortable with. This produces visibly calmer dogs and far better grooming results.`
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Professional groomer working with dog in Kalyani Nagar',
      imageLeft: false,
    },
    {
      heading: 'Coat Health Beyond Just Appearance',
      subheading: 'Grooming as a health check, not a beauty appointment.',
      paragraphs: [
        `Kalyani Nagar's dog parents are often highly aware of their pet's health — diet, supplements, vet schedules. We extend that rigour into grooming. Every session includes a quiet observation of the coat, skin, ears, and paws — noting early signs of irritation, tick activity, nail overgrowth, or ear wax buildup. If something looks concerning, we tell you. The session is as much a wellness review as it is a bath and trim. That level of attention is simply not possible in a busy salon rotation.`
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Dog coat health inspection in Kalyani Nagar',
      imageLeft: true,
    },
    {
      heading: 'Clean Setup, Precise Execution, Complete Cleanup',
      subheading: 'Society-ready service.',
      paragraphs: [
        'Our equipment is compact, quiet, and fully sanitized before every session. We set up in your bathroom, balcony, or any open indoor space. Water usage is controlled, hair is contained, and we do a complete cleanup of the working area once the session wraps. Your home looks exactly as it did before we arrived — just with a noticeably cleaner, fresher-smelling dog in it.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Groomed dog in Kalyani Nagar apartment',
      imageLeft: false,
    },
    {
      heading: `Breed-Specific Grooming We Offer in Kalyani Nagar`,
      subheading: `Cosmopolitan neighbourhood, cosmopolitan dog breeds.`,
      paragraphs: [
        `Kalyani Nagar has one of the more varied dog populations we encounter anywhere in Pune. Expat families bring breeds less commonly seen elsewhere — Vizslas, Border Collies, Malinois. Corporate residents often have large apartment-friendly breeds like Labradors and Golden Retrievers. And then there's the growing contingent of thoughtfully adopted Indies, often kept by residents who moved to Pune for work and decided to give a street dog a home. Every single one of these dogs is groomed differently.`,
        `Here's how we approach the breeds we most frequently groom in Kalyani Nagar:`,
      ],
      bullets: [
        `Labrador grooming in Kalyani Nagar — Active, affectionate dogs that live dusty apartment lives. We do a full deshedding bath, deep ear flush, paw pad inspection, and nail trim in every session. Labs' ears trap moisture and need consistent cleaning to stay infection-free.`,
        `Golden Retriever grooming in Kalyani Nagar — That flowing coat requires real commitment. We deep-condition the undercoat, trim the feathering around the ears and tail, and blow-dry thoroughly to prevent any moisture staying near the skin.`,
        `Border Collie grooming in Kalyani Nagar — Intelligent, energetic, and often nippy if uncomfortable. We move through the session methodically and let them stay in motion slightly rather than demanding they hold still. Double coats need proper deshedding, not a surface wash.`,
        `Indie dog grooming in Kalyani Nagar — Many Kalyani Nagar Indies are well-socialised rescues that have never had a professional groom before. We do a gentle acclimatisation at the start, take a full tick and skin inventory, and use mild products suited to their coat.`,
        `Shih Tzu and Lhasa grooming in Kalyani Nagar — Long coats in Pune's humidity need regular maintenance to avoid mats. We brush before bathing, use a strengthening conditioner, and trim with precision.`,
        `Persian cat grooming in Kalyani Nagar — We see quite a few Persians in this neighbourhood. Their coats need patient section-by-section work, nail clipping, and a gentle sanitary trim every three to four weeks.`,
      ],
      closingLine: `Don't see your breed listed? We groom all breeds — just mention your dog's type when booking and we'll prepare accordingly.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Breed-specific dog grooming at home in Kalyani Nagar Pune`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/kalyani-nagar'),
  nearbyAreas: ['Mundhwa', 'Kharadi', 'Nagar Road', 'Koregaon Park', 'Yerwada', 'Viman Nagar', 'Wadgaon Sheri', 'Dhole Patil Road'],
};

export const kalyaniNagarMapEmbed = 'https://www.google.com/maps?q=Kalyani+Nagar,Pune&output=embed';

export const kalyaniNagarReviews: LocationReview[] = [
  {
    petName: 'Zeus',
    ownerName: 'Rahul Mehta',
    area: 'Nagar Road',
    review: `Zeus is a two-year-old Lab and has a lot of energy. Most groomers just try to rush through the session. The Sniffy groomer actually let him settle for a few minutes first, and the rest of the session went smoothly. Coat looked genuinely clean and the ear flush was thorough — I checked.`,
    rating: 5,
  },
  {
    petName: 'Mia',
    ownerName: 'Priyanka Sharma',
    area: 'Kalyani Nagar',
    review: `I was nervous about home grooming because Mia is fussy, but this was honestly better than any salon visit we've had. The groomer was unhurried and confident with her. The coat looked balanced and the paw trim was neat. Will definitely make this a monthly thing.`,
    rating: 5,
  },
];

export const kalyaniNagarFAQs: FAQ[] = [
  {
    question: 'Is at-home grooming genuinely better than a salon for urban dogs?',
    answer: 'For most dogs, yes. The absence of other animals, unknown smells, and waiting areas reduces anxiety significantly. In a dense urban area with traffic, removing the commute alone improves the experience for both dog and owner.'
  },
  {
    question: 'What space do you need inside the flat to set up?',
    answer: 'A bathroom or balcony with water access is ideal. A space roughly the size of a large bathroom is sufficient. We manage our own equipment and keep everything contained.'
  },
  {
    question: 'Do you check for ticks during the session?',
    answer: 'Yes, always. A thorough tick and skin check is part of every session. If we find anything concerning, we tell you immediately.'
  },
  {
    question: 'How long does a full session take for a medium-sized dog?',
    answer: 'Typically 60 to 90 minutes. Larger breeds or dogs requiring detangling may take slightly longer. We never rush.'
  },
  {
    question: 'Can I schedule at a specific time to fit my work-from-home schedule?',
    answer: 'Yes. We offer morning, afternoon, and evening slots. You confirm the window that works and we arrive within that timeframe.'
  },
  {
    question: 'Do you provide a grooming report after the session?',
    answer: 'Yes. At the end we give you a brief verbal rundown of what we observed — coat condition, skin, ears, nails — and what to watch for before the next session.'
  },
  {
    question: 'Our building insists service visitors use the service lift. Is that an issue?',
    answer: 'None at all — the groomer follows whatever your building requires and carries everything in one bag. It is worth telling us if the service lift is on a different tower entrance, because that is usually where a groomer loses ten minutes finding their way in a large Kalyani Nagar complex.'
  },
  {
    question: 'Can the dog be dried on the balcony? Our society has rules about that.',
    answer: 'The blow-dry happens indoors as standard, so society balcony rules rarely come into it. We would not air-dry a dog on a balcony anyway — Pune humidity means a coat left to air-dry stays damp at the skin for hours, and damp skin under a thick coat is how fungal patches start. Every session ends with a proper blow-dry to the skin indoors.'
  },
  {
    question: 'Do you have experience with imported breeds that are uncommon in Pune?',
    answer: 'Yes, and Kalyani Nagar is where we see most of them. Coats we handle regularly here include Bichons, Cockers, Shih Tzus, Huskies, Samoyeds and Standard Poodles. If your dog is a breed with an established clip we would rather work from a photograph of how it has been cut before than from a breed-standard name, which different groomers interpret differently.'
  },
  {
    question: 'We are relocating overseas. What grooming should be done before the flight?',
    answer: 'Nails short, paw hair trimmed, sanitary area clean, and a full bath finished two to three days ahead so the coat is genuinely dry before the crate. Do not book a bath for travel day. If the destination requires a vet health certificate, the vet visit — not the groom — is the thing to schedule tightly around the flight date.'
  },
  {
    question: 'I am often not home. Can my house help be present for the session instead?',
    answer: 'Yes, as long as someone the dog is comfortable with is there and you are reachable by phone. What we will not do is take a decision that changes your dog — clipping down a matted coat, for instance — on a staff member\'s say-so. That call comes to you directly, even if it means the groomer waits on the line.'
  }
];

// ════════════════════════════════════════════════════════════
// LOHEGAON
// ════════════════════════════════════════════════════════════

export const lohegaonLocation: LocationConfig = {
  name: 'Lohegaon',
  slug: 'dog-grooming-in-pune/lohegaon',

  heroH1: `Doorstep Dog Grooming in Lohegaon — Calm, Thorough, Reliable`,
  heroSubtext:
    'Near Pune Airport Road or Dhanori junction? Get professional dog grooming at home in Lohegaon without the salon hassle. Trained groomers, clean setup, gentle care.',

  storySections: [
    {
      heading: `Lohegaon's Growing Dog Community Deserves Better`,
      subheading: 'Residential growth needs service that keeps pace.',
      paragraphs: [
        'Lohegaon has expanded considerably over the last decade, with new housing societies and apartment blocks lining both sides of Airport Road. As more families settle here, dog ownership has grown naturally alongside it. Yet grooming options in the immediate area remain limited — most pet parents either travel to Dhanori or Viman Nagar, which means traffic, time, and a stressed dog in the back seat. Home grooming in Lohegaon removes all of that. A certified groomer arrives at your door, sets up in your space, and handles the session start to finish while your dog stays on familiar ground.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Lohegaon Pune',
      imageLeft: true,
    },
    {
      heading: 'Apartment-Ready Equipment and Protocols',
      subheading: 'Designed for newer residential buildings.',
      paragraphs: [
        'New Lohegaon developments are modern high-rises and society complexes with building rules and shared spaces to be mindful of. Our grooming setup is compact, quiet, and leaves no trace. We use controlled dryers, manage water carefully, and clean up completely after the session. Society security and management have never had a concern with our setup — it\'s professional, discreet, and quick to pack down.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Grooming setup in Lohegaon apartment',
      imageLeft: false,
    },
    {
      heading: 'The Stress Connection: Travel Anxiety in Airport-Adjacent Areas',
      subheading: 'Dogs near flight paths have their own stress profiles.',
      paragraphs: [
        `Lohegaon's proximity to Pune Airport means aircraft noise is a regular background element for dogs living here. Many Lohegaon dogs are already mildly noise-sensitive, and adding a car journey followed by a noisy salon to that can tip them into real anxiety. Home grooming keeps the acoustic environment familiar — your dog hears sounds they already know and trust, which keeps cortisol levels down and the session cooperative throughout.`
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Calm dog grooming session in Lohegaon',
      imageLeft: true,
    },
    {
      heading: 'Transparent, Structured, Repeat-Worthy',
      subheading: 'No surprises. Just consistent care.',
      paragraphs: [
        'We believe dog parents should know exactly what they\'re getting. Our Lohegaon grooming sessions include bathing, drying, brushing, nail trimming, ear cleaning, and sanitary trim as standard. Haircuts and conditioning treatments are available as add-ons. Pricing is clearly communicated before the session begins. No upselling mid-session, no extra charges unless agreed in advance.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy groomed dog in Lohegaon',
      imageLeft: false,
    },
    {
      heading: `Breed-Specific Grooming We Offer Across Lohegaon`,
      subheading: `Airport road living, ground-level grooming expertise.`,
      paragraphs: [
        `Lohegaon's dog ownership skews toward the breeds favoured by younger families and working professionals — Labradors, Beagles, Golden Retrievers, and a healthy number of well-loved Indies. The newer residential blocks attract people who got their first dog in the last few years, which means many of our sessions here are also educational — first-time owners learning what their specific breed actually needs in terms of grooming frequency and coat care.`,
        `The breeds we groom most regularly in Lohegaon:`,
      ],
      bullets: [
        `Labrador grooming in Lohegaon — The most common breed in this part of Pune. Short dense coats that look low-maintenance but accumulate dust and dead undercoat rapidly. We do a full deshedding protocol every session — not just a rinse-down.`,
        `Beagle grooming in Lohegaon — Floppy ears are this breed's main vulnerability. We clean the ear canal carefully, check for early signs of infection, and follow with a full body wash and nail trim. Beagles are short-coated but should not be rushed.`,
        `Golden Retriever grooming in Lohegaon — Long coats in Pune's dust belt need deep cleansing. We go through the full feathering, condition the undercoat, and do a thorough blow-dry to prevent any moisture sitting near the skin.`,
        `Indie dog grooming in Lohegaon — A significant number of our Lohegaon bookings are for adopted Indies. We do a careful full-body assessment, tick check, and use mild anti-parasitic shampoo where needed. No rushing a rescue dog.`,
        `Pomeranian grooming in Lohegaon — The fluffy double coat needs card-out deshedding followed by a careful fluff-dry. We trim around paws and the sanitary area and finish with the breed's characteristic round profile.`,
        `German Shepherd grooming in Lohegaon — GSDs in apartment settings struggle with heat and coat density. Regular deshedding dramatically improves their comfort during Pune summers. We never shave the double coat — we remove the loose undercoat the right way.`,
      ],
      closingLine: `We also groom cats — particularly Persians and domestic breeds — if you have a feline who needs attention.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Breed-specific at-home dog grooming in Lohegaon Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/lohegaon'),
  nearbyAreas: ['Airport Road', 'Dhanori', 'Vishrantwadi', 'Viman Nagar', 'Tingre Nagar', 'Kalyani Nagar', 'Alandi Road', 'Wadgaon Sheri'],
};

export const lohegaonMapEmbed = 'https://www.google.com/maps?q=Lohegaon,Pune&output=embed';

export const lohegaonReviews: LocationReview[] = [
  {
    petName: 'Tiger',
    ownerName: 'Suresh Patil',
    area: 'Airport Road',
    review: 'Tiger gets very anxious during car rides and the nearest decent grooming salon was at least 20 minutes away. This home service completely solved that problem. The groomer was confident with him, which helped Tiger relax too. Coat looked properly clean — not just surface-washed.',
    rating: 5,
  },
  {
    petName: 'Biscuit',
    ownerName: 'Pooja Nair',
    area: 'Lohegaon',
    review: `Biscuit is our indie rescue and she's still nervous around strangers. The groomer spent a few minutes just letting her sniff around before starting. That small step made a huge difference. The whole session was calm and she came out looking wonderful.`,
    rating: 5,
  },
];

export const lohegaonFAQs: FAQ[] = [
  {
    question: 'Do you cover the newer society complexes off Airport Road?',
    answer: 'Yes. We service all residential areas in and around Lohegaon including the newer apartment developments along Airport Road.'
  },
  {
    question: 'Is grooming safe for rescue dogs who are shy around strangers?',
    answer: 'Absolutely. We use a patient trust-building approach — allowing the dog to settle before beginning — and move at a pace the dog is comfortable with throughout.'
  },
  {
    question: 'What is included in a standard grooming session?',
    answer: 'Bath, blow-dry, brush-out, nail trim, ear cleaning, and sanitary trim are included as standard. Haircut and coat conditioning are available as additions.'
  },
  {
    question: 'Is a balcony sufficient space for the grooming setup?',
    answer: 'Yes. A covered balcony with water access works well. Alternatively, a bathroom with enough room for the dog and groomer to move is fine.'
  },
  {
    question: 'How often should a Labrador or Golden Retriever be groomed?',
    answer: 'Every four to six weeks is ideal. During high-shedding seasons — typically summer and post-monsoon — monthly sessions are recommended to manage coat and skin health.'
  },
  {
    question: 'Can I observe the session?',
    answer: 'Yes. You are welcome to be present throughout. Some dogs actually settle better with their owner nearby, while others do better with slightly more space. We let the dog guide that.'
  },
  {
    question: 'We are right under the flight path. Does aircraft noise unsettle dogs mid-session?',
    answer: 'For some dogs, yes, particularly during the dryer stage when they are already dealing with one loud thing. Tell us if your dog is sound-reactive. The groomer will pause through an overflight rather than push on, and use a lower fan speed for longer — which takes more time but avoids stacking two stressors on top of each other.'
  },
  {
    question: 'Do you cover the society clusters off Airport Road toward Wadgaon Sheri and Vishrantwadi?',
    answer: 'Yes, along with the Porwal Road side and the older Lohegaon village core. This whole belt has grown quickly and several societies share a builder name across different roads, so a location pin with your booking genuinely saves time at the gate.'
  },
  {
    question: 'There is open ground and construction dust around us. How does that affect the coat?',
    answer: 'It shortens the useful gap between sessions. Loose dust from open plots works into the undercoat rather than sitting on the surface, and it is abrasive enough to leave a coat dull and dry. Dogs living beside open ground in Lohegaon usually hold condition better on a six-week cycle than on the eight weeks their coat type alone would suggest.'
  },
  {
    question: 'How old does a puppy need to be for a first session?',
    answer: 'Around twelve to sixteen weeks, and ideally after the core vaccination course is complete — ask your vet if you are unsure where your puppy is in the schedule. The first visit should be short and deliberately unambitious: handling the paws and ears, a comb through, the dryer heard from across the room. What a puppy learns about being handled now decides how easy the next decade is.'
  },
  {
    question: 'Can two dogs be done in the same visit?',
    answer: 'Yes, and it is common here. Tell us both breeds and sizes at booking so we block enough time — two dogs is close to a double slot, not one session split in half. They are groomed one at a time; a dog waiting its turn in the same room tends to wind up rather than settle, so we usually ask that the second dog stays elsewhere in the house.'
  }
];

// ════════════════════════════════════════════════════════════
// KHARADI
// ════════════════════════════════════════════════════════════

export const kharadiLocation: LocationConfig = {
  name: 'Kharadi',
  slug: 'dog-grooming-in-pune/kharadi',

  heroH1: `Home Dog Grooming in Kharadi — Built for Tech-Hub Schedules`,
  heroSubtext:
    `Kharadi's dog parents work hard. So does our service. Professional at-home dog grooming with flexible slots and zero commute — book by WhatsApp.`,

  storySections: [
    {
      heading: 'Kharadi Runs on Efficiency — So Does Our Grooming',
      subheading: 'Professional service for a professional neighbourhood.',
      paragraphs: [
        `Kharadi has become synonymous with Pune's eastern IT corridor. EON IT Park, World Trade Center, and the dense residential belt that supports it means the average Kharadi dog parent has a full calendar and limited patience for logistical complexity. At-home dog grooming eliminates the most annoying part of the whole grooming process — getting there. You pick a slot, we arrive, we get to work, we leave. Clean dog, no wasted hour.`
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Professional dog grooming at home in Kharadi Pune',
      imageLeft: true,
    },
    {
      heading: 'Stress-Free for Dogs, Stress-Free for You',
      subheading: 'The WFH grooming setup.',
      paragraphs: [
        `Plenty of Kharadi residents now work from home part of the week, and grooming slots that fit around video calls and focus blocks are genuinely useful. We keep the session self-contained — you don't need to supervise, guide, or be present the whole time. Once you let us in and show us the working space, we handle everything. Many Kharadi clients have the grooming session running while they're in a meeting in the next room.`
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Dog grooming running while owner works in Kharadi',
      imageLeft: false,
    },
    {
      heading: 'High-Rise Ready Protocols',
      subheading: 'Built for vertical living.',
      paragraphs: [
        `Kharadi's residential landscape is predominantly high-rise. Our setup is designed with this in mind — small footprint, quiet operation, contained water use, and complete cleanup. Building management has never flagged a concern. We're in, out, and you're left with a clean dog and a clean space.`
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Apartment-friendly grooming setup in Kharadi high-rise',
      imageLeft: true,
    },
    {
      heading: 'Grooming That Goes Beyond the Surface',
      subheading: 'Coat and skin health as a priority.',
      paragraphs: [
        `Kharadi dogs live in dust-prone construction-adjacent environments. Airport traffic, building activity, and high-pollution pockets mean coats pick up debris that a quick bath doesn't fully address. Our sessions use deep-cleansing shampoos, proper blow-drying to lift settled particles from the undercoat, and a finishing brush-out that removes what the bath doesn't reach. The result is a genuinely clean dog — not one that smells better but still has dirt settled into the coat.`
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Deep-cleaned dog after grooming session in Kharadi',
      imageLeft: false,
    },
    {
      heading: `Kharadi's Dog Breeds and How We Groom Each One`,
      subheading: `IT hub energy, breed-appropriate precision.`,
      paragraphs: [
        `The Kharadi dog demographic is younger and more likely to have researched their breed's specific needs before getting the dog. These are pet parents who've read about grooming frequencies, know what a deshedding treatment is, and sometimes arrive at the first session with very specific requests. We like that. It means the conversation before the session is productive and the session itself goes better.`,
        `Our approach to the breeds we see most often in Kharadi:`,
      ],
      bullets: [
        `Husky grooming in Kharadi — Pune heat is brutal on Huskies. We get calls from Kharadi Husky owners especially during March-May. We do a thorough blow-out deshedding — never clipping or shaving the double coat, which would damage it permanently — that removes massive amounts of loose undercoat and genuinely helps with temperature management.`,
        `Labrador grooming in Kharadi — Short but dense coats that hold onto Kharadi dust. We do a full deshedding bath, deep ear flush, and paw check. Labs are good patients in familiar environments.`,
        `Golden Retriever grooming in Kharadi — Younger Goldens in Kharadi apartments often have mildly matted ear fur from sweat and collar friction. We work through the ears carefully, condition the whole coat, and trim the tail plume and paw feathering.`,
        `Doodle grooming in Kharadi — Cockapoos, Goldendoodles, and Labradoodles are increasingly popular in this part of Pune. Their non-shedding curly coats mat rapidly without regular brushing. We do a full detangle before bathing, then shape the coat to the owner's preference.`,
        `Shih Tzu grooming in Kharadi — Long silky coats need regular attention to prevent mats in Pune's humidity. We brush before bathing, use a conditioning treatment, and trim the topknot and sanitary area precisely.`,
        `Indie dog grooming in Kharadi — Rescued Indies in Kharadi apartments are often first-generation pets for their owners. We do a patient first session, establishing trust before beginning, and provide guidance on at-home brushing to maintain coat health between sessions.`,
      ],
      closingLine: `For Doodle and curly-coated breeds especially, we recommend every 4–5 weeks to prevent matting from becoming a bigger issue.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Breed-specific home dog grooming in Kharadi Pune`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/kharadi'),
  nearbyAreas: ['EON IT Park', 'Wagholi', 'Kalyani Nagar', 'Mundhwa', 'Hadapsar', 'Viman Nagar', 'Nagar Road', 'Manjri'],
};

export const kharadiMapEmbed = 'https://www.google.com/maps?q=Kharadi,Pune&output=embed';

export const kharadiReviews: LocationReview[] = [
  {
    petName: 'Pepper',
    ownerName: 'Nikhil Srivastava',
    area: 'EON IT Park Road',
    review: 'I work from home on Wednesdays and booked the grooming session for a mid-morning slot between calls. The groomer arrived on time, set up quietly in the bathroom, and I barely noticed the session was happening. Pepper looked great and the bathroom was cleaner than when they arrived.',
    rating: 5,
  },
  {
    petName: 'Luna',
    ownerName: 'Sneha Joshi',
    area: 'Kharadi',
    review: `Luna is a Goldendoodle and her coat mats really easily. I've had groomers before who just started clipping everything as soon as they saw a mat. This groomer took time to work through it properly, only trimmed what was genuinely necessary, and the final result was neat and even.`,
    rating: 5,
  },
];

export const kharadiFAQs: FAQ[] = [
  {
    question: 'Can I book for a weekday morning to fit around my work calls?',
    answer: `Yes. We offer morning, afternoon, and evening slots including weekdays. Just pick what works and confirm — we'll be there.`
  },
  {
    question: 'How do Doodle coats need to be maintained between sessions?',
    answer: 'Daily brushing with a slicker brush and occasional comb-through prevents the curly coat from matting. We give specific guidance at the end of every Doodle session.'
  },
  {
    question: 'Does grooming help with dust accumulation in the coat?',
    answer: 'Yes significantly. Deep-cleanse shampoos and proper blow-dry remove settled dust from the undercoat that a surface rinse would leave behind.'
  },
  {
    question: 'Is at-home grooming available for same-day bookings?',
    answer: 'Subject to availability. We recommend booking 24–48 hours in advance for the best slot options, though we accommodate same-day where possible.'
  },
  {
    question: 'Do you handle dogs that have had bad salon experiences before?',
    answer: 'Yes. Dogs with previous salon anxiety almost always respond better in a home environment. We give extra time at the start of the session for the dog to settle.'
  },
  {
    question: 'What happens if my dog has a mat that needs clipping?',
    answer: 'We always discuss this with you before clipping. We attempt to detangle safely first and only recommend clipping if the mat is too tight to safely brush out.'
  },
  {
    question: 'The bypass and the EON stretch flood in heavy rain. Do sessions still happen?',
    answer: 'Usually yes, occasionally shifted. If the Kharadi bypass or the approach to your society is genuinely waterlogged, we call and move the slot rather than send a groomer through it with electrical equipment. A rescheduled session costs you nothing; a groomer arriving soaked with a wet dryer bag is no use to your dog.'
  },
  {
    question: 'Our high-rise has a pet policy and a separate service entrance. What do you need from us?',
    answer: 'Just tell us at booking and share the groomer details with your society office ahead of the slot. Most of the large Kharadi towers now log service visitors on an app, and a pre-approved entry means the groomer walks in rather than waiting at the desk while your slot runs down.'
  },
  {
    question: 'We moved here from abroad with our dog. Can you continue the grooming style he had?',
    answer: 'Send a photo from the last groom when you book — it carries far more information than a style name does, since the same breed clip is cut differently in different countries. If the coat has grown out or matted since the move, we will tell you honestly whether the old style is reachable in this session or needs one intermediate cut first.'
  },
  {
    question: 'Can a dog and a cat be groomed in the same visit?',
    answer: 'Yes, and we usually do the cat first, while the house is still quiet and before there is dog fur and dryer noise in the air. Mention both at booking so the slot is long enough and we send a groomer trained for cats — cat grooming uses different products and different handling, not the same kit on a smaller animal.'
  },
  {
    question: 'How early in the morning can you reach Kharadi?',
    answer: 'From 9 AM reliably. Earlier is possible by arrangement, and it is the slot most of the IT crowd here asks for. The honest constraint is direction of travel — a groomer coming across from the west side hits the inbound Nagar Road peak, so early Kharadi slots are assigned to groomers already based on the eastern side of the city.'
  }
];

// ════════════════════════════════════════════════════════════
// VIMAN NAGAR
// ════════════════════════════════════════════════════════════

export const vimanNagarLocation: LocationConfig = {
  name: 'Viman Nagar',
  slug: 'dog-grooming-in-pune/viman-nagar',

  heroH1: `Dog Grooming at Home in Viman Nagar — Professional, Punctual, Personalised`,
  heroSubtext:
    `One of Pune's most connected residential hubs deserves a grooming service that actually shows up on time. Sniffy delivers home dog grooming in Viman Nagar that earns repeat bookings.`,

  storySections: [
    {
      heading: 'Viman Nagar Dog Parents Have Options — This Is the Better One',
      subheading: 'Proximity to everything except good reasons to go to a salon.',
      paragraphs: [
        'Viman Nagar sits between the airport, the IT corridors of Kharadi, and the affluence of Kalyani Nagar and Koregaon Park. Grooming salons are not far. But "not far" in Pune traffic is still a half-hour round trip with an anxious dog in the back seat and the uncertainty of whether the groomer will be free when you arrive. Home grooming in Viman Nagar eliminates that equation entirely. You book a time. The groomer shows up. The session happens in your home. The dog never needs to leave.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'At-home dog grooming in Viman Nagar Pune',
      imageLeft: true,
    },
    {
      heading: 'Perfect for the Well-Organised Dog Parent',
      subheading: 'Clear communication, confirmed slots, no drama.',
      paragraphs: [
        'Viman Nagar residents tend to be organised — they schedule, plan, and expect services to work as advertised. Our booking process is simple: WhatsApp confirmation, arrival window communicated in advance, groomer arrives on time, session runs to plan. If anything changes — a slightly longer session due to coat condition, for example — you are told in advance rather than surprised afterward. This predictability is what makes our Viman Nagar clients rebook consistently.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Professional dog grooming session in Viman Nagar',
      imageLeft: false,
    },
    {
      heading: 'Skin and Coat Health in a Dense Urban Environment',
      subheading: 'Grooming for real Pune conditions.',
      paragraphs: [
        `Viman Nagar dogs — particularly in the high-density apartment zones — accumulate dust and environmental debris quickly. Our grooming sessions address this with deep-cleanse shampoos that actually lift settled particles from the undercoat, not just clean the surface. Combined with proper conditioner and a thorough blow-dry, each session delivers a coat that's genuinely clean through all layers, not just visually presentable on the top.`
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Coat care for dog in Viman Nagar',
      imageLeft: true,
    },
    {
      heading: 'Full-Service Grooming Packages with No Ambiguity',
      subheading: `You know what you're paying for before we arrive.`,
      paragraphs: [
        'Every Viman Nagar session includes bath, blow-dry, brush-out, nail trim, ear cleaning, and sanitary trim. Haircuts and conditioning add-ons are clearly priced and discussed in advance. There are no on-the-spot upsells, no mysterious charges, and no pressure. Just structured, professional grooming that delivers what it promises.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy clean dog after grooming in Viman Nagar',
      imageLeft: false,
    },
    {
      heading: `How We Groom the Breeds That Call Viman Nagar Home`,
      subheading: `Airport-adjacent, globally informed dog ownership.`,
      paragraphs: [
        `Viman Nagar's position near the airport has made it a preferred base for expat families and frequent-travelling professionals, and the dog breeds here reflect that variety. Japanese Spitz, Samoyeds, Cocker Spaniels, and well-maintained Labradors all appear in our Viman Nagar booking calendar alongside the more typical Indie rescues and Pomeranians. Each one needs a completely different grooming protocol.`,
        `Here's what we do for the breeds we groom most in Viman Nagar:`,
      ],
      bullets: [
        `Japanese Spitz grooming in Viman Nagar — Beautiful white double coats that show every speck of Pune dust. We use a whitening shampoo designed for light coats, follow with a full blow-out deshedding, and finish with a careful brush-through that keeps the coat lifted and clean.`,
        `Cocker Spaniel grooming in Viman Nagar — Those signature long floppy ears are gorgeous and high-maintenance. We clean the ear canal thoroughly, trim the ear edges to prevent matting, and style the body coat to keep it flowing and tangle-free.`,
        `Labrador grooming in Viman Nagar — Labs are our most common booking anywhere in Pune. Thorough deshedding, ear flush, and paw inspection are non-negotiables for us in every Lab session.`,
        `Samoyed grooming in Viman Nagar — We occasionally see Samoyeds in this neighbourhood, and they're a serious grooming commitment. Thick white double coats need patient blow-out deshedding, conditioning, and careful work around the ears and hindquarters where mats form first.`,
        `Shih Tzu grooming in Viman Nagar — The breed's coat grows continuously and needs consistent trimming and conditioning. We discuss the preferred style — show coat or practical puppy cut — before the session begins.`,
        `Indie dog grooming in Viman Nagar — Many Viman Nagar Indies are well-socialised and comfortable with people. We still do a full skin and tick check, use appropriate shampoo for their coat type, and give paw and ear attention that street-origin dogs often need.`,
      ],
      closingLine: `For white-coated breeds like Japanese Spitz and Samoyed, we recommend a dedicated whitening shampoo option — mention this when booking.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Breed-specific home dog grooming in Viman Nagar Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/viman-nagar'),
  nearbyAreas: ['Airport Road', 'Kalyani Nagar', 'Kharadi', 'Nagar Road', 'Dhanori', 'Lohegaon', 'Wadgaon Sheri', 'Yerwada'],
};

export const vimanNagarMapEmbed = 'https://www.google.com/maps?q=Viman+Nagar,Pune&output=embed';

export const vimanNagarReviews: LocationReview[] = [
  {
    petName: 'Charlie',
    ownerName: 'Kartik Menon',
    area: 'Viman Nagar',
    review: 'Charlie is a Cocker Spaniel and his ears are always my anxiety trigger — they mat so easily. The groomer took proper care of both ears, showed me what she was doing, and gave me advice on home brushing to maintain them better. Very knowledgeable and confident.',
    rating: 5,
  },
  {
    petName: 'Nala',
    ownerName: 'Swati Deshpande',
    area: 'Nagar Road',
    review: `Nala is an eight-year-old Indie who's been through a lot before I adopted her. She's wary of new people. The groomer read that immediately and spent time just sitting with her first. The session went better than any I've managed before. Patient service.`,
    rating: 5,
  },
];

export const vimanNagarFAQs: FAQ[] = [
  {
    question: 'Do you offer early morning slots for airport-area residents?',
    answer: 'Yes. Early slots are available and popular in Viman Nagar. Confirm the time window when booking.'
  },
  {
    question: 'How do you keep a white-coated dog actually white after bathing?',
    answer: 'We use a whitening shampoo designed for light coats and follow with a thorough blow-dry that lifts the coat and prevents yellowing. We also check for staining around the muzzle and paws.'
  },
  {
    question: 'Is grooming recommended year-round or just in summer?',
    answer: 'Year-round. Different seasons bring different coat and skin needs — summer deshedding, monsoon skin hygiene, post-winter coat conditioning. Consistent grooming maintains health through all of them.'
  },
  {
    question: 'Can you maintain a specific trim style my dog has always had?',
    answer: 'Yes. Tell us the style or show us a reference photo when booking. Our groomers follow briefs precisely.'
  },
  {
    question: 'Is there an age minimum for grooming?',
    answer: 'We groom puppies from around 10–12 weeks onwards, once their vaccination schedule is sufficiently advanced. Early grooming builds positive associations for life.'
  },
  {
    question: 'How do I prepare my dog for the session?',
    answer: 'A short walk or toilet break before the groomer arrives is ideal. A slightly calmer dog cooperates better. No need to bathe beforehand — that\'s our job.'
  },
  {
    question: 'What is the least painful slot to book given the Phoenix and Nagar Road traffic?',
    answer: 'Mid-morning, roughly 10 AM to 12:30 PM, or mid-afternoon. The stretch past the mall between 6 and 9 PM is where arrival windows slip most, and if you want an evening session we would rather book you at 7 PM with an honest twenty-minute window than promise a time we cannot hold.'
  },
  {
    question: 'We are relocating abroad. What does my dog need done before the flight?',
    answer: 'A full bath two to three days ahead, so the coat is completely dry before crate time, plus short nails and trimmed paw hair — both matter more for crate comfort than a fresh haircut does. Book the vet health certificate tightly to the flight date; book the groom loosely. A bath on travel morning leaves a damp undercoat in a cold hold.'
  },
  {
    question: 'Our society will not allow drying or grooming on the balcony. Does that restrict the session?',
    answer: 'Not at all — the whole session happens indoors as standard. We would not air-dry on a balcony in any case: Pune humidity keeps an air-dried coat damp at the skin for hours, and that is how fungal patches begin. The bath uses your bathroom and the dry and trim use any clear indoor floor.'
  },
  {
    question: 'Can you groom two pets of different sizes in one booking?',
    answer: 'Yes. Tell us both breeds when you book so the slot is realistic — a Lab and a Shih Tzu together is close to a double session, not one and a half. We groom them one at a time and ask that the waiting pet stays in another room, because a dog watching another dog being dried usually gets more agitated, not less.'
  },
  {
    question: 'Is there a lift and parking constraint for groomers in the high-rises here?',
    answer: 'Nothing that affects you. Our groomers arrive by two-wheeler with the entire kit in one shoulder bag, so parking pressure around Viman Nagar towers is not a factor and any lift, including a service lift, is sufficient. If your tower entrance is hard to find from the main gate, a pin saves the groomer a call.'
  }
];

// ════════════════════════════════════════════════════════════
// MUNDWA
// ════════════════════════════════════════════════════════════

export const mundwaLocation: LocationConfig = {
  name: 'Mundwa',
  slug: 'dog-grooming-in-pune/mundwa',

  heroH1: `Home Dog Grooming in Mundwa — Calm, Clean, Right at Your Door`,
  heroSubtext:
    `Between Kalyani Nagar and Hadapsar, Mundwa deserves doorstep grooming that's proper. Trained Sniffy groomers visit your home — no salon runs needed.`,

  storySections: [
    {
      heading: `Mundwa's Residential Growth Needs Services to Match`,
      subheading: 'A growing community with growing needs.',
      paragraphs: [
        `Mundwa sits comfortably between Kalyani Nagar's corporate shine and Hadapsar's residential expanse. New housing projects have brought a wave of families here over the last few years, and pet ownership has followed. The challenge is that dedicated grooming services in this part of Pune remain sparse. Most dog parents are commuting to Kalyani Nagar or even Koregaon Park for a decent groomer. We eliminate that. Certified grooming at your door in Mundwa — no cross-city travel, no waiting rooms.`
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Mundwa Pune',
      imageLeft: true,
    },
    {
      heading: 'Efficient Sessions for Compact Living',
      subheading: 'Small apartments, no problem.',
      paragraphs: [
        'Many newer Mundwa developments are compact by design — smaller footprints, efficient layouts. Our grooming setup adapts to whatever space you have. A bathroom, a covered balcony, a utility area — we work with what\'s available. The session is self-contained, quiet, and leaves zero trace.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Dog grooming in compact Mundwa apartment',
      imageLeft: false,
    },
    {
      heading: 'Consistent Care That Builds Dog Trust',
      subheading: 'Familiar face, familiar routine.',
      paragraphs: [
        'We aim to send the same groomer for repeat bookings wherever possible. Dogs build familiarity with a specific person\'s touch, smell, and movements. Over two or three sessions, what might have started as a reluctant experience becomes something your dog is noticeably more comfortable with. That consistency is especially important for younger dogs who are still building their grooming associations.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Familiar groomer building dog trust in Mundwa',
      imageLeft: true,
    },
    {
      heading: 'Full Grooming Packages at Predictable Prices',
      subheading: 'Structured service, no hidden costs.',
      paragraphs: [
        'Standard sessions include bathing, drying, brushing, nail trimming, ear cleaning, and sanitary trim. Haircut styling and coat conditioning are clearly listed add-ons. The price you see before booking is the price you pay. Our goal is to be a grooming partner you come back to regularly — not one you feel you have to check the bill on afterward.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Groomed dog in Mundwa after professional session',
      imageLeft: false,
    },
    {
      heading: `Dog Breeds We Groom in Mundwa — Our Approach to Each`,
      subheading: `Between corridors, with consistent quality.`,
      paragraphs: [
        `Mundwa's dog population reflects its geography — it's a transitional neighbourhood between the corporate east and the residential south, and the breeds we see are similarly varied. First-generation dog owners raising a Labrador or a rescue Indie sit alongside more experienced owners with Cocker Spaniels or long-haired breeds. We calibrate each session to exactly what's in front of us — coat condition, dog temperament, owner preference.`,
        `The breeds we groom most frequently in Mundwa:`,
      ],
      bullets: [
        `Labrador grooming in Mundwa — Always number one by volume in this part of Pune. Deshedding, ear flush, paw check, nail trim — these are non-negotiable parts of every Lab session and not items we quietly skip to speed up.`,
        `Cocker Spaniel grooming in Mundwa — Long silky coats and floppy ears that need careful management. We address both in every session — body coat brushing and trimming plus thorough ear cleaning.`,
        `Shih Tzu grooming in Mundwa — These small dogs need patient handling. We allow them to settle, work through the coat carefully from ends inward, and deliver a clean precise finish.`,
        `Indie dog grooming in Mundwa — We treat every Indie with the same respect as a pedigree. Full skin and tick check, appropriate shampoo, nail and ear care. No corners cut.`,
        `Pug grooming in Mundwa — Skin folds around the face need individual attention and cleaning. We address each fold carefully, trim the nails short, and use a gentle fragrance-free rinse.`,
        `German Shepherd grooming in Mundwa — Heavy seasonal shedders. We do a proper deshedding session that goes beyond surface cleaning to remove the loose undercoat that causes the most daily fur around the home.`,
      ],
      closingLine: `First session in Mundwa? We'll do a quick breed and coat assessment when we arrive to make sure the session is tailored correctly from the start.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Home dog grooming for multiple breeds in Mundwa Pune`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/mundwa'),
  nearbyAreas: ['Kalyani Nagar', 'Kharadi', 'Hadapsar', 'Koregaon Park', 'Wanowrie', 'Nagar Road', 'Manjri', 'Solapur Road'],
};

export const mundwaMapEmbed = 'https://www.google.com/maps?q=Mundwa,Pune&output=embed';

export const mundwaReviews: LocationReview[] = [
  {
    petName: 'Rocky',
    ownerName: 'Vijay Bhosale',
    area: 'Mundwa',
    review: 'This was our first home grooming experience and honestly it was better than I expected. Rocky is a 3-year-old Indie and usually gets agitated around strangers. The groomer was calm and unhurried, which helped Rocky cooperate fully. The coat looked great afterward.',
    rating: 5,
  },
  {
    petName: 'Cookie',
    ownerName: 'Divya Kulkarni',
    area: 'Near Kalyani Nagar',
    review: 'Cookie is a Shih Tzu and very particular about being handled. The groomer clearly had experience with small breeds — she was gentle, precise, and took time on the face trim which others always rush. Very happy with the result.',
    rating: 5,
  },
];

export const mundwaFAQs: FAQ[] = [
  {
    question: 'Is Mundwa fully covered by your service?',
    answer: 'Yes. We cover all residential areas in Mundwa and surrounding localities including the newer apartment developments near Kalyani Nagar.'
  },
  {
    question: 'What is the smallest space you can set up in?',
    answer: 'A bathroom with enough room for the groomer and the dog to manoeuvre comfortably works well. We\'ve never had a space too small that we couldn\'t adapt to.'
  },
  {
    question: 'Can grooming help with tick prevention?',
    answer: 'We check for ticks in every session and can use a mild anti-parasitic shampoo where needed. For tick-prone areas, regular grooming is one of the best early detection tools.'
  },
  {
    question: 'Is cat grooming available in Mundhwa too?',
    answer: 'Yes. We groom cats as well — particularly longer-haired breeds that need regular coat maintenance and nail care.'
  },
  {
    question: 'What if my dog has never been groomed professionally before?',
    answer: 'First sessions are often the most interesting. We take extra time to introduce tools gradually and build the dog\'s comfort. The home environment helps enormously here.'
  },
  {
    question: 'Are nail clipping and ear cleaning included in the base package?',
    answer: 'Yes. Both are included as standard in our base grooming package. They\'re not extras you need to pay more for.'
  },
  {
    question: 'Does being close to the river change anything about grooming here?',
    answer: 'Mainly the drying. The riverside stretch through Mundhwa holds humidity longer than areas further inland, and a coat that feels dry to the hand can still be damp at the skin. Our groomers dry down to the skin rather than to the touch here, and for thick-coated dogs that is the stage we spend the most time on.'
  },
  {
    question: 'Do you cover the Magarpatta and Keshav Nagar side as well as Mundhwa proper?',
    answer: 'Yes, along with the Kharadi border stretch and the older Mundhwa gaon area. It is a compact belt to work in, which usually means we can offer tighter slot windows here than in the more spread-out parts of the city.'
  },
  {
    question: 'There is heavy construction around us. How often should we be grooming?',
    answer: 'Closer to six weeks than eight for most coats. Construction dust is fine enough to settle into the undercoat rather than rest on top of it, and it leaves the coat dull and slightly abrasive to the touch. It is not a health emergency, but it is a real reason to shorten the gap while the building work continues.'
  },
  {
    question: 'We have a large dog in a small flat. Is there enough room to groom properly?',
    answer: 'Almost always. The requirement is floor space for the dog to stand and turn, not a room to itself — a bathroom for the wash and any clear patch for the dry and trim is enough. For a big double-coated dog the deshedding stage is worth doing wherever it is easiest to sweep afterwards, which in a small flat is usually the balcony.'
  },
  {
    question: 'What is your latest evening slot in Mundhwa?',
    answer: 'The last workable start is around 7 PM so the coat is fully dry before the groomer leaves. We run until 9 PM, but a session that begins at 8 either finishes rushed or finishes with a damp dog, and neither is something we will do. Evening slots here fill early in the week, so book a few days ahead.'
  }
];

// ════════════════════════════════════════════════════════════
// KOREGAON PARK
// ════════════════════════════════════════════════════════════

export const koregaonParkLocation: LocationConfig = {
  name: 'Koregaon Park',
  slug: 'dog-grooming-in-pune/koregaon-park',

  heroH1: `Premium Home Dog Grooming in Koregaon Park — Refined Care, No Compromises`,
  heroSubtext:
    `Pune's most celebrated address deserves a grooming experience to match. Sniffy brings expert, unhurried home grooming to Koregaon Park — every detail considered.`,

  storySections: [
    {
      heading: 'Koregaon Park Expects the Best — We Deliver It',
      subheading: 'Grooming to match the standard of this neighbourhood.',
      paragraphs: [
        `Koregaon Park is in a category of its own in Pune. Leafy avenues, heritage bungalows, boutique residences, and world-class restaurants set a standard that residents understandably apply to every service they invite into their home. Our home dog grooming service in Koregaon Park is designed to meet that standard without exception. Certified groomers, premium products, unhurried sessions, and a discipline around cleanliness and discretion that matches the neighbourhood's character.`
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Premium home dog grooming in Koregaon Park Pune',
      imageLeft: true,
    },
    {
      heading: 'Heritage Homes and Boutique Apartments — We Adapt',
      subheading: 'Respectful of your space and its character.',
      paragraphs: [
        'Koregaon Park has an unusual mix of properties — older independent bungalows with large gardens alongside newer boutique apartment complexes. We adapt our setup to both. In bungalows, a garden or open area works beautifully for grooming with proper sun-drying. In apartments, we work indoors with our compact portable setup. In either case, we arrive with sanitized tools, work with precision, and leave the space immaculate.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Dog grooming in Koregaon Park bungalow setting',
      imageLeft: false,
    },
    {
      heading: 'Breed Expertise for Discerning Dog Families',
      subheading: 'Many Koregaon Park dogs are rare breeds that need specialists.',
      paragraphs: [
        `Koregaon Park's international connections mean we encounter breed varieties here that are uncommon elsewhere in Pune — Weimaraners, Vizslas, Ridgebacks, well-maintained Poodles in show condition, and elderly Labradors who've been part of the family for over a decade. Each of these needs a groomer who has actually worked with the breed before, not one following a generic procedure. Our groomers at Koregaon Park are selected specifically for this breadth of breed experience.`
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Expert dog grooming for rare breeds in Koregaon Park',
      imageLeft: true,
    },
    {
      heading: 'Discreet, Thorough, Consistently Excellent',
      subheading: 'The same standard every visit.',
      paragraphs: [
        'What separates a good grooming service from a great one is consistency. We assign the same groomer for repeat Koregaon Park bookings wherever possible. Your dog builds familiarity. The groomer learns your dog\'s temperament, coat preferences, and what the previous session found. The result is a continually improving grooming relationship — not starting from zero every time.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy perfectly groomed dog in Koregaon Park',
      imageLeft: false,
    },
    {
      heading: `Breeds We Groom in Koregaon Park — Expert Handling Every Time`,
      subheading: `Pune's most diverse and interesting dog roster.`,
      paragraphs: [
        `Koregaon Park genuinely has some of Pune's most interesting dogs. We've groomed Weimaraners, Vizslas, a Basenji, a pair of Ridgebacks, and more Poodles in this one neighbourhood than anywhere else in the city. Many owners here are expats or have lived abroad and have clear ideas about what good grooming looks like — they've experienced it in other countries and want the same level of care here. We rise to that.`,
        `The breeds we groom most in Koregaon Park and what our approach involves:`,
      ],
      bullets: [
        `Weimaraner grooming in Koregaon Park — Short sleek coats that look effortless but need regular attention. We focus on rubber curry brushing for coat stimulation, checking the skin carefully for dryness or irritation, and nail care that these active dogs need kept short.`,
        `Standard Poodle grooming in Koregaon Park — We groom to the style the owner prefers — whether that's a classic continental clip, a practical sport clip, or a rounded teddy bear cut. Poodle coats grow continuously and four-weekly sessions are recommended.`,
        `Golden Retriever grooming in Koregaon Park — Many Koregaon Park Goldens are older, long-standing family members. We slow the session down for elderly dogs, avoid prolonged standing, and give extra attention to the ears and paws where age shows first.`,
        `Labrador grooming in Koregaon Park — Consistent deshedding, ear hygiene, and paw care. We treat every Lab session with the same thoroughness regardless of how 'easy' the coat looks.`,
        `Persian cat grooming in Koregaon Park — Several Koregaon Park clients have Persians. These cats need three to four weekly grooming sessions minimum. We work section by section, manage the undercoat without pulling, and keep the session calm throughout.`,
        `Indie dog grooming in Koregaon Park — A number of Koregaon Park residents have adopted Indies from the street or from shelters. We give these dogs the same level of care and expertise as any rare breed — full skin check, appropriate products, patient handling.`,
      ],
      closingLine: `Have a breed not listed here? Contact us before booking and we'll confirm experience and approach for your specific dog.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Expert breed-specific dog grooming at home in Koregaon Park Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/koregaon-park'),
  nearbyAreas: ['Kalyani Nagar', 'Mundhwa', 'Camp', 'Dhole Patil Road', 'Wanowrie', 'Yerwada', 'Nagar Road', 'Sangamwadi'],
};

export const koregaonParkMapEmbed = 'https://www.google.com/maps?q=Koregaon+Park,Pune&output=embed';

export const koregaonParkReviews: LocationReview[] = [
  {
    petName: 'Duchess',
    ownerName: 'Anika Sharma',
    area: 'Koregaon Park',
    review: `Duchess is a Standard Poodle and I've had genuinely terrible experiences with groomers who didn't know how to handle a Poodle coat. This groomer clearly did. She discussed the clip style with me first, executed it cleanly, and Duchess was noticeably calm the whole time. This is the standard I've been looking for in Pune.`,
    rating: 5,
  },
  {
    petName: 'Bruno',
    ownerName: 'Cyrus Daruwala',
    area: 'Lane 5 KP',
    review: 'I have a large property and have always done outdoor grooming for Bruno. The groomer worked beautifully in the garden space, left everything completely clean, and handled Bruno — who is large and strong — with real confidence. Impressed.',
    rating: 5,
  },
];

export const koregaonParkFAQs: FAQ[] = [
  {
    question: 'Can you groom in an outdoor garden setting?',
    answer: 'Yes. We adapt to outdoor spaces including gardens and terraces. This is often ideal for larger breeds and works especially well in Koregaon Park bungalow properties.'
  },
  {
    question: 'Do you have experience with rare or uncommon breeds?',
    answer: 'Yes. Our groomers have experience with a wide range of breeds including Weimaraners, Vizslas, Standard Poodles, Ridgebacks, and various other European breeds. Contact us in advance if you have a particularly unusual breed.'
  },
  {
    question: 'Can I specify a grooming style or clip for my Poodle?',
    answer: 'Yes. We groom Poodles to the owner\'s specified style. Send a reference image when booking and we\'ll discuss before starting.'
  },
  {
    question: 'How do you handle large and powerful breeds?',
    answer: 'With confidence and calm authority. Dogs read handler energy closely — a groomer who is calm and assured produces a calmer, more cooperative dog. We never use force; we use positioning and patient handling.'
  },
  {
    question: 'Is cat grooming available in Koregaon Park?',
    answer: 'Yes. We groom cats including Persians and long-haired domestic cats. Cat sessions are quieter and require a specific patient approach we are trained for.'
  },
  {
    question: 'What is the frequency recommendation for a Standard Poodle?',
    answer: 'Every four weeks for a Poodle in full coat. Their non-shedding coat grows continuously and mats quickly without regular maintenance.'
  },
  {
    question: 'The bungalow lanes here are narrow and parking is tight. Does that affect the visit?',
    answer: 'No. Groomers arrive by two-wheeler with everything in a shoulder bag, which is the reason this service works on the lanes off North Main Road and the numbered lanes at all. No van, no bay, and nothing that needs to be unloaded at your gate.'
  },
  {
    question: 'Does the humidity near the river affect how a coat should be dried?',
    answer: 'It affects how long it takes, not how it is done. This stretch holds moisture longer than most of the city, and a thick coat that feels dry on the surface can still be damp against the skin. We dry to the skin rather than to the touch, and for a Retriever or a Husky here that stage takes noticeably longer than it would in drier parts of Pune.'
  },
  {
    question: 'I travel a lot. Can my house staff manage the appointment?',
    answer: 'Yes, provided someone the dog trusts is present and you are contactable. The limit is decisions: if the coat turns out to be matted enough that clipping down is the kinder option, that call comes to you by phone, not to whoever happens to be at home. We would rather hold the session for five minutes than change your dog on someone else\'s authority.'
  },
  {
    question: 'We are moving our dog abroad. What should be done beforehand?',
    answer: 'Bath two to three days ahead so the coat is fully dry before the crate, nails taken short, and paw and sanitary hair trimmed — the practical things that make a long flight less uncomfortable. Leave the cosmetic trim alone if the coat is in good order. The tight scheduling should be around the vet health certificate, not around the grooming.'
  },
  {
    question: 'Our senior dog struggles with the stairs in an old bungalow. How do you work around that?',
    answer: 'We come to the dog rather than moving the dog. If the bathroom is upstairs and your dog should not be doing stairs, we work on the ground floor from filled buckets and use non-slip matting throughout — old bungalow flooring is genuinely slippery for an arthritic dog. Tell us at booking so the groomer arrives planning for it.'
  }
];

// ════════════════════════════════════════════════════════════
// DHAYARI
// ════════════════════════════════════════════════════════════

export const dhayariLocation: LocationConfig = {
  name: 'Dhayari',
  slug: 'dog-grooming-in-pune/dhayari',

  heroH1: `Doorstep Dog Grooming in Dhayari — Professional Care at Home`,
  heroSubtext:
    'Dhayari is expanding rapidly and its dog families deserve a grooming service that comes to them. Sniffy delivers certified home grooming with no salon visit required.',

  storySections: [
    {
      heading: `Dhayari's Expanding Communities Need Local Services`,
      subheading: 'Distance from the city centre is no longer a constraint.',
      paragraphs: [
        `Dhayari sits on the western edge of Pune's residential belt, and its expansion has been significant over the last five years. New societies, plotted developments, and compact apartment complexes have brought thousands of new families to the area — and their dogs. The challenge is that pet services haven't kept pace. Dog parents in Dhayari are still driving toward Warje or Kothrud for a decent grooming session. We eliminate that gap entirely by coming directly to your home in Dhayari.`
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Dhayari Pune',
      imageLeft: true,
    },
    {
      heading: 'Calm Environments Make Better Groomed Dogs',
      subheading: 'Home is always the better grooming space.',
      paragraphs: [
        'Dhayari\'s residential character is quieter and more spread out than central Pune. That translates to dogs who are generally calmer at home than they would be in a busy urban salon environment. Our at-home grooming session in Dhayari amplifies that advantage — familiar surroundings, familiar smells, no strange animals nearby. The result is a more cooperative dog and a more thorough grooming session overall.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Calm home grooming session in Dhayari',
      imageLeft: false,
    },
    {
      heading: 'Season-Appropriate Coat Care',
      subheading: 'Summer shedding, monsoon hygiene, winter conditioning.',
      paragraphs: [
        'Dhayari\'s slightly elevated position means seasonal temperature shifts can be more pronounced than in central Pune. Dogs here can experience intense summer shedding, monsoon-related skin dampness, and drier winter coats. Our grooming approach adjusts to these seasonal needs — deshedding in summer, anti-fungal rinses in monsoon if needed, conditioning treatments in winter. Regular monthly sessions across the year keep your dog\'s coat and skin in optimal health regardless of season.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Season-appropriate dog grooming in Dhayari',
      imageLeft: true,
    },
    {
      heading: 'Transparent Pricing, Reliable Scheduling',
      subheading: 'Consistency you can plan around.',
      paragraphs: [
        'We know that Dhayari dog parents often have tight schedules and limited nearby service options. We make booking as frictionless as possible — WhatsApp to confirm, arrival time clearly communicated, session run efficiently and professionally. Pricing is communicated upfront. The only surprise is how easy the whole thing is.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy groomed dog in Dhayari Pune',
      imageLeft: false,
    },
    {
      heading: `Breeds We Groom in Dhayari — and What Each Session Involves`,
      subheading: `Western Pune's newer dog families, served with the same standard.`,
      paragraphs: [
        `Dhayari's dog ownership skews toward younger families who got their dog in the last three to five years. We see lots of Labradors, a fair number of Indies, some Pomeranians, and a growing population of Huskies and German Shepherds in the newer villa developments. Many of these dog parents are grooming professionals for the first time and are genuinely curious about what the session involves — we welcome questions and make the process transparent throughout.`,
        `Here's our approach to the breeds we see most in Dhayari:`,
      ],
      bullets: [
        `Labrador grooming in Dhayari — Short double coats that shed constantly and pick up Dhayari's outdoor dust effortlessly. Deshedding bath, ear flush, and paw check are the core of every Lab session here.`,
        `Husky grooming in Dhayari — Huskies in the villa and plotted developments of Dhayari often spend more time outdoors than apartment-kept dogs. That means more dust accumulation in the double coat. We do a thorough blow-out deshedding session that removes the loose undercoat without damaging the protective topcoat.`,
        `German Shepherd grooming in Dhayari — Large, strong, and often quite attached to their territory. We take the first few minutes of the session for the GSD to establish that we're not a threat. Once settled, they're typically cooperative throughout the full coat treatment.`,
        `Pomeranian grooming in Dhayari — Small dogs with opinions. We work at their pace, allow breaks, and deliver a clean rounded finish that keeps the characteristic Pomeranian profile looking sharp.`,
        `Indie dog grooming in Dhayari — A significant proportion of Dhayari's dogs are adopted Indies from the local area. We treat each one with the care of any pedigree — tick check, full skin assessment, appropriate shampoo, and a careful finish.`,
        `Golden Retriever grooming in Dhayari — The newer villa residents often have Goldens, and these dogs love being outdoors in Dhayari's more open spaces. That means muddier paws and more debris in the coat — we do a deep cleanse and full conditioning treatment every session.`,
      ],
      closingLine: `First time booking in Dhayari? We'll take a few extra minutes to introduce ourselves to your dog before starting. It makes every subsequent session smoother.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Home dog grooming at doorstep in Dhayari Pune`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/dhayari'),
  nearbyAreas: ['Warje', 'Narhe', 'Ambegaon', 'Kothrud', 'Bavdhan', 'Sus', 'Kirkatwadi', 'Nanded City'],
};

export const dhayariMapEmbed = 'https://www.google.com/maps?q=Dhayari,Pune&output=embed';

export const dhayariReviews: LocationReview[] = [
  {
    petName: 'Tommy',
    ownerName: 'Nitin Pawar',
    area: 'Dhayari Phata',
    review: 'Finding a good groomer in Dhayari has always been difficult. This service was a genuine relief — they came on time, handled Tommy without any drama, and the deshedding really worked. There is noticeably less fur on the sofas this week.',
    rating: 5,
  },
  {
    petName: 'Lily',
    ownerName: 'Shruti Mahajan',
    area: 'Narhe Road',
    review: 'Lily is a Golden Retriever and she loves rolling in the garden. She came in muddy and came out gleaming. The groomer did a proper deep wash, not just a surface rinse, and the conditioning made her coat feel softer than it has in months.',
    rating: 5,
  },
];

export const dhayariFAQs: FAQ[] = [
  {
    question: 'Does your service cover the newer plotted developments in Dhayari?',
    answer: 'Yes. We cover all residential areas in Dhayari including newer societies and plotted developments.'
  },
  {
    question: 'Can outdoor dogs or dogs with access to gardens be groomed effectively at home?',
    answer: 'Yes. We do a deeper cleanse for dogs with outdoor access and include paw pad checks for any cuts or debris.'
  },
  {
    question: 'What if my dog sheds heavily — can one session actually make a difference?',
    answer: 'Yes. A professional deshedding session removes significantly more loose undercoat than home brushing can. Most owners notice a marked reduction in daily fur accumulation for two to three weeks after a session.'
  },
  {
    question: 'Do you require anything from me before the groomer arrives?',
    answer: 'Just a water-accessible space and a quick bathroom break for your dog. Bring any existing grooming products if you have preferences — otherwise we bring everything.'
  },
  {
    question: 'Is at-home grooming available on weekends in Dhayari?',
    answer: 'Yes. Weekend slots are available though they fill faster. We recommend booking a few days in advance for preferred timings.'
  },
  {
    question: 'How long between sessions is appropriate?',
    answer: 'Every 4–6 weeks for most breeds. High-shedding breeds in summer may benefit from monthly sessions.'
  },
  {
    question: 'We are on borewell water and it runs hard. Does that affect the bath?',
    answer: 'It does, and it is a real issue across the Dhayari and Narhe side. Hard water leaves mineral residue that dulls a coat and can leave the skin itchy even after a proper rinse. Our groomers rinse longer where the water is hard and use a conditioning rinse to counter it. If your coat has looked dull after home baths, this is usually why.'
  },
  {
    question: 'Do you cover Kirkatwadi, Nanded City and the plots toward Sinhagad Road?',
    answer: 'Yes, along with Narhe and the newer plotted developments through Dhayari. It is a spread-out area with a lot of similarly named lanes, so a location pin with the booking is worth thirty seconds of your time and saves the groomer a call from somewhere near your gate.'
  },
  {
    question: 'Our dog sleeps outside in the compound at night. Does that change the grooming plan?',
    answer: 'It changes what we look for more than what we do. A dog with unrestricted night access to a compound gets a much more thorough tick inspection — between the toes, inside the ears, along the jawline and under the tail — before anything else starts. Through monsoon we would also suggest shorter paw hair so mud carries less into the house.'
  },
  {
    question: 'It gets very hot on the terrace in summer. Can the session still be done outdoors?',
    answer: 'Early morning or evening, yes. Midday on an exposed Dhayari terrace in April is genuinely too hot for a dog standing still for an hour, and heat plus a dryer is a bad combination. If outdoors is your preference for a heavy shedder, book the first or last slot of the day and we will work in shade.'
  },
  {
    question: 'We adopted an indie from the neighbourhood. Is grooming necessary for a street-origin dog?',
    answer: 'Less bathing than a pedigree coat needs, but the same tick and skin checks — arguably more of them. Indies generally have practical, self-maintaining coats and over-bathing does them no favours. What earns its keep is a real inspection every session, nail trimming, and ear checks, since these are the dogs most likely to have picked something up outdoors.'
  }
];

// ════════════════════════════════════════════════════════════
// KARVE NAGAR
// ════════════════════════════════════════════════════════════

export const karveNagarLocation: LocationConfig = {
  name: 'Karve Nagar',
  slug: 'dog-grooming-in-pune/karve-nagar',

  heroH1: `Home Dog Grooming in Karve Nagar — Trusted, Gentle, Thorough`,
  heroSubtext:
    `One of Pune's most established residential areas deserves grooming that respects the bond you have with your dog. Sniffy groomers come to you in Karve Nagar — calm, careful, and complete.`,

  storySections: [
    {
      heading: 'Karve Nagar: An Established Neighbourhood with Long-Term Dog Families',
      subheading: 'Many families here have had dogs for years. Their grooming needs reflect that.',
      paragraphs: [
        'Karve Nagar is one of Pune\'s most settled and well-regarded residential neighbourhoods. It has depth — families who have lived here for decades, multi-generational households, and a culture of community. Among pet families, we consistently find older dogs, repeat breeds that have been in the family for years, and owners who are knowledgeable, particular, and appreciative of genuine care. Our home grooming service in Karve Nagar is designed with this kind of client in mind.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Dog grooming at home in Karve Nagar Pune',
      imageLeft: true,
    },
    {
      heading: 'Gentle Handling for Senior and Long-Term Dogs',
      subheading: 'Experience shows. So does patience.',
      paragraphs: [
        'Karve Nagar has a higher proportion of senior dogs than newer residential areas — dogs who have been with families for eight, ten, even twelve years. Grooming older dogs requires a fundamentally different approach. We move more slowly, avoid prolonged standing on hard surfaces, allow more breaks, and take cues from the dog throughout. A senior dog\'s coat and skin often have specific conditions — dryness, thinning, sensitivity — and we adjust our products and techniques accordingly.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Gentle senior dog grooming in Karve Nagar',
      imageLeft: false,
    },
    {
      heading: 'Reliability That Longstanding Communities Appreciate',
      subheading: 'Punctual, professional, and consistent.',
      paragraphs: [
        'Karve Nagar residents value reliability. If a slot is confirmed, we honour it. If something causes a delay, we communicate immediately. The groomer arrives prepared, works professionally, and leaves the space clean. This is not an exceptional standard — it is the baseline. But it\'s what earns repeat trust in an area where word-of-mouth carries weight.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Professional groomer in Karve Nagar home',
      imageLeft: true,
    },
    {
      heading: 'Complete Grooming Coverage for All Karve Nagar Pockets',
      subheading: 'Paud Road to Erandwane border — we cover it all.',
      paragraphs: [
        'Karve Nagar extends through a wide residential spread touching Kothrud to the west, Erandwane to the north-east, and Warje to the south. We service all pockets within this area. Booking is by WhatsApp, and we confirm arrival windows that allow you to plan your day without waiting around.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Home grooming service across Karve Nagar',
      imageLeft: false,
    },
    {
      heading: `Breed-Specific Grooming We Offer in Karve Nagar`,
      subheading: `Long-established families, long-established breeds.`,
      paragraphs: [
        `Karve Nagar dog ownership has a particular character — less trend-driven, more considered. The breeds here are often ones that families have kept for generations: Indian Spitz, Labradors, Pomeranians, and a solid presence of Alsatians (German Shepherds) in the older independent homes. We also see a healthy number of rescues — both dogs and cats — adopted by families who wanted to give a local animal a permanent home. Every one of these gets the same serious attention.`,
        `The breeds we groom most in Karve Nagar:`,
      ],
      bullets: [
        `Indian Spitz grooming in Karve Nagar — One of the most loyal breeds in Pune households for three decades. The thick double coat needs regular deshedding, especially in summer. We do a full blow-out, trim the ears and paw pads, and restore the breed's characteristic fluffy silhouette.`,
        `Labrador grooming in Karve Nagar — Many of our Karve Nagar Labradors are senior dogs. We use non-slip mats, take breaks freely, and give special attention to paw pads which can develop calluses in older Labs.`,
        `German Shepherd grooming in Karve Nagar — The Alsatians in the older independent homes here are often large, strong, and accustomed to having space. We handle them confidently and ground the session in calm authority rather than restraint.`,
        `Pomeranian grooming in Karve Nagar — Small but very much in charge. We've learned to let Karve Nagar Pomeranians set the initial pace — once they've decided they're comfortable, the rest of the session goes smoothly.`,
        `Dachshund grooming in Karve Nagar — Both smooth and long-haired varieties are common here. Long-haired Dachshunds especially need regular ear and underbelly fur management. We trim carefully and check the ear canals in every session.`,
        `Rescued cat grooming in Karve Nagar — Karve Nagar has an active rescue community and many cats in the area need grooming. We provide gentle, patient cat grooming for both domestic and long-haired breeds.`,
      ],
      closingLine: `For senior dogs, please mention their age and any health conditions when booking. We'll plan the session accordingly.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Breed-specific home dog grooming in Karve Nagar Pune`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/karve-nagar'),
  nearbyAreas: ['Kothrud', 'Erandwane', 'Warje', 'Anand Nagar', 'Paud Road', 'Shivajinagar', 'Shivane', 'Dahanukar Colony'],
};

export const karveNagarMapEmbed = 'https://www.google.com/maps?q=Karve+Nagar,Pune&output=embed';

export const karveNagarReviews: LocationReview[] = [
  {
    petName: 'Whiskey',
    ownerName: 'Arun Joshi',
    area: 'Karve Nagar',
    review: `Whiskey is fourteen years old and grooming him has become progressively more careful work. The Sniffy groomer understood that immediately — slow movements, no rushing, breaks when needed. Whiskey came out looking genuinely clean and seemed completely unstressed afterward. This is exactly what an elderly dog needs.`,
    rating: 5,
  },
  {
    petName: 'Coco',
    ownerName: 'Meenakshi Gokhale',
    area: 'Dahanukar Colony',
    review: 'We\'ve had the same groomer twice now and the difference in Coco\'s cooperation is visible. She recognised the groomer this time and settled in immediately. Consistency in grooming staff matters so much for nervous small dogs.',
    rating: 5,
  },
];

export const karveNagarFAQs: FAQ[] = [
  {
    question: 'How do you handle very old or senior dogs during grooming?',
    answer: 'We slow the entire session down — more breaks, gentler restraint, monitoring the dog\'s energy levels throughout. We also avoid prolonged standing and use non-slip surfaces so older dogs feel secure.'
  },
  {
    question: 'Do you send the same groomer for repeat bookings?',
    answer: 'We do this wherever possible. Groomer consistency reduces anxiety for dogs who remember familiar people. In Karve Nagar especially, this has made a visible difference in our repeat clients\' dogs.'
  },
  {
    question: 'What if my dog has health conditions that affect grooming?',
    answer: 'Please mention any health conditions when booking — arthritis, skin conditions, ear problems, anxiety. We adjust our approach accordingly and always work within what the dog is comfortable with.'
  },
  {
    question: 'Do you groom both dogs and cats?',
    answer: 'Yes. Cat grooming is available in Karve Nagar, including for long-haired domestic cats and Persians.'
  },
  {
    question: 'Are your shampoos suitable for dogs with skin sensitivities?',
    answer: 'Yes. We carry mild, fragrance-free, and hypoallergenic options for dogs with documented sensitivities. Mention this when booking and we\'ll prepare accordingly.'
  },
  {
    question: 'How do I know the session is going well if I\'m not watching?',
    answer: 'We brief you fully at the end — what we observed, what we did, and anything to watch for. Your dog\'s demeanour after the session is often the best indicator: a calm, relaxed dog means the session went well.'
  },
  {
    question: 'Do you cover Dahanukar Colony, Erandwane and the Anand Nagar side?',
    answer: 'Yes, along with the Warje and Shivane end of Karve Nagar. It is a dense, well-established area and easy for us to reach, which usually means we can hold tighter arrival windows here than in the outlying parts of the city.'
  },
  {
    question: 'Water pressure in our older building is weak. Is that a problem for bathing?',
    answer: 'Not really. The groomer works from a bucket for the lather and rinse stages anyway, so a thin tap is slower to fill but changes nothing about the wash itself. If your supply is timed rather than just weak, keep three or four buckets ready before the slot and the session runs exactly as it would otherwise.'
  },
  {
    question: 'How does booking work during Ganpati week around here?',
    answer: 'Book well ahead — a week at minimum. The lanes off Karve Road and Paud Road become genuinely unpredictable during processions and we cannot hold arrival windows the way we normally would. For a noise-sensitive dog, the more useful plan is to groom in the quiet week before the festival rather than during it.'
  },
  {
    question: 'Our grandchildren are usually at home. Is it a problem if kids are around during the session?',
    answer: 'Only if the dog is not used to it, and in a house where children are always present that is rarely the case. What genuinely helps is keeping children out of the room during the dryer and clipper stages — a dog managing a loud tool plus excited kids has two things to cope with, and the clipper stage is the one where a startled movement matters most.'
  },
  {
    question: 'Can I book a nail trim on its own between full sessions?',
    answer: 'Yes. A short maintenance visit for nails, ear cleaning and a paw-hair trim is available below package price — ask for it by name. For a senior or short-coated dog it is often all that is genuinely needed between full grooms, and it saves putting an older dog through a full bath more often than the coat requires.'
  }
];

// ════════════════════════════════════════════════════════════
// AMBEGAON
// ════════════════════════════════════════════════════════════

export const ambegaonLocation: LocationConfig = {
  name: 'Ambegaon',
  slug: 'dog-grooming-in-pune/ambegaon',

  heroH1: `At-Home Dog Grooming in Ambegaon — Professional Care at Your Doorstep`,
  heroSubtext:
    `Ambegaon's growing residential communities now have access to quality home dog grooming. Sniffy groomers visit your home — so your dog gets proper care without either of you going anywhere.`,

  storySections: [
    {
      heading: `Quality Grooming Doesn't Have to Mean Driving Far`,
      subheading: `Home service built for Ambegaon's expanding families.`,
      paragraphs: [
        'Ambegaon Budruk and Pathar have emerged as significant residential areas for families seeking more space without sacrificing Pune connectivity. As these communities have grown, so has the need for quality pet services that come to them rather than demanding they travel. Our at-home dog grooming in Ambegaon solves this directly — a certified groomer travels to your door with full equipment, handles the session professionally, and leaves your dog genuinely clean and your home genuinely tidy.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Ambegaon Pune',
      imageLeft: true,
    },
    {
      heading: 'Designed Around Spacious Layouts',
      subheading: 'More space often means a better grooming session.',
      paragraphs: [
        'Ambegaon properties tend to have more space than central Pune equivalents — larger balconies, dedicated utility areas, sometimes private terraces. These spaces are ideal for grooming. Good airflow, enough room for the dog to stand comfortably, and no concerns about the dryer noise bothering close neighbours. We make full use of whatever space you have available.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Grooming session in Ambegaon property',
      imageLeft: false,
    },
    {
      heading: 'Preventive Health Through Regular Grooming',
      subheading: 'More than aesthetics.',
      paragraphs: [
        'Dog families in Ambegaon often have dogs that spend time outdoors in the area\'s gardens and open spaces. This increases tick exposure, paw pad wear, and coat debris accumulation. Our sessions address all of this — tick checks, paw inspections, deep cleansing, and ear hygiene. What looks like a grooming appointment is also a preventive health check at the surface level.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Preventive dog grooming health check in Ambegaon',
      imageLeft: true,
    },
    {
      heading: 'Trustworthy Service in a Community That Values It',
      subheading: 'Repeat clients are our standard.',
      paragraphs: [
        'Ambegaon is a close-knit residential community where recommendations travel fast. We\'ve built our client base here predominantly through word-of-mouth. That happens because we do what we say we\'ll do — arrive on time, groom thoroughly, clean up completely, and tell the dog parent honestly what we observed. Trust is earned session by session.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy groomed dog in Ambegaon',
      imageLeft: false,
    },
    {
      heading: `Dog Breeds We Groom in Ambegaon — Tailored Every Time`,
      subheading: `Spacious homes, active dogs, seasonal demands.`,
      paragraphs: [
        `Ambegaon dogs tend to be more outdoorsy than their counterparts in dense urban apartments. Dogs here roam larger properties, play in gardens, and sometimes have access to open ground in the area. That translates to coats that carry more debris, paws that need more attention, and tick checks that are genuinely important. Our grooming in Ambegaon is calibrated for active, outdoor-access dogs.`,
        `The breeds we groom most in Ambegaon:`,
      ],
      bullets: [
        `Labrador grooming in Ambegaon — Active Labs in Ambegaon gardens come in with mud and debris in their short coats. We do a thorough pre-wash brush-out to remove loose particles, followed by a deep cleanse and full deshedding protocol.`,
        `German Shepherd grooming in Ambegaon — Outdoor GSDs accumulate significant undercoat debris in Pune's dust season. Regular deshedding is essential for their comfort and keeps the famous GSD fur somewhat manageable inside the home.`,
        `Rottweiler grooming in Ambegaon — Short coats but strong dogs who need confident handling. We focus on rubber curry brushing for coat and skin stimulation, nail care, and ear checks that many Rottweiler owners overlook.`,
        `Golden Retriever grooming in Ambegaon — Outdoor Goldens in Ambegaon often have heavily soiled feathering around the legs and belly. We address this with a targeted pre-clean before the full bath and a thorough blow-dry that lifts dirt from deep in the undercoat.`,
        `Indie dog grooming in Ambegaon — Outdoor-access Indies in Ambegaon are at higher tick risk than apartment dogs. We do a thorough tick check covering the ears, neck, underbelly, and between the toes in every session.`,
        `Dachshund grooming in Ambegaon — Small dogs who love digging. We check paws carefully, clean between the toes, and give special attention to the underbelly fur which picks up garden debris easily.`,
      ],
      closingLine: `Dogs with outdoor access should ideally be groomed monthly to stay on top of tick risk and coat hygiene.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `At-home dog grooming for outdoor dogs in Ambegaon Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/ambegaon'),
  nearbyAreas: ['Dhayari', 'Katraj', 'Narhe', 'Sus', 'Kirkatwadi', 'Kothrud', 'Warje', 'Nanded City'],
};

export const ambegaonMapEmbed = 'https://www.google.com/maps?q=Ambegaon,Pune&output=embed';

export const ambegaonReviews: LocationReview[] = [
  {
    petName: 'Rex',
    ownerName: 'Mahesh Deshmukh',
    area: 'Ambegaon Budruk',
    review: 'Rex has access to the garden and always comes in covered in something. The groomer did a proper deep wash — not just a rinse — and the deshedding was thorough. He went from outdoor dog to clean apartment dog in about ninety minutes. Happy with the service.',
    rating: 5,
  },
  {
    petName: 'Momo',
    ownerName: 'Swapna Jadhav',
    area: 'Ambegaon Pathar',
    review: `Momo is a Dachshund who loves digging and always has dirty paws. The groomer cleaned between every toe and checked the pads carefully — something I hadn't seen a groomer do before. Little details like that make a real difference.`,
    rating: 5,
  },
];

export const ambegaonFAQs: FAQ[] = [
  {
    question: 'Are your groomers experienced with dogs that spend time outdoors?',
    answer: 'Yes. Outdoor dogs often have more debris in their coats, higher tick exposure, and dirtier paws. We adjust our pre-session assessment and grooming protocol accordingly.'
  },
  {
    question: 'How thorough is the tick check?',
    answer: 'We check all the high-risk areas — ears, neck, underbelly, between the toes, and around the tail. If we find anything, we tell you immediately.'
  },
  {
    question: 'Can I book on a monthly recurring basis?',
    answer: 'Yes. Monthly recurring bookings are popular in Ambegaon particularly for outdoor-access dogs.'
  },
  {
    question: 'Is a large garden space suitable for the grooming setup?',
    answer: 'A covered outdoor space or garden area works well for larger breeds. We do need water access and shelter from direct sun during the session.'
  },
  {
    question: 'What happens to the fur during and after the session?',
    answer: 'We contain shed fur throughout the session and clean up completely afterward. The working area is left clean when we\'re done.'
  },
  {
    question: 'Is grooming suitable for dogs who haven\'t been groomed before?',
    answer: 'Yes. We take extra time with first-time grooming experiences — introducing tools gradually and letting the dog set the pace early in the session.'
  },
  {
    question: 'Do you cover Nanded City, Kirkatwadi and the plots toward Sinhagad Road?',
    answer: 'Yes, including the Narhe and Katraj side of Ambegaon. This belt is spread out with a lot of similar lane names, so send a location pin with the booking — it is the difference between the groomer arriving at your gate and calling you from somewhere near it.'
  },
  {
    question: 'We are on borewell water. Does hard water affect the coat?',
    answer: 'It does. Hard water leaves mineral residue that dulls the coat and can leave skin itchy even after what feels like a proper rinse — a common complaint on this side of the city. Our groomers rinse for longer where the water is hard and finish with a conditioning rinse to counter it.'
  },
  {
    question: 'Street dogs come up to our compound. Does that matter for grooming?',
    answer: 'It matters for what we inspect rather than what we do. Regular contact with free-ranging dogs raises the odds of ticks and skin issues, so the check at the start of the session is more thorough — between the toes, ears, jawline and under the tail. If we find something we tell you and show you where, rather than treating it silently.'
  },
  {
    question: 'Power cuts are frequent here. What happens if the electricity goes mid-session?',
    answer: 'Only the dryer needs power, so a cut pauses the session rather than ending it. If you have an inverter, tell the groomer which sockets are on backup. What we will not do is leave a dog part-dried and go — if power is genuinely out we towel-dry thoroughly and wait for it rather than call the session finished.'
  },
  {
    question: 'Our dog spends most of the day outdoors on the plot. How often should we groom?',
    answer: 'Every six to eight weeks for most outdoor-living coats, with a tick check every single session regardless of the gap. The bath frequency is a coat decision; the inspection frequency is not. Through monsoon we would tighten that toward six weeks and add shorter paw-hair trims so less mud comes indoors.'
  }
];

// ════════════════════════════════════════════════════════════
// BANER
// ════════════════════════════════════════════════════════════

export const banerLocation: LocationConfig = {
  name: 'Baner',
  slug: 'dog-grooming-in-pune/baner',

  heroH1: `Home Dog Grooming in Baner — Expert Care for Pune's Favourite IT Suburb`,
  heroSubtext:
    'Baner moves fast. So do we. Professional at-home dog grooming with morning-to-evening slots — no salon, no traffic, no waiting.',

  storySections: [
    {
      heading: 'Baner Lives at Pace — Our Service Keeps Up',
      subheading: 'Flexible scheduling for the Baner lifestyle.',
      paragraphs: [
        `Baner is home to a concentrated population of IT professionals, startup founders, and young families who have made this corner of Pune's western corridor one of its most energetic neighbourhoods. The pace here is high, and premium services that work around people\'s schedules are what get used and recommended. Our home dog grooming in Baner is designed precisely for this — quick to book, punctual to arrive, efficient to execute, and genuinely excellent in result.`
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Baner Pune',
      imageLeft: true,
    },
    {
      heading: 'Apartment-Smart Setup, Every Time',
      subheading: 'Built for Baner\'s high-rise density.',
      paragraphs: [
        'Baner\'s residential landscape is predominantly high-rise apartments and large gated complexes — Legacy, Amanora, Gera, and dozens of similar developments. Our setup is engineered for exactly these environments. Quiet dryers, controlled water usage, a compact footprint, and complete post-session cleanup. We\'ve operated in hundreds of Baner apartments without a single complaint from building management.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Apartment grooming setup in Baner high-rise',
      imageLeft: false,
    },
    {
      heading: 'Thorough Grooming, Not Just a Surface Clean',
      subheading: 'This is why clients rebook.',
      paragraphs: [
        'Baner dogs are often active — morning runs on the Baner-Pashan link road, evenings in society parks, the occasional Mulshi weekend. Coats pick up dust, pollen, and debris that a quick salon bath doesn\'t properly address. Our approach uses deshedding shampoos and a proper blow-dry technique that lifts particles from deep in the coat, not just from the surface. The difference is visible and tactile — you\'ll feel it when you run your hand through your dog\'s coat after the session.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Thorough coat grooming for active dog in Baner',
      imageLeft: true,
    },
    {
      heading: 'One Booking, Complete Service',
      subheading: 'Bath to finishing in a single visit.',
      paragraphs: [
        'Every Baner session covers bathing, blow-drying, brushing, nail trimming, ear cleaning, and sanitary trim. Haircut styling and coat conditioning are add-ons that can be combined. We bring everything. You just need water access and a space to work. From booking confirmation to session completion, the whole experience is designed to be low-friction for you.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Complete grooming service at home in Baner',
      imageLeft: false,
    },
    {
      heading: `The Dogs of Baner — What They Need and How We Deliver`,
      subheading: `Western Pune's most diverse dog demographic.`,
      paragraphs: [
        `Baner has one of Pune's most varied dog populations — partly because it attracts people from all over India and abroad. The breed variety here is genuinely interesting. We see large European breeds, working breeds, designer doodles, and a very active Indie rescue community all within a few square kilometres. The one thing they have in common is owners who care deeply and expect thoroughness.`,
        `Our breed-specific approach for Baner's most commonly booked dogs:`,
      ],
      bullets: [
        `Husky grooming in Baner — Baner Huskies run hard and overheat in Pune's summers. We do a serious deshedding blow-out — not a shave — that removes the loose undercoat and genuinely helps thermoregulation. Don't let anyone shave a Husky's double coat; it causes permanent damage.`,
        `Labrador grooming in Baner — Always the highest volume booking in any active Pune neighbourhood. Full deshedding, ear flush, paw check. We don't skip these even for the most routine-looking Lab.`,
        `Doodle grooming in Baner — Baner has a high density of Doodles — Goldendoodles, Labradoodles, Bernedoodles. Curly non-shedding coats mat rapidly without very regular grooming. We detangle before bathing, wash thoroughly, and shape the coat per the owner's preference.`,
        `Border Collie grooming in Baner — We see a fair few Borders in Baner — active dogs with active owners. Double coats need regular deshedding and we work carefully around the sensitive collar area where friction causes matting.`,
        `Shih Tzu and Lhasa grooming in Baner — Long-coated small breeds in Baner's humidity develop mats quickly. We brush before bathing, use a conditioning treatment, and deliver a clean precise finish every time.`,
        `Indie rescue grooming in Baner — Baner has an active rescue community and many of our clients here have adopted Indies. We treat them exactly as we would any pedigree — full assessment, appropriate products, patient handling.`,
      ],
      closingLine: `For Doodle owners in Baner: we strongly recommend four-weekly sessions. The curly coat mats faster than most owners realise, and early intervention is much easier than dealing with a fully matted coat.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Breed-specific home dog grooming in Baner Pune`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/baner'),
  nearbyAreas: ['Balewadi', 'Aundh', 'Wakad', 'Hinjewadi', 'Pashan', 'Sus', 'Pimple Saudagar', 'Bavdhan'],
};

export const banerMapEmbed = 'https://www.google.com/maps?q=Baner,Pune&output=embed';

export const banerReviews: LocationReview[] = [
  {
    petName: 'Milo',
    ownerName: 'Tanvi Nair',
    area: 'Baner Road',
    review: 'I work from home and was worried about the grooming session disrupting my call schedule. The groomer arrived exactly on time, set up quietly in the bathroom, and completed everything while I was in back-to-back calls. Milo was clean, calm, and happy. Service was completely seamless.',
    rating: 5,
  },
  {
    petName: 'Honey',
    ownerName: 'Arpit Gupta',
    area: 'Legacy Avilion',
    review: `Honey is a Goldendoodle and her coat is a constant battle against matting. The groomer worked through the tangles methodically — didn't immediately reach for clippers — and the result was clean, even, and mat-free. This is the kind of patience Doodle owners need.`,
    rating: 5,
  },
];

export const banerFAQs: FAQ[] = [
  {
    question: 'Can I book same-day or next-day grooming in Baner?',
    answer: 'We try to accommodate short-notice bookings subject to availability. For best slot selection, booking 48 hours ahead is recommended.'
  },
  {
    question: 'How do I get Doodle grooming right — what frequency is needed?',
    answer: 'Every four to five weeks for most Doodle coats. Daily brushing with a slicker brush between sessions prevents the matting that makes each session harder than the last.'
  },
  {
    question: 'Is your grooming setup compliant with large society rules in Baner?',
    answer: 'Yes. We have operated in virtually every major society in Baner without any management complaints. Our setup is compact, quiet, and leaves no trace.'
  },
  {
    question: 'What if my dog dislikes the dryer?',
    answer: 'We use controlled airflow and work from a distance initially, gradually reducing the gap as the dog becomes comfortable. Most dryer-anxious dogs adapt well in a home environment.'
  },
  {
    question: 'Do you do breed-specific haircuts?',
    answer: 'Yes. Show trims, breed-standard cuts, and practical summer cuts are all available. Send a reference image when booking for style-specific requests.'
  },
  {
    question: 'Is Baner Pashan Link Road area covered?',
    answer: 'Yes. We cover all residential areas within Baner including those toward Pashan and Sus.'
  },
  {
    question: 'What weekend slots do you have? Weekdays are impossible for us.',
    answer: 'We run Saturday and Sunday at the same hours as weekdays, 9 AM to 9 PM, and Baner weekend slots are the fastest-filling ones we have — the IT working week concentrates demand into two days here more than in any other area. Book four or five days ahead for a weekend slot rather than trying on Friday.'
  },
  {
    question: 'How soon after my puppy\'s vaccinations can the first grooming happen?',
    answer: 'Once the core course is complete, usually around twelve to sixteen weeks — check with your vet where your puppy sits in the schedule. The first session should be deliberately short: paws and ears handled, a comb through, the dryer heard from a distance rather than used at full strength. It is an introduction, not a full groom.'
  },
  {
    question: 'Construction dust from the Sus and Balewadi side is constant. Does that shorten the grooming cycle?',
    answer: 'Yes, by a couple of weeks for most coats. Fine construction dust settles into the undercoat rather than on top of it and leaves the coat dull and slightly gritty. A dog living beside active building work in Baner usually holds condition better on six weeks than on the eight its coat type alone would suggest.'
  },
  {
    question: 'Can you groom two dogs of very different sizes in one visit?',
    answer: 'Yes — tell us both breeds at booking so we block a realistic slot, because a Doodle and a Beagle together is close to a double session rather than one and a half. They are groomed one at a time, and we usually ask that the waiting dog stays in another room. A dog watching another being dried tends to wind itself up.'
  },
  {
    question: 'I will be on calls the whole time. Is that a problem?',
    answer: 'Not at all, and it is how a large share of our Baner sessions run. The groomer needs about two minutes of your attention at the start to agree the plan and length, and two at the end to walk you through what they found. In between they work independently. Just stay reachable in case something on the coat or skin needs a decision.'
  }
];

// ════════════════════════════════════════════════════════════
// BAVDHAN
// ════════════════════════════════════════════════════════════

export const bavdhanLocation: LocationConfig = {
  name: 'Bavdhan',
  slug: 'dog-grooming-in-pune/bavdhan',

  heroH1: `Home Dog Grooming in Bavdhan — Where Quality Meets Convenience`,
  heroSubtext:
    `Bavdhan's hillside communities and lush surroundings deserve grooming that's as thoughtful as where you live. Sniffy brings professional home grooming straight to your door.`,

  storySections: [
    {
      heading: `Bavdhan's Unique Character — And What It Means for Your Dog`,
      subheading: 'Green, elevated, and slightly apart from the city.',
      paragraphs: [
        'Bavdhan sits higher than most of Pune — cooler in summers, greener year-round, and with a distinctly different environment from the urban core. Families choose Bavdhan for its space, clean air, and sense of distance from the city\'s density. Their dogs benefit from that environment: more outdoor time, more fresh air, more exercise. But more outdoor time also means more debris in coats, more tick exposure, and more frequent need for proper grooming. Our home service in Bavdhan is built for exactly this kind of active, outdoors-adjacent dog family.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Bavdhan Pune',
      imageLeft: true,
    },
    {
      heading: 'Independent Houses and Society Complexes — We Work in Both',
      subheading: 'Flexible setup for Bavdhan\'s range of property types.',
      paragraphs: [
        'Bavdhan has a mix of independent properties on larger plots and newer society complexes that have come up on the hillside slopes. Our setup works in both. For independent homes, garden and terrace spaces are excellent grooming environments. For apartments, we set up indoors with our compact, quiet equipment. Either way, we bring everything needed and leave nothing behind except a clean dog.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Dog grooming in Bavdhan independent house garden',
      imageLeft: false,
    },
    {
      heading: 'Active Dogs Need Active Grooming Management',
      subheading: 'More exercise means more grooming needs.',
      paragraphs: [
        'Bavdhan dogs that run in the hillside areas and open spaces come in with coat conditions that reflect that activity — debris, occasional ticks, dusty undercoats. We do a thorough pre-session coat assessment, adjust our shampoo selection accordingly, and make sure the deshedding component of the session is genuinely effective rather than cosmetic. A properly groomed active dog stays comfortable, healthy, and — importantly — brings less of the outside world onto your furniture.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Active dog grooming after outdoor activity in Bavdhan',
      imageLeft: true,
    },
    {
      heading: 'Bavdhan Dog Parents Deserve the Same Quality as Central Pune',
      subheading: 'Distance is not a reason for lesser service.',
      paragraphs: [
        'Bavdhan\'s slightly removed location from central Pune\'s service concentration has historically meant fewer quality options for pet care. We bring the same level of grooming expertise, product quality, and professional standards to Bavdhan as we do to Koregaon Park or Kalyani Nagar. Location should not dictate quality. Every dog deserves a great groomer at the door.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy perfectly groomed dog in Bavdhan',
      imageLeft: false,
    },
    {
      heading: `Breeds We Groom in Bavdhan — Active, Well-Cared-For Dogs`,
      subheading: `Hillside living produces a particular kind of dog parent.`,
      paragraphs: [
        `Bavdhan dog owners are often health-conscious and attentive — they chose this neighbourhood deliberately, they exercise their dogs regularly, and they approach pet care with the same intentionality. When they find a grooming service that matches that standard, they become loyal regulars. The breeds here reflect active outdoor lifestyles — Labradors, Golden Retrievers, Huskies, German Shepherds — as well as the smaller, longer-lived companion breeds in the older homes.`,
        `What we do for Bavdhan's most common breeds:`,
      ],
      bullets: [
        `Labrador grooming in Bavdhan — Active Bavdhan Labs need thorough deshedding to manage the dust and debris they accumulate on hillside runs. We do a full deshedding protocol every session — not just a surface bath.`,
        `Golden Retriever grooming in Bavdhan — Outdoor Goldens have debris-collecting feathering that needs attention at every session. We deep-condition the undercoat, address the feathering carefully, and finish with a proper blow-dry.`,
        `Husky grooming in Bavdhan — Bavdhan's cooler climate makes it more manageable for Huskies than central Pune, but proper deshedding is still essential. We do a complete blow-out session that removes the loose undercoat safely.`,
        `German Shepherd grooming in Bavdhan — Strong outdoor dogs that need confident handling. We focus on undercoat removal and ear hygiene — the two most impactful elements for GSD comfort.`,
        `Beagle grooming in Bavdhan — Beagles in outdoor environments accumulate more ear debris than apartment dogs. We give extra attention to ear cleaning in every Bavdhan Beagle session.`,
        `Indian Spitz grooming in Bavdhan — Still common in Bavdhan's older homes. The double coat needs deshedding every six to eight weeks and the breed's characteristic silhouette needs a careful final brush-through to restore properly.`,
      ],
      closingLine: `Outdoor-access dogs in Bavdhan should have a monthly grooming schedule. It's the most effective way to stay on top of tick risk and coat accumulation.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Active dog home grooming in Bavdhan Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/bavdhan'),
  nearbyAreas: ['Pashan', 'Sus', 'Baner', 'Kothrud', 'Warje', 'Paud Road', 'Shivane', 'Chandni Chowk'],
};

export const bavdhanMapEmbed = 'https://www.google.com/maps?q=Bavdhan,Pune&output=embed';

export const bavdhanReviews: LocationReview[] = [
  {
    petName: 'Scout',
    ownerName: 'Akash Rane',
    area: 'Bavdhan Khurd',
    review: 'Scout runs on the hillside trails every morning and his coat shows it. The groomer did a proper deep clean — not just a rinse — and the deshedding treatment made a real difference. His fur is visibly softer and I haven\'t found half as many debris pieces in it this week.',
    rating: 5,
  },
  {
    petName: 'Bella',
    ownerName: 'Rohan Kelkar',
    area: 'Bavdhan Budruk',
    review: 'I was sceptical about home grooming for our Golden because she needs so much coat work. The groomer was very thorough — the feathering on her legs and tail was properly addressed, not just surface-washed. She came out looking and smelling like a show dog.',
    rating: 5,
  },
];

export const bavdhanFAQs: FAQ[] = [
  {
    question: 'Do you service the hillside residential areas of Bavdhan?',
    answer: 'Yes. We cover all residential areas in Bavdhan including those on the hillside developments.'
  },
  {
    question: 'How do you handle dogs with high outdoor activity and debris accumulation?',
    answer: 'We do a coat condition assessment before starting and adjust our protocol accordingly. For debris-heavy coats, we include a pre-session dry brush to remove loose particles before the bath.'
  },
  {
    question: 'Can grooming be done in a garden or terrace space?',
    answer: 'Yes. Covered outdoor spaces are excellent for grooming — particularly for drying. We need water access and some shelter from direct sun.'
  },
  {
    question: 'How do you manage tick checks for outdoor dogs?',
    answer: 'Every session includes a thorough tick check covering ears, neck, underbelly, between toes, and the tail base. For high-risk outdoor dogs we use a mild anti-parasitic shampoo.'
  },
  {
    question: 'Is monthly grooming necessary for outdoor-access dogs?',
    answer: 'For dogs with regular outdoor access in Bavdhan, monthly sessions are genuinely recommended — both for tick management and coat health.'
  },
  {
    question: 'What if my dog returns from a run just before the grooming appointment?',
    answer: 'A slightly tired dog is often easier to groom. If they\'ve come back muddy, we adjust the pre-wash protocol. Just let the groomer know when they arrive.'
  },
  {
    question: 'We hike with our dog on the hills here. Should we check for anything beyond ticks?',
    answer: 'Grass seeds and burrs, which are the specific hazard of the Bavdhan and Chandni Chowk trails. They work between the toes and into the ear canal and can migrate under the skin if they are left. Our groomers check the webbing between every toe and inside both ears as standard, and it is one of the more valuable things a session does for a hill-walking dog.'
  },
  {
    question: 'What is a realistic slot given Chandni Chowk traffic?',
    answer: 'Mid-morning or early afternoon. The Chandni Chowk approach at peak hours is one of the least predictable stretches in the city and we would rather book you into a window we can genuinely hold than commit to a 7 PM arrival we end up apologising for. If evening is your only option, expect a wider arrival window.'
  },
  {
    question: 'The rocky ground here is hard on paws. Do you do anything for that?',
    answer: 'Every session includes a paw check — pads for cracks and abrasion, hair between the pads trimmed back so grit does not pack in, and nails taken to a length that lets the paw sit flat. On the hillside side of Bavdhan we see more pad wear than anywhere else we work, and a long nail on rocky ground changes how the whole foot loads.'
  },
  {
    question: 'Our dog is a large breed and we live on an upper floor without a lift. Does that work?',
    answer: 'It works for us — the kit fits in one shoulder bag. The real question is your dog. If a heavy or older dog manages the stairs comfortably in daily life then nothing changes; if it does not, we would rather set up on the ground floor than have the dog do an unnecessary climb before standing still for an hour.'
  },
  {
    question: 'Our dog gets a lot of direct sun. Does that affect the coat?',
    answer: 'It does — sustained sun exposure lightens and dries the guard hairs, and it is visible on dark coats in particular by the end of summer. A conditioning treatment during the session helps the coat hold moisture, and the more important rule is the one people get wrong: do not shave a double coat for the heat. The undercoat is what is shielding the skin from that sun.'
  }
];

// ════════════════════════════════════════════════════════════
// KHADKI
// ════════════════════════════════════════════════════════════

export const khadkiLocation: LocationConfig = {
  name: 'Khadki',
  slug: 'dog-grooming-in-pune/khadki',

  heroH1: `Home Dog Grooming in Khadki — Defence Colony to Civilian Society`,
  heroSubtext:
    `Khadki's residential communities — military and civilian alike — deserve grooming that comes to them. Sniffy provides certified home grooming in Khadki with the discipline and reliability this neighbourhood respects.`,

  storySections: [
    {
      heading: `Khadki's Dog Families Span Two Very Different Worlds`,
      subheading: 'Cantonment discipline meets civilian convenience.',
      paragraphs: [
        `Khadki is unique in Pune — it sits between the cantonment's ordered, community-focused residential zones and the more urban civilian neighbourhoods on its borders. Dog families in both parts of Khadki share a respect for reliability and proper standards. Our at-home grooming in Khadki matches that expectation — arrive when confirmed, work methodically, maintain hygiene throughout, and leave with a clean dog and a clean space.`
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Khadki Pune',
      imageLeft: true,
    },
    {
      heading: 'Space Is Not a Constraint in Khadki',
      subheading: 'Bungalows, larger apartments, and community homes.',
      paragraphs: [
        'Cantonment residential areas in Khadki often have generous layouts — larger rooms, service areas, gardens. This makes for an excellent home grooming environment. We make the most of available space while keeping our footprint and mess absolutely minimal. For residents in the surrounding civilian areas, our setup works equally well in compact apartments or society complexes.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Dog grooming setup in Khadki bungalow',
      imageLeft: false,
    },
    {
      heading: 'Consistent, Reliable, Repeat-Worthy',
      subheading: 'Reliability is the core of any good service.',
      paragraphs: [
        'In a community that values punctuality and professionalism, our standard approach aligns well. We confirm arrival times and stick to them. We communicate any changes proactively. We don\'t cut corners mid-session. The grooming process is the same regardless of whether it\'s your first session or your fifteenth. That consistency builds trust that makes long-term relationships possible.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Professional groomer in Khadki home',
      imageLeft: true,
    },
    {
      heading: 'Full Grooming Coverage with Clear Pricing',
      subheading: 'No ambiguity. No surprises.',
      paragraphs: [
        'Standard sessions include bathing, blow-drying, brushing, nail trimming, ear cleaning, and sanitary trim. Haircut styling is available as an add-on. All pricing is discussed before the session begins. Khadki families appreciate straightforward, honest service and that\'s what we provide.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy groomed dog in Khadki cantonment area',
      imageLeft: false,
    },
    {
      heading: `Breeds We Groom in Khadki — Discipline in Every Session`,
      subheading: `Military precision applied to coat care.`,
      paragraphs: [
        `Khadki dog families — particularly those in cantonment areas — often keep working or sporting breeds. Labradors are very common, as are German Shepherds and Dobermanns. In the civilian pockets bordering Shivajinagar and Aundh, the variety broadens to include small breeds, Indies, and companion dogs. Every one of these needs different handling and different product selection.`,
        `Our approach to Khadki's most common breeds:`,
      ],
      bullets: [
        `Labrador grooming in Khadki — Our most-booked breed in this area. Full deshedding, thorough ear flush, and paw pad inspection. Many cantonment Labradors are very well-trained and cooperate easily, which means we can do an unusually thorough job.`,
        `German Shepherd grooming in Khadki — Disciplined dogs who respond well to calm, confident handling. We do a full deshedding treatment, ear check, and nail trim in every session. GSDs in active cantonment environments need regular coat management.`,
        `Dobermann grooming in Khadki — Short sleek coats that need skin attention more than coat styling. We use a rubber curry brush for stimulation, check nails carefully, and give the ears a thorough clean.`,
        `Boxer grooming in Khadki — Short coats, energetic temperament. We use a firm bristle brush for the body, clean the facial folds carefully, and do a full nail and ear check.`,
        `Pomeranian grooming in Khadki — Beloved small companions in the cantonment residential areas. Patient handling, careful coat brushing, and a neat finish that showcases the breed's characteristic profile.`,
        `Indie dog grooming in Khadki — Many well-cared-for Indies live in Khadki's cantonment quarters and civilian societies. We treat every Indie with full professional attention — skin check, tick check, appropriate products.`,
      ],
      closingLine: `For service or retired working dogs that need especially patient or carefully paced sessions, please mention this when booking.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Professional home dog grooming in Khadki Pune cantonment`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/khadki'),
  nearbyAreas: ['Aundh', 'Shivajinagar', 'Dapodi', 'Pimpri Road', 'Chinchwad', 'Pimple Gurav', 'Sangvi', 'Wakad'],
};

export const khadkiMapEmbed = 'https://www.google.com/maps?q=Khadki,Pune&output=embed';

export const khadkiReviews: LocationReview[] = [
  {
    petName: 'Max',
    ownerName: 'Col. Sanjay Rathore (Retd.)',
    area: 'Khadki Cantonment',
    review: 'Reliability is everything. The groomer arrived within the confirmed window, worked methodically, and cleaned up completely. Max — a seven-year-old Lab — cooperated throughout. This is the standard of service I expect and it was delivered without exception.',
    rating: 5,
  },
  {
    petName: 'Simba',
    ownerName: 'Kavita Sharma',
    area: 'Khadki',
    review: 'Simba is a Dobermann and many groomers are nervous around him. This groomer walked in calm and confident and Simba responded to that. The session was smooth and the coat looked excellent afterward.',
    rating: 5,
  },
];

export const khadkiFAQs: FAQ[] = [
  {
    question: 'Do you service cantonment residential areas in Khadki?',
    answer: 'Yes. We service all residential areas in Khadki including cantonment quarters and civilian neighbourhoods.'
  },
  {
    question: 'Can you handle working or high-drive dog breeds?',
    answer: 'Yes. Calm, confident handling is the key to grooming working breeds successfully. We have experience with Labradors, German Shepherds, Dobermanns, and similar breeds.'
  },
  {
    question: 'What do you bring to the session?',
    answer: 'All tools, shampoos, conditioners, dryers, towels, and sanitization supplies. You need to provide water access and a working space.'
  },
  {
    question: 'How do you handle very clean, well-maintained dogs who need light grooming?',
    answer: 'We calibrate the session to the actual condition of the coat. A well-maintained dog may need less time on deshedding and more focus on nail care and ear cleaning. The session adapts to what\'s needed.'
  },
  {
    question: 'Is early morning booking available?',
    answer: 'Yes. We offer morning slots from around 8am. Confirm the preferred time window when booking.'
  },
  {
    question: 'Do you groom cats in Khadki?',
    answer: 'Yes. Cat grooming is available including for long-haired domestic breeds and Persians.'
  },
  {
    question: 'We live in military quarters. Do groomers need any special clearance to enter?',
    answer: 'Nothing beyond what your gate normally requires for a service visitor. The groomer carries photo identification and we can send you their name and number in advance so you can log the entry before the slot. Cantonment gates are stricter than civilian societies about pre-notification, so it is worth doing rather than sorting it out at the barrier.'
  },
  {
    question: 'Should a German Shepherd be clipped down for the summer here?',
    answer: 'No. A GSD\'s double coat insulates against heat as much as cold, and clipping it removes that protection and often grows back patchy and permanently coarser. The right answer is a thorough deshedding blow-out that strips the loose undercoat while leaving the guard hairs intact. It is the single most common request we talk owners out of.'
  },
  {
    question: 'Do you cover Dapodi, Sangvi and the Pimple Gurav side?',
    answer: 'Yes, along with the Khadki cantonment area and the Aundh border. It is a compact, well-connected belt, so we can usually hold tighter arrival windows here than in the more spread-out outer areas.'
  },
  {
    question: 'Our dog is kennelled outdoors during the day. Does that change the session?',
    answer: 'It changes the inspection more than the grooming. A dog with all-day outdoor exposure gets a fuller tick and skin check before anything else starts, and through monsoon we would suggest tightening the interval and keeping paw hair shorter. Outdoor-kept dogs also tend to have harder, more weathered pads, which is worth attention every visit.'
  },
  {
    question: 'Can we get a female groomer?',
    answer: 'Say so at booking and we will schedule accordingly. It is a normal request and we would rather you asked than sat uncomfortable through a session in your own home. The one honest caveat is availability — it may mean a different day or a slightly wider slot window rather than the exact time you wanted.'
  }
];

// ════════════════════════════════════════════════════════════
// RAVET
// ════════════════════════════════════════════════════════════

export const ravetLocation: LocationConfig = {
  name: 'Ravet',
  slug: 'dog-grooming-in-pune/ravet',

  heroH1: `Professional Home Dog Grooming in Ravet — Now at Your Door`,
  heroSubtext:
    `Ravet's growing family community has everything — except enough good pet services nearby. Sniffy brings certified home dog grooming directly to Ravet so you never need to leave.`,

  storySections: [
    {
      heading: 'Ravet Has Grown Rapidly — Pet Services Need to Keep Up',
      subheading: 'A thriving community deserves doorstep grooming.',
      paragraphs: [
        'Ravet has transformed from a fringe locality to a substantial residential community over the last several years. Infrastructure has improved, connectivity to Hinjewadi is excellent, and new housing developments have brought thousands of families with pets. But dedicated, quality pet grooming in Ravet itself remains limited. Most dog parents are driving toward Pimple Saudagar or Wakad for a proper session. We bring the session to Ravet directly — certified groomer, full equipment, no travel required.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Ravet Pune',
      imageLeft: true,
    },
    {
      heading: 'Built for Ravet\'s Young Family Communities',
      subheading: 'First-time dog owners and experienced pet families both welcome.',
      paragraphs: [
        'Ravet attracts a demographic of younger families and professionals who often got their first dog in the last three or four years. Many are navigating dog ownership with genuine enthusiasm but uncertain about what grooming actually involves, how often it should happen, and what to look for in a groomer. We enjoy these clients. The session is as much a conversation about their specific dog\'s needs as it is a grooming appointment, and we leave every Ravet client better informed than when we arrived.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'First-time dog owner grooming session in Ravet',
      imageLeft: false,
    },
    {
      heading: 'Apartment-Friendly and Society-Approved',
      subheading: 'No building management issues.',
      paragraphs: [
        'Ravet is predominantly high-rise apartments and gated developments. Our setup is designed specifically for these environments — compact, quiet, zero mess, and quick to set up and pack away. We\'ve worked in large Ravet societies without a single building management complaint. The session happens cleanly and the space is left immaculate.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Apartment grooming session in Ravet society',
      imageLeft: true,
    },
    {
      heading: 'Every Grooming Session Includes a Quiet Health Check',
      subheading: 'An extra layer of care at no extra cost.',
      paragraphs: [
        'As part of every Ravet session, we note coat condition, skin appearance, ear health, nail length, and any visible tick activity. If we observe anything concerning — unusual skin irritation, ear odour, a nail that has grown into the pad — we flag it immediately. This quiet observation has helped several Ravet clients catch early health issues before they became serious problems.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Health check during dog grooming in Ravet',
      imageLeft: false,
    },
    {
      heading: `Breeds We Groom in Ravet — And What First-Time Owners Need to Know`,
      subheading: `A growing community, a growing dog roster.`,
      paragraphs: [
        `Ravet's dog demographic is skewed young — first-time owners, recently adopted dogs, and the enthusiastic energy of people still figuring out what their specific breed actually needs. We see a lot of Labradors (always), a solid contingent of Huskies from the newer apartment blocks, Pomeranians, Indies, and increasingly, Doodles. First-time owners are often surprised by how breed-specific grooming actually needs to be.`,
        `Here's our approach to the breeds we groom most in Ravet:`,
      ],
      bullets: [
        `Labrador grooming in Ravet — Short coats that hide how much undercoat Labs actually have until you start the deshedding process. We always explain this to first-time Lab owners — the amount of loose coat that comes out in a proper deshedding session is significant and genuinely improves the dog's comfort.`,
        `Husky grooming in Ravet — Pune's climate is genuinely hard on Huskies and many first-time Husky owners in Ravet are surprised by the shedding volume. We do a proper blow-out deshedding session — never clipping or shaving, which would permanently damage the double coat.`,
        `Pomeranian grooming in Ravet — Small, opinionated, and prone to matting in Pune's humidity. We take time at the start to let the dog settle, then work through the double coat carefully and deliver a clean rounded finish.`,
        `Doodle grooming in Ravet — First-time Doodle owners often don't realise how quickly the curly non-shedding coat mats. We explain this at the first session and set up a grooming frequency plan that prevents the coat from becoming unmanageable.`,
        `Indie dog grooming in Ravet — Many Ravet clients have adopted Indies from local rescue organisations. These dogs are often confident and social, which makes grooming straightforward — we still do a thorough tick and skin check every time.`,
        `German Shepherd grooming in Ravet — Double coats, high-shedding, and sometimes wary of strangers. We give GSDs time to settle into our presence before beginning and handle the session with quiet confidence throughout.`,
      ],
      closingLine: `First booking in Ravet? We'll walk you through what the session involves before starting and answer any questions you have about your specific dog's grooming needs.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Home dog grooming for all breeds in Ravet Pune`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/ravet'),
  nearbyAreas: ['Pimple Saudagar', 'Akurdi', 'Chinchwad', 'Hinjewadi', 'Tathawade', 'Wakad', 'Kalewadi', 'Kasarsai'],
};

export const ravetMapEmbed = 'https://www.google.com/maps?q=Ravet,Pune&output=embed';

export const ravetReviews: LocationReview[] = [
  {
    petName: 'Cloud',
    ownerName: 'Deepa Rao',
    area: 'Ravet',
    review: `Cloud is a Husky and I've been struggling to find a groomer who actually understands what to do with a double coat. The Sniffy groomer explained the whole process before starting — why we don't shave, what the blow-out achieves — and then executed it thoroughly. I can see the difference already.`,
    rating: 5,
  },
  {
    petName: 'Oreo',
    ownerName: 'Sameer Jain',
    area: 'Tathawade Road',
    review: 'This was our first professional grooming session ever. The groomer was patient, informative, and very gentle with Oreo who was nervous at first. By the end of the session she was calm and happy. Great first experience.',
    rating: 5,
  },
];

export const ravetFAQs: FAQ[] = [
  {
    question: 'Is this service suitable for first-time dog owners?',
    answer: 'Very much so. We walk you through the session and explain what we observe about your dog\'s coat and health. First sessions are often the most educational for new dog parents.'
  },
  {
    question: 'How often should I book grooming for a Labrador or Husky?',
    answer: 'Monthly is ideal for both breeds, especially in Pune\'s climate. Labs shed year-round and Huskies blow their coat seasonally — regular professional sessions manage both effectively.'
  },
  {
    question: 'Does the session cover all of Ravet including the Tathawade border areas?',
    answer: 'Yes. We cover all of Ravet and the surrounding localities including Tathawade and Pimple Saudagar borders.'
  },
  {
    question: 'Can grooming help reduce the fur around my apartment?',
    answer: 'Significantly. A proper deshedding session removes far more loose coat than home brushing and reduces daily shedding noticeably for several weeks afterward.'
  },
  {
    question: 'What if my dog has never been groomed professionally?',
    answer: 'We take a patient, gradual approach — introducing tools one at a time and allowing breaks. Home environments make first grooming experiences much better than salon ones.'
  },
  {
    question: 'Is weekend booking available?',
    answer: 'Yes. Weekend slots are available but fill faster than weekdays. Book a few days in advance for the best timing options.'
  },
  {
    question: 'Do you cover Punawale, Tathawade and the Kiwale side as well as Ravet?',
    answer: 'Yes, the whole newer township belt through Ravet, Punawale, Kiwale and across to Tathawade. Many of these societies are known by builder name rather than street, and several share names across phases, so mention your phase or tower when booking.'
  },
  {
    question: 'New townships here often have irregular water supply. How do we plan around it?',
    answer: 'Keep three or four buckets filled before the slot if your supply is timed. The wash and rinse stages together are only about twenty minutes of a ninety-minute visit, so stored water covers a session comfortably. Just tell the groomer on arrival so they plan the rinse rather than discover the tap is dry mid-lather.'
  },
  {
    question: 'Someone in the family is allergic to dog hair. Does grooming actually help?',
    answer: 'A proper deshedding session helps more than most people expect, because what triggers most reactions is dander carried on shed undercoat rather than the hair itself. Pulling that loose undercoat out on a schedule, rather than letting it drop around the flat, makes a real difference. It manages the problem rather than solving it — but for a double-coated dog in an apartment it is the single most effective thing available.'
  },
  {
    question: 'Our tower has a service lift and a separate entrance. Is that a problem?',
    answer: 'No — the groomer follows whatever your building requires and carries everything in one bag. The only thing worth flagging at booking is if the service entrance is on a different side of the complex from the main gate, which is where a groomer typically loses ten minutes in a large Ravet township.'
  },
  {
    question: 'Power cuts happen here. What if the electricity goes during the session?',
    answer: 'The dryer is the only stage that needs power, so a cut pauses the session rather than ending it. Tell the groomer which sockets are on the inverter if you have one. We will not leave a dog part-dried — if power is genuinely out, we towel-dry thoroughly and wait rather than call it done.'
  }
];

// ════════════════════════════════════════════════════════════
// AUNDH
// ════════════════════════════════════════════════════════════

export const aundhLocation: LocationConfig = {
  name: 'Aundh',
  slug: 'dog-grooming-in-pune/aundh',

  heroH1: `At-Home Dog Grooming in Aundh — Polished, Punctual, Professional`,
  heroSubtext:
    `Aundh's smart residential streets and organised communities deserve grooming to match. Sniffy groomers visit your home in Aundh — proper care, zero commute.`,

  storySections: [
    {
      heading: 'Aundh: An Established IT Suburb That Expects Proper Services',
      subheading: 'Organised, connected, and uncompromising on quality.',
      paragraphs: [
        'Aundh has long been one of Pune\'s most desirable residential addresses — well-planned roads, good schools, access to the western tech corridor, and a community of organised, quality-conscious residents. Dog ownership in Aundh reflects that character — pets are well-maintained, vet schedules are followed, and grooming is taken seriously. What Aundh dog parents have historically had to tolerate is driving to other areas for a groomer they trust. We end that inconvenience. Certified home grooming in Aundh, at your door, on your terms.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Aundh Pune',
      imageLeft: true,
    },
    {
      heading: 'A Service That Respects Your Schedule',
      subheading: 'On-time arrival, efficient session, complete cleanup.',
      paragraphs: [
        'Aundh professionals and families run structured days. A grooming service that shows up late, runs long without warning, or leaves the bathroom in disarray is one that doesn\'t get rebooked. We run tight schedules by design — confirmed time windows, punctual arrivals, efficient sessions, and spotless cleanup. Our repeat booking rate in Aundh is high because the operational experience is as smooth as the grooming result.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Professional groomer arriving at Aundh home',
      imageLeft: false,
    },
    {
      heading: 'Grooming as Ongoing Health Management',
      subheading: 'Every session surfaces what daily life misses.',
      paragraphs: [
        'Aundh dog families often bring the same diligence they apply to their own health to their pets\' wellbeing. Regular grooming sessions serve that goal directly — each session involves observation of coat condition, ear health, nail length, and skin, providing an additional layer of health monitoring that sits between vet visits. If something looks early-stage and concerning, we mention it. If everything looks healthy, we confirm that too.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Dog health monitoring during grooming in Aundh',
      imageLeft: true,
    },
    {
      heading: 'Complete Grooming Packages for All Aundh Dog Families',
      subheading: 'Small breeds to large dogs — all covered.',
      paragraphs: [
        'Our Aundh sessions cover bath, blow-dry, brushing, nail trim, ear cleaning, and sanitary trim as standard. Haircut styling, coat conditioning, and deshedding add-ons are clearly priced and available. We groom all breeds and sizes — from Chihuahuas in compact apartments to Labradors in independent homes. The session is calibrated to what your specific dog needs, not a generic routine.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy groomed dog in Aundh Pune',
      imageLeft: false,
    },
    {
      heading: `Dog Breeds We Groom in Aundh — Expertise That Shows`,
      subheading: `One of Pune's most consistently quality-conscious dog neighbourhoods.`,
      paragraphs: [
        `Aundh has a sophisticated dog owner base. These are people who read before they buy, research grooming techniques, and notice the difference between a thorough session and a cosmetic one. They also talk to each other — Aundh's strong community culture means recommendations travel fast. Our Aundh clients have come primarily through word-of-mouth, and they're kept through consistent delivery.`,
        `The breeds we groom most in Aundh and what each session involves:`,
      ],
      bullets: [
        `Labrador grooming in Aundh — Active, energetic Aundh Labs benefit from thorough deshedding sessions that go beyond surface cleaning. We do a full undercoat treatment every session, keeping the Labs in Aundh's active households manageable indoors.`,
        `Golden Retriever grooming in Aundh — Beautiful dogs that need beautiful grooming. We deep-condition, address the feathering, and finish with a proper blow-dry that restores the golden coat's characteristic shine.`,
        `Shih Tzu and Maltese grooming in Aundh — Long-coated toy breeds that need regular, careful handling. We brush before bathing, use a strengthening conditioner, and deliver a trim that's precise and balanced.`,
        `Poodle grooming in Aundh — We groom Poodles to the owner's specified style. Aundh Poodle owners are often particular about their trim and we welcome that — a clear brief produces a better result.`,
        `German Shepherd grooming in Aundh — Strong working dogs that respond well to confident, calm handling. Regular deshedding keeps GSD hair manageable in Aundh's well-furnished homes.`,
        `Indie dog grooming in Aundh — Aundh has a good adoption culture and we see well-cared-for Indies regularly. Same standard of grooming as for any pedigree — no shortcuts.`,
      ],
      closingLine: `Aundh clients who want recurring monthly slots — we can set up a fixed monthly booking so you never have to rebook.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Expert home dog grooming in Aundh Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/aundh'),
  nearbyAreas: ['Baner', 'Khadki', 'Pimple Gurav', 'Sangvi', 'Shivajinagar', 'Pashan', 'Sus Road', 'Wakad'],
};

export const aundhMapEmbed = 'https://www.google.com/maps?q=Aundh,Pune&output=embed';

export const aundhReviews: LocationReview[] = [
  {
    petName: 'Sunny',
    ownerName: 'Vikram Joshi',
    area: 'Aundh',
    review: `I've used multiple grooming services in Pune over six years and this is the most consistently professional one I've found. Sunny is a Golden and needs real coat work. The groomer knows exactly what she's doing with a double coat — deep conditioned it properly and the feathering trim was immaculate.`,
    rating: 5,
  },
  {
    petName: 'Pepper',
    ownerName: 'Ananya Deshpande',
    area: 'ITI Road Aundh',
    review: 'Pepper is a Miniature Poodle and I always have specific clip requirements. I sent a reference photo when booking and the groomer matched it exactly. This kind of attention to brief is rare and very appreciated.',
    rating: 5,
  },
];

export const aundhFAQs: FAQ[] = [
  {
    question: 'Can I set up a fixed monthly recurring grooming slot in Aundh?',
    answer: 'Yes. We can set up a recurring monthly booking so your slot is reserved and you don\'t need to rebook each time. Very popular with Aundh clients.'
  },
  {
    question: 'Do you follow a specific brief for haircut styles?',
    answer: 'Yes. Send a reference image or describe the style you want when booking. We discuss it before starting to make sure we\'re aligned.'
  },
  {
    question: 'How does home grooming compare to salon grooming for quality?',
    answer: 'Home grooming offers more concentrated attention — one groomer, one dog, full focus. There\'s no queue, no cage time, and no disruption from other animals. For most dogs this produces a calmer session and better results.'
  },
  {
    question: 'What happens if my dog needs a long session due to heavy coat condition?',
    answer: 'We will communicate this proactively. If the coat requires significantly more time than standard, we discuss options with you rather than rushing to fit a time window.'
  },
  {
    question: 'Is early morning booking available in Aundh?',
    answer: 'Yes. Slots from 8am are available. Confirm the preferred window when booking.'
  },
  {
    question: 'Are all grooming products pet-safe?',
    answer: 'Yes. We use veterinarian-approved, pet-specific products. Hypoallergenic options are available for dogs with documented sensitivities.'
  },
  {
    question: 'Parking is tight in the older lanes here. Does the groomer need a spot?',
    answer: 'No. Groomers travel by two-wheeler with the whole kit in a shoulder bag, which is why this works in the older parts of Aundh at all. Nothing is unloaded at your gate and no four-wheeler needs a bay — the same reason we can work the narrow lanes off Bremen Chowk without difficulty.'
  },
  {
    question: 'We are boarding our dog next week. Should we groom before or after?',
    answer: 'Before, by a few days. A dog going into boarding with a clean, mat-free coat and short nails is easier for the kennel to manage and far less likely to come back with a coat problem. Grooming immediately after boarding is also reasonable if the stay was long, but doing it beforehand is what actually prevents trouble.'
  },
  {
    question: 'Can I book only a nail trim and ear clean?',
    answer: 'Yes — a short maintenance visit covering nails, ears and a paw-hair trim is available below package price. Ask for it by name at booking. For a short-coated dog it is frequently all that is genuinely needed between full sessions, and it avoids bathing a dog more often than its coat requires.'
  },
  {
    question: 'Can we request a female groomer?',
    answer: 'Yes, just say so when you book. It is a routine request and we would much rather accommodate it than have you uncomfortable during a home visit. The only caveat is scheduling — it may mean a different day or a wider arrival window rather than your first-choice slot.'
  },
  {
    question: 'We think there are fleas in the house, not just on the dog. Does grooming fix that?',
    answer: 'Grooming clears the dog, not the house, and it is important to be honest about that. A tick and flea treatment during the session removes what is on the animal, but eggs in bedding, sofas and floor cracks will re-infest within days. Treat the dog and the environment in the same week — wash all bedding hot and vacuum thoroughly — or you will be doing this repeatedly.'
  }
];

// ════════════════════════════════════════════════════════════
// KALEWADI
// ════════════════════════════════════════════════════════════

export const kalewadiLocation: LocationConfig = {
  name: 'Kalewadi',
  slug: 'dog-grooming-in-pune/kalewadi',

  heroH1: `Dog Grooming at Home in Kalewadi — Professional Care in Your Society`,
  heroSubtext:
    `Between Wakad and Pimple Saudagar, Kalewadi's busy residential belt now has proper home grooming. Sniffy comes to you — calm, clean, certified.`,

  storySections: [
    {
      heading: 'Kalewadi Deserves the Same Standard as Any Pune Suburb',
      subheading: 'The gap between Wakad and Pimple Saudagar is no longer a service desert.',
      paragraphs: [
        'Kalewadi\'s residential expansion has been steady — a mix of older compact societies and newer residential developments filling in the space between Wakad to the west and Pimple Saudagar to the north. Dog families here have historically had to travel to either of those areas for quality pet grooming. We solve that. Our at-home dog grooming in Kalewadi brings the same professional standard we deliver across the PCMC belt directly to your door in Kalewadi.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Kalewadi Pune',
      imageLeft: true,
    },
    {
      heading: 'Practical Service for Working Family Communities',
      subheading: 'Slots that fit around your day.',
      paragraphs: [
        'Kalewadi is home to many dual-income families — people for whom time management is a genuine priority. Morning, afternoon, and weekend grooming slots allow you to schedule around work, school runs, and household routines. The groomer handles everything independently once you\'ve shown them the working space, so the session fits into your day rather than requiring you to reorganise around it.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Dog grooming while family continues daily routine in Kalewadi',
      imageLeft: false,
    },
    {
      heading: 'Coat and Skin Care for Dense Residential Environments',
      subheading: 'Dust, shedding, and seasonal issues handled.',
      paragraphs: [
        'Dense residential areas like Kalewadi have their own environmental factors — construction activity in neighbouring developments, road dust, and limited green space for dogs to exercise in clean environments. Our grooming sessions use deep-cleansing protocols that address the specific coat challenges urban dogs face. Regular sessions — every four to six weeks — keep skin healthy and coats manageable through seasonal changes.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Deep cleanse dog grooming in Kalewadi',
      imageLeft: true,
    },
    {
      heading: 'Transparent Pricing, Honest Service',
      subheading: 'What you see is what you pay.',
      paragraphs: [
        'We price by package, not by hidden add-on accumulation. A standard session in Kalewadi covers bath, dry, brush, nail trim, ear clean, and sanitary trim. Haircuts and conditioning treatments are clearly listed extras discussed before the session begins. No on-the-spot surprises. Just straightforward, accountable service.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy groomed dog in Kalewadi society',
      imageLeft: false,
    },
    {
      heading: `Breeds We Groom in Kalewadi — A Practical Breakdown`,
      subheading: `Working families, practical breeds, professional grooming.`,
      paragraphs: [
        `Kalewadi's dog demographic reflects the neighbourhood's working-family character. Labs and Indies are the most common, followed by Pomeranians, Beagles, and a growing number of Shih Tzus and Lhasa Apsos. Many of our Kalewadi clients are second-time dog owners who had a bad salon experience and decided to try home grooming. Almost universally, they don't go back to salons after their first session with us.`,
        `Our approach to the breeds we groom most in Kalewadi:`,
      ],
      bullets: [
        `Labrador grooming in Kalewadi — The most common breed across the PCMC belt. Regular deshedding is essential — a properly done deshedding session removes a remarkable amount of loose coat and makes a visible difference inside the home.`,
        `Indie dog grooming in Kalewadi — Kalewadi has a strong local rescue culture. We approach every Indie with full professionalism — tick and skin check, appropriate products, and patient handling for dogs who may still be building trust with people.`,
        `Pomeranian grooming in Kalewadi — Beloved small companions. We let them settle before starting, work through the double coat carefully, and deliver the clean rounded profile Pomeranians are known for.`,
        `Beagle grooming in Kalewadi — Short coats but those ears need constant attention. We do a thorough ear canal cleaning every session — it's the most important health-focused part of a Beagle groom.`,
        `Shih Tzu grooming in Kalewadi — Long coats in Pune's humidity mat quickly. We brush before bathing, use conditioning treatment, and deliver a clean finish whether the owner wants a long show coat or a practical shorter cut.`,
        `Lhasa Apso grooming in Kalewadi — Floor-length coats need careful maintenance. We work section by section, address any matting safely, and condition the coat to prevent early re-tangling.`,
      ],
      closingLine: `For Beagle owners in particular: consistent ear cleaning every four to six weeks is one of the best preventive health measures for the breed. Don't skip it.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Home dog grooming for all breeds in Kalewadi Pune`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/kalewadi'),
  nearbyAreas: ['Wakad', 'Pimple Saudagar', 'Pimpri-Chinchwad', 'Ravet', 'Tathawade', 'Chinchwad', 'Kalewadi Phata', 'Punawale'],
};

export const kalewadiMapEmbed = 'https://www.google.com/maps?q=Kalewadi,Pune&output=embed';

export const kalewadiReviews: LocationReview[] = [
  {
    petName: 'Bruno',
    ownerName: 'Prashant Kale',
    area: 'Kalewadi',
    review: 'We drove to Wakad for grooming for two years before trying this home service. The difference in Bruno\'s behaviour during the session was remarkable — no car anxiety, no waiting room stress. He was calm throughout and the deshedding was genuinely thorough.',
    rating: 5,
  },
  {
    petName: 'Poppy',
    ownerName: 'Reshma Patil',
    area: 'Kalewadi Phata',
    review: 'Poppy is a Lhasa and always has some matting. The groomer was patient and worked through the mats carefully without just clipping everything. The coat came out detangled and clean. This is the quality I\'ve been looking for.',
    rating: 5,
  },
];

export const kalewadieFAQs: FAQ[] = [
  {
    question: 'Do you cover all societies in Kalewadi?',
    answer: 'Yes. We service all residential societies and independent homes across Kalewadi.'
  },
  {
    question: 'What should I expect during the first session?',
    answer: 'We start with a brief coat assessment and a few minutes to let your dog get comfortable with the groomer\'s presence. Then we proceed through the session step by step and brief you fully at the end.'
  },
  {
    question: 'Can grooming help with seasonal shedding?',
    answer: 'Yes significantly. Professional deshedding sessions remove far more loose coat than home brushing. Most owners report a meaningful reduction in daily fur accumulation for two to three weeks after a proper session.'
  },
  {
    question: 'Is cat grooming available in Kalewadi?',
    answer: 'Yes. We groom cats in Kalewadi including domestic short-haired, long-haired, and Persian breeds.'
  },
  {
    question: 'How do you handle a dog that pulls or fidgets during grooming?',
    answer: 'We use positioning and patient handling rather than restraint wherever possible. Most fidgeting reduces once the dog understands the grooming routine — particularly after the second or third session.'
  },
  {
    question: 'Are evening slots available?',
    answer: 'Yes. We offer evening slots until around 7pm. Confirm the preferred window when booking.'
  },
  {
    question: 'Our building is a walk-up with no lift and we have a large dog. Is that workable?',
    answer: 'For us, yes — everything the groomer needs fits in one shoulder bag. The question is whether your dog manages the stairs comfortably day to day. If it does, nothing changes. If it does not, we would rather work on the ground floor or in the compound than have a heavy dog climb three floors before standing still for an hour.'
  },
  {
    question: 'How bad is the Kalewadi Phata traffic for slot timings?',
    answer: 'Bad enough that we plan around it. Peak morning and the 6 to 8 PM stretch through the Phata are where arrival windows slip most, so we would rather book you late morning or early afternoon and actually arrive on time. If evening suits you better, expect a wider window rather than a precise minute.'
  },
  {
    question: 'We have a small flat with one shared bathroom. Is there enough space?',
    answer: 'Yes. The bathroom is needed for perhaps twenty minutes of the visit for the wash and rinse; the rest happens on any clear patch of floor with the groomer\'s own mats laid down. Small flats across Kalewadi are a large share of what we do — the constraint is almost never space, it is whether the dog can stand and turn.'
  },
  {
    question: 'The lanes here flood in heavy monsoon. Do you still come?',
    answer: 'Usually yes, occasionally rescheduled. If the approach to your building is genuinely waterlogged we will call and move the slot rather than send a groomer wading through it with electrical equipment. Rescheduling costs you nothing — a groomer arriving soaked with a wet dryer bag helps neither of us.'
  },
  {
    question: 'My parents will be home, not me. Do your groomers speak Marathi?',
    answer: 'Yes — our groomers work in Marathi and Hindi as well as English, and in Kalewadi that comes up constantly. Tell us at booking if an elderly family member will be handling the visit, and we will make sure the groomer and the household share a language for the instructions that actually matter.'
  }
];

// ════════════════════════════════════════════════════════════
// KATRAJ
// ════════════════════════════════════════════════════════════

export const katrajLocation: LocationConfig = {
  name: 'Katraj',
  slug: 'dog-grooming-in-pune/katraj',

  heroH1: `Home Dog Grooming in Katraj — Professional, Gentle, Right Here`,
  heroSubtext:
    `Katraj's dog families no longer need to travel for a proper groom. Sniffy brings certified at-home dog grooming to Katraj — calm handling, thorough care, clean finish.`,

  storySections: [
    {
      heading: 'Katraj Is More Than the Bypass — It\'s a Real Community',
      subheading: `One of Pune's most densely populated residential zones.`,
      paragraphs: [
        'Katraj is often seen through the lens of the highway bypass, but the residential communities that have grown up here are substantial and established. Families have put down roots in Katraj\'s societies and plotted developments, and dog ownership has grown steadily alongside. Quality pet services have been slower to arrive. Our home dog grooming in Katraj directly addresses that gap — professional, certified grooming at your door, no need to travel toward Kondhwa or Warje for a reliable session.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Katraj Pune',
      imageLeft: true,
    },
    {
      heading: 'The Right Environment for Calm Grooming',
      subheading: 'Your home eliminates salon stress entirely.',
      paragraphs: [
        'Dogs in Katraj tend to be family-oriented — companions for children, guards for independent homes, and loyal residents in apartment societies. What these dogs share is a comfort in their home territory that disappears the moment they\'re put in a car and driven somewhere unfamiliar. Home grooming in Katraj eliminates that disruption entirely. The session happens in the dog\'s space, on their terms, producing cooperation you simply don\'t get in a salon environment.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Calm home grooming session in Katraj',
      imageLeft: false,
    },
    {
      heading: 'Seasonal Grooming for South Pune\'s Climate',
      subheading: 'Adjusted for Katraj\'s specific conditions.',
      paragraphs: [
        'Katraj and its surrounding areas sit at a slightly higher elevation than central Pune, which gives the area a marginally different seasonal character — slightly cooler winters and more defined monsoon periods. We adjust our grooming protocols to account for these conditions. Monsoon sessions include anti-fungal rinses for dogs exposed to damp environments. Summer sessions focus on deshedding to improve natural thermoregulation. Winter sessions emphasise coat conditioning to prevent dryness.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Seasonal dog grooming in Katraj Pune',
      imageLeft: true,
    },
    {
      heading: 'Honest Pricing, Reliable Execution',
      subheading: 'A service that earns repeat clients.',
      paragraphs: [
        'Our Katraj clients tell us consistently that what kept them returning was not just the quality of the grooming but the absence of unpleasant surprises. Pricing discussed upfront. Groomer arrives as confirmed. Session runs as described. Cleanup complete. Brief given at the end. This is not exceptional — it should be the baseline for any service. We just make sure it actually is.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy groomed dog in Katraj',
      imageLeft: false,
    },
    {
      heading: `Breeds We Groom in Katraj — Our Approach for Each`,
      subheading: `A community rooted in family life — and family dogs.`,
      paragraphs: [
        `Katraj dog owners lean toward breeds that are family-oriented and loyal — Labradors, German Shepherds, Rajapalayams in some of the older households, and a very solid population of well-loved Indies. Many families here have had dogs for many years and the dogs reflect that — older, settled, used to their routines. We honour that routine by keeping the grooming experience predictable and consistent.`,
        `Our breed-specific approach for Katraj's most common dogs:`,
      ],
      bullets: [
        `Labrador grooming in Katraj — Friendly family dogs that are typically good patients. We still do a thorough deshedding session every time — short coats hold more undercoat than they appear to.`,
        `German Shepherd grooming in Katraj — Common in the older independent homes and larger plots in Katraj. We handle GSDs with quiet confidence and focus on undercoat deshedding and ear hygiene in every session.`,
        `Indie dog grooming in Katraj — Katraj has a large well-established Indie community. Many families here have kept Indies for years and know their dogs' needs well. We approach every Indie with a full skin and tick check and appropriate product selection.`,
        `Pomeranian grooming in Katraj — Popular in the apartment communities. Small, spirited, and in need of patient handling. We take the time needed rather than rushing to fit a slot.`,
        `Rottweiler grooming in Katraj — Several of the independent homes in Katraj keep Rottweilers. We handle them with calm, confident authority. Short coats need rubber curry brushing, skin checks, and nail care.`,
        `Cat grooming in Katraj — Katraj has a good population of pet cats including long-haired breeds. We provide gentle, unhurried cat grooming for all types.`,
      ],
      closingLine: `For multi-pet homes in Katraj — we can groom multiple dogs or a dog and cat in the same visit where scheduling allows.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Home dog grooming in Katraj Pune families`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/katraj'),
  nearbyAreas: ['Ambegaon', 'Kondhwa', 'Dhayari', 'Narhe', 'Sinhagad Road', 'Bibewadi', 'Warje', 'Saswad Road'],
};

export const katrajMapEmbed = 'https://www.google.com/maps?q=Katraj,Pune&output=embed';

export const katrajReviews: LocationReview[] = [
  {
    petName: 'Shero',
    ownerName: 'Sachin Wagh',
    area: 'Katraj',
    review: 'Shero is a twelve-year-old Indie and very set in his ways. The groomer was experienced with senior dogs — moved slowly, gave breaks, and handled him without any stress. The coat came out properly clean and Shero was relaxed afterward. Excellent patience.',
    rating: 5,
  },
  {
    petName: 'Bubu',
    ownerName: 'Nisha Patil',
    area: 'Katraj Chowk',
    review: 'Bubu is a large Rottweiler and I was nervous about how the groomer would handle him. She walked in completely confident and Bubu settled within minutes. The session was smooth and professional start to finish.',
    rating: 5,
  },
];

export const katrajFAQs: FAQ[] = [
  {
    question: 'Do you cover independent homes and plotted developments in Katraj?',
    answer: 'Yes. We service all property types in Katraj including society apartments and independent homes.'
  },
  {
    question: 'Can you groom multiple dogs or a dog and cat in the same visit?',
    answer: 'Yes. Multi-pet sessions are available where scheduling allows. Please mention all animals when booking so we can plan the session time correctly.'
  },
  {
    question: 'How do you groom older or senior dogs differently?',
    answer: 'Senior dogs need slower pacing, more breaks, non-slip surfaces, and careful attention to areas that age affects — paw pads, ear canals, and coat condition. We adapt every aspect of the session accordingly.'
  },
  {
    question: 'Is your service available during monsoon?',
    answer: 'Yes. We operate year-round. For dogs exposed to dampness during monsoon, we use anti-fungal rinses as a preventive measure where appropriate.'
  },
  {
    question: 'What if my dog has a health condition that affects grooming?',
    answer: 'Please mention any conditions — arthritis, skin sensitivities, anxiety — when booking. We adjust our approach and products accordingly.'
  },
  {
    question: 'How much fur ends up in the session space?',
    answer: 'Some fur accumulation is normal during deshedding. We contain and clean it completely afterward — the working area is left clean when we\'re done.'
  },
  {
    question: 'Does the ghat-side humidity here affect grooming?',
    answer: 'It affects drying time most of all. The Katraj ghat side holds moisture noticeably longer than the flatter parts of the city, and a coat that feels dry to the hand can still be damp against the skin — which is exactly how fungal patches start under a thick coat. Our groomers dry to the skin rather than to the touch, and here that stage simply takes longer.'
  },
  {
    question: 'We back onto open ground and there are strays around. What should we watch for?',
    answer: 'Ticks above everything, and they are why we inspect before we wash rather than after. Contact with free-ranging dogs and long grass raises the odds considerably in this belt, so the check covers between the toes, both ear canals, the jawline and under the tail. If we find anything we show you where it was rather than just treating it.'
  },
  {
    question: 'We are on borewell water. Does that change the bath?',
    answer: 'It means a longer rinse. Hard borewell water leaves mineral residue that dulls a coat and can leave the skin itchy even when the rinse felt thorough — a very common complaint across the Katraj and Ambegaon side. We rinse longer and finish with a conditioning rinse to counter it.'
  },
  {
    question: 'How old should a puppy be before its first session?',
    answer: 'Around twelve to sixteen weeks and after the core vaccination course — confirm with your vet where your puppy currently sits. The first visit should be short and undemanding: handling paws and ears, a comb through, the dryer heard rather than used at full strength. What a puppy learns about being handled at four months shapes the next decade of sessions.'
  },
  {
    question: 'What is a sensible slot given the Sinhagad Road and Katraj commute?',
    answer: 'Late morning through early afternoon is the most reliable window for a groomer to reach you on time. The inbound morning peak and the 6 to 8 PM return are where slot timings slip, and we would rather give you an honest window than a precise time we cannot hold.'
  }
];

// ════════════════════════════════════════════════════════════
// HANDEWADI
// ════════════════════════════════════════════════════════════

export const handewadiLocation: LocationConfig = {
  name: 'Handewadi',
  slug: 'dog-grooming-in-pune/handewadi',

  heroH1: `Home Dog Grooming in Handewadi — Quality Care at Your Doorstep`,
  heroSubtext:
    'Growing fast but still underserved. Handewadi dog families can now book certified at-home dog grooming — thorough, professional, and no travel needed.',

  storySections: [
    {
      heading: 'Handewadi Is Growing — Its Pet Services Should Too',
      subheading: 'A residential community finding its footing in premium pet care.',
      paragraphs: [
        'Handewadi has transformed from a peripheral locality into a proper residential destination, with mid-rise societies and larger plotted developments attracting families seeking more space at better value than central Pune. The dog-owning community here is real and growing — but quality pet services, including grooming, have lagged behind the residential growth. Our at-home dog grooming in Handewadi closes that gap directly. No more driving to Hadapsar or Wanowrie for a decent session. The session comes to you.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Handewadi Pune',
      imageLeft: true,
    },
    {
      heading: 'Spacious Layouts Mean Better Grooming Environments',
      subheading: 'Handewadi properties give us room to work properly.',
      paragraphs: [
        'Handewadi\'s newer residential developments tend to have more generous layouts than equivalent-priced flats in the city core — bigger balconies, utility areas, and in some cases small private gardens. These extra spaces make for excellent at-home grooming environments. We make full use of whatever space is available and leave it exactly as we found it — just with a significantly cleaner dog in it.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Grooming session in Handewadi property',
      imageLeft: false,
    },
    {
      heading: 'Active Outdoor Dogs in Handewadi\'s Semi-Open Environment',
      subheading: 'More space means more outdoor activity means more grooming.',
      paragraphs: [
        'Handewadi\'s semi-developed character means dogs here often have access to open areas — larger society compounds, nearby open ground, sometimes neighbouring fields. This outdoor access is great for exercise and dog wellbeing, but it does mean coats accumulate more dust, pollen, and the occasional tick. Our grooming sessions are calibrated for this reality — deeper cleansing, tick checks, and paw inspections form a core part of every Handewadi session.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Thorough grooming for outdoor dog in Handewadi',
      imageLeft: true,
    },
    {
      heading: 'Professional Service, Community Prices',
      subheading: 'Premium quality doesn\'t have to mean premium pricing.',
      paragraphs: [
        'Handewadi is a value-conscious community and we respect that. Our pricing is transparent, structured, and represents excellent value for the level of professionalism delivered. Standard sessions include all core services with add-ons available at clearly stated prices. We don\'t charge for travel in Handewadi. You pay for the grooming and that\'s it.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy dog after home grooming in Handewadi',
      imageLeft: false,
    },
    {
      heading: `Dog Breeds We Groom in Handewadi — Built for This Locality`,
      subheading: `Outdoor-access dogs in a developing community — treated with full professionalism.`,
      paragraphs: [
        `Handewadi's dog population reflects the mixed character of the neighbourhood — a blend of large working breeds in the older plotted areas and smaller companion breeds in the newer society developments. Labradors and German Shepherds in the independent homes, Pomeranians and Spitz breeds in the apartments, and a solid cohort of rescued Indies from the surrounding semi-rural belt. Each needs a genuinely different session.`,
        `Here's our approach for Handewadi's most frequently groomed breeds:`,
      ],
      bullets: [
        `Labrador grooming in Handewadi — Active outdoor Labs in Handewadi pick up significant coat debris. We do a pre-wash brush-out to remove loose material, then a full deshedding bath and blow-dry protocol. Ear check and paw inspection are always included.`,
        `German Shepherd grooming in Handewadi — Large powerful dogs that respond to confident, calm handling. Deshedding is the priority — regular sessions remove the loose undercoat that makes indoor living significantly more manageable.`,
        `Indian Spitz grooming in Handewadi — Still very common in Pune's outer residential belts. Beautiful double coat that needs regular deshedding and a careful finishing brush to maintain the breed's characteristic silhouette.`,
        `Pomeranian grooming in Handewadi — Small but present across every Pune locality. Patient handling, careful coat work, and a neat finished profile are the hallmarks of a good Pom session.`,
        `Indie dog grooming in Handewadi — We approach every Indie with a full skin assessment and tick check — particularly important in Handewadi where some dogs have access to open ground with higher tick exposure.`,
        `Rajapalayam and Mudhol Hound grooming in Handewadi — These native breeds are found in the outer belts of Pune. Short coats need skin attention and confident handling. We check for skin irritation and give careful nail care.`,
      ],
      closingLine: `For dogs with regular outdoor access in Handewadi — monthly sessions are strongly recommended for tick management and coat health.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Home dog grooming in Handewadi Pune outdoor dogs`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/handewadi'),
  nearbyAreas: ['Hadapsar', 'Wanowrie', 'Undri', 'Kondhwa', 'Katraj', 'Mohammed Wadi', 'Saswad Road', 'Pune Solapur Highway'],
};

export const handewadiMapEmbed = 'https://www.google.com/maps?q=Handewadi,Pune&output=embed';

export const handewadiReviews: LocationReview[] = [
  {
    petName: 'Kalu',
    ownerName: 'Sunil Jadhav',
    area: 'Handewadi',
    review: 'Kalu is an indie who roams a big compound and always has something in his coat. The groomer did a proper deep wash and found two ticks I hadn\'t seen. Good that she checked carefully. The coat looked noticeably better and he smelled fresh for a change.',
    rating: 5,
  },
  {
    petName: 'Golu',
    ownerName: 'Priya Shinde',
    area: 'Near Handewadi',
    review: 'We live in a new society and I wasn\'t sure home grooming would work in our small flat. The groomer set up in the bathroom and managed everything perfectly. Golu was calm the whole time and came out looking excellent.',
    rating: 5,
  },
];

export const handewadiFAQs: FAQ[] = [
  {
    question: 'Does your service cover the newer societies in Handewadi?',
    answer: 'Yes. We service all residential areas in Handewadi including newer society developments and older plotted properties.'
  },
  {
    question: 'Do you check for ticks in every session?',
    answer: 'Yes. A full tick check covering the ears, neck, underbelly, tail base, and between the toes is part of every session. We flag anything we find immediately.'
  },
  {
    question: 'Is grooming suitable for dogs that have never been groomed before?',
    answer: 'Absolutely. We take a gradual, patient approach for first-time grooms — introducing tools slowly and allowing breaks. Home environments make this much more successful than salon settings.'
  },
  {
    question: 'What is your anti-parasitic treatment option for tick-prone dogs?',
    answer: 'We can use a mild anti-parasitic shampoo as part of the session for dogs with known tick exposure. Mention this when booking and we\'ll prepare accordingly.'
  },
  {
    question: 'Can I book for multiple dogs in one visit?',
    answer: 'Yes. Multi-dog sessions are available. Mention all dogs when booking so we plan the session time correctly.'
  },
  {
    question: 'How does pricing work for different breed sizes?',
    answer: 'Pricing varies by size and coat complexity. We give a transparent quote when you contact us with your dog\'s breed and size. No surprises.'
  },
  {
    question: 'Do you cover Undri, Mohammed Wadi and the societies toward Saswad Road?',
    answer: 'Yes, along with the Handewadi Road belt and the Kondhwa side. This area has grown quickly and several societies share builder names across different phases, so mention your phase or tower at booking and send a pin — it saves the groomer a call from your gate.'
  },
  {
    question: 'The highway traffic throws up a lot of dust. Does that shorten the grooming cycle?',
    answer: 'It does, by roughly a couple of weeks for most coats. Road dust off the Pune–Solapur stretch is fine enough to settle into the undercoat rather than sit on top of it, and it leaves the coat dull and gritty to the hand. Six weeks generally holds condition better here than the eight a coat type alone would suggest.'
  },
  {
    question: 'Our new society still has irregular water supply. Is that enough for a session?',
    answer: 'Easily. The wash and rinse stages together are around twenty minutes of the visit — three or four filled buckets cover a medium dog comfortably. If your supply is timed, either book inside that window or keep buckets ready and tell the groomer on arrival so they work from stored water deliberately.'
  },
  {
    question: 'We keep a large guard breed. How do you approach a protective dog?',
    answer: 'With an escorted introduction rather than a cold one. Tell us the breed and temperament at booking, and meet the groomer at the gate and bring them in yourself — a territorial dog reads an escorted stranger very differently from one who appears at the door. From there the groomer works slowly and lets the dog set the pace on the first visit.'
  },
  {
    question: 'Are weekend slots available here?',
    answer: 'Yes, Saturday and Sunday at the same 9 AM to 9 PM hours. Weekends are the busiest window in this belt because most households here work a standard week, so book four or five days ahead rather than trying on the Friday and hoping.'
  }
];

// ════════════════════════════════════════════════════════════
// HADAPSAR
// ════════════════════════════════════════════════════════════

export const hadapsarLocation: LocationConfig = {
  name: 'Hadapsar',
  slug: 'dog-grooming-in-pune/hadapsar',

  heroH1: `Home Dog Grooming in Hadapsar — From IT Corridor to Your Doorstep`,
  heroSubtext:
    'Hadapsar has the density, the IT parks, and the dog-loving families. Now it has proper home grooming. Sniffy groomers visit your society — professional, calm, thorough.',

  storySections: [
    {
      heading: 'Hadapsar\'s Scale Demands a Service That Comes to You',
      subheading: 'One of Pune\'s largest residential-industrial zones.',
      paragraphs: [
        'Hadapsar is enormous — IT parks on one side, dense residential societies in the middle, and older manufacturing areas threading through. The dog-owning population spans this whole spectrum — software engineers in the societies near Magarpatta, families in the older Hadapsar areas, and everyone in between. What they share is the inconvenience of managing grooming across a large, traffic-congested zone. Our home grooming in Hadapsar removes that inconvenience completely. One booking, one groomer at your door, no travel needed.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Hadapsar Pune',
      imageLeft: true,
    },
    {
      heading: 'The Magarpatta Corridor: Tech Professionals and Their Dogs',
      subheading: 'Flexible scheduling for busy IT families.',
      paragraphs: [
        'The areas around Magarpatta City, Amanora, and the tech parks have a strong dog-owning culture among young professionals. Many adopted dogs during remote work periods and are now managing grooming while also managing full office schedules again. Our flexible slot system accommodates this — morning before office, afternoon with a WFH day, or evening after work. The session runs independently without requiring you to supervise the whole time.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Dog grooming during work hours in Hadapsar',
      imageLeft: false,
    },
    {
      heading: 'Old Hadapsar, New Standard',
      subheading: 'Every part of Hadapsar deserves professional care.',
      paragraphs: [
        'The older established areas of Hadapsar — further from the tech corridor — have dog-owning families who are equally deserving of quality grooming but historically had even fewer options. We service all of Hadapsar, not just the premium society pockets. Every dog parent deserves a professional, reliable groomer at their door regardless of which part of Hadapsar they live in.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Dog grooming in older Hadapsar residential area',
      imageLeft: true,
    },
    {
      heading: 'A Grooming Session That Does More Than Clean',
      subheading: 'Observation, care, and honest communication.',
      paragraphs: [
        'Hadapsar\'s dog parents are generally well-informed about pet health — they follow vet schedules, buy quality food, and notice when something looks off. Our grooming sessions complement that attentiveness with a quiet surface-level health observation during every visit. Coat changes, skin issues, nail growth, ear condition — if we notice something, we mention it. If everything looks good, we confirm that too.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Thorough dog grooming health observation in Hadapsar',
      imageLeft: false,
    },
    {
      heading: `How We Groom Hadapsar's Dog Breeds`,
      subheading: `Large zone, diverse dogs, consistent quality.`,
      paragraphs: [
        `Hadapsar's scale means we see a genuinely wide range of breeds — Huskies and Doodles in the Magarpatta societies, large working breeds in the older areas, compact Indies across the full spread. The one constant is that every single dog gets the same standard of care from our groomers. There's no tiered service based on postcode or property type.`,
        `Our approach to the breeds we groom most in Hadapsar:`,
      ],
      bullets: [
        `Labrador grooming in Hadapsar — By volume, always our most frequent booking. Thorough deshedding, ear flush, paw check. Labs are reliable, cooperative patients in home environments.`,
        `Husky grooming in Hadapsar — Pune's summer is no friend to Huskies. We do a serious blow-out deshedding session that removes loose undercoat and helps with natural thermoregulation without ever shaving or clipping the protective double coat.`,
        `Doodle grooming in Hadapsar — High demand in the Magarpatta and Amanora societies. Curly non-shedding coats mat fast without regular attention. We detangle before bathing and shape the coat to preference post-wash.`,
        `German Shepherd grooming in Hadapsar — Heavy seasonal shedders that are common in the older parts of Hadapsar. We do a full deshedding protocol and ear check every session.`,
        `Indie dog grooming in Hadapsar — An enormous population of well-loved Indies across all of Hadapsar. We treat every Indie with full professionalism and a thorough tick and skin check.`,
        `Persian cat grooming in Hadapsar — We see quite a few Persians in the tech corridor societies. Patient, section-by-section grooming every three to four weeks is essential for these coats.`,
      ],
      closingLine: `For the tech corridor areas near Magarpatta — we're experienced with high-rise society logistics and have never had a building management issue.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Home dog grooming across Hadapsar Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/hadapsar'),
  nearbyAreas: ['Magarpatta City', 'Kharadi', 'Wanowrie', 'Mundhwa', 'Handewadi', 'Manjri', 'Solapur Road', 'Camp'],
};

export const hadapsarMapEmbed = 'https://www.google.com/maps?q=Hadapsar,Pune&output=embed';

export const hadapsarReviews: LocationReview[] = [
  {
    petName: 'Blizzard',
    ownerName: 'Ravi Tiwari',
    area: 'Magarpatta',
    review: `Blizzard is a Husky and I've struggled to find a groomer who understands the double coat. The Sniffy groomer was excellent — explained why we don't clip Huskies, did a proper blow-out, and the shedding has noticeably reduced. This is exactly what I needed.`,
    rating: 5,
  },
  {
    petName: 'Brownie',
    ownerName: 'Usha Nair',
    area: 'Hadapsar',
    review: `Brownie is an Indie rescue who's still learning to trust people. The groomer was incredibly patient — slow movements, quiet voice, gave breaks when Brownie needed them. By the end of the session Brownie was visibly relaxed. I've never seen her so comfortable with a stranger.`,
    rating: 5,
  },
];

export const hadapsarFAQs: FAQ[] = [
  {
    question: 'Do you cover all areas of Hadapsar including the older residential zones?',
    answer: 'Yes. We service all of Hadapsar — from the tech corridor societies near Magarpatta to the older established residential areas.'
  },
  {
    question: 'Can you accommodate WFH-friendly slots around my meeting schedule?',
    answer: 'Yes. We can work around your schedule. Once we\'re set up, the session runs independently and you don\'t need to supervise the whole time.'
  },
  {
    question: 'Is cat grooming available in Hadapsar?',
    answer: 'Yes. We groom cats including Persians and domestic long-haired breeds across all of Hadapsar.'
  },
  {
    question: 'How often should a Doodle be groomed in Pune\'s climate?',
    answer: 'Every four to five weeks. Pune\'s humidity accelerates matting in curly coats. Regular professional sessions plus home brushing between visits is the ideal combination.'
  },
  {
    question: 'What do you do if you find a skin issue or tick during grooming?',
    answer: 'We alert you immediately, describe what we found, and recommend whether you should see a vet or monitor at home. We never remove embedded ticks ourselves — that requires a vet.'
  },
  {
    question: 'Are your products safe for Indie dogs with sensitive skin?',
    answer: 'Yes. We carry gentle, fragrance-free options suited to sensitive skin types. Many of our rescued Indie clients use the hypoallergenic shampoo option.'
  },
  {
    question: 'Magarpatta and Amanora need a gate pass for service visitors. How do we arrange it?',
    answer: 'Tell us at booking and we will send you the groomer\'s name and number ahead of the slot so you can raise the entry on the township app or with the gate. Both townships are strict about pre-approval, and without it the groomer waits at the barrier — which eats into your session rather than ours.'
  },
  {
    question: 'Which lift do groomers use in the township towers?',
    answer: 'Whichever your building requires, including a service lift — everything fits in one shoulder bag so it makes no practical difference. The only thing worth flagging is if the service entrance is on a different side of the complex from the main gate, which is the usual reason a groomer loses ten minutes inside a large Hadapsar township.'
  },
  {
    question: 'What is your latest evening slot? I only get back after work.',
    answer: 'The last workable start is around 7 PM, so the coat is fully dry before the groomer leaves. We run to 9 PM but a session starting at 8 either finishes rushed or finishes with a damp dog, and we will not do either. Evening slots in Hadapsar and Magarpatta go early in the week — book a few days ahead.'
  },
  {
    question: 'When can my puppy have its first session?',
    answer: 'After the core vaccination course, usually around twelve to sixteen weeks — your vet can confirm where your puppy is in the schedule. Keep the first visit short and deliberately easy: paws and ears handled, a comb through, the dryer heard from across the room. The aim is a puppy that accepts handling, not a finished haircut.'
  },
  {
    question: 'Someone at home is allergic to dog hair. Is deshedding worth booking?',
    answer: 'Yes, more than most other services. The trigger for most people is dander riding on shed undercoat rather than the hair itself, so removing that undercoat on a schedule instead of letting it drop around the flat makes a genuine difference. It manages the problem rather than eliminating it, but for a shedding breed in an apartment it is the most effective single thing available.'
  }
];

// ════════════════════════════════════════════════════════════
// BIBEWADI
// ════════════════════════════════════════════════════════════

export const bibewadiLocation: LocationConfig = {
  name: 'Bibewadi',
  slug: 'dog-grooming-in-pune/bibewadi',

  heroH1: `Dog Grooming at Home in Bibewadi — Trusted, Gentle, No Stress`,
  heroSubtext:
    `Bibewadi's family communities deserve a grooming service that comes to them. Sniffy provides professional at-home dog grooming across Bibewadi — calm approach, clean finish, no salon required.`,

  storySections: [
    {
      heading: 'Bibewadi: A Settled Community with Loyal Dog Families',
      subheading: 'Long-term residents who value trusted services.',
      paragraphs: [
        'Bibewadi is one of Pune\'s more settled residential areas — families who have been here for years, a strong community culture, and dogs who are deeply embedded in household life. These aren\'t trend-pet owners; these are families where the dog has been part of the routine for eight or ten years. Services that earn their trust do so through consistency and genuine care, not marketing. Our home dog grooming in Bibewadi is built around that kind of long-term relationship.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Bibewadi Pune',
      imageLeft: true,
    },
    {
      heading: 'Low-Stress Grooming in a Familiar Space',
      subheading: 'The home advantage makes every session better.',
      paragraphs: [
        'Dogs in Bibewadi tend to be comfortable, settled animals that know their territory well. Moving them to a salon environment — unfamiliar smells, cage waiting, other anxious animals — disrupts that comfort unnecessarily. At-home grooming in Bibewadi preserves the dog\'s comfort while delivering salon-quality results. The session happens in the dog\'s own space, at a pace they\'re comfortable with, which produces consistently better cooperation than any salon visit can match.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Calm dog grooming session in Bibewadi home',
      imageLeft: false,
    },
    {
      heading: 'Practical Hygiene Management for Every Season',
      subheading: 'Summer shedding and monsoon moisture both handled.',
      paragraphs: [
        'Bibewadi sits in a part of Pune that experiences the full force of seasonal change — intense summer shedding, heavy monsoon humidity, and dry winter coats. Regular grooming across all seasons keeps your dog\'s coat and skin in optimal condition. We adjust our product selection and session focus based on the season — deshedding in summer, moisture-aware rinses in monsoon, conditioning in winter.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Seasonal dog grooming in Bibewadi',
      imageLeft: true,
    },
    {
      heading: 'Consistency You Can Plan Around',
      subheading: 'Reliable scheduling, reliable results.',
      paragraphs: [
        'Bibewadi families tell us the most important thing about a service is that it works as described. Our groomers arrive on time, perform thoroughly, clean up completely, and communicate honestly about what they observed. This consistent operating standard is why our Bibewadi clients rebook reliably — because they know exactly what to expect every session.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Happy groomed dog in Bibewadi family home',
      imageLeft: false,
    },
    {
      heading: `Grooming the Breeds We See Most in Bibewadi`,
      subheading: `Family dogs, family care.`,
      paragraphs: [
        `Bibewadi dog ownership patterns reflect its settled family character. Labradors, German Shepherds, Indian Spitz, and a significant number of Indies are the dominant breeds. Many are on the older side — well-established family members that have been part of the household for years. We treat every grooming session with the respect that long-term relationship deserves.`,
        `Our breed-specific approach for Bibewadi's most common dogs:`,
      ],
      bullets: [
        `Labrador grooming in Bibewadi — Always the most common booking in family-oriented areas. Regular deshedding keeps indoor living manageable for both the dog and the family. Ear hygiene and paw checks are non-negotiable parts of every session.`,
        `Indian Spitz grooming in Bibewadi — The original beloved Indian family dog. The beautiful double coat needs deshedding every six to eight weeks in Pune's heat. We restore the breed's characteristic silhouette with a careful post-dry brush-through.`,
        `German Shepherd grooming in Bibewadi — Loyal guard dogs common in Bibewadi's independent homes. Confident handling produces cooperative sessions. Regular deshedding dramatically reduces the daily fur management challenge.`,
        `Indie dog grooming in Bibewadi — Long-term family Indies in Bibewadi are often the most characterful dogs we groom — settled, personality-rich, and used to their household routines. We work within those routines.`,
        `Persian cat grooming in Bibewadi — Several Bibewadi families have Persians. Long-haired cats need grooming every three to four weeks minimum and patient, unhurried handling.`,
        `Pomeranian grooming in Bibewadi — Classic apartment companion. We let Poms set the initial pace, work carefully through the double coat, and deliver the neat rounded finish the breed deserves.`,
      ],
      closingLine: `For senior dogs who've been with the family for many years — please mention their age and any conditions when booking. We plan these sessions with extra care.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Family dog home grooming in Bibewadi Pune`,
      imageLeft: true,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/bibewadi'),
  nearbyAreas: ['Katraj', 'Kondhwa', 'Sinhagad Road', 'Warje', 'Dhayari', 'Parvati Hill', 'Narhe', 'Sahakarnagar'],
};

export const bibewadiMapEmbed = 'https://www.google.com/maps?q=Bibewadi,Pune&output=embed';

export const bibewadiReviews: LocationReview[] = [
  {
    petName: 'Tuffy',
    ownerName: 'Ramesh Kulkarni',
    area: 'Bibewadi',
    review: 'Tuffy has been in our family for eleven years and grooming him requires patience. The Sniffy groomer handled him beautifully — slow pacing, plenty of breaks, and a thorough job throughout. This is the level of care an old family dog deserves.',
    rating: 5,
  },
  {
    petName: 'Nandu',
    ownerName: 'Smita Bhoir',
    area: 'Bibewadi Chowk',
    review: 'Nandu is a very energetic Indian Spitz and keeping him still long enough for grooming is a challenge. The groomer was skilled at managing him without stress or force. The coat came out properly deshedded and the silhouette looked just right.',
    rating: 5,
  },
];

export const bibewadiFAQs: FAQ[] = [
  {
    question: 'Do you work with dogs that have been in the family for many years?',
    answer: 'Yes. Long-term family dogs are among our most appreciated clients. We treat every senior dog with the patience and respect their age and relationship with your family warrants.'
  },
  {
    question: 'Is home grooming suitable for older dogs who don\'t travel well?',
    answer: 'It\'s ideal. Senior dogs with arthritis, mobility issues, or travel anxiety benefit enormously from staying in their home environment for grooming.'
  },
  {
    question: 'What shampoo do you use for dogs with sensitive or ageing skin?',
    answer: 'We carry mild, fragrance-free options for sensitive skin. Ageing dogs often have drier, more delicate skin and we select products accordingly.'
  },
  {
    question: 'How do you handle grooming during monsoon?',
    answer: 'We continue operating during monsoon. For dogs exposed to damp conditions, we use an anti-fungal rinse as standard precaution.'
  },
  {
    question: 'Is regular grooming important even for short-haired dogs?',
    answer: 'Yes. Short-haired dogs still shed, develop ear issues, and grow nails. Regular grooming provides health monitoring that is valuable for any coat type.'
  },
  {
    question: 'Can I observe the full session?',
    answer: 'Yes. You are welcome to watch throughout. Some dogs actually do better with the owner present; others do slightly better with a little space. We let the dog tell us which they prefer.'
  },
  {
    question: 'Do you cover Sahakarnagar, Parvati and the Sinhagad Road side?',
    answer: 'Yes, along with the Katraj and Kondhwa ends of Bibewadi. It is a dense, central-south belt and easy for us to reach, so arrival windows here are usually tighter and more reliable than in the outer townships.'
  },
  {
    question: 'We walk our dog on Parvati Hill daily. Is there anything specific to check?',
    answer: 'Grass seeds and burrs alongside the usual tick check. The hill paths shed seed heads that lodge between the toes and inside the ear canal, and left alone they can work under the skin. Our groomers check the webbing between every toe and both ears as standard — for a dog walking Parvati every morning that is one of the more useful things a session does.'
  },
  {
    question: 'Our building is old with narrow stairs and no lift. Does that work for an older dog?',
    answer: 'It works, but we plan around the dog rather than the building. If your senior dog does not do stairs comfortably, we set up on the ground floor and work from filled buckets rather than bringing them up and down for a bath. Old flooring is also genuinely slippery for an arthritic dog, so the groomer lays non-slip matting throughout.'
  },
  {
    question: 'Our dog has a heart condition. Is a full session safe?',
    answer: 'Often yes, with a shorter session and more breaks — but tell us at booking and tell us what your vet has said. We shorten the standing time, avoid positions that stress the chest, keep the water comfortably warm rather than hot, and stop early if the dog tires. If we think the session is not safe for your dog on the day, we will say so and reschedule rather than push through.'
  },
  {
    question: 'Can I get a nail trim on its own for our senior dog?',
    answer: 'Yes, and for an older dog it is often the sensible choice. A short maintenance visit covering nails, ears and paw hair is available below package price. Overgrown nails change how an arthritic dog loads its joints, so keeping them short matters considerably more than bathing an elderly dog on a fixed schedule does.'
  }
];

// ════════════════════════════════════════════════════════════
// CAMP
// ════════════════════════════════════════════════════════════

export const campLocation: LocationConfig = {
  name: 'Camp',
  slug: 'dog-grooming-in-pune/camp',

  heroH1: `Home Dog Grooming in Camp, Pune — Heritage Neighbourhood, Modern Service`,
  heroSubtext:
    'Camp\'s dog families have always had taste. Now they have a grooming service to match. Sniffy brings professional at-home dog grooming to Camp, Pune — refined, reliable, at your door.',

  storySections: [
    {
      heading: 'Camp Pune: Where Heritage Meets Fastidious Pet Care',
      subheading: 'One of Pune\'s most storied neighbourhoods, served properly.',
      paragraphs: [
        'Camp is different from everywhere else in Pune. The wide British-era roads, the cantonment heritage, the established Parsi and Anglo-Indian communities, the MG Road commercial strip, and the quiet bungalow lanes running off it all contribute to a neighbourhood with genuine character and clear standards. Dog families in Camp tend to be multi-generational pet owners with well-established views on how animals should be treated. At-home dog grooming in Camp suits this culture exactly — professional, discrete, respectful of both the dog and the household.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Camp Pune',
      imageLeft: true,
    },
    {
      heading: 'Heritage Bungalows to Modern Apartments — We Work in Both',
      subheading: 'Camp\'s property variety is no obstacle.',
      paragraphs: [
        'Camp has an unusual range of residential properties — grand old bungalows on quiet lanes, officer\'s quarters from the cantonment era, and newer apartment developments that have come up as the neighbourhood has evolved. We set up and groom efficiently in all of these. For bungalows, gardens and covered verandas are excellent grooming spaces. For apartments, our compact indoor setup is perfectly designed for the floor plan.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Dog grooming in Camp Pune bungalow veranda',
      imageLeft: false,
    },
    {
      heading: 'Grooming Expertise Earned Over Many Breeds',
      subheading: 'Camp\'s dog diversity requires broad expertise.',
      paragraphs: [
        'Camp Pune has some of Pune\'s most interesting and long-established dog families. We encounter breeds here that we rarely see elsewhere — Boxers, English Cocker Spaniels, Beagles kept in the traditional hunting-breed way, well-maintained Dalmatians, and a healthy population of the beloved dogs of the Parsi community. Each breed\'s coat, temperament, and grooming requirements are genuinely different, and our groomers are prepared for all of them.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Expert grooming for heritage breeds in Camp Pune',
      imageLeft: true,
    },
    {
      heading: 'Discreet, Professional, and Consistently Excellent',
      subheading: 'The standard Camp families expect.',
      paragraphs: [
        'Our grooming service in Camp operates with a level of professionalism and discretion that matches the neighbourhood\'s character. We arrive quietly, work efficiently, respect the space we\'re in, and leave no trace. The focus is entirely on the dog — thorough, expert, unhurried. Our Camp clients have become some of our most consistent and vocal advocates because the service consistently delivers what it promises.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Perfectly groomed dog in Camp Pune',
      imageLeft: false,
    },
    {
      heading: `The Dog Breeds of Camp Pune — Expert Care for Every One`,
      subheading: `Heritage dogs, heritage standards.`,
      paragraphs: [
        `Camp Pune has Pune's highest concentration of English and European dog breeds outside of cantonment areas. These breeds have been in some families for generations, and their grooming needs are very specific. A Boxer's skin folds need individual cleaning. A Dalmatian's dense short coat needs specific brushing to manage shedding. An English Cocker Spaniel's ears are a full grooming task unto themselves. We bring the expertise these breeds deserve.`,
        `The breeds we groom most in Camp and what each session involves:`,
      ],
      bullets: [
        `Boxer grooming in Camp — Skin folds around the face and muzzle need individual cleaning every session. We work through each fold with care, use a firm rubber brush on the short body coat, and give particular attention to nail length since Boxers develop overgrowth quickly.`,
        `English Cocker Spaniel grooming in Camp — Long silky body coat, feathered legs, and those iconic ears. We clean the ear canal thoroughly, trim the ear edges, and style the body coat to show or practical finish depending on the owner's preference.`,
        `Dalmatian grooming in Camp — Short dense coats that shed more than you'd expect. We use a rubber curry brush and follow with a deshedding shampoo. Dalmatians' distinctive coats look excellent when properly maintained.`,
        `Labrador grooming in Camp — Classic family breed across all of Camp's communities. Full deshedding protocol, ear flush, paw inspection. The standard that never changes.`,
        `Persian cat grooming in Camp — Several Camp families have Persians that need consistent professional attention. Patient, section-by-section work every three to four weeks.`,
        `Indie dog grooming in Camp — Well-socialised Indies in Camp's generous bungalow grounds have often been part of the family for years. We treat them with the full professionalism any long-term family dog deserves.`,
      ],
      closingLine: `For heritage breeds or dogs with specific medical histories, please share details when booking. We always prepare rather than improvise.`,
      image: `/images/grooming-session-4.jpg`,
      imageAlt: `Expert home dog grooming in Camp Pune heritage area`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/camp'),
  nearbyAreas: ['Koregaon Park', 'Wanowrie', 'Kalyani Nagar', 'NIBM Road', 'Dhole Patil Road', 'MG Road', 'East Street', 'Solapur Road'],
};

export const campMapEmbed = 'https://www.google.com/maps?q=Camp,Pune&output=embed';

export const campReviews: LocationReview[] = [
  {
    petName: 'Monty',
    ownerName: 'Percy Irani',
    area: 'Camp',
    review: `Monty is an elderly Boxer and grooming him requires real care around his face folds. The Sniffy groomer knew exactly what to do — cleaned each fold individually, was gentle with his old joints, and completed everything without Monty showing any stress. This is the professional standard we've always wanted.`,
    rating: 5,
  },
  {
    petName: 'Lady',
    ownerName: 'Mrs. Fernandes',
    area: 'East Street area',
    review: `Lady is an English Cocker and her ears are always my concern. The groomer cleaned both ear canals properly, trimmed the ear edges neatly, and styled the body coat beautifully. I couldn't have asked for more careful, expert work.`,
    rating: 5,
  },
];

export const campFAQs: FAQ[] = [
  {
    question: 'Do you groom in bungalow properties in Camp?',
    answer: 'Yes. Bungalow gardens and covered verandas are excellent grooming spaces. We work outdoors where the space allows and bring everything needed including water containers if access is a concern.'
  },
  {
    question: 'Do you have experience with Boxers and their skin fold care?',
    answer: 'Yes. Boxer skin fold cleaning is a specific skill that\'s part of every session for this breed. We work through each fold carefully to prevent moisture buildup and irritation.'
  },
  {
    question: 'How do you handle elderly dogs from long-standing family homes?',
    answer: 'Senior dogs in established families are among our most carefully handled clients. We slow the session, provide breaks, and approach the whole process with the patience that a long-standing family companion deserves.'
  },
  {
    question: 'Is cat grooming available in Camp?',
    answer: 'Yes. We groom cats including Persians and domestic long-haired breeds across Camp.'
  },
  {
    question: 'What notice do you need for a booking in Camp?',
    answer: '24–48 hours is ideal. We can sometimes accommodate shorter notice. Contact us via WhatsApp for the fastest response.'
  },
  {
    question: 'Are your groomers discreet about operating within residential properties?',
    answer: 'Yes. We operate with professionalism and quiet efficiency. We never cause disruption to neighbouring properties and leave no visible trace of the session outside the immediate working area.'
  },
  {
    question: 'Does the cantonment board require anything for a service visitor to enter?',
    answer: 'Your gate\'s normal process, nothing more. The groomer carries photo identification, and we can send you their name and number ahead of the slot so entry can be logged in advance. Cantonment properties tend to be stricter about pre-notification than civilian societies, so it is worth arranging before the visit rather than at the barrier.'
  },
  {
    question: 'Parking around East Street and MG Road is impossible. Is that a problem?',
    answer: 'Not for us. Groomers arrive by two-wheeler with the entire kit in one shoulder bag — no van, no bay, nothing unloaded at your gate. It is precisely why doorstep grooming is practical in the older, tighter parts of Camp at all.'
  },
  {
    question: 'We live in an old cantonment bungalow. Is the water and power setup an issue?',
    answer: 'Rarely. The groomer needs a tap for roughly twenty minutes and one working plug point for the dryer. Old bungalows sometimes have both a long way from where the dog is comfortable, so if the nearest usable socket is in another room, mention it — the groomer will bring the working area to the plug rather than run a dog around the house.'
  },
  {
    question: 'Do you handle less common breeds that older Camp families tend to keep?',
    answer: 'Yes — Boxers, Dobermans, Great Danes, Cocker Spaniels and Dachshunds are all routine here, and each needs something specific: fold cleaning on a Boxer, ear care on a Cocker, careful back handling on a Dachshund. If you have a breed we would not see often, tell us at booking so we send a groomer who has actually worked that coat.'
  },
  {
    question: 'We are relocating abroad with our dog. What grooming should happen first?',
    answer: 'A full bath two to three days before the flight so the coat is completely dry before crate time, nails taken short, and paw and sanitary hair trimmed. Those affect crate comfort far more than a fresh haircut does. Schedule tightly around the vet health certificate, not around the grooming — a bath on travel morning leaves a damp undercoat in a cold hold.'
  }
];

// ════════════════════════════════════════════════════════════
// WANOWRIE
// ════════════════════════════════════════════════════════════

export const wanowrieLocation: LocationConfig = {
  name: 'Wanowrie',
  slug: 'dog-grooming-in-pune/wanowrie',

  heroH1: `Home Dog Grooming in Wanowrie — Thoughtful Care at Your Door`,
  heroSubtext:
    'Wanowrie\'s well-maintained residential communities deserve grooming that matches their standard. Sniffy provides professional at-home dog grooming in Wanowrie — meticulous, gentle, and genuinely thorough.',

  storySections: [
    {
      heading: 'Wanowrie: A Premium Residential Pocket That Demands Premium Care',
      subheading: 'Calm streets, considered lifestyles, and excellent dogs.',
      paragraphs: [
        'Wanowrie has developed into one of Pune\'s more desirable south-eastern residential corridors — close enough to Camp and NIBM for amenities, far enough from the city core for space and quiet. The residential communities here are well-maintained and attract families who are thoughtful about where and how they live. That thoughtfulness extends to how they keep and care for their dogs. Our at-home dog grooming in Wanowrie is designed for exactly this clientele — structured, professional, and genuinely expert rather than just cosmetically adequate.'
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Home dog grooming in Wanowrie Pune',
      imageLeft: true,
    },
    {
      heading: 'Society-Compliant, Resident-Respectful',
      subheading: 'No disruption, no mess, no complaints.',
      paragraphs: [
        'Wanowrie\'s well-managed residential societies have standards we fully respect. Our setup is quiet, contained, and leaves zero trace. We coordinate arrival timing with you, work within the space you designate, and complete a thorough cleanup before leaving. Building management has never raised a concern about our sessions. This operating discipline is non-negotiable for us — your society\'s rules are our rules.'
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Society-compliant dog grooming in Wanowrie',
      imageLeft: false,
    },
    {
      heading: 'Coat Health That Reflects the Care You Already Put In',
      subheading: 'Professional grooming for dogs that are already well-maintained.',
      paragraphs: [
        'Wanowrie dog parents tend to be diligent about home brushing, diet, and vet care. They come to us not because their dog is in poor coat condition — typically the opposite. They come because they want the professional layer of care that complements their day-to-day effort: the deep cleanse that reaches what home brushing doesn\'t, the ear check that a vet only does occasionally, the nail trim done correctly rather than nervously at home. We\'re the professional interval in a well-run pet care routine.'
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Professional grooming complement to home care in Wanowrie',
      imageLeft: true,
    },
    {
      heading: 'One Booking. Full Service. Perfect Finish.',
      subheading: 'No half-measures in Wanowrie.',
      paragraphs: [
        'Standard sessions cover bath, blow-dry, brush, nail trim, ear cleaning, and sanitary trim. Add-ons including haircut styling and coat conditioning are available and clearly priced. We bring all professional equipment and products. From arrival to departure, the session is structured and deliberate. Our Wanowrie clients are among the most consistent rebookers we have — because the sessions consistently deliver exactly what is promised.'
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Perfect finish dog grooming in Wanowrie',
      imageLeft: false,
    },
    {
      heading: `Wanowrie\'s Dog Breeds — Premium Neighbourhood, Personalised Grooming`,
      subheading: `Every detail considered, every coat respected.`,
      paragraphs: [
        `Wanowrie dog owners are informed, particular, and appreciative of genuine expertise. They notice the difference between a groomer who is going through the motions and one who is actually thinking about the individual dog in front of them. We are firmly in the second category. In Wanowrie, we see Golden Retrievers, Labradors, Shih Tzus, Lhasa Apsos, and a growing number of Doodles — each with specific coat needs and each with owners who know those needs well.`,
        `Our breed-specific approach for Wanowrie's most common dogs:`,
      ],
      bullets: [
        `Golden Retriever grooming in Wanowrie — Well-maintained Goldens in Wanowrie still need the professional layer — deep conditioning, feathering management, and a proper blow-dry that restores coat volume and shine.`,
        `Labrador grooming in Wanowrie — Regular deshedding, ear hygiene, and paw checks. We don\'t cut corners on Labs because the coat looks simple — the deshedding component is as important for a Lab as it is for a GSD.`,
        `Shih Tzu grooming in Wanowrie — Many Wanowrie Shih Tzu owners maintain longer coats with a specific style they\'ve cultivated over time. We follow that brief precisely and use conditioning to support coat length and health.`,
        `Lhasa Apso grooming in Wanowrie — Floor-length coats that need careful, patient handling. We work through the coat in sections, address any matting safely, and finish with a conditioning rinse.`,
        `Doodle grooming in Wanowrie — The curly non-shedding coats that need regular attention. We detangle before bathing and shape to owner preference post-wash. Always a two-step process done properly.`,
        `Indie dog grooming in Wanowrie — Thoughtfully adopted Indies in well-maintained Wanowrie homes deserve the same quality of grooming as any pedigree. We always deliver that.`,
      ],
      closingLine: `For Wanowrie clients who want the same groomer for every session — we prioritise groomer consistency for repeat bookings wherever scheduling allows.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Premium home dog grooming in Wanowrie Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/wanowrie'),
  nearbyAreas: ['NIBM', 'Kondhwa', 'Camp', 'Salunke Vihar', 'Hadapsar', 'Undri', 'Solapur Road', 'Mohammadwadi'],
};

export const wanowrieMapEmbed = 'https://www.google.com/maps?q=Wanowrie,Pune&output=embed';

export const wanowrieReviews: LocationReview[] = [
  {
    petName: 'Hugo',
    ownerName: 'Aarti Menon',
    area: 'Wanowrie',
    review: `Hugo is a Golden Retriever and I maintain his coat carefully at home between sessions. The Sniffy groomer clearly noticed this — she adapted the session to what Hugo actually needed rather than following a standard routine. The conditioning treatment she used made his coat the softest it's been. Genuinely expert service.`,
    rating: 5,
  },
  {
    petName: 'Lily',
    ownerName: 'Vikash Sethi',
    area: 'Near Salunke Vihar',
    review: `Lily is a Lhasa Apso with a full-length coat and we've had bad experiences with groomers who just clipped out any tangle. This groomer worked through the coat properly and only trimmed what genuinely needed trimming. The coat looks beautiful and Lily stayed calm throughout.`,
    rating: 5,
  },
];

export const wanowrieFAQs: FAQ[] = [
  {
    question: 'Do you service the gated societies in Wanowrie?',
    answer: 'Yes. We service all gated and non-gated residential areas across Wanowrie.'
  },
  {
    question: 'How do you handle dogs whose owners already do regular home brushing?',
    answer: 'Home brushing is excellent maintenance and we\'re glad when owners do it. The professional session adds what home brushing can\'t — deep cleansing, proper blow-dry, ear checks, nail care, and coat conditioning. They work in complement.'
  },
  {
    question: 'Can I specify a particular grooming brief or trim style?',
    answer: 'Yes. Detailed briefs are very welcome. Send a reference image and describe your preferences when booking. We discuss it before starting to ensure alignment.'
  },
  {
    question: 'What if my dog\'s coat has developed mats despite regular brushing?',
    answer: 'Mats happen — particularly in areas prone to friction. We always attempt safe detangling before any clipping. We discuss with you before removing anything and explain what we find.'
  },
  {
    question: 'Is there a service difference between your first and subsequent sessions?',
    answer: 'The first session is sometimes slightly longer as we assess the coat thoroughly and let the dog settle. By the second and third sessions, the routine is established and the session tends to run more smoothly.'
  },
  {
    question: 'Do you groom cats in Wanowrie?',
    answer: 'Yes. Cat grooming is available in Wanowrie including for long-haired and Persian breeds.'
  },
  {
    question: 'Do groomers need clearance for Salunke Vihar and the cantonment-side addresses?',
    answer: 'Only your gate\'s usual process for a service visitor. The groomer carries photo identification and we can send their name and number ahead so entry is logged before the slot. The cantonment-adjacent addresses in Wanowrie are stricter about pre-notification than the civilian societies, so arranging it beforehand is worth the two minutes.'
  },
  {
    question: 'Do you cover the NIBM Road and Undri side of Wanowrie?',
    answer: 'Yes, along with Fatima Nagar, Salunke Vihar and the Hadapsar border stretch. Several societies here share names across phases, so mention your phase or tower at booking and send a pin — it is the usual reason a groomer arrives at the right complex and the wrong gate.'
  },
  {
    question: 'How do you adjust a session for a senior dog?',
    answer: 'Shorter standing time, more breaks, non-slip matting under the paws throughout, and no positioning that forces a stiff joint. Water stays comfortably warm rather than hot, and we stop early if the dog tires rather than finishing the checklist. Tell us about arthritis, heart conditions or recent medication at booking so the groomer arrives planning for it.'
  },
  {
    question: 'What happens if the power goes out during the session?',
    answer: 'Only the dryer needs electricity, so a cut pauses things rather than ending them. If your building has an inverter, tell the groomer which sockets are backed up. We will not leave a dog part-dried and go — if power is genuinely out we towel-dry down thoroughly and wait for it to return.'
  },
  {
    question: 'Is it harder to get a slot around Diwali and long weekends?',
    answer: 'Considerably. Everyone wants the dog looking presentable on the same two or three days, and those slots go about a week ahead across Wanowrie and NIBM. If your dog is on a regular cycle, the simplest fix is booking the next session before the groomer leaves rather than competing for a festival slot later.'
  }
];

// ════════════════════════════════════════════════════════════
// HINJEWADI
// ════════════════════════════════════════════════════════════

export const hinjewadiLocation: LocationConfig = {
  name: 'Hinjewadi',
  slug: 'dog-grooming-in-pune/hinjewadi',

  heroH1: `Dog Grooming at Home in Hinjewadi — Around Your Shift, Not Ours`,
  heroSubtext:
    'Phase 1, 2 or 3, Maan or Marunji — a trained groomer reaches your flat with everything needed. Evening and weekend slots that work around IT hours, so nobody drives a dog through Hinjewadi traffic.',

  storySections: [
    {
      heading: 'Why Hinjewadi Dog Parents Book At-Home Grooming',
      subheading: 'The commute is the whole problem.',
      paragraphs: [
        'Hinjewadi is the one part of Pune where the drive genuinely decides the decision. A salon that is six kilometres away on a map is forty minutes each way at 6 PM on the Phase 1 stretch, and that is before parking. Add a dog that already dislikes the car and a Saturday disappears. At-home dog grooming in Hinjewadi removes the journey entirely — the groomer arrives at your society gate, works in your bathroom or balcony, and is gone inside ninety minutes.',
        'The second reason is scheduling. This is a shift-work neighbourhood. A large share of our Hinjewadi bookings land between 7 PM and 9 PM on weekdays or early on Saturday, because that is when someone is actually home. A fixed salon closes when you finish work; a groomer who comes to you does not.',
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Dog grooming at home in Hinjewadi Pune',
      imageLeft: true,
    },
    {
      heading: 'Built for High-Rise Societies and Compact Flats',
      subheading: 'A bathroom, a plug point, and no van in the visitor bay.',
      paragraphs: [
        'Most Hinjewadi homes are towers — Megapolis, Life Republic, Blue Ridge, the Marunji and Maan clusters — with tight visitor parking and a gate register. That suits us. Our groomers arrive by two-wheeler with the whole kit in a bag: clippers, blades, dryer, shampoos, towels, mats and disposables. There is no van to park and no generator to run, so the society sees a visitor with a backpack rather than a vehicle needing clearance.',
        'Inside the flat we work on our own mats, keep the water to the bath and rinse stages, collect hair as we go, and leave the area clean. A 2BHK is more than enough room. If your tower requires a gate pass or an app approval for visitors, send it across at booking and the groomer arrives already cleared rather than waiting downstairs on a call.',
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Doorstep dog grooming inside a Hinjewadi high-rise apartment',
      imageLeft: false,
    },
    {
      heading: 'Dogs Left Alone All Day Need a Different Session',
      subheading: 'Long hours at home change the coat and the temperament.',
      paragraphs: [
        'A lot of Hinjewadi dogs spend nine or ten hours alone in an air-conditioned flat while their people are at work. That shows up in two ways a groomer notices immediately. Coats get less brushing than the breed needs, so matting builds quietly at the collar and armpits. And the dog is often under-socialised with strangers, which means the first ten minutes of the session matter more than the next eighty.',
        'We plan for both. The groomer greets the dog and lets it investigate the kit before anything is switched on, and where a dog is clearly overwhelmed we slow down rather than restrain harder. On the coat side we will tell you honestly if the gap between sessions is too long for the breed, and what a realistic brushing routine looks like on a weekday evening — five minutes, not thirty.',
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Gentle handling for an under-socialised dog in Hinjewadi',
      imageLeft: true,
    },
    {
      heading: 'Fixed Prices, No Phase-Based Surcharge',
      subheading: 'Phase 3 costs the same as Phase 1.',
      paragraphs: [
        `Hinjewadi is spread out — Phase 3 and Marunji are a long ride from the older Phase 1 pockets — and it would be easy to price by distance. We do not. A Spa Bath is ₹799, a Hair Cut is ₹999, and both together are ₹1299 anywhere in Hinjewadi, including Maan, Marunji, Tathawade and Punawale. There is no doorstep charge and no size surcharge for a big dog.`,
        `Add-ons are optional and separately priced — Tick & Flea Care at ₹149, and Medicated Bath, Destressing Massage, Hygiene Hair Cut and Deworming at ₹299 each. A groomer may suggest one after seeing the coat, and that is where it stops. No one on our team earns more by talking you into an upgrade.`,
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Transparent dog grooming pricing across Hinjewadi phases',
      imageLeft: false,
    },
    {
      heading: `Which Dog Breeds Do We Groom in Hinjewadi?`,
      subheading: `A young neighbourhood with a very particular breed mix.`,
      paragraphs: [
        `Hinjewadi skews towards first-time dog parents in their late twenties and thirties, and the breed mix reflects that — a lot of Shih Tzus, Beagles, Pugs, Labradors and small Poodle mixes, plus a growing number of adopted Indies. Because we visit homes rather than run a salon, we see the same pattern repeatedly: apartment dogs whose coats need more maintenance than their owners were told at the time of buying.`,
        `These are the breeds we are called out to most in Hinjewadi, and what each session actually involves:`,
      ],
      bullets: [
        `Shih Tzu and Lhasa Apso grooming in Hinjewadi — continuously growing coats that mat rather than shed. Line brushing to the skin at the armpits, behind the ears and under the collar, plus a face and paw trim. Past six weeks this becomes a de-matting job rather than a haircut.`,
        `Beagle grooming in Hinjewadi — short dense coat, so the work is deshedding and ears. Beagle drop ears trap moisture and are the single most common site of trouble we find here; every session includes a proper check and clean.`,
        `Labrador and Golden Retriever grooming in Hinjewadi — heavy shedders in a flat with no garden. Undercoat rake plus a high-velocity blow-out lifts the dead coat before it reaches your sofa. Goldens also need feathering trimmed at ears, tail and hocks.`,
        `Pug and French Bulldog grooming in Hinjewadi — the work is in the facial folds and the nails. Folds cleaned and dried individually, and nails kept short because these breeds wear them down poorly on tile.`,
        `Indie and rescue dog grooming in Hinjewadi — practical coats that need less bathing than most owners assume, but a genuinely thorough tick and skin check every visit, especially for dogs walked along the Maan and Marunji green stretches.`,
        `Poodle-mix and Maltese grooming in Hinjewadi — teddy bear and puppy cuts, sanitary and paw-pad trims. Send a reference photo and the groomer works to it rather than guessing.`,
      ],
      closingLine: `Don't see your breed? We groom all breeds — these are simply the ones Hinjewadi customers book most often.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Breed-specific dog grooming at home in Hinjewadi Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/hinjewadi'),
  nearbyAreas: ['Phase 1', 'Phase 2', 'Phase 3', 'Maan', 'Marunji', 'Wakad', 'Tathawade', 'Punawale', 'Balewadi'],
};

export const hinjewadiMapEmbed =
  'https://www.google.com/maps?q=Hinjewadi,Pune&output=embed';

export const hinjewadiReviews: LocationReview[] = [
  {
    petName: 'Simba',
    ownerName: 'Rohit Kulkarni',
    area: 'Phase 2, Megapolis',
    review: `Booking a 7:30 PM weekday slot was the thing that sold me — I genuinely could not have done a salon run after work. The groomer messaged before leaving, cleared the gate himself, and was done well within the window. Simba is a Beagle and his ears always get missed elsewhere; this time they were actually cleaned properly and he stopped scratching within a couple of days.`,
    rating: 5,
  },
  {
    petName: 'Coco',
    ownerName: 'Sneha Patil',
    area: 'Marunji',
    review: 'We are on the far side of Marunji and I fully expected a distance charge or a refusal. Neither. Same price as my friend pays in Phase 1. Coco is a nervous Shih Tzu and the groomer spent the first ten minutes just sitting with her instead of starting. That patience is what I am paying for, honestly.',
    rating: 5,
  },
];

export const hinjewadiFAQs: FAQ[] = [
  {
    question: 'Do you cover all three Hinjewadi phases, plus Maan and Marunji?',
    answer: 'Yes — Phase 1, 2 and 3, along with Maan, Marunji, Tathawade and Punawale, at the same published prices. Hinjewadi is spread out enough that distance pricing would be tempting, but we do not do it: a Spa Bath is ₹799 whether you are off the Phase 1 main road or deep inside Marunji.'
  },
  {
    question: 'Can the groomer come after office hours or on a weekend?',
    answer: 'That is when most Hinjewadi sessions happen. We run 9 AM to 9 PM seven days a week, and evening weekday slots from about 7 PM plus Saturday and Sunday mornings are the ones that book out first here. If you need a specific evening, book a few days ahead rather than same-day.'
  },
  {
    question: 'My society needs a visitor gate pass or app approval. How does that work?',
    answer: 'Send us the pass, the app request or the gate instructions when you book and the groomer arrives already cleared. Otherwise he will call from the gate and you will approve it then — which works, but costs you five minutes and a phone call in the middle of whatever you were doing.'
  },
  {
    question: 'Is there enough space in a 2BHK flat for a full grooming session?',
    answer: 'Comfortably. What we need is a bathroom or balcony with a running tap, one plug point, and enough floor for the dog to stand and turn. The groomer lays out his own mats, so no furniture needs moving. There is no van and nothing that needs parking.'
  },
  {
    question: 'How long does a session take, and does traffic affect the timing?',
    answer: 'Sixty to ninety minutes for a single dog, longer for a badly matted coat or two pets in one booking. Our groomers ride two-wheelers, so the Hinjewadi–Wakad chowk traffic affects them far less than it would a van — but if a slot is going to slip we tell you before the window rather than after it.'
  },
  {
    question: 'My dog is alone all day and is not used to strangers. Will that be a problem?',
    answer: 'It is common here and worth mentioning at booking. The groomer will greet the dog and let it inspect the kit before switching anything on, and will slow the session down rather than restrain harder. Some dogs are calmer without their owner in the room and the groomer will say so if that is what he is seeing.'
  },
  {
    question: 'How often should I be booking, given my dog is indoors most of the day?',
    answer: 'Indoors does not mean cleaner — it usually means less brushing. Long non-shedding coats like Shih Tzus need every 4 to 6 weeks, double coats every 6 to 8 with proper deshedding, and short coats like Beagles and Pugs every 8 to 12. Tell us the breed at booking and we will suggest a gap, including telling you when you are booking too often.'
  },
  {
    question: 'Do you groom cats in Hinjewadi as well?',
    answer: 'Yes, at the same three package prices, with cat-formulated products and low-restraint handling in one quiet room. Cat sessions run differently from dog sessions and we book them accordingly — see our cat grooming page for what a visit actually looks like.'
  },
  {
    question: 'What if my water supply is on a fixed society timing?',
    answer: 'The actual water use is short — roughly fifteen to twenty minutes of a ninety-minute visit, during the bath and rinse. If your supply is timed, either book inside that window or keep a couple of buckets filled and the session runs exactly the same.'
  },
  {
    question: 'How do I pay, and is it before or after the session?',
    answer: 'After, once you have seen the result. Cash or UPI both work, and the price is the one quoted at booking — add-ons only appear on the bill if you agreed to them during the session.'
  }
];

// ════════════════════════════════════════════════════════════
// PIMPLE SAUDAGAR
// ════════════════════════════════════════════════════════════

export const pimpleSaudagarLocation: LocationConfig = {
  name: 'Pimple Saudagar',
  slug: 'dog-grooming-in-pune/pimple-saudagar',

  heroH1: `Dog Grooming at Home in Pimple Saudagar — No Salon Queue`,
  heroSubtext:
    'Kunal Icon Road, Rahatani, Jagtap Dairy or the Sai Chowk side — a trained groomer comes to your flat with the full kit. Fixed prices from ₹799, seven days a week.',

  storySections: [
    {
      heading: 'Why Pimple Saudagar Prefers Grooming at Home',
      subheading: 'Dense, walkable, and full of dogs — which is exactly the problem at a salon.',
      paragraphs: [
        'Pimple Saudagar has one of the highest dog densities in Pimpri-Chinchwad, and the local salons feel it. Weekend waits are real, and a waiting room with four other dogs is the least useful environment for a nervous animal. At-home dog grooming in Pimple Saudagar sidesteps that entirely — one dog, one groomer, in the room your dog already sleeps in.',
        'The area is also genuinely congested. Kunal Icon Road and the Jagtap Dairy stretch at a weekend evening are not somewhere you want to be with a stressed dog in the back seat. Removing the drive removes most of the stress before the grooming even starts.',
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Dog grooming at home in Pimple Saudagar Pune',
      imageLeft: true,
    },
    {
      heading: 'Apartment Grooming Without the Mess',
      subheading: 'Hair collected, water controlled, area cleaned before we leave.',
      paragraphs: [
        'The single most common worry we hear in Pimple Saudagar is mess — that a full groom in a flat means hair through the living room for a week. It does not. The groomer works on his own mats in a contained area, hair is gathered as it comes off rather than at the end, and the space is swept and wiped before he leaves. Most people are surprised there is nothing left to do.',
        'Water use is limited to the bath and rinse, roughly fifteen to twenty minutes of the visit. A bathroom or a balcony with a tap is enough. There is no van, no generator and no equipment that needs a society NOC — the whole kit arrives in a bag on a two-wheeler.',
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Clean doorstep dog grooming setup in a Pimple Saudagar flat',
      imageLeft: false,
    },
    {
      heading: 'Monsoon and Dust: the Two Things This Area Does to a Coat',
      subheading: 'Construction dust in summer, ticks from June onwards.',
      paragraphs: [
        'Pimple Saudagar is still building, and the dust that comes with it settles into coats faster than most owners expect — particularly in short dense coats where it sits against the skin rather than on top. Through summer that means deep cleansing baths and more frequent brushing than the breed strictly requires.',
        'From June the problem inverts. Warm, wet months are when the Indian brown dog tick breeds fastest, and a dog walked on the green patches around Rahatani and Sai Chowk comes back with passengers. Every monsoon session here includes a tick and flea check, a full ear check, and a complete blow-dry down to the skin — the drying is the medically useful part, not a finishing flourish.',
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Monsoon tick and flea dog grooming in Pimple Saudagar',
      imageLeft: true,
    },
    {
      heading: 'Fixed Published Prices',
      subheading: 'The same three numbers everyone else in Pune pays.',
      paragraphs: [
        `A Spa Bath is ₹799, a Hair Cut is ₹999, and both together are ₹1299 — in Pimple Saudagar exactly as anywhere else we work. No doorstep charge, no size surcharge, no weekend premium. Add-ons are optional and separately priced: Tick & Flea Care ₹149, and Medicated Bath, Destressing Massage, Hygiene Hair Cut and Deworming at ₹299 each.`,
        `Where a session genuinely takes longer is matting. A coat that has not been brushed in three months has to be worked out strand by strand, or clipped down if the mats are already tight against the skin. We tell you which one it is before starting, not after.`,
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Fixed-price dog grooming packages in Pimple Saudagar',
      imageLeft: false,
    },
    {
      heading: `Which Dog Breeds Do We Groom in Pimple Saudagar?`,
      subheading: `Small-breed heavy, with a strong Indie contingent.`,
      paragraphs: [
        `The flats here run smaller than in Baner or Kalyani Nagar, and the breed mix follows — Shih Tzus, Pugs, Beagles, Spitz and Poodle mixes dominate, alongside a large number of adopted Indies. Coat type decides the session far more than size does: a 6 kg Shih Tzu left two months is a longer, harder groom than a 30 kg Labrador.`,
        `These are the breeds we are booked for most across Pimple Saudagar and Rahatani:`,
      ],
      bullets: [
        `Shih Tzu and Maltese grooming in Pimple Saudagar — coats that grow rather than shed, so matting forms quietly at friction points. Line brushing to the skin, face and sanitary trims, and a teddy bear or puppy cut where the coat has gone too far to save.`,
        `Spitz and Pomeranian grooming in Pimple Saudagar — heavy double-coat shedding in a small flat. Deshedding and a proper blow-out, never a summer shave: the undercoat is insulation both ways and grows back patchy once removed.`,
        `Pug grooming in Pimple Saudagar — facial folds cleaned and dried individually, ears checked for the yeast this humidity encourages, and nails kept short because Pugs wear them down badly on tile floors.`,
        `Beagle grooming in Pimple Saudagar — short coat, so deshedding plus a thorough drop-ear check every visit. Ears are where Beagle trouble almost always starts.`,
        `Labrador grooming in Pimple Saudagar — undercoat rake and high-velocity blow-out to lift dead coat before it lands on the furniture. Simpler than it looks, but only if it is done properly.`,
        `Indie and rescue dog grooming in Pimple Saudagar — less bathing than most owners assume, but a far more thorough tick and skin inspection every single session. Over-bathing an Indie does more harm than leaving the coat alone.`,
      ],
      closingLine: `Name the breed when you book and the groomer arrives with the session already planned rather than working it out on your floor.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Breed-specific dog grooming at home in Pimple Saudagar Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/pimple-saudagar'),
  nearbyAreas: ['Rahatani', 'Pimple Gurav', 'Wakad', 'Kalewadi', 'Sangvi', 'Aundh', 'Thergaon', 'Pimple Nilakh'],
};

export const pimpleSaudagarMapEmbed =
  'https://www.google.com/maps?q=Pimple+Saudagar,Pune&output=embed';

export const pimpleSaudagarReviews: LocationReview[] = [
  {
    petName: 'Bruno',
    ownerName: 'Amruta Shinde',
    area: 'Kunal Icon Road',
    review: `I had put off grooming for weeks because the salon nearby had a two-hour wait every weekend. This was booked on a Tuesday evening and done by 8:30. Bruno is a Labrador and the amount of undercoat that came out was genuinely shocking — but none of it ended up on my floor, which is what I was worried about.`,
    rating: 5,
  },
  {
    petName: 'Pixie',
    ownerName: 'Nikhil Rane',
    area: 'Rahatani',
    review: 'Pixie is a Spitz and every place I have been to previously suggested shaving her for summer. This groomer flatly refused and explained why, then did a deshedding session instead. She looks better than she has in a year and I finally understand what I was about to do wrong.',
    rating: 5,
  },
];

export const pimpleSaudagarFAQs: FAQ[] = [
  {
    question: 'Do you cover Rahatani, Pimple Gurav and Jagtap Dairy as well as Pimple Saudagar proper?',
    answer: 'Yes, all of them, plus Pimple Nilakh, Thergaon and the Sangvi side — at the same published prices. The area names blur into each other here, so if your society is known locally by the builder name rather than the locality, send a pin and we will confirm the slot.'
  },
  {
    question: 'Will a full grooming session leave hair all over my flat?',
    answer: 'No. The groomer works on his own mats in a contained area, collects hair as it comes off rather than at the end, and sweeps and wipes the space before leaving. This is the most common worry we hear in this area and it is the one people are most surprised about afterwards.'
  },
  {
    question: 'The parking here is impossible. Where does the groomer park?',
    answer: 'He does not need to. Our groomers arrive by two-wheeler with the entire kit — clippers, dryer, shampoos, towels, mats, disposables — in a bag. There is no van, no generator, and nothing that needs a visitor parking bay or a society NOC.'
  },
  {
    question: 'Can you do an evening or weekend slot?',
    answer: 'Yes — we run 9 AM to 9 PM seven days a week. Weekday evenings and weekend mornings are the busiest windows in Pimple Saudagar, so book a few days ahead for those rather than same-day.'
  },
  {
    question: 'My Spitz sheds constantly. Should I just get her shaved for summer?',
    answer: 'No, and we will decline if you ask. A double coat insulates against heat as much as cold, and a shaved one regrows patchy and coarse — often permanently. The correct answer is deshedding: an undercoat rake plus a high-velocity blow-out that removes the dead coat while leaving the guard hairs doing their job.'
  },
  {
    question: 'How often should my dog be groomed here?',
    answer: 'It depends on the coat, not the calendar. Long non-shedding coats like Shih Tzus need every 4 to 6 weeks, double coats every 6 to 8 with deshedding, short dense coats like Beagles and Pugs every 8 to 12, and Indies usually every 8 to 10. Construction dust in this area pushes many families slightly more frequent than the minimum.'
  },
  {
    question: 'Do you do tick and flea treatment during monsoon?',
    answer: 'Yes — it is a ₹149 add-on and we recommend it from June through September. Warm wet months are when the Indian brown dog tick breeds fastest, and dogs walked on the green patches around Rahatani and Sai Chowk pick them up readily. Every monsoon session also includes a full ear check and a complete blow-dry to the skin.'
  },
  {
    question: 'Can you groom two dogs in the same visit?',
    answer: 'Yes. Each dog is priced as its own session, and the visit simply runs longer — usually a little under double a single-dog booking rather than exactly double. Tell us both breeds at booking so the groomer plans the order, because it is rarely best to do the anxious one first.'
  },
  {
    question: 'Is at-home grooming safe for a senior dog?',
    answer: 'It is usually better than a salon for one. An arthritic dog cannot stand for ninety minutes, so the session is broken into stages with breaks and non-slip matting underfoot. Overgrown nails matter far more than a perfect coat at that age. Flag arthritis, heart or kidney trouble or any daily medication at booking.'
  },
  {
    question: 'How do I pay?',
    answer: 'After the session, by cash or UPI. The price is the one quoted at booking — add-ons appear on the bill only if you agreed to them during the visit.'
  }
];

// ════════════════════════════════════════════════════════════
// MAGARPATTA
// ════════════════════════════════════════════════════════════

export const magarpattaLocation: LocationConfig = {
  name: 'Magarpatta',
  slug: 'dog-grooming-in-pune/magarpatta',

  heroH1: `Dog Grooming at Home in Magarpatta — Inside the Township, at Your Door`,
  heroSubtext:
    'Magarpatta City, Amanora and the Hadapsar side. A trained groomer clears the gate, reaches your tower and finishes in one visit. Fixed prices from ₹799, 9 AM to 9 PM daily.',

  storySections: [
    {
      heading: 'Why Magarpatta Residents Book Grooming at Home',
      subheading: 'A township is a lovely place to live and an awkward place to leave.',
      paragraphs: [
        'Magarpatta is designed so you rarely need to go out, which is exactly why driving a dog out for grooming feels absurd. The gates, the one-ways and the Hadapsar main road at any weekend hour turn a short trip into an hour. At-home dog grooming in Magarpatta keeps the whole thing inside your flat — the groomer comes through the gate, works in your bathroom or balcony, and is gone within ninety minutes.',
        'The township is also unusually dog-dense, with a genuine walking culture around the central garden and the internal loops. That is good for the dogs and hard on their coats: more outdoor time means more dust, more grass seed and, from June, considerably more ticks than an indoor-only dog picks up.',
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Dog grooming at home in Magarpatta City Pune',
      imageLeft: true,
    },
    {
      heading: 'Gate Clearance, Towers and Society Rules',
      subheading: 'The logistics people expect to be difficult, and are not.',
      paragraphs: [
        'Magarpatta and Amanora both run proper visitor control, and the question we are asked most is whether that makes a home grooming visit complicated. It does not. Our groomers arrive on a two-wheeler with the whole kit in a bag — no van to clear, no generator, no equipment that needs a society NOC. From the gate register\'s point of view it is a visitor with a backpack.',
        'If your tower needs an app approval or a pre-registered pass, send it at booking and the groomer arrives already cleared instead of calling you from the gate. Inside, we work on our own mats, keep water to the bath and rinse stages, gather hair as we go and leave the area clean.',
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Doorstep dog grooming inside a Magarpatta township tower',
      imageLeft: false,
    },
    {
      heading: 'The Walking Culture Changes What a Session Needs',
      subheading: 'More outdoor time, more tick checks, more paw attention.',
      paragraphs: [
        'Dogs here walk more than the Pune average, and it shows. Paw pads take a beating on hot internal roads through summer, grass seed works its way between toes off the central lawns, and from June onwards the tick load on a dog doing two garden walks a day is materially higher than on a flat-bound dog in a tower elsewhere.',
        'So a Magarpatta session leans slightly differently: a genuine paw and pad inspection, hair trimmed short between the pads so less mud and seed carries indoors, a full tick and ear check, and a complete blow-dry down to the skin. In this humidity a coat left damp at the skin is where fungal patches begin, which is why the drying stage is never rushed.',
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Paw and tick care for a well-walked dog in Magarpatta',
      imageLeft: true,
    },
    {
      heading: 'Fixed Prices Inside and Outside the Township',
      subheading: 'Amanora, Hadapsar and Magarpatta City all pay the same.',
      paragraphs: [
        `A Spa Bath is ₹799, a Hair Cut is ₹999, and both together are ₹1299 — the same in Magarpatta City, Amanora Park Town, Sopan Baug and the wider Hadapsar side. No doorstep charge, no size surcharge and no township premium.`,
        `Add-ons are optional and separately priced: Tick & Flea Care at ₹149, and Medicated Bath, Destressing Massage, Hygiene Hair Cut and Deworming at ₹299 each. A groomer may suggest one after seeing the coat — suggesting is where it ends, because nobody on our team is paid more for an upgrade.`,
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Fixed-price dog grooming across Magarpatta and Amanora',
      imageLeft: false,
    },
    {
      heading: `Which Dog Breeds Do We Groom in Magarpatta?`,
      subheading: `Larger flats, larger dogs, and coats that need real maintenance.`,
      paragraphs: [
        `Magarpatta homes run bigger than most of Pune, and the breed mix reflects it — Labradors, Golden Retrievers and German Shepherds are far more common here than in the compact-flat neighbourhoods, alongside the usual Shih Tzus, Beagles and a healthy number of adopted Indies. Coat type still decides the session, but here it more often means deshedding than haircutting.`,
        `These are the breeds we are called out to most across the township:`,
      ],
      bullets: [
        `Labrador and Golden Retriever grooming in Magarpatta — the shedding breeds of this township. Undercoat rake plus a high-velocity blow-out that lifts dead coat before it reaches the floor. Goldens additionally need feathering trimmed at the ears, tail and hocks, and their drop ears checked every visit.`,
        `German Shepherd and Husky grooming in Magarpatta — double coats, and the request we most often refuse. We will not shave a double coat for summer; the undercoat insulates against heat as much as cold and regrows patchy. Deshedding and a thorough cooling blow-dry is the correct answer.`,
        `Shih Tzu, Lhasa Apso and Poodle-mix grooming in Magarpatta — continuously growing coats. Line brushing to the skin at the armpits, behind the ears and under the collar, plus teddy bear or puppy cuts and sanitary trims.`,
        `Beagle and Pug grooming in Magarpatta — short coats where the work is in the details: drop ears checked and cleaned, facial folds dried individually, nails kept short for tile floors.`,
        `Indie and rescue dog grooming in Magarpatta — the walking culture here means a genuinely thorough tick and skin inspection every session matters more than frequent bathing. Over-bathing an Indie does more harm than leaving the coat alone.`,
        `Golden and Labrador puppies in Magarpatta — short, deliberately unambitious introduction sessions from around twelve to sixteen weeks rather than full grooms. What a puppy learns about being handled decides how easy the next decade is.`,
      ],
      closingLine: `Tell us the breed at booking and the groomer arrives with the session planned rather than working it out in your living room.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Breed-specific dog grooming at home in Magarpatta Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/magarpatta'),
  nearbyAreas: ['Magarpatta City', 'Amanora', 'Hadapsar', 'Sopan Baug', 'Mundhwa', 'Fatima Nagar', 'Kharadi', 'Keshav Nagar'],
};

export const magarpattaMapEmbed =
  'https://www.google.com/maps?q=Magarpatta+City,Pune&output=embed';

export const magarpattaReviews: LocationReview[] = [
  {
    petName: 'Zara',
    ownerName: 'Prashant Rao',
    area: 'Magarpatta City',
    review: `Zara is a Golden and the shedding through summer was getting out of hand. I had asked two places about shaving her and both said yes; this groomer said no and explained exactly why, then spent forty minutes on deshedding instead. The difference around the house is obvious and her coat looks healthier, not thinner.`,
    rating: 5,
  },
  {
    petName: 'Muffin',
    ownerName: 'Devika Nair',
    area: 'Amanora',
    review: 'I had assumed the gate clearance would be a hassle. Sent the visitor pass at booking and the groomer was at my door on time with no phone calls from downstairs. Muffin is fourteen and they broke the session into stages with breaks, which nobody has ever done for her before.',
    rating: 5,
  },
];

export const magarpattaFAQs: FAQ[] = [
  {
    question: 'Do you cover Amanora and the wider Hadapsar side as well as Magarpatta City?',
    answer: 'Yes — Magarpatta City, Amanora Park Town, Sopan Baug, Keshav Nagar, Mundhwa and the Hadapsar main road side, all at the same published prices. There is no township premium and no doorstep charge.'
  },
  {
    question: 'My tower needs a visitor pass or app approval. Does that slow things down?',
    answer: 'Not if you send it at booking — the groomer arrives already cleared. Otherwise he calls from the gate and you approve it then, which works but costs you five minutes. Either way there is no van to clear: the whole kit arrives in a bag on a two-wheeler.'
  },
  {
    question: 'My dog walks twice a day in the township gardens. Does that change the session?',
    answer: 'It does, and it is worth mentioning. Well-walked dogs here pick up noticeably more grass seed between the toes and a higher tick load from June onwards. We trim the hair between the pads shorter so less mud and seed carries indoors, and do a full tick and ear check every visit.'
  },
  {
    question: 'Should I get my Golden Retriever shaved for the summer?',
    answer: 'No, and we will decline if asked. A double coat is insulation against heat as much as cold, and a shaved one regrows patchy and coarse — often permanently. Deshedding with an undercoat rake and a high-velocity blow-out removes the dead coat while leaving the guard hairs doing their job, and the dog is genuinely cooler for it.'
  },
  {
    question: 'How long does a session take for a large breed?',
    answer: 'Sixty to ninety minutes is typical, and a heavy-coated Golden or Shepherd sits at the upper end of that because the deshedding and blow-dry stages are where the time goes. A badly matted coat or two dogs in one booking runs longer, and we will tell you before starting rather than after.'
  },
  {
    question: 'Can you groom a senior dog, or one with a health condition?',
    answer: 'Yes, and home is usually the better setting for one. An arthritic dog cannot stand for ninety minutes, so the session is broken into stages with breaks and non-slip matting underfoot. Overgrown nails matter more than a perfect coat at that age. Flag arthritis, heart or kidney trouble, recent surgery or daily medication when you book.'
  },
  {
    question: 'Is at-home grooming hygienic inside a flat?',
    answer: 'Yes. The groomer works on his own mats in a contained area, uses fresh disposables per pet, keeps water to the bath and rinse stages, collects hair as it comes off, and cleans the space before leaving. Equipment is sanitised between homes.'
  },
  {
    question: 'How often should my dog be groomed?',
    answer: 'The coat sets the schedule, not the calendar. Long non-shedding coats every 4 to 6 weeks, double coats every 6 to 8 with deshedding, short dense coats every 8 to 12, and Indies usually every 8 to 10. Tell us the breed at booking and we will suggest a gap — including telling you if you are booking too often.'
  },
  {
    question: 'Do you groom cats in Magarpatta too?',
    answer: 'Yes, at the same three package prices, using cat-formulated products and low-restraint handling in one quiet room with the door shut. Cat sessions run at the cat\'s pace rather than ours, and we book them with that in mind.'
  },
  {
    question: 'How do I pay, and when?',
    answer: 'After the session, by cash or UPI. You pay the price quoted at booking; add-ons appear only if you agreed to them during the visit.'
  }
];

// ════════════════════════════════════════════════════════════
// YERAWADA
// ════════════════════════════════════════════════════════════

export const yerawadaLocation: LocationConfig = {
  name: 'Yerawada',
  slug: 'dog-grooming-in-pune/yerawada',

  heroH1: `Dog Grooming at Home in Yerawada — Old Lanes and New Towers Alike`,
  heroSubtext:
    'From the Nagar Road side to Vishrantwadi, Shastri Nagar and the Kalyani Nagar edge. A trained groomer reaches your door with the full kit — fixed prices from ₹799.',

  storySections: [
    {
      heading: 'Why At-Home Grooming Suits Yerawada',
      subheading: 'Narrow lanes, heavy traffic, and a dog that hates both.',
      paragraphs: [
        'Yerawada is two neighbourhoods in one — dense older lanes off the Nagar Road side, and newer towers along the Kalyani Nagar and Vishrantwadi edges. Both share the same problem: getting anywhere by car at a useful hour is slow, and the roads around the airport approach are among the busiest in the city. At-home dog grooming in Yerawada removes the journey completely.',
        'For dogs in the older lanes there is a second benefit. Ground-floor homes and shared compounds mean more outdoor contact with street dogs, which means ticks, fleas and skin issues turn up more often here than in a sealed tower. A groomer who sees your dog at home spots those early, because inspecting the skin is part of every session rather than an upsell.',
      ],
      image: '/images/grooming-session-1.jpg',
      imageAlt: 'Dog grooming at home in Yerawada Pune',
      imageLeft: true,
    },
    {
      heading: 'Small Homes Are Not a Problem',
      subheading: 'A tap, a plug point and floor space for the dog to turn around.',
      paragraphs: [
        'A fair number of Yerawada homes are compact, and people assume that rules out a full grooming session. It does not. What we need is access to a bathroom or a balcony with a running tap, one working plug point, and enough floor for the dog to stand and turn. The groomer brings his own mats, and the working area is laid out on them.',
        'Everything arrives in a bag on a two-wheeler — clippers, blades, dryer, shampoos, towels, mats, disposables. There is no van to park in a narrow lane, no generator and nothing needing a society permission that a delivery would not also need. Hair is collected as it comes off and the space is cleaned before the groomer leaves.',
      ],
      image: '/images/grooming-session-2.jpg',
      imageAlt: 'Compact home dog grooming setup in Yerawada',
      imageLeft: false,
    },
    {
      heading: 'Tick, Flea and Skin Checks Matter More Here',
      subheading: 'Street contact and monsoon humidity are a bad combination.',
      paragraphs: [
        'Dogs in Yerawada — particularly in the older lanes and ground-floor homes — have far more incidental contact with street dogs than dogs living in sealed high-rises. That raises the tick and flea load year-round and sharply from June, when warm wet weather lets the Indian brown dog tick breed fastest.',
        'Every session here includes a genuine tick and flea inspection and a full ear check, and we will tell you plainly if what we are seeing looks like a vet problem rather than a grooming one. The second monsoon issue is drying: a dog washed and left to air-dry in a humid, closed home stays damp at the skin for hours, and damp skin under a thick coat is how fungal patches start. Every session ends with a complete blow-dry down to the skin for that reason.',
      ],
      image: '/images/grooming-session-3.jpg',
      imageAlt: 'Tick, flea and skin check during dog grooming in Yerawada',
      imageLeft: true,
    },
    {
      heading: 'Fixed Prices, Old Lanes to New Towers',
      subheading: 'Same three numbers, whichever side of Yerawada you are on.',
      paragraphs: [
        `A Spa Bath is ₹799, a Hair Cut is ₹999, and both together are ₹1299. That is what you pay in a compact home off the Nagar Road side and in a tower on the Kalyani Nagar edge alike — no doorstep charge, no size surcharge.`,
        `Add-ons are optional and priced separately: Tick & Flea Care at ₹149, and Medicated Bath, Destressing Massage, Hygiene Hair Cut and Deworming at ₹299 each. Given the tick pressure in this area we will often suggest the ₹149 treatment through monsoon — but it stays a suggestion, and the groomer earns nothing extra either way.`,
      ],
      image: '/images/grooming-session-4.jpg',
      imageAlt: 'Fixed-price dog grooming packages in Yerawada',
      imageLeft: false,
    },
    {
      heading: `Which Dog Breeds Do We Groom in Yerawada?`,
      subheading: `The most Indie-heavy area we work in, and proud of it.`,
      paragraphs: [
        `Yerawada has a higher proportion of Indies and rescues than almost anywhere else we groom, alongside Labradors, Pomeranians, Pugs and a growing number of Shih Tzus in the newer towers. Indies are frequently under-served by salons that price by size and assume every dog needs the same bath — they mostly do not.`,
        `These are the breeds we are booked for most across Yerawada, Vishrantwadi and Shastri Nagar:`,
      ],
      bullets: [
        `Indie and rescue dog grooming in Yerawada — practical, self-maintaining coats that need less bathing than most owners assume, and a far more thorough tick and skin inspection every single session. Over-bathing an Indie strips oils it needs and does more harm than leaving the coat alone.`,
        `Labrador grooming in Yerawada — short dense coat, so the work is deshedding rather than cutting: an undercoat rake and a high-velocity blow-out, plus a drop-ear check every visit.`,
        `Pomeranian and Spitz grooming in Yerawada — double coats in small homes. Deshedding and a proper blow-out, and never a summer shave: the undercoat is insulation both ways and regrows patchy once taken off.`,
        `Pug grooming in Yerawada — facial and tail folds cleaned and dried individually, ears checked for the yeast this humidity encourages, and nails kept short because Pugs wear them down poorly indoors.`,
        `Shih Tzu and Lhasa Apso grooming in Yerawada — continuously growing coats that mat at the armpits, behind the ears and under the collar. Line brushing to the skin, face and sanitary trims, and a clip-down where the mats have gone tight against the skin.`,
        `Senior dog grooming in Yerawada — sessions broken into stages with breaks and non-slip matting, and nails prioritised over a perfect coat, because overgrown nails change how an old joint loads.`,
      ],
      closingLine: `Don't see your breed? We groom all breeds — these are simply the ones Yerawada customers book most often.`,
      image: `/images/grooming-session-2.jpg`,
      imageAlt: `Breed-specific dog grooming at home in Yerawada Pune`,
      imageLeft: false,
    },
  ],

  otherCities: otherCities('dog-grooming-in-pune/yerawada'),
  nearbyAreas: ['Vishrantwadi', 'Shastri Nagar', 'Kalyani Nagar', 'Dhanori', 'Koregaon Park', 'Viman Nagar', 'Nagar Road', 'Gunjan Chowk'],
};

export const yerawadaMapEmbed =
  'https://www.google.com/maps?q=Yerawada,Pune&output=embed';

export const yerawadaReviews: LocationReview[] = [
  {
    petName: 'Kaali',
    ownerName: 'Sagar Pawar',
    area: 'Shastri Nagar',
    review: `Kaali is an Indie we adopted off the street two years ago and every salon I called quoted me as if she were a show dog needing the full works. This groomer actually said she does not need bathing as often as I was doing it, did a proper tick check and charged the standard rate. Being told to do less was not what I expected.`,
    rating: 5,
  },
  {
    petName: 'Goldie',
    ownerName: 'Farida Shaikh',
    area: 'Yerawada, near Gunjan Chowk',
    review: 'Our lane is narrow and I was sure a van would never make it. The groomer turned up on a bike with everything in one bag. My flat is small and he still managed the whole session in the bathroom without any mess. Goldie was calmer than she has ever been at a salon.',
    rating: 5,
  },
];

export const yerawadaFAQs: FAQ[] = [
  {
    question: 'Do you cover Vishrantwadi, Shastri Nagar and the Kalyani Nagar edge?',
    answer: 'Yes — Yerawada proper, Vishrantwadi, Shastri Nagar, the Gunjan Chowk side and the Kalyani Nagar edge, all at the same published prices. Yerawada runs from old lanes to new towers and we work across both.'
  },
  {
    question: 'My lane is too narrow for a vehicle. Is that a problem?',
    answer: 'No. Our groomers travel by two-wheeler and carry the entire kit in a bag — clippers, blades, dryer, shampoos, towels, mats and disposables. There is no van, no generator and nothing that needs to park outside your door.'
  },
  {
    question: 'My home is small. Is there enough space for a grooming session?',
    answer: 'Almost certainly. We need a bathroom or balcony with a running tap, one working plug point, and enough floor for the dog to stand and turn. The groomer lays his own mats down, so nothing of yours needs moving or covering.'
  },
  {
    question: 'My dog interacts with street dogs. Should I be worried about ticks?',
    answer: 'It is worth being alert to, and it is why every session here includes a genuine tick and flea inspection plus a full ear check. The ₹149 Tick & Flea Care add-on is the one we most often suggest in this area through monsoon. Where what we see looks like a vet problem rather than a grooming one, we will say so plainly rather than treat it.'
  },
  {
    question: 'I have an Indie. Does she need the same grooming as a pedigree dog?',
    answer: 'Usually less, not more. Indie coats are practical and self-maintaining, and over-bathing strips oils the skin needs. What matters far more is a thorough tick and skin check every session and nails kept short. Most Indies do well on an 8 to 10 week cycle, and we will tell you if you are booking too often.'
  },
  {
    question: 'Is the price different for the older part of Yerawada versus the newer towers?',
    answer: 'No. A Spa Bath is ₹799, a Hair Cut ₹999 and both together ₹1299 everywhere in the area. There is no doorstep charge, no size surcharge for a large dog and no premium for a harder-to-reach lane.'
  },
  {
    question: 'How long does a session take?',
    answer: 'Sixty to ninety minutes for one dog. A heavily matted coat, a double coat needing deshedding, or two pets in the same booking runs longer. We tell you which situation you are in before starting rather than presenting it afterwards.'
  },
  {
    question: 'My dog is anxious with strangers. How do you handle that?',
    answer: 'Slowly. The groomer greets the dog and lets it inspect the equipment before switching anything on, uses low restraint rather than force, and takes breaks. Some dogs settle better without their owner in the room and the groomer will say so if that is what he is seeing. We do not sedate, and we will stop rather than push a dog through a session it cannot cope with.'
  },
  {
    question: 'Do you groom cats in Yerawada?',
    answer: 'Yes, at the same three package prices. Cat sessions use cat-formulated products throughout — dog shampoo is genuinely unsafe on cats, and permethrin-based tick products can be fatal to them — with low restraint in one quiet room with the door shut.'
  },
  {
    question: 'How do I pay?',
    answer: 'After the session, by cash or UPI. The price is the one quoted at booking, and add-ons appear on the bill only if you agreed to them during the visit.'
  }
];
