// Three tables:
//   landmarks         — seeded Nigerian points of interest shown on the map
//   geocoded_locations — address geocode cache (same pattern as Day 79)
//   cached_routes     — Directions API cache to avoid repeated API calls

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "maps.db");
const db      = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

const LANDMARKS = [
    // Lagos
    { name: "Murtala Muhammed International Airport", category: "transport",   city: "Lagos",    lat: 6.5774,  lng: 3.3212,  description: "Nigeria's busiest international airport, handling over 10 million passengers per year" },
    { name: "Lekki Conservation Centre",              category: "culture",     city: "Lagos",    lat: 6.4452,  lng: 3.5387,  description: "350-hectare wetland nature reserve with Africa's longest canopy walkway at 401 metres" },
    { name: "National Museum Lagos",                  category: "culture",     city: "Lagos",    lat: 6.4535,  lng: 3.3924,  description: "Houses Nigeria's most important historical artefacts including the Benin Bronzes" },
    { name: "Balogun Market",                         category: "market",      city: "Lagos",    lat: 6.4546,  lng: 3.3932,  description: "One of the largest open-air markets in West Africa, famous for textiles and fashion" },
    { name: "Third Mainland Bridge",                  category: "bridge",      city: "Lagos",    lat: 6.5090,  lng: 3.3920,  description: "At 11.8 km, one of the longest bridges in Africa connecting Lagos Island to the mainland" },
    { name: "Eko Atlantic City",                      category: "culture",     city: "Lagos",    lat: 6.4080,  lng: 3.4183,  description: "Ambitious new city being reclaimed from the Atlantic Ocean, covering 10 square kilometres" },
    { name: "Lagos Island",                           category: "government",  city: "Lagos",    lat: 6.4541,  lng: 3.3947,  description: "The historic commercial heart of Lagos, home to the Lagos State Government House" },
    { name: "University of Lagos",                    category: "education",   city: "Lagos",    lat: 6.5158,  lng: 3.3903,  description: "Flagship federal university established 1962, known as UNILAG, situated on Lagos Lagoon" },
    // Abuja
    { name: "Aso Rock Presidential Villa",            category: "government",  city: "Abuja",    lat: 9.0660,  lng: 7.4293,  description: "Official residence and workplace of Nigeria's President, named after the Aso Rock monolith" },
    { name: "Nigerian National Mosque",               category: "culture",     city: "Abuja",    lat: 9.0559,  lng: 7.4891,  description: "Landmark central mosque commissioned by General Gowon, completed 1984" },
    { name: "Nigerian National Christian Centre",     category: "culture",     city: "Abuja",    lat: 9.0527,  lng: 7.4810,  description: "Ecumenical centre built to complement the national mosque across the road" },
    { name: "Zuma Rock",                              category: "culture",     city: "Abuja",    lat: 9.2263,  lng: 7.1867,  description: "Iconic 725-metre monolithic rock formation dubbed 'the gateway to Abuja'" },
    { name: "Millennium Tower Abuja",                 category: "culture",     city: "Abuja",    lat: 9.0579,  lng: 7.4951,  description: "Planned 170-metre tower to be the tallest in sub-Saharan Africa upon completion" },
    { name: "University of Abuja",                    category: "education",   city: "Abuja",    lat: 8.9833,  lng: 7.3667,  description: "Federal university established 1988, serving the Federal Capital Territory" },
    // Port Harcourt
    { name: "Port Harcourt City Centre",              category: "government",  city: "Port Harcourt", lat: 4.8156, lng: 7.0498, description: "Capital of Rivers State and Nigeria's petroleum industry hub" },
    { name: "Port Harcourt Zoo",                      category: "culture",     city: "Port Harcourt", lat: 4.8242, lng: 7.0297, description: "Oldest zoo in Nigeria, established 1956, covering 1.5 hectares" },
    // Kano
    { name: "Kano City Walls",                        category: "culture",     city: "Kano",     lat: 12.0022, lng: 8.5920,  description: "Ancient mud walls of the Kano Emirate dating back to the 11th century, a UNESCO site" },
    { name: "Kurmi Market",                           category: "market",      city: "Kano",     lat: 12.0000, lng: 8.5900,  description: "One of the oldest markets in sub-Saharan Africa, operating for over 500 years" },
    // Ibadan
    { name: "University of Ibadan",                   category: "education",   city: "Ibadan",   lat: 7.3970,  lng: 3.9057,  description: "Nigeria's first university, founded 1948, consistently ranked top in Nigeria" },
    { name: "Cocoa House Ibadan",                     category: "culture",     city: "Ibadan",   lat: 7.3823,  lng: 3.9004,  description: "Built in 1965 from cocoa export profits, was sub-Saharan Africa's first skyscraper" },
];

export function runMigrations(): void {
    db.exec(`
    CREATE TABLE IF NOT EXISTS landmarks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      category    TEXT    NOT NULL DEFAULT 'culture',
      city        TEXT    NOT NULL,
      lat         REAL    NOT NULL,
      lng         REAL    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_landmarks_city     ON landmarks (city);
    CREATE INDEX IF NOT EXISTS idx_landmarks_category ON landmarks (category);

    CREATE TABLE IF NOT EXISTS geocoded_locations (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      query             TEXT    NOT NULL UNIQUE,
      formatted_address TEXT    NOT NULL,
      lat               REAL    NOT NULL,
      lng               REAL    NOT NULL,
      city              TEXT    NOT NULL DEFAULT '',
      state             TEXT    NOT NULL DEFAULT '',
      country           TEXT    NOT NULL DEFAULT '',
      hit_count         INTEGER NOT NULL DEFAULT 1,
      cached_at         TEXT    NOT NULL DEFAULT (datetime('now')),
      created_at        TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cached_routes (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      origin_query        TEXT    NOT NULL,
      destination_query   TEXT    NOT NULL,
      distance_text       TEXT    NOT NULL,
      duration_text       TEXT    NOT NULL,
      distance_meters     INTEGER NOT NULL,
      duration_seconds    INTEGER NOT NULL,
      polyline            TEXT    NOT NULL,
      cached_at           TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(origin_query, destination_query)
    );
  `);

    // Seed landmarks if empty
    const count = (db.prepare("SELECT COUNT(*) as c FROM landmarks").get() as { c: number }).c;
    if (count === 0) {
        const stmt = db.prepare(
            "INSERT INTO landmarks (name, category, city, lat, lng, description) VALUES (@name, @category, @city, @lat, @lng, @description)"
        );
        db.transaction(() => { for (const l of LANDMARKS) stmt.run(l); })();
        console.log(`[db] Seeded ${LANDMARKS.length} Nigerian landmarks`);
    }

    console.log("[db] Migrations complete. Database ready at:", DB_PATH);
}

export default db;