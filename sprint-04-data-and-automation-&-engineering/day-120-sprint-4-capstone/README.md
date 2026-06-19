# Day 120: Sprint 4 Capstone — Nigerian E-Commerce Analytics Platform

## Description

The Sprint 4 finale. A Nigerian e-commerce analytics platform that unites
every major technique from Days 91–119 into one cohesive codebase: a
PostgreSQL data layer with FTS triggers and GENERATED columns, a Redis
caching layer with TTL and pattern invalidation, five window-function
analytics queries, multi-format export (CSV / Excel / PDF), and a
terminal CLI dashboard alongside the REST API.

The domain is a Nigerian online marketplace — 25 products across 5
categories (Phones & Tablets, Electronics, Fashion & Apparel, Groceries,
Home & Living), 15 Nigerian customers across 9 states, and 400 orders
seeded over January–June 2025.

## What's New

This project synthesises all four weeks of Sprint 4:

| Technique | Origin | Used for |
|---|---|---|
| PostgreSQL `tsvector` + GIN index + trigger | Day 117 | Product FTS with `ts_rank_cd` |
| `GENERATED ALWAYS AS ... STORED` | Day 118 | `revenue = quantity * unit_price` |
| `BRIN` index on `ordered_at` | Day 119 | Efficient time-range scans on orders |
| `AVG() OVER (ROWS BETWEEN ...)` | Day 119 | 7-day revenue moving average by category |
| `SUM() OVER (UNBOUNDED PRECEDING)` | Day 119 | Cumulative revenue running total |
| `RANK() OVER (PARTITION BY ...)` | Day 119 | Dual ranking — overall + in-category |
| CTE → `LAG()` → `RANK()` | Day 119 | Month-over-month category comparison |
| `PERCENT_RANK()` + `NTILE(4)` | Day 119 | Customer LTV percentile bands (Bronze/Silver/Gold/Platinum) |
| Redis read-through cache + `SCAN` invalidation | Day 116 | All GET analytics and search routes |
| `csv-stringify` multi-section CSV | Day 118 | Dashboard CSV export |
| ExcelJS 3-sheet workbook | Day 118 | Dashboard Excel export |
| PDFKit branded A4 report | Day 118 | Dashboard PDF export |
| Terminal CLI dashboard | Sprint 1/2 | `summary`, `search`, `export` commands |

## Features

- 🔍 FTS product search (`tsvector` + `ts_rank_cd` + `ts_headline`)
- 📈 7-day moving average and running total per category
- 📅 Month-over-month category comparison (CTE + LAG)
- 🏆 Dual RANK — overall and within category
- 💎 Customer LTV with PERCENT_RANK + NTILE quartile bands (Bronze → Platinum)
- ⚡ Redis read-through caching on all analytics and search endpoints
- 🧹 Pattern-based cache invalidation
- 📄 CSV / Excel (3-sheet) / PDF (branded A4) exports
- 🖥️ Terminal CLI: `summary`, `search`, `export` commands
- 🇳🇬 25 Nigerian products, 15 Nigerian customers, 400 orders across 6 months

## Technologies Used

- **Node.js** + **TypeScript**
- **Express 4** — REST API
- **pg** — PostgreSQL driver
- **redis** (node-redis v4) — caching layer
- **csv-stringify** — CSV export
- **ExcelJS** — Excel export
- **PDFKit** — PDF export
- **zod** — query validation
- **chalk** — CLI and log coloring
- **dotenv** + **tsx**

## Folder Structure

```
day-120-sprint4-capstone/
├── .env
├── tsconfig.json
├── package.json
├── exports/
└── src/
    ├── index.ts                     # Express app entry point
    ├── types/index.ts               # All domain + analytics interfaces
    ├── db/
    │   ├── pool.ts                  # Lazy pg connection pool
    │   └── migrations.ts            # Schema: tsvector trigger, BRIN, GENERATED
    ├── cache/
    │   ├── redis.ts                 # Lazy Redis client, graceful fallback
    │   └── middleware.ts            # Read-through middleware + SCAN invalidation
    ├── analytics/
    │   └── queries.ts               # All 5 window-function query functions
    ├── search/
    │   └── engine.ts                # FTS via plainto_tsquery + ts_rank_cd
    ├── exporters/
    │   ├── csvExporter.ts
    │   ├── excelExporter.ts
    │   └── pdfExporter.ts
    ├── routes/
    │   └── index.ts                 # All routes: analytics, search, export, cache
    ├── cli/
    │   └── index.ts                 # Terminal dashboard CLI
    ├── utils/
    │   └── logger.ts
    └── seed/
        └── index.ts                 # 25 products, 15 customers, 400 orders
```

## Installation

```bash
cd ~/Desktop/300-Days-Of-Code/sprint-04-data/day-120-sprint4-capstone
npm install
```

Create the database:

```bash
psql -U postgres -c "CREATE DATABASE ecom_analytics;"
```

Redis (optional — API works without it):

```bash
brew services start redis
```

## How to Run

```bash
# Seed data (run once)
npm run seed

# API server
npm run dev

# CLI
npm run cli -- summary
npm run cli -- search "bluetooth speaker"
npm run cli -- export csv
```

## Testing Step by Step

1. **Set up and seed**

   ```bash
   psql -U postgres -c "CREATE DATABASE ecom_analytics;"
   npm install
   npm run seed
   ```

   Expect: `Seeded 25 products, 15 customers, 400 orders.`

2. **Start the server**

   ```bash
   npm run dev
   ```

   Expect `[db] Migrations complete.` and `[redis] connected` (or
   `[redis] unavailable` if Redis isn't running — API still works).

3. **Explore the root endpoint**

   ```bash
   curl http://localhost:4004/ | json_pp
   ```

4. **Revenue windows — 7-day MA + running total + category rank**

   ```bash
   curl "http://localhost:4004/api/analytics/revenue?limit=20" | json_pp
   ```

   Each row includes `revenue`, `revenue_7d_ma`, `running_total`, and
   `rank_in_category`. First request: `X-Cache: MISS`. Second: `X-Cache: HIT`.

5. **Category MoM comparison**

   ```bash
   curl "http://localhost:4004/api/analytics/categories" | json_pp
   ```

   Each category shows `total_revenue`, `prev_month_revenue`, and
   `mom_change_pct`. First month per category has `null` for prev/MoM.

6. **Customer LTV bands**

   ```bash
   curl "http://localhost:4004/api/analytics/customers" | json_pp
   ```

   Customers ranked by `total_spent` with `ltv_percentile` (0–100) and
   `ltv_band` (Bronze / Silver / Gold / Platinum).

7. **Top products — dual rank**

   ```bash
   curl "http://localhost:4004/api/analytics/products" | json_pp
   ```

   Each product has `rank_overall` (across all categories) and
   `rank_in_category` (within its category).

8. **FTS product search**

   ```bash
   curl "http://localhost:4004/api/search?q=bluetooth+speaker" | json_pp
   curl "http://localhost:4004/api/search?q=traditional+fabric" | json_pp
   curl "http://localhost:4004/api/search?q=solar+energy" | json_pp
   ```

   Results include a `rank` score and a `headline` with `<b>` highlighted
   match terms.

9. **Filter all analytics by date and category**

   ```bash
   curl "http://localhost:4004/api/analytics/revenue?from=2025-03-01&to=2025-03-31&category=Electronics" | json_pp
   curl "http://localhost:4004/api/analytics/customers?city=Lagos" | json_pp
   ```

10. **Export the full dashboard**

    ```bash
    curl -o dashboard.csv   http://localhost:4004/api/export/csv
    curl -o dashboard.xlsx  http://localhost:4004/api/export/excel
    curl -o dashboard.pdf   http://localhost:4004/api/export/pdf
    open dashboard.xlsx
    open dashboard.pdf
    ```

11. **Filtered export (Q1 only)**

    ```bash
    curl -o q1.pdf "http://localhost:4004/api/export/pdf?from=2025-01-01&to=2025-03-31"
    open q1.pdf
    ```

12. **Cache stats and flush**

    ```bash
    curl http://localhost:4004/api/cache/stats
    curl -X DELETE http://localhost:4004/api/cache
    ```

13. **CLI: terminal dashboard summary**

    ```bash
    npm run cli -- summary
    npm run cli -- summary --from=2025-04-01 --to=2025-06-14
    npm run cli -- summary --category="Phones & Tablets"
    ```

    Prints a colored dashboard with KPIs, bar chart revenue by category,
    top 5 products, and top 5 customers with LTV band colors.

14. **CLI: product search**

    ```bash
    npm run cli -- search "cooking pot"
    npm run cli -- search "solar panel energy"
    ```

15. **CLI: export to disk**

    ```bash
    npm run cli -- export csv
    npm run cli -- export pdf --from=2025-01-01 --to=2025-03-31
    ls exports/
    ```

    Files are saved to `./exports/` with a timestamp in the filename.

## What I Learned

Pulling all of Sprint 4 into one project exposed how the techniques
complement each other cleanly:

- The **FTS trigger** and **GENERATED column** mean the database
  maintains two derived values (`search_vector`, `revenue`) with zero
  application code — once the trigger is registered, inserts and updates
  just work.
- **BRIN on `ordered_at`** keeps the index tiny for a large append-only
  orders table; the B-tree indexes on `product_id` and `customer_id`
  cover the JOIN lookups.
- All five analytics queries (`getRevenueWindows`, `getCategorySummary`,
  `getCustomerLTV`, `getTopProducts`, `getDashboardReport`) share a single
  `buildWhere()` helper that parameterises the SQL `WHERE` clause, so
  every filter works across all endpoints and all three export formats
  without any duplicated logic.
- The **Redis cache key** includes the full URL (path + query string), so
  `?from=2025-01` and `?from=2025-02` get separate entries automatically
  with no extra code.
- **Pattern invalidation** (`SCAN` + `DEL cap:*`) on write paths is
  heavier than key-level invalidation but safe for a dashboard where any
  data change should flush all cached views.
- The **CLI and API share the same analytics and exporter functions** — no
  logic is duplicated between the two interfaces. The CLI `export` command
  calls the same `buildCsv()` / `buildExcel()` / `buildPdf()` that the
  API routes use, writing the buffer to disk instead of the response stream.

## Challenge Info

| Field | Value |
|-------|-------|
| Day | 120 |
| Sprint | 4 — Data Engineering & Databases |
| Date | June 13, 2025 |
| Previous | [Day 119 - Time-Series Window Functions](../day-119-timeseries) |
| Next | Day 121 — Sprint 5: Mobile Apps (React Native / Expo) |

Part of my 300 Days of Code Challenge!
