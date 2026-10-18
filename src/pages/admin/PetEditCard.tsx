/**
 * admin/PetEditCard.tsx — Phase 2a
 *
 * Inline pet editor used inside CustomerDetailModal.  Renders a single
 * pet in compact view; expanding it reveals editable fields for name,
 * breed, age, medical, behaviour notes.  Save persists directly to the
 * `pets` table.
 *
 * Why inline + per-pet rather than a separate modal?  Customer detail
 * is already a slide-over; nesting a modal on top of a slide-over on
 * top of a list-page feels deep.  Inline edit also keeps the rest of
 * the customer context (sessions, notes, tags) visible while the user
 * fixes a breed or marks a pet inactive.
 *
 * The age model matches Phase 1's three-track design:
 *   • age_years (int) + age_recorded_at — the precise track
 *   • age_bucket (string) — legacy "0-1 / 1-5 / 5+" buckets
 *   • dob — reserved (Phase 5 birthdays); not edited here
 *
 * Setting age_years stamps age_recorded_at = today, so the displayed
 * age rolls forward automatically over time (via petDisplayAge).
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Save, Trash2, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Pet, petDisplayAge } from './customerTypes';
import { DOG_BREEDS, CAT_BREEDS } from './types';
import VaccinationsEditor from './VaccinationsEditor';

const AGE_BUCKETS = ['', '0-1 years', '1-5 years', '5+ years'] as const;

export default function PetEditCard({
  pet, sessionCount, onChanged, createdBy = 'coordinator',
}: {
  pet: Pet;
  /** Phase 2b — number of grooming sessions this pet has been part of.
   *  Computed from session_pets by the parent.  Omitted for new/unsaved
   *  pets where the count is by definition 0. */
  sessionCount?: number;
  /** Called after a successful save or delete so the parent can refresh. */
  onChanged: () => void;
  /** Phase 6c — who's logging vaccinations from inside this card.
   *  Defaults to 'coordinator' for admin contexts; portal passes
   *  'customer' so the audit trail is meaningful. */
  createdBy?: string;
}) {
  const [expanded, setExpanded]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [confirmDelete, setConfirm] = useState(false);

  // Local edit state — committed on Save.  Resets to the row's current
  // values whenever the pet prop changes (e.g. after a refresh).
  const [name, setName]             = useState(pet.name ?? '');
  const [type, setType]             = useState<'dog' | 'cat'>(pet.type);
  const [breed, setBreed]           = useState(pet.breed ?? '');
  const [ageYears, setAgeYears]     = useState<number | null>(pet.age_years);
  const [ageBucket, setAgeBucket]   = useState(pet.age_bucket ?? '');
  // Phase 5 — DOB drives the birthday outreach engine.  When set, the
  // displayed age is computed from DOB (petDisplayAge prefers it over
  // age_years), so editing DOB silently retires the legacy fields.
  const [dob, setDob]               = useState(pet.dob ?? '');
  const [gender, setGender]         = useState<'male' | 'female' | null>(pet.gender);
  const [weight, setWeight]         = useState<number | null>(pet.weight_kg);
  const [color, setColor]           = useState(pet.color ?? '');
  const [medical, setMedical]       = useState(pet.medical ?? '');
  const [behaviorNotes, setBehavior] = useState(pet.behavior_notes ?? '');
  const [isActive, setIsActive]     = useState(pet.is_active);

  useEffect(() => {
    setName(pet.name ?? '');
    setType(pet.type);
    setBreed(pet.breed ?? '');
    setAgeYears(pet.age_years);
    setAgeBucket(pet.age_bucket ?? '');
    setDob(pet.dob ?? '');
    setGender(pet.gender);
    setWeight(pet.weight_kg);
    setColor(pet.color ?? '');
    setMedical(pet.medical ?? '');
    setBehavior(pet.behavior_notes ?? '');
    setIsActive(pet.is_active);
  }, [pet]);

  async function persist() {
    setSaving(true); setError(null);
    try {
      // Stamp age_recorded_at when age_years has been set/changed.
      // This is what makes "displayed age rolls forward" work — the
      // age stays accurate as time passes even if no one re-edits the
      // pet.  When age_years is cleared, we don't clear the stamp
      // (preserve the last known recorded date for audit).
      const today = new Date().toISOString().slice(0, 10);
      const ageStamp =
        ageYears != null && ageYears !== pet.age_years
          ? today
          : pet.age_recorded_at;
      const { error: err } = await supabase
        .from('pets')
        .update({
          name:             name.trim() || null,
          type,
          breed:            breed.trim() || null,
          age_years:        ageYears,
          age_recorded_at:  ageStamp,
          age_bucket:       ageBucket || null,
          // Phase 5 — DOB enables birthday outreach.  Empty string from
          // an unset <input type="date"> becomes NULL.
          dob:              dob && dob.length > 0 ? dob : null,
          gender,
          weight_kg:        weight,
          color:            color.trim() || null,
          medical:          medical.trim() || null,
          behavior_notes:   behaviorNotes.trim() || null,
          is_active:        isActive,
        })
        .eq('id', pet.id);
      if (err) throw err;
      setExpanded(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setSaving(false); }
  }

  async function softDelete() {
    setSaving(true); setError(null);
    try {
      // Mark inactive rather than DELETE — preserves session_pets join
      // history so a pet's grooming record isn't lost when a pet
      // passes away or is rehomed.  Hard-delete is also dangerous
      // because of the ON DELETE RESTRICT on session_pets.pet_id.
      const { error: err } = await supabase
        .from('pets')
        .update({ is_active: false })
        .eq('id', pet.id);
      if (err) throw err;
      setIsActive(false);
      setConfirm(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setSaving(false); }
  }

  const breeds = type === 'dog' ? DOG_BREEDS : CAT_BREEDS;
  const selectCls = "w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-sniffy-purple";
  const inputCls  = "w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-sniffy-purple";

  return (
    <div className={`bg-gray-50 rounded-xl overflow-hidden transition ${!isActive ? 'opacity-60' : ''}`}>
      {/* Compact row */}
      <button
        onClick={() => setExpanded(x => !x)}
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-gray-100 transition"
      >
        <div className="text-xl">{pet.type === 'dog' ? '🐶' : '🐱'}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 flex items-center flex-wrap gap-1.5">
            <span>
              {pet.name || <span className="text-gray-400 italic">Unnamed</span>}{' '}
              <span className="text-gray-400 font-normal text-xs">· {pet.breed ?? '—'}</span>
            </span>
            {/* Phase 2b — per-pet visit count badge.  Only shown when
                we know a count and it's > 0 (a brand-new pet card
                doesn't need to display "0 sessions"). */}
            {sessionCount != null && sessionCount > 0 && (
              <span className="inline-flex items-center text-[10px] font-bold bg-purple-50 text-sniffy-purple border border-purple-200 rounded-full px-1.5 py-0">
                {sessionCount}× session{sessionCount === 1 ? '' : 's'}
              </span>
            )}
            {!pet.is_active && (
              <span className="inline-flex text-[10px] font-bold bg-gray-200 text-gray-500 border border-gray-300 rounded-full px-1.5 py-0">
                inactive
              </span>
            )}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Age: {petDisplayAge(pet)}
            {pet.medical && <> · Med: {pet.medical}</>}
            {pet.behavior_notes && <> · Notes: {pet.behavior_notes}</>}
          </p>
        </div>
        <span className="text-[10px] font-bold text-sniffy-purple shrink-0">
          {expanded ? 'Close' : 'Edit'}
        </span>
      </button>

      {/* Expanded editor */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-gray-200"
          >
            <div className="p-3 space-y-2 bg-white">
              {error && (
                <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
                  <AlertCircle size={11} className="mt-0.5 shrink-0 text-red-500"/>
                  <span className="flex-1 break-all">{error}</span>
                  <button onClick={() => setError(null)} className="text-red-400">
                    <X size={10}/>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <PetField label="Name">
                  <input type="text" className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Bruno"/>
                </PetField>
                <PetField label="Type">
                  <select className={selectCls} value={type} onChange={e => { setType(e.target.value as 'dog'|'cat'); setBreed(''); }}>
                    <option value="dog">🐶 Dog</option>
                    <option value="cat">🐱 Cat</option>
                  </select>
                </PetField>
              </div>

              <PetField label="Breed">
                <select className={selectCls} value={breed} onChange={e => setBreed(e.target.value)}>
                  <option value="">Select</option>
                  {breeds.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </PetField>

              <div className="grid grid-cols-2 gap-2">
                <PetField label="Age (years)">
                  <input
                    type="number"
                    min={0}
                    max={30}
                    className={inputCls}
                    value={ageYears ?? ''}
                    onChange={e => setAgeYears(e.target.value === '' ? null : Number(e.target.value))}
                    placeholder="e.g. 5"
                  />
                </PetField>
                <PetField label="Age bucket (fallback)">
                  <select className={selectCls} value={ageBucket} onChange={e => setAgeBucket(e.target.value)}>
                    {AGE_BUCKETS.map(b => <option key={b} value={b}>{b || '— none —'}</option>)}
                  </select>
                </PetField>
              </div>

              {/* Phase 5 — DOB drives birthday outreach.  Optional but
                  preferred over age_years when known: petDisplayAge
                  picks DOB first, and the daily outreach cron fires
                  pet_birthday templates 3 days before + on the day. */}
              <PetField label="Date of birth (optional — unlocks birthday wishes 🎂)">
                <input
                  type="date"
                  className={inputCls}
                  value={dob || ''}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={e => setDob(e.target.value)}
                />
                {dob && (
                  <p className="text-[10px] text-sniffy-purple/70 mt-1 leading-snug">
                    🎂 We'll send a birthday note 3 days before and on {new Date(dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} every year.
                  </p>
                )}
              </PetField>

              <div className="grid grid-cols-3 gap-2">
                <PetField label="Gender">
                  <select className={selectCls} value={gender ?? ''} onChange={e => setGender(e.target.value === '' ? null : (e.target.value as 'male'|'female'))}>
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </PetField>
                <PetField label="Weight (kg)">
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    className={inputCls}
                    value={weight ?? ''}
                    onChange={e => setWeight(e.target.value === '' ? null : Number(e.target.value))}
                  />
                </PetField>
                <PetField label="Color">
                  <input type="text" className={inputCls} value={color} onChange={e => setColor(e.target.value)} placeholder="brown"/>
                </PetField>
              </div>

              <PetField label="Medical">
                <input type="text" className={inputCls} value={medical} onChange={e => setMedical(e.target.value)} placeholder="e.g. skin allergy, sensitive ears"/>
              </PetField>

              <PetField label="Behavior notes">
                <input type="text" className={inputCls} value={behaviorNotes} onChange={e => setBehavior(e.target.value)} placeholder="e.g. anxious with clippers"/>
              </PetField>

              {/* Phase 6c — vaccinations editor.  Manages its own
                  loads + writes against pet_vaccinations.  Lives inside
                  the expanded pet card so the coordinator sees the
                  pet's full health profile in one place. */}
              <div className="pt-1">
                <VaccinationsEditor pet={pet} createdBy={createdBy}/>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-1 gap-2">
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirm(true)}
                    disabled={saving || !isActive}
                    className="flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-700 disabled:opacity-40"
                  >
                    <Trash2 size={11}/> {isActive ? 'Mark inactive' : 'Already inactive'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-red-600 font-semibold">Sure?</span>
                    <button
                      onClick={softDelete}
                      disabled={saving}
                      className="px-2 py-1 rounded-lg text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60"
                    >Yes, mark inactive</button>
                    <button
                      onClick={() => setConfirm(false)}
                      disabled={saving}
                      className="text-[11px] text-gray-500 hover:text-gray-700"
                    >Cancel</button>
                  </div>
                )}
                <button
                  onClick={persist}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-sniffy-purple disabled:opacity-60 transition active:scale-95"
                >
                  {saving ? <Loader2 size={11} className="animate-spin"/> : <Save size={11}/>}
                  Save pet
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PetField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">{label}</span>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}

// ─── "Add pet" sub-form, exported as a separate component so the
//     parent can manage the open/closed state alongside the list ───

export function AddPetInline({
  customerId, onCreated, onCancel,
}: {
  customerId: string;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [type, setType]       = useState<'dog' | 'cat'>('dog');
  const [name, setName]       = useState('');
  const [breed, setBreed]     = useState('');
  const [ageYears, setAge]    = useState<number | null>(null);
  const [ageBucket, setBucket] = useState('');
  // Phase 5 — DOB enables the pet_birthday outreach template.  Optional
  // at create time; coordinator/customer can backfill it later.
  const [dob, setDob]         = useState('');
  const [medical, setMedical] = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const breeds = type === 'dog' ? DOG_BREEDS : CAT_BREEDS;
  const selectCls = "w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-sniffy-purple";
  const inputCls  = "w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-sniffy-purple";

  async function create() {
    setSaving(true); setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { error: err } = await supabase.from('pets').insert([{
        customer_id:     customerId,
        type,
        name:            name.trim() || null,
        breed:           breed.trim() || null,
        age_years:       ageYears,
        age_recorded_at: ageYears != null ? today : null,
        age_bucket:      ageBucket || null,
        dob:             dob && dob.length > 0 ? dob : null,
        medical:         medical.trim() || null,
      }]);
      if (err) throw err;
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setSaving(false); }
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-sniffy-purple">Add a new pet</p>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={12}/>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
          <AlertCircle size={11} className="mt-0.5 shrink-0 text-red-500"/>
          <span className="flex-1 break-all">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <input type="text" className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Pet name (optional)"/>
        <select className={selectCls} value={type} onChange={e => { setType(e.target.value as 'dog'|'cat'); setBreed(''); }}>
          <option value="dog">🐶 Dog</option>
          <option value="cat">🐱 Cat</option>
        </select>
      </div>
      <select className={selectCls} value={breed} onChange={e => setBreed(e.target.value)}>
        <option value="">Select breed</option>
        {breeds.map(b => <option key={b} value={b}>{b}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min={0}
          max={30}
          className={inputCls}
          value={ageYears ?? ''}
          onChange={e => setAge(e.target.value === '' ? null : Number(e.target.value))}
          placeholder="Age in years"
        />
        <select className={selectCls} value={ageBucket} onChange={e => setBucket(e.target.value)}>
          <option value="">Age bucket (fallback)</option>
          {AGE_BUCKETS.filter(b => !!b).map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      {/* Phase 5 — DOB.  Optional; unlocks birthday outreach. */}
      <label className="block">
        <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Date of birth (optional — for birthday wishes 🎂)</span>
        <input
          type="date"
          className={`${inputCls} mt-0.5`}
          value={dob}
          max={new Date().toISOString().slice(0, 10)}
          onChange={e => setDob(e.target.value)}
        />
      </label>
      <input type="text" className={inputCls} value={medical} onChange={e => setMedical(e.target.value)} placeholder="Medical (optional)"/>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button onClick={onCancel} disabled={saving} className="text-[11px] text-gray-500 hover:text-gray-700 disabled:opacity-40">Cancel</button>
        <button
          onClick={create}
          disabled={saving}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-sniffy-purple disabled:opacity-60 transition active:scale-95"
        >
          {saving ? <Loader2 size={11} className="animate-spin"/> : '＋ Add pet'}
        </button>
      </div>
    </div>
  );
}
