/**
 * NotFoundPage — 404 page matching the Sniffy site theme.
 *
 * Matches the visual language of AboutPage / HowItWorksPage:
 *   • Same purple-to-white gradient hero
 *   • Same sans-serif type stack (no serif), same bold weights and sizes
 *   • Same eyebrow pattern (`text-xs uppercase tracking-widest sniffy-purple`)
 *   • Same CTA button style (rounded-full, sniffy-purple/yellow)
 *   • Same white card sections with soft shadows and rounded corners
 *
 * Wired as the catch-all `<Route path="*" />` in App.tsx.
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, PawPrint, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Navbar activePath="/404" />
      </header>

      <main className="flex-1">
        {/* ── Hero — same gradient + type rhythm as AboutPage ──────────── */}
        <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Eyebrow */}
            <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-6">
              Error 404 · Page not found
            </p>

            {/* Big 404 wordmark — same sans-serif as the rest of the site,
                with the zero replaced by a yellow paw badge */}
            <div className="flex items-center justify-center gap-3 md:gap-5 mb-8">
              <span className="text-7xl md:text-8xl font-bold text-sniffy-purple leading-none">4</span>
              <motion.span
                aria-hidden="true"
                animate={{ rotate: [-4, 4, -4] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-sniffy-yellow shadow-md"
              >
                <PawPrint className="w-9 h-9 md:w-11 md:h-11 text-sniffy-purple" strokeWidth={2.5} />
              </motion.span>
              <span className="text-7xl md:text-8xl font-bold text-sniffy-purple leading-none">4</span>
            </div>

            {/* Headline — same pattern as AboutPage hero */}
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              We couldn't find the page{' '}
              <span className="text-sniffy-purple">you were looking for</span>
            </h1>

            {/* Body */}
            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              The link may be mistyped, or the page may have moved. Let's get you back to Sniffy.
            </p>

            {/* CTAs — same rounded-full primary button as Hero.tsx */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sniffy-purple text-white px-6 py-3.5 rounded-full font-bold text-base hover:opacity-90 transition-all shadow-md"
              >
                <Home className="w-5 h-5" />
                Back to Sniffy home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-sniffy-purple border-2 border-sniffy-purple px-6 py-3 rounded-full font-bold text-base hover:bg-purple-50 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Go back
              </button>
            </div>
          </div>
        </section>

        {/* ── Quick links — white cards, matches rest of site ──────────── */}
        <section className="bg-white py-14 md:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-3">
                Try one of these
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Popular pages
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {QUICK_LINKS.map((link) => (
                <div
                  key={link.href}
                >
                  <Link
                    to={link.href}
                    className="group flex items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-white border border-gray-200 hover:border-sniffy-purple hover:shadow-md transition-all"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 text-base md:text-lg mb-0.5">
                        {link.title}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {link.sub}
                      </div>
                    </div>
                    <ChevronRight className="flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-sniffy-purple group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center text-sm md:text-base text-gray-600">
              Still can't find it?{' '}
              <Link to="/contact" className="text-sniffy-purple font-bold hover:underline">
                Get in touch
              </Link>{' '}
              and we'll point you the right way.
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ─── Quick links ─────────────────────────────────────────────────────────── */

const QUICK_LINKS = [
  { href: '/',             title: 'Book a grooming',  sub: 'At-home, by trained pros' },
  { href: '/how-it-works', title: 'How it works',     sub: 'See the Sniffy process'   },
  { href: '/why-sniffy',   title: 'Why Sniffy',       sub: 'What makes us different'  },
  { href: '/contact',      title: 'Talk to us',       sub: 'WhatsApp, phone or email' },
];
