import cron from 'node-cron';
import { JobDefinition } from '../types';
import { startRun, finishRun } from '../db/store';

const TIMEZONE = process.env.CRON_TIMEZONE || 'Africa/Lagos';

export function scheduleJob(job: JobDefinition): void {
    if (!cron.validate(job.schedule)) {
        console.error(`[Scheduler] Invalid schedule for "${job.name}": ${job.schedule}`);
        return;
    }

    cron.schedule(job.schedule, async () => {
        const runId    = startRun(job.id, job.name);
        const start    = Date.now();

        try {
            const output   = await job.handler();
            const duration = Date.now() - start;
            finishRun(runId, 'success', output.message, duration);
            console.log(`  ✓ [${job.name}] ${output.message}  (${duration}ms)`);
        } catch (err) {
            const duration = Date.now() - start;
            const message  = (err as Error).message;
            finishRun(runId, 'failed', message, duration);
            console.error(`  ✗ [${job.name}] FAILED: ${message}  (${duration}ms)`);
        }
    }, { timezone: TIMEZONE });

    console.log(`  Registered: "${job.name}"  →  ${job.schedule}`);
}

export function scheduleAll(jobs: JobDefinition[]): void {
    console.log(`\n[Scheduler] Registering ${jobs.length} jobs (tz: ${TIMEZONE})...\n`);
    jobs.forEach(scheduleJob);
    console.log('');
}