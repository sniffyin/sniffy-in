/**
 * admin/DocumentsTab.tsx — Coordinator-facing documents manager.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────────┐
 *   │ 📄 Documents                                            │
 *   │ Upload, broadcast, or keep private.                     │
 *   ├─────────────────────────────────────────────────────────┤
 *   │ ┌── Upload card ──────────────────────────────────────┐ │
 *   │ │  Title:  [_______________________]                  │ │
 *   │ │  Scope:  ( ) All groomers                           │ │
 *   │ │          ( ) Specific groomer  [dropdown]           │ │
 *   │ │          ( ) Coordinator only (private)             │ │
 *   │ │  File:   [Choose file]   Notes: [_______________]   │ │
 *   │ │                              [ Upload document ]    │ │
 *   │ └─────────────────────────────────────────────────────┘ │
 *   │                                                         │
 *   │  Filter:  [All] [Broadcast] [Per-groomer] [Coord-only]  │
 *   │                                                         │
 *   │  ┌── Row ────────────────────────────────────────────┐  │
 *   │  │ 📄  May 2026 Salary - Hemant                       │  │
 *   │  │     PDF · 318 KB · uploaded 17 May 2026 by Nikita  │  │
 *   │  │     [👤 Hemant]   [View] [Download] [🗑 Delete]    │  │
 *   │  └────────────────────────────────────────────────────┘  │
 *   └─────────────────────────────────────────────────────────┘
 *
 * Data:  documentsApi (fetchAllDocuments, uploadDocument, deleteDocument,
 *        getSignedDocumentUrl).  Groomer dropdown comes from the
 *        `groomers` table — active first.
 *
 * Visibility rules:
 *   • scope='all'      → every groomer sees the doc in their inbox.
 *   • scope='groomer'  → only the named groomer sees it.
 *   • scope='admin'    → coordinator-private; no groomer sees it.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import {
  FileText, Upload, Loader2, CheckCircle2, AlertCircle,
  Trash2, Download, ExternalLink, Megaphone, User as UserIcon,
  Lock, RefreshCw, Search, X, Receipt, ChevronRight, Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  type GroomerDocument,
  type DocumentScope,
  fetchAllDocuments,
  uploadDocument,
  deleteDocument,
  getSignedDocumentUrl,
  fmtFileSize,
} from '../groomer/documentsApi';
import { fmtDate } from './types';
import { getSessionUser } from './authStore';

// ─── Types ────────────────────────────────────────────────────

interface GroomerOption {
  id:     string;
  name:   string;
  status: 'active' | 'inactive' | 'on_leave';
}

/**
 * Filter chips at the top of the list.  Disambiguated from
 * `DocumentScope` ('all'|'groomer'|'admin') because DocumentScope's
 * 'all' value means "broadcast", but the filter's "all" means "show
 * everything".  Without a different label these collide.
 */
type ScopeFilter = 'show_all' | DocumentScope;

// ─── Component ────────────────────────────────────────────────

export default function DocumentsTab() {
  // `uploaded_by` audit field — the logged-in coordinator's name.
  const currentUser = getSessionUser();
  const uploaderName = currentUser?.name ?? 'Coordinator';

  // ── Data ──
  const [docs,      setDocs]      = useState<GroomerDocument[]>([]);
  const [groomers,  setGroomers]  = useState<GroomerOption[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Upload form ──
  // `scope` starts as `null` (no preselection) so a coordinator can't
  // accidentally broadcast a salary slip to every groomer by missing
  // the scope picker.  See the shake animation in handleUpload — the
  // form refuses to submit until they pick one of the three options.
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [title,         setTitle]         = useState('');
  const [scope,         setScope]         = useState<DocumentScope | null>(null);
  const [pickedGroomer, setPickedGroomer] = useState<string>('');
  const [pickedFile,    setPickedFile]    = useState<File | null>(null);
  const [notes,         setNotes]         = useState('');
  const [uploading,     setUploading]     = useState(false);
  const [uploadError,   setUploadError]   = useState<string | null>(null);
  const [uploadDone,    setUploadDone]    = useState(false);

  // Animation handle so we can shake the scope picker when the user
  // submits without choosing.  Cheaper than reaching for a CSS keyframe
  // — framer is already loaded for the rest of this tab.
  const scopeShake = useAnimationControls();

  // ── List filter / search ──
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('show_all');
  const [search,      setSearch]      = useState('');

  // ── Per-row action state ──
  const [busyId,        setBusyId]        = useState<string | null>(null);
  const [rowError,      setRowError]      = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GroomerDocument | null>(null);

  // ── Initial load ──
  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [docList, { data: groomerRows, error: gErr }] = await Promise.all([
        fetchAllDocuments(),
        supabase
          .from('groomers')
          .select('id, name, status')
          .order('status', { ascending: true })    // active first
          .order('name',   { ascending: true }),
      ]);
      if (gErr) throw gErr;
      setDocs(docList);
      setGroomers((groomerRows as GroomerOption[]) ?? []);
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : 'Could not load documents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Derived: filtered + searched doc list ──
  const visibleDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs.filter(d => {
      if (scopeFilter !== 'show_all' && d.scope !== scopeFilter) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.file_name.toLowerCase().includes(q) ||
        (d.groomer_name ?? '').toLowerCase().includes(q)
      );
    });
  }, [docs, scopeFilter, search]);

  // Counts per chip — computed once.
  const counts = useMemo(() => ({
    all:       docs.length,
    broadcast: docs.filter(d => d.scope === 'all').length,
    groomer:   docs.filter(d => d.scope === 'groomer').length,
    admin:     docs.filter(d => d.scope === 'admin').length,
  }), [docs]);

  // ── Upload submit ──
  async function handleUpload(e?: React.FormEvent) {
    e?.preventDefault();
    setUploadError(null);
    setUploadDone(false);

    // Scope first — if the coordinator hasn't chosen, shake the picker
    // and bail.  This sits ABOVE the title / file checks so the most
    // dangerous omission (accidentally broadcasting) is flagged before
    // the user even sees the "pick a file" message.
    if (!scope) {
      scopeShake.start({
        x: [0, -10, 10, -8, 8, -4, 4, 0],
        transition: { duration: 0.45, ease: 'easeInOut' },
      });
      setUploadError('Please choose who can see this — All groomers, a specific groomer, or coordinator-only.');
      return;
    }

    if (!pickedFile) {
      setUploadError('Pick a file first.');
      return;
    }
    if (!title.trim()) {
      setUploadError('Give the document a title.');
      return;
    }
    if (scope === 'groomer' && !pickedGroomer) {
      setUploadError('Pick the groomer this document is for.');
      return;
    }

    setUploading(true);
    try {
      const groomerName = scope === 'groomer'
        ? groomers.find(g => g.id === pickedGroomer)?.name ?? null
        : null;

      const res = await uploadDocument({
        file:         pickedFile,
        title:        title.trim(),
        scope,
        groomer_id:   scope === 'groomer' ? pickedGroomer : null,
        groomer_name: groomerName,
        uploaded_by:  uploaderName,
        notes:        notes.trim() || undefined,
      });

      if (!res.ok || !res.document) {
        throw new Error(res.error ?? 'Upload failed.');
      }

      // Reset the form, prepend the new doc to the list, flash success.
      // We deliberately reset `scope` back to null so the next upload
      // also starts with no preselection — same safety guarantee as the
      // initial render.  Coordinator paid the small UX cost of one
      // extra tap in exchange for never accidentally re-broadcasting.
      setDocs(prev => [res.document!, ...prev]);
      setTitle('');
      setNotes('');
      setPickedFile(null);
      setPickedGroomer('');
      setScope(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadDone(true);
      setTimeout(() => setUploadDone(false), 2200);
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  // ── Open / download (signed URL) ──
  async function handleOpen(doc: GroomerDocument, mode: 'view' | 'download') {
    setBusyId(doc.id);
    setRowError(null);
    try {
      const res = await getSignedDocumentUrl(doc.file_path);
      if (!res.url) throw new Error(res.error ?? 'Could not get download link.');
      if (mode === 'view') {
        window.open(res.url, '_blank', 'noopener,noreferrer');
      } else {
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
      setRowError(e instanceof Error ? e.message : 'Could not open document.');
    } finally {
      setBusyId(null);
    }
  }

  // ── Delete (with confirm modal) ──
  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    setRowError(null);
    try {
      const res = await deleteDocument(pendingDelete);
      if (!res.ok) throw new Error(res.error ?? 'Delete failed.');
      setDocs(prev => prev.filter(d => d.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (e: unknown) {
      setRowError(e instanceof Error ? e.message : 'Delete failed.');
    } finally {
      setBusyId(null);
    }
  }

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="pb-8">
      {/* ── Title ── */}
      <header className="mb-5 flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #451a8b)' }}
        >
          <FileText size={20}/>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
            Documents
          </h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Upload salary slips, offer letters, policies, or keep documents for yourself.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white text-gray-500 hover:text-sniffy-purple transition disabled:opacity-50"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''}/>
        </button>
      </header>

      {/* ── Phase 6 — Payroll CTA.  Salary slips are now generated by
            the in-app Payroll module (HRMS-style: per-groomer salary
            structure, auto-pulled attendance + session counts, PDF
            generation in-app).  Clicking jumps to the Payroll tab via
            the URL hash so a hard reload lands on Payroll.

            Layout notes:
              • Mobile (default): single column — label, headline, three
                feature pills, full-width CTA button.  The previous
                horizontal layout squeezed the description into 4-5 lines
                and shrunk the CTA pill to almost-invisible width.
              • sm and up: row layout — icon left, text middle, CTA right.
                Description is replaced with scannable feature pills so the
                eye can pick out "what this does" without reading prose.
         ── */}
      <button
        type="button"
        onClick={() => { window.location.hash = '#payroll'; }}
        className="w-full mb-6 group relative overflow-hidden rounded-2xl text-left transition active:scale-[0.99] hover:shadow-lg hover:shadow-purple-900/10"
        style={{
          background: 'linear-gradient(120deg, #f5f3ff 0%, #ede9fe 55%, #f3e8ff 100%)',
          border: '1px solid #ddd6fe',
          boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
        }}
      >
        {/* Decorative glows — kept subtle so feature pills stay legible. */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-sniffy-purple/15 rounded-full blur-3xl pointer-events-none"/>
        <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-fuchsia-300/20 rounded-full blur-2xl pointer-events-none"/>
        <div className="absolute right-5 bottom-4 opacity-[0.07] pointer-events-none">
          <Receipt size={64} className="text-sniffy-purple"/>
        </div>

        <div className="relative p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Icon + headline block */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div
              className="w-12 h-12 rounded-2xl bg-white text-sniffy-purple flex items-center justify-center shrink-0"
              style={{ boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)' }}
            >
              <Receipt size={22} strokeWidth={2.2}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9.5px] font-black uppercase tracking-[0.2em] text-sniffy-purple/70 flex items-center gap-1">
                <Sparkles size={10}/> New · in-app payroll
              </p>
              <p className="text-[15px] sm:text-base font-extrabold text-gray-900 mt-0.5 leading-snug">
                Run payroll inside Sniffy
              </p>

              {/* Feature pills — replace the dense 4-line description
                  with three scannable chips.  Each pill is one concept
                  the coordinator should know the module covers. */}
              <div className="mt-2 flex flex-wrap gap-1">
                <PayrollFeaturePill label="Salary structures"/>
                <PayrollFeaturePill label="Auto attendance"/>
                <PayrollFeaturePill label="PDF slips"/>
              </div>
            </div>
          </div>

          {/* CTA — full-width on mobile, auto-width on desktop. */}
          <div
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-black text-white bg-sniffy-purple shrink-0 group-hover:bg-[#5b21b6] transition w-full sm:w-auto"
            style={{ boxShadow: '0 6px 14px rgba(76, 29, 149, 0.28)' }}
          >
            Open Payroll <ChevronRight size={13}/>
          </div>
        </div>
      </button>

      {/* ── Upload form card ── */}
      <form
        onSubmit={handleUpload}
        className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 mb-6"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Upload size={16} className="text-sniffy-purple"/>
          <p className="text-[13px] font-extrabold text-gray-800 uppercase tracking-wider">
            Upload a document
          </p>
        </div>

        {/* Title */}
        <div className="mb-3">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. May 2026 Salary Slip — Hemant"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-sniffy-purple/30 focus:border-sniffy-purple"
          />
        </div>

        {/* Scope */}
        <div className="mb-3">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Who can see this? <span className="text-red-500">*</span>
          </label>
          {/* Wrap in motion.div + AnimationControls so handleUpload can
              shake the whole group when scope is null on submit. */}
          <motion.div
            animate={scopeShake}
            className="flex flex-wrap gap-1.5"
          >
            <ScopeRadio
              active={scope === 'all'}
              onClick={() => setScope('all')}
              Icon={Megaphone}
              label="All groomers"
              hint="Broadcast"
            />
            <ScopeRadio
              active={scope === 'groomer'}
              onClick={() => setScope('groomer')}
              Icon={UserIcon}
              label="Specific groomer"
              hint="Person-only"
            />
            <ScopeRadio
              active={scope === 'admin'}
              onClick={() => setScope('admin')}
              Icon={Lock}
              label="Coordinator only"
              hint="Private to you"
            />
          </motion.div>
          {scope === null && (
            <p className="mt-1.5 text-[11px] text-gray-400 font-medium">
              Pick one — no default, on purpose.
            </p>
          )}

          {scope === 'groomer' && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Groomer
              </label>
              <select
                value={pickedGroomer}
                onChange={e => setPickedGroomer(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-sniffy-purple/30 focus:border-sniffy-purple"
              >
                <option value="">— Pick a groomer —</option>
                {groomers.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name}{g.status !== 'active' ? `  (${g.status})` : ''}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </div>

        {/* File + notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              File (PDF recommended)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
              onChange={e => setPickedFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-sniffy-purple/10 file:text-sniffy-purple hover:file:bg-sniffy-purple/20"
            />
            {pickedFile && (
              <p className="text-[11px] text-gray-500 mt-1 truncate">
                {pickedFile.name} · {fmtFileSize(pickedFile.size)}
              </p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Short caption for the groomer"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sniffy-purple/30 focus:border-sniffy-purple"
            />
          </div>
        </div>

        {/* Error / success */}
        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-700 text-[12px] font-semibold flex items-start gap-2"
            >
              <AlertCircle size={14} className="mt-0.5"/> {uploadError}
            </motion.div>
          )}
          {uploadDone && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-3 px-3 py-2 rounded-lg bg-green-50 border border-green-100 text-green-700 text-[12px] font-semibold flex items-start gap-2"
            >
              <CheckCircle2 size={14} className="mt-0.5"/> Document uploaded.
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={uploading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #451a8b)' }}
        >
          {uploading ? <Loader2 size={16} className="animate-spin"/> : <Upload size={16}/>}
          {uploading ? 'Uploading…' : 'Upload document'}
        </button>
      </form>

      {/* ── Filter chips + search ── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FilterChip
          active={scopeFilter === 'show_all'}
          onClick={() => setScopeFilter('show_all')}
          label={`All (${counts.all})`}
        />
        <FilterChip
          active={scopeFilter === 'all'}
          onClick={() => setScopeFilter('all')}
          label={`Broadcast (${counts.broadcast})`}
          Icon={Megaphone}
        />
        <FilterChip
          active={scopeFilter === 'groomer'}
          onClick={() => setScopeFilter('groomer')}
          label={`Per-groomer (${counts.groomer})`}
          Icon={UserIcon}
        />
        <FilterChip
          active={scopeFilter === 'admin'}
          onClick={() => setScopeFilter('admin')}
          label={`Coord-only (${counts.admin})`}
          Icon={Lock}
        />

        <div className="ml-auto flex-1 sm:flex-initial sm:w-64 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            type="text"
            placeholder="Search documents…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sniffy-purple/30 focus:border-sniffy-purple"
          />
        </div>
      </div>

      {/* Inline errors */}
      {rowError && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-[12px] font-semibold flex items-start gap-2">
          <AlertCircle size={14} className="mt-0.5"/> {rowError}
        </div>
      )}
      {loadError && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-[12px] font-semibold flex items-start gap-2">
          <AlertCircle size={14} className="mt-0.5"/> {loadError}
        </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl"/>)}
        </div>
      ) : visibleDocs.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500">
          {docs.length === 0
            ? 'No documents uploaded yet — start with the form above.'
            : 'No documents match this filter.'}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleDocs.map((doc, i) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              index={i}
              busy={busyId === doc.id}
              onView={() => handleOpen(doc, 'view')}
              onDownload={() => handleOpen(doc, 'download')}
              onDelete={() => setPendingDelete(doc)}
            />
          ))}
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      <AnimatePresence>
        {pendingDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[2px]"
              onClick={() => !busyId && setPendingDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[80] mx-auto max-w-md bg-white rounded-3xl p-6"
              style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.20)' }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                  <Trash2 size={18}/>
                </div>
                <div className="flex-1">
                  <p className="text-base font-extrabold text-gray-900">Delete document?</p>
                  <p className="text-[12px] text-gray-500 mt-1">
                    "{pendingDelete.title}" will be permanently removed.
                    {pendingDelete.scope === 'groomer'
                      ? ` ${pendingDelete.groomer_name ?? 'The groomer'} will no longer see it.`
                      : pendingDelete.scope === 'all'
                        ? ' All groomers will lose access.'
                        : ''}
                  </p>
                </div>
                <button
                  onClick={() => !busyId && setPendingDelete(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X size={18}/>
                </button>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setPendingDelete(null)}
                  disabled={!!busyId}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={!!busyId}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {busyId ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

// Compact pill used for the "Who can see this?" scope picker.
//
// Renders as a single-line pill with icon + label + a faded inline
// hint, so all three options fit on one row on desktop and at worst
// wrap to two rows on narrow mobile (instead of stacking into three
// big cards that pushed the rest of the form below the fold).
//
// The hint stays visible for every option — same information as the
// old card layout, just collapsed onto a single baseline.  When a
// pill is selected, the hint inherits the purple tint so it doesn't
// look greyed-out next to the active label.
function ScopeRadio({
  active, onClick, Icon, label, hint,
}: {
  active: boolean;
  onClick: () => void;
  Icon: React.ElementType;
  label: string;
  hint: string;
}) {
  // Active state uses a warm sniffy-yellow border + soft yellow ring
  // and a tinted background.  This picker is high-consequence (picking
  // "All groomers" when you meant one person broadcasts a document
  // that can't be quietly un-sent), so the active pill is deliberately
  // loud and warm-coloured to draw the eye before submit.
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-baseline gap-1.5 px-2.5 py-1.5 rounded-full border text-[12px] leading-tight transition',
        active
          ? 'border-sniffy-yellow bg-sniffy-yellow/15 text-gray-900 ring-2 ring-sniffy-yellow/40 shadow-sm'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
      ].join(' ')}
    >
      <Icon
        size={12}
        strokeWidth={2.5}
        className={`self-center ${active ? 'text-amber-700' : 'text-gray-400'}`}
      />
      <span className="font-bold">{label}</span>
      <span className={`text-[10px] font-medium ${active ? 'text-amber-700/80' : 'text-gray-400'}`}>
        · {hint}
      </span>
    </button>
  );
}

// Tiny semi-transparent chip used on the Payroll CTA card.  Pure label;
// no icon to keep the row dense.  Reads as "what this module includes"
// at a glance — replaces what used to be a 4-line prose description.
function PayrollFeaturePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/70 backdrop-blur-sm border border-sniffy-purple/15 text-[10px] font-bold text-sniffy-purple/85 tracking-tight">
      {label}
    </span>
  );
}

function FilterChip({
  active, onClick, label, Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  Icon?: React.ElementType;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold border transition',
        active
          ? 'border-sniffy-purple bg-sniffy-purple text-white'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
      ].join(' ')}
    >
      {Icon && <Icon size={12}/>}
      {label}
    </button>
  );
}

function DocumentRow({
  doc, index, busy, onView, onDownload, onDelete,
}: {
  doc: GroomerDocument;
  index: number;
  busy: boolean;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const scopeMeta = doc.scope === 'all'
    ? { Icon: Megaphone, label: 'All groomers',    cls: 'bg-indigo-50 text-indigo-600' }
    : doc.scope === 'groomer'
      ? { Icon: UserIcon, label: doc.groomer_name ?? 'A groomer', cls: 'bg-amber-50 text-amber-700' }
      : { Icon: Lock,     label: 'Coordinator-only', cls: 'bg-gray-100 text-gray-600' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.25) }}
      className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3"
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0"
        style={{
          background: doc.scope === 'all'
            ? 'linear-gradient(135deg, #6366f1, #4338ca)'
            : doc.scope === 'admin'
              ? 'linear-gradient(135deg, #6b7280, #374151)'
              : 'linear-gradient(135deg, #f6ac0a, #d97706)',
        }}
      >
        <FileText size={18}/>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-extrabold text-gray-900 leading-snug truncate">
          {doc.title}
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5 truncate">
          {doc.file_name} · {fmtFileSize(doc.size_bytes)}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {fmtDate(doc.created_at)} · by {doc.uploaded_by}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider ${scopeMeta.cls}`}>
            <scopeMeta.Icon size={10}/> {scopeMeta.label}
          </span>
        </div>
        {doc.notes && (
          <p className="text-[12px] text-gray-600 mt-2 leading-snug italic">"{doc.notes}"</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
        <button
          type="button"
          onClick={onView}
          disabled={busy}
          aria-label="View"
          className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-50"
        >
          {busy ? <Loader2 size={14} className="animate-spin"/> : <ExternalLink size={14}/>}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={busy}
          aria-label="Download"
          className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-50"
        >
          <Download size={14}/>
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          aria-label="Delete"
          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 disabled:opacity-50"
        >
          <Trash2 size={14}/>
        </button>
      </div>
    </motion.div>
  );
}
