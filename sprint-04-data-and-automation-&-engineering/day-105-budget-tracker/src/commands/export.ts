import fs   from 'fs';
import path from 'path';
import { getAllTransactions } from '../db/store';
import { Transaction }        from '../types';

export function cmdExport(args: string[]): void {
    const exportDir = path.resolve(process.env.EXPORT_DIR || './data/exports');
    fs.mkdirSync(exportDir, { recursive: true });

    const ts       = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const fileName = args[0] || `budget-export-${ts}.csv`;
    const outPath  = path.join(exportDir, fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);

    const rows = getAllTransactions() as Transaction[];

    if (rows.length === 0) {
        console.log('\n  No transactions to export.\n');
        return;
    }

    const header = 'id,type,amount,category,description,date,created_at';
    const lines  = rows.map((r) =>
        [
            r.id,
            r.type,
            r.amount,
            `"${r.category}"`,
            `"${(r.description || '').replace(/"/g, '""')}"`,
            r.date,
            r.createdAt,
        ].join(',')
    );

    fs.writeFileSync(outPath, [header, ...lines].join('\n') + '\n', 'utf-8');

    console.log(`\n  ✓ Exported ${rows.length} transactions → ${outPath}\n`);
}