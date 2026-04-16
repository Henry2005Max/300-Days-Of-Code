import { Router, Request, Response } from "express";
import { createRateLimiter } from "../middleware/rateLimiter";

const router = Router();

/* ── Different limiters for different routes ─────────────────────────
   This is the key feature — you apply different limits to different
   routes based on how sensitive they are.

   /api/data     → generous: 20 req / 60 seconds  (general API use)
   /api/search   → moderate: 10 req / 60 seconds  (expensive operation)
   /auth/login   → strict:   5  req / 60 seconds  (brute-force protection)
────────────────────────────────────────────────────────────────────── */
const generalLimiter = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS)  || 60_000,
  max:      Number(process.env.RATE_LIMIT_MAX)         || 20,
  message:  "Too many requests — slow down and try again shortly",
});

const searchLimiter = createRateLimiter({
  windowMs: 60_000,
  max:      10,
  message:  "Search rate limit exceeded — max 10 searches per minute",
});

const authLimiter = createRateLimiter({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 900_000, /* 15 min */
  max:      Number(process.env.AUTH_RATE_LIMIT_MAX)        || 5,
  message:  "Too many login attempts — account temporarily locked. Try again in 15 minutes",
});

/* ── Quick-fire test limiter ─────────────────────────────────────────
   Very tight limit (5 req / 10 seconds) so you can trigger it
   easily in the browser by refreshing quickly.
────────────────────────────────────────────────────────────────────── */
const testLimiter = createRateLimiter({
  windowMs: 10_000,  /* 10 seconds */
  max:      5,
  message:  "Test limit hit! Wait 10 seconds.",
});

/* ── GET /api/data — general endpoint ── */
router.get("/data", generalLimiter, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Here is your data",
    timestamp: new Date().toISOString(),
    ip: req.ip,
    headers: {
      limit:     res.getHeader("X-RateLimit-Limit"),
      remaining: res.getHeader("X-RateLimit-Remaining"),
      reset:     res.getHeader("X-RateLimit-Reset"),
    },
  });
});

/* ── GET /api/search — stricter limit ── */
router.get("/search", searchLimiter, (req: Request, res: Response) => {
  const q = req.query.q || "nothing";
  res.json({
    success:  true,
    query:    q,
    results:  [`Result 1 for "${q}"`, `Result 2 for "${q}"`],
    headers: {
      remaining: res.getHeader("X-RateLimit-Remaining"),
    },
  });
});

/* ── POST /auth/login — strictest limit (brute-force protection) ── */
router.post("/auth/login", authLimiter, (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  /* Fake login — always succeeds in this demo */
  res.json({
    success: true,
    message: `Login attempt for ${email || "unknown"} — demo always succeeds`,
    headers: {
      remaining: res.getHeader("X-RateLimit-Remaining"),
      reset:     res.getHeader("X-RateLimit-Reset"),
    },
  });
});

/* ── GET /api/test — trigger limit quickly (5 req / 10s) ────────────
   Refresh this in your browser 6 times quickly to see the 429.
────────────────────────────────────────────────────────────────────── */
router.get("/test", testLimiter, (req: Request, res: Response) => {
  const remaining = Number(res.getHeader("X-RateLimit-Remaining") ?? 0);
  res.json({
    success:   true,
    message:   remaining === 0
      ? "Last request allowed — next one will be blocked!"
      : `Request allowed. ${remaining} remaining before limit.`,
    remaining,
    limit:     5,
    windowSeconds: 10,
    tip: "Refresh this page 6 times quickly to trigger the rate limit",
  });
});

/* ── GET /api/status — show rate limit state for your IP ── */
router.get("/status", (req: Request, res: Response) => {
  res.json({
    success: true,
    ip: req.ip,
    message: "Rate limit headers show your current status",
    headers: {
      "X-RateLimit-Limit":     res.getHeader("X-RateLimit-Limit"),
      "X-RateLimit-Remaining": res.getHeader("X-RateLimit-Remaining"),
      "X-RateLimit-Reset":     res.getHeader("X-RateLimit-Reset"),
    },
    note: "Check response headers in Postman or browser DevTools Network tab",
  });
});

export default router;