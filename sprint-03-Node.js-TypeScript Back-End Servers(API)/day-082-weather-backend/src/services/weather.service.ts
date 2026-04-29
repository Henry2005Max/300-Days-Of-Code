// WeatherService: orchestrates the cache, OWM API calls, and alert evaluation.
//
// Cache strategy (same TTL pattern as Days 68, 78, 79):
//   1. Normalise city name to lowercase for consistent cache keys.
//   2. Check weather_cache for a row with cached_at within TTL.
//   3. Cache hit  → return cached row immediately.
//   4. Cache miss → call OWM, upsert the row, evaluate alerts, return result.
//
// Forecast cache: stored per (city, dt) — the 3-hour slot timestamp.
// On refresh we delete all existing slots for the city and reinsert.
// This is simpler than upsert and correct because OWM always returns a full
// 40-slot window — there is never a partial update.

import db from "../db/database";
import { stmts } from "../db/statements";
import { fetchCurrentWeather, fetchForecast } from "./owm";
import { evaluateAlerts } from "./alerts";
import { WeatherRecord, ForecastSlot, WeatherAlert } from "../types";
import { NotFoundError } from "../middleware/errorHandler";

const TTL_MINUTES = Number(process.env.WEATHER_CACHE_TTL_MINUTES) || 10;

// ── Current weather ───────────────────────────────────────────────────────────

export async function getWeather(rawCity: string): Promise<WeatherRecord & { from_cache: boolean }> {
    const city   = rawCity.toLowerCase().trim();
    const cached = stmts.getWeather.get(city) as WeatherRecord | undefined;

    if (cached && !isCacheStale(cached.cached_at)) {
        return { ...cached, from_cache: true };
    }

    // Fetch live data from OpenWeatherMap
    const data = await fetchCurrentWeather(rawCity);

    const row = {
        city,
        country:     data.sys.country,
        temp:        data.main.temp,
        feels_like:  data.main.feels_like,
        temp_min:    data.main.temp_min,
        temp_max:    data.main.temp_max,
        humidity:    data.main.humidity,
        pressure:    data.main.pressure,
        wind_speed:  data.wind.speed,
        wind_deg:    data.wind.deg,
        visibility:  data.visibility,
        condition:   data.weather[0]?.main        || "",
        description: data.weather[0]?.description || "",
        icon:        data.weather[0]?.icon        || "",
        sunrise:     data.sys.sunrise,
        sunset:      data.sys.sunset,
    };

    stmts.upsertWeather.run(row);

    const fresh = stmts.getWeather.get(city) as WeatherRecord;

    // Evaluate alert thresholds against the new reading
    evaluateAlerts(fresh);

    return { ...fresh, from_cache: false };
}

// ── Forecast ─────────────────────────────────────────────────────────────────

export async function getForecast(
    rawCity: string,
    days: number
): Promise<{ city: string; slots: ForecastSlot[]; from_cache: boolean }> {
    const city   = rawCity.toLowerCase().trim();
    const cached = stmts.getWeather.get(city) as WeatherRecord | undefined;
    const stale  = !cached || isCacheStale(cached.cached_at);

    if (stale) {
        // Re-fetch forecast and replace stored slots
        const data = await fetchForecast(rawCity);

        const insertAll = db.transaction(() => {
            stmts.deleteForecast.run(city);
            for (const slot of data.list) {
                stmts.insertForecastSlot.run({
                    city,
                    dt:          slot.dt,
                    temp:        slot.main.temp,
                    feels_like:  slot.main.feels_like,
                    humidity:    slot.main.humidity,
                    wind_speed:  slot.wind.speed,
                    condition:   slot.weather[0]?.main        || "",
                    description: slot.weather[0]?.description || "",
                    icon:        slot.weather[0]?.icon        || "",
                    pop:         slot.pop,
                });
            }
        });
        insertAll();
    }

    // Filter to the requested number of days from now
    const nowUnix  = Math.floor(Date.now() / 1000);
    const limitUnix = nowUnix + days * 86400;

    const slots = (stmts.getForecast.all(city) as ForecastSlot[])
        .filter((s) => s.dt >= nowUnix && s.dt <= limitUnix);

    return { city, slots, from_cache: !stale };
}

// ── Multi-city comparison ─────────────────────────────────────────────────────

export async function compareWeather(cities: string[]): Promise<{
    cities: (WeatherRecord & { from_cache: boolean })[];
    summary: {
        hottest:  string;
        coolest:  string;
        most_humid: string;
        windiest: string;
    };
}> {
    // Fetch all cities — Promise.allSettled so one failure doesn't block others
    const results = await Promise.allSettled(cities.map((c) => getWeather(c)));

    const successful = results
        .filter((r): r is PromiseFulfilledResult<WeatherRecord & { from_cache: boolean }> => r.status === "fulfilled")
        .map((r) => r.value);

    if (successful.length === 0) {
        throw new Error("Could not fetch weather for any of the requested cities");
    }

    const summary = {
        hottest:     successful.reduce((a, b) => a.temp > b.temp ? a : b).city,
        coolest:     successful.reduce((a, b) => a.temp < b.temp ? a : b).city,
        most_humid:  successful.reduce((a, b) => a.humidity > b.humidity ? a : b).city,
        windiest:    successful.reduce((a, b) => a.wind_speed > b.wind_speed ? a : b).city,
    };

    return { cities: successful, summary };
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export function getAlerts(city?: string, activeOnly?: boolean): WeatherAlert[] {
    if (city) {
        const normalised = city.toLowerCase().trim();
        return (activeOnly !== false
            ? stmts.getActiveAlerts.all(normalised)
            : stmts.getAllAlerts.all(normalised)) as WeatherAlert[];
    }

    // All cities — build a dynamic query
    const where = activeOnly ? "WHERE active = 1" : "";
    return db.prepare(
        `SELECT * FROM weather_alerts ${where} ORDER BY triggered_at DESC LIMIT 100`
    ).all() as WeatherAlert[];
}

export function resolveAlert(id: number): WeatherAlert {
    const alert = db.prepare("SELECT * FROM weather_alerts WHERE id = ?").get(id) as WeatherAlert | undefined;
    if (!alert) throw new NotFoundError("Alert", id);
    stmts.resolveAlertById.run(id);
    return db.prepare("SELECT * FROM weather_alerts WHERE id = ?").get(id) as WeatherAlert;
}

// ── Cached cities list ────────────────────────────────────────────────────────

export function listCachedCities(): WeatherRecord[] {
    return stmts.listCached.all() as WeatherRecord[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isCacheStale(cachedAt: string): boolean {
    const ageMs = Date.now() - new Date(cachedAt + "Z").getTime();
    return ageMs > TTL_MINUTES * 60 * 1000;
}