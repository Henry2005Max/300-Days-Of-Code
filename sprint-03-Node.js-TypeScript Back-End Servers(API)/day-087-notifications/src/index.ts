import "dotenv/config"; // MUST be first

import express, { Request, Response } from "express";
import cron from "node-cron";
import { runMigrations } from "./db/database";
import { initStatements } from "./db/statements";
import { initMailer } from "./services/mailer";
import { runWorkerTick } from "./services/queue";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import notificationsRouter from "./routes/notifications";

const app      = express();
const PORT     = Number(process.env.PORT) || 3000;
const POLL_SEC = Number(process.env.QUEUE_POLL_INTERVAL_SECONDS) || 5;

async function bootstrap(): Promise<void> {
    // Tables first, statements second — the Day 81 lesson
    runMigrations();
    initStatements();

    // Init Nodemailer (auto-creates Ethereal account if no SMTP creds)
    await initMailer();

    // Schedule the queue worker
    // node-cron minimum granularity is 1 second with the `seconds: true` option
    const expr = POLL_SEC < 60
        ? `*/${POLL_SEC} * * * * *`   // every N seconds
        : `*/${Math.floor(POLL_SEC / 60)} * * * *`; // every N minutes

    cron.schedule(expr, async () => {
        try {
            await runWorkerTick();
        } catch (err: any) {
            console.error("[worker] Tick error:", err.message);
        }
    }, { scheduled: true, timezone: "Africa/Lagos" });

    console.log(`[worker] Queue worker scheduled every ${POLL_SEC} seconds`);

    // Run one tick immediately so queued jobs don't wait for the first cron fire
    await runWorkerTick();

    app.use(express.json());
    app.use(logger);

    app.get("/health", (_req, res) => {
        res.json({ success: true, data: { status: "ok", service: "notification-service" } });
    });

    app.use("/", notificationsRouter);

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ success: false, error: "Route not found" });
    });

    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`\n[server] Advanced Notification Service on http://localhost:${PORT}`);
        console.log("[server] POST  /notifications                — enqueue a notification");
        console.log("[server] GET   /notifications                — list jobs");
        console.log("[server] GET   /notifications/stats          — queue health");
        console.log("[server] GET   /notifications/:id            — single job");
        console.log("[server] GET   /notifications/:id/logs       — delivery attempt log");
        console.log("[server] POST  /notifications/:id/retry      — retry failed/dead job");
        console.log("[server] PUT   /preferences/:username        — set user preferences");
        console.log("[server] GET   /preferences/:username        — get user preferences\n");
    });
}

bootstrap().catch((err) => {
    console.error("[fatal] Failed to start:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
});