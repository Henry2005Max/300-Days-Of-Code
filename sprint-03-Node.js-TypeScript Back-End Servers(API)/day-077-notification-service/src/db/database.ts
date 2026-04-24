// Database setup for the notification service.
// We store every notification attempt so we can audit, retry, and report on delivery.

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "notifications.db");

// Open (or create) the database file
const db = new Database(DB_PATH);

// WAL mode: allows reads while a write is in progress — important for a
// service that might send many notifications concurrently
db.pragma("journal_mode = WAL");

export function runMigrations(): void {
    db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      type        TEXT    NOT NULL,
      to_email    TEXT    NOT NULL,
      subject     TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'pending',
      message_id  TEXT,
      error       TEXT,
      attempts    INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      sent_at     TEXT
    );

    -- Index so we can quickly query failed/pending notifications for retries
    CREATE INDEX IF NOT EXISTS idx_notifications_status
      ON notifications (status);

    -- Index for looking up a user's notification history
    CREATE INDEX IF NOT EXISTS idx_notifications_email
      ON notifications (to_email);
  `);

    console.log("[db] Migrations complete. Database ready at:", DB_PATH);
}

export default db;