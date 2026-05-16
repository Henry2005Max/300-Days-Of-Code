# Day 97: Stock Fetcher with Alpha Vantage API

A Node.js + TypeScript CLI that fetches live stock prices and NGN forex rates from the Alpha Vantage API, stores time-series price history in PostgreSQL, calculates price change and percentage difference between consecutive records, and prints a formatted market report — stocks and forex in two separate sections.

## What's New

First financial data project in the challenge. Introduces the Alpha Vantage API for both equity quotes (`GLOBAL_QUOTE`) and currency exchange rates (`CURRENCY_EXCHANGE_RATE`), time-series storage with a `price_history` table, a window-query approach to computing price change between the latest and previous record per symbol, and a realistic mock fallback for the free tier's 5 requests/minute limit.

## Features

- Tracks 5 global tech stocks (AAPL, MSFT, GOOGL, META, AMZN) and 3 NGN forex pairs (USD, GBP, EUR)
- Fetches live data from Alpha Vantage — falls back to realistic mock prices if API key is `demo` or rate limit is hit
- Stores full OHLV (open, high, low, volume) time-series per symbol in PostgreSQL
- Calculates price change (absolute + percentage) between the two most recent records per symbol using a window query
- `REPORT_ONLY=true` mode prints the report from existing DB data without making any API calls
- Nigerian-investor-focused layout — stocks in USD, forex in NGN with ₦ symbol
- Arrow indicators (▲ / ▼ / ◆) on every row showing direction of movement
- Day range (low / high / open) printed below each row
- Volume formatted as M/K for readability
- Lazy pool init — connection created only when first query runs

## Technologies Used

- Node.js + TypeScript
- Native `fetch` — HTTP requests to Alpha Vantage (Node.js 18+)
- `pg` — PostgreSQL connection pool
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-097-stock-fetcher/
├── src/
│   ├── db/
│   │   ├── migrations.ts    # assets + price_history tables, indexes
│   │   ├── pool.ts          # Lazy pg.Pool singleton
│   │   └── repository.ts    # upsertAsset, insertPricePoint, buildPriceReports
│   ├── display/
│   │   └── printer.ts       # Market report and fetch summary formatter
│   ├── services/
│   │   ├── assets.ts        # Asset definitions (stocks + forex pairs)
│   │   └── fetcher.ts       # Alpha Vantage API client with mock fallback
│   ├── types/
│   │   └── index.ts         # Interfaces
│   └── index.ts             # Entry point
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-097-stock-fetcher
npm install
```

## How to Run

```bash
# Fetch live data (or mock if no API key) and print report
npm run fetch

# Print report from existing DB records without fetching
npm run report
```

## Testing Step by Step

1. **Create the PostgreSQL database:**
   ```bash
   createdb stock_fetcher
   ```

2. **Update `.env`:**
   ```
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/stock_fetcher
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run with mock data** (no API key needed — `ALPHA_VANTAGE_API_KEY=demo` is the default):
   ```bash
   npm run fetch
   ```
   You should see mock prices for all 8 assets and a formatted market report.

5. **Get a free Alpha Vantage API key:**
    - Sign up at [alphavantage.co](https://www.alphavantage.co/support/#api-key)
    - Free tier: 25 requests/day, 5 requests/minute
    - Set it in `.env`: `ALPHA_VANTAGE_API_KEY=your_key_here`

6. **Run with live data:**
   ```bash
   npm run fetch
   ```
   Note: the fetcher sleeps 12 seconds between requests to stay within the 5/min free limit. With 8 assets this takes about 96 seconds total.

7. **Run again** — price change columns will now show the diff between the two stored records.

8. **Report-only mode** — no API calls, reads directly from the DB:
   ```bash
   npm run report
   ```

9. **Verify data in PostgreSQL:**
   ```bash
   psql -U postgres -d stock_fetcher -c \
     "SELECT symbol, price, recorded_at FROM price_history ORDER BY recorded_at DESC LIMIT 10;"
   ```

10. **Add more assets** — edit `src/services/assets.ts` to add any symbol supported by Alpha Vantage and re-run.

## What I Learned

- Alpha Vantage returns rate limit responses with an `Information` key rather than an HTTP error status — the response is still HTTP 200, so you must check the JSON body
- `DISTINCT ON (symbol)` in PostgreSQL with `ORDER BY symbol, recorded_at DESC` returns exactly one row per symbol — the most recent — without a subquery
- `NUMERIC(18, 6)` stores forex rates like NGN/USD precisely without floating-point rounding errors — always `parseFloat()` when reading back in Node.js
- Computing price change between the latest and previous records requires two CTEs: one for the most recent row per symbol, one for the row just before it — a `LEFT JOIN` handles symbols with only one record gracefully
- Alpha Vantage's free tier cap is per calendar day (UTC), not a rolling 24-hour window — useful to know when scheduling
- `AbortSignal.timeout(ms)` on native `fetch` prevents hanging requests without any external timeout library

## Challenge Info

| Field    | Detail                                    |
|----------|-------------------------------------------|
| Day      | 97                                        |
| Sprint   | 4 — Data Engineering & Databases          |
| Date     | 2025-01-11                                |
| Previous | [Day 96](../day-096-news-scraper)         |
| Next     | [Day 98](../day-098-sentiment-analyzer)   |

Part of my 300 Days of Code Challenge!
