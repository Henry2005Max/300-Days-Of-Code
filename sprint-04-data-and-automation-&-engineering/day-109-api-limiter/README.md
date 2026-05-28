# Day 109: API Rate Limiter Middleware

A production-grade Express rate limiter middleware built from scratch — no `express-rate-limit`. Implements three algorithms: **sliding window**, **fixed window**, and **token bucket**. State is persisted in SQLite so limits survive server restarts. Every request is logged with IP, path, method, algorithm, and allow/deny status. Includes a load test script that verifies all three algorithms actually block traffic.

## Algorithms

### Sliding Window
Stores individual request timestamps. Counts requests in the rolling window `[now - windowMs, now]`. Most accurate — no burst at window boundary. Slightly heavier on storage.

### Fixed Window
Tracks a single counter per key per time slot. Resets at fixed boundaries (e.g., every minute at :00). Simple and fast. Vulnerable to burst at window boundary — 2× max requests possible by hitting the end of one window and start of the next.

### Token Bucket
Each client has a bucket of tokens. One token consumed per request. Tokens refill at a steady rate (`maxRequests / windowSeconds` per second). Allows controlled bursts up to bucket size. Smoothest for APIs with variable traffic patterns.

## What's New

First from-scratch rate limiter in the challenge. Introduces all three canonical rate limiting algorithms with SQLite-backed persistence, proper `Retry-After` and `X-RateLimit-*` response headers, per-route config factory pattern, and a load test script that proves the limiter works under rapid fire.

## Features

- Three algorithms selectable per route via config
- SQLite persistence — limits survive process restarts
- `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `X-RateLimit-Algorithm` headers on every response
- `Retry-After` header on 429 responses
- IP extraction supports `X-Forwarded-For` (proxy-aware)
- Whitelist support via `skipIf` function in config
- Per-route key prefixing to namespace limits
- Request log with IP, path, method, status, algorithm, timestamp
- `/api/stats` endpoint showing allow rate and top blocked IPs
- Load test script fires controlled bursts and prints a results table

## Endpoints

| Route           | Algorithm      | Limit       |
|-----------------|----------------|-------------|
| `GET /api/sliding` | Sliding window | 10 req/min  |
| `GET /api/fixed`   | Fixed window   | 5 req/30s   |
| `GET /api/token`   | Token bucket   | 8 req/min   |
| `GET /api/strict`  | Sliding window | 3 req/10s   |
| `GET /api/stats`   | None           | Stats only  |

## Technologies Used

- Node.js + TypeScript
- Express 4
- `better-sqlite3` — synchronous SQLite for rate limit state
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-109-api-limiter/
├── data/
│   └── limiter.db              # SQLite state (sliding_requests, fixed_windows, token_buckets, request_logs)
├── src/
│   ├── middleware/
│   │   └── rateLimiter.ts      # Middleware factory — all 3 algorithms
│   ├── routes/
│   │   └── demo.ts             # 4 demo routes + stats endpoint
│   ├── store/
│   │   └── store.ts            # SQLite store with lazy init
│   ├── tester/
│   │   └── loadTest.ts         # Load test script
│   ├── types/
│   │   └── index.ts            # Interfaces
│   ├── app.ts                  # Express app
│   └── index.ts                # Server entry point
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-109-api-limiter
npm install
```

## How to Run

```bash
# Terminal 1 — start the server
npm run server

# Terminal 2 — run the load test
npm run test:load
```

## Testing Step by Step

1. **Install and start:**
   ```bash
   npm install
   npm run server
   ```

2. **Hit the strict endpoint manually** (limit: 3 req/10s):
   ```bash
   curl http://localhost:3000/api/strict   # 200
   curl http://localhost:3000/api/strict   # 200
   curl http://localhost:3000/api/strict   # 200
   curl http://localhost:3000/api/strict   # 429 — blocked!
   ```

3. **Check the headers on a 429:**
   ```bash
   curl -i http://localhost:3000/api/strict
   ```
   Look for `X-RateLimit-Remaining: 0` and `Retry-After: N`.

4. **Run the load test** in a second terminal:
   ```bash
   npm run test:load
   ```
   Should show each algorithm blocking the expected number of requests.

5. **Check stats:**
   ```bash
   curl http://localhost:3000/api/stats | python3 -m json.tool
   ```

6. **Compare algorithms** — hit sliding vs fixed rapidly:
   ```bash
   for i in {1..12}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/sliding; done
   for i in {1..8};  do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/fixed;   done
   ```

7. **See token bucket refill** — hit the token route 8× (exhausts it), wait 8 seconds, hit again:
   ```bash
   for i in {1..9}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/token; done
   sleep 8
   curl http://localhost:3000/api/token   # Should be 200 again
   ```

8. **Change limits** — edit `src/routes/demo.ts` to lower `maxRequests` and restart.

9. **Add rate limiting to your own route:**
   ```ts
   import { rateLimiter } from './middleware/rateLimiter';

   router.get('/my-endpoint',
     rateLimiter({ algorithm: 'token_bucket', windowMs: 60_000, maxRequests: 20 }),
     handler
   );
   ```

10. **Restart server** — limits persist across restarts because state is in SQLite.

## What I Learned

- Sliding window is the most accurate algorithm but requires storing one row per request — for high-traffic APIs, TTL-based stores (Redis) are preferable to SQLite for this
- Fixed window is vulnerable to burst attacks: a client can make `2 × maxRequests` requests by timing requests at the end of one window and the start of the next — this is the "boundary burst" problem
- Token bucket allows bursting up to the full bucket size but smooths out sustained traffic — ideal for APIs where occasional bursts are acceptable but sustained overuse is not
- `Math.floor(now / windowMs) * windowMs` snaps a timestamp to the nearest window boundary — a clean way to group requests into fixed slots without storing the boundary explicitly
- `X-Forwarded-For` contains a comma-separated list when requests pass through multiple proxies — always take the first element
- Probabilistic cleanup (`Math.random() < 0.01`) for sliding window old rows avoids a full-table scan on every request while keeping the table bounded over time
- SQLite `UPSERT` (`INSERT ... ON CONFLICT DO UPDATE`) with conditional logic (`CASE WHEN window_start = @windowStart THEN count + 1 ELSE 1 END`) handles the fixed window increment and reset atomically in one statement

## Challenge Info

| Field    | Detail                                      |
|----------|---------------------------------------------|
| Day      | 109                                         |
| Sprint   | 4 — Data Engineering & Databases            |
| Date     | 2025-01-23                                  |
| Previous | [Day 108](../day-108-file-organizer)        |
| Next     | [Day 110](../day-110-data-pipeline)         |

Part of my 300 Days of Code Challenge!
