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

## Day 106 - May 25

**Project:** Recipe REST API
**Time Spent:** 3 hours

### What I Built

Built a full REST API for recipes using Express 4 and SQLite via `better-sqlite3`. Three tables — `recipes`, `ingredients`, and `steps` — with foreign keys and `ON DELETE CASCADE` so deleting a recipe atomically removes its related rows. Create and update operations use `better-sqlite3` transactions so the multi-table write is atomic. The list endpoint supports five query parameters: free-text search across name, description, and category; category filter; difficulty filter; ingredient search via a subquery; and pagination with page/pageSize.

Zod validates both request bodies and query strings. `z.coerce.number()` on pagination fields handles query string values arriving as strings without manual `parseInt`. The `UpdateRecipeSchema` is a partial of `CreateRecipeSchema`, meaning all fields are optional for PATCH — the route handler merges incoming fields with the existing record before updating, so a PATCH with only `{ "difficulty": "hard" }` updates just that one field. The centralized error handler catches `ZodError` instances and returns structured 400 responses with per-field messages.

Seeded the database with 6 authentic Nigerian recipes — Jollof Rice, Egusi Soup, Suya, Pounded Yam, Moi Moi, and Chin Chin — each with full ingredient lists including quantities and units, and step-by-step instructions. The `/api/recipes/:id` endpoint returns the full recipe object including all ingredients and steps in a single response.

### What I Learned

- `foreign_keys = ON` pragma must be set after every new `better-sqlite3` connection — it defaults to off and does not persist, so it belongs in the database initialization function
- `ON DELETE CASCADE` only works when foreign keys are enabled — without the pragma, cascade deletions silently do nothing instead of erroring, which can be confusing
- `router.get('/categories', ...)` must be registered before `router.get('/:id', ...)` in Express — route matching is first-match and `/categories` would otherwise match the `:id` parameter pattern
- `z.coerce.number()` in Zod converts string query parameters to numbers automatically — cleaner than calling `parseInt` in every route handler
- Returning HTTP 204 with `res.status(204).send()` for DELETE is correct — `res.json({})` sends a body which is technically invalid for 204 responses
- `better-sqlite3` transactions are synchronous functions — wrap multi-statement writes in `db.transaction(() => { ... })()` and the whole block rolls back on any error

### Resources Used

- [Express routing documentation](https://expressjs.com/en/guide/routing.html)
- [better-sqlite3 transactions](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#transactionfunction---function)
- [Zod coerce](https://zod.dev/?id=coercion-for-primitives)
- [HTTP 204 No Content](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/204)

## Day 107 - May 26

**Project:** Weather Alert System
**Time Spent:** 3 hours

### What I Built

Built a scheduled weather monitoring daemon that fetches current conditions for 6 Nigerian cities, evaluates each reading against configurable thresholds, stores every reading and triggered alert in SQLite, and prints a colour-coded terminal report. The system runs continuously on a cron schedule with `node-cron`, fires once immediately on startup, and supports a `REPORT_ONLY` mode that reads from the database and exits without fetching.

The alert evaluator checks five conditions per reading — heat, cold, humidity, wind, and rainfall — and classifies each triggered alert into three severity levels based on how far over threshold the value is: `info` for 0–5% over, `warning` for 5–15% over, `critical` for 15%+ over. This percentage-based approach scales cleanly across the different units (degrees, percent, km/h, mm) without needing separate threshold multipliers per type.

The mock data system assigns realistic baseline readings per city — Kano gets hot and dry values, Port Harcourt gets humid and rainy, Lagos gets moderate coastal conditions — then adds per-cycle random jitter of ±1 unit so repeated mock runs produce slightly different readings rather than identical values. The SQLite store uses the `MAX(fetched_at)` subquery join pattern for latest-per-city queries since SQLite doesn't support PostgreSQL's `DISTINCT ON`.

### What I Learned

- OpenWeatherMap returns wind speed in m/s — multiply by 3.6 to convert to km/h; rainfall is in mm and only present when it's raining so always default with `?.['1h'] ?? 0`
- Percentage-based severity (`value / threshold >= 1.15`) scales across different measurement units without needing per-type multipliers
- SQLite's `MAX(fetched_at)` subquery join is the equivalent of PostgreSQL's `DISTINCT ON (city_name) ORDER BY fetched_at DESC` — different syntax, same result
- Adding ±jitter to mock data makes demo output feel realistic — constant identical values look obviously fake when the cron fires multiple times
- Running the first monitoring cycle synchronously before starting the cron scheduler eliminates the awkward "nothing happens for X minutes" on first startup
- `data.rain?.['1h']` uses both optional chaining (field may not exist) and bracket notation (key is `'1h'`, not a valid identifier) — both are needed

### Resources Used

- [OpenWeatherMap Current Weather API](https://openweathermap.org/current)
- [node-cron documentation](https://github.com/node-cron/node-cron)
- [SQLite latest row per group pattern](https://www.sqlite.org/lang_select.html)
- [OpenWeatherMap condition codes](https://openweathermap.org/weather-conditions)

## Day 108 - May 27

**Project:** File Organizer CLI
**Time Spent:** 3 hours

### What I Built

Built a file organiser CLI with four commands — `preview`, `organize`, `history`, `undo` — that scans a directory, maps every file to a category by extension, and moves or copies it into a typed subfolder. The preview command groups all planned moves by category and prints them without touching any files. The organize command executes the moves, saves a full run record to a JSON history file, and prints a summary. The undo command reads the last move run from history and reverses every operation.

The extension-to-category mapping is built once at startup into a `Map<string, string>` for O(1) lookups — no per-file iteration through the rules array. Conflict resolution handles three modes: `skip` leaves existing destination files untouched, `overwrite` replaces them, and `rename` auto-appends `_1`, `_2`... by checking each candidate path against the real filesystem in a loop. The move operation uses `fs.renameSync` with a fallback to `copyFileSync + unlinkSync` for cross-filesystem moves (EXDEV error).

The JSON history caps at 50 runs with `unshift` for newest-first ordering. The seed script creates 28 sample files spanning all 10 categories — images, videos, audio, documents, code, archives, data, fonts, executables, and miscellaneous — so the tool is immediately testable after cloning.

### What I Learned

- `fs.renameSync` throws `EXDEV` when crossing filesystem boundaries (e.g., different drive or mount point) — the correct fallback is `copyFileSync` followed by `unlinkSync`, not retrying `renameSync`
- `fs.readdirSync(dir, { withFileTypes: true })` returns `Dirent` objects with `.isFile()` directly — avoids a `statSync` call per entry just to check file vs directory
- A flat `Map<ext, folder>` built from the category rules at startup is O(1) per lookup vs O(rules) per file — the difference is negligible at 28 files but matters at tens of thousands
- Auto-renaming conflict resolution must check each candidate path against the live filesystem in the loop — a concurrent process could create the same filename between iterations
- `path.extname(name)` includes the leading dot (`.jpg`) and is case-sensitive on Linux — always `.toLowerCase()` before map lookup to handle `.JPG` and `.jpg` identically

### Resources Used

- [Node.js fs documentation](https://nodejs.org/api/fs.html)
- [EXDEV error — cross-device rename](https://man7.org/linux/man-pages/man2/rename.2.html)
- [Node.js path.extname](https://nodejs.org/api/path.html#pathextnamepath)
- [fs.Dirent withFileTypes](https://nodejs.org/api/fs.html#fsreaddirsyncsyncpath-options)
