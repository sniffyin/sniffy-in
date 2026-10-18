/**
 * admin/VaccinationsEditor.tsx — Phase 6c
 *
 * Inline vaccination record editor.  Shared between the admin
 * PetEditCard (coordinator view) and the customer portal pets page —
 * RLS scopes which rows each surface sees.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────┐
 *   │ Vaccinations · 3 records              [+ Add]    │
 *   │ • Rabies · administered 12-Mar · due 12-Mar-2027 │
 *   │ • DHPP   · administered 04-Apr · due 04-Apr-2027 │
 *   │ • FVRCP  · administered 11-Jan · OVERDUE 17 days │
 *   └──────────────────────────────────────────────────┘
 *
 * Adding a vaccine:
 *   1. Pick vaccine_type from a species-scoped dropdown.
 *   2. Enter administered_on (defaults to today).
 *   3. due_on is auto-suggested from the type's typical_interval_months;
 *      user can override before save.
 *   4. Optional: veterinarian, notes.
 *
 * Editing is just delete + re-add (kept simple — vaccination dates
 * rarely change after the fact; usually you add a new dose).
 */

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Syringe, Trash2, AlertCircle, X, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Pet, PetVaccination, VaccineType, vaccinationSummary } from './customerTypes';

export default function VaccinationsEditor({
  pet, createdBy,
}: {
  pet: Pet;
  /** Who's logging the vaccination — coordinator name in admin, 'customer' from portal. */
  createdBy?: string;
}) {
  const [types, setTypes]               = useState<VaccineType[]>([]);
  const [records, setRecords]           = useState<PetVaccination[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [addingOpen, setAddingOpen]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Filter the type dropdown by the pet's species (or 'both').  Memoised
  // so we don't recompute on every render of the add form.
  const speciesTypes = useMemo(
    () => types.filter(t => t.species === pet.type || t.species === 'both').sort((a, b) => a.sort_order - b.sort_order),
    [types, pet.type],
  );

  async function reload() {
    setLoading(true); setError(null);
    try {
      const [typesRes, recordsRes] = await Promise.all([
        supabase.from('vaccine_types').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('pet_vaccinations').select('*').eq('pet_id', pet.id).order('administered_on', { ascending: false }),
      ]);
      if (typesRes.error) throw typesRes.error;
      if (recordsRes.error) throw recordsRes.error;
      setTypes((typesRes.data ?? []) as VaccineType[]);
      setRecords((recordsRes.data ?? []) as PetVaccination[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setLoading(false); }
  }

  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pet.id]);

  async function deleteRecord(id: string) {
    setError(null);
    try {
      const { error: err } = await supabase.from('pet_vaccinations').delete().eq('id', id);
      if (err) throw err;
      setConfirmDelete(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const typeById = useMemo(() => {
    const m: Record<string, VaccineType> = {};
    types.forEach(t => { m[t.id] = t; });
    return m;
  }, [types]);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-600">
          <Syringe size={11} className="text-sniffy-purple"/>
          Vaccinations
          {records.length > 0 && (
            <span className="text-gray-400 font-normal normal-case tracking-normal">· {records.length}</span>
          )}
        </div>
        <button
          onClick={() => setAddingOpen(x => !x)}
          className="flex items-center gap-1 text-[11px] font-bold text-sniffy-purple hover:text-purple-700"
        >
          {addingOpen ? <><X size={11}/> Cancel</> : <><Plus size={11}/> Add</>}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 m-2 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
          <AlertCircle size={11} className="mt-0.5 shrink-0 text-red-500"/>
          <span className="flex-1 break-all">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400"><X size={10}/></button>
        </div>
      )}

      {addingOpen && (
        <AddVaccinationForm
          pet={pet}
          types={speciesTypes}
          createdBy={createdBy}
          onAdded={() => { setAddingOpen(false); reload(); }}
        />
      )}

      <div className="p-2 space-y-1.5">
        {loading ? (
          <div className="text-center text-[11px] text-gray-400 py-3">
            <Loader2 size={14} className="inline animate-spin"/>
          </div>
        ) : records.length === 0 ? (
          <p className="text-center text-[11px] text-gray-400 py-3 italic">
            No vaccinations on file yet.
          </p>
        ) : (
          records.map(r => {
            const t = typeById[r.vaccine_type_id];
            const summary = vaccinationSummary(r, t);
            const overdue = r.due_on != null && new Date(r.due_on) < new Date(new Date().toDateString());
            return (
              <div
                key={r.id}
                className={`flex items-start gap-2 bg-white border rounded-lg px-2.5 py-1.5 ${overdue ? 'border-red-200' : 'border-gray-100'}`}
              >
                <CalendarIcon size={11} className={`mt-0.5 shrink-0 ${overdue ? 'text-red-500' : 'text-gray-400'}`}/>
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-bold ${overdue ? 'text-red-700' : 'text-gray-900'}`}>
                    {summary}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    administered {new Date(r.administered_on).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {r.veterinarian && <> · vet: {r.veterinarian}</>}
                    {r.notes && <> · {r.notes}</>}
                  </p>
                </div>
                {confirmDelete === r.id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => deleteRecord(r.id)}
                      className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded"
                    >Delete</button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-[10px] text-gray-500"
                    >Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(r.id)}
                    className="text-gray-300 hover:text-red-500 shrink-0"
                    title="Delete record"
                  >
                    <Trash2 size={11}/>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Add form ───────────────────────────────────────────────────────

function AddVaccinationForm({
  pet, types, createdBy, onAdded,
}: {
  pet: Pet;
  types: VaccineType[];
  createdBy?: string;
  onAdded: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [typeId, setTypeId]             = useState<string>('');
  const [administeredOn, setAdmin]      = useState<string>(today);
  const [dueOn, setDueOn]               = useState<string>('');
  const [vet, setVet]                   = useState<string>('');
  const [notes, setNotes]               = useState<string>('');
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState<string | null>(null);

  // Auto-fill due_on whenever type or administered_on changes, but
  // don't clobber a value the user has manually entered.
  const [dueTouched, setDueTouched]     = useState(false);
  useEffect(() => {
    if (dueTouched || !typeId) return;
    const t = types.find(x => x.id === typeId);
    if (!t) return;
    const adm = new Date(administeredOn);
    if (Number.isNaN(adm.getTime())) return;
    adm.setMonth(adm.getMonth() + t.typical_interval_months);
    setDueOn(adm.toISOString().slice(0, 10));
  }, [typeId, administeredOn, types, dueTouched]);

  async function save() {
    if (!typeId) { setError('Pick a vaccine type'); return; }
    setSaving(true); setError(null);
    try {
      const { error: err } = await supabase.from('pet_vaccinations').insert([{
        pet_id:          pet.id,
        vaccine_type_id: typeId,
        administered_on: administeredOn,
        due_on:          dueOn || null,
        veterinarian:    vet.trim() || null,
        notes:           notes.trim() || null,
        created_by:      createdBy ?? null,
      }]);
      if (err) throw err;
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setSaving(false); }
  }

  const inputCls  = "w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-sniffy-purple";
  const selectCls = "w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-sniffy-purple";

  return (
    <div className="p-3 bg-purple-50 border-t border-purple-100 space-y-2">
      {error && (
        <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
          <AlertCircle size={11} className="mt-0.5 shrink-0 text-red-500"/>
          <span className="flex-1 break-all">{error}</span>
        </div>
      )}
      <label className="block">
        <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Vaccine type *</span>
        <select className={`${selectCls} mt-0.5`} value={typeId} onChange={e => setTypeId(e.target.value)}>
          <option value="">— Select —</option>
          {types.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Administered on *</span>
          <input
            type="date"
            className={`${inputCls} mt-0.5`}
            value={administeredOn}
            max={today}
            onChange={e => setAdmin(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Next due</span>
          <input
            type="date"
            className={`${inputCls} mt-0.5`}
            value={dueOn}
            onChange={e => { setDueOn(e.target.value); setDueTouched(true); }}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Vet (optional)</span>
          <input
            type="text"
            className={`${inputCls} mt-0.5`}
            value={vet}
            placeholder="Dr. ___"
            onChange={e => setVet(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Notes</span>
          <input
            type="text"
            className={`${inputCls} mt-0.5`}
            value={notes}
            placeholder="batch #, reactions, etc."
            onChange={e => setNotes(e.target.value)}
          />
        </label>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving || !typeId}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-sniffy-purple disabled:opacity-60 transition active:scale-95"
        >
          {saving ? <Loader2 size={11} className="animate-spin"/> : <Plus size={11}/>}
          Save vaccination
        </button>
      </div>
    </div>
  );
}
