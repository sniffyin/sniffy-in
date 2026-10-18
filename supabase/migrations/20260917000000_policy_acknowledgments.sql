/*
  # Role Policy Acknowledgments — "read, sign, PDF" per role

  ## What this adds
    1. role_policies            — master content per role (groomer / coordinator /
                                   founder): title, intro, and heading+bullet sections.
                                   Admin-editable from the Policies tab.
    2. policy_acknowledgments   — one row per admin-generated sign-link. The
                                   `policy_title`/`policy_sections` columns are a
                                   SNAPSHOT of role_policies at link-creation time,
                                   so editing the master text later never rewrites
                                   what a specific person already read and signed.
    3. Storage bucket `policy-signatures` (public-read) for the generated PDFs.
    4. RLS — enabled, permissive to `anon` (see CLAUDE.md → "RLS & the anon-role
       pattern"): the /admin surface and the public /policy-sign/:token page both
       run with no Supabase Auth session, so every call is the anon role.

  ## Link/token model
  `token` is a random opaque string embedded in the public URL
  (/policy-sign/:token) — it IS the auth mechanism, like a magic link. Once a
  row's status flips to 'signed', `markAcknowledgmentSigned()` (policyTypes.ts)
  guards its UPDATE with `.eq('status','pending')`, so a link can only ever be
  signed once; reopening it after that shows a read-only "already signed" view.
*/

CREATE TABLE IF NOT EXISTS role_policies (
  role        text PRIMARY KEY CHECK (role IN ('groomer', 'coordinator', 'founder')),
  title       text NOT NULL,
  intro       text,
  -- [{ "heading": "...", "items": ["...", "..."] }, ...]
  sections    jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  text
);

CREATE OR REPLACE FUNCTION role_policies_touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_role_policies_touch_updated_at ON role_policies;
CREATE TRIGGER trg_role_policies_touch_updated_at
  BEFORE UPDATE ON role_policies
  FOR EACH ROW
  EXECUTE FUNCTION role_policies_touch_updated_at();

CREATE TABLE IF NOT EXISTS policy_acknowledgments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  role            text NOT NULL CHECK (role IN ('groomer', 'coordinator', 'founder')),
  signer_name     text NOT NULL,
  -- Set only when the admin picked an existing roster row for a groomer link.
  -- Coordinator/founder links (not DB-backed roles) leave this null.
  groomer_id      uuid,

  token           text NOT NULL UNIQUE,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed')),

  -- Snapshot of role_policies at the moment this link was generated.
  policy_title    text NOT NULL,
  policy_sections jsonb NOT NULL,

  pdf_path        text,
  signed_at       timestamptz,

  created_by      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS policy_acknowledgments_token_idx
  ON policy_acknowledgments (token);

CREATE INDEX IF NOT EXISTS policy_acknowledgments_role_created_idx
  ON policy_acknowledgments (role, created_at DESC);

-- ─────────── RLS: role_policies ───────────
ALTER TABLE role_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read role_policies" ON role_policies;
CREATE POLICY "Anyone can read role_policies"
  ON role_policies FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert role_policies" ON role_policies;
CREATE POLICY "Anyone can insert role_policies"
  ON role_policies FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update role_policies" ON role_policies;
CREATE POLICY "Anyone can update role_policies"
  ON role_policies FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────── RLS: policy_acknowledgments ───────────
ALTER TABLE policy_acknowledgments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read policy_acknowledgments" ON policy_acknowledgments;
CREATE POLICY "Anyone can read policy_acknowledgments"
  ON policy_acknowledgments FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert policy_acknowledgments" ON policy_acknowledgments;
CREATE POLICY "Anyone can insert policy_acknowledgments"
  ON policy_acknowledgments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update policy_acknowledgments" ON policy_acknowledgments;
CREATE POLICY "Anyone can update policy_acknowledgments"
  ON policy_acknowledgments FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────── Storage: policy-signatures bucket ───────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('policy-signatures', 'policy-signatures', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can read policy-signatures" ON storage.objects;
CREATE POLICY "Anyone can read policy-signatures"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'policy-signatures');

DROP POLICY IF EXISTS "Anyone can upload policy-signatures" ON storage.objects;
CREATE POLICY "Anyone can upload policy-signatures"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'policy-signatures');

DROP POLICY IF EXISTS "Anyone can overwrite policy-signatures" ON storage.objects;
CREATE POLICY "Anyone can overwrite policy-signatures"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'policy-signatures')
  WITH CHECK (bucket_id = 'policy-signatures');

-- ─────────── Seed default content (editable later from the admin UI) ───────────

INSERT INTO role_policies (role, title, intro, sections)
VALUES (
  'groomer',
  'Groomer — Role Responsibilities & Work Ethics',
  'As a Sniffy groomer, you represent Sniffy in every customer''s home. Please read the responsibilities below carefully before signing.',
  $json$[
    { "heading": "Your Role", "items": [
      "Travel to the customer''s home and complete the booked grooming service in a single visit.",
      "Carry your own grooming kit and keep it clean, sanitized, and in good working condition.",
      "Confirm pet details (breed, temperament, any medical notes) with the coordinator before you leave for the appointment.",
      "Handle every pet gently — never restrain, muzzle, or discipline an animal roughly."
    ]},
    { "heading": "Punctuality & Arrival", "items": [
      "Arrive within the scheduled window. On-time arrival is tracked in the app — mark it honestly.",
      "If you are running late, inform the coordinator immediately so the customer can be updated."
    ]},
    { "heading": "During the Service", "items": [
      "Follow the full service checklist for the package booked — no skipped or shortened steps.",
      "Use only approved products; flag any allergy or skin concern to the coordinator before proceeding.",
      "Take before/after photos as required for completion proof."
    ]},
    { "heading": "Payments & Honesty", "items": [
      "Collect payment only as instructed for that session — never negotiate a side price with the customer.",
      "Mark a session complete only once the service is genuinely finished — never mark complete in advance.",
      "Report the exact amount collected. Any discrepancy is treated seriously."
    ]},
    { "heading": "Conduct", "items": [
      "No smoking, alcohol, or inappropriate behavior while on duty or inside a customer''s home.",
      "Respect the customer''s property, privacy, and family members at all times.",
      "Wear your Sniffy uniform/ID so customers can identify you.",
      "Report any complaint, damage, or incident to the coordinator the same day."
    ]},
    { "heading": "Reviews & Incentives", "items": [
      "You may ask the customer for a review once the service is genuinely complete — never pressure or mislead a customer for a rating.",
      "On-time arrival and verified 5-star reviews earn incentive bonuses; false claims will be rejected and may affect your standing with Sniffy."
    ]}
  ]$json$::jsonb
)
ON CONFLICT (role) DO NOTHING;

INSERT INTO role_policies (role, title, intro, sections)
VALUES (
  'coordinator',
  'Coordinator — Role Responsibilities & Work Ethics',
  'As a Sniffy coordinator, the accuracy and fairness of the day-to-day operation runs through you. Please read the responsibilities below carefully before signing.',
  $json$[
    { "heading": "Your Role", "items": [
      "Own the day-to-day scheduling, groomer assignment, and status tracking of every session from booking to payment settlement.",
      "Match the right groomer to each booking based on location, availability, and skill.",
      "Keep every session''s status accurate and up to date as work actually progresses."
    ]},
    { "heading": "Customer Communication", "items": [
      "Respond to customer queries, reschedules, and complaints promptly and politely.",
      "Never promise a customer something you can''t confirm against a groomer''s real availability.",
      "Escalate any unresolved complaint to the founder the same day."
    ]},
    { "heading": "Data & Financial Accuracy", "items": [
      "Enter session, payment, and vendor data accurately and the same day it happens — the whole business runs on this ledger.",
      "Reconcile vendor-sourced sessions honestly against the agreed commission terms.",
      "Never alter a payment or status record to cover up a mistake — flag it and correct it transparently."
    ]},
    { "heading": "People Management", "items": [
      "Assign work fairly across groomers — no favoritism.",
      "Approve arrival/review incentive claims only when the underlying proof genuinely supports them.",
      "Treat every groomer with respect — they are customer-facing representatives of Sniffy."
    ]},
    { "heading": "Confidentiality", "items": [
      "Customer phone numbers, addresses, and payment details are confidential — never share them outside authorized Sniffy systems.",
      "Keep your admin dashboard login private; don''t share your password."
    ]},
    { "heading": "Standard Operating Procedure", "items": [
      "Follow the documented SOPs for onboarding, scheduling, payroll, and outreach.",
      "Discuss any deviation from SOP with the founder first rather than improvising silently."
    ]}
  ]$json$::jsonb
)
ON CONFLICT (role) DO NOTHING;

INSERT INTO role_policies (role, title, intro, sections)
VALUES (
  'founder',
  'Founder — Role Responsibilities & Work Ethics',
  'This document records the standard Sniffy holds its founder to — the same honesty, fairness, and accountability expected of every groomer and coordinator. Please read carefully before signing.',
  $json$[
    { "heading": "Your Role", "items": [
      "Set the direction, standards, and culture every groomer and coordinator is expected to follow.",
      "Make final decisions on pricing, vendor partnerships, hiring, and major operational changes.",
      "Be the point of final escalation for anything the coordinator can''t resolve."
    ]},
    { "heading": "Financial Integrity", "items": [
      "Handle company funds, payroll, and vendor settlements transparently and on schedule.",
      "Keep business and personal finances separate.",
      "Ensure every team member is paid correctly and on time for the work they''ve done."
    ]},
    { "heading": "Fair Treatment", "items": [
      "Apply the same rules, incentives, and consequences to every groomer and coordinator, without favoritism.",
      "Provide a safe, respectful, harassment-free environment for the whole team.",
      "Listen to and act on genuine grievances raised by staff."
    ]},
    { "heading": "Confidentiality & Compliance", "items": [
      "Protect customer data and comply with applicable data-protection and labor regulations.",
      "Keep competitively sensitive information — vendor terms, pricing strategy — confidential."
    ]},
    { "heading": "Accountability", "items": [
      "Hold yourself to the same standards of honesty and punctuality expected of the team.",
      "Disclose any conflict of interest that could affect a business decision.",
      "Take responsibility for company-level mistakes rather than deflecting them onto staff."
    ]}
  ]$json$::jsonb
)
ON CONFLICT (role) DO NOTHING;
