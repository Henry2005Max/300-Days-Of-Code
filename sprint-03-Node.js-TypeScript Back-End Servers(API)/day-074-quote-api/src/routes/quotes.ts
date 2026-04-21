import { Router, Request, Response } from "express";
import { db } from "../db/database";
import { QuoteRow, Quote, PaginationMeta, toQuote } from "../types";

const router = Router();
const DEFAULT_LIMIT = Number(process.env.DEFAULT_PAGE_SIZE) || 10;

/* ── Pagination helper ───────────────────────────────────────────────
   Takes total count, page, and limit.
   Returns the full pagination meta object and the SQL OFFSET value.
────────────────────────────────────────────────────────────────────── */
function paginate(total: number, page: number, limit: number): {
    meta: PaginationMeta;
    offset: number;
} {
    const pages  = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    return {
        meta: {
            total,
            page,
            limit,
            pages,
            hasNext: page < pages,
            hasPrev: page > 1,
        },
        offset,
    };
}

/* ── GET /quotes — list all, optional ?category= filter ── */
router.get("/", (req: Request, res: Response) => {
    const page     = Math.max(1, Number(req.query.page)  || 1);
    const limit    = Math.min(50, Math.max(1, Number(req.query.limit) || DEFAULT_LIMIT));
    const category = req.query.category as string | undefined;

    const where  = category ? "WHERE category = ?" : "";
    const params = category ? [category] : [];

    const total  = (db.prepare(`SELECT COUNT(*) as c FROM quotes ${where}`).get(...params) as any).c;
    const { meta, offset } = paginate(total, page, limit);

    const rows = db.prepare(
        `SELECT * FROM quotes ${where} ORDER BY id ASC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset) as QuoteRow[];

    res.json({ success: true, data: rows.map(toQuote), meta });
});

/* ── GET /quotes/random — one random quote ── */
router.get("/random", (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;
    const where    = category ? "WHERE category = ?" : "";
    const params   = category ? [category] : [];

    const row = db.prepare(
        `SELECT * FROM quotes ${where} ORDER BY RANDOM() LIMIT 1`
    ).get(...params) as QuoteRow | undefined;

    if (!row) {
        res.status(404).json({ success: false, error: "No quotes found" });
        return;
    }

    /* Increment view count */
    db.prepare("UPDATE quotes SET view_count = view_count + 1 WHERE id = ?").run(row.id);

    res.json({ success: true, data: toQuote({ ...row, view_count: row.view_count + 1 }) });
});

/* ── GET /quotes/search?q=wisdom ─────────────────────────────────────
   Uses SQLite FTS5 for fast full-text search across text and author.
   The MATCH operator is FTS5 specific — it uses the inverted index.
   We JOIN back to the main quotes table to get all columns + view_count.
────────────────────────────────────────────────────────────────────── */
router.get("/search", (req: Request, res: Response) => {
    const q     = (req.query.q as string || "").trim();
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || DEFAULT_LIMIT));

    if (!q) {
        res.status(400).json({ success: false, error: "q query parameter is required" });
        return;
    }

    /* FTS5 MATCH query — the search term is passed as a parameter */
    const rows = db.prepare(`
    SELECT q.*
    FROM quotes q
    JOIN quotes_fts fts ON fts.rowid = q.id
    WHERE quotes_fts MATCH ?
    ORDER BY rank
    LIMIT ? OFFSET ?
  `).all(q, limit, (page - 1) * limit) as QuoteRow[];

    /* Count total matches for pagination */
    const total = (db.prepare(`
    SELECT COUNT(*) as c
    FROM quotes q
    JOIN quotes_fts fts ON fts.rowid = q.id
    WHERE quotes_fts MATCH ?
  `).get(q) as any).c;

    const { meta } = paginate(total, page, limit);

    res.json({ success: true, query: q, data: rows.map(toQuote), meta });
});

/* ── GET /quotes/categories — list all categories with counts ── */
router.get("/categories", (req: Request, res: Response) => {
    const rows = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM quotes
    GROUP BY category
    ORDER BY count DESC
  `).all();

    res.json({ success: true, data: rows });
});

/* ── GET /quotes/top — most viewed quotes ── */
router.get("/top", (req: Request, res: Response) => {
    const limit = Math.min(20, Number(req.query.limit) || 10);
    const rows  = db.prepare(
        "SELECT * FROM quotes ORDER BY view_count DESC LIMIT ?"
    ).all(limit) as QuoteRow[];

    res.json({ success: true, data: rows.map(toQuote), meta: { count: rows.length } });
});

/* ── GET /quotes/:id — single quote, increments view count ── */
router.get("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ success: false, error: "ID must be a number" });
        return;
    }

    const row = db.prepare("SELECT * FROM quotes WHERE id = ?").get(id) as QuoteRow | undefined;
    if (!row) {
        res.status(404).json({ success: false, error: `Quote with ID ${id} not found` });
        return;
    }

    db.prepare("UPDATE quotes SET view_count = view_count + 1 WHERE id = ?").run(id);
    res.json({ success: true, data: toQuote({ ...row, view_count: row.view_count + 1 }) });
});

/* ── POST /quotes/:id/favourite — toggle a favourite by IP ──────────
   Uses INSERT OR IGNORE + DELETE to toggle:
   - If not favourited → insert → 201 Added
   - If already favourited → delete → 200 Removed
────────────────────────────────────────────────────────────────────── */
router.post("/:id/favourite", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const ip = req.ip || "unknown";

    if (isNaN(id)) {
        res.status(400).json({ success: false, error: "ID must be a number" });
        return;
    }

    const quote = db.prepare("SELECT id FROM quotes WHERE id = ?").get(id);
    if (!quote) {
        res.status(404).json({ success: false, error: `Quote with ID ${id} not found` });
        return;
    }

    const existing = db.prepare(
        "SELECT 1 FROM favourites WHERE ip = ? AND quote_id = ?"
    ).get(ip, id);

    if (existing) {
        db.prepare("DELETE FROM favourites WHERE ip = ? AND quote_id = ?").run(ip, id);
        res.json({ success: true, action: "removed", quoteId: id });
    } else {
        db.prepare(
            "INSERT INTO favourites (ip, quote_id) VALUES (?, ?)"
        ).run(ip, id);
        res.status(201).json({ success: true, action: "added", quoteId: id });
    }
});

/* ── GET /quotes/favourites/mine — list favourites for this IP ── */
router.get("/favourites/mine", (req: Request, res: Response) => {
    const ip    = req.ip || "unknown";
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(50, Number(req.query.limit) || DEFAULT_LIMIT);

    const total = (db.prepare(
        "SELECT COUNT(*) as c FROM favourites WHERE ip = ?"
    ).get(ip) as any).c;

    const { meta, offset } = paginate(total, page, limit);

    const rows = db.prepare(`
    SELECT q.*
    FROM quotes q
    JOIN favourites f ON f.quote_id = q.id
    WHERE f.ip = ?
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `).all(ip, limit, offset) as QuoteRow[];

    res.json({ success: true, data: rows.map(toQuote), meta });
});

export default router;