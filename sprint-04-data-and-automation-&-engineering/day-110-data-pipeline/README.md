# Day 110: Data Pipeline with Node.js Streams

A multi-stage ETL pipeline built entirely with Node.js native Transform streams. Reads a 50,000-row CSV, validates every row with Zod, enriches each with computed fields (month, quarter, revenue band, discount %, day of week), aggregates by category and month while rows flow through, then writes the cleaned+enriched data to a new CSV and a JSON summary — all without loading the full file into memory.

## What's New

Sprint 4 capstone project on streams. Introduces `stream/promises.pipeline` for proper backpressure and error propagation, custom `Transform` stream classes in objectMode, `csv-parse` and `csv-stringify` in streaming mode, and in-stream aggregation (accumulating Maps while rows pass through rather than loading all rows first). 50,000 rows processed in under 2 seconds on a local machine.

## Pipeline Architecture

```
ReadStream
  → csv-parse (RawRow objects)
  → ValidateStage (drops ~3% invalid rows)
  → EnrichStage (adds month, quarter, revenue_band, discount_pct, day_of_week)
  → AggregateStage (accumulates category/monthly/city stats, passes rows through)
  → csv-stringify (back to CSV with enriched columns)
  → WriteStream (cleaned.csv)
```

All stages run with `objectMode: true` — rows pass as JavaScript objects, not Buffers.

## Features

- 50,000-row generator with ~3% intentionally dirty rows for the pipeline to handle
- Zod validation in a Transform stream — invalid rows are dropped or error-thrown
- Enrichment stage adds 5 computed fields per row without any extra I/O
- Aggregate stage accumulates category, monthly, and city stats in Maps as rows flow through — no second pass
- `stream/promises.pipeline` handles backpressure automatically and propagates errors cleanly
- Progress counter printed to stdout via `\r` carriage return (no new lines per row)
- Outputs: cleaned+enriched CSV, JSON summary with aggregates, plain-text report
- Configurable via `.env`: input/output paths, skip-invalid toggle, log frequency

## Technologies Used

- Node.js + TypeScript
- `stream/promises.pipeline` — backpressure-aware stream chaining
- `csv-parse` — streaming CSV parser
- `csv-stringify` — streaming CSV serializer
- `zod` — row validation and coercion
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-110-data-pipeline/
├── data/
│   ├── input/
│   │   └── sales.csv           # Generated 50k-row input
│   └── output/
│       ├── cleaned.csv         # Validated + enriched output
│       ├── summary.json        # Aggregation results
│       └── report.txt          # Human-readable report
├── src/
│   ├── display/
│   │   └── printer.ts          # Terminal + file report printer
│   ├── generator/
│   │   └── generate.ts         # 50k row CSV generator
│   ├── pipeline/
│   │   └── runner.ts           # Stream pipeline orchestrator
│   ├── stages/
│   │   ├── aggregateStage.ts   # Accumulates stats, passes rows through
│   │   ├── enrichStage.ts      # Adds computed fields
│   │   └── validateStage.ts    # Zod validation, drops invalid rows
│   ├── types/
│   │   └── index.ts            # Interfaces
│   └── index.ts                # Entry point
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-110-data-pipeline
npm install
```

## How to Run

```bash
# Generate 50,000 sample rows
npm run generate

# Run the pipeline
npm run pipeline
```

## Testing Step by Step

1. **Install:**
   ```bash
   npm install
   ```

2. **Generate the input file:**
   ```bash
   npm run generate
   ```
   Creates `./data/input/sales.csv` with 50,000 rows (~3% intentionally dirty).

3. **Run the pipeline:**
   ```bash
   npm run pipeline
   ```
   Watch the `[Validate]` progress counter scroll as rows are processed.

4. **Check outputs:**
   ```bash
   wc -l ./data/output/cleaned.csv       # Should be ~48,500 (valid rows + header)
   head -2 ./data/output/cleaned.csv     # Check enriched columns are present
   cat ./data/output/report.txt           # Full text report
   ```

5. **Inspect the JSON summary:**
   ```bash
   cat ./data/output/summary.json | python3 -m json.tool | head -50
   ```

6. **Verify enriched fields are in the output CSV:**
   ```bash
   head -1 ./data/output/cleaned.csv
   ```
   Should show: `order_id,...,month,quarter,revenue_band,discount_pct,day_of_week`

7. **Test error handling** — set `SKIP_INVALID=false` in `.env` and re-run. The pipeline will throw on the first invalid row instead of skipping it.

8. **Change log frequency** — set `LOG_EVERY=5000` to see less frequent progress updates.

9. **Increase dataset size** — change `ROWS = 50_000` to `200_000` in `generate.ts` to stress test memory usage. Should remain flat since streams never load the full file.

10. **Add a new stage** — create a new `Transform` class extending `Transform` with `objectMode: true`, add it to the pipeline in `runner.ts` between `enricher` and `aggregator`.

## What I Learned

- `stream/promises.pipeline(...stages)` handles backpressure automatically — each stage only processes data as fast as the next stage can consume it, preventing memory overflow on large files
- `Transform` streams in `objectMode: true` pass JavaScript objects between stages instead of Buffers — ideal for row-by-row processing
- Accumulating aggregation Maps inside a passthrough Transform (AggregateStage) avoids a second pass over the data — the stats are complete by the time `pipeline()` resolves
- `csv-parse` with `{ columns: true }` auto-maps the header row to object keys — compatible with objectMode Transform streams downstream
- `csv-stringify` with `{ header: true, columns: [...] }` serializes objects back to CSV — the `columns` array controls both which fields are included and their order
- Using `\r` (carriage return without newline) for progress output avoids 50,000 console.log lines while still giving live feedback
- `pipeline()` from `stream/promises` propagates errors from any stage back to the `await` call — no need for per-stream error handlers

## Challenge Info

| Field    | Detail                                      |
|----------|---------------------------------------------|
| Day      | 110                                         |
| Sprint   | 4 — Data Engineering & Databases            |
| Date     | 2025-01-24                                  |
| Previous | [Day 109](../day-109-api-limiter)           |
| Next     | [Day 111](../day-111-ts-dashboard-mock-2)   |

Part of my 300 Days of Code Challenge!
