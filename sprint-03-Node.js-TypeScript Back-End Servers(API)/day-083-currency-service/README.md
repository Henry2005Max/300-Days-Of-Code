# Day 83: Currency Service

## Description

A REST API for live exchange rates, cross-currency conversion, historical trend analysis, and rate alerts. Rates are fetched from ExchangeRate-API (or the no-key fallback open.er-api.com) and refreshed on a configurable cron schedule. Every refresh appends a snapshot row per currency, building a time series for trend queries. User-defined alerts fire when a pair crosses a threshold. Every conversion is logged for audit history.

## What's New

Day 83 builds on Day 73's scheduler foundation with four new concepts: **historical snapshots** (append-only time series per pair), **cross-rate arithmetic** (deriving any pair from a common base — no need to store N² pairs), **trend analysis** (start/current/high/low/average/change% computed from snapshots), and **rate alerts** (threshold watchers that record triggered_at on each refresh). No API key is required — the no-key fallback works out of the box.

## Features

- Live rates for any base currency, refreshed by cron (default every 60 minutes)
- Force-refresh endpoint to bypass the schedule
- Filter rates by specific currencies: `?currencies=NGN,GBP,EUR`
- Cross-rate between any two currencies — always derived from the stored base
- Convert any amount between any two currencies; every call is logged
- 7-day (configurable) trend: direction, high, low, average, change%
- Rate alerts: set `above` or `below` thresholds with a custom label
- Alerts fire on next refresh and record triggered_at (never auto-deleted)
- Conversion log with pagination
- No API key required — uses open.er-api.com fallback automatically

## Technologies Used

- Node.js + TypeScript
- Express 4
- Axios
- better-sqlite3
- node-cron
- Zod
- dotenv
- tsx (dev runner)

## Folder Structure

```
sprint-03-backend/day-083-currency-service/
├── src/
│   ├── db/
│   │   ├── database.ts          # Migrations
│   │   └── statements.ts        # Lazy prepared statements
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   └── validate.ts
│   ├── routes/
│   │   └── currency.ts
│   ├── schemas/
│   │   └── currency.schema.ts
│   ├── services/
│   │   ├── currency.service.ts  # Rates, trend, convert, alerts
│   │   └── exchange.ts          # ExchangeRate-API wrapper + fallback
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
mkdir day-083-currency-service
cd day-083-currency-service
mkdir -p src/routes src/middleware src/db src/types src/services src/schemas
```

Copy all files into the structure above, then:

```bash
npm install
```

## How to Run

No API key needed — the server uses open.er-api.com by default.

```bash
npm run dev
```

Optionally, get a free key at https://www.exchangerate-api.com (250 requests/month) and add it to `.env` as `EXCHANGE_API_KEY=your_key` for higher limits.

## Testing Step by Step

### Step 1: Confirm the server is running

```bash
curl http://localhost:3000/health
```

On startup the server fetches rates automatically — you should see `[currency] Refreshed X rates` in the console.

### Step 2: List all USD rates

```bash
curl http://localhost:3000/rates/USD
```

### Step 3: Filter to specific currencies

```bash
curl "http://localhost:3000/rates/USD?currencies=NGN,GBP,EUR,GHS,KES"
```

Expected — only those five currencies returned.

### Step 4: Get the USD/NGN rate directly

```bash
curl http://localhost:3000/rates/USD/NGN
```

### Step 5: Get a cross-rate between two non-base currencies

NGN to GBP (derived via USD):

```bash
curl http://localhost:3000/rates/NGN/GBP
```

### Step 6: Convert an amount

Convert ₦50,000 to USD:

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"from":"NGN","to":"USD","amount":50000}'
```

Convert ₦100,000 to GBP:

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"from":"NGN","to":"GBP","amount":100000}'
```

### Step 7: View conversion log

```bash
curl http://localhost:3000/conversion-log
```

### Step 8: Get trend analysis for USD/NGN

```bash
curl http://localhost:3000/rates/USD/NGN/trend
```

On first run you may only have one snapshot, so high/low/average will equal the current rate. Run `POST /rates/refresh` a few times to build up snapshots, then check the trend again.

### Step 9: Get a 3-day trend

```bash
curl "http://localhost:3000/rates/USD/NGN/trend?days=3"
```

### Step 10: Create a rate alert

Alert when USD/NGN goes above 1700:

```bash
curl -X POST http://localhost:3000/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "base": "USD",
    "currency": "NGN",
    "direction": "above",
    "threshold": 1700,
    "label": "Naira weakening — review USD holdings"
  }'
```

Alert when USD/NGN drops below 1500:

```bash
curl -X POST http://localhost:3000/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "base": "USD",
    "currency": "NGN",
    "direction": "below",
    "threshold": 1500,
    "label": "Good time to buy NGN"
  }'
```

### Step 11: List all alerts

```bash
curl http://localhost:3000/alerts
```

### Step 12: Force a refresh (triggers alert evaluation)

```bash
curl -X POST http://localhost:3000/rates/refresh
```

If the current NGN rate exceeded your threshold, you will see `[alert] Triggered` in the console and `triggered_at` will be set.

### Step 13: Delete an alert

```bash
curl -X DELETE http://localhost:3000/alerts/1
```

### Step 14: Test validation — same from/to currency

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"from":"USD","to":"USD","amount":100}'
```

Expected 400: `"from and to currencies must be different"`

## What I Learned

- Cross-rate arithmetic lets you store only N rates (all vs one base) and derive any of N² pairs: `rate(A→B) = rate(base→B) / rate(base→A)`. This is how real forex systems work — every pair routes through USD (or SDR)
- Appending a snapshot on every refresh rather than updating a single row is the correct pattern for time-series data — it preserves the full history without any versioning logic and can be pruned by date to keep storage bounded
- `Math.max(...rates)` works for small arrays but fails with "Maximum call stack exceeded" for very large ones; the safe alternative is `rates.reduce((a, b) => Math.max(a, b), -Infinity)` — good to know before production
- Rate alerts benefit from storing `triggered_at` as a nullable timestamp rather than a boolean — you can see both "has this ever fired" and "when did it last fire" without an extra column
- The no-key fallback (open.er-api.com) returns `rates` while ExchangeRate-API returns `conversion_rates` — normalising at the API wrapper layer keeps all callers unaware of which source was used

## Challenge Info

| Field    | Value |
|----------|-------|
| Day      | 83 |
| Sprint   | 3 — Node.js Back-End Servers |
| Date     | April 30, 2026 |
| Previous | [Day 82 — Weather Backend Service](../day-082-weather-backend/) |
| Next     | [Day 84 — Quote API](../day-084-quote-api/) |

Part of my 300 Days of Code Challenge!
