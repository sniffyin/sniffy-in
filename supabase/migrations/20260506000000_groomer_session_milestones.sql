/*
  # Groomer Session Milestones — arrival, completion, payment, review claim

  Adds the milestone columns that power the streamlined groomer flow:

    1. ARRIVAL      — groomer marks arrived (mandatory gateway), uploads
                      selfie. On-time bonus tracked via arrival_bonus_status.
                      Existing `groomer_on_time` boolean stays as the
                      canonical "arrived in window" flag and is set true
                      when the arrival is within scheduled_time + 15 min.
    2. COMPLETION   — groomer marks complete (separate from the coordinator-
                      controlled `status` enum, which keeps its meaning).
    3. PAYMENT      — mode + upsell + tip; `total_collected` is a generated
                      column following the pattern of `net_booking_amount`.
    4. REVIEW CLAIM — groomer's claim layer over the canonical
                      client_rating / client_review fields. When the
                      coordinator approves a claim, the canonical fields
                      get updated. When the coordinator edits the canonical
                      fields directly (their existing manual path),
                      review_claim_status stays at 'none' — no conflict.

  Also patches:
    - Adds `review_taken boolean` (referenced in TS / SessionFormModal but
      currently missing from the DB; the toggle there silently no-ops today).
    - Hardens `groomer_leaves.status` CHECK to include 'lwp' — the app
      already writes this value but the constraint may be stale in prod.

  ## Backward compatibility (important)

  - Every column added with `IF NOT EXISTS` — safe to re-run.
  - All new columns are nullable, defaulted, or generated. Existing
    INSERT/UPDATE statements (the SessionFormModal etc.) keep working
    without modification.
  - No existing column type, constraint, or default is altered.
  - The `groomer_leaves` CHECK is replaced by a SUPERSET — every value
    that was valid before remains valid.
  - `total_collected` is computed from `booking_amount` (existing) plus
    new `upsell_amount` and `tip_amount` (default 0), so existing rows
    automatically end up with `total_collected = booking_amount`.
  - `review_taken` is backfilled to `true` only where `client_rating`
    is set, matching the implicit "review taken" signal the app has
    been using.
*/

-- ─── grooming_sessions: ARRIVAL milestone ─────────────────────

ALTER TABLE public.grooming_sessions
  ADD COLUMN IF NOT EXISTS arrival_marked_at           timestamptz,
  ADD COLUMN IF NOT EXISTS arrival_selfie_url          text,
  ADD COLUMN IF NOT EXISTS arrival_bonus_status        text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS arrival_bonus_approved_by   text,
  ADD COLUMN IF NOT EXISTS arrival_bonus_approved_at   timestamptz,
  ADD COLUMN IF NOT EXISTS arrival_bonus_rejected_note text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gs_arrival_bonus_status_check'
  ) THEN
    ALTER TABLE public.grooming_sessions
      ADD CONSTRAINT gs_arrival_bonus_status_check
      CHECK (arrival_bonus_status IN ('none','pending','approved','rejected'));
  END IF;
END $$;

-- ─── grooming_sessions: COMPLETION milestone (groomer's own mark) ──
-- Separate from `status` — coordinator still owns the official status flip.

ALTER TABLE public.grooming_sessions
  ADD COLUMN IF NOT EXISTS groomer_marked_complete_at timestamptz;

-- ─── grooming_sessions: PAYMENT ───────────────────────────────

ALTER TABLE public.grooming_sessions
  ADD COLUMN IF NOT EXISTS payment_collected_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_mode         text,
  ADD COLUMN IF NOT EXISTS upsell_amount        numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tip_amount           numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_notes        text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gs_payment_mode_check'
  ) THEN
    ALTER TABLE public.grooming_sessions
      ADD CONSTRAINT gs_payment_mode_check
      CHECK (payment_mode IS NULL OR payment_mode IN ('cash','online'));
  END IF;
END $$;

-- total_collected — same generated-stored pattern as net_booking_amount.
-- Auto-computes for every existing row using booking_amount + 0 + 0.
ALTER TABLE public.grooming_sessions
  ADD COLUMN IF NOT EXISTS total_collected numeric(10,2)
    GENERATED ALWAYS AS (
      COALESCE(booking_amount, 0) + COALESCE(upsell_amount, 0) + COALESCE(tip_amount, 0)
    ) STORED;

-- ─── grooming_sessions: REVIEW CLAIM (groomer's claim layer) ──

ALTER TABLE public.grooming_sessions
  ADD COLUMN IF NOT EXISTS review_proof_url           text,
  ADD COLUMN IF NOT EXISTS review_claim_at            timestamptz,
  ADD COLUMN IF NOT EXISTS review_claim_rating        integer,
  ADD COLUMN IF NOT EXISTS review_claim_status        text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS review_claim_approved_by   text,
  ADD COLUMN IF NOT EXISTS review_claim_approved_at   timestamptz,
  ADD COLUMN IF NOT EXISTS review_claim_rejected_note text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gs_review_claim_status_check'
  ) THEN
    ALTER TABLE public.grooming_sessions
      ADD CONSTRAINT gs_review_claim_status_check
      CHECK (review_claim_status IN ('none','pending','approved','rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gs_review_claim_rating_check'
  ) THEN
    ALTER TABLE public.grooming_sessions
      ADD CONSTRAINT gs_review_claim_rating_check
      CHECK (review_claim_rating IS NULL OR (review_claim_rating BETWEEN 1 AND 5));
  END IF;
END $$;

-- ─── grooming_sessions: review_taken (TS already references it) ──

ALTER TABLE public.grooming_sessions
  ADD COLUMN IF NOT EXISTS review_taken boolean DEFAULT false;

-- Backfill — rows where the coordinator has set client_rating in the past
-- are clearly "review taken" sessions; mirror that into the new boolean
-- so historical data isn't silently understated.
UPDATE public.grooming_sessions
   SET review_taken = true
 WHERE client_rating IS NOT NULL
   AND COALESCE(review_taken, false) = false;

-- ─── Indexes — partial, only for the approval queue queries ──

CREATE INDEX IF NOT EXISTS idx_gs_arrival_bonus_pending
  ON public.grooming_sessions (arrival_bonus_status, session_date)
  WHERE arrival_bonus_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_gs_review_claim_pending
  ON public.grooming_sessions (review_claim_status, session_date)
  WHERE review_claim_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_gs_groomer_marked_complete
  ON public.grooming_sessions (groomer_marked_complete_at)
  WHERE groomer_marked_complete_at IS NOT NULL;

-- ─── groomer_leaves: defensive 'lwp' patch ────────────────────
-- Idempotent: drops then re-adds with the superset of allowed values.

ALTER TABLE public.groomer_leaves
  DROP CONSTRAINT IF EXISTS groomer_leaves_status_check;

ALTER TABLE public.groomer_leaves
  ADD CONSTRAINT groomer_leaves_status_check
  CHECK (status IN ('pending','approved','rejected','lwp'));
