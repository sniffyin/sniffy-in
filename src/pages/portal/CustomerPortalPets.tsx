/**
 * portal/CustomerPortalPets.tsx — Phase 4
 *
 * Self-service pet roster.  Customer can:
 *   • View their pets (active + inactive)
 *   • Edit pet info (name, breed, age, medical, behavior notes, weight, color)
 *   • Add new pets
 *   • Mark a pet inactive (soft delete preserves session history)
 *
 * Reuses the admin PetEditCard pattern by re-importing it — RLS
 * scoping at the DB level means the same UI shows only this
 * customer's pets without needing customer-specific code.
 *
 * Reused components (PetEditCard, AddPetInline) live in the admin
 * folder for now.  Their queries hit Supabase directly; the RLS
 * policies on `pets` from Phase 4 ensure a portal user can only see
 * their own rows.
 */

import { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, AlertCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Customer, Pet } from '../admin/customerTypes';
import PetEditCard, { AddPetInline } from '../admin/PetEditCard';

export default function CustomerPortalPets({ customer }: {
  customer: Customer;
  onCustomerChanged: () => void;
}) {
  const [pets, setPets]     = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // Explicit customer scope — see comment in CustomerPortalDashboard.
      const { data: petData, error: petErr } = await supabase
        .from('pets')
        .select('*')
        .eq('customer_id', customer.id)
        .order('is_active', { ascending: false })   // active first
        .order('created_at', { ascending: true });
      if (petErr) throw petErr;
      const rows = (petData ?? []) as Pet[];
      setPets(rows);

      // Per-pet visit counts (same query the admin uses).
      if (rows.length > 0) {
        const ids = rows.map(p => p.id);
        const { data: spData, error: spErr } = await supabase
          .from('session_pets')
          .select('pet_id')
          .in('pet_id', ids);
        if (spErr) {
          console.warn('[CustomerPortalPets] session count fetch failed:', spErr);
          setSessionCounts({});
        } else {
          const counts: Record<string, number> = {};
          for (const r of (spData ?? []) as { pet_id: string }[]) {
            counts[r.pet_id] = (counts[r.pet_id] ?? 0) + 1;
          }
          setSessionCounts(counts);
        }
      } else {
        setSessionCounts({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load, customer.id]);

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl font-extrabold text-gray-900">Your pets</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Keep this list up to date — your groomer reads it before every visit.
        </p>
      </header>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <AlertCircle size={13} className="mt-0.5 shrink-0 text-red-500"/>
          <span className="flex-1 break-words">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400">
            <X size={11}/>
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : (
        <div className="space-y-2">
          {pets.length === 0 && !adding && (
            <div className="text-center py-10 px-4 bg-white border border-dashed border-gray-200 rounded-2xl">
              <p className="text-4xl mb-2">🐾</p>
              <p className="text-sm font-bold text-gray-700">No pets on file yet</p>
              <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                Once you've had a grooming session your pets appear here.  You can also add them manually below.
              </p>
            </div>
          )}

          {pets.map(p => (
            <PetEditCard
              key={p.id}
              pet={p}
              sessionCount={sessionCounts[p.id] ?? 0}
              onChanged={load}
              createdBy="customer"
            />
          ))}

          {adding ? (
            <AddPetInline
              customerId={customer.id}
              onCreated={() => { setAdding(false); load(); }}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl text-sm font-bold text-sniffy-purple bg-purple-50 border border-dashed border-purple-200 hover:bg-purple-100 transition"
            >
              {loading ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>}
              Add a pet
            </button>
          )}
        </div>
      )}
    </div>
  );
}
