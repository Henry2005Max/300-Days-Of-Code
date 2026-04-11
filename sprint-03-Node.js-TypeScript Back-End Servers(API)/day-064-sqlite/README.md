# Day 64: SQLite with better-sqlite3

## Description

The same Student Records API from Day 63 rebuilt with a real SQLite database. Data now persists between server restarts. The database file is created automatically on first run. Introduces migrations, transactions, prepared statements, SQL injection prevention, and the SQLite integer boolean pattern.

## What changed from Day 63

| Day 63 | Day 64 |
|--------|--------|
| Data in a JS array | Data in a `.db` file on disk |
| Array methods (.find, .push) | SQL queries (SELECT, INSERT, UPDATE, DELETE) |
| Data lost on restart | Data survives restarts |
| No duplicate protection | UNIQUE constraint on email column |
| Manual ID counter | AUTOINCREMENT primary key |

## Features

- SQLite database created at `./data/students.db` on first run
- runMigrations() creates the students table with CREATE TABLE IF NOT EXISTS
- seedData() inserts 10 students if the table is empty, skips if already populated
- WAL journal mode enabled for better concurrent read/write performance
- Prepared statements with named parameters prevent SQL injection
- db.transaction() wraps seed inserts — all succeed or all roll back
- Dynamic WHERE clause builder for GET /students filters
- SQLite UNIQUE constraint on email — returns 409 on duplicate
- SQLITE_CONSTRAINT_UNIQUE error code caught and returned as clean 409
- result.lastInsertRowid used to fetch newly created row after INSERT
- result.changes used to confirm UPDATE/DELETE affected a row
- toStudent() helper converts snake_case DB rows to camelCase API shape
- gdg_member stored as INTEGER (0/1) in SQLite, converted to boolean in response
- All Day 63 Zod validation and middleware carried forward

## Technologies Used

- Node.js
- TypeScript
- Express 4
- better-sqlite3
- Zod 3
- dotenv
- tsx

## Folder Structure

```
day-064-sqlite/
├── src/
│   ├── index.ts
│   ├── db/
│   │   └── database.ts     ← open DB, runMigrations(), seedData()
│   ├── schemas/
│   │   └── student.ts
│   ├── types/
│   │   └── index.ts        ← StudentRow, Student, toStudent()
│   ├── routes/
│   │   └── students.ts     ← CRUD using SQL
│   └── middleware/
│       ├── validate.ts
│       └── logger.ts
├── data/                   ← created automatically, contains students.db
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd Desktop
mkdir day-064-sqlite
cd day-064-sqlite
mkdir -p src/db src/schemas src/types src/routes src/middleware
```

Copy all files, then:

```bash
npm install
npm run dev
```

## Testing Step by Step

1. Run `npm run dev` — watch the terminal for migration and seed logs
2. Check that `data/students.db` file was created in your project folder
3. `http://localhost:3000/students` — 10 students from the database
4. `http://localhost:3000/students/stats` — aggregate stats via SQL GROUP BY
5. POST a new student in Postman — restart the server — GET /students again — new student is still there ← this is the key difference from Day 63
6. Try POST with a duplicate email — expect 409 Conflict
7. PUT /students/1 with `{ "level": "Advanced" }` — only that field changes
8. DELETE /students/10 — restart server — student stays deleted

## What I Learned

- SQLite stores data in a single `.db` file on disk — no server process needed
- CREATE TABLE IF NOT EXISTS is safe to run on every server start, it won't overwrite existing data
- better-sqlite3 is synchronous unlike most Node.js database libraries, queries block until complete, which is simpler to reason about
- Prepared statements with named parameters (@name, @email) are the correct way to pass user data into SQL — never use string concatenation to build queries
- db.transaction() wraps multiple operations so they either all succeed or all roll back
- SQLite has no boolean column type, booleans are stored as INTEGER 0 or 1 and must be converted when reading
- result.lastInsertRowid gives you the auto generated ID of the newly inserted row so you can immediately fetch the full record
- SQLITE_CONSTRAINT_UNIQUE is the error code thrown when a UNIQUE constraint is violated, catching this specific code lets you return a clean 409 instead of a 500

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 64 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 11, 2025 |
| Previous | [Day 63 — Zod Validation](../day-063-zod-validation) |
| Next | [Day 65 — JWT Authentication](../day-065-jwt-auth) |

Part of my 300 Days of Code Challenge!
