import "dotenv/config"; // MUST be first

import express, { Request, Response } from "express";
import cron from "node-cron";
import { runMigrations } from "./db/database";
import { initStatements } from "./db/statements";
import { refreshRates } from "./services/currency.service";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import currencyRouter from "./routes/currency";

const app      = express();
const PORT     = Number(process.env.PORT) || 3000;
const INTERVAL = Number(process.env.RATES_REFRESH_INTERVAL_MINUTES) || 60;

async function bootstrap(): Promise<void> {
    // Tables first, statements second — the Day 81 lesson
    runMigrations();
    initStatements();

    // Fetch rates once on startup so the database is not empty before first request
    console.log("[startup] Fetching initial exchange rates...");
    try {
        await refreshRates();
    } catch (err: any) {
        console.warn(`[startup] Initial rate fetch failed: ${err.message}`);
        console.warn("[startup] Server will start anyway. Use POST /rates/refresh to retry.\n");
    }

    // Schedule background refreshes
    const expr = `*/${INTERVAL} * * * *`;
    cron.schedule(expr, async () => {
        try {
            await refreshRates();
        } catch (err: any) {
            console.error(`[cron] Rate refresh failed: ${err.message}`);
        }
    });
    console.log(`[cron] Rate refresh scheduled every ${INTERVAL} minute(s)`);

    app.use(express.json());
    app.use(logger);

    app.get("/health", (_req, res) => {
        res.json({ success: true, data: { status: "ok", service: "currency-service" } });
    });

    app.use("/", currencyRouter);

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ success: false, error: "Route not found" });
    });

    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`\n[server] Currency Service running on http://localhost:${PORT}`);
        console.log("[server] POST   /rates/refresh              — force rate refresh");
        console.log("[server] GET    /rates/:base                — all rates for a base");
        console.log("[server] GET    /rates/:base/:currency      — single pair");
        console.log("[server] GET    /rates/:base/:currency/trend — trend analysis");
        console.log("[server] POST   /convert                    — convert an amount");
        console.log("[server] GET    /conversion-log             — conversion history");
        console.log("[server] POST   /alerts                     — create a rate alert");
        console.log("[server] GET    /alerts                     — list alerts");
        console.log("[server] DELETE /alerts/:id                 — delete an alert\n");
    });
}

bootstrap().catch((err) => {
    console.error("[fatal] Failed to start:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
});