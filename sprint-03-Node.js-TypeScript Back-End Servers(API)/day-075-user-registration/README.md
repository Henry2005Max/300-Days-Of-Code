# Day 75: User Registration with bcrypt

## Description

A complete user management system built on Express, SQLite, bcryptjs, and JWT. Goes beyond Day 65's basic auth by adding profile updates, password change (requires current password), email change (requires password confirmation), login history, and account deletion with double confirmation. Every operation has its own tight Zod schema.

## What's New vs Day 65

| Day 65 | Day 75 |
|--------|--------|
| Basic register + login | Full lifecycle: register → update → change password → delete |
| No password confirmation | confirmPassword on register |
| No profile fields | name, bio, avatarUrl |
| Password change not possible | Change password (requires current password) |
| Email change not possible | Change email (requires password) |
| No audit trail | login_log records every attempt |
| No account deletion | Hard delete with password + "DELETE" confirmation |

## Features

- POST /auth/register — name, email, password, confirmPassword, optional bio
- Password policy: min 8 chars, at least 1 uppercase, at least 1 number
- POST /auth/login — bcrypt.compare, login attempt logged regardless of success/failure
- GET /users/me — current user profile (no password_hash ever returned)
- PATCH /users/me — update name, bio, avatarUrl (email/password via separate flows)
- POST /users/me/change-password — requires currentPassword, new must differ from current
- POST /users/me/change-email — requires currentPassword for confirmation
- GET /users/me/login-history — last 10 login attempts with IP, success, reason
- DELETE /users/me — requires password + `confirm: "DELETE"` in body
- AFTER UPDATE trigger on users table auto-updates updated_at column
- login_log records userId, IP, success flag, reason, timestamp
- Same error message for wrong email and wrong password (prevents enumeration)
- Deactivated account check on login (is_active = 0 → 403)

## Technologies Used

- Node.js
- TypeScript
- Express 4
- better-sqlite3
- bcryptjs
- jsonwebtoken
- Zod 3
- dotenv
- tsx

## Folder Structure

```
day-075-user-registration/
├── src/
│   ├── index.ts
│   ├── db/
│   │   └── database.ts         ← users + login_log tables, updated_at trigger
│   ├── schemas/
│   │   └── user.ts             ← 6 Zod schemas for every user flow
│   ├── types/
│   │   └── index.ts
│   ├── routes/
│   │   ├── auth.ts             ← register, login
│   │   └── users.ts            ← profile, password, email, history, delete
│   └── middleware/
│       ├── authenticate.ts
│       ├── validate.ts
│       └── logger.ts
├── data/                       ← users.db created here
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd Desktop
mkdir day-075-user-registration
cd day-075-user-registration
mkdir -p src/db src/schemas src/types src/routes src/middleware
```

Copy all files, then:

```bash
npm install
npm run dev
```

## Testing Step by Step (all in Postman)

**1. Register:**
- POST `/auth/register`
```json
{
  "name": "Henry Ehindero",
  "email": "henry@example.com",
  "password": "Password1",
  "confirmPassword": "Password1",
  "bio": "GDG Lagos mobile lead"
}
```

**2. Test validation — mismatched passwords:**
```json
{ "name": "Test", "email": "t@t.com", "password": "Password1", "confirmPassword": "Different1" }
```
→ 422 "Passwords do not match"

**3. Test validation — weak password:**
```json
{ "name": "Test", "email": "t@t.com", "password": "weakpass", "confirmPassword": "weakpass" }
```
→ 422 "password must contain at least one uppercase letter"

**4. Login:** POST `/auth/login` → copy token

**5. Get profile:** GET `/users/me` with `Authorization: Bearer <token>`

**6. Update profile:** PATCH `/users/me`
```json
{ "bio": "300 Days of Code challenger", "avatarUrl": "https://example.com/avatar.jpg" }
```

**7. Change password:** POST `/users/me/change-password`
```json
{ "currentPassword": "Password1", "newPassword": "NewPass2", "confirmNewPassword": "NewPass2" }
```

**8. Wrong current password:** same endpoint with wrong currentPassword → 401

**9. Change email:** POST `/users/me/change-email`
```json
{ "newEmail": "henry2@example.com", "currentPassword": "NewPass2" }
```

**10. Login history:** GET `/users/me/login-history` — see all attempts logged

**11. Delete account:** DELETE `/users/me`
```json
{ "password": "NewPass2", "confirm": "DELETE" }
```

**12. Try wrong confirm string:** `"confirm": "delete"` → 422 (must be uppercase "DELETE")

## What I Learned

- Each user flow has its own Zod schema — register, login, updateProfile, changePassword, changeEmail, deleteAccount. Using one giant schema would make optional/required logic messy.
- `.refine()` on a Zod schema adds cross-field validation — essential for password confirmation where two separate fields must match. The path argument tells Zod which field to attach the error to.
- Password change must require the current password — without this, anyone who steals a JWT token can permanently lock the real user out by changing their password
- The DELETE account confirmation pattern (requiring `confirm: "DELETE"` alongside password) prevents accidental deletion — two independent confirmations must both pass
- A database trigger (`AFTER UPDATE ON users`) that sets `updated_at = datetime('now')` is cleaner than setting it in every UPDATE query in code — it happens automatically and can never be forgotten
- login_log records failed attempts too — this data is valuable for detecting brute-force attacks and showing users suspicious activity on their account

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 75 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 22, 2025 |
| Previous | [Day 74 — Quote API](../day-074-quote-api) |
| Next | [Day 76 — File Upload](../day-076-file-upload) |

Part of my 300 Days of Code Challenge!
