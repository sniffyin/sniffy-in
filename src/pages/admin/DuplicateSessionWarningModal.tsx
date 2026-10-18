/**
 * admin/DuplicateSessionWarningModal.tsx
 *
 * Soft-warning popup shown when the coordinator is about to save a session
 * that looks like a duplicate — same pet-parent name (case- and
 * whitespace-insensitive) within a ±7-day window of an existing row.
 *
 * Display-only: lists the matching session(s) so the coordinator can
 * eyeball them and decide whether to proceed (e.g. "oh, that one was for
 * Bruno, this new one is for Max"). Two actions: Cancel or
 * "Yes, Add Anyway".
 *
 * Pure presentational — no DB calls, no business logic. The parent
 * (SessionFormModal) runs the duplicate query and decides when to mount.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useModalTakesOverStatusBar } from '../../components/PWAInstallGate';

export interface DuplicateMatch {
  id: string;
  pet_parent_name: string;
  session_date: string;            // ISO yyyy-mm-dd
  scheduled_time: string | null;   // 24h "HH:MM"
  pet_type: string | null;
  breed: string | null;
  package: string | null;
  groomer_name: string | null;
  status: string | null;
}

interface Props {
  open: boolean;
  matches: DuplicateMatch[];
  /** Name the coordinator typed (used in the warning copy). */
  attemptedName: string;
  /** Date the coordinator picked (used in the warning copy). */
  attemptedDate: string;
  /** Coordinator confirms and we proceed with the original insert/update. */
  onConfirm: () => void;
  /** Coordinator backs out — leave the form open so they can edit. */
  onCancel: () => void;
}

function humanDate(iso: string) {
  if (!iso) return '';
  // Guard against an unparseable string — fall back to the raw value so
  // the warning still renders something useful instead of "Invalid Date".
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmt24to12(t: string | null): string {
  if (!t) return '';
  const [hStr, mStr] = t.split(':');
  const h = parseInt(hStr);
  if (Number.isNaN(h)) return '';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr ?? '00'} ${ampm}`;
}

export default function DuplicateSessionWarningModal({
  open, matches, attemptedName, attemptedDate, onConfirm, onCancel,
}: Props) {
  const count = matches.length;

  // Repaint Android's status bar white while we're up — same reason as
  // SessionFormModal: avoid the purple band hovering over a white sheet.
  // Nested case (this modal opens on top of the form) is handled by the
  // hook's restore-previous logic — when this closes we go back to
  // white (SessionFormModal still open), then to purple once that
  // closes too.
  useModalTakesOverStatusBar(open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          // z-[60] so we sit above SessionFormModal (z-50) without
          // dismissing it — coordinator can still see the form behind.
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-stretch sm:items-center justify-center p-0 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="bg-white w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-md rounded-none sm:rounded-[24px] shadow-2xl flex flex-col"
          >
            {/* ── Header ── */}
            <div className="px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertTriangle size={18} className="text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-extrabold text-gray-900">
                      Possible duplicate {count > 1 ? 'entries' : 'entry'}
                    </h2>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      A session for <span className="font-semibold text-gray-700">{attemptedName.trim() || '—'}</span> already exists within 7 days of <span className="font-semibold text-gray-700">{humanDate(attemptedDate)}</span>.
                    </p>
                  </div>
                </div>
                <button onClick={onCancel} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400 flex-shrink-0">
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* ── Match list (display-only) ── */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-2.5">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                Existing {count > 1 ? `entries (${count})` : 'entry'}
              </p>

              {matches.map(m => (
                <div
                  key={m.id}
                  className="border border-gray-200 rounded-2xl p-3 bg-gray-50/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-gray-800 truncate">
                      {m.pet_parent_name}
                    </span>
                    <span className="text-[11px] font-bold text-sniffy-purple bg-purple-50 border border-sniffy-purple/20 rounded-full px-2 py-0.5 flex-shrink-0">
                      {humanDate(m.session_date)}
                      {m.scheduled_time && ` · ${fmt24to12(m.scheduled_time)}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500">
                    {m.pet_type && (
                      <span>
                        {m.pet_type === 'cat' ? '🐱' : '🐶'}{' '}
                        <span className="text-gray-700 font-medium">
                          {m.breed || m.pet_type}
                        </span>
                      </span>
                    )}
                    {m.package && (
                      <span>
                        Package: <span className="text-gray-700 font-medium">{m.package}</span>
                      </span>
                    )}
                    {m.groomer_name && (
                      <span>
                        Groomer: <span className="text-gray-700 font-medium">{m.groomer_name}</span>
                      </span>
                    )}
                    {m.status && (
                      <span>
                        Status: <span className="text-gray-700 font-medium capitalize">{m.status.replace(/_/g, ' ')}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-1">
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  If this is a different pet from the same household (e.g. a second dog being groomed the same week), tap <span className="font-semibold text-gray-700">Add Anyway</span>. Otherwise tap <span className="font-semibold text-gray-700">Cancel</span> and review the form.
                </p>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0 bg-white">
              <div className="flex gap-2.5">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-[2] py-3 rounded-full bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition"
                >
                  Yes, Add Anyway
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
