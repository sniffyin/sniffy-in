/**
 * admin/CustomerPickerChip.tsx — Phase 2b
 *
 * A pill-shaped filter chip that lets the coordinator pick a single
 * customer to scope a list (SessionsTab, FollowUpsTab, etc).  Mirrors
 * the visual + interaction model of MonthPicker so the filter rows
 * stay consistent across the admin app.
 *
 * Controlled component — the parent owns the picked customer id and
 * display label so the filter survives tab navigation.  When picked,
 * we fire `onChange(id, label)`; when cleared, `onChange(null, '')`.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRound, Search, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Customer, formatPhoneDisplay } from './customerTypes';

export default function CustomerPickerChip({
  value, label, onChange,
}: {
  value: string | null;            // selected customer id
  label: string;                   // selected customer's display label
  onChange: (id: string | null, label: string) => void;
}) {
  const [open, setOpen]         = useState(false);
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  // Debounced search — name or phone.
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const digits = q.replace(/[^0-9]/g, '');
      const phonePattern = digits ? `%${digits}%` : null;
      const req = phonePattern
        ? supabase.from('customers').select('*').or(
            `name.ilike.%${q}%,phone.ilike.${phonePattern},phone_raw.ilike.${phonePattern}`
          )
        : supabase.from('customers').select('*').ilike('name', `%${q}%`);
      const { data, error } = await req
        .order('last_session_at', { ascending: false, nullsFirst: false })
        .limit(15);
      if (error) {
        console.warn('[CustomerPickerChip] search failed:', error);
        setResults([]);
      } else {
        setResults((data ?? []) as Customer[]);
      }
      setSearching(false);
    }, 200);
    return () => clearTimeout(t);
  }, [query, open]);

  const isActive = !!value;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-semibold transition-all ${
          isActive
            ? 'bg-sniffy-purple text-white border-sniffy-purple shadow-sm'
            : 'bg-white text-gray-600 border-gray-200 hover:border-sniffy-purple hover:text-sniffy-purple'
        }`}
      >
        <UserRound size={13}/>
        <span className="truncate max-w-[140px]">{isActive ? label : 'Any customer'}</span>
        {isActive && (
          <span
            onClick={e => { e.stopPropagation(); onChange(null, ''); setQuery(''); }}
            className="ml-0.5 hover:opacity-70 cursor-pointer"
          >
            <X size={11}/>
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-11 z-50 bg-white rounded-2xl border border-gray-100 w-80 overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(69,26,139,0.14), 0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <div className="p-3 border-b border-gray-100 relative">
              <Search size={13} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input
                type="search"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Name or phone…"
                className="w-full pl-8 pr-8 h-9 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-sniffy-purple focus:ring-1 focus:ring-sniffy-purple/20 transition"
              />
              {searching && (
                <Loader2 size={13} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"/>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto p-1.5">
              {query.trim().length < 2 ? (
                <p className="text-[11px] text-gray-400 italic py-4 text-center">Type at least 2 characters…</p>
              ) : results.length === 0 && !searching ? (
                <p className="text-[11px] text-gray-400 italic py-4 text-center">No customers match.</p>
              ) : (
                results.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      const labelOut = c.name || formatPhoneDisplay(c.phone);
                      onChange(c.id, labelOut);
                      setOpen(false);
                      setQuery('');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-purple-50 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-gray-900 truncate">
                        {c.name || <span className="text-gray-400 italic">No name</span>}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0">{c.total_sessions}×</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {formatPhoneDisplay(c.phone)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
