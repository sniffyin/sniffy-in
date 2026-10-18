/**
 * admin/expensesApi.ts — Supabase CRUD + helpers for the expenses tab.
 *
 * Mirrors the shape of admin/groomer/documentsApi.ts:
 *   • plain async functions, no React state
 *   • Storage uploads go to a private bucket; reads via signed URL
 *   • Permissive RLS — front-end gates edit/delete to the original
 *     creator (see canModifyExpense()).
 */

import { supabase } from '../../lib/supabase';

// ─── Row shape ────────────────────────────────────────────────

export type ExpensePaymentMethod = 'cash' | 'upi' | 'bank' | 'card' | 'other';
export type ExpensePayerRole     = 'coordinator' | 'admin' | 'founder' | 'groomer' | 'vendor' | 'other';

export interface Expense {
  id:              string;
  title:           string;
  amount:          number;
  category:        string;
  expense_date:    string;                  // ISO date YYYY-MM-DD
  payment_method:  ExpensePaymentMethod | null;

  paid_by_name:    string;
  paid_by_role:    ExpensePayerRole | null;

  vendor_or_payee: string | null;
  notes:           string | null;

  // Proof (optional)
  proof_path:      string | null;
  proof_name:      string | null;
  proof_mime:      string | null;
  proof_size:      number;

  // Audit
  created_by_id:   string;
  created_by_name: string;
  created_at:      string;
  updated_at:      string;
}

/** Payload for create / update. `id`, `created_by_*`, timestamps and
 *  proof_* are handled separately. */
export type ExpenseInput = Omit<
  Expense,
  'id' | 'created_at' | 'updated_at' |
  'created_by_id' | 'created_by_name' |
  'proof_path' | 'proof_name' | 'proof_mime' | 'proof_size'
>;

// ─── Category metadata (UI + reports) ─────────────────────────

export interface ExpenseCategoryMeta {
  id:    string;            // stored verbatim in expenses.category
  label: string;
  /** Tailwind tints for the row icon background. Pairs with `iconText`. */
  iconBg:   string;
  iconText: string;
  /** Hex used by the donut/bar chart for this slice. */
  chartColor: string;
}

/** Seed categories. The DB stores `category` as free text, so we can
 *  extend this list without a migration. Any expense whose category
 *  isn't in here renders with the "Other" styling. */
export const EXPENSE_CATEGORIES: ExpenseCategoryMeta[] = [
  { id: 'kit',         label: 'Kit / Supplies',  iconBg: 'bg-purple-100', iconText: 'text-purple-600', chartColor: '#7c3aed' },
  { id: 'marketing',   label: 'Marketing',       iconBg: 'bg-pink-100',   iconText: 'text-pink-600',   chartColor: '#ec4899' },
  { id: 'development', label: 'Development',     iconBg: 'bg-blue-100',   iconText: 'text-blue-600',   chartColor: '#3b82f6' },
  { id: 'travel',      label: 'Travel',          iconBg: 'bg-amber-100',  iconText: 'text-amber-600',  chartColor: '#f59e0b' },
  { id: 'salary',      label: 'Salary',          iconBg: 'bg-emerald-100',iconText: 'text-emerald-600',chartColor: '#10b981' },
  { id: 'vendor',      label: 'Vendor Payouts',  iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', chartColor: '#6366f1' },
  { id: 'utilities',   label: 'Utilities',       iconBg: 'bg-cyan-100',   iconText: 'text-cyan-600',   chartColor: '#06b6d4' },
  { id: 'office',      label: 'Office',          iconBg: 'bg-orange-100', iconText: 'text-orange-600', chartColor: '#fb923c' },
  { id: 'misc',        label: 'Misc',            iconBg: 'bg-gray-100',   iconText: 'text-gray-600',   chartColor: '#6b7280' },
];

export const OTHER_CATEGORY: ExpenseCategoryMeta = {
  id: 'other', label: 'Other',
  iconBg: 'bg-gray-100', iconText: 'text-gray-600', chartColor: '#9ca3af',
};

export function categoryMeta(id: string | null | undefined): ExpenseCategoryMeta {
  if (!id) return OTHER_CATEGORY;
  return EXPENSE_CATEGORIES.find(c => c.id === id) ?? OTHER_CATEGORY;
}

// ─── Filters ──────────────────────────────────────────────────

export interface ExpenseFilters {
  /** Inclusive YYYY-MM-DD */
  from?: string;
  /** Inclusive YYYY-MM-DD */
  to?:   string;
  category?: string;
  /** Substring match across title / paid_by_name / vendor_or_payee / notes. */
  search?: string;
}

// ─── Fetch ────────────────────────────────────────────────────

export async function fetchExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
  let q = supabase.from('expenses').select('*').order('expense_date', { ascending: false }).order('created_at', { ascending: false });

  if (filters.from)     q = q.gte('expense_date', filters.from);
  if (filters.to)       q = q.lte('expense_date', filters.to);
  if (filters.category) q = q.eq('category', filters.category);

  const { data, error } = await q;
  if (error) throw error;

  let rows = (data ?? []) as Expense[];

  // Substring filter is done client-side so we can search across multiple
  // columns without a Postgres full-text setup. The dataset is small
  // (few hundred rows per month) so this stays fine.
  if (filters.search) {
    const needle = filters.search.toLowerCase().trim();
    rows = rows.filter(r =>
      r.title.toLowerCase().includes(needle) ||
      r.paid_by_name.toLowerCase().includes(needle) ||
      (r.vendor_or_payee?.toLowerCase().includes(needle) ?? false) ||
      (r.notes?.toLowerCase().includes(needle) ?? false)
    );
  }

  return rows;
}

// ─── Storage ──────────────────────────────────────────────────

const PROOF_BUCKET = 'expense-proofs';

/** Upload a proof file to the private bucket. Returns the storage path
 *  (NOT a URL — use getSignedProofUrl when you actually need to view it). */
async function uploadProof(file: File): Promise<{ path: string; mime: string; size: number; name: string }> {
  // Path shape: YYYY/MM/<uuid>-<safe-name>
  const now    = new Date();
  const yyyy   = now.getFullYear();
  const mm     = String(now.getMonth() + 1).padStart(2, '0');
  const uid    = crypto.randomUUID();
  const safe   = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);
  const path   = `${yyyy}/${mm}/${uid}-${safe}`;

  const { error } = await supabase.storage
    .from(PROOF_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    });
  if (error) throw error;

  return {
    path,
    mime: file.type || 'application/octet-stream',
    size: file.size,
    name: file.name,
  };
}

async function deleteProof(path: string): Promise<void> {
  // Soft-failure: a missing file should not block the user from deleting
  // the row. We log to console but don't throw.
  const { error } = await supabase.storage.from(PROOF_BUCKET).remove([path]);
  if (error) console.warn('expense proof delete failed:', error.message);
}

export async function getSignedProofUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(PROOF_BUCKET)
    .createSignedUrl(path, 60 * 60); // 1 hour
  if (error) throw error;
  return data.signedUrl;
}

// ─── Create / Update / Delete ─────────────────────────────────

export interface CreateExpenseArgs {
  input:       ExpenseInput;
  proofFile?:  File | null;
  createdById:   string;
  createdByName: string;
}

export async function createExpense({
  input, proofFile, createdById, createdByName,
}: CreateExpenseArgs): Promise<Expense> {
  let proofMeta: { path: string; mime: string; size: number; name: string } | null = null;
  if (proofFile) {
    proofMeta = await uploadProof(proofFile);
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      ...input,
      created_by_id:   createdById,
      created_by_name: createdByName,
      proof_path:  proofMeta?.path ?? null,
      proof_name:  proofMeta?.name ?? null,
      proof_mime:  proofMeta?.mime ?? null,
      proof_size:  proofMeta?.size ?? 0,
    })
    .select('*')
    .single();

  if (error) {
    // Best-effort cleanup so we don't orphan an uploaded proof file
    // when the insert fails.
    if (proofMeta) await deleteProof(proofMeta.path);
    throw error;
  }
  return data as Expense;
}

export interface UpdateExpenseArgs {
  id:         string;
  input:      ExpenseInput;
  /** If provided, replaces the existing proof. */
  proofFile?: File | null;
  /** If true, drops the existing proof without replacing it. */
  removeProof?: boolean;
  existingProofPath?: string | null;
}

export async function updateExpense({
  id, input, proofFile, removeProof, existingProofPath,
}: UpdateExpenseArgs): Promise<Expense> {
  let proofPatch: Partial<Expense> = {};

  if (proofFile) {
    const meta = await uploadProof(proofFile);
    proofPatch = {
      proof_path: meta.path,
      proof_name: meta.name,
      proof_mime: meta.mime,
      proof_size: meta.size,
    };
    if (existingProofPath) await deleteProof(existingProofPath);
  } else if (removeProof && existingProofPath) {
    await deleteProof(existingProofPath);
    proofPatch = {
      proof_path: null, proof_name: null, proof_mime: null, proof_size: 0,
    };
  }

  const { data, error } = await supabase
    .from('expenses')
    .update({ ...input, ...proofPatch })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function deleteExpense(row: Expense): Promise<void> {
  if (row.proof_path) await deleteProof(row.proof_path);
  const { error } = await supabase.from('expenses').delete().eq('id', row.id);
  if (error) throw error;
}

// ─── Permission helper (front-end gate) ──────────────────────

/** Front-end gate: only the original creator can edit / delete.
 *  RLS itself is permissive — see migration comments. */
export function canModifyExpense(row: Expense, userId: string | undefined | null): boolean {
  if (!userId) return false;
  return row.created_by_id === userId;
}

// ─── Date helpers ────────────────────────────────────────────

/** Local-date ISO (YYYY-MM-DD). Matches the convention used by
 *  VendorReconciliationTab — toISOString() would shift into UTC and
 *  silently exclude rows near the month boundary in IST. */
export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function fmtMonthYear(d: Date): string {
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function fmtFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
