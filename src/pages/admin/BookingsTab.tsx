/**
 * admin/BookingsTab.tsx
 *
 * Lists all rows from the `bookings` table.
 * Pending bookings show a "Convert → Session" button.
 * Clicking it opens SessionFormModal pre-filled with booking data.
 * On save: inserts into grooming_sessions + marks booking is_converted = true.
 */

import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, CheckCircle2, Clock, Phone,
  ArrowRightCircle, X, ChevronDown, ChevronUp, AlertCircle, MessageCircle,
  Repeat, Crown, Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
const SessionFormModal = lazy(() => import('./SessionFormModal'));
import type { GroomingSession } from './types';
import { CAT_BREEDS, DOG_BREEDS } from './types';
import ChangeRequestsSection from './ChangeRequestsSection';

// ─── Types ────────────────────────────────────────────────────

interface Booking {
  id: string;
  name: string;
  phone: string;
  pet_type: string;
  pet_name: string | null;
  breed: string;
  age: number;
  medical: string | null;
  city: string;
  package: string;
  location: string | null;
  created_at: string;
  is_converted: boolean;
  /** "Is your pet vaccinated?" collected on the public booking wizard.
   *  Null for bookings made before this question existed. */
  pet_vaccinated: boolean | null;
  /** Phase 1 — set by trigger when the booking's phone matches an
   *  existing customer (i.e. they've been groomed before).  Null for
   *  brand-new leads. */
  customer_id: string | null;
}

/** Compact customer summary surfaced on the booking card when a phone
 *  already belongs to a returning customer.  Populated by a single
 *  side-query keyed on customer_id — keeps the bookings query simple. */
interface CustomerSummary {
  id: string;
  name: string;
  total_sessions: number;
  last_session_at: string | null;
  is_vip: boolean;
  lifecycle_stage: 'new' | 'active' | 'lapsed' | 'churned';
}

// ─── Helpers ─────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function ageLabel(age: number) {
  if (age <= 1) return '0-1 years';
  if (age <= 5) return '1-5 years';
  return '5+ years';
}

// ─── Booking Card (mobile) ────────────────────────────────────

/** Pill shown when a booking's phone matches a returning customer.
 *  Quietly signals "this isn't a brand-new lead — they've been groomed
 *  N times before, last on <date>" so the coordinator can prioritise
 *  the call / handle pricing accordingly. */
function ReturningBadge({ s }: { s: CustomerSummary }) {
  const subtitle =
    s.last_session_at
      ? `${s.total_sessions} session${s.total_sessions === 1 ? '' : 's'} · last ${fmtDate(s.last_session_at)}`
      : `${s.total_sessions} session${s.total_sessions === 1 ? '' : 's'}`;
  return (
    <span
      title={subtitle}
      className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-sniffy-purple border border-purple-200 rounded-full px-2 py-0.5"
    >
      {s.is_vip ? <Crown size={9}/> : <Repeat size={9}/>}
      {s.is_vip ? 'VIP returning' : 'Returning'}
      <span className="text-purple-400 font-medium">· {s.total_sessions}×</span>
    </span>
  );
}

/** Pill shown when a booking's phone has no prior session on record
 *  (any source) — every row in this table already comes from the
 *  public site's own booking form, so there's no vendor-lead case to
 *  exclude here (unlike the session form, which also sees Woofly/Paw
 *  Space/etc. bookings and gates the pill on source there). */
function NewBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
      <Sparkles size={9}/>
      New
    </span>
  );
}

function BookingCard({
  b,
  summary,
  onConvert,
}: {
  b: Booking;
  summary: CustomerSummary | null;
  onConvert: (b: Booking) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all ${
      b.is_converted ? 'opacity-75' : ''
    }`} style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}>

      {/* Converted stamp */}
      {b.is_converted && (
        <div className="absolute top-5 right-[-28px] rotate-[30deg] border-2 border-green-500 rounded px-8 py-0.5 text-green-600 text-[11px] font-bold uppercase tracking-widest opacity-50 pointer-events-none">
          Converted
        </div>
      )}

      {/* Top row */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-extrabold text-gray-900">{b.name}</span>
            {b.is_converted ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                <CheckCircle2 size={10}/> Converted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                <Clock size={10}/> Pending
              </span>
            )}
            {summary ? <ReturningBadge s={summary}/> : !b.customer_id && <NewBadge/>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {b.pet_type === 'dog' ? '🐶' : '🐱'} {b.pet_name ? `${b.pet_name} · ` : ''}{b.breed} · {b.city}
          </p>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 transition"
        >
          {expanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
        </button>
      </div>

      {/* Summary row */}
      <div className="flex items-center gap-3 px-4 pb-3">
        <a
          href={`tel:${b.phone}`}
          className="flex items-center gap-1 text-xs text-sniffy-purple font-semibold"
          onClick={e => e.stopPropagation()}
        >
          <Phone size={11}/>{b.phone}
        </a>
        <span className="text-gray-300">·</span>
        <span className="text-xs text-gray-500">{b.package}</span>
        <span className="text-gray-300">·</span>
        <span className="text-xs text-gray-400">{fmtDate(b.created_at)}</span>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1 border-t border-gray-50 pt-3">
              <Row label="Age" value={`${b.age} yr${b.age !== 1 ? 's' : ''}`}/>
              {b.location && <Row label="Location" value={b.location}/>}
              {b.medical && <Row label="Medical" value={b.medical}/>}
              <Row label="Booked at" value={`${fmtDate(b.created_at)} ${fmtTime(b.created_at)}`}/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center justify-between gap-2">

        {/* Left: Call + WhatsApp — matching FollowUpsTab pill style */}
        <div className="flex items-center gap-2">
          <a
            href={`tel:${b.phone}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-700 bg-white border border-gray-200 transition-all active:scale-95"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <Phone size={12}/> Call
          </a>
          <a
            href={`https://wa.me/91${b.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', boxShadow: '0 2px 6px rgba(37,211,102,0.35)' }}
          >
            <MessageCircle size={12}/> WhatsApp
          </a>
        </div>

        {/* Right: Convert — purple gradient same size */}
        {!b.is_converted && (
          <button
            onClick={() => onConvert(b)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #451a8b 100%)', boxShadow: '0 2px 6px rgba(69,26,139,0.35)' }}
          >
            <ArrowRightCircle size={12}/> Convert
          </button>
        )}

      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-gray-400 w-20 shrink-0">{label}</span>
      <span className="text-gray-700 font-medium">{value}</span>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────

export default function BookingsTab() {
  const [bookings, setBookings]         = useState<Booking[]>([]);
  const [summaries, setSummaries]       = useState<Record<string, CustomerSummary>>({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState<'all' | 'pending' | 'converted' | 'returning'>('all');
  const [converting, setConverting]     = useState<Booking | null>(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [prefill, setPrefill]           = useState<Partial<GroomingSession> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbError) {
        console.error('[BookingsTab] Supabase error:', sbError);
        setError(`${sbError.message} (code: ${sbError.code})`);
        setBookings([]);
        return;
      }

      const rows = (data ?? []) as Booking[];
      setBookings(rows);

      // Phase 1 — fetch customer summaries for the returning-customer
      // pill.  Only fetches IDs we have on the page, so this stays
      // O(distinct customers) regardless of booking count.  Failures
      // here are non-fatal: the page still renders without pills.
      const customerIds = Array.from(
        new Set(rows.map(r => r.customer_id).filter((v): v is string => !!v))
      );
      if (customerIds.length > 0) {
        const { data: cData, error: cErr } = await supabase
          .from('customers')
          .select('id,name,total_sessions,last_session_at,is_vip,lifecycle_stage')
          .in('id', customerIds);
        if (cErr) {
          console.warn('[BookingsTab] customer summary fetch failed, pills hidden:', cErr);
          setSummaries({});
        } else {
          const map: Record<string, CustomerSummary> = {};
          for (const c of (cData ?? []) as CustomerSummary[]) {
            map[c.id] = c;
          }
          setSummaries(map);
        }
      } else {
        setSummaries({});
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[BookingsTab] Unexpected error:', err);
      setError(msg);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openConvert(b: Booking) {
    // BookingWizard stores service labels like "Cat Grooming" (not the bare
    // 'cat'/'dog' enum SessionFormModal expects) — match loosely so cat
    // bookings don't silently fall through to the 'dog' default.
    const isCat = /cat/i.test(b.pet_type ?? '');
    const petType: 'dog' | 'cat' = isCat ? 'cat' : 'dog';
    const breedList = isCat ? CAT_BREEDS : DOG_BREEDS;
    const breedMatch = breedList.find(
      opt => opt.toLowerCase() === (b.breed ?? '').trim().toLowerCase()
    );

    // A GPS-captured location is a Google Maps URL — it belongs in
    // gps_location, not the free-text Address / Area field. A locality
    // picked from the dropdown is plain text and keeps going to address.
    // Quick-book bookings store "<written address>\n<maps url>" in the one
    // location column, so pull any URL out and keep the remaining text.
    const locUrl = (b.location ?? '').match(/https?:\/\/\S+/i)?.[0] ?? '';
    const locText = locUrl ? (b.location ?? '').replace(locUrl, '').trim() : (b.location ?? '');
    const isGpsLink = !!locUrl;

    const mapped: Partial<GroomingSession> = {
      pet_parent_name: b.name,
      phone:           b.phone,
      pet_type:        petType,
      pet_name:        b.pet_name ?? '',
      breed:           breedMatch ?? b.breed ?? '',
      pet_age:         ageLabel(b.age),
      pet_vaccinated:  b.pet_vaccinated,
      medical_issues:  b.medical ?? '',
      package:         b.package,
      address:         isGpsLink ? (locText || (b.city ?? '')) : (b.location ?? b.city ?? ''),
      gps_location:    isGpsLink ? locUrl : '',
      source_type:     'internal',
      source:          'website_booking',
      status:          'lead',
      is_converted:    false,
    };
    setConverting(b);
    setPrefill(mapped);
    setModalOpen(true);
  }

  async function handleSaved() {
    if (converting) {
      await supabase
        .from('bookings')
        .update({ is_converted: true })
        .eq('id', converting.id);
    }
    setConverting(null);
    setPrefill(null);
    load();
  }

  function handleClose() {
    setModalOpen(false);
    setConverting(null);
    setPrefill(null);
  }

  const filtered = bookings.filter(b => {
    const matchFilter =
      filter === 'all'       ? true :
      filter === 'pending'   ? !b.is_converted :
      filter === 'returning' ? !!b.customer_id :
      b.is_converted;

    const q = search.toLowerCase();
    const matchSearch = !q || [b.name, b.phone, b.breed, b.city, b.package]
      .some(v => v?.toLowerCase().includes(q));

    return matchFilter && matchSearch;
  });

  const pendingCount   = bookings.filter(b => !b.is_converted).length;
  const convertedCount = bookings.filter(b => b.is_converted).length;
  const returningCount = bookings.filter(b => !!b.customer_id).length;

  return (
    <div className="space-y-4">

      {/* Phase 6b — pending portal-submitted reschedule / cancel
          requests.  Self-loads; renders nothing when empty.  When a
          request is approved/declined the underlying booking/session
          may have been mutated, so we refetch this tab's data too. */}
      <ChangeRequestsSection onRequestResolved={load}/>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">Website Enquiries</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {pendingCount} pending · {convertedCount} converted
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-sniffy-purple transition font-semibold"
        >
          <RefreshCw size={13}/> Refresh
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500"/>
          <div className="flex-1 min-w-0">
            <p className="font-bold">Failed to load bookings</p>
            <p className="text-xs mt-0.5 text-red-500 break-all">{error}</p>
            <p className="text-xs mt-2 text-red-400">
              If this says <strong>permission denied</strong> or <strong>42501</strong>, you need to add
              a Row Level Security policy for this table in your Supabase dashboard
              (Table Editor → bookings → RLS → Add policy → Enable read for authenticated users).
            </p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X size={14}/>
          </button>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'returning', 'converted'] as const).map(f => {
          const count = f === 'pending' ? pendingCount : f === 'returning' ? returningCount : f === 'converted' ? convertedCount : 0;
          const pillColor = f === 'returning' ? 'bg-purple-100 text-sniffy-purple' : 'bg-amber-100 text-amber-700';
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all border ${
                filter === f
                  ? 'bg-sniffy-purple text-white border-sniffy-purple'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-sniffy-purple/40'
              }`}
            >
              {f}
              {f !== 'all' && count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  filter === f ? 'bg-white/20' : pillColor
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, phone, breed, city…"
          className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sniffy-purple focus:ring-1 focus:ring-sniffy-purple/20 transition"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14}/>
          </button>
        )}
      </div>

      {/* ── Mobile cards ── */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse"/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm font-semibold">No bookings found</p>
          </div>
        ) : (
          filtered.map(b => (
            <BookingCard
              key={b.id}
              b={b}
              summary={b.customer_id ? summaries[b.customer_id] ?? null : null}
              onConvert={openConvert}
            />
          ))
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Pet</th>
              <th className="px-4 py-3 text-left">Package</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse"/>
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                  No bookings found
                </td>
              </tr>
            ) : (
              filtered.map(b => {
                const summary = b.customer_id ? summaries[b.customer_id] ?? null : null;
                return (
                <tr key={b.id} className={`hover:bg-gray-50/60 transition ${b.is_converted ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{b.name}</span>
                      {summary ? <ReturningBadge s={summary}/> : !b.customer_id && <NewBadge/>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`tel:${b.phone}`} className="text-sniffy-purple font-semibold hover:underline">
                      {b.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {b.pet_type === 'dog' ? '🐶' : '🐱'} {b.pet_name ? `${b.pet_name} · ` : ''}{b.breed}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.package}</td>
                  <td className="px-4 py-3 text-gray-500">{b.location ?? b.city}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {fmtDate(b.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {b.is_converted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5">
                        <CheckCircle2 size={10}/> Converted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5">
                        <Clock size={10}/> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!b.is_converted && (
                      <button
                        onClick={() => openConvert(b)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-400/80 text-white text-xs font-bold hover:bg-purple-500/80 active:bg-purple-600/80 transition whitespace-nowrap"
                      >
                        <ArrowRightCircle size={12}/>
                        Convert
                      </button>
                    )}
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Session form modal — pre-filled from booking (lazy) */}
      {modalOpen && (
        <Suspense fallback={null}>
          <SessionFormModal
            open={modalOpen}
            onClose={handleClose}
            onSaved={handleSaved}
            prefill={prefill}
          />
        </Suspense>
      )}
    </div>
  );
}
