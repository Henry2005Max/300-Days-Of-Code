import fs   from 'fs';
import path from 'path';
import { BackupConfig, BackupEntry } from '../types';
import { createArchive, generateBackupId } from './archiver';
import { appendEntry, pruneLog }           from './logger';

export async function runBackup(config: BackupConfig): Promise<BackupEntry> {
    const id        = generateBackupId();
    const startTime = Date.now();
    const runDir    = path.join(config.dest, id);

    console.log(`\n[Backup] Starting backup — ID: ${id}`);
    console.log(`[Backup] Sources  : ${config.sources.length}`);
    console.log(`[Backup] Dest dir : ${runDir}\n`);

    fs.mkdirSync(runDir, { recursive: true });

    const archives = [];
    let   hasError = false;

    for (const source of config.sources) {
        if (!fs.existsSync(source)) {
            console.warn(`  [Skip] Source not found: ${source}`);
            hasError = true;
            continue;
        }

        const sourceName  = path.basename(source);
        const archivePath = path.join(runDir, `${sourceName}.tar.gz`);

        try {
            const entry = await createArchive(source, archivePath);
            archives.push(entry);
        } catch (err) {
            console.error(`  [Error] Failed to archive ${source}: ${(err as Error).message}`);
            hasError = true;
        }
    }

    const durationMs  = Date.now() - startTime;
    const totalFiles  = archives.reduce((s, a) => s + a.files, 0);
    const totalBytes  = archives.reduce((s, a) => s + a.bytes, 0);
    const status      = hasError
        ? (archives.length > 0 ? 'partial' : 'failed')
        : 'success';

    const entry: BackupEntry = {
        id,
        timestamp:  new Date().toISOString(),
        sources:    config.sources,
        archives,
        status,
        totalFiles,
        totalBytes,
        durationMs,
    };

    appendEntry(config.logPath, entry);

    // Prune old backups
    if (config.maxBackups > 0) {
        const staleArchives = pruneLog(config.logPath, config.maxBackups);
        for (const archivePath of staleArchives) {
            if (fs.existsSync(archivePath)) {
                fs.rmSync(path.dirname(archivePath), { recursive: true, force: true });
                console.log(`[Cleanup] Removed old backup: ${path.basename(path.dirname(archivePath))}`);
            }
        }
    }

    return entry;
}