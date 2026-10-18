/**
 * groomerAuthStore.ts — Auth for Groomer Portal.
 *
 * Groomers log in with their own credentials and only see their own sessions.
 * Completely separate from admin authStore — no shared session key.
 *
 * To add groomers: edit GROOMERS below (or pull from .env via VITE_GROOMER_PASS_*).
 * The groomer_id here must match the `groomer_id` column in the groomings table.
 */

export interface GroomerUser {
  id: string;           // matches groomer_id in groomings table
  name: string;
  username: string;
  password: string;
  phone: string;
  avatarInitials: string;
}

// ─── Groomer registry ────────────────────────────────────────────────────────
// Add a row here for every groomer who should be able to log in.
// The `id` field MUST match the groomer_id stored in your groomings table.
export const GROOMERS: GroomerUser[] = [
  {
    id: 'groomer-1',
    name: 'Ravi Sharma',
    username: 'ravi',
    password: import.meta.env.VITE_GROOMER_PASS_RAVI ?? 'Sniffy@ravi',
    phone: '',
    avatarInitials: 'RS',
  },
  {
    id: 'groomer-2',
    name: 'Priya Patil',
    username: 'priya',
    password: import.meta.env.VITE_GROOMER_PASS_PRIYA ?? 'Sniffy@priya',
    phone: '',
    avatarInitials: 'PP',
  },
  // Add more groomers here…
];

// ─── Session key — different from admin's SESSION_KEY ────────────────────────
//
// Strict isolation between portals: this key is read/written ONLY here in the
// groomer store, and the admin store (admin/authStore.ts) reads/writes ONLY
// `sniffy_admin_user`.  The admin store's loginUser routes writes by role —
// a coordinator/admin/viewer never ends up in this key, and a groomer never
// ends up in `sniffy_admin_user`.  So a groomer can't accidentally surface
// admin/coordinator content here even if both portals are used in the same
// browser.
//
// Defense in depth (see isGroomerLike below): even if some future bug were
// to write a non-groomer payload to this key, getGroomerSession() refuses
// to return it and wipes the slot.
const SESSION_KEY = 'sniffy_groomer_user';

/**
 * Runtime sanity check for whatever we just pulled out of storage.
 *
 * Reject if:
 *   • the value isn't a plain object with a non-empty `id` + `username`
 *     (corrupted / unrelated payload), or
 *   • a `role` field is present and isn't 'groomer' (something wrote an
 *     admin/coordinator/viewer object into our key — we refuse to honor
 *     it so the groomer portal can never display an admin session).
 *
 * Returning `false` causes the caller to clear the slot.
 */
function isGroomerLike(u: unknown): boolean {
  if (!u || typeof u !== 'object') return false;
  const o = u as Record<string, unknown>;
  if (typeof o.id !== 'string' || !o.id) return false;
  if (typeof o.username !== 'string' || !o.username) return false;
  // role is optional on GroomerUser, but if it leaked in from an admin-shaped
  // payload it MUST be 'groomer'.  Anything else = wrong portal, refuse.
  if ('role' in o && o.role !== undefined && o.role !== 'groomer') return false;
  return true;
}

// Persist the session in localStorage so installed PWAs and plain
// browser tabs keep the groomer signed in across reloads and app
// restarts.  Previously this used sessionStorage, which is wiped
// the moment the tab/PWA is closed and forced a re-login on every
// refresh — coordinator/admin already do it the right way over in
// admin/authStore.ts, this brings groomer to parity.
//
// We wrap the payload with a `savedAt` timestamp and expire after
// 90 days, so abandoned devices don't keep a live session forever.
// Bump the TTL or rename SESSION_KEY to force a global re-auth.
const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;

interface StoredSession { user: GroomerUser; savedAt: number; }

function writeStored(user: GroomerUser) {
  const wrapped: StoredSession = { user, savedAt: Date.now() };
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(wrapped)); } catch { /* quota / blocked */ }
  // Drop any legacy sessionStorage record so we don't read stale data.
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

function clearStored() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

function readStored(): GroomerUser | null {
  try {
    // Prefer localStorage. Fall back to legacy sessionStorage for
    // groomers who were mid-session when this change shipped — and
    // migrate the record forward so the very next reload uses the
    // persistent copy.
    let raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      const legacy = sessionStorage.getItem(SESSION_KEY);
      if (legacy) {
        try {
          const legacyUser = JSON.parse(legacy) as GroomerUser;
          const wrapped: StoredSession = { user: legacyUser, savedAt: Date.now() };
          localStorage.setItem(SESSION_KEY, JSON.stringify(wrapped));
          sessionStorage.removeItem(SESSION_KEY);
          raw = JSON.stringify(wrapped);
        } catch { /* ignore malformed legacy */ }
      }
    }
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // New wrapped shape: { user, savedAt }
    if (parsed && parsed.user && typeof parsed.savedAt === 'number') {
      if (Date.now() - parsed.savedAt > SESSION_TTL_MS) {
        clearStored();
        return null;
      }
      // Isolation guard — refuse anything that doesn't look like a
      // groomer payload (see isGroomerLike).  Wipes the slot so a bad
      // write can't keep poisoning subsequent reads.
      if (!isGroomerLike(parsed.user)) {
        clearStored();
        return null;
      }
      return parsed.user as GroomerUser;
    }

    // Legacy unwrapped shape: just the user object — rewrap it forward,
    // but only if it passes the same isolation guard.
    if (!isGroomerLike(parsed)) {
      clearStored();
      return null;
    }
    const user = parsed as GroomerUser;
    writeStored(user);
    return user;
  } catch {
    return null;
  }
}

export function groomerLogin(username: string, password: string): GroomerUser | null {
  const user = GROOMERS.find(
    g =>
      g.username.toLowerCase() === username.toLowerCase().trim() &&
      g.password === password
  );
  if (!user) return null;
  writeStored(user);
  return user;
}

export function getGroomerSession(): GroomerUser | null {
  return readStored();
}

export function groomerLogout() {
  // Touches ONLY the groomer session key — never the admin one, so
  // logging out of the groomer portal can't sign anyone out of the
  // back office that happens to share the same browser profile.
  clearStored();
}
