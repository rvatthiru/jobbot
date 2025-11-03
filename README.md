# Job & Intel Assistant

A cloud-hosted Next.js application that automatically fetches, filters, and stores tech job postings from Greenhouse, Lever, and Ashby ATS platforms. Built with TypeScript, Prisma, and Supabase.

## Features

- **Automated Daily Ingestion**: Vercel Cron job runs at 9 AM PT daily
- **Multi-ATS Support**: Fetches from Greenhouse, Lever, and Ashby
- **Smart Filtering**: Keeps only relevant data roles (Data Analyst, BI, Analytics Engineer, etc.)
- **14-Day Recency Filter**: Automatically filters jobs posted within the last 14 days
- **Clean UI**: Responsive table displaying company, title, location, remote status, and posting date
- **Robust Error Handling**: Per-company error isolation to prevent crashes

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL) via Prisma ORM
- **Fetching**: Axios with p-queue for controlled concurrency
- **Styling**: Tailwind CSS
- **Deployment**: Vercel with serverless functions

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd job-intel-assistant
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Create a new project and get your database connection string

4. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and fill in:
   - `DATABASE_URL`: Your Supabase connection string
   - `COMPANIES_GREENHOUSE`: Comma-separated company slugs
   - `COMPANIES_LEVER`: Comma-separated company slugs
   - `COMPANIES_ASHBY`: Comma-separated company slugs
   - `CRON_SECRET`: A secure random string (use `openssl rand -base64 32`)

5. **Initialize the database**

   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

6. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

### API Endpoints

- **GET `/api/jobs?limit=25`**: Fetch latest jobs (default 25, max 100)
- **POST `/api/ingest`**: Manually trigger job ingestion (requires auth header)
- **GET `/api/health`**: Health check endpoint

### Manual Ingestion

To trigger ingestion manually:

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Code Quality

Run linting and formatting:

```bash
npm run lint
npm run format
```

## Deployment to Vercel

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - In Vercel project settings, add all variables from `.env.local`
   - Vercel will auto-detect the cron job from `vercel.json`

4. **Deploy**
   - Vercel will automatically deploy on every push to main
   - The cron job will run at 9 AM PT (5 PM UTC) daily

## Project Structure

```
job-intel-assistant/
├── app/
│   ├── api/
│   │   ├── ingest/route.ts    # Ingestion endpoint
│   │   ├── jobs/route.ts      # Jobs listing endpoint
│   │   └── health/route.ts    # Health check
│   ├── layout.tsx
│   └── page.tsx               # Main UI
├── lib/
│   └── prisma.ts              # Prisma client singleton
├── services/
│   ├── jobFetchers.ts         # ATS-specific fetchers
│   └── jobProcessor.ts        # Filtering & normalization
├── prisma/
│   └── schema.prisma          # Database schema
├── vercel.json                # Cron configuration
└── .env.example               # Environment template
```

## Filtering Logic

### Job Titles

Keeps jobs matching any of:

- Data Analyst
- BI Analyst / Business Intelligence
- BI Engineer
- Analytics Engineer
- Data Engineer
- Data Scientist

### Date Handling

1. Prefers `posted_at` if available
2. Falls back to `updated_at`
3. Falls back to `created_at`
4. If all missing, keeps job but marks as "Unknown" date

Jobs with known dates older than 14 days are filtered out.

### Remote Detection

Automatically detects remote jobs from location keywords: remote, distributed, anywhere, virtual, home-based

## Stage 2 Roadmap

Future enhancements planned:

- Recruiter enrichment
- Wage-level lookup
- Daily email alerts
- Chat UI for job queries

## License

MIT

## Contributing

Issues and PRs welcome!
