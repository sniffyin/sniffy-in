/**
 * admin/SessionFiltersSheet.tsx
 *
 * Mobile-first session filters drawer.
 *
 * Pattern:
 *   • Mobile  (< sm) → full-width bottom sheet, slides up.
 *   • Desktop (≥ sm) → right-side drawer, slides in.
 *
 * UX shape:
 *   1. Sticky header (title + close + active-count chip).
 *   2. Scrollable body: collapsible sections, each row shows
 *      "Group   3 selected   ›" → tap to expand inline → chips.
 *      Several open at once is fine (user may want to scan).
 *   3. Sticky footer with Reset + "Apply (N)" — instant filtering is
 *      OFF; changes are draft until Apply is tapped.
 *
 * State model:
 *   The sheet keeps its own DRAFT copy of filters seeded from `value`
 *   whenever it opens. Apply commits via `onApply(draft)`; Close
 *   discards.  Active pills outside the sheet (in SessionsTab) let the
 *   user remove filters without re-opening the sheet.
 */

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronDown, Check, Search as SearchIcon,
  Sun, Sunset, Moon, Clock, IndianRupee, Heart, Image as ImageIcon,
  MapPin, FileText, Sparkles, Star, Stethoscope, Tag, Layers,
  PawPrint, Users, CreditCard, Wallet, Calendar, AlertCircle,
} from 'lucide-react';
import {
  SessionStatus, PaymentCollectedBy,
  PAYMENT_COLLECTED_BY_LABELS, PACKAGES, ADD_ONS,
  DOG_BREEDS, CAT_BREEDS,
} from './types';
import CustomerPickerChip from './CustomerPickerChip';
import SniffyDatePicker from '../calendar/SniffyDatePicker';

// ─── Shape ────────────────────────────────────────────────────

export type TriState = '' | 'yes' | 'no';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
export type PaymentStatusFilter = 'unpaid' | 'collected' | 'paid';
export type PaymentModeFilter = 'cash' | 'online';
export type NextDueBucket = 'overdue' | 'today' | '7d' | '30d' | 'has' | 'none';
export type RatingBucket = '5' | '4' | '3orLess' | 'unrated';

export interface SessionFilters {
  search: string;

  // When
  timeframe: '' | 'upcoming' | 'past';
  month: string;
  dateFrom: string;
  dateTo: string;
  dayOfWeek: number[];
  timeOfDay: TimeOfDay[];

  // Status
  status: SessionStatus[];

  // Source
  source: string[];

  // Payment
  paymentCollectedBy: PaymentCollectedBy[];
  paymentStatus: PaymentStatusFilter[];
  paymentMode: PaymentModeFilter[];
  paymentVerified: TriState;

  // Team
  groomer: string[];

  // Pet
  petType: ('dog' | 'cat')[];
  breeds: string[];
  hasMedical: TriState;

  // Service
  packages: string[];
  addOns: string[];

  // Amount
  amountMin: number | null;
  amountMax: number | null;
  hasTip: TriState;
  hasUpsell: TriState;

  // Next due
  nextDue: NextDueBucket[];

  // Quality
  rating: RatingBucket[];
  reviewTaken: TriState;
  arrivalOnTime: TriState;
  bonusPending: TriState;

  // Other
  hasNotes: TriState;
  hasCompletionPhoto: TriState;
  hasGps: TriState;
  customerId: string | null;
  customerLabel: string;
}

export const EMPTY_SESSION_FILTERS: SessionFilters = {
  search: '',
  timeframe: '',
  month: '',
  dateFrom: '',
  dateTo: '',
  dayOfWeek: [],
  timeOfDay: [],
  status: [],
  source: [],
  paymentCollectedBy: [],
  paymentStatus: [],
  paymentMode: [],
  paymentVerified: '',
  groomer: [],
  petType: [],
  breeds: [],
  hasMedical: '',
  packages: [],
  addOns: [],
  amountMin: null,
  amountMax: null,
  hasTip: '',
  hasUpsell: '',
  nextDue: [],
  rating: [],
  reviewTaken: '',
  arrivalOnTime: '',
  bonusPending: '',
  hasNotes: '',
  hasCompletionPhoto: '',
  hasGps: '',
  customerId: null,
  customerLabel: '',
};

/** Count active dimensions, ignoring `search` (which lives outside the sheet).
 *  `timeframe` is set via the Upcoming/Past subtabs above the filter
 *  bar (not inside the sheet), but still counts toward the overall
 *  active total so the badge on the trigger reflects everything that
 *  is narrowing the list.  `month` and `dayOfWeek` are no longer
 *  surfaced anywhere (date-range covers them); we keep the fields in
 *  the interface for back-compat but they always count as 0. */
export function countActiveFilters(f: SessionFilters): number {
  let n = 0;
  if (f.timeframe) n++;
  if (f.dateFrom || f.dateTo) n++;
  if (f.timeOfDay.length) n++;
  // month & dayOfWeek intentionally not counted — see header comment.
  if (f.status.length) n++;
  if (f.source.length) n++;
  if (f.paymentCollectedBy.length) n++;
  if (f.paymentStatus.length) n++;
  if (f.paymentMode.length) n++;
  if (f.paymentVerified) n++;
  if (f.groomer.length) n++;
  if (f.petType.length) n++;
  if (f.breeds.length) n++;
  if (f.hasMedical) n++;
  if (f.packages.length) n++;
  if (f.addOns.length) n++;
  if (f.amountMin != null || f.amountMax != null) n++;
  if (f.hasTip) n++;
  if (f.hasUpsell) n++;
  if (f.nextDue.length) n++;
  if (f.rating.length) n++;
  if (f.reviewTaken) n++;
  if (f.arrivalOnTime) n++;
  if (f.bonusPending) n++;
  if (f.hasNotes) n++;
  if (f.hasCompletionPhoto) n++;
  if (f.hasGps) n++;
  if (f.customerId) n++;
  return n;
}

// ─── Static option lists (exported — also consumed by the
//     active-pills row in SessionsTab so labels stay in one place) ────

export const STATUS_OPTIONS: { value: SessionStatus; label: string; dot: string }[] = [
  { value: 'lead',             label: 'Lead',             dot: '#FFC107' },
  { value: 'scheduled',        label: 'Scheduled',        dot: '#42A5F5' },
  { value: 'groomer_assigned', label: 'Groomer Assigned', dot: '#7C3AED' },
  { value: 'grooming_done',    label: 'Grooming Done',    dot: '#E07B18' },
  { value: 'completed',        label: 'Completed',        dot: '#66BB6A' },
  { value: 'cancelled',        label: 'Cancelled',        dot: '#EF5350' },
];

export const SOURCE_OPTIONS_INTERNAL = [
  { value: 'sniffy',          label: 'Sniffy App'      },
  { value: 'direct_call',     label: 'Direct Call'     },
  { value: 'website_booking', label: 'Website Booking' },
  { value: 'instagram_ad',    label: 'Instagram Ad'    },
  { value: 'facebook_ad',     label: 'Facebook Ad'     },
];
export const SOURCE_OPTIONS_EXTERNAL = [
  { value: 'woofly',     label: 'Woofly'     },
  { value: 'paw_space',  label: 'Paw Space'  },
  { value: 'oh_my_pet',  label: 'Oh My Pet'  },
  { value: 'global_pet', label: 'Global Pet' },
  { value: 'sidharth',   label: 'Sidharth'   },
  { value: 'other',      label: 'Other'      },
];
export const ALL_SOURCE_OPTIONS = [...SOURCE_OPTIONS_INTERNAL, ...SOURCE_OPTIONS_EXTERNAL];

export const PAYMENT_COLLECTED_BY_OPTIONS: { value: PaymentCollectedBy; label: string; dot: string }[] = [
  { value: 'sniffy',       label: PAYMENT_COLLECTED_BY_LABELS.sniffy,       dot: '#7C3AED' },
  { value: 'vendor',       label: PAYMENT_COLLECTED_BY_LABELS.vendor,       dot: '#3B82F6' },
  { value: 'groomer_cash', label: PAYMENT_COLLECTED_BY_LABELS.groomer_cash, dot: '#F59E0B' },
];

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatusFilter; label: string; dot: string }[] = [
  { value: 'unpaid',    label: 'Unpaid',    dot: '#9CA3AF' },
  { value: 'collected', label: 'Collected', dot: '#F59E0B' },
  { value: 'paid',      label: 'Paid',      dot: '#10B981' },
];

export const DAY_OF_WEEK_OPTIONS = [
  { value: 1, label: 'Mon' }, { value: 2, label: 'Tue' }, { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' }, { value: 5, label: 'Fri' }, { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

export const TIME_OF_DAY_OPTIONS: { value: TimeOfDay; label: string; sub: string; Icon: typeof Sun }[] = [
  { value: 'morning',   label: 'Morning',   sub: '6 – 12',  Icon: Sun    },
  { value: 'afternoon', label: 'Afternoon', sub: '12 – 17', Icon: Sunset },
  { value: 'evening',   label: 'Evening',   sub: '17 – 22', Icon: Moon   },
];

export const NEXT_DUE_BUCKETS: { value: NextDueBucket; label: string; tone: string }[] = [
  { value: 'overdue', label: 'Overdue',       tone: 'bg-red-50 text-red-700 border-red-200'         },
  { value: 'today',   label: 'Due today',     tone: 'bg-amber-50 text-amber-700 border-amber-200'   },
  { value: '7d',      label: 'Next 7 days',   tone: 'bg-amber-50 text-amber-700 border-amber-200'   },
  { value: '30d',     label: 'Next 30 days',  tone: ''                                              },
  { value: 'has',     label: 'Has follow-up', tone: ''                                              },
  { value: 'none',    label: 'No follow-up',  tone: ''                                              },
];

export const RATING_BUCKETS: { value: RatingBucket; label: string }[] = [
  { value: '5',        label: '★★★★★ Only'  },
  { value: '4',        label: '★★★★ +'      },
  { value: '3orLess',  label: '≤ 3★ (low)'  },
  { value: 'unrated',  label: 'Unrated'     },
];

// ─── Generic chip ─────────────────────────────────────────────

function Chip({
  label, active, onClick, dot, tone,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  dot?: string;
  tone?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 px-3.5 rounded-full border text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
        active
          ? 'bg-sniffy-purple text-white border-sniffy-purple shadow-sm'
          : tone || 'bg-white text-gray-700 border-gray-200 hover:border-sniffy-purple hover:text-sniffy-purple'
      }`}
    >
      {dot && (
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: active ? 'rgba(255,255,255,0.85)' : dot }}/>
      )}
      {label}
      {active && <Check size={11} className="ml-0.5" strokeWidth={3}/>}
    </button>
  );
}

// ─── Tri-state row (Any / Yes / No) ───────────────────────────

function TriRow({ value, onChange, yesLabel = 'Yes', noLabel = 'No' }: {
  value: TriState; onChange: (v: TriState) => void;
  yesLabel?: string; noLabel?: string;
}) {
  return (
    <div className="flex gap-2">
      <Chip label="Any" active={value === ''}    onClick={() => onChange('')}/>
      <Chip label={yesLabel} active={value === 'yes'} onClick={() => onChange(value === 'yes' ? '' : 'yes')}/>
      <Chip label={noLabel}  active={value === 'no'}  onClick={() => onChange(value === 'no'  ? '' : 'no')}/>
    </div>
  );
}

// ─── Section (collapsible) ────────────────────────────────────

function Section({
  id, title, Icon, activeCount, open, onToggle, children,
}: {
  id: string;
  title: string;
  Icon: typeof Sun;
  activeCount: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  // Visual structure when OPEN:
  //   ┌──────────────────────┐  ← header (white, bold)
  //   │ 🏷️  Status        ▴ │
  //   ├──────────────────────┤  ← inner divider
  //   │░░░░░░░░░░░░░░░░░░░░░░│
  //   │░░ chips / controls ░░│  ← tinted body (bg-gray-50)
  //   │░░░░░░░░░░░░░░░░░░░░░░│
  //   └──────────────────────┘  ← thicker between-section divider
  //
  // The tinted body makes the white header read clearly as a "label
  // bar" above its panel — when 3–4 sections are open you can still
  // scan headers without losing track of which chips belong to which.
  return (
    <div className={`border-b border-gray-200 last:border-b-0 ${open ? 'bg-gray-50' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`sec-${id}`}
        className={`w-full flex items-center gap-3 py-3.5 px-4 transition ${
          open ? 'bg-white border-b border-gray-100' : 'bg-white active:bg-gray-50'
        }`}
      >
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
          activeCount > 0
            ? 'bg-sniffy-yellow/25 text-amber-800 ring-1 ring-sniffy-yellow/50'
            : 'bg-gray-100 text-gray-500'
        }`}>
          <Icon size={16}/>
        </span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-bold text-gray-900">{title}</span>
          {activeCount > 0 && (
            <span className="block text-[11px] font-bold text-amber-700 mt-0.5">
              {activeCount} active
            </span>
          )}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`sec-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Breed picker (search + multi-select) ─────────────────────

function BreedPicker({
  petType, value, onChange,
}: {
  petType: ('dog' | 'cat')[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [q, setQ] = useState('');
  const pool = useMemo(() => {
    const types = petType.length ? petType : (['dog', 'cat'] as const);
    const all = new Set<string>();
    types.forEach(t => (t === 'dog' ? DOG_BREEDS : CAT_BREEDS).forEach(b => all.add(b)));
    return Array.from(all).sort();
  }, [petType]);
  const filtered = pool.filter(b => b.toLowerCase().includes(q.toLowerCase()));

  function toggle(b: string) {
    onChange(value.includes(b) ? value.filter(x => x !== b) : [...value, b]);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <SearchIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input
          type="text"
          placeholder={`Search ${pool.length} breeds…`}
          value={q}
          onChange={e => setQ(e.target.value)}
          className="w-full pl-8 pr-3 h-9 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-sniffy-purple focus:ring-1 focus:ring-sniffy-purple/20"
        />
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(b => (
            <button
              key={b}
              type="button"
              onClick={() => toggle(b)}
              className="flex items-center gap-1 h-7 px-2.5 rounded-full bg-sniffy-purple text-white text-xs font-semibold"
            >
              {b}
              <X size={10}/>
            </button>
          ))}
        </div>
      )}
      <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-100 bg-white">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 italic px-3 py-4 text-center">No breeds match "{q}"</p>
        ) : (
          filtered.map(b => {
            const on = value.includes(b);
            return (
              <button
                key={b}
                type="button"
                onClick={() => toggle(b)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition ${
                  on ? 'bg-sniffy-purple/5 text-sniffy-purple font-semibold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {b}
                {on && <Check size={14} strokeWidth={3} className="text-sniffy-purple"/>}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Amount range (two inputs) ────────────────────────────────

function AmountRange({
  min, max, onChange,
}: {
  min: number | null;
  max: number | null;
  onChange: (next: { min: number | null; max: number | null }) => void;
}) {
  const PRESETS = [
    { label: '< ₹500',         min: null, max: 500   },
    { label: '₹500 – ₹1k',     min: 500,  max: 1000  },
    { label: '₹1k – ₹2k',      min: 1000, max: 2000  },
    { label: '₹2k – ₹5k',      min: 2000, max: 5000  },
    { label: '≥ ₹5k',          min: 5000, max: null  },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => {
          const on = p.min === min && p.max === max;
          return (
            <Chip
              key={p.label}
              label={p.label}
              active={on}
              onClick={() => on ? onChange({ min: null, max: null }) : onChange({ min: p.min, max: p.max })}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1 px-3 h-10 rounded-xl border border-gray-200 bg-white">
          <IndianRupee size={13} className="text-gray-400"/>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={min ?? ''}
            onChange={e => onChange({ min: e.target.value === '' ? null : Number(e.target.value), max })}
            className="flex-1 min-w-0 text-sm bg-transparent focus:outline-none"
          />
        </div>
        <span className="text-xs text-gray-400 font-semibold">to</span>
        <div className="flex items-center gap-1.5 flex-1 px-3 h-10 rounded-xl border border-gray-200 bg-white">
          <IndianRupee size={13} className="text-gray-400"/>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={max ?? ''}
            onChange={e => onChange({ min, max: e.target.value === '' ? null : Number(e.target.value) })}
            className="flex-1 min-w-0 text-sm bg-transparent focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Date range (two date inputs + quick presets) ─────────────

function DateRange({
  from, to, onChange,
}: {
  from: string; to: string;
  onChange: (next: { from: string; to: string }) => void;
}) {
  const today = new Date();
  function iso(d: Date) { return d.toISOString().slice(0, 10); }
  function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

  const PRESETS = [
    { label: 'Today',       from: iso(today),               to: iso(today)              },
    { label: 'Last 7d',     from: iso(addDays(today, -6)),  to: iso(today)              },
    { label: 'Last 30d',    from: iso(addDays(today, -29)), to: iso(today)              },
    { label: 'Next 7d',     from: iso(today),               to: iso(addDays(today, 6))  },
    { label: 'Next 30d',    from: iso(today),               to: iso(addDays(today, 29)) },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => {
          const on = p.from === from && p.to === to;
          return (
            <Chip
              key={p.label}
              label={p.label}
              active={on}
              onClick={() => on ? onChange({ from: '', to: '' }) : onChange({ from: p.from, to: p.to })}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <SniffyDatePicker
            value={from}
            onChange={v => onChange({ from: v, to })}
            placeholder="From"
            // Don't let the user pick a "from" later than "to"
            // (would produce an empty result set).  Cleared "to"
            // imposes no upper bound.
            max={to || undefined}
          />
        </div>
        <span className="text-xs text-gray-400 font-semibold">to</span>
        <div className="flex-1 min-w-0">
          <SniffyDatePicker
            value={to}
            onChange={v => onChange({ from, to: v })}
            placeholder="To"
            min={from || undefined}
          />
        </div>
      </div>
    </div>
  );
}

// ─── The Sheet ────────────────────────────────────────────────

export interface GroomerOption {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'on_leave';
}

export default function SessionFiltersSheet({
  open, value, onApply, onClose, groomerOptions, resultCount,
}: {
  open: boolean;
  value: SessionFilters;
  onApply: (next: SessionFilters) => void;
  onClose: () => void;
  groomerOptions: GroomerOption[];
  resultCount: number | null;
}) {
  // Draft state — seeded each time the sheet opens.
  const [draft, setDraft] = useState<SessionFilters>(value);
  // Single-open accordion: only one section can be expanded at a
  // time.  Tapping a closed header collapses any other open one and
  // opens this one; tapping the open header closes it.  Keeps the
  // sheet scannable as a directory of categories rather than a wall
  // of chips.  `null` = nothing open.
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  // Lock body scroll while sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  function set<K extends keyof SessionFilters>(k: K, v: SessionFilters[K]) {
    setDraft(prev => ({ ...prev, [k]: v }));
  }
  function toggleInArray<T>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
  }
  function toggleSection(id: string) {
    setOpenSection(prev => (prev === id ? null : id));
  }
  function reset() {
    setDraft({ ...EMPTY_SESSION_FILTERS, search: draft.search });
  }
  function apply() {
    onApply(draft);
    onClose();
  }

  // Section active counts (for the right-side badge).
  const sc = useMemo(() => ({
    when: (draft.dateFrom || draft.dateTo ? 1 : 0) + (draft.timeOfDay.length ? 1 : 0),
    status: draft.status.length,
    source: draft.source.length,
    payment: draft.paymentCollectedBy.length + draft.paymentStatus.length +
             draft.paymentMode.length + (draft.paymentVerified ? 1 : 0),
    team: draft.groomer.length,
    pet: draft.petType.length + draft.breeds.length + (draft.hasMedical ? 1 : 0),
    service: draft.packages.length + draft.addOns.length,
    amount: (draft.amountMin != null || draft.amountMax != null ? 1 : 0) +
            (draft.hasTip ? 1 : 0) + (draft.hasUpsell ? 1 : 0),
    nextDue: draft.nextDue.length,
    quality: draft.rating.length + (draft.reviewTaken ? 1 : 0) +
             (draft.arrivalOnTime ? 1 : 0) + (draft.bonusPending ? 1 : 0),
    other: (draft.hasNotes ? 1 : 0) + (draft.hasCompletionPhoto ? 1 : 0) +
           (draft.hasGps ? 1 : 0) + (draft.customerId ? 1 : 0),
  }), [draft]);

  const draftCount = countActiveFilters(draft);
  const visibleGroomers = groomerOptions.filter(
    g => g.status === 'active' || draft.groomer.includes(g.name)
  );

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]"
          />

          {/* Sheet — bottom on mobile, right on desktop */}
          <motion.div
            // Slide-up on small screens, slide-in-right on sm+.
            // Two animations would need viewport detection; we use a
            // single y-axis slide that reads as natural on both because
            // the desktop drawer is anchored to the right edge with
            // inset-y-0 and width-clamped.
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="
              fixed z-[81] bg-white shadow-2xl flex flex-col
              inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl
              sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[440px] sm:max-h-none sm:rounded-t-none sm:rounded-l-3xl
            "
            role="dialog"
            aria-modal="true"
            aria-label="Session filters"
          >
            {/* Grabber (mobile only) */}
            <div className="sm:hidden flex justify-center pt-2 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300"/>
            </div>

            {/* Sticky header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
              <div className="flex-1">
                <h2 className="text-base font-extrabold text-gray-900">Filters</h2>
                {draftCount > 0 && (
                  <p className="text-[11px] text-amber-700 font-bold mt-0.5">
                    {draftCount} active · drafted
                  </p>
                )}
              </div>
              {draftCount > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500"
                aria-label="Close filters"
              >
                <X size={18}/>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">

              {/* WHEN — Quick (Upcoming/Past) lives as subtabs above
                  the filter bar already, so we don't duplicate it
                  here.  Month + Day-of-week dropped 2026-06-02
                  per product feedback — date-range presets cover
                  the same ground without two extra controls. */}
              <Section id="when" title="When" Icon={Calendar} activeCount={sc.when}
                       open={openSection === 'when'} onToggle={() => toggleSection('when')}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Date range</p>
                  <DateRange
                    from={draft.dateFrom} to={draft.dateTo}
                    onChange={({ from, to }) => setDraft(d => ({ ...d, dateFrom: from, dateTo: to }))}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Time of day</p>
                  <div className="flex flex-wrap gap-2">
                    {TIME_OF_DAY_OPTIONS.map(t => {
                      const on = draft.timeOfDay.includes(t.value);
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => set('timeOfDay', toggleInArray(draft.timeOfDay, t.value))}
                          className={`flex items-center gap-2 h-10 px-3.5 rounded-2xl border text-xs font-semibold transition-all ${
                            on
                              ? 'bg-sniffy-purple text-white border-sniffy-purple shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-sniffy-purple'
                          }`}
                        >
                          <t.Icon size={13}/>
                          <span>
                            <span className="block leading-tight">{t.label}</span>
                            <span className={`block text-[9px] leading-tight ${on ? 'text-white/80' : 'text-gray-400'}`}>{t.sub}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Section>

              {/* STATUS */}
              <Section id="status" title="Status" Icon={Tag} activeCount={sc.status}
                       open={openSection === 'status'} onToggle={() => toggleSection('status')}>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(o => (
                    <Chip
                      key={o.value}
                      label={o.label}
                      dot={o.dot}
                      active={draft.status.includes(o.value)}
                      onClick={() => set('status', toggleInArray(draft.status, o.value))}
                    />
                  ))}
                </div>
              </Section>

              {/* SOURCE */}
              <Section id="source" title="Source" Icon={Layers} activeCount={sc.source}
                       open={openSection === 'source'} onToggle={() => toggleSection('source')}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Internal</p>
                  <div className="flex flex-wrap gap-2">
                    {SOURCE_OPTIONS_INTERNAL.map(o => (
                      <Chip
                        key={o.value}
                        label={o.label}
                        active={draft.source.includes(o.value)}
                        onClick={() => set('source', toggleInArray(draft.source, o.value))}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">External</p>
                  <div className="flex flex-wrap gap-2">
                    {SOURCE_OPTIONS_EXTERNAL.map(o => (
                      <Chip
                        key={o.value}
                        label={o.label}
                        active={draft.source.includes(o.value)}
                        onClick={() => set('source', toggleInArray(draft.source, o.value))}
                      />
                    ))}
                  </div>
                </div>
              </Section>

              {/* PAYMENT */}
              <Section id="payment" title="Payment" Icon={CreditCard} activeCount={sc.payment}
                       open={openSection === 'payment'} onToggle={() => toggleSection('payment')}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Collected by</p>
                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_COLLECTED_BY_OPTIONS.map(o => (
                      <Chip
                        key={o.value}
                        label={o.label}
                        dot={o.dot}
                        active={draft.paymentCollectedBy.includes(o.value)}
                        onClick={() => set('paymentCollectedBy', toggleInArray(draft.paymentCollectedBy, o.value))}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Payment status</p>
                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_STATUS_OPTIONS.map(o => (
                      <Chip
                        key={o.value}
                        label={o.label}
                        dot={o.dot}
                        active={draft.paymentStatus.includes(o.value)}
                        onClick={() => set('paymentStatus', toggleInArray(draft.paymentStatus, o.value))}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Mode</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip label="💵 Cash"    active={draft.paymentMode.includes('cash')}   onClick={() => set('paymentMode', toggleInArray(draft.paymentMode, 'cash'))}/>
                    <Chip label="💳 Online"  active={draft.paymentMode.includes('online')} onClick={() => set('paymentMode', toggleInArray(draft.paymentMode, 'online'))}/>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Verified</p>
                  <TriRow value={draft.paymentVerified} onChange={v => set('paymentVerified', v)} yesLabel="Verified" noLabel="Unverified"/>
                </div>
              </Section>

              {/* TEAM */}
              <Section id="team" title="Groomer" Icon={Users} activeCount={sc.team}
                       open={openSection === 'team'} onToggle={() => toggleSection('team')}>
                {visibleGroomers.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No groomers available</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {visibleGroomers.map(g => (
                      <Chip
                        key={g.id}
                        label={g.status === 'active' ? g.name : `${g.name} · inactive`}
                        active={draft.groomer.includes(g.name)}
                        onClick={() => set('groomer', toggleInArray(draft.groomer, g.name))}
                      />
                    ))}
                  </div>
                )}
              </Section>

              {/* PET */}
              <Section id="pet" title="Pet" Icon={PawPrint} activeCount={sc.pet}
                       open={openSection === 'pet'} onToggle={() => toggleSection('pet')}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Type</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip label="🐶 Dog" active={draft.petType.includes('dog')} onClick={() => set('petType', toggleInArray(draft.petType, 'dog'))}/>
                    <Chip label="🐱 Cat" active={draft.petType.includes('cat')} onClick={() => set('petType', toggleInArray(draft.petType, 'cat'))}/>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Breed</p>
                  <BreedPicker
                    petType={draft.petType}
                    value={draft.breeds}
                    onChange={v => set('breeds', v)}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                    <Stethoscope size={11}/> Medical issues
                  </p>
                  <TriRow value={draft.hasMedical} onChange={v => set('hasMedical', v)} yesLabel="Has issues" noLabel="None"/>
                </div>
              </Section>

              {/* SERVICE */}
              <Section id="service" title="Service" Icon={Sparkles} activeCount={sc.service}
                       open={openSection === 'service'} onToggle={() => toggleSection('service')}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Package</p>
                  <div className="flex flex-wrap gap-2">
                    {PACKAGES.map(p => (
                      <Chip
                        key={p.label}
                        label={p.label}
                        active={draft.packages.includes(p.label)}
                        onClick={() => set('packages', toggleInArray(draft.packages, p.label))}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Add-ons</p>
                  <div className="flex flex-wrap gap-2">
                    {ADD_ONS.map(a => (
                      <Chip
                        key={a.label}
                        label={a.label}
                        active={draft.addOns.includes(a.label)}
                        onClick={() => set('addOns', toggleInArray(draft.addOns, a.label))}
                      />
                    ))}
                  </div>
                </div>
              </Section>

              {/* AMOUNT */}
              <Section id="amount" title="Amount" Icon={Wallet} activeCount={sc.amount}
                       open={openSection === 'amount'} onToggle={() => toggleSection('amount')}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Booking range</p>
                  <AmountRange
                    min={draft.amountMin}
                    max={draft.amountMax}
                    onChange={({ min, max }) => setDraft(d => ({ ...d, amountMin: min, amountMax: max }))}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Tip received</p>
                  <TriRow value={draft.hasTip} onChange={v => set('hasTip', v)} yesLabel="Tip > 0" noLabel="No tip"/>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Upsell on site</p>
                  <TriRow value={draft.hasUpsell} onChange={v => set('hasUpsell', v)} yesLabel="Upsell > 0" noLabel="No upsell"/>
                </div>
              </Section>

              {/* NEXT DUE */}
              <Section id="nextDue" title="Follow-up" Icon={Clock} activeCount={sc.nextDue}
                       open={openSection === 'nextDue'} onToggle={() => toggleSection('nextDue')}>
                <div className="flex flex-wrap gap-2">
                  {NEXT_DUE_BUCKETS.map(b => (
                    <Chip
                      key={b.value}
                      label={b.label}
                      tone={b.tone}
                      active={draft.nextDue.includes(b.value)}
                      onClick={() => set('nextDue', toggleInArray(draft.nextDue, b.value))}
                    />
                  ))}
                </div>
              </Section>

              {/* QUALITY */}
              <Section id="quality" title="Quality & ops" Icon={Star} activeCount={sc.quality}
                       open={openSection === 'quality'} onToggle={() => toggleSection('quality')}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Customer rating</p>
                  <div className="flex flex-wrap gap-2">
                    {RATING_BUCKETS.map(r => (
                      <Chip
                        key={r.value}
                        label={r.label}
                        active={draft.rating.includes(r.value)}
                        onClick={() => set('rating', toggleInArray(draft.rating, r.value))}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Review collected</p>
                  <TriRow value={draft.reviewTaken} onChange={v => set('reviewTaken', v)} yesLabel="Collected" noLabel="Not yet"/>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Groomer arrival</p>
                  <TriRow value={draft.arrivalOnTime} onChange={v => set('arrivalOnTime', v)} yesLabel="On time" noLabel="Late"/>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                    <AlertCircle size={11}/> Bonus pending approval
                  </p>
                  <TriRow value={draft.bonusPending} onChange={v => set('bonusPending', v)} yesLabel="Pending" noLabel="None"/>
                </div>
              </Section>

              {/* OTHER */}
              <Section id="other" title="Other" Icon={Heart} activeCount={sc.other}
                       open={openSection === 'other'} onToggle={() => toggleSection('other')}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Customer</p>
                  <CustomerPickerChip
                    value={draft.customerId}
                    label={draft.customerLabel}
                    onChange={(id, lbl) => setDraft(d => ({ ...d, customerId: id, customerLabel: lbl }))}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                    <FileText size={11}/> Notes
                  </p>
                  <TriRow value={draft.hasNotes} onChange={v => set('hasNotes', v)} yesLabel="Has notes" noLabel="Empty"/>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                    <ImageIcon size={11}/> Completion photo
                  </p>
                  <TriRow value={draft.hasCompletionPhoto} onChange={v => set('hasCompletionPhoto', v)} yesLabel="Uploaded" noLabel="None"/>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                    <MapPin size={11}/> GPS location
                  </p>
                  <TriRow value={draft.hasGps} onChange={v => set('hasGps', v)} yesLabel="Pinned" noLabel="Missing"/>
                </div>
              </Section>

              {/* Bottom breathing room so the last section's chips
                  aren't covered by the sticky footer. */}
              <div className="h-6"/>
            </div>

            {/* Sticky footer */}
            <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2 bg-white shrink-0"
                 style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
              <button
                type="button"
                onClick={reset}
                disabled={draftCount === 0}
                className="px-4 h-11 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition"
              >
                Reset all
              </button>
              <button
                type="button"
                onClick={apply}
                className="flex-1 h-11 rounded-full bg-sniffy-purple text-white text-sm font-bold hover:bg-purple-900 transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>Apply</span>
                {draftCount > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-sniffy-yellow text-gray-900 text-[10px] font-extrabold leading-none">
                    {draftCount}
                  </span>
                )}
                {resultCount != null && (
                  <span className="text-[11px] font-semibold opacity-80">· Showing {resultCount}</span>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
