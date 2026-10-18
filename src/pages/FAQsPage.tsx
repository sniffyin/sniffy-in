/**
 * FAQsPage — Standalone page.
 * Header + Footer + FAQs only. No packages, reviews or other sections.
 * Questions organised from basic to complex with category grouping; data lives in
 * src/data/faqsPageFaqs.ts so the prerenderer can read it too.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSeo } from '../lib/useSeo';
import { SEO_ROUTES } from '../data/seoRoutes';
import { FAQ_CATEGORIES } from '../data/faqsPageFaqs';

// ─── FAQ data ─────────────────────────────────────────────────────────────────
// Lives in src/data/faqsPageFaqs.ts so scripts/prerenderSpa.ts can render these
// into the static HTML and build the /faqs FAQPage schema without importing React.

const faqCategories = FAQ_CATEGORIES;

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
  useSeo(SEO_ROUTES.faqs);

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
          <div className="max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-3">Everything you need to know</p>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              <span className="text-sniffy-purple">Frequently Asked</span>{' '}
              <span className="text-sniffy-yellow">Questions</span>
            </h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
              {allFaqs.length} questions answered — from the very basics to the more involved stuff about breeds, coats and ongoing care.
            </p>
          </div>
        </section>

        {/* FAQ categories */}
        <section className="max-w-3xl mx-auto px-4 pb-20">
          {faqCategories.map((cat, catIdx) => (
            <div
              key={cat.category}
              className="mb-12"
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
            </div>
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
