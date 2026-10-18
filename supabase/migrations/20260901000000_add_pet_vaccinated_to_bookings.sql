/*
  # Add pet_name and pet_vaccinated to bookings

  The public booking wizard now collects two additional, mandatory
  fields:
    - Pet name (was previously captured in the UI but never persisted)
    - "Is your pet vaccinated?" yes/no

  Both are nullable at the DB level (existing rows have neither) — the
  booking wizard enforces them as required before a lead can be submitted.
*/

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS pet_name text,
  ADD COLUMN IF NOT EXISTS pet_vaccinated boolean;
