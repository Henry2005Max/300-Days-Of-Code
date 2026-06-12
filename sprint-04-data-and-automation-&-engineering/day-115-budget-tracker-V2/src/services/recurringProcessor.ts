import { getDueRecurring, updateNextDueDate } from '../models/recurringModel';
import { createTransaction } from '../models/transactionModel';
import { Frequency } from '../types';

function addInterval(dateStr: string, frequency: Frequency): string {
  const date = new Date(`${dateStr}T00:00:00`);

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date.toISOString().split('T')[0];
}

export interface ProcessResult {
  recurringId: number;
  description: string;
  amount: number;
  date: string;
}

/**
 * Finds every recurring transaction due on or before asOfDate, creates
 * a matching transaction for each, and advances next_due_date by one
 * interval. Loops until nothing is due anymore, so a recurring item
 * that's been "due" for several intervals (e.g. user skipped a few
 * weeks) gets backfilled with one transaction per missed interval.
 */
export function processRecurring(asOfDate: string = new Date().toISOString().split('T')[0]): ProcessResult[] {
  const results: ProcessResult[] = [];
  let due = getDueRecurring(asOfDate);

  while (due.length > 0) {
    for (const r of due) {
      createTransaction({
        userId: r.user_id,
        categoryId: r.category_id,
        amount: r.amount,
        type: r.type,
        description: `${r.description} (recurring)`,
        date: r.next_due_date,
      });

      results.push({
        recurringId: r.id,
        description: r.description,
        amount: r.amount,
        date: r.next_due_date,
      });

      const nextDate = addInterval(r.next_due_date, r.frequency);
      const stillActive = !r.end_date || nextDate <= r.end_date;
      updateNextDueDate(r.id, nextDate, stillActive ? 1 : 0);
    }

    due = getDueRecurring(asOfDate);
  }

  return results;
}
