/**
 * Unit tests for the pure multi-pet session logic.
 * Run:  npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evalExpr, packageExpr, removeAddOnFromExpr, emptyExtraPet, extrasTotal, computeSessionTotal,
  isItemised, validateSessionPets, deriveLoadState, buildPetInputs,
  pickExistingPet, buildDisplayPets, petLineText,
  type ExtraPetDraft, type LoadedSessionPetRow, type CandidatePet,
} from './sessionPets.ts';

const extra = (over: Partial<ExtraPetDraft> = {}): ExtraPetDraft => ({ ...emptyExtraPet('dog'), ...over });

const row = (over: Partial<LoadedSessionPetRow> & { pet_id: string }): LoadedSessionPetRow => ({
  is_primary: false, sort_order: null, created_at: '2026-01-01T00:00:00Z',
  per_pet_package: null, per_pet_amount: null, per_pet_addons: null, per_pet_amount_expr: null,
  pets: { name: null, type: 'dog', breed: 'Labrador', age_bucket: '1-5 years', medical: null },
  ...over,
});

// ─── evalExpr / packageExpr ─────────────────────────────────────────

test('evalExpr: sums, ignores junk, blank → 0', () => {
  assert.equal(evalExpr('1299+290+50'), 1639);
  assert.equal(evalExpr(' 799 + 299 '), 1098);
  assert.equal(evalExpr(''), 0);
  assert.equal(evalExpr('   '), 0);
  assert.equal(evalExpr('₹1,500'), 1500);   // currency symbol / comma stripped
  assert.equal(evalExpr('abc'), 0);
  assert.equal(evalExpr('1500.5'), 1500.5);
});

test('packageExpr', () => {
  assert.equal(packageExpr(799, 0), '799');
  assert.equal(packageExpr(799, 299), '799+299');
  assert.equal(packageExpr(0, 149), '149');
  assert.equal(packageExpr(0, 0), '');
});

test('removeAddOnFromExpr: strips the trailing term, or subtracts from a plain number', () => {
  assert.equal(removeAddOnFromExpr('799+299', 299), '799');
  assert.equal(removeAddOnFromExpr('1299+149+299', 299), '1299+149');
  assert.equal(removeAddOnFromExpr('1098', 299), '799');                 // loaded session: plain number
  assert.equal(removeAddOnFromExpr('2299', 299), '2000');                // must NOT strip the digits "299" off 2299
  assert.equal(removeAddOnFromExpr('299', 299), '0');
  assert.equal(removeAddOnFromExpr('+299', 299), '0');
  assert.equal(removeAddOnFromExpr('', 299), '0');                       // never negative
  assert.equal(removeAddOnFromExpr('799 + 299', 299), '799');
});

// ─── totals ─────────────────────────────────────────────────────────

test('total: single pet is just pet #1 (unchanged behaviour)', () => {
  assert.equal(computeSessionTotal({ primaryExpr: '1299', extras: [], combined: false }), 1299);
  assert.equal(computeSessionTotal({ primaryExpr: '', extras: [], combined: false }), 0);
});

test('total: itemised ₹1500 + ₹600 (the reported scenario)', () => {
  const extras = [extra({ amount_expr: '600' })];
  assert.equal(computeSessionTotal({ primaryExpr: '1500', extras, combined: false }), 2100);
});

test('total: dog Spa Bath+Hair Cut(1299) + cat Spa Bath(799) + add-on(149)', () => {
  const extras = [extra({ type: 'cat', amount_expr: '799+149' })];
  assert.equal(computeSessionTotal({ primaryExpr: '1299', extras, combined: false }), 2247);
});

test('total: three pets', () => {
  const extras = [extra({ amount_expr: '600' }), extra({ amount_expr: '999' })];
  assert.equal(computeSessionTotal({ primaryExpr: '1500', extras, combined: false }), 3099);
  assert.equal(extrasTotal(extras), 1599);
});

test('total: combined (legacy) multi-pet never adds extras — no double counting', () => {
  const extras = [extra({ amount_expr: '600' })];
  assert.equal(computeSessionTotal({ primaryExpr: '2100', extras, combined: true }), 2100);
});

test('isItemised / validate', () => {
  assert.equal(isItemised([], false), false);
  assert.equal(isItemised([extra()], true), false);
  assert.equal(isItemised([extra()], false), true);
  assert.equal(validateSessionPets([], false), null);
  assert.equal(validateSessionPets([extra()], true), null);
  assert.match(validateSessionPets([extra({ amount_expr: '' })], false)!, /Pet 2/);
  assert.match(validateSessionPets([extra({ amount_expr: '5' }), extra({ amount_expr: ' ' })], false)!, /Pet 3/);
  assert.equal(validateSessionPets([extra({ amount_expr: '0' })], false), null); // explicit free is fine
});

// ─── loading saved sessions (backward compatibility) ────────────────

test('load: session with no session_pets rows → single pet, nothing special', () => {
  const s = deriveLoadState({ pet_type: 'dog', breed: 'Labrador', booking_amount: 1299 }, []);
  assert.deepEqual(s.extras, []);
  assert.equal(s.combined, false);
  assert.equal(s.primaryExpr, null);
  assert.equal(s.primaryPetId, null);
});

test('load: legacy single pet (one row, no per-pet values)', () => {
  const s = deriveLoadState({ pet_type: 'dog', breed: 'Labrador', booking_amount: 1299 }, [row({ pet_id: 'p1' })]);
  assert.equal(s.extras.length, 0);
  assert.equal(s.combined, false);
  assert.equal(s.primaryPetId, 'p1');
  assert.equal(s.primaryExpr, null);
});

test('load: legacy multi-pet (no is_primary, no amounts) → combined, total untouched', () => {
  const rows = [
    row({ pet_id: 'cat1', created_at: '2026-01-02', pets: { name: null, type: 'cat', breed: 'Persian', age_bucket: null, medical: null } }),
    row({ pet_id: 'dog1', created_at: '2026-01-01' }),     // matches session type+breed → pet #1
  ];
  const s = deriveLoadState({ pet_type: 'dog', breed: 'labrador', booking_amount: 2100 }, rows);
  assert.equal(s.primaryPetId, 'dog1');
  assert.equal(s.combined, true);
  assert.equal(s.extras.length, 1);
  assert.equal(s.extras[0].type, 'cat');
  assert.equal(s.extras[0].amount_expr, '');       // nothing invented
  assert.equal(s.primaryExpr, null);
});

test('load: legacy multi-pet where no row matches primary → all rows become extras (old behaviour)', () => {
  const rows = [row({ pet_id: 'a', pets: { name: null, type: 'cat', breed: 'Persian', age_bucket: null, medical: null } }), row({ pet_id: 'b', pets: { name: null, type: 'cat', breed: 'Siamese', age_bucket: null, medical: null } })];
  const s = deriveLoadState({ pet_type: 'dog', breed: 'Pug', booking_amount: 1000 }, rows);
  assert.equal(s.primaryPetId, null);
  assert.equal(s.extras.length, 2);
  assert.equal(s.combined, true);
});

test('load: itemised session round-trips pet #1 amount, package, extras', () => {
  const rows = [
    row({ pet_id: 'd1', is_primary: true, sort_order: 0, per_pet_amount: 1500, per_pet_amount_expr: '1299+201', per_pet_package: 'Spa Bath + Hair Cut', per_pet_addons: [] }),
    row({ pet_id: 'c1', sort_order: 1, per_pet_amount: 600, per_pet_amount_expr: '600', per_pet_package: 'Spa Bath', per_pet_addons: ['Deworming'],
      pets: { name: 'Kitty', type: 'cat', breed: 'Persian', age_bucket: '1-5 years', medical: 'None' } }),
  ];
  const s = deriveLoadState({ pet_type: 'dog', breed: 'Labrador', booking_amount: 2100 }, rows);
  assert.equal(s.combined, false);
  assert.equal(s.primaryExpr, '1299+201');
  assert.equal(s.primaryPetId, 'd1');
  assert.equal(s.extras.length, 1);
  assert.equal(s.extras[0].name, 'Kitty');
  assert.equal(s.extras[0].package, 'Spa Bath');
  assert.deepEqual(s.extras[0].add_ons, ['Deworming']);
  assert.equal(s.extras[0].amount_expr, '600');
  // and the form total recomputes to the same stored value
  assert.equal(computeSessionTotal({ primaryExpr: s.primaryExpr!, extras: s.extras, combined: s.combined }), 2100);
});

test('load: itemised amounts that no longer match booking_amount → trust session total (combined)', () => {
  const rows = [
    row({ pet_id: 'd1', is_primary: true, sort_order: 0, per_pet_amount: 1500 }),
    row({ pet_id: 'c1', sort_order: 1, per_pet_amount: 600, pets: { name: null, type: 'cat', breed: 'Persian', age_bucket: null, medical: null } }),
  ];
  const s = deriveLoadState({ pet_type: 'dog', breed: 'Labrador', booking_amount: 2500 }, rows);
  assert.equal(s.combined, true);
});

test('load: float-ish amounts from Postgres numeric strings', () => {
  const rows = [
    row({ pet_id: 'd1', is_primary: true, sort_order: 0, per_pet_amount: '1500.00' }),
    row({ pet_id: 'c1', sort_order: 1, per_pet_amount: '600.00', pets: { name: null, type: 'cat', breed: null, age_bucket: null, medical: null } }),
  ];
  const s = deriveLoadState({ pet_type: 'dog', breed: 'Labrador', booking_amount: '2100.00' }, rows);
  assert.equal(s.combined, false);
  assert.equal(s.primaryExpr, '1500');
});

test('load: rows ordered by sort_order, nulls last, ties by created_at', () => {
  const mk = (id: string, sort: number | null, created: string) =>
    row({ pet_id: id, sort_order: sort, created_at: created, pets: { name: id, type: 'cat', breed: null, age_bucket: null, medical: null } });
  const s = deriveLoadState({ pet_type: 'dog', breed: 'Pug', booking_amount: 0 },
    [mk('z', null, '2026-01-01'), mk('b', 2, '2026-01-01'), mk('a', 1, '2026-01-09'), mk('y', null, '2025-12-01')]);
  assert.deepEqual(s.extras.map(e => e.name), ['a', 'b', 'y', 'z']);
});

test('load: rows whose pet was deleted (null join) are ignored, not crashed on', () => {
  const s = deriveLoadState({ pet_type: 'dog', breed: 'Labrador', booking_amount: 1 },
    [row({ pet_id: 'gone', pets: null }), row({ pet_id: 'p1' })]);
  assert.equal(s.primaryPetId, 'p1');
  assert.equal(s.extras.length, 0);
});

// ─── building rows to save ──────────────────────────────────────────

const primary = (over = {}) => ({
  petId: null, origin: null, name: 'Bruno', type: 'dog' as const, breed: 'Labrador',
  age_bucket: '1-5 years', medical: null, package: 'Hair Cut', add_ons: [] as string[], ...over,
});

test('build: single pet → one primary row, NO per-pet pricing written (session columns stay the truth)', () => {
  const out = buildPetInputs({ primary: primary(), primaryExpr: '999', extras: [], combined: false });
  assert.equal(out.length, 1);
  assert.equal(out[0].is_primary, true);
  assert.equal(out[0].sort_order, 0);
  assert.equal(out[0].amount, undefined);
  assert.equal(out[0].package, undefined);
});

test('build: itemised dog + cat with different packages and amounts', () => {
  const extras = [extra({ type: 'cat', breed: 'Persian', name: ' Kitty ', package: 'Spa Bath', add_ons: ['Deworming'], amount_expr: '799+299' })];
  const out = buildPetInputs({ primary: primary({ add_ons: ['Tick & Flea'] }), primaryExpr: '999+149', extras, combined: false });
  assert.equal(out.length, 2);
  assert.deepEqual([out[0].amount, out[0].package, out[0].add_ons, out[0].amount_expr], [1148, 'Hair Cut', ['Tick & Flea'], '999+149']);
  assert.deepEqual([out[1].type, out[1].name, out[1].amount, out[1].package, out[1].is_primary, out[1].sort_order], ['cat', 'Kitty', 1098, 'Spa Bath', false, 1]);
  assert.equal(out[0].amount! + out[1].amount!, computeSessionTotal({ primaryExpr: '999+149', extras, combined: false }));
});

test('build: combined legacy multi-pet writes no per-pet amounts', () => {
  const out = buildPetInputs({ primary: primary(), primaryExpr: '2100', extras: [extra({ type: 'cat', breed: 'Persian' })], combined: true });
  assert.equal(out.length, 2);
  assert.ok(out.every(o => o.amount === undefined && o.package === undefined));
});

test('build: pets.id re-used only if the pet identity is unchanged', () => {
  const origin = { type: 'dog' as const, breed: 'Labrador', name: 'Bruno' };
  assert.equal(buildPetInputs({ primary: primary({ petId: 'p1', origin }), primaryExpr: '', extras: [], combined: false })[0].id, 'p1');
  assert.equal(buildPetInputs({ primary: primary({ petId: 'p1', origin, breed: 'Pug' }), primaryExpr: '', extras: [], combined: false })[0].id, null);
  assert.equal(buildPetInputs({ primary: primary({ petId: 'p1', origin, name: 'Max' }), primaryExpr: '', extras: [], combined: false })[0].id, null);
  assert.equal(buildPetInputs({ primary: primary({ petId: 'p1', origin, type: 'cat' }), primaryExpr: '', extras: [], combined: false })[0].id, null);
  // case / whitespace differences are not an identity change
  assert.equal(buildPetInputs({ primary: primary({ petId: 'p1', origin, name: ' bruno ', breed: 'labrador' }), primaryExpr: '', extras: [], combined: false })[0].id, 'p1');
});

test('build: extras keep their pet id when untouched', () => {
  const e = extra({ petId: 'c9', origin: { type: 'cat', breed: 'Persian', name: null }, type: 'cat', breed: 'Persian', amount_expr: '1' });
  const out = buildPetInputs({ primary: primary(), primaryExpr: '1', extras: [e], combined: false });
  assert.equal(out[1].id, 'c9');
});

// ─── matching to existing pets ──────────────────────────────────────

const pets: CandidatePet[] = [
  { id: 'lab-bruno', name: 'Bruno', type: 'dog', breed: 'Labrador' },
  { id: 'lab-max', name: 'Max', type: 'dog', breed: 'Labrador' },
  { id: 'cat1', name: null, type: 'cat', breed: 'Persian' },
];

test('match: explicit id wins', () => {
  assert.equal(pickExistingPet(pets, { id: 'lab-max', name: 'x', type: 'dog', breed: 'Pug' }, new Set())?.id, 'lab-max');
});

test('match: by name distinguishes two same-breed dogs', () => {
  assert.equal(pickExistingPet(pets, { name: 'max', type: 'dog', breed: 'Labrador' }, new Set())?.id, 'lab-max');
  assert.equal(pickExistingPet(pets, { name: 'Bruno', type: 'dog', breed: 'Labrador' }, new Set())?.id, 'lab-bruno');
});

test('match: new name for a same-breed dog does NOT hijack a differently-named pet', () => {
  assert.equal(pickExistingPet(pets, { name: 'Rocky', type: 'dog', breed: 'Labrador' }, new Set()), null);
});

test('match: named input may adopt an unnamed pet of same type+breed', () => {
  assert.equal(pickExistingPet(pets, { name: 'Tom', type: 'cat', breed: 'Persian' }, new Set())?.id, 'cat1');
});

test('match: legacy unnamed input matches by type+breed (old behaviour)', () => {
  assert.equal(pickExistingPet(pets, { type: 'dog', breed: 'labrador' }, new Set())?.id, 'lab-bruno');
});

test('match: two unnamed same-breed pets in ONE session get two different pets (the dropped-pet bug)', () => {
  const used = new Set<string>();
  const first = pickExistingPet(pets, { type: 'dog', breed: 'Labrador' }, used)!;
  used.add(first.id);
  const second = pickExistingPet(pets, { type: 'dog', breed: 'Labrador' }, used)!;
  assert.notEqual(first.id, second.id);
  used.add(second.id);
  assert.equal(pickExistingPet(pets, { type: 'dog', breed: 'Labrador' }, used), null);   // → create a third
});

test('match: prefers active pets over soft-deleted ones', () => {
  const c: CandidatePet[] = [
    { id: 'old', name: null, type: 'dog', breed: 'Pug', is_active: false },
    { id: 'new', name: null, type: 'dog', breed: 'Pug', is_active: true },
  ];
  assert.equal(pickExistingPet(c, { type: 'dog', breed: 'Pug' }, new Set())?.id, 'new');
});

test('match: nothing matches → null (create)', () => {
  assert.equal(pickExistingPet(pets, { type: 'cat', breed: 'Siamese' }, new Set()), null);
  assert.equal(pickExistingPet([], { type: 'dog', breed: 'Pug' }, new Set()), null);
});

// ─── display lines ──────────────────────────────────────────────────

const sess = (over = {}) => ({ pet_type: 'dog' as const, pet_name: 'Bruno', breed: 'Labrador', package: 'Spa Bath + Hair Cut', add_ons: [] as string[], booking_amount: 2100, ...over });

test('display: single pet (or no rows) → [] so callers keep their normal display', () => {
  assert.deepEqual(buildDisplayPets(sess(), []), []);
  assert.deepEqual(buildDisplayPets(sess(), [row({ pet_id: 'p1' })]), []);
});

test('display: itemised dog + cat shows each pet\'s own package, add-ons and price', () => {
  const rows = [
    row({ pet_id: 'd1', is_primary: true, sort_order: 0, per_pet_amount: 1500, per_pet_amount_expr: '1500' }),
    row({ pet_id: 'c1', sort_order: 1, per_pet_amount: 600, per_pet_amount_expr: '600', per_pet_package: 'Spa Bath', per_pet_addons: ['Deworming'],
      pets: { name: 'Kitty', type: 'cat', breed: 'Persian', age_bucket: null, medical: null } }),
  ];
  const d = buildDisplayPets(sess(), rows);
  assert.equal(d.length, 2);
  assert.deepEqual([d[0].name, d[0].package, d[0].amount], ['Bruno', 'Spa Bath + Hair Cut', 1500]);
  assert.deepEqual([d[1].name, d[1].type, d[1].package, d[1].add_ons, d[1].amount], ['Kitty', 'cat', 'Spa Bath', ['Deworming'], 600]);
  assert.equal(petLineText(d[1], { showAmount: true }), 'Kitty (Persian) — Spa Bath + Deworming — ₹600');
  assert.equal(petLineText(d[1]), 'Kitty (Persian) — Spa Bath + Deworming');
});

test('display: legacy combined session → extras listed WITHOUT invented package/price', () => {
  const rows = [
    row({ pet_id: 'd1' }),
    row({ pet_id: 'c1', pets: { name: null, type: 'cat', breed: 'Persian', age_bucket: null, medical: null } }),
  ];
  const d = buildDisplayPets(sess({ breed: 'Labrador' }), rows);
  assert.equal(d.length, 2);
  assert.equal(d[0].amount, null);                       // no per-pet amount known
  assert.deepEqual([d[1].package, d[1].amount, d[1].add_ons], [null, null, []]);
  assert.equal(petLineText(d[1], { showAmount: true }), 'Persian');   // nothing made up
});

test('petLineText: unnamed / breedless pets fall back to Dog / Cat', () => {
  assert.equal(petLineText({ name: null, type: 'cat', breed: null, package: null, add_ons: [], amount: null }), 'Cat');
  assert.equal(petLineText({ name: 'Rex', type: 'dog', breed: null, package: 'Hair Cut', add_ons: [], amount: 999 }, { showAmount: true }), 'Rex — Hair Cut — ₹999');
});
