// Single table: uploaded_files
// Stores metadata for every file written to disk.
// The actual bytes live in the UPLOAD_DIR folder; SQLite tracks the mapping
// from original name → stored (hashed) filename → URL.
//
// Soft-delete pattern: files are never removed from the DB — status is set
// to "deleted" and deleted_at is stamped. The physical file IS deleted from disk.
// This gives a complete audit trail of what was uploaded and when it was removed.

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH    = path.join(process.cwd(), "files.db");
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
const db         = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

export function runMigrations(): void {
    // Ensure the upload directory exists before anything tries to write files
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        console.log(`[db] Created upload directory: ${UPLOAD_DIR}`);
    }

    db.exec(`
    CREATE TABLE IF NOT EXISTS uploaded_files (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      original_name TEXT    NOT NULL,
      stored_name   TEXT    NOT NULL UNIQUE,
      mime_type     TEXT    NOT NULL,
      size_bytes    INTEGER NOT NULL,
      category      TEXT    NOT NULL DEFAULT 'other',
      uploader      TEXT    NOT NULL DEFAULT 'anonymous',
      download_url  TEXT    NOT NULL,
      status        TEXT    NOT NULL DEFAULT 'active',
      uploaded_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      deleted_at    TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_files_uploader
      ON uploaded_files (uploader, uploaded_at DESC);

    CREATE INDEX IF NOT EXISTS idx_files_category
      ON uploaded_files (category, status);

    CREATE INDEX IF NOT EXISTS idx_files_status
      ON uploaded_files (status, uploaded_at DESC);
  `);

    console.log("[db] Migrations complete. Database ready at:", DB_PATH);
}

export default db;