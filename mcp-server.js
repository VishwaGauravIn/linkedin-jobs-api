#!/usr/bin/env node
const linkedIn = require("./index");
const { version } = require("./package.json");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");

const JOB_TYPE_VALUES = [
  "full time",
  "part time",
  "contract",
  "temporary",
  "volunteer",
  "internship",
];

const REMOTE_FILTER_VALUES = ["on-site", "on site", "remote", "hybrid"];
const DATE_VALUES = ["24hr", "past week", "past month"];
const EXPERIENCE_VALUES = [
  "internship",
  "entry level",
  "associate",
  "senior",
  "director",
  "executive",
];
const SALARY_VALUES = ["40000", "60000", "80000", "100000", "120000"];
const SORT_BY_VALUES = ["recent", "relevant"];

function normalizeQueryInput(input) {
  const query = {};

  if (input.keyword) query.keyword = input.keyword.trim();
  if (input.location) query.location = input.location.trim();
  if (input.dateSincePosted) query.dateSincePosted = input.dateSincePosted;
  if (input.jobType) query.jobType = input.jobType;
  if (input.remoteFilter) query.remoteFilter = input.remoteFilter;
  if (input.salary) query.salary = input.salary;
  if (input.experienceLevel) query.experienceLevel = input.experienceLevel;
  if (input.sortBy) query.sortBy = input.sortBy;

  if (typeof input.limit === "number") query.limit = String(input.limit);
  if (typeof input.page === "number") query.page = String(input.page);
  if (typeof input.has_verification === "boolean") {
    query.has_verification = input.has_verification;
  }
  if (typeof input.under_10_applicants === "boolean") {
    query.under_10_applicants = input.under_10_applicants;
  }

  return query;
}

function summarizeJobs(jobs) {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return "No jobs found for the provided filters.";
  }

  const preview = jobs.slice(0, 5).map((job, index) => {
    const parts = [
      `${index + 1}. ${job.position || "Unknown role"}`,
      job.company || "Unknown company",
      job.location || "Unknown location",
      job.date || job.agoTime || "No date",
      job.jobUrl || "No URL",
    ];
    return parts.join(" | ");
  });

  return [
    `Found ${jobs.length} jobs. Showing first ${Math.min(5, jobs.length)}:`,
    ...preview,
  ].join("\n");
}

function createStderrLogger() {
  return {
    log: (...args) => console.error(...args),
    warn: (...args) => console.error(...args),
    error: (...args) => console.error(...args),
  };
}

function createServer() {
  const server = new McpServer({
    name: "linkedin-jobs-api",
    version,
  });

  server.registerTool(
    "search-linkedin-jobs",
    {
      description:
        "Search LinkedIn jobs using advanced filters like keyword, location, experience level, remote preference, and salary.",
      inputSchema: {
        keyword: z
          .string()
          .min(1)
          .max(120)
          .optional()
          .describe("Job title or search phrase, for example software engineer."),
        location: z
          .string()
          .min(1)
          .max(120)
          .optional()
          .describe("Location to search in, for example India or San Francisco."),
        dateSincePosted: z
          .enum(DATE_VALUES)
          .optional()
          .describe("Recency filter: 24hr, past week, or past month."),
        jobType: z
          .enum(JOB_TYPE_VALUES)
          .optional()
          .describe("Job type such as full time, contract, or internship."),
        remoteFilter: z
          .enum(REMOTE_FILTER_VALUES)
          .optional()
          .describe("Work mode filter: on-site, on site, remote, or hybrid."),
        salary: z
          .enum(SALARY_VALUES)
          .optional()
          .describe("Minimum salary threshold."),
        experienceLevel: z
          .enum(EXPERIENCE_VALUES)
          .optional()
          .describe("Experience level filter."),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Maximum number of jobs to return."),
        page: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe("Result page index, 0-based."),
        sortBy: z
          .enum(SORT_BY_VALUES)
          .optional()
          .describe("Sort order: recent or relevant."),
        has_verification: z
          .boolean()
          .optional()
          .describe("Filter to verified jobs only."),
        under_10_applicants: z
          .boolean()
          .optional()
          .describe("Filter jobs with under 10 applicants."),
      },
    },
    async (input) => {
      try {
        const queryOptions = normalizeQueryInput(input);
        const jobs = await linkedIn.query({
          ...queryOptions,
          logger: createStderrLogger(),
        });

        return {
          content: [
            {
              type: "text",
              text: summarizeJobs(jobs),
            },
            {
              type: "text",
              text: JSON.stringify(jobs, null, 2),
            },
          ],
        };
      } catch (error) {
        const message =
          error && error.message
            ? `LinkedIn job search failed: ${error.message}`
            : "LinkedIn job search failed due to an unknown error.";

        return {
          isError: true,
          content: [
            {
              type: "text",
              text: message,
            },
          ],
        };
      }
    }
  );

  return server;
}

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (require.main === module) {
  main().catch((error) => {
    console.error("MCP server failed to start:", error);
    process.exit(1);
  });
}

module.exports = {
  createServer,
};
