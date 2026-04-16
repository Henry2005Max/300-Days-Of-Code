import { Request, Response, NextFunction } from "express";
import { RateLimitOptions, RateLimitInfo, ClientRecord } from "../types";

/* ── createRateLimiter — a middleware factory ────────────────────────
   Takes options and returns a middleware function.
   This is the same factory pattern we used for validate() in Day 63.
   You call it with options, it gives back (req, res, next) => void.

   Usage:
     const generalLimit = createRateLimiter({ windowMs: 60000, max: 100 });
     const authLimit    = createRateLimiter({ windowMs: 900000, max: 10 });

     app.use("/api", generalLimit);
     app.use("/auth/login", authLimit);
────────────────────────────────────────────────────────────────────── */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = "Too many requests — please try again later",
    keyGenerator = (req: Request) => {
      /* Default key: client IP address
         req.ip gives you the IP. In production behind a proxy (like
         Nginx or Heroku), you'd use req.headers["x-forwarded-for"]
         and enable app.set("trust proxy", 1) in Express. */
      return req.ip || "unknown";
    },
  } = options;

  /* ── Per-client store ─────────────────────────────────────────────
     Map<clientKey, ClientRecord>
     clientKey is usually the IP address.
     ClientRecord holds an array of timestamps for that client.

     We use a Map because lookups are O(1) — much faster than
     searching an array for a matching IP on every request.
  ──────────────────────────────────────────────────────────────────── */
  const store = new Map<string, ClientRecord>();

  /* ── Cleanup — prevent memory leak ───────────────────────────────
     If a client stops making requests, their record stays in memory
     forever. We clean up expired records every windowMs interval.
     This is important for long-running servers.
  ──────────────────────────────────────────────────────────────────── */
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, record] of store.entries()) {
      const active = record.timestamps.filter((t) => now - t < windowMs);
      if (active.length === 0) {
        store.delete(key);
        cleaned++;
      } else {
        record.timestamps = active;
      }
    }
    if (cleaned > 0) {
      console.log(`[RATE LIMITER] Cleanup — removed ${cleaned} expired records`);
    }
  }, windowMs);

  /* Prevent the interval from keeping the process alive on shutdown */
  cleanupInterval.unref();

  /* ── The actual middleware ── */
  return function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const key = keyGenerator(req);
    const now = Date.now();

    /* Get or create the record for this client */
    if (!store.has(key)) {
      store.set(key, { timestamps: [] });
    }

    const record = store.get(key)!;

    /* ── Sliding window — core logic ─────────────────────────────
       Step 1: Remove timestamps outside the current window.
               "Outside" means older than (now - windowMs).
               This is what makes it a SLIDING window — we look
               back windowMs from RIGHT NOW, not from a fixed start.
    ─────────────────────────────────────────────────────────────── */
    record.timestamps = record.timestamps.filter(
      (timestamp) => now - timestamp < windowMs
    );

    /* Step 2: Count how many requests are in the window */
    const count = record.timestamps.length;

    /* Step 3: Calculate rate limit info for the response headers */
    const oldestTimestamp = record.timestamps[0] ?? now;
    const resetAt = oldestTimestamp + windowMs;
    const retryAfterSeconds = Math.ceil((resetAt - now) / 1000);

    const info: RateLimitInfo = {
      limit:              max,
      remaining:          Math.max(0, max - count - 1), /* -1 for this request */
      resetAt,
      retryAfterSeconds,
    };

    /* ── Standard rate limit headers ─────────────────────────────
       These are the industry-standard headers for rate limiting.
       Clients (browsers, apps) can read these to know their status.
       X-RateLimit-Limit     → how many requests allowed per window
       X-RateLimit-Remaining → how many requests left
       X-RateLimit-Reset     → Unix timestamp when window resets
    ─────────────────────────────────────────────────────────────── */
    res.setHeader("X-RateLimit-Limit",     info.limit);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - count));
    res.setHeader("X-RateLimit-Reset",     Math.ceil(info.resetAt / 1000));

    /* Step 4: If over limit → block the request */
    if (count >= max) {
      /* Retry-After tells the client how many seconds to wait */
      res.setHeader("Retry-After", info.retryAfterSeconds);

      console.warn(
        `[RATE LIMITER] BLOCKED ${key} — ${count}/${max} requests in window. Retry after ${info.retryAfterSeconds}s`
      );

      /* 429 Too Many Requests — the standard status for rate limiting */
      res.status(429).json({
        success: false,
        error:   message,
        limit:   max,
        windowSeconds: Math.ceil(windowMs / 1000),
        retryAfterSeconds: info.retryAfterSeconds,
        retryAt: new Date(now + info.retryAfterSeconds * 1000).toISOString(),
      });
      return;
    }

    /* Step 5: Under limit → record this request and allow it */
    record.timestamps.push(now);

    console.log(
      `[RATE LIMITER] ALLOWED ${key} — ${count + 1}/${max} requests in window`
    );

    next();
  };
}

/* ── getRateLimitStatus — inspect current state of a client ──────────
   Useful for debugging and the /status endpoint.
────────────────────────────────────────────────────────────────────── */
export function createStatusChecker(
  store: Map<string, ClientRecord>,
  windowMs: number,
  max: number
) {
  return function getStatus(key: string) {
    const record = store.get(key);
    if (!record) return { key, count: 0, remaining: max, timestamps: [] };
    const now = Date.now();
    const active = record.timestamps.filter((t) => now - t < windowMs);
    return {
      key,
      count:     active.length,
      remaining: Math.max(0, max - active.length),
      timestamps: active.map((t) => new Date(t).toISOString()),
    };
  };
}