import { FileEntry, FileResult, OrganizerRun } from '../types';

const DLINE = '═'.repeat(70);
const LINE  = '─'.repeat(70);

function fmtSize(bytes: number): string {
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
    if (bytes >= 1_024)     return `${(bytes / 1_024).toFixed(0)} KB`;
    return `${bytes} B`;
}

export function printPreview(entries: FileEntry[]): void {
    // Group by category
    const byCategory = new Map<string, FileEntry[]>();
    for (const e of entries) {
        if (!byCategory.has(e.category)) byCategory.set(e.category, []);
        byCategory.get(e.category)!.push(e);
    }

    console.log('\n' + DLINE);
    console.log('  DRY-RUN PREVIEW — Files will be organised as follows:');
    console.log(DLINE);

    for (const [category, files] of byCategory) {
        const totalSize = files.reduce((s, f) => s + f.size, 0);
        console.log(`\n  📁 ${category}/  (${files.length} file${files.length !== 1 ? 's' : ''}, ${fmtSize(totalSize)})`);
        console.log('  ' + LINE);
        for (const f of files) {
            const rename = f.destName !== f.name
                ? ` → \x1b[33m${f.destName}\x1b[0m`
                : '';
            console.log(`    ${f.name}${rename}  \x1b[2m${fmtSize(f.size)}\x1b[0m`);
        }
    }

    const totalSize = entries.reduce((s, e) => s + e.size, 0);
    console.log('\n' + LINE);
    console.log(`  Total: ${entries.length} files  (${fmtSize(totalSize)})  across ${byCategory.size} categories`);
    console.log(DLINE + '\n');
}

export function printSummary(results: FileResult[], dryRun: boolean): void {
    const moved   = results.filter((r) => r.status === 'moved').length;
    const copied  = results.filter((r) => r.status === 'copied').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const errors  = results.filter((r) => r.status === 'error').length;

    console.log('\n' + DLINE);
    console.log(`  SUMMARY${dryRun ? '  (DRY RUN — no files were changed)' : ''}`);
    console.log(DLINE);
    if (moved   > 0) console.log(`  \x1b[32m✓\x1b[0m  Moved   : ${moved}`);
    if (copied  > 0) console.log(`  \x1b[32m✓\x1b[0m  Copied  : ${copied}`);
    if (skipped > 0) console.log(`  \x1b[33m=\x1b[0m  Skipped : ${skipped}`);
    if (errors  > 0) {
        console.log(`  \x1b[31m✗\x1b[0m  Errors  : ${errors}`);
        results.filter((r) => r.status === 'error').forEach((r) => {
            console.log(`     └─ ${r.entry.name}: ${r.error}`);
        });
    }
    console.log(DLINE + '\n');
}

export function printHistory(runs: OrganizerRun[]): void {
    console.log('\n' + DLINE);
    console.log('  ORGANIZER RUN HISTORY');
    console.log(DLINE);

    if (runs.length === 0) {
        console.log('\n  No runs recorded yet.\n');
        return;
    }

    for (const run of runs) {
        const ts   = new Date(run.timestamp).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'short', timeStyle: 'short' });
        const mode = run.dryRun ? '\x1b[2m[DRY RUN]\x1b[0m' : `[${run.operation.toUpperCase()}]`;
        console.log(`\n  ${mode}  ${run.id}  —  ${ts}`);
        console.log(`  From : ${run.targetDir}`);
        console.log(`  To   : ${run.outputDir}`);
        console.log(`  Files: ${run.totalFiles} total  ✓ ${run.moved + run.copied}  = ${run.skipped}  ✗ ${run.errors}`);
    }

    console.log('\n' + DLINE + '\n');
}