/**
 * NotificationsPanel.tsx — top-anchored sheet listing AppNotification[].
 *
 * Behaves like Gmail / Slack:
 *   - Closing the panel does NOT mark anything read.
 *   - Tapping a single notification marks just THAT one as read and
 *     fires onSelect(n) for routing.
 *   - The header has a "Mark all read" pill that's only visible when
 *     there are unread items.  Tapping it bulk-marks-read but does NOT
 *     close the panel — the user can still see the (now-read) list.
 *
 * Visual states:
 *   - Loading  → skeleton rows
 *   - Error    → friendly message + Try Again
 *   - Empty    → "You're all caught up"
 *   - Has data → list, with unread rows highlighted (light-purple
 *                background + bolder text + a small red dot on the
 *                right edge).
 *
 * The panel is generic: it doesn't know what tabs exist or how
 * routing works — the parent handles that via `onSelect`.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X, RefreshCw, AlertCircle, CheckCheck } from 'lucide-react';
import {
  type AppNotification,
  accentColor,
  relativeTime,
} from '../lib/notifications';

interface Props {
  open: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  loading?: boolean;
  error?: string | null;
  /** Optional manual refresh handler — header refresh button. */
  onRefresh?: () => void;
  /** Optional bulk mark-as-read handler — header "Mark all read"
   *  button.  Only rendered when at least one unread item exists. */
  onMarkAllRead?: () => void;
  /** Invoked when a row is tapped.  The panel itself marks the tapped
   *  item as read via `onMarkAsRead`; the parent decides routing. */
  onSelect: (n: AppNotification) => void;
  /** Per-item mark-as-read.  Invoked from the panel when a row is
   *  tapped, just before `onSelect`. */
  onMarkAsRead?: (id: string) => void;
}

export default function NotificationsPanel({
  open, onClose, notifications, loading, error,
  onRefresh, onMarkAllRead, onSelect, onMarkAsRead,
}: Props) {
  const visibleCount = notifications.length;
  const unreadCount  = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dim backdrop — tap anywhere outside the panel to close */}
          <motion.div
            key="notif-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-[55] bg-black/35 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Sheet — drops from the top, hugs both edges */}
          <motion.section
            key="notif-sheet"
            initial={{ y: '-100%', opacity: 0.6 }}
            animate={{ y: 0,       opacity: 1   }}
            exit   ={{ y: '-100%', opacity: 0.4 }}
            transition={{ type: 'spring', stiffness: 360, damping: 38 }}
            className="fixed inset-x-0 top-0 z-[60] bg-white overflow-hidden flex flex-col"
            style={{
              paddingTop: 'env(safe-area-inset-top, 0px)',
              maxHeight: '85vh',
              borderBottomLeftRadius:  28,
              borderBottomRightRadius: 28,
              boxShadow: '0 10px 32px rgba(0,0,0,0.25)',
            }}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <Bell size={17} className="text-sniffy-purple flex-shrink-0"/>
                <h2 className="text-base font-extrabold text-gray-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-widest text-white px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: '#ef4444' }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {onRefresh && (
                  <button
                    type="button"
                    onClick={onRefresh}
                    aria-label="Refresh notifications"
                    className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 transition flex items-center justify-center"
                  >
                    <RefreshCw
                      size={14}
                      className={`text-gray-500 ${loading ? 'animate-spin' : ''}`}
                    />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close notifications"
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
                >
                  <X size={15} className="text-gray-500"/>
                </button>
              </div>
            </div>

            {/* ── Mark all read action bar ── */}
            {unreadCount > 0 && onMarkAllRead && (
              <div className="px-5 py-2 border-b border-gray-50 flex justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sniffy-purple hover:text-purple-800 transition"
                >
                  <CheckCheck size={13}/>
                  Mark all as read
                </button>
              </div>
            )}

            {/* ── Body ── */}
            <div className="overflow-y-auto flex-1">
              {error ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center bg-red-50">
                    <AlertCircle size={22} className="text-red-500"/>
                  </div>
                  <p className="text-sm font-bold text-gray-800">Couldn't load notifications</p>
                  <p className="text-xs text-gray-500 mt-1 px-4 leading-relaxed">{error}</p>
                  {onRefresh && (
                    <button
                      type="button"
                      onClick={onRefresh}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-sniffy-purple text-white hover:bg-purple-900 transition"
                    >
                      <RefreshCw size={12}/> Try again
                    </button>
                  )}
                </div>
              ) : loading && visibleCount === 0 ? (
                <ul className="animate-pulse">
                  {[1, 2, 3].map(i => (
                    <li key={i} className="flex items-start gap-3 px-5 py-4 border-b border-gray-50">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-200 mt-1.5"/>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-4/5 mb-2"/>
                        <div className="h-2.5 bg-gray-100 rounded w-3/5"/>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : visibleCount === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{ background: 'rgba(124,58,237,0.08)' }}
                  >
                    <Bell size={26} className="text-sniffy-purple opacity-70"/>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">You're all caught up</p>
                  <p className="text-xs text-gray-400 mt-1">
                    New alerts will show up here as they come in.
                  </p>
                </div>
              ) : (
                <ul>
                  {notifications.map(n => {
                    const isUnread = !n.read;
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => {
                            // Mark just this one as read, then route.
                            if (isUnread && onMarkAsRead) onMarkAsRead(n.id);
                            onSelect(n);
                          }}
                          className={`w-full flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 transition text-left relative ${
                            isUnread
                              ? 'bg-purple-50/40 hover:bg-purple-50 active:bg-purple-100'
                              : 'hover:bg-gray-50 active:bg-gray-100'
                          }`}
                        >
                          {/* Left accent bar — drawn only for unread,
                              echoes the colour of the accent dot */}
                          {isUnread && (
                            <span
                              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                              style={{ background: accentColor(n.accent) }}
                              aria-hidden="true"
                            />
                          )}

                          {/* Accent dot */}
                          <span
                            className={`rounded-full flex-shrink-0 mt-1.5 ${isUnread ? 'w-3 h-3' : 'w-2.5 h-2.5 opacity-50'}`}
                            style={{ background: accentColor(n.accent) }}
                          />

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug ${isUnread ? 'font-extrabold text-gray-900' : 'font-bold text-gray-500'}`}>
                              {n.title}
                            </p>
                            {n.body && (
                              <p className={`text-xs mt-0.5 leading-relaxed ${isUnread ? 'text-gray-600' : 'text-gray-400'}`}>
                                {n.body}
                              </p>
                            )}
                            <p className="text-[10px] text-gray-400 mt-1 font-semibold uppercase tracking-wide">
                              {relativeTime(n.at)}
                            </p>
                          </div>

                          {/* Tiny unread dot on the right edge */}
                          {isUnread && (
                            <span
                              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                              style={{ background: '#ef4444' }}
                              aria-label="Unread"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
