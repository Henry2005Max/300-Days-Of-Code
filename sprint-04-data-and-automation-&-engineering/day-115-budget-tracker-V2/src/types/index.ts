export type TransactionType = 'income' | 'expense';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  created_at: string;
}

export interface RecurringTransaction {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  type: TransactionType;
  description: string;
  frequency: Frequency;
  start_date: string;
  next_due_date: string;
  end_date: string | null;
  active: number;
}

export interface TransactionWithBalance extends Transaction {
  category_name: string;
  running_balance: number;
}

export interface CategorySummary {
  category_name: string;
  type: TransactionType;
  total: number;
  count: number;
}

export interface MonthlySummary {
  user: string;
  month: string;
  total_income: number;
  total_expense: number;
  balance: number;
  categories: CategorySummary[];
}
