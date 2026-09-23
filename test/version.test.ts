import { describe, expect, it } from "vitest";
import pkg from "../package.json" with { type: "json" };
import { VERSION } from "../src/version.js";

describe("VERSION", () => {
  it("comes from package.json at build time", () => {
    expect(VERSION).toBe(pkg.version);
  });
});
