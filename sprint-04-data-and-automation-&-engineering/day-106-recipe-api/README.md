# Day 106: Recipe REST API

A full Express REST API for recipes with SQLite persistence. Six endpoints covering full CRUD — list with search/filter/pagination, get by ID (with ingredients and steps), create, partial update, and delete. Seeded with 6 Nigerian dishes. Zod validates all incoming request bodies and query strings with structured error responses.

## Endpoints

| Method   | Path                     | Description                                              |
|----------|--------------------------|----------------------------------------------------------|
| `GET`    | `/api/recipes`           | List recipes — supports `?q`, `?category`, `?difficulty`, `?ingredient`, `?page`, `?pageSize` |
| `GET`    | `/api/recipes/categories`| All distinct categories                                  |
| `GET`    | `/api/recipes/:id`       | Full recipe with ingredients and steps                   |
| `POST`   | `/api/recipes`           | Create recipe                                            |
| `PATCH`  | `/api/recipes/:id`       | Partial update                                           |
| `DELETE` | `/api/recipes/:id`       | Delete recipe                                            |
| `GET`    | `/health`                | Health check                                             |

## What's New

First Express API in Sprint 4 continuation. Introduces SQLite foreign keys with `ON DELETE CASCADE` so deleting a recipe automatically removes its ingredients and steps, `better-sqlite3` transactions for atomic multi-table inserts, Zod coercion on query string numbers, and structured error responses from a centralized error handler.

## Features

- Full CRUD with proper HTTP status codes (201 for create, 204 for delete)
- Paginated list endpoint with search (`?q`), category, difficulty, and ingredient filters
- Ingredient search uses a subquery — `WHERE id IN (SELECT recipe_id FROM ingredients WHERE name LIKE ...)`
- `GET /api/recipes/:id` returns the full recipe including all ingredients and steps
- `PATCH` is partial — only supplied fields are updated, rest are kept from existing record
- Transactions for create and update — ingredients and steps are replaced atomically
- Zod validates bodies and query strings; validation errors return structured 400 responses
- `ON DELETE CASCADE` on ingredients and steps tables
- `WAL` mode and `foreign_keys = ON` pragmas
- 6 Nigerian recipes seeded: Jollof Rice, Egusi Soup, Suya, Pounded Yam, Moi Moi, Chin Chin

## Technologies Used

- Node.js + TypeScript
- Express 4
- `better-sqlite3` — synchronous SQLite
- `zod` — request validation and coercion
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-106-recipe-api/
├── data/
│   └── recipes.db              # SQLite database
├── src/
│   ├── app.ts                  # Express app setup
│   ├── db/
│   │   ├── seed.ts             # Nigerian recipe seeder
│   │   └── store.ts            # SQLite store with lazy init
│   ├── middleware/
│   │   └── errorHandler.ts     # Zod + generic error handler, 404 handler
│   ├── routes/
│   │   └── recipes.ts          # All six recipe endpoints
│   ├── schemas/
│   │   └── recipe.ts           # Zod schemas for create, update, pagination
│   ├── types/
│   │   └── index.ts            # Interfaces
│   └── index.ts                # Server entry point
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-106-recipe-api
npm install
```

## How to Run

```bash
# Seed Nigerian recipe data
npm run seed

# Start the API server
npm run dev
```

## Testing Step by Step

1. **Install and seed:**
   ```bash
   npm install
   npm run seed
   npm run dev
   ```

2. **List all recipes:**
   ```bash
   curl http://localhost:3000/api/recipes
   ```

3. **Search by name:**
   ```bash
   curl "http://localhost:3000/api/recipes?q=jollof"
   ```

4. **Filter by category:**
   ```bash
   curl "http://localhost:3000/api/recipes?category=Soup"
   ```

5. **Filter by ingredient:**
   ```bash
   curl "http://localhost:3000/api/recipes?ingredient=palm+oil"
   ```

6. **Get a full recipe with ingredients and steps:**
   ```bash
   curl http://localhost:3000/api/recipes/1
   ```

7. **Create a recipe:**
   ```bash
   curl -X POST http://localhost:3000/api/recipes \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Pepper Soup",
       "category": "Soup",
       "description": "Spicy Nigerian broth with catfish.",
       "servings": 4,
       "prepMins": 15,
       "cookMins": 30,
       "difficulty": "easy",
       "ingredients": [
         { "name": "Catfish", "quantity": "1", "unit": "kg" },
         { "name": "Pepper soup spice", "quantity": "2", "unit": "tbsp" }
       ],
       "steps": [
         { "stepNumber": 1, "instruction": "Clean and cut catfish into chunks." },
         { "stepNumber": 2, "instruction": "Boil with spices and season to taste." }
       ]
     }'
   ```

8. **Partial update — change only the difficulty:**
   ```bash
   curl -X PATCH http://localhost:3000/api/recipes/1 \
     -H "Content-Type: application/json" \
     -d '{ "difficulty": "hard" }'
   ```

9. **Delete a recipe:**
   ```bash
   curl -X DELETE http://localhost:3000/api/recipes/7
   ```

10. **Test validation error:**
    ```bash
    curl -X POST http://localhost:3000/api/recipes \
      -H "Content-Type: application/json" \
      -d '{ "name": "X" }'
    ```
    Returns a 400 with a structured Zod error response.

## What I Learned

- `foreign_keys = ON` pragma must be set after every new SQLite connection — it is off by default and does not persist between connections
- `ON DELETE CASCADE` requires foreign keys to be enabled — without the pragma, cascade deletions silently do nothing
- `better-sqlite3` transactions wrap multiple statements atomically — if the ingredient insert fails after recipe insert, the whole transaction rolls back cleanly
- Zod's `z.coerce.number()` handles query string values that arrive as strings — `?page=2` becomes `2` without manual `parseInt`
- `router.get('/categories', ...)` must be registered before `router.get('/:id', ...)` in Express — otherwise `/categories` matches the `:id` pattern
- Returning `204 No Content` for DELETE with `res.status(204).send()` is the correct HTTP semantics — `res.json({})` would return a body which is technically incorrect for 204

## Challenge Info

| Field    | Detail                                      |
|----------|---------------------------------------------|
| Day      | 106                                         |
| Sprint   | 4 — Data Engineering & Databases            |
| Date     | 2025-01-20                                  |
| Previous | [Day 105](../day-105-budget-tracker)        |
| Next     | [Day 107](../day-107-weather-alert)         |

Part of my 300 Days of Code Challenge!
