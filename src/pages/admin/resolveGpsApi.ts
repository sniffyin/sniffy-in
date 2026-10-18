/**
 * resolveGpsApi.ts
 *
 * Calls the `resolve-gps-link` Edge Function for one session whose
 * `gps_location` couldn't be parsed directly in the browser (almost
 * always a shortened link like maps.app.goo.gl — the browser can't
 * follow its redirect itself, see routePlanning.ts / the Edge Function
 * for why). The function follows the redirect (and geocodes a place
 * name as a last resort) server-side and caches the result on the
 * session row, so calling this again for the same session is cheap —
 * the function short-circuits on the cached value.
 */

import { supabase } from '../../lib/supabase';

export interface ResolveGpsResult {
  ok: boolean;
  lat?: number;
  lng?: number;
  precision?: 'exact' | 'approximate';
  cached?: boolean;
  error?: string;
}

export async function resolveGpsLink(sessionId: string, url: string): Promise<ResolveGpsResult> {
  const { data, error } = await supabase.functions.invoke('resolve-gps-link', {
    body: { sessionId, url },
  });

  if (error) {
    const ctxMsg = await tryReadFunctionErrorMessage(error);
    return { ok: false, error: ctxMsg ?? error.message };
  }
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'Empty response from the resolver.' };
  }
  return data as ResolveGpsResult;
}

/** Mirrors parseScreenshotApi.ts's error reader — supabase-js wraps a
 *  non-2xx Edge Function response as `error` with the original Response
 *  on `.context`; pull the JSON `{error: "..."}` out of it if present. */
async function tryReadFunctionErrorMessage(error: unknown): Promise<string | undefined> {
  const ctx = (error as { context?: Response }).context;
  if (!ctx || typeof (ctx as Response).text !== 'function') return undefined;
  try {
    const txt = await (ctx as Response).text();
    const parsed = JSON.parse(txt);
    if (parsed && typeof parsed.error === 'string') return parsed.error;
  } catch { /* fall through */ }
  return undefined;
}
