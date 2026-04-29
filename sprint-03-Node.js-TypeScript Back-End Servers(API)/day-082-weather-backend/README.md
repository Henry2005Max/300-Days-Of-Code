# Day 82: Weather Backend Service

## Description

A REST API that fetches current weather and 5-day forecasts for any city using the OpenWeatherMap API, caches results in SQLite with a 10-minute TTL, evaluates every new reading against five weather alert thresholds (high temperature, extreme heat, high humidity, strong wind, low visibility), and exposes a multi-city comparison endpoint. Nigerian cities are used throughout the examples.

## What's New

Day 82 introduces the OpenWeatherMap API and a threshold-based alert engine. New concepts compared to Day 79's Map API: upsert via `ON CONFLICT(city) DO UPDATE SET` for a true one-row-per-city cache, `Promise.allSettled` for concurrent multi-city fetching (one city failing doesn't block the others), and a rules array pattern for alert evaluation where each rule declares its own threshold, severity, and message builder. The lazy `initStatements()` pattern from the Day 81 fix is applied from the start.

## Features

- Current weather with temperature, humidity, wind, pressure, visibility, sunrise/sunset
- 10-minute SQLite cache — repeated requests skip the API and return instantly
- `from_cache` flag on every response so you can see when data is fresh
- 5-day / 3-hour forecast endpoint with configurable day range (1–5)
- Multi-city comparison with hottest/coolest/most-humid/windiest summary
- Alert engine: five threshold rules evaluated on every fresh fetch
- Alerts auto-resolve when the condition clears on the next refresh
- PATCH endpoint to manually resolve any alert
- Nigerian cities work out of the box: Lagos, Abuja, Kano, Port Harcourt, Ibadan
- Lazy prepared statements — the Day 81 "no such table" bug cannot occur

## Technologies Used

- Node.js + TypeScript
- Express 4
- Axios (OpenWeatherMap HTTP requests)
- better-sqlite3
- Zod
- dotenv
- tsx (dev runner)

## Folder Structure

```
sprint-03-backend/day-082-weather-backend/
├── src/
│   ├── db/
│   │   ├── database.ts          # Migrations
│   │   └── statements.ts        # Lazy prepared statements
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   └── validate.ts
│   ├── routes/
│   │   └── weather.ts
│   ├── schemas/
│   │   └── weather.schema.ts
│   ├── services/
│   │   ├── alerts.ts            # Threshold rule engine
│   │   ├── owm.ts               # OpenWeatherMap API wrapper
│   │   └── weather.service.ts   # Cache logic + comparison
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
mkdir day-082-weather-backend
cd day-082-weather-backend
mkdir -p src/routes src/middleware src/db src/types src/services src/schemas
```

Copy all files into the structure above, then:

```bash
npm install
```

## How to Run

### Getting an OpenWeatherMap API key

1. Go to https://openweathermap.org/api and sign up for a free account
2. Go to your profile → **API keys** tab
3. Copy the default key (or generate a new one)
4. Paste it into `.env` as `OPENWEATHER_API_KEY=your_key`
5. Wait up to 2 hours for the key to activate on new accounts

```bash
npm run dev
```

## Testing Step by Step

### Step 1: Confirm the server is running

```bash
curl http://localhost:3000/health
```

### Step 2: Fetch current weather for Lagos

```bash
curl http://localhost:3000/weather/Lagos,NG
```

Expected — a full weather object with `"from_cache": false` on first call.

### Step 3: Fetch again — should hit cache

```bash
curl http://localhost:3000/weather/Lagos,NG
```

Expected: `"from_cache": true`, response is near-instant.

### Step 4: Fetch weather for more Nigerian cities

```bash
curl http://localhost:3000/weather/Abuja,NG
curl http://localhost:3000/weather/Kano,NG
curl http://localhost:3000/weather/Port%20Harcourt,NG
curl http://localhost:3000/weather/Ibadan,NG
```

### Step 5: List all cached cities

```bash
curl http://localhost:3000/weather
```

### Step 6: Get a 5-day forecast for Lagos

```bash
curl http://localhost:3000/forecast/Lagos,NG
```

### Step 7: Get a 2-day forecast only

```bash
curl "http://localhost:3000/forecast/Lagos,NG?days=2"
```

### Step 8: Compare multiple cities

```bash
curl "http://localhost:3000/compare?cities=Lagos,NG,Abuja,NG,Kano,NG"
```

Expected summary:

```json
{
  "summary": {
    "hottest":    "kano,ng",
    "coolest":    "abuja,ng",
    "most_humid": "lagos,ng",
    "windiest":   "lagos,ng"
  }
}
```

### Step 9: Check weather alerts

```bash
curl http://localhost:3000/alerts
```

Alerts are auto-generated if any city exceeded a threshold (Lagos humidity often triggers HIGH_HUMIDITY).

### Step 10: Filter active alerts for a city

```bash
curl "http://localhost:3000/alerts?city=Lagos,NG&active=true"
```

### Step 11: Manually resolve an alert

```bash
curl -X PATCH http://localhost:3000/alerts/1/resolve
```

### Step 12: Test city not found

```bash
curl http://localhost:3000/weather/NotARealCity12345
```

Expected 422: `"City not found: 'NotARealCity12345'"`

### Step 13: Test compare validation — only one city

```bash
curl "http://localhost:3000/compare?cities=Lagos"
```

Expected 400: `"Provide between 2 and 6 cities separated by commas"`

## What I Learned

- OpenWeatherMap's `ON CONFLICT(city) DO UPDATE SET` upsert pattern is cleaner than separate INSERT + UPDATE for a one-row-per-city cache — the database guarantees atomicity and we never need to check if a row exists first
- `Promise.allSettled` is the right choice for concurrent fetches where partial success is acceptable — unlike `Promise.all`, it does not reject on the first failure, letting the comparison endpoint return data for 4 out of 5 cities if one fails
- A rules array pattern for alert thresholds (each rule declares its own `triggered` function, message builder, and severity) is far easier to extend than a long if/else chain — adding a new alert type means adding one object to the array
- Auto-resolving alerts on condition clearing (checking the threshold on every fetch) is simpler than a separate cleanup job and ensures alerts stay accurate with the data — if it stopped raining, the rain alert resolves on the next fetch
- `new Date(cachedAt + "Z").getTime()` is necessary because SQLite stores `datetime('now')` without a timezone suffix — appending "Z" tells JavaScript it is UTC, preventing wrong staleness calculations in non-UTC timezones
- The `from_cache` boolean in the response is a small addition that makes development much easier — you can immediately see whether a request hit the API or returned stored data without checking logs

## Challenge Info

| Field    | Value |
|----------|-------|
| Day      | 82 |
| Sprint   | 3 — Node.js Back-End Servers |
| Date     | April 29, 2026 |
| Previous | [Day 81 — Chat API with WebSockets](../day-081-chat-api/) |
| Next     | [Day 83 — Currency Service](../day-083-currency-service/) |

Part of my 300 Days of Code Challenge!
