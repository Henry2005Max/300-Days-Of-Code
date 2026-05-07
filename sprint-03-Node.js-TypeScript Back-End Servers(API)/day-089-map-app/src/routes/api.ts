// REST API routes — all under /api/*
// The frontend HTML page calls these endpoints via fetch().
// The Google Maps API key is never sent to the browser — only the map
// initialisation script tag uses it (via the server-rendered HTML page).

import { Router, Request, Response } from "express";
import { asyncHandler, NotFoundError } from "../middleware/errorHandler";
import {
    getLandmarks, getLandmarkById, searchLandmarks,
    geocode, getDirections, recentSearches,
} from "../services/maps.service";

const router = Router();

// ── Landmarks ─────────────────────────────────────────────────────────────────

// GET /api/landmarks?city=Lagos&category=market
router.get("/api/landmarks", asyncHandler(async (req: Request, res: Response) => {
    const city     = req.query.city     as string | undefined;
    const category = req.query.category as string | undefined;
    const q        = req.query.q        as string | undefined;

    const landmarks = q ? searchLandmarks(q) : getLandmarks(city, category);
    res.json({ success: true, data: landmarks, meta: { total: landmarks.length, count: landmarks.length } });
}));

// GET /api/landmarks/:id
router.get("/api/landmarks/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundError("Landmark", req.params.id);
    res.json({ success: true, data: getLandmarkById(id) });
}));

// ── Geocoding ─────────────────────────────────────────────────────────────────

// GET /api/geocode?address=Lagos+Island
router.get("/api/geocode", asyncHandler(async (req: Request, res: Response) => {
    const address = req.query.address as string | undefined;
    if (!address?.trim()) {
        return res.status(400).json({ success: false, error: "?address= is required" });
    }
    const result = await geocode(address);
    res.json({ success: true, data: result });
}));

// GET /api/geocode/history
router.get("/api/geocode/history", asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: recentSearches() });
}));

// ── Directions ────────────────────────────────────────────────────────────────

// GET /api/directions?origin=Lagos+Airport&destination=Victoria+Island
router.get("/api/directions", asyncHandler(async (req: Request, res: Response) => {
    const origin      = req.query.origin      as string | undefined;
    const destination = req.query.destination as string | undefined;

    if (!origin?.trim() || !destination?.trim()) {
        return res.status(400).json({ success: false, error: "?origin= and ?destination= are required" });
    }

    const result = await getDirections(origin, destination);
    res.json({ success: true, data: result });
}));

export default router;