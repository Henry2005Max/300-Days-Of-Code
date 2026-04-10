import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { requestLogger } from "./middleware/logger";
import studentsRouter from "./routes/students";

const app = express();
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "StudentRecordsAPI";

app.use(express.json());
app.use(requestLogger);

app.get("/", (req: Request, res: Response) => {
  res.json({
    api: APP_NAME,
    version: "1.0.0",
    description: "Student Records API with Zod schema validation",
    day: 63,
    author: "Henry Ehindero — Lagos, Nigeria 🇳🇬",
    endpoints: [
      { method: "GET",    path: "/students",          description: "All students. Supports ?track= ?level= ?city= ?gdgMember=" },
      { method: "GET",    path: "/students/stats",    description: "Aggregate stats: totals, averages, breakdowns" },
      { method: "GET",    path: "/students/:id",      description: "Single student by ID" },
      { method: "POST",   path: "/students",          description: "Create student — validated by Zod" },
      { method: "PUT",    path: "/students/:id",      description: "Update student — all fields optional" },
      { method: "DELETE", path: "/students/:id",      description: "Delete student" },
    ],
    tracks: ["Web", "Mobile", "Data", "DevOps", "UI/UX"],
    levels: ["Beginner", "Intermediate", "Advanced"],
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: `${Math.floor(process.uptime())}s`, timestamp: new Date().toISOString() });
});

app.use("/students", studentsRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found", hint: "Visit GET / for available endpoints" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n┌──────────────────────────────────────────┐`);
  console.log(`│  ${APP_NAME}                               │`);
  console.log(`│  http://localhost:${PORT}                  │`);
  console.log(`│  Day 63 · Sprint 3 · Lagos, Nigeria        │`);
  console.log(`└──────────────────────────────────────────--┘\n`);
  console.log(`  GET  http://localhost:${PORT}/students`);
  console.log(`  GET  http://localhost:${PORT}/students/stats`);
  console.log(`  GET  http://localhost:${PORT}/students?track=Mobile`);
  console.log(`  POST http://localhost:${PORT}/students\n`);
});