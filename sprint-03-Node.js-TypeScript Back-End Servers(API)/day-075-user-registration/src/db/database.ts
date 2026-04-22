import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DB_FILE || "./data/users.db";
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

export const db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === "development"
        ? (sql: string) => console.log(`\x1b[36m[SQL]\x1b[0m ${sql}`)
        : undefined,
});

db.pragma("journal_mode = WAL");

export function runMigrations(): void {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      bio           TEXT,
      avatar_url    TEXT,
      role          TEXT    NOT NULL DEFAULT 'user',
      is_active     INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

    /* ── login_log — every auth attempt recorded ── */
    db.exec(`
    CREATE TABLE IF NOT EXISTS login_log (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id   INTEGER,
      ip        TEXT    NOT NULL,
      success   INTEGER NOT NULL,
      reason    TEXT,
      logged_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

    /* Trigger to auto-update updated_at on every user UPDATE */
    db.exec(`
    CREATE TRIGGER IF NOT EXISTS users_updated_at
    AFTER UPDATE ON users
    BEGIN
      UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `);

    console.log("[DB] Migrations complete");
}