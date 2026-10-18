/**
 * admin/useSessionPets.ts
 *
 * Loads the pets of multi-pet sessions for a list of sessions, in one batched
 * query, and turns them into display lines (see buildDisplayPets).  Shared by
 * the admin session cards and every groomer screen so they all show the same
 * thing.
 *
 * Fail-soft by design: if the query errors (e.g. the per-pet-pricing
 * migration isn't applied yet) the map simply stays empty and each screen
 * keeps showing its normal single-pet display.
 */
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { buildDisplayPets, type DisplayPet, type LoadedSessionPetRow } from './sessionPets';

export interface PetDisplaySession {
  id: string;
  pet_type: 'dog' | 'cat';
  pet_name: string | null;
  breed: string | null;
  package: string | null;
  add_ons: string[] | null;
  booking_amount: number | string | null;
}

const SELECT =
  'session_id, pet_id, is_primary, sort_order, created_at, per_pet_package, per_pet_amount, per_pet_addons, per_pet_amount_expr, pets(name, type, breed, age_bucket, medical)';
const CHUNK = 80;   // keeps the `in.(…)` URL comfortably short

// Lets the session form tell every mounted list "pets changed, reload".
const listeners = new Set<() => void>();
export function invalidateSessionPets() { listeners.forEach(fn => fn()); }

type Row = LoadedSessionPetRow & { session_id: string };

export function useSessionPetDisplay(sessions: PetDisplaySession[]): Map<string, DisplayPet[]> {
  const [rowsBySession, setRowsBySession] = useState<Map<string, Row[]>>(new Map());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const fn = () => setVersion(v => v + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  const idsKey = useMemo(() => sessions.map(s => s.id).sort().join(','), [sessions]);

  useEffect(() => {
    const ids = idsKey ? idsKey.split(',') : [];
    if (ids.length === 0) { setRowsBySession(new Map()); return; }
    let cancelled = false;
    (async () => {
      const grouped = new Map<string, Row[]>();
      for (let i = 0; i < ids.length; i += CHUNK) {
        const { data, error } = await supabase
          .from('session_pets')
          .select(SELECT)
          .in('session_id', ids.slice(i, i + CHUNK));
        if (error || !data) { console.warn('[useSessionPetDisplay] pets not loaded:', error?.message); return; }
        for (const r of data as unknown as Row[]) {
          const list = grouped.get(r.session_id) ?? [];
          list.push(r); grouped.set(r.session_id, list);
        }
      }
      if (cancelled) return;
      // Only sessions with more than one pet need special display.
      for (const [k, v] of grouped) if (v.length < 2) grouped.delete(k);
      setRowsBySession(grouped);
    })();
    return () => { cancelled = true; };
  }, [idsKey, version]);

  return useMemo(() => {
    const out = new Map<string, DisplayPet[]>();
    for (const s of sessions) {
      const rows = rowsBySession.get(s.id);
      if (!rows) continue;
      const pets = buildDisplayPets(s, rows);
      if (pets.length > 0) out.set(s.id, pets);
    }
    return out;
  }, [sessions, rowsBySession]);
}
