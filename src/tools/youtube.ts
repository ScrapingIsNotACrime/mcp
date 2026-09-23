import { z } from "zod";
import { defineTool } from "./spec.js";

export const youtubeTools = [
  defineTool({
    name: "youtube_videos",
    platform: "youtube",
    title: "YouTube channel videos",
    description: "A YouTube channel's public videos plus the channel block (title, description, avatar). Views and age come as display strings in metadataText.",
    input: { handle: z.string().min(1).describe("Channel handle without @, e.g. youtube") },
    run: (client, { handle }) => client.youtube.videos(handle),
  }),
];
