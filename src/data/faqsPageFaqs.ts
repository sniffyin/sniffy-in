/**
 * faqsPageFaqs — the categorised FAQ set rendered at /faqs.
 *
 * Lifted out of pages/FAQsPage.tsx so `scripts/prerenderSpa.ts` can read it from
 * Node (importing the page would pull in React and framer-motion). The page and
 * the prerenderer both read this array, and the /faqs FAQPage JSON-LD is built
 * from it — so markup, schema and prerendered HTML can never disagree.
 */

export interface FaqsPageFaq {
  question: string;
  answer: string;
}

export interface FaqsPageCategory {
  category: string;
  faqs: FaqsPageFaq[];
}

export const FAQ_CATEGORIES: FaqsPageCategory[] = [
  {
    category: 'The Basics',
    faqs: [
      {
        question: 'What exactly is at-home dog grooming?',
        answer: 'At-home dog grooming means a trained professional groomer comes to your house with all the equipment needed — shampoos, conditioners, clippers, dryers, nail tools — and grooms your dog right there in your home. You don\'t go anywhere. Your dog doesn\'t leave their familiar environment. The groomer handles everything and cleans up before leaving.',
      },
      {
        question: 'Is at-home grooming actually better than a salon?',
        answer: 'For most dogs, yes. Salons are busy, noisy environments where dogs often sit in cages waiting their turn, surrounded by unfamiliar animals and people. At home, your dog gets one-on-one attention from a single groomer in a space they know and feel safe in. There\'s no car ride stress, no cage time, and no waiting. Anxious dogs in particular benefit enormously from this.',
      },
      {
        question: 'Which areas in Pune do you cover?',
        answer: 'We cover all major areas across Pune including Wakad, Hinjewadi, Kothrud, Karve Nagar, Shivajinagar, Kondhwa, NIBM, Wagholi, Dhanori, Viman Nagar, Kharadi, Pimpri-Chinchwad, Akurdi, Nigdi, Pimple Saudagar, Baner, Aundh, Bavdhan and surrounding localities. If you\'re unsure whether we serve your area, just call us.',
      },
      {
        question: 'What services are included in a grooming session?',
        answer: 'Our Spa Bath package includes: bath with shampoo and conditioner, blow dry, combing and brushing, nail clipping, eye and ear cleaning, paw massage, mouth spray and a spritz of perfume. Our Haircut package adds full body trimming or a full body haircut. Our Spa Bath + Hair Cut combines everything. We also offer add-ons like tick and flea treatment, medicated bath, destressing massage, and deworming.',
      },
      {
        question: 'How long does a grooming session take?',
        answer: 'Most sessions take between 1.5 to 3 hours depending on the breed, coat condition and the service booked. A Spa Bath for a small short-haired dog may take around 90 minutes. A full Spa Bath + Haircut for a large double-coated breed can take up to 3 hours. We never rush — the time it takes is the time it takes to do it properly.',
      },
      {
        question: 'What does grooming cost?',
        answer: 'Our Spa Bath starts at ₹799, Haircut at ₹999, and Spa Bath + Hair Cut at ₹1299. These prices include everything in the package — there are no hidden charges. Add-ons like tick and flea care, medicated bath or deworming are priced separately. All prices include taxes and payment is made after the session.',
      },
      {
        question: 'Is Sniffy a mobile dog grooming service in Pune?',
        answer: 'Yes. Sniffy is a mobile pet grooming service in Pune — a trained groomer travels to your home with a complete grooming kit and finishes the whole service in a single visit. There is no salon, no van drop-off and no waiting; your dog is groomed at your doorstep, in your own home.',
      },
      {
        question: 'What is the difference between a Spa Bath and a Haircut?',
        answer: 'A Spa Bath is the hygiene service: shampoo and conditioner bath, blow dry, brushing, nail clipping, ear and eye cleaning and a paw massage. A Haircut is the styling service: a body trim or full haircut. Spa Bath + Hair Cut combines both at ₹1299 and is the most popular choice for breeds with growing coats like Shih Tzus, Poodles and Lhasa Apsos.',
      },
      {
        question: 'Do you offer pet grooming near me in Pune?',
        answer: 'Probably yes — we serve over 30 localities across Pune and Pimpri-Chinchwad, including Baner, Aundh, Kothrud, Viman Nagar, Koregaon Park, Kharadi, Hadapsar, Wakad and Ravet. Check the locality page for your area or call us to confirm your society is covered.',
      },
      {
        question: 'What do you bring with you to the session?',
        answer: 'Your groomer brings everything needed: pet-safe shampoos and conditioners, clippers, scissors, a dryer, brushes, nail tools and towels. You only need to provide access to a bathroom or a washable area, a power socket and some water.',
      },
      {
        question: 'How much does dog grooming cost at home in Pune?',
        answer: 'At-home dog grooming with Sniffy starts at ₹799 for a Spa Bath, ₹999 for a Haircut and ₹1299 for Spa Bath + Hair Cut. There is no extra visit or travel charge anywhere in our coverage area. Add-ons such as Tick & Flea treatment (₹149) and Medicated Bath, Destressing, Hygiene or Deworming (₹299 each) are optional.',
      },
      {
        question: 'Is Sniffy the best pet grooming service in Pune?',
        answer: 'We can\'t rate ourselves, but here is what we offer: one-on-one grooming at your doorstep, transparent package pricing, free rescheduling up to 12 hours before the visit, payment only after the session, and a free fix-up visit if something isn\'t right. Read our Google reviews and decide for yourself.',
      },
      {
        question: 'What is the difference between at-home grooming and a mobile grooming van?',
        answer: 'A mobile van is a vehicle you walk your dog to, usually parked outside, so your dog still deals with a strange space. With Sniffy the groomer comes into your home and sets up there, so your dog stays in a familiar environment with you nearby.',
      },
      {
        question: 'Do you offer pet spa services in Pune?',
        answer: 'Yes. Our Spa Bath includes a shampoo and conditioner bath, blow dry, brushing, nail clipping, ear and eye cleaning, paw massage, mouth spray and perfume. You can add a Destressing massage for a more relaxing session.',
      },
    ],
  },
  {
    category: 'Booking & Scheduling',
    faqs: [
      {
        question: 'How do I book a session?',
        answer: 'Fill in your name and number on our quick booking form on the website. Our team will call you back within minutes to confirm a slot. You don\'t need an app or account — just your contact details and a preferred time.',
      },
      {
        question: 'What time slots are available?',
        answer: 'We offer morning, afternoon and evening slots every day including Sundays, from 9 AM to 9 PM. When we call to confirm, we\'ll match a groomer to a time that works for you.',
      },
      {
        question: 'Can I reschedule or cancel?',
        answer: 'Yes. Cancellations and rescheduling are free if done at least 12 hours before the confirmed appointment time. For changes within 12 hours, please call us directly and we\'ll do our best to accommodate.',
      },
      {
        question: 'How far in advance should I book?',
        answer: 'We can often accommodate same-day or next-day bookings depending on availability. For specific time preferences or weekend slots, booking 2–3 days ahead is recommended. During peak periods like weekends and post-festive seasons we get busier, so earlier is better.',
      },
      {
        question: 'Can I request the same groomer every time?',
        answer: 'Yes, you can request a specific groomer and we\'ll do our best to accommodate that. Many of our regular customers build a rapport with a groomer their dog is comfortable with, and we try to honour those preferences.',
      },
      {
        question: 'Can I book grooming for more than one pet?',
        answer: 'Yes. Tell us how many pets you have when you book and we will plan the visit accordingly. Each pet is groomed one at a time and each is charged at the package price you choose.',
      },
      {
        question: 'Do you groom on weekends and Sundays?',
        answer: 'Yes, we operate every day including Sundays, from 9 AM to 9 PM. Weekend slots fill up faster, so booking 2–3 days ahead is recommended.',
      },
      {
        question: 'Do I need to create an account or install an app to book?',
        answer: 'No. Just share your name and phone number on the booking form and we call you back to confirm the slot. Existing customers can also log in to the customer portal with a WhatsApp OTP to view their sessions.',
      },
      {
        question: 'How do I book a dog groomer in Pune for tomorrow?',
        answer: 'Fill in the booking form on our website or call or WhatsApp us on 8971313003. Next-day and sometimes same-day slots are often available depending on your area and groomer availability. We confirm the time with you by phone.',
      },
      {
        question: 'What details do I need to share when booking?',
        answer: 'Your name, phone number, locality in Pune, your dog\'s breed and size, the package you want, and your preferred time. Mention any health, skin or behaviour issues too, so we send the right groomer.',
      },
      {
        question: 'Do you take bookings through WhatsApp?',
        answer: 'Yes. You can WhatsApp us on 8971313003 to book, ask about prices or check whether we cover your locality.',
      },
    ],
  },
  {
    category: 'Your Dog & the Session',
    faqs: [
      {
        question: 'My dog is very anxious — will this work?',
        answer: 'Anxious dogs are actually one of the main reasons people switch to at-home grooming. Being at home eliminates most of the triggers — no car ride, no cage, no strange animals nearby. Our groomers are trained in calm handling techniques and will take breaks when needed. If your dog has specific anxiety triggers, just let us know when you book so we can match you with the right groomer.',
      },
      {
        question: 'Can puppies be groomed?',
        answer: 'Yes, and we actively encourage early grooming. Starting grooming sessions young helps puppies get comfortable with the process — being touched, having their paws handled, tolerating a dryer. Early positive grooming experiences mean much easier sessions as adults. We use an especially gentle approach with puppies.',
      },
      {
        question: 'My dog has never been groomed before. Is that okay?',
        answer: 'Completely fine. First-time dogs are common. We go slowly, let your dog explore the equipment before we start, and build comfort through the session. It may take a little longer but we don\'t rush it.',
      },
      {
        question: 'What if my dog is aggressive or difficult to handle?',
        answer: 'Please let us know in advance if your dog has a history of aggression or biting. This helps us send the most experienced groomer and prepare accordingly. We do not use sedation or harsh restraints. If at any point the session is unsafe for the dog or groomer, we\'ll stop and discuss the best path forward with you.',
      },
      {
        question: 'What if my dog is afraid of dryers?',
        answer: 'Very common. Our groomers use controlled, lower-heat airflow and introduce the dryer gradually. We keep a distance initially, let the dog get used to the sound and sensation, and slowly move closer. Some dogs need more time than others and that\'s completely fine.',
      },
      {
        question: 'Do you groom senior dogs?',
        answer: 'Yes. Senior dogs often find salon trips genuinely stressful and physically exhausting. At-home grooming is especially well-suited for older dogs who can\'t stand for long periods or get anxious easily. We adjust our approach — more breaks, gentler handling, no rushing.',
      },
      {
        question: 'Do I need to bathe or brush my dog before the groomer arrives?',
        answer: 'No, please don\'t — the groomer will do the full bath and brushing. It helps if your dog has had a chance to relieve itself before the visit, and if you keep a favourite towel, treats or toy nearby to keep them relaxed.',
      },
      {
        question: 'Can I stay with my dog during grooming?',
        answer: 'Yes. Many dogs settle better when their owner is close by. You can stay in the room or in the next one, whichever your dog is calmer with. Just let your groomer know your preference.',
      },
      {
        question: 'Is grooming safe for dogs with skin allergies or skin conditions?',
        answer: 'Yes, as long as we know beforehand. Mention any allergies, hot spots or vet-prescribed treatments when you book and we will use suitable products, including a medicated bath add-on where appropriate. For serious skin problems please check with your vet first.',
      },
      {
        question: 'Can I get my dog groomed after vaccination?',
        answer: 'It is usually best to wait a few days after a vaccination, and to check with your vet if your dog seems unwell. Puppies should have completed their first vaccination course before a first bath. If you are unsure, ask your vet and tell us when you book.',
      },
      {
        question: 'Is it okay to groom a pregnant or nursing dog?',
        answer: 'Grooming a pregnant or nursing dog needs extra care, so please talk to your vet first and let us know when booking. We will keep the session gentle and short, and avoid anything that could stress her.',
      },
      {
        question: 'Can you groom a dog with a sensitive stomach or one that gets car sick?',
        answer: 'Yes, this is a common reason families choose at-home grooming. There is no car journey at all, which helps dogs that get nervous, drool or vomit in vehicles.',
      },
      {
        question: 'How do I prepare my home for a grooming session?',
        answer: 'Keep a bathroom, balcony or washable area ready with a power socket and water supply, and put away items you would not want splashed. Keep other pets in a separate room and have your dog\'s usual collar, leash and a few treats on hand.',
      },
    ],
  },
  {
    category: 'Hygiene & Safety',
    faqs: [
      {
        question: 'What products do you use?',
        answer: 'We use pet-safe, pH-balanced shampoos and conditioners suitable for dogs. For dogs with sensitive skin or specific conditions, we have medicated shampoo options. We don\'t use human hair products on dogs as they have a different skin pH. If your dog has skin allergies or reactions, tell us before the session and we\'ll select the most appropriate products.',
      },
      {
        question: 'How do you ensure hygiene between clients?',
        answer: 'All tools — clippers, scissors, nail trimmers, brushes — are cleaned and disinfected between every session. Towels are single-use or laundered between sessions. Our groomers maintain strict hygiene protocols and we never bring tools from one dog\'s session to another without thorough cleaning.',
      },
      {
        question: 'Is at-home grooming safe if I have other pets?',
        answer: 'Yes. We groom one pet at a time and your other pets can remain in another room during the session. This actually reduces stress for the dog being groomed since there are no other animals competing for attention or creating tension.',
      },
      {
        question: 'Do I need to be home during the session?',
        answer: 'Yes, we require at least one adult to be present throughout the session. This is for the safety of your dog and the groomer, and because you know your dog\'s behaviour best. You don\'t need to watch the entire session — you can go about your routine — but someone needs to be accessible.',
      },
      {
        question: 'Can you remove ticks and fleas at home?',
        answer: 'Yes. Our Tick & Flea treatment add-on (₹149) is done during the session using products suited to dogs. For a heavy infestation we recommend repeating the treatment and cleaning your pet\'s bedding and the home surfaces where your dog rests.',
      },
      {
        question: 'Are your groomers trained and professional?',
        answer: 'Our groomers are trained in calm handling, hygiene and breed-specific grooming before they are sent to a customer\'s home, and every visit is coordinated and tracked by our team. If you ever have a concern, call or WhatsApp us and we will look into it right away.',
      },
      {
        question: 'Is the shampoo you use safe for puppies and sensitive skin?',
        answer: 'We use pet-safe, pH-balanced products for dogs and have medicated options for sensitive skin. Tell us about any allergies or past reactions at booking and we\'ll choose accordingly.',
      },
      {
        question: 'What happens if my dog gets injured or nicked during grooming?',
        answer: 'Our groomers are trained to work carefully, but if a minor nick or irritation happens, they will tell you immediately and treat it appropriately. For anything serious, we recommend seeing your vet. Please call us right away if you have any concern after a session.',
      },
    ],
  },
  {
    category: 'Breed & Coat Care',
    faqs: [
      {
        question: 'How often should my dog be groomed?',
        answer: 'It depends on the breed and coat type. Short-haired dogs like Labradors and Beagles can be groomed every 6–8 weeks. Medium-coated dogs like Golden Retrievers benefit from grooming every 4–6 weeks. Long-haired or double-coated breeds like Huskies, Pomeranians and Shih Tzus should ideally be groomed every 3–4 weeks. Pune\'s warm, humid climate also increases the need for regular bathing to prevent skin issues.',
      },
      {
        question: 'Should I shave my Husky or double-coated dog in summer?',
        answer: 'No. This is one of the most common misconceptions. A Husky\'s double coat actually insulates them against heat as well as cold — shaving it removes that insulation and can cause permanent coat damage. Instead, we do a thorough deshedding blow-out that removes the loose undercoat efficiently without cutting the guard hairs. This actually helps with temperature regulation.',
      },
      {
        question: 'My dog has matted fur — can you help?',
        answer: 'Yes, though severe matting takes time and requires a careful approach. We never try to force a comb through tight mats as it\'s painful. Depending on the severity, we may need to use a dematting tool, work section by section, or in extreme cases recommend a short clip to allow the coat to start fresh. Regular grooming prevents matting from developing in the first place.',
      },
      {
        question: 'Do you offer breed-specific grooming styles?',
        answer: 'Yes. Breeds like Poodles, Doodles, Shih Tzus and Bichons have established grooming styles — teddy bear cuts, puppy cuts, breed standard clips. We\'re familiar with these and can discuss what style you prefer. Just mention it when you book so we can send the right groomer with experience in your breed.',
      },
      {
        question: 'How often should I bathe my dog in Pune\'s climate?',
        answer: 'For most dogs, a bath every 3–4 weeks is a good baseline. Humid monsoon months and dogs with skin sensitivities may need more frequent baths, but over-bathing at home with harsh products can dry out the skin. Our pH-balanced products are designed to be gentle.',
      },
      {
        question: 'Which dog breeds need grooming the most?',
        answer: 'High-maintenance coats such as Shih Tzus, Poodles, Lhasa Apsos, Golden Retrievers, Pomeranians, Huskies and Cocker Spaniels benefit most from regular professional grooming. Short-coated breeds like Labradors, Beagles and Pugs need less styling but still gain from regular baths, ear cleaning and nail care.',
      },
      {
        question: 'Do you do deshedding treatments?',
        answer: 'Yes. For heavy shedders like Huskies, Labradors, Golden Retrievers and German Shepherds, we do a thorough deshedding blow-out and brushing that removes loose undercoat without cutting the guard hairs, which reduces shedding around your home.',
      },
      {
        question: 'How do I groom a Shih Tzu, Poodle or Lhasa Apso in Pune?',
        answer: 'These breeds have continuously growing coats that mat easily, so they usually need a haircut every 4–6 weeks and regular brushing in between. Spa Bath + Hair Cut is the most suitable package, and we can do popular styles like puppy cut or teddy bear cut.',
      },
      {
        question: 'How often should a Golden Retriever or Labrador be groomed?',
        answer: 'Labradors can usually be bathed every 6–8 weeks, and Golden Retrievers every 4–6 weeks. Both shed heavily, so a deshedding blow-out during the bath helps reduce hair around the house. Never shave a double coat.',
      },
      {
        question: 'Can you groom a Pomeranian, Husky or other double-coated dog?',
        answer: 'Yes. Double-coated breeds need careful deshedding and brushing rather than shaving. We take extra time to remove loose undercoat and prevent mats, especially around the ears, tail and legs.',
      },
      {
        question: 'How can I reduce my dog\'s shedding at home?',
        answer: 'Brush your dog several times a week with a brush suited to their coat, feed a balanced diet, keep up with regular baths, and book a deshedding treatment. Heavy or sudden shedding can also be a sign of a health issue, so check with your vet if it worries you.',
      },
      {
        question: 'Why does my dog smell even after a bath?',
        answer: 'Common causes are damp coat, ear infection, skin problems, dental issues or full anal glands. A thorough blow-dry and ear cleaning during a Spa Bath helps, but if the smell persists, please see your vet.',
      },
    ],
  },
  {
    category: 'Ongoing Care',
    faqs: [
      {
        question: 'Do you offer subscription or monthly grooming plans?',
        answer: 'Yes. Many of our customers set up a recurring monthly or bi-monthly plan so their dog gets consistent grooming without having to rebook each time. This is especially popular for breeds that need regular maintenance. Talk to us after your first session and we\'ll set up a schedule that works for you.',
      },
      {
        question: 'What should I do between grooming sessions?',
        answer: 'Regular brushing at home is the most important thing — especially for medium and long-coated breeds. It prevents matting, distributes natural oils and keeps the coat clean between baths. We\'ll advise on the right brush type for your dog\'s coat and how often to brush during the session. Checking ears for redness or odour and keeping nails from getting too long are also worth doing between sessions.',
      },
      {
        question: 'How often should nails and ears be cleaned?',
        answer: 'Nails usually need trimming every 3–4 weeks, and ears should be checked weekly for redness, odour or discharge. Both are included in our Spa Bath, so a regular grooming schedule keeps them in check. See your vet if you notice persistent scratching or a foul smell.',
      },
      {
        question: 'Why is regular grooming important for dogs?',
        answer: 'Regular grooming does more than keep your dog looking good. It prevents matting, controls shedding, keeps skin healthy, and lets the groomer spot lumps, ticks, skin issues or ear problems early — before they turn into vet visits.',
      },
      {
        question: 'How often should I take my dog for a bath in monsoon?',
        answer: 'Monsoon humidity can cause damp coat odour and skin problems, so many dogs benefit from a grooming session every 3–4 weeks in this season. Always dry the coat fully, especially paws, belly and skin folds.',
      },
      {
        question: 'Do you have grooming offers or discounts for regular customers?',
        answer: 'We keep package prices simple and transparent. Referral credits and gift cards are available for customers, and our team can explain current options when you book.',
      },
    ],
  },
  {
    category: 'Payment & Policies',
    faqs: [
      {
        question: 'How and when do I pay?',
        answer: 'After the session, never before. The groomer accepts UPI, cash or card at the door. You pay the price you were quoted when you booked — if an add-on comes up during the session, the groomer tells you the revised total and gets your agreement before starting it, not after it is done.',
      },
      {
        question: 'Do you charge a travel or convenience fee for coming to my home?',
        answer: 'No. The package price is the full price anywhere in our coverage area — ₹799 for a Spa Bath in Ravet is ₹799 for a Spa Bath in Koregaon Park. Doorstep service is how we work, not an upgrade we bill for. There is no visit charge, no fuel surcharge and no minimum-order value.',
      },
      {
        question: 'Am I expected to tip the groomer?',
        answer: 'Not at all, and no groomer will ask. Our groomers earn a fixed rate plus performance incentives from us, so nobody is depending on a tip to make the session worthwhile. If you want to tip because you were genuinely happy, it is welcome — but the far more useful thing is a Google review naming the groomer.',
      },
      {
        question: 'What if I am not happy with the grooming?',
        answer: 'Tell us within 48 hours and be specific about what was wrong. If the issue is something we can fix — an uneven trim, a missed area, nails left long — we send a groomer back to correct it at no charge. If the session genuinely was not up to standard, we refund it. What we cannot undo is a length you approved before the clip started, so speak up while the groomer is still there if a cut is going shorter than you wanted.',
      },
      {
        question: 'Do you groom cats, or only dogs?',
        answer: 'Both, but cat grooming is run as a separate service with cat-trained groomers, cat-formulated products and low-restraint handling — dog shampoo and permethrin-based tick products are genuinely unsafe on cats, so this is not a matter of using the same kit on a smaller animal. See our cat grooming pages for the areas we cover and what a cat session involves.',
      },
    ],
  },
];
