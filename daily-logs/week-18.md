## Day 115 - June 12

**Project:** Budget Tracker v2
**Time Spent:** 3.5 hours

### What I Built

Today I extended the Day 105 Budget Tracker into a multi-user system with
recurring transactions. The database schema now has four tables — users,
categories, transactions, and recurring_transactions — all wired together
with foreign keys and `ON DELETE CASCADE`, so every category and
transaction is scoped to a specific user.

The big new piece is the recurring transaction engine. Each recurring
entry stores its frequency (daily, weekly, monthly, yearly), a
`next_due_date`, and an optional `end_date`. The `process-recurring`
command finds everything due as of a given date, creates a matching
transaction for it, advances `next_due_date` by one interval, and repeats
until nothing is left due — so if I haven't run the CLI in a while, it
backfills every missed occurrence instead of just the most recent one.

I also added a running balance to `list-transactions` using a SQL window
function (`SUM() OVER (PARTITION BY user_id ORDER BY date, id)`), a
monthly summary command that breaks income/expense down by category, and
a CSV export using `csv-stringify`. Seeded the database with two demo
users — Chidinma Okafor and Tunde Balogun — with realistic Nigerian
transaction data to test everything end to end.

### What I Learned

- Modeling multi-tenant data in SQLite with `user_id` foreign keys and cascading deletes
- Computing running balances with `SUM() OVER (PARTITION BY ... ORDER BY ...)`
- Designing a recurring-transaction engine that backfills missed occurrences via a `next_due_date` loop
- Handling date math for daily/weekly/monthly/yearly intervals with native `Date`
- Grouping and filtering by month with SQLite's `strftime('%Y-%m', date)`
- Splitting CLI args into positional values and `--flag=value` options for date-range filters

### Resources Used

- [better-sqlite3 documentation](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [SQLite window functions](https://www.sqlite.org/windowfunctions.html)
- [SQLite date and time functions](https://www.sqlite.org/lang_datefunc.html)
- [csv-stringify documentation](https://csv.js.org/stringify/)

### Tomorrow

Day 116 — Redis caching layer on top of an Express API: building an API
that caches expensive query results in Redis, with TTL-based invalidation
and cache-hit/miss logging.
