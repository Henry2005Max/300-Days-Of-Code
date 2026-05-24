# Day 105: Budget Tracker CLI

A personal budget tracking CLI with SQLite that logs income and expenses by category, sets monthly spending limits, shows category breakdowns with budget usage bars, tracks a running balance, and exports to CSV. Six commands: `add`, `list`, `summary`, `budget`, `delete`, `export`.

## What's New

First full CRUD CLI project in Sprint 4. Introduces `better-sqlite3` window functions (`SUM OVER`) for running balance calculation, budget vs actual comparison bars with colour coding, flag-based CLI argument parsing without a CLI library, and CSV export with proper quote escaping.

## Features

- Add income and expense transactions with category, description, and date
- List transactions with filters: `--type`, `--month`, `--category`, `--limit`
- Monthly summary: total income, expenses, net balance, savings rate
- Per-category breakdown with spending bars — green/amber/red by budget usage
- Running balance computed with SQLite `SUM OVER (ORDER BY date, id)` window function
- Set budget limits per category per month — upsert on re-run
- Multi-month overview showing all months with net balance
- Delete transactions by ID
- Export all transactions to CSV with proper quoting
- Seed command loads 2 months of realistic Nigerian household budget data
- Colour-coded output — green for income, red for expenses

## Technologies Used

- Node.js + TypeScript
- `better-sqlite3` — SQLite with window functions, WAL mode
- `dotenv` — environment configuration
- `tsx` — TypeScript execution

## Folder Structure

```
day-105-budget-tracker/
├── data/
│   ├── budget.db               # SQLite database (created on first run)
│   └── exports/                # CSV export directory
├── src/
│   ├── commands/
│   │   ├── add.ts              # Add transaction
│   │   ├── budget.ts           # Set budget limit + delete transaction
│   │   ├── export.ts           # CSV export
│   │   ├── list.ts             # List with filters
│   │   └── summary.ts          # Monthly summary with bars
│   ├── db/
│   │   ├── seed.ts             # Nigerian sample data seeder
│   │   └── store.ts            # SQLite store with lazy init
│   ├── display/
│   │   └── help.ts             # Help text
│   ├── types/
│   │   └── index.ts            # Interfaces
│   └── index.ts                # CLI router
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-105-budget-tracker
npm install
```

## How to Run

```bash
# See all commands
npm run budget help

# Load sample data (2 months of Nigerian household budget)
npm run seed

# Monthly summary (current month)
npm run budget summary

# List recent transactions
npm run budget list

# Add a transaction
npm run budget add expense 45000 Food "Shoprite grocery run"

# Set a budget limit
npm run budget budget Food 65000

# Export to CSV
npm run budget export
```

## Testing Step by Step

1. **Install:**
   ```bash
   npm install
   ```

2. **Seed sample data:**
   ```bash
   npm run seed
   ```

3. **View the monthly summary:**
   ```bash
   npm run budget summary
   ```
   See income, expenses, net balance, savings rate, category bars, running balance.

4. **List all transactions:**
   ```bash
   npm run budget list
   ```

5. **Filter by type:**
   ```bash
   npm run budget list -- --type=expense --month=2025-01
   ```

6. **Add a transaction:**
   ```bash
   npm run budget add expense 12000 Transport "Uber to island"
   npm run budget add income 50000 Freelance "Dashboard project"
   ```

7. **Set a budget and re-run summary:**
   ```bash
   npm run budget budget Entertainment 15000
   npm run budget summary
   ```
   The Entertainment bar will now show a percentage and colour.

8. **Delete a transaction:**
   ```bash
   npm run budget list -- --limit=5
   npm run budget delete 3
   ```

9. **Export to CSV:**
   ```bash
   npm run budget export january-report
   cat ./data/exports/january-report.csv
   ```

10. **View last month's summary:**
    ```bash
    npm run budget summary -- 2025-01
    ```

## What I Learned

- SQLite window functions work in `better-sqlite3` — `SUM(CASE WHEN type='income' THEN amount ELSE -amount END) OVER (ORDER BY date, id)` computes a running balance directly in SQL without any application-side accumulation
- `UNIQUE (category, month_year)` constraint on the budgets table + `ON CONFLICT DO UPDATE SET` is the cleanest upsert pattern for replacing a budget limit
- `process.argv` is `[node, script, command, ...args]` — slicing at index 2 gives the command, index 3+ gives the args
- Detecting a date string in CLI args (`/^\d{4}-\d{2}-\d{2}$/.test(last)`) lets the same positional arg slot serve as either description continuation or date, keeping the UX simple
- SQLite `strftime('%Y-%m', date)` extracts the year-month from a `YYYY-MM-DD` text column — reliable for monthly grouping without any date library
- CSV export needs `"${field.replace(/"/g, '""')}"` quoting for fields that may contain commas or quotes — the doubling convention is the CSV standard, not backslash escaping

## Challenge Info

| Field    | Detail                                      |
|----------|---------------------------------------------|
| Day      | 105                                         |
| Sprint   | 4 — Data Engineering & Databases            |
| Date     | 2025-01-19                                  |
| Previous | [Day 104](../day-104-log-parser)            |
| Next     | [Day 106](../day-106-recipe-api)            |

Part of my 300 Days of Code Challenge!
