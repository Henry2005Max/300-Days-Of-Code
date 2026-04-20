import { Router, Request, Response, NextFunction } from "express";
import {
    fetchAndStore,
    getKeyRates,
    convert,
    getNgnSummary,
    getHistory,
    getRefreshLog,
    getStats,
    getLatestSnapshot,
} from "../services/currencyService";

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
    return (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next);
}

/* ── GET /currency/rates — key currencies from latest snapshot ── */
router.get("/rates", (req: Request, res: Response) => {
    const base = (req.query.base as string || "USD").toUpperCase();
    const result = getKeyRates(base);

    if (!result) {
        res.status(503).json({
            success: false,
            error:   "No rate data available yet — trigger POST /currency/refresh to fetch",
        });
        return;
    }

    res.json({
        success:   true,
        base:      result.snapshot.base,
        fetchedAt: result.snapshot.fetchedAt,
        data:      result.keyRates,
        meta:      { currencies: Object.keys(result.keyRates).length },
    });
});

/* ── GET /currency/ngn — Naira-focused view ── */
router.get("/ngn", (req: Request, res: Response) => {
    const summary = getNgnSummary();

    if (!summary) {
        res.status(503).json({ success: false, error: "No rate data available yet" });
        return;
    }

    res.json({
        success: true,
        message: "Nigerian Naira exchange summary",
        data:    summary,
    });
});

/* ── GET /currency/convert?from=NGN&to=USD&amount=50000 ─────────────
   Convert any amount between any two currencies.
   Uses cross-rate calculation: from → USD → to
────────────────────────────────────────────────────────────────────── */
router.get("/convert", (req: Request, res: Response) => {
    const from   = (req.query.from   as string || "").toUpperCase();
    const to     = (req.query.to     as string || "").toUpperCase();
    const amount = Number(req.query.amount);

    if (!from || !to) {
        res.status(400).json({ success: false, error: "from and to query parameters are required" });
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        res.status(400).json({ success: false, error: "amount must be a positive number" });
        return;
    }

    const result = convert(from, to, amount);

    if (!result) {
        res.status(404).json({
            success: false,
            error:   `Could not convert ${from} to ${to} — unknown currency code or no data`,
        });
        return;
    }

    /* Format for Naira */
    const ngnFormat = (n: number) =>
        n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    res.json({
        success: true,
        data:    result,
        display: `${ngnFormat(amount)} ${from} = ${ngnFormat(result.result)} ${to}`,
    });
});

/* ── GET /currency/all — all currencies from latest snapshot ── */
router.get("/all", (req: Request, res: Response) => {
    const base = (req.query.base as string || "USD").toUpperCase();
    const snapshot = getLatestSnapshot(base);

    if (!snapshot) {
        res.status(503).json({ success: false, error: "No data available" });
        return;
    }

    res.json({
        success:   true,
        base:      snapshot.base,
        fetchedAt: snapshot.fetchedAt,
        data:      snapshot.rates,
        meta:      { count: Object.keys(snapshot.rates).length },
    });
});

/* ── GET /currency/history?limit=10 ── */
router.get("/history", (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const base  = (req.query.base as string || "USD").toUpperCase();
    const snapshots = getHistory(base, limit);

    /* Return just the NGN rate from each snapshot to show rate trend */
    const trend = snapshots.map((s) => ({
        fetchedAt: s.fetchedAt,
        ngnRate:   s.rates["NGN"] ?? null,
        eurRate:   s.rates["EUR"] ?? null,
        gbpRate:   s.rates["GBP"] ?? null,
    }));

    res.json({
        success: true,
        base,
        data:    trend,
        meta:    { count: trend.length, limit },
    });
});

/* ── GET /currency/stats ── */
router.get("/stats", (req: Request, res: Response) => {
    res.json({ success: true, data: getStats() });
});

/* ── GET /currency/log — refresh job history ── */
router.get("/log", (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    res.json({ success: true, data: getRefreshLog(limit) });
});

/* ── POST /currency/refresh — manual trigger ─────────────────────────
   Immediately fetches fresh rates regardless of schedule.
   Useful for testing and for on-demand updates.
────────────────────────────────────────────────────────────────────── */
router.post("/refresh", asyncHandler(async (req: Request, res: Response) => {
    const base = (req.body?.base as string || "USD").toUpperCase();
    console.log(`[CURRENCY] Manual refresh triggered for base ${base}`);
    const snapshot = await fetchAndStore(base);
    res.json({
        success:   true,
        message:   `Rates refreshed for base ${base}`,
        snapshotId: snapshot.id,
        fetchedAt:  snapshot.fetchedAt,
        currencies: Object.keys(snapshot.rates).length,
    });
}));

export default router;