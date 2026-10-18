import { Check, Zap, Phone } from 'lucide-react';

export default function EliteMembership() {
  const benefits = [
    '10% OFF on every grooming service',
    '2 coat conditioning oil massages (worth ₹600)',
    'Priority booking — 24-hr advance access',
    'Birthday surprise gift for your pet',
    '2 pet consultancy sessions (worth ₹498)',
  ];

  return (
    <section id="elite" className="py-6 md:py-8 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1152] via-[#3a1a6b] to-[#2e1065] shadow-xl"
        >
          {/* Ambient glow accents — kept subtle so the panel reads calm, not punchy */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-sniffy-yellow/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

          {/* Faded photo tucked into the bottom-right corner only — like the package
              cards. It sits behind the glass price panel, whose backdrop-blur gives it
              the soft "liquid glass" read. A radial mask keeps it in the corner. */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 w-2/3 h-2/3 overflow-hidden rounded-br-3xl"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                // -800, not the 1600w original: this is a CSS background (no
                // srcset possible) behind a decorative panel, and the 800w file
                // is already in cache from the hero carousel.
                backgroundImage: 'url(/images/grooming-session-3-800.jpg)',
                opacity: 0.4,
                maskImage:
                  'radial-gradient(130% 130% at 100% 100%, black 0%, rgba(0,0,0,0.55) 38%, transparent 72%)',
                WebkitMaskImage:
                  'radial-gradient(130% 130% at 100% 100%, black 0%, rgba(0,0,0,0.55) 38%, transparent 72%)',
              }}
            />
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-[1.6fr_1fr]">
            {/* ── Left: header + benefits ── */}
            <div className="p-5 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl md:text-[1.7rem] font-bold text-white leading-tight mb-4">
                Sniffy <span className="text-sniffy-yellow">Elite</span> Membership
              </h2>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2"
                  >
                    <span className="w-[18px] h-[18px] flex-shrink-0 rounded-full bg-sniffy-yellow/20 flex items-center justify-center mt-0.5">
                      <Check size={11} className="text-sniffy-yellow" strokeWidth={3.5} />
                    </span>
                    <span className="text-white/90 text-xs sm:text-[13px] font-medium leading-snug">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Right: price + CTA (glass panel) ── */}
            <div className="relative md:border-l border-t md:border-t-0 border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6 md:p-8 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 md:gap-3.5">
              <div className="text-left md:text-center">
                <div className="flex items-baseline md:justify-center gap-2">
                  <span className="text-3xl md:text-4xl font-extrabold text-sniffy-yellow leading-none">
                    ₹449
                  </span>
                  <span className="text-sm text-white/40 line-through">₹999</span>
                </div>
                <p className="text-white/60 text-xs mt-1">per 6 months</p>
                <p className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/10 border border-white/15 rounded-full px-2.5 py-0.5 mt-2">
                  <Zap size={11} className="text-sniffy-yellow" />
                  Save over 50%
                </p>
              </div>

              <div className="flex flex-col items-center gap-1 w-auto md:w-full max-w-[10rem] md:max-w-none">
                <p className="inline-flex items-center gap-1.5 text-sniffy-yellow text-xs sm:text-[13px] font-bold text-center md:justify-center">
                  <Phone size={13} className="flex-shrink-0" />
                  Call us to activate Elite
                </p>
                <p className="text-white/45 text-[10px] text-center leading-snug">
                  We verify &amp; set it up over a quick call.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
