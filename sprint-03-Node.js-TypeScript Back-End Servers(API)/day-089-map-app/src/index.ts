import "dotenv/config"; // MUST be first

import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { runMigrations } from "./db/database";
import { initStatements } from "./db/statements";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import apiRouter from "./routes/api";

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
    runMigrations();
    initStatements();

    app.use(express.json());
    app.use(logger);

    // ── JSON API ────────────────────────────────────────────────────────────────
    app.use("/", apiRouter);

    // ── HTML frontend ───────────────────────────────────────────────────────────
    // Serve the map page at GET /
    // We inject the Maps API script URL server-side so the API key is embedded
    // in the <script src="..."> tag — it appears in the rendered HTML but is
    // never stored in version control (the .env file is gitignored).
    // The &libraries=geometry is required for google.maps.geometry.encoding.decodePath()
    app.get("/", (_req: Request, res: Response) => {
        const key      = process.env.GOOGLE_MAPS_API_KEY || "";
        const htmlPath = path.join(__dirname, "views", "map.html");

        if (!fs.existsSync(htmlPath)) {
            return res.status(500).send("map.html not found — check your build setup");
        }

        let html = fs.readFileSync(htmlPath, "utf-8");

        const mapsUrl = key && key !== "your_api_key_here"
            ? `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=geometry&callback=initMap`
            : `https://maps.googleapis.com/maps/api/js?libraries=geometry&callback=initMap`;

        html = html.replace("__MAPS_SCRIPT_URL__", mapsUrl);
        res.setHeader("Content-Type", "text/html");
        res.send(html);
    });

    app.get("/health", (_req, res) => {
        res.json({ success: true, data: { status: "ok", service: "maps-app" } });
    });

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ success: false, error: "Route not found" });
    });

    app.use(errorHandler);

    app.listen(PORT, () => {
        const key = process.env.GOOGLE_MAPS_API_KEY;
        const keyOk = key && key !== "your_api_key_here";

        console.log(`\n[server] NaijaMap running on http://localhost:${PORT}`);
        console.log(`[server] Open http://localhost:${PORT} in your browser to see the map\n`);
        console.log("[api]    GET  /api/landmarks            — all Nigerian landmarks");
        console.log("[api]    GET  /api/landmarks?city=Lagos — filter by city");
        console.log("[api]    GET  /api/landmarks?q=airport  — keyword search");
        console.log("[api]    GET  /api/geocode?address=X    — geocode an address");
        console.log("[api]    GET  /api/geocode/history      — recent geocode searches");
        console.log("[api]    GET  /api/directions?origin=X&destination=Y — route\n");

        if (!keyOk) {
            console.warn("[warn] GOOGLE_MAPS_API_KEY not set — geocoding and directions return 503");
            console.warn("[warn] The map will load but markers come from seeded SQLite data (no API needed)");
            console.warn("[warn] Get a key at https://console.cloud.google.com\n");
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