import "dotenv/config"; // MUST be first

import http from "http";
import express, { Request, Response } from "express";
import { runMigrations } from "./db/database";
import { initStatements } from "./db/statements";
import { attachWebSocketServer } from "./ws/server";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import chatRouter from "./routes/chat";

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
    runMigrations();
    initStatements(); // compile prepared statements AFTER tables exist

    app.use(express.json());
    app.use(logger);

    app.get("/health", (_req, res) => {
        res.json({ success: true, data: { status: "ok", service: "chat-api" } });
    });

    app.use("/", chatRouter);

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ success: false, error: "Route not found" });
    });

    app.use(errorHandler);

    // Create the raw HTTP server so we can share it with the WS server
    const httpServer = http.createServer(app);
    attachWebSocketServer(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`\n[server] Chat API running on http://localhost:${PORT}`);
        console.log(`[server] WebSocket endpoint: ws://localhost:${PORT}`);
        console.log("[server] GET  /rooms                   — list rooms with presence");
        console.log("[server] POST /rooms                   — create a room");
        console.log("[server] GET  /rooms/:id/messages      — message history");
        console.log("[server] GET  /dm/:username?as=ME      — DM conversation");
        console.log("[server] GET  /dm/unread/:username     — unread DM count");
        console.log("[server] GET  /stats                   — live connection stats\n");
        console.log("[ws] Client message types: join | message | dm | typing_start | typing_stop | status | ping\n");
    });
}

bootstrap().catch((err) => {
    console.error("[fatal] Failed to start:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
});