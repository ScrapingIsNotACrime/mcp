import { z } from "zod";
import { defineTool } from "./spec.js";

const username = z.string().min(1).describe("Instagram username without @, e.g. nasa");
const shortcode = z.string().min(1).describe("Post or reel shortcode from the URL, e.g. DbtErSrlB2J from instagram.com/p/DbtErSrlB2J/");
const mediaId = z.string().min(1).describe("Numeric media id, e.g. 3956405067326902270");

export const instagramTools = [
  defineTool({
    name: "instagram_profile",
    platform: "instagram",
    title: "Instagram profile",
    description: "Public profile of an Instagram account: bio, links, follower/following/post counts, verification and business category. Use this first to check an account exists.",
    input: { username },
    run: (client, { username }) => client.instagram.profile(username),
  }),
  defineTool({
    name: "instagram_contact",
    platform: "instagram",
    title: "Instagram business contact",
    description: "Public business contact details of an Instagram account (email, phone, address, external URL) when the account exposes them. Fields are null when not public.",
    input: { username },
    run: (client, { username }) => client.instagram.contact(username),
  }),
  defineTool({
    name: "instagram_latest_posts",
    platform: "instagram",
    title: "Instagram latest posts",
    description: "The most recent posts of an Instagram account (first page only). Use instagram_posts instead when you need older posts.",
    input: { username },
    run: (client, { username }) => client.instagram.latestPosts(username),
  }),
  defineTool({
    name: "instagram_posts",
    platform: "instagram",
    title: "Instagram posts (paginated)",
    description: "One page of an Instagram account's post history. Pass the returned next_cursor as cursor to get the next page while has_more is true. Each page costs one request.",
    input: {
      username,
      count: z.number().int().min(1).max(50).optional().describe("Posts per page, 1-50 (default 12)"),
      cursor: z.string().min(1).optional().describe("next_cursor from the previous page; omit for the first page"),
    },
    paginated: true,
    run: (client, { username, count, cursor }) => client.instagram.posts(username, { count, cursor }),
  }),
  defineTool({
    name: "instagram_highlights",
    platform: "instagram",
    title: "Instagram story highlights",
    description: "List of an Instagram account's story highlights (ids, titles, covers). Use instagram_highlight with an id to get its items.",
    input: { username },
    run: (client, { username }) => client.instagram.highlights(username),
  }),
  defineTool({
    name: "instagram_highlight",
    platform: "instagram",
    title: "Instagram highlight items",
    description: "The stories inside one Instagram highlight, with media URLs. Get the id from instagram_highlights.",
    input: { highlight_id: z.string().min(1).describe("Highlight id from instagram_highlights, e.g. highlight:18201653992314974") },
    run: (client, { highlight_id }) => client.instagram.highlight(highlight_id),
  }),
  defineTool({
    name: "instagram_media_by_id",
    platform: "instagram",
    title: "Instagram post by id",
    description: "Details of one Instagram post (caption, likes, comments, media URLs) given its owner and numeric media id.",
    input: { username, media_id: mediaId },
    run: (client, { username, media_id }) => client.instagram.mediaById(username, media_id),
  }),
  defineTool({
    name: "instagram_media",
    platform: "instagram",
    title: "Instagram post by shortcode",
    description: "Details of one Instagram post, video or carousel (caption, likes, comments, media URLs) from the shortcode in its URL.",
    input: { shortcode },
    run: (client, { shortcode }) => client.instagram.media(shortcode),
  }),
  defineTool({
    name: "instagram_download",
    platform: "instagram",
    title: "Instagram media download URLs",
    description: "Every downloadable asset (videos, images, thumbnails) behind a post, reel or carousel, with resolution and expiry. assets[0] is the best primary asset.",
    input: { shortcode },
    run: (client, { shortcode }) => client.instagram.download(shortcode),
  }),
  defineTool({
    name: "instagram_shortcode_to_id",
    platform: "instagram",
    title: "Instagram shortcode to media id",
    description: "Converts a post shortcode into its numeric media_id (computed locally, cheap).",
    input: { shortcode },
    run: (client, { shortcode }) => client.instagram.shortcodeToId(shortcode),
  }),
  defineTool({
    name: "instagram_id_to_shortcode",
    platform: "instagram",
    title: "Instagram media id to shortcode",
    description: "Converts a numeric media_id into the shortcode used in post URLs (computed locally, cheap).",
    input: { media_id: mediaId },
    run: (client, { media_id }) => client.instagram.idToShortcode(media_id),
  }),
  defineTool({
    name: "instagram_reel",
    platform: "instagram",
    title: "Instagram reel",
    description: "Details of one Instagram reel: views, likes, comments, caption, video URL and audio attribution.",
    input: { shortcode },
    run: (client, { shortcode }) => client.instagram.reel(shortcode),
  }),
];
