import { describe, expect, it } from "vitest";
import { connect, fixture, normalizeRequest, textOf } from "./harness.js";

// [tool, arguments, fixture id (null = no documented example), expected request]
const CASES: Array<[string, Record<string, unknown>, string | null, string]> = [
  ["instagram_profile", { username: "instagram" }, "ig-profile", "/instagram/profile/instagram"],
  ["instagram_contact", { username: "cafedaesquina" }, "ig-contact", "/instagram/profile/cafedaesquina/contact"],
  ["instagram_latest_posts", { username: "instagram" }, "ig-timeline", "/instagram/profile/instagram/timeline/latest"],
  ["instagram_posts", { username: "nasa", count: 12, cursor: "3950671748375397992_528817151" }, "ig-timeline-paged", "/instagram/profile/nasa/timeline?count=12&cursor=3950671748375397992_528817151"],
  ["instagram_highlights", { username: "nasa" }, "ig-highlights", "/instagram/profile/nasa/highlights"],
  ["instagram_highlight", { highlight_id: "highlight:18201653992314974" }, "ig-highlight-content", "/instagram/highlights/highlight%3A18201653992314974"],
  ["instagram_media_by_id", { username: "instagram", media_id: "3123456789012345678" }, "ig-media-by-id", "/instagram/profile/instagram/media/3123456789012345678"],
  ["instagram_media", { shortcode: "C8xQz1aP9Kv" }, null, "/instagram/media/C8xQz1aP9Kv"],
  ["instagram_download", { shortcode: "DbtErSrlB2J" }, "ig-media-download", "/instagram/media/DbtErSrlB2J/download"],
  ["instagram_shortcode_to_id", { shortcode: "Dbn-XJhk0_-" }, "ig-shortcode-to-id", "/instagram/media/Dbn-XJhk0_-/id"],
  ["instagram_id_to_shortcode", { media_id: "3956405067326902270" }, "ig-id-to-shortcode", "/instagram/media/id/3956405067326902270"],
  ["instagram_reel", { shortcode: "DyKlMnOpQrS" }, "ig-reels", "/instagram/reels/DyKlMnOpQrS"],
  ["tiktok_profile", { username: "tiktok" }, "tt-profile", "/tiktok/profile/tiktok"],
  ["tiktok_video", { video_id: "7300000000000000000" }, null, "/tiktok/video/7300000000000000000"],
  ["youtube_videos", { handle: "youtube" }, "yt-channel-videos", "/youtube/channel/youtube/videos"],
  ["appstore_search", { term: "instagram", country: "us", limit: 1 }, "as-search", "/appstore/search?term=instagram&country=us&limit=1"],
  ["appstore_reviews", { app_id: "389801252", country: "us", page: 1 }, "as-reviews", "/appstore/reviews?appId=389801252&country=us&page=1"],
  ["github_profile", { handle: "torvalds" }, "gh-profile", "/github/profiles/torvalds"],
  ["github_followers", { handle: "torvalds", limit: 30, page: 1 }, "gh-followers", "/github/profiles/torvalds/followers?limit=30&page=1"],
  ["github_following", { handle: "torvalds", limit: 5 }, null, "/github/profiles/torvalds/following?limit=5&page=1"],
  ["github_repositories", { handle: "torvalds", limit: 30 }, "gh-repos", "/github/profiles/torvalds/repositories?limit=30&page=1"],
  ["github_search_repositories", { q: "stars:>10000 language:php", limit: 1 }, "gh-search-repos", "/github/repositories?q=stars:%3E10000+language:php&limit=1&page=1"],
  ["github_trending", { since: "weekly", language: "php", limit: 1 }, "gh-trending", "/github/trending/repositories?since=weekly&language=php&limit=1"],
  ["hackernews_feed", { feed: "top", limit: 20, page: 0 }, "hn-feed", "/hackernews/feeds/top?limit=20&page=0"],
  ["hackernews_item", { id: 8863 }, "hn-item", "/hackernews/items/8863"],
  ["hackernews_search", { q: "postgres", limit: 20, page: 0 }, "hn-search", "/hackernews/search?q=postgres&limit=20&page=0"],
  ["hackernews_user", { username: "pg" }, "hn-user", "/hackernews/users/pg"],
  ["hackernews_submissions", { username: "pg", limit: 20, page: 0 }, "hn-user-submissions", "/hackernews/users/pg/submissions?limit=20&page=0"],
  ["hackernews_comments", { username: "pg", limit: 10 }, null, "/hackernews/users/pg/comments?limit=10&page=0"],
  ["bluesky_profile", { handle: "bsky.app" }, "bs-profile", "/bluesky/profiles/bsky.app"],
  ["bluesky_posts", { handle: "bsky.app", limit: 25 }, "bs-posts", "/bluesky/profiles/bsky.app/posts?limit=25"],
  ["twitch_profile", { handle: "ninja" }, "tw-profile", "/twitch/profiles/ninja"],
  ["twitch_videos", { handle: "ninja", limit: 20 }, "tw-videos", "/twitch/profiles/ninja/videos?limit=20"],
  ["linktree_profile", { handle: "linktree" }, "lt-profile", "/linktree/profiles/linktree"],
];

const PAGINATED_NUMBERED = new Set([
  "appstore_reviews",
  "github_followers",
  "github_following",
  "github_repositories",
  "github_search_repositories",
  "hackernews_feed",
  "hackernews_search",
  "hackernews_submissions",
  "hackernews_comments",
]);

const PLACEHOLDER = {
  instagram_media: { id: "1", shortcode: "C8xQz1aP9Kv" },
  tiktok_video: { id: "7300000000000000000" },
  github_following: { items: [], total: null, has_more: false },
  hackernews_comments: { items: [], total: 0, page: 0, has_more: false },
} as Record<string, unknown>;

describe("tools/list", () => {
  it("lists all 34 tools with titles, read-only annotations and input schemas", async () => {
    const { client } = await connect([{ body: { message: "ok", data: {} } }]);
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toEqual(CASES.map(([name]) => name));
    for (const tool of tools) {
      expect(tool.title, tool.name).toBeTruthy();
      expect(tool.description, tool.name).toBeTruthy();
      expect(tool.annotations).toMatchObject({ readOnlyHint: true, openWorldHint: true });
      expect(tool.inputSchema.type).toBe("object");
    }
  });

  it("lists only the filtered platforms", async () => {
    const { client } = await connect([{ body: { message: "ok", data: {} } }], ["github", "linktree"]);
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toEqual([
      "github_profile",
      "github_followers",
      "github_following",
      "github_repositories",
      "github_search_repositories",
      "github_trending",
      "linktree_profile",
    ]);
  });
});

describe("tools/call", () => {
  it.each(CASES)("%s calls the right route and returns compact JSON", async (name, args, fixtureId, request) => {
    const data = fixtureId ? fixture(fixtureId).response.data : PLACEHOLDER[name];
    const { client, urls } = await connect([{ body: { message: "ok", data } }]);
    const result = await client.callTool({ name, arguments: args });
    expect(result.isError).toBeFalsy();
    expect(urls).toEqual([normalizeRequest(request)]);
    const text = textOf(result);
    expect(text).not.toContain("\n");
    const parsed = JSON.parse(text) as Record<string, unknown>;
    // Numbered pages gain next_page when there is a next page (App Store
    // reviews have no has_more flag, so derive it from the result itself).
    if (PAGINATED_NUMBERED.has(name) && "next_page" in parsed) {
      const { next_page, ...rest } = parsed;
      expect(rest).toEqual(data);
      expect(typeof next_page).toBe("number");
    } else {
      expect(parsed).toEqual(data);
    }
    if (PAGINATED_NUMBERED.has(name) && (data as { has_more?: boolean }).has_more === true) {
      expect(parsed).toHaveProperty("next_page");
    }
  });

  it("returns next_page as the page after the requested one", async () => {
    const { client } = await connect([{ body: fixture("gh-followers").response }]);
    const result = await client.callTool({ name: "github_followers", arguments: { handle: "torvalds", page: 3 } });
    expect(JSON.parse(textOf(result)).next_page).toBe(4);
  });

  it("maps API errors to isError results and keeps serving after an error", async () => {
    const { client } = await connect([
      { status: 404, body: { message: "Profile not found." } },
      { body: fixture("lt-profile").response },
    ]);
    const failed = await client.callTool({ name: "linktree_profile", arguments: { handle: "nope" } });
    expect(failed.isError).toBe(true);
    expect(textOf(failed)).toBe("Not found: Profile not found.");
    const ok = await client.callTool({ name: "linktree_profile", arguments: { handle: "linktree" } });
    expect(ok.isError).toBeFalsy();
  });

  it("maps 402 to the out-of-credits message", async () => {
    const { client } = await connect([{ status: 402, body: { message: "plan.quota_exceeded" } }]);
    const result = await client.callTool({ name: "github_profile", arguments: { handle: "torvalds" } });
    expect(textOf(result)).toBe("Out of credits — see https://scrapingisnotacrime.com/#pricing");
  });

  it("rejects invalid arguments without calling the API", async () => {
    const { client, fetch } = await connect([{ body: { message: "ok", data: {} } }]);
    for (const [name, args] of [
      ["github_followers", { handle: "torvalds", limit: 500 }],
      ["hackernews_item", { id: "abc" }],
      ["hackernews_feed", { feed: "hot" }],
      ["instagram_profile", {}],
      ["appstore_reviews", { app_id: "389801252", page: 11 }],
    ] as const) {
      const result = await client.callTool({ name, arguments: args });
      expect(result.isError, name).toBe(true);
    }
    expect(fetch).not.toHaveBeenCalled();
  });
});
