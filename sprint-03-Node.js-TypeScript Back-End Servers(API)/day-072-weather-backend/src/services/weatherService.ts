import axios from "axios";
import { db } from "../db/database";
import { LocationRow, WeatherRow, Location, WeatherReading, DailyForecast } from "../types";

const OPEN_METEO = process.env.OPEN_METEO_URL || "https://api.open-meteo.com/v1";
const CACHE_FRESH_MS = Number(process.env.CACHE_FRESH_MS) || 600_000;

/* ── WMO weather code descriptions ── */
const WMO: Record<number, string> = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Icy fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    80: "Slight showers", 81: "Moderate showers", 82: "Violent showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail",
};

function describe(code: number): string {
    return WMO[code] ?? `Code ${code}`;
}

/* ── Row converters ── */
function toLocation(row: LocationRow): Location {
    return {
        id:            row.id,
        slug:          row.slug,
        name:          row.name,
        state:         row.state,
        latitude:      row.latitude,
        longitude:     row.longitude,
        timezone:      row.timezone,
        fetchCount:    row.fetch_count,
        lastFetchedAt: row.last_fetched_at,
    };
}

function toReading(row: WeatherRow): WeatherReading {
    return {
        id:          row.id,
        locationId:  row.location_id,
        fetchedAt:   row.fetched_at,
        temperature: row.temperature,
        feelsLike:   row.feels_like,
        humidity:    row.humidity,
        windSpeed:   row.wind_speed,
        weatherCode: row.weather_code,
        description: row.description,
        isDay:       row.is_day === 1,
        forecast:    JSON.parse(row.forecast_json) as DailyForecast[],
    };
}

/* ── Get all locations ── */
export function getAllLocations(): Location[] {
    const rows = db.prepare(
        "SELECT * FROM locations ORDER BY name ASC"
    ).all() as LocationRow[];
    return rows.map(toLocation);
}

/* ── Get one location by slug ── */
export function getLocation(slug: string): Location | null {
    const row = db.prepare(
        "SELECT * FROM locations WHERE slug = ?"
    ).get(slug) as LocationRow | undefined;
    return row ? toLocation(row) : null;
}

/* ── Get current weather — checks freshness, fetches if stale ────────
   This is the core function. It:
   1. Looks up the location in the DB
   2. Checks the most recent reading — is it fresh enough?
   3. If fresh → return it (no API call)
   4. If stale/missing → call Open-Meteo, store the result, return it
────────────────────────────────────────────────────────────────────── */
export async function getCurrentWeather(slug: string): Promise<{
    location: Location;
    reading: WeatherReading;
    fromCache: boolean;
}> {
    const location = getLocation(slug);
    if (!location) throw new Error(`Location "${slug}" not found`);

    /* Check for a fresh cached reading */
    const latestRow = db.prepare(`
    SELECT * FROM weather_readings
    WHERE location_id = ?
    ORDER BY fetched_at DESC
    LIMIT 1
  `).get(location.id) as WeatherRow | undefined;

    const freshMs = Date.now() - (latestRow
        ? new Date(latestRow.fetched_at).getTime()
        : 0);

    if (latestRow && freshMs < CACHE_FRESH_MS) {
        console.log(`[WEATHER] Cache HIT for ${location.name} (${Math.round(freshMs / 1000)}s old)`);
        return { location, reading: toReading(latestRow), fromCache: true };
    }

    /* Stale or missing — fetch from Open-Meteo */
    console.log(`[WEATHER] Fetching from Open-Meteo for ${location.name}...`);

    const { data } = await axios.get(`${OPEN_METEO}/forecast`, {
        params: {
            latitude:      location.latitude,
            longitude:     location.longitude,
            current:       "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day",
            daily:         "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
            timezone:      "Africa/Lagos",
            forecast_days: 7,
        },
        timeout: 10_000,
    });

    const c = data.current;
    const d = data.daily;

    /* Build 7-day forecast array */
    const forecast: DailyForecast[] = (d.time as string[]).map((date: string, i: number) => ({
        date,
        tempMax:          Math.round(d.temperature_2m_max[i]),
        tempMin:          Math.round(d.temperature_2m_min[i]),
        precipitationSum: d.precipitation_sum[i],
        description:      describe(d.weather_code[i]),
    }));

    /* Insert reading into database */
    const result = db.prepare(`
    INSERT INTO weather_readings
      (location_id, temperature, feels_like, humidity, wind_speed, weather_code, description, is_day, forecast_json)
    VALUES
      (@locationId, @temperature, @feelsLike, @humidity, @windSpeed, @weatherCode, @description, @isDay, @forecastJson)
  `).run({
        locationId:   location.id,
        temperature:  Math.round(c.temperature_2m * 10) / 10,
        feelsLike:    Math.round(c.apparent_temperature * 10) / 10,
        humidity:     c.relative_humidity_2m,
        windSpeed:    c.wind_speed_10m,
        weatherCode:  c.weather_code,
        description:  describe(c.weather_code),
        isDay:        c.is_day,
        forecastJson: JSON.stringify(forecast),
    });

    /* Update location fetch stats */
    db.prepare(`
    UPDATE locations
    SET fetch_count = fetch_count + 1,
        last_fetched_at = datetime('now')
    WHERE id = ?
  `).run(location.id);

    const newRow = db.prepare(
        "SELECT * FROM weather_readings WHERE id = ?"
    ).get(result.lastInsertRowid) as WeatherRow;

    /* Re-read location to get updated fetch_count */
    const updatedLocation = getLocation(slug)!;

    console.log(`[WEATHER] Stored reading for ${location.name} (fetch #${updatedLocation.fetchCount})`);

    return { location: updatedLocation, reading: toReading(newRow), fromCache: false };
}

/* ── Get reading history for a location ── */
export function getHistory(
    slug: string,
    limit: number = 24
): { location: Location; readings: WeatherReading[] } | null {
    const location = getLocation(slug);
    if (!location) return null;

    const rows = db.prepare(`
    SELECT * FROM weather_readings
    WHERE location_id = ?
    ORDER BY fetched_at DESC
    LIMIT ?
  `).all(location.id, limit) as WeatherRow[];

    return { location, readings: rows.map(toReading) };
}

/* ── Get stats — most-queried cities, total readings ── */
export function getStats() {
    const totalReadings = (db.prepare(
        "SELECT COUNT(*) as c FROM weather_readings"
    ).get() as any).c;

    const topLocations = db.prepare(`
    SELECT l.name, l.state, l.fetch_count, l.last_fetched_at
    FROM locations l
    ORDER BY l.fetch_count DESC
    LIMIT 5
  `).all();

    const totalLocations = (db.prepare(
        "SELECT COUNT(*) as c FROM locations"
    ).get() as any).c;

    return { totalReadings, totalLocations, topLocations };
}