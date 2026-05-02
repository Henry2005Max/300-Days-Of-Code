import "dotenv/config"; // MUST be first

import express, { Request, Response } from "express";
import { runMigrations } from "./db/database";
import { initStatements } from "./db/statements";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import authRouter from "./routes/auth";

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
    runMigrations();
    initStatements();

    app.use(express.json());
    app.use(logger);

    app.get("/health", (_req, res) => {
        res.json({ success: true, data: { status: "ok", service: "user-registration" } });
    });

    app.use("/", authRouter);

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ success: false, error: "Route not found" });
    });

    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`\n[server] User Registration API running on http://localhost:${PORT}`);
        console.log("[server] POST  /auth/register              — register a new user");
        console.log("[server] POST  /auth/verify-email          — verify email with token");
        console.log("[server] POST  /auth/login                 — login → access + refresh tokens");
        console.log("[server] POST  /auth/refresh               — rotate refresh token");
        console.log("[server] POST  /auth/logout                — revoke all refresh tokens");
        console.log("[server] POST  /auth/forgot-password       — request password reset token");
        console.log("[server] POST  /auth/reset-password        — reset password with token");
        console.log("[server] GET   /auth/me                    — current user profile [auth]");
        console.log("[server] GET   /auth/me/login-history      — login audit log [auth]");
        console.log("[server] POST  /auth/me/change-password    — change password [auth]");
        console.log("[server] GET   /admin/users                — list users [admin]");
        console.log("[server] PATCH /admin/users/:id/status     — update user status [admin]\n");
    });
}

bootstrap().catch((err) => {
    console.error("[fatal] Failed to start:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
});