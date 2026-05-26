import dotenv from 'dotenv';
dotenv.config();

import cron from 'node-cron';
import { runMonitorCycle }     from './services/monitor';
import { getLatestReadings, getRecentAlerts, getAlertStats, closeDb } from './db/store';
import { printHistoricalReport } from './display/printer';

const REPORT_ONLY   = process.env.REPORT_ONLY === 'true';
const CRON_SCHEDULE = process.env.CRON_SCHEDULE  || '*/30 * * * *';
const CRON_TZ       = process.env.CRON_TIMEZONE  || 'Africa/Lagos';

async function main(): Promise<void> {
    console.log('[App] Nigerian Weather Alert System');
    console.log(`[App] API key: ${process.env.OPENWEATHER_API_KEY === 'demo' ? 'not set — mock mode' : 'configured'}`);
    console.log(`[App] Schedule: ${CRON_SCHEDULE} (${CRON_TZ})\n`);

    if (REPORT_ONLY) {
        const latest = getLatestReadings();
        const alerts = getRecentAlerts(20);
        const stats  = getAlertStats();
        printHistoricalReport(latest, alerts, stats);
        closeDb();
        return;
    }

    // Run once immediately on start
    await runMonitorCycle();

    if (!cron.validate(CRON_SCHEDULE)) {
        console.error(`[Error] Invalid cron schedule: "${CRON_SCHEDULE}"`);
        closeDb();
        process.exit(1);
    }

    cron.schedule(CRON_SCHEDULE, async () => {
        console.log(`\n[Cron] Triggered at ${new Date().toISOString()}`);
        await runMonitorCycle();
    }, { timezone: CRON_TZ });

    console.log(`[App] Scheduler running. Press Ctrl+C to exit.\n`);

    const cleanup = () => {
        console.log('\n[App] Shutting down...');
        closeDb();
        process.exit(0);
    };

    process.on('SIGINT',  cleanup);
    process.on('SIGTERM', cleanup);
}

main().catch((err) => {
    console.error('[Fatal]', err.message);
    closeDb();
    process.exit(1);
});