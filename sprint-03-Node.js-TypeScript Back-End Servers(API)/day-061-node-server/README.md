# Day 61: Node/TypeScript Hello World Server

## Description

The first back-end project of Sprint 3. An Express + TypeScript HTTP server with multiple routes, a request logger middleware, environment variable configuration with dotenv, a health check endpoint, a 404 handler, and a global error handler. This is the foundation structure every subsequent Sprint 3 server builds on.

## Features

- Express server running on a configurable PORT from .env
- GET / — API overview listing all available routes
- GET /health — server health check with uptime, memory usage, and Node version
- GET /hello — simple greeting response
- GET /hello/:name — personalised greeting using a URL route parameter
- POST /hello/echo — echoes back any JSON body you send
- Custom request logger middleware with colour-coded status codes in the terminal
- express.json() middleware for parsing incoming JSON request bodies
- 404 catch-all handler for unmatched routes
- Global error handler for unexpected server errors
- tsx watch for automatic server restart on file save in development
- Typed req/res handlers using @types/express

## Technologies Used

- Node.js
- TypeScript
- Express 4
- dotenv
- tsx (TypeScript executor for Node)

## Folder Structure

```
day-061-node-server/
├── src/
│   ├── index.ts              ← entry point, app setup, server start
│   ├── routes/
│   │   └── hello.ts          ← GET /hello, GET /hello/:name, POST /hello/echo
│   └── middleware/
│       └── logger.ts         ← request logger middleware
├── .env                      ← PORT, NODE_ENV, APP_NAME
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd Desktop
mkdir day-061-node-server
cd day-061-node-server
```

Copy all files maintaining the folder structure above, then:

```bash
npm install
```

## How to Run

```bash
npm run dev
```

You will see this in your terminal:

```
┌──────────────────────────────────────┐
│  Day61Server running                 │
│  http://localhost:3000               │
│  Day 61 · Sprint 3 · Lagos, Nigeria  │
└──────────────────────────────────────┘
```

The server is now running. Open your browser or Postman to test it.

## Testing Step by Step

### In your browser (GET requests only):

1. Open `http://localhost:3000/` — see the API overview with all routes listed
2. Open `http://localhost:3000/health` — see uptime, memory, Node version
3. Open `http://localhost:3000/hello` — see the hello response
4. Open `http://localhost:3000/hello/Henry` — see personalised greeting
5. Open `http://localhost:3000/hello/Chidi` — change the name, response changes
6. Open `http://localhost:3000/anything-random` — see the 404 response

### In Postman (POST requests):

7. New request → method: POST → URL: `http://localhost:3000/hello/echo`
8. Body tab → raw → JSON → enter: `{"name": "Henry", "city": "Lagos"}`
9. Send → see your data echoed back with keys listed
10. Send with an empty body → see the 400 error response

### Watch the terminal:
Every request you make prints a log line like:
```
2025-04-08T... GET    /health                   200 2ms
2025-04-08T... GET    /hello/Henry              200 1ms
2025-04-08T... POST   /hello/echo               200 3ms
2025-04-08T... GET    /missing-page             404 1ms
```

## What I Learned

- Express middleware runs in order — express.json() must come before any route that reads req.body, and the 404 handler must come after all routes
- The 4-parameter function signature (err, req, res, next) is how Express identifies a global error handler — all four parameters must be present
- Route parameters (:name) capture URL segments into req.params — GET /hello/Henry puts "Henry" into req.params.name
- tsx watch restarts the server on every file save, the same way Vite hot-reloads the browser in Sprint 2
- dotenv must be imported before any other module that reads process.env, because other modules may read environment variables at import time
- The Router object lets you group related routes in separate files and mount them all under a prefix with app.use("/prefix", router)

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 61 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 8, 2025 |
| Previous | [Day 60 — Portfolio Dashboard](../day-060-portfolio-dashboard) |
| Next | [Day 62 — Express API Endpoints](../day-062-express-api) |

Part of my 300 Days of Code Challenge!
