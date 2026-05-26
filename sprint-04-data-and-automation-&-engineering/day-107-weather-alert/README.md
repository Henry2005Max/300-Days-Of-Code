# Day 107: Weather Alert System

A scheduled weather monitoring service that fetches current conditions for 6 Nigerian cities from the OpenWeatherMap API, evaluates readings against configurable thresholds, stores every reading and triggered alert in SQLite, and prints a colour-coded console report. Runs on a cron schedule with realistic mock fallback when no API key is set.

## What's New

First weather + alerting project in the challenge. Introduces multi-city sequential API fetching with per-city fallback, threshold-based alert severity classification (info/warning/critical based on how far over threshold), jittered mock data for realistic demo output without real API calls, and combining `node-cron` scheduling with SQLite persistence for a stateful monitoring daemon.

## Features

- Monitors Lagos, Abuja, Kano, Port Harcourt, Ibadan, and Enugu
- Fetches temperature, feels-like, humidity, wind speed, rainfall, and conditions
- Five alert types: HEAT, COLD, HUMIDITY, WIND, RAIN
- Three severity levels: info / warning / critical (based on % over threshold)
- All readings stored in SQLite — full history across runs
- All triggered alerts stored with type, severity, value, and threshold
- Configurable thresholds via `.env` — no code changes needed
- Mock mode with jittered realistic Nigerian weather data when API key is `demo`
- `REPORT_ONLY=true` prints historical report from DB and exits
- `node-cron` schedule with `Africa/Lagos` timezone
- Colour-coded terminal output — red for critical, amber for warning, cyan for info

## Technologies Used

- Node.js + TypeScript
- `node-cron` — cron scheduler with timezone support
- `better-sqlite3` — synchronous SQLite for readings and alerts
- Native `fetch` — OpenWeatherMap API (Node.js 18+)
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-107-weather-alert/
├── data/
│   └── weather.db              # SQLite readings + alerts database
├── src/
│   ├── alerts/
│   │   └── evaluator.ts        # Threshold evaluation, severity classification
│   ├── db/
│   │   └── store.ts            # SQLite store with lazy init
│   ├── display/
│   │   └── printer.ts          # Conditions table, alert list, historical report
│   ├── services/
│   │   ├── cities.ts           # Nigerian city definitions and threshold loader
│   │   ├── fetcher.ts          # OpenWeatherMap API client with mock fallback
│   │   └── monitor.ts          # Single fetch-evaluate-store cycle
│   ├── types/
│   │   └── index.ts            # Interfaces
│   └── index.ts                # Entry point — cron scheduler + report mode
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-107-weather-alert
npm install
```

## How to Run

```bash
# Run once and start the cron scheduler (mock data — no API key needed)
npm run run:monitor

# Print historical report from DB and exit
npm run report
```

## Testing Step by Step

1. **Install:**
   ```bash
   npm install
   ```

2. **Run in mock mode** (default — no API key needed):
   ```bash
   npm run run:monitor
   ```
   You'll see a conditions table for 6 cities and any triggered alerts (Kano will trigger a HEAT alert because its mock temperature is 39°C, above the 38°C threshold).

3. **Change the cron schedule to every minute** to see it repeat:
   ```
   CRON_SCHEDULE=* * * * *
   ```
   Re-run and wait to see the next cycle trigger.

4. **Get a free OpenWeatherMap API key:**
    - Sign up at [openweathermap.org](https://openweathermap.org/api) — free tier: 60 calls/minute
    - Set `OPENWEATHER_API_KEY=your_key_here` in `.env`
    - Re-run to fetch live Nigerian weather

5. **Lower thresholds to trigger more alerts:**
   ```
   ALERT_TEMP_MAX=30
   ALERT_HUMIDITY_MAX=80
   ```

6. **Press Ctrl+C** to stop the scheduler.

7. **View the historical report:**
   ```bash
   npm run report
   ```
   Shows latest readings per city, last 20 alerts, and alert frequency stats.

8. **Query the raw SQLite data:**
   ```bash
   sqlite3 ./data/weather.db "SELECT city_name, temp_c, humidity, fetched_at FROM readings ORDER BY fetched_at DESC LIMIT 12;"
   sqlite3 ./data/weather.db "SELECT city_name, type, severity, message FROM alerts ORDER BY triggered_at DESC LIMIT 10;"
   ```

9. **Add a new city** — edit `src/services/cities.ts`, add a `City` entry with lat/lon, and it will be included in the next cycle.

10. **Test severity levels** — set `ALERT_TEMP_MAX=25` to force critical alerts on all cities, then run a cycle and check the report for red critical badges.

## What I Learned

- OpenWeatherMap returns wind speed in m/s — multiply by 3.6 to convert to km/h
- The `rain` field in the API response is optional and only present when it's actually raining — always default to 0 with `data.rain?.['1h'] ?? 0`
- Severity classification based on percentage over threshold (`value / threshold >= 1.15` for critical) is more useful than absolute differences because it scales across different units
- Adding random jitter to mock data (`base ± 0.5 * range`) makes repeated runs feel realistic without identical values every time
- SQLite's `MAX(fetched_at)` subquery join pattern is the correct way to get the latest row per group in SQLite, since it doesn't support `DISTINCT ON` like PostgreSQL
- `node-cron` with `timezone: 'Africa/Lagos'` means the schedule uses WAT time — `*/30 * * * *` fires at :00 and :30 of every hour in Lagos time
- Running the first cycle immediately before starting the cron scheduler gives instant feedback without waiting for the first scheduled tick

## Challenge Info

| Field    | Detail                                      |
|----------|---------------------------------------------|
| Day      | 107                                         |
| Sprint   | 4 — Data Engineering & Databases            |
| Date     | 2025-01-21                                  |
| Previous | [Day 106](../day-106-recipe-api)            |
| Next     | [Day 108](../day-108-file-organizer)        |

Part of my 300 Days of Code Challenge!
