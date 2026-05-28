import express from 'express';
import demoRoutes from './routes/demo';

const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
    res.json({
        name: 'API Rate Limiter — Day 109',
        algorithms: ['sliding_window', 'fixed_window', 'token_bucket'],
        routes: {
            'GET /api/sliding': '10 req/min — sliding window',
            'GET /api/fixed':   '5 req/30s — fixed window',
            'GET /api/token':   '8 req/min — token bucket',
            'GET /api/strict':  '3 req/10s — easy to trigger',
            'GET /api/stats':   'Request log and block stats',
        },
    });
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', demoRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

export default app;