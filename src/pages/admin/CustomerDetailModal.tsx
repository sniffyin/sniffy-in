/**
 * admin/CustomerDetailModal.tsx — Phase 1
 *
 * Customer detail surface.  Shown as a right-side slide-over on
 * desktop, full-screen sheet on mobile.
 *
 * Sections:
 *  • Header     — name, phone, lifecycle pill, VIP toggle, "Rebook" CTA
 *  • Quick info — editable name / email / address / gps / city / notes
 *  • Pets       — list of pets with type/breed/displayed age
 *  • Sessions   — full grooming history (most recent first)
 *  • Bookings   — website-booking history (leads), if any
 *  • Tags       — Phase-2 placeholder; the column already exists so we
 *                  let the coordinator add tags now.  Lifecycle/VIP are
 *                  also editable.
 *
 * Save semantics: every editable field debounces a row update; we don't
 * have a "Save" button to avoid the user losing a change by closing the
 * sheet.  Aggregates are read-only — they're maintained by the DB.
 */

import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Phone, MessageCircle, Calendar, Save, Crown,
  Plus, Loader2, Tag, AlertCircle, Star, Merge, History,
  PauseCircle, PlayCircle, Send, MapPin, ExternalLink,
  Gift, Copy, Share2, IndianRupee, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  CustomerWithRecency, Pet, LIFECYCLE_LABELS, LIFECYCLE_COLORS,
  formatPhoneDisplay, customerInitials, customerAvatarColor,
  ReferralCredit, ReferralBalance, buildReferralShareText, buildReferralShareUrl,
} from './customerTypes';
import type { GroomingSession } from './types';
const SessionFormModal = lazy(() => import('./SessionFormModal'));
import CustomerMergeModal from './CustomerMergeModal';
import PetEditCard, { AddPetInline } from './PetEditCard';

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtMoney(n: number | null | undefined): string {
  if (!n) return '₹0';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

type SessionRow = Pick<
  GroomingSession,
  'id' | 'session_date' | 'scheduled_time' | 'status' | 'pet_type' | 'breed' |
  'package' | 'booking_amount' | 'total_collected' | 'groomer_name' | 'source' |
  'client_rating' | 'pet_parent_name'
>;

interface BookingRow {
  id: string;
  name: string;
  phone: string;
  pet_type: string;
  breed: string;
  package: string;
  city: string;
  is_converted: boolean;
  created_at: string;
}

/** Phase 2c — single row from customer_notes_history. */
interface NoteHistoryRow {
  id: string;
  prev_text: string | null;
  new_text:  string | null;
  changed_at: string;
  changed_by: string | null;
}

/** Phase 3 — single row from outreach_log for the detail-modal history. */
interface OutreachLogRow {
  id: string;
  template_key: string;
  status: 'queued' | 'sent' | 'skipped' | 'failed';
  message_body: string | null;
  queued_at: string;
  sent_at: string | null;
  sent_by: string | null;
  skip_reason: string | null;
}

export default function CustomerDetailModal({
  open, customer, onClose, onChanged,
}: {
  open: boolean;
  customer: CustomerWithRecency | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [name, setName]       = useState('');
  /** The name last confirmed written to `customers.name` — used to spot
   *  past sessions whose `pet_parent_name` (captured once at booking
   *  time, never live-joined) has drifted from the canonical name, so
   *  we can offer to backfill them.  Kept separate from `name` because
   *  `name` tracks the (possibly unsaved) input value. */
  const [lastSavedName, setLastSavedName] = useState('');
  const [nameSyncBusy, setNameSyncBusy]   = useState(false);
  const [email, setEmail]     = useState('');
  const [address, setAddress] = useState('');
  /** Google Maps share URL (or any location URL) the groomer's
   *  Navigate CTA opens directly.  Stored on customers.gps_location
   *  and propagated onto every new session via the upsert trigger;
   *  this field lets the coordinator correct it when the customer
   *  moves, sends a fresh share link, etc. */
  const [gps, setGps]         = useState('');
  const [city, setCity]       = useState('');
  const [notes, setNotes]     = useState('');
  const [isVip, setIsVip]     = useState(false);
  const [isElite, setIsElite] = useState(false);
  const [tags, setTags]       = useState<string[]>([]);
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [newTag, setNewTag]   = useState('');

  const [pets, setPets]           = useState<Pet[]>([]);
  const [sessions, setSessions]   = useState<SessionRow[]>([]);
  const [bookings, setBookings]   = useState<BookingRow[]>([]);
  /** Phase 2b — per-pet session counts, computed from session_pets.
   *  Keyed by pet.id.  Filled lazily once pets + sessions are loaded. */
  const [petSessionCounts, setPetSessionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const [rebookOpen, setRebookOpen] = useState(false);
  const [rebookPrefill, setRebookPrefill] = useState<Partial<GroomingSession> | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [addingPet, setAddingPet] = useState(false);
  /** Phase 2c — notes audit trail (loaded lazily when the user
   *  expands the panel; not on every modal open). */
  const [noteHistory, setNoteHistory] = useState<NoteHistoryRow[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  /** Phase 3 — outreach log + snooze.  Loaded with the rest of the
   *  related data so the "Last contact" line is always populated
   *  without a second user action. */
  const [outreachLog, setOutreachLog] = useState<OutreachLogRow[]>([]);
  const [pausedUntil, setPausedUntil] = useState<string | null>(null);
  const [snoozeBusy, setSnoozeBusy]   = useState(false);

  // ── Phase 5 — referrals state ──────────────────────────────────────
  const [referralBalance, setReferralBalance] = useState<ReferralBalance | null>(null);
  const [referralLedger, setReferralLedger]   = useState<ReferralCredit[]>([]);
  const [referrerName, setReferrerName]       = useState<string | null>(null);
  /** Pending text the coordinator wants to attach as a referral code
   *  (so the modal can use the same input for both fresh-attach and
   *  edit-code flows). */
  const [refCodeInput, setRefCodeInput]       = useState('');
  const [refAttachBusy, setRefAttachBusy]     = useState(false);
  const [refCopyFlash, setRefCopyFlash]       = useState(false);
  /** Manual ledger-entry form (admin only). */
  const [adjAmount, setAdjAmount]             = useState<string>('');
  const [adjNote, setAdjNote]                 = useState<string>('');
  const [adjBusy, setAdjBusy]                 = useState(false);

  // Seed form whenever the modal opens with a new customer.
  useEffect(() => {
    if (!customer) return;
    setName(customer.name ?? '');
    setLastSavedName(customer.name ?? '');
    setEmail(customer.email ?? '');
    setAddress(customer.address ?? '');
    setGps(customer.gps_location ?? '');
    setCity(customer.city ?? '');
    setNotes(customer.notes ?? '');
    setIsVip(customer.is_vip);
    setIsElite(customer.is_elite);
    setTags(customer.tags ?? []);
    setWhatsappOptIn(customer.whatsapp_opt_in);
    // Phase 2a — reset transient sub-form state when switching customers.
    setAddingPet(false);
    // Phase 2c — reset notes history state.  We don't want a stale
    // history from the previous customer briefly showing up.
    setNoteHistory([]);
    setHistoryOpen(false);
    // Phase 3 — seed snooze date and clear stale outreach history.
    setPausedUntil(((customer as unknown) as { outreach_paused_until?: string | null }).outreach_paused_until ?? null);
    setOutreachLog([]);
    // Phase 5 — reset referral state on customer-switch.
    setReferralBalance(null);
    setReferralLedger([]);
    setReferrerName(null);
    setRefCodeInput('');
    setAdjAmount('');
    setAdjNote('');
  }, [customer]);

  // Load related rows when the modal opens.
  const loadRelated = useCallback(async () => {
    if (!customer) return;
    setLoading(true);
    setError(null);
    try {
      const [petsRes, sessionsRes, bookingsRes, outreachRes, balanceRes, ledgerRes, referrerRes] = await Promise.all([
        supabase.from('pets')
          .select('*')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: true }),
        supabase.from('grooming_sessions')
          .select('id,session_date,scheduled_time,status,pet_type,breed,package,booking_amount,total_collected,groomer_name,source,client_rating,pet_parent_name')
          .eq('customer_id', customer.id)
          .order('session_date', { ascending: false }),
        supabase.from('bookings')
          .select('id,name,phone,pet_type,breed,package,city,is_converted,created_at')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false }),
        // Phase 3 — outreach history per customer.  Limited to recent
        // 20 entries to keep the slide-over fast on heavy customers.
        supabase.from('outreach_log')
          .select('id, template_key, status, message_body, queued_at, sent_at, sent_by, skip_reason')
          .eq('customer_id', customer.id)
          .order('queued_at', { ascending: false })
          .limit(20),
        // Phase 5 — referral balance summary from the view.
        supabase.from('customer_referral_balance')
          .select('customer_id, balance, lifetime_earned, lifetime_redeemed, earn_count, redeem_count')
          .eq('customer_id', customer.id)
          .maybeSingle(),
        // Phase 5 — recent ledger entries.
        supabase.from('referral_credits')
          .select('id, customer_id, amount, reason, source_session_id, related_customer_id, note, created_by, created_at')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false })
          .limit(20),
        // Phase 5 — referrer's name lookup.  Only fires if the customer
        // has a referred_by_customer_id; otherwise resolves to null.
        customer.referred_by_customer_id
          ? supabase.from('customers').select('id, name, referral_code').eq('id', customer.referred_by_customer_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);
      if (petsRes.error)     throw petsRes.error;
      if (sessionsRes.error) throw sessionsRes.error;
      if (bookingsRes.error) throw bookingsRes.error;
      if (outreachRes.error) {
        console.warn('[CustomerDetailModal] outreach log fetch failed:', outreachRes.error);
      } else {
        setOutreachLog((outreachRes.data ?? []) as OutreachLogRow[]);
      }

      // Phase 5 — referrals.  Treat 404-ish errors as a "table not
      // yet migrated" signal so the rest of the modal still renders.
      if (balanceRes.error) {
        console.warn('[CustomerDetailModal] referral balance fetch failed:', balanceRes.error);
      } else if (balanceRes.data) {
        setReferralBalance(balanceRes.data as ReferralBalance);
      } else {
        // No row yet — customer has zero ledger entries.  Surface a
        // zero-balance summary so the section still renders.
        setReferralBalance({
          customer_id: customer.id, balance: 0, lifetime_earned: 0,
          lifetime_redeemed: 0, earn_count: 0, redeem_count: 0,
        });
      }
      if (ledgerRes.error) {
        console.warn('[CustomerDetailModal] ledger fetch failed:', ledgerRes.error);
      } else {
        setReferralLedger((ledgerRes.data ?? []) as ReferralCredit[]);
      }
      if (referrerRes && !('error' in referrerRes && referrerRes.error)) {
        const ref = (referrerRes as { data: { name: string | null } | null }).data;
        setReferrerName(ref?.name ?? null);
      }
      const petRows = (petsRes.data ?? []) as Pet[];
      setPets(petRows);
      setSessions((sessionsRes.data ?? []) as SessionRow[]);
      setBookings((bookingsRes.data ?? []) as BookingRow[]);

      // Phase 2b — per-pet visit counts, computed from session_pets.
      // Fetched here so the UI doesn't need to know how the join is
      // structured.  If the lookup fails (e.g. RLS blocks), the
      // badges just don't render — non-fatal.
      if (petRows.length > 0) {
        const petIds = petRows.map(p => p.id);
        const { data: spData, error: spErr } = await supabase
          .from('session_pets')
          .select('pet_id')
          .in('pet_id', petIds);
        if (spErr) {
          console.warn('[CustomerDetailModal] pet count fetch failed:', spErr);
          setPetSessionCounts({});
        } else {
          const counts: Record<string, number> = {};
          for (const row of (spData ?? []) as { pet_id: string }[]) {
            counts[row.pet_id] = (counts[row.pet_id] ?? 0) + 1;
          }
          setPetSessionCounts(counts);
        }
      } else {
        setPetSessionCounts({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [customer]);

  useEffect(() => {
    if (open && customer) loadRelated();
  }, [open, customer, loadRelated]);

  // Saved-flash auto-hide
  useEffect(() => {
    if (!savedFlash) return;
    const t = setTimeout(() => setSavedFlash(false), 1400);
    return () => clearTimeout(t);
  }, [savedFlash]);

  /** Phase 2c — fetch the customer's notes-history rows on demand.
   *  We don't load this on every modal open because it's only
   *  interesting when the coordinator explicitly asks for it (and
   *  most customers will have 0 history rows). */
  const loadHistory = useCallback(async () => {
    if (!customer) return;
    setHistoryLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('customer_notes_history')
        .select('id, prev_text, new_text, changed_at, changed_by')
        .eq('customer_id', customer.id)
        .order('changed_at', { ascending: false })
        .limit(50);
      if (err) {
        console.warn('[CustomerDetailModal] notes history fetch failed:', err);
        setNoteHistory([]);
      } else {
        setNoteHistory((data ?? []) as NoteHistoryRow[]);
      }
    } finally {
      setHistoryLoading(false);
    }
  }, [customer]);

  // Auto-load on first expand.  After that we trust the local state —
  // the trigger fires *after* a successful save, so we refresh when
  // persistChanges() completes (see below).
  useEffect(() => {
    if (historyOpen && noteHistory.length === 0) loadHistory();
  }, [historyOpen, noteHistory.length, loadHistory]);

  async function persistChanges() {
    if (!customer) return;
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('customers')
        .update({
          name:             name.trim(),
          email:            email.trim() || null,
          address:          address.trim() || null,
          gps_location:     gps.trim() || null,
          city:             city.trim() || null,
          notes:            notes.trim() || null,
          is_vip:           isVip,
          is_elite:         isElite,
          tags,
          whatsapp_opt_in:  whatsappOptIn,
        })
        .eq('id', customer.id);
      if (err) throw err;
      setLastSavedName(name.trim());
      setSavedFlash(true);
      onChanged();
      // Phase 2c — if the notes pane is open, refresh history so the
      // new edit shows up immediately.  We don't refresh when the
      // pane is collapsed since the user hasn't asked to see it yet.
      if (historyOpen) loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  /** Backfill `pet_parent_name` on past sessions to match the customer's
   *  current canonical name.  Sessions capture the name once at booking
   *  time and are never live-joined to `customers.name` (see
   *  `mismatchedSessions` below), so a rename here doesn't reach them on
   *  its own — this is the explicit, opt-in action that does. Scoped to
   *  exactly the session ids shown in the prompt so a session created or
   *  edited between render and click can't be swept in unintentionally. */
  async function syncNameToSessions(target: string, sessionIds: string[]) {
    if (!customer || sessionIds.length === 0) return;
    setNameSyncBusy(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('grooming_sessions')
        .update({ pet_parent_name: target })
        .in('id', sessionIds);
      if (err) throw err;
      setSessions(prev => prev.map(s =>
        sessionIds.includes(s.id) ? { ...s, pet_parent_name: target } : s
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setNameSyncBusy(false);
    }
  }

  function addTag() {
    const t = newTag.trim();
    if (!t) return;
    if (tags.includes(t)) { setNewTag(''); return; }
    setTags([...tags, t]);
    setNewTag('');
  }

  /** "Mark VIP" sits in the header action row alongside Rebook / Call /
   *  WhatsApp / Merge — users expect a single tap, not "tap then scroll
   *  down to Save".  So we persist immediately with an optimistic update,
   *  and roll back on error.  The form-level Save button still covers
   *  the other editable fields (name, email, address, gps, city, notes,
   *  whatsapp opt-in). */
  async function toggleVip() {
    if (!customer) return;
    const next = !isVip;
    setIsVip(next);                       // optimistic
    setError(null);
    try {
      const { error: err } = await supabase
        .from('customers')
        .update({ is_vip: next })
        .eq('id', customer.id);
      if (err) throw err;
      onChanged();                        // refresh CustomersTab list so VIP icon updates
    } catch (err) {
      setIsVip(!next);                    // rollback
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  /** Elite is the paid membership tier above VIP.  Same instant-persist
   *  pattern as toggleVip — one tap in the header, optimistic with
   *  rollback on error. */
  async function toggleElite() {
    if (!customer) return;
    const next = !isElite;
    setIsElite(next);                     // optimistic
    setError(null);
    try {
      const { error: err } = await supabase
        .from('customers')
        .update({ is_elite: next })
        .eq('id', customer.id);
      if (err) throw err;
      onChanged();                        // refresh CustomersTab list so Elite crown updates
    } catch (err) {
      setIsElite(!next);                  // rollback
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function removeTag(t: string) {
    setTags(tags.filter(x => x !== t));
  }

  /** Phase 3 — pause outreach for N days, or clear the pause.
   *  Sets `customers.outreach_paused_until` and also skips any
   *  currently-queued outreach rows so the customer drops out of
   *  today's queue immediately. */
  async function applySnooze(days: number | null) {
    if (!customer) return;
    setSnoozeBusy(true);
    setError(null);
    try {
      const untilDate = days == null
        ? null
        : (() => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); })();
      const { error: err } = await supabase
        .from('customers')
        .update({ outreach_paused_until: untilDate })
        .eq('id', customer.id);
      if (err) throw err;

      // If snoozing, also drop any queued reminders so they vanish
      // from OutreachTab today.  When un-snoozing we leave the queue
      // alone; the next daily run will repopulate if appropriate.
      if (days != null) {
        const { error: skipErr } = await supabase
          .from('outreach_log')
          .update({ status: 'skipped', skip_reason: `snoozed:${days}d` })
          .eq('customer_id', customer.id)
          .eq('status', 'queued');
        if (skipErr) console.warn('[CustomerDetailModal] snooze queue-clear failed:', skipErr);
      }
      setPausedUntil(untilDate);
      onChanged();
      loadRelated();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setSnoozeBusy(false); }
  }

  // ─── Phase 5 — referral handlers ───────────────────────────────────

  /** Coordinator pastes a code into the "Refer­red by" input and hits
   *  Attach.  Server validates the code and that the customer hasn't
   *  already been attributed; we surface the server error verbatim. */
  async function attachReferralCode() {
    if (!customer) return;
    const code = refCodeInput.trim();
    if (!code) return;
    setRefAttachBusy(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.rpc('apply_referral_code', {
        p_code: code,
        p_customer_id: customer.id,
      });
      if (err) throw err;
      const result = data as { success: boolean; error?: string; referrer_name?: string };
      if (!result?.success) {
        const map: Record<string, string> = {
          code_not_found:     'No customer found with that referral code.',
          self_referral:      'A customer cannot refer themselves.',
          already_referred:   'This customer already has a referrer attached.',
          too_many_sessions:  'Referral can only be applied within the first session — this customer has too many sessions logged.',
          missing_args:       'Internal error: missing arguments.',
        };
        throw new Error(map[result?.error ?? ''] ?? `Could not attach: ${result?.error ?? 'unknown'}`);
      }
      setReferrerName(result.referrer_name ?? null);
      setRefCodeInput('');
      onChanged();
      loadRelated();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setRefAttachBusy(false); }
  }

  /** Copy the customer's code (or the wa.me share URL) to clipboard. */
  async function copyReferralBits(mode: 'code' | 'link') {
    if (!customer?.referral_code) return;
    const text = mode === 'code'
      ? customer.referral_code
      : buildReferralShareText(customer.referral_code, customer.name);
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setRefCopyFlash(true);
    setTimeout(() => setRefCopyFlash(false), 1200);
  }

  /** Manual adjust — coordinator posts a ledger row directly.  Positive
   *  values are credits, negative are deductions.  Reason is forced to
   *  'adjust' so it doesn't get confused with auto-issued earn/redeem
   *  rows.  Used for goodwill credits, refunds, mistake reversals. */
  async function postAdjustment() {
    if (!customer) return;
    const amt = Number(adjAmount);
    if (!Number.isFinite(amt) || amt === 0) return;
    setAdjBusy(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('referral_credits')
        .insert([{
          customer_id: customer.id,
          amount:      amt,
          reason:      'adjust',
          note:        adjNote.trim() || null,
          created_by:  'coordinator',
        }]);
      if (err) throw err;
      setAdjAmount('');
      setAdjNote('');
      loadRelated();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setAdjBusy(false); }
  }

  function openRebook() {
    if (!customer) return;
    // Pre-fill with the customer's identity + most recent pet's species/breed
    // so the coordinator only has to confirm date + package.
    const lastPet = pets[pets.length - 1];
    const prefill: Partial<GroomingSession> = {
      pet_parent_name: name || customer.name || '',
      phone:           customer.phone_raw || customer.phone,
      address:         address || '',
      gps_location:    gps || customer.gps_location || '',
      pet_type:        (lastPet?.type ?? 'dog') as 'dog' | 'cat',
      breed:           lastPet?.breed ?? '',
      pet_age:         (lastPet?.age_bucket ?? null) as string | null,
      source_type:     'internal',
      source:          'direct_call',
      status:          'lead',
      is_converted:    false,
    };
    setRebookPrefill(prefill);
    setRebookOpen(true);
  }

  if (!customer) return null;
  const lifecycleColors = LIFECYCLE_COLORS[customer.lifecycle_stage];

  // Sessions whose stored pet_parent_name no longer matches the
  // customer's canonical name — either pre-existing drift (a typo fixed
  // here today, or from before this customer record existed) or a name
  // just saved in this modal. Only flags real text differences, so
  // untouched customers show nothing.
  const mismatchedSessions = lastSavedName.trim()
    ? sessions.filter(s => {
        const sName = (s.pet_parent_name ?? '').trim();
        return sName.length > 0 && sName !== lastSavedName.trim();
      })
    : [];
  const mismatchedNames = Array.from(new Set(mismatchedSessions.map(s => s.pet_parent_name)));

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 z-50"
            />
            {/* Sheet */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[560px] bg-gray-100 z-50 overflow-y-auto"
              style={{ boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }}
            >
              {/* Header — avatar + name on one row, meta line under.
                  The big circular avatar mirrors the list-card avatar
                  (same deterministic colour) so the customer reads
                  consistently across both screens. */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 z-10 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-extrabold tracking-wide ${customerAvatarColor(customer.id)}`}
                      style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
                    >
                      {customerInitials(name || customer.name, customer.phone)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-lg font-extrabold text-gray-900 truncate leading-tight">
                          {name || <span className="text-gray-400 italic">No name</span>}
                        </h3>
                        <span className={`inline-flex items-center text-[10px] font-bold ${lifecycleColors.bg} ${lifecycleColors.text} border ${lifecycleColors.border} rounded-full px-2 py-0.5`}>
                          {LIFECYCLE_LABELS[customer.lifecycle_stage]}
                        </span>
                        {isElite && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full px-2 py-0.5 shadow-sm">
                            <Crown size={9}/> Elite
                          </span>
                        )}
                        {isVip && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                            <Crown size={9}/> VIP
                          </span>
                        )}
                        {/* Phase 3 — show snooze badge in the header so it's
                            impossible to miss when outreach is paused. */}
                        {pausedUntil && new Date(pausedUntil) >= new Date(new Date().toDateString()) && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                            <PauseCircle size={9}/> Paused
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500 flex-wrap">
                        <span className="inline-flex items-center gap-1 font-medium text-gray-600">
                          <Phone size={11} className="text-gray-400"/> {formatPhoneDisplay(customer.phone)}
                        </span>
                        {city && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={11} className="text-gray-400"/> {city}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition shrink-0">
                    <X size={18}/>
                  </button>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <Stat label="Last session" value={fmtDate(customer.last_session_at)}/>
                  <Stat label="Sessions" value={String(customer.total_sessions)}/>
                  <Stat label="LTV" value={fmtMoney(customer.lifetime_value)}/>
                </div>

                {/* Action row — primary CTA + segmented secondary bar.
                    Rebook is the dominant action (full-width gradient);
                    Call / WhatsApp / VIP / Merge sit together in a single
                    rounded container with hairline dividers so they
                    visually read as one grouped toolbar, not 4 stray
                    buttons. */}
                <button
                  onClick={openRebook}
                  className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #451a8b 100%)', boxShadow: '0 2px 8px rgba(69,26,139,0.32)' }}
                >
                  <Plus size={14}/> Rebook
                </button>
                <div className="mt-2 grid grid-cols-5 rounded-xl border border-gray-200 bg-white overflow-hidden divide-x divide-gray-200">
                  <a
                    href={`tel:${customer.phone}`}
                    title="Call customer"
                    className="flex flex-col items-center justify-center gap-0.5 py-2 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition"
                  >
                    <Phone size={14} className="text-gray-500"/>
                    <span className="text-[10px] font-bold">Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Message on WhatsApp"
                    className="flex flex-col items-center justify-center gap-0.5 py-2 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition"
                  >
                    <MessageCircle size={14} className="text-[#25D366]"/>
                    <span className="text-[10px] font-bold">WhatsApp</span>
                  </a>
                  <button
                    onClick={toggleVip}
                    title={isVip ? 'Click to remove VIP status' : 'Mark this customer as VIP'}
                    className={`flex flex-col items-center justify-center gap-0.5 py-2 transition active:bg-gray-100 ${
                      isVip
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Crown size={14} className={isVip ? 'text-amber-500' : 'text-gray-500'}/>
                    <span className="text-[10px] font-bold">{isVip ? 'VIP' : 'Mark VIP'}</span>
                  </button>
                  <button
                    onClick={toggleElite}
                    title={isElite ? 'Click to remove Elite membership' : 'Mark this customer as Elite member'}
                    className={`flex flex-col items-center justify-center gap-0.5 py-2 transition active:bg-gray-100 ${
                      isElite
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:brightness-105'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Crown size={14} className={isElite ? 'text-white' : 'text-gray-500'}/>
                    <span className="text-[10px] font-bold">{isElite ? 'Elite' : 'Mark Elite'}</span>
                  </button>
                  <button
                    onClick={() => setMergeOpen(true)}
                    title="Combine this customer with another duplicate record"
                    className="flex flex-col items-center justify-center gap-0.5 py-2 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition"
                  >
                    <Merge size={14} className="text-gray-500"/>
                    <span className="text-[10px] font-bold">Merge</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="mx-4 mt-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500"/>
                  <span className="flex-1 break-all">{error}</span>
                  <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                    <X size={12}/>
                  </button>
                </div>
              )}

              {/* Editable info */}
              <Section title="Customer info">
                <Field label="Name">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sniffy-purple"
                  />
                </Field>

                {/* Session names capture a point-in-time copy, not a
                    live join — offer to backfill only when they've
                    actually drifted from the saved customer name. */}
                {mismatchedSessions.length > 0 && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                    <p className="text-amber-800">
                      <span className="font-bold">{mismatchedSessions.length} past session{mismatchedSessions.length === 1 ? '' : 's'}</span>{' '}
                      still show{mismatchedSessions.length === 1 ? 's' : ''} a different name
                      ({mismatchedNames.map((n, i) => (
                        <span key={n}>{i > 0 && ', '}<span className="font-semibold">"{n}"</span></span>
                      ))}). Update {mismatchedSessions.length === 1 ? 'it' : 'them'} to{' '}
                      <span className="font-semibold">"{lastSavedName.trim()}"</span> too?
                    </p>
                    <button
                      type="button"
                      disabled={nameSyncBusy}
                      onClick={() => syncNameToSessions(lastSavedName.trim(), mismatchedSessions.map(s => s.id))}
                      className="mt-2 px-3 py-1.5 bg-amber-500 text-white text-[11px] font-bold rounded-lg hover:bg-amber-600 disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {nameSyncBusy ? <Loader2 size={12} className="animate-spin"/> : null}
                      Update past session{mismatchedSessions.length === 1 ? '' : 's'}
                    </button>
                  </div>
                )}
                {/* <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="optional"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sniffy-purple"
                  />
                </Field> */}
                <Field label="Address">
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sniffy-purple resize-none"
                  />
                </Field>
                {/* GPS / Maps share URL — populated automatically from the
                    most recent session via the upsert trigger; editable
                    here so the coordinator can fix it when the customer
                    moves or sends a fresh location pin.  The Navigate
                    CTA on the groomer side opens this URL directly. */}
                <Field label="GPS / Maps link">
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    <input
                      type="url"
                      value={gps}
                      onChange={e => setGps(e.target.value)}
                      placeholder="https://maps.app.goo.gl/…"
                      className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sniffy-purple"
                    />
                    {gps.trim() && (
                      <a
                        href={gps.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in Google Maps"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-sniffy-purple transition"
                      >
                        <ExternalLink size={14}/>
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                    Used by the groomer&apos;s Navigate button on every session.
                  </p>
                  {/* Map preview — shown when an address is available.
                      Uses Google Maps embed (no API key required) with
                      the customer's address as the query.  If address
                      is empty we skip the embed entirely so no blank
                      tile shows up.  Data handling is read-only here;
                      the actual gps/address state is unchanged. */}
                  {address.trim() && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 150 }}>
                      {/* iwloc=A forces Google Maps to drop a red pin
                          marker at the searched address instead of just
                          panning to the area.  z=16 keeps it zoomed in
                          tightly so the pin is clearly visible. */}
                      <iframe
                        title="Customer location map"
                        width="100%"
                        height="150"
                        style={{ border: 0, display: 'block' }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(address.trim())}&output=embed&z=16&iwloc=A`}
                      />
                    </div>
                  )}
                </Field>
                {/* <Field label="City">
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sniffy-purple"
                  />
                </Field> */}
                <Field label="Notes (pinned for groomers)">
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Allergies, behaviour, gate code, etc.  Visible on every session for this customer."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sniffy-purple resize-none"
                  />
                </Field>

                <label className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                  <input
                    type="checkbox"
                    checked={whatsappOptIn}
                    onChange={e => setWhatsappOptIn(e.target.checked)}
                    className="rounded text-sniffy-purple focus:ring-sniffy-purple"
                  />
                  Receive WhatsApp reminders &amp; offers
                </label>

                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={persistChanges}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-sniffy-purple disabled:opacity-60 transition active:scale-95"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin"/> : <Save size={13}/>}
                    Save changes
                  </button>
                  {savedFlash && (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-semibold text-green-600"
                    >Saved ✓</motion.span>
                  )}
                </div>

                {/* Phase 2c — notes audit trail toggle.  Hidden when
                    the customer has zero history rows AND the panel
                    isn't already open (no point teasing an empty log).
                    Click to expand, click again to collapse. */}
                <div className="pt-2">
                  <button
                    onClick={() => setHistoryOpen(o => !o)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-sniffy-purple transition"
                  >
                    <History size={11}/>
                    {historyOpen ? 'Hide notes history' : 'View notes history'}
                  </button>
                  <AnimatePresence>
                    {historyOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 space-y-2">
                          {historyLoading ? (
                            <p className="text-[11px] text-gray-400">Loading history…</p>
                          ) : noteHistory.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic">No edits recorded yet — the audit trail starts the next time the notes change.</p>
                          ) : (
                            noteHistory.map(h => (
                              <div key={h.id} className="bg-gray-50 rounded-lg p-2 text-[11px]">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-gray-700">
                                    {new Date(h.changed_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className="text-gray-400">by {h.changed_by || 'unknown'}</span>
                                </div>
                                <div className="space-y-1">
                                  {h.prev_text && (
                                    <p className="text-gray-500 line-through whitespace-pre-wrap break-words">
                                      {h.prev_text}
                                    </p>
                                  )}
                                  <p className="text-gray-800 whitespace-pre-wrap break-words">
                                    {h.new_text || <span className="italic text-gray-400">(cleared)</span>}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Section>

              {/* Tags */}
              <Section title="Tags" icon={Tag}>
                <div className="flex flex-wrap gap-1.5">
                  {tags.length === 0 && (
                    <span className="text-xs text-gray-400 italic">No tags yet</span>
                  )}
                  {tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-50 text-sniffy-purple border border-purple-200 rounded-full px-2.5 py-0.5">
                      {t}
                      <button onClick={() => removeTag(t)} className="hover:text-red-500">
                        <X size={10}/>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag and press enter"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-sniffy-purple"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >Add</button>
                </div>
              </Section>

              {/* Pets — Phase 2a: editable.  Each card expands inline
                  for full edit; the "Add pet" button reveals an inline
                  AddPetInline form below the list.  Soft-delete (mark
                  inactive) preserves session_pets history. */}
              <Section title={`Pets (${pets.length})`}>
                {loading ? (
                  <div className="text-xs text-gray-400">Loading pets…</div>
                ) : (
                  <div className="space-y-2">
                    {pets.length === 0 && !addingPet && (
                      <div className="text-xs text-gray-400 italic">No pets recorded yet — add one below or wait for the next grooming session.</div>
                    )}
                    {pets.map(p => (
                      <PetEditCard
                        key={p.id}
                        pet={p}
                        sessionCount={petSessionCounts[p.id] ?? 0}
                        onChanged={loadRelated}
                      />
                    ))}
                    {addingPet ? (
                      <AddPetInline
                        customerId={customer.id}
                        onCreated={() => { setAddingPet(false); loadRelated(); }}
                        onCancel={() => setAddingPet(false)}
                      />
                    ) : (
                      <button
                        onClick={() => setAddingPet(true)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-sniffy-purple bg-purple-50 border border-dashed border-purple-200 hover:bg-purple-100 transition"
                      >
                        <Plus size={12}/> Add a pet
                      </button>
                    )}
                  </div>
                )}
              </Section>

              {/* Phase 5 — Referrals & credits.  Shows the customer's
                  own referral code (auto-generated on first session),
                  a copy/share row, who referred them (if anyone), a
                  ₹ balance from the ledger view, and the recent ledger
                  entries.  Coordinators can also attach a referral
                  code retroactively (within the new-customer window
                  enforced by the SQL RPC) and post manual adjustments. */}
              <Section title="Referrals & credits" icon={Gift}>
                <div className="space-y-3">
                  {/* Referral code card */}
                  {customer.referral_code ? (
                    <div className="p-3 rounded-xl border border-purple-200 bg-purple-50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-sniffy-purple/70">Their referral code</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-lg font-extrabold tracking-widest text-sniffy-purple bg-white border border-purple-200 rounded-lg px-3 py-1.5 select-all">
                          {customer.referral_code}
                        </code>
                        <button
                          onClick={() => copyReferralBits('code')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-sniffy-purple bg-white border border-purple-200 hover:bg-purple-100 transition"
                        >
                          <Copy size={11}/> {refCopyFlash ? 'Copied ✓' : 'Copy'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <a
                          href={buildReferralShareUrl(customer.referral_code, customer.name)}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white transition active:scale-95"
                          style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
                        >
                          <Share2 size={11}/> WhatsApp share
                        </a>
                        <button
                          onClick={() => copyReferralBits('link')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition"
                        >
                          <Copy size={11}/> Copy share message
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">
                      No referral code yet. The Phase 5 migration backfills codes for existing customers — apply it and refresh.
                    </p>
                  )}

                  {/* Referred-by row */}
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Referred by</p>
                    {customer.referred_by_customer_id ? (
                      <p className="text-[13px] font-bold text-gray-800 mt-1">
                        {referrerName ?? '— (customer deleted)'}
                      </p>
                    ) : (
                      <div className="mt-1 space-y-1.5">
                        <p className="text-[11px] text-gray-500 italic">No referrer attached yet.</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={refCodeInput}
                            onChange={e => setRefCodeInput(e.target.value.toUpperCase())}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); attachReferralCode(); } }}
                            placeholder="Enter a code"
                            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono tracking-widest uppercase focus:outline-none focus:border-sniffy-purple"
                            maxLength={10}
                          />
                          <button
                            onClick={attachReferralCode}
                            disabled={refAttachBusy || !refCodeInput.trim()}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-sniffy-purple disabled:opacity-50 transition active:scale-95"
                          >
                            {refAttachBusy ? <Loader2 size={11} className="animate-spin"/> : <Plus size={11}/>}
                            Attach
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-snug">
                          Codes can only be attached within the first session. The reward fires automatically when the referee's first session completes.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Balance + lifetime stats */}
                  {referralBalance && (
                    <div className="grid grid-cols-3 gap-2">
                      <BalanceStat
                        label="Balance"
                        value={`₹${Math.round(referralBalance.balance).toLocaleString('en-IN')}`}
                        highlight={referralBalance.balance > 0}
                      />
                      <BalanceStat
                        label="Earned"
                        value={`₹${Math.round(referralBalance.lifetime_earned).toLocaleString('en-IN')}`}
                      />
                      <BalanceStat
                        label="Redeemed"
                        value={`₹${Math.round(referralBalance.lifetime_redeemed).toLocaleString('en-IN')}`}
                      />
                    </div>
                  )}

                  {/* Manual adjust row — coordinator-only goodwill / corrections */}
                  <div className="p-3 rounded-xl bg-white border border-gray-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Manual adjustment
                      <span className="text-gray-300 font-normal ml-1">(positive = credit · negative = deduction)</span>
                    </p>
                    <div className="grid grid-cols-[110px_1fr_auto] gap-2">
                      <input
                        type="number"
                        step={1}
                        value={adjAmount}
                        onChange={e => setAdjAmount(e.target.value)}
                        placeholder="₹ amount"
                        className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-sniffy-purple"
                      />
                      <input
                        type="text"
                        value={adjNote}
                        onChange={e => setAdjNote(e.target.value)}
                        placeholder="Reason (e.g. goodwill, refund)"
                        className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-sniffy-purple"
                      />
                      <button
                        onClick={postAdjustment}
                        disabled={adjBusy || !adjAmount || Number(adjAmount) === 0}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-sniffy-purple disabled:opacity-50 transition active:scale-95"
                      >
                        {adjBusy ? <Loader2 size={11} className="animate-spin"/> : <Save size={11}/>}
                        Post
                      </button>
                    </div>
                  </div>

                  {/* Ledger entries */}
                  {referralLedger.length > 0 ? (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Recent ledger entries</p>
                      {referralLedger.slice(0, 8).map(rc => (
                        <LedgerRow key={rc.id} row={rc}/>
                      ))}
                      {referralLedger.length > 8 && (
                        <p className="text-[10px] text-gray-400 italic">+ {referralLedger.length - 8} older entries</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">
                      No ledger entries yet — credits will appear here once a referral is awarded or adjusted.
                    </p>
                  )}
                </div>
              </Section>

              {/* Phase 3 — Outreach (last contact + snooze controls + history). */}
              <Section title="Outreach" icon={Send}>
                <div className="space-y-2">
                  {/* Snooze status row */}
                  {pausedUntil && new Date(pausedUntil) >= new Date(new Date().toDateString()) ? (
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                          <PauseCircle size={11}/> Paused until {new Date(pausedUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-amber-700/80 mt-0.5">No reminders will be queued until then.</p>
                      </div>
                      <button
                        onClick={() => applySnooze(null)}
                        disabled={snoozeBusy}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-amber-800 bg-white border border-amber-300 hover:bg-amber-100 disabled:opacity-60 transition"
                      >
                        {snoozeBusy ? <Loader2 size={10} className="animate-spin"/> : <PlayCircle size={10}/>}
                        Resume
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">Snooze:</span>
                      {[7, 30, 90, 365].map(d => (
                        <button
                          key={d}
                          onClick={() => applySnooze(d)}
                          disabled={snoozeBusy}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-gray-600 bg-white border border-gray-200 hover:border-amber-300 hover:text-amber-700 disabled:opacity-60 transition"
                        >
                          {d === 7 ? '7d' : d === 30 ? '30d' : d === 90 ? '90d' : '1 year'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Last contact summary */}
                  {outreachLog.length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic">No outreach yet.  Customers appear in the queue automatically once they lapse.</p>
                  ) : (
                    <div className="space-y-1.5 mt-1">
                      {outreachLog.slice(0, 5).map(o => (
                        <div key={o.id} className="bg-gray-50 rounded-lg p-2 text-[11px]">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-gray-700">{o.template_key}</span>
                            <span className={`text-[10px] font-bold uppercase ${
                              o.status === 'sent' ? 'text-green-600' :
                              o.status === 'queued' ? 'text-amber-600' :
                              o.status === 'skipped' ? 'text-gray-500' :
                              'text-red-500'
                            }`}>
                              {o.status === 'sent' ? '✓ sent' : o.status}
                            </span>
                          </div>
                          <p className="text-gray-500">
                            {o.sent_at
                              ? new Date(o.sent_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : new Date(o.queued_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {o.sent_by && <> · by {o.sent_by}</>}
                            {o.skip_reason && <> · {o.skip_reason}</>}
                          </p>
                        </div>
                      ))}
                      {outreachLog.length > 5 && (
                        <p className="text-[10px] text-gray-400 italic">+ {outreachLog.length - 5} older entries</p>
                      )}
                    </div>
                  )}
                </div>
              </Section>

              {/* Sessions */}
              <Section title={`Grooming history (${sessions.length})`} icon={Calendar}>
                {loading ? (
                  <div className="text-xs text-gray-400">Loading sessions…</div>
                ) : sessions.length === 0 ? (
                  <div className="text-xs text-gray-400 italic">No sessions yet.</div>
                ) : (
                  <div className="space-y-2">
                    {sessions.map(s => (
                      <div key={s.id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900">
                            {fmtDate(s.session_date)}
                            <span className="text-xs text-gray-500 font-normal ml-1.5">
                              · {s.pet_type === 'dog' ? '🐶' : '🐱'} {s.breed ?? '—'}
                            </span>
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {s.package ?? '—'}
                            {s.groomer_name && <> · {s.groomer_name}</>}
                            {s.source && <> · {s.source}</>}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-gray-900">{fmtMoney(s.total_collected || s.booking_amount)}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${
                            s.status === 'completed'     ? 'text-green-600' :
                            s.status === 'grooming_done' ? 'text-orange-600' :
                            s.status === 'cancelled'     ? 'text-red-500' : 'text-gray-500'
                          }`}>{s.status}</p>
                          {s.client_rating != null && (
                            <p className="text-[10px] text-amber-600 mt-0.5 flex items-center justify-end gap-0.5">
                              <Star size={10} fill="currentColor"/> {s.client_rating}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Bookings (leads) */}
              {bookings.length > 0 && (
                <Section title={`Website inquiries (${bookings.length})`}>
                  <div className="space-y-2">
                    {bookings.map(b => (
                      <div key={b.id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900">
                            {fmtDate(b.created_at)}
                            <span className="text-[11px] text-gray-500 font-normal ml-1.5">
                              · {b.pet_type === 'dog' ? '🐶' : '🐱'} {b.breed} · {b.package}
                            </span>
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${
                          b.is_converted ? 'text-green-600' : 'text-amber-600'
                        }`}>{b.is_converted ? 'Converted' : 'Pending'}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              <div className="h-6"/>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Rebook flow — opens SessionFormModal pre-filled.  On save we
          refresh the parent (which reloads the customer list) and the
          modal so the new session appears immediately. */}
      {rebookOpen && (
        <Suspense fallback={null}>
          <SessionFormModal
            open={rebookOpen}
            onClose={() => setRebookOpen(false)}
            onSaved={() => {
              setRebookOpen(false);
              loadRelated();
              onChanged();
            }}
            prefill={rebookPrefill}
          />
        </Suspense>
      )}

      {/* Merge flow — opens the picker, runs the SQL function, then
          closes the detail sheet entirely (the loser may have been the
          one this sheet was showing — safest UX is to send the user
          back to the list, which now reflects the merge). */}
      <CustomerMergeModal
        open={mergeOpen}
        primary={customer}
        onClose={() => setMergeOpen(false)}
        onMerged={() => {
          setMergeOpen(false);
          onChanged();
          onClose();
        }}
      />
    </>
  );
}

// ─── Small layout helpers ───────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="mx-3 mt-3 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      <h4 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
        {Icon && <Icon size={11}/>} {title}
      </h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2.5 py-1.5 bg-gray-50 rounded-lg">
      <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold leading-tight">{label}</p>
      <p className="text-sm font-bold text-gray-900 mt-0.5 truncate leading-tight">{value}</p>
    </div>
  );
}

// ─── Phase 5 — referral subcomponents ───────────────────────────────

function BalanceStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`px-2.5 py-2 rounded-xl border ${
      highlight ? 'bg-purple-50 border-purple-200 text-sniffy-purple' : 'bg-gray-50 border-gray-100 text-gray-800'
    }`}>
      <p className="text-[9px] uppercase tracking-wider font-bold opacity-60">{label}</p>
      <p className="text-sm font-extrabold mt-0.5 truncate">{value}</p>
    </div>
  );
}

function LedgerRow({ row }: { row: ReferralCredit }) {
  const positive = row.amount >= 0;
  const reasonStyles: Record<ReferralCredit['reason'], { label: string; color: string; bg: string }> = {
    signup:  { label: 'Signup',   color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200'   },
    earn:    { label: 'Earned',   color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    redeem:  { label: 'Redeemed', color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200'  },
    expire:  { label: 'Expired',  color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-200'   },
    adjust:  { label: 'Adjusted', color: 'text-sniffy-purple', bg: 'bg-purple-50 border-purple-200' },
  };
  const style = reasonStyles[row.reason];

  return (
    <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${positive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {positive ? <ArrowDownLeft size={12}/> : <ArrowUpRight size={12}/>}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex text-[9px] font-bold uppercase tracking-wider border rounded-full px-1.5 py-0 ${style.bg} ${style.color}`}>
              {style.label}
            </span>
            <span className="text-gray-400 font-normal">
              {new Date(row.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </p>
          {row.note && (
            <p className="text-[10px] text-gray-500 mt-0.5 truncate">{row.note}</p>
          )}
        </div>
      </div>
      <p className={`text-sm font-extrabold whitespace-nowrap flex items-center ${positive ? 'text-emerald-600' : 'text-amber-700'}`}>
        {positive ? '+' : ''}<IndianRupee size={11} className="inline mr-0.5"/>{Math.abs(row.amount).toLocaleString('en-IN')}
      </p>
    </div>
  );
}
