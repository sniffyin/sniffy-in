/**
 * admin/types.ts — Shared TypeScript types & constants for the admin module.
 *
 * Changes:
 *  • SessionStatus — added 'scheduled' | 'groomer_assigned'
 *  • BookingSource — split into InternalSource | ExternalSource
 *  • GroomingSession — added review_taken, add_ons, booking_amount_expr, source_type
 *  • PACKAGES — only 3 packages with prices
 *  • ADD_ONS — new constant with price list
 *  • SOURCE grouped by internal / external
 */

// ─── Database row types ───────────────────────────────────────

export interface GroomingSession {
  id: string;
  session_date: string;
  scheduled_time: string | null;   // e.g. "10:30" — when the grooming is scheduled to begin

  status: SessionStatus;
  is_converted: boolean;

  /** Phase 1 — FK to customers, set automatically by DB trigger
   *  `trg_sessions_upsert_customer` on insert/update based on
   *  normalized phone.  Nullable for legacy rows with no phone. */
  customer_id: string | null;

  pet_parent_name: string;
  phone: string | null;
  address: string | null;
  /** Google Maps share / location URL.  Optional — when set, the groomer
   *  "Navigate" CTA uses this directly; when null/empty the button is
   *  hidden on the groomer side.  Address remains for written / textual
   *  addresses.  See migration 20260515000000_add_gps_location.sql. */
  gps_location: string | null;
  /** Coordinates the `resolve-gps-link` Edge Function resolved out of
   *  gps_location (follows short-link redirects, geocodes as a last
   *  resort) — NULL until a coordinator triggers a resolve from the
   *  day-accordion "Map & route" view.  'approximate' precision means it
   *  came from geocoding a locality name, not an exact address match.
   *  See migration 20260829000000_add_gps_resolved_coords.sql. */
  resolved_lat: number | null;
  resolved_lng: number | null;
  gps_resolved_precision: 'exact' | 'approximate' | null;
  gps_resolved_at: string | null;

  pet_type: 'dog' | 'cat';
  /** Carried over from the source booking's `pet_name` on conversion. Null
   *  for manually-added sessions (no source booking) or pre-existing rows
   *  from before this column existed. See migration
   *  20260901020000_add_pet_name_to_sessions.sql. */
  pet_name: string | null;
  breed: string | null;
  pet_age: string | null;
  /** "Is your pet vaccinated?" — carried over from the source booking on
   *  conversion. Null = unknown (manually-added session, or a pre-existing
   *  row from before this column existed) — the UI shows no badge for null,
   *  distinct from an explicit "not vaccinated". See migration
   *  20260901010000_add_pet_vaccinated_to_sessions.sql. */
  pet_vaccinated: boolean | null;

  source_type: SourceType;
  source: BookingSource;

  booking_amount: number;
  booking_amount_expr: string | null;   // e.g. "1299+290+50"
  platform_commission: number;
  groomer_commission: number;
  net_booking_amount: number;           // computed by DB

  /** Coordinator-set discount off `booking_amount`. `null` = no discount.
   *  Comes out of Sniffy's own margin — platform/groomer commission still
   *  calculate on the gross `booking_amount`. See migration
   *  20260907000000_session_discounts.sql. */
  discount_type: 'flat' | 'percent' | null;
  /** ₹ when discount_type is 'flat', 0-100 when 'percent'. 0 when no discount. */
  discount_value: number;
  discount_amount: number;              // computed by DB — ₹ actually knocked off

  package: string | null;
  add_ons: string[];                    // e.g. ["Deworming", "Medicated Bath"]

  next_due_days: number | null;
  next_due_date: string | null;

  medical_issues: string | null;
  // groomer_observation kept in DB but no longer shown in UI
  groomer_observation: string | null;

  review_taken: boolean;
  client_rating: number | null;
  client_review: string | null;

  groomer_id: string | null;
  groomer_name: string | null;
  groomer_phone: string | null;
  /** Optional helper accompanying the groomer (helpers.id). Column added by 20261018010000. */
  helper_id?: string | null;

  notes: string | null;

  /** Stamped the first time a coordinator clicks the session-card WhatsApp
   *  button. wa.me gives no delivery/read callback, so this only means
   *  "someone opened the compose window" — not that the customer received
   *  or read it. Null = button shows green; set = button shows grey. */
  whatsapp_sent_at: string | null;

  // ─── Groomer-flow milestones (added 2026-05) ────────────────
  // See migration 20260506000000_groomer_session_milestones.sql

  // ARRIVAL
  arrival_marked_at:           string | null;
  arrival_selfie_url:          string | null;
  arrival_bonus_status:        BonusStatus;
  arrival_bonus_approved_by:   string | null;
  arrival_bonus_approved_at:   string | null;
  arrival_bonus_rejected_note: string | null;
  /** Set true when arrival was marked within scheduled_time + 15 min. */
  groomer_on_time:             boolean | null;

  // COMPLETION (groomer's own mark — coordinator still owns `status`)
  groomer_marked_complete_at: string | null;
  /** Auto-generated 4-digit code at row insert; coordinator shares with
   *  customer over WhatsApp; groomer asks for it at the end of the session.
   *  NEVER displayed to groomers. */
  completion_code:        string | null;
  /** Fallback proof when the customer doesn't have the code on hand —
   *  groomer uploads a photo of the groomed pet. */
  completion_photo_url:   string | null;
  /** How the groomer completed: 'code' (verified match) | 'photo' (fallback) */
  completion_method:      'code' | 'photo' | null;

  // PAYMENT
  payment_collected_at: string | null;
  payment_mode:         PaymentMode | null;
  upsell_amount:        number;
  tip_amount:           number;
  /** Generated column: booking_amount + upsell_amount + tip_amount. */
  total_collected:      number;
  payment_notes:        string | null;

  // PAYMENT VERIFICATION (coordinator layer over the groomer's
  // payment_collected_at mark).  See migration 20260519000000_*.sql
  // and `paymentStatusOf()` below.
  payment_verified:     boolean;
  payment_verified_at:  string | null;
  payment_verified_by:  string | null;

  // PAYMENT CHANNEL (added 2026-05-20).  Disambiguates the two
  // payment paths: Sniffy collected the cash vs. the partner platform
  // already settled with the customer (vendor-prepaid).  See
  // migration 20260520000000_add_payment_collected_by.sql.
  //   • 'sniffy'       — Sniffy collected from the customer directly.
  //   • 'vendor'       — Partner (e.g. Woofly) already collected.  No
  //                      cash in Sniffy's hand; commission flow is
  //                      reversed (partner owes Sniffy a groomer fee).
  //   • 'groomer_cash' — Groomer holds the cash, pending office
  //                      deposit.  This is the "Cash w/ Groomer" path.
  payment_collected_by: PaymentCollectedBy;
  /** Stamped when payment_collected_by='vendor' and the coordinator
   *  marks the session paid.  Kept distinct from payment_collected_at
   *  so revenue queries can sum "cash Sniffy actually received"
   *  without subtracting vendor-prepaid amounts after the fact. */
  vendor_settled_at:    string | null;

  // REVIEW CLAIM (groomer's claim layer over canonical client_rating/review)
  review_proof_url:           string | null;
  review_claim_at:            string | null;
  review_claim_rating:        number | null;
  review_claim_status:        BonusStatus;
  review_claim_approved_by:   string | null;
  review_claim_approved_at:   string | null;
  review_claim_rejected_note: string | null;

  created_at: string;
  updated_at: string;
}

/** Status used by both arrival_bonus_status and review_claim_status. */
export type BonusStatus = 'none' | 'pending' | 'approved' | 'rejected';

export type PaymentMode = 'cash' | 'online';

// ─── Payment collector (who held the cash) ────────────────────
//
// Distinct from PaymentMode (cash vs. online — *how* the money moved)
// and PaymentStatus (unpaid / collected / paid — *where* it is in the
// reconciliation journey).  This answers the third question: *who*
// collected it.
//
// For Sniffy's two-channel model:
//   • Internal sources       → default 'sniffy'  (Sniffy collected)
//   • External (Woofly &c.)  → default 'vendor'  (partner pre-collected)
// Coordinators override per session when the default is wrong (e.g. a
// Woofly booking the customer ended up paying Sniffy directly at the
// door).

export type PaymentCollectedBy = 'sniffy' | 'vendor' | 'groomer_cash';

export const PAYMENT_COLLECTED_BY_LABELS: Record<PaymentCollectedBy, string> = {
  sniffy:       'Sniffy',
  vendor:       'Vendor pre-paid',
  groomer_cash: 'Cash w/ Groomer',
};

export const PAYMENT_COLLECTED_BY_SHORT: Record<PaymentCollectedBy, string> = {
  sniffy:       'Sniffy',
  vendor:       'Vendor',
  groomer_cash: 'Groomer',
};

/** Sensible default for a session's collector based on its source.
 *  External sources default to 'vendor' (most common case — partner
 *  has already collected); internal default to 'sniffy'.  Callers
 *  should still let the coordinator override per session. */
export function defaultCollectedBy(source_type: SourceType): PaymentCollectedBy {
  return source_type === 'external' ? 'vendor' : 'sniffy';
}

/** True when the session was pre-paid by the partner platform (cash
 *  never reached Sniffy).  Revenue queries that want "Sniffy's
 *  actual receipts" should exclude rows where this is true. */
export function isVendorPrepaid(
  s: Pick<GroomingSession, 'payment_collected_by'>,
): boolean {
  return s.payment_collected_by === 'vendor';
}

// ─── Payment status (derived, not stored) ─────────────────────
//
// Three buckets — the row's payment journey end-to-end:
//   • unpaid     — no payment recorded yet (default)
//   • collected  — groomer hit "Mark Payment" but coordinator hasn't
//                  reconciled the row.  In the UI, this splits by
//                  payment_mode: cash → "Cash w/ Groomer" (money still
//                  with the groomer), online → "Online · Pending"
//                  (txn not yet verified in the books).
//   • paid       — coordinator has verified.
//
// `paid` is the only state that requires `payment_verified=true`;
// `collected` is derived purely from payment_collected_at being set.

export type PaymentStatus = 'unpaid' | 'collected' | 'paid';

export function paymentStatusOf(s: Pick<GroomingSession, 'payment_verified' | 'payment_collected_at'>): PaymentStatus {
  if (s.payment_verified) return 'paid';
  if (s.payment_collected_at) return 'collected';
  return 'unpaid';
}

/** Mode-aware label — e.g. "Cash w/ Groomer", "Paid · Online". */
export function paymentStatusLabel(s: Pick<GroomingSession, 'payment_verified' | 'payment_collected_at' | 'payment_mode'>): string {
  const status = paymentStatusOf(s);
  if (status === 'unpaid')    return 'Unpaid';
  if (status === 'paid')      return s.payment_mode === 'cash' ? 'Paid · Cash' : 'Paid · Online';
  // collected
  return s.payment_mode === 'cash' ? 'Cash w/ Groomer' : 'Online · Pending';
}

/** Short label for tight UI (badges in dense lists). */
export function paymentStatusShortLabel(s: Pick<GroomingSession, 'payment_verified' | 'payment_collected_at' | 'payment_mode'>): string {
  const status = paymentStatusOf(s);
  if (status === 'unpaid')    return 'Unpaid';
  if (status === 'paid')      return 'Paid';
  return s.payment_mode === 'cash' ? 'Cash Pending' : 'Pending';
}

/** Background/text/border colour tokens per status — used by the
 *  status pill + list-row badges. */
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, { bg: string; text: string; border: string }> = {
  unpaid:    { bg: 'bg-gray-100',     text: 'text-gray-600',    border: 'border-gray-200'    },
  collected: { bg: 'bg-amber-50',     text: 'text-amber-700',   border: 'border-amber-200'   },
  paid:      { bg: 'bg-emerald-50',   text: 'text-emerald-700', border: 'border-emerald-200' },
};

export interface Groomer {
  id: string;
  name: string;
  phone: string;
  areas: string[];
  status: GroomerStatus;
  rating: number;
  total_sessions: number;
  notes: string | null;
  joined_date: string;
  /** Optional Supabase Storage URL — when present, the groomer's top
   *  bar and admin roster show this photo instead of initials.  See
   *  migration 20260516000000_add_groomer_photo.sql. */
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Union string literals ────────────────────────────────────

/**
 * Lifecycle of a session row.
 *
 *   lead → scheduled → groomer_assigned → grooming_done → completed
 *                                                       ↘ cancelled
 *
 * `grooming_done` (added 2026-08-15) is the intermediate state between
 * "a groomer is going" and "this row is finished with".  It means **the
 * grooming physically happened, but the money has not been settled** —
 * the partner platform hasn't paid out yet, or the cash is still in the
 * groomer's pocket.
 *
 * Before it existed those rows had to stay at `groomer_assigned`, which
 * made every "upcoming" count in the app (all written as
 * `status IN ('scheduled','groomer_assigned')`, with no date test) keep
 * counting finished past sessions as upcoming work.
 *
 * `completed` remains the terminal, reconciled state — nothing
 * downgrades a completed row, and no view re-buckets one.
 *
 * Allowed values are also enforced by `grooming_sessions_status_check`
 * in the DB; adding a member here REQUIRES a migration widening that
 * CHECK (see 20260815000000_add_grooming_done_status.sql).
 */
export type SessionStatus =
  | 'lead'
  | 'scheduled'
  | 'groomer_assigned'
  | 'grooming_done'
  | 'completed'
  | 'cancelled';

export type SourceType = 'internal' | 'external';

export type InternalSource =
  | 'direct_call'
  | 'sidharth'
  | 'website_booking'
  | 'instagram_ad'
  | 'facebook_ad'
  | 'sniffy';

export type ExternalSource =
  | 'woofly'
  | 'paw_space'
  | 'oh_my_pet'
  | 'global_pet'
  | 'other';

export type BookingSource = InternalSource | ExternalSource;

export type GroomerStatus = 'active' | 'inactive' | 'on_leave';

// ─── Display maps ─────────────────────────────────────────────

export const STATUS_LABELS: Record<SessionStatus, string> = {
  lead:             'Lead',
  scheduled:        'Scheduled',
  groomer_assigned: 'Groomer Assigned',
  grooming_done:    'Grooming Done',
  completed:        'Completed',
  cancelled:        'Cancelled',
};

// Orange for grooming_done is load-bearing, not decorative: it is the
// "work done, money still out" tone reused by the calendar cells, the
// Financials mix bar and the outstanding-payment strip, so the three
// read as one signal.  Green stays reserved for `completed`.
export const STATUS_COLORS: Record<SessionStatus, string> = {
  lead:             'bg-yellow-50 text-yellow-700',
  scheduled:        'bg-blue-50 text-blue-700',
  groomer_assigned: 'bg-indigo-50 text-indigo-700',
  grooming_done:    'bg-orange-50 text-orange-700',
  completed:        'bg-green-50 text-green-700',
  cancelled:        'bg-red-50 text-red-700',
};

export const INTERNAL_SOURCE_LABELS: Record<InternalSource, string> = {
  sniffy:          'Sniffy App',
  direct_call:     'Direct Call',
  sidharth:  'Sidharth',
  website_booking: 'Website Booking',
  instagram_ad:    'Instagram Ad',
  facebook_ad:     'Facebook Ad',
};

export const EXTERNAL_SOURCE_LABELS: Record<ExternalSource, string> = {
  woofly:     'Woofly',
  paw_space:  'Paw Space',
  oh_my_pet:  'Oh My Pet',
  global_pet: 'Global Pet',
  other:      'Other',
};

// ─── External platform fee rules ──────────────────────────────
//
// Each external booking platform charges Sniffy a commission on every
// booking.  Most platforms use a flat percentage; some — Woofly, today —
// use a *compound* rate where they take an upfront slice and then a
// smaller cut of what's left.  We model both shapes so the UI can show
// the breakdown and the coordinator can edit each component
// independently when policies change.
//
//   • flat       → commission = amount × pct / 100
//   • compound   → upfront    = amount × upfrontPct / 100
//                  residual   = (amount − upfront) × residualPct / 100
//                  commission = upfront + residual
//
// Pure percentage compounds simplify to a single effective rate
// (Woofly: 20% + 1% × 80% = 20.8%), so the math is equivalent to a flat
// 20.8%.  Keeping the compound shape is still worth it: it documents
// *why* the rate is what it is, makes future edits to either component
// a one-line change, and lets the form caption show the breakdown
// transparently.
//
// 'other' is intentionally absent → fully manual entry.

export type FeeRule =
  | { kind: 'flat';     pct: number }
  | { kind: 'compound'; upfrontPct: number; residualPct: number };

export const EXTERNAL_SOURCE_FEE_RULE: Record<string, FeeRule> = {
  // Woofly: 20% upfront + 1% of the remaining 80% (≈ 20.8% effective).
  woofly:     { kind: 'compound', upfrontPct: 20, residualPct: 1 },
  paw_space:  { kind: 'flat', pct: 30 },
  oh_my_pet:  { kind: 'flat', pct: 30 },
  global_pet: { kind: 'flat', pct: 30 },
};

/** Single-rate equivalent of a fee rule (used for display + manual
 *  override seeding).  For flat rules this is just `pct`; for compound
 *  rules it's the algebraically equivalent percentage. */
export function effectivePct(rule: FeeRule): number {
  if (rule.kind === 'flat') return rule.pct;
  return rule.upfrontPct + (100 - rule.upfrontPct) * rule.residualPct / 100;
}

/** Exact commission amount per the rule, rounded once at the end so
 *  the compound math doesn't accumulate sub-rupee drift. */
export function commissionFor(rule: FeeRule, amount: number): number {
  if (rule.kind === 'flat') return Math.round(amount * rule.pct / 100);
  const upfront  = amount * rule.upfrontPct / 100;
  const residual = (amount - upfront) * rule.residualPct / 100;
  return Math.round(upfront + residual);
}

/** Short human-readable hint shown under the Platform ₹ field in the
 *  Session form, so the coordinator sees *why* a number was picked. */
export function feeRuleHint(rule: FeeRule): string {
  if (rule.kind === 'flat') return `${rule.pct}% of booking`;
  const eff = effectivePct(rule);
  return `${rule.upfrontPct}% upfront + ${rule.residualPct}% of remaining ${100 - rule.upfrontPct}% (≈ ${eff.toFixed(1)}%)`;
}

/** Back-compat flat-percentage view of the rule table.  Existing call
 *  sites (auto-fill seeding, day-summary fallback) can keep using this
 *  for the equivalent flat rate; for *exact* commission on a specific
 *  amount, prefer `commissionFor(rule, amount)`. */
export const EXTERNAL_SOURCE_FEE_PCT: Record<string, number> = Object.fromEntries(
  Object.entries(EXTERNAL_SOURCE_FEE_RULE).map(([k, r]) => [k, effectivePct(r)]),
);

// ─── Source-type-agnostic helpers ─────────────────────────────
//
// Some historical rows have `source_type` recorded wrong (e.g. a
// Woofly booking landed with source_type='internal' because the
// screenshot-fill path didn't always set both fields).  Reading
// `source` alone is more reliable — the value is unique to its
// category — so prefer these helpers over the raw `source_type`
// column when classifying / labelling a session.

/** True when the source value is a known external platform.  Defaults
 *  to false (treat anything we don't recognise as internal). */
export function isExternalSource(source: string | null | undefined): boolean {
  if (!source) return false;
  return source in EXTERNAL_SOURCE_LABELS;
}

/** Best-guess display label for a source — checks the external map
 *  first (those names are unique), then the internal map, then falls
 *  back to a capitalised version of the raw value. */
export function resolveSourceLabel(source: string | null | undefined): string {
  if (!source) return 'Unknown';
  const ext = (EXTERNAL_SOURCE_LABELS as Record<string, string>)[source];
  if (ext) return ext;
  const int = (INTERNAL_SOURCE_LABELS as Record<string, string>)[source];
  if (int) return int;
  // Fall back to a tidied version of the raw key so unknown values
  // still read sensibly in summaries.
  return source.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const SOURCE_LABELS: Record<BookingSource, string> = {
  ...INTERNAL_SOURCE_LABELS,
  ...EXTERNAL_SOURCE_LABELS,
};

export const SOURCE_COLORS: Record<BookingSource, string> = {
  sniffy:          '#451a8b',
  direct_call:     '#7c3aed',
  website_booking: '#6d28d9',
  instagram_ad:    '#db2777',
  facebook_ad:     '#2563eb',
  woofly:          '#3b82f6',
  paw_space:       '#10b981',
  oh_my_pet:       '#f97316',
  global_pet:      '#0ea5e9',
  sidharth:        '#f6ac0a',
  other:           '#9ca3af',
};

export const GROOMER_STATUS_LABELS: Record<GroomerStatus, string> = {
  active:   'Active',
  inactive: 'Inactive',
  on_leave: 'On Leave',
};

export const GROOMER_STATUS_COLORS: Record<GroomerStatus, string> = {
  active:   'bg-green-50 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  on_leave: 'bg-orange-50 text-orange-700',
};

// ─── Packages (3 only) with prices ───────────────────────────

export interface PackageOption {
  label: string;
  price: number;
}

export const PACKAGES: PackageOption[] = [
  { label: 'Spa Bath',            price: 799  },
  { label: 'Hair Cut',            price: 999  },
  { label: 'Spa Bath + Hair Cut', price: 1299 },
];

// ─── Add-ons with prices ──────────────────────────────────────

export interface AddOnOption {
  label: string;
  price: number;
  note?: string;          // shown next to price in dropdown
}

export const ADD_ONS: AddOnOption[] = [
  { label: 'Tick & Flea Care',             price: 149, note: 'spot-on cost + ₹149' },
  { label: 'Medicated Bath',               price: 299, note: 'fungal / bacterial' },
  { label: 'Destressing Massage',          price: 299, note: 'coconut / neem oil' },
  { label: 'Hygiene Hair Cut',             price: 299, note: 'face & sanitary' },
  { label: 'Deworming',                    price: 299 },
  { label: 'Special Handling',              price: 199, note: 'senior / strong / reactive dogs' },
  { label: 'De-shedding',                  price: 299, note: 'undercoat removal' },
  { label: 'De-matting',                   price: 299, note: 'mats and tangles' },
];

// ─── Follow-up options ────────────────────────────────────────

export const NEXT_DUE_OPTIONS = [
  { label: '2 weeks (14 days)',   value: 14  },
  { label: '1 month (30 days)',   value: 30  },
  { label: '6 weeks (45 days)',   value: 45  },
  { label: '2 months (60 days)', value: 60  },
  { label: '3 months (90 days)', value: 90  },
  { label: '4 months (120 days)',value: 120 },
  { label: '5 months (150 days)',value: 150 },
  { label: '6 months (180 days)',value: 180 },
];

// ─── Static data: Breeds ──────────────────────────────────────

export const DOG_BREEDS = [
  'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Beagle',
  'Poodle', 'Toy Poodle', 'Mini Poodle', 'Shih Tzu', 'Lhasa Apso',
  'Pomeranian', 'Cocker Spaniel', 'Dachshund', 'Doberman', 'Rottweiler',
  'Boxer', 'Husky', 'Maltese', 'Chihuahua', 'Dalmatian', 'Pug',
  'Bulldog', 'French Bulldog', 'Great Dane', 'Border Collie', 'Chow Chow',
  'Bichon Frise', 'Cavalier King Charles', 'Schnauzer', 'Spitz',
  'Indie (Indian Street Dog)', 'Mixed Breed', 'Other',
];

export const CAT_BREEDS = [
  'Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Ragdoll',
  'Bengal', 'Abyssinian', 'Russian Blue', 'Scottish Fold', 'Bombay',
  'Turkish Angora', 'Exotic Shorthair', 'Devon Rex', 'Sphynx',
  'Indie (Indian Street Cat)', 'Mixed Breed', 'Other',
];

// ─── Formatters ───────────────────────────────────────────────

export function fmtCurrency(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function daysUntil(isoDate: string): number {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
