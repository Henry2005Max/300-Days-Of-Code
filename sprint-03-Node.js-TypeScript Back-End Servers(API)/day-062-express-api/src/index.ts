import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { requestLogger } from "./middleware/logger";
import citiesRouter from "./routes/cities";

const app = express();
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "NigerianCitiesAPI";

/* ── Global middleware ── */
app.use(express.json());
app.use(requestLogger);

/* ── Root route ── */
app.get("/", (req: Request, res: Response) => {
  res.json({
    api: APP_NAME,
    version: "1.0.0",
    description: "A REST API for Nigerian cities",
    day: 62,
    author: "Henry Ehindero — Lagos, Nigeria 🇳🇬",
    endpoints: [
      { method: "GET",    path: "/cities",          description: "All cities. Supports ?region= ?capital= ?search=" },
      { method: "GET",    path: "/cities/regions",  description: "All regions with city counts" },
      { method: "GET",    path: "/cities/:id",      description: "Single city by ID" },
      { method: "POST",   path: "/cities",          description: "Create a new city" },
      { method: "PUT",    path: "/cities/:id",      description: "Update a city by ID" },
      { method: "DELETE", path: "/cities/:id",      description: "Delete a city by ID" },
    ],
  });
});

/* ── Health check ── */
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

/* ── Mount routers ── */
app.use("/cities", citiesRouter);

/* ── 404 handler ── */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    hint: "Visit GET / for available endpoints",
  });
});

/* ── Error handler ── */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ success: false, error: "Internal server error" });
});

/* ── Start server ── */
app.listen(PORT, () => {
  console.log(`\n┌──────────────────────────────────────────┐`);
  console.log(`│  ${APP_NAME}                    │`);
  console.log(`│  http://localhost:${PORT}                    │`);
  console.log(`│  Day 62 · Sprint 3 · Lagos, Nigeria    │`);
  console.log(`└──────────────────────────────────────────┘\n`);
  console.log(`  GET    http://localhost:${PORT}/cities`);
  console.log(`  GET    http://localhost:${PORT}/cities?region=South-West`);
  console.log(`  GET    http://localhost:${PORT}/cities?capital=true`);
  console.log(`  GET    http://localhost:${PORT}/cities/regions`);
  console.log(`  GET    http://localhost:${PORT}/cities/1`);
  console.log(`  POST   http://localhost:${PORT}/cities`);
  console.log(`  PUT    http://localhost:${PORT}/cities/1`);
  console.log(`  DELETE http://localhost:${PORT}/cities/1\n`);
});