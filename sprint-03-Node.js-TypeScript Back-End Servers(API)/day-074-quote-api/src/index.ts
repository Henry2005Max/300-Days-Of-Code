import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { requestLogger } from "./middleware/logger";
import { runMigrations, seedQuotes } from "./db/database";
import quotesRouter from "./routes/quotes";

runMigrations();
seedQuotes();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

app.get("/", (req: Request, res: Response) => {
    res.json({
        api:    process.env.APP_NAME,
        day:    74,
        author: "Henry Ehindero — Lagos, Nigeria 🇳🇬",
        description: "Quote API with FTS5 search, pagination, favourites, and view counts",
        categories: ["nigerian-proverbs", "tech", "motivation", "philosophy", "leadership"],
        endpoints: [
            { method: "GET",  path: "/quotes",                  description: "All quotes. ?page=1&limit=10&category=" },
            { method: "GET",  path: "/quotes/random",           description: "One random quote. ?category=" },
            { method: "GET",  path: "/quotes/search?q=wisdom",  description: "FTS5 full-text search" },
            { method: "GET",  path: "/quotes/categories",       description: "All categories with counts" },
            { method: "GET",  path: "/quotes/top",              description: "Most viewed quotes" },
            { method: "GET",  path: "/quotes/favourites/mine",  description: "Your favourites (by IP)" },
            { method: "GET",  path: "/quotes/:id",              description: "Single quote — increments view count" },
            { method: "POST", path: "/quotes/:id/favourite",    description: "Toggle favourite (by IP)" },
        ],
    });
});

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", uptime: `${Math.floor(process.uptime())}s`, timestamp: new Date().toISOString() });
});

app.use("/quotes", quotesRouter);

app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`[ERROR] ${err.message}`);
    res.status(500).json({ success: false, error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`\n┌──────────────────────────────────────────┐`);
    console.log(`│  ${process.env.APP_NAME} — Day 74              │`);
    console.log(`│  http://localhost:${PORT}                    │`);
    console.log(`│  Day 74 · Sprint 3 · Lagos, Nigeria    │`);
    console.log(`└──────────────────────────────────────────┘\n`);
    console.log(`  GET  http://localhost:${PORT}/quotes`);
    console.log(`  GET  http://localhost:${PORT}/quotes/random`);
    console.log(`  GET  http://localhost:${PORT}/quotes/search?q=wisdom`);
    console.log(`  GET  http://localhost:${PORT}/quotes/categories\n`);
});