/**
 * userSettings.ts — per-user preferences persisted in localStorage.
 *
 * Auth is handled by `pages/admin/authStore.ts` (hardcoded USERS array),
 * so there's no Supabase row to hang preferences off. We namespace every
 * key by the user id so coordinators, admins, and groomers all keep
 * their own toggles on the same device.
 *
 *   sniffy_settings_v1::<userId>::<key>  →  JSON value
 *
 * Used by:
 *   • SettingsTab.tsx  — the screen users interact with
 *   • (future) notification hooks that want to honour the "notify me
 *     about X" toggles before pushing a row into the bell feed
 *
 * Side-effects (text size, reduced motion) are applied at module init
 * via `applyDisplaySettings()` so the user's choice survives a reload
 * without needing the Settings page to mount first.
 */

const STORAGE_PREFIX = 'sniffy_settings_v1';

// ─── Pref shape ─────────────────────────────────────────────────

export type TextSize = 'small' | 'normal' | 'large';

/** All persisted preferences for a single user.  Add new fields here
 *  AND in DEFAULTS below — `readSettings` merges with defaults so old
 *  installs keep working when we add new toggles. */
export interface UserSettings {
  // ── Notifications (in-app bell + browser) ──
  notifyNewBookings:      boolean;
  notifyFollowupsDue:     boolean;
  notifyMilestoneApprovals: boolean;
  notifySessionUpdates:   boolean;
  notifyPaymentEvents:    boolean;
  /** When false, useAdminNotifications / useGroomerNotifications can
   *  still poll, but the UI suppresses the red unread dot. */
  showUnreadDot:          boolean;
  /** Whether to play a soft chime when a new notification arrives.
   *  Off by default — coordinators often work in shared offices. */
  soundOnNotification:    boolean;

  // ── Appearance ──
  textSize:               TextSize;
  reduceMotion:           boolean;
  /** Compact rows in long lists (sessions, customers).  Off by default
   *  because Sniffy's lists are touch-targets first. */
  compactLists:           boolean;

  // ── PWA / app behaviour ──
  /** "Pull to refresh" hint shown at the top of long-scroll tabs. */
  showPullToRefreshHint:  boolean;
  /** Force a hard reload (skip waiting SW) when an update is detected
   *  instead of waiting for the next navigation. */
  autoApplyUpdates:       boolean;

  // ── Privacy ──
  /** When false, recently-viewed customer chips are not persisted across
   *  sessions.  Helpful on shared devices. */
  rememberRecents:        boolean;
}

const DEFAULTS: UserSettings = {
  notifyNewBookings:        true,
  notifyFollowupsDue:       true,
  notifyMilestoneApprovals: true,
  notifySessionUpdates:     true,
  notifyPaymentEvents:      true,
  showUnreadDot:            true,
  soundOnNotification:      false,

  textSize:                 'normal',
  reduceMotion:             false,
  compactLists:             false,

  showPullToRefreshHint:    true,
  autoApplyUpdates:         true,

  rememberRecents:          true,
};

function keyFor(userId: string, field: keyof UserSettings): string {
  return `${STORAGE_PREFIX}::${userId}::${field}`;
}

// ─── Read / write ───────────────────────────────────────────────

/** Read the merged settings object for `userId`.  Always returns a
 *  fully-populated object — missing keys fall back to DEFAULTS. */
export function readSettings(userId: string): UserSettings {
  const out: UserSettings = { ...DEFAULTS };
  if (!userId) return out;
  try {
    (Object.keys(DEFAULTS) as Array<keyof UserSettings>).forEach((k) => {
      const raw = localStorage.getItem(keyFor(userId, k));
      if (raw === null) return;
      try {
        const parsed = JSON.parse(raw);
        // Best-effort type guard — anything malformed falls back to default
        if (typeof parsed === typeof DEFAULTS[k]) {
          (out as unknown as Record<string, unknown>)[k] = parsed;
        }
      } catch { /* keep default */ }
    });
  } catch { /* localStorage unavailable */ }
  return out;
}

/** Write a single preference.  Cheap enough to call on every toggle. */
export function writeSetting<K extends keyof UserSettings>(
  userId: string, field: K, value: UserSettings[K],
): void {
  if (!userId) return;
  try {
    localStorage.setItem(keyFor(userId, field), JSON.stringify(value));
    // Display-affecting keys re-apply immediately so the UI updates
    // without waiting for the Settings page to re-mount.
    if (field === 'textSize' || field === 'reduceMotion') {
      applyDisplaySettings(readSettings(userId));
    }
  } catch { /* quota / blocked */ }
}

/** Wipe every preference for a user — used by the "Reset to defaults"
 *  button on the Settings page. */
export function resetSettings(userId: string): void {
  if (!userId) return;
  try {
    (Object.keys(DEFAULTS) as Array<keyof UserSettings>).forEach((k) => {
      localStorage.removeItem(keyFor(userId, k));
    });
    applyDisplaySettings(DEFAULTS);
  } catch { /* ignore */ }
}

// ─── Display side-effects ───────────────────────────────────────

/** Apply text size + reduce-motion to <html>.  CSS in index.css /
 *  Tailwind can target `data-text-size` and `data-reduce-motion`. */
export function applyDisplaySettings(s: UserSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  // Scale the root font size — Tailwind rem units pick this up
  // automatically, so every text-* class shrinks/grows with the user
  // choice.  16 = browser default.
  const pxByMode: Record<TextSize, number> = { small: 14, normal: 16, large: 18 };
  root.style.fontSize = `${pxByMode[s.textSize]}px`;
  root.dataset.textSize = s.textSize;

  if (s.reduceMotion) {
    root.dataset.reduceMotion = '1';
  } else {
    delete root.dataset.reduceMotion;
  }
}

/** Boot-time hook called from main.tsx so the user's text-size and
 *  reduce-motion choices apply before React paints.  We default to the
 *  *admin* session, falling back to the groomer session, so the right
 *  user's preferences win on a shared device. */
export function bootApplyForActiveSession(): void {
  if (typeof window === 'undefined') return;
  try {
    const candidates = ['sniffy_admin_user', 'sniffy_groomer_user'];
    for (const k of candidates) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const uid: string | undefined = parsed?.user?.id ?? parsed?.id;
      if (uid) {
        applyDisplaySettings(readSettings(uid));
        return;
      }
    }
  } catch { /* ignore — fall through to defaults */ }
  applyDisplaySettings(DEFAULTS);
}

// ─── App-version helpers (used by Settings "About") ─────────────

/** Best-effort app version string.  Falls back to a build-time stamp
 *  so the user can quote it to support. */
export function appVersionLabel(): string {
  // Vite injects these at build time when present in the env.
  const v = import.meta.env.VITE_APP_VERSION as string | undefined;
  const sha = import.meta.env.VITE_COMMIT_SHA as string | undefined;
  if (v && sha) return `v${v} · ${sha.slice(0, 7)}`;
  if (v) return `v${v}`;
  // Fallback — yyyy.mm.dd of when the JS bundle was loaded.
  const d = new Date();
  return `build ${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
