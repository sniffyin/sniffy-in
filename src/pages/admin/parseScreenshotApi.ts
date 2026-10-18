/**
 * parseScreenshotApi.ts
 *
 * Calls the `parse-booking-screenshot` Supabase Edge Function with a
 * user-picked image and returns the structured fields it extracts.
 *
 * The shape matches `ParsedSession` from SessionFormModal.tsx + a few
 * extra fields (source_type, source, pet_type) so the existing
 * `applyQuickFill` reducer in the modal can consume the same object
 * with no special casing.
 */

import { supabase } from '../../lib/supabase';
import type { BookingSource, SourceType } from './types';

export interface ScreenshotParsedSession {
  pet_parent_name?: string;
  address?:         string;
  session_date?:    string;          // yyyy-mm-dd
  scheduled_time?:  string;          // HH:MM (24h)
  pet_type?:        'dog' | 'cat';
  breed?:           string;
  pet_age?:         '0-1 years' | '1-5 years' | '5+ years';
  booking_amount?:  number;
  source_type?:     SourceType;      // always 'external' from screenshots
  source?:          BookingSource;   // 'woofly' | 'paw_space' | 'oh_my_pet' | 'other'
}

export interface ParseResult {
  ok:     boolean;
  data?:  ScreenshotParsedSession;
  error?: string;
}

const MAX_BYTES = 6 * 1024 * 1024;   // matches the Edge Function limit

/**
 * Reads a File as a plain base64 string (no `data:` prefix).
 * Wrapped in a Promise because FileReader is event-based.
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed.'));
    reader.onload  = () => {
      const result = reader.result as string;   // "data:image/png;base64,AAAA…"
      const comma  = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Send a screenshot to the Edge Function and get back the parsed
 * fields.  Network errors / model errors / missing-key errors all
 * surface as `{ ok: false, error: '…' }` so callers don't have to
 * try/catch.
 */
export async function parseBookingScreenshot(file: File): Promise<ParseResult> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'Pick an image (PNG, JPG, or WebP).' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Keep under 6 MB.` };
  }

  let image: string;
  try {
    image = await fileToBase64(file);
  } catch (e) {
    return { ok: false, error: `Couldn't read the image: ${e instanceof Error ? e.message : String(e)}` };
  }

  const { data, error } = await supabase.functions.invoke('parse-booking-screenshot', {
    body: { image, mime: file.type },
  });

  if (error) {
    // supabase-js wraps non-2xx as `error` with a `context` that holds
    // the parsed body.  Surface the most specific message we can, then
    // run it through the overload detector so a raw Gemini 503 doesn't
    // leak to the UI (the Edge Function now tags these, but we keep
    // this client-side translator as a belt-and-braces fallback for
    // older / un-deployed Edge Function versions).
    const ctxMsg = await tryReadFunctionErrorMessage(error);
    const raw    = ctxMsg ?? error.message;
    return { ok: false, error: friendlyError(raw) };
  }

  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'Empty response from the AI service.' };
  }

  const payload = data as { ok?: boolean; data?: ScreenshotParsedSession; error?: string; code?: string };
  if (!payload.ok || !payload.data) {
    // If the Edge Function tagged the failure as OVERLOADED (transient
    // Gemini high-demand), we already have a clean message — surface
    // it as-is.  Otherwise, run the raw message through the friendly
    // translator so legacy uppercase Gemini blobs still get smoothed.
    const errMsg = payload.code === 'OVERLOADED'
      ? (payload.error ?? 'The AI service is busy. Try again in a minute.')
      : friendlyError(payload.error ?? 'AI service returned an unexpected response.');
    return { ok: false, error: errMsg };
  }

  return { ok: true, data: payload.data };
}

/**
 * Translates raw upstream errors into something a non-technical
 * coordinator can read.  Right now we mostly care about Gemini's
 * "UNAVAILABLE / high demand" 503s — those used to leak straight to
 * the UI as JSON.  Everything we don't recognise passes through.
 */
function friendlyError(raw: string): string {
  if (!raw) return 'Screenshot parsing failed. Please try again.';
  const r = raw.toLowerCase();
  if (
    r.includes('503')           ||
    r.includes('unavailable')   ||
    r.includes('overloaded')    ||
    r.includes('high demand')   ||
    r.includes('rate limit')    ||
    r.includes('429')           ||
    r.includes('resource_exhausted')
  ) {
    return 'The AI service is currently busy. Please try again in a minute.';
  }
  return raw;
}

/**
 * supabase.functions.invoke surfaces non-2xx responses as `FunctionsHttpError`
 * with the original Response on `.context`.  Try to pull a friendly
 * message out of the JSON body so the user sees "Image is too large"
 * instead of "Edge Function returned a non-2xx status code".
 */
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
