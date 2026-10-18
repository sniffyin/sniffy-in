/**
 * admin/customerTypes.ts — Phase 1
 *
 * Shared types for the new Customer / Pet / SessionPet entities,
 * plus a phone-normalization helper that mirrors the Postgres
 * `normalize_phone()` function in migration 20260522000000.
 *
 * Why a frontend mirror? So the SessionFormModal autocomplete and the
 * "returning customer" badge in BookingsTab can dedup on the same
 * normalized form the DB uses, without an extra roundtrip.
 */

import type { BookingSource, SourceType } from './types';

// ─── Row types ──────────────────────────────────────────────────────

export type LifecycleStage = 'new' | 'active' | 'lapsed' | 'churned';

export interface Customer {
  id: string;

  phone:        string;          // normalized E.164, e.g. "+919876543210"
  phone_raw:    string | null;
  name:         string;
  email:        string | null;

  address:      string | null;
  city:         string | null;
  area:         string | null;
  gps_location: string | null;

  notes:        string | null;
  tags:         string[];
  is_vip:       boolean;
  is_elite:     boolean;         // paid membership tier above VIP

  lifecycle_stage: LifecycleStage;

  source:       BookingSource | null;
  source_type:  SourceType | null;

  referred_by_customer_id: string | null;
  referral_code: string | null;

  auth_user_id: string | null;

  marketing_opt_in:   boolean;
  whatsapp_opt_in:    boolean;
  preferred_language: string;

  first_session_at:       string | null;        // ISO date (YYYY-MM-DD)
  last_session_at:        string | null;
  total_sessions:         number;
  completed_sessions:     number;
  cancelled_sessions:     number;

  vendor_prepaid_total:   number;
  sniffy_collected_total: number;

  created_at: string;
  updated_at: string;
}

/** customers_with_recency view — same shape + 2 derived columns. */
export interface CustomerWithRecency extends Customer {
  days_since_last_session: number | null;
  lifetime_value:          number;     // vendor_prepaid_total + sniffy_collected_total
}

// ─── Phase 5 — referral types ────────────────────────────────────────

/** One row in the append-only `referral_credits` ledger. */
export interface ReferralCredit {
  id:                  string;
  customer_id:         string;
  amount:              number;                         // positive = earned, negative = redeemed
  reason:              'signup' | 'earn' | 'redeem' | 'expire' | 'adjust';
  source_session_id:   string | null;
  related_customer_id: string | null;
  note:                string | null;
  created_by:          string | null;
  created_at:          string;
}

/** Aggregate row from the `customer_referral_balance` view. */
export interface ReferralBalance {
  customer_id:        string;
  balance:            number;
  lifetime_earned:    number;
  lifetime_redeemed:  number;
  earn_count:         number;
  redeem_count:       number;
}

/** Single row in `referral_settings` (always id = 1). */
export interface ReferralSettings {
  id:                 1;
  signup_credit:      number;
  referrer_credit:    number;
  credit_expiry_days: number;
}

/** Build the wa.me share message the coordinator (or portal user)
 *  copies into WhatsApp.  Encodes the message body; the caller wraps
 *  it in the wa.me URL. */
export function buildReferralShareText(code: string, referrerName: string | null): string {
  const who = referrerName?.trim() || 'a friend';
  return [
    `Hi! ${who} thinks you'd love Sniffy — home pet grooming, no carrier, no stress.`,
    ``,
    `Use referral code *${code}* when you book your first session and we'll both get a treat. 🐾`,
    ``,
    `Book here: https://sniffy.in/?ref=${encodeURIComponent(code)}`,
  ].join('\n');
}

/** wa.me URL pre-loaded with the share text — for copy-to-whatsapp UI. */
export function buildReferralShareUrl(code: string, referrerName: string | null): string {
  return `https://wa.me/?text=${encodeURIComponent(buildReferralShareText(code, referrerName))}`;
}

// ─── Phase 6a — gift card types ──────────────────────────────────────

export type GiftCardStatus = 'active' | 'redeemed' | 'voided' | 'expired';

export interface GiftCard {
  id:                    string;
  code:                  string;
  amount:                number;
  balance:               number;
  status:                GiftCardStatus;
  issued_to_name:        string | null;
  issued_to_phone:       string | null;
  issued_to_customer_id: string | null;
  purchaser_name:        string | null;
  purchaser_phone:       string | null;
  message:               string | null;
  expires_at:            string;          // ISO date
  issued_by:             string | null;
  issued_at:             string;
  fully_redeemed_at:     string | null;
  voided_at:             string | null;
  voided_by:             string | null;
  void_reason:           string | null;
}

export interface GiftCardRedemption {
  id:            string;
  gift_card_id:  string;
  customer_id:   string | null;
  amount:        number;
  session_id:    string | null;
  note:          string | null;
  created_by:    string | null;
  created_at:    string;
}

export interface GiftCardBalance {
  customer_id:        string;
  balance:            number;
  active_card_count:  number;
  earliest_expiry:    string | null;
}

/** A gift-card share message — admin sends to recipient via wa.me. */
export function buildGiftCardShareText(card: Pick<GiftCard, 'code' | 'amount' | 'expires_at' | 'message' | 'purchaser_name'>): string {
  const fmt = `₹${Math.round(card.amount).toLocaleString('en-IN')}`;
  const expiry = new Date(card.expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const lines: string[] = [
    `🎁 You've received a Sniffy gift card worth ${fmt}!`,
    ``,
    `Code: *${card.code}*`,
    `Valid until: ${expiry}`,
  ];
  if (card.purchaser_name && card.purchaser_name.trim()) {
    lines.push(``, `From: ${card.purchaser_name.trim()}`);
  }
  if (card.message && card.message.trim()) {
    lines.push(``, `Message: ${card.message.trim()}`);
  }
  lines.push(``, `Redeem at: https://sniffy.in/account#wallet`);
  return lines.join('\n');
}

export function buildGiftCardShareUrl(card: Pick<GiftCard, 'code' | 'amount' | 'expires_at' | 'message' | 'purchaser_name'>, phone?: string | null): string {
  const text = encodeURIComponent(buildGiftCardShareText(card));
  if (phone) {
    const digits = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${digits}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}

// ─── Phase 6b — booking change request types ─────────────────────────

export type ChangeRequestType   = 'reschedule' | 'cancel';
export type ChangeRequestStatus = 'pending' | 'approved' | 'declined';

export interface SessionChangeRequest {
  id:                   string;
  customer_id:          string;
  session_id:           string | null;
  booking_id:           string | null;
  request_type:         ChangeRequestType;
  requested_new_date:   string | null;
  requested_new_time:   string | null;
  customer_notes:       string | null;
  status:               ChangeRequestStatus;
  responded_at:         string | null;
  responded_by:         string | null;
  response_notes:       string | null;
  created_at:           string;
}

// ─── Phase 6c — vaccination types ────────────────────────────────────

export interface VaccineType {
  id:                       string;
  key:                      string;
  label:                    string;
  species:                  'dog' | 'cat' | 'both';
  typical_interval_months:  number;
  description:              string | null;
  sort_order:               number;
  is_active:                boolean;
}

export interface PetVaccination {
  id:              string;
  pet_id:          string;
  vaccine_type_id: string;
  administered_on: string;       // ISO date
  due_on:          string | null;
  veterinarian:    string | null;
  notes:           string | null;
  created_by:      string | null;
  created_at:      string;
  updated_at:      string;
}

/** Compose a friendly "Rabies · due 14 Jun" summary string for badges. */
export function vaccinationSummary(v: PetVaccination, type: VaccineType | undefined): string {
  const label = type?.label ?? 'Vaccine';
  if (!v.due_on) return label;
  const due = new Date(v.due_on);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.floor((due.getTime() - today.getTime()) / (24 * 3600 * 1000));
  const dateStr = due.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  if (days < 0)   return `${label} · overdue by ${-days}d`;
  if (days === 0) return `${label} · due today`;
  if (days <= 30) return `${label} · due in ${days}d`;
  return `${label} · due ${dateStr}`;
}

export interface Pet {
  id: string;
  customer_id: string;

  name:    string | null;
  type:    'dog' | 'cat';
  breed:   string | null;
  gender:  'male' | 'female' | null;

  age_years:       number | null;
  age_recorded_at: string | null;     // ISO date
  age_bucket:      string | null;     // legacy: "0-1 years" / "1-5 years" / "5+ years"
  dob:             string | null;

  weight_kg:      number | null;
  color:          string | null;
  medical:        string | null;
  behavior_notes: string | null;
  photo_url:      string | null;

  is_active:  boolean;

  created_at: string;
  updated_at: string;
}

export interface SessionPet {
  id: string;
  session_id: string;
  pet_id: string;
  per_pet_package: string | null;
  per_pet_amount:  number | null;
  per_pet_addons:  string[] | null;
  notes:           string | null;
  created_at:      string;
}

// ─── Phone normalization (mirrors SQL normalize_phone) ──────────────
//
// Returns the E.164 form ("+91XXXXXXXXXX") for Indian numbers, or
// "+<digits>" for anything else.  Returns null for empty input.

export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^0-9]/g, '');
  if (!digits) return null;

  if (digits.length === 10) {
    return '+91' + digits;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return '+' + digits;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return '+91' + digits.slice(1);
  }
  return '+' + digits;
}

/** Display-friendly phone: "+91 98765 43210". */
export function formatPhoneDisplay(phone: string | null | undefined): string {
  if (!phone) return '';
  const n = normalizePhone(phone);
  if (!n) return String(phone);
  if (n.startsWith('+91') && n.length === 13) {
    return `+91 ${n.slice(3, 8)} ${n.slice(8)}`;
  }
  return n;
}

// ─── Lifecycle helpers ──────────────────────────────────────────────

export const LIFECYCLE_LABELS: Record<LifecycleStage, string> = {
  new:     'New',
  active:  'Active',
  lapsed:  'Lapsed',
  churned: 'Churned',
};

export const LIFECYCLE_COLORS: Record<LifecycleStage, { bg: string; text: string; border: string }> = {
  new:     { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  active:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  lapsed:  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200'  },
  churned: { bg: 'bg-gray-100',  text: 'text-gray-600',   border: 'border-gray-200'   },
};

// ─── Avatar helpers ─────────────────────────────────────────────────
//
// The customer list and detail header show a circular avatar.  Real
// photos aren't on the roadmap, so we render initials over a
// deterministic background colour picked from the customer's name (or
// phone, as a fallback).  Same seed → same colour, so a customer keeps
// the same avatar across every screen.

/** Pick up to 2 uppercase letters: first letter of first word +
 *  first letter of last word.  Falls back to the first two digits of
 *  the phone when there's no name to extract from. */
export function customerInitials(name: string | null | undefined, phone?: string | null): string {
  const cleaned = (name ?? '').trim().replace(/[^\p{L}\p{N}\s'-]/gu, '');
  if (cleaned) {
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    const first = parts[0][0] ?? '';
    const last  = parts[parts.length - 1][0] ?? '';
    return (first + last).toUpperCase();
  }
  // No usable name — derive from the last 2 phone digits so different
  // unnamed customers still get distinct avatars.
  const digits = (phone ?? '').replace(/[^0-9]/g, '');
  if (digits.length >= 2) return digits.slice(-2);
  return '··';
}

/** A small palette of saturated mid-tone backgrounds.  Each entry is
 *  paired with `text-white` so we don't have to think about contrast. */
const AVATAR_PALETTE = [
  'bg-teal-500',
  'bg-sky-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-rose-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-cyan-600',
] as const;

/** Deterministic bg-colour class for a given seed (typically the
 *  customer id, or name+phone if you don't have an id yet). */
export function customerAvatarColor(seed: string | null | undefined): string {
  const s = (seed ?? '').trim() || '·';
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

/** Compute a pet's displayed age — rolls forward from age_recorded_at. */
export function petDisplayAge(pet: Pick<Pet, 'age_years' | 'age_recorded_at' | 'age_bucket' | 'dob'>): string {
  if (pet.dob) {
    const years = Math.floor((Date.now() - new Date(pet.dob).getTime()) / (365.25 * 24 * 3600 * 1000));
    return `${years} yr${years === 1 ? '' : 's'}`;
  }
  if (pet.age_years != null) {
    if (pet.age_recorded_at) {
      const elapsedYears = Math.floor(
        (Date.now() - new Date(pet.age_recorded_at).getTime()) / (365.25 * 24 * 3600 * 1000)
      );
      const total = pet.age_years + Math.max(0, elapsedYears);
      return `${total} yr${total === 1 ? '' : 's'}`;
    }
    return `${pet.age_years} yr${pet.age_years === 1 ? '' : 's'}`;
  }
  return pet.age_bucket ?? '—';
}
