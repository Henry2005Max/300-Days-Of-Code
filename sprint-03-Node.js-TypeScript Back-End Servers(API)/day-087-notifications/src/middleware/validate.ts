import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiResponse } from "../types";

export function validate<T>(schema: ZodSchema<T>, source: "body" | "query" = "body") {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(source === "body" ? req.body : req.query);
        if (!result.success) {
            const errors = (result.error as ZodError).errors.map((e) => ({
                field: e.path.join("."), message: e.message,
            }));
            const response: ApiResponse<never> = { success: false, error: "Validation failed", errors };
            res.status(400).json(response);
            return;
        }
        if (source === "body") req.body = result.data;
        else (req as any).validatedQuery = result.data;
        next();
    };
}