import "dotenv/config"; // MUST be first

import express, { Request, Response } from "express";
import { runMigrations } from "./db/database";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import mapRouter from "./routes/map";

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
    runMigrations();

    app.use(express.json());
    app.use(logger);

    app.get("/health", (_req, res) => {
        res.json({ success: true, data: { status: "ok", service: "map-api" } });
    });

    app.use("/", mapRouter);

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ success: false, error: "Route not found" });
    });

    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`\n[server] Map API running on http://localhost:${PORT}`);
        console.log("[server] POST   /geocode                 — geocode an address");
        console.log("[server] GET    /geocode/history          — search history");
        console.log("[server] GET    /geocode/:id              — single cached location");
        console.log("[server] DELETE /geocode/:id              — remove from history");
        console.log("[server] POST   /distance                 — distance between two locations");
        console.log("[server] GET    /cities                   — Nigerian cities reference");
        console.log("[server] POST   /cities/distance          — distance between two cities\n");

        const key = process.env.GOOGLE_MAPS_API_KEY;
        if (!key || key === "your_api_key_here") {
            console.warn("[warn] GOOGLE_MAPS_API_KEY is not set — /geocode will return 503.");
            console.warn("[warn] /cities and /cities/distance work without an API key.\n");
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