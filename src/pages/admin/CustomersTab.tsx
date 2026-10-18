/**
 * admin/CustomersTab.tsx — Phase 1
 *
 * Master list of all customers, derived from `customers_with_recency`
 * (which is built from grooming_sessions only — bookings that never
 * converted are not customers).
 *
 * Features:
 *  • Search by name / phone
 *  • Sort by last session / total sessions / LTV / name
 *  • Filter by lifecycle stage (All / New / Active / Lapsed / Churned)
 *  • CSV export of the current filtered view
 *  • Mobile: cards.  Desktop: table.
 *  • Tap a row → CustomerDetailModal with full history, pets, notes.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, X, AlertCircle, Download,
  Crown, ChevronRight, CheckSquare, Square, Tag, Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  CustomerWithRecency, LifecycleStage, LIFECYCLE_LABELS, LIFECYCLE_COLORS,
  formatPhoneDisplay, customerInitials, customerAvatarColor,
} from './customerTypes';
import CustomerDetailModal from './CustomerDetailModal';

// ─── Helpers ─────────────────────────────────────────────────────────

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtRecency(days: number | null): string {
  if (days == null) return '—';
  if (days === 0)  return 'today';
  if (days === 1)  return '1d ago';
  if (days < 30)   return `${days}d ago`;
  if (days < 60)   return `${Math.floor(days/30)} mo ago`;
  if (days < 365)  return `${Math.floor(days/30)} mo ago`;
  return `${Math.floor(days/365)}y ago`;
}

function fmtMoney(amt: number): string {
  if (!amt) return '₹0';
  return `₹${Math.round(amt).toLocaleString('en-IN')}`;
}

type SortKey = 'recent' | 'sessions' | 'ltv' | 'name';

const SORT_LABELS: Record<SortKey, string> = {
  recent:   'Recently groomed',
  sessions: 'Most sessions',
  ltv:      'Highest LTV',
  name:     'Name (A→Z)',
};

type StageFilter = 'all' | LifecycleStage;
type TierFilter  = 'all' | 'vip' | 'elite';

// ─── Mobile card ─────────────────────────────────────────────────────
//
// Compact 2-line layout:
//   ┌──────────────────────────────────────────────┐
//   │ ☐ Sameer  ♛  [Active]                       › │   ← name + badges
//   │   +91 98860 91042 · 5d · 2× · ₹1,598          │   ← phone + stats inline
//   └──────────────────────────────────────────────┘
//
// Earlier two-section card (header + 3-col stats grid with uppercase
// labels) was visually generous but burned ~120px per row.  Folding
// the stats into a single inline row with mid-dot separators keeps the
// same data density while cutting card height by roughly 45%.

function CustomerCard({
  c, onOpen, selectMode, selected, onToggleSelect,
}: {
  c: CustomerWithRecency;
  onOpen: (c: CustomerWithRecency) => void;
  /** Phase 2c — when true, taps toggle selection instead of opening
   *  the detail sheet.  Checkbox icon appears inline on the left. */
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const colors = LIFECYCLE_COLORS[c.lifecycle_stage];
  return (
    <button
      onClick={() => selectMode ? onToggleSelect(c.id) : onOpen(c)}
      className={`relative w-full text-left bg-white rounded-xl border overflow-hidden transition-all active:scale-[0.99] ${
        selected ? 'border-sniffy-purple ring-2 ring-sniffy-purple/20' : 'border-gray-100'
      }`}
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {selectMode ? (
          <div className="shrink-0">
            {selected
              ? <CheckSquare size={15} className="text-sniffy-purple"/>
              : <Square size={15} className="text-gray-300"/>}
          </div>
        ) : (
          /* Initials avatar — same deterministic colour the detail
              header uses, so a customer is visually consistent across
              both screens.  Hidden when selectMode is on so the
              checkbox stays the leftmost element. */
          <div
            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold tracking-wide ${customerAvatarColor(c.id)}`}
          >
            {customerInitials(c.name, c.phone)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Row 1 — name + VIP + lifecycle badge */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-extrabold text-gray-900 truncate">
              {c.name || <span className="text-gray-400 italic">No name</span>}
            </span>
            {c.is_elite && (
              <span className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full px-1.5 py-px leading-tight shadow-sm">
                <Crown size={8}/> Elite
              </span>
            )}
            {c.is_vip && (
              <span className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-1.5 py-px leading-tight">
                <Crown size={8}/> VIP
              </span>
            )}
            <span className={`shrink-0 text-[9px] font-bold ${colors.bg} ${colors.text} border ${colors.border} rounded-full px-1.5 py-px leading-tight`}>
              {LIFECYCLE_LABELS[c.lifecycle_stage]}
            </span>
          </div>

          {/* Row 2 — phone + stats, inline with mid-dot separators */}
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500">
            <span className="font-medium text-gray-700 truncate">{formatPhoneDisplay(c.phone)}</span>
            <span className="text-gray-300 shrink-0">·</span>
            <span className="shrink-0">{fmtRecency(c.days_since_last_session)}</span>
            <span className="text-gray-300 shrink-0">·</span>
            <span className="shrink-0">{c.total_sessions}×</span>
            <span className="text-gray-300 shrink-0">·</span>
            <span className="font-semibold text-gray-700 shrink-0">{fmtMoney(c.lifetime_value)}</span>
          </div>
        </div>

        <ChevronRight size={14} className="text-gray-300 shrink-0"/>
      </div>
    </button>
  );
}

// ─── Main tab ────────────────────────────────────────────────────────

export default function CustomersTab() {
  const [rows, setRows]       = useState<CustomerWithRecency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [search, setSearch]   = useState('');
  const [stage, setStage]     = useState<StageFilter>('all');
  const [tier, setTier]       = useState<TierFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [selected, setSelected] = useState<CustomerWithRecency | null>(null);

  // Phase 2c — bulk selection state.  `selectMode` gates the mobile UI
  // (cards stay clickable in normal mode, switch to selection on
  // toggle).  Desktop checkboxes are always visible, so selectMode
  // doesn't affect the table.  `selectedIds` is the source of truth
  // for which customers a bulk action will hit.
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy]       = useState<null | 'vip-on' | 'vip-off' | 'elite-on' | 'elite-off' | 'tag-add' | 'tag-remove' | 'wa-on' | 'wa-off' | 'export'>(null);
  const [bulkError, setBulkError]     = useState<string | null>(null);
  const [tagInput, setTagInput]       = useState('');
  const [tagPanelOpen, setTagPanelOpen] = useState<'add' | 'remove' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbErr } = await supabase
        .from('customers_with_recency')
        .select('*')
        .order('last_session_at', { ascending: false, nullsFirst: false })
        .limit(2000);
      if (sbErr) {
        setError(`${sbErr.message} (code: ${sbErr.code})`);
        setRows([]);
        return;
      }
      setRows((data ?? []) as CustomerWithRecency[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = rows.filter(c => {
      if (stage !== 'all' && c.lifecycle_stage !== stage) return false;
      if (tier === 'vip' && !c.is_vip) return false;
      if (tier === 'elite' && !c.is_elite) return false;
      if (!q) return true;
      return (
        (c.name ?? '').toLowerCase().includes(q) ||
        (c.phone ?? '').toLowerCase().includes(q) ||
        (c.phone_raw ?? '').toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.address ?? '').toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      switch (sortKey) {
        case 'recent':
          // nulls last
          if (!a.last_session_at && !b.last_session_at) return 0;
          if (!a.last_session_at) return 1;
          if (!b.last_session_at) return -1;
          return b.last_session_at.localeCompare(a.last_session_at);
        case 'sessions':
          return (b.total_sessions ?? 0) - (a.total_sessions ?? 0);
        case 'ltv':
          return (b.lifetime_value ?? 0) - (a.lifetime_value ?? 0);
        case 'name':
          return (a.name ?? '').localeCompare(b.name ?? '');
      }
    });

    return list;
  }, [rows, search, stage, tier, sortKey]);

  const counts = useMemo(() => {
    const c = { total: rows.length, new: 0, active: 0, lapsed: 0, churned: 0 };
    rows.forEach(r => { c[r.lifecycle_stage]++; });
    return c;
  }, [rows]);

  const tierCounts = useMemo(() => {
    let vip = 0, elite = 0;
    rows.forEach(r => { if (r.is_vip) vip++; if (r.is_elite) elite++; });
    return { vip, elite };
  }, [rows]);

  // ── Phase 2c — bulk operation helpers ─────────────────────────
  //
  // The Supabase JS client supports `.in('id', [...])` for bulk
  // updates, so each action is a single round-trip regardless of how
  // many customers are selected.  We reload the list afterwards to
  // pick up trigger-driven side effects (notes history insert,
  // aggregates recompute on related rows, etc).

  function toggleId(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setSelectMode(false);
    setTagPanelOpen(null);
    setTagInput('');
  }

  /** Selects every customer currently visible in `filtered`.  Useful
   *  for "Export all lapsed" — set the lifecycle pill to Lapsed, then
   *  Select all → Export selected. */
  function selectAllVisible() {
    setSelectedIds(new Set(filtered.map(r => r.id)));
  }

  async function bulkVip(value: boolean) {
    if (selectedIds.size === 0) return;
    setBulkBusy(value ? 'vip-on' : 'vip-off');
    setBulkError(null);
    try {
      const { error: err } = await supabase
        .from('customers')
        .update({ is_vip: value })
        .in('id', Array.from(selectedIds));
      if (err) throw err;
      await load();
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : String(err));
    } finally { setBulkBusy(null); }
  }

  async function bulkElite(value: boolean) {
    if (selectedIds.size === 0) return;
    setBulkBusy(value ? 'elite-on' : 'elite-off');
    setBulkError(null);
    try {
      const { error: err } = await supabase
        .from('customers')
        .update({ is_elite: value })
        .in('id', Array.from(selectedIds));
      if (err) throw err;
      await load();
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : String(err));
    } finally { setBulkBusy(null); }
  }

  async function bulkWhatsapp(value: boolean) {
    if (selectedIds.size === 0) return;
    setBulkBusy(value ? 'wa-on' : 'wa-off');
    setBulkError(null);
    try {
      const { error: err } = await supabase
        .from('customers')
        .update({ whatsapp_opt_in: value })
        .in('id', Array.from(selectedIds));
      if (err) throw err;
      await load();
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : String(err));
    } finally { setBulkBusy(null); }
  }

  /** Tag adds and removes can't be expressed as a single SQL update
   *  on the typed array column from the JS client, so we walk the
   *  selected rows once.  Still one round-trip per row, but bounded
   *  by Promise.all and short enough for realistic selections. */
  async function bulkAddTag(tag: string) {
    const t = tag.trim();
    if (!t || selectedIds.size === 0) return;
    setBulkBusy('tag-add');
    setBulkError(null);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map(async id => {
        const row = rows.find(r => r.id === id);
        const current = row?.tags ?? [];
        if (current.includes(t)) return;
        const next = [...current, t];
        const { error: err } = await supabase.from('customers').update({ tags: next }).eq('id', id);
        if (err) throw err;
      }));
      setTagInput('');
      setTagPanelOpen(null);
      await load();
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : String(err));
    } finally { setBulkBusy(null); }
  }

  async function bulkRemoveTag(tag: string) {
    const t = tag.trim();
    if (!t || selectedIds.size === 0) return;
    setBulkBusy('tag-remove');
    setBulkError(null);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map(async id => {
        const row = rows.find(r => r.id === id);
        const current = row?.tags ?? [];
        if (!current.includes(t)) return;
        const next = current.filter(x => x !== t);
        const { error: err } = await supabase.from('customers').update({ tags: next }).eq('id', id);
        if (err) throw err;
      }));
      setTagInput('');
      setTagPanelOpen(null);
      await load();
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : String(err));
    } finally { setBulkBusy(null); }
  }

  function exportSelectedCsv() {
    exportCsvRows(rows.filter(r => selectedIds.has(r.id)), 'selected');
  }

  function exportCsv() {
    exportCsvRows(filtered, 'filtered');
  }

  /** Shared CSV serializer used by both the top-bar "Export CSV" (full
   *  filtered view) and the bulk-action "Export selected" (subset of
   *  manually picked rows).  Filename varies so the downloads don't
   *  collide. */
  function exportCsvRows(rowsToExport: CustomerWithRecency[], kind: 'filtered' | 'selected') {
    if (rowsToExport.length === 0) return;
    const headers = ['Name','Phone','City','Last Session','Days Since','Total Sessions','LTV','Lifecycle','VIP','Elite','Tags','Email','Address'];
    const lines = [headers.join(',')];
    for (const c of rowsToExport) {
      const cells = [
        c.name ?? '',
        c.phone ?? '',
        c.city ?? '',
        c.last_session_at ?? '',
        c.days_since_last_session ?? '',
        c.total_sessions,
        c.lifetime_value,
        c.lifecycle_stage,
        c.is_vip ? 'yes' : 'no',
        c.is_elite ? 'yes' : 'no',
        (c.tags ?? []).join('|'),
        c.email ?? '',
        (c.address ?? '').replace(/[\r\n]/g, ' '),
      ].map(v => {
        const s = String(v);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      });
      lines.push(cells.join(','));
    }
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sniffy-customers-${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">Customers</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {counts.total} total · {counts.active} active · {counts.lapsed} lapsed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectMode(s => !s)}
            className={`flex items-center gap-1.5 text-xs font-semibold transition sm:hidden ${
              selectMode ? 'text-sniffy-purple' : 'text-gray-500 hover:text-sniffy-purple'
            }`}
          >
            {selectMode ? <CheckSquare size={13}/> : <Square size={13}/>}
            {selectMode ? 'Selecting' : 'Select'}
          </button>
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-sniffy-purple disabled:opacity-40 transition font-semibold"
          >
            <Download size={13}/> Export CSV
          </button>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-sniffy-purple transition font-semibold"
          >
            <RefreshCw size={13}/> Refresh
          </button>
        </div>
      </div>

      {/* Phase 2c — bulk action bar.  Slides in from the top when 1+
          customers are selected.  Sticky on scroll so it stays
          reachable while the user works through a long list. */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="sticky top-2 z-20 bg-sniffy-purple text-white rounded-2xl p-3 shadow-lg"
            style={{ boxShadow: '0 8px 24px rgba(69,26,139,0.25)' }}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold bg-white/20 rounded-full px-2.5 py-1">
                  {selectedIds.size} selected
                </span>
                <button onClick={selectAllVisible} className="text-[11px] font-semibold underline opacity-80 hover:opacity-100">
                  Select all visible ({filtered.length})
                </button>
                <button onClick={clearSelection} className="text-[11px] font-semibold underline opacity-80 hover:opacity-100">
                  Clear
                </button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <BulkBtn busy={bulkBusy === 'vip-on'} onClick={() => bulkVip(true)} icon={<Crown size={11}/>}>
                  Mark VIP
                </BulkBtn>
                <BulkBtn busy={bulkBusy === 'vip-off'} onClick={() => bulkVip(false)}>
                  Unmark VIP
                </BulkBtn>
                <BulkBtn busy={bulkBusy === 'elite-on'} onClick={() => bulkElite(true)} icon={<Crown size={11}/>}>
                  Mark Elite
                </BulkBtn>
                <BulkBtn busy={bulkBusy === 'elite-off'} onClick={() => bulkElite(false)}>
                  Unmark Elite
                </BulkBtn>
                <BulkBtn busy={bulkBusy === 'tag-add'} onClick={() => setTagPanelOpen(o => o === 'add' ? null : 'add')} icon={<Tag size={11}/>}>
                  Add tag
                </BulkBtn>
                <BulkBtn busy={bulkBusy === 'tag-remove'} onClick={() => setTagPanelOpen(o => o === 'remove' ? null : 'remove')}>
                  Remove tag
                </BulkBtn>
                <BulkBtn busy={bulkBusy === 'wa-on'} onClick={() => bulkWhatsapp(true)}>
                  WhatsApp ✓
                </BulkBtn>
                <BulkBtn busy={bulkBusy === 'wa-off'} onClick={() => bulkWhatsapp(false)}>
                  WhatsApp ✗
                </BulkBtn>
                <BulkBtn onClick={exportSelectedCsv} icon={<Download size={11}/>}>
                  Export
                </BulkBtn>
              </div>
            </div>

            {/* Tag input pops out under the row when "Add tag" / "Remove
                tag" is clicked.  Same input, different action button. */}
            <AnimatePresence>
              {tagPanelOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-2"
                >
                  <div className="flex items-center gap-2 pt-2 border-t border-white/20">
                    <input
                      type="text"
                      autoFocus
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          tagPanelOpen === 'add' ? bulkAddTag(tagInput) : bulkRemoveTag(tagInput);
                        }
                      }}
                      placeholder={tagPanelOpen === 'add' ? 'Tag to add (press Enter)' : 'Tag to remove (press Enter)'}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white/15 text-white placeholder:text-white/60 border border-white/30 focus:outline-none focus:bg-white/25"
                    />
                    <button
                      onClick={() => tagPanelOpen === 'add' ? bulkAddTag(tagInput) : bulkRemoveTag(tagInput)}
                      disabled={!tagInput.trim() || !!bulkBusy}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-sniffy-purple disabled:opacity-60 transition active:scale-95"
                    >
                      {tagPanelOpen === 'add' ? 'Apply' : 'Remove'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {bulkError && (
              <div className="mt-2 flex items-start gap-2 p-2 bg-white/10 rounded-lg text-[11px]">
                <AlertCircle size={11} className="mt-0.5 shrink-0"/>
                <span className="flex-1 break-all">{bulkError}</span>
                <button onClick={() => setBulkError(null)}><X size={11}/></button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500"/>
          <div className="flex-1 min-w-0">
            <p className="font-bold">Failed to load customers</p>
            <p className="text-xs mt-0.5 text-red-500 break-all">{error}</p>
            <p className="text-xs mt-2 text-red-400">
              If this says <strong>relation "customers_with_recency" does not exist</strong>, the Phase 1
              migration <code className="font-mono">20260522000000_phase1_customers_pets_foundation.sql</code>
              {' '}hasn't run yet.  Apply it in Supabase Studio.
            </p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X size={14}/>
          </button>
        </div>
      )}

      {/* Lifecycle filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(['all','new','active','lapsed','churned'] as const).map(f => {
          const count = f === 'all' ? counts.total : counts[f];
          const active = stage === f;
          return (
            <button
              key={f}
              onClick={() => setStage(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all border ${
                active
                  ? 'bg-sniffy-purple text-white border-sniffy-purple'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-sniffy-purple/40'
              }`}
            >
              {f === 'all' ? 'All' : LIFECYCLE_LABELS[f]}
              {count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  active ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                }`}>{count}</span>
              )}
            </button>
          );
        })}

        {/* Membership tier pills — Elite (paid tier) outranks VIP. */}
        <span className="w-px self-stretch bg-gray-200 mx-0.5" aria-hidden />
        {([
          { key: 'vip',   label: 'VIP',   count: tierCounts.vip,
            on: 'bg-amber-500 text-white border-amber-500',
            off: 'bg-white text-amber-600 border-amber-200 hover:border-amber-400' },
          { key: 'elite', label: 'Elite', count: tierCounts.elite,
            on: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-amber-400',
            off: 'bg-white text-amber-700 border-amber-300 hover:border-amber-500' },
        ] as const).map(t => {
          const active = tier === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTier(active ? 'all' : t.key)}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${active ? t.on : t.off}`}
            >
              <Crown size={11}/> {t.label}
              {t.count > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  active ? 'bg-white/25' : 'bg-amber-50 text-amber-700'
                }`}>{t.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search + sort */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, email, address…"
            className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple focus:ring-1 focus:ring-sniffy-purple/20 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14}/>
            </button>
          )}
        </div>
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-sniffy-purple"
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
            <option key={k} value={k}>{SORT_LABELS[k]}</option>
          ))}
        </select>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {loading ? (
          [1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm font-semibold">No customers found</p>
            <p className="text-[11px] mt-1">Customers appear here once a grooming session is created.</p>
          </div>
        ) : (
          filtered.map(c => (
            <CustomerCard
              key={c.id}
              c={c}
              onOpen={setSelected}
              selectMode={selectMode}
              selected={selectedIds.has(c.id)}
              onToggleSelect={toggleId}
            />
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wide">
              {/* Phase 2c — select column.  Header checkbox toggles
                  "select all visible" so it composes cleanly with the
                  lifecycle filter (e.g. filter to Lapsed → click header
                  checkbox → bulk Mark VIP). */}
              <th className="px-3 py-3 w-10">
                <button
                  onClick={() => {
                    if (filtered.length > 0 && filtered.every(r => selectedIds.has(r.id))) {
                      // All visible are selected → toggle off
                      setSelectedIds(prev => {
                        const next = new Set(prev);
                        for (const r of filtered) next.delete(r.id);
                        return next;
                      });
                    } else {
                      selectAllVisible();
                    }
                  }}
                  className="text-gray-400 hover:text-sniffy-purple transition"
                >
                  {filtered.length > 0 && filtered.every(r => selectedIds.has(r.id))
                    ? <CheckSquare size={14}/> : <Square size={14}/>}
                </button>
              </th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Lifecycle</th>
              <th className="px-4 py-3 text-left">Last Session</th>
              <th className="px-4 py-3 text-right">Sessions</th>
              <th className="px-4 py-3 text-right">LTV</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(9)].map((__, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse"/></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                  No customers found
                </td>
              </tr>
            ) : (
              filtered.map(c => {
                const colors = LIFECYCLE_COLORS[c.lifecycle_stage];
                const isSelected = selectedIds.has(c.id);
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={`hover:bg-gray-50/60 transition cursor-pointer ${isSelected ? 'bg-purple-50/40' : ''}`}
                  >
                    {/* Phase 2c — row checkbox.  stopPropagation so
                        the click doesn't open the detail sheet. */}
                    <td className="px-3 py-3 w-10" onClick={e => { e.stopPropagation(); toggleId(c.id); }}>
                      <button className="text-gray-400 hover:text-sniffy-purple transition">
                        {isSelected ? <CheckSquare size={14} className="text-sniffy-purple"/> : <Square size={14}/>}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold tracking-wide ${customerAvatarColor(c.id)}`}
                        >
                          {customerInitials(c.name, c.phone)}
                        </div>
                        <span className="truncate">{c.name || <span className="text-gray-400 italic">No name</span>}</span>
                        {c.is_elite && (
                          <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full px-1.5 py-0.5 shadow-sm">
                            <Crown size={9}/> Elite
                          </span>
                        )}
                        {c.is_vip && (
                          <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-1.5 py-0.5">
                            <Crown size={9}/> VIP
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sniffy-purple font-semibold">{formatPhoneDisplay(c.phone)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-[11px] font-bold ${colors.bg} ${colors.text} border ${colors.border} rounded-full px-2.5 py-0.5`}>
                        {LIFECYCLE_LABELS[c.lifecycle_stage]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {fmtDate(c.last_session_at)}
                      {c.days_since_last_session != null && (
                        <span className="text-gray-300 ml-1">· {fmtRecency(c.days_since_last_session)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-700">{c.total_sessions}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-700">{fmtMoney(c.lifetime_value)}</td>
                    <td className="px-4 py-3 text-gray-500">{c.city ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight size={16} className="text-gray-300"/>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      <CustomerDetailModal
        open={!!selected}
        customer={selected}
        onClose={() => setSelected(null)}
        onChanged={load}
      />
    </div>
  );
}

// ─── Bulk action button (used inside the selection bar) ─────────────

function BulkBtn({
  busy, icon, onClick, children,
}: {
  busy?: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/15 hover:bg-white/25 disabled:opacity-60 transition active:scale-95"
    >
      {busy ? <Loader2 size={11} className="animate-spin"/> : icon}
      {children}
    </button>
  );
}
