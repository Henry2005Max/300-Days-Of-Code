import fs   from 'fs';
import path from 'path';
import { BackupConfig } from '../types';
import { getEntry }        from './logger';
import { extractArchive }  from './archiver';

export function runRestore(config: BackupConfig): void {
    const { restoreId, logPath, dest } = config;

    if (!restoreId) {
        console.error('[Restore] No RESTORE_ID set in .env. Run "npm run list" to see available backups.');
        process.exit(1);
    }

    const entry = getEntry(logPath, restoreId);
    if (!entry) {
        console.error(`[Restore] Backup ID "${restoreId}" not found in log.`);
        process.exit(1);
    }

    console.log(`\n[Restore] Restoring backup: ${restoreId}`);
    console.log(`[Restore] Original timestamp: ${new Date(entry.timestamp).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} WAT\n`);

    let totalFiles = 0;

    for (const archive of entry.archives) {
        if (!fs.existsSync(archive.archivePath)) {
            console.warn(`  [Skip] Archive not found: ${archive.archivePath}`);
            continue;
        }

        const sourceName  = path.basename(archive.source);
        const restoreDir  = path.join(dest, 'restored', restoreId, sourceName);

        console.log(`  [Extract] ${path.basename(archive.archivePath)} → ${restoreDir}`);
        const count = extractArchive(archive.archivePath, restoreDir);
        totalFiles += count;
        console.log(`            ${count} files extracted`);
    }

    console.log(`\n[Restore] Done. ${totalFiles} total files restored to: ${path.join(dest, 'restored', restoreId)}\n`);
}