import { z } from "zod";
import { defineTool } from "./spec.js";

export const linktreeTools = [
  defineTool({
    name: "linktree_profile",
    platform: "linktree",
    title: "Linktree profile",
    description: "A Linktree page: title, description, avatar, verification and every link it lists. Use it to enumerate every link the page publishes in one call.",
    input: { handle: z.string().min(1).describe("Linktree handle, e.g. linktree from linktr.ee/linktree") },
    run: (client, { handle }) => client.linktree.profile(handle),
  }),
];
