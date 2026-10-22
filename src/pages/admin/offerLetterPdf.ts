/**
 * admin/offerLetterPdf.ts — Groomer offer letter PDF.
 *
 * Mirrors the look of the Word-made letters (cream page, centred logo, bold
 * key terms, company signature on the "Authorized Signatory" line). Used two
 * ways: unsigned preview (no `signatureDataUrl` → blank signature line) and
 * the final signed copy built on the public sign page.
 *
 * Content comes from the snapshot on the acknowledgment row, never the live
 * template. Lazy-loads jspdf like ./policyAckPdf.ts.
 */

import type { jsPDF as JsPdfInstance } from 'jspdf';
import type { PolicyAcknowledgment } from './policyTypes';
import { fmtLetterDate, parseBold } from './offerLetterTemplate';

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

type Rgb = [number, number, number];
const PAPER:  Rgb = [247, 241, 224];
const INK:    Rgb = [28, 28, 28];
const MUTED:  Rgb = [105, 105, 105];

const LOGO_URL      = '/sniffy-logo.png';
const AUTH_SIG_URL  = '/sniffy-authorized-signature.png';

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Browser helper: fetch the logo + company signature as data URLs. */
export async function loadOfferLetterAssets(): Promise<OfferLetterAssets> {
  const [logoDataUrl, authorizedSigDataUrl] = await Promise.all([
    fetchAsDataUrl(LOGO_URL),
    fetchAsDataUrl(AUTH_SIG_URL),
  ]);
  return { logoDataUrl, authorizedSigDataUrl };
}

export interface OfferLetterAssets {
  logoDataUrl:         string | null;
  authorizedSigDataUrl: string | null;
}

export interface OfferLetterPdfOptions {
  ack:    PolicyAcknowledgment;
  assets: OfferLetterAssets;
  /** PNG data URL from the signer's canvas. Omit for an unsigned preview. */
  signatureDataUrl?: string;
  signedAt?:         string;
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  }) + ' IST';
}

function ddmmyyyy(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, '0');
  const ist = new Date(d.getTime() + 330 * 60_000);
  return `${p(ist.getUTCDate())}-${p(ist.getUTCMonth() + 1)}-${ist.getUTCFullYear()}`;
}

export async function buildOfferLetterPdf(opts: OfferLetterPdfOptions): Promise<JsPdfInstance> {
  const jsPDF = await loadJsPdf();
  const { ack, assets, signatureDataUrl, signedAt } = opts;
  const data = ack.offer_data;
  if (!data) throw new Error('Offer letter data is missing on this record.');

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 56;
  const maxW = pageW - M * 2;
  const FS = 10.5;
  const LH = 14.2;
  const BOTTOM = pageH - 54;
  let y = 0;

  function paintPage() {
    doc.setFillColor(...PAPER);
    doc.rect(0, 0, pageW, pageH, 'F');
  }
  function newPage() {
    doc.addPage();
    paintPage();
    y = M;
  }
  function ensureRoom(need: number) {
    if (y + need > BOTTOM) newPage();
  }

  /** Word-wrapped paragraph with inline **bold**; returns after advancing y. */
  function rich(text: string, gapAfter = 7) {
    type Word = { t: string; bold: boolean };
    const words: Word[] = [];
    for (const seg of parseBold(text)) {
      for (const w of seg.text.split(/(\s+)/)) {
        if (w) words.push({ t: w, bold: seg.bold });
      }
    }
    doc.setFontSize(FS);
    const lines: Word[][] = [[]];
    let lineW = 0;
    for (const w of words) {
      doc.setFont('helvetica', w.bold ? 'bold' : 'normal');
      const wW = doc.getTextWidth(w.t);
      const isSpace = /^\s+$/.test(w.t);
      if (!isSpace && lineW + wW > maxW && lines[lines.length - 1].length > 0) {
        lines.push([]);
        lineW = 0;
      }
      if (isSpace && lines[lines.length - 1].length === 0) continue;
      lines[lines.length - 1].push(w);
      lineW += wW;
    }
    for (const line of lines) {
      ensureRoom(LH);
      // Merge same-style neighbours into runs so spacing is the viewer's, not per-word.
      const runs: Word[] = [];
      for (const w of line) {
        const last = runs[runs.length - 1];
        if (last && last.bold === w.bold) last.t += w.t;
        else runs.push({ ...w });
      }
      let x = M;
      for (const r of runs) {
        doc.setFont('helvetica', r.bold ? 'bold' : 'normal');
        doc.setTextColor(...INK);
        // Draw the run without its trailing spaces and advance over them by hand —
        // some viewers collapse a trailing space at a bold/normal boundary.
        const trimmed = r.t.replace(/\s+$/, '');
        const trailing = r.t.length - trimmed.length;
        doc.text(trimmed, x, y);
        // Small pad at every style boundary: viewers that substitute Helvetica draw
        // text slightly wider than jsPDF's metrics, which otherwise eats the space.
        x += doc.getTextWidth(trimmed) + trailing * doc.getTextWidth(' ') + (trailing > 0 ? 1.8 : 0);
      }
      y += LH;
    }
    y += gapAfter;
  }

  // ─── Page 1: logo, title ─────────────────────────────────────────
  paintPage();
  y = 40;
  if (assets.logoDataUrl) {
    const lw = 150, lh = (177 / 420) * lw;
    try { doc.addImage(assets.logoDataUrl, 'PNG', (pageW - lw) / 2, y, lw, lh); } catch { /* skip logo */ }
    y += lh + 18;
  } else {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(69, 26, 139);
    doc.text('SNIFFY', pageW / 2, y + 20, { align: 'center' });
    y += 46;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(ack.policy_title, pageW / 2, y, { align: 'center' });
  y += 38;

  rich(`Date: **${fmtLetterDate(data.letter_date)}**`, 12);
  rich(`Dear **${ack.signer_name}**,`, 8);
  for (const p of data.preamble) rich(p, 9);
  y += 4;

  // ─── Sections ────────────────────────────────────────────────────
  for (const section of ack.policy_sections) {
    ensureRoom(LH * 3);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FS);
    doc.setTextColor(...INK);
    doc.text(section.heading, M, y);
    y += LH + 1;
    for (const para of section.items) rich(para, 6);
    y += 5;
  }

  // ─── Signature block ────────────────────────────────────────────
  ensureRoom(230);
  y += 10;

  rich(`**Name:** ${ack.signer_name}`, 12);

  doc.setFont('helvetica', 'bold'); doc.setFontSize(FS); doc.setTextColor(...INK);
  doc.text('Signature:', M, y + 40);
  const sigX = M + 62;
  if (signatureDataUrl) {
    try { doc.addImage(signatureDataUrl, 'PNG', sigX, y - 4, 150, 56); } catch { /* skip */ }
  }
  doc.setDrawColor(...INK); doc.setLineWidth(0.6);
  doc.line(sigX, y + 44, sigX + 170, y + 44);
  y += 66;

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', M, y);
  doc.setFont('helvetica', 'normal');
  if (signedAt) {
    doc.text(ddmmyyyy(signedAt), M + 32, y);
  } else {
    doc.text('___ / ___ / ______', M + 32, y);
  }
  y += 42;

  doc.setFont('helvetica', 'normal');
  doc.text('For Sniffy Pet Partners', M, y);
  if (assets.authorizedSigDataUrl) {
    try { doc.addImage(assets.authorizedSigDataUrl, 'PNG', M + 112, y - 20, 108, 36); } catch { /* skip */ }
  }
  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Signatory:', M, y);
  doc.setLineWidth(0.6);
  doc.line(M + 112, y + 2, M + 112 + 120, y + 2);

  // ─── Audit line (signed copies only) ─────────────────────────────
  if (signedAt) {
    y += 34;
    ensureRoom(40);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.text(
      `Digitally signed by ${ack.signer_name} on ${fmtDateTime(signedAt)} via the Sniffy secure signing link.  Document ID: ${ack.id}`,
      M, y,
    );
  }

  // ─── Page numbers ───────────────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.text(`Sniffy Pet Partners · Offer Letter · ${ack.signer_name} · Page ${i} of ${total}`, pageW / 2, pageH - 28, { align: 'center' });
  }

  return doc;
}

export async function buildOfferLetterPdfBlob(opts: OfferLetterPdfOptions): Promise<Blob> {
  return (await buildOfferLetterPdf(opts)).output('blob');
}
