import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { HOME_FAQS } from '../data/homeFaqs';

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = HOME_FAQS;


  return (
    <section
      className="py-10 md:py-12 px-4 bg-gradient-to-b from-white to-sniffy-purple/10"
      aria-labelledby="faq-heading"
    >
      {/* Structured Data for Google */}
      {/*
        FAQPage schema is baked into dist/index.html by scripts/prerenderSpa.ts
        from this same HOME_FAQS array, so crawlers get it without running JS.
        Emitting it here too produced a duplicate FAQPage node on the homepage.
      */}

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <h2
            id="faq-heading"
            className="text-2xl md:text-3xl font-bold mb-2"
          >
            <span className="text-sniffy-purple">Frequently Asked</span>{' '}
            <span className="text-sniffy-yellow">Questions</span>
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Everything you need to know about home pet grooming in Pune
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-sniffy-yellow/20"
              >
                {/* Question */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <h3 className="font-semibold text-sniffy-purple text-sm md:text-base pr-3 leading-snug">
                    {faq.question}
                  </h3>

                  <div
                    className="transition-transform duration-300"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <ChevronDown
                      size={18}
                      className="text-sniffy-yellow flex-shrink-0"
                    />
                  </div>
                </button>

                {/* Answer (ALWAYS in DOM, visually toggled) */}
                <div
                  className={`px-4 pb-3 text-gray-600 text-sm leading-snug transition-all duration-300 ${
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
