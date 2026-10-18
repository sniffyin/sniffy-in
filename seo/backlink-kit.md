# Sniffy — Backlink & Citation Kit

Execution kit for building sniffy.in's link profile. Everything here is
self-service or outreach — no purchased links, ever (see "Do not do" at the end).

Order matters. Tier 0 before Tier 1, Tier 1 before Tier 2.

---

## 1. Canonical NAP — lock this exactly

Every listing must use these **character-for-character identical** values. NAP
inconsistency is the single most common reason citation work produces nothing:
Google can't confidently merge listings into one entity if the details drift.

```
Name:     Sniffy
Phone:    +91 89713 13003
Email:    care@sniffy.in
Website:  https://sniffy.in
Type:     Service-area business (at-home / mobile) — NO storefront address
City:     Pune, Maharashtra, India
Hours:    Mon–Sun, 09:00–21:00 IST
```

**Never enter a street address.** You travel to customers. Directories that force
a street field: use the service-area option if offered; if not, skip that directory.
A fake or borrowed storefront address risks GBP suspension.

Service areas to declare (matches `areaServed` in the generated pages):
Shivajinagar, Baner, Aundh, Kothrud, Wakad, Hinjewadi, Kharadi, Viman Nagar,
Koregaon Park, Hadapsar, Kalyani Nagar, Pimpri-Chinchwad, Magarpatta, NIBM,
Wanowrie, Katraj, Bavdhan, Dhanori, Yerawada, Pimple Saudagar.

### Categories (use consistently)
- Primary: **Pet Groomer**
- Secondary: Pet Care Service, Mobile Pet Grooming, Dog Trainer (only if true)

---

## 2. Business descriptions — copy-paste by length

**40 chars**
```
At-home dog & cat grooming in Pune
```

**80 chars**
```
Certified groomers visit your home in Pune for full dog & cat grooming.
```

**160 chars** (most common directory limit)
```
Sniffy sends certified groomers to your home in Pune for complete dog and cat
grooming — bath, haircut, nail trim, ear cleaning. No salon, no travel stress.
```

**300 chars**
```
Sniffy is an at-home pet grooming service in Pune. Our certified groomers travel
to you with portable, fully sanitised equipment and complete the session in one
visit — spa bath, haircut, nail trimming, ear cleaning, de-shedding and more.
Your pet stays calm in familiar surroundings. Packages from Rs 799.
```

**750 chars** (GBP "from the business", Justdial long description)
```
Sniffy is an at-home dog and cat grooming service operating across Pune. Instead
of you driving your pet to a salon and waiting, a certified Sniffy groomer comes
to your home with everything needed for a complete session — professional dryers,
sanitised clippers and brushes, and skin-safe shampoos.

Every session covers bathing, brushing, coat conditioning, nail clipping, ear
cleaning and a sanitary trim, with optional haircuts and add-ons like tick and
flea treatment, medicated baths or de-shedding. We groom all breeds and sizes,
and wherever possible we assign the same groomer to repeat customers so your pet
builds familiarity and stays relaxed.

Packages start at Rs 799. We serve Shivajinagar, Baner, Aundh, Kothrud, Wakad,
Kharadi, Viman Nagar, Koregaon Park and 25+ other Pune localities. Book on
sniffy.in or call +91 89713 13003.
```

---

## 3. Tier 0 — highest value, do these first (~3 hours total)

These are worth more than every other item on this page combined. Most pass
little or no link equity (they're `nofollow`), but they are the **entity and NAP
signals that drive the map pack** — which renders above all organic results.

| # | Platform | What to do | Time |
|---|---|---|---|
| 0.1 | **Google Business Profile** (already exists) | Fill every field. Add all 20 service areas. Add services with prices. Upload 20+ real session photos. Write the 750-char description. Enable messaging. | 60 min |
| 0.2 | **GBP reviews** | The real lever. See §4 below. | ongoing |
| 0.3 | **Bing Places** | Free, imports directly from GBP in one click. | 10 min |
| 0.4 | **Apple Business Connect** | Free. Puts you in Apple Maps + Siri. Heavily underused in India. | 20 min |
| 0.5 | **Justdial** | Claim/create a free listing. They'll rank for the head terms regardless — be inside their results. Expect aggressive upsell calls; the free tier is fine. | 30 min |
| 0.6 | **Sulekha** | Genuine service-intent traffic in India, free listing indexes fast. | 20 min |

---

## 4. GBP reviews — the actual priority

Justdial shows `4.4 ★ (33,319)` in the SERP. You show no stars, because
self-asserted `AggregateRating` on your own `LocalBusiness` schema is ignored by
Google for rich results (policy since Sept 2019). The only stars that will ever
appear next to you come from **Google reviews on your GBP**.

You already have `qrcode` in the dependency tree and a review-claim flow in the
groomer app (`REVIEW_BONUS = Rs 40`, `review_taken && client_rating === 5`).

**Action:** point that flow at your GBP review link, not an internal form:
```
https://g.page/r/CdJR67bjxy_gEBI/review
```
Groomer shows the QR at session completion, while the customer is happy and the
pet looks great. That moment is worth more than any directory submission.

Target: 40–60 genuine reviews. At that volume you become competitive in the
Shivajinagar / Baner / Kothrud map packs.

> Never incentivise a *positive* review or gate by rating — both violate Google's
> policy and risk removal of all reviews. Paying the Rs 40 bonus to the **groomer**
> for *obtaining a review* is fine; paying the **customer** for a 5-star is not.

---

## 5. Tier 1 — relevant directories (~2 hours)

Skip the "125 free listing sites" blog lists. Most are dead, spammy, or B2B and
will do nothing for a consumer home service. These are the ones worth the time:

- **Yelp India** — free, decent authority
- **Asklaila** — Indian local directory, Pune coverage
- **Grotal** — Indian local directory
- **Hotfrog India** — free listing
- **IndiaMART / TradeIndia / ExportersIndia** — **SKIP**. B2B wholesale
  marketplaces. Wrong audience, wrong intent, no value for a consumer service.

Do these once, correctly, with the exact NAP above. Then stop — there is no
return in submission #30.

---

## 6. Tier 2 — the links that actually move authority

Directory citations help the map pack but barely move organic rankings. These do,
because they're editorial links from real, topically-relevant local sites.

### 6a. Veterinary clinic partnerships (highest value)
Pune vet clinics have aged local domains and real topical relevance. A "Grooming"
or "Partners" page link from one is worth more than 50 directory listings.

Target ~15 clinics across Baner, Aundh, Kothrud, Koregaon Park, Viman Nagar,
Kharadi. Offer something real — a referral commission, or free grooming for
clinic staff pets.

**Email template:**
```
Subject: Grooming referrals for [Clinic Name] clients?

Hi Dr. [Name],

I run Sniffy, an at-home dog and cat grooming service in Pune — our groomers
travel to the customer's home, so pets never have to be transported or left
somewhere unfamiliar.

We get asked for vet recommendations constantly, and I'd rather send those to a
clinic I trust than to a search result. I'd like to refer our [locality] clients
to you.

If it's useful in return, we're happy to handle grooming for clients you'd rather
not have bathing a post-op or anxious pet at home themselves. Some clinics list us
on their site as a grooming partner — entirely up to you.

Happy to come by and introduce myself properly.

Jitendra
Sniffy · +91 89713 13003 · sniffy.in
```

### 6b. Housing societies / RWAs
Large Pune societies (Amanora, Magarpatta, Blue Ridge, Life Republic, Nyati) run
resident portals, WhatsApp groups and newsletters — several have vendor pages
that are publicly indexed.

**Offer:** a society grooming day — discounted slots for a block of bookings on
one Saturday. In exchange, a listing on their resident vendor page.

### 6c. Pune pet community
- Pune pet-parent Facebook groups and subreddits — participate genuinely; drop
  links only where they answer a real question. Spammed links get you banned and
  do nothing.
- Local pet shops, boarding facilities, dog trainers — non-competing, same
  customer. Straight reciprocal referral.
- Pune animal shelters / rescues (RESQ, Blue Cross) — offer free grooming for
  adoptable animals. Genuine goodwill, and shelters routinely credit partners.

### 6d. Digital PR
The strongest single link you could earn: pitch a Pune-local outlet (Pune Mirror,
Hindustan Times Pune, Sakal Times, local lifestyle blogs) a **data story** from
your own booking data — "What Pune's dog owners spend on grooming", seasonal
demand around monsoon and Ganpati, most-groomed breeds by locality. You have this
data in `grooming_sessions` and nobody else does. Journalists link to original
data.

---

## 7. On-site: expand `sameAs`

This is the one link-adjacent thing that lives on *your* site and is fully in
your control. `sameAs` tells Google which profiles are the same entity,
consolidating trust signals across them.

Currently only 2 entries (Instagram + GBP). Once Tier 0/1 profiles exist, add
their URLs to the `sameAs` array in the page generator so all ~60 locality pages
emit them:

```
src/data/locationData.ts  /  src/data/catLocationData.ts
scripts/generate*.ts
```

Add: Justdial listing URL, Sulekha URL, Yelp URL, Facebook page, YouTube channel,
LinkedIn company page — every profile you actually own and keep current.

---

## 8. Do NOT do

- **Buy backlinks.** Fiverr/Upwork "500 backlinks", PBN packages, "high DA guest
  post" sellers. Google neutralises them; at worst you earn a manual action. For a
  domain with your current (near-zero) trust profile, a sudden junk-link spike is
  the exact footprint that gets sites buried.
- **Blog comment / forum signature spam.** Dead since ~2012, all `nofollow`.
- **Reciprocal link farms**, "link exchange" schemes.
- **Fake or borrowed street addresses** to qualify for storefront directories.
  Risks GBP suspension — losing the map pack would cost more than every link here.
- **Automated submission tools.** They produce inconsistent NAP at scale, which
  actively damages the entity consolidation you're trying to build.

---

## 9. Realistic timeline

| Window | Expected |
|---|---|
| Weeks 1–2 | Tier 0 + Tier 1 complete. Review collection running on every session. |
| Weeks 3–8 | 20–40 GBP reviews. Map pack movement in your strongest localities. |
| Months 3–6 | Map pack presence for several localities. 5–15 genuine editorial links. |
| Months 6–12 | Organic positions improve on long-tail "at home" terms. |

Beating justdial.com in **organic** for the generic head term
("pet grooming in Shivaji Nagar") is a multi-year authority project and probably
not worth the spend. Winning the **map pack** above it is achievable this quarter.
Spend accordingly.
