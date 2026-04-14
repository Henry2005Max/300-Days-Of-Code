import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { requestLogger } from "./middleware/logger";
import scraperRouter from "./routes/scraper";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

app.get("/", (req: Request, res: Response) => {
  res.json({
    api: "EthicalScraper",
    day: 67,
    author: "Henry Ehindero — Lagos, Nigeria 🇳🇬",
    description: "Ethical web scraper with robots.txt checking, rate limiting, and caching",
    ethics: [
      "Checks robots.txt before scraping",
      `Rate limits requests (${process.env.REQUEST_DELAY_MS}ms delay per domain)`,
      `Caches results for ${Number(process.env.CACHE_TTL_MS) / 60000} minutes`,
      "Sends descriptive User-Agent header",
      "Only scrapes public, scraper-friendly sites",
    ],
    endpoints: [
      { method: "GET", path: "/scraper/hackernews",        description: "Scrape Hacker News front page (top 30 stories)" },
      { method: "GET", path: "/scraper/quotes?page=1",     description: "Scrape quotes from quotes.toscrape.com" },
      { method: "GET", path: "/scraper/robots?url=<url>",  description: "Check if a URL is allowed by robots.txt" },
      { method: "GET", path: "/scraper/cache",             description: "View cache stats and entries" },
      { method: "DELETE", path: "/scraper/cache",          description: "Clear the cache" },
    ],
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: `${Math.floor(process.uptime())}s`, timestamp: new Date().toISOString() });
});

app.use("/scraper", scraperRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n┌──────────────────────────────────────────┐`);
  console.log(`│  EthicalScraper — Day 67                 │`);
  console.log(`│  http://localhost:${PORT}                    │`);
  console.log(`│  Day 67 · Sprint 3 · Lagos, Nigeria    │`);
  console.log(`└──────────────────────────────────────────┘\n`);
  console.log(`  GET http://localhost:${PORT}/scraper/hackernews`);
  console.log(`  GET http://localhost:${PORT}/scraper/quotes?page=1`);
  console.log(`  GET http://localhost:${PORT}/scraper/robots?url=https://news.ycombinator.com\n`);
});