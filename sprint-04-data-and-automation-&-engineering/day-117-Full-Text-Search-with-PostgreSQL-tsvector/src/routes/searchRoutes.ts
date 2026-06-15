import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { searchArticles, suggestTerms, getArticleById, listCategories, listAuthors } from '../search/engine';

const router = Router();

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Query parameter "q" is required'),
  category: z.string().optional(),
  author: z.string().optional(),
  language: z.string().default('english'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

// GET /api/search?q=...&category=...&author=...&limit=...&offset=...
router.get('/', async (req: Request, res: Response) => {
  const parsed = searchQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.flatten() });
    return;
  }

  const result = await searchArticles({
    query: parsed.data.q,
    category: parsed.data.category,
    author: parsed.data.author,
    language: parsed.data.language,
    limit: parsed.data.limit,
    offset: parsed.data.offset,
  });

  res.json(result);
});

// GET /api/search/suggest?prefix=...
router.get('/suggest', async (req: Request, res: Response) => {
  const prefix = String(req.query.prefix || '').trim();
  if (!prefix) {
    res.status(400).json({ error: 'Query parameter "prefix" is required' });
    return;
  }

  const suggestions = await suggestTerms(prefix, 8);
  res.json({ prefix, suggestions });
});

// GET /api/search/categories
router.get('/categories', async (req: Request, res: Response) => {
  res.json(await listCategories());
});

// GET /api/search/authors
router.get('/authors', async (req: Request, res: Response) => {
  res.json(await listAuthors());
});

// GET /api/articles/:id
router.get('/articles/:id', async (req: Request, res: Response) => {
  const article = await getArticleById(Number(req.params.id));
  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  res.json(article);
});

export default router;
