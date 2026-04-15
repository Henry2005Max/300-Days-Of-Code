import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { requestLogger } from "./middleware/logger";
import proxyRouter from "./routes/proxy";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

app.get("/", (req: Request, res: Response) => {
  res.json({
    api: "APIProxy",
    day: 68,
    author: "Henry Ehindero — Lagos, Nigeria 🇳🇬",
    description: "Proxy server wrapping Open-Meteo, REST Countries, and ExchangeRate APIs",
    benefits: [
      "API keys stay on the server — never exposed to clients",
      "Response caching reduces upstream API calls",
      "Responses transformed to clean minimal shapes",
      "502 Bad Gateway on upstream failures instead of raw errors",
    ],
    endpoints: [
      { method: "GET", path: "/proxy/weather",          description: "List available Nigerian cities" },
      { method: "GET", path: "/proxy/weather/:city",    description: "Weather for a Nigerian city (lagos, abuja, kano...)" },
      { method: "GET", path: "/proxy/country/:name",    description: "Country data by name (nigeria, ghana, kenya...)" },
      { method: "GET", path: "/proxy/exchange/:base",   description: "Exchange rates (USD, NGN, EUR, GBP...)" },
      { method: "GET", path: "/proxy/exchange",         description: "Exchange rates — defaults to USD base" },
      { method: "GET", path: "/proxy/cache",            description: "View cache stats and entries" },
      { method: "DELETE", path: "/proxy/cache",         description: "Clear the cache" },
    ],
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: `${Math.floor(process.uptime())}s`, timestamp: new Date().toISOString() });
});

app.use("/proxy", proxyRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n┌──────────────────────────────────────────┐`);
  console.log(`│  APIProxy — Day 68                       │`);
  console.log(`│  http://localhost:${PORT}                    │`);
  console.log(`│  Day 68 · Sprint 3 · Lagos, Nigeria    │`);
  console.log(`└──────────────────────────────────────────┘\n`);
  console.log(`  GET http://localhost:${PORT}/proxy/weather/lagos`);
  console.log(`  GET http://localhost:${PORT}/proxy/weather/abuja`);
  console.log(`  GET http://localhost:${PORT}/proxy/country/nigeria`);
  console.log(`  GET http://localhost:${PORT}/proxy/exchange/NGN`);
  console.log(`  GET http://localhost:${PORT}/proxy/cache\n`);
});