## Day 115 - June 12

**Project:** Budget Tracker v2
**Time Spent:** 3.5 hours

### What I Built

Today I extended the Day 105 Budget Tracker into a multi-user system with
recurring transactions. The database schema now has four tables — users,
categories, transactions, and recurring_transactions — all wired together
with foreign keys and `ON DELETE CASCADE`, so every category and
transaction is scoped to a specific user.

The big new piece is the recurring transaction engine. Each recurring
entry stores its frequency (daily, weekly, monthly, yearly), a
`next_due_date`, and an optional `end_date`. The `process-recurring`
command finds everything due as of a given date, creates a matching
transaction for it, advances `next_due_date` by one interval, and repeats
until nothing is left due — so if I haven't run the CLI in a while, it
backfills every missed occurrence instead of just the most recent one.

I also added a running balance to `list-transactions` using a SQL window
function (`SUM() OVER (PARTITION BY user_id ORDER BY date, id)`), a
monthly summary command that breaks income/expense down by category, and
a CSV export using `csv-stringify`. Seeded the database with two demo
users — Chidinma Okafor and Tunde Balogun — with realistic Nigerian
transaction data to test everything end to end.

### What I Learned

- Modeling multi-tenant data in SQLite with `user_id` foreign keys and cascading deletes
- Computing running balances with `SUM() OVER (PARTITION BY ... ORDER BY ...)`
- Designing a recurring-transaction engine that backfills missed occurrences via a `next_due_date` loop
- Handling date math for daily/weekly/monthly/yearly intervals with native `Date`
- Grouping and filtering by month with SQLite's `strftime('%Y-%m', date)`
- Splitting CLI args into positional values and `--flag=value` options for date-range filters

### Resources Used

- [better-sqlite3 documentation](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [SQLite window functions](https://www.sqlite.org/windowfunctions.html)
- [SQLite date and time functions](https://www.sqlite.org/lang_datefunc.html)
- [csv-stringify documentation](https://csv.js.org/stringify/)

### Tomorrow

Day 116 — Redis caching layer on top of an Express API: building an API
that caches expensive query results in Redis, with TTL-based invalidation
and cache-hit/miss logging.


## Day 116 - June 13

**Project:** Redis Caching Layer on an Express API
**Time Spent:** 4 hours

### What I Built

Today I added a Redis caching layer in front of an Express + SQLite
product catalog API for a Nigerian online marketplace (5 categories, 25
products - phones, fashion, electronics, groceries, home goods). The
core piece is a generic `cacheMiddleware(ttlSeconds)` that wraps any GET
route: it checks Redis first, and on a miss lets the route handler run as
normal while intercepting `res.json()` to store the response under a
`cache:<METHOD>:<url>` key with a TTL. On a hit, it responds straight
from Redis and skips the database entirely. Every product query has an
artificial ~300ms delay built in, so the difference between a cache miss
and hit is obvious when testing with `curl` and `time`.

Each route gets its own TTL based on how often the data changes - 300s
for category lists, 120s for product lists and category-filtered
products, 60s for search, and 600s for individual product pages. Writes
(`POST`/`PUT`/`DELETE` on products) call an `invalidateProductCaches()`
helper that uses Redis `SCAN` + `DEL` to wipe `cache:GET:/api/products*`
and `cache:GET:/api/categories*` in one go, so stale data never lingers
after a write.

I also added cache hit/miss/set/invalidate logging with color-coded
output via Chalk, a request logger showing method/path/status/response
time, and a `/api/cache/stats` endpoint backed by Redis `INCR` counters
so hit rate stats survive a server restart. If Redis isn't running, the
app detects that once at startup and degrades gracefully - every endpoint
still works, just without caching.

### What I Learned

- Implementing read-through caching as Express middleware by intercepting `res.json()`
- Choosing TTLs based on data volatility rather than a single global cache duration
- Using `SCAN` + `MATCH` + `DEL` for pattern-based cache invalidation instead of blocking `KEYS`
- Persisting cache hit/miss/set counters in Redis with `INCR` so stats survive restarts
- Designing graceful degradation: one-time Redis connection attempt at startup, null-checked everywhere
- Using an artificial query delay to make caching speedups visible during manual testing
- A Zod + `strict: false` inference quirk where `.default()` fields make `safeParse().data` infer as fully optional, fixed by rebuilding the object explicitly

### Resources Used

- [node-redis (redis npm package) documentation](https://github.com/redis/node-redis)
- [Redis SCAN command](https://redis.io/docs/latest/commands/scan/)
- [Redis caching strategies](https://redis.io/docs/latest/develop/get-started/document-database/)
- [Zod documentation](https://zod.dev/)

### Tomorrow

Day 117 - Full-text search with PostgreSQL tsvector: building search
across a larger dataset using PostgreSQL's built-in text search (tsvector
columns, ts_rank, and GIN indexes) instead of LIKE queries.


## Day 117 - June 14

**Project:** Full-Text Search with PostgreSQL tsvector
**Time Spent:** 4 hours

### What I Built

Today I built a full-text search API over a Nigerian tech and business
article corpus using PostgreSQL's native FTS system — no external search
engine needed. The articles table has a `search_vector` tsvector column
that is automatically populated by a `BEFORE INSERT OR UPDATE` trigger,
so the index is always in sync without any application code. The trigger
combines title (weight A), body (weight B), and author plus tags (weight
C) using `setweight()`, so a title match ranks higher than a body match.
A GIN index on `search_vector` makes `@@` queries fast even at scale.

The search engine supports three query modes depending on the input:
`plainto_tsquery` for plain words (AND all terms together), `phraseto_tsquery`
for quoted strings (words must appear in the same order), and
`websearch_to_tsquery` when the query contains `&`, `|`, or `-` operators.
Results are scored with `ts_rank_cd` (cover density ranking, which rewards
term proximity) and include a `ts_headline` excerpt generated entirely by
PostgreSQL with matched terms wrapped in `<b>` tags. Filters for category
and author can be stacked alongside the FTS clause in the same query.

I also added autocomplete suggestions via `ts_stat` (which returns per-lexeme
document frequency counts across the whole corpus) and three debug endpoints:
one that shows the raw stored tsvector for any article, one that shows how
PostgreSQL parses an input into tsquery, and one that lists the most common
lexemes corpus-wide. The seed data is 15 articles written by Nigerian authors
on topics like Lagos fintech, React Native for low-end Android devices, agent
banking in the north, Paystack vs Flutterwave, and PostgreSQL internals.

### What I Learned

- How `tsvector` and `tsquery` work — lexemes, stemming, the `@@` operator
- Using `setweight()` to combine multiple fields with different relevance priorities
- `BEFORE INSERT OR UPDATE` triggers for auto-maintaining a derived column
- GIN vs GIST indexes for FTS: GIN is faster for lookups, GIST builds faster
- `ts_rank_cd` (cover density) vs `ts_rank` — proximity-aware ranking
- `ts_headline` for generating highlighted snippets with configurable options
- `ts_stat` for lexeme frequency analysis and autocomplete
- `plainto_tsquery` vs `phraseto_tsquery` vs `websearch_to_tsquery` differences

### Resources Used

- [PostgreSQL Full Text Search documentation](https://www.postgresql.org/docs/current/textsearch.html)
- [ts_rank and ts_rank_cd](https://www.postgresql.org/docs/current/textsearch-controls.html#TEXTSEARCH-RANKING)
- [ts_headline options](https://www.postgresql.org/docs/current/textsearch-controls.html#TEXTSEARCH-HEADLINE)
- [GIN vs GiST indexes](https://www.postgresql.org/docs/current/textsearch-indexes.html)

### Tomorrow

Day 118 — Data export pipeline: generating CSV, Excel, and PDF reports
from a PostgreSQL dataset, using csv-stringify, exceljs, and puppeteer
in a single Express API.


## Day 118 - June 15

**Project:** Data Export Pipeline (CSV + Excel + PDF)
**Time Spent:** 4.5 hours

### What I Built

Today I built a sales reporting API that generates three export formats
from the same PostgreSQL dataset. The architecture is a clean pipeline:
one `fetchSalesReport()` function runs four queries (raw rows, totals,
by-region with top product, by-category), returns a typed `SalesReport`
object, and each of the three exporters transforms it into its own format.
Filters (`from`, `to`, `region`, `category`) are applied in the SQL
`WHERE` clause so they work identically across all three formats.

The CSV exporter uses csv-stringify in synchronous mode to build a
multi-section file — a summary block at the top (totals, regional
breakdown, category breakdown) followed by all transaction rows. The Excel
exporter uses ExcelJS to produce a three-sheet workbook with styled green
headers, alternating row fills, frozen first rows, auto-fitted column
widths, and `₦#,##0.00` number formats on all monetary columns. The PDF
exporter uses PDFKit to generate a branded A4 report with a dark green
cover header, three KPI cards, and manually drawn tables — PDFKit has no
built-in table widget, so I drew each table with `doc.rect().fill()` for
cell backgrounds and `doc.text()` with explicit coordinates. Page breaks
are handled by checking `doc.y` before each row and calling `doc.addPage()`
when less than one row height remains. Footer page numbers are added
post-render by iterating `doc.switchToPage(i)`.

The dataset is 200 seeded rows: 10 Nigerian sales reps across 5 regions,
selling from a catalog of 17 products in 5 categories, over 6 months of
2025.

### What I Learned

- Separating data fetching from format rendering so filter logic lives in one SQL `WHERE` clause
- PostgreSQL `GENERATED ALWAYS AS (units * unit_price) STORED` computed columns — no trigger needed
- csv-stringify synchronous API for multi-section CSVs with mixed header and data rows
- ExcelJS: workbooks, worksheets, cell fills/fonts/number formats, frozen rows, auto column widths
- PDFKit's streaming model: collecting `data` events into chunks and resolving a Promise on `end`
- Drawing tables manually in PDFKit using `rect().fill()` and positioned `text()` calls
- Using `doc.switchToPage(i)` after `doc.end()` to retrofit headers/footers onto all pages
- Setting `Content-Type` and `Content-Disposition: attachment` headers for browser file downloads

### Resources Used

- [ExcelJS documentation](https://github.com/exceljs/exceljs)
- [PDFKit documentation](https://pdfkit.org/docs/getting_started.html)
- [csv-stringify documentation](https://csv.js.org/stringify/api/)
- [PostgreSQL generated columns](https://www.postgresql.org/docs/current/ddl-generated-columns.html)

### Tomorrow

Day 119 — Time-series data with PostgreSQL window functions: storing
sensor/metric readings and running complex analytics (moving averages,
lag comparisons, percentile bands) entirely in SQL window functions.


## Day 119 - June 18

**Project:** Time-Series Data with PostgreSQL Window Functions
**Time Spent:** 4.5 hours

### What I Built

Today I built a time-series analytics API over IoT sensor data from 10
Nigerian city sensors, running six different window-function analyses
entirely in PostgreSQL. The dataset is ~43,000 hourly readings generated
by a sinusoidal seeder (daily temperature peaks, AQI spikes, power load
patterns) across Lagos, Abuja, Kano, Port Harcourt, and Enugu, with
deliberate 4-hour outages planted in two sensors to exercise gap detection.

The six analytics modules each demonstrate a distinct window-function pattern:
moving averages (`AVG() OVER ROWS`), running totals (`SUM() OVER UNBOUNDED
PRECEDING`), period-over-period comparison (monthly CTE + `LAG()` + `RANK()`),
percentile bands (`PERCENT_RANK()` + `NTILE(4)`), daily OHLC (`FIRST_VALUE` /
`LAST_VALUE` with explicit `UNBOUNDED FOLLOWING` frame), and gap detection
(`LEAD()` to find intervals between consecutive readings). All six are
parameterised by the same filter set (sensorId, city, metricType, from, to,
limit) and the WHERE clause is pushed to the innermost query so window
functions run only over the filtered rows.

I also used a BRIN index on `recorded_at` instead of a B-tree — BRIN stores
only the min/max per block range, which is orders of magnitude smaller than
B-tree on a large append-only time-series table. The OHLC module taught me
that `LAST_VALUE` requires an explicit `ROWS BETWEEN UNBOUNDED PRECEDING AND
UNBOUNDED FOLLOWING` frame, because the default frame stops at the current row,
making `LAST_VALUE` behave identically to the current value.

### What I Learned

- `ROWS` vs `RANGE` frame semantics — ROWS counts physical rows, RANGE uses value equality
- `LAST_VALUE` requires an explicit unbounded following frame to work correctly
- Chaining window functions through CTEs for multi-step analytics (monthly agg → LAG)
- `NULLIF(denominator, 0)` as clean division-by-zero protection
- `PERCENT_RANK()` (continuous 0–1) vs `NTILE(n)` (discrete buckets)
- BRIN index mechanics — block-range min/max metadata, ideal for chronological inserts
- `LEAD()` for O(n) gap detection without a self-join
- Keeping window partitions correctly scoped (`PARTITION BY sensor_id`) so analytics don't bleed across sensors

### Resources Used

- [PostgreSQL Window Functions documentation](https://www.postgresql.org/docs/current/functions-window.html)
- [PostgreSQL Window Function Tutorial](https://www.postgresql.org/docs/current/tutorial-window.html)
- [BRIN Index documentation](https://www.postgresql.org/docs/current/brin-intro.html)
- [FIRST_VALUE / LAST_VALUE frame clause](https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS)

### Tomorrow

Day 120 — Sprint 4 Capstone & Review: a combined project that brings
together the key Sprint 4 themes (PostgreSQL, Redis, SQLite, data export,
FTS, window functions) into one cohesive CLI + API dashboard.

