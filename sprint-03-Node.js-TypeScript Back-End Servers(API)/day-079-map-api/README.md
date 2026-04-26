# Day 79: Map API Integration

## Description

A REST API that geocodes addresses using the Google Maps Geocoding API, calculates straight-line distances between locations using the Haversine formula, and maintains a persistent search history in SQLite. Repeated lookups of the same address are served from the local cache (24-hour TTL) with no API call made. Includes a fully-seeded Nigerian cities reference table that works entirely without an API key.

## What's New

Day 79 introduces external API integration with structured response parsing. Unlike Day 68's generic proxy, today we transform the raw Google response — extracting specific address components by their `types` array — and persist the structured result. New concepts: the Haversine formula for great-circle distance on a sphere, compass bearing calculation, address component extraction from a typed array, and a much longer cache TTL (24h vs 15m) because physical addresses rarely change.

## Features

- Geocode any address string to lat/lng with formatted address and components (city, state, country, postal code)
- 24-hour SQLite cache: repeated queries skip the Google API entirely and increment a hit counter
- Distance endpoint: calculates km, miles, and compass bearing between any two geocoded locations
- Nigerian cities reference table seeded with 15 major cities, works with no API key
- City-to-city distance endpoint using the seeded data
- Search history with hit-count sorting and optional country filter
- Clear error messages when the API key is missing or invalid
- Full Zod validation, asyncHandler, AppError hierarchy, colour-coded logger

## Technologies Used

- Node.js + TypeScript
- Express 4
- Axios (Google Maps HTTP requests)
- better-sqlite3
- Zod
- dotenv
- tsx (dev runner)

## Folder Structure

```
sprint-03-backend/day-079-map-api/
├── src/
│   ├── db/
│   │   └── database.ts          # Migrations + Nigerian cities seed
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   └── validate.ts
│   ├── routes/
│   │   └── map.ts
│   ├── schemas/
│   │   └── map.schema.ts
│   ├── services/
│   │   ├── geocoding.ts         # Google Maps API wrapper
│   │   ├── haversine.ts         # Distance and bearing calculations
│   │   └── map.service.ts       # Business logic + cache
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
mkdir day-079-map-api
cd day-079-map-api
mkdir -p src/routes src/middleware src/db src/types src/services src/schemas
```

Copy all files into the structure above, then:

```bash
npm install
```

## How to Run

### Getting a Google Maps API key

1. Go to https://console.cloud.google.com
2. Create a project (or select an existing one)
3. Go to **APIs & Services → Library**
4. Search for **Geocoding API** and enable it
5. Go to **APIs & Services → Credentials → Create Credentials → API Key**
6. Copy the key into `.env` as `GOOGLE_MAPS_API_KEY=your_key`

The `/cities` and `/cities/distance` endpoints work without a key.

```bash
npm run dev
```

## Testing Step by Step

### Step 1: Confirm the server is running

```bash
curl http://localhost:3000/health
```

### Step 2: List Nigerian cities (no API key needed)

```bash
curl http://localhost:3000/cities
```

Expected: 15 cities ordered by population (Lagos first).

### Step 3: Filter cities by state

```bash
curl "http://localhost:3000/cities?state=Lagos"
```

### Step 4: Search cities by name

```bash
curl "http://localhost:3000/cities?search=port"
```

### Step 5: Distance between two seeded cities (no API key needed)

Lagos (id: 1) to Abuja (id: 2):

```bash
curl -X POST http://localhost:3000/cities/distance \
  -H "Content-Type: application/json" \
  -d '{"from_id":1,"to_id":2}'
```

Expected:

```json
{
  "success": true,
  "data": {
    "from": { "name": "Lagos", ... },
    "to":   { "name": "Abuja", ... },
    "distance_km": 925.4,
    "distance_miles": 575.0,
    "bearing_degrees": 49.2,
    "bearing_label": "North-East"
  }
}
```

### Step 6: Geocode a Nigerian address (requires API key)

```bash
curl -X POST http://localhost:3000/geocode \
  -H "Content-Type: application/json" \
  -d '{"address":"3 Airport Road, Ikeja, Lagos, Nigeria"}'
```

### Step 7: Geocode a second address

```bash
curl -X POST http://localhost:3000/geocode \
  -H "Content-Type: application/json" \
  -d '{"address":"Aso Rock, Abuja, Nigeria"}'
```

### Step 8: Check cache hit — geocode the first address again

```bash
curl -X POST http://localhost:3000/geocode \
  -H "Content-Type: application/json" \
  -d '{"address":"3 Airport Road, Ikeja, Lagos, Nigeria"}'
```

Response will include `"from_cache": true` and `hit_count` incremented by 1.

### Step 9: Distance between two geocoded locations

```bash
curl -X POST http://localhost:3000/distance \
  -H "Content-Type: application/json" \
  -d '{"from_id":1,"to_id":2}'
```

### Step 10: View search history

```bash
curl http://localhost:3000/geocode/history
```

### Step 11: Filter history by country

```bash
curl "http://localhost:3000/geocode/history?country=Nigeria"
```

### Step 12: Test validation — same ID for from and to

```bash
curl -X POST http://localhost:3000/distance \
  -H "Content-Type: application/json" \
  -d '{"from_id":1,"to_id":1}'
```

Expected 400: `"from_id and to_id must be different locations"`

### Step 13: Delete a location from history

```bash
curl -X DELETE http://localhost:3000/geocode/1
```

## What I Learned

- The Google Maps Geocoding API returns `address_components` as an array where each component has a `types` string array — you must find the component whose types include `"locality"` (city) or `"administrative_area_level_1"` (state) rather than accessing a fixed index
- The Haversine formula accounts for Earth's curvature using spherical trigonometry; the key insight is converting degrees to radians (`deg * π / 180`) before applying the trigonometric functions
- `Math.atan2(y, x)` returns a value in `-π` to `π` — you must add 360 and take modulo 360 to get a 0–360 compass bearing
- Using a 24-hour cache TTL for geocoding (vs 15 minutes for RSS feeds) reflects the domain: physical addresses almost never change, so stale data is essentially impossible. Aggressive caching here saves real API quota
- Normalising the cache key to lowercase before storing (`rawAddress.toLowerCase().trim()`) means "Lagos" and "lagos" and " LAGOS " all hit the same row — without this, the same address can generate duplicate rows
- `status === "REQUEST_DENIED"` from the Google API means the key is invalid or the Geocoding API is not enabled — returning a 503 (not a 401) is the right choice because this is a server configuration problem, not a client authentication problem

## Challenge Info

| Field    | Value |
|----------|-------|
| Day      | 79 |
| Sprint   | 3 — Node.js Back-End Servers |
| Date     | April 26, 2026 |
| Previous | [Day 78 — RSS Parser](../day-078-rss-parser/) |
| Next     | [Day 80 — Lagos Traffic Mock API](../day-080-lagos-traffic/) |

Part of my 300 Days of Code Challenge!
