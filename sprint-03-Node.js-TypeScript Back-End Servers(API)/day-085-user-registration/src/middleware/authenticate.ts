// JWT authentication middleware.
// Reads the Bearer token from the Authorization header, verifies it,
// and attaches the decoded payload to req.user.
// Routes that require auth use: router.get('/me', authenticate, handler)
// Routes that require admin: router.get('/users', authenticate, requireAdmin, handler)

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";
import { UnauthorizedError, ForbiddenError } from "./errorHandler";

// Extend Express Request to carry the decoded user payload
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        throw new UnauthorizedError("No token provided — include Authorization: Bearer <token>");
    }

    const token  = authHeader.slice(7);
    const secret = process.env.JWT_SECRET!;

    try {
        const payload = jwt.verify(token, secret) as JwtPayload;
        req.user = payload;
        next();
    } catch (err: any) {
        if (err.name === "TokenExpiredError") {
            throw new UnauthorizedError("Token has expired — use POST /auth/refresh to get a new one");
        }
        throw new UnauthorizedError("Invalid token");
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    if (!req.user || req.user.role !== "admin") {
        throw new ForbiddenError("Admin access required");
    }
    next();
}