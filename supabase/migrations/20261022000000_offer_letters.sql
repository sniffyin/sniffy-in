/*
  # Offer letters on the sign-link flow

  Reuses policy_acknowledgments (token link → read → draw signature → PDF in
  the policy-signatures bucket) for groomer offer letters instead of adding a
  parallel table.

    kind        'policy' (existing rows) | 'offer_letter'
    offer_data  letter fields for kind = 'offer_letter':
                { letter_date, effective_date, preamble: [...] }
                The letter body itself is the usual policy_sections snapshot.

  Existing RLS (anon read/insert/update) and the `status = 'pending'` one-time
  signing guard apply unchanged.
*/

ALTER TABLE policy_acknowledgments
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'policy';

ALTER TABLE policy_acknowledgments
  DROP CONSTRAINT IF EXISTS policy_acknowledgments_kind_check;
ALTER TABLE policy_acknowledgments
  ADD CONSTRAINT policy_acknowledgments_kind_check
  CHECK (kind IN ('policy', 'offer_letter'));

ALTER TABLE policy_acknowledgments
  ADD COLUMN IF NOT EXISTS offer_data jsonb;
