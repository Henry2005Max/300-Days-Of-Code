import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof ZodError) {
        res.status(400).json({
            error:   'Validation error',
            details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        });
        return;
    }

    console.error('[Error]', err.message);
    res.status(500).json({ error: 'Internal server error' });
}

export function notFound(_req: Request, res: Response): void {
    res.status(404).json({ error: 'Route not found' });
}