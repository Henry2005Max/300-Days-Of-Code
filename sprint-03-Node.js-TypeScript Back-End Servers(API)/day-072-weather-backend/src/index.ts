import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { requestLogger } from "./middleware/logger";
import { runMigrations, seedLocations } from "./db/database";
import weatherRouter from "./routes/weather";

runMigrations();
seedLocations();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

app.get("/", (req: Request, res: Response) => {
    res.json({
        api:    process.env.APP_NAME,
        day:    72,
        author: "Henry Ehindero — Lagos, Nigeria 🇳🇬",
        description: "Weather backend with SQLite persistence and historical queries",
        features: [
            "10-minute cache — fresh readings served from SQLite, not API",
            "Historical queries — full reading history per city",
            "Fetch statistics — most-queried cities tracked",
            "10 Nigerian cities pre-loaded",
        ],
        endpoints: [
            { method: "GET", path: "/weather/locations",           description: "All available cities" },
            { method: "GET", path: "/weather/stats",               description: "Fetch stats and top cities" },
            { method: "GET", path: "/weather/:slug",               description: "Current weather (e.g. /weather/lagos)" },
            { method: "GET", path: "/weather/:slug/history",       description: "Reading history. ?limit=24" },
        ],
        slugs: ["lagos", "abuja", "kano", "ibadan", "port-harcourt", "enugu", "kaduna", "benin-city", "jos", "warri"],
    });
});

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", uptime: `${Math.floor(process.uptime())}s`, timestamp: new Date().toISOString() });
});

app.use("/weather", weatherRouter);

app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`[ERROR] ${err.message}`);
    res.status(500).json({ success: false, error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`\n┌──────────────────────────────────────────┐`);
    console.log(`│  ${process.env.APP_NAME} — Day 72          │`);
    console.log(`│  http://localhost:${PORT}                    │`);
    console.log(`│  Day 72 · Sprint 3 · Lagos, Nigeria    │`);
    console.log(`└──────────────────────────────────────────┘\n`);
    console.log(`  GET http://localhost:${PORT}/weather/lagos`);
    console.log(`  GET http://localhost:${PORT}/weather/abuja`);
    console.log(`  GET http://localhost:${PORT}/weather/kano`);
    console.log(`  GET http://localhost:${PORT}/weather/lagos/history`);
    console.log(`  GET http://localhost:${PORT}/weather/stats\n`);
});