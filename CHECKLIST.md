# Database Setup Checklist

Use this checklist to verify each step is completed correctly.

## ✅ Step 1: Verify Vercel Environment Variables

**Action:**

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Check each item below:

- [ ] `DATABASE_URL` exists
- [ ] `DATABASE_URL` starts with `postgresql://`
- [ ] `DATABASE_URL` contains `.pooler.supabase.com` (connection pooling)
- [ ] `DATABASE_URL` has `:6543` port (pooling port)
- [ ] `COMPANIES_GREENHOUSE` exists (can be placeholder)
- [ ] `COMPANIES_LEVER` exists (can be placeholder)
- [ ] `COMPANIES_ASHBY` exists (can be placeholder)
- [ ] `CRON_SECRET` exists (can be any string)

**If DATABASE_URL is missing or wrong:**

- See Step 2 below

**Test:**
Visit: `https://your-app.vercel.app/api/debug`

Look for:

- `hasDatabaseUrl: true` ✅
- `databaseUrlPrefix: "postgresql://postgres..."` ✅

If `hasDatabaseUrl: false` → DATABASE_URL is not set in Vercel!

---

## ✅ Step 2: Create/Configure Supabase

**Action:**

1. Go to https://supabase.com
2. Sign in or create account
3. Check if you have a project:

- [ ] I have a Supabase account
- [ ] I have created a project
- [ ] Project shows as "Active" (not paused)

**If you don't have a project:**

1. Click **"New Project"**
2. Name: `job-intel-assistant`
3. Set database password (save it!)
4. Choose region
5. Click **"Create"**
6. Wait 2-3 minutes

**Get Connection String:**

1. Go to **Project Settings** (gear icon)
2. Click **Database**
3. Scroll to **Connection string**
4. Click **Connection pooling** tab
5. Copy the connection string

**Format should be:**

```
postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Important:**

- [ ] Using **Connection pooling** tab (not "URI" tab)
- [ ] Port is `6543` (not 5432)
- [ ] Replace `[PASSWORD]` with actual password

**Test:**
Visit: `https://your-app.vercel.app/api/debug`

Look for:

- `databaseConnection: "CONNECTED"` ✅

If `databaseConnection: "FAILED"` → Check DATABASE_URL format in Vercel!

---

## ✅ Step 3: Create Database Tables

**Action:**

1. In Supabase Dashboard → **SQL Editor** → **New Query**
2. Copy SQL from `setup-database.sql` or paste:

```sql
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

CREATE INDEX IF NOT EXISTS "Job_postedAt_idx" ON "Job"("postedAt");
CREATE INDEX IF NOT EXISTS "Job_ingestedAt_idx" ON "Job"("ingestedAt");
```

3. Click **Run** (or Ctrl+Enter)

**Expected Result:**

- [ ] Shows "Success. No rows returned"
- [ ] No error messages

**Verify Table Exists:**

1. In Supabase → **Table Editor**
2. Look for **"Job"** table in left sidebar
3. Click on it - should show empty table with columns

**Test:**
Visit: `https://your-app.vercel.app/api/debug`

Look for:

- `jobTableExists: true` ✅

If `jobTableExists: false` → Run the SQL again!

---

## ✅ Step 4: Redeploy on Vercel

**Action:**
After setting/changing environment variables:

- [ ] Go to Vercel → **Deployments**
- [ ] Click **⋯** on latest deployment
- [ ] Click **"Redeploy"**
- [ ] Wait for deployment to complete (1-2 minutes)
- [ ] Status shows "Ready" ✅

**OR** trigger redeploy:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## ✅ Step 5: Verify Everything Works

**Test 1: Health Check**
Visit: `https://your-app.vercel.app/api/health`

Expected:

```json
{ "status": "ok", "timestamp": "2025-01-XX..." }
```

- [ ] Returns 200 OK
- [ ] Shows "ok" status

**Test 2: Debug Endpoint**
Visit: `https://your-app.vercel.app/api/debug`

Check these values:

- [ ] `hasDatabaseUrl: true`
- [ ] `databaseConnection: "CONNECTED"`
- [ ] `jobTableExists: true`
- [ ] `jobCount: 0` (or a number)

**Test 3: Jobs API**
Visit: `https://your-app.vercel.app/api/jobs`

Expected:

```json
[]
```

- [ ] Returns empty array `[]`
- [ ] No error message

**Test 4: Home Page**
Visit: `https://your-app.vercel.app`

Expected:

- [ ] Shows "Job & Intel Assistant" header
- [ ] Shows "No jobs found. Jobs are ingested daily at 9 AM PT."
- [ ] No red error box

---

## ❌ Common Issues & Solutions

### Issue: `hasDatabaseUrl: false`

**Problem:** DATABASE_URL not set in Vercel

**Solution:**

1. Follow Step 2 to get connection string
2. Add to Vercel → Settings → Environment Variables
3. Redeploy

---

### Issue: `databaseConnection: "FAILED"`

**Problem:** Can't connect to database

**Possible Causes:**

1. **Wrong connection string format**
   - Make sure you're using Connection pooling (port 6543)
   - Check password is correct (no `[PASSWORD]` placeholder)

2. **Supabase project paused**
   - Go to Supabase dashboard
   - Check if project is "Active"
   - Free tier pauses after inactivity

3. **Special characters in password**
   - URL-encode special chars: `@` → `%40`, `#` → `%23`
   - Or use a simpler password

**Solution:**

1. Verify DATABASE_URL in Vercel
2. Test connection in Supabase SQL Editor (run `SELECT NOW();`)
3. Update DATABASE_URL if needed
4. Redeploy

---

### Issue: `jobTableExists: false`

**Problem:** Database table doesn't exist

**Solution:**

1. Go to Supabase → SQL Editor
2. Run SQL from Step 3
3. Verify in Table Editor that "Job" table exists

---

### Issue: Still seeing error on homepage

**Problem:** Old deployment or cache

**Solution:**

1. Clear browser cache (Ctrl+Shift+Delete)
2. Redeploy on Vercel
3. Check Vercel function logs:
   - Deployments → Latest → Functions → `/api/jobs` → Logs

---

## 🎉 Success Indicators

When everything is working, you should see:

✅ Debug endpoint shows all green:

- `hasDatabaseUrl: true`
- `databaseConnection: "CONNECTED"`
- `jobTableExists: true`
- `jobCount: 0` (or number)

✅ Homepage shows:

- No error message
- "No jobs found" in table

✅ Jobs API returns:

- Empty array `[]` (if no jobs yet)
- Or array of job objects

---

## Next Steps After Database is Working

1. **Add real company slugs** to environment variables
2. **Test ingestion:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/ingest \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
3. **Jobs will appear** after ingestion runs
4. **Automatic ingestion** runs daily at 9 AM PT via cron

---

## Need Help?

1. Check `/api/debug` endpoint for detailed diagnostics
2. Check Vercel function logs for error messages
3. Review `FIX_DATABASE.md` for detailed instructions
4. Verify each checkbox above is completed
