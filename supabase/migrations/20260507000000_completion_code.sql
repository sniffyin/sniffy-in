/*
  # Completion code for grooming sessions

  When a coordinator creates (or has previously created) a grooming
  session, the system auto-assigns a random 4-digit completion code.
  The coordinator shares the code with the customer via WhatsApp
  (manual; outside the app).

  At the customer's place, the groomer asks for the code while
  marking the session complete.  If the customer doesn't have the
  code on hand, the groomer falls back to uploading a "completion
  photo" of the groomed pet as alternative proof.

  Columns added:
    completion_code        text  — 4-digit numeric, auto-assigned on insert
    completion_photo_url   text  — uploaded photo URL when fallback is used
    completion_method      text  — 'code' | 'photo' — how the groomer
                                   completed (filled when groomer marks
                                   complete; null otherwise)

  Backward compatible:
    - All new columns are nullable (or auto-defaulted).
    - Existing rows are backfilled with codes via a one-shot UPDATE.
    - SessionFormModal does not need to set the code; the trigger
      handles that for INSERTs.
*/

ALTER TABLE public.grooming_sessions
  ADD COLUMN IF NOT EXISTS completion_code      text,
  ADD COLUMN IF NOT EXISTS completion_photo_url text,
  ADD COLUMN IF NOT EXISTS completion_method    text;

-- CHECK constraint for completion_method
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gs_completion_method_check'
  ) THEN
    ALTER TABLE public.grooming_sessions
      ADD CONSTRAINT gs_completion_method_check
      CHECK (completion_method IS NULL OR completion_method IN ('code','photo'));
  END IF;
END $$;

-- ─── Auto-assign code on INSERT ───────────────────────────────
-- Generates a zero-padded 4-digit string ('0000'–'9999').

CREATE OR REPLACE FUNCTION grooming_sessions_assign_completion_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.completion_code IS NULL THEN
    NEW.completion_code := lpad(floor(random() * 10000)::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS grooming_sessions_completion_code_trg ON public.grooming_sessions;
CREATE TRIGGER grooming_sessions_completion_code_trg
  BEFORE INSERT ON public.grooming_sessions
  FOR EACH ROW EXECUTE FUNCTION grooming_sessions_assign_completion_code();

-- ─── Backfill existing rows ───────────────────────────────────

UPDATE public.grooming_sessions
   SET completion_code = lpad(floor(random() * 10000)::text, 4, '0')
 WHERE completion_code IS NULL;
