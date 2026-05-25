import express from 'express';
import recipeRoutes  from './routes/recipes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API info
app.get('/', (_req, res) => {
    res.json({
        name:    'Recipe API — Day 106',
        version: '1.0.0',
        endpoints: {
            'GET    /api/recipes':              'List recipes (supports ?q, ?category, ?difficulty, ?ingredient, ?page, ?pageSize)',
            'GET    /api/recipes/categories':   'List all categories',
            'GET    /api/recipes/:id':          'Get recipe by ID (includes ingredients and steps)',
            'POST   /api/recipes':              'Create a new recipe',
            'PATCH  /api/recipes/:id':          'Update a recipe (partial)',
            'DELETE /api/recipes/:id':          'Delete a recipe',
        },
    });
});

app.use('/api/recipes', recipeRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;