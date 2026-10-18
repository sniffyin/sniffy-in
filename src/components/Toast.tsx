import { Suspense, lazy, useEffect, useRef } from 'react';
import { LOTTIE_DOG_CONFIRM } from '../lib/lottieAssets';

/**
 * The lottie player is ~360 KB and this toast is mounted on the home page at all
 * times with isVisible=false — so a static import put that whole chunk on the
 * critical path of the site's most important page to render an animation nobody
 * had triggered yet. Loading it lazily keeps it off the initial download and
 * fetches it only once a booking actually succeeds.
 */
const DotLottieReact = lazy(() =>
  import('@lottiefiles/dotlottie-react').then((m) => ({ default: m.DotLottieReact }))
);

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!isVisible) {
      hasTriggeredRef.current = false;
      return;
    }

    if (!hasTriggeredRef.current) {
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/confirmation-sound.mp3');
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});

      if ('vibrate' in navigator) {
        navigator.vibrate(40);
      }

      hasTriggeredRef.current = true;
    }

    const timer = setTimeout(onClose, 10000);
    return () => clearTimeout(timer);
  }, [isVisible, onClose]);

  return (
    // Was framer-motion AnimatePresence/motion.div (backdrop + panel fade+scale);
    // CSS-only (see index.css animate-toast-backdrop-in / animate-toast-panel-in)
    // so this home-page-only component doesn't force framer-motion into the
    // home page's critical bundle just to render a booking-success toast nobody
    // has triggered yet. Loses the exit animation (the backdrop/panel just
    // disappear), the same trade already made for the Navbar/HeroSlider swaps.
    <>
      {isVisible && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-toast-backdrop-in"
          />

          <div
            className="
              fixed z-50
              top-1/2 left-1/2
              bg-white
              rounded-2xl
              shadow-2xl
              px-6 py-5
              w-[90%] max-w-sm
              flex flex-col items-center
              text-center
              animate-toast-panel-in
            "
          >
            {/* 🐶 Dog lottie replaces checkmark. The fallback reserves the same
                120x120 box so the message below does not jump when it loads. */}
            <div style={{ width: 120, height: 120 }}>
              <Suspense fallback={null}>
                <DotLottieReact
                  src={LOTTIE_DOG_CONFIRM}
                  autoplay
                  loop
                  style={{ width: '100%', height: '100%' }}
                />
              </Suspense>
            </div>

            <p className="text-gray-800 font-medium text-sm mt-1">
              {message}
            </p>
          </div>
        </>
      )}
    </>
  );
}