import { getDb } from '../db/connection';
import { Category, TransactionType } from '../types';

export function createCategory(userId: number, name: string, type: TransactionType): Category {
  const db = getDb();
  const stmt = db.prepare('INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)');
  const info = stmt.run(userId, name, type);
  return getCategoryById(info.lastInsertRowid as number)!;
}

export function getCategoryById(id: number): Category | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | undefined;
}

export function listCategories(userId: number): Category[] {
  const db = getDb();
  return db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY type, name').all(userId) as Category[];
}
