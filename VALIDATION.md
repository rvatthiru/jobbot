# Validation Guide

This guide helps you validate that the Job & Intel Assistant is properly set up and working correctly.

## Quick Validation Checklist

### 1. Build Process ✓
```bash
npm run build
```
**Expected:** `✓ Compiled successfully` with no errors

### 2. Linting ✓
```bash
npm run lint
```
**Expected:** No output (no errors or warnings)

### 3. Type Checking ✓
```bash
npx tsc --noEmit
```
**Expected:** No errors

### 4. Code Formatting ✓
```bash
npm run format
```
**Expected:** Files processed (unchanged if already formatted)

### 5. Prisma Client Generation ✓
```bash
npm run prisma:generate
```
**Expected:** `✔ Generated Prisma Client` message

### 6. Project Structure Validation

Verify these files exist:

**Core Files:**
- ✓ `app/page.tsx` - Main UI
- ✓ `app/api/ingest/route.ts` - Ingestion endpoint
- ✓ `app/api/jobs/route.ts` - Jobs API endpoint
- ✓ `app/api/health/route.ts` - Health check
- ✓ `lib/prisma.ts` - Prisma client
- ✓ `services/jobFetchers.ts` - Job fetching logic
- ✓ `services/jobProcessor.ts` - Filtering logic
- ✓ `prisma/schema.prisma` - Database schema
- ✓ `vercel.json` - Cron configuration

**Config Files:**
- ✓ `.env.example` - Environment template
- ✓ `.prettierrc` - Prettier config
- ✓ `.eslintrc.js` or `eslint.config.mjs` - ESLint config
- ✓ `package.json` - Dependencies

**Documentation:**
- ✓ `README.md` - Project documentation
- ✓ `SUPABASE_SETUP.md` - Database setup guide

### 7. API Endpoint Validation

#### Health Check
```bash
curl http://localhost:3000/api/health
```
**Expected:** `{"status":"ok","timestamp":"..."}`

#### Jobs Endpoint
```bash
curl http://localhost:3000/api/jobs?limit=5
```
**Expected:** JSON array of jobs (empty if no data yet)

#### Ingest Endpoint (Manual Trigger)
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer your-cron-secret-here"
```
**Expected:** `{"success":true,"ingested":0,"failed":[]}` (or with actual counts)

### 8. Database Schema Validation

```bash
npx prisma db push
npx prisma studio
```
**Expected:** 
- Schema pushes successfully
- Prisma Studio opens in browser
- Job table visible with correct columns

### 9. Environment Variables Validation

Check `.env.local` has all required variables:
```bash
# Without revealing sensitive values
if (Test-Path .env.local) {
  $envContent = Get-Content .env.local
  Write-Host "Environment file exists with $($envContent.Count) variables"
}
```

**Required Variables:**
- ✓ `DATABASE_URL`
- ✓ `COMPANIES_GREENHOUSE`
- ✓ `COMPANIES_LEVER`
- ✓ `COMPANIES_ASHBY`
- ✓ `CRON_SECRET`

### 10. UI Validation

Start dev server:
```bash
npm run dev
```

Visit `http://localhost:3000` and check:
- ✓ Page loads without errors
- ✓ Table renders (even if empty)
- ✓ Responsive design works
- ✓ Dark mode works (if browser supports it)

### 11. Vercel Deployment Validation

After deploying to Vercel:

1. **Check Build Logs**
   - Go to Vercel dashboard → Deployments
   - Verify build completes successfully

2. **Verify Environment Variables**
   - Settings → Environment Variables
   - All 5 variables should be set

3. **Test Cron Job**
   - Settings → Cron Jobs
   - Verify `/api/ingest` shows "0 17 * * *" schedule
   - Can manually trigger for testing

4. **Test Production Endpoints**
   ```bash
   curl https://your-app.vercel.app/api/health
   curl https://your-app.vercel.app/api/jobs?limit=10
   ```

### 12. Integration Testing (Optional)

Test with real company slugs:

1. Update `.env.local` with actual company slugs
2. Run ingestion:
   ```bash
   npm run dev
   # In another terminal:
   curl -X POST http://localhost:3000/api/ingest \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
3. Check results:
   - Check database has jobs
   - Verify filtering worked
   - Confirm 14-day filter applied

## Common Issues and Solutions

### Issue: Prisma Client not generated
**Solution:** Run `npm run prisma:generate`

### Issue: Build fails with "Cannot find module"
**Solution:** Delete `node_modules` and `.next`, then `npm install`

### Issue: Database connection errors
**Solution:** 
- Verify `.env.local` DATABASE_URL is correct
- Check Supabase project is active
- Ensure connection pooling is enabled

### Issue: Cron job not running on Vercel
**Solution:**
- Verify `vercel.json` is in root directory
- Check Vercel project settings for cron job
- Ensure CRON_SECRET is set in Vercel environment variables

### Issue: API returns unauthorized
**Solution:** Check that Authorization header matches CRON_SECRET exactly

## Performance Checks

### Expected Metrics:
- **Build time:** < 30 seconds
- **Lighthouse score:** > 80
- **API response time:** < 500ms
- **Database queries:** < 100ms per query

### Load Test (Optional):
```bash
# Install apache-bench if available
ab -n 100 -c 10 http://localhost:3000/api/jobs
```

## Security Checks

- ✓ `.env.local` is in `.gitignore`
- ✓ `CRON_SECRET` is long and random
- ✓ No API keys committed to git
- ✓ Database connection uses SSL (Supabase default)
- ✓ Authorization required for `/api/ingest`

## Final Validation Command

Run this comprehensive check:

```bash
# In job-intel-assistant directory
echo "=== Job Intel Assistant Validation ==="
echo "1. Build:" && npm run build 2>&1 | grep -q "Compiled successfully" && echo "✓ PASS" || echo "✗ FAIL"
echo "2. Lint:" && npm run lint 2>&1 | grep -q "error" && echo "✗ FAIL" || echo "✓ PASS"
echo "3. Type Check:" && npx tsc --noEmit 2>&1 | grep -q "error" && echo "✗ FAIL" || echo "✓ PASS"
echo "4. Prisma:" && npm run prisma:generate 2>&1 | grep -q "Generated" && echo "✓ PASS" || echo "✗ FAIL"
echo "=== Validation Complete ==="
```

## Success Criteria

✅ **All validation steps pass**
✅ **No errors in build, lint, or type check**
✅ **All API endpoints respond correctly**
✅ **Database schema is created**
✅ **UI loads and displays data**
✅ **Vercel deployment successful**
✅ **Cron job configured**

---

If all checks pass, your Job & Intel Assistant is ready for production!

