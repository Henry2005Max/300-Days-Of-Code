import dotenv from 'dotenv';
dotenv.config();

import { loadConfig }          from './config/categories';
import { scanDirectory }       from './scanner/scanner';
import { processAll }          from './organizer/mover';
import { loadHistory, saveRun, generateRunId } from './history/history';
import { printPreview, printSummary, printHistory } from './display/printer';

const COMMANDS = ['organize', 'preview', 'history', 'undo'] as const;
type Command = typeof COMMANDS[number];

async function main(): Promise<void> {
    const cmd = (process.argv[2] || 'preview') as Command;
    const config = loadConfig();

    console.log(`\n[File Organizer] Command: ${cmd}`);
    console.log(`[File Organizer] Source : ${config.targetDir}`);
    console.log(`[File Organizer] Dest   : ${config.outputDir}`);
    console.log(`[File Organizer] Mode   : ${config.operation}  |  Conflict: ${config.conflict}\n`);

    try {
        if (cmd === 'preview') {
            const entries = scanDirectory(config);
            if (entries.length === 0) {
                console.log('  No files found in target directory.\n');
                return;
            }
            printPreview(entries);
        }

        else if (cmd === 'organize') {
            const entries = scanDirectory(config);
            if (entries.length === 0) {
                console.log('  No files found in target directory.\n');
                return;
            }

            console.log(`[Organizer] Processing ${entries.length} files...\n`);
            const results = processAll(entries, config, false);

            const run = {
                id:         generateRunId(),
                timestamp:  new Date().toISOString(),
                targetDir:  config.targetDir,
                outputDir:  config.outputDir,
                operation:  config.operation,
                dryRun:     false,
                totalFiles: results.length,
                moved:      results.filter((r) => r.status === 'moved').length,
                copied:     results.filter((r) => r.status === 'copied').length,
                skipped:    results.filter((r) => r.status === 'skipped').length,
                errors:     results.filter((r) => r.status === 'error').length,
                results,
            };

            saveRun(config.historyFile, run);
            printSummary(results, false);
        }

        else if (cmd === 'history') {
            const runs = loadHistory(config.historyFile);
            printHistory(runs);
        }

        else if (cmd === 'undo') {
            const runs = loadHistory(config.historyFile);
            const last = runs.find((r) => !r.dryRun && r.operation === 'move');
            if (!last) {
                console.log('  No undoable run found (only move operations can be undone).\n');
                return;
            }

            console.log(`[Undo] Reversing run: ${last.id}\n`);
            let undone = 0;
            let failed = 0;

            const fs = await import('fs');
            for (const result of last.results) {
                if (result.status !== 'moved') continue;
                const { srcPath, destPath } = result.entry;
                try {
                    if (fs.existsSync(destPath)) {
                        fs.mkdirSync(require('path').dirname(srcPath), { recursive: true });
                        fs.renameSync(destPath, srcPath);
                        console.log(`  ✓ Restored: ${result.entry.name}`);
                        undone++;
                    }
                } catch (err) {
                    console.error(`  ✗ Failed to restore ${result.entry.name}: ${(err as Error).message}`);
                    failed++;
                }
            }

            console.log(`\n[Undo] Restored ${undone} file(s), ${failed} failed.\n`);
        }

        else {
            console.error(`Unknown command: "${cmd}". Use: preview | organize | history | undo\n`);
            process.exit(1);
        }
    } catch (err) {
        console.error('[Error]', (err as Error).message);
        process.exit(1);
    }
}

main();