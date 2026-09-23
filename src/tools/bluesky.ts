import { z } from "zod";
import { defineTool } from "./spec.js";

const handle = z.string().min(3).describe("Full Bluesky handle including the domain, e.g. bsky.app");

export const blueskyTools = [
  defineTool({
    name: "bluesky_profile",
    platform: "bluesky",
    title: "Bluesky profile",
    description: "Public Bluesky profile: display name, description, avatar, banner, follower/following/post counts. Use this first to check a handle exists before calling bluesky_posts.",
    input: { handle },
    run: (client, { handle }) => client.bluesky.profile(handle),
  }),
  defineTool({
    name: "bluesky_posts",
    platform: "bluesky",
    title: "Bluesky posts (paginated)",
    description: "One page of a Bluesky profile's posts with engagement counts. Pass next_cursor back as cursor while has_more is true.",
    input: {
      handle,
      limit: z.number().int().min(1).max(100).optional().describe("Posts per page, 1-100 (default 25)"),
      cursor: z.string().min(1).optional().describe("next_cursor from the previous page; omit for the first page"),
    },
    paginated: true,
    run: (client, { handle, limit, cursor }) => client.bluesky.posts(handle, { limit, cursor }),
  }),
];
