import db from "./database";

type Stmts = ReturnType<typeof buildStatements>;
let _stmts: Stmts | null = null;

function buildStatements() {
    return {
        // ── Feeds ──────────────────────────────────────────────────────────
        insertFeed:    db.prepare("INSERT INTO feeds (url, title, description, site_url, last_fetched_at) VALUES (@url, @title, @description, @site_url, datetime('now'))"),
        getFeedById:   db.prepare("SELECT * FROM feeds WHERE id = ?"),
        getFeedByUrl:  db.prepare("SELECT * FROM feeds WHERE url = ?"),
        listFeeds:     db.prepare("SELECT * FROM feeds ORDER BY created_at DESC"),
        updateFeedMeta: db.prepare(`
      UPDATE feeds
      SET title = @title, description = @description, site_url = @site_url,
          last_fetched_at = datetime('now'), item_count = (SELECT COUNT(*) FROM feed_items WHERE feed_id = @id)
      WHERE id = @id
    `),
        deleteFeed: db.prepare("DELETE FROM feeds WHERE id = ?"),

        // ── Items ──────────────────────────────────────────────────────────
        insertItem: db.prepare(`
      INSERT OR IGNORE INTO feed_items (feed_id, guid, title, link, description, author, published_at)
      VALUES (@feed_id, @guid, @title, @link, @description, @author, @published_at)
    `),
        getItemById:   db.prepare("SELECT * FROM feed_items WHERE id = ?"),
        getItemByGuid: db.prepare("SELECT * FROM feed_items WHERE feed_id = @feed_id AND guid = @guid"),
        listItems:     db.prepare(`
      SELECT fi.* FROM feed_items fi
      WHERE fi.feed_id = ?
      ORDER BY fi.published_at DESC LIMIT ? OFFSET ?
    `),
        countItems: db.prepare("SELECT COUNT(*) as count FROM feed_items WHERE feed_id = ?"),

        // ── Read states ────────────────────────────────────────────────────
        markRead:     db.prepare("INSERT OR IGNORE INTO read_states (item_id, subscriber) VALUES (@item_id, @subscriber)"),
        markAllRead:  db.prepare(`
      INSERT OR IGNORE INTO read_states (item_id, subscriber)
      SELECT fi.id, @subscriber FROM feed_items fi
      WHERE fi.feed_id = @feed_id
    `),
        unreadCount:  db.prepare(`
      SELECT COUNT(*) as count FROM feed_items fi
      LEFT JOIN read_states rs ON rs.item_id = fi.id AND rs.subscriber = @subscriber
      WHERE fi.feed_id = @feed_id AND rs.item_id IS NULL
    `),

        // ── Keyword filters ────────────────────────────────────────────────
        insertFilter:  db.prepare("INSERT OR IGNORE INTO keyword_filters (feed_id, keyword) VALUES (@feed_id, @keyword)"),
        deleteFilter:  db.prepare("DELETE FROM keyword_filters WHERE id = ? AND feed_id = ?"),
        listFilters:   db.prepare("SELECT * FROM keyword_filters WHERE feed_id = ? ORDER BY keyword"),
        getAllFilters: db.prepare("SELECT * FROM keyword_filters ORDER BY feed_id, keyword"),

        // ── Filter matches ─────────────────────────────────────────────────
        insertMatch:   db.prepare("INSERT OR IGNORE INTO filter_matches (item_id, filter_id) VALUES (@item_id, @filter_id)"),
        matchesForItem: db.prepare(`
      SELECT kf.keyword FROM filter_matches fm
      JOIN keyword_filters kf ON kf.id = fm.filter_id
      WHERE fm.item_id = ?
    `),

        // ── Digest ─────────────────────────────────────────────────────────
        // Get recent unread items across all feeds for a subscriber, with feed info
        digestItems: db.prepare(`
      SELECT fi.*, f.title AS feed_title, f.url AS feed_url
      FROM feed_items fi
      JOIN feeds f ON f.id = fi.feed_id
      LEFT JOIN read_states rs ON rs.item_id = fi.id AND rs.subscriber = @subscriber
      WHERE rs.item_id IS NULL
      ORDER BY fi.published_at DESC
      LIMIT @limit
    `),

        // Digest items that matched at least one keyword filter
        digestMatchedItems: db.prepare(`
      SELECT DISTINCT fi.*, f.title AS feed_title, f.url AS feed_url
      FROM feed_items fi
      JOIN feeds f ON f.id = fi.feed_id
      JOIN filter_matches fm ON fm.item_id = fi.id
      LEFT JOIN read_states rs ON rs.item_id = fi.id AND rs.subscriber = @subscriber
      WHERE rs.item_id IS NULL
      ORDER BY fi.published_at DESC
      LIMIT @limit
    `),
    };
}

export function initStatements(): void {
    _stmts = buildStatements();
    console.log("[db] Prepared statements compiled");
}

export const stmts = new Proxy({} as Stmts, {
    get(_target, prop: string) {
        if (!_stmts) throw new Error("initStatements() must be called after runMigrations()");
        return (_stmts as any)[prop];
    },
});