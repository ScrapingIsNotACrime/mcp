import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ScrapingIsNotACrime } from "@scrapingisnotacrime/sdk";
import { readConfig } from "./config.js";
import { createServer } from "./server.js";
import { toolsFor } from "./tools/index.js";
import { VERSION } from "./version.js";

// stdout carries the MCP protocol: every log line goes to stderr.
async function main(): Promise<void> {
  let config;
  try {
    config = readConfig(process.env);
  } catch (error) {
    console.error(`scrapingisnotacrime-mcp: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
  const client = new ScrapingIsNotACrime({ apiKey: config.apiKey });
  const server = createServer({ client, platforms: config.platforms });
  await server.connect(new StdioServerTransport());
  console.error(`scrapingisnotacrime-mcp ${VERSION} ready with ${toolsFor(config.platforms).length} tools`);
}

main().catch((error: unknown) => {
  console.error("scrapingisnotacrime-mcp: fatal error", error);
  process.exit(1);
});
