import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { requestLogger } from "./middleware/logger";
import webhooksRouter from "./routes/webhooks";

const app = express();
const PORT = process.env.PORT || 3000;

/* ── Body parsing strategy ───────────────────────────────────────────
   This is the key difference for webhook routes.

   Normal routes:  express.json()  → req.body is a parsed JS object
   Webhook routes: express.raw()   → req.body is a raw Buffer

   We apply express.raw() ONLY to /webhooks/* routes.
   This preserves the exact bytes needed for HMAC verification.
   express.json() is still used for all other routes.

   Order matters — express.raw() must be registered before
   express.json() for the /webhooks path to take precedence.
────────────────────────────────────────────────────────────────────── */
app.use("/webhooks", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(requestLogger);

app.get("/", (req: Request, res: Response) => {
  res.json({
    api: "WebhookHandler",
    day: 66,
    author: "Henry Ehindero — Lagos, Nigeria 🇳🇬",
    description: "Webhook receiver with HMAC signature verification",
    endpoints: [
      { method: "POST", path: "/webhooks/github",   description: "GitHub webhook receiver (verifies x-hub-signature-256)" },
      { method: "POST", path: "/webhooks/paystack", description: "Paystack webhook receiver (verifies x-paystack-signature)" },
      { method: "POST", path: "/webhooks/test",     description: "Test webhook — no signature required, use in Postman" },
      { method: "GET",  path: "/webhooks",          description: "View all received webhooks. Supports ?source=github|paystack" },
      { method: "GET",  path: "/webhooks/:id",      description: "View single webhook by ID" },
    ],
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: `${Math.floor(process.uptime())}s`, timestamp: new Date().toISOString() });
});

app.use("/webhooks", webhooksRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n┌──────────────────────────────────────────┐`);
  console.log(`│  WebhookHandler — Day 66                 │`);
  console.log(`│  http://localhost:${PORT}                    │`);
  console.log(`│  Day 66 · Sprint 3 · Lagos, Nigeria    │`);
  console.log(`└──────────────────────────────────────────┘\n`);
  console.log(`  POST http://localhost:${PORT}/webhooks/test     ← test in Postman`);
  console.log(`  POST http://localhost:${PORT}/webhooks/github   ← needs signature`);
  console.log(`  POST http://localhost:${PORT}/webhooks/paystack ← needs signature`);
  console.log(`  GET  http://localhost:${PORT}/webhooks          ← view received\n`);
});