// Three tables:
//   feeds       — subscribed feed URLs with metadata and cache timestamp
//   feed_items  — individual articles stored from each feed
//   read_states — which subscriber has read which item
//
// The cache strategy: when a route requests items for a feed, it checks
// last_fetched_at. If it is older than FEED_CACHE_TTL_MINUTES, it re-fetches
// the live RSS URL and upserts new items. Otherwise it returns what is in SQLite.
// This avoids hammering external feed servers on every request.

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "rss.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");

export function runMigrations(): void {
    db.exec(`
    CREATE TABLE IF NOT EXISTS feeds (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      url             TEXT    NOT NULL UNIQUE,
      title           TEXT    NOT NULL DEFAULT '',
      description     TEXT    NOT NULL DEFAULT '',
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
      UNIQUE(feed_id, guid)  -- prevents duplicate items across refreshes
    );

    -- Quickly find all items for a feed sorted by date
    CREATE INDEX IF NOT EXISTS idx_items_feed_id
      ON feed_items (feed_id, published_at DESC);

    CREATE TABLE IF NOT EXISTS read_states (
      item_id    INTEGER NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
      subscriber TEXT    NOT NULL,
      read_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (item_id, subscriber)
    );

    -- Quickly find all unread items for a subscriber
    CREATE INDEX IF NOT EXISTS idx_read_states_subscriber
      ON read_states (subscriber);
  `);

    console.log("[db] Migrations complete. Database ready at:", DB_PATH);
}

export default db;