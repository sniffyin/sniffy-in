/**
 * authStore.ts — Role-based auth for Sniffy Admin + Groomer Portal.
 */

export type Role = 'admin' | 'coordinator' | 'viewer' | 'groomer';

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  password: string;
  role: Role;
  avatarInitials: string;
  groomer_id?: string;  // required when role === 'groomer'; must match `id` in Supabase groomers table
}

export const USERS: AdminUser[] = [

  // ── Admin / staff ────────────────────────────────────────────────────────
  {
    id: 'u1',
    name: 'Jitendra',
    username: 'jitendra',
    password: import.meta.env.VITE_PASS_JITENDRA ?? 'Sniffy@jitendra',
    role: 'admin',
    avatarInitials: 'JI',
  },
  // {
  //   id: 'u2',
  //   name: 'Sidharth',
  //   username: 'sidharth',
  //   password: import.meta.env.VITE_PASS_SIDHARTH ?? 'Sniffy@sidharth',
  //   role: 'viewer',
  //   avatarInitials: 'SI',
  // },
  {
    id: 'u3',
    name: 'Nikita',
    username: 'nikita',
    password: import.meta.env.VITE_PASS_PRIYA ?? 'Sniffy@nikita',
    role: 'coordinator',
    avatarInitials: 'NI',
  },

  // ── Groomers ─────────────────────────────────────────────────────────────
  // groomer_id MUST match the `id` (UUID) in your Supabase `groomers` table
  {
    id: 'g1',
    name: 'Hemant',
    username: 'hemant',
    password: import.meta.env.VITE_GROOMER_PASS_HEMANT ?? 'Sniffy@hemant',
    role: 'groomer',
    avatarInitials: 'HE',
    groomer_id: 'f9231873-0c21-47f9-a71b-e219a5a5b713',
  },
  {
    id: 'g2',
    name: 'Rakesh',
    username: 'rakesh',
    password: import.meta.env.VITE_GROOMER_PASS_HEMANT ?? 'Sniffy@rakesh',
    role: 'groomer',
    avatarInitials: 'RA',
    groomer_id: '7b787079-518f-4baa-b7dc-b1051e035345',
  },
  {
    id: 'g3',
    name: 'Sidharth',
    username: 'sidharth',
    password: import.meta.env.VITE_GROOMER_PASS_SIDHARTH ?? 'Sniffy@sidharth',
    role: 'groomer',
    avatarInitials: 'SN',
    groomer_id: '56a28548-7636-45ec-a3c5-6f20b28a390a',
  },
  // Add more groomers by copying the block above.
  // Get the UUID from Supabase → groomers table → id column.
];

const ADMIN_SESSION_KEY   = 'sniffy_admin_user';
const GROOMER_SESSION_KEY = 'sniffy_groomer_user';

// Persist sessions in localStorage so installed PWAs keep the user
// signed in across app restarts (sessionStorage is wiped the moment
// the app is closed, which forced a re-login every time).
//
// We wrap the stored payload with a `savedAt` timestamp and expire
// after 90 days, so abandoned devices don't keep a live session
// forever. Bump the TTL or the storage keys to force a global
// re-auth.
const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;

interface StoredSession { user: AdminUser; savedAt: number; }

function sessionKeyFor(role: Role): string {
  return role === 'groomer' ? GROOMER_SESSION_KEY : ADMIN_SESSION_KEY;
}

function readStored(key: string): AdminUser | null {
  try {
    // Prefer localStorage. Fall back to legacy sessionStorage for users
    // who were mid-session when this change shipped — and migrate the
    // record forward so the very next reload uses the persistent copy.
    let raw = localStorage.getItem(key);
    if (!raw) {
      const legacy = sessionStorage.getItem(key);
      if (legacy) {
        try {
          const legacyUser = JSON.parse(legacy) as AdminUser;
          const wrapped: StoredSession = { user: legacyUser, savedAt: Date.now() };
          localStorage.setItem(key, JSON.stringify(wrapped));
          sessionStorage.removeItem(key);
          raw = JSON.stringify(wrapped);
        } catch { /* ignore malformed legacy */ }
      }
    }
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // New wrapped shape: { user, savedAt }
    if (parsed && parsed.user && typeof parsed.savedAt === 'number') {
      if (Date.now() - parsed.savedAt > SESSION_TTL_MS) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.user as AdminUser;
    }

    // Legacy unwrapped shape: just the user object — rewrap it forward.
    const user = parsed as AdminUser;
    const wrapped: StoredSession = { user, savedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(wrapped));
    return user;
  } catch {
    return null;
  }
}

function writeStored(key: string, user: AdminUser) {
  const wrapped: StoredSession = { user, savedAt: Date.now() };
  try { localStorage.setItem(key, JSON.stringify(wrapped)); } catch { /* quota / blocked */ }
  // Drop any legacy sessionStorage record so we don't read stale data.
  try { sessionStorage.removeItem(key); } catch {}
}

function clearStored(key: string) {
  try { localStorage.removeItem(key); } catch {}
  try { sessionStorage.removeItem(key); } catch {}
}

export function loginUser(username: string, password: string, preferRole?: string): AdminUser | null {
  const matches = USERS.filter(
    u =>
      u.username.toLowerCase() === username.toLowerCase().trim() &&
      u.password === password
  );
  if (!matches.length) return null;
  // When called from the groomer portal, prefer the groomer-role entry so a
  // duplicate username (e.g. viewer + groomer) resolves to the right account.
  const user = preferRole
    ? (matches.find(u => u.role === preferRole) ?? matches[0])
    : matches[0];
  writeStored(sessionKeyFor(user.role), user);
  return user;
}

export function getSessionUser(): AdminUser | null {
  return readStored(ADMIN_SESSION_KEY);
}

export function getGroomerSession(): AdminUser | null {
  return readStored(GROOMER_SESSION_KEY);
}

export function logoutUser()    { clearStored(ADMIN_SESSION_KEY); }
export function groomerLogout() { clearStored(GROOMER_SESSION_KEY); }

export function canDelete(user: AdminUser): boolean        { return user.role === 'admin'; }
export function canWrite(user: AdminUser): boolean         { return user.role === 'admin' || user.role === 'coordinator'; }
export function canManageGroomers(user: AdminUser): boolean { return user.role === 'admin'; }

export function roleLabel(role: Role): string {
  const map: Record<Role, string> = { admin: 'Admin', coordinator: 'Coordinator', viewer: 'Viewer', groomer: 'Groomer' };
  return map[role];
}
