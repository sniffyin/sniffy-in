// components/FloatingVideo.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, Maximize2, Minimize2 } from "lucide-react";

type Pos = { x: number; y: number };

const STORAGE_KEY = "floating-video-pos";

export default function FloatingVideo({
  videoSrc = "/Pomeranian Dog Grooming.mp4",
  startOpen = true,
  muted = true,
}: {
  videoSrc?: string;
  startOpen?: boolean;
  muted?: boolean;
}) {
  // base sizes (adjust if you want different default size)
  const portraitW = 120; // collapsed width (portrait)
  const portraitH = Math.round(portraitW * (16 / 9)); // 9:16 visual
  const expandedW = 180;
  const expandedH = Math.round(expandedW * (16 / 9));

  // padding from edges when snapping to corner on first load
  const PADDING = 20; // <-- change this to increase/decrease "healthy padding"

  const [open, setOpen] = useState(startOpen);
  const [expanded, setExpanded] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // store pos at drag start so offset calculations are stable
  const dragStartRef = useRef<Pos | null>(null);

  // ---- SNAP ANIMATION TWEAK ----
  // Change these to make snapping snappier or softer:
  const snapTransition = { type: "spring" as const, stiffness: 260, damping: 28 };

  // compute current width/height from expanded (moved up so hooks can use them)
  const width = expanded ? expandedW : portraitW;
  const height = expanded ? expandedH : portraitH;

  // helper: clamp pos to viewport
  const clampPos = (x: number, y: number, w: number, h: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const minX = PADDING;
    const minY = PADDING;
    const maxX = Math.max(minX, vw - w - PADDING);
    const maxY = Math.max(minY, vh - h - PADDING);
    return { x: Math.min(maxX, Math.max(minX, x)), y: Math.min(maxY, Math.max(minY, y)) };
  };

  // snap helper that clamps then snaps and updates state (motion will animate)
  const snapToEdges = (rawX: number, rawY: number, w: number, h: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // ensure candidate is inside viewport first
    const clamped = clampPos(rawX, rawY, w, h);

    // distances to edges
    const distLeft = Math.abs(clamped.x - PADDING);
    const distRight = Math.abs((vw - w - PADDING) - clamped.x);
    const snapX = distLeft <= distRight ? PADDING : vw - w - PADDING;

    const distTop = Math.abs(clamped.y - PADDING);
    const distBottom = Math.abs((vh - h - PADDING) - clamped.y);
    const snapY = distTop <= distBottom ? PADDING : vh - h - PADDING;

    // setPos will trigger motion.animate and use snapTransition
    setPos({ x: snapX, y: snapY });
  };

  // initialize position: ALWAYS set to bottom-right with padding on load/reload
  useEffect(() => {
    if (typeof window === "undefined") return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const initialX = Math.max(PADDING, vw - width - PADDING);
    const initialY = Math.max(PADDING, vh - height - PADDING);
    setPos({ x: initialX, y: initialY });
    // `width` and `height` come from expanded; we want to re-run if expanded changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  // handle window resize: keep element visible & snapped
  useEffect(() => {
    // hook declared unconditionally; guard inside
    const onResize = () => {
      if (!pos) return;
      const clamped = clampPos(pos.x, pos.y, width, height);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const distLeft = Math.abs(clamped.x - PADDING);
      const distRight = Math.abs((vw - width - PADDING) - clamped.x);
      const snapX = distLeft <= distRight ? PADDING : vw - width - PADDING;
      const distTop = Math.abs(clamped.y - PADDING);
      const distBottom = Math.abs((vh - height - PADDING) - clamped.y);
      const snapY = distTop <= distBottom ? PADDING : vh - height - PADDING;
      setPos({ x: snapX, y: snapY });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, expanded]);

  // autoplay attempt
  useEffect(() => {
    if (!open || !videoRef.current) return;
    const v = videoRef.current;
    v.muted = muted;
    v.loop = true;
    v.playsInline = true;
    v.play().catch(() => {
      /* autoplay blocked — user can start manually */
    });
  }, [open, muted]);

  // --- all hooks are now declared above the early return ---
  if (!pos) return null; // wait until position initialized

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          // make this node BOTH fixed-positioned and draggable (so transforms don't get out of sync)
          drag
          dragMomentum={false}
          dragElastic={0}
          onDragStart={() => {
            // capture current pos as drag start base
            dragStartRef.current = pos;
          }}
          onDragEnd={(_, info: PanInfo) => {
            const start = dragStartRef.current ?? pos ?? { x: 0, y: 0 };
            const newLeft = start.x + (info.offset?.x ?? 0);
            const newTop = start.y + (info.offset?.y ?? 0);

            // clamp then snap (snapToEdges will update state & trigger animation)
            const clamped = clampPos(newLeft, newTop, width, height);
            snapToEdges(clamped.x, clamped.y, width, height);

            // clear start ref
            dragStartRef.current = null;
          }}
          // animate left/top so we get a smooth slide when snapping
          animate={{ left: pos.x, top: pos.y }}
          initial={false}
          transition={snapTransition}
          style={{
            zIndex: 9999,
            position: "fixed",
            left: pos.x,
            top: pos.y,
            width,
            height,
            touchAction: "none",
            display: "block",
            cursor: "grab",
          }}
          whileTap={{ cursor: "grabbing" }}
          className="rounded-2xl overflow-hidden shadow-2xl bg-black"
        >
          <div style={{ position: "relative", width: "100%", height: "100%", background: "#000" }}>
            <video
              ref={videoRef}
              src={videoSrc}
              muted={muted}
              autoPlay
              loop
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />

            {/* Controls (top-right): expand/shrink + close */}
            <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 8, zIndex: 3 }}>
              <button
                onClick={() =>
                  setExpanded((s) => {
                    const next = !s;
                    // recalc pos to keep player visible after size change and keep it snapped to border
                    const vw = window.innerWidth;
                    const vh = window.innerHeight;
                    const newW = next ? expandedW : portraitW;
                    const newH = next ? expandedH : portraitH;

                    // Use current pos as basis and clamp, then snap based on current proximity
                    const candidateLeft = Math.min(pos.x, vw - newW - PADDING);
                    const candidateTop = Math.min(pos.y, vh - newH - PADDING);

                    snapToEdges(candidateLeft, candidateTop, newW, newH);

                    return next;
                  })
                }
                aria-label={expanded ? "Shrink" : "Expand"}
                className="bg-black/40 hover:bg-black/50 text-white p-1 rounded-md"
              >
                {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="bg-black/40 hover:bg-black/50 text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
