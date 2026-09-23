import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ScrapingIsNotACrime } from "@scrapingisnotacrime/sdk";
import type { Platform } from "./config.js";
import { type PageLike, errorResult, pageData, successResult } from "./results.js";
import { toolsFor } from "./tools/index.js";
import { VERSION } from "./version.js";

export const SERVER_NAME = "scrapingisnotacrime";

export function createServer(options: { client: ScrapingIsNotACrime; platforms?: Platform[] }): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: VERSION });
  for (const tool of toolsFor(options.platforms)) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.input,
        annotations: { title: tool.title, readOnlyHint: true, openWorldHint: true },
      },
      async (args: Record<string, unknown>) => {
        try {
          const value = await tool.run(options.client, args as never);
          return successResult(tool.paginated ? pageData(value as PageLike) : value);
        } catch (error) {
          return errorResult(error);
        }
      },
    );
  }
  return server;
}
