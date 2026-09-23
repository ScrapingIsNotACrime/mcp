import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const PRICING_URL = "https://scrapingisnotacrime.com/#pricing";

/** The subset of the SDK's Page that the server needs. */
export interface PageLike {
  data: unknown;
  hasMore: boolean;
  nextPage?: number;
}

/** One page for the agent: the API's page object, plus next_page for numbered endpoints. */
export function pageData(page: PageLike): unknown {
  if (page.hasMore && page.nextPage !== undefined) {
    return { ...(page.data as Record<string, unknown>), next_page: page.nextPage };
  }
  return page.data;
}

export function successResult(value: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(value) }] };
}

export function errorResult(error: unknown): CallToolResult {
  return { content: [{ type: "text", text: describeError(error) }], isError: true };
}

// Matched by name, not instanceof: the SDK may be loaded as a different copy.
export function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  switch (error.name) {
    case "TypeError":
      return `Invalid argument: ${error.message}`;
    case "NotFoundError":
      return `Not found: ${error.message}`;
    case "BadRequestError":
      return `Invalid request: ${error.message}`;
    case "AuthenticationError":
      return `Invalid API key: ${error.message} — check SCRAPINGISNOTACRIME_API_KEY.`;
    case "QuotaExceededError":
      return `Out of credits — see ${PRICING_URL}`;
    case "RateLimitError":
      return `Rate limited by the source platform; try again later. (${error.message})`;
    case "UpstreamError":
      return `The source platform failed; try again later. (${error.message})`;
    case "ConnectionError":
      return `Network error or timeout: ${error.message}`;
  }
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? `API error ${status}: ${error.message}` : error.message;
}
