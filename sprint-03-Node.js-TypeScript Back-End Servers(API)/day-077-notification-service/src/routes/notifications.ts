import { Router, Request, Response } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler, NotFoundError } from "../middleware/errorHandler";
import {
    createNotificationSchema,
    listQuerySchema,
} from "../schemas/notification.schema";
import {
    createAndSend,
    retryNotification,
    getById,
    list,
    getStats,
} from "../services/notification.service";
import { ApiResponse, Notification } from "../types";

const router = Router();

// POST /notifications — create and immediately send a notification
router.post(
    "/",
    validate(createNotificationSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const notification = await createAndSend(req.body);
        const response: ApiResponse<Notification> = { success: true, data: notification };
        res.status(201).json(response);
    })
);

// GET /notifications — list with optional filters
router.get(
    "/",
    validate(listQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const q = (req as any).validatedQuery;
        const { rows, total } = list(q);
        const response: ApiResponse<Notification[]> = {
            success: true,
            data: rows,
            meta: { total, count: rows.length },
        };
        res.json(response);
    })
);

// GET /notifications/stats — delivery statistics
router.get(
    "/stats",
    asyncHandler(async (_req: Request, res: Response) => {
        const stats = getStats();
        res.json({ success: true, data: stats });
    })
);

// GET /notifications/:id — single notification
router.get(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) throw new NotFoundError("Notification", req.params.id);
        const notification = getById(id);
        res.json({ success: true, data: notification });
    })
);

// POST /notifications/:id/retry — retry a failed notification
router.post(
    "/:id/retry",
    asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) throw new NotFoundError("Notification", req.params.id);
        const notification = await retryNotification(id);
        res.json({ success: true, data: notification });
    })
);

export default router;