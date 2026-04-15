import { Router, Request, Response } from "express";
import { fetchWeather, fetchCountry, fetchExchangeRates, NIGERIAN_CITIES } from "../services/proxyClients";
import { cacheGet, cacheSet, cacheStats, cacheClear } from "../services/cache";
import { WeatherData, CountryData, ExchangeData, ProxyResponse } from "../types";

const router = Router();

const WEATHER_TTL  = Number(process.env.WEATHER_CACHE_TTL_MS)  || 600_000;   /* 10 min */
const COUNTRY_TTL  = Number(process.env.COUNTRY_CACHE_TTL_MS)  || 86_400_000; /* 24 hr */
const EXCHANGE_TTL = Number(process.env.EXCHANGE_CACHE_TTL_MS) || 3_600_000;  /* 1 hr  */

/* ── Helper — build ProxyResponse ── */
function buildResponse<T>(
  source: string,
  data: T,
  cached: boolean,
  cacheEntry?: { cachedAt: number; expiresAt: number } | null
): ProxyResponse<T> {
  return {
    success: true,
    source,
    cached,
    ...(cacheEntry && {
      cachedAt:         new Date(cacheEntry.cachedAt).toISOString(),
      expiresInSeconds: Math.max(0, Math.round((cacheEntry.expiresAt - Date.now()) / 1000)),
    }),
    data,
  };
}

/* ── GET /proxy/weather/:city ────────────────────────────────────────
   Look up weather by Nigerian city name OR by ?lat=&lon= query params.
   Cached for 10 minutes — weather changes but not that fast.
────────────────────────────────────────────────────────────────────── */
router.get("/weather/:city", async (req: Request, res: Response) => {
  const cityKey = req.params.city.toLowerCase().replace(/\s+/g, "");
  const city = NIGERIAN_CITIES[cityKey];

  if (!city) {
    res.status(404).json({
      success: false,
      error: `City "${req.params.city}" not found`,
      availableCities: Object.keys(NIGERIAN_CITIES),
    });
    return;
  }

  const cacheKey = `weather:${cityKey}`;
  const cached = cacheGet<WeatherData>(cacheKey);

  if (cached) {
    console.log(`[PROXY] Weather cache HIT for ${city.name}`);
    res.json(buildResponse("open-meteo.com", cached.data, true, cached));
    return;
  }

  try {
    console.log(`[PROXY] Fetching weather for ${city.name} from Open-Meteo...`);
    const data = await fetchWeather(city.lat, city.lon);
    cacheSet(cacheKey, data, WEATHER_TTL);
    const entry = cacheGet<WeatherData>(cacheKey);
    res.json(buildResponse("open-meteo.com", data, false, entry));
  } catch (err: any) {
    console.error("[PROXY] Weather error:", err.message);
    res.status(502).json({ success: false, error: `Upstream error: ${err.message}` });
  }
});

/* ── GET /proxy/weather ── list available cities ── */
router.get("/weather", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Use /proxy/weather/:city",
    cities: Object.entries(NIGERIAN_CITIES).map(([key, val]) => ({
      key,
      name: val.name,
      endpoint: `/proxy/weather/${key}`,
    })),
  });
});

/* ── GET /proxy/country/:name ────────────────────────────────────────
   Country data via REST Countries API.
   Cached for 24 hours — country data almost never changes.
────────────────────────────────────────────────────────────────────── */
router.get("/country/:name", async (req: Request, res: Response) => {
  const name = req.params.name.trim();
  const cacheKey = `country:${name.toLowerCase()}`;
  const cached = cacheGet<CountryData[]>(cacheKey);

  if (cached) {
    console.log(`[PROXY] Country cache HIT for "${name}"`);
    res.json(buildResponse("restcountries.com", cached.data, true, cached));
    return;
  }

  try {
    console.log(`[PROXY] Fetching country data for "${name}"...`);
    const data = await fetchCountry(name);
    cacheSet(cacheKey, data, COUNTRY_TTL);
    const entry = cacheGet<CountryData[]>(cacheKey);
    res.json(buildResponse("restcountries.com", data, false, entry));
  } catch (err: any) {
    if (err.response?.status === 404) {
      res.status(404).json({ success: false, error: `Country "${name}" not found` });
      return;
    }
    console.error("[PROXY] Country error:", err.message);
    res.status(502).json({ success: false, error: `Upstream error: ${err.message}` });
  }
});

/* ── GET /proxy/exchange/:base ───────────────────────────────────────
   Exchange rates with NGN always included.
   Cached for 1 hour — rates update throughout the day.
────────────────────────────────────────────────────────────────────── */
router.get("/exchange/:base", async (req: Request, res: Response) => {
  const base = req.params.base.toUpperCase();

  /* Validate currency code — must be 3 uppercase letters */
  if (!/^[A-Z]{3}$/.test(base)) {
    res.status(400).json({ success: false, error: "Currency code must be 3 letters e.g. USD, NGN, EUR" });
    return;
  }

  const cacheKey = `exchange:${base}`;
  const cached = cacheGet<ExchangeData>(cacheKey);

  if (cached) {
    console.log(`[PROXY] Exchange cache HIT for ${base}`);
    res.json(buildResponse("open.er-api.com", cached.data, true, cached));
    return;
  }

  try {
    console.log(`[PROXY] Fetching exchange rates for ${base}...`);
    const data = await fetchExchangeRates(base);
    cacheSet(cacheKey, data, EXCHANGE_TTL);
    const entry = cacheGet<ExchangeData>(cacheKey);
    res.json(buildResponse("open.er-api.com", data, false, entry));
  } catch (err: any) {
    console.error("[PROXY] Exchange error:", err.message);
    res.status(502).json({ success: false, error: `Upstream error: ${err.message}` });
  }
});

/* Default exchange — USD base */
router.get("/exchange", (req: Request, res: Response) => {
  res.redirect("/proxy/exchange/USD");
});

/* ── GET /proxy/cache — view cache stats ── */
router.get("/cache", (req: Request, res: Response) => {
  res.json({ success: true, data: cacheStats() });
});

/* ── DELETE /proxy/cache/:key — clear a specific cache entry ── */
router.delete("/cache", (req: Request, res: Response) => {
  cacheClear();
  res.json({ success: true, data: { message: "Cache cleared" } });
});

export default router;