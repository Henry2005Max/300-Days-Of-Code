import * as chalk from 'chalk';
import { Category, RecurringTransaction, TransactionWithBalance, User, MonthlySummary } from '../types';

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function printUsers(users: User[]): void {
  console.log(chalk.bold('\nUsers:'));
  if (users.length === 0) {
    console.log(chalk.gray('  No users found. Try: add-user <name> <email>'));
    return;
  }
  for (const u of users) {
    console.log(`  [${chalk.cyan(String(u.id))}] ${chalk.bold(u.name)} <${u.email}>`);
  }
}

export function printCategories(categories: Category[]): void {
  console.log(chalk.bold('\nCategories:'));
  if (categories.length === 0) {
    console.log(chalk.gray('  No categories found. Try: add-category <userId> <name> <income|expense>'));
    return;
  }
  for (const c of categories) {
    const color = c.type === 'income' ? chalk.green : chalk.red;
    console.log(`  [${chalk.cyan(String(c.id))}] ${c.name} (${color(c.type)})`);
  }
}

export function printTransactions(transactions: TransactionWithBalance[]): void {
  console.log(chalk.bold('\nTransactions:'));
  if (transactions.length === 0) {
    console.log(chalk.gray('  No transactions found.'));
    return;
  }

  console.log(chalk.gray('  Date        Category          Type      Amount            Balance'));
  console.log(chalk.gray('  ' + '-'.repeat(72)));

  for (const t of transactions) {
    const sign = t.type === 'income' ? chalk.green('+') : chalk.red('-');
    const amountStr = (sign + formatNaira(t.amount)).padStart(16);
    const balanceStr = formatNaira(t.running_balance).padStart(16);
    console.log(
      `  ${t.date}  ${t.category_name.padEnd(16)}  ${t.type.padEnd(8)}  ${amountStr}  ${balanceStr}`
    );
    if (t.description) {
      console.log(chalk.gray(`              ${t.description}`));
    }
  }
}

export function printRecurring(recurring: RecurringTransaction[]): void {
  console.log(chalk.bold('\nRecurring Transactions:'));
  if (recurring.length === 0) {
    console.log(chalk.gray('  No recurring transactions found.'));
    return;
  }

  for (const r of recurring) {
    const status = r.active ? chalk.green('active') : chalk.gray('ended');
    const sign = r.type === 'income' ? chalk.green('+') : chalk.red('-');
    console.log(
      `  [${chalk.cyan(String(r.id))}] ${r.description} - ${sign}${formatNaira(r.amount)} every ${r.frequency} (next: ${r.next_due_date}) [${status}]`
    );
  }
}

export function printSummary(summary: MonthlySummary): void {
  console.log(chalk.bold(`\nMonthly Summary - ${summary.user} (${summary.month})`));
  console.log(chalk.gray('-'.repeat(44)));
  console.log(`  Total Income:   ${chalk.green(formatNaira(summary.total_income))}`);
  console.log(`  Total Expense:  ${chalk.red(formatNaira(summary.total_expense))}`);

  const balanceColor = summary.balance >= 0 ? chalk.green : chalk.red;
  console.log(`  Balance:        ${balanceColor(formatNaira(summary.balance))}`);

  if (summary.categories.length > 0) {
    console.log(chalk.bold('\n  By Category:'));
    for (const c of summary.categories) {
      const color = c.type === 'income' ? chalk.green : chalk.red;
      console.log(
        `    ${c.category_name.padEnd(18)} ${color(c.type.padEnd(8))} ${formatNaira(c.total).padStart(16)} (${c.count} txns)`
      );
    }
  } else {
    console.log(chalk.gray('\n  No transactions recorded for this month.'));
  }
}

export function printProcessResults(results: { description: string; amount: number; date: string }[]): void {
  if (results.length === 0) {
    console.log(chalk.gray('\nNo recurring transactions due.'));
    return;
  }

  console.log(chalk.bold(`\nProcessed ${results.length} recurring transaction(s):`));
  for (const r of results) {
    console.log(`  ${r.date}  ${r.description.padEnd(24)}  ${formatNaira(r.amount)}`);
  }
}
