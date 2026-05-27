import fs   from 'fs';
import path from 'path';
import { FileEntry, FileResult, OrganizerConfig } from '../types';

export function processFile(
    entry:  FileEntry,
    config: OrganizerConfig,
    dryRun: boolean
): FileResult {
    // Skip if conflict mode is 'skip' and dest already exists
    if (
        config.conflict === 'skip' &&
        fs.existsSync(entry.destPath)
    ) {
        return { entry, status: 'skipped' };
    }

    if (dryRun) {
        // Simulate success without touching the filesystem
        return {
            entry,
            status: config.operation === 'move' ? 'moved' : 'copied',
        };
    }

    try {
        fs.mkdirSync(path.dirname(entry.destPath), { recursive: true });

        if (config.operation === 'move') {
            fs.renameSync(entry.srcPath, entry.destPath);
            return { entry, status: 'moved' };
        } else {
            fs.copyFileSync(entry.srcPath, entry.destPath);
            return { entry, status: 'copied' };
        }
    } catch (err) {
        // renameSync can fail across different filesystems; fall back to copy+delete
        try {
            fs.copyFileSync(entry.srcPath, entry.destPath);
            if (config.operation === 'move') fs.unlinkSync(entry.srcPath);
            return { entry, status: 'moved' };
        } catch (fallbackErr) {
            return {
                entry,
                status: 'error',
                error:  (fallbackErr as Error).message,
            };
        }
    }
}

export function processAll(
    entries: FileEntry[],
    config:  OrganizerConfig,
    dryRun:  boolean
): FileResult[] {
    const results: FileResult[] = [];
    for (const entry of entries) {
        const result = processFile(entry, config, dryRun);
        results.push(result);
        const icon = result.status === 'error' ? '✗' : result.status === 'skipped' ? '=' : '✓';
        console.log(`  ${icon} [${entry.category.padEnd(12)}] ${entry.name} → ${entry.destName}`);
    }
    return results;
}