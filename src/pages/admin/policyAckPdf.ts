/**
 * admin/policyAckPdf.ts — Role Policy Acknowledgment
 *
 * Client-side PDF generator for a signed role-policy acknowledgment: brand
 * header, the exact policy text the signer read (snapshotted on the
 * acknowledgment row, not re-fetched — so an edit to the master text can
 * never retroactively change what a past signer is shown to have agreed to),
 * their name/role/timestamp, and their captured signature image.
 *
 * Mirrors the lazy-load + brand-color pattern in ./salarySlipPdf.ts. Only
 * `jspdf` is needed here (no tables), so jspdf-autotable isn't pulled in.
 */

import type { jsPDF as JsPdfInstance } from 'jspdf';
import type { PolicyAcknowledgment, RolePolicySection } from './policyTypes';
import { POLICY_ROLE_LABEL } from './policyTypes';

type JsPdfCtor = typeof import('jspdf')['jsPDF'];

let jsPdfPromise: Promise<JsPdfCtor> | null = null;
function loadJsPdf(): Promise<JsPdfCtor> {
  if (!jsPdfPromise) {
    jsPdfPromise = import('jspdf')
      .then(m => m.jsPDF)
      .catch(err => { jsPdfPromise = null; throw err; });
  }
  return jsPdfPromise;
}

const BRAND_PURPLE_RGB: [number, number, number] = [69, 26, 139];
const TEXT_DARK_RGB:    [number, number, number] = [33, 33, 33];
const TEXT_MUTED_RGB:   [number, number, number] = [110, 110, 110];

function setColor(doc: JsPdfInstance, rgb: [number, number, number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}
function setFill(doc: JsPdfInstance, rgb: [number, number, number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export interface PolicyAckPdfOptions {
  ack:              PolicyAcknowledgment;
  intro:            string | null;
  /** PNG data URL captured from the signature canvas. */
  signatureDataUrl: string;
  signedAt:         string;
}

/** Build the PDF document. Pure — doesn't touch the DOM or trigger a
 *  download; callers decide what to do with the output. */
export async function buildPolicyAckPdf(opts: PolicyAckPdfOptions): Promise<JsPdfInstance> {
  const jsPDF = await loadJsPdf();
  const { ack, intro, signatureDataUrl, signedAt } = opts;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 44;
  let y = M;

  function ensureRoom(need: number) {
    if (y + need > pageH - 56) {
      doc.addPage();
      y = M;
    }
  }

  // ─── Header band ────────────────────────────────────────────────
  setFill(doc, BRAND_PURPLE_RGB);
  doc.rect(0, 0, pageW, 74, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('SNIFFY', M, 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('At-home pet grooming · Pune, Maharashtra', M, 48);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('ROLE ACKNOWLEDGMENT', pageW - M, 32, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(POLICY_ROLE_LABEL[ack.role], pageW - M, 48, { align: 'right' });

  y = 98;

  // ─── Title + intro ──────────────────────────────────────────────
  setColor(doc, TEXT_DARK_RGB);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(ack.policy_title, pageW - M * 2);
  doc.text(titleLines, M, y);
  y += titleLines.length * 16 + 8;

  if (intro) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    setColor(doc, TEXT_MUTED_RGB);
    const introLines = doc.splitTextToSize(intro, pageW - M * 2);
    doc.text(introLines, M, y);
    y += introLines.length * 12 + 10;
  }

  // ─── Sections ────────────────────────────────────────────────────
  const sections = (ack.policy_sections ?? []) as RolePolicySection[];
  for (const section of sections) {
    ensureRoom(28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setColor(doc, BRAND_PURPLE_RGB);
    doc.text(section.heading, M, y);
    y += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    setColor(doc, TEXT_DARK_RGB);
    for (const item of section.items) {
      const lines = doc.splitTextToSize(`•  ${item}`, pageW - M * 2 - 8);
      ensureRoom(lines.length * 12 + 4);
      doc.text(lines, M + 4, y);
      y += lines.length * 12 + 4;
    }
    y += 8;
  }

  // ─── Signature block ────────────────────────────────────────────
  ensureRoom(150);
  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(M, y, pageW - M, y);
  y += 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setColor(doc, TEXT_DARK_RGB);
  doc.text('Acknowledged & signed by', M, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Name: ${ack.signer_name}`, M, y);
  doc.text(`Role: ${POLICY_ROLE_LABEL[ack.role]}`, M + 220, y);
  y += 14;
  doc.text(`Signed: ${fmtDateTime(signedAt)}`, M, y);
  y += 16;

  const sigW = 200, sigH = 80;
  doc.setDrawColor(210, 210, 210);
  doc.rect(M, y, sigW, sigH);
  try {
    doc.addImage(signatureDataUrl, 'PNG', M + 4, y + 4, sigW - 8, sigH - 8);
  } catch {
    // Malformed data URL (unlikely) — skip the image rather than fail the whole PDF.
  }
  y += sigH + 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setColor(doc, TEXT_MUTED_RGB);
  doc.text('Signature', M, y);

  // ─── Footer ──────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setColor(doc, TEXT_MUTED_RGB);
  doc.text(`Generated ${fmtDateTime(new Date().toISOString())} via Sniffy.`, M, pageH - 30);

  return doc;
}

/** Convenience: build + return a Blob, ready to upload to Storage. */
export async function buildPolicyAckPdfBlob(opts: PolicyAckPdfOptions): Promise<Blob> {
  return (await buildPolicyAckPdf(opts)).output('blob');
}
