// Three tables:
//   notification_jobs  — the queue; one row per notification to be delivered
//   user_preferences   — per-user channel and opt-out settings
//   delivery_logs      — append-only log of every delivery attempt
//
// Queue design:
//   Jobs move through statuses: pending → processing → sent/failed → dead
//   The worker polls for rows WHERE status IN ('pending','failed')
//     AND next_attempt_at <= datetime('now')
//   On pickup it sets status = 'processing' to prevent double-delivery.
//   On success: status = 'sent', sent_at = now.
//   On failure: status = 'failed', attempts++, next_attempt_at = backoff time.
//   When attempts >= MAX_ATTEMPTS: status = 'dead' — no more retries.

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "notifications.db");
const db      = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

export function runMigrations(): void {
    db.exec(`
    CREATE TABLE IF NOT EXISTS notification_jobs (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      type              TEXT    NOT NULL,
      channel           TEXT    NOT NULL DEFAULT 'email',
      recipient_email   TEXT    NOT NULL,
      recipient_webhook TEXT,
      subject           TEXT    NOT NULL DEFAULT '',
      body_html         TEXT    NOT NULL DEFAULT '',
      body_text         TEXT    NOT NULL DEFAULT '',
      payload           TEXT    NOT NULL DEFAULT '{}',
      status            TEXT    NOT NULL DEFAULT 'pending',
      attempts          INTEGER NOT NULL DEFAULT 0,
      next_attempt_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      last_error        TEXT,
      sent_at           TEXT,
      created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- The worker query: pick up jobs ready to attempt
    CREATE INDEX IF NOT EXISTS idx_jobs_queue
      ON notification_jobs (status, next_attempt_at);

    CREATE TABLE IF NOT EXISTS user_preferences (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      username        TEXT    NOT NULL UNIQUE,
      email           TEXT    NOT NULL,
      webhook_url     TEXT,
      channel         TEXT    NOT NULL DEFAULT 'email',
      disabled_types  TEXT    NOT NULL DEFAULT '',
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_prefs_username
      ON user_preferences (username);

    CREATE TABLE IF NOT EXISTS delivery_logs (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id       INTEGER NOT NULL REFERENCES notification_jobs(id) ON DELETE CASCADE,
      channel      TEXT    NOT NULL,
      attempt      INTEGER NOT NULL,
      success      INTEGER NOT NULL DEFAULT 0,
      response     TEXT,
      attempted_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_logs_job
      ON delivery_logs (job_id, attempted_at DESC);
  `);

    console.log("[db] Migrations complete. Database ready at:", DB_PATH);
}

export default db;