/**
 * CollectReviewModal.tsx — QR + link for the Google review, then capture
 * the groomer's claim: rating (1–5 stars) + screenshot proof.
 *
 * QR is generated CLIENT-SIDE with the `qrcode` library — no network
 * round-trip, no flaky third-party API.  Renders to a data URL once on
 * mount, then displayed via <img>.  Typical generate time: ~30 ms.
 *
 * The review URL is fixed; if it ever changes, edit REVIEW_URL below.
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import {
  X, Star, Camera, Loader2, ExternalLink, Copy, Check, AlertTriangle,
} from 'lucide-react';
import type { GroomingSession } from '../admin/types';
import { uploadGroomerImage, precompressFile, type UploadPhase } from './uploadHelper';
import { claimReview } from './sessionMilestonesApi';
import { REVIEW_BONUS } from './incentivesApi';
import { GOOGLE_REVIEW_URL } from '../../data/siteLinks';

const REVIEW_URL = GOOGLE_REVIEW_URL;

// Module-level cache — first modal open generates the data URL; every
// subsequent open within the page session reuses it instantly.
let _qrDataUrl: string | null = null;

// Inject the shake keyframe once.  Idempotent.
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

/** Pretty-print byte counts for the compression-stats pill. */
function kb(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

interface Props {
  session:     GroomingSession;
  onClose:     () => void;
  onSubmitted: () => void;
}

export default function CollectReviewModal({ session, onClose, onSubmitted }: Props) {
  const [step, setStep] = useState<'qr' | 'claim'>('qr');

  // QR — generated locally on mount.  If a previous open already cached
  // the data URL at module level, hydrate from there for instant display.
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(_qrDataUrl);
  useEffect(() => {
    if (_qrDataUrl) return;
    let cancelled = false;
    QRCode.toDataURL(REVIEW_URL, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 480,            // crisp at 2× density
      color: { dark: '#0f172a', light: '#ffffff' },
    }).then(url => {
      if (cancelled) return;
      _qrDataUrl = url;
      setQrDataUrl(url);
    }).catch(err => console.warn('[CollectReviewModal] QR generation failed', err));
    return () => { cancelled = true; };
  }, []);

  // Default to 0 — groomer MUST pick a rating before submitting.
  // Resumes any prior claim if the modal is reopened.
  const [rating, setRating] = useState<number>(session.review_claim_rating ?? 0);

  // Tracks whether the groomer has attempted to submit at least once.
  // Once true, missing fields show a red message so the user knows
  // exactly what's blocking them.  Together with the shake animation
  // (see below) this answers "why isn't this button working?".
  const [attempted, setAttempted] = useState(false);

  // Inject the shake keyframe once on mount.
  useEffect(() => { injectShakeKeyframe(); }, []);

  // Refs so we can flick the shake class onto the right field on demand.
  const ratingRef = useRef<HTMLDivElement | null>(null);
  const fileRef   = useRef<HTMLButtonElement | null>(null);

  function shakeNode(el: HTMLElement | null) {
    if (!el) return;
    el.classList.remove('claim-shake');
    // Force reflow so re-adding the class restarts the animation
    // even on consecutive clicks.
    void el.offsetWidth;
    el.classList.add('claim-shake');
  }
  const [file,   setFile]   = useState<File | null>(null);
  // Pre-compression result kept alongside the original file so submit
  // can use the compressed payload directly — see MarkArrivedModal for
  // the full rationale.
  const [compressed, setCompressed] = useState<{ file: File; bytesIn: number; bytesOut: number } | null>(null);
  const [precompressing, setPrecompressing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<UploadPhase | 'saving' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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

  const inputRef = useRef<HTMLInputElement | null>(null);

  function pickFile(f: File | null) {
    setError(null);
    setCompressed(null);
    if (!f) { setFile(null); setPreview(null); return; }
    if (!f.type.startsWith('image/')) { setError('Please pick an image (jpg/png).'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPrecompressing(true);
    precompressFile('reviews', f).then(res => {
      setCompressed(res);
      setPrecompressing(false);
    }).catch(() => setPrecompressing(false));
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(REVIEW_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: just open the link
      window.open(REVIEW_URL, '_blank');
    }
  }

  async function submit() {
    if (!file) { setError('Please attach a photo of the review.'); return; }
    if (rating < 1 || rating > 5) { setError('Pick a star rating.'); return; }
    if (!online) { setError('You appear to be offline. Reconnect and try again.'); return; }
    setBusy(true);
    setError(null);
    const payload = compressed?.file ?? file;
    const up = await uploadGroomerImage('reviews', session.id, payload, { onPhase: setPhase });
    if (!up.ok || !up.publicUrl) {
      setBusy(false); setPhase(null);
      setError(up.error ?? 'Upload failed.'); return;
    }
    setPhase('saving');
    const res = await claimReview({
      sessionId: session.id,
      proofUrl:  up.publicUrl,
      rating,
    });
    setBusy(false); setPhase(null);
    if (!res.ok) { setError(res.error ?? 'Could not save claim.'); return; }
    onSubmitted();
  }

  const busyLabel =
    phase === 'compressing' ? 'Optimizing image…' :
    phase === 'uploading'   ? 'Uploading…' :
    phase === 'saving'      ? 'Saving…' : 'Submitting…';

  const isApproved = session.review_claim_status === 'approved' || session.review_taken;
  const allowReupload = session.review_claim_status === 'rejected' || session.review_claim_status === 'none';

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
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
          {/* Hero */}
          <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-purple-50 to-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-sniffy-purple">
                  Step 4 · Review
                </p>
                <h3 className="text-xl font-extrabold text-gray-900 leading-tight mt-0.5">
                  Collect Review
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Optional. Only 5★ qualifies for the ₹{REVIEW_BONUS} bonus.
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white">
                <X size={18} className="text-gray-400"/>
              </button>
            </div>
          </div>

          {/* Tab toggle */}
          {!isApproved && allowReupload && (
            <div className="px-6 pt-3">
              <div className="inline-flex p-0.5 rounded-xl bg-gray-100 w-full">
                {(['qr','claim'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStep(s)}
                    className={`flex-1 px-3 py-2 rounded-lg text-[12px] font-extrabold transition ${
                      step === s ? 'bg-white text-sniffy-purple shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    {s === 'qr' ? '1. Show QR' : '2. Confirm'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 py-4 space-y-4 overflow-y-auto">

            {/* Already approved / canonical confirmed */}
            {isApproved && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                <p className="text-sm font-extrabold text-emerald-800">
                  Review confirmed{session.client_rating ? ` · ${session.client_rating}★` : ''}
                </p>
                {session.client_rating === 5 && (
                  <p className="text-[11px] text-emerald-700 mt-1">₹{REVIEW_BONUS} review bonus is payable for this session.</p>
                )}
                {session.review_proof_url && (
                  <img src={session.review_proof_url} alt="Review proof" className="mt-2 w-full max-h-56 object-cover rounded-xl"/>
                )}
              </div>
            )}

            {!isApproved && step === 'qr' && (
              <div className="text-center space-y-3">
                <p className="text-[12px] text-gray-600">
                  Show this QR to the customer or share the link.
                </p>
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Google review QR"
                    className="mx-auto w-56 h-56 object-contain bg-white rounded-2xl border border-gray-100"
                  />
                ) : (
                  <div className="mx-auto w-56 h-56 grid place-items-center bg-gray-50 rounded-2xl border border-gray-100">
                    <Loader2 size={24} className="animate-spin text-sniffy-purple"/>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={copyLink}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold text-sniffy-purple bg-purple-50 hover:bg-purple-100"
                  >
                    {copied ? <Check size={13}/> : <Copy size={13}/>}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <a
                    href={REVIEW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold text-white"
                    style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)' }}
                  >
                    <ExternalLink size={13}/> Open Link
                  </a>
                </div>
                <button
                  onClick={() => setStep('claim')}
                  className="text-[12px] font-bold text-sniffy-purple underline mt-2"
                >
                  Customer reviewed → Confirm now
                </button>
              </div>
            )}

            {!isApproved && step === 'claim' && (
              <div className="space-y-4">
                {/* Star picker */}
                <div
                  ref={ratingRef}
                  className={`rounded-xl transition ${
                    attempted && rating < 1 ? 'ring-2 ring-red-300 bg-red-50/40 p-2 -m-2' : ''
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Rating given by customer
                  </p>
                  <div className="flex items-center justify-center gap-1.5">
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className="p-1.5 rounded-full hover:bg-amber-50 transition"
                      >
                        <Star
                          size={28}
                          className={n <= rating ? 'text-amber-400' : 'text-gray-300'}
                          fill={n <= rating ? '#fbbf24' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                  {/* Default helper OR red required-message once submit was attempted */}
                  {attempted && rating < 1 ? (
                    <p className="text-[10px] text-center mt-1.5 text-red-600 font-bold">
                      Please pick a star rating to continue.
                    </p>
                  ) : (
                    <p className="text-[10px] text-center mt-1.5 text-gray-500">
                      {rating === 0
                        ? 'Tap to pick the rating the customer gave.'
                        : rating === 5
                          ? `5★ → ₹${REVIEW_BONUS} bonus eligible (pending coordinator approval).`
                          : `${rating}★ doesn\'t qualify for the review bonus, but you can still log it.`}
                    </p>
                  )}
                </div>

                {/* Photo of the review.
                    `capture="environment"` makes the back camera launch
                    directly on mobile — no Photos / gallery option,
                    which matches the policy of "groomer takes a fresh
                    photo of the review on the customer's screen, not
                    a screenshot from their own gallery".  Desktop
                    browsers ignore the `capture` attribute and fall
                    back to the normal file picker, which is what we
                    want for testing. */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Photo of the review
                  </p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={e => pickFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                  <button
                    ref={fileRef}
                    onClick={() => inputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl py-6 grid place-items-center transition ${
                      attempted && !file && !session.review_proof_url
                        ? 'border-red-300 bg-red-50/40 text-red-600'
                        : 'border-purple-200 text-sniffy-purple hover:border-purple-400 hover:bg-purple-50/50'
                    }`}
                  >
                    {preview ? (
                      <img src={preview} alt="Review proof preview" className="max-h-44 rounded-lg"/>
                    ) : session.review_proof_url ? (
                      <img src={session.review_proof_url} alt="Existing review proof" className="max-h-44 rounded-lg"/>
                    ) : (
                      <>
                        <Camera size={28}/>
                        <p className="text-[11px] font-bold mt-1">Tap to take a photo</p>
                      </>
                    )}
                  </button>
                  {attempted && !file && !session.review_proof_url && (
                    <p className="text-[10px] text-center mt-1.5 text-red-600 font-bold">
                      Please attach a photo of the review.
                    </p>
                  )}
                </div>

                {session.review_claim_status === 'rejected' && session.review_claim_rejected_note && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-[11px] text-red-700 flex items-start gap-2">
                    <AlertTriangle size={11} className="shrink-0 mt-0.5"/>
                    <span><b>Coordinator rejected:</b> {session.review_claim_rejected_note}</span>
                  </div>
                )}
              </div>
            )}

            {compressed && (
              <div className="rounded-xl px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-700 flex items-center gap-1.5">
                <Check size={11}/>
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
                You're offline. Reconnect before submitting — your claim will be lost otherwise.
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
            {!isApproved && step === 'claim' && allowReupload && (() => {
              const invalidRating = rating < 1;
              const invalidFile   = !file && !session.review_proof_url;
              const isInvalid     = invalidRating || invalidFile;

              // Note: button is NOT actually disabled — it's only styled
              // to look so when invalid.  Click still registers and
              // shakes the missing field(s) so even non-tech-savvy
              // groomers see why the action didn't go through.
              const handleClick = () => {
                if (busy) return;
                if (invalidRating) shakeNode(ratingRef.current);
                if (invalidFile)   shakeNode(fileRef.current);
                if (isInvalid) {
                  setAttempted(true);
                  return;
                }
                submit();
              };

              return (
                <button
                  onClick={handleClick}
                  className={`flex-1 px-4 py-3 rounded-2xl text-sm font-extrabold text-white inline-flex items-center justify-center gap-2 ${
                    isInvalid && !busy ? 'opacity-50' : ''
                  }`}
                  style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)', boxShadow: '0 4px 14px rgba(69,26,139,0.30)' }}
                >
                  {busy && <Loader2 size={14} className="animate-spin"/>}
                  {busy ? busyLabel : 'Submit Claim'}
                </button>
              );
            })()}
          </div>
        </div>
      </motion.div>
    </>
  );
}
