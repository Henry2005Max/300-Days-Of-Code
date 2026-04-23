import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DB_FILE || "./data/uploads.db";
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

/* Ensure upload directories exist */
["UPLOAD_DIR", "AVATAR_DIR", "DOCUMENT_DIR"].forEach((key) => {
    const p = process.env[key];
    if (p && !fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

export const db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === "development"
        ? (sql: string) => console.log(`\x1b[36m[SQL]\x1b[0m ${sql}`)
        : undefined,
});

db.pragma("journal_mode = WAL");

export function runMigrations(): void {
    db.exec(`
    CREATE TABLE IF NOT EXISTS uploads (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      original_name TEXT    NOT NULL,
      stored_name   TEXT    NOT NULL UNIQUE,
      mime_type     TEXT    NOT NULL,
      size_bytes    INTEGER NOT NULL,
      category      TEXT    NOT NULL,
      uploader_ip   TEXT    NOT NULL,
      uploaded_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

    console.log("[DB] Migrations complete");
}