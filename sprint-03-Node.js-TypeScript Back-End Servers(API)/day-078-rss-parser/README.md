# Day 78: RSS Parser

## Description

A REST API for subscribing to RSS feeds, reading their items, and tracking read state per subscriber. Feed content is fetched live on first request and cached in SQLite for a configurable TTL (default 15 minutes). Subsequent requests within the TTL window are served entirely from the local database — no external HTTP call made. Supports Nigerian news feeds out of the box.

## What's New

Day 78 introduces `rss-parser`  the first time in Sprint 3 we consume a structured external data format (RSS/Atom XML) rather than scraping raw HTML (Day 67) or proxying JSON APIs (Day 68). New concepts: feed subscriptions as a first-class resource, TTL-based cache invalidation with a fallback-to-stale strategy, upsert via `INSERT OR IGNORE` on a composite unique key, and per-subscriber read state modelled as a junction table.

## Features

- Subscribe to any RSS or Atom feed URL; title and description are populated from the live feed on subscribe
- Items cached in SQLite with a configurable TTL — first request fetches live, subsequent requests are instant
- Force-refresh endpoint to bypass the TTL and re-fetch immediately
- List items with optional `subscriber` query param to attach `is_read` flag per item
- Filter to only unread items with `?unread=true`
- Mark a single item read, or mark all items in a feed read in one request
- Unread count endpoint per feed per subscriber
- Unsubscribe (DELETE) cascades to all stored items and read states
- Full Zod validation, asyncHandler, AppError hierarchy, colour-coded logger

## Technologies Used

- Node.js + TypeScript
- Express 4
- rss-parser 3
- better-sqlite3
- Zod
- dotenv
- tsx (dev runner)

## Folder Structure

```
sprint-03-backend/day-078-rss-parser/
├── src/
│   ├── db/
│   │   └── database.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   └── validate.ts
│   ├── routes/
│   │   └── feeds.ts
│   ├── schemas/
│   │   └── feed.schema.ts
│   ├── services/
│   │   ├── feed.service.ts
│   │   └── parser.ts
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
mkdir day-078-rss-parser
cd day-078-rss-parser
mkdir -p src/routes src/middleware src/db src/types src/services src/schemas
```

Copy all files into the structure above, then:

```bash
npm install
```

## How to Run

```bash
npm run dev
```

## Testing Step by Step

### Step 1: Confirm the server is running

```bash
curl http://localhost:3000/health
```

Expected:

```json
{ "success": true, "data": { "status": "ok", "service": "rss-parser" } }
```

### Step 2: Subscribe to a Nigerian news RSS feed

```bash
curl -X POST http://localhost:3000/feeds \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.vanguardngr.com/feed/"}'
```

Expected (title populated from live fetch):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "url": "https://www.vanguardngr.com/feed/",
    "title": "Vanguard News",
    "item_count": 20,
    ...
  }
}
```

### Step 3: Subscribe to a second feed

```bash
curl -X POST http://localhost:3000/feeds \
  -H "Content-Type: application/json" \
  -d '{"url":"https://techcabal.com/feed/"}'
```

### Step 4: List all subscribed feeds

```bash
curl http://localhost:3000/feeds
```

### Step 5: List items from feed 1

```bash
curl http://localhost:3000/feeds/1/items
```

This returns items from the SQLite cache. A second call within 15 minutes will be near-instant.

### Step 6: List items with read status for a subscriber

```bash
curl "http://localhost:3000/feeds/1/items?subscriber=chidi@example.ng"
```

Each item now includes `"is_read": 0` or `"is_read": 1`.

### Step 7: Mark an item as read

```bash
curl -X POST http://localhost:3000/feeds/1/items/1/read \
  -H "Content-Type: application/json" \
  -d '{"subscriber":"chidi@example.ng"}'
```

### Step 8: Filter to only unread items

```bash
curl "http://localhost:3000/feeds/1/items?subscriber=chidi@example.ng&unread=true"
```

### Step 9: Get unread count

```bash
curl "http://localhost:3000/feeds/1/unread?subscriber=chidi@example.ng"
```

Expected:

```json
{ "success": true, "data": { "unread": 19 } }
```

### Step 10: Mark all items read

```bash
curl -X POST http://localhost:3000/feeds/1/read-all \
  -H "Content-Type: application/json" \
  -d '{"subscriber":"chidi@example.ng"}'
```

Expected:

```json
{ "success": true, "data": { "marked": 19 } }
```

### Step 11: Force a cache refresh

```bash
curl -X POST http://localhost:3000/feeds/1/refresh
```

This bypasses the TTL and fetches the live feed immediately.

### Step 12: Test duplicate subscription error

```bash
curl -X POST http://localhost:3000/feeds \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.vanguardngr.com/feed/"}'
```

Expected 400: `"Already subscribed to this feed (id: 1)"`

### Step 13: Test invalid URL validation

```bash
curl -X POST http://localhost:3000/feeds \
  -H "Content-Type: application/json" \
  -d '{"url":"not-a-url"}'
```

Expected 400 with field errors.

### Step 14: Unsubscribe from a feed

```bash
curl -X DELETE http://localhost:3000/feeds/2
```

## What I Learned

- `rss-parser` combines HTTP fetch and XML parsing into a single `parseURL(url)` call — under the hood it uses `axios` for the request and `xml2js` to convert XML into a JavaScript object, so we never touch raw XML
- RSS items use a `guid` field as a unique identifier (usually the article URL). Using `(feed_id, guid)` as a composite unique key with `INSERT OR IGNORE` means we can safely re-run upserts on every cache refresh without creating duplicate rows
- Wrapping bulk inserts in a `db.transaction()` block is critical for performance — each SQLite `INSERT` without a transaction opens and commits its own implicit transaction, making 50 inserts ~50x slower than the same inserts inside one explicit transaction
- The "insert stale row, update after" pattern from Day 77's notification service appears again here: we store a `last_fetched_at` timestamp and only re-fetch when it is older than the TTL, rather than fetching on every request
- A `LEFT JOIN` on `read_states` with a `CASE WHEN` expression is the cleanest way to attach a boolean flag to rows from another table without requiring a separate query per item
- Returning stale cache data when a refresh fails (the `catch` in `refreshFeed`) is the right tradeoff for a read API — a stale news feed is better than a 500 error

## Challenge Info

| Field    | Value |
|----------|-------|
| Day      | 78 |
| Sprint   | 3 — Node.js Back-End Servers |
| Date     | April 25, 2026 |
| Previous | [Day 77 — Notification Service](../day-077-notification-service/) |
| Next     | [Day 79 — Map API Integration](../day-079-map-api/) |

Part of my 300 Days of Code Challenge!
