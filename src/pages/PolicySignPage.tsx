/**
 * PolicySignPage — public, unlinked "/policy-sign/:token" page.
 *
 * Reached only via a link an admin generates from the Policies tab
 * (admin/PoliciesTab.tsx) — it's not in any nav, App.tsx's HIDE_FLOATING_ON
 * suppresses the floating book/WhatsApp button here, and it carries its own
 * noindex meta tag + a robots.txt Disallow rule so it never surfaces in
 * search results.
 *
 * Flow: fetch the policy_acknowledgments row by token →
 *   - not found            → "invalid link" state
 *   - already signed       → read-only "you signed this on <date>" + PDF download
 *   - pending              → read the role's policy content, then a full-page
 *                             signature step, then build+upload a PDF and flip
 *                             the row to 'signed' (one-time; a second open of
 *                             the same link lands back on the signed view).
 */

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle, Download, Eraser, PenLine } from 'lucide-react';
import {
  type PolicyAcknowledgment, type RolePolicySection,
  POLICY_ROLE_LABEL,
  fetchAcknowledgmentByToken, markAcknowledgmentSigned,
  uploadSignedPolicyPdf, getSignedPolicyPdfUrl, errMsg,
} from './admin/policyTypes';
import { buildPolicyAckPdfBlob } from './admin/policyAckPdf';
import { buildOfferLetterPdfBlob, loadOfferLetterAssets } from './admin/offerLetterPdf';
import { fmtLetterDate, parseBold } from './admin/offerLetterTemplate';

type Stage = 'loading' | 'not-found' | 'already-signed' | 'reading' | 'signing' | 'submitting' | 'success' | 'submit-error';

/** Keeps this page out of search results regardless of the canonical trick
 *  every other SPA route relies on (see lib/useSeo.ts) — belt and suspenders
 *  for a page that must never be indexed.
 *
 *  index.html already ships a static <meta name="robots" content="index,
 *  follow">, so appending a second tag would leave two conflicting
 *  directives in the DOM (browsers/crawlers don't reliably prefer either).
 *  Override the existing one in place and restore it on unmount instead. */
function useNoIndex() {
  useEffect(() => {
    let el = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !el;
    if (!el) {
      el = document.createElement('meta');
      el.name = 'robots';
      document.head.appendChild(el);
    }
    const previous = el.getAttribute('content');
    el.setAttribute('content', 'noindex, nofollow');

    const prevTitle = document.title;
    document.title = 'Sniffy';

    return () => {
      if (created) el?.remove();
      else if (previous !== null) el?.setAttribute('content', previous);
      document.title = prevTitle;
    };
  }, []);
}

export default function PolicySignPage() {
  const { token } = useParams<{ token: string }>();
  useNoIndex();

  const [stage, setStage] = useState<Stage>('loading');
  const [ack, setAck] = useState<PolicyAcknowledgment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) { setStage('not-found'); return; }
      try {
        const row = await fetchAcknowledgmentByToken(token);
        if (cancelled) return;
        if (!row) { setStage('not-found'); return; }
        setAck(row);
        if (row.status === 'signed') {
          if (row.pdf_path) setPdfUrl(getSignedPolicyPdfUrl(row.pdf_path));
          setStage('already-signed');
        } else {
          setStage('reading');
        }
      } catch (err) {
        if (!cancelled) { setError(errMsg(err)); setStage('not-found'); }
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  async function handleSigned(signatureDataUrl: string) {
    if (!ack || !token) return;
    setStage('submitting');
    try {
      const signedAt = new Date().toISOString();
      const blob = ack.kind === 'offer_letter'
        ? await buildOfferLetterPdfBlob({ ack, assets: await loadOfferLetterAssets(), signatureDataUrl, signedAt })
        : await buildPolicyAckPdfBlob({ ack, intro: null, signatureDataUrl, signedAt });
      const path = await uploadSignedPolicyPdf(token, blob);
      await markAcknowledgmentSigned(token, path);
      setPdfUrl(getSignedPolicyPdfUrl(path));
      setStage('success');
    } catch (err) {
      setError(errMsg(err));
      setStage('submit-error');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-white">
      <div className="max-w-2xl mx-auto px-5 py-10 sm:py-14">
        <div className="flex flex-col items-center gap-1 mb-8">
          <img src="/sniffy-logo.png" alt="Sniffy" className="h-12 w-auto object-contain"/>
        </div>

        {stage === 'loading' && (
          <div className="flex items-center justify-center gap-2 text-gray-400 py-24">
            <Loader2 size={18} className="animate-spin"/> Loading…
          </div>
        )}

        {stage === 'not-found' && (
          <div className="bg-white rounded-[20px] border-2 border-red-100 p-8 text-center space-y-2">
            <AlertCircle size={28} className="mx-auto text-red-400"/>
            <p className="font-bold text-gray-800">This link isn't valid</p>
            <p className="text-sm text-gray-500">{error ?? 'Double-check the link, or ask for a new one.'}</p>
          </div>
        )}

        {stage === 'already-signed' && ack && (
          <div className="bg-white rounded-[20px] border-2 border-sniffy-yellow/20 p-8 text-center space-y-3">
            <CheckCircle2 size={32} className="mx-auto text-green-500"/>
            <p className="font-bold text-gray-900 text-lg">Already signed</p>
            <p className="text-sm text-gray-500">
              {ack.signer_name} signed the {ack.kind === 'offer_letter' ? 'offer letter' : `${POLICY_ROLE_LABEL[ack.role]} acknowledgment`}
              {ack.signed_at ? ` on ${new Date(ack.signed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}.
            </p>
            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-full bg-sniffy-purple text-white text-sm font-semibold">
                <Download size={15}/> Download your PDF
              </a>
            )}
          </div>
        )}

        {stage === 'reading' && ack && (ack.kind === 'offer_letter'
          ? <OfferLetterReadingView ack={ack} onProceed={() => setStage('signing')} />
          : <ReadingView ack={ack} onProceed={() => setStage('signing')} />
        )}

        {(stage === 'signing' || stage === 'submitting') && ack && (
          <SigningView ack={ack} submitting={stage === 'submitting'}
            onBack={() => setStage('reading')} onSigned={handleSigned}/>
        )}

        {stage === 'submit-error' && (
          <div className="bg-white rounded-[20px] border-2 border-red-100 p-8 text-center space-y-3">
            <AlertCircle size={28} className="mx-auto text-red-400"/>
            <p className="font-bold text-gray-800">Something went wrong saving your signature</p>
            <p className="text-sm text-gray-500">{error}</p>
            <button onClick={() => setStage('signing')}
              className="px-5 py-2.5 rounded-full bg-sniffy-purple text-white text-sm font-semibold">
              Try again
            </button>
          </div>
        )}

        {stage === 'success' && ack && (
          <div className="bg-white rounded-[20px] border-2 border-sniffy-yellow/20 p-8 text-center space-y-3">
            <CheckCircle2 size={32} className="mx-auto text-green-500"/>
            <p className="font-bold text-gray-900 text-lg">Thanks, {ack.signer_name}!</p>
            <p className="text-sm text-gray-500">
              {ack.kind === 'offer_letter' ? 'Your signed offer letter has been recorded.' : 'Your acknowledgment has been recorded.'}
            </p>
            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-full bg-sniffy-purple text-white text-sm font-semibold">
                <Download size={15}/> Download your PDF
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Reading view ───────────────────────────────────────────────────

function ReadingView({ ack, onProceed }: { ack: PolicyAcknowledgment; onProceed: () => void }) {
  const sections = (ack.policy_sections ?? []) as RolePolicySection[];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[20px] border-2 border-sniffy-yellow/20 p-6 sm:p-8 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-sniffy-purple">
          {POLICY_ROLE_LABEL[ack.role]} · {ack.signer_name}
        </p>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">{ack.policy_title}</h1>
      </div>

      {sections.map((s, i) => (
        <div key={i}>
          <h2 className="text-sm font-bold text-sniffy-purple mb-2">{s.heading}</h2>
          <ul className="space-y-1.5">
            {s.items.map((item, j) => (
              <li key={j} className="text-sm text-gray-700 flex gap-2">
                <span className="text-sniffy-yellow mt-1">●</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="pt-2 border-t border-gray-100">
        <button onClick={onProceed}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-sniffy-purple text-white font-semibold hover:bg-sniffy-purple/90 transition">
          <PenLine size={17}/> I've read this — proceed to sign
        </button>
      </div>
    </motion.div>
  );
}

// ─── Offer letter reading view ──────────────────────────────────────

function RichText({ text }: { text: string }) {
  return (
    <>
      {parseBold(text).map((seg, i) =>
        seg.bold ? <strong key={i} className="font-bold text-gray-900">{seg.text}</strong> : <span key={i}>{seg.text}</span>,
      )}
    </>
  );
}

function OfferLetterReadingView({ ack, onProceed }: { ack: PolicyAcknowledgment; onProceed: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const sections = (ack.policy_sections ?? []) as RolePolicySection[];
  const data = ack.offer_data;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#fbf7ea] rounded-[20px] border-2 border-sniffy-yellow/30 p-6 sm:p-9 space-y-5">
      <h1 className="text-base sm:text-lg font-extrabold text-gray-900 text-center tracking-wide">{ack.policy_title}</h1>

      {data && (
        <div className="space-y-3 text-sm text-gray-800 leading-relaxed">
          <p>Date: <strong>{fmtLetterDate(data.letter_date)}</strong></p>
          <p>Dear <strong>{ack.signer_name}</strong>,</p>
          {data.preamble.map((p, i) => <p key={i}><RichText text={p}/></p>)}
        </div>
      )}

      {sections.map((s, i) => (
        <div key={i} className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900">{s.heading}</h2>
          {s.items.map((p, j) => (
            <p key={j} className="text-sm text-gray-800 leading-relaxed"><RichText text={p}/></p>
          ))}
        </div>
      ))}

      <div className="pt-4 border-t border-gray-200 space-y-4">
        <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#451a8b]"/>
          <span>I, {ack.signer_name}, have read and understood this offer letter and accept all its terms.</span>
        </label>
        <button onClick={onProceed} disabled={!agreed}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-sniffy-purple text-white font-semibold hover:bg-sniffy-purple/90 transition disabled:opacity-40">
          <PenLine size={17}/> Proceed to sign
        </button>
      </div>
    </motion.div>
  );
}

// ─── Signing view (full-page signature) ────────────────────────────

function SigningView({
  ack, submitting, onBack, onSigned,
}: {
  ack: PolicyAcknowledgment;
  submitting: boolean;
  onBack: () => void;
  onSigned: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1f1f1f';
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasInk.current) { hasInk.current = true; setIsEmpty(false); }
  }
  function handlePointerUp() { drawing.current = false; }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk.current = false;
    setIsEmpty(true);
  }

  function submit() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSigned(canvas.toDataURL('image/png'));
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button onClick={onBack} disabled={submitting} className="text-sm font-semibold text-gray-500 disabled:opacity-40">
          ← Back
        </button>
        <p className="text-sm font-bold text-gray-800">Sign as {ack.signer_name}</p>
        <div className="w-10"/>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4">
        <p className="text-sm text-gray-500 text-center max-w-sm">
          Sign in the box below with your finger or mouse, then confirm.
        </p>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ touchAction: 'none', width: '100%', maxWidth: 520, height: 220 }}
          className="rounded-2xl border-2 border-dashed border-sniffy-purple/30 bg-gray-50/60"
        />
        <button onClick={clear} disabled={isEmpty || submitting}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-red-500 disabled:opacity-30">
          <Eraser size={14}/> Clear
        </button>
      </div>

      <div className="px-5 py-5 border-t border-gray-100">
        <AnimatePresence mode="wait">
          <motion.button
            key={submitting ? 'submitting' : 'ready'}
            onClick={submit}
            disabled={isEmpty || submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-sniffy-purple text-white font-semibold disabled:opacity-40">
            {submitting ? <Loader2 size={17} className="animate-spin"/> : <CheckCircle2 size={17}/>}
            {submitting ? 'Saving…' : 'Confirm & Submit Signature'}
          </motion.button>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
