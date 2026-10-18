/**
 * DraggableAddSessionFAB.tsx
 *
 * Floating action button that:
 *   - Sits on top of every admin tab (z-index above content, below modals)
 *   - Can be dragged anywhere within the viewport
 *   - Remembers where the user put it across sessions (localStorage)
 *   - Distinguishes drag vs. tap — a quick tap fires `onClick` and opens
 *     the Add Session modal; a drag just repositions and is silent
 *
 * Implementation notes
 * --------------------
 *  • Position is driven by Framer Motion `useMotionValue` (x / y), with
 *    `position: fixed; top: 0; left: 0` and the transform doing the work.
 *    This is the idiomatic way to combine `drag` with persisted state.
 *  • We track drag distance ourselves (`draggedRef`) because Framer's
 *    own click suppression isn't reliable across all touch / mouse
 *    devices — the click handler checks this flag and bails on drags.
 *  • Constraints are recomputed on resize so the button never escapes
 *    the viewport on phone-rotate / Chrome address-bar collapse / etc.
 *  • A short "long-press" hint shake on first mount nudges the user
 *    that it's draggable (Disabled when a stored position exists —
 *    they've used it before).
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Plus } from 'lucide-react';

const STORAGE_KEY = 'sniffy.adminFab.position.v1';

/** Button visual size in px — used for viewport clamping. */
const BTN = 56;
/** Distance below the top viewport edge we never let the button go above. */
const TOP_INSET    = 64;
/** Distance above the bottom viewport edge we keep clear so the FAB never
 *  obscures the bottom-tab bar (mobile: ~68px tab bar + safe area). */
const BOTTOM_INSET = 88;
/** Pixels the pointer must travel for us to call the gesture a "drag". */
const DRAG_THRESHOLD = 6;

interface StoredPos { x: number; y: number; }

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function loadStoredPos(): StoredPos | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') return parsed;
  } catch { /* ignore corrupt JSON */ }
  return null;
}

/** Default position — bottom-right of the viewport, sitting just above the
 *  mobile bottom tab bar.  Matches the spot the user circled. */
function defaultPos(): StoredPos {
  if (typeof window === 'undefined') return { x: 0, y: 0 };
  return {
    x: window.innerWidth  - BTN - 16,
    y: window.innerHeight - BTN - BOTTOM_INSET - 24,
  };
}

interface Props {
  onClick: () => void;
}

export default function DraggableAddSessionFAB({ onClick }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Whether the user has dragged enough during the current gesture
  // for us to NOT treat the lift as a tap.
  const draggedRef = useRef(false);

  // Hold a stored-position flag for the first-mount hint.
  const [hasStoredPos, setHasStoredPos] = useState(false);

  // Initialise position on mount.  Doing this in an effect (rather than
  // useState initial) means it's safe under SSR + we can re-clamp if the
  // stored position was made on a bigger viewport (e.g. desktop → mobile).
  useEffect(() => {
    const stored = loadStoredPos();
    setHasStoredPos(!!stored);
    const init = stored ?? defaultPos();
    const clamped = clampToViewport(init);
    x.set(clamped.x);
    y.set(clamped.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-clamp whenever the viewport changes (resize / orientation).
  useEffect(() => {
    function onResize() {
      const next = clampToViewport({ x: x.get(), y: y.get() });
      x.set(next.x);
      y.set(next.y);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clampToViewport(p: StoredPos): StoredPos {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      x: clamp(p.x, 8,            w - BTN - 8),
      y: clamp(p.y, TOP_INSET,    h - BTN - BOTTOM_INSET),
    };
  }

  function persist(p: StoredPos) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
    catch { /* localStorage may be disabled — non-fatal */ }
  }

  return (
    <motion.button
      type="button"
      aria-label="Add session"
      drag
      dragMomentum={false}
      // The button is fixed at (0,0) and translated by motion values, so
      // we don't need separate `dragConstraints` — we clamp manually on
      // drag end below.  This is simpler than wiring up a ref-based
      // constraint container that has to match the viewport.
      style={{
        position: 'fixed',
        top:  0,
        left: 0,
        x,
        y,
        zIndex: 45,                       // above content (z-30/40), below modals (z-50)
        touchAction: 'none',              // prevent the browser from interpreting the drag as a scroll
      }}
      onPointerDown={() => { draggedRef.current = false; }}
      onDrag={(_, info) => {
        if (Math.abs(info.offset.x) > DRAG_THRESHOLD ||
            Math.abs(info.offset.y) > DRAG_THRESHOLD) {
          draggedRef.current = true;
        }
      }}
      onDragEnd={() => {
        // Clamp into viewport — Framer lets you drag outside our constraints
        // momentarily; this is where we snap it back.
        const next = clampToViewport({ x: x.get(), y: y.get() });
        x.set(next.x);
        y.set(next.y);
        persist(next);
      }}
      onClick={() => {
        // If the gesture was a drag, swallow the synthetic click.  The flag
        // is reset on the next pointer-down.
        if (draggedRef.current) return;
        onClick();
      }}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      // Subtle pulse on first appearance — only when there's no stored
      // position (i.e. the user hasn't seen it before).  Acts as a hint
      // without being annoying on every page load.
      initial={hasStoredPos
        ? { scale: 1, opacity: 1 }
        : { scale: 0.7, opacity: 0 }}
      animate={hasStoredPos
        ? { scale: 1, opacity: 1 }
        : { scale: [0.7, 1.08, 1], opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="select-none flex items-center justify-center rounded-full text-white cursor-grab active:cursor-grabbing"
    >
      <span
        className="flex items-center justify-center rounded-full"
        style={{
          width:  BTN,
          height: BTN,
          background: 'linear-gradient(145deg, #f6ac0a 0%, #d98b00 100%)',
          boxShadow: '0 8px 22px rgba(214,138,0,0.45), 0 2px 8px rgba(0,0,0,0.15)',
          border: '3px solid white',
        }}
      >
        <Plus size={26} strokeWidth={2.6}/>
      </span>
    </motion.button>
  );
}
