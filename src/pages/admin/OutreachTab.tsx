/**
 * admin/OutreachTab.tsx — Phase 3
 *
 * Daily outreach queue for the coordinator.  Reads from `outreach_log`
 * (where status='queued') and presents them grouped by template.  Each
 * row shows:
 *   • Customer name + phone
 *   • Pre-rendered WhatsApp body (so the coordinator can copy/paste or
 *     just hit Send)
 *   • One-tap "Open WhatsApp" → wa.me link + marks the row sent
 *   • Per-row Snooze (30 days) / Skip / Pause customer entirely
 *
 * Delivery model: click-to-send.  Hitting "Open WhatsApp" opens a
 * wa.me URL pre-loaded with the rendered body; the coordinator sends
 * from their own WhatsApp account.  We then mark the row 'sent' so
 * cooldown kicks in and the customer doesn't reappear tomorrow.
 *
 * Cron note: the queue is populated by the daily `run_daily_outreach()`
 * SQL function.  If pg_cron isn't enabled, the "Run now" button at the
 * top lets the coordinator manually trigger the same function — same
 * result, just human-driven.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, MessageCircle, Phone, AlertCircle, X, Loader2,
  CheckCircle2, Crown, Copy, PauseCircle, Send, Calendar, BellOff,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPhoneDisplay, LIFECYCLE_LABELS, LIFECYCLE_COLORS, LifecycleStage } from './customerTypes';

// ─── Types (shape of joined Supabase responses) ─────────────────────

interface QueuedRow {
  id:            string;
  customer_id:   string;
  template_key:  string;
  channel:       string;
  status:        'queued' | 'sent' | 'skipped' | 'failed';
  message_body:  string | null;
  queued_at:     string;
  customer: {
    id: string;
    name: string;
    phone: string;
    is_vip: boolean;
    lifecycle_stage: LifecycleStage;
    last_session_at: string | null;
    outreach_paused_until: string | null;
  };
}

interface TemplateRow {
  key:           string;
  label:         string;
  body_template: string;
  cooldown_days: number;
}

function fmtRecency(iso: string | null): string {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 3600 * 1000));
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// ─── Main tab ────────────────────────────────────────────────────────

export default function OutreachTab() {
  const [queue, setQueue]         = useState<QueuedRow[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [running, setRunning]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [activeFilter, setFilter] = useState<string>('all');   // 'all' | template_key

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pull queue + customer summary in one go via the embedded
      // resource shorthand.  RLS on both tables is permissive for
      // authenticated, so this returns all queued rows.
      const [queueRes, templatesRes] = await Promise.all([
        supabase.from('outreach_log')
          .select(`
            id, customer_id, template_key, channel, status, message_body, queued_at,
            customer:customers!inner(id, name, phone, is_vip, lifecycle_stage, last_session_at, outreach_paused_until)
          `)
          .eq('status', 'queued')
          .order('queued_at', { ascending: false })
          .limit(500),
        supabase.from('outreach_templates')
          .select('key, label, body_template, cooldown_days')
          .eq('is_active', true)
          .order('key'),
      ]);
      if (queueRes.error)     throw queueRes.error;
      if (templatesRes.error) throw templatesRes.error;
      setQueue((queueRes.data ?? []) as unknown as QueuedRow[]);
      setTemplates((templatesRes.data ?? []) as TemplateRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /** Manual fallback when pg_cron isn't enabled or the coordinator
   *  wants the freshest queue.  Same function the daily cron calls. */
  async function runNow() {
    setRunning(true);
    setError(null);
    try {
      const { error: err } = await supabase.rpc('run_daily_outreach');
      if (err) throw err;
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setRunning(false); }
  }

  // ── Filters ─────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const buckets: Record<string, QueuedRow[]> = {};
    for (const row of queue) {
      const key = row.template_key;
      if (activeFilter !== 'all' && key !== activeFilter) continue;
      (buckets[key] ??= []).push(row);
    }
    return buckets;
  }, [queue, activeFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: queue.length };
    for (const r of queue) c[r.template_key] = (c[r.template_key] ?? 0) + 1;
    return c;
  }, [queue]);

  // ── Row actions ─────────────────────────────────────────────────
  async function markSent(row: QueuedRow, openWhatsapp = true) {
    if (openWhatsapp && row.customer.phone && row.message_body) {
      const phone = row.customer.phone.replace(/[^0-9]/g, '');
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(row.message_body)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    try {
      const { error: err } = await supabase.rpc('mark_outreach_sent', {
        p_log_id: row.id,
        p_sent_by: 'coordinator',
      });
      if (err) throw err;
      setQueue(prev => prev.filter(r => r.id !== row.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function skip(row: QueuedRow, reason: string) {
    try {
      const { error: err } = await supabase
        .from('outreach_log')
        .update({ status: 'skipped', skip_reason: reason })
        .eq('id', row.id);
      if (err) throw err;
      setQueue(prev => prev.filter(r => r.id !== row.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function snoozeCustomer(customerId: string, days: number) {
    const until = new Date();
    until.setDate(until.getDate() + days);
    try {
      const { error: err } = await supabase
        .from('customers')
        .update({ outreach_paused_until: until.toISOString().slice(0, 10) })
        .eq('id', customerId);
      if (err) throw err;
      // Also skip any queued rows for this customer so they vanish from the list.
      const { error: skipErr } = await supabase
        .from('outreach_log')
        .update({ status: 'skipped', skip_reason: `snoozed:${days}d` })
        .eq('customer_id', customerId)
        .eq('status', 'queued');
      if (skipErr) console.warn('[OutreachTab] queued-row skip failed:', skipErr);
      setQueue(prev => prev.filter(r => r.customer_id !== customerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function copyToClipboard(text: string) {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">Outreach</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {queue.length} queued · click-to-send via WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runNow}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-sniffy-purple disabled:opacity-60 transition active:scale-95"
            title="Run the daily recompute + enqueue right now. Same function pg_cron runs nightly."
          >
            {running ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>}
            Run now
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-sniffy-purple disabled:opacity-40 transition font-semibold"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500"/>
          <div className="flex-1 min-w-0">
            <p className="font-bold">Outreach query failed</p>
            <p className="text-xs mt-0.5 text-red-500 break-all">{error}</p>
            <p className="text-xs mt-2 text-red-400">
              If this says <strong>relation "outreach_log" does not exist</strong>, apply migration
              <code className="font-mono"> 20260525000000_phase3_outreach.sql </code>first.
            </p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X size={14}/>
          </button>
        </div>
      )}

      {/* Filter pills — All + one per template */}
      <div className="flex gap-2 flex-wrap">
        <FilterPill
          label="All"
          count={counts.all ?? 0}
          active={activeFilter === 'all'}
          onClick={() => setFilter('all')}
        />
        {templates.map(t => (
          <FilterPill
            key={t.key}
            label={t.label}
            count={counts[t.key] ?? 0}
            active={activeFilter === t.key}
            onClick={() => setFilter(t.key)}
          />
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl"/>)}
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-gray-600 font-bold">Nothing in the outreach queue right now.</p>
          <p className="text-xs text-gray-400 mt-1.5">
            Run the daily job (top right) or wait for the 8 AM IST cron to populate tomorrow's queue.
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([templateKey, rows]) => {
          const template = templates.find(t => t.key === templateKey);
          return (
            <section key={templateKey} className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mt-3">
                {template?.label ?? templateKey} · {rows.length}
              </h3>
              <div className="space-y-2">
                {rows.map(row => (
                  <QueuedCard
                    key={row.id}
                    row={row}
                    onSendAndMark={() => markSent(row, true)}
                    onMarkOnly={() => markSent(row, false)}
                    onSkip={() => skip(row, 'skipped_by_coordinator')}
                    onSnooze={(days) => snoozeCustomer(row.customer_id, days)}
                    onCopy={() => copyToClipboard(row.message_body ?? '')}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────────

function FilterPill({ label, count, active, onClick }: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
        active
          ? 'bg-sniffy-purple text-white border-sniffy-purple'
          : 'bg-white text-gray-500 border-gray-200 hover:border-sniffy-purple/40'
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
          active ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
        }`}>{count}</span>
      )}
    </button>
  );
}

function QueuedCard({ row, onSendAndMark, onMarkOnly, onSkip, onSnooze, onCopy }: {
  row: QueuedRow;
  onSendAndMark: () => void;
  onMarkOnly:    () => void;
  onSkip:        () => void;
  onSnooze:      (days: number) => void;
  onCopy:        () => void;
}) {
  const [showSnooze, setShowSnooze] = useState(false);
  const [copyFlash, setCopyFlash] = useState(false);
  const lcColors = LIFECYCLE_COLORS[row.customer.lifecycle_stage];

  function handleCopy() {
    onCopy();
    setCopyFlash(true);
    setTimeout(() => setCopyFlash(false), 1200);
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-extrabold text-gray-900">
              {row.customer.name || <span className="text-gray-400 italic">No name</span>}
            </p>
            {row.customer.is_vip && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                <Crown size={9}/> VIP
              </span>
            )}
            <span className={`inline-flex items-center text-[10px] font-bold ${lcColors.bg} ${lcColors.text} border ${lcColors.border} rounded-full px-2 py-0.5`}>
              {LIFECYCLE_LABELS[row.customer.lifecycle_stage]}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
            <Phone size={10}/> {formatPhoneDisplay(row.customer.phone)}
            <span className="text-gray-300">·</span>
            <Calendar size={10}/> last session {fmtRecency(row.customer.last_session_at)}
          </p>
        </div>
      </div>

      {/* Rendered body */}
      <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-[12px] text-gray-700 whitespace-pre-wrap leading-relaxed">{row.message_body}</p>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <button
          onClick={onSendAndMark}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', boxShadow: '0 2px 6px rgba(37,211,102,0.35)' }}
        >
          <MessageCircle size={12}/> Open WhatsApp &amp; mark sent
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-700 bg-white border border-gray-200 transition-all active:scale-95"
        >
          <Copy size={11}/> {copyFlash ? 'Copied ✓' : 'Copy'}
        </button>
        <button
          onClick={onMarkOnly}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-600 bg-white border border-gray-200 transition-all active:scale-95"
          title="Mark as sent without opening WhatsApp (already sent some other way)"
        >
          <CheckCircle2 size={11}/> Mark sent
        </button>
        <div className="relative">
          <button
            onClick={() => setShowSnooze(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-600 bg-white border border-gray-200 transition-all active:scale-95"
          >
            <PauseCircle size={11}/> Snooze
          </button>
          <AnimatePresence>
            {showSnooze && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-10 mt-1 w-44 bg-white border border-gray-100 rounded-xl overflow-hidden"
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
              >
                {[7, 30, 90, 365].map(d => (
                  <button
                    key={d}
                    onClick={() => { onSnooze(d); setShowSnooze(false); }}
                    className="w-full text-left px-3 py-2 text-[11px] font-semibold text-gray-700 hover:bg-purple-50 transition"
                  >
                    {d === 7 ? '7 days'
                      : d === 30 ? '30 days'
                      : d === 90 ? '90 days'
                      : '1 year'}
                  </button>
                ))}
                <button
                  onClick={() => { onSkip(); setShowSnooze(false); }}
                  className="w-full text-left px-3 py-2 text-[11px] font-semibold text-red-500 hover:bg-red-50 border-t border-gray-50 transition"
                >
                  <BellOff size={10} className="inline mr-1"/> Just skip this one
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
