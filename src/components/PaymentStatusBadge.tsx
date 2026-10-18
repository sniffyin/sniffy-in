/**
 * PaymentStatusBadge.tsx
 *
 * Small pill-style badge used wherever we render a session card or
 * row that should communicate "where is the money?":
 *
 *   • Coordinator screens — admin SessionsTab cards, AdminCalendarTab
 *     day popup, future reconciliation views.
 *   • Groomer screens     — GroomerBookingsTab + GroomerCalendarTab,
 *     so the groomer can see "Paid" already-settled rows and avoid
 *     trying to collect again.
 *
 * Visual states:
 *   • Unpaid             — gray neutral pill
 *   • Cash w/ Groomer    — amber "money in transit" pill
 *   • Online · Pending   — amber "txn not yet verified" pill
 *   • Paid · Cash/Online — green settled pill
 *
 * All status + label resolution defers to the helpers in
 * pages/admin/types.ts so a single change there propagates to every
 * surface.
 */

import {
  paymentStatusOf, paymentStatusLabel, paymentStatusShortLabel,
  PAYMENT_STATUS_COLORS,
  type GroomingSession,
} from '../pages/admin/types';
import { Wallet } from 'lucide-react';

interface Props {
  /** Pluck only the fields we need so callers can pass either a full
   *  session or a slimmed-down list-row type. */
  session: Pick<GroomingSession, 'payment_verified' | 'payment_collected_at' | 'payment_mode'>;
  /** "short" omits the mode suffix — useful in dense tables. */
  variant?: 'full' | 'short';
  /** Extra utility classes for spacing tweaks at the call site. */
  className?: string;
}

export default function PaymentStatusBadge({ session, variant = 'full', className = '' }: Props) {
  const status = paymentStatusOf(session);
  const colors = PAYMENT_STATUS_COLORS[status];
  const label  = variant === 'short' ? paymentStatusShortLabel(session) : paymentStatusLabel(session);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      <Wallet size={9} strokeWidth={2.8}/>
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}
