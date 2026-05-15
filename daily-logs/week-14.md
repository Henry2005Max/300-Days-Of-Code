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

## Day 94 - May 13

**Project:** X Bot Poster with twitter-api-v2
**Time Spent:** 3 hours

### What I Built

Built an automated X (Twitter) bot that fetches live Nigerian forex rates, formats them into a structured tweet, and posts on a `node-cron` schedule. The bot is split across five clean modules: a forex fetcher with mock fallback, a tweet formatter that enforces the 280-character limit, a lazy Twitter client singleton, a poster that handles both real and dry-run modes, and a scheduler that wraps everything in a WAT-timezone-aware cron job.

The formatter builds a tweet with flag emojis, currency names, NGN rates, a timestamp, and hashtags. If the tweet exceeds 280 characters, hashtags are trimmed automatically before posting. The dry-run mode prints the complete formatted tweet and character count to the terminal without touching the Twitter API — making the entire project testable with zero credentials.

The forex fetcher calls the ExchangeRate API with NGN as base, inverts the rates to get units of foreign currency per Naira, and falls back to realistic hardcoded mock rates if no API key is set. The scheduler uses `node-cron` with `Africa/Lagos` timezone so the 08:00 WAT schedule remains correct regardless of the server's local timezone.

### What I Learned

- `twitter-api-v2` requires OAuth 1.0a with `readWrite` scope for posting — `client.v2.tweet()` alone throws a permissions error, must use `client.readWrite.v2.tweet()`
- The X API free tier is very restrictive — 1 tweet per 15 minutes and 17 per 24 hours — important to know before scheduling a high-frequency bot
- `node-cron` accepts a `timezone` string option that handles DST automatically — no need for manual UTC offset calculations
- Exchange rate APIs return rates relative to a base currency — when the base is NGN, the values need to be inverted (`1 / rate`) to get foreign currency per Naira
- Separating fetch, format, and post into independent functions makes dry-run mode a one-line `if` check in the poster
- Lazy client initialization means credentials are validated only when the client is first used — useful for dry-run mode which never needs them

### Resources Used

- [twitter-api-v2 documentation](https://github.com/PLhery/node-twitter-api-v2)
- [node-cron documentation](https://github.com/node-cron/node-cron)
- [ExchangeRate-API docs](https://www.exchangerate-api.com/docs/overview)
- [X API v2 tweet limits](https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets)

### Tomorrow

Day 95 — Email Sender Automation with Nodemailer. Automated email system that composes and sends templated emails (reports, alerts, digests) using Nodemailer with Gmail SMTP. Will cover HTML email templates, attachments, and scheduled delivery.

## Day 95 - May 14

**Project:** Email Sender Automation with Nodemailer
**Time Spent:** 3 hours

### What I Built

Built a full email automation system with three distinct email types — a daily sales report, a low stock alert, and a welcome email — all rendered as production-ready HTML and sent via Nodemailer with Gmail SMTP. Each template is built with a shared base layout that includes a green header, body section, and footer, with all styles inlined since external stylesheets are stripped by most email clients.

The sales report email includes a three-column stat card row (total revenue, orders, avg order value), a top products table, a category revenue breakdown with percentage share, and a top cities table. The stock alert email dynamically renders separate sections for out-of-stock and low-stock products with colour-coded status badges — red for out-of-stock, amber for low, green for sufficient. The welcome email features an account details card and a styled CTA button.

Dry-run mode writes each email as an `.html` file to the `./output/` directory so they can be opened in a browser for a pixel-accurate preview before any credentials are needed. The Nodemailer transporter is lazily initialized on first use and includes an SMTP connection verification step in live mode.

### What I Learned

- HTML emails require fully inline styles — `<style>` blocks and external CSS are stripped by Gmail, Outlook, and Apple Mail
- Nodemailer's `transporter.verify()` confirms the SMTP connection is valid before attempting to send — saves debugging time with wrong credentials
- Gmail SMTP requires an App Password when 2FA is enabled — the real account password will be rejected
- `port: 465` with `secure: true` uses implicit SSL; `port: 587` with `secure: false` uses STARTTLS — Gmail supports both
- Table-based layouts with explicit `width`, `cellpadding`, and `cellspacing` attributes are still the most reliable approach for email column layouts across all clients
- Including a plain-text `text` field alongside `html` in the Nodemailer options improves deliverability and passes corporate spam filters
- Writing HTML to disk in dry-run is a zero-dependency way to preview email output with full browser rendering before going live

### Resources Used

- [Nodemailer documentation](https://nodemailer.com/about/)
- [Gmail App Passwords guide](https://support.google.com/accounts/answer/185833)
- [HTML Email best practices — Campaign Monitor](https://www.campaignmonitor.com/css/)
- [Nodemailer SMTP transport](https://nodemailer.com/smtp/)

### Tomorrow

Day 96 — News Scraper with Cheerio. An ethical web scraper that pulls headlines, summaries, and links from Nigerian news sites, stores them in PostgreSQL, and outputs a formatted digest.


## Day 96 - May 15

**Project:** News Scraper with Cheerio and PostgreSQL
**Time Spent:** 3 hours

### What I Built

Built an ethical news scraper that targets four Nigerian news sources — Punch, Vanguard, TechCabal, and Nairametrics — using Cheerio for HTML parsing and PostgreSQL for article storage. Each scrape target is defined as a config object with CSS selectors for article containers, titles, summaries, and links, keeping the scraping logic completely generic and reusable across sites.

The scraper checks each site's `robots.txt` before making any requests and skips the entire domain if scraping is disallowed. A configurable delay between sites (default 2 seconds) keeps the request rate polite. Articles are inserted with `ON CONFLICT (url) DO NOTHING` so re-running the scraper never creates duplicates — the summary table shows exactly how many were new vs already stored per source.

The terminal digest groups articles by category (General News, Technology, Business & Finance), printing title, wrapped summary, source, timestamp in WAT, and URL for each article. A `DIGEST_ONLY=true` mode reads everything from the database without touching any external sites — useful for reviewing the last scrape without making new requests.

### What I Learned

- Cheerio's `$` function mirrors the jQuery API exactly — `.find()`, `.eq()`, `.text()`, `.attr()` all work identically to browser jQuery
- `ON CONFLICT (url) DO NOTHING` is cleaner than a SELECT-before-INSERT check for deduplication — one round trip instead of two
- `robots.txt` files can have multiple `User-agent` blocks — the parser needs to track which block it is currently inside and only collect `Disallow` rules for the matching agent
- Native Node.js `fetch` with `AbortSignal.timeout(ms)` handles timeouts cleanly without needing axios or node-fetch
- Relative `href` values like `/news/story` need base URL prepending — checking `href.startsWith('http')` vs `href.startsWith('/')` covers the two most common cases
- CSS selectors for article parsing differ substantially per site — isolating them in a `ScrapeTarget` config object makes adding new sources a one-line config change, not a code change

### Resources Used

- [Cheerio documentation](https://cheerio.js.org/)
- [robots.txt specification](https://www.robotstxt.org/robotstxt.html)
- [PostgreSQL ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT)
- [Node.js fetch AbortSignal](https://nodejs.org/api/globals.html#abortsignaltimeoutdelay)

### Tomorrow

Day 97 — Stock Fetcher with Alpha Vantage API. Fetches live stock and forex data, stores time-series price history in PostgreSQL, and outputs a formatted price report with percentage change calculations.
