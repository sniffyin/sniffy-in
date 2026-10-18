/*
  # Phase 2c — Customer notes audit trail
  =======================================

  Purpose
  -------
  Capture every change to `customers.notes` so we can show "who said
  what about this customer, and when."  Notes drive a lot of
  operational behaviour (allergies, gate codes, payment quirks) and
  occasionally get overwritten by a well-meaning coordinator — having
  a history means we can recover the old text in seconds.

  Scope is intentionally narrow: only the `notes` column is tracked.
  Tags / VIP / address changes can be added later if it turns out we
  need them too.  Keeping the table small means the trigger stays
  cheap and the UI stays focused.

  1. New table
    - `customer_notes_history`
      - id            uuid PK
      - customer_id   uuid FK customers(id) ON DELETE CASCADE
      - prev_text     text          — what the note used to say (nullable for the first insert)
      - new_text      text          — what the note was changed to
      - changed_at    timestamptz   — when the change happened
      - changed_by    text          — auth.uid() if available, else 'coordinator'
                                       (we don't FK to auth.users because the admin
                                       app's coordinator/admin/viewer roles are
                                       localStorage-based, not Supabase auth)

  2. Trigger
    - `log_customer_notes_change()` on customers AFTER UPDATE OF notes.
      Skipped when prev = new (no-op writes don't pollute the log).
      Skipped when both sides are null/empty (system-initiated nulls
      from merges/backfills shouldn't appear as user edits).

  3. RLS
    - SELECT: authenticated users (admin app).
    - INSERT: only via the trigger (no app-side writes allowed) — we
      simulate this by NOT granting INSERT to authenticated.
    - Trigger runs with the table owner's privileges (SECURITY DEFINER)
      so the lack of INSERT grant doesn't block legitimate audit writes.
*/

CREATE TABLE IF NOT EXISTS customer_notes_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  prev_text   text,
  new_text    text,
  changed_at  timestamptz NOT NULL DEFAULT now(),
  changed_by  text
);

CREATE INDEX IF NOT EXISTS idx_notes_history_customer
  ON customer_notes_history (customer_id, changed_at DESC);

ALTER TABLE customer_notes_history ENABLE ROW LEVEL SECURITY;

-- READ access for the admin app.  No INSERT/UPDATE/DELETE policies —
-- writes flow exclusively through the trigger below.
CREATE POLICY "notes_history: authenticated read"
  ON customer_notes_history FOR SELECT TO authenticated USING (true);

-- ─────────────────────────────────────────────────────────────────────
-- Trigger
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION log_customer_notes_change()
RETURNS trigger AS $$
DECLARE
  v_prev text;
  v_new  text;
  v_user text;
BEGIN
  v_prev := COALESCE(OLD.notes, '');
  v_new  := COALESCE(NEW.notes, '');

  -- Skip non-changes (no-op updates from the admin UI when the
  -- coordinator opens/saves the modal without touching notes).
  IF v_prev = v_new THEN
    RETURN NEW;
  END IF;

  -- Skip system-initiated nulls — e.g. a merge that picked the
  -- winner's notes over the loser's; that already produced a
  -- concatenated note via merge_customers().
  IF length(trim(v_prev)) = 0 AND length(trim(v_new)) = 0 THEN
    RETURN NEW;
  END IF;

  -- Capture the auth.uid() of whoever made the change.  Coordinator
  -- accounts aren't Supabase-auth users — they sign in via a
  -- localStorage-backed auth store, so auth.uid() is usually NULL.
  -- We still log the row; the UI can attribute it to 'coordinator'.
  BEGIN
    v_user := (SELECT auth.uid()::text);
  EXCEPTION WHEN OTHERS THEN
    v_user := NULL;
  END;

  INSERT INTO customer_notes_history (customer_id, prev_text, new_text, changed_by)
  VALUES (NEW.id, OLD.notes, NEW.notes, COALESCE(v_user, 'coordinator'));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_customer_notes_audit ON customers;
CREATE TRIGGER trg_customer_notes_audit
  AFTER UPDATE OF notes ON customers
  FOR EACH ROW
  EXECUTE FUNCTION log_customer_notes_change();
