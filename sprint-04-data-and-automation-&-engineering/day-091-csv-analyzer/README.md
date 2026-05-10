# Day 91: TypeScript CSV Analyzer with PostgreSQL

A production-grade CLI tool that ingests a CSV file, validates and cleans each row with Zod, bulk-loads the data into PostgreSQL, then runs aggregate SQL queries to generate a structured sales analytics report — all printed to the terminal in a formatted layout.

## What's New

Sprint 4 begins here. This is the first project using PostgreSQL instead of SQLite, introducing connection pooling (`pg` Pool), batch inserts with dynamic placeholders, DDL migrations with CHECK constraints and indexes, and multi-query analytics using SQL window functions and aggregation.

## Features

- Streams CSV from disk using `csv-parse` (memory-efficient, no full-file load)
- Validates every row with Zod — type coercion, range checks, numeric sanitisation
- Reports invalid rows before insert (non-blocking — valid rows still proceed)
- Creates PostgreSQL table with migrations on every run (idempotent `CREATE IF NOT EXISTS`)
- Bulk inserts in configurable batches (default 100 rows per query)
- Runs 5 parallel analytics queries: summary stats, top products, category breakdown, city ranking, monthly trend
- Naira-formatted output (NGN) with aligned tabular terminal display
- Lazy pool init — pool created once in bootstrap, never at module load time
- `.env` driven — swap database, CSV path, table name, batch size without touching code

## Technologies Used

- Node.js + TypeScript
- `pg` — node-postgres driver with connection pooling
- `csv-parse` — stream-based CSV parsing
- `zod` — schema validation and type coercion
- `dotenv` — environment configuration
- `tsx` — TypeScript execution without compilation step

## Folder Structure

```
day-091-csv-analyzer/
├── data/
│   └── sales.csv           # Sample Nigerian sales dataset (50 records)
├── src/
│   ├── analytics/
│   │   └── queries.ts      # Aggregate SQL queries (summary, products, categories, cities, trends)
│   ├── db/
│   │   ├── migrations.ts   # CREATE TABLE, indexes, TRUNCATE
│   │   └── pool.ts         # Lazy pg.Pool singleton
│   ├── loader/
│   │   └── bulkInsert.ts   # Batch INSERT with dynamic placeholders
│   ├── parser/
│   │   └── csvParser.ts    # csv-parse stream + Zod validation
│   ├── reporter/
│   │   └── printReport.ts  # Terminal-formatted report output
│   ├── types/
│   │   └── index.ts        # All interfaces
│   └── index.ts            # Bootstrap → ingest → analyze pipeline
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-091-csv-analyzer
npm install
```

Ensure PostgreSQL is running locally (or update `DATABASE_URL` in `.env`).

## How to Run

```bash
# Run the full pipeline: parse → validate → load → analyze → report
npm run analyze

# Or with watch mode for development
npm run dev
```

## Testing Step by Step

1. **Confirm PostgreSQL is running:**
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

2. **Create the target database if it doesn't exist:**
   ```bash
   createdb csv_analyzer
   ```

3. **Set your connection string in `.env`:**
   ```
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/csv_analyzer
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Run the analyzer against the sample data:**
   ```bash
   npm run analyze
   ```

6. **Check what the pipeline prints:**
   - Row count read from CSV
   - Valid vs invalid row counts (with reasons for invalid rows)
   - Batch insert progress bar
   - Full analytics report to terminal

7. **Test invalid row handling** — add a row with a blank `product` or non-numeric `quantity` to `data/sales.csv` and re-run. The row will be flagged in the validator output but all other rows will still be inserted.

8. **Run against your own CSV** — update `CSV_FILE_PATH` in `.env` to point to any CSV with matching columns (order_id, customer_name, product, category, quantity, unit_price, total_amount, city, state, order_date).

9. **Verify data in PostgreSQL directly:**
   ```bash
   psql -U postgres -d csv_analyzer -c "SELECT COUNT(*), SUM(total_amount) FROM sales_records;"
   ```

10. **Change batch size** — update `BATCH_SIZE=500` in `.env` and re-run to see fewer batch progress lines.

## What I Learned

- `pg.Pool` is preferred over `pg.Client` for CLI tools — it handles connection reuse across multiple concurrent queries automatically
- Dynamic batch INSERT placeholders (`$1, $2, ... $N`) require careful index calculation — `base = idx * columnCount`, then offset each field
- `ON CONFLICT DO NOTHING` prevents duplicate key errors on re-runs without needing a transaction rollback
- PostgreSQL `TO_CHAR(date, 'YYYY-MM')` is more reliable than JS-side date formatting for GROUP BY month
- `CREATE INDEX IF NOT EXISTS` makes migrations fully idempotent — safe to run on every boot
- Zod's `.transform()` method lets you validate AND coerce string → number in one pass, which is exactly what CSV data needs
- `csv-parse` in stream mode with `columns: true` auto-maps header row to object keys — no manual column index mapping needed
- `Promise.all([...5 queries...])` runs analytics in parallel, cutting total query time significantly
- `NUMERIC(12,2)` in PostgreSQL comes back as a string in node-postgres — always `parseFloat()` the result

## Challenge Info

| Field    | Detail                          |
|----------|---------------------------------|
| Day      | 91                              |
| Sprint   | 4 — Data Engineering & Databases |
| Date     | 2025-01-05                      |
| Previous | [Day 90](../day-090-review)     |
| Next     | [Day 92](../day-092-prisma-orm) |

Part of my 300 Days of Code Challenge!
