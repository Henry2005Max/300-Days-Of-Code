# Day 84: Quote API

## Description

A REST API serving 30 Nigerian, Pan-African, and world quotes with FTS5 full-text search, tag filtering, per-user favourites, view count tracking, a deterministic quote-of-the-day, and a stats endpoint. Built entirely on SQLite — no external services required.

## What's New

Day 84 advances beyond Day 74's FTS5 foundation with a richer feature set: a many-to-many tags system (quotes ↔ tags through a junction table), per-user favourites without authentication, a view count that increments on every GET, a quote-of-the-day derived from day-of-year arithmetic (stable all day, no cron needed), and a stats endpoint showing category breakdowns and top-viewed quotes.

## Features

- 30 seeded quotes — Nigerian proverbs, Achebe, Soyinka, Mandela, Nkrumah, Ubuntu philosophy
- FTS5 full-text search across quote text and author — relevance-ranked results
- Tag filtering — many-to-many; each quote can have up to 10 tags
- Quote of the day — deterministic, changes at midnight with no cron or extra table
- Random quote endpoint
- View count incremented on every GET /quotes/:id — drives popularity sorting
- Per-user favourites: save and unsave, paginated favourites list
- POST /quotes to add new quotes with inline tags
- Stats: top 5 most-viewed, category breakdown, origin breakdown
- Lazy prepared statements — no "no such table" crash on startup

## Technologies Used

- Node.js + TypeScript
- Express 4
- better-sqlite3 (with FTS5)
- Zod
- dotenv
- tsx (dev runner)

## Folder Structure

```
sprint-03-backend/day-084-quote-api/
├── src/
│   ├── db/
│   │   ├── database.ts       # Migrations, FTS5 triggers, seed data
│   │   └── statements.ts     # Lazy prepared statements
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   └── validate.ts
│   ├── routes/
│   │   └── quotes.ts
│   ├── schemas/
│   │   └── quote.schema.ts
│   ├── services/
│   │   └── quote.service.ts
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
mkdir day-084-quote-api
cd day-084-quote-api
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

30 quotes and their tags are seeded automatically on first run.

## Testing Step by Step

### Step 1: Confirm the server is running

```bash
curl http://localhost:3000/health
```

### Step 2: Get all quotes (paginated)

```bash
curl http://localhost:3000/quotes
```

### Step 3: Get quote of the day

```bash
curl http://localhost:3000/quotes/today
```

Call this again — same quote, different day it will change.

### Step 4: Get a random quote

```bash
curl http://localhost:3000/quotes/random
```

### Step 5: FTS5 full-text search

```bash
curl "http://localhost:3000/quotes/search?q=wisdom"
curl "http://localhost:3000/quotes/search?q=education"
curl "http://localhost:3000/quotes/search?q=Mandela"
curl "http://localhost:3000/quotes/search?q=hunter"
```

Results are ranked by relevance — most matching quotes appear first.

### Step 6: Get a single quote (increments view count)

```bash
curl http://localhost:3000/quotes/1
curl http://localhost:3000/quotes/1
curl http://localhost:3000/quotes/1
```

Call it three times then check `/stats` — view_count for quote 1 should be 3.

### Step 7: Filter by category

```bash
curl "http://localhost:3000/quotes?category=wisdom"
curl "http://localhost:3000/quotes?category=resilience"
curl "http://localhost:3000/quotes?category=leadership"
```

### Step 8: Filter by origin

```bash
curl "http://localhost:3000/quotes?origin=Nigeria"
curl "http://localhost:3000/quotes?origin=Pan-African"
```

### Step 9: Browse all tags

```bash
curl http://localhost:3000/tags
```

### Step 10: Get quotes by tag

```bash
curl http://localhost:3000/quotes/tag/proverb
curl http://localhost:3000/quotes/tag/ubuntu
curl http://localhost:3000/quotes/tag/resilience
```

### Step 11: Add a quote to favourites

```bash
curl -X POST http://localhost:3000/quotes/1/favourite \
  -H "Content-Type: application/json" \
  -d '{"username":"chidi_lagos"}'

curl -X POST http://localhost:3000/quotes/7/favourite \
  -H "Content-Type: application/json" \
  -d '{"username":"chidi_lagos"}'
```

### Step 12: View favourites

```bash
curl http://localhost:3000/favourites/chidi_lagos
```

### Step 13: Remove from favourites

```bash
curl -X DELETE http://localhost:3000/quotes/1/favourite \
  -H "Content-Type: application/json" \
  -d '{"username":"chidi_lagos"}'
```

### Step 14: Create a new quote

```bash
curl -X POST http://localhost:3000/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The same boiling water that softens a potato will harden an egg. It is all about what you are made of.",
    "author": "African Proverb",
    "origin": "Pan-African",
    "category": "resilience",
    "tags": ["proverb", "resilience", "character"]
  }'
```

### Step 15: Search for the new quote

```bash
curl "http://localhost:3000/quotes/search?q=potato"
```

### Step 16: View stats

```bash
curl http://localhost:3000/stats
```

Expected: top 5 most-viewed quotes, count per category, count per origin.

### Step 17: Test duplicate favourite error

```bash
curl -X POST http://localhost:3000/quotes/7/favourite \
  -H "Content-Type: application/json" \
  -d '{"username":"chidi_lagos"}'
```

Expected 409: `"Quote is already in your favourites"`

## What I Learned

- FTS5 content tables (`content=quotes`) store only the index, not the text — you must create sync triggers manually because SQLite does not auto-sync content FTS tables the way it does with regular FTS4
- FTS5's `rank` column is a negative float — more negative means more relevant. `ORDER BY rank ASC` (not DESC) gives best results first, which is counterintuitive but correct
- User input to FTS5 MATCH queries must be sanitised — special characters like `"`, `*`, and `:` have syntactic meaning and will throw an error if passed through raw. Wrapping in double quotes and removing special chars is the safest approach
- The N+1 tag enrichment (one `getTagsFor` call per quote) is acceptable for small result sets but would become a bottleneck at scale — the correct fix is a GROUP_CONCAT subquery or a single JOIN with post-processing
- Day-of-year arithmetic (`floor((now - jan1) / 86400000) % totalQuotes`) gives a stable, cron-free quote-of-the-day with no extra table — the modulo ensures it wraps around if you have fewer quotes than days in the year
- `ConflictError` (HTTP 409) is the correct status for duplicate favourites — 400 is for malformed requests, 409 is for valid requests that conflict with existing state

## Challenge Info

| Field    | Value |
|----------|-------|
| Day      | 84 |
| Sprint   | 3 — Node.js Back-End Servers |
| Date     | May 01, 2026 |
| Previous | [Day 83 — Currency Service](../day-083-currency-service/) |
| Next     | [Day 85 — User Registration with bcrypt](../day-085-user-registration/) |

Part of my 300 Days of Code Challenge!
