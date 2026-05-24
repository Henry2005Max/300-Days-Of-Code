import { upsertBudget, deleteTransaction } from '../db/store';

export function cmdBudget(args: string[]): void {
    // Usage: budget budget <category> <amount> [YYYY-MM]
    const [category, amountStr, monthArg] = args;

    if (!category || !amountStr) {
        console.error('Usage: budget budget <category> <amount> [YYYY-MM]');
        console.error('Example: budget budget Food 65000 2025-01');
        process.exit(1);
    }

    const limit = parseFloat(amountStr.replace(/[,₦]/g, ''));
    if (isNaN(limit) || limit <= 0) {
        console.error(`Invalid amount: "${amountStr}"`);
        process.exit(1);
    }

    const monthYear = monthArg || new Date().toISOString().slice(0, 7);
    upsertBudget(category, monthYear, limit);

    console.log(`\n  ✓ Budget set: ${category} → ₦${limit.toLocaleString('en-NG')} for ${monthYear}\n`);
}

export function cmdDelete(args: string[]): void {
    const idStr = args[0];
    if (!idStr) {
        console.error('Usage: budget delete <id>');
        process.exit(1);
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
        console.error(`Invalid ID: "${idStr}"`);
        process.exit(1);
    }

    const deleted = deleteTransaction(id);
    if (deleted) {
        console.log(`\n  ✓ Transaction [${id}] deleted.\n`);
    } else {
        console.error(`\n  Transaction [${id}] not found.\n`);
    }
}