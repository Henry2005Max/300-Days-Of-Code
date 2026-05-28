import { Request, Response, NextFunction } from 'express';
import {
    slidingWindowCheck,
    fixedWindowCheck,
    tokenBucketCheck,
    logRequest,
} from '../store/store';
import { RateLimitConfig, RateLimitResult } from '../types';

function getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.socket.remoteAddress || '127.0.0.1';
}

function buildKey(config: RateLimitConfig, ip: string, req: Request): string {
    const prefix = config.keyPrefix || req.path.replace(/\//g, '_');
    return `${prefix}:${ip}`;
}

function setHeaders(res: Response, result: RateLimitResult, config: RateLimitConfig): void {
    res.setHeader('X-RateLimit-Limit',     config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, result.remaining));
    res.setHeader('X-RateLimit-Reset',     Math.ceil((Date.now() + result.resetMs) / 1000));
    res.setHeader('X-RateLimit-Algorithm', config.algorithm);
    if (!result.allowed) {
        res.setHeader('Retry-After', result.retryAfter);
    }
}

function checkLimit(
    config: RateLimitConfig,
    key:    string
): RateLimitResult {
    const { windowMs, maxRequests, algorithm } = config;

    if (algorithm === 'sliding_window') {
        const { count, allowed } = slidingWindowCheck(key, windowMs, maxRequests);
        const resetMs    = windowMs;
        return {
            allowed,
            remaining:   Math.max(0, maxRequests - count),
            resetMs,
            retryAfter:  Math.ceil(resetMs / 1000),
            limit:       maxRequests,
            current:     count,
        };
    }

    if (algorithm === 'fixed_window') {
        const { count, windowStart, allowed } = fixedWindowCheck(key, windowMs, maxRequests);
        const resetMs = windowStart + windowMs - Date.now();
        return {
            allowed,
            remaining:  Math.max(0, maxRequests - count),
            resetMs:    Math.max(0, resetMs),
            retryAfter: Math.ceil(Math.max(0, resetMs) / 1000),
            limit:      maxRequests,
            current:    count,
        };
    }

    // Token bucket
    const { tokens, allowed } = tokenBucketCheck(key, windowMs, maxRequests);
    const refillSeconds = allowed ? 0 : Math.ceil((1 - tokens) / (maxRequests / (windowMs / 1000)));
    return {
        allowed,
        remaining:  Math.max(0, Math.floor(tokens)),
        resetMs:    refillSeconds * 1000,
        retryAfter: refillSeconds,
        limit:      maxRequests,
        current:    maxRequests - Math.floor(tokens),
    };
}

export function rateLimiter(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const ip  = getClientIp(req);
        const key = buildKey(config, ip, req);

        // Whitelist check
        if (config.skipIf && config.skipIf(ip)) {
            next();
            return;
        }

        const result = checkLimit(config, key);
        setHeaders(res, result, config);

        logRequest({
            ip,
            path:      req.path,
            method:    req.method,
            status:    result.allowed ? 200 : 429,
            allowed:   result.allowed,
            algorithm: config.algorithm,
        });

        if (!result.allowed) {
            res.status(429).json({
                error:      config.message || 'Too Many Requests',
                retryAfter: result.retryAfter,
                limit:      result.limit,
                resetIn:    `${result.retryAfter}s`,
            });
            return;
        }

        next();
    };
}