/**
 * notifications.ts — Supabase-backed, inbox-style notification feeds.
 *
 *   useAdminNotifications(userId)      → coordinator feed
 *   useGroomerNotifications(groomerId) → groomer feed
 *
 * Both return a stable `NotificationFeed`:
 *   { items, unreadCount, loading, error,
 *     refresh, markAsRead, markAllRead }
 *
 * Read model — DB-backed, localStorage-cached
 * --------------------------------------------
 * Until now, "read" lived only in `localStorage` — which got cleared by
 * incognito tabs, "delete cookies on exit", PWA reinstalls, and never
 * synced between phone and laptop.  The proper fix is a small Supabase
 * table; see migration 20260517000000_notification_reads.sql.
 *
 *   • On refresh: fetch live notifications + read rows in parallel.
 *   • On markAsRead: optimistically update UI, upsert row in DB
 *     (fire-and-forget — the UI doesn't wait).
 *   • On markAllRead: same, but upserts in bulk.
 *   • localStorage acts as an OFFLINE FAST-BOOTSTRAP CACHE.  When the
 *     bell opens we render last-known read state instantly from cache,
 *     then reconcile with the DB once the query lands.  Network
 *     hiccups or stale tokens don't drop you back to "everything is
 *     unread again".
 *   • Garbage collection: on each refresh we lazily delete read rows
 *     whose notification_id is no longer in the live feed.  Bounded
 *     storage on the DB side too.
 *
 * Item identity
 * -------------
 *   arrival-<sessionId>          (admin: pending arrival bonus)
 *   review-<sessionId>           (admin: pending review claim)
 *   followups-due                (admin: bundled overdue + due-today)
 *   booking-<bookingId>          (admin: new website booking)
 *   leave-<leaveId>              (admin: pending groomer leave request)
 *   helperapp-<id>               (admin: pending helper application → groomers tab)
 *   todo-<todoId>                (admin: own "My List" reminder now due)
 *   assigned-<sessionId>         (groomer: new session in 24h)
 *   today-<sessionId>            (groomer: today, not arrived)
 *   payment-<sessionId>          (groomer: completed, no payment)
 *   arrival-outcome-<sessionId>  (groomer: bonus approved/rejected)
 *   review-outcome-<sessionId>   (groomer: review approved/rejected)
 *
 * Why not realtime?
 * -----------------
 * Polling (60s) + window-focus refresh covers the day-to-day workflow.
 * Wire Supabase Realtime later by subscribing to grooming_sessions /
 * bookings / groomer_leaves and calling `refresh()` on any event — the
 * read-state path is already DB-backed so it composes well.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from './supabase';
import { REVIEW_BONUS } from '../pages/groomer/incentivesApi';

// ─── Public types ────────────────────────────────────────────

export type NotificationAccent = 'purple' | 'amber' | 'green' | 'red' | 'blue';

export interface NotificationAction {
  tab: string;
  sessionId?: string;
  bookingId?: string;
  leaveId?: string;
  filter?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body?: string;
  at: string;
  accent: NotificationAccent;
  action?: NotificationAction;
  /** Decorated by the hook — read-only for consumers. */
  read?: boolean;
}

export interface NotificationFeed {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
}

// ─── Cache layer (localStorage) ─────────────────────────────
//
// Pure cache — never the source of truth.  We use it to render read
// state instantly on cold start so the bell doesn't flash "all unread"
// for the 200ms it takes to query Supabase.

const CACHE_KEY_PREFIX = 'sniffy.notifications.read.v3.';

function cacheKey(userKey: string): string {
  return `${CACHE_KEY_PREFIX}${userKey}`;
}

function loadCache(userKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(cacheKey(userKey));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((x: unknown) => typeof x === 'string'));
    }
  } catch { /* corrupt — start fresh */ }
  return new Set();
}

function persistCache(userKey: string, set: Set<string>): void {
  try {
    localStorage.setItem(cacheKey(userKey), JSON.stringify([...set]));
  } catch { /* localStorage disabled — non-fatal */ }
}

// ─── DB layer ────────────────────────────────────────────────

interface ReadRow { notification_id: string; }

async function fetchDbReads(userKey: string): Promise<Set<string> | null> {
  const { data, error } = await supabase
    .from('notification_reads')
    .select('notification_id')
    .eq('user_key', userKey);
  if (error) {
    console.warn('[notifications] fetchDbReads failed, will use cache', error);
    return null;
  }
  return new Set(((data ?? []) as ReadRow[]).map(r => r.notification_id));
}

async function dbMarkRead(userKey: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const now = new Date().toISOString();
  const rows = ids.map(id => ({
    user_key: userKey,
    notification_id: id,
    read_at: now,
  }));
  const { error } = await supabase
    .from('notification_reads')
    .upsert(rows, { onConflict: 'user_key,notification_id' });
  if (error) {
    console.warn('[notifications] dbMarkRead failed (cache will keep state)', error);
  }
}

async function dbPruneDead(userKey: string, deadIds: string[]): Promise<void> {
  if (deadIds.length === 0) return;
  // Chunk to avoid URL-length limits — Supabase JS will pack ids into a
  // GET filter so we keep batches modest.
  const CHUNK = 50;
  for (let i = 0; i < deadIds.length; i += CHUNK) {
    const slice = deadIds.slice(i, i + CHUNK);
    const { error } = await supabase
      .from('notification_reads')
      .delete()
      .eq('user_key', userKey)
      .in('notification_id', slice);
    if (error) {
      console.warn('[notifications] dbPruneDead chunk failed', error);
      return;
    }
  }
}

// ─── Visual helpers ─────────────────────────────────────────

export function accentColor(a: NotificationAccent): string {
  switch (a) {
    case 'purple': return '#7c3aed';
    case 'amber':  return '#f6ac0a';
    case 'green':  return '#10b981';
    case 'red':    return '#ef4444';
    case 'blue':   return '#3b82f6';
  }
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec  = Math.floor(diff / 1000);
  if (sec < 30) return 'now';
  const min  = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr   = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day  = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk   = Math.floor(day / 7);
  return `${wk}w ago`;
}

// ─── Feed builder ────────────────────────────────────────────

const POLL_INTERVAL_MS = 60_000;

function useFeed(
  userKey: string,
  fetcher: () => Promise<AppNotification[]>,
): NotificationFeed {
  const [items,    setItems]    = useState<AppNotification[]>([]);
  const [readSet,  setReadSet]  = useState<Set<string>>(() => loadCache(userKey));
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // Re-bootstrap cache when userKey changes (different login).
  useEffect(() => {
    setReadSet(loadCache(userKey));
  }, [userKey]);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async () => {
    setError(null);
    try {
      // Kick off both fetches in parallel — most of the time both finish
      // within a single round-trip.
      const [raw, dbReadsResult] = await Promise.all([
        fetcherRef.current(),
        fetchDbReads(userKey),
      ]);

      setItems(raw);

      // Reconcile read set:
      //   - DB wins if reachable.
      //   - Otherwise keep current cache (which we bootstrapped from
      //     localStorage) so we don't accidentally show everything as
      //     unread because the DB query 503'd for one cycle.
      if (dbReadsResult) {
        // Prune cache to liveIds ∩ dbReads — cache stays bounded.
        const liveIds = new Set(raw.map(n => n.id));
        const next = new Set<string>();
        for (const id of dbReadsResult) {
          if (liveIds.has(id)) next.add(id);
        }
        setReadSet(next);
        persistCache(userKey, next);

        // Garbage-collect dead DB rows (fire-and-forget).
        const dead = [...dbReadsResult].filter(id => !liveIds.has(id));
        if (dead.length > 0) {
          dbPruneDead(userKey, dead).catch(() => {});
        }
      }
      // If DB read failed, retain whatever readSet we already had.
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [userKey]);

  // Initial fetch + when userKey changes
  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  // Re-fetch when the tab regains focus
  useEffect(() => {
    function onFocus() { refresh(); }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  // Polling
  useEffect(() => {
    const id = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  // ── Mark actions: optimistic + DB write ─────────────────
  // We update local state first so the UI snaps instantly.  The DB
  // write runs in the background; on failure the cache still holds.

  const markAsRead = useCallback((id: string) => {
    setReadSet(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persistCache(userKey, next);
      return next;
    });
    // Fire-and-forget DB upsert
    dbMarkRead(userKey, [id]).catch(() => {});
  }, [userKey]);

  const markAllRead = useCallback(() => {
    let newlyRead: string[] = [];
    setReadSet(prev => {
      const next = new Set(prev);
      for (const n of items) {
        if (!next.has(n.id)) {
          next.add(n.id);
          newlyRead.push(n.id);
        }
      }
      if (newlyRead.length > 0) persistCache(userKey, next);
      return newlyRead.length > 0 ? next : prev;
    });
    if (newlyRead.length > 0) {
      dbMarkRead(userKey, newlyRead).catch(() => {});
    }
  }, [items, userKey]);

  const decorated = useMemo(
    () => items.map(n => ({ ...n, read: readSet.has(n.id) })),
    [items, readSet],
  );

  const unread = useMemo(
    () => decorated.filter(n => !n.read).length,
    [decorated],
  );

  return {
    items: decorated,
    unreadCount: unread,
    loading,
    error,
    refresh,
    markAsRead,
    markAllRead,
  };
}

// ─── Admin / coordinator feed ────────────────────────────────

interface ArrivalRow {
  id: string;
  pet_parent_name: string | null;
  arrival_marked_at: string | null;
  groomer_name: string | null;
  session_date: string;
}

interface ReviewRow {
  id: string;
  pet_parent_name: string | null;
  review_claim_at: string | null;
  review_claim_rating: number | null;
  groomer_name: string | null;
}

interface FollowupRow {
  id: string;
  pet_parent_name: string | null;
  next_due_date: string | null;
}

interface BookingRow {
  id: string;
  name: string;
  package: string;
  city: string | null;
  created_at: string;
}

interface LeaveRow {
  id: string;
  groomer_name: string;
  leave_date: string;
  reason: string | null;
  created_at: string;
}

interface TodoRow {
  id: string;
  title: string;
  due_at: string;
  all_day: boolean;
  link_label: string | null;
}

export function useAdminNotifications(userId: string): NotificationFeed {
  const fetcher = useCallback(async (): Promise<AppNotification[]> => {
    const todayStr   = new Date().toISOString().slice(0, 10);
    const dayAgoIso  = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    // Reminders surface a few minutes early — a "call at 4:30" nudge that
    // arrives at 4:30 sharp is already late.
    const soonIso    = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const [arrivalsRes, reviewsRes, followupsRes, bookingsRes, leavesRes, todosRes, helperAppsRes] = await Promise.all([
      supabase
        .from('grooming_sessions')
        .select('id, pet_parent_name, arrival_marked_at, groomer_name, session_date')
        .eq('arrival_bonus_status', 'pending')
        .order('arrival_marked_at', { ascending: false })
        .limit(20),

      supabase
        .from('grooming_sessions')
        .select('id, pet_parent_name, review_claim_at, review_claim_rating, groomer_name')
        .eq('review_claim_status', 'pending')
        .order('review_claim_at', { ascending: false })
        .limit(20),

      supabase
        .from('grooming_sessions')
        .select('id, pet_parent_name, next_due_date')
        // Delivered work, settled or not — the follow-up is due either way.
        .in('status', ['completed', 'grooming_done'])
        .not('next_due_date', 'is', null)
        .lte('next_due_date', todayStr)
        .order('next_due_date', { ascending: true })
        .limit(50),

      supabase
        .from('bookings')
        .select('id, name, package, city, created_at')
        .gte('created_at', dayAgoIso)
        .order('created_at', { ascending: false })
        .limit(10),

      // Pending groomer leave requests — needs coordinator approval.
      supabase
        .from('groomer_leaves')
        .select('id, groomer_name, leave_date, reason, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20),

      // "My List" reminders that have come due — scoped to this user's own
      // list. If the admin_todos migration hasn't been pushed yet this query
      // just errors into `data: null`, which the `?? []` below absorbs.
      supabase
        .from('admin_todos')
        .select('id, title, due_at, all_day, link_label')
        .eq('owner_key', userId)
        .eq('is_done', false)
        .not('due_at', 'is', null)
        .lte('due_at', soonIso)
        .order('due_at', { ascending: true })
        .limit(20),

      // Pending helper sign-ups. If the helper_applications migration isn't
      // pushed yet this errors into `data: null`, which the `?? []` absorbs.
      supabase
        .from('helper_applications')
        .select('id, full_name, areas, created_at')
        .eq('status', 'pending')
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const out: AppNotification[] = [];

    (arrivalsRes.data ?? []).forEach((r: ArrivalRow) => {
      out.push({
        id:    `arrival-${r.id}`,
        title: 'Arrival bonus pending approval',
        body:  `${r.groomer_name ?? 'Groomer'} · ${r.pet_parent_name ?? 'session'}`,
        at:    r.arrival_marked_at ?? new Date().toISOString(),
        accent: 'green',
        action: { tab: 'overview', sessionId: r.id },
      });
    });

    (reviewsRes.data ?? []).forEach((r: ReviewRow) => {
      const rating = r.review_claim_rating ?? 5;
      out.push({
        id:    `review-${r.id}`,
        title: 'Review claim pending approval',
        body:  `${r.groomer_name ?? 'Groomer'} · ${r.pet_parent_name ?? 'session'} · ${rating}★`,
        at:    r.review_claim_at ?? new Date().toISOString(),
        accent: 'amber',
        action: { tab: 'overview', sessionId: r.id },
      });
    });

    const followups = (followupsRes.data ?? []) as FollowupRow[];
    if (followups.length > 0) {
      const overdue  = followups.filter(f => (f.next_due_date ?? '') < todayStr).length;
      const dueToday = followups.length - overdue;
      const title    = followups.length === 1
        ? '1 follow-up due'
        : `${followups.length} follow-ups due${overdue > 0 ? ` (${overdue} overdue)` : ''}`;
      const body     = overdue > 0 && dueToday > 0
        ? `${overdue} overdue · ${dueToday} due today — tap to open the queue`
        : overdue > 0
          ? `Tap to open the overdue queue`
          : `Tap to open today's follow-ups`;
      const at = followups[0]?.next_due_date
        ? new Date(`${followups[0]!.next_due_date}T08:00:00`).toISOString()
        : new Date().toISOString();
      out.push({
        id:    'followups-due',
        title,
        body,
        at,
        accent: overdue > 0 ? 'red' : 'blue',
        action: { tab: 'followups' },
      });
    }

    (bookingsRes.data ?? []).forEach((r: BookingRow) => {
      out.push({
        id:    `booking-${r.id}`,
        title: 'New website booking',
        body:  `${r.name} · ${r.package}${r.city ? ` · ${r.city}` : ''}`,
        at:    r.created_at,
        accent: 'purple',
        action: { tab: 'bookings', bookingId: r.id },
      });
    });

    // Leave requests — coordinator approves in the calendar tab where
    // the Pending Leaves rail lives.
    (leavesRes.data ?? []).forEach((r: LeaveRow) => {
      // Pretty leave date for the body (avoids ISO).
      const d = new Date(`${r.leave_date}T00:00:00`);
      const dateStr = d.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
      const reasonSuffix = (r.reason ?? '').trim() ? ` — ${r.reason!.trim()}` : '';
      out.push({
        id:    `leave-${r.id}`,
        title: 'Leave request pending approval',
        body:  `${r.groomer_name} · ${dateStr}${reasonSuffix}`,
        at:    r.created_at,
        accent: 'amber',
        action: { tab: 'calendar', leaveId: r.id },
      });
    });

    // New helper applications — reviewed under Groomers → Helpers.
    (helperAppsRes.data ?? []).forEach((r: { id: string; full_name: string; areas: string[] | null; created_at: string }) => {
      out.push({
        id:    `helperapp-${r.id}`,
        title: 'New helper application',
        body:  `${r.full_name}${r.areas?.length ? ` · ${r.areas.slice(0, 2).join(', ')}` : ''}`,
        at:    r.created_at,
        accent: 'purple',
        action: { tab: 'groomers' },
      });
    });

    // Own reminders. Overdue ones go red; the rest are a gentle blue nudge.
    (todosRes.data ?? []).forEach((r: TodoRow) => {
      const due     = new Date(r.due_at);
      const overdue = due.getTime() < Date.now();
      const when    = r.all_day
        ? due.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        : due.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
      out.push({
        id:    `todo-${r.id}`,
        title: overdue ? 'Reminder overdue' : 'Reminder due',
        body:  `${r.title}${r.link_label ? ` · ${r.link_label}` : ''} · ${when}`,
        at:    r.due_at,
        accent: overdue ? 'red' : 'blue',
        action: { tab: 'overview' },
      });
    });

    out.sort((a, b) => b.at.localeCompare(a.at));
    return out;
  }, [userId]);

  return useFeed(`admin.${userId}`, fetcher);
}

// ─── Groomer feed ────────────────────────────────────────────

interface GroomerSessionRow {
  id: string;
  pet_parent_name: string | null;
  session_date: string;
  scheduled_time: string | null;
  package: string | null;
  booking_amount: number | null;
  created_at: string;
  arrival_marked_at: string | null;
  groomer_marked_complete_at: string | null;
  payment_collected_at: string | null;
  status: string;
  arrival_bonus_status: string | null;
  arrival_bonus_approved_at: string | null;
  arrival_bonus_rejected_note: string | null;
  review_claim_status: string | null;
  review_claim_approved_at: string | null;
  review_claim_rejected_note: string | null;
}

const GROOMER_COLS =
  'id, pet_parent_name, session_date, scheduled_time, package, created_at, status, ' +
  'arrival_marked_at, groomer_marked_complete_at, payment_collected_at, ' +
  'arrival_bonus_status, arrival_bonus_approved_at, arrival_bonus_rejected_note, ' +
  'review_claim_status, review_claim_approved_at, review_claim_rejected_note, ' +
  'booking_amount';

export function useGroomerNotifications(groomerId: string): NotificationFeed {
  const fetcher = useCallback(async (): Promise<AppNotification[]> => {
    if (!groomerId) return [];
    const todayStr     = new Date().toISOString().slice(0, 10);
    const dayAgoIso    = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const fortnightAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const [newAssignedRes, todayRes, paymentPendingRes, arrivalOutcomesRes, reviewOutcomesRes] = await Promise.all([
      supabase
        .from('grooming_sessions')
        .select(GROOMER_COLS)
        .eq('groomer_id', groomerId)
        .gte('created_at', dayAgoIso)
        .order('created_at', { ascending: false })
        .limit(10),

      supabase
        .from('grooming_sessions')
        .select(GROOMER_COLS)
        .eq('groomer_id', groomerId)
        .eq('session_date', todayStr)
        .is('arrival_marked_at', null)
        .neq('status', 'cancelled')
        .order('scheduled_time', { ascending: true })
        .limit(10),

      supabase
        .from('grooming_sessions')
        .select(GROOMER_COLS)
        .eq('groomer_id', groomerId)
        .not('groomer_marked_complete_at', 'is', null)
        .is('payment_collected_at', null)
        .order('groomer_marked_complete_at', { ascending: false })
        .limit(10),

      supabase
        .from('grooming_sessions')
        .select(GROOMER_COLS)
        .eq('groomer_id', groomerId)
        .in('arrival_bonus_status', ['approved', 'rejected'])
        .gte('arrival_bonus_approved_at', fortnightAgo)
        .order('arrival_bonus_approved_at', { ascending: false })
        .limit(10),

      supabase
        .from('grooming_sessions')
        .select(GROOMER_COLS)
        .eq('groomer_id', groomerId)
        .in('review_claim_status', ['approved', 'rejected'])
        .gte('review_claim_approved_at', fortnightAgo)
        .order('review_claim_approved_at', { ascending: false })
        .limit(10),
    ]);

    type Res = { data: GroomerSessionRow[] | null };
    const out: AppNotification[] = [];

    ((newAssignedRes as Res).data ?? []).forEach((r) => {
      const time = r.scheduled_time ? ` · ${r.scheduled_time.slice(0,5)}` : '';
      out.push({
        id:    `assigned-${r.id}`,
        title: 'New session assigned',
        body:  `${r.pet_parent_name ?? 'Pet parent'}${time} · ${r.package ?? 'Session'}`,
        at:    r.created_at,
        accent: 'purple',
        action: { tab: 'bookings', sessionId: r.id },
      });
    });

    ((todayRes as Res).data ?? []).forEach((r) => {
      const time = r.scheduled_time ? ` at ${r.scheduled_time.slice(0,5)}` : '';
      out.push({
        id:    `today-${r.id}`,
        title: 'Session today',
        body:  `${r.pet_parent_name ?? 'Pet parent'}${time}${r.package ? ` · ${r.package}` : ''}`,
        at:    new Date(`${todayStr}T07:00:00`).toISOString(),
        accent: 'blue',
        action: { tab: 'bookings', sessionId: r.id },
      });
    });

    ((paymentPendingRes as Res).data ?? []).forEach((r) => {
      const amount = (r.booking_amount ?? 0).toLocaleString('en-IN');
      out.push({
        id:    `payment-${r.id}`,
        title: 'Payment pending to collect',
        body:  `${r.pet_parent_name ?? 'Pet parent'} · ₹${amount}`,
        at:    r.groomer_marked_complete_at ?? new Date().toISOString(),
        accent: 'green',
        action: { tab: 'bookings', sessionId: r.id },
      });
    });

    ((arrivalOutcomesRes as Res).data ?? []).forEach((r) => {
      const approved = r.arrival_bonus_status === 'approved';
      out.push({
        id:    `arrival-outcome-${r.id}`,
        title: approved ? 'Arrival bonus approved' : 'Arrival bonus rejected',
        body:  approved
          ? `${r.pet_parent_name ?? 'Session'} — bonus credited`
          : r.arrival_bonus_rejected_note
            ? `${r.pet_parent_name ?? 'Session'} — ${r.arrival_bonus_rejected_note}`
            : `${r.pet_parent_name ?? 'Session'} — not approved`,
        at:    r.arrival_bonus_approved_at ?? new Date().toISOString(),
        accent: approved ? 'green' : 'red',
        action: { tab: 'bookings', sessionId: r.id },
      });
    });

    ((reviewOutcomesRes as Res).data ?? []).forEach((r) => {
      const approved = r.review_claim_status === 'approved';
      out.push({
        id:    `review-outcome-${r.id}`,
        title: approved ? 'Review claim approved' : 'Review claim rejected',
        body:  approved
          ? `${r.pet_parent_name ?? 'Session'} — ₹${REVIEW_BONUS} credited`
          : r.review_claim_rejected_note
            ? `${r.pet_parent_name ?? 'Session'} — ${r.review_claim_rejected_note}`
            : `${r.pet_parent_name ?? 'Session'} — not approved`,
        at:    r.review_claim_approved_at ?? new Date().toISOString(),
        accent: approved ? 'amber' : 'red',
        action: { tab: 'overview' },
      });
    });

    out.sort((a, b) => b.at.localeCompare(a.at));
    return out;
  }, [groomerId]);

  return useFeed(`groomer.${groomerId}`, fetcher);
}
