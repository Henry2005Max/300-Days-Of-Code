// Queue Worker — the heart of Day 87.
//
// What's new vs Day 77's simple send-and-store:
//
// 1. QUEUED DELIVERY
//    Jobs are inserted with status = 'pending'. The worker runs on a cron
//    schedule and picks up due jobs. This decouples the HTTP request that
//    creates a notification from the actual delivery — the API returns instantly
//    and delivery happens asynchronously.
//
// 2. EXPONENTIAL BACKOFF
//    On failure, next_attempt_at is set to: now + BASE * 2^(attempts - 1)
//    Attempt 1 fails → wait 30s  → attempt 2
//    Attempt 2 fails → wait 60s  → attempt 3
//    Attempt 3 fails → wait 120s → attempt 4
//    Attempt 4 fails → wait 240s → attempt 5
//    Attempt 5 fails → status = 'dead' — no more retries, human intervention needed
//    This prevents hammering a temporarily-down SMTP server and gives it
//    time to recover.
//
// 3. DUAL-CHANNEL DELIVERY
//    Channel "email"   → send via Nodemailer
//    Channel "webhook" → POST the payload to the recipient_webhook URL
//    Channel "both"    → send email AND webhook; both must succeed for job to be 'sent'
//
// 4. DELIVERY LOG
//    Every attempt — success or failure — is logged with the response text.
//    This gives full auditability of what happened to each notification.

import db from "../db/database";
import { stmts } from "../db/statements";
import { sendEmail } from "./mailer";
import { sendWebhook } from "./webhook";
import { NotificationJob } from "../types";

const MAX_ATTEMPTS   = Number(process.env.MAX_ATTEMPTS)         || 5;
const BACKOFF_BASE   = Number(process.env.BACKOFF_BASE_SECONDS) || 30;

// ── Backoff calculation ───────────────────────────────────────────────────────

function nextAttemptAt(currentAttempts: number): string {
    // Delay in seconds: BASE * 2^(attempt) — grows as 30, 60, 120, 240, 480...
    const delaySec = BACKOFF_BASE * Math.pow(2, currentAttempts);
    return new Date(Date.now() + delaySec * 1000).toISOString();
}

// ── Log a delivery attempt ────────────────────────────────────────────────────

function logAttempt(jobId: number, channel: string, attempt: number, success: boolean, response: string): void {
    stmts.insertLog.run({ job_id: jobId, channel, attempt, success: success ? 1 : 0, response });
}

// ── Deliver one job ───────────────────────────────────────────────────────────

async function deliverJob(job: NotificationJob): Promise<void> {
    const attempt = job.attempts + 1;
    let emailOk   = true;
    let webhookOk = true;
    let lastError: string | null = null;

    // ── Email delivery ──────────────────────────────────────────────────────────
    if (job.channel === "email" || job.channel === "both") {
        try {
            const result = await sendEmail({
                to:      job.recipient_email,
                subject: job.subject,
                html:    job.body_html,
                text:    job.body_text,
            });
            logAttempt(job.id, "email", attempt, true, result.messageId);
        } catch (err: any) {
            emailOk   = false;
            lastError = err.message;
            logAttempt(job.id, "email", attempt, false, err.message);
            console.error(`[queue] Job ${job.id} email failed (attempt ${attempt}): ${err.message}`);
        }
    }

    // ── Webhook delivery ────────────────────────────────────────────────────────
    if ((job.channel === "webhook" || job.channel === "both") && job.recipient_webhook) {
        try {
            const result = await sendWebhook(job.recipient_webhook, {
                event:   job.type,
                job_id:  job.id,
                payload: JSON.parse(job.payload),
                sent_at: new Date().toISOString(),
            });
            logAttempt(job.id, "webhook", attempt, true, `HTTP ${result.status}`);
        } catch (err: any) {
            webhookOk = false;
            lastError = err.message;
            logAttempt(job.id, "webhook", attempt, false, err.message);
            console.error(`[queue] Job ${job.id} webhook failed (attempt ${attempt}): ${err.message}`);
        }
    }

    // ── Update job status ───────────────────────────────────────────────────────
    if (emailOk && webhookOk) {
        stmts.markSent.run(job.id);
        console.log(`[queue] Job ${job.id} delivered (attempt ${attempt})`);
    } else {
        const isDead   = attempt >= MAX_ATTEMPTS;
        const newStatus = isDead ? "dead" : "failed";

        stmts.markFailed.run({
            id:              job.id,
            status:          newStatus,
            last_error:      lastError,
            next_attempt_at: isDead ? new Date().toISOString() : nextAttemptAt(attempt),
        });

        if (isDead) {
            console.error(`[queue] Job ${job.id} is DEAD after ${attempt} attempts`);
        } else {
            console.warn(`[queue] Job ${job.id} failed — will retry (attempt ${attempt}/${MAX_ATTEMPTS})`);
        }
    }
}

// ── Worker tick ───────────────────────────────────────────────────────────────

export async function runWorkerTick(): Promise<void> {
    const jobs = stmts.pickupJobs.all() as NotificationJob[];
    if (jobs.length === 0) return;

    console.log(`[queue] Processing ${jobs.length} job(s)`);

    // Mark all as processing first (prevents double-pickup if tick overlaps)
    const markAll = db.transaction(() => {
        for (const job of jobs) stmts.markProcessing.run(job.id);
    });
    markAll();

    // Deliver concurrently — but cap at 5 simultaneous to avoid overwhelming SMTP
    const CONCURRENCY = 5;
    for (let i = 0; i < jobs.length; i += CONCURRENCY) {
        const batch = jobs.slice(i, i + CONCURRENCY);
        await Promise.allSettled(batch.map(deliverJob));
    }
}