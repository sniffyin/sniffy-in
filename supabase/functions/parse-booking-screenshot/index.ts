/**
 * parse-booking-screenshot — Supabase Edge Function
 *
 * Takes a screenshot of an external-booking-app order (Woofly, Paw
 * Space, etc.) and returns a structured ParsedSession JSON that the
 * coordinator's "Add Session" modal can use to prefill its fields.
 *
 * Why this exists
 *   The coordinator currently retypes every Woofly / Paw Space booking
 *   into Sniffy's portal by hand — multiple per day, error-prone.
 *   Gemini Flash can OCR + extract structured fields in one round trip
 *   for fractions of a rupee per screenshot, so we let her drop in an
 *   image and have the form land 90% pre-filled.
 *
 * Why Gemini Flash specifically
 *   • Native multimodal (image+text) input
 *   • Cheapest of the major vision LLMs (orders of magnitude lower
 *     than Claude / GPT-4o for this volume)
 *   • Generous free tier — perfect for a small business piloting AI
 *   • Reliable structured JSON output via `responseMimeType`
 *
 * Why this is an Edge Function (not a browser-direct call)
 *   The GEMINI_API_KEY must NEVER ship to the client — anyone with the
 *   key can run inference on our budget.  The function is the only
 *   thing that ever touches the key; the browser just POSTs an image
 *   over a CORS-allowed boundary.
 *
 * ─── Deploy ─────────────────────────────────────────────────
 *
 *   1. Get a key:   https://aistudio.google.com/app/apikey
 *   2. Set secret:  supabase secrets set GEMINI_API_KEY=AIza…
 *   3. Deploy:      supabase functions deploy parse-booking-screenshot
 *   4. Local test:  supabase functions serve parse-booking-screenshot --no-verify-jwt
 *                   then POST { image: "<base64>", mime: "image/png" }
 *                   to http://localhost:54321/functions/v1/parse-booking-screenshot
 *
 * Cost (May 2026 pricing, Gemini 2.5 Flash)
 *   ≈ ₹0.05–₹0.20 per screenshot.  Free tier covers ~1,500/day.
 */

// deno-lint-ignore-file no-explicit-any

// Primary + fallback model.  Gemini's 503 ("UNAVAILABLE — high demand")
// errors are transient and tend to hit one model at a time, so when the
// flagship Flash is overloaded we retry on Flash-Lite (separate capacity
// pool, slightly weaker but still good enough for OCR + structured
// extraction of short booking screenshots).
const GEMINI_PRIMARY_MODEL  = 'gemini-2.5-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-2.5-flash-lite';

function geminiUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

// Hard ceiling — Gemini accepts up to 20 MB inline, but a phone
// screenshot should never need that much.  Reject anything larger so
// a bad upload doesn't burn the budget.
const MAX_BYTES = 6 * 1024 * 1024;   // 6 MB

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// The shape we want back from the model.  Mirrors the front-end
// `ParsedSession` interface (plus a few extra source / pet_type
// fields).  Documented in plain English so the model has a chance to
// produce something useful.
const SYSTEM_PROMPT = `
You are a structured-data extractor for a pet-grooming business in India.
You will be given a screenshot of a booking confirmation from an external
booking app (Woofly, Paw Space, Oh My Pet, or similar).  Extract the
following fields and respond ONLY with a JSON object — no prose, no
markdown fences.

Fields (omit a field entirely if you cannot find it — never invent or
guess):

  pet_parent_name   string  — name of the client / pet parent
  address           string  — full street/area address; do NOT include the
                              client name
  session_date      string  — ISO date "YYYY-MM-DD"
  scheduled_time    string  — 24h "HH:MM"
  pet_type          "dog" | "cat" — derive from breed or explicit label
  breed             string  — best guess at the breed (e.g.
                              "English Cocker Spaniel", "Persian Cat")
  pet_age           "0-1 years" | "1-5 years" | "5+ years" — bucket
                              whatever age you see into one of these
  booking_amount    number  — the total price the customer pays, in
                              rupees (no commas, no currency symbol).
                              Pick the LARGEST / final amount on the
                              screen — usually labelled "Total", "Grand
                              Total", "Amount Payable", or shown next to
                              the package name.
  source_type       "external" — always "external" for these screenshots
  source            "woofly" | "paw_space" | "oh_my_pet" | "other"
                              — Woofly's app uses an orange/salmon-coloured
                              primary button ("Call Client", "Navigate")
                              and an orange-themed header.  If you see that,
                              return "woofly".  Use "other" when unsure.

Important rules:
  • Output STRICTLY valid JSON.  No code fences, no commentary.
  • Use the bucket strings exactly as shown for pet_age.
  • Never invent breeds — if the screenshot doesn't show a breed,
    omit the field.
  • If the screenshot is clearly NOT a booking (e.g. a chat, a
    receipt, a random photo), respond with: {"_error": "not_a_booking"}
`.trim();

interface RequestBody {
  /** Base64-encoded image bytes — NO data:image/... prefix. */
  image: string;
  /** MIME type — "image/png", "image/jpeg", "image/webp". */
  mime?: string;
}

async function handler(req: Request): Promise<Response> {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'POST only' }, 405);
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return json({ error: 'GEMINI_API_KEY not set on this Edge Function.' }, 500);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Body must be JSON with { image, mime }.' }, 400);
  }

  if (!body.image || typeof body.image !== 'string') {
    return json({ error: '`image` must be a base64 string.' }, 400);
  }

  // Best-effort byte-size guard.  base64 ≈ 4/3 × source size.
  const approxBytes = (body.image.length * 3) / 4;
  if (approxBytes > MAX_BYTES) {
    return json({
      error: `Image is too large (${(approxBytes / 1024 / 1024).toFixed(1)} MB). Keep under ${MAX_BYTES / 1024 / 1024} MB.`,
    }, 413);
  }

  const mime = body.mime ?? 'image/png';

  // ─── Call Gemini (with retry + fallback model) ────────────
  const geminiBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: SYSTEM_PROMPT },
          { inline_data: { mime_type: mime, data: body.image } },
        ],
      },
    ],
    generationConfig: {
      // Asking for JSON via responseMimeType is what gives us
      // reliable structured output without prompt-engineering escape
      // hatches.  Gemini will refuse to wrap it in ```json fences.
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  };

  const callOutcome = await callGeminiWithRetryAndFallback(apiKey, geminiBody);
  if (!callOutcome.ok) {
    // Translate transient overload errors into a friendly,
    // machine-checkable `code` so the client can show a clean
    // "AI is busy, try again" message instead of raw JSON.
    const isOverload = callOutcome.status === 503 || callOutcome.status === 429;
    return json({
      error: isOverload
        ? 'The AI service is currently busy. Please try again in a minute.'
        : `Gemini error (${callOutcome.status ?? 'unknown'}): ${callOutcome.message}`,
      code: isOverload ? 'OVERLOADED' : 'UPSTREAM_ERROR',
    }, isOverload ? 503 : 502);
  }

  const text = callOutcome.text;
  if (!text) {
    return json({ error: 'Gemini returned an empty response.' }, 502);
  }

  // Parse the model's JSON.  responseMimeType:'application/json' makes
  // this reliable but we still defend against partial/incomplete text.
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text);
  } catch {
    return json({ error: 'Gemini returned non-JSON output.', raw: text.slice(0, 400) }, 502);
  }

  if (parsed._error === 'not_a_booking') {
    return json({ error: 'That screenshot doesn\'t look like a booking page.' }, 422);
  }

  // Light client-friendly normalisation so the front-end doesn't have
  // to re-validate every field shape.
  const result: Record<string, unknown> = {};
  if (typeof parsed.pet_parent_name === 'string') result.pet_parent_name = parsed.pet_parent_name.trim();
  if (typeof parsed.address         === 'string') result.address         = parsed.address.trim();
  if (typeof parsed.session_date    === 'string') result.session_date    = parsed.session_date.trim();
  if (typeof parsed.scheduled_time  === 'string') result.scheduled_time  = parsed.scheduled_time.trim();
  if (parsed.pet_type === 'dog' || parsed.pet_type === 'cat') result.pet_type = parsed.pet_type;
  if (typeof parsed.breed           === 'string') result.breed           = parsed.breed.trim();
  if (
    parsed.pet_age === '0-1 years' ||
    parsed.pet_age === '1-5 years' ||
    parsed.pet_age === '5+ years'
  ) result.pet_age = parsed.pet_age;
  if (typeof parsed.booking_amount  === 'number' && parsed.booking_amount > 0) {
    result.booking_amount = Math.round(parsed.booking_amount);
  }
  if (parsed.source_type === 'external') result.source_type = 'external';
  if (
    parsed.source === 'woofly' ||
    parsed.source === 'paw_space' ||
    parsed.source === 'oh_my_pet' ||
    parsed.source === 'other'
  ) result.source = parsed.source;

  return json({ ok: true, data: result });
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}

// ─────────────────────────────────────────────────────────────
// Gemini call with retry + model fallback
//
// Strategy:
//   1. Try primary model (gemini-2.5-flash) up to MAX_ATTEMPTS times
//      with exponential backoff on transient errors (429, 500, 503).
//   2. If still failing, repeat the same attempts against the fallback
//      model (gemini-2.5-flash-lite) — separate capacity pool that
//      tends to be free when the flagship is hot.
//   3. Non-transient errors (400 bad request, 401 auth, 403, etc.)
//      bail immediately — no point retrying a malformed request.
//
// Why these statuses
//   429 → rate limit / quota; brief backoff often clears it.
//   500 → Google's internal server error; usually transient.
//   503 → "UNAVAILABLE" with the high-demand message we keep seeing.
// ─────────────────────────────────────────────────────────────

interface GeminiCallSuccess { ok: true;  text: string }
interface GeminiCallFailure { ok: false; status?: number; message: string }
type    GeminiCallOutcome = GeminiCallSuccess | GeminiCallFailure;

const TRANSIENT_STATUSES = new Set<number>([429, 500, 503]);
const MAX_ATTEMPTS_PER_MODEL = 3;   // 1 initial + 2 retries

async function callGeminiWithRetryAndFallback(
  apiKey: string,
  body: unknown,
): Promise<GeminiCallOutcome> {
  for (const model of [GEMINI_PRIMARY_MODEL, GEMINI_FALLBACK_MODEL]) {
    const outcome = await callGeminiWithRetry(apiKey, model, body);
    // Success → done.
    if (outcome.ok) return outcome;
    // Non-transient failure → no point trying the fallback model.
    if (outcome.status !== undefined && !TRANSIENT_STATUSES.has(outcome.status)) {
      return outcome;
    }
    // Transient failure → fall through to the next model in the list.
    console.log(`[parse-booking-screenshot] ${model} failed after retries (${outcome.status} ${outcome.message}). Trying next model.`);
  }
  return { ok: false, status: 503, message: 'Both primary and fallback models are overloaded.' };
}

async function callGeminiWithRetry(
  apiKey: string,
  model: string,
  body: unknown,
): Promise<GeminiCallOutcome> {
  let lastFailure: GeminiCallFailure = { ok: false, message: 'No attempt made.' };
  for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
    const outcome = await callGeminiOnce(apiKey, model, body);
    if (outcome.ok) return outcome;
    lastFailure = outcome;
    // Bail on the first non-transient error.
    if (outcome.status !== undefined && !TRANSIENT_STATUSES.has(outcome.status)) {
      return outcome;
    }
    // Backoff: 500ms, then 1500ms, then 3500ms.  Adds a small jitter
    // (±20%) so retries from concurrent requests don't lockstep.
    if (attempt < MAX_ATTEMPTS_PER_MODEL) {
      const base = 500 * (2 ** (attempt - 1) + (attempt - 1));   // 500, 1500, 3500
      const jitter = base * (0.8 + Math.random() * 0.4);
      console.log(`[parse-booking-screenshot] ${model} attempt ${attempt} failed (${outcome.status}). Retrying in ${Math.round(jitter)}ms.`);
      await new Promise(r => setTimeout(r, jitter));
    }
  }
  return lastFailure;
}

async function callGeminiOnce(
  apiKey: string,
  model: string,
  body: unknown,
): Promise<GeminiCallOutcome> {
  let res: Response;
  try {
    res = await fetch(`${geminiUrl(model)}?key=${encodeURIComponent(apiKey)}`, {
      method:  'POST',
      headers: { 'content-type': 'application/json' },
      body:    JSON.stringify(body),
    });
  } catch (e) {
    // Network failure — treat as transient (will be retried).
    return {
      ok: false,
      status: 503,
      message: `network error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  if (!res.ok) {
    const errText = await res.text();
    return {
      ok: false,
      status: res.status,
      message: errText.slice(0, 400),
    };
  }

  const j = await res.json() as any;
  const text: string | undefined =
    j?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return { ok: false, status: 502, message: 'empty response from model' };
  }
  return { ok: true, text };
}

Deno.serve(handler);
