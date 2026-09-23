import { spawnSync, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { beforeAll, describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("..", import.meta.url));
const bin = fileURLToPath(new URL("../dist/index.js", import.meta.url));

describe("bin", () => {
  beforeAll(() => {
    execFileSync("npx", ["tsup"], { cwd: root, stdio: "ignore" });
  }, 60_000);

  it("exits 1 with a stderr message and nothing on stdout when the key is missing", () => {
    const env = { ...process.env };
    delete env.SCRAPINGISNOTACRIME_API_KEY;
    const run = spawnSync(process.execPath, [bin], { env, encoding: "utf8", timeout: 10_000 });
    expect(run.status).toBe(1);
    expect(run.stdout).toBe("");
    expect(run.stderr).toMatch(/SCRAPINGISNOTACRIME_API_KEY/);
  });

  it("exits 1 on an unknown platform id", () => {
    const run = spawnSync(process.execPath, [bin], {
      env: { ...process.env, SCRAPINGISNOTACRIME_API_KEY: "sinac_test", SCRAPINGISNOTACRIME_PLATFORMS: "instgram" },
      encoding: "utf8",
      timeout: 10_000,
    });
    expect(run.status).toBe(1);
    expect(run.stderr).toMatch(/instgram/);
  });

  it("serves tools over real stdio", async () => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [bin],
      env: { ...process.env, SCRAPINGISNOTACRIME_API_KEY: "sinac_test", SCRAPINGISNOTACRIME_PLATFORMS: "linktree,twitch" } as Record<string, string>,
      stderr: "pipe",
    });
    const client = new Client({ name: "bin-test", version: "0.0.0" });
    await client.connect(transport);
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toEqual(["twitch_profile", "twitch_videos", "linktree_profile"]);
    await client.close();
  });
});
