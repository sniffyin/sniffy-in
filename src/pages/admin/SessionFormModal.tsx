/**
 * admin/SessionFormModal.tsx
 *
 * Changes:
 *   • Quick Fill button in header — collapses / expands a WhatsApp paste area.
 *     Parses name, phone, breed, package, date, time, address, age, groomer.
 *   • scheduled_time field added (time picker in Session Info section).
 *   • Source — Internal/External segmented tab + wrapping pill chips (unchanged)
 *   • Add-ons — unchanged
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, AlertCircle, Star, Zap, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Calendar, Clock, Sparkles, ImageUp, Wallet, Banknote, Smartphone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SessionChat from '../../components/SessionChat';
import type { AdminUser } from './authStore';
import {
  GroomingSession, Groomer, SessionStatus, BookingSource, SourceType,
  InternalSource, ExternalSource, PaymentMode, PaymentStatus,
  PaymentCollectedBy, defaultCollectedBy, PAYMENT_COLLECTED_BY_LABELS,
  DOG_BREEDS, CAT_BREEDS, PACKAGES, ADD_ONS, NEXT_DUE_OPTIONS,
  INTERNAL_SOURCE_LABELS, EXTERNAL_SOURCE_LABELS,
  EXTERNAL_SOURCE_FEE_RULE, effectivePct, commissionFor, feeRuleHint,
  isExternalSource,
  PAYMENT_STATUS_COLORS, paymentStatusLabel,
} from './types';
import DuplicateSessionWarningModal, { DuplicateMatch } from './DuplicateSessionWarningModal';
import { useModalTakesOverStatusBar } from '../../components/PWAInstallGate';
import { parseBookingScreenshot } from './parseScreenshotApi';
// Phase 1 — customer dedup + multi-pet support.  These helpers keep the
// session form aware of returning customers (autocomplete on phone) and
// reconcile pets/session_pets join rows after the session is saved.
import {
  searchCustomersByPhone, findCustomerByPhone, fetchPetsForCustomer,
  syncSessionPets,
} from './customerSync';
import {
  evalExpr, packageExpr, removeAddOnFromExpr, emptyExtraPet, computeSessionTotal, isItemised,
  validateSessionPets, deriveLoadState, buildPetInputs,
  type ExtraPetDraft, type LoadedSessionPetRow, type PetOrigin,
} from './sessionPets';
import { invalidateSessionPets } from './useSessionPets';
import { Customer, Pet, formatPhoneDisplay, normalizePhone } from './customerTypes';

// ─── Duplicate-detection helper ──────────────────────────────
//
// Returns `iso` (YYYY-MM-DD) shifted by `n` days, in **local** time.
// We parse with an explicit `T00:00:00` so a date-only string isn't
// interpreted as UTC midnight (which would silently shift the day in
// timezones east of UTC like IST).
function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ─── helpers ─────────────────────────────────────────────────

// Form fields the coordinator can set when creating/editing a session.
// We omit:
//   - Server-managed columns (id, net_booking_amount, total_collected,
//     discount_amount, created_at, updated_at, customer_id — set by the
//     trg_sessions_upsert_customer DB trigger, not typed by hand)
//   - resolved_lat/resolved_lng/gps_resolved_precision/gps_resolved_at —
//     written only by the resolve-gps-link Edge Function off whatever
//     gps_location the coordinator enters here, never hand-typed
//   - Groomer-side milestone fields (arrival_*, payment_*, review_claim_*,
//     groomer_marked_complete_at, groomer_on_time, client_review).
//     These default sensibly in the DB and are written exclusively by
//     the groomer flow / coordinator approvals — they don't belong in
//     the "Add Session" form.
type FormData = Omit<GroomingSession,
  | 'id' | 'net_booking_amount' | 'total_collected' | 'discount_amount' | 'created_at' | 'updated_at'
  | 'customer_id'
  | 'resolved_lat' | 'resolved_lng' | 'gps_resolved_precision' | 'gps_resolved_at'
  | 'arrival_marked_at' | 'arrival_selfie_url' | 'arrival_bonus_status'
  | 'arrival_bonus_approved_by' | 'arrival_bonus_approved_at' | 'arrival_bonus_rejected_note'
  | 'groomer_on_time'
  | 'groomer_marked_complete_at'
  | 'payment_collected_at' | 'payment_mode' | 'upsell_amount' | 'tip_amount' | 'payment_notes'
  | 'payment_verified' | 'payment_verified_at' | 'payment_verified_by'
  | 'payment_collected_by' | 'vendor_settled_at'
  | 'review_proof_url' | 'review_claim_at' | 'review_claim_rating' | 'review_claim_status'
  | 'review_claim_approved_by' | 'review_claim_approved_at' | 'review_claim_rejected_note'
  | 'client_review'
  | 'completion_code' | 'completion_photo_url' | 'completion_method'
>;

const EMPTY: FormData = {
  session_date:        new Date().toISOString().slice(0, 10),
  scheduled_time:      '',
  status:              'lead',
  is_converted:        false,

  pet_parent_name:     '',
  phone:               '',
  address:             '',
  gps_location:        '',

  pet_type:            'dog',
  pet_name:            '',
  breed:               '',
  pet_age:             '',
  pet_vaccinated:      null,

  source_type:         'internal',
  source:              'direct_call',

  booking_amount:      0,
  booking_amount_expr: '',
  platform_commission: 0,
  groomer_commission:  0,
  discount_type:       null,
  discount_value:      0,

  package:             '',
  add_ons:             [],

  // No preselected follow-up — ~95% of bookings don't set a follow-up,
  // so default this to null (rather than "1 month / 30 days") so the
  // coordinator has to opt in.  All downstream call sites must guard
  // against a null value.
  next_due_days:       null,
  next_due_date:       null,

  medical_issues:      '',
  groomer_observation: '',

  review_taken:        false,
  client_rating:       null,

  groomer_id:          null,
  groomer_name:        '',
  groomer_phone:       '',

  notes:               '',
};

const AGE_OPTIONS = ['0-1 years', '1-5 years', '5+ years'];

const INTERNAL_SOURCES = Object.keys(INTERNAL_SOURCE_LABELS) as InternalSource[];
const EXTERNAL_SOURCES = Object.keys(EXTERNAL_SOURCE_LABELS) as ExternalSource[];

function calcNextDue(date: string, days: number | null) {
  if (days == null) return null;
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function humanDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Fuzzy name-matching helpers ─────────────────────────────
//
// Shared by:
//   • Quick Fill groomer-resolution useEffect (auto-link parsed
//     name/phone to a groomer record).
//   • GroomerCombobox search (filter groomer dropdown as the
//     coordinator types).
//
// The common failure mode is doubled-consonant spelling drift
// ("Siddharth" message vs "Sidharth" DB) and vowel-dropping shorthand
// ("hmnt" → "hemant", "sdrth" → "sidharth").  `fuzz()` strips
// non-letters and collapses runs of repeated chars; `isSubsequence()`
// checks whether the query chars appear in order; `editDistance()`
// is a tiny Levenshtein for single-edit typo tolerance.

function fuzz(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, '').replace(/(.)\1+/g, '$1');
}

function isSubsequence(needle: string, haystack: string): boolean {
  if (!needle) return true;
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (haystack[j] === needle[i]) i++;
  }
  return i === needle.length;
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const prev = new Array(n + 1).fill(0).map((_, i) => i);
  const curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

/** Very short display names for the add-on chips (saved value is unchanged). */
const ADD_ON_SHORT: Record<string, string> = {
  'Tick & Flea Care': 'Tick/Flea',
  'Medicated Bath': 'Med Bath',
  'Destressing Massage': 'Massage',
  'Hygiene Hair Cut': 'Hygiene',
  'Deworming': 'Deworm',
};
const shortAddOn = (label: string) => ADD_ON_SHORT[label] ?? label;

// ─── WhatsApp Quick Fill Parser ──────────────────────────────

interface ParsedSession {
  pet_parent_name?: string;
  phone?: string;
  address?: string;
  /** Extracted Google Maps / share URL (if any was present in the
   *  pasted message — either inside the Address line or on a separate
   *  Location / GPS / Maps line, or as a bare URL anywhere in text). */
  gps_location?: string;
  breed?: string;
  /** Explicit pet type — used by the AI screenshot path which can read
   *  the breed image / labels.  When omitted (the WhatsApp text-paste
   *  path), pet_type is inferred from the breed name against the
   *  CAT_BREEDS / DOG_BREEDS lists. */
  pet_type?: 'dog' | 'cat';
  pet_age?: string;
  package?: string;
  session_date?: string;
  scheduled_time?: string;
  booking_amount?: number;
  groomer_name?: string;
  groomer_phone?: string;
  /** Booking-source overrides — used by the AI screenshot path so a
   *  Woofly screenshot lands with source_type='external' and
   *  source='woofly' already selected.  Text-paste leaves these
   *  unset and falls back to the existing groomer-presence heuristic. */
  source_type?: SourceType;
  source?: BookingSource;
}

/** Generic URL detector — matches http(s)://… up to the first whitespace.
 *  Google Maps share links never contain spaces so this is safe. */
const URL_RE = /https?:\/\/[^\s]+/i;

function extractFirstUrl(s: string): string | undefined {
  const m = s.match(URL_RE);
  return m ? m[0] : undefined;
}

function stripUrls(s: string): string {
  return s.replace(/\s*https?:\/\/[^\s]+\s*/gi, ' ').replace(/\s+/g, ' ').trim();
}

const MONTH_MAP: Record<string, string> = {
  jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06',
  jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12',
};

// Month name pattern — full + abbreviated forms.  We only look at the
// first 3 letters when mapping to MONTH_MAP so "September", "Sept" and
// "Sep" all resolve.  Kept as a raw string so we can inline-build
// composite regexes (e.g. day-month and month-day) without escaping
// gymnastics.
const MONTH_RE_SRC =
  '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';

/** Extract session date + time from a pasted WhatsApp message.
 *
 *  Real-world messages don't follow any single format — coordinators
 *  paste things like "9thMay , 6.30.PM" (no space between day & month,
 *  dot before AM/PM), "May 9, 2026 6:30 pm", "23/05/2026 at 18:30",
 *  etc.  So instead of one rigid regex we:
 *    1. Bucket the lines that mention any of {Date, Time, Appointment,
 *       Schedule, Slot, Booking, When} — this lets us find the
 *       day/time even when they're split across two lines and avoids
 *       matching incidental digits inside the address or pin code.
 *    2. Try day-first, month-first, then numeric DD/MM/YYYY patterns.
 *    3. For time, try H[:.]MM AM/PM → H AM/PM → 24h HH:MM.
 *
 *  Year is taken from the message when present; otherwise we use the
 *  current year (this is a back-fill tool — sessions being entered
 *  here are typically very recent past or near-future). */
function parseDateTime(text: string, lines: string[]): { date?: string; time?: string } {
  const KEYWORD_RE = /(?:^|\W)(?:Date|Time|Appointment|Schedul(?:e[d]?|ing)?|Slot|Booking|When)\b/i;
  const buckets: string[] = [];
  for (const line of lines) {
    if (KEYWORD_RE.test(line)) buckets.push(line);
  }
  const searchSpace = buckets.length ? buckets.join(' | ') : text;

  let date: string | undefined;
  let time: string | undefined;

  // ── Date ────────────────────────────────────────────────────
  // 1. Day [ordinal] Month [Year]      — "9thMay", "9 May 2026", "12 April"
  const dmy = searchSpace.match(
    new RegExp(`(\\d{1,2})\\s*(?:st|nd|rd|th)?\\s*(?:of\\s+)?${MONTH_RE_SRC}(?:\\s*,?\\s*(\\d{2,4}))?`, 'i')
  );
  if (dmy) {
    const day   = dmy[1].padStart(2, '0');
    const month = MONTH_MAP[dmy[2].toLowerCase().slice(0, 3)];
    let year    = dmy[3] ?? String(new Date().getFullYear());
    if (year.length === 2) year = '20' + year;
    if (month) date = `${year}-${month}-${day}`;
  }

  // 2. Month Day [Year]                — "May 9", "April 12, 2026"
  if (!date) {
    const mdy = searchSpace.match(
      new RegExp(`${MONTH_RE_SRC}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*,?\\s*(\\d{2,4}))?`, 'i')
    );
    if (mdy) {
      const month = MONTH_MAP[mdy[1].toLowerCase().slice(0, 3)];
      const day   = mdy[2].padStart(2, '0');
      let year    = mdy[3] ?? String(new Date().getFullYear());
      if (year.length === 2) year = '20' + year;
      if (month) date = `${year}-${month}-${day}`;
    }
  }

  // 3. Numeric DD/MM[/YYYY] (also accepts '-' and '.' separators).
  //    Restricted to date/time-keyword lines so phone numbers and
  //    address fragments can't accidentally land in here.
  if (!date) {
    const num = searchSpace.match(/\b(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?\b/);
    if (num) {
      const day      = num[1].padStart(2, '0');
      const month    = num[2].padStart(2, '0');
      const monthNum = parseInt(month, 10);
      let year       = num[3] ?? String(new Date().getFullYear());
      if (year.length === 2) year = '20' + year;
      if (monthNum >= 1 && monthNum <= 12) {
        date = `${year}-${month}-${day}`;
      }
    }
  }

  // ── Time ────────────────────────────────────────────────────
  // 1. H[:.]MM AM/PM — most common case ("6.30 PM", "6:30PM", "6.30.PM").
  //    Allow any single punctuation char between minutes and the
  //    AM/PM marker — the user's example has "6.30.PM" with an
  //    extra dot that the old regex rejected.
  const t1 = searchSpace.match(/(\d{1,2})\s*[:.]\s*(\d{2})\s*[.,\-\s]*\s*(a\.?m\.?|p\.?m\.?)(?![a-z])/i);
  if (t1) {
    let h        = parseInt(t1[1], 10);
    const min    = t1[2];
    const ampm   = t1[3].toLowerCase().replace(/\./g, '').slice(0, 2);
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    time = `${String(h).padStart(2, '0')}:${min}`;
  }

  // 2. H AM/PM — just hours, no minutes ("6 PM", "10am").
  if (!time) {
    const t2 = searchSpace.match(/\b(\d{1,2})\s*(a\.?m\.?|p\.?m\.?)(?![a-z])/i);
    if (t2) {
      let h      = parseInt(t2[1], 10);
      const ampm = t2[2].toLowerCase().replace(/\./g, '').slice(0, 2);
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      time = `${String(h).padStart(2, '0')}:00`;
    }
  }

  // 3. 24-hour HH:MM (e.g. "18:30").
  if (!time) {
    const t3 = searchSpace.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (t3) time = `${t3[1].padStart(2, '0')}:${t3[2]}`;
  }

  return { date, time };
}

// ─── Label classifier ─────────────────────────────────────────
//
// Coordinators paste from many different vendor templates, and they
// also retype labels by hand when adding late entries — so spellings
// are wildly inconsistent ("Adress", "Adrs", "Mob no.", "Contact #",
// "Pet Parent's Name", "Customer", etc.).  Instead of trying to
// enumerate every possible label form in a regex, we:
//
//   1. Split each line at the first `:` or `-` into {label, value}.
//   2. Normalize the label (lowercase, strip non-letters).
//   3. Classify the normalized label into a field by keyword/pattern.
//
// `normalizeLabel('Mob. No.')` → 'mobno'; `normalizeLabel('Adress')`
// → 'adress'; `normalizeLabel("Pet Parent's Name")` → 'petparentsname'.
// Each field's classifier then does cheap substring/regex tests on
// that compact string — robust to extra punctuation/spaces and to a
// large class of misspellings.

type FieldKind =
  | 'name' | 'phone' | 'address' | 'gps' | 'breed' | 'age'
  | 'package' | 'amount' | 'date' | 'time' | 'datetime' | 'groomer'
  | 'unknown';

function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z]/g, '');
}

function classifyLabel(rawLabel: string): FieldKind {
  const n = normalizeLabel(rawLabel);
  if (!n) return 'unknown';

  // Address (and its many misspellings).  Match any label that starts
  // with 'a' + one or more 'd's, optionally followed by 'r's, 'e's
  // and 's's — covers address, addres, adress, adres, addrs, adrs,
  // addr, adr, adrss, addresss, adddress, etc.  Anchored at start
  // and with the suffix "area" tolerated ("address/area" → 'addressarea').
  // Excluded: 'ad' alone (too short / ambiguous).
  if (/^a+d+(?:r+e?s*|s+)\w{0,6}$/.test(n) || n === 'addressarea' || /^a+d+r+\w{0,4}$/.test(n)) {
    return 'address';
  }

  // GPS / location / maps link — keep BEFORE address fallback so
  // "location" doesn't get mis-classified.
  if (/^(gps|gpslocation|location|locn|maps|maplink|mapslink|mapurl|maplocation|pin|pinlocation|geolocation|coordinates|coords)$/.test(n)) {
    return 'gps';
  }

  // Date + Time on one line — distinguished from solo Date / Time.
  if (/^(date(and|n)?time|datetime|appointmentdatetime|appointment|appointmentdetails|schedule[d]?(at)?|slot|when|bookingdatetime|sessiondatetime)$/.test(n)) {
    return 'datetime';
  }

  // Date alone
  if (/(?:^|\b)(date|day|on|bookingdate|appointmentdate|sessiondate|scheduledate|scheduleddate)$/.test(n)) {
    return 'date';
  }

  // Time alone
  if (/(?:^|\b)(time|at|bookingtime|appointmenttime|sessiontime|scheduletime|scheduledtime|slottime|pickuptime)$/.test(n)) {
    return 'time';
  }

  // Phone-ish labels.  Covers: phone, phno, ph, mobile, mob, cell,
  // contact, whatsapp, tel, telephone, number/no when it stands
  // alone with phone-ish neighbours.  Also catches misspellings like
  // 'mobil', 'phon', 'contct'.
  if (/(?:^|\b)(phone|phon|phno|ph|mobile|mobil|mob|cell|cellphone|contact|contct|cntct|whatsapp|wa|tel|telephone)(?:no|number|num|#)?$/.test(n)) {
    return 'phone';
  }
  // Bare "number" / "no" — only treat as phone when it sits in a
  // context like 'contactnumber' which the rule above already
  // catches.  Standalone "Number:" is too ambiguous (could be amount,
  // OTP, ref, etc.) so we leave it as unknown.

  // Groomer-ish labels.
  if (/(?:^|\b)(groomer|stylist|assignedgroomer|assignedstylist|petgroomer|petstylist|groomerassigned|groomedby|assignedto|assignee)(?:name|details)?$/.test(n)) {
    return 'groomer';
  }

  // Name-ish labels — match either a name keyword or anything ending
  // in 'name'.  Excludes groomer/stylist names (handled above) by
  // ordering: groomer/stylist checks happen first.
  if (
    /(?:^|\b)(name|fullname|petparent|parent|customer|client|petowner|owner|user|buyer|booker|bookedby|guest)(?:'?s)?(?:name)?$/.test(n) ||
    (n.endsWith('name') && n.length <= 30)
  ) {
    return 'name';
  }

  // Breed
  if (/(?:^|\b)(breed|petbreed|species|dogbreed|catbreed)$/.test(n)) return 'breed';

  // Age
  if (/(?:^|\b)(age|petage|year|years|yrs|yr)$/.test(n)) return 'age';

  // Package
  if (/(?:^|\b)(package|pkg|service|services|servicepackage|selectedpackage|chosenpackage|booking|grooming|groomingpackage)$/.test(n)) {
    return 'package';
  }

  // Amount
  if (/(?:^|\b)(amount|amt|amountpayable|total|totalpayable|totalamount|payable|price|cost|fee|charge|charges|grandtotal|finalamount|fare|rate)$/.test(n)) {
    return 'amount';
  }

  return 'unknown';
}

/** Parse one line into {label, value} if it has a `:`, `#`, `→`, `=`
 *  or padded `-` delimiter.  We try delimiters in priority order so
 *  the *first* one in the line wins — "Address: Plot, B-7" splits at
 *  the colon, not at the dash inside the value. */
function splitLine(line: string): { label: string; value: string } | null {
  // 1. `:` — most common.
  const colonIdx = line.indexOf(':');
  if (colonIdx > 0 && colonIdx < line.length - 1) {
    const label = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (label && value) return { label, value };
  }
  // 2. `#` / `→` / `=` — occasionally used as field separators
  //    ("Contact # 98765...", "Name → Rahul", "Phone = ...").
  const altMatch = line.match(/^([a-zA-Z][a-zA-Z\s'.]{0,40}?)\s*[#→=]\s*(.+)$/);
  if (altMatch) return { label: altMatch[1].trim(), value: altMatch[2].trim() };
  // 3. "Label - value" form (padded dash so we don't split inside
  //    phone numbers like "98765-43210").
  const dashMatch = line.match(/^([a-zA-Z][^-:\n]{0,40}?)\s+-\s+(.+)$/);
  if (dashMatch) return { label: dashMatch[1].trim(), value: dashMatch[2].trim() };
  return null;
}

function parseWhatsApp(text: string): ParsedSession {
  const result: ParsedSession = {};
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Pre-pass — classify every labeled line.  We keep the first
  // occurrence per field (sender-formatted templates rarely repeat
  // a field, and if they do, the first one tends to be canonical).
  const found: Partial<Record<FieldKind, string>> = {};
  for (const line of lines) {
    const split = splitLine(line);
    if (!split) continue;
    const kind = classifyLabel(split.label);
    if (kind === 'unknown') continue;
    if (found[kind] !== undefined) continue;          // first-wins
    found[kind] = split.value;
  }

  // ── Name ────────────────────────────────────────────────────
  if (found.name) result.pet_parent_name = found.name;

  // ── Phone ───────────────────────────────────────────────────
  if (found.phone) {
    const digits = found.phone.replace(/\D/g, '');
    // Take the last 10 digits — drops "+91" or "0" prefixes; tolerates
    // spaces, dashes, parens in the source.
    if (digits.length >= 10) result.phone = digits.slice(-10);
    else if (digits.length > 0) result.phone = digits;
  }

  // ── Address (+ inline maps URL) ─────────────────────────────
  if (found.address) {
    const raw = found.address;
    const url = extractFirstUrl(raw);
    if (url) {
      result.gps_location = url;
      const rest = stripUrls(raw);
      if (rest) result.address = rest;
    } else {
      result.address = raw;
    }
  }

  // ── GPS / Maps line (independent of address) ────────────────
  if (!result.gps_location && found.gps) {
    const url = extractFirstUrl(found.gps);
    if (url) result.gps_location = url;
  }
  // Last-ditch: bare URL anywhere in the pasted text.
  if (!result.gps_location) {
    const bareUrl = extractFirstUrl(text);
    if (bareUrl) result.gps_location = bareUrl;
  }

  // ── Breed ───────────────────────────────────────────────────
  if (found.breed) {
    const lower = found.breed.toLowerCase();
    const matched = [...DOG_BREEDS, ...CAT_BREEDS].find(b =>
      lower.includes(b.toLowerCase().split(' ')[0])
    );
    result.breed = matched || found.breed;
  }

  // ── Age ─────────────────────────────────────────────────────
  if (found.age) {
    const num = parseFloat(found.age);
    if (!isNaN(num)) {
      result.pet_age = num < 1 ? '0-1 years' : num <= 5 ? '1-5 years' : '5+ years';
    }
  }

  // ── Package ─────────────────────────────────────────────────
  if (found.package) {
    const lower = found.package.toLowerCase();
    const matched = PACKAGES.find(p =>
      lower.includes(p.label.toLowerCase()) ||
      (lower.includes('hair') && p.label.includes('Hair')) ||
      (lower.includes('bath') && !lower.includes('hair') && p.label === 'Spa Bath') ||
      (lower.includes('bath') && lower.includes('hair') && p.label === 'Spa Bath + Hair Cut') ||
      (lower.includes('trimming') && p.label.includes('Hair'))
    );
    if (matched) {
      result.package = matched.label;
      result.booking_amount = matched.price;
    }
  }

  // ── Amount ──────────────────────────────────────────────────
  if (found.amount) {
    const cleaned = found.amount.replace(/[^\d]/g, '');
    const n = parseInt(cleaned, 10);
    if (!isNaN(n)) result.booking_amount = n;
  }

  // ── Date & Time ─────────────────────────────────────────────
  // parseDateTime already does its own bucket-based scan, so it
  // handles any date/time tokens regardless of how the label was
  // spelt.  We pass the full text so it can look across multiple
  // lines (e.g. separate "Date:" and "Time:" fields).
  const dt = parseDateTime(text, lines);
  if (dt.date) result.session_date   = dt.date;
  if (dt.time) result.scheduled_time = dt.time;

  // ── Groomer ─────────────────────────────────────────────────
  if (found.groomer) {
    const groomerLine = found.groomer;
    // Match a 10+ digit phone with optional +91, spaces, dashes.
    const phoneMatch = groomerLine.match(/(\+?\s*91[\s\-]*)?(\d[\d\s\-]{8,}\d)/);
    if (phoneMatch) {
      const digits = phoneMatch[0].replace(/\D/g, '');
      if (digits.length >= 10) {
        result.groomer_phone = digits.slice(-10);
        const namePart = groomerLine
          .slice(0, phoneMatch.index)
          .replace(/[,(\[\s]+$/, '')
          .trim();
        if (namePart) result.groomer_name = namePart;
      } else {
        result.groomer_name = groomerLine.trim();
      }
    } else {
      result.groomer_name = groomerLine.trim();
    }
  }

  return result;
}

// ─── Field primitives ─────────────────────────────────────────

function Lbl({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
      {children}{req && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

const inputCls = `w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800
  focus:outline-none focus:border-sniffy-purple focus:ring-1 focus:ring-sniffy-purple/20
  placeholder:text-gray-300 transition bg-white`;

const selectCls = `${inputCls} cursor-pointer`;

function AutoTextarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [focused, setFocused] = useState(false);
  const expanded = focused || Boolean(value);
  return (
    <textarea
      value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      className={`${inputCls} resize-none`}
      style={{ minHeight: expanded ? '72px' : '42px', height: expanded ? 'auto' : '42px', overflow: expanded ? 'auto' : 'hidden', transition: 'min-height 0.2s ease, height 0.2s ease' }}
    />
  );
}

// SectionCard — visual grouping for the Add/Edit Session form.
// Each top-level section (Session Info, Pet Parent, Pet, Financials, Groomer,
// Feedback) is wrapped in a white card with a subtle border + shadow, sitting
// on the grey body background.  The title row uses the same uppercase purple
// label + thin divider that the form previously used inline — only the
// surrounding container changed.
function SectionCard({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-sniffy-purple whitespace-nowrap">{title}</span>
        <div className="flex-1 h-px bg-purple-100"/>
        {right}
      </div>
      {children}
    </div>
  );
}

// Non-interactive "is this pet vaccinated?" indicator — carried over from
// the source booking on conversion (see BookingsTab.tsx openConvert()).
// null (unknown — e.g. a manually-added session with no source booking)
// renders nothing rather than defaulting to either color.
function VaccinationBadge({ vaccinated }: { vaccinated: boolean | null | undefined }) {
  if (vaccinated == null) return null;
  return (
    <span
      title={vaccinated ? 'Pet is vaccinated' : 'Pet is not vaccinated'}
      className={vaccinated ? 'text-green-600' : 'text-red-500'}
    >
      <CheckCircle2 size={18} strokeWidth={2.4}/>
    </span>
  );
}

function StarRating({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(value === n ? null : n)}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          className="transition-transform active:scale-90">
          <Star size={22} className={`transition-colors ${n <= (hover || value || 0) ? 'text-sniffy-yellow fill-sniffy-yellow' : 'text-gray-200 fill-gray-200'}`}/>
        </button>
      ))}
      {value && <span className="text-xs text-gray-400 ml-1">{value}/5</span>}
    </div>
  );
}

function TogglePill({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
      className={`relative inline-flex items-center h-8 w-[74px] rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sniffy-purple/30 flex-shrink-0 ${
        checked ? 'bg-sniffy-purple' : 'bg-gray-300'
      }`}
    >
      {/* sliding thumb */}
      <span
        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
          checked ? 'left-[calc(100%-28px)]' : 'left-1'
        }`}
      />
      {/* label */}
      <span
        className={`absolute text-[11px] font-extrabold tracking-wide text-white transition-all duration-200 select-none ${
          checked ? 'left-2.5' : 'right-2'
        }`}
      >
        {checked ? 'Yes' : 'No'}
      </span>
    </button>
  );
}

// ─── Payment status pill (modal header) ───────────────────────
//
// Three visual states sourced from `paymentStatusLabel()`:
//   • Unpaid             — gray, neutral
//   • Cash w/ Groomer    — amber, "money in transit"
//   • Online · Pending   — amber, "txn unconfirmed"
//   • Paid · Cash/Online — green, settled
//
// Tap to cycle.  The COLLECTED → PAID transition is a single-tap
// "verify" — the coordinator is acknowledging the row.
function PaymentStatusPill({
  status, mode, onToggle,
}: {
  status: PaymentStatus;
  mode: PaymentMode | null;
  onToggle: () => void;
}) {
  const colors = PAYMENT_STATUS_COLORS[status];
  const label  = paymentStatusLabel({ payment_verified: status === 'paid', payment_collected_at: status !== 'unpaid' ? 'set' : null, payment_mode: mode });

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider transition active:scale-95 ${colors.bg} ${colors.text} ${colors.border} hover:brightness-105`}
      title={status === 'collected' ? 'Tap to verify (mark as Paid)' : 'Tap to toggle paid status'}
    >
      <Wallet size={11} strokeWidth={2.5}/>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

// Cash / Online pills — shown inline in the financials section when
// status ≠ unpaid.  Cash + Online are the only modes the DB enum
// supports today (matches PaymentMode in types.ts).
function PaymentModePills({
  value, onChange,
}: {
  value: PaymentMode | null;
  onChange: (m: PaymentMode) => void;
}) {
  function pillCls(active: boolean): string {
    return [
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-bold transition',
      active
        ? 'border-sniffy-purple bg-sniffy-purple/5 text-sniffy-purple'
        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
    ].join(' ');
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      <button type="button" onClick={() => onChange('cash')}   className={pillCls(value === 'cash')}>
        <Banknote size={12}/> Cash
      </button>
      <button type="button" onClick={() => onChange('online')} className={pillCls(value === 'online')}>
        <Smartphone size={12}/> Online
      </button>
    </div>
  );
}

// ─── Groomer Combobox ────────────────────────────────────────
//
// Replaces the plain `<select>` we used to use for the Assign field.
// Coordinators typically know the groomer's first name but not always
// the exact spelling — so the dropdown filters as they type with the
// same fuzzy strategies the Quick Fill auto-resolver uses:
//
//   • Exact name / startsWith / includes        (strictest, top rank)
//   • Same after `fuzz()` (dedup + letter-only) — "siddharth" finds
//     "Sidharth", "Hemmant" finds "Hemant".
//   • Subsequence match on the deduped form     — "sdrth" → "sidharth",
//     "hmnt" → "hemant".  Lets the coordinator drop vowels.
//   • Edit-distance ≤ 1 / 2 on tokens of 5+     — single-char typos.
//
// Results are ranked, best-first.  Inactive groomers are surfaced
// only if they're the currently-selected record (so a Quick-Filled
// historical assignment doesn't disappear from the field).

function GroomerCombobox({
  groomers,
  selectedId,
  onSelect,
}: {
  groomers: Groomer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const [highlight, setHighlight] = useState(0);
  const wrapRef             = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLInputElement>(null);

  // Click-outside to close.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const selected = groomers.find(g => g.id === selectedId) || null;

  const filtered = useMemo(() => {
    // Visible pool: active groomers + the currently-selected one even
    // if inactive (so Quick Fill resolving to a historical record
    // doesn't vanish from the dropdown).
    const pool = groomers.filter(g => g.status === 'active' || g.id === selectedId);

    const q = query.trim().toLowerCase();
    if (!q) return pool;
    const qFuzz = fuzz(q);

    // Score lower = better.  Hits the strictest match first; falls
    // through to looser strategies.  Returns null if nothing matches
    // so the entry gets filtered out.
    function score(g: Groomer): number | null {
      const name      = g.name.toLowerCase();
      const nameFuzz  = fuzz(name);
      const firstTok  = name.split(/\s+/)[0] || '';
      const firstFuzz = fuzz(firstTok);

      if (name === q)                                   return 0;
      if (firstTok === q)                               return 1;
      if (name.startsWith(q))                           return 2;
      if (firstTok.startsWith(q))                       return 3;
      if (name.includes(q))                             return 4;
      // Dedup tier — "siddharth" → "sidharth"
      if (nameFuzz === qFuzz)                           return 5;
      if (firstFuzz === qFuzz)                          return 6;
      if (nameFuzz.startsWith(qFuzz))                   return 7;
      if (nameFuzz.includes(qFuzz))                     return 8;
      // Subsequence tier — "sdrth" → "sidharth", "hmnt" → "hemant"
      if (qFuzz.length >= 2 && isSubsequence(qFuzz, nameFuzz)) return 9;
      // Edit-distance tier — single typo tolerance on tokens of 5+
      if (qFuzz.length >= 3 && firstFuzz.length >= 5) {
        const d = editDistance(qFuzz, firstFuzz);
        if (d === 1) return 10;
        if (d === 2 && qFuzz.length >= 5) return 11;
      }
      return null;
    }

    const scored = pool
      .map(g => ({ g, s: score(g) }))
      .filter(x => x.s !== null) as { g: Groomer; s: number }[];
    scored.sort((a, b) => a.s - b.s || a.g.name.localeCompare(b.g.name));
    return scored.map(x => x.g);
  }, [query, groomers, selectedId]);

  // Reset highlight whenever the filtered list changes.
  useEffect(() => { setHighlight(0); }, [query, open]);

  function commit(id: string) {
    onSelect(id);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = filtered[highlight];
      if (pick) commit(pick.id);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  }

  // Input shows the typed query while open, otherwise the selected
  // name (so the field reads like a select when not interacting).
  const displayValue = open ? query : (selected?.name ?? '');

  return (
    <div ref={wrapRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        className={inputCls}
        placeholder="Select / search…"
        value={displayValue}
        onFocus={() => { setOpen(true); setQuery(''); }}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {/* Caret/clear indicator */}
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto"
          >
            {/* Always-present "unassign" row so the coordinator can
                clear an assignment without touching another input. */}
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => commit('')}
              className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 border-b border-gray-100"
            >
              (Unassign)
            </button>

            {filtered.length === 0 && (
              <div className="px-3 py-2.5 text-xs text-gray-400">
                No groomers match &ldquo;{query}&rdquo;
              </div>
            )}

            {filtered.map((g, i) => (
              <button
                key={g.id}
                type="button"
                onMouseDown={e => e.preventDefault()}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => commit(g.id)}
                className={`w-full text-left px-3 py-2 text-sm transition ${
                  i === highlight ? 'bg-purple-50' : ''
                } ${
                  g.id === selectedId
                    ? 'text-sniffy-purple font-semibold'
                    : 'text-gray-700'
                }`}
              >
                {g.name}
                {g.status !== 'active' && (
                  <span className="ml-2 text-[10px] text-gray-400 uppercase">
                    {g.status}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sniffy Date Picker ───────────────────────────────────────

const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS  = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function SniffyDatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen]           = useState(false);
  const wrapRef                   = useRef<HTMLDivElement>(null);
  const today                     = new Date();

  const parsed = value ? new Date(value + 'T00:00:00') : null;
  const [viewYear,  setViewYear]  = useState(parsed?.getFullYear()  ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth()     ?? today.getMonth());

  useEffect(() => {
    if (parsed) { setViewYear(parsed.getFullYear()); setViewMonth(parsed.getMonth()); }
  }, [value]);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [open]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }
  function selectDay(day: number) {
    onChange(`${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
    setOpen(false);
  }
  function goToday() {
    onChange(today.toISOString().slice(0, 10));
    setViewYear(today.getFullYear()); setViewMonth(today.getMonth());
    setOpen(false);
  }

  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isSel   = (d: number) => !!parsed && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth && parsed.getDate() === d;
  const isToday = (d: number) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;

  const displayLabel = parsed
    ? parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return (
    <div className="relative" ref={wrapRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`${inputCls} flex items-center justify-between gap-2 text-left transition-all ${
          open ? 'border-sniffy-purple ring-1 ring-sniffy-purple/20' : ''
        }`}
      >
        <span className={displayLabel ? 'text-gray-800 font-medium' : 'text-gray-300'}>
          {displayLabel || 'Pick a date'}
        </span>
        <Calendar size={15} className={`flex-shrink-0 transition-colors ${open ? 'text-sniffy-purple' : 'text-gray-400'}`}/>
      </button>

      {/* Calendar dropdown — fixed width so it isn't squished inside the grid column */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit   ={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-[60] top-full mt-2 left-0 w-[300px] bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Month nav — purple gradient */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-sniffy-purple to-purple-800">
              <button type="button" onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 transition text-white active:scale-95">
                <ChevronLeft size={15}/>
              </button>
              <span className="text-sm font-extrabold text-white tracking-wide select-none">
                {MONTHS_LONG[viewMonth]} {viewYear}
              </span>
              <button type="button" onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 transition text-white active:scale-95">
                <ChevronRight size={15}/>
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 px-3 pt-3 pb-1">
              {DAY_LABELS.map(d => (
                <div key={d} className="text-center text-[11px] font-extrabold tracking-widest text-gray-400 select-none">{d}</div>
              ))}
            </div>

            {/* Day grid — larger cells */}
            <div className="grid grid-cols-7 px-3 pb-2 gap-y-1">
              {cells.map((day, i) => (
                <div key={i} className="flex items-center justify-center h-10">
                  {day ? (
                    <button
                      type="button"
                      onClick={() => selectDay(day)}
                      className={`w-9 h-9 rounded-full text-sm font-semibold transition-all active:scale-90 select-none ${
                        isSel(day)
                          ? 'bg-sniffy-purple text-white shadow-md'
                          : isToday(day)
                          ? 'bg-sniffy-yellow/20 text-sniffy-purple ring-2 ring-sniffy-yellow font-extrabold'
                          : 'text-gray-700 hover:bg-purple-50 hover:text-sniffy-purple'
                      }`}
                    >
                      {day}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Today shortcut — yellow accent */}
            <div className="px-3 pb-3 pt-1 border-t border-gray-100">
              <button type="button" onClick={goToday}
                className="w-full py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all active:scale-[0.98]"
                style={{ background: 'rgba(246,172,10,0.12)', color: '#92700a' }}
              >
                ✦ Today — {today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sniffy Time Picker ───────────────────────────────────────

function fmt24to12(t: string): string {
  const [hStr, mStr] = t.split(':');
  const h    = parseInt(hStr);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${mStr} ${ampm}`;
}

// Hour pools — 7 AM → 11 PM
const AM_HOURS = [7, 8, 9, 10, 11];
const PM_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function SniffyTimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef         = useRef<HTMLDivElement>(null);

  // Derive pending state from current value
  const initFromValue = (v: string) => {
    if (!v) return { ampm: 'AM' as 'AM'|'PM', hour: null as number|null };
    const h24 = parseInt(v.split(':')[0]);
    return { ampm: (h24 >= 12 ? 'PM' : 'AM') as 'AM'|'PM', hour: h24 % 12 || 12 };
  };

  const [pendingAmpm, setPendingAmpm] = useState<'AM'|'PM'>(() => initFromValue(value).ampm);
  const [pendingHour, setPendingHour] = useState<number|null>(() => initFromValue(value).hour);

  // Sync when Quick Fill sets a value externally
  useEffect(() => {
    const { ampm, hour } = initFromValue(value);
    setPendingAmpm(ampm);
    setPendingHour(hour);
  }, [value]);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [open]);

  function selectMinute(min: 0 | 30) {
    if (pendingHour === null) return;   // must pick hour first
    let h24 = pendingHour % 12;
    if (pendingAmpm === 'PM') h24 += 12;
    onChange(`${String(h24).padStart(2,'0')}:${min === 0 ? '00' : '30'}`);
    setOpen(false);
  }

  function handleAmpmChange(ap: 'AM'|'PM') {
    setPendingAmpm(ap);
    setPendingHour(null);              // reset hour when switching AM/PM
  }

  const displayLabel = value ? fmt24to12(value) : '';
  const hourPool     = pendingAmpm === 'AM' ? AM_HOURS : PM_HOURS;
  const curMin       = value ? parseInt(value.split(':')[1]) : null;

  return (
    <div className="relative" ref={wrapRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`${inputCls} flex items-center justify-between gap-2 text-left transition-all ${
          open ? 'border-sniffy-purple ring-1 ring-sniffy-purple/20' : ''
        }`}
      >
        <span className={displayLabel ? 'text-gray-800 font-medium' : 'text-gray-300'}>
          {displayLabel || 'Pick a time'}
        </span>
        <Clock size={15} className={`flex-shrink-0 transition-colors ${open ? 'text-sniffy-purple' : 'text-gray-400'}`}/>
      </button>

      {/* Two-tap picker: AM/PM → Hour → Minute */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit   ={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-[60] top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header — shows live preview */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-sniffy-purple to-purple-800">
              <span className="text-sm font-extrabold text-white">
                {pendingHour
                  ? `${pendingHour}:__ ${pendingAmpm}`
                  : <span className="text-white/60 font-medium text-xs">Pick hour then minute</span>
                }
              </span>
              {value && (
                <button type="button"
                  onClick={() => { onChange(''); setPendingHour(null); setOpen(false); }}
                  className="text-[11px] font-bold text-white/60 hover:text-white transition">
                  Clear ✕
                </button>
              )}
            </div>

            <div className="p-3 space-y-3">

              {/* ① AM / PM toggle */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl">
                {(['AM','PM'] as const).map(ap => (
                  <button key={ap} type="button"
                    onClick={() => handleAmpmChange(ap)}
                    className={`py-2 rounded-[10px] text-xs font-extrabold tracking-widest transition-all ${
                      pendingAmpm === ap
                        ? 'bg-sniffy-purple text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}>
                    {ap}
                  </button>
                ))}
              </div>

              {/* ② Hour grid */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5 ml-0.5">Hour</p>
                <div className="flex flex-wrap gap-1.5">
                  {hourPool.map(h => {
                    const isActive = pendingHour === h;
                    // Check if this hour + current minute matches the committed value
                    const isCommitted = (() => {
                      if (!value || !isActive) return false;
                      const h24committed = parseInt(value.split(':')[0]);
                      const h24pending   = (h % 12) + (pendingAmpm === 'PM' ? 12 : 0);
                      return h24committed === h24pending;
                    })();
                    return (
                      <button key={h} type="button"
                        onClick={() => setPendingHour(h)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all active:scale-90 ${
                          isActive
                            ? 'bg-sniffy-purple text-white shadow-sm'
                            : isCommitted
                            ? 'bg-purple-100 text-sniffy-purple ring-1 ring-sniffy-purple/30'
                            : 'bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-sniffy-purple'
                        }`}>
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ③ Minute — two big tap targets */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5 ml-0.5">Minute</p>
                <div className="grid grid-cols-2 gap-2">
                  {([0, 30] as const).map(min => {
                    const isActive = pendingHour !== null && (() => {
                      if (!value) return false;
                      const h24v = parseInt(value.split(':')[0]);
                      const mV   = parseInt(value.split(':')[1]);
                      const h24p = (pendingHour % 12) + (pendingAmpm === 'PM' ? 12 : 0);
                      return h24v === h24p && mV === min;
                    })();
                    const disabled = pendingHour === null;
                    return (
                      <button key={min} type="button"
                        disabled={disabled}
                        onClick={() => selectMinute(min)}
                        className={`py-3 rounded-xl text-sm font-extrabold transition-all active:scale-95 ${
                          isActive
                            ? 'bg-sniffy-yellow text-amber-900 shadow-sm'
                            : disabled
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-700 hover:bg-sniffy-yellow/20 hover:text-amber-800'
                        }`}>
                        :{min === 0 ? '00' : '30'}
                      </button>
                    );
                  })}
                </div>
                {pendingHour === null && (
                  <p className="text-[10px] text-gray-400 mt-1.5 text-center">Select an hour first</p>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickFillPanel({ onFill }: { onFill: (parsed: ParsedSession) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [filled, setFilled] = useState(false);

  function handleApply() {
    if (!text.trim()) return;
    const parsed = parseWhatsApp(text);
    onFill(parsed);
    setFilled(true);
    setTimeout(() => { setOpen(false); setText(''); setFilled(false); }, 800);
  }

  // When closed, the wrapper sizes to the trigger button (so the
  // sibling "Screenshot Fill" pill can sit next to it on the same
  // row).  When open, the wrapper takes the full row width and the
  // amber paste panel underneath inherits that — which fixes the
  // ragged white gap on the right when Quick Fill was expanded
  // inside the parent's `flex flex-wrap` row.
  return (
    <div className={open ? 'w-full' : ''}>
      {/* Trigger button — lives in the header area */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
          open
            ? 'bg-amber-500 text-white border-amber-500'
            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
        }`}
      >
        <Zap size={13} className={open ? 'text-white' : 'text-amber-500'}/>
        Quick Fill
        {open ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
      </button>

      {/* Expandable paste area */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <p className="text-[11px] text-amber-700 font-semibold">
                Paste a message and press Enter ↵ or tap Fill
              </p>
              <textarea
                autoFocus
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={"Dear Pet Parent,\nName : Rahul\nPhone : 9876543210\nBreed: Golden Retriever\n..."}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleApply(); }}
                className="w-full h-28 resize-none border border-amber-300 rounded-xl px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-300/40 placeholder:text-gray-300"
              />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setOpen(false); setText(''); }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-500 hover:bg-amber-100 transition">
                  Cancel
                </button>
                <button type="button" onClick={handleApply}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filled ? 'bg-green-500 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}>
                  {filled ? <><CheckCircle2 size={12}/> Filled!</> : <><Zap size={12}/> Fill Form</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Screenshot Fill panel (AI vision via Edge Function) ─────
//
// Sibling to QuickFillPanel.  Where Quick Fill takes pasted WhatsApp
// text, this takes a screenshot of an external-booking app (Woofly,
// Paw Space, etc.) and ships it to the `parse-booking-screenshot`
// Edge Function, which calls Gemini Flash and returns the same
// `ParsedSession` shape — so we can reuse `onFill` (a.k.a.
// applyQuickFill) with zero modification.
//
// Why two buttons instead of one combined "AI" entry:
//   • Screenshot Fill is the higher-cost path (1 API call per use).
//   • Quick Fill is free + instant — keeping it visible nudges
//     coordinators to use it for WhatsApp messages they already have.
function ScreenshotFillPanel({ onFill }: { onFill: (parsed: ParsedSession) => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [filled,  setFilled]  = useState(false);

  async function handlePick(file: File | null) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const res = await parseBookingScreenshot(file);
      if (!res.ok || !res.data) {
        throw new Error(res.error ?? 'Could not read that screenshot.');
      }
      // Push to the form via the same reducer that powers WhatsApp Quick
      // Fill — the shapes overlap perfectly.
      onFill(res.data);
      setFilled(true);
      setTimeout(() => setFilled(false), 1600);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Screenshot parsing failed.');
    } finally {
      setBusy(false);
      // Reset the input so the same file can be picked again (browsers
      // suppress the change event when the value is unchanged).
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handlePick(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => !busy && fileInputRef.current?.click()}
        disabled={busy}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
          filled
            ? 'bg-green-500 text-white border-green-500'
            : busy
              ? 'bg-sniffy-purple/10 text-sniffy-purple border-sniffy-purple/30 cursor-wait'
              : 'bg-sniffy-purple/10 text-sniffy-purple border-sniffy-purple/30 hover:bg-sniffy-purple/20'
        }`}
      >
        {filled
          ? <><CheckCircle2 size={13}/> Filled!</>
          : busy
            ? <><Loader2 size={13} className="animate-spin"/> Reading…</>
            : <><Sparkles size={13}/> Screenshot Fill <ImageUp size={12}/></>}
      </button>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 flex items-start gap-1.5 text-[11px] text-red-600 font-semibold"
          >
            <AlertCircle size={12} className="mt-0.5 shrink-0"/>
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editSession?: GroomingSession | null;
  prefill?: Partial<GroomingSession> | null;
  /** When set, opens the modal in "add new session" mode but pre-fills
   *  customer / pet / package / source / financial fields from this
   *  existing session.  Date resets to today, scheduled_time clears,
   *  status defaults to 'scheduled', and the groomer is left unassigned
   *  — so the coordinator can quickly spin up a follow-up session for a
   *  recurring customer without retyping their details. */
  copyFromSession?: Partial<GroomingSession> | null;
  /** When provided, enables the Session Chat panel (coordinator view). */
  currentUser?: AdminUser | null;
}

export default function SessionFormModal({ open, onClose, onSaved, editSession, prefill, copyFromSession, currentUser }: Props) {
  const [form, setForm]             = useState<FormData>(EMPTY);
  const [groomers, setGroomers]     = useState<Groomer[]>([]);
  // Optional helper who accompanies the groomer. `helperTouched` keeps `helper_id` out of the
  // save payload until the coordinator actually changes it (so saves work before the column exists).
  const [helpers, setHelpers]       = useState<{ id: string; name: string; phone: string }[]>([]);
  const [helperId, setHelperId]     = useState<string | null>(null);
  const [helperTouched, setHelperTouched] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [done, setDone]             = useState(false);
  const [groomerOnTime, setGroomerOnTime]           = useState(false);
  const [externalSourceName, setExternalSourceName] = useState('');

  // ── Payment state ──────────────────────────────────────────
  // Lives outside `form` because it's driven by the pill in the
  // modal header, not a regular field.  Status cycles UNPAID ↔ PAID
  // (the COLLECTED state can only be reached via the groomer flow's
  // `payment_collected_at` mark — the coordinator pill skips it).
  //
  // Mode is independently editable when status ≠ unpaid via Cash /
  // Online pills near the financials section; required to save when
  // marking PAID (so we can record what kind of money came in).
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [paymentMode,   setPaymentMode]   = useState<PaymentMode | null>(null);

  // Who collected the cash — defaults from source_type ('vendor' for
  // external, 'sniffy' for internal) but the coordinator can override
  // per session when the default is wrong (e.g. a Woofly booking the
  // customer ended up paying Sniffy at the door).  See the payment
  // section below for the picker UI and the save effect for the
  // branching logic (vendor path stamps vendor_settled_at, sniffy/
  // groomer_cash path stamps payment_collected_at).
  //
  // `collectedByTouched` tracks whether the coordinator has explicitly
  // picked a value; while false, source_type changes can update the
  // default freely.  Once they've picked, we stop auto-defaulting so
  // their choice isn't silently overwritten.
  const [paymentCollectedBy, setPaymentCollectedBy] = useState<PaymentCollectedBy>('sniffy');
  const [collectedByTouched, setCollectedByTouched] = useState(false);

  // UI-only platform-fee % for external sources.  Seeded from
  // EXTERNAL_SOURCE_FEE_RULE whenever the coordinator picks an external
  // source — but the field is editable, so a coordinator can override
  // the rate for a one-off deal.  Set null for internal sources or
  // 'other' (manual ₹ entry).
  //
  // `platformPctSource` tells the recompute effect *how* to use the %:
  //   • 'rule'   — apply the source's structured rule (compound math
  //                for Woofly, flat for the rest)
  //   • 'manual' — user typed a custom %, so use flat amount × pct/100
  //                regardless of what the source's rule says.  The
  //                breakdown caption switches to "Manual override".
  const [platformPct,       setPlatformPct]       = useState<number | null>(null);
  const [platformPctSource, setPlatformPctSource] = useState<'rule' | 'manual'>('rule');

  // ── Phase 1: customer autocomplete + multi-pet state ──
  //
  // `phoneSuggestions` is the typeahead dropdown content; it populates
  // as the coordinator types in the Phone field (debounced).  Picking a
  // suggestion pre-fills name/address/gps + loads the customer's
  // existing pets so the form can offer to apply them to this session.
  //
  // `extraPets` covers the multi-pet scenario: a single session can
  // legitimately cover multiple animals (cat + dog in one visit).  The
  // form's session-level pet_type/breed/pet_age represent pet #1; this
  // array represents pets #2+.  All pets are reconciled via
  // syncSessionPets after the main session row is saved.
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [phoneSuggestions, setPhoneSuggestions] = useState<Customer[]>([]);
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);
  const [matchedPets, setMatchedPets] = useState<Pet[]>([]);
  // Normalized phone the lookup below confirmed has zero prior sessions
  // (any source) — distinct from `matchedCustomer` being null, which is
  // also true while the phone is still short/unchecked. Drives the "New"
  // pill so it only fires once a full number has actually been checked.
  const [confirmedNewPhone, setConfirmedNewPhone] = useState<string | null>(null);
  const [extraPets, setExtraPets] = useState<ExtraPetDraft[]>([]);
  // Per-pet pricing (multi-pet sessions).  `booking_amount_expr` is PET #1's
  // amount; the session total (`booking_amount`) = pet #1 + every extra pet.
  //
  // `combinedTotal` is the backward-compat switch: a multi-pet session saved
  // before per-pet pricing existed only has a combined total, so we leave
  // that total exactly as stored (and hide the per-pet price boxes) until
  // the coordinator chooses "Price each pet separately".
  const [combinedTotal, setCombinedTotal] = useState(false);
  // pets.id (+ identity at load time) of pet #1 on an edit, so saving
  // re-uses the same pets row instead of re-matching by breed.
  const [primaryPet, setPrimaryPet] = useState<{ id: string | null; origin: PetOrigin | null }>({ id: null, origin: null });
  const hadExtrasRef = useRef(false);
  // Which pet cards have their add-on picker expanded (collapsed by default —
  // only ~10% of visits have add-ons).
  const [openAddOns, setOpenAddOns] = useState<Record<string, boolean>>({});
  // Id of a session we just INSERTED in this modal.  If the follow-up pet
  // sync fails the modal stays open; this makes the retry an UPDATE of that
  // row instead of inserting a duplicate session.
  const savedIdRef = useRef<string | null>(null);

  // Duplicate-warning state.  When the pre-save check finds another
  // session with the same (normalised) pet-parent name within ±7 days,
  // we surface those rows here and the warning modal mounts.
  const [dupOpen, setDupOpen]       = useState(false);
  const [dupMatches, setDupMatches] = useState<DuplicateMatch[]>([]);

  // While this full-screen modal is open, repaint the Android status
  // bar white so it blends with the modal's white sheet (avoids the
  // purple "leakage" band that shows up against a purple theme-color).
  // No-op on iOS.
  useModalTakesOverStatusBar(open);

  useEffect(() => {
    // Fetch ALL groomers (not just active) so Quick Fill can resolve
    // against historical assignments too — a coordinator may paste a
    // message naming a groomer who's currently on leave or marked
    // inactive.  The dropdown still filters to active + currently
    // selected (see render block), so the UI stays clean.
    supabase.from('groomers').select('id,name,phone,status').order('name')
      .then(({ data }) => setGroomers((data ?? []) as Groomer[]));
    supabase.from('helpers').select('id,name,phone').eq('is_active', true).order('name')
      .then(({ data }) => setHelpers((data ?? []) as { id: string; name: string; phone: string }[]));
  }, []);

  useEffect(() => {
    if (!open) return;
    setHelperId(editSession?.helper_id ?? null);
    setHelperTouched(false);
  }, [open, editSession?.id]);

  // ─── Auto-resolve groomer_id from name/phone ────────────────
  // Quick Fill (and legacy session rows) can carry a groomer name +
  // phone without an id.  This effect bridges that gap — whenever
  // groomers loads OR the form's groomer name/phone changes, we try
  // to match against the loaded groomers and stamp the id so the
  // Assign dropdown lights up.
  //
  // Why a separate effect instead of doing it inline in
  // applyQuickFill:
  //   • Race condition: coordinators can click "Fill" before the
  //     groomers SELECT returns.  applyQuickFill sees an empty
  //     `groomers` array and skips the lookup — leaving the
  //     dropdown stuck on "Select" even though the phone is
  //     populated.  This effect re-runs once `groomers` arrives.
  //   • Legacy data: rows that pre-date the groomer_id column
  //     auto-link the moment the modal opens.
  //   • Manual edits: if the coordinator types a known groomer's
  //     phone or name into the field, we pick it up automatically.
  //
  // Guarded by `groomer_id` being null — we never overwrite an
  // explicit dropdown selection.
  useEffect(() => {
    if (form.groomer_id) return;
    if (!groomers.length) return;
    if (!form.groomer_phone && !form.groomer_name) return;

    const wantPhone = (form.groomer_phone || '').replace(/\D/g, '').slice(-10);
    const wantName  = (form.groomer_name  || '').toLowerCase().trim();

    const wantNameFuzz = fuzz(wantName);
    const wantTok      = wantName.split(/\s+/)[0] || '';
    const wantTokFuzz  = fuzz(wantTok);

    const matchG = groomers.find(g => {
      // 1. Phone — strongest signal, exact last-10-digits match.
      const gPhone = (g.phone || '').replace(/\D/g, '').slice(-10);
      if (wantPhone && gPhone && wantPhone === gPhone) return true;

      if (!wantName) return false;

      const gName     = g.name.toLowerCase().trim();
      const gNameFuzz = fuzz(gName);
      const gTok      = gName.split(/\s+/)[0] || '';
      const gTokFuzz  = fuzz(gTok);

      // 2. Exact name match (raw or after dedup).
      if (gName === wantName)          return true;
      if (gNameFuzz === wantNameFuzz)  return true;

      // 3. First-token match (raw or after dedup) — handles
      //    "Sidharth Nanda" in DB vs "Siddharth" in message.
      if (wantTok && gTok) {
        if (wantTok === gTok)                                return true;
        if (wantTokFuzz && wantTokFuzz === gTokFuzz)         return true;

        // 4. Substring match either direction.
        if (wantTok.length >= 3 && gName.includes(wantTok))  return true;
        if (gTok.length >= 3    && wantName.includes(gTok))  return true;
        // Same again on the deduped forms — catches "Karann" inside
        // "Karan Singh".
        if (wantTokFuzz.length >= 3 && gNameFuzz.includes(wantTokFuzz)) return true;
        if (gTokFuzz.length >= 3    && wantNameFuzz.includes(gTokFuzz)) return true;

        // 5. Edit-distance fallback — tolerates 1 substitution / 2
        //    edits for tokens ≥ 5 chars.  Catches "Hemant" vs
        //    "Hemanth", "Rohan" vs "Rohit" (rejected — distance 2 on
        //    a 5-char token is borderline; we accept only on the
        //    deduped form to avoid false positives).
        if (wantTokFuzz.length >= 5 && gTokFuzz.length >= 5) {
          const dist = editDistance(wantTokFuzz, gTokFuzz);
          if (dist <= 1) return true;
        }
      }
      return false;
    });

    if (matchG) {
      setForm(prev => ({
        ...prev,
        groomer_id:    matchG.id,
        groomer_name:  matchG.name,
        groomer_phone: matchG.phone,
        ...(prev.status === 'lead' || prev.status === 'scheduled'
            ? { status: 'groomer_assigned' as SessionStatus }
            : {}),
      }));
    }
  }, [groomers, form.groomer_phone, form.groomer_name, form.groomer_id]);

  // Phase 1 — phone-field typeahead.  Debounced 250ms so we don't
  // flood Supabase as the coordinator types.  Skipped when the field is
  // shorter than 3 digits — search would be too noisy.  Skipped on
  // edits to existing sessions when the phone matches the loaded
  // value (we already know who this is).
  useEffect(() => {
    const raw = form.phone ?? '';
    const t = setTimeout(async () => {
      if (raw.length < 3) { setPhoneSuggestions([]); return; }
      const results = await searchCustomersByPhone(raw);
      setPhoneSuggestions(results);
    }, 250);
    return () => clearTimeout(t);
  }, [form.phone]);

  // Phase 2a — auto-detect existing customer when the phone is a full
  // 10+ digit value.  This fires for edit-mode loads and for booking-
  // convert pre-fills (where the phone arrives populated and the
  // coordinator never types it), so the "Returning · N×" pill and the
  // pet-roster chips appear without requiring a click on the dropdown.
  // Debounced 400ms (slower than the typeahead) since this is an exact
  // lookup, not a guess.  Skips when the phone hasn't normalised to a
  // valid E.164 form yet.
  useEffect(() => {
    const raw = form.phone ?? '';
    const norm = normalizePhone(raw);
    // Skip when phone is too short / unparseable, or already matches
    // the currently-tracked customer (saves a query on every keystroke).
    if (!norm || norm.length < 6) return;
    if (matchedCustomer && matchedCustomer.phone === norm) return;
    const t = setTimeout(async () => {
      const c = await findCustomerByPhone(raw);
      if (!c) {
        // Only a full number counts as a confirmed "no prior session" —
        // a short/partial number just hasn't been checked yet.
        if (norm.length === 13) setConfirmedNewPhone(norm);
        return;
      }
      setMatchedCustomer(c);
      const pets = await fetchPetsForCustomer(c.id);
      setMatchedPets(pets);
    }, 400);
    return () => clearTimeout(t);
  }, [form.phone, matchedCustomer]);

  // Phase 1 — on edit, load this session's existing session_pets so the
  // multi-pet UI mirrors the saved state.  We skip the FIRST pet (it's
  // represented by the session-level pet_type/breed/pet_age fields) and
  // surface the rest as extraPets.
  useEffect(() => {
    if (!open || !editSession?.id) return;
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from('session_pets')
        .select('pet_id, is_primary, sort_order, created_at, per_pet_package, per_pet_amount, per_pet_addons, per_pet_amount_expr, pets(name, type, breed, age_bucket, medical)')
        .eq('session_id', editSession.id);
      if (cancelled || err || !data) return;
      // Pure derivation (see sessionPets.ts): handles old sessions with no
      // per-pet data ("combined" mode), itemised sessions, and a session
      // total that no longer matches the per-pet amounts.
      const st = deriveLoadState(
        { pet_type: editSession.pet_type, breed: editSession.breed, booking_amount: editSession.booking_amount },
        data as unknown as LoadedSessionPetRow[],
      );
      setExtraPets(st.extras);
      setCombinedTotal(st.combined);
      setPrimaryPet({ id: st.primaryPetId, origin: st.primaryOrigin });
      if (st.primaryExpr !== null) {
        const expr = st.primaryExpr;
        setForm(prev => ({ ...prev, booking_amount_expr: expr }));
      }
    })();
    return () => { cancelled = true; };
  }, [open, editSession?.id]);

  useEffect(() => {
    // Pick the right platform-fee % to display when loading data:
    //   • For an existing row, DERIVE % from amount + commission so we
    //     never overwrite a saved override.  If the derived % matches
    //     the source's rule (within rounding), treat it as rule-driven
    //     so the breakdown caption stays informative; otherwise mark
    //     it 'manual'.
    //   • For an empty row, seed from the source's rule.
    //   • Internal / 'other' / no-amount → null (manual ₹ entry).
    function initPlatformPctFromLoaded(
      source_type: SourceType, source: BookingSource,
      booking_amount: number, platform_commission: number,
    ) {
      if (source_type !== 'external') {
        setPlatformPct(null); setPlatformPctSource('rule'); return;
      }
      const rule = EXTERNAL_SOURCE_FEE_RULE[source as string];
      if (booking_amount > 0 && platform_commission > 0) {
        const derived = Math.round((platform_commission / booking_amount) * 10000) / 100;
        setPlatformPct(derived);
        // If the saved commission matches what the rule would have
        // computed (±₹1 to absorb rounding), treat it as rule-driven.
        if (rule && Math.abs(commissionFor(rule, booking_amount) - platform_commission) <= 1) {
          setPlatformPctSource('rule');
        } else {
          setPlatformPctSource('manual');
        }
        return;
      }
      if (rule) {
        setPlatformPct(effectivePct(rule));
        setPlatformPctSource('rule');
      } else {
        setPlatformPct(null);
        setPlatformPctSource('rule');
      }
    }

    if (editSession) {
      const { id: _i, net_booking_amount: _n, discount_amount: _da, created_at: _c, ...rest } = editSession;
      // Normalise source_type from `source` on load.  Older rows may
      // have a NULL source_type, or one that drifted out of sync with
      // `source` (e.g. an external Woofly row saved with
      // source_type='internal' before the defensive sync in `set()`
      // existed).  Without this, the Internal/External segmented tab
      // fails to highlight on edit — neither button's strict equality
      // check matches a missing/mismatched value, so both render as
      // unselected even though the source pill below is correct.
      const normalisedSourceType: SourceType =
        isExternalSource(rest.source) ? 'external' : 'internal';
      // IMPORTANT: hydrate the canonical incentive toggles from the
      // saved row.  `review_taken` lives in form state; `groomer_on_time`
      // lives in `groomerOnTime` local state (it's omitted from FormData
      // since the modal historically didn't edit it).  Both ARE source
      // of truth — see groomer/incentivesApi.ts — so failing to seed
      // them here causes saves to silently flip both back to false.
      setForm({
        ...rest,
        source_type: normalisedSourceType,
        add_ons: rest.add_ons ?? [],
        review_taken: rest.review_taken === true,
        // `booking_amount_expr` isn't a DB column, so a loaded row never has
        // one — without this the Booking ₹ box opened blank and toggling an
        // add-on rebuilt the amount from nothing.
        booking_amount_expr: Number(rest.booking_amount) ? String(Number(rest.booking_amount)) : '',
      });
      setError(''); setDone(false);
      setGroomerOnTime(rest.groomer_on_time === true);
      // Restore the free-text name for external "Other" rows so it
      // doesn't disappear when re-opening the modal.
      setExternalSourceName(
        normalisedSourceType === 'external' && rest.source === 'other'
          ? (rest.external_source_name ?? '')
          : '',
      );
      initPlatformPctFromLoaded(normalisedSourceType, rest.source, Number(rest.booking_amount) || 0, Number(rest.platform_commission) || 0);
      // Seed payment status + mode from the loaded row.
      setPaymentStatus(
        rest.payment_verified
          ? 'paid'
          : rest.payment_collected_at
            ? 'collected'
            : 'unpaid',
      );
      setPaymentMode((rest.payment_mode ?? null) as PaymentMode | null);
      // Seed collector from the saved row, falling back to the
      // source-type default for old rows that pre-date this column.
      // Treat the load as "touched" so source edits inside the modal
      // don't silently overwrite what was on disk.
      setPaymentCollectedBy(
        (rest.payment_collected_by as PaymentCollectedBy | null | undefined)
          ?? defaultCollectedBy(rest.source_type),
      );
      setCollectedByTouched(true);
    } else if (copyFromSession) {
      // ── "Create a copy" path ─────────────────────────────────
      // Carry over customer / pet / package / financial fields from the
      // source session but RESET anything that should be fresh on the
      // new appointment:
      //   • session_date  → today
      //   • scheduled_time → blank (coordinator must pick)
      //   • status        → 'scheduled' (sensible default for a recurring
      //                     customer — the original may have been
      //                     completed/cancelled/etc.)
      //   • groomer_*     → cleared (re-assign at booking time)
      //   • next_due_*    → cleared (the old session's follow-up date is
      //                     no longer relevant)
      //   • review fields → cleared (new session, no review yet)
      //   • payment       → unpaid (new session hasn't been paid)
      //   • source        → reset to internal / Direct Call.  A copy is
      //                     by definition a Sniffy-direct repeat booking
      //                     (the customer reached out to us, not the
      //                     vendor again).  Copying an external source
      //                     like Woofly would (a) misattribute the
      //                     booking and (b) pull in vendor-style fee
      //                     math + payment-collected-by-vendor defaults
      //                     that don't apply.  We also zero the
      //                     platform/groomer commissions for the same
      //                     reason — they'll be recomputed for the new
      //                     groomer assignment under Sniffy-internal rules.
      // We strip server-managed / milestone fields out of the payload too
      // so they don't accidentally bleed into the new form via spread.
      const {
        id: _i, net_booking_amount: _n, total_collected: _tc,
        created_at: _c, updated_at: _u,
        session_date: _sd, scheduled_time: _st,
        status: _stat, is_converted: _ic,
        groomer_id: _gid, groomer_name: _gn, groomer_phone: _gp,
        source_type: _srt, source: _src,
        external_source_name: _esn,
        platform_commission: _plc, groomer_commission: _grc,
        // A copy is a fresh booking — the discount the coordinator gave
        // on the original session doesn't automatically apply again.
        discount_type: _dt, discount_value: _dv, discount_amount: _da,
        next_due_days: _nd, next_due_date: _ndd,
        review_taken: _rt, client_rating: _cr,
        arrival_marked_at: _am, arrival_selfie_url: _as,
        arrival_bonus_status: _abs, arrival_bonus_approved_by: _aab,
        arrival_bonus_approved_at: _aaa, arrival_bonus_rejected_note: _abr,
        groomer_on_time: _gt,
        groomer_marked_complete_at: _gmc,
        payment_collected_at: _pca, payment_mode: _pm, payment_notes: _pn,
        upsell_amount: _ua, tip_amount: _ta,
        payment_verified: _pv, payment_verified_at: _pva, payment_verified_by: _pvb,
        payment_collected_by: _pcb, vendor_settled_at: _vs,
        review_proof_url: _rpu, review_claim_at: _rca, review_claim_rating: _rcr,
        review_claim_status: _rcs, review_claim_approved_by: _rcab,
        review_claim_approved_at: _rcaa, review_claim_rejected_note: _rcrn,
        client_review: _clr,
        completion_code: _cc, completion_photo_url: _cpu, completion_method: _cm,
        ...carryOver
      } = copyFromSession as Partial<GroomingSession>;

      const pkg = PACKAGES.find(p => p.label === carryOver.package);
      const pkgPrice = pkg?.price ?? 0;
      const addOns = carryOver.add_ons ?? [];
      const addOnTotal = addOns.reduce((sum, a) => sum + (ADD_ONS.find(x => x.label === a)?.price ?? 0), 0);
      // No package on the source row → fall back to its plain amount.
      // `booking_amount_expr` is NOT a grooming_sessions column (it's a
      // client-only field on the type), so a copied DB row never carries
      // one and the old fallback always resolved to ''. That left the
      // Booking ₹ box visibly empty on package-less rows while
      // `booking_amount` silently kept the original value and Net showed
      // it — the coordinator saw a blank amount they hadn't cleared.
      const newExpr = pkgPrice
        ? addOnTotal ? `${pkgPrice}+${addOnTotal}` : `${pkgPrice}`
        : (carryOver.booking_amount ? String(carryOver.booking_amount) : '');

      const merged: FormData = {
        ...EMPTY,
        ...carryOver,
        session_date:        new Date().toISOString().slice(0, 10),
        scheduled_time:      '',
        status:              'scheduled',
        is_converted:        false,
        // Reset booking source → Sniffy internal / Direct Call so the
        // new session uses Sniffy's own commission math instead of any
        // vendor (Woofly etc.) fee rules from the original row.
        source_type:         'internal',
        source:              'direct_call',
        platform_commission: 0,
        groomer_commission:  0,
        groomer_id:          null,
        groomer_name:        '',
        groomer_phone:       '',
        next_due_days:       null,
        next_due_date:       null,
        review_taken:        false,
        client_rating:       null,
        add_ons:             addOns,
        booking_amount_expr: newExpr,
        booking_amount:      newExpr ? evalExpr(newExpr) : (carryOver.booking_amount ?? 0),
      };
      setForm(merged);
      setError(''); setDone(false);
      setGroomerOnTime(false); setExternalSourceName('');
      initPlatformPctFromLoaded(merged.source_type, merged.source, Number(merged.booking_amount) || 0, Number(merged.platform_commission) || 0);
      setPaymentStatus('unpaid');
      setPaymentMode(null);
      // Default collector from the carried-over source_type; leave
      // touched=false so a subsequent source switch still updates the
      // default just like the empty-form path.
      setPaymentCollectedBy(defaultCollectedBy(merged.source_type));
      setCollectedByTouched(false);
    } else if (prefill) {
      const pkg = PACKAGES.find(p => p.label === prefill.package);
      const pkgPrice = pkg?.price ?? 0;
      const addOns = prefill.add_ons ?? [];
      const addOnTotal = addOns.reduce((sum, a) => sum + (ADD_ONS.find(x => x.label === a)?.price ?? 0), 0);
      const newExpr = pkgPrice ? addOnTotal ? `${pkgPrice}+${addOnTotal}` : `${pkgPrice}` : '';
      const merged = { ...EMPTY, ...prefill, add_ons: addOns, booking_amount_expr: newExpr, booking_amount: evalExpr(newExpr), review_taken: false };
      setForm(merged);
      setError(''); setDone(false);
      setGroomerOnTime(false); setExternalSourceName('');
      initPlatformPctFromLoaded(merged.source_type, merged.source, Number(merged.booking_amount) || 0, Number(merged.platform_commission) || 0);
      setPaymentStatus('unpaid');
      setPaymentMode(null);
      // Prefill comes from a website booking → internal/Sniffy.
      // Default the collector accordingly but leave touched=false so
      // a subsequent source switch still updates the default.
      setPaymentCollectedBy(defaultCollectedBy(merged.source_type));
      setCollectedByTouched(false);
    } else {
      setForm(EMPTY); setError(''); setDone(false);
      setGroomerOnTime(false); setExternalSourceName('');
      setPlatformPct(null);
      setPaymentStatus('unpaid');
      setPaymentMode(null);
      // Empty form starts internal/direct_call → 'sniffy'.
      setPaymentCollectedBy('sniffy');
      setCollectedByTouched(false);
    }
    // Phase 1 — reset multi-pet / matched-customer state on every (re)open
    // so a fresh modal never inherits the previous session's pets.
    setExtraPets([]);
    setCombinedTotal(false);
    setOpenAddOns({});
    setPrimaryPet({ id: null, origin: null });
    hadExtrasRef.current = false;
    savedIdRef.current = null;
    setMatchedCustomer(null);
    setMatchedPets([]);
    setPhoneSuggestions([]);
  }, [editSession, prefill, copyFromSession, open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // ─── Platform-fee auto-fill ────────────────────────────────
  //
  // The displayed % (platformPct) is wired in three ways:
  //   • set() seeds it from EXTERNAL_SOURCE_FEE_RULE when the
  //     coordinator picks an external source (user-driven change).
  //   • The editSession / prefill load effect below DERIVES it from
  //     the loaded amount + commission, so opening a saved session
  //     never clobbers a previously-overridden commission.
  //   • The Platform ₹ input keeps it in sync if the coordinator
  //     edits the ₹ amount directly.
  //
  // This effect ties booking_amount → platform_commission.  When the %
  // was seeded from the source's rule we run the structured math
  // (commissionFor — Woofly's 20% + 1% × 80% becomes 208 on a 1000
  // booking, not 210 from a flat 21%).  Once the coordinator types a
  // custom %, we fall back to flat math because their override has no
  // notion of "upfront vs residual".
  // Bails when values are already in sync so manual ₹ edits don't loop.
  useEffect(() => {
    if (form.source_type !== 'external' || platformPct === null) return;
    const amount = Number(form.booking_amount) || 0;

    const rule = EXTERNAL_SOURCE_FEE_RULE[form.source as string];
    const newCommission = (platformPctSource === 'rule' && rule)
      ? commissionFor(rule, amount)                  // structured (compound / flat)
      : Math.round((amount * platformPct) / 100);    // manual override → flat math

    setForm(prev =>
      prev.platform_commission === newCommission
        ? prev
        : { ...prev, platform_commission: newCommission },
    );
  }, [platformPct, platformPctSource, form.booking_amount, form.source_type, form.source]);

  // Keep the session total (`booking_amount`) = pet #1 + every extra pet.
  // Single-pet sessions are untouched (the amount handlers own the value);
  // "combined" legacy multi-pet sessions keep their stored total as-is.
  // Discount, vendor commission and incentives all read this one total.
  useEffect(() => {
    const multi = extraPets.length > 0;
    if (!multi && !hadExtrasRef.current) return;
    hadExtrasRef.current = multi;
    const total = computeSessionTotal({
      primaryExpr: form.booking_amount_expr ?? '', extras: extraPets, combined: combinedTotal,
    });
    setForm(prev => (Number(prev.booking_amount) === total ? prev : { ...prev, booking_amount: total }));
  }, [extraPets, combinedTotal, form.booking_amount_expr, form.booking_amount]);

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (k === 'next_due_days' || k === 'session_date') {
        next.next_due_date = calcNextDue(
          k === 'session_date' ? (v as string) : next.session_date,
          k === 'next_due_days' ? (v as number | null) : next.next_due_days,
        );
      }
      // Auto-advance status to "Scheduled" the moment the coordinator
      // picks a date or time — saves a manual trip to the Status
      // dropdown.  Only upgrades from 'lead' (the entry state); rows
      // that are already scheduled / groomer_assigned / completed /
      // cancelled are left alone so editing date/time on an existing
      // booking doesn't rewind its progress.
      //
      // The next step (Scheduled → Groomer Assigned) is handled inside
      // handleGroomer when a groomer is picked from the combobox.
      if ((k === 'session_date' || k === 'scheduled_time') && prev.status === 'lead' && v) {
        next.status = 'scheduled';
      }
      if (k === 'source_type') {
        next.source = v === 'internal' ? 'direct_call' : 'woofly' as BookingSource;
      }
      // Defensive: keep source_type in sync with source.  Without
      // this, a code path like applyQuickFill / ScreenshotFill that
      // sets `source` directly (without going through the tab pills)
      // could leave a Woofly row marked as source_type='internal' —
      // which then breaks the day-summary bucketing.
      if (k === 'source') {
        const newSource = v as BookingSource;
        const shouldBe: SourceType = isExternalSource(newSource) ? 'external' : 'internal';
        if (next.source_type !== shouldBe) next.source_type = shouldBe;
      }
      // Discount only applies to Sniffy-internal bookings — clear it the
      // moment a source change makes this session external, so a
      // previously-entered discount can't silently ride along on a
      // vendor booking after the coordinator switches the source pill.
      if (next.source_type === 'external' && next.discount_type) {
        next.discount_type = null;
        next.discount_value = 0;
      }
      return next;
    });
    // Platform-fee % auto-fill — fires only when the coordinator
    // actively changes the source / source_type pills (not on initial
    // load — the editSession effect handles that case).  Switching
    // source always resets to 'rule' so the structured math applies
    // again, even if the previous source was under a manual override.
    if (k === 'source' || k === 'source_type') {
      const nextSourceType: SourceType =
        k === 'source_type' ? (v as SourceType) : form.source_type;
      const nextSource: BookingSource =
        k === 'source' ? (v as BookingSource)
        : k === 'source_type'
          ? ((v as SourceType) === 'internal' ? 'direct_call' : 'woofly')
          : form.source;
      if (nextSourceType === 'external') {
        const rule = EXTERNAL_SOURCE_FEE_RULE[nextSource as string];
        setPlatformPct(rule ? effectivePct(rule) : null);
        setPlatformPctSource('rule');
      } else {
        setPlatformPct(null);
        setPlatformPctSource('rule');
      }
      // Auto-update collector default when the coordinator switches
      // source_type — external defaults to 'vendor', internal to
      // 'sniffy'.  Only when the picker hasn't been touched: once the
      // coordinator has explicitly chosen a collector, we respect
      // that choice across subsequent source edits.
      if (!collectedByTouched) {
        setPaymentCollectedBy(defaultCollectedBy(nextSourceType));
      }
      // If source switches to internal and vendor is selected (via a
      // prior touched choice), reset to 'sniffy' — vendor-prepaid is
      // not a valid option for internal sources.
      if (nextSourceType === 'internal' && paymentCollectedBy === 'vendor') {
        setPaymentCollectedBy('sniffy');
      }
    }
  }

  function handleGroomer(id: string) {
    const g = groomers.find(gr => gr.id === id);
    setForm(prev => {
      // Auto-sync status with the assignment action so the coordinator
      // doesn't have to touch the Status dropdown manually.
      //
      //   • Assigning  (id present)   — upgrade lead/scheduled → groomer_assigned
      //   • Clearing   (id empty)     — if currently groomer_assigned, revert
      //                                  to scheduled (date set) or lead (no date)
      //
      // In both directions we deliberately leave grooming_done /
      // completed / cancelled alone — the work either happened or the
      // row is closed, and neither fact is undone by editing who the
      // groomer was (covers the case where a coordinator re-opens an
      // old row to swap or remove a groomer record).  Note this is
      // enforced by the *narrow* conditions below, not by an explicit
      // exclusion list: only lead/scheduled are upgraded, and only
      // groomer_assigned is reverted.  Keep it that way — widening
      // either test would let a groomer swap knock a finished session
      // back to "upcoming".
      let nextStatus: SessionStatus | undefined;
      if (id) {
        if (prev.status === 'lead' || prev.status === 'scheduled') {
          nextStatus = 'groomer_assigned';
        }
      } else {
        if (prev.status === 'groomer_assigned') {
          nextStatus = prev.session_date ? 'scheduled' : 'lead';
        }
      }

      return {
        ...prev,
        groomer_id:    id || null,
        groomer_name:  g?.name ?? '',
        groomer_phone: g?.phone ?? '',
        ...(nextStatus ? { status: nextStatus } : {}),
      };
    });
  }

  function handleExprChange(raw: string) {
    setForm(prev => ({ ...prev, booking_amount_expr: raw, booking_amount: evalExpr(raw) }));
  }

  function toggleAddOn(label: string, price: number) {
    setForm(prev => {
      const existing = prev.add_ons ?? [];
      const has = existing.includes(label);
      const next_addons = has ? existing.filter(a => a !== label) : [...existing, label];
      const baseExpr = prev.booking_amount_expr ?? '';
      let newExpr: string;
      if (!has) {
        newExpr = baseExpr ? `${baseExpr}+${price}` : `${price}`;
      } else {
        newExpr = removeAddOnFromExpr(baseExpr, price);
      }
      return { ...prev, add_ons: next_addons, booking_amount_expr: newExpr, booking_amount: evalExpr(newExpr) };
    });
  }

  // Pet 1 package: same pricing rule as before (package price + add-ons).
  function setPet1Package(label: string) {
    const pkg = PACKAGES.find(p => p.label === label);
    if (pkg) {
      const addOnTotal = (form.add_ons ?? []).reduce((sum, a) => sum + (ADD_ONS.find(x => x.label === a)?.price ?? 0), 0);
      const newExpr = addOnTotal ? `${pkg.price}+${addOnTotal}` : `${pkg.price}`;
      setForm(prev => ({ ...prev, package: label, booking_amount_expr: newExpr, booking_amount: evalExpr(newExpr) }));
    } else { set('package', label); }
  }

  // ONE card layout used for every pet (Pet 1, Pet 2, Pet 3 …) so they always
  // look and behave the same.  Only the data wiring differs per pet.
  function renderPetCard(c: {
    key?: number; title: string; onRemove?: () => void;
    name: string; onName: (v: string) => void;
    type: 'dog' | 'cat'; onType: (t: 'dog' | 'cat') => void;
    breed: string; onBreed: (v: string) => void;
    age: string; onAge: (v: string) => void;
    pkg: string; onPkg: (v: string) => void;
    addOns: string[]; onToggleAddOn: (label: string, price: number) => void;
    medical: string; onMedical: (v: string) => void;
    amountExpr: string; onAmount: (v: string) => void;
    showPricing: boolean; showAmount: boolean;
  }) {
    return (
      <div key={c.key ?? 'pet1'} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">{c.title}</span>
          {c.onRemove && (
            <button type="button" onClick={c.onRemove} className="text-[11px] font-semibold text-red-500 hover:text-red-700">Remove</button>
          )}
        </div>

        {/* Row 1: type · age · name (all short) */}
        <div className="grid grid-cols-[0.85fr_1.1fr_1fr] gap-1.5">
          <div className="min-w-0">
            <Lbl>Type</Lbl>
            {/* One-tap dog / cat toggle — icon only to save space */}
            <div className="flex h-[42px] rounded-xl border border-gray-200 bg-white p-0.5 gap-0.5" role="group" aria-label="Pet type">
              {(['dog', 'cat'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={c.type === t}
                  aria-label={t === 'dog' ? 'Dog' : 'Cat'}
                  title={t === 'dog' ? 'Dog' : 'Cat'}
                  onClick={() => { if (c.type !== t) c.onType(t); }}
                  className={`flex-1 rounded-[10px] text-lg leading-none transition ${c.type === t ? 'bg-sniffy-purple shadow-sm' : 'opacity-40 hover:opacity-70'}`}
                >
                  {t === 'dog' ? '🐶' : '🐱'}
                </button>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <Lbl>Age</Lbl>
            <select value={c.age} onChange={e => c.onAge(e.target.value)} className={`${selectCls} !px-1.5 !text-[13px]`}>
              <option value="">Select</option>
              {AGE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="min-w-0">
            <Lbl>Pet Name</Lbl>
            <input type="text" className={`${inputCls} !px-2 !text-[13px]`} placeholder="e.g. Rex" value={c.name} onChange={e => c.onName(e.target.value)} />
          </div>
        </div>

        {/* Row 2: breed · package (longer names) */}
        <div className={c.showPricing ? 'grid grid-cols-2 gap-2' : ''}>
          <div className="min-w-0">
            <Lbl>Breed</Lbl>
            <select value={c.breed} onChange={e => c.onBreed(e.target.value)} className={selectCls}>
              <option value="">Select</option>
              {(c.type === 'dog' ? DOG_BREEDS : CAT_BREEDS).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          {c.showPricing && (
            <div className="min-w-0">
              <Lbl>Package</Lbl>
              {form.source_type === 'external' ? (
                /* External groomers don't share our pricing tiers — free text */
                <input type="text" className={inputCls} placeholder="e.g. Full Grooming…" value={c.pkg} onChange={e => c.onPkg(e.target.value)} />
              ) : (
                <select value={c.pkg} onChange={e => c.onPkg(e.target.value)} className={selectCls}>
                  <option value="">Select</option>
                  {PACKAGES.map(pk => <option key={pk.label} value={pk.label}>{pk.label} — ₹{pk.price}</option>)}
                </select>
              )}
            </div>
          )}
        </div>

        {c.showPricing && (
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Lbl>Add-ons</Lbl>
              {c.addOns.map(label => (
                <span key={label} className="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-purple-50 text-sniffy-purple border border-sniffy-purple/30">
                  {shortAddOn(label)}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setOpenAddOns(prev => ({ ...prev, [c.title]: !prev[c.title] }))}
                className="ml-auto text-[11px] font-semibold text-sniffy-purple hover:text-purple-800"
              >
                {openAddOns[c.title] ? 'Hide' : c.addOns.length ? 'Edit' : '+ Add'}
              </button>
            </div>
            {openAddOns[c.title] && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {ADD_ONS.map(ao => {
                  const on = c.addOns.includes(ao.label);
                  return (
                    <button
                      key={ao.label}
                      type="button"
                      title={ao.label}
                      onClick={() => c.onToggleAddOn(ao.label, ao.price)}
                      className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border transition ${on ? 'bg-purple-50 text-sniffy-purple border-sniffy-purple/40' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                    >
                      {on ? '✓ ' : ''}{shortAddOn(ao.label)} ₹{ao.price}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Medical issues — collapsed unless there is a note (few pets have one). */}
        <div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Lbl>Medical Issues</Lbl>
            {c.medical.trim() && !openAddOns[`${c.title}:med`] && (
              <span className="min-w-0 truncate text-[10px] font-semibold rounded-full px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200">
                {c.medical.trim()}
              </span>
            )}
            <button
              type="button"
              onClick={() => setOpenAddOns(prev => ({ ...prev, [`${c.title}:med`]: !prev[`${c.title}:med`] }))}
              className="ml-auto shrink-0 text-[11px] font-semibold text-sniffy-purple hover:text-purple-800"
            >
              {openAddOns[`${c.title}:med`] ? 'Hide' : c.medical.trim() ? 'Edit' : '+ Add'}
            </button>
          </div>
          {openAddOns[`${c.title}:med`] && (
            <div className="mt-1.5">
              <AutoTextarea value={c.medical} onChange={c.onMedical} placeholder="e.g. skin allergy, sensitive ears — or 'None'" />
            </div>
          )}
        </div>

        {c.showAmount && (
          <div>
            <Lbl>Amount ₹</Lbl>
            <input type="text" inputMode="decimal" className={inputCls} placeholder="e.g. 1299+290+50"
              value={c.amountExpr} onChange={e => c.onAmount(e.target.value)} />
            {c.amountExpr.includes('+') && (
              <p className="text-[11px] text-sniffy-purple font-semibold mt-1 ml-1">= ₹{evalExpr(c.amountExpr).toLocaleString('en-IN')}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Apply parsed WhatsApp data to the form
  function applyQuickFill(parsed: ParsedSession) {
    setForm(prev => {
      const next = { ...prev };
      if (parsed.pet_parent_name) next.pet_parent_name = parsed.pet_parent_name;
      if (parsed.phone)           next.phone = parsed.phone;
      if (parsed.address)         next.address = parsed.address;
      if (parsed.gps_location)    next.gps_location = parsed.gps_location;
      if (parsed.session_date)    {
        next.session_date = parsed.session_date;
        next.next_due_date = calcNextDue(parsed.session_date, next.next_due_days);
      }
      if (parsed.scheduled_time)  next.scheduled_time = parsed.scheduled_time;
      if (parsed.breed) {
        // Prefer an explicit pet_type when provided (AI screenshot
        // path) — it's more reliable than a substring match against
        // our static breed list, which doesn't cover everything Gemini
        // might return.  Otherwise fall back to the breed-list lookup.
        if (parsed.pet_type === 'cat' || parsed.pet_type === 'dog') {
          next.pet_type = parsed.pet_type;
        } else {
          const isCat = CAT_BREEDS.some(b => b.toLowerCase() === parsed.breed?.toLowerCase());
          next.pet_type = isCat ? 'cat' : 'dog';
        }
        next.breed = parsed.breed;
      } else if (parsed.pet_type === 'cat' || parsed.pet_type === 'dog') {
        // pet_type without breed — still useful so the dropdown lands
        // on the right species when the coordinator picks a breed
        // manually.
        next.pet_type = parsed.pet_type;
      }
      if (parsed.pet_age)         next.pet_age = parsed.pet_age;
      if (parsed.package) {
        next.package = parsed.package;
        if (parsed.booking_amount) {
          next.booking_amount = parsed.booking_amount;
          next.booking_amount_expr = String(parsed.booking_amount);
        }
      } else if (parsed.booking_amount) {
        next.booking_amount = parsed.booking_amount;
        next.booking_amount_expr = String(parsed.booking_amount);
      }
      if (parsed.groomer_name)    next.groomer_name  = parsed.groomer_name;
      if (parsed.groomer_phone)   next.groomer_phone = parsed.groomer_phone;
      // We deliberately do NOT attempt the groomer_id lookup here.
      // The dedicated useEffect above (groomers / groomer_phone /
      // groomer_name watcher) handles the match — that path also
      // covers the race condition where Quick Fill fires before the
      // groomers SELECT has returned.  Keeping the lookup in one
      // place avoids drift between the two strategies.
      // Auto-set status to scheduled if we have a date
      if (parsed.session_date && next.status === 'lead') next.status = 'scheduled';

      // Source resolution — explicit override wins.  The AI screenshot
      // path sends source_type='external' + source='woofly' so a Woofly
      // booking lands with both segmented control and the chip
      // preselected.  When the parsed payload doesn't carry a source
      // (text-paste path), fall back to the legacy heuristic: a
      // groomer line implies a direct call.
      if (parsed.source_type) next.source_type = parsed.source_type;
      if (parsed.source) {
        next.source = parsed.source;
      } else if (parsed.groomer_name) {
        next.source = 'direct_call';
      }
      // Final guard — normalise source_type to match the picked source
      // so an inconsistent payload (e.g. parsed.source='woofly' without
      // parsed.source_type set) doesn't save a row with the wrong type.
      // The day-summary helpers don't trust source_type, but the rest
      // of the app (lists, filters) does, so keeping the two fields in
      // lockstep matters.
      const desired: SourceType = isExternalSource(next.source) ? 'external' : 'internal';
      if (next.source_type !== desired) next.source_type = desired;
      return next;
    });

    // ── Seed platform-fee % from the resolved source ───────────────
    //
    // Quick Fill / Screenshot Fill writes `source` + `source_type`
    // directly on the form via setForm — it never routes through
    // `set()`, which is where the platform-fee % normally gets seeded
    // from EXTERNAL_SOURCE_FEE_RULE.  Without this seed, `platformPct`
    // stays null and the platform_commission recompute effect bails
    // out (`if (platformPct === null) return`), so the platform fee
    // and net-booking amount never get calculated on AI-filled rows.
    //
    // Repro: pasting a Woofly screenshot pre-selected the Woofly chip
    // but the platform fee stayed ₹0 until the coordinator clicked
    // the chip again — which then went through `set()` and finally
    // ran the calc.  This block fixes that by mirroring set()'s
    // seeding behaviour for the screenshot/text-paste path.
    //
    // We compute the final source / source_type using the same
    // resolution order the setForm reducer above uses, so the seed
    // matches what actually lands in `form`.
    const resolvedSource: BookingSource =
      parsed.source
        ?? (parsed.groomer_name ? 'direct_call' : form.source);
    const resolvedSourceType: SourceType =
      parsed.source_type
        ?? (isExternalSource(resolvedSource) ? 'external' : 'internal');

    if (resolvedSourceType === 'external') {
      const rule = EXTERNAL_SOURCE_FEE_RULE[resolvedSource as string];
      setPlatformPct(rule ? effectivePct(rule) : null);
      setPlatformPctSource('rule');
    } else {
      setPlatformPct(null);
      setPlatformPctSource('rule');
    }
  }

  // Actual insert/update — same payload & flow as before, just extracted
  // so the duplicate-check path can call it after the coordinator
  // confirms "Add Anyway".  Unchanged behaviour for callers.
  async function performSave() {
    setSaving(true); setError('');

    // ─── Payment-status payload bits ─────────────────────────
    //
    // Status → DB fields, branched on `paymentCollectedBy`:
    //
    //   • unpaid:    payment_verified=false, verified_at=null,
    //                verified_by=null.  Don't touch payment_collected_at
    //                or vendor_settled_at (groomer / vendor records are
    //                preserved if they were set).
    //   • collected: coordinator can't reach this state from the pill,
    //                so we never write it here.
    //   • paid:      always sets payment_verified=true + verified_at +
    //                verified_by.  The timestamp of *when the money
    //                changed hands* lands in a different column based
    //                on who collected it:
    //                  - 'sniffy' / 'groomer_cash' → payment_collected_at
    //                    (cash in Sniffy's books — same path as before).
    //                  - 'vendor' → vendor_settled_at (partner already
    //                    settled with the customer; payment_collected_at
    //                    stays NULL so revenue queries don't double-count
    //                    this as Sniffy cash).
    //
    // payment_mode is written verbatim regardless of status; required
    // when paid (guard below) UNLESS the collector is 'vendor' — for
    // vendor-prepaid rows the mode is the partner's concern, not ours.
    const nowIso = new Date().toISOString();
    const editorName =
      (editSession?.groomer_name) // fallback — best-effort
      ?? 'coordinator';
    const collectedByVendor = paymentCollectedBy === 'vendor';
    const paymentPayload: Record<string, unknown> = {
      // Vendor-prepaid rows don't have a Sniffy-side payment mode —
      // save NULL so the column doesn't lie about a channel we never
      // owned.  All other paths persist the mode the coordinator picked.
      payment_mode:
        paymentStatus === 'unpaid' || collectedByVendor
          ? null
          : (paymentMode ?? null),
      payment_collected_by: paymentCollectedBy,
    };
    if (paymentStatus === 'paid') {
      paymentPayload.payment_verified    = true;
      paymentPayload.payment_verified_at = editSession?.payment_verified_at ?? nowIso;
      paymentPayload.payment_verified_by = editSession?.payment_verified_by ?? editorName;
      if (collectedByVendor) {
        // Vendor-prepaid path → stamp vendor_settled_at, leave
        // payment_collected_at alone (it should stay NULL; if a stale
        // groomer-collected value is there from a prior mis-classified
        // life, preserve it — coordinator can fix it explicitly).
        paymentPayload.vendor_settled_at =
          editSession?.vendor_settled_at ?? nowIso;
      } else {
        // Sniffy-collected / groomer-cash path → preserves existing
        // collected_at (groomer's record wins) or stamps NOW for the
        // prepaid-Sniffy case where the customer paid up front.
        paymentPayload.payment_collected_at =
          editSession?.payment_collected_at ?? nowIso;
      }
    } else if (paymentStatus === 'unpaid') {
      paymentPayload.payment_verified    = false;
      paymentPayload.payment_verified_at = null;
      paymentPayload.payment_verified_by = null;
      // payment_collected_at + vendor_settled_at intentionally NOT
      // overwritten — leaves whichever side already recorded the
      // settlement intact if the coordinator briefly toggled the pill.
    }

    // Multi-pet: recompute from the per-pet amounts at save time rather than
    // trusting derived state.  Single pet: the form value, exactly as before.
    const totalAmount = extraPets.length > 0
      ? computeSessionTotal({ primaryExpr: form.booking_amount_expr ?? '', extras: extraPets, combined: combinedTotal })
      : (Number(form.booking_amount) || 0);

    const payload = {
      session_date: form.session_date,
      scheduled_time: form.scheduled_time || null,
      status: form.status,
      is_converted: form.is_converted,
      pet_parent_name: form.pet_parent_name,
      phone: form.phone,
      address: form.address,
      // Send NULL for empty gps so the DB column stays NULL (matches the
      // backfill semantic — "no GPS = no Navigate button" on groomer side).
      gps_location: (form.gps_location ?? '').trim() || null,
      pet_type: form.pet_type,
      pet_name: (form.pet_name ?? '').trim() || null,
      breed: form.breed,
      pet_age: form.pet_age,
      pet_vaccinated: form.pet_vaccinated,
      source: form.source,
      booking_amount: totalAmount,
      platform_commission: Number(form.platform_commission) || 0,
      groomer_commission: Number(form.groomer_commission) || 0,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value) || 0,
      package: form.package,
      add_ons: form.add_ons,
      // next_due_days/next_due_date are now optional — if the
      // coordinator didn't opt in, we persist null on both columns
      // rather than auto-deriving a date from a default cadence.
      next_due_days: form.next_due_days,
      next_due_date: form.next_due_days == null
        ? null
        : (form.next_due_date ?? calcNextDue(form.session_date, form.next_due_days)),
      medical_issues: form.medical_issues,
      groomer_observation: form.groomer_observation,
      client_rating: form.client_rating,
      groomer_id: form.groomer_id,
      groomer_name: form.groomer_name,
      groomer_phone: form.groomer_phone,
      notes: form.notes,
      // Canonical incentive toggles — these ARE the source of truth for
      // payment.  See groomer/incentivesApi.ts:computeSessionIncentive.
      // The DB trigger `trg_sync_incentive_canonical` only syncs from
      // claim-status changes, so coordinator's direct edits here win.
      groomer_on_time: groomerOnTime,
      review_taken:    form.review_taken === true,
      external_source_name: form.source_type === 'external' && form.source === 'other' ? externalSourceName : null,
      ...(helperTouched ? { helper_id: helperId } : {}),
      ...paymentPayload,
    };
    try {
      let err;
      let savedSessionId: string | null = null;
      const existingId = editSession?.id ?? savedIdRef.current;
      if (existingId) {
        ({ error: err } = await supabase.from('grooming_sessions').update(payload).eq('id', existingId));
        savedSessionId = existingId;
      } else {
        // Use .select() so we get the row back with its generated id —
        // we need it to reconcile pets / session_pets rows below.
        const { data: inserted, error: insErr } = await supabase
          .from('grooming_sessions')
          .insert([payload])
          .select('id')
          .single();
        err = insErr;
        savedSessionId = (inserted?.id ?? null) as string | null;
        savedIdRef.current = savedSessionId;
      }
      if (err) throw err;

      // ── Reconcile pets + session_pets join rows ──
      //
      // Pet #1 comes from the session-level fields, then each extra pet.
      // Itemised multi-pet sessions also persist per-pet package / add-ons /
      // amount (see sessionPets.ts).  The session row is already saved, so a
      // failure here is reported, not thrown away — and a retry updates the
      // same row (savedIdRef) instead of inserting a duplicate.
      if (savedSessionId) {
        const petInputs = buildPetInputs({
          primary: {
            petId: primaryPet.id, origin: primaryPet.origin,
            name: form.pet_name ?? null, type: form.pet_type, breed: form.breed,
            age_bucket: form.pet_age, medical: form.medical_issues,
            package: form.package, add_ons: form.add_ons ?? [],
          },
          primaryExpr: form.booking_amount_expr ?? '',
          extras: extraPets,
          combined: combinedTotal,
        });
        const syncErrors = await syncSessionPets(savedSessionId, petInputs, { replaceExisting: !!existingId });
        invalidateSessionPets();   // session cards / groomer lists re-read the pets
        if (syncErrors.length > 0) {
          onSaved();                       // the session exists — refresh lists
          setError(`Session saved, but the pet details did not fully save: ${syncErrors.join(' ')} Press Save again to retry.`);
          return;
        }
      }

      setDone(true);
      setTimeout(() => { setDone(false); onSaved(); onClose(); }, 1000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally { setSaving(false); }
  }

  // Pre-save gate: scan for likely duplicates (same trimmed/lowercased
  // pet-parent name within ±7 days of the chosen session date). On a
  // hit we surface a soft warning and let the coordinator confirm or
  // back out. **Fault-safe** — if the duplicate query itself errors
  // (network / RLS / etc.) we log and fall through to performSave so a
  // legitimate save is never blocked by a check failure.
  async function handleSave() {
    if (!form.pet_parent_name.trim()) { setError('Pet parent name is required.'); return; }
    // Mode is required whenever money has changed hands on Sniffy's
    // side — keeps the books consistent (we can't report "Paid · ?"
    // later).  Vendor-prepaid rows are exempt: the partner platform
    // owns the channel; we just record that the row was settled by
    // them, not how.
    if (
      paymentStatus !== 'unpaid' &&
      paymentCollectedBy !== 'vendor' &&
      !paymentMode
    ) {
      setError('Please pick Cash or Online for the payment mode.');
      return;
    }
    const petsError = validateSessionPets(extraPets, combinedTotal);
    if (petsError) { setError(petsError); return; }
    if (extraPets.length > 0 && !normalizePhone(form.phone)) {
      // Pets hang off the customer record, which is keyed by phone — without
      // one the extra pets would have nowhere to be stored.
      setError('Add the phone number to save more than one pet — pets are stored against the customer.');
      return;
    }
    setError('');

    const trimmedName = form.pet_parent_name.trim();
    const weekBefore  = addDays(form.session_date, -7);
    const weekAfter   = addDays(form.session_date,  7);

    setSaving(true);
    try {
      let q = supabase
        .from('grooming_sessions')
        .select('id, pet_parent_name, session_date, scheduled_time, pet_type, breed, package, groomer_name, status')
        // ilike with no wildcards = exact-string, case-insensitive match
        // ("shyam" / "Shyam" / "SHYAM" all hit).  Leading/trailing
        // whitespace in stored values is handled by the client-side
        // re-filter below.
        .ilike('pet_parent_name', trimmedName)
        .gte('session_date', weekBefore)
        .lte('session_date', weekAfter)
        .order('session_date', { ascending: false })
        .limit(10);
      const ownId = editSession?.id ?? savedIdRef.current;
      if (ownId) q = q.neq('id', ownId);

      const { data, error: dupErr } = await q;

      if (dupErr) {
        // Don't block a save on a duplicate-check failure — log & proceed.
        console.warn('[SessionFormModal] duplicate check failed, proceeding to save:', dupErr);
      } else if (data && data.length > 0) {
        // Belt-and-suspenders normalisation: trim + lowercase both sides
        // so stray whitespace in the DB doesn't slip past ilike.
        const needle = trimmedName.toLowerCase();
        const matches = (data as DuplicateMatch[]).filter(
          r => (r.pet_parent_name ?? '').trim().toLowerCase() === needle
        );
        if (matches.length > 0) {
          setDupMatches(matches);
          setDupOpen(true);
          setSaving(false);
          return; // wait for coordinator to confirm / cancel
        }
      }
    } catch (e) {
      console.warn('[SessionFormModal] duplicate check threw, proceeding to save:', e);
    }

    // No duplicates (or the check failed open) — proceed normally.
    // performSave() flips `saving` itself, so reset here first to avoid
    // a double-set race.
    setSaving(false);
    await performSave();
  }

  // Warning-modal handlers
  function handleDupCancel() {
    setDupOpen(false);
    // Keep matches in state until exit animation finishes — cheap, and
    // avoids an empty-list flash if the modal is re-opened quickly.
  }
  async function handleDupConfirm() {
    setDupOpen(false);
    await performSave();
  }

  // Mirrors the DB's `discount_amount` / `net_booking_amount` generated
  // columns (20260907000000_session_discounts.sql) so the preview shown
  // here matches what actually gets saved.
  const bookingAmt     = Number(form.booking_amount) || 0;
  const discountAmount = form.discount_type === 'flat'
    ? Math.min(Number(form.discount_value) || 0, bookingAmt)
    : form.discount_type === 'percent'
      ? Math.round(bookingAmt * Math.min(Number(form.discount_value) || 0, 100)) / 100
      : 0;
  const payableAfterDiscount = bookingAmt - discountAmount;
  const net         = payableAfterDiscount - (Number(form.platform_commission) || 0) - (Number(form.groomer_commission) || 0);
  const nextDueIso     = form.next_due_date ?? calcNextDue(form.session_date, form.next_due_days);
  const nextDueDateStr = nextDueIso ? humanDate(nextDueIso) : '—';
  const exprResult  = evalExpr(form.booking_amount_expr ?? '');
  const itemised    = isItemised(extraPets, combinedTotal);
  const sessionTotal = computeSessionTotal({ primaryExpr: form.booking_amount_expr ?? '', extras: extraPets, combined: combinedTotal });

  // ── extra-pet card helpers ──
  function updateExtra(idx: number, patch: Partial<ExtraPetDraft>) {
    setExtraPets(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }
  // Package / add-on changes re-price the pet the same way pet #1 does:
  // package price + add-on prices.  Free-text (external) packages and
  // "nothing selected" leave the typed amount alone.
  function repriced(pkgLabel: string, addOns: string[], current: string): string {
    const pkgPrice = PACKAGES.find(x => x.label === pkgLabel)?.price ?? 0;
    const addOnTotal = addOns.reduce((sum, a) => sum + (ADD_ONS.find(x => x.label === a)?.price ?? 0), 0);
    return pkgPrice || addOnTotal ? packageExpr(pkgPrice, addOnTotal) : current;
  }
  function setExtraPackage(idx: number, label: string) {
    setExtraPets(prev => prev.map((p, i) => i !== idx ? p
      : { ...p, package: label, amount_expr: repriced(label, p.add_ons, p.amount_expr) }));
  }
  function toggleExtraAddOn(idx: number, label: string) {
    setExtraPets(prev => prev.map((p, i) => {
      if (i !== idx) return p;
      const add_ons = p.add_ons.includes(label) ? p.add_ons.filter(a => a !== label) : [...p.add_ons, label];
      return { ...p, add_ons, amount_expr: repriced(p.package, add_ons, p.amount_expr) };
    }));
  }

  const availableSources = form.source_type === 'internal' ? INTERNAL_SOURCES : EXTERNAL_SOURCES;
  const sourceLabels     = form.source_type === 'internal' ? INTERNAL_SOURCE_LABELS : EXTERNAL_SOURCE_LABELS;

  return (
    <>
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-stretch sm:items-center justify-center p-0 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            // Mobile: full viewport (`h-full`).  Desktop: auto-size but
            // capped at 90vh so the `overflow-y-auto flex-1` body inside
            // has a bounded parent and can actually scroll.  Without the
            // cap, the inner body just grew past the viewport with no
            // scroll affordance.
            // Whole popup is rendered at 90% (fonts, fields, spacing) via CSS zoom.
            // Percent sizes are not scaled by zoom, so it still fills the screen
            // on mobile and keeps the same max height on desktop.
            style={{ zoom: 0.9 }}
            className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg rounded-none sm:rounded-[24px] shadow-2xl flex flex-col"
          >
            {/* ── Header ── */}
            <div className="px-5 py-4 border-b border-gray-100 shrink-0 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-base font-extrabold text-gray-900">
                    {editSession ? 'Edit Session'
                      : copyFromSession ? 'New Session (Copy)'
                      : prefill ? 'Convert to Session'
                      : 'Add New Session'}
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {editSession ? 'Update session details'
                      : copyFromSession ? 'Copied from previous session — pick date/time & assign groomer'
                      : prefill ? 'Pre-filled from website booking — add groomer & financials'
                      : 'Log a grooming session or lead'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Payment status pill — coordinator cycles UNPAID ↔ PAID.
                      A row already in COLLECTED (groomer-marked) shows as
                      "Verify" on a single tap to confirm and flip to PAID. */}
                  <PaymentStatusPill
                    status={paymentStatus}
                    mode={paymentMode}
                    onToggle={() => {
                      if (paymentStatus === 'paid') {
                        // PAID → UNPAID (also forgets the mode, since
                        // an unpaid row has no mode of payment yet).
                        setPaymentStatus('unpaid');
                        setPaymentMode(null);
                      } else {
                        // UNPAID or COLLECTED → PAID.  Keep whatever mode
                        // was set (groomer's choice if collected), or
                        // default to online for prepaid via this path.
                        setPaymentStatus('paid');
                        if (!paymentMode) setPaymentMode('online');
                      }
                    }}
                  />
                  <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400">
                    <X size={17}/>
                  </button>
                </div>
              </div>

              {/* Quick Fill row — text paste + screenshot side by side.
                  Both feed the same applyQuickFill reducer. */}
              {!editSession && (
                <div className="flex flex-wrap items-start gap-2">
                  <QuickFillPanel onFill={applyQuickFill}/>
                  <ScreenshotFillPanel onFill={applyQuickFill}/>
                </div>
              )}
            </div>

            {/* ── Scrollable body ── */}
            {/* Sectional layout: each section (Session Info, Pet Parent, Pet,
                Financials, Groomer, Feedback) is rendered as a white card on
                this grey canvas so the form scans as visually distinct groups
                instead of one continuous wall of fields. */}
            <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3 bg-gray-200">

              {/* ① SESSION INFO */}
              <SectionCard title="Session Info">

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Lbl req>Date</Lbl>
                  <SniffyDatePicker value={form.session_date} onChange={v => set('session_date', v)}/>
                </div>
                <div>
                  <Lbl req>Status</Lbl>
                  <select value={form.status} onChange={e => set('status', e.target.value as SessionStatus)} className={selectCls}>
                    <option value="lead">Lead</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="groomer_assigned">Groomer Assigned</option>
                    {/* Coordinator override for the case the whole status
                        exists to cover: the groomer finished the job but
                        never tapped "Mark Complete", so nothing stamped
                        grooming_done automatically. */}
                    <option value="grooming_done">Grooming Done</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Scheduled Time */}
              <div>
                <Lbl>Scheduled Time</Lbl>
                <SniffyTimePicker value={form.scheduled_time ?? ''} onChange={v => set('scheduled_time', v)}/>
              </div>

              {/* SOURCE */}
              <div className="space-y-2.5">
                <Lbl>Source</Lbl>
                <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl">
                  {(['internal', 'external'] as SourceType[]).map(t => (
                    <button key={t} type="button" onClick={() => set('source_type', t)}
                      className={`py-1.5 rounded-[10px] text-xs font-semibold capitalize transition-all ${
                        form.source_type === t ? 'bg-white text-sniffy-purple shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableSources.map(s => (
                    <button key={s} type="button" onClick={() => set('source', s as BookingSource)}
                      className={`h-7 px-3 rounded-full border text-xs font-semibold transition-all ${
                        form.source === s
                          ? 'bg-sniffy-purple text-white border-sniffy-purple'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-sniffy-purple/50 hover:text-sniffy-purple'
                      }`}>
                      {(sourceLabels as Record<string, string>)[s]}
                    </button>
                  ))}
                </div>

                {/* External "Other" — free-text name */}
                <AnimatePresence>
                  {form.source_type === 'external' && form.source === 'other' && (
                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="overflow-hidden">
                      <input
                        className={inputCls}
                        placeholder="Enter platform / source name (e.g. UrbanClap, NoBroker…)"
                        value={externalSourceName}
                        onChange={e => setExternalSourceName(e.target.value)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              </SectionCard>

              {/* ② PET PARENT */}
              <SectionCard title="Pet Parent">

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Lbl req>Name</Lbl>
                  <input className={inputCls} placeholder="e.g. Rahul" value={form.pet_parent_name}
                    onChange={e => set('pet_parent_name', e.target.value)}/>
                </div>
                <div className="relative">
                  <Lbl>Phone</Lbl>
                  <input
                    type="tel"
                    className={inputCls}
                    placeholder="10 digits"
                    value={form.phone ?? ''}
                    onChange={e => {
                      set('phone', e.target.value);
                      // Clear the "this is X" pill the moment the
                      // coordinator edits the phone — it's stale.
                      if (matchedCustomer) setMatchedCustomer(null);
                    }}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setTimeout(() => setPhoneFocused(false), 150)}
                  />
                  {/* Suggestion dropdown — shown while the field is
                      focused and we have at least one match.  Click
                      pre-fills name/address/gps + pulls the customer's
                      pet roster so the multi-pet UI can offer them. */}
                  <AnimatePresence>
                    {phoneFocused && phoneSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-72 overflow-y-auto"
                      >
                        {phoneSuggestions.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onMouseDown={async () => {
                              setForm(prev => ({
                                ...prev,
                                pet_parent_name: prev.pet_parent_name || c.name || '',
                                phone:           c.phone_raw || c.phone,
                                address:         prev.address || c.address || '',
                                gps_location:    prev.gps_location || c.gps_location || '',
                              }));
                              setMatchedCustomer(c);
                              setPhoneSuggestions([]);
                              const pets = await fetchPetsForCustomer(c.id);
                              setMatchedPets(pets);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-purple-50 transition border-b border-gray-50 last:border-b-0"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-gray-900 truncate">
                                {c.name || <span className="text-gray-400 italic">No name</span>}
                              </span>
                              <span className="text-[10px] text-gray-400 shrink-0">
                                {c.total_sessions}× · {c.lifecycle_stage}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              {formatPhoneDisplay(c.phone)}
                              {c.address && <> · {c.address}</>}
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              {/* Returning-customer pill — full-width row so the text
                  ("↺ Returning · N× · last <date>") has room to breathe
                  and aligns flush-left with the Name field above instead
                  of overflowing the half-width phone column.
                  Hidden in edit mode when total_sessions === 1, because
                  that single session IS the one being edited (not real
                  repeat history). See findCustomerByPhone /
                  trg_sessions_aggregates for how the count is kept. */}
              {matchedCustomer && !phoneFocused && (editSession?.id
                ? matchedCustomer.total_sessions > 1
                : matchedCustomer.total_sessions >= 1) && (
                <div className="mt-2 flex">
                  <span className="inline-flex items-center gap-1 whitespace-nowrap bg-purple-50 border border-purple-200 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-sniffy-purple leading-snug">
                    <span aria-hidden>↺</span>
                    <span>Returning · {matchedCustomer.total_sessions}× · last {matchedCustomer.last_session_at ? new Date(matchedCustomer.last_session_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</span>
                  </span>
                </div>
              )}
              {/* New-customer pill — confirmed zero prior sessions (any
                  source) on this phone. Only shown for internal-source
                  bookings (sniffy/direct_call/website_booking/instagram_ad/
                  facebook_ad/sidharth): the acquisition discount this pill
                  flags is for people booking Sniffy directly for the first
                  time, not for vendor-sourced sessions, so it's suppressed
                  the moment the coordinator picks a Woofly/Paw Space/etc.
                  source. Not shown in edit mode — there, matchedCustomer
                  being null on an existing session is a data quirk, not a
                  "this is a first-timer" signal worth surfacing. */}
              {!editSession?.id && !matchedCustomer && !phoneFocused
                && form.source_type !== 'external'
                && confirmedNewPhone && confirmedNewPhone === normalizePhone(form.phone ?? '') && (
                <div className="mt-2 flex">
                  <span className="inline-flex items-center gap-1 whitespace-nowrap bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 leading-snug">
                    <span aria-hidden>✨</span>
                    <span>New · no prior sessions</span>
                  </span>
                </div>
              )}
              <div>
                <Lbl>Address / Area</Lbl>
                <input className={inputCls} placeholder="e.g. Wagholi, Pune" value={form.address ?? ''}
                  onChange={e => set('address', e.target.value)}/>
              </div>

              {/* GPS Location — optional Google Maps share URL.  When
                  present, the groomer's "Navigate" CTA uses this directly
                  instead of geocoding the text address.  When empty the
                  groomer simply doesn't see the Navigate button. */}
              <div>
                <Lbl>GPS Location <span className="normal-case text-gray-400 font-normal">(optional)</span></Lbl>
                <input
                  className={inputCls}
                  placeholder="https://maps.app.goo.gl/…"
                  value={form.gps_location ?? ''}
                  onChange={e => set('gps_location', e.target.value)}
                />
                {/* <p className="text-[11px] text-gray-400 mt-1 ml-1">
                  Google Maps share link — Used by the groomers to Navigate.
                </p> */}
              </div>

              </SectionCard>

              {/* ③ PET */}
              <SectionCard title="Pet" right={<VaccinationBadge vaccinated={form.pet_vaccinated}/>}>

              {/* ── One shared card layout for every pet (Pet 1, 2, 3 …) ── */}
              <div className="space-y-2">
                {extraPets.length > 0 && combinedTotal && (
                  <div className="mb-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                    This session has one combined amount (₹{(Number(form.booking_amount) || 0).toLocaleString('en-IN')}) — it was saved before
                    pets could be priced separately, so nothing has been changed.
                    <button
                      type="button"
                      onClick={() => setCombinedTotal(false)}
                      className="ml-1 font-bold underline"
                    >Price each pet separately</button>
                    {' '}(Pet 1 will then hold the current total — change it to just Pet 1's own price, and fill in each other pet's amount in its card).
                  </div>
                )}

                {/* Pet 1 */}
                {renderPetCard({
                  title: 'Pet 1',
                  name: form.pet_name ?? '', onName: v => set('pet_name', v),
                  type: form.pet_type,
                  onType: t => { set('pet_type', t); set('breed', ''); },
                  breed: form.breed ?? '', onBreed: v => set('breed', v),
                  age: form.pet_age ?? '', onAge: v => set('pet_age', v),
                  pkg: form.package ?? '', onPkg: setPet1Package,
                  addOns: form.add_ons ?? [], onToggleAddOn: (label, price) => toggleAddOn(label, price),
                  medical: form.medical_issues ?? '', onMedical: v => set('medical_issues', v),
                  amountExpr: form.booking_amount_expr ?? '', onAmount: handleExprChange,
                  showPricing: true, showAmount: !combinedTotal,
                })}

                {/* Pet 2, 3 … */}
                {extraPets.map((ep, idx) => renderPetCard({
                  key: idx,
                  title: `Pet ${idx + 2}`,
                  onRemove: () => setExtraPets(prev => prev.filter((_, i) => i !== idx)),
                  name: ep.name, onName: v => updateExtra(idx, { name: v }),
                  type: ep.type, onType: t => updateExtra(idx, { type: t, breed: '' }),
                  breed: ep.breed, onBreed: v => updateExtra(idx, { breed: v }),
                  age: ep.age_bucket, onAge: v => updateExtra(idx, { age_bucket: v }),
                  pkg: ep.package, onPkg: v => setExtraPackage(idx, v),
                  addOns: ep.add_ons, onToggleAddOn: label => toggleExtraAddOn(idx, label),
                  medical: ep.medical, onMedical: v => updateExtra(idx, { medical: v }),
                  amountExpr: ep.amount_expr, onAmount: v => updateExtra(idx, { amount_expr: v }),
                  showPricing: itemised, showAmount: itemised,
                }))}

                {/* Quick-add chips from the matched customer's pet roster.
                    Hidden for pets already on this session (by id) and for
                    the pet that is pet 1. */}
                {matchedPets.length > 0 && (() => {
                  const lc = (x: string | null | undefined) => (x ?? '').trim().toLowerCase();
                  const isPrimary = (p: Pet) => primaryPet.id
                    ? p.id === primaryPet.id
                    : p.type === form.pet_type &&
                      lc(p.breed) === lc(form.breed) &&
                      (!lc(form.pet_name) || !lc(p.name) || lc(p.name) === lc(form.pet_name));
                  const usedExtra = (p: Pet) => extraPets.some(ep => ep.petId === p.id);
                  const available = matchedPets.filter(p => !isPrimary(p) && !usedExtra(p));
                  if (available.length === 0) return null;
                  return (
                    <div className="flex flex-wrap gap-1.5">
                      {available.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setExtraPets(prev => [...prev, {
                            ...emptyExtraPet(p.type),
                            petId: p.id,
                            origin: { type: p.type, breed: p.breed, name: p.name },
                            name: p.name ?? '',
                            breed: p.breed ?? '',
                            age_bucket: p.age_bucket ?? '',
                            medical: p.medical ?? '',
                          }])}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-50 text-sniffy-purple border border-purple-200 rounded-full px-2.5 py-0.5 hover:bg-purple-100 transition"
                        >
                          + {p.type === 'dog' ? '🐶' : '🐱'} {p.name ? `${p.name} · ` : ''}{p.breed ?? '—'}
                        </button>
                      ))}
                    </div>
                  );
                })()}

                <button
                  type="button"
                  onClick={() => setExtraPets(prev => [...prev, emptyExtraPet('dog')])}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-sniffy-purple/30 text-xs font-bold text-sniffy-purple hover:bg-purple-50 transition"
                >
                  + Add another pet
                </button>
              </div>

              </SectionCard>

              {/* ④ FINANCIALS */}
              <SectionCard title="Financials">

              {/* Session total — read-only when priced per pet (set each pet's
                  price in its own card above).  A legacy combined-total
                  session keeps its single editable amount here. */}
              {combinedTotal && extraPets.length > 0 ? (
                <div>
                  <Lbl>Booking ₹ (combined total)</Lbl>
                  <input type="text" inputMode="decimal" className={inputCls} placeholder="e.g. 1299+290+50"
                    value={form.booking_amount_expr ?? ''} onChange={e => handleExprChange(e.target.value)}/>
                  {(form.booking_amount_expr ?? '').includes('+') && (
                    <p className="text-[11px] text-sniffy-purple font-semibold mt-1 ml-1">= ₹{exprResult.toLocaleString('en-IN')}</p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-2.5" data-testid="pet-total-breakdown">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-sniffy-purple">
                      {extraPets.length > 0 ? 'Session total' : 'Booking total'}
                    </span>
                    <span className="text-base font-extrabold text-sniffy-purple">₹{sessionTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {itemised && (
                    <p className="text-[11px] text-gray-600 font-semibold mt-0.5">
                      Pet 1 ₹{exprResult.toLocaleString('en-IN')}
                      {extraPets.map((ep, i) => ` + Pet ${i + 2} ₹${evalExpr(ep.amount_expr).toLocaleString('en-IN')}`).join('')}
                    </p>
                  )}
                </div>
              )}

              {/* Discount — flat ₹ or % off the booking amount, given by
                  the coordinator. Comes out of Sniffy's own margin only:
                  booking_amount and the Platform/Groomer ₹ below are
                  untouched, so vendor commission still calculates off the
                  gross package price. Tapping the active type again turns
                  the discount off. Internal sources only — vendor
                  bookings don't get one (the `set()` above also clears
                  any existing discount the moment source_type flips to
                  external, so this isn't just a display-layer hide). */}
              {form.source_type === 'external' ? (
                <div>
                  <Lbl>Discount</Lbl>
                  <p className="text-[11px] text-gray-400 mt-1 ml-1">Not available for vendor-sourced bookings.</p>
                </div>
              ) : (
              <div>
                <Lbl>Discount</Lbl>
                <div className="flex gap-2">
                  <div className="flex gap-1 p-1 bg-gray-100 rounded-xl flex-shrink-0">
                    {(['flat', 'percent'] as const).map(t => (
                      <button key={t} type="button"
                        onClick={() => setForm(prev => ({
                          ...prev,
                          discount_type: prev.discount_type === t ? null : t,
                          discount_value: 0,
                        }))}
                        className={`px-3 h-9 rounded-[10px] text-xs font-semibold transition-all ${
                          form.discount_type === t
                            ? 'bg-white text-sniffy-purple shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        {t === 'flat' ? '₹ Flat' : '% Off'}
                      </button>
                    ))}
                  </div>
                  <input type="number" min={0} max={form.discount_type === 'percent' ? 100 : undefined}
                    className={inputCls} placeholder="0"
                    disabled={!form.discount_type}
                    value={form.discount_value || ''}
                    onChange={e => set('discount_value', Number(e.target.value))}/>
                </div>
                {discountAmount > 0 && (
                  <p className="text-[11px] text-green-700 font-semibold mt-1 ml-1">
                    −₹{discountAmount.toLocaleString('en-IN')} off → Payable ₹{payableAfterDiscount.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  {/* Label row is plain — the % chip used to live up
                      here on the right, but its show/hide based on
                      source_type knocked the Platform label out of
                      alignment with Groomer.  Chip moved inside the
                      input below as an absolutely-positioned overlay
                      so the row height is stable either way. */}
                  <Lbl>Platform ₹</Lbl>
                  <div className="relative">
                    <input type="number" min={0}
                      className={`${inputCls} ${form.source_type === 'external' ? 'pr-[72px]' : ''}`}
                      placeholder="0"
                      value={form.platform_commission || ''}
                      onChange={e => {
                        const v = Number(e.target.value);
                        set('platform_commission', v);
                        // Manual ₹ edit on an external source — keep the
                        // displayed % in sync (derived) and mark the
                        // pct-source as 'manual' so we don't snap back
                        // to the rule on the next render.
                        if (form.source_type === 'external') {
                          const amount = Number(form.booking_amount) || 0;
                          setPlatformPct(amount > 0 ? Math.round((v / amount) * 10000) / 100 : null);
                          setPlatformPctSource('manual');
                        }
                      }}/>
                    {form.source_type === 'external' && (
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                        {/* The % chip is a single pill — number input on
                            the left, fixed % glyph baked in on the
                            right.  The glyph is an absolutely-positioned
                            overlay (pointer-events-none so it doesn't
                            steal clicks) and the input carries enough
                            right-padding (pr-4) to keep typed digits
                            from sliding under it. */}
                        <div className="relative inline-block">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step="0.01"
                            inputMode="decimal"
                            placeholder="%"
                            value={platformPct ?? ''}
                            onChange={e => {
                              const raw = e.target.value;
                              // Typing in % is by definition a manual
                              // override — drop the structured rule and
                              // use flat math from here on.
                              setPlatformPct(raw === '' ? null : Number(raw));
                              setPlatformPctSource('manual');
                            }}
                            className="w-14 h-6 pl-1.5 pr-4 text-[11px] font-semibold text-sniffy-purple bg-purple-50 border border-sniffy-purple/30 rounded-md focus:outline-none focus:border-sniffy-purple text-right"
                            title="Platform fee % — auto-filled from source, editable"
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-sniffy-purple pointer-events-none">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Breakdown caption — shows *why* the number is what
                      it is.  Switches to "Manual override" once the
                      coordinator types in either field. */}
                  {form.source_type === 'external' && (() => {
                    const rule = EXTERNAL_SOURCE_FEE_RULE[form.source as string];
                    const hint =
                      platformPctSource === 'manual'
                        ? (platformPct != null ? `Manual ${platformPct}% override` : 'Manual override')
                        : rule
                          ? feeRuleHint(rule)
                          : 'Manual entry — no default rate for this source';
                    return (
                      <p className="text-[10px] text-gray-400 mt-1 ml-1 leading-snug">{hint}</p>
                    );
                  })()}
                </div>
                <div>
                  <Lbl>Groomer ₹</Lbl>
                  <input type="number" min={0} className={inputCls} placeholder="0"
                    value={form.groomer_commission || ''} onChange={e => set('groomer_commission', Number(e.target.value))}/>
                </div>
              </div>

              {Number(form.booking_amount) > 0 && (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                  <span className="text-xs font-semibold text-green-700">Net (Sniffy keeps)</span>
                  <span className="text-base font-extrabold text-green-700">₹{net.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Collected-by picker — disambiguates who actually held
                  the cash.  External sources default to 'vendor'
                  (partner pre-collected), internal to 'sniffy'.  The
                  coordinator can override per session.  We render this
                  only once money has changed hands — for unpaid rows
                  the question is moot.  Vendor-prepaid rows hide the
                  Payment Mode picker below since the partner owns the
                  channel; revenue tiles + reconciliation use this
                  field to exclude prepaid amounts from Sniffy's
                  cash-collected totals. */}
              {paymentStatus !== 'unpaid' && (
                <div>
                  <Lbl req>Collected By</Lbl>
                  <div className={`grid gap-1 p-1 bg-gray-100 rounded-xl ${form.source_type === 'internal' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {(['sniffy', 'vendor', 'groomer_cash'] as PaymentCollectedBy[])
                      .filter(opt => !(opt === 'vendor' && form.source_type === 'internal'))
                      .map(opt => (
                      <button key={opt} type="button"
                        onClick={() => {
                          setPaymentCollectedBy(opt);
                          setCollectedByTouched(true);
                          // Switching TO vendor: the channel field is
                          // not Sniffy's — drop any mode the user had
                          // picked so we don't save a misleading value.
                          if (opt === 'vendor') setPaymentMode(null);
                        }}
                        className={`py-1.5 rounded-[10px] text-xs font-semibold transition-all ${
                          paymentCollectedBy === opt
                            ? 'bg-white text-sniffy-purple shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        {PAYMENT_COLLECTED_BY_LABELS[opt]}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 ml-1 leading-snug">
                    {paymentCollectedBy === 'vendor'
                      ? form.source_type === 'external'
                        ? 'Partner platform already collected — Sniffy does not hold this cash.  Reconciliation will track commission owed.'
                        : 'Marked as vendor-settled — unusual for an internal source; double-check this is correct.'
                      : paymentCollectedBy === 'groomer_cash'
                        ? 'Cash physically with the groomer until office deposit.'
                        : 'Sniffy collected directly (online or cash at office).'}
                  </p>
                </div>
              )}

              {/* Payment mode picker — only visible once money has
                  changed hands AND Sniffy is on the receiving side.
                  Vendor-prepaid rows hide this — the partner platform
                  owns the channel, not us, so capturing it here would
                  be misleading. */}
              {paymentStatus !== 'unpaid' && paymentCollectedBy !== 'vendor' && (
                <div>
                  <Lbl req>Payment Mode</Lbl>
                  <PaymentModePills value={paymentMode} onChange={setPaymentMode}/>
                  <p className="text-[10px] text-gray-400 mt-1 ml-1 leading-snug">
                    {paymentStatus === 'paid'
                      ? 'Settled — required so the books reflect the right channel.'
                      : paymentMode === 'cash'
                        ? 'Cash collected by groomer — still pending verification at office.'
                        : 'Online payment — pending verification of the txn.'}
                  </p>
                </div>
              )}

              </SectionCard>

              {/* ⑤ GROOMER */}
              <SectionCard title="Groomer">

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Lbl>Assign</Lbl>
                  {/* Searchable combobox — see GroomerCombobox.  Filters
                      with the same fuzzy strategies as the Quick Fill
                      auto-resolver, so "sid" / "sdrth" / "siddhart" all
                      surface "Sidharth", "hmnt" surfaces "Hemant", etc. */}
                  <GroomerCombobox
                    groomers={groomers}
                    selectedId={form.groomer_id}
                    onSelect={handleGroomer}
                  />
                </div>
                <div>
                  <Lbl>Phone</Lbl>
                  <input className={`${inputCls} bg-gray-50 text-gray-400`} readOnly
                    placeholder="Auto-filled" value={form.groomer_phone ?? ''}
                    onChange={e => set('groomer_phone', e.target.value)}/>
                </div>
              </div>

              {(helpers.length > 0 || helperId) && (
                <div>
                  <Lbl>Helper (optional)</Lbl>
                  <select
                    className={inputCls}
                    value={helperId ?? ''}
                    onChange={e => { setHelperId(e.target.value || null); setHelperTouched(true); }}
                  >
                    <option value="">No helper</option>
                    {helpers.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    {helperId && !helpers.some(h => h.id === helperId) && <option value={helperId}>(inactive helper)</option>}
                  </select>
                </div>
              )}

              </SectionCard>

              {/* ⑥ FEEDBACK + FOLLOW-UP + INCENTIVES */}
              <SectionCard title="Feedback, Follow-up & Incentives">

              {/* Groomer punctuality — drives incentive pay */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Groomer reached on time?</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Toggle off if groomer was late — affects incentive pay</p>
                </div>
                <TogglePill checked={groomerOnTime} onChange={setGroomerOnTime}/>
              </div>

              {/* Review */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Review taken from client?</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Toggle on if groomer collected a review</p>
                </div>
                <TogglePill checked={form.review_taken} onChange={v => set('review_taken', v)}/>
              </div>

              <AnimatePresence>
                {form.review_taken && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="overflow-hidden">
                    <div>
                      <Lbl>Rating <span className="normal-case text-gray-400 font-normal">(optional)</span></Lbl>
                      <StarRating value={form.client_rating} onChange={v => set('client_rating', v)}/>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <Lbl>Follow-up / Due After <span className="normal-case text-gray-400 font-normal">(optional)</span></Lbl>
                {/*
                  Default = "" (no follow-up).  Only ~5% of bookings get
                  a recurring follow-up set, so we don't preselect a
                  cadence.  Selecting the blank option clears any prior
                  value and persists null in `next_due_days` /
                  `next_due_date`.
                */}
                <select
                  value={form.next_due_days == null ? '' : String(form.next_due_days)}
                  onChange={e => set('next_due_days', e.target.value === '' ? null : Number(e.target.value))}
                  className={selectCls}
                >
                  <option value="">— No follow-up —</option>
                  {NEXT_DUE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <p className="text-[11px] text-gray-400 mt-1.5 ml-1">
                  Next due: <span className="font-semibold text-gray-600">{nextDueDateStr}</span>
                </p>
              </div>

              <div>
                <Lbl>Internal Notes</Lbl>
                <AutoTextarea value={form.notes ?? ''} onChange={v => set('notes', v)} placeholder="Notes for the team…"/>
              </div>

              </SectionCard>

              {/* ── Session Chat (coordinator view) ── only shown when editing
                  an existing session and a currentUser is provided.
                  New sessions don't have an id yet, so chat makes no sense. */}
              {editSession?.id && currentUser && (
                <SectionCard title="Session Chat">
                  <SessionChat
                    sessionId={editSession.id}
                    senderType="coordinator"
                    senderId={currentUser.id}
                    senderName={currentUser.name}
                  />
                </SectionCard>
              )}

              <div className="h-1"/>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0 bg-white">
              {error && (
                <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium mb-3">
                  <AlertCircle size={13}/> {error}
                </p>
              )}
              <div className="flex gap-2.5">
                <button onClick={onClose}
                  className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || done}
                  className="flex-[2] py-3 rounded-full bg-sniffy-purple text-white text-sm font-bold hover:bg-purple-900 transition flex items-center justify-center gap-2 disabled:opacity-70">
                  {done ? <><CheckCircle2 size={15}/> Saved!</>
                    : saving ? <><Loader2 size={15} className="animate-spin"/> Saving…</>
                    : editSession ? 'Update Session' : prefill ? 'Convert & Save' : 'Add Session'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Duplicate-entry soft warning — sits above SessionFormModal (z-[60]
        vs z-50) so the form stays visible behind. Mounted unconditionally;
        its own `open` prop gates rendering / animation. */}
    <DuplicateSessionWarningModal
      open={dupOpen}
      matches={dupMatches}
      attemptedName={form.pet_parent_name}
      attemptedDate={form.session_date}
      onConfirm={handleDupConfirm}
      onCancel={handleDupCancel}
    />
    </>
  );
}
