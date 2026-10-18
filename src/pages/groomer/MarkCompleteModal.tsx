/**
 * MarkCompleteModal.tsx — Step 2 (Mark Completed) for the groomer.
 *
 * Two paths to complete:
 *   1. Customer reads out the 4-digit code (sent to them on WhatsApp by
 *      the coordinator).  Groomer enters it; client-side string match
 *      against `session.completion_code`.  Mismatch → shake + red error.
 *   2. Customer doesn't have the code on hand → switch to the Photo tab,
 *      take a photo of the groomed pet as fallback proof.
 *
 * Either path calls `markCompleted()` with the chosen method.  The code
 * is NEVER displayed in the UI — the groomer must hear it from the
 * customer.  (It is technically present in the session JSON; we trust
 * the small business / non-tech-savvy groomer profile here.  RLS-based
 * column hiding can be added later if the trust model changes.)
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Loader2, KeyRound, AlertTriangle } from 'lucide-react';
import type { GroomingSession } from '../admin/types';
import { uploadGroomerImage, precompressFile, type UploadPhase } from './uploadHelper';
import { markCompleted } from './sessionMilestonesApi';

interface Props {
  session:     GroomingSession;
  onClose:     () => void;
  onSubmitted: () => void;
}

export default function MarkCompleteModal({ session, onClose, onSubmitted }: Props) {
  // Inject the same shake keyframe the review modal uses (idempotent).
  useEffect(() => { injectShakeKeyframe(); }, []);

  const [tab, setTab] = useState<'code' | 'photo'>('code');

  // ─── Code path ─────────────────────────────────────────────
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const codeBoxRef = useRef<HTMLDivElement | null>(null);

  // ─── Photo path ────────────────────────────────────────────
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressed, setCompressed] = useState<{ file: File; bytesIn: number; bytesOut: number } | null>(null);
  const [precompressing, setPrecompressing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoBoxRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ─── Common ────────────────────────────────────────────────
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<UploadPhase | 'saving' | null>(null);

  // Online check — same defensive pattern as the other modals.
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // ─── Code handlers ─────────────────────────────────────────
  function onCodeChange(raw: string) {
    // Only digits, max 4
    const cleaned = raw.replace(/\D/g, '').slice(0, 4);
    setCode(cleaned);
    if (codeError) setCodeError(null);
  }

  async function submitCode() {
    if (busy) return;
    if (code.length !== 4) {
      setCodeError('Enter the 4-digit code from the customer.');
      shakeNode(codeBoxRef.current);
      return;
    }
    if (code !== (session.completion_code ?? '')) {
      setCodeError('That code doesn\'t match. Ask the customer again.');
      shakeNode(codeBoxRef.current);
      return;
    }
    if (!online) {
      setCodeError('You appear to be offline. Reconnect and try again.');
      return;
    }

    setBusy(true);
    setPhase('saving');
    const res = await markCompleted(session.id, session, { method: 'code' });
    setBusy(false);
    setPhase(null);
    if (!res.ok) { setCodeError(res.error ?? 'Could not mark complete.'); return; }
    onSubmitted();
  }

  // ─── Photo handlers ────────────────────────────────────────
  function pickFile(f: File | null) {
    setPhotoError(null);
    setCompressed(null);
    if (!f) { setFile(null); setPreview(null); return; }
    if (!f.type.startsWith('image/')) { setPhotoError('Please pick an image (jpg/png).'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPrecompressing(true);
    precompressFile('completions', f).then(res => {
      setCompressed(res);
      setPrecompressing(false);
    }).catch(() => setPrecompressing(false));
  }

  async function submitPhoto() {
    if (busy) return;
    if (!file) {
      setPhotoError('Attach a photo of the groomed pet.');
      shakeNode(photoBoxRef.current);
      return;
    }
    if (!online) {
      setPhotoError('You appear to be offline. Reconnect and try again.');
      return;
    }

    setBusy(true);
    setPhotoError(null);

    const payload = compressed?.file ?? file;
    const up = await uploadGroomerImage('completions', session.id, payload, { onPhase: setPhase });
    if (!up.ok || !up.publicUrl) {
      setBusy(false); setPhase(null);
      setPhotoError(up.error ?? 'Upload failed.');
      return;
    }

    setPhase('saving');
    const res = await markCompleted(session.id, session, {
      method:   'photo',
      photoUrl: up.publicUrl,
    });
    setBusy(false); setPhase(null);
    if (!res.ok) { setPhotoError(res.error ?? 'Could not mark complete.'); return; }
    onSubmitted();
  }

  const busyLabel =
    phase === 'compressing' ? 'Optimizing image…' :
    phase === 'uploading'   ? 'Uploading…' :
    phase === 'saving'      ? 'Saving…' : 'Submitting…';

  return (
    <>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
        onClick={busy ? undefined : onClose}
      />
      <motion.div
        initial={{ opacity:0, y: 24, scale: 0.97 }}
        animate={{ opacity:1, y: 0, scale: 1 }}
        exit={{ opacity:0, y: 24, scale: 0.97 }}
        className="fixed z-[70] inset-0 grid place-items-center p-4"
      >
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          {/* Hero */}
          <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-purple-50 to-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-sniffy-purple">
                  Step 2 · Complete
                </p>
                <h3 className="text-xl font-extrabold text-gray-900 leading-tight mt-0.5">
                  Mark Completed
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Ask the customer for the 4-digit code, or upload a photo as proof.
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white">
                <X size={18} className="text-gray-400"/>
              </button>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="px-6 pt-3">
            <div className="inline-flex p-0.5 rounded-xl bg-gray-100 w-full">
              {(['code','photo'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  disabled={busy}
                  className={`flex-1 px-3 py-2 rounded-lg text-[12px] font-extrabold transition ${
                    tab === t ? 'bg-white text-sniffy-purple shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {t === 'code' ? 'Enter Code' : 'Use Photo'}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 space-y-4 overflow-y-auto">

            {tab === 'code' && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-[11px] text-gray-600 leading-snug">
                  <KeyRound size={13} className="text-sniffy-purple shrink-0 mt-0.5"/>
                  <span>
                    The coordinator sent the customer a 4-digit completion code on WhatsApp.
                    Ask them to read it out.
                  </span>
                </div>

                <div ref={codeBoxRef} className="flex justify-center">
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{4}"
                    maxLength={4}
                    value={code}
                    onChange={e => onCodeChange(e.target.value)}
                    placeholder="••••"
                    className={`w-full max-w-[180px] text-center text-[28px] font-extrabold tracking-[0.5em] py-3 rounded-2xl border-2 outline-none transition ${
                      codeError
                        ? 'border-red-300 bg-red-50/40 text-red-700'
                        : 'border-purple-200 bg-purple-50/30 text-gray-900 focus:border-sniffy-purple focus:bg-white'
                    }`}
                  />
                </div>

                {codeError && (
                  <p className="text-center text-[11px] text-red-600 font-bold flex items-center justify-center gap-1">
                    <AlertTriangle size={11}/> {codeError}
                  </p>
                )}

                <button
                  onClick={() => setTab('photo')}
                  disabled={busy}
                  className="block mx-auto text-[11px] font-bold text-sniffy-purple underline disabled:opacity-50"
                >
                  Customer doesn't have the code? Use photo →
                </button>
              </div>
            )}

            {tab === 'photo' && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-[11px] text-gray-600 leading-snug">
                  <Camera size={13} className="text-sniffy-purple shrink-0 mt-0.5"/>
                  <span>
                    Take a photo of the groomed pet as proof of completion.
                    Coordinator can verify with the customer later.
                  </span>
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={e => pickFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
                <button
                  ref={photoBoxRef}
                  onClick={() => inputRef.current?.click()}
                  disabled={busy}
                  className={`w-full border-2 border-dashed rounded-xl py-6 grid place-items-center transition ${
                    photoError
                      ? 'border-red-300 bg-red-50/40 text-red-600'
                      : 'border-purple-200 text-sniffy-purple hover:border-purple-400 hover:bg-purple-50/50'
                  }`}
                >
                  {preview ? (
                    <img src={preview} alt="Completion preview" className="max-h-44 rounded-lg"/>
                  ) : (
                    <>
                      <Camera size={28}/>
                      <p className="text-[11px] font-bold mt-1">Tap to take a photo</p>
                    </>
                  )}
                </button>

                {compressed && (
                  <div className="rounded-xl px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-700 text-center">
                    Optimized: <b>{kb(compressed.bytesIn)}</b> → <b>{kb(compressed.bytesOut)}</b>
                  </div>
                )}
                {precompressing && !compressed && (
                  <div className="rounded-xl px-3 py-1.5 bg-purple-50 border border-purple-100 text-[10px] text-purple-700 text-center inline-flex items-center justify-center gap-1.5">
                    <Loader2 size={11} className="animate-spin"/> Optimizing in the background…
                  </div>
                )}

                {photoError && (
                  <p className="text-center text-[11px] text-red-600 font-bold flex items-center justify-center gap-1">
                    <AlertTriangle size={11}/> {photoError}
                  </p>
                )}
              </div>
            )}

            {!online && (
              <div className="rounded-xl px-3 py-2 bg-amber-50 border border-amber-100 text-[11px] text-amber-800 flex items-start gap-1.5">
                <AlertTriangle size={11} className="shrink-0 mt-0.5"/>
                You're offline. Reconnect before submitting.
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 p-4 flex gap-2 shrink-0">
            <button
              onClick={onClose}
              disabled={busy}
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={tab === 'code' ? submitCode : submitPhoto}
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-extrabold text-white inline-flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)', boxShadow: '0 4px 14px rgba(69,26,139,0.30)' }}
            >
              {busy && <Loader2 size={14} className="animate-spin"/>}
              {busy
                ? busyLabel
                : tab === 'code' ? 'Verify & Complete' : 'Complete with Photo'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

function shakeNode(el: HTMLElement | null) {
  if (!el) return;
  el.classList.remove('claim-shake');
  void el.offsetWidth;
  el.classList.add('claim-shake');
}

function injectShakeKeyframe() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('claim-shake-kf')) return;
  const style = document.createElement('style');
  style.id = 'claim-shake-kf';
  style.textContent = `
    @keyframes claim-shake-x {
      0%, 100% { transform: translateX(0); }
      18% { transform: translateX(-9px); }
      36% { transform: translateX( 9px); }
      54% { transform: translateX(-6px); }
      72% { transform: translateX( 4px); }
      90% { transform: translateX(-2px); }
    }
    .claim-shake { animation: claim-shake-x 0.42s ease-in-out; }
  `;
  document.head.appendChild(style);
}

function kb(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
