import "dotenv/config"; // MUST be first

import express, { Request, Response } from "express";
import { runMigrations } from "./db/database";
import { initStatements } from "./db/statements";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import feedsRouter from "./routes/feeds";

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
    runMigrations();
    initStatements();

    app.use(express.json());
    app.use(logger);

    app.get("/health", (_req, res) => {
        res.json({ success: true, data: { status: "ok", service: "rss-advanced" } });
    });

    app.use("/", feedsRouter);

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ success: false, error: "Route not found" });
    });

    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`\n[server] Advanced RSS Parser on http://localhost:${PORT}`);
        console.log("[server] POST   /discover                          — find RSS feeds on a website");
        console.log("[server] POST   /feeds                             — subscribe to a feed URL");
        console.log("[server] GET    /feeds                             — list subscriptions");
        console.log("[server] GET    /feeds/:id/items                   — browse items");
        console.log("[server] POST   /feeds/:id/refresh                 — force refresh");
        console.log("[server] POST   /feeds/:id/items/:itemId/read      — mark item read");
        console.log("[server] POST   /feeds/:id/read-all                — mark all read");
        console.log("[server] GET    /feeds/:id/unread?subscriber=X     — unread count");
        console.log("[server] GET    /feeds/:id/filters                 — list keyword filters");
        console.log("[server] POST   /feeds/:id/filters                 — add keyword filter");
        console.log("[server] DELETE /feeds/:id/filters/:filterId       — remove filter");
        console.log("[server] GET    /digest?subscriber=X               — multi-feed digest\n");
    });
}

bootstrap().catch((err) => {
    console.error("[fatal] Failed to start:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
});