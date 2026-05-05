import { Router, Request, Response } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler, NotFoundError } from "../middleware/errorHandler";
import {
    subscribeSchema, discoverSchema, listItemsQuerySchema,
    readSchema, filterSchema, digestQuerySchema,
} from "../schemas/feed.schema";
import {
    subscribe, unsubscribe, listFeeds, getFeedById, refreshFeed,
    listItems, markRead, markAllRead, getUnreadCount,
    addFilter, removeFilter, listFilters, getDigest,
} from "../services/feed.service";
import { discoverFeeds } from "../services/discovery";

const router = Router();

function pid(raw: string): number {
    const id = parseInt(raw, 10);
    if (isNaN(id)) throw new NotFoundError("Resource", raw);
    return id;
}

// ── Discovery ─────────────────────────────────────────────────────────────────

// POST /discover — find RSS feeds on a website without subscribing
router.post("/discover", validate(discoverSchema), asyncHandler(async (req: Request, res: Response) => {
    const feeds = await discoverFeeds(req.body.url);
    res.json({
        success: true,
        data:    feeds,
        meta:    { total: feeds.length, count: feeds.length },
        _note:   "Use POST /feeds to subscribe to any of these URLs",
    });
}));

// ── Feeds ─────────────────────────────────────────────────────────────────────

router.post("/feeds", validate(subscribeSchema), asyncHandler(async (req: Request, res: Response) => {
    const feed = await subscribe(req.body.url);
    res.status(201).json({ success: true, data: feed });
}));

router.get("/feeds", asyncHandler(async (_req: Request, res: Response) => {
    const feeds = listFeeds();
    res.json({ success: true, data: feeds, meta: { total: feeds.length, count: feeds.length } });
}));

router.get("/feeds/:id", asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: getFeedById(pid(req.params.id)) });
}));

router.delete("/feeds/:id", asyncHandler(async (req: Request, res: Response) => {
    unsubscribe(pid(req.params.id));
    res.json({ success: true, data: { message: "Unsubscribed" } });
}));

// POST /feeds/:id/refresh — force cache bypass and re-fetch
router.post("/feeds/:id/refresh", asyncHandler(async (req: Request, res: Response) => {
    const feed = await refreshFeed(pid(req.params.id));
    res.json({ success: true, data: feed });
}));

// ── Items ─────────────────────────────────────────────────────────────────────

router.get(
    "/feeds/:id/items",
    validate(listItemsQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const q                = (req as any).validatedQuery;
        const { rows, total }  = listItems(pid(req.params.id), q.limit, q.offset);
        res.json({ success: true, data: rows, meta: { total, count: rows.length } });
    })
);

// ── Read state ────────────────────────────────────────────────────────────────

router.post(
    "/feeds/:id/items/:itemId/read",
    validate(readSchema),
    asyncHandler(async (req: Request, res: Response) => {
        markRead(pid(req.params.id), pid(req.params.itemId), req.body.subscriber);
        res.json({ success: true, data: { message: "Marked as read" } });
    })
);

router.post(
    "/feeds/:id/read-all",
    validate(readSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const result = markAllRead(pid(req.params.id), req.body.subscriber);
        res.json({ success: true, data: result });
    })
);

router.get("/feeds/:id/unread", asyncHandler(async (req: Request, res: Response) => {
    const subscriber = req.query.subscriber as string;
    if (!subscriber) return res.status(400).json({ success: false, error: "?subscriber= is required" });
    res.json({ success: true, data: getUnreadCount(pid(req.params.id), subscriber) });
}));

// ── Keyword filters ───────────────────────────────────────────────────────────

// GET /feeds/:id/filters
router.get("/feeds/:id/filters", asyncHandler(async (req: Request, res: Response) => {
    const filters = listFilters(pid(req.params.id));
    res.json({ success: true, data: filters, meta: { total: filters.length, count: filters.length } });
}));

// POST /feeds/:id/filters
router.post(
    "/feeds/:id/filters",
    validate(filterSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const filter = addFilter(pid(req.params.id), req.body.keyword);
        res.status(201).json({ success: true, data: filter });
    })
);

// DELETE /feeds/:id/filters/:filterId
router.delete("/feeds/:id/filters/:filterId", asyncHandler(async (req: Request, res: Response) => {
    removeFilter(pid(req.params.id), pid(req.params.filterId));
    res.json({ success: true, data: { message: "Filter removed" } });
}));

// ── Digest ────────────────────────────────────────────────────────────────────

// GET /digest — unread items across all feeds for a subscriber
router.get(
    "/digest",
    validate(digestQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const q     = (req as any).validatedQuery;
        const items = await getDigest({
            subscriber:   q.subscriber,
            matchedOnly:  q.matched_only,
            refreshStale: q.refresh_stale,
            limit:        q.limit,
        });
        res.json({ success: true, data: items, meta: { total: items.length, count: items.length } });
    })
);

export default router;