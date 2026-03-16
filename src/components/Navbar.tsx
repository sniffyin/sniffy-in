import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, MapPin } from 'lucide-react';

export const navLinks = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'FAQs',         href: '/faqs' },
  { label: 'Why Sniffy',   href: '/why-sniffy' },
  { label: 'Blogs',        href: '/blogs' },
  { label: 'About Us',     href: '/about' },
  { label: 'Contact',      href: '/contact' },
  { label: 'Be a Groomer', href: '/groomer-onboarding' },
];

const ALL_LOCALITIES = [
  { name: 'Dhanori',          slug: 'dog-grooming-in-pune/dhanori' },
  { name: 'Wagholi',          slug: 'dog-grooming-in-pune/wagholi' },
  { name: 'Kalyani Nagar',    slug: 'dog-grooming-in-pune/kalyani-nagar' },
  { name: 'Lohegaon',         slug: 'dog-grooming-in-pune/lohegaon' },
  { name: 'Kharadi',          slug: 'dog-grooming-in-pune/kharadi' },
  { name: 'Viman Nagar',      slug: 'dog-grooming-in-pune/viman-nagar' },
  { name: 'Mundwa',           slug: 'dog-grooming-in-pune/mundwa' },
  { name: 'Koregaon Park',    slug: 'dog-grooming-in-pune/koregaon-park' },
  { name: 'Kothrud',          slug: 'dog-grooming-in-pune/kothrud' },
  { name: 'Shivajinagar',     slug: 'dog-grooming-in-pune/shivajinagar' },
  { name: 'Dhayari',          slug: 'dog-grooming-in-pune/dhayari' },
  { name: 'Karve Nagar',      slug: 'dog-grooming-in-pune/karve-nagar' },
  { name: 'Ambegaon',         slug: 'dog-grooming-in-pune/ambegaon' },
  { name: 'Baner',            slug: 'dog-grooming-in-pune/baner' },
  { name: 'Bavdhan',          slug: 'dog-grooming-in-pune/bavdhan' },
  { name: 'Wakad',            slug: 'dog-grooming-in-pune/wakad' },
  { name: 'Pimpri-Chinchwad', slug: 'dog-grooming-in-pune/pimpri-chinchwad' },
  { name: 'Khadki',           slug: 'dog-grooming-in-pune/khadki' },
  { name: 'Ravet',            slug: 'dog-grooming-in-pune/ravet' },
  { name: 'Aundh',            slug: 'dog-grooming-in-pune/aundh' },
  { name: 'Kalewadi',         slug: 'dog-grooming-in-pune/kalewadi' },
  { name: 'Kondhwa',          slug: 'dog-grooming-in-pune/kondhwa' },
  { name: 'NIBM',             slug: 'dog-grooming-in-pune/nibm' },
  { name: 'Katraj',           slug: 'dog-grooming-in-pune/katraj' },
  { name: 'Handewadi',        slug: 'dog-grooming-in-pune/handewadi' },
  { name: 'Hadapsar',         slug: 'dog-grooming-in-pune/hadapsar' },
  { name: 'Bibewadi',         slug: 'dog-grooming-in-pune/bibewadi' },
  { name: 'Camp',             slug: 'dog-grooming-in-pune/camp' },
  { name: 'Wanowrie',         slug: 'dog-grooming-in-pune/wanowrie' },
];

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

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mobile locality search (inside slide panel)

function MobileLocalitySearch({ onNavigate }: { onNavigate: () => void }) {
  const [query, setQuery] = useState('');

  const results = query.trim().length > 0
    ? ALL_LOCALITIES.filter(l =>
        l.name.toLowerCase().includes(query.trim().toLowerCase())
      ).slice(0, 8)
    : [];

  function navigate(slug: string) {
    onNavigate();
    window.location.href = `/${slug}`;
  }

  return (
    <div className="px-6 pt-5 pb-3 flex flex-col">

      {/* RESULTS LIST */}
      <div className="mt-2">
        {results.length > 0 ? (
          results.map(loc => (
            <button
              key={loc.slug}
              onMouseDown={() => navigate(loc.slug)}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-left hover:bg-purple-50 transition-colors group"
            >
              <MapPin size={12} className="text-gray-300 group-hover:text-sniffy-purple" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-sniffy-purple">
                {loc.name}
              </span>
              <span className="ml-auto text-[10px] text-gray-300">→</span>
            </button>
          ))
        ) : query ? (
          <p className="text-xs text-gray-400 px-2 py-3">
            No area found for "{query}"
          </p>
        ) : null}
      </div>

      {/* SEARCH BAR */}
      <div className="pt-4 border-t border-gray-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          Find your area
        </p>
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-sniffy-purple focus-within:bg-white transition-all">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            placeholder="Search locality..."
            onChange={e => setQuery(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 w-full"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

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

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 24); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const mobileMenu = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            key="panel"
            className="fixed top-0 right-0 h-full w-72 bg-white flex flex-col shadow-2xl overflow-y-auto"
            style={{ zIndex: 9999 }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
              <a href="/" onClick={() => setOpen(false)}>
                <img src="/sniffy-logo.png" alt="Sniffy" className="w-24" />
              </a>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Nav links */}
            <ul className="flex flex-col px-6 pt-4 gap-1">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={
                      'flex items-center justify-between py-3.5 px-4 rounded-2xl font-semibold text-sm transition-colors group ' +
                      (activePath === link.href
                        ? 'bg-purple-50 text-sniffy-purple'
                        : 'text-gray-800 hover:bg-purple-50 hover:text-sniffy-purple')
                    }
                  >
                    {link.label}
                    <span className="text-sniffy-yellow opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none">→</span>
                  </a>
                </motion.li>
              ))}
            </ul>

            {/* Book button */}
            {/* <div className="px-6 pb-2 pt-4">
              <a
                href="/#booking"
                onClick={() => setOpen(false)}
                className="block w-full bg-sniffy-purple text-white text-center font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition-all"
              >
                Book a Grooming Session
              </a>
              <p className="text-center text-xs text-gray-400 mt-3">We'll call you to confirm</p>
            </div> */}

            {/* Locality search — AFTER the book button */}
            <div className="h-px bg-gray-100 mx-6 mt-4" />
            <MobileLocalitySearch onNavigate={() => setOpen(false)} />

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

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
            {/* <li>
              <a
                href="/#booking"
                className="bg-sniffy-purple text-white text-sm font-bold px-5 py-2.5 rounded-full hover:opacity-90 transition-all"
              >
                Book Now
              </a>
            </li> */}
          </ul>

          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-sniffy-purple text-white flex-shrink-0 shadow-md"
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X size={18} />
                </motion.span>
              ) : (
                <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

        </nav>
      </div>

      {typeof document !== 'undefined' && createPortal(mobileMenu, document.body)}
    </>
  );
}
