# Day 102: Cron Examples with node-cron

A multi-job cron scheduler that runs five tasks on independent schedules, tracks every run in a SQLite job history database, and renders a live status table in the terminal showing last run time, success streak, average duration, and last output message per job.

## What's New

First cron scheduler project with job history tracking. Introduces `node-cron` for second-level precision scheduling, `better-sqlite3` for synchronous job history writes, and a live-updating terminal status table with relative timestamps and streak counters. All five jobs run at different intervals and each writes its outcome to SQLite immediately after finishing.

## Features

- Five scheduled jobs on independent cron expressions (15s, 30s, 1m, 2m, 3m)
- Heartbeat — logs memory and uptime every 15 seconds
- Health Check — verifies required dirs and DB file exist every 30 seconds
- Report Snapshot — writes a JSON process snapshot to disk every minute
- Stale Log Cleanup — removes old rotated logs every 2 minutes
- Log Rotation — rotates the scheduler log if over 50KB every 3 minutes
- Every run stored in SQLite: status, duration, output message, timestamps
- Live status table — redraws every 5s with relative times and colour badges
- Consecutive success streak counter per job
- `HISTORY_ONLY=true` mode prints the last 30 runs and exits
- Graceful shutdown on `Ctrl+C` — closes DB and clears the interval

## Technologies Used

- Node.js + TypeScript
- `node-cron` — cron scheduler with second-level precision and timezone support
- `better-sqlite3` — synchronous SQLite for job history (no async needed)
- `dotenv` — environment configuration
- ANSI escape codes — colour-coded status badges
- `tsx` — TypeScript execution

## Folder Structure

```
day-102-cron-examples/
├── logs/                           # Created at runtime
│   ├── scheduler.db                # SQLite job history
│   ├── scheduler.log               # Append-only job log
│   └── snapshots/                  # JSON report snapshots
├── src/
│   ├── db/
│   │   └── store.ts                # SQLite store with lazy init + Proxy pattern
│   ├── display/
│   │   └── statusTable.ts          # Live table and history printer
│   ├── jobs/
│   │   ├── handlers.ts             # Five job handler functions
│   │   └── registry.ts             # Job definitions with schedules
│   ├── scheduler/
│   │   └── scheduler.ts            # node-cron registration wrapper
│   ├── types/
│   │   └── index.ts                # Interfaces
│   └── index.ts                    # Entry point
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-102-cron-examples
npm install
```

## How to Run

```bash
# Start the scheduler with live status table
npm run run:scheduler

# Print the last 30 job runs and exit
npm run history
```

## Testing Step by Step

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the scheduler:**
   ```bash
   npm run run:scheduler
   ```

3. **Watch the status table** — within 15 seconds the heartbeat job fires. Within 30s the health check fires. After 1 minute the report snapshot fires.

4. **Observe the status badges** — green `● OK` for success, red `● FAIL` for failure, `○ NEVER` before first run.

5. **Watch the streak counter** — each consecutive success increments the streak. A ★ appears when streak ≥ 5.

6. **Check job output files:**
   ```bash
   cat ./logs/scheduler.log
   ls ./logs/snapshots/
   cat ./logs/snapshots/snapshot-*.json
   ```

7. **Press Ctrl+C** — scheduler stops cleanly, DB closes, message printed.

8. **View history mode:**
   ```bash
   npm run history
   ```

9. **Verify SQLite data:**
   ```bash
   sqlite3 ./logs/scheduler.db "SELECT job_name, status, duration_ms, message FROM job_runs ORDER BY started_at DESC LIMIT 10;"
   ```

10. **Trigger log rotation** — run `npm run run:scheduler`, let it collect logs, then manually pad the log file past 50KB to trigger rotation:
    ```bash
    python3 -c "print('x' * 60000)" >> ./logs/scheduler.log
    ```

## What I Learned

- `node-cron` supports six-field cron expressions with seconds — `*/15 * * * * *` fires every 15 seconds, unlike the standard five-field format which only goes down to minutes
- `better-sqlite3` is synchronous — `.run()`, `.get()`, `.all()` return values directly without `await`, which simplifies job history writes inside async handlers
- `db.pragma('journal_mode = WAL')` enables Write-Ahead Logging in SQLite — allows concurrent reads while a write is in progress, important when the status table reads while jobs write
- The lazy-init pattern for `better-sqlite3` is the same discipline as Sprint 3's `statements.ts` — all `db.prepare()` calls go inside `buildStatements()` called once after the DB is opened
- Storing `started_at` as ISO 8601 text in SQLite (not INTEGER timestamps) makes the history query output human-readable without any conversion
- Relative time display (`5s ago`, `2m ago`) requires no library — a simple diff against `Date.now()` covers all practical cases
- `setInterval` for the status table redraw and `node-cron` for job scheduling coexist cleanly — both share the same Node.js event loop

## Challenge Info

| Field    | Detail                                      |
|----------|---------------------------------------------|
| Day      | 102                                         |
| Sprint   | 4 — Data Engineering & Databases            |
| Date     | 2025-01-16                                  |
| Previous | [Day 101](../day-101-ts-dashboard)          |
| Next     | [Day 103](../day-103-github-action-ci)      |

Part of my 300 Days of Code Challenge!
