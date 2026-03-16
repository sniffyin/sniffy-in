import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { LocationConfig } from './LocationHero';

export interface FAQ {
  question: string;
  answer: string;
}

interface LocationFAQsProps {
  location: LocationConfig;
  faqs: FAQ[];
}

export default function LocationFAQs({ location, faqs }: LocationFAQsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
      className="py-12 md:py-16 px-4 bg-gradient-to-b from-white to-sniffy-purple/10"
      aria-labelledby={`faq-heading-${location.slug}`}
    >

      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-3xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-8 md:mb-10">
          <h2
            id={`faq-heading-${location.slug}`}
            className="text-2xl md:text-4xl font-bold mb-2"
          >
            <span className="text-sniffy-purple">FAQs —</span>{' '}
            <span className="text-sniffy-yellow">{location.name}</span>
          </h2>

          <p className="text-gray-600 text-sm md:text-base">
            Everything you need to know about home pet grooming in {location.name}, Pune
          </p>
        </div>

        {/* FAQ list */}
        <div className="space-y-3">

          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-sniffy-yellow/20 overflow-hidden"
              >

                {/* Question */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                  aria-expanded={isOpen}
                >
                  <h3 className="font-semibold text-sniffy-purple text-sm md:text-base pr-4">
                    {faq.question}
                  </h3>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChevronDown size={20} className="text-sniffy-yellow flex-shrink-0" />
                  </motion.div>
                </button>

                {/* Answer */}
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}