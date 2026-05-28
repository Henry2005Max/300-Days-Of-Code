import { Router } from 'express';
import { rateLimiter } from '../middleware/rateLimiter';
import { getRecentLogs, getBlockedStats } from '../store/store';

const router = Router();

// Route A — Sliding Window: 10 req / 60s
router.get('/sliding',
    rateLimiter({
        algorithm:   'sliding_window',
        windowMs:    60_000,
        maxRequests: 10,
        keyPrefix:   'sliding',
        message:     'Sliding window limit reached. Try again in a minute.',
    }),
    (_req, res) => {
        res.json({
            algorithm: 'sliding_window',
            message:   'Request allowed!',
            timestamp: new Date().toISOString(),
        });
    }
);

// Route B — Fixed Window: 5 req / 30s
router.get('/fixed',
    rateLimiter({
        algorithm:   'fixed_window',
        windowMs:    30_000,
        maxRequests: 5,
        keyPrefix:   'fixed',
        message:     'Fixed window limit reached.',
    }),
    (_req, res) => {
        res.json({
            algorithm: 'fixed_window',
            message:   'Request allowed!',
            timestamp: new Date().toISOString(),
        });
    }
);

// Route C — Token Bucket: 8 req / 60s (smoother than fixed)
router.get('/token',
    rateLimiter({
        algorithm:   'token_bucket',
        windowMs:    60_000,
        maxRequests: 8,
        keyPrefix:   'token',
        message:     'Token bucket exhausted. Wait for tokens to refill.',
    }),
    (_req, res) => {
        res.json({
            algorithm: 'token_bucket',
            message:   'Request allowed!',
            timestamp: new Date().toISOString(),
        });
    }
);

// Route D — Strict: 3 req / 10s (easy to hit in testing)
router.get('/strict',
    rateLimiter({
        algorithm:   'sliding_window',
        windowMs:    10_000,
        maxRequests: 3,
        keyPrefix:   'strict',
        message:     'Strict limit: 3 requests per 10 seconds.',
    }),
    (_req, res) => {
        res.json({
            algorithm: 'sliding_window (strict)',
            message:   'Request allowed!',
            timestamp: new Date().toISOString(),
        });
    }
);

// Stats endpoint — no rate limiting
router.get('/stats', (_req, res) => {
    const logs    = getRecentLogs(50);
    const blocked = getBlockedStats();
    const total   = (logs as { allowed: number }[]).length;
    const denied  = (logs as { allowed: number }[]).filter((l) => l.allowed === 0).length;

    res.json({
        recentRequests: total,
        denied,
        allowRate:      total > 0 ? `${(((total - denied) / total) * 100).toFixed(1)}%` : 'N/A',
        topBlocked:     blocked,
        recentLogs:     logs,
    });
});

export default router;