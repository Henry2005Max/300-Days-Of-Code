import { BackupEntry } from '../types';

const LINE  = (len = 72) => '─'.repeat(len);
const DLINE = (len = 72) => '═'.repeat(len);

function fmt(bytes: number): string {
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(2)} MB`;
    if (bytes >= 1_024)     return `${(bytes / 1_024).toFixed(1)} KB`;
    return `${bytes} B`;
}

function statusBadge(status: string): string {
    if (status === 'success') return '[OK     ]';
    if (status === 'partial') return '[PARTIAL]';
    return '[FAILED ]';
}

export function printBackupResult(entry: BackupEntry): void {
    console.log('\n' + DLINE());
    console.log('  BACKUP COMPLETE');
    console.log(DLINE());
    console.log(`\n  ID        : ${entry.id}`);
    console.log(`  Status    : ${statusBadge(entry.status)} ${entry.status.toUpperCase()}`);
    console.log(`  Timestamp : ${new Date(entry.timestamp).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} WAT`);
    console.log(`  Duration  : ${entry.durationMs}ms`);
    console.log(`  Files     : ${entry.totalFiles}`);
    console.log(`  Raw size  : ${fmt(entry.totalBytes)}`);

    const totalCompressed = entry.archives.reduce((s, a) => s + a.compressed, 0);
    const ratio = entry.totalBytes > 0
        ? ((1 - totalCompressed / entry.totalBytes) * 100).toFixed(1)
        : '0';
    console.log(`  Compressed: ${fmt(totalCompressed)}  (${ratio}% reduction)\n`);

    if (entry.archives.length > 0) {
        console.log('  ARCHIVES');
        console.log('  ' + LINE(68));
        console.log(
            `  ${'Source'.padEnd(20)} ${'Files'.padStart(7)} ${'Raw'.padStart(12)} ${'Compressed'.padStart(14)}`
        );
        console.log('  ' + LINE(60));
        for (const a of entry.archives) {
            const name = a.source.split('/').pop() || a.source;
            console.log(
                `  ${name.padEnd(20)} ${String(a.files).padStart(7)} ${fmt(a.bytes).padStart(12)} ${fmt(a.compressed).padStart(14)}`
            );
        }
    }

    console.log('\n' + DLINE() + '\n');
}

export function printBackupList(entries: BackupEntry[]): void {
    console.log('\n' + DLINE());
    console.log('  BACKUP HISTORY');
    console.log(DLINE());

    if (entries.length === 0) {
        console.log('\n  No backups found. Run "npm run backup" to create one.\n');
        return;
    }

    console.log(
        `\n  ${'ID'.padEnd(30)} ${'Status'.padEnd(10)} ${'Files'.padStart(7)} ${'Size'.padStart(10)}  Timestamp`
    );
    console.log('  ' + LINE());

    for (const e of entries) {
        const ts  = new Date(e.timestamp).toLocaleString('en-NG', {
            timeZone: 'Africa/Lagos', dateStyle: 'short', timeStyle: 'short',
        });
        console.log(
            `  ${e.id.padEnd(30)} ${statusBadge(e.status).padEnd(10)} ${String(e.totalFiles).padStart(7)} ${fmt(e.totalBytes).padStart(10)}  ${ts}`
        );
    }

    console.log('\n  To restore: set RESTORE_ID=<id> in .env then run "npm run restore"');
    console.log(DLINE() + '\n');
}