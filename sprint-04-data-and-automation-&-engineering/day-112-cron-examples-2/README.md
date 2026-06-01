# Day 112: Advanced Cron Scheduler

Builds on Day 102's scheduler with three production-grade additions: **job dependencies** (a job checks whether its upstream jobs succeeded recently before running), **retry with exponential backoff** (failed jobs automatically reschedule with increasing delays), and **webhook notifications** (job results are POSTed to a configurable URL). Five new job types: DB health check, system metrics snapshot, API sync (10% simulated failure rate), report generator (depends on api-sync), and stale cleanup.

## What's New vs Day 102

| Feature | Day 102 | Day 112 |
|---------|---------|---------|
| Retry logic | None | Exponential backoff — base × 2^(attempt-1), max 30s |
| Job dependencies | None | `dependsOn: ['job-id']` — checks last success within 5 min |
| Webhook | None | POST to any URL after success or final failure |
| Overlap prevention | None | Running Set — skips if already executing |
| Job timeout | None | `Promise.race` kills jobs that run too long |
| Priority field | None | `critical / high / normal / low` |
| Triggered-by tracking | `'cron'` only | `'cron' / 'retry' / 'dependency-check'` |
| Attempt number | Not stored | Stored per run row |

## Dependency Graph

```
db-health     (every 20s)   — no deps
system-metrics (every 30s)  — no deps
api-sync      (every 1min)  — no deps, 10% failure rate, 3 retries
report-gen    (every 1m30s) — depends on api-sync (must have succeeded within 5min)
stale-cleanup (every 2min)  — no deps
```

## Retry Behaviour

Failed jobs reschedule with exponential backoff:
- Attempt 1 fails → retry after `1000ms`
- Attempt 2 fails → retry after `2000ms`
- Attempt 3 fails → retry after `4000ms` → mark as FAILED permanently

## Features

- `dependsOn` array per job — checks `getLastSuccess(depId)` before each run
- Exponential backoff via `BACKOFF_BASE * 2^(attempt-1)`, capped at 30s
- `Promise.race` timeout per job — configurable via `timeout` field in ms
- Running Set prevents overlap — skips if same job is already executing
- Webhook POST on success and final failure with full payload
- All new fields in SQLite: `attempt`, `triggered_by`
- `HISTORY_ONLY=true` prints run log and exits

## Technologies Used

- Node.js + TypeScript
- `node-cron` — second-level scheduling with timezone support
- `better-sqlite3` — synchronous SQLite run history
- Native `fetch` — webhook POST (Node.js 18+)
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-112-cron-examples-2/
├── data/
│   ├── scheduler.db      # SQLite run history
│   ├── scheduler.log     # Append-only job log
│   ├── snapshots/        # System metrics JSON files
│   └── reports/          # Generated report JSON files
├── src/
│   ├── db/store.ts       # SQLite store with lazy init
│   ├── display/
│   │   └── statusTable.ts # Live table and history printer
│   ├── jobs/
│   │   ├── handlers.ts   # Five job handler functions
│   │   └── registry.ts   # Job definitions with schedules, deps, retries
│   ├── notifier/
│   │   └── webhook.ts    # Webhook POST notifier
│   ├── scheduler/
│   │   └── scheduler.ts  # Dependency check, retry, timeout, overlap prevention
│   ├── types/index.ts
│   └── index.ts
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-112-cron-examples-2
npm install
```

## How to Run

```bash
# Start the scheduler
npm run run:scheduler

# Print run history and exit
npm run history
```

## Testing Step by Step

1. **Install and start:**
   ```bash
   npm install
   npm run run:scheduler
   ```

2. **Watch the first 30 seconds** — db-health fires at 20s, system-metrics at 30s.

3. **At 1 minute** — api-sync fires. It fails ~10% of the time, triggering a retry chain.

4. **At 1m30s** — report-generator fires. If api-sync succeeded within the last 5 minutes it runs; otherwise it's skipped with `● SKIP`.

5. **Force a dependency skip** — temporarily change `api-sync` schedule to never fire and watch report-generator get skipped every cycle.

6. **Test webhook** — point `WEBHOOK_URL` at a free test endpoint:
   ```
   WEBHOOK_URL=https://webhook.site/your-unique-id
   ```
   Restart and watch POST requests arrive on webhook.site.

7. **Check SQLite:**
   ```bash
   sqlite3 ./data/scheduler.db \
     "SELECT job_name, status, attempt, triggered_by, duration_ms FROM job_runs ORDER BY started_at DESC LIMIT 15;"
   ```

8. **View history:**
   ```bash
   npm run history
   ```

9. **Inspect metrics snapshots:**
   ```bash
   ls ./data/snapshots/
   cat ./data/snapshots/*.json | head -1 | python3 -m json.tool
   ```

10. **Adjust backoff** in `.env`:
    ```
    BACKOFF_BASE_MS=500
    MAX_RETRIES=5
    ```

## What I Learned

- Exponential backoff with `setTimeout` inside the catch block is cleaner than a retry queue — the closure captures the job definition and attempt number correctly
- `Promise.race([handler(), timeoutPromise])` is the idiomatic way to add per-job timeouts without modifying the handler itself
- A `Set<string>` of running job IDs is the simplest overlap-prevention mechanism — no locks or semaphores needed for single-process schedulers
- Dependency checking by timestamp (`age > 5 * 60 * 1000`) is more robust than a boolean flag — it handles the case where the upstream job hasn't fired yet in the current window
- Storing `triggered_by` ('cron' / 'retry' / 'dependency-check') in the run log makes debugging retry chains much easier than inferring it from the attempt number alone
- `Promise.race` with a `new Promise<never>` that only rejects means the winning path is always the handler's resolve — clean type without needing to handle a separate resolve case

## Challenge Info

| Field    | Detail                                      |
|----------|---------------------------------------------|
| Day      | 112                                         |
| Sprint   | 5 — Mobile Apps                             |
| Date     | 2025-01-26                                  |
| Previous | [Day 111](../day-111-ts-dashboard-2)        |
| Next     | [Day 113](../day-113-github-action-rn)      |

Part of my 300 Days of Code Challenge!
