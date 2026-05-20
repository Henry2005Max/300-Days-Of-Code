## Day 98 - May 17

**Project:** Sentiment Analyzer with compromise NLP
**Time Spent:** 3 hours

### What I Built

Built a full NLP sentiment analysis pipeline that processes 15 Nigerian-context texts across four categories — news, finance, product reviews, and social media posts. The analyzer uses `compromise` for named entity recognition (people, places, organizations) and keyword extraction, and a custom lexicon-based scorer for sentiment that handles intensifiers and negators word-by-word.

The scoring algorithm normalizes by `Math.sqrt(wordCount)` to prevent length bias, clamps to [-1.0, +1.0], and assigns a separate magnitude value for sentiment strength. Results are stored in a three-table PostgreSQL schema — `sentiment_results` for the main record, `sentiment_entities` for extracted named entities, and `sentiment_keywords` for top terms — enabling clean aggregate queries across all analyzed texts without JSON column workarounds.

The terminal output shows a 20-character score bar per text, sentiment badge, entity breakdown by type, and keywords. The aggregate section prints sentiment distribution with visual fill bars, per-category average scores, top 10 keywords across all texts, and top 10 named entities ranked by frequency — all from a single set of SQL aggregate queries fired in parallel via `Promise.all`.

### What I Learned

- `compromise` exposes chainable NLP methods — `.people()`, `.places()`, `.organizations()`, `.nouns()`, `.verbs()` — each returning a collection that `.out('array')` converts to a plain string array
- Normalizing raw sentiment score by `Math.sqrt(wordCount)` prevents short texts from dominating — a 2-word "very good" should not outscore a detailed positive review
- Intensifiers and negators work as a stateful multiplier — tracking `multiplier` as a variable and resetting it after each scored word correctly handles `not very good` vs `very good`
- Storing entities and keywords in separate normalized tables rather than JSONB columns makes aggregate queries like "top keywords across all results" a simple `GROUP BY` with no JSON parsing
- `json_agg(DISTINCT jsonb_build_object(...)) FILTER (WHERE id IS NOT NULL)` aggregates child rows from a LEFT JOIN into a JSON array inline — eliminates N+1 lookups for entities per result
- Upsert with `ON CONFLICT DO UPDATE` on the parent + `DELETE` then re-insert on children is a clean pattern for one-to-many upserts without complex merge logic

### Resources Used

- [compromise NLP documentation](https://compromise.cool/)
- [compromise GitHub](https://github.com/spencermountain/compromise)
- [PostgreSQL json_agg](https://www.postgresql.org/docs/current/functions-aggregate.html)
- [Sentiment analysis normalization techniques](https://en.wikipedia.org/wiki/Sentiment_analysis)

### Tomorrow

Day 99 — Backup Script with Node.js `fs`. An automated file backup tool that copies specified directories to a timestamped backup location, compresses them, tracks backup history in a log file, and supports restore from a specific backup.

## Day 99 - May 18

**Project:** Backup Script with Node.js fs
**Time Spent:** 3 hours

### What I Built

Built a full file backup CLI using only Node.js built-in modules — no external archiving library. The tool backs up any configured set of directories into `.tar.gz` archives using a hand-built TAR serializer and `zlib.gzipSync` for compression. Each backup run gets a timestamped ID, and all run metadata is tracked in a JSON log file covering file count, raw size, compressed size, duration, and status.

The TAR serializer constructs 512-byte header blocks per file — writing filename, octal-encoded file size, modification time, type flag, UStar magic, and a checksum computed as the sum of all header bytes with the checksum field treated as spaces. File data is padded to 512-byte boundaries, and two zero blocks mark the end of the archive. `zlib.gzipSync` compresses the complete buffer in one synchronous call. Extraction reverses the process with `zlib.gunzipSync` and a header parser.

The CLI supports four commands: `backup` runs the full archive pipeline, `list` prints the history log with status badges and compression stats, `restore` extracts any logged backup to a `./backups/restored/<id>/` directory by setting `RESTORE_ID` in `.env`, and `clean` wipes all archive directories and the log. Auto-pruning removes the oldest backup directory when the `MAX_BACKUPS` limit is exceeded after each successful run.

### What I Learned

- TAR format is a sequence of 512-byte header blocks followed by file data padded to 512-byte boundaries — understanding the binary format made it clear why `tar` archives are always multiples of 512 bytes
- TAR checksums are computed with the checksum field set to ASCII spaces (0x20), not zeros — using zeros gives a wrong checksum that some implementations reject
- `zlib.gzipSync` and `zlib.gunzipSync` operate on `Buffer` objects synchronously — appropriate for moderate file sizes without needing stream pipelines
- `fs.readdirSync(dir, { withFileTypes: true })` returns `Dirent` objects with `.isDirectory()` directly — more efficient than calling `fs.statSync` per entry for directory walking
- `fs.rmSync(path, { recursive: true, force: true })` is the modern Node.js equivalent of `rm -rf` — available since Node.js 14.14
- A JSON log file is a practical alternative to a database for storing backup metadata in a self-contained CLI tool — no setup required, portable across machines

### Resources Used

- [TAR file format specification](https://www.gnu.org/software/tar/manual/html_node/Standard.html)
- [Node.js zlib documentation](https://nodejs.org/api/zlib.html)
- [Node.js fs documentation](https://nodejs.org/api/fs.html)
- [Node.js Buffer documentation](https://nodejs.org/api/buffer.html)

### Tomorrow

Day 100 — Sprint 4 Review. Optimize and extend the Day 91 CSV Analyzer — async batch processing, query performance improvements with EXPLAIN ANALYZE, additional chart output, and a comprehensive review of what was built across Sprint 4.


## Day 100 - May 19

**Project:** Sprint 4 Review — CSV Analyzer Enhanced
**Time Spent:** 3 hours

### What I Built

Extended the Day 91 CSV Analyzer with three new PostgreSQL analytical queries, concurrent batch inserts, two additional indexes, and an `EXPLAIN ANALYZE` inspection mode. The new queries use advanced PostgreSQL features not covered in Day 91: `NTILE(3)` window function for customer segmentation, `PERCENTILE_CONT` ordered-set aggregate for revenue distribution percentiles, and `EXTRACT(DOW FROM date)` for weekday revenue grouping.

The concurrent batch insert replaces Day 91's sequential loop with a windowed `Promise.all` approach — batches are grouped into windows of configurable size (default 4) and each window runs all its batches in parallel before moving to the next. This keeps memory flat while meaningfully reducing total insert time on larger datasets.

The `EXPLAIN ANALYZE` mode runs PostgreSQL's query planner on all four key queries and prints the full execution plan including actual vs estimated rows, index scan usage, and timing. This closes the loop between writing a query and understanding how the database actually executes it — something that matters for Sprint 4's theme of data engineering at production quality.

### What I Learned

- `PERCENTILE_CONT` is an ordered-set aggregate — its syntax is `PERCENTILE_CONT(fraction) WITHIN GROUP (ORDER BY col)`, not a standard window or group-by function
- `NTILE(n) OVER (ORDER BY expr)` divides rows into n equal buckets dynamically — the bucket boundaries adjust automatically based on the data distribution
- `Promise.all` on batch inserts works well up to the connection pool limit — beyond that, extra promises queue on the pool rather than failing, so the concurrency is naturally bounded
- `EXPLAIN ANALYZE` actually executes the query and returns real timing, not estimates — `EXPLAIN` alone (without `ANALYZE`) only shows the planner's cost estimates
- `EXTRACT(DOW FROM date)` returns an integer 0 (Sunday) through 6 (Saturday) — including the raw number in the query allows correct sorting before formatting the day name

### Resources Used

- [PostgreSQL PERCENTILE_CONT](https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE)
- [PostgreSQL NTILE window function](https://www.postgresql.org/docs/current/functions-window.html)
- [PostgreSQL EXPLAIN ANALYZE](https://www.postgresql.org/docs/current/sql-explain.html)
- [PostgreSQL EXTRACT](https://www.postgresql.org/docs/current/functions-datetime.html)

### Tomorrow

Day 101 — TypeScript Dashboard Mock. A terminal-based data dashboard that pulls metrics from PostgreSQL and renders a live-updating multi-panel ASCII dashboard using Node.js streams and ANSI escape codes.

## Day 101 - May 20

**Project:** TypeScript Terminal Dashboard
**Time Spent:** 3 hours

### What I Built

Built a live-updating terminal dashboard from scratch using only ANSI escape codes — no ncurses, blessed, or any TUI library. The dashboard pulls sales metrics from PostgreSQL every 3 seconds and renders four bordered panels: a summary statistics panel, a top products table with mini bar charts, a category revenue breakdown, and a monthly trend table. A status bar at the bottom shows the live clock, last successful fetch time, and keyboard hint.

The rendering approach uses cursor repositioning rather than screen clearing — writing `\x1b[H` at the start of each frame moves the cursor to row 1 column 1 and the new content overwrites the previous frame in place. This eliminates the flash that full screen clears produce. Each panel is a pure function returning an array of strings, and the dashboard renderer composes them all and writes the full frame to `process.stdout` in one call.

ANSI colour codes are stripped from strings before padding calculations using a regex replace — otherwise, the invisible escape sequences inflate the apparent string length and break column alignment. The cursor is hidden at startup and restored on `Ctrl+C` via `SIGINT`/`SIGTERM` handlers. Errors are displayed inline and the dashboard retries on the next interval tick without crashing.

### What I Learned

- `\x1b[H` repositions the cursor without clearing — overwriting from home is flicker-free, unlike `\x1b[2J` which visibly blanks the screen between frames
- ANSI escape codes inflate `str.length` — must strip with `/\x1b\[[0-9;]*m/g` before measuring for column padding
- `process.stdout.write()` is the right primitive for TUI rendering — `console.log` appends a newline and is harder to compose
- `\x1b[?25l` and `\x1b[?25h` control cursor visibility — always restore on exit or the terminal is permanently broken for the user
- `setInterval` keeps the event loop alive naturally — no extra mechanism needed
- Pure functions returning `string[]` per panel make the rendering logic composable and independently testable
- Box-drawing Unicode characters are standard single codepoints and safe to use in Node.js string output

### Resources Used

- [ANSI escape code reference](https://en.wikipedia.org/wiki/ANSI_escape_code)
- [Node.js process.stdout](https://nodejs.org/api/process.html#processstdout)
- [Unicode box-drawing characters](https://en.wikipedia.org/wiki/Box-drawing_character)
- [node-postgres pool documentation](https://node-postgres.com/apis/pool)

### Tomorrow

Day 102 — Cron Examples with node-cron. A multi-job cron scheduler that runs different tasks on different schedules — database cleanup, report generation, health checks, and log rotation — with job history tracking and a status display.
