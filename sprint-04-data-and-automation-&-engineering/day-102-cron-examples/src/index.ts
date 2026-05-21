import dotenv from 'dotenv';
dotenv.config();

import { JOB_REGISTRY }    from './jobs/registry';
import { scheduleAll }     from './scheduler/scheduler';
import { closeDb }         from './db/store';
import { printStatusTable, printHistory } from './display/statusTable';

const HISTORY_ONLY   = process.env.HISTORY_ONLY === 'true';
const STATUS_REFRESH = 5000; // redraw status table every 5s

async function main(): Promise<void> {
    if (HISTORY_ONLY) {
        printHistory(30);
        closeDb();
        return;
    }

    console.log('\x1b[2J'); // clear screen once on start

    scheduleAll(JOB_REGISTRY);

    // Initial status draw
    printStatusTable(JOB_REGISTRY);

    // Refresh status table every 5 seconds
    const tableTimer = setInterval(() => {
        printStatusTable(JOB_REGISTRY);
    }, STATUS_REFRESH);

    const cleanup = () => {
        clearInterval(tableTimer);
        closeDb();
        console.log('\n\n[Scheduler] Stopped. Goodbye.\n');
        process.exit(0);
    };

    process.on('SIGINT',  cleanup);
    process.on('SIGTERM', cleanup);

    console.log('[Scheduler] Running. Status refreshes every 5s.\n');
}

main().catch((err) => {
    console.error('[Fatal]', err.message);
    process.exit(1);
});