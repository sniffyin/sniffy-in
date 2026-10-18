/**
 * pages/CustomerPortal.tsx — Phase 4 entry point
 *
 * Routed at `/account`.  Auth-gate decides whether to show the OTP
 * login flow (CustomerPortalGate) or the signed-in shell.  Bootstraps
 * the customer ↔ auth.users linkage on first load by checking the
 * current Supabase session, calling link_auth_user_to_customer(), and
 * caching the resolved customer id.
 *
 * Resilient to:
 *   • Refreshes — Supabase auth session is persisted in localStorage,
 *     so we re-resolve current_customer_id on mount.
 *   • Sign-outs — clearing the session shows the gate again.
 *   • Unknown customers — if the linkage RPC returns null (phone not
 *     in our customer master), we sign them out and ask them to
 *     contact us, rather than hand them an empty portal.
 */

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CustomerPortalGate, { BYPASS_CUSTOMER_ID_KEY } from './portal/CustomerPortalGate';
import CustomerPortalShell from './portal/CustomerPortalShell';

// ─────────────────────────────────────────────────────────────────────
// TEST MODE — OTP BYPASS (mirror of the flag in CustomerPortalGate.tsx)
// ─────────────────────────────────────────────────────────────────────
// When true, the on-mount resolver skips the supabase.auth.getUser() +
// link_auth_user_to_customer() dance and instead reads a customer id
// stashed in sessionStorage by the gate.  Keep this in sync with the
// flag in CustomerPortalGate.tsx — flipping one without the other will
// produce a confused gate that signs you in then immediately bounces.
// ─────────────────────────────────────────────────────────────────────
const TEST_BYPASS_OTP = true;

export default function CustomerPortal() {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [customerId, setCustomerId]       = useState<string | null>(null);

  async function resolveCustomer() {
    setBootstrapping(true);

    // ── TEST MODE — sessionStorage-backed customer id ─────────────
    // The gate stashed the resolved customer id here when the user
    // hit "Sign in (test bypass)".  No Supabase auth session exists,
    // so we cannot fall through to getUser() below — read straight
    // from storage and finish.
    if (TEST_BYPASS_OTP) {
      let stashed: string | null = null;
      try { stashed = sessionStorage.getItem(BYPASS_CUSTOMER_ID_KEY); } catch {}
      setCustomerId(stashed);
      setBootstrapping(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCustomerId(null);
      setBootstrapping(false);
      return;
    }
    // Re-link in case the customer record was created/updated since
    // last sign-in (idempotent SQL function).
    const { data, error } = await supabase.rpc('link_auth_user_to_customer');
    if (error) {
      console.warn('[CustomerPortal] link_auth_user_to_customer failed:', error);
      await supabase.auth.signOut();
      setCustomerId(null);
    } else if (!data) {
      // Session exists but no matching customer master — sign out.
      await supabase.auth.signOut();
      setCustomerId(null);
    } else {
      setCustomerId(data as string);
    }
    setBootstrapping(false);
  }

  useEffect(() => {
    resolveCustomer();
    // Listen for sign-out events from other tabs / explicit signOut calls.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setCustomerId(null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50/30">
        <Loader2 size={28} className="animate-spin text-sniffy-purple"/>
      </div>
    );
  }

  if (!customerId) {
    return <CustomerPortalGate onAuthed={({ customerId }) => setCustomerId(customerId)}/>;
  }

  return (
    <CustomerPortalShell
      customerId={customerId}
      onSignOut={() => {
        // In bypass mode there's no Supabase session to clear — just
        // wipe our sessionStorage key.  In normal mode the shell will
        // have called supabase.auth.signOut() already (or will do so
        // through onAuthStateChange).  Calling removeItem either way
        // is harmless.
        try { sessionStorage.removeItem(BYPASS_CUSTOMER_ID_KEY); } catch {}
        setCustomerId(null);
      }}
    />
  );
}
