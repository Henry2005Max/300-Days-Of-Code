# Day 80: Lagos Traffic Mock API

## Description

A REST API that simulates real-time Lagos traffic conditions across 12 named routes and 15 landmarks. A built-in simulation engine runs on a configurable cron schedule (default every 2 minutes) and updates traffic states based on Lagos's real daily congestion patterns — light at night, gridlock during the 07:00–09:00 and 16:00–20:00 rush hours, and route-specific multipliers for notoriously bad roads like the Apapa–Oshodi Expressway. Supports user-reported incidents that actively worsen affected routes until auto-resolved after 3 hours.

## What's New

Day 80 introduces `node-cron` (revisited from Day 73) as the driver for a stateful simulation engine — the first time in Sprint 3 where the server continuously mutates its own database without any external trigger. New concepts: time-of-day traffic modelling, route congestion multipliers, incident impact propagation onto live traffic states, traffic history as a time-series append-only table, and auto-resolving stale incidents via a scheduled cleanup query.

## Features

- 12 real Lagos routes (Third Mainland Bridge, Apapa–Oshodi, Lekki–Epe, etc.) with accurate distances
- 15 seeded Lagos landmarks with real coordinates (airport, VI, Lekki, Ikorodu, Badagry, etc.)
- Simulation engine updates every 2 minutes based on hour-of-day congestion profile
- Route-specific congestion multipliers (Apapa–Oshodi is 1.5× base — accurately the worst)
- Active incidents increase congestion on their route until resolved or auto-expired (3 hours)
- City-wide overview: worst/best routes, average congestion, active incident count
- Filter routes by condition or area; filter incidents by severity, type, or active status
- Traffic history time-series — query last N hours of snapshots per route
- PATCH endpoint to manually resolve an incident

## Technologies Used

- Node.js + TypeScript
- Express 4
- node-cron 3
- better-sqlite3
- Zod
- dotenv
- tsx (dev runner)

## Folder Structure

```
sprint-03-backend/day-080-lagos-traffic/
├── src/
│   ├── db/
│   │   └── database.ts          # Migrations + seed (landmarks, routes, states)
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   └── validate.ts
│   ├── routes/
│   │   └── traffic.ts
│   ├── schemas/
│   │   └── traffic.schema.ts
│   ├── services/
│   │   ├── simulator.ts         # Time-of-day engine + cron tick logic
│   │   └── traffic.service.ts   # Queries + incident management
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
mkdir day-080-lagos-traffic
cd day-080-lagos-traffic
mkdir -p src/routes src/middleware src/db src/types src/services src/schemas
```

Copy all files into the structure above, then:

```bash
npm install
```

## How to Run

```bash
npm run dev
```

The server runs an immediate simulation tick on startup, so traffic data is populated before the first request.

## Testing Step by Step

### Step 1: Confirm the server is running

```bash
curl http://localhost:3000/health
```

### Step 2: Get the city-wide traffic overview

```bash
curl http://localhost:3000/traffic
```

Expected: worst and best routes, average congestion, number of active incidents.

### Step 3: List all routes with live traffic state

```bash
curl http://localhost:3000/routes
```

Routes are returned sorted by congestion (highest first). Apapa–Oshodi Expressway should consistently rank near the top.

### Step 4: Filter routes to only heavy or gridlock conditions

```bash
curl "http://localhost:3000/routes?condition=heavy"
curl "http://localhost:3000/routes?condition=gridlock"
```

### Step 5: Get a single route with full landmark coordinates

```bash
curl http://localhost:3000/routes/1
```

### Step 6: List all landmarks

```bash
curl http://localhost:3000/landmarks
```

### Step 7: Filter landmarks by area

```bash
curl "http://localhost:3000/landmarks?area=Lekki"
curl "http://localhost:3000/landmarks?area=Ikeja"
```

### Step 8: Report a traffic incident

```bash
curl -X POST http://localhost:3000/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "route_id": 7,
    "type": "accident",
    "severity": "high",
    "description": "Multiple vehicle collision blocking two lanes near Apapa toll gate",
    "reported_by": "Emeka Okafor",
    "lat": 6.4502,
    "lng": 3.3599
  }'
```

### Step 9: Check that the incident worsened Route 7's congestion

Wait for the next cron tick (up to 2 minutes), then:

```bash
curl http://localhost:3000/routes/7
```

`congestion_percent` should be higher than before the incident.

### Step 10: List all active incidents

```bash
curl "http://localhost:3000/incidents?active=true"
```

### Step 11: Filter incidents by severity

```bash
curl "http://localhost:3000/incidents?severity=high"
```

### Step 12: Report a flooding incident on a landmark

```bash
curl -X POST http://localhost:3000/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "landmark_id": 4,
    "type": "flooding",
    "severity": "medium",
    "description": "Road flooded after heavy rain near Lekki Phase 1 roundabout",
    "reported_by": "Ngozi Adeyemi",
    "lat": 6.4433,
    "lng": 3.4726
  }'
```

### Step 13: Manually resolve the first incident

```bash
curl -X PATCH http://localhost:3000/incidents/1/resolve
```

### Step 14: View traffic history for the last 6 hours

```bash
curl http://localhost:3000/history
```

### Step 15: Filter history to a single route

```bash
curl "http://localhost:3000/history?route_id=1&hours=3"
```

### Step 16: Test validation — description too short

```bash
curl -X POST http://localhost:3000/incidents \
  -H "Content-Type: application/json" \
  -d '{"type":"accident","severity":"low","description":"bad","reported_by":"Tunde","lat":6.5,"lng":3.3}'
```

Expected 400 with field error on `description`.

## What I Learned

- Time-of-day traffic modelling requires an hourly lookup table rather than a formula — real congestion patterns (Lagos rush hour peaks at 18:00–19:00, not gradually) are too irregular for a smooth function
- Route-specific multipliers elegantly separate "how congested is Lagos right now" (global, time-of-day) from "how congested is this specific road" (local, structural) — the same percentage increase hits a bad road harder
- `node-cron` schedules work independently of the HTTP request cycle — the cron callback runs even when no clients are connected, which is exactly what a simulation engine needs
- Running one simulation tick immediately on startup (`runSimulationTick()` before `app.listen()`) ensures the database has real values before the first HTTP request arrives, avoiding a cold-start window with stale seed data
- An append-only `traffic_history` table (never updated, only inserted) is the correct pattern for time-series data — it preserves the full record of how conditions changed without needing versioning logic
- Auto-resolving incidents with `datetime(reported_at, '+3 hours') < datetime('now')` inside the cron tick is cleaner than a separate cleanup job — the simulation engine is already touching the database every tick anyway

## Challenge Info

| Field    | Value |
|----------|-------|
| Day      | 80 |
| Sprint   | 3 — Node.js Back-End Servers |
| Date     | April 27, 2026 |
| Previous | [Day 79 — Map API Integration](../day-079-map-api/) |
| Next     | [Day 81 — Chat API with WebSockets](../day-081-chat-api/) |

Part of my 300 Days of Code Challenge!
