# Day 27: Cron Examples

## Description

Day 25 taught me how to schedule cron jobs. Day 27 shows me why people use them in real systems, and what those systems actually look like.
The health monitor pattern is everywhere. Every server in production has something like this running, checking memory, CPU, disk space and writing those numbers to a file. Operations teams use that data to spot problems before they become outages.
The rate limiter is one of the most important patterns in backend development. APIs limit how many calls you can make per minute or per hour. The way it works is simple: keep a counter, increment it on every call, and at the end of each time window log the count and reset to zero. If the count hits the limit, trigger a warning. That’s exactly what the big API providers do, same logic, bigger scale.
The key difference from Day 25 is the Map registry. Instead of creating anonymous tasks and losing track of them, every job gets a name. That means you can stop a specific job by name, check if it’s already running before starting a duplicate, and keep the whole system clean and predictable. That’s production thinking.​​​​​​​​​​​​​​​​

A TypeScript project demonstrating five real-world cron job patterns using node-cron. Where Day 25 introduced the basics of scheduling, Day 27 goes deeper with production-style patterns: a health monitor that saves metrics to JSON, a report generator that writes timestamped files, a data cleanup job, a news headline ticker cycling through Nigerian news, and a rate limiter that tracks and resets API quota per window. All jobs log to a shared log file and can run simultaneously.

## Features

- **Health Monitor** - Tracks memory, uptime and simulated CPU load every 5 seconds, saves history to metrics-history.json
- **Report Generator** - Creates a formatted sales report .txt file every 10 seconds with Nigerian product data
- **Data Cleanup** - Simulates scanning and removing stale files every 8 seconds with storage freed calculation
- **News Ticker** - Cycles through 8 Nigerian news headlines one at a time every 6 seconds
- **Rate Limiter** - Simulates API call accumulation and quota checks every 7 seconds with warnings at limit
- **Start All** - Launches all 5 jobs simultaneously to see real concurrent scheduling
- **Metrics History** - View the last 8 health snapshots in a formatted table
- **Shared Log File** - All jobs append to cron-examples-log.txt with level tagging (INFO/WARN/ERROR/SUCCESS)

## Technologies Used

- TypeScript
- Node.js
- node-cron 3.x
- Chalk (terminal colors)
- readline and fs (built-in Node.js modules)

## Installation

```bash
npm install
```

## How to Run

```bash
npx ts-node cron-examples.ts
```

## Output Files Generated

|File                  |Description                                  |
|----------------------|---------------------------------------------|
|cron-examples-log.txt |All job output with timestamps and log levels|
|metrics-history.json  |Health monitor snapshots saved as JSON array |
|report-[timestamp].txt|Sales reports created by Report Generator    |

## Example Output

### Health Monitor:

```
[SUCCESS] [02/03/2026, 10:45:05] HealthMonitor: Memory: 24.5MB | Uptime: 5s | CPU: 18.3% | Check #1
[SUCCESS] [02/03/2026, 10:45:10] HealthMonitor: Memory: 24.6MB | Uptime: 10s | CPU: 22.1% | Check #2
```

### Rate Limiter:

```
[SUCCESS] [02/03/2026, 10:45:07] RateLimiter: Window #1 — Calls: 6/10 (60%) ✓ OK
[WARN]    [02/03/2026, 10:45:14] RateLimiter: Window #2 — Calls: 10/10 (100%) ⚠ LIMIT HIT
```

### News Ticker:

```
[INFO] [02/03/2026, 10:45:06] NewsTicker: [TechCabal] Nigeria Tech Startups Raise $200M in Q1 2026
[INFO] [02/03/2026, 10:45:12] NewsTicker: [BusinessDay] Dangote Refinery Hits Full Capacity
```

## What I Learned

- Real-world cron patterns used in production systems
- Writing structured log entries with levels to a shared file
- Persisting metrics history to JSON with fs.writeFileSync
- Running multiple concurrent jobs at different intervals
- Rate limiter pattern: accumulate → check → reset per window
- Map registry for managing and stopping named tasks cleanly

## Challenge Info

**Day:** 27/300
**Sprint:** 1 - Foundations
**Previous Day:** [Day 26 - TypeScript Dashboard Mock](../day-026-ts-dashboard-mock)
**Next Day:** Day 28 - GitHub Action for CI

-----

Part of my 300 Days of Code Challenge!
