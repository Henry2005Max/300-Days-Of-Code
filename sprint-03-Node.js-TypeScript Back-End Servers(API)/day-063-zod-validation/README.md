# Day 63: REST API with Zod Validation

## Description

A Student Records REST API that introduces Zod schema validation. Instead of manual if-checks for every field, Zod schemas define the exact shape, types, and constraints of valid data. A reusable validate() middleware factory applies schemas before route handlers run — handlers only execute if data is valid. All 10 sample students are Nigerian GDG-themed developers.

## What is Zod?

Zod is a TypeScript-first schema validation library. You define a schema once and get:
- Runtime validation with detailed per-field error messages
- TypeScript types auto-generated via `z.infer<typeof Schema>`
- Data transformation (trim, lowercase, defaults) built into the schema
- `safeParse()` that returns a result object instead of throwing

## Features

- CreateStudentSchema — validates name, email, age (16–60), track (enum), level (enum), city, gdgMember
- UpdateStudentSchema — `.partial()` makes all fields optional for updates
- StudentQuerySchema — validates and transforms query parameters including string "true" → boolean
- validate() middleware factory — validates req.body against any Zod schema before the handler runs
- validateQuery() middleware — same pattern for req.query
- GET /students — filter by track, level, city, gdgMember (query validation via Zod)
- GET /students/stats — aggregate stats: total, GDG count, average age, breakdowns by track and level
- GET /students/:id — single student by ID
- POST /students — Zod-validated body, duplicate email check, 201 Created
- PUT /students/:id — partial update, email clash check
- DELETE /students/:id — removes student, returns deleted record
- z.infer<> used to derive TypeScript types directly from schemas — no duplicate type definitions
- Consistent ApiResponse<T> shape across all endpoints

## Technologies Used

- Node.js
- TypeScript
- Express 4
- Zod 3
- dotenv
- tsx

## Folder Structure

```
day-063-zod-validation/
├── src/
│   ├── index.ts
│   ├── schemas/
│   │   └── student.ts      ← Zod schemas + z.infer types
│   ├── types/
│   │   └── index.ts        ← Student interface, ApiResponse<T>
│   ├── data/
│   │   └── students.ts     ← 10 Nigerian developer students
│   ├── routes/
│   │   └── students.ts     ← CRUD handlers using validate() middleware
│   └── middleware/
│       ├── validate.ts     ← validate() and validateQuery() factories
│       └── logger.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd Desktop
mkdir day-063-zod-validation
cd day-063-zod-validation
mkdir -p src/schemas src/types src/data src/routes src/middleware
```

Copy all files, then:

```bash
npm install
npm run dev
```

## Testing Step by Step

### Browser:
1. `http://localhost:3000/students` — all 10 students
2. `http://localhost:3000/students?track=Mobile` — Mobile track only
3. `http://localhost:3000/students?level=Advanced&track=Web` — combined filters
4. `http://localhost:3000/students?gdgMember=true` — GDG members only
5. `http://localhost:3000/students/stats` — aggregate stats
6. `http://localhost:3000/students/3` — single student
7. `http://localhost:3000/students/999` — 404

### Postman — test Zod validation:

**Valid POST:**
```json
{
  "name": "Biodun Salami",
  "email": "biodun@example.com",
  "age": 23,
  "track": "Web",
  "level": "Intermediate",
  "city": "Lagos",
  "gdgMember": true
}
```
Expect: 201 Created

**Invalid POST — see Zod errors per field:**
```json
{
  "name": "B",
  "email": "not-an-email",
  "age": 14,
  "track": "Blockchain",
  "level": "Expert"
}
```
Expect: 400 with errors array showing exactly which fields failed and why

**Partial PUT:**
- PUT /students/1 with body `{ "level": "Advanced" }`
- Expect: 200, only level updated, all other fields unchanged

## What I Learned

- Zod's .safeParse() returns { success, data } or { success, error } — never throws, making it safe to use in middleware without try/catch
- A middleware factory is a function that returns a middleware function — validate(schema) returns (req, res, next) => void, which lets you pass different schemas to the same middleware logic
- z.infer<typeof Schema> generates a TypeScript type from a Zod schema — no need to define the interface separately, they stay in sync automatically
- .partial() on a Zod schema makes every field optional — the standard pattern for update/PATCH schemas
- .transform() in a Zod schema runs after validation and converts the value — perfect for converting query param strings to booleans or numbers
- Replacing req.body with result.data inside the middleware means transformations (.trim(), .toLowerCase(), .default()) are applied before the handler sees the data

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 63 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 10, 2025 |
| Previous | [Day 62 — Express API Endpoints](../day-062-express-api) |
| Next | [Day 64 — SQLite with better-sqlite3](../day-064-sqlite) |

Part of my 300 Days of Code Challenge!
