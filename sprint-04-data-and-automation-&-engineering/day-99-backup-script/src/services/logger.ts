import fs   from 'fs';
import path from 'path';
import { BackupLog, BackupEntry } from '../types';

const SCHEMA_VERSION = 1;

export function readLog(logPath: string): BackupLog {
    if (!fs.existsSync(logPath)) {
        return { version: SCHEMA_VERSION, entries: [] };
    }
    try {
        const raw = fs.readFileSync(logPath, 'utf-8');
        return JSON.parse(raw) as BackupLog;
    } catch {
        console.warn('[Log] Could not parse log file — starting fresh.');
        return { version: SCHEMA_VERSION, entries: [] };
    }
}

export function writeLog(logPath: string, log: BackupLog): void {
    const dir = path.dirname(logPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(logPath, JSON.stringify(log, null, 2), 'utf-8');
}

export function appendEntry(logPath: string, entry: BackupEntry): void {
    const log = readLog(logPath);
    log.entries.unshift(entry); // newest first
    writeLog(logPath, log);
}

export function getEntry(logPath: string, id: string): BackupEntry | undefined {
    const log = readLog(logPath);
    return log.entries.find((e) => e.id === id);
}

export function pruneLog(logPath: string, maxBackups: number): string[] {
    if (maxBackups <= 0) return [];

    const log     = readLog(logPath);
    const removed  = log.entries.splice(maxBackups);
    writeLog(logPath, log);

    return removed.flatMap((e) => e.archives.map((a) => a.archivePath));
}