/**
 * GroomerDashboard.tsx
 *
 * Mobile shell:
 *   ┌──────────────────────────────────────────┐
 *   │ [avatar]  Welcome back · Ravi    🔔 ●     │  ← MobileTopBar (purple)
 *   ├──────────────────────────────────────────┤
 *   │ {active tab content}                      │
 *   ├──────────────────────────────────────────┤
 *   │   Overview · Calendar · Bookings          │  ← BottomBar (no centre FAB)
 *   └──────────────────────────────────────────┘
 *
 * Tapping the avatar opens the SideDrawer (Profile, Earnings, Calendar,
 * Help, Logout).  Tapping the bell opens NotificationsPanel.
 *
 * Desktop layout (≥ sm): unchanged — purple hero + horizontal tab nav.
 *
 * The bottom-bar centre FAB has been retired — its only item (Logout)
 * now lives in the drawer along with the other overflow menu items.
 * That gives the bottom bar a clean 3-tab layout.
 */

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Calendar, CalendarDays, LogOut,
  User, HelpCircle, Wallet, FileText, Settings,
} from 'lucide-react';
import {
  getGroomerSession,
  groomerLogout,
  type GroomerUser,
} from './groomer/groomerAuthStore';
import type { AdminUser } from './admin/authStore';
import { supabase } from '../lib/supabase';
import MobileTopBar from '../components/MobileTopBar';
import SideDrawer, { type DrawerItem } from '../components/SideDrawer';
import NotificationsPanel from '../components/NotificationsPanel';
import { useGroomerNotifications } from '../lib/notifications';

const GroomerLoginGate    = lazy(() => import('./groomer/GroomerLoginGate'));
const GroomerOverviewTab  = lazy(() => import('./groomer/GroomerOverviewTab'));
const GroomerBookingsTab  = lazy(() => import('./groomer/GroomerBookingsTab'));
const GroomerCalendarTab  = lazy(() => import('./groomer/GroomerCalendarTab'));
const GroomerProfileTab   = lazy(() => import('./groomer/GroomerProfileTab'));
const GroomerDocumentsTab = lazy(() => import('./groomer/GroomerDocumentsTab'));
const GroomerEarningsTab  = lazy(() => import('./groomer/GroomerEarningsTab'));
const HelpSupportTab      = lazy(() => import('./HelpSupportTab'));
const SettingsTab         = lazy(() => import('./SettingsTab'));

type TabId = 'overview' | 'bookings' | 'calendar' | 'profile' | 'documents' | 'earnings' | 'help' | 'settings';

const VALID_TABS: TabId[] = ['overview','bookings','calendar','profile','documents','earnings','help','settings'];

/** Read the active tab from the URL hash so reloads preserve the
 *  current tab (e.g. /groomer#calendar keeps Calendar selected on F5). */
function readTabFromHash(): TabId {
  if (typeof window === 'undefined') return 'overview';
  const raw = window.location.hash.replace(/^#\/?/, '');
  return VALID_TABS.includes(raw as TabId) ? (raw as TabId) : 'overview';
}

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: 'overview', label: 'Home',     Icon: LayoutDashboard    },
  { id: 'calendar', label: 'Calendar', Icon: CalendarDays },
  { id: 'bookings', label: 'Bookings', Icon: Calendar     },
];

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse py-8">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl"/>)}
    </div>
  );
}

// ─── Mobile bottom bar — flat 3-tab layout, no centre FAB ────

function BottomBar({
  activeTab, setTab,
}: {
  activeTab: TabId;
  setTab: (t: TabId) => void;
}) {
  const TabButton = ({
    id, Icon, label,
  }: {
    id: TabId; Icon: React.ElementType; label: string;
  }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => setTab(id)}
        className="flex flex-col items-center gap-0.5 py-2.5 px-3 transition-all min-w-[64px]"
      >
        <Icon
          size={21}
          strokeWidth={active ? 2.4 : 1.8}
          className={`transition-colors ${active ? 'text-sniffy-purple' : 'text-gray-400'}`}
        />
        <span className={`text-[9px] font-bold tracking-wide transition-colors ${active ? 'text-sniffy-purple' : 'text-gray-400'}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-around bg-white border-t border-gray-100"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -4px 24px rgba(69,26,139,0.06)',
        height: '68px',
      }}
    >
      <TabButton id="overview" Icon={LayoutDashboard} label="Home"/>
      <TabButton id="calendar" Icon={CalendarDays}    label="Calendar"/>
      <TabButton id="bookings" Icon={Calendar}        label="Bookings"/>
    </div>
  );
}

// ─── Desktop top nav ──────────────────────────────────────────

function DesktopTabNav({
  activeTab, setTab, onLogout,
}: {
  activeTab: TabId;
  setTab: (t: TabId) => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex gap-2 justify-center flex-wrap items-center">
      {TABS.map(tab => {
        const active = activeTab === tab.id;
        return (
          <button key={tab.id} onClick={() => setTab(tab.id)}
            className={['flex items-center gap-2 px-5 py-3 rounded-t-2xl text-sm font-semibold transition-all border-b-2',
              active ? 'bg-white text-sniffy-purple border-sniffy-purple shadow-sm'
                     : 'bg-white/50 text-gray-500 border-transparent hover:bg-white/80 hover:text-gray-700'].join(' ')}>
            <tab.Icon size={16} className={active ? 'text-sniffy-purple' : 'text-gray-400'}/>
            {tab.label}
          </button>
        );
      })}
      <button onClick={onLogout}
        className="ml-4 flex items-center gap-1.5 px-4 py-3 rounded-t-2xl text-xs font-semibold text-gray-400 hover:text-red-500 transition border-b-2 border-transparent">
        <LogOut size={14}/> Logout
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────

/** Resolve the UUID we should use against `grooming_sessions.groomer_id`
 *  and `groomers.id`.  The stored session is typed `GroomerUser` but at
 *  runtime it's actually the AdminUser-shape that the GroomerLoginGate
 *  writes (it has both `id` and the canonical `groomer_id` UUID).
 *  Falling back to `id` keeps the legacy local-only path working. */
function resolveGroomerId(u: GroomerUser): string {
  return (u as unknown as { groomer_id?: string }).groomer_id ?? u.id;
}

export default function GroomerDashboard() {
  const [authed, setAuthed]       = useState<GroomerUser | null>(() => getGroomerSession());
  // Seeded from URL hash so a reload of /groomer#calendar lands on
  // Calendar instead of bouncing back to Overview.
  const [activeTab, setActiveTab] = useState<TabId>(() => readTabFromHash());

  // Mirror activeTab → URL hash. First mount uses replaceState; every
  // subsequent user tab switch pushes a new history entry so the Android
  // PWA back button walks tab history instead of exiting the app. The
  // hashchange listener handles back/forward — when the browser pops the
  // hash, we sync state and this effect short-circuits (hash already matches).
  const isInitialHashSync = useRef(true);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const target = `#${activeTab}`;
    if (window.location.hash === target) return;
    const url = `${window.location.pathname}${window.location.search}${target}`;
    if (isInitialHashSync.current) {
      isInitialHashSync.current = false;
      window.history.replaceState(null, '', url);
    } else {
      window.history.pushState(null, '', url);
    }
  }, [activeTab]);

  useEffect(() => {
    function onHashChange() {
      const next = readTabFromHash();
      setActiveTab(prev => (prev === next ? prev : next));
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  // Photo for the top bar.  Fetched from `groomers.photo_url` on auth /
  // focus / drawer open so a freshly uploaded photo shows up without a
  // hard reload.  NULL → falls back to the initials chip.
  const [photoUrl, setPhotoUrl]   = useState<string | null>(null);

  const refreshPhoto = useCallback(async () => {
    if (!authed) return;
    const gid = resolveGroomerId(authed);
    if (!gid) return;
    const { data } = await supabase
      .from('groomers')
      .select('photo_url')
      .eq('id', gid)
      .maybeSingle();
    setPhotoUrl((data as { photo_url: string | null } | null)?.photo_url ?? null);
  }, [authed]);

  // Initial fetch + refresh when the tab comes back into focus (e.g.
  // coordinator just uploaded a photo in another tab).
  useEffect(() => { refreshPhoto(); }, [refreshPhoto]);
  useEffect(() => {
    function onFocus() { refreshPhoto(); }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshPhoto]);

  // User shape passed to the top bar / drawer.  We spread the auth
  // object so name + initials come through, and overlay `photoUrl` from
  // the DB-backed state above.  `useMemo` keeps the props referentially
  // stable so MobileTopBar doesn't churn on every render.
  const topBarUser = useMemo(() => (
    authed ? { ...authed, photoUrl } : null
  ), [authed, photoUrl]);

  // ── Top-bar UI state ────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  // Deep-link target — when a notification is tapped, we stash the
  // session id and pass it to GroomerBookingsTab so the right session's
  // detail modal pops open after the tab loads.  The tab clears this
  // via the `onAutoOpenConsumed` callback after acting.
  const [deepLinkSessionId, setDeepLinkSessionId] = useState<string | null>(null);
  // Real Supabase-backed feed for this groomer: new assignments,
  // today's not-yet-arrived sessions, payment-pending, and approval
  // outcomes (arrival bonus + review claim).  The feed filters
  // grooming_sessions by groomer_id, which is a `uuid` matching
  // groomers.id — so we must pass the resolved uuid via
  // resolveGroomerId(), NOT authed.id (the USERS[] entry id like 'g1',
  // which would be compared against a uuid column and rejected by
  // PostgREST, leaving the bell permanently empty).
  const {
    items: notifications,
    unreadCount: notifCount,
    loading: notifLoading,
    error:   notifError,
    refresh: refreshNotifications,
    markAsRead,
    markAllRead,
  } = useGroomerNotifications(authed ? resolveGroomerId(authed) : '');

  function handleAuthed(user: GroomerUser) { setAuthed(user); }
  function handleLogout()                  { groomerLogout(); setAuthed(null); }

  function handleNotificationSelect(n: { action?: { tab: string; sessionId?: string } }) {
    // Stash the session deep-link first so the target tab can pick it
    // up on mount.  Setting both in one render keeps things atomic.
    if (n.action?.sessionId) {
      setDeepLinkSessionId(n.action.sessionId);
      // Always route session-scoped notifications to bookings tab
      // (that's where the detail modal lives).
      setActiveTab('bookings');
      return;
    }
    const actionTab = n.action?.tab;
    if (!actionTab) return;
    const valid: TabId[] = ['overview', 'bookings', 'calendar'];
    if (valid.includes(actionTab as TabId)) setActiveTab(actionTab as TabId);
  }

  // ── Drawer items (groomer-specific) ─────────────────────────
  const drawerItems: DrawerItem[] = useMemo(() => {
    if (!authed) return [];
    return [
      { label: 'Profile',           Icon: User,         onClick: () => setActiveTab('profile') },
      { label: 'Incentives',        Icon: Wallet,       onClick: () => { setActiveTab('earnings'); setDrawerOpen(false); } },
      { label: 'Calendar',          Icon: CalendarDays, onClick: () => setActiveTab('calendar') },
      { label: 'Documents',         Icon: FileText,     onClick: () => setActiveTab('documents') },
      { label: 'Settings',          Icon: Settings,     onClick: () => { setActiveTab('settings'); setDrawerOpen(false); } },
      { label: 'Help & Support',    Icon: HelpCircle,   onClick: () => { setActiveTab('help'); setDrawerOpen(false); } },
      { label: 'Log Out',           Icon: LogOut, accent: 'danger', onClick: handleLogout },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  if (!authed) {
    return (
      <Suspense fallback={null}>
        <GroomerLoginGate onAuthed={handleAuthed}/>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2EFF9]">
      {/* Mobile sticky top bar — photo comes from groomers.photo_url */}
      <MobileTopBar
        user={topBarUser ?? authed}
        notificationCount={notifCount}
        onOpenDrawer={() => {
          // Refresh photo when the drawer opens so a freshly uploaded
          // photo is reflected even if the focus event didn't fire (e.g.
          // PWA standalone with no visible blur/focus events).
          refreshPhoto();
          setDrawerOpen(true);
        }}
        onOpenNotifications={() => setNotifOpen(true)}
      />

      {/* Desktop: keep the original purple hero with horizontal tab nav.
          Mobile uses MobileTopBar above, so we hide this entire hero on
          small screens. */}
      <section className="hidden sm:block bg-gradient-to-b from-purple-100 via-purple-50 to-[#F2EFF9] pt-8 sm:pt-10 pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            className="flex flex-col items-center gap-1 mb-2">
            <img src="/sniffy-logo.png" alt="Sniffy" className="h-14 w-auto object-contain mb-1" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-sniffy-purple leading-none">Groomer Portal</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              Hey, <span className="text-sniffy-purple">{authed.name.split(' ')[0]}</span>
              {' '}<span className="text-sniffy-yellow">👋</span>
            </h1>
          </motion.div>
          <motion.p initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="mt-1 text-gray-500 text-sm max-w-md mx-auto">
            Your sessions · Your history · Your schedule
          </motion.p>
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            className="mt-8 hidden sm:block">
            <DesktopTabNav activeTab={activeTab} setTab={setActiveTab} onLogout={handleLogout}/>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-8">
        <Suspense fallback={<TabSkeleton/>}>
          {activeTab === 'overview' && (
            <GroomerOverviewTab
              groomer={authed}
              onNavigate={setActiveTab}
              onOpenSession={(id) => { setDeepLinkSessionId(id); setActiveTab('bookings'); }}
            />
          )}
          {activeTab === 'calendar' && (
            <GroomerCalendarTab groomer={authed}/>
          )}
          {activeTab === 'bookings' && (
            <GroomerBookingsTab
              groomer={authed}
              autoOpenSessionId={deepLinkSessionId}
              onAutoOpenConsumed={() => setDeepLinkSessionId(null)}
            />
          )}
          {activeTab === 'profile' && (
            <GroomerProfileTab
              groomer={authed}
              onPhotoChanged={refreshPhoto}
            />
          )}
          {activeTab === 'documents' && (
            <GroomerDocumentsTab groomer={authed}/>
          )}
          {activeTab === 'earnings' && (
            <GroomerEarningsTab groomer={authed}/>
          )}
          {activeTab === 'help' && (
            <HelpSupportTab/>
          )}
          {activeTab === 'settings' && (
            // `authed` is typed GroomerUser, but at runtime SniffyLoginGate
            // writes an AdminUser-shaped record (with role='groomer').  Cast
            // through unknown so the shared SettingsTab can read role/role
            // label safely — same pattern resolveGroomerId() uses above.
            <SettingsTab
              user={authed as unknown as AdminUser}
              onLogout={handleLogout}
              onOpenProfile={() => setActiveTab('profile')}
              appLabel="Groomer Portal"
            />
          )}
        </Suspense>
      </main>

      {/* Mobile bottom bar */}
      <div className="sm:hidden">
        <BottomBar activeTab={activeTab} setTab={setActiveTab}/>
      </div>

      {/* Overlays */}
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={topBarUser ?? authed}
        roleLabel="Groomer Portal"
        items={drawerItems}
      />

      <NotificationsPanel
        open={notifOpen}
        // Closing the panel does NOT mark items read.  Mimics
        // Gmail/Slack: items stay unread until you act on them.
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        loading={notifLoading}
        error={notifError}
        onRefresh={refreshNotifications}
        onMarkAsRead={markAsRead}
        onMarkAllRead={markAllRead}
        onSelect={(n) => {
          setNotifOpen(false);
          handleNotificationSelect(n);
        }}
      />
    </div>
  );
}
