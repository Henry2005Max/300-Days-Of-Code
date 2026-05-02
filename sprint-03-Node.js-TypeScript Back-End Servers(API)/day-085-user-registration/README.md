# Day 85: User Registration with bcrypt

## Description

A production-grade authentication REST API covering the full user lifecycle: registration with email verification, JWT-based login with access and refresh tokens, refresh token rotation, account lockout after repeated failures, password reset flow, authenticated password change, login history audit log, and admin endpoints for user management.

## What's New

Day 85 revisits bcrypt and JWT from Day 64–65 but builds a complete, production-realistic system. New concepts: refresh token rotation (old token revoked on use, new one issued — limits stolen-token damage), account lockout with auto-unlock after a configurable duration, one-time tokens with expiry and `used_at` tracking, SHA-256 hashing of refresh tokens before DB storage, and user enumeration prevention in the forgot-password flow.

## Features

- Registration with bcrypt password hashing (configurable cost factor)
- Email verification via one-time 64-char hex token (returned in response for testing)
- Login with lockout after configurable failed attempts (default 5)
- Auto-unlock when lockout duration expires on next login attempt
- JWT access tokens (15m) + opaque refresh tokens (7d, stored as SHA-256 hash)
- Refresh token rotation — each refresh issues a new token and revokes the old one
- Forgot password / reset password flow (same response shape to prevent user enumeration)
- Password reset revokes all refresh tokens on all devices
- Authenticated change-password endpoint
- Login history — every attempt logged with IP, user agent, success, and failure reason
- Admin endpoints: list users, update user status (active / suspended / locked)
- Lazy prepared statements — no "no such table" crash on startup

## Technologies Used

- Node.js + TypeScript
- Express 4
- bcryptjs
- jsonwebtoken
- better-sqlite3
- Zod
- dotenv
- tsx (dev runner)

## Folder Structure

```
sprint-03-backend/day-085-user-registration/
├── src/
│   ├── db/
│   │   ├── database.ts          # Migrations (users, login_history, tokens, refresh_tokens)
│   │   └── statements.ts        # Lazy prepared statements
│   ├── middleware/
│   │   ├── authenticate.ts      # JWT verification + requireAdmin
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   └── validate.ts
│   ├── routes/
│   │   └── auth.ts
│   ├── schemas/
│   │   └── auth.schema.ts
│   ├── services/
│   │   ├── auth.service.ts      # Register, login, lockout, reset, admin
│   │   └── token.service.ts     # JWT, refresh tokens, one-time tokens
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
mkdir day-085-user-registration
cd day-085-user-registration
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

## Testing Step by Step

### Step 1: Register a new user

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"chidi_lagos","email":"chidi@example.ng","password":"Secret123"}'
```

Copy the `verify_token` from the response.

### Step 2: Verify email

```bash
curl -X POST http://localhost:3000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"PASTE_VERIFY_TOKEN_HERE"}'
```

### Step 3: Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"chidi@example.ng","password":"Secret123"}'
```

Copy both `access_token` and `refresh_token` from the response.

### Step 4: Get your profile

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer PASTE_ACCESS_TOKEN_HERE"
```

### Step 5: View login history

```bash
curl http://localhost:3000/auth/me/login-history \
  -H "Authorization: Bearer PASTE_ACCESS_TOKEN_HERE"
```

### Step 6: Refresh the access token

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"PASTE_REFRESH_TOKEN_HERE"}'
```

Note: the old refresh token is now invalid. Use the new one for subsequent refreshes.

### Step 7: Test account lockout

Register and verify a second user, then fail login 5 times:

```bash
for i in 1 2 3 4 5; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"chidi@example.ng","password":"WrongPass1"}'
  echo ""
done
```

The 5th attempt locks the account. The 6th attempt returns the locked error.

### Step 8: Password reset flow

```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"chidi@example.ng"}'
```

Copy the `reset_token`, then:

```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"PASTE_RESET_TOKEN_HERE","password":"NewSecret456"}'
```

### Step 9: Change password (while logged in)

```bash
curl -X POST http://localhost:3000/auth/me/change-password \
  -H "Authorization: Bearer PASTE_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"current_password":"NewSecret456","new_password":"Another789A"}'
```

### Step 10: Test user enumeration prevention

```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"notreal@example.com"}'
```

The response shape is the same as for a real email — no 404.

### Step 11: Create an admin user directly in SQLite (for testing admin routes)

```bash
sqlite3 users.db "UPDATE users SET role='admin' WHERE username='chidi_lagos';"
```

Then login again to get a fresh token with the admin role, and:

```bash
curl http://localhost:3000/admin/users \
  -H "Authorization: Bearer PASTE_ADMIN_TOKEN_HERE"
```

## What I Learned

- Refresh token rotation (revoke on use, issue new) limits the window of damage if a token is stolen — a stolen token can only be used once before it is invalidated
- Storing refresh tokens as SHA-256 hashes means a database breach does not expose the actual token values, since the hash is not reversible
- User enumeration prevention: `POST /forgot-password` always returns the same response shape regardless of whether the email exists — an attacker cannot use this to discover valid accounts
- Account auto-unlock on next login attempt (checking `locked_until` before enforcing lockout) avoids needing a background cron job — the unlock happens lazily on the next relevant action
- `bcrypt.compare` is timing-safe by design — it always takes the same time regardless of whether the password matches, preventing timing-based attacks
- The `pending` → `active` status transition enforced at login (returning 403 if pending) means unverified users cannot access the application even if they know their password

## Challenge Info

| Field    | Value |
|----------|-------|
| Day      | 85 |
| Sprint   | 3 — Node.js Back-End Servers |
| Date     | May 02, 2026 |
| Previous | [Day 84 — Quote API](../day-084-quote-api/) |
| Next     | [Day 86 — File Upload with Multer](../day-086-file-upload/) |

Part of my 300 Days of Code Challenge!
