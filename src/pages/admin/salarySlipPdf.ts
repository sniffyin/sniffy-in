/**
 * admin/salarySlipPdf.ts — Phase 6 (Payroll)
 *
 * Client-side salary-slip PDF generator using jsPDF + jspdf-autotable.
 *
 * Layout (A4 portrait, 595 × 842 pt):
 *
 *   ┌─────────────────────────────────────────────────────┐
 *   │ SNIFFY • At-home Pet Grooming                       │
 *   │ <address line>                                      │
 *   │                              SALARY SLIP            │
 *   │                              For: <Month YYYY>      │
 *   ├─────────────────────────────────────────────────────┤
 *   │ Employee Info (2-col)        Bank / Statutory IDs   │
 *   ├─────────────────────────────────────────────────────┤
 *   │ Attendance summary (table)                          │
 *   ├──────────────────────────┬──────────────────────────┤
 *   │ Earnings                 │ Deductions               │
 *   │ Basic           xxxx     │ PF              xxxx     │
 *   │ HRA             xxxx     │ ESI             xxxx     │
 *   │ ...                      │ ...                      │
 *   │ Incentive       xxxx     │                          │
 *   │ Bonus           xxxx     │                          │
 *   ├──────────────────────────┴──────────────────────────┤
 *   │ Total Earnings  xxxx     Total Deductions  xxxx     │
 *   ├─────────────────────────────────────────────────────┤
 *   │ Net Pay         xxxxx                               │
 *   │ (in words)                                          │
 *   ├─────────────────────────────────────────────────────┤
 *   │ Generated <date> via Sniffy Payroll.                │
 *   │ This is a system-generated document and does not    │
 *   │ require a signature.                                │
 *   └─────────────────────────────────────────────────────┘
 *
 * The function returns a Blob; callers decide whether to download
 * (saveAs → triggers an anchor click) or attach to an outbound
 * message.  A `markPdfGenerated()` call on the entry updates the
 * `last_pdf_generated_at` audit field.
 */

// jsPDF + jspdf-autotable (and their html2canvas/dompurify deps) are ~450 kB
// combined, and are only needed the moment someone actually asks for a salary
// slip.  Statically importing them pulled the lot into the PayrollTab chunk,
// so merely opening Payroll paid for a PDF engine it usually never runs.
// Types are imported type-only (erased at build); the real modules are fetched
// on demand by loadPdfLibs() and memoised for the rest of the session.
import type { jsPDF as JsPdfInstance } from 'jspdf';
import { PayrollEntry, PayrollRun, periodLabel, fmtMoneyDecimal } from './payrollApi';

type JsPdfCtor   = typeof import('jspdf')['jsPDF'];
type AutoTableFn = typeof import('jspdf-autotable')['default'];

let pdfLibsPromise: Promise<{ jsPDF: JsPdfCtor; autoTable: AutoTableFn }> | null = null;

/** Fetch (once) and cache the PDF libraries. */
function loadPdfLibs() {
  if (!pdfLibsPromise) {
    pdfLibsPromise = Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]).then(([pdf, table]) => ({ jsPDF: pdf.jsPDF, autoTable: table.default }))
      // Don't cache a rejection — a transient chunk-load failure should be
      // retryable on the next click rather than poisoning the module.
      .catch(err => { pdfLibsPromise = null; throw err; });
  }
  return pdfLibsPromise;
}

// ─── Branding ────────────────────────────────────────────────────────

const BRAND_PURPLE_RGB: [number, number, number] = [69, 26, 139];
const BRAND_LIGHT_RGB:  [number, number, number] = [240, 234, 252];
const TEXT_DARK_RGB:    [number, number, number] = [33, 33, 33];
const TEXT_MUTED_RGB:   [number, number, number] = [110, 110, 110];

/** Address line shown directly under the logo.  Keep it short — A4
 *  PDF header has limited horizontal space.  Edit here when the
 *  business address changes. */
const COMPANY_ADDRESS = 'At-home pet grooming · Pune, Maharashtra · hello@sniffy.in';

// ─── Tiny helpers ────────────────────────────────────────────────────

function setColor(doc: JsPdfInstance, rgb: [number, number, number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function setFill(doc: JsPdfInstance, rgb: [number, number, number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function setDraw(doc: JsPdfInstance, rgb: [number, number, number]) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Main render ─────────────────────────────────────────────────────

export interface SalarySlipOptions {
  entry: PayrollEntry;
  run:   PayrollRun;
  /** Optional override of the company address line. */
  companyAddress?: string;
}

/** Build the PDF document.  Pure: doesn't touch the DOM or trigger
 *  downloads — caller decides what to do with the output.
 *
 *  Async only because the jsPDF libraries are code-split; the drawing
 *  itself is still synchronous once they've loaded. */
export async function buildSalarySlip(opts: SalarySlipOptions): Promise<JsPdfInstance> {
  const { jsPDF, autoTable } = await loadPdfLibs();
  const { entry, run, companyAddress = COMPANY_ADDRESS } = opts;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  // Page metrics — A4 in points is 595.28 × 841.89
  const pageW = doc.internal.pageSize.getWidth();
  const M = 40;                              // outer margin
  let y = M;                                 // running cursor

  // ─── Header band ──────────────────────────────────────────────────
  setFill(doc, BRAND_PURPLE_RGB);
  doc.rect(0, 0, pageW, 80, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('SNIFFY', M, 35);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(companyAddress, M, 52);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SALARY SLIP', pageW - M, 35, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`For ${periodLabel(run)}`, pageW - M, 52, { align: 'right' });
  if (run.status === 'finalised') {
    doc.setFontSize(8);
    doc.text('Finalised', pageW - M, 66, { align: 'right' });
  } else {
    doc.setFontSize(8);
    doc.text('Draft', pageW - M, 66, { align: 'right' });
  }

  y = 100;

  // ─── Employee + Identifier panel (two columns) ────────────────────
  setColor(doc, TEXT_DARK_RGB);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(entry.groomer_name || '—', M, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setColor(doc, TEXT_MUTED_RGB);
  const sub = [
    entry.designation,
    entry.employee_code ? `ID: ${entry.employee_code}` : null,
  ].filter(Boolean).join(' · ');
  if (sub) doc.text(sub, M, y + 13);

  y += 28;

  // Two-column key/value block.  Renders 2 rows × 2 columns of
  // (label,value) pairs — total 8 fields.  Compact, label-on-top.
  const colW = (pageW - M * 2 - 16) / 2;
  const fields: Array<[string, string]> = [
    ['Date of Joining', fmtDate(entry.date_of_joining)],
    ['PAN',             entry.pan ?? '—'],
    ['UAN (PF)',        entry.uan ?? '—'],
    ['ESIC No.',        entry.esic_number ?? '—'],
    ['Bank',            entry.bank_name ?? '—'],
    ['Account No.',     entry.bank_account ?? '—'],
    ['IFSC',            entry.bank_ifsc ?? '—'],
    ['Pay Period',      periodLabel(run)],
  ];

  setFill(doc, BRAND_LIGHT_RGB);
  doc.roundedRect(M, y, pageW - M * 2, 86, 6, 6, 'F');

  doc.setFontSize(8);
  for (let i = 0; i < fields.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + 12 + col * (colW + 4);
    const ry = y + 14 + row * 18;
    setColor(doc, TEXT_MUTED_RGB);
    doc.setFont('helvetica', 'normal');
    doc.text(fields[i][0].toUpperCase(), x, ry);
    setColor(doc, TEXT_DARK_RGB);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(fields[i][1] || '—', x, ry + 10);
    doc.setFontSize(8);
  }

  y += 96;

  // ─── Attendance summary ──────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [['Working Days', 'Present', 'Paid Leave', 'LWP', 'Payable Days', 'Dog · Cat · Total']],
    body: [[
      String(entry.working_days),
      String(entry.present_days),
      String(entry.paid_leave_days),
      String(entry.lwp_days),
      String(entry.payable_days),
      `${entry.sessions_dog_count} · ${entry.sessions_cat_count} · ${entry.sessions_total_count}`,
    ]],
    styles: { font: 'helvetica', fontSize: 9, halign: 'center', cellPadding: 6 },
    headStyles: {
      fillColor: BRAND_PURPLE_RGB,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: { fillColor: [250, 250, 252] },
    theme: 'grid',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = ((doc as any).lastAutoTable?.finalY ?? y) + 12;

  // ─── Earnings + Deductions (side-by-side) ────────────────────────
  // We build two parallel tables.  Earnings rows include zero-value
  // entries only if the underlying field has a label set — otherwise
  // it's distracting.

  const earningsRows: Array<[string, string]> = [];
  const addEarning = (label: string, amount: number, force = false) => {
    if (force || amount > 0) earningsRows.push([label, fmtMoneyDecimal(amount)]);
  };
  addEarning('Basic',                   entry.earnings_basic, true);
  addEarning('HRA',                     entry.earnings_hra);
  addEarning('Conveyance',              entry.earnings_conveyance);
  addEarning('Medical',                 entry.earnings_medical);
  addEarning('Special Allowance',       entry.earnings_special);
  if (entry.earnings_other > 0 && entry.other_allowance_label) {
    addEarning(entry.other_allowance_label, entry.earnings_other);
  } else {
    addEarning('Other Allowance', entry.earnings_other);
  }
  addEarning('Session Incentive',       entry.earnings_incentive);
  if (entry.earnings_bonus > 0) {
    addEarning(`Bonus${entry.earnings_bonus_note ? ` (${entry.earnings_bonus_note})` : ''}`, entry.earnings_bonus, true);
  }
  if (entry.earnings_arrear > 0) {
    addEarning(`Arrears${entry.earnings_arrear_note ? ` (${entry.earnings_arrear_note})` : ''}`, entry.earnings_arrear, true);
  }
  if (entry.earnings_other_custom > 0) {
    addEarning(entry.earnings_other_custom_label || 'Other Earnings', entry.earnings_other_custom, true);
  }

  const deductionRows: Array<[string, string]> = [];
  const addDed = (label: string, amount: number) => {
    if (amount > 0) deductionRows.push([label, fmtMoneyDecimal(amount)]);
  };
  addDed('Provident Fund (PF)', entry.deductions_pf);
  addDed('ESI',                 entry.deductions_esi);
  addDed('Professional Tax',    entry.deductions_pt);
  addDed('TDS',                 entry.deductions_tds);
  if (entry.deductions_advance > 0) {
    addDed(`Advance${entry.deductions_advance_note ? ` (${entry.deductions_advance_note})` : ''}`, entry.deductions_advance);
  }
  if (entry.deductions_other > 0) {
    addDed(entry.deductions_other_label || 'Other Deduction', entry.deductions_other);
  }
  if (deductionRows.length === 0) {
    deductionRows.push(['No deductions', '—']);
  }

  const half = (pageW - M * 2 - 8) / 2;

  autoTable(doc, {
    startY: y,
    margin: { left: M },
    tableWidth: half,
    head: [['Earnings', 'Amount (₹)']],
    body: earningsRows,
    foot: [['Total Earnings', fmtMoneyDecimal(entry.gross_earnings)]],
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: BRAND_PURPLE_RGB, textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [245, 240, 255], textColor: TEXT_DARK_RGB, fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'right' } },
    theme: 'grid',
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const earnY = (doc as any).lastAutoTable?.finalY ?? y;

  autoTable(doc, {
    startY: y,
    margin: { left: M + half + 8 },
    tableWidth: half,
    head: [['Deductions', 'Amount (₹)']],
    body: deductionRows,
    foot: [['Total Deductions', fmtMoneyDecimal(entry.total_deductions)]],
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: BRAND_PURPLE_RGB, textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [255, 247, 235], textColor: TEXT_DARK_RGB, fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'right' } },
    theme: 'grid',
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dedY = (doc as any).lastAutoTable?.finalY ?? y;

  y = Math.max(earnY, dedY) + 12;

  // ─── Net pay banner ──────────────────────────────────────────────
  setFill(doc, BRAND_PURPLE_RGB);
  doc.roundedRect(M, y, pageW - M * 2, 56, 6, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('NET PAY', M + 16, y + 22);
  doc.setFontSize(20);
  doc.text(fmtMoneyDecimal(entry.net_pay), pageW - M - 16, y + 30, { align: 'right' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  if (entry.net_pay_in_words) {
    doc.text(`In words: ${entry.net_pay_in_words}`, M + 16, y + 44);
  }
  y += 70;

  // ─── Manual notes (if any) ───────────────────────────────────────
  if (entry.notes && entry.notes.trim().length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, TEXT_DARK_RGB);
    doc.text('Notes', M, y);
    doc.setFont('helvetica', 'normal');
    setColor(doc, TEXT_MUTED_RGB);
    const wrapped = doc.splitTextToSize(entry.notes, pageW - M * 2);
    doc.text(wrapped, M, y + 12);
    y += 14 + (wrapped.length * 11);
  }

  // ─── Footer ──────────────────────────────────────────────────────
  setDraw(doc, [220, 220, 220]);
  doc.setLineWidth(0.5);
  doc.line(M, y + 6, pageW - M, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setColor(doc, TEXT_MUTED_RGB);
  const stamp = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  doc.text(`Generated ${stamp} via Sniffy Payroll.`, M, y + 22);
  doc.text('This is a system-generated document.', M, y + 34);

  return doc;
}

/** Convenience: build + trigger download.  Returns the filename used. */
export async function downloadSalarySlip(opts: SalarySlipOptions): Promise<string> {
  const doc = await buildSalarySlip(opts);
  const { entry, run } = opts;
  const safeName = (entry.groomer_name || 'groomer').replace(/[^a-z0-9]+/gi, '_');
  const filename = `Sniffy_Salary_${safeName}_${run.period_year}-${String(run.period_month).padStart(2, '0')}.pdf`;
  doc.save(filename);
  return filename;
}

/** Convenience: build + return a Blob (e.g. for previewing in an
 *  <iframe> or attaching to a share-sheet later). */
export async function buildSalarySlipBlob(opts: SalarySlipOptions): Promise<Blob> {
  return (await buildSalarySlip(opts)).output('blob');
}
