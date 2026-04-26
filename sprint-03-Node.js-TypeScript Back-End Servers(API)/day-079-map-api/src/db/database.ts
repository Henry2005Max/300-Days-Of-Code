// Two tables:
//   locations      — geocoded address cache (query → lat/lng + components)
//   nigerian_cities — seeded reference table of major Nigerian cities
//
// Cache strategy: on geocode request, first check if `query` (lowercased) already
// exists in `locations` and was cached within GEOCODE_CACHE_TTL_HOURS.
// If yes, increment hit_count and return the cached row.
// If no (or stale), call Google's API, store/update the row, then return it.
// This avoids burning API quota on repeated lookups of the same address.

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "map.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");

// Major Nigerian cities with accurate coordinates
const NIGERIAN_CITIES = [
    { name: "Lagos",         state: "Lagos",          lat: 6.5244,   lng: 3.3792,   population: 14862000 },
    { name: "Abuja",         state: "FCT",             lat: 9.0765,   lng: 7.3986,   population: 3464000  },
    { name: "Kano",          state: "Kano",            lat: 12.0022,  lng: 8.5920,   population: 3848000  },
    { name: "Ibadan",        state: "Oyo",             lat: 7.3775,   lng: 3.9470,   population: 3552000  },
    { name: "Port Harcourt", state: "Rivers",          lat: 4.8156,   lng: 7.0498,   population: 1865000  },
    { name: "Benin City",    state: "Edo",             lat: 6.3350,   lng: 5.6270,   population: 1782000  },
    { name: "Maiduguri",     state: "Borno",           lat: 11.8311,  lng: 13.1510,  population: 1197000  },
    { name: "Zaria",         state: "Kaduna",          lat: 11.0801,  lng: 7.7187,   population: 975000   },
    { name: "Aba",           state: "Abia",            lat: 5.1066,   lng: 7.3667,   population: 897560   },
    { name: "Jos",           state: "Plateau",         lat: 9.8965,   lng: 8.8583,   population: 816824   },
    { name: "Enugu",         state: "Enugu",           lat: 6.4584,   lng: 7.5464,   population: 722664   },
    { name: "Kaduna",        state: "Kaduna",          lat: 10.5105,  lng: 7.4165,   population: 760084   },
    { name: "Onitsha",       state: "Anambra",         lat: 6.1667,   lng: 6.7833,   population: 561671   },
    { name: "Warri",         state: "Delta",           lat: 5.5167,   lng: 5.7500,   population: 536020   },
    { name: "Sokoto",        state: "Sokoto",          lat: 13.0622,  lng: 5.2339,   population: 427760   },
];

export function runMigrations(): void {
    db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      query             TEXT    NOT NULL UNIQUE,   -- normalised (lowercased) search string
      formatted_address TEXT    NOT NULL,
      lat               REAL    NOT NULL,
      lng               REAL    NOT NULL,
      city              TEXT    NOT NULL DEFAULT '',
      state             TEXT    NOT NULL DEFAULT '',
      country           TEXT    NOT NULL DEFAULT '',
      postal_code       TEXT    NOT NULL DEFAULT '',
      hit_count         INTEGER NOT NULL DEFAULT 1,
      cached_at         TEXT    NOT NULL DEFAULT (datetime('now')),
      created_at        TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Spatial-ish index: not a true R-tree but helps range queries on lat/lng
    CREATE INDEX IF NOT EXISTS idx_locations_lat_lng
      ON locations (lat, lng);

    CREATE TABLE IF NOT EXISTS nigerian_cities (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL UNIQUE,
      state      TEXT    NOT NULL,
      lat        REAL    NOT NULL,
      lng        REAL    NOT NULL,
      population INTEGER NOT NULL DEFAULT 0
    );
  `);

    // Seed Nigerian cities if the table is empty
    const count = (db.prepare("SELECT COUNT(*) as c FROM nigerian_cities").get() as { c: number }).c;
    if (count === 0) {
        const stmt = db.prepare(
            "INSERT OR IGNORE INTO nigerian_cities (name, state, lat, lng, population) VALUES (@name, @state, @lat, @lng, @population)"
        );
        const seedAll = db.transaction(() => {
            for (const city of NIGERIAN_CITIES) stmt.run(city);
        });
        seedAll();
        console.log(`[db] Seeded ${NIGERIAN_CITIES.length} Nigerian cities`);
    }

    console.log("[db] Migrations complete. Database ready at:", DB_PATH);
}

export default db;