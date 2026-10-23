/**
 * ServiceFaqList — accordion FAQ block shared by the /services pages.
 *
 * Mirrors the markup the prerender emits (see faqItems() in
 * scripts/prerenderServiceBody.ts): same question/answer text, so the static
 * frame and the mounted page agree.
 */
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 md:px-5 py-3.5 gap-4 text-left active:bg-purple-50"
      >
        <span className="font-semibold text-gray-900 text-sm md:text-base leading-snug">{q}</span>
        <span className="flex-shrink-0 text-sniffy-purple">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-50">
          <div className="pt-3">{a}</div>
        </div>
      )}
    </div>
  );
}

export default function ServiceFaqList({ heading, faqs }: { heading: string; faqs: { q: string; a: string }[] }) {
  return (
    <section className="bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest font-bold text-sniffy-purple mb-2">Common questions</p>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900">{heading}</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
