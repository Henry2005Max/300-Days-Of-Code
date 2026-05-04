import db from "../db/database";
import { stmts } from "../db/statements";
import { renderTemplate } from "./templates";
import { NotificationJob, NotificationChannel, NotificationType, UserPreference } from "../types";
import { NotFoundError, BadRequestError } from "../middleware/errorHandler";

// ── Enqueue a notification ────────────────────────────────────────────────────

export function enqueue(data: {
    type: NotificationType;
    recipient_email: string;
    recipient_webhook?: string;
    channel?: NotificationChannel;
    template_data: Record<string, unknown>;
}): NotificationJob {
    // Check user preferences — if they have a preference record, use it
    const pref = stmts.getPreference.get(data.recipient_email) as UserPreference | undefined;

    // Respect opt-outs — if this type is disabled for this user, reject
    if (pref) {
        const disabled = pref.disabled_types.split(",").map((t) => t.trim()).filter(Boolean);
        if (disabled.includes(data.type)) {
            throw new BadRequestError(
                `User "${data.recipient_email}" has opted out of "${data.type}" notifications`
            );
        }
    }

    const channel: NotificationChannel = data.channel
        || (pref?.channel as NotificationChannel)
        || "email";

    const webhookUrl = data.recipient_webhook
        || pref?.webhook_url
        || null;

    if ((channel === "webhook" || channel === "both") && !webhookUrl) {
        throw new BadRequestError(
            'Channel "webhook" requires a webhook URL. Provide recipient_webhook or set it in user preferences.'
        );
    }

    // Render template
    const rendered = renderTemplate(data.type, data.template_data);

    const result = stmts.insertJob.run({
        type:              data.type,
        channel,
        recipient_email:   data.recipient_email,
        recipient_webhook: webhookUrl,
        subject:           rendered.subject,
        body_html:         rendered.html,
        body_text:         rendered.text,
        payload:           JSON.stringify(data.template_data),
    });

    return stmts.getJobById.get(result.lastInsertRowid) as NotificationJob;
}

// ── Job queries ───────────────────────────────────────────────────────────────

export function getJob(id: number): NotificationJob {
    const job = stmts.getJobById.get(id) as NotificationJob | undefined;
    if (!job) throw new NotFoundError("Notification job", id);
    return job;
}

export function listJobs(opts: {
    status?: string; limit: number; offset: number;
}): { rows: NotificationJob[]; total: number } {
    const params = { status: opts.status ?? null, limit: opts.limit, offset: opts.offset };
    const rows   = stmts.listJobs.all(params) as NotificationJob[];
    const total  = (stmts.countJobs.get(params) as { count: number }).count;
    return { rows, total };
}

export function retryJob(id: number): NotificationJob {
    const job = getJob(id);
    if (!["failed", "dead"].includes(job.status)) {
        throw new BadRequestError(`Job ${id} has status "${job.status}" — only failed or dead jobs can be retried`);
    }
    stmts.retryJob.run(id);
    return stmts.getJobById.get(id) as NotificationJob;
}

export function getJobLogs(id: number): any[] {
    getJob(id); // validates existence
    return stmts.getLogsForJob.all(id) as any[];
}

export function getQueueStats(): object {
    const statusCounts = stmts.queueStats.all() as { status: string; count: number }[];
    const summary: Record<string, number> = {};
    for (const row of statusCounts) summary[row.status] = row.count;
    return { by_status: statusCounts, total: Object.values(summary).reduce((a, b) => a + b, 0) };
}

// ── User preferences ──────────────────────────────────────────────────────────

export function upsertPreference(data: {
    username: string;
    email: string;
    webhook_url?: string;
    channel: NotificationChannel;
    disabled_types: string[];
}): UserPreference {
    stmts.upsertPreference.run({
        username:       data.username,
        email:          data.email,
        webhook_url:    data.webhook_url ?? null,
        channel:        data.channel,
        disabled_types: data.disabled_types.join(","),
    });
    return stmts.getPreference.get(data.username) as UserPreference;
}

export function getPreference(username: string): UserPreference {
    const pref = stmts.getPreference.get(username) as UserPreference | undefined;
    if (!pref) throw new NotFoundError("User preference", username);
    return pref;
}

export function listPreferences(): UserPreference[] {
    return stmts.listPreferences.all() as UserPreference[];
}