# Day 69: Rate Limiter Middleware

## Description

A rate limiting middleware built from scratch using the sliding window algorithm. No external library — pure TypeScript with a Map-based timestamp store. Three different limiters protect three different route types: general API (20/min), search (10/min), and auth login (5/15min). Standard rate limit headers are set on every response. A tight test endpoint (5 req/10s) lets you trigger the 429 response quickly in the browser.

## Sliding Window Algorithm

```
Window: 60 seconds, Limit: 10 requests

On each request:
1. Remove timestamps older than (now - 60s)     ← sliding window
2. Count remaining timestamps
3. If count >= 10 → 429, set Retry-After header
4. If count < 10  → add current timestamp, allow request
```

The key difference from a fixed window: you look back exactly N seconds from *right now*, not from a clock boundary. This prevents burst attacks at window boundaries.

## Features

- createRateLimiter() factory — returns middleware configured with windowMs and max
- Sliding window algorithm — timestamps filtered on every request
- Per-IP tracking using a Map<string, ClientRecord>
- Memory leak prevention — setInterval cleanup removes expired client records
- Standard headers on every response: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- Retry-After header on 429 responses — tells client exactly how long to wait
- 429 Too Many Requests with retryAfterSeconds and retryAt timestamp in body
- Three limiters: general (20/min), search (10/min), auth (5/15min)
- Test endpoint (5 req/10s) — trigger limit by refreshing 6 times quickly
- Cleanup interval uses .unref() so it doesn't prevent process shutdown
- Custom keyGenerator support — can key by IP, user ID, API key, etc.

## Technologies Used

- Node.js
- TypeScript
- Express 4
- dotenv
- tsx

## Folder Structure

```
day-069-rate-limiter/
├── src/
│   ├── index.ts
│   ├── types/
│   │   └── index.ts              ← RateLimitOptions, RateLimitInfo, ClientRecord
│   ├── routes/
│   │   └── demo.ts               ← demo routes with different limiters applied
│   └── middleware/
│       ├── rateLimiter.ts        ← createRateLimiter() factory, sliding window
│       └── logger.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd Desktop
mkdir day-069-rate-limiter
cd day-069-rate-limiter
mkdir -p src/types src/routes src/middleware
```

Copy all files, then:

```bash
npm install
npm run dev
```

## Testing Step by Step

### Browser tests:

1. `http://localhost:3000/api/test` — first request, shows remaining count
2. Refresh 4 more times quickly — count decreases each time
3. Refresh a 6th time — **429 Too Many Requests** with retryAfterSeconds
4. Wait 10 seconds and refresh — limit resets, requests allowed again
5. `http://localhost:3000/api/data` — general endpoint (20/min limit)
6. `http://localhost:3000/api/search?q=nodejs` — search endpoint (10/min)

### Check the headers:
- Open browser DevTools → Network tab
- Click any request to `/api/test`
- Look at Response Headers:
  - `X-RateLimit-Limit: 5`
  - `X-RateLimit-Remaining: 3`
  - `X-RateLimit-Reset: 1234567890`

### Postman — test auth limiter:
- POST `http://localhost:3000/api/auth/login`
- Body: `{ "email": "henry@example.com", "password": "test" }`
- Send 6 times → 5th succeeds, 6th returns 429 with 15 minute retry window

### Terminal:
Watch the logs — every request shows ALLOWED or BLOCKED with count/limit.
429 responses are shown in magenta.

## What I Learned

- Sliding window rate limiting stores an array of request timestamps per client and filters out timestamps older than the window on every request — this is more accurate than fixed window which has edge case vulnerabilities
- A middleware factory (createRateLimiter) is more flexible than a single middleware — you can apply different configurations to different routes by calling the factory with different options
- setInterval().unref() is important in Node.js — without it, the cleanup interval keeps the event loop alive and prevents the process from exiting cleanly on shutdown
- X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset are the industry-standard headers for rate limit state — clients can read these to implement automatic backoff
- Retry-After is an HTTP standard header that tells clients exactly how many seconds to wait before retrying — should always be included in 429 responses
- Auth endpoints need much stricter limits than general API endpoints — 5 attempts per 15 minutes is a reasonable brute-force protection for login

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 69 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 16, 2025 |
| Previous | [Day 68 — API Proxy](../day-068-api-proxy) |
| Next | [Day 70 — Review: Error Handling](../day-070-error-handling) |

Part of my 300 Days of Code Challenge!
