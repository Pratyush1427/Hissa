# Hissa

**Back the street stalls you love — and own a piece of their growth.**

Hissa (हिस्सा, "share") lets food lovers in Bengaluru discover and rate street stalls, build a food-critic profile, and back their favourite vendors with revenue share. When a vendor hits a growth milestone, backers unlock food credit and badges.

> Hackathon project. Payments and revenue are simulated.

---

## Users

| Who | Wants | Does |
|---|---|---|
| **Critic / eater** | Great food, recognition for good taste | Rates, reviews, suggests stalls, builds a profile |
| **Backer** (usually the same person) | To be part of a stall's story, plus a return | Backs campaigns, follows updates, earns revenue share and credit |
| **Vendor** | Capital to expand, more customers | Enrolls, runs growth campaigns, posts updates, reports sales |

## Core modules

### 1. Critic profiles (emotional core)
- Profile with ratings, reviews, backed stalls, badges, and an earnings summary
- **Taste score**: rises when stalls you rated or backed early go on to grow
- Follow critics, with a feed of what they eat and back
- Leaderboards for the city and per area (Koramangala, VV Puram, Jayanagar, …)
- Titles like *Early Backer*, *Found It First*, *Dosa Connoisseur*

### 2. Stalls and discovery
- Map plus list of stalls: photos, signature dishes, prices, timings
- Detailed ratings: taste, hygiene, value, vibe
- Two ways in:
  - **Vendor self-enrolls**, then gets a verified badge
  - **Critic suggests**, other critics vouch, and once there are enough vouches it's verified and goes live
- Credit to the critic who suggested it ("Suggested by @…")

### 3. Backing and milestones (engine)
- A vendor posts a **growth campaign**, e.g. "₹60k for a second cart near Indiranagar", with a cost breakdown and milestones
- Backers chip in from ₹500
- **All-or-nothing funding**: if the goal isn't reached, everyone is refunded
- **Milestone-based release**: money sits in escrow and is released to the vendor in tranches as milestones are verified
- **Revenue share**: backers receive a % of sales *growth above a baseline* until a cap (e.g. 1.5× what they put in)
- **Milestone rewards** (food credit and badges):
  - 🎯 Fully funded → ₹100 credit
  - 🛒 Cart / equipment live → ₹200 credit + badge
  - 📈 Revenue +25% → credit + taste-score boost
  - 🏪 Permanent shop → "Founding Backer" plaque on the stall page
- Vendor updates (photos, new dishes, busy days) appear in the backers' feed

## AI features (Claude)

| # | Feature | What it does |
|---|---|---|
| 1 | **Snap-to-list** | Photo of stall + menu board → name, dishes, prices, cuisine. Handles Kannada/Hindi/English and handwritten boards |
| 2 | **Milestone verification** | Vendor's proof photo is checked against the milestone claim → auto-approve or flag for review |
| 3 | **Backer insight card** | Reads ratings trend, reviews, revenue reports and updates → plain-language growth and risk summary per campaign |
| 4 | **Food concierge** | Chat such as "spicy veg under ₹100 near Jayanagar, open now", using tools over our own database (search stalls, reviews, campaigns) |
| 5 | **Campaign co-pilot** | Vendor describes their goal casually → structured campaign with cost breakdown and suggested milestones |
| 6 | **Review intelligence** | "What people say" summary per stall, plus flags for fake or spammy reviews |
| 7 | **Taste persona** | A fun, shareable profile identity built from your history ("Filter-Coffee Purist · Basavanagudi Loyalist") |

All AI calls run server-side (Next.js route handlers) via `@anthropic-ai/sdk` with model `claude-opus-5-5`, using structured outputs validated with Zod.

## Why people hesitate to back, and how Hissa answers

| Concern | Answer |
|---|---|
| "Will the vendor just take the money?" | Escrow + milestone-based release, verified vendors, community vouching, AI-checked milestone proof |
| "Is the revenue reported honestly?" | Revenue share is only on growth above a baseline; UPI QR sales data as the real-world source; AI flags inconsistent reports |
| "What if the goal isn't met or the stall shuts?" | All-or-nothing refunds; unreleased escrow is returned pro-rata if a stall closes |
| "Is it worth my ₹500?" | Food credit means you always get something back; progress, updates and badges make even small backing feel meaningful |
| "When and how do I get paid?" | Transparent dashboard: baseline, current sales, your share, payout history, progress to cap |
| "I can't judge if a stall will grow" | Backer insight card, taste-score of critics who backed it, rating trends |
| "Is this legal / too much hassle?" | Low minimums, UPI-style flow; positioned as community-backed revenue sharing (a real launch needs proper legal structure) |
| "Feels awkward with the vendor" | Vendor opts in and sets the terms; backing is framed as patronage + partnership, not a loan |

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4, as a PWA
- **Supabase**: Postgres, auth, storage (photos), realtime (feeds)
- **Claude API** (`@anthropic-ai/sdk`) for AI features
- **Leaflet** with Stadia Maps "Alidade Smooth" tiles for the map; live food spots from **OpenStreetMap** (Overpass API)
- Dish photos: hand-picked, freely licensed images from **Wikimedia Commons**
- Deploy on **Vercel**

## Data model (draft)

`users` · `stalls` · `ratings` · `reviews` · `suggestions` · `vouches` · `campaigns` · `campaign_milestones` · `backings` · `escrow_releases` · `revenue_reports` · `payouts` · `credits` · `updates` · `badges` · `follows`

## Demo flow

1. A critic discovers a stall on the map and rates it
2. They snap a new stall → AI fills in the listing → others vouch → it goes live
3. A vendor creates a campaign with the AI co-pilot; the critic reads the insight card and backs it
4. Simulated time passes: the vendor uploads proof → AI verifies the milestone → escrow releases, credit and badge unlock
5. The critic's profile shows backed stalls, earnings, taste persona and leaderboard rank

## Demo and Live modes

- **Demo**: a curated sample Bengaluru (stalls, campaigns, a wallet with earnings). Nothing is saved. Works with no setup.
- **Live**: real players sign up with email + password, get ₹10,000 of **play money**, and can rate, suggest, vouch, back campaigns, redeem treats, withdraw earnings and "simulate a month" of revenue share. Everything is saved in Supabase.
- **Vendors** (`/vendor`): claim or add a stall, start growth campaigns, post updates to backers, and accept customers' 6-digit treat codes at the counter.

Once Supabase is configured, Live is the default and a **Demo / Live** switch appears on the home and profile screens.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Turning on Live mode (Supabase, free tier)

1. Create a project at [supabase.com](https://supabase.com) (region: Mumbai).
2. **Authentication → Sign In / Providers → Email**: turn **off** "Confirm email" so players can start instantly.
3. **SQL Editor**: run [`supabase/migrations/0001_hissa.sql`](supabase/migrations/0001_hissa.sql), then [`supabase/seed.sql`](supabase/seed.sql), then [`supabase/migrations/0002_vendors.sql`](supabase/migrations/0002_vendors.sql).
4. **Project Settings → API**: put the Project URL and anon/publishable key in `.env.local`, then restart `npm run dev`.

`supabase/seed.sql` is generated from the demo data: `node scripts/gen-seed.mts`.

### How Live mode keeps money honest

Players can only *read* their own wallet. Every change (backing, rating, suggesting, vouching, withdrawing, redeeming) goes through a Postgres function that checks the rules: play-money balance, campaign still open, credit available, earnings cap, one vouch per player. Row-level security blocks direct writes.
