/**
 * portal/CustomerPortalDashboard.tsx — Phase 4 (Redesigned)
 *
 * Home tab — full-scale premium design.  Shows:
 *   • Greeting hero (purple gradient, embedded stats: LTV / sessions / next due)
 *   • Next-due banner when a session is due in the future
 *   • Featured "Book" CTA + smaller "Manage pets" CTA
 *   • Pet roster as pastel cards (rotating background tints)
 *   • Recent grooming list with package-coloured pills and status badges
 *   • Friendly empty states when the customer has no pets / no sessions yet
 *
 * All queries are RLS-scoped *and* explicitly filtered by customer_id
 * (defence in depth — see comment inside the loader).
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarPlus, Scissors, PawPrint, ChevronRight, Sparkles,
  Heart, Clock, Plus, Award, TrendingUp, Star, Zap,
  Gift, Copy, Share2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  Customer, Pet, LIFECYCLE_LABELS, petDisplayAge,
  ReferralBalance, buildReferralShareUrl,
} from '../admin/customerTypes';
import type { PortalTabId } from './CustomerPortalShell';

interface RecentSession {
  id: string;
  session_date: string;
  pet_type: 'dog' | 'cat';
  breed: string | null;
  package: string | null;
  status: string;
  next_due_date: string | null;
}

// ─── Formatters ─────────────────────────────────────────────────────

function fmtMoney(n: number | null | undefined): string {
  if (!n) return '₹0';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function fmtFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short',
  });
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5)  return 'Hello';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Hello';
}

function daysFromToday(iso: string): number {
  const ms = new Date(iso).getTime() - new Date(new Date().toDateString()).getTime();
  return Math.ceil(ms / (24 * 3600 * 1000));
}

const PET_TINTS: Array<{ bg: string; ring: string; accent: string; emoji: string }> = [
  { bg: 'from-amber-50 to-orange-50',    ring: 'ring-amber-200',  accent: 'text-amber-700',   emoji: '🐶' },
  { bg: 'from-purple-50 to-violet-50',   ring: 'ring-purple-200', accent: 'text-purple-700',  emoji: '🐱' },
  { bg: 'from-emerald-50 to-teal-50',    ring: 'ring-emerald-200',accent: 'text-emerald-700', emoji: '🐶' },
  { bg: 'from-rose-50 to-pink-50',       ring: 'ring-rose-200',   accent: 'text-rose-700',    emoji: '🐱' },
  { bg: 'from-blue-50 to-indigo-50',     ring: 'ring-blue-200',   accent: 'text-blue-700',    emoji: '🐶' },
];

function packagePillClass(pkg: string | null | undefined): string {
  if (!pkg) return 'bg-gray-50 text-gray-600 border-gray-200';
  const p = pkg.toLowerCase();
  if (p.includes('spa') && p.includes('hair'))
    return 'bg-purple-50 text-sniffy-purple border-purple-200';
  if (p.includes('spa'))  return 'bg-blue-50 text-blue-700 border-blue-200';
  if (p.includes('hair')) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-purple-50 text-sniffy-purple border-purple-200';
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as any },
});

// ─── Main component ─────────────────────────────────────────────────

export default function CustomerPortalDashboard({
  customer, onNavigate,
}: {
  customer: Customer;
  onCustomerChanged: () => void;
  onNavigate: (tab: PortalTabId) => void;
}) {
  const [pets, setPets]         = useState<Pet[]>([]);
  const [sessions, setSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading]   = useState(true);
  // Phase 5 — referral summary.  Loaded alongside pets/sessions so the
  // referral card has data on first paint.  Null while loading (or
  // when the migration hasn't been applied yet — we then hide the card).
  const [referral, setReferral] = useState<ReferralBalance | null>(null);
  const [refCopyFlash, setRefCopyFlash] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [petsRes, sessionsRes, refRes] = await Promise.all([
        supabase.from('pets')
          .select('*')
          .eq('customer_id', customer.id)
          .eq('is_active', true)
          .order('created_at'),
        supabase.from('grooming_sessions')
          .select('id, session_date, pet_type, breed, package, status, next_due_date')
          .eq('customer_id', customer.id)
          .order('session_date', { ascending: false })
          .limit(3),
        supabase.from('customer_referral_balance')
          .select('customer_id, balance, lifetime_earned, lifetime_redeemed, earn_count, redeem_count')
          .eq('customer_id', customer.id)
          .maybeSingle(),
      ]);
      setPets((petsRes.data ?? []) as Pet[]);
      setSessions((sessionsRes.data ?? []) as RecentSession[]);
      if (refRes.error) {
        // View not yet present — silently swallow so the dashboard
        // still renders for environments without the Phase 5 migration.
        console.warn('[CustomerPortalDashboard] referral fetch failed:', refRes.error);
        setReferral(null);
      } else {
        setReferral(
          (refRes.data as ReferralBalance | null) ?? {
            customer_id: customer.id, balance: 0, lifetime_earned: 0,
            lifetime_redeemed: 0, earn_count: 0, redeem_count: 0,
          },
        );
      }
      setLoading(false);
    })();
  }, [customer.id]);

  async function copyCode() {
    if (!customer.referral_code) return;
    try { await navigator.clipboard.writeText(customer.referral_code); } catch { /* ignore */ }
    setRefCopyFlash(true);
    setTimeout(() => setRefCopyFlash(false), 1200);
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcomingDue = useMemo(() =>
    sessions
      .filter(s => s.next_due_date && s.next_due_date >= today)
      .sort((a, b) => (a.next_due_date ?? '').localeCompare(b.next_due_date ?? ''))[0],
    [sessions, today],
  );
  const dueInDays = upcomingDue ? daysFromToday(upcomingDue.next_due_date!) : null;
  const firstName = (customer.name || '').split(' ')[0] || 'there';
  const totalSpent = customer.sniffy_collected_total + customer.vendor_prepaid_total;

  return (
    <div className="space-y-5 pb-8">

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-[28px]"
        style={{
          background: 'linear-gradient(145deg, #6d28d9 0%, #451a8b 45%, #2d0f72 100%)',
          boxShadow: '0 20px 60px rgba(69,26,139,0.35)',
        }}
      >
        {/* Layered decorative blobs */}
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-violet-400/20 rounded-full blur-3xl pointer-events-none"/>
        <div className="absolute top-8 -left-6 w-36 h-36 bg-sniffy-yellow/15 rounded-full blur-2xl pointer-events-none"/>
        <div className="absolute -bottom-10 right-8 w-40 h-40 bg-purple-300/10 rounded-full blur-3xl pointer-events-none"/>

        {/* Subtle dot pattern overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        {/* Giant ghost paw */}
        <PawPrint size={200} strokeWidth={1}
          className="absolute -right-8 -bottom-10 text-white/[0.05] rotate-12 pointer-events-none"
        />

        <div className="relative p-5 sm:p-6 pt-6">
          {/* Top row: greeting + VIP badge */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">{greeting()}</p>
              <h2 className="text-[26px] sm:text-3xl font-black mt-0.5 leading-tight text-white">
                {firstName} <span className="inline-block">👋</span>
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-white/70">
                <Award size={11} strokeWidth={2.5}/>
                <span>{LIFECYCLE_LABELS[customer.lifecycle_stage]} member</span>
                {customer.total_sessions > 0 && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>{customer.total_sessions} session{customer.total_sessions !== 1 ? 's' : ''}</span>
                  </>
                )}
              </div>
            </div>
            {customer.is_vip && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                className="flex items-center gap-1 text-[10px] font-black bg-sniffy-yellow text-amber-900 rounded-full px-3 py-1.5 shrink-0 shadow-lg shadow-amber-500/30"
              >
                <Sparkles size={10}/> VIP
              </motion.span>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            <HeroStat Icon={TrendingUp} label="Total spent" value={fmtMoney(totalSpent)} />
            <HeroStat Icon={Scissors}   label="Groomings"   value={String(customer.total_sessions ?? 0)} />
            <HeroStat
              Icon={Clock}
              label="Next due"
              value={
                dueInDays == null ? '—'
                : dueInDays <= 0  ? 'Today!'
                : dueInDays === 1 ? '1 day'
                : `${dueInDays}d`
              }
              highlight={dueInDays != null && dueInDays <= 7}
            />
          </div>
        </div>
      </motion.div>

      {/* ─── NEXT-DUE ALERT ────────────────────────────────────────── */}
      {upcomingDue && (
        <motion.button {...fadeUp(0.08)}
          onClick={() => onNavigate('book')}
          className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl border border-amber-200 transition active:scale-[0.99] text-left overflow-hidden relative"
          style={{
            background: 'linear-gradient(120deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)',
            boxShadow: '0 4px 20px rgba(246,172,10,0.18)',
          }}
        >
          <div className="absolute -right-3 -top-3 w-20 h-20 bg-sniffy-yellow/20 rounded-full blur-xl pointer-events-none"/>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-sniffy-yellow flex items-center justify-center shrink-0 shadow-md shadow-amber-300/40">
              <Clock size={20} className="text-amber-900" strokeWidth={2.5}/>
            </div>
            <div className="text-left min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-700">Grooming due</p>
              <p className="text-sm font-extrabold text-gray-900 mt-0.5 truncate">
                {fmtFullDate(upcomingDue.next_due_date!)}
              </p>
              <p className="text-[11px] text-amber-700 font-bold mt-px">
                {dueInDays! <= 0 ? 'Due today!' : dueInDays === 1 ? 'Due tomorrow' : `In ${dueInDays} days`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-[11px] font-black text-white bg-sniffy-purple shrink-0 shadow-md shadow-purple-900/20">
            Book <ChevronRight size={11}/>
          </div>
        </motion.button>
      )}

      {/* ─── QUICK ACTION CARDS ────────────────────────────────────── */}
      <motion.div {...fadeUp(0.1)} className="grid grid-cols-5 gap-3">
        {/* Book session — big card */}
        <button
          onClick={() => onNavigate('book')}
          className="col-span-3 relative overflow-hidden text-left p-5 rounded-[22px] text-white transition active:scale-[0.97]"
          style={{
            background: 'linear-gradient(140deg, #7c3aed 0%, #451a8b 100%)',
            boxShadow: '0 12px 32px rgba(69,26,139,0.30)',
          }}
        >
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <PawPrint size={100} strokeWidth={1.5}/>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"/>
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-3">
              <CalendarPlus size={19} strokeWidth={2.2}/>
            </div>
            <p className="text-[15px] font-black leading-tight">Book a session</p>
            <p className="text-[11px] opacity-75 mt-0.5">Home grooming at your door</p>
            <div className="inline-flex items-center gap-0.5 text-[10px] font-bold mt-3 bg-white/20 rounded-full px-2.5 py-1">
              Get started <ChevronRight size={10}/>
            </div>
          </div>
        </button>

        {/* Pets — small card */}
        <button
          onClick={() => onNavigate('pets')}
          className="col-span-2 relative overflow-hidden text-left p-4 rounded-[22px] bg-white border border-gray-100 transition active:scale-[0.97]"
          style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
        >
          <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 pointer-events-none select-none">🐾</div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-sniffy-purple flex items-center justify-center mb-3">
            <Heart size={17} strokeWidth={2.2} fill="currentColor"/>
          </div>
          <p className="text-[13px] font-black text-gray-900">Your Pets</p>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
            {loading ? '…' : `${pets.length} on file`}
          </p>
        </button>
      </motion.div>

      {/* ─── PET ROSTER ───────────────────────────────────────────── */}
      <motion.section {...fadeUp(0.15)}>
        <SectionHeader
          label="Your Pets"
          Icon={PawPrint}
          cta={pets.length > 0 ? { label: 'Manage', onClick: () => onNavigate('pets') } : undefined}
        />

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"/>
            ))}
          </div>
        ) : pets.length === 0 ? (
          <EmptyState
            Icon={PawPrint}
            title="No pets yet"
            subtitle="Add your first pet so we know who to groom."
            ctaLabel="Add a pet"
            onClick={() => onNavigate('pets')}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {pets.slice(0, 4).map((p, idx) => (
              <PetCard key={p.id} pet={p} tintIndex={idx} />
            ))}
            {pets.length < 4 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('pets')}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-purple-200 text-sniffy-purple/50 hover:border-sniffy-purple/60 hover:text-sniffy-purple transition"
              >
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                  <Plus size={16}/>
                </div>
                <span className="text-[11px] font-bold">Add pet</span>
              </motion.button>
            )}
          </div>
        )}
      </motion.section>

      {/* ─── RECENT GROOMING ─────────────────────────────────────── */}
      <motion.section {...fadeUp(0.2)}>
        <SectionHeader
          label="Recent Groomings"
          Icon={Scissors}
          cta={sessions.length > 0 ? { label: 'View all', onClick: () => onNavigate('sessions') } : undefined}
        />

        {loading ? (
          <div className="space-y-2.5">
            {[1,2].map(i => <div key={i} className="h-[72px] bg-gray-100 rounded-2xl animate-pulse"/>)}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            Icon={Scissors}
            title="No groomings yet"
            subtitle="Book your first session — your groomer comes to you."
            ctaLabel="Book now"
            onClick={() => onNavigate('book')}
          />
        ) : (
          <div className="space-y-2.5">
            {sessions.map((s, i) => (
              <SessionRow key={s.id} s={s} index={i} />
            ))}
          </div>
        )}
      </motion.section>

      {/* ─── REFERRAL CARD ──────────────────────────────────────── */}
      {customer.referral_code && (
        <motion.div {...fadeUp(0.22)}
          className="relative overflow-hidden rounded-[22px] p-4"
          style={{
            background: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 50%, #fae8ff 100%)',
            border: '1px solid #ddd6fe',
          }}
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-sniffy-purple/15 rounded-full blur-2xl pointer-events-none"/>
          <div className="absolute right-3 bottom-2 opacity-10 pointer-events-none">
            <Gift size={56} className="text-sniffy-purple"/>
          </div>
          <div className="relative flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white shadow-sm text-sniffy-purple flex items-center justify-center shrink-0">
              <Gift size={20} strokeWidth={2.2}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-sniffy-purple/70">Refer & earn</p>
              <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                Share Sniffy with a friend — both of you get ₹200 in credit when they book.
              </p>

              {/* Code chip + copy */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <code className="text-base font-extrabold tracking-[0.2em] text-sniffy-purple bg-white border border-purple-200 rounded-lg px-3 py-1.5 select-all">
                  {customer.referral_code}
                </code>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-sniffy-purple bg-white border border-purple-200 hover:bg-purple-100 transition"
                >
                  <Copy size={11}/> {refCopyFlash ? 'Copied ✓' : 'Copy code'}
                </button>
                <a
                  href={buildReferralShareUrl(customer.referral_code, customer.name)}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white transition active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
                >
                  <Share2 size={11}/> WhatsApp
                </a>
              </div>

              {/* Balance row — only show when there's something to show. */}
              {referral && (referral.balance > 0 || referral.lifetime_earned > 0) && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl px-2.5 py-2 border border-white/60">
                    <p className="text-[9px] font-black uppercase tracking-wider text-sniffy-purple/70">Your balance</p>
                    <p className="text-[15px] font-extrabold text-sniffy-purple mt-0.5">
                      ₹{Math.round(referral.balance).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl px-2.5 py-2 border border-white/60">
                    <p className="text-[9px] font-black uppercase tracking-wider text-sniffy-purple/70">Friends joined</p>
                    <p className="text-[15px] font-extrabold text-sniffy-purple mt-0.5">
                      {referral.earn_count}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── LOYALTY STRIP ──────────────────────────────────────── */}
      {customer.total_sessions >= 1 && (
        <motion.div {...fadeUp(0.25)}
          className="relative overflow-hidden rounded-[22px] p-4 flex items-center gap-4"
          style={{
            background: 'linear-gradient(120deg, #fef9ee 0%, #fdf4d3 100%)',
            border: '1px solid #fde68a',
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-sniffy-yellow/30 flex items-center justify-center shrink-0">
            <Star size={22} className="text-amber-600" fill="currentColor"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wider text-amber-700">Loyalty</p>
            <p className="text-sm font-extrabold text-gray-900 mt-px">
              {customer.total_sessions} grooming{customer.total_sessions !== 1 ? 's' : ''} completed
            </p>
            <div className="mt-2 h-2 rounded-full bg-amber-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sniffy-yellow to-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((customer.total_sessions / 10) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">
              {Math.max(0, 10 - customer.total_sessions)} more to VIP status 🏆
            </p>
          </div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-sniffy-yellow/20 rounded-full blur-2xl pointer-events-none"/>
        </motion.div>
      )}
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────

function SectionHeader({
  label, Icon, cta,
}: {
  label: string;
  Icon: React.ElementType;
  cta?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-gray-500">
        <Icon size={12} className="text-sniffy-purple" strokeWidth={2.5}/>
        {label}
      </h3>
      {cta && (
        <button
          onClick={cta.onClick}
          className="text-[11px] font-black text-sniffy-purple flex items-center gap-0.5 hover:opacity-75 transition"
        >
          {cta.label} <ChevronRight size={12}/>
        </button>
      )}
    </div>
  );
}

// ─── Hero stat card ──────────────────────────────────────────────────

function HeroStat({
  Icon, label, value, highlight,
}: {
  Icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-3 py-2.5 backdrop-blur-sm border ${
        highlight
          ? 'bg-sniffy-yellow text-amber-900 border-amber-300 shadow-lg shadow-amber-500/20'
          : 'bg-white/10 border-white/15 text-white'
      }`}
    >
      <div className="flex items-center gap-1 opacity-75">
        <Icon size={10} strokeWidth={2.5}/>
        <span className="text-[9px] font-black uppercase tracking-[0.1em]">{label}</span>
      </div>
      <p className="text-[15px] font-black mt-0.5 leading-none">{value}</p>
    </div>
  );
}

// ─── Pet card ───────────────────────────────────────────────────────

function PetCard({ pet, tintIndex }: { pet: Pet; tintIndex: number }) {
  const tint = PET_TINTS[tintIndex % PET_TINTS.length];
  const emoji = pet.type === 'dog' ? '🐶' : '🐱';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: tintIndex * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br ${tint.bg} ring-1 ${tint.ring}`}
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}
    >
      {/* Ghost emoji watermark */}
      <div className="absolute -right-2 -bottom-2 text-5xl opacity-10 pointer-events-none select-none">
        {emoji}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl shrink-0 overflow-hidden border border-white">
          {pet.photo_url
            ? <img src={pet.photo_url} alt={pet.name ?? 'Pet'} className="w-full h-full object-cover"/>
            : emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-black text-gray-900 truncate leading-tight">
            {pet.name || <span className="text-gray-400 italic">Unnamed</span>}
          </p>
          <p className={`text-[10px] font-bold ${tint.accent} truncate mt-0.5`}>
            {pet.breed ?? pet.type}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        <span className="bg-white/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-700 border border-white/60">
          {petDisplayAge(pet)}
        </span>
        {pet.gender && (
          <span className="bg-white/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-700 capitalize border border-white/60">
            {pet.gender}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Session row ────────────────────────────────────────────────────

function SessionRow({ s, index }: { s: RecentSession; index: number }) {
  const emoji = s.pet_type === 'dog' ? '🐶' : '🐱';
  // `grooming_done` reads as "completed" to the customer — see the same
  // note in CustomerPortalSessions.  Our payment reconciliation is not
  // a state the customer has any use for.
  const isDelivered = s.status === 'completed' || s.status === 'grooming_done';
  const statusLabel = isDelivered ? 'completed' : s.status;
  const statusStyle =
    isDelivered ? {
      bg: 'bg-emerald-500',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-400',
    } :
    s.status === 'cancelled' ? {
      bg: 'bg-red-400',
      pill: 'bg-red-50 text-red-600 border-red-200',
      dot: 'bg-red-400',
    } : {
      bg: 'bg-amber-400',
      pill: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-400',
    };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-2xl overflow-hidden relative"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusStyle.bg} rounded-l-2xl`}/>

      <div className="ml-1 w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 ring-1 ring-purple-100 flex items-center justify-center text-xl shrink-0">
        {emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-black text-gray-900 truncate">{fmtShortDate(s.session_date)}</p>
          {s.package && (
            <span className={`text-[9px] font-bold border rounded-full px-1.5 py-px ${packagePillClass(s.package)} shrink-0`}>
              {s.package}
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-400 font-semibold mt-0.5 truncate">{s.breed ?? '—'}</p>
      </div>

      <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wide border rounded-full px-2.5 py-1 shrink-0 ${statusStyle.pill}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} inline-block shrink-0`}/>
        {statusLabel}
      </div>
    </motion.div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────

function EmptyState({
  Icon, title, subtitle, ctaLabel, onClick,
}: {
  Icon: React.ElementType;
  title: string;
  subtitle: string;
  ctaLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100">
      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm text-sniffy-purple flex items-center justify-center shrink-0">
        <Icon size={20} strokeWidth={2}/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-extrabold text-gray-900">{title}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
      <button
        onClick={onClick}
        className="px-3.5 py-2 rounded-xl text-[11px] font-black text-white bg-sniffy-purple shrink-0 transition active:scale-95 shadow-md shadow-purple-900/20"
      >
        {ctaLabel}
      </button>
    </div>
  );
}