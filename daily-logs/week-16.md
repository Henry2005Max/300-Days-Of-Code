## Day 105 - May 24

**Project:** Budget Tracker CLI
**Time Spent:** 3 hours

### What I Built

Built a full CRUD budget tracking CLI with six commands — `add`, `list`, `summary`, `budget`, `delete`, `export` — backed by SQLite via `better-sqlite3`. The database has two tables: `transactions` with a check constraint ensuring amount is positive and type is either `income` or `expense`, and `budgets` with a `UNIQUE (category, month_year)` constraint enabling clean upsert with `ON CONFLICT DO UPDATE`. Both tables use WAL journal mode for concurrent read safety.

The monthly summary command is the centrepiece — it pulls three queries: a monthly totals summary, per-category totals, and a running balance computed entirely in SQL using `SUM(CASE WHEN type='income' THEN amount ELSE -amount END) OVER (ORDER BY date, id)`. The category breakdown renders spending bars colour-coded by budget usage — green below 80%, amber 80–100%, red over budget. The multi-month overview shows every month recorded in the database with income, expenses, and net balance on one line.

CLI argument parsing is done manually from `process.argv` — flags like `--month=2025-01` are split on `=`, and positional args for the `add` command detect whether the last token is a date by testing against `/^\d{4}-\d{2}-\d{2}$/`. The CSV exporter handles fields with commas and embedded quotes using the standard doubling convention. A seed script loads 31 realistic Nigerian household transactions across two months with eight budget limits.

### What I Learned

- SQLite window functions (`SUM OVER (ORDER BY date, id)`) work identically in `better-sqlite3` to PostgreSQL — running balance computation belongs in SQL, not in application code
- `UNIQUE (category, month_year)` on a composite key + `ON CONFLICT (category, month_year) DO UPDATE SET limit_amount = @limit` is a one-statement upsert — no SELECT-then-INSERT needed
- `process.argv` is `[node_binary, script_path, command, ...args]` — command starts at index 2
- `strftime('%Y-%m', date)` in SQLite extracts the year-month from a text date column stored as `YYYY-MM-DD` — no date library needed for monthly grouping
- Detecting a date in positional args with a regex test allows flexible argument ordering without requiring a full CLI parsing library
- CSV double-quote escaping (`field.replace(/"/g, '""')`) is the RFC 4180 standard — backslash escaping is not standard CSV

### Resources Used

- [better-sqlite3 documentation](https://github.com/WiseLibs/better-sqlite3)
- [SQLite window functions](https://www.sqlite.org/windowfunctions.html)
- [SQLite strftime](https://www.sqlite.org/lang_datefunc.html)
- [RFC 4180 CSV format](https://www.rfc-editor.org/rfc/rfc4180)
