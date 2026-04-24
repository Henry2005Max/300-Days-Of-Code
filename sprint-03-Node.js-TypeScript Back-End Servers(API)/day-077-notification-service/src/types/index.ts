import "dotenv/config"; // MUST be first — loads .env before anything else reads process.env

import express, { Request, Response, NextFunction } from "express";
import { runMigrations } from "./db/database";
import { initMailer } from "./services/mailer";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import notificationsRouter from "./routes/notifications";

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

// ── Startup ──────────────────────────────────────────────────────────────────

async function bootstrap(): Promise<void> {
    // 1. Run SQLite migrations (creates tables if they don't exist)
    runMigrations();

    // 2. Initialise Nodemailer (creates an Ethereal account if no SMTP creds in .env)
    await initMailer();

    // ── Middleware ───────────────────────────────────────────────────────────

    app.use(express.json());
    app.use(logger);

    // ── Routes ───────────────────────────────────────────────────────────────

    app.get("/health", (_req, res) => {
        res.json({ success: true, data: { status: "ok", service: "notification-service" } });
    });

    app.use("/notifications", notificationsRouter);

    // ── 404 handler ──────────────────────────────────────────────────────────
    // Must come AFTER all routes and BEFORE the error handler

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ success: false, error: "Route not found" });
    });

    // ── Global error handler ─────────────────────────────────────────────────
    // 4-parameter signature tells Express this is an error handler

    app.use(errorHandler);

    // ── Listen ───────────────────────────────────────────────────────────────

    app.listen(PORT, () => {
        console.log(`\n[server] Notification service running on http://localhost:${PORT}`);
        console.log("[server] POST /notifications  — send a notification");
        console.log("[server] GET  /notifications  — list notifications");
        console.log("[server] GET  /notifications/stats — delivery stats");
        console.log("[server] GET  /notifications/:id — single notification");
        console.log("[server] POST /notifications/:id/retry — retry failed\n");
    });
}

bootstrap().catch((err) => {
    console.error("[fatal] Failed to start server:", err);
    process.exit(1);
});

// Handle unhandled promise rejections so the process doesn't silently die
process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
});
