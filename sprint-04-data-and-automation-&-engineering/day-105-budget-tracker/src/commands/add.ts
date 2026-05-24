import { addTransaction } from '../db/store';

export function cmdAdd(args: string[]): void {
    // Usage: add <income|expense> <amount> <category> [description] [date]
    const [type, amountStr, category, ...rest] = args;

    if (!type || !amountStr || !category) {
        console.error('Usage: budget add <income|expense> <amount> <category> [description] [YYYY-MM-DD]');
        console.error('Example: budget add expense 45000 Food "Grocery shopping" 2025-01-10');
        process.exit(1);
    }

    if (!['income', 'expense'].includes(type)) {
        console.error(`Type must be "income" or "expense", got "${type}"`);
        process.exit(1);
    }

    const amount = parseFloat(amountStr.replace(/[,₦]/g, ''));
    if (isNaN(amount) || amount <= 0) {
        console.error(`Invalid amount: "${amountStr}"`);
        process.exit(1);
    }

    // Last arg may be a date (YYYY-MM-DD), rest is description
    let description = '';
    let date        = new Date().toISOString().slice(0, 10);

    if (rest.length > 0) {
        const last = rest[rest.length - 1];
        if (/^\d{4}-\d{2}-\d{2}$/.test(last)) {
            date        = last;
            description = rest.slice(0, -1).join(' ');
        } else {
            description = rest.join(' ');
        }
    }

    const id = addTransaction(type, amount, category, description, date);
    const naira = `₦${amount.toLocaleString('en-NG')}`;
    console.log(`\n  ✓ Added [${id}] ${type.toUpperCase()} ${naira} — ${category}${description ? ` (${description})` : ''} on ${date}\n`);
}