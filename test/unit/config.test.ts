import { describe, expect, it } from "vitest";
import { PLATFORMS, readConfig } from "../../src/config.js";

describe("readConfig", () => {
  it("requires the API key", () => {
    expect(() => readConfig({})).toThrow(/SCRAPINGISNOTACRIME_API_KEY/);
    expect(() => readConfig({ SCRAPINGISNOTACRIME_API_KEY: "   " })).toThrow(/SCRAPINGISNOTACRIME_API_KEY/);
  });

  it("enables every platform when the filter is absent or empty", () => {
    expect(readConfig({ SCRAPINGISNOTACRIME_API_KEY: "sinac_x" })).toEqual({ apiKey: "sinac_x", platforms: undefined });
    expect(readConfig({ SCRAPINGISNOTACRIME_API_KEY: "sinac_x", SCRAPINGISNOTACRIME_PLATFORMS: " " }).platforms).toBeUndefined();
  });

  it("parses the filter case-insensitively, ignoring spaces and duplicates", () => {
    const config = readConfig({
      SCRAPINGISNOTACRIME_API_KEY: "sinac_x",
      SCRAPINGISNOTACRIME_PLATFORMS: " Instagram , GITHUB,instagram,, ",
    });
    expect(config.platforms).toEqual(["instagram", "github"]);
  });

  it("rejects an unknown platform id and lists the valid ones", () => {
    expect(() =>
      readConfig({ SCRAPINGISNOTACRIME_API_KEY: "sinac_x", SCRAPINGISNOTACRIME_PLATFORMS: "instagram,instgram" }),
    ).toThrow(new RegExp(`instgram.*${PLATFORMS.join(", ")}`));
  });

  it("lists the nine platforms", () => {
    expect(PLATFORMS).toEqual(["instagram", "tiktok", "youtube", "appstore", "github", "hackernews", "bluesky", "twitch", "linktree"]);
  });
});
