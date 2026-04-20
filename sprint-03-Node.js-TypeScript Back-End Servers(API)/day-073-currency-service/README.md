# Day 73: Currency Service

## Description

A currency exchange rate service with SQLite persistence and a node-cron background scheduler. Rates are fetched from open.er-api.com and stored in the database. A scheduled job refreshes them automatically every hour. Clients always read from the database — never from the API directly. Includes a Naira-focused endpoint, cross-rate currency conversion, and full history of all stored snapshots.

## What is a scheduled background job?

Instead of fetching data only when a user asks, the server proactively keeps the database fresh on a schedule. When any user requests rates, they get fast data from SQLite — the API is never in the request path.

```
Server starts → fetch rates → store in DB → start cron job
Every hour    → cron fires → fetch rates → store in DB
User requests → read from DB → instant response (no API call)
```

## Cron Syntax

```
"0 * * * *"    → every hour at minute 0
"*/30 * * * *" → every 30 minutes
"*/5 * * * *"  → every 5 minutes (for testing)
"0 9 * * *"    → every day at 9am
```

Change `REFRESH_CRON` in .env to adjust the schedule.

## Features

- GET /currency/rates — 12 key currencies from latest snapshot
- GET /currency/ngn — NGN/USD, NGN/GBP, NGN/EUR, USD/NGN rates
- GET /currency/convert?from=NGN&to=USD&amount=50000 — cross-rate conversion
- GET /currency/all — all ~170 currencies from latest snapshot
- GET /currency/history — NGN, EUR, GBP rates across all stored snapshots
- GET /currency/stats — total snapshots, successful/failed refreshes
- GET /currency/log — background job run history with duration and errors
- POST /currency/refresh — manually trigger an immediate fetch
- Initial fetch on startup if no data exists in DB
- Background scheduler starts automatically with configurable cron expression
- refresh_log table records every job run — success, duration, error message
- Cross-rate calculation: amount × (toRate / fromRate) via USD as the bridge
- Graceful shutdown stops the scheduler before closing

## Technologies Used

- Node.js
- TypeScript
- Express 4
- better-sqlite3
- Axios
- node-cron
- dotenv
- tsx

## Folder Structure

```
day-073-currency-service/
├── src/
│   ├── index.ts                  ← startup, initial fetch, scheduler start
│   ├── db/
│   │   └── database.ts           ← rate_snapshots + refresh_log tables
│   ├── services/
│   │   ├── currencyService.ts    ← fetch, store, query, convert, stats
│   │   └── scheduler.ts          ← node-cron job setup
│   ├── routes/
│   │   └── currency.ts           ← all route handlers
│   ├── types/
│   │   └── index.ts
│   └── middleware/
│       └── logger.ts
├── data/                         ← currency.db created here
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd Desktop
mkdir day-073-currency-service
cd day-073-currency-service
mkdir -p src/db src/services src/routes src/types src/middleware
```

Copy all files, then:

```bash
npm install
npm run dev
```

## Testing Step by Step

1. Server starts → watch terminal for "initial fetch" and scheduler start
2. `http://localhost:3000/currency/rates` — 12 key currencies
3. `http://localhost:3000/currency/ngn` — Naira rates (note how many Naira per dollar)
4. `http://localhost:3000/currency/convert?from=NGN&to=USD&amount=50000` — 50k Naira to USD
5. `http://localhost:3000/currency/convert?from=USD&to=NGN&amount=100` — $100 to Naira
6. `http://localhost:3000/currency/all` — all ~170 currencies
7. In Postman: POST `http://localhost:3000/currency/refresh` — triggers immediate refresh
8. `http://localhost:3000/currency/history` — see NGN rate across snapshots
9. `http://localhost:3000/currency/stats` — total snapshots, success/failure counts
10. `http://localhost:3000/currency/log` — see each job run with duration
11. Stop and restart server — `http://localhost:3000/currency/rates` — data still there

### Test the scheduler quickly:
Change `REFRESH_CRON=*/2 * * * *` in .env (every 2 minutes), restart, wait — watch the terminal fire the job automatically.

## What I Learned

- node-cron schedules use 5-field cron syntax: minute hour day-of-month month day-of-week. `0 * * * *` fires at the top of every hour. cron.validate() checks the expression before scheduling.
- The scheduler should not crash the server on failure — a network error fetching rates at 3am should be logged and the previous snapshot served, not bring the whole server down
- Cross-rate currency conversion uses USD as a bridge: amount × (targetRate / sourceRate). This works because all rates in the snapshot are relative to the same base (USD).
- Logging every background job run in a refresh_log table gives you an audit trail — you can see when the job last ran, how long it took, and any failures
- An initial fetch on server startup (if DB is empty) makes the service immediately usable — without it there's a window where the server is running but has no data
- stopScheduler() in the SIGTERM handler prevents the cron job from firing during graceful shutdown

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 73 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 20, 2025 |
| Previous | [Day 72 — Weather Backend](../day-072-weather-backend) |
| Next | [Day 74 — Quote API](../day-074-quote-api) |

Part of my 300 Days of Code Challenge!
