# Day 98: Sentiment Analyzer with compromise NLP

A Node.js + TypeScript CLI that analyzes Nigerian-context news headlines, product reviews, social media posts, and financial commentary using the `compromise` NLP library. Extracts sentiment score, magnitude, named entities (people, places, organizations), and keywords — stores everything in a normalized three-table PostgreSQL schema and prints per-text analysis plus an aggregate report.

## What's New

First NLP project in the challenge. Introduces `compromise` for named entity recognition and linguistic parsing, a custom lexicon-based sentiment scorer tuned for Nigerian business and news vocabulary, score normalization using the square root of word count to avoid length bias, and a three-table schema separating results, entities, and keywords for clean aggregate queries.

## Features

- Analyzes 15 Nigerian-context texts across four categories: news, finance, review, social
- Custom sentiment lexicon with 60+ positive/negative terms tuned for Nigerian context
- Handles intensifiers (`very`, `extremely`) and negators (`not`, `never`) during scoring
- Score normalized to [-1.0, +1.0] range; magnitude [0.0, 1.0] measures strength
- Named entity extraction via `compromise`: people, places, organizations, topics
- Keyword extraction — top 8 meaningful nouns and verbs per text
- Three-table schema: `sentiment_results`, `sentiment_entities`, `sentiment_keywords`
- Upsert on `input_id` — re-running updates existing records, never duplicates
- Aggregate report: sentiment distribution, category breakdown, top keywords, top entities
- Score bar visualization in terminal — 20-character filled bar showing sentiment position
- `REPORT_ONLY=true` skips analysis and reads directly from the database

## Technologies Used

- Node.js + TypeScript
- `compromise` — NLP library for entity extraction and linguistic parsing
- `pg` — PostgreSQL connection pool
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-098-sentiment-analyzer/
├── src/
│   ├── data/
│   │   └── sampleTexts.ts     # 15 Nigerian-context input texts
│   ├── db/
│   │   ├── migrations.ts      # Three-table schema with indexes
│   │   ├── pool.ts            # Lazy pg.Pool singleton
│   │   └── repository.ts      # upsertResult, getAggregateReport, getAllResults
│   ├── display/
│   │   └── printer.ts         # Per-text results and aggregate report formatter
│   ├── nlp/
│   │   └── analyzer.ts        # Sentiment scorer + compromise entity/keyword extractor
│   ├── types/
│   │   └── index.ts           # Interfaces
│   └── index.ts               # Entry point
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-098-sentiment-analyzer
npm install
```

## How to Run

```bash
# Analyze all sample texts, store in DB, print full report
npm run analyze

# Print report from existing DB data without re-analyzing
npm run report
```

## Testing Step by Step

1. **Create the PostgreSQL database:**
   ```bash
   createdb sentiment_analyzer
   ```

2. **Update `.env`:**
   ```
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/sentiment_analyzer
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the analyzer:**
   ```bash
   npm run analyze
   ```

5. **Read the terminal output:**
    - Each text shows its sentiment badge, score bar, magnitude, entities, and keywords
    - The aggregate section shows sentiment distribution with visual bars, category breakdown, top keywords, and top entities

6. **Run again** — all records upsert cleanly, no duplicates created.

7. **Report-only mode:**
   ```bash
   npm run report
   ```

8. **Add your own texts** — edit `src/data/sampleTexts.ts`, add a new `InputText` object with a unique `id`, and re-run.

9. **Verify data in PostgreSQL:**
   ```bash
   psql -U postgres -d sentiment_analyzer \
     -c "SELECT input_id, label, score FROM sentiment_results ORDER BY score DESC;"
   ```

10. **Query top keywords across all results:**
    ```bash
    psql -U postgres -d sentiment_analyzer \
      -c "SELECT keyword, COUNT(*) FROM sentiment_keywords GROUP BY keyword ORDER BY count DESC LIMIT 10;"
    ```

## What I Learned

- `compromise` exposes `.people()`, `.places()`, `.organizations()`, `.nouns()`, `.verbs()` as chainable methods — `.out('array')` converts any result to a plain string array
- Dividing raw sentiment score by `Math.sqrt(wordCount)` normalizes for text length — a 3-word text with one positive word shouldn't outscore a 50-word article with ten positive words
- Intensifiers and negators need to be tracked as a multiplier state variable — processing word-by-word in order handles `not very good` correctly
- Storing entities and keywords in separate tables (not JSON columns) enables efficient `GROUP BY` aggregate queries across all results in a single SQL call
- `ON CONFLICT (input_id) DO UPDATE` combined with DELETE + re-insert for child tables is a clean upsert pattern for one-to-many relations
- `json_agg(DISTINCT jsonb_build_object(...)) FILTER (WHERE ...)` aggregates related rows from a JOIN into a JSON array in one query — avoids N+1 entity lookups
- `compromise` works in CommonJS Node.js with `import nlp from 'compromise'` and `esModuleInterop: true` in tsconfig — no additional setup needed

## Challenge Info

| Field    | Detail                                      |
|----------|---------------------------------------------|
| Day      | 98                                          |
| Sprint   | 4 — Data Engineering & Databases            |
| Date     | 2025-01-12                                  |
| Previous | [Day 97](../day-097-stock-fetcher)          |
| Next     | [Day 99](../day-099-backup-script)          |

Part of my 300 Days of Code Challenge!
