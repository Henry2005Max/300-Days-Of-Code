# Day 87: Advanced Notification Service

## Description

A production-grade notification service that queues delivery jobs in SQLite, processes them asynchronously via a background worker on a configurable cron schedule, retries failures with exponential backoff, supports both email (Nodemailer/Ethereal) and webhook delivery channels, respects per-user notification preferences and opt-outs, and logs every delivery attempt for full auditability.

## What's New vs Day 77

Day 77 sent emails synchronously — the HTTP request blocked until the email was delivered. Day 87 introduces four architectural improvements: queued async delivery (API returns 202 immediately), exponential backoff retries (30s → 60s → 120s → 240s → dead), dual delivery channels (email + webhook), and per-user preferences with type-level opt-outs. These are the patterns used by production systems like SendGrid, Postmark, and AWS SNS.

## Features

- POST /notifications returns 202 immediately — delivery is async
- Queue worker runs every 5 seconds (configurable), processes up to 10 jobs per tick
- Exponential backoff: delay doubles on each failure (30s, 60s, 120s, 240s, then dead)
- Up to 5 attempts before a job becomes dead — manual retry available via API
- Email channel via Nodemailer (Ethereal auto-account on first run, no sign-up)
- Webhook channel: POSTs JSON payload to recipient's URL with event metadata
- `both` channel: email AND webhook; both must succeed for job to be marked sent
- Per-user preferences: preferred channel, webhook URL, per-type opt-outs
- Full delivery log per job: channel, attempt number, success, response text
- 6 notification types: welcome, password_reset, order_confirmation, low_stock_alert, payment_received, custom
- Queue stats: count by status (pending/processing/sent/failed/dead)

## Technologies Used

- Node.js + TypeScript
- Express 4
- Nodemailer 6
- Axios (webhook delivery)
- node-cron 3
- better-sqlite3
- Zod
- dotenv
- tsx (dev runner)

## Folder Structure

```
sprint-03-backend/day-087-notifications/
├── src/
│   ├── db/
│   │   ├── database.ts           # Migrations (jobs, preferences, logs)
│   │   └── statements.ts         # Lazy prepared statements
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   └── validate.ts
│   ├── routes/
│   │   └── notifications.ts
│   ├── schemas/
│   │   └── notification.schema.ts
│   ├── services/
│   │   ├── mailer.ts             # Nodemailer + Ethereal auto-account
│   │   ├── notification.service.ts # Enqueue, preferences, stats
│   │   ├── queue.ts              # Worker: pickup, deliver, backoff
│   │   ├── templates.ts          # HTML email templates
│   │   └── webhook.ts            # Outbound webhook POST
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
mkdir day-087-notifications
cd day-087-notifications
mkdir -p src/routes src/middleware src/db src/types src/services src/schemas
```

Copy all files, then:

```bash
npm install
```

## How to Run

```bash
npm run dev
```

On first run the server auto-creates an Ethereal test account — copy the credentials to `.env` to reuse them.

## Testing Step by Step

### Step 1: Confirm the server is running

```bash
curl http://localhost:3000/health
```

### Step 2: Enqueue a welcome email

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "recipient_email": "amaka@example.ng",
    "template_data": {"name": "Amaka"}
  }'
```

Response is `202 Accepted`. Within 5 seconds the worker picks it up and delivers it.
Check the console for a preview URL like `https://ethereal.email/message/...`

### Step 3: Check queue stats

```bash
curl http://localhost:3000/notifications/stats
```

### Step 4: List all jobs

```bash
curl http://localhost:3000/notifications
```

### Step 5: Filter to only sent jobs

```bash
curl "http://localhost:3000/notifications?status=sent"
```

### Step 6: View delivery logs for a job

```bash
curl http://localhost:3000/notifications/1/logs
```

### Step 7: Enqueue an order confirmation

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "order_confirmation",
    "recipient_email": "chidi@example.ng",
    "template_data": {
      "name": "Chidi",
      "order_id": "ORD-2087",
      "amount": "45000"
    }
  }'
```

### Step 8: Set user preferences for Chidi

```bash
curl -X PUT http://localhost:3000/preferences/chidi_lagos \
  -H "Content-Type: application/json" \
  -d '{
    "username": "chidi_lagos",
    "email": "chidi@example.ng",
    "channel": "email",
    "disabled_types": ["low_stock_alert"]
  }'
```

### Step 9: Try to send a disabled notification type

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "low_stock_alert",
    "recipient_email": "chidi@example.ng",
    "template_data": {"product": "Ankara Fabric", "remaining": "2"}
  }'
```

Expected 400: `User "chidi@example.ng" has opted out of "low_stock_alert" notifications`

### Step 10: Test webhook delivery (use webhook.site for a free test URL)

Visit https://webhook.site and copy your unique URL, then:

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_received",
    "recipient_email": "tunde@example.ng",
    "recipient_webhook": "https://webhook.site/YOUR_UNIQUE_URL",
    "channel": "both",
    "template_data": {"name": "Tunde", "amount": "25000", "ref": "PAY-XYZ"}
  }'
```

### Step 11: Manually retry a failed/dead job

```bash
curl -X POST http://localhost:3000/notifications/1/retry
```

### Step 12: Send a custom notification

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "custom",
    "recipient_email": "ngozi@example.ng",
    "template_data": {
      "subject": "GDG Lagos Meetup Tomorrow",
      "message": "Join us at the GDG Lagos meetup tomorrow at 3pm, Victoria Island."
    }
  }'
```

## What I Learned

- Queued async delivery (return 202, deliver later) is the correct pattern for notifications — it keeps API response times fast and separates the concern of accepting a request from fulfilling it
- Exponential backoff (`BASE * 2^attempts`) prevents hammering a temporarily-down SMTP server and gives it time to recover — the delay grows as 30s, 60s, 120s, 240s before marking a job dead
- Marking jobs as `processing` before delivering prevents double-delivery if two worker ticks overlap — the `WHERE status IN ('pending','failed')` check on pickup plus the immediate status update acts as an optimistic lock
- Per-user opt-outs checked at enqueue time (not at delivery time) fail fast with a clear error — better UX than silently dropping the notification at delivery
- The `both` channel pattern (email AND webhook, both must succeed) shows why logging per-channel is important — you can see exactly which channel succeeded and which failed independently

## Challenge Info

| Field    | Value |
|----------|-------|
| Day      | 87 |
| Sprint   | 3 — Node.js Back-End Servers |
| Date     | May 04, 2026 |
| Previous | [Day 86 — File Upload with Multer](../day-086-file-upload/) |
| Next     | [Day 88 — RSS Parser (Advanced)](../day-088-rss-advanced/) |

Part of my 300 Days of Code Challenge!
