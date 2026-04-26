import { Router, Request, Response } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler, NotFoundError } from "../middleware/errorHandler";
import {
    geocodeSchema,
    historyQuerySchema,
    distanceSchema,
    citiesQuerySchema,
} from "../schemas/map.schema";
import {
    geocode,
    listHistory,
    getLocationById,
    deleteLocation,
    calculateDistance,
    listCities,
    distanceBetweenCities,
} from "../services/map.service";

const router = Router();

function parseId(raw: string, label: string): number {
    const id = parseInt(raw, 10);
    if (isNaN(id)) throw new NotFoundError(label, raw);
    return id;
}

// ── Geocoding ────────────────────────────────────────────────────────────────

// POST /geocode — geocode an address (uses cache when available)
router.post(
    "/geocode",
    validate(geocodeSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const location = await geocode(req.body.address);
        res.status(location.from_cache ? 200 : 201).json({ success: true, data: location });
    })
);

// GET /geocode/history — paginated search history
router.get(
    "/geocode/history",
    validate(historyQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const q = (req as any).validatedQuery;
        const { rows, total } = listHistory(q);
        res.json({ success: true, data: rows, meta: { total, count: rows.length } });
    })
);

// GET /geocode/:id — single cached location by ID
router.get(
    "/geocode/:id",
    asyncHandler(async (req: Request, res: Response) => {
        const location = getLocationById(parseId(req.params.id, "Location"));
        res.json({ success: true, data: location });
    })
);

// DELETE /geocode/:id — remove a location from history
router.delete(
    "/geocode/:id",
    asyncHandler(async (req: Request, res: Response) => {
        deleteLocation(parseId(req.params.id, "Location"));
        res.json({ success: true, data: { message: "Location removed from history" } });
    })
);

// ── Distance ─────────────────────────────────────────────────────────────────

// POST /distance — calculate distance between two geocoded location IDs
router.post(
    "/distance",
    validate(distanceSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const result = calculateDistance(req.body.from_id, req.body.to_id);
        res.json({ success: true, data: result });
    })
);

// ── Nigerian cities ──────────────────────────────────────────────────────────

// GET /cities — list Nigerian cities (seeded reference data, no API needed)
router.get(
    "/cities",
    validate(citiesQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const q      = (req as any).validatedQuery;
        const cities = listCities(q);
        res.json({ success: true, data: cities, meta: { total: cities.length, count: cities.length } });
    })
);

// GET /cities/:id — single city
router.get(
    "/cities/:id",
    asyncHandler(async (req: Request, res: Response) => {
        const { getCityById } = await import("../services/map.service");
        const city = getCityById(parseId(req.params.id, "City"));
        res.json({ success: true, data: city });
    })
);

// POST /cities/distance — distance between two seeded Nigerian cities (no API key needed)
router.post(
    "/cities/distance",
    validate(distanceSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const result = distanceBetweenCities(req.body.from_id, req.body.to_id);
        res.json({ success: true, data: result });
    })
);

export default router;