// Real API over real stdio: one cheap call per platform (9 credits).
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { describe, expect, it } from "vitest";

const enabled = Boolean(process.env.SCRAPINGISNOTACRIME_API_KEY);
const CALLS: Array<[string, Record<string, unknown>]> = [
  ["instagram_profile", { username: "nasa" }],
  ["tiktok_profile", { username: "tiktok" }],
  ["youtube_videos", { handle: "youtube" }],
  ["appstore_search", { term: "instagram", limit: 1 }],
  ["github_profile", { handle: "torvalds" }],
  ["hackernews_item", { id: 8863 }],
  ["bluesky_profile", { handle: "bsky.app" }],
  ["twitch_profile", { handle: "ninja" }],
  ["linktree_profile", { handle: "linktree" }],
];

describe.skipIf(!enabled)("smoke: real API over stdio", () => {
  it("calls one tool per platform", async () => {
    const root = fileURLToPath(new URL("../..", import.meta.url));
    execFileSync("npx", ["tsup"], { cwd: root, stdio: "ignore" });
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [fileURLToPath(new URL("../../dist/index.js", import.meta.url))],
      env: { ...process.env } as Record<string, string>,
      stderr: "inherit",
    });
    const client = new Client({ name: "smoke", version: "0.0.0" });
    await client.connect(transport);
    for (const [name, args] of CALLS) {
      const result = await client.callTool({ name, arguments: args });
      expect(result.isError, `${name}: ${JSON.stringify(result.content)}`).toBeFalsy();
    }
    await client.close();
  });
});
