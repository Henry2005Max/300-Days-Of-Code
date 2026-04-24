// NotificationService: the heart of Day 77.
// It ties together SQLite (persistence) + templates (HTML generation) + mailer (delivery).
// Routes call these methods — they never call sendMail() directly.

import db from "../db/database";
import { sendMail } from "./mailer";
import { buildTemplate } from "./templates";
import { CreateNotificationInput, Notification, NotificationType } from "../types";
import { NotFoundError } from "../middleware/errorHandler";

// ── Create & send ────────────────────────────────────────────────────────────

export async function createAndSend(input: CreateNotificationInput): Promise<Notification> {
    const { type, to, data } = input;
    const { subject, html, text } = buildTemplate(type as NotificationType, data);

    // Insert a "pending" row first so we always have a record even if sending crashes
    const insertStmt = db.prepare(`
    INSERT INTO notifications (type, to_email, subject, status, attempts)
    VALUES (@type, @to_email, @subject, 'pending', 0)
  `);

    const result = insertStmt.run({ type, to_email: to, subject });
    const id = result.lastInsertRowid as number;

    // Try to send the email; update the row with the outcome
    try {
        const { messageId } = await sendMail({ to, subject, html, text });

        db.prepare(`
      UPDATE notifications
      SET status = 'sent', message_id = @messageId, attempts = attempts + 1,
          sent_at = datetime('now')
      WHERE id = @id
    `).run({ messageId, id });
    } catch (err: any) {
        db.prepare(`
      UPDATE notifications
      SET status = 'failed', error = @error, attempts = attempts + 1
      WHERE id = @id
    `).run({ error: err.message, id });
    }

    return getById(id);
}

// ── Retry a failed notification ──────────────────────────────────────────────

export async function retryNotification(id: number): Promise<Notification> {
    const notification = getById(id); // throws NotFoundError if missing

    if (notification.status === "sent") {
        // Already succeeded — nothing to retry
        return notification;
    }

    const { subject, html, text } = buildTemplate(
        notification.type as NotificationType,
        {} // data was not stored — subject already contains the rendered subject
    );

    try {
        // Re-render using just the subject as a custom template so we still send something useful
        const { messageId } = await sendMail({
            to: notification.to_email,
            subject: notification.subject,
            html,
            text,
        });

        db.prepare(`
      UPDATE notifications
      SET status = 'sent', message_id = @messageId, error = NULL,
          attempts = attempts + 1, sent_at = datetime('now')
      WHERE id = @id
    `).run({ messageId, id });
    } catch (err: any) {
        db.prepare(`
      UPDATE notifications
      SET status = 'failed', error = @error, attempts = attempts + 1
      WHERE id = @id
    `).run({ error: err.message, id });
    }

    return getById(id);
}

// ── Queries ──────────────────────────────────────────────────────────────────

export function getById(id: number): Notification {
    const row = db.prepare("SELECT * FROM notifications WHERE id = ?").get(id);
    if (!row) throw new NotFoundError("Notification", id);
    return row as Notification;
}

export function list(filters: {
    status?: string;
    to?: string;
    limit: number;
    offset: number;
}): { rows: Notification[]; total: number } {
    // Build a dynamic WHERE clause from whatever filters are provided
    const conditions: string[] = [];
    const params: Record<string, unknown> = { limit: filters.limit, offset: filters.offset };

    if (filters.status) { conditions.push("status = @status"); params.status = filters.status; }
    if (filters.to)     { conditions.push("to_email = @to");   params.to     = filters.to; }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows  = db.prepare(`SELECT * FROM notifications ${where} ORDER BY id DESC LIMIT @limit OFFSET @offset`).all(params) as Notification[];
    const total = (db.prepare(`SELECT COUNT(*) as count FROM notifications ${where}`).get(params) as { count: number }).count;

    return { rows, total };
}

// Aggregated stats for the /stats endpoint
export function getStats(): Record<string, number> {
    const rows = db.prepare(`
    SELECT status, COUNT(*) as count FROM notifications GROUP BY status
  `).all() as { status: string; count: number }[];

    const stats: Record<string, number> = { total: 0, sent: 0, failed: 0, pending: 0 };
    for (const row of rows) {
        stats[row.status] = row.count;
        stats.total += row.count;
    }
    return stats;
}