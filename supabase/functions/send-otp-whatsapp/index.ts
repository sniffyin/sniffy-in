/**
 * supabase/functions/send-otp-whatsapp/index.ts
 *
 * Supabase "Send SMS Hook" implementation that delivers OTPs via
 * WhatsApp using AiSensy's Campaign API instead of via SMS.
 *
 *   Why this exists
 *   ---------------
 *   Supabase Auth's built-in phone provider only supports SMS.  Real
 *   SMS to Indian numbers via Twilio is ~₹4-5 per OTP and has
 *   variable delivery (many go to spam).  WhatsApp via AiSensy is
 *   ~₹0.50-0.70 per OTP with near-instant delivery — about 10× cheaper
 *   and far better UX for an Indian customer base that lives in
 *   WhatsApp.
 *
 *   How it fits in
 *   --------------
 *   1. Customer enters phone in CustomerPortalGate → app calls
 *      `supabase.auth.signInWithOtp({ phone })`.
 *   2. Supabase generates the 6-digit OTP and saves it server-side.
 *   3. Instead of dispatching via Twilio/MessageBird, Supabase POSTs
 *      this Edge Function with the user + OTP payload.
 *   4. This function calls AiSensy → AiSensy sends the WhatsApp.
 *   5. Customer enters the code → app calls
 *      `supabase.auth.verifyOtp(...)` → Supabase verifies as normal.
 *
 *   So MY portal code in CustomerPortalGate.tsx didn't change AT ALL —
 *   the delivery channel is swapped under the hood.
 *
 *   Hook contract
 *   -------------
 *   Supabase passes a signed JSON payload:
 *     {
 *       user: { id, phone, ... },
 *       sms:  { otp: "123456" }
 *     }
 *   Headers include a `Webhook-Signature` we verify against the
 *   `SEND_SMS_HOOK_SECRET` env var.  Reject anything unsigned —
 *   otherwise an attacker who finds the function URL could spam OTPs.
 *
 *   Configuration (set as Supabase secrets — see DOCS.md):
 *     SEND_SMS_HOOK_SECRET     — given by Supabase when you register the hook
 *     AISENSY_API_KEY          — your AiSensy API key (Settings → API Keys)
 *     AISENSY_CAMPAIGN_NAME    — name of the OTP campaign you created
 *     AISENSY_USER_NAME        — shown as the "sender name" (use 'Sniffy')
 *
 *   AiSensy API note
 *   ----------------
 *   This calls the v2 Campaign API at backend.aisensy.com.  Their docs
 *   are the canonical source; verify the payload shape if AiSensy
 *   ever changes it (they version their API so breakage should be
 *   rare).  The `templateParams` array maps to the {{1}}, {{2}}, …
 *   placeholders in your approved Authentication template — for an
 *   OTP template that's just [otp].
 */

// Deno-style imports — Supabase Edge Functions run on Deno.
// deno-lint-ignore-file no-explicit-any
import { createHmac } from 'node:crypto';

interface SendSMSHookPayload {
  user: {
    id: string;
    phone?: string;
    [k: string]: unknown;
  };
  sms: {
    otp: string;
  };
}

// ─── Webhook signature verification ─────────────────────────────────
//
// Supabase signs hook requests using HMAC-SHA256 with a secret you
// give it during hook registration.  The signature is a base64
// HMAC over the raw request body, sent in `Webhook-Signature`.
//
// We refuse any request whose signature doesn't match.  This is
// critical: without it, anyone who knows the function URL could send
// OTP requests to arbitrary phone numbers, burning your AiSensy
// credits and harassing real people.

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  // Supabase format: `v1,whsec_<base64>` — we ignore the prefix and
  // compare the timing-safe HMAC.  See Supabase Auth hook docs.
  const expected = createHmac('sha256', secret).update(rawBody).digest('base64');
  // Constant-time compare to avoid timing attacks.
  const sigOnly = signature.split(',').pop() ?? signature;
  if (sigOnly.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sigOnly.length; i++) {
    diff |= sigOnly.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

// ─── AiSensy dispatch ───────────────────────────────────────────────

interface AiSensySendParams {
  destination: string;          // E.164 phone, no spaces
  otp:         string;
  apiKey:      string;
  campaign:    string;
  userName:    string;
}

async function sendViaAiSensy(p: AiSensySendParams): Promise<void> {
  // AiSensy's v2 Campaign API accepts an `apiKey` in the body plus
  // the campaign + destination + template params.  The campaign you
  // create in their dashboard is bound to your approved
  // Authentication template; the API just fills in the parameters
  // and dispatches.
  //
  // Endpoint (verify against current AiSensy docs — they've changed
  // it before):  POST https://backend.aisensy.com/campaign/t1/api/v2
  const res = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      apiKey:        p.apiKey,
      campaignName:  p.campaign,
      destination:   p.destination,
      userName:      p.userName,
      // {{1}} in the template becomes the OTP code.  AiSensy / Meta
      // require Authentication templates to have exactly one param
      // (the code itself), so this array always has length 1.
      templateParams: [p.otp],
      source:        'supabase-otp',
      media:         {},
      buttons:       [],
      carouselCards: [],
      location:      {},
      attributes:    {},
      paramsFallbackValue: {},
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '<no body>');
    throw new Error(
      `AiSensy returned ${res.status} ${res.statusText}: ${errBody.slice(0, 500)}`
    );
  }
}

// ─── Edge Function entrypoint ───────────────────────────────────────

// `Deno.serve` is the standard entrypoint for Supabase Edge Functions.
// We export a handler that's compatible with the runtime.
declare const Deno: any;

Deno.serve(async (req: Request): Promise<Response> => {
  // Hooks are POSTs only.
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const hookSecret    = Deno.env.get('SEND_SMS_HOOK_SECRET');
  const aisensyKey    = Deno.env.get('AISENSY_API_KEY');
  const aisensyCampaign = Deno.env.get('AISENSY_CAMPAIGN_NAME');
  const aisensyUser     = Deno.env.get('AISENSY_USER_NAME') ?? 'Sniffy';

  // Fail loudly on missing config — better than silently dropping OTPs.
  if (!hookSecret || !aisensyKey || !aisensyCampaign) {
    console.error('[send-otp-whatsapp] missing env var', {
      hasHookSecret: !!hookSecret,
      hasAisensy:    !!aisensyKey,
      hasCampaign:   !!aisensyCampaign,
    });
    return new Response(
      JSON.stringify({ error: 'Hook misconfigured — set SEND_SMS_HOOK_SECRET, AISENSY_API_KEY, AISENSY_CAMPAIGN_NAME' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Read raw body for signature verification BEFORE parsing JSON.
  const rawBody = await req.text();
  const sig     = req.headers.get('Webhook-Signature') ?? req.headers.get('webhook-signature');

  if (!verifySignature(rawBody, sig, hookSecret)) {
    console.warn('[send-otp-whatsapp] signature mismatch — rejected');
    return new Response('Unauthorized', { status: 401 });
  }

  let payload: SendSMSHookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    console.error('[send-otp-whatsapp] body parse failed:', err);
    return new Response('Bad request', { status: 400 });
  }

  const phone = payload.user?.phone;
  const otp   = payload.sms?.otp;
  if (!phone || !otp) {
    console.error('[send-otp-whatsapp] missing phone or otp', { hasPhone: !!phone, hasOtp: !!otp });
    return new Response(
      JSON.stringify({ error: 'phone and sms.otp are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Supabase stores phone in E.164 already (e.g. +919876543210).
  // AiSensy accepts the same format — just pass it through.  If you
  // serve customers outside India later, add country-code validation
  // here.
  try {
    await sendViaAiSensy({
      destination: phone,
      otp,
      apiKey:      aisensyKey,
      campaign:    aisensyCampaign,
      userName:    aisensyUser,
    });
  } catch (err) {
    console.error('[send-otp-whatsapp] AiSensy dispatch failed:', err);
    // Returning a 500 tells Supabase the delivery failed.  Supabase
    // will surface "Failed to send OTP" to the customer, who can
    // retry.  We do NOT swallow the error — silent failures here
    // would mean customers staring at a screen waiting for a WhatsApp
    // that never arrives.
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Success — Supabase Auth proceeds with the verify-OTP flow when
  // the customer enters the code.
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
