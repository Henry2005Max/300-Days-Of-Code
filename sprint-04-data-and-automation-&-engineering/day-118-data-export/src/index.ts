import express, { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import * as chalk from 'chalk';
import { runMigrations } from './db/migrations';
import exportRoutes from './routes/exportRoutes';
import { logRequest } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => logRequest(req.method, req.originalUrl, res.statusCode, Date.now() - start));
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Data Export Pipeline API',
    endpoints: [
      'GET /api/export/preview   — JSON report (supports ?from=&to=&region=&category=)',
      'GET /api/export/csv       — Download CSV',
      'GET /api/export/excel     — Download Excel (.xlsx)',
      'GET /api/export/pdf       — Download PDF',
    ],
  });
});

app.use('/api/export', exportRoutes);

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
