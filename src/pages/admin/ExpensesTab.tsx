/**
 * admin/ExpensesTab.tsx — Coordinator/admin expense tracker.
 *
 * Two sub-views, switchable via a segmented control near the top:
 *
 *   ┌─────────── List ───────────┐     ┌────────── Reports ─────────┐
 *   │ Purple total card           │     │ Donut chart by category    │
 *   │ Month picker · summary tiles│     │ Bar / donut toggle         │
 *   │ Filters: category + search  │     │ Per-category breakdown     │
 *   │ List of expense rows        │     │ vs last-month delta        │
 *   │ Add Expense FAB             │     │                            │
 *   └─────────────────────────────┘     └────────────────────────────┘
 *
 * Data source:  expensesApi (Supabase `expenses` table).
 *
 * Permissions:
 *   • Any signed-in admin/coordinator can ADD expenses.
 *   • Only the row's `created_by_id` can EDIT or DELETE (canModifyExpense).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, ChevronLeft, ChevronRight, Loader2, AlertCircle, RefreshCw,
  Paperclip, Pencil, Trash2, X, BarChart3, PieChart, Wallet,
  Receipt, Eye, FileText as FileTextIcon,
} from 'lucide-react';
import {
  Expense, ExpenseFilters,
  EXPENSE_CATEGORIES, categoryMeta,
  fetchExpenses, deleteExpense, canModifyExpense,
  getSignedProofUrl,
  isoDate, startOfMonth, endOfMonth, fmtMonthYear,
} from './expensesApi';
import { fmtCurrency, fmtDate } from './types';
import { AdminUser } from './authStore';
import ExpenseFormModal from './ExpenseFormModal';

// lucide-react doesn't export `ListIcon` by that name in this version's
// d.ts; alias to the `List` icon for clarity:
import { List as ListLine } from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function pctDelta(curr: number, prev: number): { text: string; tone: 'up' | 'down' | 'flat' } {
  if (prev === 0) {
    if (curr === 0) return { text: '—', tone: 'flat' };
    return { text: '+100%', tone: 'up' };
  }
  const d = ((curr - prev) / prev) * 100;
  if (Math.abs(d) < 0.5) return { text: '0%', tone: 'flat' };
  const tone: 'up' | 'down' | 'flat' = d > 0 ? 'up' : 'down';
  const sign = d > 0 ? '+' : '';
  return { text: `${sign}${d.toFixed(0)}%`, tone };
}

type SubView = 'list' | 'reports';

// ─── Component ─────────────────────────────────────────────────

export default function ExpensesTab({ user }: { user: AdminUser }) {
  // Month focus (drives both views)
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()));

  // Filters
  const [search,    setSearch]    = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(''); // '' = all

  // Sub-view toggle
  const [view, setView] = useState<SubView>('list');

  // Data — current month
  const [rows,      setRows]      = useState<Expense[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadErr,   setLoadErr]   = useState<string | null>(null);

  // Data — previous month (for delta only; not displayed in list)
  const [prevRows,  setPrevRows]  = useState<Expense[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState<Expense | null>(null);

  // Confirm-delete state
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);
  const [deleting,      setDeleting]      = useState(false);

  // Detail-view state (tap a row)
  const [detail, setDetail] = useState<Expense | null>(null);

  // ── Fetch helpers ───────────────────────────────────────
  const fetchCurrent = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const filters: ExpenseFilters = {
        from: isoDate(startOfMonth(month)),
        to:   isoDate(endOfMonth(month)),
      };
      const [curr, prev] = await Promise.all([
        fetchExpenses(filters),
        fetchExpenses({
          from: isoDate(startOfMonth(addMonths(month, -1))),
          to:   isoDate(endOfMonth(addMonths(month, -1))),
        }),
      ]);
      setRows(curr);
      setPrevRows(prev);
    } catch (err: any) {
      setLoadErr(err?.message ?? 'Could not load expenses');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { fetchCurrent(); }, [fetchCurrent]);

  // ── Derived: total + filtered rows ─────────────────────
  const totalThisMonth = useMemo(
    () => rows.reduce((s, r) => s + Number(r.amount), 0),
    [rows]
  );
  const totalLastMonth = useMemo(
    () => prevRows.reduce((s, r) => s + Number(r.amount), 0),
    [prevRows]
  );
  const delta = useMemo(
    () => pctDelta(totalThisMonth, totalLastMonth),
    [totalThisMonth, totalLastMonth]
  );

  const filteredRows = useMemo(() => {
    let r = rows;
    if (categoryFilter) r = r.filter(x => x.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      r = r.filter(x =>
        x.title.toLowerCase().includes(q) ||
        x.paid_by_name.toLowerCase().includes(q) ||
        (x.vendor_or_payee?.toLowerCase().includes(q) ?? false) ||
        (x.notes?.toLowerCase().includes(q) ?? false)
      );
    }
    return r;
  }, [rows, categoryFilter, search]);

  // Top category for the header sub-tile
  const topCategory = useMemo((): { id: string; amount: number } | null => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.category, (m.get(r.category) ?? 0) + Number(r.amount));
    let best: { id: string; amount: number } | null = null;
    m.forEach((amount, id) => {
      if (best === null || amount > best.amount) best = { id, amount };
    });
    return best;
  }, [rows]);

  // ── Event handlers ──────────────────────────────────────
  function handleAdd()                  { setEditing(null);  setModalOpen(true); }
  function handleEdit(row: Expense)     { setEditing(row);   setModalOpen(true); setDetail(null); }
  function handleSaved(_row: Expense)   { fetchCurrent(); }
  function handleAskDelete(row: Expense) { setPendingDelete(row); setDetail(null); }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteExpense(pendingDelete);
      setPendingDelete(null);
      await fetchCurrent();
    } catch (err: any) {
      setLoadErr(err?.message ?? 'Could not delete');
    } finally {
      setDeleting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────
  const monthLabel = fmtMonthYear(month);

  return (
    <div className="space-y-4 pb-24 sm:pb-6">
      {/* Purple summary header */}
      <SummaryHeader
        monthLabel={monthLabel}
        total={totalThisMonth}
        delta={delta}
        onPrev={() => setMonth(addMonths(month, -1))}
        onNext={() => setMonth(addMonths(month,  1))}
        canGoNext={month < startOfMonth(new Date())}
      />

      {/* Small summary tiles */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryTile
          label="Entries"
          value={String(rows.length)}
          icon={<Receipt size={16} className="text-purple-500"/>}
          tint="bg-purple-50"
        />
        <SummaryTile
          label="Top category"
          value={topCategory ? categoryMeta(topCategory.id).label : '—'}
          subValue={topCategory ? fmtCurrency(topCategory.amount) : undefined}
          icon={<Wallet size={16} className="text-pink-500"/>}
          tint="bg-pink-50"
        />
      </div>

      {/* View toggle + Add CTA + refresh */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-full bg-gray-100 p-1">
          <ViewBtn active={view === 'list'} onClick={() => setView('list')} Icon={ListLine} label="List"/>
          <ViewBtn active={view === 'reports'} onClick={() => setView('reports')} Icon={PieChart} label="Reports"/>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => fetchCurrent()}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-sniffy-purple transition"
            aria-label="Refresh"
          >
            <RefreshCw size={15}/>
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 pl-3 pr-4 py-2 rounded-full text-xs font-bold text-white shadow-sm hover:shadow-md transition"
            style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)' }}
          >
            <Plus size={14} strokeWidth={2.6}/> Add
          </button>
        </div>
      </div>

      {loadErr && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
          <AlertCircle size={14} className="mt-0.5 shrink-0"/>
          <span>{loadErr}</span>
        </div>
      )}

      {view === 'list' ? (
        <ListView
          rows={filteredRows}
          loading={loading}
          search={search}
          onSearch={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilter={setCategoryFilter}
          onRowClick={setDetail}
          user={user}
        />
      ) : (
        <ReportsView rows={rows} prevRows={prevRows}/>
      )}

      {/* Add / Edit modal */}
      <ExpenseFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        user={user}
        existing={editing}
      />

      {/* Detail panel (sheet) */}
      <DetailSheet
        row={detail}
        onClose={() => setDetail(null)}
        onEdit={handleEdit}
        onDelete={handleAskDelete}
        user={user}
      />

      {/* Delete confirm */}
      <ConfirmDelete
        row={pendingDelete}
        deleting={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function SummaryHeader({
  monthLabel, total, delta, onPrev, onNext, canGoNext,
}: {
  monthLabel: string;
  total:      number;
  delta:      { text: string; tone: 'up' | 'down' | 'flat' };
  onPrev:     () => void;
  onNext:     () => void;
  canGoNext:  boolean;
}) {
  const deltaColor =
    delta.tone === 'up'   ? 'text-red-100'
  : delta.tone === 'down' ? 'text-emerald-100'
  :                          'text-white/70';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden text-white relative"
      style={{
        background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)',
        boxShadow: '0 12px 36px rgba(69,26,139,0.25)',
      }}
    >
      {/* Decorative glare */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/10 rounded-full"/>
      <div className="absolute -bottom-16 -left-8 w-44 h-44 bg-white/5 rounded-full"/>

      <div className="relative px-5 py-5">
        {/* Month switcher */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onPrev}
            aria-label="Previous month"
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
          >
            <ChevronLeft size={16}/>
          </button>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Spent</p>
            <p className="text-sm font-semibold mt-0.5">{monthLabel}</p>
          </div>
          <button
            onClick={onNext}
            disabled={!canGoNext}
            aria-label="Next month"
            className={[
              'w-8 h-8 rounded-full flex items-center justify-center transition',
              canGoNext ? 'bg-white/15 hover:bg-white/25' : 'bg-white/5 cursor-not-allowed opacity-50',
            ].join(' ')}
          >
            <ChevronRight size={16}/>
          </button>
        </div>

        {/* Total + delta */}
        <div className="text-center">
          <p className="text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums">
            {fmtCurrency(total)}
          </p>
          <p className={`text-xs mt-2 ${deltaColor}`}>
            {delta.tone === 'flat'
              ? 'Same as last month'
              : <>{delta.text} {delta.tone === 'up' ? 'more' : 'less'} than last month</>}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SummaryTile({
  label, value, subValue, icon, tint,
}: {
  label: string; value: string; subValue?: string;
  icon: React.ReactNode; tint: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tint}`}>
          {icon}
        </div>
        <p className="text-xs font-semibold text-gray-500">{label}</p>
      </div>
      <p className="text-lg font-extrabold text-gray-900 mt-1.5 truncate">{value}</p>
      {subValue && <p className="text-[11px] text-gray-400">{subValue}</p>}
    </div>
  );
}

function ViewBtn({
  active, onClick, Icon, label,
}: {
  active: boolean;
  onClick: () => void;
  Icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition',
        active ? 'bg-white text-sniffy-purple shadow-sm' : 'text-gray-500 hover:text-gray-700',
      ].join(' ')}
    >
      <Icon size={13}/> {label}
    </button>
  );
}

// ─── List view ────────────────────────────────────────────────

function ListView({
  rows, loading, search, onSearch, categoryFilter, onCategoryFilter, onRowClick, user,
}: {
  rows: Expense[];
  loading: boolean;
  search: string;
  onSearch: (s: string) => void;
  categoryFilter: string;
  onCategoryFilter: (c: string) => void;
  onRowClick: (r: Expense) => void;
  user: AdminUser;
}) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search title, payer, vendor, notes…"
          className="w-full rounded-xl border border-gray-200 pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:border-sniffy-purple focus:ring-2 focus:ring-purple-100 transition"
        />
        {search && (
          <button
            onClick={() => onSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
            aria-label="Clear search"
          >
            <X size={13}/>
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="-mx-1 px-1 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max pb-1">
          <CategoryChip
            active={categoryFilter === ''}
            onClick={() => onCategoryFilter('')}
            label="All"
          />
          {EXPENSE_CATEGORIES.map(c => (
            <CategoryChip
              key={c.id}
              active={categoryFilter === c.id}
              onClick={() => onCategoryFilter(c.id)}
              label={c.label}
              colorBg={c.iconBg}
              colorText={c.iconText}
            />
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl"/>)}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState/>
      ) : (
        <div className="space-y-2">
          {rows.map(r => (
            <ExpenseRow key={r.id} row={r} onClick={() => onRowClick(r)} user={user}/>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  active, onClick, label, colorBg, colorText,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  colorBg?: string;
  colorText?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition',
        active
          ? (colorBg && colorText
              ? `${colorBg} ${colorText} border-transparent`
              : 'bg-sniffy-purple text-white border-transparent')
          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function ExpenseRow({ row, onClick, user: _user }: { row: Expense; onClick: () => void; user: AdminUser }) {
  const meta = categoryMeta(row.category);

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-2xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-sm transition px-3 py-3 flex items-center gap-3"
    >
      <div className={`w-11 h-11 rounded-full ${meta.iconBg} ${meta.iconText} flex items-center justify-center shrink-0`}>
        <Receipt size={18}/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{row.title}</p>
        <p className="text-[11px] text-gray-500 truncate">
          <span className="font-medium text-gray-600">{row.paid_by_name}</span>
          {row.vendor_or_payee && <> · {row.vendor_or_payee}</>}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-rose-500 tabular-nums">-{fmtCurrency(row.amount)}</p>
        <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400 mt-0.5">
          {row.proof_path && <Paperclip size={10}/>}
          <span>{fmtDate(row.expense_date)}</span>
        </div>
      </div>
    </motion.button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl bg-purple-50/40 border border-dashed border-purple-200 px-6 py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-white mx-auto flex items-center justify-center mb-3">
        <Wallet size={20} className="text-sniffy-purple"/>
      </div>
      <p className="text-sm font-semibold text-gray-700">No expenses yet</p>
      <p className="text-xs text-gray-500 mt-1">Tap the + button to log the first one.</p>
    </div>
  );
}

// ─── Reports view ─────────────────────────────────────────────

function ReportsView({ rows, prevRows }: { rows: Expense[]; prevRows: Expense[] }) {
  const [chartMode, setChartMode] = useState<'donut' | 'bar'>('donut');

  // Per-category totals
  const breakdown = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows)     m.set(r.category, (m.get(r.category) ?? 0) + Number(r.amount));
    const prevM = new Map<string, number>();
    for (const r of prevRows) prevM.set(r.category, (prevM.get(r.category) ?? 0) + Number(r.amount));
    const total = [...m.values()].reduce((s, x) => s + x, 0);
    const items = [...m.entries()].map(([cat, amt]) => ({
      cat,
      meta: categoryMeta(cat),
      amount: amt,
      pct: total ? (amt / total) * 100 : 0,
      delta: pctDelta(amt, prevM.get(cat) ?? 0),
    }));
    items.sort((a, b) => b.amount - a.amount);
    return { items, total };
  }, [rows, prevRows]);

  if (breakdown.items.length === 0) {
    return (
      <div className="rounded-3xl bg-purple-50/40 border border-dashed border-purple-200 px-6 py-10 text-center">
        <PieChart size={22} className="mx-auto text-sniffy-purple mb-2"/>
        <p className="text-sm font-semibold text-gray-700">Nothing to chart yet</p>
        <p className="text-xs text-gray-500 mt-1">Log a few expenses, then come back here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart card */}
      <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-800">Expense breakdown</p>
          <div className="inline-flex rounded-full bg-gray-100 p-0.5">
            <button
              onClick={() => setChartMode('bar')}
              className={[
                'w-8 h-7 rounded-full flex items-center justify-center transition',
                chartMode === 'bar' ? 'bg-white text-sniffy-purple shadow-sm' : 'text-gray-400',
              ].join(' ')}
              aria-label="Bar chart"
            >
              <BarChart3 size={13}/>
            </button>
            <button
              onClick={() => setChartMode('donut')}
              className={[
                'w-8 h-7 rounded-full flex items-center justify-center transition',
                chartMode === 'donut' ? 'bg-sniffy-purple text-white shadow-sm' : 'text-gray-400',
              ].join(' ')}
              aria-label="Donut chart"
            >
              <PieChart size={13}/>
            </button>
          </div>
        </div>

        {chartMode === 'donut'
          ? <DonutChart items={breakdown.items} total={breakdown.total}/>
          : <BarChart   items={breakdown.items} total={breakdown.total}/>}
      </div>

      {/* Breakdown list */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">All Categories</p>
        {breakdown.items.map(b => (
          <CategoryReportRow key={b.cat} item={b}/>
        ))}
      </div>
    </div>
  );
}

interface BreakdownItem {
  cat: string;
  meta: ReturnType<typeof categoryMeta>;
  amount: number;
  pct: number;
  delta: { text: string; tone: 'up' | 'down' | 'flat' };
}

function DonutChart({ items, total }: { items: BreakdownItem[]; total: number }) {
  // SVG donut. Simple, no external chart library — keeps the chunk small.
  const size = 220;
  const stroke = 36;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  // Render arcs sequentially using stroke-dasharray.
  let acc = 0;
  const slices = items.map(it => {
    const len = (it.pct / 100) * c;
    const dash = `${len} ${c - len}`;
    const offset = c - acc;
    acc += len;
    return { it, dash, offset };
  });

  // Highlight the largest slice with its % in the centre.
  const biggest = items[0];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#f3f4f6" strokeWidth={stroke}
          />
          {slices.map((s, i) => (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke={s.it.meta.chartColor}
              strokeWidth={stroke}
              strokeDasharray={s.dash}
              strokeDashoffset={-((s.offset - c) % c)}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total</p>
          <p className="text-xl font-extrabold text-gray-900 tabular-nums">{fmtCurrency(total)}</p>
          {biggest && (
            <p className="text-[10px] text-gray-500 mt-1">
              <span className="font-semibold" style={{ color: biggest.meta.chartColor }}>
                {biggest.meta.label}
              </span>
              {' · '}{biggest.pct.toFixed(0)}%
            </p>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 w-full">
        {items.slice(0, 6).map(b => (
          <div key={b.cat} className="flex items-center gap-2 text-xs min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: b.meta.chartColor }}
            />
            <span className="text-gray-600 truncate flex-1">{b.meta.label}</span>
            <span className="text-gray-400 tabular-nums">{b.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ items, total: _total }: { items: BreakdownItem[]; total: number }) {
  const max = Math.max(...items.map(i => i.amount));
  return (
    <div className="space-y-3 py-2">
      {items.map(b => (
        <div key={b.cat}>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs font-semibold text-gray-700">{b.meta.label}</span>
            <span className="text-[11px] font-semibold text-gray-500 tabular-nums">{fmtCurrency(b.amount)}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${max ? (b.amount / max) * 100 : 0}%`,
                background: b.meta.chartColor,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryReportRow({ item }: { item: BreakdownItem }) {
  const deltaTone =
    item.delta.tone === 'up'   ? 'text-rose-500 bg-rose-50'
  : item.delta.tone === 'down' ? 'text-emerald-600 bg-emerald-50'
  :                                'text-gray-400 bg-gray-50';

  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${item.meta.iconBg} ${item.meta.iconText} flex items-center justify-center shrink-0`}>
          <Receipt size={16}/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold text-gray-900 truncate">{item.meta.label}</p>
            <p className="text-sm font-bold text-gray-900 tabular-nums">{fmtCurrency(item.amount)}</p>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-0.5">
            <span className="text-gray-500">{item.pct.toFixed(1)}% of total</span>
            <span className={`px-1.5 py-0.5 rounded-md font-semibold ${deltaTone}`}>
              {item.delta.text} vs last month
            </span>
          </div>
        </div>
      </div>
      <div className="h-1.5 mt-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${item.pct}%`, background: item.meta.chartColor }}
        />
      </div>
    </div>
  );
}

// ─── Detail sheet ─────────────────────────────────────────────

function DetailSheet({
  row, onClose, onEdit, onDelete, user,
}: {
  row: Expense | null;
  onClose: () => void;
  onEdit: (r: Expense) => void;
  onDelete: (r: Expense) => void;
  user: AdminUser;
}) {
  const [proofUrl, setProofUrl]   = useState<string | null>(null);
  const [proofErr, setProofErr]   = useState<string | null>(null);
  const [proofLoad, setProofLoad] = useState(false);

  useEffect(() => {
    setProofUrl(null);
    setProofErr(null);
    if (!row?.proof_path) return;
    setProofLoad(true);
    getSignedProofUrl(row.proof_path)
      .then(setProofUrl)
      .catch(e => setProofErr(e?.message ?? 'Could not load proof'))
      .finally(() => setProofLoad(false));
  }, [row]);

  return (
    <AnimatePresence>
      {row && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col"
            style={{ maxHeight: '88vh' }}
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {(() => {
              const meta = categoryMeta(row.category);
              const mine = canModifyExpense(row, user.id);
              return (
                <>
                  <div className="px-5 py-4 flex items-start justify-between text-white relative overflow-hidden"
                       style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)' }}>
                    <div className="relative">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                        {meta.label}
                      </p>
                      <h3 className="text-lg font-extrabold leading-tight">{row.title}</h3>
                      <p className="text-2xl font-extrabold mt-2 tabular-nums">-{fmtCurrency(row.amount)}</p>
                    </div>
                    <button onClick={onClose} aria-label="Close"
                      className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition">
                      <X size={18}/>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 text-sm">
                    <DetailRow label="Date"        value={fmtDate(row.expense_date)}/>
                    <DetailRow label="Paid by"     value={`${row.paid_by_name}${row.paid_by_role ? ` (${row.paid_by_role})` : ''}`}/>
                    {row.vendor_or_payee && <DetailRow label="Paid to"  value={row.vendor_or_payee}/>}
                    {row.payment_method  && <DetailRow label="Method"   value={row.payment_method.toUpperCase()}/>}
                    {row.notes           && <DetailRow label="Notes"    value={row.notes}/>}
                    <DetailRow label="Logged by" value={`${row.created_by_name} · ${fmtDate(row.created_at)}`}/>

                    {/* Proof preview */}
                    {row.proof_path && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Receipt</p>
                        {proofLoad && (
                          <div className="rounded-xl bg-gray-50 h-32 flex items-center justify-center">
                            <Loader2 size={18} className="animate-spin text-gray-400"/>
                          </div>
                        )}
                        {proofErr && (
                          <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600">
                            {proofErr}
                          </div>
                        )}
                        {proofUrl && (
                          row.proof_mime?.startsWith('image/')
                            ? <img
                                src={proofUrl} alt="proof"
                                className="rounded-xl w-full max-h-96 object-contain bg-gray-50 border border-gray-100"
                              />
                            : <a
                                href={proofUrl} target="_blank" rel="noopener"
                                className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-3 hover:bg-gray-50 transition"
                              >
                                <FileTextIcon size={20} className="text-sniffy-purple"/>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{row.proof_name ?? 'View file'}</p>
                                  <p className="text-[10px] text-gray-400">Tap to open in new tab</p>
                                </div>
                                <Eye size={15} className="text-gray-400"/>
                              </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-3">
                    {mine ? (
                      <>
                        <button
                          onClick={() => onDelete(row)}
                          className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 transition flex items-center justify-center gap-2"
                        >
                          <Trash2 size={15}/> Delete
                        </button>
                        <button
                          onClick={() => onEdit(row)}
                          className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2"
                          style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)' }}
                        >
                          <Pencil size={15}/> Edit
                        </button>
                      </>
                    ) : (
                      <p className="flex-1 text-center text-[11px] text-gray-400">
                        Only {row.created_by_name} can edit or delete this entry.
                      </p>
                    )}
                  </div>
                </>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
      <p className="text-sm text-gray-800 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

// ─── Confirm delete ───────────────────────────────────────────

function ConfirmDelete({
  row, deleting, onCancel, onConfirm,
}: {
  row: Expense | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {row && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-5"
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 mx-auto flex items-center justify-center mb-3">
              <Trash2 size={20} className="text-rose-500"/>
            </div>
            <h3 className="text-base font-bold text-center text-gray-900">Delete this expense?</h3>
            <p className="text-xs text-center text-gray-500 mt-1">
              "<span className="font-medium text-gray-700">{row.title}</span>" of {fmtCurrency(row.amount)}.
              This can't be undone.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={onCancel}
                disabled={deleting}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={deleting}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 transition flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={15} className="animate-spin"/> : <>Delete</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
