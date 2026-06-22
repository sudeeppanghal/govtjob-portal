# Automated Indian Government Jobs & Yojana Portal

A fully automated, AI-powered notifications website for Indian Government Jobs (Sarkari Exam), Results, Admit Cards, Answer Keys, Scholarships, and Sarkari Yojanas. 

The system runs a scraper backend every 10 minutes to discover new official releases, downloads notice PDFs, parses details via Gemini AI (with regex-based template fallbacks), generates SEO-optimized articles and JSON-LD schemas, and updates a dynamic Next.js App Router frontend hosted on Vercel.

---

## Technical Stack
* **Frontend**: Next.js (App Router, React 19, TypeScript)
* **Styling**: Tailwind CSS (Premium Dark Slate Theme)
* **Backend Automation**: Python 3.10+, BeautifulSoup4, pdfplumber
* **AI Processing**: Google Gemini 1.5 Flash (Free Tier API)
* **Database & Auth**: Supabase PostgreSQL
* **Hosting**: Vercel & GitHub Actions

---

## Repository Structure

```
govtjob/
├── .github/
│   └── workflows/
│       ├── scrape_every_10_min.yml       # Triggers scrapers every 10 minutes
│       └── daily_freshness_check.yml       # Daily check for admit card/result updates
├── database/
│   └── schema.sql                          # Supabase PostgreSQL tables & RLS policies
├── scrapers/
│   ├── requirements.txt                    # Python dependencies
│   ├── config.py                           # Supabase and Gemini configurations
│   ├── pdf_parser.py                       # PDF downloader & text extractor
│   ├── gemini_extractor.py                 # Gemini AI article generator & structured JSON
│   ├── fallback_generator.py               # Heuristic backup template generator
│   ├── freshness.py                        # Scans active notifications for admit cards/results
│   ├── main.py                             # Main crawler execution pipeline
│   ├── test_scraper.py                     # Local test harness script
│   └── sources/
│       ├── __init__.py
│       └── crawlers.py                     # Modules for UPSC, SSC, IBPS, RRB, etc.
└── frontend/                               # Next.js Application
    ├── app/                                # Pages (Home, Detail pages, Admin console)
    │   ├── api/og/route.tsx                # Dynamic social thumbnail generator (ImageResponse)
    │   ├── feed.xml/route.ts               # Dynamic RSS Feed handler
    │   └── sitemap.xml/route.ts            # Dynamic Sitemap XML handler
    ├── components/                         # Layout elements (Navbar, FilterBar, Cards)
    └── lib/
        └── supabase.ts                     # Safe Client connections
```

---

## 1. Supabase Setup (Database)

1. Create a free project on [Supabase](https://supabase.com/).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste the contents of `database/schema.sql` and click **Run**. This will create the `notifications` and `crawls` tables, full-text search indexes, auto-updating triggers, and RLS policies.
4. Go to **Project Settings > API** to find your:
   - `Project API URL`
   - `service_role` key (Required for backend scrapers in GitHub Actions)
   - `anon` key (Required for frontend Next.js queries)

---

## 2. Environment Variables

Create a `.env` file in the `/scrapers` directory for local testing, and configure the same secrets in your GitHub repository and Vercel hosting.

### Scrapers `.env` (Local Testing)
```env
SUPABASE_URL=https://your-supabase-id.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key-never-share-publicly
GEMINI_API_KEY=your-gemini-api-free-tier-key
```

### Next.js Frontend `.env` (Vercel deployment)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-public-key

# Optional (For Admin Panel manual run trigger)
GITHUB_PAT=your-github-personal-access-token
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-github-repo-name
```

---

## 3. Scrapers & Automation Setup

The scraper pipeline is fully automated via GitHub Actions, but you can run and test it locally.

### Local Installation
1. Navigate to the `/scrapers` directory:
   ```bash
   cd scrapers
   ```
2. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the local test harness to verify UPSC crawler, fallback parsing, and Supabase connections:
   ```bash
   python test_scraper.py
   ```
4. Run the full scraper pipeline manually:
   ```bash
   python main.py
   ```

### GitHub Actions Secrets
Configure the following secrets in your GitHub repository (**Settings > Secrets and variables > Actions**):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `GEMINI_API_KEY`

This allows the automated workflows in `.github/workflows/` to run every 10 minutes and daily on the free-tier cloud runners.

---

## 4. Frontend Next.js Setup

1. Navigate to the `/frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the development server locally:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view your premium job portal.
4. Compile the production build:
   ```bash
   npm run build
   ```

---

## Key Platform Features

### Dynamic OG Thumbnail Card Generator (`/api/og`)
The platform features an automated thumbnail generator inspired by popular educational YouTube banners. It reads query parameters directly, pulls data dynamically from Supabase, and uses `@vercel/og` to generate high-fidelity shareable cover images displaying:
- Recruitment Authority (e.g. UPSC, SSC)
- Year Tag (e.g. 2026)
- Major Vacancies in a bold red-gradient capsule (e.g. "17,727 POSTS")
- Eligibility requirements (badges for 10th, 12th, Graduate, B.Tech)
- Application closing dates on a blue alert bar with a stopwatch.

### Fallback Engine
If your Gemini API Key hits the free tier limits (15 RPM / 1500 RPD), the pipeline automatically switches to a regex-based factual extractor that builds grammatically correct, table-structured markdown layouts and JSON-LD schemas programmatically.

### Auto Freshness
The daily script checks active articles, parses source boards for updates, and automatically prepends stylized warning banners (e.g. "UPDATE: Admit Card declared!") to articles and marks them as updated, keeping your users informed.
