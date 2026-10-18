# parse-booking-screenshot — Edge Function setup

This function powers the **Screenshot Fill** button in the "Add Session"
modal. It takes a screenshot of an external-booking-app order (Woofly,
Paw Space, etc.), runs it through Google Gemini Flash (vision), and
returns structured fields the modal pre-fills.

---

## One-time setup

### 1. Get a Gemini API key (free)

1. Go to <https://aistudio.google.com/app/apikey>.
2. Click **Create API key**.
3. Copy the key (starts with `AIza…`).

The free tier covers ~1,500 requests/day at the Flash tier — plenty for
a typical coordinator.

### 2. Set the key as a Supabase secret

The key must NEVER ship in the client bundle. Supabase Edge Functions
read it from env at runtime:

```bash
cd /Users/jitendrabai/Downloads/sniffy-seo-scale
supabase secrets set GEMINI_API_KEY=AIza_your_key_here
```

### 3. Deploy the functionsupabase --version

```bash
supabase functions deploy parse-booking-screenshot
```

The first deploy also creates the function. Subsequent deploys update
it in place.

### 4. (Optional) Verify it's live

```bash
supabase functions list
# parse-booking-screenshot should appear
```

---

## Local testing

If you want to iterate on the prompt without redeploying every time:

```bash
# Run the function locally
supabase functions serve parse-booking-screenshot --env-file .env.local --no-verify-jwt

# .env.local should contain:
#   GEMINI_API_KEY=AIza…
```

Then POST a base64 image to `http://localhost:54321/functions/v1/parse-booking-screenshot`:

```bash
B64=$(base64 -i path/to/woofly-screenshot.png | tr -d '\n')
curl -X POST http://localhost:54321/functions/v1/parse-booking-screenshot \
  -H 'content-type: application/json' \
  -d "{\"image\": \"$B64\", \"mime\": \"image/png\"}"
```

---

## What it returns

```json
{
  "ok": true,
  "data": {
    "pet_parent_name": "Om Bidkar",
    "address": "Bld number 2/Flat number 12, Chandralok Nagri, Dahanukar Colony, Kothrud",
    "session_date": "2026-05-17",
    "scheduled_time": "13:00",
    "pet_type": "dog",
    "breed": "English Cocker Spaniel",
    "pet_age": "5+ years",
    "booking_amount": 999,
    "source_type": "external",
    "source": "woofly"
  }
}
```

Any field that the model couldn't find from the screenshot is simply
omitted (no nulls). The modal's `applyQuickFill` only overwrites
fields that are present, so partial extraction is fine.

---

## Cost

At Gemini 2.5 Flash pricing (May 2026):

| Volume        | Approx. monthly cost |
| ------------- | -------------------- |
| 50 / month    | Free                 |
| 500 / month   | Free                 |
| 5,000 / month | ~₹250                |

A single screenshot uses ~2k input tokens (image) + ~200 output tokens.

---

## If it stops working

- **"GEMINI_API_KEY not set"** — re-run step 2, then `supabase functions deploy parse-booking-screenshot`.
- **"Edge Function returned a non-2xx status"** — check `supabase functions logs parse-booking-screenshot` for the real error.
- **Gemini quota exceeded** — Google's free tier resets daily; either wait or add billing in AI Studio.
- **Wrong fields extracted** — tweak the prompt in `index.ts` (the `SYSTEM_PROMPT` constant) and redeploy. The prompt is the only thing that controls extraction quality.
