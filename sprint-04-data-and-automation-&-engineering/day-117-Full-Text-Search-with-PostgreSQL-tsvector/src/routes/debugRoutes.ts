import { Router, Request, Response } from 'express';
import { inspectVector, explainQuery, corpusStats } from '../search/debug';

const router = Router();

// GET /api/debug/vector/:id — show the stored tsvector for an article
router.get('/vector/:id', async (req: Request, res: Response) => {
  const vector = await inspectVector(Number(req.params.id));
  res.json({ id: req.params.id, vector });
});

// GET /api/debug/explain?q=... — show how PG parses a query to tsquery
router.get('/explain', async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();
  if (!q) {
    res.status(400).json({ error: 'Query parameter "q" is required' });
    return;
  }
  const tsquery = await explainQuery(q);
  res.json({ input: q, tsquery });
});

// GET /api/debug/corpus?n=20 — top N most common lexemes across all articles
router.get('/corpus', async (req: Request, res: Response) => {
  const n = Number(req.query.n) || 20;
  const stats = await corpusStats(n);
  res.json(stats);
});

export default router;
