import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const time  = new Date().toISOString();
    res.on("finish", () => {
        const s = res.statusCode;
        const c = s >= 500 ? "\x1b[31m" : s >= 400 ? "\x1b[33m" : "\x1b[32m";
        console.log(`${time} ${req.method.padEnd(6)} ${req.url.padEnd(40)} ${c}${s}\x1b[0m ${Date.now() - start}ms`);
    });
    next();
}