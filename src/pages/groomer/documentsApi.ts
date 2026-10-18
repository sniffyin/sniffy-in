/**
 * documentsApi.ts — Supabase wrapper for the `groomer_documents` table
 * and the matching `groomer-documents` private storage bucket.
 *
 * Shared between:
 *   • GroomerDocumentsTab   (read-only — own + broadcast docs)
 *   • AdminDocumentsTab     (coordinator upload / list / delete)
 *
 * Schema mirror of the SQL migration
 * (20260518000000_create_groomer_documents.sql):
 *
 *   id            uuid
 *   title         text
 *   file_path     text     (path inside the bucket)
 *   file_name     text     (original filename)
 *   mime_type     text
 *   size_bytes    integer
 *   scope         'all' | 'groomer' | 'admin'
 *   groomer_id    text | null
 *   groomer_name  text | null
 *   uploaded_by   text
 *   notes         text | null
 *   created_at    timestamptz
 *
 * Why a separate bucket from `groomer-uploads`?
 *   The selfies / review screenshots bucket is public-read.  Documents
 *   like salary slips, offer letters and ID proofs are sensitive — we
 *   keep them in a private bucket and hand out short-lived signed URLs
 *   so a screenshot of a row can't be scraped via predictable paths.
 */

import { supabase } from '../../lib/supabase';

const BUCKET = 'groomer-documents';

/** How long a download link stays valid.  Long enough for the user to
 *  hit "Download" and have the browser actually save the file, short
 *  enough that a leaked link goes stale quickly. */
const SIGNED_URL_TTL_SECONDS = 60 * 60;   // 1 hour

/** Hard ceiling on uploads — Supabase free plan caps at 50 MB anyway and
 *  documents this big are almost always a mistake. */
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;   // 25 MB

export type DocumentScope = 'all' | 'groomer' | 'admin';

export interface GroomerDocument {
  id:           string;
  title:        string;
  file_path:    string;
  file_name:    string;
  mime_type:    string;
  size_bytes:   number;
  scope:        DocumentScope;
  groomer_id:   string | null;
  groomer_name: string | null;
  uploaded_by:  string;
  notes:        string | null;
  created_at:   string;
}

// ─── Reads ────────────────────────────────────────────────────

/**
 * Documents visible to a specific groomer:
 *   • everything with scope='all'  (broadcast)
 *   • everything with scope='groomer' AND groomer_id = this groomer
 *
 * scope='admin' rows are coordinator-private and excluded here.
 */
export async function fetchDocumentsForGroomer(
  groomerId: string,
): Promise<GroomerDocument[]> {
  const { data, error } = await supabase
    .from('groomer_documents')
    .select('*')
    .or(`scope.eq.all,and(scope.eq.groomer,groomer_id.eq.${groomerId})`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[documentsApi] fetchDocumentsForGroomer', error);
    return [];
  }
  return (data as GroomerDocument[]) ?? [];
}

/** All documents — coordinator view. */
export async function fetchAllDocuments(): Promise<GroomerDocument[]> {
  const { data, error } = await supabase
    .from('groomer_documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[documentsApi] fetchAllDocuments', error);
    return [];
  }
  return (data as GroomerDocument[]) ?? [];
}

// ─── Signed URL (download) ────────────────────────────────────

/**
 * Build a short-lived signed URL for the given storage path.
 * Returned URL is good for SIGNED_URL_TTL_SECONDS — long enough for a
 * user to tap "Download" or "View" and have the browser stream the file.
 */
export async function getSignedDocumentUrl(
  filePath: string,
): Promise<{ url?: string; error?: string }> {
  const { data, error } = await supabase
    .storage
    .from(BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return { error: error?.message ?? 'Could not create download link.' };
  }
  return { url: data.signedUrl };
}

// ─── Upload (coordinator) ─────────────────────────────────────

export interface UploadDocumentInput {
  file:          File;
  title:         string;
  scope:         DocumentScope;
  /** Required when scope='groomer'.  Ignored otherwise. */
  groomer_id?:   string | null;
  /** Display label for the groomer (denormalised for the list view). */
  groomer_name?: string | null;
  uploaded_by:   string;       // coordinator's name (audit)
  notes?:        string;
}

export interface UploadDocumentResult {
  ok:        boolean;
  document?: GroomerDocument;
  error?:    string;
}

/**
 * Upload a file to the bucket and insert the matching DB row.  Rolls
 * back the storage upload if the DB insert fails so we don't leak
 * orphaned files.
 */
export async function uploadDocument(input: UploadDocumentInput): Promise<UploadDocumentResult> {
  const { file, title, scope, groomer_id, groomer_name, uploaded_by, notes } = input;

  // ── Client-side validation ──
  if (!file)                          return { ok: false, error: 'Pick a file to upload.' };
  if (!title.trim())                  return { ok: false, error: 'Give the document a title.' };
  if (!uploaded_by.trim())            return { ok: false, error: 'Missing uploader name.' };
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, error: `File too large — keep under ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.` };
  }
  if (scope === 'groomer' && !groomer_id) {
    return { ok: false, error: 'Pick a groomer for a person-specific document.' };
  }

  // ── Build a non-guessable storage path ──
  // Layout:  <scope>/<groomerOrAll>/<timestamp>_<safe-name>
  // Even though the bucket is private + signed URLs, a non-guessable
  // path is a second layer of defence (e.g. against a leaked admin
  // session quickly enumerating salary slips by groomer-id).
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const folder =
    scope === 'all'     ? 'broadcast' :
    scope === 'admin'   ? 'admin' :
    `groomer/${groomer_id}`;
  const filePath = `${folder}/${Date.now()}_${randomToken(6)}_${safeName}`;

  // ── 1. Upload to storage ──
  const { error: upErr } = await supabase
    .storage
    .from(BUCKET)
    .upload(filePath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert:      false,
    });
  if (upErr) {
    return { ok: false, error: upErr.message };
  }

  // ── 2. Insert DB row ──
  const row = {
    title:        title.trim(),
    file_path:    filePath,
    file_name:    file.name,
    mime_type:    file.type || 'application/octet-stream',
    size_bytes:   file.size,
    scope,
    groomer_id:   scope === 'groomer' ? (groomer_id ?? null) : null,
    groomer_name: scope === 'groomer' ? (groomer_name ?? null) : null,
    uploaded_by:  uploaded_by.trim(),
    notes:        notes?.trim() || null,
  };

  const { data, error: insErr } = await supabase
    .from('groomer_documents')
    .insert([row])
    .select()
    .single();

  if (insErr || !data) {
    // Roll back the storage upload so we don't leak an orphan.
    await supabase.storage.from(BUCKET).remove([filePath]).catch(() => {});
    return { ok: false, error: insErr?.message ?? 'Could not save document.' };
  }

  return { ok: true, document: data as GroomerDocument };
}

// ─── Delete (coordinator) ─────────────────────────────────────

/**
 * Delete a document — removes the storage object first, then the DB row.
 * If the DB row deletion fails we leave the storage object alone so it
 * can be retried; the worst-case outcome is a row pointing at a missing
 * file, which the download path already handles gracefully (signed URL
 * returns 404).
 */
export async function deleteDocument(doc: Pick<GroomerDocument, 'id' | 'file_path'>):
  Promise<{ ok: boolean; error?: string }>
{
  // Remove the storage object first — if this fails we surface the
  // error to the user before touching the DB.
  const { error: storErr } = await supabase
    .storage
    .from(BUCKET)
    .remove([doc.file_path]);
  if (storErr && !/not.*found/i.test(storErr.message)) {
    return { ok: false, error: storErr.message };
  }

  const { error: dbErr } = await supabase
    .from('groomer_documents')
    .delete()
    .eq('id', doc.id);
  if (dbErr) return { ok: false, error: dbErr.message };

  return { ok: true };
}

// ─── Tiny helpers ─────────────────────────────────────────────

/** Human-friendly size — used in card subtitles. */
export function fmtFileSize(bytes: number): string {
  if (!bytes || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Friendly scope chip label. */
export function scopeLabel(scope: DocumentScope): string {
  return scope === 'all'     ? 'All Groomers'
       : scope === 'groomer' ? 'Person-specific'
       : 'Coordinator-only';
}

/** Crypto-grade random token used to keep storage paths non-guessable. */
function randomToken(len = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  // crypto.getRandomValues is available in every modern browser.  Fall
  // back to Math.random for the (essentially never) case it's missing,
  // since path-secrecy is defence-in-depth, not a real auth boundary.
  const buf = (typeof crypto !== 'undefined' && crypto.getRandomValues)
    ? crypto.getRandomValues(new Uint32Array(len))
    : null;
  for (let i = 0; i < len; i++) {
    const n = buf ? buf[i] : Math.floor(Math.random() * 1e9);
    out += chars[n % chars.length];
  }
  return out;
}
