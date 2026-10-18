/**
 * admin/HelpersRoster.tsx — active helper roster (`helpers`). Helpers are added from an approved
 * application (see HelperApplicationsPanel) and can then be assigned to a session in SessionFormModal.
 */

import { useCallback, useEffect, useState } from 'react';
import { Phone, MapPin, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Helper {
  id: string; name: string; phone: string; areas: string[] | null; photo_url: string | null;
  availability: string | null; is_active: boolean;
}

export default function HelpersRoster({ refreshKey, canWrite }: { refreshKey: number; canWrite: boolean }) {
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('helpers').select('*').order('name');
    if (error) console.error('[helpers] fetch', error);
    setHelpers((data ?? []) as Helper[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load, refreshKey]);

  const toggleActive = async (h: Helper) => {
    setBusy(h.id);
    await supabase.from('helpers').update({ is_active: !h.is_active }).eq('id', h.id);
    setBusy(null); load();
  };
  const remove = async (h: Helper) => {
    if (!confirm(`Remove ${h.name} from the roster? Past sessions keep their helper link.`)) return;
    setBusy(h.id);
    await supabase.from('helpers').delete().eq('id', h.id);
    setBusy(null); load();
  };

  if (loading) return <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />;
  if (helpers.length === 0) {
    return <p className="text-sm text-gray-500 bg-gray-50 rounded-2xl px-4 py-5">
      No helpers on the roster yet. Approve an application below, then tap “Add to roster”.
    </p>;
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {helpers.map(h => (
        <div key={h.id} className={`bg-white border-2 border-gray-100 rounded-2xl p-4 flex items-center gap-3 ${h.is_active ? '' : 'opacity-60'}`}>
          {h.photo_url
            ? <img src={h.photo_url} alt="" className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
            : <div className="w-11 h-11 rounded-full bg-purple-100 flex-shrink-0" />}
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm text-gray-900 truncate">{h.name}</div>
            <a href={`tel:${h.phone}`} className="text-xs text-gray-500 inline-flex items-center gap-1"><Phone size={11} /> {h.phone}</a>
            {h.areas?.length ? <div className="text-[11px] text-gray-400 truncate flex items-center gap-1"><MapPin size={10} /> {h.areas.join(', ')}</div> : null}
          </div>
          {canWrite && (
            <div className="flex flex-col items-end gap-1.5">
              <button disabled={busy === h.id} onClick={() => toggleActive(h)}
                className={`text-[11px] font-bold px-3 py-1 rounded-full ${h.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                {busy === h.id ? <Loader2 size={11} className="animate-spin" /> : h.is_active ? 'Active' : 'Inactive'}
              </button>
              <button onClick={() => remove(h)} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
