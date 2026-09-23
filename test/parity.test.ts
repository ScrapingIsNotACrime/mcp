import { ScrapingIsNotACrime } from "@scrapingisnotacrime/sdk";
import { describe, expect, it } from "vitest";
import { ALL_TOOLS } from "../src/tools/index.js";

const snake = (method: string) => method.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

describe("parity with the SDK", () => {
  it("has exactly one tool per public SDK method", () => {
    const client = new ScrapingIsNotACrime({ apiKey: "sinac_test", fetch: (async () => new Response()) as typeof fetch });
    const expected: string[] = [];
    for (const [namespace, resource] of Object.entries(client)) {
      if (typeof resource !== "object" || resource === null) continue;
      for (const method of Object.getOwnPropertyNames(Object.getPrototypeOf(resource))) {
        // `list` is a TypeScript-private helper on paginated resources, not public API.
        if (method === "constructor" || method === "list") continue;
        expected.push(`${namespace}_${snake(method)}`);
      }
    }
    expect(ALL_TOOLS.map((t) => t.name).sort()).toEqual(expected.sort());
    expect(expected).toHaveLength(34);
  });
});
