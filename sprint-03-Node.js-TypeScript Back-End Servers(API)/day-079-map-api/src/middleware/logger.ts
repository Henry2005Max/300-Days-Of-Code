import { Request, Response, NextFunction } from "express";

const METHOD_COLOURS: Record<string, string> = {
    GET:    "\x1b[32m",
    POST:   "\x1b[34m",
    PUT:    "\x1b[33m",
    PATCH:  "\x1b[33m",
    DELETE: "\x1b[31m",
};
const RESET = "\x1b[0m";
const DIM   = "\x1b[2m";

export function logger(req: Request, res: Response, next: NextFunction): void {
    const start  = Date.now();
    const colour = METHOD_COLOURS[req.method] ?? "\x1b[37m";

    res.on("finish", () => {
        const ms           = Date.now() - start;
        const statusColour = res.statusCode >= 400 ? "\x1b[31m" : "\x1b[32m";
        console.log(
            `${colour}${req.method}${RESET} ${req.path} ` +
            `${statusColour}${res.statusCode}${RESET} ${DIM}${ms}ms${RESET}`
        );
    });

    next();
}