import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { requestLogger } from "./middleware/logger";
import { runMigrations, seedData } from "./db/database";
import studentsRouter from "./routes/students";

/* ── Run database setup before starting the server ───────────────────
   This order is critical:
   1. runMigrations() — creates tables if they don't exist
   2. seedData()      — inserts initial data if the table is empty
   3. app.listen()    — only start accepting requests after DB is ready
────────────────────────────────────────────────────────────────────── */
runMigrations();
seedData();

const app = express();
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "StudentRecordsAPI";

app.use(express.json());
app.use(requestLogger);

app.get("/", (req: Request, res: Response) => {
  res.json({
    api: APP_NAME,
    version: "1.0.0",
    description: "Student Records API — now with SQLite persistence",
    day: 64,
    author: "Henry Ehindero — Lagos, Nigeria 🇳🇬",
    database: process.env.DB_FILE,
    endpoints: [
      { method: "GET",    path: "/students",       description: "All students. Supports ?track= ?level= ?city= ?gdgMember=" },
      { method: "GET",    path: "/students/stats", description: "Aggregate stats" },
      { method: "GET",    path: "/students/:id",   description: "Single student by ID" },
      { method: "POST",   path: "/students",       description: "Create student" },
      { method: "PUT",    path: "/students/:id",   description: "Update student" },
      { method: "DELETE", path: "/students/:id",   description: "Delete student" },
    ],
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: `${Math.floor(process.uptime())}s`, timestamp: new Date().toISOString() });
});

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
  console.log(`│  ${APP_NAME}                  │`);
  console.log(`│  http://localhost:${PORT}                    │`);
  console.log(`│  Day 64 · Sprint 3 · Lagos, Nigeria    │`);
  console.log(`└──────────────────────────────────────────┘\n`);
  console.log(`  Database: ${process.env.DB_FILE}`);
  console.log(`  GET  http://localhost:${PORT}/students`);
  console.log(`  GET  http://localhost:${PORT}/students/stats\n`);
});