import { Router, Request, Response } from "express";
import { scrapeHackerNews, scrapeQuotes } from "../services/scrapers";
import { isAllowedByRobots } from "../services/fetcher";
import { cacheGet, cacheSet, cacheStats, cacheClear } from "../services/cache";
import { HackerNewsItem, Quote, ScrapeResult } from "../types";

const router = Router();

/* ── GET /scraper/hackernews ─────────────────────────────────────────
   Scrapes the Hacker News front page.
   Checks cache first — returns cached data if still fresh.
   Checks robots.txt before scraping.
────────────────────────────────────────────────────────────────────── */
router.get("/hackernews", async (req: Request, res: Response) => {
  const cacheKey = "hackernews:frontpage";

  /* Check cache first */
  const cached = cacheGet<HackerNewsItem[]>(cacheKey);
  if (cached) {
    console.log("[SCRAPER] Returning cached Hacker News results");
    const result: ScrapeResult<HackerNewsItem[]> = {
      url: "https://news.ycombinator.com",
      scrapedAt: new Date().toISOString(),
      fromCache: true,
      data: cached,
    };
    res.status(200).json({ success: true, data: result, meta: { count: cached.length } });
    return;
  }

  /* Check robots.txt */
  const allowed = await isAllowedByRobots("https://news.ycombinator.com");
  if (!allowed) {
    res.status(403).json({ success: false, error: "robots.txt disallows scraping this URL" });
    return;
  }

  try {
    console.log("[SCRAPER] Fetching Hacker News front page...");
    const items = await scrapeHackerNews();

    /* Store in cache */
    cacheSet(cacheKey, items);

    const result: ScrapeResult<HackerNewsItem[]> = {
      url: "https://news.ycombinator.com",
      scrapedAt: new Date().toISOString(),
      fromCache: false,
      data: items,
    };

    res.status(200).json({ success: true, data: result, meta: { count: items.length } });
  } catch (err: any) {
    console.error("[SCRAPER] Hacker News error:", err.message);
    res.status(500).json({ success: false, error: `Scrape failed: ${err.message}` });
  }
});

/* ── GET /scraper/quotes?page=1 ── */
router.get("/quotes", async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const cacheKey = `quotes:page:${page}`;

  const cached = cacheGet<{ quotes: Quote[]; hasNext: boolean }>(cacheKey);
  if (cached) {
    console.log(`[SCRAPER] Returning cached quotes page ${page}`);
    res.status(200).json({
      success: true,
      data: { url: `http://quotes.toscrape.com/page/${page}/`, scrapedAt: new Date().toISOString(), fromCache: true, data: cached },
      meta: { page, count: cached.quotes.length, hasNext: cached.hasNext },
    });
    return;
  }

  const allowed = await isAllowedByRobots(`http://quotes.toscrape.com/page/${page}/`);
  if (!allowed) {
    res.status(403).json({ success: false, error: "robots.txt disallows scraping this URL" });
    return;
  }

  try {
    console.log(`[SCRAPER] Fetching quotes page ${page}...`);
    const result = await scrapeQuotes(page);
    cacheSet(cacheKey, result);

    res.status(200).json({
      success: true,
      data: {
        url: `http://quotes.toscrape.com/page/${page}/`,
        scrapedAt: new Date().toISOString(),
        fromCache: false,
        data: result,
      },
      meta: { page, count: result.quotes.length, hasNext: result.hasNext },
    });
  } catch (err: any) {
    console.error("[SCRAPER] Quotes error:", err.message);
    res.status(500).json({ success: false, error: `Scrape failed: ${err.message}` });
  }
});

/* ── GET /scraper/robots?url=https://example.com ─────────────────────
   Utility route — check if a URL is allowed by robots.txt
────────────────────────────────────────────────────────────────────── */
router.get("/robots", async (req: Request, res: Response) => {
  const url = req.query.url as string;

  if (!url) {
    res.status(400).json({ success: false, error: "url query parameter required" });
    return;
  }

  try {
    const allowed = await isAllowedByRobots(url);
    res.status(200).json({ success: true, data: { url, allowed, checkedAt: new Date().toISOString() } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: `Invalid URL or robots.txt unreachable: ${err.message}` });
  }
});

/* ── GET /scraper/cache — view cache stats ── */
router.get("/cache", (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: cacheStats() });
});

/* ── DELETE /scraper/cache — clear cache ── */
router.delete("/cache", (req: Request, res: Response) => {
  cacheClear();
  res.status(200).json({ success: true, data: { message: "Cache cleared" } });
});

export default router;