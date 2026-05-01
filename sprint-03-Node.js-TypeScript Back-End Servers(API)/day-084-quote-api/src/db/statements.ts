import db from "./database";

type Stmts = ReturnType<typeof buildStatements>;
let _stmts: Stmts | null = null;

function buildStatements() {
    return {
        // ── Quotes ─────────────────────────────────────────────────────────
        getQuoteById:    db.prepare("SELECT * FROM quotes WHERE id = ?"),
        incrementView:   db.prepare("UPDATE quotes SET view_count = view_count + 1 WHERE id = ?"),
        listQuotes:      db.prepare(`
      SELECT * FROM quotes
      WHERE (@category IS NULL OR category = @category)
        AND (@origin   IS NULL OR origin   = @origin)
      ORDER BY view_count DESC, id DESC
      LIMIT @limit OFFSET @offset
    `),
        countQuotes:     db.prepare(`
      SELECT COUNT(*) as count FROM quotes
      WHERE (@category IS NULL OR category = @category)
        AND (@origin   IS NULL OR origin   = @origin)
    `),
        insertQuote:     db.prepare(`
      INSERT INTO quotes (text, author, origin, category)
      VALUES (@text, @author, @origin, @category)
    `),

        // ── FTS5 search ────────────────────────────────────────────────────
        // quotes_fts is a content table — JOIN back to quotes for all fields
        // rank is a negative number in FTS5 (more negative = more relevant)
        searchQuotes:    db.prepare(`
      SELECT q.*, fts.rank
      FROM quotes_fts fts
      JOIN quotes q ON q.id = fts.rowid
      WHERE quotes_fts MATCH @query
      ORDER BY fts.rank
      LIMIT @limit OFFSET @offset
    `),
        countSearch:     db.prepare(`
      SELECT COUNT(*) as count
      FROM quotes_fts fts
      JOIN quotes q ON q.id = fts.rowid
      WHERE quotes_fts MATCH @query
    `),

        // ── Tags ────────────────────────────────────────────────────────────
        getTagsForQuote: db.prepare(`
      SELECT t.name FROM tags t
      JOIN quote_tags qt ON qt.tag_id = t.id
      WHERE qt.quote_id = ?
      ORDER BY t.name
    `),
        listTags:        db.prepare("SELECT * FROM tags ORDER BY name"),
        getTagByName:    db.prepare("SELECT * FROM tags WHERE name = @name"),
        insertTag:       db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (@name)"),
        linkTag:         db.prepare("INSERT OR IGNORE INTO quote_tags (quote_id, tag_id) VALUES (@quote_id, @tag_id)"),

        // Quotes by tag — join through junction table
        quotesByTag:     db.prepare(`
      SELECT q.* FROM quotes q
      JOIN quote_tags qt ON qt.quote_id = q.id
      JOIN tags t        ON t.id = qt.tag_id
      WHERE LOWER(t.name) = LOWER(@tag)
      ORDER BY q.view_count DESC, q.id DESC
      LIMIT @limit OFFSET @offset
    `),
        countByTag:      db.prepare(`
      SELECT COUNT(*) as count FROM quotes q
      JOIN quote_tags qt ON qt.quote_id = q.id
      JOIN tags t        ON t.id = qt.tag_id
      WHERE LOWER(t.name) = LOWER(@tag)
    `),

        // ── Favourites ─────────────────────────────────────────────────────
        addFavourite:    db.prepare(`
      INSERT OR IGNORE INTO favourites (username, quote_id) VALUES (@username, @quote_id)
    `),
        removeFavourite: db.prepare(`
      DELETE FROM favourites WHERE username = @username AND quote_id = @quote_id
    `),
        listFavourites:  db.prepare(`
      SELECT q.*, f.saved_at FROM quotes q
      JOIN favourites f ON f.quote_id = q.id
      WHERE f.username = @username
      ORDER BY f.saved_at DESC
      LIMIT @limit OFFSET @offset
    `),
        countFavourites: db.prepare(`
      SELECT COUNT(*) as count FROM favourites WHERE username = @username
    `),
        isFavourited:    db.prepare(`
      SELECT id FROM favourites WHERE username = @username AND quote_id = @quote_id
    `),

        // ── Stats ──────────────────────────────────────────────────────────
        topViewed:       db.prepare("SELECT * FROM quotes ORDER BY view_count DESC LIMIT @limit"),
        categoryStats:   db.prepare(`
      SELECT category, COUNT(*) as count, SUM(view_count) as total_views
      FROM quotes GROUP BY category ORDER BY count DESC
    `),
        originStats:     db.prepare(`
      SELECT origin, COUNT(*) as count FROM quotes GROUP BY origin ORDER BY count DESC
    `),

        // ── Quote of the day ───────────────────────────────────────────────
        // Deterministic selection: use the day-of-year as a seed for an offset.
        // Result is stable all day but changes at midnight.
        quoteOfTheDay:   db.prepare(`
      SELECT * FROM quotes
      ORDER BY id
      LIMIT 1 OFFSET @offset
    `),
        totalQuotes:     db.prepare("SELECT COUNT(*) as count FROM quotes"),
    };
}

export function initStatements(): void {
    _stmts = buildStatements();
    console.log("[db] Prepared statements compiled");
}

export const stmts = new Proxy({} as Stmts, {
    get(_target, prop: string) {
        if (!_stmts) throw new Error("initStatements() must be called after runMigrations()");
        return (_stmts as any)[prop];
    },
});