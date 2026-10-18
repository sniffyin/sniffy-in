-- Passport-size photo + drawn signature captured on the groomer onboarding form.
-- Files live in the existing `groomer-uploads` bucket (passport/, signature/).
ALTER TABLE groomer_applications
  ADD COLUMN IF NOT EXISTS passport_photo_url text,
  ADD COLUMN IF NOT EXISTS signature_url      text;
