# Day 68: API Proxy

## Description

A proxy server that wraps three public APIs — Open-Meteo (weather), REST Countries, and ExchangeRate. Clients call your server instead of the upstream APIs directly. The proxy adds per-route TTL caching, response transformation (stripping raw API responses to clean minimal shapes), and 502 error handling for upstream failures. No API keys required for any of the three services used.

## What is an API Proxy?

```
Without proxy: Browser → External API (API key exposed in browser)
With proxy:    Browser → Your Server → External API (key stays on server)
```

Benefits: API keys hidden, caching reduces upstream calls, responses cleaned up, rate limits controlled by you.

## Features

- GET /proxy/weather/:city — weather for 8 Nigerian cities (lagos, abuja, kano, ibadan, portharcourt, enugu, kaduna, benincity)
- GET /proxy/country/:name — country data for any country by name
- GET /proxy/exchange/:base — exchange rates for any currency base, always includes NGN
- Cache TTLs: weather 10 min, countries 24 hours, exchange rates 1 hour
- ProxyResponse<T> shape includes source, cached, cachedAt, expiresInSeconds
- WMO weather code → human readable description mapping
- Response transformation — raw API responses stripped to clean minimal shapes
- 502 Bad Gateway returned on upstream failures (not raw upstream errors)
- GET /proxy/cache — inspect cache entries and expiry times
- DELETE /proxy/cache — clear all cached entries

## Technologies Used

- Node.js
- TypeScript
- Express 4
- Axios
- dotenv
- tsx

## Folder Structure

```
day-068-api-proxy/
├── src/
│   ├── index.ts
│   ├── types/
│   │   └── index.ts              ← ProxyResponse, WeatherData, CountryData, ExchangeData
│   ├── services/
│   │   ├── proxyClients.ts       ← upstream API callers + response transformers
│   │   ├── weatherCodes.ts       ← WMO code → description map
│   │   └── cache.ts              ← generic TTL cache
│   ├── routes/
│   │   └── proxy.ts              ← all proxy route handlers
│   └── middleware/
│       └── logger.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd Desktop
mkdir day-068-api-proxy
cd day-068-api-proxy
mkdir -p src/types src/services src/routes src/middleware
```

Copy all files, then:

```bash
npm install
npm run dev
```

## Testing Step by Step

All tests work in the browser — no Postman needed:

1. `http://localhost:3000/proxy/weather/lagos` — live Lagos weather
2. `http://localhost:3000/proxy/weather/abuja` — Abuja weather
3. Hit Lagos again immediately — `"cached": true`, instant response
4. `http://localhost:3000/proxy/weather` — list all available cities
5. `http://localhost:3000/proxy/country/nigeria` — Nigeria's data (languages, currencies, flag)
6. `http://localhost:3000/proxy/country/ghana` — Ghana
7. `http://localhost:3000/proxy/exchange/NGN` — how many of everything 1 Naira buys
8. `http://localhost:3000/proxy/exchange/USD` — USD rates including NGN rate
9. `http://localhost:3000/proxy/cache` — see all 3+ cache entries with expiry times
10. In Postman: DELETE `http://localhost:3000/proxy/cache` — clear cache
11. Hit /proxy/weather/lagos again — `"cached": false`, re-fetches live

Watch the terminal — cache HITs and upstream requests are logged with [PROXY] prefix.

## What I Learned

- An API proxy separates concerns — the client never needs to know which external API is being called, what the key is, or what the raw response looks like
- Per-route TTL caching is more efficient than a single TTL — weather needs freshness every 10 minutes while country data is fine for 24 hours
- 502 Bad Gateway is the correct status when your server successfully received the request but the upstream API it depends on failed — not 500 (which means your server crashed)
- Response transformation is a core proxy responsibility — external APIs often return 50+ fields when you only need 8. Stripping the response makes your API faster and simpler for clients
- Redirecting /proxy/exchange to /proxy/exchange/USD with res.redirect() is cleaner than duplicating handler logic
- WMO weather codes are integers that map to human-readable descriptions — without this mapping the API would return useless numbers like `weatherCode: 63`

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 68 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 15, 2025 |
| Previous | [Day 67 — Ethical Scraper](../day-067-ethical-scraper) |
| Next | [Day 69 — Rate Limiter Middleware](../day-069-rate-limiter) |

Part of my 300 Days of Code Challenge!
