// MapsService: geocoding with 24h SQLite cache, Directions API with cache,
// and landmark queries served directly from SQLite seed data.
//
// What's new vs Day 79 (Map API):
//   Day 79 was a pure REST geocoding API.
//   Day 89 adds the Directions API (encoded polyline for route drawing on the
//   frontend map) and serves a full interactive HTML frontend.
//   The API key is never exposed to the browser — the frontend calls
//   our own /api/geocode and /api/directions endpoints, and the server
//   makes the Google API calls server-side with the secret key.

import axios from "axios";
import { stmts } from "../db/statements";
import { Landmark, GeocodedLocation, CachedRoute } from "../types";
import { NotFoundError, BadRequestError, ServiceUnavailableError } from "../middleware/errorHandler";

const BASE    = "https://maps.googleapis.com/maps/api";
const TIMEOUT = Number(process.env.MAPS_FETCH_TIMEOUT_MS)  || 6000;
const TTL_H   = Number(process.env.GEOCODE_CACHE_TTL_HOURS) || 24;

function getKey(): string {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key || key === "your_api_key_here") {
        throw new ServiceUnavailableError("GOOGLE_MAPS_API_KEY is not set. Add it to .env.");
    }
    return key;
}

function isStale(cachedAt: string): boolean {
    return Date.now() - new Date(cachedAt + "Z").getTime() > TTL_H * 3600 * 1000;
}

function extractComponent(components: any[], type: string): string {
    return components.find((c: any) => c.types.includes(type))?.long_name || "";
}

// ── Landmarks ─────────────────────────────────────────────────────────────────

export function getLandmarks(city?: string, category?: string): Landmark[] {
    return stmts.filterLandmarks.all({
        city:     city     ?? null,
        category: category ?? null,
    }) as Landmark[];
}

export function getLandmarkById(id: number): Landmark {
    const row = stmts.getLandmark.get(id) as Landmark | undefined;
    if (!row) throw new NotFoundError("Landmark", id);
    return row;
}

export function searchLandmarks(q: string): Landmark[] {
    return stmts.searchLandmarks.all({ q: `%${q.toLowerCase()}%` }) as Landmark[];
}

// ── Geocoding ─────────────────────────────────────────────────────────────────

export async function geocode(rawAddress: string): Promise<GeocodedLocation & { from_cache: boolean }> {
    const query  = rawAddress.toLowerCase().trim();
    const cached = stmts.getGeocode.get(query) as GeocodedLocation | undefined;

    if (cached && !isStale(cached.cached_at)) {
        stmts.bumpGeocodeHit.run(query);
        return { ...cached, hit_count: cached.hit_count + 1, from_cache: true };
    }

    const key = getKey();
    let res;
    try {
        res = await axios.get(`${BASE}/geocode/json`, {
            params: { address: rawAddress, key },
            timeout: TIMEOUT,
        });
    } catch (err: any) {
        throw new ServiceUnavailableError(`Google Geocoding request failed: ${err.message}`);
    }

    const { status, results } = res.data;
    if (status === "ZERO_RESULTS" || !results?.length) {
        throw new BadRequestError(`No results for address: "${rawAddress}"`);
    }
    if (status !== "OK") {
        throw new ServiceUnavailableError(`Google Geocoding API returned: ${status}`);
    }

    const r     = results[0];
    const comps = r.address_components;
    const row   = {
        query,
        formatted_address: r.formatted_address,
        lat:               r.geometry.location.lat,
        lng:               r.geometry.location.lng,
        city:              extractComponent(comps, "locality") || extractComponent(comps, "sublocality_level_1"),
        state:             extractComponent(comps, "administrative_area_level_1"),
        country:           extractComponent(comps, "country"),
    };

    stmts.upsertGeocode.run(row);
    const fresh = stmts.getGeocode.get(query) as GeocodedLocation;
    return { ...fresh, from_cache: false };
}

// ── Directions ────────────────────────────────────────────────────────────────

export async function getDirections(
    origin: string, destination: string
): Promise<CachedRoute & { from_cache: boolean }> {
    const oq = origin.toLowerCase().trim();
    const dq = destination.toLowerCase().trim();

    if (oq === dq) throw new BadRequestError("Origin and destination must be different");

    const cached = stmts.getRoute.get({ origin: oq, destination: dq }) as CachedRoute | undefined;
    if (cached && !isStale(cached.cached_at)) {
        return { ...cached, from_cache: true };
    }

    const key = getKey();
    let res;
    try {
        res = await axios.get(`${BASE}/directions/json`, {
            params: { origin, destination, key, region: "NG" },
            timeout: TIMEOUT,
        });
    } catch (err: any) {
        throw new ServiceUnavailableError(`Google Directions request failed: ${err.message}`);
    }

    const { status, routes } = res.data;
    if (status === "NOT_FOUND" || status === "ZERO_RESULTS" || !routes?.length) {
        throw new BadRequestError(`No route found between "${origin}" and "${destination}"`);
    }
    if (status !== "OK") {
        throw new ServiceUnavailableError(`Google Directions API returned: ${status}`);
    }

    const leg  = routes[0].legs[0];
    const row  = {
        origin_query:      oq,
        destination_query: dq,
        distance_text:     leg.distance.text,
        duration_text:     leg.duration.text,
        distance_meters:   leg.distance.value,
        duration_seconds:  leg.duration.value,
        polyline:          routes[0].overview_polyline.points,
    };

    stmts.upsertRoute.run(row);
    const fresh = stmts.getRoute.get({ origin: oq, destination: dq }) as CachedRoute;
    return { ...fresh, from_cache: false };
}

// ── Recent geocode history ────────────────────────────────────────────────────

export function recentSearches(): GeocodedLocation[] {
    return stmts.listGeocodes.all() as GeocodedLocation[];
}