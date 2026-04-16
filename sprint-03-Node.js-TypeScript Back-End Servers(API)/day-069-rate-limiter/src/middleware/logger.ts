import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const time = new Date().toISOString();
  res.on("finish", () => {
    const status = res.statusCode;
    const color =
      status === 429 ? "\x1b[35m" : /* magenta for rate limited */
      status >= 500  ? "\x1b[31m" :
      status >= 400  ? "\x1b[33m" :
      "\x1b[32m";
    console.log(
      `${time} ${req.method.padEnd(6)} ${req.url.padEnd(35)} ${color}${status}\x1b[0m ${Date.now() - start}ms  ip:${req.ip}`
    );
  });
  next();
}