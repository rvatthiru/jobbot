# Supabase Setup Instructions

Follow these steps to set up your Supabase database for the Job & Intel Assistant:

## Step 1: Create a Supabase Account

1. Visit [supabase.com](https://supabase.com)
2. Sign up or log in to your account

## Step 2: Create a New Project

1. Click "New Project" from your dashboard
2. Fill in the project details:
   - **Project Name**: `job-intel-assistant` (or your preferred name)
   - **Database Password**: Choose a strong password and **save it securely**
   - **Region**: Select the region closest to your users
   - **Pricing Plan**: Free tier is fine for Stage 1

3. Click "Create new project" and wait for provisioning (2-3 minutes)

## Step 3: Get Database Connection String

1. Once your project is ready, navigate to **Project Settings** (gear icon in sidebar)
2. Go to **Database** section
3. Scroll down to **Connection string**
4. Select the **Connection pooling** tab (recommended for serverless)
5. Copy the **Connection string** in the following format:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

## Step 4: Update Environment Variables

1. Navigate to your project directory
2. Create a `.env.local` file (if it doesn't exist)
3. Add the following:

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
COMPANIES_GREENHOUSE=company1,company2
COMPANIES_LEVER=company1,company2
COMPANIES_ASHBY=company1,company2
CRON_SECRET=your-random-secret-key-here
```

Replace:

- `[YOUR-PASSWORD]` with the database password you created
- `[PROJECT-REF]` with your actual project reference
- `[REGION]` with your region (e.g., us-east-1)
- The company slugs with actual company identifiers
- `CRON_SECRET` with a secure random string (you can use `openssl rand -base64 32`)

## Step 5: Initialize Prisma Database

Run the following command to create the tables in your Supabase database:

```bash
npx prisma db push
```

You should see output like:

```
✅ Your database is now in sync with your Prisma schema
```

## Step 6: Verify Setup (Optional)

You can verify your connection by running:

```bash
npx prisma studio
```

This opens a visual database browser where you can see the `Job` table structure.

## Troubleshooting

**Connection Issues:**

- Make sure you're using the **Connection pooling** URI, not the direct connection
- Verify your password doesn't contain special characters that need URL encoding
- Check that your IP is whitelisted in Supabase settings (if using direct connection)

**Schema Sync Issues:**

- Make sure you're in the project root directory
- Verify your `.env.local` file exists and has the correct `DATABASE_URL`
- Try running `npx prisma generate` first, then `npx prisma db push`

## Next Steps

Once setup is complete, you can:

1. Deploy your app to Vercel
2. Add the same environment variables to Vercel's dashboard
3. The database will be automatically provisioned and ready to use

For more details, see the [Prisma documentation](https://www.prisma.io/docs) and [Supabase documentation](https://supabase.com/docs).
