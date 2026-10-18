/*
  # Add pet_name to grooming_sessions

  Same gap as pet_vaccinated (20260901010000): the public booking wizard
  collects the pet's name, but grooming_sessions had nowhere to carry it
  when a coordinator converts the booking into a session — so it was
  silently dropped at conversion time.

  Nullable: manually-added sessions (no source booking) simply have no
  pet name on file.
*/

ALTER TABLE grooming_sessions
  ADD COLUMN IF NOT EXISTS pet_name text;
