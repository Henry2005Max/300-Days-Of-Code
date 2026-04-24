import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiResponse } from "../types";

// Factory: returns an Express middleware that validates req.body against `schema`.
// On failure it immediately returns 400 with structured field errors.
// On success it replaces req.body with the parsed (and coerced) value.
export function validate<T>(schema: ZodSchema<T>, source: "body" | "query" = "body") {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(source === "body" ? req.body : req.query);

        if (!result.success) {
            const errors = (result.error as ZodError).errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            }));

            const response: ApiResponse<never> = { success: false, error: "Validation failed", errors };
            res.status(400).json(response);
            return;
        }

        // Replace with the coerced/defaulted value so routes use clean data
        if (source === "body") {
            req.body = result.data;
        } else {
            (req as any).validatedQuery = result.data;
        }

        next();
    };
}