# WhatsApp OTP via AiSensy — Setup Guide

This Edge Function intercepts Supabase Auth's OTP delivery and routes
it through AiSensy instead of Twilio SMS. Result: customers get the
code on WhatsApp, you pay ~₹0.50–0.70 per OTP instead of ₹4–5, and the
existing `CustomerPortalGate` code doesn't change at all.

End-to-end the flow is:

```
Customer enters phone in /account
        │
        ▼
supabase.auth.signInWithOtp({ phone })
        │
        ▼
Supabase generates 6-digit OTP, stores it server-side
        │
        ▼
Supabase POSTs the "Send SMS Hook" (this Edge Function)
        │
        ▼
Edge Function → AiSensy Campaign API → WhatsApp Business → customer's phone
        │
        ▼
Customer enters code → supabase.auth.verifyOtp → signed in
```

There are 5 setup steps. Plan for ~30 minutes the first time.

---

## 1. Create the WhatsApp Authentication template in AiSensy

You already have a WhatsApp Business account approved by Meta — good.
Now you need an Authentication template that contains a single
parameter (the OTP code).

1. Log in to https://app.aisensy.com
2. Go to **Manage → Template Manager** in the left sidebar.
3. Click **Create New Template**.
4. Fill in:
   - **Template name:** `sniffy_otp` (or anything — remember it for step 2)
   - **Category:** **Authentication** (not Marketing — marketing has stricter rules and is wrong for OTPs anyway)
   - **Language:** English (or whichever your customers use)
   - **Body:** `{{1}} is your Sniffy verification code. Don't share it with anyone. Valid for 1 minute.`
     - Important: an Authentication template must have **exactly one variable** (the OTP). Don't add more.
   - **Buttons:** Optional. You can add a "Copy code" button if AiSensy supports it for Authentication templates in your plan — speeds up the customer experience.
5. Submit for Meta approval. Approval usually lands in **1–3 days**.
6. Once approved, the template status flips to "Approved" in the dashboard.

## 2. Create an AiSensy "Campaign" wrapping that template

AiSensy's Campaign API requires a Campaign linked to your template.
This is a one-time wiring step.

1. AiSensy dashboard → **Campaigns → Create Campaign**.
2. **Campaign name:** `sniffy_otp_campaign` (remember this — it's the
   `AISENSY_CAMPAIGN_NAME` env var below).
3. **Template:** pick the `sniffy_otp` template you just got approved.
4. Save. The campaign is now callable via the API.

## 3. Get your AiSensy API key

1. AiSensy dashboard → **Settings → API Key** (or similar; the
   navigation has moved between AiSensy versions).
2. Generate / copy the API key.
3. Treat it like a password. Don't commit it to git, don't paste it
   in chat.

## 4. Deploy the Edge Function

Prerequisites: install the Supabase CLI if you don't have it.

```bash
# macOS — one-time install
brew install supabase/tap/supabase

# or via npm
npm install -g supabase
```

Then from the repo root:

```bash
# 1. Log in (opens a browser)
supabase login

# 2. Link this folder to your Supabase project (one-time)
#    Your project ref is the long string at Settings → General → Project ID
supabase link --project-ref rtqtjcwiuiafbevozbhl

# 3. Set the secrets the function needs at runtime
supabase secrets set AISENSY_API_KEY=paste-your-aisensy-api-key-here
supabase secrets set AISENSY_CAMPAIGN_NAME=sniffy_otp_campaign
supabase secrets set AISENSY_USER_NAME=Sniffy

# (We'll set SEND_SMS_HOOK_SECRET in step 5 after Supabase generates it.)

# 4. Deploy the function
supabase functions deploy send-otp-whatsapp
```

If the deploy succeeds, the CLI prints a URL like:

```
https://rtqtjcwiuiafbevozbhl.functions.supabase.co/send-otp-whatsapp
```

Copy that URL — step 5 needs it.

## 5. Register the function as a Send-SMS Hook in Supabase

1. Supabase Dashboard → **Authentication → Hooks**.
   *If you don't see Hooks in the menu, your Supabase plan might
   need to be upgraded — Hooks are on the Pro plan and above. Free
   tier supports them only on newer projects.*
2. Find the **Send SMS Hook** row → click **Create a hook** (or
   **Edit**).
3. **Hook type:** HTTPS.
4. **URL:** paste the function URL from step 4.
5. **HTTP Method:** POST (default).
6. Click **Generate secret** — Supabase shows you a secret string
   like `whsec_xxxxxxxxx`. **Copy it now**, you won't see it again.
7. Save the hook.
8. Push the secret to your Edge Function:

   ```bash
   supabase secrets set SEND_SMS_HOOK_SECRET=whsec_paste_here
   ```

9. **Important:** also enable the phone provider in
   Authentication → Sign In / Providers → Phone, but **leave the
   SMS provider config blank or with dummy values** — the hook
   bypasses the built-in provider. You DON'T need a Twilio account.

## 6. Test it

1. Open https://yourdomain.com/account (or wherever the portal is hosted).
2. Enter a phone number that exists as a customer in your `customers`
   table (so the post-verify linkage succeeds).
3. Within seconds you should get a WhatsApp message:
   > 123456 is your Sniffy verification code. Don't share it with anyone. Valid for 1 minute.
4. Enter the code → you should be signed into the portal.

If something fails, check:

- **Supabase Dashboard → Edge Functions → send-otp-whatsapp → Logs**
  to see what the function logged.
- **AiSensy Dashboard → Reports → Messages** to see whether AiSensy
  received and dispatched the message.
- **Supabase Dashboard → Authentication → Hooks → Send SMS Hook**
  shows recent invocations and any error responses.

## Common failures

| Symptom | Cause | Fix |
|---|---|---|
| "Signature mismatch" in function logs | `SEND_SMS_HOOK_SECRET` doesn't match the secret you generated in the hook | Regenerate the secret in Supabase → copy to env: `supabase secrets set SEND_SMS_HOOK_SECRET=...` → redeploy |
| AiSensy returns 401 | Wrong `AISENSY_API_KEY` | Regenerate key in AiSensy → re-set the env var |
| AiSensy returns 400 "Invalid campaign" | `AISENSY_CAMPAIGN_NAME` doesn't match the name you set in step 2 | Edit the env var to match exactly |
| AiSensy returns success but customer never gets the message | Template not yet Meta-approved, or customer's phone isn't on WhatsApp | Check AiSensy → Reports → Messages for the specific delivery status |
| Function times out | Cold start on a paused project | Subsequent invocations are warm — usually one-off |

## Cost note

AiSensy charges per authentication-template send. Indian numbers
typically cost ~₹0.50–0.70 per OTP depending on your plan. Their
dashboard shows real-time spend.

Compare this to Twilio SMS at ~₹4–5 per OTP and you're saving
**roughly 85–90%** per customer login attempt, with much higher
delivery rates and a better customer experience.

## Reverting to Twilio SMS

If you ever need to switch back (or run both as redundancy):

1. Disable the Send SMS Hook in Supabase → Authentication → Hooks.
2. Configure Twilio in Authentication → Sign In / Providers → Phone.
3. Update the copy in `CustomerPortalGate.tsx` from
   "We'll WhatsApp you a one-time code" back to
   "We'll send you a one-time code via SMS".

No other code changes needed — the portal flow is provider-agnostic.
