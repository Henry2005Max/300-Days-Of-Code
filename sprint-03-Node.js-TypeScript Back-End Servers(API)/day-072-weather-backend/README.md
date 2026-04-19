# Day 72: Weather Backend

## Description

A weather API backend that fetches from Open-Meteo, stores every reading in SQLite, and serves current conditions and historical data for 10 Nigerian cities. Combines SQLite persistence (Day 64), Axios HTTP fetching (Day 68), and proper error handling (Day 70) into one production-style service.

## What makes this different from the Day 68 proxy

| Day 68 Proxy | Day 72 Weather Backend |
|---|---|
| Cache in memory | Cache in SQLite — survives restarts |
| No history | Full reading history per city |
| No statistics | Fetch count and last-fetched tracked per city |
| Generic cities | 10 Nigerian cities with coordinates in DB |
| Data lost on restart | All readings persist forever |

## Features

- GET /weather/locations — all 10 Nigerian cities with coordinates
- GET /weather/:slug — current weather, fetched fresh or served from SQLite cache
- GET /weather/:slug/history — full reading history, up to 168 readings (1 week)
- GET /weather/stats — total readings, top queried cities, fetch counts
- 10-minute freshness window — readings newer than 10 min served from DB
- Every fetch stored in weather_readings table with full forecast JSON
- fetch_count and last_fetched_at updated in locations table on every API call
- Temperature trend summary (average) on history endpoint
- INDEX on (location_id, fetched_at DESC) for fast history queries
- WMO weather code → human description mapping

## Technologies Used

- Node.js
- TypeScript
- Express 4
- better-sqlite3
- Axios
- dotenv
- tsx

## Folder Structure

```
day-072-weather-backend/
├── src/
│   ├── index.ts
│   ├── db/
│   │   └── database.ts         ← migrations, seed 10 Nigerian cities
│   ├── services/
│   │   └── weatherService.ts   ← fetch logic, cache check, DB read/write
│   ├── routes/
│   │   └── weather.ts          ← route handlers
│   ├── types/
│   │   └── index.ts
│   └── middleware/
│       └── logger.ts
├── data/                       ← weather.db created here
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd Desktop
mkdir day-072-weather-backend
cd day-072-weather-backend
mkdir -p src/db src/services src/routes src/types src/middleware
```

Copy all files, then:

```bash
npm install
npm run dev
```

## Testing Step by Step

1. `http://localhost:3000/weather/locations` — see all 10 cities
2. `http://localhost:3000/weather/lagos` — live Lagos weather, `fromCache: false`
3. Hit Lagos again immediately — `fromCache: true`, instant response
4. `http://localhost:3000/weather/abuja` — Abuja (separate fetch)
5. `http://localhost:3000/weather/kano` — Kano
6. `http://localhost:3000/weather/stats` — see fetch counts updating
7. `http://localhost:3000/weather/lagos/history` — all stored Lagos readings
8. Stop server (`Ctrl+C`), restart with `npm run dev`
9. `http://localhost:3000/weather/lagos` — still `fromCache: true` — data survived restart!
10. `http://localhost:3000/weather/port-harcourt` — hyphenated slug works
11. `http://localhost:3000/weather/badcity` — 404 with hint

## What I Learned

- Combining SQLite persistence with API caching means the cache survives server restarts — in-memory caches from Day 67/68 don't
- Storing JSON in a SQLite TEXT column (forecast_json) is appropriate when you don't need to query individual fields of that JSON — it avoids a separate forecast_days table with foreign keys
- A database INDEX on (location_id, fetched_at DESC) makes ORDER BY fetched_at DESC queries fast even with thousands of rows — without the index SQLite would scan the entire table
- The freshness check pattern — fetch the latest row, compare its timestamp to Date.now(), decide whether to re-fetch — is a universal caching technique that works for any time-sensitive data
- Incrementing a counter column in SQL with `fetch_count = fetch_count + 1` is atomic — if two requests arrive simultaneously they won't both read 0, add 1, and write 1 (a race condition); SQLite handles this correctly
- Separating service logic (weatherService.ts) from route handlers (weather.ts) keeps each file focused — routes handle HTTP concerns, services handle data logic

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 72 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 19, 2025 |
| Previous | [Day 71 — WebSocket Chat](../day-071-websocket-chat) |
| Next | [Day 73 — Currency Service](../day-073-currency-service) |

Part of my 300 Days of Code Challenge!
