import express, { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import * as chalk from 'chalk';
import { runMigrations } from './db/migrations';
import searchRoutes from './routes/searchRoutes';
import debugRoutes from './routes/debugRoutes';
import { logRequest } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => logRequest(req.method, req.originalUrl, res.statusCode, Date.now() - start));
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'PostgreSQL Full-Text Search API',
    endpoints: [
      'GET /api/search?q=...&category=...&author=...&limit=...&offset=...',
      'GET /api/search/suggest?prefix=...',
      'GET /api/search/categories',
      'GET /api/search/authors',
      'GET /api/search/articles/:id',
      'GET /api/debug/vector/:id',
      'GET /api/debug/explain?q=...',
      'GET /api/debug/corpus?n=20',
    ],
  });
});

app.use('/api/search', searchRoutes);
app.use('/api/debug', debugRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(chalk.red(err.stack || err.message));
  res.status(500).json({ error: 'Internal server error' });
});

(async () => {
  await runMigrations();
  console.log(chalk.green('[db] Migrations complete.'));

  app.listen(PORT, () => {
    console.log(chalk.bold(`\nServer running at http://localhost:${PORT}`));
  });
})();
