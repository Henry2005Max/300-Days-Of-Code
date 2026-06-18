# Day 119: Time-Series Data with PostgreSQL Window Functions

## Description

An IoT sensor analytics API that stores hourly readings from 10 Nigerian
city sensors (Lagos, Abuja, Kano, Port Harcourt, Enugu) and runs six
different window-function analyses on the data — all computed directly in
PostgreSQL with no post-processing in JavaScript. The dataset covers
6 months of readings for temperature, humidity, AQI, and power consumption,
seeded with deliberate gaps to exercise gap detection.

## What's New

Six distinct window-function patterns, each in its own analytics module:

- **Moving averages** — 7-day and 30-day rolling `AVG() OVER (ROWS BETWEEN
  N PRECEDING AND CURRENT ROW)`, `LAG()` for the previous reading, and
  period-over-period percentage change in a single query.
- **Running totals** — `SUM() OVER (UNBOUNDED PRECEDING)` for cumulative
  totals, plus `RANK() OVER (PARTITION BY sensor_id, DATE(...))` for daily
  value rankings.
- **Period-over-period comparison** — monthly aggregation in a CTE, then
  `LAG()` over the CTE result to bring the previous month's average into
  the same row, with `RANK()` within each month.
- **Percentile bands** — `PERCENT_RANK()` for a 0–100 position within the
  sensor's value distribution, and `NTILE(4)` to bucket readings into
  named quartile bands (Low / Below Average / Above Average / High).
- **Daily OHLC** — `FIRST_VALUE()` and `LAST_VALUE()` with
  `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` to get the
  opening and closing reading of each day, combined with `MIN()` / `MAX()`
  / `AVG()` for a financial-style candlestick view of sensor data.
- **Gap detection** — `LEAD(recorded_at, 1) OVER (PARTITION BY sensor_id
  ORDER BY recorded_at)` to find intervals between consecutive readings
  that exceed a configurable threshold.
- **BRIN index** — `CREATE INDEX USING BRIN (recorded_at)` for efficient
  date-range scans on time-ordered data, much smaller than B-tree at scale.

## Features

- 📡 10 sensors across 5 Nigerian cities (Lagos, Abuja, Kano, Port Harcourt, Enugu)
- 🌡️ Four metric types: temperature, humidity, AQI, power_kwh
- ⏱️ ~43,000 hourly readings spanning Jan–Jun 2025
- 📈 7-day and 30-day moving averages with LAG and % change
- ∑ Cumulative running totals and daily rank within partition
- 📅 Month-over-month comparison with RANK in period
- 🎯 Percentile bands via PERCENT_RANK and NTILE(4)
- 📊 Daily OHLC (open/high/low/close) via FIRST_VALUE / LAST_VALUE
- 🔍 Gap detection via LEAD with configurable minimum gap threshold
- 🗂️ BRIN index on recorded_at for efficient time-range scans
- 🔎 All endpoints support `?sensorId=&city=&metricType=&from=&to=&limit=`

## Technologies Used

- **Node.js** + **TypeScript**
- **Express 4** — REST API
- **pg** (node-postgres) — PostgreSQL driver
- **zod** — query parameter validation
- **chalk** — colored request logs
- **dotenv** — environment configuration
- **tsx** — TypeScript dev runner

## Folder Structure

```
day-119-timeseries/
├── .env
├── tsconfig.json
├── package.json
└── src/
    ├── index.ts
    ├── types/index.ts
    ├── db/
    │   ├── pool.ts
    │   └── migrations.ts          # BRIN index + sensor indexes
    ├── analytics/
    │   ├── movingAverage.ts       # AVG OVER ROWS, LAG, % change
    │   ├── runningTotal.ts        # SUM OVER UNBOUNDED, RANK by day
    │   ├── periodComparison.ts    # CTE + LAG + RANK month-over-month
    │   ├── percentileBands.ts     # PERCENT_RANK + NTILE(4)
    │   ├── ohlc.ts                # FIRST_VALUE / LAST_VALUE daily
    │   └── gapDetection.ts        # LEAD gap finder
    ├── routes/
    │   └── analyticsRoutes.ts
    ├── utils/
    │   └── logger.ts
    └── seed/
        └── index.ts               # ~43k rows, sinusoidal daily pattern
```

## Installation

```bash
cd ~/Desktop/300-Days-Of-Code/sprint-04-data/day-119-timeseries
npm install
```

Create the database:

```bash
psql -U postgres -c "CREATE DATABASE timeseries_db;"
```

## How to Run

```bash
# Seed ~43,000 hourly readings (takes ~5 seconds)
npm run seed

# Dev server
npm run dev

# Production
npm run build && npm start
```

Server runs on `http://localhost:4003`.

## Testing Step by Step

1. **Create the database and install dependencies**

   ```bash
   psql -U postgres -c "CREATE DATABASE timeseries_db;"
   npm install
   ```

2. **Seed the dataset**

   ```bash
   npm run seed
   ```

   Expect: `Seeded 43,xxx metric readings across 10 sensors.`

3. **Start the server**

   ```bash
   npm run dev
   ```

4. **Check available sensors**

   ```bash
   curl http://localhost:4003/api/analytics/sensors | json_pp
   ```

   You should see 10 sensors: LAGOS-TEMP-01, LAGOS-AQI-01, LAGOS-HUM-01,
   ABUJA-TEMP-01, ABUJA-POWER-01, KANO-TEMP-01, KANO-HUM-01,
   PH-TEMP-01, PH-AQI-01, ENUGU-POWER-01.

5. **Raw readings for one sensor**

   ```bash
   curl "http://localhost:4003/api/metrics?sensorId=LAGOS-TEMP-01&limit=10" | json_pp
   ```

6. **7-day and 30-day moving averages**

   ```bash
   curl "http://localhost:4003/api/analytics/moving-averages?sensorId=LAGOS-TEMP-01&from=2025-02-01&to=2025-02-28&limit=50" | json_pp
   ```

   Each row includes `value`, `ma_7`, `ma_30`, `prev_value`, and
   `change_pct`. The first 6 rows will have `ma_7` based on fewer than 7
   readings (the window simply uses what's available). The first row's
   `prev_value` and `change_pct` are `null`.

7. **Running totals and daily rank**

   ```bash
   curl "http://localhost:4003/api/analytics/running-totals?sensorId=ABUJA-POWER-01&from=2025-01-01&to=2025-01-07" | json_pp
   ```

   `running_total` grows monotonically. `daily_rank` of 1 means this was
   the highest reading of the day for that sensor.

8. **Month-over-month comparison**

   ```bash
   curl "http://localhost:4003/api/analytics/period-comparison?sensorId=LAGOS-TEMP-01" | json_pp
   ```

   Each row is one calendar month. `prev_avg` is the previous month's
   average, `change_pct` is the percentage change, and `rank_in_period`
   ranks this sensor against others in the same month.

9. **Percentile bands**

   ```bash
   curl "http://localhost:4003/api/analytics/percentile-bands?sensorId=LAGOS-AQI-01&from=2025-01-01&to=2025-01-31&limit=20" | json_pp
   ```

   Each reading has a `percentile` (0–100) and a `band`: Low, Below
   Average, Above Average, or High (NTILE quartile label).

10. **Daily OHLC (open/high/low/close)**

    ```bash
    curl "http://localhost:4003/api/analytics/ohlc?sensorId=KANO-TEMP-01&from=2025-01-01&to=2025-01-14" | json_pp
    ```

    `open` = first reading of the day, `close` = last reading, `high` /
    `low` = extremes, `avg_value` = mean, `reading_count` = how many
    hourly readings contributed.

11. **Filter OHLC by city instead of sensor**

    ```bash
    curl "http://localhost:4003/api/analytics/ohlc?city=Abuja&metricType=power_kwh" | json_pp
    ```

12. **Gap detection**

    ```bash
    curl "http://localhost:4003/api/analytics/gaps?sensorId=LAGOS-AQI-01&minGapHours=2" | json_pp
    ```

    Returns intervals where no reading was recorded for more than 2 hours.
    LAGOS-AQI-01 and KANO-TEMP-01 have deliberate outages seeded in —
    you should see several gaps of ~4 hours each.

    ```bash
    curl "http://localhost:4003/api/analytics/gaps?minGapHours=1" | json_pp
    ```

    Lowering the threshold to 1 hour finds smaller gaps across all sensors.

13. **Cross-sensor moving averages for a whole city**

    ```bash
    curl "http://localhost:4003/api/analytics/moving-averages?city=Lagos&metricType=temperature&from=2025-03-01&to=2025-03-07" | json_pp
    ```

    All Lagos temperature sensors in one response, each with its own
    7-day / 30-day MA (the window is `PARTITION BY sensor_id` so the
    averages don't bleed across sensors).

## What I Learned

- **ROWS vs RANGE frame** — `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW`
  counts exactly 7 physical rows regardless of tied values; `RANGE`
  includes all rows with the same `ORDER BY` value, which can include
  more than intended for a rolling window.
- **`FIRST_VALUE` / `LAST_VALUE` need an explicit frame** — the default
  frame for `LAST_VALUE` is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT
  ROW`, which only looks backwards, so it always returns the current row's
  value. You must specify `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED
  FOLLOWING` to get the actual last value in the partition.
- **CTEs as window function inputs** — `LAG()` can only operate on a
  result set it can see. For period-over-period (LAG over monthly
  aggregates), the monthly `GROUP BY` must happen first in a CTE, then
  the window function runs in the outer query.
- **`NULLIF` for safe division** — `value / NULLIF(prev, 0)` avoids
  division-by-zero without `CASE WHEN` boilerplate. PostgreSQL returns
  `NULL` instead of raising an error.
- **`PERCENT_RANK` vs `NTILE`** — `PERCENT_RANK` gives a continuous
  0–1 position; `NTILE(n)` gives a discrete bucket number. Both are
  useful but answer different questions: "where does this reading sit?"
  vs "which quartile does it belong to?"
- **BRIN indexes** — perfect for append-only time-series tables where
  rows are physically inserted in timestamp order. Store only block-range
  min/max metadata, making them orders of magnitude smaller than B-tree
  indexes on very large tables.
- **`LEAD` for gap detection** — pairing each row with its successor's
  timestamp in the same partition, then filtering by gap size, is a clean
  O(n) pattern that would otherwise require a self-join.

## Challenge Info

| Field | Value |
|-------|-------|
| Day | 119 |
| Sprint | 4 — Data Engineering & Databases |
| Date | June 13, 2025 |
| Previous | [Day 118 - Data Export Pipeline](../day-118-data-export) |
| Next | Day 120 — Sprint 4 Capstone & Review |

Part of my 300 Days of Code Challenge!
