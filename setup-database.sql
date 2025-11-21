-- Job Intel Assistant Database Setup Script
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/[YOUR-PROJECT]/sql

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

-- Verify table was created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'Job'
ORDER BY ordinal_position;

