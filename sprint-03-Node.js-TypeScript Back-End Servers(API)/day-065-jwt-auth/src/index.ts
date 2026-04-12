import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { requestLogger } from "./middleware/logger";
import { runMigrations, seedData } from "./db/database";
import authRouter from "./routes/auth";
import studentsRouter from "./routes/students";

runMigrations();
seedData();

const app = express();
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "AuthAPI";

app.use(express.json());
app.use(requestLogger);

app.get("/", (req: Request, res: Response) => {
  res.json({
    api: APP_NAME,
    version: "1.0.0",
    day: 65,
    author: "Henry Ehindero — Lagos, Nigeria 🇳🇬",
    endpoints: [
      { method: "POST", path: "/auth/register",  description: "Register a new user — returns JWT" },
      { method: "POST", path: "/auth/login",     description: "Login — returns JWT" },
      { method: "GET",  path: "/auth/me",        description: "Get current user — requires token" },
      { method: "GET",  path: "/auth/users",     description: "List all users — admin only" },
      { method: "GET",  path: "/students",       description: "All students — requires token" },
      { method: "GET",  path: "/students/:id",   description: "Single student — requires token" },
      { method: "POST", path: "/students",       description: "Create student — requires token" },
      { method: "DELETE", path: "/students/:id", description: "Delete student — requires token" },
    ],
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: `${Math.floor(process.uptime())}s`, timestamp: new Date().toISOString() });
});

app.use("/auth", authRouter);
app.use("/students", studentsRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n┌──────────────────────────────────────────┐`);
  console.log(`│  ${APP_NAME} — Day 65                    │`);
  console.log(`│  http://localhost:${PORT}                    │`);
  console.log(`│  Day 65 · Sprint 3 · Nigeria    │`);
  console.log(`└──────────────────────────────────────────┘\n`);
  console.log(`  POST http://localhost:${PORT}/auth/register`);
  console.log(`  POST http://localhost:${PORT}/auth/login`);
  console.log(`  GET  http://localhost:${PORT}/auth/me  (needs token)`);
  console.log(`  GET  http://localhost:${PORT}/students (needs token)\n`);
});