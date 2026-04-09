# Day 62: Express API Endpoints

## Description

A full REST API for Nigerian cities built with Express and TypeScript. Implements all four CRUD operations (Create, Read, Update, Delete) with proper HTTP status codes, query parameter filtering, a consistent API response shape, and input validation. Data lives in memory — no database yet.

## Features

- GET /cities — returns all 15 cities
- GET /cities?region=South-West — filter by geopolitical region
- GET /cities?capital=true — only state capitals
- GET /cities?search=lagos — search by name (case-insensitive)
- GET /cities/regions — region summary with city counts
- GET /cities/:id — single city by numeric ID
- POST /cities — create a new city with body validation and duplicate check
- PUT /cities/:id — update any fields on an existing city
- DELETE /cities/:id — remove a city, returns the deleted data
- Consistent ApiResponse<T> shape: { success, data, error, meta }
- Proper HTTP status codes: 200, 201, 400, 404, 409, 500
- Location header on POST response pointing to the new resource
- Generic TypeScript interface ApiResponse<T> for type-safe responses
- Same request logger and error handling structure from Day 61

## Technologies Used

- Node.js
- TypeScript
- Express 4
- dotenv
- tsx

## Folder Structure

```
day-062-express-api/
├── src/
│   ├── index.ts
│   ├── types/
│   │   └── index.ts        ← City interface, ApiResponse<T> generic
│   ├── data/
│   │   └── cities.ts       ← in-memory dataset, 15 Nigerian cities
│   ├── routes/
│   │   └── cities.ts       ← all CRUD route handlers
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
mkdir day-062-express-api
cd day-062-express-api
mkdir -p src/types src/data src/routes src/middleware
```

Copy all files, then:

```bash
npm install
npm run dev
```

## Testing Step by Step

### Browser (GET only):
1. `http://localhost:3000/` — API overview
2. `http://localhost:3000/cities` — all 15 cities
3. `http://localhost:3000/cities?region=South-West` — filtered by region
4. `http://localhost:3000/cities?capital=true` — state capitals only
5. `http://localhost:3000/cities?search=kano` — search by name
6. `http://localhost:3000/cities/regions` — region summary
7. `http://localhost:3000/cities/3` — single city (Kano)
8. `http://localhost:3000/cities/999` — 404 response

### Postman (POST, PUT, DELETE):

**POST — create a city:**
- Method: POST, URL: `http://localhost:3000/cities`
- Body → raw → JSON:
```json
{
  "name": "Calabar",
  "state": "Cross River",
  "region": "South-South",
  "population": 400000,
  "isCapital": true,
  "knownFor": "Carnival city and tourism hub of Nigeria"
}
```
- Expect: 201 Created, Location header set

**POST — missing fields:**
- Send body with only `{ "name": "Test" }`
- Expect: 400 with list of missing fields

**POST — duplicate:**
- Try to create Lagos again
- Expect: 409 Conflict

**PUT — update a city:**
- Method: PUT, URL: `http://localhost:3000/cities/1`
- Body: `{ "population": 16000000 }`
- Expect: 200 with updated city

**DELETE — remove a city:**
- Method: DELETE, URL: `http://localhost:3000/cities/15`
- Expect: 200 with the deleted city's data

## What I Learned

- Query parameters (req.query) are always strings — comparing ?capital=true requires string comparison, not boolean
- Specific routes (/cities/regions) must be defined before parameter routes (/cities/:id) otherwise Express matches "regions" as an :id value
- The 201 status code means Created — it should be used on POST when a resource is created, not 200
- The Location response header is a standard HTTP convention for telling the client where to find the newly created resource
- A generic TypeScript interface ApiResponse<T> lets you type-check the response shape while keeping it flexible — ApiResponse<City> vs ApiResponse<City[]> are both valid uses of the same interface
- req.params values are always strings even if the URL contains a number — Number() conversion and isNaN() check are required before using them as IDs

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 62 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 9, 2025 |
| Previous | [Day 61 — Node/TS Hello World Server](../day-061-node-server) |
| Next | [Day 63 — REST API with Zod Validation](../day-063-zod-validation) |

Part of my 300 Days of Code Challenge!
