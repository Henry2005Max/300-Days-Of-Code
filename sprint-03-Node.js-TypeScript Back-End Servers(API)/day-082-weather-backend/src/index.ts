import "dotenv/config"; // MUST be first

import express, { Request, Response } from "express";
import { runMigrations } from "./db/database";
import { initStatements } from "./db/statements";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import weatherRouter from "./routes/weather";

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
    // Tables first, statements second — avoids the Day 81 "no such table" bug
    runMigrations();
    initStatements();

    app.use(express.json());
    app.use(logger);

    app.get("/health", (_req, res) => {
        res.json({ success: true, data: { status: "ok", service: "weather-backend" } });
    });

    app.use("/", weatherRouter);

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ success: false, error: "Route not found" });
    });

    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`\n[server] Weather Backend running on http://localhost:${PORT}`);
        console.log("[server] GET  /weather               — all cached cities");
        console.log("[server] GET  /weather/:city          — current weather (cached)");
        console.log("[server] GET  /forecast/:city         — 5-day forecast");
        console.log("[server] GET  /compare?cities=A,B,C   — multi-city comparison");
        console.log("[server] GET  /alerts                 — weather alerts");
        console.log("[server] PATCH /alerts/:id/resolve    — resolve an alert\n");

        const key = process.env.OPENWEATHER_API_KEY;
        if (!key || key === "your_api_key_here") {
            console.warn("[warn] OPENWEATHER_API_KEY not set — all weather endpoints will return 503\n");
        }
    });
}

bootstrap().catch((err) => {
    console.error("[fatal] Failed to start:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
});