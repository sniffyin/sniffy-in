/**
 * admin/todosApi.ts — "My List": the coordinator's personal reminder list.
 *
 * Backed by the `admin_todos` table (migration 20260816120000). Scoped to one
 * `AdminUser.id` — everybody signed into /admin keeps their own list.
 *
 * Shape mirrors expensesApi.ts: plain async functions, no React state, all
 * date maths done in LOCAL time (IST in practice). `due_at` is a real
 * timestamptz, so never build it with toISOString() on a date-only string —
 * that shifts a 6:00 pm reminder into the previous day for IST users. Use
 * combineDateTime() below, which goes through the Date constructor.
 */

import { supabase } from '../../lib/supabase';

// ─── Row shape ────────────────────────────────────────────────

export type TodoRepeat   = 'daily' | 'weekdays' | 'weekly' | 'monthly';
export type TodoPriority = 'low' | 'normal' | 'high';
export type TodoLinkType = 'customer' | 'groomer' | 'session' | 'vendor' | 'other';

export interface AdminTodo {
  id:          string;
  owner_key:   string;
  owner_name:  string | null;

  title:       string;
  notes:       string | null;

  /** ISO timestamptz, or null for a "someday" item with no reminder. */
  due_at:      string | null;
  all_day:     boolean;

  priority:    TodoPriority;
  repeat_rule: TodoRepeat | null;

  link_label:  string | null;
  link_type:   TodoLinkType | null;
  link_id:     string | null;

  is_done:     boolean;
  done_at:     string | null;

  created_at:  string;
  updated_at:  string;
}

/** Everything the editor can set. Ownership + audit columns are added by the API. */
export type TodoInput = Pick<
  AdminTodo,
  'title' | 'notes' | 'due_at' | 'all_day' | 'priority' |
  'repeat_rule' | 'link_label' | 'link_type' | 'link_id'
>;

export function emptyTodoInput(): TodoInput {
  return {
    title: '', notes: null,
    due_at: null, all_day: false,
    priority: 'normal', repeat_rule: null,
    link_label: null, link_type: null, link_id: null,
  };
}

export const REPEAT_OPTIONS: { id: TodoRepeat | ''; label: string }[] = [
  { id: '',         label: "Doesn't repeat" },
  { id: 'daily',    label: 'Every day'      },
  { id: 'weekdays', label: 'Mon–Sat'        },
  { id: 'weekly',   label: 'Every week'     },
  { id: 'monthly',  label: 'Every month'    },
];

// ─── Fetch / mutate ───────────────────────────────────────────

const COLS = '*';

export interface FetchTodosOptions {
  /** Also pull completed items finished on/after this ISO instant. */
  doneSince?: string;
}

/** All open items for the owner + recently completed ones (so the card can
 *  show today's ticked-off work without dragging in months of history). */
export async function fetchTodos(
  ownerKey: string,
  opts: FetchTodosOptions = {},
): Promise<AdminTodo[]> {
  const doneSince = opts.doneSince ?? startOfDay(new Date()).toISOString();

  const [openRes, doneRes] = await Promise.all([
    supabase
      .from('admin_todos').select(COLS)
      .eq('owner_key', ownerKey)
      .eq('is_done', false)
      // NULLs (someday items) sort last — they have no deadline to chase.
      .order('due_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
      .limit(200),

    supabase
      .from('admin_todos').select(COLS)
      .eq('owner_key', ownerKey)
      .eq('is_done', true)
      .gte('done_at', doneSince)
      .order('done_at', { ascending: false })
      .limit(50),
  ]);

  if (openRes.error) throw openRes.error;
  if (doneRes.error) throw doneRes.error;

  return [...(openRes.data ?? []), ...(doneRes.data ?? [])] as AdminTodo[];
}

export async function createTodo(
  input: TodoInput,
  owner: { key: string; name?: string | null },
): Promise<AdminTodo> {
  const { data, error } = await supabase
    .from('admin_todos')
    .insert({ ...normalise(input), owner_key: owner.key, owner_name: owner.name ?? null })
    .select(COLS)
    .single();
  if (error) throw error;
  return data as AdminTodo;
}

export async function updateTodo(id: string, input: TodoInput): Promise<AdminTodo> {
  const { data, error } = await supabase
    .from('admin_todos')
    .update(normalise(input))
    .eq('id', id)
    .select(COLS)
    .single();
  if (error) throw error;
  return data as AdminTodo;
}

export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase.from('admin_todos').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Tick / untick an item.
 *
 * Completing a *repeating* item also spawns the next occurrence, so the
 * finished row stays as history instead of being silently rescheduled. The
 * spawn is deliberately best-effort: if it fails the tick still stands, and
 * the caller just doesn't get a `next` back.
 */
export async function setTodoDone(
  todo: AdminTodo,
  done: boolean,
): Promise<{ updated: AdminTodo; next: AdminTodo | null }> {
  const { data, error } = await supabase
    .from('admin_todos')
    .update({ is_done: done, done_at: done ? new Date().toISOString() : null })
    .eq('id', todo.id)
    .select(COLS)
    .single();
  if (error) throw error;

  const updated = data as AdminTodo;

  let next: AdminTodo | null = null;
  if (done && todo.repeat_rule) {
    const nextDue = nextOccurrence(todo.due_at, todo.repeat_rule);
    if (nextDue) {
      try {
        next = await createTodo(
          {
            title: todo.title,
            notes: todo.notes,
            due_at: nextDue,
            all_day: todo.all_day,
            priority: todo.priority,
            repeat_rule: todo.repeat_rule,
            link_label: todo.link_label,
            link_type: todo.link_type,
            link_id: todo.link_id,
          },
          { key: todo.owner_key, name: todo.owner_name },
        );
      } catch (e) {
        console.warn('[todos] failed to spawn next occurrence', e);
      }
    }
  }

  return { updated, next };
}

/** Trim strings and turn empty ones into NULL so the DB doesn't collect ''. */
function normalise(input: TodoInput): TodoInput {
  const blank = (s: string | null) => {
    const t = (s ?? '').trim();
    return t === '' ? null : t;
  };
  return {
    ...input,
    title:      input.title.trim(),
    notes:      blank(input.notes),
    link_label: blank(input.link_label),
    link_id:    blank(input.link_id),
    // A link_type without a label is meaningless — drop both together.
    link_type:  blank(input.link_label) ? input.link_type : null,
  };
}

// ─── Error text ───────────────────────────────────────────────

/**
 * Turn whatever supabase-js threw into something a coordinator can read.
 *
 * Supabase rejects with a plain `PostgrestError` object, NOT an `Error` — so
 * the usual `e instanceof Error ? e.message : String(e)` falls through to
 * String({}) and renders the useless "[object Object]".
 */
export function todoErrorMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;

  if (e && typeof e === 'object') {
    const err = e as { message?: string; details?: string; hint?: string; code?: string };
    const msg = err.message ?? '';

    // Table missing — the migration hasn't been pushed to this project yet.
    // '42P01' is Postgres; 'PGRST205' is PostgREST's schema-cache miss.
    if (err.code === '42P01' || err.code === 'PGRST205' ||
        (/admin_todos/.test(msg) && /(does not exist|could not find)/i.test(msg))) {
      return 'My List needs its database table. Run `supabase db push` to apply the admin_todos migration.';
    }

    // Write blocked by RLS — almost always a policy that wasn't granted to
    // the `anon` role (see CLAUDE.md → "RLS & the anon-role pattern").
    if (err.code === '42501') {
      return 'Database blocked that write (RLS). The admin_todos policies need to allow the anon role.';
    }

    const parts = [msg, err.details, err.hint].filter(Boolean);
    if (parts.length) return parts.join(' — ');

    try {
      const json = JSON.stringify(e);
      if (json && json !== '{}') return json;
    } catch { /* circular — fall through */ }
  }

  return 'Something went wrong talking to the database.';
}

// ─── Date helpers (all local time) ────────────────────────────

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isoDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function isoTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** `<input type=date>` + `<input type=time>` → ISO timestamptz (local). */
export function combineDateTime(date: string, time: string | null): string | null {
  if (!date) return null;
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return null;
  const [hh, mm] = (time || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0).toISOString();
}

/** Inverse of combineDateTime, for seeding the editor's inputs. */
export function splitDueAt(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  return { date: isoDate(d), time: isoTime(d) };
}

/** Advance a due date by its repeat rule. Always lands strictly in the
 *  future, so ticking a reminder you're three days late on schedules the
 *  *next* one rather than another overdue copy. */
export function nextOccurrence(from: string | null, rule: TodoRepeat): string | null {
  const base = from ? new Date(from) : new Date();
  if (Number.isNaN(base.getTime())) return null;

  const now = new Date();
  const d = new Date(base);
  let guard = 0;

  do {
    switch (rule) {
      case 'daily':    d.setDate(d.getDate() + 1); break;
      case 'weekdays': {
        d.setDate(d.getDate() + 1);
        // Business runs Mon–Sat; skip Sunday.
        if (d.getDay() === 0) d.setDate(d.getDate() + 1);
        break;
      }
      case 'weekly':   d.setDate(d.getDate() + 7); break;
      case 'monthly':  d.setMonth(d.getMonth() + 1); break;
    }
    guard += 1;
  } while (d.getTime() <= now.getTime() && guard < 400);

  return d.toISOString();
}

// ─── Due chips ────────────────────────────────────────────────

export type DueTone = 'late' | 'now' | 'soon' | 'later' | 'someday' | 'done';

export interface DueChip { label: string; tone: DueTone; }

export function formatTime12(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const suffix = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return m === 0 ? `${h} ${suffix}` : `${h}:${String(m).padStart(2, '0')} ${suffix}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** How many whole calendar days from today (negative = past). */
function dayOffset(d: Date, now: Date): number {
  return Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / DAY_MS);
}

/** The right-hand pill: "1h late" / "4:30 pm" / "Sat 6 pm" / "9:12 am". */
export function dueChip(todo: AdminTodo, now: Date = new Date()): DueChip {
  if (todo.is_done) {
    const at = todo.done_at ? new Date(todo.done_at) : null;
    return { label: at ? formatTime12(at) : 'done', tone: 'done' };
  }
  if (!todo.due_at) return { label: 'someday', tone: 'someday' };

  const due  = new Date(todo.due_at);
  const diff = due.getTime() - now.getTime();
  const off  = dayOffset(due, now);

  // Overdue — say how late, that's the number that makes you act.
  if (diff < 0) {
    const late = -diff;
    if (todo.all_day && off === 0) return { label: 'today', tone: 'now' };
    if (late < 60 * 60 * 1000)  return { label: `${Math.max(1, Math.round(late / 60_000))}m late`, tone: 'late' };
    if (late < DAY_MS)          return { label: `${Math.round(late / 3_600_000)}h late`, tone: 'late' };
    return { label: `${Math.round(late / DAY_MS)}d late`, tone: 'late' };
  }

  if (off === 0) {
    if (todo.all_day) return { label: 'today', tone: 'soon' };
    // Inside the next 3 hours it's imminent; later today it's just planned.
    return { label: formatTime12(due), tone: diff <= 3 * 60 * 60 * 1000 ? 'now' : 'soon' };
  }

  const time = todo.all_day ? '' : ` ${formatTime12(due)}`;
  if (off === 1) return { label: `tmrw${time}`, tone: 'later' };
  if (off <= 6)  return { label: `${due.toLocaleDateString('en-IN', { weekday: 'short' })}${time}`, tone: 'later' };
  return {
    label: due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + time,
    tone: 'later',
  };
}

/** Short human label for the repeat rule, used in the row's sub-line. */
export function repeatLabel(todo: AdminTodo): string | null {
  if (!todo.repeat_rule) return null;
  switch (todo.repeat_rule) {
    case 'daily':    return 'repeats daily';
    case 'weekdays': return 'repeats Mon–Sat';
    case 'monthly':  return 'repeats monthly';
    case 'weekly': {
      if (!todo.due_at) return 'repeats weekly';
      const day = new Date(todo.due_at).toLocaleDateString('en-IN', { weekday: 'short' });
      return `repeats ${day}`;
    }
  }
}

/** Overdue or due today (or undated) — what the "Today" filter shows and
 *  what the "N left" counter counts. */
export function isOnDeck(todo: AdminTodo, now: Date = new Date()): boolean {
  if (todo.is_done) return false;
  if (!todo.due_at) return true;
  return dayOffset(new Date(todo.due_at), now) <= 0;
}

// ─── Quick-add parser ─────────────────────────────────────────
//
// Lets the inline "+ Add a reminder…" box do the obvious thing:
//   "Call Mr Ram 4:30pm"          → today 16:30
//   "Collect cash from Hemant 6pm every sat" → Saturday 18:00, weekly
//   "Send Woofly invoice tomorrow"           → tomorrow, all-day
// Anything it can't read stays in the title, so nothing is ever lost —
// worst case you get an undated item and set the time in the editor.

const WEEKDAYS: { names: string[]; index: number }[] = [
  { names: ['sunday', 'sun'],              index: 0 },
  { names: ['monday', 'mon'],              index: 1 },
  { names: ['tuesday', 'tue', 'tues'],     index: 2 },
  { names: ['wednesday', 'wed'],           index: 3 },
  { names: ['thursday', 'thu', 'thurs'],   index: 4 },
  { names: ['friday', 'fri'],              index: 5 },
  { names: ['saturday', 'sat'],            index: 6 },
];

export interface QuickAdd {
  title:       string;
  due_at:      string | null;
  all_day:     boolean;
  repeat_rule: TodoRepeat | null;
}

export function parseQuickAdd(raw: string, now: Date = new Date()): QuickAdd {
  let text = ` ${raw.trim()} `;
  const cut = (re: RegExp): RegExpMatchArray | null => {
    const m = text.match(re);
    if (m) text = text.replace(re, ' ');
    return m;
  };

  // ── Repeat ────────────────────────────────────────────────
  let repeat: TodoRepeat | null = null;
  let weekday: number | null = null;

  const everyDay = cut(/\b(every\s*day|everyday|daily)\b/i);
  if (everyDay) repeat = 'daily';

  if (!repeat && cut(/\b(every\s*weekday|weekdays)\b/i)) repeat = 'weekdays';
  if (!repeat && cut(/\b(every\s*month|monthly)\b/i))    repeat = 'monthly';

  if (!repeat) {
    for (const wd of WEEKDAYS) {
      const m = cut(new RegExp(`\\bevery\\s+(${wd.names.join('|')})\\b`, 'i'));
      if (m) { repeat = 'weekly'; weekday = wd.index; break; }
    }
  }
  if (!repeat && cut(/\b(every\s*week|weekly)\b/i)) repeat = 'weekly';

  // ── Time ──────────────────────────────────────────────────
  let hh: number | null = null;
  let mm = 0;

  // "4:30pm" / "4 pm" / "at 7pm"
  const ampm = cut(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (ampm) {
    hh = Number(ampm[1]) % 12;
    mm = Number(ampm[2] ?? 0);
    if (/pm/i.test(ampm[3])) hh += 12;
  } else {
    // "17:30" — 24h only, so a price like ₹8,750 can never be read as a time.
    const h24 = cut(/\b(?:at\s+)?([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (h24) { hh = Number(h24[1]); mm = Number(h24[2]); }
  }

  // ── Day ───────────────────────────────────────────────────
  const base = startOfDay(now);
  let target: Date | null = null;

  if (cut(/\b(today|tonight)\b/i)) {
    target = new Date(base);
  } else if (cut(/\b(tomorrow|tmrw|tmr)\b/i)) {
    target = new Date(base); target.setDate(target.getDate() + 1);
  } else {
    const inDays = cut(/\bin\s+(\d{1,2})\s*(day|days)\b/i);
    if (inDays) {
      target = new Date(base); target.setDate(target.getDate() + Number(inDays[1]));
    } else if (cut(/\bnext\s+week\b/i)) {
      target = new Date(base); target.setDate(target.getDate() + 7);
    } else {
      for (const wd of WEEKDAYS) {
        if (cut(new RegExp(`\\b(?:on\\s+|next\\s+)?(${wd.names.join('|')})\\b`, 'i'))) {
          target = nextWeekday(base, wd.index);
          break;
        }
      }
    }
  }

  // "every sat" with no explicit day → first Saturday from today.
  if (!target && weekday !== null) target = nextWeekday(base, weekday);

  // A bare time with no day means the next time that clock reading happens.
  if (!target && hh !== null) {
    target = new Date(base);
    const todayAt = new Date(base); todayAt.setHours(hh, mm, 0, 0);
    if (todayAt.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  }

  let due_at: string | null = null;
  if (target) {
    if (hh !== null) target.setHours(hh, mm, 0, 0);
    due_at = target.toISOString();
  }

  const title = text
    .replace(/\s+/g, ' ')
    .replace(/[\s,;·-]+$/, '')
    .replace(/^[\s,;·-]+/, '')
    .trim();

  return {
    // Never hand back an empty title — if the user typed only "tomorrow 6pm",
    // keep their raw text and let them rename it.
    title: title || raw.trim(),
    due_at,
    all_day: hh === null,
    repeat_rule: repeat,
  };
}

function nextWeekday(from: Date, index: number): Date {
  const d = new Date(from);
  const delta = (index - d.getDay() + 7) % 7;
  // Same weekday as today → this week's, not next week's; the caller's time
  // check bumps it forward if that moment has already passed.
  d.setDate(d.getDate() + delta);
  return d;
}
