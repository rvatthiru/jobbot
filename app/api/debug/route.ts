import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/debug
 * Diagnostic endpoint to check database connection status
 */
export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    databaseUrlPrefix: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.substring(0, 30) + '...'
      : 'NOT SET',
  };

  // Test database connection
  try {
    await prisma.$connect();
    diagnostics.databaseConnection = 'CONNECTED';

    // Try to query the database
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Job'
      );
    `;

    diagnostics.jobTableExists = (tableExists as Array<{ exists: boolean }>)[0]?.exists || false;

    // Try to count jobs
    try {
      const jobCount = await prisma.job.count();
      diagnostics.jobCount = jobCount;
    } catch (countError) {
      diagnostics.jobCount = 'ERROR';
      diagnostics.countError = countError instanceof Error ? countError.message : 'Unknown';
    }
  } catch (connectionError) {
    diagnostics.databaseConnection = 'FAILED';
    diagnostics.connectionError =
      connectionError instanceof Error ? connectionError.message : 'Unknown error';
  } finally {
    try {
      await prisma.$disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }

  // Check other environment variables
  diagnostics.hasCompaniesGreenhouse = !!process.env.COMPANIES_GREENHOUSE;
  diagnostics.hasCompaniesLever = !!process.env.COMPANIES_LEVER;
  diagnostics.hasCompaniesAshby = !!process.env.COMPANIES_ASHBY;
  diagnostics.hasCronSecret = !!process.env.CRON_SECRET;

  return NextResponse.json(diagnostics, {
    status: diagnostics.databaseConnection === 'CONNECTED' ? 200 : 500,
  });
}

export const dynamic = 'force-dynamic';
