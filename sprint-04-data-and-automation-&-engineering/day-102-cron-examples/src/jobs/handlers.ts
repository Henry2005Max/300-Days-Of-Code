import fs   from 'fs';
import path from 'path';
import { JobOutput } from '../types';

const LOG_FILE = path.resolve(process.env.LOG_FILE || './logs/scheduler.log');

function appendLog(message: string): void {
    const line = `[${new Date().toISOString()}] ${message}\n`;
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, line, 'utf-8');
}

// Job 1 — Heartbeat ping
export async function heartbeatJob(): Promise<JobOutput> {
    const memMb   = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const uptimeSec = Math.round(process.uptime());
    const message = `Alive — heap: ${memMb}MB, uptime: ${uptimeSec}s`;
    appendLog(`[heartbeat] ${message}`);
    return { message, data: { heapMb: memMb, uptimeSec } };
}

// Job 2 — Log rotation (renames log if > 50KB, starts fresh)
export async function logRotationJob(): Promise<JobOutput> {
    if (!fs.existsSync(LOG_FILE)) {
        return { message: 'No log file to rotate.' };
    }

    const stat = fs.statSync(LOG_FILE);
    const sizeKb = Math.round(stat.size / 1024);

    if (stat.size < 50 * 1024) {
        return { message: `Log is ${sizeKb}KB — rotation not needed (threshold: 50KB).` };
    }

    const ts      = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const rotated = LOG_FILE.replace('.log', `-${ts}.log`);
    fs.renameSync(LOG_FILE, rotated);

    const message = `Rotated ${sizeKb}KB log → ${path.basename(rotated)}`;
    appendLog(`[log-rotation] ${message}`);
    return { message, data: { sizeKb, rotatedTo: rotated } };
}

// Job 3 — Report snapshot (writes a JSON summary to disk)
export async function reportSnapshotJob(): Promise<JobOutput> {
    const snapshotDir  = path.resolve('./logs/snapshots');
    fs.mkdirSync(snapshotDir, { recursive: true });

    const ts       = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename  = `snapshot-${ts}.json`;
    const filePath  = path.join(snapshotDir, filename);

    const snapshot = {
        generatedAt:  new Date().toISOString(),
        nodeVersion:  process.version,
        platform:     process.platform,
        memoryMb: {
            heapUsed:  Math.round(process.memoryUsage().heapUsed  / 1024 / 1024),
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            rss:       Math.round(process.memoryUsage().rss       / 1024 / 1024),
        },
        uptimeSec:    Math.round(process.uptime()),
        environment:  process.env.NODE_ENV || 'development',
    };

    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');

    // Keep only last 5 snapshots
    const files = fs.readdirSync(snapshotDir)
        .filter((f) => f.startsWith('snapshot-') && f.endsWith('.json'))
        .sort()
        .reverse();

    if (files.length > 5) {
        files.slice(5).forEach((f) => fs.unlinkSync(path.join(snapshotDir, f)));
    }

    const message = `Snapshot written: ${filename}`;
    appendLog(`[report-snapshot] ${message}`);
    return { message, data: snapshot };
}

// Job 4 — Stale log cleanup (removes rotated logs older than 1 minute for demo)
export async function staleCleanupJob(): Promise<JobOutput> {
    const logDir   = path.dirname(LOG_FILE);
    if (!fs.existsSync(logDir)) {
        return { message: 'Log directory does not exist yet.' };
    }

    const now     = Date.now();
    const maxAge  = 60 * 1000; // 1 minute for demo (would be days in production)
    const pattern = /scheduler-\d{4}-\d{2}-\d{2}T.*\.log$/;

    const files   = fs.readdirSync(logDir).filter((f) => pattern.test(f));
    let   removed = 0;

    for (const file of files) {
        const fullPath = path.join(logDir, file);
        const stat     = fs.statSync(fullPath);
        if (now - stat.mtimeMs > maxAge) {
            fs.unlinkSync(fullPath);
            removed++;
        }
    }

    const message = removed > 0
        ? `Removed ${removed} stale log file(s).`
        : `No stale logs found (${files.length} rotated log(s) checked).`;

    appendLog(`[stale-cleanup] ${message}`);
    return { message, data: { checked: files.length, removed } };
}

// Job 5 — Health check (verifies key directories and files exist)
export async function healthCheckJob(): Promise<JobOutput> {
    const checks: { name: string; ok: boolean }[] = [
        { name: 'logs dir',       ok: fs.existsSync(path.dirname(LOG_FILE)) },
        { name: 'snapshots dir',  ok: fs.existsSync('./logs/snapshots') },
        { name: 'DB file',        ok: fs.existsSync(path.resolve(process.env.DB_PATH || './logs/scheduler.db')) },
    ];

    const failed  = checks.filter((c) => !c.ok);
    const status  = failed.length === 0;
    const message = status
        ? `All ${checks.length} health checks passed.`
        : `${failed.length} check(s) failed: ${failed.map((c) => c.name).join(', ')}`;

    appendLog(`[health-check] ${message}`);

    if (!status) throw new Error(message);
    return { message, data: { checks } };
}