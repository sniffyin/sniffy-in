/*
  # Add 'lwp' (Leave Without Pay) to groomer_leaves.status

  Idempotent: safe to run whether the original migration was applied or not.
  - If the table doesn't exist, this is a no-op.
  - If the constraint already allows 'lwp' (e.g. you re-applied the updated
    create migration), this is also a no-op.
  - Otherwise the existing CHECK constraint is dropped and replaced with one
    that allows 'lwp'.
*/

DO $$
DECLARE
  v_conname text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'groomer_leaves'
  ) THEN
    RETURN;
  END IF;

  -- Find the current CHECK constraint on the status column (auto-named)
  SELECT con.conname INTO v_conname
  FROM   pg_constraint con
  JOIN   pg_class      rel ON rel.oid = con.conrelid
  WHERE  rel.relname = 'groomer_leaves'
    AND  con.contype = 'c'
    AND  pg_get_constraintdef(con.oid) ILIKE '%status%';

  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE groomer_leaves DROP CONSTRAINT %I', v_conname);
  END IF;

  ALTER TABLE groomer_leaves
    ADD CONSTRAINT groomer_leaves_status_check
    CHECK (status IN ('pending','approved','rejected','lwp'));
END $$;
