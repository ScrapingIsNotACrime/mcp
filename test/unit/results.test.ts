import { describe, expect, it } from "vitest";
import {
  APIError,
  AuthenticationError,
  BadRequestError,
  ConnectionError,
  NotFoundError,
  QuotaExceededError,
  RateLimitError,
  UpstreamError,
} from "@scrapingisnotacrime/sdk";
import { describeError, errorResult, pageData, successResult } from "../../src/results.js";

describe("successResult", () => {
  it("returns compact JSON text", () => {
    expect(successResult({ a: 1, b: [1, 2] })).toEqual({ content: [{ type: "text", text: '{"a":1,"b":[1,2]}' }] });
  });
});

describe("pageData", () => {
  it("adds next_page for numbered pages with more results", () => {
    expect(pageData({ data: { items: [1], has_more: true }, hasMore: true, nextPage: 2 })).toEqual({
      items: [1],
      has_more: true,
      next_page: 2,
    });
  });

  it("returns the page data untouched otherwise", () => {
    const data = { posts: [1], next_cursor: "c", has_more: true };
    expect(pageData({ data, hasMore: true })).toBe(data);
    expect(pageData({ data: { items: [], has_more: false }, hasMore: false, nextPage: undefined })).toEqual({ items: [], has_more: false });
  });
});

describe("describeError", () => {
  it.each([
    [new NotFoundError("Profile not found.", { status: 404 }), "Not found: Profile not found."],
    [new BadRequestError("limit must be <= 100", { status: 400 }), "Invalid request: limit must be <= 100"],
    [new AuthenticationError("Invalid API key.", { status: 401 }), "Invalid API key — check SCRAPINGISNOTACRIME_API_KEY."],
    [new QuotaExceededError("plan.quota_exceeded", { status: 402 }), "Out of credits — see https://scrapingisnotacrime.com/#pricing"],
    [new RateLimitError("Instagram rate limit reached.", { status: 429 }), "Rate limited by the source platform; try again later. (Instagram rate limit reached.)"],
    [new UpstreamError("Upstream failed.", { status: 502 }), "The source platform failed; try again later. (Upstream failed.)"],
    [new ConnectionError("Request timed out after 30000 ms"), "Network error or timeout: Request timed out after 30000 ms"],
    [new APIError("boom", { status: 500 }), "API error 500: boom"],
    [new TypeError('Invalid path segment: "".'), 'Invalid argument: Invalid path segment: "".'],
    [new Error("weird"), "weird"],
    ["plain string", "plain string"],
  ])("maps %o", (error, text) => {
    expect(describeError(error)).toBe(text);
  });

  it("wraps errors as isError results", () => {
    expect(errorResult(new NotFoundError("x", { status: 404 }))).toEqual({
      content: [{ type: "text", text: "Not found: x" }],
      isError: true,
    });
  });
});
