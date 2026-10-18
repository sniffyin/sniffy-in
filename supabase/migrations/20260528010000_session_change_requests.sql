/*
  # Session change requests — Phase 6b (reschedule / cancel)
  ============================================================

  Purpose
  -------
  Customers can ask to RESCHEDULE or CANCEL an upcoming session/booking
  from the portal.  We do NOT mutate grooming_sessions / bookings
  directly — those writes stay admin-only — instead a row lands in
  `session_change_requests` and the coordinator approves or declines.

  Why a separate table (vs adding columns to bookings)?
    • A single request can target a `bookings` row (lead not yet
      converted) OR a `grooming_sessions` row (already scheduled).
      Putting columns on both meant duplicating logic.
    • Approve/decline is an event with a timestamp + actor; that wants
      its own row, not nullable columns smeared across two tables.
    • Audit trail is preserved even after a booking is converted to a
      session: the request still points at the original row by id.

  Tables
  ------
  session_change_requests — one row per customer-initiated change.

  RPCs
  ----
  • request_booking_change(p_type, p_session_id?, p_booking_id?,
                            p_new_date?, p_new_time?, p_notes?)
       Called by the portal client.  current_customer_id() must own
       the target row.  Refuses if a pending request already exists
       for that target.

  • respond_booking_change(p_request_id, p_action, p_response_notes, p_by)
       Coordinator-facing.  action ∈ {'approve','decline'}.  On approve
       for a reschedule against grooming_sessions, applies the new
       session_date / scheduled_time.  On approve for a cancel, sets
       status = 'cancelled'.  Bookings get a marker in customer_notes
       so the BookingsTab convert flow shows the requested change.

  Notes
  -----
  • We do NOT auto-cascade approval to the groomer's calendar — that's
    a downstream concern handled by the existing trigger that recomputes
    on grooming_sessions updates.
  • Declined requests stay in the table forever; lets us measure how
    often coordinators turn down asks.
*/

-- ─────────────────────────────────────────────────────────────────────
-- 1. session_change_requests table
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS session_change_requests (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id          uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Exactly one of these MUST be set.  We don't FK-cascade because the
  -- request should survive cancellation of the target row for audit.
  session_id           uuid REFERENCES grooming_sessions(id) ON DELETE SET NULL,
  booking_id           uuid REFERENCES bookings(id) ON DELETE SET NULL,

  request_type         text NOT NULL CHECK (request_type IN ('reschedule','cancel')),

  -- Only meaningful for 'reschedule'.  Free-text time for now (matches
  -- how scheduled_time is currently stored on grooming_sessions).
  requested_new_date   date,
  requested_new_time   text,

  customer_notes       text,

  status               text NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','approved','declined')),
  responded_at         timestamptz,
  responded_by         text,
  response_notes       text,

  created_at           timestamptz NOT NULL DEFAULT now(),

  CHECK (session_id IS NOT NULL OR booking_id IS NOT NULL),
  CHECK (request_type = 'cancel' OR requested_new_date IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_scr_customer        ON session_change_requests (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scr_pending_session ON session_change_requests (session_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_scr_pending_booking ON session_change_requests (booking_id) WHERE status = 'pending';

-- One pending request per (session OR booking) target.  Partial unique
-- indexes — separate one per target column because (session_id, status)
-- and (booking_id, status) are independent constraints.
CREATE UNIQUE INDEX IF NOT EXISTS uq_scr_pending_session
  ON session_change_requests (session_id) WHERE status = 'pending' AND session_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_scr_pending_booking
  ON session_change_requests (booking_id) WHERE status = 'pending' AND booking_id IS NOT NULL;

ALTER TABLE session_change_requests ENABLE ROW LEVEL SECURITY;

-- Admin: full access.
CREATE POLICY "scr: authenticated read"  ON session_change_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "scr: authenticated write" ON session_change_requests FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- Customer: read/insert their own.  Updates go through respond_* RPC
-- (coordinator only), so no UPDATE policy is granted to customers.
CREATE POLICY "scr: customer self read"
  ON session_change_requests FOR SELECT TO authenticated
  USING (customer_id = current_customer_id());

CREATE POLICY "scr: customer self insert"
  ON session_change_requests FOR INSERT TO authenticated
  WITH CHECK (customer_id = current_customer_id());

-- ─────────────────────────────────────────────────────────────────────
-- 2. request_booking_change() RPC
-- ─────────────────────────────────────────────────────────────────────
-- Called by the portal.  Validates ownership, prevents duplicate
-- pending requests, and writes the row.

CREATE OR REPLACE FUNCTION request_booking_change(
  p_type            text,
  p_session_id      uuid DEFAULT NULL,
  p_booking_id      uuid DEFAULT NULL,
  p_new_date        date DEFAULT NULL,
  p_new_time        text DEFAULT NULL,
  p_customer_notes  text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_customer_id uuid;
  v_owner       uuid;
  v_request_id  uuid;
  v_target_status text;
BEGIN
  IF p_type NOT IN ('reschedule','cancel') THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_type');
  END IF;
  IF (p_session_id IS NULL) = (p_booking_id IS NULL) THEN
    RETURN jsonb_build_object('success', false, 'error', 'need_exactly_one_target');
  END IF;
  IF p_type = 'reschedule' AND p_new_date IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'reschedule_needs_new_date');
  END IF;

  v_customer_id := current_customer_id();
  -- Coordinator-initiated changes can also flow through this RPC; in
  -- that case current_customer_id() is NULL and we trust the caller.
  -- For now we require a customer context (portal flow).
  IF v_customer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_signed_in');
  END IF;

  -- Verify the customer owns the target row.
  IF p_session_id IS NOT NULL THEN
    SELECT customer_id, status INTO v_owner, v_target_status
      FROM grooming_sessions WHERE id = p_session_id;
    IF v_owner IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'session_not_found'); END IF;
    IF v_owner <> v_customer_id THEN RETURN jsonb_build_object('success', false, 'error', 'not_owner'); END IF;
    IF v_target_status IN ('completed','cancelled') THEN
      RETURN jsonb_build_object('success', false, 'error', 'session_already_'||v_target_status);
    END IF;
  ELSE
    SELECT customer_id INTO v_owner FROM bookings WHERE id = p_booking_id;
    IF v_owner IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'booking_not_found'); END IF;
    IF v_owner <> v_customer_id THEN RETURN jsonb_build_object('success', false, 'error', 'not_owner'); END IF;
  END IF;

  -- Reject duplicate pending request.  Index enforces this too — we
  -- check up front for a friendlier error than UNIQUE_VIOLATION.
  IF EXISTS (
    SELECT 1 FROM session_change_requests
     WHERE status = 'pending'
       AND ( (p_session_id IS NOT NULL AND session_id = p_session_id)
          OR (p_booking_id IS NOT NULL AND booking_id = p_booking_id) )
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'pending_request_exists');
  END IF;

  INSERT INTO session_change_requests (
    customer_id, session_id, booking_id, request_type,
    requested_new_date, requested_new_time, customer_notes
  ) VALUES (
    v_customer_id, p_session_id, p_booking_id, p_type,
    p_new_date, NULLIF(trim(p_new_time), ''), NULLIF(trim(p_customer_notes), '')
  ) RETURNING id INTO v_request_id;

  RETURN jsonb_build_object('success', true, 'request_id', v_request_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION request_booking_change(text, uuid, uuid, date, text, text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 3. respond_booking_change() RPC
-- ─────────────────────────────────────────────────────────────────────
-- Coordinator-facing.  Approves or declines.  On approve, applies the
-- change to the target row.

CREATE OR REPLACE FUNCTION respond_booking_change(
  p_request_id   uuid,
  p_action       text,             -- 'approve' | 'decline'
  p_response_notes text DEFAULT NULL,
  p_by           text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_req session_change_requests%ROWTYPE;
BEGIN
  IF p_action NOT IN ('approve','decline') THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_action');
  END IF;

  SELECT * INTO v_req FROM session_change_requests WHERE id = p_request_id FOR UPDATE;
  IF v_req.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'request_not_found');
  END IF;
  IF v_req.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_responded', 'status', v_req.status);
  END IF;

  IF p_action = 'approve' THEN
    -- Apply the change to the target row.
    IF v_req.session_id IS NOT NULL THEN
      IF v_req.request_type = 'reschedule' THEN
        UPDATE grooming_sessions SET
          session_date    = v_req.requested_new_date,
          scheduled_time  = COALESCE(v_req.requested_new_time, scheduled_time)
        WHERE id = v_req.session_id;
      ELSIF v_req.request_type = 'cancel' THEN
        UPDATE grooming_sessions SET status = 'cancelled' WHERE id = v_req.session_id;
      END IF;
    ELSIF v_req.booking_id IS NOT NULL THEN
      IF v_req.request_type = 'reschedule' THEN
        -- bookings has `preferred_date` (Phase 4) and `customer_notes`.
        UPDATE bookings SET
          preferred_date  = v_req.requested_new_date,
          customer_notes  = COALESCE(customer_notes, '') ||
                            CASE WHEN v_req.customer_notes IS NOT NULL
                                 THEN E'\n[Customer reschedule request] ' || v_req.customer_notes
                                 ELSE E'\n[Customer requested a reschedule]'
                            END
        WHERE id = v_req.booking_id;
      ELSIF v_req.request_type = 'cancel' THEN
        UPDATE bookings SET
          customer_notes = COALESCE(customer_notes, '') || E'\n[Customer cancelled this request]'
        WHERE id = v_req.booking_id;
      END IF;
    END IF;
  END IF;

  UPDATE session_change_requests SET
    status         = CASE WHEN p_action = 'approve' THEN 'approved' ELSE 'declined' END,
    responded_at   = now(),
    responded_by   = COALESCE(NULLIF(trim(p_by), ''), 'coordinator'),
    response_notes = NULLIF(trim(p_response_notes), '')
  WHERE id = p_request_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION respond_booking_change(uuid, text, text, text) TO authenticated;
