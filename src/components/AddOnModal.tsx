import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { DisplayAddOn as AddOn } from '../data/packages';

// Detail copy for the add-on popup, keyed by add-on name so dog + cat lists share it.
// `problem` = why a pet parent needs it; `solution` = what the groomer actually does.
const ADDON_INFO: Record<string, { problem: string; solution: string; note?: string }> = {
  'Special Handling': {
    problem:
      'Some dogs need more than a standard slot — senior dogs with stiff joints, anxious or rescue pets, and strong, large or reactive dogs who don’t enjoy being handled. Rushing them is stressful and unsafe for everyone.',
    solution:
      'We give your pet a longer, slower session with a second trained handler, frequent breaks, a calm voice and gentle handling to build trust — using safety equipment only where needed, and never force. We never hurt a pet; if a session can’t be done safely, we stop and talk to you.',
    note:
      'Flat ₹199 on top of your package. Tell us when booking and we’ll add it and send the right team. If our groomer finds on arrival that your pet needs extra handling (for example a very large, strong or reactive dog), Special Handling applies — we’ll explain why before starting.',
  },
  'Tick & Flea Care': {
    problem:
      'Ticks and fleas are more than an itch — they cause constant scratching, hair loss and skin infections, and can carry diseases that spread to your pet and even to your family at home.',
    solution:
      'We apply a vet-approved spot-on treatment dosed to your pet’s size that kills existing ticks and fleas and keeps new ones away for weeks. Paired with grooming, it clears the coat and breaks the infestation cycle at home.',
  },
  Deworming: {
    problem:
      'Intestinal worms are common in dogs and cats and often show no obvious signs until they cause weight loss, a dull coat, tummy upset or low energy. Some worms can also pass to humans.',
    solution:
      'Our groomer administers a vet-grade deworming dose matched to your pet’s weight during the visit — a quick, safe step that protects your pet’s gut health and keeps your household worry-free.',
  },
  'Destress Massage': {
    problem:
      'Grooming, travel and new faces can leave sensitive or anxious pets tense and unsettled — which shows up as fidgeting, whining or a coat that never quite relaxes.',
    solution:
      'A gentle full-body massage with soothing coconut or neem oil calms your pet, improves blood flow and leaves the skin and coat soft and nourished. It turns the session into something your pet actually enjoys.',
  },
  'Hygiene Hair Cut': {
    problem:
      'Long hair around the face, paws and sanitary areas traps dirt, urine and food — leading to matting, odour, eye irritation and hygiene issues that regular bathing alone can’t fix.',
    solution:
      'We carefully trim the face, sanitary region and paw pads to keep these sensitive areas clean, comfortable and mess-free between full haircuts — done gently, without stressing your pet.',
  },
  'Medicated Bath': {
    problem:
      'Persistent itching, flaky skin, redness or a bad smell often point to fungal or bacterial skin trouble that a normal shampoo won’t resolve — and it only gets worse if left untreated.',
    solution:
      'We bathe your pet with a medicated, vet-formulated shampoo that targets fungal and bacterial skin conditions, soothes irritation and helps restore a healthy, comfortable coat.',
  },
};

interface AddOnModalProps {
  /** null = closed. Kept nullable (rather than unmounting this whole
   *  component on close) so AnimatePresence below can play the exit
   *  animation — the parent only unmounts this component once, the first
   *  time it lazy-loads it, not on every open/close. */
  addon: AddOn | null;
  onClose: () => void;
  onBookNow: () => void;
}

/** Add-on detail popup, split out of Packages.tsx and lazy-loaded so
 *  framer-motion is only fetched the first time someone actually taps an
 *  add-on, instead of shipping in the eager homepage bundle. */
export default function AddOnModal({ addon, onClose, onBookNow }: AddOnModalProps) {
  return (
    <AnimatePresence>
      {addon && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={addon.name}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image at the top */}
            <div
              className="relative aspect-[16/9] w-full flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: addon.tint }}
            >
              <span className="text-6xl" aria-hidden>
                {addon.emoji}
              </span>
              {addon.image && (
                <img
                  src={addon.image}
                  alt={addon.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                <h3 className="text-xl font-extrabold text-white drop-shadow-sm">
                  {addon.name}
                </h3>
                <span className="shrink-0 rounded-full bg-sniffy-yellow px-3 py-1 text-sm font-extrabold text-sniffy-purple shadow">
                  {addon.price}
                </span>
              </div>
            </div>

            {/* Explanation */}
            <div className="px-5 py-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Why it’s needed
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-700">
                  {ADDON_INFO[addon.name]?.problem ?? addon.detail}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-sniffy-purple">
                  What we do
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-700">
                  {ADDON_INFO[addon.name]?.solution ?? ''}
                </p>
              </div>

              {ADDON_INFO[addon.name]?.note && (
                <div className="rounded-xl bg-sniffy-yellow/15 px-3.5 py-3">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-sniffy-purple">
                    Pricing
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-gray-700">
                    {ADDON_INFO[addon.name].note}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookNow();
                }}
                className="mt-1 w-full rounded-xl bg-sniffy-purple py-3 text-sm font-bold text-white transition-colors hover:bg-sniffy-purple/90"
              >
                Add to my grooming
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
