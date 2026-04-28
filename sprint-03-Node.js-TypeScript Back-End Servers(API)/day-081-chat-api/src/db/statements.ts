// All prepared statements compiled once at startup.
//
// Optimisation: better-sqlite3 compiles a prepared statement once when
// db.prepare() is called. If you call db.prepare() inside a hot path
// (e.g. inside the WS message handler that runs on every message), SQLite
// re-parses the SQL string on every call. Caching statements here means
// the SQL is parsed exactly once, regardless of message volume.
//
// IMPORTANT: statements must be compiled AFTER runMigrations() has created
// the tables. We export a lazy `stmts` proxy — the actual Statement objects
// are built the first time any property is accessed, which is always after
// bootstrap() has called runMigrations().

import db from "./database";
import type { Statement } from "better-sqlite3";

// The real compiled statements — populated by initStatements()
let _stmts: ReturnType<typeof buildStatements> | null = null;

function buildStatements() {
    return {
        // ── Rooms ────────────────────────────────────────────────────────────
        getRoomById:   db.prepare("SELECT * FROM rooms WHERE id = ?"),
        getRoomByName: db.prepare("SELECT * FROM rooms WHERE name = ?"),
        listRooms:     db.prepare("SELECT * FROM rooms ORDER BY name"),
        insertRoom:    db.prepare("INSERT INTO rooms (name, description) VALUES (@name, @description)"),

        // ── Messages ─────────────────────────────────────────────────────────
        // ORDER BY id DESC + LIMIT gives the N most recent; we reverse in-app for display order
        getHistory:    db.prepare("SELECT * FROM messages WHERE room_id = ? ORDER BY id DESC LIMIT ?"),
        insertMessage: db.prepare("INSERT INTO messages (room_id, username, content) VALUES (@roomId, @username, @content)"),

        // ── Direct messages ──────────────────────────────────────────────────
        insertDM:      db.prepare("INSERT INTO direct_messages (from_username, to_username, content) VALUES (@from, @to, @content)"),
        markDMRead:    db.prepare("UPDATE direct_messages SET read_at = datetime('now') WHERE id = ? AND read_at IS NULL"),
        getUnreadDMs:  db.prepare("SELECT * FROM direct_messages WHERE to_username = ? AND read_at IS NULL ORDER BY created_at DESC"),
        getDMHistory:  db.prepare(`
      SELECT * FROM direct_messages
      WHERE (from_username = @a AND to_username = @b)
         OR (from_username = @b AND to_username = @a)
      ORDER BY id DESC LIMIT @limit
    `),
    };
}

// Call this once in bootstrap(), immediately after runMigrations()
export function initStatements(): void {
    _stmts = buildStatements();
}

// Proxy so callers can still write `stmts.getRoomById` — throws clearly if
// initStatements() was somehow skipped
export const stmts = new Proxy({} as ReturnType<typeof buildStatements>, {
    get(_target, prop: string) {
        if (!_stmts) throw new Error("initStatements() must be called after runMigrations()");
        return (_stmts as any)[prop];
    },
});