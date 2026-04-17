# Day 70: Review — Comprehensive Error Handling

## Description

Sprint 3 review day. Builds a fully hardened Express server combining everything from Days 61–69 with production-grade error handling throughout. Custom error class hierarchy, asyncHandler wrapper for async routes, centralized error formatter, process-level crash handlers, and graceful shutdown.

## The Problem with Basic Error Handling

Every previous Sprint 3 server had this:
```ts
app.use((err, req, res, next) => {
  res.status(500).json({ error: "Internal server error" });
});
```

This is incomplete — it doesn't distinguish error types, loses context, sends 500 for everything, and silently swallows async errors.

## The Solution

```
throw new NotFoundError("Student", id)
  → asyncHandler catches it
  → next(err) forwards to errorHandler
  → errorHandler reads err.statusCode (404), err.code ("NOT_FOUND")
  → sends { success: false, code: "NOT_FOUND", error: "Student with ID '999' not found" }
```

## Features

- AppError base class with statusCode, code, isOperational, details
- 8 specific error subclasses: BadRequest, Unauthorized, Forbidden, NotFound, Conflict, Validation, RateLimit, Upstream
- asyncHandler(fn) — wraps async route handlers, catches throws and forwards to errorHandler
- Centralized errorHandler — handles AppError, ZodError, JSON parse errors, and unknown errors
- notFoundHandler — clean 404 for unmatched routes
- validate() middleware now throws ValidationError instead of responding directly
- process.on("unhandledRejection") — catches unawaited rejected Promises
- process.on("uncaughtException") — catches synchronous throws outside try/catch
- process.on("SIGTERM") — graceful shutdown, finishes in-flight requests before closing
- isOperational flag: operational errors log just the message, programmer errors log the full stack trace
- Full stack trace included in development responses, stripped in production
- /demo/* routes to trigger every error type for testing

## Technologies Used

- Node.js
- TypeScript
- Express 4
- Zod
- dotenv
- tsx

## Folder Structure

```
day-070-error-handling/
├── src/
│   ├── index.ts                     ← server + process-level handlers
│   ├── errors/
│   │   └── AppError.ts              ← error class hierarchy
│   ├── types/
│   │   └── index.ts
│   ├── data/
│   │   └── students.ts
│   ├── routes/
│   │   ├── students.ts              ← CRUD using asyncHandler + custom errors
│   │   └── demo.ts                  ← routes to trigger every error type
│   └── middleware/
│       ├── errorHandler.ts          ← asyncHandler, errorHandler, notFoundHandler
│       ├── validate.ts              ← throws ValidationError instead of responding
│       └── logger.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd Desktop
mkdir day-070-error-handling
cd day-070-error-handling
mkdir -p src/errors src/types src/data src/routes src/middleware
```

Copy all files, then:

```bash
npm install
npm run dev
```

## Testing Step by Step

### Browser — trigger every error type:

1. `http://localhost:3000/demo` — see all available demo routes
2. `http://localhost:3000/demo/400` — Bad Request
3. `http://localhost:3000/demo/401` — Unauthorized
4. `http://localhost:3000/demo/404` — Not Found
5. `http://localhost:3000/demo/422` — Validation Error with field details
6. `http://localhost:3000/demo/429` — Rate Limited with retryAfterSeconds
7. `http://localhost:3000/demo/502` — Upstream Error
8. `http://localhost:3000/demo/500` — Programmer error (non-AppError)
9. `http://localhost:3000/demo/async-error` — async error caught by asyncHandler
10. `http://localhost:3000/students/abc` — 400 (non-numeric ID)
11. `http://localhost:3000/students/999` — 404 (ID not found)
12. `http://localhost:3000/missing-route` — 404 from notFoundHandler

### Compare error responses:
- Every error has: success, code, error
- AppErrors include details when present
- 500 in development includes message and stack
- 500 in production only shows "An unexpected error occurred"

### Postman:
- POST /students with invalid body (e.g. age: "old") → 422 with field-level details
- POST /students with duplicate email → 409 Conflict

## What I Learned

- Express silently swallows errors thrown inside async route handlers — asyncHandler wraps the function in Promise.resolve().catch(next) to forward them correctly
- Extending the Error class in TypeScript requires Object.setPrototypeOf(this, new.target.prototype) to restore the prototype chain — without it, instanceof checks fail
- The isOperational flag separates expected errors (bad user input, not found) from programmer bugs — operational errors only log the message, bugs log the full stack trace
- process.on("unhandledRejection") and process.on("uncaughtException") are the last line of defence for errors that escape all other handlers — always register these in production servers
- Graceful shutdown with process.on("SIGTERM") lets in-flight requests complete before the server closes — without it, a deployment would immediately drop active connections
- Centralizing all error formatting in one middleware keeps every route handler clean — they just throw and let the error handler deal with formatting and status codes

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 70 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 17, 2025 |
| Previous | [Day 69 — Rate Limiter](../day-069-rate-limiter) |
| Next | [Day 71 — WebSocket Chat API](../day-071-websockets) |

Part of my 300 Days of Code Challenge!
