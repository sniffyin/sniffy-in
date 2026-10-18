import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Site-wide one-time notice about the recent cyber attack that took the
 * website, WhatsApp and booking systems offline. Shown once per browser —
 * dismissal is remembered in localStorage so returning visitors aren't
 * shown it again. Bump the key's suffix if a future notice needs to
 * re-surface for everyone regardless of this dismissal.
 */
/** Set to true to show the notice again. */
const SHOW_NOTICE = false;

const STORAGE_KEY = 'sniffy_notice_cyber_attack_sep2026_dismissed';

function hasSeenNotice(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markNoticeSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Private browsing / storage disabled — worst case we show it again next visit.
  }
}

export default function ServiceDisruptionNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (SHOW_NOTICE && !hasSeenNotice()) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    markNoticeSeen();
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.92, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-notice-title"
            className="
              fixed z-[90]
              top-1/2 left-1/2
              bg-white
              rounded-2xl
              shadow-2xl
              w-[90%] max-w-md
              pt-2 px-6 pb-6 sm:pb-7
              text-center
              overflow-visible
            "
          >
            <button
              onClick={handleClose}
              aria-label="Close"
              className="
                absolute -top-3 -right-3 z-10
                w-10 h-10 flex items-center justify-center
                rounded-full bg-white shadow-lg border border-gray-200
                text-gray-600 hover:text-gray-900 hover:bg-gray-50
                transition-colors
              "
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            <img
              src="/images/sad-corgy.png"
              alt="A corgi resting quietly"
              draggable={false}
              className="mx-auto -mt-32 sm:-mt-36 mb-1 w-60 sm:w-72 h-auto select-none pointer-events-none"
            />

            <h2 id="service-notice-title" className="text-lg font-bold text-gray-900 mb-2">
              We missed you! 🐾
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              A few days ago, Sniffy was hit by a cyber attack that took down our
              website, WhatsApp and booking systems all at once. We couldn't take
              bookings or respond to messages for a while, and it broke our hearts
              to not be there for you and your pets when you needed us.
            </p>

            <p className="text-sm text-gray-600 leading-relaxed">
              We're back now, stronger and better than before. Thank you for your patience.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
