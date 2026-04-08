/* ── Load environment variables FIRST ───────────────────────────────
   dotenv reads your .env file and puts the values into process.env
   This MUST be the first import — other files might read process.env
   at import time, so the values need to be loaded before anything else.
────────────────────────────────────────────────────────────────────── */
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { requestLogger } from "./middleware/logger";
import helloRouter from "./routes/hello";

/* ── Create the Express app ──────────────────────────────────────────
   express() returns an app object.
   Everything you do — adding middleware, defining routes, starting the
   server — happens through this object.
────────────────────────────────────────────────────────────────────── */
const app = express();
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "Day61Server";

/* ── Register global middleware ──────────────────────────────────────
   app.use() attaches middleware that runs on EVERY request.
   Order matters — middleware runs in the order you add it.

   1. express.json()   — parses incoming JSON bodies into req.body
   2. requestLogger    — logs every request to the terminal
────────────────────────────────────────────────────────────────────── */
app.use(express.json());
app.use(requestLogger);

/* ── Root route ──────────────────────────────────────────────────────
   GET / → returns info about this API
   This is what you'd call a "health overview" or "index" route.
   Useful to confirm the server is up and see what it offers.
────────────────────────────────────────────────────────────────────── */
app.get("/", (req: Request, res: Response) => {
  res.json({
    server: APP_NAME,
    status: "running",
    sprint: "Sprint 3 — Node.js / TypeScript Back-End",
    day: 61,
    author: "Henry Ehindero — Lagos, Nigeria 🇳🇬",
    routes: [
      { method: "GET",  path: "/",              description: "This overview" },
      { method: "GET",  path: "/health",         description: "Server health check" },
      { method: "GET",  path: "/hello",          description: "Hello from the server" },
      { method: "GET",  path: "/hello/:name",    description: "Personalised greeting" },
      { method: "POST", path: "/hello/echo",     description: "Echo back your request body" },
    ],
  });
});

/* ── Health check route ──────────────────────────────────────────────
   GET /health is a standard route in almost every production server.
   Monitoring tools and load balancers ping this to check if the server
   is alive. If it returns 200, the server is healthy.
────────────────────────────────────────────────────────────────────── */
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: `${Math.floor(process.uptime())}s`,
    memoryMB: (process.memoryUsage().rss / 1024 / 1024).toFixed(1),
    node: process.version,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

/* ── Mount the hello router ──────────────────────────────────────────
   app.use("/hello", helloRouter) means:
   ALL routes defined in helloRouter are prefixed with /hello
   So router.get("/")       becomes  GET  /hello
      router.get("/:name")  becomes  GET  /hello/:name
      router.post("/echo")  becomes  POST /hello/echo
────────────────────────────────────────────────────────────────────── */
app.use("/hello", helloRouter);

/* ── 404 handler ─────────────────────────────────────────────────────
   If a request reaches here, no route above matched it.
   This MUST be the last app.use() call — after all routes.
   The 404 status code means "Not Found".
────────────────────────────────────────────────────────────────────── */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.url,
    hint: "Check GET / for a list of available routes",
  });
});

/* ── Global error handler ────────────────────────────────────────────
   If any route handler calls next(error) or throws, it lands here.
   The 4-parameter signature (err, req, res, next) is how Express
   identifies this as an error handler — all four params are required.
────────────────────────────────────────────────────────────────────── */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

/* ── Start listening ─────────────────────────────────────────────────
   app.listen() starts the server on the given PORT.
   From this moment, the server is alive and accepting connections.
   The callback fires once — when the server is ready.
────────────────────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n┌──────────────────────────────────────┐`);
  console.log(`│  ${APP_NAME} running                  │`);
  console.log(`│  http://localhost:${PORT}                  │`);
  console.log(`│  Day 61 · Sprint 3 · Lagos, Nigeria  │`);
  console.log(`└──────────────────────────────────────┘\n`);
  console.log(`  GET  http://localhost:${PORT}/`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  GET  http://localhost:${PORT}/hello`);
  console.log(`  GET  http://localhost:${PORT}/hello/Henry`);
  console.log(`  POST http://localhost:${PORT}/hello/echo\n`);
});