import dotenv from 'dotenv';
dotenv.config();

import app      from './app';
import { initDb, closeDb } from './store/store';

const PORT = parseInt(process.env.PORT || '3000', 10);

initDb();

const server = app.listen(PORT, () => {
    console.log(`\n[Rate Limiter API] Running on http://localhost:${PORT}`);
    console.log(`[Rate Limiter API] Algorithms: sliding_window | fixed_window | token_bucket`);
    console.log(`[Rate Limiter API] Routes:`);
    console.log(`  GET /api/sliding  — 10 req/min (sliding window)`);
    console.log(`  GET /api/fixed    — 5 req/30s  (fixed window)`);
    console.log(`  GET /api/token    — 8 req/min  (token bucket)`);
    console.log(`  GET /api/strict   — 3 req/10s  (easy to trigger)`);
    console.log(`  GET /api/stats    — request log and block stats`);
    console.log(`\n  Run "npm run test:load" in another terminal to load test.\n`);
});

const shutdown = () => {
    console.log('\n[Rate Limiter API] Shutting down...');
    server.close(() => {
        closeDb();
        process.exit(0);
    });
};

process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);