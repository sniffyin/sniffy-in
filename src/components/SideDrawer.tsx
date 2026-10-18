/**
 * SideDrawer.tsx — slide-from-left navigation drawer.
 *
 * Triggered by tapping the avatar in MobileTopBar.  Covers the
 * overflow nav items + settings + logout — everything that doesn't
 * fit in the bottom-tab bar.  Pattern mirrors the Woofly reference:
 * user header → list of menu items → logout pinned at bottom → small
 * brand logo at the very bottom.
 *
 * Props-driven so the same drawer is used for both admin and groomer
 * dashboards — only the `items` array differs.  Items with
 * `accent === 'danger'` render in red and get pinned to the footer
 * (intended for "Log Out").
 */

import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { Avatar, type TopBarUser } from './MobileTopBar';

export interface DrawerItem {
  label: string;
  Icon: React.ElementType;
  /** 'danger' = red text + pinned at bottom (used for Log Out). */
  accent?: 'default' | 'danger';
  /** Optional small caption shown to the right of the chevron — handy
   *  for things like "v1.0.3" next to a Settings row. */
  badge?: string;
  onClick: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  user: TopBarUser;
  /** Subtitle under the user's name in the header — e.g. "Pet Partners
   *  Admin" / "Groomer Portal". */
  roleLabel: string;
  items: DrawerItem[];
}

export default function SideDrawer({ open, onClose, user, roleLabel, items }: Props) {
  // Split items so a `danger` entry (typically Log Out) gets pinned
  // at the bottom.  Order within each group is preserved.
  const normal = items.filter(i => i.accent !== 'danger');
  const danger = items.filter(i => i.accent === 'danger');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — close on tap */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            className="fixed inset-y-0 left-0 z-[60] bg-white flex flex-col"
            style={{
              width: '85%',
              maxWidth: 340,
              boxShadow: '4px 0 32px rgba(0,0,0,0.18)',
            }}
          >
            {/* ── Header (purple) — avatar, name, role ── */}
            <div
              className="relative px-5 pt-6 pb-7"
              style={{
                paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
                background: 'linear-gradient(135deg, #5b25b0 0%, #451a8b 100%)',
                borderBottomRightRadius: 28,
              }}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white/85 hover:bg-white/10 transition"
                style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
              >
                <X size={17}/>
              </button>

              <Avatar initials={user.avatarInitials} photoUrl={user.photoUrl} size={56}/>
              <p className="text-lg font-extrabold text-white mt-3 leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 mt-1">
                {roleLabel}
              </p>
            </div>

            {/* ── Menu list ── */}
            <nav className="flex-1 overflow-y-auto py-2">
              {normal.map(item => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => { onClose(); item.onClick(); }}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition text-left border-b border-gray-50"
                >
                  <span className="flex items-center gap-3.5 min-w-0">
                    <item.Icon size={20} className="text-gray-500 flex-shrink-0"/>
                    <span className="text-[15px] font-semibold text-gray-800 truncate">
                      {item.label}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 flex-shrink-0">
                    {item.badge && (
                      <span className="text-[10px] font-bold text-gray-400">{item.badge}</span>
                    )}
                    <ChevronRight size={16} className="text-gray-300"/>
                  </span>
                </button>
              ))}
            </nav>

            {/* ── Footer — danger items + Sniffy logo ── */}
            <div className="border-t border-gray-100" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
              {danger.map(item => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => { onClose(); item.onClick(); }}
                  className="w-full flex items-center justify-between px-5 py-4 text-red-500 hover:bg-red-50 active:bg-red-100 transition text-left"
                >
                  <span className="flex items-center gap-3.5">
                    <item.Icon size={20}/>
                    <span className="text-[15px] font-bold">{item.label}</span>
                  </span>
                  <ChevronRight size={16} className="text-red-300"/>
                </button>
              ))}
              <div className="text-center pt-3 pb-2">
                <img
                  src="/sniffy-logo.png"
                  alt="Sniffy"
                  className="h-7 mx-auto opacity-50 object-contain"
                />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
