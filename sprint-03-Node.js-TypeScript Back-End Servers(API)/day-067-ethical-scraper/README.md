# Day 67: Ethical Web Scraper

## Description

A web scraping API built with Express, Axios, and Cheerio. Scrapes Hacker News front page stories and quotes from quotes.toscrape.com. Implements ethical scraping practices: robots.txt verification before every scrape, per-domain rate limiting with configurable delay, in-memory TTL caching to avoid redundant requests, and a descriptive User-Agent header.

## What is Cheerio?

Cheerio loads raw HTML and gives you a jQuery-like API to query it with CSS selectors — `$("h1").text()`, `$(".article a").attr("href")` etc. It has no browser, runs no JavaScript, and only works on static HTML. For JavaScript-rendered pages you'd need Puppeteer.

## Features

- GET /scraper/hackernews — scrapes top 30 Hacker News stories with title, URL, points, author, comments
- GET /scraper/quotes?page=N — scrapes quotes.toscrape.com with text, author, and tags, paginated
- GET /scraper/robots?url= — checks any URL against its domain's robots.txt
- GET /scraper/cache — view all cache entries and expiry times
- DELETE /scraper/cache — clear the cache manually
- robots.txt parser checks Disallow rules before any scrape
- Per-domain rate limiter with configurable delay (default 1000ms)
- In-memory TTL cache (default 5 minutes) — cache hit skips the HTTP request entirely
- ScrapeResult<T> response shape includes url, scrapedAt, fromCache flag, and data
- User-Agent header identifies the scraper to site owners

## Technologies Used

- Node.js
- TypeScript
- Express 4
- Axios (HTTP requests)
- Cheerio (HTML parsing)
- dotenv
- tsx

## Folder Structure

```
day-067-ethical-scraper/
├── src/
│   ├── index.ts
│   ├── types/
│   │   └── index.ts                ← HackerNewsItem, Quote, ScrapeResult
│   ├── services/
│   │   ├── fetcher.ts              ← rate limiter, robots.txt checker
│   │   ├── scrapers.ts             ← Cheerio-based page scrapers
│   │   └── cache.ts                ← in-memory TTL cache
│   ├── routes/
│   │   └── scraper.ts              ← API route handlers
│   └── middleware/
│       └── logger.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd Desktop
mkdir day-067-ethical-scraper
cd day-067-ethical-scraper
mkdir -p src/types src/services src/routes src/middleware
```

Copy all files, then:

```bash
npm install
npm run dev
```

## Testing Step by Step

All tests work directly in the browser — no Postman needed for GET requests:

1. `http://localhost:3000/` — API overview with ethics rules listed
2. `http://localhost:3000/scraper/hackernews` — fetches live HN stories (takes 1–2 seconds)
3. Hit the same URL again immediately — `fromCache: true`, returns instantly
4. `http://localhost:3000/scraper/quotes?page=1` — first page of quotes
5. `http://localhost:3000/scraper/quotes?page=2` — second page
6. `http://localhost:3000/scraper/cache` — see both cache entries with expiry times
7. `http://localhost:3000/scraper/robots?url=https://news.ycombinator.com` — check HN robots.txt
8. `http://localhost:3000/scraper/robots?url=https://facebook.com/private` — likely disallowed
9. In Postman: DELETE `http://localhost:3000/scraper/cache` — clears cache
10. GET /scraper/hackernews again — `fromCache: false`, re-fetches live

Watch the terminal — you'll see rate limiting delays and cache hit/miss logs.

## What I Learned

- Cheerio's `$` function works like jQuery — CSS selectors, `.text()`, `.attr()`, `.each()`, `.find()`, `.next()` all work the same way
- robots.txt must be fetched and parsed manually — there's no built-in browser enforcement in Node.js
- Rate limiting per domain is more meaningful than global rate limiting — one domain gets one slow drip of requests regardless of how many routes call it
- In-memory caching with a TTL is a simple but effective way to avoid redundant HTTP requests — just a Map with timestamps
- `fromCache: true` in the response tells the client whether they're seeing live or cached data — important for transparency
- Cheerio only parses static HTML — it can't execute JavaScript, so sites that render content client-side require Puppeteer or Playwright instead

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 67 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 14, 2025 |
| Previous | [Day 66 — Webhook Handler](../day-066-webhook-handler) |
| Next | [Day 68 — API Proxy](../day-068-api-proxy) |

Part of my 300 Days of Code Challenge!
