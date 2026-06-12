import * as fs from 'fs';
import * as path from 'path';
import { stringify } from 'csv-stringify/sync';
import { listTransactionsWithBalance } from '../models/transactionModel';

/**
 * Exports all of a user's transactions (with running balance) to a CSV
 * file inside the configured export directory. Returns the full path
 * of the written file.
 */
export function exportTransactionsToCsv(userId: number, filename: string): string {
  const transactions = listTransactionsWithBalance(userId);

  const rows = transactions.map((t) => ({
    date: t.date,
    category: t.category_name,
    type: t.type,
    description: t.description,
    amount: t.amount.toFixed(2),
    running_balance: t.running_balance.toFixed(2),
  }));

  const csv = stringify(rows, {
    header: true,
    columns: ['date', 'category', 'type', 'description', 'amount', 'running_balance'],
  });

  const exportDir = process.env.EXPORT_DIR || './exports';
  const resolvedDir = path.resolve(process.cwd(), exportDir);

  if (!fs.existsSync(resolvedDir)) {
    fs.mkdirSync(resolvedDir, { recursive: true });
  }

  const fullPath = path.join(resolvedDir, filename);
  fs.writeFileSync(fullPath, csv);
  return fullPath;
}
