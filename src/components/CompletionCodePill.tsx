/**
 * CompletionCodePill.tsx — Click-to-copy chip for the 4-digit
 * completion code that the coordinator shares with the customer.
 *
 * Two visual variants:
 *   • size="sm"   — inline pill for cards (Sessions tab list)
 *   • size="lg"   — prominent panel for detail / expanded views
 *                   (Admin calendar's day-sheet)
 *
 * Tap anywhere on the chip → copies the code to the clipboard.
 * Visual confirmation: label briefly flips to "Copied!" in emerald.
 *
 * Coordinator-only — never embed this in any view a groomer can see.
 */

import { useState } from 'react';
import { KeyRound, Copy, Check } from 'lucide-react';

interface Props {
  code:     string;
  size?:    'sm' | 'lg';
  /** Optional sub-line for the lg variant. */
  hint?:    string;
}

export default function CompletionCodePill({ code, size = 'sm', hint }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (insecure context, old browser).
      // Fall through silently — coordinator can still read the code.
    }
  }

  if (size === 'lg') {
    return (
      <button
        type="button"
        onClick={copy}
        title="Tap to copy the completion code"
        className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 active:scale-[0.99] border border-purple-100 transition text-left"
      >
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-widest text-sniffy-purple flex items-center gap-1">
            <KeyRound size={10}/> Completion code
          </p>
          {hint && (
            <p className="text-[10px] text-purple-700/80 leading-tight mt-0.5">
              {hint}
            </p>
          )}
        </div>
        <span className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[18px] font-extrabold tracking-[0.4em] text-sniffy-purple bg-white px-3 py-1 rounded-lg border border-purple-200">
            {code}
          </span>
          <span className={`text-[10px] font-bold inline-flex items-center gap-1 ${
            copied ? 'text-emerald-600' : 'text-sniffy-purple/70'
          }`}>
            {copied ? <><Check size={11}/> Copied</> : <><Copy size={11}/> Copy</>}
          </span>
        </span>
      </button>
    );
  }

  // Default (sm) — compact inline pill.  Just the code inside; tap to
  // copy.  Briefly flips to a "Copied!" confirmation so the coordinator
  // gets visual feedback without a permanent label eating row space.
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); copy(); }}
      title="Tap to copy the completion code"
      aria-label={`Completion code ${code}. Tap to copy.`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border transition active:scale-95 shrink-0 ${
        copied
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-purple-50 border-purple-200 hover:bg-purple-100'
      }`}
    >
      {copied ? (
        <>
          <Check size={10} className="text-emerald-600 shrink-0"/>
          <span className="text-[10px] font-bold text-emerald-600">Copied</span>
        </>
      ) : (
        <>
          <KeyRound size={10} className="text-sniffy-purple shrink-0"/>
          <span className="font-mono text-[11px] font-extrabold tracking-[0.18em] text-sniffy-purple">
            {code}
          </span>
        </>
      )}
    </button>
  );
}
