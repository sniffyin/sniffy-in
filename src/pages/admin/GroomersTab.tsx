/**
 * admin/GroomersTab.tsx — Active groomer roster + add/edit groomer.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Loader2, CheckCircle2, AlertCircle, Star, Phone, Camera, ImageOff, FolderOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  Groomer, GroomerStatus,
  GROOMER_STATUS_LABELS, GROOMER_STATUS_COLORS,
  fmtDate,
} from './types';
import { uploadGroomerImage } from '../groomer/uploadHelper';
import GroomerApplicationsPanel, {
  GroomerDocsModal, findApplicationForGroomer, useApplications, GroomerApplication,
} from './GroomerApplicationsPanel';
import HelpersRoster from './HelpersRoster';
import HelperApplicationsPanel, { useHelperApplications } from './HelperApplicationsPanel';

// ─── Areas list (reuse from GroomerOnboardingPage) ────────────

const PUNE_AREAS = [
  'Baner', 'Aundh', 'Wakad', 'Hinjewadi', 'Kothrud', 'Karve Nagar',
  'Shivajinagar', 'Viman Nagar', 'Kalyani Nagar', 'Koregaon Park',
  'Kharadi', 'Wagholi', 'Hadapsar', 'Kondhwa', 'NIBM', 'Katraj',
  'Dhayari', 'Bavdhan', 'Pimpri-Chinchwad', 'Ravet', 'Kalewadi',
  'Lohegaon', 'Dhanori', 'Camp', 'Wanowrie', 'Mundwa', 'Bibewadi',
];

// ─── Groomer Form Modal ───────────────────────────────────────

interface GroomerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editGroomer?: Groomer | null;
}

type GroomerFormData = Pick<Groomer, 'name' | 'phone' | 'areas' | 'status' | 'notes' | 'photo_url'>;

const EMPTY_GROOMER: GroomerFormData = {
  name: '', phone: '', areas: [], status: 'active', notes: '', photo_url: null,
};

function GroomerFormModal({ open, onClose, onSaved, editGroomer }: GroomerFormModalProps) {
  const [form, setForm]     = useState<GroomerFormData>(EMPTY_GROOMER);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [done, setDone]     = useState(false);

  // Photo state — separate from `form.photo_url` so we can distinguish
  // "no change" from "uploaded a new file" from "cleared the photo".
  //   pickedFile === null && form.photo_url === null  → no photo
  //   pickedFile !== null                              → upload this on save
  //   pickedFile === null && form.photo_url           → keep existing
  //   `clearedPhoto`                                   → user removed it
  const [pickedFile, setPickedFile]     = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [clearedPhoto, setClearedPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editGroomer) {
      const { id: _id, rating: _r, total_sessions: _ts, joined_date: _jd, created_at: _c, updated_at: _u, ...rest } = editGroomer;
      setForm(rest);
    } else {
      setForm(EMPTY_GROOMER);
    }
    setError('');
    setDone(false);
    setPickedFile(null);
    setPreviewUrl(null);
    setClearedPhoto(false);
    setUploadProgress(null);
  }, [editGroomer, open]);

  // Clean up the temporary object URL we created for the preview when
  // the file changes or the modal unmounts — avoids leaking blob handles.
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function pickPhoto(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please pick an image file (jpg / png).');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPickedFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setClearedPhoto(false);
    setError('');
  }

  function clearPhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPickedFile(null);
    setPreviewUrl(null);
    setClearedPhoto(true);
  }

  // What to show in the preview: a freshly picked file > the existing
  // saved URL (unless the user cleared it) > nothing.
  const previewSrc = previewUrl
    ? previewUrl
    : (!clearedPhoto && form.photo_url) ? form.photo_url : null;

  function toggleArea(area: string) {
    setForm(prev => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter(a => a !== area)
        : [...prev.areas, area],
    }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    setSaving(true);
    setError('');

    // Build the payload up front — we'll inject photo_url into it
    // depending on which path (add vs edit) we're on.
    const basePayload = { ...form };
    if (clearedPhoto) basePayload.photo_url = null;

    try {
      if (editGroomer) {
        // ─── EDIT path ──────────────────────────────────────────
        // If the user picked a new file, upload it FIRST so we can
        // include the resulting URL in the single UPDATE.  Failing
        // to upload aborts the save — we don't want to lose data
        // changes when the photo upload is what failed.
        let photoUrl: string | null = basePayload.photo_url ?? null;
        if (pickedFile) {
          setUploadProgress('Uploading photo…');
          const up = await uploadGroomerImage('profiles', editGroomer.id, pickedFile);
          if (!up.ok || !up.publicUrl) {
            throw new Error(up.error ?? 'Photo upload failed.');
          }
          photoUrl = up.publicUrl;
        }
        setUploadProgress(null);
        const { error: err } = await supabase
          .from('groomers')
          .update({ ...basePayload, photo_url: photoUrl })
          .eq('id', editGroomer.id);
        if (err) throw err;
      } else {
        // ─── ADD path ──────────────────────────────────────────
        // Insert first to get the new id, then upload using that id
        // (so the file path encodes the groomer), then UPDATE the row
        // with photo_url.  If the upload fails after insert, we still
        // have a usable row — the coordinator can re-edit and try the
        // photo again.
        const { data, error: insertErr } = await supabase
          .from('groomers')
          .insert([{ ...basePayload, photo_url: null }])
          .select('id')
          .single();
        if (insertErr) throw insertErr;
        const newId = (data as { id: string } | null)?.id;
        if (newId && pickedFile) {
          setUploadProgress('Uploading photo…');
          const up = await uploadGroomerImage('profiles', newId, pickedFile);
          setUploadProgress(null);
          if (!up.ok || !up.publicUrl) {
            // Insert succeeded but upload didn't.  Surface a soft warning
            // but DON'T treat it as a hard fail — the groomer record exists.
            console.warn('[GroomerForm] insert ok but photo upload failed:', up.error);
            setError('Groomer saved, but photo upload failed. You can re-edit and try again.');
            setDone(true);
            setTimeout(() => { setDone(false); onSaved(); onClose(); }, 1500);
            return;
          }
          const { error: updErr } = await supabase
            .from('groomers')
            .update({ photo_url: up.publicUrl })
            .eq('id', newId);
          if (updErr) throw updErr;
        }
      }
      setDone(true);
      setTimeout(() => { setDone(false); onSaved(); onClose(); }, 1000);
    } catch (e: unknown) {
      setUploadProgress(null);
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-extrabold text-gray-900">
                {editGroomer ? 'Edit Groomer' : 'Add Groomer'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* ── Photo ── */}
              {/* Optional groomer profile photo.  Renders on the
                  groomer's own dashboard top bar + drawer (groomers.
                  photo_url).  Hidden input + tap-to-upload card —
                  same UX as the milestone selfie modal, but for an
                  admin context so no `capture` attribute (the
                  coordinator typically uploads from gallery / drive). */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Profile Photo <span className="text-gray-400 font-medium">(optional)</span>
                </label>
                <div className="flex items-center gap-4">
                  {/* Preview / placeholder */}
                  <div
                    className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-purple-100 bg-purple-50 flex items-center justify-center"
                  >
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt="Groomer photo"
                        className="w-full h-full object-cover"
                        onError={() => { /* leave fallback in place if URL is broken */ }}
                      />
                    ) : (
                      <span className="text-2xl font-extrabold text-sniffy-purple">
                        {(form.name.trim().charAt(0) || '?').toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Controls — stacked on mobile, side-by-side otherwise */}
                  <div className="flex-1 flex flex-wrap gap-2">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={e => pickPhoto(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-sniffy-purple text-white hover:bg-purple-900 transition"
                    >
                      <Camera size={13}/>
                      {previewSrc ? 'Change photo' : 'Upload photo'}
                    </button>
                    {previewSrc && (
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-red-500 hover:bg-red-50 transition"
                      >
                        <ImageOff size={13}/> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sniffy-purple"
                    placeholder="e.g. Ravi Kumar"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sniffy-purple"
                    placeholder="10-digit number"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-sniffy-purple"
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value as GroomerStatus }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Areas They Can Serve
                </label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border border-gray-100 rounded-xl p-3">
                  {PUNE_AREAS.map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArea(area)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                        form.areas.includes(area)
                          ? 'bg-sniffy-purple text-white border-sniffy-purple'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-sniffy-purple hover:text-sniffy-purple'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
                {form.areas.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{form.areas.length} area(s) selected</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sniffy-purple resize-none"
                  placeholder="Any notes about this groomer…"
                  value={form.notes ?? ''}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              {error
                ? <p className="flex items-center gap-1.5 text-xs text-red-600"><AlertCircle size={12} />{error}</p>
                : <div />
              }
              <div className="flex gap-3">
                <button onClick={onClose} className="px-5 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || done}
                  className="px-6 py-2.5 rounded-full bg-sniffy-purple text-white text-sm font-bold hover:bg-purple-900 transition flex items-center gap-2 disabled:opacity-70"
                >
                  {done ? <><CheckCircle2 size={14} /> Saved!</>
                    : saving ? <><Loader2 size={14} className="animate-spin" /> {uploadProgress ?? 'Saving…'}</>
                    : editGroomer ? 'Update' : 'Add Groomer'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────

export default function GroomersTab({ canDelete = true, canWrite = true }: { canDelete?: boolean; canWrite?: boolean }) {
  const [groomers, setGroomers]     = useState<Groomer[]>([]);
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editGroomer, setEditGroomer] = useState<Groomer | null>(null);
  const [view, setView]             = useState<'roster' | 'applications' | 'helpers'>('roster');
  const { apps: helperApps, loading: helpersLoading, refresh: refreshHelpers } = useHelperApplications();
  const [rosterKey, setRosterKey] = useState(0);
  const pendingHelpers = helperApps.filter(a => a.status === 'pending').length;
  const [docsApp, setDocsApp]       = useState<GroomerApplication | null>(null);
  const { apps, loading: appsLoading, refresh: refreshApps } = useApplications();
  const pendingCount = apps.filter(a => a.status === 'pending').length;

  const fetchGroomers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('groomers').select('*').order('name');
    setGroomers((data ?? []) as Groomer[]);

    // Fetch session counts per groomer
    const { data: sessions } = await supabase
      .from('grooming_sessions')
      .select('groomer_id')
      .not('groomer_id', 'is', null);

    const counts: Record<string, number> = {};
    (sessions ?? []).forEach((s: { groomer_id: string | null }) => {
      if (s.groomer_id) counts[s.groomer_id] = (counts[s.groomer_id] ?? 0) + 1;
    });
    setSessionCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => { fetchGroomers(); }, [fetchGroomers]);

  async function handleDelete(id: string) {
    if (!window.confirm('Remove this groomer? Their session history will be preserved.')) return;
    await supabase.from('groomers').delete().eq('id', id);
    fetchGroomers();
  }

  function openAdd() { setEditGroomer(null); setModalOpen(true); }
  function openEdit(g: Groomer) { setEditGroomer(g); setModalOpen(true); }

  const active   = groomers.filter(g => g.status === 'active');
  const inactive = groomers.filter(g => g.status !== 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Groomer Roster</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {active.length} active · {inactive.length} inactive/on leave
          </p>
        </div>
        {canWrite && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-sniffy-purple text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-purple-900 transition shadow-sm"
          >
            <Plus size={16} /> Add Groomer
          </button>
        )}
      </motion.div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-full w-fit">
        {([['roster', 'Roster'], ['applications', 'Applications'], ['helpers', 'Helpers']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              view === id ? 'bg-white text-sniffy-purple shadow-sm' : 'text-gray-500'
            }`}
          >
            {label}
            {id === 'applications' && pendingCount > 0 && (
              <span className="bg-sniffy-yellow text-gray-900 rounded-full px-1.5 text-[10px] font-extrabold">{pendingCount}</span>
            )}
            {id === 'helpers' && pendingHelpers > 0 && (
              <span className="bg-sniffy-yellow text-gray-900 rounded-full px-1.5 text-[10px] font-extrabold">{pendingHelpers}</span>
            )}
          </button>
        ))}
      </div>

      {view === 'helpers' ? (
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-bold text-gray-800 mb-2">Helper roster</h3>
            <HelpersRoster refreshKey={rosterKey} canWrite={canWrite} />
          </section>
          <section>
            <h3 className="text-sm font-bold text-gray-800 mb-2">Applications</h3>
            <HelperApplicationsPanel apps={helperApps} loading={helpersLoading} canWrite={canWrite}
              onChanged={() => { refreshHelpers(); setRosterKey(k => k + 1); }} />
          </section>
        </div>
      ) : view === 'applications' ? (
        <GroomerApplicationsPanel
          apps={apps}
          loading={appsLoading}
          canWrite={canWrite}
          onChanged={() => { refreshApps(); fetchGroomers(); }}
        />
      ) : loading ? (
        <div className="grid sm:grid-cols-2 gap-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
        </div>
      ) : groomers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">✂️</p>
          <p className="text-gray-500 font-medium">No groomers added yet.</p>
          {canWrite && (
            <button onClick={openAdd} className="mt-4 text-sniffy-purple text-sm font-semibold hover:underline">
              + Add your first groomer
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Active groomers */}
          {active.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Active</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {active.map(g => (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 group hover:border-purple-200 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Avatar — photo if uploaded, initial otherwise */}
                      <div className="flex items-center gap-3 min-w-0">
                        {g.photo_url ? (
                          <img
                            src={g.photo_url}
                            alt={g.name}
                            className="w-11 h-11 rounded-xl object-cover shrink-0 bg-purple-100"
                            onError={(e) => {
                              // Replace with initial fallback inline if photo URL is broken
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-11 h-11 rounded-xl bg-purple-100 text-sniffy-purple flex items-center justify-center text-base font-extrabold shrink-0 ${g.photo_url ? 'hidden' : ''}`}>
                          {g.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{g.name}</p>
                          <a
                            href={`tel:${g.phone}`}
                            className="text-xs text-gray-400 flex items-center gap-1 hover:text-sniffy-purple transition"
                          >
                            <Phone size={10} /> {g.phone}
                          </a>
                        </div>
                      </div>

                      {/* Actions */}
                      {(canWrite || canDelete) && (
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                          {canWrite && (
                            <button
                              onClick={() => openEdit(g)}
                              className="p-1.5 rounded-lg hover:bg-purple-100 text-gray-400 hover:text-sniffy-purple transition"
                            >
                              <Edit2 size={13} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(g.id)}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star size={11} className="text-sniffy-yellow fill-sniffy-yellow" />
                        {g.rating.toFixed(1)}
                      </span>
                      <span>{sessionCounts[g.id] ?? 0} sessions</span>
                      <span>Since {fmtDate(g.joined_date)}</span>
                    </div>

                    {/* Areas */}
                    {g.areas.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {g.areas.slice(0, 5).map(a => (
                          <span key={a} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {a}
                          </span>
                        ))}
                        {g.areas.length > 5 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs">
                            +{g.areas.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Status badge + documents */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${GROOMER_STATUS_COLORS[g.status]}`}>
                        {GROOMER_STATUS_LABELS[g.status]}
                      </span>
                      {(() => {
                        const app = findApplicationForGroomer(apps, g.id, g.phone);
                        return app ? (
                          <button
                            onClick={() => setDocsApp(app)}
                            className="flex items-center gap-1 text-xs font-semibold text-sniffy-purple hover:underline"
                          >
                            <FolderOpen size={12} /> Documents
                          </button>
                        ) : null;
                      })()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Inactive / On Leave */}
          {inactive.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Inactive / On Leave
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {inactive.map(g => (
                  <div
                    key={g.id}
                    className="bg-gray-50 rounded-2xl border border-gray-200 p-5 opacity-75 flex items-center gap-3 group hover:opacity-100 transition"
                  >
                    {g.photo_url ? (
                      <img
                        src={g.photo_url}
                        alt={g.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 bg-gray-200 grayscale"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-10 h-10 rounded-xl bg-gray-200 text-gray-500 flex items-center justify-center font-bold shrink-0 ${g.photo_url ? 'hidden' : ''}`}>
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-700 truncate">{g.name}</p>
                      <p className="text-xs text-gray-400">{g.phone}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${GROOMER_STATUS_COLORS[g.status]}`}>
                      {GROOMER_STATUS_LABELS[g.status]}
                    </span>
                    {(() => {
                      const app = findApplicationForGroomer(apps, g.id, g.phone);
                      return app ? (
                        <button onClick={() => setDocsApp(app)} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-sniffy-purple transition" title="Documents">
                          <FolderOpen size={13} />
                        </button>
                      ) : null;
                    })()}
                    {canWrite && (
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-sniffy-purple transition">
                          <Edit2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <GroomerDocsModal app={docsApp} onClose={() => setDocsApp(null)} />

      {canWrite && (
        <GroomerFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={fetchGroomers}
          editGroomer={editGroomer}
        />
      )}
    </div>
  );
}
