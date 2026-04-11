import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((issue) => ({
        field:   issue.path.join(".") || "body",
        message: issue.message,
      }));
      res.status(400).json({ success: false, error: "Validation failed", errors });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((issue) => ({
        field:   issue.path.join(".") || "query",
        message: issue.message,
      }));
      res.status(400).json({ success: false, error: "Invalid query parameters", errors });
      return;
    }
    req.query = result.data as any;
    next();
  };
}