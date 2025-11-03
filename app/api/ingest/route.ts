import { NextRequest, NextResponse } from 'next/server';
import PQueue from 'p-queue';
import { fetchJobsFromSource } from '@/services/jobFetchers';
import { processJobs } from '@/services/jobProcessor';
import { prisma } from '@/lib/prisma';

const queue = new PQueue({ concurrency: 3 });

/**
 * POST /api/ingest
 * Fetches jobs from Greenhouse, Lever, and Ashby APIs and upserts them into the database
 */
export async function POST(request: NextRequest) {
  // Verify authorization header (for cron job security)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const failures: string[] = [];
  let totalIngested = 0;

  try {
    // Parse company slugs from environment variables
    const greenhouseSlugs = (process.env.COMPANIES_GREENHOUSE || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const leverSlugs = (process.env.COMPANIES_LEVER || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const ashbySlugs = (process.env.COMPANIES_ASHBY || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Track all fetch promises
    const fetchPromises: Array<Promise<void>> = [];

    // Fetch from Greenhouse
    for (const slug of greenhouseSlugs) {
      const promise = queue.add(async () => {
        try {
          const rawJobs = await fetchJobsFromSource('greenhouse', slug);
          const normalizedJobs = processJobs(rawJobs, 'greenhouse', slug);

          // Upsert each job
          for (const job of normalizedJobs) {
            try {
              await prisma.job.upsert({
                where: {
                  source_sourceJobId: {
                    source: job.source,
                    sourceJobId: job.sourceJobId,
                  },
                },
                update: {
                  company: job.company,
                  title: job.title,
                  url: job.url,
                  location: job.location,
                  remote: job.remote,
                  postedAt: job.postedAt,
                  ingestedAt: new Date(),
                },
                create: {
                  source: job.source,
                  sourceJobId: job.sourceJobId,
                  company: job.company,
                  title: job.title,
                  url: job.url,
                  location: job.location,
                  remote: job.remote,
                  postedAt: job.postedAt,
                  ingestedAt: new Date(),
                },
              });
              totalIngested++;
            } catch (error) {
              console.error(
                `[Upsert] Error upserting job ${job.sourceJobId} from ${job.source}:`,
                error
              );
              failures.push(`${job.source}/${job.company}/${job.sourceJobId}`);
            }
          }
        } catch (error) {
          console.error(`[Greenhouse] Failed to process ${slug}:`, error);
          failures.push(`greenhouse/${slug}`);
        }
      });
      fetchPromises.push(promise);
    }

    // Fetch from Lever
    for (const slug of leverSlugs) {
      const promise = queue.add(async () => {
        try {
          const rawJobs = await fetchJobsFromSource('lever', slug);
          const normalizedJobs = processJobs(rawJobs, 'lever', slug);

          for (const job of normalizedJobs) {
            try {
              await prisma.job.upsert({
                where: {
                  source_sourceJobId: {
                    source: job.source,
                    sourceJobId: job.sourceJobId,
                  },
                },
                update: {
                  company: job.company,
                  title: job.title,
                  url: job.url,
                  location: job.location,
                  remote: job.remote,
                  postedAt: job.postedAt,
                  ingestedAt: new Date(),
                },
                create: {
                  source: job.source,
                  sourceJobId: job.sourceJobId,
                  company: job.company,
                  title: job.title,
                  url: job.url,
                  location: job.location,
                  remote: job.remote,
                  postedAt: job.postedAt,
                  ingestedAt: new Date(),
                },
              });
              totalIngested++;
            } catch (error) {
              console.error(
                `[Upsert] Error upserting job ${job.sourceJobId} from ${job.source}:`,
                error
              );
              failures.push(`${job.source}/${job.company}/${job.sourceJobId}`);
            }
          }
        } catch (error) {
          console.error(`[Lever] Failed to process ${slug}:`, error);
          failures.push(`lever/${slug}`);
        }
      });
      fetchPromises.push(promise);
    }

    // Fetch from Ashby
    for (const slug of ashbySlugs) {
      const promise = queue.add(async () => {
        try {
          const rawJobs = await fetchJobsFromSource('ashby', slug);
          const normalizedJobs = processJobs(rawJobs, 'ashby', slug);

          for (const job of normalizedJobs) {
            try {
              await prisma.job.upsert({
                where: {
                  source_sourceJobId: {
                    source: job.source,
                    sourceJobId: job.sourceJobId,
                  },
                },
                update: {
                  company: job.company,
                  title: job.title,
                  url: job.url,
                  location: job.location,
                  remote: job.remote,
                  postedAt: job.postedAt,
                  ingestedAt: new Date(),
                },
                create: {
                  source: job.source,
                  sourceJobId: job.sourceJobId,
                  company: job.company,
                  title: job.title,
                  url: job.url,
                  location: job.location,
                  remote: job.remote,
                  postedAt: job.postedAt,
                  ingestedAt: new Date(),
                },
              });
              totalIngested++;
            } catch (error) {
              console.error(
                `[Upsert] Error upserting job ${job.sourceJobId} from ${job.source}:`,
                error
              );
              failures.push(`${job.source}/${job.company}/${job.sourceJobId}`);
            }
          }
        } catch (error) {
          console.error(`[Ashby] Failed to process ${slug}:`, error);
          failures.push(`ashby/${slug}`);
        }
      });
      fetchPromises.push(promise);
    }

    // Wait for all fetch operations to complete
    await Promise.all(fetchPromises);

    return NextResponse.json({
      success: true,
      ingested: totalIngested,
      failed: failures,
      message: `Ingested ${totalIngested} jobs${failures.length > 0 ? `, ${failures.length} failed` : ''}`,
    });
  } catch (error) {
    console.error('[Ingest] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        ingested: totalIngested,
        failed: failures,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Disable caching for this route
export const dynamic = 'force-dynamic';
