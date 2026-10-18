/**
 * admin/PoliciesTab.tsx — Role Policy Acknowledgments
 *
 * Three sub-views:
 *   Content   — edit each role's policy text (title, intro, heading+bullet
 *               sections). Master copy, stored in role_policies.
 *   Generate  — pick a role + who it's for, mint a one-time sign link
 *               (policy_acknowledgments row) pointing at /policy-sign/:token.
 *               That route is intentionally not linked from any nav and is
 *               blocked in robots.txt — it's only ever reached via the link
 *               generated here.
 *   Records   — every link ever generated: status, and either "copy link"
 *               (pending) or "download PDF" (signed).
 *
 * See policyTypes.ts for the data layer and policyAckPdf.ts for the PDF the
 * signer downloads after signing (built on the public sign page, not here).
 */

import { useEffect, useMemo, useState } from 'react';
import {
  FileText, Link as LinkIcon, ClipboardList, Copy, Check, Loader2,
  Plus, Trash2, Download, AlertCircle, RefreshCw,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { AdminUser } from './authStore';
import {
  POLICY_ROLES, POLICY_ROLE_LABEL, type PolicyRole, type RolePolicy, type RolePolicySection,
  type PolicyAcknowledgment,
  fetchRolePolicies, fetchRolePolicy, saveRolePolicy,
  fetchAcknowledgments, createAcknowledgmentLink, buildPolicyLinkUrl, getSignedPolicyPdfUrl,
  errMsg,
} from './policyTypes';

type SubView = 'generate' | 'content' | 'records';

interface GroomerOption { id: string; name: string; }

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const SUB_TABS: { id: SubView; label: string; Icon: React.ElementType }[] = [
  { id: 'generate', label: 'Generate Link', Icon: LinkIcon },
  { id: 'content',  label: 'Policy Content', Icon: FileText },
  { id: 'records',  label: 'Signed Records', Icon: ClipboardList },
];

export default function PoliciesTab({ user }: { user: AdminUser }) {
  const [subView, setSubView] = useState<SubView>('generate');
  const [policies, setPolicies] = useState<RolePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setLoading(true); setError(null);
    try {
      setPolicies(await fetchRolePolicies());
    } catch (err) {
      setError(errMsg(err));
    } finally { setLoading(false); }
  }

  useEffect(() => { reload(); }, []);

  const policyByRole = useMemo(() => {
    const m = new Map<PolicyRole, RolePolicy>();
    policies.forEach(p => m.set(p.role, p));
    return m;
  }, [policies]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Role Policies</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Per-role responsibilities &amp; work ethics — generate a personal link, they read it and sign, a PDF is saved.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {SUB_TABS.map(tab => {
          const active = subView === tab.id;
          return (
            <button key={tab.id} onClick={() => setSubView(tab.id)}
              className={['flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                active ? 'bg-sniffy-purple text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'].join(' ')}>
              <tab.Icon size={15}/>
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center">
          <Loader2 size={16} className="animate-spin"/> Loading…
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-4">
          <AlertCircle size={16}/> {error}
        </div>
      )}

      {!loading && !error && subView === 'generate' && (
        <GenerateLinkPanel policyByRole={policyByRole} createdBy={user.name} />
      )}
      {!loading && !error && subView === 'content' && (
        <ContentEditorPanel policies={policies} updatedBy={user.name} onSaved={reload} />
      )}
      {!loading && !error && subView === 'records' && <RecordsPanel />}
    </div>
  );
}

// ─── Generate Link ──────────────────────────────────────────────────

function GenerateLinkPanel({
  policyByRole, createdBy,
}: { policyByRole: Map<PolicyRole, RolePolicy>; createdBy: string }) {
  const [role, setRole] = useState<PolicyRole>('groomer');
  const [name, setName] = useState('');
  const [groomerId, setGroomerId] = useState<string | null>(null);
  const [groomers, setGroomers] = useState<GroomerOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; ack: PolicyAcknowledgment } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (role !== 'groomer' || groomers.length > 0) return;
    supabase.from('groomers').select('id, name').eq('status', 'active').order('name')
      .then(({ data }) => setGroomers((data ?? []) as GroomerOption[]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  function resetForNewLink() {
    setResult(null); setCopied(false); setName(''); setGroomerId(null);
  }

  async function handleGenerate() {
    const signerName = name.trim();
    if (!signerName) { setError('Enter a name.'); return; }
    setSubmitting(true); setError(null);
    try {
      // Fetch fresh (not the possibly-stale copy the parent loaded on mount)
      // so the link always snapshots the current master text.
      const policy = await fetchRolePolicy(role) ?? policyByRole.get(role);
      if (!policy) throw new Error(`No policy content set up yet for ${POLICY_ROLE_LABEL[role]} — add it under "Policy Content" first.`);
      const ack = await createAcknowledgmentLink({ role, signerName, groomerId, createdBy, policy });
      setResult({ url: buildPolicyLinkUrl(ack.token), ack });
    } catch (err) {
      setError(errMsg(err));
    } finally { setSubmitting(false); }
  }

  async function copyLink() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked */ }
  }

  if (result) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm font-medium">
          <Check size={16}/> Link created for {result.ack.signer_name} ({POLICY_ROLE_LABEL[result.ack.role]}).
        </div>
        <div className="flex items-center gap-2">
          <input readOnly value={result.url}
            className="flex-1 text-sm font-mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700"/>
          <button onClick={copyLink}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sniffy-purple text-white text-sm font-semibold hover:bg-sniffy-purple/90">
            {copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          This link is one-time — once {result.ack.signer_name} signs, it locks to a read-only "already signed" view.
          It isn't listed anywhere in the app and is blocked from search indexing.
        </p>
        <button onClick={resetForNewLink} className="text-sm font-semibold text-sniffy-purple hover:underline">
          + Generate another link
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 max-w-lg">
      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Role</label>
        <div className="flex gap-2 mt-2">
          {POLICY_ROLES.map(r => (
            <button key={r} onClick={() => { setRole(r); setGroomerId(null); }}
              className={['px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                role === r ? 'bg-sniffy-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'].join(' ')}>
              {POLICY_ROLE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {role === 'groomer' && groomers.length > 0 && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Pick from roster (optional)</label>
          <select
            value={groomerId ?? ''}
            onChange={e => {
              const id = e.target.value || null;
              setGroomerId(id);
              const g = groomers.find(x => x.id === id);
              if (g) setName(g.name);
            }}
            className="mt-2 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white">
            <option value="">— type a name below instead —</option>
            {groomers.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
          {role === 'groomer' ? 'Name' : `${POLICY_ROLE_LABEL[role]}'s name`}
        </label>
        <input value={name}
          onChange={e => { setName(e.target.value); setGroomerId(null); }}
          placeholder="e.g. Hemant Sharma"
          className="mt-2 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5"/>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
          <AlertCircle size={15}/> {error}
        </div>
      )}

      <button onClick={handleGenerate} disabled={submitting}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sniffy-purple text-white text-sm font-semibold hover:bg-sniffy-purple/90 disabled:opacity-50">
        {submitting ? <Loader2 size={15} className="animate-spin"/> : <LinkIcon size={15}/>}
        Generate Link
      </button>
    </div>
  );
}

// ─── Content editor ─────────────────────────────────────────────────

interface SectionDraft { heading: string; itemsText: string; }
interface Draft { title: string; intro: string; sections: SectionDraft[]; }

function sectionsToDraft(sections: RolePolicySection[]): SectionDraft[] {
  return sections.map(s => ({ heading: s.heading, itemsText: s.items.join('\n') }));
}
function draftToSections(sections: SectionDraft[]): RolePolicySection[] {
  return sections
    .map(s => ({
      heading: s.heading.trim(),
      items: s.itemsText.split('\n').map(x => x.trim()).filter(Boolean),
    }))
    .filter(s => s.heading && s.items.length > 0);
}

function ContentEditorPanel({
  policies, updatedBy, onSaved,
}: { policies: RolePolicy[]; updatedBy: string; onSaved: () => void }) {
  const [role, setRole] = useState<PolicyRole>('groomer');
  const [draft, setDraft] = useState<Draft>({ title: '', intro: '', sections: [] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = policies.find(x => x.role === role);
    setDraft({
      title: p?.title ?? `${POLICY_ROLE_LABEL[role]} — Role Responsibilities & Work Ethics`,
      intro: p?.intro ?? '',
      sections: sectionsToDraft(p?.sections ?? []),
    });
    setSaved(false); setError(null);
  }, [role, policies]);

  function updateSection(i: number, patch: Partial<SectionDraft>) {
    setDraft(d => ({ ...d, sections: d.sections.map((s, idx) => idx === i ? { ...s, ...patch } : s) }));
  }
  function addSection() {
    setDraft(d => ({ ...d, sections: [...d.sections, { heading: '', itemsText: '' }] }));
  }
  function removeSection(i: number) {
    setDraft(d => ({ ...d, sections: d.sections.filter((_, idx) => idx !== i) }));
  }

  async function handleSave() {
    if (!draft.title.trim()) { setError('Title is required.'); return; }
    setSaving(true); setError(null);
    try {
      await saveRolePolicy({
        role,
        title: draft.title.trim(),
        intro: draft.intro.trim() || null,
        sections: draftToSections(draft.sections),
      }, updatedBy);
      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(errMsg(err));
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {POLICY_ROLES.map(r => (
          <button key={r} onClick={() => setRole(r)}
            className={['px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              role === r ? 'bg-sniffy-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'].join(' ')}>
            {POLICY_ROLE_LABEL[r]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Title</label>
          <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
            className="mt-2 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 font-semibold"/>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Intro (shown above the sections)</label>
          <textarea value={draft.intro} onChange={e => setDraft(d => ({ ...d, intro: e.target.value }))}
            rows={2}
            className="mt-2 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5"/>
        </div>

        <div className="space-y-4">
          {draft.sections.map((s, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50/60 space-y-2">
              <div className="flex items-center gap-2">
                <input value={s.heading} onChange={e => updateSection(i, { heading: e.target.value })}
                  placeholder="Section heading"
                  className="flex-1 text-sm font-bold border border-gray-200 rounded-lg px-3 py-2 bg-white"/>
                <button onClick={() => removeSection(i)} className="text-gray-400 hover:text-red-500 p-2">
                  <Trash2 size={16}/>
                </button>
              </div>
              <textarea value={s.itemsText} onChange={e => updateSection(i, { itemsText: e.target.value })}
                rows={4} placeholder="One responsibility per line"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"/>
            </div>
          ))}
          <button onClick={addSection}
            className="flex items-center gap-1.5 text-sm font-semibold text-sniffy-purple hover:underline">
            <Plus size={15}/> Add section
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
            <AlertCircle size={15}/> {error}
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sniffy-purple text-white text-sm font-semibold hover:bg-sniffy-purple/90 disabled:opacity-50">
          {saving ? <Loader2 size={15} className="animate-spin"/> : saved ? <Check size={15}/> : <FileText size={15}/>}
          {saved ? 'Saved' : 'Save'}
        </button>
        <p className="text-xs text-gray-400">
          Saving here only changes the master copy — links already generated keep showing what the signer originally read.
        </p>
      </div>
    </div>
  );
}

// ─── Records ────────────────────────────────────────────────────────

function RecordsPanel() {
  const [acks, setAcks] = useState<PolicyAcknowledgment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  async function reload() {
    setLoading(true); setError(null);
    try {
      setAcks(await fetchAcknowledgments());
    } catch (err) {
      setError(errMsg(err));
    } finally { setLoading(false); }
  }

  useEffect(() => { reload(); }, []);

  async function copyLink(token: string) {
    try {
      await navigator.clipboard.writeText(buildPolicyLinkUrl(token));
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(t => (t === token ? null : t)), 1500);
    } catch { /* clipboard blocked */ }
  }

  if (loading) {
    return <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center"><Loader2 size={16} className="animate-spin"/> Loading…</div>;
  }
  if (error) {
    return <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-4"><AlertCircle size={16}/> {error}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={reload} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-sniffy-purple">
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {acks.length === 0 && (
        <div className="text-center text-sm text-gray-400 py-10">No links generated yet.</div>
      )}

      {acks.map(ack => (
        <div key={ack.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <p className="font-semibold text-gray-900">{ack.signer_name}</p>
            <p className="text-xs text-gray-400">
              {POLICY_ROLE_LABEL[ack.role]} · created {fmtDate(ack.created_at)}
              {ack.signed_at ? ` · signed ${fmtDate(ack.signed_at)}` : ''}
            </p>
          </div>

          <span className={[
            'text-xs font-bold px-2.5 py-1 rounded-full',
            ack.status === 'signed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700',
          ].join(' ')}>
            {ack.status === 'signed' ? 'Signed' : 'Pending'}
          </span>

          {ack.status === 'signed' && ack.pdf_path ? (
            <a href={getSignedPolicyPdfUrl(ack.pdf_path)} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sniffy-purple text-white text-xs font-semibold hover:bg-sniffy-purple/90">
              <Download size={13}/> Download PDF
            </a>
          ) : (
            <button onClick={() => copyLink(ack.token)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200">
              {copiedToken === ack.token ? <Check size={13}/> : <Copy size={13}/>}
              {copiedToken === ack.token ? 'Copied' : 'Copy Link'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
