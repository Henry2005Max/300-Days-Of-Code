# Day 101: TypeScript Terminal Dashboard

A live-updating terminal dashboard that pulls sales metrics from PostgreSQL every few seconds and renders a multi-panel ASCII layout using ANSI escape codes — no external TUI library. Four panels: summary statistics, top products with bar charts, category revenue breakdown, and monthly trend. A status bar shows the live clock, last fetch time, and refresh interval.

## What's New

First terminal UI project in Sprint 4 continuation. Introduces ANSI escape code rendering from scratch — cursor positioning with `\x1b[H`, colour codes, box-drawing characters, and flicker-free refresh by moving the cursor home and overwriting in place rather than clearing the screen. All panels are pure functions that return arrays of strings, composed by the dashboard renderer.

## Features

- Four live panels: summary stats, top 6 products, category breakdown, monthly trend
- Mini bar charts rendered with `█` and `░` characters scaled to the max value per panel
- Box-drawing borders using Unicode box characters (`╔ ═ ╗ ║ ╚ ╝`)
- ANSI 256-colour output — green for revenue, yellow for monetary values, cyan for accents
- Flicker-free refresh — cursor repositioned to home, panels overwritten in place
- Configurable refresh interval via `REFRESH_INTERVAL_MS` in `.env` (default 3s)
- Cursor hidden during dashboard run, restored cleanly on `Ctrl+C`
- Graceful shutdown — `SIGINT`/`SIGTERM` handlers close the DB pool and show cursor
- Errors displayed inline without crashing — retries on next interval

## Technologies Used

- Node.js + TypeScript
- `pg` — PostgreSQL connection pool
- ANSI escape codes — terminal colour and cursor control (no external TUI library)
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-101-ts-dashboard/
├── src/
│   ├── db/
│   │   └── pool.ts              # Lazy pg.Pool singleton
│   ├── panels/
│   │   ├── categoryPanel.ts     # Category revenue rows with bars
│   │   ├── productsPanel.ts     # Top products with bars
│   │   ├── statusBar.ts         # Clock, last fetch, refresh, quit hint
│   │   ├── summaryPanel.ts      # Key metric rows
│   │   └── trendPanel.ts        # Monthly trend rows with bars
│   ├── queries/
│   │   └── metrics.ts           # All four DB queries fired in parallel
│   ├── renderer/
│   │   ├── ansi.ts              # ANSI codes, box chars, helper functions
│   │   ├── box.ts               # Bordered panel renderer
│   │   └── dashboard.ts         # Assembles panels, writes to stdout
│   ├── types/
│   │   └── index.ts             # Interfaces
│   └── index.ts                 # Main loop — tick on interval
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-101-ts-dashboard
npm install
```

Requires the `csv_analyzer_v2` PostgreSQL database from Day 100 to be populated.

## How to Run

```bash
npm run dashboard
```

Press `Ctrl+C` to exit cleanly.

## Testing Step by Step

1. **Ensure Day 100 database is populated:**
   ```bash
   psql -U postgres -d csv_analyzer_v2 -c "SELECT COUNT(*) FROM sales_records;"
   ```
   Should return 50.

2. **Update `.env`:**
   ```
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/csv_analyzer_v2
   ```

3. **Install and run:**
   ```bash
   npm install
   npm run dashboard
   ```

4. **Observe the live dashboard** — four bordered panels with colour-coded metrics and bar charts.

5. **Watch the status bar** — the clock updates every `REFRESH_INTERVAL_MS` milliseconds and shows the last successful fetch time.

6. **Change refresh speed** in `.env`:
   ```
   REFRESH_INTERVAL_MS=1000
   ```
   Restart to see faster updates.

7. **Test error recovery** — stop PostgreSQL temporarily. The dashboard will show an error message and resume automatically when the DB comes back.

8. **Press Ctrl+C** — cursor reappears cleanly, no terminal corruption.

9. **Test in a narrow terminal** — the panels are 70 characters wide; terminals narrower than this will wrap but not crash.

10. **Connect to a different database** — point `DATABASE_URL` at any PostgreSQL database that has a `sales_records` table with the Day 91 schema.

## What I Learned

- `\x1b[H` moves the cursor to row 1, column 1 — overwriting from there avoids the flash that `\x1b[2J` (clear screen) causes between renders
- ANSI colour codes follow the pattern `\x1b[<code>m` and are reset with `\x1b[0m` — multiple codes can be chained: `\x1b[1m\x1b[92m` for bold bright green
- Stripping ANSI codes from a string before measuring its length is required for correct padding — `str.replace(/\x1b\[[0-9;]*m/g, '').length` gives the visible character count
- `process.stdout.write()` is preferable to `console.log()` for TUI rendering — it doesn't append a newline and allows precise control of what is written
- `\x1b[?25l` hides the cursor and `\x1b[?25h` shows it — always restore on exit or the terminal is left in a broken state
- `setInterval` keeps the Node.js event loop alive — no need for a `while(true)` loop or keep-alive hack
- Box-drawing Unicode characters (`╔ ═ ║` etc.) are single characters in JavaScript strings but may render as double-width in some terminals — testing in the actual target terminal matters

## Challenge Info

| Field    | Detail                                      |
|----------|---------------------------------------------|
| Day      | 101                                         |
| Sprint   | 4 — Data Engineering & Databases            |
| Date     | 2025-01-15                                  |
| Previous | [Day 100](../day-100-review)                |
| Next     | [Day 102](../day-102-cron-examples)         |

Part of my 300 Days of Code Challenge!
