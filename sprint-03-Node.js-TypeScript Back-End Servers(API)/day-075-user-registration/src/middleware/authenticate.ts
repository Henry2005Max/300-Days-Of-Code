import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            error:   "Access denied — no token provided",
            hint:    "Add header: Authorization: Bearer <token>",
        });
        return;
    }

    const token = header.slice(7);
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        next();
    } catch (err: any) {
        const message = err.name === "TokenExpiredError"
            ? "Token expired — please log in again"
            : "Invalid token";
        res.status(401).json({ success: false, error: message });
    }
}