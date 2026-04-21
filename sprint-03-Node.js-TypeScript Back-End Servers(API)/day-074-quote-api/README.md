# Day 74: Quote API

## Description

A self-contained Quote REST API backed entirely by SQLite. 60 quotes seeded across 5 categories: Nigerian proverbs, tech, motivation, philosophy, and leadership. Features FTS5 full-text search, cursor-based pagination on all list endpoints, per-quote view count tracking, and IP-keyed favourites.

## What is FTS5?

SQLite FTS5 (Full-Text Search version 5) builds an inverted index — like a book's index, mapping every word to the rows containing it. The `MATCH` operator searches this index directly instead of scanning every row with `LIKE '%term%'`.

```sql
-- Slow (full table scan):
SELECT * FROM quotes WHERE text LIKE '%wisdom%'

-- Fast (FTS index lookup):
SELECT * FROM quotes JOIN quotes_fts ON rowid = id WHERE quotes_fts MATCH 'wisdom'
```

Triggers keep the FTS index automatically in sync with the main table on every insert, update, and delete.

## Features

- 60 quotes seeded across 5 categories
- GET /quotes — paginated list with optional ?category= filter
- GET /quotes/random — random quote, optional ?category=
- GET /quotes/search?q= — FTS5 full-text search, paginated, results ranked by relevance
- GET /quotes/categories — all categories with quote counts
- GET /quotes/top — most viewed quotes
- GET /quotes/:id — single quote, view_count incremented on every fetch
- POST /quotes/:id/favourite — toggle favourite status (keyed by IP)
- GET /quotes/favourites/mine — paginated list of your favourited quotes
- Pagination meta on every list response: total, page, limit, pages, hasNext, hasPrev
- FTS5 virtual table with content='quotes' — no data duplication
- Triggers on INSERT, UPDATE, DELETE keep FTS index in sync automatically
- ORDER BY rank in FTS queries — results ordered by relevance score

## Technologies Used

- Node.js
- TypeScript
- Express 4
- better-sqlite3
- SQLite FTS5
- dotenv
- tsx

## Folder Structure

```
day-074-quote-api/
├── src/
│   ├── index.ts
│   ├── db/
│   │   └── database.ts     ← migrations, FTS5 table, triggers, 60-quote seed
│   ├── routes/
│   │   └── quotes.ts       ← all endpoints
│   ├── types/
│   │   └── index.ts
│   └── middleware/
│       └── logger.ts
├── data/                   ← quotes.db created here
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd Desktop
mkdir day-074-quote-api
cd day-074-quote-api
mkdir -p src/db src/routes src/types src/middleware
```

Copy all files, then:

```bash
npm install
npm run dev
```

## Testing Step by Step

1. `http://localhost:3000/quotes` — first 10 quotes with pagination meta
2. `http://localhost:3000/quotes?page=2` — next 10
3. `http://localhost:3000/quotes?category=nigerian-proverbs` — only proverbs
4. `http://localhost:3000/quotes/random` — different quote each time
5. `http://localhost:3000/quotes/random?category=tech` — random tech quote
6. `http://localhost:3000/quotes/search?q=wisdom` — FTS search
7. `http://localhost:3000/quotes/search?q=leader` — leadership results
8. `http://localhost:3000/quotes/search?q=Nietzsche` — search by author
9. `http://localhost:3000/quotes/categories` — all 5 categories with counts
10. `http://localhost:3000/quotes/1` — single quote, view_count increments
11. Hit /quotes/1 three more times — view_count increases
12. `http://localhost:3000/quotes/top` — quote 1 should rank high now
13. In Postman: POST `http://localhost:3000/quotes/3/favourite` → `"action": "added"`
14. POST same URL again → `"action": "removed"` (toggle)
15. `http://localhost:3000/quotes/favourites/mine` — your favourited quotes

## What I Learned

- SQLite FTS5 creates a virtual table with an inverted index — `CREATE VIRTUAL TABLE quotes_fts USING fts5(...)` — that makes full-text search dramatically faster than LIKE on large datasets
- A content table (`content='quotes'`) in FTS5 doesn't duplicate data — it stores only the index and references back to the main table by rowid. You must JOIN to get the full row data.
- Database triggers (`AFTER INSERT`, `AFTER UPDATE`, `AFTER DELETE`) automatically sync the FTS index whenever the main table changes — without triggers you'd have to manually update the index in every INSERT/UPDATE/DELETE operation in code
- Pagination requires two queries: one for the total count (to calculate pages) and one for the actual slice (with LIMIT and OFFSET). The offset is always (page - 1) × limit.
- ORDER BY rank in FTS5 queries sorts results by relevance — SQLite FTS5 calculates a relevance score based on how many times the term appears and in which columns
- The favourites toggle pattern uses a SELECT to check existence, then either INSERT or DELETE — this is clean and avoids INSERT OR REPLACE which would change the created_at timestamp on re-favouriting

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 74 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 21, 2025 |
| Previous | [Day 73 — Currency Service](../day-073-currency-service) |
| Next | [Day 75 — User Registration with bcrypt](../day-075-user-registration) |

Part of my 300 Days of Code Challenge!
