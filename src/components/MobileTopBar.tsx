/**
 * MobileTopBar.tsx — sticky purple header for the admin & groomer apps.
 *
 *   [ avatar  Welcome back            🔔 ]
 *   [ ◯       Kristin                 ●3 ]
 *
 * Left half is a single button — tapping anywhere in the avatar / name
 * block opens the side drawer.  Right side is the notifications bell
 * with an unread count badge.
 *
 * The bar is `sm:hidden` — desktop keeps its existing purple hero +
 * horizontal tab nav.  We only redesign the mobile shell.
 */

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

/** Minimal shape the top bar needs to render the user.  Both
 *  `AdminUser` (admin/coordinator/viewer) and `GroomerUser` already
 *  satisfy this structurally, so the component is shared.
 *
 *  `photoUrl` is optional — when present we render the image;
 *  otherwise we fall back to the initials chip.  This makes the
 *  component work uniformly across admin (no photo yet) and groomer
 *  (photo set via the admin's Groomers tab → groomers.photo_url). */
export interface TopBarUser {
  name: string;
  avatarInitials: string;
  photoUrl?: string | null;
}

interface Props {
  user: TopBarUser;
  /** Count rendered inside the red dot.  Pass 0 to hide the badge. */
  notificationCount: number;
  onOpenDrawer: () => void;
  onOpenNotifications: () => void;
  /** Small caption above the user's first name.  Defaults to "Welcome back". */
  greeting?: string;
}

/** Avatar primitive used by MobileTopBar AND SideDrawer.
 *
 *  - When `photoUrl` is set, renders an <img> with a subtle ring.
 *  - When the image fails to load (404, CORS, etc.), automatically
 *    falls back to the initials chip — so a broken URL never leaves
 *    the user staring at an empty circle.
 *  - When `photoUrl` is missing, renders the initials chip directly.
 *
 *  `size` controls both width and height in pixels. */
export function Avatar({
  initials, photoUrl, size = 40,
}: {
  initials: string;
  photoUrl?: string | null;
  size?: number;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  // Reset the failure flag if the URL changes — a fresh upload should
  // get another chance to render before we declare it broken.
  useEffect(() => { setImgFailed(false); }, [photoUrl]);

  if (photoUrl && !imgFailed) {
    return (
      <img
        src={photoUrl}
        alt={initials}
        loading="eager"
        decoding="async"
        onError={() => setImgFailed(true)}
        className="rounded-full object-cover flex-shrink-0 select-none bg-amber-100"
        style={{
          width: size,
          height: size,
          border: '2px solid rgba(255,255,255,0.95)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-extrabold text-amber-900 flex-shrink-0 select-none"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #fde68a 0%, #f6ac0a 100%)',
        border: '2px solid rgba(255,255,255,0.95)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        fontSize: size * 0.38,
        letterSpacing: '0.02em',
      }}
    >
      {initials}
    </div>
  );
}

/** Backwards-compatible alias — older imports still reference this. */
export const AvatarInitials = Avatar;

export default function MobileTopBar({
  user,
  notificationCount,
  onOpenDrawer,
  onOpenNotifications,
  greeting = 'Welcome back',
}: Props) {
  const firstName = (user.name ?? '').split(' ')[0] || user.name;

  return (
    <header
      className="sm:hidden sticky top-0 z-30"
      style={{
        // Pad past the iOS notch — the colored gradient extends into the
        // safe area so the status bar text sits on purple, not on a
        // jarring white seam.
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background: 'linear-gradient(135deg, #5b25b0 0%, #451a8b 100%)',
        // The reference image has rounded bottom corners — gives the
        // bar a "card" feel and reads more "app", less "web".
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        boxShadow: '0 6px 24px rgba(69,26,139,0.28)',
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        {/* Left — avatar + welcome (single tap target → drawer) */}
        <motion.button
          type="button"
          onClick={onOpenDrawer}
          whileTap={{ scale: 0.97 }}
          aria-label={`Open ${firstName}'s menu`}
          className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-2xl py-1 -my-1 -ml-1 pl-1 pr-3"
        >
          <Avatar initials={user.avatarInitials} photoUrl={user.photoUrl}/>
          <div className="min-w-0 leading-tight">
            <p className="text-[11px] font-medium text-white/70">{greeting}</p>
            <p className="text-base font-extrabold text-white truncate">
              {firstName}
            </p>
          </div>
        </motion.button>

        {/* Right — notifications bell */}
        <motion.button
          type="button"
          onClick={onOpenNotifications}
          whileTap={{ scale: 0.92 }}
          aria-label={notificationCount > 0 ? `${notificationCount} notifications` : 'Notifications'}
          className="relative w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',  // Safari needs the prefix
            border: '1px solid rgba(255,255,255,0.22)',
          }}
        >
          <Bell size={19} className="text-white" strokeWidth={2.2}/>
          {notificationCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-extrabold text-white px-1"
              style={{
                background: '#ef4444',
                // The 2px ring matches the purple bar so the badge
                // visually pops off the bell.  Without the ring, the
                // red blends into the purple gradient at low DPR.
                boxShadow: '0 0 0 2px #4f1ea0',
              }}
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </motion.button>
      </div>
    </header>
  );
}
