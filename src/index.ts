import cheerio from "cheerio";
import axios from "axios";
import randomUseragent from "random-useragent";

// Interfaces
interface IQueryOptions {
  host?: string;
  keyword?: string;
  location?: string;
  dateSincePosted?: 'past month' | 'past week' | '24hr' | '';
  jobType?: 'full time' | 'part time' | 'contract' | 'temporary' | 'volunteer' | 'internship' | '';
  remoteFilter?: 'on-site' | 'remote' | 'hybrid' | '';
  salary?: '40000' | '60000' | '80000' | '100000' | '120000' | '';
  experienceLevel?: 'internship' | 'entry level' | 'associate' | 'senior' | 'director' | 'executive' | '';
  sortBy?: 'recent' | 'relevant' | '';
  limit?: string;
  page?: string;
}

interface IJob {
  position: string;
  company: string;
  location: string;
  date: string;
  salary: string;
  jobUrl: string;
  companyLogo: string;
  agoTime: string;
}

// Utility functions
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// Cache implementation
class JobCache {
  private cache = new Map<string, { data: IJob[]; timestamp: number }>();
  private TTL = 1000 * 60 * 60; // 1 hour

  set(key: string, value: IJob[]): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  get(key: string): IJob[] | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  clear(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }

  get size(): number {
    return this.cache.size;
  }
}

const cache = new JobCache();

class Query {
  private host: string;
  private keyword: string;
  private location: string;
  private dateSincePosted: IQueryOptions['dateSincePosted'];
  private jobType: IQueryOptions['jobType'];
  private remoteFilter: IQueryOptions['remoteFilter'];
  private salary: IQueryOptions['salary'];
  private experienceLevel: IQueryOptions['experienceLevel'];
  private sortBy: IQueryOptions['sortBy'];
  private limit: string;
  private page: string;

  constructor(queryObj: IQueryOptions) {
    this.host = queryObj.host || "www.linkedin.com";
    this.keyword = queryObj.keyword?.trim().replace(/\s+/g, "+") || "";
    this.location = queryObj.location?.trim().replace(/\s+/g, "+") || "";
    this.dateSincePosted = queryObj.dateSincePosted || "";
    this.jobType = queryObj.jobType || "";
    this.remoteFilter = queryObj.remoteFilter || "";
    this.salary = queryObj.salary || "";
    this.experienceLevel = queryObj.experienceLevel || "";
    this.sortBy = queryObj.sortBy || "";
    this.limit = queryObj.limit || "";
    this.page = queryObj.page || "";
  }

  private getDateSincePosted(): string {
    if (!this.dateSincePosted) return "";
    const dateRange = {
      "past month": "r2592000",
      "past week": "r604800",
      "24hr": "r86400",
    };
    return dateRange[this.dateSincePosted] || "";
  }

  private getExperienceLevel(): string {
    if (!this.experienceLevel) return "";
    const experienceRange = {
      internship: "1",
      "entry level": "2",
      associate: "3",
      senior: "4",
      director: "5",
      executive: "6",
    };
    return experienceRange[this.experienceLevel] || "";
  }

  private getJobType(): string {
    if (!this.jobType) return "";
    const jobTypeRange = {
      "full time": "F",
      "part time": "P",
      contract: "C",
      temporary: "T",
      volunteer: "V",
      internship: "I",
    };
    return jobTypeRange[this.jobType] || "";
  }

  private getRemoteFilter(): string {
    if (!this.remoteFilter) return "";
    const remoteFilterRange = {
      "on-site": "1",
      remote: "2",
      hybrid: "3",
    };
    return remoteFilterRange[this.remoteFilter] || "";
  }

  private getSalary(): string {
    if (!this.salary) return "";
    const salaryRange = {
      40000: "1",
      60000: "2",
      80000: "3",
      100000: "4",
      120000: "5",
    };
    return salaryRange[this.salary] || "";
  }

  private getPage(): number {
    return Number(this.page) * 25;
  }

  private getUrl(start: number): string {
    let query = `https://${this.host}/jobs-guest/jobs/api/seeMoreJobPostings/search?`;
    const params = new URLSearchParams();

    if (this.keyword) params.append("keywords", this.keyword);
    if (this.location) params.append("location", this.location);
    if (this.getDateSincePosted().length > 0) params.append("f_TPR", this.getDateSincePosted());
    if (this.getSalary().length > 0) params.append("f_SB2", this.getSalary());
    if (this.getExperienceLevel().length > 0) params.append("f_E", this.getExperienceLevel());
    if (this.getRemoteFilter().length > 0) params.append("f_WT", this.getRemoteFilter());
    if (this.getJobType().length > 0) params.append("f_JT", this.getJobType());
    params.append("start", (start + this.getPage()).toString());
    if (this.sortBy === "recent") params.append("sortBy", "DD");
    else if (this.sortBy === "relevant") params.append("sortBy", "R");

    return query + params.toString();
  }

  private async fetchJobBatch(start: number): Promise<IJob[]> {
    const headers = {
        "User-Agent": randomUseragent.getRandom()!,
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.linkedin.com/jobs",
        "X-Requested-With": "XMLHttpRequest",
        "Connection": "keep-alive",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
    };

    try {
        const response = await axios.get<string>(this.getUrl(start), {
            headers,
            timeout: 10000,
        });
        return this.parseJobList(response.data);
    } catch (error: any) {
        if (error && error.isAxiosError && error.response?.status === 429) {
            throw new Error("Rate limit reached");
        }
        throw error;
    }
  }

  private parseJobList(jobData: string): IJob[] {
    try {
        const $ = cheerio.load(jobData);
        const jobs = $("li");

        return jobs
            .map((_, element): IJob | null => {
                try {
                    const job = $(element);
                    const position = job.find(".base-search-card__title").text().trim();
                    const company = job.find(".base-search-card__subtitle").text().trim();
                    const location = job.find(".job-search-card__location").text().trim();
                    const date = job.find("time").attr("datetime") || "";
                    const salary = job.find(".job-search-card__salary-info").text().trim().replace(/\s+/g, " ");
                    const jobUrl = job.find(".base-card__full-link").attr("href") || "";
                    const companyLogo = job.find(".artdeco-entity-image").attr("data-delayed-url") || "";
                    const agoTime = job.find(".job-search-card__listdate").text().trim() || "";

                    if (!position || !company) return null;

                    return {
                        position,
                        company,
                        location,
                        date,
                        salary: salary || "Not specified",
                        jobUrl,
                        companyLogo,
                        agoTime,
                    };
                } catch (err: any) {
                    console.warn(`Error parsing job:`, err.message);
                    return null;
                }
            })
            .get()
            .filter((job): job is IJob => job !== null);
    } catch (error: any) {
        console.error("Error parsing job list:", error);
        return [];
    }
  }

  public async getJobs(): Promise<IJob[]> {
    let allJobs: IJob[] = [];
    let start = 0;
    const BATCH_SIZE = 25;
    let hasMore = true;
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 3;

    try {
        const cacheKey = this.getUrl(0);
        const cachedJobs = cache.get(cacheKey);
        if (cachedJobs) {
            console.log("Returning cached results");
            return cachedJobs;
        }

        while (hasMore) {
            try {
                const jobs = await this.fetchJobBatch(start);

                if (!jobs || jobs.length === 0) {
                    hasMore = false;
                    break;
                }

                allJobs.push(...jobs);
                console.log(`Fetched ${jobs.length} jobs. Total: ${allJobs.length}`);

                if (this.limit && allJobs.length >= Number(this.limit)) {
                    allJobs = allJobs.slice(0, Number(this.limit));
                    break;
                }

                consecutiveErrors = 0;
                start += BATCH_SIZE;

                await delay(2000 + Math.random() * 1000);
            } catch (error: any) {
                consecutiveErrors++;
                console.error(`Error fetching batch (attempt ${consecutiveErrors}):`, error.message);
                if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                    console.log("Max consecutive errors reached. Stopping.");
                    break;
                }
                await delay(Math.pow(2, consecutiveErrors) * 1000);
            }
        }

        if (allJobs.length > 0) {
            cache.set(this.getUrl(0), allJobs);
        }

        return allJobs;
    } catch (error: any) {
        console.error("Fatal error in job fetching:", error);
        throw error;
    }
  }
}

// Main query function
const query = (queryObject: IQueryOptions): Promise<IJob[]> => {
  const query = new Query(queryObject);
  return query.getJobs();
};

const clearCache = (): void => cache.clear();
const getCacheSize = (): number => cache.size;

export {
    query,
    JobCache,
    clearCache,
    getCacheSize,
    IQueryOptions,
    IJob
};
