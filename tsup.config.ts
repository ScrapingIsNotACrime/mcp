import { defineConfig } from "tsup";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  target: "node22",
  sourcemap: true,
  banner: { js: "#!/usr/bin/env node" },
  define: { __MCP_VERSION__: JSON.stringify(pkg.version) },
});
