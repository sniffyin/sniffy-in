import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Search, MapPin } from 'lucide-react';
import { navLinks, ALL_LOCALITIES } from './navbarData';

export { navLinks };

// The slide-out panel (backdrop + links + mobile search) pulls in
// framer-motion. Lazy-loading it means every public page's eager bundle
// skips that ~39 KB gzipped dependency until someone actually taps the
// hamburger icon — see MobileMenu.tsx's header comment for the full context.
//
// Kept as a named function (not inlined in `lazy()`) so `prefetchMobileMenu`
// below can call the exact same import, warming the browser's module cache
// ahead of the tap instead of only starting the fetch on it.
const importMobileMenu = () => import('./MobileMenu');
const MobileMenu = lazy(importMobileMenu);

// Instant, zero-network placeholder shown only if someone taps the hamburger
// before the prefetch below has finished (slow connection, or a tap within
// the first second of page load). Mirrors the real panel's shape — a
// right-edge sheet behind a dimmed backdrop — so the swap-in doesn't jump,
// and the backdrop is clickable so a tap-away still closes it immediately.
function MobileMenuFallback({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl flex items-center justify-center"
        style={{ zIndex: 9999 }}
      >
        <div className="h-8 w-8 rounded-full border-2 border-sniffy-purple/25 border-t-sniffy-purple animate-spin" />
      </div>
    </>
  );
}

// Desktop locality search

function LocalitySearch({ scrolled }: { scrolled: boolean }) {
  const [query, setQuery]         = useState('');
  const [focused, setFocused]     = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

  const results = query.trim().length > 0
    ? ALL_LOCALITIES.filter(l =>
        l.name.toLowerCase().includes(query.trim().toLowerCase())
      ).slice(0, 7)
    : [];

  const showDropdown = focused && results.length > 0;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function navigate(slug: string) {
    setQuery('');
    setFocused(false);
    window.location.href = `/${slug}`;
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0 && results[activeIdx]) navigate(results[activeIdx].slug);
      else if (results.length === 1) navigate(results[0].slug);
    } else if (e.key === 'Escape') {
      setFocused(false);
      setActiveIdx(-1);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={wrapRef} className="relative hidden md:block">
      <div className={[
        'flex items-center gap-2.5 px-4 py-2 rounded-full border w-64 transition-all duration-300',
        focused
          ? 'bg-white border-sniffy-purple shadow-lg shadow-purple-100/60'
          : 'bg-white/60 border-purple-200/60 backdrop-blur-sm hover:border-sniffy-purple/50 hover:bg-white/80',
      ].join(' ')}>
        <Search size={14} className="flex-shrink-0 text-sniffy-purple" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search your area..."
          onChange={e => { setQuery(e.target.value); setActiveIdx(-1); }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKey}
          className="bg-transparent outline-none text-sm font-medium w-full text-gray-800 placeholder-gray-400"
        />
        {query && (
          <button
            onMouseDown={e => { e.preventDefault(); setQuery(''); inputRef.current?.focus(); }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Was framer-motion AnimatePresence/motion.div — plain conditional
          render + a CSS keyframe (animate-locality-dropdown-in) instead, so
          this top-of-bundle component doesn't need framer-motion. Loses the
          exit animation (it just disappears), which is an acceptable trade
          for a minor flourish on every public page's critical path. */}
      {showDropdown && (
        <div
          className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-locality-dropdown-in"
        >
          <div className="px-4 py-2 border-b border-gray-50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Areas in Pune</p>
          </div>
          <ul>
            {results.map((loc, i) => (
              <li key={loc.slug}>
                <button
                  onMouseDown={() => navigate(loc.slug)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === activeIdx ? 'bg-purple-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    i === activeIdx ? 'bg-sniffy-purple' : 'bg-gray-100'
                  }`}>
                    <MapPin size={11} className={i === activeIdx ? 'text-white' : 'text-gray-400'} />
                  </div>
                  <span className={`text-sm font-medium transition-colors ${i === activeIdx ? 'text-sniffy-purple' : 'text-gray-700'}`}>
                    {loc.name}
                  </span>
                  <span className="ml-auto text-[11px] text-gray-300">Pune</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Navbar

interface NavbarProps {
  activePath?: string;
}

export default function Navbar({ activePath = '' }: NavbarProps) {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Gates the MobileMenu lazy import: flips true (and stays true) the first
  // time the hamburger is tapped, so the framer-motion chunk is fetched once,
  // on demand — not on every page load — but stays mounted afterwards so its
  // own AnimatePresence can still animate the close transition.
  const [menuEverOpened, setMenuEverOpened] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 24); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Warm the mobile-menu chunk (and the framer-motion it pulls in) once the
  // browser goes idle after this page's own render/paint work is done — not
  // during it, so this doesn't undo the point of lazy-loading it in the
  // first place. By the time a real visitor finds and taps the hamburger,
  // the module is normally already cached, so the panel appears instantly
  // instead of waiting on a cold fetch. requestIdleCallback isn't in Safari,
  // so a short timeout stands in there.
  useEffect(() => {
    // lib.dom types requestIdleCallback as always present on Window, so a
    // plain `'requestIdleCallback' in window` check makes TS treat the
    // Safari-lacks-it branch as unreachable (`never`). Routing the feature
    // test through a loosely-typed read sidesteps that without an `any` cast
    // on `window` itself.
    const ric = (window as { requestIdleCallback?: typeof window.requestIdleCallback })
      .requestIdleCallback;
    if (typeof ric === 'function') {
      const id = ric(() => { importMobileMenu(); }, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => { importMobileMenu(); }, 2000);
    return () => window.clearTimeout(id);
  }, []);

  const toggleOpen = useCallback(() => {
    setOpen(v => !v);
    setMenuEverOpened(true);
  }, []);

  return (
    <>
      <div className={`transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
          : 'bg-transparent'
      }`}>
        <nav className="flex items-center justify-between gap-4 px-4 md:px-8 py-4 max-w-7xl mx-auto w-full">

          <a href="/" className="flex-shrink-0">
            <img src="/sniffy-logo.png" alt="Sniffy Pet Partners" className="w-28" />
          </a>

          <div className="flex-1 flex justify-center">
            <LocalitySearch scrolled={scrolled} />
          </div>

          <ul className="hidden md:flex items-center gap-6 flex-shrink-0">
            {navLinks.map((link) => {
              const isActive =
                activePath === link.href ||
                activePath.startsWith(link.href.replace('/#', '/'));
              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={
                      'text-sm font-semibold transition-colors relative group ' +
                      (isActive
                        ? 'text-sniffy-purple'
                        : 'text-gray-700 hover:text-sniffy-purple')
                    }
                  >
                    {link.label}
                    <span className={
                      'absolute -bottom-0.5 left-0 h-0.5 bg-sniffy-yellow rounded-full transition-all duration-300 ' +
                      (isActive ? 'w-full' : 'w-0 group-hover:w-full')
                    } />
                  </a>
                </li>
              );
            })}
          </ul>

          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-sniffy-purple text-white flex-shrink-0 shadow-md"
            onClick={toggleOpen}
            aria-label="Toggle menu"
          >
            {/* Was framer-motion AnimatePresence swapping Menu/X — the `key`
                change below remounts the span on every toggle, retriggering
                the CSS enter keyframe (animate-nav-icon-swap) each time. */}
            <span key={open ? 'close' : 'open'} className="inline-flex items-center justify-center animate-nav-icon-swap">
              {open ? <X size={18} /> : <Menu size={18} />}
            </span>
          </button>

        </nav>
      </div>

      {menuEverOpened && typeof document !== 'undefined' && createPortal(
        <Suspense fallback={<MobileMenuFallback onClose={() => setOpen(false)} />}>
          <MobileMenu open={open} setOpen={setOpen} activePath={activePath} />
        </Suspense>,
        document.body
      )}
    </>
  );
}
