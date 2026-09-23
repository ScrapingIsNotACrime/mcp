import { z } from "zod";
import { defineTool } from "./spec.js";

const handle = z.string().min(1).describe("Twitch channel login, e.g. ninja");

export const twitchTools = [
  defineTool({
    name: "twitch_profile",
    platform: "twitch",
    title: "Twitch channel",
    description: "Public Twitch channel: display name, description, followers, partner/affiliate status, whether it is live and its last broadcast.",
    input: { handle },
    run: (client, { handle }) => client.twitch.profile(handle),
  }),
  defineTool({
    name: "twitch_videos",
    platform: "twitch",
    title: "Twitch videos",
    description: "A Twitch channel's recent videos (past broadcasts, highlights, uploads).",
    input: { handle, limit: z.number().int().min(1).max(100).optional().describe("Videos to return, 1-100 (default 20)") },
    run: (client, { handle, limit }) => client.twitch.videos(handle, { limit }),
  }),
];
