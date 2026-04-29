// Three tables:
//   weather_cache   — current conditions per city (one row per city, upserted on refresh)
//   forecasts       — 3-hour forecast slots per city (replaced wholesale on refresh)
//   weather_alerts  — threshold-triggered alerts with active/resolved state
//
// The same lazy statement pattern from Day 81 is used here:
// initStatements() is called explicitly after runMigrations() in bootstrap()
// so db.prepare() never runs against an empty database.

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "weather.db");
const db      = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

export function runMigrations(): void {
    db.exec(`
    CREATE TABLE IF NOT EXISTS weather_cache (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      city        TEXT    NOT NULL UNIQUE,
      country     TEXT    NOT NULL DEFAULT '',
      temp        REAL    NOT NULL DEFAULT 0,
      feels_like  REAL    NOT NULL DEFAULT 0,
      temp_min    REAL    NOT NULL DEFAULT 0,
      temp_max    REAL    NOT NULL DEFAULT 0,
      humidity    INTEGER NOT NULL DEFAULT 0,
      pressure    INTEGER NOT NULL DEFAULT 0,
      wind_speed  REAL    NOT NULL DEFAULT 0,
      wind_deg    INTEGER NOT NULL DEFAULT 0,
      visibility  INTEGER NOT NULL DEFAULT 0,
      condition   TEXT    NOT NULL DEFAULT '',
      description TEXT    NOT NULL DEFAULT '',
      icon        TEXT    NOT NULL DEFAULT '',
      sunrise     INTEGER NOT NULL DEFAULT 0,
      sunset      INTEGER NOT NULL DEFAULT 0,
      cached_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS forecasts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      city        TEXT    NOT NULL,
      dt          INTEGER NOT NULL,
      temp        REAL    NOT NULL,
      feels_like  REAL    NOT NULL,
      humidity    INTEGER NOT NULL,
      wind_speed  REAL    NOT NULL,
      condition   TEXT    NOT NULL,
      description TEXT    NOT NULL,
      icon        TEXT    NOT NULL,
      pop         REAL    NOT NULL DEFAULT 0,
      cached_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(city, dt)
    );

    CREATE INDEX IF NOT EXISTS idx_forecast_city_dt
      ON forecasts (city, dt);

    CREATE TABLE IF NOT EXISTS weather_alerts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      city         TEXT    NOT NULL,
      type         TEXT    NOT NULL,
      severity     TEXT    NOT NULL DEFAULT 'info',
      message      TEXT    NOT NULL,
      value        REAL    NOT NULL,
      threshold    REAL    NOT NULL,
      active       INTEGER NOT NULL DEFAULT 1,
      triggered_at TEXT    NOT NULL DEFAULT (datetime('now')),
      resolved_at  TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_alerts_city_active
      ON weather_alerts (city, active);
  `);

    console.log("[db] Migrations complete. Database ready at:", DB_PATH);
}

export default db;