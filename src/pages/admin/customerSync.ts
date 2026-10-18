/**
 * admin/customerSync.ts — Phase 1
 *
 * Application-side helpers that complement the DB triggers.
 *
 * The DB does the following automatically:
 *   • On grooming_sessions INSERT/UPDATE — find or create customer by
 *     normalized phone; set customer_id on the row.  (trigger
 *     trg_sessions_upsert_customer)
 *   • On grooming_sessions INSERT/UPDATE/DELETE — recompute aggregates
 *     (last_session_at, total_sessions, vendor/sniffy LTV totals,
 *     lifecycle_stage).  (trigger trg_sessions_aggregates)
 *   • On bookings INSERT/UPDATE — link to existing customer by phone
 *     (does NOT create a new customer).  (trigger trg_bookings_link_customer)
 *
 * What the DB does NOT do (and therefore lives here):
 *   • Creating pet rows for newly-entered sessions.  The DB has no way
 *     to know whether "1-5 years" Golden Retriever in this session is
 *     the SAME pet as one already on the customer, or a new pet that
 *     joined the family.  We give the coordinator that choice.
 *   • Creating session_pets join rows linking the session to the
 *     pet(s) covered by the visit.
 *
 * `syncSessionPets` is called AFTER a session insert/update, with the
 * pet list the form collected.  It is idempotent and safe to call on
 * edits — existing join rows are reused.
 */

import { supabase } from '../../lib/supabase';
import { Customer, Pet, normalizePhone } from './customerTypes';
import { pickExistingPet, type PetInput, type CandidatePet } from './sessionPets';

export type { PetInput };

// ─── Customer lookup (used by SessionFormModal autocomplete) ────────

/** Find an existing customer by raw phone.  Returns null if no match.
 *  Normalises the input the same way the DB does. */
export async function findCustomerByPhone(rawPhone: string): Promise<Customer | null> {
  const normalized = normalizePhone(rawPhone);
  if (!normalized) return null;
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', normalized)
    .maybeSingle();
  if (error) {
    console.warn('[customerSync] findCustomerByPhone:', error);
    return null;
  }
  return (data ?? null) as Customer | null;
}

/** Fuzzy phone search for typeahead.  Matches any customer whose
 *  phone_raw OR normalized phone contains the typed digits.  Capped at
 *  10 results to keep the dropdown lean. */
export async function searchCustomersByPhone(query: string): Promise<Customer[]> {
  const trimmed = (query ?? '').trim();
  if (trimmed.length < 3) return [];
  // Normalised has a "+" prefix; the user typing "987" should still
  // hit "+91987…", so match against the digits-only portion via ilike
  // on both phone and phone_raw.
  const digits = trimmed.replace(/[^0-9]/g, '');
  const pattern = `%${digits}%`;
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`phone.ilike.${pattern},phone_raw.ilike.${pattern}`)
    .order('last_session_at', { ascending: false, nullsFirst: false })
    .limit(10);
  if (error) {
    console.warn('[customerSync] searchCustomersByPhone:', error);
    return [];
  }
  return (data ?? []) as Customer[];
}

/** Pets for a customer — for the "apply pets to session" UI. */
export async function fetchPetsForCustomer(customerId: string): Promise<Pet[]> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('customer_id', customerId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('[customerSync] fetchPetsForCustomer:', error);
    return [];
  }
  return (data ?? []) as Pet[];
}

// ─── Pet + session_pets sync after a session save ───────────────────

/**
 * Reconcile pets + session_pets after a session save.
 *
 *   1. Read the session's customer_id (set by the DB trigger).
 *   2. Resolve every PetInput to a pets row — by id, then by name, then by
 *      type+breed — never giving two pets of the same session the same row
 *      (that used to collapse two same-breed pets into one and silently
 *      drop the second).  Unmatched inputs create a new pets row.
 *   3. On edits (`replaceExisting`) remove ONLY the join rows of pets that
 *      are no longer in the session — kept rows are updated in place, so
 *      nothing is wiped and re-created.
 *   4. Upsert one session_pets row per pet, with is_primary / sort_order and
 *      (for itemised multi-pet sessions) the per-pet package/add-ons/amount.
 *
 * Returns a list of error messages (empty = everything was saved).  The
 * session itself is already saved when this runs, so callers should surface
 * the errors rather than throw away the save.
 */
export async function syncSessionPets(
  sessionId: string,
  pets: PetInput[],
  options: { replaceExisting?: boolean } = {},
): Promise<string[]> {
  const errors: string[] = [];
  if (!sessionId || pets.length === 0) return errors;

  // Discover customer_id from the session — the trigger has set it.
  const { data: sessionRow, error: sessionErr } = await supabase
    .from('grooming_sessions')
    .select('customer_id')
    .eq('id', sessionId)
    .maybeSingle();
  if (sessionErr) {
    console.warn('[customerSync] could not read session for pet sync', sessionErr);
    return [`Could not read the session (${sessionErr.message}).`];
  }
  if (!sessionRow?.customer_id) {
    // No phone → no customer → pets have nowhere to live.  Pre-existing
    // behaviour for phone-less legacy sessions; the form blocks multi-pet
    // saves without a phone so nothing is silently dropped.
    console.warn('[customerSync] session has no customer_id, skipping pet sync');
    return errors;
  }
  const customerId = sessionRow.customer_id as string;

  // One query for the customer's pets; matching happens in memory.
  const { data: owned, error: ownedErr } = await supabase
    .from('pets')
    .select('id, name, type, breed, is_active')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: true });
  if (ownedErr) {
    console.warn('[customerSync] pet lookup failed:', ownedErr);
    return [`Could not load the customer's pets (${ownedErr.message}).`];
  }
  const candidates = (owned ?? []) as CandidatePet[];

  // ── 2. resolve inputs → pet ids ──
  const used = new Set<string>();
  const resolved: Array<{ input: PetInput; petId: string }> = [];
  const today = new Date().toISOString().slice(0, 10);

  for (const input of pets) {
    const hit = pickExistingPet(candidates, input, used);
    if (hit) {
      used.add(hit.id);
      resolved.push({ input, petId: hit.id });
      // Adopt a name onto a previously unnamed pet.
      const nm = (input.name ?? '').trim();
      if (nm && !(hit.name ?? '').trim()) {
        const { error: nameErr } = await supabase.from('pets').update({ name: nm }).eq('id', hit.id);
        if (nameErr) console.warn('[customerSync] could not set pet name:', nameErr);
      }
      continue;
    }
    const { data: created, error: insErr } = await supabase
      .from('pets')
      .insert([{
        customer_id:     customerId,
        name:            (input.name ?? '').trim() || null,
        type:            input.type,
        breed:           input.breed,
        age_years:       input.age_years ?? null,
        age_recorded_at: input.age_years != null ? today : null,
        age_bucket:      input.age_bucket,
        medical:         input.medical ?? null,
      }])
      .select('id')
      .single();
    if (insErr || !created?.id) {
      console.warn('[customerSync] pet insert failed:', insErr);
      errors.push(`Could not save ${input.breed || input.type} (${insErr?.message ?? 'unknown error'}).`);
      continue;
    }
    used.add(created.id as string);
    resolved.push({ input, petId: created.id as string });
  }
  if (resolved.length === 0) return errors;

  // ── 3. drop join rows of pets that are no longer in the session ──
  if (options.replaceExisting) {
    const keep = resolved.map(r => r.petId).join(',');
    const { error: delErr } = await supabase
      .from('session_pets')
      .delete()
      .eq('session_id', sessionId)
      .not('pet_id', 'in', `(${keep})`);
    if (delErr) {
      console.warn('[customerSync] failed to remove old join rows:', delErr);
      errors.push(`Could not remove pets taken off the session (${delErr.message}).`);
    }
  }

  // The partial unique index allows one primary per session; clear the
  // flag first so a changed primary can't collide with the old one.
  const { error: clrErr } = await supabase
    .from('session_pets')
    .update({ is_primary: false })
    .eq('session_id', sessionId)
    .eq('is_primary', true);
  if (clrErr) {
    console.warn('[customerSync] could not clear primary flag:', clrErr);
    errors.push(`Could not update the primary pet (${clrErr.message}).`);
    return errors;
  }

  // ── 4. upsert the join rows ──
  const rows = resolved.map(({ input, petId }, i) => ({
    session_id:          sessionId,
    pet_id:              petId,
    is_primary:          input.is_primary === true,
    sort_order:          input.sort_order ?? i,
    per_pet_package:     input.package ?? null,
    per_pet_addons:      input.add_ons ?? null,
    per_pet_amount:      input.amount ?? null,
    per_pet_amount_expr: input.amount_expr ?? null,
  }));
  const { error: joinErr } = await supabase
    .from('session_pets')
    .upsert(rows, { onConflict: 'session_id,pet_id' });
  if (joinErr) {
    console.warn('[customerSync] join upsert failed:', joinErr);
    errors.push(`Could not save the pets on this session (${joinErr.message}).`);
  }
  return errors;
}
