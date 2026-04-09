import { Request, Response, NextFunction } from "express";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();
  const time = new Date().toISOString();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor =
      status >= 500 ? "\x1b[31m" :
      status >= 400 ? "\x1b[33m" :
      status >= 200 ? "\x1b[32m" :
      "\x1b[0m";

    console.log(
      `${time} ${req.method.padEnd(6)} ${req.url.padEnd(35)} ${statusColor}${status}\x1b[0m ${duration}ms`
    );
  });

  next();
}