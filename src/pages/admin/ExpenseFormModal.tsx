/**
 * admin/ExpenseFormModal.tsx — Add / Edit expense modal.
 *
 * Mirrors the visual language of SessionFormModal:
 *   • full-screen on mobile, centered card on desktop
 *   • purple top bar with X close + title
 *   • framer-motion enter/exit
 *   • light status-bar tint while open
 *
 * Fields:
 *   Title* · Amount* · Category* · Date* · Paid-by name* · Paid-by role
 *   Payment method · Vendor/Payee · Notes · Proof upload (image/pdf)
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader2, CheckCircle2, AlertCircle, IndianRupee,
  Upload, Image as ImageIcon, FileText, Trash2, Eye,
} from 'lucide-react';
import {
  Expense, ExpenseInput, ExpensePaymentMethod, ExpensePayerRole,
  EXPENSE_CATEGORIES,
  createExpense, updateExpense, getSignedProofUrl, fmtFileSize,
} from './expensesApi';
import { useModalTakesOverStatusBar } from '../../components/PWAInstallGate';
import { AdminUser } from './authStore';
import SniffyDatePicker from '../calendar/SniffyDatePicker';

// ─── Constants ─────────────────────────────────────────────────

const PAYER_ROLE_OPTIONS: { id: ExpensePayerRole; label: string }[] = [
  { id: 'coordinator', label: 'Coordinator' },
  { id: 'admin',       label: 'Admin / Founder' },
  { id: 'founder',     label: 'Founder' },
  { id: 'groomer',     label: 'Groomer' },
  { id: 'vendor',      label: 'Vendor' },
  { id: 'other',       label: 'Other' },
];

const PAYMENT_METHOD_OPTIONS: { id: ExpensePaymentMethod; label: string }[] = [
  { id: 'cash',  label: 'Cash'  },
  { id: 'upi',   label: 'UPI'   },
  { id: 'bank',  label: 'Bank'  },
  { id: 'card',  label: 'Card'  },
  { id: 'other', label: 'Other' },
];

const MAX_PROOF_MB = 8;

// ─── Form state ────────────────────────────────────────────────

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function emptyInput(): ExpenseInput {
  return {
    title:           '',
    amount:          0,
    category:        EXPENSE_CATEGORIES[0].id,
    expense_date:    todayIso(),
    payment_method:  'upi',
    paid_by_name:    '',
    paid_by_role:    'coordinator',
    vendor_or_payee: '',
    notes:           '',
  };
}

function expenseToInput(e: Expense): ExpenseInput {
  return {
    title:           e.title,
    amount:          e.amount,
    category:        e.category,
    expense_date:    e.expense_date,
    payment_method:  e.payment_method,
    paid_by_name:    e.paid_by_name,
    paid_by_role:    e.paid_by_role,
    vendor_or_payee: e.vendor_or_payee,
    notes:           e.notes,
  };
}

// ─── Component ─────────────────────────────────────────────────

export default function ExpenseFormModal({
  open, onClose, onSaved, user, existing,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (e: Expense) => void;
  user: AdminUser;
  /** When set, modal is in edit mode. */
  existing?: Expense | null;
}) {
  useModalTakesOverStatusBar(open, '#7c3aed');

  const isEdit = !!existing;

  const [form, setForm] = useState<ExpenseInput>(() =>
    existing ? expenseToInput(existing) : emptyInput()
  );
  const [proofFile, setProofFile]   = useState<File | null>(null);
  const [removeProof, setRemoveProof] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [savingErr, setSavingErr] = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [doneFlash, setDoneFlash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Re-seed when modal re-opens or switches between create/edit.
  useEffect(() => {
    if (!open) return;
    setForm(existing ? expenseToInput(existing) : emptyInput());
    setProofFile(null);
    setRemoveProof(false);
    setSavingErr(null);
    setSaving(false);
    setDoneFlash(false);
    // Reset file input so the same file can be re-selected after a clear.
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [open, existing]);

  // Local-object-URL preview for the *new* file the user just picked.
  useEffect(() => {
    if (!proofFile) {
      setProofPreview(null);
      return;
    }
    if (!proofFile.type.startsWith('image/')) {
      setProofPreview(null);
      return;
    }
    const url = URL.createObjectURL(proofFile);
    setProofPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

  // ── Validation ─────────────────────────────────────────────
  const errors = useMemo(() => {
    const e: Partial<Record<keyof ExpenseInput | 'proof', string>> = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!(form.amount > 0)) e.amount = 'Amount must be > 0';
    if (!form.category)     e.category = 'Pick a category';
    if (!form.expense_date) e.expense_date = 'Date required';
    if (!form.paid_by_name.trim()) e.paid_by_name = 'Who paid?';
    if (proofFile && proofFile.size > MAX_PROOF_MB * 1024 * 1024) {
      e.proof = `Max ${MAX_PROOF_MB}MB`;
    }
    return e;
  }, [form, proofFile]);

  const canSubmit = Object.keys(errors).length === 0 && !saving;

  // ── Submit ─────────────────────────────────────────────────
  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setSavingErr(null);
    try {
      let row: Expense;
      if (isEdit && existing) {
        row = await updateExpense({
          id: existing.id,
          input: form,
          proofFile: proofFile ?? undefined,
          removeProof,
          existingProofPath: existing.proof_path,
        });
      } else {
        row = await createExpense({
          input: form,
          proofFile,
          createdById:   user.id,
          createdByName: user.name,
        });
      }
      setDoneFlash(true);
      setTimeout(() => {
        onSaved(row);
        onClose();
      }, 450);
    } catch (err: any) {
      setSavingErr(err?.message ?? 'Could not save expense');
    } finally {
      setSaving(false);
    }
  }

  // ── View existing proof in a new tab (edit mode) ──────────
  async function handleViewExistingProof() {
    if (!existing?.proof_path) return;
    try {
      const url = await getSignedProofUrl(existing.proof_path);
      window.open(url, '_blank', 'noopener');
    } catch (err: any) {
      setSavingErr(err?.message ?? 'Could not load proof');
    }
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-stretch sm:items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full h-full sm:h-auto sm:max-w-lg sm:max-h-[92vh] bg-white sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between text-white"
              style={{
                background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)',
                paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
              }}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                  {isEdit ? 'Edit Expense' : 'New Expense'}
                </p>
                <h2 className="text-lg font-extrabold leading-tight">
                  {isEdit ? form.title || 'Untitled' : 'Log an expense'}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body — scrolls if tall */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Title */}
              <Field label="Title" required error={errors.title}>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Grooming kit purchase"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-sniffy-purple focus:ring-2 focus:ring-purple-100 transition"
                />
              </Field>

              {/* Amount + Date */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Amount" required error={errors.amount}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <IndianRupee size={14} />
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      value={form.amount || ''}
                      onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full rounded-xl border border-gray-200 pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-sniffy-purple focus:ring-2 focus:ring-purple-100 transition"
                    />
                  </div>
                </Field>

                <Field label="Date" required error={errors.expense_date}>
                  <SniffyDatePicker
                    value={form.expense_date}
                    onChange={v => setForm({ ...form, expense_date: v })}
                  />
                </Field>
              </div>

              {/* Category — wrapping chips */}
              <Field label="Category" required error={errors.category}>
                <div className="flex flex-wrap gap-2">
                  {EXPENSE_CATEGORIES.map(c => {
                    const active = form.category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setForm({ ...form, category: c.id })}
                        className={[
                          'px-3 py-1.5 rounded-full text-xs font-semibold border transition',
                          active
                            ? `${c.iconBg} ${c.iconText} border-transparent`
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300',
                        ].join(' ')}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Paid by name + role */}
              <Field label="Paid by" required error={errors.paid_by_name} hint="Who actually parted with the money?">
                <input
                  type="text"
                  value={form.paid_by_name}
                  onChange={e => setForm({ ...form, paid_by_name: e.target.value })}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-sniffy-purple focus:ring-2 focus:ring-purple-100 transition"
                />
              </Field>

              <Field label="Their role">
                <div className="flex flex-wrap gap-2">
                  {PAYER_ROLE_OPTIONS.map(r => {
                    const active = form.paid_by_role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setForm({ ...form, paid_by_role: r.id })}
                        className={[
                          'px-3 py-1.5 rounded-full text-xs font-semibold border transition',
                          active
                            ? 'bg-sniffy-purple text-white border-transparent'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300',
                        ].join(' ')}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Payment method */}
              <Field label="Payment method">
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHOD_OPTIONS.map(m => {
                    const active = form.payment_method === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setForm({ ...form, payment_method: m.id })}
                        className={[
                          'px-3 py-1.5 rounded-full text-xs font-semibold border transition',
                          active
                            ? 'bg-purple-100 text-sniffy-purple border-transparent'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300',
                        ].join(' ')}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Vendor / payee */}
              <Field label="Vendor / payee" hint="Who received the money (optional)">
                <input
                  type="text"
                  value={form.vendor_or_payee ?? ''}
                  onChange={e => setForm({ ...form, vendor_or_payee: e.target.value })}
                  placeholder="e.g. Petsy Supplies"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-sniffy-purple focus:ring-2 focus:ring-purple-100 transition"
                />
              </Field>

              {/* Notes */}
              <Field label="Notes" hint="Anything else worth recording">
                <textarea
                  rows={3}
                  value={form.notes ?? ''}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Bulk order for 3 new groomers; invoice #1281"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-sniffy-purple focus:ring-2 focus:ring-purple-100 transition resize-none"
                />
              </Field>

              {/* Proof upload */}
              <Field
                label="Receipt / proof"
                hint={`Image or PDF — up to ${MAX_PROOF_MB} MB`}
                error={errors.proof}
              >
                <ProofPicker
                  proofFile={proofFile}
                  proofPreview={proofPreview}
                  existing={existing}
                  removeProof={removeProof}
                  fileInputRef={fileInputRef}
                  onPick={f => { setProofFile(f); setRemoveProof(false); }}
                  onClearNew={() => {
                    setProofFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  onRemoveExisting={() => setRemoveProof(true)}
                  onRestoreExisting={() => setRemoveProof(false)}
                  onViewExisting={handleViewExistingProof}
                />
              </Field>

              {savingErr && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
                  <AlertCircle size={14} className="mt-0.5 shrink-0"/>
                  <span>{savingErr}</span>
                </div>
              )}
            </form>

            {/* Footer */}
            <div
              className="px-5 py-3 border-t border-gray-100 flex items-center gap-3 bg-white"
              style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
            >
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit as any}
                disabled={!canSubmit}
                className={[
                  'flex-1 rounded-xl py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2 transition',
                  canSubmit ? 'shadow-md' : 'opacity-60 cursor-not-allowed',
                ].join(' ')}
                style={{
                  background: canSubmit
                    ? 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)'
                    : '#a78bfa',
                }}
              >
                {saving      ? <Loader2 size={16} className="animate-spin"/>
                 : doneFlash ? <CheckCircle2 size={16}/>
                 :              <>{isEdit ? 'Save changes' : 'Add expense'}</>}
                {!saving && !doneFlash && (
                  <span className="hidden sm:inline">
                    {isEdit ? '' : ''}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Reusable field wrapper ───────────────────────────────────

function Field({
  label, required, hint, error, children,
}: {
  label:    string;
  required?: boolean;
  hint?:    string;
  error?:   string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-semibold text-gray-600">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && !error && <span className="text-[10px] text-gray-400">{hint}</span>}
        {error && <span className="text-[10px] font-semibold text-red-500">{error}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Proof picker subcomponent ────────────────────────────────

function ProofPicker({
  proofFile, proofPreview, existing, removeProof, fileInputRef,
  onPick, onClearNew, onRemoveExisting, onRestoreExisting, onViewExisting,
}: {
  proofFile:   File | null;
  proofPreview: string | null;
  existing:    Expense | null | undefined;
  removeProof: boolean;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  onPick:           (f: File) => void;
  onClearNew:       () => void;
  onRemoveExisting: () => void;
  onRestoreExisting: () => void;
  onViewExisting:   () => void;
}) {
  const hasExisting = existing?.proof_path && !removeProof && !proofFile;
  const hasNew      = !!proofFile;

  // New file picked — show preview / file chip
  if (hasNew && proofFile) {
    const isImage = proofFile.type.startsWith('image/');
    return (
      <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-white border border-purple-100 flex items-center justify-center overflow-hidden shrink-0">
          {isImage && proofPreview
            ? <img src={proofPreview} alt="" className="w-full h-full object-cover"/>
            : <FileText size={20} className="text-purple-500"/>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">{proofFile.name}</p>
          <p className="text-[10px] text-gray-400">{fmtFileSize(proofFile.size)} · ready to upload</p>
        </div>
        <button
          type="button"
          onClick={onClearNew}
          className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-gray-400 hover:text-red-500 transition"
          aria-label="Remove"
        >
          <Trash2 size={15}/>
        </button>
      </div>
    );
  }

  // Edit mode, existing proof not removed
  if (hasExisting && existing) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
          {existing.proof_mime?.startsWith('image/')
            ? <ImageIcon size={20} className="text-purple-500"/>
            : <FileText  size={20} className="text-purple-500"/>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">
            {existing.proof_name ?? 'Attached'}
          </p>
          <p className="text-[10px] text-gray-400">
            {fmtFileSize(existing.proof_size)} · saved
          </p>
        </div>
        <button
          type="button"
          onClick={onViewExisting}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-sniffy-purple transition"
          aria-label="View"
        >
          <Eye size={15}/>
        </button>
        <button
          type="button"
          onClick={onRemoveExisting}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
          aria-label="Remove"
        >
          <Trash2 size={15}/>
        </button>
      </div>
    );
  }

  // Edit mode where the user removed the existing proof
  if (removeProof && existing?.proof_path) {
    return (
      <div className="rounded-xl border border-dashed border-red-200 bg-red-50/40 p-3 flex items-center gap-3">
        <Trash2 size={16} className="text-red-400"/>
        <p className="text-xs text-red-500 flex-1">Existing proof will be removed on save.</p>
        <button
          type="button"
          onClick={onRestoreExisting}
          className="text-[11px] font-semibold text-sniffy-purple hover:underline"
        >
          Undo
        </button>
      </div>
    );
  }

  // Empty state — drop / pick
  return (
    <label className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-sniffy-purple/40 bg-gray-50/60 hover:bg-purple-50/30 px-3 py-3 cursor-pointer transition">
      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sniffy-purple">
        <Upload size={16}/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700">Tap to upload</p>
        <p className="text-[10px] text-gray-400">Image / PDF · receipts, payment screenshots</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
    </label>
  );
}
