import { Router, Request, Response } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler, NotFoundError } from "../middleware/errorHandler";
import {
    reportIncidentSchema,
    listIncidentsQuerySchema,
    listRoutesQuerySchema,
    historyQuerySchema,
} from "../schemas/traffic.schema";
import {
    listLandmarks,
    getLandmarkById,
    listRoutes,
    getRouteById,
    getOverview,
    listIncidents,
    reportIncident,
    resolveIncident,
    getHistory,
} from "../services/traffic.service";

const router = Router();

function parseId(raw: string, label: string): number {
    const id = parseInt(raw, 10);
    if (isNaN(id)) throw new NotFoundError(label, raw);
    return id;
}

// ── Overview ─────────────────────────────────────────────────────────────────

// GET /traffic — city-wide snapshot: worst/best routes, active incidents, avg congestion
router.get(
    "/traffic",
    asyncHandler(async (_req: Request, res: Response) => {
        res.json({ success: true, data: getOverview() });
    })
);

// ── Landmarks ─────────────────────────────────────────────────────────────────

// GET /landmarks — list all landmarks (optionally filter by area)
router.get(
    "/landmarks",
    asyncHandler(async (req: Request, res: Response) => {
        const area      = req.query.area as string | undefined;
        const landmarks = listLandmarks(area);
        res.json({ success: true, data: landmarks, meta: { total: landmarks.length, count: landmarks.length } });
    })
);

// GET /landmarks/:id
router.get(
    "/landmarks/:id",
    asyncHandler(async (req: Request, res: Response) => {
        const landmark = getLandmarkById(parseId(req.params.id, "Landmark"));
        res.json({ success: true, data: landmark });
    })
);

// ── Routes ───────────────────────────────────────────────────────────────────

// GET /routes — list all routes with live traffic state
router.get(
    "/routes",
    validate(listRoutesQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const q      = (req as any).validatedQuery;
        const routes = listRoutes(q);
        res.json({ success: true, data: routes, meta: { total: routes.length, count: routes.length } });
    })
);

// GET /routes/:id — single route with full landmark detail and live state
router.get(
    "/routes/:id",
    asyncHandler(async (req: Request, res: Response) => {
        const route = getRouteById(parseId(req.params.id, "Route"));
        res.json({ success: true, data: route });
    })
);

// ── Incidents ────────────────────────────────────────────────────────────────

// GET /incidents — list incidents with optional filters
router.get(
    "/incidents",
    validate(listIncidentsQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const q = (req as any).validatedQuery;
        const { rows, total } = listIncidents(q);
        res.json({ success: true, data: rows, meta: { total, count: rows.length } });
    })
);

// POST /incidents — report a new incident
router.post(
    "/incidents",
    validate(reportIncidentSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const incident = reportIncident(req.body);
        res.status(201).json({ success: true, data: incident });
    })
);

// PATCH /incidents/:id/resolve — mark incident resolved
router.patch(
    "/incidents/:id/resolve",
    asyncHandler(async (req: Request, res: Response) => {
        const incident = resolveIncident(parseId(req.params.id, "Incident"));
        res.json({ success: true, data: incident });
    })
);

// ── History ───────────────────────────────────────────────────────────────────

// GET /history — time-series snapshots (last N hours)
router.get(
    "/history",
    validate(historyQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const q       = (req as any).validatedQuery;
        const history = getHistory(q);
        res.json({ success: true, data: history, meta: { total: history.length, count: history.length } });
    })
);

export default router;