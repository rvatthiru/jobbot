import { RawJob } from './jobFetchers';

export interface NormalizedJob {
  source: string;
  sourceJobId: string;
  company: string;
  title: string;
  url: string;
  location: string;
  remote: boolean;
  postedAt: Date | null;
}

// Keywords that indicate a job is remote-friendly
const REMOTE_KEYWORDS = ['remote', 'distributed', 'anywhere', 'virtual', 'home-based'];

// Target job titles we're looking for
const RELEVANT_TITLES = [
  'data analyst',
  'bi analyst',
  'business intelligence',
  'bi engineer',
  'analytics engineer',
  'data engineer',
  'data scientist',
];

/**
 * Check if a job title matches our target positions (case-insensitive partial match)
 */
function isRelevantTitle(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return RELEVANT_TITLES.some((keyword) => lowerTitle.includes(keyword));
}

/**
 * Detect if a job is remote based on location string
 */
function isRemote(location: string): boolean {
  const lowerLocation = location.toLowerCase();
  return REMOTE_KEYWORDS.some((keyword) => lowerLocation.includes(keyword));
}

/**
 * Extract the best available date from a raw job
 * Priority: posted_at > updated_at > created_at
 */
function extractDate(job: RawJob): Date | null {
  // Check posted_at first
  if (job.posted_at) {
    const date = new Date(job.posted_at);
    if (!isNaN(date.getTime())) return date;
  }

  // Fallback to updated_at
  if (job.updated_at) {
    const date = new Date(job.updated_at);
    if (!isNaN(date.getTime())) return date;
  }

  // Fallback to updatedAt (different casing in some APIs)
  if (job.updatedAt) {
    const date = new Date(job.updatedAt);
    if (!isNaN(date.getTime())) return date;
  }

  // Fallback to created_at
  if (job.created_at) {
    const date = new Date(job.created_at);
    if (!isNaN(date.getTime())) return date;
  }

  // Fallback to createdAt
  if (job.createdAt) {
    const date = new Date(job.createdAt);
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}

/**
 * Get the job URL from various possible fields
 */
function getJobUrl(job: RawJob): string {
  if (job.absolute_url) return job.absolute_url;
  if (job.hostedUrl) return job.hostedUrl;
  if (job.applyUrl) return job.applyUrl;
  return '';
}

/**
 * Normalize a raw job to our database schema
 */
export function normalizeJob(job: RawJob, source: string, company: string): NormalizedJob | null {
  // Get the job URL
  const url = getJobUrl(job);
  if (!url) {
    console.warn(`[${source}] Job ${job.id} missing URL`);
    return null;
  }

  // Check title relevance
  if (!isRelevantTitle(job.title)) {
    return null;
  }

  // Detect remote status
  const remote = isRemote(job.location);

  // Extract posting date
  const postedAt = extractDate(job);

  return {
    source,
    sourceJobId: String(job.id),
    company,
    title: job.title.trim(),
    url,
    location: job.location.trim(),
    remote,
    postedAt,
  };
}

/**
 * Filter and normalize jobs
 */
export function processJobs(
  jobs: RawJob[],
  source: string,
  company: string,
  applyDateFilter: boolean = true
): NormalizedJob[] {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const normalized = jobs
    .map((job) => normalizeJob(job, source, company))
    .filter((job): job is NormalizedJob => job !== null);

  // Apply date filter only if requested
  if (applyDateFilter) {
    return normalized.filter((job) => {
      // Keep all jobs without dates (they're undated)
      if (!job.postedAt) return true;
      // Filter out jobs older than 14 days
      return job.postedAt >= fourteenDaysAgo;
    });
  }

  return normalized;
}
