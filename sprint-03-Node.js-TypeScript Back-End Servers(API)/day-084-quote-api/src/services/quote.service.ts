// QuoteService: the full business logic layer.
//
// Key concepts in Day 84:
//
// 1. FTS5 FULL-TEXT SEARCH
//    FTS5 uses an inverted index — for each word it stores a list of
//    (document_id, position) pairs. A MATCH query looks up words in this
//    index rather than scanning every row, making search O(log n) instead
//    of O(n). The `rank` column is a negative float — closer to 0 = better
//    match. We ORDER BY rank ASC so the best results come first.
//    Special chars in user input (", *, :) must be escaped to avoid FTS5
//    syntax errors — we wrap the query in double quotes for phrase matching.
//
// 2. TAG ENRICHMENT
//    Tags live in a separate table joined through quote_tags. Rather than
//    joining in every query (which adds complexity to FTS5 joins), we enrich
//    quotes with tags in a second pass: getTagsFor(id) per quote.
//    For small result sets (≤ 100 rows) this N+1 is acceptable and keeps
//    the queries readable. For larger data sets an array_agg approach is better.
//
// 3. QUOTE OF THE DAY
//    Deterministic selection using day-of-year as an offset into the quotes
//    table ordered by id. The same quote shows all day, changes at midnight,
//    and requires no extra table or cron job.
//
// 4. VIEW COUNT
//    Incremented on every GET /quotes/:id call. Stored in the main table so
//    popularity can be used as a sort key in list queries.

import db from "../db/database";
import { stmts } from "../db/statements";
import { Quote, QuoteWithTags, Tag } from "../types";
import { NotFoundError, ConflictError } from "../middleware/errorHandler";

// ── Tag helper ────────────────────────────────────────────────────────────────

function getTagsFor(quoteId: number): string[] {
    return (stmts.getTagsForQuote.all(quoteId) as { name: string }[]).map((t) => t.name);
}

function enrich(quote: Quote): QuoteWithTags {
    return { ...quote, tags: getTagsFor(quote.id) };
}

// ── List ──────────────────────────────────────────────────────────────────────

export function listQuotes(opts: {
    page: number; limit: number; category?: string; origin?: string;
}): { rows: QuoteWithTags[]; total: number; page: number; pages: number } {
    const offset   = (opts.page - 1) * opts.limit;
    const params   = {
        limit:    opts.limit,
        offset,
        category: opts.category ?? null,
        origin:   opts.origin   ?? null,
    };

    const rows  = (stmts.listQuotes.all(params) as Quote[]).map(enrich);
    const total = (stmts.countQuotes.get(params) as { count: number }).count;

    return { rows, total, page: opts.page, pages: Math.ceil(total / opts.limit) };
}

// ── Single quote ──────────────────────────────────────────────────────────────

export function getQuoteById(id: number): QuoteWithTags {
    const quote = stmts.getQuoteById.get(id) as Quote | undefined;
    if (!quote) throw new NotFoundError("Quote", id);

    // Increment view count — fire and forget (no await, synchronous in SQLite)
    stmts.incrementView.run(id);

    return enrich({ ...quote, view_count: quote.view_count + 1 });
}

// ── Search ────────────────────────────────────────────────────────────────────

export function searchQuotes(opts: {
    q: string; page: number; limit: number;
}): { rows: (QuoteWithTags & { rank: number })[]; total: number; page: number; pages: number } {
    // Escape the user query and wrap in double quotes for phrase/token matching.
    // FTS5 treats *, ", : as special — removing them is the safest approach.
    const safeQuery = `"${opts.q.replace(/["*:]/g, " ").trim()}"`;
    const offset    = (opts.page - 1) * opts.limit;
    const params    = { query: safeQuery, limit: opts.limit, offset };

    const rows  = (stmts.searchQuotes.all(params) as (Quote & { rank: number })[])
        .map((q) => ({ ...enrich(q), rank: q.rank }));
    const total = (stmts.countSearch.get(params) as { count: number }).count;

    return { rows, total, page: opts.page, pages: Math.ceil(total / opts.limit) };
}

// ── By tag ────────────────────────────────────────────────────────────────────

export function quotesByTag(opts: {
    tag: string; page: number; limit: number;
}): { rows: QuoteWithTags[]; total: number; page: number; pages: number } {
    const offset = (opts.page - 1) * opts.limit;
    const params = { tag: opts.tag, limit: opts.limit, offset };

    const rows  = (stmts.quotesByTag.all(params) as Quote[]).map(enrich);
    const total = (stmts.countByTag.get(params) as { count: number }).count;

    return { rows, total, page: opts.page, pages: Math.ceil(total / opts.limit) };
}

// ── Create ────────────────────────────────────────────────────────────────────

export function createQuote(data: {
    text: string; author: string; origin: string; category: string; tags: string[];
}): QuoteWithTags {
    const insertAll = db.transaction(() => {
        const result  = stmts.insertQuote.run(data);
        const quoteId = result.lastInsertRowid as number;

        for (const tagName of data.tags) {
            stmts.insertTag.run({ name: tagName.toLowerCase() });
            const tag = stmts.getTagByName.get({ name: tagName.toLowerCase() }) as Tag;
            stmts.linkTag.run({ quote_id: quoteId, tag_id: tag.id });
        }

        return quoteId;
    });

    const id = insertAll();
    return enrich(stmts.getQuoteById.get(id) as Quote);
}

// ── Random ────────────────────────────────────────────────────────────────────

export function randomQuote(): QuoteWithTags {
    const total  = (stmts.totalQuotes.get() as { count: number }).count;
    const offset = Math.floor(Math.random() * total);
    const quote  = db.prepare("SELECT * FROM quotes ORDER BY id LIMIT 1 OFFSET ?").get(offset) as Quote;
    stmts.incrementView.run(quote.id);
    return enrich(quote);
}

// ── Quote of the day ──────────────────────────────────────────────────────────

export function quoteOfTheDay(): QuoteWithTags & { date: string } {
    const total = (stmts.totalQuotes.get() as { count: number }).count;

    // Day-of-year (0–364) as a deterministic offset — stable all day
    const now  = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    const offset = dayOfYear % total;

    const quote = stmts.quoteOfTheDay.get({ offset }) as Quote;
    const dateStr = now.toISOString().split("T")[0];

    return { ...enrich(quote), date: dateStr };
}

// ── Favourites ────────────────────────────────────────────────────────────────

export function addFavourite(username: string, quoteId: number): { message: string } {
    const quote = stmts.getQuoteById.get(quoteId) as Quote | undefined;
    if (!quote) throw new NotFoundError("Quote", quoteId);

    const existing = stmts.isFavourited.get({ username, quote_id: quoteId });
    if (existing) throw new ConflictError("Quote is already in your favourites");

    stmts.addFavourite.run({ username, quote_id: quoteId });
    return { message: `Quote ${quoteId} added to ${username}'s favourites` };
}

export function removeFavourite(username: string, quoteId: number): { message: string } {
    const result = stmts.removeFavourite.run({ username, quote_id: quoteId });
    if (result.changes === 0) throw new NotFoundError("Favourite");
    return { message: `Quote ${quoteId} removed from ${username}'s favourites` };
}

export function listFavourites(username: string, opts: {
    page: number; limit: number;
}): { rows: QuoteWithTags[]; total: number; page: number; pages: number } {
    const offset = (opts.page - 1) * opts.limit;
    const rows   = (stmts.listFavourites.all({ username, limit: opts.limit, offset }) as Quote[]).map(enrich);
    const total  = (stmts.countFavourites.get({ username }) as { count: number }).count;
    return { rows, total, page: opts.page, pages: Math.ceil(total / opts.limit) };
}

// ── Tags ──────────────────────────────────────────────────────────────────────

export function listTags(): Tag[] {
    return stmts.listTags.all() as Tag[];
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export function getStats(): object {
    const total      = (stmts.totalQuotes.get() as { count: number }).count;
    const topViewed  = stmts.topViewed.all({ limit: 5 }) as Quote[];
    const categories = stmts.categoryStats.all() as { category: string; count: number; total_views: number }[];
    const origins    = stmts.originStats.all()   as { origin: string; count: number }[];

    return { total, top_viewed: topViewed, categories, origins };
}