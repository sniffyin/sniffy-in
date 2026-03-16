import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

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
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
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
            "
          >
            {/* 🐶 Dog lottie replaces checkmark */}
            <div style={{ width: 120, height: 120 }}>
              <DotLottieReact
                src="/lottie/Dog_confirm.lottie"
                autoplay
                loop
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            <p className="text-gray-800 font-medium text-sm mt-1">
              {message}
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}