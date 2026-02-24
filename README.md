# CrowdAndCritic 🎬

**The definitive movie ranking** — combining critic scores, audience ratings, canonical list appearances, longevity, and cultural impact into one honest composite score.

Live URL: [crowdandcritic.com](https://crowdandcritic.com)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, TypeScript, Tailwind CSS) |
| Database | Supabase (Postgres + RLS) |
| Hosting | Vercel |
| Data Sources | OMDB API, TMDB API (future) |

---

## Ranking Formula

```
Composite = (critic × 0.30) + (audience × 0.25) + (canon × 0.25) + (longevity × 0.10) + (popularity × 0.10)
```

- **Critic Score (30%)** — avg(RT Tomatometer, Metacritic), normalized 0–100
- **Audience Score (25%)** — avg(IMDb × 10, RT Audience, Metacritic User), normalized 0–100
- **Canon Score (25%)** — appearances on AFI, Sight & Sound, Empire, TSPDT lists; scaled 0–100
- **Longevity Bonus (10%)** — `min((year_age / 100), 1.0) × avg_score`
- **Popularity Weight (10%)** — `log10(imdb_votes) / log10(max_votes) × 100`

---

## Getting Started (Local Dev)

### 1. Clone and install

```bash
cd /home/brand79/.openclaw/workspace/crowdandcritic
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials (already filled in)
```

### 3. Set up the database

Go to your [Supabase SQL Editor](https://supabase.com/dashboard/project/rlnkmresgszqiyaamcfp/sql) and run the contents of `supabase/schema.sql`.

Or use the Supabase CLI:
```bash
npx supabase db push
```

### 4. Seed the database

The seed script inserts 25+ classic films with real scores:

```bash
# Option A: use env vars already in .env.local
npm run seed

# Option B: with service role key for full write access
SUPABASE_SERVICE_ROLE_KEY=your_key_here npm run seed
```

> **Note:** The seed script uses the anon key by default. If you get RLS errors, you need the service role key from your Supabase dashboard: Settings → API → service_role key.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B: GitHub + Vercel Dashboard

1. Push this repo to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial CrowdAndCritic MVP"
   git remote add origin https://github.com/yourusername/crowdandcritic
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → Import Project → select your repo

3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://rlnkmresgszqiyaamcfp.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key

4. Deploy!

### Connect your domain

1. In Vercel dashboard → your project → Settings → Domains
2. Add `crowdandcritic.com` and `www.crowdandcritic.com`
3. Update your DNS records at your registrar:
   - `A` record: `@` → `76.76.21.21` (Vercel IP)
   - `CNAME` record: `www` → `cname.vercel-dns.com`

---

## Project Structure

```
crowdandcritic/
├── app/
│   ├── components/
│   │   ├── FilterBar.tsx       # Genre + sort filters
│   │   ├── MovieCard.tsx       # Individual movie row
│   │   ├── MovieListClient.tsx # Client-side filtered list
│   │   └── RankingBar.tsx      # Score visualization bars
│   ├── movie/
│   │   └── [id]/
│   │       └── page.tsx        # Movie detail page
│   ├── globals.css
│   ├── layout.tsx              # Root layout + nav
│   ├── not-found.tsx
│   └── page.tsx                # Homepage (top 100 ranking)
├── lib/
│   ├── scoring.ts              # Composite score formula
│   └── supabase.ts             # DB client + types + queries
├── scripts/
│   └── seed.ts                 # Seed script (25+ films)
├── supabase/
│   └── schema.sql              # Database schema
├── public/
│   └── placeholder-poster.svg
├── .env.local                  # Your actual env vars (gitignored)
├── .env.local.example          # Template
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Adding More Movies

Edit `scripts/seed.ts` and add entries to the `SEED_MOVIES` array following the existing pattern, then re-run:

```bash
npm run seed
```

For automated data fetching, get free API keys:
- **OMDB**: https://www.omdbapi.com/apikey.aspx
- **TMDB**: https://developer.themoviedb.org/docs/getting-started

Then set `OMDB_API_KEY` and `TMDB_API_KEY` in `.env.local`.

---

## Roadmap

- [ ] Admin panel for adding/editing movies
- [ ] Automated score fetching from OMDB/TMDB
- [ ] User accounts + watchlists
- [ ] "Best of decade" filtered views
- [ ] Email newsletter ("Movie of the Week")
- [ ] Affiliate revenue via Amazon links
- [ ] JustWatch streaming availability integration

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed only | For write access during seeding |
| `OMDB_API_KEY` | Future | OMDB API for score fetching |
| `TMDB_API_KEY` | Future | TMDB API for poster/metadata |

---

Built with ❤️ by Brandon using Next.js 14, Supabase, and Vercel.
