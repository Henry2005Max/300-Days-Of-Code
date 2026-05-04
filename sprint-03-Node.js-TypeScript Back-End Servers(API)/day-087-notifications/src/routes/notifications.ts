import { Router, Request, Response } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler, NotFoundError } from "../middleware/errorHandler";
import { enqueueSchema, listJobsSchema, preferenceSchema } from "../schemas/notification.schema";
import {
    enqueue, getJob, listJobs, retryJob, getJobLogs,
    getQueueStats, upsertPreference, getPreference, listPreferences,
} from "../services/notification.service";

const router = Router();

function parseId(raw: string): number {
    const id = parseInt(raw, 10);
    if (isNaN(id)) throw new NotFoundError("Job", raw);
    return id;
}

// ── Notifications (queue) ─────────────────────────────────────────────────────

// POST /notifications — enqueue a notification for async delivery
router.post("/notifications", validate(enqueueSchema), asyncHandler(async (req: Request, res: Response) => {
    const job = enqueue(req.body);
    res.status(202).json({
        success: true,
        data: job,
        _note: "Job queued. It will be delivered by the background worker.",
    });
}));

// GET /notifications — list jobs with optional status filter
router.get(
    "/notifications",
    validate(listJobsSchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const q            = (req as any).validatedQuery;
        const { rows, total } = listJobs(q);
        res.json({ success: true, data: rows, meta: { total, count: rows.length } });
    })
);

// GET /notifications/stats — queue health at a glance
router.get("/notifications/stats", asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: getQueueStats() });
}));

// GET /notifications/:id — single job
router.get("/notifications/:id", asyncHandler(async (req: Request, res: Response) => {
    const job = getJob(parseId(req.params.id));
    res.json({ success: true, data: job });
}));

// GET /notifications/:id/logs — delivery attempt log
router.get("/notifications/:id/logs", asyncHandler(async (req: Request, res: Response) => {
    const logs = getJobLogs(parseId(req.params.id));
    res.json({ success: true, data: logs, meta: { total: logs.length, count: logs.length } });
}));

// POST /notifications/:id/retry — re-queue a failed or dead job
router.post("/notifications/:id/retry", asyncHandler(async (req: Request, res: Response) => {
    const job = retryJob(parseId(req.params.id));
    res.json({ success: true, data: job });
}));

// ── User preferences ──────────────────────────────────────────────────────────

// PUT /preferences/:username — create or update notification preferences
router.put(
    "/preferences/:username",
    validate(preferenceSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const pref = upsertPreference({ ...req.body, username: req.params.username });
        res.json({ success: true, data: pref });
    })
);

// GET /preferences/:username
router.get("/preferences/:username", asyncHandler(async (req: Request, res: Response) => {
    const pref = getPreference(req.params.username);
    res.json({ success: true, data: pref });
}));

// GET /preferences — list all preferences
router.get("/preferences", asyncHandler(async (_req: Request, res: Response) => {
    const prefs = listPreferences();
    res.json({ success: true, data: prefs, meta: { total: prefs.length, count: prefs.length } });
}));

export default router;