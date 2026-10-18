/**
 * ConfirmDialog
 *
 * Sniffy-styled replacement for window.confirm().  Modeled on the
 * ConfirmLwpModal pattern used in GroomerCalendarTab — same visual
 * language as the rest of the app (rounded-3xl card, hero strip with
 * accent icon, primary gradient confirm button, soft gray cancel).
 *
 * Use this anywhere we were reaching for window.confirm / window.alert.
 *
 * Variants
 *   - 'danger'  → red hero strip + red gradient confirm button
 *                 (use for destructive actions: delete / archive)
 *   - 'primary' → purple hero strip + Sniffy purple confirm button
 *                 (use for neutral confirmations)
 *
 * The dialog locks scroll on the underlying page via a high z-index
 * overlay and disables backdrop dismiss while `busy` is true so the
 * user can't double-fire a destructive action mid-request.
 */

import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Optional short subtitle rendered under the title in the hero strip. */
  subtitle?: string;
  /** Body content — either plain text or arbitrary JSX (e.g. a details list). */
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  /** While true, buttons are disabled, confirm shows a spinner, and the
   *  backdrop can't be clicked to dismiss. */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  subtitle,
  children,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'primary',
  busy         = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isDanger = variant === 'danger';

  // Hero strip + icon colours.  Kept inline (rather than dynamic
  // class names) because Tailwind purges anything it can't see at
  // build time — concrete classes survive purging.
  const heroBg     = isDanger
    ? 'bg-gradient-to-b from-rose-50 to-white'
    : 'bg-gradient-to-b from-violet-50 to-white';
  const iconBg     = isDanger ? 'bg-rose-100' : 'bg-violet-100';
  const iconColor  = isDanger ? 'text-rose-700' : 'text-violet-700';
  const Icon       = isDanger ? Trash2 : AlertTriangle;
  const confirmBg  = isDanger
    ? { background: 'linear-gradient(145deg, #e11d48 0%, #9f1239 100%)', boxShadow: '0 4px 14px rgba(225,29,72,0.30)' }
    : { background: 'linear-gradient(145deg, #7c3aed 0%, #5b21b6 100%)', boxShadow: '0 4px 14px rgba(124,58,237,0.30)' };

  // Portal into document.body so the dialog is never trapped inside
  // a parent stacking context (e.g. AdminDayDetail's z-50 slide-over
  // panel) — guarantees the backdrop covers the full viewport and
  // the card sits above everything regardless of where this
  // component is rendered in the tree.  SSR guard via typeof window.
  if (typeof document === 'undefined') return null;
  return createPortal((
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm"
            onClick={busy ? undefined : onCancel}
          />
          <motion.div
            key="confirm-card"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed z-[90] inset-0 grid place-items-center p-4"
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Hero strip — accent colour cues the action type. */}
              <div className={`px-6 pt-6 pb-4 ${heroBg}`}>
                <div className={`w-12 h-12 rounded-2xl ${iconBg} grid place-items-center mb-3`}>
                  <Icon size={20} className={iconColor}/>
                </div>
                <h3
                  id="confirm-dialog-title"
                  className="text-lg font-extrabold text-gray-900 leading-tight"
                >
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Body — caller supplies its own layout. */}
              {children && (
                <div className="px-6 pb-4">
                  {children}
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-gray-100 p-4 flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={busy}
                  className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={busy}
                  className="flex-1 px-4 py-3 rounded-2xl text-sm font-extrabold text-white disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  style={confirmBg}
                >
                  {busy && <Loader2 size={14} className="animate-spin"/>}
                  {busy ? 'Working…' : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  ), document.body);
}
