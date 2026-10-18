/**
 * admin/FollowUpsTab.tsx
 * Shows customers whose next_due_date is overdue or within the next 30 days.
 * Colour-coded urgency bands + call / WhatsApp quick actions.
 */

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, CheckCircle2, AlertTriangle, Clock, Calendar, Crown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GroomingSession, fmtDate, daysUntil } from './types';
// Phase 2b — filter follow-ups by customer lifecycle (Active / Lapsed /
// Churned / VIP).  These come from the customers table, joined in by
// customer_id which was wired in Phase 1.
import { LifecycleStage, LIFECYCLE_LABELS, LIFECYCLE_COLORS } from './customerTypes';

// ─── Urgency helpers ──────────────────────────────────────────

type UrgencyBand = 'overdue' | 'urgent' | 'upcoming' | 'scheduled';

function getUrgency(nextDue: string): UrgencyBand {
  const days = daysUntil(nextDue);
  if (days < 0)   return 'overdue';
  if (days <= 3)  return 'urgent';
  if (days <= 14) return 'upcoming';
  return 'scheduled';
}

const URGENCY_CONFIG: Record<UrgencyBand, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
}> = {
  overdue:   { label: 'Overdue',       color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',   icon: AlertTriangle },
  urgent:    { label: 'Due Soon',      color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: Clock },
  upcoming:  { label: 'Coming Up',     color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Calendar },
  scheduled: { label: 'Scheduled',     color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  icon: CheckCircle2 },
};

// ─── Follow-up card ───────────────────────────────────────────

/** Phase 2b — minimal lifecycle data the card needs to render its
 *  badge.  Filled in by the parent from a customers table fetch
 *  keyed on the session's customer_id. */
interface LifecycleInfo {
  stage: LifecycleStage;
  is_vip: boolean;
}

function FollowUpCard({ session, lifecycle }: { session: GroomingSession; lifecycle: LifecycleInfo | null }) {
  const days    = daysUntil(session.next_due_date!);
  const urgency = getUrgency(session.next_due_date!);
  const cfg     = URGENCY_CONFIG[urgency];
  const Icon    = cfg.icon;
  const lcColors = lifecycle ? LIFECYCLE_COLORS[lifecycle.stage] : null;

  const waMsg = encodeURIComponent(
    `Hi ${session.pet_parent_name}! 🐾 It's been a while since ${session.pet_type === 'dog' ? session.breed ?? 'your dog' : session.breed ?? 'your cat'}'s last grooming session with Sniffy. Would you like to book one? 😊`
  );

  const phone = (session.phone ?? '').replace(/\D/g, '');
  const dialCode = phone.startsWith('91') ? phone : `91${phone}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border border-gray-100 overflow-hidden flex`}
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
    >
      {/* Left: urgency badge column */}
      <div className={`shrink-0 flex flex-col items-center justify-center w-16 ${cfg.bg} ${cfg.color} py-4`}>
        <Icon size={18} />
        <span className="text-[11px] font-bold mt-1">
          {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? 'Today' : `${days}d`}
        </span>
      </div>

      {/* Right: all info + actions */}
      <div className="flex-1 min-w-0 px-3.5 py-3">

        {/* Row 1: name + status badge */}
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="font-extrabold text-gray-900 text-[15px] leading-tight">{session.pet_parent_name}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
          {lifecycle && lcColors && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lcColors.bg} ${lcColors.text} ${lcColors.border}`}>
              {LIFECYCLE_LABELS[lifecycle.stage]}
            </span>
          )}
          {lifecycle?.is_vip && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Crown size={9}/> VIP
            </span>
          )}
          {session.is_converted && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              Converted
            </span>
          )}
        </div>

        {/* Row 2: breed · last session · due */}
        <p className="text-xs text-gray-500 leading-snug">
          {session.pet_type === 'dog' ? '🐶' : '🐱'}{' '}
          {session.breed ?? 'Unknown breed'} &nbsp;·&nbsp;
          Last: {fmtDate(session.session_date)} &nbsp;·&nbsp;
          Due: {fmtDate(session.next_due_date!)}
        </p>

        {/* Row 3: groomer */}
        {session.groomer_name && (
          <p className="text-[11px] text-gray-400 mt-0.5">
            Last groomer: {session.groomer_name}{session.groomer_phone && ` (${session.groomer_phone})`}
          </p>
        )}

        {/* Row 4: medical */}
        {session.medical_issues && (
          <p className="text-[11px] text-orange-600 mt-0.5 font-medium">⚕️ {session.medical_issues}</p>
        )}

        {/* Row 5: action buttons — right-aligned, matching sessions tab style */}
        {session.phone && (
          <div className="flex items-center justify-end gap-2 mt-2.5">
            <a
              href={`tel:${session.phone}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-700 bg-white border border-gray-200 transition-all active:scale-95"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <Phone size={12}/> Call
            </a>
            <a
              href={`https://wa.me/${dialCode}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', boxShadow: '0 2px 6px rgba(37,211,102,0.35)' }}
            >
              <MessageCircle size={12}/> WhatsApp
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────

type LifecycleFilter = 'all' | LifecycleStage | 'vip';

export default function FollowUpsTab({ canDelete: _canDelete = true, canWrite: _canWrite = true }: { canDelete?: boolean; canWrite?: boolean }) {
  const [sessions, setSessions]   = useState<GroomingSession[]>([]);
  const [loading, setLoading]     = useState(true);
  const [windowDays, setWindowDays] = useState(30);
  // Phase 2b — map of customer_id → lifecycle+vip, fetched once per
  // session load (one query in a single `.in(...)`).  Falls back to
  // null entries if the lookup fails so cards still render.
  const [lifecycleMap, setLifecycleMap] = useState<Record<string, LifecycleInfo>>({});
  const [lcFilter, setLcFilter] = useState<LifecycleFilter>('all');

  useEffect(() => {
    const today     = new Date();
    const future    = new Date();
    future.setDate(today.getDate() + windowDays);

    const futureStr = future.toISOString().slice(0, 10);

    (async () => {
      const { data, error } = await supabase
        .from('grooming_sessions')
        .select('*')
        // Both delivered states — a groomed session is due for a repeat
        // on the same cadence whether or not its payment has settled.
        .in('status', ['completed', 'grooming_done'])
        .not('next_due_date', 'is', null)
        .lte('next_due_date', futureStr)
        .order('next_due_date', { ascending: true });
      if (error) {
        console.warn('[FollowUpsTab] session fetch failed:', error);
        setSessions([]);
        setLoading(false);
        return;
      }
      const rows = (data ?? []) as GroomingSession[];
      setSessions(rows);

      // Phase 2b — pull lifecycle for any customers represented in the
      // result set, in one query.  Skipped when there are no
      // customer_ids (e.g. legacy rows without a phone).  Failures are
      // non-fatal — cards just don't show the lifecycle badge.
      const ids = Array.from(new Set(rows.map(r => r.customer_id).filter((v): v is string => !!v)));
      if (ids.length === 0) {
        setLifecycleMap({});
      } else {
        const { data: cData, error: cErr } = await supabase
          .from('customers')
          .select('id, lifecycle_stage, is_vip')
          .in('id', ids);
        if (cErr) {
          console.warn('[FollowUpsTab] customer lifecycle fetch failed:', cErr);
          setLifecycleMap({});
        } else {
          const map: Record<string, LifecycleInfo> = {};
          for (const c of (cData ?? []) as { id: string; lifecycle_stage: LifecycleStage; is_vip: boolean }[]) {
            map[c.id] = { stage: c.lifecycle_stage, is_vip: c.is_vip };
          }
          setLifecycleMap(map);
        }
      }
      setLoading(false);
    })();
  }, [windowDays]);

  // Phase 2b — apply lifecycle / VIP filter before urgency-bucketing
  // so the bucket counts honour the filter too.
  const filteredSessions = useMemo(() => {
    if (lcFilter === 'all') return sessions;
    return sessions.filter(s => {
      if (!s.customer_id) return false;
      const lc = lifecycleMap[s.customer_id];
      if (!lc) return false;
      if (lcFilter === 'vip') return lc.is_vip;
      return lc.stage === lcFilter;
    });
  }, [sessions, lifecycleMap, lcFilter]);

  const overdue  = filteredSessions.filter(s => getUrgency(s.next_due_date!) === 'overdue');
  const urgent   = filteredSessions.filter(s => getUrgency(s.next_due_date!) === 'urgent');
  const upcoming = filteredSessions.filter(s => getUrgency(s.next_due_date!) === 'upcoming');
  const scheduled= filteredSessions.filter(s => getUrgency(s.next_due_date!) === 'scheduled');

  // Counts for filter-pill badges — derived BEFORE applying lcFilter
  // so the "click to switch filter" pills show the universe size, not
  // the filtered subset.
  const lcCounts = useMemo(() => {
    const c = { all: sessions.length, new: 0, active: 0, lapsed: 0, churned: 0, vip: 0 };
    for (const s of sessions) {
      if (!s.customer_id) continue;
      const lc = lifecycleMap[s.customer_id];
      if (!lc) continue;
      c[lc.stage]++;
      if (lc.is_vip) c.vip++;
    }
    return c;
  }, [sessions, lifecycleMap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Follow-up Queue</h2>
            <p className="text-xs text-gray-400 mt-0.5">Customers whose next session is due or overdue</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Show next</span>
            <select
              value={windowDays}
              onChange={e => { setWindowDays(Number(e.target.value)); setLoading(true); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-sniffy-purple"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
            </select>
          </div>
        </div>

        {/* Summary pills */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {[
            { label: 'Overdue',    count: overdue.length,   color: 'bg-red-100 text-red-700' },
            { label: 'Due Soon',   count: urgent.length,    color: 'bg-orange-100 text-orange-700' },
            { label: 'Coming Up',  count: upcoming.length,  color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Scheduled',  count: scheduled.length, color: 'bg-green-100 text-green-700' },
          ].map(p => (
            <span key={p.label} className={`px-3 py-1 rounded-full text-xs font-bold ${p.color}`}>
              {p.label}: {p.count}
            </span>
          ))}
        </div>

        {/* Phase 2b — lifecycle / VIP filter pills.  Switches the
            urgency buckets below to only the customers in that stage. */}
        <div className="mt-3 flex gap-2 flex-wrap">
          {([
            { key: 'all',     label: 'All',     count: lcCounts.all },
            { key: 'lapsed',  label: 'Lapsed',  count: lcCounts.lapsed },
            { key: 'churned', label: 'Churned', count: lcCounts.churned },
            { key: 'active',  label: 'Active',  count: lcCounts.active },
            { key: 'new',     label: 'New',     count: lcCounts.new },
            { key: 'vip',     label: 'VIP',     count: lcCounts.vip },
          ] as { key: LifecycleFilter; label: string; count: number }[]).map(p => {
            const isActive = lcFilter === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setLcFilter(p.key)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-sniffy-purple text-white border-sniffy-purple'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-sniffy-purple/40'
                }`}
              >
                {p.key === 'vip' && '👑 '}
                {p.label}
                {p.count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                  }`}>{p.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-gray-500 font-medium">No follow-ups due in the next {windowDays} days.</p>
        </div>
      ) : (
        <>
          {/* Overdue */}
          {overdue.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                <AlertTriangle size={14} /> Overdue ({overdue.length})
              </h3>
              <div className="space-y-3">
                {overdue.map(s => <FollowUpCard key={s.id} session={s} lifecycle={s.customer_id ? lifecycleMap[s.customer_id] ?? null : null}/>)}
              </div>
            </section>
          )}

          {/* Urgent */}
          {urgent.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2">
                <Clock size={14} /> Due in 3 days ({urgent.length})
              </h3>
              <div className="space-y-3">
                {urgent.map(s => <FollowUpCard key={s.id} session={s} lifecycle={s.customer_id ? lifecycleMap[s.customer_id] ?? null : null}/>)}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-yellow-700 mb-3 flex items-center gap-2">
                <Calendar size={14} /> Coming up — next 14 days ({upcoming.length})
              </h3>
              <div className="space-y-3">
                {upcoming.map(s => <FollowUpCard key={s.id} session={s} lifecycle={s.customer_id ? lifecycleMap[s.customer_id] ?? null : null}/>)}
              </div>
            </section>
          )}

          {/* Scheduled */}
          {scheduled.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle2 size={14} /> Later this window ({scheduled.length})
              </h3>
              <div className="space-y-3">
                {scheduled.map(s => <FollowUpCard key={s.id} session={s} lifecycle={s.customer_id ? lifecycleMap[s.customer_id] ?? null : null}/>)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
