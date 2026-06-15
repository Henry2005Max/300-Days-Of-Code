# Day 117: Full-Text Search with PostgreSQL tsvector

## Description

A full-text search API over a Nigerian tech/business article catalog, built
entirely on PostgreSQL's native FTS capabilities — no Elasticsearch, no
external search engine. Articles are stored with a `tsvector` column that
is automatically maintained by a database trigger, indexed with a GIN index,
and queried using `plainto_tsquery` / `phraseto_tsquery` / `websearch_to_tsquery`
depending on the query shape. Results are ranked by `ts_rank_cd` (cover density)
and include a `ts_headline` snippet with matched terms highlighted.

## What's New

New PostgreSQL concepts introduced today:

- **`tsvector`** — a pre-computed, sorted list of stemmed lexemes stored as a
  column, populated automatically by a `BEFORE INSERT OR UPDATE` trigger so it
  is always in sync with the source text.
- **Weighted fields** — title (weight A), body (weight B), author and tags (weight C)
  are combined into a single `tsvector` via `setweight()`, so title matches rank
  higher than body matches.
- **GIN index** — `CREATE INDEX ... USING GIN (search_vector)` makes `@@` operator
  queries fast at any scale, replacing expensive `LIKE '%term%'` scans.
- **`ts_rank_cd`** — cover density ranking rewards documents where matched terms
  appear close together, not just frequently.
- **`ts_headline`** — generates a highlighted excerpt from the body text with
  matched terms wrapped in `<b>` tags.
- **`ts_stat`** — inspects the lexeme distribution across the entire corpus,
  used here for autocomplete suggestions and corpus statistics.
- **Three tsquery modes** — `plainto_tsquery` (AND all words), `phraseto_tsquery`
  (quoted phrase, words must appear in order), `websearch_to_tsquery` (AND/OR/NOT/-).
- **Debug endpoints** — inspect the raw stored `tsvector` for any article,
  see how PostgreSQL parses a query to `tsquery`, or browse the most common
  lexemes across all articles.

## Features

- 📰 15 articles across Technology, Fintech, Business, Agriculture, Legal & Regulation
- 🔍 Full-text search with relevance ranking via `ts_rank_cd`
- 🏷️ Filter by category or author alongside FTS
- ✨ `ts_headline` snippets with `<b>` highlighted match terms
- 💬 Phrase search (`"agent banking"`) and boolean operators (`fintech & Lagos`)
- 🔤 Autocomplete suggestions via `ts_stat` lexeme frequency
- 📊 Corpus statistics — top N lexemes by document frequency
- 🔬 Debug endpoints: raw tsvector, tsquery explanation, corpus stats
- 🇳🇬 Nigerian authors, cities, and subject matter throughout

## Technologies Used

- **Node.js** + **TypeScript**
- **Express 4** — REST API
- **pg** (node-postgres) — PostgreSQL driver
- **zod** — query parameter validation
- **chalk** — colored request logs
- **dotenv** — environment configuration
- **tsx** — TypeScript dev runner

## Folder Structure

```
day-117-pg-fts/
├── .env
├── tsconfig.json
├── package.json
└── src/
    ├── index.ts                  # Express app, runs migrations at startup
    ├── types/
    │   └── index.ts              # Shared interfaces
    ├── db/
    │   ├── pool.ts               # Lazy pg connection pool (singleton)
    │   └── migrations.ts         # CREATE TABLE, GIN index, trigger
    ├── search/
    │   ├── engine.ts             # searchArticles, suggestTerms, helpers
    │   └── debug.ts              # inspectVector, explainQuery, corpusStats
    ├── routes/
    │   ├── searchRoutes.ts       # GET /api/search and sub-routes
    │   └── debugRoutes.ts        # GET /api/debug/*
    ├── utils/
    │   └── logger.ts             # Request logger
    └── seed/
        └── index.ts              # 15-article Nigerian corpus seeder
```

## Installation

```bash
cd ~/Desktop/300-Days-Of-Code/sprint-04-data/day-117-pg-fts
npm install
```

You'll need PostgreSQL running locally. Create the database first:

```bash
psql -U postgres -c "CREATE DATABASE fts_catalog;"
```

Update `DATABASE_URL` in `.env` if your Postgres credentials differ from
the defaults (`postgres:postgres@localhost:5432`).

## How to Run

```bash
# Seed the article corpus (run once)
npm run seed

# Development (auto-restarts on file changes)
npm run dev

# Production build
npm run build && npm start
```

The server runs on `http://localhost:4001`.

## Testing Step by Step

1. **Create the database and install dependencies**

   ```bash
   psql -U postgres -c "CREATE DATABASE fts_catalog;"
   npm install
   ```

2. **Seed the corpus**

   ```bash
   npm run seed
   ```

   Expect: `Seeded 15 articles across 5 categories.`

3. **Start the server**

   ```bash
   npm run dev
   ```

   Expect: `[db] Migrations complete.` then `Server running at http://localhost:4001`.

4. **Basic full-text search**

   ```bash
   curl "http://localhost:4001/api/search?q=fintech+Lagos"
   ```

   Returns ranked results. Articles mentioning both "fintech" and "Lagos"
   should appear first. Each result includes a `rank` score and a
   `headline` excerpt with `<b>` tags around matched terms.

5. **Phrase search — words must appear in order**

   ```bash
   curl "http://localhost:4001/api/search?q=%22agent+banking%22"
   ```

   (URL-encoded double quotes.) Only articles containing the exact phrase
   "agent banking" are returned. Compare with `q=agent+banking` (no
   quotes) which matches articles containing both words anywhere.

6. **Filter by category**

   ```bash
   curl "http://localhost:4001/api/search?q=database&category=Technology"
   ```

   Narrows FTS results to the Technology category only.

7. **Filter by author**

   ```bash
   curl "http://localhost:4001/api/search?q=mobile&author=Henry"
   ```

   Author filter uses `ILIKE %Henry%` alongside the FTS query.

8. **Pagination**

   ```bash
   curl "http://localhost:4001/api/search?q=Nigeria&limit=3&offset=0"
   curl "http://localhost:4001/api/search?q=Nigeria&limit=3&offset=3"
   ```

   `total` in the response shows how many documents match; `offset` pages
   through them.

9. **List categories and authors**

   ```bash
   curl http://localhost:4001/api/search/categories
   curl http://localhost:4001/api/search/authors
   ```

10. **Autocomplete suggestions**

    ```bash
    curl "http://localhost:4001/api/search/suggest?prefix=postg"
    curl "http://localhost:4001/api/search/suggest?prefix=lag"
    ```

    Returns lexemes from the corpus that start with the given prefix,
    ranked by how many articles they appear in (`ndoc`). The stems are
    normalised by PostgreSQL (e.g. `lagos` → `lago`).

11. **Fetch a single article**

    ```bash
    curl http://localhost:4001/api/search/articles/1
    ```

12. **Debug: inspect a stored tsvector**

    ```bash
    curl http://localhost:4001/api/debug/vector/1
    ```

    Returns the raw `tsvector` for article 1 — a list of lexemes like
    `'agent':5A 'ai':2B 'banking':6A` showing each stemmed word, its
    positions, and its weight (`A` = title, `B` = body, `C` = tags/author).

13. **Debug: see how PostgreSQL parses a query**

    ```bash
    curl "http://localhost:4001/api/debug/explain?q=fintech+Lagos+startups"
    ```

    Returns the `tsquery` string: `'fintech' & 'lago' & 'startup'`,
    showing which words are kept and how they are stemmed.

14. **Debug: corpus statistics**

    ```bash
    curl "http://localhost:4001/api/debug/corpus?n=15"
    ```

    Returns the 15 most frequent lexemes across all articles with their
    `ndoc` (document count) and `nentry` (total occurrence count).

15. **Verify weighting — title matches rank higher than body matches**

    Search for a term that appears in one article's title and a different
    article's body only. The article with the title match should have a
    higher `rank` value in the results.

## What I Learned

- How PostgreSQL FTS works end to end: `to_tsvector` converts text to
  lexemes, `to_tsquery` / `plainto_tsquery` / `phraseto_tsquery` converts
  a search query, and `@@` checks if a document matches.
- Using `setweight()` to combine multiple fields into one `tsvector` with
  different priorities — title matches (`A`) beat body matches (`B`) in
  `ts_rank` scoring.
- A `BEFORE INSERT OR UPDATE` trigger auto-maintaining the `search_vector`
  column so the index is always current with zero application code.
- Why GIN (Generalized Inverted Index) beats GIST for FTS: GIN is faster
  at lookups because each lexeme directly maps to the posting list of
  document IDs that contain it, at the cost of slower updates.
- `ts_rank_cd` (cover density) rewards term proximity — a document with
  "Lagos fintech startups" adjacent scores higher than one with the same
  words scattered across three paragraphs.
- `ts_headline` generates highlighted snippets entirely inside PostgreSQL,
  configurable via option strings (`MaxWords`, `StartSel`, `MaxFragments`).
- `ts_stat` queries the FTS index itself, returning per-lexeme `ndoc` and
  `nentry` counts — useful for autocomplete and understanding the corpus.
- The difference between `plainto_tsquery` (implicit AND), `phraseto_tsquery`
  (ordered adjacency), and `websearch_to_tsquery` (explicit AND/OR/NOT/-).

## Challenge Info

| Field | Value |
|-------|-------|
| Day | 117 |
| Sprint | 4 — Data Engineering & Databases |
| Date | June 13, 2025 |
| Previous | [Day 116 - Redis Caching Layer](../day-116-redis-cache-api) |
| Next | Day 118 — Data export pipeline (CSV + Excel + PDF) |

Part of my 300 Days of Code Challenge!
