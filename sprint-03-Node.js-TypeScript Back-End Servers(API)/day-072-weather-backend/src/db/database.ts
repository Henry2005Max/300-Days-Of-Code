import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DB_FILE || "./data/weather.db";
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

export const db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === "development"
        ? (sql: string) => console.log(`\x1b[36m[SQL]\x1b[0m ${sql}`)
        : undefined,
});

db.pragma("journal_mode = WAL");

export function runMigrations(): void {
    /* ── locations table ── */
    db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      slug            TEXT    NOT NULL UNIQUE,
      name            TEXT    NOT NULL,
      state           TEXT    NOT NULL,
      latitude        REAL    NOT NULL,
      longitude       REAL    NOT NULL,
      timezone        TEXT    NOT NULL DEFAULT 'Africa/Lagos',
      fetch_count     INTEGER NOT NULL DEFAULT 0,
      last_fetched_at TEXT
    );
  `);

    /* ── weather_readings table ─────────────────────────────────────────
       Each row is one snapshot of weather for one location at one time.
       forecast_json stores the 7-day array as a JSON string — we don't
       need to query individual forecast days, so a JSON column is fine.
    ─────────────────────────────────────────────────────────────────────*/
    db.exec(`
    CREATE TABLE IF NOT EXISTS weather_readings (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id   INTEGER NOT NULL REFERENCES locations(id),
      fetched_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      temperature   REAL    NOT NULL,
      feels_like    REAL    NOT NULL,
      humidity      INTEGER NOT NULL,
      wind_speed    REAL    NOT NULL,
      weather_code  INTEGER NOT NULL,
      description   TEXT    NOT NULL,
      is_day        INTEGER NOT NULL DEFAULT 1,
      forecast_json TEXT    NOT NULL DEFAULT '[]'
    );
  `);

    /* Index to speed up history queries */
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_readings_location_time
    ON weather_readings (location_id, fetched_at DESC);
  `);

    console.log("[DB] Migrations complete");
}

/* ── Seed Nigerian cities ── */
const CITIES = [
    { slug: "lagos",          name: "Lagos",          state: "Lagos",   lat: 6.5244,  lon: 3.3792  },
    { slug: "abuja",          name: "Abuja",           state: "FCT",     lat: 9.0579,  lon: 7.4951  },
    { slug: "kano",           name: "Kano",            state: "Kano",    lat: 12.0022, lon: 8.5920  },
    { slug: "ibadan",         name: "Ibadan",           state: "Oyo",     lat: 7.3775,  lon: 3.9470  },
    { slug: "port-harcourt",  name: "Port Harcourt",   state: "Rivers",  lat: 4.8156,  lon: 7.0498  },
    { slug: "enugu",          name: "Enugu",           state: "Enugu",   lat: 6.4584,  lon: 7.5464  },
    { slug: "kaduna",         name: "Kaduna",          state: "Kaduna",  lat: 10.5264, lon: 7.4383  },
    { slug: "benin-city",     name: "Benin City",      state: "Edo",     lat: 6.3350,  lon: 5.6270  },
    { slug: "jos",            name: "Jos",             state: "Plateau", lat: 9.8965,  lon: 8.8583  },
    { slug: "warri",          name: "Warri",           state: "Delta",   lat: 5.5167,  lon: 5.7500  },
];

export function seedLocations(): void {
    const count = (db.prepare("SELECT COUNT(*) as c FROM locations").get() as any).c;
    if (count > 0) {
        console.log(`[DB] Seed skipped — ${count} locations already present`);
        return;
    }

    const insert = db.prepare(`
    INSERT INTO locations (slug, name, state, latitude, longitude)
    VALUES (@slug, @name, @state, @latitude, @longitude)
  `);

    const seedAll = db.transaction((cities: typeof CITIES) => {
        for (const city of cities) {
            insert.run({ slug: city.slug, name: city.name, state: city.state, latitude: city.lat, longitude: city.lon });
        }
    });

    seedAll(CITIES);
    console.log(`[DB] Seeded ${CITIES.length} Nigerian cities`);
}