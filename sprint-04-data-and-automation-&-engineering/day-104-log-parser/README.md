# Day 104: Log Parser and Analyzer CLI

A Node.js + TypeScript CLI that reads structured log files (JSON or Apache/Nginx Combined Log Format), parses every line into typed records, filters by log level and time range, and produces a full analysis report — error rate, response time percentiles, top endpoints, slowest requests, status code distribution, and hourly traffic with bar charts.

## What's New

First log analysis project in the challenge. Introduces `readline` line-by-line streaming (no full file load), automatic log format detection (JSON vs Combined), percentile calculations from a sorted array, weighted random sampling for realistic log generation, and a 6-hour 18,000-entry sample log generated in under a second.

## Features

- Streams log files line-by-line via `readline` — constant memory regardless of file size
- Auto-detects JSON structured logs and Apache/Nginx Combined Log Format
- Parses: timestamp, level, method, endpoint, status code, response time, IP, user agent
- Level filter (`ERROR`, `WARN`, `INFO`, `DEBUG`, `ALL`) via `.env`
- Time range filter — last N hours only
- Per-endpoint stats: request count, error count, error rate, avg/P50/P95/P99/min/max ms
- Slowest 5 requests with full detail
- Hourly traffic buckets with inline bar charts
- Status code distribution table (2xx, 4xx, 5xx breakdown)
- Overall P95 response time and error rate
- Sample log generator — 18,000 realistic JSON entries across 6 hours

## Technologies Used

- Node.js + TypeScript
- `readline` — streaming line reader (native Node.js)
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-104-log-parser/
├── logs/
│   └── app.log                 # Generated sample log (18,000 entries)
├── src/
│   ├── analyzer/
│   │   └── analyze.ts          # Endpoint stats, hourly buckets, percentiles
│   ├── display/
│   │   └── printer.ts          # Terminal report formatter
│   ├── generator/
│   │   └── generate.ts         # Sample log generator (18k entries, 6 hours)
│   ├── parser/
│   │   ├── filter.ts           # Level and time range filters
│   │   ├── lineParser.ts       # JSON and Combined Log Format parsers
│   │   └── reader.ts           # readline-based line streamer
│   ├── types/
│   │   └── index.ts            # Interfaces
│   └── index.ts                # Entry point
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-104-log-parser
npm install
```

## How to Run

```bash
# Generate 18,000 sample log entries first
npm run generate

# Parse and analyze the generated log
npm run parse
```

## Testing Step by Step

1. **Install:**
   ```bash
   npm install
   ```

2. **Generate the sample log:**
   ```bash
   npm run generate
   ```
   Creates `./logs/app.log` with 18,000 JSON entries spanning 6 hours.

3. **Run the parser:**
   ```bash
   npm run parse
   ```

4. **Read the report sections:**
    - Overview — total lines, parsed count, error rate, avg/P95 response
    - Log Levels — ERROR/WARN/INFO/DEBUG counts with bar chart
    - Status Code Distribution — per-code counts and percentages
    - Top Endpoints — sorted by request count with P95/P99
    - Slowest 5 Requests — highest individual response times
    - Hourly Traffic — request count per hour with bar chart

5. **Filter to errors only:**
   Set `LOG_LEVEL_FILTER=ERROR` in `.env` and re-run.

6. **Filter to the last 2 hours:**
   Set `HOURS_FILTER=2` in `.env` and re-run.

7. **Parse your own log file:**
   Set `LOG_FILE=/path/to/your/app.log` in `.env`. Supports JSON and Apache/Nginx Combined format.

8. **Adjust top N endpoints:**
   Set `TOP_N=5` in `.env` to show only the top 5.

9. **Test with Combined Log Format:**
   Create a file with lines like:
   ```
   127.0.0.1 - - [10/Jan/2025:08:30:00 +0100] "GET /api/users HTTP/1.1" 200 1234 "-" "Mozilla/5.0"
   ```
   Point `LOG_FILE` at it and run.

10. **Inspect the raw log:**
    ```bash
    head -5 ./logs/app.log | python3 -m json.tool
    ```

## What I Learned

- `readline.createInterface` with `for await (const line of rl)` streams a file line-by-line — the entire file never sits in memory at once
- Percentile calculation from a sorted array: index is `Math.ceil((p/100) * length) - 1` — simple, no external library needed
- JSON log format auto-detection: checking `line.startsWith('{')` before attempting `JSON.parse` avoids try-catch overhead on every Combined log line
- Apache Combined Log Format date strings (`10/Jan/2025:08:30:00 +0100`) need a regex rewrite before `new Date()` can parse them — the format is non-standard
- Stripping query strings from endpoints (`path.split('?')[0]`) before grouping prevents `/api/products?page=1` and `/api/products?page=2` from appearing as separate endpoints in the report
- Weighted random sampling — assigning `weight` values to items and picking based on accumulated total — produces realistic traffic distributions without complex probability math

## Challenge Info

| Field    | Detail                                      |
|----------|---------------------------------------------|
| Day      | 104                                         |
| Sprint   | 4 — Data Engineering & Databases            |
| Date     | 2025-01-18                                  |
| Previous | [Day 103](../day-103-github-action-ci)      |
| Next     | [Day 105](../day-105-budget-tracker)        |

Part of my 300 Days of Code Challenge!
