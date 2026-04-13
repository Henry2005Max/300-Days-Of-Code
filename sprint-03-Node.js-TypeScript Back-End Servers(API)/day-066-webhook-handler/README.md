# Day 66: Webhook Handler

## Description

A webhook receiver that handles incoming HTTP POST requests from external services like GitHub and Paystack. Implements HMAC-SHA256 signature verification to confirm requests are genuine. Routes incoming events by type and logs all received webhooks in memory. A test endpoint with no signature requirement makes development testing easy.

## What is a Webhook?

A webhook is an HTTP POST request sent by an external service to your server when an event happens. Instead of your server polling "did anything happen?", the provider pushes the event to you immediately.

## Features

- POST /webhooks/github — verifies x-hub-signature-256 header using HMAC-SHA256
- POST /webhooks/paystack — verifies x-paystack-signature header
- POST /webhooks/test — no signature required, for Postman testing
- GET /webhooks — view all received webhook logs, supports ?source=github|paystack
- GET /webhooks/:id — view full payload of a specific webhook
- HMAC-SHA256 signature verification using Node.js crypto module
- crypto.timingSafeEqual() prevents timing-based attacks
- express.raw() on /webhooks routes preserves raw body bytes for HMAC computation
- Event routing via switch statement — push, pull_request, ping for GitHub; charge.success, charge.failed, transfer.success for Paystack
- Naira formatting for Paystack payment amounts (amount is in kobo, divide by 100)
- In-memory webhook log with id, source, event, receivedAt, verified, summary, payload

## Technologies Used

- Node.js
- TypeScript
- Express 4
- Node.js crypto module (built-in, no install needed)
- dotenv
- tsx

## Folder Structure

```
day-066-webhook-handler/
├── src/
│   ├── index.ts
│   ├── types/
│   │   └── index.ts              ← GitHub, Paystack event types, WebhookLog
│   ├── routes/
│   │   └── webhooks.ts           ← all webhook endpoints
│   └── middleware/
│       ├── verifySignature.ts    ← HMAC verification functions
│       └── logger.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd Desktop
mkdir day-066-webhook-handler
cd day-066-webhook-handler
mkdir -p src/types src/routes src/middleware
```

Copy all files, then:

```bash
npm install
npm run dev
```

## Testing Step by Step

### Test in Postman (no signature needed):

**Send a test payment event:**
- Method: POST
- URL: `http://localhost:3000/webhooks/test`
- Body → raw → JSON:
```json
{
  "event": "charge.success",
  "data": {
    "reference": "REF123456",
    "amount": 5000000,
    "customer": {
      "email": "chidi@example.com",
      "first_name": "Chidi",
      "last_name": "Okeke"
    }
  }
}
```
- Expect: 200 `{ success: true, received: true }`
- Check terminal — event is logged

**Send a test push event:**
```json
{
  "event": "push",
  "ref": "refs/heads/main",
  "pusher": { "name": "Henry" },
  "commits": [
    { "id": "abc1234567", "message": "Day 66: webhook handler", "author": { "name": "Henry", "email": "henry@example.com" } }
  ]
}
```

**View all received webhooks:**
- GET `http://localhost:3000/webhooks`
- See all logged events with summaries

**Filter by source:**
- GET `http://localhost:3000/webhooks?source=github`

**View single webhook:**
- Copy an `id` from the list
- GET `http://localhost:3000/webhooks/<id>`

### Test signature verification (curl):

```bash
# Compute the signature
SECRET="github_secret_day66"
BODY='{"ref":"refs/heads/main","pusher":{"name":"Henry"},"commits":[]}'
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/SHA2-256(stdin)= //' | awk '{print "sha256="$1}')

# Send with correct signature
curl -X POST http://localhost:3000/webhooks/github \
  -H "Content-Type: application/json" \
  -H "x-hub-signature-256: $SIG" \
  -H "x-github-event: push" \
  -d "$BODY"
```

## What I Learned

- Webhooks are push-based — external services POST to your server when events happen, you don't poll them
- HMAC signature verification requires the raw request body bytes — parsing JSON first and re-stringifying changes whitespace and potentially key order, breaking the hash comparison
- express.raw({ type: "application/json" }) must be registered before express.json() for the specific path — Express applies middleware in order and the first match wins
- crypto.timingSafeEqual() always takes the same amount of time regardless of where a mismatch occurs — regular === comparison leaks timing information that attackers can use
- Webhook receivers must respond with 200 as quickly as possible — providers retry if they don't get a response within a few seconds. Heavy processing should happen asynchronously after the 200 is sent
- GitHub prefixes its signature with "sha256=" while Paystack sends just the hex — every provider has their own convention, always check the docs

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 66 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 13, 2025 |
| Previous | [Day 65 — JWT Auth](../day-065-jwt-auth) |
| Next | [Day 67 — Ethical Scraper](../day-067-scraper) |

Part of my 300 Days of Code Challenge!
