# Day 100: Sprint 4 Review — CSV Analyzer Enhanced

Day 100 milestone. This project revisits and extends the Day 91 CSV Analyzer with three concrete improvements: concurrent batch inserts, three new PostgreSQL analytical queries (customer segmentation with `NTILE`, revenue percentiles with `PERCENTILE_CONT`, weekday revenue with `EXTRACT(DOW)`), and an `EXPLAIN ANALYZE` mode that prints query execution plans for performance inspection.

## What's New vs Day 91

| Area | Day 91 | Day 100 |
|------|--------|---------|
| Batch inserts | Sequential | Concurrent (configurable window, default 4 parallel) |
| Analytics queries | 5 queries | 8 queries — added segments, percentiles, weekday |
| Customer analysis | None | NTILE(3) window function — high/mid/low-value segments |
| Revenue distribution | None | PERCENTILE_CONT for P25/P50/P75/P90/P99 |
| Temporal analysis | Monthly only | Monthly + day-of-week via EXTRACT(DOW) |
| Query inspection | None | EXPLAIN ANALYZE mode via EXPLAIN=true |
| Indexes | 3 (category, date, city) | 5 (+ customer_name, total_amount) |

## Features

- Everything from Day 91 — CSV parse, Zod validation, bulk insert, 5 analytics queries
- Concurrent batch processing — batches run in parallel windows instead of sequentially
- `NTILE(3)` customer segmentation — splits customers into high/mid/low-value tiers using a window function
- `PERCENTILE_CONT` revenue distribution — P25, P50 (median), P75, P90, P99 order values
- Day-of-week revenue — `EXTRACT(DOW)` groups revenue and order count by weekday
- `EXPLAIN=true` mode — runs `EXPLAIN ANALYZE` on all key queries and prints the full plan
- Two additional indexes on `customer_name` and `total_amount` for the new queries

## Technologies Used

- Node.js + TypeScript
- `pg` — PostgreSQL connection pool
- `csv-parse` — stream CSV parsing
- `zod` — row validation and type coercion
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-100-review/
├── data/
│   └── sales.csv
├── src/
│   ├── analytics/
│   │   └── queries.ts      # Day 91 queries + 3 new queries + EXPLAIN runner
│   ├── db/
│   │   ├── migrations.ts   # Original table + 2 new indexes
│   │   └── pool.ts         # Lazy pg.Pool singleton
│   ├── loader/
│   │   └── bulkInsert.ts   # Concurrent batch insert (upgraded from sequential)
│   ├── parser/
│   │   └── csvParser.ts    # Unchanged from Day 91
│   ├── reporter/
│   │   └── printReport.ts  # Expanded report with new sections
│   ├── types/
│   │   └── index.ts        # Expanded with new result shapes
│   └── index.ts            # Bootstrap → ingest → parallel analyze → print
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-100-review
npm install
```

## How to Run

```bash
# Full pipeline — parse CSV, insert, run all queries, print report
npm run analyze

# Run with EXPLAIN ANALYZE output for all queries
npm run explain
```

## Testing Step by Step

1. **Create the database:**
   ```bash
   createdb csv_analyzer_v2
   ```

2. **Update `.env`:**
   ```
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/csv_analyzer_v2
   ```

3. **Install and run:**
   ```bash
   npm install
   npm run analyze
   ```

4. **Check the new report sections:**
   - Revenue Percentiles — shows the median order value and distribution spread
   - Customer Segments — three tiers based on total spend using NTILE
   - Day of Week Revenue — which days generate the most orders and revenue

5. **Run EXPLAIN ANALYZE mode to see query plans:**
   ```bash
   npm run explain
   ```

6. **Compare sequential vs concurrent inserts** — change `BATCH_SIZE=10` in `.env` to create more batches and observe the concurrent window in action.

---

## Sprint 4 Retrospective — Days 91–100

### What Was Built

| Day | Project | Key Tech |
|-----|---------|----------|
| 91 | CSV Analyzer | pg, csv-parse, Zod, bulk INSERT |
| 92 | Prisma ORM | Prisma Client, schema migrations, relational queries |
| 93 | Data Visualization | chartjs-node-canvas, server-side PNG charts |
| 94 | X Bot Poster | twitter-api-v2, node-cron, OAuth 1.0a |
| 95 | Email Automation | Nodemailer, inline HTML templates, Gmail SMTP |
| 96 | News Scraper | Cheerio, robots.txt, URL deduplication |
| 97 | Stock Fetcher | Alpha Vantage API, OHLV time-series, DISTINCT ON |
| 98 | Sentiment Analyzer | compromise NLP, lexicon scoring, normalized entities |
| 99 | Backup Script | Node.js fs, hand-built TAR, zlib, JSON log |
| 100 | Review (this) | NTILE, PERCENTILE_CONT, concurrent batches, EXPLAIN |

### Key PostgreSQL Patterns Learned Across Sprint 4

- `ON CONFLICT DO NOTHING` / `ON CONFLICT DO UPDATE` — idempotent upserts
- `DISTINCT ON (col) ORDER BY col, ...` — most recent row per group without a subquery
- `PERCENTILE_CONT(n) WITHIN GROUP (ORDER BY col)` — exact statistical percentiles
- `NTILE(n) OVER (ORDER BY col)` — equal-size bucketing for segmentation
- `TO_CHAR(date, 'YYYY-MM')` and `EXTRACT(DOW FROM date)` — temporal grouping
- CTEs for readable multi-step aggregations
- `json_agg(DISTINCT jsonb_build_object(...)) FILTER (WHERE ...)` — inline one-to-many aggregation

### Improvements Made to Day 91

1. Sequential batch inserts → concurrent windowed batches (4 at a time)
2. 5 analytics queries → 8 (added customer segments, percentiles, weekday)
3. 3 indexes → 5 (added customer_name, total_amount)
4. `EXPLAIN ANALYZE` mode for query plan inspection

## What I Learned

- `PERCENTILE_CONT` is an ordered-set aggregate — it uses `WITHIN GROUP (ORDER BY col)` syntax, not a standard `GROUP BY`
- `NTILE(n)` requires an `ORDER BY` inside the window spec — the tile boundaries are computed dynamically, not on fixed value ranges
- Concurrent batch inserts with `Promise.all` in windows reduce total insert time proportionally to concurrency up to the point of connection pool saturation
- `EXPLAIN ANALYZE` actually executes the query and measures real timing — `EXPLAIN` alone estimates without running
- `EXTRACT(DOW FROM date)` returns 0 for Sunday through 6 for Saturday in PostgreSQL — useful for sorting weekday labels correctly

## Challenge Info

| Field    | Detail                                    |
|----------|-------------------------------------------|
| Day      | 100                                       |
| Sprint   | 4 — Data Engineering & Databases          |
| Date     | 2025-01-14                                |
| Previous | [Day 99](../day-099-backup-script)        |
| Next     | [Day 101](../day-101-ts-dashboard-mock)   |

Part of my 300 Days of Code Challenge!
