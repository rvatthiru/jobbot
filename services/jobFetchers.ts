import axios from 'axios';

export interface RawJob {
  id: string;
  title: string;
  location: string;
  absolute_url?: string;
  hostedUrl?: string;
  applyUrl?: string;
  updated_at?: string;
  created_at?: string;
  posted_at?: string;
  updatedAt?: string;
  createdAt?: string;
  text?: string; // For normalized location in some APIs
}

/**
 * Fetch jobs from Greenhouse API
 * @param companySlug - Company slug for Greenhouse
 * @returns Array of raw job postings
 */
export async function fetchGreenhouseJobs(companySlug: string): Promise<RawJob[]> {
  try {
    const response = await axios.get(
      `https://boards-api.greenhouse.io/v1/boards/${companySlug}/jobs`,
      {
        headers: {
          Accept: 'application/json',
        },
        timeout: 10000,
      }
    );

    // Greenhouse API returns { jobs: [...] }
    const jobs = response.data?.jobs || [];
    return jobs.map((job: Record<string, unknown>) => {
      const locationObj = job.location as Record<string, unknown> | undefined;
      return {
        id: String(job.id || ''),
        title: String(job.title || ''),
        location: String(locationObj?.name || ''),
        absolute_url: String(job.absolute_url || ''),
        updated_at: String(job.updated_at || ''),
        created_at: String(job.created_at || ''),
      };
    });
  } catch (error) {
    console.error(`[Greenhouse] Error fetching jobs for ${companySlug}:`, error);
    return [];
  }
}

/**
 * Fetch jobs from Lever API
 * @param companySlug - Company slug for Lever
 * @returns Array of raw job postings
 */
export async function fetchLeverJobs(companySlug: string): Promise<RawJob[]> {
  try {
    const response = await axios.get(`https://api.lever.co/v0/postings/${companySlug}`, {
      params: {
        mode: 'json',
      },
      timeout: 10000,
    });

    // Lever API returns an array directly
    const jobs = Array.isArray(response.data) ? response.data : [];
    return jobs.map((job: Record<string, unknown>) => {
      const categories = job.categories as Record<string, unknown> | undefined;
      return {
        id: String(job.id || ''),
        title: String(job.text || ''),
        location: String(categories?.location || ''),
        hostedUrl: String(job.hostedUrl || ''),
        applyUrl: String(job.applyUrl || ''),
        updatedAt: String(job.updatedAt || ''),
        createdAt: String(job.createdAt || ''),
      };
    });
  } catch (error) {
    console.error(`[Lever] Error fetching jobs for ${companySlug}:`, error);
    return [];
  }
}

/**
 * Fetch jobs from Ashby API
 * Note: Ashby uses a different API structure - may require HTML parsing
 * @param companySlug - Company slug for Ashby
 * @returns Array of raw job postings
 */
export async function fetchAshbyJobs(companySlug: string): Promise<RawJob[]> {
  try {
    // Ashby uses GraphQL API
    const response = await axios.post(
      `https://api.ashbyhq.com/postings/public`,
      {
        query: `query($organizationHostedJobsPageName: String!) {
          organizationHostedJobsPage(name: $organizationHostedJobsPageName) {
            jobs {
              id
              title
              location
              applicationUrl
              updatedAt
              createdAt
              publishedAt
            }
          }
        }`,
        variables: {
          organizationHostedJobsPageName: companySlug,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const jobs = response.data?.data?.organizationHostedJobsPage?.jobs || [];
    return jobs.map((job: Record<string, unknown>) => ({
      id: String(job.id || ''),
      title: String(job.title || ''),
      location: String(job.location || ''),
      hostedUrl: String(job.applicationUrl || ''),
      updatedAt: String(job.updatedAt || ''),
      createdAt: String(job.createdAt || ''),
      posted_at: String(job.publishedAt || ''),
    }));
  } catch (error) {
    console.error(`[Ashby] Error fetching jobs for ${companySlug}:`, error);
    return [];
  }
}

/**
 * Fetch all jobs from a specific source and company
 */
export async function fetchJobsFromSource(
  source: 'greenhouse' | 'lever' | 'ashby',
  companySlug: string
): Promise<RawJob[]> {
  switch (source) {
    case 'greenhouse':
      return fetchGreenhouseJobs(companySlug);
    case 'lever':
      return fetchLeverJobs(companySlug);
    case 'ashby':
      return fetchAshbyJobs(companySlug);
    default:
      return [];
  }
}
