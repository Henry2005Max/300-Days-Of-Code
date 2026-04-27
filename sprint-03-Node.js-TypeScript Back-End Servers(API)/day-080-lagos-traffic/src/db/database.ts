// Four tables:
//   landmarks       — well-known Lagos locations used as route endpoints
//   routes          — named roads/bridges between landmarks
//   traffic_states  — current live condition per route (updated by cron)
//   incidents       — active and resolved traffic incidents
//   traffic_history — time-series snapshots written every refresh cycle
//
// All data is realistic for Lagos: actual landmark names, real district names,
// approximate coordinates, and route distances that reflect real road lengths.

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "traffic.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

// ── Seed data ────────────────────────────────────────────────────────────────

const LANDMARKS = [
    { name: "Murtala Muhammed Airport",   area: "Ikeja",            lat: 6.5774,  lng: 3.3212,  type: "airport"   },
    { name: "Lagos Island",               area: "Lagos Island",     lat: 6.4541,  lng: 3.3947,  type: "island"    },
    { name: "Victoria Island",            area: "Victoria Island",  lat: 6.4281,  lng: 3.4219,  type: "island"    },
    { name: "Lekki Phase 1",              area: "Lekki",            lat: 6.4433,  lng: 3.4726,  type: "junction"  },
    { name: "Ajah",                       area: "Ajah",             lat: 6.4698,  lng: 3.5814,  type: "junction"  },
    { name: "Oshodi",                     area: "Oshodi",           lat: 6.5570,  lng: 3.3490,  type: "market"    },
    { name: "Apapa Port",                 area: "Apapa",            lat: 6.4502,  lng: 3.3599,  type: "junction"  },
    { name: "Ikorodu",                    area: "Ikorodu",          lat: 6.6194,  lng: 3.5063,  type: "junction"  },
    { name: "Badagry",                    area: "Badagry",          lat: 6.4167,  lng: 2.8833,  type: "junction"  },
    { name: "Ojota",                      area: "Ojota",            lat: 6.5901,  lng: 3.3840,  type: "junction"  },
    { name: "Mile 2",                     area: "Amuwo-Odofin",     lat: 6.4757,  lng: 3.3140,  type: "junction"  },
    { name: "Berger Junction",            area: "Berger",           lat: 6.6336,  lng: 3.3614,  type: "junction"  },
    { name: "Third Mainland Bridge North", area: "Oworonshoki",     lat: 6.5330,  lng: 3.3893,  type: "bridge"    },
    { name: "Third Mainland Bridge South", area: "Lagos Island",    lat: 6.4850,  lng: 3.3900,  type: "bridge"    },
    { name: "Eko Bridge (West)",          area: "Alaba",            lat: 6.4620,  lng: 3.3680,  type: "bridge"    },
];

// Routes: named Lagos roads/bridges with realistic distances and free-flow times
const ROUTES = [
    { name: "Third Mainland Bridge",          from: 13, to: 14, distance_km: 11.8, base_duration_minutes: 18 },
    { name: "Lagos–Ibadan Expressway (South)", from: 12, to: 1,  distance_km: 14.2, base_duration_minutes: 20 },
    { name: "Airport Road (Ikeja)",           from: 1,  to: 6,  distance_km: 6.1,  base_duration_minutes: 12 },
    { name: "Eko Bridge",                     from: 15, to: 2,  distance_km: 3.8,  base_duration_minutes: 10 },
    { name: "Lekki–Epe Expressway (Phase 1)", from: 3,  to: 4,  distance_km: 8.4,  base_duration_minutes: 15 },
    { name: "Lekki–Epe Expressway (Phase 2)", from: 4,  to: 5,  distance_km: 14.6, base_duration_minutes: 22 },
    { name: "Apapa–Oshodi Expressway",        from: 7,  to: 6,  distance_km: 9.3,  base_duration_minutes: 16 },
    { name: "Ikorodu Road",                   from: 10, to: 8,  distance_km: 22.4, base_duration_minutes: 35 },
    { name: "Lagos–Badagry Expressway",       from: 11, to: 9,  distance_km: 54.7, base_duration_minutes: 65 },
    { name: "Ozumba Mbadiwe Avenue",          from: 3,  to: 2,  distance_km: 4.2,  base_duration_minutes: 8  },
    { name: "Marina Road",                    from: 2,  to: 15, distance_km: 2.1,  base_duration_minutes: 6  },
    { name: "Mobolaji Bank-Anthony Way",      from: 1,  to: 10, distance_km: 7.8,  base_duration_minutes: 14 },
];

// ── Migrations ───────────────────────────────────────────────────────────────

export function runMigrations(): void {
    db.exec(`
    CREATE TABLE IF NOT EXISTS landmarks (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      name  TEXT    NOT NULL UNIQUE,
      area  TEXT    NOT NULL,
      lat   REAL    NOT NULL,
      lng   REAL    NOT NULL,
      type  TEXT    NOT NULL DEFAULT 'junction'
    );

    CREATE TABLE IF NOT EXISTS routes (
      id                     INTEGER PRIMARY KEY AUTOINCREMENT,
      name                   TEXT    NOT NULL UNIQUE,
      from_landmark_id       INTEGER NOT NULL REFERENCES landmarks(id),
      to_landmark_id         INTEGER NOT NULL REFERENCES landmarks(id),
      distance_km            REAL    NOT NULL,
      base_duration_minutes  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS traffic_states (
      id                       INTEGER PRIMARY KEY AUTOINCREMENT,
      route_id                 INTEGER NOT NULL UNIQUE REFERENCES routes(id),
      condition                TEXT    NOT NULL DEFAULT 'free',
      current_duration_minutes INTEGER NOT NULL,
      congestion_percent       INTEGER NOT NULL DEFAULT 0,
      speed_kmh                REAL    NOT NULL,
      updated_at               TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      route_id     INTEGER REFERENCES routes(id),
      landmark_id  INTEGER REFERENCES landmarks(id),
      type         TEXT    NOT NULL,
      severity     TEXT    NOT NULL DEFAULT 'low',
      description  TEXT    NOT NULL,
      reported_by  TEXT    NOT NULL,
      lat          REAL    NOT NULL,
      lng          REAL    NOT NULL,
      active       INTEGER NOT NULL DEFAULT 1,
      reported_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      resolved_at  TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_incidents_active
      ON incidents (active, reported_at DESC);

    CREATE TABLE IF NOT EXISTS traffic_history (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      route_id           INTEGER NOT NULL REFERENCES routes(id),
      condition          TEXT    NOT NULL,
      congestion_percent INTEGER NOT NULL,
      speed_kmh          REAL    NOT NULL,
      recorded_at        TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Keep history searchable by route and time
    CREATE INDEX IF NOT EXISTS idx_history_route_time
      ON traffic_history (route_id, recorded_at DESC);
  `);

    seedIfEmpty();
    console.log("[db] Migrations complete. Database ready at:", DB_PATH);
}

function seedIfEmpty(): void {
    const landmarkCount = (db.prepare("SELECT COUNT(*) as c FROM landmarks").get() as { c: number }).c;
    if (landmarkCount > 0) return;

    // Seed landmarks
    const landmarkStmt = db.prepare(
        "INSERT OR IGNORE INTO landmarks (name, area, lat, lng, type) VALUES (@name, @area, @lat, @lng, @type)"
    );
    const seedLandmarks = db.transaction(() => {
        for (const l of LANDMARKS) landmarkStmt.run(l);
    });
    seedLandmarks();

    // Seed routes
    const routeStmt = db.prepare(`
    INSERT OR IGNORE INTO routes (name, from_landmark_id, to_landmark_id, distance_km, base_duration_minutes)
    VALUES (@name, @from, @to, @distance_km, @base_duration_minutes)
  `);
    const seedRoutes = db.transaction(() => {
        for (const r of ROUTES) routeStmt.run(r);
    });
    seedRoutes();

    // Seed initial traffic states (all free-flow at startup)
    const routes = db.prepare("SELECT id, base_duration_minutes, distance_km FROM routes").all() as any[];
    const stateStmt = db.prepare(`
    INSERT OR IGNORE INTO traffic_states (route_id, condition, current_duration_minutes, congestion_percent, speed_kmh)
    VALUES (@route_id, 'free', @base_duration_minutes, 0, @speed_kmh)
  `);
    const seedStates = db.transaction(() => {
        for (const r of routes) {
            const speed_kmh = Math.round((r.distance_km / r.base_duration_minutes) * 60 * 10) / 10;
            stateStmt.run({ route_id: r.id, base_duration_minutes: r.base_duration_minutes, speed_kmh });
        }
    });
    seedStates();

    console.log(`[db] Seeded ${LANDMARKS.length} landmarks, ${ROUTES.length} routes`);
}

export default db;