# Day 65: JWT Authentication

## Description

Adds full authentication to the Express + SQLite API from Day 64. Users can register and login. Both endpoints return a JWT. Protected routes require the token in the Authorization header. The authenticate middleware verifies the token before route handlers run. Passwords are hashed with bcrypt, never stored in plain text.

## How Authentication Works

```
Register:  POST /auth/register  →  hash password → save user → return JWT
Login:     POST /auth/login     →  verify password → return JWT
Protected: GET  /students       →  client sends JWT → middleware verifies → handler runs
```

## Features

- POST /auth/register — Zod validation, bcrypt hash (10 rounds), returns user + JWT
- POST /auth/login — bcrypt.compare() verification, same error for wrong email or wrong password
- GET /auth/me — protected, returns current user from token payload
- GET /auth/users — protected, admin role only (403 for non-admins)
- authenticate middleware — reads Authorization: Bearer header, verifies JWT signature and expiry
- requireRole() factory — role-based access control middleware
- TokenExpiredError vs JsonWebTokenError — two separate 401 messages
- req.user typed via Express namespace extension — TypeScript knows about req.user in all handlers
- All /students routes protected by router.use(authenticate)
- Users table: id, name, email, password_hash, role, created_at
- password_hash never sent in any API response
- JWT_SECRET and JWT_EXPIRES_IN configurable via .env
- Same error message for wrong email and wrong password (prevents email enumeration)

## Technologies Used

- Node.js
- TypeScript
- Express 4
- better-sqlite3
- jsonwebtoken
- bcryptjs
- Zod 3
- dotenv
- tsx

## Folder Structure

```
day-065-jwt-auth/
├── src/
│   ├── index.ts
│   ├── db/
│   │   └── database.ts         ← users + students tables
│   ├── schemas/
│   │   └── auth.ts             ← RegisterSchema, LoginSchema
│   ├── types/
│   │   └── index.ts            ← User, JwtPayload, Express req.user extension
│   ├── routes/
│   │   ├── auth.ts             ← register, login, /me, /users
│   │   └── students.ts        ← all routes protected by authenticate
│   └── middleware/
│       ├── authenticate.ts     ← JWT verify middleware + requireRole()
│       ├── validate.ts
│       └── logger.ts
├── data/                       ← app.db created here
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd Desktop
mkdir day-065-jwt-auth
cd day-065-jwt-auth
mkdir -p src/db src/schemas src/types src/routes src/middleware
```

Copy all files, then:

```bash
npm install
npm run dev
```

## Testing Step by Step

### 1. Register a user
- POST `http://localhost:3000/auth/register`
- Body: `{ "name": "Henry Ehindero", "email": "henry@example.com", "password": "password123" }`
- Copy the `token` from the response

### 2. Login
- POST `http://localhost:3000/auth/login`
- Body: `{ "email": "henry@example.com", "password": "password123" }`
- You get a fresh token back

### 3. Access a protected route WITH token
- GET `http://localhost:3000/students`
- Headers: `Authorization: Bearer <paste_token_here>`
- Returns all students ✓

### 4. Access a protected route WITHOUT token
- GET `http://localhost:3000/students` — no Authorization header
- Expect: 401 with "no token provided"

### 5. Access with a fake token
- GET `http://localhost:3000/students`
- Headers: `Authorization: Bearer fakejunktoken`
- Expect: 401 with "Invalid token"

### 6. Get current user
- GET `http://localhost:3000/auth/me` with valid token
- Returns your user object without the password hash

### 7. Try the admin route as a regular user
- GET `http://localhost:3000/auth/users` with your token
- Expect: 403 Forbidden — admin only

### 8. Wrong password
- POST /auth/login with wrong password
- Expect: 401 "Invalid email or password" (same message as wrong email)

## What I Learned

- bcrypt.hash() is intentionally slow — the salt rounds parameter controls how many iterations run. 10 rounds is standard. More rounds increases security but also login time.
- bcrypt.compare() re-hashes the submitted password with the same embedded salt and compares — you never decrypt a bcrypt hash, you re-hash and compare
- jwt.sign() encodes the payload in base64 and signs it with HMAC-SHA256 — the payload is readable by anyone, it is NOT encrypted. Never put sensitive data in the payload.
- jwt.verify() throws two different error types: TokenExpiredError (valid token, expired) and JsonWebTokenError (tampered or malformed) — catching these separately gives better error messages
- Extending Express's Request interface via `declare global { namespace Express { interface Request { user?: JwtPayload } } }` lets TypeScript know about req.user without casting everywhere
- Returning the same error message for wrong email and wrong password prevents attackers from enumerating which emails are registered in the system
- router.use(authenticate) applies the middleware to every route registered on that router — cleaner than adding it to each route individually

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 65 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 12, 2025 |
| Previous | [Day 64 — SQLite](../day-064-sqlite) |
| Next | [Day 66 — Webhook Handler](../day-066-webhook) |

Part of my 300 Days of Code Challenge!
