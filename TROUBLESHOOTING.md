# Troubleshooting Guide

## Issue: "Failed to load jobs. Please try again later."

This error typically means the database connection is failing or the database hasn't been set up yet.

### Quick Diagnosis

#### 1. Check Vercel Environment Variables

Go to your Vercel project → Settings → Environment Variables

**Required Variables:**

```
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
COMPANIES_GREENHOUSE=company1,company2
COMPANIES_LEVER=company1,company2
COMPANIES_ASHBY=company1,company2
CRON_SECRET=your-secret-key-here
```

**Critical:** Make sure `DATABASE_URL` is set!

#### 2. Check Vercel Deployment Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Look for build logs and function logs
4. Search for: `DATABASE_URL`, `Prisma`, `error`

**Common Log Errors:**

- ❌ `Can't reach database server` → DATABASE_URL is wrong or database is down
- ❌ `PrismaClient is unable to run` → Prisma client not generated
- ❌ `relation "Job" does not exist` → Database schema not pushed

#### 3. Verify Supabase Setup

Follow the steps in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md):

1. **Create Supabase Project** (if not done)
2. **Get Connection String:**
   - Project Settings → Database → Connection string → Connection pooling
   - Copy the URI format shown
3. **Update DATABASE_URL in Vercel** with that string

#### 4. Push Database Schema

After setting DATABASE_URL, you need to create the tables:

**Option A: Using Prisma Studio (Local)**

```bash
npm run prisma:push
```

**Option B: Using Supabase SQL Editor (Recommended for production)**

Go to Supabase Dashboard → SQL Editor → New Query, then run:

```sql
-- Create Job table
CREATE TABLE IF NOT EXISTS "Job" (
  "id" SERIAL PRIMARY KEY,
  "source" TEXT NOT NULL,
  "sourceJobId" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "remote" BOOLEAN NOT NULL,
  "postedAt" TIMESTAMP,
  "ingestedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Job_source_sourceJobId_key" UNIQUE ("source", "sourceJobId")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Job_postedAt_idx" ON "Job"("postedAt");
CREATE INDEX IF NOT EXISTS "Job_ingestedAt_idx" ON "Job"("ingestedAt");
```

#### 5. Test Database Connection

**Test via Vercel Function Logs:**

Visit: `https://your-app.vercel.app/api/health`

Should return: `{"status":"ok","timestamp":"..."}`

**Test Jobs API:**

```bash
curl https://your-app.vercel.app/api/jobs
```

Expected: `[]` (empty array if no data yet) or an array of jobs

**If you get an error:** Check the Vercel function logs for the actual error message.

### Step-by-Step Fix

If you haven't set up Supabase yet:

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create account → New Project
   - Wait for provisioning (2-3 minutes)

2. **Get Database URL**
   - Project Settings → Database
   - Copy Connection Pooling URI
   - Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

3. **Add to Vercel**
   - Vercel → Your Project → Settings → Environment Variables
   - Add `DATABASE_URL` with the value from step 2
   - Add other required variables (see above)

4. **Create Database Schema**
   - Use Supabase SQL Editor (see Option B above)
   - Or run `npm run prisma:push` locally (requires DATABASE_URL in .env.local)

5. **Trigger Redeploy**
   - Vercel → Deployments → Click "Redeploy" on latest deployment
   - OR push a new commit to trigger auto-deploy

6. **Verify**
   - Visit your site → should show "No jobs found" instead of error
   - Visit `/api/jobs` → should return `[]`

### Manual Ingestion Test

Once the database is working, test ingestion:

```bash
curl -X POST https://your-app.vercel.app/api/ingest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:

```json
{
  "success": true,
  "ingested": 0,
  "failed": [],
  "message": "Ingested 0 jobs"
}
```

If you see `ingested: 0`, that's normal if:

- Company slugs are placeholder values
- Companies have no matching jobs
- All jobs are older than 14 days

### Common Issues

#### Issue: Empty company slugs

**Symptom:** Ingestion returns 0 jobs
**Fix:** Update environment variables with real company slugs

```env
COMPANIES_GREENHOUSE=airbnb,netflix
COMPANIES_LEVER=company1
COMPANIES_ASHBY=company2
```

#### Issue: Authentication failed for database

**Symptom:** Database connection errors in logs
**Fix:**

- Check that password in DATABASE_URL doesn't have special characters
- If it does, URL-encode them (e.g., `@` becomes `%40`)

#### Issue: Prisma client not found

**Symptom:** `Module not found: @prisma/client`
**Fix:** Postinstall script should handle this, but if not:

- Check `package.json` has `"postinstall": "prisma generate"`
- Redeploy on Vercel

#### Issue: Cron job not running

**Symptom:** No jobs ingested automatically
**Fix:**

- Check Vercel → Settings → Cron Jobs
- Verify `/api/ingest` is listed
- Manually trigger via curl (see above)

### Getting Help

If still stuck, check:

1. **Vercel Function Logs:**
   - Dashboard → Your Project → Deployments → Latest → Functions → View Logs

2. **Supabase Dashboard:**
   - Project Settings → Database → Connection Pooling
   - Check if connection is healthy

3. **GitHub Repository:**
   - Compare your code with https://github.com/rvatthiru/jobbot
   - Make sure all files match

### Expected Behavior

✅ **Healthy State:**

- Home page loads with "No jobs found" message
- `/api/health` returns 200 OK
- `/api/jobs` returns `[]` (empty array)
- After ingestion, `/api/jobs` returns job array

❌ **Unhealthy State:**

- Home page shows "Failed to load jobs"
- `/api/health` returns 500 error
- Vercel logs show database connection errors

---

**Most Common Solution:** Set up Supabase database and add DATABASE_URL to Vercel environment variables!
