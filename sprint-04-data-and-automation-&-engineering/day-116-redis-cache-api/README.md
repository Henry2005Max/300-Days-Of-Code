# Day 116: Redis Caching Layer on an Express API

## Description

A product catalog API for a Nigerian online marketplace, built with
Express and SQLite, with a Redis caching layer sitting in front of every
read endpoint. The catalog queries include an artificial delay to mimic
an "expensive" database operation, so you can directly see and measure
the difference between a cache miss (slow) and a cache hit (fast).

## What's New

This is the first day to introduce Redis into the stack. New concepts:

- **Read-through caching middleware** — a single `cacheMiddleware(ttl)`
  wraps any GET route. On a miss it lets the handler run and stores the
  JSON response in Redis; on a hit it returns the cached response
  immediately, skipping the database entirely.
- **TTL-based expiration** — each route has its own TTL (60s for search,
  120s for lists, 300s for categories, 600s for product detail),
  reflecting how often that data realistically changes.
- **Pattern-based invalidation** — writes (`POST`/`PUT`/`DELETE` on
  products) use Redis `SCAN` + `DEL` to wipe out every cached response
  that could now be stale, across products, search results, and category
  listings.
- **Cache hit/miss/set logging** — every cache event is logged to the
  terminal with a timestamp and color coding, alongside a request logger
  showing method, path, status, and response time.
- **Persistent cache stats** — hit/miss/set counters are stored in Redis
  itself (`INCR`), exposed via `GET /api/cache/stats`, and survive server
  restarts.
- **Graceful degradation** — if Redis isn't running, the API detects this
  once at startup and skips the cache layer entirely instead of crashing,
  so it's still usable (just without caching).

## Features

- 🏷️ Product catalog with categories (Phones & Tablets, Fashion &
  Apparel, Electronics & Appliances, Groceries, Home & Living)
- ⚡ Redis read-through cache on all GET endpoints
- ⏱️ Per-route TTLs tuned to data volatility
- 🧹 Pattern-based cache invalidation on writes (`SCAN` + `DEL`)
- 📊 `X-Cache: HIT` / `X-Cache: MISS` response header on every cached route
- 📈 `/api/cache/stats` — hits, misses, sets, hit rate (persisted in Redis)
- 🗑️ `DELETE /api/cache` — manual full cache flush + stats reset
- 🔍 Product search across name and description
- 🛒 Full product CRUD with Zod validation
- 🎨 Color-coded cache and request logs with Chalk
- 🇳🇬 Realistic Nigerian product catalog (Tecno, Infinix, Ankara fabric,
  Golden Penny, Vono mattresses, etc.) seeded automatically

## Technologies Used

- **Node.js** + **TypeScript**
- **Express 4** — REST API framework
- **redis** (node-redis v4) — caching layer
- **better-sqlite3** — product/category storage
- **zod** — request validation
- **chalk** — colored terminal logging
- **dotenv** — environment configuration
- **tsx** — TypeScript dev runner

## Folder Structure

```
day-116-redis-cache-api/
├── .env
├── tsconfig.json
├── package.json
├── data/                         (SQLite database file lives here)
└── src/
    ├── index.ts                   # Express app entry point
    ├── seed.ts                    # Catalog seeder
    ├── types/
    │   └── index.ts               # Shared TypeScript interfaces
    ├── db/
    │   ├── connection.ts          # Lazy SQLite connection (singleton)
    │   └── schema.ts              # CREATE TABLE statements
    ├── cache/
    │   ├── redisClient.ts         # Lazy Redis connection w/ graceful fallback
    │   ├── cacheMiddleware.ts      # Read-through cache middleware
    │   ├── cacheStats.ts          # Hit/miss/set counters (Redis INCR)
    │   └── invalidate.ts          # SCAN + DEL pattern invalidation
    ├── models/
    │   ├── categoryModel.ts
    │   └── productModel.ts        # Includes simulated query delay
    ├── routes/
    │   ├── categoryRoutes.ts
    │   ├── productRoutes.ts
    │   └── cacheRoutes.ts
    └── utils/
        └── logger.ts              # Cache event + request logging
```

## Installation

```bash
cd ~/Desktop/300-Days-Of-Code/sprint-04-data/day-116-redis-cache-api
npm install
```

You'll also need Redis running locally. On macOS with Homebrew:

```bash
brew install redis
brew services start redis
```

If Redis isn't running, the API still starts and works - it just logs a
warning and serves every request without caching.

## How to Run

```bash
# Seed the catalog (run once)
npm run seed

# Development (auto-restarts on file changes)
npm run dev

# Production build
npm run build
npm start
```

The server listens on `http://localhost:4000` by default (set `PORT` in
`.env` to change it).

## Testing Step by Step

1. **Install dependencies and start Redis**

   ```bash
   npm install
   brew services start redis   # or: redis-server
   ```

2. **Seed the catalog**

   ```bash
   npm run seed
   ```

   This creates 5 categories and 25 products. Re-running it is safe -
   it skips seeding if data already exists.

3. **Start the server**

   ```bash
   npm run dev
   ```

   You should see `[redis] connected to redis://localhost:6379` in the
   terminal, followed by `Server running at http://localhost:4000`.

4. **List categories (first request - cache MISS)**

   ```bash
   curl -i http://localhost:4000/api/categories
   ```

   Check the response headers: `X-Cache: MISS`. In the terminal you'll
   see a yellow `[CACHE MISS]` line followed by a cyan `[CACHE SET]` line.

5. **Repeat the same request (cache HIT)**

   ```bash
   curl -i http://localhost:4000/api/categories
   ```

   Now `X-Cache: HIT`, and the terminal shows a green `[CACHE HIT]` line.
   Compare the response time in the request log - the hit should be
   noticeably faster than the miss.

6. **Test the simulated delay on products**

   ```bash
   time curl -s http://localhost:4000/api/products/1 > /dev/null
   time curl -s http://localhost:4000/api/products/1 > /dev/null
   ```

   The first call should take roughly 300ms (the simulated delay +
   SQLite query); the second should return almost instantly from cache.

7. **Browse a category's products**

   ```bash
   curl http://localhost:4000/api/categories/1/products
   ```

   Replace `1` with any category id from step 4. TTL for this route is
   120 seconds.

8. **Search products**

   ```bash
   curl "http://localhost:4000/api/products/search?q=fan"
   ```

   Try a few different search terms - each unique query string gets its
   own cache entry (TTL 60s).

9. **Check cache stats**

   ```bash
   curl http://localhost:4000/api/cache/stats
   ```

   You should see non-zero `hits`, `misses`, and `sets`, plus a computed
   `hitRate`.

10. **Create a product and watch invalidation**

    ```bash
    curl -X POST http://localhost:4000/api/products \
      -H "Content-Type: application/json" \
      -d '{"categoryId": 1, "name": "Tecno Spark 30", "description": "Mid-range Android phone", "price": 165000, "stock": 30}'
    ```

    In the terminal you'll see a magenta `[CACHE INVALIDATE]` line for
    `cache:GET:/api/products*` and `cache:GET:/api/categories*`.

11. **Re-fetch the product list - should be a MISS again**

    ```bash
    curl -i http://localhost:4000/api/products
    ```

    `X-Cache: MISS` confirms the old cached list was correctly thrown
    away after the write.

12. **Update and delete the product you created**

    ```bash
    curl -X PUT http://localhost:4000/api/products/26 \
      -H "Content-Type: application/json" \
      -d '{"price": 159000, "stock": 28}'

    curl -X DELETE http://localhost:4000/api/products/26
    ```

    (Replace `26` with the id returned in step 10.) Each write triggers
    the same invalidation pattern.

13. **Flush the entire cache manually**

    ```bash
    curl -X DELETE http://localhost:4000/api/cache
    ```

    Returns `{ "message": "Cache cleared", "keysDeleted": N }` and resets
    the stats counters back to zero.

14. **Stop Redis and confirm graceful fallback**

    ```bash
    brew services stop redis
    ```

    Restart the server (`npm run dev`). You'll see a yellow
    `[redis] unavailable ... running without cache.` warning, but every
    endpoint above should still work - just without `X-Cache` headers and
    with every request taking the full ~300ms.

## What I Learned

- Building a **read-through cache** as Express middleware: check Redis
  first, fall through to the handler on a miss, then intercept
  `res.json()` to populate the cache before the response is sent.
- Choosing **per-route TTLs** based on how often the underlying data
  changes - category lists rarely change (300s) vs. search results that
  benefit from shorter freshness windows (60s).
- Using **Redis `SCAN` with `MATCH`** to find and delete groups of keys
  by pattern (`cache:GET:/api/products*`) for invalidation, instead of
  `KEYS` which blocks the server on large keyspaces.
- Storing **cache statistics directly in Redis** with `INCR`, so hit/miss
  counts persist across server restarts instead of resetting with an
  in-memory counter.
- Designing for **graceful degradation**: attempting the Redis connection
  once at startup, and having every cache function check for a `null`
  client so the API keeps serving requests (just uncached) if Redis is
  down.
- Using an **artificial delay** in the data layer to make caching
  behavior observable during manual testing - without it, a fast SQLite
  query makes a cache hit and miss look identical.
- A **TypeScript + Zod quirk** under `strict: false`: a Zod schema with
  `.default()` fields can have its `safeParse().data` type inferred as
  fully optional, which doesn't match a strict input interface. The fix
  was to destructure and rebuild the object explicitly with `??` defaults
  rather than passing `parsed.data` straight through.

## Challenge Info

| Field | Value |
|-------|-------|
| Day | 116 |
| Sprint | 4 — Data Engineering & Databases |
| Date | June 13, 2025 |
| Previous | [Day 115 - Budget Tracker v2](../day-115-budget-tracker-v2) |
| Next | Day 117 — Full-text search with PostgreSQL tsvector |

Part of my 300 Days of Code Challenge!
