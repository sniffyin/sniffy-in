/*
  # My List — personal to-do / reminder list for the coordinator dashboard.

  ## What this adds
    1. New table  : admin_todos
    2. Indexes    : (owner_key, is_done, due_at) for the card's queries,
                    (is_done, due_at) for the notification-bell sweep
    3. Trigger    : touch updated_at
    4. RLS        : enabled, permissive to `anon` — the /admin surface has
                    NO Supabase Auth session, so every call from it runs as
                    the anon role (see CLAUDE.md → "RLS & the anon-role
                    pattern").  Forgetting `TO anon` here would make every
                    write fail with 42501.

  ## Ownership model
  `owner_key` is the app-level `AdminUser.id` from src/pages/admin/authStore.ts
  ('u1' = Jitendra, 'u3' = Nikita, …) — NOT a Postgres/Supabase user. The list
  is deliberately private-by-convention: the front-end filters on owner_key so
  each coordinator sees only their own reminders. RLS stays permissive because
  there is no JWT to scope on; tighten this when Supabase Auth reaches /admin.

  ## Repeats
  Repeats are materialised, not computed: ticking a repeating item marks THAT
  row done and inserts a fresh row with `due_at` advanced by the rule (see
  todosApi.setTodoDone). That keeps a real completion history and means a
  missed week doesn't silently vanish from the ledger.
*/

CREATE TABLE IF NOT EXISTS admin_todos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ── Whose list ─────────────────────────────────────────────
  owner_key    text NOT NULL,              -- AdminUser.id, e.g. 'u1'
  owner_name   text,                       -- denormalised for readability in SQL

  -- ── The reminder ───────────────────────────────────────────
  title        text NOT NULL,
  notes        text,

  -- NULL due_at = "someday", no reminder pressure. `all_day` marks a
  -- date-only item so the UI shows "Today" instead of a bogus 12:00 am.
  due_at       timestamptz,
  all_day      boolean NOT NULL DEFAULT false,

  priority     text NOT NULL DEFAULT 'normal'
               CHECK (priority IN ('low', 'normal', 'high')),

  repeat_rule  text
               CHECK (repeat_rule IN ('daily', 'weekdays', 'weekly', 'monthly')),

  -- ── Optional link to someone in the business ───────────────
  -- Free text by design: the coordinator types "Hemant" or "Yashika Rani"
  -- without having to find the row first. link_type/link_id are here so a
  -- future picker can bind a reminder to a real customer/groomer/session.
  link_label   text,
  link_type    text
               CHECK (link_type IN ('customer', 'groomer', 'session', 'vendor', 'other')),
  link_id      text,

  -- ── Completion ─────────────────────────────────────────────
  is_done      boolean NOT NULL DEFAULT false,
  done_at      timestamptz,

  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- The card's own query: one owner, open items, soonest first.
CREATE INDEX IF NOT EXISTS admin_todos_owner_idx
  ON admin_todos (owner_key, is_done, due_at);

-- The notification-bell sweep: everything due, any owner.
CREATE INDEX IF NOT EXISTS admin_todos_due_idx
  ON admin_todos (is_done, due_at);

CREATE OR REPLACE FUNCTION admin_todos_touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_admin_todos_touch_updated_at ON admin_todos;
CREATE TRIGGER trg_admin_todos_touch_updated_at
  BEFORE UPDATE ON admin_todos
  FOR EACH ROW
  EXECUTE FUNCTION admin_todos_touch_updated_at();

-- ─────────── RLS ───────────
ALTER TABLE admin_todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read admin_todos" ON admin_todos;
CREATE POLICY "Anyone can read admin_todos"
  ON admin_todos FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert admin_todos" ON admin_todos;
CREATE POLICY "Anyone can insert admin_todos"
  ON admin_todos FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update admin_todos" ON admin_todos;
CREATE POLICY "Anyone can update admin_todos"
  ON admin_todos FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete admin_todos" ON admin_todos;
CREATE POLICY "Anyone can delete admin_todos"
  ON admin_todos FOR DELETE
  TO anon, authenticated
  USING (true);
