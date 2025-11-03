import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/jobs
 * Returns the latest job postings
 * Query params: limit (default 25, max 100)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');

    let limit = 25; // default
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 100); // cap at 100
      }
    }

    const jobs = await prisma.job.findMany({
      orderBy: [
        { postedAt: 'desc' },
        { ingestedAt: 'desc' }, // Fallback ordering for undated jobs
      ],
      take: limit,
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('[Jobs] Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// Disable caching for this route
export const dynamic = 'force-dynamic';
