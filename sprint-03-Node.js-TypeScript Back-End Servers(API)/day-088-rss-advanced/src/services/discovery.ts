// Feed Discovery — given any website URL, find its RSS/Atom feed URL.
//
// Most websites expose their feed URL in one of three ways:
//   1. <link rel="alternate" type="application/rss+xml"> in the <head>
//   2. <link rel="alternate" type="application/atom+xml"> in the <head>
//   3. Common well-known paths: /feed, /rss, /feed.xml, /atom.xml, etc.
//
// We try method 1+2 first (parsing the HTML with Cheerio), then fall back
// to probing common paths. This is the same approach used by feed readers
// like Feedly and NetNewsWire.
//
// Why Cheerio instead of regex?
//   <link> tags can appear with attributes in any order and with varying
//   whitespace. Cheerio parses the HTML DOM, so `$('link[rel="alternate"]')`
//   reliably finds the tag regardless of attribute order or formatting.

import axios from "axios";
import * as cheerio from "cheerio";
import { DiscoveredFeed } from "../types";

const TIMEOUT = Number(process.env.FETCH_TIMEOUT_MS) || 8000;

// Well-known feed paths to probe if <link> discovery fails
const COMMON_PATHS = [
    "/feed", "/rss", "/feed.xml", "/rss.xml", "/atom.xml",
    "/feeds/posts/default", "/blog/feed", "/news/feed",
];

export async function discoverFeeds(siteUrl: string): Promise<DiscoveredFeed[]> {
    const normalised = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
    const origin     = new URL(normalised).origin;

    let html = "";
    try {
        const res = await axios.get(normalised, {
            timeout: TIMEOUT,
            headers: { "User-Agent": "NaijaRSS-Discoverer/1.0 (feed discovery bot)" },
            // Don't follow too many redirects — avoids infinite loops
            maxRedirects: 5,
        });
        html = typeof res.data === "string" ? res.data : "";
    } catch {
        // Site unreachable — still try common paths below
    }

    const discovered: DiscoveredFeed[] = [];
    const seen = new Set<string>();

    // ── Method 1: parse <link rel="alternate"> from HTML ─────────────────────
    if (html) {
        const $ = cheerio.load(html);
        $('link[rel="alternate"]').each((_i, el) => {
            const type  = $(el).attr("type") || "";
            const href  = $(el).attr("href") || "";
            const title = $(el).attr("title") || "";

            if (!href) return;
            if (!type.includes("rss") && !type.includes("atom")) return;

            // href may be relative — resolve against origin
            const feedUrl = href.startsWith("http") ? href : `${origin}${href.startsWith("/") ? "" : "/"}${href}`;

            if (!seen.has(feedUrl)) {
                seen.add(feedUrl);
                discovered.push({
                    url:   feedUrl,
                    title: title || (type.includes("atom") ? "Atom Feed" : "RSS Feed"),
                    type:  type.includes("atom") ? "atom" : "rss",
                });
            }
        });
    }

    // ── Method 2: probe common paths (only if method 1 found nothing) ─────────
    if (discovered.length === 0) {
        const probes = COMMON_PATHS.map(async (p) => {
            const url = `${origin}${p}`;
            if (seen.has(url)) return null;
            try {
                const res = await axios.head(url, { timeout: 3000, maxRedirects: 3 });
                const ct  = res.headers["content-type"] || "";
                if (ct.includes("rss") || ct.includes("xml") || ct.includes("atom")) {
                    return { url, title: "RSS Feed", type: ct.includes("atom") ? "atom" : "rss" } as DiscoveredFeed;
                }
            } catch { /* path doesn't exist */ }
            return null;
        });

        const results = await Promise.allSettled(probes);
        for (const r of results) {
            if (r.status === "fulfilled" && r.value) {
                discovered.push(r.value);
            }
        }
    }

    return discovered;
}