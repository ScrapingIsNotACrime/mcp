import { z } from "zod";
import { defineTool } from "./spec.js";

const handle = z.string().min(1).describe("GitHub username, e.g. torvalds");
const limit = z.number().int().min(1).max(100).optional().describe("Results per page, 1-100 (default 30)");
const page = z.number().int().min(1).optional().describe("Page number, 1-based (default 1); use next_page from the previous result");

export const githubTools = [
  defineTool({
    name: "github_profile",
    platform: "github",
    title: "GitHub profile",
    description: "Public GitHub user profile: name, bio, company, location, blog, public repo and follower counts, creation date.",
    input: { handle },
    run: (client, { handle }) => client.github.profile(handle),
  }),
  defineTool({
    name: "github_followers",
    platform: "github",
    title: "GitHub followers (paginated)",
    description: "One page of the accounts following a GitHub user. Use next_page while has_more is true; each page costs one request.",
    input: { handle, limit, page },
    paginated: true,
    run: (client, { handle, limit, page }) => client.github.followers(handle, { limit, page }),
  }),
  defineTool({
    name: "github_following",
    platform: "github",
    title: "GitHub following (paginated)",
    description: "One page of the accounts a GitHub user follows. Use next_page while has_more is true; each page costs one request.",
    input: { handle, limit, page },
    paginated: true,
    run: (client, { handle, limit, page }) => client.github.following(handle, { limit, page }),
  }),
  defineTool({
    name: "github_repositories",
    platform: "github",
    title: "GitHub user repositories (paginated)",
    description: "One page of a GitHub user's public repositories with stars, forks, language and description.",
    input: { handle, limit, page },
    paginated: true,
    run: (client, { handle, limit, page }) => client.github.repositories(handle, { limit, page }),
  }),
  defineTool({
    name: "github_search_repositories",
    platform: "github",
    title: "GitHub repository search (paginated)",
    description: "Searches GitHub repositories using GitHub search syntax and returns one page of results.",
    input: {
      q: z.string().min(1).describe("GitHub search query, e.g. stars:>10000 language:php"),
      limit,
      page,
    },
    paginated: true,
    run: (client, { q, limit, page }) => client.github.searchRepositories(q, { limit, page }),
  }),
  defineTool({
    name: "github_trending",
    platform: "github",
    title: "GitHub trending repositories",
    description: "Currently trending GitHub repositories over a daily, weekly or monthly window, optionally for one language.",
    input: {
      since: z.enum(["daily", "weekly", "monthly"]).optional().describe("Window, default daily"),
      language: z.string().min(1).optional().describe("Restrict to one language, e.g. php"),
      limit,
    },
    run: (client, { since, language, limit }) => client.github.trending({ since, language, limit }),
  }),
];
