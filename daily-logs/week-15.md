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
