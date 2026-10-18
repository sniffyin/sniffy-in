/**
 * MobileMenu.tsx — the slide-out mobile nav panel (backdrop + links + locality
 * search), split out of Navbar.tsx so `framer-motion` isn't forced into the
 * eager bundle every public page loads. Navbar lazy-imports this file and only
 * mounts it the first time the hamburger is tapped (see Navbar.tsx) — from then
 * on it stays mounted so AnimatePresence can still animate the close transition.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MapPin } from 'lucide-react';
import { navLinks, ALL_LOCALITIES } from './navbarData';

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

interface MobileMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  activePath: string;
}

export default function MobileMenu({ open, setOpen, activePath }: MobileMenuProps) {
  return (
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

            {/* Locality search — AFTER the book button */}
            <div className="h-px bg-gray-100 mx-6 mt-4" />
            <MobileLocalitySearch onNavigate={() => setOpen(false)} />

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
