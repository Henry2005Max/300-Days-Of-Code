import express, { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import * as chalk from 'chalk';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import cacheRoutes from './routes/cacheRoutes';
import { logRequest } from './utils/logger';
import { getRedisClient } from './cache/redisClient';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Request logger - logs method, path, status, and response time
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    logRequest(req.method, req.originalUrl, res.statusCode, Date.now() - start);
  });
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Redis-Cached Product Catalog API',
    endpoints: [
      'GET /api/categories',
      'GET /api/categories/:id',
      'GET /api/categories/:id/products',
      'GET /api/products',
      'GET /api/products/search?q=',
      'GET /api/products/:id',
      'POST /api/products',
      'PUT /api/products/:id',
      'DELETE /api/products/:id',
      'GET /api/cache/stats',
      'DELETE /api/cache',
    ],
  });
});

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cache', cacheRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(chalk.red(err.stack || err.message));
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, async () => {
  console.log(chalk.bold(`\nServer running at http://localhost:${PORT}`));
  // Attempt the Redis connection at startup so the connect/fallback
  // log appears immediately instead of on the first request.
  await getRedisClient();
});
