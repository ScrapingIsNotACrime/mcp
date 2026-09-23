import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ScrapingIsNotACrime } from "@scrapingisnotacrime/sdk";
import { vi } from "vitest";
import type { Platform } from "../src/config.js";
import { createServer } from "../src/server.js";

export interface Fixture {
  request: string;
  response: { message: string; data: unknown };
}

export function fixture(id: string): Fixture {
  return JSON.parse(readFileSync(new URL(`./fixtures/${id}.json`, import.meta.url), "utf8")) as Fixture;
}

/** Path + query with the query re-serialized, so encodings compare equal. */
export function normalizeRequest(request: string): string {
  const [path, query] = request.split("?");
  const params = new URLSearchParams(query ?? "").toString();
  return params ? `${path}?${params}` : path!;
}

type Reply = { status?: number; body: unknown };

/** An MCP client connected in memory to a server whose API calls are answered by `replies`, in order (last repeats). */
export async function connect(replies: Reply[], platforms?: Platform[]) {
  const urls: string[] = [];
  const fetch = vi.fn(async (input: string | URL | Request) => {
    const url = new URL(String(input instanceof Request ? input.url : input));
    urls.push(normalizeRequest(`${url.pathname.replace(/^\/v1/, "")}${url.search}`));
    const reply = replies.length > 1 ? replies.shift()! : replies[0]!;
    return new Response(JSON.stringify(reply.body), { status: reply.status ?? 200 });
  });
  const sdk = new ScrapingIsNotACrime({ apiKey: "sinac_test", fetch: fetch as typeof globalThis.fetch, maxRetries: 0 });
  const server = createServer({ client: sdk, platforms });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(clientTransport);
  return { client, fetch, urls };
}

export function textOf(result: unknown): string {
  const content = (result as { content: Array<{ type: string; text: string }> }).content;
  return content[0]!.text;
}
