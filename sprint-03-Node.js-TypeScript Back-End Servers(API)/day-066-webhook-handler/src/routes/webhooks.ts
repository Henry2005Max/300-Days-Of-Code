import { Router, Request, Response } from "express";
import { verifyGitHubSignature, verifyPaystackSignature } from "../middleware/verifySignature";
import { WebhookLog, GitHubPushEvent, GitHubPREvent, PaystackEvent } from "../types";

const router = Router();

/* ── In-memory webhook log ───────────────────────────────────────────
   Every received webhook is stored here for inspection via GET /webhooks
   In production you'd write these to a database.
────────────────────────────────────────────────────────────────────── */
const webhookLogs: WebhookLog[] = [];

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/* ── POST /webhooks/github ───────────────────────────────────────────
   GitHub sends:
   - Header: x-hub-signature-256 → "sha256=<hmac_hex>"
   - Header: x-github-event     → "push", "pull_request" etc
   - Body: raw JSON bytes (NOT parsed by Express)

   We must use express.raw() on this route (set in index.ts)
   so req.body is a Buffer, not a parsed object.
────────────────────────────────────────────────────────────────────── */
router.post("/github", (req: Request, res: Response) => {
  const rawBody = req.body as Buffer;
  const signature = req.headers["x-hub-signature-256"] as string;
  const eventType = req.headers["x-github-event"] as string;
  const secret = process.env.GITHUB_WEBHOOK_SECRET!;

  /* Step 1 — verify signature */
  const verified = verifyGitHubSignature(rawBody, signature, secret);

  if (!verified) {
    console.warn("[WEBHOOK] GitHub signature verification FAILED");
    res.status(401).json({ success: false, error: "Invalid signature" });
    return;
  }

  /* Step 2 — parse the body now that we've verified it */
  let payload: any;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    res.status(400).json({ success: false, error: "Invalid JSON body" });
    return;
  }

  /* Step 3 — route by event type */
  let summary = "";

  switch (eventType) {
    case "push": {
      const event = payload as GitHubPushEvent;
      const branch = event.ref?.replace("refs/heads/", "") ?? "unknown";
      const commitCount = event.commits?.length ?? 0;
      summary = `Push to ${branch} by ${event.pusher?.name} — ${commitCount} commit(s)`;
      console.log(`[GITHUB] ${summary}`);
      if (event.commits) {
        event.commits.forEach((c) => {
          console.log(`  → ${c.id.slice(0, 7)} ${c.message} (${c.author.name})`);
        });
      }
      break;
    }

    case "pull_request": {
      const event = payload as GitHubPREvent;
      const pr = event.pull_request;
      summary = `PR #${pr?.number} "${pr?.title}" ${event.action} by ${pr?.user?.login}`;
      console.log(`[GITHUB] ${summary}`);
      if (event.action === "closed" && pr?.merged) {
        console.log(`  → PR was MERGED into the base branch`);
      }
      break;
    }

    case "ping": {
      summary = `Ping received — webhook configured successfully`;
      console.log(`[GITHUB] ${summary}`);
      break;
    }

    default: {
      summary = `Unhandled event type: ${eventType}`;
      console.log(`[GITHUB] ${summary}`);
    }
  }

  /* Step 4 — log it */
  webhookLogs.unshift({
    id:         uid(),
    source:     "github",
    event:      eventType || "unknown",
    receivedAt: new Date().toISOString(),
    verified:   true,
    summary,
    payload,
  });

  /* Always respond 200 quickly — providers retry if you don't respond fast */
  res.status(200).json({ success: true, received: true });
});

/* ── POST /webhooks/paystack ─────────────────────────────────────────
   Paystack sends:
   - Header: x-paystack-signature → "<hmac_hex>" (no prefix)
   - Body: raw JSON bytes
────────────────────────────────────────────────────────────────────── */
router.post("/paystack", (req: Request, res: Response) => {
  const rawBody = req.body as Buffer;
  const signature = req.headers["x-paystack-signature"] as string;
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET!;

  const verified = verifyPaystackSignature(rawBody, signature, secret);

  if (!verified) {
    console.warn("[WEBHOOK] Paystack signature verification FAILED");
    res.status(401).json({ success: false, error: "Invalid signature" });
    return;
  }

  let payload: PaystackEvent;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    res.status(400).json({ success: false, error: "Invalid JSON body" });
    return;
  }

  const eventType = payload.event;
  let summary = "";

  switch (eventType) {
    case "charge.success": {
      const { reference, amount, currency, customer } = payload.data;
      const naira = (amount / 100).toLocaleString("en-NG", { style: "currency", currency: "NGN" });
      summary = `Payment SUCCESS — ${naira} from ${customer.first_name} ${customer.last_name} (${customer.email}) ref: ${reference}`;
      console.log(`[PAYSTACK] ${summary}`);
      /* In production: update order status, send confirmation email, etc. */
      break;
    }

    case "charge.failed": {
      const { reference, customer } = payload.data;
      summary = `Payment FAILED — ref: ${reference} customer: ${customer.email}`;
      console.log(`[PAYSTACK] ${summary}`);
      break;
    }

    case "transfer.success": {
      const { reference, amount } = payload.data;
      const naira = (amount / 100).toLocaleString("en-NG", { style: "currency", currency: "NGN" });
      summary = `Transfer SUCCESS — ${naira} ref: ${reference}`;
      console.log(`[PAYSTACK] ${summary}`);
      break;
    }

    default: {
      summary = `Unhandled Paystack event: ${eventType}`;
      console.log(`[PAYSTACK] ${summary}`);
    }
  }

  webhookLogs.unshift({
    id:         uid(),
    source:     "paystack",
    event:      eventType,
    receivedAt: new Date().toISOString(),
    verified:   true,
    summary,
    payload,
  });

  res.status(200).json({ success: true, received: true });
});

/* ── POST /webhooks/test ─────────────────────────────────────────────
   A test endpoint with NO signature verification.
   Use this to simulate webhooks from Postman during development.
   In production you'd remove this or protect it.
────────────────────────────────────────────────────────────────────── */
router.post("/test", (req: Request, res: Response) => {
  const rawBody = req.body as Buffer;
  let payload: any;

  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    res.status(400).json({ success: false, error: "Invalid JSON body" });
    return;
  }

  const eventType = payload.event || payload.type || "test.event";
  const summary = `Test webhook received — event: ${eventType}`;
  console.log(`[WEBHOOK TEST] ${summary}`);
  console.log(`  Payload:`, JSON.stringify(payload, null, 2));

  webhookLogs.unshift({
    id:         uid(),
    source:     "unknown",
    event:      eventType,
    receivedAt: new Date().toISOString(),
    verified:   false,
    summary,
    payload,
  });

  res.status(200).json({ success: true, received: true, event: eventType });
});

/* ── GET /webhooks — view all received webhooks ── */
router.get("/", (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const source = req.query.source as string;

  const filtered = source
    ? webhookLogs.filter((w) => w.source === source)
    : webhookLogs;

  res.status(200).json({
    success: true,
    data: filtered.slice(0, limit),
    meta: { total: webhookLogs.length, count: filtered.slice(0, limit).length },
  });
});

/* ── GET /webhooks/:id — single webhook detail ── */
router.get("/:id", (req: Request, res: Response) => {
  const log = webhookLogs.find((w) => w.id === req.params.id);
  if (!log) {
    res.status(404).json({ success: false, error: "Webhook log not found" });
    return;
  }
  res.status(200).json({ success: true, data: log });
});

export default router;