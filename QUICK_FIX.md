# Quick Fix: "Failed to load jobs" Error

## Immediate Steps to Fix

### Step 1: Check Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`jobbot`)
3. Go to **Settings** → **Environment Variables**
4. Check if `DATABASE_URL` exists

**If `DATABASE_URL` is missing or empty:**

### Step 2: Set Up Supabase (5 minutes)

1. **Create Supabase Account:**
   - Go to https://supabase.com
   - Sign up (free tier works)

2. **Create New Project:**
   - Click "New Project"
   - Name: `job-intel-assistant`
   - Set a database password (save it!)
   - Choose region closest to you
   - Wait 2-3 minutes for provisioning

3. **Get Connection String:**
   - Go to **Project Settings** (gear icon)
   - Click **Database** section
   - Scroll to **Connection string**
   - Select **Connection pooling** tab
   - Copy the URI (looks like):
     ```
     postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```

4. **Add to Vercel:**
   - Back in Vercel → Settings → Environment Variables
   - Click **Add New**
   - Key: `DATABASE_URL`
   - Value: Paste the connection string from step 3
   - Replace `[PASSWORD]` with your actual database password
   - Click **Save**

### Step 3: Create Database Tables

**Option A: Using Supabase SQL Editor (Easiest)**

1. In Supabase Dashboard → **SQL Editor** → **New Query**
2. Paste this SQL:

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

3. Click **Run** (or press Ctrl+Enter)

**Option B: Using Prisma (Local)**

```bash
# In your local project directory
# Make sure .env.local has DATABASE_URL
npm run prisma:push
```

### Step 4: Redeploy on Vercel

1. Go to Vercel → Your Project → **Deployments**
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 5: Verify It Works

1. Visit your Vercel URL
2. You should now see: **"No jobs found. Jobs are ingested daily at 9 AM PT."**
3. This means the database is connected! ✅

### Step 6: Test Ingestion (Optional)

To manually trigger job ingestion:

```bash
curl -X POST https://your-app.vercel.app/api/ingest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Replace `YOUR_CRON_SECRET` with the value from Vercel environment variables.

## Still Not Working?

### Check Vercel Function Logs

1. Vercel Dashboard → Your Project → **Deployments**
2. Click on latest deployment
3. Go to **Functions** tab
4. Click on `/api/jobs` function
5. Check **Logs** for error messages

**Common Errors:**

- ❌ `Can't reach database server` → DATABASE_URL is wrong
- ❌ `relation "Job" does not exist` → Run SQL from Step 3
- ❌ `P1001: Can't reach database` → Check Supabase project is active

### Verify Environment Variables

Make sure ALL these are set in Vercel:

- ✅ `DATABASE_URL` (most important!)
- ✅ `COMPANIES_GREENHOUSE` (can be empty: `company1,company2`)
- ✅ `COMPANIES_LEVER` (can be empty)
- ✅ `COMPANIES_ASHBY` (can be empty)
- ✅ `CRON_SECRET` (any random string)

### Test Database Connection

Visit: `https://your-app.vercel.app/api/health`

Should return: `{"status":"ok","timestamp":"..."}`

If this works but `/api/jobs` doesn't, the issue is with the database schema.

## Summary

**Most Common Fix:**

1. Add `DATABASE_URL` to Vercel environment variables
2. Create tables using SQL in Supabase
3. Redeploy

That's it! 🎉
