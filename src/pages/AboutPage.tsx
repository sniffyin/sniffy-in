/**
 * AboutPage — Standalone About Us page.
 * Header + Footer + content only.
 */

import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── Values ───────────────────────────────────────────────────────────────────

const values = [
  {
    emoji: '🐾',
    title: 'The dog comes first',
    body: 'Every decision we make — how we train our groomers, which products we use, how we structure sessions — starts with what\'s best for the dog. Not what\'s fastest or cheapest.',
  },
  {
    emoji: '🏠',
    title: 'Home is the right place',
    body: 'We believe dogs shouldn\'t have to leave their safe space to be cared for. The salon model was built for human convenience, not dog wellbeing. We\'re fixing that.',
  },
  {
    emoji: '✂️',
    title: 'Professionals, not just people who like dogs',
    body: 'Liking dogs is the minimum. We train our groomers in breed-specific techniques, coat science, animal handling and hygiene. Enthusiasm without skill isn\'t good enough.',
  },
  {
    emoji: '🤝',
    title: 'Honest about what we are',
    body: 'We\'re a grooming service. We do it well. We don\'t oversell, we don\'t make claims we can\'t back up, and we tell you directly if we can\'t help with something.',
  },
];

// ─── Team cards (placeholder — swap with real team) ───────────────────────────

const team = [
  {
    name: 'Rahul Sharma',
    role: 'Co-founder & Head of Operations',
    note: 'Grew up with three dogs and a deep frustration with how Pune\'s pet grooming worked. Started Sniffy to fix it.',
    avatar: '/images/review-1.jpg',
  },
  {
    name: 'Priya Kulkarni',
    role: 'Co-founder & Grooming Lead',
    note: 'Certified groomer with 6 years of experience across multiple breeds. Trains every groomer who joins Sniffy.',
    avatar: '/images/review-2.jpg',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Navbar activePath="/about" />
      </header>

      <main>

        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 py-16 md:py-24">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-4">About Sniffy</p>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              We started Sniffy because{' '}
              <span className="text-sniffy-purple">the alternative wasn't good enough</span>
            </h1>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Sniffy is a professional at-home dog grooming service operating across Pune. We send trained, certified groomers to your home — so your dog gets proper care in the place they feel safest.
            </p>
          </motion.div>
        </section>

        {/* ── The problem we saw ── */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-full aspect-[4/3] rounded-[40px] overflow-hidden bg-gray-100 shadow-md">
                <img src="/images/grooming-session-4.jpg" alt="Dog grooming at home in Pune" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5">What we saw in the market</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-base">
                <p>
                  Pune has grown fast as a city. The number of pet-owning households has doubled in the last five years, particularly among young professionals in areas like Wakad, Kothrud, Wagholi and Kharadi. But the grooming industry hadn't kept up.
                </p>
                <p>
                  Most salons in Pune operate the same way they always have — you bring your dog in, leave them in a cage for a few hours while multiple groomers work on multiple animals simultaneously, and pick them up later. For some dogs this is fine. For many, it's a source of genuine anxiety.
                </p>
                <p>
                  The people offering home grooming were mostly individual freelancers — sometimes skilled, sometimes not — with no consistency in training, equipment or hygiene standards. There was no reliable, professional option that worked the way modern pet owners expected services to work.
                </p>
                <p>
                  That's the gap we set out to fill.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── What we built ── */}
        <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 md:order-1"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5">What Sniffy actually is</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-base">
                <p>
                  Sniffy is not a marketplace. We don't aggregate freelancers and hope for the best. Every groomer who works with Sniffy goes through our own training programme — covering breed-specific techniques, coat science, proper use of equipment, hygiene protocols and animal handling.
                </p>
                <p>
                  We operate across Pune with morning, afternoon and evening slots every day. When you book, we confirm within minutes and send a groomer at the time you chose. They arrive with everything — shampoos, conditioners, professional clippers, dryers, nail tools, towels, all of it. You don't need to prepare anything.
                </p>
                <p>
                  The groomer works with your dog one-on-one. No cages. No other animals. No rushing to get to the next client. Just a calm, thorough session that your dog gets to experience in the place they already feel safe.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 md:order-2"
            >
              <div className="w-full aspect-[4/3] rounded-[40px] overflow-hidden bg-gray-100 shadow-md">
                <img src="/images/grooming-session-2.jpg" alt="Professional groomer at work in Pune" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">What we stand for</h2>
              <p className="text-gray-500 text-base max-w-lg mx-auto">These aren't marketing lines. They're the things that actually shape how we operate day to day.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  className="bg-gray-50 rounded-[24px] p-7"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <div className="text-3xl mb-3">{v.emoji}</div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ── */}
        {/* <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">The people behind Sniffy</h2>
              <p className="text-gray-500 text-base max-w-md mx-auto">We're a small team of dog people who got tired of watching the grooming industry let pets and their owners down.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  className="bg-white rounded-[24px] p-6 flex gap-4 items-start shadow-sm border border-gray-100"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 text-base">{member.name}</p>
                    <p className="text-sniffy-purple text-xs font-semibold mb-2">{member.role}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{member.note}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

        {/* ── Numbers ── */}
        <section className="bg-sniffy-purple py-16 px-4">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-center text-white/60 text-xs uppercase tracking-widest font-bold mb-10">Sniffy in numbers</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: '1,500+', label: 'Sessions completed' },
                { number: '4.9',    label: 'Average rating' },
                { number: '8',      label: 'Areas covered in Pune' },
                { number: '9 AM–9 PM', label: 'Available every day' },
              ].map(({ number, label }) => (
                <div key={label}>
                  <div className="text-3xl md:text-4xl font-extrabold text-sniffy-yellow mb-1">{number}</div>
                  <div className="text-white/60 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-white px-4 py-16 text-center">
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Want to experience the difference?</h2>
            <p className="text-gray-500 text-base mb-8">Book a session and see for yourself why Pune's pet parents are switching to Sniffy.</p>
            <a
              href="/#booking"
              className="inline-block bg-sniffy-purple text-white font-bold px-10 py-4 rounded-full text-base hover:opacity-90 transition-all shadow-lg"
            >
              Book a Grooming Session
            </a>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
