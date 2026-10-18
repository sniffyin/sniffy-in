/*
  # Phase 2a — Customer merge function
  ====================================

  Purpose
  -------
  Provides an atomic, idempotent `merge_customers(keep, drop)` function
  used by the admin "Merge customers" tool.  Consolidates two customer
  records that turn out to be the same person — typically because a
  legacy session row had a typo'd phone, or two phones (work + personal)
  belong to the same household and we'd rather track them as one.

  What it does (in order, all within a single function call so it's
  atomic — partial merges can't happen):

    1. Reassign every `grooming_sessions` row from the loser to the
       winner.  The aggregates trigger will recompute the winner's
       totals automatically on these UPDATEs.
    2. Reassign every `bookings` row from the loser to the winner.
    3. Reassign every `pets` row from the loser to the winner.
       Where the winner already has a pet with the same type+breed
       (case-insensitive), we DON'T duplicate — the loser's pet rows
       are re-pointed via session_pets to the winner's existing pet,
       then deleted.  This avoids "Bruno (Golden Retriever)" appearing
       twice on the merged customer's pet roster.
    4. Carry over editorial fields (notes, tags, name, address) using
       a "loser fills winner's gaps" policy — we never overwrite data
       the winner already has, but we backfill anything the winner is
       missing.  Notes get concatenated with a separator so nothing is
       silently lost.
    5. Carry over VIP / opt-in flags via OR (if either side was VIP,
       merged customer is VIP).
    6. Delete the loser.  The CASCADE on pets is unnecessary because
       step 3 already cleared them; sessions/bookings keep their FK
       integrity because they now point to the winner.

  Returns the winner's id.  Raises if either id is missing or if
  keep_id = drop_id (which would be a no-op but a sign of a UI bug).

  Why a SQL function and not application code?
    • Atomicity — if the function crashes halfway, Postgres rolls back
      and nothing is half-merged.
    • Performance — the aggregates trigger fires per row on the
      winner only, and only once per session.  An app-side loop would
      either fire the trigger many times or have to suppress it.
    • Auditability — the merge logic lives in one place that any
      future code path can call (CLI, scheduled dedup, etc).
*/

CREATE OR REPLACE FUNCTION merge_customers(p_keep_id uuid, p_drop_id uuid)
RETURNS uuid AS $$
DECLARE
  v_keep customers%ROWTYPE;
  v_drop customers%ROWTYPE;
  r RECORD;
  v_winner_pet_id uuid;
BEGIN
  IF p_keep_id IS NULL OR p_drop_id IS NULL THEN
    RAISE EXCEPTION 'merge_customers: both keep and drop ids are required';
  END IF;
  IF p_keep_id = p_drop_id THEN
    RAISE EXCEPTION 'merge_customers: keep and drop ids must differ';
  END IF;

  SELECT * INTO v_keep FROM customers WHERE id = p_keep_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'merge_customers: keep id % not found', p_keep_id;
  END IF;
  SELECT * INTO v_drop FROM customers WHERE id = p_drop_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'merge_customers: drop id % not found', p_drop_id;
  END IF;

  -- 1. Reassign sessions.  Aggregates trigger will recompute on the
  --    winner's side; the loser will end up with zeroed aggregates
  --    just before we delete it (harmless).
  UPDATE grooming_sessions SET customer_id = p_keep_id WHERE customer_id = p_drop_id;

  -- 2. Reassign bookings.
  UPDATE bookings SET customer_id = p_keep_id WHERE customer_id = p_drop_id;

  -- 3. Reassign pets — merge by (type, breed) so duplicates collapse.
  --    For each loser pet, look for a matching winner pet.  If found,
  --    re-point session_pets rows to the winner's pet, then delete the
  --    loser pet.  If not found, just move it to the winner.
  FOR r IN
    SELECT id, type, breed FROM pets WHERE customer_id = p_drop_id
  LOOP
    SELECT id INTO v_winner_pet_id
    FROM pets
    WHERE customer_id = p_keep_id
      AND type = r.type
      AND lower(COALESCE(breed,'')) = lower(COALESCE(r.breed,''))
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_winner_pet_id IS NOT NULL THEN
      -- Re-point joins.  ON CONFLICT keeps the unique (session_id,pet_id)
      -- constraint intact — if the same session already has the winner's
      -- pet via another row, we drop the duplicate join silently.
      UPDATE session_pets
        SET pet_id = v_winner_pet_id
        WHERE pet_id = r.id
          AND NOT EXISTS (
            SELECT 1 FROM session_pets sp2
            WHERE sp2.session_id = session_pets.session_id
              AND sp2.pet_id     = v_winner_pet_id
          );
      DELETE FROM session_pets WHERE pet_id = r.id;
      DELETE FROM pets WHERE id = r.id;
    ELSE
      UPDATE pets SET customer_id = p_keep_id WHERE id = r.id;
    END IF;
  END LOOP;

  -- 4. Editorial fields — loser fills winner's gaps.  Name/address/etc.
  --    are only overwritten if the winner had nothing there.  Notes
  --    are concatenated so nothing is lost.
  UPDATE customers SET
    name         = CASE WHEN COALESCE(NULLIF(trim(v_keep.name), ''), NULL) IS NULL
                        THEN COALESCE(v_drop.name, v_keep.name)
                        ELSE v_keep.name END,
    email        = COALESCE(NULLIF(v_keep.email, ''),        v_drop.email),
    address      = COALESCE(NULLIF(v_keep.address, ''),      v_drop.address),
    city         = COALESCE(NULLIF(v_keep.city, ''),         v_drop.city),
    area         = COALESCE(NULLIF(v_keep.area, ''),         v_drop.area),
    gps_location = COALESCE(NULLIF(v_keep.gps_location, ''), v_drop.gps_location),
    notes        = CASE
      WHEN v_drop.notes IS NULL OR length(trim(v_drop.notes)) = 0 THEN v_keep.notes
      WHEN v_keep.notes IS NULL OR length(trim(v_keep.notes)) = 0 THEN v_drop.notes
      ELSE v_keep.notes || E'\n— merged from ' || COALESCE(v_drop.phone_raw, v_drop.phone, '?') || E' —\n' || v_drop.notes
    END,
    -- Tag union (de-duped on the SQL side).
    tags = ARRAY(
      SELECT DISTINCT unnest(COALESCE(v_keep.tags, '{}'::text[]) || COALESCE(v_drop.tags, '{}'::text[]))
    ),
    -- OR-merge for the booleans.
    is_vip          = v_keep.is_vip OR v_drop.is_vip,
    marketing_opt_in = v_keep.marketing_opt_in OR v_drop.marketing_opt_in,
    whatsapp_opt_in  = v_keep.whatsapp_opt_in  OR v_drop.whatsapp_opt_in,
    -- Preserve the earliest source attribution.
    source       = COALESCE(v_keep.source,      v_drop.source),
    source_type  = COALESCE(v_keep.source_type, v_drop.source_type),
    -- Referral wins go to whichever side had a referrer.
    referred_by_customer_id = COALESCE(v_keep.referred_by_customer_id, v_drop.referred_by_customer_id),
    referral_code           = COALESCE(v_keep.referral_code,           v_drop.referral_code),
    -- Portal user id — keep whichever side had a sign-in.  If both did
    -- (shouldn't happen — phone is the unique key on auth user) we
    -- prefer the winner's so the loser's session, if any, is orphaned.
    auth_user_id = COALESCE(v_keep.auth_user_id, v_drop.auth_user_id)
  WHERE id = p_keep_id;

  -- 5. Recompute aggregates on the winner explicitly (the per-row
  --    session trigger has already fired, but a final pass guards
  --    against any edge case + brings lifecycle_stage current).
  PERFORM recompute_customer_aggregates(p_keep_id);

  -- 6. Delete the loser.  By this point it has no pets, no sessions,
  --    no bookings — all moved to the winner.
  DELETE FROM customers WHERE id = p_drop_id;

  RETURN p_keep_id;
END;
$$ LANGUAGE plpgsql;

-- Authenticated app users can call this directly.  The function runs
-- with caller privileges, so existing RLS on customers / sessions /
-- bookings / pets still applies.
GRANT EXECUTE ON FUNCTION merge_customers(uuid, uuid) TO authenticated;
