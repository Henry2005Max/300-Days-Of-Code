import Database from 'better-sqlite3';
import fs       from 'fs';
import path     from 'path';
import dotenv   from 'dotenv';
dotenv.config();

let db: Database.Database | null = null;

function buildStatements(d: Database.Database) {
    return {
        insertReading: d.prepare(`
      INSERT INTO readings (city_name, temp_c, feels_like_c, humidity, wind_kph, rain_1h, condition, condition_id, visibility, fetched_at)
      VALUES (@cityName, @tempC, @feelsLikeC, @humidity, @windKph, @rain1h, @condition, @conditionId, @visibility, @fetchedAt)
    `),
        insertAlert: d.prepare(`
      INSERT INTO alerts (city_name, type, severity, message, value, threshold, triggered_at)
      VALUES (@cityName, @type, @severity, @message, @value, @threshold, @triggeredAt)
    `),
        getLatestReadings: d.prepare(`
      SELECT DISTINCT ON_city.*
      FROM readings ON_city
      INNER JOIN (
        SELECT city_name, MAX(fetched_at) AS latest
        FROM readings
        GROUP BY city_name
      ) latest_per_city
        ON ON_city.city_name = latest_per_city.city_name
        AND ON_city.fetched_at = latest_per_city.latest
      ORDER BY ON_city.city_name
    `),
        // SQLite-compatible version of above
        getLatestReadingsSqlite: d.prepare(`
      SELECT r.*
      FROM readings r
      INNER JOIN (
        SELECT city_name, MAX(fetched_at) AS latest
        FROM readings
        GROUP BY city_name
      ) m ON r.city_name = m.city_name AND r.fetched_at = m.latest
      ORDER BY r.city_name
    `),
        getReadingHistory: d.prepare(`
      SELECT * FROM readings
      WHERE city_name = @cityName
      ORDER BY fetched_at DESC
      LIMIT @limit
    `),
        getRecentAlerts: d.prepare(`
      SELECT * FROM alerts
      ORDER BY triggered_at DESC
      LIMIT @limit
    `),
        getAlertsBySeverity: d.prepare(`
      SELECT * FROM alerts
      WHERE severity = @severity
      ORDER BY triggered_at DESC
      LIMIT @limit
    `),
        getAlertStats: d.prepare(`
      SELECT city_name, type, severity, COUNT(*) AS count
      FROM alerts
      GROUP BY city_name, type, severity
      ORDER BY count DESC
    `),
    };
}

let stmts: ReturnType<typeof buildStatements> | null = null;

function initDb(): void {
    if (db) return;
    const dbPath = path.resolve(process.env.DB_PATH || './data/weather.db');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    db.exec(`
    CREATE TABLE IF NOT EXISTS readings (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      city_name    TEXT    NOT NULL,
      temp_c       REAL    NOT NULL,
      feels_like_c REAL    NOT NULL,
      humidity     INTEGER NOT NULL,
      wind_kph     REAL    NOT NULL,
      rain_1h      REAL    NOT NULL DEFAULT 0,
      condition    TEXT    NOT NULL,
      condition_id INTEGER NOT NULL,
      visibility   INTEGER NOT NULL,
      fetched_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_readings_city   ON readings (city_name);
    CREATE INDEX IF NOT EXISTS idx_readings_time   ON readings (fetched_at DESC);

    CREATE TABLE IF NOT EXISTS alerts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      city_name    TEXT NOT NULL,
      type         TEXT NOT NULL,
      severity     TEXT NOT NULL,
      message      TEXT NOT NULL,
      value        REAL NOT NULL,
      threshold    REAL NOT NULL,
      triggered_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_alerts_city     ON alerts (city_name);
    CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts (severity);
    CREATE INDEX IF NOT EXISTS idx_alerts_time     ON alerts (triggered_at DESC);
  `);

    stmts = buildStatements(db);
}

function S() {
    if (!stmts) initDb();
    return stmts!;
}

export function saveReading(r: {
    cityName: string; tempC: number; feelsLikeC: number; humidity: number;
    windKph: number; rain1h: number; condition: string; conditionId: number;
    visibility: number; fetchedAt: string;
}): void {
    S().insertReading.run(r);
}

export function saveAlert(a: {
    cityName: string; type: string; severity: string;
    message: string; value: number; threshold: number; triggeredAt: string;
}): void {
    S().insertAlert.run(a);
}

export function getLatestReadings() {
    return S().getLatestReadingsSqlite.all() as Record<string, unknown>[];
}

export function getReadingHistory(cityName: string, limit = 10) {
    return S().getReadingHistory.all({ cityName, limit }) as Record<string, unknown>[];
}

export function getRecentAlerts(limit = 20) {
    return S().getRecentAlerts.all({ limit }) as Record<string, unknown>[];
}

export function getAlertStats() {
    return S().getAlertStats.all() as {
        city_name: string; type: string; severity: string; count: number;
    }[];
}

export function closeDb(): void {
    if (db) { db.close(); db = null; stmts = null; }
}