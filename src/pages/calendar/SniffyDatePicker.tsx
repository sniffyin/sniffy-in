/**
 * SniffyDatePicker.tsx — shared modern date picker.
 *
 * Originally lived inside admin/SessionFormModal.tsx; lifted out so the
 * Apply-Leave modal in the calendar tabs can use the same look & feel.
 *
 * Same UI exactly: pill trigger → animated dropdown with purple-gradient
 * month-nav header → 7-col day grid → "Today" footer shortcut.
 *
 * Value is a yyyy-mm-dd string ("" while empty).
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const DAY_LABELS  = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const MONTHS_LONG = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const defaultInputCls = `w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800
  bg-white focus:border-sniffy-purple focus:ring-2 focus:ring-purple-100 outline-none transition`;

export interface SniffyDatePickerProps {
  value: string;                              // yyyy-mm-dd
  onChange: (v: string) => void;
  inputClassName?: string;                    // override the trigger styling
  placeholder?: string;
  /** Earliest allowable date (yyyy-mm-dd). Days before this become disabled. */
  min?: string;
  /** Latest allowable date (yyyy-mm-dd). Days after this become disabled. */
  max?: string;
  /** Optional dropdown alignment. Default: left edge. */
  align?: 'left' | 'right';
}

export default function SniffyDatePicker({
  value,
  onChange,
  inputClassName = defaultInputCls,
  placeholder = 'Pick a date',
  min,
  max,
  // `align` kept in the props for backward-compat with existing call
  // sites — was used to pick left/right anchoring on the legacy
  // absolute-anchored desktop dropdown.  Now that we always portal
  // and centre, alignment is irrelevant, so the prop is intentionally
  // accepted-and-ignored here.
  align: _align = 'left',
}: SniffyDatePickerProps) {
  void _align;
  const [open, setOpen] = useState(false);
  const wrapRef         = useRef<HTMLDivElement>(null);
  // Separate ref for the dropdown panel — we portal the panel out to
  // document.body to escape any transformed ancestor (framer-motion
  // wrappers, etc.) that would otherwise hijack `position: fixed`
  // and pin the panel to the wrong containing block.  wrapRef can no
  // longer see the panel via .contains(), so this ref is what the
  // click-outside guard checks.
  const dropdownRef     = useRef<HTMLDivElement>(null);
  const today           = new Date();

  const parsed = value ? new Date(value + 'T00:00:00') : null;
  const [viewYear,  setViewYear]  = useState(parsed?.getFullYear()  ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth()     ?? today.getMonth());

  useEffect(() => {
    if (parsed) { setViewYear(parsed.getFullYear()); setViewMonth(parsed.getMonth()); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    function outside(e: MouseEvent) {
      const target = e.target as Node;
      const inWrap     = wrapRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inWrap && !inDropdown) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [open]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }
  function selectDay(day: number) {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (min && iso < min) return;
    if (max && iso > max) return;
    onChange(iso);
    setOpen(false);
  }
  function goToday() {
    const iso = today.toISOString().slice(0, 10);
    if (min && iso < min) return;
    if (max && iso > max) return;
    onChange(iso);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setOpen(false);
  }

  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isoFor = (d: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const isDisabled = (d: number) => {
    const iso = isoFor(d);
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  };
  const isSel   = (d: number) => !!parsed && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth && parsed.getDate() === d;
  const isToday = (d: number) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;

  const displayLabel = parsed
    ? parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return (
    <div className="relative" ref={wrapRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`${inputClassName} flex items-center justify-between gap-2 text-left ${
          open ? 'border-sniffy-purple ring-1 ring-sniffy-purple/20' : ''
        }`}
      >
        <span className={displayLabel ? 'text-gray-800 font-medium' : 'text-gray-300'}>
          {displayLabel || placeholder}
        </span>
        <Calendar size={15} className={`flex-shrink-0 transition-colors ${open ? 'text-sniffy-purple' : 'text-gray-400'}`}/>
      </button>

      {/* Always portal the dropdown to document.body and render it
          as a centered overlay (with a dim backdrop), regardless of
          viewport.  Why no inline-anchored desktop variant any more?
          Two reasons:
          1. The calendar tab — the worst caller — has framer-motion
             wrappers throughout, so `position: fixed` gets pinned to
             the wrong containing block.  Portalling fixes that.
          2. Mobile-vs-desktop detection via matchMedia turned out
             unreliable in some DevTools / hydration timing cases,
             leaving the desktop branch active on phones and
             overflowing the screen edge.
          A modal-style picker works fine on both screen sizes (cf.
          Notion, Linear, Cal.com).  `align` is no longer needed but
          we keep it in the prop type for backward-compat with
          existing call sites. */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit   ={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-[2px]"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              {/* Two layers: an outer flex container handles centering
                  (via flex items-center justify-center on inset-0), and
                  an inner motion.div handles the open/close animation.
                  Why split?  Framer-motion writes its own `transform:
                  scale(...)` onto the animated element, which would
                  clobber Tailwind's `-translate-x-1/2 -translate-y-1/2`
                  centering utilities — leaving the picker pinned to
                  the top-left of (50%,50%) instead of *around* it.
                  Keeping positioning + animation on separate elements
                  sidesteps the conflict. */}
              <div
                ref={dropdownRef}
                className="fixed inset-0 z-[91] flex items-center justify-center p-4 pointer-events-none"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1    }}
                  exit   ={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="pointer-events-auto w-[300px] max-w-full bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
                >
                {/* Month nav — purple gradient */}
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-sniffy-purple to-purple-800">
                  <button type="button" onClick={prevMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 transition text-white active:scale-95">
                    <ChevronLeft size={15}/>
                  </button>
                  <span className="text-sm font-extrabold text-white tracking-wide select-none">
                    {MONTHS_LONG[viewMonth]} {viewYear}
                  </span>
                  <button type="button" onClick={nextMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 transition text-white active:scale-95">
                    <ChevronRight size={15}/>
                  </button>
                </div>

                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 px-3 pt-3 pb-1">
                  {DAY_LABELS.map(d => (
                    <div key={d} className="text-center text-[11px] font-extrabold tracking-widest text-gray-400 select-none">{d}</div>
                  ))}
                </div>

                {/* Day grid */}
                <div className="grid grid-cols-7 px-3 pb-2 gap-y-1">
                  {cells.map((day, i) => (
                    <div key={i} className="flex items-center justify-center h-10">
                      {day ? (
                        <button
                          type="button"
                          onClick={() => selectDay(day)}
                          disabled={isDisabled(day)}
                          className={`w-9 h-9 rounded-full text-sm font-semibold transition-all active:scale-90 select-none ${
                            isDisabled(day)
                              ? 'text-gray-300 cursor-not-allowed'
                              : isSel(day)
                              ? 'bg-sniffy-purple text-white shadow-md'
                              : isToday(day)
                              ? 'bg-sniffy-yellow/20 text-sniffy-purple ring-2 ring-sniffy-yellow font-extrabold'
                              : 'text-gray-700 hover:bg-purple-50 hover:text-sniffy-purple'
                          }`}
                        >
                          {day}
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Today shortcut */}
                <div className="px-3 pb-3 pt-1 border-t border-gray-100">
                  <button type="button" onClick={goToday}
                    className="w-full py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all active:scale-[0.98]"
                    style={{ background: 'rgba(246,172,10,0.12)', color: '#92700a' }}
                  >
                    ✦ Today
                  </button>
                </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
