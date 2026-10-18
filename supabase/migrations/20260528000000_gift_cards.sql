/*
  # Gift cards — Phase 6a (admin-issued)
  ========================================

  Purpose
  -------
  Let coordinators issue prepaid gift cards.  Recipient redeems on the
  portal; balance is held against the card row and consumed via a
  ledger of `gift_card_redemptions`.  When the running balance hits 0
  the card flips to `status = 'redeemed'`.

  Phase 6a explicitly skips portal-side purchase + payment gateway —
  cards are minted by the coordinator after they collect money out-of-
  band (UPI / cash).  The schema is designed so a future portal-
  purchase flow can write to the same tables without breaking changes.

  Tables
  ------
  1. gift_cards                    — issued cards, one row per code.
  2. gift_card_redemptions         — append-only ledger of redemptions.

  Views
  -----
  • customer_gift_card_balance  — sum of remaining balance across all
                                   cards linked to a customer.

  Functions / RPCs
  ----------------
  • generate_gift_card_code(text)             — 10-char unique code.
  • issue_gift_card(amount,…)                 — coordinator issues one.
  • redeem_gift_card_partial(code, customer, amount, session, note, by)
                                              — debit balance, append
                                                 ledger row.  Idempotent
                                                 by (gift_card_id, session_id)
                                                 when session_id is set.
  • void_gift_card(card_id, by, note)         — coordinator voids a card.

  Cooldown / expiry
  -----------------
  Expiry is informational: a daily query (or the redeem RPC itself)
  flips `status = 'expired'` once expires_at < CURRENT_DATE AND balance
  > 0.  Voided cards cannot be redeemed regardless of balance.
*/

-- ─────────────────────────────────────────────────────────────────────
-- 1. generate_gift_card_code()
-- ─────────────────────────────────────────────────────────────────────
-- 10-char code with the same ambiguity-avoiding alphabet as referral
-- codes.  Prefix "GC" so customers can eyeball that it's a gift card.

CREATE OR REPLACE FUNCTION generate_gift_card_code()
RETURNS text AS $$
DECLARE
  v_alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_candidate text;
  v_attempt int := 0;
  i int;
BEGIN
  LOOP
    v_attempt := v_attempt + 1;
    v_candidate := 'GC';
    FOR i IN 1..8 LOOP
      v_candidate := v_candidate || substring(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    END LOOP;
    IF NOT EXISTS (SELECT 1 FROM gift_cards WHERE code = v_candidate) THEN
      RETURN v_candidate;
    END IF;
    IF v_attempt >= 12 THEN
      -- Astronomically unlikely; bail with a long random code.
      v_candidate := 'GC';
      FOR i IN 1..14 LOOP
        v_candidate := v_candidate || substring(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
      END LOOP;
      RETURN v_candidate;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ─────────────────────────────────────────────────────────────────────
-- 2. gift_cards table
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gift_cards (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                   text UNIQUE NOT NULL,
  amount                 numeric(10,2) NOT NULL CHECK (amount > 0),
  balance                numeric(10,2) NOT NULL CHECK (balance >= 0),
  status                 text NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active','redeemed','voided','expired')),

  -- Recipient: who the card is FOR.  Coordinator enters at issue time.
  issued_to_name         text,
  issued_to_phone        text,            -- normalized E.164 form
  issued_to_customer_id  uuid REFERENCES customers(id) ON DELETE SET NULL,

  -- Purchaser: who PAID for the card.  Often the same person; sometimes
  -- not (e.g., a parent buying for their child's pet).  Both optional.
  purchaser_name         text,
  purchaser_phone        text,

  -- Personalisation
  message                text,

  -- Lifecycle stamps
  expires_at             date NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '365 days')::date,
  issued_by              text,
  issued_at              timestamptz NOT NULL DEFAULT now(),
  fully_redeemed_at      timestamptz,
  voided_at              timestamptz,
  voided_by              text,
  void_reason            text
);

CREATE INDEX IF NOT EXISTS idx_gift_cards_recipient ON gift_cards (issued_to_customer_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_recipient_phone ON gift_cards (issued_to_phone);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status_expiry ON gift_cards (status, expires_at);

ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

-- Admin (anon-key + admin app session) — full access.
CREATE POLICY "gift_cards: authenticated read"
  ON gift_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "gift_cards: authenticated write"
  ON gift_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Customer-scope: read your own (by phone or linked customer_id) only.
CREATE POLICY "gift_cards: customer self read"
  ON gift_cards FOR SELECT TO authenticated
  USING (
    issued_to_customer_id = current_customer_id()
    OR issued_to_phone = (SELECT phone FROM customers WHERE id = current_customer_id())
  );

-- ─────────────────────────────────────────────────────────────────────
-- 3. gift_card_redemptions ledger
-- ─────────────────────────────────────────────────────────────────────
-- Append-only.  Positive `amount` = customer redeemed value FROM the
-- card (negative for the card holder).  We post one row per redemption
-- event.  Unique partial index makes "redeem against a session" idempotent.

CREATE TABLE IF NOT EXISTS gift_card_redemptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id    uuid NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  customer_id     uuid REFERENCES customers(id) ON DELETE SET NULL,
  amount          numeric(10,2) NOT NULL CHECK (amount > 0),
  session_id      uuid REFERENCES grooming_sessions(id) ON DELETE SET NULL,
  note            text,
  created_by      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- One redemption per (card, session) pair when both are set — protects
-- against double-application if a coordinator clicks twice.
CREATE UNIQUE INDEX IF NOT EXISTS uq_gift_card_redemptions_session
  ON gift_card_redemptions (gift_card_id, session_id)
  WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gift_card_redemptions_card
  ON gift_card_redemptions (gift_card_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gift_card_redemptions_customer
  ON gift_card_redemptions (customer_id, created_at DESC);

ALTER TABLE gift_card_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gift_card_redemptions: authenticated read"
  ON gift_card_redemptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "gift_card_redemptions: authenticated write"
  ON gift_card_redemptions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "gift_card_redemptions: customer self read"
  ON gift_card_redemptions FOR SELECT TO authenticated
  USING (customer_id = current_customer_id());

-- ─────────────────────────────────────────────────────────────────────
-- 4. customer_gift_card_balance view
-- ─────────────────────────────────────────────────────────────────────
-- Sum of remaining balance across every ACTIVE card a customer can
-- spend from.  A card is spendable when it is linked to the customer
-- (issued_to_customer_id) OR was issued to their phone and they have
-- since signed up.  Expired/voided/fully-redeemed cards are excluded.

CREATE OR REPLACE VIEW customer_gift_card_balance AS
SELECT
  c.id                                AS customer_id,
  COALESCE(SUM(gc.balance), 0)::numeric(10,2) AS balance,
  COUNT(gc.id)                        AS active_card_count,
  COALESCE(MIN(gc.expires_at), NULL)  AS earliest_expiry
FROM customers c
LEFT JOIN gift_cards gc
  ON gc.status = 'active'
  AND gc.balance > 0
  AND gc.expires_at >= CURRENT_DATE
  AND (gc.issued_to_customer_id = c.id OR gc.issued_to_phone = c.phone)
GROUP BY c.id;

GRANT SELECT ON customer_gift_card_balance TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 5. issue_gift_card() RPC
-- ─────────────────────────────────────────────────────────────────────
-- Coordinator-facing.  Returns the freshly minted card row.

CREATE OR REPLACE FUNCTION issue_gift_card(
  p_amount             numeric,
  p_recipient_name     text DEFAULT NULL,
  p_recipient_phone    text DEFAULT NULL,
  p_purchaser_name     text DEFAULT NULL,
  p_purchaser_phone    text DEFAULT NULL,
  p_message            text DEFAULT NULL,
  p_expires_at         date DEFAULT NULL,
  p_issued_by          text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_code text;
  v_phone_norm text;
  v_purchaser_norm text;
  v_customer_id uuid;
  v_card_id uuid;
  v_expires date;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_amount');
  END IF;

  v_phone_norm     := normalize_phone(p_recipient_phone);
  v_purchaser_norm := normalize_phone(p_purchaser_phone);
  v_expires        := COALESCE(p_expires_at, (CURRENT_DATE + INTERVAL '365 days')::date);
  v_code           := generate_gift_card_code();

  -- Auto-link recipient phone to existing customer when possible.  If
  -- the recipient hasn't signed up yet, the phone-match clause in the
  -- balance view will still let them redeem after they do.
  IF v_phone_norm IS NOT NULL THEN
    SELECT id INTO v_customer_id FROM customers WHERE phone = v_phone_norm LIMIT 1;
  END IF;

  INSERT INTO gift_cards (
    code, amount, balance,
    issued_to_name, issued_to_phone, issued_to_customer_id,
    purchaser_name, purchaser_phone, message,
    expires_at, issued_by
  ) VALUES (
    v_code, p_amount, p_amount,
    NULLIF(trim(p_recipient_name), ''), v_phone_norm, v_customer_id,
    NULLIF(trim(p_purchaser_name), ''), v_purchaser_norm, NULLIF(trim(p_message), ''),
    v_expires, COALESCE(NULLIF(trim(p_issued_by), ''), 'coordinator')
  )
  RETURNING id INTO v_card_id;

  RETURN jsonb_build_object(
    'success', true,
    'card_id', v_card_id,
    'code', v_code,
    'amount', p_amount,
    'expires_at', v_expires,
    'customer_id', v_customer_id
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION issue_gift_card(numeric, text, text, text, text, text, date, text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 6. redeem_gift_card_partial() RPC
-- ─────────────────────────────────────────────────────────────────────
-- Debits `p_amount` from the card's balance and posts a ledger row.
-- Returns: {success, error?, new_balance, redemption_id?}
-- Validations:
--   • code exists
--   • status = 'active' and expires_at >= today
--   • balance >= amount  (no partial draws above balance)
--   • recipient match: card must be linked to p_customer_id OR
--     issued_to_phone == that customer's phone

CREATE OR REPLACE FUNCTION redeem_gift_card_partial(
  p_code        text,
  p_customer_id uuid,
  p_amount      numeric,
  p_session_id  uuid DEFAULT NULL,
  p_note        text DEFAULT NULL,
  p_created_by  text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_card        gift_cards%ROWTYPE;
  v_cust_phone  text;
  v_redemption  uuid;
  v_new_balance numeric(10,2);
BEGIN
  IF p_code IS NULL OR p_customer_id IS NULL OR p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_args');
  END IF;

  SELECT * INTO v_card FROM gift_cards WHERE upper(code) = upper(trim(p_code)) FOR UPDATE;
  IF v_card.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'card_not_found');
  END IF;

  IF v_card.status = 'voided' THEN
    RETURN jsonb_build_object('success', false, 'error', 'card_voided');
  END IF;
  IF v_card.status = 'redeemed' OR v_card.balance <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'card_already_redeemed');
  END IF;
  IF v_card.expires_at < CURRENT_DATE THEN
    UPDATE gift_cards SET status = 'expired' WHERE id = v_card.id;
    RETURN jsonb_build_object('success', false, 'error', 'card_expired');
  END IF;
  IF v_card.balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_balance', 'balance', v_card.balance);
  END IF;

  SELECT phone INTO v_cust_phone FROM customers WHERE id = p_customer_id;
  IF v_card.issued_to_customer_id IS DISTINCT FROM p_customer_id
     AND (v_cust_phone IS NULL OR v_card.issued_to_phone IS DISTINCT FROM v_cust_phone) THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_recipient');
  END IF;

  -- Post ledger row.  Conflict on the partial unique index = no-op
  -- when this card has already been redeemed for the same session.
  INSERT INTO gift_card_redemptions (
    gift_card_id, customer_id, amount, session_id, note, created_by
  ) VALUES (
    v_card.id, p_customer_id, p_amount, p_session_id,
    COALESCE(NULLIF(trim(p_note), ''), 'Redeemed at session'),
    COALESCE(NULLIF(trim(p_created_by), ''), 'coordinator')
  )
  ON CONFLICT ON CONSTRAINT uq_gift_card_redemptions_session DO NOTHING
  RETURNING id INTO v_redemption;

  -- If the conflict swallowed the insert, the card balance must NOT
  -- be debited a second time — bail with idempotent success.
  IF v_redemption IS NULL THEN
    RETURN jsonb_build_object('success', true, 'idempotent', true, 'new_balance', v_card.balance);
  END IF;

  v_new_balance := v_card.balance - p_amount;
  UPDATE gift_cards SET
    balance           = v_new_balance,
    status            = CASE WHEN v_new_balance <= 0 THEN 'redeemed' ELSE status END,
    fully_redeemed_at = CASE WHEN v_new_balance <= 0 THEN now() ELSE fully_redeemed_at END,
    -- Auto-link recipient on first redemption if not already linked.
    issued_to_customer_id = COALESCE(issued_to_customer_id, p_customer_id)
  WHERE id = v_card.id;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'redemption_id', v_redemption
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION redeem_gift_card_partial(text, uuid, numeric, uuid, text, text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 7. void_gift_card() RPC
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION void_gift_card(
  p_card_id uuid, p_by text, p_reason text
) RETURNS jsonb AS $$
DECLARE
  v_card gift_cards%ROWTYPE;
BEGIN
  IF p_card_id IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'missing_args'); END IF;
  SELECT * INTO v_card FROM gift_cards WHERE id = p_card_id;
  IF v_card.id IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'card_not_found'); END IF;
  IF v_card.status = 'voided' THEN RETURN jsonb_build_object('success', true, 'idempotent', true); END IF;

  UPDATE gift_cards SET
    status      = 'voided',
    voided_at   = now(),
    voided_by   = COALESCE(NULLIF(trim(p_by), ''), 'coordinator'),
    void_reason = NULLIF(trim(p_reason), ''),
    balance     = 0
  WHERE id = p_card_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION void_gift_card(uuid, text, text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 8. Auto-link gift cards on customer creation
-- ─────────────────────────────────────────────────────────────────────
-- When a new customer is created (via upsert_customer_from_session or
-- portal sign-up), backfill issued_to_customer_id on any gift cards
-- that were issued to their phone before they existed.

CREATE OR REPLACE FUNCTION link_gift_cards_to_customer()
RETURNS trigger AS $$
BEGIN
  IF NEW.phone IS NULL THEN RETURN NEW; END IF;
  UPDATE gift_cards
     SET issued_to_customer_id = NEW.id
   WHERE issued_to_phone = NEW.phone
     AND issued_to_customer_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_link_gift_cards_to_customer ON customers;
CREATE TRIGGER trg_link_gift_cards_to_customer
  AFTER INSERT ON customers
  FOR EACH ROW EXECUTE FUNCTION link_gift_cards_to_customer();
