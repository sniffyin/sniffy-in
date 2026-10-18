-- ─────────────────────────────────────────────────────────────────────────────
-- session_messages — Zomato-style live chat per grooming session
--
-- Three sender types:
--   groomer     — the assigned groomer sending status updates / free text
--   customer    — the pet owner replying via their portal
--   coordinator — admin/coordinator injecting a note or instruction
--
-- msg_type:
--   text         — normal free-text message
--   status_event — auto-posted system event (e.g. "Groomer arrived")
--
-- Realtime is enabled on this table so all three portals receive messages
-- instantly via supabase.channel() subscriptions.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.session_messages (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.grooming_sessions(id) on delete cascade,
  sender_type   text not null check (sender_type in ('groomer', 'customer', 'coordinator')),
  sender_id     text not null,        -- groomer.id | customer.id | admin username
  sender_name   text not null,
  body          text not null check (char_length(body) > 0),
  msg_type      text not null default 'text' check (msg_type in ('text', 'status_event')),
  created_at    timestamptz not null default now()
);

-- Index for the most common query: fetch all messages for a session ordered by time
create index if not exists session_messages_session_id_idx
  on public.session_messages (session_id, created_at asc);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.session_messages enable row level security;

-- App uses anon key throughout (groomer portal, customer portal, admin).
-- All three portals can read any message row — the session_id filter in
-- the query is the access gate (same pattern as session_change_requests).
create policy "anon can read session_messages"
  on public.session_messages
  for select
  to anon, authenticated
  using (true);

create policy "anon can insert session_messages"
  on public.session_messages
  for insert
  to anon, authenticated
  with check (true);

-- No update / delete — messages are append-only (chat history is sacred).

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- Enable Realtime replication on this table so supabase.channel() INSERT
-- events fire on all three portals without polling.
alter publication supabase_realtime add table public.session_messages;
