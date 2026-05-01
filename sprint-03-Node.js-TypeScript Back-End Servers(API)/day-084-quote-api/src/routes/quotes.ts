import { Router, Request, Response } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler, NotFoundError } from "../middleware/errorHandler";
import {
    listQuerySchema,
    searchQuerySchema,
    tagQuerySchema,
    createQuoteSchema,
    favouriteSchema,
    favouriteQuerySchema,
} from "../schemas/quote.schema";
import {
    listQuotes,
    getQuoteById,
    searchQuotes,
    quotesByTag,
    createQuote,
    randomQuote,
    quoteOfTheDay,
    addFavourite,
    removeFavourite,
    listFavourites,
    listTags,
    getStats,
} from "../services/quote.service";

const router = Router();

function parseId(raw: string): number {
    const id = parseInt(raw, 10);
    if (isNaN(id)) throw new NotFoundError("Quote", raw);
    return id;
}

// ── Special routes BEFORE /:id to avoid shadowing ────────────────────────────

// GET /quotes/today — quote of the day
router.get("/quotes/today", asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: quoteOfTheDay() });
}));

// GET /quotes/random — random quote
router.get("/quotes/random", asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: randomQuote() });
}));

// GET /quotes/search?q=wisdom
router.get(
    "/quotes/search",
    validate(searchQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const q      = (req as any).validatedQuery;
        const result = searchQuotes(q);
        res.json({
            success: true,
            data:    result.rows,
            meta:    { total: result.total, count: result.rows.length, page: result.page, pages: result.pages },
        });
    })
);

// GET /quotes/tag/:tag — all quotes with a specific tag
router.get(
    "/quotes/tag/:tag",
    validate(tagQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const q      = (req as any).validatedQuery;
        const result = quotesByTag({ tag: req.params.tag, ...q });
        res.json({
            success: true,
            data:    result.rows,
            meta:    { total: result.total, count: result.rows.length, page: result.page, pages: result.pages },
        });
    })
);

// ── CRUD ──────────────────────────────────────────────────────────────────────

// GET /quotes — paginated list with optional category/origin filter
router.get(
    "/quotes",
    validate(listQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const q      = (req as any).validatedQuery;
        const result = listQuotes(q);
        res.json({
            success: true,
            data:    result.rows,
            meta:    { total: result.total, count: result.rows.length, page: result.page, pages: result.pages },
        });
    })
);

// POST /quotes — create a new quote
router.post(
    "/quotes",
    validate(createQuoteSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const quote = createQuote(req.body);
        res.status(201).json({ success: true, data: quote });
    })
);

// GET /quotes/:id — single quote (increments view_count)
router.get(
    "/quotes/:id",
    asyncHandler(async (req: Request, res: Response) => {
        const quote = getQuoteById(parseId(req.params.id));
        res.json({ success: true, data: quote });
    })
);

// ── Favourites ────────────────────────────────────────────────────────────────

// POST /quotes/:id/favourite
router.post(
    "/quotes/:id/favourite",
    validate(favouriteSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const result = addFavourite(req.body.username, parseId(req.params.id));
        res.status(201).json({ success: true, data: result });
    })
);

// DELETE /quotes/:id/favourite
router.delete(
    "/quotes/:id/favourite",
    validate(favouriteSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const result = removeFavourite(req.body.username, parseId(req.params.id));
        res.json({ success: true, data: result });
    })
);

// GET /favourites/:username — a user's saved quotes
router.get(
    "/favourites/:username",
    validate(favouriteQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const q      = (req as any).validatedQuery;
        const result = listFavourites(req.params.username, q);
        res.json({
            success: true,
            data:    result.rows,
            meta:    { total: result.total, count: result.rows.length, page: result.page, pages: result.pages },
        });
    })
);

// ── Tags + Stats ──────────────────────────────────────────────────────────────

// GET /tags — all tags
router.get("/tags", asyncHandler(async (_req: Request, res: Response) => {
    const tags = listTags();
    res.json({ success: true, data: tags, meta: { total: tags.length, count: tags.length } });
}));

// GET /stats — view counts, category breakdown, top quotes
router.get("/stats", asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: getStats() });
}));

export default router;