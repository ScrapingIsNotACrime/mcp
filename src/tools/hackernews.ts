import { z } from "zod";
import { defineTool } from "./spec.js";

const username = z.string().min(1).describe("Hacker News username, e.g. pg");
const limit = z.number().int().min(1).max(50).optional().describe("Results per page, 1-50 (default 20)");
const page = z.number().int().min(0).optional().describe("Page number, 0-based (default 0); use next_page from the previous result");

export const hackernewsTools = [
  defineTool({
    name: "hackernews_feed",
    platform: "hackernews",
    title: "Hacker News feed (paginated)",
    description: "One page of a Hacker News feed (top, new, best, ask, show or job stories) with title, author, points, comment count and URL. Use next_page while has_more is true; each page costs one request.",
    input: {
      feed: z.enum(["top", "new", "best", "ask", "show", "job"]).describe("Which feed"),
      limit,
      page,
    },
    paginated: true,
    run: (client, { feed, limit, page }) => client.hackernews.feed(feed, { limit, page }),
  }),
  defineTool({
    name: "hackernews_item",
    platform: "hackernews",
    title: "Hacker News item with comments",
    description: "One Hacker News item (story, comment, job or poll) with its full nested comment tree in a single call. Popular threads can return very large output, so prefer hackernews_search or hackernews_feed for an overview and call this only for a specific item you already know.",
    input: { id: z.number().int().min(1).describe("Hacker News item id, e.g. 8863") },
    run: (client, { id }) => client.hackernews.item(id),
  }),
  defineTool({
    name: "hackernews_search",
    platform: "hackernews",
    title: "Hacker News search (paginated)",
    description: "Searches Hacker News stories by text and returns one page of results. Use next_page while has_more is true; each page costs one request.",
    input: { q: z.string().min(1).describe("Search term, e.g. postgres"), limit, page },
    paginated: true,
    run: (client, { q, limit, page }) => client.hackernews.search(q, { limit, page }),
  }),
  defineTool({
    name: "hackernews_user",
    platform: "hackernews",
    title: "Hacker News user",
    description: "A Hacker News user's karma, about text, creation date and submission count. Use hackernews_submissions or hackernews_comments instead to list what they posted.",
    input: { username },
    run: (client, { username }) => client.hackernews.user(username),
  }),
  defineTool({
    name: "hackernews_submissions",
    platform: "hackernews",
    title: "Hacker News user submissions (paginated)",
    description: "One page of the stories a Hacker News user submitted, newest first. Use next_page while has_more is true; each page costs one request.",
    input: { username, limit, page },
    paginated: true,
    run: (client, { username, limit, page }) => client.hackernews.submissions(username, { limit, page }),
  }),
  defineTool({
    name: "hackernews_comments",
    platform: "hackernews",
    title: "Hacker News user comments (paginated)",
    description: "One page of the comments a Hacker News user posted, newest first. Use next_page while has_more is true; each page costs one request.",
    input: { username, limit, page },
    paginated: true,
    run: (client, { username, limit, page }) => client.hackernews.comments(username, { limit, page }),
  }),
];
