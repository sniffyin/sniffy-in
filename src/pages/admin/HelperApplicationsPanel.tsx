/**
 * admin/HelperApplicationsPanel.tsx — review inbox for "Groomer's Helper" sign-ups
 * (`helper_applications`). Separate from groomer applications: helpers are never
 * converted into `groomers` rows. Coordinator can approve / reject / re-open and add notes.
 */

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Phone, MessageCircle, MapPin, ExternalLink, CheckCircle2, XCircle, RotateCcw, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Status = 'pending' | 'approved' | 'rejected';

interface HelperApplication {
  id: string;
  full_name: string;
  phone: string;
  age: number | null;
  areas: string[] | null;
  tasks: string[] | null;
  pets_comfortable_with: string[] | null;
  availability: string | null;
  has_vehicle: string | null;
  languages: string[] | null;
  experience_level: string | null;
  aspiring_groomer: boolean;
  aadhaar_urls: string[] | null;
  passport_photo_url: string | null;
  signature_url: string | null;
  status: Status;
  admin_notes: string | null;
  converted_helper_id: string | null;
  created_at: string;
}

const STYLE: Record<Status, string> = {
  pending: 'bg-amber-100 text-amber-800', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
};
const pretty = (v: string) => v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export function useHelperApplications() {
  const [apps, setApps] = useState<HelperApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('helper_applications').select('*').is('archived_at', null).order('created_at', { ascending: false });
    if (error) console.error('[helper applications] fetch', error);
    setApps((data ?? []) as HelperApplication[]);
    setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { apps, loading, refresh };
}

function Doc({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-bold text-sniffy-purple bg-purple-50 border border-purple-100 rounded-full px-3 py-1 hover:bg-purple-100">
      <ExternalLink size={11} /> {label}
    </a>
  );
}

export default function HelperApplicationsPanel({ apps, loading, canWrite, onChanged }: {
  apps: HelperApplication[]; loading: boolean; canWrite: boolean; onChanged: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const setStatus = async (id: string, status: Status) => {
    setBusy(id);
    const { error } = await supabase.from('helper_applications').update({ status }).eq('id', id);
    if (error) alert(`Could not update: ${error.message}`);
    setBusy(null);
    onChanged();
  };

  const addToRoster = async (a: HelperApplication) => {
    setBusy(a.id);
    const { data, error } = await supabase.from('helpers').insert({
      name: a.full_name, phone: a.phone, areas: a.areas ?? [], photo_url: a.passport_photo_url,
      availability: a.availability, application_id: a.id,
    }).select('id').single();
    if (error || !data) { alert(`Could not add to roster: ${error?.message ?? 'unknown error'}`); setBusy(null); return; }
    await supabase.from('helper_applications').update({ converted_helper_id: data.id }).eq('id', a.id);
    setBusy(null);
    onChanged();
  };

  if (loading) return <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />;
  if (apps.length === 0) return <p className="text-center py-16 text-gray-500 font-medium">No helper applications yet.</p>;

  return (
    <div className="grid gap-4">
      {apps.map(a => {
        const wa = `https://wa.me/91${a.phone.replace(/\D/g, '').slice(-10)}`;
        return (
          <div key={a.id} className="bg-white border-2 border-gray-100 rounded-2xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {a.passport_photo_url
                  ? <img src={a.passport_photo_url} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-12 h-12 rounded-full bg-purple-100 flex-shrink-0" />}
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 truncate">{a.full_name}{a.age ? `, ${a.age}` : ''}</div>
                  <div className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STYLE[a.status]}`}>{pretty(a.status)}</span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
              <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1"><Phone size={12} /> {a.phone}</a>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-green-600"><MessageCircle size={12} /> WhatsApp</a>
              {a.areas?.length ? <span className="inline-flex items-center gap-1"><MapPin size={12} /> {a.areas.join(', ')}</span> : null}
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <div><b>Can help with:</b> {(a.tasks ?? []).map(pretty).join(', ') || '—'}</div>
              <div><b>Pets:</b> {(a.pets_comfortable_with ?? []).map(pretty).join(', ') || '—'} · <b>Availability:</b> {a.availability ? pretty(a.availability) : '—'} · <b>Vehicle:</b> {a.has_vehicle ? pretty(a.has_vehicle) : '—'}</div>
              <div><b>Experience:</b> {a.experience_level ? pretty(a.experience_level) : '—'}{a.languages?.length ? ` · ${a.languages.join(', ')}` : ''}{a.aspiring_groomer ? ' · Wants to become a groomer' : ''}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              {a.passport_photo_url && <Doc href={a.passport_photo_url} label="Photo" />}
              {(a.aadhaar_urls ?? []).map((u, i) => <Doc key={u} href={u} label={`Aadhaar ${i + 1}`} />)}
              {a.signature_url && <Doc href={a.signature_url} label="Signature" />}
            </div>

            {canWrite && (
              <div className="flex gap-2 pt-1">
                {a.status === 'pending' ? (
                  <>
                    <button disabled={busy === a.id} onClick={() => setStatus(a.id, 'approved')}
                      className="inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full disabled:opacity-60">
                      {busy === a.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Approve
                    </button>
                    <button disabled={busy === a.id} onClick={() => setStatus(a.id, 'rejected')}
                      className="inline-flex items-center gap-1.5 bg-white border-2 border-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-full disabled:opacity-60">
                      <XCircle size={12} /> Reject
                    </button>
                  </>
                ) : (
                  <>
                  {a.status === 'approved' && (a.converted_helper_id
                    ? <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 rounded-full px-4 py-2">✓ On roster</span>
                    : <button disabled={busy === a.id} onClick={() => addToRoster(a)}
                        className="inline-flex items-center gap-1.5 bg-sniffy-purple text-white text-xs font-bold px-4 py-2 rounded-full disabled:opacity-60">
                        {busy === a.id ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />} Add to roster
                      </button>)}
                  <button disabled={busy === a.id} onClick={() => setStatus(a.id, 'pending')}
                    className="inline-flex items-center gap-1.5 bg-white border-2 border-gray-200 text-gray-600 text-xs font-bold px-4 py-2 rounded-full disabled:opacity-60">
                    <RotateCcw size={12} /> Move back to pending
                  </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
