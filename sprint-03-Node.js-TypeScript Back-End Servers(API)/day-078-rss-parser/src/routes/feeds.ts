import { Router, Request, Response } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler, NotFoundError } from "../middleware/errorHandler";
import {
    subscribeFeedSchema,
    listItemsQuerySchema,
    markReadSchema,
    unreadQuerySchema,
} from "../schemas/feed.schemas";
import {
    subscribe,
    unsubscribe,
    listFeeds,
    getFeedById,
    listItems,
    markRead,
    markAllRead,
    unreadCount,
    forceRefresh,
} from "../services/feed.service";

const router = Router();

// Helper so we do not repeat parseInt + NaN check in every route
function parseId(raw: string, label: string): number {
    const id = parseInt(raw, 10);
    if (isNaN(id)) throw new NotFoundError(label, raw);
    return id;
}

// ── Feed routes ──────────────────────────────────────────────────────────────

// POST /feeds — subscribe to a new feed URL
router.post(
    "/",
    validate(subscribeFeedSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const feed = await subscribe(req.body.url);
        res.status(201).json({ success: true, data: feed });
    })
);

// GET /feeds — list all subscribed feeds
router.get(
    "/",
    asyncHandler(async (_req: Request, res: Response) => {
        const feeds = listFeeds();
        res.json({ success: true, data: feeds, meta: { total: feeds.length, count: feeds.length } });
    })
);

// GET /feeds/:id — single feed metadata
router.get(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
        const feed = getFeedById(parseId(req.params.id, "Feed"));
        res.json({ success: true, data: feed });
    })
);

// DELETE /feeds/:id — unsubscribe from a feed
router.delete(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
        unsubscribe(parseId(req.params.id, "Feed"));
        res.json({ success: true, data: { message: "Unsubscribed successfully" } });
    })
);

// POST /feeds/:id/refresh — force a cache bypass and re-fetch now
router.post(
    "/:id/refresh",
    asyncHandler(async (req: Request, res: Response) => {
        const feed = await forceRefresh(parseId(req.params.id, "Feed"));
        res.json({ success: true, data: feed });
    })
);

// ── Item routes ──────────────────────────────────────────────────────────────

// GET /feeds/:id/items — list items (refreshes cache if stale)
router.get(
    "/:id/items",
    validate(listItemsQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const feedId = parseId(req.params.id, "Feed");
        const q      = (req as any).validatedQuery;
        const { rows, total } = await listItems(feedId, q);
        res.json({ success: true, data: rows, meta: { total, count: rows.length } });
    })
);

// POST /feeds/:id/items/:itemId/read — mark a single item as read
router.post(
    "/:id/items/:itemId/read",
    validate(markReadSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const feedId = parseId(req.params.id,     "Feed");
        const itemId = parseId(req.params.itemId, "FeedItem");
        const item   = markRead(feedId, itemId, req.body.subscriber);
        res.json({ success: true, data: item });
    })
);

// POST /feeds/:id/read-all — mark every item in a feed as read
router.post(
    "/:id/read-all",
    validate(markReadSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const feedId = parseId(req.params.id, "Feed");
        const result = markAllRead(feedId, req.body.subscriber);
        res.json({ success: true, data: result });
    })
);

// GET /feeds/:id/unread — unread count for a subscriber
router.get(
    "/:id/unread",
    validate(unreadQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const feedId = parseId(req.params.id, "Feed");
        const q      = (req as any).validatedQuery;
        const result = unreadCount(feedId, q.subscriber);
        res.json({ success: true, data: result });
    })
);

export default router;