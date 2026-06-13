import { getDb } from '../db/connection';
import { CategoryWithCount } from '../types';

export function listCategories(): CategoryWithCount[] {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name
  `).all() as CategoryWithCount[];
}

export function getCategoryById(id: number): CategoryWithCount | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(id) as CategoryWithCount | undefined;
}
