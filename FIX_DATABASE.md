# Fix Database Connection Issue

You're seeing: **"Database connection issue. Check DATABASE_URL and ensure database schema is created."**

This means one of two things:

1. `DATABASE_URL` is not set in Vercel, OR
2. The database tables haven't been created yet

Follow these steps to fix it:

## Step 1: Check Vercel Environment Variables

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Click on your project (`jobbot`)
3. Go to **Settings** → **Environment Variables**
4. Look for `DATABASE_URL`

**If `DATABASE_URL` is missing:**

### A. Create Supabase Project

1. Go to https://supabase.com
2. Sign up/Login (free tier works)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `job-intel-assistant`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing**: Free tier
5. Click **"Create new project"**
6. Wait 2-3 minutes for provisioning

### B. Get Connection String

1. In Supabase Dashboard, go to **Project Settings** (gear icon)
2. Click **Database** in left sidebar
3. Scroll to **Connection string** section
4. Click on **Connection pooling** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### C. Add to Vercel

1. Back in Vercel → Settings → Environment Variables
2. Click **"Add New"**
3. **Key**: `DATABASE_URL`
4. **Value**: Paste the connection string
5. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password
6. Select environment: **Production**, **Preview**, and **Development** (or just Production)
7. Click **"Save"**

**Example of correct format:**

```
postgresql://postgres.abcdefghijklmnop:MyStrongPassword123!@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## Step 2: Create Database Tables

Now you need to create the `Job` table in Supabase:

### Option A: Using Supabase SQL Editor (Recommended)

1. In Supabase Dashboard → **SQL Editor** → **New Query**
2. Copy and paste this SQL:

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "Job_postedAt_idx" ON "Job"("postedAt");
CREATE INDEX IF NOT EXISTS "Job_ingestedAt_idx" ON "Job"("ingestedAt");
```

3. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
4. You should see: **"Success. No rows returned"**

### Option B: Using Prisma (Local - requires DATABASE_URL in .env.local)

```bash
# Make sure you have .env.local with DATABASE_URL
cd job-intel-assistant
npm run prisma:push
```

## Step 3: Redeploy on Vercel

After setting environment variables, you need to redeploy:

1. Go to Vercel → Your Project → **Deployments**
2. Click the **⋯** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (~1-2 minutes)

**OR** just push a new commit to trigger auto-deploy:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

## Step 4: Verify It's Working

1. Visit your Vercel app URL
2. You should now see:

   ```
   Job & Intel Assistant
   Latest data engineering, analytics, and BI roles

   [Empty table with message:]
   No jobs found. Jobs are ingested daily at 9 AM PT.
   ```

3. Test the API directly:

   ```bash
   curl https://your-app.vercel.app/api/jobs
   ```

   Should return: `[]` (empty array)

4. Test health endpoint:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

## Troubleshooting

### Still seeing error after setting DATABASE_URL?

1. **Check Vercel Function Logs:**
   - Vercel → Deployments → Latest → **Functions** tab
   - Click on `/api/jobs` function
   - Check **Logs** for specific error messages

2. **Verify DATABASE_URL format:**
   - Make sure password doesn't have special characters that need URL encoding
   - Example: `@` should be `%40`, `#` should be `%23`
   - Or use a simpler password without special chars

3. **Test database connection:**
   - In Supabase → **SQL Editor**
   - Run: `SELECT NOW();`
   - Should return current timestamp
   - If this fails, your Supabase project might be paused

4. **Check Supabase project is active:**
   - Go to Supabase Dashboard
   - Make sure project shows as "Active"
   - Free tier projects pause after inactivity

### Error: "relation 'Job' does not exist"

**Solution**: Run the SQL from Step 2 to create the table.

### Error: "Can't reach database server"

**Solutions**:

- Check DATABASE_URL is correct
- Make sure you're using **Connection pooling** URI (port 6543), not direct connection
- Verify Supabase project is active and not paused

### Error: "P1001: Can't reach database server"

**Solution**:

- Check DATABASE_URL
- Verify Supabase project is active
- Try using direct connection URI instead of pooler (port 5432)

## Quick Checklist

- [ ] Created Supabase project
- [ ] Got connection string (Connection pooling tab)
- [ ] Added DATABASE_URL to Vercel environment variables
- [ ] Replaced `[YOUR-PASSWORD]` with actual password
- [ ] Created `Job` table using SQL Editor
- [ ] Redeployed on Vercel
- [ ] Verified app shows "No jobs found" message

Once all checkboxes are done, your database should be connected! 🎉

## Next Steps

After the database is working:

1. Set other environment variables in Vercel:
   - `COMPANIES_GREENHOUSE` (e.g., `airbnb,netflix`)
   - `COMPANIES_LEVER` (e.g., `company1`)
   - `COMPANIES_ASHBY` (e.g., `company2`)
   - `CRON_SECRET` (any random string)

2. Test ingestion:

   ```bash
   curl -X POST https://your-app.vercel.app/api/ingest \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

3. Jobs will appear automatically after the cron job runs at 9 AM PT daily.
