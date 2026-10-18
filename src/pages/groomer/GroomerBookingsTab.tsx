/**
 * groomer/GroomerBookingsTab.tsx
 *
 * Upcoming | Recent subtabs.
 * Tap any card → opens a full-detail bottom-sheet modal with everything
 * the groomer needs: pet info, package, add-ons, pricing, address,
 * medical issues, notes, call + navigate CTAs.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Phone, MapPin, Clock, X,
  Package, AlertTriangle, StickyNote, Star,
  ChevronRight, CheckCircle2, Search,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PaymentStatusBadge from '../../components/PaymentStatusBadge';
import {
  GroomingSession,
  STATUS_COLORS, STATUS_LABELS,
  fmtDate, fmtCurrency,
} from '../admin/types';
import type { AdminUser } from '../admin/authStore';
import SessionActionPanel, { type PrimaryAction } from './SessionActionPanel';
import SessionChat from '../../components/SessionChat';
import SessionPetLines from '../admin/SessionPetLines';
import { useSessionPetDisplay } from '../admin/useSessionPets';
import type { DisplayPet } from '../admin/sessionPets';

/** Format a "HH:MM[:SS]" string as 12-hour parts.
 *  Returns { hhmm, meridiem } so callers can style the digits and the
 *  AM/PM tag independently (stacked, different sizes, etc.).
 *  Returns nulls for empty / malformed input so the caller can choose
 *  its own placeholder. */
export function formatTime12h(t?: string | null): { hhmm: string | null; meridiem: 'AM' | 'PM' | null } {
  if (!t) return { hhmm: null, meridiem: null };
  const [hStr, mStr] = t.split(':');
  const h24 = parseInt(hStr, 10);
  if (isNaN(h24)) return { hhmm: null, meridiem: null };
  const m = (mStr ?? '00').padStart(2, '0').slice(0, 2);
  const meridiem: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return { hhmm: `${h12}:${m}`, meridiem };
}

/** Loose, case-insensitive match of `q` against the searchable fields of
 *  a session — pet parent name, breed, package, groomer name, phone. */
function sessionMatches(s: GroomingSession, q: string): boolean {
  const needle = q.toLowerCase();
  const haystack = [
    s.pet_parent_name,
    s.breed,
    s.package,
    s.groomer_name,
    s.phone,
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(needle);
}

// ─── Status accent bar colour ──────────────────────────────────
const STATUS_ACCENT: Record<string, string> = {
  lead:             '#f97316',
  scheduled:        '#3b82f6',
  groomer_assigned: '#8b5cf6',
  completed:        '#22c55e',
  cancelled:        '#ef4444',
};

// ─── Detail Modal ──────────────────────────────────────────────

function SessionDetailModal({
  session,
  pets,
  groomer,
  onClose,
  onUpdated,
}: {
  session: GroomingSession;
  /** Per-pet lines when the visit covers more than one pet. */
  pets?: DisplayPet[];
  groomer: AdminUser;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const accentColor = STATUS_ACCENT[session.status] ?? '#d1d5db';

  // Reported by SessionActionPanel — the one step that actually needs
  // doing right now. Drives the sticky footer's primary CTA and the
  // progress bar below the header, so the groomer never has to scroll
  // into the accordion just to find the next button to press.
  const [primaryAction, setPrimaryAction] = useState<PrimaryAction | null>(null);
  const progressPct =
    session.status === 'completed' ? 100
    : session.status === 'cancelled' ? 0
    : primaryAction ? Math.round(((primaryAction.stepNumber - 1) / primaryAction.totalSteps) * 100)
    : 100; // no primary action left but not yet coordinator-completed = groomer's part is done

  const rawPhone  = (session.phone ?? '').replace(/\D/g, '');
  const dialPhone = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`;
  // Navigate strictly off `gps_location`.  We used to geocode the address
  // text, but that round-tripped through Google's search and gave bad
  // results for share links / partial addresses.  Now: if the coordinator
  // saved a maps link, we use it as-is; otherwise the Navigate CTA is
  // hidden entirely (see footer below).
  const gpsUrl = (session.gps_location ?? '').trim();
  const hasGps = gpsUrl.length > 0;

  // Parse booking_amount_expr if available: "1299+290+50" → show breakdown
  const amountParts = session.booking_amount_expr
    ? session.booking_amount_expr.split('+').map(Number).filter(n => !isNaN(n) && n > 0)
    : [];

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <motion.div
        key="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl overflow-hidden"
        style={{
          maxHeight: '92dvh',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        }}
      >
        {/* Drag pill */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200"/>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 20px)' }}>

          {/* ── Header — hero band tinted by status, pet avatar, job value up front ── */}
          <div
            className="relative px-4 pt-2 pb-3"
            style={{ background: `linear-gradient(160deg, ${accentColor}17 0%, ${accentColor}05 55%, transparent 100%)` }}
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[session.status]}`}>
                {STATUS_LABELS[session.status]}
              </span>
              <button
                onClick={onClose}
                className="shrink-0 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-white transition"
              >
                <X size={15} className="text-gray-500"/>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="shrink-0 w-14 h-14 rounded-2xl grid place-items-center text-[26px]"
                style={{ background: `${accentColor}22` }}
              >
                {session.pet_type === 'dog' ? '🐶' : '🐱'}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-extrabold text-gray-900 leading-tight truncate">
                  {session.pet_parent_name}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {pets && pets.length > 1 ? (
                    <span className="font-semibold text-gray-700">{pets.length} pets · {pets.map(p => p.name ?? p.breed ?? (p.type === 'dog' ? 'Dog' : 'Cat')).join(', ')}</span>
                  ) : (<>
                    <span className="font-semibold text-gray-700">{session.breed ?? 'Unknown breed'}</span>
                    {session.pet_age ? ` · ${session.pet_age}` : ''}
                  </>)}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                    <Calendar size={10}/>{fmtDate(session.session_date)}
                  </span>
                  {session.scheduled_time && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-sniffy-purple">
                      <Clock size={10}/>{session.scheduled_time}
                    </span>
                  )}
                </div>
              </div>

              {session.booking_amount > 0 && (
                <div className="shrink-0 text-right">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Job value</p>
                  <p className="text-lg font-extrabold text-green-600 leading-tight">
                    {fmtCurrency(session.booking_amount)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Journey progress — one glance at how far through the visit ── */}
          {session.status !== 'cancelled' && (
            <div className="h-1 bg-gray-100">
              <div
                className="h-full rounded-r-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #7c3aed, #451a8b)' }}
              />
            </div>
          )}

          <div className="px-4 py-3 space-y-3">

            {/* ── Medical alert — shown first if present ── */}
            {session.medical_issues && (
              <div
                className="flex items-start gap-2.5 p-3 rounded-xl border"
                style={{ background: '#fff7ed', borderColor: '#fed7aa' }}
              >
                <AlertTriangle size={14} className="text-orange-500 mt-0.5 shrink-0"/>
                <div>
                  <p className="text-[10px] font-extrabold text-orange-700 uppercase tracking-wide mb-0.5">
                    Medical Alert
                  </p>
                  <p className="text-xs text-orange-800 leading-snug">{session.medical_issues}</p>
                </div>
              </div>
            )}

            {/* ── Service + Pricing combined ── */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 grid place-items-center shrink-0">
                    <Package size={11} className="text-sniffy-purple"/>
                  </span>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-sniffy-purple">
                    Service
                  </p>
                </div>
                {session.booking_amount > 0 && (
                  <span className="text-base font-extrabold text-green-600">
                    {fmtCurrency(session.booking_amount)}
                  </span>
                )}
              </div>

              {pets && pets.length > 1 ? (
                /* Multi-pet: each pet's own package, add-ons and price. */
                <SessionPetLines pets={pets} showAmounts size="detail" className="mt-1"/>
              ) : session.package ? (
                <p className="text-sm font-bold text-gray-900">{session.package}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No package selected</p>
              )}

              {!(pets && pets.length > 1) && session.add_ons && session.add_ons.length > 0 && (
                <div className="space-y-1 mt-2 pt-2 border-t border-gray-200">
                  {session.add_ons.map((addon, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={11} className="text-sniffy-purple"/>
                        <span className="text-xs text-gray-700">{addon}</span>
                      </div>
                      {amountParts[i + 1] !== undefined && (
                        <span className="text-xs font-semibold text-gray-500">
                          +{fmtCurrency(amountParts[i + 1])}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Address / GPS — right after service so groomer knows where to go ── */}
            {(session.address || hasGps) && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-purple-100 grid place-items-center shrink-0">
                  <MapPin size={12} className="text-sniffy-purple"/>
                </span>
                <div className="min-w-0">
                  {session.address && (
                    <p className="text-xs text-gray-700 leading-snug">{session.address}</p>
                  )}
                  {hasGps && (
                    <a
                      href={gpsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sniffy-purple hover:text-purple-800 transition mt-0.5"
                    >
                      Open GPS pin →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* ── Session Actions ── */}
            <SessionActionPanel session={session} onUpdated={onUpdated} onPrimaryActionChange={setPrimaryAction}/>

            {/* ── Client rating (for completed) ── */}
            {session.status === 'completed' && session.client_rating && (
              <div className="flex items-center gap-2.5 bg-amber-50 rounded-xl p-3">
                <Star size={15} className="text-amber-400 fill-amber-400 shrink-0"/>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Client Rating</p>
                  <p className="text-sm font-extrabold text-amber-800">{session.client_rating} / 5</p>
                </div>
              </div>
            )}

            {/* ── Groomer observation ── */}
            {session.groomer_observation && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 mb-1">Your Observation</p>
                <p className="text-xs text-blue-900 leading-snug">{session.groomer_observation}</p>
              </div>
            )}

            {/* ── Notes ── */}
            {session.notes && (
              <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                <StickyNote size={12} className="text-gray-400 mt-0.5 shrink-0"/>
                <p className="text-xs text-gray-700 leading-snug">{session.notes}</p>
              </div>
            )}

            {/* ── Next due ── */}
            {session.next_due_date && (
              <div className="flex items-center gap-2.5 px-3 py-2 bg-purple-50 rounded-xl">
                <ChevronRight size={13} className="text-sniffy-purple"/>
                <div>
                  <p className="text-[10px] font-bold text-sniffy-purple uppercase tracking-wide">Next Due</p>
                  <p className="text-xs font-semibold text-gray-800">{fmtDate(session.next_due_date)}</p>
                </div>
              </div>
            )}

            {/* ── Session Chat — only for active sessions ── */}
            {session.status !== 'completed' && session.status !== 'cancelled' && (
              <div className="pt-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2 px-1">
                  Customer Chat
                </p>
                <SessionChat
                  sessionId={session.id}
                  senderType="groomer"
                  senderId={groomer.groomer_id ?? groomer.id}
                  senderName={groomer.name}
                />
              </div>
            )}

          </div>{/* end scrollable inner */}

          {/* ── Sticky CTA footer ── only shown for active sessions.
              Call/Navigate demote to icon-only accessories; the big
              button is always whatever SessionActionPanel reported as
              the *current* step, so the one action that matters right
              now is always one thumb-reach away — no scrolling into
              the accordion required. Past sessions (completed /
              cancelled) don't need any of this. */}
          {session.status !== 'completed' && session.status !== 'cancelled' && (
            <div
              className="sticky bottom-0 px-4 pt-3 pb-4 bg-white border-t border-gray-100 flex gap-2.5"
              style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}
            >
              {session.phone ? (
                <a
                  href={`tel:${session.phone}`}
                  aria-label="Call client"
                  className="shrink-0 w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center"
                >
                  <Phone size={17} className="text-gray-600"/>
                </a>
              ) : (
                <button
                  disabled
                  aria-label="No phone on file"
                  className="shrink-0 w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 cursor-not-allowed"
                >
                  <Phone size={17}/>
                </button>
              )}

              {/* Navigate is GPS-only by design.  No GPS pin = no button,
                  so the groomer never gets routed to an ambiguous
                  geocoded guess of a text address. */}
              {hasGps && (
                <a
                  href={gpsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Navigate"
                  className="shrink-0 w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center"
                >
                  <MapPin size={17} className="text-gray-600"/>
                </a>
              )}

              {primaryAction ? (
                <button
                  onClick={primaryAction.onAction}
                  disabled={primaryAction.disabled}
                  className={[
                    'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-extrabold transition-all',
                    primaryAction.disabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'text-white active:scale-95',
                  ].join(' ')}
                  style={
                    !primaryAction.disabled
                      ? { background: 'linear-gradient(135deg, #7c3aed 0%, #451a8b 100%)', boxShadow: '0 4px 14px rgba(69,26,139,0.35)' }
                      : undefined
                  }
                >
                  {primaryAction.label}
                  <span className="text-[10px] font-bold opacity-70">
                    {primaryAction.stepNumber}/{primaryAction.totalSteps}
                  </span>
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-center py-3.5 rounded-2xl text-xs font-bold text-emerald-600 bg-emerald-50">
                  All caught up on your side ✓
                </div>
              )}
            </div>
          )}

        </div>{/* end overflow scroll */}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Session Card (compact, tappable) ─────────────────────────

function GroomerSessionCard({
  session,
  pets,
  onClick,
}: {
  session: GroomingSession;
  pets?: DisplayPet[];
  onClick: () => void;
}) {
  const accentColor = STATUS_ACCENT[session.status] ?? '#d1d5db';
  // Note: groomers should NOT see the booking source (Direct Call / Woofly /
  // etc.) — that's an ops-internal attribution. Card intentionally omits it.

  // Two paths to the "DONE" stamp + faded look:
  //   1. Coordinator has confirmed `status='completed'` (canonical done)
  //   2. Groomer has marked complete from their side, awaiting coord
  //
  // Cancelled sessions get neither — they need the cancelled status pill
  // to remain visible.
  const isDone =
    session.status !== 'cancelled' &&
    (session.status === 'completed' || !!session.groomer_marked_complete_at);

  // Slight visual variation: "DONE" once coord-confirmed, "DONE ✓" while
  // still awaiting (so coord-side and groomer-side aren't visually
  // identical, even though both swap the pill for a stamp).
  const stampText = session.status === 'completed' ? 'DONE' : 'DONE';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border overflow-hidden flex cursor-pointer ${
        isDone ? 'bg-emerald-50/40 border-emerald-100' : 'bg-white border-gray-100'
      }`}
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
    >
      {/* "Done" stamp — rotated, semi-transparent, BOTTOM-right on the
          compact card so it doesn't compete with the inline price at
          top-right; top-right on the regular card.  Same visual otherwise. */}
      {isDone && (
        <div
          className={`pointer-events-none absolute z-10 select-none ${
            // Compact card: tuck stamp at the bottom-right where there's
            // breathing room.  Regular card: top-right corner as before.
            'bottom-1.5 right-2.5'
          }`}
          style={{ transform: 'rotate(8deg)' }}
        >
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-[0.18em]"
            style={{
              color: '#047857',
              border: '1.5px solid #10b981',
              background: 'rgba(255,255,255,0.7)',
              boxShadow: '0 1px 2px rgba(16,185,129,0.18)',
              opacity: 0.85,
            }}
          >
            <CheckCircle2 size={9} strokeWidth={2.6}/> {stampText}
          </div>
        </div>
      )}

      {/* Left accent bar */}
      <div
        className="w-1 shrink-0"
        style={{ background: isDone ? '#10b981' : accentColor }}
      />

      {/* Done sessions get a compact two-line layout — half the height of
          the active card, all the same information.  Date isn't repeated
          (the group header above the cards already shows it). */}
      {isDone ? (
        <div className="flex-1 min-w-0 px-3.5 py-2.5 opacity-90">
          {/* Row 1: name + price */}
          <div className="flex items-center justify-between gap-2">
            <p className="font-extrabold text-gray-900 text-[14px] leading-tight truncate pr-16">
              {session.pet_parent_name}
            </p>
            {session.booking_amount > 0 && (
              <span className="text-[11px] font-extrabold text-green-600 shrink-0">
                {fmtCurrency(session.booking_amount)}
              </span>
            )}
          </div>
          {/* Row 2: pet info · package · payment · view chevron.
              Time used to be here too — moved to the left timeline rail. */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
            <span className="shrink-0">{pets && pets.length > 1 ? '🐾' : session.pet_type === 'dog' ? '🐶' : '🐱'}</span>
            <span className="truncate">
              {pets && pets.length > 1
                ? `${pets.length} pets · ${pets.map(p => p.name ?? p.breed ?? (p.type === 'dog' ? 'Dog' : 'Cat')).join(', ')}`
                : <>
                    {session.breed ?? 'Unknown'}
                    {session.package ? ` · ${session.package}` : ''}
                  </>}
            </span>
            <PaymentStatusBadge session={session} variant="short" className="ml-auto"/>
            <ChevronRight size={11} className="shrink-0 text-sniffy-purple/70"/>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-w-0 px-4 py-3.5">

          {/* Row 1: payment status + booking status.  The payment badge
              is what tells the groomer "don't collect again" when a
              customer has already prepaid.  Time lives in the timeline
              rail to the left of the card now, so it's not repeated here. */}
          <div className="flex items-center justify-end gap-1.5 mb-2 flex-wrap">
            <PaymentStatusBadge session={session} variant="short"/>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[session.status]}`}>
              {STATUS_LABELS[session.status]}
            </span>
          </div>

          {/* Row 2: name */}
          <p className="font-extrabold text-gray-900 text-[15px] leading-tight truncate mb-1.5">
            {session.pet_parent_name}
          </p>

          {/* Row 3: pet info — multi-pet visits list every pet with its own
              package + add-ons so the groomer knows what each one needs. */}
          {pets && pets.length > 1 ? (
            <SessionPetLines pets={pets} className="mb-2"/>
          ) : (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">{session.pet_type === 'dog' ? '🐶' : '🐱'}</span>
            <span className="text-xs font-semibold text-gray-700 truncate">
              {session.breed ?? 'Unknown breed'}
            </span>
            {session.pet_age && <span className="text-xs text-gray-400">· {session.pet_age}</span>}
          </div>
          )}

          {/* Package pill */}
          {!(pets && pets.length > 1) && session.package && (
            <span className="inline-block text-[10px] font-bold text-sniffy-purple bg-purple-50 px-2 py-0.5 rounded-full mb-2">
              📦 {session.package}
            </span>
          )}

          {/* Medical warning strip */}
          {session.medical_issues && (
            <div className="flex items-center gap-1.5 text-[10px] text-orange-600 bg-orange-50 rounded-lg px-2 py-1 mb-2">
              <AlertTriangle size={10}/>
              <span className="truncate">{session.medical_issues}</span>
            </div>
          )}

          {/* Add-ons count */}
          {!(pets && pets.length > 1) && session.add_ons?.length > 0 && (
            <p className="text-[10px] text-gray-400 mb-2">
              +{session.add_ons.length} add-on{session.add_ons.length > 1 ? 's' : ''}
            </p>
          )}

          {/* Divider + footer row */}
          <div className="h-px bg-gray-100 mb-2.5"/>
          <div className="flex items-center justify-between">
            {session.booking_amount > 0 ? (
              <span className="text-xs font-extrabold text-green-600">
                {fmtCurrency(session.booking_amount)}
              </span>
            ) : (
              <span className="text-xs text-gray-300">No amount</span>
            )}
            <span className="text-[10px] text-sniffy-purple font-semibold flex items-center gap-0.5">
              View details <ChevronRight size={10}/>
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────

type Subtab = 'upcoming' | 'recent';

export default function GroomerBookingsTab({
  groomer,
  autoOpenSessionId,
  onAutoOpenConsumed,
}: {
  groomer: AdminUser;
  /** Notification deep-link: when set, we open the detail modal for
   *  this session id as soon as the sessions list is loaded.  The tab
   *  calls `onAutoOpenConsumed` after acting so the parent can clear
   *  the prop and not re-trigger on a re-render. */
  autoOpenSessionId?: string | null;
  onAutoOpenConsumed?: () => void;
}) {
  const [sessions, setSessions]       = useState<GroomingSession[]>([]);
  const [loading, setLoading]         = useState(true);
  const [subtab, setSubtab]           = useState<Subtab>('upcoming');
  const [selected, setSelected]       = useState<GroomingSession | null>(null);
  const petDisplay = useSessionPetDisplay(sessions);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('grooming_sessions')
      .select('*')
      .eq('groomer_id', groomer.groomer_id ?? groomer.id)
      .order('session_date', { ascending: false });
    setSessions((data as GroomingSession[]) ?? []);
    setLoading(false);
  }, [groomer.groomer_id, groomer.id]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Notification deep-link.  When the parent passes an autoOpenSessionId
  // (e.g. user tapped "Payment pending to collect" in the bell), we
  // wait for the sessions list to populate, find the matching row, and
  // pop it open in the detail modal.  We notify the parent once via
  // `onAutoOpenConsumed` so it can null the prop and avoid re-opening
  // on a subsequent re-render.  If the session isn't in the loaded set
  // (e.g. it was deleted), we still consume the link — silent failure
  // is preferable to leaving the modal queued forever.
  useEffect(() => {
    if (!autoOpenSessionId || loading) return;
    const match = sessions.find(s => s.id === autoOpenSessionId);
    if (match) setSelected(match);
    onAutoOpenConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenSessionId, loading, sessions]);

  const today = new Date().toISOString().slice(0, 10);

  // Once the groomer has marked complete from their side, the booking
  // belongs in "Recent" — they're done with it operationally, even if the
  // coordinator hasn't flipped canonical `status` to 'completed' yet.
  // Same idea as the DONE stamp logic on the card.
  // `grooming_done` is listed as well as the completion stamp, not
  // instead of it.  The two usually travel together — marking complete
  // sets both — but a coordinator can set the status by hand when the
  // groomer finished the job and forgot to tap.  In that case there is
  // no stamp, and without this arm the session would sit in neither
  // Upcoming nor Recent on a future-dated row, i.e. vanish.
  const isDoneFromGroomerSide = (s: GroomingSession) =>
    s.status === 'completed' ||
    s.status === 'grooming_done' ||
    s.status === 'cancelled' ||
    !!s.groomer_marked_complete_at;

  // Secondary sort on scheduled_time so the timeline reads top-to-bottom in
  // the order the groomer will actually do the jobs. Missing times sort
  // last within their day (treat as unknown / TBD).
  const byDateThenTimeAsc = (a: GroomingSession, b: GroomingSession) => {
    const d = a.session_date.localeCompare(b.session_date);
    if (d !== 0) return d;
    const ta = a.scheduled_time ?? '99:99:99';
    const tb = b.scheduled_time ?? '99:99:99';
    return ta.localeCompare(tb);
  };
  const byDateThenTimeDesc = (a: GroomingSession, b: GroomingSession) => {
    const d = b.session_date.localeCompare(a.session_date);
    if (d !== 0) return d;
    // Within a past day, still show earliest-first so the day reads in
    // chronological order — matches how the groomer remembers it.
    const ta = a.scheduled_time ?? '99:99:99';
    const tb = b.scheduled_time ?? '99:99:99';
    return ta.localeCompare(tb);
  };

  const upcoming = sessions.filter(s =>
    !isDoneFromGroomerSide(s) &&
    (s.status === 'scheduled' || s.status === 'groomer_assigned') &&
    s.session_date >= today
  ).sort(byDateThenTimeAsc);

  const recent = sessions.filter(s =>
    isDoneFromGroomerSide(s) ||
    (s.session_date < today && s.status !== 'scheduled' && s.status !== 'groomer_assigned')
  ).sort(byDateThenTimeDesc);

  // Search query — auto-resets when the user switches tabs (see the
  // setSubtab handler).  Matches against name, groomer, breed, package.
  const [query, setQuery] = useState('');

  function changeSubtab(t: Subtab) {
    setSubtab(t);
    setQuery('');   // fresh search per tab
  }

  const displayedRaw = subtab === 'upcoming' ? upcoming : recent;
  const displayed = query.trim()
    ? displayedRaw.filter(s => sessionMatches(s, query.trim()))
    : displayedRaw;

  // Group bookings by session_date.  Display is already sorted, so we
  // walk the array in order and bucket consecutive same-date items.
  const grouped: { date: string; items: GroomingSession[] }[] = [];
  for (const s of displayed) {
    const last = grouped[grouped.length - 1];
    if (last && last.date === s.session_date) last.items.push(s);
    else grouped.push({ date: s.session_date, items: [s] });
  }

  return (
    <div className="space-y-3">

      {/* Tabs + search — sit on one row on desktop, stack on mobile */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-2 shrink-0">
          {(['upcoming', 'recent'] as Subtab[]).map(tab => (
            <button
              key={tab}
              onClick={() => changeSubtab(tab)}
              className={[
                'px-4 py-2 rounded-full text-xs font-bold transition-all',
                subtab === tab
                  ? 'bg-sniffy-purple text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              ].join(' ')}
            >
              {tab === 'upcoming' ? `Upcoming (${upcoming.length})` : `Recent (${recent.length})`}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[140px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={subtab === 'upcoming' ? 'Search upcoming…' : 'Search recent…'}
            className="w-full pl-8 pr-7 py-2 rounded-full bg-gray-50 border border-gray-100 text-[12px] focus:bg-white focus:border-purple-200 focus:ring-2 focus:ring-purple-100 outline-none transition"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 grid place-items-center text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X size={12}/>
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl"/>)}
        </div>
      ) : displayedRaw.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar size={32} className="mx-auto mb-3 opacity-30"/>
          <p className="text-sm font-semibold">
            {subtab === 'upcoming' ? 'No upcoming sessions' : 'No past sessions'}
          </p>
          <p className="text-xs mt-1">
            {subtab === 'upcoming'
              ? 'Your scheduled sessions will appear here'
              : 'Completed sessions will appear here'}
          </p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Search size={26} className="mx-auto mb-2 opacity-30"/>
          <p className="text-sm font-semibold">No matches for "{query}"</p>
          <button
            onClick={() => setQuery('')}
            className="mt-2 text-[11px] font-bold text-sniffy-purple underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={subtab + query}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {grouped.map(({ date, items }) => (
              <div key={date} className="space-y-2">
                {/* Date header — readable at a glance, doesn't compete with
                    the cards.  Count appended so groomers feel scale. */}
                <div className="flex items-center gap-2 px-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-sniffy-purple">
                    {fmtDate(date)}
                  </p>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-100 to-transparent"/>
                  <p className="text-[10px] font-bold text-gray-400">
                    {items.length}
                  </p>
                </div>

                {/* Timeline list — time on the left in its own column with a
                    coloured dot and a connecting line, card on the right.
                    Reading top-to-bottom = the order the groomer will work
                    through the day. Time is 12-hour AM/PM, stacked (big
                    digits over a small meridiem tag) so it reads at a
                    glance from across the room. */}
                <div className="relative">
                  {items.map((s, idx) => {
                    const { hhmm, meridiem } = formatTime12h(s.scheduled_time);
                    const dotColor =
                      s.status !== 'cancelled' &&
                      (s.status === 'completed' || !!s.groomer_marked_complete_at)
                        ? '#10b981'
                        : (STATUS_ACCENT[s.status] ?? '#d1d5db');
                    const isLast = idx === items.length - 1;
                    return (
                      <div key={s.id} className="flex gap-2.5">
                        {/* Left rail: time + dot + connecting line */}
                        <div className="flex flex-col items-center w-14 shrink-0 pt-2.5">
                          {hhmm ? (
                            <div className="flex flex-col items-center leading-none">
                              <span className="text-[16px] font-extrabold text-gray-900 tabular-nums tracking-tight">
                                {hhmm}
                              </span>
                              <span className="text-[10px] font-bold text-gray-500 mt-0.5 tracking-wider">
                                {meridiem}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[13px] font-extrabold text-gray-400 leading-none">
                              --:--
                            </span>
                          )}
                          <span
                            className="w-3 h-3 rounded-full mt-2 ring-2 ring-white"
                            style={{
                              background: dotColor,
                              boxShadow: `0 0 0 1.5px ${dotColor}`,
                            }}
                          />
                          {!isLast && (
                            <span className="flex-1 w-px bg-gray-200 mt-1 mb-1 min-h-[24px]"/>
                          )}
                        </div>

                        {/* Right: existing booking card */}
                        <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-3'}`}>
                          <GroomerSessionCard
                            session={s}
                            pets={petDisplay.get(s.id)}
                            onClick={() => setSelected(s)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Detail modal */}
      {selected && (
        <SessionDetailModal
          session={selected}
          pets={petDisplay.get(selected.id)}
          groomer={groomer}
          onClose={() => setSelected(null)}
          onUpdated={async () => {
            // After any milestone change, refetch and re-pin the
            // updated row so the modal shows fresh state.
            await fetchSessions();
            const fresh = await supabase
              .from('grooming_sessions')
              .select('*')
              .eq('id', selected.id)
              .single();
            if (fresh.data) setSelected(fresh.data as GroomingSession);
          }}
        />
      )}
    </div>
  );
}
