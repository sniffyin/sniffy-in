/**
 * admin/CoordinatorProfileTab.tsx
 *
 * Profile screen for the logged-in coordinator / admin / viewer.
 * Rendered when the side-drawer "Profile" item is tapped from
 * AdminDashboard.
 *
 *   ┌─────────────────────────────────────────┐
 *   │            (animated purple halo)        │
 *   │            ┌──────────────┐              │
 *   │            │  big circular │              │  ← tap to upload / change
 *   │            │     photo     │              │     photo (uploadHelper)
 *   │            └──────────────┘              │
 *   │              Nikita                       │
 *   │              Coordinator · 🟢 Active      │
 *   ├─────────────────────────────────────────┤
 *   │  👤  Username · nikita                    │
 *   │  🛡  Role · Coordinator                   │
 *   ├─────────────────────────────────────────┤
 *   │  WHAT'S ON YOUR PLATE TODAY              │
 *   │  ┌──────┐ ┌──────┐ ┌──────┐              │
 *   │  │ Sess │ │ Grms │ │ F-up │              │
 *   │  └──────┘ └──────┘ └──────┘              │
 *   │  ┌──────────────────────────────────┐   │
 *   │  │  YOUR ACCESS LEVEL                │   │
 *   │  │  ✅ Write   ❌ Delete   ✅ Vendors  │   │
 *   │  └──────────────────────────────────┘   │
 *   ├─────────────────────────────────────────┤
 *   │  Quick Actions →                          │
 *   │  Vendor Reconciliation · Groomers · F-ups│
 *   └─────────────────────────────────────────┘
 *
 * Why "stewardship" stats (not personal stats):
 *   Unlike a groomer (who has sessions assigned to them), a coordinator
 *   isn't directly tied to rows in grooming_sessions — she watches over
 *   ALL of it.  So the stats card surfaces the three numbers most
 *   relevant to her day: how many sessions today, how many groomers are
 *   live, and how many follow-ups are due.
 *
 * Photo storage:
 *   No `coordinators` table exists in Supabase.  We piggy-back on the
 *   existing `groomer-uploads` bucket (kind='profiles', sessionId
 *   prefixed with 'coord-') and persist the returned public URL in
 *   localStorage under `sniffy_coord_photo_<userId>`.  AdminDashboard
 *   reads the same key when seeding the top-bar photo.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Sparkles, Loader2,
  ShieldCheck, AtSign, Calendar as CalendarIcon, UserCog,
  Users, IndianRupee, ChevronRight,
  CalendarClock, FileText,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadGroomerImage } from '../groomer/uploadHelper';
import {
  canDelete, canWrite, canManageGroomers, roleLabel,
  type AdminUser,
} from './authStore';

// ─── localStorage key for the coordinator/admin's profile photo URL ──
//
// Keep this in sync with the same constant in AdminDashboard.tsx — both
// read this key to feed the photo into MobileTopBar + SideDrawer.
export function coordPhotoStorageKey(userId: string): string {
  return `sniffy_coord_photo_${userId}`;
}

export function readCoordPhoto(userId: string): string | null {
  try {
    return localStorage.getItem(coordPhotoStorageKey(userId));
  } catch {
    return null;
  }
}

function writeCoordPhoto(userId: string, url: string) {
  try { localStorage.setItem(coordPhotoStorageKey(userId), url); } catch {}
}

// ─── Stats query shape ────────────────────────────────────────

interface Stats {
  todaySessions:     number;
  activeGroomers:    number;
  followupsDue:      number;
  /** Set when any of the three queries fails so we can show a soft
   *  inline note instead of a blank "0". */
  partialError?:     string;
}

// ─── Layout helpers ───────────────────────────────────────────

const CARD = 'bg-white rounded-2xl border border-gray-100';
const CARD_SHADOW = { boxShadow: '0 4px 16px rgba(0,0,0,0.06)' };

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function in14DaysIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

// ─── Main component ──────────────────────────────────────────

export default function CoordinatorProfileTab({
  user,
  onPhotoChanged,
  onNavigate,
}: {
  user: AdminUser;
  /** Fired after a successful photo upload so AdminDashboard can
   *  re-read localStorage and refresh the top-bar avatar. */
  onPhotoChanged?: () => void;
  /** Same tab union AdminDashboard uses — lets us route the
   *  "Quick Actions" buttons directly to the tabs. */
  onNavigate?: (tab: 'vendors' | 'groomers' | 'followups' | 'documents') => void;
}) {
  // ── Photo (localStorage-backed) ─────────────────────────────
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    () => readCoordPhoto(user.id),
  );

  const fileInput = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // ── Stewardship stats ───────────────────────────────────────
  const [stats, setStats] = useState<Stats>({
    todaySessions:  0,
    activeGroomers: 0,
    followupsDue:   0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    setStatsLoading(true);
    const partials: string[] = [];

    // Three lightweight HEAD-style count queries in parallel.  We use
    // { count: 'exact', head: true } so Supabase returns only the
    // count — no row payload — keeping these cheap even when the
    // tables grow.
    const [todayRes, groomersRes, fupRes] = await Promise.allSettled([
      supabase
        .from('grooming_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('session_date', todayIso())
        .neq('status', 'cancelled'),
      supabase
        .from('groomers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('grooming_sessions')
        .select('id', { count: 'exact', head: true })
        .neq('status', 'cancelled')
        .not('next_due_date', 'is', null)
        .lte('next_due_date', in14DaysIso()),
    ]);

    const next: Stats = {
      todaySessions:  0,
      activeGroomers: 0,
      followupsDue:   0,
    };

    if (todayRes.status === 'fulfilled' && !todayRes.value.error) {
      next.todaySessions = todayRes.value.count ?? 0;
    } else {
      partials.push('today');
    }
    if (groomersRes.status === 'fulfilled' && !groomersRes.value.error) {
      next.activeGroomers = groomersRes.value.count ?? 0;
    } else {
      partials.push('groomers');
    }
    if (fupRes.status === 'fulfilled' && !fupRes.value.error) {
      next.followupsDue = fupRes.value.count ?? 0;
    } else {
      partials.push('follow-ups');
    }

    if (partials.length) {
      next.partialError = `Couldn't load: ${partials.join(', ')}`;
    }
    setStats(next);
    setStatsLoading(false);
  }, []);

  useEffect(() => { refreshStats(); }, [refreshStats]);

  // ── Photo upload handler ────────────────────────────────────
  async function handlePickPhoto(file: File | null) {
    if (!file) return;
    setUploadErr(null);
    setUploading(true);
    try {
      // sessionId is just used as a filename prefix inside the
      // `groomer-uploads/profiles/` folder — namespacing with "coord-"
      // keeps coordinator avatars from colliding with groomer rows
      // that happen to share the same UUID space.
      const up = await uploadGroomerImage('profiles', `coord-${user.id}`, file);
      if (!up.ok || !up.publicUrl) {
        throw new Error(up.error ?? 'Upload failed.');
      }
      setPhotoUrl(up.publicUrl);
      writeCoordPhoto(user.id, up.publicUrl);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1800);
      onPhotoChanged?.();
    } catch (e: unknown) {
      setUploadErr(e instanceof Error ? e.message : 'Photo upload failed.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  // ── Derived display fields ──────────────────────────────────
  const displayName = user.name;
  const initials    = user.avatarInitials || '?';
  const role        = user.role;

  // Permissions matrix — drives the "Your access level" pill row
  const perms = useMemo(() => ([
    { label: 'Read',           granted: true,                       Icon: CheckCircle2 },
    { label: 'Write / Edit',   granted: canWrite(user),             Icon: CheckCircle2 },
    { label: 'Delete',         granted: canDelete(user),            Icon: CheckCircle2 },
    { label: 'Manage Groomers',granted: canManageGroomers(user),    Icon: CheckCircle2 },
  ]), [user]);

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="pb-8">
      {/* hidden file input — shared between avatar tap + Change button */}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handlePickPhoto(e.target.files?.[0] ?? null)}
      />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden rounded-[28px] mb-6"
        style={{
          background: 'linear-gradient(160deg, #f3ebff 0%, #faf6ff 50%, #ffffff 100%)',
          boxShadow: '0 6px 24px rgba(69,26,139,0.10)',
        }}
      >
        {/* Decorative blobs */}
        <motion.div
          className="absolute -top-12 -right-10 w-44 h-44 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-14 -left-10 w-52 h-52 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(246,172,10,0.18), transparent 70%)' }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />

        <div className="relative px-6 pt-10 pb-7 flex flex-col items-center text-center">
          {/* Big circular avatar — tap to change */}
          <motion.button
            type="button"
            onClick={() => !uploading && fileInput.current?.click()}
            whileTap={{ scale: 0.97 }}
            className="relative rounded-full focus:outline-none"
            aria-label="Change profile photo"
            style={{
              width: 168, height: 168,
              padding: 4,
              background: 'linear-gradient(135deg, #7c3aed, #451a8b 60%, #f6ac0a)',
              boxShadow: '0 18px 40px rgba(69,26,139,0.30), 0 4px 12px rgba(0,0,0,0.10)',
            }}
          >
            <motion.span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: '2px solid rgba(124,58,237,0.45)' }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
            />

            <div
              className="relative w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center"
              style={{ border: '4px solid #ffffff' }}
            >
              {photoUrl ? (
                <motion.img
                  key={photoUrl}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  src={photoUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-5xl font-extrabold text-amber-900"
                  style={{ background: 'linear-gradient(135deg,#fde68a 0%, #f6ac0a 100%)' }}
                >
                  {initials}
                </div>
              )}

              <AnimatePresence>
                {uploading && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center gap-2"
                  >
                    <Loader2 size={26} className="animate-spin text-white"/>
                    <p className="text-[11px] font-bold text-white tracking-wide">Uploading…</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {justSaved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.45 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <span
                      className="w-16 h-16 rounded-full flex items-center justify-center bg-green-500 text-white"
                      style={{ boxShadow: '0 8px 22px rgba(34,197,94,0.45)' }}
                    >
                      <CheckCircle2 size={32} strokeWidth={2.4}/>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>

          <AnimatePresence>
            {uploadErr && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-[11px] font-semibold text-red-500"
              >
                {uploadErr}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => !uploading && fileInput.current?.click()}
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sniffy-purple hover:underline"
          >
            <Sparkles size={11}/> Tap photo to change
          </button>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight"
          >
            {displayName}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-2 flex items-center gap-2 flex-wrap justify-center"
          >
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sniffy-purple/10 text-sniffy-purple">
              {roleLabel(role)}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-current"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              Active
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── Identity rows ── */}
      <section className="space-y-3 mb-6">
        <InfoRow
          delay={0.05}
          Icon={AtSign}
          iconBg="linear-gradient(135deg, #7c3aed, #451a8b)"
          label="Username"
          value={user.username}
        />
        <InfoRow
          delay={0.1}
          Icon={ShieldCheck}
          iconBg="linear-gradient(135deg, #f6ac0a, #d97706)"
          label="Role"
          value={`${roleLabel(role)} · Sniffy Back Office`}
        />
      </section>

      {/* ── "What's on your plate" — live coordinator dashboard ── */}
      <section className="space-y-3 mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">
          What's on your plate today
        </p>

        <div className="grid grid-cols-3 gap-2.5">
          <MiniStat
            delay={0.05}
            Icon={CalendarIcon}
            iconBg="linear-gradient(135deg, #10b981, #047857)"
            label="Sessions"
            value={statsLoading ? '–' : stats.todaySessions}
            sub="today"
          />
          <MiniStat
            delay={0.1}
            Icon={UserCog}
            iconBg="linear-gradient(135deg, #6366f1, #4338ca)"
            label="Groomers"
            value={statsLoading ? '–' : stats.activeGroomers}
            sub="active"
          />
          <MiniStat
            delay={0.15}
            Icon={CalendarClock}
            iconBg="linear-gradient(135deg, #f59e0b, #b45309)"
            label="Follow-ups"
            value={statsLoading ? '–' : stats.followupsDue}
            sub="due soon"
          />
        </div>

        {stats.partialError && (
          <p className="text-[10px] text-amber-600 font-semibold px-1">
            {stats.partialError}
          </p>
        )}
      </section>

      {/* ── Access level pill row ── */}
      <section className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1 mb-2">
          Your access level
        </p>
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className={`${CARD} px-4 py-4`} style={CARD_SHADOW}
        >
          <div className="grid grid-cols-2 gap-2.5">
            {perms.map(p => (
              <div
                key={p.label}
                className="flex items-center gap-2"
              >
                {p.granted ? (
                  <CheckCircle2 size={16} className="text-green-500 flex-shrink-0"/>
                ) : (
                  <XCircle size={16} className="text-gray-300 flex-shrink-0"/>
                )}
                <span className={[
                  'text-[12px] font-semibold leading-tight',
                  p.granted ? 'text-gray-700' : 'text-gray-400 line-through',
                ].join(' ')}>
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Quick actions ── */}
      {onNavigate && (
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1 mb-2">
            Quick actions
          </p>
          <div className="space-y-2">
            <QuickAction
              Icon={IndianRupee}
              iconBg="linear-gradient(135deg, #10b981, #047857)"
              label="Vendor Reconciliation"
              sub="Review external bookings + settlements"
              onClick={() => onNavigate('vendors')}
            />
            <QuickAction
              Icon={UserCog}
              iconBg="linear-gradient(135deg, #7c3aed, #451a8b)"
              label="Groomers"
              sub="Profiles, leaves, status"
              onClick={() => onNavigate('groomers')}
            />
            <QuickAction
              Icon={Users}
              iconBg="linear-gradient(135deg, #f59e0b, #b45309)"
              label="Follow-ups"
              sub="Customers due for re-grooming"
              onClick={() => onNavigate('followups')}
            />
            <QuickAction
              Icon={FileText}
              iconBg="linear-gradient(135deg, #6366f1, #4338ca)"
              label="Documents"
              sub="Letters, certificates, agreements"
              onClick={() => onNavigate('documents')}
            />
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Small primitives ────────────────────────────────────────

function InfoRow({
  delay, Icon, iconBg, label, value,
}: {
  delay: number;
  Icon: React.ElementType;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${CARD} px-4 py-4 flex items-center gap-4`}
      style={CARD_SHADOW}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={18}/>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
          {label}
        </p>
        <p className="text-base font-extrabold text-gray-900 leading-tight truncate">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

function MiniStat({
  delay, Icon, iconBg, label, value, sub,
}: {
  delay: number;
  Icon: React.ElementType;
  iconBg: string;
  label: string;
  value: number | string;
  sub: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${CARD} px-3 py-3.5`}
      style={CARD_SHADOW}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-white mb-1.5"
        style={{ background: iconBg }}
      >
        <Icon size={16}/>
      </div>
      <p className="text-xl font-extrabold text-gray-900 leading-tight">{value}</p>
      <p className="text-[10px] font-bold text-gray-700 mt-0.5 leading-tight">{label}</p>
      <p className="text-[9px] font-medium text-gray-400 leading-tight">{sub}</p>
    </motion.div>
  );
}

function QuickAction({
  Icon, iconBg, label, sub, onClick,
}: {
  Icon: React.ElementType;
  iconBg: string;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`${CARD} w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 active:bg-gray-100 transition`}
      style={CARD_SHADOW}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={17}/>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-gray-900 leading-tight">{label}</p>
        <p className="text-[11px] text-gray-500 leading-tight truncate">{sub}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300 flex-shrink-0"/>
    </motion.button>
  );
}
