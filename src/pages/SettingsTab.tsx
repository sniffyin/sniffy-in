/**
 * SettingsTab.tsx
 *
 * Settings screen shared by AdminDashboard and GroomerDashboard.
 * Loaded lazily — no part of the app reaches into it on a critical
 * path.
 *
 * Sections (top → bottom):
 *   ┌──────────────────────────────────────────┐
 *   │  Account                                  │
 *   │   • Profile chip → opens Profile tab       │
 *   │   • Sign out (red)                         │
 *   ├──────────────────────────────────────────┤
 *   │  Notifications                            │
 *   │   • Enable browser notifications (perm)    │
 *   │   • Per-category toggles                   │
 *   │   • Show unread dot                        │
 *   │   • Sound on new notification              │
 *   ├──────────────────────────────────────────┤
 *   │  Appearance                               │
 *   │   • Text size (small / normal / large)     │
 *   │   • Reduce motion                          │
 *   │   • Compact list rows                      │
 *   ├──────────────────────────────────────────┤
 *   │  App & PWA                                │
 *   │   • Install app (beforeinstallprompt)       │
 *   │   • Check for updates (SW)                 │
 *   │   • Clear cache & reload                   │
 *   │   • Auto-apply updates                     │
 *   │   • Pull-to-refresh hint                   │
 *   ├──────────────────────────────────────────┤
 *   │  Privacy & Data                           │
 *   │   • Remember recent customers              │
 *   │   • Clear local data                       │
 *   │   • Reset settings to defaults             │
 *   ├──────────────────────────────────────────┤
 *   │  About                                    │
 *   │   • Version · support · T&Cs · privacy     │
 *   └──────────────────────────────────────────┘
 *
 * All preferences are localStorage-only, namespaced per user via
 * `lib/userSettings.ts`.  Browser-level effects (install prompt, SW
 * cache, notification permission) are wired locally — no globals.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, LogOut, Bell, BellRing, Palette, Smartphone,
  ShieldCheck, Info, ChevronRight, Check,
  Type, Zap, Rows, Download, RefreshCw, Trash2,
  Volume2, VolumeX, AlertTriangle, ExternalLink,
  Phone, FileText, RotateCcw, Loader2,
} from 'lucide-react';
import {
  readSettings, writeSetting, resetSettings, appVersionLabel,
  type UserSettings, type TextSize,
} from '../lib/userSettings';
import { roleLabel, type AdminUser } from './admin/authStore';

// ─── Constants ─────────────────────────────────────────────────

const SUPPORT_PHONE_DISPLAY = '+91 89713 13003';
const SUPPORT_PHONE_NUMERIC = '918971313003';
const SUPPORT_EMAIL = 'support@sniffy.in';

// ─── Layout helpers ────────────────────────────────────────────

const CARD = 'bg-white rounded-2xl border border-gray-100 overflow-hidden';
const CARD_SHADOW: React.CSSProperties = { boxShadow: '0 4px 16px rgba(0,0,0,0.05)' };

function SectionHeading({ Icon, title, subtitle }: {
  Icon: React.ElementType; title: string; subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-2 px-1 mb-2.5 mt-5 first:mt-1">
      <span className="grid place-items-center w-7 h-7 rounded-xl bg-purple-50 text-sniffy-purple flex-shrink-0">
        <Icon size={14}/>
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-700 leading-tight">
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/** Generic row used by every settings line — left icon + label/sub,
 *  right slot for the control (toggle / chevron / button). */
function Row({
  Icon, label, sub, right, onClick, danger, accentBg, accentColor,
}: {
  Icon?: React.ElementType;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  accentBg?: string;
  accentColor?: string;
}) {
  const isButton = typeof onClick === 'function';
  const Tag = isButton ? 'button' : 'div';
  return (
    <Tag
      {...(isButton ? { type: 'button', onClick } : {})}
      className={[
        'w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-50 last:border-b-0',
        isButton ? 'hover:bg-gray-50 active:bg-gray-100 transition' : '',
      ].join(' ')}
    >
      {Icon && (
        <span
          className="grid place-items-center w-9 h-9 rounded-xl flex-shrink-0"
          style={{
            background: accentBg ?? (danger ? '#fee2e2' : '#f5f0ff'),
            color:      accentColor ?? (danger ? '#dc2626' : '#451a8b'),
          }}
        >
          <Icon size={15}/>
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-bold leading-tight ${danger ? 'text-red-600' : 'text-gray-900'}`}>
          {label}
        </p>
        {sub && <p className="text-[11.5px] text-gray-500 leading-snug mt-0.5">{sub}</p>}
      </div>
      {right ?? (isButton ? <ChevronRight size={16} className="text-gray-300 flex-shrink-0"/> : null)}
    </Tag>
  );
}

/** Native-feel toggle (purple when on). */
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition-colors duration-200"
      style={{ background: on ? '#451a8b' : '#e5e7eb' }}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow"
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  );
}

/** Three-pill segmented control — used for text size. */
function SegmentedTextSize({ value, onChange }: { value: TextSize; onChange: (t: TextSize) => void }) {
  const opts: { id: TextSize; label: string }[] = [
    { id: 'small',  label: 'A−' },
    { id: 'normal', label: 'A'  },
    { id: 'large',  label: 'A+' },
  ];
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-full p-0.5">
      {opts.map(o => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={[
              'px-3 py-1.5 text-[12px] font-bold rounded-full transition',
              active ? 'bg-white text-sniffy-purple shadow' : 'text-gray-500',
            ].join(' ')}
            style={{
              fontSize: o.id === 'small' ? 11 : o.id === 'large' ? 14 : 12.5,
            }}
            aria-pressed={active}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Browser install prompt (BeforeInstallPromptEvent) ─────────

interface BIPEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    // Standalone display-mode = the user is already running it as a PWA.
    return window.matchMedia?.('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  });

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    }
    function onInstalled() { setInstalled(true); setDeferred(null); }
    window.addEventListener('beforeinstallprompt', onPrompt as EventListener);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt as EventListener);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    return choice.outcome === 'accepted';
  }, [deferred]);

  return { canInstall: !!deferred && !installed, installed, promptInstall };
}

// ─── Notification permission ───────────────────────────────────

type NotifPerm = 'default' | 'granted' | 'denied' | 'unsupported';

function readNotifPerm(): NotifPerm {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission as NotifPerm;
}

// ─── Main ──────────────────────────────────────────────────────

export interface SettingsTabProps {
  user: AdminUser;
  /** Logout callback wired by the parent dashboard. */
  onLogout: () => void;
  /** Optional callback that switches the parent to the Profile tab. */
  onOpenProfile?: () => void;
  /** Surfaced in the "About" card so groomers vs. coordinators see the
   *  right portal name.  Defaults to "Back Office". */
  appLabel?: string;
}

export default function SettingsTab({
  user, onLogout, onOpenProfile, appLabel,
}: SettingsTabProps) {
  // ── Local mirror of persisted prefs.  We seed once, then mutate via
  //    `update()` so the UI updates immediately while writeSetting
  //    persists in the background.
  const [prefs, setPrefs] = useState<UserSettings>(() => readSettings(user.id));

  // Re-seed if the authed user changes (e.g. switching accounts on
  // shared device).  Empty user means defaults — defensive only.
  useEffect(() => { setPrefs(readSettings(user.id)); }, [user.id]);

  const update = useCallback(<K extends keyof UserSettings>(field: K, value: UserSettings[K]) => {
    setPrefs(prev => ({ ...prev, [field]: value }));
    writeSetting(user.id, field, value);
  }, [user.id]);

  // ── Browser-level features ────────────────────────────────────
  const install = useInstallPrompt();
  const [notifPerm, setNotifPerm] = useState<NotifPerm>(() => readNotifPerm());
  const [busy, setBusy] = useState<null | 'updates' | 'cache' | 'reset'>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  // ── Action handlers ──────────────────────────────────────────
  async function requestNotificationPermission() {
    if (notifPerm === 'unsupported') {
      flash('Notifications not supported on this browser');
      return;
    }
    if (notifPerm === 'denied') {
      flash('Permission blocked — enable in browser settings');
      return;
    }
    try {
      const res = await Notification.requestPermission();
      setNotifPerm(res as NotifPerm);
      if (res === 'granted') flash('Browser notifications enabled');
      else flash('Permission not granted');
    } catch {
      flash('Could not request permission');
    }
  }

  async function checkForUpdates() {
    setBusy('updates');
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.update()));
        flash('Checked for updates');
      } else {
        flash('Service worker unavailable');
      }
    } catch {
      flash('Update check failed');
    } finally {
      setBusy(null);
    }
  }

  async function clearCacheAndReload() {
    if (!confirm('Clear cached app data and reload? Your sign-in stays.')) return;
    setBusy('cache');
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch { /* still try to reload */ }
    // Hard reload bypassing the SW.
    window.location.reload();
  }

  async function clearLocalData() {
    if (!confirm(
      'Clear local data (recent customers, drafts, cached prefs)?\n\n' +
      'Your sign-in stays. Server data is unaffected.',
    )) return;
    try {
      // Preserve auth + the photo entries — only torch app-side caches.
      const KEEP_PREFIXES = ['sniffy_admin_user', 'sniffy_groomer_user', 'sniffy_coord_photo_'];
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        const protectedKey = KEEP_PREFIXES.some(p => k === p || k.startsWith(p));
        if (!protectedKey) toRemove.push(k);
      }
      toRemove.forEach(k => localStorage.removeItem(k));
      // Refresh prefs from defaults (we just wiped them).
      setPrefs(readSettings(user.id));
      flash('Local data cleared');
    } catch {
      flash('Could not clear data');
    }
  }

  function handleResetSettings() {
    if (!confirm('Reset all preferences on this device?')) return;
    setBusy('reset');
    try {
      resetSettings(user.id);
      setPrefs(readSettings(user.id));
      flash('Preferences reset');
    } finally {
      setBusy(null);
    }
  }

  async function installApp() {
    const accepted = await install.promptInstall();
    flash(accepted ? 'Installing Sniffy…' : 'Install cancelled');
  }

  // ── Derived UI bits ──────────────────────────────────────────
  const subtitle = useMemo(() => (
    appLabel ?? (user.role === 'groomer' ? 'Groomer Portal' : 'Back Office')
  ), [appLabel, user.role]);

  const browserNotifLine = useMemo<{ label: string; sub: string; cta: string; disabled: boolean }>(() => {
    if (notifPerm === 'granted')     return { label: 'Browser notifications', sub: 'Enabled on this device', cta: 'Enabled', disabled: true };
    if (notifPerm === 'denied')      return { label: 'Browser notifications', sub: 'Blocked — change in browser settings', cta: 'Blocked', disabled: true };
    if (notifPerm === 'unsupported') return { label: 'Browser notifications', sub: 'Not supported on this browser', cta: 'N/A', disabled: true };
    return { label: 'Enable browser notifications', sub: 'Get a system alert when something needs your attention', cta: 'Enable', disabled: false };
  }, [notifPerm]);

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="pb-8 max-w-2xl mx-auto">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden rounded-[24px] mb-5 px-5 py-5"
        style={{
          background: 'linear-gradient(160deg, #f3ebff 0%, #faf6ff 60%, #ffffff 100%)',
          boxShadow: '0 6px 24px rgba(69,26,139,0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-white text-sniffy-purple flex-shrink-0"
            style={{ boxShadow: '0 4px 12px rgba(69,26,139,0.15)' }}>
            <Palette size={20}/>
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sniffy-purple">{subtitle}</p>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">Settings</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">Tailor Sniffy to your device</p>
          </div>
        </div>
      </section>

      {/* ── Account ── */}
      <SectionHeading Icon={User} title="Account" subtitle="Signed in on this device"/>
      <div className={CARD} style={CARD_SHADOW}>
        <Row
          Icon={User}
          label={user.name}
          sub={`${roleLabel(user.role)} · @${user.username}`}
          onClick={onOpenProfile}
        />
        <Row
          Icon={LogOut}
          label="Sign out"
          sub="End this session on this device"
          danger
          onClick={onLogout}
        />
      </div>

      {/* ── Notifications ── */}
      <SectionHeading
        Icon={Bell}
        title="Notifications"
        subtitle="What lands in your bell · per-device"
      />
      <div className={CARD} style={CARD_SHADOW}>
        <Row
          Icon={BellRing}
          label={browserNotifLine.label}
          sub={browserNotifLine.sub}
          right={
            <button
              type="button"
              onClick={requestNotificationPermission}
              disabled={browserNotifLine.disabled}
              className={[
                'text-[12px] font-bold px-3 py-1.5 rounded-full transition flex-shrink-0',
                browserNotifLine.disabled
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-sniffy-purple text-white hover:opacity-95',
              ].join(' ')}
            >
              {browserNotifLine.cta}
            </button>
          }
        />
        <Row
          Icon={Bell}
          label="New bookings"
          sub="When a customer requests a new session"
          right={<Toggle on={prefs.notifyNewBookings} onChange={v => update('notifyNewBookings', v)} label="New bookings"/>}
        />
        <Row
          Icon={Bell}
          label="Follow-ups due"
          sub="Pets due for their next groom"
          right={<Toggle on={prefs.notifyFollowupsDue} onChange={v => update('notifyFollowupsDue', v)} label="Follow-ups"/>}
        />
        {user.role !== 'groomer' && (
          <Row
            Icon={Bell}
            label="Milestone approvals"
            sub="Arrival bonuses & review claims to approve"
            right={<Toggle on={prefs.notifyMilestoneApprovals} onChange={v => update('notifyMilestoneApprovals', v)} label="Milestone approvals"/>}
          />
        )}
        <Row
          Icon={Bell}
          label="Session updates"
          sub="Status changes, re-schedules, cancellations"
          right={<Toggle on={prefs.notifySessionUpdates} onChange={v => update('notifySessionUpdates', v)} label="Session updates"/>}
        />
        <Row
          Icon={Bell}
          label="Payment events"
          sub="Collections, settlements, payouts"
          right={<Toggle on={prefs.notifyPaymentEvents} onChange={v => update('notifyPaymentEvents', v)} label="Payment events"/>}
        />
        <Row
          Icon={Bell}
          label="Show unread dot"
          sub="The red badge on the bell icon"
          right={<Toggle on={prefs.showUnreadDot} onChange={v => update('showUnreadDot', v)} label="Show unread dot"/>}
        />
        <Row
          Icon={prefs.soundOnNotification ? Volume2 : VolumeX}
          label="Sound on new notification"
          sub="A soft chime when something arrives"
          right={<Toggle on={prefs.soundOnNotification} onChange={v => update('soundOnNotification', v)} label="Sound on new notification"/>}
        />
      </div>

      {/* ── Appearance ── */}
      <SectionHeading Icon={Palette} title="Appearance" subtitle="How Sniffy looks on this device"/>
      <div className={CARD} style={CARD_SHADOW}>
        <Row
          Icon={Type}
          label="Text size"
          sub="Scales every label, button, and list row"
          right={
            <SegmentedTextSize
              value={prefs.textSize}
              onChange={v => update('textSize', v)}
            />
          }
        />
        <Row
          Icon={Zap}
          label="Reduce motion"
          sub="Less animation across the app"
          right={<Toggle on={prefs.reduceMotion} onChange={v => update('reduceMotion', v)} label="Reduce motion"/>}
        />
        <Row
          Icon={Rows}
          label="Compact list rows"
          sub="Fit more sessions on screen at once"
          right={<Toggle on={prefs.compactLists} onChange={v => update('compactLists', v)} label="Compact list rows"/>}
        />
      </div>

      {/* ── App & PWA ── */}
      <SectionHeading
        Icon={Smartphone}
        title="App & PWA"
        subtitle="Installable home-screen app · offline shell"
      />
      <div className={CARD} style={CARD_SHADOW}>
        {install.installed ? (
          <Row
            Icon={Check}
            label="Installed"
            sub="Sniffy is running as an installed app"
            accentBg="#dcfce7"
            accentColor="#16a34a"
          />
        ) : install.canInstall ? (
          <Row
            Icon={Download}
            label="Install Sniffy"
            sub="Add to your home screen for one-tap access"
            onClick={installApp}
            right={
              <span className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-sniffy-purple text-white">
                Install
              </span>
            }
          />
        ) : (
          <Row
            Icon={Download}
            label="Install Sniffy"
            sub="On iOS: Share → Add to Home Screen.  On Android Chrome: ⋮ menu → Install app."
          />
        )}
        <Row
          Icon={busy === 'updates' ? Loader2 : RefreshCw}
          label="Check for updates"
          sub="Force-refresh the service worker"
          onClick={busy ? undefined : checkForUpdates}
          right={
            busy === 'updates'
              ? <Loader2 size={16} className="text-sniffy-purple animate-spin flex-shrink-0"/>
              : <ChevronRight size={16} className="text-gray-300 flex-shrink-0"/>
          }
        />
        <Row
          Icon={Trash2}
          label="Clear cache & reload"
          sub="Useful when something looks stale or wrong"
          onClick={busy ? undefined : clearCacheAndReload}
          right={
            busy === 'cache'
              ? <Loader2 size={16} className="text-sniffy-purple animate-spin flex-shrink-0"/>
              : <ChevronRight size={16} className="text-gray-300 flex-shrink-0"/>
          }
        />
        <Row
          Icon={Zap}
          label="Auto-apply updates"
          sub="Pick up new versions on next navigation"
          right={<Toggle on={prefs.autoApplyUpdates} onChange={v => update('autoApplyUpdates', v)} label="Auto-apply updates"/>}
        />
        <Row
          Icon={Rows}
          label="Pull-to-refresh hint"
          sub="Show the small hint above long lists"
          right={<Toggle on={prefs.showPullToRefreshHint} onChange={v => update('showPullToRefreshHint', v)} label="Pull-to-refresh hint"/>}
        />
      </div>

      {/* ── Privacy ── */}
      <SectionHeading
        Icon={ShieldCheck}
        title="Privacy & Data"
        subtitle="What stays on this device"
      />
      <div className={CARD} style={CARD_SHADOW}>
        <Row
          Icon={User}
          label="Remember recent customers"
          sub="Keeps the recent-customers row populated across sessions"
          right={<Toggle on={prefs.rememberRecents} onChange={v => update('rememberRecents', v)} label="Remember recent customers"/>}
        />
        <Row
          Icon={Trash2}
          label="Clear local data"
          sub="Wipes drafts and cached recents · sign-in & photos kept"
          danger
          onClick={clearLocalData}
        />
        <Row
          Icon={RotateCcw}
          label="Reset settings to defaults"
          sub="Resets every toggle on this page"
          onClick={busy ? undefined : handleResetSettings}
          right={
            busy === 'reset'
              ? <Loader2 size={16} className="text-sniffy-purple animate-spin flex-shrink-0"/>
              : <ChevronRight size={16} className="text-gray-300 flex-shrink-0"/>
          }
        />
      </div>

      {/* ── About ── */}
      <SectionHeading Icon={Info} title="About" subtitle="The boring but useful bits"/>
      <div className={CARD} style={CARD_SHADOW}>
        <Row
          Icon={Info}
          label="App version"
          sub={appVersionLabel()}
        />
        <Row
          Icon={Phone}
          label="Support"
          sub={SUPPORT_PHONE_DISPLAY}
          onClick={() => { window.location.href = `tel:+${SUPPORT_PHONE_NUMERIC}`; }}
        />
        <Row
          Icon={ExternalLink}
          label="Email support"
          sub={SUPPORT_EMAIL}
          onClick={() => { window.location.href = `mailto:${SUPPORT_EMAIL}`; }}
        />
        <Row
          Icon={FileText}
          label="Terms & Conditions"
          onClick={() => window.open('/terms', '_blank', 'noopener')}
        />
        <Row
          Icon={ShieldCheck}
          label="Privacy Policy"
          onClick={() => window.open('/privacy', '_blank', 'noopener')}
        />
      </div>

      {/* Permission-blocked banner: show only if user actively tried */}
      {notifPerm === 'denied' && (
        <div className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-2xl bg-amber-50 border border-amber-100">
          <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5"/>
          <p className="text-[11.5px] text-amber-800 leading-snug">
            Browser notifications are blocked. Re-enable them in the site
            settings (lock icon in the address bar) to receive system
            alerts.
          </p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-gray-900 text-white text-[12px] font-semibold shadow-xl"
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}
