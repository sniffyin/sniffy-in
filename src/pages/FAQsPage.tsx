/**
 * FAQsPage — Standalone page.
 * Header + Footer + FAQs only. No packages, reviews or other sections.
 * 28 questions organised from basic to complex with category grouping.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const faqCategories = [
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
    ],
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FAQItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white rounded-[20px] border-2 border-sniffy-yellow/20 overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-sniffy-purple text-base pr-4 leading-snug">
          {question}
        </h3>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex-shrink-0">
          <ChevronDown size={20} className="text-sniffy-yellow" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5 text-gray-600 text-sm md:text-base leading-relaxed border-t border-gray-100 pt-3">
          {answer}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FAQsPage() {
  // Track open item per category: { [categoryIndex]: openQuestionIndex | null }
  const [openMap, setOpenMap] = useState<Record<number, number | null>>({ 0: 0 });

  const toggle = (catIdx: number, qIdx: number) => {
    setOpenMap((prev) => ({
      ...prev,
      [catIdx]: prev[catIdx] === qIdx ? null : qIdx,
    }));
  };

  // Build schema from all FAQs
  const allFaqs = faqCategories.flatMap((c) => c.faqs);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Navbar activePath="/faqs" />
      </header>

      <main>
        {/* Page header */}
        <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 py-14 md:py-20 text-center">
          <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-3">Everything you need to know</p>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              <span className="text-sniffy-purple">Frequently Asked</span>{' '}
              <span className="text-sniffy-yellow">Questions</span>
            </h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
              {allFaqs.length} questions answered — from the very basics to the more involved stuff about breeds, coats and ongoing care.
            </p>
          </motion.div>
        </section>

        {/* FAQ categories */}
        <section className="max-w-3xl mx-auto px-4 pb-20">
          {faqCategories.map((cat, catIdx) => (
            <motion.div
              key={cat.category}
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Category label */}
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-bold text-gray-900">{cat.category}</h2>
                <div className="flex-1 h-px bg-sniffy-yellow/30 rounded-full" />
                <span className="text-xs text-gray-400 font-medium">{cat.faqs.length} questions</span>
              </div>

              <div className="space-y-3">
                {cat.faqs.map((faq, qIdx) => (
                  <FAQItem
                    key={qIdx}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openMap[catIdx] === qIdx}
                    onToggle={() => toggle(catIdx, qIdx)}
                  />
                ))}
              </div>
            </motion.div>
          ))}

          {/* Bottom CTA */}
          <div className="bg-sniffy-purple rounded-[30px] px-8 py-10 text-center mt-4">
            <p className="text-white font-bold text-xl mb-2">Still have a question?</p>
            <p className="text-white/70 text-sm mb-6">Call us or WhatsApp and we'll answer right away.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:8971313003" className="bg-white text-sniffy-purple font-bold px-7 py-3 rounded-full text-sm hover:opacity-90 transition-all">
                Call 8971313003
              </a>
              <a href="https://wa.me/918971313003" target="_blank" rel="noopener noreferrer" className="bg-sniffy-yellow text-gray-900 font-bold px-7 py-3 rounded-full text-sm hover:opacity-90 transition-all">
                WhatsApp Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
