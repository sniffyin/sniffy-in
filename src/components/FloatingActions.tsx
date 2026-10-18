/**
 * FloatingActions — persistent floating "speed dial" giving one-tap access to
 * Book a Session + WhatsApp on every public/marketing page.
 *
 * Why it exists: inline "Book Now" CTAs were repeated everywhere. This is the
 * single, always-reachable conversion point so the page bodies can stay clean.
 *
 * Self-contained: it lazy-mounts its OWN BookingWizard instance, so it works on
 * any route without the parent page having to wire up modal state. Mount it once
 * (see App.tsx) — it hides itself on the dashboard/portal routes.
 */

import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint, X, CalendarHeart } from 'lucide-react';

const BookingWizard = lazy(() => import('./BookingWizard'));

const WHATSAPP_URL =
  "https://wa.me/918971313003?text=" +
  encodeURIComponent("Hi Sniffy! 🐾 I'd like to book an at-home grooming session for my pet.");

// WhatsApp glyph (kept inline so we don't pull an icon set for one mark)
function WhatsAppGlyph({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.508 5.84L.057 23.854a.5.5 0 0 0 .611.61l6.074-1.434A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.032-1.377l-.36-.214-3.733.882.933-3.648-.236-.374A9.861 9.861 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z" />
    </svg>
  );
}

export default function FloatingActions() {
  const [open, setOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Entrance: slide in shortly after load, then flash a one-time teaser bubble
  // to draw the eye without being naggy.
  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 900);
    const t2 = setTimeout(() => setTeaser(true), 1800);
    const t3 = setTimeout(() => setTeaser(false), 6500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Close the speed dial on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const dismissTeaser = () => setTeaser(false);

  return (
    <>
      {/* Mobile scrim — dims the page when the dial is open so the choices pop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[9990] bg-black/30 backdrop-blur-[2px] sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        className="fixed z-[9991] flex flex-col items-end gap-3"
        style={{
          right: 'max(1rem, env(safe-area-inset-right))',
          bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
        }}
      >
        {/* ── Expanded actions ─────────────────────────────────────────── */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="flex flex-col items-end gap-3"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.07, delayChildren: 0.03 } },
                closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
              }}
            >
              {/* WhatsApp */}
              <motion.a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                variants={{
                  open: { opacity: 1, y: 0, scale: 1 },
                  closed: { opacity: 0, y: 20, scale: 0.8 },
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="group flex items-center gap-3 rounded-full bg-white pl-5 pr-2 py-2 shadow-xl shadow-black/10 ring-1 ring-black/5"
              >
                <div className="text-right leading-tight">
                  <p className="text-sm font-bold text-gray-900">WhatsApp Us</p>
                  <p className="text-[11px] text-gray-500">Replies in minutes</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md">
                  <WhatsAppGlyph />
                </span>
              </motion.a>

              {/* Book a Session */}
              <motion.button
                type="button"
                onClick={() => { setOpen(false); setBookingOpen(true); }}
                variants={{
                  open: { opacity: 1, y: 0, scale: 1 },
                  closed: { opacity: 0, y: 20, scale: 0.8 },
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="group flex items-center gap-3 rounded-full bg-white pl-5 pr-2 py-2 shadow-xl shadow-black/10 ring-1 ring-black/5"
              >
                <div className="text-right leading-tight">
                  <p className="text-sm font-bold text-gray-900">Book a Session</p>
                  <p className="text-[11px] text-gray-500">Groomer at your door</p>
                </div>
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-sniffy-purple text-white shadow-md overflow-hidden">
                  <span className="absolute -inset-y-2 -left-4 w-6 rotate-12 bg-white/30 blur-[2px] group-hover:animate-[shimmer_0.9s_ease-out]" />
                  <CalendarHeart className="w-5 h-5 relative" />
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Teaser bubble (one-time attention nudge) ─────────────────── */}
        <AnimatePresence>
          {teaser && !open && (
            <motion.button
              type="button"
              onClick={() => { dismissTeaser(); setOpen(true); }}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="relative mr-1 max-w-[15rem] rounded-2xl rounded-br-sm bg-white px-4 py-2.5 text-left shadow-xl shadow-black/10 ring-1 ring-black/5"
            >
              <span
                onClick={(e) => { e.stopPropagation(); dismissTeaser(); }}
                className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
              >
                <X className="w-3 h-3" />
              </span>
              <p className="text-sm font-bold text-gray-900">Pamper your pet 🐾</p>
              <p className="text-[11px] text-gray-500">Book grooming or chat with us</p>
              {/* little pointer */}
              <span className="absolute -bottom-1.5 right-3 h-3 w-3 rotate-45 bg-white ring-1 ring-black/5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Main FAB ─────────────────────────────────────────────────── */}
        <motion.button
          type="button"
          aria-label={open ? 'Close menu' : 'Book grooming or chat'}
          aria-expanded={open}
          onClick={() => { dismissTeaser(); setOpen(v => !v); }}
          initial={{ opacity: 0, scale: 0, y: 40 }}
          animate={mounted ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          className="relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl shadow-sniffy-purple/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-sniffy-yellow/50"
          style={{
            background:
              'radial-gradient(120% 120% at 30% 20%, #6b2fa0 0%, #451a8b 55%, #35146b 100%)',
          }}
        >
          {/* breathing halo rings */}
          {!open && (
            <>
              <motion.span
                className="absolute inset-0 rounded-full bg-sniffy-purple"
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: 0, scale: 1.8 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.span
                className="absolute inset-0 rounded-full ring-2 ring-sniffy-yellow/60"
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 1.55 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
              />
            </>
          )}

          {/* icon swap: paw ⇄ close, with a playful wiggle when idle */}
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="relative"
              >
                <X className="w-7 h-7" />
              </motion.span>
            ) : (
              <motion.span
                key="paw"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: [0, -12, 12, 0], opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{
                  rotate: { duration: 0.9, repeat: Infinity, repeatDelay: 3.5, ease: 'easeInOut' },
                  opacity: { duration: 0.18 },
                }}
                className="relative"
              >
                <PawPrint className="w-7 h-7" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Own BookingWizard instance — works regardless of which page we're on */}
      <Suspense fallback={null}>
        <BookingWizard
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          onSuccess={() => setBookingOpen(false)}
        />
      </Suspense>
    </>
  );
}
