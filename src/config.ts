export const PLATFORMS = [
  "instagram",
  "tiktok",
  "youtube",
  "appstore",
  "github",
  "hackernews",
  "bluesky",
  "twitch",
  "linktree",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export interface ServerConfig {
  apiKey: string;
  /** undefined = every platform. */
  platforms: Platform[] | undefined;
}

const API_KEY_ENV = "SCRAPINGISNOTACRIME_API_KEY";
const PLATFORMS_ENV = "SCRAPINGISNOTACRIME_PLATFORMS";

function isPlatform(value: string): value is Platform {
  return (PLATFORMS as readonly string[]).includes(value);
}

export function readConfig(env: Record<string, string | undefined>): ServerConfig {
  const apiKey = (env[API_KEY_ENV] ?? "").trim();
  if (!apiKey) {
    throw new Error(`Missing ${API_KEY_ENV}: set it to your API key (sinac_…) in the MCP server's env.`);
  }

  const ids = [...new Set((env[PLATFORMS_ENV] ?? "").split(",").map((id) => id.trim().toLowerCase()).filter(Boolean))];
  if (ids.length === 0) return { apiKey, platforms: undefined };

  const unknown = ids.filter((id) => !isPlatform(id));
  if (unknown.length > 0) {
    throw new Error(`Unknown platform in ${PLATFORMS_ENV}: ${unknown.join(", ")}. Valid ids: ${PLATFORMS.join(", ")}.`);
  }
  return { apiKey, platforms: ids.filter(isPlatform) };
}
