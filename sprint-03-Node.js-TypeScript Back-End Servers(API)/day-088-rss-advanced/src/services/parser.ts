import Parser from "rss-parser";

const parser = new Parser({
    timeout: Number(process.env.FETCH_TIMEOUT_MS) || 8000,
    customFields: {
        item: [["dc:creator", "creator"], ["content:encoded", "contentEncoded"]],
    },
});

export interface ParsedFeed {
    title: string;
    description: string;
    link: string;
    items: ParsedItem[];
}

export interface ParsedItem {
    guid: string;
    title: string;
    link: string;
    description: string;
    author: string;
    published_at: string;
}

export async function parseFeedUrl(url: string): Promise<ParsedFeed> {
    const feed = await parser.parseURL(url);

    return {
        title:       feed.title       || url,
        description: feed.description || "",
        link:        feed.link        || "",
        items: (feed.items || []).map((item: any) => ({
            guid:         item.guid || item.link || item.title || String(Date.now()),
            title:        item.title        || "",
            link:         item.link         || "",
            description:  stripHtml(item.contentSnippet || item.content || item.description || ""),
            author:       item.creator      || item.author || "",
            published_at: item.isoDate      || item.pubDate || new Date().toISOString(),
        })),
    };
}

// Remove HTML tags, decode common entities, cap at 500 chars for storage
export function stripHtml(html: string = ""): string {
    return html
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
        .replace(/\s+/g, " ").trim().slice(0, 500);
}