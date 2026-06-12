# Day 115: Budget Tracker v2

## Description

A multi-user personal finance tracker built on top of the Day 105 Budget
Tracker CLI. Where the original tracked a single person's spending,
v2 supports multiple users with their own categories and transactions,
and introduces **recurring transactions** — salaries, rent, subscriptions,
and other regular payments that automatically generate new transactions
when they fall due.

## What's New

Compared to the Day 105 Budget Tracker, this version adds:

- **Multi-user support** — every category, transaction, and recurring
  entry belongs to a specific user, enforced with foreign keys and
  `ON DELETE CASCADE`.
- **Recurring transactions** — define a salary, rent, or subscription
  once with a frequency (`daily`, `weekly`, `monthly`, `yearly`), and the
  `process-recurring` command generates real transactions for every due
  occurrence, advancing the next due date each time.
- **Running balance via window function** — `list-transactions` shows a
  `SUM() OVER (PARTITION BY user_id ORDER BY date, id)` running balance
  for each user, so you can see the balance evolve transaction by
  transaction.
- **Monthly summaries** — income vs. expense totals, net balance, and a
  per-category breakdown for any `YYYY-MM` month.
- **CSV export** — dump a user's full transaction history (with running
  balance) to a CSV file using `csv-stringify`.

## Features

- 👥 Multi-user accounts with unique emails
- 🏷️ Per-user income/expense categories
- 💰 Transactions with amount, type, description, and date
- 🔁 Recurring transactions with daily/weekly/monthly/yearly frequency and optional end date
- ⚙️ `process-recurring` engine that backfills any missed occurrences
- 📊 Running balance per transaction using SQL window functions
- 📅 Monthly summary with category breakdown
- 📤 CSV export of full transaction history
- 🌱 `seed` command with realistic Nigerian demo data
- 🎨 Color-coded terminal output with Chalk

## Technologies Used

- **Node.js** + **TypeScript**
- **better-sqlite3** — synchronous SQLite driver with lazy connection init
- **csv-stringify** — CSV export
- **chalk** — colored terminal output
- **dotenv** — environment configuration
- **tsx** — TypeScript dev runner

## Folder Structure

```
day-115-budget-tracker-v2/
├── .env
├── tsconfig.json
├── package.json
├── data/                       (SQLite database file lives here)
├── exports/                    (CSV exports land here)
└── src/
    ├── index.ts                 # CLI entry point / command router
    ├── seed.ts                  # Demo data seeder
    ├── types/
    │   └── index.ts             # Shared TypeScript interfaces
    ├── db/
    │   ├── connection.ts        # Lazy SQLite connection (singleton)
    │   └── schema.ts            # CREATE TABLE statements
    ├── models/
    │   ├── userModel.ts
    │   ├── categoryModel.ts
    │   ├── transactionModel.ts
    │   └── recurringModel.ts
    ├── services/
    │   ├── recurringProcessor.ts
    │   ├── summaryService.ts
    │   └── exportService.ts
    └── utils/
        └── display.ts           # Console formatting helpers
```

## Installation

```bash
cd ~/Desktop/300-Days-Of-Code/sprint-04-data/day-115-budget-tracker-v2
npm install
```

## How to Run

```bash
# Development (auto-restarts on file changes)
npm run dev -- <command> [args...]

# Production build
npm run build
npm start <command> [args...]
```

All commands:

```
add-user <name> <email>
list-users
add-category <userId> <name> <income|expense>
list-categories <userId>
add-transaction <userId> <categoryId> <amount> <income|expense> <description> [date]
add-recurring <userId> <categoryId> <amount> <income|expense> <description> <daily|weekly|monthly|yearly> <startDate> [endDate]
list-recurring <userId>
process-recurring [asOfDate]
list-transactions <userId> [--from=YYYY-MM-DD] [--to=YYYY-MM-DD]
summary <userId> <YYYY-MM>
export-csv <userId> <filename>
seed
```

## Testing Step by Step

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Seed demo data** (creates Chidinma Okafor and Tunde Balogun with
   categories, past transactions, and recurring entries):

   ```bash
   npm run dev -- seed
   ```

3. **List users to confirm they were created**

   ```bash
   npm run dev -- list-users
   ```

   You should see `[1] Chidinma Okafor` and `[2] Tunde Balogun`.

4. **List Chidinma's categories**

   ```bash
   npm run dev -- list-categories 1
   ```

   Expect Salary and Freelance (income), and Rent, Transport, Feeding,
   Data & Airtime (expense).

5. **List her transactions with running balance**

   ```bash
   npm run dev -- list-transactions 1
   ```

   Each row shows the date, category, type, signed amount, and a running
   balance that grows with income and shrinks with expenses.

6. **Add a one-off transaction**

   ```bash
   npm run dev -- add-transaction 1 3 15000 expense "June rent top-up" 2025-06-03
   ```

   Replace `3` with whichever category id is Rent for user 1 (check the
   output of step 4).

7. **Add a new recurring transaction**

   ```bash
   npm run dev -- add-recurring 1 2 75000 income "Monthly retainer - Potio Beauty" monthly 2025-06-10
   ```

8. **List recurring transactions**

   ```bash
   npm run dev -- list-recurring 1
   ```

   Confirm the new retainer appears with `next: 2025-06-10` and
   `[active]`.

9. **Process recurring transactions as of a future date**

   ```bash
   npm run dev -- process-recurring 2025-07-15
   ```

   This should generate the monthly salary and retainer transactions for
   June and July (and the weekly data bundle for every Friday in between),
   printing each generated transaction with its date and amount.

10. **Re-run list-transactions to confirm the new entries**

    ```bash
    npm run dev -- list-transactions 1
    ```

    The recurring transactions from step 9 should now appear, each
    tagged `(recurring)` in the description, with the running balance
    updated accordingly.

11. **Generate a monthly summary**

    ```bash
    npm run dev -- summary 1 2025-06
    ```

    Expect total income, total expense, net balance, and a category
    breakdown for June 2025.

12. **Export to CSV**

    ```bash
    npm run dev -- export-csv 1 chidinma-transactions.csv
    ```

    Check `exports/chidinma-transactions.csv` — it should contain a
    header row followed by every transaction with its running balance.

13. **Run the same flow for the second user (Tunde, id 2)** to confirm
    user isolation — his transactions, categories, and balances should be
    completely independent of Chidinma's.

## What I Learned

- How to model a **multi-tenant** schema in SQLite using a `user_id`
  foreign key on every child table, with `ON DELETE CASCADE` so deleting
  a user cleans up their categories, transactions, and recurring entries
  automatically.
- Using `SUM(CASE WHEN ... THEN amount ELSE -amount END) OVER (PARTITION
  BY user_id ORDER BY date, id)` to compute a **running balance per user**
  directly in SQL, without looping in application code.
- Designing a **recurring transaction engine**: storing `next_due_date`
  on each recurring record, and looping `getDueRecurring()` →
  `createTransaction()` → advance date until nothing is due, so gaps
  (e.g. the user hasn't run the CLI in weeks) get backfilled correctly.
- Calculating date offsets for `daily` / `weekly` / `monthly` / `yearly`
  frequencies with native `Date` methods, and the edge cases around
  month-length differences when adding a month.
- Using `strftime('%Y-%m', date)` in SQLite to group and filter
  transactions by calendar month for the summary report.
- Keeping the **lazy database initialization pattern** from earlier days
  — `getDb()` only opens the connection and runs schema migrations on
  first use, never at module load time, which keeps `seed.ts` and the
  models side-effect free until actually called.
- Structuring CLI argument parsing to separate **positional arguments**
  from **`--flag=value` options** (used for `--from` / `--to` date
  filters on `list-transactions`), reusable across future CLI days.

## Challenge Info

| Field | Value |
|-------|-------|
| Day | 115 |
| Sprint | 4 — Data Engineering & Databases |
| Date | June 7, 2025 |
| Previous | [Day 114 - Log Parser v2](../day-114-log-parser-2) |
| Next | Day 116 — Redis caching layer on an Express API |

Part of my 300 Days of Code Challenge!
