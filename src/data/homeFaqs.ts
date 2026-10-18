/**
 * homeFaqs — the FAQ accordion on the home page.
 *
 * Lifted out of components/FAQs.tsx so `scripts/prerenderSpa.ts` can read it
 * from Node (importing the component would pull in React and framer-motion).
 * The component and the prerenderer both read this array, and the FAQPage
 * JSON-LD is still generated from it — so markup, schema and prerendered HTML
 * can never disagree.
 */

export interface HomeFaq {
  question: string;
  answer: string;
}

export const HOME_FAQS: HomeFaq[] = [
  {
    question: 'Why choose home pet grooming?',
    answer:
      "It's stress-free, convenient, and done in your pet's comfort zone. No more anxiety from car rides or unfamiliar environments!",
  },
  {
    question: 'Why Sniffy?',
    answer:
      'Trained professionals, hygienic setup, and unmatched pricing. We bring salon-quality grooming to your doorstep with care and expertise.',
  },
  {
    question: 'Is home grooming safe?',
    answer:
      "Yes! All tools are sanitized and groomers trained for all breeds. We follow strict hygiene protocols for your pet's safety.",
  },
  {
    question: 'What if my dog or cat is anxious?',
    answer:
      "Our groomers use calming techniques and gentle handling. We take breaks when needed and prioritize your pet's comfort throughout the session.",
  },
  {
    question: 'What if I need to reschedule?',
    answer:
      "You can reschedule or cancel up to 12 hours before service. Simply contact us and we'll find a convenient time for you.",
  },
  {
    question: 'Do I need to prepare anything before the grooming session?',
    answer:
      'Just ensure a small open space and access to water and electricity. Our groomers carry all required equipment, products, and disposables.',
  },
  {
    question: 'How can I book a home pet grooming session?',
    answer:
      'You can book directly through our website by entering your details and preferred service. Our team will confirm the appointment shortly after booking.',
  },
  // Keep this list aligned with ALL_PUNE_CITIES in src/data/locationData.ts.
  // It previously advertised four localities that had no landing page at all
  // (Hinjewadi, Magarpatta, Yerawada, Pimple Saudagar) while omitting thirteen
  // that did — so the copy promised coverage the site could not show and buried
  // the pages that existed. Those four now have pages; if the array changes
  // again, change this answer too.
  {
    question: 'Which areas in Pune do you provide dog grooming and cat grooming services?',
    answer:
      'We cover 33 localities across Pune and Pimpri-Chinchwad, each with its own page you can book from: Ambegaon, Aundh, Baner, Bavdhan, Bibewadi, Camp, Dhanori, Dhayari, Hadapsar, Handewadi, Hinjewadi, Kalewadi, Kalyani Nagar, Karve Nagar, Katraj, Khadki, Kharadi, Kondhwa, Koregaon Park, Kothrud, Lohegaon, Magarpatta, Mundwa, NIBM, Pimple Saudagar, Pimpri-Chinchwad, Ravet, Shivajinagar, Viman Nagar, Wagholi, Wakad, Wanowrie and Yerawada. Dog grooming and cat grooming are both available in every one of them, at the same fixed prices — there is no doorstep charge and no distance surcharge.',
  },
  {
    question: 'Is there a pet grooming service near me in Pune?',
    answer:
      'Almost certainly — we work across 33 Pune and Pimpri-Chinchwad localities, and because the groomer travels to you there is no "nearest branch" to be far from. Whether you are searching for dog grooming near me in Baner, cat grooming near me in Kharadi or pet grooming near me anywhere between Ravet and Wanowrie, the same trained groomer, the same equipment and the same fixed prices reach your door. Pick your locality from the areas list above, or just send us a pin and we will confirm the slot.',
  },
  {
    question: 'How often should dogs be groomed in Pune’s climate?',
    answer:
      'Due to Pune’s warm and sometimes humid climate, dogs benefit from regular grooming every 4–6 weeks. Regular grooming helps control shedding, prevents skin infections, and keeps your pet comfortable, especially during summer months.',
  },
  {
    question: 'How do I pay, and do I pay before or after the session?',
    answer:
      'You pay after the groomer has finished, never upfront. UPI, cash and card are all accepted at the door. The package price is what you were quoted at booking — if an add-on was agreed during the session, the groomer tells you the revised total before starting it, not after.',
  },
  {
    question: 'Do you charge more for large breeds or double-coated dogs?',
    answer:
      'No. A Spa Bath is ₹799 for a Pug and ₹799 for a Saint Bernard. A big dog takes the groomer longer, but that is our cost to carry, not yours. The only thing that changes the bill is an add-on you agree to, or a heavily matted coat that needs a de-matting session — and we tell you that before we start.',
  },
  {
    question: 'Can you groom two or more pets in the same visit?',
    answer:
      'Yes, and it is the most common booking we take. Tell us how many pets and their breeds when you book so we can block enough time — two dogs is not two half-sessions, it is closer to a double slot. Dogs and cats can be done in the same visit, though we usually groom the cat first while the house is still quiet.',
  },
  {
    question: 'Can you groom a senior pet, or one with a health condition?',
    answer:
      'Usually yes, with adjustments — slower pacing, non-slip matting, more breaks, and no forced positioning of stiff joints. Tell us about arthritis, heart conditions, skin allergies, recent surgery or medication when you book, and we will send a groomer suited to it. If we think a session is not safe for your pet right now, we will say so and suggest waiting.',
  },
  {
    question: 'Is this mobile pet grooming, and do you need to park a van outside?',
    answer:
      'It is mobile pet grooming in the sense that matters — we come to you — but with no van and no parking problem. The groomer arrives by two-wheeler with clippers, blades, dryer, shampoos, towels, mats and disposables in one kit, and works inside your home using your tap and one plug point. That is why mobile dog grooming works on a narrow lane in Camp or a 12th-floor flat in Wakad, where a grooming van simply could not go.',
  },
  {
    question: 'What is the difference between basic grooming and full grooming?',
    answer:
      'Basic grooming is our Spa Bath at ₹799 — shampoo, conditioner, deshedding and a full blow-dry, with nothing cut. Full grooming is our Spa Bath + Hair Cut at ₹1299, which adds a full body trim at your chosen length. A dog haircut or cat haircut on its own is ₹999. Those three prices cover dog, cat, small breed and large breed alike.',
  },
  {
    question: 'Do you offer a dry bath or waterless grooming in Pune?',
    answer:
      'Not as a package, and we would rather explain than sell you one. A dry bath uses foam or powder brushed through the coat — it masks odour rather than removing the cause, and in Pune humidity a coat that has not been rinsed and dried to the skin is exactly how fungal patches start. Where a pet truly cannot be bathed — recent surgery, a frail senior, a cat late in pregnancy — we do a dry clean-up as part of a session rather than as a replacement for one.',
  },
  {
    question: 'How do I judge the best pet grooming service in Pune?',
    answer:
      'Ask four questions before you book anywhere. Is the full price published, or quoted after they see your pet? Is there a size surcharge for a big dog? Do they name the groomer coming to your home in advance? And will they tell you when your pet does not need something — a shorthair that needs no bath, a double coat that must not be shaved? Any grooming service in Pune that answers all four straight is worth booking. Our answers are ₹799/₹999/₹1299 published, no size surcharge, groomer named at booking, and yes.',
  },
  {
    question: 'Do you groom cats as well as dogs?',
    answer:
      'Yes. Cat grooming is a separate discipline, not a dog session with a different animal in it — cat-formulated products only, low-restraint handling, one quiet room, and the cat setting the pace. Persians and other longhairs are the bookings we see most, usually for de-matting or a lion cut.',
  },
];
