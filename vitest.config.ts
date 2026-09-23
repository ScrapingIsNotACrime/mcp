import { defineConfig } from "vitest/config";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  define: { __MCP_VERSION__: JSON.stringify(pkg.version) },
  test: {
    include: ["test/**/*.test.ts"],
    exclude: ["test/smoke/**"],
    restoreMocks: true,
    testTimeout: 30_000,
  },
});
