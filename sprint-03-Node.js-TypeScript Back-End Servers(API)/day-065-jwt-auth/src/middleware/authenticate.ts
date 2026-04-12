import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";

/* ── authenticate middleware ─────────────────────────────────────────
   This middleware protects routes. Add it to any route that requires
   a logged-in user — it runs BEFORE the route handler.

   The client must send the token in the Authorization header like this:
     Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

   The "Bearer " prefix is an HTTP convention for token-based auth.
   We strip it off to get the raw token string.

   jwt.verify() does two things simultaneously:
   1. Checks the signature — was this token created by our server?
   2. Checks expiry — has the token expired?
   If either fails, it throws an error and we return 401.

   If both pass, we attach the decoded payload to req.user so the
   route handler knows who is making the request.
────────────────────────────────────────────────────────────────────── */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  /* Check the header exists and starts with "Bearer " */
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Access denied — no token provided",
      hint: "Add header: Authorization: Bearer <your_token>",
    });
    return;
  }

  /* Strip "Bearer " to get the raw token */
  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET!;

  try {
    /* jwt.verify() throws if the token is invalid or expired */
    const decoded = jwt.verify(token, secret) as JwtPayload;

    /* Attach the user payload to the request */
    req.user = decoded;

    next(); /* token valid — continue to the route handler */
  } catch (err: any) {
    /* ── Two common JWT errors ────────────────────────────────────
       TokenExpiredError → the token is valid but expired
       JsonWebTokenError → the token is malformed or signature is wrong
    ─────────────────────────────────────────────────────────────── */
    if (err.name === "TokenExpiredError") {
      res.status(401).json({ success: false, error: "Token expired — please log in again" });
    } else {
      res.status(401).json({ success: false, error: "Invalid token" });
    }
  }
}

/* ── requireRole — role-based access control ─────────────────────────
   A second middleware factory that checks req.user.role.
   Use AFTER authenticate:
     router.delete("/:id", authenticate, requireRole("admin"), handler)

   Only users with the matching role can proceed.
   Everyone else gets 403 Forbidden (different from 401 Unauthorized:
   401 = you're not logged in, 403 = you're logged in but not allowed)
────────────────────────────────────────────────────────────────────── */
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({
        success: false,
        error: `Forbidden — requires role: ${role}`,
      });
      return;
    }
    next();
  };
}