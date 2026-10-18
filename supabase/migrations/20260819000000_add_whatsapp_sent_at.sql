-- ─────────────────────────────────────────────────────────────────────
-- Track "WhatsApp message sent" per session (green → grey button)
-- ─────────────────────────────────────────────────────────────────────
-- Context:
--   The WhatsApp button on session cards (SessionsTab.tsx, buildWhatsAppURL)
--   is a plain wa.me link — it opens a pre-filled compose window but
--   WhatsApp gives us no delivery/read callback.  This column is a
--   "coordinator clicked send" marker, not a delivery receipt:
--   null = not yet clicked (button shows green), set = clicked at least
--   once (button shows grey).  One-way — there is no UI to clear it.
--
-- RLS: no new policy needed.  grooming_sessions already has a permissive
--   anon write policy (admin/coordinator surfaces run as the anon role,
--   app-level auth only, not Supabase Auth) — status/groomer fields are
--   already written the same way, so this column works without change.

ALTER TABLE grooming_sessions
  ADD COLUMN IF NOT EXISTS whatsapp_sent_at timestamptz;
