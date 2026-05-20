import dotenv from 'dotenv';
dotenv.config();

import { closePool }       from './db/pool';
import { fetchAllMetrics } from './queries/metrics';
import { renderDashboard } from './renderer/dashboard';
import { ANSI }            from './renderer/ansi';

const REFRESH_MS = parseInt(process.env.REFRESH_INTERVAL_MS || '3000', 10);

async function tick(): Promise<void> {
    try {
        const metrics = await fetchAllMetrics();
        renderDashboard(metrics);
    } catch (err) {
        process.stdout.write(
            ANSI.home + `\n  [Error] ${(err as Error).message}\n  Retrying in ${REFRESH_MS / 1000}s...\n`
        );
    }
}

async function main(): Promise<void> {
    // Hide cursor and clear screen on start
    process.stdout.write(ANSI.hideCursor + ANSI.clearScreen);

    // Restore cursor and clean up on exit
    const cleanup = async () => {
        process.stdout.write(ANSI.showCursor + '\n');
        await closePool();
        process.exit(0);
    };

    process.on('SIGINT',  cleanup);
    process.on('SIGTERM', cleanup);

    // First render immediately
    await tick();

    // Then refresh on interval
    setInterval(tick, REFRESH_MS);
}

main().catch((err) => {
    process.stdout.write(ANSI.showCursor);
    console.error('[Fatal]', err.message);
    process.exit(1);
});