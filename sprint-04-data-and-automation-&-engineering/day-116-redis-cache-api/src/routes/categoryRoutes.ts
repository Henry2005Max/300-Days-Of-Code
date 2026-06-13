import { Router, Request, Response } from 'express';
import { cacheMiddleware } from '../cache/cacheMiddleware';
import { listCategories, getCategoryById } from '../models/categoryModel';
import { listProductsByCategory } from '../models/productModel';

const router = Router();

// GET /api/categories - list all categories with product counts
router.get('/', cacheMiddleware(300), (req: Request, res: Response) => {
  res.json(listCategories());
});

// GET /api/categories/:id - single category with product count
router.get('/:id', cacheMiddleware(300), (req: Request, res: Response) => {
  const category = getCategoryById(Number(req.params.id));
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json(category);
});

// GET /api/categories/:id/products - all products in a category
router.get('/:id/products', cacheMiddleware(120), async (req: Request, res: Response) => {
  const category = getCategoryById(Number(req.params.id));
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  const products = await listProductsByCategory(category.id);
  res.json({ category: category.name, products });
});

export default router;
