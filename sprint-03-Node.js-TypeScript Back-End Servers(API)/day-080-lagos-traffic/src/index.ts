import "dotenv/config"; // MUST be first

import express, { Request, Response } from "express";
import cron from "node-cron";
import { runMigrations } from "./db/database";
import { runSimulationTick } from "./services/simulator";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import trafficRouter from "./routes/traffic";

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

// How often to refresh traffic (default every 2 minutes)
const INTERVAL = Number(process.env.TRAFFIC_REFRESH_INTERVAL_MINUTES) || 2;

async function bootstrap(): Promise<void> {
    runMigrations();

    // Run one tick immediately so traffic_states has real values on first request
    runSimulationTick();

    // Schedule subsequent ticks using node-cron
    // cron expression: "*/2 * * * *" = every 2 minutes
    const cronExpression = `*/${INTERVAL} * * * *`;
    cron.schedule(cronExpression, () => {
        runSimulationTick();
    });
    console.log(`[cron] Traffic simulation scheduled every ${INTERVAL} minute(s)`);

    app.use(express.json());
    app.use(logger);

    app.get("/health", (_req, res) => {
        res.json({ success: true, data: { status: "ok", service: "lagos-traffic" } });
    });

    app.use("/", trafficRouter);

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ success: false, error: "Route not found" });
    });

    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`\n[server] Lagos Traffic API running on http://localhost:${PORT}`);
        console.log("[server] GET    /traffic                   — city-wide overview");
        console.log("[server] GET    /landmarks                 — all Lagos landmarks");
        console.log("[server] GET    /routes                    — all routes with live traffic");
        console.log("[server] GET    /routes/:id                — single route detail");
        console.log("[server] GET    /incidents                 — list incidents");
        console.log("[server] POST   /incidents                 — report a new incident");
        console.log("[server] PATCH  /incidents/:id/resolve     — resolve an incident");
        console.log("[server] GET    /history                   — traffic history snapshots\n");
    });
}

bootstrap().catch((err) => {
    console.error("[fatal] Failed to start:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
});