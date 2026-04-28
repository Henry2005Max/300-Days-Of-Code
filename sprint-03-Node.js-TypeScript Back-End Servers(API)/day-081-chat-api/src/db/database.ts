// Three tables:
//   rooms           — persistent chat rooms
//   messages        — room message history (append-only)
//   direct_messages — private 1-to-1 messages with read receipts
//
// Why persist messages?
// Day 71's chat lost all history on server restart and showed nothing to
// late joiners. Persisting to SQLite means:
//   - New connections receive HISTORY_LIMIT recent messages on join
//   - Messages survive server restarts
//   - The REST API can expose message history without a WS connection

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "chat.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

export function runMigrations(): void {
    db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL UNIQUE,
      description TEXT    NOT NULL DEFAULT '',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id    INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      username   TEXT    NOT NULL,
      content    TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Fast backfill query: latest N messages for a room
    CREATE INDEX IF NOT EXISTS idx_messages_room
      ON messages (room_id, id DESC);

    CREATE TABLE IF NOT EXISTS direct_messages (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      from_username TEXT    NOT NULL,
      to_username   TEXT    NOT NULL,
      content       TEXT    NOT NULL,
      read_at       TEXT,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Fast lookup: unread DMs for a recipient
    CREATE INDEX IF NOT EXISTS idx_dm_recipient
      ON direct_messages (to_username, read_at);
  `);

    // Seed default rooms if empty
    const count = (db.prepare("SELECT COUNT(*) as c FROM rooms").get() as { c: number }).c;
    if (count === 0) {
        const insert = db.prepare("INSERT OR IGNORE INTO rooms (name, description) VALUES (@name, @description)");
        db.transaction(() => {
            insert.run({ name: "general",    description: "General discussion for everyone" });
            insert.run({ name: "lagos-devs", description: "Lagos developer community" });
            insert.run({ name: "random",     description: "Off-topic chat" });
        })();
        console.log("[db] Seeded 3 default rooms");
    }

    console.log("[db] Migrations complete.");
}

export default db;