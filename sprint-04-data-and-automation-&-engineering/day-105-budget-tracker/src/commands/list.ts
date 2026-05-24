import { getTransactions } from '../db/store';
import { Transaction }     from '../types';

const NAIRA = (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

export function cmdList(args: string[]): void {
    // Flags: --type=income|expense --month=YYYY-MM --category=X --limit=N
    const flags: Record<string, string> = {};
    for (const arg of args) {
        const [key, val] = arg.replace(/^--/, '').split('=');
        if (val !== undefined) flags[key] = val;
    }

    const rows = getTransactions({
        type:     flags.type,
        month:    flags.month,
        category: flags.category,
        limit:    parseInt(flags.limit || '30', 10),
    }) as Transaction[];

    if (rows.length === 0) {
        console.log('\n  No transactions found.\n');
        return;
    }

    const LINE = '─'.repeat(80);
    console.log('\n  ' + '═'.repeat(80));
    console.log('  TRANSACTIONS');
    console.log('  ' + '═'.repeat(80));
    console.log(
        `  ${'ID'.padEnd(5)} ${'Date'.padEnd(12)} ${'Type'.padEnd(9)} ${'Category'.padEnd(16)} ${'Amount'.padStart(14)}  Description`
    );
    console.log('  ' + LINE);

    for (const r of rows) {
        const amtStr = r.type === 'income'
            ? `+${NAIRA(r.amount)}`
            : `-${NAIRA(r.amount)}`;
        const amtColored = r.type === 'income'
            ? `\x1b[32m${amtStr}\x1b[0m`
            : `\x1b[31m${amtStr}\x1b[0m`;

        console.log(
            `  ${String(r.id).padEnd(5)} ${r.date.padEnd(12)} ${r.type.padEnd(9)} ${r.category.slice(0, 16).padEnd(16)} ${amtColored.padStart(22)}  ${(r.description || '').slice(0, 30)}`
        );
    }

    console.log('  ' + LINE);
    const totalIncome  = rows.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0);
    const totalExpense = rows.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
    console.log(`  Showing ${rows.length} transaction(s)   Income: \x1b[32m${NAIRA(totalIncome)}\x1b[0m   Expenses: \x1b[31m${NAIRA(totalExpense)}\x1b[0m`);
    console.log('');
}