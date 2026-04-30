// Four tables:
//   live_rates       — one row per currency, upserted on every cron refresh
//   rate_snapshots   — append-only history; one row per (base, currency) per refresh
//   rate_alerts      — user-defined threshold watchers
//   conversion_log   — every /convert call recorded for audit/history
//
// Lazy initStatements() pattern applied from the start (learned from Day 81 fix).

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "currency.db");
const db      = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

export function runMigrations(): void {
    db.exec(`
    CREATE TABLE IF NOT EXISTS live_rates (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      base       TEXT    NOT NULL,
      currency   TEXT    NOT NULL,
      rate       REAL    NOT NULL,
      fetched_at TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(base, currency)
    );

    CREATE TABLE IF NOT EXISTS rate_snapshots (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      base        TEXT    NOT NULL,
      currency    TEXT    NOT NULL,
      rate        REAL    NOT NULL,
      recorded_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Fast trend queries: latest N rows for a pair
    CREATE INDEX IF NOT EXISTS idx_snapshots_pair_time
      ON rate_snapshots (base, currency, recorded_at DESC);

    CREATE TABLE IF NOT EXISTS rate_alerts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      base         TEXT    NOT NULL,
      currency     TEXT    NOT NULL,
      direction    TEXT    NOT NULL CHECK(direction IN ('above','below')),
      threshold    REAL    NOT NULL,
      label        TEXT    NOT NULL DEFAULT '',
      active       INTEGER NOT NULL DEFAULT 1,
      triggered_at TEXT,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_alerts_active
      ON rate_alerts (active, base, currency);

    CREATE TABLE IF NOT EXISTS conversion_log (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      from_currency TEXT    NOT NULL,
      to_currency   TEXT    NOT NULL,
      from_amount   REAL    NOT NULL,
      to_amount     REAL    NOT NULL,
      rate          REAL    NOT NULL,
      converted_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_conversion_log_time
      ON conversion_log (converted_at DESC);
  `);

    console.log("[db] Migrations complete. Database ready at:", DB_PATH);
}

export default db;