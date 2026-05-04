import db from "./database";

type Stmts = ReturnType<typeof buildStatements>;
let _stmts: Stmts | null = null;

function buildStatements() {
    return {
        // ── Queue ──────────────────────────────────────────────────────────
        insertJob: db.prepare(`
      INSERT INTO notification_jobs
        (type, channel, recipient_email, recipient_webhook,
         subject, body_html, body_text, payload)
      VALUES
        (@type, @channel, @recipient_email, @recipient_webhook,
         @subject, @body_html, @body_text, @payload)
    `),

        // Pick up jobs ready to attempt — status pending/failed, due now
        // LIMIT 10 so one worker tick doesn't hold all jobs
        pickupJobs: db.prepare(`
      SELECT * FROM notification_jobs
      WHERE status IN ('pending', 'failed')
        AND next_attempt_at <= datetime('now')
      ORDER BY next_attempt_at ASC
      LIMIT 10
    `),

        markProcessing: db.prepare(`
      UPDATE notification_jobs
      SET status = 'processing', updated_at = datetime('now')
      WHERE id = ? AND status IN ('pending', 'failed')
    `),

        markSent: db.prepare(`
      UPDATE notification_jobs
      SET status = 'sent', sent_at = datetime('now'),
          attempts = attempts + 1, updated_at = datetime('now')
      WHERE id = ?
    `),

        markFailed: db.prepare(`
      UPDATE notification_jobs
      SET status = @status,
          attempts = attempts + 1,
          last_error = @last_error,
          next_attempt_at = @next_attempt_at,
          updated_at = datetime('now')
      WHERE id = @id
    `),

        getJobById:   db.prepare("SELECT * FROM notification_jobs WHERE id = ?"),
        listJobs:     db.prepare(`
      SELECT * FROM notification_jobs
      WHERE (@status IS NULL OR status = @status)
      ORDER BY created_at DESC LIMIT @limit OFFSET @offset
    `),
        countJobs:    db.prepare(`
      SELECT COUNT(*) as count FROM notification_jobs
      WHERE (@status IS NULL OR status = @status)
    `),
        retryJob:     db.prepare(`
      UPDATE notification_jobs
      SET status = 'pending', last_error = NULL,
          next_attempt_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ? AND status IN ('failed','dead')
    `),
        queueStats:   db.prepare(`
      SELECT status, COUNT(*) as count FROM notification_jobs
      GROUP BY status ORDER BY count DESC
    `),

        // ── User preferences ────────────────────────────────────────────────
        upsertPreference: db.prepare(`
      INSERT INTO user_preferences (username, email, webhook_url, channel, disabled_types)
      VALUES (@username, @email, @webhook_url, @channel, @disabled_types)
      ON CONFLICT(username) DO UPDATE SET
        email           = excluded.email,
        webhook_url     = excluded.webhook_url,
        channel         = excluded.channel,
        disabled_types  = excluded.disabled_types,
        updated_at      = datetime('now')
    `),
        getPreference:    db.prepare("SELECT * FROM user_preferences WHERE username = ?"),
        listPreferences:  db.prepare("SELECT * FROM user_preferences ORDER BY created_at DESC"),

        // ── Delivery logs ───────────────────────────────────────────────────
        insertLog: db.prepare(`
      INSERT INTO delivery_logs (job_id, channel, attempt, success, response)
      VALUES (@job_id, @channel, @attempt, @success, @response)
    `),
        getLogsForJob: db.prepare(`
      SELECT * FROM delivery_logs WHERE job_id = ? ORDER BY attempted_at DESC
    `),
    };
}

export function initStatements(): void {
    _stmts = buildStatements();
    console.log("[db] Prepared statements compiled");
}

export const stmts = new Proxy({} as Stmts, {
    get(_target, prop: string) {
        if (!_stmts) throw new Error("initStatements() must be called after runMigrations()");
        return (_stmts as any)[prop];
    },
});