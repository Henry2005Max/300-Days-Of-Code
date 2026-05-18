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
