// Five tables (extending Day 78's three-table schema):
//   feeds           — subscribed feed URLs
//   feed_items      — cached articles
//   read_states     — per-subscriber read/unread
//   keyword_filters — per-feed keyword watchers (NEW)
//   filter_matches  — which items matched which filter (NEW — append-only)
//
// New in Day 88 vs Day 78:
//   keyword_filters: when a feed is refreshed, every new item's title +
//   description is checked against its feed's active keyword filters.
//   Matches are stored in filter_matches so the digest can surface them.

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "rss.db");
const db      = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

export function runMigrations(): void {
    db.exec(`
    CREATE TABLE IF NOT EXISTS feeds (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      url             TEXT    NOT NULL UNIQUE,
      title           TEXT    NOT NULL DEFAULT '',
      description     TEXT    NOT NULL DEFAULT '',
      site_url        TEXT    NOT NULL DEFAULT '',
      last_fetched_at TEXT,
      item_count      INTEGER NOT NULL DEFAULT 0,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS feed_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      feed_id      INTEGER NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
      guid         TEXT    NOT NULL,
      title        TEXT    NOT NULL DEFAULT '',
      link         TEXT    NOT NULL DEFAULT '',
      description  TEXT    NOT NULL DEFAULT '',
      author       TEXT    NOT NULL DEFAULT '',
      published_at TEXT    NOT NULL DEFAULT (datetime('now')),
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(feed_id, guid)
    );

    CREATE INDEX IF NOT EXISTS idx_items_feed_date
      ON feed_items (feed_id, published_at DESC);

    CREATE TABLE IF NOT EXISTS read_states (
      item_id    INTEGER NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
      subscriber TEXT    NOT NULL,
      read_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (item_id, subscriber)
    );

    CREATE INDEX IF NOT EXISTS idx_read_subscriber
      ON read_states (subscriber);

    -- NEW: keyword filters per feed
    CREATE TABLE IF NOT EXISTS keyword_filters (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      feed_id    INTEGER NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
      keyword    TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(feed_id, keyword)
    );

    CREATE INDEX IF NOT EXISTS idx_filters_feed
      ON keyword_filters (feed_id);

    -- NEW: append-only record of filter matches
    CREATE TABLE IF NOT EXISTS filter_matches (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id    INTEGER NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
      filter_id  INTEGER NOT NULL REFERENCES keyword_filters(id) ON DELETE CASCADE,
      matched_at TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(item_id, filter_id)
    );

    CREATE INDEX IF NOT EXISTS idx_matches_item
      ON filter_matches (item_id);
  `);

    console.log("[db] Migrations complete. Database ready at:", DB_PATH);
}

export default db;