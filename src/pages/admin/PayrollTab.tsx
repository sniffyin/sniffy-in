/**
 * admin/PayrollTab.tsx — Phase 6 (Payroll · HRMS-style)
 *
 * Single-tab payroll hub.  Three nested views, switched via inline
 * sub-nav (no React Router) so the rest of the admin dashboard stays
 * untouched:
 *
 *   1. Runs      — list of payroll runs, "Create new run" button.
 *   2. Run detail — list of entries for a run.  Each row expands to
 *                   an editor with manual bonus / advance / custom
 *                   deduction inputs, recompute button, and "Generate
 *                   PDF" download.  Finalise run locks every entry.
 *   3. Compensation — per-groomer salary structure editor.  Toggles
 *                   for PF / ESI / PT / TDS (user explicitly asked for
 *                   them to be per-employee, not company-wide).
 *
 * Everything runs against the new tables introduced in
 * `20260528000000_phase6_payroll.sql`.  The SQL function
 * `compute_payroll_entry()` re-derives auto-pulled numbers (present
 * days, paid leaves, session counts) from grooming_sessions +
 * groomer_leaves; the UI just calls that and re-renders.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Plus, RefreshCw, AlertCircle, X, Loader2,
  Users, Calendar, ChevronRight, ChevronLeft, ChevronDown,
  FileText, Lock, Download, Save, Trash2, Settings2, Eye,
  IndianRupee,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getSessionUser } from './authStore';
import {
  GroomerCompensation, PayrollRun, PayrollEntry,
  fetchAllCompensation, upsertCompensation, blankCompensation,
  listPayrollRuns, createPayrollRun, finalisePayrollRun, deletePayrollRun,
  fetchPayrollEntries, updatePayrollEntry, recomputeEntry, markPdfGenerated,
  fmtMoney, fmtMoneyDecimal, periodLabel, MONTH_NAMES,
  workingDaysExcludingSundays,
} from './payrollApi';
import { downloadSalarySlip, buildSalarySlipBlob } from './salarySlipPdf';
import { ON_TIME_BONUS, REVIEW_BONUS } from '../groomer/incentivesApi';

// ─── Types ───────────────────────────────────────────────────────────

type View = 'runs' | 'run_detail' | 'compensation';

interface GroomerOption {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'on_leave';
}

// ─── Component ───────────────────────────────────────────────────────

export default function PayrollTab() {
  const currentUser = getSessionUser();
  const operatorName = currentUser?.name ?? 'Coordinator';

  const [view, setView]     = useState<View>('runs');
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  // Shared data
  const [groomers, setGroomers] = useState<GroomerOption[]>([]);
  const [error, setError]       = useState<string | null>(null);

  // Load active groomer roster once — used by both Runs (to show
  // "x groomers seeded") and Compensation (to know who needs a row).
  const loadGroomers = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('groomers')
      .select('id, name, status')
      .order('status', { ascending: true })
      .order('name');
    if (err) {
      setError(err.message);
      return;
    }
    setGroomers((data ?? []) as GroomerOption[]);
  }, []);

  useEffect(() => { loadGroomers(); }, [loadGroomers]);

  return (
    <div className="pb-10">
      {/* Header */}
      <header className="mb-5 flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #451a8b)' }}
        >
          <Wallet size={20}/>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">Payroll</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Set up salary structures, run payroll for any month, and download per-groomer salary slips.
          </p>
        </div>
      </header>

      {/* Sub-nav */}
      <nav className="flex gap-2 mb-5 flex-wrap">
        <SubNavBtn
          label="Runs"
          icon={Calendar}
          active={view === 'runs' || view === 'run_detail'}
          onClick={() => { setView('runs'); }}
        />
        <SubNavBtn
          label="Compensation"
          icon={Settings2}
          active={view === 'compensation'}
          onClick={() => { setView('compensation'); }}
        />
      </nav>

      {error && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500"/>
          <div className="flex-1 min-w-0">
            <p className="font-bold">Payroll error</p>
            <p className="text-xs mt-0.5 text-red-500 break-all">{error}</p>
            <p className="text-[11px] mt-2 text-red-400">
              If this mentions <code className="font-mono">payroll_runs</code> not existing,
              apply migration <code className="font-mono">20260528000000_phase6_payroll.sql</code> first.
            </p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X size={14}/>
          </button>
        </div>
      )}

      {view === 'runs' && (
        <RunsList
          onError={setError}
          onOpenRun={(id) => { setActiveRunId(id); setView('run_detail'); }}
        />
      )}

      {view === 'run_detail' && activeRunId && (
        <RunDetail
          runId={activeRunId}
          operatorName={operatorName}
          onError={setError}
          onBack={() => { setActiveRunId(null); setView('runs'); }}
        />
      )}

      {view === 'compensation' && (
        <CompensationManager
          groomers={groomers}
          operatorName={operatorName}
          onError={setError}
        />
      )}
    </div>
  );
}

function SubNavBtn({ label, icon: Icon, active, onClick }: {
  label: string; icon: React.ElementType; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
        active
          ? 'bg-sniffy-purple text-white border-sniffy-purple shadow-sm'
          : 'bg-white text-gray-600 border-gray-200 hover:border-sniffy-purple/40'
      }`}
    >
      <Icon size={14}/>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// VIEW 1 — Runs list
// ─────────────────────────────────────────────────────────────────────

function RunsList({ onError, onOpenRun }: {
  onError: (msg: string | null) => void;
  onOpenRun: (id: string) => void;
}) {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    onError(null);
    try {
      setRuns(await listPayrollRuns());
    } finally { setLoading(false); }
  }, [onError]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(run: PayrollRun) {
    if (run.status === 'finalised') return;
    if (!window.confirm(`Delete draft run for ${periodLabel(run)}? All draft entries will be lost.`)) return;
    const res = await deletePayrollRun(run.id);
    if (!res.ok) onError(res.error ?? 'Could not delete run.');
    else load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {runs.length} {runs.length === 1 ? 'run' : 'runs'}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-sniffy-purple disabled:opacity-40 transition font-semibold"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-sniffy-purple transition active:scale-95"
          >
            <Plus size={12}/> New payroll run
          </button>
        </div>
      </div>

      <NewRunModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreated={(id) => { setShowNew(false); load(); onOpenRun(id); }}
        onError={onError}
      />

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl"/>)}
        </div>
      ) : runs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
          <Wallet size={28} className="mx-auto text-gray-300 mb-3"/>
          <p className="text-sm font-bold text-gray-700">No payroll runs yet</p>
          <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
            Click "New payroll run" to seed entries for every active groomer with auto-pulled attendance and session counts.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {runs.map(r => (
            <div key={r.id}
              className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-sniffy-purple/40 transition"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                r.status === 'finalised' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {r.status === 'finalised' ? <Lock size={18}/> : <FileText size={18}/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-gray-900">
                  {periodLabel(r)}
                  {r.label && <span className="text-gray-400 font-normal text-xs ml-1.5">· {r.label}</span>}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {r.status === 'finalised'
                    ? `Finalised ${new Date(r.finalised_at!).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric'})}${r.finalised_by ? ` by ${r.finalised_by}` : ''}`
                    : `Draft · ${r.working_days_basis} working days`}
                </p>
              </div>
              <button
                onClick={() => onOpenRun(r.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-sniffy-purple bg-purple-50 border border-purple-200 hover:bg-purple-100 transition"
              >
                Open <ChevronRight size={11}/>
              </button>
              {r.status === 'draft' && (
                <button
                  onClick={() => handleDelete(r)}
                  title="Delete draft run"
                  className="p-1.5 text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 size={14}/>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewRunModal({ open, onClose, onCreated, onError }: {
  open: boolean;
  onClose: () => void;
  onCreated: (run_id: string) => void;
  onError: (msg: string | null) => void;
}) {
  const today = new Date();
  // Default to the just-finished month, since payroll is run after
  // the period closes.
  const defaultMonth = today.getMonth() === 0 ? 12 : today.getMonth();
  const defaultYear  = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();

  const [year, setYear]   = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [wdays, setWdays] = useState(() => workingDaysExcludingSundays(defaultYear, defaultMonth));
  const [label, setLabel] = useState('');
  const [busy, setBusy]   = useState(false);

  // Keep working-days suggestion in sync with the period selector
  // until the user manually overrides it.
  const [manualOverride, setManualOverride] = useState(false);
  useEffect(() => {
    if (!manualOverride) setWdays(workingDaysExcludingSundays(year, month));
  }, [year, month, manualOverride]);

  async function submit() {
    setBusy(true);
    onError(null);
    try {
      const res = await createPayrollRun(year, month, wdays, label.trim() || null, 'coordinator');
      if (!res.ok || !res.run) {
        onError(res.error ?? 'Could not create run.');
        return;
      }
      onCreated(res.run.id);
    } finally { setBusy(false); }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-gray-900">New payroll run</h3>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={16}/>
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Month</span>
                  <select
                    value={month}
                    onChange={e => setMonth(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-sniffy-purple"
                  >
                    {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Year</span>
                  <input
                    type="number"
                    min={2024}
                    max={2100}
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sniffy-purple"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Working days (used for pro-rating)</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={wdays}
                  onChange={e => { setManualOverride(true); setWdays(Number(e.target.value)); }}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sniffy-purple"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Suggested: <strong>{workingDaysExcludingSundays(year, month)}</strong> (calendar days minus Sundays). Override if you treat fewer days as full-pay.
                </p>
              </label>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Label (optional)</span>
                <input
                  type="text"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="e.g. final, mid-month bonus"
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sniffy-purple"
                />
              </label>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-sniffy-purple">
                Creating this run will seed one draft entry per <strong>active</strong> groomer and auto-pull their attendance / session counts for {MONTH_NAMES[month - 1]} {year}.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100">
              <button onClick={onClose} disabled={busy} className="text-sm font-semibold text-gray-500 hover:text-gray-700">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={busy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-sniffy-purple disabled:opacity-60 transition active:scale-95"
              >
                {busy ? <Loader2 size={13} className="animate-spin"/> : <Plus size={13}/>}
                Create run
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────
// VIEW 2 — Run detail (per-entry editor + PDF generation)
// ─────────────────────────────────────────────────────────────────────

function RunDetail({ runId, operatorName, onError, onBack }: {
  runId: string;
  operatorName: string;
  onError: (msg: string | null) => void;
  onBack: () => void;
}) {
  const [run, setRun] = useState<PayrollRun | null>(null);
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [finaliseBusy, setFinaliseBusy] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    onError(null);
    try {
      const [{ data: runRow, error: runErr }, entryRows] = await Promise.all([
        supabase.from('payroll_runs').select('*').eq('id', runId).maybeSingle(),
        fetchPayrollEntries(runId),
      ]);
      if (runErr) { onError(runErr.message); return; }
      setRun((runRow as PayrollRun) ?? null);
      setEntries(entryRows);
    } finally { setLoading(false); }
  }, [runId, onError]);

  useEffect(() => { load(); }, [load]);

  // Clean up preview blob URL when component unmounts or url changes.
  useEffect(() => {
    return () => { if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl); };
  }, [previewBlobUrl]);

  const totals = useMemo(() => {
    return entries.reduce((acc, e) => ({
      gross: acc.gross + Number(e.gross_earnings ?? 0),
      ded:   acc.ded   + Number(e.total_deductions ?? 0),
      net:   acc.net   + Number(e.net_pay ?? 0),
    }), { gross: 0, ded: 0, net: 0 });
  }, [entries]);

  async function recompute(entry: PayrollEntry) {
    onError(null);
    const res = await recomputeEntry(entry.id);
    if (!res.ok) { onError(res.error ?? 'Recompute failed.'); return; }
    await load();
  }

  async function recomputeAll() {
    onError(null);
    for (const e of entries) {
      if (e.status === 'locked') continue;
      const res = await recomputeEntry(e.id);
      if (!res.ok) { onError(`Recompute failed for ${e.groomer_name}: ${res.error}`); return; }
    }
    load();
  }

  async function generatePdf(entry: PayrollEntry) {
    if (!run) return;
    try {
      await downloadSalarySlip({ entry, run });
      await markPdfGenerated(entry.id);
      load();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'PDF generation failed.');
    }
  }

  async function previewPdf(entry: PayrollEntry) {
    if (!run) return;
    // Building the slip is async now (jsPDF is code-split), so the
    // window.open() would land outside the click's user-gesture window and
    // get swallowed by the popup blocker.  Claim the tab synchronously
    // here, then point it at the blob once the PDF is ready.
    const tab = window.open('', '_blank', 'noopener,noreferrer');
    try {
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
      const blob = await buildSalarySlipBlob({ entry, run });
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
      if (tab) tab.location.href = url;
      else window.open(url, '_blank', 'noopener,noreferrer');   // blocker fallback
    } catch (err) {
      tab?.close();
      onError(err instanceof Error ? err.message : 'PDF preview failed.');
    }
  }

  async function finalise() {
    if (!run) return;
    if (!window.confirm(`Finalise ${periodLabel(run)}? All entries will be locked from further edits.`)) return;
    setFinaliseBusy(true);
    onError(null);
    const res = await finalisePayrollRun(runId, operatorName);
    setFinaliseBusy(false);
    if (!res.ok) { onError(res.error ?? 'Could not finalise.'); return; }
    load();
  }

  if (loading) return (
    <div className="space-y-3 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl"/>)}
    </div>
  );
  if (!run) return (
    <div className="text-center py-12">
      <p className="text-sm text-gray-500">Run not found.</p>
      <button onClick={onBack} className="mt-2 text-xs font-bold text-sniffy-purple">← Back to runs</button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onBack} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-sniffy-purple transition">
          <ChevronLeft size={13}/> Back
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-extrabold text-gray-900 leading-tight">
            {periodLabel(run)}
            {run.label && <span className="text-gray-400 font-normal text-sm ml-2">{run.label}</span>}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {run.status === 'draft' ? 'Draft' : 'Finalised'} · {entries.length} entries · {run.working_days_basis} working days
          </p>
        </div>
        <button
          onClick={recomputeAll}
          disabled={run.status === 'finalised'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-700 bg-white border border-gray-200 hover:border-sniffy-purple/40 disabled:opacity-50 transition"
        >
          <RefreshCw size={11}/> Recompute all
        </button>
        {run.status === 'draft' && (
          <button
            onClick={finalise}
            disabled={finaliseBusy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-emerald-600 disabled:opacity-60 transition active:scale-95"
          >
            {finaliseBusy ? <Loader2 size={11} className="animate-spin"/> : <Lock size={11}/>}
            Finalise &amp; lock
          </button>
        )}
      </div>

      {/* Totals summary */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryStat label="Total earnings" value={fmtMoney(totals.gross)} tone="earn"/>
        <SummaryStat label="Total deductions" value={fmtMoney(totals.ded)} tone="ded"/>
        <SummaryStat label="Total net" value={fmtMoney(totals.net)} tone="net"/>
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-2xl">
            <p className="text-sm text-gray-500 font-bold">No entries on this run</p>
            <p className="text-[11px] text-gray-400 mt-1">Seeding may have failed — try opening "Compensation" to verify groomer rows, then re-create the run.</p>
          </div>
        ) : entries.map(e => (
          <EntryCard
            key={e.id}
            entry={e}
            locked={run.status === 'finalised'}
            expanded={expandedId === e.id}
            onToggle={() => setExpandedId(prev => prev === e.id ? null : e.id)}
            onRecompute={() => recompute(e)}
            onGeneratePdf={() => generatePdf(e)}
            onPreview={() => previewPdf(e)}
            onPatched={() => load()}
            onError={onError}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: string; tone: 'earn'|'ded'|'net' }) {
  const cls =
    tone === 'earn' ? 'bg-purple-50 border-purple-200 text-sniffy-purple' :
    tone === 'ded'  ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      'bg-emerald-50 border-emerald-200 text-emerald-700';
  return (
    <div className={`px-3 py-2.5 rounded-2xl border ${cls}`}>
      <p className="text-[9px] uppercase tracking-wider font-bold opacity-70">{label}</p>
      <p className="text-base font-extrabold mt-0.5">{value}</p>
    </div>
  );
}

function EntryCard({ entry, locked, expanded, onToggle, onRecompute, onGeneratePdf, onPreview, onPatched, onError }: {
  entry: PayrollEntry;
  locked: boolean;
  expanded: boolean;
  onToggle: () => void;
  onRecompute: () => void;
  onGeneratePdf: () => void;
  onPreview: () => void;
  onPatched: () => void;
  onError: (msg: string | null) => void;
}) {
  // Local edit state — only sent on Save.  We keep these as strings so
  // empty inputs work naturally; convert on persist.
  const [bonus, setBonus]               = useState<string>(String(entry.earnings_bonus ?? 0));
  const [bonusNote, setBonusNote]       = useState<string>(entry.earnings_bonus_note ?? '');
  const [arrear, setArrear]             = useState<string>(String(entry.earnings_arrear ?? 0));
  const [arrearNote, setArrearNote]     = useState<string>(entry.earnings_arrear_note ?? '');
  const [otherE, setOtherE]             = useState<string>(String(entry.earnings_other_custom ?? 0));
  const [otherELabel, setOtherELabel]   = useState<string>(entry.earnings_other_custom_label ?? '');
  const [adv, setAdv]                   = useState<string>(String(entry.deductions_advance ?? 0));
  const [advNote, setAdvNote]           = useState<string>(entry.deductions_advance_note ?? '');
  const [otherD, setOtherD]             = useState<string>(String(entry.deductions_other ?? 0));
  const [otherDLabel, setOtherDLabel]   = useState<string>(entry.deductions_other_label ?? '');
  const [notes, setNotes]               = useState<string>(entry.notes ?? '');
  const [saving, setSaving]             = useState(false);

  // Re-seed local state when the row reloads.
  useEffect(() => {
    setBonus(String(entry.earnings_bonus ?? 0));
    setBonusNote(entry.earnings_bonus_note ?? '');
    setArrear(String(entry.earnings_arrear ?? 0));
    setArrearNote(entry.earnings_arrear_note ?? '');
    setOtherE(String(entry.earnings_other_custom ?? 0));
    setOtherELabel(entry.earnings_other_custom_label ?? '');
    setAdv(String(entry.deductions_advance ?? 0));
    setAdvNote(entry.deductions_advance_note ?? '');
    setOtherD(String(entry.deductions_other ?? 0));
    setOtherDLabel(entry.deductions_other_label ?? '');
    setNotes(entry.notes ?? '');
  }, [entry]);

  async function saveAndRecompute() {
    setSaving(true);
    onError(null);
    try {
      const res = await updatePayrollEntry(entry.id, {
        earnings_bonus:              Number(bonus) || 0,
        earnings_bonus_note:         bonusNote.trim() || null,
        earnings_arrear:             Number(arrear) || 0,
        earnings_arrear_note:        arrearNote.trim() || null,
        earnings_other_custom:       Number(otherE) || 0,
        earnings_other_custom_label: otherELabel.trim() || null,
        deductions_advance:          Number(adv) || 0,
        deductions_advance_note:     advNote.trim() || null,
        deductions_other:            Number(otherD) || 0,
        deductions_other_label:      otherDLabel.trim() || null,
        notes:                       notes.trim() || null,
      });
      if (!res.ok) { onError(res.error ?? 'Save failed.'); return; }
      const rec = await recomputeEntry(entry.id);
      if (!rec.ok) { onError(rec.error ?? 'Recompute failed.'); return; }
      onPatched();
    } finally { setSaving(false); }
  }

  const numCls = "w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-sniffy-purple";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Compact row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3.5 hover:bg-gray-50 transition text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-purple-50 text-sniffy-purple flex items-center justify-center shrink-0 font-bold text-sm">
          {(entry.groomer_name || '?').slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-gray-900 truncate flex items-center gap-1.5">
            {entry.groomer_name}
            {entry.status === 'locked' && (
              <span className="text-[9px] font-bold bg-gray-100 text-gray-500 border border-gray-200 rounded-full px-1.5 py-0">LOCKED</span>
            )}
            {entry.last_pdf_generated_at && (
              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-1.5 py-0">PDF ✓</span>
            )}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {entry.payable_days}/{entry.working_days}d · {entry.sessions_total_count} sessions
            ({entry.sessions_dog_count}🐶 / {entry.sessions_cat_count}🐱)
            {entry.lwp_days > 0 && <> · LWP {entry.lwp_days}d</>}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-extrabold text-sniffy-purple">{fmtMoney(entry.net_pay)}</p>
          <p className="text-[10px] text-gray-400">Gross {fmtMoney(entry.gross_earnings)} · Ded {fmtMoney(entry.total_deductions)}</p>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}/>
      </button>

      {/* Expanded editor */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-4 bg-gray-50 space-y-4">
              {/* Computed earnings + deductions read-only summary */}
              <div className="grid grid-cols-2 gap-3">
                <BreakdownPanel title="Earnings (computed)" rows={[
                  ['Basic',         fmtMoneyDecimal(entry.earnings_basic)],
                  ['HRA',           fmtMoneyDecimal(entry.earnings_hra)],
                  ['Conveyance',    fmtMoneyDecimal(entry.earnings_conveyance)],
                  ['Medical',       fmtMoneyDecimal(entry.earnings_medical)],
                  ['Special',       fmtMoneyDecimal(entry.earnings_special)],
                  ['Other allowance', fmtMoneyDecimal(entry.earnings_other)],
                  ['Session incentive', fmtMoneyDecimal(entry.earnings_incentive)],
                ]}/>
                <BreakdownPanel title="Deductions (auto)" rows={[
                  ['PF (employee)', fmtMoneyDecimal(entry.deductions_pf)],
                  ['PF (employer, info)', fmtMoneyDecimal(entry.deductions_pf_employer)],
                  ['ESI',           fmtMoneyDecimal(entry.deductions_esi)],
                  ['Professional Tax', fmtMoneyDecimal(entry.deductions_pt)],
                  ['TDS',           fmtMoneyDecimal(entry.deductions_tds)],
                ]}/>
              </div>

              {/* Manual lines */}
              <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Manual adjustments</p>

                <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                  <label className="text-[11px] font-bold text-gray-600">Bonus</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" disabled={locked} className={numCls} value={bonus} onChange={e => setBonus(e.target.value)} placeholder="0"/>
                    <input type="text"   disabled={locked} className={numCls} value={bonusNote} onChange={e => setBonusNote(e.target.value)} placeholder="Reason / period"/>
                  </div>

                  <label className="text-[11px] font-bold text-gray-600">Arrears</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" disabled={locked} className={numCls} value={arrear} onChange={e => setArrear(e.target.value)} placeholder="0"/>
                    <input type="text"   disabled={locked} className={numCls} value={arrearNote} onChange={e => setArrearNote(e.target.value)} placeholder="Reason"/>
                  </div>

                  <label className="text-[11px] font-bold text-gray-600">Other earn.</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" disabled={locked} className={numCls} value={otherE} onChange={e => setOtherE(e.target.value)} placeholder="0"/>
                    <input type="text"   disabled={locked} className={numCls} value={otherELabel} onChange={e => setOtherELabel(e.target.value)} placeholder="Label"/>
                  </div>

                  <label className="text-[11px] font-bold text-gray-600">Advance</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" disabled={locked} className={numCls} value={adv} onChange={e => setAdv(e.target.value)} placeholder="0"/>
                    <input type="text"   disabled={locked} className={numCls} value={advNote} onChange={e => setAdvNote(e.target.value)} placeholder="Reason"/>
                  </div>

                  <label className="text-[11px] font-bold text-gray-600">Other ded.</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" disabled={locked} className={numCls} value={otherD} onChange={e => setOtherD(e.target.value)} placeholder="0"/>
                    <input type="text"   disabled={locked} className={numCls} value={otherDLabel} onChange={e => setOtherDLabel(e.target.value)} placeholder="Label"/>
                  </div>

                  <label className="text-[11px] font-bold text-gray-600">Notes</label>
                  <input type="text" disabled={locked} className={numCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes (also printed on slip)"/>
                </div>

                {!locked && (
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={onRecompute}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-700 bg-white border border-gray-200 hover:border-sniffy-purple/40 transition"
                    >
                      <RefreshCw size={11}/> Pull fresh activity
                    </button>
                    <button
                      onClick={saveAndRecompute}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-sniffy-purple disabled:opacity-60 transition active:scale-95"
                    >
                      {saving ? <Loader2 size={11} className="animate-spin"/> : <Save size={11}/>}
                      Save &amp; recompute
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom action row */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={onPreview}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-700 bg-white border border-gray-200 hover:border-sniffy-purple/40 transition active:scale-95"
                >
                  <Eye size={11}/> Preview PDF
                </button>
                <button
                  onClick={onGeneratePdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-sniffy-purple transition active:scale-95"
                >
                  <Download size={11}/> Generate &amp; download
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BreakdownPanel({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">{title}</p>
      <div className="space-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-[11px]">
            <span className="text-gray-600">{k}</span>
            <span className="font-bold text-gray-800 font-mono">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// VIEW 3 — Compensation manager
// ─────────────────────────────────────────────────────────────────────

function CompensationManager({ groomers, operatorName, onError }: {
  groomers: GroomerOption[];
  operatorName: string;
  onError: (msg: string | null) => void;
}) {
  const [comps, setComps] = useState<GroomerCompensation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroomerId, setSelectedGroomerId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    onError(null);
    try {
      setComps(await fetchAllCompensation());
    } finally { setLoading(false); }
  }, [onError]);

  useEffect(() => { load(); }, [load]);

  const compByGroomer = useMemo(() => {
    const m = new Map<string, GroomerCompensation>();
    for (const c of comps) m.set(c.groomer_id, c);
    return m;
  }, [comps]);

  // Roster = union of active groomers and any compensation rows that
  // belong to groomers no longer in the `groomers` table.
  const roster = useMemo(() => {
    const seen = new Set<string>();
    const out: Array<{ id: string; name: string; comp?: GroomerCompensation }> = [];
    for (const g of groomers) {
      seen.add(g.id);
      out.push({ id: g.id, name: g.name, comp: compByGroomer.get(g.id) });
    }
    for (const c of comps) {
      if (!seen.has(c.groomer_id)) {
        out.push({ id: c.groomer_id, name: c.groomer_name + ' (inactive)', comp: c });
      }
    }
    return out;
  }, [groomers, comps, compByGroomer]);

  const selectedRow = selectedGroomerId
    ? roster.find(r => r.id === selectedGroomerId)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      {/* Roster */}
      <div className="bg-white border border-gray-100 rounded-2xl p-2 space-y-1 max-h-[640px] overflow-y-auto">
        <div className="px-2 py-1.5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Groomers</p>
          <button onClick={load} disabled={loading} className="text-gray-400 hover:text-sniffy-purple">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''}/>
          </button>
        </div>
        {loading ? (
          <div className="space-y-1 animate-pulse px-1">
            {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg"/>)}
          </div>
        ) : roster.length === 0 ? (
          <p className="text-[11px] text-gray-400 italic px-2 py-3">No groomers in roster yet.</p>
        ) : roster.map(r => (
          <button
            key={r.id}
            onClick={() => setSelectedGroomerId(r.id)}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition ${
              selectedGroomerId === r.id
                ? 'bg-purple-50 border border-purple-200'
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold shrink-0">
              {(r.name || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{r.name}</p>
              <p className="text-[10px] text-gray-400">
                {r.comp ? `${fmtMoney(monthlyCtc(r.comp))} CTC` : 'No structure yet'}
              </p>
            </div>
            {r.comp && r.comp.pf_enabled && <span className="text-[8px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0">PF</span>}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div>
        {!selectedRow ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
            <Users size={28} className="mx-auto text-gray-300 mb-3"/>
            <p className="text-sm font-bold text-gray-700">Select a groomer</p>
            <p className="text-[11px] text-gray-400 mt-1">Pick someone from the roster to set up their salary structure.</p>
          </div>
        ) : (
          <CompensationEditor
            groomerId={selectedRow.id}
            groomerName={selectedRow.name.replace(/ \(inactive\)$/, '')}
            existing={selectedRow.comp ?? null}
            operatorName={operatorName}
            onError={onError}
            onSaved={load}
          />
        )}
      </div>
    </div>
  );
}

function monthlyCtc(c: GroomerCompensation): number {
  return Number(c.basic_monthly) + Number(c.hra_monthly) + Number(c.conveyance_monthly)
       + Number(c.medical_monthly) + Number(c.special_allowance_monthly) + Number(c.other_allowance_monthly);
}

function CompensationEditor({ groomerId, groomerName, existing, operatorName, onError, onSaved }: {
  groomerId: string;
  groomerName: string;
  existing: GroomerCompensation | null;
  operatorName: string;
  onError: (msg: string | null) => void;
  onSaved: () => void;
}) {
  // Cast to GroomerCompensation so keyof indexing in numField/txtField
  // works without union-narrowing.  For a fresh row, id/created_at/
  // updated_at stay undefined until the upsert returns the saved row;
  // we never read those fields here so the assertion is safe.
  const init = (existing ?? { ...blankCompensation(groomerId, groomerName), created_by: operatorName }) as GroomerCompensation;
  const [draft, setDraft] = useState<GroomerCompensation>(init);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    const nextInit = (existing ?? { ...blankCompensation(groomerId, groomerName), created_by: operatorName }) as GroomerCompensation;
    setDraft(nextInit);
  }, [existing, groomerId, groomerName, operatorName]);

  function update<K extends keyof GroomerCompensation>(key: K, value: GroomerCompensation[K]) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  function numField(key: keyof GroomerCompensation, label: string, hint?: string) {
    return (
      <label className="block">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
        <div className="relative mt-1">
          <IndianRupee size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300"/>
          <input
            type="number"
            step={0.01}
            min={0}
            value={Number(draft[key] ?? 0)}
            onChange={e => update(key, Number(e.target.value) as never)}
            className="w-full pl-7 pr-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sniffy-purple"
          />
        </div>
        {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
      </label>
    );
  }

  function txtField(key: keyof GroomerCompensation, label: string, placeholder = '') {
    return (
      <label className="block">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
        <input
          type="text"
          value={(draft[key] as string) ?? ''}
          onChange={e => update(key, (e.target.value || null) as never)}
          placeholder={placeholder}
          className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sniffy-purple"
        />
      </label>
    );
  }

  async function save() {
    setSaving(true);
    onError(null);
    try {
      const payload: Partial<GroomerCompensation> & { groomer_id: string; groomer_name: string } = {
        ...draft,
        groomer_id: groomerId,
        groomer_name: groomerName,
      };
      // Strip server-managed fields
      delete (payload as Partial<GroomerCompensation>).id;
      delete (payload as Partial<GroomerCompensation>).created_at;
      delete (payload as Partial<GroomerCompensation>).updated_at;

      const res = await upsertCompensation(payload);
      if (!res.ok) { onError(res.error ?? 'Save failed.'); return; }
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
      onSaved();
    } finally { setSaving(false); }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-gray-900 truncate">{groomerName}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Monthly CTC: <strong className="text-gray-700">{fmtMoney(monthlyCtc(draft as GroomerCompensation))}</strong>
            {(draft as GroomerCompensation).updated_at && (
              <> · Updated {new Date((draft as GroomerCompensation).updated_at).toLocaleDateString('en-IN')}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedFlash && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-emerald-600">Saved ✓</motion.span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-sniffy-purple disabled:opacity-60 transition active:scale-95"
          >
            {saving ? <Loader2 size={11} className="animate-spin"/> : <Save size={11}/>}
            Save structure
          </button>
        </div>
      </div>

      {/* Earnings */}
      <Section title="Monthly earnings">
        <div className="grid grid-cols-2 gap-3">
          {numField('basic_monthly', 'Basic')}
          {numField('hra_monthly', 'HRA')}
          {numField('conveyance_monthly', 'Conveyance')}
          {numField('medical_monthly', 'Medical')}
          {numField('special_allowance_monthly', 'Special allowance')}
          <div className="grid grid-cols-[1fr_140px] gap-2 col-span-2">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Other allowance (label)</span>
              <input
                type="text"
                value={draft.other_allowance_label ?? ''}
                onChange={e => update('other_allowance_label', (e.target.value || null) as never)}
                placeholder="e.g. Travel kit"
                className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sniffy-purple"
              />
            </label>
            {numField('other_allowance_monthly', 'Other allowance (₹)')}
          </div>
        </div>
      </Section>

      {/* Incentives — fixed, app-wide policy (not per-groomer).
          Source of truth: src/pages/groomer/incentivesApi.ts
          (ON_TIME_BONUS = ₹25, REVIEW_BONUS = ₹40). */}
      <Section title="Session incentives">
        <p className="text-[11px] text-gray-500 -mt-1 leading-snug">
          Incentives are an app-wide policy, not configured per groomer.
          A completed session earns <b>₹{ON_TIME_BONUS} on-time bonus</b>{' '}
          (arrival within window + coordinator approved) and{' '}
          <b>₹{REVIEW_BONUS} review bonus</b> (5★ review captured and not
          rejected). These amounts live in{' '}
          <code className="text-[10px] bg-gray-100 px-1 py-0.5 rounded">
            groomer/incentivesApi.ts
          </code>{' '}
          and roll into the monthly salary slip via the Session Incentive
          line on the earnings table.
        </p>
      </Section>

      {/* Statutory toggles */}
      <Section title="Statutory deductions">
        <p className="text-[11px] text-gray-500 -mt-1">Enable per groomer — every line is opt-in.</p>

        <ToggleRow
          enabled={draft.pf_enabled}
          onToggle={v => update('pf_enabled', v as never)}
          label="Provident Fund (PF)"
          description="Employee 12% of basic, capped monthly."
        >
          <div className="grid grid-cols-2 gap-2">
            {numField('pf_employee_pct', 'Employee %', '12 is the statutory default')}
            {numField('pf_cap', 'Monthly cap', '1800 if salary ≤ ₹15k slab')}
          </div>
        </ToggleRow>

        <ToggleRow
          enabled={draft.esi_enabled}
          onToggle={v => update('esi_enabled', v as never)}
          label="Employee State Insurance (ESI)"
          description="Only applies when gross < ceiling."
        >
          <div className="grid grid-cols-2 gap-2">
            {numField('esi_employee_pct', 'Employee %', '0.75 is statutory')}
            {numField('esi_gross_ceiling', 'Gross ceiling', '21000 is statutory')}
          </div>
        </ToggleRow>

        <ToggleRow
          enabled={draft.pt_enabled}
          onToggle={v => update('pt_enabled', v as never)}
          label="Professional Tax (PT)"
          description="Flat monthly amount (Maharashtra slab: ₹200/mo, ₹300 in Feb)."
        >
          {numField('pt_amount', 'Amount per month')}
        </ToggleRow>

        <ToggleRow
          enabled={draft.tds_enabled}
          onToggle={v => update('tds_enabled', v as never)}
          label="TDS (Income tax)"
          description="Manual monthly amount — no slab calculation."
        >
          {numField('tds_monthly', 'Amount per month')}
        </ToggleRow>
      </Section>

      {/* Slip identifiers */}
      <Section title="Identifiers (shown on slip)">
        <div className="grid grid-cols-2 gap-3">
          {txtField('designation', 'Designation', 'e.g. Senior Groomer')}
          {txtField('employee_code', 'Employee code', 'e.g. SNF-001')}
          {txtField('pan', 'PAN')}
          {txtField('uan', 'UAN (PF)')}
          {txtField('esic_number', 'ESIC number')}
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Date of joining</span>
            <input
              type="date"
              value={draft.date_of_joining ?? ''}
              onChange={e => update('date_of_joining', (e.target.value || null) as never)}
              className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sniffy-purple"
            />
          </label>
        </div>
        <div className="grid grid-cols-[1fr_180px_140px] gap-3">
          {txtField('bank_name', 'Bank name')}
          {txtField('bank_account', 'Account number')}
          {txtField('bank_ifsc', 'IFSC')}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">{title}</h4>
      {children}
    </div>
  );
}

function ToggleRow({ enabled, onToggle, label, description, children }: {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`p-3 rounded-xl border ${enabled ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-100'}`}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => onToggle(e.target.checked)}
          className="mt-1 w-4 h-4 rounded text-sniffy-purple"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800">{label}</p>
          {description && <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>}
        </div>
      </label>
      {enabled && (
        <div className="mt-3 pl-7">
          {children}
        </div>
      )}
    </div>
  );
}
