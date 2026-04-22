import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { requestLogger } from "./middleware/logger";
import { runMigrations } from "./db/database";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";

runMigrations();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

app.get("/", (req: Request, res: Response) => {
    res.json({
        api:    process.env.APP_NAME,
        day:    75,
        author: "Henry Ehindero — Lagos, Nigeria 🇳🇬",
        description: "Complete user registration and management system",
        authEndpoints: [
            { method: "POST", path: "/auth/register",               description: "Register — name, email, password, confirmPassword" },
            { method: "POST", path: "/auth/login",                  description: "Login — returns JWT" },
        ],
        userEndpoints: [
            { method: "GET",    path: "/users/me",                  description: "Get profile (auth required)" },
            { method: "PATCH",  path: "/users/me",                  description: "Update name, bio, avatarUrl" },
            { method: "POST",   path: "/users/me/change-password",  description: "Change password (requires currentPassword)" },
            { method: "POST",   path: "/users/me/change-email",     description: "Change email (requires currentPassword)" },
            { method: "GET",    path: "/users/me/login-history",    description: "Last 10 login attempts" },
            { method: "DELETE", path: "/users/me",                  description: "Delete account (requires password + confirm: 'DELETE')" },
        ],
        passwordPolicy: "Min 8 chars, at least 1 uppercase, at least 1 number",
    });
});

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", uptime: `${Math.floor(process.uptime())}s`, timestamp: new Date().toISOString() });
});

app.use("/auth",  authRouter);
app.use("/users", usersRouter);

app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`[ERROR] ${err.message}`);
    res.status(500).json({ success: false, error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`\n┌──────────────────────────────────────┐`);
    console.log(`│  ${process.env.APP_NAME} — Day 75      │`);
    console.log(`│  http://localhost:${PORT}              │`);
    console.log(`│  Day 75 · Sprint 3 · Lagos, Nigeria    │`);
    console.log(`└────────────────────────────────────────┘\n`);
    console.log(`  POST http://localhost:${PORT}/auth/register`);
    console.log(`  POST http://localhost:${PORT}/auth/login`);
    console.log(`  GET  http://localhost:${PORT}/users/me       (needs token)\n`);
});