/**
 * admin/SessionsTab.tsx
 *
 * Responsive dual-mode:
 *   Mobile  (< sm)  → stacked session cards, premium design
 *   Desktop (≥ sm)  → full table
 *
 * Changes vs previous:
 *   • Upcoming / Past subtab pills above the filter bar
 *   • Status options updated: Lead / Scheduled / Groomer Assigned / Completed / Cancelled
 *   • Source options split into Internal and External groups
 *   • timeframe filter wired into filtered computation
 */

import { useEffect, useState, useMemo, useCallback, useRef, memo, lazy, Suspense, type MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronDown,
  Edit2, Trash2, Phone, X, MoreVertical,
  MessageCircle, /* CheckCircle2 removed 2026-05-19 with the Mark-as menu shortcut */ Copy,
  UserPlus, Check, MapPin, Wallet, ChevronsDownUp, ChevronsUpDown,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  GroomingSession,
  SessionStatus,
  PaymentCollectedBy,
  STATUS_LABELS, STATUS_COLORS,
  SOURCE_LABELS, SOURCE_COLORS,
  fmtCurrency, fmtDate, daysUntil,
  paymentStatusOf, isExternalSource,
  PAYMENT_COLLECTED_BY_SHORT,
} from './types';
import SessionFiltersSheet, {
  SessionFilters,
  EMPTY_SESSION_FILTERS,
  countActiveFilters,
  TimeOfDay,
  STATUS_OPTIONS,
  ALL_SOURCE_OPTIONS,
  PAYMENT_COLLECTED_BY_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  TIME_OF_DAY_OPTIONS,
  NEXT_DUE_BUCKETS,
  RATING_BUCKETS,
} from './SessionFiltersSheet';

// Lightweight shape for the Groomed By filter chips — we only need
// name + status to render the list (active first, with the currently
// selected groomer kept around even if they're inactive/on leave).
interface GroomerFilterOption {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'on_leave';
}
// Shape for the inline "Assign" picker on unassigned cards.  We carry
// phone too (unlike GroomerFilterOption) so the assign write can stamp
// grooming_sessions.groomer_phone, which the card's WhatsApp deep-link
// (buildWhatsAppURL) reads back.
export interface AssignGroomer {
  id: string;
  name: string;
  phone: string | null;
  status: 'active' | 'inactive' | 'on_leave';
}
// Lazy: the ~3.3k-line session form (+ its deps) only downloads when a
// coordinator actually opens the add/edit modal, not on every tab load.
const SessionFormModal = lazy(() => import('./SessionFormModal'));
// Lazy: pulls in Leaflet (~150KB) — only fetched when a coordinator
// actually opens the day's Map & Route view.
const DayRouteMapModal = lazy(() => import('./DayRouteMapModal'));
import { getSessionUser } from './authStore';
import { useSessions, patchCachedSession, removeCachedSession, peekCachedSessions } from './sessionsCache';
import PaymentStatusBadge from '../../components/PaymentStatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';
import SessionPetLines from './SessionPetLines';
import { useSessionPetDisplay } from './useSessionPets';
import { petLineText, type DisplayPet } from './sessionPets';


// ─────────────────────────────────────────────────────────────
// Filter data
// ─────────────────────────────────────────────────────────────

/** Filters is now sourced from SessionFiltersSheet so the sheet and the
 *  parent share one shape.  We re-export under the local name for
 *  call-site clarity. */
type Filters = SessionFilters;
const EMPTY_FILTERS = EMPTY_SESSION_FILTERS;

/** Subset of Filters that can be seeded externally (e.g. from the
 *  Overview-tab donut click-throughs).
 *
 *  Callers historically passed singleton strings (`{ source: 'woofly' }`)
 *  back when those filters were single-select.  We now store them as
 *  string arrays internally but accept either shape on the boundary so
 *  AdminDashboard's click-through payload keeps working unchanged.  See
 *  `normalizeInitialFilters()` below for the singleton→array fan-out. */
export type SessionsInitialFilters = {
  source?:             string | string[];
  groomer?:            string | string[];
  status?:             SessionStatus | SessionStatus[];
  petType?:            'dog' | 'cat' | ('dog' | 'cat')[];
  paymentCollectedBy?: PaymentCollectedBy | PaymentCollectedBy[];
  /** Inclusive session_date bounds (YYYY-MM-DD) — used by the Financials
   *  card's click-throughs so "24 groomed this month" opens Sessions
   *  scoped to that same month, not every grooming_done row ever. */
  dateFrom?:           string;
  dateTo?:             string;
};

function toArray<T>(v: T | T[] | undefined | null): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

/** Fan singleton fields out into arrays so the rest of the tab can
 *  reason in a single shape.  Anything not passed defaults to empty
 *  arrays — never undefined. */
function normalizeInitialFilters(init?: SessionsInitialFilters): Partial<Filters> {
  if (!init) return {};
  return {
    source:             toArray(init.source),
    groomer:            toArray(init.groomer),
    status:             toArray(init.status),
    petType:            toArray(init.petType),
    paymentCollectedBy: toArray(init.paymentCollectedBy),
    dateFrom:           init.dateFrom ?? '',
    dateTo:             init.dateTo ?? '',
  };
}


// ─────────────────────────────────────────────────────────────
// Due date badge
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// WhatsApp pre-formatted message builder
// ─────────────────────────────────────────────────────────────

// Plain "10AM, 7th Sep (Monday)" — time first, then the full date with
// weekday. Always the actual date (never "today"/"tomorrow") and no WhatsApp
// bold markers, so the message reads the same regardless of when it's sent.
function formatScheduledTime(date: string, time: string | null): string {
  const d = new Date(date);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let timeStr = '';
  if (time) {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    timeStr = `${h12}${m > 0 ? ':' + String(m).padStart(2, '0') : ''}${ampm}`;
  }

  const day = d.getUTCDate();
  const suffix = day === 1 || day === 21 || day === 31 ? 'st'
    : day === 2 || day === 22 ? 'nd'
    : day === 3 || day === 23 ? 'rd' : 'th';
  const dateStr = `${day}${suffix} ${monthNames[d.getUTCMonth()]} (${dayNames[d.getUTCDay()]})`;

  return timeStr ? `${timeStr}, ${dateStr}` : dateStr;
}

// Compact "DD-MM-YY" for the card date chip — saves horizontal space vs. fmtDate.
// session_date is a Postgres `date`, delivered as "YYYY-MM-DD"; parse the parts
// directly to avoid any timezone shift.
function formatDateCompact(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return fmtDate(iso);
  return `${d}-${m}-${y.slice(2)}`;
}

// Weekday-aware date for the mobile accordion header — "27 Aug, Thu" reads
// faster for planning than the bare "27 Aug 2026" fmtDate gives everywhere
// else. Built manually (rather than one Intl call) because we want the
// weekday trailing the day/month, which isn't a stock Intl ordering. Year
// only shown when it isn't the current one (rare — scrolled a long way
// back/forward), to keep the header compact.
function formatDateWithWeekday(iso: string): string {
  const d = new Date(iso);
  const dayMonth = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' });
  const year = d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : '';
  return `${dayMonth}${year}, ${weekday}`;
}

// Shortens a multi-word groomer name for the per-day pills — first name in
// full, remaining words collapsed to initials — e.g. "Hemant Ramesh
// Pardeshi" -> "Hemant RP", "Sidharth Nanda" -> "Sidharth N".
export function abbreviateGroomerName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  const initials = parts.slice(1).map(p => p.charAt(0).toUpperCase()).join('');
  return `${parts[0]} ${initials}`;
}

// Compact "h:mm AM/PM" for the card time pill. Returns null when no time set.
// scheduled_time is a Postgres `time` column, delivered as "HH:MM:SS".
function formatTimeAMPM(time: string | null | undefined): string | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h)) return null;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

// "h AM/PM" on the hour, "h:mm AM/PM" otherwise, for a given
// minutes-since-midnight value, wrapping past 1440 (only matters for a
// session scheduled in the last hour before midnight).
function formatClockTime(totalMinutes: number): string {
  const m = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}${min > 0 ? ':' + String(min).padStart(2, '0') : ''} ${ampm}`;
}

// "7 Sep(Mon), 10:00 AM - 11:00 AM" — plain numeric date with short weekday
// (no "Today"/"Tomorrow", no ordinal suffix), then a one-hour arrival window rather than the exact
// scheduled time. Messaging-only — the DB still stores the precise
// scheduled_time; this is purely so the customer doesn't read "10:00 AM" as
// a to-the-minute promise. Distinct from formatScheduledTime above, which keeps the exact,
// non-ranged time for the groomer message; this one feeds the customer
// messages.
function formatScheduledTimePlain(date: string, time: string | null): string {
  const d = new Date(date);
  const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let timeStr = '';
  if (time) {
    const [h, m] = time.split(':').map(Number);
    const startMinutes = h * 60 + m;
    timeStr = `${formatClockTime(startMinutes)} - ${formatClockTime(startMinutes + 60)}`;
  }

  const dayLabel = `${d.getUTCDate()} ${monthNames[d.getUTCMonth()]}(${dayShort[d.getUTCDay()]})`;

  return timeStr ? `${dayLabel}, ${timeStr}` : dayLabel;
}

function buildWhatsAppURL(session: GroomingSession, pets?: DisplayPet[]): string {
  const dateTime = formatScheduledTimePlain(session.session_date, session.scheduled_time);
  const packageLine = [session.package, ...(session.add_ons ?? [])].filter(Boolean).join(' + ') || 'N/A';
  // net_booking_amount already nets out discount_amount (see migration
  // 20260907000000_session_discounts.sql), so this needs no extra math —
  // the breakdown lines below are purely for the customer's benefit.
  const amount = session.net_booking_amount > 0 ? session.net_booking_amount : session.booking_amount;
  const discountAmt = Number(session.discount_amount) || 0;
  const petType = session.pet_type ? session.pet_type.charAt(0).toUpperCase() + session.pet_type.slice(1) : null;

  const msg = [
    `Dear ${session.pet_parent_name},`,
    ``,
    `Your grooming appointment with Sniffy is confirmed`,
    ``,
    `Date & Time: ${dateTime}`,
    // Multi-pet: one line per pet with its own service (and price, when the
    // session was priced per pet).  Single pet: unchanged.
    ...(pets && pets.length > 1
      ? [`Pets:`, ...pets.map(p => `• ${petLineText(p, { showAmount: true })}`)]
      : [`Pet: ${petType ? `${petType}, ` : ''}${session.breed ?? 'N/A'}`,
         `Service: ${packageLine}`]),
    ...(discountAmt > 0 ? [
      `Price: ₹${session.booking_amount}/-`,
      `Discount: -₹${discountAmt}${session.discount_type === 'percent' ? ` (${session.discount_value}% off)` : ' off'}`,
    ] : []),
    `Payable: ${amount > 0 ? `₹${amount}` : 'N/A'}`,
    ``,
    `Address: ${session.address ?? 'N/A'}`,
    `Contact: ${formatPhoneGrouped(session.phone)}`,
    ``,
    `Thank you for choosing Sniffy!`,
  ].join('\n');

  const phone = (session.phone ?? '').replace(/\D/g, '');
  const dialCode = phone.startsWith('91') ? phone : `91${phone}`;
  return `https://wa.me/${dialCode}?text=${encodeURIComponent(msg)}`;
}

// Groomer + completion code are withheld from the initial confirmation
// above: groomer is picked by route close to the day, so naming one early
// risks handing the customer a name/number that later changes. This second
// message is sent by hand (the "R" button, visible only after the
// confirmation above has been sent) once the groomer is actually locked in,
// typically in the last couple hours before the session.
function buildReminderWhatsAppURL(session: GroomingSession): string {
  const dateTime = formatScheduledTimePlain(session.session_date, session.scheduled_time);

  const msg = [
    `Hi there,`,
    `Just a reminder, you have an upcoming grooming session at ${dateTime}.`,
    `Here are your groomer details:`,
    ``,
    session.groomer_name
      ? `Groomer : ${session.groomer_name.trim().split(/\s+/)[0]}${session.groomer_phone ? `(${session.groomer_phone})` : ''}`
      : `Groomer : To be assigned`,
    ...(session.completion_code
      ? [`Completion Code : ${session.completion_code}`]
      : []),
    ``,
    `Thank you,`,
    `Team Sniffy.`,
  ].join('\n');

  const phone = (session.phone ?? '').replace(/\D/g, '');
  const dialCode = phone.startsWith('91') ? phone : `91${phone}`;
  return `https://wa.me/${dialCode}?text=${encodeURIComponent(msg)}`;
}

// wa.me gives no delivery/read callback — this only records that a
// coordinator opened the compose window, not that the customer got the
// message. One-way: once set, the button stays grey. Fire-and-forget is
// fine here (cosmetic marker, not data the app depends on elsewhere).
function markWhatsAppSent(sessionId: string) {
  const now = new Date().toISOString();
  patchCachedSession(sessionId, { whatsapp_sent_at: now });
  supabase.from('grooming_sessions').update({ whatsapp_sent_at: now }).eq('id', sessionId)
    .then(({ error }) => {
      if (error) console.error('Failed to mark WhatsApp sent:', error.message);
    });
}

// "9503354823" → "95033 54823".  Cosmetic only — matches the 5+5 grouping
// the coordinator uses by hand in the groomer brief.  Anything that isn't a
// plain 10-digit Indian number is passed through untouched.
function formatPhoneGrouped(phone: string | null | undefined): string {
  const raw = (phone ?? '').trim();
  if (!raw) return 'N/A';                       // null *or* '' — some rows store blanks
  const d = raw.replace(/\D/g, '');
  const local = d.length === 12 && d.startsWith('91') ? d.slice(2) : d;
  return local.length === 10 ? `${local.slice(0, 5)} ${local.slice(5)}` : raw;
}

// The *groomer* brief — the second WhatsApp the coordinator sends for every
// session (the first, buildWhatsAppURL above, goes to the pet parent).  It is
// a job sheet, not a confirmation: where to go, what to do, what to collect.
//
// Two deliberate differences from the customer message:
//  • Amount is the GROSS booking_amount (less any discount) — that's what the
//    groomer collects at the door.  net_booking_amount is post-commission
//    (what Sniffy keeps) and would under-charge the customer if it ever
//    reached the groomer.
//  • A payment note line follows the amount, driven by the session's channel:
//    vendor-prepaid → don't collect; cash path → no note; everything else →
//    the standard "avoid cash" nudge.
//
// Sends to groomer_phone when a groomer is assigned; otherwise opens WhatsApp
// with no recipient so the coordinator can pick the contact themselves.
function buildGroomerWhatsAppURL(session: GroomingSession, pets?: DisplayPet[]): string {
  const dateTime = formatScheduledTime(session.session_date, session.scheduled_time);
  const packageLine = [session.package, ...(session.add_ons ?? [])].filter(Boolean).join(' + ') || 'N/A';
  const discountAmt = Number(session.discount_amount) || 0;
  const amount = session.booking_amount > 0
    ? session.booking_amount - discountAmt
    : session.net_booking_amount;

  const paymentNote =
    session.payment_collected_by === 'vendor'
      ? '(VENDOR PRE-PAID — DO NOT COLLECT)'
      : session.payment_mode === 'cash' || session.payment_collected_by === 'groomer_cash'
        ? null
        : '(PLEASE AVOID CASH PAYMENT)';

  const msg = [
    dateTime,
    ``,
    `Name : ${session.pet_parent_name}`,
    `Phone : ${formatPhoneGrouped(session.phone)}`,
    ...(session.pet_name?.trim() ? [`Pet Name : ${session.pet_name.trim()}`] : []),
    ``,
    ...(pets && pets.length > 1
      ? [`Pets (${pets.length}):`, ...pets.map((p, i) => `${i + 1}. ${petLineText(p)}`)]
      : [`Breed: ${session.breed ?? 'N/A'}`,
         `Package: ${packageLine}`]),
    ``,
    `Amount Payable : ${amount > 0 ? amount + '/-' : 'N/A'}`,
    ...(discountAmt > 0 ? [`(₹${discountAmt} discount already applied — do not collect full price)`] : []),
    ...(paymentNote ? [paymentNote] : []),
    ``,
    `Address: ${session.address ?? 'N/A'}`,
    ...(session.gps_location?.trim()
      ? [``, `Location: ${session.gps_location.trim()}`]
      : []),
  ].join('\n');

  const text = encodeURIComponent(msg);
  const phone = (session.groomer_phone ?? '').replace(/\D/g, '');
  if (!phone) return `https://wa.me/?text=${text}`;
  const dialCode = phone.startsWith('91') ? phone : `91${phone}`;
  return `https://wa.me/${dialCode}?text=${text}`;
}

function DueDateBadge({ iso }: { iso: string }) {
  const days = daysUntil(iso);
  const cls  = days < 0   ? 'text-red-600 bg-red-50'
             : days <= 7  ? 'text-amber-700 bg-amber-50'
             :               'text-gray-500 bg-gray-50';
  const label = days < 0   ? `${Math.abs(days)}d overdue`
              : days === 0 ? 'Due today'
              : days <= 30 ? `${days}d`
              :               fmtDate(iso);
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

// ─────────────────────────────────────────────────────────────
// Card urgency — "does this row need me right now?"
// ─────────────────────────────────────────────────────────────
// Repurposes the left rail from encoding *status* to encoding *urgency*
// so a wall of settled rows fades back and the few needing action pop:
//   action    (red)   — no groomer yet, or overdue (past & not groomed)
//   attention (amber) — happening today & not done, or groomed-but-unpaid
//   settled   (grey)  — future & assigned, completed & paid, or cancelled
type CardUrgency = 'action' | 'attention' | 'settled';

function sessionUrgency(s: GroomingSession, today: string): CardUrgency {
  if (s.status === 'cancelled') return 'settled';
  const isPast  = s.session_date < today;
  const isToday = s.session_date === today;
  // `grooming_done` joins `completed` on the delivered side of this
  // branch.  Left on the other side it would have hit the `isPast →
  // action` rule and painted every groomed-but-unsettled row red, as
  // though the groomer had never turned up — when in fact the visit
  // happened and only the money is outstanding.  That is an amber
  // question, not a red one, and a wall of false red is exactly what
  // this rail was built to prevent.
  if (s.status !== 'completed' && s.status !== 'grooming_done') {
    if (!s.groomer_name) return 'action';   // unassigned — the #1 thing to fix
    if (isPast)          return 'action';   // overdue and still not done
    if (isToday)         return 'attention';
    return 'settled';
  }
  // delivered → the only open question left is whether the money landed
  return paymentStatusOf(s) !== 'paid' ? 'attention' : 'settled';
}

const URGENCY_RAIL: Record<CardUrgency, string> = {
  action:    '#e24b4a',   // red
  attention: '#ef9f27',   // amber
  settled:   '#e2e0d8',   // quiet grey — recedes
};

// Compact labels used ONLY on the mobile session card's status pill.
// We use a shorter "Assigned" for groomer_assigned so the pill doesn't
// push the ⋮ menu off the right edge of the card.  The full label
// ("Groomer Assigned") is still used everywhere else (filters, modal,
// admin tables) via STATUS_LABELS in types.ts.
// `grooming_done` gets "Groomed" here for the same reason — the full
// "Grooming Done" wraps the pill onto two lines on a 375px card.
const CARD_STATUS_LABELS: Record<SessionStatus, string> = {
  lead:             'Lead',
  scheduled:        'Scheduled',
  groomer_assigned: 'Assigned',
  grooming_done:    'Groomed',
  completed:        'Completed',
  cancelled:        'Cancelled',
};

// ─────────────────────────────────────────────────────────────
// Card ··· action menu
// ─────────────────────────────────────────────────────────────

function CardMenu({
  onEdit, onCopy, onDelete, onMessageGroomer, canWrite, canDelete, completionCode,
  // session + onStatusChange used to feed the now-commented "Mark
  // as <next>" shortcut.  Reinstate the props if you uncomment that
  // menu item below.
}: {
  onEdit: () => void;
  onCopy: () => void;
  onDelete: () => void;
  /** Opens the groomer job-sheet WhatsApp draft (buildGroomerWhatsAppURL). */
  onMessageGroomer: () => void;
  canWrite: boolean;
  canDelete: boolean;
  // Completion code moved off the card face (was truncated noise in row
  // 1) — surfaced here on demand, where an admin actually needs it.
  completionCode?: string | null;
}) {
  // Why portal + fixed positioning?
  // The SessionCard wrapper uses `overflow-hidden` so the left accent bar
  // stays clipped to the rounded corners.  That overflow boundary also
  // clipped this dropdown — `z-index` can't escape an `overflow: hidden`
  // ancestor.  Rendering the menu into document.body via createPortal
  // takes it out of the card's stacking/clipping context, and `position:
  // fixed` against the trigger button's getBoundingClientRect() keeps it
  // anchored without needing a `relative` parent.
  //
  // CAVEAT that bit us: createPortal moves the menu out of the DOM, but
  // React synthetic events still bubble up the *React* tree — so a click
  // on a menu item also reaches SessionCardBase's root `onClick`, which
  // calls `onEdit(session)`.  For "Create a copy" that meant openCopy()
  // and openEdit() both ran in the same batch and edit won, so the
  // coordinator got "Edit Session" on the original row instead of a new
  // copy (fixed 2026-08-10).  Every item below MUST stopPropagation.
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Menu geometry — keep in sync with the rendered className (w-48).
  // Used both for placement math and the flip-up check.
  const MENU_WIDTH = 192;            // w-48
  const MENU_HEIGHT_EST = 220;       // ~5 items at py-3 + borders; estimate
  const GAP = 4;                     // small breathing room below button

  function computePosition() {
    const btn = btnRef.current;
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Right-align the menu under the button (matches old `right-0` look).
    let left = r.right - MENU_WIDTH;
    // Don't run off the left edge on narrow viewports.
    if (left < 8) left = 8;
    // Or the right edge.
    if (left + MENU_WIDTH > vw - 8) left = vw - MENU_WIDTH - 8;

    // Default: drop below.  If not enough room, flip above the button.
    let top = r.bottom + GAP;
    if (top + MENU_HEIGHT_EST > vh - 8 && r.top - MENU_HEIGHT_EST - GAP > 8) {
      top = r.top - MENU_HEIGHT_EST - GAP;
    }
    return { top, left };
  }

  function toggle(e?: ReactMouseEvent) {
    e?.stopPropagation();
    if (!open) {
      const p = computePosition();
      if (p) setPos(p);
    }
    setOpen(o => !o);
  }

  // Outside-click closes — must check both the button and the portaled menu,
  // since they're no longer DOM siblings.
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  // Close on scroll/resize — cheaper than tracking the trigger and avoids
  // a stale menu hanging in mid-air.  `capture: true` so we catch scroll
  // on any ancestor scroller (the page itself usually scrolls the cards).
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-400 shrink-0"
      >
        <MoreVertical size={15}/>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && pos && (
            <motion.div
              ref={menuRef}
              initial={{ opacity:0, scale:0.95, y:-4 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.95, y:-4 }}
              transition={{ duration:0.12 }}
              className="fixed z-[60] bg-white rounded-xl border border-gray-100 w-48 overflow-hidden"
              style={{ top: pos.top, left: pos.left, boxShadow:'0 8px 24px rgba(0,0,0,0.10)' }}
              // Belt-and-suspenders for the portal-bubbling caveat above:
              // stops any click that lands on the menu chrome (gaps,
              // borders) — or on a menu item added later that forgets to
              // stopPropagation — from reaching the card's open-edit handler.
              onClick={(e) => e.stopPropagation()}
            >
              {/* Menu order: Edit session → Create a copy → Delete.
                  The "Mark as <next status>" shortcut was removed per
                  product feedback (2026-05-19) — status changes should
                  go through the edit modal, not a one-click menu item.
                  Keeping the code commented in case we want to bring
                  it back behind a setting. */}
              {canWrite && (
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); onEdit(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-sniffy-purple transition">
                  <Edit2 size={14}/>
                  Edit session
                </button>
              )}
              {canWrite && (
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); onCopy(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-sniffy-purple transition">
                  <Copy size={14}/>
                  Create a copy
                </button>
              )}
              {/* Groomer job sheet.  The card's green button already covers
                  the customer message; this is the second WhatsApp the
                  coordinator sends for the same session. */}
              <button type="button"
                onClick={(e) => { e.stopPropagation(); onMessageGroomer(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition border-t border-gray-50">
                <MessageCircle size={14}/>
                Message groomer
              </button>
              {completionCode && (
                <button type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard?.writeText(completionCode).catch(() => {});
                    setCopied(true);
                    setTimeout(() => { setCopied(false); setOpen(false); }, 800);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-sniffy-purple transition border-t border-gray-50">
                  {copied ? <Check size={14} className="text-green-600"/> : <Copy size={14}/>}
                  <span>{copied ? 'Copied!' : 'Code'}</span>
                  <span className="ml-auto font-mono font-bold tracking-widest text-gray-800">{completionCode}</span>
                </button>
              )}
              {/* ── REMOVED 2026-05-19: status-shortcut menu item ──
              {canWrite && (
                <button type="button"
                  onClick={() => { onStatusChange(session.id, next); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-sniffy-purple transition">
                  <CheckCircle2 size={14}/>
                  Mark as {STATUS_LABELS[next]}
                </button>
              )}
              ─────────────────────────────────────────────────────── */}
              {canDelete && (
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition">
                  <Trash2 size={14}/>
                  Delete
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Inline groomer-assign bottom sheet
// ─────────────────────────────────────────────────────────────
// Opened from the "Assign" button on an unassigned card.  Deliberately
// lightweight — a searchable list of active groomers; picking one calls
// onPick and closes.  We portal to <body> and use a bottom sheet on
// mobile / centered card on desktop, matching the app's other overlays.
function GroomerAssignSheet({
  open, onClose, groomers, currentGroomerId, onPick, petParentName,
}: {
  open: boolean;
  onClose: () => void;
  groomers: AssignGroomer[];
  currentGroomerId: string | null;
  onPick: (g: AssignGroomer) => void;
  petParentName: string;
}) {
  const [query, setQuery] = useState('');

  // Reset the search box each time the sheet reopens so a stale filter
  // from a previous card doesn't hide everyone.
  useEffect(() => { if (open) setQuery(''); }, [open]);

  // Ghost-click shield: for a beat after the sheet closes, keep a
  // transparent full-screen catcher mounted so the mobile browser's
  // trailing synthetic click (fired ~300ms after the tap that dismissed
  // the sheet) is absorbed instead of landing on a card below and popping
  // its edit modal.  Covers taps that land on any card, not just the one
  // that owns this sheet.
  const [shield, setShield] = useState(false);
  const prevOpen = useRef(open);
  useEffect(() => {
    const wasOpen = prevOpen.current;
    prevOpen.current = open;
    if (wasOpen && !open) {
      setShield(true);
      const t = setTimeout(() => setShield(false), 450);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Esc closes, matching the other overlays.
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  const q = query.trim().toLowerCase();
  const matches = groomers.filter(g =>
    !q || g.name.toLowerCase().includes(q) || (g.phone ?? '').includes(q)
  );

  return createPortal(
    <>
    {shield && !open && (
      <div
        className="fixed inset-0 z-[68]"
        onClickCapture={(e) => { e.stopPropagation(); }}
        aria-hidden="true"
      />
    )}
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[70vh]"
            style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.18)' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="px-5 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="text-[15px] font-extrabold text-gray-900">Assign a groomer</h3>
                <button type="button" onClick={onClose}
                  className="w-8 h-8 -mr-1 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
                  <X size={17} />
                </button>
              </div>
              <p className="text-xs text-gray-400 truncate">For {petParentName}</p>
              <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-xl px-3 h-10 border border-gray-100">
                <Search size={15} className="text-gray-400 shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search groomers"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="overflow-y-auto py-1.5">
              {matches.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-400">
                  {groomers.length === 0 ? 'No active groomers found.' : `No groomers match “${query}”.`}
                </p>
              ) : (
                matches.map(g => {
                  const isCurrent = g.id === currentGroomerId;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => onPick(g)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-purple-50 transition text-left"
                    >
                      <span className="w-9 h-9 rounded-full bg-purple-100 text-sniffy-purple flex items-center justify-center text-sm font-extrabold shrink-0">
                        {g.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-gray-800 truncate">{g.name}</span>
                        {g.phone && <span className="block text-xs text-gray-400 truncate">{g.phone}</span>}
                      </span>
                      {isCurrent && <Check size={17} className="text-sniffy-purple shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>,
    document.body,
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile Session Card
// ─────────────────────────────────────────────────────────────

/**
 * One session row.
 *
 * Wrapped in React.memo (see `SessionCard` below the definition) because a
 * page shows 15 of these, each with framer-motion animation and a portalled
 * menu — re-rendering the lot on every unrelated state change (toast shown,
 * sheet toggled, search keystroke) was a visible cost.
 *
 * For the memo to actually bite, the callbacks must be referentially stable
 * across renders.  That's why they take the session as an argument instead
 * of closing over it: the parent can then hoist them into `useCallback` and
 * pass the same function object every time, rather than minting a fresh
 * `() => openEdit(s)` per row per render.
 */
function SessionCardBase({
  session, pets, onEdit, onCopy, onDelete, onAssign, groomers, canWrite, canDelete, today,
}: {
  session: GroomingSession;
  /** Per-pet lines when this session covers more than one pet. */
  pets?: DisplayPet[];
  onEdit: (s: GroomingSession) => void;
  onCopy: (s: GroomingSession) => void;
  onDelete: (s: GroomingSession) => void;
  onAssign: (sessionId: string, g: AssignGroomer) => void;
  groomers: AssignGroomer[];
  canWrite: boolean;
  canDelete: boolean;
  today: string;
}) {
  const [assignOpen, setAssignOpen] = useState(false);
  // Guards the card's open-edit onClick against the "ghost click" that a
  // mobile browser fires ~300ms after a tap: opening/closing the assign
  // sheet (portalled above the card) can otherwise leave a trailing click
  // that lands on the card underneath and pops the full edit modal open.
  // We stamp a short window on every sheet open/close and swallow card
  // clicks inside it.
  const suppressEditUntil = useRef(0);
  const suppressEdit = () => { suppressEditUntil.current = Date.now() + 700; };
  const sourceColor = SOURCE_COLORS[session.source];

  // Urgency drives the left rail (see sessionUrgency).  Settled rows also
  // recede a touch (lighter shadow) so the action/attention rows carry
  // the eye.
  const urgency  = sessionUrgency(session, today);
  const railColor = URGENCY_RAIL[urgency];
  const settled   = urgency === 'settled';

  return (
    <motion.div
      initial={{ opacity:0, y:8 }}
      animate={{ opacity:1, y:0 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex cursor-pointer"
      style={{ boxShadow: settled ? '0 2px 8px rgba(0,0,0,0.05)' : '0 4px 16px rgba(0,0,0,0.10)' }}
      whileTap={{ scale:0.99 }}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if (assignOpen || Date.now() < suppressEditUntil.current) { e.stopPropagation(); return; }
        onEdit(session);
      }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(session); } }}
      title="Open session details"
    >
      {/* Left urgency rail — red = needs action, amber = today/unpaid,
          grey = settled.  Repurposed from the old status-colour bar. */}
      <div className="w-1.5 shrink-0" style={{ background: railColor }}/>

      <div className="flex-1 min-w-0 px-3 py-2">

        {/* Row 1: date · time · [payment · status · ⋮]
            The completion code moved into the ⋮ menu (2026-07-28) — it was
            truncated noise here and squeezed the status pills.  Right
            cluster is shrink-0 so ⋮ is never pushed out. */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs text-gray-400 font-medium shrink-0">{formatDateCompact(session.session_date)}</span>
          {formatTimeAMPM(session.scheduled_time) && (
            <span
              className="shrink-0 inline-flex items-center h-6 leading-none rounded-full bg-amber-50 border border-amber-200 px-2.5 text-[11px] font-bold text-amber-700 whitespace-nowrap"
              title={`Scheduled at ${formatTimeAMPM(session.scheduled_time)}`}
            >
              {formatTimeAMPM(session.scheduled_time)}
            </span>
          )}
          <div className="flex items-center gap-1 ml-auto shrink-0 min-w-0">
            <PaymentStatusBadge session={session} variant="short" className="h-6"/>
            <span
              title={STATUS_LABELS[session.status]}
              className={`inline-flex items-center h-6 leading-none text-[10px] font-bold px-2.5 rounded-full whitespace-nowrap ${STATUS_COLORS[session.status]}`}
            >
              {CARD_STATUS_LABELS[session.status]}
            </span>
            <CardMenu
              onEdit={() => onEdit(session)}
              onCopy={() => onCopy(session)}
              onDelete={() => onDelete(session)}
              onMessageGroomer={() => window.open(buildGroomerWhatsAppURL(session, pets), '_blank', 'noopener,noreferrer')}
              canWrite={canWrite}
              canDelete={canDelete}
              completionCode={session.completion_code}
            />
          </div>
        </div>

        {/* Row 2: name + phone */}
        <div className="flex items-center gap-2 mb-1">
          <p className="font-extrabold text-gray-900 text-[15px] leading-tight truncate flex-1">
            {session.pet_parent_name}
          </p>
          {session.phone && (
            <a href={`tel:${session.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-sniffy-purple transition bg-gray-50 hover:bg-purple-50 px-2 py-0.5 rounded-full">
              <Phone size={11}/>{session.phone}
            </a>
          )}
        </div>

        {/* Row 3: pet info + source dot */}
        {pets && pets.length > 1 ? (
          <div className="flex items-start gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <SessionPetLines pets={pets} showAmounts />
            </div>
            <span className="flex items-center gap-1 shrink-0 pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sourceColor }}/>
              <span className="text-[10px] font-semibold text-gray-400">{SOURCE_LABELS[session.source]}</span>
            </span>
          </div>
        ) : (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">{session.pet_type === 'dog' ? '🐶' : '🐱'}</span>
          {session.pet_name && (
            <span className="text-xs font-extrabold text-sniffy-purple truncate">
              {session.pet_name}
            </span>
          )}
          <span className="text-xs font-semibold text-gray-700 truncate">
            {session.breed ?? 'Unknown breed'}
          </span>
          {session.pet_age && <span className="text-xs text-gray-400 shrink-0">· {session.pet_age}</span>}
          <span className="ml-auto flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sourceColor }}/>
            <span className="text-[10px] font-semibold text-gray-400">{SOURCE_LABELS[session.source]}</span>
          </span>
        </div>
        )}

        {/* Row 3b: locality — routing context for "which groomer?".
            Uses the free-text address; truncated to one line. */}
        {session.address && (
          <div className="flex items-center gap-1 mb-1 text-[11px] text-gray-400 min-w-0">
            <MapPin size={11} className="shrink-0"/>
            <span className="truncate">{session.address}</span>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-1.5"/>

        {/* Row 4: financials — collapse to a single figure when nothing
            was taken off the top; show the gross→net split + commission
            only when they differ.  A channel chip answers "who collects?" */}
        <div className="flex items-center gap-2 mb-1.5">
          {session.booking_amount > 0 ? (
            session.net_booking_amount === session.booking_amount ? (
              <span className="text-sm font-extrabold text-green-600">{fmtCurrency(session.booking_amount)}</span>
            ) : (
              <>
                <span className="text-xs text-gray-400 line-through">{fmtCurrency(session.booking_amount)}</span>
                <span className="text-sm font-extrabold text-green-600">{fmtCurrency(session.net_booking_amount)}</span>
                {Number(session.discount_amount) > 0 && (
                  <span className="text-[10px] font-semibold text-sniffy-purple shrink-0">
                    −{fmtCurrency(session.discount_amount)} off
                  </span>
                )}
                {isExternalSource(session.source) && session.booking_amount - session.discount_amount > session.net_booking_amount && (
                  <span className="text-[10px] font-semibold text-red-500 shrink-0">
                    −{fmtCurrency(session.booking_amount - session.discount_amount - session.net_booking_amount)} comm.
                  </span>
                )}
              </>
            )
          ) : (
            <span className="text-xs text-gray-400 italic">No amount recorded</span>
          )}
          <span
            className="ml-auto shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5"
            title={`Payment collected by ${PAYMENT_COLLECTED_BY_SHORT[session.payment_collected_by]}`}
          >
            <Wallet size={10} className="text-gray-400"/>
            {PAYMENT_COLLECTED_BY_SHORT[session.payment_collected_by]}
          </span>
        </div>

        {/* Row 5: groomer + due date pill + WhatsApp button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {session.groomer_name ? (
              <>
                <span className="w-5 h-5 rounded-full bg-purple-100 text-sniffy-purple flex items-center justify-center text-[10px] font-extrabold shrink-0">
                  {session.groomer_name.charAt(0).toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 truncate">{abbreviateGroomerName(session.groomer_name)}</span>
              </>
            ) : canWrite ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); suppressEdit(); setAssignOpen(true); }}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-sniffy-purple transition-all active:scale-95 hover:opacity-90"
                title="Assign a groomer to this session"
              >
                <UserPlus size={13}/>
                Assign
              </button>
            ) : (
              <span className="text-xs text-gray-300 italic">No groomer assigned</span>
            )}
            {session.next_due_date && (
              <span className="shrink-0 ml-1">
                <DueDateBadge iso={session.next_due_date}/>
              </span>
            )}
          </div>

          {session.phone && (
            <a
              href={buildWhatsAppURL(session, pets)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                if (!session.whatsapp_sent_at) markWhatsAppSent(session.id);
              }}
              aria-label={session.whatsapp_sent_at ? 'WhatsApp message already sent' : 'Send WhatsApp message'}
              title={
                session.whatsapp_sent_at
                  ? `Sent ${new Date(session.whatsapp_sent_at).toLocaleString()}`
                  : 'Send WhatsApp message'
              }
              className="shrink-0 flex items-center justify-center px-2.5 py-1.5 rounded-xl text-white transition-all active:scale-95"
              style={
                session.whatsapp_sent_at
                  ? { background: '#9ca3af', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }
                  : { background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', boxShadow: '0 2px 6px rgba(37,211,102,0.35)' }
              }
            >
              <MessageCircle size={15}/>
            </a>
          )}

          {session.phone && session.whatsapp_sent_at && (
            <a
              href={buildReminderWhatsAppURL(session)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Send groomer reminder WhatsApp message"
              title="Send groomer reminder (name & number) to the customer"
              className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] font-bold transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #f6ac0a 0%, #d98c00 100%)', boxShadow: '0 2px 6px rgba(246,172,10,0.35)' }}
            >
              R
            </a>
          )}
        </div>

      </div>

      <GroomerAssignSheet
        open={assignOpen}
        onClose={() => { suppressEdit(); setAssignOpen(false); }}
        groomers={groomers}
        currentGroomerId={session.groomer_id}
        petParentName={session.pet_parent_name}
        onPick={(g) => { suppressEdit(); setAssignOpen(false); onAssign(session.id, g); }}
      />
    </motion.div>
  );
}

/** Memoised card — see the note on SessionCardBase.  The default shallow
 *  prop comparison is exactly what we want here: `session` objects are
 *  replaced wholesale by the cache on update, so identity equality is a
 *  correct "did this row change?" test. */
const SessionCard = memo(SessionCardBase);

// ─────────────────────────────────────────────────────────────
// Active pills row
// ─────────────────────────────────────────────────────────────
//
// Renders one removable pill per active filter dimension.  Multi-select
// dimensions collapse to a single summary pill (e.g. "Status: 3" rather
// than three separate chips) so the row stays compact at the top of the
// list — tapping the × clears the whole dimension.  Individual values
// can still be added/removed via the sheet.  This keeps mobile cleanly
// scannable: "what am I filtered to right now?" is answerable in one
// glance even with 10+ active filters.

function ActivePillsRow({
  filters, setFilters,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) {
  function clear<K extends keyof Filters>(k: K, v: Filters[K]) {
    setFilters(prev => ({ ...prev, [k]: v }));
  }

  const pills: { key: string; label: React.ReactNode; onClear: () => void; dot?: string }[] = [];

  if (filters.timeframe) {
    pills.push({
      key: 'timeframe',
      label: filters.timeframe === 'upcoming' ? '📅 Upcoming' : '🕐 Past',
      onClear: () => clear('timeframe', ''),
    });
  }
  // month + dayOfWeek pills removed 2026-06-02 — date-range covers
  // both without two extra dimensions cluttering the pills strip.
  if (filters.dateFrom || filters.dateTo) {
    pills.push({
      key: 'dateRange',
      label: `${filters.dateFrom || '…'} → ${filters.dateTo || '…'}`,
      onClear: () => setFilters(p => ({ ...p, dateFrom: '', dateTo: '' })),
    });
  }
  if (filters.timeOfDay.length) {
    const labels = filters.timeOfDay.map(t => TIME_OF_DAY_OPTIONS.find(o => o.value === t)?.label).filter(Boolean).join(', ');
    pills.push({ key: 'tod', label: labels, onClear: () => clear('timeOfDay', []) });
  }
  if (filters.status.length) {
    if (filters.status.length === 1) {
      const opt = STATUS_OPTIONS.find(o => o.value === filters.status[0]);
      pills.push({ key: 'status', label: opt?.label ?? filters.status[0], dot: opt?.dot, onClear: () => clear('status', []) });
    } else {
      pills.push({ key: 'status', label: `Status · ${filters.status.length}`, onClear: () => clear('status', []) });
    }
  }
  if (filters.source.length) {
    if (filters.source.length === 1) {
      const opt = ALL_SOURCE_OPTIONS.find(o => o.value === filters.source[0]);
      pills.push({ key: 'source', label: opt?.label ?? filters.source[0], onClear: () => clear('source', []) });
    } else {
      pills.push({ key: 'source', label: `Source · ${filters.source.length}`, onClear: () => clear('source', []) });
    }
  }
  if (filters.paymentCollectedBy.length) {
    if (filters.paymentCollectedBy.length === 1) {
      const opt = PAYMENT_COLLECTED_BY_OPTIONS.find(o => o.value === filters.paymentCollectedBy[0]);
      pills.push({ key: 'paidBy', label: opt?.label ?? filters.paymentCollectedBy[0], dot: opt?.dot, onClear: () => clear('paymentCollectedBy', []) });
    } else {
      pills.push({ key: 'paidBy', label: `Collected by · ${filters.paymentCollectedBy.length}`, onClear: () => clear('paymentCollectedBy', []) });
    }
  }
  if (filters.paymentStatus.length) {
    if (filters.paymentStatus.length === 1) {
      const opt = PAYMENT_STATUS_OPTIONS.find(o => o.value === filters.paymentStatus[0]);
      pills.push({ key: 'payStatus', label: opt?.label ?? filters.paymentStatus[0], dot: opt?.dot, onClear: () => clear('paymentStatus', []) });
    } else {
      pills.push({ key: 'payStatus', label: `Payment · ${filters.paymentStatus.length}`, onClear: () => clear('paymentStatus', []) });
    }
  }
  if (filters.paymentMode.length) {
    pills.push({
      key: 'payMode',
      label: filters.paymentMode.length === 1
        ? (filters.paymentMode[0] === 'cash' ? '💵 Cash' : '💳 Online')
        : `Mode · ${filters.paymentMode.length}`,
      onClear: () => clear('paymentMode', []),
    });
  }
  if (filters.paymentVerified) {
    pills.push({
      key: 'payVerified',
      label: filters.paymentVerified === 'yes' ? 'Verified' : 'Unverified',
      onClear: () => clear('paymentVerified', ''),
    });
  }
  if (filters.groomer.length) {
    pills.push({
      key: 'groomer',
      label: filters.groomer.length === 1
        ? `✂️ ${filters.groomer[0]}`
        : `Groomer · ${filters.groomer.length}`,
      onClear: () => clear('groomer', []),
    });
  }
  if (filters.petType.length) {
    pills.push({
      key: 'petType',
      label: filters.petType.length === 1
        ? (filters.petType[0] === 'dog' ? '🐶 Dog' : '🐱 Cat')
        : '🐾 Dogs + Cats',
      onClear: () => clear('petType', []),
    });
  }
  if (filters.breeds.length) {
    pills.push({
      key: 'breeds',
      label: filters.breeds.length === 1 ? filters.breeds[0] : `Breed · ${filters.breeds.length}`,
      onClear: () => clear('breeds', []),
    });
  }
  if (filters.hasMedical) {
    pills.push({
      key: 'medical',
      label: filters.hasMedical === 'yes' ? '🩺 Has medical' : 'No medical',
      onClear: () => clear('hasMedical', ''),
    });
  }
  if (filters.packages.length) {
    pills.push({
      key: 'packages',
      label: filters.packages.length === 1 ? filters.packages[0] : `Package · ${filters.packages.length}`,
      onClear: () => clear('packages', []),
    });
  }
  if (filters.addOns.length) {
    pills.push({
      key: 'addOns',
      label: filters.addOns.length === 1 ? filters.addOns[0] : `Add-ons · ${filters.addOns.length}`,
      onClear: () => clear('addOns', []),
    });
  }
  if (filters.amountMin != null || filters.amountMax != null) {
    const lo = filters.amountMin != null ? `₹${filters.amountMin}` : '₹0';
    const hi = filters.amountMax != null ? `₹${filters.amountMax}` : '∞';
    pills.push({
      key: 'amount',
      label: `${lo} – ${hi}`,
      onClear: () => setFilters(p => ({ ...p, amountMin: null, amountMax: null })),
    });
  }
  if (filters.hasTip) pills.push({ key: 'tip', label: filters.hasTip === 'yes' ? 'Tip > 0' : 'No tip', onClear: () => clear('hasTip', '') });
  if (filters.hasUpsell) pills.push({ key: 'upsell', label: filters.hasUpsell === 'yes' ? 'Upsell > 0' : 'No upsell', onClear: () => clear('hasUpsell', '') });
  if (filters.nextDue.length) {
    pills.push({
      key: 'nextDue',
      label: filters.nextDue.length === 1
        ? (NEXT_DUE_BUCKETS.find(b => b.value === filters.nextDue[0])?.label ?? filters.nextDue[0])
        : `Follow-up · ${filters.nextDue.length}`,
      onClear: () => clear('nextDue', []),
    });
  }
  if (filters.rating.length) {
    pills.push({
      key: 'rating',
      label: filters.rating.length === 1
        ? (RATING_BUCKETS.find(b => b.value === filters.rating[0])?.label ?? filters.rating[0])
        : `Rating · ${filters.rating.length}`,
      onClear: () => clear('rating', []),
    });
  }
  if (filters.reviewTaken) pills.push({ key: 'review', label: filters.reviewTaken === 'yes' ? 'Review ✓' : 'No review', onClear: () => clear('reviewTaken', '') });
  if (filters.arrivalOnTime) pills.push({ key: 'arrival', label: filters.arrivalOnTime === 'yes' ? 'On time' : 'Late arrival', onClear: () => clear('arrivalOnTime', '') });
  if (filters.bonusPending) pills.push({ key: 'bonus', label: filters.bonusPending === 'yes' ? '⏳ Bonus pending' : 'No bonus pending', onClear: () => clear('bonusPending', '') });
  if (filters.hasNotes) pills.push({ key: 'notes', label: filters.hasNotes === 'yes' ? '📝 Notes' : 'No notes', onClear: () => clear('hasNotes', '') });
  if (filters.hasCompletionPhoto) pills.push({ key: 'photo', label: filters.hasCompletionPhoto === 'yes' ? '📷 Photo' : 'No photo', onClear: () => clear('hasCompletionPhoto', '') });
  if (filters.hasGps) pills.push({ key: 'gps', label: filters.hasGps === 'yes' ? '📍 GPS' : 'No GPS', onClear: () => clear('hasGps', '') });
  if (filters.customerId) {
    pills.push({
      key: 'customer',
      label: `👤 ${filters.customerLabel || 'Customer'}`,
      onClear: () => setFilters(p => ({ ...p, customerId: null, customerLabel: '' })),
    });
  }

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-3 pb-3 border-t border-gray-100 pt-2.5">
      {pills.map(p => (
        <span key={p.key}
              className="flex items-center gap-1 h-6 px-2.5 rounded-full bg-purple-50 text-sniffy-purple text-xs font-semibold border border-purple-100">
          {p.dot && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.dot }}/>}
          {p.label}
          <button onClick={p.onClear}
                  className="ml-0.5 hover:opacity-70 -mr-0.5"
                  aria-label="Remove filter">
            <X size={10}/>
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => setFilters(prev => ({ ...EMPTY_SESSION_FILTERS, search: prev.search }))}
        className="flex items-center gap-1 h-6 px-2.5 rounded-full text-xs font-bold text-red-500 hover:bg-red-50 transition"
      >
        Clear all
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Tab
// ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 30;

export default function SessionsTab({
  canDelete = true,
  canWrite = true,
  openModalTrigger = 0,
  initialFilters,
  initialFiltersTrigger = 0,
}: {
  canDelete?: boolean;
  canWrite?: boolean;
  openModalTrigger?: number;   // incremented by parent (FAB) to open the add modal
  /** Filters to apply on mount and whenever `initialFiltersTrigger` ticks.
   *  Driven by the Overview tab's donut click-throughs so a coordinator
   *  can land on the Sessions list pre-scoped to a source or groomer. */
  initialFilters?: SessionsInitialFilters;
  /** Counter — bumping it re-applies `initialFilters` on top of the
   *  current state.  We re-apply (vs. replace) so a click-through doesn't
   *  wipe an in-flight search the coordinator typed manually. */
  initialFiltersTrigger?: number;
}) {
  // The full session list comes from the dashboard-wide snapshot
  // (sessionsCache.ts).  This tab used to re-query Postgres every time a
  // status/source/groomer pill was toggled — a network round-trip per
  // click.  Now it holds the whole set once and narrows it locally, so
  // filtering is instant and tab switches reuse the cached rows.
  const {
    sessions,
    loading,
    refresh: refreshSessionList,
  } = useSessions();
  // Seed filters from `initialFilters` so a click-through from the
  // Overview dashboard lands the user on a pre-scoped list rather than
  // an empty one they then have to refilter manually.  AdminDashboard
  // historically passes singletons (`source: 'woofly'`); normaliser
  // fans them into arrays for our new multi-select shape.
  const [filters, setFilters]         = useState<Filters>(() => ({
    ...EMPTY_FILTERS,
    ...normalizeInitialFilters(initialFilters),
  }));
  // ── Debounced search ────────────────────────────────────────
  //
  // The raw keystrokes live here rather than in `filters`, and only land
  // in `filters.search` once typing pauses.  That split is the whole point:
  // `filters` is a dependency of the expensive `filtered` memo, and
  // `setFilter` builds a brand-new object every call — so writing each
  // keystroke straight into it would invalidate the memo on every letter
  // and re-run a ~30-predicate scan of the entire table per character.
  // Keeping the in-progress text out of `filters` means the object stays
  // referentially stable while the user types.
  const [searchInput, setSearchInput] = useState(filters.search);
  useEffect(() => {
    if (searchInput === filters.search) return;
    const t = setTimeout(() => setFilter('search', searchInput), 180);
    return () => clearTimeout(t);
    // setFilter is a stable local closure over setFilters/setPage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, filters.search]);

  // Whether the bottom-sheet filter drawer is open.  All non-search
  // filter mutation happens inside the sheet now; this tab only owns
  // the trigger + active-pills row.
  const [sheetOpen, setSheetOpen]     = useState(false);
  // Per-day groomer drill-down (mobile date groups only) — keyed by
  // session_date, value is the groomer name selected for that day or
  // null for "all groomers". Deliberately separate from `filters.groomer`:
  // this narrows one day's card list, not the whole result set/pagination.
  const [dayGroomerFilter, setDayGroomerFilter] = useState<Record<string, string | null>>({});
  // Per-day collapse (mobile date groups only) — keyed by session_date.
  // Absence of a key means "default": today's group is open, every other
  // date starts collapsed so a busy week of leads/pre-bookings doesn't
  // bury today's list. A stored `true`/`false` overrides that default once
  // the coordinator taps a date header.
  const [dayOpenOverride, setDayOpenOverride] = useState<Record<string, boolean>>({});
  // Tracks which direction the header's expand/collapse-all toggle should
  // act in next — flips on every press. Doesn't try to read back the true
  // per-day state (a coordinator may have hand-toggled a few days since);
  // it's a bulk action, not a live indicator.
  const [allDaysExpanded, setAllDaysExpanded] = useState(false);
  // Day whose "Map & Route" modal is open (mobile day-accordions only).
  // Carries that day's own item list along so the modal doesn't need to
  // re-derive it from the memoized `grouped` array below, which is
  // recomputed inline inside the render IIFE and isn't in component scope.
  const [mapModalDay, setMapModalDay] = useState<{ date: string; items: GroomingSession[] } | null>(null);
  // Groomer options for the "Groomer" section inside the sheet.  We
  // fetch ALL (not just active) so a row scoped to an inactive/on-leave
  // groomer (e.g. via Overview donut click-through) still renders that
  // chip — otherwise the active filter would silently vanish from the
  // sheet UI.
  const [groomerOptions, setGroomerOptions] = useState<GroomerFilterOption[]>([]);
  useEffect(() => {
    supabase.from('groomers').select('id, name, status').order('name')
      .then(({ data }) => setGroomerOptions((data ?? []) as GroomerFilterOption[]));
  }, []);
  // Active groomers (with phone) for the inline card Assign picker.  Kept
  // separate from groomerOptions above, which is only id/name/status for
  // the filter sheet — the picker also needs phone to stamp groomer_phone.
  const [assignGroomers, setAssignGroomers] = useState<AssignGroomer[]>([]);
  useEffect(() => {
    supabase.from('groomers').select('id, name, phone, status')
      .eq('status', 'active').order('name')
      .then(({ data }) => setAssignGroomers((data ?? []) as AssignGroomer[]));
  }, []);
  // Success/error feedback for the inline assign action.
  const [assignToast, setAssignToast] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  useEffect(() => {
    if (!assignError) return;
    const t = setTimeout(() => setAssignError(null), 5000);
    return () => clearTimeout(t);
  }, [assignError]);
  const [page, setPage]               = useState(0);
  // Mobile card list uses infinite scroll instead of the desktop table's
  // Prev/Next pagination — how many of `filtered` are currently rendered,
  // growing by PAGE_SIZE as the sentinel below scrolls into view. Kept
  // separate from `page`/`PAGE_SIZE` (desktop) so the two views don't
  // fight over the same cursor.
  const [mobileVisibleCount, setMobileVisibleCount] = useState(PAGE_SIZE);
  const [mobileLoadingMore, setMobileLoadingMore]   = useState(false);
  const mobileLoadingMoreRef = useRef(false);
  const mobileSentinelRef    = useRef<HTMLDivElement>(null);
  // Auto-scroll target for today's date group — see the effect near
  // `mobileItems` below for why this exists.
  const todayGroupRef        = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editSession, setEditSession] = useState<GroomingSession | null>(null);
  // Source row for the "Create a copy" flow.  Mutually exclusive with
  // editSession — both are passed to the modal which branches on whichever
  // is set.  We clear both whenever the modal closes (see onClose below).
  const [copySession, setCopySession] = useState<GroomingSession | null>(null);

  // Pending-delete state for the Sniffy-styled ConfirmDialog (replaces
  // the old window.confirm popup).  When set, the dialog is open and
  // shows the row's details; clicking "Delete session" runs the
  // archive-then-delete flow with `deleteBusy` flipping the spinner.
  const [pendingDelete, setPendingDelete] = useState<GroomingSession | null>(null);
  const [deleteBusy,    setDeleteBusy]    = useState(false);
  // Error toast for the rare archive/delete failure path — replaces the
  // old window.alert.  Plain string keeps the wiring trivial.
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Open the add-session modal whenever the parent increments openModalTrigger
  const prevTriggerRef = useRef(0);
  useEffect(() => {
    if (openModalTrigger > 0 && openModalTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = openModalTrigger;
      setEditSession(null);
      setCopySession(null);
      setModalOpen(true);
    }
  }, [openModalTrigger]);

  // Re-apply `initialFilters` whenever the parent bumps the trigger.
  // We merge on top of EMPTY_FILTERS (rather than the current state) so
  // clicking through to "Hemant" doesn't leave the previous "Woofly"
  // source filter silently stacked underneath.  Skips the initial 0 so
  // we don't double-apply what the useState initialiser already did.
  const prevFilterTriggerRef = useRef(initialFiltersTrigger);
  useEffect(() => {
    if (initialFiltersTrigger === prevFilterTriggerRef.current) return;
    prevFilterTriggerRef.current = initialFiltersTrigger;
    const next = { ...EMPTY_FILTERS, ...normalizeInitialFilters(initialFilters) };
    setFilters(next);
    // Keep the debounced search box in step with the reset, otherwise the
    // input would still show text that's no longer being applied.
    setSearchInput(next.search);
    setPage(0);
    // initialFilters is intentionally NOT in deps: we only react to the
    // counter so callers can pass a fresh object every render without
    // unintentionally retriggering on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFiltersTrigger]);

  // These five used to be pushed down to Postgres as `.in()` predicates,
  // which meant every pill toggle re-ran the query and re-downloaded the
  // result.  Since we now hold the whole table in the shared snapshot
  // anyway, they're plain equality checks folded into the same client-side
  // pass as everything else — identical results, zero network.
  const fetchSessions = refreshSessionList;

  const today = new Date().toISOString().slice(0, 10);

  // ── Client-side filtering for everything that isn't a server-side
  //    `.in()`.  All dimensions are AND-combined; within a dimension
  //    the array values are OR-combined.  Empty array / '' / null on a
  //    dimension means "no filter" — the default match-everything.
  // Memoised: this predicate is ~30 checks deep and runs over every row
  // in the table.  Un-memoised it re-ran on every render — including each
  // keystroke in the search box and every unrelated bit of local state
  // (menu open, toast shown, modal toggled).
  const filtered = useMemo(() => sessions.filter(s => {
    // ─ Dimensions formerly pushed down to SQL as `.in()` ─────
    const matchStatus    = !filters.status.length  || filters.status.includes(s.status);
    const matchSource    = !filters.source.length  || filters.source.includes(s.source);
    const matchGroomer   = !filters.groomer.length
      || (s.groomer_name != null && filters.groomer.includes(s.groomer_name));
    const matchPetType   = !filters.petType.length || filters.petType.includes(s.pet_type);
    const matchCollectBy = !filters.paymentCollectedBy.length
      || filters.paymentCollectedBy.includes(s.payment_collected_by);

    const q = filters.search.toLowerCase();
    const matchSearch = !q
      || s.pet_parent_name.toLowerCase().includes(q)
      || (s.phone ?? '').includes(q)
      || (s.breed ?? '').toLowerCase().includes(q)
      || (s.groomer_name ?? '').toLowerCase().includes(q)
      || (s.notes ?? '').toLowerCase().includes(q);

    // ─ When ──────────────────────────────────────────────────
    const matchTimeframe = !filters.timeframe
      || (filters.timeframe === 'upcoming' && s.session_date >= today)
      || (filters.timeframe === 'past'     && s.session_date <  today);
    const matchDateFrom  = !filters.dateFrom || s.session_date >= filters.dateFrom;
    const matchDateTo    = !filters.dateTo   || s.session_date <= filters.dateTo;
    const matchTod       = !filters.timeOfDay.length || (() => {
      if (!s.scheduled_time) return false;
      const h = parseInt(s.scheduled_time.slice(0, 2), 10);
      const bucket: TimeOfDay = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
      return filters.timeOfDay.includes(bucket);
    })();

    // ─ Payment (derived dimensions) ──────────────────────────
    const matchPayStatus = !filters.paymentStatus.length
      || filters.paymentStatus.includes(paymentStatusOf(s));
    const matchPayMode   = !filters.paymentMode.length
      || (s.payment_mode != null && filters.paymentMode.includes(s.payment_mode));
    const matchPayVerified = !filters.paymentVerified
      || (filters.paymentVerified === 'yes' &&  s.payment_verified)
      || (filters.paymentVerified === 'no'  && !s.payment_verified);

    // ─ Pet ───────────────────────────────────────────────────
    const matchBreed     = !filters.breeds.length
      || (s.breed != null && filters.breeds.includes(s.breed));
    const matchMedical   = !filters.hasMedical
      || (filters.hasMedical === 'yes' && !!(s.medical_issues ?? '').trim())
      || (filters.hasMedical === 'no'  &&  !(s.medical_issues ?? '').trim());

    // ─ Service ───────────────────────────────────────────────
    const matchPackage   = !filters.packages.length
      || (s.package != null && filters.packages.includes(s.package));
    const matchAddOns    = !filters.addOns.length
      || (s.add_ons ?? []).some(a => filters.addOns.includes(a));

    // ─ Amount ────────────────────────────────────────────────
    const matchAmtMin    = filters.amountMin == null || s.booking_amount >= filters.amountMin;
    const matchAmtMax    = filters.amountMax == null || s.booking_amount <= filters.amountMax;
    const matchTip       = !filters.hasTip
      || (filters.hasTip === 'yes' && s.tip_amount > 0)
      || (filters.hasTip === 'no'  && s.tip_amount <= 0);
    const matchUpsell    = !filters.hasUpsell
      || (filters.hasUpsell === 'yes' && s.upsell_amount > 0)
      || (filters.hasUpsell === 'no'  && s.upsell_amount <= 0);

    // ─ Next due ──────────────────────────────────────────────
    const matchNextDue   = !filters.nextDue.length || filters.nextDue.some(bucket => {
      const due = s.next_due_date;
      if (bucket === 'none') return !due;
      if (bucket === 'has')  return !!due;
      if (!due) return false;
      const d = daysUntil(due);
      if (bucket === 'overdue') return d < 0;
      if (bucket === 'today')   return d === 0;
      if (bucket === '7d')      return d >= 0 && d <= 7;
      if (bucket === '30d')     return d >= 0 && d <= 30;
      return false;
    });

    // ─ Quality ───────────────────────────────────────────────
    const matchRating    = !filters.rating.length || filters.rating.some(bucket => {
      const r = s.client_rating;
      if (bucket === 'unrated')  return r == null;
      if (r == null) return false;
      if (bucket === '5')        return r >= 5;
      if (bucket === '4')        return r >= 4;
      if (bucket === '3orLess')  return r <= 3;
      return false;
    });
    const matchReviewTaken = !filters.reviewTaken
      || (filters.reviewTaken === 'yes' &&  s.review_taken)
      || (filters.reviewTaken === 'no'  && !s.review_taken);
    const matchArrival   = !filters.arrivalOnTime
      || (filters.arrivalOnTime === 'yes' && s.groomer_on_time === true)
      || (filters.arrivalOnTime === 'no'  && s.groomer_on_time === false);
    const matchBonus     = !filters.bonusPending
      || (filters.bonusPending === 'yes' && (s.arrival_bonus_status === 'pending' || s.review_claim_status === 'pending'))
      || (filters.bonusPending === 'no'  && s.arrival_bonus_status !== 'pending' && s.review_claim_status !== 'pending');

    // ─ Other ─────────────────────────────────────────────────
    const matchNotes     = !filters.hasNotes
      || (filters.hasNotes === 'yes' && !!(s.notes ?? '').trim())
      || (filters.hasNotes === 'no'  &&  !(s.notes ?? '').trim());
    const matchPhoto     = !filters.hasCompletionPhoto
      || (filters.hasCompletionPhoto === 'yes' && !!s.completion_photo_url)
      || (filters.hasCompletionPhoto === 'no'  &&  !s.completion_photo_url);
    const matchGps       = !filters.hasGps
      || (filters.hasGps === 'yes' && !!(s.gps_location ?? '').trim())
      || (filters.hasGps === 'no'  &&  !(s.gps_location ?? '').trim());
    // Phase 2b — customer scope.  We rely on the Phase 1 customer_id
    // trigger having backfilled every session, so a missing customer_id
    // here means a legacy row with no phone (correctly excluded when
    // scoping to a customer).
    const matchCustomer  = !filters.customerId || s.customer_id === filters.customerId;

    return matchStatus && matchSource && matchGroomer && matchPetType && matchCollectBy
      && matchSearch
      && matchTimeframe && matchDateFrom && matchDateTo && matchTod
      && matchPayStatus && matchPayMode && matchPayVerified
      && matchBreed && matchMedical
      && matchPackage && matchAddOns
      && matchAmtMin && matchAmtMax && matchTip && matchUpsell
      && matchNextDue
      && matchRating && matchReviewTaken && matchArrival && matchBonus
      && matchNotes && matchPhoto && matchGps
      && matchCustomer;
    // Keep newest day first (matches the DB order), but within a day sort
    // by scheduled_time ascending — earliest appointment first — since the
    // DB query only orders by session_date and leaves same-day rows in
    // whatever order they were inserted. Undated sessions sort last within
    // their day.
  }).sort((a, b) => {
    if (a.session_date !== b.session_date) return a.session_date < b.session_date ? 1 : -1;
    if (!a.scheduled_time) return b.scheduled_time ? 1 : 0;
    if (!b.scheduled_time) return -1;
    return a.scheduled_time < b.scheduled_time ? -1 : a.scheduled_time > b.scheduled_time ? 1 : 0;
  }), [sessions, filters, today]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = useMemo(
    () => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filtered, page],
  );

  // Per-pet lines for multi-pet sessions on screen (desktop page or mobile
  // scroll window — whichever is larger).  One batched query; empty if the
  // data isn't available, in which case cards just keep the single-pet view.
  const petTargets = useMemo(
    () => filtered.slice(0, Math.max(mobileVisibleCount, (page + 1) * PAGE_SIZE)),
    [filtered, mobileVisibleCount, page],
  );
  const petDisplay = useSessionPetDisplay(petTargets);

  // Mobile's infinite-scroll window into the same `filtered` array.
  const mobileItems = useMemo(
    () => filtered.slice(0, mobileVisibleCount),
    [filtered, mobileVisibleCount],
  );

  // Every date the current filter could group into a day-accordion — built
  // off `filtered` rather than `mobileItems` so bulk-expanding also covers
  // days that haven't scrolled into view yet.
  const allSessionDates = useMemo(
    () => Array.from(new Set(filtered.map(s => s.session_date))),
    [filtered],
  );

  // Bucket the mobile-revealed rows by session_date (consecutive rows share
  // a day since `mobileItems` is already sorted by session_date desc).
  // Memoised because the mobile card list — and this grouping pass — sits
  // in the JSX tree (just `sm:hidden`) even on desktop, so without this it
  // recomputed on every unrelated re-render regardless of viewport.
  const mobileGroupedByDay = useMemo(() => {
    const grouped: { date: string; items: GroomingSession[] }[] = [];
    for (const s of mobileItems) {
      const last = grouped[grouped.length - 1];
      if (last && last.date === s.session_date) last.items.push(s);
      else grouped.push({ date: s.session_date, items: [s] });
    }
    return grouped;
  }, [mobileItems]);

  function toggleExpandCollapseAll() {
    const next = !allDaysExpanded;
    setAllDaysExpanded(next);
    setDayOpenOverride(Object.fromEntries(allSessionDates.map(d => [d, next])));
  }

  // A new filter/search result set should start back at the top rather
  // than staying scrolled 300 cards deep into the *previous* query.
  // `filters` gets a fresh object identity on every change (see setFilter
  // below), so this fires exactly when the result set actually changes.
  useEffect(() => {
    setMobileVisibleCount(PAGE_SIZE);
  }, [filters]);

  // Re-arm the scroll-to-today effect below whenever the underlying data
  // changes identity — a cold load or a post-save `refresh()` — but NOT on
  // a plain filter/search tweak, which shouldn't yank the coordinator's
  // scroll position back down to today.
  const autoScrolledToTodayRef = useRef(false);
  useEffect(() => { autoScrolledToTodayRef.current = false; }, [sessions]);

  // Mobile groups sessions by date with the newest date first, so a week
  // full of upcoming bookings sorts *above* today and buries its accordion
  // well below the fold. Once the data (re)loads, jump straight to it —
  // widening the infinite-scroll window first if today's group hasn't
  // been revealed yet, since scrollIntoView is a no-op on an unmounted ref.
  useEffect(() => {
    if (autoScrolledToTodayRef.current || loading) return;
    const idx = filtered.findIndex(s => s.session_date === today);
    if (idx === -1) { autoScrolledToTodayRef.current = true; return; }
    if (mobileVisibleCount <= idx) {
      setMobileVisibleCount(idx + 1);
      return;
    }
    todayGroupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    autoScrolledToTodayRef.current = true;
  }, [filtered, mobileVisibleCount, loading, today]);

  // Reveal the next batch once the sentinel scrolls near the viewport.
  // The data is already in memory (see sessionsCache.ts) — the short
  // delay + skeleton is purely so "loading more" reads as a deliberate
  // beat instead of the list instantly snapping 30 cards taller.
  useEffect(() => {
    const el = mobileSentinelRef.current;
    if (!el || mobileVisibleCount >= filtered.length) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !mobileLoadingMoreRef.current) {
        mobileLoadingMoreRef.current = true;
        setMobileLoadingMore(true);
        setTimeout(() => {
          setMobileVisibleCount(c => Math.min(filtered.length, c + PAGE_SIZE));
          setMobileLoadingMore(false);
          mobileLoadingMoreRef.current = false;
        }, 400);
      }
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [mobileVisibleCount, filtered.length]);

  function setFilter<K extends keyof Filters>(k: K, v: Filters[K]) {
    setFilters(prev => ({ ...prev, [k]: v }));
    setPage(0);
  }

  // These three are handed straight to the memoised SessionCard, so they
  // must keep a stable identity across renders — otherwise every card
  // re-renders on every parent render and the memo buys nothing.  They
  // only call setState, so the dep list is genuinely empty.
  function openAdd()  { setEditSession(null); setCopySession(null); setModalOpen(true); }
  const openEdit = useCallback((s: GroomingSession) => { setEditSession(s); setCopySession(null); setModalOpen(true); }, []);
  const openCopy = useCallback((s: GroomingSession) => { setEditSession(null); setCopySession(s); setModalOpen(true); }, []);

  // ───────────────────────────────────────────────────────────
  // Soft-delete: archive then remove
  //
  // We don't truly delete sessions — every row moves to the
  // `archive_bookings` table first so we keep an audit trail of
  // cancellations / mistaken entries / cleanups.  See migration
  // 20260521000000_create_archive_bookings.sql.
  //
  // Flow:
  //   1. handleDelete(session) opens a Sniffy-styled ConfirmDialog
  //      (replaces the old window.confirm) showing the row's
  //      details so the coordinator can't fat-finger the wrong one.
  //   2. confirmDelete() — fired by the dialog's confirm button —
  //      inserts a copy into archive_bookings (with archived_at /
  //      archived_by metadata).
  //   3. Hard-deletes from grooming_sessions only if the archive
  //      insert succeeded — otherwise we'd lose data.
  //   4. Refetch the list.
  // ───────────────────────────────────────────────────────────
  const handleDelete = useCallback((session: GroomingSession) => {
    setDeleteError(null);
    setPendingDelete(session);
  }, []);

  async function confirmDelete() {
    const session = pendingDelete;
    if (!session) return;

    setDeleteBusy(true);
    setDeleteError(null);

    // 1. Archive — snapshot every field except `id` into the
    //    payload JSON.  `id` is stored separately as `original_id`
    //    on the archive row so we keep a traceable link back to
    //    the session that was deleted, without colliding with the
    //    archive table's own primary key.
    const { id: _omit, ...payload } = session as GroomingSession & Record<string, unknown>;
    void _omit;
    const { data: userData } = await supabase.auth.getUser();
    const archiveRow = {
      original_id : session.id,
      payload,                    // entire session snapshot as JSON
      archived_by : userData?.user?.id ?? null,
      archived_at : new Date().toISOString(),
    };

    const { error: archiveErr } = await supabase
      .from('archive_bookings')
      .insert(archiveRow);

    if (archiveErr) {
      // Bail without deleting — better to leave the active row in
      // place than lose it to a failed archive write.  We surface
      // the error inside the dialog so the user knows nothing was
      // touched, and the row stays selected so they can retry.
      setDeleteError(`Could not archive session: ${archiveErr.message}. Nothing was deleted.`);
      setDeleteBusy(false);
      return;
    }

    // 2. Now hard-delete from the active table.
    const { error: delErr } = await supabase
      .from('grooming_sessions')
      .delete()
      .eq('id', session.id);

    if (delErr) {
      setDeleteError(`Archived OK, but delete failed: ${delErr.message}`);
      setDeleteBusy(false);
      return;
    }

    setDeleteBusy(false);
    setPendingDelete(null);
    // The row is gone for certain — drop it from the shared snapshot
    // instead of re-downloading the whole table to learn the same thing.
    removeCachedSession(session.id);
  }

  const quickStatusChange = useCallback(async (id: string, status: string) => {
    await supabase.from('grooming_sessions').update({ status }).eq('id', id);
    // Write through the shared snapshot rather than local state, so the
    // Overview and Calendar tabs see the new status too.
    patchCachedSession(id, { status: status as SessionStatus });
  }, []);

  // Inline assign from an unassigned card.  Stamps groomer identity and,
  // when the session is still pre-assignment (lead/scheduled), advances
  // status to groomer_assigned so the card's urgency clears.  We never
  // downgrade a completed/cancelled row's status.  Optimistic update with
  // rollback on failure so the list reflects the change without a refetch.
  const assignGroomer = useCallback(async (sessionId: string, g: AssignGroomer) => {
    // Read the row from the cache rather than closing over `sessions`, so
    // this callback stays referentially stable for the memoised cards.
    const target = (peekCachedSessions() ?? []).find(s => s.id === sessionId);
    if (!target) return;
    const nextStatus: SessionStatus =
      target.status === 'lead' || target.status === 'scheduled'
        ? 'groomer_assigned'
        : target.status;
    const patch = {
      groomer_id:    g.id,
      groomer_name:  g.name,
      groomer_phone: g.phone,
      status:        nextStatus,
    };
    // Optimistic write straight into the shared snapshot — every mounted
    // tab picks it up.  Rollback restores just this row's previous values
    // (rather than swapping the whole array back) so a concurrent update
    // to some other session isn't clobbered by the undo.
    const rollback: Partial<GroomingSession> = {
      groomer_id:    target.groomer_id,
      groomer_name:  target.groomer_name,
      groomer_phone: target.groomer_phone,
      status:        target.status,
    };
    patchCachedSession(sessionId, patch);
    const { error } = await supabase.from('grooming_sessions').update(patch).eq('id', sessionId);
    if (error) {
      patchCachedSession(sessionId, rollback);
      setAssignError(`Couldn't assign groomer: ${error.message}`);
      return;
    }
    setAssignToast(`Assigned to ${g.name.trim().split(/\s+/)[0]}`);
  }, []);

  // Cancelled sessions carry no real business value, so they're excluded
  // from every money total below (mirrors the calendar tab's financial
  // summary, which only ever sums completed sessions).
  // Memoised: these are full passes over `filtered` (which can be every
  // row in the table), so without this they re-ran on every unrelated
  // re-render (menu open/close, toast, assign-sheet toggle).
  const { totalBookingAmt, totalNetAmt, totalCollectedAmt } = useMemo(() => {
    const nonCancelled = filtered.filter(x => x.status !== 'cancelled');
    return {
      totalBookingAmt:   nonCancelled.reduce((s, x) => s + (x.booking_amount ?? 0), 0),
      totalNetAmt:       nonCancelled.reduce((s, x) => s + (x.net_booking_amount ?? 0), 0),
      // Cash-in-hand-style total when the payment-channel filter is active.
      // total_collected is the DB-generated booking + upsell + tip — exactly
      // what the groomer / vendor would physically hold for the row.  We
      // expose both this and the gross booking sum so the coordinator can
      // see "ledger" vs "actual at hand" side by side.
      totalCollectedAmt: nonCancelled.reduce((s, x) => s + (x.total_collected ?? 0), 0),
    };
  }, [filtered]);
  // Show the payment-channel banner only when the filter is scoped to a
  // single channel — when multiple are selected the totals would mix
  // money flows and the "how much cash is still with X?" framing breaks.
  const paymentChannelOpt = filters.paymentCollectedBy.length === 1
    ? PAYMENT_COLLECTED_BY_OPTIONS.find(o => o.value === filters.paymentCollectedBy[0])
    : null;
  const activeFilterCount = countActiveFilters(filters);

  function PaginationFooter() {
    return (
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-gray-400">
          {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            Gross <strong className="text-gray-800">{fmtCurrency(totalBookingAmt)}</strong>
            {' · '}
            Net <strong className="text-green-700">{fmtCurrency(totalNetAmt)}</strong>
          </span>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 transition">
              <ChevronLeft size={14}/>
            </button>
            <span className="text-xs text-gray-600 px-1 font-medium">{page+1}/{Math.max(1,totalPages)}</span>
            <button onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 transition">
              <ChevronRight size={14}/>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Header — hidden on mobile to save vertical space for session cards;
          Add is still reachable there via the FAB (openModalTrigger). */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="hidden sm:flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">All Sessions</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {filtered.length} session{filtered.length!==1?'s':''} found
            {activeFilterCount > 0 && (
              <span className="ml-1 text-sniffy-purple font-semibold">
                · {activeFilterCount} filter{activeFilterCount>1?'s':''} active
              </span>
            )}
          </p>
          {/* Payment-channel totals — only when the filter is set.
              Shows count + gross booking total + collected (incl. tips
              & upsell) so the coordinator can answer
              "how much cash is still with the groomer?" in one glance. */}
          {paymentChannelOpt && (
            <div className="mt-1.5 inline-flex flex-wrap items-center gap-x-3 gap-y-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-[11px]">
              <span className="inline-flex items-center gap-1 font-bold text-amber-900">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: paymentChannelOpt.dot }}/>
                {paymentChannelOpt.label}
              </span>
              <span className="text-amber-900/80">
                <strong className="text-amber-900">{filtered.length}</strong> session{filtered.length!==1?'s':''}
              </span>
              <span className="text-amber-900/80">
                Booking <strong className="text-amber-900">{fmtCurrency(totalBookingAmt)}</strong>
              </span>
              <span className="text-amber-900/80">
                Collected <strong className="text-amber-900">{fmtCurrency(totalCollectedAmt)}</strong>
              </span>
            </div>
          )}
        </div>
        {canWrite && (
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-sniffy-purple text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-purple-900 transition shadow-sm shrink-0">
            <Plus size={16}/>
            <span className="hidden sm:inline">Add Session</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </motion.div>

      {/* Upcoming / Past subtabs — kept visible on mobile; it's the only
          way to set this filter (the sheet only reflects/clears it). */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.03 }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {([
              { value: '',         label: 'All'          },
              { value: 'upcoming', label: '📅 Upcoming'  },
              { value: 'past',     label: '🕐 Past'      },
            ] as { value: Filters['timeframe']; label: string }[]).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilter('timeframe', opt.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filters.timeframe === opt.value
                    ? 'bg-sniffy-purple text-white border-sniffy-purple shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-sniffy-purple/40 hover:text-sniffy-purple'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Bulk expand/collapse for the mobile day-accordions below —
              desktop renders a flat table with no accordions to toggle. */}
          {allSessionDates.length > 0 && (
            <button
              type="button"
              onClick={toggleExpandCollapseAll}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-500 hover:border-sniffy-purple hover:text-sniffy-purple transition shrink-0"
              aria-label={allDaysExpanded ? 'Collapse all days' : 'Expand all days'}
              title={allDaysExpanded ? 'Collapse all days' : 'Expand all days'}
            >
              {allDaysExpanded ? <ChevronsDownUp size={16}/> : <ChevronsUpDown size={16}/>}
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters — compact bar (search + open-sheet trigger) plus
          active-pills row.  Granular controls live inside the sheet
          to keep this above-the-fold strip short on small screens. */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Search + Filters trigger */}
          <div className="flex items-center gap-2 p-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
              <input
                type="text"
                placeholder="Search name, phone, breed, notes…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full pl-8 pr-8 h-10 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-sniffy-purple focus:ring-1 focus:ring-sniffy-purple/20 transition"
              />
              {searchInput && (
                // Clearing is an explicit action — bypass the debounce so
                // the list updates the instant the × is tapped.
                <button type="button" onClick={() => { setSearchInput(''); setFilter('search', ''); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  <X size={13}/>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className={`relative flex items-center gap-1.5 h-10 px-4 rounded-full border text-xs font-bold transition-all shrink-0 ${
                activeFilterCount > 0
                  ? 'bg-sniffy-purple text-white border-sniffy-purple shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-sniffy-purple hover:text-sniffy-purple'
              }`}
              aria-label="Open filters"
            >
              <SlidersHorizontal size={14}/>
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-sniffy-yellow text-gray-900 text-[10px] font-extrabold leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active pills row — appears whenever any non-search filter
              is active.  Each pill has its own × to remove the value
              without re-opening the sheet, matching Airbnb/Linear UX. */}
          {activeFilterCount > 0 && (
            <ActivePillsRow filters={filters} setFilters={setFilters}/>
          )}
        </div>
      </motion.div>

      {/* The sheet itself — portaled to body, animated in/out.
          Stays mounted while closed so opening is instant. */}
      <SessionFiltersSheet
        open={sheetOpen}
        value={filters}
        onApply={next => { setFilters(next); setSearchInput(next.search); setPage(0); }}
        onClose={() => setSheetOpen(false)}
        groomerOptions={groomerOptions}
        resultCount={filtered.length}
      />

      {/* MOBILE — cards */}
      <div className="block sm:hidden">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse flex overflow-hidden">
                <div className="w-1 bg-gray-200 shrink-0"/>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">🐾</p>
            <p className="text-gray-500 font-medium">No sessions match your filters.</p>
            {canWrite && (
              <button onClick={openAdd} className="mt-4 text-sniffy-purple text-sm font-semibold hover:underline">
                + Add the first one
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Group the currently-revealed rows by session_date so each day
                shows a compact purple header + count strip (mirrors the
                groomer bookings page). Grouping runs over `mobileItems` —
                the infinite-scroll window into `filtered` — rather than the
                full result set, so a date with 20 sessions doesn't silently
                blow past what's actually been revealed yet.
                `mobileItems` is already sorted by session_date desc, so we
                can bucket consecutive same-date rows in one pass. */}
            {(() => {
              return (
                <div className="space-y-4">
                  {mobileGroupedByDay.map(({ date, items }) => {
                    // Per-day summary so the header answers "what's this
                    // day's load?" before you scan the cards: total value +
                    // how many still need a groomer.  Today's group is
                    // marked and tinted purple so triage lands on it fast.
                    const isTodayGroup = date === today;
                    const dayTotal = items.reduce(
                      (sum, x) => x.status === 'cancelled'
                        ? sum
                        : sum + (x.net_booking_amount || x.booking_amount || 0), 0);
                    const unassignedCount = items.filter(
                      x => !x.groomer_name && x.status !== 'completed' && x.status !== 'cancelled').length;
                    // Per-groomer breakdown for this day only, so a busy
                    // day (many groomers assigned) can be scanned at a
                    // glance instead of counted card-by-card. "Unassigned"
                    // is its own bucket rather than folded into a name.
                    const groomerCounts = new Map<string, number>();
                    for (const x of items) {
                      const key = x.groomer_name || 'Unassigned';
                      groomerCounts.set(key, (groomerCounts.get(key) || 0) + 1);
                    }
                    const dayGroomerPills = Array.from(groomerCounts.entries())
                      .sort((a, b) => b[1] - a[1]);
                    const selectedGroomer = dayGroomerFilter[date] ?? null;
                    const dayItems = selectedGroomer
                      ? items.filter(x => (x.groomer_name || 'Unassigned') === selectedGroomer)
                      : items;
                    // Today opens by default; every other date starts
                    // collapsed unless the coordinator has explicitly
                    // toggled it (see dayOpenOverride above).
                    const isOpen = dayOpenOverride[date] ?? isTodayGroup;
                    // Timing drives the header's color so a glance at the
                    // (mostly collapsed) list tells past from upcoming
                    // without opening anything: gray = already happened,
                    // blue = still to schedule around, purple = today.
                    const timing: 'past' | 'today' | 'upcoming' =
                      isTodayGroup ? 'today' : date < today ? 'past' : 'upcoming';
                    return (
                    <div
                      key={date}
                      ref={isTodayGroup ? todayGroupRef : undefined}
                      className={`space-y-2 ${isTodayGroup ? 'scroll-mt-28' : ''}`}
                    >
                      {/* Date header — a proper accordion bar: full-width
                          card with its own border/shadow so it reads as a
                          tappable section, not just a label. The date
                          itself is the dominant element (bold, larger);
                          the count/₹/unassigned line is secondary, small
                          gray metadata underneath it rather than competing
                          for attention on the same line. */}
                      <button
                        type="button"
                        onClick={() => setDayOpenOverride(prev => ({ ...prev, [date]: !isOpen }))}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left shadow-sm transition-colors ${
                          timing === 'today'
                            ? 'bg-purple-50 border-purple-100'
                            : timing === 'upcoming'
                              ? isOpen ? 'bg-amber-50 border-amber-200' : 'bg-white border-amber-100'
                              : isOpen ? 'bg-gray-100 border-gray-200' : 'bg-gray-50 border-gray-100'
                        }`}
                        aria-expanded={isOpen}
                      >
                        <span className={`text-sm font-bold truncate shrink-0 ${
                          timing === 'today' ? 'text-sniffy-purple' : timing === 'upcoming' ? 'text-amber-700' : 'text-gray-500'
                        }`}>
                          {formatDateWithWeekday(date)}
                          {isTodayGroup && (
                            <span className="ml-1.5 inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-sniffy-purple align-middle">
                              <span className="w-1.5 h-1.5 rounded-full bg-sniffy-purple"/>Today
                            </span>
                          )}
                        </span>
                        <span className="flex-1 min-w-0 truncate text-right text-[11px] font-bold text-gray-500">
                          {items.length} · {fmtCurrency(dayTotal)}
                          {unassignedCount > 0 && (
                            <span className="text-red-500"> · {unassignedCount} unassigned</span>
                          )}
                        </span>
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors ${timing === 'today' || isOpen ? 'bg-white/70' : 'bg-gray-100'}`}>
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2">
                              {/* Map & Route — opens a per-day map of every
                                  session's GPS point plus a suggested visit
                                  order for one groomer, so tonight's planning
                                  for tomorrow's day can group stops by
                                  proximity instead of zig-zagging. */}
                              {items.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setMapModalDay({ date, items })}
                                  className="relative w-full flex items-center justify-center gap-1.5 h-9 rounded-xl text-[11px] font-bold overflow-hidden shadow-sm transition-transform active:scale-[0.98] border border-black/5"
                                  style={{
                                    backgroundColor: '#eee6d3',
                                    // Land-cover patches baked into the button's own
                                    // background (no extra absolutely-positioned layer)
                                    // — fewer gradient stops than earlier drafts, kept
                                    // cheap since this repeats once per open day-group.
                                    backgroundImage:
                                      'radial-gradient(ellipse 70px 24px at 12% 75%, #cfe0bf 0%, transparent 70%),' +
                                      'radial-gradient(ellipse 60px 26px at 55% 15%, #d7e3c8 0%, transparent 65%),' +
                                      'radial-gradient(ellipse 55px 22px at 85% 70%, #dfe1d0 0%, transparent 65%)',
                                  }}
                                >
                                  {/* Actual-map look: a light street grid with one road
                                      picked out as the "route" (turn-by-turn straight
                                      segments, not a decorative curve) — a single static
                                      SVG, no continuous animation, so this stays cheap
                                      to paint even with several day-groups open at once. */}
                                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 36" preserveAspectRatio="none">
                                    <rect x="0" y="0" width="200" height="36" fill="#ffffff" fillOpacity="0.2"/>
                                    <g stroke="#ffffff" strokeOpacity="0.95" strokeLinecap="round">
                                      <path d="M-4 10 L204 24" strokeWidth="1.4"/>
                                      <path d="M-4 30 L204 6" strokeWidth="1.2"/>
                                      <path d="M28 -4 L38 40" strokeWidth="1.1"/>
                                      <path d="M140 -4 L130 40" strokeWidth="1.1"/>
                                    </g>
                                    <path
                                      d="M-4 26 L54 11 L112 22 L204 8"
                                      fill="none" stroke="#f6ac0a" strokeOpacity="0.45" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"
                                    />
                                  </svg>
                                  <span className="relative z-10 flex items-center justify-center w-4 h-4 rounded-full bg-white shrink-0 shadow-sm">
                                    <MapPin size={10} className="text-blue-600"/>
                                  </span>
                                  <span
                                    className="relative z-10 text-slate-700"
                                    style={{ textShadow: '0 0 5px #fff, 0 0 5px #fff' }}
                                  >
                                    Map &amp; route
                                  </span>
                                </button>
                              )}
                              {/* Per-day groomer pills — click to narrow this day's
                                  cards to one groomer (or "Unassigned"); click the
                                  active pill again to clear. Scoped to this date
                                  only, independent of the global groomer filter. */}
                              {dayGroomerPills.length > 1 && (
                                <div className="flex items-center gap-1.5 px-1 flex-wrap">
                                  {dayGroomerPills.map(([name, count]) => {
                                    const active = selectedGroomer === name;
                                    const isUnassigned = name === 'Unassigned';
                                    return (
                                      <button
                                        key={name}
                                        title={name}
                                        onClick={() => setDayGroomerFilter(prev => ({
                                          ...prev,
                                          [date]: prev[date] === name ? null : name,
                                        }))}
                                        className={`flex items-center gap-1 h-6 pl-1 pr-2 rounded-full text-[11px] font-semibold border transition-colors ${
                                          active
                                            ? 'bg-gray-600 text-white border-gray-600'
                                            : isUnassigned
                                              ? 'bg-red-50 text-red-600 border-red-100'
                                              : 'bg-gray-100 text-gray-700 border-gray-200'
                                        }`}
                                      >
                                        {!isUnassigned && (
                                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0 ${
                                            active ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-600'
                                          }`}>
                                            {name.charAt(0).toUpperCase()}
                                          </span>
                                        )}
                                        {isUnassigned ? name : abbreviateGroomerName(name)} · {count}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                              {dayItems.map(s => (
                                <SessionCard
                                  key={s.id}
                                  session={s}
                                  pets={petDisplay.get(s.id)}
                                  onEdit={openEdit}
                                  onCopy={openCopy}
                                  onDelete={handleDelete}
                                  onAssign={assignGroomer}
                                  groomers={assignGroomers}
                                  canWrite={canWrite}
                                  canDelete={canDelete}
                                  today={today}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Infinite-scroll trigger — invisible once nothing more is
                left to reveal (the effect above skips observing it then).
                Skeleton cards fill the beat between the sentinel coming
                into view and the next batch landing. */}
            {mobileVisibleCount < filtered.length && (
              <div ref={mobileSentinelRef} className="h-4">
                {mobileLoadingMore && (
                  <div className="space-y-3 mt-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse flex overflow-hidden">
                        <div className="w-1 bg-gray-200 shrink-0"/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-gray-400">
                  {mobileItems.length < filtered.length
                    ? `${mobileItems.length} of ${filtered.length} loaded`
                    : `All ${filtered.length} loaded`}
                </p>
                <span className="text-xs text-gray-500">
                  Gross <strong className="text-gray-800">{fmtCurrency(totalBookingAmt)}</strong>
                  {' · '}
                  Net <strong className="text-green-700">{fmtCurrency(totalNetAmt)}</strong>
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* DESKTOP — full table */}
      <motion.div
        initial={{ opacity:0, y:8 }}
        animate={{ opacity:1, y:0 }}
        transition={{ delay:0.1 }}
        className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading sessions…</div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🐾</p>
            <p className="text-gray-500 font-medium">No sessions match your filters.</p>
            {canWrite && (
              <button onClick={openAdd} className="mt-4 text-sniffy-purple text-sm font-semibold hover:underline">
                + Add the first one
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {['Date','Pet Parent','Pet','Source','Amount','Net','Groomer','Next Due','Status',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(s => (
                  <tr key={s.id} className="hover:bg-purple-50/30 transition group">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{fmtDate(s.session_date)}</td>
                    <td className="px-4 py-3 max-w-[140px]">
                      <p className="font-semibold text-gray-900 truncate">{s.pet_parent_name}</p>
                      {s.phone && (
                        <a href={`tel:${s.phone}`} className="text-xs text-gray-400 flex items-center gap-1 hover:text-sniffy-purple">
                          <Phone size={10}/>{s.phone}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {petDisplay.get(s.id) ? (
                        <SessionPetLines pets={petDisplay.get(s.id)} showAmounts />
                      ) : (<>
                        <span>{s.pet_type==='dog'?'🐶':'🐱'}</span>
                        <span className="text-xs text-gray-500 ml-1">{s.breed??'—'}</span>
                      </>)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-600">{SOURCE_LABELS[s.source]}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                      {s.booking_amount ? fmtCurrency(s.booking_amount) : '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-700 whitespace-nowrap">
                      {s.net_booking_amount ? fmtCurrency(s.net_booking_amount) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[100px]">
                      <p className="truncate">{s.groomer_name??'—'}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {s.next_due_date ? <DueDateBadge iso={s.next_due_date}/> : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {canWrite ? (
                        <select
                          value={s.status}
                          onChange={e => quickStatusChange(s.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[s.status]}`}
                          style={{ background:'transparent' }}
                        >
                          {Object.entries(STATUS_LABELS).map(([k,v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[s.status]}`}>
                          {STATUS_LABELS[s.status]}
                        </span>
                      )}
                    </td>
                    {(canWrite || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                          {canWrite && (
                            <button onClick={() => openEdit(s)} title="Edit session" className="p-1.5 rounded-lg hover:bg-purple-100 text-gray-400 hover:text-sniffy-purple transition">
                              <Edit2 size={13}/>
                            </button>
                          )}
                          {canWrite && (
                            <button onClick={() => openCopy(s)} title="Create a copy" className="p-1.5 rounded-lg hover:bg-purple-100 text-gray-400 hover:text-sniffy-purple transition">
                              <Copy size={13}/>
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDelete(s)} title="Delete session" className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition">
                              <Trash2 size={13}/>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
              <PaginationFooter/>
            </div>
          </div>
        )}
      </motion.div>

      {canWrite && modalOpen && (
        <Suspense fallback={null}>
          <SessionFormModal
            open={modalOpen}
            onClose={() => { setModalOpen(false); setEditSession(null); setCopySession(null); }}
            onSaved={fetchSessions}
            editSession={editSession}
            copyFromSession={copySession}
            currentUser={getSessionUser()}
          />
        </Suspense>
      )}

      {mapModalDay && (
        <Suspense fallback={null}>
          <DayRouteMapModal
            key={mapModalDay.date}
            open={!!mapModalDay}
            date={mapModalDay.date}
            dateLabel={formatDateWithWeekday(mapModalDay.date)}
            sessions={mapModalDay.items}
            assignGroomers={assignGroomers}
            onAssign={assignGroomer}
            onClose={() => setMapModalDay(null)}
          />
        </Suspense>
      )}

      {/* Sniffy-styled delete confirmation.  Replaces window.confirm —
          same content (Date / Parent / Pet / Amount / Status + archive
          notice), but inside the app so it doesn't break the visual
          flow.  Backdrop dismiss is disabled while the archive+delete
          request is in flight (deleteBusy). */}
      <ConfirmDialog
        open={!!pendingDelete}
        variant="danger"
        title="Delete this session?"
        subtitle="It will be moved to the archive and removed from the active list."
        confirmLabel="Delete session"
        cancelLabel="Keep it"
        busy={deleteBusy}
        onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteError(null); } }}
        onConfirm={confirmDelete}
      >
        {pendingDelete && (
          <div className="space-y-2">
            <dl className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-[13px] text-gray-700 space-y-1.5">
              <div className="flex justify-between gap-3">
                <dt className="font-semibold text-gray-500">Date</dt>
                <dd className="text-right">{fmtDate(pendingDelete.session_date)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-semibold text-gray-500">Parent</dt>
                <dd className="text-right">{pendingDelete.pet_parent_name || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-semibold text-gray-500">Pet</dt>
                <dd className="text-right">
                  {pendingDelete.breed ? pendingDelete.breed : (pendingDelete.pet_type || 'pet')}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-semibold text-gray-500">Amount</dt>
                <dd className="text-right font-semibold text-gray-900">
                  {fmtCurrency(pendingDelete.booking_amount ?? 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-semibold text-gray-500">Status</dt>
                <dd className="text-right">{STATUS_LABELS[pendingDelete.status] ?? pendingDelete.status}</dd>
              </div>
            </dl>

            <p className="text-[11px] text-gray-500 leading-snug px-1">
              This cannot be undone from the UI.
            </p>

            {deleteError && (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 px-3 py-2 text-[12px] text-rose-800 leading-snug">
                {deleteError}
              </div>
            )}
          </div>
        )}
      </ConfirmDialog>

      {/* Success feedback for the inline groomer assign. */}
      <Toast
        message={assignToast ?? ''}
        isVisible={!!assignToast}
        onClose={() => setAssignToast(null)}
      />

      {/* Error feedback for a failed assign — rare (RLS / network). */}
      <AnimatePresence>
        {assignError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] max-w-[90vw]"
            role="alert"
          >
            <div className="flex items-center gap-2 rounded-2xl bg-rose-600 text-white px-4 py-2.5 text-sm font-semibold shadow-lg">
              <span className="truncate">{assignError}</span>
              <button type="button" onClick={() => setAssignError(null)} aria-label="Dismiss" className="shrink-0">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
