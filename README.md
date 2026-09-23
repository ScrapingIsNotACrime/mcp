# ScrapingIsNotACrime MCP Server

[![npm version](https://img.shields.io/npm/v/@scrapingisnotacrime/mcp.svg)](https://www.npmjs.com/package/@scrapingisnotacrime/mcp)
[![license](https://img.shields.io/npm/l/@scrapingisnotacrime/mcp.svg)](./LICENSE)

A [Model Context Protocol](https://modelcontextprotocol.io) server that lets AI agents read Instagram, TikTok, YouTube, App Store, GitHub, Hacker News, Bluesky, Twitch and Linktree data through the [ScrapingIsNotACrime](https://scrapingisnotacrime.com) public API.

## Get an API key

Create one at [scrapingisnotacrime.com/dashboard/api-keys](https://scrapingisnotacrime.com/dashboard/api-keys). Keys start with `sinac_`. New accounts get 100 free credits.

## Install

Requires Node.js 22+.

### Claude Desktop and Cursor

Add to `claude_desktop_config.json` (Claude Desktop) or `.cursor/mcp.json` (Cursor):

```json
{
  "mcpServers": {
    "scrapingisnotacrime": {
      "command": "npx",
      "args": ["-y", "@scrapingisnotacrime/mcp"],
      "env": {
        "SCRAPINGISNOTACRIME_API_KEY": "sinac_...",
        "SCRAPINGISNOTACRIME_PLATFORMS": "instagram,tiktok"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add scrapingisnotacrime --env SCRAPINGISNOTACRIME_API_KEY=sinac_... -- npx -y @scrapingisnotacrime/mcp
```

### VS Code

Add to `.vscode/mcp.json`:

```json
{ "servers": { "scrapingisnotacrime": { "command": "npx", "args": ["-y", "@scrapingisnotacrime/mcp"], "env": { "SCRAPINGISNOTACRIME_API_KEY": "sinac_..." } } } }
```

Pin a version for reproducible installs instead of always resolving to the latest release: `npx -y @scrapingisnotacrime/mcp@0.1.0`.

## Choose platforms

`SCRAPINGISNOTACRIME_PLATFORMS` is an optional, comma-separated, case-insensitive list of platform ids: `instagram, tiktok, youtube, appstore, github, hackernews, bluesky, twitch, linktree`. Leave it unset (or empty) to get all 34 tools.

Filtering matters because every tool definition sits in the agent's context: an agent that only ever calls GitHub and Hacker News tools does better with `SCRAPINGISNOTACRIME_PLATFORMS=github,hackernews` than with all 34 definitions competing for its attention on every turn.

## Tools

Tool names are `<platform>_<method>`. Arguments marked `?` are optional.

| Tool | Returns | Arguments |
|---|---|---|
| `instagram_profile` | Public profile: bio, links, follower/following/post counts, verification, business category | `username` |
| `instagram_contact` | Public business contact details (email, phone, address, external URL) when the account exposes them | `username` |
| `instagram_latest_posts` | Most recent posts, first page only | `username` |
| `instagram_posts` | One page of post history (paginated) | `username`, `count?`, `cursor?` |
| `instagram_highlights` | List of story highlights (ids, titles, covers) | `username` |
| `instagram_highlight` | Stories inside one highlight, with media URLs | `highlight_id` |
| `instagram_media_by_id` | One post's details, given its owner and numeric media id | `username`, `media_id` |
| `instagram_media` | One post, video or carousel's details, from its shortcode | `shortcode` |
| `instagram_download` | Every downloadable asset (videos, images, thumbnails) behind a post, reel or carousel | `shortcode` |
| `instagram_shortcode_to_id` | Converts a post shortcode into its numeric media id (no call to Instagram, but still one API request) | `shortcode` |
| `instagram_id_to_shortcode` | Converts a numeric media id into its shortcode (no call to Instagram, but still one API request) | `media_id` |
| `instagram_reel` | One reel's details: views, likes, comments, caption, video URL, audio | `shortcode` |
| `tiktok_profile` | Public profile: nickname, bio, follower/following/like/video counts, verification, privacy | `username` |
| `tiktok_video` | One video's details: view/like/share/comment counts, duration, cover, audio | `video_id` |
| `youtube_videos` | A channel's public videos plus the channel block (title, description, avatar) | `handle` |
| `appstore_search` | Matching apps: id, name, developer, price, rating, icon | `term`, `country?`, `limit?` |
| `appstore_reviews` | One page of an app's most recent reviews (paginated) | `app_id`, `country?`, `page?` |
| `github_profile` | Public user profile: name, bio, company, location, blog, counts, creation date | `handle` |
| `github_followers` | One page of the accounts following a user (paginated) | `handle`, `limit?`, `page?` |
| `github_following` | One page of the accounts a user follows (paginated) | `handle`, `limit?`, `page?` |
| `github_repositories` | One page of a user's public repositories (paginated) | `handle`, `limit?`, `page?` |
| `github_search_repositories` | One page of repositories matching a GitHub search query (paginated) | `q`, `limit?`, `page?` |
| `github_trending` | Currently trending repositories over a daily, weekly or monthly window (not paginated) | `since?`, `language?`, `limit?` |
| `hackernews_feed` | One page of a feed — top, new, best, ask, show or job (paginated) | `feed`, `limit?`, `page?` |
| `hackernews_item` | One item (story, comment, job or poll) with its full nested comment tree — can be very large for popular threads; prefer `hackernews_search`/`hackernews_feed` for an overview | `id` |
| `hackernews_search` | One page of stories matching a search term (paginated) | `q`, `limit?`, `page?` |
| `hackernews_user` | A user's karma, about text, creation date and submission count | `username` |
| `hackernews_submissions` | One page of a user's submitted stories, newest first (paginated) | `username`, `limit?`, `page?` |
| `hackernews_comments` | One page of a user's comments, newest first (paginated) | `username`, `limit?`, `page?` |
| `bluesky_profile` | Public profile: display name, description, avatar, banner, follower/following/post counts | `handle` |
| `bluesky_posts` | One page of a profile's posts with engagement counts (paginated) | `handle`, `limit?`, `cursor?` |
| `twitch_profile` | Public channel: display name, description, followers, partner/affiliate status, live status | `handle` |
| `twitch_videos` | A channel's recent videos (broadcasts, highlights, uploads) | `handle`, `limit?` |
| `linktree_profile` | Page title, description, avatar, verification and every listed link | `handle` |

## Credits

Each successful tool call costs one credit; failed calls (any 4xx/5xx error) are not charged, and calls rejected for invalid arguments never reach the API. Paginated tools (`instagram_posts`, `bluesky_posts`, `appstore_reviews`, the GitHub listings and the Hacker News listings) return a single page per call — the agent decides whether to fetch the next one, so no tool call auto-paginates behind your back.

## Troubleshooting

- **Missing `SCRAPINGISNOTACRIME_API_KEY`** or **unknown platform id in `SCRAPINGISNOTACRIME_PLATFORMS`**: the server logs a clear message to stderr and exits before connecting — nothing reaches stdout. In Claude Code, run `claude mcp get scrapingisnotacrime` or use `/mcp` to check the server's status, or start Claude Code with `--debug` to see the MCP logs. In Claude Desktop, check its MCP log files (Settings → Developer, or the app's logs folder).
- **"Out of credits"**: a tool call returned `isError: true` with a message pointing to https://scrapingisnotacrime.com/#pricing. Add credits or wait for your plan to renew.

## Releases and changelog

Every merge to `main` is released automatically: the version comes from the commit messages since the last release, following [Conventional Commits](https://www.conventionalcommits.org/).

| Commits since the last release | New version (while in 0.x) |
|---|---|
| only `docs:`, `chore:`, `test:`, `ci:`, `build:`, `refactor:` | none |
| at least one `fix:` | patch (`0.1.0` → `0.1.1`) |
| at least one `feat:` | minor (`0.1.1` → `0.2.0`) |
| `feat!:` or a `BREAKING CHANGE:` footer | minor while in 0.x |

The pipeline tags `vX.Y.Z`, publishes the GitHub Release with the notes, and publishes to npm with provenance. The changelog is the [Releases page](https://github.com/ScrapingIsNotACrime/mcp/releases); the version in the repository's `package.json` stays `0.0.0-development` on purpose.

## Links

- Docs: https://scrapingisnotacrime.com/docs
- Pricing: https://scrapingisnotacrime.com/#pricing
- SDK: [`@scrapingisnotacrime/sdk`](https://www.npmjs.com/package/@scrapingisnotacrime/sdk)
- Releases: https://github.com/ScrapingIsNotACrime/mcp/releases
- License: [MIT](./LICENSE)
