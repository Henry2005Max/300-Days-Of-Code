import "dotenv/config"; // MUST be first

import express, { Request, Response } from "express";
import { runMigrations } from "./db/database";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import feedsRouter from "./routes/feeds";

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
    runMigrations();

    app.use(express.json());
    app.use(logger);

    app.get("/health", (_req, res) => {
        res.json({ success: true, data: { status: "ok", service: "rss-parser" } });
    });

    app.use("/feeds", feedsRouter);

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ success: false, error: "Route not found" });
    });

    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`\n[server] RSS Parser running on http://localhost:${PORT}`);
        console.log("[server] POST   /feeds                          — subscribe to a feed");
        console.log("[server] GET    /feeds                          — list all subscriptions");
        console.log("[server] GET    /feeds/:id/items                — list items (cached)");
        console.log("[server] POST   /feeds/:id/items/:itemId/read   — mark item read");
        console.log("[server] POST   /feeds/:id/read-all             — mark all read");
        console.log("[server] GET    /feeds/:id/unread?subscriber=X  — unread count");
        console.log("[server] POST   /feeds/:id/refresh              — force cache refresh\n");
    });
}

bootstrap().catch((err) => {
    console.error("[fatal] Failed to start:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
});