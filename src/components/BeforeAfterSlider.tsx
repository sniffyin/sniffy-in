import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const pairs = [
  {
    before: '/images/shihtzu-before.jpg',
    after:  '/images/shihtzu-after.jpg',
    label:  'Shih Tzu',
  },
  {
    before: '/images/chowchow-before.jpg',
    after:  '/images/chowchow-after.jpg',
    label:  'Chow Chow',
  },
];

function SliderCard({ before, after, label }: { before: string; after: string; label: string }) {
  const [pos, setPos]           = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef            = useRef<HTMLDivElement>(null);

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct  = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(2, Math.min(98, pct)));
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    const onMove = (ev: MouseEvent) => updatePos(ev.clientX);
    const onUp   = () => { setDragging(false); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setDragging(true);
    const onMove = (ev: TouchEvent) => updatePos(ev.touches[0].clientX);
    const onEnd  = () => { setDragging(false); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden select-none cursor-ew-resize"
        style={{ userSelect: 'none' }}
      >
        {/* Before */}
        <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
          BEFORE
        </span>

        {/* After */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
            AFTER
          </span>
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/90 z-10 pointer-events-none"
          style={{ left: `${pos}%` }}
        />

        {/* Drag handle */}
        <div
          className="absolute top-1/2 z-20 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${pos}%` }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <div className={`w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-transform ${dragging ? 'scale-110' : 'scale-100'}`}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M6 4L2 9L6 14" stroke="#451a8b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 4L16 9L12 14" stroke="#451a8b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Label */}
      <p className="text-center text-sm font-semibold text-gray-500">{label}</p>
    </div>
  );
}

export default function BeforeAfterSlider() {
  return (
    <section className="py-14 px-4 bg-white">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-2">Real results</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Before & After{' '}
            <span className="text-sniffy-yellow">Transformation</span>
          </h2>
          <p className="text-gray-400 text-sm mt-3">Drag the slider to compare</p>
        </motion.div>

        {/* Sliders grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {pairs.map((pair) => (
            <SliderCard key={pair.label} {...pair} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
