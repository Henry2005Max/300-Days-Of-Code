import { BotConfig } from '../types';

export function loadConfig(): BotConfig {
    return {
        dryRun:      process.env.DRY_RUN === 'true',
        scheduled:   process.env.SCHEDULED === 'true',
        cronSchedule: process.env.CRON_SCHEDULE || '0 7 * * *',
    };
}