import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Single source of truth
  const faqs = [
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
    {
      question: 'Which areas in Pune do you provide pet grooming services?',
      answer:
        'We offer home pet grooming services across all major areas of Pune including Wakad, Hinjewadi, Baner, Aundh, Kothrud, Bavdhan, Karve Nagar, Hadapsar, Magarpatta, Kharadi, Viman Nagar, Yerawada, Pimpri-Chinchwad, Pimple Saudagar and nearby localities.',
    },
    {
      question: 'How often should dogs be groomed in Pune’s climate?',
      answer:
        'Due to Pune’s warm and sometimes humid climate, dogs benefit from regular grooming every 4–6 weeks. Regular grooming helps control shedding, prevents skin infections, and keeps your pet comfortable, especially during summer months.',
    },
  ];

  // FAQ Schema (generated from same data)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section
      className="py-16 px-4 bg-gradient-to-b from-white to-sniffy-purple/10"
      aria-labelledby="faq-heading"
    >
      {/* Structured Data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2
            id="faq-heading"
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="text-sniffy-purple">Frequently Asked</span>{' '}
            <span className="text-sniffy-yellow">Questions</span>
          </h2>
          <p className="text-gray-600 text-lg md:text-xl">
            Everything you need to know about home pet grooming in Pune
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="bg-white rounded-[25px] shadow-lg overflow-hidden border-2 border-sniffy-yellow/20"
              >
                {/* Question */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <h3 className="font-semibold text-sniffy-purple text-lg pr-4">
                    {faq.question}
                  </h3>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown
                      size={24}
                      className="text-sniffy-yellow flex-shrink-0"
                    />
                  </motion.div>
                </button>

                {/* Answer (ALWAYS in DOM, visually toggled) */}
                <div
                  className={`px-6 pb-4 text-gray-600 leading-relaxed transition-all duration-300 ${
                    isOpen ? 'block' : 'hidden'
                  }`}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
