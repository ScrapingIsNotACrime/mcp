import { z } from "zod";
import { defineTool } from "./spec.js";

const country = z.string().regex(/^[a-z]{2}$/i).optional().describe("2-letter country code, default us");

export const appstoreTools = [
  defineTool({
    name: "appstore_search",
    platform: "appstore",
    title: "App Store search",
    description: "Searches the Apple App Store and returns matching apps with id, name, developer, price, rating and icon. Use the id with appstore_reviews.",
    input: {
      term: z.string().min(1).describe("Search term, e.g. instagram"),
      country,
      limit: z.number().int().min(1).max(200).optional().describe("Number of results, 1-200 (default 10)"),
    },
    run: (client, { term, country, limit }) => client.appstore.search(term, { country, limit }),
  }),
  defineTool({
    name: "appstore_reviews",
    platform: "appstore",
    title: "App Store reviews (paginated)",
    description: "One page of the most recent customer reviews of an app. Use next_page when it is present to get the next page; it is absent on the last page, and Apple caps reviews at 10 pages regardless. Each page costs one request.",
    input: {
      app_id: z.string().regex(/^\d+$/).describe("Numeric App Store app id (the id from appstore_search), e.g. 389801252"),
      country,
      page: z.number().int().min(1).max(10).optional().describe("Review page, 1-10 (default 1)"),
    },
    paginated: true,
    run: (client, { app_id, country, page }) => client.appstore.reviews(app_id, { country, page }),
  }),
];
