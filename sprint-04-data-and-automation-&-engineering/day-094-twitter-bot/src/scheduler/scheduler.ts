import cron from 'node-cron';
import { runBot } from './botRunner';
import { BotConfig } from '../types';

export function startScheduler(config: BotConfig): void {
    const { cronSchedule, dryRun } = config;

    if (!cron.validate(cronSchedule)) {
        throw new Error(`Invalid cron schedule: "${cronSchedule}". Check CRON_SCHEDULE in .env`);
    }

    console.log(`[Scheduler] Starting bot on schedule: "${cronSchedule}"`);
    console.log(`[Scheduler] Dry run: ${dryRun}`);
    console.log(`[Scheduler] Bot is running. Press Ctrl+C to stop.\n`);

    // Run once immediately on start
    runBot(dryRun);

    cron.schedule(cronSchedule, () => {
        console.log(`\n[Scheduler] Cron triggered at ${new Date().toISOString()}`);
        runBot(dryRun);
    }, {
        timezone: 'Africa/Lagos',
    });
}