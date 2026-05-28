import Database from 'better-sqlite3';
import fs        from 'fs';
import path      from 'path';
import dotenv    from 'dotenv';
dotenv.config();

let db: Database.Database | null = null;

function buildStatements(d: Database.Database) {
    return {
        // Sliding window — stores individual request timestamps
        insertRequest: d.prepare(`
      INSERT INTO sliding_requests (key, timestamp) VALUES (@key, @timestamp)
    `),
        countRecentRequests: d.prepare(`
      SELECT COUNT(*) AS count FROM sliding_requests
      WHERE key = @key AND timestamp > @since
    `),
        pruneOldRequests: d.prepare(`
      DELETE FROM sliding_requests WHERE timestamp < @cutoff
    `),

        // Fixed window — single row per key+window
        getFixedWindow: d.prepare(`
      SELECT * FROM fixed_windows WHERE key = @key
    `),
        upsertFixedWindow: d.prepare(`
      INSERT INTO fixed_windows (key, count, window_start)
      VALUES (@key, 1, @windowStart)
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN window_start = @windowStart THEN count + 1
          ELSE 1
        END,
        window_start = @windowStart
    `),
        resetFixedWindow: d.prepare(`
      UPDATE fixed_windows SET count = 1, window_start = @windowStart WHERE key = @key
    `),

        // Token bucket — stores token count and last refill time
        getTokenBucket: d.prepare(`
      SELECT * FROM token_buckets WHERE key = @key
    `),
        upsertTokenBucket: d.prepare(`
      INSERT INTO token_buckets (key, tokens, last_refill)
      VALUES (@key, @tokens, @lastRefill)
      ON CONFLICT (key) DO UPDATE SET tokens = @tokens, last_refill = @lastRefill
    `),

        // Request log
        logRequest: d.prepare(`
      INSERT INTO request_logs (ip, path, method, status, allowed, algorithm, timestamp)
      VALUES (@ip, @path, @method, @status, @allowed, @algorithm, @timestamp)
    `),
        getRecentLogs: d.prepare(`
      SELECT * FROM request_logs ORDER BY timestamp DESC LIMIT @limit
    `),
        getBlockedStats: d.prepare(`
      SELECT ip, path, COUNT(*) AS blocked_count
      FROM request_logs WHERE allowed = 0
      GROUP BY ip, path
      ORDER BY blocked_count DESC
      LIMIT 10
    `),
    };
}

let stmts: ReturnType<typeof buildStatements> | null = null;

export function initDb(): void {
    if (db) return;
    const dbPath = path.resolve(process.env.DB_PATH || './data/limiter.db');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    db.exec(`
    CREATE TABLE IF NOT EXISTS sliding_requests (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      key       TEXT    NOT NULL,
      timestamp INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sliding_key_ts ON sliding_requests (key, timestamp);

    CREATE TABLE IF NOT EXISTS fixed_windows (
      key          TEXT    PRIMARY KEY,
      count        INTEGER NOT NULL DEFAULT 0,
      window_start INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS token_buckets (
      key         TEXT    PRIMARY KEY,
      tokens      REAL    NOT NULL,
      last_refill INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS request_logs (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      ip        TEXT NOT NULL,
      path      TEXT NOT NULL,
      method    TEXT NOT NULL,
      status    INTEGER NOT NULL,
      allowed   INTEGER NOT NULL,
      algorithm TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_logs_ip        ON request_logs (ip);
    CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON request_logs (timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_logs_allowed   ON request_logs (allowed);
  `);

    stmts = buildStatements(db);
}

function S() {
    if (!stmts) initDb();
    return stmts!;
}

// ── Sliding window ────────────────────────────────────────────────────────

export function slidingWindowCheck(key: string, windowMs: number, maxRequests: number): {
    count: number; allowed: boolean;
} {
    const now    = Date.now();
    const since  = now - windowMs;

    S().insertRequest.run({ key, timestamp: now });

    // Prune old entries every ~100 requests (probabilistic cleanup)
    if (Math.random() < 0.01) {
        S().pruneOldRequests.run({ cutoff: since - windowMs });
    }

    const { count } = S().countRecentRequests.get({ key, since }) as { count: number };
    return { count, allowed: count <= maxRequests };
}

// ── Fixed window ──────────────────────────────────────────────────────────

export function fixedWindowCheck(key: string, windowMs: number, maxRequests: number): {
    count: number; windowStart: number; allowed: boolean;
} {
    const now         = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;

    S().upsertFixedWindow.run({ key, windowStart });

    const row = S().getFixedWindow.get({ key }) as {
        key: string; count: number; window_start: number;
    };

    const count = row.window_start === windowStart ? row.count : 1;
    return { count, windowStart, allowed: count <= maxRequests };
}

// ── Token bucket ──────────────────────────────────────────────────────────

export function tokenBucketCheck(key: string, windowMs: number, maxRequests: number): {
    tokens: number; allowed: boolean;
} {
    const now          = Date.now();
    const refillRate   = maxRequests / (windowMs / 1000); // tokens per second
    const existing     = S().getTokenBucket.get({ key }) as {
        key: string; tokens: number; last_refill: number;
    } | undefined;

    let tokens     = maxRequests;
    let lastRefill = now;

    if (existing) {
        const elapsed  = (now - existing.last_refill) / 1000;
        tokens         = Math.min(maxRequests, existing.tokens + elapsed * refillRate);
        lastRefill     = now;
    }

    const allowed = tokens >= 1;
    if (allowed) tokens -= 1;

    S().upsertTokenBucket.run({ key, tokens, lastRefill });
    return { tokens, allowed };
}

// ── Request logging ───────────────────────────────────────────────────────

export function logRequest(data: {
    ip: string; path: string; method: string;
    status: number; allowed: boolean; algorithm: string;
}): void {
    S().logRequest.run({
        ...data,
        allowed:   data.allowed ? 1 : 0,
        timestamp: new Date().toISOString(),
    });
}

export function getRecentLogs(limit = 50) {
    return S().getRecentLogs.all({ limit });
}

export function getBlockedStats() {
    return S().getBlockedStats.all();
}

export function closeDb(): void {
    if (db) { db.close(); db = null; stmts = null; }
}