import dotenv from 'dotenv';
dotenv.config();

import fs   from 'fs';
import path from 'path';
import { loadConfig }        from './config/config';
import { runBackup }         from './services/backup';
import { runRestore }        from './services/restore';
import { readLog, pruneLog } from './services/logger';
import { printBackupResult, printBackupList } from './display/printer';

const COMMANDS = ['backup', 'restore', 'list', 'clean'] as const;

async function main(): Promise<void> {
    const cmd = (process.argv[2] || 'backup') as typeof COMMANDS[number];

    if (!COMMANDS.includes(cmd)) {
        console.error(`[App] Unknown command "${cmd}". Use: backup | restore | list | clean`);
        process.exit(1);
    }

    console.log(`[App] Backup Script — command: ${cmd}\n`);

    let config;
    try {
        config = loadConfig();
    } catch (err) {
        console.error('[App] Config error:', (err as Error).message);
        process.exit(1);
    }

    try {
        if (cmd === 'backup') {
            const entry = await runBackup(config);
            printBackupResult(entry);
        }

        if (cmd === 'restore') {
            runRestore(config);
        }

        if (cmd === 'list') {
            const log = readLog(config.logPath);
            printBackupList(log.entries);
        }

        if (cmd === 'clean') {
            console.log('[Clean] Removing all backups and log...');
            if (fs.existsSync(config.dest)) {
                const dirs = fs.readdirSync(config.dest)
                    .filter((d) => d.startsWith('backup-'))
                    .map((d) => path.join(config.dest, d));

                for (const dir of dirs) {
                    fs.rmSync(dir, { recursive: true, force: true });
                    console.log(`  Removed: ${path.basename(dir)}`);
                }
            }
            if (fs.existsSync(config.logPath)) {
                fs.unlinkSync(config.logPath);
                console.log('  Removed: backup-log.json');
            }
            console.log('[Clean] Done.\n');
        }
    } catch (err) {
        console.error('[App] Error:', (err as Error).message);
        process.exit(1);
    }
}

main();