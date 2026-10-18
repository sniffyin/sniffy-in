/**
 * uploadHelper.ts — Image upload pipeline for groomer-side proofs.
 *
 * Also reused (via the `gallery` kind) by the admin Gallery tab
 * (admin/GalleryTab.tsx) to upload public /gallery showcase photos —
 * same pipeline, just a much higher-quality profile since those aren't
 * forensic proof shots. See src/lib/galleryApi.ts.
 *
 *   Pipeline per upload:
 *     1. Compress      — Canvas-based JPEG re-encode + downscale.
 *                        Different profiles per kind (selfie vs screenshot).
 *                        A 4 MB phone photo typically drops to 60–150 KB.
 *                        No extra npm dependency — uses browser-native APIs.
 *     2. Upload        — Supabase Storage bucket `groomer-uploads`.
 *     3. Retry         — exponential backoff (3 attempts) so flaky mobile
 *                        networks don't strand a groomer mid-session.
 *
 *   Why heavy compression is acceptable:
 *     ▸ Arrivals are presence proof — pixel fidelity isn't valuable.
 *     ▸ Review screenshots need text readability but not photographic
 *       quality, so we keep slightly higher quality + larger max edge.
 *
 *   Bucket: `groomer-uploads`  (already exists, public-read, anon insert).
 */

import { supabase } from '../../lib/supabase';

const BUCKET = 'groomer-uploads';

export type UploadKind = 'arrivals' | 'reviews' | 'completions' | 'profiles' | 'gallery';

export interface UploadResult {
  ok:        boolean;
  publicUrl?: string;
  error?:    string;
  /** Bytes before compression (debug). */
  bytesIn?:  number;
  /** Bytes actually uploaded after compression (debug). */
  bytesOut?: number;
}

export type UploadPhase = 'compressing' | 'uploading';

export interface UploadOptions {
  /** Called as the pipeline transitions phases.  UI uses it to swap labels. */
  onPhase?: (phase: UploadPhase) => void;
}

interface Profile {
  maxEdge:    number;
  quality:    number;
  qualityMin: number;
  skipUnder:  number;
}

/** Per-kind base profile.
 *
 *   Profiles are aggressive — these images are forensic proof, not
 *   photographic assets.  Selfies need to show "person at door";
 *   review screenshots need readable text + visible star count.  Both
 *   stay clearly recognizable down to ~50 KB.
 */
const PROFILES: Record<UploadKind, Profile> = {
  arrivals:    { maxEdge:  720, quality: 0.45, qualityMin: 0.30, skipUnder: 30 * 1024 },
  reviews:     { maxEdge: 1000, quality: 0.55, qualityMin: 0.40, skipUnder: 60 * 1024 },
  completions: { maxEdge:  720, quality: 0.45, qualityMin: 0.30, skipUnder: 30 * 1024 },
  // Profile photos are shown small (≤56px avatar) but on retina they want
  // 2x — 320px max edge is enough.  Slightly higher quality than arrivals
  // because faces deteriorate quickly at low quality.
  profiles:    { maxEdge:  320, quality: 0.60, qualityMin: 0.45, skipUnder: 20 * 1024 },
  // Public marketing gallery (/gallery) — these are showcase photos, not
  // proof shots, so they get a much larger max edge and higher quality
  // floor than every other kind here.
  gallery:     { maxEdge: 1600, quality: 0.78, qualityMin: 0.55, skipUnder: 150 * 1024 },
};

/** Even tighter profiles when we detect a 2G / slow-2G uplink. */
const PROFILES_SLOW: Record<UploadKind, Profile> = {
  arrivals:    { maxEdge: 480, quality: 0.32, qualityMin: 0.22, skipUnder: 20 * 1024 },
  reviews:     { maxEdge: 720, quality: 0.42, qualityMin: 0.28, skipUnder: 40 * 1024 },
  completions: { maxEdge: 480, quality: 0.32, qualityMin: 0.22, skipUnder: 20 * 1024 },
  profiles:    { maxEdge: 240, quality: 0.45, qualityMin: 0.32, skipUnder: 12 * 1024 },
  gallery:     { maxEdge: 1000, quality: 0.55, qualityMin: 0.40, skipUnder: 80 * 1024 },
};

/** Hard ceiling for the final compressed payload — if first encode is
 *  still over this, we re-encode at progressively lower quality until it
 *  fits or we hit qualityMin.  Keeps even pathological inputs (10 MB
 *  panoramas, etc.) from sneaking through at hundreds of KB. */
const TARGET_MAX_BYTES = 200 * 1024;

/** Probe `navigator.connection` (Chrome / most Android browsers).  Returns
 *  whether the network looks meaningfully slow, in which case we pick
 *  PROFILES_SLOW instead of PROFILES. */
function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false;
  const c = (navigator as Navigator & {
    connection?: { effectiveType?: string; downlink?: number; saveData?: boolean };
  }).connection;
  if (!c) return false;
  if (c.saveData) return true;
  if (c.effectiveType === '2g' || c.effectiveType === 'slow-2g') return true;
  if (typeof c.downlink === 'number' && c.downlink > 0 && c.downlink < 0.5) return true;  // <0.5 Mbps
  return false;
}

function pickProfile(kind: UploadKind): Profile {
  return isSlowConnection() ? PROFILES_SLOW[kind] : PROFILES[kind];
}

/**
 * Public entry point.  Compresses then uploads, with retries on transient
 * failures.  Returns the public URL on success.
 */
export async function uploadGroomerImage(
  kind: UploadKind,
  sessionId: string,
  file: File,
  options?: UploadOptions,
): Promise<UploadResult> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'Please pick an image file (jpg/png).' };
  }
  if (file.size > 25 * 1024 * 1024) {
    return { ok: false, error: 'Image too large — keep under 25 MB.' };
  }

  const bytesIn = file.size;

  // 1. Compress
  options?.onPhase?.('compressing');
  let payload = file;
  try {
    payload = await compressImage(file, pickProfile(kind));
  } catch (err) {
    // Compression failed (e.g. weird codec) — upload the original.
    console.warn('[uploadGroomerImage] compress failed, falling back to original', err);
  }

  // 2. Upload (with retry)
  options?.onPhase?.('uploading');
  const ext  = payload.type === 'image/jpeg' ? 'jpg'
             : payload.type === 'image/png'  ? 'png'
             : payload.type === 'image/webp' ? 'webp'
             : 'jpg';
  const path = `${kind}/${sessionId}_${Date.now()}.${ext}`;

  const upRes = await uploadWithRetry(path, payload);
  if (!upRes.ok) return { ok: false, error: upRes.error, bytesIn, bytesOut: payload.size };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    return { ok: false, error: 'Could not resolve public URL.', bytesIn, bytesOut: payload.size };
  }

  // Useful for debugging in dev — does nothing visible to the user
  if (typeof console !== 'undefined') {
    const ratio = bytesIn > 0 ? Math.round((1 - payload.size / bytesIn) * 100) : 0;
    console.info(`[uploadGroomerImage] ${kind} ${kb(bytesIn)} → ${kb(payload.size)} (-${ratio}%)`);
  }

  return { ok: true, publicUrl: data.publicUrl, bytesIn, bytesOut: payload.size };
}

// ─── Compression ──────────────────────────────────────────────

interface CompressOpts {
  maxEdge:    number;
  quality:    number;
  qualityMin: number;
  skipUnder:  number;
}

/**
 * Resize + re-encode an image via Canvas.  Returns a new File.
 *
 *   Pipeline:
 *     1. Decode source image
 *     2. Iterative half-step downscale to target edge (better quality
 *        than a single bilinear resize when going from huge → small)
 *     3. Encode preferring WebP (≈ 25–35% smaller than JPEG at same
 *        visual quality), fall back to JPEG if browser/codec disagree
 *     4. If output is still over TARGET_MAX_BYTES, step quality down
 *        and re-encode until it fits or qualityMin is reached
 *     5. EXIF/metadata is automatically stripped by the canvas re-encode
 *
 *   Skip path: if file is already under `skipUnder`, return it unchanged.
 */
async function compressImage(file: File, opts: CompressOpts): Promise<File> {
  if (file.size <= opts.skipUnder) return file;

  const img = await loadImage(file);
  // `naturalWidth` exists on HTMLImageElement; on ImageBitmap only
  // `width` is available.  Either is correct.
  const w = (img as HTMLImageElement).naturalWidth || img.width;
  const h = (img as HTMLImageElement).naturalHeight || img.height;
  const target = fitTo(w, h, opts.maxEdge);

  // Iterative half-step downscale — when going from a huge source
  // (e.g. 4032px → 720px), one big bilinear resize blurs detail.
  // Halving in stages preserves features (face, text) at heavy ratios.
  const canvas = await downscaleIterative(img, target.w, target.h);

  // Free the object URL we used to load the image (only the <img> path
  // creates one — ImageBitmap has no src/objectURL to revoke).
  if (img.src && img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
  // Release ImageBitmap memory eagerly when supported.
  if (typeof (img as ImageBitmap).close === 'function') (img as ImageBitmap).close();

  // Choose format: WebP if the browser actually encodes it, else JPEG.
  const mime = supportsWebP() ? 'image/webp' : 'image/jpeg';

  // Try the configured quality first; if the result blows past
  // TARGET_MAX_BYTES, step down by 0.1 and re-encode, until fit or floor.
  let quality = opts.quality;
  let blob: Blob | null = null;
  while (quality >= opts.qualityMin) {
    blob = await encodeBlob(canvas, mime, quality);
    if (!blob) break;
    if (blob.size <= TARGET_MAX_BYTES) break;
    quality = +(quality - 0.1).toFixed(2);
  }
  if (!blob) throw new Error('Encoding failed.');

  // If compression produced a *bigger* file (rare, e.g. tiny icon),
  // keep the original.
  if (blob.size >= file.size) return file;

  const ext  = mime === 'image/webp' ? '.webp' : '.jpg';
  const name = file.name.replace(/\.[^.]+$/, '') + ext;
  return new File([blob], name, { type: mime, lastModified: Date.now() });
}

/** Iteratively halve the canvas size until close to (tw, th), then a final
 *  precise resize. Yields noticeably sharper output at heavy ratios.
 *  Accepts either HTMLImageElement or ImageBitmap as input. */
async function downscaleIterative(
  img: CanvasImageSource & { width: number; height: number },
  tw: number, th: number,
): Promise<HTMLCanvasElement> {
  let cw = (img as HTMLImageElement).naturalWidth || img.width;
  let ch = (img as HTMLImageElement).naturalHeight || img.height;

  // First canvas — full source. Subsequent passes draw from previous canvas.
  let cur = document.createElement('canvas');
  cur.width = cw; cur.height = ch;
  let ctx = cur.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable.');
  ctx.imageSmoothingEnabled = true;
  // hint browsers to prefer quality on the resize step
  (ctx as CanvasRenderingContext2D & { imageSmoothingQuality?: 'low' | 'medium' | 'high' }).imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0);

  // Halve until further halving would overshoot the target
  while (cw / 2 > tw && ch / 2 > th) {
    const nw = Math.round(cw / 2);
    const nh = Math.round(ch / 2);
    const next = document.createElement('canvas');
    next.width = nw; next.height = nh;
    const nctx = next.getContext('2d');
    if (!nctx) throw new Error('Canvas 2D context unavailable.');
    nctx.imageSmoothingEnabled = true;
    (nctx as CanvasRenderingContext2D & { imageSmoothingQuality?: 'low' | 'medium' | 'high' }).imageSmoothingQuality = 'high';
    // White fill so any transparent regions don't go black under WebP/JPEG
    nctx.fillStyle = '#ffffff';
    nctx.fillRect(0, 0, nw, nh);
    nctx.drawImage(cur, 0, 0, nw, nh);
    cur = next;
    cw = nw; ch = nh;
  }

  // Final exact resize
  if (cw !== tw || ch !== th) {
    const finalC = document.createElement('canvas');
    finalC.width = tw; finalC.height = th;
    const fctx = finalC.getContext('2d');
    if (!fctx) throw new Error('Canvas 2D context unavailable.');
    fctx.imageSmoothingEnabled = true;
    (fctx as CanvasRenderingContext2D & { imageSmoothingQuality?: 'low' | 'medium' | 'high' }).imageSmoothingQuality = 'high';
    fctx.fillStyle = '#ffffff';
    fctx.fillRect(0, 0, tw, th);
    fctx.drawImage(cur, 0, 0, tw, th);
    cur = finalC;
  }

  return cur;
}

function encodeBlob(canvas: HTMLCanvasElement, mime: string, q: number): Promise<Blob | null> {
  return new Promise(resolve => {
    canvas.toBlob(b => resolve(b), mime, q);
  });
}

let _webpCache: boolean | null = null;
function supportsWebP(): boolean {
  if (_webpCache !== null) return _webpCache;
  try {
    const c = document.createElement('canvas');
    c.width = 1; c.height = 1;
    _webpCache = c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    _webpCache = false;
  }
  return _webpCache;
}

// `createImageBitmap` is faster than HTMLImageElement (decodes off the
// main thread, no DOM attachment, better memory churn) and on Chrome it
// supports a single-step resize via `resizeWidth/Height/resizeQuality`.
// We feed an ImageBitmap into the Canvas just like an Image.
async function loadImage(file: File): Promise<CanvasImageSource & { width: number; height: number; src?: string }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      // Conform to the shape our compressor expects (it reads `width`/`height`
      // and may inspect `src` for the blob: URL revoke path).
      return Object.assign(bitmap, { src: '' }) as CanvasImageSource & {
        width: number; height: number; src?: string;
      };
    } catch {
      // fall through to <img> path
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image decode failed.')); };
    img.src = url;
  });
}

// ─── Public: stand-alone compression for pre-warming ─────────
//
// Modals call this on file pick so by the time the user submits, the
// compressed payload is already sitting in state — the perceived
// "Optimizing…" phase becomes a no-op.

export interface PrecompressResult {
  /** Compressed file ready to be uploaded. */
  file:     File;
  /** Original size in bytes. */
  bytesIn:  number;
  /** Compressed size in bytes. */
  bytesOut: number;
}

export async function precompressFile(kind: UploadKind, file: File): Promise<PrecompressResult> {
  const bytesIn = file.size;
  let out = file;
  try {
    out = await compressImage(file, pickProfile(kind));
  } catch (err) {
    console.warn('[precompressFile] compress failed, falling back to original', err);
  }
  return { file: out, bytesIn, bytesOut: out.size };
}

/** Compute downscaled (w,h) so the longest edge equals `maxEdge` (or smaller if already small). */
function fitTo(w: number, h: number, maxEdge: number): { w: number; h: number } {
  if (Math.max(w, h) <= maxEdge) return { w, h };
  const ratio = w >= h ? maxEdge / w : maxEdge / h;
  return {
    w: Math.round(w * ratio),
    h: Math.round(h * ratio),
  };
}

// ─── Retry-with-backoff upload ───────────────────────────────

async function uploadWithRetry(
  path: string,
  payload: File | Blob,
  attempts = 3,
): Promise<{ ok: boolean; error?: string }> {
  let lastErr: string | undefined;
  for (let i = 0; i < attempts; i++) {
    const { error } = await supabase.storage.from(BUCKET).upload(path, payload, {
      contentType: (payload as File).type || 'image/jpeg',
      upsert: false,
    });
    if (!error) return { ok: true };

    lastErr = error.message;
    // Don't retry on duplicate-key — that's deterministic.
    if (/duplicate|already exists/i.test(error.message)) break;

    // Backoff: 500ms, 1.5s, 3.5s
    if (i < attempts - 1) {
      const delay = 500 + i * 1500 + Math.random() * 250;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return { ok: false, error: lastErr ?? 'Upload failed.' };
}

// ─── Tiny helpers ────────────────────────────────────────────

function kb(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}
