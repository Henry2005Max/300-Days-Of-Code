import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";

export class AppError extends Error {
    constructor(public message: string, public statusCode: number = 500) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class NotFoundError   extends AppError { constructor(r: string, id?: any) { super(id !== undefined ? `${r} with id ${id} not found` : `${r} not found`, 404); } }
export class BadRequestError extends AppError { constructor(m: string) { super(m, 400); } }
export class ConflictError   extends AppError { constructor(m: string) { super(m, 409); } }

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message    = err instanceof AppError ? err.message    : "Internal server error";
    if (statusCode === 500) console.error("[error]", err);
    const response: ApiResponse<never> = { success: false, error: message };
    res.status(statusCode).json(response);
}