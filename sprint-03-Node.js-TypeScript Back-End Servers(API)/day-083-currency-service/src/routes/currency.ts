import { Router, Request, Response } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler, NotFoundError } from "../middleware/errorHandler";
import {
    ratesQuerySchema,
    trendQuerySchema,
    convertSchema,
    createAlertSchema,
    logQuerySchema,
} from "../schemas/currency.schema";
import {
    refreshRates,
    getLiveRates,
    getCrossRate,
    convert,
    getTrend,
    createAlert,
    listAlerts,
    deleteAlert,
    getConversionLog,
} from "../services/currency.service";

const router = Router();

// ── Rates ─────────────────────────────────────────────────────────────────────

// POST /rates/refresh — trigger an immediate rate refresh (bypasses cron schedule)
router.post("/rates/refresh", asyncHandler(async (_req: Request, res: Response) => {
    const result = await refreshRates();
    res.json({ success: true, data: result });
}));

// GET /rates/:base — all live rates for a base currency (optional ?currencies=NGN,GBP,EUR)
router.get(
    "/rates/:base",
    validate(ratesQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const base  = req.params.base.toUpperCase();
        const { currencies } = (req as any).validatedQuery;
        const rates = getLiveRates(base, currencies);
        res.json({
            success: true,
            data: rates,
            meta: { total: rates.length, count: rates.length },
        });
    })
);

// GET /rates/:base/:currency — single pair live rate
router.get(
    "/rates/:base/:currency",
    asyncHandler(async (req: Request, res: Response) => {
        const from = req.params.base.toUpperCase();
        const to   = req.params.currency.toUpperCase();
        const rate = getCrossRate(from, to);
        res.json({ success: true, data: { from, to, rate } });
    })
);

// GET /rates/:base/:currency/trend — historical trend analysis
router.get(
    "/rates/:base/:currency/trend",
    validate(trendQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const base     = req.params.base.toUpperCase();
        const currency = req.params.currency.toUpperCase();
        const { days } = (req as any).validatedQuery;
        const trend    = getTrend(base, currency, days);
        res.json({ success: true, data: trend });
    })
);

// ── Convert ───────────────────────────────────────────────────────────────────

// POST /convert — convert an amount between any two currencies
router.post(
    "/convert",
    validate(convertSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const { from, to, amount } = req.body;
        const result = convert(from, to, amount);
        res.json({ success: true, data: result });
    })
);

// ── Conversion log ────────────────────────────────────────────────────────────

// GET /conversion-log — paginated history of all conversions
router.get(
    "/conversion-log",
    validate(logQuerySchema, "query"),
    asyncHandler(async (req: Request, res: Response) => {
        const { limit, offset } = (req as any).validatedQuery;
        const { rows, total }   = getConversionLog(limit, offset);
        res.json({ success: true, data: rows, meta: { total, count: rows.length } });
    })
);

// ── Alerts ────────────────────────────────────────────────────────────────────

// POST /alerts — create a new rate alert
router.post(
    "/alerts",
    validate(createAlertSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const alert = createAlert(req.body);
        res.status(201).json({ success: true, data: alert });
    })
);

// GET /alerts — list alerts (?active=true for only untriggered ones)
router.get(
    "/alerts",
    asyncHandler(async (req: Request, res: Response) => {
        const activeOnly = req.query.active === "true";
        const alerts     = listAlerts(activeOnly);
        res.json({ success: true, data: alerts, meta: { total: alerts.length, count: alerts.length } });
    })
);

// DELETE /alerts/:id — remove an alert
router.delete(
    "/alerts/:id",
    asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) throw new NotFoundError("Alert", req.params.id);
        deleteAlert(id);
        res.json({ success: true, data: { message: `Alert ${id} deleted` } });
    })
);

export default router;