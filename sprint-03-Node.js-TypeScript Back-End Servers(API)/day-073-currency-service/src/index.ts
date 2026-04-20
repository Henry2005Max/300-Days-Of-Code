import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { requestLogger } from "./middleware/logger";
import { runMigrations } from "./db/database";
import { fetchAndStore, getLatestSnapshot } from "./services/currencyService";
import { startScheduler, stopScheduler } from "./services/scheduler";
import currencyRouter from "./routes/currency";

/* ── Setup ── */
runMigrations();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

app.get("/", (req: Request, res: Response) => {
    const latest = getLatestSnapshot("USD");
    res.json({
        api:    process.env.APP_NAME,
        day:    73,
        author: "Henry Ehindero — Lagos, Nigeria 🇳🇬",
        description: "Currency service with SQLite persistence and scheduled background refresh",
        schedule:    process.env.REFRESH_CRON,
        latestData:  latest ? { fetchedAt: latest.fetchedAt, base: latest.base } : "No data yet — POST /currency/refresh",
        endpoints: [
            { method: "GET",  path: "/currency/rates",           description: "Key currencies. ?base=USD" },
            { method: "GET",  path: "/currency/ngn",             description: "Nigerian Naira summary" },
            { method: "GET",  path: "/currency/convert",         description: "Convert. ?from=NGN&to=USD&amount=50000" },
            { method: "GET",  path: "/currency/all",             description: "All ~170 currencies" },
            { method: "GET",  path: "/currency/history",         description: "Rate snapshots over time" },
            { method: "GET",  path: "/currency/stats",           description: "Service statistics" },
            { method: "GET",  path: "/currency/log",             description: "Background job run history" },
            { method: "POST", path: "/currency/refresh",         description: "Manually trigger a fresh fetch" },
        ],
    });
});

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", uptime: `${Math.floor(process.uptime())}s`, timestamp: new Date().toISOString() });
});

app.use("/currency", currencyRouter);

app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`[ERROR] ${err.message}`);
    res.status(500).json({ success: false, error: err.message || "Internal server error" });
});

const server = app.listen(PORT, async () => {
    console.log(`\n┌──────────────────────────────────────────┐`);
    console.log(`│  ${process.env.APP_NAME} — Day 73          │`);
    console.log(`│  http://localhost:${PORT}                    │`);
    console.log(`│  Day 73 · Sprint 3 · Lagos, Nigeria    │`);
    console.log(`└──────────────────────────────────────────┘\n`);

    /* ── Initial fetch on startup ────────────────────────────────────────
       If there's no data in the DB yet, fetch immediately so the API
       is usable right away. Otherwise use what's already stored.
    ──────────────────────────────────────────────────────────────────── */
    const existing = getLatestSnapshot("USD");
    if (!existing) {
        console.log("[STARTUP] No data in DB — performing initial fetch...");
        try {
            await fetchAndStore("USD");
        } catch (err: any) {
            console.error(`[STARTUP] Initial fetch failed: ${err.message}`);
            console.log("[STARTUP] Server still running — use POST /currency/refresh to retry");
        }
    } else {
        console.log(`[STARTUP] Using existing snapshot from ${existing.fetchedAt}`);
    }

    /* Start the background scheduler */
    startScheduler();

    console.log(`\n  GET  http://localhost:${PORT}/currency/rates`);
    console.log(`  GET  http://localhost:${PORT}/currency/ngn`);
    console.log(`  GET  http://localhost:${PORT}/currency/convert?from=NGN&to=USD&amount=50000`);
    console.log(`  POST http://localhost:${PORT}/currency/refresh\n`);
});

process.on("SIGTERM", () => {
    stopScheduler();
    server.close(() => process.exit(0));
});