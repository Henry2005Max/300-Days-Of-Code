import { getMonthlySummary, getCategoryTotals, getRunningBalance, getBudgets } from '../db/store';

const NAIRA = (n: number) => `₦${Math.abs(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
const LINE  = '─'.repeat(72);
const DLINE = '═'.repeat(72);

function bar(used: number, limit: number, width = 14): string {
    const pct    = Math.min(used / limit, 1);
    const filled = Math.round(pct * width);
    const color  = pct >= 1 ? '\x1b[31m' : pct >= 0.8 ? '\x1b[33m' : '\x1b[32m';
    return `${color}${'█'.repeat(filled)}\x1b[0m${'░'.repeat(width - filled)}`;
}

export function cmdSummary(args: string[]): void {
    const monthFlag = args.find((a) => /^\d{4}-\d{2}$/.test(a));
    const month     = monthFlag || new Date().toISOString().slice(0, 7);

    const summaries    = getMonthlySummary(month);
    const categoryRows = getCategoryTotals(month);
    const balanceRows  = getRunningBalance(month);
    const budgets      = getBudgets(month);

    const budgetMap = new Map(budgets.map((b) => [b.category, b.limit]));

    if (summaries.length === 0) {
        console.log(`\n  No data for ${month}.\n`);
        return;
    }

    const { totalIncome, totalExpense } = summaries[0];
    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0
        ? ((netBalance / totalIncome) * 100).toFixed(1)
        : '0.0';

    // Header
    console.log('\n' + DLINE);
    console.log(`  BUDGET SUMMARY — ${month}`);
    console.log(DLINE);

    // Top stats
    console.log('');
    console.log(`  Total Income   : \x1b[32m${NAIRA(totalIncome)}\x1b[0m`);
    console.log(`  Total Expenses : \x1b[31m${NAIRA(totalExpense)}\x1b[0m`);
    console.log(`  Net Balance    : ${netBalance >= 0 ? '\x1b[32m' : '\x1b[31m'}${netBalance >= 0 ? '+' : '-'}${NAIRA(netBalance)}\x1b[0m`);
    console.log(`  Savings Rate   : ${savingsRate}%`);

    // Category breakdown with budget bars
    console.log('\n  SPENDING BY CATEGORY');
    console.log('  ' + LINE);
    console.log(
        `  ${'Category'.padEnd(16)} ${'Type'.padEnd(9)} ${'Amount'.padStart(14)}  ${'Count'.padStart(5)}  ${'Budget'.padEnd(20)}`
    );
    console.log('  ' + LINE);

    for (const row of categoryRows) {
        const limit    = budgetMap.get(row.category) ?? null;
        const amtColor = row.type === 'income' ? '\x1b[32m' : '\x1b[31m';
        const amtStr   = `${amtColor}${NAIRA(row.total)}\x1b[0m`;

        let budgetCol = '—';
        if (limit && row.type === 'expense') {
            const pct      = ((row.total / limit) * 100).toFixed(0);
            const barStr   = bar(row.total, limit);
            budgetCol      = `${barStr} ${pct}% of ${NAIRA(limit)}`;
        }

        console.log(
            `  ${row.category.slice(0, 16).padEnd(16)} ${row.type.padEnd(9)} ${amtStr.padStart(22)}  ${String(row.count).padStart(5)}  ${budgetCol}`
        );
    }

    // Running balance (last 6 entries)
    console.log('\n  RUNNING BALANCE (last 6 transactions)');
    console.log('  ' + LINE);
    const recent = balanceRows.slice(-6);
    for (const r of recent) {
        const sign    = r.type === 'income' ? '+' : '-';
        const color   = r.type === 'income' ? '\x1b[32m' : '\x1b[31m';
        const balColor = r.balance >= 0 ? '\x1b[32m' : '\x1b[31m';
        console.log(
            `  ${r.date}  ${color}${sign}${NAIRA(r.amount)}\x1b[0m  ${r.category.padEnd(14)}  Balance: ${balColor}${NAIRA(r.balance)}\x1b[0m`
        );
    }

    // All months overview
    const allSummaries = getMonthlySummary(null);
    if (allSummaries.length > 1) {
        console.log('\n  ALL MONTHS OVERVIEW');
        console.log('  ' + LINE);
        for (const s of allSummaries) {
            const net      = s.totalIncome - s.totalExpense;
            const netColor = net >= 0 ? '\x1b[32m' : '\x1b[31m';
            console.log(
                `  ${s.monthYear}   Income: ${NAIRA(s.totalIncome).padStart(14)}   Expenses: ${NAIRA(s.totalExpense).padStart(14)}   Net: ${netColor}${net >= 0 ? '+' : '-'}${NAIRA(net)}\x1b[0m`
            );
        }
    }

    console.log('\n' + DLINE + '\n');
}