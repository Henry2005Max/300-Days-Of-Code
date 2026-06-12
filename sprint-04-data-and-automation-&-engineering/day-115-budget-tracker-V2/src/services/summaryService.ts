import { getDb } from '../db/connection';
import { CategorySummary, MonthlySummary } from '../types';
import { getUserById } from '../models/userModel';

/**
 * Builds a monthly summary for a user: total income, total expense,
 * net balance, and a category-by-category breakdown for that month.
 * month must be in 'YYYY-MM' format.
 */
export function getMonthlySummary(userId: number, month: string): MonthlySummary {
  const db = getDb();

  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
    FROM transactions
    WHERE user_id = ? AND strftime('%Y-%m', date) = ?
  `).get(userId, month) as { total_income: number; total_expense: number };

  const categories = db.prepare(`
    SELECT
      c.name AS category_name,
      t.type AS type,
      SUM(t.amount) AS total,
      COUNT(*) AS count
    FROM transactions t
    JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = ? AND strftime('%Y-%m', t.date) = ?
    GROUP BY c.name, t.type
    ORDER BY total DESC
  `).all(userId, month) as CategorySummary[];

  const user = getUserById(userId);

  return {
    user: user?.name ?? `User ${userId}`,
    month,
    total_income: totals.total_income,
    total_expense: totals.total_expense,
    balance: totals.total_income - totals.total_expense,
    categories,
  };
}
