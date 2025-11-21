# Verify Your Setup - Quick Checklist

**You're seeing: "Database connection issue"**

Let's verify what you've done so far:

## ✅ Have You Done These Steps?

### Step 1: Created Supabase Account & Project?
- [ ] Yes, I have a Supabase account
- [ ] Yes, I created a project called `job-intel-assistant`
- [ ] The project shows as "Active" in Supabase dashboard

**If NO → Go to:** https://supabase.com → Sign up → Create project (takes 5 minutes)

---

### Step 2: Added DATABASE_URL to Vercel?
- [ ] Yes, I went to Vercel → Settings → Environment Variables
- [ ] Yes, I added a variable called `DATABASE_URL`
- [ ] Yes, I pasted the connection string from Supabase

**If NO → Follow these steps:**

1. **Get Connection String:**
   - In Supabase → Settings → Database → Connection string
   - Click **"Connection pooling"** tab (NOT "URI")
   - Copy the connection string

2. **Add to Vercel:**
   - Vercel → Your Project → Settings → Environment Variables
   - Click "Add New"
   - Key: `DATABASE_URL`
   - Value: Paste connection string (REPLACE `[YOUR-PASSWORD]` with actual password!)
   - Save

3. **Redeploy:**
   - Vercel → Deployments → Redeploy latest

**⚠️ IMPORTANT:** Make sure the connection string has your REAL password, not `[YOUR-PASSWORD]` placeholder!

---

### Step 3: Created Database Tables?
- [ ] Yes, I went to Supabase → SQL Editor
- [ ] Yes, I ran the CREATE TABLE SQL
- [ ] Yes, I can see "Job" table in Table Editor

**If NO → Follow these steps:**

1. **Go to Supabase → SQL Editor → New Query**

2. **Copy and paste this SQL:**

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

3. **Click "Run"**

4. **Verify:**
   - Go to Table Editor
   - You should see "Job" table in the list
   - Click on it - should show columns but no rows yet

---

### Step 4: Redeployed After Changes?
- [ ] Yes, I redeployed after adding DATABASE_URL
- [ ] The deployment shows "Ready" in Vercel

**If NO → Do this:**
- Vercel → Deployments → Click ⋯ → Redeploy
- Wait 1-2 minutes

---

## 🔍 Check What's Wrong Right Now

### Option 1: Check Debug Endpoint (Easiest)

Visit your Vercel app URL + `/api/debug`:
```
https://your-app-name.vercel.app/api/debug
```

**What you should see:**
```json
{
  "hasDatabaseUrl": true,
  "databaseConnection": "CONNECTED",
  "jobTableExists": true
}
```

**If you see:**
- `"hasDatabaseUrl": false` → DATABASE_URL not set in Vercel
- `"databaseConnection": "FAILED"` → Connection string is wrong
- `"jobTableExists": false` → Tables not created

### Option 2: Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Go to **Functions** tab
4. Click on `/api/jobs` function
5. Click **Logs** tab
6. Look for error messages

**Common errors:**
- `Environment variable not found: DATABASE_URL` → Not set in Vercel
- `Can't reach database server` → Connection string wrong or database paused
- `relation "Job" does not exist` → Tables not created

---

## 🚨 Most Common Issues

### Issue 1: "I added DATABASE_URL but it's still not working"

**Possible causes:**
1. **Didn't redeploy after adding it**
   - Solution: Redeploy on Vercel

2. **Used wrong environment**
   - Solution: Make sure variable is set for "Production" environment

3. **Connection string has `[PASSWORD]` placeholder**
   - Solution: Replace with actual password

4. **Using wrong connection type**
   - Solution: Must use "Connection pooling" (port 6543), not direct (5432)

### Issue 2: "I created tables but still getting error"

**Possible causes:**
1. **Tables created in wrong database**
   - Solution: Verify you're using the same Supabase project

2. **Table name is wrong**
   - Solution: Must be exactly `"Job"` (with capital J and quotes in SQL)

3. **Didn't wait for deployment**
   - Solution: Wait 1-2 minutes after redeploy

### Issue 3: "Supabase says my project is paused"

**Solution:**
- Go to Supabase dashboard
- Click "Resume" or "Restore"
- Wait for it to become active
- Try again

---

## 📋 Complete Setup Process (If Starting Fresh)

If you haven't done any of this yet, follow in order:

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up (free tier works)
   - Create new project
   - Wait 2-3 minutes

2. **Get Connection String**
   - Settings → Database → Connection string → Connection pooling
   - Copy it

3. **Add to Vercel**
   - Settings → Environment Variables
   - Add `DATABASE_URL` with connection string
   - Replace `[PASSWORD]` with actual password
   - Save

4. **Create Tables**
   - Supabase → SQL Editor
   - Run the CREATE TABLE SQL (see Step 3 above)

5. **Redeploy Vercel**
   - Deployments → Redeploy

6. **Verify**
   - Visit `/api/debug` - should all be true/connected
   - Visit homepage - should show "No jobs found"

---

## ❓ Still Not Working?

**Tell me:**
1. Did you complete all 4 checkboxes above? (Yes/No for each)
2. What does `/api/debug` show? (Visit it and share the output)
3. What do Vercel logs show? (Check Functions → /api/jobs → Logs)

With this info, I can help you fix the exact issue!

