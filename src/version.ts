declare const __MCP_VERSION__: string | undefined;

// Injected at build time from package.json (tsup and vitest `define`); the
// release pipeline sets package.json's version from the new tag before building.
export const VERSION: string = typeof __MCP_VERSION__ === "string" ? __MCP_VERSION__ : "0.0.0-development";
