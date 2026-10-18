/**
 * admin/sessionsCache.ts — one shared `grooming_sessions` snapshot
 *
 * ── Why this exists ──────────────────────────────────────────────────
 *
 * Overview, Sessions, Calendar and Analytics each used to run their own
 *
 *     supabase.from('grooming_sessions').select('*')
 *
 * on mount.  Because AdminDashboard renders tabs conditionally
 * (`activeTab === 'x' && <Tab/>`), every tab switch unmounts the old tab
 * and remounts the new one — so a coordinator bouncing
 * Overview → Sessions → Calendar → Overview pulled the entire table four
 * times in a few seconds.  That's the single biggest reason the dashboard
 * felt sluggish: each hop paid a full network round-trip plus a JSON parse
 * of every column of every row before anything rendered.
 *
 * This module keeps exactly one snapshot in module scope and hands it to
 * whoever asks:
 *
 *   • **Instant paint** — a remount reads the cached array synchronously,
 *     so returning to a tab shows data immediately instead of a skeleton.
 *   • **Stale-while-revalidate** — if the snapshot is older than TTL_MS we
 *     still return it right away and refresh in the background, swapping
 *     the rows in when the response lands.
 *   • **In-flight dedupe** — two tabs mounting in the same tick share one
 *     request instead of firing two.
 *   • **Broadcast** — a refresh updates every mounted consumer at once, so
 *     the Calendar and the Sessions list can't drift apart.
 *
 * ── Writes ───────────────────────────────────────────────────────────
 *
 * Anything that mutates a session must tell the cache, or other tabs will
 * keep showing the pre-edit snapshot until the TTL lapses:
 *
 *   • `refreshSessions()`     — refetch now and broadcast (use after an
 *                               insert/delete, or when the user pulls to
 *                               refresh).
 *   • `patchCachedSession()`  — apply a local edit to the shared snapshot
 *                               without a round-trip (use alongside the
 *                               optimistic updates the tabs already do).
 *   • `removeCachedSession()` — drop a row after a successful delete.
 *   • `invalidateSessions()`  — mark stale; the next mount refetches.
 *
 * The TTL is deliberately short.  This is a coordination dashboard where
 * several people write concurrently, so the goal is "don't refetch four
 * times in ten seconds", not "cache for minutes".
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { GroomingSession } from './types';

/** How long a snapshot is considered fresh.  Within this window a tab
 *  mount is served purely from memory with no network call at all. */
const TTL_MS = 45_000;

type Snapshot = { rows: GroomingSession[]; at: number };

let snapshot: Snapshot | null = null;
let inflight: Promise<GroomingSession[]> | null = null;

/** Mounted consumers, notified whenever the snapshot changes. */
const subscribers = new Set<(rows: GroomingSession[]) => void>();

function broadcast(rows: GroomingSession[]) {
  subscribers.forEach(fn => fn(rows));
}

function isFresh(): boolean {
  return snapshot != null && Date.now() - snapshot.at < TTL_MS;
}

/**
 * Canonical fetch — newest session first, matching the ordering the tabs
 * used before this module existed.  Consumers wanting chronological order
 * use `toAscending()` below rather than issuing a second query.
 */
async function fetchFromDb(): Promise<GroomingSession[]> {
  const { data, error } = await supabase
    .from('grooming_sessions')
    .select('*')
    .order('session_date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as GroomingSession[];
}

/**
 * Fetch, deduping concurrent callers onto a single request.  Resolves with
 * the rows and updates the shared snapshot as a side effect.
 */
function loadShared(): Promise<GroomingSession[]> {
  if (inflight) return inflight;

  inflight = fetchFromDb()
    .then(rows => {
      snapshot = { rows, at: Date.now() };
      broadcast(rows);
      return rows;
    })
    .finally(() => { inflight = null; });

  return inflight;
}

// ─── Imperative API (for code outside React components) ──────────────

/** Current snapshot without triggering a fetch.  `null` if never loaded. */
export function peekCachedSessions(): GroomingSession[] | null {
  return snapshot?.rows ?? null;
}

/** Mark the snapshot stale so the next consumer refetches. */
export function invalidateSessions(): void {
  snapshot = null;
}

/** Refetch immediately and push the result to every mounted consumer. */
export function refreshSessions(): Promise<GroomingSession[]> {
  snapshot = null;
  return loadShared();
}

/**
 * Merge a partial update into one cached row.  Lets a tab that already
 * did an optimistic local update keep the shared snapshot in step without
 * a network round-trip.  No-ops when nothing is cached yet.
 */
export function patchCachedSession(id: string, patch: Partial<GroomingSession>): void {
  if (!snapshot) return;
  const rows = snapshot.rows.map(s => (s.id === id ? { ...s, ...patch } : s));
  snapshot = { rows, at: snapshot.at };
  broadcast(rows);
}

/** Drop a row from the snapshot (after a confirmed delete). */
export function removeCachedSession(id: string): void {
  if (!snapshot) return;
  const rows = snapshot.rows.filter(s => s.id !== id);
  snapshot = { rows, at: snapshot.at };
  broadcast(rows);
}

/** Replace the whole snapshot — used when a tab has already fetched a
 *  fresh list itself and wants the rest of the dashboard to see it. */
export function setCachedSessions(rows: GroomingSession[]): void {
  snapshot = { rows, at: Date.now() };
  broadcast(rows);
}

// ─── React hook ──────────────────────────────────────────────────────

export interface UseSessionsResult {
  sessions: GroomingSession[];
  /** True only on a genuinely cold start (nothing cached to show yet).
   *  A background revalidation leaves this false so the UI doesn't flash
   *  a skeleton over data that's already on screen. */
  loading: boolean;
  /** True while a background revalidation is in flight. */
  refreshing: boolean;
  error: string | null;
  /** Force a refetch and broadcast (e.g. after a create/delete). */
  refresh: () => Promise<void>;
}

/**
 * Subscribe to the shared session snapshot.
 *
 * Returns cached rows synchronously on mount when they exist, so switching
 * back to a previously-visited tab paints instantly.
 */
export function useSessions(): UseSessionsResult {
  const [sessions, setSessions] = useState<GroomingSession[]>(() => snapshot?.rows ?? []);
  const [loading, setLoading]   = useState(() => snapshot == null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const onRows = (rows: GroomingSession[]) => {
      if (!alive) return;
      setSessions(rows);
      setLoading(false);
    };
    subscribers.add(onRows);

    // Adopt whatever is cached right now (another tab may have loaded it
    // between our useState initialiser and this effect).
    if (snapshot) {
      setSessions(snapshot.rows);
      setLoading(false);
    }

    // Fresh snapshot → nothing to do.  Otherwise revalidate; the request
    // is deduped, so several tabs mounting together still make one call.
    if (!isFresh()) {
      setRefreshing(true);
      loadShared()
        .then(() => { if (alive) setError(null); })
        .catch(err => {
          if (!alive) return;
          setError(err instanceof Error ? err.message : 'Could not load sessions.');
          setLoading(false);
        })
        .finally(() => { if (alive) setRefreshing(false); });
    }

    return () => { alive = false; subscribers.delete(onRows); };
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshSessions();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh sessions.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { sessions, loading, refreshing, error, refresh };
}

/**
 * Chronological (oldest-first) view of a newest-first array.
 *
 * The Calendar wants ascending dates while everything else wants
 * descending.  Reversing the shared snapshot is far cheaper than a second
 * network query, and callers should wrap this in `useMemo` (or use
 * `useSessionsAscending` below, which does it for them).
 */
export function toAscending(rows: GroomingSession[]): GroomingSession[] {
  return rows.slice().reverse();
}

/** `useSessions()` with the rows flipped to oldest-first. */
export function useSessionsAscending(): UseSessionsResult {
  const base = useSessions();
  const ascending = useMemo(() => toAscending(base.sessions), [base.sessions]);
  return { ...base, sessions: ascending };
}
