import express, { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import * as chalk from 'chalk';
import { runMigrations } from './db/migrations';
import analyticsRoutes from './routes/analyticsRoutes';
import { logRequest } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => logRequest(req.method, req.originalUrl, res.statusCode, Date.now() - start));
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Time-Series Analytics API — PostgreSQL Window Functions',
    filters: '?sensorId=&city=&metricType=&from=&to=&limit=',
    endpoints: [
      'GET /api/metrics                   — raw readings',
      'GET /api/analytics/sensors         — sensor list',
      'GET /api/analytics/moving-averages — 7-day & 30-day MA, LAG, % change',
      'GET /api/analytics/running-totals  — cumulative total + daily rank',
      'GET /api/analytics/period-comparison — month-over-month with RANK',
      'GET /api/analytics/percentile-bands — PERCENT_RANK + NTILE(4) bands',
      'GET /api/analytics/ohlc            — daily open/high/low/close',
      'GET /api/analytics/gaps?minGapHours=2 — gap detection via LEAD',
    ],
  });
});

app.use('/api', analyticsRoutes);

app.use((req: Request, res: Response) => res.status(404).json({ error: 'Not found' }));

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
