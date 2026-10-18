# Sniffy — SEO Growth Roadmap

Companion to `seo/backlink-kit.md` (off-site) — this file covers **on-site
coverage, technical, and competitive gaps**, ordered by expected impact.

Audited 2026-08-10 against the working tree, the built `dist/`, the live site,
and the SERPs. Everything below is a gap — the long list of things already done
well is summarised in §0 so it doesn't get re-recommended.

---

## 0. What is already good (do not redo)

Genuinely above-average technical SEO. For the record:

- 66 locality pages (33 dog + 33 cat) plus 2 species hubs, each with a
  **unique H1**, ~2,900 words of **locality-varied prose**, unique `GeoCoordinates`,
  11 FAQs whose **answers differ per locality** (spot-checked Wakad vs Baner — not
  boilerplate), `FAQPage` + `BreadcrumbList` + `LocalBusiness` + `Service`/`Offer`
  with real prices, dog↔cat cross-links, and related-articles filtered by species.
- All 336 `<img>` on generated pages carry real `alt` text, `width`/`height`,
  `srcset` and correct `loading` (1 eager / 4 lazy).
- SPA routes are **prerendered** with per-route title/description/canonical,
  `BlogPosting` + `BreadcrumbList` schema — no JS needed to crawl them.
- Sitemap with **honest git-derived `lastmod`** per URL (85 URLs), duplicate guard,
  and a build-time throw if a route is missing a source file.
- Clean URLs, 301s off `.html` and trailing slashes, real 404 for missing hashed
  assets, WebP content negotiation, Brotli+gzip, sane cache headers.
- 9 blog posts with species targeting; `sameAs`, `AggregateRating` and prices all
  documented as needing manual sync.
- `seo/backlink-kit.md` already covers GBP, Bing Places, Apple Business Connect,
  Justdial, Sulekha, vet partnerships, RWAs and digital PR — correctly, including
  the "self-asserted AggregateRating earns no stars" point.

The gaps are therefore **not** technical hygiene. They are **coverage, local
proof, and page weight**.

---

## 1. Who you are actually competing with

You named Woofly and Paw Space. Only one of them is a Pune rival.

| Competitor | In Pune? | What they have | Social proof claimed |
|---|---|---|---|
| **Woofly** (`woofly.in`) | **No** — 8 cities (Delhi, Bangalore, Gurugram, Noida, Greater Noida, Hyderabad, Mumbai, Kolkata) + Faridabad. `woofly.in/pune/` **404s**. | 3-way URL split per city: `/pet-grooming/<city>/`, `/dog-grooming/<city>/`, `/cat-grooming/<city>/` + `/city/<city>/`. iOS + Android apps. Client dashboard on a subdomain. | 25,000+ pets, 4.8/5 from 5,000+ |
| **Paw Space** (`pawspace.in`) | **Yes** — `/pet-grooming-in-pune/`, `/cat-grooming-service-pune/` | 9 services × 9 cities. **12 breed pages.** Full weight-banded price table. FAQ schema. Academy, B2B, events pages. Apps. | 4.5 / 1,900 Google reviews; 4.7 / 1,700 on the Pune page; 30,000+ parents; 50K app downloads |
| **ThePetNest** | **Yes** — `/pet-grooming/pune` | Region-grouped Pune areas (Central/West/East/North/South/PCMC), 4-tier price table, **groomer profiles**, video guide, premium membership | **4.9 / 12,000+ reviews**, 200K+ pets |
| Also ranking in Pune | Sploot, Posh Paws, Petsfolio, PatMyPets, PetGroomly, MyFurries, PetBacker | | |
| Aggregators owning the head terms | Sulekha, Justdial, Petofy, IndiaMART | | |

**Where you stand today (spot-checked):**
- ✅ `"dog grooming" Wakad/Baner/Kothrud Pune at home price` → **sniffy.in came back first**, ahead of Woofly, ThePetNest and PetBacker. Your locality strategy is working. (Search-tool ordering, not a verified Google position — confirm in Search Console.)
- ❌ `dog grooming at home Pune best service` → Sniffy **absent**. PawSpace, ThePetNest, Sploot, Sulekha, Petsfolio own it.
- ❌ `cat grooming at home Pune persian lion cut` → Sniffy **absent**. PawSpace's `/cat-grooming-service-pune/` ranks.

Read that as: **you win the long tail, you lose the head and the intent-modified tail.**
That is exactly what the gaps below fix.

---

## 2. Priority 1 — URL/keyword coverage you simply don't have

### 2.1 No species-agnostic hub — `/pet-grooming-in-pune`
Your whole taxonomy is `dog-grooming-in-pune` + `cat-grooming-in-pune`. There is
no URL targeting **"pet grooming in Pune"** / **"pet grooming near me"** — the
highest-volume phrasing. PawSpace (`/pet-grooming-in-pune/`), ThePetNest
(`/pet-grooming/pune`) and Woofly (`/pet-grooming/<city>/`) all own one.

Build one city-level hub page. Content it needs that neither species page has:
combined price table, "dog or cat — what's different", both service lists, and
links down into both locality trees. **Do not** generate 33 locality variants of
it — that would triple-target the same intent and cannibalise.

### 2.2 No breed pages — the single biggest untapped cluster
PawSpace has 12 (`/labrador-retriever/`, `/shih-tzu/`, `/persian-cat/`,
`/indie-cat/`, …). You have **zero**, despite your locality pages already
containing a *"Popular Dog Breeds We Groom in <Locality>"* section — the raw
material exists.

Target ~16 pages, each on coat type → grooming frequency → **Pune climate**
angle → price → book:

*Dogs:* Labrador, Golden Retriever, German Shepherd, Shih Tzu, Pug, Beagle,
Siberian Husky, Pomeranian, Indie/Pariah, Rottweiler, Lhasa Apso, Cocker Spaniel
*Cats:* Persian, Himalayan, Indie, Siamese

These catch "how often to groom a Shih Tzu", "husky grooming price Pune",
"Persian cat matting" — and you already have a blog post on Persian matting and
one on husky shaving to link from.

### 2.3 No add-on / problem-solution pages
You sell 8 add-ons and have **no URL for any of them**. Each is a query:

| Page | Targets |
|---|---|
| Tick & flea treatment for dogs at home in Pune | monsoon spike, ₹149 add-on |
| Dog de-shedding in Pune | already an H2 on locality pages, no page of its own |
| Lion cut for cats in Pune | PawSpace ranks for this; you don't |
| Medicated bath for dogs (fungal/skin) in Pune | high intent, vet-referral traffic |
| Dog nail cutting at home in Pune | cheap, frequent, gateway service |
| Puppy's first grooming session | you have the FAQ content already |
| Senior & anxious pet grooming | genuine differentiator for at-home |
| Deworming during grooming | ₹299 add-on |

### 2.4 No price page
`"dog grooming price in Pune"` / `"pet grooming charges in Pune"` is high-intent
and both Pune rivals publish full tables on their city pages. Your prices live in
JSON-LD and one home-page story section — no dedicated URL. Build
`/pet-grooming-prices-in-pune` with the full package + add-on table, what's
included, and an honest "why we're cheaper than a salon" breakdown. It also
becomes the single page to update when prices change (today: `types.ts`,
`index.html` JSON-LD, `reputation.ts` — three places, per your own CLAUDE.md).

### 2.5 No comparison / listicle page
The `"best pet grooming in Pune"` SERP is owned by Sulekha, Petofy and
IndiaMART directory pages. An honest, genuinely useful *"At-home pet groomers in
Pune, compared (2026)"* — including your competitors, with real prices and real
coverage areas — can outrank a stale directory listing, and it captures the
comparison intent that currently never reaches you.

### 2.6 Locality gaps and spelling variants
33 localities. Missing ones with real search volume:

> Balewadi, Sus, Tathawade, Punawale, Moshi, Chikhali, Akurdi, Nigdi, Chinchwad,
> Bhosari, Sangvi, Pashan, Warje, Erandwane, Deccan, Undri, Pisoli,
> Wadgaon Sheri, Manjri, Keshav Nagar, Sinhagad Road, Vishrantwadi, Kalas,
> Charholi, Talegaon, Chakan, Hinjewadi Phase 1/2/3

**Also verify these existing slugs — an off-by-one-letter slug loses the
exact-match:**

| Your slug | Commonly searched as | Action |
|---|---|---|
| `bibewadi` | **Bibvewadi** (ThePetNest: "Bibwewadi") | verify + 301 alias |
| `mundwa` | **Mundhwa** | verify + 301 alias |
| `hinjewadi` | **Hinjawadi** (ThePetNest uses this) | keep one canonical, cover the other in body copy + 301 alias |
| `khadki` | also **Kirkee** | cover variant in body copy |
| `wanowrie` | also **Wanawadi** | cover variant in body copy |
| `kothrud` | also **Kothrud** | verify against Google Maps spelling |

A URL can only be one spelling — so pick the higher-volume one as canonical,
301 the alias, and mention the variant in the visible copy so the page still
matches the other query.

---

## 3. Priority 2 — local pack and review proof (your weakest signal)

The map pack renders above all organic results. Review volume is the input.

| | Reviews | Rating |
|---|---|---|
| ThePetNest | **12,000+** | 4.9 |
| Woofly | 5,000+ | 4.8 |
| Paw Space | 1,900 Google | 4.5 |
| **Sniffy** | **255 (claimed in schema)** | 5.0 |

`backlink-kit.md` §4 already nails the mechanism (GBP review link + QR at
completion, target 40–60). Beyond that:

1. **Fix the `AggregateRating` duplication.** `5.0 / 255` is emitted **identically
   on all 34 dog + 34 cat locality pages**, each inside its own `LocalBusiness`
   node — 68 separate businesses each claiming the same 255 reviews. It earns no
   rich result (self-asserted, ignored since 2019) and it *is* a structured-data
   quality signal. Keep the rating on the homepage `#petgrooming` node only; on
   locality pages reference the business by `@id` instead of restating it.
2. **A flat 5.0 across 255 reviews reads as curated.** Nothing to fake — just note
   that 4.8–4.9 is more credible than 5.0 once you're marking up real reviews.
3. **GBP fields the kit doesn't mention:** GBP **Products** (one per package, with
   price), GBP **Services**, weekly **GBP Posts**, a **booking link**, and
   **seeded GBP Q&A** using your own FAQ content.
4. **Photo velocity — you have an unfair advantage here.** The groomer app already
   captures completion photos. A weekly consented batch → GBP + Instagram + an
   on-site gallery. Right now your 68 locality pages **reuse the same 5 stock
   photos**; real per-locality session photos would be something no Pune
   competitor at your size has.
5. **Reply to every GBP review naming the locality** ("glad Bruno's session in
   Baner went well") — indexable locality text on your GBP profile.

---

## 4. Priority 3 — the moat nobody else can copy

You run the ops database. `grooming_sessions` has 63 columns including real
ratings, breeds, localities, dates and payment channels. No Pune competitor can
publish what you can:

1. **The Pune Pet Grooming Report** (annual, data-driven): most-groomed breeds by
   locality, the monsoon tick spike, demand around Ganpati, average spend by area.
   This is `backlink-kit.md` §6d's digital-PR pitch — but it's also a permanent
   linkable asset and the thing that earns a Pune Mirror / HT Pune link.
2. **Genuine per-page freshness.** Locality pages that render *"142 sessions
   completed in Baner"* / *"most recent: 3 days ago"* from live data are unique per
   page and actually change. Competitors' area sections are static lists.
3. **Real `Review` schema — legitimately.** Your CLAUDE.md is right that the
   current testimonials are marketing copy and marking them up is a manual-action
   risk. But you *collect* `client_rating` + review text per session. Once real
   verified reviews are displayed on the page, `Review` markup is allowed and is
   how you get stars without depending on GBP alone.
4. **Groomer profile pages.** ThePetNest has "Paw-some Pet Groomers" with
   individual profiles. You have `groomers`, `groomer_documents` and real
   incentive/on-time data — you could publish honest per-groomer pages
   (experience, breeds handled, areas, on-time rate). Strong trust content, and
   an E-E-A-T signal for a YMYL-adjacent service.

---

## 5. Priority 4 — technical fixes found in this audit

| # | Finding | Where | Fix |
|---|---|---|---|
| ~~5.1~~ | ✅ **DONE.** **Soft 404s.** SPA fallback served `index.html` with HTTP **200** for every unknown path; rule 3b only 404'd `/assets/`. So `/dog-grooming-in-pune/typo` → 200 + homepage shell. | `.htaccess` rule 4 | `prerenderSpa.ts` now emits `dist/404.html` (noindex, **no** canonical/`og:url`), `.htaccess` has `ErrorDocument 404 /404.html`, and the SPA fallback is narrowed to `/admin`, `/groomer`, `/account` — the only routes with no static file behind them. Also added to the SW `navigateFallbackDenylist` so an installed PWA doesn't shadow it with the home shell. |
| ~~5.2~~ | ✅ **DONE.** **Meta descriptions up to 245 chars** on locality pages — Google renders ~155–160, so the tail was cut. A `clamp(text, 158)` helper existed but only `prerenderSpa.ts` used it. | `scripts/generate*.ts` | Extracted to `scripts/seoText.ts` and applied in all four generators; longest description across the 68 pages is now 158. The two hub descriptions were rewritten by hand rather than clamped. `SEO_ROUTES` descriptions are **asserted**, not clamped — that module is shared with `useSeo()` at runtime, so clamping one side only would create a head mismatch. |
| 5.3 | **Titles up to 72 chars** (Shivajinagar: 72). | `locationsSEO.ts` / `catLocationsSEO.ts` | Trim the middle phrase to land under ~60. |
| 5.4 | **`og:image` is the logo on all 68 locality pages.** WhatsApp is your main share channel in India; a logo card converts far worse than a dog photo. | generators | Use the locality's hero grooming photo. |
| 5.5 | **No Twitter/X card tags on `index.html`** (locality pages have 3; the SPA shell has 0 — so every prerendered SPA route inherits none). | `index.html` | Add `twitter:card=summary_large_image`, `twitter:title/description/image`. |
| 5.6 | **`<html lang="en">`** — not `en-IN`. Free India signal. | `index.html` + generators | `lang="en-IN"`. |
| ~~5.7~~ | ✅ **DONE.** **Locality pages shipped 1,310 KB of JS for content already in the HTML** — `locationData.js` **319 KB** (all 33 localities to render one), `vendor-lottie` **370 KB**, `vendor-supabase` 171 KB, plus `BookingWizard`, `supabase`, `locationRegistry`. | `src/entries/*`, `src/pages/LocationPage.tsx`, `PunePage.tsx`, `CatPunePage.tsx` | **1,310 KB → 446 KB (−66%).** Two changes: (a) the generators now inline **this** locality's data as `<script type="application/json">` and the entries read it instead of importing `LOCATION_REGISTRY`, so `locationData`/`locationRegistry` leave the browser bundle — costs ~12 KB of JSON per page, **856 bytes** after Brotli, because the prose already appears in the visible HTML; (b) `BookingWizard` is `lazy()` + mounted on first open, so lottie and Supabase load on click. The hubs also stopped importing `ALL_PUNE_CITIES` via the `locationData` re-export. `LocationRoute.tsx` keeps the registry — it's the lazy client-navigation path, so only SPA visitors pay for it. |
| 5.8 | **No image sitemap**, and the same 5 images are reused across all 68 pages. | `scripts/generate-sitemap.ts` | Add `<image:image>` entries once per-locality photos exist. |
| 5.9 | **`public/sitemap.xml` is a 1-URL stub.** Harmless in the current deploy order (the generator overwrites it in `dist/`), but a bare `npm run build` ships a sitemap containing only the homepage. | `public/sitemap.xml` | Delete the stub, or fold `generate-sitemap` into `build`. |
| 5.10 | **No sitemap index.** Fine at 85 URLs; once §2 lands you'll be at 200+. | | Split into locality / breed / service / blog sitemaps under an index. |
| 5.11 | **No IndexNow / Bing submission.** Bing feeds Copilot and DuckDuckGo. ~5-minute integration. | `package.json` deploy script | Ping IndexNow with changed URLs post-deploy; verify in Bing Webmaster Tools. |
| 5.12 | **No video anywhere.** ThePetNest has a video guide section. Video results render above organic. | | YouTube Shorts of real sessions ("Persian cat lion cut at home in Pune") + `VideoObject` markup on the matching service/breed page. |
| 5.13 | **Blog is 2 months stale** — newest post is June 2026, and posts carry month-only precision so `dateModified` == `datePublished` forever. | `src/data/blogPosts.ts` | Add a real `updated` field so refreshed posts emit a genuine `dateModified`; ship ~2 posts/month tied to the breed and add-on clusters above. |
| 5.14 | **`sameAs` has only 2 entries** (Instagram, GBP). | `index.html` + generators | Already `backlink-kit.md` §7 — add Facebook, YouTube, LinkedIn, Justdial, Sulekha as they go live. |

---

## 6. Priority 5 — structural bets (decide, don't necessarily do)

1. **Mobile app.** All three competitors ship iOS + Android and advertise it
   prominently; you have a PWA. The ranking value is small, the *trust* value on a
   ₹799–₹1299 in-home service is not. Consider a thin wrapper around the PWA
   purely for store presence.
2. **Adjacent content, not adjacent services.** PawSpace's 9 services × 9 cities
   is hundreds of pages of topical authority feeding its grooming pages. You don't
   need to *offer* boarding or training — but content like "Vets in Pune, by
   area", "Dog parks in Pune", "Pet-friendly cafés in Pune" builds the same
   topical footprint and earns local links.
3. **Decide the multi-city taxonomy now.** Every URL you have is hardcoded
   `*-in-pune`. If Mumbai or Nashik ever happens, the structure has to become
   `/dog-grooming/<city>/<locality>` (Woofly's shape). Migrating 68 pages with
   301s is cheap; migrating 400 is not. Make the call while it's still 68.

---

## 7. Suggested order of work

| Window | Do |
|---|---|
| **Week 1** | ~~§5.1 soft 404s~~ ✅, ~~§5.2 description clamp~~ ✅, ~~§5.7 locality JS weight~~ ✅. Remaining: §5.3 titles, §5.4 og:image, §5.5 Twitter cards, §5.6 `en-IN`, §5.9 sitemap stub, §5.11 IndexNow. All small, all in files you already own. |
| **Week 1–2** | §3 GBP completeness + review QR live on every session (this is the highest-ROI item on the page). §2.6 verify the six slug spellings. |
| **Weeks 2–4** | §2.1 `/pet-grooming-in-pune` hub, §2.4 price page, §5.7 cut locality-page JS weight. |
| **Weeks 4–8** | §2.2 16 breed pages, §2.3 8 add-on pages (reuse the existing generator pattern — this is the same machinery as the locality pages). |
| **Weeks 6–12** | §2.5 comparison page, §4.1 Pune Pet Grooming Report + PR pitch, §4.3 real `Review` markup once verified reviews are displayed. |
| **Ongoing** | 2 blog posts/month feeding the breed + add-on clusters; GBP posts weekly; photo batch weekly; review velocity. |

**One-line summary:** the technical foundation is already better than either
competitor's. What's missing is **breadth of coverage** (breeds, add-ons, the
generic hub, prices), **local proof** (255 vs 12,000 reviews), and **page speed
on the locality pages**. Fix those three and the head terms follow.
