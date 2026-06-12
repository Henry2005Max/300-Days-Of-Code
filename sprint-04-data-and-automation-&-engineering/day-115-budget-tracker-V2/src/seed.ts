import { createUser, getUserByEmail } from './models/userModel';
import { createCategory, listCategories } from './models/categoryModel';
import { createTransaction } from './models/transactionModel';
import { createRecurring } from './models/recurringModel';
import { Category } from './types';

function ensureCategories(userId: number): Category[] {
  const existing = listCategories(userId);
  if (existing.length > 0) return existing;

  return [
    createCategory(userId, 'Salary', 'income'),
    createCategory(userId, 'Freelance', 'income'),
    createCategory(userId, 'Rent', 'expense'),
    createCategory(userId, 'Transport', 'expense'),
    createCategory(userId, 'Feeding', 'expense'),
    createCategory(userId, 'Data & Airtime', 'expense'),
  ];
}

function findCategory(categories: Category[], name: string): Category {
  const found = categories.find((c) => c.name === name);
  if (!found) throw new Error(`Category "${name}" not found - seed data is out of sync.`);
  return found;
}

/**
 * Populates the database with two demo users (Chidinma and Tunde), their
 * categories, a few historical transactions, and a couple of recurring
 * transactions, for testing the CLI without entering data by hand.
 * Safe to run multiple times - skips users/categories that already exist.
 */
export function seedDemoData(): void {
  let chidinma = getUserByEmail('chidinma.okafor@example.com');
  if (!chidinma) {
    chidinma = createUser('Chidinma Okafor', 'chidinma.okafor@example.com');
  }

  let tunde = getUserByEmail('tunde.balogun@example.com');
  if (!tunde) {
    tunde = createUser('Tunde Balogun', 'tunde.balogun@example.com');
  }

  const chiCats = ensureCategories(chidinma.id);
  const tundeCats = ensureCategories(tunde.id);

  const salary = findCategory(chiCats, 'Salary');
  const freelance = findCategory(chiCats, 'Freelance');
  const rent = findCategory(chiCats, 'Rent');
  const transport = findCategory(chiCats, 'Transport');
  const feeding = findCategory(chiCats, 'Feeding');
  const data = findCategory(chiCats, 'Data & Airtime');

  createTransaction({ userId: chidinma.id, categoryId: salary.id, amount: 350000, type: 'income', description: 'May salary', date: '2025-05-01' });
  createTransaction({ userId: chidinma.id, categoryId: freelance.id, amount: 75000, type: 'income', description: 'Logo design for Solyem Clothier', date: '2025-05-05' });
  createTransaction({ userId: chidinma.id, categoryId: rent.id, amount: 120000, type: 'expense', description: 'May rent contribution', date: '2025-05-02' });
  createTransaction({ userId: chidinma.id, categoryId: transport.id, amount: 8500, type: 'expense', description: 'Bolt rides for the week', date: '2025-05-06' });
  createTransaction({ userId: chidinma.id, categoryId: feeding.id, amount: 25000, type: 'expense', description: 'Shoprite grocery run', date: '2025-05-07' });
  createTransaction({ userId: chidinma.id, categoryId: data.id, amount: 5000, type: 'expense', description: 'MTN data bundle', date: '2025-05-08' });

  createRecurring({
    userId: chidinma.id,
    categoryId: salary.id,
    amount: 350000,
    type: 'income',
    description: 'Monthly salary',
    frequency: 'monthly',
    startDate: '2025-06-01',
  });

  createRecurring({
    userId: chidinma.id,
    categoryId: data.id,
    amount: 5000,
    type: 'expense',
    description: 'Weekly data bundle',
    frequency: 'weekly',
    startDate: '2025-05-15',
    endDate: '2025-12-31',
  });

  const tSalary = findCategory(tundeCats, 'Salary');
  const tRent = findCategory(tundeCats, 'Rent');
  const tFeeding = findCategory(tundeCats, 'Feeding');

  createTransaction({ userId: tunde.id, categoryId: tSalary.id, amount: 280000, type: 'income', description: 'May salary', date: '2025-05-01' });
  createTransaction({ userId: tunde.id, categoryId: tRent.id, amount: 100000, type: 'expense', description: 'May rent', date: '2025-05-02' });
  createTransaction({ userId: tunde.id, categoryId: tFeeding.id, amount: 30000, type: 'expense', description: 'Mile 12 market run', date: '2025-05-03' });

  createRecurring({
    userId: tunde.id,
    categoryId: tSalary.id,
    amount: 280000,
    type: 'income',
    description: 'Monthly salary',
    frequency: 'monthly',
    startDate: '2025-06-01',
  });
}
