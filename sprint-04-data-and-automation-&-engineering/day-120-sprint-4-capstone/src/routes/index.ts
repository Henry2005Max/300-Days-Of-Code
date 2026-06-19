import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { cacheMiddleware, invalidatePattern } from '../cache/middleware';
import { getRedis } from '../cache/redis';
import {
  getRevenueWindows,
  getCategorySummary,
  getCustomerLTV,
  getTopProducts,
  getDashboardReport,
} from '../analytics/queries';
import { searchProducts } from '../search/engine';
import { buildCsv } from '../exporters/csvExporter';
import { buildExcel } from '../exporters/excelExporter';
import { buildPdf } from '../exporters/pdfExporter';
import { FilterOptions, ExportFormat } from '../types';

const router = Router();

const filterSchema = z.object({
  from:     z.string().optional(),
  to:       z.string().optional(),
  category: z.string().optional(),
  city:     z.string().optional(),
  limit:    z.coerce.number().int().min(1).max(500).optional(),
});

function parseOpts(query: unknown): FilterOptions {
  const p = filterSchema.safeParse(query);
  if (!p.success) throw new Error(JSON.stringify(p.error.flatten()));
  return p.data;
}

// ── Analytics ─────────────────────────────────────────────────────────────

router.get('/analytics/revenue', cacheMiddleware(120), async (req, res: Response) => {
  try { res.json(await getRevenueWindows(parseOpts(req.query))); }
  catch (e) { res.status(400).json({ error: (e as Error).message }); }
});

router.get('/analytics/categories', cacheMiddleware(120), async (req, res: Response) => {
  try { res.json(await getCategorySummary(parseOpts(req.query))); }
  catch (e) { res.status(400).json({ error: (e as Error).message }); }
});

router.get('/analytics/customers', cacheMiddleware(120), async (req, res: Response) => {
  try { res.json(await getCustomerLTV(parseOpts(req.query))); }
  catch (e) { res.status(400).json({ error: (e as Error).message }); }
});

router.get('/analytics/products', cacheMiddleware(120), async (req, res: Response) => {
  try { res.json(await getTopProducts(parseOpts(req.query))); }
  catch (e) { res.status(400).json({ error: (e as Error).message }); }
});

// ── Search ────────────────────────────────────────────────────────────────

router.get('/search', cacheMiddleware(60), async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();
  if (!q) { res.status(400).json({ error: 'Query param "q" required' }); return; }
  try { res.json(await searchProducts(q, Number(req.query.limit) || 10)); }
  catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Export ────────────────────────────────────────────────────────────────

router.get('/export/preview', cacheMiddleware(120), async (req, res: Response) => {
  try { res.json(await getDashboardReport(parseOpts(req.query))); }
  catch (e) { res.status(400).json({ error: (e as Error).message }); }
});

router.get('/export/:format', async (req: Request, res: Response) => {
  const fmt = req.params.format as ExportFormat;
  if (!['csv', 'excel', 'pdf'].includes(fmt)) {
    res.status(404).json({ error: 'Use: csv, excel, or pdf' }); return;
  }
  try {
    const report = await getDashboardReport(parseOpts(req.query));
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (fmt === 'csv') {
      res.set('Content-Type', 'text/csv')
         .set('Content-Disposition', `attachment; filename="dashboard-${ts}.csv"`)
         .send(buildCsv(report));
      return;
    }
    if (fmt === 'excel') {
      const buf = await buildExcel(report);
      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
         .set('Content-Disposition', `attachment; filename="dashboard-${ts}.xlsx"`)
         .send(buf);
      return;
    }
    const buf = await buildPdf(report);
    res.set('Content-Type', 'application/pdf')
       .set('Content-Disposition', `attachment; filename="dashboard-${ts}.pdf"`)
       .send(buf);
  } catch (e) { res.status(500).json({ error: (e as Error).message }); }
});

// ── Cache admin ───────────────────────────────────────────────────────────

router.get('/cache/stats', async (req, res: Response) => {
  const r = await getRedis();
  if (!r) { res.json({ status: 'Redis unavailable' }); return; }
  const [hits, misses, sets] = await Promise.all([
    r.get('cap:stats:hits'), r.get('cap:stats:misses'), r.get('cap:stats:sets'),
  ]);
  const h = Number(hits) || 0, m = Number(misses) || 0;
  res.json({ hits: h, misses: m, sets: Number(sets) || 0, hitRate: (h + m === 0 ? '0.00' : ((h / (h + m)) * 100).toFixed(2)) + '%' });
});

router.delete('/cache', async (req, res: Response) => {
  const deleted = await invalidatePattern('cap:*');
  res.json({ message: 'Cache cleared', keysDeleted: deleted });
});

export default router;
