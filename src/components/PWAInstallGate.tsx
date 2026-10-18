/**
 * components/PWAInstallGate.tsx
 *
 * Two responsibilities — both keyed off the current route:
 *
 * 1) **Dynamic manifest swap** (useScopedManifest).
 *    Sniffy is a single SPA but we ship *three* installable PWAs from
 *    the same origin:
 *      • Public site  →  /favicon/site.webmanifest   (scope: "/")
 *      • Groomer app  →  /groomer.webmanifest        (scope: "/groomer")
 *      • Admin app    →  /admin.webmanifest          (scope: "/admin")
 *    Each manifest has a distinct `id` + `scope`, so the browser treats
 *    them as separate installs. To make that work in an SPA we have to
 *    point `<link rel="manifest">` at the right file based on which
 *    route the user is currently on — this hook does that.
 *
 * 2) **Install button** (InstallAppButton).
 *    Captures `beforeinstallprompt` on Android/Chromium and shows an
 *    obvious CTA so a groomer / coordinator visiting the link can install
 *    in one tap instead of waiting on Chrome's engagement heuristics.
 *    iOS Safari never fires that event, so on iOS we show a short
 *    "Share → Add to Home Screen" instruction card instead. The button
 *    is route-gated — it only appears under /groomer and /admin.
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Share, Plus, X } from 'lucide-react';

// ─── Manifest-swap hook ──────────────────────────────────────

const DEFAULT_MANIFEST = '/favicon/site.webmanifest';
const GROOMER_MANIFEST = '/groomer.webmanifest';
const ADMIN_MANIFEST   = '/admin.webmanifest';

function manifestForPath(pathname: string): string {
  if (pathname === '/groomer' || pathname.startsWith('/groomer/')) return GROOMER_MANIFEST;
  if (pathname === '/admin'   || pathname.startsWith('/admin/'))   return ADMIN_MANIFEST;
  return DEFAULT_MANIFEST;
}

function useScopedManifest() {
  const { pathname } = useLocation();
  useEffect(() => {
    const target = manifestForPath(pathname);
    // Look up the existing <link rel="manifest"> rather than appending a
    // new one — index.html already has it (and may have been used by the
    // browser as the install candidate already). We just rewrite href.
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    // Resolve to absolute href to compare reliably (the DOM normalises it).
    const absoluteTarget = new URL(target, window.location.origin).href;
    if (link.href !== absoluteTarget) {
      link.href = target;
    }
  }, [pathname]);
}

// ─── Status-bar takeover for full-screen modals ──────────────
//
// On Android Chrome PWAs the system status bar is tinted by
// `<meta name="theme-color">` (brand purple in our case). That looks
// great over the dashboard's purple banner but jars against a white
// full-screen modal — a purple band hovers above white sheet content.
//
// This hook flips the meta tag to white while a modal is open and
// restores the original value on close, so the Android status bar
// blends with the modal background while the modal is up. iOS is
// unaffected — iOS PWAs use `apple-mobile-web-app-status-bar-style`
// for their bar, not theme-color, and our existing `default` style
// already keeps that bar white-with-dark-text everywhere.
//
// Concurrent modals: if two open at once, both push their colour,
// each restoring only on its own unmount. The cleanup order means
// the deepest modal's value wins until it closes, then the next one,
// then back to the original. Good enough for our usage.
export function useModalTakesOverStatusBar(
  active: boolean,
  color: string = '#ffffff',
) {
  useEffect(() => {
    if (!active) return;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) return;
    const previous = meta.getAttribute('content');
    meta.setAttribute('content', color);
    return () => {
      // Restore exactly what was there before us — could be the
      // public-site purple, or another modal's white if nested.
      meta.setAttribute('content', previous ?? '#451a8b');
    };
  }, [active, color]);
}

// ─── Install button ──────────────────────────────────────────

// Chromium-only event — typed locally because TS lib.dom doesn't ship it.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY_PREFIX = 'sniffy:pwa-install-dismissed:';

function isIos(): boolean {
  // iPadOS reports as Mac these days — check touch capability too.
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes('Macintosh') && 'ontouchend' in document);
}

function isStandalone(): boolean {
  // Android / desktop Chrome standalone signal.
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  // iOS Safari standalone signal (non-standard property).
  if ((window.navigator as unknown as { standalone?: boolean }).standalone) return true;
  return false;
}

function variantFromPath(pathname: string): 'groomer' | 'admin' | null {
  if (pathname === '/groomer' || pathname.startsWith('/groomer/')) return 'groomer';
  if (pathname === '/admin'   || pathname.startsWith('/admin/'))   return 'admin';
  return null;
}

function InstallAppButton() {
  const { pathname } = useLocation();
  const variant = variantFromPath(pathname);

  // Captured beforeinstallprompt event (Chromium). null on iOS or once used.
  const [deferred, setDeferred]   = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  // Per-variant dismissal so a user closing the groomer banner doesn't
  // also suppress the admin one (and vice versa). Persists across reloads.
  useEffect(() => {
    if (!variant) return;
    setDismissed(localStorage.getItem(DISMISS_KEY_PREFIX + variant) === '1');
  }, [variant]);

  // Capture Chromium's install prompt — must call preventDefault to keep
  // it usable later. Also listen for `appinstalled` so we hide on success.
  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Don't show anywhere except /groomer and /admin.
  if (!variant) return null;
  // Already installed → nothing to show.
  if (installed) return null;
  // User dismissed for this variant → respect it for the session.
  if (dismissed) return null;

  const appName = variant === 'groomer' ? 'Sniffy Groomer' : 'Sniffy Admin';

  // Branch 1: Chromium captured the event → one-tap native install.
  if (deferred) {
    return (
      <FloatingBanner
        title={`Install ${appName}`}
        subtitle="Add to your home screen for quick access."
        ctaLabel="Install"
        ctaIcon={<Download size={15} />}
        onCta={async () => {
          try {
            await deferred.prompt();
            const choice = await deferred.userChoice;
            if (choice.outcome === 'accepted') {
              setInstalled(true);
            }
            setDeferred(null);
          } catch {
            // Some browsers throw if prompt() is called twice — swallow.
            setDeferred(null);
          }
        }}
        onDismiss={() => {
          localStorage.setItem(DISMISS_KEY_PREFIX + variant, '1');
          setDismissed(true);
        }}
      />
    );
  }

  // Branch 2: iOS Safari (no beforeinstallprompt) → instructions card.
  if (isIos()) {
    return (
      <>
        <FloatingBanner
          title={`Install ${appName}`}
          subtitle="Tap Share, then Add to Home Screen."
          ctaLabel="How"
          ctaIcon={<Share size={14} />}
          onCta={() => setShowIosHelp(true)}
          onDismiss={() => {
            localStorage.setItem(DISMISS_KEY_PREFIX + variant, '1');
            setDismissed(true);
          }}
        />
        {showIosHelp && (
          <IosInstructions appName={appName} onClose={() => setShowIosHelp(false)} />
        )}
      </>
    );
  }

  // Branch 3: Other browsers (older Firefox/Safari, desktop without
  // install support, or Chrome before the user has earned engagement).
  // Nothing reliable to do — stay silent rather than show a button that
  // wouldn't work.
  return null;
}

// ─── Floating banner ─────────────────────────────────────────

function FloatingBanner({
  title, subtitle, ctaLabel, ctaIcon, onCta, onDismiss,
}: {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaIcon: React.ReactNode;
  onCta: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      // Fixed bottom-center on mobile, bottom-right on larger screens.
      // High z-index so it sits above modals/sheets in the dashboards.
      className="fixed z-[70] left-3 right-3 bottom-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm"
      role="region"
      aria-label="Install app prompt"
    >
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-3 flex items-center gap-3">
        <img
          src="/favicon/web-app-manifest-192x192.png"
          alt=""
          className="w-10 h-10 rounded-xl flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-gray-900 truncate">{title}</p>
          <p className="text-[11px] text-gray-500 truncate">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onCta}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-sniffy-purple text-white text-xs font-bold hover:bg-purple-900 transition flex-shrink-0"
        >
          {ctaIcon}
          {ctaLabel}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition flex-shrink-0"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── iOS instructions sheet ──────────────────────────────────

function IosInstructions({ appName, onClose }: { appName: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-label="How to install on iPhone"
    >
      <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">Install {appName}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Open in Safari to install on iPhone / iPad</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
            <X size={17} />
          </button>
        </div>

        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sniffy-purple text-white text-[11px] font-extrabold flex items-center justify-center">1</span>
            <div className="text-sm text-gray-700 leading-snug">
              Tap the <span className="inline-flex items-center gap-1 font-semibold text-gray-900"><Share size={13} /> Share</span> button in Safari's bottom bar.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sniffy-purple text-white text-[11px] font-extrabold flex items-center justify-center">2</span>
            <div className="text-sm text-gray-700 leading-snug">
              Scroll and tap <span className="inline-flex items-center gap-1 font-semibold text-gray-900"><Plus size={13} /> Add to Home Screen</span>.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sniffy-purple text-white text-[11px] font-extrabold flex items-center justify-center">3</span>
            <div className="text-sm text-gray-700 leading-snug">
              Tap <span className="font-semibold text-gray-900">Add</span>. The {appName} icon appears on your Home Screen.
            </div>
          </li>
        </ol>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-full bg-sniffy-purple text-white text-sm font-bold hover:bg-purple-900 transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

// ─── Public component ────────────────────────────────────────

export default function PWAInstallGate() {
  useScopedManifest();
  return <InstallAppButton />;
}
