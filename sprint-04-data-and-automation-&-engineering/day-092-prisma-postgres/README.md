# Day 92: Prisma ORM with PostgreSQL

A schema-first Node.js + TypeScript project using Prisma ORM to model a multi-table e-commerce database, run migrations, seed realistic Nigerian data, and execute relational analytics queries — all with full type safety from Prisma Client.

## What's New

First Prisma project in the challenge. Introduces schema-first database design via `prisma/schema.prisma`, type-safe query building through Prisma Client, and `prisma migrate dev` for version-controlled SQL migrations. Covers relations (one-to-many, many-to-many via join table), groupBy aggregations, nested includes, and filtered queries — none of which require writing raw SQL.

## Features

- Multi-table schema: users, categories, products, orders, order_items with full relations
- OrderStatus enum enforced at the database level
- Prisma migrations — generates and runs SQL automatically from schema changes
- Nigerian dataset seeder: 15 users, 30 products across 6 categories, 20 orders
- Five analytics queries: all orders, top products by revenue, top customers by spend, category revenue breakdown, low stock alerts
- Lazy Prisma Client singleton — instantiated once, never at module load
- Parallel query execution with `Promise.all` across all analytics
- Naira-formatted (NGN) terminal output with aligned tabular layout

## Technologies Used

- Node.js + TypeScript
- `@prisma/client` — type-safe ORM and query builder
- `prisma` — schema management and migration runner
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-092-prisma-orm/
├── prisma/
│   └── schema.prisma       # Data model, relations, enums
├── src/
│   ├── db/
│   │   └── client.ts       # Lazy PrismaClient singleton
│   ├── queries/
│   │   └── analytics.ts    # All Prisma query functions
│   ├── seeder/
│   │   └── seed.ts         # Nigerian data seeder
│   ├── services/
│   │   └── printer.ts      # Terminal report formatter
│   ├── types/
│   │   └── index.ts        # Interfaces for query return shapes
│   └── index.ts            # Main entry — runs all queries
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-092-prisma-orm
npm install
```

## How to Run

```bash
# Step 1 — create the database
createdb prisma_store

# Step 2 — update DATABASE_URL in .env to match your postgres credentials

# Step 3 — run Prisma migration (creates all tables)
npm run db:migrate

# Step 4 — generate Prisma Client
npm run db:generate

# Step 5 — seed the database
npm run seed

# Step 6 — run analytics report
npm run run:queries
```

## Testing Step by Step

1. **Confirm PostgreSQL is running:**
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

2. **Create the database:**
   ```bash
   createdb prisma_store
   ```

3. **Set your connection string in `.env`:**
   ```
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/prisma_store
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Run the migration** — this generates SQL and applies it:
   ```bash
   npm run db:migrate
   ```
   When prompted for a migration name, it uses `init` automatically.

6. **Generate Prisma Client** (syncs TypeScript types to schema):
   ```bash
   npm run db:generate
   ```

7. **Seed the database:**
   ```bash
   npm run seed
   ```
   You should see category → product → user → order seeding logs.

8. **Run the analytics report:**
   ```bash
   npm run run:queries
   ```

9. **Inspect the database visually with Prisma Studio:**
   ```bash
   npm run db:studio
   ```
   Opens a browser UI at `localhost:5555` showing all tables and records.

10. **Reset and re-seed at any time:**
    ```bash
    npm run db:reset
    npm run seed
    npm run run:queries
    ```

## What I Learned

- Prisma schema uses `@relation` to define foreign keys — Prisma handles the JOIN SQL automatically in `include` queries
- `prisma.model.groupBy()` works like SQL `GROUP BY` — requires `by`, `_sum`, `_count`, `_avg` aggregation fields
- `@map` in the schema renames the TypeScript field while keeping snake_case in the database column
- `@@map` at the model level renames the table — models use PascalCase in Prisma, snake_case in PostgreSQL
- Prisma Client types are auto-generated after `prisma generate` — never edit them manually
- `findMany` with nested `include` produces a single query with JOINs, not N+1 queries
- Enums defined in `schema.prisma` are enforced at the DB level as PostgreSQL enum types
- `Decimal` fields from Prisma come back as `Decimal` objects, not plain numbers — always wrap with `Number()` before arithmetic
- `prisma migrate dev` both generates the SQL migration file and applies it in one command
- Prisma Studio (`prisma studio`) is a zero-config admin UI — genuinely useful for debugging seed data

## Challenge Info

| Field    | Detail                              |
|----------|-------------------------------------|
| Day      | 92                                  |
| Sprint   | 4 — Data Engineering & Databases    |
| Date     | 2025-01-06                          |
| Previous | [Day 91](../day-091-csv-analyzer)   |
| Next     | [Day 93](../day-093-data-viz)       |

Part of my 300 Days of Code Challenge!
