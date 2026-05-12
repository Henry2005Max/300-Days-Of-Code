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

## Day 92 - May 11

**Project:** Prisma ORM with PostgreSQL
**Time Spent:** 3 hours

### What I Built

Built a schema-first relational database system using Prisma ORM on top of PostgreSQL. Designed a multi-table e-commerce schema covering users, categories, products, orders, and order items — with all foreign key relations, a PostgreSQL enum for order status, and snake_case column mapping while keeping PascalCase in the TypeScript model layer. Ran `prisma migrate dev` to generate and apply the SQL migration automatically, then generated a fully typed Prisma Client from the schema.

Wrote a Nigerian data seeder that populates 15 users across Nigerian cities, 30 products across 6 categories with realistic Naira pricing, and 20 orders with line items. The seeder runs a clean delete cycle before each seed so it is safe to re-run. All order totals are computed from unit price times quantity before insert, keeping the `total_amount` column consistent with the line items.

Built five analytics query functions using Prisma Client — all orders with nested user and item data, top products by revenue using `groupBy` with `_sum`, top customers by spend, category revenue breakdown via nested includes, and a low stock alert query using `lt` filtering. All five run in parallel via `Promise.all` and print to the terminal in aligned Naira-formatted columns.

### What I Learned

- `@map` renames individual fields to snake_case in the database while keeping camelCase in TypeScript
- `@@map` at the model level renames the entire table — keeps PostgreSQL snake_case and Prisma PascalCase in sync
- Prisma `groupBy` requires all aggregation fields declared upfront — `_sum`, `_count`, `_avg` are specified in the same call
- `Decimal` type fields from Prisma Client return as `Decimal` objects, not plain JavaScript numbers — always wrap with `Number()` before arithmetic or formatting
- `findMany` with nested `include` generates a single JOIN query, not sequential N+1 queries
- `prisma migrate dev` generates the SQL file in `prisma/migrations/` and applies it in one command
- Prisma Studio opens a full admin UI at `localhost:5555` with zero configuration — useful for inspecting seed data

### Resources Used

- [Prisma schema reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client groupBy](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#groupby)
- [Prisma relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Prisma migrate dev](https://www.prisma.io/docs/reference/api-reference/command-reference#migrate-dev)

### Tomorrow

Day 93 — Data Visualization with Chart.js in Node.js. Pull aggregate data from PostgreSQL and generate real PNG chart files (bar, line, pie) using `chartjs-node-canvas` — no browser required.

## Day 93 - May 12

**Project:** Data Visualization with Chart.js in Node.js
**Time Spent:** 3 hours

### What I Built

Built a server-side data visualization CLI that queries the Day 91 PostgreSQL sales database and generates five PNG chart files using Chart.js and `chartjs-node-canvas`. The tool pulls five different aggregate datasets in parallel — category revenue, monthly trends, top products, city revenue, and stock levels — then renders each into a distinct chart type saved to an `./output/` directory.

The charts cover the full range of Chart.js chart types: a vertical bar chart for category revenue, a dual Y-axis line chart showing both revenue and order count trends over time, a pie chart for revenue share breakdown, a horizontal bar chart for the top 8 products, and a city revenue bar chart. All five are rendered in parallel using `Promise.all` since each uses an independent canvas instance. A consistent green palette is applied across all charts for visual coherence.

The terminal also prints a formatted summary of all queried data alongside the chart generation, so the numbers behind each chart are visible in one place. The entire pipeline from database query to PNG file write runs in under two seconds on a local PostgreSQL instance.

### What I Learned

- `chartjs-node-canvas` runs Chart.js on a server-side canvas — the chart configuration is identical to browser Chart.js, only the render call differs (`renderToBuffer()` instead of mounting to a DOM canvas)
- Dual Y-axes require `yAxisID` on each dataset matching `y` and `y1` scale keys defined under `options.scales`
- Horizontal bar charts use `indexAxis: 'y'` on a standard `bar` type — no separate chart type
- Setting `backgroundColour: '#ffffff'` on `ChartJSNodeCanvas` prevents transparent backgrounds in the output PNG
- Chart.js v4 requires all plugin config (title, legend) nested under `options.plugins` — the older flat structure throws silent errors
- `renderToBuffer()` returns a `Buffer` — `fs.writeFileSync()` handles it directly, no base64 conversion needed
- The `canvas` native dependency may require Xcode command-line tools on macOS for compilation during `npm install`

### Resources Used

- [chartjs-node-canvas GitHub](https://github.com/SeanSobey/ChartjsNodeCanvas)
- [Chart.js v4 configuration](https://www.chartjs.org/docs/latest/configuration/)
- [Chart.js scales — multiple axes](https://www.chartjs.org/docs/latest/axes/)
- [Node.js fs.writeFileSync](https://nodejs.org/api/fs.html#fswritefilesyncfile-data-options)

### Tomorrow

Day 94 — X (Twitter) Bot with `twitter-api-v2`. Automated posting bot that pulls data from an API, formats a tweet, and posts it on a schedule using `node-cron`. Will cover OAuth 2.0 setup, tweet composition, and rate limit handling.
