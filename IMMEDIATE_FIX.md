# IMMEDIATE FIX - Do These Steps Now

You're seeing: **"Database connection issue. Check DATABASE_URL and ensure database schema is created."**

## 🔍 Step 1: Check What's Wrong (30 seconds)

Visit this URL on your Vercel app:
```
https://your-app.vercel.app/api/debug
```

**Look for these values:**
- `hasDatabaseUrl`: Should be `true` ❌ If `false`, DATABASE_URL is not set!
- `databaseConnection`: Should be `"CONNECTED"` ❌ If `"FAILED"`, connection string is wrong!
- `jobTableExists`: Should be `true` ❌ If `false`, tables haven't been created!

**Tell me what you see** or follow the fixes below based on what's wrong.

---

## 🚨 FIX 1: If `hasDatabaseUrl: false`

**Problem:** DATABASE_URL is not set in Vercel.

### Solution:

#### A. Create Supabase Project (if you don't have one)

1. Go to **https://supabase.com**
2. Click **"Sign Up"** (or login if you have an account)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `job-intel-assistant`
   - **Database Password**: Create a password (SAVE IT!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
5. Click **"Create new project"**
6. **Wait 2-3 minutes** for setup

#### B. Get Connection String

1. In Supabase dashboard, click **⚙️ Settings** (gear icon at bottom left)
2. Click **Database** in the left menu
3. Scroll down to **"Connection string"** section
4. Click the tab that says **"Connection pooling"** (NOT "URI")
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

#### C. Add to Vercel

1. Go to **https://vercel.com/dashboard**
2. Click on your project (`jobbot`)
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Fill in:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the connection string from Supabase
   - **⚠️ IMPORTANT**: Replace `[YOUR-PASSWORD]` with your ACTUAL database password
   - **Environment**: Check all three (Production, Preview, Development)
6. Click **"Save"**

**Example of correct value:**
```
postgresql://postgres.abcdefghijklmnop:MyPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```
*(Notice: No `[PASSWORD]` placeholder - use real password!)*

#### D. Redeploy

1. Go to **Deployments** tab in Vercel
2. Click **⋯** (three dots) on latest deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes

#### E. Verify

Visit `/api/debug` again - `hasDatabaseUrl` should now be `true` ✅

---

## 🚨 FIX 2: If `databaseConnection: "FAILED"`

**Problem:** Can't connect to database (connection string is wrong or database is paused).

### Check These:

1. **Is DATABASE_URL correct?**
   - Should start with `postgresql://postgres.`
   - Should contain `.pooler.supabase.com:6543`
   - Should NOT have `[PASSWORD]` placeholder - use real password!
   - Password might need URL encoding if it has special chars

2. **Is Supabase project active?**
   - Go to Supabase dashboard
   - Check if project shows as "Active"
   - Free tier projects pause after 7 days of inactivity
   - If paused, click "Resume" or "Restore"

3. **Try testing connection:**
   - In Supabase → **SQL Editor** → New Query
   - Run: `SELECT NOW();`
   - Should return current time
   - If this fails, your database is not accessible

### Solution:

1. Double-check DATABASE_URL in Vercel
2. Make sure password is correct (no placeholders)
3. Verify Supabase project is active
4. Update DATABASE_URL if needed
5. Redeploy on Vercel

---

## 🚨 FIX 3: If `jobTableExists: false`

**Problem:** Database tables haven't been created yet.

### Solution:

1. Go to **Supabase Dashboard** → **SQL Editor** → **New Query**

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

-- Create indexes
CREATE INDEX IF NOT EXISTS "Job_postedAt_idx" ON "Job"("postedAt");
CREATE INDEX IF NOT EXISTS "Job_ingestedAt_idx" ON "Job"("ingestedAt");
```

3. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

4. Should see: **"Success. No rows returned"**

5. Verify:
   - Go to **Table Editor** in Supabase
   - You should see **"Job"** table in the list
   - Click on it - should show empty table with columns

6. Visit `/api/debug` again - `jobTableExists` should now be `true` ✅

---

## ✅ Step 2: Verify Everything Works

After fixing the issues above:

1. **Test Debug Endpoint:**
   ```
   https://your-app.vercel.app/api/debug
   ```
   All should be ✅:
   - `hasDatabaseUrl: true`
   - `databaseConnection: "CONNECTED"`
   - `jobTableExists: true`

2. **Test Homepage:**
   ```
   https://your-app.vercel.app
   ```
   Should show:
   - ✅ "No jobs found. Jobs are ingested daily at 9 AM PT."
   - ❌ No red error box

3. **Test Jobs API:**
   ```
   https://your-app.vercel.app/api/jobs
   ```
   Should return:
   ```json
   []
   ```
   (Empty array is correct - means database is connected!)

---

## 🎯 Quick Summary

**If you haven't set up Supabase yet:**
1. Create Supabase account & project (5 min)
2. Get connection string (1 min)
3. Add DATABASE_URL to Vercel (1 min)
4. Create tables using SQL (1 min)
5. Redeploy on Vercel (2 min)

**Total time: ~10 minutes**

**If you already have Supabase:**
1. Check connection string in Supabase
2. Verify it's in Vercel environment variables
3. Create tables if missing
4. Redeploy

---

## ❓ Still Not Working?

1. **Check Vercel Logs:**
   - Vercel Dashboard → Deployments → Latest → Functions → `/api/jobs` → Logs
   - Look for specific error messages

2. **Check Debug Endpoint:**
   - Visit `/api/debug` and share the output

3. **Common Mistakes:**
   - ❌ Using `[PASSWORD]` placeholder instead of real password
   - ❌ Using direct connection (port 5432) instead of pooling (port 6543)
   - ❌ Supabase project is paused/inactive
   - ❌ Tables not created yet

---

## 🎉 Success!

When everything works, you'll see:
- Debug endpoint shows all green ✅
- Homepage shows "No jobs found" (no error)
- Jobs API returns empty array `[]`

Then you can:
1. Add real company slugs to Vercel environment variables
2. Test ingestion manually
3. Wait for daily cron job to run at 9 AM PT

