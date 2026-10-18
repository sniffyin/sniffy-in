/**
 * admin/payrollApi.ts — Phase 6 (Payroll)
 *
 * Typed wrappers around the new payroll tables created in migration
 * `20260528000000_phase6_payroll.sql`:
 *
 *   • groomer_compensation — per-employee salary structure
 *   • payroll_runs         — period header (month + year)
 *   • payroll_entries      — one row per groomer per run with the
 *                            computed earnings, deductions and net pay
 *
 * All money values are stored as numeric(10,2) on the server; the JS
 * side keeps them as plain `number`.  Helpers round at display time.
 */

import { supabase } from '../../lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────

export interface GroomerCompensation {
  id: string;
  groomer_id: string;
  groomer_name: string;

  basic_monthly: number;
  hra_monthly: number;
  conveyance_monthly: number;
  medical_monthly: number;
  special_allowance_monthly: number;
  other_allowance_label: string | null;
  other_allowance_monthly: number;

  pf_enabled: boolean;
  pf_employee_pct: number;
  pf_cap: number;

  esi_enabled: boolean;
  esi_employee_pct: number;
  esi_gross_ceiling: number;

  pt_enabled: boolean;
  pt_amount: number;

  tds_enabled: boolean;
  tds_monthly: number;

  designation: string | null;
  employee_code: string | null;
  pan: string | null;
  uan: string | null;
  esic_number: string | null;
  bank_name: string | null;
  bank_account: string | null;
  bank_ifsc: string | null;
  date_of_joining: string | null;

  effective_from: string;
  is_active: boolean;
  notes: string | null;
  created_by: string | null;

  created_at: string;
  updated_at: string;
}

export type PayrollRunStatus = 'draft' | 'finalised';

export interface PayrollRun {
  id: string;
  period_year: number;
  period_month: number;        // 1-12
  label: string | null;
  status: PayrollRunStatus;
  working_days_basis: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  finalised_at: string | null;
  finalised_by: string | null;
}

export type PayrollEntryStatus = 'draft' | 'locked';

export interface PayrollEntry {
  id: string;
  run_id: string;
  groomer_id: string;
  groomer_name: string;

  basic_monthly: number;
  hra_monthly: number;
  conveyance_monthly: number;
  medical_monthly: number;
  special_allowance_monthly: number;
  other_allowance_label: string | null;
  other_allowance_monthly: number;

  working_days: number;
  present_days: number;
  paid_leave_days: number;
  lwp_days: number;
  payable_days: number;

  sessions_dog_count: number;
  sessions_cat_count: number;
  sessions_total_count: number;

  earnings_basic: number;
  earnings_hra: number;
  earnings_conveyance: number;
  earnings_medical: number;
  earnings_special: number;
  earnings_other: number;
  earnings_incentive: number;
  earnings_bonus: number;
  earnings_bonus_note: string | null;
  earnings_arrear: number;
  earnings_arrear_note: string | null;
  earnings_other_custom: number;
  earnings_other_custom_label: string | null;

  gross_earnings: number;

  deductions_pf: number;
  deductions_pf_employer: number;
  deductions_esi: number;
  deductions_pt: number;
  deductions_tds: number;
  deductions_advance: number;
  deductions_advance_note: string | null;
  deductions_other: number;
  deductions_other_label: string | null;

  total_deductions: number;
  net_pay: number;
  net_pay_in_words: string | null;

  designation: string | null;
  employee_code: string | null;
  pan: string | null;
  uan: string | null;
  esic_number: string | null;
  bank_name: string | null;
  bank_account: string | null;
  bank_ifsc: string | null;
  date_of_joining: string | null;

  status: PayrollEntryStatus;
  last_pdf_generated_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────

export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
] as const;

export function fmtMoney(n: number | null | undefined): string {
  const v = Math.round(Number(n ?? 0));
  return `₹${v.toLocaleString('en-IN')}`;
}

export function fmtMoneyDecimal(n: number | null | undefined): string {
  const v = Number(n ?? 0).toFixed(2);
  // Indian grouping for the integer part
  const [intPart, decPart] = v.split('.');
  const grouped = Number(intPart).toLocaleString('en-IN');
  return `₹${grouped}.${decPart}`;
}

export function periodLabel(run: Pick<PayrollRun, 'period_year' | 'period_month'>): string {
  return `${MONTH_NAMES[run.period_month - 1]} ${run.period_year}`;
}

// ─── Compensation reads / writes ─────────────────────────────────────

export async function fetchAllCompensation(): Promise<GroomerCompensation[]> {
  const { data, error } = await supabase
    .from('groomer_compensation')
    .select('*')
    .order('groomer_name');
  if (error) {
    console.error('[payrollApi] fetchAllCompensation', error);
    return [];
  }
  return (data ?? []) as GroomerCompensation[];
}

export async function fetchCompensationForGroomer(
  groomer_id: string,
): Promise<GroomerCompensation | null> {
  const { data, error } = await supabase
    .from('groomer_compensation')
    .select('*')
    .eq('groomer_id', groomer_id)
    .maybeSingle();
  if (error) {
    console.error('[payrollApi] fetchCompensationForGroomer', error);
    return null;
  }
  return (data as GroomerCompensation) ?? null;
}

export async function upsertCompensation(
  row: Partial<GroomerCompensation> & { groomer_id: string; groomer_name: string },
): Promise<{ ok: boolean; data?: GroomerCompensation; error?: string }> {
  const { data, error } = await supabase
    .from('groomer_compensation')
    .upsert(row, { onConflict: 'groomer_id' })
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as GroomerCompensation };
}

export async function deleteCompensation(groomer_id: string):
  Promise<{ ok: boolean; error?: string }>
{
  const { error } = await supabase
    .from('groomer_compensation')
    .delete()
    .eq('groomer_id', groomer_id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── Payroll run lifecycle ───────────────────────────────────────────

export async function listPayrollRuns(): Promise<PayrollRun[]> {
  const { data, error } = await supabase
    .from('payroll_runs')
    .select('*')
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[payrollApi] listPayrollRuns', error);
    return [];
  }
  return (data ?? []) as PayrollRun[];
}

export async function createPayrollRun(
  period_year: number,
  period_month: number,
  working_days_basis: number,
  label: string | null,
  created_by: string | null,
): Promise<{ ok: boolean; run?: PayrollRun; error?: string }> {
  const { data, error } = await supabase
    .from('payroll_runs')
    .insert([{ period_year, period_month, working_days_basis, label, created_by }])
    .select()
    .single();
  if (error) return { ok: false, error: error.message };

  // Seed entries for every active groomer.
  const { error: seedErr } = await supabase.rpc('enqueue_payroll_run', { p_run_id: data.id });
  if (seedErr) {
    return { ok: false, error: `Run created but seeding failed: ${seedErr.message}` };
  }

  return { ok: true, run: data as PayrollRun };
}

export async function deletePayrollRun(run_id: string):
  Promise<{ ok: boolean; error?: string }>
{
  const { error } = await supabase
    .from('payroll_runs')
    .delete()
    .eq('id', run_id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function finalisePayrollRun(run_id: string, by: string):
  Promise<{ ok: boolean; error?: string }>
{
  const { data, error } = await supabase.rpc('finalise_payroll_run', {
    p_run_id: run_id, p_by: by,
  });
  if (error) return { ok: false, error: error.message };
  const result = data as { success?: boolean; error?: string };
  if (!result?.success) return { ok: false, error: result?.error ?? 'Could not finalise.' };
  return { ok: true };
}

// ─── Entries ─────────────────────────────────────────────────────────

export async function fetchPayrollEntries(run_id: string): Promise<PayrollEntry[]> {
  const { data, error } = await supabase
    .from('payroll_entries')
    .select('*')
    .eq('run_id', run_id)
    .order('groomer_name');
  if (error) {
    console.error('[payrollApi] fetchPayrollEntries', error);
    return [];
  }
  return (data ?? []) as PayrollEntry[];
}

export async function updatePayrollEntry(
  entry_id: string,
  patch: Partial<PayrollEntry>,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('payroll_entries')
    .update(patch)
    .eq('id', entry_id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function recomputeEntry(entry_id: string):
  Promise<{ ok: boolean; net_pay?: number; error?: string }>
{
  const { data, error } = await supabase.rpc('compute_payroll_entry', { p_entry_id: entry_id });
  if (error) return { ok: false, error: error.message };
  const result = data as { success?: boolean; error?: string; net_pay?: number };
  if (!result?.success) return { ok: false, error: result?.error ?? 'recompute failed' };
  return { ok: true, net_pay: result.net_pay };
}

export async function markPdfGenerated(entry_id: string):
  Promise<{ ok: boolean; error?: string }>
{
  const { error } = await supabase
    .from('payroll_entries')
    .update({ last_pdf_generated_at: new Date().toISOString() })
    .eq('id', entry_id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── Defaults for a fresh compensation row ───────────────────────────

export function blankCompensation(
  groomer_id: string,
  groomer_name: string,
): Omit<GroomerCompensation, 'id' | 'created_at' | 'updated_at'> {
  return {
    groomer_id,
    groomer_name,
    basic_monthly: 0,
    hra_monthly: 0,
    conveyance_monthly: 0,
    medical_monthly: 0,
    special_allowance_monthly: 0,
    other_allowance_label: null,
    other_allowance_monthly: 0,
    pf_enabled: false,
    pf_employee_pct: 12,
    pf_cap: 1800,
    esi_enabled: false,
    esi_employee_pct: 0.75,
    esi_gross_ceiling: 21000,
    pt_enabled: false,
    pt_amount: 200,
    tds_enabled: false,
    tds_monthly: 0,
    designation: null,
    employee_code: null,
    pan: null,
    uan: null,
    esic_number: null,
    bank_name: null,
    bank_account: null,
    bank_ifsc: null,
    date_of_joining: null,
    effective_from: new Date().toISOString().slice(0, 10),
    is_active: true,
    notes: null,
    created_by: null,
  };
}

/** Working days basis for a given calendar month, excluding Sundays.
 *  Used as the default when creating a new payroll run. */
export function workingDaysExcludingSundays(year: number, month: number): number {
  const last = new Date(year, month, 0).getDate();   // month is 1-12 → new Date(y, m, 0) = last day of prev=> wait
  // JS Date: new Date(year, monthIndex, 0) returns the last day of the
  // PREVIOUS month, so for "last day of month m (1-12)" pass monthIndex = m.
  const lastDay = new Date(year, month, 0).getDate(); // already correct
  let count = 0;
  for (let d = 1; d <= lastDay; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow !== 0) count++;     // 0 = Sunday
  }
  void last; // keep linter quiet about the unused intermediate
  return count;
}
