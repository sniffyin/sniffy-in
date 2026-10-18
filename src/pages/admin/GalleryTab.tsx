/**
 * admin/GalleryTab.tsx — manage the public /gallery photo grid.
 *
 * Upload (multi-file, compressed client-side via the same pipeline
 * groomer-side proof photos use — pages/groomer/uploadHelper.ts, kind:
 * 'gallery'), drag-to-reorder, per-photo caption, and delete. Everything
 * here writes through lib/galleryApi.ts, which the public GalleryPage
 * reads from.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, AlertCircle, Trash2, GripVertical, Camera } from 'lucide-react';
import {
  GalleryPhoto,
  fetchGalleryPhotos,
  addGalleryPhoto,
  deleteGalleryPhoto,
  updateGalleryCaption,
  reorderGalleryPhotos,
} from '../../lib/galleryApi';
import { AdminUser } from './authStore';
import ConfirmDialog from '../../components/ConfirmDialog';

interface UploadJob {
  name: string;
  phase: 'compressing' | 'uploading' | 'done' | 'error';
  error?: string;
}

export default function GalleryTab({ user }: { user: AdminUser }) {
  const [photos, setPhotos]   = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [jobs, setJobs]       = useState<UploadJob[]>([]);
  const [toDelete, setToDelete] = useState<GalleryPhoto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIndex     = useRef<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchGalleryPhotos()
      .then(setPhotos)
      .catch(err => setError(err.message ?? 'Could not load photos.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setError('');
    setJobs(files.map(f => ({ name: f.name, phase: 'compressing' })));

    // Sequential, not parallel — keeps the compress/upload phase labels
    // meaningful per-file and avoids saturating the connection with N
    // simultaneous uploads on a coordinator's phone.
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const res = await addGalleryPhoto(file, user.id, user.name, (phase) => {
        setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, phase } : j));
      });
      setJobs(prev => prev.map((j, idx) => idx === i
        ? { ...j, phase: res.ok ? 'done' : 'error', error: res.error }
        : j));
      if (res.ok && res.photo) {
        setPhotos(prev => [...prev, res.photo!]);
      }
    }

    // Clear the job list shortly after the last one finishes so success
    // doesn't linger, but errors stay visible for the user to read.
    setTimeout(() => {
      setJobs(prev => prev.filter(j => j.phase === 'error'));
    }, 2000);

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteGalleryPhoto(toDelete);
      setPhotos(prev => prev.filter(p => p.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleCaptionBlur(photo: GalleryPhoto, value: string) {
    if (value.trim() === (photo.caption ?? '')) return;
    try {
      await updateGalleryCaption(photo.id, value);
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, caption: value.trim() || null } : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save caption.');
    }
  }

  // ── Native HTML5 drag-and-drop reorder (no extra dependency) ──
  function onDragStart(i: number) {
    dragIndex.current = i;
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }
  function onDrop(i: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === i) return;

    setPhotos(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(i, 0, moved);
      reorderGalleryPhotos(next.map(p => p.id)).catch(err => {
        setError(err instanceof Error ? err.message : 'Could not save new order.');
        load(); // resync with the server on failure
      });
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Gallery</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Photos shown on the public <span className="font-medium">/gallery</span> page. Drag tiles to reorder.
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={e => handleFiles(e.target.files)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-sniffy-purple text-white hover:bg-purple-900 transition"
          >
            <Upload size={15} />
            Upload Photos
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Upload progress */}
      {jobs.length > 0 && (
        <div className="space-y-2 bg-purple-50 rounded-2xl p-4">
          {jobs.map((job, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {job.phase === 'error' ? (
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              ) : job.phase === 'done' ? (
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex-shrink-0" />
              ) : (
                <Loader2 size={14} className="animate-spin text-sniffy-purple flex-shrink-0" />
              )}
              <span className="truncate text-gray-700 flex-1">{job.name}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {job.phase === 'compressing' ? 'Optimizing…'
                  : job.phase === 'uploading' ? 'Uploading…'
                  : job.phase === 'done' ? 'Done'
                  : job.error ?? 'Failed'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
          <Camera size={36} className="mb-3" />
          <p className="font-medium">No photos yet</p>
          <p className="text-sm mt-1">Upload a few to get the gallery started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              layout
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(i)}
              className="group relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 cursor-grab active:cursor-grabbing"
            >
              <div className="aspect-square">
                <img
                  src={photo.public_url}
                  alt={photo.caption ?? ''}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>

              <div className="absolute top-2 left-2 p-1 rounded-lg bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={14} />
              </div>

              <button
                type="button"
                onClick={() => setToDelete(photo)}
                aria-label="Delete photo"
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>

              <input
                type="text"
                defaultValue={photo.caption ?? ''}
                placeholder="Caption (optional)"
                onBlur={e => handleCaptionBlur(photo, e.target.value)}
                className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1.5 placeholder-white/50 outline-none focus:bg-black/80"
              />
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this photo?"
        subtitle="It will be removed from the public gallery immediately."
        variant="danger"
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
