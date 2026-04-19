import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
    getAllLocations,
    getLocation,
    getCurrentWeather,
    getHistory,
    getStats,
} from "../services/weatherService";

const router = Router();

/* ── asyncHandler ── */
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/* ── GET /weather/locations — list all cities ── */
router.get("/locations", (req: Request, res: Response) => {
    const locations = getAllLocations();
    res.json({
        success: true,
        data:    locations,
        meta:    { count: locations.length },
    });
});

/* ── GET /weather/stats — fetch statistics ── */
router.get("/stats", (req: Request, res: Response) => {
    res.json({ success: true, data: getStats() });
});

/* ── GET /weather/:slug — current weather ────────────────────────────
   If a fresh reading is in the database, return it.
   Otherwise call Open-Meteo, store the result, and return it.
────────────────────────────────────────────────────────────────────── */
router.get("/:slug", asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const location = getLocation(slug);
    if (!location) {
        res.status(404).json({
            success: false,
            error:   `Location "${slug}" not found`,
            hint:    "Use GET /weather/locations for the full list",
        });
        return;
    }

    const { reading, fromCache, location: loc } = await getCurrentWeather(slug);

    res.json({
        success:   true,
        fromCache,
        cachedAgeSeconds: fromCache
            ? Math.round((Date.now() - new Date(reading.fetchedAt).getTime()) / 1000)
            : 0,
        data: {
            location: {
                name:      loc.name,
                state:     loc.state,
                latitude:  loc.latitude,
                longitude: loc.longitude,
                timezone:  loc.timezone,
            },
            current: {
                temperature: reading.temperature,
                feelsLike:   reading.feelsLike,
                humidity:    reading.humidity,
                windSpeed:   reading.windSpeed,
                description: reading.description,
                isDay:       reading.isDay,
                fetchedAt:   reading.fetchedAt,
            },
            forecast: reading.forecast,
        },
    });
}));

/* ── GET /weather/:slug/history?limit=24 ── */
router.get("/:slug/history", (req: Request, res: Response) => {
    const { slug } = req.params;
    const limit = Math.min(Number(req.query.limit) || 24, 168); /* max 1 week */

    const result = getHistory(slug, limit);

    if (!result) {
        res.status(404).json({ success: false, error: `Location "${slug}" not found` });
        return;
    }

    /* Build a summary showing temperature trend */
    const temps = result.readings.map((r) => r.temperature);
    const avgTemp = temps.length
        ? Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10
        : null;

    res.json({
        success: true,
        data: {
            location: {
                name:  result.location.name,
                state: result.location.state,
            },
            summary: {
                readingCount: result.readings.length,
                avgTemperature: avgTemp,
                latestFetch: result.readings[0]?.fetchedAt ?? null,
            },
            readings: result.readings,
        },
        meta: { count: result.readings.length, limit },
    });
});

export default router;