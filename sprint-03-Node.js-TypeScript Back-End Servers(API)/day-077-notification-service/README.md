# Day 77: Notification Service with Nodemailer

## Description

A production-ready REST API that sends transactional emails using Nodemailer and logs every delivery attempt in SQLite. Supports five notification types — welcome, password reset, order confirmation, low stock alert, and custom — each with its own HTML template. On first run the server auto-creates a free Ethereal test account so you can preview emails in the browser without any SMTP sign-up.

## What’s New

Day 77 introduces Nodemailer — the first external I/O side effect in Sprint 3 where the backend reaches out to an external SMTP server. Previous days (64–76) handled side effects that stayed local (SQLite writes, JWT signing, WebSocket broadcasts). Today we deal with async delivery failures, retry logic, and the concept of decoupling email rendering (templates) from email sending (the mailer service).

## Features

- POST a notification by type and recipient; email is sent immediately and the result is persisted
- Five built-in HTML email templates with inline styles for broad client compatibility
- Ethereal auto-account creation on first run — no SMTP credentials required to get started
- Preview URL logged to the console after every Ethereal send
- SQLite log of every notification: status (pending/sent/failed), message ID, error, attempt count
- Retry endpoint for failed notifications
- Delivery stats endpoint (total/sent/failed/pending counts)
- List endpoint with filtering by status and recipient email
- Full Zod validation on all inputs
- asyncHandler, AppError hierarchy, and colour-coded request logger from earlier sprint days

## Technologies Used

- Node.js + TypeScript
- Express 4
- Nodemailer 6
- better-sqlite3
- Zod
- dotenv
- tsx (dev runner)

## Folder Structure

```
sprint-03-backend/day-077-notification-service/
├── src/
│   ├── db/
│   │   └── database.ts        # SQLite connection + migrations
│   ├── middleware/
│   │   ├── errorHandler.ts    # AppError, asyncHandler, global handler
│   │   ├── logger.ts          # Colour-coded request logger
│   │   └── validate.ts        # Zod validation middleware factory
│   ├── routes/
│   │   └── notifications.ts   # All /notifications endpoints
│   ├── schemas/
│   │   └── notification.schema.ts
│   ├── services/
│   │   ├── mailer.ts          # Nodemailer transporter + sendMail()
│   │   ├── notification.service.ts  # Business logic
│   │   └── templates.ts       # HTML email template builders
│   ├── types/
│   │   └── index.ts
│   └── index.ts               # Entry point
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
mkdir day-077-notification-service
cd day-077-notification-service
mkdir -p src/routes src/middleware src/db src/types src/services src/schemas
```

Copy all files into the structure above, then:

```bash
npm install
```

## How to Run

```bash
npm run dev
```

On first run, if `SMTP_USER` and `SMTP_PASS` are not set in `.env`, the server auto-creates an Ethereal test account and prints the credentials. Copy them into `.env` so they persist across restarts.

## Testing Step by Step

### Step 1: Confirm the server is running

```bash
curl http://localhost:3000/health
```

Expected:

```json
{ "success": true, "data": { "status": "ok", "service": "notification-service" } }
```

### Step 2: Send a welcome email

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{"type":"welcome","to":"amaka@example.ng","data":{"name":"Amaka"}}'
```

Expected response (status `sent`):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "welcome",
    "to_email": "amaka@example.ng",
    "subject": "Welcome to NaijaNotify, Amaka!",
    "status": "sent",
    "message_id": "<abc123@ethereal.email>",
    "attempts": 1,
    ...
  }
}
```

Check the console for a preview URL like `https://ethereal.email/message/...` and open it in the browser to see the rendered email.

### Step 3: Send an order confirmation

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "order_confirmation",
    "to": "chidi@example.ng",
    "data": {
      "name": "Chidi",
      "orderId": "ORD-2042",
      "amount": "35000",
      "items": [
        {"name": "Ankara Shirt", "qty": 2, "price": "₦15,000"},
        {"name": "Batik Cap",    "qty": 1, "price": "₦5,000"}
      ]
    }
  }'
```

### Step 4: Send a password reset

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{"type":"password_reset","to":"tunde@example.ng","data":{"name":"Tunde","resetLink":"https://example.ng/reset?token=abc123"}}'
```

### Step 5: Send a low stock alert

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{"type":"low_stock_alert","to":"ngozi@example.ng","data":{"product":"Ankara Fabric (Red)","remaining":"3"}}'
```

### Step 6: List all notifications

```bash
curl http://localhost:3000/notifications
```

### Step 7: Filter by status

```bash
curl "http://localhost:3000/notifications?status=sent"
curl "http://localhost:3000/notifications?status=failed"
```

### Step 8: Get delivery stats

```bash
curl http://localhost:3000/notifications/stats
```

Expected:

```json
{ "success": true, "data": { "total": 4, "sent": 4, "failed": 0, "pending": 0 } }
```

### Step 9: Get a single notification

```bash
curl http://localhost:3000/notifications/1
```

### Step 10: Test validation error

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{"type":"welcome","to":"not-an-email"}'
```

Expected 400 with field errors.

### Step 11: Test retry endpoint

```bash
curl -X POST http://localhost:3000/notifications/1/retry
```

## What I Learned

- Nodemailer uses the concept of a **transporter** — a configured connection to an SMTP server. You create it once and reuse it for every `sendMail()` call, similar to how we create a single SQLite `db` instance
- `nodemailer.createTestAccount()` is an async call that hits the Ethereal API to provision a fresh sandbox inbox — this is why `initMailer()` must be awaited before `app.listen()`
- `nodemailer.getTestMessageUrl(info)` returns a URL you can open in the browser to preview the rendered email, including headers, HTML view, and raw source — invaluable for debugging templates
- HTML emails require **inline styles** because Gmail, Outlook, and Apple Mail strip `<style>` blocks from the `<head>`. Every colour, font-size, and margin must be on the element itself
- The pattern of inserting a `pending` row in SQLite *before* calling `sendMail()` is critical — if the SMTP call crashes mid-flight, the record still exists and can be retried
- `asyncHandler` continues to pay off: without it, a rejected promise inside a route would hang the request silently in Express 4 (Express 5 fixes this, but we are on Express 4)
- Dynamic `WHERE` clause construction with named parameters avoids SQL injection and keeps the query readable
- Grouping email logic into `mailer.ts` (transport layer), `templates.ts` (rendering), and `notification.service.ts` (orchestration) means each file has one reason to change — the Single Responsibility Principle in practice

## Challenge Info

|Field   |Value                                                      |
|--------|-----------------------------------------------------------|
|Day     |77                                                         |
|Sprint  |3 — Node.js Back-End Servers                               |
|Date    |April 24, 2026                                             |
|Previous|[Day 76 — File Upload with Multer](../day-076-file-upload/)|
|Next    |[Day 78 — RSS Parser](../day-078-rss-parser/)              |

Part of my 300 Days of Code Challenge!
