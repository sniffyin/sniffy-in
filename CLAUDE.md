# Sniffy — At-Home Pet Grooming Platform

Guidance for Claude Code working in this repo. Scaffolded with Bolt.new
(`.bolt/config.json` → `bolt-vite-react-ts`) and heavily extended since.

> **Provenance & trust order.** Two Word docs at the repo root
> (`Sniffy_Developer_Technical_Document.docx`, `Sniffy_User_Manual_BRD.docx`)
> describe the system, but they are **stale** — written ~20-May-2026, documenting
> only through "Phase 4" (customer portal). The database has since added Phases 5–6
> (referrals, gift cards, payroll, vaccinations, session change-requests, live chat),
> and several details in the docs no longer match the code (see **Doc drift** below).
> **When code and a doc disagree, the code wins.** This file was written by reading
> the source directly; claims below were verified against the files cited.

## What this app is

A technology-enabled **at-home dog/cat grooming service** in Pune, India — a groomer
travels to the customer's home and completes the service in one visit (no salon). One
React SPA + one Supabase Postgres serve **four surfaces**, all from the same codebase:

| Surface | Route | Users | Auth |
|---|---|---|---|
| Public marketing site | `/` | Prospects | none |
| Coordinator/admin dashboard | `/admin` | Admin, Coordinator, Viewer | app-level password (**not** Supabase Auth) |
| Groomer dashboard | `/groomer` | Field staff | app-level password (**not** Supabase Auth) |
| Customer portal | `/account` | Existing customers | Supabase Auth phone OTP (WhatsApp) |

It is simultaneously an **SEO MPA** (~60 statically-generated Pune locality landing
pages) and an **SPA** (the operational app), built by one `vite build`.

**Business model** — two channels, tracked per session by `payment_collected_by`
(`sniffy` | `vendor` | `groomer_cash`): **Direct** (Sniffy sources & collects) and
**Vendor** (partner platforms Woofly / Paw Space / Oh My Pet / Global Pet send leads;
either the partner pre-collected — "vendor-prepaid" — or Sniffy collects at the door).

## Tech stack

- React 18.3 + TypeScript 5.5 (strict), React Router 7, Vite 7
- Tailwind 3.4 — brand colors `sniffy-purple` `#451a8b`, `sniffy-yellow` `#f6ac0a` (the only theme customization in `tailwind.config.js`)
- lucide-react, framer-motion, `@lottiefiles/dotlottie-react`, `jspdf`/`jspdf-autotable` (payroll slips), `qrcode` (review QR)
- Supabase: Postgres (RLS on every table, 35 migrations), Auth (customer portal only), Storage, Edge Functions (Deno), `pg_cron`
- PWA via `vite-plugin-pwa` (Workbox); per-route manifest swap

## Running it locally

```bash
npm install
# create .env (it is gitignored; there is NO .env.example — see Env vars below)
npm run dev        # Vite dev server, HMR
npm run typecheck  # tsc --noEmit -p tsconfig.app.json
npm run lint       # eslint .
```

- **There are no automated tests** — no test runner, no CI config anywhere in the repo.
  Verification is manual (run the app). Don't assume a test suite exists to catch regressions.
- **`npm run typecheck` does not currently pass** — ~62 pre-existing errors across ~24 files
  (mostly unused-import `TS6133`, framer-motion `Variants`/`ease` typing, and `GroomerUser`↔`AdminUser`
  cast friction in the dashboards). It's not a clean green/red gate today — check that *your* file is
  clean and that you didn't raise the count, rather than expecting zero.
- **The service worker is disabled in dev** (`vite.config.ts` → `devOptions.enabled: false`),
  so PWA/offline behavior only appears in a production `build` + `preview`. Good — avoids
  stale-asset confusion while iterating.
- Minimum env to boot: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Admin/groomer
  logins work with the checked-in default passwords if the `VITE_*_PASS_*` vars are unset.
- The customer portal OTP flow needs a real Supabase project with phone auth + the
  `send-otp-whatsapp` function deployed (or swap Auth → Phone provider to a Twilio test
  number for dev — the portal code is provider-agnostic).

## Repository layout

```
/
├── index.html                     main SPA entry
├── dog-grooming-in-pune/          generated static locality pages — COMMITTED to git (not ignored)
├── cat-grooming-in-pune/          generated static locality pages, cat variant — COMMITTED
├── dist/                          build output — GITIGNORED, disposable
├── public/                        favicons, PWA manifests (site/admin/groomer), images, lottie, sounds
├── templates/location-template.html   reference-only scaffold (generators inline their own template; this isn't read at build)
├── scripts/                       SEO page generators (run via tsx / npm scripts)
├── db/                            ad hoc one-shot SQL — NOT the versioned migration set (e.g. historical bulk inserts already run on prod; do not re-run)
├── src/
│   ├── App.tsx                    all routes (BrowserRouter), lazy-loaded pages
│   ├── main.tsx                   React root; calls bootApplyForActiveSession() before paint
│   ├── components/                marketing sections + shared dashboard chrome (MobileTopBar, SideDrawer, NotificationsPanel, PWAInstallGate, SessionChat, …)
│   ├── data/                      static SEO content (locationData.ts, catLocationData.ts, registries) — NOT DB-backed; consumed by vite.config.ts to build page entries
│   ├── entries/                   JS entry islands for the generated static HTML pages
│   ├── lib/                       supabase.ts, notifications.ts, userSettings.ts, lottieAssets.ts
│   └── pages/
│       ├── admin/                 coordinator/admin dashboard — largest module. SessionFormModal.tsx (~3.3k lines) is the biggest file in the repo
│       ├── groomer/               groomer dashboard
│       ├── portal/                customer self-service portal ("Phase 4")
│       └── calendar/              shared SniffyDatePicker + calendar utils + leavesApi
├── supabase/
│   ├── migrations/                35 SQL files, chronological, idempotent (IF [NOT] EXISTS throughout)
│   └── functions/                 send-otp-whatsapp/, parse-booking-screenshot/
└── vite.config.ts                 dynamic multi-page Rollup config (see Build)
```

Generated pages under `dog-grooming-in-pune/` and `cat-grooming-in-pune/` are **committed
to git** (regenerated by `npm run generate-all` — so running it produces a diff). `dist/`
is the only build output that is gitignored.

## Routing & navigation

All routes live in `src/App.tsx` under one `<BrowserRouter>` + top-level
`<Suspense fallback={null}>`; everything except above-the-fold home components is lazy.
SPA routes: `/`, `/how-it-works`, `/why-sniffy`, `/contact`, `/faqs`, `/blogs`,
`/blogs/:slug`, `/about`, `/groomer-onboarding`, `/dog-grooming-in-pune/:slug`
(`LocationPageWrapper`, looks up `LOCATION_REGISTRY[slug]`), `/admin`, `/groomer`,
`/account`, and `*` (NotFound, must stay last).

- **No cat-grooming `:slug` SPA route** — cat locality pages exist only as generated static HTML.
- **No router-level auth guard.** `/admin`, `/groomer`, `/account` render their gate
  component (`AdminLoginGate` / `GroomerLoginGate` / portal gate) *inside* the page when
  no session exists. Access control is entirely client-side.
- **Dashboard tabs are hash-routed, not real routes.** `AdminDashboard.tsx` and
  `GroomerDashboard.tsx` hold the active tab in `useState(readTabFromHash())` and mirror
  it to `window.location.hash` (`/admin#sessions`). First mount uses `replaceState`;
  later switches use `pushState` so the Android/PWA back button walks tab history. A
  `hashchange` listener syncs back/forward. Admin has 16 tab ids (`VALID_TABS` in
  `AdminDashboard.tsx:68`); groomer has 8 (`GroomerDashboard.tsx:53`). Unknown hash → `overview`.
- **Mobile vs desktop chrome diverge in the same component** via `className="sm:hidden"` /
  `"hidden sm:block"`: mobile = `MobileTopBar` + bottom tab bar + `SideDrawer`; desktop =
  purple hero + horizontal tab nav. **Change both when touching dashboard chrome.**

## Auth model (two separate systems — read carefully)

**Admin / Coordinator / Viewer / Groomer** all authenticate through
`src/pages/admin/authStore.ts` — a hardcoded `USERS[]` array matched by username+password.
`loginUser()` routes the session to a localStorage key by role (`sniffy_admin_user` vs
`sniffy_groomer_user`), 90-day TTL. Role helpers: `canDelete` (admin only), `canWrite`
(admin+coordinator), `canManageGroomers` (admin only). **The DB does not enforce any of
this** — RLS is permissive; the React UI is the only gate.

Actual `USERS[]` roster (verified in `authStore.ts`, subject to change):
- `Jitendra` — admin. `Nikita` — coordinator (password env var is `VITE_PASS_PRIYA`, kept
  for backward-compat). A `Sidharth` viewer entry exists but is **commented out**.
- Groomers `Hemant`, `Rakesh`, `Sidharth` live here too (role `'groomer'`) with real
  `groomer_id` **UUIDs** that must match `groomers.id` in Supabase. Note `Rakesh` currently
  reuses `VITE_GROOMER_PASS_HEMANT` for his password override (likely a copy-paste bug).

**`src/pages/groomer/groomerAuthStore.ts` (`GROOMERS[]`, `groomerLogin()`) is effectively
dead code.** `groomerLogin` has zero callers — the shared `SniffyLoginGate` calls
`admin/authStore.loginUser(..., 'groomer')` for *both* portals. `GroomerDashboard` only
imports `getGroomerSession`/`groomerLogout` from it (which read/clear the shared
`sniffy_groomer_user` key). So the `Ravi`/`Priya` entries with `'groomer-1'`/`'groomer-2'`
ids in that file are **not** how anyone logs in. Don't trust them as the source of truth.

**Customer portal** uses real Supabase Auth (phone OTP via WhatsApp). `current_customer_id()`
maps `auth.uid()` → `customers.id` and backs every customer-scoped RLS policy. Invariant:
**customers are only ever minted from a logged `grooming_sessions` row** (via the
`upsert_customer_from_session` trigger) — never from a booking or a portal signup. A phone
with no session history is bounced at the portal with "no account on file" (intentional,
prevents ghost accounts).

## Data model

Conventions: uuid PKs (`gen_random_uuid()`), `timestamptz` for time, idempotent migrations,
`normalize_phone()` is the canonical phone normalizer — **mirrored in TS at
`src/pages/admin/customerTypes.ts:normalizePhone`; keep the two in sync.** Two tables —
`grooming_sessions` and `groomers` — **predate the migrations folder** and are only ever
`ALTER`ed, never `CREATE`d, in `supabase/migrations/`.

Core tables: `bookings` (leads), `grooming_sessions` (central operational record),
`customers` (phone-deduped; `lifecycle_stage` new→active→lapsed→churned), `pets`
(soft-deleted via `is_active=false`), `session_pets` (M:N), `groomers`,
`groomer_applications`, `groomer_leaves` (statuses incl. `lwp` = leave without pay),
`groomer_documents`, `archive_bookings` (immutable JSON snapshot written before any
session hard-delete), `notification_reads`, `customer_notes_history`, `outreach_templates`,
`outreach_log`, and `expenses` (coordinator expense tracker; in migrations but absent from the .docx).

### Central-table column facts (verified against the live DB, 2026-07-10)

Live DB = **26 tables + 5 views** (`admin_dashboard_kpis`, `customers_with_recency`,
`customer_referral_balance`, `customer_gift_card_balance`, `pet_next_vaccination_due`).
The reconstructed columns matched the live schema except where noted here:

**`grooming_sessions`** (63 columns) — differs from `types.ts` in ways that bite:
- **`groomer_id` is `uuid`** (FK-by-value to `groomers.id`). See landmine #4 for the cross-table type mismatch.
- **`scheduled_time` is `time without time zone`**, not text. PostgREST returns it as `"HH:MM:SS"`, so the app's `.split(':')`/`.slice(0,5)` string handling happens to work — but it is not a text column.
- **No `source_type` and no `booking_amount_expr` column** exist, even though `types.ts` `GroomingSession` declares both. Treat them as client-only/stale — selecting or writing them against `grooming_sessions` will error. Classify sources with `isExternalSource(source)`.
- `external_source_name` (text) stores the free-text partner name for external/`other` sources (undocumented).
- Statuses are plain `text` (not pg enums) but **enforced by CHECK constraints** on the table — `source`, `status`, `arrival_bonus_status`/`review_claim_status`, `payment_mode`, `payment_collected_by`, `pet_type`, `completion_method`, plus 1–5 range checks on `client_rating`/`review_claim_rating`. Adding an enum value in `types.ts` requires widening the matching CHECK (see landmine #10). Defaults: `status`→`'lead'`, `*_status`→`'none'`, `payment_collected_by`→`'sniffy'`.

**`bookings`** — the column is **`pet_type`** (snake_case; `types.ts`'s `Booking` type and both .docx wrongly say `petType`), plus undocumented **`location`** (text) and **`is_converted`** (bool NOT NULL) columns.

**`groomer_compensation`** / **`payroll_entries`** show ordinal-position gaps — confirming the three per-dog / per-cat / per-session-flat incentive columns were dropped by `20260603120000` (incentive SSOT).

**Post-doc additions** (in migrations + code, absent from both .docx):

| Feature | Migration | UI wiring | Notes |
|---|---|---|---|
| Referrals | `20260527000000` | portal + admin (`CustomerPortalWallet`, `CustomerDetailModal`) | `referral_credits` ledger; auto-earn on referee's 1st completed session. `redeem_referral_credit()` RPC has **no caller yet**. |
| Pet birthdays | `20260527000000` | admin `PetEditCard` only | `pets.dob` activated; `pet_birthday:N` outreach rule |
| Gift cards | `20260528000000_gift_cards` | admin `GiftCardsTab` + portal wallet | `redeem_gift_card_partial()` RPC has **no caller yet** |
| Payroll/HRMS | `20260528000000_phase6_payroll` (+ `20260601` uuid/text fix, `20260603120000` incentive rewrite) | admin `PayrollTab`, `salarySlipPdf.ts` | per-run snapshots; client-side jsPDF slips |
| Session change requests | `20260528010000` | portal `CustomerPortalSessions` + admin `ChangeRequestsSection` | customers request reschedule/cancel; coordinator approves |
| Vaccinations | `20260528020000` | admin `VaccinationsEditor` only (**no portal UI**) | `vaccine_due:N` outreach rule |
| Session chat | `20260604100000_session_messages` | all three surfaces (`components/SessionChat.tsx`) | **Supabase Realtime** (the one realtime feature); append-only |
| My List (personal reminders) | `20260816120000_admin_todos` | admin `TodoListCard.tsx` on Overview + notification bell | `admin_todos` scoped by `owner_key` = `AdminUser.id`; repeats are materialised on tick; quick-add parses "6pm"/"tomorrow"/"every sat" |

## RLS & the anon-role pattern (important for new tables)

Because admin/groomer surfaces have **no Supabase Auth session**, every PostgREST/RPC call
from them runs as the Postgres **`anon`** role. Multiple migrations exist solely to widen
policies from `TO authenticated` to `TO anon` (`20260522010000`, `20260525000010`,
`20260529000000`). **If you add an admin-writable table, grant its write policies to `anon`
too or admin writes will fail with 42501.** Known unpatched gap: `referral_settings` /
`referral_credits` are still `authenticated`-only — flag if an admin referral write ever fails.

## Integrations

- **`send-otp-whatsapp`** (`supabase/functions/`) — Supabase Send-SMS Hook; verifies
  `Webhook-Signature` HMAC (`SEND_SMS_HOOK_SECRET`) then dispatches the 6-digit OTP via
  AiSensy WhatsApp Campaign API v2. Fails loudly (500) if config is missing.
- **`parse-booking-screenshot`** — "Screenshot Fill" in the admin Add-Session modal.
  Google Gemini `gemini-2.5-flash` (fallback `gemini-2.5-flash-lite`) with retry/backoff;
  ≤6 MB image; returns `{ ok, data }` with only fields it could extract. `GEMINI_API_KEY`
  stays server-side.
- **Telegram bot** — `VITE_TELEGRAM_BOT_TOKEN` / `VITE_TELEGRAM_CHAT_ID`, called **directly
  from the browser** in `components/BookingWizard.tsx` and `pages/ContactPage.tsx` to post
  new bookings/contact submissions to a Telegram chat. **Not in either doc.** (An older,
  commented-out `BookingModal.tsx` instead invokes a `booking-telegram` edge function that
  does not exist in this repo.)
- **Google Maps** — no API key; `gps_location` just stores a shared-location URL the
  groomer's Navigate button opens.
- **pg_cron** — one job `sniffy_daily_outreach` (`30 2 * * *` UTC / 08:00 IST) runs
  `run_daily_outreach()` (recompute lifecycles → enqueue outreach). Must be enabled manually
  in a fresh project or it silently never fires. Outreach is **click-to-send** (`wa.me`), not
  auto-dispatched — a human taps Send.

## Business rules (verified in code)

- **Packages** (`types.ts` `PACKAGES`): Spa Bath ₹799, Hair Cut ₹999, Spa Bath+Hair Cut ₹1299.
  **Add-ons** (`ADD_ONS`): Tick & Flea ₹149; Medicated Bath / Destressing / Hygiene / Deworming ₹299 each.
- **Vendor commission** (`EXTERNAL_SOURCE_FEE_RULE`): Woofly = compound 20% + 1% of the
  remaining 80% (≈20.8%); Paw Space / Oh My Pet / Global Pet = flat 30%; `other` = manual.
- **Incentives are defined once in `src/pages/groomer/incentivesApi.ts`** — do not inline the
  numbers elsewhere. On-time bonus `ON_TIME_BONUS = ₹25`, review bonus `REVIEW_BONUS = ₹40`.
  On-time window is **`scheduled − 30 min` to `scheduled + 15 min`** (`EARLY_ARRIVAL_WINDOW_MINUTES=30`,
  `LATE_ARRIVAL_WINDOW_MINUTES=15`) — early arrivals count (the docs' "+15 only" is outdated).
  Canonical eligibility: on-time = `groomer_on_time === true`; review = `review_taken && client_rating === 5`.
  A DB trigger (`trg_sync_incentive_canonical`) syncs these from claim approve/reject; a
  coordinator override in `SessionFormModal` always wins.
- **Payment status** is derived, not stored (`paymentStatusOf`): `unpaid` → `collected`
  (`payment_collected_at` set) → `paid` (`payment_verified === true`).
- **Follow-up cadence** (`NEXT_DUE_OPTIONS`): 14/30/45/60/90/120/150/180 days; drives
  `next_due_date` and the `follow_up_due` outreach rule.
- **Session status**: `lead → scheduled → groomer_assigned → grooming_done → completed`
  (or `cancelled`). **`grooming_done`** (added 2026-08-15, migrations `20260815000000` +
  `20260816000000`) means *the pet was groomed but the money is not settled* — vendor
  hasn't paid out, or cash is still with the groomer. It exists because those rows used
  to sit at `groomer_assigned`, and every "upcoming" count in the app is written as
  `status IN ('scheduled','groomer_assigned')` with **no date test** — so finished work
  was counted as upcoming forever. `completed` remains the terminal, reconciled state:
  nothing downgrades it and no view re-buckets it.
  - Set automatically by `markCompleted()` (`groomer/sessionMilestonesApi.ts`) via a
    second `.in('status', ['scheduled','groomer_assigned'])`-guarded UPDATE, so it can
    never clobber a row the coordinator just completed. Coordinators can also set it by
    hand (Status dropdown / tap-cycle) when a groomer forgets.
  - Display names differ by width: `STATUS_LABELS` → "Grooming Done";
    `CARD_STATUS_LABELS` (SessionsTab) → **"Groomed"**; customer portal shows it as
    "completed" (our reconciliation isn't the customer's concern). Colour is orange
    everywhere — green stays reserved for `completed`.
  - Rule of thumb when touching a call site: **work-done** counts include it
    (payroll, incentives, follow-ups, customer aggregates, vendor reconciliation,
    groomer stats); **money-settled** totals do not (revenue, Sniffy net, the
    per-source financial rows); **upcoming/in-flight** counts must exclude it.
  - Deliberately *not* included: the referral-credit trigger (`20260527000000`) still
    fires only on the transition into `completed`.
- **Completion**: auto 4-digit `completion_code` per session; groomer marks complete by code
  match or photo fallback (`completion_method`). Code is never shown to groomers.
- Prefer the **`isExternalSource(source)`** helper over reading `source_type` — historical
  rows have inconsistent `source_type`.

## Notifications system (`src/lib/notifications.ts`)

`useAdminNotifications(userId)` / `useGroomerNotifications(groomerId)`. **60s poll +
window-focus refresh — not realtime.** Read-state is DB-backed (`notification_reads`,
keyed `admin.<id>` / `groomer.<id>`) with a localStorage cache for instant cold render;
dead read-rows are GC'd on refresh. Closing the panel does **not** mark items read.

- **Admin feed** ids: `arrival-<id>`, `review-<id>`, `followups-due` (bundled),
  `booking-<id>` (last 24h), **`leave-<id>`** (pending groomer leave → routes to `calendar`).
  (The docs put leave notifications on the groomer feed — that's wrong; they're admin-side.)
- **Groomer feed** ids: `assigned-<id>` (new in 24h), `today-<id>` (today, not arrived),
  `payment-<id>` (complete, unpaid), `arrival-outcome-<id>`, `review-outcome-<id>`.

## Environment variables

Frontend (`.env`, `VITE_`-prefixed, read via `import.meta.env`):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TELEGRAM_BOT_TOKEN`,
`VITE_TELEGRAM_CHAT_ID`, per-user password overrides `VITE_PASS_JITENDRA`,
`VITE_PASS_SIDHARTH`, `VITE_PASS_PRIYA` (Nikita), `VITE_GROOMER_PASS_HEMANT`,
`VITE_GROOMER_PASS_RAVI`, `VITE_GROOMER_PASS_PRIYA`, `VITE_GROOMER_PASS_SIDHARTH`, and
build-metadata `VITE_APP_VERSION` / `VITE_COMMIT_SHA`. `VITE_ADMIN_PASSWORD` is present in
`.env` but **referenced nowhere in `src/`** — dead/legacy. (There is no `.env.example`.)

Edge Function secrets (`supabase secrets set`): `SEND_SMS_HOOK_SECRET`, `AISENSY_API_KEY`,
`AISENSY_CAMPAIGN_NAME`, `AISENSY_USER_NAME`, `GEMINI_API_KEY`.

## Build & deploy

```bash
npm run generate-all      # regenerate all static locality pages (when locations/breeds change)
npm run build             # vite build → dist/
npm run generate-sitemap  # writes dist/sitemap.xml — must run AFTER build
npm run deploy            # generate-all && build && generate-sitemap && preview (local sanity)
```

`vite.config.ts` builds Rollup multi-page `input` entries dynamically from `ALL_PUNE_CITIES`
/ `ALL_CAT_PUNE_CITIES`, so each locality HTML is its own entry (static, no SPA). Vendor
code is split into `vendor-react/router/motion/icons/lottie/supabase` chunks; target
`es2020/chrome87/safari14`; `lucide-react` excluded from pre-bundle for tree-shaking. The SW
precaches the SPA shell but `globIgnores` the locality dirs. `.htaccess` + `robots.txt`
handle clean-URL rewriting (strip `.html`) and canonicalization.

Supabase deploy: `supabase db push`, `supabase functions deploy send-otp-whatsapp`,
`supabase functions deploy parse-booking-screenshot`, enable pg_cron, register the Send-SMS Hook.

## Gotchas & landmines

1. **Groomer identity must be resolved via `resolveGroomerId(authed)`, never `authed.id`.**
   `authed.id` is the `USERS[]` entry id (`'g1'`/`'g2'`/`'g3'`); the DB keys everything on the
   `groomers.id` **UUID**, and `grooming_sessions.groomer_id` is `uuid` — so querying it with
   `'g1'` errors in PostgREST. This had broken the groomer notification bell (**fixed
   2026-07-10** — `GroomerDashboard.tsx:257` now passes `resolveGroomerId(authed)`). Use the
   same helper for any new groomer-scoped query. Not yet exercised against a live groomer login.
2. **`groomerAuthStore.ts` is dead** (see Auth model). The docs' advice to "keep `USERS[]`
   and `GROOMERS[]` in sync" is obsolete — only `USERS[]` matters. Add groomers there
   (role `'groomer'` + real `groomers.id` UUID) *and* insert the `groomers` row.
3. **`MIN_SESSION_DURATION_MINUTES = 0`** in `incentivesApi.ts` — a testing value; the
   comment says "Bump back to 15 before shipping." It currently lets a groomer mark complete
   immediately after arrival. Confirm the intended production value before touching this flow.
4. **`groomer_id` type is inconsistent across tables (verified live).**
   `grooming_sessions.groomer_id` and `groomers.id` are **`uuid`**; but `groomer_leaves`,
   `groomer_documents`, `groomer_compensation`, and `payroll_entries` store `groomer_id` as
   **`text`**. Any SQL joining sessions to the HR/leave tables must cast — exactly what broke
   payroll (fix migration `20260601000000` adds `::text`). (The dev doc's claim that
   "grooming_sessions.groomer_id is text" is wrong.)
5. **Two tables aren't in migrations** (`grooming_sessions`, `groomers`) — their columns are
   the union of the pre-migration baseline + all later `ALTER`s. Don't expect a `CREATE`.
6. **`normalize_phone` exists twice** (SQL + `customerTypes.ts`) — changing one requires the other.
7. **No tests, no CI** — validate changes by running the app.
8. **Schema-ready-but-unwired**: `redeem_referral_credit()` and `redeem_gift_card_partial()`
   have no UI callers; vaccinations have no customer-portal view.
9. **The live groomer dashboard is `src/pages/GroomerDashboard.tsx`** (what `App.tsx` imports) —
   edit that one. (A stale orphan copy at `src/pages/groomer/GroomerDashboard.tsx` was deleted
   2026-07-10; it was imported nowhere and had broken relative imports.)
10. **DB CHECK constraints drift from the TS enums.** Allowed values for `grooming_sessions`
    `source`, `status`, `arrival_bonus_status`/`review_claim_status`, `payment_mode`,
    `payment_collected_by`, `pet_type`, `completion_method` are enforced by CHECK constraints
    on the **pre-migration baseline table** (not in any migration file), and nothing keeps them
    in sync with the unions in `types.ts`. This bit `source`: `grooming_sessions_source_check`
    was missing `'global_pet'` even though the app shows a Global Pet pill, so selecting it made
    every INSERT fail while typing it into *Other* (`source='other'`) worked — fixed 2026-07-10
    (`20260710000000_fix_source_check_add_global_pet.sql`). **When you add a value to
    `SessionStatus`/`InternalSource`/`ExternalSource`/`BonusStatus`/etc., ship a migration that
    widens the matching CHECK too.**

## Doc drift (where the .docx files are wrong/outdated)

- Docs stop at Phase 4; code has Phases 5–6 + gift cards + vaccinations + session chat.
- On-time window is −30/+15 min, not "+15 only."
- Leave notifications are on the **admin** feed, not the groomer feed.
- `groomerAuthStore` `GROOMERS[]` (Ravi/Priya) is dead code, not an active roster.
- Telegram booking notifications aren't mentioned anywhere in the docs.
- Migration count is 35 (docs say 18).
- `bookings.pet_type` is snake_case, not `petType`; `bookings` also has undocumented `location` + `is_converted` columns.
- `grooming_sessions.groomer_id` is `uuid` (dev doc says text); `scheduled_time` is `time` (types.ts types it as a text string).
- `grooming_sessions` has no `source_type` or `booking_amount_expr` column despite `types.ts` declaring both.
- The live DB has 5 views incl. `admin_dashboard_kpis` (a KPI rollup) that no doc mentions.

## Where things live (common bug areas)

- Add/edit a session, screenshot-fill, multi-pet → `admin/SessionFormModal.tsx` (huge)
- Session list/filters → `admin/SessionsTab.tsx`; calendar → `admin/AdminCalendarTab.tsx`
- Customer master/merge/notes → `admin/CustomersTab.tsx`, `CustomerDetailModal.tsx`, `CustomerMergeModal.tsx`
- Groomer day flow (arrive/complete/pay/review) → `groomer/SessionActionPanel.tsx` + the Mark*/Collect* modals; rules in `groomer/incentivesApi.ts`, writes in `groomer/sessionMilestonesApi.ts`
- Payroll → `admin/PayrollTab.tsx` + `payrollApi.ts` + `salarySlipPdf.ts`
- Outreach → `admin/OutreachTab.tsx` (+ DB engine in `20260525000000_phase3_outreach.sql`)
- Notifications → `lib/notifications.ts`; shared chrome → `components/{MobileTopBar,SideDrawer,NotificationsPanel,PWAInstallGate}.tsx`
- Public booking → `components/BookingWizard.tsx`; SEO pages → `scripts/generate*.ts` + `src/data/*` + `src/entries/*`

## Likely next steps

- Reconcile the groomer-id inconsistency (gotcha #1) and restore `MIN_SESSION_DURATION_MINUTES` (#3).
- Wire the two unused redeem RPCs into the session-payment flow.
- Patch `referral_settings`/`referral_credits` anon-write RLS if admin referral writes fail.
- Decide on customer-portal vaccination visibility.
- Regenerate the Word docs, or treat this file as the source of truth.
