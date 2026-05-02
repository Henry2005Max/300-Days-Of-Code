// Four tables:
//   users          — core user records with status, lockout, and verification state
//   login_history  — append-only audit log of every login attempt
//   tokens         — short-lived one-use tokens for email verification and password reset
//   refresh_tokens — long-lived tokens for JWT refresh flow
//
// Security design notes:
//   - password_hash: bcrypt output stored as TEXT (60 chars); never the raw password
//   - failed_login_attempts: incremented on each failure; reset on success
//   - locked_until: set to datetime('now', '+30 minutes') on lockout; checked on login
//   - token column in `tokens` stores a random 32-byte hex string (64 chars)
//   - refresh_tokens are also hashed (SHA-256 via crypto) before storage

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "users.db");
const db      = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function runMigrations(): void {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id                     INTEGER PRIMARY KEY AUTOINCREMENT,
      username               TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      email                  TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      password_hash          TEXT    NOT NULL,
      role                   TEXT    NOT NULL DEFAULT 'user',
      status                 TEXT    NOT NULL DEFAULT 'pending',
      failed_login_attempts  INTEGER NOT NULL DEFAULT 0,
      locked_until           TEXT,
      email_verified         INTEGER NOT NULL DEFAULT 0,
      last_login_at          TEXT,
      created_at             TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at             TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_email    ON users (email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

    CREATE TABLE IF NOT EXISTS login_history (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ip_address     TEXT    NOT NULL DEFAULT '',
      user_agent     TEXT    NOT NULL DEFAULT '',
      success        INTEGER NOT NULL DEFAULT 0,
      failure_reason TEXT,
      attempted_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_login_history_user
      ON login_history (user_id, attempted_at DESC);

    CREATE TABLE IF NOT EXISTS tokens (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token      TEXT    NOT NULL UNIQUE,
      type       TEXT    NOT NULL,
      expires_at TEXT    NOT NULL,
      used_at    TEXT,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens (token);
    CREATE INDEX IF NOT EXISTS idx_tokens_user  ON tokens (user_id, type);

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash   TEXT    NOT NULL UNIQUE,   -- SHA-256 of the raw token
      expires_at   TEXT    NOT NULL,
      revoked      INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash
      ON refresh_tokens (token_hash);
  `);

    console.log("[db] Migrations complete. Database ready at:", DB_PATH);
}

export default db;