/*
  # Per-pet package / add-ons / amount on multi-pet sessions

  `session_pets` already has per_pet_package / per_pet_amount / per_pet_addons
  (Phase 1) but nothing wrote them.  This migration adds the three columns the
  session form needs to use them reliably:

    - is_primary          — which row is "pet #1" (the pet mirrored onto the
                            grooming_sessions pet_type / breed / package cols)
    - sort_order          — display order inside the session
    - per_pet_amount_expr — the "799+299" expression the coordinator typed

  BACKWARD COMPATIBILITY — this migration is strictly additive:
    * No existing column is altered, dropped or rewritten.
    * No existing row is updated (is_primary defaults to false; sort_order and
      per_pet_amount_expr stay NULL).  Old sessions keep working exactly as
      before; the app falls back to the session-level columns when per-pet
      values are NULL.
    * grooming_sessions.booking_amount / package / add_ons / pet_type remain
      the source of truth for the session and for every existing report.
      For itemised multi-pet sessions the app keeps
      booking_amount = SUM(per_pet_amount).

  Idempotent: safe to run more than once.
*/

ALTER TABLE session_pets
  ADD COLUMN IF NOT EXISTS is_primary          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order          integer,
  ADD COLUMN IF NOT EXISTS per_pet_amount_expr text;

-- At most one primary pet per session.  Every existing row is
-- is_primary = false, so creating this index cannot fail on old data.
CREATE UNIQUE INDEX IF NOT EXISTS uq_session_pets_one_primary
  ON session_pets (session_id)
  WHERE is_primary;

-- RLS: the existing "session_pets: read" / "session_pets: write" policies
-- (20260522010000) already cover anon + authenticated for all columns, so
-- no policy change is needed for the admin/groomer (anon) surfaces.
