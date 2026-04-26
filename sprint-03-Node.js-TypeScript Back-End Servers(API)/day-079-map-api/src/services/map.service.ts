// MapService: orchestrates the geocode cache, location lookups, and distance calculation.
//
// Cache strategy:
//   1. Normalise the query (lowercase + trim) so "Lagos" and "lagos" hit the same row.
//   2. Check if a row exists in `locations` with a `cached_at` within TTL.
//   3. If yes → increment hit_count, return cached row. No Google API call made.
//   4. If no (or stale) → call geocodeAddress(), store/update the row, return it.
//
// This is the same TTL pattern used in Day 68 (proxy) and Day 78 (RSS cache),
// but here the TTL is much longer (24h) because street addresses rarely move.

import db from "../db/database";
import { geocodeAddress } from "./geocoding";
import { haversineKm, bearingDegrees, bearingLabel } from "./haversine";
import { Location, NigerianCity, DistanceResult } from "../types";
import { NotFoundError } from "../middleware/errorHandler";

const TTL_HOURS = Number(process.env.GEOCODE_CACHE_TTL_HOURS) || 24;

// ── Geocode ──────────────────────────────────────────────────────────────────

export async function geocode(rawAddress: string): Promise<Location & { from_cache: boolean }> {
    const query = rawAddress.toLowerCase().trim(); // normalise for cache key

    // Check cache
    const cached = db.prepare("SELECT * FROM locations WHERE query = ?").get(query) as Location | undefined;

    if (cached && !isCacheStale(cached.cached_at)) {
        // Cache hit — bump hit_count and return immediately
        db.prepare("UPDATE locations SET hit_count = hit_count + 1 WHERE id = ?").run(cached.id);
        return { ...cached, hit_count: cached.hit_count + 1, from_cache: true };
    }

    // Cache miss or stale — call Google
    const result = await geocodeAddress(rawAddress);

    if (cached) {
        // Update the stale row in place
        db.prepare(`
      UPDATE locations
      SET formatted_address = @formatted_address,
          lat               = @lat,
          lng               = @lng,
          city              = @city,
          state             = @state,
          country           = @country,
          postal_code       = @postal_code,
          hit_count         = hit_count + 1,
          cached_at         = datetime('now')
      WHERE id = @id
    `).run({ ...result, id: cached.id });

        return { ...cached, ...result, hit_count: cached.hit_count + 1, from_cache: false };
    }

    // Brand new address — insert
    const inserted = db.prepare(`
    INSERT INTO locations
      (query, formatted_address, lat, lng, city, state, country, postal_code)
    VALUES
      (@query, @formatted_address, @lat, @lng, @city, @state, @country, @postal_code)
  `).run({ query, ...result });

    return getLocationById(inserted.lastInsertRowid as number, false);
}

// ── History ──────────────────────────────────────────────────────────────────

export function listHistory(opts: {
    limit: number;
    offset: number;
    country?: string;
}): { rows: Location[]; total: number } {
    const conditions: string[] = [];
    const params: Record<string, unknown> = { limit: opts.limit, offset: opts.offset };

    if (opts.country) {
        conditions.push("LOWER(country) = LOWER(@country)");
        params.country = opts.country;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows  = db.prepare(`SELECT * FROM locations ${where} ORDER BY hit_count DESC, created_at DESC LIMIT @limit OFFSET @offset`).all(params) as Location[];
    const total = (db.prepare(`SELECT COUNT(*) as count FROM locations ${where}`).get(params) as { count: number }).count;

    return { rows, total };
}

export function getLocationById(id: number, throws = true): Location & { from_cache: boolean } {
    const row = db.prepare("SELECT * FROM locations WHERE id = ?").get(id) as Location | undefined;
    if (!row && throws) throw new NotFoundError("Location", id);
    return { ...row!, from_cache: true };
}

export function deleteLocation(id: number): void {
    const row = db.prepare("SELECT id FROM locations WHERE id = ?").get(id);
    if (!row) throw new NotFoundError("Location", id);
    db.prepare("DELETE FROM locations WHERE id = ?").run(id);
}

// ── Distance ─────────────────────────────────────────────────────────────────

export function calculateDistance(fromId: number, toId: number): DistanceResult {
    const from = getLocationById(fromId);
    const to   = getLocationById(toId);

    const km      = haversineKm(from.lat, from.lng, to.lat, to.lng);
    const bearing = bearingDegrees(from.lat, from.lng, to.lat, to.lng);

    return {
        from:           { id: from.id, formatted_address: from.formatted_address, lat: from.lat, lng: from.lng },
        to:             { id: to.id,   formatted_address: to.formatted_address,   lat: to.lat,   lng: to.lng   },
        distance_km:    Math.round(km * 10) / 10,           // 1 decimal place
        distance_miles: Math.round(km * 0.621371 * 10) / 10,
        bearing_degrees: Math.round(bearing * 10) / 10,
        bearing_label:  bearingLabel(bearing),
    };
}

// ── Nigerian cities ──────────────────────────────────────────────────────────

export function listCities(opts: {
    state?: string;
    search?: string;
    limit: number;
}): NigerianCity[] {
    const conditions: string[] = [];
    const params: Record<string, unknown> = { limit: opts.limit };

    if (opts.state) {
        conditions.push("LOWER(state) = LOWER(@state)");
        params.state = opts.state;
    }

    if (opts.search) {
        conditions.push("(LOWER(name) LIKE @search OR LOWER(state) LIKE @search)");
        params.search = `%${opts.search.toLowerCase()}%`;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    return db.prepare(
        `SELECT * FROM nigerian_cities ${where} ORDER BY population DESC LIMIT @limit`
    ).all(params) as NigerianCity[];
}

export function getCityById(id: number): NigerianCity {
    const row = db.prepare("SELECT * FROM nigerian_cities WHERE id = ?").get(id) as NigerianCity | undefined;
    if (!row) throw new NotFoundError("City", id);
    return row;
}

// Distance between two seeded cities — no Google API needed
export function distanceBetweenCities(fromId: number, toId: number): {
    from: NigerianCity;
    to: NigerianCity;
    distance_km: number;
    distance_miles: number;
    bearing_degrees: number;
    bearing_label: string;
} {
    const from = getCityById(fromId);
    const to   = getCityById(toId);

    const km      = haversineKm(from.lat, from.lng, to.lat, to.lng);
    const bearing = bearingDegrees(from.lat, from.lng, to.lat, to.lng);

    return {
        from,
        to,
        distance_km:     Math.round(km * 10) / 10,
        distance_miles:  Math.round(km * 0.621371 * 10) / 10,
        bearing_degrees: Math.round(bearing * 10) / 10,
        bearing_label:   bearingLabel(bearing),
    };
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function isCacheStale(cachedAt: string): boolean {
    const cachedMs = new Date(cachedAt + "Z").getTime();
    const ageMs    = Date.now() - cachedMs;
    return ageMs > TTL_HOURS * 60 * 60 * 1000;
}