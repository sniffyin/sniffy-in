/**
 * groomer/GroomerDocumentsTab.tsx
 *
 * Read-only document inbox for the logged-in groomer.
 *
 * Layout (mobile, top → bottom):
 *   ┌───────────────────────────────┐
 *   │ 📄  Documents                  │   ← header chip + count
 *   │     12 items · refresh ↻       │
 *   ├───────────────────────────────┤
 *   │  ┌─────────────────────────┐  │
 *   │  │ [📄]  May 2026 Salary    │  │
 *   │  │       PDF · 318 KB · 17  │  │
 *   │  │       May 2026   [↓]     │  │
 *   │  │       For you · personal │  │
 *   │  └─────────────────────────┘  │
 *   │  ┌─────────────────────────┐  │
 *   │  │ [📄]  Conduct Policy v3  │  │
 *   │  │       PDF · 1.2 MB · 15  │  │
 *   │  │       May 2026   [↓]     │  │
 *   │  │       All groomers       │  │
 *   │  └─────────────────────────┘  │
 *   └───────────────────────────────┘
 *
 * Data: documentsApi.fetchDocumentsForGroomer.
 *
 * The groomer cannot upload, edit, or delete — only view / download.
 * Tapping "View" opens the file in a new tab via a 1-hour signed URL
 * (private bucket); tapping "Download" hits the same URL with a
 * Content-Disposition behaviour delegated to the browser.
 */

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, ExternalLink, RefreshCw, Loader2, Inbox,
  AlertCircle,
} from 'lucide-react';
import type { AdminUser } from '../admin/authStore';
import {
  type GroomerDocument,
  fetchDocumentsForGroomer,
  getSignedDocumentUrl,
  fmtFileSize,
} from './documentsApi';
import { fmtDate } from '../admin/types';

// ─── Component ────────────────────────────────────────────────

export default function GroomerDocumentsTab({ groomer }: { groomer: AdminUser }) {
  const groomerId = groomer.groomer_id ?? groomer.id;

  const [docs,     setDocs]    = useState<GroomerDocument[]>([]);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState<string | null>(null);
  // Per-row "opening download…" indicator so the user knows a tap is
  // working while we round-trip to Storage for a signed URL.
  const [openingId, setOpeningId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchDocumentsForGroomer(groomerId);
      setDocs(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not load documents.');
    } finally {
      setLoading(false);
    }
  }, [groomerId]);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Open or download a document ──
  async function handleOpen(doc: GroomerDocument, mode: 'view' | 'download') {
    setOpeningId(doc.id);
    setError(null);
    try {
      const res = await getSignedDocumentUrl(doc.file_path);
      if (!res.url) throw new Error(res.error ?? 'Could not get download link.');

      if (mode === 'view') {
        // Open in a new tab so the PWA stays in place.
        window.open(res.url, '_blank', 'noopener,noreferrer');
      } else {
        // Trigger a programmatic download by hitting the signed URL
        // through a temporary <a download>.  Browsers will honour the
        // download attribute on cross-origin links when no
        // Content-Disposition is present, falling back to opening the
        // file in a tab — which is also acceptable here.
        const a = document.createElement('a');
        a.href = res.url;
        a.download = doc.file_name;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not open document.');
    } finally {
      setOpeningId(null);
    }
  }

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="pb-8">
      {/* ── Purple hero header ──
          Matches the Earnings + Help & Support tabs: gradient slab,
          chip-style icon, uppercase eyebrow, big title.  A faded
          oversized FileText sits in the corner as decoration, mirroring
          the Sparkles + HelpCircle treatment on the sibling tabs. */}
      <motion.section
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl mb-5 p-5 text-white"
        style={{
          background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)',
          boxShadow: '0 6px 24px rgba(69,26,139,0.18)',
        }}
      >
        <FileText className="absolute -top-3 -right-3 text-white/10" size={120}/>
        <div className="relative flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="grid place-items-center w-7 h-7 rounded-xl bg-white/15">
                <FileText size={14}/>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                Your Inbox
              </p>
            </div>
            <h1 className="text-2xl font-extrabold leading-tight">Documents</h1>
            <p className="text-xs font-semibold text-white/80 mt-0.5">
              {loading
                ? 'Loading…'
                : `${docs.length} item${docs.length === 1 ? '' : 's'} shared with you`}
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh"
            className="relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white/15 text-white hover:bg-white/25 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''}/>
          </button>
        </div>
      </motion.section>

      {/* ── Inline error ── */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-2xl border border-red-100 bg-red-50 text-red-700 text-sm font-semibold flex items-start gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5"/>
          <span>{error}</span>
        </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <SkeletonList/>
      ) : docs.length === 0 ? (
        <EmptyState/>
      ) : (
        <div className="space-y-3">
          {docs.map((doc, i) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              index={i}
              opening={openingId === doc.id}
              onView={() => handleOpen(doc, 'view')}
              onDownload={() => handleOpen(doc, 'download')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────

function DocumentCard({
  doc, index, opening, onView, onDownload,
}: {
  doc: GroomerDocument;
  index: number;
  opening: boolean;
  onView: () => void;
  onDownload: () => void;
}) {
  // NOTE: We deliberately do NOT surface `doc.scope` to the groomer.
  //   Whether a document was sent only to them or broadcast to every
  //   groomer is information that could feel awkward / unfair — e.g.
  //   knowing "this policy went to everyone but my warning letter is
  //   just for me".  The icon colour and chip are kept identical for
  //   every document so the visual is uniform regardless of scope.
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="bg-white rounded-2xl border border-gray-100 p-4"
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #451a8b)',
          }}
        >
          <FileText size={18}/>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-extrabold text-gray-900 leading-snug truncate">
            {doc.title}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
            {doc.file_name}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {fmtDate(doc.created_at)} · {fmtFileSize(doc.size_bytes)}
          </p>

          {doc.notes && (
            <p className="text-[12px] text-gray-600 mt-2 leading-snug italic">
              "{doc.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onView}
          disabled={opening}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition text-[12px] font-bold text-gray-700 disabled:opacity-50"
        >
          {opening
            ? <Loader2 size={14} className="animate-spin"/>
            : <ExternalLink size={14}/>}
          View
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={opening}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-white transition text-[12px] font-bold disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #451a8b)' }}
        >
          {opening
            ? <Loader2 size={14} className="animate-spin"/>
            : <Download size={14}/>}
          Download
        </button>
      </div>
    </motion.div>
  );
}

// ─── Skeleton + empty state ───────────────────────────────────

function SkeletonList() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-gray-100 rounded-2xl"/>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-14 px-6">
      <div
        className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-gray-400 mb-3"
        style={{ background: '#f6f4fb' }}
      >
        <Inbox size={26}/>
      </div>
      <p className="text-[15px] font-extrabold text-gray-800">No documents yet</p>
      <p className="text-[12px] text-gray-500 mt-1 max-w-xs mx-auto leading-snug">
        When your coordinator shares a salary slip, offer letter, or policy
        document, it will show up here.
      </p>
    </div>
  );
}
