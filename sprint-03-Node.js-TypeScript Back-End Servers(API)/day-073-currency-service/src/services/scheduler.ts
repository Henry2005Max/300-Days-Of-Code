import cron from "node-cron";
import { fetchAndStore } from "./currencyService";


let scheduledTask: cron.ScheduledTask | null = null;

export function startScheduler(): void {
    const schedule = process.env.REFRESH_CRON || "0 * * * *";

    /* Validate the cron expression before scheduling */
    if (!cron.validate(schedule)) {
        console.error(`[SCHEDULER] Invalid cron expression: "${schedule}"`);
        return;
    }

    scheduledTask = cron.schedule(schedule, async () => {
        console.log(`[SCHEDULER] Running scheduled currency refresh at ${new Date().toISOString()}`);
        try {
            const snapshot = await fetchAndStore("USD");
            console.log(`[SCHEDULER] Refresh complete — snapshot ID ${snapshot.id}`);
        } catch (err: any) {
            console.error(`[SCHEDULER] Refresh failed: ${err.message}`);
            /* We don't crash the server on a failed refresh — just log it.
               The DB has the previous snapshot, so read endpoints still work. */
        }
    });

    console.log(`[SCHEDULER] Currency refresh scheduled: "${schedule}"`);
}

export function stopScheduler(): void {
    if (scheduledTask) {
        scheduledTask.stop();
        scheduledTask = null;
        console.log("[SCHEDULER] Stopped");
    }
}