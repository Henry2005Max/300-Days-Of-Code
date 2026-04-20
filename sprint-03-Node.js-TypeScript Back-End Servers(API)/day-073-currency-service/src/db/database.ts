import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DB_FILE || "./data/currency.db";
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

export const db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === "development"
        ? (sql: string) => console.log(`\x1b[36m[SQL]\x1b[0m ${sql}`)
        : undefined,
});

db.pragma("journal_mode = WAL");

export function runMigrations(): void {
    /* ── rate_snapshots ──────────────────────────────────────────────────
       Each row is one complete set of exchange rates at one point in time.
       We store the full rates object as JSON — it's typically 170 currencies.
       Querying individual rates from within the JSON isn't needed, so a
       single JSON column is cleaner than 170 separate columns.
    ────────────────────────────────────────────────────────────────────── */
    db.exec(`
    CREATE TABLE IF NOT EXISTS rate_snapshots (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      base       TEXT    NOT NULL,
      fetched_at TEXT    NOT NULL DEFAULT (datetime('now')),
      rates_json TEXT    NOT NULL
    );
  `);

    /* Index to quickly find the latest snapshot for a given base */
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_snapshots_base_time
    ON rate_snapshots (base, fetched_at DESC);
  `);

    /* ── refresh_log — tracks every background job run ── */
    db.exec(`
    CREATE TABLE IF NOT EXISTS refresh_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      ran_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      success     INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL,
      error       TEXT
    );
  `);

    console.log("[DB] Migrations complete");
}