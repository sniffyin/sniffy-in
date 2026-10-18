/**
 * lib/galleryApi.ts — Supabase-backed public photo gallery.
 *
 * Read side is used by the public /gallery page (pages/GalleryPage.tsx);
 * write side by the admin Gallery tab (pages/admin/GalleryTab.tsx). Photos
 * are compressed client-side through the same pipeline groomer-side proof
 * photos use (see pages/groomer/uploadHelper.ts, kind: 'gallery') before
 * landing in the `groomer-uploads` bucket under the `gallery/` prefix, then
 * recorded as a row in `gallery_photos` for ordering/captioning.
 */

import { supabase } from './supabase';
import { uploadGroomerImage } from '../pages/groomer/uploadHelper';

export interface GalleryPhoto {
  id: string;
  storage_path: string;
  public_url: string;
  caption: string | null;
  sort_order: number;
  file_size: number;
  created_by_id: string;
  created_by_name: string;
  created_at: string;
}

/** Public read — used by the /gallery page and the home page teaser.
 *  Ordered for display. Pass `limit` to cap the number of rows fetched
 *  (the home page teaser only ever shows a handful — no reason to pull
 *  every row's metadata down just to slice it client-side, especially as
 *  the gallery grows). */
export async function fetchGalleryPhotos(limit?: number): Promise<GalleryPhoto[]> {
  let q = supabase
    .from('gallery_photos')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (limit) q = q.limit(limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as GalleryPhoto[];
}

export interface UploadGalleryPhotoResult {
  ok: boolean;
  photo?: GalleryPhoto;
  error?: string;
}

/**
 * Compress + upload one photo, then insert its row appended to the end
 * of the current order. Call once per file for a multi-file picker.
 */
export async function addGalleryPhoto(
  file: File,
  createdById: string,
  createdByName: string,
  onPhase?: (phase: 'compressing' | 'uploading') => void,
): Promise<UploadGalleryPhotoResult> {
  const up = await uploadGroomerImage('gallery', crypto.randomUUID(), file, { onPhase });
  if (!up.ok || !up.publicUrl) {
    return { ok: false, error: up.error ?? 'Upload failed.' };
  }

  // storage_path is everything after the bucket's public URL prefix —
  // easier to just re-derive it from the known `gallery/` path shape
  // uploadGroomerImage produces rather than parsing the returned URL.
  const storagePath = up.publicUrl.split('/groomer-uploads/')[1] ?? '';

  const { data: maxRow } = await supabase
    .from('gallery_photos')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('gallery_photos')
    .insert([{
      storage_path: storagePath,
      public_url: up.publicUrl,
      sort_order: nextOrder,
      file_size: up.bytesOut ?? 0,
      created_by_id: createdById,
      created_by_name: createdByName,
    }])
    .select('*')
    .single();
  if (error) return { ok: false, error: error.message };

  return { ok: true, photo: data as GalleryPhoto };
}

/** Removes both the DB row and the storage object. Storage failures are
 *  logged, not thrown — a missing file shouldn't block removing the row. */
export async function deleteGalleryPhoto(photo: GalleryPhoto): Promise<void> {
  const { error } = await supabase.from('gallery_photos').delete().eq('id', photo.id);
  if (error) throw error;

  if (photo.storage_path) {
    const { error: storageErr } = await supabase.storage
      .from('groomer-uploads')
      .remove([photo.storage_path]);
    if (storageErr) console.warn('gallery photo storage delete failed:', storageErr.message);
  }
}

export async function updateGalleryCaption(id: string, caption: string): Promise<void> {
  const { error } = await supabase
    .from('gallery_photos')
    .update({ caption: caption.trim() || null })
    .eq('id', id);
  if (error) throw error;
}

/** Persists a new display order. `orderedIds` is the full photo list in
 *  its new order — each gets its array index as its sort_order. */
export async function reorderGalleryPhotos(orderedIds: string[]): Promise<void> {
  const results = await Promise.all(
    orderedIds.map((id, i) =>
      supabase.from('gallery_photos').update({ sort_order: i }).eq('id', id)
    )
  );
  const failed = results.find(r => r.error);
  if (failed?.error) throw failed.error;
}
