// Prepared statements — compiled once after runMigrations() via initStatements().
// Using the same lazy Proxy pattern introduced in the Day 81 fix:
// top-level db.prepare() calls are never made; all compilation happens inside
// buildStatements() which is only called after tables exist.

import db from "./database";

type Stmts = ReturnType<typeof buildStatements>;
let _stmts: Stmts | null = null;

function buildStatements() {
    return {
        // ── Weather cache ──────────────────────────────────────────────────
        getWeather:   db.prepare("SELECT * FROM weather_cache WHERE city = ?"),
        upsertWeather: db.prepare(`
      INSERT INTO weather_cache
        (city, country, temp, feels_like, temp_min, temp_max, humidity, pressure,
         wind_speed, wind_deg, visibility, condition, description, icon, sunrise, sunset, cached_at)
      VALUES
        (@city, @country, @temp, @feels_like, @temp_min, @temp_max, @humidity, @pressure,
         @wind_speed, @wind_deg, @visibility, @condition, @description, @icon, @sunrise, @sunset, datetime('now'))
      ON CONFLICT(city) DO UPDATE SET
        country = excluded.country, temp = excluded.temp, feels_like = excluded.feels_like,
        temp_min = excluded.temp_min, temp_max = excluded.temp_max, humidity = excluded.humidity,
        pressure = excluded.pressure, wind_speed = excluded.wind_speed, wind_deg = excluded.wind_deg,
        visibility = excluded.visibility, condition = excluded.condition, description = excluded.description,
        icon = excluded.icon, sunrise = excluded.sunrise, sunset = excluded.sunset,
        cached_at = datetime('now')
    `),
        listCached:   db.prepare("SELECT * FROM weather_cache ORDER BY cached_at DESC"),

        // ── Forecasts ──────────────────────────────────────────────────────
        getForecast:      db.prepare("SELECT * FROM forecasts WHERE city = ? ORDER BY dt ASC"),
        deleteForecast:   db.prepare("DELETE FROM forecasts WHERE city = ?"),
        insertForecastSlot: db.prepare(`
      INSERT OR REPLACE INTO forecasts (city, dt, temp, feels_like, humidity, wind_speed, condition, description, icon, pop)
      VALUES (@city, @dt, @temp, @feels_like, @humidity, @wind_speed, @condition, @description, @icon, @pop)
    `),

        // ── Alerts ────────────────────────────────────────────────────────
        getActiveAlerts:  db.prepare("SELECT * FROM weather_alerts WHERE city = ? AND active = 1 ORDER BY triggered_at DESC"),
        getAllAlerts:      db.prepare("SELECT * FROM weather_alerts WHERE city = ? ORDER BY triggered_at DESC LIMIT 50"),
        insertAlert:      db.prepare(`
      INSERT INTO weather_alerts (city, type, severity, message, value, threshold)
      VALUES (@city, @type, @severity, @message, @value, @threshold)
    `),
        resolveAlert:     db.prepare(`
      UPDATE weather_alerts SET active = 0, resolved_at = datetime('now')
      WHERE city = @city AND type = @type AND active = 1
    `),
        resolveAlertById: db.prepare(`
      UPDATE weather_alerts SET active = 0, resolved_at = datetime('now') WHERE id = ?
    `),
    };
}

export function initStatements(): void {
    _stmts = buildStatements();
    console.log("[db] Prepared statements compiled");
}

export const stmts = new Proxy({} as Stmts, {
    get(_target, prop: string) {
        if (!_stmts) throw new Error("initStatements() must be called after runMigrations()");
        return (_stmts as any)[prop];
    },
});