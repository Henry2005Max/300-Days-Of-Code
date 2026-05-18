import path from 'path';
import { BackupConfig } from '../types';

export function loadConfig(): BackupConfig {
    const sources = (process.env.BACKUP_SOURCES || '')
        .split(',')
        .map((s) => path.resolve(s.trim()))
        .filter(Boolean);

    const dest    = path.resolve(process.env.BACKUP_DEST    || './backups');
    const logPath = path.resolve(process.env.BACKUP_LOG     || './backups/backup-log.json');
    const max     = parseInt(process.env.MAX_BACKUPS        || '5', 10);
    const restoreId = process.env.RESTORE_ID               || '';

    if (sources.length === 0) {
        throw new Error('No backup sources configured. Set BACKUP_SOURCES in .env');
    }

    return { sources, dest, logPath, maxBackups: max, restoreId };
}