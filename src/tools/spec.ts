import type { ScrapingIsNotACrime } from "@scrapingisnotacrime/sdk";
import type { z } from "zod";
import type { Platform } from "../config.js";

export type InputShape = Record<string, z.ZodType>;

export interface ToolSpec<S extends InputShape = InputShape> {
  name: string;
  platform: Platform;
  title: string;
  description: string;
  input: S;
  /** True when run() returns an SDK Page; the server returns one page. */
  paginated?: boolean;
  run: (client: ScrapingIsNotACrime, args: z.infer<z.ZodObject<S>>) => Promise<unknown>;
}

export function defineTool<S extends InputShape>(spec: ToolSpec<S>): ToolSpec {
  return spec as unknown as ToolSpec;
}
