import { getDb } from '../db/connection';
import { RecurringTransaction, TransactionType, Frequency } from '../types';

interface CreateRecurringInput {
  userId: number;
  categoryId: number;
  amount: number;
  type: TransactionType;
  description: string;
  frequency: Frequency;
  startDate: string;
  endDate?: string;
}

export function createRecurring(input: CreateRecurringInput): RecurringTransaction {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO recurring_transactions
      (user_id, category_id, amount, type, description, frequency, start_date, next_due_date, end_date, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  const info = stmt.run(
    input.userId,
    input.categoryId,
    input.amount,
    input.type,
    input.description,
    input.frequency,
    input.startDate,
    input.startDate,
    input.endDate ?? null
  );
  return db.prepare('SELECT * FROM recurring_transactions WHERE id = ?').get(info.lastInsertRowid) as RecurringTransaction;
}

export function listRecurring(userId: number): RecurringTransaction[] {
  const db = getDb();
  return db.prepare('SELECT * FROM recurring_transactions WHERE user_id = ? ORDER BY next_due_date').all(userId) as RecurringTransaction[];
}

/**
 * Returns all active recurring transactions whose next_due_date has
 * arrived (is on or before asOfDate), and which haven't passed their
 * end_date yet.
 */
export function getDueRecurring(asOfDate: string): RecurringTransaction[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM recurring_transactions
    WHERE active = 1
      AND next_due_date <= ?
      AND (end_date IS NULL OR next_due_date <= end_date)
    ORDER BY next_due_date
  `).all(asOfDate) as RecurringTransaction[];
}

export function updateNextDueDate(id: number, nextDueDate: string, active: number): void {
  const db = getDb();
  db.prepare('UPDATE recurring_transactions SET next_due_date = ?, active = ? WHERE id = ?')
    .run(nextDueDate, active, id);
}
