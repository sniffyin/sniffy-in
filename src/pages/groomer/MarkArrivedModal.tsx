/**
 * MarkArrivedModal.tsx — File picker + selfie preview + on-time check.
 *
 * On-time logic happens at submit-time (server-evaluated by markArrived
 * via isWithinArrivalWindow).  Here we just preview the impact so the
 * groomer knows whether they'll be eligible for the ₹25 bonus.
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import type { GroomingSession } from '../admin/types';
import { uploadGroomerImage, precompressFile, type UploadPhase } from './uploadHelper';
import { markArrived } from './sessionMilestonesApi';
import {
  isWithinArrivalWindow,
  wasArrivedInWindow,
  EARLY_ARRIVAL_WINDOW_MINUTES,
  LATE_ARRIVAL_WINDOW_MINUTES,
  ON_TIME_BONUS,
} from './incentivesApi';

interface Props {
  session:     GroomingSession;
  onClose:     () => void;
  onSubmitted: () => void;
}

/** Pretty-print a byte count for the compression-stats pill. */
function kb(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function MarkArrivedModal({ session, onClose, onSubmitted }: Props) {
  // `file` holds the original picked image; `compressed` holds the
  // pre-compressed version produced in the background as soon as the
  // user picks the file.  On submit we prefer `compressed.file` —
  // by then the heavy work is already done and the upload starts
  // instantly.  This shaves 200–600ms of perceived wait time on phones.
  const [file,        setFile]       = useState<File | null>(null);
  const [compressed,  setCompressed] = useState<{ file: File; bytesIn: number; bytesOut: number } | null>(null);
  const [precompressing, setPrecompressing] = useState(false);
  const [preview,     setPreview]    = useState<string | null>(null);
  const [busy,        setBusy]       = useState(false);
  const [phase,       setPhase]      = useState<UploadPhase | 'saving' | null>(null);
  const [error,       setError]      = useState<string | null>(null);
  const [online,      setOnline]     = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Track online/offline transitions so we can show a friendly warning
  // BEFORE the user wastes retries on a dead network.
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

  const willBeOnTime = isWithinArrivalWindow(session);

  function pickFile(f: File | null) {
    setError(null);
    setCompressed(null);
    if (!f) { setFile(null); setPreview(null); return; }
    if (!f.type.startsWith('image/')) { setError('Please pick an image (jpg/png).'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));

    // Kick off compression in the background.  By the time the user
    // taps Mark Arrived, this Promise has usually resolved and the
    // submit handler will skip straight to the upload phase.
    setPrecompressing(true);
    precompressFile('arrivals', f).then(res => {
      setCompressed(res);
      setPrecompressing(false);
    }).catch(() => {
      setPrecompressing(false);
    });
  }

  async function submit() {
    if (!file) { setError('Please attach a selfie.'); return; }
    if (!online) { setError('You appear to be offline. Reconnect and try again.'); return; }

    setBusy(true);
    setError(null);

    // Use the pre-compressed payload if it's ready; otherwise the upload
    // helper compresses on the fly.  Either way we get the same result.
    const payload = compressed?.file ?? file;
    const up = await uploadGroomerImage('arrivals', session.id, payload, { onPhase: setPhase });
    if (!up.ok || !up.publicUrl) {
      setBusy(false); setPhase(null);
      setError(up.error ?? 'Upload failed.');
      return;
    }
    setPhase('saving');
    const res = await markArrived({
      sessionId: session.id,
      selfieUrl: up.publicUrl,
      session,
    });
    setBusy(false); setPhase(null);
    if (!res.ok) { setError(res.error ?? 'Could not mark arrived.'); return; }
    onSubmitted();
  }

  const busyLabel =
    phase === 'compressing' ? 'Optimizing image…' :
    phase === 'uploading'   ? 'Uploading…' :
    phase === 'saving'      ? 'Saving…' : 'Submitting…';

  // If already marked, show the existing selfie + status.  Allows
  // re-upload only if the bonus was rejected.
  const alreadyMarked = !!session.arrival_marked_at;
  const allowReupload = session.arrival_bonus_status === 'rejected';

  return (
    <>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
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
                  Step 1 · Arrival
                </p>
                <h3 className="text-xl font-extrabold text-gray-900 leading-tight mt-0.5">
                  Mark Arrived
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Upload a selfie at the customer's place.
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white">
                <X size={18} className="text-gray-400"/>
              </button>
            </div>
          </div>

          <div className="px-6 py-4 space-y-4 overflow-y-auto">

            {/* Window indicator — derived from arrival_marked_at, not the
                canonical groomer_on_time toggle (which now means "earned
                the bonus" after coordinator approval). */}
            {alreadyMarked ? (() => {
              const arrivedInWindow = wasArrivedInWindow(session);
              return (
              <div
                className={`rounded-xl p-3 flex items-start gap-2 ${
                  arrivedInWindow ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'
                }`}
              >
                {arrivedInWindow
                  ? <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0"/>
                  : <AlertTriangle  size={14} className="text-amber-600  mt-0.5 shrink-0"/>}
                <p className={`text-[11px] ${arrivedInWindow ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {arrivedInWindow
                    ? `Marked within the on-time window — ₹${ON_TIME_BONUS} bonus eligible (pending coordinator approval).`
                    : `Marked outside the on-time window — no bonus, but the arrival is recorded.`}
                </p>
              </div>
              );
            })() : (
              <div
                className={`rounded-xl p-3 flex items-start gap-2 ${
                  willBeOnTime ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'
                }`}
              >
                {willBeOnTime
                  ? <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0"/>
                  : <AlertTriangle  size={14} className="text-amber-600  mt-0.5 shrink-0"/>}
                <p className={`text-[11px] ${willBeOnTime ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {willBeOnTime
                    ? `You're within the on-time window — submitting now will claim the ₹${ON_TIME_BONUS} bonus (pending coordinator approval).`
                    : `You're outside the on-time window (${EARLY_ARRIVAL_WINDOW_MINUTES} min early to ${LATE_ARRIVAL_WINDOW_MINUTES} min late). You can still mark arrived, but no bonus.`}
                </p>
              </div>
            )}

            {/* Existing selfie preview */}
            {alreadyMarked && session.arrival_selfie_url && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Previous selfie</p>
                <img
                  src={session.arrival_selfie_url}
                  alt="Arrival selfie"
                  className="w-full max-h-56 object-cover rounded-xl border border-gray-100"
                />
              </div>
            )}

            {/* File picker — only if not already marked, OR if re-upload allowed */}
            {(!alreadyMarked || allowReupload) && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Selfie {alreadyMarked ? '(re-upload)' : ''}
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={e => pickFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
                <button
                  onClick={() => inputRef.current?.click()}
                  className="w-full border-2 border-dashed border-purple-200 rounded-xl py-6 grid place-items-center text-sniffy-purple hover:border-purple-400 hover:bg-purple-50/50 transition"
                >
                  {preview ? (
                    <img src={preview} alt="Selfie preview" className="max-h-44 rounded-lg"/>
                  ) : (
                    <>
                      <Camera size={28}/>
                      <p className="text-[11px] font-bold mt-1">Tap to take / pick a selfie</p>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Compression stats — appears once pre-compression finishes,
                so the groomer can see the data savings before they upload.
                Subtle; doesn't block submit if it hasn't finished yet. */}
            {compressed && (
              <div className="rounded-xl px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 size={11}/>
                <span>
                  Optimized: <b>{kb(compressed.bytesIn)}</b> → <b>{kb(compressed.bytesOut)}</b>
                  {' '}({Math.max(0, Math.round((1 - compressed.bytesOut / Math.max(compressed.bytesIn, 1)) * 100))}% smaller)
                </span>
              </div>
            )}
            {precompressing && !compressed && (
              <div className="rounded-xl px-3 py-1.5 bg-purple-50 border border-purple-100 text-[10px] text-purple-700 flex items-center gap-1.5">
                <Loader2 size={11} className="animate-spin"/>
                Optimizing in the background…
              </div>
            )}
            {!online && (
              <div className="rounded-xl px-3 py-2 bg-amber-50 border border-amber-100 text-[11px] text-amber-800 flex items-start gap-1.5">
                <AlertTriangle size={11} className="shrink-0 mt-0.5"/>
                You're offline. Reconnect before submitting — your photo will be lost otherwise.
              </div>
            )}
            {error && (
              <div className="rounded-xl px-3 py-2 bg-red-50 border border-red-100 text-[11px] text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 p-4 flex gap-2 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition"
            >
              Close
            </button>
            {(!alreadyMarked || allowReupload) && (
              <button
                onClick={submit}
                disabled={busy || !file}
                className="flex-1 px-4 py-3 rounded-2xl text-sm font-extrabold text-white disabled:opacity-50 inline-flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)', boxShadow: '0 4px 14px rgba(69,26,139,0.30)' }}
              >
                {busy && <Loader2 size={14} className="animate-spin"/>}
                {busy ? busyLabel : alreadyMarked ? 'Re-submit' : 'Mark Arrived'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
