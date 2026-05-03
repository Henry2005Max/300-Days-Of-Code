import "dotenv/config"; // MUST be first

import express, { Request, Response } from "express";
import path from "path";
import { runMigrations } from "./db/database";
import { initStatements } from "./db/statements";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import filesRouter from "./routes/files";

const app      = express();
const PORT     = Number(process.env.PORT)     || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR     || "uploads";

async function bootstrap(): Promise<void> {
    runMigrations();
    initStatements();

    app.use(express.json());
    app.use(logger);

    // Serve uploaded files statically at /uploads/:filename
    // This is a fallback — the primary serving route is GET /files/:filename
    // which checks the DB before serving. The static middleware is faster
    // but bypasses the active-status check.
    app.use("/uploads", express.static(path.resolve(UPLOAD_DIR)));

    app.get("/health", (_req, res) => {
        res.json({ success: true, data: { status: "ok", service: "file-upload" } });
    });

    app.use("/", filesRouter);

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ success: false, error: "Route not found" });
    });

    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`\n[server] File Upload API running on http://localhost:${PORT}`);
        console.log("[server] GET  /files/info           — accepted types and limits");
        console.log("[server] GET  /files/stats          — upload statistics");
        console.log("[server] POST /files/upload         — upload one file (field: 'file')");
        console.log("[server] POST /files/upload-many    — upload multiple files (field: 'files')");
        console.log("[server] GET  /files                — list all files");
        console.log("[server] GET  /files/:id            — file metadata by ID");
        console.log("[server] GET  /files/:filename      — serve file bytes");
        console.log("[server] DELETE /files/:id          — delete a file\n");
        console.log(`[server] Upload directory: ${path.resolve(UPLOAD_DIR)}\n`);
    });
}

bootstrap().catch((err) => {
    console.error("[fatal] Failed to start:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
});