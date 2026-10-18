/**
 * admin/GroomerApplicationsPanel.tsx — review inbox for groomer onboarding
 * submissions (`groomer_applications`) + shared document viewer.
 *
 * Flow: applicant submits /groomer-onboarding → lands here as `pending` →
 * coordinator reviews docs → "Convert to Groomer" creates a `groomers` row
 * (and stamps the application `approved` + `converted_groomer_id`), or reject.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Loader2, MessageCircle, FileText, ExternalLink, Phone, MapPin,
  CheckCircle2, XCircle, UserPlus, AlertCircle, Archive, ArchiveRestore, RotateCcw, FolderOpen,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── Types ────────────────────────────────────────────────────

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface GroomerApplication {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  areas: string[] | null;
  pets: string[] | null;
  services: string[] | null;
  years_experience: number | null;
  has_own_kit: string | null;
  service_mode: string | null;
  bio: string | null;
  portfolio_urls: string[] | null;
  aadhaar_urls: string[] | null;
  certificate_urls: string[] | null;
  passport_photo_url: string | null;
  signature_url: string | null;
  consent_terms: boolean;
  consent_background_check: boolean;
  consent_whatsapp: boolean | null;
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
  converted_groomer_id: string | null;
  converted_at: string | null;
  archived_at: string | null;
}

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  pending:  'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};
const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: 'Pending', approved: 'Converted', rejected: 'Rejected',
};

const prettify = (v: string) =>
  v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const digits = (s: string | null | undefined) => (s ?? '').replace(/\D/g, '').slice(-10);

export async function fetchApplications(): Promise<GroomerApplication[]> {
  const { data, error } = await supabase
    .from('groomer_applications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('[applications] fetch', error); return []; }
  return (data ?? []) as GroomerApplication[];
}

/** Find the application behind an existing groomer (explicit link, else phone match). */
export function findApplicationForGroomer(
  apps: GroomerApplication[], groomerId: string, phone: string,
): GroomerApplication | undefined {
  return apps.find(a => a.converted_groomer_id === groomerId)
      ?? apps.find(a => digits(a.phone) && digits(a.phone) === digits(phone));
}

// ─── Documents viewer ─────────────────────────────────────────

interface DocItem { label: string; url: string }

function docItems(a: GroomerApplication): DocItem[] {
  const items: DocItem[] = [];
  if (a.passport_photo_url) items.push({ label: 'Passport photo', url: a.passport_photo_url });
  (a.aadhaar_urls ?? []).forEach((u, i) => items.push({ label: `Aadhaar ${i + 1}`, url: u }));
  (a.certificate_urls ?? []).forEach((u, i) => items.push({ label: `Certificate ${i + 1}`, url: u }));
  (a.portfolio_urls ?? []).forEach((u, i) => items.push({ label: `Portfolio ${i + 1}`, url: u }));
  if (a.signature_url) items.push({ label: 'Signature', url: a.signature_url });
  return items;
}

const isImage = (u: string) => /\.(jpe?g|png|webp|gif|avif|heic)(\?|$)/i.test(u);

function DocGrid({ app }: { app: GroomerApplication }) {
  const items = docItems(app);
  if (items.length === 0) {
    return <p className="text-xs text-gray-400 py-4 text-center">No documents uploaded.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map(d => (
        <a
          key={d.url}
          href={d.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-xl border border-gray-200 overflow-hidden bg-gray-50 hover:border-sniffy-purple transition"
        >
          <div className="aspect-[4/3] flex items-center justify-center bg-gray-100 overflow-hidden">
            {isImage(d.url) ? (
              <img src={d.url} alt={d.label} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <FileText size={28} className="text-gray-400" />
            )}
          </div>
          <div className="px-2.5 py-1.5 flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-gray-700 truncate">{d.label}</span>
            <ExternalLink size={11} className="text-gray-400 group-hover:text-sniffy-purple shrink-0" />
          </div>
        </a>
      ))}
    </div>
  );
}

/** Modal showing every uploaded document for an application — used from the roster too. */
export function GroomerDocsModal({ app, onClose }: { app: GroomerApplication | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {app && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-xl"
            initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-gray-900">{app.full_name}</h3>
                <p className="text-xs text-gray-400">Onboarding documents</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="p-5"><DocGrid app={app} /></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Detail modal (review + convert/reject) ───────────────────

function ChipList({ items }: { items: string[] | null }) {
  if (!items || items.length === 0) return <span className="text-xs text-gray-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(i => <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{i}</span>)}
    </div>
  );
}

function ApplicationModal({
  app, canWrite, onClose, onChanged,
}: {
  app: GroomerApplication; canWrite: boolean; onClose: () => void; onChanged: () => void;
}) {
  const [notes, setNotes] = useState(app.admin_notes ?? '');
  const [busy, setBusy]   = useState<'convert' | 'reject' | 'reopen' | 'archive' | null>(null);
  const [error, setError] = useState('');

  async function convert() {
    setError('');
    if (!window.confirm(`Convert ${app.full_name} into an active groomer?`)) return;
    setBusy('convert');
    try {
      // Guard: don't create a duplicate if a groomer with this phone already exists.
      const { data: existing } = await supabase.from('groomers').select('id, phone');
      const dup = (existing ?? []).find((g: { phone: string }) => digits(g.phone) === digits(app.phone));
      if (dup) throw new Error('A groomer with this phone number already exists.');

      const noteParts = [
        app.years_experience ? `${app.years_experience} yrs experience` : '',
        app.pets?.length ? `Pets: ${app.pets.join(', ')}` : '',
        app.services?.length ? `Services: ${app.services.join(', ')}` : '',
        app.has_own_kit ? `Own kit: ${app.has_own_kit}` : '',
        app.bio ?? '',
        'Converted from onboarding application.',
      ].filter(Boolean);

      const { data, error: insErr } = await supabase
        .from('groomers')
        .insert([{
          name: app.full_name.trim(),
          phone: app.phone.trim(),
          areas: app.areas ?? [],
          status: 'active',
          notes: noteParts.join(' · '),
          photo_url: app.passport_photo_url,
        }])
        .select('id')
        .single();
      if (insErr) throw insErr;

      const { error: updErr } = await supabase
        .from('groomer_applications')
        .update({
          status: 'approved',
          admin_notes: notes,
          converted_groomer_id: (data as { id: string }).id,
          converted_at: new Date().toISOString(),
        })
        .eq('id', app.id);
      if (updErr) throw updErr;
      onChanged(); onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : (e as { message?: string })?.message ?? 'Could not convert.');
    } finally { setBusy(null); }
  }

  async function setStatus(status: ApplicationStatus, kind: 'reject' | 'reopen') {
    setError(''); setBusy(kind);
    const { error: err } = await supabase
      .from('groomer_applications')
      .update({ status, admin_notes: notes })
      .eq('id', app.id);
    setBusy(null);
    if (err) { setError(err.message); return; }
    onChanged(); onClose();
  }

  async function setArchived(archived: boolean) {
    if (archived && !window.confirm('Archive this application? It disappears from the inbox but stays in the database.')) return;
    setError(''); setBusy('archive');
    const { error: err } = await supabase
      .from('groomer_applications')
      .update({ archived_at: archived ? new Date().toISOString() : null, admin_notes: notes })
      .eq('id', app.id);
    setBusy(null);
    if (err) { setError(err.message); return; }
    onChanged(); onClose();
  }

  const [tab, setTab] = useState<'overview' | 'docs' | 'notes'>('overview');
  const nDocs = docItems(app).length;
  const waNumber = `91${digits(app.phone)}`;

  const fact = (label: string, v: React.ReactNode) => (
    <div className="bg-gray-50 rounded-xl px-3 py-2.5 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <div className="text-sm font-semibold text-gray-800 mt-0.5 break-words">{v}</div>
    </div>
  );
  const section = (title: string, body: React.ReactNode) => (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">{title}</p>
      {body}
    </div>
  );

  const TABS = [
    { id: 'overview' as const, label: 'Overview', count: undefined as number | undefined },
    { id: 'docs' as const,     label: 'Documents', count: nDocs },
    ...(canWrite ? [{ id: 'notes' as const, label: 'Notes', count: undefined as number | undefined }] : []),
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white w-full sm:max-w-2xl h-[92vh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-xl"
        initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header: identity + quick contact */}
        <div className="px-4 pt-4 pb-3 flex items-start gap-3">
          {app.passport_photo_url ? (
            <img src={app.passport_photo_url} alt="" className="w-14 h-14 rounded-2xl object-cover bg-gray-100 shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-sniffy-purple flex items-center justify-center text-xl font-extrabold shrink-0">
              {app.full_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-gray-900 text-lg leading-tight truncate">{app.full_name}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[app.status]}`}>
                {STATUS_LABEL[app.status]}
              </span>
              {app.archived_at && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-200 text-gray-600">Archived</span>}
              <span className="text-xs text-gray-400">
                {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 shrink-0" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-4 pb-3 grid grid-cols-2 gap-2">
          <a href={`tel:${app.phone}`} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-50 text-sniffy-purple text-sm font-bold">
            <Phone size={14} /> Call
          </a>
          <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-bold">
            <MessageCircle size={14} /> WhatsApp
          </a>
        </div>

        {/* Segmented tabs */}
        <div className="px-4 pb-3">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${
                  tab === t.id ? 'bg-white text-sniffy-purple shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className={`text-[11px] rounded-full px-1.5 min-w-[18px] ${tab === t.id ? 'bg-purple-100 text-sniffy-purple' : 'bg-gray-200 text-gray-500'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-100" />

        <div className="p-4 overflow-y-auto flex-1 space-y-5">
          {tab === 'overview' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {fact('Phone', app.phone)}
                {fact('Experience', `${app.years_experience ?? 0} yrs`)}
                {fact('Own kit', app.has_own_kit ? app.has_own_kit.charAt(0).toUpperCase() + app.has_own_kit.slice(1) : '—')}
                {fact('Email', app.email || '—')}
              </div>
              {section('Areas', <ChipList items={app.areas} />)}
              {section('Pets', <ChipList items={app.pets} />)}
              {section('Services', <ChipList items={(app.services ?? []).map(prettify)} />)}
              {app.bio ? section('Bio', <p className="text-sm text-gray-700">{app.bio}</p>) : null}
              {section('Consents', (
                <div className="flex flex-wrap gap-1.5">
                  {[['Terms', app.consent_terms], ['Background check', app.consent_background_check], ['WhatsApp', !!app.consent_whatsapp]].map(([l, ok]) => (
                    <span key={l as string} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ok ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 line-through'}`}>{l as string}</span>
                  ))}
                </div>
              ))}
            </>
          )}

          {tab === 'docs' && <DocGrid app={app} />}

          {tab === 'notes' && canWrite && (
            <div>
              <textarea
                rows={6}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Interview feedback, verification status…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:border-sniffy-purple resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">Saved when you convert, reject, archive or restore.</p>
            </div>
          )}
        </div>

        {canWrite && (
          <div className="px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-gray-100 space-y-2 bg-white">
            {error && <p className="flex items-center gap-1.5 text-xs text-red-600"><AlertCircle size={12} />{error}</p>}
            <div className="flex flex-wrap gap-2 justify-end [&>button]:whitespace-nowrap [&>button]:justify-center">
              {app.status === 'pending' && (
                <>
                  <button
                    onClick={() => setStatus('rejected', 'reject')} disabled={!!busy}
                    className="px-4 py-2.5 rounded-full border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {busy === 'reject' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
                  </button>
                  <button
                    onClick={convert} disabled={!!busy}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-sniffy-purple text-white text-sm font-bold hover:bg-purple-900 flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {busy === 'convert' ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} <span className="sm:hidden">Convert</span><span className="hidden sm:inline">Convert to Groomer</span>
                  </button>
                </>
              )}
              {app.status === 'rejected' && (
                <button
                  onClick={() => setStatus('pending', 'reopen')} disabled={!!busy}
                  className="px-4 py-2.5 rounded-full border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-60"
                >
                  {busy === 'reopen' ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Move back to pending
                </button>
              )}
              {app.status === 'approved' && (
                <span className="text-xs text-green-700 flex items-center gap-1.5 mr-auto">
                  <CheckCircle2 size={14} /> Converted
                  {app.converted_at ? ` on ${new Date(app.converted_at).toLocaleDateString('en-IN')}` : ''}.
                  Add their login in authStore to let them sign in.
                </span>
              )}
              <button
                onClick={() => setArchived(!app.archived_at)} disabled={!!busy}
                className="px-3 py-2.5 rounded-full text-gray-500 hover:text-sniffy-purple hover:bg-gray-100 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60"
                title={app.archived_at ? 'Restore to inbox' : 'Archive application'}
              >
                {busy === 'archive' ? <Loader2 size={14} className="animate-spin" />
                  : app.archived_at ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                <span className={app.archived_at ? '' : 'hidden sm:inline'}>{app.archived_at ? 'Restore' : 'Archive'}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Panel ────────────────────────────────────────────────────

type Filter = 'pending' | 'rejected' | 'approved' | 'all' | 'archived';

export default function GroomerApplicationsPanel({
  apps, loading, canWrite, onChanged,
}: {
  apps: GroomerApplication[]; loading: boolean; canWrite: boolean; onChanged: () => void;
}) {
  const [filter, setFilter] = useState<Filter>('pending');
  const [q, setQ]           = useState('');
  const [open, setOpen]     = useState<GroomerApplication | null>(null);

  const live = useMemo(() => apps.filter(a => !a.archived_at), [apps]);
  const counts = useMemo(() => ({
    pending:  live.filter(a => a.status === 'pending').length,
    rejected: live.filter(a => a.status === 'rejected').length,
    approved: live.filter(a => a.status === 'approved').length,
    all:      live.length,
    archived: apps.length - live.length,
  }), [apps, live]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = filter === 'archived' ? apps.filter(a => a.archived_at) : live;
    return base.filter(a =>
      (filter === 'all' || filter === 'archived' || a.status === filter) &&
      (!needle ||
        a.full_name.toLowerCase().includes(needle) ||
        a.phone.includes(needle) ||
        (a.areas ?? []).some(x => x.toLowerCase().includes(needle))),
    );
  }, [apps, live, filter, q]);

  // Keep the open modal in sync after a refetch.
  useEffect(() => {
    setOpen(cur => (cur ? apps.find(a => a.id === cur.id) ?? null : cur));
  }, [apps]);

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'pending', label: 'Pending' }, { id: 'rejected', label: 'Rejected' },
    { id: 'approved', label: 'Converted' }, { id: 'all', label: 'All' },
    { id: 'archived', label: 'Archived' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition ${
                filter === f.id
                  ? 'bg-sniffy-purple text-white border-sniffy-purple'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-sniffy-purple'
              }`}
            >
              {f.label} ({counts[f.id]})
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search name, phone, area…"
            className="w-full border border-gray-200 rounded-full pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-sniffy-purple"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}</div>
      ) : list.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 font-medium">No {filter === 'all' ? '' : filter === 'archived' ? 'archived ' : STATUS_LABEL[filter].toLowerCase() + ' '}applications.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map(a => {
            const nDocs = docItems(a).length;
            return (
              <button
                key={a.id}
                onClick={() => setOpen(a)}
                className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-purple-200 transition"
              >
                <div className="flex items-start gap-3">
                  {a.passport_photo_url ? (
                    <img src={a.passport_photo_url} alt="" loading="lazy" className="w-11 h-11 rounded-xl object-cover bg-gray-100 shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-purple-100 text-sniffy-purple flex items-center justify-center font-extrabold shrink-0">
                      {a.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-gray-900 truncate">{a.full_name}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${STATUS_STYLE[a.status]}`}>
                        {STATUS_LABEL[a.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Phone size={10} /> {a.phone}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                  <span>{a.years_experience ?? 0} yrs</span>
                  {(a.areas?.length ?? 0) > 0 && (
                    <span className="flex items-center gap-1"><MapPin size={10} />{a.areas!.slice(0, 2).join(', ')}{a.areas!.length > 2 ? ` +${a.areas!.length - 2}` : ''}</span>
                  )}
                  <span className="flex items-center gap-1"><FolderOpen size={10} />{nDocs} docs</span>
                  <span className="ml-auto">{new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <ApplicationModal
            key={open.id}
            app={open}
            canWrite={canWrite}
            onClose={() => setOpen(null)}
            onChanged={onChanged}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Hook so GroomersTab can share one fetch between the roster and the inbox. */
export function useApplications() {
  const [apps, setApps]       = useState<GroomerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setApps(await fetchApplications());
    setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { apps, loading, refresh };
}
