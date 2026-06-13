import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { cacheMiddleware } from '../cache/cacheMiddleware';
import { invalidateCache } from '../cache/invalidate';
import {
  listProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../models/productModel';
import { getCategoryById } from '../models/categoryModel';

const router = Router();

const createProductSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().default(''),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative().default(0),
});

const updateProductSchema = createProductSchema.partial();

/**
 * Invalidates every cached response that could be affected by a
 * product write: the product list/search variants, individual product
 * detail pages, and category list/detail/products endpoints (whose
 * product_count or product list may have changed).
 */
async function invalidateProductCaches(): Promise<void> {
  await invalidateCache('cache:GET:/api/products*');
  await invalidateCache('cache:GET:/api/categories*');
}

// GET /api/products/search?q=... - must be registered before /:id
router.get('/search', cacheMiddleware(60), async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();
  if (!q) {
    res.status(400).json({ error: 'Query parameter "q" is required' });
    return;
  }

  const results = await searchProducts(q);
  res.json({ query: q, count: results.length, results });
});

// GET /api/products?category=&page=&limit=
router.get('/', cacheMiddleware(120), async (req: Request, res: Response) => {
  const categoryId = req.query.category ? Number(req.query.category) : undefined;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  if (categoryId !== undefined && !getCategoryById(categoryId)) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  const result = await listProducts({ categoryId, page, limit });
  res.json(result);
});

// GET /api/products/:id
router.get('/:id', cacheMiddleware(600), async (req: Request, res: Response) => {
  const product = await getProductById(Number(req.params.id));
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
});

// POST /api/products
router.post('/', async (req: Request, res: Response) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid product data', details: parsed.error.flatten() });
    return;
  }

  if (!getCategoryById(parsed.data.categoryId)) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  const product = createProduct({
    categoryId: parsed.data.categoryId as number,
    name: parsed.data.name as string,
    description: parsed.data.description ?? '',
    price: parsed.data.price as number,
    stock: parsed.data.stock ?? 0,
  });
  await invalidateProductCaches();

  res.status(201).json(product);
});

// PUT /api/products/:id
router.put('/:id', async (req: Request, res: Response) => {
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid product data', details: parsed.error.flatten() });
    return;
  }

  if (parsed.data.categoryId !== undefined && !getCategoryById(parsed.data.categoryId)) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  const product = updateProduct(Number(req.params.id), parsed.data);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  await invalidateProductCaches();
  res.json(product);
});

// DELETE /api/products/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const deleted = deleteProduct(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  await invalidateProductCaches();
  res.status(204).send();
});

export default router;
