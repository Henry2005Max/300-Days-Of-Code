// Thin wrapper around the `rss-parser` npm package.
//
// rss-parser handles the HTTP fetch AND the XML-to-JS conversion in one call.
// We configure it once with a request timeout and a custom field list, then
// export two helpers:
//   parseFeedUrl(url)  — fetch + parse a live RSS URL
//   stripHtml(html)    — remove HTML tags to produce plain-text descriptions
//
// Why strip HTML from descriptions?
// RSS descriptions often contain full HTML markup (images, links, spans).
// We store a clean plain-text snippet in SQLite so it is easy to display
// in API responses without the caller needing to sanitise HTML.

import Parser from "rss-parser";
import { RawFeedItem } from "../types";

// Configure the parser once — reused for every request
const parser = new Parser({
    timeout: Number(process.env.FEED_FETCH_TIMEOUT_MS) || 8000,
    // Tell rss-parser to also capture these non-standard fields if present
    customFields: {
        item: [
            ["dc:creator", "creator"],
            ["content:encoded", "contentEncoded"],
        ],
    },
});

export interface ParsedFeed {
    title: string;
    description: string;
    items: RawFeedItem[];
}

// Fetch and parse a remote RSS URL.
// Throws if the URL is unreachable or the response is not valid RSS/Atom.
export async function parseFeedUrl(url: string): Promise<ParsedFeed> {
    const feed = await parser.parseURL(url);

    return {
        title:       feed.title       || url,
        description: feed.description || "",
        items:       (feed.items || []) as RawFeedItem[],
    };
}

// Remove all HTML tags and collapse whitespace — used when storing descriptions
export function stripHtml(html: string = ""): string {
    return html
        .replace(/<[^>]+>/g, " ")   // replace tags with a space
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g,  "&")
        .replace(/&lt;/g,   "<")
        .replace(/&gt;/g,   ">")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g,    " ")     // collapse multiple spaces
        .trim()
        .slice(0, 500);              // cap at 500 chars for storage