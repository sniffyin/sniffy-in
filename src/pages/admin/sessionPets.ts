/**
 * admin/sessionPets.ts
 *
 * Pure (no Supabase, no React) logic for multi-pet sessions with per-pet
 * package / add-ons / amount.  Kept dependency-free so it can be unit-tested
 * with `npm test`.
 *
 * Model
 * ─────
 *   • The grooming_sessions row stays the source of truth for the SESSION:
 *     booking_amount (the total), pet_type/breed/pet_age/pet_name/package/
 *     add_ons (all describing pet #1, "the primary pet").
 *   • session_pets holds one row per pet.  per_pet_* are filled in only for
 *     ITEMISED multi-pet sessions, where
 *         grooming_sessions.booking_amount = SUM(session_pets.per_pet_amount)
 *   • A multi-pet session saved before this feature has NO per-pet amounts —
 *     its booking_amount is a combined total.  We call that "combined" mode:
 *     the total is left exactly as stored and never recomputed.
 *
 * Discounts, vendor commission and incentives stay at session level; they
 * all read the total, so nothing here touches them.
 */

// ─── Amount expressions ──────────────────────────────────────────────

/** "799+299" → 1098.  Anything that isn't a digit, space, '+', '-' or '.'
 *  is dropped (unchanged behaviour of the original in-modal helper). */
export function evalExpr(expr: string): number {
  if (!expr || !expr.trim()) return 0;
  const sanitised = expr.replace(/[^\d\s+\-.]/g, '');
  const parts = sanitised.split('+').map(p => parseFloat(p.trim()) || 0);
  return parts.reduce((a, b) => a + b, 0);
}

/** Expression for "package price + add-on total" ("" when nothing priced). */
export function packageExpr(pkgPrice: number, addOnTotal: number): string {
  if (!pkgPrice && !addOnTotal) return '';
  if (!pkgPrice) return String(addOnTotal);
  return addOnTotal ? `${pkgPrice}+${addOnTotal}` : String(pkgPrice);
}

/** Take an add-on's price back out of an amount expression.
 *  "799+299" → "799"; a plain "1098" (a loaded session has no expression,
 *  only a number) → "799".  Only a trailing "+<price>" term is stripped, so
 *  a price that merely ends in the same digits ("2299" vs 299) is untouched. */
export function removeAddOnFromExpr(expr: string, price: number): string {
  const base = (expr ?? '').trim();
  const m = base.match(new RegExp(`^(.*)\\+\\s*${price}$`));
  if (m && m[1].trim()) return m[1].trim();
  const remaining = evalExpr(base) - price;
  return String(remaining > 0 ? remaining : 0);
}

// ─── Types ───────────────────────────────────────────────────────────

/** What we remember about the saved pet an extra-pet card was loaded from,
 *  so we only re-use its pets.id when the coordinator hasn't changed who
 *  the pet is. */
export interface PetOrigin {
  type: 'dog' | 'cat';
  breed: string | null;
  name: string | null;
}

/** A pet in the form beyond the first.  (Pet #1 lives in the session-level
 *  form fields.) */
export interface ExtraPetDraft {
  petId: string | null;
  origin: PetOrigin | null;
  name: string;
  type: 'dog' | 'cat';
  breed: string;
  age_bucket: string;
  medical: string;
  package: string;
  add_ons: string[];
  amount_expr: string;
}

export function emptyExtraPet(type: 'dog' | 'cat' = 'dog'): ExtraPetDraft {
  return {
    petId: null, origin: null, name: '', type, breed: '', age_bucket: '',
    medical: '', package: '', add_ons: [], amount_expr: '',
  };
}

/** Everything `syncSessionPets` needs to persist one pet of a session. */
export interface PetInput {
  /** Existing pets.id.  Null/undefined → match by name / type+breed, or create. */
  id?: string | null;
  name?: string | null;
  type: 'dog' | 'cat';
  breed: string | null;
  /** Legacy bucket string like "1-5 years". */
  age_bucket: string | null;
  /** Optional precise age (years); stamps age_recorded_at when provided. */
  age_years?: number | null;
  medical?: string | null;

  // ── session_pets columns ──
  is_primary?: boolean;
  sort_order?: number;
  /** Per-pet pricing — only set for itemised multi-pet sessions. */
  package?: string | null;
  add_ons?: string[] | null;
  amount?: number | null;
  amount_expr?: string | null;
}

// ─── Totals ──────────────────────────────────────────────────────────

/** Sum of the amount expressions of the extra pets. */
export function extrasTotal(extras: ExtraPetDraft[]): number {
  return extras.reduce((sum, e) => sum + evalExpr(e.amount_expr), 0);
}

/**
 * The session total (what goes in grooming_sessions.booking_amount).
 *
 *   • single pet            → pet #1's amount (unchanged behaviour)
 *   • multi-pet, combined   → the stored combined amount, untouched
 *   • multi-pet, itemised   → pet #1 + every extra
 */
export function computeSessionTotal(args: {
  primaryExpr: string;
  extras: ExtraPetDraft[];
  combined: boolean;
}): number {
  const primary = evalExpr(args.primaryExpr);
  if (args.extras.length === 0 || args.combined) return primary;
  return primary + extrasTotal(args.extras);
}

/** Itemised = more than one pet AND each carries its own price. */
export function isItemised(extras: ExtraPetDraft[], combined: boolean): boolean {
  return extras.length > 0 && !combined;
}

/** Returns a user-facing error, or null when the pets are OK to save. */
export function validateSessionPets(extras: ExtraPetDraft[], combined: boolean): string | null {
  if (!isItemised(extras, combined)) return null;
  for (let i = 0; i < extras.length; i++) {
    if (!extras[i].amount_expr.trim()) {
      return `Enter an amount for Pet ${i + 2} (type 0 if it is free).`;
    }
  }
  return null;
}

// ─── Loading a saved session ─────────────────────────────────────────

export interface LoadedSessionPetRow {
  pet_id: string;
  is_primary: boolean | null;
  sort_order: number | null;
  created_at?: string | null;
  per_pet_package: string | null;
  per_pet_amount: number | string | null;
  per_pet_addons: string[] | null;
  per_pet_amount_expr: string | null;
  pets: {
    name: string | null;
    type: 'dog' | 'cat';
    breed: string | null;
    age_bucket: string | null;
    medical: string | null;
  } | null;
}

export interface LoadedPetState {
  /** pets.id of pet #1, if we could identify it. */
  primaryPetId: string | null;
  primaryOrigin: PetOrigin | null;
  /** Pet #1's own amount expression when the session is itemised;
   *  null → leave the form's Booking ₹ as hydrated from booking_amount. */
  primaryExpr: string | null;
  extras: ExtraPetDraft[];
  /** True → keep the stored total as-is (legacy multi-pet or drifted). */
  combined: boolean;
}

const lc = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
const num = (v: number | string | null | undefined): number | null =>
  v === null || v === undefined || v === '' ? null : Number(v);

/**
 * Turn the session row + its session_pets rows into form state.
 *
 * Backward compatibility rules:
 *   • Rows written before this feature have is_primary=false and no per-pet
 *     values.  Pet #1 is then recognised the old way (first row matching the
 *     session's type+breed) and the session is "combined".
 *   • If the saved per-pet amounts don't add up to booking_amount (something
 *     else edited the total), we trust the session total → combined.
 */
export function deriveLoadState(
  session: { pet_type: 'dog' | 'cat'; breed: string | null; booking_amount: number | string | null },
  rows: LoadedSessionPetRow[],
): LoadedPetState {
  const sorted = [...rows].filter(r => r.pets).sort((a, b) => {
    const sa = a.sort_order ?? Number.MAX_SAFE_INTEGER;
    const sb = b.sort_order ?? Number.MAX_SAFE_INTEGER;
    if (sa !== sb) return sa - sb;
    return (a.created_at ?? '').localeCompare(b.created_at ?? '');
  });

  let primary = sorted.find(r => r.is_primary === true);
  if (!primary) {
    primary = sorted.find(r =>
      r.pets!.type === session.pet_type && lc(r.pets!.breed) === lc(session.breed));
  }
  const extraRows = sorted.filter(r => r !== primary);

  const toDraft = (r: LoadedSessionPetRow): ExtraPetDraft => {
    const amt = num(r.per_pet_amount);
    return {
      petId: r.pet_id,
      origin: { type: r.pets!.type, breed: r.pets!.breed, name: r.pets!.name },
      name: r.pets!.name ?? '',
      type: r.pets!.type,
      breed: r.pets!.breed ?? '',
      age_bucket: r.pets!.age_bucket ?? '',
      medical: r.pets!.medical ?? '',
      package: r.per_pet_package ?? '',
      add_ons: r.per_pet_addons ?? [],
      amount_expr: r.per_pet_amount_expr ?? (amt !== null ? String(amt) : ''),
    };
  };
  const extras = extraRows.map(toDraft);

  const base: LoadedPetState = {
    primaryPetId: primary?.pet_id ?? null,
    primaryOrigin: primary
      ? { type: primary.pets!.type, breed: primary.pets!.breed, name: primary.pets!.name }
      : null,
    primaryExpr: null,
    extras,
    combined: false,
  };

  if (extras.length === 0) return base;                    // single pet — nothing special

  const anyAmount = sorted.some(r => num(r.per_pet_amount) !== null);
  if (!anyAmount || !primary) return { ...base, combined: true };   // legacy multi-pet

  const total = Number(session.booking_amount) || 0;
  const sum = sorted.reduce((s, r) => s + (num(r.per_pet_amount) ?? 0), 0);
  if (Math.abs(sum - total) > 0.01) return { ...base, combined: true };   // drifted

  const pAmt = num(primary.per_pet_amount);
  const primaryExpr = primary.per_pet_amount_expr ?? (pAmt !== null ? String(pAmt) : '');
  return { ...base, primaryExpr, combined: false };
}

// ─── Saving ──────────────────────────────────────────────────────────

/** pets.id may only be re-used when who the pet is hasn't been edited. */
function reusablePetId(
  id: string | null, origin: PetOrigin | null,
  cur: { type: 'dog' | 'cat'; breed: string | null; name: string | null },
): string | null {
  if (!id || !origin) return null;
  if (origin.type !== cur.type) return null;
  if (lc(origin.breed) !== lc(cur.breed)) return null;
  if (lc(origin.name) !== lc(cur.name)) return null;
  return id;
}

export function buildPetInputs(args: {
  primary: {
    petId: string | null; origin: PetOrigin | null;
    name: string | null; type: 'dog' | 'cat'; breed: string | null;
    age_bucket: string | null; medical: string | null;
    package: string | null; add_ons: string[];
  };
  primaryExpr: string;
  extras: ExtraPetDraft[];
  combined: boolean;
}): PetInput[] {
  const { primary, primaryExpr, extras, combined } = args;
  const itemised = isItemised(extras, combined);
  const pName = (primary.name ?? '').trim() || null;

  const first: PetInput = {
    id: reusablePetId(primary.petId, primary.origin,
      { type: primary.type, breed: primary.breed, name: pName }),
    name: pName,
    type: primary.type,
    breed: primary.breed || null,
    age_bucket: primary.age_bucket || null,
    medical: primary.medical || null,
    is_primary: true,
    sort_order: 0,
    ...(itemised ? {
      package: primary.package || null,
      add_ons: primary.add_ons,
      amount: evalExpr(primaryExpr),
      amount_expr: primaryExpr.trim() || null,
    } : {}),
  };

  const rest: PetInput[] = extras.map((e, i) => {
    const name = e.name.trim() || null;
    return {
      id: reusablePetId(e.petId, e.origin, { type: e.type, breed: e.breed || null, name }),
      name,
      type: e.type,
      breed: e.breed || null,
      age_bucket: e.age_bucket || null,
      medical: e.medical || null,
      is_primary: false,
      sort_order: i + 1,
      ...(itemised ? {
        package: e.package || null,
        add_ons: e.add_ons,
        amount: evalExpr(e.amount_expr),
        amount_expr: e.amount_expr.trim() || null,
      } : {}),
    };
  });

  return [first, ...rest];
}

// ─── Matching inputs to the customer's existing pets ────────────────

export interface CandidatePet {
  id: string;
  name: string | null;
  type: 'dog' | 'cat';
  breed: string | null;
  is_active?: boolean | null;
}

/**
 * Choose which existing pet (if any) a PetInput refers to.
 *
 *   1. explicit id
 *   2. same type + same (non-empty) name
 *   3. same type + breed, but only a pet that has no different name — an
 *      unnamed input may match any such pet, a named input only an unnamed one
 *   Pets already claimed by another pet of the SAME session are skipped, so
 *   two Labradors in one visit become two pets instead of colliding on the
 *   UNIQUE(session_id, pet_id) constraint.
 *
 * `candidates` should be ordered oldest-first.  Returns null → create new.
 */
export function pickExistingPet(
  candidates: CandidatePet[],
  input: Pick<PetInput, 'id' | 'name' | 'type' | 'breed'>,
  usedIds: Set<string>,
): CandidatePet | null {
  const free = candidates.filter(c => !usedIds.has(c.id));
  // Prefer active pets, otherwise keep order.
  const ordered = [...free.filter(c => c.is_active !== false), ...free.filter(c => c.is_active === false)];

  if (input.id) {
    const byId = ordered.find(c => c.id === input.id);
    if (byId) return byId;
  }
  const name = lc(input.name);
  if (name) {
    const byName = ordered.find(c => c.type === input.type && lc(c.name) === name);
    if (byName) return byName;
  }
  const breed = lc(input.breed);
  return ordered.find(c =>
    c.type === input.type &&
    lc(c.breed) === breed &&
    (!name ? true : !c.name || !c.name.trim()),
  ) ?? null;
}

// ─── Display (session cards, groomer screens, WhatsApp text) ────────

/** One pet of a multi-pet session, ready to render. */
export interface DisplayPet {
  name: string | null;
  type: 'dog' | 'cat';
  breed: string | null;
  /** Null when the session was saved with one combined amount (legacy) —
   *  we then genuinely don't know this pet's package. */
  package: string | null;
  add_ons: string[];
  /** Null unless the session is itemised (per-pet amounts were saved). */
  amount: number | null;
}

/**
 * Per-pet lines for a session, or `[]` for an ordinary single-pet session
 * (callers then keep their existing single-pet display).
 *
 * Pet #1 always comes from the session's own columns (name/breed/package/
 * add-ons), exactly as the rest of the app reads them.  Extra pets come from
 * session_pets.  Per-pet packages and amounts are only shown when they were
 * actually saved — an old combined-total session never has them invented.
 */
export function buildDisplayPets(
  session: {
    pet_type: 'dog' | 'cat'; pet_name: string | null; breed: string | null;
    package: string | null; add_ons: string[] | null; booking_amount: number | string | null;
  },
  rows: LoadedSessionPetRow[],
): DisplayPet[] {
  const st = deriveLoadState(
    { pet_type: session.pet_type, breed: session.breed, booking_amount: session.booking_amount },
    rows,
  );
  if (st.extras.length === 0) return [];
  const itemised = !st.combined;
  const primaryAmount = itemised && st.primaryExpr !== null ? evalExpr(st.primaryExpr) : null;

  const first: DisplayPet = {
    name: (session.pet_name ?? '').trim() || null,
    type: session.pet_type,
    breed: session.breed,
    package: session.package,
    add_ons: session.add_ons ?? [],
    amount: primaryAmount,
  };
  const rest: DisplayPet[] = st.extras.map(e => ({
    name: e.name.trim() || null,
    type: e.type,
    breed: e.breed || null,
    package: itemised ? (e.package || null) : null,
    add_ons: itemised ? e.add_ons : [],
    amount: itemised ? evalExpr(e.amount_expr) : null,
  }));
  return [first, ...rest];
}

/** "Bruno (Labrador) — Spa Bath + Hair Cut + Deworming — ₹1,500" as plain text. */
export function petLineText(p: DisplayPet, opts: { showAmount?: boolean } = {}): string {
  const who = [p.name, p.breed ? (p.name ? `(${p.breed})` : p.breed) : null].filter(Boolean).join(' ')
    || (p.type === 'dog' ? 'Dog' : 'Cat');
  const service = [p.package, ...p.add_ons].filter(Boolean).join(' + ');
  const parts = [who, service || null];
  if (opts.showAmount && p.amount !== null) parts.push(`₹${p.amount.toLocaleString('en-IN')}`);
  return parts.filter(Boolean).join(' — ');
}
