import express, { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import * as chalk from 'chalk';
import { runMigrations } from './db/migrations';
import { getRedis } from './cache/redis';
import routes from './routes/index';
import { logRequest } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4004;

app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => logRequest(req.method, req.originalUrl, res.statusCode, Date.now() - start));
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Sprint 4 Capstone — Nigerian E-Commerce Analytics Platform',
    sprint: 'Sprint 4: Data Engineering & Databases (Days 91–120)',
    techniques: ['PostgreSQL window functions', 'Redis caching', 'FTS tsvector', 'GENERATED columns', 'BRIN index', 'Multi-format export'],
    endpoints: [
      'GET /api/analytics/revenue    — 7-day MA + running total + category rank',
      'GET /api/analytics/categories — MoM comparison via CTE + LAG',
      'GET /api/analytics/customers  — LTV with PERCENT_RANK + NTILE bands',
      'GET /api/analytics/products   — dual RANK() overall and in-category',
      'GET /api/search?q=            — FTS via tsvector + ts_rank_cd',
      'GET /api/export/preview       — full JSON dashboard report',
      'GET /api/export/csv           — CSV download',
      'GET /api/export/excel         — Excel download',
      'GET /api/export/pdf           — PDF download',
      'GET /api/cache/stats          — Redis hit/miss stats',
      'DELETE /api/cache             — flush cache',
    ],
    filters: '?from=YYYY-MM-DD&to=YYYY-MM-DD&category=X&city=X&limit=N',
  });
});

app.use('/api', routes);

app.use((req: Request, res: Response) => res.status(404).json({ error: 'Not found' }));
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(chalk.red(err.stack || err.message));
  res.status(500).json({ error: 'Internal server error' });
});

(async () => {
  await runMigrations();
  console.log(chalk.green('[db] Migrations complete.'));
  await getRedis();
  app.listen(PORT, () => console.log(chalk.bold(`\nServer running at http://localhost:${PORT}`)));
})();
