import { Request, Response, NextFunction } from "express";

/* ── What is middleware? ──────────────────────────────────────────────
   Every HTTP request in Express passes through a pipeline.
   Middleware is a function that sits in that pipeline.
   It runs BEFORE your route handler.
   It can read the request, modify it, log it, block it, or pass it on.

   The signature is always the same:
     (req, res, next) => void

   - req  → the incoming request (method, URL, headers, body, params)
   - res  → the response you'll send back
   - next → call this to pass control to the next middleware or route handler
             if you forget to call next(), the request hangs forever
────────────────────────────────────────────────────────────────────── */

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();
  const time = new Date().toISOString();

  /* Listen for when the response finishes */
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    /* Color the status code in the terminal */
    const statusColor =
      status >= 500 ? "\x1b[31m" : /* red   */
      status >= 400 ? "\x1b[33m" : /* amber */
      status >= 200 ? "\x1b[32m" : /* green */
      "\x1b[0m";

    console.log(
      `${time} ${req.method.padEnd(6)} ${req.url.padEnd(25)} ${statusColor}${status}\x1b[0m ${duration}ms`
    );
  });

  next(); /* MUST call this — passes the request to the next handler */
}