import Database from 'better-sqlite3';
import fs       from 'fs';
import path     from 'path';
import { JobRun, JobStatus } from '../types';

let db: Database.Database | null = null;

function buildStatements(database: Database.Database) {
    return {
        insertRun: database.prepare(`
      INSERT INTO job_runs (job_id, job_name, status, started_at, finished_at, duration_ms, message)
      VALUES (@jobId, @jobName, @status, @startedAt, @finishedAt, @durationMs, @message)
    `),
        updateRun: database.prepare(`
      UPDATE job_runs
      SET status = @status, finished_at = @finishedAt, duration_ms = @durationMs, message = @message
      WHERE id = @id
    `),
        getHistory: database.prepare(`
      SELECT id, job_id AS jobId, job_name AS jobName, status,
             started_at AS startedAt, finished_at AS finishedAt,
             duration_ms AS durationMs, message
      FROM job_runs
      ORDER BY started_at DESC
      LIMIT @limit
    `),
        getJobHistory: database.prepare(`
      SELECT id, job_id AS jobId, job_name AS jobName, status,
             started_at AS startedAt, finished_at AS finishedAt,
             duration_ms AS durationMs, message
      FROM job_runs
      WHERE job_id = @jobId
      ORDER BY started_at DESC
      LIMIT @limit
    `),
        getJobStats: database.prepare(`
      SELECT
        job_id        AS jobId,
        COUNT(*)      AS totalRuns,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS successRuns,
        SUM(CASE WHEN status = 'failed'  THEN 1 ELSE 0 END) AS failedRuns,
        MAX(started_at)  AS lastRun,
        AVG(duration_ms) AS avgDurationMs
      FROM job_runs
      WHERE job_id = @jobId
      GROUP BY job_id
    `),
        getLastRun: database.prepare(`
      SELECT status, message, started_at AS startedAt
      FROM job_runs
      WHERE job_id = @jobId
      ORDER BY started_at DESC
      LIMIT 1
    `),
        getStreak: database.prepare(`
      SELECT status FROM job_runs
      WHERE job_id = @jobId
      ORDER BY started_at DESC
      LIMIT 20
    `),
    };
}

let stmts: ReturnType<typeof buildStatements> | null = null;

function initDb(): void {
    if (db) return;

    const dbPath = path.resolve(process.env.DB_PATH || './logs/scheduler.db');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    db.exec(`
    CREATE TABLE IF NOT EXISTS job_runs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id      TEXT        NOT NULL,
      job_name    TEXT        NOT NULL,
      status      TEXT        NOT NULL,
      started_at  TEXT        NOT NULL,
      finished_at TEXT,
      duration_ms INTEGER,
      message     TEXT        NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_job_runs_job_id    ON job_runs (job_id);
    CREATE INDEX IF NOT EXISTS idx_job_runs_started   ON job_runs (started_at DESC);
    CREATE INDEX IF NOT EXISTS idx_job_runs_status    ON job_runs (status);
  `);

    stmts = buildStatements(db);
}

function getStmts() {
    if (!stmts) initDb();
    return stmts!;
}

export function startRun(jobId: string, jobName: string): number {
    const s = getStmts();
    const result = s.insertRun.run({
        jobId,
        jobName,
        status:     'running',
        startedAt:  new Date().toISOString(),
        finishedAt: null,
        durationMs: null,
        message:    'Running...',
    });
    return result.lastInsertRowid as number;
}

export function finishRun(
    runId: number,
    status: JobStatus,
    message: string,
    durationMs: number
): void {
    getStmts().updateRun.run({
        id:         runId,
        status,
        finishedAt: new Date().toISOString(),
        durationMs,
        message,
    });
}

export function getHistory(limit = 20): JobRun[] {
    return getStmts().getHistory.all({ limit }) as JobRun[];
}

export function getJobHistory(jobId: string, limit = 10): JobRun[] {
    return getStmts().getJobHistory.all({ jobId, limit }) as JobRun[];
}

export function computeStreak(jobId: string): number {
    const runs = getStmts().getStreak.all({ jobId }) as { status: string }[];
    let streak = 0;
    for (const run of runs) {
        if (run.status === 'success') streak++;
        else break;
    }
    return streak;
}

export function getRawStats(jobId: string): {
    totalRuns: number; successRuns: number; failedRuns: number;
    lastRun: string | null; avgDurationMs: number | null;
} | null {
    return getStmts().getJobStats.get({ jobId }) as ReturnType<typeof getRawStats>;
}

export function getLastRun(jobId: string): { status: JobStatus; message: string; startedAt: string } | null {
    return getStmts().getLastRun.get({ jobId }) as ReturnType<typeof getLastRun>;
}

export function closeDb(): void {
    if (db) { db.close(); db = null; stmts = null; }
}import Database from 'better-sqlite3';
import fs       from 'fs';
import path     from 'path';
import { JobRun, JobStatus } from '../types';

let db: Database.Database | null = null;

function buildStatements(database: Database.Database) {
    return {
        insertRun: database.prepare(`
      INSERT INTO job_runs (job_id, job_name, status, started_at, finished_at, duration_ms, message)
      VALUES (@jobId, @jobName, @status, @startedAt, @finishedAt, @durationMs, @message)
    `),
        updateRun: database.prepare(`
      UPDATE job_runs
      SET status = @status, finished_at = @finishedAt, duration_ms = @durationMs, message = @message
      WHERE id = @id
    `),
        getHistory: database.prepare(`
      SELECT id, job_id AS jobId, job_name AS jobName, status,
             started_at AS startedAt, finished_at AS finishedAt,
             duration_ms AS durationMs, message
      FROM job_runs
      ORDER BY started_at DESC
      LIMIT @limit
    `),
        getJobHistory: database.prepare(`
      SELECT id, job_id AS jobId, job_name AS jobName, status,
             started_at AS startedAt, finished_at AS finishedAt,
             duration_ms AS durationMs, message
      FROM job_runs
      WHERE job_id = @jobId
      ORDER BY started_at DESC
      LIMIT @limit
    `),
        getJobStats: database.prepare(`
      SELECT
        job_id        AS jobId,
        COUNT(*)      AS totalRuns,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS successRuns,
        SUM(CASE WHEN status = 'failed'  THEN 1 ELSE 0 END) AS failedRuns,
        MAX(started_at)  AS lastRun,
        AVG(duration_ms) AS avgDurationMs
      FROM job_runs
      WHERE job_id = @jobId
      GROUP BY job_id
    `),
        getLastRun: database.prepare(`
      SELECT status, message, started_at AS startedAt
      FROM job_runs
      WHERE job_id = @jobId
      ORDER BY started_at DESC
      LIMIT 1
    `),
        getStreak: database.prepare(`
      SELECT status FROM job_runs
      WHERE job_id = @jobId
      ORDER BY started_at DESC
      LIMIT 20
    `),
    };
}

let stmts: ReturnType<typeof buildStatements> | null = null;

function initDb(): void {
    if (db) return;

    const dbPath = path.resolve(process.env.DB_PATH || './logs/scheduler.db');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    db.exec(`
    CREATE TABLE IF NOT EXISTS job_runs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id      TEXT        NOT NULL,
      job_name    TEXT        NOT NULL,
      status      TEXT        NOT NULL,
      started_at  TEXT        NOT NULL,
      finished_at TEXT,
      duration_ms INTEGER,
      message     TEXT        NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_job_runs_job_id    ON job_runs (job_id);
    CREATE INDEX IF NOT EXISTS idx_job_runs_started   ON job_runs (started_at DESC);
    CREATE INDEX IF NOT EXISTS idx_job_runs_status    ON job_runs (status);
  `);

    stmts = buildStatements(db);
}

function getStmts() {
    if (!stmts) initDb();
    return stmts!;
}

export function startRun(jobId: string, jobName: string): number {
    const s = getStmts();
    const result = s.insertRun.run({
        jobId,
        jobName,
        status:     'running',
        startedAt:  new Date().toISOString(),
        finishedAt: null,
        durationMs: null,
        message:    'Running...',
    });
    return result.lastInsertRowid as number;
}

export function finishRun(
    runId: number,
    status: JobStatus,
    message: string,
    durationMs: number
): void {
    getStmts().updateRun.run({
        id:         runId,
        status,
        finishedAt: new Date().toISOString(),
        durationMs,
        message,
    });
}

export function getHistory(limit = 20): JobRun[] {
    return getStmts().getHistory.all({ limit }) as JobRun[];
}

export function getJobHistory(jobId: string, limit = 10): JobRun[] {
    return getStmts().getJobHistory.all({ jobId, limit }) as JobRun[];
}

export function computeStreak(jobId: string): number {
    const runs = getStmts().getStreak.all({ jobId }) as { status: string }[];
    let streak = 0;
    for (const run of runs) {
        if (run.status === 'success') streak++;
        else break;
    }
    return streak;
}

export function getRawStats(jobId: string): {
    totalRuns: number; successRuns: number; failedRuns: number;
    lastRun: string | null; avgDurationMs: number | null;
} | null {
    return getStmts().getJobStats.get({ jobId }) as ReturnType<typeof getRawStats>;
}

export function getLastRun(jobId: string): { status: JobStatus; message: string; startedAt: string } | null {
    return getStmts().getLastRun.get({ jobId }) as ReturnType<typeof getLastRun>;
}

export function closeDb(): void {
    if (db) { db.close(); db = null; stmts = null; }
}