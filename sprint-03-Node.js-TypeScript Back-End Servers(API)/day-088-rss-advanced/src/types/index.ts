// All shared types for the Advanced RSS Parser

export interface Feed {
    id: number;
    url: string;
    title: string;
    description: string;
    site_url: string;          // the homepage the feed belongs to
    last_fetched_at: string | null;
    item_count: number;
    created_at: string;
}

export interface FeedItem {
    id: number;
    feed_id: number;
    guid: string;
    title: string;
    link: string;
    description: string;       // stripped HTML snippet
    author: string;
    published_at: string;
    created_at: string;
}

// A keyword filter attached to a feed — items matching ANY filter are flagged
export interface KeywordFilter {
    id: number;
    feed_id: number;
    keyword: string;           // case-insensitive match against title + description
    created_at: string;
}

// FeedItem enriched with match info for the digest
export interface DigestItem extends FeedItem {
    feed_title: string;
    feed_url: string;
    matched_keywords: string[];  // which filters matched this item
}

// Result of feed discovery — the RSS URL found on a website
export interface DiscoveredFeed {
    url: string;
    title: string;
    type: string;              // "rss" | "atom"
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: { field: string; message: string }[];
    meta?: { total: number; count: number };
}