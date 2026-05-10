## Day 91 - May 10

**Project:** TypeScript CSV Analyzer with PostgreSQL
**Time Spent:** 3 hours

### What I Built

Built a full ETL pipeline CLI that reads a CSV file, validates every row against a Zod schema, bulk-loads valid records into PostgreSQL, then runs a set of aggregate queries to produce a formatted sales analytics report in the terminal. The pipeline is split into four clean stages: parse, validate, load, and analyze — each in its own module with a single responsibility.

The database layer uses a lazy-initialized `pg.Pool` singleton that gets created only when first needed in `bootstrap()`, never at module load time. Migrations are idempotent — `CREATE TABLE IF NOT EXISTS` with `CREATE INDEX IF NOT EXISTS` means the tool can be run repeatedly without side effects. The bulk insert builds dynamic SQL placeholders (`$1...$N`) across configurable batch sizes, which keeps memory flat even on large files.

The analytics layer fires five parallel queries using `Promise.all` — summary statistics, top products by revenue, category revenue breakdown with percentage share, top cities, and a monthly revenue trend. All monetary values are formatted in Naira (NGN) in the terminal output with aligned columns for readability.

### What I Learned

- `pg.Pool` manages a connection pool automatically — multiple parallel queries share connections without manual lifecycle management
- Dynamic bulk INSERT placeholders need careful index math: `base = rowIndex * columnCount`, then add per-column offset
- PostgreSQL returns `NUMERIC` columns as strings via node-postgres — always `parseFloat()` before using in calculations
- Zod’s `.transform()` handles CSV-to-typed-object coercion in a single schema pass, eliminating a separate mapping step
- `csv-parse` in stream mode with `columns: true` auto-maps the CSV header row to object keys
- `TO_CHAR(date, 'YYYY-MM')` in PostgreSQL is cleaner than JS date formatting for GROUP BY month queries
- `Promise.all` on five independent queries is meaningfully faster than sequential `await` calls

### Resources Used

- [node-postgres documentation](https://node-postgres.com/)
- [csv-parse documentation](https://csv.js.org/parse/)
- [Zod transform API](https://zod.dev/?id=transform)
- [PostgreSQL aggregate functions](https://www.postgresql.org/docs/current/functions-aggregate.html)

### Tomorrow

Day 92 — Prisma ORM with PostgreSQL. Schema-first database modeling, type-safe query builder, and migrations via `prisma migrate dev`. Will model a multi-table schema (users, products, orders) and run complex relational queries using Prisma Client.
