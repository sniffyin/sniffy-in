import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, ShieldCheck, Clock, MapPin } from "lucide-react";
import Navbar from "./Navbar";

interface HeroProps {
  onOpenModal: (initialData?: { name: string; phone: string }) => void;
}

// ─── Counter only runs once the stats row enters the viewport ─────────────────
// Previously it fired requestAnimationFrame on page load, competing with LCP.
function useAnimatedCount(target: number, duration = 1200, triggered = false) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!triggered) return;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
      else setValue(target);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, triggered]);

  return value;
}

const avatarEntrance = {
  hidden: { opacity: 0, scale: 0.5, rotate: -160 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <motion.div
      className="flex gap-1 items-center"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(100, (rating - (star - 1)) * 100));
        return (
          <span key={star} className="relative inline-block w-6 h-6">
            <Star className="absolute w-6 h-6 text-gray-300" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill}%` }}
            >
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </span>
          </span>
        );
      })}
    </motion.div>
  );
}

export default function Hero({ onOpenModal }: HeroProps) {
  const [quickBooking, setQuickBooking] = useState({ name: "", phone: "" });

  const handleQuickBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onOpenModal(quickBooking);
  };

  // ── Trigger counter only when it scrolls into view ────────────────────────
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const happyCount = useAnimatedCount(1562, 3900, statsVisible);

  const avatarSrcs = [
    "/images/review-1.jpg",
    "/images/review-2.jpg",
    "/images/review-3.jpg",
    "/images/review-4.jpg",
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Navbar activePath="/" />
      </header>

      <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 pt-14 pb-0 text-center relative overflow-hidden">
        <motion.div
          className="max-w-2xl mx-auto relative"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/70 border border-purple-200 rounded-full px-4 py-1.5 mb-6">
            <MapPin size={14} className="text-sniffy-purple" />
            <span className="text-xs font-bold text-sniffy-purple tracking-wide uppercase">
              At Your Doorstep
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-5">
            Grooming Service at
            <br />
            <span className="text-sniffy-purple">Your Doorstep</span>
          </h1>

          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Gentle care, expert hands, stress-free experience. Top-quality home
            grooming. If you find better, your next one is on us.
          </p>

          <a
            href="https://g.page/r/CdJR67bjxy_gEBI/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 mb-10"
          >
            <motion.div
              className="flex -space-x-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.14 } },
              }}
            >
              {avatarSrcs.map((src, i) => (
                <motion.img
                  key={src}
                  src={src}
                  alt={"Happy customer " + (i + 1)}
                  // Explicit dimensions prevent layout shift (CLS fix)
                  width={44}
                  height={44}
                  // First image is the LCP candidate — load it eagerly.
                  // The rest are below the fold on most phones — lazy load them.
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-11 h-11 rounded-full border-4 border-white object-cover shadow-md"
                  variants={avatarEntrance}
                />
              ))}
            </motion.div>
            <div className="text-left">
              <StarRating rating={4.7} />
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                4.9 Customer Ratings
              </p>
            </div>
          </a>

          <div className="flex flex-row gap-3 justify-center items-center">
            <button
              onClick={() => onOpenModal()}
              className="flex-1 sm:flex-none bg-sniffy-purple text-white px-6 py-3.5 rounded-full font-bold text-base hover:opacity-90 transition-all shadow-md"
            >
              Book a Session
            </button>
            <a
              href="https://wa.me/918971313003"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sniffy-purple border border-sniffy-purple/40 bg-white/60 px-6 py-3.5 rounded-full font-semibold text-base hover:bg-purple-50 transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.508 5.84L.057 23.854a.5.5 0 0 0 .611.61l6.074-1.434A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.032-1.377l-.36-.214-3.733.882.933-3.648-.236-.374A9.861 9.861 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white/70 border border-gray-100 rounded-full px-3 py-1.5">
              <ShieldCheck size={12} className="text-sniffy-purple" /> Trained
              groomers
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white/70 border border-gray-100 rounded-full px-3 py-1.5">
              <Clock size={12} className="text-sniffy-purple" /> 9 AM - 9 PM
              daily
            </span>

            {/* ── Happy clients counter — animates when visible ── */}
            <span
              ref={statsRef}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white/70 border border-gray-100 rounded-full px-3 py-1.5"
            >
              <MapPin size={12} className="text-sniffy-purple" /> Multiple
              cities covered
            </span>
          </div>

          {/* Commented-out quick booking form — preserved as-is */}
          {/* <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-sniffy-purple mb-6 text-center">
                Quick Booking
              </h2>
              <form onSubmit={handleQuickBook} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={quickBooking.name}
                  onChange={(e) =>
                    setQuickBooking({ ...quickBooking, name: e.target.value })
                  }
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sniffy-purple focus:border-sniffy-purple outline-none transition-all"
                />
                <input
                  type="tel"
                  placeholder="Mobile Number (10 digits)"
                  required
                  pattern="[0-9]{10}"
                  value={quickBooking.phone}
                  onChange={(e) =>
                    setQuickBooking({ ...quickBooking, phone: e.target.value })
                  }
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sniffy-purple focus:border-sniffy-purple outline-none transition-all"
                />
                <button
                  type="submit"
                  className="w-full bg-sniffy-purple text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Book Now
                </button>
                <p className="text-xs text-gray-500 text-center">
                  We will call you to confirm your appointment
                </p>
              </form>
            </div>
          </motion.div> */}
        </motion.div>
      </section>
    </>
  );
}
