import { useState, useRef, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

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
    <div className="flex flex-col gap-1.5 sm:gap-2.5">
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/5] sm:aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden select-none cursor-ew-resize shadow-md sm:shadow-lg shadow-sniffy-purple/10 ring-1 ring-black/5"
        style={{ userSelect: 'none' }}
      >
        {/* Before */}
        <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" draggable={false} loading="lazy" decoding="async" />
        <span className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 bg-black/60 backdrop-blur-sm text-white text-[9px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
          BEFORE
        </span>

        {/* After */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" draggable={false} loading="lazy" decoding="async" />
          <span className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-[9px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
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
          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white shadow-lg flex items-center justify-center transition-transform ${dragging ? 'scale-110' : 'scale-100'}`}>
            <svg viewBox="0 0 18 18" fill="none" className="w-3 h-3 sm:w-[15px] sm:h-[15px]">
              <path d="M6 4L2 9L6 14" stroke="#451a8b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 4L16 9L12 14" stroke="#451a8b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Label */}
      <span className="mx-auto inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-sniffy-purple/5 ring-1 ring-sniffy-purple/10 px-2 sm:px-3 py-0.5 text-[10px] sm:text-xs font-bold text-sniffy-purple">
        🐾 {label}
      </span>
    </div>
  );
}

export default function BeforeAfterSlider() {
  return (
    <section className="py-6 md:py-12 px-4 bg-gradient-to-b from-white via-purple-50/40 to-white">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-4 md:mb-8">
          <p className="text-[10px] md:text-[11px] uppercase tracking-widest text-sniffy-purple font-bold mb-1">Real results</p>
          <h2 className="text-xl md:text-3xl font-bold text-gray-900">
            Before & After{' '}
            <span className="text-sniffy-yellow">Transformation</span>
          </h2>
          <p className="mt-2 md:mt-3 inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-black/5 shadow-sm px-2.5 py-0.5 md:px-3 md:py-1 text-[11px] md:text-xs font-medium text-gray-500">
            <MoveHorizontal size={13} className="text-sniffy-purple" />
            Drag the slider to compare
          </p>
        </div>

        {/* Sliders grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-5">
          {pairs.map((pair) => (
            <SliderCard key={pair.label} {...pair} />
          ))}
        </div>

      </div>
    </section>
  );
}
