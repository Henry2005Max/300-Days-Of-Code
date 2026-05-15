# Day 96: News Scraper with Cheerio and PostgreSQL

An ethical web scraper that pulls headlines, summaries, and links from four Nigerian news sources using Cheerio, stores articles in PostgreSQL with URL-based deduplication, and prints a categorised digest to the terminal. Includes `robots.txt` checking, configurable request delay, and a digest-only mode that reads from the database without re-scraping.

## What's New

First scraping project in the challenge. Introduces Cheerio for server-side HTML parsing, `robots.txt` checking before every scrape, URL deduplication via `ON CONFLICT DO NOTHING`, and a clean category-grouped digest output. Uses the native Node.js `fetch` API (no axios) for HTTP requests.

## Features

- Scrapes four Nigerian news sources: Punch, Vanguard, TechCabal, Nairametrics
- Checks `robots.txt` before scraping each site — skips disallowed sources
- Configurable request delay between sites (default 2s) to avoid overloading servers
- URL-based deduplication — re-running never creates duplicate records
- Stores title, summary, URL, source, category, and timestamp per article
- Categorised digest output grouped by: General News, Technology, Business & Finance
- `DIGEST_ONLY=true` mode reads from the database without hitting any external sites
- Scrape summary table showing fetched / inserted / skipped / error counts per source
- Idempotent migrations — safe to run on every boot

## Technologies Used

- Node.js + TypeScript
- `cheerio` — server-side HTML parsing (jQuery-like API)
- `pg` — PostgreSQL connection pool
- Native `fetch` — HTTP requests (Node.js 18+)
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-096-news-scraper/
├── src/
│   ├── db/
│   │   ├── migrations.ts     # CREATE TABLE articles, indexes
│   │   ├── pool.ts           # Lazy pg.Pool singleton
│   │   └── repository.ts     # insertArticle, getDigestSections, getTotalCount
│   ├── display/
│   │   └── printer.ts        # Scrape summary table and digest formatter
│   ├── scraper/
│   │   ├── robots.ts         # robots.txt fetcher, isAllowed checker, sleep helper
│   │   ├── scraper.ts        # Core Cheerio scraper per target
│   │   └── targets.ts        # Scrape target definitions (selectors per site)
│   ├── types/
│   │   └── index.ts          # Interfaces
│   └── index.ts              # Entry point
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-096-news-scraper
npm install
```

## How to Run

```bash
# Scrape all sources, store in DB, print digest
npm run scrape

# Print digest from existing DB records without re-scraping
npm run digest
```

## Testing Step by Step

1. **Create the PostgreSQL database:**
   ```bash
   createdb news_scraper
   ```

2. **Update `.env`:**
   ```
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/news_scraper
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the scraper:**
   ```bash
   npm run scrape
   ```

5. **Watch the terminal** — you will see:
   - `robots.txt` check per site
   - Each article title as it is fetched (`[+]` for new, `[=]` for duplicate)
   - A scrape summary table at the end
   - The full categorised news digest

6. **Run again immediately** — all articles will show as `[=] Duplicate` since URL deduplication prevents re-insertion. The digest will still print from the database.

7. **Test digest-only mode** — reads from DB, makes no HTTP requests:
   ```bash
   npm run digest
   ```

8. **Adjust delay** in `.env` — increase `REQUEST_DELAY_MS` to be more polite:
   ```
   REQUEST_DELAY_MS=3000
   ```

9. **Verify data in PostgreSQL:**
   ```bash
   psql -U postgres -d news_scraper -c "SELECT source, COUNT(*) FROM articles GROUP BY source;"
   ```

10. **Check robots.txt behaviour** — if a site disallows scraping in its `robots.txt`, the scraper will print a skip message and move on without making any further requests to that domain.

## What I Learned

- Cheerio loads HTML with `cheerio.load(html)` and returns a `$` function with identical jQuery selector syntax — `$('article h2 a').text()` works exactly as expected
- `ON CONFLICT (url) DO NOTHING` handles deduplication at the database level — no need for a SELECT-before-INSERT check
- `robots.txt` parsing needs to handle multiple `User-agent` blocks — the relevant block is the one matching `*` or your bot's name
- Native `fetch` in Node.js 18+ includes `AbortSignal.timeout(ms)` for clean request timeouts without external libraries
- Relative URLs in `href` attributes (`/news/story`) need resolving against the base URL before storing — `href.startsWith('/')` check handles this
- CSS selectors vary significantly between sites — selector definitions belong in a separate config object, not hardcoded in the scraping logic
- Cheerio's `.eq(i)` returns a single element from a selection by index — useful for iterating a NodeList without converting to an array

## Challenge Info

| Field    | Detail                                    |
|----------|-------------------------------------------|
| Day      | 96                                        |
| Sprint   | 4 — Data Engineering & Databases          |
| Date     | 2025-01-10                                |
| Previous | [Day 95](../day-095-email-automation)     |
| Next     | [Day 97](../day-097-stock-fetcher)        |

Part of my 300 Days of Code Challenge!
