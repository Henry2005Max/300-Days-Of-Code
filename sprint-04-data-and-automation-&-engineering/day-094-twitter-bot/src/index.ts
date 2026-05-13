import dotenv from 'dotenv';
dotenv.config();

import { loadConfig } from './config/config';
import { runBot } from './services/botRunner';
import { startScheduler } from './scheduler/scheduler';

async function main(): Promise<void> {
    const config = loadConfig();

    console.log('[App] X Bot Poster — Nigerian Forex Rates');
    console.log(`[App] Mode: ${config.scheduled ? 'SCHEDULED' : 'SINGLE RUN'} | Dry run: ${config.dryRun}\n`);

    try {
        if (config.scheduled) {
            startScheduler(config);
        } else {
            const result = await runBot(config.dryRun);

            if (!result.success) {
                console.error('[App] Bot run failed:', result.error);
                process.exit(1);
            }

            console.log('[App] Done.\n');
        }
    } catch (err) {
        console.error('[App] Fatal error:', (err as Error).message);
        process.exit(1);
    }
}

main();