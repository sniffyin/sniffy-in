/**
 * admin/TodoListCard.tsx — "My List": a personal reminder list on the
 * Overview tab, directly under the KPI tiles.
 *
 * Not an operational queue (that's Follow-ups / Sessions) — this is the
 * coordinator's own scratch list: call this person, collect that cash, send
 * the invoice. Each item is private to the signed-in AdminUser (`owner_key`).
 *
 * Behaviour worth knowing:
 *  • The inline box parses what you type — "Collect cash from Hemant 6pm
 *    every sat" lands as a Saturday 6:00 pm weekly reminder (todosApi
 *    .parseQuickAdd). Anything unparsed stays in the title, so nothing is lost.
 *  • Ticking a repeating item marks it done AND spawns the next occurrence.
 *  • Due chips re-render on a 30s tick, so "4:30 pm" becomes "1h late" without
 *    a reload.
 *  • Overdue items also surface in the notification bell (lib/notifications.ts).
 *  • Viewers get a read-only list — same gate as the rest of /admin (canWrite).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Plus, X, Trash2, Loader2, ListChecks, Sparkles,
  CalendarClock, Repeat, Link2, AlertCircle,
} from 'lucide-react';
import {
  AdminTodo, TodoInput, TodoLinkType, TodoRepeat, DueTone,
  REPEAT_OPTIONS, emptyTodoInput,
  fetchTodos, createTodo, updateTodo, deleteTodo, setTodoDone,
  dueChip, repeatLabel, isOnDeck, parseQuickAdd, todoErrorMessage,
  combineDateTime, splitDueAt, isoDate,
} from './todosApi';
import { canWrite, type AdminUser } from './authStore';
import { useModalTakesOverStatusBar } from '../../components/PWAInstallGate';

// ─── Chip styling ─────────────────────────────────────────────

const CHIP_STYLES: Record<DueTone, string> = {
  // Stronger than the others: it sits on a red-tinted row and still has to read.
  late:    'bg-red-100 text-red-700',
  now:     'bg-amber-50 text-amber-700',
  soon:    'bg-indigo-50 text-indigo-600',
  later:   'bg-gray-100 text-gray-500',
  someday: 'bg-gray-50 text-gray-400',
  done:    'bg-gray-100 text-gray-400',
};

const LINK_TYPE_OPTIONS: { id: TodoLinkType | ''; label: string }[] = [
  { id: '',         label: 'Not linked' },
  { id: 'customer', label: 'Customer'   },
  { id: 'groomer',  label: 'Groomer'    },
  { id: 'session',  label: 'Session'    },
  { id: 'vendor',   label: 'Vendor'     },
  { id: 'other',    label: 'Other'      },
];

type FilterId = 'open' | 'today' | 'done';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'open',  label: 'All'   },
  { id: 'today', label: 'Today' },
  { id: 'done',  label: 'Done'  },
];

// ─── Card ─────────────────────────────────────────────────────

export default function TodoListCard({ user }: { user?: AdminUser }) {
  const ownerKey = user?.id ?? '';
  const editable = !!user && canWrite(user);

  const [todos,   setTodos]   = useState<AdminTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [filter,  setFilter]  = useState<FilterId>('open');
  const [quick,   setQuick]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const [busyIds, setBusyIds] = useState<string[]>([]);

  /** null = closed, {} = new item, AdminTodo = editing that row. */
  const [editorRow, setEditorRow] = useState<AdminTodo | 'new' | null>(null);

  // Re-render the chips every 30s so "4:30 pm" flips to "1h late" on its own.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    if (!ownerKey) { setLoading(false); return; }
    try {
      setError(null);
      setTodos(await fetchTodos(ownerKey));
    } catch (e) {
      // Most likely cause in a fresh project: the admin_todos migration
      // hasn't been pushed yet. Say so rather than showing a blank card.
      setError(todoErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [ownerKey]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  // Cheap freshness: another device (or the notification bell's deep link)
  // may have changed the list while this tab was in the background.
  useEffect(() => {
    function onFocus() { load(); }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [load]);

  // ── Derived lists ───────────────────────────────────────────

  const { open, doneToday } = useMemo(() => {
    const open      = todos.filter(t => !t.is_done);
    const doneToday = todos.filter(t => t.is_done);
    // Soonest first; undated ("someday") items sink to the bottom.
    open.sort((a, b) => {
      if (!a.due_at && !b.due_at) return a.created_at.localeCompare(b.created_at);
      if (!a.due_at) return 1;
      if (!b.due_at) return -1;
      return a.due_at.localeCompare(b.due_at);
    });
    doneToday.sort((a, b) => (b.done_at ?? '').localeCompare(a.done_at ?? ''));
    return { open, doneToday };
  }, [todos]);

  const visible = useMemo(() => {
    switch (filter) {
      case 'today': return open.filter(t => isOnDeck(t, now));
      case 'done':  return doneToday;
      // "All" keeps today's ticked-off items at the bottom — seeing what you
      // already cleared is half the point of a list like this.
      case 'open':  return [...open, ...doneToday.slice(0, 4)];
    }
  }, [filter, open, doneToday, now]);

  const leftCount = filter === 'done'
    ? doneToday.length
    : visible.filter(t => !t.is_done).length;

  const overdueCount = open.filter(t => t.due_at && new Date(t.due_at) < now).length;

  // Today's plate: what you've ticked off vs everything on deck (overdue,
  // due today, or undated). Drives the progress bar.
  const dayDone  = doneToday.length;
  const dayTotal = dayDone + open.filter(t => isOnDeck(t, now)).length;

  // ── Mutations (optimistic) ──────────────────────────────────

  const markBusy = (id: string, on: boolean) =>
    setBusyIds(prev => (on ? [...prev, id] : prev.filter(x => x !== id)));

  async function toggle(todo: AdminTodo) {
    if (!editable || busyIds.includes(todo.id)) return;
    const next = !todo.is_done;
    markBusy(todo.id, true);
    // Optimistic flip so the checkbox never feels laggy.
    setTodos(prev => prev.map(t => (t.id === todo.id
      ? { ...t, is_done: next, done_at: next ? new Date().toISOString() : null }
      : t)));
    try {
      const res = await setTodoDone(todo, next);
      setTodos(prev => {
        const patched = prev.map(t => (t.id === todo.id ? res.updated : t));
        return res.next ? [...patched, res.next] : patched;
      });
    } catch (e) {
      setTodos(prev => prev.map(t => (t.id === todo.id ? todo : t)));   // roll back
      setError(todoErrorMessage(e));
    } finally {
      markBusy(todo.id, false);
    }
  }

  async function submitQuick() {
    const raw = quick.trim();
    if (!raw || !editable || saving) return;
    const parsed = parseQuickAdd(raw);
    setSaving(true);
    try {
      const row = await createTodo(
        { ...emptyTodoInput(), title: parsed.title, due_at: parsed.due_at,
          all_day: parsed.all_day, repeat_rule: parsed.repeat_rule },
        { key: ownerKey, name: user?.name },
      );
      setTodos(prev => [...prev, row]);
      setQuick('');
      // A quick-add is nearly always for now/today — make sure it's visible.
      if (filter === 'done') setFilter('open');
    } catch (e) {
      setError(todoErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  function onEditorSaved(row: AdminTodo, mode: 'created' | 'updated' | 'deleted') {
    setTodos(prev => {
      if (mode === 'deleted') return prev.filter(t => t.id !== row.id);
      if (mode === 'created') return [...prev, row];
      return prev.map(t => (t.id === row.id ? row : t));
    });
    setEditorRow(null);
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
    >
      {/* Ambient purple wash in the top-right corner — the same trick the
          leads strip and the KPI tiles use, so this card reads as part of
          the family instead of a plain white box dropped in the middle. */}
      <div
        aria-hidden
        className="absolute -top-10 -right-8 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, rgba(124,58,237,0) 70%)' }}
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="relative flex items-center gap-2.5 px-4 pt-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
            boxShadow: '0 4px 12px rgba(124,58,237,0.30)',
          }}
        >
          <ListChecks size={17} className="text-white" strokeWidth={2.4}/>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-gray-900 leading-tight">My List</p>
          <p className="text-[10.5px] font-semibold text-gray-400 leading-tight mt-0.5">
            {loading
              ? 'loading…'
              : filter === 'done'
                ? `${leftCount} ticked off today`
                : (
                  <>
                    {leftCount} left
                    {overdueCount > 0 && (
                      <span className="text-red-500"> · {overdueCount} late</span>
                    )}
                  </>
                )}
          </p>
        </div>

        {editable && (
          <button
            onClick={() => setEditorRow('new')}
            className="flex items-center gap-1 text-[11px] font-bold text-white px-3 py-1.5 rounded-full shrink-0 active:scale-95 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #451a8b 100%)',
              boxShadow: '0 4px 12px rgba(69,26,139,0.28)',
            }}
          >
            <Plus size={12} strokeWidth={3}/> Add
          </button>
        )}
      </div>

      {/* ── Progress — "3 of 5 done today". A list you can't see progress
          on is just a wall of chores. Hidden when there's nothing on
          today's plate at all. ────────────────────────────── */}
      {!loading && dayTotal > 0 && (
        <div className="relative px-4 mt-3">
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((dayDone / dayTotal) * 100)}%` }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[9.5px] font-semibold text-gray-400 mt-1.5">
            {dayDone === dayTotal
              ? 'All done for today 🎉'
              : `${dayDone} of ${dayTotal} done today`}
          </p>
        </div>
      )}

      {/* ── Filters — segmented control rather than three loose pills. */}
      <div className="relative flex items-center px-4 mt-3">
        <div className="inline-flex items-center gap-0.5 bg-gray-50 rounded-full p-0.5">
          {FILTERS.map(f => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`relative text-[10.5px] font-bold px-3 py-1 rounded-full transition-colors ${
                  active ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="todo-filter-pill"
                    className="absolute inset-0 rounded-full bg-sniffy-purple"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Error strip (usually: migration not pushed) ─────── */}
      {error && (
        <div className="relative mx-4 mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2">
          <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0"/>
          <p className="text-[10.5px] text-red-600 leading-snug break-words">{error}</p>
        </div>
      )}

      {/* ── Rows — soft cards, not table lines. ─────────────── */}
      <div className="relative px-2 mt-2">
        {loading ? (
          <div className="px-2 py-4 space-y-3 animate-pulse">
            {[0, 1, 2].map(i => <div key={i} className="h-4 bg-gray-100 rounded-full" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="px-4 py-6 flex flex-col items-center text-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Sparkles size={17} className="text-sniffy-purple"/>
            </div>
            <p className="text-[12px] font-bold text-gray-700">
              {filter === 'done' ? 'Nothing ticked off yet today' : 'Your list is clear'}
            </p>
            <p className="text-[10.5px] text-gray-400 max-w-[250px] leading-snug">
              {filter === 'done'
                ? 'Completed reminders from today show up here.'
                : 'Jot down a call to make or cash to collect — add a time and it will chase you.'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            <AnimatePresence initial={false}>
              {visible.map(todo => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  now={now}
                  busy={busyIds.includes(todo.id)}
                  editable={editable}
                  onToggle={() => toggle(todo)}
                  onOpen={() => editable && setEditorRow(todo)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Inline quick add ───────────────────────────────── */}
      {editable && (
        <div className="relative p-3 pt-2">
          <div className="flex items-center gap-2.5 rounded-xl bg-gray-50 border border-transparent px-3 py-2.5 transition-colors focus-within:bg-white focus-within:border-purple-200 focus-within:ring-2 focus-within:ring-purple-50">
            <div className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
              <Plus size={12} className="text-sniffy-purple" strokeWidth={3}/>
            </div>
            <input
              value={quick}
              onChange={e => setQuick(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitQuick(); } }}
              placeholder="Add a reminder — try “Call 4:30pm”"
              className="flex-1 min-w-0 bg-transparent text-[12.5px] font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal outline-none"
            />
            {quick.trim() && (
              <button
                onClick={submitQuick}
                disabled={saving}
                className="text-[11px] font-bold text-white bg-sniffy-purple px-3 py-1 rounded-full disabled:opacity-60 shrink-0 active:scale-95 transition-transform"
              >
                {saving ? <Loader2 size={11} className="animate-spin"/> : 'Save'}
              </button>
            )}
          </div>
          {quick.trim() && (
            <QuickAddHint text={quick} />
          )}
        </div>
      )}

      {/* ── Editor ─────────────────────────────────────────── */}
      <TodoEditor
        open={editorRow !== null}
        todo={editorRow === 'new' ? null : editorRow}
        owner={{ key: ownerKey, name: user?.name }}
        onClose={() => setEditorRow(null)}
        onSaved={onEditorSaved}
      />
    </motion.section>
  );
}

// ─── One row ──────────────────────────────────────────────────

function TodoRow({
  todo, now, busy, editable, onToggle, onOpen,
}: {
  todo: AdminTodo;
  now: Date;
  busy: boolean;
  editable: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const chip   = dueChip(todo, now);
  const repeat = repeatLabel(todo);
  const done   = todo.is_done;

  // Sub-line: "linked to Hemant · repeats Sat · <note>" — only the parts
  // that exist, joined by dots.
  const sub: React.ReactNode[] = [];
  if (todo.link_label) {
    sub.push(<>linked to <span className="text-sniffy-purple font-bold">{todo.link_label}</span></>);
  }
  if (repeat)     sub.push(repeat);
  if (todo.notes) sub.push(todo.notes);

  const late = chip.tone === 'late';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18 }}
      className={`relative flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition-colors ${
        late ? 'bg-red-50/60' : 'hover:bg-gray-50'
      } ${done ? 'opacity-60' : ''}`}
    >
      {/* Overdue accent — a quiet red spine, not a shouty banner. */}
      {late && (
        <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-red-400"/>
      )}

      {/* Checkbox */}
      <button
        onClick={onToggle}
        disabled={!editable || busy}
        aria-label={done ? `Mark "${todo.title}" as not done` : `Mark "${todo.title}" as done`}
        aria-pressed={done}
        className={`mt-[1px] w-[18px] h-[18px] rounded-[6px] border-2 flex items-center justify-center shrink-0 transition-all active:scale-90 ${
          done
            ? 'bg-sniffy-purple border-sniffy-purple'
            : late
              ? 'border-red-300 hover:border-red-500'
              : 'border-gray-300 hover:border-sniffy-purple'
        } ${editable ? '' : 'opacity-50 cursor-default'}`}
      >
        {busy
          ? <Loader2 size={11} className={done ? 'text-white animate-spin' : 'text-gray-400 animate-spin'}/>
          : done && <Check size={12} className="text-white" strokeWidth={3.5}/>}
      </button>

      {/* Title + sub-line */}
      <button
        onClick={onOpen}
        disabled={!editable}
        className="flex-1 min-w-0 text-left"
      >
        {/* leading-5 fixes the first line at exactly 20px so the checkbox
            (18px + 1px offset) and the due chip (h-5) sit on the same optical
            line — top-aligning three differently-sized boxes staggers them. */}
        <p className={`text-[13px] font-bold leading-5 break-words ${
          done ? 'text-gray-400 line-through' : 'text-gray-900'
        }`}>
          {todo.title}
        </p>
        {sub.length > 0 && (
          <p className="text-[10.5px] text-gray-400 mt-0.5 leading-snug break-words">
            {sub.map((part, i) => (
              <span key={i}>
                {i > 0 && ' · '}
                {part}
              </span>
            ))}
          </p>
        )}
      </button>

      {/* Due chip */}
      <span className={`shrink-0 h-5 inline-flex items-center px-2 rounded-full text-[10.5px] font-bold leading-none whitespace-nowrap ${CHIP_STYLES[chip.tone]}`}>
        {chip.label}
      </span>
    </motion.div>
  );
}

// ─── Quick-add preview ────────────────────────────────────────
//
// Shows what the parser understood *before* you hit enter, so the magic is
// never a surprise ("oh, it did read 6pm as tonight").

function QuickAddHint({ text }: { text: string }) {
  const parsed = useMemo(() => parseQuickAdd(text), [text]);
  if (!parsed.due_at && !parsed.repeat_rule) return null;

  const due = parsed.due_at ? new Date(parsed.due_at) : null;
  const when = due
    ? due.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) +
      (parsed.all_day ? '' : `, ${due.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`)
    : null;

  return (
    <p className="text-[10px] text-gray-400 mt-1.5 px-1 flex items-center gap-1 flex-wrap">
      <CalendarClock size={10} className="text-sniffy-purple"/>
      {when && <span className="font-semibold text-gray-500">{when}</span>}
      {parsed.repeat_rule && <span>· repeats {parsed.repeat_rule}</span>}
    </p>
  );
}

// ─── Editor sheet ─────────────────────────────────────────────

function TodoEditor({
  open, todo, owner, onClose, onSaved,
}: {
  open: boolean;
  todo: AdminTodo | null;
  owner: { key: string; name?: string | null };
  onClose: () => void;
  onSaved: (row: AdminTodo, mode: 'created' | 'updated' | 'deleted') => void;
}) {
  const [form, setForm]     = useState<TodoInput>(emptyTodoInput);
  const [date, setDate]     = useState('');
  const [time, setTime]     = useState('');
  const [saving, setSaving] = useState(false);
  const [busyDel, setBusyDel] = useState(false);
  const [err, setErr]       = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useModalTakesOverStatusBar(open, '#ffffff');

  // Seed the form each time the sheet opens (or swaps to another row).
  useEffect(() => {
    if (!open) return;
    setErr(null);
    if (todo) {
      setForm({
        title: todo.title, notes: todo.notes,
        due_at: todo.due_at, all_day: todo.all_day,
        priority: todo.priority, repeat_rule: todo.repeat_rule,
        link_label: todo.link_label, link_type: todo.link_type, link_id: todo.link_id,
      });
      const s = splitDueAt(todo.due_at);
      setDate(s.date);
      setTime(todo.all_day ? '' : s.time);
    } else {
      setForm(emptyTodoInput());
      setDate('');
      setTime('');
    }
    // Desktop gets an autofocused title; on mobile we skip it so the
    // keyboard doesn't cover the sheet the instant it opens.
    if (window.matchMedia('(min-width: 640px)').matches) {
      window.setTimeout(() => titleRef.current?.focus(), 60);
    }
  }, [open, todo]);

  // Escape closes — matches the other admin modals.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function shiftDate(days: number | null) {
    if (days === null) { setDate(''); setTime(''); return; }
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDate(isoDate(d));
  }

  async function save() {
    const title = form.title.trim();
    if (!title) { setErr('Give the reminder a title.'); return; }
    setSaving(true);
    setErr(null);
    try {
      const input: TodoInput = {
        ...form,
        title,
        // A time without a date is meaningless — combineDateTime returns null
        // and the item becomes a "someday" entry rather than a bad timestamp.
        due_at: combineDateTime(date, time || '00:00'),
        all_day: !!date && !time,
      };
      const row = todo
        ? await updateTodo(todo.id, input)
        : await createTodo(input, owner);
      onSaved(row, todo ? 'updated' : 'created');
    } catch (e) {
      setErr(todoErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!todo) return;
    setBusyDel(true);
    try {
      await deleteTodo(todo.id);
      onSaved(todo, 'deleted');
    } catch (e) {
      setErr(todoErrorMessage(e));
    } finally {
      setBusyDel(false);
    }
  }

  const inputCls =
    'w-full rounded-xl border border-gray-200 px-3 py-2 text-[13px] text-gray-800 ' +
    'outline-none focus:border-sniffy-purple focus:ring-2 focus:ring-purple-100';
  const labelCls = 'text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block';

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[2px]"
            aria-hidden="true"
          />
          {/* Bottom sheet on mobile, centred card from sm up. */}
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit   ={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="pointer-events-auto w-full sm:w-[92vw] sm:max-w-[420px] bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
              style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}
              role="dialog"
              aria-modal="true"
              aria-label={todo ? 'Edit reminder' : 'New reminder'}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wider text-sniffy-purple">
                  {todo ? 'Edit reminder' : 'New reminder'}
                </p>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X size={14} className="text-gray-500"/>
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3.5 overflow-y-auto">
                <div>
                  <label className={labelCls} htmlFor="todo-title">What do you need to do?</label>
                  <input
                    id="todo-title"
                    ref={titleRef}
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Call Yashika — confirm the 2pm slot"
                    className={inputCls}
                  />
                </div>

                {/* When */}
                <div>
                  <label className={labelCls}>
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock size={11}/> When
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[
                      { label: 'Today',    days: 0    },
                      { label: 'Tomorrow', days: 1    },
                      { label: 'Next week',days: 7    },
                      { label: 'Someday',  days: null },
                    ].map(q => (
                      <button
                        key={q.label}
                        type="button"
                        onClick={() => shiftDate(q.days)}
                        className="text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-sniffy-purple transition-colors"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date" value={date}
                      onChange={e => setDate(e.target.value)}
                      className={inputCls}
                      aria-label="Due date"
                    />
                    <input
                      type="time" value={time}
                      onChange={e => setTime(e.target.value)}
                      disabled={!date}
                      className={`${inputCls} disabled:bg-gray-50 disabled:text-gray-400`}
                      aria-label="Due time"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {date
                      ? (time ? 'You’ll see it turn red once it’s late.' : 'All-day — no clock, just the date.')
                      : 'No date: it sits at the bottom as a “someday” note.'}
                  </p>
                </div>

                {/* Repeat */}
                <div>
                  <label className={labelCls} htmlFor="todo-repeat">
                    <span className="inline-flex items-center gap-1"><Repeat size={11}/> Repeat</span>
                  </label>
                  <select
                    id="todo-repeat"
                    value={form.repeat_rule ?? ''}
                    onChange={e => setForm(f => ({ ...f, repeat_rule: (e.target.value || null) as TodoRepeat | null }))}
                    className={inputCls}
                  >
                    {REPEAT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </div>

                {/* Link */}
                <div>
                  <label className={labelCls} htmlFor="todo-link">
                    <span className="inline-flex items-center gap-1"><Link2 size={11}/> Linked to</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id="todo-link"
                      value={form.link_label ?? ''}
                      onChange={e => setForm(f => ({ ...f, link_label: e.target.value }))}
                      placeholder="Hemant / Yashika Rani"
                      className={inputCls}
                    />
                    <select
                      value={form.link_type ?? ''}
                      onChange={e => setForm(f => ({ ...f, link_type: (e.target.value || null) as TodoLinkType | null }))}
                      className={inputCls}
                      aria-label="Link type"
                    >
                      {LINK_TYPE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={labelCls} htmlFor="todo-notes">Notes</label>
                  <textarea
                    id="todo-notes"
                    value={form.notes ?? ''}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    placeholder="Anything you'll want to remember"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {err && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2">
                    <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0"/>
                    <p className="text-[11px] text-red-600 leading-snug break-words">{err}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
                {todo && (
                  <button
                    onClick={remove}
                    disabled={busyDel}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-60"
                    aria-label="Delete reminder"
                  >
                    {busyDel ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                  </button>
                )}
                <div className="flex-1"/>
                <button
                  onClick={onClose}
                  className="text-[12px] font-bold text-gray-500 px-3 py-2 rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="text-[12px] font-bold text-white bg-sniffy-purple px-4 py-2 rounded-xl disabled:opacity-60 flex items-center gap-1.5"
                >
                  {saving && <Loader2 size={12} className="animate-spin"/>}
                  {todo ? 'Save' : 'Add reminder'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
