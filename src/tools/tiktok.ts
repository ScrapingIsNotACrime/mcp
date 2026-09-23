import { z } from "zod";
import { defineTool } from "./spec.js";

export const tiktokTools = [
  defineTool({
    name: "tiktok_profile",
    platform: "tiktok",
    title: "TikTok profile",
    description: "Public profile of a TikTok account: nickname, bio, follower/following/like/video counts, verification and privacy. Use this first to check an account exists before calling tiktok_video.",
    input: { username: z.string().min(1).describe("TikTok username without @, e.g. tiktok") },
    run: (client, { username }) => client.tiktok.profile(username),
  }),
  defineTool({
    name: "tiktok_video",
    platform: "tiktok",
    title: "TikTok video",
    description: "Details of one public TikTok video: view/like/share/comment counts, duration, cover and audio. Use it once you have a numeric video id, typically parsed from the video's URL.",
    input: { video_id: z.string().regex(/^\d+$/).describe("Numeric TikTok video id from the video URL, e.g. 7300000000000000000") },
    run: (client, { video_id }) => client.tiktok.video(video_id),
  }),
];
