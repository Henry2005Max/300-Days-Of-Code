import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
    console.log(`\n[Recipe API] Server running on http://localhost:${PORT}`);
    console.log(`[Recipe API] API info: http://localhost:${PORT}/`);
    console.log(`[Recipe API] Recipes:  http://localhost:${PORT}/api/recipes`);
    console.log(`[Recipe API] Press Ctrl+C to stop.\n`);
});