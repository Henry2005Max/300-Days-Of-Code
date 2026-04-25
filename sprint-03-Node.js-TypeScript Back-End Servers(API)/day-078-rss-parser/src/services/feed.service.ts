// FeedService: orchestrates the cache strategy, feed subscriptions, and read states.
//
// Cache strategy (same principle as Day 68 API proxy):
//   1. On GET /feeds/:id/items, check last_fetched_at on the feed row.
//   2. If null OR older than FEED_CACHE_TTL_MINUTES, re-fetch the live URL.
//   3. Upsert items using (feed_id, guid) as the unique key — existing items
//      are ignored (INSERT OR IGNORE), new ones are inserted.
//   4. Update last_fetched_at and item_count on the feed row.
//   5. Return items from SQLite — the caller always reads from the local cache.
//
// This means the first request for a feed is slow (live HTTP fetch), but every
// subsequent request within the TTL window is instant (SQLite read).

import db from "../db/database";
import { parseFeedUrl, stripHtml } from "./parser";
import { Feed, FeedItem } from "../types";
import { NotFoundError, BadRequestError, UnprocessableError } from "../middleware/errorHandler";

const TTL_MINUTES = Number(process.env.FEED_CACHE_TTL_MINUTES) || 15;

// ── Subscribe ────────────────────────────────────────────────────────────────

export async function subscribe(url: string): Promise<Feed> {
    // Check if already subscribed
    const existing = db.prepare("SELECT * FROM feeds WHERE url = ?").get(url) as Feed | undefined;
    if (existing) throw new BadRequestError(`Already subscribed to this feed (id: ${existing.id})`);

    // Validate the URL is actually a working RSS feed before storing it
    let parsed;
    try {
        parsed = await parseFeedUrl(url);
    } catch (err: any) {
        throw new UnprocessableError(`Could not fetch or parse feed: ${err.message}`);
    }

    // Insert the feed row with the title/description from the live fetch
    const result = db.prepare(`
    INSERT INTO feeds (url, title, description, last_fetched_at)
    VALUES (@url, @title, @description, datetime('now'))
  `).run({ url, title: parsed.title, description: parsed.description });

    const feedId = result.lastInsertRowid as number;

    // Store the initial batch of items
    upsertItems(feedId, parsed.items);
    syncItemCount(feedId);

    return getFeedById(feedId);
}

// ── Unsubscribe ──────────────────────────────────────────────────────────────

export function unsubscribe(id: number): void {
    getFeedById(id); // throws NotFoundError if missing
    // CASCADE deletes feed_items and read_states automatically
    db.prepare("DELETE FROM feeds WHERE id = ?").run(id);
}

// ── List feeds ───────────────────────────────────────────────────────────────

export function listFeeds(): Feed[] {
    return db.prepare("SELECT * FROM feeds ORDER BY created_at DESC").all() as Feed[];
}

export function getFeedById(id: number): Feed {
    const row = db.prepare("SELECT * FROM feeds WHERE id = ?").get(id);
    if (!row) throw new NotFoundError("Feed", id);
    return row as Feed;
}

// ── List items (with cache refresh) ─────────────────────────────────────────

export async function listItems(
    feedId: number,
    opts: { limit: number; offset: number; subscriber?: string; unread?: boolean }
): Promise<{ rows: (FeedItem & { is_read: 0 | 1 })[]; total: number }> {
    const feed = getFeedById(feedId);

    // Refresh cache if stale
    if (isCacheStale(feed.last_fetched_at)) {
        await refreshFeed(feedId, feed.url);
    }

    // Build query — optionally left-join read_states to attach is_read flag
    const conditions = ["fi.feed_id = @feedId"];
    const params: Record<string, unknown> = { feedId, limit: opts.limit, offset: opts.offset };

    let readJoin = "";
    if (opts.subscriber) {
        params.subscriber = opts.subscriber;
        // LEFT JOIN so items with no read_state row get is_read = 0
        readJoin = "LEFT JOIN read_states rs ON rs.item_id = fi.id AND rs.subscriber = @subscriber";

        if (opts.unread) {
            // Only items where no read_state row exists for this subscriber
            conditions.push("rs.item_id IS NULL");
        }
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const rows = db.prepare(`
    SELECT fi.*, CASE WHEN rs.item_id IS NOT NULL THEN 1 ELSE 0 END AS is_read
    FROM feed_items fi
    ${readJoin}
    ${where}
    ORDER BY fi.published_at DESC
    LIMIT @limit OFFSET @offset
  `).all(params) as (FeedItem & { is_read: 0 | 1 })[];

    const total = (db.prepare(`
    SELECT COUNT(*) as count FROM feed_items fi ${readJoin} ${where}
  `).get(params) as { count: number }).count;

    return { rows, total };
}

// ── Mark read ────────────────────────────────────────────────────────────────

export function markRead(feedId: number, itemId: number, subscriber: string): FeedItem {
    // Confirm the item belongs to this feed
    const item = db.prepare(
        "SELECT * FROM feed_items WHERE id = ? AND feed_id = ?"
    ).get(itemId, feedId) as FeedItem | undefined;

    if (!item) throw new NotFoundError("FeedItem", itemId);

    // INSERT OR IGNORE — idempotent, calling twice is safe
    db.prepare(`
    INSERT OR IGNORE INTO read_states (item_id, subscriber)
    VALUES (@itemId, @subscriber)
  `).run({ itemId, subscriber });

    return item;
}

// ── Mark all read ────────────────────────────────────────────────────────────

export function markAllRead(feedId: number, subscriber: string): { marked: number } {
    getFeedById(feedId);

    // Get all item IDs for this feed that the subscriber hasn't read yet
    const unread = db.prepare(`
    SELECT fi.id FROM feed_items fi
    LEFT JOIN read_states rs ON rs.item_id = fi.id AND rs.subscriber = @subscriber
    WHERE fi.feed_id = @feedId AND rs.item_id IS NULL
  `).all({ feedId, subscriber }) as { id: number }[];

    const insertStmt = db.prepare(
        "INSERT OR IGNORE INTO read_states (item_id, subscriber) VALUES (?, ?)"
    );

    // Use a transaction — all inserts succeed or none do
    const insertMany = db.transaction((ids: number[]) => {
        for (const id of ids) insertStmt.run(id, subscriber);
    });

    insertMany(unread.map((r) => r.id));

    return { marked: unread.length };
}

// ── Unread count ─────────────────────────────────────────────────────────────

export function unreadCount(feedId: number, subscriber: string): { unread: number } {
    getFeedById(feedId);

    const result = db.prepare(`
    SELECT COUNT(*) as count
    FROM feed_items fi
    LEFT JOIN read_states rs ON rs.item_id = fi.id AND rs.subscriber = @subscriber
    WHERE fi.feed_id = @feedId AND rs.item_id IS NULL
  `).get({ feedId, subscriber }) as { count: number };

    return { unread: result.count };
}

// ── Force refresh ────────────────────────────────────────────────────────────

export async function forceRefresh(feedId: number): Promise<Feed> {
    const feed = getFeedById(feedId);
    await refreshFeed(feedId, feed.url);
    return getFeedById(feedId);
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function isCacheStale(lastFetchedAt: string | null): boolean {
    if (!lastFetchedAt) return true;

    const fetchedMs = new Date(lastFetchedAt + "Z").getTime(); // SQLite stores UTC without Z
    const ageMs     = Date.now() - fetchedMs;
    return ageMs > TTL_MINUTES * 60 * 1000;
}

async function refreshFeed(feedId: number, url: string): Promise<void> {
    let parsed;
    try {
        parsed = await parseFeedUrl(url);
    } catch (err: any) {
        // Log the error but don't crash — stale cache is still better than nothing
        console.warn(`[feed] Refresh failed for feed ${feedId}: ${err.message}`);
        return;
    }

    // Update feed metadata
    db.prepare(`
    UPDATE feeds
    SET title = @title, description = @description, last_fetched_at = datetime('now')
    WHERE id = @feedId
  `).run({ title: parsed.title, description: parsed.description, feedId });

    upsertItems(feedId, parsed.items);
    syncItemCount(feedId);
    console.log(`[feed] Refreshed feed ${feedId} — ${parsed.items.length} items fetched`);
}

function upsertItems(feedId: number, items: any[]): void {
    const stmt = db.prepare(`
    INSERT OR IGNORE INTO feed_items
      (feed_id, guid, title, link, description, author, published_at)
    VALUES
      (@feedId, @guid, @title, @link, @description, @author, @published_at)
  `);

    // Wrap in a transaction — inserting 50 items individually without a transaction
    // is ~50x slower than doing it in one transaction block
    const insertAll = db.transaction((rows: any[]) => {
        for (const item of rows) {
            stmt.run({
                feedId,
                guid:         item.guid || item.link || item.title || String(Date.now()),
                title:        item.title        || "",
                link:         item.link         || "",
                description:  stripHtml(item.contentSnippet || item.content || item.description || ""),
                author:       item.creator      || item.author || "",
                published_at: item.isoDate      || item.pubDate || new Date().toISOString(),
            });
        }
    });

    insertAll(items);
}

function syncItemCount(feedId: number): void {
    db.prepare(`
    UPDATE feeds
    SET item_count = (SELECT COUNT(*) FROM feed_items WHERE feed_id = @feedId)
    WHERE id = @feedId
  `).run({ feedId });
}