import db from "./database";

type Stmts = ReturnType<typeof buildStatements>;
let _stmts: Stmts | null = null;

function buildStatements() {
    return {
        // ── Landmarks ──────────────────────────────────────────────────────
        listLandmarks:  db.prepare("SELECT * FROM landmarks ORDER BY city, name"),
        getLandmark:    db.prepare("SELECT * FROM landmarks WHERE id = ?"),
        filterLandmarks: db.prepare(`
      SELECT * FROM landmarks
      WHERE (@city IS NULL OR LOWER(city) = LOWER(@city))
        AND (@category IS NULL OR category = @category)
      ORDER BY city, name
    `),
        searchLandmarks: db.prepare(`
      SELECT * FROM landmarks
      WHERE LOWER(name) LIKE @q OR LOWER(city) LIKE @q OR LOWER(description) LIKE @q
      ORDER BY city, name LIMIT 20
    `),

        // ── Geocode cache ──────────────────────────────────────────────────
        getGeocode:    db.prepare("SELECT * FROM geocoded_locations WHERE query = ?"),
        upsertGeocode: db.prepare(`
      INSERT INTO geocoded_locations (query, formatted_address, lat, lng, city, state, country)
      VALUES (@query, @formatted_address, @lat, @lng, @city, @state, @country)
      ON CONFLICT(query) DO UPDATE SET
        hit_count = hit_count + 1,
        cached_at = datetime('now')
    `),
        bumpGeocodeHit: db.prepare("UPDATE geocoded_locations SET hit_count = hit_count + 1 WHERE query = ?"),
        listGeocodes:   db.prepare("SELECT * FROM geocoded_locations ORDER BY hit_count DESC LIMIT 20"),

        // ── Route cache ────────────────────────────────────────────────────
        getRoute: db.prepare(`
      SELECT * FROM cached_routes WHERE origin_query = @origin AND destination_query = @destination
    `),
        upsertRoute: db.prepare(`
      INSERT INTO cached_routes
        (origin_query, destination_query, distance_text, duration_text,
         distance_meters, duration_seconds, polyline)
      VALUES
        (@origin_query, @destination_query, @distance_text, @duration_text,
         @distance_meters, @duration_seconds, @polyline)
      ON CONFLICT(origin_query, destination_query) DO UPDATE SET
        distance_text    = excluded.distance_text,
        duration_text    = excluded.duration_text,
        distance_meters  = excluded.distance_meters,
        duration_seconds = excluded.duration_seconds,
        polyline         = excluded.polyline,
        cached_at        = datetime('now')
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