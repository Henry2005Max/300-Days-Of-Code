import { Router, Request, Response } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/errorHandler";
import {
    forecastQuerySchema,
    compareQuerySchema,
    alertsQuerySchema,
} from "../schemas/weather.schema";
import {
    getWeather,
    getForecast,
    compareWeather,
    getAlerts,
    resolveAlert,
    listCachedCities,
} from "../services/weather.service";
import { tempUnit } from "../services/owm";

const router = Router();

// GET /weather — list all cities currently in cache
router.get("/weather", asyncHandler(async (_req: Request, res: Response) => {
    const cities = listCachedCities();
    res.json({ success: true, data: cities, meta: { total: cities.length, count: cities.length } });
}));

// GET /weather/:city — current weather (uses cache, refreshes if stale)
router.get("/weather/:city", asyncHandler(async (req: Request, res: Response) => {
    const weather = await getWeather(req.params.city);
    res.json({ success: true, data: { ...weather, unit: tempUnit() } });
}));

// GET /forecast/:city — 5-day / 3-hour forecast
router.get(
    "/forecast/:city",
    validate(forecastQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const { days } = (req as any).validatedQuery;
        const result   = await getForecast(req.params.city, days);
        res.json({
            success: true,
            data:    { ...result, unit: tempUnit() },
            meta:    { total: result.slots.length, count: result.slots.length },
        });
    })
);

// GET /compare?cities=Lagos,Abuja,Kano — multi-city comparison
router.get(
    "/compare",
    validate(compareQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const { cities } = (req as any).validatedQuery;
        const result     = await compareWeather(cities);
        res.json({ success: true, data: { ...result, unit: tempUnit() } });
    })
);

// GET /alerts — list alerts (optional ?city=Lagos&active=true)
router.get(
    "/alerts",
    validate(alertsQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const q      = (req as any).validatedQuery;
        const alerts = getAlerts(q.city, q.active);
        res.json({ success: true, data: alerts, meta: { total: alerts.length, count: alerts.length } });
    })
);

// PATCH /alerts/:id/resolve — manually resolve an alert
router.patch(
    "/alerts/:id/resolve",
    asyncHandler(async (req: Request, res: Response) => {
        const id    = parseInt(req.params.id, 10);
        const alert = resolveAlert(id);
        res.json({ success: true, data: alert });
    })
);

export default router;