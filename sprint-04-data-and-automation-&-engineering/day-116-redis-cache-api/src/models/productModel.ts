import { getDb } from '../db/connection';
import {
  Product,
  ProductWithCategory,
  PaginatedProducts,
  CreateProductInput,
  UpdateProductInput,
} from '../types';

const SIMULATED_QUERY_DELAY_MS = Number(process.env.SIMULATED_QUERY_DELAY_MS || 300);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ListOptions {
  categoryId?: number;
  page?: number;
  limit?: number;
}

/**
 * Returns a paginated, optionally category-filtered product list.
 * Includes an artificial delay to stand in for an "expensive" query -
 * this is what makes the cache's speedup visible when testing.
 */
export async function listProducts(options: ListOptions = {}): Promise<PaginatedProducts> {
  await delay(SIMULATED_QUERY_DELAY_MS);

  const db = getDb();
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 10;
  const offset = (page - 1) * limit;

  let whereClause = '';
  const params: (string | number)[] = [];

  if (options.categoryId) {
    whereClause = 'WHERE p.category_id = ?';
    params.push(options.categoryId);
  }

  const total = (
    db.prepare(`SELECT COUNT(*) AS count FROM products p ${whereClause}`).get(...params) as { count: number }
  ).count;

  const products = db.prepare(`
    SELECT p.*, c.name AS category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    ${whereClause}
    ORDER BY p.id
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as ProductWithCategory[];

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getProductById(id: number): Promise<ProductWithCategory | undefined> {
  await delay(SIMULATED_QUERY_DELAY_MS);

  const db = getDb();
  return db.prepare(`
    SELECT p.*, c.name AS category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.id = ?
  `).get(id) as ProductWithCategory | undefined;
}

export async function listProductsByCategory(categoryId: number): Promise<ProductWithCategory[]> {
  await delay(SIMULATED_QUERY_DELAY_MS);

  const db = getDb();
  return db.prepare(`
    SELECT p.*, c.name AS category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.category_id = ?
    ORDER BY p.id
  `).all(categoryId) as ProductWithCategory[];
}

export async function searchProducts(query: string): Promise<ProductWithCategory[]> {
  await delay(SIMULATED_QUERY_DELAY_MS);

  const db = getDb();
  const term = `%${query}%`;
  return db.prepare(`
    SELECT p.*, c.name AS category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.name LIKE ? OR p.description LIKE ?
    ORDER BY p.id
  `).all(term, term) as ProductWithCategory[];
}

export function createProduct(input: CreateProductInput): Product {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO products (category_id, name, description, price, stock)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(input.categoryId, input.name, input.description, input.price, input.stock);
  return db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid) as Product;
}

export function updateProduct(id: number, input: UpdateProductInput): Product | undefined {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined;
  if (!existing) return undefined;

  const merged = {
    category_id: input.categoryId ?? existing.category_id,
    name: input.name ?? existing.name,
    description: input.description ?? existing.description,
    price: input.price ?? existing.price,
    stock: input.stock ?? existing.stock,
  };

  db.prepare(`
    UPDATE products
    SET category_id = ?, name = ?, description = ?, price = ?, stock = ?
    WHERE id = ?
  `).run(merged.category_id, merged.name, merged.description, merged.price, merged.stock, id);

  return db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product;
}

export function deleteProduct(id: number): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return info.changes > 0;
}
