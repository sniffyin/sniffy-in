/**
 * AnalyticsFiltersSheet.tsx
 *
 * Mobile-first filter drawer for the Analytics tab — same shape as the
 * Sessions filter sheet (bottom sheet on mobile, right drawer on desktop):
 *   • Grabber + sticky header with active count.
 *   • Collapsible sections (When / Groomer / Status / Pet / Payment / Source).
 *   • Draft state: edits don't apply until "Apply" is tapped; Close discards.
 *   • Sticky footer: Reset all · Apply (N) · Showing N (live, from countFor).
 *
 * Date filtering mirrors Sessions: quick presets + a real SniffyDatePicker
 * range for custom from/to.
 */

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronDown, Check, CalendarDays, Users, Tag, PawPrint, CreditCard, Layers,
  Package, Sparkles, Star, UserPlus,
} from 'lucide-react';
import {
  type SessionStatus, type PaymentCollectedBy, type PaymentMode, type BookingSource, type PaymentStatus,
  STATUS_LABELS, PAYMENT_COLLECTED_BY_LABELS, INTERNAL_SOURCE_LABELS, EXTERNAL_SOURCE_LABELS,
  PACKAGES, ADD_ONS,
} from '../types';
import SniffyDatePicker from '../../calendar/SniffyDatePicker';
import {
  type AnalyticsFilters, type DatePreset, type Channel, type RatingBucket, type YesNo, type CustomerType,
  DATE_PRESET_LABELS, STATUS_COLORS_HEX, resolveRange,
} from './analyticsLib';

// Chip option tables for the derived / bucketed filters.
const CHANNEL_OPTS:      [Channel, string, string][]      = [['direct', 'Direct', '#4a3aa7'], ['vendor', 'Vendor', '#eb6834']];
const PAY_STATUS_OPTS:   [PaymentStatus, string, string][] = [['paid', 'Paid', '#0ca30c'], ['collected', 'Collected', '#eda100'], ['unpaid', 'Unpaid', '#e34948']];
const RATING_OPTS:       [RatingBucket, string, string][]  = [['5', '5 ★', '#0ca30c'], ['4', '4 ★', '#eda100'], ['low', '≤ 3 ★', '#e34948'], ['unrated', 'Unrated', '#898781']];
const REVIEW_OPTS:       [YesNo, string][]                 = [['yes', 'Review taken'], ['no', 'No review']];
const CUSTOMER_OPTS:     [CustomerType, string, string][]  = [['new', 'New', '#1baf7a'], ['returning', 'Returning', '#4a3aa7']];

// ─── Chip ─────────────────────────────────────────────────────
function Chip({ label, active, onClick, dot }: { label: string; active: boolean; onClick: () => void; dot?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 px-3.5 rounded-full border text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
        active
          ? 'bg-sniffy-purple text-white border-sniffy-purple shadow-sm'
          : 'bg-white text-gray-700 border-gray-200 hover:border-sniffy-purple hover:text-sniffy-purple'
      }`}
    >
      {dot && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: active ? 'rgba(255,255,255,0.85)' : dot }} />}
      {label}
      {active && <Check size={11} className="ml-0.5" strokeWidth={3} />}
    </button>
  );
}

// ─── Collapsible section ──────────────────────────────────────
function Section({
  id, title, Icon, activeCount, open, onToggle, children,
}: {
  id: string; title: string; Icon: typeof Users; activeCount: number;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className={`border-b border-gray-200 last:border-b-0 ${open ? 'bg-gray-50' : ''}`}>
      <button
        type="button" onClick={onToggle} aria-expanded={open} aria-controls={`asec-${id}`}
        className={`w-full flex items-center gap-3 py-3.5 px-4 transition ${open ? 'bg-white border-b border-gray-100' : 'bg-white active:bg-gray-50'}`}
      >
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
          activeCount > 0 ? 'bg-sniffy-yellow/25 text-amber-800 ring-1 ring-sniffy-yellow/50' : 'bg-gray-100 text-gray-500'
        }`}>
          <Icon size={16} />
        </span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-bold text-gray-900">{title}</span>
          {activeCount > 0 && <span className="block text-[11px] font-bold text-amber-700 mt-0.5">{activeCount} active</span>}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`asec-${id}`}
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }} className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── The sheet ────────────────────────────────────────────────
export default function AnalyticsFiltersSheet({
  open, value, groomers, onApply, onClose, countFor,
}: {
  open: boolean;
  value: AnalyticsFilters;
  groomers: { id: string; name: string }[];
  onApply: (next: AnalyticsFilters) => void;
  onClose: () => void;
  countFor: (f: AnalyticsFilters) => number;
}) {
  const [draft, setDraft] = useState<AnalyticsFilters>(value);
  const [openSection, setOpenSection] = useState<string | null>('when');

  useEffect(() => { if (open) setDraft(value); }, [open, value]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  function toggle<T>(key: keyof AnalyticsFilters, v: T) {
    setDraft(prev => {
      const arr = prev[key] as unknown as T[];
      const next = arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
      return { ...prev, [key]: next };
    });
  }
  function pickPreset(p: DatePreset) {
    setDraft(d => ({ ...d, preset: p, from: p === 'custom' ? d.from : null, to: p === 'custom' ? d.to : null }));
    setOpenSection('when');
  }
  function toggleSection(id: string) { setOpenSection(prev => (prev === id ? null : id)); }
  function reset() { setDraft(d => ({ ...value, ...emptyExceptSearch(d) })); }
  function apply() { onApply(draft); onClose(); }

  const activeCount = countActive(draft);
  const resultCount = useMemo(() => countFor(draft), [draft, countFor]);
  const range = resolveRange(draft);

  const sc = useMemo(() => ({
    when: draft.preset !== 'all' ? 1 : 0,
    groomer: draft.groomerIds.length,
    status: draft.statuses.length,
    pet: draft.petTypes.length,
    payment: draft.collectedBy.length + draft.paymentModes.length + draft.paymentStatuses.length,
    source: draft.sources.length + draft.channels.length,
    service: draft.packages.length + draft.addOns.length,
    ratings: draft.ratings.length + draft.reviewTaken.length,
    customer: draft.customerTypes.length,
  }), [draft]);

  const internalSources = Object.entries(INTERNAL_SOURCE_LABELS) as [BookingSource, string][];
  const externalSources = Object.entries(EXTERNAL_SOURCE_LABELS) as [BookingSource, string][];
  const statusOpts = Object.keys(STATUS_LABELS) as SessionStatus[];
  const collectedOpts = Object.keys(PAYMENT_COLLECTED_BY_LABELS) as PaymentCollectedBy[];

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed z-[81] bg-white shadow-2xl flex flex-col
              inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl
              sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[440px] sm:max-h-none sm:rounded-t-none sm:rounded-l-3xl"
            role="dialog" aria-modal="true" aria-label="Analytics filters"
          >
            <div className="sm:hidden flex justify-center pt-2 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
              <div className="flex-1">
                <h2 className="text-base font-extrabold text-gray-900">Filters</h2>
                {activeCount > 0 && <p className="text-[11px] text-amber-700 font-bold mt-0.5">{activeCount} active · drafted</p>}
              </div>
              {activeCount > 0 && (
                <button type="button" onClick={reset} className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1">Reset</button>
              )}
              <button type="button" onClick={onClose} aria-label="Close filters"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* WHEN */}
              <Section id="when" title="When" Icon={CalendarDays} activeCount={sc.when}
                       open={openSection === 'when'} onToggle={() => toggleSection('when')}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Quick range</p>
                  <div className="flex flex-wrap gap-2">
                    {(['all','this_month','last_month','this_quarter','last_quarter','this_year'] as DatePreset[]).map(p => (
                      <Chip key={p} label={DATE_PRESET_LABELS[p]} active={draft.preset === p} onClick={() => pickPreset(p)} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Custom range</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <SniffyDatePicker value={draft.preset === 'custom' ? (draft.from ?? '') : ''}
                        placeholder="From" max={draft.to || undefined}
                        onChange={v => setDraft(d => ({ ...d, preset: 'custom', from: v || null }))} />
                    </div>
                    <span className="text-xs text-gray-400 font-semibold">to</span>
                    <div className="flex-1 min-w-0">
                      <SniffyDatePicker value={draft.preset === 'custom' ? (draft.to ?? '') : ''}
                        placeholder="To" min={draft.from || undefined}
                        onChange={v => setDraft(d => ({ ...d, preset: 'custom', to: v || null }))} />
                    </div>
                  </div>
                  {draft.preset !== 'all' && (
                    <p className="text-[11px] text-gray-500 mt-2">
                      {range.from ?? '…'} → {range.to ?? '…'}
                    </p>
                  )}
                </div>
              </Section>

              {/* GROOMER */}
              {groomers.length > 0 && (
                <Section id="groomer" title="Groomer" Icon={Users} activeCount={sc.groomer}
                         open={openSection === 'groomer'} onToggle={() => toggleSection('groomer')}>
                  <div className="flex flex-wrap gap-2">
                    {groomers.map(g => (
                      <Chip key={g.id} label={g.name} active={draft.groomerIds.includes(g.id)} onClick={() => toggle('groomerIds', g.id)} />
                    ))}
                  </div>
                </Section>
              )}

              {/* STATUS */}
              <Section id="status" title="Status" Icon={Tag} activeCount={sc.status}
                       open={openSection === 'status'} onToggle={() => toggleSection('status')}>
                <div className="flex flex-wrap gap-2">
                  {statusOpts.map(s => (
                    <Chip key={s} label={STATUS_LABELS[s]} dot={STATUS_COLORS_HEX[s]}
                      active={draft.statuses.includes(s)} onClick={() => toggle('statuses', s)} />
                  ))}
                </div>
              </Section>

              {/* PET */}
              <Section id="pet" title="Pet type" Icon={PawPrint} activeCount={sc.pet}
                       open={openSection === 'pet'} onToggle={() => toggleSection('pet')}>
                <div className="flex flex-wrap gap-2">
                  <Chip label="🐶 Dogs" active={draft.petTypes.includes('dog')} onClick={() => toggle('petTypes', 'dog')} />
                  <Chip label="🐱 Cats" active={draft.petTypes.includes('cat')} onClick={() => toggle('petTypes', 'cat')} />
                </div>
              </Section>

              {/* PAYMENT */}
              <Section id="payment" title="Payment" Icon={CreditCard} activeCount={sc.payment}
                       open={openSection === 'payment'} onToggle={() => toggleSection('payment')}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Collected by</p>
                  <div className="flex flex-wrap gap-2">
                    {collectedOpts.map(c => (
                      <Chip key={c} label={PAYMENT_COLLECTED_BY_LABELS[c]} active={draft.collectedBy.includes(c)} onClick={() => toggle('collectedBy', c)} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Mode</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip label="💵 Cash" active={draft.paymentModes.includes('cash')} onClick={() => toggle('paymentModes', 'cash' as PaymentMode)} />
                    <Chip label="💳 Online" active={draft.paymentModes.includes('online')} onClick={() => toggle('paymentModes', 'online' as PaymentMode)} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {PAY_STATUS_OPTS.map(([v, label, dot]) => (
                      <Chip key={v} label={label} dot={dot} active={draft.paymentStatuses.includes(v)} onClick={() => toggle('paymentStatuses', v)} />
                    ))}
                  </div>
                </div>
              </Section>

              {/* SOURCE */}
              <Section id="source" title="Source" Icon={Layers} activeCount={sc.source}
                       open={openSection === 'source'} onToggle={() => toggleSection('source')}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Channel</p>
                  <div className="flex flex-wrap gap-2">
                    {CHANNEL_OPTS.map(([v, label, dot]) => (
                      <Chip key={v} label={label} dot={dot} active={draft.channels.includes(v)} onClick={() => toggle('channels', v)} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Internal</p>
                  <div className="flex flex-wrap gap-2">
                    {internalSources.map(([v, label]) => (
                      <Chip key={v} label={label} active={draft.sources.includes(v)} onClick={() => toggle('sources', v)} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">External</p>
                  <div className="flex flex-wrap gap-2">
                    {externalSources.map(([v, label]) => (
                      <Chip key={v} label={label} active={draft.sources.includes(v)} onClick={() => toggle('sources', v)} />
                    ))}
                  </div>
                </div>
              </Section>

              {/* SERVICE — package + add-ons */}
              <Section id="service" title="Service" Icon={Package} activeCount={sc.service}
                       open={openSection === 'service'} onToggle={() => toggleSection('service')}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Package</p>
                  <div className="flex flex-wrap gap-2">
                    {PACKAGES.map(p => (
                      <Chip key={p.label} label={p.label} active={draft.packages.includes(p.label)} onClick={() => toggle('packages', p.label)} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1"><Sparkles size={11} /> Add-ons</p>
                  <div className="flex flex-wrap gap-2">
                    {ADD_ONS.map(a => (
                      <Chip key={a.label} label={a.label} active={draft.addOns.includes(a.label)} onClick={() => toggle('addOns', a.label)} />
                    ))}
                  </div>
                </div>
              </Section>

              {/* RATINGS — rating buckets + review captured */}
              <Section id="ratings" title="Ratings & reviews" Icon={Star} activeCount={sc.ratings}
                       open={openSection === 'ratings'} onToggle={() => toggleSection('ratings')}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Client rating</p>
                  <div className="flex flex-wrap gap-2">
                    {RATING_OPTS.map(([v, label, dot]) => (
                      <Chip key={v} label={label} dot={dot} active={draft.ratings.includes(v)} onClick={() => toggle('ratings', v)} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Review</p>
                  <div className="flex flex-wrap gap-2">
                    {REVIEW_OPTS.map(([v, label]) => (
                      <Chip key={v} label={label} active={draft.reviewTaken.includes(v)} onClick={() => toggle('reviewTaken', v)} />
                    ))}
                  </div>
                </div>
              </Section>

              {/* CUSTOMER — new vs returning */}
              <Section id="customer" title="Customer" Icon={UserPlus} activeCount={sc.customer}
                       open={openSection === 'customer'} onToggle={() => toggleSection('customer')}>
                <div className="flex flex-wrap gap-2">
                  {CUSTOMER_OPTS.map(([v, label, dot]) => (
                    <Chip key={v} label={label} dot={dot} active={draft.customerTypes.includes(v)} onClick={() => toggle('customerTypes', v)} />
                  ))}
                </div>
              </Section>

              <div className="h-6" />
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2 bg-white shrink-0"
                 style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
              <button type="button" onClick={reset} disabled={activeCount === 0}
                className="px-4 h-11 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition">
                Reset all
              </button>
              <button type="button" onClick={apply}
                className="flex-1 h-11 rounded-full bg-sniffy-purple text-white text-sm font-bold hover:bg-purple-900 transition shadow-sm flex items-center justify-center gap-2">
                <span>Apply</span>
                {activeCount > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-sniffy-yellow text-gray-900 text-[10px] font-extrabold leading-none">{activeCount}</span>
                )}
                <span className="text-[11px] font-semibold opacity-80">· Showing {resultCount}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── helpers ──────────────────────────────────────────────────
function countActive(f: AnalyticsFilters): number {
  return (f.preset !== 'all' ? 1 : 0) + f.groomerIds.length + f.statuses.length +
    f.petTypes.length + f.collectedBy.length + f.paymentModes.length + f.paymentStatuses.length +
    f.sources.length + f.channels.length + f.packages.length + f.addOns.length +
    f.ratings.length + f.reviewTaken.length + f.customerTypes.length;
}
/** Reset everything except the free-text search (which lives outside the sheet). */
function emptyExceptSearch(d: AnalyticsFilters): Partial<AnalyticsFilters> {
  return {
    preset: 'all', from: null, to: null,
    groomerIds: [], statuses: [], petTypes: [], sources: [], channels: [],
    collectedBy: [], paymentModes: [], paymentStatuses: [],
    packages: [], addOns: [], ratings: [], reviewTaken: [], customerTypes: [],
    search: d.search,
  };
}
