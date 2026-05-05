// FeedService: the complete business logic layer.
//
// New in Day 88 vs Day 78:
//
// 1. KEYWORD FILTERS
//    Each feed can have N keyword filters. When new items arrive during a
//    refresh, every item's (title + description) is checked against the
//    feed's filters using a case-insensitive substring match. Matches are
//    stored in filter_matches. This lets the digest surface only the items
//    that matched a keyword — useful for monitoring competitors, tracking
//    topics, or watching for breaking news.
//
// 2. DIGEST ENDPOINT
//    GET /digest?subscriber=X returns recent unread items across ALL feeds,
//    enriched with the feed title and the list of keywords that matched.
//    The ?matched_only=true variant narrows to items that hit at least one
//    keyword filter — useful when subscribed to many feeds but only want
//    to see relevant content.
//
// 3. FEED DISCOVERY INTEGRATION
//    POST /discover takes a website URL, calls discoverFeeds(), and returns
//    the found RSS URLs without subscribing — the caller can choose which to
//    subscribe to. POST /subscribe accepts the URL directly.

import db from "../db/database";
import { stmts } from "../db/statements";
import { parseFeedUrl } from "./parser";
import { Feed, FeedItem, KeywordFilter, DigestItem } from "../types";
import { NotFoundError, BadRequestError } from "../middleware/errorHandler";

const TTL_MINUTES    = Number(process.env.FEED_CACHE_TTL_MINUTES) || 15;
const DIGEST_LIMIT   = Number(process.env.DIGEST_LIMIT)            || 50;
const CONCURRENCY    = Number(process.env.DIGEST_CONCURRENCY)      || 5;

// ── Subscribe ─────────────────────────────────────────────────────────────────

export async function subscribe(url: string): Promise<Feed> {
    const existing = stmts.getFeedByUrl.get(url) as Feed | undefined;
    if (existing) throw new BadRequestError(`Already subscribed to this feed (id: ${existing.id})`);

    let parsed;
    try {
        parsed = await parseFeedUrl(url);
    } catch (err: any) {
        throw new BadRequestError(`Could not fetch or parse feed: ${err.message}`);
    }

    const result = stmts.insertFeed.run({
        url,
        title:       parsed.title,
        description: parsed.description,
        site_url:    parsed.link,
    });

    const feedId = result.lastInsertRowid as number;
    upsertItems(feedId, parsed.items, []);
    stmts.updateFeedMeta.run({ id: feedId, title: parsed.title, description: parsed.description, site_url: parsed.link });

    return stmts.getFeedById.get(feedId) as Feed;
}

// ── Unsubscribe ───────────────────────────────────────────────────────────────

export function unsubscribe(id: number): void {
    getFeedById(id);
    stmts.deleteFeed.run(id);
}

// ── List / get ────────────────────────────────────────────────────────────────

export function listFeeds(): Feed[] {
    return stmts.listFeeds.all() as Feed[];
}

export function getFeedById(id: number): Feed {
    const row = stmts.getFeedById.get(id) as Feed | undefined;
    if (!row) throw new NotFoundError("Feed", id);
    return row;
}

// ── Refresh (with keyword matching) ──────────────────────────────────────────

export async function refreshFeed(feedId: number): Promise<Feed> {
    const feed    = getFeedById(feedId);
    const filters = stmts.listFilters.all(feedId) as KeywordFilter[];

    let parsed;
    try {
        parsed = await parseFeedUrl(feed.url);
    } catch (err: any) {
        console.warn(`[feed] Refresh failed for feed ${feedId}: ${err.message}`);
        return feed;
    }

    upsertItems(feedId, parsed.items, filters);
    stmts.updateFeedMeta.run({ id: feedId, title: parsed.title, description: parsed.description, site_url: parsed.link });

    console.log(`[feed] Refreshed feed ${feedId} — ${parsed.items.length} items fetched`);
    return stmts.getFeedById.get(feedId) as Feed;
}

// ── List items ────────────────────────────────────────────────────────────────

export function listItems(feedId: number, limit = 20, offset = 0): { rows: FeedItem[]; total: number } {
    getFeedById(feedId);
    const rows  = stmts.listItems.all(feedId, limit, offset) as FeedItem[];
    const total = (stmts.countItems.get(feedId) as { count: number }).count;
    return { rows, total };
}

// ── Read state ────────────────────────────────────────────────────────────────

export function markRead(feedId: number, itemId: number, subscriber: string): void {
    getFeedById(feedId);
    const item = stmts.getItemById.get(itemId) as FeedItem | undefined;
    if (!item || item.feed_id !== feedId) throw new NotFoundError("FeedItem", itemId);
    stmts.markRead.run({ item_id: itemId, subscriber });
}

export function markAllRead(feedId: number, subscriber: string): { marked: number } {
    getFeedById(feedId);
    const result = stmts.markAllRead.run({ feed_id: feedId, subscriber });
    return { marked: result.changes };
}

export function getUnreadCount(feedId: number, subscriber: string): { unread: number } {
    getFeedById(feedId);
    const row = stmts.unreadCount.get({ feed_id: feedId, subscriber }) as { count: number };
    return { unread: row.count };
}

// ── Keyword filters ───────────────────────────────────────────────────────────

export function addFilter(feedId: number, keyword: string): KeywordFilter {
    getFeedById(feedId);
    if (!keyword.trim()) throw new BadRequestError("Keyword cannot be empty");

    const kw = keyword.trim().toLowerCase();
    stmts.insertFilter.run({ feed_id: feedId, keyword: kw });

    const filter = db.prepare(
        "SELECT * FROM keyword_filters WHERE feed_id = ? AND keyword = ?"
    ).get(feedId, kw) as KeywordFilter;

    // Retroactively match existing items against the new filter
    const items = db.prepare("SELECT id, title, description FROM feed_items WHERE feed_id = ?").all(feedId) as any[];
    const insertMatch = db.transaction(() => {
        for (const item of items) {
            if (itemMatchesKeyword(item, kw)) {
                stmts.insertMatch.run({ item_id: item.id, filter_id: filter.id });
            }
        }
    });
    insertMatch();

    return filter;
}

export function removeFilter(feedId: number, filterId: number): void {
    getFeedById(feedId);
    const result = stmts.deleteFilter.run(filterId, feedId);
    if (result.changes === 0) throw new NotFoundError("Filter", filterId);
}

export function listFilters(feedId: number): KeywordFilter[] {
    getFeedById(feedId);
    return stmts.listFilters.all(feedId) as KeywordFilter[];
}

// ── Digest ────────────────────────────────────────────────────────────────────

export async function getDigest(opts: {
    subscriber: string;
    matchedOnly: boolean;
    refreshStale: boolean;
    limit: number;
}): Promise<DigestItem[]> {
    // Optionally refresh any stale feeds before building the digest
    if (opts.refreshStale) {
        const feeds = listFeeds();
        const stale  = feeds.filter((f) => isCacheStale(f.last_fetched_at));

        // Refresh in batches of CONCURRENCY
        for (let i = 0; i < stale.length; i += CONCURRENCY) {
            const batch = stale.slice(i, i + CONCURRENCY);
            await Promise.allSettled(batch.map((f) => refreshFeed(f.id)));
        }
    }

    const query  = opts.matchedOnly ? stmts.digestMatchedItems : stmts.digestItems;
    const rows   = query.all({ subscriber: opts.subscriber, limit: opts.limit }) as any[];

    // Enrich each item with its matched keywords
    return rows.map((row) => {
        const keywords = (stmts.matchesForItem.all(row.id) as { keyword: string }[]).map((r) => r.keyword);
        return {
            ...row,
            matched_keywords: keywords,
        } as DigestItem;
    });
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function isCacheStale(lastFetchedAt: string | null): boolean {
    if (!lastFetchedAt) return true;
    const ageMs = Date.now() - new Date(lastFetchedAt + "Z").getTime();
    return ageMs > TTL_MINUTES * 60 * 1000;
}

function itemMatchesKeyword(item: { title: string; description: string }, keyword: string): boolean {
    const haystack = `${item.title} ${item.description}`.toLowerCase();
    return haystack.includes(keyword.toLowerCase());
}

function upsertItems(feedId: number, items: any[], filters: KeywordFilter[]): void {
    const insertAll = db.transaction(() => {
        for (const item of items) {
            const result = stmts.insertItem.run({
                feed_id:      feedId,
                guid:         item.guid,
                title:        item.title,
                link:         item.link,
                description:  item.description,
                author:       item.author,
                published_at: item.published_at,
            });

            // Only check filters for newly inserted rows
            if (result.changes > 0 && filters.length > 0) {
                const itemId = result.lastInsertRowid as number;
                for (const filter of filters) {
                    if (itemMatchesKeyword(item, filter.keyword)) {
                        stmts.insertMatch.run({ item_id: itemId, filter_id: filter.id });
                    }
                }
            }
        }
    });
    insertAll();
}