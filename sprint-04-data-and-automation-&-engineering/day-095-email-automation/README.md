# Day 95: Email Sender Automation with Nodemailer

A Node.js + TypeScript email automation system that composes and sends three types of HTML emails — daily sales reports, low stock alerts, and welcome emails — using Nodemailer with Gmail SMTP. Dry-run mode writes the rendered HTML to disk for preview without sending.

## What's New

First email automation project in the challenge. Introduces Nodemailer for SMTP transport, HTML email templates built entirely with inline styles (required for email client compatibility), a reusable base layout with header/footer, and a dry-run mode that writes rendered emails to the `./output/` folder for inspection in the browser.

## Features

- Three email types: daily sales report, low stock alert, welcome email
- Reusable base layout — header, body, footer — shared across all templates
- Fully inline-styled HTML (required for Gmail, Outlook, Apple Mail compatibility)
- Stat cards, data tables with alternating row colours, and stock status badges
- Plain-text fallback included in every email alongside the HTML version
- Dry-run mode writes HTML files to `./output/` — open in browser to preview before sending
- Multiple recipients supported via comma-separated `REPORT_RECIPIENTS` in `.env`
- Lazy Nodemailer transporter — created on first send, never at module load
- SMTP connection verification before first send in live mode

## Technologies Used

- Node.js + TypeScript
- `nodemailer` — SMTP email transport
- `dotenv` — environment configuration
- `zod` — runtime validation
- `tsx` — TypeScript execution

## Folder Structure

```
day-095-email-automation/
├── output/                         # Dry-run HTML previews (git-ignored)
├── src/
│   ├── config/
│   │   └── config.ts               # SMTP config loader and recipient parser
│   ├── data/
│   │   └── mockData.ts             # Nigerian mock sales, stock, and user data
│   ├── services/
│   │   ├── mailer.ts               # Lazy Nodemailer transporter singleton
│   │   └── sender.ts               # Send live or write to disk in dry-run
│   ├── templates/
│   │   ├── base.ts                 # Shared layout, stat cards, table helpers
│   │   ├── salesReport.ts          # Daily sales report template
│   │   ├── stockAlert.ts           # Low stock alert template
│   │   └── welcome.ts              # New user welcome template
│   ├── types/
│   │   └── index.ts                # Interfaces
│   └── index.ts                    # Entry point — builds and sends all three emails
├── .env
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd day-095-email-automation
npm install
```

## How to Run

```bash
# Preview all three emails as HTML files in ./output/ (no credentials needed)
npm run dry-run

# Send all three emails via Gmail SMTP (requires credentials in .env)
npm run send
```

## Testing Step by Step

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run dry-run immediately** (no credentials needed):
   ```bash
   npm run dry-run
   ```

3. **Open the generated HTML files in your browser:**
   ```bash
   open ./output/
   ```
   You should see three `.html` files — one per email type.

4. **Inspect each email** — check the sales report tables, stock badge colours (red for out-of-stock, amber for low, green for ok), and the welcome CTA button.

5. **Set up Gmail credentials for live sending:**
    - Enable 2FA on your Google account
    - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
    - Create an App Password for "Mail"
    - Copy the 16-character password into `.env` as `SMTP_PASS`
    - Set `SMTP_USER` and `FROM_EMAIL` to your Gmail address

6. **Set recipients in `.env`:**
   ```
   REPORT_RECIPIENTS=you@example.com
   ALERT_RECIPIENTS=you@example.com
   WELCOME_RECIPIENT=you@example.com
   ```

7. **Send live:**
   ```bash
   npm run send
   ```

8. **Check the terminal** for message IDs and delivery confirmation.

9. **Test multiple recipients** — comma-separate addresses in `.env`:
   ```
   REPORT_RECIPIENTS=alice@example.com,bob@example.com
   ```

10. **Check your inbox** — the sales report and stock alert will be in HTML with tables and formatting; the welcome email will include the green CTA button.

## What I Learned

- HTML emails must use inline styles — external stylesheets and `<style>` blocks are stripped by most email clients (Gmail, Outlook)
- Nodemailer's `transporter.verify()` tests the SMTP connection before sending — useful for catching wrong credentials early
- Gmail requires an App Password when 2FA is enabled — your real Gmail password will be rejected by SMTP
- `secure: true` with `port: 465` uses SSL from the start; `secure: false` with `port: 587` uses STARTTLS — both work with Gmail
- Writing emails to disk in dry-run mode (`.html` files) lets you open them in any browser for a pixel-accurate preview before sending
- Plain-text fallback (`text` field alongside `html`) improves deliverability and is required by some corporate email filters
- Table-based layouts with `cellpadding` and `cellspacing` attributes are still the most reliable approach for multi-column email layouts
- `nodemailer.createTransport()` accepts the `from` field per-message, not per-transporter — allows sending as different senders from one transport instance

## Challenge Info

| Field    | Detail                                    |
|----------|-------------------------------------------|
| Day      | 95                                        |
| Sprint   | 4 — Data Engineering & Databases          |
| Date     | 2025-01-09                                |
| Previous | [Day 94](../day-094-x-bot)                |
| Next     | [Day 96](../day-096-news-scraper)         |

Part of my 300 Days of Code Challenge!
