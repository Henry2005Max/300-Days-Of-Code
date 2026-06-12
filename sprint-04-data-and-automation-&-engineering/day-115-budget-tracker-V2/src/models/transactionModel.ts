import { getDb } from '../db/connection';
import { Transaction, TransactionType, TransactionWithBalance } from '../types';

interface CreateTransactionInput {
  userId: number;
  categoryId: number;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
}

export function createTransaction(input: CreateTransactionInput): Transaction {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO transactions (user_id, category_id, amount, type, description, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    input.userId,
    input.categoryId,
    input.amount,
    input.type,
    input.description,
    input.date
  );
  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(info.lastInsertRowid) as Transaction;
}

interface ListOptions {
  from?: string;
  to?: string;
}

/**
 * Returns transactions joined with their category name, plus a running
 * balance computed with a SQLite window function (SUM ... OVER), ordered
 * chronologically. Income adds to the balance, expense subtracts.
 */
export function listTransactionsWithBalance(userId: number, options: ListOptions = {}): TransactionWithBalance[] {
  const db = getDb();

  let query = `
    SELECT
      t.*,
      c.name AS category_name,
      SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)
        OVER (PARTITION BY t.user_id ORDER BY t.date, t.id) AS running_balance
    FROM transactions t
    JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = ?
  `;
  const params: (string | number)[] = [userId];

  if (options.from) {
    query += ' AND t.date >= ?';
    params.push(options.from);
  }
  if (options.to) {
    query += ' AND t.date <= ?';
    params.push(options.to);
  }

  query += ' ORDER BY t.date, t.id';

  return db.prepare(query).all(...params) as TransactionWithBalance[];
}
