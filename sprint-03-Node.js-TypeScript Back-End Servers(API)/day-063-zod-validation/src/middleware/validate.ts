import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/* ── validate() — a middleware factory ──────────────────────────────
   A middleware FACTORY is a function that RETURNS a middleware function.
   You call it with a schema, and it gives back a middleware.

   Usage in a route file:
     router.post("/", validate(CreateStudentSchema), handler)

   The middleware runs BEFORE the handler.
   If validation passes  → calls next(), handler runs with typed req.body
   If validation fails   → sends 400 immediately, handler never runs

   This pattern means your route handlers can assume req.body is valid.
   No more manual if-checks inside handlers.
────────────────────────────────────────────────────────────────────── */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      /* ZodError.errors is an array of issues, one per failing field.
         We map them into a cleaner shape for the API response. */
      const errors = result.error.errors.map((issue) => ({
        field:   issue.path.join(".") || "body",
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        error: "Validation failed",
        errors,
      });
      return;
    }

    /* Replace req.body with the parsed + transformed data.
       This means .trim(), .toLowerCase(), .default() all apply.
       The handler receives clean, transformed data. */
    req.body = result.data;
    next();
  };
}

/* ── validateQuery() — same idea but for req.query ──────────────────
   Query params live in req.query, not req.body.
   This version validates and replaces req.query instead.
────────────────────────────────────────────────────────────────────── */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.errors.map((issue) => ({
        field:   issue.path.join(".") || "query",
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        errors,
      });
      return;
    }

    req.query = result.data as any;
    next();
  };
}