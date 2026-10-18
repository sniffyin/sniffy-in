/**
 * groomer/GroomerProfileTab.tsx
 *
 * "Super-duper" profile screen for the logged-in groomer.  Rendered when
 * the side-drawer "Profile" item is tapped from GroomerDashboard.
 *
 * Layout (top → bottom):
 *   ┌─────────────────────────────────────────┐
 *   │            (animated purple halo)        │
 *   │            ┌──────────────┐              │
 *   │            │  big circular │              │  ← tap to upload / change
 *   │            │     photo     │              │     photo (uploadHelper)
 *   │            └──────────────┘              │
 *   │              Ravi Sharma                 │
 *   │              Groomer · 🟢 Active          │
 *   ├─────────────────────────────────────────┤
 *   │   🗓  Joined since · 12 Jan 2025         │
 *   │   📞 +91 98xxx xxxxx · tap to call       │
 *   ├─────────────────────────────────────────┤
 *   │  ┌──────────────┐  ┌──────────────┐     │
 *   │  │ 142  ✅       │  │ 8     📅     │     │
 *   │  │ Completed     │  │ Upcoming      │     │
 *   │  └──────────────┘  └──────────────┘     │
 *   │  ┌──────────────────────────────────┐   │
 *   │  │  150 Total Sessions               │   │
 *   │  └──────────────────────────────────┘   │
 *   └─────────────────────────────────────────┘
 *
 * Data sources:
 *   • Groomer row     → groomers WHERE id = groomer_id
 *                       (photo_url, phone, joined_date, status)
 *   • Session counts  → grooming_sessions WHERE groomer_id = groomer_id
 *                       (completed when status='completed' OR
 *                        groomer_marked_complete_at IS NOT NULL)
 *
 * Photo upload reuses `uploadGroomerImage('profiles', …)` and then
 * UPDATEs groomers.photo_url so the dashboard top bar reflects the
 * change immediately.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Calendar as CalendarIcon, Phone,
  Sparkles, Loader2, Trophy, CalendarClock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadGroomerImage } from './uploadHelper';
import {
  GroomingSession, GROOMER_STATUS_LABELS, GROOMER_STATUS_COLORS,
  fmtDate,
} from '../admin/types';
import type { AdminUser } from '../admin/authStore';

// ─── Types ─────────────────────────────────────────────────────

interface GroomerRow {
  id:           string;
  name:         string;
  phone:        string;
  status:       'active' | 'inactive' | 'on_leave';
  photo_url:    string | null;
  joined_date:  string;
  created_at:   string;
}

interface Stats {
  completed: number;
  upcoming:  number;
  total:     number;
}

// ─── Small primitives ──────────────────────────────────────────

/** Reusable card chrome — same gentle white card used by Overview tab. */
const CARD =
  'bg-white rounded-2xl border border-gray-100';
const CARD_SHADOW = { boxShadow: '0 4px 16px rgba(0,0,0,0.06)' };

/** Pretty "joined since" formatter — keeps the date short on mobile. */
function fmtJoined(iso: string | null | undefined): string {
  if (!iso) return '—';
  try { return fmtDate(iso); } catch { return '—'; }
}

// ─── Main component ────────────────────────────────────────────

export default function GroomerProfileTab({
  groomer,
  onPhotoChanged,
}: {
  groomer: AdminUser;
  /** Fired after a successful photo upload so the dashboard top bar
   *  can refetch & swap the avatar without a full reload. */
  onPhotoChanged?: () => void;
}) {
  const groomerId = useMemo(
    () => groomer.groomer_id ?? groomer.id,
    [groomer.groomer_id, groomer.id],
  );

  const [row,      setRow]      = useState<GroomerRow | null>(null);
  const [stats,    setStats]    = useState<Stats>({ completed: 0, upcoming: 0, total: 0 });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // Photo upload state
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // ── Fetch profile row + session stats in parallel ───────────
  const refresh = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [{ data: rowData, error: rowErr }, { data: sessions, error: sessErr }] =
        await Promise.all([
          supabase
            .from('groomers')
            .select('id, name, phone, status, photo_url, joined_date, created_at')
            .eq('id', groomerId)
            .maybeSingle(),
          supabase
            .from('grooming_sessions')
            .select('status, groomer_marked_complete_at, session_date')
            .eq('groomer_id', groomerId),
        ]);

      if (rowErr) throw rowErr;
      if (sessErr) throw sessErr;

      setRow((rowData as GroomerRow) ?? null);

      const list = (sessions as Pick<
        GroomingSession,
        'status' | 'groomer_marked_complete_at' | 'session_date'
      >[]) ?? [];

      // "Done from the groomer's side" — mirrors GroomerOverviewTab.
      const isDone = (s: typeof list[number]) =>
        s.status === 'completed'
        || s.status === 'grooming_done'
        || !!s.groomer_marked_complete_at;

      const todayIso = new Date().toISOString().slice(0, 10);
      const completed = list.filter(s => s.status !== 'cancelled' && isDone(s)).length;
      const upcoming  = list.filter(s =>
        !isDone(s) &&
        s.status !== 'cancelled' &&
        (s.session_date ?? '') >= todayIso
      ).length;
      const total = list.filter(s => s.status !== 'cancelled').length;

      setStats({ completed, upcoming, total });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not load profile.');
    } finally {
      setLoading(false);
    }
  }, [groomerId]);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Photo upload handler ────────────────────────────────────
  async function handlePickPhoto(file: File | null) {
    if (!file) return;
    setUploadErr(null);
    setUploading(true);
    try {
      const up = await uploadGroomerImage('profiles', groomerId, file);
      if (!up.ok || !up.publicUrl) {
        throw new Error(up.error ?? 'Upload failed.');
      }
      const { error: updErr } = await supabase
        .from('groomers')
        .update({ photo_url: up.publicUrl })
        .eq('id', groomerId);
      if (updErr) throw updErr;

      // Optimistically update local row
      setRow(prev => prev ? { ...prev, photo_url: up.publicUrl ?? null } : prev);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1800);
      onPhotoChanged?.();
    } catch (e: unknown) {
      setUploadErr(e instanceof Error ? e.message : 'Photo upload failed.');
    } finally {
      setUploading(false);
      // Reset the input so the same file can be picked again
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  // ── Derived display fields ──────────────────────────────────
  const displayName     = row?.name ?? groomer.name;
  const displayPhoto    = row?.photo_url ?? null;
  const displayPhone    = row?.phone ?? '';
  const displayJoined   = row?.joined_date ?? row?.created_at ?? null;
  const displayStatus   = row?.status ?? 'active';
  const initials        = (displayName.trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('') ||
                           groomer.avatarInitials || '?').toUpperCase();

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

      {/* ── HERO ── Big animated halo + circular photo + name ── */}
      <section
        className="relative overflow-hidden rounded-[28px] mb-6"
        style={{
          background: 'linear-gradient(160deg, #f3ebff 0%, #faf6ff 50%, #ffffff 100%)',
          boxShadow: '0 6px 24px rgba(69,26,139,0.10)',
        }}
      >
        {/* Decorative animated blobs (subtle) */}
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
          {/* Big circular avatar */}
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
            {/* Pulsing ring */}
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
              {displayPhoto ? (
                <motion.img
                  key={displayPhoto}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  src={displayPhoto}
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

              {/* Upload-in-progress dim overlay */}
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

              {/* Just-saved sparkle flash */}
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

          {/* Upload error */}
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

          {/* Tap-to-change hint */}
          <button
            type="button"
            onClick={() => !uploading && fileInput.current?.click()}
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sniffy-purple hover:underline"
          >
            <Sparkles size={11}/> Tap photo to change
          </button>

          {/* Name + role */}
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
              Groomer
            </span>
            <span
              className={[
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                GROOMER_STATUS_COLORS[displayStatus],
              ].join(' ')}
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-current"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              {GROOMER_STATUS_LABELS[displayStatus]}
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── Info rows (joined + phone) ── */}
      <section className="space-y-3 mb-6">

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`${CARD} px-4 py-4 flex items-center gap-4`}
          style={CARD_SHADOW}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #451a8b)' }}
          >
            <CalendarIcon size={18}/>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
              Joined Since
            </p>
            <p className="text-base font-extrabold text-gray-900 leading-tight">
              {loading ? '…' : fmtJoined(displayJoined)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${CARD} px-4 py-4 flex items-center gap-4`}
          style={CARD_SHADOW}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f6ac0a, #d97706)' }}
          >
            <Phone size={18}/>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
              Phone Number
            </p>
            <p className="text-base font-extrabold text-gray-900 leading-tight truncate">
              {loading ? '…' : (displayPhone || 'Not on file')}
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Stats grid ── */}
      <section className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">
          Your Track Record
        </p>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            delay={0.05}
            icon={<CheckCircle2 size={18}/>}
            iconBg="linear-gradient(135deg, #10b981, #047857)"
            label="Completed"
            value={loading ? '–' : stats.completed}
            sub="Sessions done"
          />
          <StatCard
            delay={0.12}
            icon={<CalendarClock size={18}/>}
            iconBg="linear-gradient(135deg, #6366f1, #4338ca)"
            label="Upcoming"
            value={loading ? '–' : stats.upcoming}
            sub="On the books"
          />
        </div>

        {/* Big trophy / total card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl px-5 py-5"
          style={{
            background: 'linear-gradient(135deg, #451a8b 0%, #7c3aed 100%)',
            boxShadow: '0 10px 30px rgba(69,26,139,0.30)',
          }}
        >
          {/* Decorative shimmer */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '120%' }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }}
          />
          <div className="relative flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/20 text-white"
              style={{ backdropFilter: 'blur(6px)' }}
            >
              <Trophy size={22}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                All-time Sessions
              </p>
              <p className="text-3xl font-extrabold text-white leading-tight">
                {loading ? '–' : stats.total}
              </p>
              <p className="text-[11px] font-medium text-white/70">
                You're making tails wag 🐾
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Refresh / error footer ── */}
      {error && (
        <p className="mt-6 text-center text-xs text-red-500 font-semibold">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────────

function StatCard({
  delay, icon, iconBg, label, value, sub,
}: {
  delay: number;
  icon: React.ReactNode;
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
      className={`${CARD} px-4 py-4`}
      style={CARD_SHADOW}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
      <p className="text-[11px] font-bold text-gray-700 mt-0.5">{label}</p>
      <p className="text-[10px] font-medium text-gray-400">{sub}</p>
    </motion.div>
  );
}
