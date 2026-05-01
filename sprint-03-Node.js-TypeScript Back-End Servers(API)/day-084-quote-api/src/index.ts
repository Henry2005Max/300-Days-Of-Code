import "dotenv/config"; // MUST be first

import express, { Request, Response } from "express";
import { runMigrations } from "./db/database";
import { initStatements } from "./db/statements";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import quotesRouter from "./routes/quotes";

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
    runMigrations();
    initStatements();

    app.use(express.json());
    app.use(logger);

    app.get("/health", (_req, res) => {
        res.json({ success: true, data: { status: "ok", service: "quote-api" } });
    });

    app.use("/", quotesRouter);

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ success: false, error: "Route not found" });
    });

    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`\n[server] Quote API running on http://localhost:${PORT}`);
        console.log("[server] GET  /quotes                      — list quotes");
        console.log("[server] GET  /quotes/today                — quote of the day");
        console.log("[server] GET  /quotes/random               — random quote");
        console.log("[server] GET  /quotes/search?q=wisdom      — FTS5 full-text search");
        console.log("[server] GET  /quotes/tag/:tag             — quotes by tag");
        console.log("[server] GET  /quotes/:id                  — single quote + view count");
        console.log("[server] POST /quotes                      — create a quote");
        console.log("[server] POST /quotes/:id/favourite        — save to favourites");
        console.log("[server] GET  /favourites/:username        — user's favourites");
        console.log("[server] GET  /tags                        — all tags");
        console.log("[server] GET  /stats                       — popularity stats\n");
    });
}

bootstrap().catch((err) => {
    console.error("[fatal] Failed to start:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
});