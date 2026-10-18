/**
 * portal/CustomerPortalShell.tsx — Phase 4
 *
 * Layout shell + nav for the signed-in customer portal.
 *
 *   ┌───────────────────────────────────────────────┐
 *   │ Sniffy · Hi, Rohan                  ↪ Sign out │  ← Top bar
 *   ├───────────────────────────────────────────────┤
 *   │  Home · Pets · Sessions · Book · Profile      │  ← Tabs (top on dt, bottom on mb)
 *   ├───────────────────────────────────────────────┤
 *   │  <active page>                                 │
 *   └───────────────────────────────────────────────┘
 *
 * State lives at the shell level — the active tab is the only
 * portal-wide state.  Each tab is its own component, lazy-loaded so
 * customers don't pay for code they don't use.  The shell also owns
 * the customer record (refetched after profile edits) and passes it
 * down via props.
 */

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  Home, PawPrint, Scissors, CalendarPlus, UserRound, LogOut, Loader2, AlertCircle, Wallet,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Customer, formatPhoneDisplay } from '../admin/customerTypes';

const CustomerPortalDashboard = lazy(() => import('./CustomerPortalDashboard'));
const CustomerPortalPets      = lazy(() => import('./CustomerPortalPets'));
const CustomerPortalSessions  = lazy(() => import('./CustomerPortalSessions'));
const CustomerPortalBook      = lazy(() => import('./CustomerPortalBook'));
const CustomerPortalProfile   = lazy(() => import('./CustomerPortalProfile'));
const CustomerPortalWallet    = lazy(() => import('./CustomerPortalWallet'));

export type PortalTabId = 'home' | 'pets' | 'sessions' | 'wallet' | 'book' | 'profile';

const TABS: { id: PortalTabId; label: string; Icon: React.ElementType }[] = [
  { id: 'home',     label: 'Home',     Icon: Home },
  { id: 'pets',     label: 'Pets',     Icon: PawPrint },
  { id: 'sessions', label: 'Sessions', Icon: Scissors },
  { id: 'wallet',   label: 'Wallet',   Icon: Wallet },
  { id: 'book',     label: 'Book',     Icon: CalendarPlus },
  { id: 'profile',  label: 'Profile',  Icon: UserRound },
];

export default function CustomerPortalShell({
  customerId, onSignOut,
}: {
  customerId: string;
  onSignOut: () => void;
}) {
  const [customer, setCustomer]     = useState<Customer | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<PortalTabId>(readTabFromHash());

  // Mirror the active tab into the URL hash. First mount uses replaceState
  // (no phantom duplicate); subsequent user tab switches pushState so the
  // Android PWA back button walks tab history instead of exiting. The
  // hashchange listener handles back/forward — when the browser pops the
  // hash, we sync state and this effect short-circuits.
  const isInitialHashSync = useRef(true);
  useEffect(() => {
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
      setActiveTab(prev => prev === next ? prev : next);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  async function loadCustomer() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .maybeSingle();
      if (err) throw err;
      if (!data) throw new Error('Your account could not be loaded.');
      setCustomer(data as Customer);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setLoading(false); }
  }

  useEffect(() => { loadCustomer(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [customerId]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    onSignOut();
  }

  if (loading || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50/30">
        {error ? (
          <div className="max-w-sm px-6 py-5 bg-white rounded-2xl border border-red-200 text-center">
            <AlertCircle className="text-red-500 mx-auto mb-2" size={22}/>
            <p className="text-sm font-bold text-red-700 mb-1">Could not load your account</p>
            <p className="text-xs text-red-500 break-words">{error}</p>
            <button
              onClick={handleSignOut}
              className="mt-4 text-xs font-semibold text-sniffy-purple hover:underline"
            >Sign out and try again</button>
          </div>
        ) : (
          <Loader2 size={28} className="animate-spin text-sniffy-purple"/>
        )}
      </div>
    );
  }

  // Common props for every tab.  The reload callback lets tabs trigger
  // a customer refetch without managing it themselves (e.g. after a
  // profile save).
  const tabProps = { customer, onCustomerChanged: loadCustomer };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/sniffy-logo.png" alt="Sniffy" className="h-8 w-auto object-contain"/>
            <div>
              <p className="text-xs text-gray-400 leading-none">Welcome</p>
              <p className="text-sm font-extrabold text-gray-900 leading-tight">
                {customer.name || formatPhoneDisplay(customer.phone)}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition font-semibold"
          >
            <LogOut size={12}/> Sign out
          </button>
        </div>

        {/* Desktop nav row */}
        <nav className="hidden sm:flex max-w-3xl mx-auto px-6 gap-1 -mt-px">
          {TABS.map(t => (
            <TabBtn key={t.id} tab={t} active={activeTab === t.id} onClick={() => setActiveTab(t.id)}/>
          ))}
        </nav>
      </header>

      {/* Active page */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 pb-24 sm:pb-12">
        <Suspense fallback={<TabSkeleton/>}>
          {activeTab === 'home'     && <CustomerPortalDashboard {...tabProps} onNavigate={setActiveTab}/>}
          {activeTab === 'pets'     && <CustomerPortalPets      {...tabProps}/>}
          {activeTab === 'sessions' && <CustomerPortalSessions  {...tabProps}/>}
          {activeTab === 'wallet'   && <CustomerPortalWallet    {...tabProps}/>}
          {activeTab === 'book'     && <CustomerPortalBook      {...tabProps} onSubmitted={() => setActiveTab('sessions')}/>}
          {activeTab === 'profile'  && <CustomerPortalProfile   {...tabProps} onSignOut={handleSignOut}/>}
        </Suspense>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100 flex"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxShadow: '0 -4px 24px rgba(69,26,139,0.06)',
        }}
      >
        {TABS.map(t => (
          <BottomBtn key={t.id} tab={t} active={activeTab === t.id} onClick={() => setActiveTab(t.id)}/>
        ))}
      </nav>
    </div>
  );
}

// ─── Tab buttons ─────────────────────────────────────────────────────

function TabBtn({ tab, active, onClick }: {
  tab: { id: PortalTabId; label: string; Icon: React.ElementType };
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tab.Icon;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-bold transition border-b-2 ${
        active
          ? 'text-sniffy-purple border-sniffy-purple'
          : 'text-gray-500 border-transparent hover:text-gray-700'
      }`}
    >
      <Icon size={14}/>
      {tab.label}
    </button>
  );
}

function BottomBtn({ tab, active, onClick }: {
  tab: { id: PortalTabId; label: string; Icon: React.ElementType };
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tab.Icon;
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-all"
    >
      <Icon size={20} strokeWidth={active ? 2.4 : 1.8} className={active ? 'text-sniffy-purple' : 'text-gray-400'}/>
      <span className={`text-[9px] font-bold tracking-wide ${active ? 'text-sniffy-purple' : 'text-gray-400'}`}>
        {tab.label}
      </span>
    </button>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl"/>)}
    </div>
  );
}

// ─── URL hash helpers ───────────────────────────────────────────────

const VALID_TABS: PortalTabId[] = ['home','pets','sessions','wallet','book','profile'];

function readTabFromHash(): PortalTabId {
  if (typeof window === 'undefined') return 'home';
  const raw = window.location.hash.replace(/^#\/?/, '') as PortalTabId;
  return VALID_TABS.includes(raw) ? raw : 'home';
}
