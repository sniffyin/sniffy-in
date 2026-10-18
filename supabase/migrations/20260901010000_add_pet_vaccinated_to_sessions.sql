/*
  # Add pet_vaccinated to grooming_sessions

  Bookings collect "Is your pet vaccinated?" on the public wizard
  (see 20260901000000_add_pet_vaccinated_to_bookings.sql), but that
  answer was being dropped when a coordinator converted the booking
  into a session — grooming_sessions had nowhere to carry it.

  Nullable: sessions added manually (no source booking) simply have
  no known vaccination status, and the UI treats null as "unknown"
  (no badge shown) rather than "not vaccinated".
*/

ALTER TABLE grooming_sessions
  ADD COLUMN IF NOT EXISTS pet_vaccinated boolean;
