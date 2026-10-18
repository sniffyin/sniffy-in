/**
 * HelpSupportTab.tsx
 *
 * Help & Support page reachable from the side drawer in both the
 * Admin and Groomer dashboards.  Shows the official Sniffy support
 * number with three tap-to-act CTAs:
 *
 *   • Call now         — opens the dialer (tel:)
 *   • WhatsApp         — opens chat with a friendly prefilled message
 *   • Copy number      — clipboard fallback for desktop / non-PWA
 *
 * Below the contact card sits a short list of common asks so the
 * support team gets a heads-up about what the caller likely needs.
 *
 * Number lives in a single SUPPORT_PHONE constant so future updates
 * are a one-line change.  Numeric form (no spaces/+) is used for
 * tel:/wa.me links; display form is the human-readable version.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, MessageCircle, Copy, Check,
  HelpCircle, Clock, MapPin, ShieldCheck,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────

/** Numeric form used for tel:/wa.me links — country code prefixed. */
const SUPPORT_PHONE_NUMERIC = '918971313003';
/** Display form shown to humans. */
const SUPPORT_PHONE_DISPLAY = '+91 89713 13003';
/** Friendly default message for the WhatsApp deep-link. */
const SUPPORT_WHATSAPP_GREETING = 'Hi Sniffy team, I need a quick hand —';

// ─── Sub-components ───────────────────────────────────────────

function ContactCTA({
  Icon, label, sublabel, onClick, accent, color, success,
}: {
  Icon: React.ElementType;
  label: string;
  sublabel: string;
  onClick: () => void;
  accent: string;
  color: string;
  success?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3.5 text-left hover:border-sniffy-purple/30 active:scale-[0.99] transition"
    >
      <span className="grid place-items-center w-10 h-10 rounded-2xl flex-shrink-0"
        style={{ background: accent, color }}>
        {success ? <Check size={16}/> : <Icon size={16}/>}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-extrabold text-gray-900 leading-tight">{label}</p>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{sublabel}</p>
      </div>
      <span className="text-gray-300 text-lg leading-none">›</span>
    </button>
  );
}

function FAQRow({
  Icon, title, body,
}: {
  Icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="grid place-items-center w-8 h-8 rounded-xl bg-purple-50 text-sniffy-purple flex-shrink-0 mt-0.5">
        <Icon size={14}/>
      </span>
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-gray-900 leading-tight">{title}</p>
        <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">{body}</p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────

export default function HelpSupportTab() {
  // Local UI state — turns the Copy CTA into a "Copied!" confirmation
  // for a couple of seconds, then back to the neutral copy icon.
  const [copied, setCopied] = useState(false);

  function callSupport() {
    window.location.href = `tel:+${SUPPORT_PHONE_NUMERIC}`;
  }

  function whatsappSupport() {
    const url = `https://wa.me/${SUPPORT_PHONE_NUMERIC}?text=${encodeURIComponent(SUPPORT_WHATSAPP_GREETING)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(SUPPORT_PHONE_DISPLAY);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable (older browsers / non-secure context);
      // fall through silently — the number is right there on screen.
    }
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* ── Hero: support number ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-5 text-white"
        style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)' }}
      >
        <HelpCircle className="absolute -top-3 -right-3 text-white/10" size={120}/>
        <div className="relative">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="grid place-items-center w-7 h-7 rounded-xl bg-white/15">
              <Phone size={14}/>
            </span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
              Sniffy Support
            </p>
          </div>
          <p className="text-2xl font-extrabold tabular-nums tracking-tight leading-tight">
            {SUPPORT_PHONE_DISPLAY}
          </p>
          <p className="text-xs text-white/85 mt-1.5 leading-snug">
            We're here for bookings, payouts, schedule changes — anything that needs a human.
          </p>
        </div>
      </motion.div>

      {/* ── Contact CTAs ───────────────────────────────── */}
      <div className="space-y-2">
        <ContactCTA
          Icon={Phone}
          label="Call Sniffy"
          sublabel="Tap to dial — fastest for urgent issues"
          accent="#ecfdf5"
          color="#047857"
          onClick={callSupport}
        />
        <ContactCTA
          Icon={MessageCircle}
          label="WhatsApp us"
          sublabel="Send a quick message — we typically reply within minutes"
          accent="#ecfdf5"
          color="#128c7e"
          onClick={whatsappSupport}
        />
        {/* <ContactCTA
          Icon={Copy}
          label={copied ? 'Number copied' : 'Copy number'}
          sublabel={copied ? "Paste it wherever you'd like" : 'Useful if you want to save the number to contacts'}
          accent={copied ? '#dcfce7' : '#f3f4f6'}
          color={copied ? '#15803d' : '#4b5563'}
          onClick={copyNumber}
          success={copied}
        /> */}
      </div>

      {/* ── Common asks (a heads-up about what to expect) ── */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">
          We can help with
        </p>
        <div className="divide-y divide-gray-50">
          <FAQRow
            Icon={Clock}
            title="Schedule changes"
            body="Cancellations, reschedules, running late — let us know and we'll keep the customer informed."
          />
          <FAQRow
            Icon={MapPin}
            title="Address or location issues"
            body="GPS not loading, gated society entry, or wrong area — we'll line up the right details."
          />
          <FAQRow
            Icon={ShieldCheck}
            title="Payments and incentives"
            body="Pending payouts, on-time bonus questions, review claims — we'll trace it for you."
          />
        </div>
      </section>

      {/* ── Hours strip ────────────────────────────────── */}
      <p className="text-[11px] text-gray-400 text-center leading-snug px-4">
        Available 7 days a week, 9 AM – 9 PM IST.
        Outside hours, WhatsApp us and we'll respond first thing in the morning.
      </p>
    </div>
  );
}
