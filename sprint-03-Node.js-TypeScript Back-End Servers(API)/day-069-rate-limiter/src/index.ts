import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { requestLogger } from "./middleware/logger";
import demoRouter from "./routes/demo";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

app.get("/", (req: Request, res: Response) => {
  res.json({
    api:    "RateLimiterDemo",
    day:    69,
    author: "Henry Ehindero — Lagos, Nigeria 🇳🇬",
    description: "Sliding window rate limiter middleware built from scratch",
    algorithm: "Sliding Window — tracks request timestamps per client IP",
    endpoints: [
      { method: "GET",  path: "/api/test",       description: "Tight limit: 5 req / 10s — trigger in browser by refreshing" },
      { method: "GET",  path: "/api/data",        description: "General limit: 20 req / 60s" },
      { method: "GET",  path: "/api/search?q=",   description: "Search limit: 10 req / 60s" },
      { method: "POST", path: "/api/auth/login",  description: "Auth limit: 5 req / 15 min (brute-force protection)" },
      { method: "GET",  path: "/api/status",      description: "Check your current rate limit status" },
    ],
    howItWorks: [
      "Every request records its timestamp per client IP",
      "Timestamps older than the window are removed",
      "If remaining timestamps >= limit → 429 Too Many Requests",
      "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset headers added to every response",
      "Retry-After header tells client how long to wait",
    ],
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: `${Math.floor(process.uptime())}s`, timestamp: new Date().toISOString() });
});

app.use("/api", demoRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n┌──────────────────────────────────────────┐`);
  console.log(`│  RateLimiterDemo — Day 69                │`);
  console.log(`│  http://localhost:${PORT}                    │`);
  console.log(`│  Day 69 · Sprint 3 · Lagos, Nigeria    │`);
  console.log(`└──────────────────────────────────────────┘\n`);
  console.log(`  GET http://localhost:${PORT}/api/test   ← refresh 6x to trigger limit`);
  console.log(`  GET http://localhost:${PORT}/api/data`);
  console.log(`  GET http://localhost:${PORT}/api/search?q=nodejs`);
  console.log(`  POST http://localhost:${PORT}/api/auth/login  ← strictest limit\n`);
});