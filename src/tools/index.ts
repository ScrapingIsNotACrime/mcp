import type { Platform } from "../config.js";
import { appstoreTools } from "./appstore.js";
import { blueskyTools } from "./bluesky.js";
import { githubTools } from "./github.js";
import { hackernewsTools } from "./hackernews.js";
import { instagramTools } from "./instagram.js";
import { linktreeTools } from "./linktree.js";
import type { ToolSpec } from "./spec.js";
import { tiktokTools } from "./tiktok.js";
import { twitchTools } from "./twitch.js";
import { youtubeTools } from "./youtube.js";

export const ALL_TOOLS: ToolSpec[] = [
  ...instagramTools,
  ...tiktokTools,
  ...youtubeTools,
  ...appstoreTools,
  ...githubTools,
  ...hackernewsTools,
  ...blueskyTools,
  ...twitchTools,
  ...linktreeTools,
];

export function toolsFor(platforms: Platform[] | undefined): ToolSpec[] {
  return platforms ? ALL_TOOLS.filter((tool) => platforms.includes(tool.platform)) : ALL_TOOLS;
}

export type { ToolSpec } from "./spec.js";
