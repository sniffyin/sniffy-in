/**
 * Shared building blocks for the groomer / helper onboarding forms:
 * upload helpers (compress + retry), form inputs, UploadZone, SignatureField, StepIndicator.
 */

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Eraser } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── Upload helpers (compress → retry → limited concurrency) ─────────────────

export const ALL_PUNE = 'All of Pune';

export const PUNE_AREAS = [
  'Baner', 'Aundh', 'Wakad', 'Hinjewadi', 'Kothrud', 'Karve Nagar',
  'Shivajinagar', 'Viman Nagar', 'Kalyani Nagar', 'Koregaon Park',
  'Kharadi', 'Wagholi', 'Hadapsar', 'Kondhwa', 'NIBM', 'Katraj',
  'Dhayari', 'Bavdhan', 'Pimpri-Chinchwad', 'Ravet', 'Kalewadi',
  'Lohegaon', 'Dhanori', 'Camp', 'Wanowrie', 'Mundwa', 'Bibewadi',
];

export const MAX_IMAGE_MB = 20;  // raw size we accept from a phone camera; compressed before upload
export const MAX_PDF_MB   = 10;
export const MAX_DIMENSION = 1800;
export const UPLOAD_TIMEOUT_MS = 90_000;
export const UPLOAD_ATTEMPTS = 3;
export const UPLOAD_CONCURRENCY = 3;

/** Returns an error message if the file is too large, else ''. */
export function checkFileSize(file: File): string {
  const mb = file.size / (1024 * 1024);
  const isPdf = file.type === 'application/pdf';
  const limit = isPdf ? MAX_PDF_MB : MAX_IMAGE_MB;
  return mb > limit ? `"${file.name}" is too large (max ${limit} MB). Please choose a smaller file.` : '';
}

/** Downscale + re-encode photos as JPEG. PDFs and anything that fails are returned untouched. */
export async function compressImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale  = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.fillStyle = '#fff'; // PNG transparency → white instead of black
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function uploadOnce(file: File, folder: string): Promise<string> {
  const ext  = file.name.split('.').pop() || 'bin';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const upload = supabase.storage.from('groomer-uploads').upload(path, file, { upsert: false });
  const timeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), UPLOAD_TIMEOUT_MS));
  const { error } = await Promise.race([upload, timeout]);
  if (error) throw error;
  return supabase.storage.from('groomer-uploads').getPublicUrl(path).data.publicUrl;
}

/** Compress, then upload with retries. Throws a user-readable error after the last attempt. */
export async function uploadWithRetry(src: File | string, folder: string, label: string): Promise<string> {
  const raw = typeof src === 'string'
    ? new File([await (await fetch(src)).blob()], 'signature.png', { type: 'image/png' })
    : src;
  const file = typeof src === 'string' ? raw : await compressImage(raw);
  for (let attempt = 1; attempt <= UPLOAD_ATTEMPTS; attempt++) {
    try {
      return await uploadOnce(file, folder);
    } catch (e) {
      console.error(`Upload error (${label}, attempt ${attempt})`, e);
      if (attempt < UPLOAD_ATTEMPTS) await sleep(1000 * attempt);
    }
  }
  throw new Error(`${label} failed to upload. Please check your internet connection and tap Submit again.`);
}

export interface UploadJob { src: File | string; folder: string; label: string }

// ─── Sub-components ───────────────────────────────────────────────────────────

export function SectionHeader({ emoji, title, desc }: { emoji: string; title: string; desc?: string }) {
  return (
    <div className="flex items-start gap-4 mb-4 sm:mb-8">
      {/* <div className="w-12 h-12 flex-shrink-0 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl">
        {emoji}
      </div> */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {desc && <p className="text-sm text-gray-500 mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

export function FieldGroup({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
      <label className="text-sm font-bold text-gray-800">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sniffy-purple focus:border-sniffy-purple outline-none transition-all text-gray-800 font-medium placeholder-gray-400 bg-white"
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  const { children, ...rest } = props;
  return (
    <select
      {...rest}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sniffy-purple focus:border-sniffy-purple outline-none transition-all text-gray-800 font-medium bg-white appearance-none cursor-pointer"
    >
      {children}
    </select>
  );
}

export function ChipToggle({ checked, onChange, emoji, label }: {
  checked: boolean; onChange: () => void; emoji: string; label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border-2 text-[13px] sm:text-sm font-semibold transition-all ${
        checked
          ? 'bg-purple-50 border-sniffy-purple text-sniffy-purple'
          : 'border-gray-200 text-gray-600 hover:border-gray-300'
      }`}
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </button>
  );
}

export function CardToggle({ checked, onChange, emoji, label, sub }: {
  checked: boolean; onChange: () => void; emoji: string; label: string; sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 text-center transition-all ${
        checked
          ? 'bg-purple-50 border-sniffy-purple'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <span className="text-3xl leading-none">{emoji}</span>
      <span className={`text-sm font-bold ${checked ? 'text-sniffy-purple' : 'text-gray-700'}`}>{label}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </button>
  );
}

export function RadioCard({ checked, onChange, emoji, label, sub }: {
  checked: boolean; onChange: () => void; emoji: string; label: string; sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center gap-4 p-3 sm:p-4 rounded-2xl border-2 text-left transition-all ${
        checked
          ? 'bg-purple-50 border-sniffy-purple'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* <span className="text-2xl flex-shrink-0">{emoji}</span> */}
      <div>
        <div className={`text-sm font-bold ${checked ? 'text-sniffy-purple' : 'text-gray-800'}`}>{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
      </div>
    </button>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-sniffy-purple' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}

export interface UploadZoneProps {
  label: string;
  hint: string;
  accept: string;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  emoji: string;
  onError?: (msg: string) => void;
}

export function UploadZone({ label, hint, accept, multiple, files, onChange, emoji, onError }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const all = Array.from(incoming);
    const arr = all.filter(f => !checkFileSize(f));
    const bad = all.find(f => checkFileSize(f));
    if (bad) onError?.(checkFileSize(bad));
    else onError?.('');
    if (arr.length === 0) return;
    onChange(multiple ? [...files, ...arr] : arr);
  };

  const removeFile = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-between gap-4 border-2 border-dashed border-gray-200 hover:border-sniffy-purple hover:bg-purple-50/40 rounded-2xl px-5 py-4 cursor-pointer transition-all"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <div className="font-bold text-sm text-gray-800">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{hint}</div>
          </div>
        </div>
        <div className="flex-shrink-0 inline-flex items-center gap-1.5 bg-sniffy-purple text-white text-xs font-bold px-4 py-2 rounded-full">
          <Upload size={12} /> Browse
        </div>
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-3 py-1.5">
              <span className="text-xs font-semibold text-sniffy-purple truncate max-w-[160px]">{f.name}</span>
              <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Signature (tap to open a full-screen pad, or upload a photo instead) ────

export const MIN_SIGNATURE_PX = 60; // total stroke length; stops a stray tap counting as a signature

export function SignatureModal({ onDone, onCancel }: { onDone: (dataUrl: string) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);
  const strokeLen = useRef(0);
  const last      = useRef({ x: 0, y: 0 });
  const [inked, setInked] = useState(false);
  const inkedRef  = useRef(false);
  const [tooShort, setTooShort] = useState(false);

  const setup = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const rect  = c.getBoundingClientRect();
    const prev  = inkedRef.current ? c.toDataURL() : null;
    c.width  = rect.width * ratio;
    c.height = rect.height * ratio;
    const ctx = c.getContext('2d')!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth   = 3.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.strokeStyle = '#1f2937';
    if (prev) { // keep the drawing when the phone is rotated
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = prev;
    }
  };

  useEffect(() => {
    setup();
    window.addEventListener('resize', setup);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', setup);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = e.currentTarget.getContext('2d')!;
    const p = pos(e);
    drawing.current = true;
    last.current = p;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    setTooShort(false);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext('2d')!;
    const p = pos(e);
    strokeLen.current += Math.hypot(p.x - last.current.x, p.y - last.current.y);
    last.current = p;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (strokeLen.current > 0) { inkedRef.current = true; setInked(true); }
  };

  const clear = () => {
    const c = canvasRef.current!;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    strokeLen.current = 0;
    inkedRef.current = false;
    setInked(false);
    setTooShort(false);
  };

  const done = () => {
    if (strokeLen.current < MIN_SIGNATURE_PX) { setTooShort(true); return; }
    onDone(canvasRef.current!.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button type="button" onClick={onCancel} className="text-sm font-bold text-gray-500 px-2 py-1">Cancel</button>
        <div className="text-sm font-bold text-gray-800">Sign below</div>
        <button type="button" onClick={done} className="text-sm font-bold bg-sniffy-purple text-white rounded-full px-5 py-2">Done</button>
      </div>

      <div className="relative flex-1 m-4 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        />
        {!inked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-sm text-gray-300 text-center px-6">
            Sign here with your finger<br />Tip: rotate your phone sideways for more space
          </div>
        )}
        <div className="absolute left-6 right-6 bottom-12 h-px bg-gray-200 pointer-events-none" />
      </div>

      <div className="px-4 pb-5 flex items-center justify-between">
        <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-red-500">
          <Eraser size={14} /> Clear
        </button>
        {tooShort && <span className="text-sm text-red-500 font-semibold">Please draw your full signature.</span>}
      </div>
    </div>
  );
}

export function SignatureField({
  dataUrl, file, onDataUrl, onFile, onError,
}: {
  dataUrl: string | null; file: File | null;
  onDataUrl: (v: string | null) => void; onFile: (f: File | null) => void;
  onError?: (msg: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setFilePreview(null); return; }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const preview = dataUrl ?? filePreview;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full h-32 border-2 border-dashed border-gray-200 hover:border-sniffy-purple hover:bg-purple-50/40 rounded-2xl flex items-center justify-center bg-white transition-all"
      >
        {preview
          ? <img src={preview} alt="Your signature" className="max-h-28 max-w-full object-contain" />
          : <span className="text-sm font-bold text-sniffy-purple">✍️ Tap to sign</span>}
      </button>

      <div className="flex items-center gap-4 text-xs font-bold">
        {preview && (
          <button type="button" onClick={() => setOpen(true)} className="text-sniffy-purple">Sign again</button>
        )}
        {preview && (
          <button
            type="button"
            onClick={() => { onDataUrl(null); onFile(null); }}
            className="inline-flex items-center gap-1 text-gray-500 hover:text-red-500"
          >
            <Eraser size={12} /> Clear
          </button>
        )}
        <button type="button" onClick={() => inputRef.current?.click()} className="text-gray-500 underline underline-offset-2">
          or upload a photo of your signature
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f && checkFileSize(f)) { onError?.(checkFileSize(f)); }
            else if (f) { onError?.(''); onFile(f); onDataUrl(null); }
            e.target.value = '';
          }}
        />
      </div>

      {open && (
        <SignatureModal
          onCancel={() => setOpen(false)}
          onDone={d => { onDataUrl(d); onFile(null); setOpen(false); }}
        />
      )}
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

export function StepIndicator({ current, steps = ['Personal Info', 'Services', 'Experience', 'Documents'] }: { current: number; steps?: string[] }) {
  return (
    <div className="flex items-center justify-center gap-0 overflow-x-auto px-4 py-4">
      {steps.map((label, i) => {
        const idx    = i + 1;
        const done   = idx < current;
        const active = idx === current;
        return (
          <div key={label} className="flex items-center flex-shrink-0">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              active ? 'bg-sniffy-purple text-white' : done ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                active ? 'bg-white text-sniffy-purple' :
                done   ? 'bg-green-500 text-white' :
                        'border-2 border-gray-300 text-gray-400'
              }`}>
                {done ? '✓' : idx}
              </div>
              <span className={`text-xs font-bold hidden sm:block ${active ? 'text-white' : done ? 'text-green-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 h-px mx-1 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
