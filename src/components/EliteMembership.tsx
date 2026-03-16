import { motion } from 'framer-motion';
import { Crown, Check, Zap } from 'lucide-react';

export default function EliteMembership() {
  const benefits = [
    { text: '10% OFF on every grooming service', icon: '💸' },
    { text: '2 complimentary coat conditioning oil massages (worth ₹600)', icon: '✨' },
    { text: 'Priority booking — 24-hour advance access', icon: '⚡' },
    { text: 'Birthday surprise gift for your pet', icon: '🎁' },
    { text: '2 complimentary pet consultancy sessions (worth ₹498)', icon: '🩺' },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-2">Members only</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Sniffy <span className="text-sniffy-yellow">Elite</span> Membership
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-0 bg-white rounded-[28px] border-2 border-gray-100 shadow-xl overflow-hidden"
        >

          {/* Left — benefits */}
          <div className="p-8 md:p-10">
            <div className="flex items-center gap-2 mb-6">
              <Crown size={18} className="text-sniffy-yellow" />
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Exclusive Benefits</span>
            </div>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={13} className="text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-gray-700 text-sm font-medium leading-snug">{benefit.text}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Right — price + CTA */}
          <div className="bg-sniffy-purple p-8 md:p-10 flex flex-col items-center justify-center text-center gap-5">
            <Crown size={32} className="text-sniffy-yellow" />

            <div>
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-4xl font-extrabold text-sniffy-yellow">₹449</span>
                <span className="text-base text-white/50 line-through">₹999</span>
              </div>
              <p className="text-white/70 text-sm">per 6 months</p>
            </div>

            <div className="bg-white/10 rounded-2xl px-4 py-2">
              <p className="text-white text-sm font-bold flex items-center gap-1.5">
                <Zap size={14} className="text-sniffy-yellow" />
                Save over 50%
              </p>
            </div>

            <button className="w-full bg-sniffy-yellow text-gray-900 font-bold py-3.5 rounded-full text-sm hover:opacity-90 transition-all shadow-lg">
              Join Elite Now
            </button>

            <p className="text-white/50 text-xs">Cancel anytime. No hidden fees.</p>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
