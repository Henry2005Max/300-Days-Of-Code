# Day 88: Advanced RSS Parser

## Description

An advanced RSS reader API that extends Day 78's foundation with feed discovery (find RSS URLs from any website), per-feed keyword filters (flag items matching a term), and a multi-feed digest endpoint that aggregates unread items across all subscriptions with optional keyword-only filtering. Built on SQLite with no external services required.

## What's New vs Day 78

Day 78 covered subscribing, caching, and read state. Day 88 adds three new concepts: **feed discovery** using Cheerio to parse `<link rel="alternate">` tags from website HTML; **keyword filters** that auto-match new items on every refresh and retroactively scan existing items when a filter is added; and the **digest endpoint** that queries across all feeds simultaneously, enriches each item with which keywords matched, and optionally refreshes stale caches before responding.

## Features

- Feed discovery: POST /discover with any website URL → returns RSS/Atom URLs found on that page
- Falls back to probing common paths (/feed, /rss, /atom.xml) if `<link>` tags are missing
- Subscribe, list, refresh, and unsubscribe from any RSS/Atom feed
- TTL-based cache (15 min default) — stale feeds auto-refresh on digest request
- Per-feed keyword filters: case-insensitive substring match on title + description
- Filters retroactively scan existing items when added
- filter_matches table: append-only record of which items matched which filter
- Digest: unread items across all feeds, enriched with matched_keywords list
- `?matched_only=true` narrows digest to items that hit at least one keyword
- `?refresh_stale=true` (default) refreshes stale feeds before building digest
- Read state, unread count, and mark-all-read — same as Day 78

## Technologies Used

- Node.js + TypeScript
- Express 4
- rss-parser 3
- Cheerio 1 (HTML parsing for feed discovery)
- Axios (HTTP for discovery + rss-parser)
- better-sqlite3
- Zod
- dotenv
- tsx (dev runner)

## Folder Structure

```
sprint-03-backend/day-088-rss-advanced/
├── src/
│   ├── db/
│   │   ├── database.ts         # Migrations (feeds, items, read_states, filters, matches)
│   │   └── statements.ts       # Lazy prepared statements
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   └── validate.ts
│   ├── routes/
│   │   └── feeds.ts
│   ├── schemas/
│   │   └── feed.schema.ts
│   ├── services/
│   │   ├── discovery.ts        # Feed URL discovery via HTML parsing + path probing
│   │   ├── feed.service.ts     # Subscribe, refresh, keyword matching, digest
│   │   └── parser.ts           # rss-parser wrapper + HTML stripping
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
mkdir day-088-rss-advanced
cd day-088-rss-advanced
mkdir -p src/routes src/middleware src/db src/types src/services src/schemas
```

Copy all files, then:

```bash
npm install
```

## How to Run

```bash
npm run dev
```

## Testing Step by Step

### Step 1: Discover RSS feeds on a website

```bash
curl -X POST http://localhost:3000/discover \
  -H "Content-Type: application/json" \
  -d '{"url":"https://techcabal.com"}'
```

Expected — an array of discovered feed URLs. Use one of them in step 2.

### Step 2: Discover feeds on Vanguard Nigeria

```bash
curl -X POST http://localhost:3000/discover \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.vanguardngr.com"}'
```

### Step 3: Subscribe to a feed

```bash
curl -X POST http://localhost:3000/feeds \
  -H "Content-Type: application/json" \
  -d '{"url":"https://techcabal.com/feed/"}'
```

### Step 4: Subscribe to a second feed

```bash
curl -X POST http://localhost:3000/feeds \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.vanguardngr.com/feed/"}'
```

### Step 5: List all subscriptions

```bash
curl http://localhost:3000/feeds
```

### Step 6: Browse items from feed 1

```bash
curl http://localhost:3000/feeds/1/items
```

### Step 7: Add a keyword filter to feed 1

```bash
curl -X POST http://localhost:3000/feeds/1/filters \
  -H "Content-Type: application/json" \
  -d '{"keyword":"startup"}'
```

```bash
curl -X POST http://localhost:3000/feeds/1/filters \
  -H "Content-Type: application/json" \
  -d '{"keyword":"funding"}'
```

### Step 8: Add a filter to feed 2

```bash
curl -X POST http://localhost:3000/feeds/2/filters \
  -H "Content-Type: application/json" \
  -d '{"keyword":"naira"}'
```

### Step 9: Get the multi-feed digest

```bash
curl "http://localhost:3000/digest?subscriber=chidi@example.ng"
```

Each item includes `matched_keywords` — the keywords that matched this item's title/description.

### Step 10: Digest — keyword matches only

```bash
curl "http://localhost:3000/digest?subscriber=chidi@example.ng&matched_only=true"
```

Only items that matched at least one keyword filter are returned.

### Step 11: Mark an item as read

```bash
curl -X POST http://localhost:3000/feeds/1/items/1/read \
  -H "Content-Type: application/json" \
  -d '{"subscriber":"chidi@example.ng"}'
```

### Step 12: Get unread count

```bash
curl "http://localhost:3000/feeds/1/unread?subscriber=chidi@example.ng"
```

### Step 13: Mark all read and check digest again

```bash
curl -X POST http://localhost:3000/feeds/1/read-all \
  -H "Content-Type: application/json" \
  -d '{"subscriber":"chidi@example.ng"}'

curl "http://localhost:3000/digest?subscriber=chidi@example.ng&refresh_stale=false"
```

Feed 1 items should no longer appear in the digest.

### Step 14: Force refresh a feed

```bash
curl -X POST http://localhost:3000/feeds/1/refresh
```

### Step 15: Remove a keyword filter

```bash
curl -X DELETE http://localhost:3000/feeds/1/filters/1
```

## What I Learned

- Feed discovery via `<link rel="alternate">` is far more reliable than regex — Cheerio parses the HTML DOM so attribute order and whitespace don't matter
- Probing common paths (`/feed`, `/rss.xml`) as a fallback with `axios.head()` is lightweight — HEAD requests don't download the body, just the headers, making them fast for existence checks
- Retroactively applying a new keyword filter to existing items (scan all items in the feed on filter creation) is the right UX — otherwise you miss relevant content that arrived before the filter was added
- The `filter_matches` table being append-only (INSERT OR IGNORE) means you can re-run the matching logic safely without duplicating rows — idempotent matching
- The digest query using a LEFT JOIN on `read_states` with `WHERE rs.item_id IS NULL` is the same pattern as Day 78, but now runs across all feeds simultaneously — it's a single SQL query, not N queries per feed
- `Promise.allSettled` for concurrent feed refreshes in the digest means one failing feed doesn't block the others from refreshing

## Challenge Info

| Field    | Value |
|----------|-------|
| Day      | 88 |
| Sprint   | 3 — Node.js Back-End Servers |
| Date     | May 05, 2026 |
| Previous | [Day 87 — Advanced Notification Service](../day-087-notifications/) |
| Next     | [Day 89 — Map API (Google Maps JS)](../day-089-map-api/) |

Part of my 300 Days of Code Challenge!
